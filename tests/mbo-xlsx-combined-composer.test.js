import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import JSZip from 'jszip';
import XlsxPopulate from 'xlsx-populate';

import { composeCombinedWorkbook } from '../src/services/mbo-xlsx-combined-composer.js';
import {
  preparePartATemplate,
  preparePartBTemplate
} from '../src/services/mbo-xlsx-template-preparer.js';
import { renderSecuredSemanticValues } from '../src/services/mbo-xlsx-semantic-renderer.js';
import {
  PART_A_TEMPLATE_SHA256,
  PART_B_TEMPLATE_SHA256,
  MboXlsxTemplateProfile
} from '../src/profiles/mbo-xlsx-template-profile.js';

const LOCAL_PART_A_PATH = path.join(process.cwd(), 'app info', 'data', 'PMS_Staff & Chief_PART_A.xlsx');
const LOCAL_PART_B_PATH = path.join(process.cwd(), 'app info', 'data', 'PMS_Staff & Chief_PART_B.xlsx');

function loadLocalPartA() {
  if (!fs.existsSync(LOCAL_PART_A_PATH)) {
    assert.fail(`Local Part A owner template missing at ${LOCAL_PART_A_PATH}`);
  }
  const buf = fs.readFileSync(LOCAL_PART_A_PATH);
  const sha = crypto.createHash('sha256').update(buf).digest('hex');
  assert.equal(sha, PART_A_TEMPLATE_SHA256, 'Part A owner template SHA mismatch');
  return new Uint8Array(buf);
}

function loadLocalPartB() {
  if (!fs.existsSync(LOCAL_PART_B_PATH)) {
    assert.fail(`Local Part B owner template missing at ${LOCAL_PART_B_PATH}`);
  }
  const buf = fs.readFileSync(LOCAL_PART_B_PATH);
  const sha = crypto.createHash('sha256').update(buf).digest('hex');
  assert.equal(sha, PART_B_TEMPLATE_SHA256, 'Part B owner template SHA mismatch');
  return new Uint8Array(buf);
}

function buildSyntheticPartAProjection(count) {
  const objectives = [];
  for (let i = 1; i <= count; i++) {
    objectives.push({
      measurement: `Measurement Objective ${i}`,
      weight: 10 + i,
      actualResult: `Actual Result ${i}`,
      selfComment: `Self Comment ${i}`
    });
  }

  return Object.freeze({
    exportType: 'COMBINED_MBO_WORKBOOK_AND_PDF',
    partA: Object.freeze({
      objectivesCount: count,
      header: Object.freeze({
        fiscalYear: 2026,
        employeeName: `Staff ${count}`,
        department: 'Engineering',
        section: 'Software',
        position: 'Senior Engineer',
        employeeCode: `EMP00${count}`
      }),
      hoshin: Object.freeze({
        departmentHoshinTitle: 'Dept Hoshin 2026',
        sectionHoshinTitle: 'Sect Hoshin 2026'
      }),
      objectives: Object.freeze(objectives)
    })
  });
}

function buildSyntheticPartBProjection(count) {
  const competencyItems = [];
  for (let b = 1; b <= count; b++) {
    const item = {
      index: b,
      selfRating: 4
    };
    if (b === 7) {
      item.presentationTitle = '7. Leadership & People Management';
      item.presentationDescription = 'Competency 7 Description';
    } else if (b === 8) {
      item.presentationTitle = '8. Strategy & Coaching';
      item.presentationDescription = 'Competency 8 Description';
    }
    competencyItems.push(item);
  }

  return Object.freeze({
    exportType: 'COMBINED_MBO_WORKBOOK_AND_PDF',
    partB: Object.freeze({
      competencyCount: count,
      header: Object.freeze({
        fiscalYear: 2026,
        employeeName: `Staff ${count}`,
        department: 'Engineering',
        section: 'Software',
        position: 'Senior Engineer',
        employeeCode: `EMP00${count}`
      }),
      competencyItems: Object.freeze(competencyItems)
    })
  });
}

async function prepareAndRenderPartA(objCount) {
  const rawA = loadLocalPartA();
  const projA = buildSyntheticPartAProjection(objCount);
  const preparedA = await preparePartATemplate(rawA, { objectiveCount: objCount });
  return await renderSecuredSemanticValues(preparedA, { partKey: 'A', projection: projA });
}

async function prepareAndRenderPartB(compCount) {
  const rawB = loadLocalPartB();
  const projB = buildSyntheticPartBProjection(compCount);
  const preparedB = await preparePartBTemplate(rawB, { competencyCount: compCount });
  return await renderSecuredSemanticValues(preparedB, { partKey: 'B', projection: projB });
}

// =============================================================================
// TEST SUITE: Combined XLSX Composer Foundation (R2-D1)
// =============================================================================

test('R2-D1: Exhaustive Deterministic Matrix (Part A 4..10 x Part B 6/7/8 = 21 combinations)', async () => {
  const objCounts = [4, 5, 6, 7, 8, 9, 10];
  const compCounts = [6, 7, 8];

  for (const objCount of objCounts) {
    for (const compCount of compCounts) {
      const renderedA = await prepareAndRenderPartA(objCount);
      const renderedB = await prepareAndRenderPartB(compCount);

      const combinedBytes = await composeCombinedWorkbook(renderedA, renderedB);
      assert.ok(combinedBytes instanceof Uint8Array, `Combined bytes should be Uint8Array for A=${objCount}, B=${compCount}`);

      const wbCombined = await XlsxPopulate.fromDataAsync(combinedBytes);
      const sheets = wbCombined.sheets();

      // 1. Sheet count and names
      assert.equal(sheets.length, 2, `Final workbook must have exactly 2 sheets for A=${objCount}, B=${compCount}`);
      assert.equal(sheets[0].name(), 'MBO Staff & Chief', 'Sheet 1 name must be "MBO Staff & Chief"');
      assert.equal(sheets[1].name(), '(Part B) Competency', 'Sheet 2 name must be "(Part B) Competency"');

      // 2. Part B auxiliary Sheet1 must be excluded
      const sheetNames = sheets.map(s => s.name());
      assert.ok(!sheetNames.includes('Sheet1'), 'Part B auxiliary Sheet1 must be excluded');

      // 3. Dynamic Print_Areas
      const wbXml = await wbCombined._zip.file('xl/workbook.xml').async('text');
      assert.ok(wbXml.includes('localSheetId="0"'), 'Print_Area localSheetId="0" must be present');
      assert.ok(wbXml.includes('localSheetId="1"'), 'Print_Area localSheetId="1" must be present');
      assert.ok(wbXml.includes('MBO Staff &amp; Chief') || wbXml.includes('MBO Staff & Chief'), 'Print_Area 0 must reference Part A');
      assert.ok(wbXml.includes('(Part B) Competency'), 'Print_Area 1 must reference Part B');

      // 4. Formula inventory ZERO
      const sheet1Xml = await wbCombined._zip.file('xl/worksheets/sheet1.xml').async('text');
      const sheet2Xml = await wbCombined._zip.file('xl/worksheets/sheet2.xml').async('text');
      assert.equal(/<f[\s>]/.test(sheet1Xml), false, 'Sheet 1 formula count must be zero');
      assert.equal(/<f[\s>]/.test(sheet2Xml), false, 'Sheet 2 formula count must be zero');
    }
  }
});

test('R2-D1: Caller Input Byte Immutability', async () => {
  const renderedA = await prepareAndRenderPartA(4);
  const renderedB = await prepareAndRenderPartB(6);

  const cloneA = new Uint8Array(renderedA);
  const cloneB = new Uint8Array(renderedB);

  await composeCombinedWorkbook(renderedA, renderedB);

  assert.deepEqual(renderedA, cloneA, 'partABytes input must remain 100% immutable');
  assert.deepEqual(renderedB, cloneB, 'partBBytes input must remain 100% immutable');
});

test('R2-D1: Rendered-Source-Derived Style & SST Remapping & Negative Control', async () => {
  const renderedA = await prepareAndRenderPartA(5);
  const renderedB = await prepareAndRenderPartB(6);

  const combinedBytes = await composeCombinedWorkbook(renderedA, renderedB);
  const wbCombined = await XlsxPopulate.fromDataAsync(combinedBytes);

  // Parse styles.xml from combined package
  const stylesXml = await wbCombined._zip.file('xl/styles.xml').async('text');
  const sheet2Xml = await wbCombined._zip.file('xl/worksheets/sheet2.xml').async('text');

  // Verify sheet2.xml has remapped s="ID" attributes
  const sMatches = [...sheet2Xml.matchAll(/\bs="(\d+)"/g)];
  assert.ok(sMatches.length > 0, 'Sheet 2 must have remapped s="ID" attributes');

  // Verify all style IDs in sheet2.xml are valid indices in combined cellXfs
  const cellXfsMatch = stylesXml.match(/<cellXfs\b[^>]*?\bcount="(\d+)"[^>]*?>/);
  assert.ok(cellXfsMatch, '<cellXfs> count must be present in combined styles.xml');
  const cellXfsCount = parseInt(cellXfsMatch[1], 10);

  for (const m of sMatches) {
    const sId = parseInt(m[1], 10);
    assert.ok(sId >= 0 && sId < cellXfsCount, `Sheet 2 style ID s="${sId}" must be within cellXfs count ${cellXfsCount}`);
  }

  // Verify SST mapping in sheet2.xml
  const sstXml = await wbCombined._zip.file('xl/sharedStrings.xml').async('text');
  const sstCountMatch = sstXml.match(/<sst\b[^>]*?\bcount="(\d+)"[^>]*?>/);
  assert.ok(sstCountMatch, '<sst> count must be present in combined sharedStrings.xml');
  const sstCount = parseInt(sstCountMatch[1], 10);

  const vMatches = [...sheet2Xml.matchAll(/<c\b[^>]*?\bt="s"[^>]*?>[\s\S]*?<v>(\d+)<\/v>/g)];
  for (const m of vMatches) {
    const vIdx = parseInt(m[1], 10);
    assert.ok(vIdx >= 0 && vIdx < sstCount, `Sheet 2 shared string index <v>${vIdx}</v> must be within sst count ${sstCount}`);
  }
});

test('R2-D1: Negative Control against Fixed Offsets', async () => {
  const renderedA = await prepareAndRenderPartA(4);
  const wbB = await XlsxPopulate.fromDataAsync(await prepareAndRenderPartB(6));

  // Artificially inject a custom shared string into Part B sharedStrings.xml
  let sstB = await wbB._zip.file('xl/sharedStrings.xml').async('text');
  sstB = sstB.replace('</sst>', '<si><t>CUSTOM_NEGATIVE_CONTROL_STRING</t></si></sst>');
  const sstMatch = sstB.match(/count="(\d+)"/);
  if (sstMatch) {
    const cnt = parseInt(sstMatch[1], 10) + 1;
    sstB = sstB.replace(/count="\d+"/, `count="${cnt}"`).replace(/uniqueCount="\d+"/, `uniqueCount="${cnt}"`);
  }
  wbB._zip.file('xl/sharedStrings.xml', sstB);

  // Reference the custom string in Part B business sheet (xl/worksheets/sheet1.xml)
  let sheet1B = await wbB._zip.file('xl/worksheets/sheet1.xml').async('text');
  const customIdx = (sstB.match(/<si>/g) || []).length - 1;
  const a1CellMatch = sheet1B.match(/<c\b[^>]*?\br="A1"[^>]*?>[\s\S]*?<\/c>|<c\b[^>]*?\br="A1"[^>]*?\/>/);
  assert.ok(a1CellMatch, 'Cell A1 must exist in Part B sheet1.xml');
  sheet1B = sheet1B.replace(a1CellMatch[0], `<c r="A1" t="s"><v>${customIdx}</v></c>`);
  wbB._zip.file('xl/worksheets/sheet1.xml', sheet1B);

  const modRenderedB = await wbB._zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });

  const combinedBytes = await composeCombinedWorkbook(renderedA, modRenderedB);
  const wbCombined = await XlsxPopulate.fromDataAsync(combinedBytes);
  const combinedSstXml = await wbCombined._zip.file('xl/sharedStrings.xml').async('text');

  assert.ok(combinedSstXml.includes('CUSTOM_NEGATIVE_CONTROL_STRING'), 'Custom injected string must be dynamically remapped and preserved in combined SST');
});

test('R2-D1: Valid Drawing, Media, PrinterSettings and Package Rel Namespaces', async () => {
  const renderedA = await prepareAndRenderPartA(4);
  const renderedB = await prepareAndRenderPartB(6);

  const combinedBytes = await composeCombinedWorkbook(renderedA, renderedB);
  const wbCombined = await XlsxPopulate.fromDataAsync(combinedBytes);
  const zip = wbCombined._zip;

  // 1. PrinterSettings parts
  assert.ok(zip.file('xl/printerSettings/printerSettings1.bin'), 'Part A printerSettings1.bin must exist');
  assert.ok(zip.file('xl/printerSettings/printerSettings2.bin'), 'Part B printerSettings2.bin must exist');

  // 2. Drawing parts
  assert.ok(zip.file('xl/drawings/drawing1.xml'), 'Part A drawing1.xml must exist');
  assert.ok(zip.file('xl/drawings/drawing2.xml'), 'Part B drawing2.xml must exist');
  assert.ok(zip.file('xl/drawings/_rels/drawing2.xml.rels'), 'Part B drawing2.xml.rels must exist');

  // 3. Media parts
  const hasPartBMedia = zip.file('xl/media/image1.png') || zip.file('xl/media/image_b_1.png') || zip.file('xl/media/image_partb_1.png');
  assert.ok(hasPartBMedia, 'Part B media must exist in combined package');

  // 4. Worksheet rels
  const sheet2RelsXml = await zip.file('xl/worksheets/_rels/sheet2.xml.rels').async('text');
  assert.ok(sheet2RelsXml.includes('Target="../printerSettings/printerSettings2.bin"'), 'Sheet 2 rels must target printerSettings2.bin');
  assert.ok(sheet2RelsXml.includes('Target="../drawings/drawing2.xml"'), 'Sheet 2 rels must target drawing2.xml');

  // 5. Drawing rels
  const drawing2RelsXml = await zip.file('xl/drawings/_rels/drawing2.xml.rels').async('text');
  assert.ok(
    drawing2RelsXml.includes('Target="../media/image1.png"') ||
    drawing2RelsXml.includes('Target="../media/image_b_1.png"') ||
    drawing2RelsXml.includes('Target="../media/image_partb_1.png"'),
    'Drawing 2 rels must target valid Part B media'
  );

  // 6. Check for no orphan or duplicate package paths
  const allFiles = Object.keys(zip.files);
  const fileSet = new Set(allFiles);
  assert.equal(fileSet.size, allFiles.length, 'Package must contain no duplicate file paths');
});

test('R2-D1: Metadata Parts (docProps/app.xml and [Content_Types].xml)', async () => {
  const renderedA = await prepareAndRenderPartA(4);
  const renderedB = await prepareAndRenderPartB(6);

  const combinedBytes = await composeCombinedWorkbook(renderedA, renderedB);
  const wbCombined = await XlsxPopulate.fromDataAsync(combinedBytes);
  const zip = wbCombined._zip;

  // 1. docProps/app.xml
  const appXml = await zip.file('docProps/app.xml').async('text');
  assert.ok(appXml.includes('<vt:i4>2</vt:i4>'), 'Worksheets count must be 2 in app.xml');
  assert.ok(appXml.includes('<vt:vector size="4"'), 'HeadingPairs vector size must be 4');
  assert.ok(appXml.includes('<vt:lpstr>MBO Staff &amp; Chief</vt:lpstr>') || appXml.includes('<vt:lpstr>MBO Staff & Chief</vt:lpstr>'), 'TitlesOfParts must contain Sheet 1 name');
  assert.ok(appXml.includes('<vt:lpstr>(Part B) Competency</vt:lpstr>'), 'TitlesOfParts must contain Sheet 2 name');

  // 2. [Content_Types].xml
  const contentTypesXml = await zip.file('[Content_Types].xml').async('text');
  assert.ok(contentTypesXml.includes('PartName="/xl/worksheets/sheet2.xml"'), '[Content_Types].xml must declare /xl/worksheets/sheet2.xml');
  assert.ok(contentTypesXml.includes('PartName="/xl/drawings/drawing2.xml"'), '[Content_Types].xml must declare /xl/drawings/drawing2.xml');
  assert.ok(contentTypesXml.includes('Extension="png"'), '[Content_Types].xml must include png extension');
});

test('R2-D1: Secured Scalar Values & Privacy Preservation', async () => {
  const renderedA = await prepareAndRenderPartA(4);
  const renderedB = await prepareAndRenderPartB(7);

  const combinedBytes = await composeCombinedWorkbook(renderedA, renderedB);
  const wbCombined = await XlsxPopulate.fromDataAsync(combinedBytes);

  // Check Sheet 1 header employee name
  const sheet1 = wbCombined.sheet('MBO Staff & Chief');
  assert.ok(sheet1, 'Sheet 1 "MBO Staff & Chief" must be accessible');

  // Check Sheet 2 competency values
  const sheet2 = wbCombined.sheet('(Part B) Competency');
  assert.ok(sheet2, 'Sheet 2 "(Part B) Competency" must be accessible');

  // Check raw XML to verify employee name "Staff 4"
  const sheet1Xml = await wbCombined._zip.file('xl/worksheets/sheet1.xml').async('text');
  assert.ok(sheet1Xml.includes('Staff 4'), 'Employee name "Staff 4" must be rendered in Sheet 1');

  // Check raw XML to verify Competency 7 description in Sheet 2
  const sheet2Xml = await wbCombined._zip.file('xl/worksheets/sheet2.xml').async('text');
  assert.ok(sheet2Xml.includes('Competency 7 Description'), 'Competency 7 description must be rendered in Sheet 2');
});

test('R2-D1: Fail-Closed Negative Controls & Relationship Graph Boundary', async () => {
  const validA = await prepareAndRenderPartA(4);
  const validB = await prepareAndRenderPartB(6);

  // 1. Missing or invalid input bytes
  await assert.rejects(
    async () => await composeCombinedWorkbook(null, validB),
    /EXPORT_COMBINED_COMPOSER_UNRESOLVED/
  );
  await assert.rejects(
    async () => await composeCombinedWorkbook(validA, null),
    /EXPORT_COMBINED_COMPOSER_UNRESOLVED/
  );

  // 2. Corrupted input bytes
  const badBytes = new Uint8Array([1, 2, 3, 4, 5]);
  await assert.rejects(
    async () => await composeCombinedWorkbook(badBytes, validB),
    /EXPORT_COMBINED_COMPOSER_UNRESOLVED/
  );

  // 3. Part A missing business sheet "MBO Staff & Chief"
  const wbBadA = await XlsxPopulate.fromDataAsync(validA);
  let wbXmlA = await wbBadA._zip.file('xl/workbook.xml').async('text');
  wbXmlA = wbXmlA.replace(/MBO Staff &amp; Chief/g, 'Wrong Sheet Name').replace(/MBO Staff & Chief/g, 'Wrong Sheet Name');
  wbBadA._zip.file('xl/workbook.xml', wbXmlA);
  const badBytesA = await wbBadA._zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });

  await assert.rejects(
    async () => await composeCombinedWorkbook(badBytesA, validB),
    /EXPORT_COMBINED_COMPOSER_UNRESOLVED/
  );

  // 4. Part B missing business sheet "(Part B) Competency"
  const wbBadB = await XlsxPopulate.fromDataAsync(validB);
  let wbXmlB = await wbBadB._zip.file('xl/workbook.xml').async('text');
  wbXmlB = wbXmlB.replace(/\(Part B\) Competency/g, 'Wrong Part B Name');
  wbBadB._zip.file('xl/workbook.xml', wbXmlB);
  const badBytesB = await wbBadB._zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });

  await assert.rejects(
    async () => await composeCombinedWorkbook(validA, badBytesB),
    /EXPORT_COMBINED_COMPOSER_UNRESOLVED/
  );

  // 5. Occupied candidate path in base package (e.g. xl/worksheets/sheet2.xml already exists in Part A)
  const wbOccupiedA = await XlsxPopulate.fromDataAsync(validA);
  wbOccupiedA._zip.file('xl/worksheets/sheet2.xml', '<worksheet/>');
  const occupiedBytesA = await wbOccupiedA._zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });

  await assert.rejects(
    async () => await composeCombinedWorkbook(occupiedBytesA, validB),
    /EXPORT_COMBINED_COMPOSER_UNRESOLVED/
  );

  // 6. Invalid row style reference s="999" in Part B
  const wbRowStyleB = await XlsxPopulate.fromDataAsync(validB);
  let sheet1XmlB = await wbRowStyleB._zip.file('xl/worksheets/sheet1.xml').async('text');
  sheet1XmlB = sheet1XmlB.replace('<sheetData>', '<sheetData><row r="999" s="999"/>');
  wbRowStyleB._zip.file('xl/worksheets/sheet1.xml', sheet1XmlB);
  const badRowStyleBytesB = await wbRowStyleB._zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });

  await assert.rejects(
    async () => await composeCombinedWorkbook(validA, badRowStyleBytesB),
    /EXPORT_COMBINED_COMPOSER_UNRESOLVED/
  );

  // 7. Invalid col style reference style="999" in Part B
  const wbColStyleB = await XlsxPopulate.fromDataAsync(validB);
  sheet1XmlB = await wbColStyleB._zip.file('xl/worksheets/sheet1.xml').async('text');
  sheet1XmlB = sheet1XmlB.replace(/<cols>/, '<cols><col min="99" max="99" style="999"/>');
  wbColStyleB._zip.file('xl/worksheets/sheet1.xml', sheet1XmlB);
  const badColStyleBytesB = await wbColStyleB._zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });

  await assert.rejects(
    async () => await composeCombinedWorkbook(validA, badColStyleBytesB),
    /EXPORT_COMBINED_COMPOSER_UNRESOLVED/
  );

  // 8. Missing dependency in style (e.g. fontId="999" in cellXfs)
  const wbFontB = await XlsxPopulate.fromDataAsync(validB);
  let stylesXmlB = await wbFontB._zip.file('xl/styles.xml').async('text');
  stylesXmlB = stylesXmlB.replace(/<cellXfs\b[^>]*>\s*<xf\b/, (m) => m + ' fontId="999"');
  wbFontB._zip.file('xl/styles.xml', stylesXmlB);
  const badFontBytesB = await wbFontB._zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });

  await assert.rejects(
    async () => await composeCombinedWorkbook(validA, badFontBytesB),
    /EXPORT_COMBINED_COMPOSER_UNRESOLVED/
  );

  // 9. Duplicate relationship ID in Part B worksheet .rels
  const wbDupRelB = await XlsxPopulate.fromDataAsync(validB);
  let relsB = await wbDupRelB._zip.file('xl/worksheets/_rels/sheet1.xml.rels').async('text');
  relsB = relsB.replace('<Relationships', '<Relationships><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/printerSettings" Target="../printerSettings/printerSettings1.bin"/>');
  wbDupRelB._zip.file('xl/worksheets/_rels/sheet1.xml.rels', relsB);
  const dupRelBytesB = await wbDupRelB._zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });

  await assert.rejects(
    async () => await composeCombinedWorkbook(validA, dupRelBytesB),
    /EXPORT_COMBINED_COMPOSER_UNRESOLVED/
  );

  // 10. Missing dependency target (e.g. printerSettings target missing)
  const wbMissingTargetB = await XlsxPopulate.fromDataAsync(validB);
  wbMissingTargetB._zip.remove('xl/printerSettings/printerSettings1.bin');
  const missingTargetBytesB = await wbMissingTargetB._zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });

  await assert.rejects(
    async () => await composeCombinedWorkbook(validA, missingTargetBytesB),
    /EXPORT_COMBINED_COMPOSER_UNRESOLVED/
  );

  // 11. Unsupported worksheet relationship type
  const wbUnsuppRelB = await XlsxPopulate.fromDataAsync(validB);
  let unsuppRelsB = await wbUnsuppRelB._zip.file('xl/worksheets/_rels/sheet1.xml.rels').async('text');
  unsuppRelsB = unsuppRelsB.replace('</Relationships>', '<Relationship Id="rId99" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="http://example.com"/></Relationships>');
  wbUnsuppRelB._zip.file('xl/worksheets/_rels/sheet1.xml.rels', unsuppRelsB);
  const unsuppRelBytesB = await wbUnsuppRelB._zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });

  await assert.rejects(
    async () => await composeCombinedWorkbook(validA, unsuppRelBytesB),
    /EXPORT_COMBINED_COMPOSER_UNRESOLVED/
  );

  // 12. External relationship TargetMode
  const wbExtRelB = await XlsxPopulate.fromDataAsync(validB);
  let extRelsB = await wbExtRelB._zip.file('xl/worksheets/_rels/sheet1.xml.rels').async('text');
  extRelsB = extRelsB.replace('TargetMode="Internal"', 'TargetMode="External"').replace('<Relationship ', '<Relationship TargetMode="External" ');
  wbExtRelB._zip.file('xl/worksheets/_rels/sheet1.xml.rels', extRelsB);
  const extRelBytesB = await wbExtRelB._zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });

  await assert.rejects(
    async () => await composeCombinedWorkbook(validA, extRelBytesB),
    /EXPORT_COMBINED_COMPOSER_UNRESOLVED/
  );

  // 13. Optional relationship absent - CASE 1: XML has refs but .rels missing -> REJECT (Corrective E)
  const wbNoRelsB_Case1 = await XlsxPopulate.fromDataAsync(validB);
  wbNoRelsB_Case1._zip.remove('xl/worksheets/_rels/sheet1.xml.rels');
  const noRelsBytesB_Case1 = await wbNoRelsB_Case1._zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });

  await assert.rejects(
    async () => await composeCombinedWorkbook(validA, noRelsBytesB_Case1),
    /EXPORT_COMBINED_COMPOSER_UNRESOLVED/
  );

  // 14. Optional relationship absent - CASE 2: XML has NO refs & .rels missing -> SUCCEED cleanly (Corrective E)
  const wbNoRelsB_Case2 = await XlsxPopulate.fromDataAsync(validB);
  wbNoRelsB_Case2._zip.remove('xl/worksheets/_rels/sheet1.xml.rels');
  let sheet1XmlNoRefs = await wbNoRelsB_Case2._zip.file('xl/worksheets/sheet1.xml').async('text');
  sheet1XmlNoRefs = sheet1XmlNoRefs
    .replace(/<drawing\b[^>]*\/>/g, '')
    .replace(/\br:(?:id|embed|link)="[^"]*"/g, '')
    .replace(/<legacyDrawing\b[^>]*\/>/g, '');
  wbNoRelsB_Case2._zip.file('xl/worksheets/sheet1.xml', sheet1XmlNoRefs);
  const noRelsBytesB_Case2 = await wbNoRelsB_Case2._zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });

  const combinedNoRels = await composeCombinedWorkbook(validA, noRelsBytesB_Case2);
  const wbCombNoRels = await XlsxPopulate.fromDataAsync(combinedNoRels);
  assert.equal(wbCombNoRels.sheets().length, 2, 'Workbook without Part B worksheet .rels and without XML refs must compose cleanly');
  assert.ok(!wbCombNoRels._zip.file('xl/worksheets/_rels/sheet2.xml.rels'), 'No sheet2.xml.rels should be fabricated if input had none');

  // 15. Dangling reference in XML (XML references rId99, missing in .rels) -> REJECT (Corrective A)
  const wbDanglingXmlB = await XlsxPopulate.fromDataAsync(validB);
  let sheet1XmlDangling = await wbDanglingXmlB._zip.file('xl/worksheets/sheet1.xml').async('text');
  sheet1XmlDangling = sheet1XmlDangling.replace('<sheetData>', '<sheetData><hyperlink r:id="rId99" ref="A1"/>');
  wbDanglingXmlB._zip.file('xl/worksheets/sheet1.xml', sheet1XmlDangling);
  const danglingXmlBytesB = await wbDanglingXmlB._zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });

  await assert.rejects(
    async () => await composeCombinedWorkbook(validA, danglingXmlBytesB),
    /EXPORT_COMBINED_COMPOSER_UNRESOLVED/
  );

  // 16. Orphan relationship in .rels (.rels has rId99, unreferenced in XML) -> REJECT (Corrective B)
  const wbOrphanRelB = await XlsxPopulate.fromDataAsync(validB);
  let relsOrphan = await wbOrphanRelB._zip.file('xl/worksheets/_rels/sheet1.xml.rels').async('text');
  relsOrphan = relsOrphan.replace('</Relationships>', '<Relationship Id="rId99" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/printerSettings" Target="../printerSettings/printerSettings1.bin"/></Relationships>');
  wbOrphanRelB._zip.file('xl/worksheets/_rels/sheet1.xml.rels', relsOrphan);
  const orphanRelBytesB = await wbOrphanRelB._zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });

  await assert.rejects(
    async () => await composeCombinedWorkbook(validA, orphanRelBytesB),
    /EXPORT_COMBINED_COMPOSER_UNRESOLVED/
  );

  // 17. Drawing XML -> Drawing .rels dangling reference -> REJECT (Corrective C)
  const wbDrawingDanglingB = await XlsxPopulate.fromDataAsync(validB);
  let drawingXmlDangling = await wbDrawingDanglingB._zip.file('xl/drawings/drawing1.xml').async('text');
  drawingXmlDangling = drawingXmlDangling.replace('r:embed="rId1"', 'r:embed="rId99"');
  wbDrawingDanglingB._zip.file('xl/drawings/drawing1.xml', drawingXmlDangling);
  const drawingDanglingBytesB = await wbDrawingDanglingB._zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });

  await assert.rejects(
    async () => await composeCombinedWorkbook(validA, drawingDanglingBytesB),
    /EXPORT_COMBINED_COMPOSER_UNRESOLVED/
  );

  // 18. Drawing .rels -> Drawing XML orphan relationship -> REJECT (Corrective C)
  const wbDrawingOrphanB = await XlsxPopulate.fromDataAsync(validB);
  let drawingRelsOrphan = await wbDrawingOrphanB._zip.file('xl/drawings/_rels/drawing1.xml.rels').async('text');
  drawingRelsOrphan = drawingRelsOrphan.replace('</Relationships>', '<Relationship Id="rId99" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image1.png"/></Relationships>');
  wbDrawingOrphanB._zip.file('xl/drawings/_rels/drawing1.xml.rels', drawingRelsOrphan);
  const drawingOrphanBytesB = await wbDrawingOrphanB._zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });

  await assert.rejects(
    async () => await composeCombinedWorkbook(validA, drawingOrphanBytesB),
    /EXPORT_COMBINED_COMPOSER_UNRESOLVED/
  );

  // 19. Malformed / Unparsed .rels tag count mismatch -> REJECT (Corrective D)
  const wbMalformedRelsB = await XlsxPopulate.fromDataAsync(validB);
  let relsMalformed = await wbMalformedRelsB._zip.file('xl/worksheets/_rels/sheet1.xml.rels').async('text');
  relsMalformed = relsMalformed.replace('</Relationships>', '<Relationship Id="rIdBroken" Type="foo"/></Relationships>');
  wbMalformedRelsB._zip.file('xl/worksheets/_rels/sheet1.xml.rels', relsMalformed);
  const malformedRelsBytesB = await wbMalformedRelsB._zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });

  await assert.rejects(
    async () => await composeCombinedWorkbook(validA, malformedRelsBytesB),
    /EXPORT_COMBINED_COMPOSER_UNRESOLVED/
  );
});

test('R2-D1: Source-Derived Sheet Path Resolution & Non-Standard Zip Path', async () => {
  const renderedA = await prepareAndRenderPartA(4);
  const wbB = await XlsxPopulate.fromDataAsync(await prepareAndRenderPartB(6));

  // Move Part B sheet from xl/worksheets/sheet1.xml to xl/worksheets/customSheetB.xml
  const origSheetXml = await wbB._zip.file('xl/worksheets/sheet1.xml').async('text');
  wbB._zip.remove('xl/worksheets/sheet1.xml');
  wbB._zip.file('xl/worksheets/customSheetB.xml', origSheetXml);

  // Update workbook.xml.rels target
  let wbRelsB = await wbB._zip.file('xl/_rels/workbook.xml.rels').async('text');
  wbRelsB = wbRelsB.replace('worksheets/sheet1.xml', 'worksheets/customSheetB.xml');
  wbB._zip.file('xl/_rels/workbook.xml.rels', wbRelsB);

  // Move sheet1.xml.rels if present
  if (wbB._zip.file('xl/worksheets/_rels/sheet1.xml.rels')) {
    const origSheetRels = await wbB._zip.file('xl/worksheets/_rels/sheet1.xml.rels').async('text');
    wbB._zip.remove('xl/worksheets/_rels/sheet1.xml.rels');
    wbB._zip.file('xl/worksheets/_rels/customSheetB.xml.rels', origSheetRels);
  }

  const customBytesB = await wbB._zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });

  const combinedBytes = await composeCombinedWorkbook(renderedA, customBytesB);
  const wbCombined = await XlsxPopulate.fromDataAsync(combinedBytes);

  assert.equal(wbCombined.sheets().length, 2, 'Combined workbook must resolve non-standard business sheet path correctly');
  assert.equal(wbCombined.sheets()[1].name(), '(Part B) Competency');
});

test('R2-D1: Exact Dynamic Print Area Equality Proof (Corrective D)', async () => {
  const renderedA = await prepareAndRenderPartA(5);
  const renderedB = await prepareAndRenderPartB(7);

  const zipAInput = await JSZip.loadAsync(renderedA);
  const zipBInput = await JSZip.loadAsync(renderedB);

  const wbXmlAInput = await zipAInput.file('xl/workbook.xml').async('text');
  const wbXmlBInput = await zipBInput.file('xl/workbook.xml').async('text');

  const partAPrintAreaText = wbXmlAInput.match(/<definedName\b[^>]*?\bname="_xlnm\.Print_Area"[^>]*?>([\s\S]*?)<\/definedName>/)[1].trim();
  const partBPrintAreaText = wbXmlBInput.match(/<definedName\b[^>]*?\bname="_xlnm\.Print_Area"[^>]*?>([\s\S]*?)<\/definedName>/)[1].trim();

  const combinedBytes = await composeCombinedWorkbook(renderedA, renderedB);
  const wbCombined = await XlsxPopulate.fromDataAsync(combinedBytes);
  const zipComb = wbCombined._zip;

  const wbXmlComb = await zipComb.file('xl/workbook.xml').async('text');

  const finalPa0Match = wbXmlComb.match(/<definedName\b[^>]*?\bname="_xlnm\.Print_Area"[^>]*?\blocalSheetId="0"[^>]*?>([\s\S]*?)<\/definedName>/);
  const finalPa1Match = wbXmlComb.match(/<definedName\b[^>]*?\bname="_xlnm\.Print_Area"[^>]*?\blocalSheetId="1"[^>]*?>([\s\S]*?)<\/definedName>/);

  assert.ok(finalPa0Match, 'localSheetId="0" Print_Area must exist');
  assert.ok(finalPa1Match, 'localSheetId="1" Print_Area must exist');

  assert.equal(finalPa0Match[1].trim(), partAPrintAreaText, 'Final localSheetId="0" Print_Area text must EXACTLY equal rendered Part A Print_Area text');
  assert.equal(finalPa1Match[1].trim(), partBPrintAreaText, 'Final localSheetId="1" Print_Area text must EXACTLY equal rendered Part B Print_Area text');
});

test('R2-D1: Exact Frozen Layout, Page Setup, Protection, and Merge Preservation (Corrective E)', async () => {
  const renderedA = await prepareAndRenderPartA(6);
  const renderedB = await prepareAndRenderPartB(8);

  const zipAInput = await JSZip.loadAsync(renderedA);
  const zipBInput = await JSZip.loadAsync(renderedB);

  const sheet1XmlAInput = await zipAInput.file('xl/worksheets/sheet1.xml').async('text');
  const sheet1XmlBInput = await zipBInput.file('xl/worksheets/sheet1.xml').async('text');

  const combinedBytes = await composeCombinedWorkbook(renderedA, renderedB);
  const wbCombined = await XlsxPopulate.fromDataAsync(combinedBytes);
  const zipComb = wbCombined._zip;

  const sheet1XmlComb = await zipComb.file('xl/worksheets/sheet1.xml').async('text');
  const sheet2XmlComb = await zipComb.file('xl/worksheets/sheet2.xml').async('text');

  function getTag(xmlStr, tagName) {
    const match = xmlStr.match(new RegExp(`<${tagName}\\b[^>]*>(?:[\\s\\S]*?</${tagName}>)?|<${tagName}\\b[^>]*/>`));
    return match ? match[0] : null;
  }

  // 1. mergeCells
  assert.equal(getTag(sheet1XmlComb, 'mergeCells'), getTag(sheet1XmlAInput, 'mergeCells'), 'Sheet 1 mergeCells must match Part A exactly');
  assert.equal(getTag(sheet2XmlComb, 'mergeCells'), getTag(sheet1XmlBInput, 'mergeCells'), 'Sheet 2 mergeCells must match Part B exactly');

  // 2. pageMargins
  assert.equal(getTag(sheet1XmlComb, 'pageMargins'), getTag(sheet1XmlAInput, 'pageMargins'), 'Sheet 1 pageMargins must match Part A exactly');
  assert.equal(getTag(sheet2XmlComb, 'pageMargins'), getTag(sheet1XmlBInput, 'pageMargins'), 'Sheet 2 pageMargins must match Part B exactly');

  // 3. pageSetup
  assert.equal(getTag(sheet1XmlComb, 'pageSetup'), getTag(sheet1XmlAInput, 'pageSetup'), 'Sheet 1 pageSetup must match Part A exactly');
  assert.equal(getTag(sheet2XmlComb, 'pageSetup'), getTag(sheet1XmlBInput, 'pageSetup'), 'Sheet 2 pageSetup must match Part B exactly');

  // 4. printOptions (if present)
  assert.equal(getTag(sheet1XmlComb, 'printOptions'), getTag(sheet1XmlAInput, 'printOptions'), 'Sheet 1 printOptions must match Part A exactly');
  assert.equal(getTag(sheet2XmlComb, 'printOptions'), getTag(sheet1XmlBInput, 'printOptions'), 'Sheet 2 printOptions must match Part B exactly');

  // 5. sheetProtection (if present)
  assert.equal(getTag(sheet1XmlComb, 'sheetProtection'), getTag(sheet1XmlAInput, 'sheetProtection'), 'Sheet 1 sheetProtection must match Part A exactly');
  assert.equal(getTag(sheet2XmlComb, 'sheetProtection'), getTag(sheet1XmlBInput, 'sheetProtection'), 'Sheet 2 sheetProtection must match Part B exactly');

  // 6. sheetFormatPr
  assert.equal(getTag(sheet1XmlComb, 'sheetFormatPr'), getTag(sheet1XmlAInput, 'sheetFormatPr'), 'Sheet 1 sheetFormatPr must match Part A exactly');
  assert.equal(getTag(sheet2XmlComb, 'sheetFormatPr'), getTag(sheet1XmlBInput, 'sheetFormatPr'), 'Sheet 2 sheetFormatPr must match Part B exactly');
});

test('R2-D1: Privacy & Referenced-Only Shared Strings Proof (Corrective G)', async () => {
  const renderedA = await prepareAndRenderPartA(4);
  const wbB = await XlsxPopulate.fromDataAsync(await prepareAndRenderPartB(6));

  const STALE_SENSITIVE_TOKEN = 'STALE_SENSITIVE_SALARY_DATA_TOKEN_99999';

  // Inject an UNREFERENCED sensitive string item into Part B sharedStrings.xml
  let sstB = await wbB._zip.file('xl/sharedStrings.xml').async('text');
  sstB = sstB.replace('</sst>', `<si><t>${STALE_SENSITIVE_TOKEN}</t></si></sst>`);
  const sstMatch = sstB.match(/count="(\d+)"/);
  if (sstMatch) {
    const cnt = parseInt(sstMatch[1], 10) + 1;
    sstB = sstB.replace(/count="\d+"/, `count="${cnt}"`).replace(/uniqueCount="\d+"/, `uniqueCount="${cnt}"`);
  }
  wbB._zip.file('xl/sharedStrings.xml', sstB);

  const modRenderedB = await wbB._zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });

  // Input immutability snapshot
  const cloneA = new Uint8Array(renderedA);
  const cloneModB = new Uint8Array(modRenderedB);

  const combinedBytes = await composeCombinedWorkbook(renderedA, modRenderedB);

  assert.deepEqual(renderedA, cloneA, 'partABytes must remain immutable');
  assert.deepEqual(modRenderedB, cloneModB, 'partBBytes must remain immutable');

  const wbComb = await XlsxPopulate.fromDataAsync(combinedBytes);
  const zipComb = wbComb._zip;

  const combSstXml = await zipComb.file('xl/sharedStrings.xml').async('text');

  // 1. Unreferenced sensitive string token must NOT be present anywhere in final combined SST or package
  assert.equal(combSstXml.includes(STALE_SENSITIVE_TOKEN), false, 'Unreferenced sensitive SST token from Part B must NOT be copied into final SST');

  const allFileContents = await Promise.all(
    Object.keys(zipComb.files).map(f => zipComb.file(f) ? zipComb.file(f).async('text').catch(() => '') : Promise.resolve(''))
  );
  const combinedPackageText = allFileContents.join(' ');
  assert.equal(combinedPackageText.includes(STALE_SENSITIVE_TOKEN), false, 'Unreferenced sensitive SST token must NOT exist anywhere in final package');

  // 2. Legitimate referenced Part B strings must remain present in final combined SST
  assert.ok(combSstXml.includes('Leadership') || combSstXml.includes('Strategy') || combSstXml.includes('Senior Engineer') || combSstXml.includes('Staff 4'), 'Legitimate referenced Part B strings must remain present in final SST');
});

test('R3: Altered Local Relationship IDs (Corrective F)', async () => {
  const renderedA = await prepareAndRenderPartA(4);
  const wbB = await XlsxPopulate.fromDataAsync(await prepareAndRenderPartB(6));

  // Alter Part B worksheet .rels IDs: change rId1 -> rId41 and rId2 -> rId42
  let sheet1Rels = await wbB._zip.file('xl/worksheets/_rels/sheet1.xml.rels').async('text');
  sheet1Rels = sheet1Rels.replace('Id="rId1"', 'Id="rId41"').replace('Id="rId2"', 'Id="rId42"');
  wbB._zip.file('xl/worksheets/_rels/sheet1.xml.rels', sheet1Rels);

  // Update Part B sheet1.xml r:id references to match rId41 and rId42
  let sheet1Xml = await wbB._zip.file('xl/worksheets/sheet1.xml').async('text');
  sheet1Xml = sheet1Xml.replace('r:id="rId1"', 'r:id="rId41"').replace('r:id="rId2"', 'r:id="rId42"');
  wbB._zip.file('xl/worksheets/sheet1.xml', sheet1Xml);

  // Alter Part B drawing .rels ID: change rId1 -> rId55
  if (wbB._zip.file('xl/drawings/_rels/drawing1.xml.rels')) {
    let drawingRels = await wbB._zip.file('xl/drawings/_rels/drawing1.xml.rels').async('text');
    drawingRels = drawingRels.replace('Id="rId1"', 'Id="rId55"');
    wbB._zip.file('xl/drawings/_rels/drawing1.xml.rels', drawingRels);

    let drawingXml = await wbB._zip.file('xl/drawings/drawing1.xml').async('text');
    drawingXml = drawingXml.replace('r:embed="rId1"', 'r:embed="rId55"');
    wbB._zip.file('xl/drawings/drawing1.xml', drawingXml);
  }

  const modRenderedB = await wbB._zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
  const combinedBytes = await composeCombinedWorkbook(renderedA, modRenderedB);

  const wbComb = await XlsxPopulate.fromDataAsync(combinedBytes);
  assert.equal(wbComb.sheets().length, 2, 'Workbook with altered rel IDs must compose cleanly');
});

test('R3: Multiple Media Distinctness Control (Corrective G)', async () => {
  const renderedA = await prepareAndRenderPartA(4);
  const wbB = await XlsxPopulate.fromDataAsync(await prepareAndRenderPartB(6));

  // Add a second media file to Part B
  const img2Bytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 2]);
  wbB._zip.file('xl/media/image2.png', img2Bytes);

  // Add a second Relationship to Part B drawing1.xml.rels pointing to image2.png with Id="rId2"
  let drawingRels = await wbB._zip.file('xl/drawings/_rels/drawing1.xml.rels').async('text');
  drawingRels = drawingRels.replace(
    '</Relationships>',
    '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image2.png"/></Relationships>'
  );
  wbB._zip.file('xl/drawings/_rels/drawing1.xml.rels', drawingRels);

  // Update Part B drawing1.xml to reference both rId1 and rId2
  let drawingXml = await wbB._zip.file('xl/drawings/drawing1.xml').async('text');
  drawingXml = drawingXml.replace(
    '</xdr:wsDr>',
    '<xdr:oneCellAnchor><xdr:pic><xdr:blipFill><a:blip r:embed="rId2"/></xdr:blipFill></xdr:pic></xdr:oneCellAnchor></xdr:wsDr>'
  );
  wbB._zip.file('xl/drawings/drawing1.xml', drawingXml);

  const modRenderedB = await wbB._zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
  const combinedBytes = await composeCombinedWorkbook(renderedA, modRenderedB);

  const wbComb = await XlsxPopulate.fromDataAsync(combinedBytes);
  const zipComb = wbComb._zip;

  // Both image files must exist in combined package and be distinct
  const mediaFiles = Object.keys(zipComb.files).filter(f => f.startsWith('xl/media/'));
  assert.ok(mediaFiles.length >= 2, 'Combined package must contain at least 2 distinct media files');

  // Verify drawing2.xml.rels references both media files
  const drawing2Rels = await zipComb.file('xl/drawings/_rels/drawing2.xml.rels').async('text');
  assert.ok(drawing2Rels.includes('rId1') && drawing2Rels.includes('rId2'), 'Drawing 2 rels must maintain distinct relationship IDs for both media files');
});

test('R3: Sanitized / Non-Written Cells Remain Blank Proof (Corrective H)', async () => {
  const renderedA = await prepareAndRenderPartA(4);
  const renderedB = await prepareAndRenderPartB(6);

  const combinedBytes = await composeCombinedWorkbook(renderedA, renderedB);
  const wbComb = await XlsxPopulate.fromDataAsync(combinedBytes);

  const sheet1Xml = await wbComb._zip.file('xl/worksheets/sheet1.xml').async('text');
  const sheet2Xml = await wbComb._zip.file('xl/worksheets/sheet2.xml').async('text');

  // Objective 5..10 non-written cells must not contain fake text or residual placeholder data
  assert.equal(sheet1Xml.includes('Measurement Objective 5'), false, 'Non-written objective 5 must not be present in Sheet 1');
  assert.equal(sheet1Xml.includes('Actual Result 5'), false, 'Non-written actual result 5 must not be present in Sheet 1');

  // Competency 7..8 non-written presentation title/desc must not be present when compCount=6
  assert.equal(sheet2Xml.includes('Competency 7 Description'), false, 'Unrendered Competency 7 description must not be present in Sheet 2');
  assert.equal(sheet2Xml.includes('Competency 8 Description'), false, 'Unrendered Competency 8 description must not be present in Sheet 2');
});

test('R4: Strict workbook.xml.rels Authority & Negative Controls (Corrective B)', async () => {
  const validA = await prepareAndRenderPartA(4);
  const validB = await prepareAndRenderPartB(6);

  // 1. Malformed Relationship element in Part B workbook.xml.rels => REJECT
  const wbB_MalformedWbRels = await XlsxPopulate.fromDataAsync(validB);
  let wbRelsXml1 = await wbB_MalformedWbRels._zip.file('xl/_rels/workbook.xml.rels').async('text');
  wbRelsXml1 = wbRelsXml1.replace('</Relationships>', '<Relationship Id="rIdBroken" Target="foo"/></Relationships>');
  wbB_MalformedWbRels._zip.file('xl/_rels/workbook.xml.rels', wbRelsXml1);
  const badWbRelsBytes1 = await wbB_MalformedWbRels._zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });

  await assert.rejects(
    async () => await composeCombinedWorkbook(validA, badWbRelsBytes1),
    /EXPORT_COMBINED_COMPOSER_UNRESOLVED/
  );

  // 2. Duplicate relationship Id in Part B workbook.xml.rels => REJECT
  const wbB_DupWbRels = await XlsxPopulate.fromDataAsync(validB);
  let wbRelsXml2 = await wbB_DupWbRels._zip.file('xl/_rels/workbook.xml.rels').async('text');
  const firstRelIdMatch = wbRelsXml2.match(/<Relationship\b[^>]*?\bId="([^"]+)"/);
  assert.ok(firstRelIdMatch, 'Part B workbook.xml.rels must have at least one relationship');
  const dupId = firstRelIdMatch[1];
  wbRelsXml2 = wbRelsXml2.replace('</Relationships>', `<Relationship Id="${dupId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`);
  wbB_DupWbRels._zip.file('xl/_rels/workbook.xml.rels', wbRelsXml2);
  const badWbRelsBytes2 = await wbB_DupWbRels._zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });

  await assert.rejects(
    async () => await composeCombinedWorkbook(validA, badWbRelsBytes2),
    /EXPORT_COMBINED_COMPOSER_UNRESOLVED/
  );

  // 3. Malformed/unparseable unrelated Relationship element in workbook.xml.rels => REJECT even if business sheet rel is valid
  const wbB_UnrelatedMalformed = await XlsxPopulate.fromDataAsync(validB);
  let wbRelsXml3 = await wbB_UnrelatedMalformed._zip.file('xl/_rels/workbook.xml.rels').async('text');
  wbRelsXml3 = wbRelsXml3.replace('</Relationships>', '<Relationship Target="styles.xml"/></Relationships>');
  wbB_UnrelatedMalformed._zip.file('xl/_rels/workbook.xml.rels', wbRelsXml3);
  const badWbRelsBytes3 = await wbB_UnrelatedMalformed._zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });

  await assert.rejects(
    async () => await composeCombinedWorkbook(validA, badWbRelsBytes3),
    /EXPORT_COMBINED_COMPOSER_UNRESOLVED/
  );

  // 4. Business-sheet r:id resolves zero relationships in workbook.xml.rels => REJECT
  const wbB_ZeroRels = await XlsxPopulate.fromDataAsync(validB);
  let wbXml4 = await wbB_ZeroRels._zip.file('xl/workbook.xml').async('text');
  wbXml4 = wbXml4.replace(/(<sheet\b[^>]*?\bname="\(Part B\) Competency"[^>]*?\br:id=")[^"]+(")/, '$1rIdNonExistent999$2');
  wbB_ZeroRels._zip.file('xl/workbook.xml', wbXml4);
  const badWbRelsBytes4 = await wbB_ZeroRels._zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });

  await assert.rejects(
    async () => await composeCombinedWorkbook(validA, badWbRelsBytes4),
    /EXPORT_COMBINED_COMPOSER_UNRESOLVED/
  );

  // 5. Business-sheet relationship has wrong Type => REJECT
  const wbB_WrongType = await XlsxPopulate.fromDataAsync(validB);
  let wbRelsXml6 = await wbB_WrongType._zip.file('xl/_rels/workbook.xml.rels').async('text');
  wbRelsXml6 = wbRelsXml6.replaceAll('http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles');
  wbB_WrongType._zip.file('xl/_rels/workbook.xml.rels', wbRelsXml6);
  const badWbRelsBytes6 = await wbB_WrongType._zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });

  await assert.rejects(
    async () => await composeCombinedWorkbook(validA, badWbRelsBytes6),
    /EXPORT_COMBINED_COMPOSER_UNRESOLVED/
  );

  // 6. Valid attribute reordering in Relationship element => composer succeeds
  const wbB_Reordered = await XlsxPopulate.fromDataAsync(validB);
  let wbRelsXml7 = await wbB_Reordered._zip.file('xl/_rels/workbook.xml.rels').async('text');
  wbRelsXml7 = wbRelsXml7.replace(
    /<Relationship\b([^>]*?)\bId="([^"]+)"([^>]*?)\bType="([^"]+)"([^>]*?)\bTarget="([^"]+)"([^>]*?)\/>/g,
    '<Relationship Target="$6" Id="$2" Type="$4"$1$3$5$7/>'
  );
  wbB_Reordered._zip.file('xl/_rels/workbook.xml.rels', wbRelsXml7);
  const reorderedBytes = await wbB_Reordered._zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });

  const combinedReordered = await composeCombinedWorkbook(validA, reorderedBytes);
  const wbComb = await XlsxPopulate.fromDataAsync(combinedReordered);
  assert.equal(wbComb.sheets().length, 2, 'Workbook with reordered workbook.xml.rels attributes must compose cleanly');
});

test('R4: Exact Sanitized Cell Authority Proof (Corrective C)', async () => {
  const renderedA = await prepareAndRenderPartA(4);
  const renderedB = await prepareAndRenderPartB(6);

  // 1. Inspect rendered input workbooks BEFORE composition
  const wbA = await XlsxPopulate.fromDataAsync(renderedA);
  const wbB = await XlsxPopulate.fromDataAsync(renderedB);

  const sheetA = wbA.sheet('MBO Staff & Chief');
  const sheetB = wbB.sheet('(Part B) Competency');

  function isBlankValue(val) {
    return val === undefined || val === null || val === '';
  }

  // Representative Part A sanitized / non-written cells (objectiveCount=4)
  const partACellsToTest = ['AM25', 'AQ25', 'AM26'];
  for (const addr of partACellsToTest) {
    const val = sheetA.cell(addr).value();
    assert.ok(isBlankValue(val), `Rendered Part A input cell ${addr} must be blank before composition`);
  }

  // Representative Part B sanitized / non-written cells (competencyCount=6)
  const partBCellsToTest = ['L9', 'L13', 'R9', 'K31'];
  for (const addr of partBCellsToTest) {
    const val = sheetB.cell(addr).value();
    assert.ok(isBlankValue(val), `Rendered Part B input cell ${addr} must be blank before composition`);
  }

  // 2. Compose workbook
  const combinedBytes = await composeCombinedWorkbook(renderedA, renderedB);

  // 3. Inspect corresponding final sheet/cells AFTER composition
  const wbComb = await XlsxPopulate.fromDataAsync(combinedBytes);
  const finalSheet1 = wbComb.sheet('MBO Staff & Chief');
  const finalSheet2 = wbComb.sheet('(Part B) Competency');

  for (const addr of partACellsToTest) {
    const val = finalSheet1.cell(addr).value();
    assert.ok(isBlankValue(val), `Final combined Sheet 1 cell ${addr} must remain blank after composition`);
  }

  for (const addr of partBCellsToTest) {
    const val = finalSheet2.cell(addr).value();
    assert.ok(isBlankValue(val), `Final combined Sheet 2 cell ${addr} must remain blank after composition`);
  }
});
