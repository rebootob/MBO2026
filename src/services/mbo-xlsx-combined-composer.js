/**
 * Production Post-Render Combined XLSX Composer Foundation (R2-D1-R1)
 *
 * Browser-safe asynchronous composer:
 *   - Consumes rendered Part A XLSX bytes and rendered Part B XLSX bytes.
 *   - Combines them into one .xlsx workbook containing exactly 2 business sheets:
 *       1. MBO Staff & Chief (from Part A)
 *       2. (Part B) Competency (from Part B)
 *   - Excludes Part B auxiliary Sheet1.
 *
 * Production Invariants & Corrective Rules (R2-D1-R1):
 * 1. Pure browser-safe production module (no node:fs, node:path, node:crypto, Kintone API).
 * 2. Zero mutation of caller / input bytes (immutability preserved).
 * 3. Rendered Part A package serves as base package authority.
 * 4. Source-derived resolution of business sheets via workbook.xml -> r:id -> workbook.xml.rels -> target.
 * 5. Derived style and sharedStrings remapping from actual rendered packages (no fixed offsets).
 * 6. Remap all style-reference classes (cell `s`, row `s`, col `style`, defaultStyle).
 * 7. Recursive style dependency mapping (numFmtId, fontId, fillId, borderId, xfId); fail closed on unresolved dependencies.
 * 8. Dynamic exact Print_Area preservation bound to localSheetId 0 and 1.
 * 9. Source-derived worksheet relationship graph (.rels) preservation; copy/retarget supported printerSettings, drawings, media.
 * 10. Collision-safe OPC part and relationship ID derivation.
 * 11. Zero formula inventory.
 * 12. Secured rendered values & privacy preserved.
 * 13. Fail closed on malformed authority, occupied paths/IDs, missing targets, or unexpected topology.
 */
import XlsxPopulate from 'xlsx-populate';

function normalizeXml(str) {
  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Validates that input bytes are a valid Uint8Array / Buffer / ArrayBuffer
 */
function toUint8Array(data, paramName) {
  if (!data) {
    throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Missing ${paramName} input`);
  }
  if (data instanceof Uint8Array) {
    return data;
  }
  if (data instanceof ArrayBuffer) {
    return new Uint8Array(data);
  }
  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(data)) {
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  }
  throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Invalid ${paramName} input data type`);
}

/**
 * Helper: Extract all relationship IDs referenced in XML (e.g. r:id="rId1", r:embed="rId2", r:link="rId3")
 */
function extractXmlRelReferences(xmlStr) {
  const relIds = new Set();
  if (!xmlStr) return relIds;
  const matches = xmlStr.matchAll(/\br:(?:id|embed|link)="([^"]+)"/g);
  for (const m of matches) {
    relIds.add(m[1]);
  }
  return relIds;
}

/**
 * Helper: Attribute-independent relationship tag parser (Corrective D)
 */
function parseRelationshipTag(tagStr) {
  const idMatch = tagStr.match(/\bId="([^"]+)"/);
  const typeMatch = tagStr.match(/\bType="([^"]+)"/);
  const targetMatch = tagStr.match(/\bTarget="([^"]+)"/);
  const targetModeMatch = tagStr.match(/\bTargetMode="([^"]+)"/);

  if (!idMatch || !typeMatch || !targetMatch) {
    return null;
  }

  // Reject duplicate attributes within same tag
  const idCount = (tagStr.match(/\bId=/g) || []).length;
  const typeCount = (tagStr.match(/\bType=/g) || []).length;
  const targetCount = (tagStr.match(/\bTarget=/g) || []).length;

  if (idCount !== 1 || typeCount !== 1 || targetCount !== 1) {
    return null;
  }

  return {
    rawTag: tagStr,
    id: idMatch[1],
    type: typeMatch[1],
    target: targetMatch[1],
    targetMode: targetModeMatch ? targetModeMatch[1] : null
  };
}

/**
 * Helper: Parse all <Relationship .../> elements in a .rels document with strict completeness validation (Corrective D)
 */
function parseRelsDocument(relsXml, label) {
  const rawElementCount = (relsXml.match(/<Relationship\b/g) || []).length;
  const relMatches = [...relsXml.matchAll(/<Relationship\b[^>]*?\/>/g)];

  if (relMatches.length !== rawElementCount) {
    throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Unparsed or malformed Relationship element in ${label}`);
  }

  const parsedRels = [];
  const seenIds = new Set();

  for (const m of relMatches) {
    const parsed = parseRelationshipTag(m[0]);
    if (!parsed) {
      throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Malformed Relationship tag in ${label}`);
    }
    if (seenIds.has(parsed.id)) {
      throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Duplicate relationship Id "${parsed.id}" in ${label}`);
    }
    seenIds.add(parsed.id);
    parsedRels.push(parsed);
  }

  return parsedRels;
}

/**
 * Helper: Resolve business sheet from workbook.xml -> r:id -> workbook.xml.rels -> zipPath
 */
async function resolveBusinessSheet(zip, expectedSheetName, label) {
  const wbFile = zip.file('xl/workbook.xml');
  const wbRelsFile = zip.file('xl/_rels/workbook.xml.rels');
  if (!wbFile || !wbRelsFile) {
    throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Missing workbook.xml or workbook.xml.rels in ${label}`);
  }

  const wbXml = await wbFile.async('text');
  const wbRelsXml = await wbRelsFile.async('text');

  // Match all <sheet .../> elements
  const sheetMatches = [...wbXml.matchAll(/<sheet\b[^>]*?\bname="([^"]+)"[^>]*?\br:id="([^"]+)"[^>]*?\/>|<sheet\b[^>]*?\br:id="([^"]+)"[^>]*?\bname="([^"]+)"[^>]*?\/>/g)];

  const normExpected = normalizeXml(expectedSheetName).replace(/&amp;/g, '&');
  const matchingSheets = [];

  for (const m of sheetMatches) {
    const rawName = m[1] || m[4];
    const rId = m[2] || m[3];
    const normName = normalizeXml(rawName).replace(/&amp;/g, '&');
    if (normName === normExpected) {
      matchingSheets.push({ rawName, rId });
    }
  }

  if (matchingSheets.length !== 1) {
    throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Business sheet "${expectedSheetName}" not uniquely found in ${label} workbook.xml (found ${matchingSheets.length})`);
  }

  const { rawName, rId } = matchingSheets[0];

  // Parse workbook.xml.rels strictly using parseRelsDocument (Corrective A)
  const parsedWbRels = parseRelsDocument(wbRelsXml, `${label} workbook.xml.rels`);

  const matchingRels = parsedWbRels.filter(rel => rel.id === rId);

  if (matchingRels.length !== 1) {
    throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Relationship ID "${rId}" for sheet "${rawName}" not uniquely found in ${label} workbook.xml.rels (found ${matchingRels.length})`);
  }

  const rel = matchingRels[0];

  if (rel.type !== 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet') {
    throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Relationship ID "${rId}" for sheet "${rawName}" in ${label} has invalid Type`);
  }

  if (!rel.target) {
    throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Relationship ID "${rId}" for sheet "${rawName}" in ${label} missing Target`);
  }

  if (rel.targetMode && rel.targetMode !== 'Internal') {
    throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Worksheet relationship ID "${rId}" in ${label} has invalid TargetMode "${rel.targetMode}"`);
  }

  const rawTarget = rel.target;
  if (
    rawTarget.includes('://') ||
    rawTarget.includes(':') ||
    rawTarget.includes('\\') ||
    rawTarget.includes('..')
  ) {
    throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Unsafe worksheet relationship target "${rawTarget}" in ${label}`);
  }

  let zipPath = rawTarget;
  if (!zipPath.startsWith('xl/')) {
    zipPath = 'xl/' + zipPath.replace(/^\//, '');
  }

  if (!zipPath.startsWith('xl/worksheets/')) {
    throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Worksheet target "${zipPath}" outside expected xl/worksheets/ directory in ${label}`);
  }

  const sheetFile = zip.file(zipPath);
  if (!sheetFile) {
    throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Target worksheet file "${zipPath}" missing in ${label} zip`);
  }

  return {
    sheetName: rawName,
    rId,
    target: rawTarget,
    zipPath
  };
}

/**
 * Main Production Entry Point: composeCombinedWorkbook
 */
export async function composeCombinedWorkbook(partABytes, partBBytes, options = {}) {
  const safeBytesA = toUint8Array(partABytes, 'partABytes');
  const safeBytesB = toUint8Array(partBBytes, 'partBBytes');

  // Clone bytes to guarantee input immutability
  const inputA = new Uint8Array(safeBytesA.slice(0));
  const inputB = new Uint8Array(safeBytesB.slice(0));

  let wbA, wbB;
  try {
    wbA = await XlsxPopulate.fromDataAsync(inputA);
  } catch (err) {
    throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Failed to parse Part A XLSX package: ${err.message}`);
  }

  try {
    wbB = await XlsxPopulate.fromDataAsync(inputB);
  } catch (err) {
    throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Failed to parse Part B XLSX package: ${err.message}`);
  }

  const zipA = wbA._zip;
  const zipB = wbB._zip;

  if (!zipA || !zipB) {
    throw new Error('EXPORT_COMBINED_COMPOSER_UNRESOLVED: Invalid OOXML zip container');
  }

  // ---------------------------------------------------------------------------
  // 1. Validate Base Package Required Parts
  // ---------------------------------------------------------------------------
  const requiredPartsA = [
    'xl/workbook.xml',
    'xl/_rels/workbook.xml.rels',
    '[Content_Types].xml',
    'xl/styles.xml',
    'xl/sharedStrings.xml',
    'docProps/app.xml'
  ];

  for (const part of requiredPartsA) {
    if (!zipA.file(part)) {
      throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Missing required Part A package part: ${part}`);
    }
  }

  const requiredPartsB = [
    'xl/workbook.xml',
    'xl/_rels/workbook.xml.rels',
    '[Content_Types].xml',
    'xl/styles.xml',
    'xl/sharedStrings.xml'
  ];

  for (const part of requiredPartsB) {
    if (!zipB.file(part)) {
      throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Missing required Part B package part: ${part}`);
    }
  }

  // Source-derived resolution of business sheets through relationship graph
  const sheetA = await resolveBusinessSheet(zipA, 'MBO Staff & Chief', 'Part A');
  const sheetB = await resolveBusinessSheet(zipB, '(Part B) Competency', 'Part B');

  // Check formula inventory = ZERO in both rendered business sheets
  const sheetXmlContentA = await zipA.file(sheetA.zipPath).async('text');
  const sheetXmlContentB = await zipB.file(sheetB.zipPath).async('text');

  if (/<f[\s>]/.test(sheetXmlContentA) || /<f[\s>]/.test(sheetXmlContentB)) {
    throw new Error('EXPORT_COMBINED_COMPOSER_UNRESOLVED: Formula inventory non-zero in input business sheet');
  }

  // ---------------------------------------------------------------------------
  // 2. Extract Dynamic Print Areas
  // ---------------------------------------------------------------------------
  const wbXmlA = await zipA.file('xl/workbook.xml').async('text');
  const wbXmlB = await zipB.file('xl/workbook.xml').async('text');

  const printAreaMatchA = wbXmlA.match(/<definedName\b[^>]*?\bname="_xlnm\.Print_Area"[^>]*?>([\s\S]*?)<\/definedName>/);
  if (!printAreaMatchA) {
    throw new Error('EXPORT_COMBINED_COMPOSER_UNRESOLVED: Missing _xlnm.Print_Area in Part A workbook.xml');
  }
  const partAPrintAreaText = printAreaMatchA[1].trim();

  const printAreaMatchB = wbXmlB.match(/<definedName\b[^>]*?\bname="_xlnm\.Print_Area"[^>]*?>([\s\S]*?)<\/definedName>/);
  if (!printAreaMatchB) {
    throw new Error('EXPORT_COMBINED_COMPOSER_UNRESOLVED: Missing _xlnm.Print_Area in Part B workbook.xml');
  }
  const partBPrintAreaText = printAreaMatchB[1].trim();

  // Validate Print_Area multiplicity (must have exactly one definedName per input)
  const allPrintAreasA = wbXmlA.match(/name="_xlnm\.Print_Area"/g) || [];
  const allPrintAreasB = wbXmlB.match(/name="_xlnm\.Print_Area"/g) || [];
  if (allPrintAreasA.length !== 1 || allPrintAreasB.length !== 1) {
    throw new Error('EXPORT_COMBINED_COMPOSER_UNRESOLVED: Duplicate or invalid _xlnm.Print_Area definitions in input packages');
  }

  // ---------------------------------------------------------------------------
  // 3. Derive Free Relationship IDs & OPC Part Paths in Base Package (Part A)
  // ---------------------------------------------------------------------------
  const wbRelsXmlA = await zipA.file('xl/_rels/workbook.xml.rels').async('text');
  const rIdMatchesA = [...wbRelsXmlA.matchAll(/\bId="(rId\d+)"/g)].map(m => m[1]);
  let maxRIdNum = 0;
  for (const rId of rIdMatchesA) {
    const num = parseInt(rId.replace('rId', ''), 10);
    if (!isNaN(num) && num > maxRIdNum) maxRIdNum = num;
  }
  let partBSheetRIdNum = maxRIdNum + 1;
  while (rIdMatchesA.includes(`rId${partBSheetRIdNum}`)) {
    partBSheetRIdNum++;
  }
  const partBSheetRId = `rId${partBSheetRIdNum}`;

  // Validate base package sheet topology and derive free worksheet part path
  const existingSheetsA = Object.keys(zipA.files).filter(f => /^xl\/worksheets\/sheet\d+\.xml$/i.test(f));
  if (existingSheetsA.some(p => p !== sheetA.zipPath)) {
    throw new Error('EXPORT_COMBINED_COMPOSER_UNRESOLVED: Unexpected occupied sheet path present in base package');
  }

  let worksheetNum = 2;
  while (zipA.file(`xl/worksheets/sheet${worksheetNum}.xml`)) {
    worksheetNum++;
  }
  const partBWorksheetPath = `xl/worksheets/sheet${worksheetNum}.xml`;
  const partBWorksheetRelsPath = `xl/worksheets/_rels/sheet${worksheetNum}.xml.rels`;

  if (zipA.file(partBWorksheetPath) || zipA.file(partBWorksheetRelsPath)) {
    throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Worksheet path ${partBWorksheetPath} already occupied in Part A package`);
  }

  // Derive free sheetId in workbook.xml
  const sheetIdMatchesA = [...wbXmlA.matchAll(/\bsheetId="(\d+)"/g)].map(m => parseInt(m[1], 10));
  let maxSheetId = 0;
  for (const id of sheetIdMatchesA) {
    if (id > maxSheetId) maxSheetId = id;
  }
  const partBSheetId = maxSheetId + 1;

  // ---------------------------------------------------------------------------
  // 4. Derive & Remap Shared Strings (`xl/sharedStrings.xml`)
  // ---------------------------------------------------------------------------
  const sstXmlA = await zipA.file('xl/sharedStrings.xml').async('text');
  const sstXmlB = await zipB.file('xl/sharedStrings.xml').async('text');

  function parseSstItems(xmlStr) {
    const items = [];
    const matches = xmlStr.matchAll(/<si>([\s\S]*?)<\/si>/g);
    for (const m of matches) {
      items.push({
        rawXml: m[0],
        innerXml: m[1],
        normalized: normalizeXml(m[1])
      });
    }
    return items;
  }

  const sstItemsA = parseSstItems(sstXmlA);
  const sstItemsB = parseSstItems(sstXmlB);

  // Derive shared string indices actually referenced by Part B business sheet cells (t="s")
  const referencedSstIndicesB = new Set();
  const cCellMatches = sheetXmlContentB.matchAll(/<c\b[^>]*?\bt="s"[^>]*?>[\s\S]*?<v>(\d+)<\/v>/g);
  for (const m of cCellMatches) {
    referencedSstIndicesB.add(parseInt(m[1], 10));
  }

  const sstMap = new Map(); // oldIndex -> newIndex
  const newSstItemsA = [...sstItemsA];

  for (const bIdx of referencedSstIndicesB) {
    if (bIdx < 0 || bIdx >= sstItemsB.length) {
      throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Referenced Part B shared string index ${bIdx} out of bounds (SST count ${sstItemsB.length})`);
    }
    const bItem = sstItemsB[bIdx];
    let matchIdx = -1;
    for (let aIdx = 0; aIdx < newSstItemsA.length; aIdx++) {
      if (newSstItemsA[aIdx].normalized === bItem.normalized) {
        matchIdx = aIdx;
        break;
      }
    }

    if (matchIdx !== -1) {
      sstMap.set(bIdx, matchIdx);
    } else {
      const newIdx = newSstItemsA.length;
      newSstItemsA.push(bItem);
      sstMap.set(bIdx, newIdx);
    }
  }

  // Reconstruct xl/sharedStrings.xml in zipA
  const sstContentXml = newSstItemsA.map(item => item.rawXml).join('');
  const updatedSstXmlA = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${newSstItemsA.length}" uniqueCount="${newSstItemsA.length}">${sstContentXml}</sst>`;
  zipA.file('xl/sharedStrings.xml', updatedSstXmlA);

  // ---------------------------------------------------------------------------
  // 5. Derive & Remap Styles (`xl/styles.xml`)
  // ---------------------------------------------------------------------------
  const stylesXmlA = await zipA.file('xl/styles.xml').async('text');
  const stylesXmlB = await zipB.file('xl/styles.xml').async('text');

  function getTagBlock(xmlStr, tagName) {
    const match = xmlStr.match(new RegExp(`<${tagName}(?:\\s+count="\\d+")?[^>]*>([\\s\\S]*?)</${tagName}>`));
    return match ? match[1] : '';
  }

  function parseXmlElements(blockXml, tagName) {
    if (!blockXml) return [];
    const regex = new RegExp(`<${tagName}\\b[^>]*>(?:[\\s\\S]*?</${tagName}>)?|<${tagName}\\b[^>]*/>`, 'g');
    const matches = [...blockXml.matchAll(regex)];
    return matches.map(m => m[0]);
  }

  // A. Number Formats (<numFmts>)
  const numFmtsBlockA = getTagBlock(stylesXmlA, 'numFmts');
  const numFmtsBlockB = getTagBlock(stylesXmlB, 'numFmts');

  const numFmtElementsA = parseXmlElements(numFmtsBlockA, 'numFmt');
  const numFmtElementsB = parseXmlElements(numFmtsBlockB, 'numFmt');

  const numFmtMap = new Map(); // oldNumFmtId -> newNumFmtId
  const newNumFmtElementsA = [...numFmtElementsA];

  let nextCustomNumFmtId = 165;
  for (const elA of numFmtElementsA) {
    const idMatch = elA.match(/\bnumFmtId="(\d+)"/);
    if (idMatch) {
      const id = parseInt(idMatch[1], 10);
      if (id >= nextCustomNumFmtId) nextCustomNumFmtId = id + 1;
    }
  }

  for (const elB of numFmtElementsB) {
    const idMatchB = elB.match(/\bnumFmtId="(\d+)"/);
    const codeMatchB = elB.match(/\bformatCode="([^"]+)"/);
    if (idMatchB && codeMatchB) {
      const oldId = parseInt(idMatchB[1], 10);
      const codeB = codeMatchB[1];

      let matchId = -1;
      for (const elA of newNumFmtElementsA) {
        const codeMatchA = elA.match(/\bformatCode="([^"]+)"/);
        const idMatchA = elA.match(/\bnumFmtId="(\d+)"/);
        if (codeMatchA && codeMatchA[1] === codeB && idMatchA) {
          matchId = parseInt(idMatchA[1], 10);
          break;
        }
      }

      if (matchId !== -1) {
        numFmtMap.set(oldId, matchId);
      } else {
        const newId = nextCustomNumFmtId++;
        const newEl = `<numFmt numFmtId="${newId}" formatCode="${codeB}"/>`;
        newNumFmtElementsA.push(newEl);
        numFmtMap.set(oldId, newId);
      }
    }
  }

  // B. Fonts (<fonts>)
  const fontsBlockA = getTagBlock(stylesXmlA, 'fonts');
  const fontsBlockB = getTagBlock(stylesXmlB, 'fonts');

  const fontElementsA = parseXmlElements(fontsBlockA, 'font');
  const fontElementsB = parseXmlElements(fontsBlockB, 'font');

  const fontMap = new Map(); // oldFontIdx -> newFontIdx
  const newFontElementsA = [...fontElementsA];

  for (let bIdx = 0; bIdx < fontElementsB.length; bIdx++) {
    const normB = normalizeXml(fontElementsB[bIdx]);
    let matchIdx = -1;
    for (let aIdx = 0; aIdx < newFontElementsA.length; aIdx++) {
      if (normalizeXml(newFontElementsA[aIdx]) === normB) {
        matchIdx = aIdx;
        break;
      }
    }

    if (matchIdx !== -1) {
      fontMap.set(bIdx, matchIdx);
    } else {
      const newIdx = newFontElementsA.length;
      newFontElementsA.push(fontElementsB[bIdx]);
      fontMap.set(bIdx, newIdx);
    }
  }

  // C. Fills (<fills>)
  const fillsBlockA = getTagBlock(stylesXmlA, 'fills');
  const fillsBlockB = getTagBlock(stylesXmlB, 'fills');

  const fillElementsA = parseXmlElements(fillsBlockA, 'fill');
  const fillElementsB = parseXmlElements(fillsBlockB, 'fill');

  const fillMap = new Map(); // oldFillIdx -> newFillIdx
  const newFillElementsA = [...fillElementsA];

  for (let bIdx = 0; bIdx < fillElementsB.length; bIdx++) {
    const normB = normalizeXml(fillElementsB[bIdx]);
    let matchIdx = -1;
    for (let aIdx = 0; aIdx < newFillElementsA.length; aIdx++) {
      if (normalizeXml(newFillElementsA[aIdx]) === normB) {
        matchIdx = aIdx;
        break;
      }
    }

    if (matchIdx !== -1) {
      fillMap.set(bIdx, matchIdx);
    } else {
      const newIdx = newFillElementsA.length;
      newFillElementsA.push(fillElementsB[bIdx]);
      fillMap.set(bIdx, newIdx);
    }
  }

  // D. Borders (<borders>)
  const bordersBlockA = getTagBlock(stylesXmlA, 'borders');
  const bordersBlockB = getTagBlock(stylesXmlB, 'borders');

  const borderElementsA = parseXmlElements(bordersBlockA, 'border');
  const borderElementsB = parseXmlElements(bordersBlockB, 'border');

  const borderMap = new Map(); // oldBorderIdx -> newBorderIdx
  const newBorderElementsA = [...borderElementsA];

  for (let bIdx = 0; bIdx < borderElementsB.length; bIdx++) {
    const normB = normalizeXml(borderElementsB[bIdx]);
    let matchIdx = -1;
    for (let aIdx = 0; aIdx < newBorderElementsA.length; aIdx++) {
      if (normalizeXml(newBorderElementsA[aIdx]) === normB) {
        matchIdx = aIdx;
        break;
      }
    }

    if (matchIdx !== -1) {
      borderMap.set(bIdx, matchIdx);
    } else {
      const newIdx = newBorderElementsA.length;
      newBorderElementsA.push(borderElementsB[bIdx]);
      borderMap.set(bIdx, newIdx);
    }
  }

  function remapXfAttributes(xfTag, isCellXf = false, cellStyleXfMap = null, cellStyleXfElementsB = null) {
    let newTag = xfTag;

    // numFmtId
    newTag = newTag.replace(/\bnumFmtId="(\d+)"/g, (match, p1) => {
      const oldId = parseInt(p1, 10);
      if (oldId >= 164 && !numFmtMap.has(oldId)) {
        throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Referenced custom numFmtId ${oldId} missing in Part B numFmts map`);
      }
      const newId = numFmtMap.has(oldId) ? numFmtMap.get(oldId) : oldId;
      return `numFmtId="${newId}"`;
    });

    // fontId
    newTag = newTag.replace(/\bfontId="(\d+)"/g, (match, p1) => {
      const oldId = parseInt(p1, 10);
      if (!fontMap.has(oldId)) {
        throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Referenced fontId ${oldId} missing in Part B fonts map`);
      }
      const newId = fontMap.get(oldId);
      return `fontId="${newId}"`;
    });

    // fillId
    newTag = newTag.replace(/\bfillId="(\d+)"/g, (match, p1) => {
      const oldId = parseInt(p1, 10);
      if (!fillMap.has(oldId)) {
        throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Referenced fillId ${oldId} missing in Part B fills map`);
      }
      const newId = fillMap.get(oldId);
      return `fillId="${newId}"`;
    });

    // borderId
    newTag = newTag.replace(/\bborderId="(\d+)"/g, (match, p1) => {
      const oldId = parseInt(p1, 10);
      if (!borderMap.has(oldId)) {
        throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Referenced borderId ${oldId} missing in Part B borders map`);
      }
      const newId = borderMap.get(oldId);
      return `borderId="${newId}"`;
    });

    // xfId
    if (isCellXf) {
      newTag = newTag.replace(/\bxfId="(\d+)"/g, (match, p1) => {
        const oldId = parseInt(p1, 10);
        if (cellStyleXfElementsB && cellStyleXfElementsB.length > 0 && !cellStyleXfMap.has(oldId)) {
          throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Referenced xfId ${oldId} missing in Part B cellStyleXfs map`);
        }
        const newId = (cellStyleXfMap && cellStyleXfMap.has(oldId)) ? cellStyleXfMap.get(oldId) : 0;
        return `xfId="${newId}"`;
      });
    }

    return newTag;
  }

  // E. cellStyleXfs (<cellStyleXfs>)
  const cellStyleXfsBlockA = getTagBlock(stylesXmlA, 'cellStyleXfs');
  const cellStyleXfsBlockB = getTagBlock(stylesXmlB, 'cellStyleXfs');

  const cellStyleXfElementsA = parseXmlElements(cellStyleXfsBlockA, 'xf');
  const cellStyleXfElementsB = parseXmlElements(cellStyleXfsBlockB, 'xf');

  const cellStyleXfMap = new Map(); // oldXfIdx -> newXfIdx
  const newCellStyleXfElementsA = [...cellStyleXfElementsA];

  for (let bIdx = 0; bIdx < cellStyleXfElementsB.length; bIdx++) {
    const rawElB = cellStyleXfElementsB[bIdx];
    const elB = remapXfAttributes(rawElB, false);
    const normB = normalizeXml(elB);
    let matchIdx = -1;
    for (let aIdx = 0; aIdx < newCellStyleXfElementsA.length; aIdx++) {
      if (normalizeXml(newCellStyleXfElementsA[aIdx]) === normB) {
        matchIdx = aIdx;
        break;
      }
    }

    if (matchIdx !== -1) {
      cellStyleXfMap.set(bIdx, matchIdx);
    } else {
      const newIdx = newCellStyleXfElementsA.length;
      newCellStyleXfElementsA.push(elB);
      cellStyleXfMap.set(bIdx, newIdx);
    }
  }

  // F. cellXfs (<cellXfs>)
  const cellXfsBlockA = getTagBlock(stylesXmlA, 'cellXfs');
  const cellXfsBlockB = getTagBlock(stylesXmlB, 'cellXfs');

  const cellXfElementsA = parseXmlElements(cellXfsBlockA, 'xf');
  const cellXfElementsB = parseXmlElements(cellXfsBlockB, 'xf');

  const cellXfMap = new Map(); // oldStyleIdx -> newStyleIdx
  const newCellXfElementsA = [...cellXfElementsA];

  for (let bIdx = 0; bIdx < cellXfElementsB.length; bIdx++) {
    const originalElB = cellXfElementsB[bIdx];
    const remappedElB = remapXfAttributes(originalElB, true, cellStyleXfMap, cellStyleXfElementsB);
    const normB = normalizeXml(remappedElB);

    let matchIdx = -1;
    for (let aIdx = 0; aIdx < newCellXfElementsA.length; aIdx++) {
      if (normalizeXml(newCellXfElementsA[aIdx]) === normB) {
        matchIdx = aIdx;
        break;
      }
    }

    if (matchIdx !== -1) {
      cellXfMap.set(bIdx, matchIdx);
    } else {
      const newIdx = newCellXfElementsA.length;
      newCellXfElementsA.push(remappedElB);
      cellXfMap.set(bIdx, newIdx);
    }
  }

  // Reconstruct Part A styles.xml
  let updatedStylesXmlA = stylesXmlA;

  if (newNumFmtElementsA.length > 0) {
    const newNumFmtsBlock = `<numFmts count="${newNumFmtElementsA.length}">${newNumFmtElementsA.join('')}</numFmts>`;
    if (stylesXmlA.includes('<numFmts')) {
      updatedStylesXmlA = updatedStylesXmlA.replace(/<numFmts\b[^>]*>[\s\S]*?<\/numFmts>/, newNumFmtsBlock);
    } else {
      updatedStylesXmlA = updatedStylesXmlA.replace(/(<styleSheet\b[^>]*>)/, `$1${newNumFmtsBlock}`);
    }
  }

  const newFontsBlock = `<fonts count="${newFontElementsA.length}">${newFontElementsA.join('')}</fonts>`;
  updatedStylesXmlA = updatedStylesXmlA.replace(/<fonts\b[^>]*>[\s\S]*?<\/fonts>/, newFontsBlock);

  const newFillsBlock = `<fills count="${newFillElementsA.length}">${newFillElementsA.join('')}</fills>`;
  updatedStylesXmlA = updatedStylesXmlA.replace(/<fills\b[^>]*>[\s\S]*?<\/fills>/, newFillsBlock);

  const newBordersBlock = `<borders count="${newBorderElementsA.length}">${newBorderElementsA.join('')}</borders>`;
  updatedStylesXmlA = updatedStylesXmlA.replace(/<borders\b[^>]*>[\s\S]*?<\/borders>/, newBordersBlock);

  if (newCellStyleXfElementsA.length > 0) {
    const newCellStyleXfsBlock = `<cellStyleXfs count="${newCellStyleXfElementsA.length}">${newCellStyleXfElementsA.join('')}</cellStyleXfs>`;
    if (stylesXmlA.includes('<cellStyleXfs')) {
      updatedStylesXmlA = updatedStylesXmlA.replace(/<cellStyleXfs\b[^>]*>[\s\S]*?<\/cellStyleXfs>/, newCellStyleXfsBlock);
    }
  }

  const newCellXfsBlock = `<cellXfs count="${newCellXfElementsA.length}">${newCellXfElementsA.join('')}</cellXfs>`;
  updatedStylesXmlA = updatedStylesXmlA.replace(/<cellXfs\b[^>]*>[\s\S]*?<\/cellXfs>/, newCellXfsBlock);

  zipA.file('xl/styles.xml', updatedStylesXmlA);

  // ---------------------------------------------------------------------------
  // 6. Remap All Style-Reference Classes & Transform Part B Business Sheet XML
  // ---------------------------------------------------------------------------
  let sheetXmlB = await zipB.file(sheetB.zipPath).async('text');

  // Helper to remap style ID and fail closed if missing
  function lookupStyleMap(oldIdStr) {
    const oldStyleId = parseInt(oldIdStr, 10);
    if (!cellXfMap.has(oldStyleId)) {
      throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Referenced Part B style ID ${oldStyleId} missing in cellXfs map`);
    }
    return cellXfMap.get(oldStyleId);
  }

  // 1. Cell styles: s="ID"
  sheetXmlB = sheetXmlB.replace(/\bs="(\d+)"/g, (match, p1) => {
    return `s="${lookupStyleMap(p1)}"`;
  });

  // 2. Column styles: style="ID"
  sheetXmlB = sheetXmlB.replace(/\bstyle="(\d+)"/g, (match, p1) => {
    return `style="${lookupStyleMap(p1)}"`;
  });

  // 3. Row styles: s="ID" (covered by \bs="(\d+)" above)

  // 4. Default sheet style: defaultStyle="ID"
  sheetXmlB = sheetXmlB.replace(/\bdefaultStyle="(\d+)"/g, (match, p1) => {
    return `defaultStyle="${lookupStyleMap(p1)}"`;
  });

  // Remap shared string indices <v>INDEX</v> for cells with t="s"
  sheetXmlB = sheetXmlB.replace(/(<c\b[^>]*?\bt="s"[^>]*?>(?:(?!<\/c>|<c\b)[\s\S])*?<v>)(\d+)(<\/v>)/g, (match, open, p1, close) => {
    const oldSstIdx = parseInt(p1, 10);
    if (!sstMap.has(oldSstIdx)) {
      throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Referenced Part B shared string index ${oldSstIdx} missing in sst map`);
    }
    const newSstIdx = sstMap.get(oldSstIdx);
    return `${open}${newSstIdx}${close}`;
  });

  // ---------------------------------------------------------------------------
  // 7. Retarget & Copy Worksheet Relationship Graph (.rels) & Dependencies
  // ---------------------------------------------------------------------------
  const worksheetXmlRefIds = extractXmlRelReferences(sheetXmlContentB);

  const sheetBRelZipPath = sheetB.zipPath.replace(/worksheets\/([^\/]+)$/, 'worksheets/_rels/$1.rels');
  const sheetBRelFile = zipB.file(sheetBRelZipPath);

  // Corrective A & E: XML relationship references without .rels file => FAIL CLOSED
  if (worksheetXmlRefIds.size > 0 && !sheetBRelFile) {
    throw new Error('EXPORT_COMBINED_COMPOSER_UNRESOLVED: Worksheet XML contains relationship references but .rels file is missing');
  }

  const copiedSheetRels = [];
  const addedContentTypesOverrides = [];

  if (sheetBRelFile) {
    const sheetBRelsXml = await sheetBRelFile.async('text');
    const parsedSheetRels = parseRelsDocument(sheetBRelsXml, 'Part B worksheet .rels');

    const parsedSheetRelIds = new Set(parsedSheetRels.map(r => r.id));

    // Corrective A: Bidirectional check - every XML ref MUST exist in .rels
    for (const xmlRefId of worksheetXmlRefIds) {
      if (!parsedSheetRelIds.has(xmlRefId)) {
        throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Dangling worksheet XML relationship reference "${xmlRefId}" missing in .rels file`);
      }
    }

    // Corrective B: Bidirectional check - every .rels relationship MUST be referenced in worksheet XML (no orphans)
    for (const rel of parsedSheetRels) {
      if (!worksheetXmlRefIds.has(rel.id)) {
        throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Unreferenced orphan relationship Id "${rel.id}" in worksheet .rels`);
      }

      if (rel.targetMode === 'External') {
        throw new Error('EXPORT_COMBINED_COMPOSER_UNRESOLVED: External relationship TargetMode not supported');
      }

      if (rel.target.includes('://') || rel.target.includes('..\\')) {
        throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Unsafe relationship target "${rel.target}"`);
      }

      const targetModeAttr = rel.targetMode ? ` TargetMode="${rel.targetMode}"` : '';

      if (rel.type.endsWith('/printerSettings')) {
        // PrinterSettings dependency
        let srcPrinterPath = rel.target.replace(/^\.\.\//, 'xl/');
        const printerBufB = zipB.file(srcPrinterPath);
        if (!printerBufB) {
          throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Referenced Part B printerSettings file "${srcPrinterPath}" missing`);
        }

        let psNum = 2;
        while (zipA.file(`xl/printerSettings/printerSettings${psNum}.bin`)) {
          psNum++;
        }
        const destPrinterZipPath = `xl/printerSettings/printerSettings${psNum}.bin`;
        const destPrinterTarget = `../printerSettings/printerSettings${psNum}.bin`;

        const psData = await printerBufB.async('nodebuffer');
        zipA.file(destPrinterZipPath, psData);

        copiedSheetRels.push(`<Relationship Id="${rel.id}" Type="${rel.type}" Target="${destPrinterTarget}"${targetModeAttr}/>`);
      } else if (rel.type.endsWith('/drawing')) {
        // Drawing dependency
        let srcDrawingPath = rel.target.replace(/^\.\.\//, 'xl/');
        const drawingFileB = zipB.file(srcDrawingPath);
        if (!drawingFileB) {
          throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Referenced Part B drawing file "${srcDrawingPath}" missing`);
        }

        let drwNum = 2;
        while (zipA.file(`xl/drawings/drawing${drwNum}.xml`)) {
          drwNum++;
        }
        const destDrawingZipPath = `xl/drawings/drawing${drwNum}.xml`;
        const destDrawingRelsZipPath = `xl/drawings/_rels/drawing${drwNum}.xml.rels`;
        const destDrawingTarget = `../drawings/drawing${drwNum}.xml`;

        let drawingXmlStrB = await drawingFileB.async('text');
        zipA.file(destDrawingZipPath, drawingXmlStrB);
        addedContentTypesOverrides.push(`<Override PartName="/${destDrawingZipPath}" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>`);

        // Process drawing's own .rels file if present (Corrective C)
        const srcDrawingRelsPath = srcDrawingPath.replace(/drawings\/([^\/]+)$/, 'drawings/_rels/$1.rels');
        const drawingRelsFileB = zipB.file(srcDrawingRelsPath);
        const drwXmlRefIds = extractXmlRelReferences(drawingXmlStrB);

        if (drwXmlRefIds.size > 0 && !drawingRelsFileB) {
          throw new Error('EXPORT_COMBINED_COMPOSER_UNRESOLVED: Drawing XML contains relationship references but drawing .rels file is missing');
        }

        if (drawingRelsFileB) {
          let drawingRelsXmlB = await drawingRelsFileB.async('text');
          const parsedDrwRels = parseRelsDocument(drawingRelsXmlB, 'Part B drawing .rels');
          const parsedDrwRelIds = new Set(parsedDrwRels.map(r => r.id));

          // Corrective C: Bidirectional check - drawing XML -> drawing .rels
          for (const xmlRefId of drwXmlRefIds) {
            if (!parsedDrwRelIds.has(xmlRefId)) {
              throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Dangling drawing XML relationship reference "${xmlRefId}" missing in drawing .rels file`);
            }
          }

          // Corrective C: Bidirectional check - drawing .rels -> drawing XML (no orphan drawing rels)
          for (const drwRel of parsedDrwRels) {
            if (!drwXmlRefIds.has(drwRel.id)) {
              throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Unreferenced orphan relationship Id "${drwRel.id}" in drawing .rels`);
            }

            if (drwRel.targetMode === 'External') {
              throw new Error('EXPORT_COMBINED_COMPOSER_UNRESOLVED: External drawing relationship TargetMode not supported');
            }

            if (drwRel.type.endsWith('/image')) {
              let srcMediaPath = drwRel.target.replace(/^\.\.\//, 'xl/');
              const mediaFileB = zipB.file(srcMediaPath);
              if (!mediaFileB) {
                throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Referenced Part B media file "${srcMediaPath}" missing`);
              }

              const mediaBufB = await mediaFileB.async('nodebuffer');
              const mediaFilenameB = srcMediaPath.replace(/^xl\/media\//, '');

              let destMediaZipPath = `xl/media/${mediaFilenameB}`;
              let destMediaRelTarget = drwRel.target;

              // Collision check with zipA
              if (zipA.file(destMediaZipPath)) {
                const extMatch = mediaFilenameB.match(/(\.[^.]+)$/);
                const ext = extMatch ? extMatch[1] : '.png';
                const baseName = mediaFilenameB.replace(/\.[^.]+$/, '');
                let mNum = 1;
                while (zipA.file(`xl/media/${baseName}_partb_${mNum}${ext}`)) {
                  mNum++;
                }
                destMediaZipPath = `xl/media/${baseName}_partb_${mNum}${ext}`;
                destMediaRelTarget = `../media/${baseName}_partb_${mNum}${ext}`;
              }

              zipA.file(destMediaZipPath, mediaBufB);

              // Retarget exact relationship by Id
              drawingRelsXmlB = drawingRelsXmlB.replace(
                new RegExp(`<Relationship\\b[^>]*?\\bId="${drwRel.id}"[^>]*?>`),
                `<Relationship Id="${drwRel.id}" Type="${drwRel.type}" Target="${destMediaRelTarget}"/>`
              );

              const ext = destMediaZipPath.split('.').pop().toLowerCase();
              if (ext === 'png') {
                addedContentTypesOverrides.push(`<Default Extension="png" ContentType="image/png"/>`);
              } else if (ext === 'jpeg' || ext === 'jpg') {
                addedContentTypesOverrides.push(`<Default Extension="jpeg" ContentType="image/jpeg"/>`);
              }
            } else {
              throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Unsupported drawing relationship type "${drwRel.type}"`);
            }
          }

          zipA.file(destDrawingRelsZipPath, drawingRelsXmlB);
        }

        copiedSheetRels.push(`<Relationship Id="${rel.id}" Type="${rel.type}" Target="${destDrawingTarget}"${targetModeAttr}/>`);
      } else {
        throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Unsupported worksheet relationship type "${rel.type}"`);
      }
    }

    // Write sheet2.xml.rels in zipA
    const sheet2RelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${copiedSheetRels.join('')}</Relationships>`;
    zipA.file(partBWorksheetRelsPath, sheet2RelsXml);
  }

  // Write remapped Part B business sheet as partBWorksheetPath in zipA
  zipA.file(partBWorksheetPath, sheetXmlB);
  addedContentTypesOverrides.push(`<Override PartName="/${partBWorksheetPath}" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`);

  // ---------------------------------------------------------------------------
  // 8. Update Base Package Metadata (`xl/workbook.xml`, `xl/_rels/workbook.xml.rels`, `[Content_Types].xml`, `docProps/app.xml`)
  // ---------------------------------------------------------------------------
  // A. xl/_rels/workbook.xml.rels
  let wbRelsContentA = await zipA.file('xl/_rels/workbook.xml.rels').async('text');
  const sheetRelTag = `<Relationship Id="${partBSheetRId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${worksheetNum}.xml"/>`;
  wbRelsContentA = wbRelsContentA.replace('</Relationships>', `${sheetRelTag}</Relationships>`);
  zipA.file('xl/_rels/workbook.xml.rels', wbRelsContentA);

  // B. xl/workbook.xml
  let wbContentA = await zipA.file('xl/workbook.xml').async('text');

  // Insert sheet 2 under <sheets>
  const sheetTag2 = `<sheet name="(Part B) Competency" sheetId="${partBSheetId}" r:id="${partBSheetRId}"/>`;
  wbContentA = wbContentA.replace('</sheets>', `${sheetTag2}</sheets>`);

  // Update <definedNames> with exact preserved Print_Areas
  const newDefinedNamesBlock = `<definedNames><definedName name="_xlnm.Print_Area" localSheetId="0">${partAPrintAreaText}</definedName><definedName name="_xlnm.Print_Area" localSheetId="1">${partBPrintAreaText}</definedName></definedNames>`;
  if (wbContentA.includes('<definedNames>')) {
    wbContentA = wbContentA.replace(/<definedNames>[\s\S]*?<\/definedNames>/, newDefinedNamesBlock);
  } else {
    wbContentA = wbContentA.replace('</workbook>', `${newDefinedNamesBlock}</workbook>`);
  }
  zipA.file('xl/workbook.xml', wbContentA);

  // C. [Content_Types].xml
  let contentTypesXmlA = await zipA.file('[Content_Types].xml').async('text');

  for (const overrideTag of addedContentTypesOverrides) {
    if (overrideTag.startsWith('<Override')) {
      const partNameMatch = overrideTag.match(/PartName="([^"]+)"/);
      if (partNameMatch && !contentTypesXmlA.includes(`PartName="${partNameMatch[1]}"`)) {
        contentTypesXmlA = contentTypesXmlA.replace('</Types>', `${overrideTag}</Types>`);
      }
    } else if (overrideTag.startsWith('<Default')) {
      const extMatch = overrideTag.match(/Extension="([^"]+)"/);
      if (extMatch && !contentTypesXmlA.includes(`Extension="${extMatch[1]}"`)) {
        contentTypesXmlA = contentTypesXmlA.replace('</Types>', `${overrideTag}</Types>`);
      }
    }
  }
  zipA.file('[Content_Types].xml', contentTypesXmlA);

  // D. docProps/app.xml
  let appPropsXmlA = await zipA.file('docProps/app.xml').async('text');

  const updatedHeadingPairs = `<HeadingPairs><vt:vector size="4" baseType="variant"><vt:variant><vt:lpstr>Worksheets</vt:lpstr></vt:variant><vt:variant><vt:i4>2</vt:i4></vt:variant><vt:variant><vt:lpstr>Named Ranges</vt:lpstr></vt:variant><vt:variant><vt:i4>2</vt:i4></vt:variant></vt:vector></HeadingPairs>`;
  const updatedTitlesOfParts = `<TitlesOfParts><vt:vector size="4" baseType="lpstr"><vt:lpstr>MBO Staff &amp; Chief</vt:lpstr><vt:lpstr>(Part B) Competency</vt:lpstr><vt:lpstr>'MBO Staff &amp; Chief'!Print_Area</vt:lpstr><vt:lpstr>'(Part B) Competency'!Print_Area</vt:lpstr></vt:vector></TitlesOfParts>`;

  if (appPropsXmlA.includes('<HeadingPairs>')) {
    appPropsXmlA = appPropsXmlA.replace(/<HeadingPairs>[\s\S]*?<\/HeadingPairs>/, updatedHeadingPairs);
  }
  if (appPropsXmlA.includes('<TitlesOfParts>')) {
    appPropsXmlA = appPropsXmlA.replace(/<TitlesOfParts>[\s\S]*?<\/TitlesOfParts>/, updatedTitlesOfParts);
  }
  zipA.file('docProps/app.xml', appPropsXmlA);

  // ---------------------------------------------------------------------------
  // 9. Production Target Graph Resolution Validation (Bidirectional Final Check)
  // ---------------------------------------------------------------------------
  const finalSheetXml = await zipA.file(partBWorksheetPath).async('text');
  const finalSheetXmlRefIds = extractXmlRelReferences(finalSheetXml);

  if (zipA.file(partBWorksheetRelsPath)) {
    const finalSheetRelsXml = await zipA.file(partBWorksheetRelsPath).async('text');
    const parsedFinalSheetRels = parseRelsDocument(finalSheetRelsXml, 'final worksheet .rels');
    const finalSheetRelIds = new Set(parsedFinalSheetRels.map(r => r.id));

    // Verify XML -> .rels
    for (const xmlRefId of finalSheetXmlRefIds) {
      if (!finalSheetRelIds.has(xmlRefId)) {
        throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Final worksheet XML relationship reference "${xmlRefId}" missing in final .rels file`);
      }
    }

    // Verify .rels -> XML
    for (const rel of parsedFinalSheetRels) {
      if (!finalSheetXmlRefIds.has(rel.id)) {
        throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Final worksheet .rels contains orphan relationship Id "${rel.id}"`);
      }

      const targetZipPath = rel.target.replace(/^\.\.\//, 'xl/');
      if (!zipA.file(targetZipPath)) {
        throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Destination target "${targetZipPath}" missing in final package`);
      }

      if (targetZipPath.startsWith('xl/drawings/') && targetZipPath.endsWith('.xml')) {
        const finalDrwXml = await zipA.file(targetZipPath).async('text');
        const finalDrwXmlRefIds = extractXmlRelReferences(finalDrwXml);

        const drawingRelsZipPath = targetZipPath.replace(/drawings\/([^\/]+)$/, 'drawings/_rels/$1.rels');
        if (zipA.file(drawingRelsZipPath)) {
          const finalDrwRelsXml = await zipA.file(drawingRelsZipPath).async('text');
          const parsedFinalDrwRels = parseRelsDocument(finalDrwRelsXml, 'final drawing .rels');
          const finalDrwRelIds = new Set(parsedFinalDrwRels.map(r => r.id));

          // Verify drawing XML -> drawing .rels
          for (const dXmlRefId of finalDrwXmlRefIds) {
            if (!finalDrwRelIds.has(dXmlRefId)) {
              throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Final drawing XML relationship reference "${dXmlRefId}" missing in final drawing .rels file`);
            }
          }

          // Verify drawing .rels -> drawing XML
          for (const dRel of parsedFinalDrwRels) {
            if (!finalDrwXmlRefIds.has(dRel.id)) {
              throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Final drawing .rels contains orphan relationship Id "${dRel.id}"`);
            }

            const mediaZipPath = dRel.target.replace(/^\.\.\//, 'xl/');
            if (!zipA.file(mediaZipPath)) {
              throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Destination media target "${mediaZipPath}" missing in final package`);
            }
          }
        }
      }
    }
  } else if (finalSheetXmlRefIds.size > 0) {
    throw new Error('EXPORT_COMBINED_COMPOSER_UNRESOLVED: Final worksheet XML contains relationship references but .rels file is missing');
  }

  // ---------------------------------------------------------------------------
  // 10. Generate & Return Output Bytes
  // ---------------------------------------------------------------------------
  const outputUint8 = await zipA.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
  return outputUint8;
}
