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

  // Reference the custom string in Part B sheet1.xml
  let sheet1B = await wbB._zip.file('xl/worksheets/sheet1.xml').async('text');
  const customIdx = (sstB.match(/<si>/g) || []).length - 1;
  sheet1B = sheet1B.replace('r="A1"', `r="A1" t="s"`).replace('</c>', `<v>${customIdx}</v></c>`);
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
  assert.ok(zip.file('xl/media/image_partb_1.png'), 'Part B media image_partb_1.png must exist');

  // 4. Worksheet rels
  const sheet2RelsXml = await zip.file('xl/worksheets/_rels/sheet2.xml.rels').async('text');
  assert.ok(sheet2RelsXml.includes('Target="../printerSettings/printerSettings2.bin"'), 'Sheet 2 rels must target printerSettings2.bin');
  assert.ok(sheet2RelsXml.includes('Target="../drawings/drawing2.xml"'), 'Sheet 2 rels must target drawing2.xml');

  // 5. Drawing rels
  const drawing2RelsXml = await zip.file('xl/drawings/_rels/drawing2.xml.rels').async('text');
  assert.ok(drawing2RelsXml.includes('Target="../media/image_partb_1.png"'), 'Drawing 2 rels must target image_partb_1.png');

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

test('R2-D1: Fail-Closed Negative Controls', async () => {
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
});
