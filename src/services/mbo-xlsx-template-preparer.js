/**
 * Production Part A & Part B XLSX Template Preparer & Sanitizer Foundation
 * 
 * Browser-safe asynchronous preparer:
 *   - Part A: owner Part A template bytes + objectiveCount N (4..10)
 *   - Part B: owner Part B template bytes + competencyCount N (6, 7, 8)
 * 
 * Rules:
 * 1. Pure browser-safe production module (no node:fs, node:path, node:crypto, Kintone API).
 * 2. Zero mutation of caller / source bytes.
 * 3. Validate MboXlsxTemplateProfile integrity & Part A / Part B owner SHA-256.
 * 4. Zero proof sentinels (NO proof-only markers).
 * 5. Zero semantic value writes (no employee data, no App794 records, no scores, no formulas).
 * 6. Raw OOXML value-payload sanitization (preserves exact <c> structural attributes & t="s").
 */
import XlsxPopulate from 'xlsx-populate';
import {
  PART_A_TEMPLATE_SHA256,
  PART_B_TEMPLATE_SHA256,
  MboXlsxTemplateProfile,
  validateMappingIntegrity,
  expandRangeToAddresses
} from '../profiles/mbo-xlsx-template-profile.js';

export async function computeSha256(data) {
  let bytes;
  if (data instanceof Uint8Array) {
    bytes = data;
  } else if (data instanceof ArrayBuffer) {
    bytes = new Uint8Array(data);
  } else if (typeof Buffer !== 'undefined' && Buffer.isBuffer(data)) {
    bytes = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  } else {
    throw new Error('EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Invalid input data format');
  }

  if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle && typeof globalThis.crypto.subtle.digest === 'function') {
    const hashBuf = await globalThis.crypto.subtle.digest('SHA-256', bytes);
    const hashArray = Array.from(new Uint8Array(hashBuf));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  throw new Error('EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Browser crypto.subtle unavailable');
}

/**
 * Browser-safe pure production helper to validate and remove reference image (rId3 / image3.png).
 * 
 * Production exact accepted reference tuple:
 *   Id = "rId3"
 *   Type = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image"
 *   Target = "../media/image3.png" (EXACTLY, reject "media/image3.png" or any other Target)
 *   TargetMode = ABSENT (reject TargetMode="Internal", TargetMode="External", or any TargetMode attribute)
 *   Media = "xl/media/image3.png"
 *   r:embed="rId3" occurrences = EXACTLY 1 across all drawing anchors
 */
export function validateAndRemoveReferenceImage(zipFiles) {
  const drawingXmlPath = 'xl/drawings/drawing1.xml';
  const drawingRelsPath = 'xl/drawings/_rels/drawing1.xml.rels';
  const mediaPath = 'xl/media/image3.png';

  if (!zipFiles || !zipFiles[drawingXmlPath] || !zipFiles[drawingRelsPath] || !zipFiles[mediaPath]) {
    throw new Error('EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Reference image files missing in package');
  }

  const drawingRels = zipFiles[drawingRelsPath];
  const drawingXml = zipFiles[drawingXmlPath];

  if (typeof drawingRels !== 'string' || typeof drawingXml !== 'string') {
    throw new Error('EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Drawing files must be strings');
  }

  // 1. Account for ALL Relationship evidence in drawing1.xml.rels
  const rId3Occurrences = [...drawingRels.matchAll(/\brId3\b/g)];
  if (rId3Occurrences.length === 0) {
    throw new Error('EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Missing rId3 relationship');
  }

  // Match all relationship elements (self-closing or paired/open, including optional namespace prefix)
  const allRelTagMatches = [...drawingRels.matchAll(/<(?:\w+:)?Relationship\b[^>]*>(?:[\s\S]*?<\/(?:\w+:)?Relationship>)?|<(?:\w+:)?Relationship\b[^>]*\/>|<(?:\w+:)?Relationship\b[^>]*>/gi)];
  // Match ONLY canonical self-closing <Relationship .../> elements
  const selfClosingRelMatches = [...drawingRels.matchAll(/<Relationship\s+[^>]*\/>/g)];

  const matchingRels = [];
  for (const m of selfClosingRelMatches) {
    const tag = m[0].trim();
    if (tag.includes('rId3')) {
      const idMatch = tag.match(/\bId="([^"]+)"/);
      const typeMatch = tag.match(/\bType="([^"]+)"/);
      const targetMatch = tag.match(/\bTarget="([^"]+)"/);
      const hasTargetMode = /\bTargetMode=/i.test(tag);
      const modeMatch = tag.match(/\bTargetMode="([^"]+)"/);

      matchingRels.push({
        tag,
        id: idMatch ? idMatch[1] : null,
        type: typeMatch ? typeMatch[1] : null,
        target: targetMatch ? targetMatch[1] : null,
        hasTargetMode,
        mode: modeMatch ? modeMatch[1] : null
      });
    }
  }

  // Must have EXACTLY ONE canonical self-closing Relationship matching rId3 AND total rId3 occurrences in rels text must be exactly 1
  if (matchingRels.length !== 1 || rId3Occurrences.length !== 1) {
    throw new Error('EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Expected exactly 1 canonical self-closing rId3 relationship');
  }

  // Assert no non-self-closing, paired, open-only or namespace-prefixed relationship tag contains rId3
  for (const m of allRelTagMatches) {
    const tag = m[0].trim();
    if (tag.includes('rId3')) {
      const isCanonicalSelfClosing = tag.startsWith('<Relationship ') && tag.endsWith('/>');
      if (!isCanonicalSelfClosing) {
        throw new Error('EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Non-self-closing, open-only or namespace-prefixed rId3 relationship forbidden');
      }
    }
  }

  const rel = matchingRels[0];

  if (rel.id !== 'rId3') {
    throw new Error('EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Invalid relationship Id for rId3');
  }

  const expectedType = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image';
  if (rel.type !== expectedType) {
    throw new Error('EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Invalid relationship Type for rId3');
  }

  if (rel.target !== '../media/image3.png') {
    throw new Error('EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Invalid relationship Target for rId3 (must be ../media/image3.png)');
  }

  if (rel.hasTargetMode) {
    throw new Error('EXPORT_TEMPLATE_PREPARER_UNRESOLVED: TargetMode attribute must be absent for rId3');
  }

  // 2. Validate Drawing Anchors for exact r:embed="rId3"
  const embedMatches = [...drawingXml.matchAll(/\br:embed="rId3"/g)];
  const genericEmbedMatches = [...drawingXml.matchAll(/\bembed="rId3"/g)];
  const totalEmbedCount = Math.max(embedMatches.length, genericEmbedMatches.length);

  if (totalEmbedCount === 0) {
    throw new Error('EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Zero exact r:embed="rId3" occurrences found');
  }

  if (totalEmbedCount > 1) {
    throw new Error('EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Duplicate r:embed="rId3" occurrences found');
  }

  const allId3Matches = [...drawingXml.matchAll(/\brId3\b/g)];
  if (allId3Matches.length > totalEmbedCount) {
    throw new Error('EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Incidental rId3 text found without exact embed attribute');
  }

  const anchorMatches = [...drawingXml.matchAll(/<xdr:(?:twoCellAnchor|oneCellAnchor)[^>]*>[\s\S]*?<\/xdr:(?:twoCellAnchor|oneCellAnchor)>/gi)];
  const matchingAnchors = [];
  for (const m of anchorMatches) {
    const anchorXml = m[0];
    if (anchorXml.includes('rId3')) {
      matchingAnchors.push(anchorXml);
    }
  }

  if (matchingAnchors.length !== 1) {
    throw new Error('EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Expected exactly 1 drawing anchor embedding rId3');
  }

  // 3. Remove exact target anchor and relationship
  let updatedDrawingXml = drawingXml;
  for (const aXml of matchingAnchors) {
    updatedDrawingXml = updatedDrawingXml.replace(aXml, '');
  }

  let updatedDrawingRels = drawingRels.replace(rel.tag, '');

  // Verify UPDATED drawing1.xml.rels contains ZERO rId3 and ZERO image3.png
  if (updatedDrawingRels.includes('rId3') || updatedDrawingRels.includes('image3.png')) {
    throw new Error('EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Surviving rId3 or image3.png reference in updated drawing rels');
  }

  return {
    updatedDrawingXml,
    updatedDrawingRels,
    mediaToRemove: mediaPath
  };
}

/**
 * Raw OOXML cell value-payload sanitizer.
 * Clears value-bearing payload (<v>...</v>, <is>...</is>) from paired cell nodes for authorized sensitive addresses.
 * Preserves exact opening-tag structural attributes (including r, s, t) and never materializes new cell nodes.
 */
function sanitizeRawSheetXml(sheetXml, sanAddresses) {
  return sheetXml.replace(/<c r="([A-Z]+\d+)"([^>]*)>((?:(?!<c\b)[\s\S])*?)<\/c>/g, (match, addr, attrs, body) => {
    if (!sanAddresses.has(addr)) {
      return match;
    }
    if (/<f[\s>]/i.test(body)) {
      throw new Error(`EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Unexpected formula in sensitive cell ${addr}`);
    }
    const cleanBody = body.replace(/<(?:v|is)>[\s\S]*?<\/(?:v|is)>/g, '');
    if (cleanBody.trim().length === 0) {
      return `<c r="${addr}"${attrs}/>`;
    }
    return `<c r="${addr}"${attrs}>${cleanBody}</c>`;
  });
}

function parseRowObjectsFromSheetXml(sheetXml) {
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

/**
 * Pure browser-safe helper to derive expected Part B merge inventory from raw SOURCE merge list.
 */
export function deriveExpectedPartBMergeInventory(srcMergesList, competencyCount, includeTitleOverlay = false) {
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
      throw new Error(`EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Crossing merge ref: ${mRef}`);
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

export async function preparePartATemplate(templateBytes, options = {}) {
  const objectiveCount = options.objectiveCount !== undefined ? options.objectiveCount : 4;
  const profile = options.profile || new MboXlsxTemplateProfile();

  // 1. Validate Profile integrity before template-dependent mutation
  validateMappingIntegrity(profile);

  // 2. Validate objective count domain (4..10)
  if (typeof objectiveCount !== 'number' || !Number.isInteger(objectiveCount) || objectiveCount < 4 || objectiveCount > 10) {
    throw new Error('EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Objective count out of domain');
  }

  if (!templateBytes || (typeof templateBytes !== 'object' && !(templateBytes instanceof ArrayBuffer))) {
    throw new Error('EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Invalid template bytes');
  }

  // 3. Validate template SHA256 before any mutation
  const sha = await computeSha256(templateBytes);
  if (sha !== PART_A_TEMPLATE_SHA256) {
    throw new Error('EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Part A template SHA mismatch');
  }

  // 4. Get Part A layout & sanitization topology from Profile
  const layout = profile.getPartALayoutTopology(objectiveCount);

  // 5. Load zip copy without mutating caller bytes
  const copyBytes = new Uint8Array(templateBytes.byteLength || templateBytes.length);
  const srcView = templateBytes instanceof Uint8Array ? templateBytes : new Uint8Array(templateBytes);
  copyBytes.set(srcView);

  const wbStruct = await XlsxPopulate.fromDataAsync(copyBytes);

  // --------------------------------------------------------------------------
  // PASS 1: Read-Only Sensitive Token Collection & SharedStrings Purge
  // --------------------------------------------------------------------------
  const baseLayout = profile.getPartALayoutTopology(4);
  const sensitiveTokens = [];
  const sensitiveAddrs = baseLayout.effectiveSanitizationRanges.flatMap(r => expandRangeToAddresses(r));
  const sheetReadOnly = wbStruct.sheet(0);
  for (const addr of sensitiveAddrs) {
    const val = sheetReadOnly.cell(addr).value();
    if (val && typeof val === 'string' && val.trim().length >= 2) {
      sensitiveTokens.push(val.trim());
    }
  }

  // Purge sensitive string tokens from xl/sharedStrings.xml directly on zip
  const ssFile = wbStruct._zip.files['xl/sharedStrings.xml'];
  if (ssFile && sensitiveTokens.length > 0) {
    let ssXml = await ssFile.async('string');
    let ssModified = false;
    for (const token of sensitiveTokens) {
      if (ssXml.includes(token)) {
        ssXml = ssXml.replaceAll(token, '');
        ssModified = true;
      }
    }
    if (ssModified) {
      wbStruct._zip.file('xl/sharedStrings.xml', ssXml);
    }
  }

  // --------------------------------------------------------------------------
  // PASS 2: Raw OOXML Cell Value Sanitization, Row/Merge Shift, Dimension Tag & Image Removal
  // --------------------------------------------------------------------------
  const sheetFile = wbStruct._zip.files['xl/worksheets/sheet1.xml'];
  if (!sheetFile) {
    throw new Error('EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Sheet1 XML missing');
  }
  let sheetXml = await sheetFile.async('string');

  // Sanitize exact existing cell nodes in raw sheet1.xml (value payload clearing only)
  const sanAddressSet = new Set(sensitiveAddrs);
  sheetXml = sanitizeRawSheetXml(sheetXml, sanAddressSet);

  const extraRows = objectiveCount - 4;

  if (extraRows > 0) {
    // A. Shift rows r >= 29 by +extraRows
    sheetXml = sheetXml.replace(/<row r="(\d+)"([^>]*)>/g, (match, rStr, rest) => {
      const r = parseInt(rStr, 10);
      if (r >= 29) {
        return `<row r="${r + extraRows}"${rest}>`;
      }
      return match;
    });

    // B. Shift cell references <c r="colRow"
    sheetXml = sheetXml.replace(/<c r="([A-Z]+)(\d+)"/g, (match, col, rStr) => {
      const r = parseInt(rStr, 10);
      if (r >= 29) {
        return `<c r="${col}${r + extraRows}"`;
      }
      return match;
    });

    // C. Clone row 28 XML for inserted rows 29..(28+extraRows)
    const row28Match = sheetXml.match(/<row r="28"[^>]*>[\s\S]*?<\/row>/);
    if (!row28Match) {
      throw new Error('EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Row 28 XML not found');
    }
    const row28Xml = row28Match[0];
    const clonedRowsXml = [];
    for (let i = 0; i < extraRows; i++) {
      const targetR = 29 + i;
      let clonedRow = row28Xml.replace(/<row r="28"/g, `<row r="${targetR}"`);
      clonedRow = clonedRow.replace(/<c r="([A-Z]+)28"/g, (m, col) => `<c r="${col}${targetR}"`);
      clonedRowsXml.push(clonedRow);
    }
    sheetXml = sheetXml.replace(row28Match[0], row28Match[0] + '\n' + clonedRowsXml.join('\n'));

    // D. Extract and clone row 28 mergeCell elements
    const row28Merges = [];
    const mergeCellMatches = [...sheetXml.matchAll(/<mergeCell ref="([A-Z]+)28:([A-Z]+)28"\/>/g)];
    for (const m of mergeCellMatches) {
      row28Merges.push({ col1: m[1], col2: m[2] });
    }

    // Shift existing mergeCell elements for rows >= 29
    sheetXml = sheetXml.replace(/<mergeCell ref="([A-Z]+)(\d+):([A-Z]+)(\d+)"\/>/g, (match, c1, r1Str, c2, r2Str) => {
      let r1 = parseInt(r1Str, 10);
      let r2 = parseInt(r2Str, 10);
      if (r1 >= 29) r1 += extraRows;
      if (r2 >= 29) r2 += extraRows;
      return `<mergeCell ref="${c1}${r1}:${c2}${r2}"/>`;
    });

    // Append cloned mergeCell elements
    const clonedMergesXml = [];
    for (let i = 0; i < extraRows; i++) {
      const targetR = 29 + i;
      for (const m of row28Merges) {
        clonedMergesXml.push(`<mergeCell ref="${m.col1}${targetR}:${m.col2}${targetR}"/>`);
      }
    }

    if (clonedMergesXml.length > 0) {
      sheetXml = sheetXml.replace(/<\/mergeCells>/, clonedMergesXml.join('\n') + '\n</mergeCells>');
    }

    // Update <mergeCells count="N">
    const countMatch = sheetXml.match(/<mergeCells count="(\d+)">/);
    if (countMatch) {
      const currentCount = parseInt(countMatch[1], 10);
      const newCount = currentCount + clonedMergesXml.length;
      sheetXml = sheetXml.replace(/<mergeCells count="\d+">/, `<mergeCells count="${newCount}">`);
    }
  }

  // E. Ensure dimension tag ref is exact (A1:BL${52 + extraRows})
  const expectedLastRow = 52 + extraRows;
  const dimensionTag = `<dimension ref="A1:BL${expectedLastRow}"/>`;

  if (/<dimension [^>]*\/>/.test(sheetXml)) {
    sheetXml = sheetXml.replace(/<dimension [^>]*\/>/, dimensionTag);
  } else if (/<sheetPr[^>]*\/>/.test(sheetXml)) {
    sheetXml = sheetXml.replace(/<sheetPr[^>]*\/>/, `$& \n  ${dimensionTag}`);
  } else if (/<sheetPr[^>]*>[\s\S]*?<\/sheetPr>/.test(sheetXml)) {
    sheetXml = sheetXml.replace(/<sheetPr[^>]*>[\s\S]*?<\/sheetPr>/, `$& \n  ${dimensionTag}`);
  } else {
    sheetXml = sheetXml.replace(/<worksheet[^>]*>/, `$& \n  ${dimensionTag}`);
  }

  wbStruct._zip.file('xl/worksheets/sheet1.xml', sheetXml);

  // F. Update Print_Area in xl/workbook.xml
  const wbFile = wbStruct._zip.files['xl/workbook.xml'];
  if (wbFile) {
    let wbXml = await wbFile.async('string');
    const printAreaStr = `$A$1:$BJ$${expectedLastRow}`;
    wbXml = wbXml.replace(
      /<definedName name="_xlnm\.Print_Area"[^>]*>[^<]+<\/definedName>/,
      `<definedName name="_xlnm.Print_Area" localSheetId="0">'MBO Staff &amp; Chief'!${printAreaStr}</definedName>`
    );
    wbStruct._zip.file('xl/workbook.xml', wbXml);
  }

  // G. Reference Image Removal (rId3 / image3.png) via pure production helper
  const drawingXmlPath = 'xl/drawings/drawing1.xml';
  const drawingRelsPath = 'xl/drawings/_rels/drawing1.xml.rels';
  const mediaPath = 'xl/media/image3.png';

  const drawingXmlFile = wbStruct._zip.files[drawingXmlPath];
  const drawingRelsFile = wbStruct._zip.files[drawingRelsPath];

  if (drawingXmlFile && drawingRelsFile) {
    const drawingXml = await drawingXmlFile.async('string');
    const drawingRels = await drawingRelsFile.async('string');

    const zipFiles = {
      [drawingXmlPath]: drawingXml,
      [drawingRelsPath]: drawingRels,
      [mediaPath]: wbStruct._zip.files[mediaPath] ? true : null
    };

    const res = validateAndRemoveReferenceImage(zipFiles);

    wbStruct._zip.file(drawingXmlPath, res.updatedDrawingXml);
    wbStruct._zip.file(drawingRelsPath, res.updatedDrawingRels);

    // Verify image3.png is not referenced anywhere else in package .rels files
    let image3Referenced = false;
    for (const fileName in wbStruct._zip.files) {
      if (fileName.endsWith('.rels') && fileName !== drawingRelsPath) {
        const relsContent = await wbStruct._zip.files[fileName].async('string');
        if (relsContent.includes('image3.png')) {
          image3Referenced = true;
          break;
        }
      }
    }

    if (!image3Referenced && wbStruct._zip.files[res.mediaToRemove]) {
      wbStruct._zip.remove(res.mediaToRemove);
    } else if (image3Referenced) {
      throw new Error('EXPORT_TEMPLATE_PREPARER_UNRESOLVED: image3.png is still referenced elsewhere in package');
    }
  } else {
    throw new Error('EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Part A drawing files missing');
  }

  // Output raw OOXML zip buffer directly from zip to preserve exact OOXML dimension tag
  const finalBytes = await wbStruct._zip.generateAsync({ type: 'uint8array' });
  return finalBytes;
}

export async function preparePartBTemplate(templateBytes, options = {}) {
  const competencyCount = options.competencyCount !== undefined ? options.competencyCount : 6;
  const profile = options.profile || new MboXlsxTemplateProfile();

  // 1. Validate Profile integrity before template-dependent mutation
  validateMappingIntegrity(profile);

  // 2. Validate competency count domain (6, 7, 8)
  if (typeof competencyCount !== 'number' || !Number.isInteger(competencyCount) || ![6, 7, 8].includes(competencyCount)) {
    throw new Error('EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Competency count out of domain');
  }

  if (!templateBytes || (typeof templateBytes !== 'object' && !(templateBytes instanceof ArrayBuffer))) {
    throw new Error('EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Invalid template bytes');
  }

  // 3. Validate Part B template SHA256 before any mutation
  const sha = await computeSha256(templateBytes);
  if (sha !== PART_B_TEMPLATE_SHA256) {
    throw new Error('EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Part B template SHA mismatch');
  }

  // 4. Get Part B layout & sanitization topology from Profile
  const layout = profile.getPartBLayoutTopology(competencyCount);
  const extraBlocks = competencyCount - 6;
  const extraRows = 4 * extraBlocks;

  // 5. Load zip copy without mutating caller bytes
  const copyBytes = new Uint8Array(templateBytes.byteLength || templateBytes.length);
  const srcView = templateBytes instanceof Uint8Array ? templateBytes : new Uint8Array(templateBytes);
  copyBytes.set(srcView);

  const wbStruct = await XlsxPopulate.fromDataAsync(copyBytes);

  // --------------------------------------------------------------------------
  // BLOCKER C: Raw Source Pre-Mutation Guards
  // --------------------------------------------------------------------------
  const sheet1File = wbStruct._zip.files['xl/worksheets/sheet1.xml'];
  const wbFile = wbStruct._zip.files['xl/workbook.xml'];
  if (!sheet1File || !wbFile) {
    throw new Error('EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Required Part B OOXML files missing');
  }

  let sheetXml = await sheet1File.async('string');
  let wbXml = await wbFile.async('string');

  if (!sheetXml.includes('<dimension ref="A1:X35"/>')) {
    throw new Error('EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Base Part B dimension mismatch');
  }

  const srcMergeMatches = [...sheetXml.matchAll(/<mergeCell ref="([A-Z]+)(\d+):([A-Z]+)(\d+)"\/>/g)];
  const srcMergeRefsList = srcMergeMatches.map(m => `${m[1]}${m[2]}:${m[3]}${m[4]}`);
  const declaredCount = sheetXml.match(/<mergeCells count="(\d+)">/)?.[1];
  if (srcMergeMatches.length !== 79 || declaredCount !== '79') {
    throw new Error('EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Base Part B merge count mismatch');
  }

  const srcRowObjectsMap = parseRowObjectsFromSheetXml(sheetXml);

  for (let r = 27; r <= 31; r++) {
    const rCount = [...sheetXml.matchAll(new RegExp(`<row r="${r}"`, 'g'))].length;
    if (rCount !== 1) {
      throw new Error(`EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Base Part B row ${r} count mismatch`);
    }
  }

  // Verify the exact six SOURCE block merges exist in raw sheet1.xml
  const sourceBlockMerges = [
    'B28:J28', 'K28:Q28', 'R28:W28',
    'B29:J29', 'K29:Q29', 'R29:W29'
  ];
  const srcMergeRefsSet = new Set(srcMergeRefsList);
  for (const bRef of sourceBlockMerges) {
    if (!srcMergeRefsSet.has(bRef)) {
      throw new Error(`EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Missing exact SOURCE block merge ${bRef}`);
    }
  }

  // Guard against any SOURCE merge crossing threshold row 31
  for (const m of srcMergeMatches) {
    const r1 = parseInt(m[2], 10);
    const r2 = parseInt(m[4], 10);
    if ((r1 < 31 && r2 >= 31) || (r1 >= 31 && r2 < 31)) {
      throw new Error(`EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Unexpected SOURCE merge crossing threshold row 31: ${m[1]}${r1}:${m[3]}${r2}`);
    }
  }

  const printAreaMatches = [...wbXml.matchAll(/<definedName name="_xlnm\.Print_Area"[^>]*>([\s\S]*?)<\/definedName>/g)];
  if (printAreaMatches.length !== 1 || !printAreaMatches[0][0].includes('localSheetId="0"') || !printAreaMatches[0][1].includes("'(Part B) Competency'!$A$1:$X$35")) {
    throw new Error('EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Base Part B Print_Area mismatch');
  }

  for (const fName in wbStruct._zip.files) {
    if (fName.startsWith('xl/worksheets/') && fName.endsWith('.xml')) {
      const xml = await wbStruct._zip.files[fName].async('string');
      if (/<f[\s>]/.test(xml)) {
        throw new Error('EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Unexpected formula in Part B source package');
      }
    }
  }

  // --------------------------------------------------------------------------
  // PASS 1: Read-Only Sensitive Token Collection & SharedStrings Purge
  // --------------------------------------------------------------------------
  const baseLayout = profile.getPartBLayoutTopology(6);
  const sensitiveTokens = [];
  const sensitiveAddrs = baseLayout.effectiveSanitizationRanges.flatMap(r => expandRangeToAddresses(r));
  const sheetReadOnly = wbStruct.sheet(0);
  for (const addr of sensitiveAddrs) {
    const val = sheetReadOnly.cell(addr).value();
    if (val && typeof val === 'string' && val.trim().length >= 2) {
      sensitiveTokens.push(val.trim());
    }
  }

  const ssFile = wbStruct._zip.files['xl/sharedStrings.xml'];
  if (ssFile && sensitiveTokens.length > 0) {
    let ssXml = await ssFile.async('string');
    let ssModified = false;
    for (const token of sensitiveTokens) {
      if (ssXml.includes(token)) {
        ssXml = ssXml.replaceAll(token, '');
        ssModified = true;
      }
    }
    if (ssModified) {
      wbStruct._zip.file('xl/sharedStrings.xml', ssXml);
    }
  }

  // --------------------------------------------------------------------------
  // PASS 2: Frozen Raw OOXML Structural Transform & Correct Merge Relocation
  // --------------------------------------------------------------------------
  if (extraRows > 0) {
    sheetXml = sheetXml.replace(/<row r="(\d+)"([^>]*)>/g, (m, rStr, rest) => {
      const r = parseInt(rStr, 10);
      if (r >= 31) return `<row r="${r + extraRows}"${rest}>`;
      return m;
    });

    sheetXml = sheetXml.replace(/<c r="([A-Z]+)(\d+)"/g, (m, col, rStr) => {
      const r = parseInt(rStr, 10);
      if (r >= 31) return `<c r="${col}${r + extraRows}"`;
      return m;
    });

    const blockMatch = sheetXml.match(/<row r="27"[^>]*>[\s\S]*?<\/row>\s*<row r="28"[^>]*>[\s\S]*?<\/row>\s*<row r="29"[^>]*>[\s\S]*?<\/row>\s*<row r="30"[^>]*>[\s\S]*?<\/row>/);
    if (!blockMatch) {
      throw new Error('EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Source block rows 27:30 not found');
    }
    const row27_30Xml = blockMatch[0];

    const clonedBlocksXml = [];
    for (let b = 1; b <= extraBlocks; b++) {
      const offset = 4 * b;
      let clonedBlock = row27_30Xml;
      for (let r = 30; r >= 27; r--) {
        const targetR = r + offset;
        clonedBlock = clonedBlock.replace(new RegExp(`<row r="${r}"`, 'g'), `<row r="${targetR}"`);
        clonedBlock = clonedBlock.replace(new RegExp(`<c r="([A-Z]+)${r}"`, 'g'), (m, col) => `<c r="${col}${targetR}"`);
      }
      clonedBlocksXml.push(clonedBlock);
    }
    sheetXml = sheetXml.replace(row27_30Xml, row27_30Xml + '\n' + clonedBlocksXml.join('\n'));
  }

  // Deterministic Merge Relocation & Cloning
  const relocatedMergesXml = [];
  for (const m of srcMergeMatches) {
    const c1 = m[1];
    const r1 = parseInt(m[2], 10);
    const c2 = m[3];
    const r2 = parseInt(m[4], 10);

    if (r1 < 31 && r2 < 31) {
      relocatedMergesXml.push(`<mergeCell ref="${c1}${r1}:${c2}${r2}"/>`);
    } else if (r1 >= 31 && r2 >= 31) {
      relocatedMergesXml.push(`<mergeCell ref="${c1}${r1 + extraRows}:${c2}${r2 + extraRows}"/>`);
    } else {
      throw new Error(`EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Unexpected SOURCE merge crossing threshold row 31: ${c1}${r1}:${c2}${r2}`);
    }
  }

  for (let b = 1; b <= extraBlocks; b++) {
    const offset = 4 * b;
    for (const mRef of sourceBlockMerges) {
      const [start, end] = mRef.split(':');
      const col1 = start.match(/^[A-Z]+/)[0];
      const r1 = parseInt(start.match(/\d+/)[0], 10) + offset;
      const col2 = end.match(/^[A-Z]+/)[0];
      const r2 = parseInt(end.match(/\d+/)[0], 10) + offset;
      relocatedMergesXml.push(`<mergeCell ref="${col1}${r1}:${col2}${r2}"/>`);
    }
  }

  const newIntermediateMergeBlockXml = `<mergeCells count="${relocatedMergesXml.length}">\n` + relocatedMergesXml.join('\n') + '\n</mergeCells>';
  sheetXml = sheetXml.replace(/<mergeCells count="\d+">[\s\S]*?<\/mergeCells>/, newIntermediateMergeBlockXml);

  // --------------------------------------------------------------------------
  // BLOCKER A: Production Verification of Intermediate Merge Inventory
  // --------------------------------------------------------------------------
  const actualIntermediateMerges = [...sheetXml.matchAll(/<mergeCell ref="([A-Z0-9:]+)"\/>/g)].map(m => m[1]);
  actualIntermediateMerges.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const expectedIntermediateMerges = deriveExpectedPartBMergeInventory(srcMergeRefsList, competencyCount, false);
  if (actualIntermediateMerges.length !== layout.intermediateMergeCount || actualIntermediateMerges.length !== expectedIntermediateMerges.length) {
    throw new Error(`EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Intermediate merge count mismatch: expected ${layout.intermediateMergeCount}, got ${actualIntermediateMerges.length}`);
  }
  for (let i = 0; i < expectedIntermediateMerges.length; i++) {
    if (actualIntermediateMerges[i] !== expectedIntermediateMerges[i]) {
      throw new Error(`EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Intermediate merge ref mismatch at index ${i}: expected ${expectedIntermediateMerges[i]}, got ${actualIntermediateMerges[i]}`);
    }
  }

  // --------------------------------------------------------------------------
  // BLOCKER B: Production SOURCE-Backed Row / Style / Static Guard
  // --------------------------------------------------------------------------
  const outRowObjectsMap = parseRowObjectsFromSheetXml(sheetXml);
  const expectedLastRow = 35 + extraRows;
  if (outRowObjectsMap.size !== expectedLastRow) {
    throw new Error(`EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Row count mismatch: expected ${expectedLastRow}, got ${outRowObjectsMap.size}`);
  }

  // Rows 1:30 structural & style identity against SOURCE
  for (let r = 1; r <= 30; r++) {
    const srcObj = srcRowObjectsMap.get(r);
    const outObj = outRowObjectsMap.get(r);
    if (!outObj || !srcObj) throw new Error(`EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Missing row object for row ${r}`);

    for (const k in srcObj.rowAttrs) {
      if (outObj.rowAttrs[k] !== srcObj.rowAttrs[k]) {
        throw new Error(`EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Row ${r} attribute ${k} mismatch`);
      }
    }
    if (outObj.cells.length !== srcObj.cells.length) {
      throw new Error(`EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Row ${r} cell count mismatch`);
    }
    for (let c = 0; c < srcObj.cells.length; c++) {
      const sc = srcObj.cells[c];
      const oc = outObj.cells[c];
      if (oc.col !== sc.col || oc.s !== sc.s || oc.t !== sc.t) {
        throw new Error(`EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Row ${r} cell ${sc.col} structural attribute mismatch`);
      }
    }
  }

  // Inserted rows derive from SOURCE 27:30
  for (let b = 1; b <= extraBlocks; b++) {
    const offset = 4 * b;
    for (let srcR = 27; srcR <= 30; srcR++) {
      const targetR = srcR + offset;
      const srcObj = srcRowObjectsMap.get(srcR);
      const outObj = outRowObjectsMap.get(targetR);
      if (!outObj || !srcObj) throw new Error(`EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Missing cloned row object for row ${targetR}`);
      for (const k in srcObj.rowAttrs) {
        if (outObj.rowAttrs[k] !== srcObj.rowAttrs[k]) {
          throw new Error(`EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Cloned row ${targetR} attribute ${k} mismatch`);
        }
      }
      if (outObj.cells.length !== srcObj.cells.length) {
        throw new Error(`EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Cloned row ${targetR} cell count mismatch`);
      }
      for (let c = 0; c < srcObj.cells.length; c++) {
        const sc = srcObj.cells[c];
        const oc = outObj.cells[c];
        if (oc.col !== sc.col || oc.s !== sc.s || oc.t !== sc.t) {
          throw new Error(`EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Cloned row ${targetR} cell ${sc.col} structural attribute mismatch`);
        }
      }
    }
  }

  // Relocated downstream rows 31:35
  for (let r = 31; r <= 35; r++) {
    const targetR = r + extraRows;
    const srcObj = srcRowObjectsMap.get(r);
    const outObj = outRowObjectsMap.get(targetR);
    if (!outObj || !srcObj) throw new Error(`EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Missing relocated downstream row object for row ${targetR}`);
    for (const k in srcObj.rowAttrs) {
      if (outObj.rowAttrs[k] !== srcObj.rowAttrs[k]) {
        throw new Error(`EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Relocated row ${targetR} attribute ${k} mismatch`);
      }
    }
    if (outObj.cells.length !== srcObj.cells.length) {
      throw new Error(`EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Relocated row ${targetR} cell count mismatch`);
    }
    for (let c = 0; c < srcObj.cells.length; c++) {
      const sc = srcObj.cells[c];
      const oc = outObj.cells[c];
      if (oc.col !== sc.col || oc.s !== sc.s || oc.t !== sc.t) {
        throw new Error(`EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Relocated row ${targetR} cell ${sc.col} structural attribute mismatch`);
      }
    }
  }

  const interMergeSet = new Set(actualIntermediateMerges);
  for (const rangeStr of layout.ratingScaleStaticRanges) {
    if (!interMergeSet.has(rangeStr)) {
      throw new Error(`EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Missing Rating Scale static merge ${rangeStr}`);
    }
  }

  for (const rowNum of layout.protectedPaddingRows) {
    if (!sheetXml.includes(`<row r="${rowNum}"`)) {
      throw new Error(`EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Missing protected padding row ${rowNum}`);
    }
  }

  const sanAddressSet = new Set(layout.effectiveSanitizationRanges.flatMap(r => expandRangeToAddresses(r)));
  if (sanAddressSet.size !== layout.effectiveDynamicCount) {
    throw new Error(`EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Effective sanitization address count mismatch: expected ${layout.effectiveDynamicCount}, got ${sanAddressSet.size}`);
  }

  const protectedStaticAddrs = new Set();
  for (const rangeStr of layout.ratingScaleStaticRanges) {
    expandRangeToAddresses(rangeStr).forEach(a => protectedStaticAddrs.add(a));
  }
  for (const rowNum of layout.protectedPaddingRows) {
    for (let c = 1; c <= 24; c++) {
      const colStr = String.fromCharCode(64 + c);
      protectedStaticAddrs.add(`${colStr}${rowNum}`);
    }
  }

  for (const addr of sanAddressSet) {
    if (protectedStaticAddrs.has(addr)) {
      throw new Error(`EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Sanitization address ${addr} overlaps with protected static topology`);
    }
  }

  // --------------------------------------------------------------------------
  // PASS 3: Presentation Title-Merge Overlay
  // --------------------------------------------------------------------------
  const finalMergesXml = [...relocatedMergesXml];
  if (competencyCount >= 7) {
    finalMergesXml.push('<mergeCell ref="B31:J31"/>');
  }
  if (competencyCount === 8) {
    finalMergesXml.push('<mergeCell ref="B35:J35"/>');
  }

  if (finalMergesXml.length !== layout.finalOverlayMergeCount) {
    throw new Error(`EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Final merge count mismatch: expected ${layout.finalOverlayMergeCount}, got ${finalMergesXml.length}`);
  }

  const finalMergeBlockXml = `<mergeCells count="${finalMergesXml.length}">\n` + finalMergesXml.join('\n') + '\n</mergeCells>';
  sheetXml = sheetXml.replace(/<mergeCells count="\d+">[\s\S]*?<\/mergeCells>/, finalMergeBlockXml);

  // --------------------------------------------------------------------------
  // PASS 4: Raw OOXML Cell Value Sanitization
  // --------------------------------------------------------------------------
  sheetXml = sanitizeRawSheetXml(sheetXml, sanAddressSet);

  // --------------------------------------------------------------------------
  // PASS 5: Dimension Tag Ref & Print_Area Update
  // --------------------------------------------------------------------------
  const dimensionTag = `<dimension ref="${layout.dimension}"/>`;
  sheetXml = sheetXml.replace(/<dimension [^>]*\/>/, dimensionTag);
  wbStruct._zip.file('xl/worksheets/sheet1.xml', sheetXml);

  const printAreaStr = `'${layout.mainSheetName}'!$A$1:$X$${35 + extraRows}`;
  wbXml = wbXml.replace(
    /<definedName name="_xlnm\.Print_Area"[^>]*>[^<]+<\/definedName>/,
    `<definedName name="_xlnm.Print_Area" localSheetId="0">${printAreaStr}</definedName>`
  );
  wbStruct._zip.file('xl/workbook.xml', wbXml);

  const finalBytes = await wbStruct._zip.generateAsync({ type: 'uint8array' });
  return finalBytes;
}
