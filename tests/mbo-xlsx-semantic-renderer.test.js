import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import JSZip from 'jszip';
import XlsxPopulate from 'xlsx-populate';

import { renderSecuredSemanticValues, normalizeTargetNodesForPreservation } from '../src/services/mbo-xlsx-semantic-renderer.js';
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

function resolvePath(obj, pathStr) {
  if (!obj || typeof obj !== 'object') return undefined;
  const parts = pathStr.split(/\.|\/|\[|\]/).filter(Boolean);
  let curr = obj;
  for (const p of parts) {
    if (curr == null) return undefined;
    const isArrIdx = /^\d+$/.test(p);
    if (isArrIdx) {
      const idx = parseInt(p, 10);
      if (!Array.isArray(curr) || idx >= curr.length) return undefined;
      curr = curr[idx];
    } else {
      if (typeof curr !== 'object' || !Object.prototype.hasOwnProperty.call(curr, p)) {
        return undefined;
      }
      curr = curr[p];
    }
  }
  return curr;
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
        fiscalYear: 2026,
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
        fiscalYear: 2026,
        employeeName: 'Jane Staff',
        department: 'Engineering',
        section: 'Software',
        position: 'Senior Engineer',
        employeeCode: 'EMP001'
      })
    }),
    partB: Object.freeze({
      header: Object.freeze({
        fiscalYear: 2026,
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
  const templateB = loadLocalPartB();
  const preparedA = await preparePartATemplate(templateA, { objectiveCount: 4 });
  const validProjA = buildSyntheticPartAProjection(4);
  const validProjB = buildSyntheticPartBProjection(6);

  const testFailClosedA = async (corruptFn, label) => {
    const freshPrep = await preparePartATemplate(templateA, { objectiveCount: 4 });
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

  const testFailClosedB = async (corruptFn, label) => {
    const freshPrep = await preparePartBTemplate(templateB, { competencyCount: 6 });
    const corruptedInput = await corruptFn(freshPrep);
    const corruptedCopy = new Uint8Array(corruptedInput);

    await assert.rejects(
      async () => {
        await renderSecuredSemanticValues(corruptedInput, { partKey: 'B', projection: validProjB });
      },
      (err) => err.message.includes('EXPORT_TEMPLATE_RENDERER_UNRESOLVED'),
      `Failed closed check for ${label}`
    );

    assert.deepEqual(corruptedInput, corruptedCopy, `Part B caller bytes must remain unchanged on failure for ${label}`);
  };

  // 1. Invalid partKey
  await assert.rejects(
    async () => {
      await renderSecuredSemanticValues(preparedA, { partKey: 'C', projection: validProjA });
    },
    (err) => err.message.includes('EXPORT_TEMPLATE_RENDERER_UNRESOLVED')
  );

  // 2. Invalid exportType
  await assert.rejects(
    async () => {
      await renderSecuredSemanticValues(preparedA, { partKey: 'A', projection: { ...validProjA, exportType: 'EXCEL' } });
    },
    (err) => err.message.includes('EXPORT_TEMPLATE_RENDERER_UNRESOLVED')
  );

  // 3. Objectives count / length mismatch
  await assert.rejects(
    async () => {
      await renderSecuredSemanticValues(preparedA, {
        partKey: 'A',
        projection: { exportType: 'COMBINED_MBO_WORKBOOK_AND_PDF', partA: { objectivesCount: 4, objectives: validProjA.partA.objectives.slice(0, 3) } }
      });
    },
    (err) => err.message.includes('EXPORT_TEMPLATE_RENDERER_UNRESOLVED')
  );

  // 4. Malformed Part B competency count (5 items or 9 items)
  await assert.rejects(
    async () => {
      await renderSecuredSemanticValues(await preparePartBTemplate(templateB, { competencyCount: 6 }), {
        partKey: 'B',
        projection: buildSyntheticPartBProjection(5)
      });
    },
    (err) => err.message.includes('EXPORT_TEMPLATE_RENDERER_UNRESOLVED')
  );

  // 5. Unknown option key
  await assert.rejects(
    async () => {
      await renderSecuredSemanticValues(preparedA, { partKey: 'A', projection: validProjA, unknownOption: 123 });
    },
    (err) => err.message.includes('EXPORT_TEMPLATE_RENDERER_UNRESOLVED')
  );

  // 6. Invalid scalar types (boolean, object, array, bigint)
  for (const badVal of [true, { foo: 'bar' }, ['a'], 123n]) {
    const invalidTypeProj = {
      ...validProjA,
      partA: { ...validProjA.partA, header: { ...validProjA.partA.header, employeeName: badVal } }
    };
    await assert.rejects(
      async () => {
        await renderSecuredSemanticValues(preparedA, { partKey: 'A', projection: invalidTypeProj });
      },
      (err) => err.message.includes('EXPORT_TEMPLATE_RENDERER_UNRESOLVED')
    );
  }

  // 7. Non-finite numbers (NaN, Infinity, -Infinity)
  for (const badNum of [NaN, Infinity, -Infinity]) {
    const badNumProj = {
      ...validProjA,
      partA: {
        ...validProjA.partA,
        objectives: [{ ...validProjA.partA.objectives[0], weight: badNum }, ...validProjA.partA.objectives.slice(1)]
      }
    };
    await assert.rejects(
      async () => {
        await renderSecuredSemanticValues(preparedA, { partKey: 'A', projection: badNumProj });
      },
      (err) => err.message.includes('EXPORT_TEMPLATE_RENDERER_UNRESOLVED')
    );
  }

  // 8. Blank and whitespace-only required b7 presentation
  const preparedB7 = await preparePartBTemplate(templateB, { competencyCount: 7 });
  for (const badPres of ['', '   ']) {
    const badPresProj = {
      exportType: 'COMBINED_MBO_WORKBOOK_AND_PDF',
      partB: {
        competencyItems: [
          { index: 1, selfRating: 4 }, { index: 2, selfRating: 4 }, { index: 3, selfRating: 4 },
          { index: 4, selfRating: 4 }, { index: 5, selfRating: 4 }, { index: 6, selfRating: 4 },
          { index: 7, selfRating: 4, presentationTitle: badPres, presentationDescription: 'Desc' }
        ]
      }
    };
    await assert.rejects(
      async () => {
        await renderSecuredSemanticValues(preparedB7, { partKey: 'B', projection: badPresProj });
      },
      (err) => err.message.includes('EXPORT_TEMPLATE_RENDERER_UNRESOLVED')
    );
  }

  // 9. Dirty pre-render sensitive payload in prepared input
  await testFailClosedA(async (bytes) => {
    const zip = await JSZip.loadAsync(bytes);
    let xml = await zip.files['xl/worksheets/sheet1.xml'].async('string');
    xml = xml.replace(/<c r="N6"([^>]*)\/>/, '<c r="N6"$1><v>123</v></c>');
    zip.file('xl/worksheets/sheet1.xml', xml);
    return await zip.generateAsync({ type: 'uint8array' });
  }, 'dirty pre-render sensitive payload');

  // 10. Injected formula in prepared input
  await testFailClosedA(async (bytes) => {
    const zip = await JSZip.loadAsync(bytes);
    let xml = await zip.files['xl/worksheets/sheet1.xml'].async('string');
    xml = xml.replace(/<c r="N6"([^>]*)\/>/, '<c r="N6"$1><f>SUM(A1:A2)</f></c>');
    zip.file('xl/worksheets/sheet1.xml', xml);
    return await zip.generateAsync({ type: 'uint8array' });
  }, 'injected formula');

  // 11. Missing target node in sheet1.xml
  await testFailClosedA(async (bytes) => {
    const zip = await JSZip.loadAsync(bytes);
    let xml = await zip.files['xl/worksheets/sheet1.xml'].async('string');
    xml = xml.replace(/<c r="N6"([^>]*)\/>/, '');
    zip.file('xl/worksheets/sheet1.xml', xml);
    return await zip.generateAsync({ type: 'uint8array' });
  }, 'missing target node');

  // 12. Duplicate target node in sheet1.xml
  await testFailClosedA(async (bytes) => {
    const zip = await JSZip.loadAsync(bytes);
    let xml = await zip.files['xl/worksheets/sheet1.xml'].async('string');
    xml = xml.replace(/<c r="N6"([^>]*)\/>/, '<c r="N6"$1/><c r="N6"$1/>');
    zip.file('xl/worksheets/sheet1.xml', xml);
    return await zip.generateAsync({ type: 'uint8array' });
  }, 'duplicate target node');

  // 13. Wrong exact dimension in sheet1.xml
  await testFailClosedA(async (bytes) => {
    const zip = await JSZip.loadAsync(bytes);
    let xml = await zip.files['xl/worksheets/sheet1.xml'].async('string');
    xml = xml.replace('dimension ref="A1:BL52"', 'dimension ref="A1:BL53"');
    zip.file('xl/worksheets/sheet1.xml', xml);
    return await zip.generateAsync({ type: 'uint8array' });
  }, 'wrong dimension');

  // 14. Duplicate Print_Area in workbook.xml
  await testFailClosedA(async (bytes) => {
    const zip = await JSZip.loadAsync(bytes);
    let xml = await zip.files['xl/workbook.xml'].async('string');
    xml = xml.replace(
      '<definedName name="_xlnm.Print_Area" localSheetId="0">\'MBO Staff &amp; Chief\'!$A$1:$BJ$52</definedName>',
      '<definedName name="_xlnm.Print_Area" localSheetId="0">\'MBO Staff &amp; Chief\'!$A$1:$BJ$52</definedName><definedName name="_xlnm.Print_Area" localSheetId="0">\'MBO Staff &amp; Chief\'!$A$1:$BJ$52</definedName>'
    );
    zip.file('xl/workbook.xml', xml);
    return await zip.generateAsync({ type: 'uint8array' });
  }, 'duplicate Print_Area');

  // 15. Wrong workbook main-sheet name in workbook.xml
  await testFailClosedA(async (bytes) => {
    const zip = await JSZip.loadAsync(bytes);
    let xml = await zip.files['xl/workbook.xml'].async('string');
    xml = xml.replace('name="MBO Staff &amp; Chief"', 'name="Wrong Main Sheet"');
    zip.file('xl/workbook.xml', xml);
    return await zip.generateAsync({ type: 'uint8array' });
  }, 'wrong main sheet name');

  // 16. Part A forbidden drawing relationship (rId3 / image3.png)
  await testFailClosedA(async (bytes) => {
    const zip = await JSZip.loadAsync(bytes);
    let relsXml = await zip.files['xl/drawings/_rels/drawing1.xml.rels'].async('string');
    relsXml = relsXml.replace('</Relationships>', '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image3.png"/></Relationships>');
    zip.file('xl/drawings/_rels/drawing1.xml.rels', relsXml);
    return await zip.generateAsync({ type: 'uint8array' });
  }, 'forbidden drawing rel');

  // 17. Part B actual merge inventory mismatch while declared count remains unchanged
  await testFailClosedB(async (bytes) => {
    const zip = await JSZip.loadAsync(bytes);
    let xml = await zip.files['xl/worksheets/sheet1.xml'].async('string');
    xml = xml.replace('<mergeCell ref="B29:J29"/>', ''); // removes 1 merge cell node, keeping count="79"
    zip.file('xl/worksheets/sheet1.xml', xml);
    return await zip.generateAsync({ type: 'uint8array' });
  }, 'Part B merge inventory mismatch');

  // 18. Part B protected padding row missing
  await testFailClosedB(async (bytes) => {
    const zip = await JSZip.loadAsync(bytes);
    let xml = await zip.files['xl/worksheets/sheet1.xml'].async('string');
    xml = xml.replace(/<row[^>]*r="30"[^>]*>[\s\S]*?<\/row>|<row[^>]*r="30"[^>]*\/>/, '');
    zip.file('xl/worksheets/sheet1.xml', xml);
    return await zip.generateAsync({ type: 'uint8array' });
  }, 'Part B padding row missing');

  // 19. Part B protected padding row duplicate
  await testFailClosedB(async (bytes) => {
    const zip = await JSZip.loadAsync(bytes);
    let xml = await zip.files['xl/worksheets/sheet1.xml'].async('string');
    xml = xml.replace('<row r="30"', '<row r="30" /><row r="30"');
    zip.file('xl/worksheets/sheet1.xml', xml);
    return await zip.generateAsync({ type: 'uint8array' });
  }, 'Part B padding row duplicate');

  // 20. Part B auxiliary Sheet1 binding corruption
  await testFailClosedB(async (bytes) => {
    const zip = await JSZip.loadAsync(bytes);
    let xml = await zip.files['xl/_rels/workbook.xml.rels'].async('string');
    xml = xml.replace('Target="worksheets/sheet2.xml"', 'Target="worksheets/sheet3.xml"');
    zip.file('xl/_rels/workbook.xml.rels', xml);
    return await zip.generateAsync({ type: 'uint8array' });
  }, 'Part B aux sheet2 binding corruption');
});

test('RENDERER_TEST_C: Full Part A exact Profile/projection truth matrix proof (N4..N10)', async () => {
  const templateA = loadLocalPartA();
  const profile = new MboXlsxTemplateProfile();

  for (let n = 4; n <= 10; n++) {
    const preparedBytes = await preparePartATemplate(templateA, { objectiveCount: n, profile });
    const preparedCopy = new Uint8Array(preparedBytes);
    const projFull = buildSyntheticPartAProjection(n, { includeScores: true, includeSummary: true });

    const renderedBytes = await renderSecuredSemanticValues(preparedBytes, {
      partKey: 'A',
      projection: projFull,
      profile
    });

    assert.equal(renderedBytes instanceof Uint8Array, true);
    assert.notEqual(renderedBytes, preparedBytes);
    assert.deepEqual(preparedBytes, preparedCopy, `Prepared input bytes must remain content-unchanged for N=${n}`);

    const wbFull = await XlsxPopulate.fromDataAsync(renderedBytes);
    const sheetFull = wbFull.sheet(0);

    // Build exact Profile-derived role set
    const roleNames = [
      'HEADER_FISCAL_YEAR', 'HEADER_EMPLOYEE_NAME', 'HEADER_DEPARTMENT',
      'HEADER_SECTION', 'HEADER_POSITION', 'HEADER_EMPLOYEE_CODE',
      'HOSHIN_DEPARTMENT_HOSHIN_TITLE', 'HOSHIN_SECTION_HOSHIN_TITLE',
      'SUMMARY_PART_A_RAW_SCORE', 'SUMMARY_PART_A_WEIGHTED_SCORE'
    ];
    for (let i = 1; i <= n; i++) {
      roleNames.push(
        `OBJECTIVE_${i}_MEASUREMENT`, `OBJECTIVE_${i}_WEIGHT`,
        `OBJECTIVE_${i}_ACTUAL_RESULT`, `OBJECTIVE_${i}_SELF_COMMENT`,
        `OBJECTIVE_${i}_AVERAGE_SCORE`
      );
    }
    const expectedRoleCount = 10 + (5 * n);
    assert.equal(roleNames.length, expectedRoleCount, `Exact role count must be ${expectedRoleCount} for Part A N=${n}`);

    const writtenAddrs = new Set();
    for (const rName of roleNames) {
      const roleInfo = profile.resolveSemanticRole(rName, { partKey: 'A', objectiveCount: n });
      assert.notEqual(roleInfo, null);
      writtenAddrs.add(roleInfo.address);

      // Independently resolve exact projectionPath in TEST code
      const expectedVal = resolvePath(projFull, roleInfo.projectionPath);
      assert.notEqual(expectedVal, undefined, `Expected value for role ${rName} path ${roleInfo.projectionPath} must not be undefined`);

      const decodedVal = sheetFull.cell(roleInfo.address).value();
      if (typeof expectedVal === 'number') {
        assert.equal(typeof decodedVal, 'number', `Value at ${roleInfo.address} must be typed number for role ${rName}`);
        assert.equal(Number.isFinite(decodedVal), true, `Numeric value at ${roleInfo.address} must be finite for role ${rName}`);
        assert.equal(decodedVal, expectedVal, `Numeric scalar mismatch for role ${rName} at ${roleInfo.address}`);
      } else {
        assert.equal(typeof decodedVal, 'string', `Value at ${roleInfo.address} must be typed string for role ${rName}`);
        assert.equal(decodedVal, expectedVal, `String scalar mismatch for role ${rName} at ${roleInfo.address}`);
      }
    }

    // Verify all other effective sanitization addresses outside written set remain blank
    const layout = profile.getPartALayoutTopology(n);
    const sanAddrs = layout.effectiveSanitizationRanges.flatMap(r => expandRangeToAddresses(r));
    for (const addr of sanAddrs) {
      if (!writtenAddrs.has(addr)) {
        const val = sheetFull.cell(addr).value();
        assert.equal(val == null || val === '', true, `Sanitized cell ${addr} must remain blank for N=${n}`);
      }
    }

    // Run SECOND projection with optional averageScores and Part A summaries omitted
    const projOmitted = buildSyntheticPartAProjection(n, { includeScores: false, includeSummary: false });
    const renderedOmittedBytes = await renderSecuredSemanticValues(preparedBytes, {
      partKey: 'A',
      projection: projOmitted,
      profile
    });
    const wbOmitted = await XlsxPopulate.fromDataAsync(renderedOmittedBytes);
    const sheetOmitted = wbOmitted.sheet(0);

    // Verify omitted optional averageScores and summary scores remain blank
    for (let i = 1; i <= n; i++) {
      const scoreRole = profile.resolveSemanticRole(`OBJECTIVE_${i}_AVERAGE_SCORE`, { partKey: 'A', objectiveCount: n });
      const scoreVal = sheetOmitted.cell(scoreRole.address).value();
      assert.equal(scoreVal == null || scoreVal === '', true, `Omitted average score at ${scoreRole.address} must remain blank`);
    }
    const rawSumRole = profile.resolveSemanticRole('SUMMARY_PART_A_RAW_SCORE', { partKey: 'A', objectiveCount: n });
    const wtdSumRole = profile.resolveSemanticRole('SUMMARY_PART_A_WEIGHTED_SCORE', { partKey: 'A', objectiveCount: n });
    assert.equal(sheetOmitted.cell(rawSumRole.address).value() == null || sheetOmitted.cell(rawSumRole.address).value() === '', true);
    assert.equal(sheetOmitted.cell(wtdSumRole.address).value() == null || sheetOmitted.cell(wtdSumRole.address).value() === '', true);

    // Formula inventory zero
    const zipRend = await JSZip.loadAsync(renderedBytes);
    for (const fName in zipRend.files) {
      if (fName.startsWith('xl/worksheets/') && fName.endsWith('.xml')) {
        const xml = await zipRend.files[fName].async('string');
        assert.equal(/<f[\s>]/.test(xml), false, `Formulas must be zero in ${fName} for Part A N=${n}`);
      }
    }

    // Reference image rId3 / image3.png remains absent
    const drawingRelsFile = zipRend.files['xl/drawings/_rels/drawing1.xml.rels'];
    if (drawingRelsFile) {
      const relsXml = await drawingRelsFile.async('string');
      assert.equal(relsXml.includes('rId3'), false, `rId3 must remain absent for N=${n}`);
      assert.equal(relsXml.includes('image3.png'), false, `image3.png must remain absent for N=${n}`);
    }
  }
});

test('RENDERER_TEST_D: Full Part B exact Profile/projection truth & static matrix proof (N6/N7/N8)', async () => {
  const templateB = loadLocalPartB();
  const profile = new MboXlsxTemplateProfile();

  for (const n of [6, 7, 8]) {
    const preparedBytes = await preparePartBTemplate(templateB, { competencyCount: n, profile });
    const preparedCopy = new Uint8Array(preparedBytes);

    // Baseline XML and DOM from preparedBytes
    const zipPrep = await JSZip.loadAsync(preparedBytes);
    const xmlPrepBefore = await zipPrep.files['xl/worksheets/sheet1.xml'].async('string');
    const wbPrepBefore = await XlsxPopulate.fromDataAsync(preparedBytes);
    const sheetPrepBefore = wbPrepBefore.sheet(0);

    // 1. FULL SUMMARY PROJECTION VARIANT
    const projFull = buildSyntheticPartBProjection(n, { includeSummary: true });
    const renderedBytes = await renderSecuredSemanticValues(preparedBytes, {
      partKey: 'B',
      projection: projFull,
      profile
    });

    assert.equal(renderedBytes instanceof Uint8Array, true);
    assert.notEqual(renderedBytes, preparedBytes);
    assert.deepEqual(preparedBytes, preparedCopy, `Prepared input bytes must remain content-unchanged for N=${n}`);

    const wbFull = await XlsxPopulate.fromDataAsync(renderedBytes);
    const sheetFull = wbFull.sheet(0);

    const roleNames = [
      'HEADER_FISCAL_YEAR', 'HEADER_EMPLOYEE_NAME', 'HEADER_DEPARTMENT',
      'HEADER_SECTION', 'HEADER_POSITION', 'HEADER_EMPLOYEE_CODE',
      'SUMMARY_PART_B_RAW_SCORE', 'SUMMARY_PART_B_WEIGHTED_SCORE'
    ];
    for (let b = 1; b <= n; b++) {
      roleNames.push(`COMPETENCY_${b}_SELF_RATING`);
    }
    if (n >= 7) roleNames.push('COMPETENCY_7_TITLE', 'COMPETENCY_7_DESCRIPTION');
    if (n === 8) roleNames.push('COMPETENCY_8_TITLE', 'COMPETENCY_8_DESCRIPTION');

    const expectedRoleCount = n === 6 ? 14 : (n === 7 ? 17 : 20);
    assert.equal(roleNames.length, expectedRoleCount, `Exact role count must be ${expectedRoleCount} for Part B N=${n}`);

    const writtenAddrs = new Set();
    for (const rName of roleNames) {
      const roleInfo = profile.resolveSemanticRole(rName, { partKey: 'B', competencyCount: n });
      assert.notEqual(roleInfo, null);
      writtenAddrs.add(roleInfo.address);

      // Independently resolve exact projectionPath in TEST code
      const expectedVal = resolvePath(projFull, roleInfo.projectionPath);
      assert.notEqual(expectedVal, undefined, `Expected value for role ${rName} path ${roleInfo.projectionPath} must not be undefined`);

      const decodedVal = sheetFull.cell(roleInfo.address).value();
      if (typeof expectedVal === 'number') {
        assert.equal(typeof decodedVal, 'number', `Value at ${roleInfo.address} must be typed number for role ${rName}`);
        assert.equal(Number.isFinite(decodedVal), true, `Numeric value at ${roleInfo.address} must be finite for role ${rName}`);
        assert.equal(decodedVal, expectedVal, `Numeric scalar mismatch for role ${rName} at ${roleInfo.address}`);
      } else {
        assert.equal(typeof decodedVal, 'string', `Value at ${roleInfo.address} must be typed string for role ${rName}`);
        assert.equal(decodedVal, expectedVal, `String scalar mismatch for role ${rName} at ${roleInfo.address}`);
      }
    }

    // 2. SUMMARY OMITTED PROJECTION VARIANT & COMPLETE NONWRITTEN PROOF
    const projOmitted = buildSyntheticPartBProjection(n, { includeSummary: false });
    const renderedOmittedBytes = await renderSecuredSemanticValues(preparedBytes, {
      partKey: 'B',
      projection: projOmitted,
      profile
    });
    const wbOmitted = await XlsxPopulate.fromDataAsync(renderedOmittedBytes);
    const sheetOmitted = wbOmitted.sheet(0);

    const rawBScoreRole = profile.resolveSemanticRole('SUMMARY_PART_B_RAW_SCORE', { partKey: 'B', competencyCount: n });
    const wtdBScoreRole = profile.resolveSemanticRole('SUMMARY_PART_B_WEIGHTED_SCORE', { partKey: 'B', competencyCount: n });
    assert.equal(sheetOmitted.cell(rawBScoreRole.address).value() == null || sheetOmitted.cell(rawBScoreRole.address).value() === '', true, `Omitted Part B raw score at ${rawBScoreRole.address} must remain blank`);
    assert.equal(sheetOmitted.cell(wtdBScoreRole.address).value() == null || sheetOmitted.cell(wtdBScoreRole.address).value() === '', true, `Omitted Part B weighted score at ${wtdBScoreRole.address} must remain blank`);

    // Verify COMPLETE nonwritten addresses across effectiveSanitizationRanges for BOTH projFull and projOmitted
    const layout = profile.getPartBLayoutTopology(n);
    const sanAddrs = layout.effectiveSanitizationRanges.flatMap(r => expandRangeToAddresses(r));

    // Derive written addresses for projOmitted (no summary scores)
    const writtenAddrsOmitted = new Set();
    for (const rName of roleNames) {
      if (rName !== 'SUMMARY_PART_B_RAW_SCORE' && rName !== 'SUMMARY_PART_B_WEIGHTED_SCORE') {
        const roleInfo = profile.resolveSemanticRole(rName, { partKey: 'B', competencyCount: n });
        writtenAddrsOmitted.add(roleInfo.address);
      }
    }

    for (const addr of sanAddrs) {
      // Check full summary variant nonwritten addresses
      if (!writtenAddrs.has(addr)) {
        const valFull = sheetFull.cell(addr).value();
        assert.equal(valFull == null || valFull === '', true, `Nonwritten cell ${addr} in full summary must remain blank for N=${n}`);
      }
      // Check summary omitted variant nonwritten addresses
      if (!writtenAddrsOmitted.has(addr)) {
        const valOmitted = sheetOmitted.cell(addr).value();
        assert.equal(valOmitted == null || valOmitted === '', true, `Nonwritten cell ${addr} in summary omitted must remain blank for N=${n}`);
      }
    }

    // Retain FULL Chief rating columns blank proof explicitly
    for (const addr of sanAddrs) {
      if (/^(?:AG|AM|AQ|AT|BD)\d+$/.test(addr)) {
        const valFull = sheetFull.cell(addr).value();
        const valOmitted = sheetOmitted.cell(addr).value();
        assert.equal(valFull == null || valFull === '', true, `Chief authority cell ${addr} in full summary must remain blank for N=${n}`);
        assert.equal(valOmitted == null || valOmitted === '', true, `Chief authority cell ${addr} in summary omitted must remain blank for N=${n}`);
      }
    }

    // Complete b1..b6 static title/description presentation authority parity
    const staticB1to6Addrs = ['B7', 'B8', 'B11', 'B12', 'B15', 'B16', 'B19', 'B20', 'B23', 'B24', 'B27', 'B28'];
    for (const staticAddr of staticB1to6Addrs) {
      assert.equal(String(sheetFull.cell(staticAddr).value()), String(sheetPrepBefore.cell(staticAddr).value()), `Static presentation text at ${staticAddr} must have exact prepared-before parity for N=${n}`);
    }

    // Complete Rating Scale static ranges raw XML parity & typed value parity
    const zipRend = await JSZip.loadAsync(renderedBytes);
    const sheetXmlRend = await zipRend.files['xl/worksheets/sheet1.xml'].async('string');

    for (const staticRange of layout.ratingScaleStaticRanges) {
      const rangeAddrs = expandRangeToAddresses(staticRange);
      for (const cellAddr of rangeAddrs) {
        // Raw cell-node XML parity
        const rawNodeBeforeMatch = xmlPrepBefore.match(new RegExp(`<c\\b[^>]*?(?<=[\\s<])r="${cellAddr}"(?=[\\s\\/>])(?:[^>]*?\\/>|[^>]*?>[\\s\\S]*?<\\/c>)`));
        const rawNodeAfterMatch = sheetXmlRend.match(new RegExp(`<c\\b[^>]*?(?<=[\\s<])r="${cellAddr}"(?=[\\s\\/>])(?:[^>]*?\\/>|[^>]*?>[\\s\\S]*?<\\/c>)`));
        assert.notEqual(rawNodeBeforeMatch, null, `Rating Scale cell ${cellAddr} node missing before for N=${n}`);
        assert.notEqual(rawNodeAfterMatch, null, `Rating Scale cell ${cellAddr} node missing after for N=${n}`);
        assert.equal(rawNodeAfterMatch[0], rawNodeBeforeMatch[0], `Rating Scale raw cell XML at ${cellAddr} must be byte/tag equal for N=${n}`);

        // Typed value & type parity without String(...) coercion
        const valAfter = sheetFull.cell(cellAddr).value();
        const valBefore = sheetPrepBefore.cell(cellAddr).value();
        assert.equal(typeof valAfter, typeof valBefore, `Rating Scale cell ${cellAddr} type match for N=${n}`);
        assert.equal(valAfter, valBefore, `Rating Scale cell ${cellAddr} exact value match for N=${n}`);
      }
    }

    // Complete protected padding row exact XML parity
    for (const padRow of layout.protectedPaddingRows) {
      const rowMatchBefore = xmlPrepBefore.match(new RegExp(`<row[^>]*r="${padRow}"[^>]*>[\\s\\S]*?<\\/row>|<row[^>]*r="${padRow}"[^>]*\\/>`));
      const rowMatchAfter = sheetXmlRend.match(new RegExp(`<row[^>]*r="${padRow}"[^>]*>[\\s\\S]*?<\\/row>|<row[^>]*r="${padRow}"[^>]*\\/>`));
      assert.notEqual(rowMatchBefore, null);
      assert.notEqual(rowMatchAfter, null);
      assert.equal(rowMatchAfter[0], rowMatchBefore[0], `Protected padding row ${padRow} must have exact byte/attribute/cell parity for N=${n}`);
    }

    // Complete sorted merge inventory equality
    const mergesBefore = [...xmlPrepBefore.matchAll(/<mergeCell ref="([A-Z0-9:]+)"\/>/g)].map(m => m[1]).sort();
    const mergesAfter = [...sheetXmlRend.matchAll(/<mergeCell ref="([A-Z0-9:]+)"\/>/g)].map(m => m[1]).sort();
    assert.deepEqual(mergesAfter, mergesBefore, `Complete sorted merge ref inventory must equal prepared-before for N=${n}`);

    // Auxiliary sheet2.xml byte/content parity
    const sheet2Before = await zipPrep.files['xl/worksheets/sheet2.xml'].async('uint8array');
    const sheet2After = await zipRend.files['xl/worksheets/sheet2.xml'].async('uint8array');
    assert.deepEqual(sheet2After, sheet2Before, `Auxiliary sheet2.xml must be byte-equal for N=${n}`);

    // Formulas zero
    for (const fName in zipRend.files) {
      if (fName.startsWith('xl/worksheets/') && fName.endsWith('.xml')) {
        const xml = await zipRend.files[fName].async('string');
        assert.equal(/<f[\s>]/.test(xml), false, `Formulas must be zero in ${fName} for Part B N=${n}`);
      }
    }
  }
});

test('RENDERER_TEST_E: Independent collision-proof authorized-diff exact-attribute proof with sentinels', async () => {
  const templateA = loadLocalPartA();
  const profile = new MboXlsxTemplateProfile();

  // Prepare Part A template with injected collision sentinels and deliberate noncanonical whitespace into writable target T26
  const prepA = await preparePartATemplate(templateA, { objectiveCount: 4, profile });
  const zipPrepA = await JSZip.loadAsync(prepA);
  let xmlPrepA = await zipPrepA.files['xl/worksheets/sheet1.xml'].async('string');

  // Inject custom:r, custom:t, data-r, data-t sentinels and noncanonical spacing (\t, \n) into T26 opening tag
  // Include explicit whitespace immediately AFTER real unprefixed t token before closing />
  xmlPrepA = xmlPrepA.replace(
    /<c\b[^>]*?(?<=\s|^)r="T26"(?=[\s/>])(?:[^>]*?\/>|[^>]*?>[\s\S]*?<\/c>)/,
    '<c  r="T26" \t  s="385"   custom:r="KEEP_CUSTOM_R" custom:t="KEEP_CUSTOM_T" data-r="KEEP_DATA_R" data-t="KEEP_DATA_T" \n\tt="s" \t />'
  );
  zipPrepA.file('xl/worksheets/sheet1.xml', xmlPrepA);
  const prepAWithSentinels = await zipPrepA.generateAsync({ type: 'uint8array' });

  const projA = buildSyntheticPartAProjection(4, { includeScores: true, includeSummary: true });
  const rendA = await renderSecuredSemanticValues(prepAWithSentinels, { partKey: 'A', projection: projA, profile });

  const zipBeforeA = await JSZip.loadAsync(prepAWithSentinels);
  const zipAfterA = await JSZip.loadAsync(rendA);

  // 1. Non-sheet1 ZIP entry byte equality
  const keysBeforeA = Object.keys(zipBeforeA.files).sort();
  const keysAfterA = Object.keys(zipAfterA.files).sort();
  assert.deepEqual(keysAfterA, keysBeforeA, 'Part A package entry inventory must be identical');

  for (const k of keysBeforeA) {
    if (k !== 'xl/worksheets/sheet1.xml') {
      const bytesBefore = await zipBeforeA.files[k].async('uint8array');
      const bytesAfter = await zipAfterA.files[k].async('uint8array');
      assert.deepEqual(bytesAfter, bytesBefore, `Part A package entry ${k} must be byte-equal`);
    }
  }

  // 2. Cell address inventory before vs after 100% equal (unprefixed r="ADDR" check)
  const xmlBeforeA = await zipBeforeA.files['xl/worksheets/sheet1.xml'].async('string');
  const xmlAfterA = await zipAfterA.files['xl/worksheets/sheet1.xml'].async('string');
  const addrsBeforeA = [...xmlBeforeA.matchAll(/<c\b[^>]*?(?<=[\s<])r="([A-Z0-9]+)"(?=[\s/>])/g)].map(m => m[1]);
  const addrsAfterA = [...xmlAfterA.matchAll(/<c\b[^>]*?(?<=[\s<])r="([A-Z0-9]+)"(?=[\s/>])/g)].map(m => m[1]);
  assert.deepEqual(addrsAfterA, addrsBeforeA, 'Cell address inventory must be 100% identical before vs after');

  // 3. Prove ALL FOUR collision sentinels AND deliberate whitespace (pre AND post t) survived byte-for-byte in rendered output
  const matchT26Rendered = xmlAfterA.match(/<c\b[^>]*?(?<=[\s<])r="T26"(?=[\s/>])[^>]*?>/);
  assert.notEqual(matchT26Rendered, null, 'Rendered T26 opening tag must exist');
  assert.equal(matchT26Rendered[0].includes('custom:r="KEEP_CUSTOM_R"'), true, 'custom:r sentinel must survive');
  assert.equal(matchT26Rendered[0].includes('custom:t="KEEP_CUSTOM_T"'), true, 'custom:t sentinel must survive');
  assert.equal(matchT26Rendered[0].includes('data-r="KEEP_DATA_R"'), true, 'data-r sentinel must survive');
  assert.equal(matchT26Rendered[0].includes('data-t="KEEP_DATA_T"'), true, 'data-t sentinel must survive');
  assert.equal(matchT26Rendered[0].includes('  r="T26" \t  s="385"'), true, 'Deliberate spaces/tabs before attributes must survive byte-for-byte');
  assert.equal(/\r?\n\tt="inlineStr" \t /.test(matchT26Rendered[0]), true, 'Deliberate newline/tab before and post-t whitespace after t attribute must survive byte-for-byte');

  // 4. Truly independent test oracle (scanner/splice based, zero-trim, no helper reuse)
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

  const findOracleNodeInfo = (xmlText, address) => {
    const tagPrefix = `r="${address}"`;
    let searchIdx = 0;
    while (searchIdx < xmlText.length) {
      const foundPos = xmlText.indexOf(tagPrefix, searchIdx);
      if (foundPos === -1) break;
      const nodeStart = xmlText.lastIndexOf('<c', foundPos);
      if (nodeStart !== -1 && nodeStart < foundPos) {
        const openEnd = xmlText.indexOf('>', foundPos);
        if (openEnd !== -1) {
          const isOpenSelfClosing = xmlText.substring(nodeStart, openEnd + 1).endsWith('/>');
          let nodeEnd = openEnd + 1;
          if (!isOpenSelfClosing) {
            const closeTagPos = xmlText.indexOf('</c>', openEnd);
            if (closeTagPos !== -1) {
              nodeEnd = closeTagPos + 4;
            }
          }
          const rawNode = xmlText.substring(nodeStart, nodeEnd);
          const rawOpenTag = rawNode.match(/^<c\b[^>]*?>/)[0];
          const isSelfClosing = rawOpenTag.endsWith('/>');
          const head = isSelfClosing ? rawOpenTag.slice(0, -2) : rawOpenTag.slice(0, -1);
          const tMatch = rawOpenTag.match(/(?<=\s|^)t="[^"]*"/);
          return { nodeStart, nodeEnd, rawNode, rawOpenTag, head, tMatch: tMatch ? tMatch[0] : null };
        }
      }
      searchIdx = foundPos + tagPrefix.length;
    }
    return null;
  };

  const oracleNormalizeXmlPair = (srcXml, rendXml, targetAddresses) => {
    let normSrc = srcXml;
    let normRend = rendXml;

    for (const address of targetAddresses) {
      const srcInfo = findOracleNodeInfo(normSrc, address);
      const rendInfo = findOracleNodeInfo(normRend, address);

      if (!srcInfo || !rendInfo) continue;

      let srcMaskedHead;
      let rendMaskedHead;

      if (srcInfo.tMatch) {
        srcMaskedHead = srcInfo.head.replace(srcInfo.tMatch, '');
        rendMaskedHead = rendInfo.tMatch ? rendInfo.head.replace(rendInfo.tMatch, '') : rendInfo.head;
      } else {
        srcMaskedHead = srcInfo.head;
        rendMaskedHead = rendInfo.tMatch ? rendInfo.head.replace(' t="inlineStr"', '') : rendInfo.head;
      }

      const normSrcNode = srcMaskedHead + '/>';
      const normRendNode = rendMaskedHead + '/>';

      normSrc = normSrc.substring(0, srcInfo.nodeStart) + normSrcNode + normSrc.substring(srcInfo.nodeEnd);
      normRend = normRend.substring(0, rendInfo.nodeStart) + normRendNode + normRend.substring(rendInfo.nodeEnd);
    }

    return { normSrc, normRend };
  };

  const { normSrc: oracleBeforeA, normRend: oracleAfterA } = oracleNormalizeXmlPair(xmlBeforeA, xmlAfterA, targetAddrsA);
  assert.equal(oracleAfterA, oracleBeforeA, 'Part A sheet1.xml must be 100% string-equal outside normalized target nodes according to independent oracle');

  // 5. R6-C Negative controls:
  // 5a. Independent oracle negative control (mutating 1 post-t whitespace byte in rendered XML)
  const xmlAfterAPerturbed = xmlAfterA.replace('\tt="inlineStr" \t ', '\tt="inlineStr" ');
  const { normSrc: nSrcP, normRend: nRendP } = oracleNormalizeXmlPair(xmlBeforeA, xmlAfterAPerturbed, targetAddrsA);
  assert.notEqual(nRendP, nSrcP, 'Independent oracle MUST detect 1-byte unauthorized whitespace mutation');

  // 5b. Production preservation path negative control (testing production comparator rejection on 1-byte whitespace mutation)
  const { normSrc: prodNormSrcP, normRendered: prodNormRendP } = normalizeTargetNodesForPreservation(xmlBeforeA, xmlAfterAPerturbed, targetAddrsA);
  assert.notEqual(prodNormRendP, prodNormSrcP, 'Production preservation check MUST fail closed when target XML whitespace is perturbed');
});

test('RENDERER_TEST_F: Real privacy & N7 + N8 canonical presentation / alias resistance proof', async () => {
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
    Competency_Count: { value: '8' },
    Comp1_SelfRating: { value: '5' },
    Comp1_ManagerRating: { value: 'TOP_SECRET_MGR_RATING' },
    PartB_Raw_Score: { value: '95.0' },
    PartB_Weighted_Score: { value: '95.0' }
  });

  // Competency items with canonical description AND conflicting raw aliases
  const competencyItemsWithAliases = [
    { code: 'COMP_1', description: 'Comp 1', name: 'ALIAS_NAME_1', title: 'ALIAS_TITLE_1', competencyName: 'ALIAS_COMP_1' },
    { code: 'COMP_2', description: 'Comp 2', name: 'ALIAS_NAME_2', title: 'ALIAS_TITLE_2', competencyName: 'ALIAS_COMP_2' },
    { code: 'COMP_3', description: 'Comp 3', name: 'ALIAS_NAME_3', title: 'ALIAS_TITLE_3', competencyName: 'ALIAS_COMP_3' },
    { code: 'COMP_4', description: 'Comp 4', name: 'ALIAS_NAME_4', title: 'ALIAS_TITLE_4', competencyName: 'ALIAS_COMP_4' },
    { code: 'COMP_5', description: 'Comp 5', name: 'ALIAS_NAME_5', title: 'ALIAS_TITLE_5', competencyName: 'ALIAS_COMP_5' },
    { code: 'COMP_6', description: 'Comp 6', name: 'ALIAS_NAME_6', title: 'ALIAS_TITLE_6', competencyName: 'ALIAS_COMP_6' },
    { code: 'COMP_LEAD', description: 'Canonical Lead Description 7', name: 'ALIAS_LEAD_NAME', title: 'ALIAS_LEAD_TITLE', competencyName: 'ALIAS_LEAD_COMP' },
    { code: 'COMP_STRAT', description: 'Canonical Strat Description 8', name: 'ALIAS_STRAT_NAME', title: 'ALIAS_STRAT_TITLE', competencyName: 'ALIAS_STRAT_COMP' }
  ];

  // 1. EMPLOYEE_SELF Projection
  const selfProj = MboExportService.projectCombinedExport({
    mboRecord: recordFixture,
    competencyItems: competencyItemsWithAliases,
    exportContext: { type: 'EMPLOYEE_SELF', employeeCode: 'EMP999' }
  });

  const templateA = loadLocalPartA();
  const templateB = loadLocalPartB();
  const prepA = await preparePartATemplate(templateA, { objectiveCount: 4 });
  const prepB8 = await preparePartBTemplate(templateB, { competencyCount: 8 });

  const rendSelfA = await renderSecuredSemanticValues(prepA, { partKey: 'A', projection: selfProj });
  const wbSelfA = await XlsxPopulate.fromDataAsync(rendSelfA);

  const rendSelfB = await renderSecuredSemanticValues(prepB8, { partKey: 'B', projection: selfProj });
  const wbSelfB = await XlsxPopulate.fromDataAsync(rendSelfB);

  // Assert canonical presentation text for N7 and N8
  assert.equal(wbSelfB.sheet(0).cell('B31').value(), '7. Leadership & People Management');
  assert.equal(wbSelfB.sheet(0).cell('B32').value(), 'Canonical Lead Description 7');
  assert.equal(wbSelfB.sheet(0).cell('B35').value(), '8. Strategy & Coaching');
  assert.equal(wbSelfB.sheet(0).cell('B36').value(), 'Canonical Strat Description 8');

  // Assert conflicting raw aliases DO NOT appear in rendered package
  for (const bytes of [rendSelfA, rendSelfB]) {
    const zip = await JSZip.loadAsync(bytes);
    for (const fName in zip.files) {
      if (fName.endsWith('.xml') || fName.endsWith('.rels')) {
        const text = await zip.files[fName].async('string');
        assert.equal(text.includes('ALIAS_LEAD_NAME'), false, `Alias ALIAS_LEAD_NAME forbidden in ${fName}`);
        assert.equal(text.includes('ALIAS_LEAD_TITLE'), false, `Alias ALIAS_LEAD_TITLE forbidden in ${fName}`);
        assert.equal(text.includes('ALIAS_STRAT_COMP'), false, `Alias ALIAS_STRAT_COMP forbidden in ${fName}`);
        assert.equal(text.includes('TOP_SECRET_MANAGER_COMMENT'), false, `Manager comment forbidden in ${fName}`);
        assert.equal(text.includes('S_GRADE_SECRET'), false, `Final grade forbidden in ${fName}`);
      }
    }
  }

  // 2. AUTHORIZED APPROVER Projection
  const dedicatedContext = { mode: 'DEDICATED', kintoneUserCode: 'MGR001' };
  const mockRecordWithAssignee = {
    ...recordFixture,
    Assignee: { type: 'STATUS_ASSIGNEE', value: [{ code: 'MGR001' }] }
  };

  const apprProj = MboExportService.projectCombinedExport({
    mboRecord: mockRecordWithAssignee,
    competencyItems: competencyItemsWithAliases,
    exportContext: { type: 'APPROVER', context: dedicatedContext }
  });

  const rendApprA = await renderSecuredSemanticValues(prepA, { partKey: 'A', projection: apprProj });
  const wbApprA = await XlsxPopulate.fromDataAsync(rendApprA);

  const rendApprB = await renderSecuredSemanticValues(prepB8, { partKey: 'B', projection: apprProj });
  const wbApprB = await XlsxPopulate.fromDataAsync(rendApprB);

  // SAFE values write for Approver
  assert.equal(wbApprA.sheet(0).cell('BC25').value(), 4.5);
  assert.equal(wbApprA.sheet(0).cell('BC29').value(), 88.0);
  assert.equal(wbApprB.sheet(0).cell('B39').value(), 95.0);

  // Raw aliases absent package-wide
  for (const bytes of [rendApprA, rendApprB]) {
    const zip = await JSZip.loadAsync(bytes);
    for (const fName in zip.files) {
      if (fName.endsWith('.xml') || fName.endsWith('.rels')) {
        const text = await zip.files[fName].async('string');
        assert.equal(text.includes('ALIAS_LEAD_NAME'), false);
        assert.equal(text.includes('ALIAS_STRAT_TITLE'), false);
        assert.equal(text.includes('TOP_SECRET_MANAGER_COMMENT'), false);
      }
    }
  }
});

test('RENDERER_TEST_G: XML 1.0 exact string validity & Unicode / emoji preservation proof', async () => {
  const templateA = loadLocalPartA();

  const projStringTest = {
    exportType: 'COMBINED_MBO_WORKBOOK_AND_PDF',
    partA: {
      objectivesCount: 4,
      header: {
        fiscalYear: ' 2026 ',
        employeeName: 'Jane Staff 🚀   ',
        department: '   ',
        section: 'Software & Technology <QA>',
        position: 'Senior "Lead" Engineer\'s Role',
        employeeCode: ' EMP001 '
      },
      hoshin: {
        departmentHoshinTitle: 'นวัตกรรมและเทคโนโลยี 2026 🌍',
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

  // Assert exact string preservation including whitespace, XML entities, Thai, and supplementary plane emoji
  assert.equal(sheetA.cell('N6').value(), ' 2026 ', 'Leading and trailing space must be preserved');
  assert.equal(sheetA.cell('AT7').value(), 'Jane Staff 🚀   ', 'Emoji and trailing space must be preserved');
  assert.equal(sheetA.cell('Z7').value(), '   ', 'Whitespace-only NONEMPTY string must be preserved');
  assert.equal(sheetA.cell('AG7').value(), 'Software & Technology <QA>', 'XML entities & < > must be preserved');
  assert.equal(sheetA.cell('BD7').value(), 'Senior "Lead" Engineer\'s Role', 'Quotes and apostrophes must be preserved');
  assert.equal(sheetA.cell('AQ7').value(), ' EMP001 ', 'Leading space must be preserved');
  assert.equal(sheetA.cell('G16').value(), 'นวัตกรรมและเทคโนโลยี 2026 🌍', 'Thai/Unicode string and emoji 🌍 must be preserved');

  // Check OOXML sheet1.xml contains xml:space="preserve" for preserved whitespace
  const zipA = await JSZip.loadAsync(rendA);
  const sheetXmlA = await zipA.files['xl/worksheets/sheet1.xml'].async('string');
  assert.equal(sheetXmlA.includes('xml:space="preserve"'), true, 'xml:space="preserve" must be present for whitespace strings');

  // Test invalid XML control characters fail closed (C0 control)
  const invalidControlProj = {
    ...projStringTest,
    partA: {
      ...projStringTest.partA,
      header: { ...projStringTest.partA.header, employeeName: 'Invalid\x05Control' }
    }
  };
  await assert.rejects(
    async () => {
      await renderSecuredSemanticValues(prepA, { partKey: 'A', projection: invalidControlProj });
    },
    (err) => err.message.includes('EXPORT_TEMPLATE_RENDERER_UNRESOLVED')
  );

  // Test lone high surrogate fails closed
  const loneHighSurrogateProj = {
    ...projStringTest,
    partA: {
      ...projStringTest.partA,
      header: { ...projStringTest.partA.header, employeeName: 'LoneHigh\uD800Surrogate' }
    }
  };
  await assert.rejects(
    async () => {
      await renderSecuredSemanticValues(prepA, { partKey: 'A', projection: loneHighSurrogateProj });
    },
    (err) => err.message.includes('EXPORT_TEMPLATE_RENDERER_UNRESOLVED')
  );

  // Test lone low surrogate fails closed
  const loneLowSurrogateProj = {
    ...projStringTest,
    partA: {
      ...projStringTest.partA,
      header: { ...projStringTest.partA.header, employeeName: 'LoneLow\uDC00Surrogate' }
    }
  };
  await assert.rejects(
    async () => {
      await renderSecuredSemanticValues(prepA, { partKey: 'A', projection: loneLowSurrogateProj });
    },
    (err) => err.message.includes('EXPORT_TEMPLATE_RENDERER_UNRESOLVED')
  );

  // Test non-characters U+FFFE and U+FFFF fail closed
  for (const nonChar of ['\uFFFE', '\uFFFF']) {
    const nonCharProj = {
      ...projStringTest,
      partA: {
        ...projStringTest.partA,
        header: { ...projStringTest.partA.header, employeeName: `NonChar${nonChar}Test` }
      }
    };
    await assert.rejects(
      async () => {
        await renderSecuredSemanticValues(prepA, { partKey: 'A', projection: nonCharProj });
      },
      (err) => err.message.includes('EXPORT_TEMPLATE_RENDERER_UNRESOLVED')
    );
  }

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
