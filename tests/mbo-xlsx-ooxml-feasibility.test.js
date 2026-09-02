import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import XlsxPopulate from 'xlsx-populate';
import {
  findLocalSourceTemplates,
  getNoOpParityBuffers,
  preserveExactWorkbookDimensions,
  preserveWorksheetXmlDimensions,
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

test('UNIT_XML_GLOBAL_RELS_INVENTORY: coverage-complete Relationship inventory & ASCII/Unicode prefix rejection', () => {
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

  // Prefixed Relationship tags (standard ASCII, dotted, Unicode non-ASCII)
  assert.throws(() => parseGlobalRelsXml(validRelsXml.replace('<Relationship Id="rId1"', '<r:Relationship Id="rId1"')), /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/, 'Prefixed <r:Relationship> must fail closed');
  assert.throws(() => parseGlobalRelsXml(validRelsXml.replace('<Relationship Id="rId1"', '<ns.1:Relationship Id="rId1"')), /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/, 'Dotted prefix <ns.1:Relationship> must fail closed');
  assert.throws(() => parseGlobalRelsXml(validRelsXml.replace('<Relationship Id="rId1"', '<pkg:Relationship Id="rId1"')), /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/, 'Pkg prefix <pkg:Relationship> must fail closed');
  assert.throws(() => parseGlobalRelsXml(validRelsXml.replace('<Relationship Id="rId1"', '<ñ:Relationship Id="rId1"')), /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/, 'Unicode non-ASCII prefix <ñ:Relationship> must fail closed');
  assert.throws(() => parseGlobalRelsXml(validRelsXml.replace('<Relationship Id="rId1"', '<ワークシート:Relationship Id="rId1"')), /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/, 'Japanese Unicode prefix <ワークシート:Relationship> must fail closed');

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

test('UNIT_WORKSHEET_CHILDREN_INVENTORY: coverage-complete top-level child, Unicode prefix & singleton schema checks', () => {
  const validWsXml = `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetPr/>
  <dimension ref="A1:X35"/>
  <sheetViews><sheetView tabSelected="1" workbookViewId="0"/></sheetViews>
  <cols><col min="1" max="1" width="10"/></cols>
  <cols><col min="2" max="2" width="12"/></cols>
  <sheetData/>
</worksheet>`;

  // 1. Multiple <cols> elements MUST NOT be rejected by singleton logic (cols is repeatable)
  const children = parseWorksheetTopLevelChildren(validWsXml);
  assert.equal(children.length, 6, 'Six top-level children parsed including 2 cols groups');
  assert.equal(children[3].name, 'cols');
  assert.equal(children[4].name, 'cols');

  // 2. Prefixed worksheet child (ASCII & Unicode non-ASCII)
  assert.throws(() => parseWorksheetTopLevelChildren(validWsXml.replace('<sheetPr/>', '<x:sheetPr/>')), /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/, 'Prefixed <x:sheetPr> must fail closed');
  assert.throws(() => parseWorksheetTopLevelChildren(validWsXml.replace('<sheetPr/>', '<ñ:sheetPr/>')), /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/, 'Unicode prefix <ñ:sheetPr> must fail closed');
  assert.throws(() => parseWorksheetTopLevelChildren(validWsXml.replace('<sheetPr/>', '<ワークシート:sheetPr/>')), /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/, 'Japanese Unicode prefix must fail closed');

  // 3. Unknown element not in ECMA-376 schema order
  assert.throws(() => parseWorksheetTopLevelChildren(validWsXml.replace('<sheetPr/>', '<customElement/>')), /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/, 'Unknown <customElement> must fail closed');

  // 4. Unconsumed text / junk markup inside <worksheet>
  assert.throws(() => parseWorksheetTopLevelChildren(validWsXml.replace('</worksheet>', 'junkText</worksheet>')), /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/, 'Unconsumed text inside <worksheet> must fail closed');

  // 5. Independent maxOccurs=1 duplicate check for ALL supported singleton containers
  const singletonsToTest = ['mergeCells', 'hyperlinks', 'oleObjects', 'controls', 'tableParts', 'sheetViews'];
  for (const tag of singletonsToTest) {
    const wsWithDup = `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData/>
  <${tag}/>
  <${tag}/>
</worksheet>`;
    assert.throws(() => parseWorksheetTopLevelChildren(wsWithDup), /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/, `Duplicate maxOccurs=1 <${tag}> must fail closed`);
  }
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

  // 2. Option B match & normalize when dimension is already present
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

test('UNIT_PURE_STRUCTURAL_PRESERVATION_VALIDATION: pure XML structural preservation & dimension placement testing', () => {
  const validSrcXml = `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetPr codeName="Sheet1"/>
  <dimension ref="A1:X35"/>
  <sheetViews><sheetView tabSelected="1" workbookViewId="0"/></sheetViews>
  <sheetData/>
</worksheet>`;

  const validObsXmlNoDim = `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetPr codeName="Sheet1"/>
  <sheetViews><sheetView tabSelected="1" workbookViewId="0"/></sheetViews>
  <sheetData/>
</worksheet>`;

  // 1. Positive structural dimension restoration
  const res = preserveWorksheetXmlDimensions(validSrcXml, validObsXmlNoDim, 'worksheets/sheet1.xml', 'B');
  assert.equal(res.isObsXmlModified, true, 'isObsXmlModified must be true when dimension is restored');
  assert.equal(res.obsXml.includes('<dimension ref="A1:X35"/>'), true, 'Restored XML must contain dimension tag');

  // 2. Missing source dimension -> fail closed
  const srcNoDim = validSrcXml.replace(/<dimension [^>]*\/>/, '');
  assert.throws(() => preserveWorksheetXmlDimensions(srcNoDim, validObsXmlNoDim, 'worksheets/sheet1.xml', 'B'), /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/, 'Missing source dimension must fail closed');

  // 3. Multiple source dimensions -> fail closed
  const srcDupDim = validSrcXml.replace('<dimension ref="A1:X35"/>', '<dimension ref="A1:X35"/>\n  <dimension ref="A1:X35"/>');
  assert.throws(() => preserveWorksheetXmlDimensions(srcDupDim, validObsXmlNoDim, 'worksheets/sheet1.xml', 'B'), /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/, 'Multiple source dimensions must fail closed');

  // 4. Conflicting observed dimension -> fail closed
  const obsConflictingDim = validSrcXml.replace('<dimension ref="A1:X35"/>', '<dimension ref="A1:Z99"/>');
  assert.throws(() => preserveWorksheetXmlDimensions(validSrcXml, obsConflictingDim, 'worksheets/sheet1.xml', 'B'), /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/, 'Conflicting observed dimension must fail closed');

  // 5. Multiple observed dimensions -> fail closed
  const obsDupDim = validSrcXml.replace('<dimension ref="A1:X35"/>', '<dimension ref="A1:X35"/>\n  <dimension ref="A1:X35"/>');
  assert.throws(() => preserveWorksheetXmlDimensions(validSrcXml, obsDupDim, 'worksheets/sheet1.xml', 'B'), /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/, 'Multiple observed dimensions must fail closed');

  // 6. Missing predecessor/successor boundary -> fail closed
  const srcNoBound = `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <dimension ref="A1:X35"/>
</worksheet>`;
  const obsNoBound = `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
</worksheet>`;
  assert.throws(() => preserveWorksheetXmlDimensions(srcNoBound, obsNoBound, 'worksheets/sheet1.xml', 'B'), /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/, 'Missing predecessor/successor boundary must fail closed');

  // 7. Malformed source XML -> fail closed
  assert.throws(() => preserveWorksheetXmlDimensions('<invalidXml', validObsXmlNoDim, 'worksheets/sheet1.xml', 'B'), /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/, 'Malformed source XML must fail closed');

  // 8. Malformed observed XML -> fail closed
  assert.throws(() => preserveWorksheetXmlDimensions(validSrcXml, '<invalidXml', 'worksheets/sheet1.xml', 'B'), /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/, 'Malformed observed XML must fail closed');

  // --- MANDATORY R3-R30 OPTION B STRUCTURAL FAIL-CLOSED PROOFS ---
  const srcSheet2NoPrXml = `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <dimension ref="A1:A1"/>
  <sheetViews><sheetView tabSelected="1" workbookViewId="0"/></sheetViews>
</worksheet>`;

  // 9. Duplicate Option B sheetPr fails closed in preservation path
  const obsSheet2DupPrXml = `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetPr/>
  <sheetPr/>
  <sheetViews><sheetView tabSelected="1" workbookViewId="0"/></sheetViews>
</worksheet>`;
  assert.throws(() => preserveWorksheetXmlDimensions(srcSheet2NoPrXml, obsSheet2DupPrXml, 'worksheets/sheet2.xml', 'B'), /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/, 'Duplicate Option B sheetPr must throw BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED');

  // 10. Extra unexpected Option B sheetPr fails closed in preservation path
  const obsSheet2ExtraPrXml = `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetPr codeName="Extra"/>
  <sheetViews><sheetView tabSelected="1" workbookViewId="0"/></sheetViews>
</worksheet>`;
  assert.throws(() => preserveWorksheetXmlDimensions(srcSheet2NoPrXml, obsSheet2ExtraPrXml, 'worksheets/sheet2.xml', 'B'), /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/, 'Extra unexpected Option B sheetPr must throw BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED');

  // 11. Moved observed-only sheetPr fails closed in preservation path
  const obsSheet2MovedPrXml = `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews><sheetView tabSelected="1" workbookViewId="0"/></sheetViews>
  <sheetPr/>
</worksheet>`;
  assert.throws(() => preserveWorksheetXmlDimensions(srcSheet2NoPrXml, obsSheet2MovedPrXml, 'worksheets/sheet2.xml', 'B'), /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/, 'Moved observed-only sheetPr must throw BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED');

  // 12. Other-sheet observed-only sheetPr fails closed in preservation path
  const obsOtherSheetPrXml = `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetPr/>
  <sheetViews><sheetView tabSelected="1" workbookViewId="0"/></sheetViews>
</worksheet>`;
  assert.throws(() => preserveWorksheetXmlDimensions(srcSheet2NoPrXml, obsOtherSheetPrXml, 'worksheets/sheet1.xml', 'B'), /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/, 'Other-sheet observed-only sheetPr must throw BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED');

  // 13. Part-A observed-only sheetPr fails closed in preservation path
  assert.throws(() => preserveWorksheetXmlDimensions(srcSheet2NoPrXml, obsOtherSheetPrXml, 'worksheets/sheet1.xml', 'A'), /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/, 'Part-A observed-only sheetPr must throw BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED');
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

  // --- R3-R29 POSITIVE PROOF: DIRECT RAW OUTBUFA & OUTBUFB PRESERVATION PATH ---
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

  // 4. Source and raw buffers remain byte-identical before and after preservation
  assert.equal(crypto.createHash('sha256').update(origBufA).digest('hex'), shaOrigABefore, 'Source Part A buffer must remain byte-identical');
  assert.equal(crypto.createHash('sha256').update(outBufA).digest('hex'), shaOutABefore, 'Raw Part A buffer must remain byte-identical');
  assert.equal(crypto.createHash('sha256').update(origBufB).digest('hex'), shaOrigBBefore, 'Source Part B buffer must remain byte-identical');
  assert.equal(crypto.createHash('sha256').update(outBufB).digest('hex'), shaOutBBefore, 'Raw Part B buffer must remain byte-identical');

  // --- RESTORED FULL PRESERVATION REGRESSION NEGATIVE MATRIX ---

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
    'Wrong-SHA sourceBufOverride must throw BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED'
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

  // 9. Non-worksheet Type/target & distinct counterfeit Type URI (http://example.com/custom/worksheet)
  const wbCounterfeitType = await XlsxPopulate.fromDataAsync(outBufB);
  let relsXmlCounterfeit = await wbCounterfeitType._zip.files['xl/_rels/workbook.xml.rels'].async('string');
  relsXmlCounterfeit = relsXmlCounterfeit.replace('Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet"', 'Type="http://example.com/custom/worksheet"');
  wbCounterfeitType._zip.file('xl/_rels/workbook.xml.rels', relsXmlCounterfeit);
  const bufCounterfeitType = await wbCounterfeitType._zip.generateAsync({ type: 'nodebuffer' });
  await assert.rejects(
    async () => preserveExactWorkbookDimensions(bufCounterfeitType, 'B', origBufB),
    /BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED/,
    'Distinct counterfeit Type URI http://example.com/custom/worksheet must throw BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED'
  );

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

  // 10. External TargetMode
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

  // --- R3-R22 REGRESSION MUTATION NEGATIVE TESTS ---

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

  // --- ACCEPTED HEADER FINGERPRINT NEGATIVE REGRESSION MATRIX ---
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

  // --- ACCEPTED TYPED-PRIVACY METADATA NEGATIVE REGRESSION MATRIX (FULL PREVIOUSLY ACCEPTED MATRIX) ---
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

  // 1. Verify exact Part A owner-template identity before template-dependent proof
  assert.equal(found.shaA, EXPECTED_PART_A_SHA, 'Part A SHA-256 must match baseline');

  const { origBufA, outBufA, drawingXmlPath, drawingRelsPath } = await getReferenceImageBuffers();

  const wbOrigA = await XlsxPopulate.fromDataAsync(origBufA);
  const wbOutA = await XlsxPopulate.fromDataAsync(outBufA);

  // Helper functions for deterministic inventory extraction
  async function extractDrawingAnchorInventory(wb) {
    const anchors = [];
    for (const fileName in wb._zip.files) {
      if (fileName.startsWith('xl/drawings/') && fileName.endsWith('.xml') && !fileName.includes('_rels')) {
        const xml = await wb._zip.files[fileName].async('string');
        const matches = [...xml.matchAll(/<(?:xdr:twoCellAnchor|xdr:oneCellAnchor)[\s\S]*?<\/(?:xdr:twoCellAnchor|xdr:oneCellAnchor)>/g)];
        for (const m of matches) {
          const anchorXml = m[0];
          const rIdMatch = anchorXml.match(/\br:embed="([^"]+)"/);
          const blipRId = rIdMatch ? rIdMatch[1] : null;
          anchors.push({
            part: fileName,
            blipRId,
            xml: anchorXml
          });
        }
      }
    }
    anchors.sort((a, b) => (a.part + ':' + (a.blipRId || '') + ':' + a.xml).localeCompare(b.part + ':' + (b.blipRId || '') + ':' + b.xml));
    return anchors;
  }

  async function extractDrawingRelsInventory(wb) {
    const rels = [];
    for (const fileName in wb._zip.files) {
      if (fileName.startsWith('xl/drawings/_rels/') && fileName.endsWith('.rels')) {
        const xml = await wb._zip.files[fileName].async('string');
        const matches = [...xml.matchAll(/<Relationship\s+([^>]*)\/?>/g)];
        for (const m of matches) {
          const tag = m[0];
          const idMatch = tag.match(/\bId="([^"]+)"/);
          const typeMatch = tag.match(/\bType="([^"]+)"/);
          const targetMatch = tag.match(/\bTarget="([^"]+)"/);
          const modeMatch = tag.match(/\bTargetMode="([^"]+)"/);

          rels.push({
            part: fileName,
            Id: idMatch ? idMatch[1] : null,
            Type: typeMatch ? typeMatch[1] : null,
            Target: targetMatch ? targetMatch[1] : null,
            TargetMode: modeMatch ? modeMatch[1] : 'Internal'
          });
        }
      }
    }
    rels.sort((a, b) => (a.part + ':' + a.Id).localeCompare(b.part + ':' + b.Id));
    return rels;
  }

  async function extractMediaInventory(wb) {
    const media = [];
    for (const fileName in wb._zip.files) {
      if (fileName.startsWith('xl/media/')) {
        const buf = await wb._zip.files[fileName].async('nodebuffer');
        const sha256 = crypto.createHash('sha256').update(buf).digest('hex');
        media.push({
          path: fileName,
          sha256
        });
      }
    }
    media.sort((a, b) => a.path.localeCompare(b.path));
    return media;
  }

  // 2. Snapshot complete BEFORE and AFTER drawing-anchor inventories
  const anchorsBefore = await extractDrawingAnchorInventory(wbOrigA);
  const anchorsAfter = await extractDrawingAnchorInventory(wbOutA);

  // 3. Snapshot complete BEFORE and AFTER drawing-relationship inventories
  const relsBefore = await extractDrawingRelsInventory(wbOrigA);
  const relsAfter = await extractDrawingRelsInventory(wbOutA);

  // 4. Snapshot complete BEFORE and AFTER xl/media/* inventories
  const mediaBefore = await extractMediaInventory(wbOrigA);
  const mediaAfter = await extractMediaInventory(wbOutA);

  // 5. Prove exact target identity exists BEFORE
  const targetAnchorsBefore = anchorsBefore.filter(a => a.blipRId === 'rId3');
  assert.equal(targetAnchorsBefore.length, 1, 'BEFORE drawing anchor inventory MUST contain exactly 1 anchor embedding rId3');
  assert.equal(targetAnchorsBefore[0].part, drawingXmlPath, 'Target anchor part MUST equal expected drawingXmlPath');

  const targetRelsBefore = relsBefore.filter(r => r.Id === 'rId3');
  assert.equal(targetRelsBefore.length, 1, 'BEFORE drawing relationship inventory MUST contain exactly 1 relationship rId3');
  assert.equal(targetRelsBefore[0].part, drawingRelsPath, 'Target relationship part MUST equal expected drawingRelsPath');
  assert.equal(targetRelsBefore[0].Type, 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image', 'Target relationship Type MUST be canonical image relationship Type');
  assert.equal(targetRelsBefore[0].Target, '../media/image3.png', 'Target relationship Target MUST resolve to ../media/image3.png');

  const targetMediaBefore = mediaBefore.filter(m => m.path === 'xl/media/image3.png');
  assert.equal(targetMediaBefore.length, 1, 'BEFORE media inventory MUST contain xl/media/image3.png');

  // 6. Normalize ONLY those exact target items out of BEFORE
  const normalizedAnchorsBefore = anchorsBefore.filter(a => !(a.part === drawingXmlPath && a.blipRId === 'rId3'));
  const normalizedRelsBefore = relsBefore.filter(r => !(r.part === drawingRelsPath && r.Id === 'rId3'));
  const normalizedMediaBefore = mediaBefore.filter(m => m.path !== 'xl/media/image3.png');

  // 7. Require exact deep equality
  assert.deepEqual(normalizedAnchorsBefore, anchorsAfter, 'Target-normalized BEFORE drawing anchors MUST equal AFTER drawing anchors exactly');
  assert.deepEqual(normalizedRelsBefore, relsAfter, 'Target-normalized BEFORE drawing relationships MUST equal AFTER drawing relationships exactly');
  assert.deepEqual(normalizedMediaBefore, mediaAfter, 'Target-normalized BEFORE media inventory MUST equal AFTER media inventory exactly');

  // 8. Retain explicit target-absence assertions
  const drawingXml = await wbOutA._zip.files[drawingXmlPath].async('string');
  const drawingRels = await wbOutA._zip.files[drawingRelsPath].async('string');

  assert.equal(drawingXml.includes('rId3'), false, 'Target drawing rId3 must be removed from drawing1.xml');
  assert.equal(drawingRels.includes('rId3'), false, 'Target relationship rId3 must be removed from drawing1.xml.rels');
  assert.equal(wbOutA._zip.files['xl/media/image3.png'] === undefined, true, 'Target media xl/media/image3.png must be removed');

  // 9. Retain explicit branding/non-target survival assertions
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
