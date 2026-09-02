import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import XlsxPopulate from 'xlsx-populate';

import {
  preparePartATemplate,
  computeSha256
} from '../src/services/mbo-xlsx-template-preparer.js';
import {
  PART_A_TEMPLATE_SHA256,
  MboXlsxTemplateProfile,
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

  // 3. Malformed profile fails closed
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
});

test('PREPARER_PART_A_OWNER_TEMPLATE_INTEGRATION: N=4..10 structural expansion, sanitization, image removal & preservation', async (t) => {
  const templateBytes = loadLocalTemplate();
  if (!templateBytes) {
    t.skip('Local Part A owner template unavailable or SHA mismatch');
    return;
  }

  // Verify SHA matching via computeSha256
  const sha = await computeSha256(templateBytes);
  assert.equal(sha, PART_A_TEMPLATE_SHA256);

  const profile = new MboXlsxTemplateProfile();

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

    // E. Formula inventory exactly zero
    const formulaMatches = [...sheetXml.matchAll(/<f[^>]*>[\s\S]*?<\/f>/g)];
    assert.equal(formulaMatches.length, 0, `Formula inventory must be 0 for N=${n}`);

    // F. Effective sanitization ranges cleared
    const sheet = wb.sheet(0);
    const layout = profile.getPartALayoutTopology(n);
    const sensitiveAddrs = layout.effectiveSanitizationRanges.flatMap(r => expandRangeToAddresses(r));

    for (const addr of sensitiveAddrs) {
      const val = sheet.cell(addr).value();
      assert.equal(val == null, true, `Sanitized cell ${addr} must be cleared/null/undefined for N=${n}`);
    }

    // G. Reference image rId3 / image3.png removed, rId1 / rId2 / rId4 branding preserved
    const drawingXml = await wb._zip.files['xl/drawings/drawing1.xml'].async('string');
    const drawingRels = await wb._zip.files['xl/drawings/_rels/drawing1.xml.rels'].async('string');

    assert.equal(drawingXml.includes('rId3'), false, 'drawing1.xml must not contain rId3 anchor');
    assert.equal(drawingRels.includes('rId3'), false, 'drawing1.xml.rels must not contain rId3 relationship');

    // Branding rId1, rId2, and rId4 must remain preserved
    assert.equal(drawingRels.includes('rId1'), true, 'Branding rId1 must be preserved');
    assert.equal(drawingRels.includes('rId2'), true, 'Branding rId2 must be preserved');
    assert.equal(drawingRels.includes('rId4'), true, 'Branding rId4 must be preserved');

    // image3.png deleted from package
    assert.equal(Boolean(wb._zip.files['xl/media/image3.png']), false, 'image3.png must be deleted from package');
    // image1.jpeg, image2.jpeg, and image4.png branding preserved
    assert.equal(Boolean(wb._zip.files['xl/media/image1.jpeg']), true, 'Branding image1.jpeg must be preserved');
    assert.equal(Boolean(wb._zip.files['xl/media/image2.jpeg']), true, 'Branding image2.jpeg must be preserved');
    assert.equal(Boolean(wb._zip.files['xl/media/image4.png']), true, 'Branding image4.png must be preserved');

    // H. No semantic value writes
    for (let i = 1; i <= n; i++) {
      const r = 24 + i;
      assert.equal(sheet.cell(`T${r}`).value() == null, true, `Objective ${i} Measurement must be unwritten`);
      assert.equal(sheet.cell(`Y${r}`).value() == null, true, `Objective ${i} Weight must be unwritten`);
    }
  }
});
