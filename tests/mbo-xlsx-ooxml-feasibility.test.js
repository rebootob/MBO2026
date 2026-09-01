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
  getPartBPrivacyClassificationSourceBacked,
  buildPartBSourceEvidenceInventory,
  resolvePartBPrivacyRoles,
  getTypedPrivacyMetadata,
  validateTypedPrivacyMetadata,
  getHeaderCellFingerprints,
  validateHeaderFingerprintParity,
  getWorkbookFingerprint,
  validateWorkbookParity,
  inspectRawWorksheetOOXML,
  getWorksheetFormulaSet,
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

  // Part A Direct Source vs Round-Trip Fingerprint Evaluation
  const fpOrigA = await getWorkbookFingerprint(origBufA);
  const fpOutA = await getWorkbookFingerprint(outBufA);

  assert.deepEqual(fpOutA.sheetNames, fpOrigA.sheetNames, 'Part A sheet names must match source exactly');
  assert.equal(fpOutA.rawMergeCount, 193, 'Part A raw merge count must equal 193');
  assert.equal(fpOutA.mergeCountAttr, String(fpOutA.rawMergeCount), 'Declared merge count must equal actual merge set size');
  assert.deepEqual(fpOutA.rawMerges, fpOrigA.rawMerges, 'Part A raw merge refs must match source exactly');
  assert.equal(fpOutA.colsHash, fpOrigA.colsHash, 'Part A <cols> structure hash must match source exactly');
  assert.equal(fpOutA.rowHeightsHash, fpOrigA.rowHeightsHash, 'Part A row heights hash must match source exactly');
  assert.equal(fpOutA.paperSize, '8', 'Part A paperSize must be 8 (A3)');
  assert.equal(fpOutA.orientation, 'landscape', 'Part A orientation must be landscape');
  assert.equal(fpOutA.scale, '58', 'Part A scale must be 58%');
  assert.equal(fpOutA.printArea, "'MBO Staff & Chief'!$A$1:$BJ$52", 'Part A print area must be A1:BJ52');
  assert.deepEqual(fpOutA.relTuples, fpOrigA.relTuples, 'Part A relationship inventory tuples must match source exactly');
  assert.deepEqual(fpOutA.mediaFiles, fpOrigA.mediaFiles, 'Part A media inventory must match source exactly');

  // Part B Direct Source vs Round-Trip Fingerprint Evaluation
  const fpOrigB = await getWorkbookFingerprint(origBufB);
  const fpOutB = await getWorkbookFingerprint(outBufB);

  assert.deepEqual(fpOutB.sheetNames, ['(Part B) Competency', 'Sheet1'], 'Part B sheet names must match source exactly');
  assert.equal(fpOutB.rawMergeCount, 79, 'Part B raw merge count must equal 79');
  assert.equal(fpOutB.mergeCountAttr, String(fpOutB.rawMergeCount), 'Declared merge count must equal actual merge set size');
  assert.deepEqual(fpOutB.rawMerges, fpOrigB.rawMerges, 'Part B raw merge refs must match source exactly');
  assert.equal(fpOutB.colsHash, fpOrigB.colsHash, 'Part B <cols> structure hash must match source exactly');
  assert.equal(fpOutB.rowHeightsHash, fpOrigB.rowHeightsHash, 'Part B row heights hash must match source exactly');
  assert.equal(fpOutB.paperSize, '9', 'Part B paperSize must be 9 (A4)');
  assert.equal(fpOutB.orientation, 'portrait', 'Part B orientation must be portrait');
  assert.equal(fpOutB.scale, '75', 'Part B scale must be 75%');
  assert.equal(fpOutB.horizontalCentered, true, 'Part B horizontalCentered must be true');
  assert.equal(fpOutB.sheetProtection, true, 'Part B sheetProtection must be present');
  assert.equal(fpOutB.printArea, "'(Part B) Competency'!$A$1:$X$35", 'Part B print area must be A1:X35');
  assert.deepEqual(fpOutB.relTuples, fpOrigB.relTuples, 'Part B relationship inventory tuples must match source exactly');
  assert.deepEqual(fpOutB.mediaFiles, fpOrigB.mediaFiles, 'Part B media inventory must match source exactly');

  // Explicit per-worksheet assertions covering every worksheet & exact print-area bindings
  assert.ok(fpOutA.sheets['MBO Staff & Chief'], 'Part A main sheet entry must exist in workbook fingerprint');
  assert.equal(fpOutA.sheets['MBO Staff & Chief'].rawMergeCount, 193, 'Part A main sheet merge count must equal 193');
  assert.equal(fpOutA.sheets['MBO Staff & Chief'].printArea, "'MBO Staff & Chief'!$A$1:$BJ$52", 'Part A main sheet print area must equal exact source binding');

  assert.ok(fpOutB.sheets['(Part B) Competency'], 'Part B main sheet entry must exist in workbook fingerprint');
  assert.ok(fpOutB.sheets['Sheet1'], 'Part B second sheet (Sheet1) entry must exist in workbook fingerprint');
  assert.equal(fpOutB.sheets['(Part B) Competency'].rawMergeCount, 79, 'Part B main sheet merge count must equal 79');
  assert.equal(fpOutB.sheets['(Part B) Competency'].printArea, "'(Part B) Competency'!$A$1:$X$35", 'Part B main sheet print area must equal exact source binding');
  assert.equal(fpOutB.sheets['Sheet1'].printArea, '', 'Part B Sheet1 print area must be empty string exactly as source');

  // --- R3-R21 RAW NO-OP OBSERVED EVIDENCE EVALUATION ---
  // Inspect actual dimension presence in source vs raw observed output
  const partAHasRawDimension = fpOutA.sheets['MBO Staff & Chief'].dimension !== '';
  const partBMainHasRawDimension = fpOutB.sheets['(Part B) Competency'].dimension !== '';
  const partBSheet1HasRawDimension = fpOutB.sheets['Sheet1'].dimension !== '';

  if (partAHasRawDimension) {
    assert.equal(await validateWorkbookParity(outBufA, 'A'), true, 'Part A raw no-op roundtrip satisfies workbook-wide parity');
  } else {
    await assert.rejects(
      async () => validateWorkbookParity(outBufA, 'A'),
      /BLOCKER_WORKBOOK_PARITY_UNRESOLVED/,
      'Part A raw output missing actual <dimension> tag must be rejected with BLOCKER_WORKBOOK_PARITY_UNRESOLVED'
    );
  }

  if (partBMainHasRawDimension && partBSheet1HasRawDimension) {
    assert.equal(await validateWorkbookParity(outBufB, 'B'), true, 'Part B raw no-op roundtrip satisfies workbook-wide parity');
  } else {
    await assert.rejects(
      async () => validateWorkbookParity(outBufB, 'B'),
      /BLOCKER_WORKBOOK_PARITY_UNRESOLVED/,
      'Part B raw output missing actual <dimension> tag must be rejected with BLOCKER_WORKBOOK_PARITY_UNRESOLVED'
    );
  }

  // --- MANDATORY FAIL-CLOSED & DETERMINISTIC NORMALIZATION NEGATIVE TESTS ---
  // Negative Test 1: Wrong printArea binding assigned to Sheet1
  const fpMutSheet1PrintArea = JSON.parse(JSON.stringify(fpOutB));
  fpMutSheet1PrintArea.sheets['Sheet1'].printArea = "'(Part B) Competency'!$A$1:$X$35";
  await assert.rejects(
    async () => validateWorkbookParity(outBufB, 'B', fpMutSheet1PrintArea),
    /BLOCKER_WORKBOOK_PARITY_UNRESOLVED/,
    'Assigning non-empty printArea to Sheet1 must throw BLOCKER_WORKBOOK_PARITY_UNRESOLVED'
  );

  // Negative Test 2: Blanking/removing one worksheet dimension evidence
  const fpMutBlankDimension = JSON.parse(JSON.stringify(fpOutB));
  fpMutBlankDimension.sheets['(Part B) Competency'].dimension = '';
  await assert.rejects(
    async () => validateWorkbookParity(outBufB, 'B', fpMutBlankDimension),
    /BLOCKER_WORKBOOK_PARITY_UNRESOLVED/,
    'Blanking worksheet dimension evidence must throw BLOCKER_WORKBOOK_PARITY_UNRESOLVED'
  );

  // Negative Test 3: Restored Part B second-sheet colsHash mutation
  const fpMutSheet1Cols = JSON.parse(JSON.stringify(fpOutB));
  fpMutSheet1Cols.sheets['Sheet1'].colsHash = 'bad_cols_hash_999';
  await assert.rejects(
    async () => validateWorkbookParity(outBufB, 'B', fpMutSheet1Cols),
    /BLOCKER_WORKBOOK_PARITY_UNRESOLVED/,
    'Mutating Sheet1 column structure hash must throw BLOCKER_WORKBOOK_PARITY_UNRESOLVED'
  );

  // Negative Test 4: Removing actual <dimension> tag from in-memory disposable OOXML
  const wbBZip = await XlsxPopulate.fromDataAsync(outBufB);
  let sheet1XmlNoDim = await wbBZip._zip.files['xl/worksheets/sheet1.xml'].async('string');
  sheet1XmlNoDim = sheet1XmlNoDim.replace(/<dimension [^>]*\/>/, '');
  wbBZip._zip.file('xl/worksheets/sheet1.xml', sheet1XmlNoDim);
  const bufBNoDim = await wbBZip._zip.generateAsync({ type: 'nodebuffer' });

  await assert.rejects(
    async () => validateWorkbookParity(bufBNoDim, 'B'),
    /BLOCKER_WORKBOOK_PARITY_UNRESOLVED/,
    'Removing actual <dimension> tag from observed buffer must throw BLOCKER_WORKBOOK_PARITY_UNRESOLVED'
  );

  // Negative Test 5: Deterministic Blocker Normalization (Corrective B)
  // Mutate workbook-level field into non-serializable BigInt value that triggers runtime TypeError
  const fpMutNonSerializable = JSON.parse(JSON.stringify(fpOutB));
  fpMutNonSerializable.sheetNames = [BigInt(12345)];
  await assert.rejects(
    async () => validateWorkbookParity(outBufB, 'B', fpMutNonSerializable),
    /BLOCKER_WORKBOOK_PARITY_UNRESOLVED/,
    'Non-serializable field in observed fingerprint must throw BLOCKER_WORKBOOK_PARITY_UNRESOLVED'
  );

  // Additional Fail-Closed Negative Tests
  // Reorder sheets
  const fpMutSheetOrder = JSON.parse(JSON.stringify(fpOutB));
  fpMutSheetOrder.sheetNames = ['Sheet1', '(Part B) Competency'];
  await assert.rejects(
    async () => validateWorkbookParity(outBufB, 'B', fpMutSheetOrder),
    /BLOCKER_WORKBOOK_PARITY_UNRESOLVED/,
    'Reordering worksheets must throw BLOCKER_WORKBOOK_PARITY_UNRESOLVED'
  );

  // Mutate merge count
  const fpMutMerge = JSON.parse(JSON.stringify(fpOutB));
  fpMutMerge.sheets['(Part B) Competency'].rawMergeCount = 78;
  await assert.rejects(
    async () => validateWorkbookParity(outBufB, 'B', fpMutMerge),
    /BLOCKER_WORKBOOK_PARITY_UNRESOLVED/,
    'Mutating merge count must throw BLOCKER_WORKBOOK_PARITY_UNRESOLVED'
  );

  // Mutate page setup / orientation
  const fpMutSetup = JSON.parse(JSON.stringify(fpOutB));
  fpMutSetup.sheets['(Part B) Competency'].orientation = 'landscape';
  await assert.rejects(
    async () => validateWorkbookParity(outBufB, 'B', fpMutSetup),
    /BLOCKER_WORKBOOK_PARITY_UNRESOLVED/,
    'Mutating page orientation must throw BLOCKER_WORKBOOK_PARITY_UNRESOLVED'
  );

  // Mutate sheet protection
  const fpMutProtection = JSON.parse(JSON.stringify(fpOutB));
  fpMutProtection.sheets['(Part B) Competency'].sheetProtection = 'none';
  await assert.rejects(
    async () => validateWorkbookParity(outBufB, 'B', fpMutProtection),
    /BLOCKER_WORKBOOK_PARITY_UNRESOLVED/,
    'Mutating Part B sheet protection must throw BLOCKER_WORKBOOK_PARITY_UNRESOLVED'
  );
});

test('FEASIBILITY_HEADER_GEOMETRY_LABEL_VALUE_MAPPING: static header labels remain intact while value cells clear/update', async () => {
  const { origBufA, origBufB } = await getNoOpParityBuffers();

  const fpOrigHeaderA = await getHeaderCellFingerprints(origBufA, 'A');
  const { outBufA: mutBufA, outBufB: mutBufB } = await getMutatedHeaderValueBuffers();
  const fpMutHeaderA = await getHeaderCellFingerprints(mutBufA, 'A');

  // Assert Part A static title/label fingerprints & unrelated header cell fingerprints are unchanged
  assert.deepEqual(fpMutHeaderA.titleFingerprints, fpOrigHeaderA.titleFingerprints, 'Part A title/label fingerprints must match source exactly');
  assert.deepEqual(fpMutHeaderA.unrelatedFingerprints, fpOrigHeaderA.unrelatedFingerprints, 'Part A unrelated header cell fingerprints must match source exactly');
  assert.deepEqual(fpMutHeaderA.merges, fpOrigHeaderA.merges, 'Part A header merge refs must match source exactly');

  const fpOrigHeaderB = await getHeaderCellFingerprints(origBufB, 'B');
  const fpMutHeaderB = await getHeaderCellFingerprints(mutBufB, 'B');

  assert.deepEqual(fpMutHeaderB.titleFingerprints, fpOrigHeaderB.titleFingerprints, 'Part B title/label fingerprints must match source exactly');
  assert.deepEqual(fpMutHeaderB.unrelatedFingerprints, fpOrigHeaderB.unrelatedFingerprints, 'Part B unrelated header cell fingerprints must match source exactly');
  assert.deepEqual(fpMutHeaderB.merges, fpOrigHeaderB.merges, 'Part B header merge refs must match source exactly');

  // Directly inspect mutated value cell R3
  const wbB = await XlsxPopulate.fromDataAsync(mutBufB);
  assert.equal(wbB.sheet(0).cell('R3').value(), 'MUTATED_VAL', 'Value cell R3 must be updated');

  // --- R3-R17 HEADER FINGERPRINT / SANITIZED EXPORT PARITY PROOFS ---
  const { bufA: sanBufA, bufB: sanBufB } = await getSanitizedDisposableBuffers();

  // 1. Positive source-vs-sanitized header parity using exact SHA source as authority
  assert.equal(await validateHeaderFingerprintParity(sanBufA, 'A'), true, 'Part A sanitized export must satisfy header fingerprint parity');
  assert.equal(await validateHeaderFingerprintParity(sanBufB, 'B'), true, 'Part B sanitized export must satisfy header fingerprint parity');

  // 2. Mandatory Negative Tests using real validator
  const fpSanB = await getHeaderCellFingerprints(sanBufB, 'B');

  // Negative Case 1: Mutate dynamic header styleId
  const fpMutStyle = JSON.parse(JSON.stringify(fpSanB));
  fpMutStyle.valueFingerprints['G2'].styleId = '99999';
  await assert.rejects(
    async () => validateHeaderFingerprintParity(sanBufB, 'B', fpMutStyle),
    /BLOCKER_HEADER_FINGERPRINT_PARITY_UNRESOLVED/,
    'Mutating dynamic header styleId must throw BLOCKER_HEADER_FINGERPRINT_PARITY_UNRESOLVED'
  );

  // Negative Case 2: Make dynamic header appear nonblank after sanitization
  const fpMutNonblank = JSON.parse(JSON.stringify(fpSanB));
  fpMutNonblank.valueFingerprints['G2'].normalizedType = 'string';
  fpMutNonblank.valueFingerprints['G2'].valHash = 'some_hash_12345';
  await assert.rejects(
    async () => validateHeaderFingerprintParity(sanBufB, 'B', fpMutNonblank),
    /BLOCKER_HEADER_FINGERPRINT_PARITY_UNRESOLVED/,
    'Nonblank dynamic header after sanitization must throw BLOCKER_HEADER_FINGERPRINT_PARITY_UNRESOLVED'
  );

  // Negative Case 3: Mutate protected-static title/label safe hash
  const fpMutTitleHash = JSON.parse(JSON.stringify(fpSanB));
  fpMutTitleHash.titleFingerprints['B2'].valHash = 'bad_hash_val_999';
  await assert.rejects(
    async () => validateHeaderFingerprintParity(sanBufB, 'B', fpMutTitleHash),
    /BLOCKER_HEADER_FINGERPRINT_PARITY_UNRESOLVED/,
    'Mutating static title valHash must throw BLOCKER_HEADER_FINGERPRINT_PARITY_UNRESOLVED'
  );

  // Negative Case 4: Remove required header address
  const fpMutMissingAddr = JSON.parse(JSON.stringify(fpSanB));
  delete fpMutMissingAddr.titleFingerprints['B2'];
  await assert.rejects(
    async () => validateHeaderFingerprintParity(sanBufB, 'B', fpMutMissingAddr),
    /BLOCKER_HEADER_FINGERPRINT_PARITY_UNRESOLVED/,
    'Removing required title address must throw BLOCKER_HEADER_FINGERPRINT_PARITY_UNRESOLVED'
  );
});

test('FEASIBILITY_RANGE_DRIVEN_PRIVACY_PROOF: range clearing and shared string purging leave 0 sensitive tokens in OOXML parts', async () => {
  // 1. Verify exact Part B SHA
  const found = findLocalSourceTemplates();
  assert.notEqual(found, null, 'Local source templates must exist');
  assert.equal(found.shaB, EXPECTED_PART_B_SHA, 'Part B SHA-256 must match exact baseline');

  // 2. Build complete source evidence inventory FIRST
  const realInventory = await buildPartBSourceEvidenceInventory();
  assert.ok(realInventory['G2'], 'Source evidence must exist for G2');
  assert.ok(realInventory['B2'], 'Source evidence must exist for B2');
  assert.ok(realInventory['B7'], 'Source evidence must exist for B7');
  assert.ok(realInventory['K7'], 'Source evidence must exist for K7');
  assert.ok(realInventory['B31'], 'Source evidence must exist for B31');

  // 3. Resolve roles independently using REAL resolver
  const realResolved = await resolvePartBPrivacyRoles();
  const classMapB = realResolved.classificationMap;

  assert.equal(classMapB['G2'].classification, 'HEADER_VALUE', 'G2 must be classified HEADER_VALUE');
  assert.equal(classMapB['B2'].isDynamic, false, 'B2 static title must be protected');
  assert.equal(classMapB['B7'].isDynamic, false, 'B7 static competency text must be protected');

  for (const addr in classMapB) {
    const rec = classMapB[addr];
    assert.ok(rec.address, `Evidence address must exist for ${addr}`);
    assert.ok(rec.styleId !== undefined, `StyleId evidence must exist for ${addr}`);
    assert.ok(['string', 'number', 'date', 'boolean', 'blank'].includes(rec.normalizedType), `Normalized type must be valid for ${addr}`);
    assert.ok(rec.roleJustification, `Role justification must exist for ${addr}`);
  }

  // 4. Assert DYNAMIC ∩ PROTECTED_STATIC = empty
  const dynamicSet = new Set(realResolved.dynamicAddresses);
  for (const staticAddr of realResolved.protectedStaticAddresses) {
    assert.equal(dynamicSet.has(staticAddr), false, `Protected static address ${staticAddr} must NOT be in dynamic set`);
  }

  // 5. Cross-check SORT(independentlyResolvedDynamicAddresses) == SORT(SENSITIVE_RANGES_B)
  const sortedSensitive = [...SENSITIVE_RANGES_B].sort();
  assert.deepEqual(realResolved.dynamicAddresses, sortedSensitive, 'Independently resolved dynamic addresses must equal SENSITIVE_RANGES_B');

  // 6. REAL FAIL-CLOSED TESTS
  const invMutA = { ...realInventory };
  delete invMutA['G2'];
  await assert.rejects(
    async () => resolvePartBPrivacyRoles(invMutA),
    /BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED/,
    'Removing dynamic address G2 evidence must throw BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED'
  );

  const invMutB = { ...realInventory };
  delete invMutB['B2'];
  await assert.rejects(
    async () => resolvePartBPrivacyRoles(invMutB),
    /BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED/,
    'Removing protected-static address B2 evidence must throw BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED'
  );

  const invMutC = JSON.parse(JSON.stringify(realInventory));
  invMutC['G2'].mergeRef = 'G2:H2';
  await assert.rejects(
    async () => resolvePartBPrivacyRoles(invMutC),
    /BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED/,
    'Structural mergeRef mismatch for G2 must throw BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED'
  );

  // Style mutation tests
  const invMutBodyProtectedStyle = JSON.parse(JSON.stringify(realInventory));
  invMutBodyProtectedStyle['B7'].styleId = '99999';
  await assert.rejects(
    async () => resolvePartBPrivacyRoles(invMutBodyProtectedStyle),
    /BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED/,
    'Mutating styleId for protected body cell B7 must throw BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED'
  );

  const invMutBodyDynamicStyle = JSON.parse(JSON.stringify(realInventory));
  invMutBodyDynamicStyle['K7'].styleId = '99999';
  await assert.rejects(
    async () => resolvePartBPrivacyRoles(invMutBodyDynamicStyle),
    /BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED/,
    'Mutating styleId for dynamic body cell K7 must throw BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED'
  );

  const invMutSummaryStyle = JSON.parse(JSON.stringify(realInventory));
  invMutSummaryStyle['B31'].styleId = '99999';
  await assert.rejects(
    async () => resolvePartBPrivacyRoles(invMutSummaryStyle),
    /BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED/,
    'Mutating styleId for summary cell B31 must throw BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED'
  );

  // Non-style fail-closed tests
  const invMutProtectedHash = JSON.parse(JSON.stringify(realInventory));
  invMutProtectedHash['B7'].valHash = 'bad_hash_value_1234567890abcdef';
  await assert.rejects(
    async () => resolvePartBPrivacyRoles(invMutProtectedHash),
    /BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED/,
    'Mutating valHash for protected body cell B7 must throw BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED'
  );

  const invMutDynamicType = JSON.parse(JSON.stringify(realInventory));
  invMutDynamicType['K7'].normalizedType = 'boolean';
  await assert.rejects(
    async () => resolvePartBPrivacyRoles(invMutDynamicType),
    /BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED/,
    'Mutating normalizedType for dynamic body cell K7 must throw BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED'
  );

  const invMutSummaryType = JSON.parse(JSON.stringify(realInventory));
  invMutSummaryType['B31'].normalizedType = 'number';
  await assert.rejects(
    async () => resolvePartBPrivacyRoles(invMutSummaryType),
    /BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED/,
    'Mutating normalizedType for summary cell B31 must throw BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED'
  );

  // --- R3-R14 & R3-R15 TYPED PRIVACY METADATA COMPLETENESS & VALIDATOR SHAPE PROOF ---
  for (const partKey of ['A', 'B']) {
    const expectedAddrs = partKey === 'A' ? SENSITIVE_RANGES_A : SENSITIVE_RANGES_B;
    const metaResult = await getTypedPrivacyMetadata(partKey);

    // 1. Validate complete metadata using helper
    assert.equal(validateTypedPrivacyMetadata(metaResult, expectedAddrs), true, `Part ${partKey} typed privacy metadata must be 100% valid`);

    // 2. Per-record exact assertions
    const { metadata, uniqueCount, typeCounts, totalReconciled } = metaResult;

    assert.equal(uniqueCount, expectedAddrs.length, `Part ${partKey} uniqueCount must equal expected address count`);
    assert.equal(metadata.length, uniqueCount, `Part ${partKey} metadata length must equal uniqueCount`);
    assert.equal(totalReconciled, uniqueCount, `Part ${partKey} totalReconciled must equal uniqueCount`);

    const sortedMetaAddrs = metadata.map(m => m.address).sort();
    const sortedExpectedAddrs = [...expectedAddrs].sort();
    assert.deepEqual(sortedMetaAddrs, sortedExpectedAddrs, `Part ${partKey} metadata address set must equal expected address set`);

    const derivedCounts = { string: 0, number: 0, date: 0, boolean: 0, blank: 0 };
    const seenAddrs = new Set();

    for (const rec of metadata) {
      assert.equal(seenAddrs.has(rec.address), false, `Part ${partKey} address ${rec.address} must be unique`);
      seenAddrs.add(rec.address);

      assert.ok(['string', 'number', 'date', 'boolean', 'blank'].includes(rec.normalizedType), `Part ${partKey} normalizedType for ${rec.address} must be enum-valid`);
      assert.equal(typeof rec.nonblank, 'boolean', `Part ${partKey} nonblank for ${rec.address} must be boolean`);

      if (rec.normalizedType === 'blank') {
        assert.equal(rec.nonblank, false, `Part ${partKey} blank cell ${rec.address} must have nonblank === false`);
        assert.equal(rec.hash, null, `Part ${partKey} blank cell ${rec.address} must have hash === null`);
      } else {
        assert.equal(rec.nonblank, true, `Part ${partKey} non-blank cell ${rec.address} must have nonblank === true`);
        if (rec.normalizedType === 'string') {
          assert.ok(rec.hash && /^[0-9a-f]{64}$/.test(rec.hash), `Part ${partKey} string cell ${rec.address} hash must be 64 lowercase hex chars`);
        } else {
          assert.equal(rec.hash, null, `Part ${partKey} non-string cell ${rec.address} must have hash === null`);
        }
      }

      derivedCounts[rec.normalizedType]++;
    }

    // 3. Derived count vs reported typeCounts equality
    assert.deepEqual(derivedCounts, typeCounts, `Part ${partKey} derived type counts must equal reported typeCounts`);

    // 4. Assert zero for absent source types (date, boolean)
    assert.equal(typeCounts.date, 0, `Part ${partKey} date count in template must be 0`);
    assert.equal(typeCounts.boolean, 0, `Part ${partKey} boolean count in template must be 0`);
  }

  // --- MANDATORY R3-R15 VALIDATOR NEGATIVE SHAPE TESTS ---
  const validMetaB = await getTypedPrivacyMetadata('B');

  // Test A: Extra unexpected typeCounts key
  const metaExtraKey = JSON.parse(JSON.stringify(validMetaB));
  metaExtraKey.typeCounts.unexpected = 1;
  assert.throws(
    () => validateTypedPrivacyMetadata(metaExtraKey, SENSITIVE_RANGES_B),
    /BLOCKER_TYPED_PRIVACY_METADATA_UNRESOLVED/,
    'Extra typeCounts key must throw BLOCKER_TYPED_PRIVACY_METADATA_UNRESOLVED'
  );

  // Test B: Missing typeCounts
  const metaMissingTypeCounts = JSON.parse(JSON.stringify(validMetaB));
  delete metaMissingTypeCounts.typeCounts;
  assert.throws(
    () => validateTypedPrivacyMetadata(metaMissingTypeCounts, SENSITIVE_RANGES_B),
    /BLOCKER_TYPED_PRIVACY_METADATA_UNRESOLVED/,
    'Missing typeCounts must throw BLOCKER_TYPED_PRIVACY_METADATA_UNRESOLVED'
  );

  // Test C: Malformed typeCounts (null or array)
  const metaNullCounts = JSON.parse(JSON.stringify(validMetaB));
  metaNullCounts.typeCounts = null;
  assert.throws(
    () => validateTypedPrivacyMetadata(metaNullCounts, SENSITIVE_RANGES_B),
    /BLOCKER_TYPED_PRIVACY_METADATA_UNRESOLVED/,
    'Null typeCounts must throw BLOCKER_TYPED_PRIVACY_METADATA_UNRESOLVED'
  );

  const metaArrayCounts = JSON.parse(JSON.stringify(validMetaB));
  metaArrayCounts.typeCounts = [1, 2, 3];
  assert.throws(
    () => validateTypedPrivacyMetadata(metaArrayCounts, SENSITIVE_RANGES_B),
    /BLOCKER_TYPED_PRIVACY_METADATA_UNRESOLVED/,
    'Array typeCounts must throw BLOCKER_TYPED_PRIVACY_METADATA_UNRESOLVED'
  );

  // Test D: Invalid count values (negative, fractional, non-number)
  const metaNegativeCount = JSON.parse(JSON.stringify(validMetaB));
  metaNegativeCount.typeCounts.string = -1;
  assert.throws(
    () => validateTypedPrivacyMetadata(metaNegativeCount, SENSITIVE_RANGES_B),
    /BLOCKER_TYPED_PRIVACY_METADATA_UNRESOLVED/,
    'Negative typeCounts value must throw BLOCKER_TYPED_PRIVACY_METADATA_UNRESOLVED'
  );

  const metaFractionalCount = JSON.parse(JSON.stringify(validMetaB));
  metaFractionalCount.typeCounts.string = 1.5;
  assert.throws(
    () => validateTypedPrivacyMetadata(metaFractionalCount, SENSITIVE_RANGES_B),
    /BLOCKER_TYPED_PRIVACY_METADATA_UNRESOLVED/,
    'Fractional typeCounts value must throw BLOCKER_TYPED_PRIVACY_METADATA_UNRESOLVED'
  );

  const metaNonNumberCount = JSON.parse(JSON.stringify(validMetaB));
  metaNonNumberCount.typeCounts.string = 'five';
  assert.throws(
    () => validateTypedPrivacyMetadata(metaNonNumberCount, SENSITIVE_RANGES_B),
    /BLOCKER_TYPED_PRIVACY_METADATA_UNRESOLVED/,
    'Non-number typeCounts value must throw BLOCKER_TYPED_PRIVACY_METADATA_UNRESOLVED'
  );

  // Test E: Malformed normalizedType record mutation
  const metaInvalidType = JSON.parse(JSON.stringify(validMetaB));
  metaInvalidType.metadata[0].normalizedType = 'invalid_type';
  assert.throws(
    () => validateTypedPrivacyMetadata(metaInvalidType, SENSITIVE_RANGES_B),
    /BLOCKER_TYPED_PRIVACY_METADATA_UNRESOLVED/,
    'Malformed normalizedType record mutation must throw BLOCKER_TYPED_PRIVACY_METADATA_UNRESOLVED'
  );

  const { bufA, bufB, sensitiveA, sensitiveB } = await getSanitizedDisposableBuffers();

  const wbA = await XlsxPopulate.fromDataAsync(bufA);
  const sheetA = wbA.sheet(0);

  // Directly inspect EVERY metadata record in Part A to confirm it is blank after sanitization
  const metaA = await getTypedPrivacyMetadata('A');
  for (const rec of metaA.metadata) {
    const val = sheetA.cell(rec.address).value();
    assert.equal(val === null || val === undefined, true, `Cell ${rec.address} must be blank after sanitization`);
  }

  // Iterate typed metadata subsets (number, date, boolean) directly
  for (const rec of metaA.metadata.filter(r => r.normalizedType === 'number')) {
    assert.equal(sheetA.cell(rec.address).value() == null, true, `Number cell ${rec.address} must be blank`);
  }

  // Formula node test using getWorksheetFormulaSet()
  const sourceFormulasA = await getWorksheetFormulaSet(bufA);
  assert.equal(sourceFormulasA.size, 0, 'Part A sanitized output worksheet formula node count must equal 0');

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
  const metaB = await getTypedPrivacyMetadata('B');

  for (const rec of metaB.metadata) {
    const val = sheetB.cell(rec.address).value();
    assert.equal(val === null || val === undefined, true, `Cell ${rec.address} must be blank after sanitization`);
  }

  const sourceFormulasB = await getWorksheetFormulaSet(bufB);
  assert.equal(sourceFormulasB.size, 0, 'Part B sanitized output worksheet formula node count must equal 0');

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
  const inspA4 = await inspectRawWorksheetOOXML(bufA4);
  assert.equal(inspA4.rawMerges.length, 193, 'Part A 4 objectives merge count must equal 193');
  assert.equal(inspA4.mergeCountAttr, '193', 'Declared merge count must equal 193');
  assert.equal(inspA4.printArea.includes('BJ$52'), true, 'Part A 4 objectives print area must end at BJ52');
  assert.equal(inspA4.pageSetup.paperSize, '8', 'Part A paperSize must be 8');
  assert.equal(inspA4.pageSetup.orientation, 'landscape', 'Part A orientation must be landscape');
  assert.equal(inspA4.pageSetup.scale, '58', 'Part A scale must be 58');

  // Assert rowRefs strictly increasing
  for (let i = 1; i < inspA4.rowRefs.length; i++) {
    assert.equal(inspA4.rowRefs[i] > inspA4.rowRefs[i - 1], true, 'Row refs must be strictly increasing');
  }

  // 5 Objectives (raw OOXML +1 insertion & merge cloning)
  const inspA5 = await inspectRawWorksheetOOXML(bufA5);
  assert.equal(inspA5.rawMerges.length, 207, 'Part A 5 objectives raw merge count must equal 207 (193 + 14 cloned)');
  assert.equal(inspA5.mergeCountAttr, '207', 'Declared merge count must equal 207');
  assert.equal(inspA5.printArea.includes('BJ$53'), true, 'Part A 5 objectives print area must end at BJ53');
  assert.deepEqual(inspA5.stylePattern[29], inspA5.stylePattern[28], 'Inserted row 29 style pattern must match source row 28');
  assert.deepEqual(inspA5.rowHeights[29], inspA5.rowHeights[28], 'Inserted row 29 height must match source row 28');

  // 10 Objectives (raw OOXML +6 insertion & merge cloning)
  const inspA10 = await inspectRawWorksheetOOXML(bufA10);
  assert.equal(inspA10.rawMerges.length, 277, 'Part A 10 objectives raw merge count must equal 277 (193 + 84 cloned)');
  assert.equal(inspA10.mergeCountAttr, '277', 'Declared merge count must equal 277');
  assert.equal(inspA10.printArea.includes('BJ$58'), true, 'Part A 10 objectives print area must end at BJ58');
});

test('FEASIBILITY_TRUE_PART_B_RAW_OOXML_BLOCK_INSERTION: proves raw OOXML block insertion, merge cloning & totals shifting for 6 and 8 competencies', async () => {
  const { bufB6, bufB8 } = await getStructuralPartBBuffers();

  // 6 Competencies
  const inspB6 = await inspectRawWorksheetOOXML(bufB6);
  assert.equal(inspB6.rawMerges.length, 79, 'Part B 6 competencies merge count must equal 79');
  assert.equal(inspB6.mergeCountAttr, '79', 'Declared merge count must equal 79');
  assert.equal(inspB6.printArea.includes('X$35'), true, 'Part B 6 competencies print area must end at X35');
  assert.equal(inspB6.pageSetup.paperSize, '9', 'Part B paperSize must be 9');
  assert.equal(inspB6.pageSetup.orientation, 'portrait', 'Part B orientation must be portrait');
  assert.equal(inspB6.pageSetup.scale, '75', 'Part B scale must be 75');
  assert.equal(inspB6.horizontalCentered, true, 'Part B horizontalCentered must be true');
  assert.equal(inspB6.sheetProtection, true, 'Part B sheetProtection must be true');

  // 8 Competencies (raw OOXML +8 block insertion & merge cloning)
  const inspB8 = await inspectRawWorksheetOOXML(bufB8);
  assert.equal(inspB8.rawMerges.length, 91, 'Part B 8 competencies raw merge count must equal 91 (79 + 12 cloned)');
  assert.equal(inspB8.mergeCountAttr, '91', 'Declared merge count must equal 91');
  assert.equal(inspB8.printArea.includes('X$43'), true, 'Part B 8 competencies print area must end at X43');
  assert.equal(inspB8.horizontalCentered, true, 'Part B 8 competencies horizontalCentered must be true');
  assert.equal(inspB8.sheetProtection, true, 'Part B 8 competencies sheetProtection must be true');
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
