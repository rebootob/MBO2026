import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import XlsxPopulate from 'xlsx-populate';
import {
  findLocalSourceTemplates,
  getNoOpParityBuffers,
  preserveExactWorkbookDimensions,
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

  // Pre-preservation SHA snapshots to prove immutability of raw and source buffers
  const shaOrigABefore = crypto.createHash('sha256').update(origBufA).digest('hex');
  const shaOutABefore = crypto.createHash('sha256').update(outBufA).digest('hex');
  const shaOrigBBefore = crypto.createHash('sha256').update(origBufB).digest('hex');
  const shaOutBBefore = crypto.createHash('sha256').update(outBufB).digest('hex');

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

  // --- PROVE EXACT-SOURCE BASELINES VALID THROUGH REAL VALIDATOR ---
  assert.equal(await validateWorkbookParity(origBufA, 'A'), true, 'Exact source Part A must satisfy workbook-wide parity');
  assert.equal(await validateWorkbookParity(origBufB, 'B'), true, 'Exact source Part B must satisfy workbook-wide parity');

  // Explicit per-worksheet assertions covering every worksheet & exact print-area bindings
  assert.ok(fpOutA.sheets['MBO Staff & Chief'], 'Part A main sheet entry must exist in workbook fingerprint');
  assert.equal(fpOutA.sheets['MBO Staff & Chief'].rawMergeCount, 193, 'Part A main sheet merge count must equal 193');
  assert.equal(fpOutA.sheets['MBO Staff & Chief'].printArea, "'MBO Staff & Chief'!$A$1:$BJ$52", 'Part A main sheet print area must equal exact source binding');

  assert.ok(fpOutB.sheets['(Part B) Competency'], 'Part B main sheet entry must exist in workbook fingerprint');
  assert.ok(fpOutB.sheets['Sheet1'], 'Part B second sheet (Sheet1) entry must exist in workbook fingerprint');
  assert.equal(fpOutB.sheets['(Part B) Competency'].rawMergeCount, 79, 'Part B main sheet merge count must equal 79');
  assert.equal(fpOutB.sheets['(Part B) Competency'].printArea, "'(Part B) Competency'!$A$1:$X$35", 'Part B main sheet print area must equal exact source binding');
  assert.equal(fpOutB.sheets['Sheet1'].printArea, '', 'Part B Sheet1 print area must be empty string exactly as source');

  // --- RAW NO-OP UNREPAIRED PROOF ---
  await assert.rejects(
    async () => validateWorkbookParity(outBufA, 'A'),
    /BLOCKER_WORKBOOK_PARITY_UNRESOLVED/,
    'Raw Part A output missing <dimension> tag must be rejected by real validator with BLOCKER_WORKBOOK_PARITY_UNRESOLVED'
  );
  await assert.rejects(
    async () => validateWorkbookParity(outBufB, 'B'),
    /BLOCKER_WORKBOOK_PARITY_UNRESOLVED/,
    'Raw Part B output missing <dimension> tag must be rejected by real validator with BLOCKER_WORKBOOK_PARITY_UNRESOLVED'
  );

  // --- R3-R27 POSITIVE PROOF: DIRECT RAW OUTBUFA & OUTBUFB PRESERVATION PATH (OPTION B ALLOWED DRIFT) ---
  const preservedBufA = await preserveExactWorkbookDimensions(outBufA, 'A');
  // Direct raw outBufB is passed directly WITHOUT test-side pre-cleaning or modification
  const preservedBufB = await preserveExactWorkbookDimensions(outBufB, 'B');

  // 1. Preserved buffers pass the real validator
  assert.equal(await validateWorkbookParity(preservedBufA, 'A'), true, 'Preserved Part A buffer must satisfy real workbook parity validator');
  assert.equal(await validateWorkbookParity(preservedBufB, 'B'), true, 'Preserved Part B buffer must satisfy real workbook parity validator');

  // 2. Dimension verification & schema-valid slot placement verification (predecessor & successor checks)
  const fpPreservedA = await getWorkbookFingerprint(preservedBufA);
  const fpPreservedB = await getWorkbookFingerprint(preservedBufB);

  assert.equal(fpPreservedA.sheets['MBO Staff & Chief'].dimension, fpOrigA.sheets['MBO Staff & Chief'].dimension, 'Preserved Part A dimension must match source tag exactly');
  assert.equal(fpPreservedB.sheets['(Part B) Competency'].dimension, fpOrigB.sheets['(Part B) Competency'].dimension, 'Preserved Part B main dimension must match source tag exactly');
  assert.equal(fpPreservedB.sheets['Sheet1'].dimension, fpOrigB.sheets['Sheet1'].dimension, 'Preserved Part B Sheet1 dimension must match source tag exactly');

  // Verify predecessor and successor top-level elements in Part B main sheet XML
  const wbPresBZip = await XlsxPopulate.fromDataAsync(preservedBufB);
  const presBMainXml = await wbPresBZip._zip.files['xl/worksheets/sheet1.xml'].async('string');
  const sheetPrIndex = presBMainXml.indexOf('<sheetPr');
  const dimIndex = presBMainXml.indexOf('<dimension');
  const sheetViewsIndex = presBMainXml.indexOf('<sheetViews');
  assert.ok(sheetPrIndex !== -1, 'Part B main sheet XML must contain <sheetPr>');
  assert.ok(dimIndex !== -1, 'Part B main sheet XML must contain restored <dimension>');
  assert.ok(sheetViewsIndex !== -1, 'Part B main sheet XML must contain <sheetViews>');
  assert.ok(sheetPrIndex < dimIndex, 'Restored <dimension> tag MUST appear AFTER predecessor <sheetPr> in schema order');
  assert.ok(dimIndex < sheetViewsIndex, 'Restored <dimension> tag MUST appear BEFORE successor <sheetViews> in schema order');

  // 3. Complete fingerprint comparison: change is strictly limited to authorized dimension fields
  for (const sheetName of fpPreservedA.sheetNames) {
    const pSheet = fpPreservedA.sheets[sheetName];
    const rSheet = fpOutA.sheets[sheetName];
    assert.equal(pSheet.rawMergeCount, rSheet.rawMergeCount, `Preserved Part A ${sheetName} merge count must equal raw`);
    assert.deepEqual(pSheet.rawMerges, rSheet.rawMerges, `Preserved Part A ${sheetName} merges must equal raw`);
    assert.equal(pSheet.colsHash, rSheet.colsHash, `Preserved Part A ${sheetName} colsHash must equal raw`);
    assert.equal(pSheet.rowHeightsHash, rSheet.rowHeightsHash, `Preserved Part A ${sheetName} rowHeightsHash must equal raw`);
    assert.equal(pSheet.printArea, rSheet.printArea, `Preserved Part A ${sheetName} printArea must equal raw`);
    assert.equal(pSheet.paperSize, rSheet.paperSize, `Preserved Part A ${sheetName} paperSize must equal raw`);
  }

  for (const sheetName of fpPreservedB.sheetNames) {
    const pSheet = fpPreservedB.sheets[sheetName];
    const rSheet = fpOutB.sheets[sheetName];
    assert.equal(pSheet.rawMergeCount, rSheet.rawMergeCount, `Preserved Part B ${sheetName} merge count must equal raw`);
    assert.deepEqual(pSheet.rawMerges, rSheet.rawMerges, `Preserved Part B ${sheetName} merges must equal raw`);
    assert.equal(pSheet.colsHash, rSheet.colsHash, `Preserved Part B ${sheetName} colsHash must equal raw`);
    assert.equal(pSheet.rowHeightsHash, rSheet.rowHeightsHash, `Preserved Part B ${sheetName} rowHeightsHash must equal raw`);
    assert.equal(pSheet.printArea, rSheet.printArea, `Preserved Part B ${sheetName} printArea must equal raw`);
    assert.equal(pSheet.paperSize, rSheet.paperSize, `Preserved Part B ${sheetName} paperSize must equal raw`);
  }

  // 4. Source and raw buffers remain byte-identical before and after preservation
  assert.equal(crypto.createHash('sha256').update(origBufA).digest('hex'), shaOrigABefore, 'Source Part A buffer must remain byte-identical');
  assert.equal(crypto.createHash('sha256').update(outBufA).digest('hex'), shaOutABefore, 'Raw Part A buffer must remain byte-identical');
  assert.equal(crypto.createHash('sha256').update(origBufB).digest('hex'), shaOrigBBefore, 'Source Part B buffer must remain byte-identical');
  assert.equal(crypto.createHash('sha256').update(outBufB).digest('hex'), shaOutBBefore, 'Raw Part B buffer must remain byte-identical');

  // --- MANDATORY OPTION B ALLOWED-DRIFT NEGATIVE TESTS ---

  // Option B Negative 1: Changed attribute/value/content of pinned allowed sheetPr (<sheetPr pageSetUpPr="1"/>)
  const wbBadSheetPrAttr = await XlsxPopulate.fromDataAsync(outBufB);
  let sheet2XmlBadPr = await wbBadSheetPrAttr._zip.files['xl/worksheets/sheet2.xml'].async('string');
  sheet2XmlBadPr = sheet2XmlBadPr.replace('<sheetPr/>', '<sheetPr pageSetUpPr="1"/>');
  wbBadSheetPrAttr._zip.file('xl/worksheets/sheet2.xml', sheet2XmlBadPr);
  const bufBadSheetPrAttr = await wbBadSheetPrAttr._zip.generateAsync({ type: 'nodebuffer' });
  await assert.rejects(
    async () => preserveExactWorkbookDimensions(bufBadSheetPrAttr, 'B', origBufB),
    /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/,
    'Modified sheetPr attribute must throw BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED'
  );

  // Option B Negative 2: Duplicate sheetPr in Sheet1
  const wbDupSheetPrB = await XlsxPopulate.fromDataAsync(outBufB);
  let sheet2XmlDupPr = await wbDupSheetPrB._zip.files['xl/worksheets/sheet2.xml'].async('string');
  sheet2XmlDupPr = sheet2XmlDupPr.replace('<sheetPr/>', '<sheetPr/>\n  <sheetPr/>');
  wbDupSheetPrB._zip.file('xl/worksheets/sheet2.xml', sheet2XmlDupPr);
  const bufDupSheetPrB = await wbDupSheetPrB._zip.generateAsync({ type: 'nodebuffer' });
  await assert.rejects(
    async () => preserveExactWorkbookDimensions(bufDupSheetPrB, 'B', origBufB),
    /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/,
    'Duplicate sheetPr in Sheet1 must throw BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED'
  );

  // Option B Negative 3: Moved/reordered allowed sheetPr in Sheet1 (placed after sheetViews)
  const wbMovedSheetPrB = await XlsxPopulate.fromDataAsync(outBufB);
  let sheet2XmlMovedPr = await wbMovedSheetPrB._zip.files['xl/worksheets/sheet2.xml'].async('string');
  sheet2XmlMovedPr = sheet2XmlMovedPr.replace('<sheetPr/>', '');
  sheet2XmlMovedPr = sheet2XmlMovedPr.replace('</sheetViews>', '</sheetViews>\n  <sheetPr/>');
  wbMovedSheetPrB._zip.file('xl/worksheets/sheet2.xml', sheet2XmlMovedPr);
  const bufMovedSheetPrB = await wbMovedSheetPrB._zip.generateAsync({ type: 'nodebuffer' });
  await assert.rejects(
    async () => preserveExactWorkbookDimensions(bufMovedSheetPrB, 'B', origBufB),
    /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/,
    'Moved/reordered sheetPr in Sheet1 must throw BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED'
  );

  // Option B Negative 4: Un-sourced sheetPr added to Part B main sheet ((Part B) Competency)
  const wbPrPartBMain = await XlsxPopulate.fromDataAsync(outBufB);
  let sheet1XmlExtraPr = await wbPrPartBMain._zip.files['xl/worksheets/sheet1.xml'].async('string');
  const existingPrTag = sheet1XmlExtraPr.match(/<sheetPr[^>]*>[\s\S]*?<\/sheetPr>|<sheetPr[^>]*\/>/)[0];
  sheet1XmlExtraPr = sheet1XmlExtraPr.replace(existingPrTag, `${existingPrTag}\n  <sheetPr/>`);
  wbPrPartBMain._zip.file('xl/worksheets/sheet1.xml', sheet1XmlExtraPr);
  const bufPrPartBMain = await wbPrPartBMain._zip.generateAsync({ type: 'nodebuffer' });
  await assert.rejects(
    async () => preserveExactWorkbookDimensions(bufPrPartBMain, 'B', origBufB),
    /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/,
    'Extra sheetPr on Part B main sheet must throw BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED'
  );

  // Option B Negative 5: Un-sourced sheetPr added to Part A
  const wbPrPartA = await XlsxPopulate.fromDataAsync(outBufA);
  let sheet1XmlPartAExtraPr = await wbPrPartA._zip.files['xl/worksheets/sheet1.xml'].async('string');
  const existingPrTagA = sheet1XmlPartAExtraPr.match(/<sheetPr[^>]*>[\s\S]*?<\/sheetPr>|<sheetPr[^>]*\/>/)[0];
  sheet1XmlPartAExtraPr = sheet1XmlPartAExtraPr.replace(existingPrTagA, `${existingPrTagA}\n  <sheetPr/>`);
  wbPrPartA._zip.file('xl/worksheets/sheet1.xml', sheet1XmlPartAExtraPr);
  const bufPrPartA = await wbPrPartA._zip.generateAsync({ type: 'nodebuffer' });
  await assert.rejects(
    async () => preserveExactWorkbookDimensions(bufPrPartA, 'A', origBufA),
    /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/,
    'Extra sheetPr on Part A must throw BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED'
  );

  // Option B Negative 6: Unknown/different observed-only sheetPr (<sheetPr codeName="BadSheet"/>)
  const wbUnknownSheetPr = await XlsxPopulate.fromDataAsync(outBufB);
  let sheet2XmlUnknownPr = await wbUnknownSheetPr._zip.files['xl/worksheets/sheet2.xml'].async('string');
  sheet2XmlUnknownPr = sheet2XmlUnknownPr.replace('<sheetPr/>', '<sheetPr codeName="BadSheet"/>');
  wbUnknownSheetPr._zip.file('xl/worksheets/sheet2.xml', sheet2XmlUnknownPr);
  const bufUnknownSheetPr = await wbUnknownSheetPr._zip.generateAsync({ type: 'nodebuffer' });
  await assert.rejects(
    async () => preserveExactWorkbookDimensions(bufUnknownSheetPr, 'B', origBufB),
    /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/,
    'Unknown observed-only sheetPr must throw BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED'
  );

  // Option B Negative 7: Source unexpectedly containing sheetPr in Sheet1
  const wbSrcWithPr = await XlsxPopulate.fromDataAsync(origBufB);
  let sheet2XmlSrcWithPr = await wbSrcWithPr._zip.files['xl/worksheets/sheet2.xml'].async('string');
  sheet2XmlSrcWithPr = sheet2XmlSrcWithPr.replace('<sheetViews>', '<sheetPr/>\n  <sheetViews>');
  wbSrcWithPr._zip.file('xl/worksheets/sheet2.xml', sheet2XmlSrcWithPr);
  const bufSrcWithPr = await wbSrcWithPr._zip.generateAsync({ type: 'nodebuffer' });
  await assert.rejects(
    async () => preserveExactWorkbookDimensions(outBufB, 'B', bufSrcWithPr),
    /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/,
    'Source unexpectedly containing sheetPr in Sheet1 must throw BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED'
  );

  // --- MANDATORY XML-INVENTORY / SCHEMA NEGATIVE TESTS ---

  // XML Negative 1: Namespace prefix containing dot or valid QName character (<ns.1:Relationship ...>)
  const wbDotPrefixRel = await XlsxPopulate.fromDataAsync(outBufB);
  let relsXmlDotPrefix = await wbDotPrefixRel._zip.files['xl/_rels/workbook.xml.rels'].async('string');
  relsXmlDotPrefix = relsXmlDotPrefix.replace(/(<Relationship [^>]*Id="rId1"[^>]*\/>)/, '$1\n  <ns.1:Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>');
  wbDotPrefixRel._zip.file('xl/_rels/workbook.xml.rels', relsXmlDotPrefix);
  const bufDotPrefixRel = await wbDotPrefixRel._zip.generateAsync({ type: 'nodebuffer' });
  await assert.rejects(
    async () => preserveExactWorkbookDimensions(bufDotPrefixRel, 'B', origBufB),
    /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/,
    'Namespace prefix with dot in Relationship tag must throw BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED'
  );

  // XML Negative 2: Unknown/prefixed worksheet top-level child (<x:sheetPr> or <unknownElement>)
  const wbUnknownChild = await XlsxPopulate.fromDataAsync(outBufB);
  let sheet1XmlUnknownChild = await wbUnknownChild._zip.files['xl/worksheets/sheet1.xml'].async('string');
  sheet1XmlUnknownChild = sheet1XmlUnknownChild.replace('<sheetPr', '<unknownElement/><sheetPr');
  wbUnknownChild._zip.file('xl/worksheets/sheet1.xml', sheet1XmlUnknownChild);
  const bufUnknownChild = await wbUnknownChild._zip.generateAsync({ type: 'nodebuffer' });
  await assert.rejects(
    async () => preserveExactWorkbookDimensions(bufUnknownChild, 'B', origBufB),
    /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/,
    'Unknown worksheet top-level child must throw BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED'
  );

  // XML Negative 3: Duplicate top-level maxOccurs=1 schema child (<sheetViews> duplicated)
  const wbDupSheetViews = await XlsxPopulate.fromDataAsync(outBufB);
  let sheet1XmlDupViews = await wbDupSheetViews._zip.files['xl/worksheets/sheet1.xml'].async('string');
  const viewsMatch = sheet1XmlDupViews.match(/<sheetViews>[\s\S]*?<\/sheetViews>/)[0];
  sheet1XmlDupViews = sheet1XmlDupViews.replace(viewsMatch, `${viewsMatch}\n  ${viewsMatch}`);
  wbDupSheetViews._zip.file('xl/worksheets/sheet1.xml', sheet1XmlDupViews);
  const bufDupSheetViews = await wbDupSheetViews._zip.generateAsync({ type: 'nodebuffer' });
  await assert.rejects(
    async () => preserveExactWorkbookDimensions(bufDupSheetViews, 'B', origBufB),
    /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/,
    'Duplicate maxOccurs=1 sheetViews child must throw BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED'
  );

  // XML Negative 4: Repeated // Target alias
  const wbRepeatedSlash = await XlsxPopulate.fromDataAsync(outBufB);
  let relsXmlRepeatedSlash = await wbRepeatedSlash._zip.files['xl/_rels/workbook.xml.rels'].async('string');
  relsXmlRepeatedSlash = relsXmlRepeatedSlash.replace('Target="worksheets/sheet1.xml"', 'Target="worksheets//sheet1.xml"');
  wbRepeatedSlash._zip.file('xl/_rels/workbook.xml.rels', relsXmlRepeatedSlash);
  const bufRepeatedSlash = await wbRepeatedSlash._zip.generateAsync({ type: 'nodebuffer' });
  await assert.rejects(
    async () => preserveExactWorkbookDimensions(bufRepeatedSlash, 'B', origBufB),
    /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/,
    'Repeated slash // Target alias must throw BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED'
  );

  // XML Negative 5: Leading ./ Target alias
  const wbLeadingDotSlash = await XlsxPopulate.fromDataAsync(outBufB);
  let relsXmlLeadingDotSlash = await wbLeadingDotSlash._zip.files['xl/_rels/workbook.xml.rels'].async('string');
  relsXmlLeadingDotSlash = relsXmlLeadingDotSlash.replace('Target="worksheets/sheet1.xml"', 'Target="./worksheets/sheet1.xml"');
  wbLeadingDotSlash._zip.file('xl/_rels/workbook.xml.rels', relsXmlLeadingDotSlash);
  const bufLeadingDotSlash = await wbLeadingDotSlash._zip.generateAsync({ type: 'nodebuffer' });
  await assert.rejects(
    async () => preserveExactWorkbookDimensions(bufLeadingDotSlash, 'B', origBufB),
    /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/,
    'Leading ./ Target alias must throw BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED'
  );

  // XML Negative 6: Embedded /./ Target alias
  const wbEmbeddedDotSlash = await XlsxPopulate.fromDataAsync(outBufB);
  let relsXmlEmbeddedDotSlash = await wbEmbeddedDotSlash._zip.files['xl/_rels/workbook.xml.rels'].async('string');
  relsXmlEmbeddedDotSlash = relsXmlEmbeddedDotSlash.replace('Target="worksheets/sheet1.xml"', 'Target="worksheets/./sheet1.xml"');
  wbEmbeddedDotSlash._zip.file('xl/_rels/workbook.xml.rels', relsXmlEmbeddedDotSlash);
  const bufEmbeddedDotSlash = await wbEmbeddedDotSlash._zip.generateAsync({ type: 'nodebuffer' });
  await assert.rejects(
    async () => preserveExactWorkbookDimensions(bufEmbeddedDotSlash, 'B', origBufB),
    /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/,
    'Embedded /./ Target alias must throw BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED'
  );

  // XML Negative 7: Full URI scheme/authority Target form (http://example.com/sheet1.xml)
  const wbFullUriScheme = await XlsxPopulate.fromDataAsync(outBufB);
  let relsXmlUriScheme = await wbFullUriScheme._zip.files['xl/_rels/workbook.xml.rels'].async('string');
  relsXmlUriScheme = relsXmlUriScheme.replace('Target="worksheets/sheet1.xml"', 'Target="http://example.com/sheet1.xml"');
  wbFullUriScheme._zip.file('xl/_rels/workbook.xml.rels', relsXmlUriScheme);
  const bufFullUriScheme = await wbFullUriScheme._zip.generateAsync({ type: 'nodebuffer' });
  await assert.rejects(
    async () => preserveExactWorkbookDimensions(bufFullUriScheme, 'B', origBufB),
    /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/,
    'Full URI scheme/authority Target form must throw BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED'
  );

  // XML Negative 8: Query Target form (worksheets/sheet1.xml?v=1)
  const wbQueryTarget = await XlsxPopulate.fromDataAsync(outBufB);
  let relsXmlQueryTarget = await wbQueryTarget._zip.files['xl/_rels/workbook.xml.rels'].async('string');
  relsXmlQueryTarget = relsXmlQueryTarget.replace('Target="worksheets/sheet1.xml"', 'Target="worksheets/sheet1.xml?v=1"');
  wbQueryTarget._zip.file('xl/_rels/workbook.xml.rels', relsXmlQueryTarget);
  const bufQueryTarget = await wbQueryTarget._zip.generateAsync({ type: 'nodebuffer' });
  await assert.rejects(
    async () => preserveExactWorkbookDimensions(bufQueryTarget, 'B', origBufB),
    /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/,
    'Query Target form must throw BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED'
  );

  // XML Negative 9: Fragment Target form (worksheets/sheet1.xml#frag)
  const wbFragTarget = await XlsxPopulate.fromDataAsync(outBufB);
  let relsXmlFragTarget = await wbFragTarget._zip.files['xl/_rels/workbook.xml.rels'].async('string');
  relsXmlFragTarget = relsXmlFragTarget.replace('Target="worksheets/sheet1.xml"', 'Target="worksheets/sheet1.xml#frag"');
  wbFragTarget._zip.file('xl/_rels/workbook.xml.rels', relsXmlFragTarget);
  const bufFragTarget = await wbFragTarget._zip.generateAsync({ type: 'nodebuffer' });
  await assert.rejects(
    async () => preserveExactWorkbookDimensions(bufFragTarget, 'B', origBufB),
    /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/,
    'Fragment Target form must throw BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED'
  );

  // --- MANDATORY RESTORED R3-R24 PRESERVATION NEGATIVE TESTS ---

  // 1. Invalid partKey
  await assert.rejects(
    async () => preserveExactWorkbookDimensions(outBufA, 'C'),
    /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/,
    'Invalid partKey C must throw BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED'
  );

  // 2. Missing partKey
  await assert.rejects(
    async () => preserveExactWorkbookDimensions(outBufA, null),
    /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/,
    'Missing partKey null must throw BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED'
  );

  // 3. Wrong-SHA source override
  const bufWrongShaSource = Buffer.from(origBufB);
  bufWrongShaSource[bufWrongShaSource.length - 1] ^= 0xff;
  await assert.rejects(
    async () => preserveExactWorkbookDimensions(outBufB, 'B', bufWrongShaSource),
    /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/,
    'Arbitrary/wrong-SHA sourceBufOverride must throw BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED'
  );

  // 4. Missing relationship (remove rId1 from workbook.xml.rels)
  const wbMissingRel = await XlsxPopulate.fromDataAsync(outBufB);
  let relsXmlMissing = await wbMissingRel._zip.files['xl/_rels/workbook.xml.rels'].async('string');
  relsXmlMissing = relsXmlMissing.replace(/<Relationship [^>]*Id="rId1"[^>]*\/>/, '');
  wbMissingRel._zip.file('xl/_rels/workbook.xml.rels', relsXmlMissing);
  const bufMissingRel = await wbMissingRel._zip.generateAsync({ type: 'nodebuffer' });
  await assert.rejects(
    async () => preserveExactWorkbookDimensions(bufMissingRel, 'B', origBufB),
    /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/,
    'Missing relationship must throw BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED'
  );

  // 5. Duplicate relationship ID
  const wbDupRel = await XlsxPopulate.fromDataAsync(outBufB);
  let relsXmlDup = await wbDupRel._zip.files['xl/_rels/workbook.xml.rels'].async('string');
  relsXmlDup = relsXmlDup.replace(/(<Relationship [^>]*Id="rId1"[^>]*\/>)/, '$1\n  $1');
  wbDupRel._zip.file('xl/_rels/workbook.xml.rels', relsXmlDup);
  const bufDupRel = await wbDupRel._zip.generateAsync({ type: 'nodebuffer' });
  await assert.rejects(
    async () => preserveExactWorkbookDimensions(bufDupRel, 'B', origBufB),
    /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/,
    'Duplicate relationship ID must throw BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED'
  );

  // 6. Duplicate worksheet target
  const wbDupTarget = await XlsxPopulate.fromDataAsync(outBufB);
  let relsXmlDupTarget = await wbDupTarget._zip.files['xl/_rels/workbook.xml.rels'].async('string');
  relsXmlDupTarget = relsXmlDupTarget.replace('Target="worksheets/sheet2.xml"', 'Target="worksheets/sheet1.xml"');
  wbDupTarget._zip.file('xl/_rels/workbook.xml.rels', relsXmlDupTarget);
  const bufDupTarget = await wbDupTarget._zip.generateAsync({ type: 'nodebuffer' });
  await assert.rejects(
    async () => preserveExactWorkbookDimensions(bufDupTarget, 'B', origBufB),
    /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/,
    'Duplicate worksheet target must throw BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED'
  );

  // 7. Actual relationship-target swap while sheet names/order remain unchanged
  const wbSwapTargets = await XlsxPopulate.fromDataAsync(outBufB);
  let relsXmlSwap = await wbSwapTargets._zip.files['xl/_rels/workbook.xml.rels'].async('string');
  relsXmlSwap = relsXmlSwap.replace('Target="worksheets/sheet1.xml"', 'Target="worksheets/sheet2_TEMP.xml"');
  relsXmlSwap = relsXmlSwap.replace('Target="worksheets/sheet2.xml"', 'Target="worksheets/sheet1.xml"');
  relsXmlSwap = relsXmlSwap.replace('Target="worksheets/sheet2_TEMP.xml"', 'Target="worksheets/sheet2.xml"');
  wbSwapTargets._zip.file('xl/_rels/workbook.xml.rels', relsXmlSwap);
  const bufSwapTargets = await wbSwapTargets._zip.generateAsync({ type: 'nodebuffer' });
  await assert.rejects(
    async () => preserveExactWorkbookDimensions(bufSwapTargets, 'B', origBufB),
    /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/,
    'Swapped relationship targets must throw BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED'
  );

  // 8. Cross-sheet mapping (sheet r:id swapped in workbook.xml)
  const wbCrossSheet = await XlsxPopulate.fromDataAsync(outBufB);
  let wbXmlCross = await wbCrossSheet._zip.files['xl/workbook.xml'].async('string');
  wbXmlCross = wbXmlCross.replace('r:id="rId1"', 'r:id="rId_TEMP"');
  wbXmlCross = wbXmlCross.replace('r:id="rId2"', 'r:id="rId1"');
  wbXmlCross = wbXmlCross.replace('r:id="rId_TEMP"', 'r:id="rId2"');
  wbCrossSheet._zip.file('xl/workbook.xml', wbXmlCross);
  const bufCrossSheet = await wbCrossSheet._zip.generateAsync({ type: 'nodebuffer' });
  await assert.rejects(
    async () => preserveExactWorkbookDimensions(bufCrossSheet, 'B', origBufB),
    /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/,
    'Cross-sheet mapping must throw BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED'
  );

  // 9. Non-worksheet Type/target
  const wbNonWsType = await XlsxPopulate.fromDataAsync(outBufB);
  let relsXmlNonWs = await wbNonWsType._zip.files['xl/_rels/workbook.xml.rels'].async('string');
  relsXmlNonWs = relsXmlNonWs.replace(/Type="[^"]*\/worksheet"/, 'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles"');
  wbNonWsType._zip.file('xl/_rels/workbook.xml.rels', relsXmlNonWs);
  const bufNonWsType = await wbNonWsType._zip.generateAsync({ type: 'nodebuffer' });
  await assert.rejects(
    async () => preserveExactWorkbookDimensions(bufNonWsType, 'B', origBufB),
    /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/,
    'Non-worksheet Type must throw BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED'
  );

  // 10. External target/TargetMode
  const wbExternalTarget = await XlsxPopulate.fromDataAsync(outBufB);
  let relsXmlExt = await wbExternalTarget._zip.files['xl/_rels/workbook.xml.rels'].async('string');
  relsXmlExt = relsXmlExt.replace('<Relationship Id="rId1"', '<Relationship Id="rId1" TargetMode="External"');
  wbExternalTarget._zip.file('xl/_rels/workbook.xml.rels', relsXmlExt);
  const bufExternalTarget = await wbExternalTarget._zip.generateAsync({ type: 'nodebuffer' });
  await assert.rejects(
    async () => preserveExactWorkbookDimensions(bufExternalTarget, 'B', origBufB),
    /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/,
    'External TargetMode must throw BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED'
  );

  // 11. Missing source dimension
  const wbSrcNoDim = await XlsxPopulate.fromDataAsync(origBufB);
  let sheet1SrcNoDim = await wbSrcNoDim._zip.files['xl/worksheets/sheet1.xml'].async('string');
  sheet1SrcNoDim = sheet1SrcNoDim.replace(/<dimension [^>]*\/>/, '');
  wbSrcNoDim._zip.file('xl/worksheets/sheet1.xml', sheet1SrcNoDim);
  const bufSrcNoDim = await wbSrcNoDim._zip.generateAsync({ type: 'nodebuffer' });
  await assert.rejects(
    async () => preserveExactWorkbookDimensions(outBufB, 'B', bufSrcNoDim),
    /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/,
    'Missing source dimension tag must throw BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED'
  );

  // 12. Multiple source dimensions
  const wbSrcDupDim = await XlsxPopulate.fromDataAsync(origBufB);
  let sheet1SrcDupDim = await wbSrcDupDim._zip.files['xl/worksheets/sheet1.xml'].async('string');
  const dimTag = sheet1SrcDupDim.match(/<dimension [^>]*\/>/)[0];
  sheet1SrcDupDim = sheet1SrcDupDim.replace(dimTag, `${dimTag}\n  ${dimTag}`);
  wbSrcDupDim._zip.file('xl/worksheets/sheet1.xml', sheet1SrcDupDim);
  const bufSrcDupDim = await wbSrcDupDim._zip.generateAsync({ type: 'nodebuffer' });
  await assert.rejects(
    async () => preserveExactWorkbookDimensions(outBufB, 'B', bufSrcDupDim),
    /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/,
    'Multiple source dimension tags must throw BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED'
  );

  // 13. Conflicting observed dimension
  const wbObsBadDim = await XlsxPopulate.fromDataAsync(outBufB);
  let sheet1ObsBadDim = await wbObsBadDim._zip.files['xl/worksheets/sheet1.xml'].async('string');
  sheet1ObsBadDim = sheet1ObsBadDim.replace('</sheetPr>', '</sheetPr>\n  <dimension ref="A1:Z99"/>');
  wbObsBadDim._zip.file('xl/worksheets/sheet1.xml', sheet1ObsBadDim);
  const bufObsBadDim = await wbObsBadDim._zip.generateAsync({ type: 'nodebuffer' });
  await assert.rejects(
    async () => preserveExactWorkbookDimensions(bufObsBadDim, 'B', origBufB),
    /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/,
    'Conflicting observed dimension tag must throw BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED'
  );

  // 14. Multiple observed dimensions
  const wbObsDupDim = await XlsxPopulate.fromDataAsync(outBufB);
  let sheet1ObsDupDim = await wbObsDupDim._zip.files['xl/worksheets/sheet1.xml'].async('string');
  sheet1ObsDupDim = sheet1ObsDupDim.replace('</sheetPr>', '</sheetPr>\n  <dimension ref="A1:X35"/>\n  <dimension ref="A1:X35"/>');
  wbObsDupDim._zip.file('xl/worksheets/sheet1.xml', sheet1ObsDupDim);
  const bufObsDupDim = await wbObsDupDim._zip.generateAsync({ type: 'nodebuffer' });
  await assert.rejects(
    async () => preserveExactWorkbookDimensions(bufObsDupDim, 'B', origBufB),
    /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/,
    'Multiple observed dimension tags must throw BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED'
  );

  // 15. Malformed source XML
  const wbSrcMalformed = await XlsxPopulate.fromDataAsync(origBufB);
  wbSrcMalformed._zip.file('xl/worksheets/sheet1.xml', '<worksheet><invalidXml');
  const bufSrcMalformed = await wbSrcMalformed._zip.generateAsync({ type: 'nodebuffer' });
  await assert.rejects(
    async () => preserveExactWorkbookDimensions(outBufB, 'B', bufSrcMalformed),
    /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/,
    'Malformed source XML must throw BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED'
  );

  // 16. Malformed observed XML
  const wbObsMalformed = await XlsxPopulate.fromDataAsync(outBufB);
  wbObsMalformed._zip.file('xl/worksheets/sheet1.xml', '<worksheet><invalidXml');
  const bufObsMalformed = await wbObsMalformed._zip.generateAsync({ type: 'nodebuffer' });
  await assert.rejects(
    async () => preserveExactWorkbookDimensions(bufObsMalformed, 'B', origBufB),
    /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/,
    'Malformed observed XML must throw BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED'
  );

  // --- R3-R22 REGRESSION MUTATION NEGATIVE TESTS (FROM KNOWN-VALID SOURCE BASELINE) ---

  // Negative Test 1: Wrong printArea binding assigned to Sheet1
  const fpMutSheet1PrintArea = JSON.parse(JSON.stringify(fpOrigB));
  fpMutSheet1PrintArea.sheets['Sheet1'].printArea = "'(Part B) Competency'!$A$1:$X$35";
  await assert.rejects(
    async () => validateWorkbookParity(origBufB, 'B', fpMutSheet1PrintArea),
    /BLOCKER_WORKBOOK_PARITY_UNRESOLVED/,
    'Assigning non-empty printArea to Sheet1 must throw BLOCKER_WORKBOOK_PARITY_UNRESOLVED'
  );

  // Negative Test 2: Blanking/removing one worksheet dimension evidence from valid source baseline
  const fpMutBlankDimension = JSON.parse(JSON.stringify(fpOrigB));
  fpMutBlankDimension.sheets['(Part B) Competency'].dimension = '';
  await assert.rejects(
    async () => validateWorkbookParity(origBufB, 'B', fpMutBlankDimension),
    /BLOCKER_WORKBOOK_PARITY_UNRESOLVED/,
    'Blanking worksheet dimension evidence must throw BLOCKER_WORKBOOK_PARITY_UNRESOLVED'
  );

  // Negative Test 3: Part B second-sheet colsHash mutation from valid source baseline
  const fpMutSheet1Cols = JSON.parse(JSON.stringify(fpOrigB));
  fpMutSheet1Cols.sheets['Sheet1'].colsHash = 'bad_cols_hash_999';
  await assert.rejects(
    async () => validateWorkbookParity(origBufB, 'B', fpMutSheet1Cols),
    /BLOCKER_WORKBOOK_PARITY_UNRESOLVED/,
    'Mutating Sheet1 column structure hash must throw BLOCKER_WORKBOOK_PARITY_UNRESOLVED'
  );

  // Negative Test 4: Deterministic Blocker Normalization (BigInt value in fingerprint from valid source baseline)
  const fpMutNonSerializable = JSON.parse(JSON.stringify(fpOrigB));
  fpMutNonSerializable.sheetNames = [BigInt(12345)];
  await assert.rejects(
    async () => validateWorkbookParity(origBufB, 'B', fpMutNonSerializable),
    /BLOCKER_WORKBOOK_PARITY_UNRESOLVED/,
    'Non-serializable field in observed fingerprint must throw BLOCKER_WORKBOOK_PARITY_UNRESOLVED'
  );

  // Negative Test 5: Reorder sheets from valid source baseline
  const fpMutSheetOrder = JSON.parse(JSON.stringify(fpOrigB));
  fpMutSheetOrder.sheetNames = ['Sheet1', '(Part B) Competency'];
  await assert.rejects(
    async () => validateWorkbookParity(origBufB, 'B', fpMutSheetOrder),
    /BLOCKER_WORKBOOK_PARITY_UNRESOLVED/,
    'Reordering worksheets must throw BLOCKER_WORKBOOK_PARITY_UNRESOLVED'
  );

  // Negative Test 6: Mutate merge count from valid source baseline
  const fpMutMerge = JSON.parse(JSON.stringify(fpOrigB));
  fpMutMerge.sheets['(Part B) Competency'].rawMergeCount = 78;
  await assert.rejects(
    async () => validateWorkbookParity(origBufB, 'B', fpMutMerge),
    /BLOCKER_WORKBOOK_PARITY_UNRESOLVED/,
    'Mutating merge count must throw BLOCKER_WORKBOOK_PARITY_UNRESOLVED'
  );

  // Negative Test 7: Mutate page setup / orientation from valid source baseline
  const fpMutSetup = JSON.parse(JSON.stringify(fpOrigB));
  fpMutSetup.sheets['(Part B) Competency'].orientation = 'landscape';
  await assert.rejects(
    async () => validateWorkbookParity(origBufB, 'B', fpMutSetup),
    /BLOCKER_WORKBOOK_PARITY_UNRESOLVED/,
    'Mutating page orientation must throw BLOCKER_WORKBOOK_PARITY_UNRESOLVED'
  );

  // Negative Test 8: Mutate sheet protection from valid source baseline
  const fpMutProtection = JSON.parse(JSON.stringify(fpOrigB));
  fpMutProtection.sheets['(Part B) Competency'].sheetProtection = 'none';
  await assert.rejects(
    async () => validateWorkbookParity(origBufB, 'B', fpMutProtection),
    /BLOCKER_WORKBOOK_PARITY_UNRESOLVED/,
    'Mutating Part B sheet protection must throw BLOCKER_WORKBOOK_PARITY_UNRESOLVED'
  );

  // --- ACTUAL <dimension> TAG REMOVAL FROM KNOWN-VALID SOURCE ---
  const wbOrigBZip = await XlsxPopulate.fromDataAsync(origBufB);
  let sheet1XmlSource = await wbOrigBZip._zip.files['xl/worksheets/sheet1.xml'].async('string');
  assert.equal(sheet1XmlSource.includes('<dimension'), true, 'Exact source Part B sheet1.xml must contain actual <dimension> tag before mutation');

  const sheet1XmlNoDim = sheet1XmlSource.replace(/<dimension [^>]*\/>/, '');
  assert.equal(sheet1XmlNoDim.includes('<dimension'), false, 'Mutation must remove <dimension> tag from XML');

  wbOrigBZip._zip.file('xl/worksheets/sheet1.xml', sheet1XmlNoDim);
  const bufBNoDim = await wbOrigBZip._zip.generateAsync({ type: 'nodebuffer' });

  await assert.rejects(
    async () => validateWorkbookParity(bufBNoDim, 'B'),
    /BLOCKER_WORKBOOK_PARITY_UNRESOLVED/,
    'Removing actual <dimension> tag from known-valid source buffer must throw BLOCKER_WORKBOOK_PARITY_UNRESOLVED'
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
