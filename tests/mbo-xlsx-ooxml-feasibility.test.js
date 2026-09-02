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

export function isNCNameStartChar(cp) {
  if (cp >= 0x41 && cp <= 0x5A) return true;
  if (cp === 0x5F) return true;
  if (cp >= 0x61 && cp <= 0x7A) return true;
  if (cp >= 0xC0 && cp <= 0xD6) return true;
  if (cp >= 0xD8 && cp <= 0xF6) return true;
  if (cp >= 0xF8 && cp <= 0x2FF) return true;
  if (cp >= 0x370 && cp <= 0x37D) return true;
  if (cp >= 0x37F && cp <= 0x1FFF) return true;
  if (cp >= 0x200C && cp <= 0x200D) return true;
  if (cp >= 0x2070 && cp <= 0x218F) return true;
  if (cp >= 0x2C00 && cp <= 0x2FEF) return true;
  if (cp >= 0x3001 && cp <= 0xD7FF) return true;
  if (cp >= 0xF900 && cp <= 0xFDCF) return true;
  if (cp >= 0xFDF0 && cp <= 0xFFFD) return true;
  if (cp >= 0x10000 && cp <= 0xEFFFF) return true;
  return false;
}

export function isNCNameChar(cp) {
  if (isNCNameStartChar(cp)) return true;
  if (cp === 0x2D) return true;
  if (cp === 0x2E) return true;
  if (cp >= 0x30 && cp <= 0x39) return true;
  if (cp === 0xB7) return true;
  if (cp >= 0x0300 && cp <= 0x036F) return true;
  if (cp >= 0x203F && cp <= 0x2040) return true;
  return false;
}

export function isValidNCName(str) {
  if (typeof str !== 'string' || str.length === 0) return false;
  const codePoints = Array.from(str).map(c => c.codePointAt(0));
  if (!isNCNameStartChar(codePoints[0])) return false;
  for (let i = 1; i < codePoints.length; i++) {
    if (!isNCNameChar(codePoints[i])) return false;
  }
  return true;
}

export function isValidAttributeQName(attrName) {
  if (typeof attrName !== 'string' || attrName.length === 0) return false;
  const parts = attrName.split(':');
  if (parts.length === 1) {
    return isValidNCName(parts[0]);
  } else if (parts.length === 2) {
    return isValidNCName(parts[0]) && isValidNCName(parts[1]);
  } else {
    return false;
  }
}

export function parseAndValidateStartTagAttributes(rawAttrRegion) {
  let pos = 0;
  const str = rawAttrRegion;
  const attrCounts = {};
  const attrValues = {};

  while (pos < str.length) {
    while (pos < str.length && /\s/.test(str[pos])) {
      pos++;
    }
    if (pos >= str.length) break;

    const nameMatch = str.slice(pos).match(/^([^\s/>=]+)\s*=\s*/);
    if (!nameMatch) {
      throw new Error('BLOCKER_DRAWING_RELS_PARSING_FAILED');
    }

    const attrName = nameMatch[1];
    if (!isValidAttributeQName(attrName)) {
      throw new Error('BLOCKER_DRAWING_RELS_PARSING_FAILED');
    }

    pos += nameMatch[0].length;

    if (pos >= str.length) {
      throw new Error('BLOCKER_DRAWING_RELS_PARSING_FAILED');
    }

    const quoteChar = str[pos];
    if (quoteChar !== '"' && quoteChar !== "'") {
      throw new Error('BLOCKER_DRAWING_RELS_PARSING_FAILED');
    }

    pos++;

    const closeQuoteIndex = str.indexOf(quoteChar, pos);
    if (closeQuoteIndex === -1) {
      throw new Error('BLOCKER_DRAWING_RELS_PARSING_FAILED');
    }

    const attrVal = str.slice(pos, closeQuoteIndex);
    pos = closeQuoteIndex + 1;

    if (attrCounts[attrName]) {
      throw new Error('BLOCKER_DRAWING_RELS_PARSING_FAILED');
    }
    attrCounts[attrName] = 1;
    attrValues[attrName] = attrVal;
  }

  return attrValues;
}

export function parseDrawingAnchorsXml(xml, partName = 'xl/drawings/drawing1.xml') {
  if (typeof xml !== 'string') {
    throw new Error('BLOCKER_DRAWING_ANCHOR_PARSING_FAILED');
  }

  const wsDrMatch = xml.match(/<([^:\s/>]+:)?wsDr(?:\s[^>]*?)?>([\s\S]*?)<\/([^:\s/>]+:)?wsDr>/);
  if (!wsDrMatch) {
    throw new Error('BLOCKER_DRAWING_ANCHOR_PARSING_FAILED');
  }

  const startPrefixWithColon = wsDrMatch[1] || '';
  const endPrefixWithColon = wsDrMatch[3] || '';
  if (startPrefixWithColon !== endPrefixWithColon) {
    throw new Error('BLOCKER_DRAWING_ANCHOR_PARSING_FAILED');
  }

  const rootPrefix = startPrefixWithColon ? startPrefixWithColon.slice(0, -1) : '';
  if (rootPrefix && !isValidNCName(rootPrefix)) {
    throw new Error('BLOCKER_DRAWING_ANCHOR_PARSING_FAILED');
  }

  const inner = wsDrMatch[2];
  const anchorRegex = /<([^:\s/>]+:)?(twoCellAnchor|oneCellAnchor|absoluteAnchor)(?:\s[^>]*?)?(?:\/>|>[\s\S]*?<\/\1\2>)/g;
  const tagMatches = [...inner.matchAll(anchorRegex)];

  let lastEnd = 0;
  for (const m of tagMatches) {
    const textBetween = inner.slice(lastEnd, m.index);
    if (textBetween.trim().length > 0) {
      throw new Error('BLOCKER_DRAWING_ANCHOR_PARSING_FAILED');
    }
    lastEnd = m.index + m[0].length;
  }
  if (inner.slice(lastEnd).trim().length > 0) {
    throw new Error('BLOCKER_DRAWING_ANCHOR_PARSING_FAILED');
  }

  const anchors = [];

  for (const m of tagMatches) {
    const anchorPrefix = m[1] ? m[1].slice(0, -1) : '';
    if (anchorPrefix && !isValidNCName(anchorPrefix)) {
      throw new Error('BLOCKER_DRAWING_ANCHOR_PARSING_FAILED');
    }

    const typeName = m[2];
    const anchorXml = m[0];

    let blipRId = null;
    const embedAttrRegex = /(?:^|\s+)([^\s/>=]+)=(?:"([^"]*)"|'([^']*)')/g;
    for (const ea of anchorXml.matchAll(embedAttrRegex)) {
      const fullAttrName = ea[1];
      const attrVal = ea[2] !== undefined ? ea[2] : ea[3];

      if (fullAttrName === 'embed') {
        blipRId = attrVal;
      } else if (fullAttrName.includes(':')) {
        const parts = fullAttrName.split(':');
        if (parts[parts.length - 1] === 'embed') {
          if (parts.length === 2 && parts[0].length > 0 && isValidNCName(parts[0])) {
            blipRId = attrVal;
          } else {
            throw new Error('BLOCKER_DRAWING_ANCHOR_PARSING_FAILED');
          }
        }
      }
    }

    anchors.push({
      part: partName,
      typeName,
      blipRId,
      xml: anchorXml
    });
  }

  anchors.sort((a, b) => (a.part + ':' + (a.blipRId || '') + ':' + a.xml).localeCompare(b.part + ':' + (b.blipRId || '') + ':' + b.xml));
  return anchors;
}

export function parseDrawingRelsXml(xml, partName = 'xl/drawings/_rels/drawing1.xml.rels') {
  if (typeof xml !== 'string') {
    throw new Error('BLOCKER_DRAWING_RELS_PARSING_FAILED');
  }

  const relsMatch = xml.match(/<([^:\s/>]+:)?Relationships(?:\s[^>]*?)?>([\s\S]*?)<\/([^:\s/>]+:)?Relationships>/);
  if (!relsMatch) {
    throw new Error('BLOCKER_DRAWING_RELS_PARSING_FAILED');
  }

  const startPrefixWithColon = relsMatch[1] || '';
  const endPrefixWithColon = relsMatch[3] || '';
  if (startPrefixWithColon !== endPrefixWithColon) {
    throw new Error('BLOCKER_DRAWING_RELS_PARSING_FAILED');
  }

  const rootPrefix = startPrefixWithColon ? startPrefixWithColon.slice(0, -1) : '';
  if (rootPrefix && !isValidNCName(rootPrefix)) {
    throw new Error('BLOCKER_DRAWING_RELS_PARSING_FAILED');
  }

  const inner = relsMatch[2];
  const tagMatches = [...inner.matchAll(/<([^:\s/>]+:)?Relationship(?:\s[^>]*?)?(?:\/>|>[\s\S]*?<\/\1Relationship>)/g)];

  let lastEnd = 0;
  for (const m of tagMatches) {
    const textBetween = inner.slice(lastEnd, m.index);
    if (textBetween.trim().length > 0) {
      throw new Error('BLOCKER_DRAWING_RELS_PARSING_FAILED');
    }
    lastEnd = m.index + m[0].length;
  }
  if (inner.slice(lastEnd).trim().length > 0) {
    throw new Error('BLOCKER_DRAWING_RELS_PARSING_FAILED');
  }

  const rels = [];

  for (const m of tagMatches) {
    const relPrefix = m[1] ? m[1].slice(0, -1) : '';
    if (relPrefix && !isValidNCName(relPrefix)) {
      throw new Error('BLOCKER_DRAWING_RELS_PARSING_FAILED');
    }

    const fullElement = m[0];

    const startTagMatch = fullElement.match(/^<([^:\s/>]+:)?Relationship(\s[\s\S]*?)?\s*\/?>/);
    if (!startTagMatch) {
      throw new Error('BLOCKER_DRAWING_RELS_PARSING_FAILED');
    }

    const rawAttrRegion = startTagMatch[2] || '';
    const attrValues = parseAndValidateStartTagAttributes(rawAttrRegion);

    if (!attrValues.hasOwnProperty('Id') || !attrValues.hasOwnProperty('Type') || !attrValues.hasOwnProperty('Target')) {
      throw new Error('BLOCKER_DRAWING_RELS_PARSING_FAILED');
    }

    const Id = attrValues['Id'];
    const Type = attrValues['Type'];
    const Target = attrValues['Target'];
    const TargetMode = attrValues.hasOwnProperty('TargetMode') ? attrValues['TargetMode'] : null;

    rels.push({
      part: partName,
      Id,
      Type,
      Target,
      TargetMode
    });
  }

  rels.sort((a, b) => (a.part + ':' + a.Id + ':' + a.Type + ':' + a.Target + ':' + String(a.TargetMode)).localeCompare(b.part + ':' + b.Id + ':' + b.Type + ':' + b.Target + ':' + String(b.TargetMode)));
  return rels;
}

test('UNIT_REFERENCE_IMAGE_INVENTORY_PARSERS: synthetic & adversarial drawing anchor and relationship parser validation', () => {
  // --- RESTORED R3-R33 ADVERSARIAL MATRIX ---

  // 1. Wrong-case anchor local name rejects
  const wrongCaseAnchorXml = `<wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing">
  <xdr:twocellanchor><a:blip r:embed="rId1"/></xdr:twocellanchor>
</wsDr>`;
  assert.throws(() => parseDrawingAnchorsXml(wrongCaseAnchorXml), /BLOCKER_DRAWING_ANCHOR_PARSING_FAILED/, 'Wrong-case anchor local name twocellanchor must fail closed');

  // 2. Wrong-case Relationship local name rejects
  const wrongCaseRelsXml = `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <relationship Id="rId1" Type="http://example.com/type1" Target="target1"/>
</Relationships>`;
  assert.throws(() => parseDrawingRelsXml(wrongCaseRelsXml), /BLOCKER_DRAWING_RELS_PARSING_FAILED/, 'Wrong-case Relationship local name relationship must fail closed');

  // 3. Nested child Id/Type/Target substitution rejects
  const nestedAttrRelsXml = `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship><child Id="rId1" Type="http://example.com/type1" Target="target1"/></Relationship>
</Relationships>`;
  assert.throws(() => parseDrawingRelsXml(nestedAttrRelsXml), /BLOCKER_DRAWING_RELS_PARSING_FAILED/, 'Nested child attributes cannot satisfy missing parent attributes');

  // 4. Duplicate Id attribute on start tag rejects
  const dupIdAttrRelsXml = `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Id="rId2" Type="http://example.com/type1" Target="target1"/>
</Relationships>`;
  assert.throws(() => parseDrawingRelsXml(dupIdAttrRelsXml), /BLOCKER_DRAWING_RELS_PARSING_FAILED/, 'Duplicate Id attribute on start tag must fail closed');

  // 5. Duplicate Type attribute on start tag rejects
  const dupTypeAttrRelsXml = `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="type1" Type="type2" Target="target1"/>
</Relationships>`;
  assert.throws(() => parseDrawingRelsXml(dupTypeAttrRelsXml), /BLOCKER_DRAWING_RELS_PARSING_FAILED/, 'Duplicate Type attribute on start tag must fail closed');

  // 6. Duplicate Target attribute on start tag rejects
  const dupTargetAttrRelsXml = `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="type1" Target="t1" Target="t2"/>
</Relationships>`;
  assert.throws(() => parseDrawingRelsXml(dupTargetAttrRelsXml), /BLOCKER_DRAWING_RELS_PARSING_FAILED/, 'Duplicate Target attribute on start tag must fail closed');

  // 7. Duplicate TargetMode attribute on start tag rejects
  const dupModeAttrRelsXml = `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="type1" Target="t1" TargetMode="Internal" TargetMode="External"/>
</Relationships>`;
  assert.throws(() => parseDrawingRelsXml(dupModeAttrRelsXml), /BLOCKER_DRAWING_RELS_PARSING_FAILED/, 'Duplicate TargetMode attribute on start tag must fail closed');

  // 8. Namespace-qualified required-attribute substitute rejects
  const nsAttrRelsXml = `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship x:Id="rId1" Type="type1" Target="target1"/>
</Relationships>`;
  assert.throws(() => parseDrawingRelsXml(nsAttrRelsXml), /BLOCKER_DRAWING_RELS_PARSING_FAILED/, 'Namespace-qualified required-attribute substitute x:Id must fail closed');

  // 9. TargetMode absent vs explicit Internal vs explicit External tuple inequality proof
  const relAbsent = parseDrawingRelsXml(`<Relationships><Relationship Id="r1" Type="t1" Target="a"/></Relationships>`)[0];
  const relInternal = parseDrawingRelsXml(`<Relationships><Relationship Id="r1" Type="t1" Target="a" TargetMode="Internal"/></Relationships>`)[0];
  const relExternal = parseDrawingRelsXml(`<Relationships><Relationship Id="r1" Type="t1" Target="a" TargetMode="External"/></Relationships>`)[0];

  assert.equal(relAbsent.TargetMode, null, 'Absent TargetMode must be null');
  assert.equal(relInternal.TargetMode, 'Internal', 'Explicit TargetMode="Internal" must equal "Internal"');
  assert.equal(relExternal.TargetMode, 'External', 'Explicit TargetMode="External" must equal "External"');

  assert.notDeepEqual(relAbsent, relInternal, 'TargetMode absent vs explicit Internal must produce deep inequality');
  assert.notDeepEqual(relInternal, relExternal, 'TargetMode Internal vs External must produce deep inequality');
  assert.notDeepEqual(relAbsent, relExternal, 'TargetMode absent vs explicit External must produce deep inequality');

  // --- FULL R3-R34 ADVERSARIAL MATRIX ---

  // 10. Valid hyphenated prefix passes
  const hyphenPrefixXml = `<ns-1:wsDr xmlns:ns-1="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing">
  <ns-1:twoCellAnchor><a:blip r:embed="rId1"/></ns-1:twoCellAnchor>
</ns-1:wsDr>`;
  const hyphenAnchors = parseDrawingAnchorsXml(hyphenPrefixXml);
  assert.equal(hyphenAnchors.length, 1, 'Hyphenated prefix ns-1:twoCellAnchor must be parsed');

  // 11. Valid dotted prefix passes
  const dottedPrefixRelsXml = `<pkg.rel:Relationships xmlns:pkg.rel="http://schemas.openxmlformats.org/package/2006/relationships">
  <pkg.rel:Relationship Id="rId1" Type="http://example.com/type1" Target="target1"/>
</pkg.rel:Relationships>`;
  const dottedRels = parseDrawingRelsXml(dottedPrefixRelsXml);
  assert.equal(dottedRels.length, 1, 'Dotted prefix pkg.rel:Relationship must be parsed');

  // 12. Valid non-ASCII letter prefix passes
  const unicodePrefixXml = `<ñ:wsDr xmlns:ñ="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing">
  <ñ:absoluteAnchor><a:blip r:embed="rId2"/></ñ:absoluteAnchor>
</ñ:wsDr>`;
  const unicodeAnchors = parseDrawingAnchorsXml(unicodePrefixXml);
  assert.equal(unicodeAnchors.length, 1, 'Non-ASCII prefix ñ:absoluteAnchor must be parsed');

  // 13. Invalid NCName prefix: leading digit rejects
  const leadingDigitXml = `<1bad:wsDr xmlns:1bad="http://example.com"><1bad:twoCellAnchor/></1bad:wsDr>`;
  assert.throws(() => parseDrawingAnchorsXml(leadingDigitXml), /BLOCKER_DRAWING_ANCHOR_PARSING_FAILED/, 'Leading digit prefix 1bad must fail closed');

  // 14. Invalid NCName prefix: leading hyphen rejects
  const leadingHyphenXml = `<-bad:Relationships xmlns:-bad="http://example.com"><-bad:Relationship Id="r1" Type="t" Target="a"/></-bad:Relationships>`;
  assert.throws(() => parseDrawingRelsXml(leadingHyphenXml), /BLOCKER_DRAWING_RELS_PARSING_FAILED/, 'Leading hyphen prefix -bad must fail closed');

  // 15. Invalid NCName prefix: leading dot rejects
  const leadingDotXml = `<.bad:wsDr xmlns:.bad="http://example.com"><.bad:twoCellAnchor/></.bad:wsDr>`;
  assert.throws(() => parseDrawingAnchorsXml(leadingDotXml), /BLOCKER_DRAWING_ANCHOR_PARSING_FAILED/, 'Leading dot prefix .bad must fail closed');

  // 16. Unterminated quoted extra attribute rejects
  const unterminatedQuoteRelsXml = `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="type1" Target="target1" extra="unterminatedValue />
</Relationships>`;
  assert.throws(() => parseDrawingRelsXml(unterminatedQuoteRelsXml), /BLOCKER_DRAWING_RELS_PARSING_FAILED/, 'Unterminated quoted extra attribute must fail closed');

  // 17. Unquoted extra attribute rejects
  const unquotedAttrRelsXml = `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="type1" Target="target1" extra=unquotedVal />
</Relationships>`;
  assert.throws(() => parseDrawingRelsXml(unquotedAttrRelsXml), /BLOCKER_DRAWING_RELS_PARSING_FAILED/, 'Unquoted extra attribute must fail closed');

  // 18. Malformed equals syntax rejects
  const malformedEqualsRelsXml = `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type=="type1" Target="target1"/>
</Relationships>`;
  assert.throws(() => parseDrawingRelsXml(malformedEqualsRelsXml), /BLOCKER_DRAWING_RELS_PARSING_FAILED/, 'Malformed equals syntax must fail closed');

  // 19. Stray/unconsumed attribute-region text rejects
  const strayAttrTextRelsXml = `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="type1" Target="target1" strayTokenText />
</Relationships>`;
  assert.throws(() => parseDrawingRelsXml(strayAttrTextRelsXml), /BLOCKER_DRAWING_RELS_PARSING_FAILED/, 'Stray attribute-region text must fail closed');

  // 20. Complete valid mixed single/double quoted attributes parse cleanly
  const mixedQuoteRelsXml = `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id='rId1' Type="type1" Target='target1' TargetMode="Internal"/>
</Relationships>`;
  const mixedRels = parseDrawingRelsXml(mixedQuoteRelsXml);
  assert.equal(mixedRels.length, 1, 'Mixed single and double quoted attributes must parse cleanly');
  assert.equal(mixedRels[0].Id, 'rId1');
  assert.equal(mixedRels[0].TargetMode, 'Internal');

  // --- FULL R3-R35 ADVERSARIAL MATRIX ---

  // 21. Valid middle-dot NCName continuation passes (U+00B7)
  const middleDotXml = `<a·b:wsDr xmlns:a·b="http://example.com"><a·b:twoCellAnchor><a:blip r:embed="rId1"/></a·b:twoCellAnchor></a·b:wsDr>`;
  const middleDotAnchors = parseDrawingAnchorsXml(middleDotXml);
  assert.equal(middleDotAnchors.length, 1, 'Middle dot NCName continuation must be accepted');

  // 22. Valid combining-mark continuation passes (U+0301)
  const combiningMarkXml = `<a\u0301b:Relationships xmlns:a\u0301b="http://example.com"><a\u0301b:Relationship Id="r1" Type="t" Target="a"/></a\u0301b:Relationships>`;
  const combiningRels = parseDrawingRelsXml(combiningMarkXml);
  assert.equal(combiningRels.length, 1, 'Combining mark NCName continuation must be accepted');

  // 23. Valid connector-punctuation continuation passes (U+203F)
  const connectorPunctXml = `<a\u203Fb:wsDr xmlns:a\u203Fb="http://example.com"><a\u203Fb:twoCellAnchor><a:blip r:embed="rId1"/></a\u203Fb:twoCellAnchor></a\u203Fb:wsDr>`;
  const connectorAnchors = parseDrawingAnchorsXml(connectorPunctXml);
  assert.equal(connectorAnchors.length, 1, 'Connector punctuation NCName continuation must be accepted');

  // 24. Invalid attribute name beginning with digit rejects
  const digitAttrRelsXml = `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="type1" Target="target1" 1bad="val"/>
</Relationships>`;
  assert.throws(() => parseDrawingRelsXml(digitAttrRelsXml), /BLOCKER_DRAWING_RELS_PARSING_FAILED/, 'Attribute name starting with digit must fail closed');

  // 25. Invalid attribute name beginning with colon rejects
  const leadingColonAttrRelsXml = `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="type1" Target="target1" :bad="val"/>
</Relationships>`;
  assert.throws(() => parseDrawingRelsXml(leadingColonAttrRelsXml), /BLOCKER_DRAWING_RELS_PARSING_FAILED/, 'Attribute name starting with colon must fail closed');

  // 26. Invalid trailing-colon name rejects
  const trailingColonAttrRelsXml = `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="type1" Target="target1" bad:="val"/>
</Relationships>`;
  assert.throws(() => parseDrawingRelsXml(trailingColonAttrRelsXml), /BLOCKER_DRAWING_RELS_PARSING_FAILED/, 'Attribute name ending with colon must fail closed');

  // 27. Invalid multi-colon QName rejects
  const multiColonAttrRelsXml = `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="type1" Target="target1" a:b:c="val"/>
</Relationships>`;
  assert.throws(() => parseDrawingRelsXml(multiColonAttrRelsXml), /BLOCKER_DRAWING_RELS_PARSING_FAILED/, 'Attribute name with multiple colons must fail closed');

  // 28. Valid unrelated qualified extra attribute parses cleanly without satisfying required unqualified Id/Type/Target
  const qualifiedExtraRelsXml = `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="type1" Target="target1" custom:extra="val"/>
</Relationships>`;
  const qualRels = parseDrawingRelsXml(qualifiedExtraRelsXml);
  assert.equal(qualRels.length, 1, 'Valid unrelated qualified extra attribute must parse cleanly');
  assert.equal(qualRels[0].Id, 'rId1');

  // --- MANDATORY R3-R36 PREFIXED EMBED FAIL-CLOSED SUITE ---

  // 29. Valid r:embed="rId3" extraction returns exact rId3
  const validEmbedXml = `<wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <xdr:twoCellAnchor><a:blip r:embed="rId3"/></xdr:twoCellAnchor>
</wsDr>`;
  const validEmbedAnchors = parseDrawingAnchorsXml(validEmbedXml);
  assert.equal(validEmbedAnchors[0].blipRId, 'rId3', 'Valid r:embed="rId3" must yield blipRId rId3');

  // 30. Malformed prefixed embed QName 1bad:embed must THROW BLOCKER_DRAWING_ANCHOR_PARSING_FAILED
  const digitEmbedXml = `<wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing">
  <xdr:twoCellAnchor><a:blip 1bad:embed="rId3"/></xdr:twoCellAnchor>
</wsDr>`;
  assert.throws(() => parseDrawingAnchorsXml(digitEmbedXml), /BLOCKER_DRAWING_ANCHOR_PARSING_FAILED/, '1bad:embed="rId3" must fail closed and throw');

  // 31. Malformed prefixed embed QName :embed must THROW BLOCKER_DRAWING_ANCHOR_PARSING_FAILED
  const leadingColonEmbedXml = `<wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing">
  <xdr:twoCellAnchor><a:blip :embed="rId3"/></xdr:twoCellAnchor>
</wsDr>`;
  assert.throws(() => parseDrawingAnchorsXml(leadingColonEmbedXml), /BLOCKER_DRAWING_ANCHOR_PARSING_FAILED/, ':embed="rId3" must fail closed and throw');

  // 32. Malformed prefixed embed QName foo::embed must THROW BLOCKER_DRAWING_ANCHOR_PARSING_FAILED
  const multiColonEmbedXml = `<wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing">
  <xdr:twoCellAnchor><a:blip foo::embed="rId3"/></xdr:twoCellAnchor>
</wsDr>`;
  assert.throws(() => parseDrawingAnchorsXml(multiColonEmbedXml), /BLOCKER_DRAWING_ANCHOR_PARSING_FAILED/, 'foo::embed="rId3" must fail closed and throw');
});

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

  // Helper functions for deterministic inventory extraction using coverage-complete parsers
  async function extractDrawingAnchorInventory(wb) {
    let anchors = [];
    for (const fileName in wb._zip.files) {
      if (fileName.startsWith('xl/drawings/') && fileName.endsWith('.xml') && !fileName.includes('_rels')) {
        const xml = await wb._zip.files[fileName].async('string');
        const parsed = parseDrawingAnchorsXml(xml, fileName);
        anchors = anchors.concat(parsed);
      }
    }
    anchors.sort((a, b) => (a.part + ':' + (a.blipRId || '') + ':' + a.xml).localeCompare(b.part + ':' + (b.blipRId || '') + ':' + b.xml));
    return anchors;
  }

  async function extractDrawingRelsInventory(wb) {
    let rels = [];
    for (const fileName in wb._zip.files) {
      if (fileName.startsWith('xl/drawings/_rels/') && fileName.endsWith('.rels')) {
        const xml = await wb._zip.files[fileName].async('string');
        const parsed = parseDrawingRelsXml(xml, fileName);
        rels = rels.concat(parsed);
      }
    }
    rels.sort((a, b) => (a.part + ':' + a.Id + ':' + a.Type + ':' + a.Target + ':' + String(a.TargetMode)).localeCompare(b.part + ':' + b.Id + ':' + b.Type + ':' + b.Target + ':' + String(b.TargetMode)));
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
  const targetRelTuple = {
    part: drawingRelsPath,
    Id: 'rId3',
    Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image',
    Target: '../media/image3.png',
    TargetMode: null
  };

  const targetAnchorsBefore = anchorsBefore.filter(a => a.part === drawingXmlPath && a.blipRId === 'rId3');
  assert.equal(targetAnchorsBefore.length, 1, 'BEFORE drawing anchor inventory MUST contain exactly 1 anchor embedding rId3');

  const targetRelsBefore = relsBefore.filter(r =>
    r.part === targetRelTuple.part &&
    r.Id === targetRelTuple.Id &&
    r.Type === targetRelTuple.Type &&
    r.Target === targetRelTuple.Target &&
    r.TargetMode === targetRelTuple.TargetMode
  );
  assert.equal(targetRelsBefore.length, 1, 'BEFORE drawing relationship inventory MUST contain exactly 1 relationship matching targetRelTuple');

  const targetMediaBefore = mediaBefore.filter(m => m.path === 'xl/media/image3.png');
  assert.equal(targetMediaBefore.length, 1, 'BEFORE media inventory MUST contain xl/media/image3.png');

  // 6. Normalize ONLY those exact target items out of BEFORE using COMPLETE EXACT TUPLE COMPARISON
  const normalizedAnchorsBefore = anchorsBefore.filter(a => !(a.part === drawingXmlPath && a.blipRId === 'rId3'));

  const normalizedRelsBefore = relsBefore.filter(r => !(
    r.part === targetRelTuple.part &&
    r.Id === targetRelTuple.Id &&
    r.Type === targetRelTuple.Type &&
    r.Target === targetRelTuple.Target &&
    r.TargetMode === targetRelTuple.TargetMode
  ));

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

test('FEASIBILITY_TRUE_PART_A_RAW_OOXML_INSERTION: proves raw OOXML row shifting, merge cloning & print area extension for full 4-10 objective matrix', async (t) => {
  const found = findLocalSourceTemplates();
  if (!found) {
    t.skip('Local owner templates unavailable in this environment');
    return;
  }

  // 1. Exact Part A SHA gate
  assert.equal(found.shaA, EXPECTED_PART_A_SHA, 'Part A SHA-256 must match baseline exactly');

  const partABuffers = await getStructuralPartABuffers();
  const baselineBuf = partABuffers.bufA4;
  const inspBaseline = await inspectRawWorksheetOOXML(baselineBuf);
  const baselineWb = await XlsxPopulate.fromDataAsync(baselineBuf);
  const baselineSheet = baselineWb.sheet(0);
  const baselineFp = await getWorkbookFingerprint(baselineBuf);

  // Extract row 28 merges from baseline merge inventory
  const row28Merges = [];
  for (const m of inspBaseline.rawMerges) {
    const match = m.match(/^([A-Z]+)28:([A-Z]+)28$/);
    if (match) {
      row28Merges.push({ col1: match[1], col2: match[2] });
    }
  }

  for (let n = 4; n <= 10; n++) {
    const extraRows = n - 4;
    const expectedLastRow = 52 + extraRows;
    const expectedMergeCount = 193 + (14 * extraRows);
    const expectedDimensionTag = `<dimension ref="A1:BL${expectedLastRow}"/>`;
    const expectedPrintArea = `'MBO Staff & Chief'!$A$1:$BJ$${expectedLastRow}`;

    const bufN = partABuffers.buffers ? partABuffers.buffers[n] : (n === 4 ? partABuffers.bufA4 : (n === 5 ? partABuffers.bufA5 : partABuffers.bufA10));
    const inspN = await inspectRawWorksheetOOXML(bufN);
    const wbN = await XlsxPopulate.fromDataAsync(bufN);
    const sheetN = wbN.sheet(0);
    const fpN = await getWorkbookFingerprint(bufN);

    // A. Dimension & Print Area exact string equality (no includes/endsWith as primary proof)
    assert.equal(inspN.dimension, expectedDimensionTag, `Part A ${n} objectives dimension must be exact string ${expectedDimensionTag}`);
    assert.equal(inspN.printArea, expectedPrintArea, `Part A ${n} objectives print area must be exact string ${expectedPrintArea}`);

    // B. Exact row-node sequence + uniqueness
    const expectedRowRefs = [];
    for (const r of inspBaseline.rowRefs) {
      if (r <= 28) {
        expectedRowRefs.push(r);
      } else {
        expectedRowRefs.push(r + extraRows);
      }
    }
    for (let i = 0; i < extraRows; i++) {
      expectedRowRefs.push(29 + i);
    }
    expectedRowRefs.sort((a, b) => a - b);

    assert.deepEqual(inspN.rowRefs, expectedRowRefs, `Part A ${n} objectives rowRefs must match expected sequence exactly`);
    assert.equal(new Set(inspN.rowRefs).size, inspN.rowRefs.length, `Part A ${n} objectives rowRefs must contain 0 duplicates`);

    // C. Merge inventory full deep equality
    const expectedMerges = [];
    for (const m of inspBaseline.rawMerges) {
      const match = m.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
      assert.ok(match, `Invalid merge format in baseline: ${m}`);
      let r1 = parseInt(match[2], 10);
      let r2 = parseInt(match[4], 10);
      if (r1 >= 29) r1 += extraRows;
      if (r2 >= 29) r2 += extraRows;
      expectedMerges.push(`${match[1]}${r1}:${match[3]}${r2}`);
    }
    for (let i = 0; i < extraRows; i++) {
      const targetR = 29 + i;
      for (const m of row28Merges) {
        expectedMerges.push(`${m.col1}${targetR}:${m.col2}${targetR}`);
      }
    }
    expectedMerges.sort();

    assert.equal(inspN.rawMerges.length, expectedMergeCount, `Part A ${n} objectives merge count must equal ${expectedMergeCount}`);
    assert.equal(inspN.mergeCountAttr, String(expectedMergeCount), `Part A ${n} objectives mergeCountAttr must equal ${expectedMergeCount}`);
    assert.deepEqual(inspN.rawMerges, expectedMerges, `Part A ${n} objectives raw merge set must match computed expected merge set exactly`);

    // D. Rows 1-28 structurally unchanged
    for (let r = 1; r <= 28; r++) {
      assert.deepEqual(inspN.cellRefs[r], inspBaseline.cellRefs[r], `Row ${r} cell refs in ${n} objectives must match baseline`);
      assert.deepEqual(inspN.stylePattern[r], inspBaseline.stylePattern[r], `Row ${r} style pattern in ${n} objectives must match baseline`);
      assert.deepEqual(inspN.rowHeights[r], inspBaseline.rowHeights[r], `Row ${r} height in ${n} objectives must match baseline`);
    }

    // E. Inserted rows 29..(28+extraRows) are exact normalized structural clones of row 28
    for (let i = 0; i < extraRows; i++) {
      const targetR = 29 + i;
      const normalizedCellRefs = (inspN.cellRefs[targetR] || []).map(c => c.replace(new RegExp(`${targetR}$`), '28'));
      assert.deepEqual(normalizedCellRefs, inspBaseline.cellRefs[28], `Inserted row ${targetR} normalized cell refs must match row 28 baseline`);
      assert.deepEqual(inspN.stylePattern[targetR], inspBaseline.stylePattern[28], `Inserted row ${targetR} style pattern must match row 28 baseline`);
      assert.deepEqual(inspN.rowHeights[targetR], inspBaseline.rowHeights[28], `Inserted row ${targetR} height must match row 28 baseline`);
    }

    // F. Downstream original rows >= 29 moved exactly by +extraRows
    for (let r = 29; r <= 52; r++) {
      const shiftedR = r + extraRows;
      const normalizedShiftedCellRefs = (inspN.cellRefs[shiftedR] || []).map(c => c.replace(new RegExp(`${shiftedR}$`), String(r)));
      assert.deepEqual(normalizedShiftedCellRefs, inspBaseline.cellRefs[r], `Downstream row ${r} shifted to ${shiftedR} cell refs must match baseline row ${r}`);
      assert.deepEqual(inspN.stylePattern[shiftedR], inspBaseline.stylePattern[r], `Downstream row ${r} shifted to ${shiftedR} style pattern must match baseline row ${r}`);
      assert.deepEqual(inspN.rowHeights[shiftedR], inspBaseline.rowHeights[r], `Downstream row ${r} shifted to ${shiftedR} height must match baseline row ${r}`);
    }

    // G. Privacy-safe sentinel relocation
    const targetSentinelCell = `B${29 + extraRows}`;
    assert.equal(sheetN.cell(targetSentinelCell).value(), 'SENTINEL_ROW_29', `Sentinel must exist at ${targetSentinelCell}`);
    if (extraRows > 0) {
      assert.notEqual(sheetN.cell('B29').value(), 'SENTINEL_ROW_29', 'Sentinel must be absent from old row B29 when extraRows > 0');
    }
    let sentinelCount = 0;
    for (let checkR = 1; checkR <= expectedLastRow; checkR++) {
      if (sheetN.cell(`B${checkR}`).value() === 'SENTINEL_ROW_29') {
        sentinelCount++;
      }
    }
    assert.equal(sentinelCount, 1, `Sentinel 'SENTINEL_ROW_29' must exist exactly once in ${n} objectives sheet`);

    // H. Workbook sheet invariants
    assert.deepEqual(fpN.sheetNames, baselineFp.sheetNames, `Sheet names for ${n} objectives must match baseline exactly`);
    assert.deepEqual(fpN.sheetStates, baselineFp.sheetStates, `Sheet states for ${n} objectives must match baseline exactly`);

    // I. Main-sheet non-target invariant equality
    const baselineMain = baselineFp.sheets['MBO Staff & Chief'];
    const currentMain = fpN.sheets['MBO Staff & Chief'];
    assert.ok(baselineMain && currentMain, 'Main sheet entry must exist in both baseline and current fingerprints');

    assert.equal(currentMain.colsHash, baselineMain.colsHash, `Cols hash for ${n} objectives must match baseline`);
    assert.equal(currentMain.showGridLines, baselineMain.showGridLines, `showGridLines for ${n} objectives must match baseline`);
    assert.equal(currentMain.pageMargins, baselineMain.pageMargins, `pageMargins for ${n} objectives must match baseline`);
    assert.equal(currentMain.paperSize, baselineMain.paperSize, `paperSize for ${n} objectives must match baseline`);
    assert.equal(currentMain.paperSize, '8', `paperSize for ${n} objectives must equal absolute constant 8 (A3)`);
    assert.equal(currentMain.orientation, baselineMain.orientation, `orientation for ${n} objectives must match baseline`);
    assert.equal(currentMain.orientation, 'landscape', `orientation for ${n} objectives must equal absolute constant landscape`);
    assert.equal(currentMain.scale, baselineMain.scale, `scale for ${n} objectives must match baseline`);
    assert.equal(currentMain.scale, '58', `scale for ${n} objectives must equal absolute constant 58%`);
    assert.equal(currentMain.fitToPage, baselineMain.fitToPage, `fitToPage for ${n} objectives must match baseline`);
    assert.equal(currentMain.horizontalCentered, baselineMain.horizontalCentered, `horizontalCentered for ${n} objectives must match baseline`);
    assert.equal(currentMain.verticalCentered, baselineMain.verticalCentered, `verticalCentered for ${n} objectives must match baseline`);
    assert.equal(currentMain.sheetProtection, baselineMain.sheetProtection, `sheetProtection for ${n} objectives must match baseline`);
    assert.deepEqual(currentMain.sheetRels, baselineMain.sheetRels, `sheetRels for ${n} objectives must match baseline`);

    assert.deepEqual(fpN.relTuples, baselineFp.relTuples, `Relationship tuples for ${n} objectives must match baseline`);
    assert.deepEqual(fpN.mediaFiles, baselineFp.mediaFiles, `Media inventory for ${n} objectives must match baseline`);

    // J. Formula inventory remains empty
    const formulaSet = await getWorksheetFormulaSet(bufN);
    assert.equal(formulaSet.size, 0, `Formula inventory must equal 0 for ${n} objectives`);
  }
});

test('FEASIBILITY_TRUE_PART_B_RAW_OOXML_BLOCK_INSERTION: proves raw OOXML block insertion, merge cloning & totals shifting for full 6-8 competency matrix', async (t) => {
  const found = findLocalSourceTemplates();
  if (!found) {
    t.skip('Local owner templates unavailable in this environment');
    return;
  }

  // 1. Exact Part B SHA gate
  assert.equal(found.shaB, EXPECTED_PART_B_SHA, 'Part B SHA-256 must match baseline exactly');

  const partBBuffers = await getStructuralPartBBuffers();
  const baselineBufB = partBBuffers.bufB6;
  const inspBaselineB = await inspectRawWorksheetOOXML(baselineBufB);
  const baselineWbB = await XlsxPopulate.fromDataAsync(baselineBufB);
  const baselineSheetB = baselineWbB.sheet(0);
  const baselineFpB = await getWorkbookFingerprint(baselineBufB);

  // Extract source block 27:30 merges from baseline merge inventory
  const block27_30Merges = [];
  for (const m of inspBaselineB.rawMerges) {
    const match = m.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
    if (match) {
      const r1 = parseInt(match[2], 10);
      const r2 = parseInt(match[4], 10);
      if (r1 >= 27 && r2 <= 30) {
        block27_30Merges.push({ c1: match[1], r1Offset: r1 - 27, c2: match[3], r2Offset: r2 - 27 });
      }
    }
  }
  assert.equal(block27_30Merges.length, 6, 'Baseline Part B source block 27:30 must contain exactly 6 merges');

  for (let n = 6; n <= 8; n++) {
    const extraBlocks = n - 6;
    const extraRows = 4 * extraBlocks;
    const expectedLastRow = 35 + extraRows;
    const expectedMergeCount = 79 + (6 * extraBlocks);
    const expectedDimensionTag = `<dimension ref="A1:X${expectedLastRow}"/>`;
    const expectedPrintArea = `'(Part B) Competency'!$A$1:$X$${expectedLastRow}`;

    const bufN = partBBuffers.buffers ? partBBuffers.buffers[n] : (n === 6 ? partBBuffers.bufB6 : (n === 7 ? partBBuffers.bufB7 : partBBuffers.bufB8));
    const inspB = await inspectRawWorksheetOOXML(bufN);
    const wbB = await XlsxPopulate.fromDataAsync(bufN);
    const sheetB = wbB.sheet(0);
    const fpB = await getWorkbookFingerprint(bufN);

    // A. Dimension & Print Area exact string equality (unconditional exact match)
    assert.equal(inspB.dimension, expectedDimensionTag, `Part B ${n} competencies dimension must be exact string ${expectedDimensionTag}`);
    assert.equal(inspB.printArea, expectedPrintArea, `Part B ${n} competencies print area must be exact string ${expectedPrintArea}`);

    // B. Exact row-node sequence + uniqueness
    const expectedRowRefs = [];
    for (const r of inspBaselineB.rowRefs) {
      if (r <= 30) {
        expectedRowRefs.push(r);
      } else {
        expectedRowRefs.push(r + extraRows);
      }
    }
    for (let i = 0; i < extraRows; i++) {
      expectedRowRefs.push(31 + i);
    }
    expectedRowRefs.sort((a, b) => a - b);

    assert.deepEqual(inspB.rowRefs, expectedRowRefs, `Part B ${n} competencies rowRefs must match expected sequence exactly`);
    assert.equal(new Set(inspB.rowRefs).size, inspB.rowRefs.length, `Part B ${n} competencies rowRefs must contain 0 duplicates`);

    // C. Merge inventory full deep equality
    const expectedMerges = [];
    for (const m of inspBaselineB.rawMerges) {
      const match = m.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
      assert.ok(match, `Invalid merge format in baseline: ${m}`);
      let r1 = parseInt(match[2], 10);
      let r2 = parseInt(match[4], 10);
      if (r1 >= 31) r1 += extraRows;
      if (r2 >= 31) r2 += extraRows;
      expectedMerges.push(`${match[1]}${r1}:${match[3]}${r2}`);
    }
    for (let b = 1; b <= extraBlocks; b++) {
      const startR = 27 + 4 * b;
      for (const m of block27_30Merges) {
        expectedMerges.push(`${m.c1}${startR + m.r1Offset}:${m.c2}${startR + m.r2Offset}`);
      }
    }
    expectedMerges.sort();

    assert.equal(inspB.rawMerges.length, expectedMergeCount, `Part B ${n} competencies merge count must equal ${expectedMergeCount}`);
    assert.equal(inspB.mergeCountAttr, String(expectedMergeCount), `Part B ${n} competencies mergeCountAttr must equal ${expectedMergeCount}`);
    assert.deepEqual(inspB.rawMerges, expectedMerges, `Part B ${n} competencies raw merge set must match computed expected merge set exactly`);

    // D. Rows 1-30 structurally unchanged
    for (let r = 1; r <= 30; r++) {
      assert.deepEqual(inspB.cellRefs[r], inspBaselineB.cellRefs[r], `Row ${r} cell refs in ${n} competencies must match baseline`);
      assert.deepEqual(inspB.stylePattern[r], inspBaselineB.stylePattern[r], `Row ${r} style pattern in ${n} competencies must match baseline`);
      assert.deepEqual(inspB.rowHeights[r], inspBaselineB.rowHeights[r], `Row ${r} height in ${n} competencies must match baseline`);
    }

    // E. Inserted rows in blocks b=1..extraBlocks are exact normalized structural clones of rows 27:30
    for (let b = 1; b <= extraBlocks; b++) {
      for (let offset = 0; offset <= 3; offset++) {
        const targetR = 27 + 4 * b + offset;
        const sourceR = 27 + offset;
        const normalizedCellRefs = (inspB.cellRefs[targetR] || []).map(c => c.replace(new RegExp(`${targetR}$`), String(sourceR)));
        assert.deepEqual(normalizedCellRefs, inspBaselineB.cellRefs[sourceR], `Inserted row ${targetR} normalized cell refs must match source row ${sourceR}`);
        assert.deepEqual(inspB.stylePattern[targetR], inspBaselineB.stylePattern[sourceR], `Inserted row ${targetR} style pattern must match source row ${sourceR}`);
        assert.deepEqual(inspB.rowHeights[targetR], inspBaselineB.rowHeights[sourceR], `Inserted row ${targetR} height must match source row ${sourceR}`);
      }
    }

    // F. Downstream original rows >= 31 moved exactly by +extraRows
    for (let r = 31; r <= 35; r++) {
      const shiftedR = r + extraRows;
      const normalizedShiftedCellRefs = (inspB.cellRefs[shiftedR] || []).map(c => c.replace(new RegExp(`${shiftedR}$`), String(r)));
      assert.deepEqual(normalizedShiftedCellRefs, inspBaselineB.cellRefs[r], `Downstream row ${r} shifted to ${shiftedR} cell refs must match baseline row ${r}`);
      assert.deepEqual(inspB.stylePattern[shiftedR], inspBaselineB.stylePattern[r], `Downstream row ${r} shifted to ${shiftedR} style pattern must match baseline row ${r}`);
      assert.deepEqual(inspB.rowHeights[shiftedR], inspBaselineB.rowHeights[r], `Downstream row ${r} shifted to ${shiftedR} height must match baseline row ${r}`);
    }

    // G. Privacy-safe sentinel relocation & uniqueness
    const targetSentinelCell = `B${31 + extraRows}`;
    assert.equal(sheetB.cell(targetSentinelCell).value(), 'SENTINEL_ROW_31', `Sentinel must exist at ${targetSentinelCell}`);
    if (extraRows > 0) {
      assert.notEqual(sheetB.cell('B31').value(), 'SENTINEL_ROW_31', 'Sentinel must be absent from old row B31 when extraRows > 0');
    }
    let sentinelCount = 0;
    for (let checkR = 1; checkR <= expectedLastRow; checkR++) {
      if (sheetB.cell(`B${checkR}`).value() === 'SENTINEL_ROW_31') {
        sentinelCount++;
      }
    }
    assert.equal(sentinelCount, 1, `Sentinel 'SENTINEL_ROW_31' must exist exactly once in ${n} competencies sheet`);

    // H. Workbook sheet invariants
    assert.deepEqual(fpB.sheetNames, baselineFpB.sheetNames, `Sheet names for ${n} competencies must match baseline exactly`);
    assert.deepEqual(fpB.sheetStates, baselineFpB.sheetStates, `Sheet states for ${n} competencies must match baseline exactly`);

    // I. Main-sheet non-target invariant equality
    const baselineMainB = baselineFpB.sheets['(Part B) Competency'];
    const currentMainB = fpB.sheets['(Part B) Competency'];
    assert.ok(baselineMainB && currentMainB, 'Main sheet entry must exist in both baseline and current fingerprints');

    assert.equal(currentMainB.colsHash, baselineMainB.colsHash, `Cols hash for ${n} competencies must match baseline`);
    assert.equal(currentMainB.showGridLines, baselineMainB.showGridLines, `showGridLines for ${n} competencies must match baseline`);
    assert.equal(currentMainB.pageMargins, baselineMainB.pageMargins, `pageMargins for ${n} competencies must match baseline`);
    assert.equal(currentMainB.paperSize, baselineMainB.paperSize, `paperSize for ${n} competencies must match baseline`);
    assert.equal(currentMainB.paperSize, '9', `paperSize for ${n} competencies must equal absolute constant 9 (A4)`);
    assert.equal(currentMainB.orientation, baselineMainB.orientation, `orientation for ${n} competencies must match baseline`);
    assert.equal(currentMainB.orientation, 'portrait', `orientation for ${n} competencies must equal absolute constant portrait`);
    assert.equal(currentMainB.scale, baselineMainB.scale, `scale for ${n} competencies must match baseline`);
    assert.equal(currentMainB.scale, '75', `scale for ${n} competencies must equal absolute constant 75%`);
    assert.equal(currentMainB.fitToPage, baselineMainB.fitToPage, `fitToPage for ${n} competencies must match baseline`);
    assert.equal(currentMainB.horizontalCentered, baselineMainB.horizontalCentered, `horizontalCentered for ${n} competencies must match baseline`);
    assert.equal(currentMainB.horizontalCentered, true, `horizontalCentered for ${n} competencies must equal absolute constant true`);
    assert.equal(currentMainB.verticalCentered, baselineMainB.verticalCentered, `verticalCentered for ${n} competencies must match baseline`);
    assert.equal(currentMainB.sheetProtection, baselineMainB.sheetProtection, `sheetProtection for ${n} competencies must match baseline`);
    assert.ok(currentMainB.sheetProtection && currentMainB.sheetProtection !== 'none' && currentMainB.sheetProtection !== '', `sheetProtection for ${n} competencies must be present and non-none`);
    assert.deepEqual(currentMainB.sheetRels, baselineMainB.sheetRels, `sheetRels for ${n} competencies must match baseline`);

    // J. Auxiliary Sheet1 exact stability
    assert.deepEqual(fpB.sheets['Sheet1'], baselineFpB.sheets['Sheet1'], `Auxiliary Sheet1 fingerprint for ${n} competencies must match baseline Sheet1 exactly`);

    // K. Package / Formulas
    assert.deepEqual(fpB.relTuples, baselineFpB.relTuples, `Relationship tuples for ${n} competencies must match baseline`);
    assert.deepEqual(fpB.mediaFiles, baselineFpB.mediaFiles, `Media inventory for ${n} competencies must match baseline`);

    const formulaSet = await getWorksheetFormulaSet(bufN);
    assert.equal(formulaSet.size, 0, `Formula inventory must equal 0 for ${n} competencies`);
  }
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
