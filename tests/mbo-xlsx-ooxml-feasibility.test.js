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
  getHeaderCellFingerprints,
  getWorkbookFingerprint,
  getWorksheetFormulaNodeCount,
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

  // Part A Direct Source vs Round-Trip Fingerprint Equality
  const fpOrigA = await getWorkbookFingerprint(origBufA);
  const fpOutA = await getWorkbookFingerprint(outBufA);

  assert.deepEqual(fpOutA.sheetNames, fpOrigA.sheetNames, 'Part A sheet names must match source exactly');
  assert.equal(fpOutA.rawMergeCount, 193, 'Part A raw merge count must equal 193');
  assert.deepEqual(fpOutA.rawMerges, fpOrigA.rawMerges, 'Part A raw merge refs must match source exactly');
  assert.equal(fpOutA.colsHash, fpOrigA.colsHash, 'Part A <cols> structure hash must match source exactly');
  assert.equal(fpOutA.rowHeightsHash, fpOrigA.rowHeightsHash, 'Part A row heights hash must match source exactly');
  assert.equal(fpOutA.paperSize, '8', 'Part A paperSize must be 8 (A3)');
  assert.equal(fpOutA.orientation, 'landscape', 'Part A orientation must be landscape');
  assert.equal(fpOutA.scale, '58', 'Part A scale must be 58%');
  assert.equal(fpOutA.printArea, "'MBO Staff & Chief'!$A$1:$BJ$52", 'Part A print area must be A1:BJ52');
  assert.equal(fpOutA.drawingRelsHash, fpOrigA.drawingRelsHash, 'Part A drawing relationships hash must match source exactly');
  assert.deepEqual(fpOutA.mediaFiles, fpOrigA.mediaFiles, 'Part A media inventory must match source exactly');

  // Part B Direct Source vs Round-Trip Fingerprint Equality
  const fpOrigB = await getWorkbookFingerprint(origBufB);
  const fpOutB = await getWorkbookFingerprint(outBufB);

  assert.deepEqual(fpOutB.sheetNames, ['(Part B) Competency', 'Sheet1'], 'Part B sheet names must match source exactly');
  assert.equal(fpOutB.rawMergeCount, 79, 'Part B raw merge count must equal 79');
  assert.deepEqual(fpOutB.rawMerges, fpOrigB.rawMerges, 'Part B raw merge refs must match source exactly');
  assert.equal(fpOutB.colsHash, fpOrigB.colsHash, 'Part B <cols> structure hash must match source exactly');
  assert.equal(fpOutB.rowHeightsHash, fpOrigB.rowHeightsHash, 'Part B row heights hash must match source exactly');
  assert.equal(fpOutB.paperSize, '9', 'Part B paperSize must be 9 (A4)');
  assert.equal(fpOutB.orientation, 'portrait', 'Part B orientation must be portrait');
  assert.equal(fpOutB.scale, '75', 'Part B scale must be 75%');
  assert.equal(fpOutB.horizontalCentered, true, 'Part B horizontalCentered must be true');
  assert.equal(fpOutB.sheetProtection, true, 'Part B sheetProtection must be present');
  assert.equal(fpOutB.printArea, "'(Part B) Competency'!$A$1:$X$35", 'Part B print area must be A1:X35');
  assert.equal(fpOutB.drawingRelsHash, fpOrigB.drawingRelsHash, 'Part B drawing relationships hash must match source exactly');
  assert.deepEqual(fpOutB.mediaFiles, fpOrigB.mediaFiles, 'Part B media inventory must match source exactly');
});

test('FEASIBILITY_HEADER_GEOMETRY_LABEL_VALUE_MAPPING: static header labels remain intact while value cells clear/update', async () => {
  const { origBufA, outBufA, origBufB, outBufB } = await getNoOpParityBuffers();

  const fpOrigHeaderA = await getHeaderCellFingerprints(origBufA, 'A');
  const { outBufA: mutBufA, outBufB: mutBufB } = await getMutatedHeaderValueBuffers();
  const fpMutHeaderA = await getHeaderCellFingerprints(mutBufA, 'A');

  // Assert Part A static title/label fingerprints & unrelated header cell fingerprints are unchanged
  assert.deepEqual(fpMutHeaderA.titleFingerprints, fpOrigHeaderA.titleFingerprints, 'Part A title/label fingerprints must match source exactly');
  assert.deepEqual(fpMutHeaderA.unrelatedFingerprints, fpOrigHeaderA.unrelatedFingerprints, 'Part A unrelated header cell fingerprints must match source exactly');

  const fpOrigHeaderB = await getHeaderCellFingerprints(origBufB, 'B');
  const fpMutHeaderB = await getHeaderCellFingerprints(mutBufB, 'B');

  assert.deepEqual(fpMutHeaderB.titleFingerprints, fpOrigHeaderB.titleFingerprints, 'Part B title/label fingerprints must match source exactly');
  assert.deepEqual(fpMutHeaderB.unrelatedFingerprints, fpOrigHeaderB.unrelatedFingerprints, 'Part B unrelated header cell fingerprints must match source exactly');

  // Directly inspect mutated value cell R3
  const wbB = await XlsxPopulate.fromDataAsync(mutBufB);
  assert.equal(wbB.sheet(0).cell('R3').value(), 'MUTATED_VAL', 'Value cell R3 must be updated');
});

test('FEASIBILITY_RANGE_DRIVEN_PRIVACY_PROOF: range clearing and shared string purging leave 0 sensitive tokens in OOXML parts', async () => {
  // Part B exact classification test
  const classMapB = getPartBPrivacyClassification();
  assert.equal(classMapB['G2'].classification, 'HEADER_VALUE', 'G2 must be classified HEADER_VALUE');
  assert.equal(classMapB['B2'].isDynamic, false, 'B2 static title must be protected');
  assert.equal(classMapB['B7'].isDynamic, false, 'B7 static competency text must be protected');

  for (const addr of SENSITIVE_RANGES_B) {
    assert.equal(classMapB[addr]?.isDynamic, true, `Sensitive address ${addr} must be classified dynamic/sample`);
  }

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

  // Formula node test using regex <f(?:\s|>)
  const sourceFormulasA = await getWorksheetFormulaNodeCount(bufA);
  assert.equal(sourceFormulasA, 0, 'Part A sanitized output worksheet formula node count must equal 0');

  // Scan all xl/ OOXML XML files in memory for token survival
  for (const fileName in wbA._zip.files) {
    if (fileName.startsWith('xl/') && (fileName.endsWith('.xml') || fileName.endsWith('.rels'))) {
      const xmlText = await wbA._zip.files[fileName].async('string');
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

  const sourceFormulasB = await getWorksheetFormulaNodeCount(bufB);
  assert.equal(sourceFormulasB, 0, 'Part B sanitized output worksheet formula node count must equal 0');

  for (const fileName in wbB._zip.files) {
    if (fileName.startsWith('xl/') && (fileName.endsWith('.xml') || fileName.endsWith('.rels'))) {
      const xmlText = await wbB._zip.files[fileName].async('string');
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
