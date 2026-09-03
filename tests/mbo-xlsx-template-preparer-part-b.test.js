import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import XlsxPopulate from 'xlsx-populate';

import {
  preparePartBTemplate,
  computeSha256
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

function deriveExpectedMergeInventory(srcMergesList, competencyCount, includeTitleOverlay = false) {
  const extraBlocks = competencyCount - 6;
  const extraRows = 4 * extraBlocks;

  const result = [];
  for (const mRef of srcMergesList) {
    const [start, end] = mRef.split(':');
    const col1 = start.match(/^[A-Z]+/)[0];
    const r1 = parseInt(start.match(/\d+/)[0], 10);
    const col2 = end.match(/^[A-Z]+/)[0];
    const r2 = parseInt(end.match(/\d+/)[0], 10);

    if (r1 < 31 && r2 < 31) {
      result.push(`${col1}${r1}:${col2}${r2}`);
    } else if (r1 >= 31 && r2 >= 31) {
      result.push(`${col1}${r1 + extraRows}:${col2}${r2 + extraRows}`);
    } else {
      throw new Error(`Crossing merge ref: ${mRef}`);
    }
  }

  const sourceBlockMerges = [
    'B28:J28', 'K28:Q28', 'R28:W28',
    'B29:J29', 'K29:Q29', 'R29:W29'
  ];

  for (let b = 1; b <= extraBlocks; b++) {
    const offset = 4 * b;
    for (const mRef of sourceBlockMerges) {
      const [start, end] = mRef.split(':');
      const col1 = start.match(/^[A-Z]+/)[0];
      const r1 = parseInt(start.match(/\d+/)[0], 10) + offset;
      const col2 = end.match(/^[A-Z]+/)[0];
      const r2 = parseInt(end.match(/\d+/)[0], 10) + offset;
      result.push(`${col1}${r1}:${col2}${r2}`);
    }
  }

  if (includeTitleOverlay) {
    if (competencyCount >= 7) result.push('B31:J31');
    if (competencyCount === 8) result.push('B35:J35');
  }

  return result.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
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

    // G. BLOCKER B: SOURCE-Derived Intermediate & Final Merge Inventory Deep Equality Proof
    const layoutN = profile.getPartBLayoutTopology(n);

    // Derive SOURCE expected intermediate and final merge inventories
    const expectedIntermediateMerges = deriveExpectedMergeInventory(srcMerges, n, false);
    const expectedFinalMerges = deriveExpectedMergeInventory(srcMerges, n, true);

    // Actual output merges from sheetXml
    const actualMerges = [...sheetXml.matchAll(/<mergeCell ref="([A-Z0-9:]+)"\/>/g)].map(m => m[1]);
    const actualSortedFinalMerges = [...actualMerges].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    // DeepEqual actual final merge inventory to expected final merge inventory
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

    // H. Protected Rating Scale & Padding Parity (BLOCKER D & E)
    for (const rowNum of layoutN.protectedPaddingRows) {
      const rowObj = outRowObjectsMap.get(rowNum);
      assert.equal(Boolean(rowObj), true, `Protected padding row ${rowNum} must exist for N=${n}`);
    }
    for (const rangeStr of layoutN.ratingScaleStaticRanges) {
      assert.equal(actualMergeSet.has(rangeStr), true, `Rating Scale merge ${rangeStr} must be present for N=${n}`);

      // Prove Rating Scale merges are exact 1-row height and NOT stretched
      const [start, end] = rangeStr.split(':');
      const r1 = parseInt(start.match(/\d+/)[0], 10);
      const r2 = parseInt(end.match(/\d+/)[0], 10);
      assert.equal(r1, r2, `Rating Scale merge ${rangeStr} must be a 1-row merge, not stretched`);

      const addrs = expandRangeToAddresses(rangeStr);
      for (const addr of addrs) {
        const val = wb.sheet(0).cell(addr).value();
        assert.notEqual(val, null, `Protected Rating Scale cell ${addr} must not be cleared for N=${n}`);
      }
    }

    // I. Effective sanitization ranges cleared & Package-wide Privacy Proof
    const sheet = wb.sheet(0);
    const sensitiveAddrsN = layoutN.effectiveSanitizationRanges.flatMap(r => expandRangeToAddresses(r));
    assert.equal(sensitiveAddrsN.length, layoutN.effectiveDynamicCount, `Sanitization address count must equal ${layoutN.effectiveDynamicCount} for N=${n}`);

    for (const addr of sensitiveAddrsN) {
      const val = sheet.cell(addr).value();
      assert.equal(val == null || val === '', true, `Sanitized cell ${addr} must be cleared/null/undefined/empty for N=${n}`);
    }

    // Presentation targets cleared (B31:J32 for N>=7, B35:J36 for N=8)
    if (n >= 7) {
      for (const addr of expandRangeToAddresses('B31:J32')) {
        const val = sheet.cell(addr).value();
        assert.equal(val == null || val === '', true, `Presentation target cell ${addr} must be cleared for N=${n}`);
      }
    }
    if (n === 8) {
      for (const addr of expandRangeToAddresses('B35:J36')) {
        const val = sheet.cell(addr).value();
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

    // J. Actual Semantic-Target No-Write Proof (BLOCKER E)
    // Header dynamic targets
    for (const hAddr of ['G2', 'H2', 'J3', 'L3', 'M3', 'O3', 'P3', 'Q3', 'R3', 'S3', 'W3']) {
      const val = sheet.cell(hAddr).value();
      assert.equal(val == null || val === '', true, `Header target ${hAddr} must be unwritten for N=${n}`);
    }
    // Competency self-ratings
    for (let b = 1; b <= n; b++) {
      let selfRatingAddr;
      if (b <= 6) {
        selfRatingAddr = `R${6 + b}`;
      } else if (b === 7) {
        selfRatingAddr = 'R31';
      } else if (b === 8) {
        selfRatingAddr = 'R35';
      }
      const val = sheet.cell(selfRatingAddr).value();
      assert.equal(val == null || val === '', true, `Competency ${b} Self Rating at ${selfRatingAddr} must be unwritten for N=${n}`);
    }
    // Part B Summary score table targets
    const sumStart = 31 + extraRows;
    const sumEnd = sumStart + 3;
    for (const sRange of [`B${sumStart}:D${sumEnd}`, `E${sumStart}:H${sumEnd}`, `I${sumStart}:P${sumEnd}`, `Q${sumStart}:S${sumEnd}`, `T${sumStart}:X${sumEnd}`]) {
      for (const addr of expandRangeToAddresses(sRange)) {
        const val = sheet.cell(addr).value();
        assert.equal(val == null || val === '', true, `Part B Summary cell ${addr} must be unwritten for N=${n}`);
      }
    }
  }
});
