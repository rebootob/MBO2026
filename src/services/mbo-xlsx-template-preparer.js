/**
 * Production Part A XLSX Template Preparer & Sanitizer Foundation
 * 
 * Browser-safe asynchronous preparer:
 *   owner Part A template bytes + objectiveCount N (4..10)
 *   -> prepare structural row expansion, merge cloning, print area & dimensions
 *   -> sanitize effective sensitive ranges from MboXlsxTemplateProfile via RAW OOXML
 *   -> remove reference image rId3 / image3.png safely with deterministic pre-removal proof
 *   -> output NEW browser-usable Uint8Array bytes
 * 
 * Rules:
 * 1. Pure browser-safe production module (no node:fs, node:path, node:crypto, Kintone API).
 * 2. Zero mutation of caller / source bytes.
 * 3. Validate MboXlsxTemplateProfile integrity & Part A owner SHA-256 (03d1e8c3...).
 * 4. Zero proof sentinels (NO proof-only markers).
 * 5. Zero semantic value writes (no employee data, no App794 records, no scores, no formulas).
 * 6. Raw OOXML value-payload sanitization (preserves exact <c> structural attributes & t="s").
 */
import XlsxPopulate from 'xlsx-populate';
import {
  PART_A_TEMPLATE_SHA256,
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
