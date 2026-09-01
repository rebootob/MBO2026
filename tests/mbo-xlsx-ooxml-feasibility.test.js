import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import XlsxPopulate from 'xlsx-populate';
import {
  findLocalSourceTemplates,
  getNoOpParityBuffers,
  getMutatedHeaderValueBuffers,
  getSanitizedDisposableBuffers,
  getReferenceImageBuffers,
  getStructuralPartABuffers,
  getStructuralPartBBuffers,
  getPartBPrivacyClassification,
  getTypedPrivacyMetadata,
  SENSITIVE_RANGES_A,
  SENSITIVE_RANGES_B,
  EXPECTED_PART_A_SHA,
  EXPECTED_PART_B_SHA
} from '../scripts/export/mbo-xlsx-ooxml-feasibility.js';

test('FEASIBILITY_TEMPLATE_SHA_VERIFICATION: local owner template SHA-256 hashes match exact baseline evidence', () => {
  const found = findLocalSourceTemplates();
  assert.notEqual(found, null, 'Local source templates must exist in workspace');
  assert.equal(found.shaA, EXPECTED_PART_A_SHA, 'Part A SHA-256 must match baseline');
  assert.equal(found.shaB, EXPECTED_PART_B_SHA, 'Part B SHA-256 must match baseline');
});

test('FEASIBILITY_NO_OP_PARITY: xlsx-populate@1.21.0 loads and outputs templates without material degradation', async () => {
  const { origBufA, outBufA, origBufB, outBufB } = await getNoOpParityBuffers();

  const wbOutA = await XlsxPopulate.fromDataAsync(outBufA);
  assert.equal(wbOutA.sheets().length, 1, 'Part A sheet count must remain 1');
  assert.equal(wbOutA.sheet(0).name(), 'MBO Staff & Chief', 'Part A sheet name must be MBO Staff & Chief');

  // Measure raw <mergeCell> count & refs in Part A sheet1.xml directly with no fallback
  const sheet1XmlA = await wbOutA._zip.files['xl/worksheets/sheet1.xml'].async('string');
  const rawMergesA = [...sheet1XmlA.matchAll(/<mergeCell [^>]*\/>/g)];
  assert.equal(rawMergesA.length, 193, 'Part A raw merge count in sheet1.xml must equal 193');

  // Compare original vs output cols & page setup
  const wbOrigA = await XlsxPopulate.fromDataAsync(origBufA);
  const origXmlA = await wbOrigA._zip.files['xl/worksheets/sheet1.xml'].async('string');
  const colsOrigA = origXmlA.match(/<cols>[\s\S]*?<\/cols>/)?.[0] || '';
  const colsOutA = sheet1XmlA.match(/<cols>[\s\S]*?<\/cols>/)?.[0] || '';
  assert.equal(colsOutA, colsOrigA, 'Part A <cols> structure must match original exactly');

  // Inspect Part A OOXML page setup & workbook defined names directly
  const workbookXmlA = await wbOutA._zip.files['xl/workbook.xml'].async('string');
  assert.equal(workbookXmlA.includes('Print_Area') && workbookXmlA.includes('BJ$52'), true, 'Part A print area must be A1:BJ52');

  assert.equal(sheet1XmlA.includes('orientation="landscape"'), true, 'Part A orientation must be landscape');
  assert.equal(sheet1XmlA.includes('scale="58"'), true, 'Part A scale must be 58%');
  assert.equal(sheet1XmlA.includes('paperSize="8"'), true, 'Part A paperSize must be 8 (A3)');

  const wbOutB = await XlsxPopulate.fromDataAsync(outBufB);
  assert.equal(wbOutB.sheets().length, 2, 'Part B workbook must preserve sheet count');
  assert.equal(wbOutB.sheet(0).name(), '(Part B) Competency', 'Part B sheet 0 name must be (Part B) Competency');
  assert.equal(wbOutB.sheet(1).name(), 'Sheet1', 'Part B sheet 1 name must be Sheet1');

  const sheet1XmlB = await wbOutB._zip.files['xl/worksheets/sheet1.xml'].async('string');
  const rawMergesB = [...sheet1XmlB.matchAll(/<mergeCell [^>]*\/>/g)];
  assert.equal(rawMergesB.length, 79, 'Part B raw merge count in sheet1.xml must equal 79');

  const workbookXmlB = await wbOutB._zip.files['xl/workbook.xml'].async('string');
  assert.equal(workbookXmlB.includes('Print_Area') && workbookXmlB.includes('X$35'), true, 'Part B print area must be A1:X35');

  assert.equal(sheet1XmlB.includes('orientation="portrait"'), true, 'Part B orientation must be portrait');
  assert.equal(sheet1XmlB.includes('paperSize="9"'), true, 'Part B paperSize must be 9 (A4)');
  assert.equal(sheet1XmlB.includes('scale="75"'), true, 'Part B scale must be 75%');
  assert.equal(sheet1XmlB.includes('horizontalCentered="1"'), true, 'Part B horizontalCentered must be 1');
  assert.equal(sheet1XmlB.includes('<sheetProtection') || sheet1XmlB.includes('sheetProtection'), true, 'Part B sheet protection must be present');
});

test('FEASIBILITY_HEADER_GEOMETRY_LABEL_VALUE_MAPPING: static header labels remain intact while value cells clear/update', async () => {
  const { outBufA, labelSnapshotA, outBufB, labelSnapshotB } = await getMutatedHeaderValueBuffers();

  const wbA = await XlsxPopulate.fromDataAsync(outBufA);
  const sheetA = wbA.sheet(0);

  // Directly inspect Part A Row 6 static header labels to confirm their hashes match snapshot
  for (const cellAddr in labelSnapshotA) {
    const valHash = crypto.createHash('sha256').update(String(sheetA.cell(cellAddr).value() || '')).digest('hex');
    assert.equal(valHash, labelSnapshotA[cellAddr], `Label hash at ${cellAddr} must remain unchanged`);
  }

  const wbB = await XlsxPopulate.fromDataAsync(outBufB);
  const sheetB = wbB.sheet(0);

  // Directly inspect Part B Row 2 static header labels to confirm their hashes match snapshot
  for (const cellAddr in labelSnapshotB) {
    const valHash = crypto.createHash('sha256').update(String(sheetB.cell(cellAddr).value() || '')).digest('hex');
    assert.equal(valHash, labelSnapshotB[cellAddr], `Label hash at ${cellAddr} must remain unchanged`);
  }

  // Directly inspect mutated value cell R3
  assert.equal(sheetB.cell('R3').value(), 'MUTATED_VAL', 'Value cell R3 must be updated');
});

test('FEASIBILITY_RANGE_DRIVEN_PRIVACY_PROOF: range clearing and shared string purging leave 0 sensitive tokens in OOXML parts', async () => {
  // Part B exact classification test
  const classMapB = getPartBPrivacyClassification();
  assert.equal(classMapB['G2'].classification, 'HEADER_VALUE', 'G2 must be classified HEADER_VALUE');
  assert.equal(classMapB['B2'].isDynamic, false, 'B2 static title must be protected');
  assert.equal(classMapB['B7'].isDynamic, false, 'B7 static competency text must be protected');

  // Typed privacy metadata test
  const metaA = await getTypedPrivacyMetadata('A');
  assert.equal(metaA.uniqueCount, SENSITIVE_RANGES_A.length, 'Metadata count must equal Part A unique address count');
  assert.equal(metaA.totalReconciled, metaA.uniqueCount, 'Aggregate type counts must reconcile to unique count in Part A');

  const metaB = await getTypedPrivacyMetadata('B');
  assert.equal(metaB.uniqueCount, SENSITIVE_RANGES_B.length, 'Metadata count must equal Part B unique address count');
  assert.equal(metaB.totalReconciled, metaB.uniqueCount, 'Aggregate type counts must reconcile to unique count in Part B');

  const { bufA, bufB, sensitiveA, sensitiveB } = await getSanitizedDisposableBuffers();

  const wbA = await XlsxPopulate.fromDataAsync(bufA);
  const sheetA = wbA.sheet(0);

  // Directly inspect every mapped cell in Part A to confirm it is empty
  for (const addr of SENSITIVE_RANGES_A) {
    const val = sheetA.cell(addr).value();
    assert.equal(val === null || val === undefined, true, `Cell ${addr} must be empty after sanitization`);
  }

  // Scan all xl/ OOXML XML files in memory for token survival & formula nodes <f(?:\s|>)
  for (const fileName in wbA._zip.files) {
    if (fileName.startsWith('xl/') && (fileName.endsWith('.xml') || fileName.endsWith('.rels'))) {
      const xmlText = await wbA._zip.files[fileName].async('string');
      // Prove zero formula nodes <f> exist in worksheet
      assert.equal(/<f(?:\s|>)/.test(xmlText), false, `No worksheet formula <f> allowed in ${fileName}`);
      for (const token of sensitiveA) {
        if (token.length >= 3) {
          assert.equal(xmlText.includes(token), false, `Sensitive token must not exist in Part A OOXML ${fileName}`);
        }
      }
    }
  }

  const wbB = await XlsxPopulate.fromDataAsync(bufB);
  const sheetB = wbB.sheet(0);

  for (const addr of SENSITIVE_RANGES_B) {
    const val = sheetB.cell(addr).value();
    assert.equal(val === null || val === undefined, true, `Cell ${addr} must be empty after sanitization`);
  }

  for (const fileName in wbB._zip.files) {
    if (fileName.startsWith('xl/') && (fileName.endsWith('.xml') || fileName.endsWith('.rels'))) {
      const xmlText = await wbB._zip.files[fileName].async('string');
      assert.equal(/<f(?:\s|>)/.test(xmlText), false, `No worksheet formula <f> allowed in ${fileName}`);
      for (const token of sensitiveB) {
        if (token.length >= 3) {
          assert.equal(xmlText.includes(token), false, `Sensitive token must not exist in Part B OOXML ${fileName}`);
        }
      }
    }
  }
});

test('FEASIBILITY_REFERENCE_IMAGE_REMOVAL: identifies drawings and proves reference image removal while branding remains', async () => {
  const { origBufA, outBufA, drawingXmlPath, drawingRelsPath } = await getReferenceImageBuffers();

  const wbOutA = await XlsxPopulate.fromDataAsync(outBufA);
  const drawingXml = await wbOutA._zip.files[drawingXmlPath].async('string');
  const drawingRels = await wbOutA._zip.files[drawingRelsPath].async('string');

  // Directly assert rId3 anchor and rel are absent, while image3.png is removed from zip
  assert.equal(drawingXml.includes('rId3'), false, 'Target drawing rId3 must be removed from drawing1.xml');
  assert.equal(drawingRels.includes('rId3'), false, 'Target relationship rId3 must be removed from drawing1.xml.rels');
  assert.equal(wbOutA._zip.files['xl/media/image3.png'] === undefined, true, 'Target media xl/media/image3.png must be removed');

  // Directly assert non-target branding relationships remain
  assert.equal(drawingRels.includes('rId1'), true, 'Branding rId1 must be preserved');
  assert.equal(drawingRels.includes('rId2'), true, 'Branding rId2 must be preserved');
});

test('FEASIBILITY_TRUE_PART_A_RAW_OOXML_INSERTION: proves raw OOXML row shifting, merge cloning & print area extension for 4, 5, 10 objectives', async () => {
  const { bufA4, bufA5, bufA10 } = await getStructuralPartABuffers();

  // 4 Objectives
  const wbA4 = await XlsxPopulate.fromDataAsync(bufA4);
  const sheetA4 = wbA4.sheet(0);
  assert.equal(sheetA4.cell('B29').value(), 'SENTINEL_ROW_29', 'Sentinel at row 29 must remain at row 29 for 4 objectives');
  const wbXml4 = await wbA4._zip.files['xl/workbook.xml'].async('string');
  assert.equal(wbXml4.includes('BJ$52'), true, 'Part A 4 objectives print area must end at BJ52');

  // 5 Objectives (raw OOXML +1 insertion & merge cloning)
  const wbA5 = await XlsxPopulate.fromDataAsync(bufA5);
  const sheetA5 = wbA5.sheet(0);
  assert.equal(sheetA5.cell('B30').value(), 'SENTINEL_ROW_29', 'Sentinel at row 29 must move to row 30 for 5 objectives (+1 raw insertion)');

  const sheet1Xml5 = await wbA5._zip.files['xl/worksheets/sheet1.xml'].async('string');
  const rawMerges5 = [...sheet1Xml5.matchAll(/<mergeCell [^>]*\/>/g)];
  assert.equal(rawMerges5.length, 207, 'Part A 5 objectives raw merge count must equal 207 (193 + 14 cloned)');

  const wbXml5 = await wbA5._zip.files['xl/workbook.xml'].async('string');
  assert.equal(wbXml5.includes('BJ$53'), true, 'Part A 5 objectives print area must end at BJ53');

  // 10 Objectives (raw OOXML +6 insertion & merge cloning)
  const wbA10 = await XlsxPopulate.fromDataAsync(bufA10);
  const sheetA10 = wbA10.sheet(0);
  assert.equal(sheetA10.cell('B35').value(), 'SENTINEL_ROW_29', 'Sentinel at row 29 must move to row 35 for 10 objectives (+6 raw insertion)');

  const sheet1Xml10 = await wbA10._zip.files['xl/worksheets/sheet1.xml'].async('string');
  const rawMerges10 = [...sheet1Xml10.matchAll(/<mergeCell [^>]*\/>/g)];
  assert.equal(rawMerges10.length, 277, 'Part A 10 objectives raw merge count must equal 277 (193 + 84 cloned)');

  const wbXml10 = await wbA10._zip.files['xl/workbook.xml'].async('string');
  assert.equal(wbXml10.includes('BJ$58'), true, 'Part A 10 objectives print area must end at BJ58');
});

test('FEASIBILITY_TRUE_PART_B_RAW_OOXML_BLOCK_INSERTION: proves raw OOXML block insertion, merge cloning & totals shifting for 6 and 8 competencies', async () => {
  const { bufB6, bufB8 } = await getStructuralPartBBuffers();

  // 6 Competencies
  const wbB6 = await XlsxPopulate.fromDataAsync(bufB6);
  const sheetB6 = wbB6.sheet(0);
  assert.equal(sheetB6.cell('B31').value(), 'SENTINEL_ROW_31', 'Totals sentinel must remain at row 31 for 6 competencies');
  const wbXml6 = await wbB6._zip.files['xl/workbook.xml'].async('string');
  assert.equal(wbXml6.includes('X$35'), true, 'Part B 6 competencies print area must end at X35');

  // 8 Competencies (raw OOXML +8 block insertion & merge cloning)
  const wbB8 = await XlsxPopulate.fromDataAsync(bufB8);
  const sheetB8 = wbB8.sheet(0);
  assert.equal(sheetB8.cell('B39').value(), 'SENTINEL_ROW_31', 'Totals sentinel must move to row 39 for 8 competencies (+8 raw block insertion)');

  const sheet1Xml8 = await wbB8._zip.files['xl/worksheets/sheet1.xml'].async('string');
  const rawMerges8 = [...sheet1Xml8.matchAll(/<mergeCell [^>]*\/>/g)];
  assert.equal(rawMerges8.length, 91, 'Part B 8 competencies raw merge count must equal 91 (79 + 12 cloned)');

  const wbXml8 = await wbB8._zip.files['xl/workbook.xml'].async('string');
  assert.equal(wbXml8.includes('X$43'), true, 'Part B 8 competencies print area must end at X43');
});

test('FEASIBILITY_DIFFICULTY_LEVEL_BLANK: Difficulty Level cells remain blank per R3 Owner Decision', async () => {
  const { bufA } = await getSanitizedDisposableBuffers();
  const wbA = await XlsxPopulate.fromDataAsync(bufA);
  const sheetA = wbA.sheet(0);

  // Directly inspect legacy Difficulty cells AA25..AA28 in disposable output
  for (let r = 25; r <= 28; r++) {
    const val = sheetA.cell(`AA${r}`).value();
    assert.equal(val === null || val === undefined, true, `Difficulty cell AA${r} must be blank`);
  }
});
