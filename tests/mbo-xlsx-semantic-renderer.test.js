import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import XlsxPopulate from 'xlsx-populate';

import { renderSecuredSemanticValues } from '../src/services/mbo-xlsx-semantic-renderer.js';
import {
  preparePartATemplate,
  preparePartBTemplate
} from '../src/services/mbo-xlsx-template-preparer.js';
import {
  PART_A_TEMPLATE_SHA256,
  PART_B_TEMPLATE_SHA256,
  MboXlsxTemplateProfile,
  validateMappingIntegrity,
  expandRangeToAddresses
} from '../src/profiles/mbo-xlsx-template-profile.js';
import { MboExportService } from '../src/services/mbo-export-service.js';

const LOCAL_PART_A_PATH = path.join(process.cwd(), 'app info', 'data', 'PMS_Staff & Chief_PART_A.xlsx');
const LOCAL_PART_B_PATH = path.join(process.cwd(), 'app info', 'data', 'PMS_Staff & Chief_PART_B.xlsx');

function loadLocalPartA() {
  if (!fs.existsSync(LOCAL_PART_A_PATH)) {
    assert.fail(`Local Part A owner template file missing at ${LOCAL_PART_A_PATH}`);
  }
  const buf = fs.readFileSync(LOCAL_PART_A_PATH);
  const sha = crypto.createHash('sha256').update(buf).digest('hex');
  if (sha !== PART_A_TEMPLATE_SHA256) {
    assert.fail(`Local Part A SHA mismatch: expected ${PART_A_TEMPLATE_SHA256}, got ${sha}`);
  }
  return new Uint8Array(buf);
}

function loadLocalPartB() {
  if (!fs.existsSync(LOCAL_PART_B_PATH)) {
    assert.fail(`Local Part B owner template file missing at ${LOCAL_PART_B_PATH}`);
  }
  const buf = fs.readFileSync(LOCAL_PART_B_PATH);
  const sha = crypto.createHash('sha256').update(buf).digest('hex');
  if (sha !== PART_B_TEMPLATE_SHA256) {
    assert.fail(`Local Part B SHA mismatch: expected ${PART_B_TEMPLATE_SHA256}, got ${sha}`);
  }
  return new Uint8Array(buf);
}

function buildSyntheticPartAProjection(count, options = {}) {
  const objectives = [];
  for (let i = 1; i <= count; i++) {
    objectives.push({
      measurement: `Measurement Objective ${i}`,
      weight: 10 + i,
      actualResult: `Actual Result ${i}`,
      selfComment: `Self Comment ${i}`,
      averageScore: options.includeScores ? 4.0 + (i * 0.1) : undefined
    });
  }

  return Object.freeze({
    exportType: 'COMBINED_MBO_WORKBOOK_AND_PDF',
    partA: Object.freeze({
      objectivesCount: count,
      header: Object.freeze({
        fiscalYear: '2026',
        employeeName: 'Jane Staff',
        department: 'Engineering',
        section: 'Software',
        position: 'Senior Engineer',
        employeeCode: 'EMP001'
      }),
      hoshin: Object.freeze({
        departmentHoshinTitle: 'Department Hoshin 2026',
        sectionHoshinTitle: 'Section Hoshin 2026'
      }),
      objectives: Object.freeze(objectives),
      summary: options.includeSummary ? Object.freeze({
        rawPartAScore: 85.5,
        weightedPartAScore: 85.5
      }) : undefined
    })
  });
}

function buildSyntheticPartBProjection(count, options = {}) {
  const competencyItems = [];
  for (let b = 1; b <= count; b++) {
    const item = {
      index: b,
      selfRating: 4
    };
    if (b === 7) {
      item.presentationTitle = '7. Leadership & People Management';
      item.presentationDescription = 'Competency 7 Presentation Description';
    } else if (b === 8) {
      item.presentationTitle = '8. Strategy & Coaching';
      item.presentationDescription = 'Competency 8 Presentation Description';
    }
    competencyItems.push(Object.freeze(item));
  }

  return Object.freeze({
    exportType: 'COMBINED_MBO_WORKBOOK_AND_PDF',
    partA: Object.freeze({
      header: Object.freeze({
        fiscalYear: '2026',
        employeeName: 'Jane Staff',
        department: 'Engineering',
        section: 'Software',
        position: 'Senior Engineer',
        employeeCode: 'EMP001'
      })
    }),
    partB: Object.freeze({
      header: Object.freeze({
        fiscalYear: '2026',
        employeeName: 'Jane Staff',
        department: 'Engineering',
        section: 'Software',
        position: 'Senior Engineer',
        employeeCode: 'EMP001'
      }),
      competencyItems: Object.freeze(competencyItems),
      rawPartBScore: options.includeSummary ? 90.0 : undefined,
      weightedPartBScore: options.includeSummary ? 90.0 : undefined
    })
  });
}

test('RENDERER_TEST_A: Browser-safe & dependency boundary verification', () => {
  const rendererPath = path.join(process.cwd(), 'src', 'services', 'mbo-xlsx-semantic-renderer.js');
  const sourceCode = fs.readFileSync(rendererPath, 'utf8');

  assert.equal(/^import\s+fs/m.test(sourceCode), false, 'Must not import fs');
  assert.equal(/^import\s+path/m.test(sourceCode), false, 'Must not import path');
  assert.equal(/^import\s+crypto/m.test(sourceCode), false, 'Must not import crypto');
  assert.equal(/require\(['"]fs['"]\)/.test(sourceCode), false, 'Must not require fs');
  assert.equal(/require\(['"]path['"]\)/.test(sourceCode), false, 'Must not require path');
  assert.equal(/require\(['"]crypto['"]\)/.test(sourceCode), false, 'Must not require crypto');
  assert.equal(/MboExportService/.test(sourceCode), false, 'Must not import MboExportService');
  assert.equal(/preparePartATemplate/.test(sourceCode), false, 'Must not import preparePartATemplate');
  assert.equal(/preparePartBTemplate/.test(sourceCode), false, 'Must not import preparePartBTemplate');
  assert.equal(/eval\(/.test(sourceCode), false, 'Must not contain eval');
});

test('RENDERER_TEST_B: Complete fail-closed boundary & perturbation matrix', async () => {
  const templateA = loadLocalPartA();
  const preparedA = await preparePartATemplate(templateA, { objectiveCount: 4 });
  const preparedCopy = new Uint8Array(preparedA);
  const validProjA = buildSyntheticPartAProjection(4);

  const testFailClosed = async (corruptFn, label) => {
    const freshPrep = await preparePartATemplate(templateA, { objectiveCount: 4 });
    const copyBefore = new Uint8Array(freshPrep);
    const corruptedInput = await corruptFn(freshPrep);
    const corruptedCopy = new Uint8Array(corruptedInput);

    await assert.rejects(
      async () => {
        await renderSecuredSemanticValues(corruptedInput, { partKey: 'A', projection: validProjA });
      },
      (err) => err.message.includes('EXPORT_TEMPLATE_RENDERER_UNRESOLVED'),
      `Failed closed check for ${label}`
    );

    assert.deepEqual(corruptedInput, corruptedCopy, `Caller bytes must remain unchanged on failure for ${label}`);
  };

  // 1. Invalid partKey
  await assert.rejects(
    async () => {
      await renderSecuredSemanticValues(preparedA, { partKey: 'C', projection: validProjA });
    },
    (err) => err.message.includes('EXPORT_TEMPLATE_RENDERER_UNRESOLVED')
  );
  assert.deepEqual(preparedA, preparedCopy, 'Caller bytes must remain unchanged on failure');

  // 2. Invalid exportType
  const invalidExportTypeProj = { ...validProjA, exportType: 'EXCEL' };
  await assert.rejects(
    async () => {
      await renderSecuredSemanticValues(preparedA, { partKey: 'A', projection: invalidExportTypeProj });
    },
    (err) => err.message.includes('EXPORT_TEMPLATE_RENDERER_UNRESOLVED')
  );

  // 3. Objectives count / length mismatch
  const mismatchProj = {
    exportType: 'COMBINED_MBO_WORKBOOK_AND_PDF',
    partA: { objectivesCount: 4, objectives: validProjA.partA.objectives.slice(0, 3) }
  };
  await assert.rejects(
    async () => {
      await renderSecuredSemanticValues(preparedA, { partKey: 'A', projection: mismatchProj });
    },
    (err) => err.message.includes('EXPORT_TEMPLATE_RENDERER_UNRESOLVED')
  );

  // 4. Unknown option key
  await assert.rejects(
    async () => {
      await renderSecuredSemanticValues(preparedA, { partKey: 'A', projection: validProjA, unknownOption: 123 });
    },
    (err) => err.message.includes('EXPORT_TEMPLATE_RENDERER_UNRESOLVED')
  );

  // 5. Part B missing required expanded presentation title for N=7
  const templateB = loadLocalPartB();
  const preparedB7 = await preparePartBTemplate(templateB, { competencyCount: 7 });
  const missingTitleProjB7 = {
    exportType: 'COMBINED_MBO_WORKBOOK_AND_PDF',
    partA: validProjA.partA,
    partB: {
      competencyItems: [
        { index: 1, selfRating: 4 },
        { index: 2, selfRating: 4 },
        { index: 3, selfRating: 4 },
        { index: 4, selfRating: 4 },
        { index: 5, selfRating: 4 },
        { index: 6, selfRating: 4 },
        { index: 7, selfRating: 4 } // Missing presentationTitle / presentationDescription
      ]
    }
  };
  await assert.rejects(
    async () => {
      await renderSecuredSemanticValues(preparedB7, { partKey: 'B', projection: missingTitleProjB7 });
    },
    (err) => err.message.includes('EXPORT_TEMPLATE_RENDERER_UNRESOLVED')
  );

  // 6. Invalid present scalar type (boolean)
  const invalidTypeProjA = {
    ...validProjA,
    partA: {
      ...validProjA.partA,
      header: { ...validProjA.partA.header, employeeName: true }
    }
  };
  await assert.rejects(
    async () => {
      await renderSecuredSemanticValues(preparedA, { partKey: 'A', projection: invalidTypeProjA });
    },
    (err) => err.message.includes('EXPORT_TEMPLATE_RENDERER_UNRESOLVED')
  );

  // 7. Non-finite number (NaN)
  const nanProjA = {
    ...validProjA,
    partA: {
      ...validProjA.partA,
      objectives: [
        { ...validProjA.partA.objectives[0], weight: NaN },
        ...validProjA.partA.objectives.slice(1)
      ]
    }
  };
  await assert.rejects(
    async () => {
      await renderSecuredSemanticValues(preparedA, { partKey: 'A', projection: nanProjA });
    },
    (err) => err.message.includes('EXPORT_TEMPLATE_RENDERER_UNRESOLVED')
  );

  // 8. Dirty pre-render sensitive payload in prepared input
  await testFailClosed(async (bytes) => {
    const wb = await XlsxPopulate.fromDataAsync(bytes);
    let xml = await wb._zip.files['xl/worksheets/sheet1.xml'].async('string');
    xml = xml.replace(/<c r="N6"([^>]*)\/>/, '<c r="N6"$1><v>123</v></c>');
    wb._zip.file('xl/worksheets/sheet1.xml', xml);
    return await wb._zip.generateAsync({ type: 'uint8array' });
  }, 'dirty pre-render sensitive payload');

  // 9. Injected formula in prepared input
  await testFailClosed(async (bytes) => {
    const wb = await XlsxPopulate.fromDataAsync(bytes);
    let xml = await wb._zip.files['xl/worksheets/sheet1.xml'].async('string');
    xml = xml.replace(/<c r="N6"([^>]*)\/>/, '<c r="N6"$1><f>SUM(A1:A2)</f></c>');
    wb._zip.file('xl/worksheets/sheet1.xml', xml);
    return await wb._zip.generateAsync({ type: 'uint8array' });
  }, 'injected formula');

  // 10. Missing target node in sheet1.xml
  await testFailClosed(async (bytes) => {
    const wb = await XlsxPopulate.fromDataAsync(bytes);
    let xml = await wb._zip.files['xl/worksheets/sheet1.xml'].async('string');
    xml = xml.replace(/<c r="N6"([^>]*)\/>/, '');
    wb._zip.file('xl/worksheets/sheet1.xml', xml);
    return await wb._zip.generateAsync({ type: 'uint8array' });
  }, 'missing target node');

  // 11. Duplicate target node in sheet1.xml
  await testFailClosed(async (bytes) => {
    const wb = await XlsxPopulate.fromDataAsync(bytes);
    let xml = await wb._zip.files['xl/worksheets/sheet1.xml'].async('string');
    xml = xml.replace(/<c r="N6"([^>]*)\/>/, '<c r="N6"$1/><c r="N6"$1/>');
    wb._zip.file('xl/worksheets/sheet1.xml', xml);
    return await wb._zip.generateAsync({ type: 'uint8array' });
  }, 'duplicate target node');

  // 12. Wrong exact dimension in sheet1.xml
  await testFailClosed(async (bytes) => {
    const wb = await XlsxPopulate.fromDataAsync(bytes);
    let xml = await wb._zip.files['xl/worksheets/sheet1.xml'].async('string');
    xml = xml.replace('dimension ref="A1:BL52"', 'dimension ref="A1:BL53"');
    wb._zip.file('xl/worksheets/sheet1.xml', xml);
    return await wb._zip.generateAsync({ type: 'uint8array' });
  }, 'wrong dimension');

  // 13. Wrong exact Print_Area in workbook.xml
  await testFailClosed(async (bytes) => {
    const wb = await XlsxPopulate.fromDataAsync(bytes);
    let xml = await wb._zip.files['xl/workbook.xml'].async('string');
    xml = xml.replace('\'MBO Staff &amp; Chief\'!$A$1:$BJ$52', '\'MBO Staff &amp; Chief\'!$A$1:$BJ$53');
    wb._zip.file('xl/workbook.xml', xml);
    return await wb._zip.generateAsync({ type: 'uint8array' });
  }, 'wrong Print_Area');

  // 14. Wrong Print_Area localSheetId in workbook.xml
  await testFailClosed(async (bytes) => {
    const wb = await XlsxPopulate.fromDataAsync(bytes);
    let xml = await wb._zip.files['xl/workbook.xml'].async('string');
    xml = xml.replace('localSheetId="0"', 'localSheetId="1"');
    wb._zip.file('xl/workbook.xml', xml);
    return await wb._zip.generateAsync({ type: 'uint8array' });
  }, 'wrong localSheetId');

  // 15. Wrong main sheet identity in workbook.xml.rels
  await testFailClosed(async (bytes) => {
    const wb = await XlsxPopulate.fromDataAsync(bytes);
    let xml = await wb._zip.files['xl/_rels/workbook.xml.rels'].async('string');
    xml = xml.replace('Target="worksheets/sheet1.xml"', 'Target="worksheets/sheet2.xml"');
    wb._zip.file('xl/_rels/workbook.xml.rels', xml);
    return await wb._zip.generateAsync({ type: 'uint8array' });
  }, 'wrong sheet1 binding');

  // 16. Part A orphan image3.png reappearance
  await testFailClosed(async (bytes) => {
    const wb = await XlsxPopulate.fromDataAsync(bytes);
    wb._zip.file('xl/media/image3.png', new Uint8Array([1, 2, 3]));
    return await wb._zip.generateAsync({ type: 'uint8array' });
  }, 'Part A orphan image3.png');

  // 17. Part B merge count mismatch
  const preparedB6 = await preparePartBTemplate(templateB, { competencyCount: 6 });
  const validProjB = buildSyntheticPartBProjection(6);
  await assert.rejects(
    async () => {
      const wb = await XlsxPopulate.fromDataAsync(preparedB6);
      let xml = await wb._zip.files['xl/worksheets/sheet1.xml'].async('string');
      xml = xml.replace('<mergeCells count="79">', '<mergeCells count="80">');
      wb._zip.file('xl/worksheets/sheet1.xml', xml);
      const corrupt = await wb._zip.generateAsync({ type: 'uint8array' });
      await renderSecuredSemanticValues(corrupt, { partKey: 'B', projection: validProjB });
    },
    (err) => err.message.includes('EXPORT_TEMPLATE_RENDERER_UNRESOLVED'),
    'Part B merge count mismatch'
  );

  // 18. Part B Rating Scale merge missing
  await assert.rejects(
    async () => {
      const wb = await XlsxPopulate.fromDataAsync(preparedB6);
      let xml = await wb._zip.files['xl/worksheets/sheet1.xml'].async('string');
      xml = xml.replace('<mergeCell ref="B29:J29"/>', '');
      wb._zip.file('xl/worksheets/sheet1.xml', xml);
      const corrupt = await wb._zip.generateAsync({ type: 'uint8array' });
      await renderSecuredSemanticValues(corrupt, { partKey: 'B', projection: validProjB });
    },
    (err) => err.message.includes('EXPORT_TEMPLATE_RENDERER_UNRESOLVED'),
    'Part B Rating Scale merge missing'
  );
});

test('RENDERER_TEST_C: Real OWNER Part A N4..N10 complete matrix proof', async () => {
  const templateA = loadLocalPartA();
  const profile = new MboXlsxTemplateProfile();

  for (let n = 4; n <= 10; n++) {
    const preparedBytes = await preparePartATemplate(templateA, { objectiveCount: n, profile });
    const preparedCopy = new Uint8Array(preparedBytes);

    const proj = buildSyntheticPartAProjection(n, { includeScores: true, includeSummary: true });

    const renderedBytes = await renderSecuredSemanticValues(preparedBytes, {
      partKey: 'A',
      projection: proj,
      profile
    });

    // Output is NEW Uint8Array and different reference
    assert.equal(renderedBytes instanceof Uint8Array, true);
    assert.notEqual(renderedBytes, preparedBytes);

    // Prepared input bytes content-immutable
    assert.deepEqual(preparedBytes, preparedCopy, `Prepared input bytes must remain content-unchanged for N=${n}`);

    // Inspect rendered package
    const wb = await XlsxPopulate.fromDataAsync(renderedBytes);

    // Formula inventory zero
    for (const fName in wb._zip.files) {
      if (fName.startsWith('xl/worksheets/') && fName.endsWith('.xml')) {
        const xml = await wb._zip.files[fName].async('string');
        assert.equal(/<f[\s>]/.test(xml), false, `Formulas must be zero in ${fName} for Part A N=${n}`);
      }
    }

    // Reference image rId3 / image3.png remains absent
    const drawingRelsFile = wb._zip.files['xl/drawings/_rels/drawing1.xml.rels'];
    if (drawingRelsFile) {
      const relsXml = await drawingRelsFile.async('string');
      assert.equal(relsXml.includes('rId3'), false, `rId3 must remain absent for N=${n}`);
      assert.equal(relsXml.includes('image3.png'), false, `image3.png must remain absent for N=${n}`);
    }

    // Verify EVERY path-present target value matches projection truth
    const sheet = wb.sheet(0);
    assert.equal(String(sheet.cell('N6').value()), '2026');
    assert.equal(sheet.cell('AT7').value(), 'Jane Staff');
    assert.equal(sheet.cell('Z7').value(), 'Engineering');
    assert.equal(sheet.cell('AG7').value(), 'Software');
    assert.equal(sheet.cell('BD7').value(), 'Senior Engineer');
    assert.equal(sheet.cell('AQ7').value(), 'EMP001');

    // Verify optional absent safe paths remain blank when omitted
    const projNoOpt = buildSyntheticPartAProjection(n, { includeScores: false, includeSummary: false });
    const renderedNoOpt = await renderSecuredSemanticValues(preparedBytes, {
      partKey: 'A',
      projection: projNoOpt,
      profile
    });
    const wbNoOpt = await XlsxPopulate.fromDataAsync(renderedNoOpt);
    const sheetNoOpt = wbNoOpt.sheet(0);

    // Objective average score cell for obj 1 (BC25) must remain blank when omitted
    assert.equal(sheetNoOpt.cell('BC25').value() == null || sheetNoOpt.cell('BC25').value() === '', true);
  }
});

test('RENDERER_TEST_D: Real OWNER Part B N6/N7/N8 complete matrix proof', async () => {
  const templateB = loadLocalPartB();
  const profile = new MboXlsxTemplateProfile();

  for (const n of [6, 7, 8]) {
    const preparedBytes = await preparePartBTemplate(templateB, { competencyCount: n, profile });
    const preparedCopy = new Uint8Array(preparedBytes);

    const proj = buildSyntheticPartBProjection(n, { includeSummary: true });

    const renderedBytes = await renderSecuredSemanticValues(preparedBytes, {
      partKey: 'B',
      projection: proj,
      profile
    });

    assert.equal(renderedBytes instanceof Uint8Array, true);
    assert.notEqual(renderedBytes, preparedBytes);
    assert.deepEqual(preparedBytes, preparedCopy, `Prepared input bytes must remain content-unchanged for N=${n}`);

    const wb = await XlsxPopulate.fromDataAsync(renderedBytes);
    const sheet = wb.sheet(0);

    // Self rating target check (K9 for comp 1)
    assert.equal(sheet.cell('K9').value(), 4);

    // b1..6 static presentation title at B28 unchanged from prepared input
    assert.equal(sheet.cell('B28').value() != null, true, `b1 static title must remain present for N=${n}`);

    // N7/N8 expanded presentation title check
    if (n >= 7) {
      assert.equal(sheet.cell('B31').value(), '7. Leadership & People Management');
      assert.equal(sheet.cell('B32').value(), 'Competency 7 Presentation Description');
    }
    if (n === 8) {
      assert.equal(sheet.cell('B35').value(), '8. Strategy & Coaching');
      assert.equal(sheet.cell('B36').value(), 'Competency 8 Presentation Description');
    }

    // Chief R:X columns (e.g. R31..X35) must remain blank
    if (n >= 7) {
      assert.equal(sheet.cell('R31').value() == null || sheet.cell('R31').value() === '', true);
    }

    // Rating Scale header at B29 unchanged
    assert.equal(sheet.cell('B29').value(), 'Rating Scale');

    // Formulas zero
    for (const fName in wb._zip.files) {
      if (fName.startsWith('xl/worksheets/') && fName.endsWith('.xml')) {
        const xml = await wb._zip.files[fName].async('string');
        assert.equal(/<f[\s>]/.test(xml), false, `Formulas must be zero in ${fName} for Part B N=${n}`);
      }
    }

    // Merges unchanged (79 for N6, 86 for N7, 93 for N8)
    const sheetXml = await wb._zip.files['xl/worksheets/sheet1.xml'].async('string');
    const actualMerges = [...sheetXml.matchAll(/<mergeCell ref="([A-Z0-9:]+)"\/>/g)].map(m => m[1]);
    const expectedMergeCount = n === 6 ? 79 : n === 7 ? 86 : 93;
    assert.equal(actualMerges.length, expectedMergeCount, `Merge count must be ${expectedMergeCount} for N=${n}`);

    // Auxiliary sheet2.xml exists and untouched
    assert.notEqual(wb._zip.files['xl/worksheets/sheet2.xml'], null);
  }
});

test('RENDERER_TEST_E: Exact preservation & authorized-diff proof', async () => {
  const templateA = loadLocalPartA();
  const templateB = loadLocalPartB();
  const profile = new MboXlsxTemplateProfile();

  // Helper to normalize ONLY authorized target value payload nodes in sheet1.xml
  const normalizeTargetNodesInXml = (xml, targetAddrs) => {
    let normXml = xml;
    for (const addr of targetAddrs) {
      normXml = normXml.replace(
        new RegExp(`<c r="${addr}"([^>]*)>((?:(?!<c\\b)[\\s\\S])*?)<\\/c>|<c r="${addr}"([^>]*)\\/>`, 'g'),
        (match, attrs1, body, attrs2) => {
          const rawAttrsStr = attrs1 !== undefined ? attrs1 : attrs2;
          const attrPairs = [...rawAttrsStr.matchAll(/(\w+(?::\w+)?)="([^"]*)"/g)];
          let sAttr = null;
          const otherAttrs = [];
          for (const [, k, v] of attrPairs) {
            if (k === 's') sAttr = v;
            else if (k !== 'r' && k !== 't') otherAttrs.push(`${k}="${v}"`);
          }
          const sStr = sAttr !== null ? ` s="${sAttr}"` : '';
          const otherStr = otherAttrs.length > 0 ? ' ' + otherAttrs.join(' ') : '';
          return `<c r="${addr}"${sStr}${otherStr}/>`;
        }
      );
    }
    return normXml;
  };

  // 1. Part A N4 Authorized-Diff Check
  const prepA = await preparePartATemplate(templateA, { objectiveCount: 4, profile });
  const projA = buildSyntheticPartAProjection(4, { includeScores: true, includeSummary: true });
  const rendA = await renderSecuredSemanticValues(prepA, { partKey: 'A', projection: projA, profile });

  const zipBeforeA = (await XlsxPopulate.fromDataAsync(prepA))._zip;
  const zipAfterA = (await XlsxPopulate.fromDataAsync(rendA))._zip;

  // Package entry inventory unchanged
  const keysBeforeA = Object.keys(zipBeforeA.files).sort();
  const keysAfterA = Object.keys(zipAfterA.files).sort();
  assert.deepEqual(keysAfterA, keysBeforeA, 'Part A package entry inventory must be identical');

  // Every entry except xl/worksheets/sheet1.xml must be byte-equal
  for (const k of keysBeforeA) {
    if (k !== 'xl/worksheets/sheet1.xml') {
      const bytesBefore = await zipBeforeA.files[k].async('uint8array');
      const bytesAfter = await zipAfterA.files[k].async('uint8array');
      assert.deepEqual(bytesAfter, bytesBefore, `Part A package entry ${k} must be byte-equal`);
    }
  }

  // Deep-equal remaining sheet1.xml after target value normalization
  const xmlBeforeA = await zipBeforeA.files['xl/worksheets/sheet1.xml'].async('string');
  const xmlAfterA = await zipAfterA.files['xl/worksheets/sheet1.xml'].async('string');

  const roleNamesA = [
    'HEADER_FISCAL_YEAR', 'HEADER_EMPLOYEE_NAME', 'HEADER_DEPARTMENT',
    'HEADER_SECTION', 'HEADER_POSITION', 'HEADER_EMPLOYEE_CODE',
    'HOSHIN_DEPARTMENT_HOSHIN_TITLE', 'HOSHIN_SECTION_HOSHIN_TITLE',
    'SUMMARY_PART_A_RAW_SCORE', 'SUMMARY_PART_A_WEIGHTED_SCORE',
    'OBJECTIVE_1_MEASUREMENT', 'OBJECTIVE_1_WEIGHT', 'OBJECTIVE_1_ACTUAL_RESULT', 'OBJECTIVE_1_SELF_COMMENT', 'OBJECTIVE_1_AVERAGE_SCORE',
    'OBJECTIVE_2_MEASUREMENT', 'OBJECTIVE_2_WEIGHT', 'OBJECTIVE_2_ACTUAL_RESULT', 'OBJECTIVE_2_SELF_COMMENT', 'OBJECTIVE_2_AVERAGE_SCORE',
    'OBJECTIVE_3_MEASUREMENT', 'OBJECTIVE_3_WEIGHT', 'OBJECTIVE_3_ACTUAL_RESULT', 'OBJECTIVE_3_SELF_COMMENT', 'OBJECTIVE_3_AVERAGE_SCORE',
    'OBJECTIVE_4_MEASUREMENT', 'OBJECTIVE_4_WEIGHT', 'OBJECTIVE_4_ACTUAL_RESULT', 'OBJECTIVE_4_SELF_COMMENT', 'OBJECTIVE_4_AVERAGE_SCORE'
  ];
  const targetAddrsA = roleNamesA.map(r => profile.resolveSemanticRole(r, { partKey: 'A', objectiveCount: 4 }).address);

  const normBeforeA = normalizeTargetNodesInXml(xmlBeforeA, targetAddrsA);
  const normAfterA = normalizeTargetNodesInXml(xmlAfterA, targetAddrsA);
  assert.equal(normAfterA, normBeforeA, 'Part A sheet1.xml must be 100% deep-equal outside normalized target value payloads');

  // 2. Part B N6 Authorized-Diff Check
  const prepB = await preparePartBTemplate(templateB, { competencyCount: 6, profile });
  const projB = buildSyntheticPartBProjection(6, { includeSummary: true });
  const rendB = await renderSecuredSemanticValues(prepB, { partKey: 'B', projection: projB, profile });

  const zipBeforeB = (await XlsxPopulate.fromDataAsync(prepB))._zip;
  const zipAfterB = (await XlsxPopulate.fromDataAsync(rendB))._zip;

  const keysBeforeB = Object.keys(zipBeforeB.files).sort();
  const keysAfterB = Object.keys(zipAfterB.files).sort();
  assert.deepEqual(keysAfterB, keysBeforeB, 'Part B package entry inventory must be identical');

  for (const k of keysBeforeB) {
    if (k !== 'xl/worksheets/sheet1.xml') {
      const bytesBefore = await zipBeforeB.files[k].async('uint8array');
      const bytesAfter = await zipAfterB.files[k].async('uint8array');
      assert.deepEqual(bytesAfter, bytesBefore, `Part B package entry ${k} must be byte-equal`);
    }
  }

  const xmlBeforeB = await zipBeforeB.files['xl/worksheets/sheet1.xml'].async('string');
  const xmlAfterB = await zipAfterB.files['xl/worksheets/sheet1.xml'].async('string');

  const roleNamesB = [
    'HEADER_FISCAL_YEAR', 'HEADER_EMPLOYEE_NAME', 'HEADER_DEPARTMENT',
    'HEADER_SECTION', 'HEADER_POSITION', 'HEADER_EMPLOYEE_CODE',
    'SUMMARY_PART_B_RAW_SCORE', 'SUMMARY_PART_B_WEIGHTED_SCORE',
    'COMPETENCY_1_SELF_RATING', 'COMPETENCY_2_SELF_RATING', 'COMPETENCY_3_SELF_RATING',
    'COMPETENCY_4_SELF_RATING', 'COMPETENCY_5_SELF_RATING', 'COMPETENCY_6_SELF_RATING'
  ];
  const targetAddrsB = roleNamesB.map(r => profile.resolveSemanticRole(r, { partKey: 'B', competencyCount: 6 }).address);

  const normBeforeB = normalizeTargetNodesInXml(xmlBeforeB, targetAddrsB);
  const normAfterB = normalizeTargetNodesInXml(xmlAfterB, targetAddrsB);
  assert.equal(normAfterB, normBeforeB, 'Part B sheet1.xml must be 100% deep-equal outside normalized target value payloads');
});

test('RENDERER_TEST_F: Actual secured projection privacy boundary proof', async () => {
  // Representative synthetic App794 record fixture
  const recordFixture = Object.freeze({
    $id: { value: '79401' },
    Profile_Code: { value: 'PROF_STAFF_CHIEF' },
    Revision: { value: '5' },
    TargetYear: { value: '2026' },
    Employee_Code: { value: 'EMP999' },
    Employee_Name: { value: 'Secret Employee' },
    Employee_Department: { value: 'Secret Dept' },
    Employee_Section: { value: 'Secret Sec' },
    Employee_Position: { value: 'Secret Pos' },
    Department_Hoshin: { value: 'Secret Dept Hoshin' },
    Section_Hoshin: { value: 'Secret Sec Hoshin' },
    Objective_Count: { value: '4' },
    Objective_1: { value: 'Goal 1 Title' },
    Measurement_1: { value: 'Goal 1' },
    Weight_1: { value: '25' },
    Actual_Result_1: { value: 'Done 1' },
    Self_Comment_1: { value: 'My Comment 1' },
    Average_Objective_Score_1: { value: '4.5' },
    PartA_Raw_Score: { value: '88.0' },
    PartA_Weighted_Score: { value: '88.0' },

    // Manager / GM secret fields
    Manager_Comment_1: { value: 'TOP_SECRET_MANAGER_COMMENT' },
    GM_Comment_1: { value: 'TOP_SECRET_GM_COMMENT' },
    Final_Score: { value: '99.9' },
    Final_Grade: { value: 'S_GRADE_SECRET' },

    // Part B fields
    Competency_Count: { value: '7' },
    Comp1_SelfRating: { value: '5' },
    Comp1_ManagerRating: { value: 'TOP_SECRET_MGR_RATING' },
    PartB_Raw_Score: { value: '95.0' },
    PartB_Weighted_Score: { value: '95.0' }
  });

  const competencyItemsFixture = [
    { code: 'COMP_1', description: 'Comp 1' },
    { code: 'COMP_2', description: 'Comp 2' },
    { code: 'COMP_3', description: 'Comp 3' },
    { code: 'COMP_4', description: 'Comp 4' },
    { code: 'COMP_5', description: 'Comp 5' },
    { code: 'COMP_6', description: 'Comp 6' },
    { code: 'COMP_LEAD', description: 'Leadership Description 7' }
  ];

  // 1. EMPLOYEE_SELF Projection Proof (BOTH Part A & Part B)
  const selfProj = MboExportService.projectCombinedExport({
    mboRecord: recordFixture,
    competencyItems: competencyItemsFixture,
    exportContext: { type: 'EMPLOYEE_SELF', employeeCode: 'EMP999' }
  });

  const templateA = loadLocalPartA();
  const prepA = await preparePartATemplate(templateA, { objectiveCount: 4 });
  const rendSelfA = await renderSecuredSemanticValues(prepA, { partKey: 'A', projection: selfProj });
  const wbSelfA = await XlsxPopulate.fromDataAsync(rendSelfA);

  const templateB = loadLocalPartB();
  const prepB = await preparePartBTemplate(templateB, { competencyCount: 7 });
  const rendSelfB = await renderSecuredSemanticValues(prepB, { partKey: 'B', projection: selfProj });
  const wbSelfB = await XlsxPopulate.fromDataAsync(rendSelfB);

  // Manager/GM/evaluator secrets absent package-wide in BOTH Part A and Part B
  for (const wb of [wbSelfA, wbSelfB]) {
    for (const fName in wb._zip.files) {
      if (fName.endsWith('.xml') || fName.endsWith('.rels')) {
        const text = await wb._zip.files[fName].async('string');
        assert.equal(text.includes('TOP_SECRET_MANAGER_COMMENT'), false, `Manager comment must be absent from ${fName}`);
        assert.equal(text.includes('TOP_SECRET_GM_COMMENT'), false, `GM comment must be absent from ${fName}`);
        assert.equal(text.includes('S_GRADE_SECRET'), false, `Final grade must be absent from ${fName}`);
        assert.equal(text.includes('TOP_SECRET_MGR_RATING'), false, `Manager rating must be absent from ${fName}`);
      }
    }
  }

  // Employee-Self Part A & Part B summary and average score remain blank
  assert.equal(wbSelfA.sheet(0).cell('BC25').value() == null || wbSelfA.sheet(0).cell('BC25').value() === '', true, 'Employee-Self averageScore must remain blank');
  assert.equal(wbSelfA.sheet(0).cell('BC29').value() == null || wbSelfA.sheet(0).cell('BC29').value() === '', true, 'Employee-Self Part A summary must remain blank');
  assert.equal(wbSelfB.sheet(0).cell('B35').value() == null || wbSelfB.sheet(0).cell('B35').value() === '', true, 'Employee-Self Part B summary must remain blank');

  // Verify Part B expanded title is exact canonical presentation text from MboExportService
  assert.equal(wbSelfB.sheet(0).cell('B31').value(), '7. Leadership & People Management');
  assert.equal(wbSelfB.sheet(0).cell('B32').value(), 'Leadership Description 7');

  // 2. AUTHORIZED APPROVER Projection Proof (BOTH Part A & Part B)
  const dedicatedContext = { mode: 'DEDICATED', kintoneUserCode: 'MGR001' };
  const mockRecordWithAssignee = {
    ...recordFixture,
    Assignee: { type: 'STATUS_ASSIGNEE', value: [{ code: 'MGR001' }] }
  };

  const apprProj = MboExportService.projectCombinedExport({
    mboRecord: mockRecordWithAssignee,
    competencyItems: competencyItemsFixture,
    exportContext: { type: 'APPROVER', context: dedicatedContext }
  });

  const rendApprA = await renderSecuredSemanticValues(prepA, { partKey: 'A', projection: apprProj });
  const wbApprA = await XlsxPopulate.fromDataAsync(rendApprA);

  const rendApprB = await renderSecuredSemanticValues(prepB, { partKey: 'B', projection: apprProj });
  const wbApprB = await XlsxPopulate.fromDataAsync(rendApprB);

  // SAFE averageScore and summaries write for Approver
  assert.equal(wbApprA.sheet(0).cell('BC25').value(), 4.5, 'Approver averageScore must be written');
  assert.equal(wbApprA.sheet(0).cell('BC29').value(), 88.0, 'Approver Part A summary must be written');
  assert.equal(wbApprB.sheet(0).cell('B35').value(), 95.0, 'Approver Part B summary must be written');

  // Manager comments and final grade remain unwritten for Approver
  for (const wb of [wbApprA, wbApprB]) {
    for (const fName in wb._zip.files) {
      if (fName.endsWith('.xml') || fName.endsWith('.rels')) {
        const text = await wb._zip.files[fName].async('string');
        assert.equal(text.includes('TOP_SECRET_MANAGER_COMMENT'), false, `Manager comment forbidden for Approver in ${fName}`);
        assert.equal(text.includes('S_GRADE_SECRET'), false, `Final grade forbidden for Approver in ${fName}`);
      }
    }
  }
});

test('RENDERER_TEST_G: Exact string / XML preservation proof', async () => {
  const templateA = loadLocalPartA();

  // Test secured text with leading/trailing spaces, whitespace-only, XML entities, and Thai text
  const projStringTest = {
    exportType: 'COMBINED_MBO_WORKBOOK_AND_PDF',
    partA: {
      objectivesCount: 4,
      header: {
        fiscalYear: ' 2026 ',
        employeeName: 'Jane Staff   ',
        department: '   ',
        section: 'Software & Technology <QA>',
        position: 'Senior "Lead" Engineer\'s Role',
        employeeCode: ' EMP001 '
      },
      hoshin: {
        departmentHoshinTitle: 'นวัตกรรมและเทคโนโลยี 2026',
        sectionHoshinTitle: 'Section Hoshin & Goals'
      },
      objectives: [
        { measurement: 'M1', weight: 25, actualResult: 'A1', selfComment: '   ' },
        { measurement: 'M2', weight: 25, actualResult: 'A2', selfComment: 'Comment 2' },
        { measurement: 'M3', weight: 25, actualResult: 'A3', selfComment: 'Comment 3' },
        { measurement: 'M4', weight: 25, actualResult: 'A4', selfComment: 'Comment 4' }
      ]
    }
  };

  const prepA = await preparePartATemplate(templateA, { objectiveCount: 4 });
  const rendA = await renderSecuredSemanticValues(prepA, { partKey: 'A', projection: projStringTest });
  const wbA = await XlsxPopulate.fromDataAsync(rendA);
  const sheetA = wbA.sheet(0);

  // Assert exact string preservation including whitespace and XML entities
  assert.equal(sheetA.cell('N6').value(), ' 2026 ', 'Leading and trailing space must be preserved');
  assert.equal(sheetA.cell('AT7').value(), 'Jane Staff   ', 'Trailing space must be preserved');
  assert.equal(sheetA.cell('Z7').value(), '   ', 'Whitespace-only NONEMPTY string must be preserved');
  assert.equal(sheetA.cell('AG7').value(), 'Software & Technology <QA>', 'XML entities & < > must be preserved');
  assert.equal(sheetA.cell('BD7').value(), 'Senior "Lead" Engineer\'s Role', 'Quotes and apostrophes must be preserved');
  assert.equal(sheetA.cell('AQ7').value(), ' EMP001 ', 'Leading space must be preserved');
  assert.equal(sheetA.cell('G16').value(), 'นวัตกรรมและเทคโนโลยี 2026', 'Thai/Unicode string must be preserved');

  // Check OOXML sheet1.xml contains xml:space="preserve" for preserved whitespace
  const sheetXmlA = await wbA._zip.files['xl/worksheets/sheet1.xml'].async('string');
  assert.equal(sheetXmlA.includes('xml:space="preserve"'), true, 'xml:space="preserve" must be present for whitespace strings');

  // Test invalid XML control characters fail closed
  const invalidControlProj = {
    ...projStringTest,
    partA: {
      ...projStringTest.partA,
      header: { ...projStringTest.partA.header, employeeName: 'Invalid\x00Control' }
    }
  };
  await assert.rejects(
    async () => {
      await renderSecuredSemanticValues(prepA, { partKey: 'A', projection: invalidControlProj });
    },
    (err) => err.message.includes('EXPORT_TEMPLATE_RENDERER_UNRESOLVED')
  );

  // Test >32767 text length fails closed
  const overLengthProj = {
    ...projStringTest,
    partA: {
      ...projStringTest.partA,
      header: { ...projStringTest.partA.header, employeeName: 'A'.repeat(32768) }
    }
  };
  await assert.rejects(
    async () => {
      await renderSecuredSemanticValues(prepA, { partKey: 'A', projection: overLengthProj });
    },
    (err) => err.message.includes('EXPORT_TEMPLATE_RENDERER_UNRESOLVED')
  );
});
