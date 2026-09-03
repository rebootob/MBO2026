import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import XlsxPopulate from 'xlsx-populate';

import {
  preparePartBTemplate,
  computeSha256,
  deriveExpectedPartBMergeInventory
} from '../src/services/mbo-xlsx-template-preparer.js';
import {
  PART_B_TEMPLATE_SHA256,
  MboXlsxTemplateProfile,
  validateMappingIntegrity,
  expandRangeToAddresses
} from '../src/profiles/mbo-xlsx-template-profile.js';

const LOCAL_PART_B_PATH = path.join(process.cwd(), 'app info', 'data', 'PMS_Staff & Chief_PART_B.xlsx');

function loadLocalTemplate() {
  if (!fs.existsSync(LOCAL_PART_B_PATH)) {
    assert.fail(`Local Part B owner template file missing at ${LOCAL_PART_B_PATH}`);
  }
  const buf = fs.readFileSync(LOCAL_PART_B_PATH);
  const sha = crypto.createHash('sha256').update(buf).digest('hex');
  if (sha !== PART_B_TEMPLATE_SHA256) {
    assert.fail(`Local Part B owner template SHA mismatch: expected ${PART_B_TEMPLATE_SHA256}, got ${sha}`);
  }
  return new Uint8Array(buf);
}

test('PREPARER_PART_B_BROWSER_SAFE_DEPENDENCY_BOUNDARY: production source imports zero Node-only modules & no sentinels', () => {
  const preparerPath = path.join(process.cwd(), 'src', 'services', 'mbo-xlsx-template-preparer.js');
  const sourceCode = fs.readFileSync(preparerPath, 'utf8');

  assert.equal(/^import\s+fs/m.test(sourceCode), false, 'Must not import fs');
  assert.equal(/^import\s+path/m.test(sourceCode), false, 'Must not import path');
  assert.equal(/^import\s+crypto/m.test(sourceCode), false, 'Must not import crypto');
  assert.equal(/require\(['"]fs['"]\)/.test(sourceCode), false, 'Must not require fs');
  assert.equal(/require\(['"]path['"]\)/.test(sourceCode), false, 'Must not require path');
  assert.equal(/require\(['"]crypto['"]\)/.test(sourceCode), false, 'Must not require crypto');
  assert.equal(/mbo-xlsx-ooxml-feasibility/.test(sourceCode), false, 'Must not import feasibility script');
  assert.equal(/SENTINEL_ROW_31/.test(sourceCode), false, 'Must not contain proof sentinel');
});

test('PREPARER_PART_B_SYNTHETIC_FAIL_CLOSED_VALIDATION: validates SHA, counts, profile integrity & caller immutability', async () => {
  const fakeBytes = new Uint8Array(100).fill(65);
  const fakeCopy = new Uint8Array(fakeBytes);

  // 1. Wrong SHA fails closed before mutation
  await assert.rejects(
    async () => {
      await preparePartBTemplate(fakeBytes, { competencyCount: 6 });
    },
    (err) => err.message.includes('EXPORT_TEMPLATE_PREPARER_UNRESOLVED')
  );
  assert.deepEqual(fakeBytes, fakeCopy, 'Caller bytes must remain unchanged on failure');

  // 2. Invalid count domain fails closed
  await assert.rejects(
    async () => {
      await preparePartBTemplate(fakeBytes, { competencyCount: 5 });
    },
    (err) => err.message.includes('EXPORT_TEMPLATE_PREPARER_UNRESOLVED')
  );

  await assert.rejects(
    async () => {
      await preparePartBTemplate(fakeBytes, { competencyCount: 9 });
    },
    (err) => err.message.includes('EXPORT_TEMPLATE_PREPARER_UNRESOLVED')
  );

  await assert.rejects(
    async () => {
      await preparePartBTemplate(fakeBytes, { competencyCount: 6.5 });
    },
    (err) => err.message.includes('EXPORT_TEMPLATE_PREPARER_UNRESOLVED')
  );

  await assert.rejects(
    async () => {
      await preparePartBTemplate(fakeBytes, { competencyCount: '6' });
    },
    (err) => err.message.includes('EXPORT_TEMPLATE_PREPARER_UNRESOLVED')
  );

  // 3. Malformed profile fails closed via validateMappingIntegrity
  const badProfile = Object.create(new MboXlsxTemplateProfile());
  badProfile.getPartBLayoutTopology = function(n) {
    const l = MboXlsxTemplateProfile.prototype.getPartBLayoutTopology.call(this, n);
    return { ...l, dimension: 'A1:X99' };
  };

  await assert.rejects(
    async () => {
      await preparePartBTemplate(fakeBytes, { competencyCount: 6, profile: badProfile });
    },
    (err) => err.message.includes('EXPORT_TEMPLATE_PROFILE_UNRESOLVED') || err.message.includes('EXPORT_TEMPLATE_PREPARER_UNRESOLVED')
  );
});

function parseRowObjectsFromXml(sheetXml) {
  const map = new Map();
  const rMatches = [...sheetXml.matchAll(/<row r="(\d+)"([^>]*)>/g)];
  for (const m of rMatches) {
    const rNum = parseInt(m[1], 10);
    const rawAttrsStr = m[2];
    const attrPairs = [...rawAttrsStr.matchAll(/(\w+)="([^"]*)"/g)];
    const rowAttrs = {};
    for (const [, k, v] of attrPairs) {
      if (k !== 'r') rowAttrs[k] = v;
    }
    const rawTagEnd = sheetXml.indexOf('</row>', m.index);
    let rowBody = '';
    if (rawTagEnd !== -1 && (sheetXml.indexOf('<row ', m.index + 1) === -1 || sheetXml.indexOf('<row ', m.index + 1) > rawTagEnd)) {
      rowBody = sheetXml.substring(m.index + m[0].length, rawTagEnd);
    }
    const cells = [...rowBody.matchAll(/<c r="([A-Z]+)\d+"([^>]*)>/g)].map(cm => {
      const cellAttrsStr = cm[2];
      const cPairs = [...cellAttrsStr.matchAll(/(\w+)="([^"]*)"/g)];
      const rawAttrs = {};
      for (const [, k, v] of cPairs) {
        if (k !== 'r') rawAttrs[k] = v;
      }
      const cAttrs = { col: cm[1] };
      if (rawAttrs.s !== undefined) cAttrs.s = rawAttrs.s;
      if (rawAttrs.t !== undefined) cAttrs.t = rawAttrs.t;
      for (const k of Object.keys(rawAttrs).sort()) {
        if (k !== 'col' && k !== 's' && k !== 't') cAttrs[k] = rawAttrs[k];
      }
      return cAttrs;
    });

    map.set(rNum, {
      rNum,
      rowAttrs,
      cells
    });
  }
  return map;
}

function extractRowPayloadAuthority(sheetXml, rNum) {
  const rowMatch = sheetXml.match(new RegExp(`<row r="${rNum}"([^>]*)>([\\s\\S]*?)<\\/row>`));
  if (!rowMatch) return null;

  const rawAttrsStr = rowMatch[1];
  const bodyXml = rowMatch[2];

  const attrPairs = [...rawAttrsStr.matchAll(/(\w+)="([^"]*)"/g)];
  const rowAttrs = {};
  for (const [, k, v] of attrPairs) {
    if (k !== 'r') rowAttrs[k] = v;
  }

  const cells = [...bodyXml.matchAll(/<c r="([A-Z]+)\d+"([^>]*)>((?:(?!<c\b)[\s\S])*?)<\/c>|<c r="([A-Z]+)\d+"([^>]*)\/>/g)].map(cm => {
    if (cm[4] !== undefined) {
      // Self-closing cell
      const col = cm[4];
      const cellAttrsStr = cm[5];
      const rawAttrs = {};
      for (const [, k, v] of [...cellAttrsStr.matchAll(/(\w+)="([^"]*)"/g)]) {
        if (k !== 'r') rawAttrs[k] = v;
      }
      return { col, attrs: rawAttrs, payload: '' };
    } else {
      // Paired cell tag
      const col = cm[1];
      const cellAttrsStr = cm[2];
      const rawAttrs = {};
      for (const [, k, v] of [...cellAttrsStr.matchAll(/(\w+)="([^"]*)"/g)]) {
        if (k !== 'r') rawAttrs[k] = v;
      }
      const payload = cm[3];
      return { col, attrs: rawAttrs, payload };
    }
  });

  return { rNum, rowAttrs, cells };
}

async function buildPackageAuthority(wbZip) {
  const wbXml = await wbZip.files['xl/workbook.xml'].async('string');
  const sheetNames = [...wbXml.matchAll(/<sheet [^>]*name="([^"]+)"/g)].map(m => m[1]);
  const sheetStates = [...wbXml.matchAll(/<sheet [^>]*>/g)].map(m => {
    const tag = m[0];
    const stateMatch = tag.match(/state="([^"]+)"/);
    return stateMatch ? stateMatch[1] : 'visible';
  });

  const sheet1Xml = await wbZip.files['xl/worksheets/sheet1.xml'].async('string');
  const sheet2Xml = await wbZip.files['xl/worksheets/sheet2.xml'].async('string');

  const auxDimension = sheet2Xml.match(/<dimension [^>]*\/>/)?.[0] || null;

  const colsBlock = sheet1Xml.match(/<cols>[\s\S]*?<\/cols>/)?.[0] || null;
  const colsHash = colsBlock ? crypto.createHash('sha256').update(colsBlock).digest('hex') : null;
  const showGridLines = sheet1Xml.includes('showGridLines="1"') || !sheet1Xml.includes('showGridLines="0"');
  const pageMargins = sheet1Xml.match(/<pageMargins [^>]*\/>/)?.[0] || null;
  const paperSize = sheet1Xml.match(/paperSize="([^"]+)"/)?.[1] || null;
  const orientation = sheet1Xml.match(/orientation="([^"]+)"/)?.[1] || null;
  const scale = sheet1Xml.match(/scale="([^"]+)"/)?.[1] || null;
  const fitToPage = sheet1Xml.includes('fitToPage="1"');
  const horizontalCentered = sheet1Xml.includes('horizontalCentered="1"');
  const verticalCentered = sheet1Xml.includes('verticalCentered="1"');
  const sheetProtection = sheet1Xml.match(/<sheetProtection [^>]*\/>/)?.[0] || null;

  const sheetRelsFile = wbZip.files['xl/worksheets/_rels/sheet1.xml.rels'];
  const sheetRels = sheetRelsFile ? (await sheetRelsFile.async('string')).replace(/\r?\n/g, '') : null;

  const relationshipTuples = [];
  for (const fName in wbZip.files) {
    if (fName.endsWith('.rels')) {
      const relsXml = await wbZip.files[fName].async('string');
      const relMatches = [...relsXml.matchAll(/<Relationship\b[^>]*\/>/gi)];
      for (const rm of relMatches) {
        const tag = rm[0];
        const id = tag.match(/Id="([^"]+)"/)?.[1] || null;
        const type = tag.match(/Type="([^"]+)"/)?.[1] || null;
        const target = tag.match(/Target="([^"]+)"/)?.[1] || null;
        const targetMode = tag.match(/TargetMode="([^"]+)"/)?.[1] || null;
        relationshipTuples.push({ relsFilePath: fName, id, type, target, targetMode });
      }
    }
  }
  relationshipTuples.sort((a, b) => (a.relsFilePath + a.id).localeCompare(b.relsFilePath + b.id));

  const mediaInventory = Object.keys(wbZip.files).filter(f => f.startsWith('xl/media/')).sort();

  const formulaInventory = [];
  for (const fName in wbZip.files) {
    if (fName.startsWith('xl/worksheets/') && fName.endsWith('.xml')) {
      const sXml = await wbZip.files[fName].async('string');
      const fMatches = [...sXml.matchAll(/<f[^>]*>[\s\S]*?<\/f>/g)];
      for (const fm of fMatches) formulaInventory.push(fm[0]);
    }
  }

  return {
    sheetNames,
    sheetStates,
    auxDimension,
    colsHash,
    showGridLines,
    pageMargins,
    paperSize,
    orientation,
    scale,
    fitToPage,
    horizontalCentered,
    verticalCentered,
    sheetProtection,
    sheetRels,
    relationshipTuples,
    mediaInventory,
    formulaInventory
  };
}

function extractNonPrintAreaDefinedNames(wbXml) {
  return [...wbXml.matchAll(/<definedName (?!name="_xlnm\.Print_Area")[^>]*>[\s\S]*?<\/definedName>/g)].map(m => m[0]).sort();
}

test('PREPARER_PART_B_OWNER_TEMPLATE_INTEGRATION: N=6/7/8 complete proof matrix, deep row structural parity & frozen baseline matrix', async () => {
  const templateBytes = loadLocalTemplate();

  // Verify SHA matching via computeSha256
  const sha = await computeSha256(templateBytes);
  assert.equal(sha, PART_B_TEMPLATE_SHA256, `Owner Part B template SHA mismatch: expected ${PART_B_TEMPLATE_SHA256}, got ${sha}`);

  const profile = new MboXlsxTemplateProfile();

  // Parse exact OWNER SOURCE template directly into baseline objects
  const wbSource = await XlsxPopulate.fromDataAsync(templateBytes);
  const srcSheet1Xml = await wbSource._zip.files['xl/worksheets/sheet1.xml'].async('string');
  const srcSheet2Xml = await wbSource._zip.files['xl/worksheets/sheet2.xml'].async('string');
  const srcWbXml = await wbSource._zip.files['xl/workbook.xml'].async('string');

  // Exact SOURCE-derived row structural oracle
  const srcRowObjectsMap = parseRowObjectsFromXml(srcSheet1Xml);

  // Exact SOURCE-derived row 30 payload authority (R4)
  const srcRow30PayloadAuth = extractRowPayloadAuthority(srcSheet1Xml, 30);
  assert.notEqual(srcRow30PayloadAuth, null, 'SOURCE row 30 payload authority must exist');

  // Exact SOURCE-derived package authority object
  const srcPackageAuthority = await buildPackageAuthority(wbSource._zip);

  // Parse complete raw SOURCE merge inventory
  const srcMerges = [...srcSheet1Xml.matchAll(/<mergeCell ref="([A-Z0-9:]+)"\/>/g)].map(m => m[1]);
  assert.equal(srcMerges.length, 79, 'SOURCE merge count must be exactly 79');

  // Extract non-Print_Area defined names
  const srcNonPrintAreaDefinedNames = extractNonPrintAreaDefinedNames(srcWbXml);

  // Collect sensitive string tokens ONLY from exact SOURCE addresses covered by effective sanitization ranges
  const baseLayout = profile.getPartBLayoutTopology(6);
  const sheetSource = wbSource.sheet(0);
  const sensitiveTokens = [];
  const sensitiveAddrs = baseLayout.effectiveSanitizationRanges.flatMap(r => expandRangeToAddresses(r));
  for (const addr of sensitiveAddrs) {
    const val = sheetSource.cell(addr).value();
    if (val && typeof val === 'string' && val.trim().length >= 2) {
      sensitiveTokens.push(val.trim());
    }
  }

  const srcAppXml = await wbSource._zip.files['docProps/app.xml'].async('string');
  const srcDateInAppCount = (srcAppXml.match(/Date/g) || []).length;

  for (const n of [6, 7, 8]) {
    const callerCopy = new Uint8Array(templateBytes);

    const preparedBytes = await preparePartBTemplate(templateBytes, { competencyCount: n, profile });

    // 1. Output is Uint8Array and new reference
    assert.equal(preparedBytes instanceof Uint8Array, true);
    assert.notEqual(preparedBytes, templateBytes);

    // 2. Caller bytes unchanged on success
    assert.deepEqual(templateBytes, callerCopy, 'Caller bytes must remain 100% unchanged on success');

    // 3. Inspect prepared workbook OOXML
    const wb = await XlsxPopulate.fromDataAsync(preparedBytes);

    // Sheet1 XML inspection
    const sheetXml = await wb._zip.files['xl/worksheets/sheet1.xml'].async('string');

    // A. No proof sentinel injected
    assert.equal(sheetXml.includes('SENTINEL_ROW_31'), false, 'Must not contain proof sentinel');

    // B. Dimension tag ref exact A1:X(35+extraRows)
    const extraBlocks = n - 6;
    const extraRows = 4 * extraBlocks;
    const expectedLastRow = 35 + extraRows;
    const expectedDimRef = `A1:X${expectedLastRow}`;
    assert.equal(sheetXml.includes(`dimension ref="${expectedDimRef}"`), true, `Dimension ref must be ${expectedDimRef} for N=${n}`);

    // C. Print_Area definedName exact in xl/workbook.xml
    const wbXml = await wb._zip.files['xl/workbook.xml'].async('string');
    const expectedPrintArea = `'(Part B) Competency'!$A$1:$X$${expectedLastRow}`;
    assert.equal(wbXml.includes(expectedPrintArea), true, `Print_Area must be ${expectedPrintArea} for N=${n}`);

    // D. Absolute Page Setup Authority: paperSize="9", orientation="portrait", scale="75", horizontalCentered="1", sheetProtection present
    assert.equal(sheetXml.includes('paperSize="9"'), true, `paperSize="9" must be explicitly present for N=${n}`);
    assert.equal(sheetXml.includes('orientation="portrait"'), true, `orientation="portrait" must be explicitly present for N=${n}`);
    assert.equal(sheetXml.includes('scale="75"'), true, `scale="75" must be explicitly present for N=${n}`);
    assert.equal(sheetXml.includes('horizontalCentered="1"'), true, `horizontalCentered="1" must be present for N=${n}`);
    assert.equal(sheetXml.includes('<sheetProtection'), true, `sheetProtection tag must be present for N=${n}`);

    // E. One Complete SOURCE-Derived Frozen Metadata/Package Authority Object Deep Equality
    const outPackageAuthority = await buildPackageAuthority(wb._zip);
    assert.deepEqual(outPackageAuthority, srcPackageAuthority, `Complete package authority object must deep equal SOURCE authority for N=${n}`);

    // Auxiliary Sheet1 Full Fingerprint Parity
    const outSheet2Xml = await wb._zip.files['xl/worksheets/sheet2.xml'].async('string');
    assert.equal(outSheet2Xml, srcSheet2Xml, `Auxiliary Sheet1 XML must match SOURCE fingerprint for N=${n}`);

    // Non-Print_Area Defined Names Parity
    const outNonPrintAreaDefinedNames = extractNonPrintAreaDefinedNames(wbXml);
    assert.deepEqual(outNonPrintAreaDefinedNames, srcNonPrintAreaDefinedNames, `Non-Print_Area defined names must match SOURCE baseline for N=${n}`);

    // F. Complete SOURCE-Derived Row Structural Parity Inspection (NO CELL FILTERING OF ANY KIND)
    const outRowObjectsMap = parseRowObjectsFromXml(sheetXml);
    const rowRefs = Array.from(outRowObjectsMap.keys()).sort((a, b) => a - b);
    assert.equal(rowRefs.length, expectedLastRow, `Row count must equal ${expectedLastRow} for N=${n}`);
    assert.equal(new Set(rowRefs).size, rowRefs.length, 'rowRefs sequence must be strictly unique');

    // 1. Rows 1:30 Exact SOURCE-Derived Structural Deep Equality (NO CELL FILTERING)
    for (let r = 1; r <= 30; r++) {
      const srcObj = srcRowObjectsMap.get(r);
      const outObj = outRowObjectsMap.get(r);
      assert.equal(Boolean(outObj), true, `Output row ${r} must exist`);
      assert.deepEqual(outObj.rowAttrs, srcObj.rowAttrs, `Row ${r} attributes must deep equal SOURCE baseline for N=${n}`);
      assert.deepEqual(outObj.cells, srcObj.cells, `Row ${r} cell structural inventory must deep equal SOURCE baseline for N=${n}`);
    }

    // 2. Inserted Rows (31..30+extraRows) Exact SOURCE-Derived Structural Deep Equality (cloned from SOURCE rows 27:30)
    for (let b = 1; b <= extraBlocks; b++) {
      const offset = 4 * b;
      for (let srcR = 27; srcR <= 30; srcR++) {
        const targetR = srcR + offset;
        const srcBlockObj = srcRowObjectsMap.get(srcR);
        const outClonedObj = outRowObjectsMap.get(targetR);
        assert.equal(Boolean(outClonedObj), true, `Inserted row ${targetR} must exist`);
        assert.deepEqual(outClonedObj.rowAttrs, srcBlockObj.rowAttrs, `Inserted row ${targetR} attributes must deep equal SOURCE row ${srcR} for N=${n}`);
        assert.deepEqual(outClonedObj.cells, srcBlockObj.cells, `Inserted row ${targetR} cell structural inventory must deep equal SOURCE row ${srcR} for N=${n}`);
      }
    }

    // 3. Downstream Relocated Rows (31..35) Exact SOURCE-Derived Structural Deep Equality
    for (let r = 31; r <= 35; r++) {
      const targetR = r + extraRows;
      const srcDownstreamObj = srcRowObjectsMap.get(r);
      const outRelocatedObj = outRowObjectsMap.get(targetR);
      assert.equal(Boolean(outRelocatedObj), true, `Relocated downstream row ${targetR} must exist`);
      assert.deepEqual(outRelocatedObj.rowAttrs, srcDownstreamObj.rowAttrs, `Relocated row ${targetR} attributes must deep equal SOURCE row ${r} for N=${n}`);
      assert.deepEqual(outRelocatedObj.cells, srcDownstreamObj.cells, `Relocated row ${targetR} cell structural inventory must deep equal SOURCE row ${r} for N=${n}`);
    }

    // G. BLOCKER B (R3): Explicit Intermediate Merge Test Proof & Final Merge Inventory Deep Equality Proof
    const layoutN = profile.getPartBLayoutTopology(n);

    // Derive SOURCE expected intermediate and final merge inventories directly via pure helper
    const expectedIntermediateMerges = deriveExpectedPartBMergeInventory(srcMerges, n, false);
    const expectedFinalMerges = deriveExpectedPartBMergeInventory(srcMerges, n, true);

    // Assert expected intermediate merge count equals 79/85/91
    assert.equal(expectedIntermediateMerges.length, layoutN.intermediateMergeCount, `Expected intermediate merge count must equal ${layoutN.intermediateMergeCount} for N=${n}`);

    // Derive observable intermediate candidate from actual final output by removing ONLY exact authorized presentation title overlays
    const actualMerges = [...sheetXml.matchAll(/<mergeCell ref="([A-Z0-9:]+)"\/>/g)].map(m => m[1]);

    const actualIntermediateCandidate = [...actualMerges];
    if (n >= 7) {
      const idx = actualIntermediateCandidate.indexOf('B31:J31');
      if (idx !== -1) actualIntermediateCandidate.splice(idx, 1);
    }
    if (n === 8) {
      const idx = actualIntermediateCandidate.indexOf('B35:J35');
      if (idx !== -1) actualIntermediateCandidate.splice(idx, 1);
    }
    actualIntermediateCandidate.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    // Requirement B: Explicit intermediate merge candidate deep equality
    assert.deepEqual(actualIntermediateCandidate, expectedIntermediateMerges, `Observable intermediate merge candidate must deep equal SOURCE-derived expected intermediate inventory for N=${n}`);
    assert.equal(actualIntermediateCandidate.length, layoutN.intermediateMergeCount, `Intermediate merge candidate count must equal ${layoutN.intermediateMergeCount} for N=${n}`);

    // Actual final merges comparison
    const actualSortedFinalMerges = [...actualMerges].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    assert.deepEqual(actualSortedFinalMerges, expectedFinalMerges, `Complete final merge inventory must deep equal SOURCE-derived expected inventory for N=${n}`);

    // Declared count attribute equals actual inventory length
    const countAttr = sheetXml.match(/<mergeCells count="(\d+)">/)?.[1];
    assert.equal(countAttr, String(actualMerges.length), 'Declared merge count attr must equal actual merge array length');
    assert.equal(actualMerges.length, layoutN.finalOverlayMergeCount, `Merge count must equal expected final count ${layoutN.finalOverlayMergeCount} for N=${n}`);

    // Zero duplicate merge refs
    assert.equal(new Set(actualMerges).size, actualMerges.length, 'Output merge refs sequence must contain zero duplicates');

    // Prove original rows 1:30 SOURCE merge refs preserved
    const actualMergeSet = new Set(actualMerges);
    for (const mRef of srcMerges) {
      const r1 = parseInt(mRef.split(':')[0].match(/\d+/)[0], 10);
      if (r1 < 31) {
        assert.equal(actualMergeSet.has(mRef), true, `Original SOURCE merge ${mRef} must be preserved in output for N=${n}`);
      }
    }

    // H. BLOCKER A (R3): Exact Protected Rating Scale Header OWNER-SOURCE Value, Type, and Structure Parity
    const outSheet = wb.sheet(0);
    const srcSheet = wbSource.sheet(0);

    for (const rangeStr of layoutN.ratingScaleStaticRanges) {
      assert.equal(actualMergeSet.has(rangeStr), true, `Rating Scale merge ${rangeStr} must be present for N=${n}`);

      // Prove Rating Scale merges are exact 1-row height and NOT stretched
      const [start, end] = rangeStr.split(':');
      const r1 = parseInt(start.match(/\d+/)[0], 10);
      const r2 = parseInt(end.match(/\d+/)[0], 10);
      assert.equal(r1, r2, `Rating Scale merge ${rangeStr} must be a 1-row merge, not stretched`);

      // Prove exact cell value/type parity for protected Rating Scale cells directly against OWNER SOURCE
      const addrs = expandRangeToAddresses(rangeStr);
      for (const addr of addrs) {
        const col = addr.match(/^[A-Z]+/)[0];
        const srcAddr = `${col}29`; // SOURCE Rating Scale header row is row 29
        const srcVal = srcSheet.cell(srcAddr).value();
        const outVal = outSheet.cell(addr).value();
        assert.deepEqual(outVal, srcVal, `Protected Rating Scale cell ${addr} value/type must deep equal OWNER SOURCE cell ${srcAddr} for N=${n}`);
      }
    }

    // H2. R4 PROTECTED PADDING OWNER-SOURCE PAYLOAD PROOF
    for (const rowNum of layoutN.protectedPaddingRows) {
      const rowObj = outRowObjectsMap.get(rowNum);
      assert.equal(Boolean(rowObj), true, `Protected padding row ${rowNum} must exist for N=${n}`);

      const outRowPayloadAuth = extractRowPayloadAuthority(sheetXml, rowNum);
      assert.notEqual(outRowPayloadAuth, null, `Extracted payload authority for row ${rowNum} must exist for N=${n}`);

      // 1. Row structural attributes deep equal SOURCE row 30
      assert.deepEqual(outRowPayloadAuth.rowAttrs, srcRow30PayloadAuth.rowAttrs, `Padding row ${rowNum} attributes must deep equal SOURCE row 30 attributes for N=${n}`);

      // 2. Exact cell inventory count equals SOURCE row 30
      assert.equal(outRowPayloadAuth.cells.length, srcRow30PayloadAuth.cells.length, `Padding row ${rowNum} cell inventory count must equal SOURCE row 30 for N=${n}`);

      // 3. Cell structural attributes and exact OOXML payload parity for every materialized cell
      for (let i = 0; i < srcRow30PayloadAuth.cells.length; i++) {
        const srcCell = srcRow30PayloadAuth.cells[i];
        const outCell = outRowPayloadAuth.cells[i];

        assert.equal(outCell.col, srcCell.col, `Cell ${i} column must match for N=${n} row ${rowNum}`);
        assert.deepEqual(outCell.attrs, srcCell.attrs, `Cell ${srcCell.col}${rowNum} attrs must deep equal SOURCE cell ${srcCell.col}30 attrs for N=${n}`);
        assert.deepEqual(outCell.payload, srcCell.payload, `Cell ${srcCell.col}${rowNum} OOXML payload must deep equal SOURCE cell ${srcCell.col}30 payload for N=${n}`);

        // 4. Exact decoded cell value deep equal SOURCE cell
        const srcVal = srcSheet.cell(`${srcCell.col}30`).value();
        const outVal = outSheet.cell(`${srcCell.col}${rowNum}`).value();
        assert.deepEqual(outVal, srcVal, `Decoded cell value ${srcCell.col}${rowNum} must deep equal SOURCE cell ${srcCell.col}30 for N=${n}`);
      }
    }

    // I. Effective sanitization ranges cleared & Package-wide Privacy Proof
    const sensitiveAddrsN = layoutN.effectiveSanitizationRanges.flatMap(r => expandRangeToAddresses(r));
    assert.equal(sensitiveAddrsN.length, layoutN.effectiveDynamicCount, `Sanitization address count must equal ${layoutN.effectiveDynamicCount} for N=${n}`);

    for (const addr of sensitiveAddrsN) {
      const val = outSheet.cell(addr).value();
      assert.equal(val == null || val === '', true, `Sanitized cell ${addr} must be cleared/null/undefined/empty for N=${n}`);
    }

    // Presentation targets cleared (B31:J32 for N>=7, B35:J36 for N=8)
    if (n >= 7) {
      for (const addr of expandRangeToAddresses('B31:J32')) {
        const val = outSheet.cell(addr).value();
        assert.equal(val == null || val === '', true, `Presentation target cell ${addr} must be cleared for N=${n}`);
      }
    }
    if (n === 8) {
      for (const addr of expandRangeToAddresses('B35:J36')) {
        const val = outSheet.cell(addr).value();
        assert.equal(val == null || val === '', true, `Presentation target cell ${addr} must be cleared for N=${n}`);
      }
    }

    // Package-wide scanning across all relevant UTF-8 XML/text package entries
    for (const fName in wb._zip.files) {
      if (fName.endsWith('.xml') || fName.endsWith('.rels')) {
        const textContent = await wb._zip.files[fName].async('string');
        for (const token of sensitiveTokens) {
          if (token === 'Date' && fName === 'docProps/app.xml') {
            const outDateCount = (textContent.match(/Date/g) || []).length;
            assert.equal(outDateCount, srcDateInAppCount, `Date count in docProps/app.xml must equal SOURCE baseline for N=${n}`);
            continue;
          }
          assert.equal(textContent.includes(token), false, `Sensitive token ${JSON.stringify(token)} must be absent from ${fName} for N=${n}`);
        }
      }
    }

    // J. BLOCKER C: Actual Profile-Derived Semantic-Target No-Write Proof
    const mappingsN = profile.getPartBMappings(n);

    // Header dynamic target anchors from Profile
    for (const key in mappingsN.header) {
      const hAddr = mappingsN.header[key];
      const val = outSheet.cell(hAddr).value();
      assert.equal(val == null || val === '', true, `Header target ${key} at ${hAddr} must be unwritten for N=${n}`);
    }

    // Every competency SELF_RATING target anchor from Profile
    for (let b = 1; b <= n; b++) {
      const compItem = mappingsN.competencies[b - 1];
      const sAddr = compItem.SELF_RATING;
      const val = outSheet.cell(sAddr).value();
      assert.equal(val == null || val === '', true, `Competency ${b} Self Rating at ${sAddr} must be unwritten for N=${n}`);

      // TITLE / DESCRIPTION anchors for b7/b8 if present
      if (compItem.TITLE) {
        const tVal = outSheet.cell(compItem.TITLE).value();
        assert.equal(tVal == null || tVal === '', true, `Competency ${b} Title at ${compItem.TITLE} must be unwritten for N=${n}`);
      }
      if (compItem.DESCRIPTION) {
        const dVal = outSheet.cell(compItem.DESCRIPTION).value();
        assert.equal(dVal == null || dVal === '', true, `Competency ${b} Description at ${compItem.DESCRIPTION} must be unwritten for N=${n}`);
      }
    }

    // Summary write anchors from Profile
    for (const key in mappingsN.summary) {
      if (key === 'startRow' || key === 'endRow') continue;
      const sumAddr = mappingsN.summary[key];
      const val = outSheet.cell(sumAddr).value();
      assert.equal(val == null || val === '', true, `Summary target ${key} at ${sumAddr} must be unwritten for N=${n}`);
    }
  }
});
