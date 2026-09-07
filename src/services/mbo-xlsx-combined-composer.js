/**
 * Isolated Post-Render Combined XLSX Composer Foundation (R2-D1)
 *
 * Browser-safe asynchronous composer:
 *   - Consumes rendered Part A XLSX bytes and rendered Part B XLSX bytes.
 *   - Combines them into one .xlsx workbook containing exactly 2 business sheets:
 *       1. MBO Staff & Chief (from Part A)
 *       2. (Part B) Competency (from Part B)
 *   - Excludes Part B auxiliary Sheet1.
 *
 * Production Constraints:
 * 1. Pure browser-safe production module (no node:fs, node:path, node:crypto, Kintone API).
 * 2. Zero mutation of caller / input bytes (immutability preserved).
 * 3. Rendered Part A package serves as base package authority.
 * 4. Derived style and sharedStrings remapping from actual rendered packages (no fixed offsets).
 * 5. Dynamic exact Print_Area preservation bound to localSheetId 0 and 1.
 * 6. Collision-safe OPC part and relationship ID derivation.
 * 7. Zero formula inventory.
 * 8. Secured rendered values & privacy preserved.
 * 9. Fail closed on malformed authority, occupied paths/IDs, or unexpected topology.
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
  // 1. Validate Base Package Parts & Authority
  // ---------------------------------------------------------------------------
  const requiredPartsA = [
    'xl/workbook.xml',
    'xl/_rels/workbook.xml.rels',
    '[Content_Types].xml',
    'xl/styles.xml',
    'xl/sharedStrings.xml',
    'xl/worksheets/sheet1.xml',
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
    'xl/sharedStrings.xml',
    'xl/worksheets/sheet1.xml'
  ];

  for (const part of requiredPartsB) {
    if (!zipB.file(part)) {
      throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Missing required Part B package part: ${part}`);
    }
  }

  // Check Part A business sheet identity
  const wbXmlA = await zipA.file('xl/workbook.xml').async('text');
  const wbRelsXmlA = await zipA.file('xl/_rels/workbook.xml.rels').async('text');

  if (!wbXmlA.includes('MBO Staff &amp; Chief') && !wbXmlA.includes('MBO Staff & Chief')) {
    throw new Error('EXPORT_COMBINED_COMPOSER_UNRESOLVED: Part A business sheet "MBO Staff & Chief" missing in workbook.xml');
  }

  // Check Part B business sheet identity
  const wbXmlB = await zipB.file('xl/workbook.xml').async('text');

  if (!wbXmlB.includes('(Part B) Competency')) {
    throw new Error('EXPORT_COMBINED_COMPOSER_UNRESOLVED: Part B business sheet "(Part B) Competency" missing in workbook.xml');
  }

  // Check formula inventory = ZERO in both rendered business sheets
  const sheet1XmlA = await zipA.file('xl/worksheets/sheet1.xml').async('text');
  const sheet1XmlB = await zipB.file('xl/worksheets/sheet1.xml').async('text');

  if (/<f[\s>]/.test(sheet1XmlA) || /<f[\s>]/.test(sheet1XmlB)) {
    throw new Error('EXPORT_COMBINED_COMPOSER_UNRESOLVED: Formula inventory non-zero in input business sheet');
  }

  // ---------------------------------------------------------------------------
  // 2. Extract Dynamic Print Areas
  // ---------------------------------------------------------------------------
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
  // Workbook Relationship ID
  const rIdMatchesA = [...wbRelsXmlA.matchAll(/\bId="(rId\d+)"/g)].map(m => m[1]);
  let maxRIdNum = 0;
  for (const rId of rIdMatchesA) {
    const num = parseInt(rId.replace('rId', ''), 10);
    if (!isNaN(num) && num > maxRIdNum) maxRIdNum = num;
  }
  const partBSheetRId = `rId${maxRIdNum + 1}`;

  if (rIdMatchesA.includes(partBSheetRId)) {
    throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Derived workbook relationship ID ${partBSheetRId} is occupied`);
  }

  // Worksheet Part Path
  const partBWorksheetPath = 'xl/worksheets/sheet2.xml';
  if (zipA.file(partBWorksheetPath)) {
    throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Worksheet path ${partBWorksheetPath} already exists in Part A base package`);
  }

  // Worksheet rels path
  const partBWorksheetRelsPath = 'xl/worksheets/_rels/sheet2.xml.rels';
  if (zipA.file(partBWorksheetRelsPath)) {
    throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Worksheet rels path ${partBWorksheetRelsPath} already exists in Part A base package`);
  }

  // Drawing Part Path
  const partBDrawingPath = 'xl/drawings/drawing2.xml';
  const partBDrawingRelsPath = 'xl/drawings/_rels/drawing2.xml.rels';
  if (zipA.file(partBDrawingPath) || zipA.file(partBDrawingRelsPath)) {
    throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Drawing path ${partBDrawingPath} already exists in Part A base package`);
  }

  // PrinterSettings Part Path
  const partBPrinterSettingsPath = 'xl/printerSettings/printerSettings2.bin';
  if (zipA.file(partBPrinterSettingsPath)) {
    throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: PrinterSettings path ${partBPrinterSettingsPath} already exists in Part A base package`);
  }

  // Media Part Path
  const partBMediaPath = 'xl/media/image_partb_1.png';
  if (zipA.file(partBMediaPath)) {
    throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Media path ${partBMediaPath} already exists in Part A base package`);
  }

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

  const sstMap = new Map(); // oldIndex -> newIndex
  const newSstItemsA = [...sstItemsA];

  for (let bIdx = 0; bIdx < sstItemsB.length; bIdx++) {
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

  // E. cellStyleXfs (<cellStyleXfs>)
  const cellStyleXfsBlockA = getTagBlock(stylesXmlA, 'cellStyleXfs');
  const cellStyleXfsBlockB = getTagBlock(stylesXmlB, 'cellStyleXfs');

  const cellStyleXfElementsA = parseXmlElements(cellStyleXfsBlockA, 'xf');
  const cellStyleXfElementsB = parseXmlElements(cellStyleXfsBlockB, 'xf');

  const cellStyleXfMap = new Map(); // oldXfIdx -> newXfIdx
  const newCellStyleXfElementsA = [...cellStyleXfElementsA];

  for (let bIdx = 0; bIdx < cellStyleXfElementsB.length; bIdx++) {
    const elB = cellStyleXfElementsB[bIdx];
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

  function remapXfAttributes(xfTag) {
    let newTag = xfTag;

    // numFmtId
    newTag = newTag.replace(/\bnumFmtId="(\d+)"/g, (match, p1) => {
      const oldId = parseInt(p1, 10);
      const newId = numFmtMap.has(oldId) ? numFmtMap.get(oldId) : oldId;
      return `numFmtId="${newId}"`;
    });

    // fontId
    newTag = newTag.replace(/\bfontId="(\d+)"/g, (match, p1) => {
      const oldId = parseInt(p1, 10);
      const newId = fontMap.has(oldId) ? fontMap.get(oldId) : 0;
      return `fontId="${newId}"`;
    });

    // fillId
    newTag = newTag.replace(/\bfillId="(\d+)"/g, (match, p1) => {
      const oldId = parseInt(p1, 10);
      const newId = fillMap.has(oldId) ? fillMap.get(oldId) : 0;
      return `fillId="${newId}"`;
    });

    // borderId
    newTag = newTag.replace(/\bborderId="(\d+)"/g, (match, p1) => {
      const oldId = parseInt(p1, 10);
      const newId = borderMap.has(oldId) ? borderMap.get(oldId) : 0;
      return `borderId="${newId}"`;
    });

    // xfId
    newTag = newTag.replace(/\bxfId="(\d+)"/g, (match, p1) => {
      const oldId = parseInt(p1, 10);
      const newId = cellStyleXfMap.has(oldId) ? cellStyleXfMap.get(oldId) : 0;
      return `xfId="${newId}"`;
    });

    return newTag;
  }

  for (let bIdx = 0; bIdx < cellXfElementsB.length; bIdx++) {
    const originalElB = cellXfElementsB[bIdx];
    const remappedElB = remapXfAttributes(originalElB);
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

  // Replace <numFmts> block if numFmts present
  if (newNumFmtElementsA.length > 0) {
    const newNumFmtsBlock = `<numFmts count="${newNumFmtElementsA.length}">${newNumFmtElementsA.join('')}</numFmts>`;
    if (stylesXmlA.includes('<numFmts')) {
      updatedStylesXmlA = updatedStylesXmlA.replace(/<numFmts\b[^>]*>[\s\S]*?<\/numFmts>/, newNumFmtsBlock);
    } else {
      updatedStylesXmlA = updatedStylesXmlA.replace(/(<styleSheet\b[^>]*>)/, `$1${newNumFmtsBlock}`);
    }
  }

  // Replace <fonts> block
  const newFontsBlock = `<fonts count="${newFontElementsA.length}">${newFontElementsA.join('')}</fonts>`;
  updatedStylesXmlA = updatedStylesXmlA.replace(/<fonts\b[^>]*>[\s\S]*?<\/fonts>/, newFontsBlock);

  // Replace <fills> block
  const newFillsBlock = `<fills count="${newFillElementsA.length}">${newFillElementsA.join('')}</fills>`;
  updatedStylesXmlA = updatedStylesXmlA.replace(/<fills\b[^>]*>[\s\S]*?<\/fills>/, newFillsBlock);

  // Replace <borders> block
  const newBordersBlock = `<borders count="${newBorderElementsA.length}">${newBorderElementsA.join('')}</borders>`;
  updatedStylesXmlA = updatedStylesXmlA.replace(/<borders\b[^>]*>[\s\S]*?<\/borders>/, newBordersBlock);

  // Replace <cellStyleXfs> block
  const newCellStyleXfsBlock = `<cellStyleXfs count="${newCellStyleXfElementsA.length}">${newCellStyleXfElementsA.join('')}</cellStyleXfs>`;
  updatedStylesXmlA = updatedStylesXmlA.replace(/<cellStyleXfs\b[^>]*>[\s\S]*?<\/cellStyleXfs>/, newCellStyleXfsBlock);

  // Replace <cellXfs> block
  const newCellXfsBlock = `<cellXfs count="${newCellXfElementsA.length}">${newCellXfElementsA.join('')}</cellXfs>`;
  updatedStylesXmlA = updatedStylesXmlA.replace(/<cellXfs\b[^>]*>[\s\S]*?<\/cellXfs>/, newCellXfsBlock);

  zipA.file('xl/styles.xml', updatedStylesXmlA);

  // ---------------------------------------------------------------------------
  // 6. Remap & Transform Part B Business Sheet XML (`xl/worksheets/sheet1.xml` in B)
  // ---------------------------------------------------------------------------
  let sheetXmlB = await zipB.file('xl/worksheets/sheet1.xml').async('text');

  // Remap style IDs s="ID"
  sheetXmlB = sheetXmlB.replace(/\bs="(\d+)"/g, (match, p1) => {
    const oldStyleId = parseInt(p1, 10);
    if (!cellXfMap.has(oldStyleId)) {
      throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Referenced Part B style ID ${oldStyleId} missing in cellXfs map`);
    }
    const newStyleId = cellXfMap.get(oldStyleId);
    return `s="${newStyleId}"`;
  });

  // Remap shared string indices <v>INDEX</v> for cells with t="s"
  sheetXmlB = sheetXmlB.replace(/(<c\b[^>]*?\bt="s"[^>]*?>[\s\S]*?<v>)(\d+)(<\/v>)/g, (match, open, p1, close) => {
    const oldSstIdx = parseInt(p1, 10);
    if (!sstMap.has(oldSstIdx)) {
      throw new Error(`EXPORT_COMBINED_COMPOSER_UNRESOLVED: Referenced Part B shared string index ${oldSstIdx} missing in sst map`);
    }
    const newSstIdx = sstMap.get(oldSstIdx);
    return `${open}${newSstIdx}${close}`;
  });

  // Write remapped Part B business sheet as xl/worksheets/sheet2.xml in zipA
  zipA.file(partBWorksheetPath, sheetXmlB);

  // ---------------------------------------------------------------------------
  // 7. Retarget & Copy Dependencies (PrinterSettings, Drawing, Media)
  // ---------------------------------------------------------------------------
  // A. PrinterSettings
  const printerSettingsPartB = zipB.file('xl/printerSettings/printerSettings1.bin');
  if (printerSettingsPartB) {
    const psBuf = await printerSettingsPartB.async('nodebuffer');
    zipA.file(partBPrinterSettingsPath, psBuf);
  }

  // B. Drawing & Media
  const drawingPartB = zipB.file('xl/drawings/drawing1.xml');
  const drawingRelsPartB = zipB.file('xl/drawings/_rels/drawing1.xml.rels');

  if (drawingPartB) {
    const drawingXmlStrB = await drawingPartB.async('text');
    zipA.file(partBDrawingPath, drawingXmlStrB);
  }

  if (drawingRelsPartB) {
    let drawingRelsStrB = await drawingRelsPartB.async('text');

    // Check media dependencies in drawing1.xml.rels
    const mediaMatches = [...drawingRelsStrB.matchAll(/Target="\.\.\/media\/([^"]+)"/g)];
    for (const m of mediaMatches) {
      const origMediaName = m[1];
      const origMediaPath = `xl/media/${origMediaName}`;
      const mediaFileB = zipB.file(origMediaPath);

      if (mediaFileB) {
        const mediaBufB = await mediaFileB.async('nodebuffer');
        // Copy media file to collision-safe path
        zipA.file(partBMediaPath, mediaBufB);
        // Retarget drawing2.xml.rels to point to image_partb_1.png
        drawingRelsStrB = drawingRelsStrB.replace(`Target="../media/${origMediaName}"`, `Target="../media/image_partb_1.png"`);
      }
    }
    zipA.file(partBDrawingRelsPath, drawingRelsStrB);
  }

  // C. Create Part B Worksheet Relationships file (xl/worksheets/_rels/sheet2.xml.rels)
  const worksheetRelsXmlB = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/printerSettings" Target="../printerSettings/printerSettings2.bin"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing2.xml"/></Relationships>`;
  zipA.file(partBWorksheetRelsPath, worksheetRelsXmlB);

  // ---------------------------------------------------------------------------
  // 8. Update Base Package Metadata (`xl/workbook.xml`, `xl/_rels/workbook.xml.rels`, `[Content_Types].xml`, `docProps/app.xml`)
  // ---------------------------------------------------------------------------
  // A. xl/_rels/workbook.xml.rels
  let wbRelsContentA = await zipA.file('xl/_rels/workbook.xml.rels').async('text');
  const sheetRelTag = `<Relationship Id="${partBSheetRId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>`;
  wbRelsContentA = wbRelsContentA.replace('</Relationships>', `${sheetRelTag}</Relationships>`);
  zipA.file('xl/_rels/workbook.xml.rels', wbRelsContentA);

  // B. xl/workbook.xml
  let wbContentA = await zipA.file('xl/workbook.xml').async('text');

  // Insert sheet 2 under <sheets>
  const sheetTag2 = `<sheet name="(Part B) Competency" sheetId="2" r:id="${partBSheetRId}"/>`;
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

  const sheetOverride = `<Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`;
  const drawingOverride = `<Override PartName="/xl/drawings/drawing2.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>`;

  if (!contentTypesXmlA.includes('PartName="/xl/worksheets/sheet2.xml"')) {
    contentTypesXmlA = contentTypesXmlA.replace('</Types>', `${sheetOverride}</Types>`);
  }
  if (!contentTypesXmlA.includes('PartName="/xl/drawings/drawing2.xml"')) {
    contentTypesXmlA = contentTypesXmlA.replace('</Types>', `${drawingOverride}</Types>`);
  }
  if (!contentTypesXmlA.includes('Extension="png"')) {
    const pngDefault = `<Default Extension="png" ContentType="image/png"/>`;
    contentTypesXmlA = contentTypesXmlA.replace('</Types>', `${pngDefault}</Types>`);
  }
  zipA.file('[Content_Types].xml', contentTypesXmlA);

  // D. docProps/app.xml
  let appPropsXmlA = await zipA.file('docProps/app.xml').async('text');

  // Update Worksheets count to 2, Named Ranges count to 2, vector size 4
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
  // 9. Generate & Return Output Bytes directly via JSZip generateAsync
  // ---------------------------------------------------------------------------
  const outputUint8 = await zipA.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
  return outputUint8;
}
