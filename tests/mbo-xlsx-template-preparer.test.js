import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import XlsxPopulate from 'xlsx-populate';

import {
  preparePartATemplate,
  computeSha256,
  validateAndRemoveReferenceImage
} from '../src/services/mbo-xlsx-template-preparer.js';
import {
  PART_A_TEMPLATE_SHA256,
  MboXlsxTemplateProfile,
  validateMappingIntegrity,
  expandRangeToAddresses
} from '../src/profiles/mbo-xlsx-template-profile.js';

const LOCAL_PART_A_PATH = path.join(process.cwd(), 'app info', 'data', 'PMS_Staff & Chief_PART_A.xlsx');

function loadLocalTemplate() {
  if (!fs.existsSync(LOCAL_PART_A_PATH)) {
    return null;
  }
  const buf = fs.readFileSync(LOCAL_PART_A_PATH);
  const sha = crypto.createHash('sha256').update(buf).digest('hex');
  if (sha !== PART_A_TEMPLATE_SHA256) {
    return null;
  }
  return new Uint8Array(buf);
}

test('PREPARER_BROWSER_SAFE_DEPENDENCY_BOUNDARY: production source imports zero Node-only modules & no sentinels', () => {
  const preparerPath = path.join(process.cwd(), 'src', 'services', 'mbo-xlsx-template-preparer.js');
  const sourceCode = fs.readFileSync(preparerPath, 'utf8');

  assert.equal(/^import\s+fs/m.test(sourceCode), false, 'Must not import fs');
  assert.equal(/^import\s+path/m.test(sourceCode), false, 'Must not import path');
  assert.equal(/^import\s+crypto/m.test(sourceCode), false, 'Must not import crypto');
  assert.equal(/require\(['"]fs['"]\)/.test(sourceCode), false, 'Must not require fs');
  assert.equal(/require\(['"]path['"]\)/.test(sourceCode), false, 'Must not require path');
  assert.equal(/require\(['"]crypto['"]\)/.test(sourceCode), false, 'Must not require crypto');
  assert.equal(/mbo-xlsx-ooxml-feasibility/.test(sourceCode), false, 'Must not import feasibility script');
  assert.equal(/SENTINEL_ROW_29/.test(sourceCode), false, 'Must not contain proof sentinel');
});

test('PREPARER_SYNTHETIC_FAIL_CLOSED_VALIDATION: validates SHA, counts, profile integrity & caller immutability', async () => {
  const fakeBytes = new Uint8Array(100).fill(65);
  const fakeCopy = new Uint8Array(fakeBytes);

  // 1. Wrong SHA fails closed before mutation
  await assert.rejects(
    async () => {
      await preparePartATemplate(fakeBytes, { objectiveCount: 4 });
    },
    (err) => err.message.includes('EXPORT_TEMPLATE_PREPARER_UNRESOLVED')
  );
  assert.deepEqual(fakeBytes, fakeCopy, 'Caller bytes must remain unchanged on failure');

  // 2. Invalid count domain fails closed
  await assert.rejects(
    async () => {
      await preparePartATemplate(fakeBytes, { objectiveCount: 3 });
    },
    (err) => err.message.includes('EXPORT_TEMPLATE_PREPARER_UNRESOLVED')
  );

  await assert.rejects(
    async () => {
      await preparePartATemplate(fakeBytes, { objectiveCount: 11 });
    },
    (err) => err.message.includes('EXPORT_TEMPLATE_PREPARER_UNRESOLVED')
  );

  await assert.rejects(
    async () => {
      await preparePartATemplate(fakeBytes, { objectiveCount: 4.5 });
    },
    (err) => err.message.includes('EXPORT_TEMPLATE_PREPARER_UNRESOLVED')
  );

  await assert.rejects(
    async () => {
      await preparePartATemplate(fakeBytes, { objectiveCount: '4' });
    },
    (err) => err.message.includes('EXPORT_TEMPLATE_PREPARER_UNRESOLVED')
  );

  // 3. Malformed profile fails closed via validateMappingIntegrity
  const badProfile = Object.create(new MboXlsxTemplateProfile());
  badProfile.getPartALayoutTopology = function(n) {
    const l = MboXlsxTemplateProfile.prototype.getPartALayoutTopology.call(this, n);
    return { ...l, dimension: 'A1:BL99' };
  };

  await assert.rejects(
    async () => {
      await preparePartATemplate(fakeBytes, { objectiveCount: 4, profile: badProfile });
    },
    (err) => err.message.includes('EXPORT_TEMPLATE_PROFILE_UNRESOLVED') || err.message.includes('EXPORT_TEMPLATE_PREPARER_UNRESOLVED')
  );

  // Assert direct validateMappingIntegrity fail closed for same-count topology substitution
  const badSubstProfile = Object.create(new MboXlsxTemplateProfile());
  badSubstProfile.getPartALayoutTopology = function(n) {
    const l = MboXlsxTemplateProfile.prototype.getPartALayoutTopology.call(this, n);
    if (n === 4) {
      const eff = [...l.effectiveSanitizationRanges];
      eff[1] = 'Z99:AF99';
      return { ...l, effectiveSanitizationRanges: Object.freeze(eff) };
    }
    return l;
  };
  assert.throws(
    () => validateMappingIntegrity(badSubstProfile),
    /EXPORT_TEMPLATE_PROFILE_UNRESOLVED/
  );
});

test('PREPARER_ADVERSARIAL_REFERENCE_IMAGE_FAIL_CLOSED: reachable production helper rejects all reference anomalies directly', () => {
  const drawingXmlPath = 'xl/drawings/drawing1.xml';
  const drawingRelsPath = 'xl/drawings/_rels/drawing1.xml.rels';
  const mediaPath = 'xl/media/image3.png';

  const validRels = `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image1.jpeg"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image2.jpeg"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image3.png"/><Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image4.png"/></Relationships>`;
  const validXml = `<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><xdr:twoCellAnchor><xdr:from><xdr:col>0</xdr:col></xdr:from><a:blip r:embed="rId3"/></xdr:twoCellAnchor></xdr:wsDr>`;

  const createZip = (rels, xml, hasMedia = true) => ({
    [drawingXmlPath]: xml,
    [drawingRelsPath]: rels,
    [mediaPath]: hasMedia ? true : null
  });

  // 1. Valid canonical self-closing rId3 tuple -> PASS
  const validRes = validateAndRemoveReferenceImage(createZip(validRels, validXml, true));
  assert.equal(validRes.mediaToRemove, mediaPath);
  assert.equal(validRes.updatedDrawingRels.includes('rId3'), false);
  assert.equal(validRes.updatedDrawingXml.includes('rId3'), false);

  // 2. Missing rId3 relationship -> REJECT
  const noRel = validRels.replace(/<Relationship[^>]*Id="rId3"[^>]*\/>/, '');
  assert.throws(
    () => validateAndRemoveReferenceImage(createZip(noRel, validXml)),
    /Missing rId3 relationship/
  );

  // 3. Valid rId3 + non-self-closing duplicate rId3 -> REJECT
  const nonSelfClosingDupRel = validRels.replace('</Relationships>', '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image3.png"></Relationship></Relationships>');
  assert.throws(
    () => validateAndRemoveReferenceImage(createZip(nonSelfClosingDupRel, validXml)),
    /Expected exactly 1 canonical rId3 relationship/
  );

  // 4. Malformed / open-only rId3 -> REJECT
  const openOnlyRel = validRels.replace(/<Relationship[^>]*Id="rId3"[^>]*\/>/, '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image3.png">');
  assert.throws(
    () => validateAndRemoveReferenceImage(createZip(openOnlyRel, validXml)),
    /Malformed non-self-closing relationship tag for rId3/
  );

  // 5. Namespace-prefixed abnormal rId3 -> REJECT
  const nsPrefixedRel = validRels.replace('Id="rId3"', 'Id="rId3"').replace('<Relationship Id="rId3"', '<r:Relationship Id="rId3"');
  assert.throws(
    () => validateAndRemoveReferenceImage(createZip(nsPrefixedRel, validXml)),
    /Namespace-prefixed relationship forbidden for rId3/
  );

  // 6. Duplicate mixed-form rId3 -> REJECT
  const mixedDupRel = validRels.replace('</Relationships>', '<r:Relationship Id="rId3" Target="../media/image3.png"/></Relationships>');
  assert.throws(
    () => validateAndRemoveReferenceImage(createZip(mixedDupRel, validXml)),
    /Expected exactly 1 canonical rId3 relationship/
  );

  // 7. Wrong relationship Type -> REJECT
  const wrongTypeRel = validRels.replace('Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image"', 'Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink"');
  assert.throws(
    () => validateAndRemoveReferenceImage(createZip(wrongTypeRel, validXml)),
    /Invalid relationship Type for rId3/
  );

  // 8. Wrong Target (media/image3.png without ../) -> REJECT
  const wrongTargetRel1 = validRels.replace('Target="../media/image3.png"', 'Target="media/image3.png"');
  assert.throws(
    () => validateAndRemoveReferenceImage(createZip(wrongTargetRel1, validXml)),
    /Invalid relationship Target for rId3/
  );

  // 9. Wrong Target (other image) -> REJECT
  const wrongTargetRel2 = validRels.replace('Target="../media/image3.png"', 'Target="../media/other.png"');
  assert.throws(
    () => validateAndRemoveReferenceImage(createZip(wrongTargetRel2, validXml)),
    /Invalid relationship Target for rId3/
  );

  // 10. TargetMode="Internal" -> REJECT
  const intModeRel = validRels.replace('Id="rId3"', 'Id="rId3" TargetMode="Internal"');
  assert.throws(
    () => validateAndRemoveReferenceImage(createZip(intModeRel, validXml)),
    /TargetMode attribute must be absent for rId3/
  );

  // 11. TargetMode="External" -> REJECT
  const extModeRel = validRels.replace('Id="rId3"', 'Id="rId3" TargetMode="External"');
  assert.throws(
    () => validateAndRemoveReferenceImage(createZip(extModeRel, validXml)),
    /TargetMode attribute must be absent for rId3/
  );

  // 12. Missing media evidence -> REJECT
  assert.throws(
    () => validateAndRemoveReferenceImage(createZip(validRels, validXml, false)),
    /Reference image files missing in package/
  );

  // 13. Zero exact embeds -> REJECT
  const zeroEmbedXml = validXml.replace('r:embed="rId3"', 'r:embed="rId99"');
  assert.throws(
    () => validateAndRemoveReferenceImage(createZip(validRels, zeroEmbedXml)),
    /Zero exact r:embed="rId3" occurrences found/
  );

  // 14. Duplicate embeds in one anchor -> REJECT
  const dupInOneXml = validXml.replace('r:embed="rId3"', 'r:embed="rId3" r:embed="rId3"');
  assert.throws(
    () => validateAndRemoveReferenceImage(createZip(validRels, dupInOneXml)),
    /Duplicate r:embed="rId3" occurrences found/
  );

  // 15. Duplicate embeds across anchors -> REJECT
  const dupAcrossXml = validXml + '<xdr:twoCellAnchor><a:blip r:embed="rId3"/></xdr:twoCellAnchor>';
  assert.throws(
    () => validateAndRemoveReferenceImage(createZip(validRels, dupAcrossXml)),
    /Duplicate r:embed="rId3" occurrences found/
  );

  // 16. Incidental rId3 text without exact embed -> REJECT
  const incidentalXml = validXml.replace('r:embed="rId3"', 'name="rId3"');
  assert.throws(
    () => validateAndRemoveReferenceImage(createZip(validRels, incidentalXml)),
    /Zero exact r:embed="rId3" occurrences found/
  );
});

test('PREPARER_PART_A_OWNER_TEMPLATE_INTEGRATION: N=4..10 complete proof matrix, deep structural & package parity', async (t) => {
  const templateBytes = loadLocalTemplate();
  if (!templateBytes) {
    t.skip('Local Part A owner template unavailable or SHA mismatch');
    return;
  }

  // Verify SHA matching via computeSha256
  const sha = await computeSha256(templateBytes);
  assert.equal(sha, PART_A_TEMPLATE_SHA256);

  const wbSource = await XlsxPopulate.fromDataAsync(templateBytes);
  const srcSheetXml = await wbSource._zip.files['xl/worksheets/sheet1.xml'].async('string');
  const srcDrawingRels = await wbSource._zip.files['xl/drawings/_rels/drawing1.xml.rels'].async('string');
  const srcDrawingXml = await wbSource._zip.files['xl/drawings/drawing1.xml'].async('string');

  // Collect source merge inventory
  const srcMerges = [...srcSheetXml.matchAll(/<mergeCell ref="([A-Z0-9:]+)"\/>/g)].map(m => m[1]);

  // Collect source row XML tags for rows 1..28
  const srcRowsMap = new Map();
  for (let r = 1; r <= 28; r++) {
    const match = srcSheetXml.match(new RegExp(`<row r="${r}"[^>]*>[\\s\\S]*?<\\/row>`));
    if (match) {
      srcRowsMap.set(r, match[0]);
    }
  }

  // Collect sensitive string tokens from source template before sanitization
  const profile = new MboXlsxTemplateProfile();
  const baseLayout = profile.getPartALayoutTopology(4);
  const sheetSource = wbSource.sheet(0);
  const sensitiveTokens = [];
  const sensitiveAddrs = baseLayout.effectiveSanitizationRanges.flatMap(r => expandRangeToAddresses(r));
  for (const addr of sensitiveAddrs) {
    const val = sheetSource.cell(addr).value();
    if (val && typeof val === 'string' && val.trim().length >= 2) {
      sensitiveTokens.push(val.trim());
    }
  }

  for (let n = 4; n <= 10; n++) {
    const callerCopy = new Uint8Array(templateBytes);

    const preparedBytes = await preparePartATemplate(templateBytes, { objectiveCount: n, profile });

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
    assert.equal(sheetXml.includes('SENTINEL_ROW_29'), false, 'Must not contain proof sentinel');

    // B. Dimension tag ref exact A1:BL(48+n)
    const expectedLastRow = 48 + n;
    const expectedDimRef = `A1:BL${expectedLastRow}`;
    assert.equal(sheetXml.includes(`dimension ref="${expectedDimRef}"`), true, `Dimension ref must be ${expectedDimRef} for N=${n}`);

    // C. Print_Area definedName exact in xl/workbook.xml
    const wbXml = await wb._zip.files['xl/workbook.xml'].async('string');
    const expectedPrintArea = `'MBO Staff &amp; Chief'!$A$1:$BJ$${expectedLastRow}`;
    assert.equal(wbXml.includes(expectedPrintArea), true, `Print_Area must be ${expectedPrintArea} for N=${n}`);

    // D. Page setup authority: paperSize="8", orientation="landscape", scale="58"
    assert.equal(sheetXml.includes('paperSize="8"'), true);
    assert.equal(sheetXml.includes('orientation="landscape"'), true);
    assert.equal(sheetXml.includes('scale="58"'), true);

    // E. Workbook-wide formula inventory across ALL sheets is EXACTLY ZERO
    for (const fileName in wb._zip.files) {
      if (fileName.startsWith('xl/worksheets/') && fileName.endsWith('.xml')) {
        const sXml = await wb._zip.files[fileName].async('string');
        const fMatches = [...sXml.matchAll(/<f[^>]*>[\s\S]*?<\/f>/g)];
        assert.equal(fMatches.length, 0, `Workbook formula inventory in ${fileName} must be 0 for N=${n}`);
      }
    }

    // F. Structural RowRefs sequence inspection:
    const rowRefs = [...sheetXml.matchAll(/<row r="(\d+)"/g)].map(m => parseInt(m[1], 10));
    assert.equal(rowRefs.length, expectedLastRow, `Row count must equal ${expectedLastRow} for N=${n}`);
    assert.equal(new Set(rowRefs).size, rowRefs.length, 'rowRefs sequence must be strictly unique');

    // Rows 1:28 exact normalized structural identity against source baseline
    for (let r = 1; r <= 28; r++) {
      assert.equal(rowRefs[r - 1], r, `Row ${r} must preserve index`);
      const srcRowXml = srcRowsMap.get(r);
      const outRowMatch = sheetXml.match(new RegExp(`<row r="${r}"[^>]*>[\\s\\S]*?<\\/row>`));
      assert.equal(Boolean(outRowMatch), true, `Output row ${r} XML must exist`);

      // Verify row height and customHeight attribute preservation
      if (srcRowXml.includes('customHeight="1"')) {
        assert.equal(outRowMatch[0].includes('customHeight="1"'), true, `Row ${r} customHeight must be preserved`);
      }
      if (srcRowXml.includes('ht="')) {
        const srcHt = srcRowXml.match(/ht="([^"]+)"/)[1];
        assert.equal(outRowMatch[0].includes(`ht="${srcHt}"`), true, `Row ${r} ht="${srcHt}" must be preserved`);
      }
    }

    // Every inserted objective row (29..28+extra) exact normalized structural clone of source row 28
    const extra = n - 4;
    for (let i = 0; i < extra; i++) {
      const targetR = 29 + i;
      assert.equal(rowRefs[28 + i], targetR, `Inserted row ${targetR} must exist`);
      const outClonedMatch = sheetXml.match(new RegExp(`<row r="${targetR}"[^>]*>[\\s\\S]*?<\\/row>`));
      assert.equal(Boolean(outClonedMatch), true, `Cloned row ${targetR} XML must exist`);
      assert.equal(outClonedMatch[0].includes('ht="14'), true, `Cloned row ${targetR} must preserve height ht="14"`);
      assert.equal(outClonedMatch[0].includes('customFormat="1"'), true, `Cloned row ${targetR} must preserve customFormat="1"`);
    }

    // Downstream rows relocated by +extra
    for (let r = 29; r <= 52; r++) {
      const targetR = r + extra;
      assert.equal(rowRefs[28 + extra + (r - 29)], targetR, `Downstream row ${r} must relocate to ${targetR}`);
    }

    // G. Complete Expected Merge SET Deep Equality
    const expectedMergeSet = new Set();
    const row28Merges = [];
    for (const mRef of srcMerges) {
      const [start, end] = mRef.split(':');
      const col1 = start.match(/^[A-Z]+/)[0];
      const r1 = parseInt(start.match(/\d+/)[0], 10);
      const col2 = end.match(/^[A-Z]+/)[0];
      const r2 = parseInt(end.match(/\d+/)[0], 10);

      if (r1 === 28 && r2 === 28) {
        row28Merges.push({ col1, col2 });
      }

      let targetR1 = r1;
      let targetR2 = r2;
      if (r1 >= 29) targetR1 += extra;
      if (r2 >= 29) targetR2 += extra;

      expectedMergeSet.add(`${col1}${targetR1}:${col2}${targetR2}`);
    }

    for (let i = 0; i < extra; i++) {
      const targetR = 29 + i;
      for (const m of row28Merges) {
        expectedMergeSet.add(`${m.col1}${targetR}:${m.col2}${targetR}`);
      }
    }

    const rawMerges = [...sheetXml.matchAll(/<mergeCell ref="([A-Z0-9:]+)"\/>/g)].map(m => m[1]);
    const actualMergeSet = new Set(rawMerges);

    const countAttr = sheetXml.match(/<mergeCells count="(\d+)">/)?.[1];
    assert.equal(countAttr, String(rawMerges.length), 'Declared merge count attr must equal actual merge array length');
    assert.equal(rawMerges.length, expectedMergeSet.size, `Merge count must equal expected set size ${expectedMergeSet.size} for N=${n}`);
    assert.deepEqual(actualMergeSet, expectedMergeSet, `Complete merge SET must match expected set for N=${n}`);

    // H. Effective sanitization ranges cleared
    const sheet = wb.sheet(0);
    const layout = profile.getPartALayoutTopology(n);
    const sensitiveAddrsN = layout.effectiveSanitizationRanges.flatMap(r => expandRangeToAddresses(r));

    for (const addr of sensitiveAddrsN) {
      const val = sheet.cell(addr).value();
      assert.equal(val == null, true, `Sanitized cell ${addr} must be cleared/null/undefined for N=${n}`);
    }

    // Stale sensitive tokens collected pre-sanitize absent from xl/sharedStrings.xml
    const ssFile = wb._zip.files['xl/sharedStrings.xml'];
    if (ssFile) {
      const ssXml = await ssFile.async('string');
      for (const token of sensitiveTokens) {
        assert.equal(ssXml.includes(token), false, `Stale sensitive token "${token}" must be absent from xl/sharedStrings.xml for N=${n}`);
      }
    }

    // I. Reference image rId3 / image3.png removed; branding rId1 / rId2 / rId4 & media image1.jpeg / image2.jpeg / image4.png preserved
    const drawingXml = await wb._zip.files['xl/drawings/drawing1.xml'].async('string');
    const drawingRels = await wb._zip.files['xl/drawings/_rels/drawing1.xml.rels'].async('string');

    assert.equal(drawingXml.includes('rId3'), false, 'drawing1.xml must not contain rId3 anchor');
    assert.equal(drawingRels.includes('rId3'), false, 'drawing1.xml.rels must not contain rId3 relationship');
    assert.equal(drawingRels.includes('image3.png'), false, 'drawing1.xml.rels must not contain image3.png');

    // Deep non-target relationship & media inventory equality
    const expectedNormalizedRels = srcDrawingRels.replace(/<Relationship[^>]*Id="rId3"[^>]*\/>/g, '');
    assert.equal(drawingRels, expectedNormalizedRels, 'drawing1.xml.rels non-target relationship inventory must match exact normalized source');

    const expectedNormalizedXml = srcDrawingXml.replace(/<xdr:twoCellAnchor[^>]*>(?:(?!<\/xdr:twoCellAnchor>)[\s\S])*rId3[\s\S]*?<\/xdr:twoCellAnchor>/g, '');
    assert.equal(drawingXml, expectedNormalizedXml, 'drawing1.xml non-target drawing anchor inventory must match exact normalized source');

    assert.equal(Boolean(wb._zip.files['xl/media/image3.png']), false, 'image3.png must be deleted from package');
    assert.equal(Boolean(wb._zip.files['xl/media/image1.jpeg']), true, 'Branding image1.jpeg must be preserved');
    assert.equal(Boolean(wb._zip.files['xl/media/image2.jpeg']), true, 'Branding image2.jpeg must be preserved');
    assert.equal(Boolean(wb._zip.files['xl/media/image4.png']), true, 'Branding image4.png must be preserved');

    // J. No semantic value writes
    for (let i = 1; i <= n; i++) {
      const r = 24 + i;
      assert.equal(sheet.cell(`T${r}`).value() == null, true, `Objective ${i} Measurement must be unwritten`);
      assert.equal(sheet.cell(`Y${r}`).value() == null, true, `Objective ${i} Weight must be unwritten`);
    }

    // K. Sheet names & states preserved
    const sheetNames = [...wbXml.matchAll(/<sheet [^>]*name="([^"]+)"/g)].map(m => m[1]);
    assert.deepEqual(sheetNames, ['MBO Staff &amp; Chief']);
  }
});
