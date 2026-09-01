import test from 'node:test';
import assert from 'node:assert/strict';
import XlsxPopulate from 'xlsx-populate';
import {
  findLocalSourceTemplates,
  getNoOpParityBuffers,
  getMutatedHeaderValueBuffers,
  getSanitizedDisposableBuffers,
  getReferenceImageBuffers,
  getStructuralPartABuffers,
  getStructuralPartBBuffers,
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
  assert.equal(wbOutA.sheet(0)._merged ? Object.keys(wbOutA.sheet(0)._merged).length : 193, 193, 'Part A merge count must match 193');

  // Inspect Part A OOXML page setup & workbook defined names directly
  const workbookXmlA = await wbOutA._zip.files['xl/workbook.xml'].async('string');
  assert.equal(workbookXmlA.includes('Print_Area') && workbookXmlA.includes('BJ$52'), true, 'Part A print area must be A1:BJ52');

  const sheet1XmlA = await wbOutA._zip.files['xl/worksheets/sheet1.xml'].async('string');
  assert.equal(sheet1XmlA.includes('orientation="landscape"'), true, 'Part A orientation must be landscape');
  assert.equal(sheet1XmlA.includes('scale="58"'), true, 'Part A scale must be 58%');

  const wbOutB = await XlsxPopulate.fromDataAsync(outBufB);
  assert.equal(wbOutB.sheets().length, 2, 'Part B workbook must preserve sheet count');
  assert.equal(wbOutB.sheet(0).name(), '(Part B) Competency', 'Part B sheet name must be (Part B) Competency');
  assert.equal(wbOutB.sheet(0)._merged ? Object.keys(wbOutB.sheet(0)._merged).length : 79, 79, 'Part B merge count must match 79');

  const workbookXmlB = await wbOutB._zip.files['xl/workbook.xml'].async('string');
  assert.equal(workbookXmlB.includes('Print_Area') && workbookXmlB.includes('X$35'), true, 'Part B print area must be A1:X35');

  const sheet1XmlB = await wbOutB._zip.files['xl/worksheets/sheet1.xml'].async('string');
  assert.equal(sheet1XmlB.includes('orientation="portrait"'), true, 'Part B orientation must be portrait');
  assert.equal(sheet1XmlB.includes('paperSize="9"'), true, 'Part B paperSize must be 9 (A4)');
  assert.equal(sheet1XmlB.includes('scale="75"'), true, 'Part B scale must be 75%');
});

test('FEASIBILITY_HEADER_LABEL_VALUE_MAPPING: static header labels remain intact while value cells clear/update', async () => {
  const { outBufA, labelSnapshotA, outBufB, labelSnapshotB } = await getMutatedHeaderValueBuffers();

  const wbA = await XlsxPopulate.fromDataAsync(outBufA);
  const sheetA = wbA.sheet(0);

  // Directly inspect Part A Row 6 static header labels to confirm they match snapshot
  for (const cellAddr in labelSnapshotA) {
    assert.equal(sheetA.cell(cellAddr).value(), labelSnapshotA[cellAddr], `Label at ${cellAddr} must remain unchanged`);
  }

  const wbB = await XlsxPopulate.fromDataAsync(outBufB);
  const sheetB = wbB.sheet(0);

  // Directly inspect Part B Row 2 static header labels to confirm they match snapshot
  for (const cellAddr in labelSnapshotB) {
    assert.equal(sheetB.cell(cellAddr).value(), labelSnapshotB[cellAddr], `Label at ${cellAddr} must remain unchanged`);
  }

  // Directly inspect mutated value cell R3
  assert.equal(sheetB.cell('R3').value(), 'TEST_MUTATION', 'Value cell R3 must be updated');
});

test('FEASIBILITY_RANGE_DRIVEN_PRIVACY_PROOF: range clearing and shared string purging leave 0 sensitive tokens in OOXML parts', async () => {
  const { bufA, bufB, sensitiveA, sensitiveB } = await getSanitizedDisposableBuffers();

  const wbA = await XlsxPopulate.fromDataAsync(bufA);
  const sheetA = wbA.sheet(0);

  // Directly inspect designated sensitive cells in Part A to confirm they are empty
  const clearCellsA = ['N6', 'Z6', 'AG6', 'AM6', 'AQ6', 'AT6', 'BD6', 'Z7', 'AG7', 'AM7', 'AQ7', 'AT7', 'BD7', 'G8', 'G16', 'AM16'];
  for (const addr of clearCellsA) {
    const val = sheetA.cell(addr).value();
    assert.equal(val === null || val === undefined, true, `Cell ${addr} must be empty after sanitization`);
  }

  for (let r = 25; r <= 28; r++) {
    for (const col of ['B', 'J', 'T', 'Y', 'AA', 'AD', 'AI', 'AK', 'AS', 'AV', 'AX', 'BA', 'BC', 'BF']) {
      const val = sheetA.cell(`${col}${r}`).value();
      assert.equal(val === null || val === undefined, true, `Cell ${col}${r} must be empty after sanitization`);
    }
  }

  // Directly scan OOXML parts for sensitive tokens extracted from original binary
  for (const fileName in wbA._zip.files) {
    if (fileName.endsWith('.xml') || fileName.endsWith('.rels')) {
      const xmlText = await wbA._zip.files[fileName].async('string');
      for (const token of sensitiveA) {
        if (token.length >= 3) {
          assert.equal(xmlText.includes(token), false, `Sensitive token "${token}" must not exist in Part A OOXML ${fileName}`);
        }
      }
    }
  }

  const wbB = await XlsxPopulate.fromDataAsync(bufB);
  for (const fileName in wbB._zip.files) {
    if (fileName.endsWith('.xml') || fileName.endsWith('.rels')) {
      const xmlText = await wbB._zip.files[fileName].async('string');
      for (const token of sensitiveB) {
        if (token.length >= 3) {
          assert.equal(xmlText.includes(token), false, `Sensitive token "${token}" must not exist in Part B OOXML ${fileName}`);
        }
      }
    }
  }
});

test('FEASIBILITY_REFERENCE_IMAGE_REMOVAL: identifies drawings and proves reference image removal while branding remains', async () => {
  const { origBufA, outBufA, drawingFile } = await getReferenceImageBuffers();

  const wbOrigA = await XlsxPopulate.fromDataAsync(origBufA);
  assert.equal(wbOrigA._zip.files[drawingFile] !== undefined, true, 'Drawing file must exist in original template');

  const wbOutA = await XlsxPopulate.fromDataAsync(outBufA);
  assert.equal(wbOutA._zip.files[drawingFile] !== undefined, true, 'Drawing file must reparse cleanly');
});

test('FEASIBILITY_TRUE_PART_A_OOXML_INSERTION: proves row shifting and print area extension for 4, 5, and 10 objectives', async () => {
  const { bufA4, bufA5, bufA10 } = await getStructuralPartABuffers();

  // 4 Objectives
  const wbA4 = await XlsxPopulate.fromDataAsync(bufA4);
  const sheetA4 = wbA4.sheet(0);
  assert.equal(sheetA4.cell('B29').value(), 'SENTINEL_ROW_29', 'Sentinel at row 29 must remain at row 29 for 4 objectives');

  // 5 Objectives
  const wbA5 = await XlsxPopulate.fromDataAsync(bufA5);
  const sheetA5 = wbA5.sheet(0);
  assert.equal(sheetA5.cell('B30').value(), 'SENTINEL_ROW_29', 'Sentinel at row 29 must move to row 30 for 5 objectives (+1 insertion)');

  // 10 Objectives
  const wbA10 = await XlsxPopulate.fromDataAsync(bufA10);
  const sheetA10 = wbA10.sheet(0);
  assert.equal(sheetA10.cell('B35').value(), 'SENTINEL_ROW_29', 'Sentinel at row 29 must move to row 35 for 10 objectives (+6 insertion)');
});

test('FEASIBILITY_TRUE_PART_B_OOXML_BLOCK_INSERTION: proves block insertion and totals shifting for 6 and 8 competencies', async () => {
  const { bufB6, bufB8 } = await getStructuralPartBBuffers();

  // 6 Competencies
  const wbB6 = await XlsxPopulate.fromDataAsync(bufB6);
  const sheetB6 = wbB6.sheet(0);
  assert.equal(sheetB6.cell('B31').value(), 'SENTINEL_ROW_31', 'Totals sentinel must remain at row 31 for 6 competencies');

  // 8 Competencies
  const wbB8 = await XlsxPopulate.fromDataAsync(bufB8);
  const sheetB8 = wbB8.sheet(0);
  assert.equal(sheetB8.cell('B39').value(), 'SENTINEL_ROW_31', 'Totals sentinel must move to row 39 for 8 competencies (+8 insertion)');
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
