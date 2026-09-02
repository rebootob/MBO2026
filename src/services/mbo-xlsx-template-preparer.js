/**
 * Production Part A XLSX Template Preparer & Sanitizer Foundation
 * 
 * Browser-safe asynchronous preparer:
 *   owner Part A template bytes + objectiveCount N (4..10)
 *   -> prepare structural row expansion, merge cloning, print area & dimensions
 *   -> sanitize effective sensitive ranges from MboXlsxTemplateProfile
 *   -> remove reference image rId3 / image3.png safely
 *   -> output NEW browser-usable Uint8Array bytes
 * 
 * Rules:
 * 1. Pure browser-safe production module (no node:fs, node:path, node:crypto, Kintone API).
 * 2. Zero mutation of caller / source bytes.
 * 3. Validate MboXlsxTemplateProfile integrity & Part A owner SHA-256 (03d1e8c3...).
 * 4. Zero proof sentinels (NO proof-only markers).
 * 5. Zero semantic value writes (no employee data, no App794 records, no scores, no formulas).
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

  // --------------------------------------------------------------------------
  // PASS 1: Cell & Shared-String Sanitization via XlsxPopulate
  // --------------------------------------------------------------------------
  const wbSanitize = await XlsxPopulate.fromDataAsync(copyBytes);
  const sheetSanitize = wbSanitize.sheet(0);

  // Base sensitive range clearing on base template
  const baseLayout = profile.getPartALayoutTopology(4);
  const sensitiveTokens = [];
  const sensitiveAddrs = baseLayout.effectiveSanitizationRanges.flatMap(r => expandRangeToAddresses(r));
  for (const addr of sensitiveAddrs) {
    const val = sheetSanitize.cell(addr).value();
    if (val && typeof val === 'string' && val.trim().length >= 2) {
      sensitiveTokens.push(val.trim());
    }
  }

  for (const rangeStr of baseLayout.effectiveSanitizationRanges) {
    if (rangeStr.includes(':')) {
      sheetSanitize.range(rangeStr).value(null);
    } else {
      sheetSanitize.cell(rangeStr).value(null);
    }
  }

  // Purge sensitive string tokens from xl/sharedStrings.xml if present
  const ssFile = wbSanitize._zip.files['xl/sharedStrings.xml'];
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
      wbSanitize._zip.file('xl/sharedStrings.xml', ssXml);
    }
  }

  const sanitizedBytes = await wbSanitize.outputAsync();

  // --------------------------------------------------------------------------
  // PASS 2: Raw OOXML Structural Row/Merge Shift, Dimension Tag & Reference Image Removal
  // --------------------------------------------------------------------------
  const wbStruct = await XlsxPopulate.fromDataAsync(sanitizedBytes);

  const sheetFile = wbStruct._zip.files['xl/worksheets/sheet1.xml'];
  if (!sheetFile) {
    throw new Error('EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Sheet1 XML missing');
  }
  let sheetXml = await sheetFile.async('string');

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

  // G. Reference Image Removal (rId3 / image3.png)
  const drawingXmlPath = 'xl/drawings/drawing1.xml';
  const drawingRelsPath = 'xl/drawings/_rels/drawing1.xml.rels';
  if (wbStruct._zip.files[drawingXmlPath] && wbStruct._zip.files[drawingRelsPath]) {
    let drawingXml = await wbStruct._zip.files[drawingXmlPath].async('string');
    let drawingRels = await wbStruct._zip.files[drawingRelsPath].async('string');

    // Prove exact target identity: drawingRels must contain rId3 pointing to image3.png
    if (!drawingRels.includes('rId3') || !drawingRels.includes('image3.png')) {
      throw new Error('EXPORT_TEMPLATE_PREPARER_UNRESOLVED: rId3 reference image target missing in rels');
    }

    // Remove anchor containing rId3
    const anchorRegex = /<xdr:twoCellAnchor[^>]*>(?:(?!<\/xdr:twoCellAnchor>)[\s\S])*rId3[\s\S]*?<\/xdr:twoCellAnchor>/g;
    drawingXml = drawingXml.replace(anchorRegex, '');

    // Remove rId3 from drawing rels
    const relsRegex = /<Relationship[^>]*Id="rId3"[^>]*\/>/g;
    drawingRels = drawingRels.replace(relsRegex, '');

    wbStruct._zip.file(drawingXmlPath, drawingXml);
    wbStruct._zip.file(drawingRelsPath, drawingRels);

    // Verify image3.png is not referenced anywhere else in remaining package .rels files
    let image3Referenced = false;
    for (const fileName in wbStruct._zip.files) {
      if (fileName.endsWith('.rels')) {
        const relsContent = await wbStruct._zip.files[fileName].async('string');
        if (relsContent.includes('image3.png')) {
          image3Referenced = true;
          break;
        }
      }
    }

    if (!image3Referenced && wbStruct._zip.files['xl/media/image3.png']) {
      wbStruct._zip.remove('xl/media/image3.png');
    } else if (image3Referenced) {
      throw new Error('EXPORT_TEMPLATE_PREPARER_UNRESOLVED: image3.png is still referenced elsewhere in package');
    }
  } else {
    throw new Error('EXPORT_TEMPLATE_PREPARER_UNRESOLVED: Part A drawing files missing');
  }

  // Output raw OOXML zip buffer without re-serializing via XlsxPopulate (preserving exact OOXML dimension tag)
  const finalBytes = await wbStruct._zip.generateAsync({ type: 'uint8array' });
  return finalBytes;
}
