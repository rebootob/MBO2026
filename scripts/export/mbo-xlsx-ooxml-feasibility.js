import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import XlsxPopulate from 'xlsx-populate';

export const EXPECTED_PART_A_SHA = '03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3';
export const EXPECTED_PART_B_SHA = 'c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3';

export function findLocalSourceTemplates() {
  const root = process.cwd();
  const candidatePaths = [
    {
      partA: path.join(root, 'app info', 'data', 'PMS_Staff & Chief_PART_A.xlsx'),
      partB: path.join(root, 'app info', 'data', 'PMS_Staff & Chief_PART_B.xlsx')
    },
    {
      partA: path.join(root, 'exp', 'PMS_Staff & Chief_PART_A.xlsx'),
      partB: path.join(root, 'exp', 'PMS_Staff & Chief_PART_B.xlsx')
    },
    {
      partA: path.join(root, 'PMS_Staff & Chief_PART_A.xlsx'),
      partB: path.join(root, 'PMS_Staff & Chief_PART_B.xlsx')
    }
  ];

  for (const pair of candidatePaths) {
    if (fs.existsSync(pair.partA) && fs.existsSync(pair.partB)) {
      const shaA = crypto.createHash('sha256').update(fs.readFileSync(pair.partA)).digest('hex');
      const shaB = crypto.createHash('sha256').update(fs.readFileSync(pair.partB)).digest('hex');
      if (shaA === EXPECTED_PART_A_SHA && shaB === EXPECTED_PART_B_SHA) {
        return { partA: pair.partA, partB: pair.partB, shaA, shaB };
      }
    }
  }
  return null;
}

export function colToIdx(colStr) {
  let idx = 0;
  for (let i = 0; i < colStr.length; i++) {
    idx = idx * 26 + (colStr.charCodeAt(i) - 64);
  }
  return idx;
}

export function idxToCol(idx) {
  let str = '';
  while (idx > 0) {
    const rem = (idx - 1) % 26;
    str = String.fromCharCode(65 + rem) + str;
    idx = Math.floor((idx - 1) / 26);
  }
  return str;
}

export function expandRangeToAddresses(rangeStr) {
  if (!rangeStr.includes(':')) return [rangeStr];
  const [start, end] = rangeStr.split(':');
  const mStart = start.match(/^([A-Z]+)(\d+)$/);
  const mEnd = end.match(/^([A-Z]+)(\d+)$/);
  if (!mStart || !mEnd) return [rangeStr];

  const col1 = colToIdx(mStart[1]);
  const row1 = parseInt(mStart[2], 10);
  const col2 = colToIdx(mEnd[1]);
  const row2 = parseInt(mEnd[2], 10);

  const addrs = [];
  for (let r = Math.min(row1, row2); r <= Math.max(row1, row2); r++) {
    for (let c = Math.min(col1, col2); c <= Math.max(col1, col2); c++) {
      addrs.push(`${idxToCol(c)}${r}`);
    }
  }
  return addrs;
}

export const PART_A_SENSITIVE_RANGES = [
  'N6:Q7', 'Z7:AF7', 'AG7:AL7', 'AM7:AP7', 'AQ7:AS7', 'AT7:BC7', 'BD7:BI7',
  'G8:S8', 'G16:AF19', 'AM16:BI19',
  'B25:BI28',
  'BC29:BI35',
  'B37:S42', 'AI37:AY42',
  'B47:N50'
];

export const PART_B_SENSITIVE_RANGES = [
  'G2:H3', 'J3:L3', 'M3:O3', 'P3:Q3', 'R3', 'S3:W3',
  'K7:Q29', 'R7:X29',
  'B31:D34', 'E31:H34', 'I31:P34', 'Q31:S34', 'T31:X34'
];

export const SENSITIVE_RANGES_A = PART_A_SENSITIVE_RANGES.flatMap(expandRangeToAddresses);
export const SENSITIVE_RANGES_B = PART_B_SENSITIVE_RANGES.flatMap(expandRangeToAddresses);

export async function getNoOpParityBuffers() {
  const found = findLocalSourceTemplates();
  if (!found) throw new Error('BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE');

  const origBufA = fs.readFileSync(found.partA);
  const wbA = await XlsxPopulate.fromDataAsync(origBufA);
  const outBufA = await wbA.outputAsync();

  const origBufB = fs.readFileSync(found.partB);
  const wbB = await XlsxPopulate.fromDataAsync(origBufB);
  const outBufB = await wbB.outputAsync();

  return { origBufA, outBufA, origBufB, outBufB };
}

export async function getMutatedHeaderValueBuffers() {
  const found = findLocalSourceTemplates();
  if (!found) throw new Error('BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE');

  const wbA = await XlsxPopulate.fromDataAsync(fs.readFileSync(found.partA));
  const sheetA = wbA.sheet(0);

  // Snapshot Part A static header labels using safe hashes
  const labelSnapshotA = {
    B6: crypto.createHash('sha256').update(String(sheetA.cell('B6').value() || '')).digest('hex'),
    AM6: crypto.createHash('sha256').update(String(sheetA.cell('AM6').value() || '')).digest('hex'),
    AQ6: crypto.createHash('sha256').update(String(sheetA.cell('AQ6').value() || '')).digest('hex'),
    AT6: crypto.createHash('sha256').update(String(sheetA.cell('AT6').value() || '')).digest('hex'),
    BD6: crypto.createHash('sha256').update(String(sheetA.cell('BD6').value() || '')).digest('hex')
  };

  // Mutate Part A value ranges
  for (const addr of ['N6', 'Z7', 'AG7', 'AM7', 'AQ7', 'AT7', 'BD7']) {
    sheetA.cell(addr).value(null);
  }

  const outBufA = await wbA.outputAsync();

  const wbB = await XlsxPopulate.fromDataAsync(fs.readFileSync(found.partB));
  const sheetB = wbB.sheet(0);

  // Snapshot Part B static header labels using safe hashes
  const labelSnapshotB = {
    B2: crypto.createHash('sha256').update(String(sheetB.cell('B2').value() || '')).digest('hex'),
    J2: crypto.createHash('sha256').update(String(sheetB.cell('J2').value() || '')).digest('hex'),
    M2: crypto.createHash('sha256').update(String(sheetB.cell('M2').value() || '')).digest('hex'),
    P2: crypto.createHash('sha256').update(String(sheetB.cell('P2').value() || '')).digest('hex'),
    R2: crypto.createHash('sha256').update(String(sheetB.cell('R2').value() || '')).digest('hex'),
    S2: crypto.createHash('sha256').update(String(sheetB.cell('S2').value() || '')).digest('hex')
  };

  // Mutate Part B value ranges
  for (const addr of ['G2', 'J3', 'M3', 'P3', 'R3', 'S3']) {
    sheetB.cell(addr).value(addr === 'R3' ? 'MUTATED_VAL' : null);
  }

  const outBufB = await wbB.outputAsync();

  return { outBufA, labelSnapshotA, outBufB, labelSnapshotB };
}

export function unescapeUnicode(str) {
  return str.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

export async function getSanitizedDisposableBuffers() {
  const found = findLocalSourceTemplates();
  if (!found) throw new Error('BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE');

  // Typed value collection in memory without logging source strings
  const wbA_orig = await XlsxPopulate.fromDataAsync(fs.readFileSync(found.partA));
  const sheetA_orig = wbA_orig.sheet(0);
  const collectedSensitiveA = [];
  const typeCountsA = { string: 0, number: 0, date: 0, boolean: 0, nullOrEmpty: 0 };

  for (const addr of SENSITIVE_RANGES_A) {
    const v = sheetA_orig.cell(addr).value();
    if (v === null || v === undefined) {
      typeCountsA.nullOrEmpty++;
    } else if (typeof v === 'number') {
      typeCountsA.number++;
    } else if (typeof v === 'boolean') {
      typeCountsA.boolean++;
    } else if (v instanceof Date) {
      typeCountsA.date++;
    } else if (typeof v === 'string') {
      typeCountsA.string++;
      if (v.trim().length >= 3) {
        collectedSensitiveA.push(v.trim());
      }
    }
  }

  const wbB_orig = await XlsxPopulate.fromDataAsync(fs.readFileSync(found.partB));
  const sheetB_orig = wbB_orig.sheet(0);
  const collectedSensitiveB = [];
  const typeCountsB = { string: 0, number: 0, date: 0, boolean: 0, nullOrEmpty: 0 };

  for (const addr of SENSITIVE_RANGES_B) {
    const v = sheetB_orig.cell(addr).value();
    if (v === null || v === undefined) {
      typeCountsB.nullOrEmpty++;
    } else if (typeof v === 'number') {
      typeCountsB.number++;
    } else if (typeof v === 'boolean') {
      typeCountsB.boolean++;
    } else if (v instanceof Date) {
      typeCountsB.date++;
    } else if (typeof v === 'string') {
      typeCountsB.string++;
      if (v.trim().length >= 3) {
        collectedSensitiveB.push(v.trim());
      }
    }
  }

  // Sanitization Part A
  const wbA = await XlsxPopulate.fromDataAsync(fs.readFileSync(found.partA));
  const sheetA = wbA.sheet(0);
  for (const c of SENSITIVE_RANGES_A) sheetA.cell(c).value(null);

  let bufA = await wbA.outputAsync();
  const wbA_zip = await XlsxPopulate.fromDataAsync(bufA);
  const ssFileA = wbA_zip._zip.files['xl/sharedStrings.xml'];
  if (ssFileA) {
    let xmlA = await ssFileA.async('string');
    for (const token of collectedSensitiveA) {
      if (token && token.length >= 3 && xmlA.includes(token)) {
        xmlA = xmlA.replaceAll(token, '');
      }
    }
    wbA_zip._zip.file('xl/sharedStrings.xml', xmlA);
    bufA = await wbA_zip._zip.generateAsync({ type: 'nodebuffer' });
  }

  // Sanitization Part B
  const wbB = await XlsxPopulate.fromDataAsync(fs.readFileSync(found.partB));
  const sheetB = wbB.sheet(0);
  for (const c of SENSITIVE_RANGES_B) sheetB.cell(c).value(null);

  let bufB = await wbB.outputAsync();
  const wbB_zip = await XlsxPopulate.fromDataAsync(bufB);
  const ssFileB = wbB_zip._zip.files['xl/sharedStrings.xml'];
  if (ssFileB) {
    let xmlB = await ssFileB.async('string');
    for (const token of collectedSensitiveB) {
      if (token && token.length >= 3 && xmlB.includes(token)) {
        xmlB = xmlB.replaceAll(token, '');
      }
    }
    wbB_zip._zip.file('xl/sharedStrings.xml', xmlB);
    bufB = await wbB_zip._zip.generateAsync({ type: 'nodebuffer' });
  }

  return { bufA, bufB, sensitiveA: collectedSensitiveA, sensitiveB: collectedSensitiveB, typeCountsA, typeCountsB };
}

export async function getReferenceImageBuffers() {
  const found = findLocalSourceTemplates();
  if (!found) throw new Error('BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE');

  const origBufA = fs.readFileSync(found.partA);
  const wbA = await XlsxPopulate.fromDataAsync(origBufA);

  const drawingXmlPath = 'xl/drawings/drawing1.xml';
  const drawingRelsPath = 'xl/drawings/_rels/drawing1.xml.rels';

  if (!wbA._zip.files[drawingXmlPath] || !wbA._zip.files[drawingRelsPath]) {
    throw new Error('BLOCKER_REFERENCE_IMAGE_ID_UNRESOLVED: Drawing files not found');
  }

  let drawingXml = await wbA._zip.files[drawingXmlPath].async('string');
  let drawingRels = await wbA._zip.files[drawingRelsPath].async('string');

  // Remove anchor containing rId3
  const anchorRegex = /<xdr:twoCellAnchor[^>]*>(?:(?!<\/xdr:twoCellAnchor>)[\s\S])*rId3[\s\S]*?<\/xdr:twoCellAnchor>/g;
  drawingXml = drawingXml.replace(anchorRegex, '');

  // Remove rId3 from rels
  const relsRegex = /<Relationship[^>]*Id="rId3"[^>]*\/>/g;
  drawingRels = drawingRels.replace(relsRegex, '');

  wbA._zip.file(drawingXmlPath, drawingXml);
  wbA._zip.file(drawingRelsPath, drawingRels);

  // Search ALL remaining package .rels files to confirm image3.png is orphaned
  let image3Referenced = false;
  for (const fileName in wbA._zip.files) {
    if (fileName.endsWith('.rels')) {
      const relsContent = await wbA._zip.files[fileName].async('string');
      if (relsContent.includes('image3.png')) {
        image3Referenced = true;
        break;
      }
    }
  }

  if (!image3Referenced && wbA._zip.files['xl/media/image3.png']) {
    wbA._zip.remove('xl/media/image3.png');
  } else if (image3Referenced) {
    throw new Error('BLOCKER_REFERENCE_IMAGE_ID_UNRESOLVED: image3.png is still referenced elsewhere in package');
  }

  const outBufA = await wbA._zip.generateAsync({ type: 'nodebuffer' });
  return { origBufA, outBufA, drawingXmlPath, drawingRelsPath };
}

/**
 * RAW OOXML Structural Insertion & Merge Cloning for Part A
 */
export async function getStructuralPartABuffers() {
  const found = findLocalSourceTemplates();
  if (!found) throw new Error('BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE');

  const origBufA = fs.readFileSync(found.partA);

  // --- 4 OBJECTIVES (Unchanged) ---
  const wbA4 = await XlsxPopulate.fromDataAsync(origBufA);
  const sheetA4 = wbA4.sheet(0);
  sheetA4.cell('B29').value('SENTINEL_ROW_29');
  const bufA4 = await wbA4.outputAsync();

  // --- RAW OOXML HELPER FOR PART A INSERTION & MERGE CLONING ---
  async function performRawPartAInsertion(extraRows, printAreaStr) {
    const wbTemp = await XlsxPopulate.fromDataAsync(origBufA);
    wbTemp.sheet(0).cell('B29').value('SENTINEL_ROW_29');
    const tempBuf = await wbTemp.outputAsync();

    const wb = await XlsxPopulate.fromDataAsync(tempBuf);
    const sheetFile = wb._zip.files['xl/worksheets/sheet1.xml'];
    let sheetXml = await sheetFile.async('string');

    // 1. Shift raw rows r >= 29 by +extraRows
    sheetXml = sheetXml.replace(/<row r="(\d+)"([^>]*)>/g, (match, rStr, rest) => {
      const r = parseInt(rStr, 10);
      if (r >= 29) {
        return `<row r="${r + extraRows}"${rest}>`;
      }
      return match;
    });

    // 2. Shift cell references <c r="([A-Z]+)(\d+)"
    sheetXml = sheetXml.replace(/<c r="([A-Z]+)(\d+)"/g, (match, col, rStr) => {
      const r = parseInt(rStr, 10);
      if (r >= 29) {
        return `<c r="${col}${r + extraRows}"`;
      }
      return match;
    });

    // 3. Clone row 28 XML for inserted rows 29..(28+extraRows)
    const row28Match = sheetXml.match(/<row r="28"[^>]*>[\s\S]*?<\/row>/);
    if (row28Match) {
      const row28Xml = row28Match[0];
      const clonedRowsXml = [];
      for (let i = 0; i < extraRows; i++) {
        const targetR = 29 + i;
        let clonedRow = row28Xml.replace(/<row r="28"/g, `<row r="${targetR}"`);
        clonedRow = clonedRow.replace(/<c r="([A-Z]+)28"/g, (m, col) => `<c r="${col}${targetR}"`);
        clonedRowsXml.push(clonedRow);
      }
      sheetXml = sheetXml.replace(row28Match[0], row28Match[0] + '\n' + clonedRowsXml.join('\n'));
    }

    // 4. Extract row 28 mergeCell elements and clone them for inserted rows
    const row28Merges = [];
    const mergeCellMatches = [...sheetXml.matchAll(/<mergeCell ref="([A-Z]+)28:([A-Z]+)28"\/>/g)];
    for (const m of mergeCellMatches) {
      row28Merges.push({ col1: m[1], col2: m[2] });
    }

    // Shift existing mergeCells for rows >= 29
    sheetXml = sheetXml.replace(/<mergeCell ref="([A-Z]+)(\d+):([A-Z]+)(\d+)"\/>/g, (match, c1, r1Str, c2, r2Str) => {
      let r1 = parseInt(r1Str, 10);
      let r2 = parseInt(r2Str, 10);
      if (r1 >= 29) r1 += extraRows;
      if (r2 >= 29) r2 += extraRows;
      return `<mergeCell ref="${c1}${r1}:${c2}${r2}"/>`;
    });

    // Append cloned mergeCell elements for inserted rows
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

    // Update dimension ref
    sheetXml = sheetXml.replace(/<dimension ref="([A-Z0-9]+:)([A-Z]+)(\d+)"\s*\/>/, (m, prefix, col, rStr) => {
      return `<dimension ref="${prefix}${col}${parseInt(rStr, 10) + extraRows}"/>`;
    });

    wb._zip.file('xl/worksheets/sheet1.xml', sheetXml);

    // Update Print_Area in xl/workbook.xml
    let wbXml = await wb._zip.files['xl/workbook.xml'].async('string');
    wbXml = wbXml.replace(/<definedName name="_xlnm\.Print_Area"[^>]*>[^<]+<\/definedName>/, `<definedName name="_xlnm.Print_Area" localSheetId="0">'MBO Staff &amp; Chief'!${printAreaStr}</definedName>`);
    wb._zip.file('xl/workbook.xml', wbXml);

    return wb._zip.generateAsync({ type: 'nodebuffer' });
  }

  const bufA5 = await performRawPartAInsertion(1, '$A$1:$BJ$53');
  const bufA10 = await performRawPartAInsertion(6, '$A$1:$BJ$58');

  return { bufA4, bufA5, bufA10 };
}

/**
 * RAW OOXML Structural Insertion & Merge Cloning for Part B
 */
export async function getStructuralPartBBuffers() {
  const found = findLocalSourceTemplates();
  if (!found) throw new Error('BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE');

  const origBufB = fs.readFileSync(found.partB);

  // --- 6 COMPETENCIES (Unchanged) ---
  const wbB6 = await XlsxPopulate.fromDataAsync(origBufB);
  const sheetB6 = wbB6.sheet(0);
  sheetB6.cell('B31').value('SENTINEL_ROW_31');
  const bufB6 = await wbB6.outputAsync();

  // --- 8 COMPETENCIES (+8 RAW OOXML BLOCK INSERTION & MERGE CLONING) ---
  const wbTemp = await XlsxPopulate.fromDataAsync(origBufB);
  wbTemp.sheet(0).cell('B31').value('SENTINEL_ROW_31');
  const tempBuf = await wbTemp.outputAsync();
  const wbB8 = await XlsxPopulate.fromDataAsync(tempBuf);

  const sheetFile = wbB8._zip.files['xl/worksheets/sheet1.xml'];
  let sheetXml = await sheetFile.async('string');

  const extraRows = 8;

  // Extract source block 27:30 mergeCells
  const block27_30Merges = [];
  const mergeCellMatches = [...sheetXml.matchAll(/<mergeCell ref="([A-Z]+)(\d+):([A-Z]+)(\d+)"\/>/g)];
  for (const m of mergeCellMatches) {
    const r1 = parseInt(m[2], 10);
    const r2 = parseInt(m[4], 10);
    if (r1 >= 27 && r2 <= 30) {
      block27_30Merges.push({ c1: m[1], r1Offset: r1 - 27, c2: m[3], r2Offset: r2 - 27 });
    }
  }

  // Shift rows r >= 31 by +8
  sheetXml = sheetXml.replace(/<row r="(\d+)"([^>]*)>/g, (match, rStr, rest) => {
    const r = parseInt(rStr, 10);
    if (r >= 31) {
      return `<row r="${r + extraRows}"${rest}>`;
    }
    return match;
  });

  sheetXml = sheetXml.replace(/<c r="([A-Z]+)(\d+)"/g, (match, col, rStr) => {
    const r = parseInt(rStr, 10);
    if (r >= 31) {
      return `<c r="${col}${r + extraRows}"`;
    }
    return match;
  });

  let block27_30 = '';
  for (let r = 27; r <= 30; r++) {
    const m = sheetXml.match(new RegExp(`<row r="${r}"[^>]*>[\\s\\S]*?<\\/row>`));
    if (m) block27_30 += m[0] + '\n';
  }

  const block31_34 = block27_30.replace(/r="(\d+)"/g, (m, rStr) => `r="${parseInt(rStr, 10) + 4}"`).replace(/<c r="([A-Z]+)(\d+)"/g, (m, col, rStr) => `<c r="${col}${parseInt(rStr, 10) + 4}"`);
  const block35_38 = block27_30.replace(/r="(\d+)"/g, (m, rStr) => `r="${parseInt(rStr, 10) + 8}"`).replace(/<c r="([A-Z]+)(\d+)"/g, (m, col, rStr) => `<c r="${col}${parseInt(rStr, 10) + 8}"`);

  const row30Match = sheetXml.match(/<row r="30"[^>]*>[\s\S]*?<\/row>/);
  if (row30Match) {
    sheetXml = sheetXml.replace(row30Match[0], row30Match[0] + '\n' + block31_34 + '\n' + block35_38);
  }

  // Shift mergeCells for rows >= 31
  sheetXml = sheetXml.replace(/<mergeCell ref="([A-Z]+)(\d+):([A-Z]+)(\d+)"\/>/g, (match, c1, r1Str, c2, r2Str) => {
    let r1 = parseInt(r1Str, 10);
    let r2 = parseInt(r2Str, 10);
    if (r1 >= 31) r1 += extraRows;
    if (r2 >= 31) r2 += extraRows;
    return `<mergeCell ref="${c1}${r1}:${c2}${r2}"/>`;
  });

  // Append cloned mergeCells for block 31:34 (+4) and block 35:38 (+8)
  const clonedMergesXmlB = [];
  for (const m of block27_30Merges) {
    clonedMergesXmlB.push(`<mergeCell ref="${m.c1}${31 + m.r1Offset}:${m.c2}${31 + m.r2Offset}"/>`);
    clonedMergesXmlB.push(`<mergeCell ref="${m.c1}${35 + m.r1Offset}:${m.c2}${35 + m.r2Offset}"/>`);
  }

  if (clonedMergesXmlB.length > 0) {
    sheetXml = sheetXml.replace(/<\/mergeCells>/, clonedMergesXmlB.join('\n') + '\n</mergeCells>');
  }

  // Update <mergeCells count="N">
  const countMatchB = sheetXml.match(/<mergeCells count="(\d+)">/);
  if (countMatchB) {
    const currentCount = parseInt(countMatchB[1], 10);
    const newCount = currentCount + clonedMergesXmlB.length;
    sheetXml = sheetXml.replace(/<mergeCells count="\d+">/, `<mergeCells count="${newCount}">`);
  }

  sheetXml = sheetXml.replace(/<dimension ref="([A-Z0-9]+:)([A-Z]+)(\d+)"\s*\/>/, (m, prefix, col, rStr) => {
    return `<dimension ref="${prefix}${col}${parseInt(rStr, 10) + extraRows}"/>`;
  });
  wbB8._zip.file('xl/worksheets/sheet1.xml', sheetXml);

  let wbXml = await wbB8._zip.files['xl/workbook.xml'].async('string');
  wbXml = wbXml.replace(/<definedName name="_xlnm\.Print_Area"[^>]*>[^<]+<\/definedName>/, `<definedName name="_xlnm.Print_Area" localSheetId="0">'(Part B) Competency'!$A$1:$X$43</definedName>`);
  wbB8._zip.file('xl/workbook.xml', wbXml);

  const bufB8 = await wbB8._zip.generateAsync({ type: 'nodebuffer' });

  return { bufB6, bufB8 };
}
