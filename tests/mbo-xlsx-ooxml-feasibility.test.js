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
  getHeaderCellFingerprints,
  validateHeaderFingerprintParity,
  getWorkbookFingerprint,
  validateWorkbookParity,
  inspectRawWorksheetOOXML,
  getWorksheetFormulaSet,
  resolvePartBPrivacyRoles,
  buildPartBSourceEvidenceInventory,
  getTypedPrivacyMetadata,
  validateTypedPrivacyMetadata,
  validateRawTargetLexical,
  parseGlobalRelsXml,
  parseWorksheetTopLevelChildren,
  validateWorksheetSchemaOrder,
  matchAndNormalizeOptionBSheetPr,
  OPENXML_WORKSHEET_CHILD_ORDER,
  MAX_OCCURS_ONE_CHILDREN,
  SENSITIVE_RANGES_A,
  SENSITIVE_RANGES_B,
  EXPECTED_PART_A_SHA,
  EXPECTED_PART_B_SHA
} from '../scripts/export/mbo-xlsx-ooxml-feasibility.js';

// ============================================================================
// ALWAYS-RUNNABLE PRIVACY-SAFE UNIT TESTS (NO TEMPLATE BINARIES REQUIRED)
// ============================================================================

test('UNIT_TARGET_LEXICAL_VALIDATION: strict raw Target lexical identity enforcement', () => {
  assert.equal(validateRawTargetLexical('worksheets/sheet1.xml'), true, 'Valid relative target must pass');
  assert.equal(validateRawTargetLexical('worksheets/sheet2.xml'), true, 'Valid relative target 2 must pass');

  // Explicit alias negatives
  assert.equal(validateRawTargetLexical('/worksheets/sheet1.xml'), false, 'Leading slash / must be rejected');
  assert.equal(validateRawTargetLexical('/xl/worksheets/sheet1.xml'), false, 'Leading slash /xl/ must be rejected');
  assert.equal(validateRawTargetLexical('xl/worksheets/sheet1.xml'), false, 'Already xl/ prefix must be rejected');
  assert.equal(validateRawTargetLexical('./worksheets/sheet1.xml'), false, 'Leading ./ must be rejected');
  assert.equal(validateRawTargetLexical('worksheets/./sheet1.xml'), false, 'Embedded /./ must be rejected');
  assert.equal(validateRawTargetLexical('worksheets/../worksheets/sheet1.xml'), false, 'Traversal .. must be rejected');
  assert.equal(validateRawTargetLexical('worksheets//sheet1.xml'), false, 'Repeated // slashes must be rejected');
  assert.equal(validateRawTargetLexical('worksheets\\sheet1.xml'), false, 'Backslash \\ must be rejected');
  assert.equal(validateRawTargetLexical('worksheets/%2e/sheet1.xml'), false, 'Percent encoding % must be rejected');
  assert.equal(validateRawTargetLexical('http://example.com/sheet1.xml'), false, 'URI scheme http: must be rejected');
  assert.equal(validateRawTargetLexical('file:///C:/sheet1.xml'), false, 'URI scheme file: must be rejected');
  assert.equal(validateRawTargetLexical('worksheets/sheet1.xml?v=1'), false, 'Query string ? must be rejected');
  assert.equal(validateRawTargetLexical('worksheets/sheet1.xml#frag'), false, 'Fragment # must be rejected');
  assert.equal(validateRawTargetLexical(''), false, 'Empty target must be rejected');
});

test('UNIT_XML_GLOBAL_RELS_INVENTORY: coverage-complete Relationship inventory & prefix/QName rejection', () => {
  const validRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

  const parsed = parseGlobalRelsXml(validRelsXml);
  assert.ok(parsed.rId1, 'rId1 must be parsed');
  assert.equal(parsed.rId1.rawTarget, 'worksheets/sheet1.xml');
  assert.equal(parsed.rId1.zipPath, 'xl/worksheets/sheet1.xml');
  assert.ok(parsed.rId2, 'rId2 must be parsed');

  // Prefixed Relationship tags (standard, dotted, Unicode)
  assert.throws(() => parseGlobalRelsXml(validRelsXml.replace('<Relationship Id="rId1"', '<r:Relationship Id="rId1"')), /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/, 'Prefixed <r:Relationship> must fail closed');
  assert.throws(() => parseGlobalRelsXml(validRelsXml.replace('<Relationship Id="rId1"', '<ns.1:Relationship Id="rId1"')), /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/, 'Dotted prefix <ns.1:Relationship> must fail closed');
  assert.throws(() => parseGlobalRelsXml(validRelsXml.replace('<Relationship Id="rId1"', '<pkg:Relationship Id="rId1"')), /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/, 'Pkg prefix <pkg:Relationship> must fail closed');

  // Unconsumed text / junk markup inside <Relationships>
  assert.throws(() => parseGlobalRelsXml(validRelsXml.replace('</Relationships>', 'junkText</Relationships>')), /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/, 'Unconsumed text inside <Relationships> must fail closed');
  assert.throws(() => parseGlobalRelsXml(validRelsXml.replace('</Relationships>', '<unknownChild/></Relationships>')), /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/, 'Unknown child inside <Relationships> must fail closed');

  // Global duplicate rId across worksheet and non-worksheet types
  const dupIdXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;
  assert.throws(() => parseGlobalRelsXml(dupIdXml), /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/, 'Global duplicate rId across worksheet/non-worksheet must fail closed');
});

test('UNIT_WORKSHEET_CHILDREN_INVENTORY: coverage-complete top-level child & schema singleton checks', () => {
  const validWsXml = `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetPr/>
  <dimension ref="A1:X35"/>
  <sheetViews><sheetView tabSelected="1" workbookViewId="0"/></sheetViews>
  <sheetData/>
</worksheet>`;

  const children = parseWorksheetTopLevelChildren(validWsXml);
  assert.equal(children.length, 4, 'Four top-level children parsed');
  assert.equal(children[0].name, 'sheetPr');
  assert.equal(children[1].name, 'dimension');
  assert.equal(children[2].name, 'sheetViews');
  assert.equal(children[3].name, 'sheetData');
  assert.equal(validateWorksheetSchemaOrder(children), true, 'Valid schema order must return true');

  // Prefixed worksheet child (ASCII, Unicode)
  assert.throws(() => parseWorksheetTopLevelChildren(validWsXml.replace('<sheetPr/>', '<x:sheetPr/>')), /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/, 'Prefixed <x:sheetPr> must fail closed');
  assert.throws(() => parseWorksheetTopLevelChildren(validWsXml.replace('<sheetPr/>', '<ns:sheetPr/>')), /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/, 'Prefixed <ns:sheetPr> must fail closed');

  // Unknown element not in schema order
  assert.throws(() => parseWorksheetTopLevelChildren(validWsXml.replace('<sheetPr/>', '<customElement/>')), /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/, 'Unknown <customElement> must fail closed');

  // Unconsumed text / junk markup inside <worksheet>
  assert.throws(() => parseWorksheetTopLevelChildren(validWsXml.replace('</worksheet>', 'junkText</worksheet>')), /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/, 'Unconsumed text inside <worksheet> must fail closed');

  // Independent maxOccurs=1 duplicate check (duplicate sheetViews)
  const dupViewsXml = validWsXml.replace('<sheetViews>', '<sheetViews><sheetView tabSelected="1" workbookViewId="0"/></sheetViews>\n  <sheetViews>');
  assert.throws(() => parseWorksheetTopLevelChildren(dupViewsXml), /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/, 'Duplicate maxOccurs=1 sheetViews must fail closed');
});

test('UNIT_OPTION_B_SHEETPR_MATCHER_AND_NORMALIZER: Option B exact matcher and write-back persistence verification', () => {
  const srcSheet1Xml = `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <dimension ref="A1:A1"/>
  <sheetViews><sheetView tabSelected="1" workbookViewId="0"/></sheetViews>
</worksheet>`;

  const obsSheet1XmlWithPrNoDim = `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetPr/>
  <sheetViews><sheetView tabSelected="1" workbookViewId="0"/></sheetViews>
</worksheet>`;

  const obsSheet1XmlWithPrAndDim = `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetPr/>
  <dimension ref="A1:A1"/>
  <sheetViews><sheetView tabSelected="1" workbookViewId="0"/></sheetViews>
</worksheet>`;

  const srcChildren = parseWorksheetTopLevelChildren(srcSheet1Xml);
  const obsChildrenNoDim = parseWorksheetTopLevelChildren(obsSheet1XmlWithPrNoDim);
  const obsChildrenWithDim = parseWorksheetTopLevelChildren(obsSheet1XmlWithPrAndDim);

  // 1. Option B match & normalize when dimension is absent
  const normResultNoDim = matchAndNormalizeOptionBSheetPr(obsSheet1XmlWithPrNoDim, srcChildren, obsChildrenNoDim, 'worksheets/sheet2.xml', 'B');
  assert.equal(normResultNoDim.normalized, true, 'Option B normalization must succeed for Part B Sheet1 when dimension is absent');
  assert.equal(normResultNoDim.obsXml.includes('<sheetPr/>'), false, 'Normalized XML must NOT contain <sheetPr/>');
  assert.equal(normResultNoDim.obsChildren[0].name, 'sheetViews', 'First top-level child must now be sheetViews');

  // 2. Option B match & normalize when dimension is already present (PROVES FIX FOR BLOCKER 1)
  const normResultWithDim = matchAndNormalizeOptionBSheetPr(obsSheet1XmlWithPrAndDim, srcChildren, obsChildrenWithDim, 'worksheets/sheet2.xml', 'B');
  assert.equal(normResultWithDim.normalized, true, 'Option B normalization must succeed for Part B Sheet1 when dimension is present');
  assert.equal(normResultWithDim.obsXml.includes('<sheetPr/>'), false, 'Normalized XML must NOT contain <sheetPr/>');
  assert.equal(normResultWithDim.obsChildren[0].name, 'dimension', 'First top-level child must now be dimension');

  // 3. Option B rejects normalization when partKey === 'A'
  const normResultPartA = matchAndNormalizeOptionBSheetPr(obsSheet1XmlWithPrNoDim, srcChildren, obsChildrenNoDim, 'worksheets/sheet2.xml', 'A');
  assert.equal(normResultPartA.normalized, false, 'Part A must not normalize sheetPr');

  // 4. Option B rejects normalization when target is Part B main sheet (worksheets/sheet1.xml)
  const normResultPartBMain = matchAndNormalizeOptionBSheetPr(obsSheet1XmlWithPrNoDim, srcChildren, obsChildrenNoDim, 'worksheets/sheet1.xml', 'B');
  assert.equal(normResultPartBMain.normalized, false, 'Part B main sheet must not normalize sheetPr');

  // 5. Fail closed if sheetPr has modified attributes
  const obsSheet1ModifiedPr = obsSheet1XmlWithPrNoDim.replace('<sheetPr/>', '<sheetPr pageSetUpPr="1"/>');
  const obsChildrenModPr = parseWorksheetTopLevelChildren(obsSheet1ModifiedPr);
  assert.throws(() => matchAndNormalizeOptionBSheetPr(obsSheet1ModifiedPr, srcChildren, obsChildrenModPr, 'worksheets/sheet2.xml', 'B'), /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/, 'Modified sheetPr attributes must fail closed');

  // 6. Option B rejects normalization if sheetPr is moved (slot index > 0)
  const obsSheet1MovedPr = `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews><sheetView tabSelected="1" workbookViewId="0"/></sheetViews>
  <sheetPr/>
</worksheet>`;
  const obsChildrenMovedPr = parseWorksheetTopLevelChildren(obsSheet1MovedPr);
  const normResultMovedPr = matchAndNormalizeOptionBSheetPr(obsSheet1MovedPr, srcChildren, obsChildrenMovedPr, 'worksheets/sheet2.xml', 'B');
  assert.equal(normResultMovedPr.normalized, false, 'Moved sheetPr must not normalize');
});

// ============================================================================
// TEMPLATE-DEPENDENT INTEGRATION TESTS (SKIP SAFELY IF LOCAL TEMPLATES ABSENT)
// ============================================================================

test('FEASIBILITY_TEMPLATE_SHA_VERIFICATION: local owner template SHA-256 hashes match exact baseline evidence', (t) => {
  const found = findLocalSourceTemplates();
  if (!found) {
    t.skip('Local owner templates unavailable in this environment');
    return;
  }
  assert.equal(found.shaA, EXPECTED_PART_A_SHA, 'Part A SHA-256 must match baseline');
  assert.equal(found.shaB, EXPECTED_PART_B_SHA, 'Part B SHA-256 must match baseline');
});

test('FEASIBILITY_NO_OP_PARITY: xlsx-populate@1.21.0 loads and outputs templates without material degradation', async (t) => {
  const found = findLocalSourceTemplates();
  if (!found) {
    t.skip('Local owner templates unavailable in this environment');
    return;
  }

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

  // --- R3-R28 POSITIVE PROOF: DIRECT RAW OUTBUFA & OUTBUFB PRESERVATION PATH ---
  const preservedBufA = await preserveExactWorkbookDimensions(outBufA, 'A');
  // Direct raw outBufB is passed directly WITHOUT test-side pre-cleaning
  const preservedBufB = await preserveExactWorkbookDimensions(outBufB, 'B');

  // 1. Preserved buffers pass the real validator
  assert.equal(await validateWorkbookParity(preservedBufA, 'A'), true, 'Preserved Part A buffer must satisfy real workbook parity validator');
  assert.equal(await validateWorkbookParity(preservedBufB, 'B'), true, 'Preserved Part B buffer must satisfy real workbook parity validator');

  // 2. PROVE OPTION B WRITE-BACK PERSISTENCE IN PRESERVED PART B ZIP
  const wbPresBZip = await XlsxPopulate.fromDataAsync(preservedBufB);
  const presBSheet2Xml = await wbPresBZip._zip.files['xl/worksheets/sheet2.xml'].async('string');
  assert.equal(presBSheet2Xml.includes('<sheetPr/>'), false, 'Option B write-back MUST persist to returned ZIP: Sheet2 XML MUST NOT contain <sheetPr/>');

  // 3. Dimension verification & schema-valid slot placement verification
  const fpPreservedA = await getWorkbookFingerprint(preservedBufA);
  const fpPreservedB = await getWorkbookFingerprint(preservedBufB);

  assert.equal(fpPreservedA.sheets['MBO Staff & Chief'].dimension, fpOrigA.sheets['MBO Staff & Chief'].dimension, 'Preserved Part A dimension must match source tag exactly');
  assert.equal(fpPreservedB.sheets['(Part B) Competency'].dimension, fpOrigB.sheets['(Part B) Competency'].dimension, 'Preserved Part B main dimension must match source tag exactly');
  assert.equal(fpPreservedB.sheets['Sheet1'].dimension, fpOrigB.sheets['Sheet1'].dimension, 'Preserved Part B Sheet1 dimension must match source tag exactly');

  // Verify predecessor and successor top-level elements in Part B main sheet XML
  const presBMainXml = await wbPresBZip._zip.files['xl/worksheets/sheet1.xml'].async('string');
  const sheetPrIndex = presBMainXml.indexOf('<sheetPr');
  const dimIndex = presBMainXml.indexOf('<dimension');
  const sheetViewsIndex = presBMainXml.indexOf('<sheetViews');
  assert.ok(sheetPrIndex !== -1, 'Part B main sheet XML must contain <sheetPr>');
  assert.ok(dimIndex !== -1, 'Part B main sheet XML must contain restored <dimension>');
  assert.ok(sheetViewsIndex !== -1, 'Part B main sheet XML must contain <sheetViews>');
  assert.ok(sheetPrIndex < dimIndex, 'Restored <dimension> tag MUST appear AFTER predecessor <sheetPr> in schema order');
  assert.ok(dimIndex < sheetViewsIndex, 'Restored <dimension> tag MUST appear BEFORE successor <sheetViews> in schema order');

  // 4. Source and raw buffers remain byte-identical before and after preservation
  assert.equal(crypto.createHash('sha256').update(origBufA).digest('hex'), shaOrigABefore, 'Source Part A buffer must remain byte-identical');
  assert.equal(crypto.createHash('sha256').update(outBufA).digest('hex'), shaOutABefore, 'Raw Part A buffer must remain byte-identical');
  assert.equal(crypto.createHash('sha256').update(origBufB).digest('hex'), shaOrigBBefore, 'Source Part B buffer must remain byte-identical');
  assert.equal(crypto.createHash('sha256').update(outBufB).digest('hex'), shaOutBBefore, 'Raw Part B buffer must remain byte-identical');

  // --- RESTORED R3-R25/R3-R26 REGRESSION NEGATIVE TESTS ---

  // Restored Negative 1: Counterfeit worksheet-like Type URI ("http://example.com/custom/worksheet")
  const wbCounterfeitType = await XlsxPopulate.fromDataAsync(outBufB);
  let relsXmlCounterfeit = await wbCounterfeitType._zip.files['xl/_rels/workbook.xml.rels'].async('string');
  relsXmlCounterfeit = relsXmlCounterfeit.replace('Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet"', 'Type="http://example.com/custom/worksheet"');
  wbCounterfeitType._zip.file('xl/_rels/workbook.xml.rels', relsXmlCounterfeit);
  const bufCounterfeitType = await wbCounterfeitType._zip.generateAsync({ type: 'nodebuffer' });
  await assert.rejects(
    async () => preserveExactWorkbookDimensions(bufCounterfeitType, 'B', origBufB),
    /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/,
    'Counterfeit Type URI must throw BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED'
  );

  // Restored Negative 2: Exact Type mismatch with same ID / target
  const wbTypeMismatch = await XlsxPopulate.fromDataAsync(outBufB);
  let relsXmlTypeMismatch = await wbTypeMismatch._zip.files['xl/_rels/workbook.xml.rels'].async('string');
  relsXmlTypeMismatch = relsXmlTypeMismatch.replace('Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet"', 'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles"');
  wbTypeMismatch._zip.file('xl/_rels/workbook.xml.rels', relsXmlTypeMismatch);
  const bufTypeMismatch = await wbTypeMismatch._zip.generateAsync({ type: 'nodebuffer' });
  await assert.rejects(
    async () => preserveExactWorkbookDimensions(bufTypeMismatch, 'B', origBufB),
    /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/,
    'Exact Type mismatch must throw BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED'
  );

  // Restored Negative 3: Missing predecessor/successor boundary (missing both predecessor and successor in source)
  const wbMissingBoundary = await XlsxPopulate.fromDataAsync(origBufB);
  let sheet1XmlNoBound = await wbMissingBoundary._zip.files['xl/worksheets/sheet1.xml'].async('string');
  sheet1XmlNoBound = sheet1XmlNoBound.replace('<sheetPr codeName="Competency"/>', '');
  sheet1XmlNoBound = sheet1XmlNoBound.replace(/<sheetViews>[\s\S]*?<\/sheetViews>/, '');
  wbMissingBoundary._zip.file('xl/worksheets/sheet1.xml', sheet1XmlNoBound);
  const bufMissingBoundary = await wbMissingBoundary._zip.generateAsync({ type: 'nodebuffer' });
  await assert.rejects(
    async () => preserveExactWorkbookDimensions(outBufB, 'B', bufMissingBoundary),
    /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/,
    'Missing predecessor/successor boundary must throw BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED'
  );

  // Restored Negative 4: Production Source-SHA gate verification (wrong-SHA override)
  const bufWrongShaSource = Buffer.from(origBufB);
  bufWrongShaSource[bufWrongShaSource.length - 1] ^= 0xff;
  await assert.rejects(
    async () => preserveExactWorkbookDimensions(outBufB, 'B', bufWrongShaSource),
    /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/,
    'Wrong-SHA sourceBufOverride must throw BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED'
  );
});

test('FEASIBILITY_HEADER_GEOMETRY_LABEL_VALUE_MAPPING: static header labels remain intact while value cells clear/update', async (t) => {
  const found = findLocalSourceTemplates();
  if (!found) {
    t.skip('Local owner templates unavailable in this environment');
    return;
  }

  const { origBufA, origBufB } = await getNoOpParityBuffers();

  const fpOrigHeaderA = await getHeaderCellFingerprints(origBufA, 'A');
  const { outBufA: mutBufA, outBufB: mutBufB } = await getMutatedHeaderValueBuffers();
  const fpMutHeaderA = await getHeaderCellFingerprints(mutBufA, 'A');

  assert.deepEqual(fpMutHeaderA.titleFingerprints, fpOrigHeaderA.titleFingerprints, 'Part A title/label fingerprints must match source exactly');
  assert.deepEqual(fpMutHeaderA.unrelatedFingerprints, fpOrigHeaderA.unrelatedFingerprints, 'Part A unrelated header cell fingerprints must match source exactly');
  assert.deepEqual(fpMutHeaderA.merges, fpOrigHeaderA.merges, 'Part A header merge refs must match source exactly');

  const fpOrigHeaderB = await getHeaderCellFingerprints(origBufB, 'B');
  const fpMutHeaderB = await getHeaderCellFingerprints(mutBufB, 'B');

  assert.deepEqual(fpMutHeaderB.titleFingerprints, fpOrigHeaderB.titleFingerprints, 'Part B title/label fingerprints must match source exactly');
  assert.deepEqual(fpMutHeaderB.unrelatedFingerprints, fpOrigHeaderB.unrelatedFingerprints, 'Part B unrelated header cell fingerprints must match source exactly');
  assert.deepEqual(fpMutHeaderB.merges, fpOrigHeaderB.merges, 'Part B header merge refs must match source exactly');

  const wbB = await XlsxPopulate.fromDataAsync(mutBufB);
  assert.equal(wbB.sheet(0).cell('R3').value(), 'MUTATED_VAL', 'Value cell R3 must be updated');

  const { bufA: sanBufA, bufB: sanBufB } = await getSanitizedDisposableBuffers();
  assert.equal(await validateHeaderFingerprintParity(sanBufA, 'A'), true, 'Part A sanitized export must satisfy header fingerprint parity');
  assert.equal(await validateHeaderFingerprintParity(sanBufB, 'B'), true, 'Part B sanitized export must satisfy header fingerprint parity');
});

test('FEASIBILITY_RANGE_DRIVEN_PRIVACY_PROOF: range clearing and shared string purging leave 0 sensitive tokens in OOXML parts', async (t) => {
  const found = findLocalSourceTemplates();
  if (!found) {
    t.skip('Local owner templates unavailable in this environment');
    return;
  }

  assert.equal(found.shaB, EXPECTED_PART_B_SHA, 'Part B SHA-256 must match exact baseline');

  const realInventory = await buildPartBSourceEvidenceInventory();
  const realResolved = await resolvePartBPrivacyRoles();
  const classMapB = realResolved.classificationMap;

  assert.equal(classMapB['G2'].classification, 'HEADER_VALUE', 'G2 must be classified HEADER_VALUE');
  assert.equal(classMapB['B2'].isDynamic, false, 'B2 static title must be protected');
  assert.equal(classMapB['B7'].isDynamic, false, 'B7 static competency text must be protected');

  const dynamicSet = new Set(realResolved.dynamicAddresses);
  for (const staticAddr of realResolved.protectedStaticAddresses) {
    assert.equal(dynamicSet.has(staticAddr), false, `Protected static address ${staticAddr} must NOT be in dynamic set`);
  }

  for (const partKey of ['A', 'B']) {
    const expectedAddrs = partKey === 'A' ? SENSITIVE_RANGES_A : SENSITIVE_RANGES_B;
    const metaResult = await getTypedPrivacyMetadata(partKey);
    assert.equal(validateTypedPrivacyMetadata(metaResult, expectedAddrs), true, `Part ${partKey} typed privacy metadata must be 100% valid`);
  }

  const { bufA, bufB, sensitiveA, sensitiveB } = await getSanitizedDisposableBuffers();

  const wbA = await XlsxPopulate.fromDataAsync(bufA);
  const sheetA = wbA.sheet(0);
  const metaA = await getTypedPrivacyMetadata('A');

  for (const rec of metaA.metadata) {
    const val = sheetA.cell(rec.address).value();
    assert.equal(val === null || val === undefined, true, `Cell ${rec.address} must be blank after sanitization`);
  }

  const sourceFormulasA = await getWorksheetFormulaSet(bufA);
  assert.equal(sourceFormulasA.size, 0, 'Part A sanitized output worksheet formula node count must equal 0');

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

test('FEASIBILITY_REFERENCE_IMAGE_REMOVAL: identifies drawings and proves reference image removal while branding remains', async (t) => {
  const found = findLocalSourceTemplates();
  if (!found) {
    t.skip('Local owner templates unavailable in this environment');
    return;
  }

  const { outBufA, drawingXmlPath, drawingRelsPath } = await getReferenceImageBuffers();
  const wbOutA = await XlsxPopulate.fromDataAsync(outBufA);
  const drawingXml = await wbOutA._zip.files[drawingXmlPath].async('string');
  const drawingRels = await wbOutA._zip.files[drawingRelsPath].async('string');

  assert.equal(drawingXml.includes('rId3'), false, 'Target drawing rId3 must be removed from drawing1.xml');
  assert.equal(drawingRels.includes('rId3'), false, 'Target relationship rId3 must be removed from drawing1.xml.rels');
  assert.equal(wbOutA._zip.files['xl/media/image3.png'] === undefined, true, 'Target media xl/media/image3.png must be removed');
  assert.equal(drawingRels.includes('rId1'), true, 'Branding rId1 must be preserved');
  assert.equal(drawingRels.includes('rId2'), true, 'Branding rId2 must be preserved');
});

test('FEASIBILITY_TRUE_PART_A_RAW_OOXML_INSERTION: proves raw OOXML row shifting, merge cloning & print area extension for 4, 5, 10 objectives', async (t) => {
  const found = findLocalSourceTemplates();
  if (!found) {
    t.skip('Local owner templates unavailable in this environment');
    return;
  }

  const { bufA4, bufA5, bufA10 } = await getStructuralPartABuffers();

  const inspA4 = await inspectRawWorksheetOOXML(bufA4);
  assert.equal(inspA4.rawMerges.length, 193, 'Part A 4 objectives merge count must equal 193');
  assert.equal(inspA4.mergeCountAttr, '193', 'Declared merge count must equal 193');
  assert.equal(inspA4.printArea.includes('BJ$52'), true, 'Part A 4 objectives print area must end at BJ52');

  const inspA5 = await inspectRawWorksheetOOXML(bufA5);
  assert.equal(inspA5.rawMerges.length, 207, 'Part A 5 objectives raw merge count must equal 207');
  assert.equal(inspA5.mergeCountAttr, '207', 'Declared merge count must equal 207');
  assert.equal(inspA5.printArea.includes('BJ$53'), true, 'Part A 5 objectives print area must end at BJ53');

  const inspA10 = await inspectRawWorksheetOOXML(bufA10);
  assert.equal(inspA10.rawMerges.length, 277, 'Part A 10 objectives raw merge count must equal 277');
  assert.equal(inspA10.mergeCountAttr, '277', 'Declared merge count must equal 277');
  assert.equal(inspA10.printArea.includes('BJ$58'), true, 'Part A 10 objectives print area must end at BJ58');
});

test('FEASIBILITY_TRUE_PART_B_RAW_OOXML_BLOCK_INSERTION: proves raw OOXML block insertion, merge cloning & totals shifting for 6 and 8 competencies', async (t) => {
  const found = findLocalSourceTemplates();
  if (!found) {
    t.skip('Local owner templates unavailable in this environment');
    return;
  }

  const { bufB6, bufB8 } = await getStructuralPartBBuffers();

  const inspB6 = await inspectRawWorksheetOOXML(bufB6);
  assert.equal(inspB6.rawMerges.length, 79, 'Part B 6 competencies merge count must equal 79');
  assert.equal(inspB6.printArea.includes('X$35'), true, 'Part B 6 competencies print area must end at X35');

  const inspB8 = await inspectRawWorksheetOOXML(bufB8);
  assert.equal(inspB8.rawMerges.length, 91, 'Part B 8 competencies raw merge count must equal 91');
  assert.equal(inspB8.printArea.includes('X$43'), true, 'Part B 8 competencies print area must end at X43');
});

test('FEASIBILITY_DIFFICULTY_LEVEL_BLANK: Difficulty Level cells remain blank per R3 Owner Decision', async (t) => {
  const found = findLocalSourceTemplates();
  if (!found) {
    t.skip('Local owner templates unavailable in this environment');
    return;
  }

  const { bufA } = await getSanitizedDisposableBuffers();
  const wbA = await XlsxPopulate.fromDataAsync(bufA);
  const sheetA = wbA.sheet(0);

  for (let r = 25; r <= 28; r++) {
    const val = sheetA.cell(`AA${r}`).value();
    assert.equal(val === null || val === undefined, true, `Difficulty cell AA${r} must be blank`);
  }
});
