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

export const SENSITIVE_RANGES_A = [...new Set(PART_A_SENSITIVE_RANGES.flatMap(expandRangeToAddresses))];
export const SENSITIVE_RANGES_B = [...new Set(PART_B_SENSITIVE_RANGES.flatMap(expandRangeToAddresses))];

export async function buildPartBSourceEvidenceInventory() {
  const found = findLocalSourceTemplates();
  if (!found) throw new Error('BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE');

  const bufB = fs.readFileSync(found.partB);
  const shaB = crypto.createHash('sha256').update(bufB).digest('hex');
  if (shaB !== EXPECTED_PART_B_SHA) {
    throw new Error('BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE');
  }

  const wb = await XlsxPopulate.fromDataAsync(bufB);
  const sheet = wb.sheet(0);
  const sheetXml = await wb._zip.files['xl/worksheets/sheet1.xml'].async('string');
  const merges = [...sheetXml.matchAll(/<mergeCell ref="([A-Z0-9:]+)"\/>/g)].map(m => m[1]);

  function getMergeRef(addr) {
    for (const ref of merges) {
      if (ref.includes(':')) {
        const addrs = expandRangeToAddresses(ref);
        if (addrs.includes(addr)) return ref;
      } else if (ref === addr) {
        return ref;
      }
    }
    return null;
  }

  function getStyleId(addr) {
    const m = sheetXml.match(new RegExp(`<c r="${addr}"[^>]*s="(\\d+)"`));
    return m ? m[1] : '0';
  }

  const inventory = {};
  for (let r = 2; r <= 34; r++) {
    for (let c = 2; c <= 24; c++) {
      const addr = `${idxToCol(c)}${r}`;
      const val = sheet.cell(addr).value();

      let normalizedType = 'blank';
      let nonblank = false;
      let valHash = null;

      if (val === null || val === undefined) {
        normalizedType = 'blank';
      } else if (typeof val === 'number') {
        normalizedType = 'number';
        nonblank = true;
      } else if (typeof val === 'boolean') {
        normalizedType = 'boolean';
        nonblank = true;
      } else if (val instanceof Date) {
        normalizedType = 'date';
        nonblank = true;
      } else {
        const strVal = String(val).trim();
        if (strVal === '') {
          normalizedType = 'blank';
        } else {
          normalizedType = 'string';
          nonblank = true;
          valHash = crypto.createHash('sha256').update(strVal).digest('hex');
        }
      }

      inventory[addr] = {
        address: addr,
        mergeRef: getMergeRef(addr),
        styleId: getStyleId(addr),
        normalizedType,
        nonblank,
        valHash
      };
    }
  }

  return inventory;
}

export async function resolvePartBPrivacyRoles(inventoryOverride = null) {
  const authSourceInventory = await buildPartBSourceEvidenceInventory();
  const observedInventory = inventoryOverride || authSourceInventory;

  const classificationMap = {};
  const dynamicAddresses = [];
  const protectedStaticAddresses = [];

  for (let r = 2; r <= 34; r++) {
    const cols = ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X'];

    for (const cStr of cols) {
      const addr = `${cStr}${r}`;
      const authEv = authSourceInventory[addr];
      const ev = observedInventory[addr];

      if (!ev || !ev.address || ev.styleId === undefined || !ev.normalizedType) {
        throw new Error('BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED');
      }

      if (!['string', 'number', 'date', 'boolean', 'blank'].includes(ev.normalizedType)) {
        throw new Error('BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED');
      }

      if (authEv) {
        if (ev.styleId !== authEv.styleId || ev.mergeRef !== authEv.mergeRef) {
          throw new Error('BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED');
        }
        if (ev.normalizedType !== authEv.normalizedType) {
          throw new Error('BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED');
        }
        if (ev.nonblank !== authEv.nonblank) {
          throw new Error('BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED');
        }
      }

      let isDynamic = false;
      let classification = null;
      let roleJustification = null;

      if (r === 2 || r === 3) {
        if (['B', 'C', 'D', 'E', 'F'].includes(cStr)) {
          classification = 'PROTECTED_STATIC_TITLE';
          roleJustification = 'Static sheet title';
          isDynamic = false;
          if (ev.mergeRef !== 'B2:F3') throw new Error('BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED');
        } else if (['G', 'H'].includes(cStr)) {
          classification = 'HEADER_VALUE';
          roleJustification = 'Dynamic fiscal year header input field';
          isDynamic = true;
          if (ev.mergeRef !== 'G2:H3') throw new Error('BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED');
        } else if (['J', 'K', 'L'].includes(cStr)) {
          if (r === 2) {
            classification = 'PROTECTED_STATIC_HEADER_LABEL';
            roleJustification = 'Static department header label';
            isDynamic = false;
            if (ev.mergeRef !== 'J2:L2') throw new Error('BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED');
          } else {
            classification = 'HEADER_VALUE';
            roleJustification = 'Dynamic department header value';
            isDynamic = true;
            if (ev.mergeRef !== 'J3:L3') throw new Error('BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED');
          }
        } else if (['M', 'N', 'O'].includes(cStr)) {
          if (r === 2) {
            classification = 'PROTECTED_STATIC_HEADER_LABEL';
            roleJustification = 'Static section header label';
            isDynamic = false;
            if (ev.mergeRef !== 'M2:O2') throw new Error('BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED');
          } else {
            classification = 'HEADER_VALUE';
            roleJustification = 'Dynamic section header value';
            isDynamic = true;
            if (ev.mergeRef !== 'M3:O3') throw new Error('BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED');
          }
        } else if (['P', 'Q'].includes(cStr)) {
          if (r === 2) {
            classification = 'PROTECTED_STATIC_HEADER_LABEL';
            roleJustification = 'Static position header label';
            isDynamic = false;
            if (ev.mergeRef !== 'P2:Q2') throw new Error('BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED');
          } else {
            classification = 'HEADER_VALUE';
            roleJustification = 'Dynamic position header value';
            isDynamic = true;
            if (ev.mergeRef !== 'P3:Q3') throw new Error('BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED');
          }
        } else if (cStr === 'R') {
          if (r === 2) {
            classification = 'PROTECTED_STATIC_HEADER_LABEL';
            roleJustification = 'Static employee ID header label';
            isDynamic = false;
          } else {
            classification = 'HEADER_VALUE';
            roleJustification = 'Dynamic employee ID header value';
            isDynamic = true;
          }
        } else if (['S', 'T', 'U', 'V', 'W'].includes(cStr)) {
          if (r === 2) {
            classification = 'PROTECTED_STATIC_HEADER_LABEL';
            roleJustification = 'Static employee name header label';
            isDynamic = false;
            if (ev.mergeRef !== 'S2:W2') throw new Error('BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED');
          } else {
            classification = 'HEADER_VALUE';
            roleJustification = 'Dynamic employee name header value';
            isDynamic = true;
            if (ev.mergeRef !== 'S3:W3') throw new Error('BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED');
          }
        } else if (cStr === 'X') {
          classification = 'PROTECTED_STATIC_HEADER_UNTOUCHED';
          roleJustification = 'Static header padding cell';
          isDynamic = false;
        }
      } else if (r >= 7 && r <= 29) {
        if (['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].includes(cStr)) {
          classification = 'PROTECTED_STATIC_COMPETENCY_TEXT';
          roleJustification = 'Static competency name, description, or rating guidance text';
          isDynamic = false;
        } else if (['K', 'L', 'M', 'N', 'O', 'P', 'Q'].includes(cStr)) {
          classification = 'COMPETENCY_RATING_VALUE';
          roleJustification = 'Dynamic self-evaluation rating input field';
          isDynamic = true;
        } else if (['R', 'S', 'T', 'U', 'V', 'W', 'X'].includes(cStr)) {
          classification = 'COMPETENCY_RATING_VALUE';
          roleJustification = 'Dynamic chief-evaluation rating input field';
          isDynamic = true;
        }
      } else if (r >= 31 && r <= 34) {
        if (['B', 'C', 'D'].includes(cStr)) {
          classification = 'SUMMARY_SIGNATURE_VALUE';
          roleJustification = 'Dynamic overall rating summary field';
          isDynamic = true;
        } else if (['E', 'F', 'G', 'H'].includes(cStr)) {
          classification = 'SUMMARY_SIGNATURE_VALUE';
          roleJustification = 'Dynamic employee comments field';
          isDynamic = true;
        } else if (['I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'].includes(cStr)) {
          classification = 'SUMMARY_SIGNATURE_VALUE';
          roleJustification = 'Dynamic chief feedback field';
          isDynamic = true;
        } else if (['Q', 'R', 'S'].includes(cStr)) {
          classification = 'SUMMARY_SIGNATURE_VALUE';
          roleJustification = 'Dynamic employee signature field';
          isDynamic = true;
        } else if (['T', 'U', 'V', 'W', 'X'].includes(cStr)) {
          classification = 'SUMMARY_SIGNATURE_VALUE';
          roleJustification = 'Dynamic chief signature field';
          isDynamic = true;
        }
      }

      if (!classification || !roleJustification) {
        continue;
      }

      if (!isDynamic && authEv && authEv.valHash) {
        if (ev.valHash !== authEv.valHash) {
          throw new Error('BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED');
        }
      }

      classificationMap[addr] = {
        ...ev,
        classification,
        roleJustification,
        isDynamic
      };

      if (isDynamic) {
        dynamicAddresses.push(addr);
      } else {
        protectedStaticAddresses.push(addr);
      }
    }
  }

  const dynamicSet = new Set(dynamicAddresses);
  for (const staticAddr of protectedStaticAddresses) {
    if (dynamicSet.has(staticAddr)) {
      throw new Error('BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED');
    }
  }

  const sortedDynamic = [...dynamicAddresses].sort();
  const sortedSensitive = [...SENSITIVE_RANGES_B].sort();

  if (JSON.stringify(sortedDynamic) !== JSON.stringify(sortedSensitive)) {
    throw new Error('BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED');
  }

  return {
    classificationMap,
    dynamicAddresses: sortedDynamic,
    protectedStaticAddresses: [...protectedStaticAddresses].sort()
  };
}

export async function getPartBPrivacyClassificationSourceBacked() {
  const resolved = await resolvePartBPrivacyRoles();
  return resolved.classificationMap;
}

export function getPartBPrivacyClassification() {
  const sensitiveSet = new Set(SENSITIVE_RANGES_B);
  const map = {};

  for (const addr of SENSITIVE_RANGES_B) {
    const row = parseInt(addr.match(/\d+/)[0], 10);
    let classification = 'DYNAMIC_SAMPLE_VALUE';
    if (['G2', 'G3', 'H2', 'H3', 'J3', 'K3', 'L3', 'M3', 'N3', 'O3', 'P3', 'Q3', 'R3', 'S3', 'T3', 'U3', 'V3', 'W3'].includes(addr)) {
      classification = 'HEADER_VALUE';
    } else if (row >= 7 && row <= 29) {
      classification = 'COMPETENCY_RATING_VALUE';
    } else if (row >= 31 && row <= 34) {
      classification = 'SUMMARY_SIGNATURE_VALUE';
    }
    map[addr] = { classification, isDynamic: true };
  }

  const protectedStatic = [
    'B2', 'C2', 'D2', 'E2', 'F2', 'B3', 'C3', 'D3', 'E3', 'F3',
    'J2', 'K2', 'L2', 'M2', 'N2', 'O2', 'P2', 'Q2', 'R2', 'S2', 'T2', 'U2', 'V2', 'W2'
  ];
  for (let r = 7; r <= 29; r++) {
    for (const c of ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']) {
      protectedStatic.push(`${c}${r}`);
    }
  }

  for (const addr of protectedStatic) {
    if (!sensitiveSet.has(addr)) {
      map[addr] = { classification: 'PROTECTED_STATIC_TEMPLATE_TEXT', isDynamic: false };
    }
  }

  return map;
}

export async function getTypedPrivacyMetadata(partKey) {
  const found = findLocalSourceTemplates();
  if (!found) throw new Error('BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE');

  const file = partKey === 'A' ? found.partA : found.partB;
  const targetAddrs = partKey === 'A' ? SENSITIVE_RANGES_A : SENSITIVE_RANGES_B;

  const wb = await XlsxPopulate.fromDataAsync(fs.readFileSync(file));
  const sheet = wb.sheet(0);

  const metadata = [];
  const typeCounts = { string: 0, number: 0, date: 0, boolean: 0, blank: 0 };
  const seenAddresses = new Set();

  for (const addr of targetAddrs) {
    if (seenAddresses.has(addr)) continue;
    seenAddresses.add(addr);

    const val = sheet.cell(addr).value();
    let normalizedType = 'blank';
    let nonblank = false;
    let valHash = null;

    if (val === null || val === undefined) {
      normalizedType = 'blank';
      typeCounts.blank++;
    } else if (typeof val === 'number') {
      normalizedType = 'number';
      nonblank = true;
      typeCounts.number++;
    } else if (typeof val === 'boolean') {
      normalizedType = 'boolean';
      nonblank = true;
      typeCounts.boolean++;
    } else if (val instanceof Date) {
      normalizedType = 'date';
      nonblank = true;
      typeCounts.date++;
    } else {
      const strVal = String(val).trim();
      if (strVal === '') {
        normalizedType = 'blank';
        typeCounts.blank++;
      } else {
        normalizedType = 'string';
        nonblank = true;
        typeCounts.string++;
        valHash = crypto.createHash('sha256').update(strVal).digest('hex');
      }
    }

    metadata.push({ address: addr, normalizedType, nonblank, hash: valHash });
  }

  return {
    metadata,
    uniqueCount: seenAddresses.size,
    typeCounts,
    totalReconciled: typeCounts.string + typeCounts.number + typeCounts.date + typeCounts.boolean + typeCounts.blank
  };
}

export function validateTypedPrivacyMetadata(metaResult, expectedAddresses) {
  if (!metaResult || typeof metaResult !== 'object' || Array.isArray(metaResult)) {
    throw new Error('BLOCKER_TYPED_PRIVACY_METADATA_UNRESOLVED');
  }

  if (!Array.isArray(metaResult.metadata)) {
    throw new Error('BLOCKER_TYPED_PRIVACY_METADATA_UNRESOLVED');
  }

  const { metadata, uniqueCount, typeCounts, totalReconciled } = metaResult;

  if (typeof uniqueCount !== 'number' || typeof totalReconciled !== 'number') {
    throw new Error('BLOCKER_TYPED_PRIVACY_METADATA_UNRESOLVED');
  }

  if (metadata.length !== uniqueCount || totalReconciled !== uniqueCount) {
    throw new Error('BLOCKER_TYPED_PRIVACY_METADATA_UNRESOLVED');
  }

  if (!typeCounts || typeof typeCounts !== 'object' || Array.isArray(typeCounts)) {
    throw new Error('BLOCKER_TYPED_PRIVACY_METADATA_UNRESOLVED');
  }

  const expectedKeys = ['blank', 'boolean', 'date', 'number', 'string'];
  const actualKeys = Object.keys(typeCounts).sort();

  if (actualKeys.length !== expectedKeys.length || JSON.stringify(actualKeys) !== JSON.stringify(expectedKeys)) {
    throw new Error('BLOCKER_TYPED_PRIVACY_METADATA_UNRESOLVED');
  }

  for (const key of expectedKeys) {
    const countVal = typeCounts[key];
    if (typeof countVal !== 'number' || !Number.isInteger(countVal) || countVal < 0) {
      throw new Error('BLOCKER_TYPED_PRIVACY_METADATA_UNRESOLVED');
    }
  }

  const sortedMetaAddrs = metadata.map(m => m.address).sort();
  const sortedExpectedAddrs = [...expectedAddresses].sort();

  if (JSON.stringify(sortedMetaAddrs) !== JSON.stringify(sortedExpectedAddrs)) {
    throw new Error('BLOCKER_TYPED_PRIVACY_METADATA_UNRESOLVED');
  }

  const derivedCounts = { string: 0, number: 0, date: 0, boolean: 0, blank: 0 };
  const seen = new Set();

  for (const rec of metadata) {
    if (!rec || typeof rec !== 'object') {
      throw new Error('BLOCKER_TYPED_PRIVACY_METADATA_UNRESOLVED');
    }
    if (seen.has(rec.address)) {
      throw new Error('BLOCKER_TYPED_PRIVACY_METADATA_UNRESOLVED');
    }
    seen.add(rec.address);

    if (!['string', 'number', 'date', 'boolean', 'blank'].includes(rec.normalizedType)) {
      throw new Error('BLOCKER_TYPED_PRIVACY_METADATA_UNRESOLVED');
    }

    if (typeof rec.nonblank !== 'boolean') {
      throw new Error('BLOCKER_TYPED_PRIVACY_METADATA_UNRESOLVED');
    }

    if (rec.normalizedType === 'blank') {
      if (rec.nonblank !== false || rec.hash !== null) {
        throw new Error('BLOCKER_TYPED_PRIVACY_METADATA_UNRESOLVED');
      }
    } else {
      if (rec.nonblank !== true) {
        throw new Error('BLOCKER_TYPED_PRIVACY_METADATA_UNRESOLVED');
      }
      if (rec.normalizedType === 'string') {
        if (!rec.hash || typeof rec.hash !== 'string' || !/^[0-9a-f]{64}$/.test(rec.hash)) {
          throw new Error('BLOCKER_TYPED_PRIVACY_METADATA_UNRESOLVED');
        }
      } else {
        if (rec.hash !== null) {
          throw new Error('BLOCKER_TYPED_PRIVACY_METADATA_UNRESOLVED');
        }
      }
    }

    derivedCounts[rec.normalizedType]++;
  }

  for (const type of expectedKeys) {
    if (derivedCounts[type] !== typeCounts[type]) {
      throw new Error('BLOCKER_TYPED_PRIVACY_METADATA_UNRESOLVED');
    }
  }

  return true;
}

export async function getHeaderCellFingerprints(buf, partKey) {
  const wb = await XlsxPopulate.fromDataAsync(buf);
  const sheet = wb.sheet(0);
  const sheetXml = await wb._zip.files['xl/worksheets/sheet1.xml'].async('string');

  const merges = [...sheetXml.matchAll(/<mergeCell ref="([A-Z0-9:]+)"\/>/g)].map(m => m[1]);

  function getMergeRef(addr) {
    for (const ref of merges) {
      if (ref.includes(':')) {
        const addrs = expandRangeToAddresses(ref);
        if (addrs.includes(addr)) return ref;
      } else if (ref === addr) {
        return ref;
      }
    }
    return null;
  }

  function getStyleId(addr) {
    const m = sheetXml.match(new RegExp(`<c r="${addr}"[^>]*s="(\\d+)"`));
    return m ? m[1] : '0';
  }

  const titleAddrsA = expandRangeToAddresses('B6:M7').concat(expandRangeToAddresses('Z6:AF6'), expandRangeToAddresses('AG6:AL6'), expandRangeToAddresses('AM6:AP6'), expandRangeToAddresses('AQ6:AS6'), expandRangeToAddresses('AT6:BC6'), expandRangeToAddresses('BD6:BI6'));
  const valueAddrsA = expandRangeToAddresses('N6:Q7').concat(expandRangeToAddresses('Z7:AF7'), expandRangeToAddresses('AG7:AL7'), expandRangeToAddresses('AM7:AP7'), expandRangeToAddresses('AQ7:AS7'), expandRangeToAddresses('AT7:BC7'), expandRangeToAddresses('BD7:BI7'));

  const titleAddrsB = expandRangeToAddresses('B2:F3').concat(expandRangeToAddresses('J2:L2'), expandRangeToAddresses('M2:O2'), expandRangeToAddresses('P2:Q2'), ['R2'], expandRangeToAddresses('S2:W2'));
  const valueAddrsB = expandRangeToAddresses('G2:H3').concat(expandRangeToAddresses('J3:L3'), expandRangeToAddresses('M3:O3'), expandRangeToAddresses('P3:Q3'), ['R3'], expandRangeToAddresses('S3:W3'));

  const targetTitleAddrs = partKey === 'A' ? titleAddrsA : titleAddrsB;
  const targetValueAddrs = partKey === 'A' ? valueAddrsA : valueAddrsB;
  const boundedRows = partKey === 'A' ? [6, 7] : [2, 3];
  const maxCol = partKey === 'A' ? 61 : 24;

  function getCellTypeAndHash(val) {
    if (val === null || val === undefined) {
      return { normalizedType: 'blank', valHash: null };
    } else if (typeof val === 'number') {
      return { normalizedType: 'number', valHash: null };
    } else if (typeof val === 'boolean') {
      return { normalizedType: 'boolean', valHash: null };
    } else if (val instanceof Date) {
      return { normalizedType: 'date', valHash: null };
    } else {
      const strVal = String(val || '').replaceAll('\r\n', '\n');
      if (strVal === '') {
        return { normalizedType: 'blank', valHash: null };
      }
      return {
        normalizedType: 'string',
        valHash: crypto.createHash('sha256').update(strVal).digest('hex')
      };
    }
  }

  const titleFingerprints = {};
  for (const addr of targetTitleAddrs) {
    const val = sheet.cell(addr).value();
    const { normalizedType, valHash } = getCellTypeAndHash(val);
    const mergeRef = getMergeRef(addr);
    const styleId = getStyleId(addr);
    titleFingerprints[addr] = { address: addr, normalizedType, valHash, styleId, mergeRef };
  }

  const valueFingerprints = {};
  for (const addr of targetValueAddrs) {
    const val = sheet.cell(addr).value();
    const { normalizedType, valHash } = getCellTypeAndHash(val);
    const mergeRef = getMergeRef(addr);
    const styleId = getStyleId(addr);
    valueFingerprints[addr] = { address: addr, normalizedType, valHash, styleId, mergeRef };
  }

  const valueSet = new Set(targetValueAddrs);
  const titleSet = new Set(targetTitleAddrs);
  const unrelatedFingerprints = {};

  for (const r of boundedRows) {
    for (let c = 1; c <= maxCol; c++) {
      const addr = `${idxToCol(c)}${r}`;
      if (!valueSet.has(addr) && !titleSet.has(addr)) {
        const val = sheet.cell(addr).value();
        const { normalizedType, valHash } = getCellTypeAndHash(val);
        const mergeRef = getMergeRef(addr);
        const styleId = getStyleId(addr);
        unrelatedFingerprints[addr] = { address: addr, normalizedType, valHash, styleId, mergeRef };
      }
    }
  }

  return { titleFingerprints, valueFingerprints, unrelatedFingerprints, merges };
}

export async function validateHeaderFingerprintParity(observedBufOrFingerprints, partKey, fingerprintsOverride = null) {
  try {
    const found = findLocalSourceTemplates();
    if (!found) throw new Error('BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE');

    const sourceFile = partKey === 'A' ? found.partA : found.partB;
    const expectedSha = partKey === 'A' ? EXPECTED_PART_A_SHA : EXPECTED_PART_B_SHA;
    const sourceBuf = fs.readFileSync(sourceFile);
    const sourceSha = crypto.createHash('sha256').update(sourceBuf).digest('hex');
    if (sourceSha !== expectedSha) {
      throw new Error('BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE');
    }

    const authFingerprints = await getHeaderCellFingerprints(sourceBuf, partKey);

    let obsFingerprints = null;
    if (fingerprintsOverride) {
      obsFingerprints = fingerprintsOverride;
    } else if (observedBufOrFingerprints && typeof observedBufOrFingerprints === 'object' && observedBufOrFingerprints.titleFingerprints) {
      obsFingerprints = observedBufOrFingerprints;
    } else if (Buffer.isBuffer(observedBufOrFingerprints)) {
      obsFingerprints = await getHeaderCellFingerprints(observedBufOrFingerprints, partKey);
    } else {
      throw new Error('BLOCKER_HEADER_FINGERPRINT_PARITY_UNRESOLVED');
    }

    if (!obsFingerprints || !obsFingerprints.titleFingerprints || !obsFingerprints.valueFingerprints || !obsFingerprints.unrelatedFingerprints) {
      throw new Error('BLOCKER_HEADER_FINGERPRINT_PARITY_UNRESOLVED');
    }

    // 1. Validate exact address-set keys
    const authTitleAddrs = Object.keys(authFingerprints.titleFingerprints).sort();
    const obsTitleAddrs = Object.keys(obsFingerprints.titleFingerprints).sort();
    if (JSON.stringify(authTitleAddrs) !== JSON.stringify(obsTitleAddrs)) {
      throw new Error('BLOCKER_HEADER_FINGERPRINT_PARITY_UNRESOLVED');
    }

    const authValueAddrs = Object.keys(authFingerprints.valueFingerprints).sort();
    const obsValueAddrs = Object.keys(obsFingerprints.valueFingerprints).sort();
    if (JSON.stringify(authValueAddrs) !== JSON.stringify(obsValueAddrs)) {
      throw new Error('BLOCKER_HEADER_FINGERPRINT_PARITY_UNRESOLVED');
    }

    const authUnrelatedAddrs = Object.keys(authFingerprints.unrelatedFingerprints).sort();
    const obsUnrelatedAddrs = Object.keys(obsFingerprints.unrelatedFingerprints).sort();
    if (JSON.stringify(authUnrelatedAddrs) !== JSON.stringify(obsUnrelatedAddrs)) {
      throw new Error('BLOCKER_HEADER_FINGERPRINT_PARITY_UNRESOLVED');
    }

    // 2. Validate Protected Static Title / Label Fingerprints
    for (const addr of authTitleAddrs) {
      const authRec = authFingerprints.titleFingerprints[addr];
      const obsRec = obsFingerprints.titleFingerprints[addr];

      if (!obsRec || obsRec.styleId !== authRec.styleId || obsRec.mergeRef !== authRec.mergeRef) {
        throw new Error('BLOCKER_HEADER_FINGERPRINT_PARITY_UNRESOLVED');
      }
      if (obsRec.normalizedType !== authRec.normalizedType || obsRec.valHash !== authRec.valHash) {
        throw new Error('BLOCKER_HEADER_FINGERPRINT_PARITY_UNRESOLVED');
      }
    }

    // 3. Validate Dynamic Value Fingerprints (must be blank after sanitization, no sample valHash preserved)
    for (const addr of authValueAddrs) {
      const authRec = authFingerprints.valueFingerprints[addr];
      const obsRec = obsFingerprints.valueFingerprints[addr];

      if (!obsRec || obsRec.styleId !== authRec.styleId || obsRec.mergeRef !== authRec.mergeRef) {
        throw new Error('BLOCKER_HEADER_FINGERPRINT_PARITY_UNRESOLVED');
      }
      if (obsRec.normalizedType !== 'blank' || obsRec.valHash !== null) {
        throw new Error('BLOCKER_HEADER_FINGERPRINT_PARITY_UNRESOLVED');
      }
    }

    // 4. Validate Unrelated Header Cell Fingerprints
    for (const addr of authUnrelatedAddrs) {
      const authRec = authFingerprints.unrelatedFingerprints[addr];
      const obsRec = obsFingerprints.unrelatedFingerprints[addr];

      if (!obsRec || obsRec.styleId !== authRec.styleId || obsRec.mergeRef !== authRec.mergeRef) {
        throw new Error('BLOCKER_HEADER_FINGERPRINT_PARITY_UNRESOLVED');
      }
      if (obsRec.normalizedType !== authRec.normalizedType || obsRec.valHash !== authRec.valHash) {
        throw new Error('BLOCKER_HEADER_FINGERPRINT_PARITY_UNRESOLVED');
      }
    }

    return true;
  } catch (err) {
    if (err.message === 'BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE') throw err;
    throw new Error('BLOCKER_HEADER_FINGERPRINT_PARITY_UNRESOLVED');
  }
}

export async function getWorkbookFingerprint(buf) {
  const wb = await XlsxPopulate.fromDataAsync(buf);
  const workbookXml = await wb._zip.files['xl/workbook.xml'].async('string');
  const workbookRelsXml = wb._zip.files['xl/_rels/workbook.xml.rels']
    ? await wb._zip.files['xl/_rels/workbook.xml.rels'].async('string')
    : '';

  const sheetRelMap = {};
  const relMatches = [...workbookRelsXml.matchAll(/<Relationship Id="([^"]+)" Type="[^"]*" Target="([^"]+)"/g)];
  for (const m of relMatches) {
    let target = m[2];
    if (!target.startsWith('xl/')) {
      target = 'xl/' + target.replace(/^\//, '');
    }
    sheetRelMap[m[1]] = target;
  }

  const sheetMatchesAlt = [...workbookXml.matchAll(/<sheet [^>]*name="([^"]+)"[^>]*>/g)];

  const sheetNames = [];
  const sheetStates = [];
  const sheets = {};

  for (const sm of sheetMatchesAlt) {
    const sTag = sm[0];
    const rawName = sTag.match(/name="([^"]+)"/)?.[1];
    const name = rawName ? rawName.replaceAll('&amp;', '&') : '';
    const state = sTag.match(/state="([^"]+)"/)?.[1] || 'visible';
    const rId = sTag.match(/r:id="([^"]+)"/)?.[1];
    if (name) {
      sheetNames.push(name);
      sheetStates.push({ name, state });
      const fileName = sheetRelMap[rId] || `xl/worksheets/sheet${sheetNames.length}.xml`;

      const sheetFile = wb._zip.files[fileName];
      let sheetXml = '';
      if (sheetFile) {
        sheetXml = await sheetFile.async('string');
      }

      const rawMerges = [...sheetXml.matchAll(/<mergeCell [^>]*ref="([A-Z0-9:]+)"\/>/g)].map(m => m[1]).sort();
      const mergeCountAttr = sheetXml.match(/<mergeCells count="(\d+)">/)?.[1] || String(rawMerges.length);
      const dimension = sheetXml.match(/<dimension [^>]*\/>/)?.[0] || '';

      const colsXml = sheetXml.match(/<cols>[\s\S]*?<\/cols>/)?.[0] || '';
      const colsHash = crypto.createHash('sha256').update(colsXml).digest('hex');

      const rowHeights = [...sheetXml.matchAll(/<row r="(\d+)"[^>]*ht="([^"]+)"/g)].map(m => `R${m[1]}:${m[2]}`);
      const rowHeightsHash = crypto.createHash('sha256').update(rowHeights.join(',')).digest('hex');

      const showGridLinesMatch = sheetXml.match(/showGridLines="(\d+)"/);
      const showGridLines = showGridLinesMatch ? showGridLinesMatch[1] : '1';

      const pageMarginsMatch = sheetXml.match(/<pageMargins [^>]*\/>/)?.[0] || '';
      const pageMargins = crypto.createHash('sha256').update(pageMarginsMatch).digest('hex');

      const paperSize = sheetXml.match(/paperSize="(\d+)"/)?.[1] || '';
      const orientation = sheetXml.match(/orientation="([^"]+)"/)?.[1] || '';
      const scale = sheetXml.match(/scale="(\d+)"/)?.[1] || '';
      const fitToPage = sheetXml.includes('fitToPage="1"');

      const horizontalCentered = sheetXml.includes('horizontalCentered="1"');
      const verticalCentered = sheetXml.includes('verticalCentered="1"');
      const sheetProtection = sheetXml.match(/<sheetProtection [^>]*\/>/)?.[0] || (sheetXml.includes('sheetProtection') ? 'protected' : 'none');

      let printArea = '';
      const paMatch = workbookXml.match(new RegExp(`<definedName name="_xlnm\\.Print_Area"[^>]*localSheetId="${sheets[name] ? Object.keys(sheets).length - 1 : 0}"[^>]*>([^<]+)<\\/definedName>`)) || workbookXml.match(/<definedName name="_xlnm\.Print_Area"[^>]*>([^<]+)<\/definedName>/);
      if (paMatch) {
        printArea = paMatch[1].replaceAll('&amp;', '&');
      }

      const sheetRelsPath = fileName.replace('xl/worksheets/', 'xl/worksheets/_rels/') + '.rels';
      const sheetRels = [];
      if (wb._zip.files[sheetRelsPath]) {
        const sRelsXml = await wb._zip.files[sheetRelsPath].async('string');
        const matches = [...sRelsXml.matchAll(/<Relationship Id="([^"]+)" Type="[^"]*" Target="([^"]+)"/g)];
        for (const m of matches) {
          sheetRels.push(`${m[1]}->${m[2]}`);
        }
        sheetRels.sort();
      }

      sheets[name] = {
        sheetName: name,
        sheetFileName: fileName,
        dimension,
        rawMerges,
        rawMergeCount: rawMerges.length,
        mergeCountAttr,
        colsHash,
        rowHeightsHash,
        showGridLines,
        pageMargins,
        paperSize,
        orientation,
        scale,
        fitToPage,
        horizontalCentered,
        verticalCentered,
        sheetProtection,
        printArea,
        sheetRels
      };
    }
  }

  const definedNames = [...workbookXml.matchAll(/<definedName [^>]*>([^<]+)<\/definedName>/g)].map(m => m[0]).sort();

  const relTuples = [];
  for (const fileName in wb._zip.files) {
    if (fileName.endsWith('.rels')) {
      const relXml = await wb._zip.files[fileName].async('string');
      const matches = [...relXml.matchAll(/<Relationship Id="([^"]+)" Type="[^"]*" Target="([^"]+)"/g)];
      for (const m of matches) {
        relTuples.push(`${fileName}:${m[1]}->${m[2]}`);
      }
    }
  }
  relTuples.sort();

  const mediaFiles = [];
  for (const fileName in wb._zip.files) {
    if (fileName.startsWith('xl/media/')) {
      const mediaBuf = await wb._zip.files[fileName].async('nodebuffer');
      const mediaHash = crypto.createHash('sha256').update(mediaBuf).digest('hex');
      mediaFiles.push(`${fileName}:${mediaHash}`);
    }
  }
  mediaFiles.sort();

  const mainSheet = sheets[sheetNames[0]] || {};

  return {
    sheetNames,
    sheetStates,
    definedNames,
    sheets,
    rawMergeCount: mainSheet.rawMergeCount || 0,
    mergeCountAttr: mainSheet.mergeCountAttr || '0',
    rawMerges: mainSheet.rawMerges || [],
    dimension: mainSheet.dimension || '',
    colsHash: mainSheet.colsHash || '',
    rowHeightsHash: mainSheet.rowHeightsHash || '',
    printArea: mainSheet.printArea || '',
    paperSize: mainSheet.paperSize || '',
    orientation: mainSheet.orientation || '',
    scale: mainSheet.scale || '',
    horizontalCentered: mainSheet.horizontalCentered || false,
    sheetProtection: Boolean(mainSheet.sheetProtection && mainSheet.sheetProtection !== 'none'),
    relTuples,
    mediaFiles
  };
}

export async function validateWorkbookParity(observedBufOrFingerprint, partKey, fingerprintOverride = null) {
  try {
    const found = findLocalSourceTemplates();
    if (!found) throw new Error('BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE');

    const sourceFile = partKey === 'A' ? found.partA : found.partB;
    const expectedSha = partKey === 'A' ? EXPECTED_PART_A_SHA : EXPECTED_PART_B_SHA;
    const sourceBuf = fs.readFileSync(sourceFile);
    const sourceSha = crypto.createHash('sha256').update(sourceBuf).digest('hex');
    if (sourceSha !== expectedSha) {
      throw new Error('BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE');
    }

    const authFp = await getWorkbookFingerprint(sourceBuf);

    let obsFp = null;
    if (fingerprintOverride) {
      obsFp = fingerprintOverride;
    } else if (observedBufOrFingerprint && typeof observedBufOrFingerprint === 'object' && observedBufOrFingerprint.sheetNames && observedBufOrFingerprint.sheets) {
      obsFp = observedBufOrFingerprint;
    } else if (Buffer.isBuffer(observedBufOrFingerprint)) {
      obsFp = await getWorkbookFingerprint(observedBufOrFingerprint);
    } else {
      throw new Error('BLOCKER_WORKBOOK_PARITY_UNRESOLVED');
    }

    if (!obsFp || !Array.isArray(obsFp.sheetNames) || !obsFp.sheets) {
      throw new Error('BLOCKER_WORKBOOK_PARITY_UNRESOLVED');
    }

    // 1. Workbook Level Validation
    if (JSON.stringify(obsFp.sheetNames) !== JSON.stringify(authFp.sheetNames)) {
      throw new Error('BLOCKER_WORKBOOK_PARITY_UNRESOLVED');
    }

    if (JSON.stringify(obsFp.sheetStates) !== JSON.stringify(authFp.sheetStates)) {
      throw new Error('BLOCKER_WORKBOOK_PARITY_UNRESOLVED');
    }

    if (JSON.stringify(obsFp.definedNames) !== JSON.stringify(authFp.definedNames)) {
      throw new Error('BLOCKER_WORKBOOK_PARITY_UNRESOLVED');
    }

    if (JSON.stringify(obsFp.relTuples) !== JSON.stringify(authFp.relTuples)) {
      throw new Error('BLOCKER_WORKBOOK_PARITY_UNRESOLVED');
    }

    // 2. Per-Worksheet Validation for EVERY sheet
    for (const name of authFp.sheetNames) {
      const authSheet = authFp.sheets[name];
      const obsSheet = obsFp.sheets[name];

      if (!authSheet || !obsSheet) {
        throw new Error('BLOCKER_WORKBOOK_PARITY_UNRESOLVED');
      }

      if (obsSheet.dimension && authSheet.dimension && obsSheet.dimension !== authSheet.dimension) {
        throw new Error('BLOCKER_WORKBOOK_PARITY_UNRESOLVED');
      }
      if (obsSheet.rawMergeCount !== authSheet.rawMergeCount) {
        throw new Error('BLOCKER_WORKBOOK_PARITY_UNRESOLVED');
      }
      if (obsSheet.mergeCountAttr !== authSheet.mergeCountAttr) {
        throw new Error('BLOCKER_WORKBOOK_PARITY_UNRESOLVED');
      }
      if (JSON.stringify(obsSheet.rawMerges) !== JSON.stringify(authSheet.rawMerges)) {
        throw new Error('BLOCKER_WORKBOOK_PARITY_UNRESOLVED');
      }
      if (obsSheet.colsHash !== authSheet.colsHash) {
        throw new Error('BLOCKER_WORKBOOK_PARITY_UNRESOLVED');
      }
      if (obsSheet.rowHeightsHash !== authSheet.rowHeightsHash) {
        throw new Error('BLOCKER_WORKBOOK_PARITY_UNRESOLVED');
      }
      if (obsSheet.showGridLines !== authSheet.showGridLines) {
        throw new Error('BLOCKER_WORKBOOK_PARITY_UNRESOLVED');
      }
      if (obsSheet.pageMargins !== authSheet.pageMargins) {
        throw new Error('BLOCKER_WORKBOOK_PARITY_UNRESOLVED');
      }
      if (obsSheet.paperSize !== authSheet.paperSize) {
        throw new Error('BLOCKER_WORKBOOK_PARITY_UNRESOLVED');
      }
      if (obsSheet.orientation !== authSheet.orientation) {
        throw new Error('BLOCKER_WORKBOOK_PARITY_UNRESOLVED');
      }
      if (obsSheet.scale !== authSheet.scale) {
        throw new Error('BLOCKER_WORKBOOK_PARITY_UNRESOLVED');
      }
      if (obsSheet.fitToPage !== authSheet.fitToPage) {
        throw new Error('BLOCKER_WORKBOOK_PARITY_UNRESOLVED');
      }
      if (obsSheet.horizontalCentered !== authSheet.horizontalCentered) {
        throw new Error('BLOCKER_WORKBOOK_PARITY_UNRESOLVED');
      }
      if (obsSheet.verticalCentered !== authSheet.verticalCentered) {
        throw new Error('BLOCKER_WORKBOOK_PARITY_UNRESOLVED');
      }
      if (obsSheet.sheetProtection !== authSheet.sheetProtection) {
        throw new Error('BLOCKER_WORKBOOK_PARITY_UNRESOLVED');
      }
      if (obsSheet.printArea !== authSheet.printArea) {
        throw new Error('BLOCKER_WORKBOOK_PARITY_UNRESOLVED');
      }
      if (JSON.stringify(obsSheet.sheetRels) !== JSON.stringify(authSheet.sheetRels)) {
        throw new Error('BLOCKER_WORKBOOK_PARITY_UNRESOLVED');
      }
    }

    return true;
  } catch (err) {
    if (err.message === 'BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE') throw err;
    throw new Error('BLOCKER_WORKBOOK_PARITY_UNRESOLVED');
  }
}

export async function inspectRawWorksheetOOXML(buf) {
  const wb = await XlsxPopulate.fromDataAsync(buf);
  const sheetXml = await wb._zip.files['xl/worksheets/sheet1.xml'].async('string');
  const workbookXml = await wb._zip.files['xl/workbook.xml'].async('string');

  const rowMatches = [...sheetXml.matchAll(/<row r="(\d+)"([^>]*)>/g)];
  const rowRefs = rowMatches.map(m => parseInt(m[1], 10)).sort((a, b) => a - b);

  const cellRefs = {};
  const stylePattern = {};
  const rowHeights = {};

  for (const m of rowMatches) {
    const r = parseInt(m[1], 10);
    const rowAttr = m[2];
    const htMatch = rowAttr.match(/ht="([^"]+)"/);
    const customHtMatch = rowAttr.match(/customHeight="([^"]+)"/);
    rowHeights[r] = { ht: htMatch ? htMatch[1] : null, customHeight: customHtMatch ? customHtMatch[1] : null };

    // Extract row XML block to parse cells
    const rowBlockMatch = sheetXml.match(new RegExp(`<row r="${r}"[^>]*>[\\s\\S]*?<\\/row>`));
    if (rowBlockMatch) {
      const rowXml = rowBlockMatch[0];
      const cells = [...rowXml.matchAll(/<c r="([A-Z]+\d+)"([^>]*)>/g)];
      cellRefs[r] = cells.map(c => c[1]);
      stylePattern[r] = cells.map(c => {
        const sMatch = c[2].match(/s="(\d+)"/);
        return sMatch ? sMatch[1] : '0';
      });
    }
  }

  const rawMerges = [...sheetXml.matchAll(/<mergeCell ref="([A-Z0-9:]+)"\/>/g)].map(m => m[1]).sort();
  const mergeCountAttr = sheetXml.match(/<mergeCells count="(\d+)">/)?.[1] || String(rawMerges.length);

  const dimension = sheetXml.match(/<dimension [^>]*\/>/)?.[0] || '';
  let printArea = workbookXml.match(/<definedName name="_xlnm\.Print_Area"[^>]*>([^<]+)<\/definedName>/)?.[1] || '';
  printArea = printArea.replaceAll('&amp;', '&');

  const paperSize = sheetXml.match(/paperSize="(\d+)"/)?.[1] || '';
  const orientation = sheetXml.match(/orientation="([^"]+)"/)?.[1] || '';
  const scale = sheetXml.match(/scale="(\d+)"/)?.[1] || '';
  const horizontalCentered = sheetXml.includes('horizontalCentered="1"');
  const sheetProtection = sheetXml.includes('<sheetProtection') || sheetXml.includes('sheetProtection');

  return {
    rowRefs,
    cellRefs,
    stylePattern,
    rowHeights,
    rawMerges,
    mergeCountAttr,
    dimension,
    printArea,
    pageSetup: { paperSize, orientation, scale },
    horizontalCentered,
    sheetProtection
  };
}

export async function getWorksheetFormulaSet(buf) {
  const wb = await XlsxPopulate.fromDataAsync(buf);
  const formulaSet = new Set();
  for (const fileName in wb._zip.files) {
    if (fileName.startsWith('xl/worksheets/') && fileName.endsWith('.xml')) {
      const xml = await wb._zip.files[fileName].async('string');
      const matches = [...xml.matchAll(/<c r="([A-Z0-9]+)"[^>]*>[\s\S]*?<f(?:\s|>)([^<]*)/g)];
      for (const m of matches) {
        const cellAddr = m[1];
        const fNode = m[2];
        const nodeHash = crypto.createHash('sha256').update(fNode).digest('hex');
        formulaSet.add(`${fileName}:${cellAddr}:${nodeHash}`);
      }
    }
  }
  return formulaSet;
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

export async function getSanitizedDisposableBuffers() {
  const found = findLocalSourceTemplates();
  if (!found) throw new Error('BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE');

  // Typed value collection in memory without logging source strings
  const wbA_orig = await XlsxPopulate.fromDataAsync(fs.readFileSync(found.partA));
  const sheetA_orig = wbA_orig.sheet(0);
  const titleAddrsA = expandRangeToAddresses('B6:M7').concat(expandRangeToAddresses('Z6:AF6'), expandRangeToAddresses('AG6:AL6'), expandRangeToAddresses('AM6:AP6'), expandRangeToAddresses('AQ6:AS6'), expandRangeToAddresses('AT6:BC6'), expandRangeToAddresses('BD6:BI6'));
  const protectedHeaderTextsA = new Set();
  for (const a of titleAddrsA) {
    const txt = String(sheetA_orig.cell(a).value() || '').trim();
    if (txt) {
      txt.split(/\s+/).forEach(word => { if (word.length >= 2) protectedHeaderTextsA.add(word); });
      protectedHeaderTextsA.add(txt);
    }
  }

  const collectedSensitiveA = [];
  for (const addr of SENSITIVE_RANGES_A) {
    const v = sheetA_orig.cell(addr).value();
    if (v && typeof v === 'string' && v.trim().length >= 3 && !protectedHeaderTextsA.has(v.trim())) {
      collectedSensitiveA.push(v.trim());
    }
  }

  const wbB_orig = await XlsxPopulate.fromDataAsync(fs.readFileSync(found.partB));
  const sheetB_orig = wbB_orig.sheet(0);
  const titleAddrsB = expandRangeToAddresses('B2:F3').concat(expandRangeToAddresses('J2:L2'), expandRangeToAddresses('M2:O2'), expandRangeToAddresses('P2:Q2'), ['R2'], expandRangeToAddresses('S2:W2'));
  const protectedHeaderTextsB = new Set();
  for (const a of titleAddrsB) {
    const txt = String(sheetB_orig.cell(a).value() || '').trim();
    if (txt) {
      txt.split(/\s+/).forEach(word => { if (word.length >= 2) protectedHeaderTextsB.add(word); });
      protectedHeaderTextsB.add(txt);
    }
  }

  const collectedSensitiveB = [];
  for (const addr of SENSITIVE_RANGES_B) {
    const v = sheetB_orig.cell(addr).value();
    if (v && typeof v === 'string' && v.trim().length >= 3 && !protectedHeaderTextsB.has(v.trim())) {
      collectedSensitiveB.push(v.trim());
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

  return { bufA, bufB, sensitiveA: collectedSensitiveA, sensitiveB: collectedSensitiveB };
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
