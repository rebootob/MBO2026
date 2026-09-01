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

  // Snapshot Part A static header labels
  const labelSnapshotA = {
    B6: sheetA.cell('B6').value(),
    AM6: sheetA.cell('AM6').value(),
    AQ6: sheetA.cell('AQ6').value(),
    AT6: sheetA.cell('AT6').value(),
    BD6: sheetA.cell('BD6').value()
  };

  // Mutate Part A value ranges
  sheetA.cell('N6').value(null); // Fiscal Year value
  sheetA.cell('Z7').value(null); // Department value
  sheetA.cell('AG7').value(null); // Section value
  sheetA.cell('AM7').value(null); // Start Date value
  sheetA.cell('AQ7').value(null); // Emp ID value
  sheetA.cell('AT7').value(null); // Emp Name value
  sheetA.cell('BD7').value(null); // Position value

  const outBufA = await wbA.outputAsync();

  const wbB = await XlsxPopulate.fromDataAsync(fs.readFileSync(found.partB));
  const sheetB = wbB.sheet(0);

  // Snapshot Part B static header labels
  const labelSnapshotB = {
    B2: sheetB.cell('B2').value(),
    J2: sheetB.cell('J2').value(),
    M2: sheetB.cell('M2').value(),
    P2: sheetB.cell('P2').value(),
    R2: sheetB.cell('R2').value(),
    S2: sheetB.cell('S2').value()
  };

  // Mutate Part B value ranges
  sheetB.cell('G2').value(null); // Fiscal Year value
  sheetB.cell('J3').value(null); // Department value
  sheetB.cell('M3').value(null); // Section value
  sheetB.cell('P3').value(null); // Position value
  sheetB.cell('R3').value('TEST_MUTATION'); // Emp ID value
  sheetB.cell('S3').value(null); // Emp Name value

  const outBufB = await wbB.outputAsync();

  return { outBufA, labelSnapshotA, outBufB, labelSnapshotB };
}

export function unescapeUnicode(str) {
  return str.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

export async function extractSensitiveTokensFromBinary(filePath) {
  const wb = await XlsxPopulate.fromDataAsync(fs.readFileSync(filePath));
  const sharedStringsFile = wb._zip.files['xl/sharedStrings.xml'];
  if (!sharedStringsFile) return [];

  const xmlContent = await sharedStringsFile.async('string');
  const matches = [...xmlContent.matchAll(/<t[^>]*>([^<]+)<\/t>/g)].map(m => m[1].trim());

  const staticKeywords = [
    'mbo', 'staff', 'chief', 'competency', 'fiscal', 'year', 'department', 'section',
    'position', 'employee', 'start', 'date', 'target', 'kpi', 'weight', 'achievement',
    'result', 'comment', 'score', 'total', 'grade', 'signature', 'appraiser', 'rating',
    'scale', 'level', 'performance', 'appraisal', 'form', 'objective', 'plan', 'difficultty',
    'difficulty', 'periodical', 'review', 'mid-year', 'final', 'evaluation', 'adaptability',
    'problem', 'solving', 'customer', 'focus', 'value', 'creation', 'safety', 'awareness',
    'compliance', 'coce', 'hoshin', 'company', 'agreement', 'point', 'raw', 'weighted',
    'guideline', 'instruction', 'note', 'legend', 'part', 'overall', 'summary', 'definition',
    'ratio', 'percentage', 'criteria', 'description', 'behavior', 'challenging', 'effort',
    'resource', 'sustainable', 'requires', 'normal', 'routine', 'easy', 'exceeds', 'meets',
    'needs', 'improvement', 'unsatisfactory', 'outstanding', 'good', 'fair', 'poor',
    'dept', 'manager', 'set up', 'by', 'gm', 'vp', 'executive', 'first', 'second', 'superior',
    'appraisee', 'agreement', 'periodical', 'additional', 'review', 'average', 'actual',
    'emp', 'id', 'name', 'title', 'code', 'no.', 'num', 'fill', 'out', 'use', 'only',
    'area', 'box', 'column', 'row', 'cell', 'do not'
  ];

  return matches.filter(t => {
    if (!t || t.length < 3 || t.includes('[') || t.includes(']')) return false;
    const lower = t.toLowerCase();
    for (const kw of staticKeywords) {
      if (lower.includes(kw)) return false;
    }
    return true;
  });
}

export async function getSanitizedDisposableBuffers() {
  const found = findLocalSourceTemplates();
  if (!found) throw new Error('BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE');

  const sensitiveA = await extractSensitiveTokensFromBinary(found.partA);
  const sensitiveB = await extractSensitiveTokensFromBinary(found.partB);

  // Sanitization Part A
  const wbA = await XlsxPopulate.fromDataAsync(fs.readFileSync(found.partA));
  const sheetA = wbA.sheet(0);

  const clearCellsA = ['N6', 'Z6', 'AG6', 'AM6', 'AQ6', 'AT6', 'BD6', 'Z7', 'AG7', 'AM7', 'AQ7', 'AT7', 'BD7', 'G8', 'G16', 'AM16'];
  for (const c of clearCellsA) sheetA.cell(c).value(null);

  for (let r = 25; r <= 28; r++) {
    for (const col of ['B', 'J', 'T', 'Y', 'AA', 'AD', 'AI', 'AK', 'AS', 'AV', 'AX', 'BA', 'BC', 'BF']) {
      sheetA.cell(`${col}${r}`).value(null);
    }
  }

  for (let r = 29; r <= 35; r++) sheetA.cell(`BC${r}`).value(null);
  for (let r = 37; r <= 42; r++) {
    sheetA.cell(`B${r}`).value(null);
    sheetA.cell(`AI${r}`).value(null);
  }
  for (let r = 47; r <= 50; r++) {
    sheetA.cell(`B${r}`).value(null);
    sheetA.cell(`G${r}`).value(null);
    sheetA.cell(`L${r}`).value(null);
  }

  let bufA = await wbA.outputAsync();
  const wbA_zip = await XlsxPopulate.fromDataAsync(bufA);
  const ssFileA = wbA_zip._zip.files['xl/sharedStrings.xml'];
  if (ssFileA) {
    let xmlA = await ssFileA.async('string');
    for (const token of sensitiveA) {
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

  const clearCellsB = ['G2', 'J2', 'M2', 'P2', 'R3', 'S2', 'J3', 'M3', 'P3', 'S3'];
  for (const c of clearCellsB) sheetB.cell(c).value(null);

  for (let r = 7; r <= 29; r++) {
    sheetB.cell(`K${r}`).value(null);
    sheetB.cell(`R${r}`).value(null);
  }

  for (let r = 31; r <= 34; r++) {
    sheetB.cell(`B${r}`).value(null);
    sheetB.cell(`E${r}`).value(null);
    sheetB.cell(`I${r}`).value(null);
    sheetB.cell(`Q${r}`).value(null);
    sheetB.cell(`T${r}`).value(null);
  }

  let bufB = await wbB.outputAsync();
  const wbB_zip = await XlsxPopulate.fromDataAsync(bufB);
  const ssFileB = wbB_zip._zip.files['xl/sharedStrings.xml'];
  if (ssFileB) {
    let xmlB = await ssFileB.async('string');
    for (const token of sensitiveB) {
      if (token && token.length >= 3 && xmlB.includes(token)) {
        xmlB = xmlB.replaceAll(token, '');
      }
    }
    wbB_zip._zip.file('xl/sharedStrings.xml', xmlB);
    bufB = await wbB_zip._zip.generateAsync({ type: 'nodebuffer' });
  }

  return { bufA, bufB, sensitiveA, sensitiveB };
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
  if (wbA._zip.files['xl/media/image3.png']) {
    wbA._zip.remove('xl/media/image3.png');
  }

  const outBufA = await wbA._zip.generateAsync({ type: 'nodebuffer' });
  return { origBufA, outBufA, drawingXmlPath, drawingRelsPath };
}

/**
 * RAW OOXML Structural Insertion for Part A
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

  // --- RAW OOXML HELPER FOR PART A INSERTION ---
  async function performRawPartAInsertion(extraRows, printAreaStr) {
    const wbTemp = await XlsxPopulate.fromDataAsync(origBufA);
    wbTemp.sheet(0).cell('B29').value('SENTINEL_ROW_29');
    const tempBuf = await wbTemp.outputAsync();

    const wb = await XlsxPopulate.fromDataAsync(tempBuf);
    const sheetFile = wb._zip.files['xl/worksheets/sheet1.xml'];
    let sheetXml = await sheetFile.async('string');

    sheetXml = sheetXml.replace(/<row r="(\d+)"([^>]*)>/g, (match, rStr, rest) => {
      const r = parseInt(rStr, 10);
      if (r >= 29) {
        return `<row r="${r + extraRows}"${rest}>`;
      }
      return match;
    });

    sheetXml = sheetXml.replace(/<c r="([A-Z]+)(\d+)"/g, (match, col, rStr) => {
      const r = parseInt(rStr, 10);
      if (r >= 29) {
        return `<c r="${col}${r + extraRows}"`;
      }
      return match;
    });

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

    sheetXml = sheetXml.replace(/<mergeCell ref="([A-Z]+)(\d+):([A-Z]+)(\d+)"\/>/g, (match, c1, r1Str, c2, r2Str) => {
      let r1 = parseInt(r1Str, 10);
      let r2 = parseInt(r2Str, 10);
      if (r1 >= 29) r1 += extraRows;
      if (r2 >= 29) r2 += extraRows;
      return `<mergeCell ref="${c1}${r1}:${c2}${r2}"/>`;
    });

    sheetXml = sheetXml.replace(/<dimension ref="([A-Z0-9]+:)([A-Z]+)(\d+)"\s*\/>/, (m, prefix, col, rStr) => {
      return `<dimension ref="${prefix}${col}${parseInt(rStr, 10) + extraRows}"/>`;
    });

    wb._zip.file('xl/worksheets/sheet1.xml', sheetXml);

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
 * RAW OOXML Structural Insertion for Part B
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

  // --- 8 COMPETENCIES (+8 RAW OOXML INSERTION) ---
  const wbTemp = await XlsxPopulate.fromDataAsync(origBufB);
  wbTemp.sheet(0).cell('B31').value('SENTINEL_ROW_31');
  const tempBuf = await wbTemp.outputAsync();
  const wbB8 = await XlsxPopulate.fromDataAsync(tempBuf);

  const sheetFile = wbB8._zip.files['xl/worksheets/sheet1.xml'];
  let sheetXml = await sheetFile.async('string');

  const extraRows = 8;

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

  sheetXml = sheetXml.replace(/<mergeCell ref="([A-Z]+)(\d+):([A-Z]+)(\d+)"\/>/g, (match, c1, r1Str, c2, r2Str) => {
    let r1 = parseInt(r1Str, 10);
    let r2 = parseInt(r2Str, 10);
    if (r1 >= 31) r1 += extraRows;
    if (r2 >= 31) r2 += extraRows;
    return `<mergeCell ref="${c1}${r1}:${c2}${r2}"/>`;
  });

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
