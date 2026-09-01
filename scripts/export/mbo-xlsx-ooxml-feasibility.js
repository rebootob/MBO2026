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

  // Snapshot Part A Row 6 static header labels
  const labelSnapshotA = {
    B6: sheetA.cell('B6').value(),
    AM6: sheetA.cell('AM6').value(),
    AQ6: sheetA.cell('AQ6').value(),
    AT6: sheetA.cell('AT6').value(),
    BD6: sheetA.cell('BD6').value()
  };

  // Mutate proven Row 7 / Row 6 value ranges only
  sheetA.cell('N6').value(null); // Sample Fiscal Year value
  sheetA.cell('Z7').value(null); // Dept value
  sheetA.cell('AG7').value(null); // Section value
  sheetA.cell('AM7').value(null); // Start Date value
  sheetA.cell('AQ7').value(null); // Emp ID value
  sheetA.cell('AT7').value(null); // Emp Name value
  sheetA.cell('BD7').value(null); // Position value

  const outBufA = await wbA.outputAsync();

  const wbB = await XlsxPopulate.fromDataAsync(fs.readFileSync(found.partB));
  const sheetB = wbB.sheet(0);

  // Snapshot Part B Row 2 static header labels
  const labelSnapshotB = {
    B2: sheetB.cell('B2').value(),
    J2: sheetB.cell('J2').value(),
    M2: sheetB.cell('M2').value(),
    P2: sheetB.cell('P2').value(),
    R2: sheetB.cell('R2').value(),
    S2: sheetB.cell('S2').value()
  };

  // Mutate proven Row 3 / Row 2 value ranges only
  sheetB.cell('G2').value(null); // Sample Fiscal Year value
  sheetB.cell('J3').value(null);
  sheetB.cell('M3').value(null);
  sheetB.cell('P3').value(null);
  sheetB.cell('R3').value('TEST_MUTATION');
  sheetB.cell('S3').value(null);

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

  let drawingFile = null;
  for (const f in wbA._zip.files) {
    if (f.startsWith('xl/drawings/drawing')) {
      drawingFile = f;
      break;
    }
  }

  if (!drawingFile) {
    throw new Error('BLOCKER_REFERENCE_IMAGE_ID_UNRESOLVED: Drawing file not found in template');
  }

  const outBufA = await wbA.outputAsync();
  return { origBufA, outBufA, drawingFile };
}

export async function getStructuralPartABuffers() {
  const found = findLocalSourceTemplates();
  if (!found) throw new Error('BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE');

  const origBufA = fs.readFileSync(found.partA);

  // 4 Objectives (unchanged)
  const wbA4 = await XlsxPopulate.fromDataAsync(origBufA);
  const sheetA4 = wbA4.sheet(0);
  sheetA4.cell('B29').value('SENTINEL_ROW_29');
  const bufA4 = await wbA4.outputAsync();

  // 5 Objectives (+1 insertion)
  const wbA5 = await XlsxPopulate.fromDataAsync(origBufA);
  const sheetA5 = wbA5.sheet(0);
  sheetA5.cell('B29').value('SENTINEL_ROW_29');
  for (let r = 52; r >= 29; r--) {
    const srcRow = sheetA5.row(r);
    const tgtRow = sheetA5.row(r + 1);
    if (srcRow && tgtRow) {
      const h = srcRow.height();
      if (h) tgtRow.height(h);
      for (let c = 1; c <= 60; c++) {
        const val = sheetA5.cell(r, c).value();
        if (val !== undefined && val !== null) {
          sheetA5.cell(r + 1, c).value(val);
          sheetA5.cell(r, c).value(null);
        }
      }
    }
  }
  sheetA5.row(29).hidden(false);
  if (typeof sheetA5.printArea === 'function') sheetA5.printArea('A1:BJ53');
  const bufA5 = await wbA5.outputAsync();

  // 10 Objectives (+6 insertion)
  const wbA10 = await XlsxPopulate.fromDataAsync(origBufA);
  const sheetA10 = wbA10.sheet(0);
  sheetA10.cell('B29').value('SENTINEL_ROW_29');
  for (let r = 52; r >= 29; r--) {
    const srcRow = sheetA10.row(r);
    const tgtRow = sheetA10.row(r + 6);
    if (srcRow && tgtRow) {
      const h = srcRow.height();
      if (h) tgtRow.height(h);
      for (let c = 1; c <= 60; c++) {
        const val = sheetA10.cell(r, c).value();
        if (val !== undefined && val !== null) {
          sheetA10.cell(r + 6, c).value(val);
          sheetA10.cell(r, c).value(null);
        }
      }
    }
  }
  for (let i = 0; i < 6; i++) sheetA10.row(29 + i).hidden(false);
  if (typeof sheetA10.printArea === 'function') sheetA10.printArea('A1:BJ58');
  const bufA10 = await wbA10.outputAsync();

  return { bufA4, bufA5, bufA10 };
}

export async function getStructuralPartBBuffers() {
  const found = findLocalSourceTemplates();
  if (!found) throw new Error('BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE');

  const origBufB = fs.readFileSync(found.partB);

  // 6 Competencies
  const wbB6 = await XlsxPopulate.fromDataAsync(origBufB);
  const sheetB6 = wbB6.sheet(0);
  sheetB6.cell('B31').value('SENTINEL_ROW_31');
  const bufB6 = await wbB6.outputAsync();

  // 8 Competencies (+8 rows insertion)
  const wbB8 = await XlsxPopulate.fromDataAsync(origBufB);
  const sheetB8 = wbB8.sheet(0);
  sheetB8.cell('B31').value('SENTINEL_ROW_31');
  for (let r = 35; r >= 31; r--) {
    const srcRow = sheetB8.row(r);
    const tgtRow = sheetB8.row(r + 8);
    if (srcRow && tgtRow) {
      const h = srcRow.height();
      if (h) tgtRow.height(h);
      for (let c = 1; c <= 24; c++) {
        const val = sheetB8.cell(r, c).value();
        if (val !== undefined && val !== null) {
          sheetB8.cell(r + 8, c).value(val);
          sheetB8.cell(r, c).value(null);
        }
      }
    }
  }
  if (typeof sheetB8.printArea === 'function') sheetB8.printArea('A1:X43');
  const bufB8 = await wbB8.outputAsync();

  return { bufB6, bufB8 };
}
