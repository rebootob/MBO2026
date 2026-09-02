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

export async function buildPartBSourceEvidenceInventory(bufOverride = null, expectedMaxRow = 34) {
  const found = findLocalSourceTemplates();
  if (!found) throw new Error('BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE');

  const bufB = bufOverride || fs.readFileSync(found.partB);
  if (!bufOverride) {
    const shaB = crypto.createHash('sha256').update(bufB).digest('hex');
    if (shaB !== EXPECTED_PART_B_SHA) {
      throw new Error('BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE');
    }
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
  for (let r = 2; r <= expectedMaxRow; r++) {
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

function relocateMergeRef(ref, rowOffset, isClonedRow = false) {
  if (!ref) return null;
  if (rowOffset === 0) return ref;
  if (ref.includes(':')) {
    const [start, end] = ref.split(':');
    const startCol = start.match(/^[A-Z]+/)[0];
    const startRow = parseInt(start.match(/\d+/)[0], 10);
    const endCol = end.match(/^[A-Z]+/)[0];
    const endRow = parseInt(end.match(/\d+/)[0], 10);
    if (isClonedRow && startRow < 27) {
      return null;
    }
    return `${startCol}${startRow + rowOffset}:${endCol}${endRow + rowOffset}`;
  } else {
    const col = ref.match(/^[A-Z]+/)[0];
    const row = parseInt(ref.match(/\d+/)[0], 10);
    return `${col}${row + rowOffset}`;
  }
}

export async function resolvePartBPrivacyRoles(inventoryOverride = null, competencyCount = 6, bufOverride = null, isPresentationOverlay = false) {
  const n = competencyCount || 6;
  if (![6, 7, 8].includes(n)) {
    throw new Error('BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED');
  }

  const extraBlocks = n - 6;
  const extraRows = 4 * extraBlocks;
  const maxRow = 34 + extraRows;

  let observedInventory;
  if (inventoryOverride) {
    observedInventory = inventoryOverride;
  } else if (bufOverride || n !== 6) {
    let bufToUse = bufOverride;
    if (!bufToUse) {
      const buffersObj = await getStructuralPartBBuffers();
      bufToUse = buffersObj.buffers ? buffersObj.buffers[n] : (n === 6 ? buffersObj.bufB6 : (n === 7 ? buffersObj.bufB7 : buffersObj.bufB8));
    }
    observedInventory = await buildPartBSourceEvidenceInventory(bufToUse, maxRow);
  } else {
    observedInventory = await buildPartBSourceEvidenceInventory();
  }

  const authSourceInventory = await buildPartBSourceEvidenceInventory();

  const classificationMap = {};
  const dynamicAddresses = [];
  const protectedStaticAddresses = [];

  const cols = ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X'];

  for (let r = 2; r <= maxRow; r++) {
    let sourceRow;
    let rowOffset = 0;

    if (r <= 30) {
      sourceRow = r;
      rowOffset = 0;
    } else if (r >= 31 && r <= 30 + extraRows) {
      const blockRow = (r - 31) % 4;
      sourceRow = 27 + blockRow;
      rowOffset = r - sourceRow;
    } else if (r >= 31 + extraRows && r <= 34 + extraRows) {
      sourceRow = r - extraRows;
      rowOffset = extraRows;
    } else {
      throw new Error('BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED');
    }

    for (const cStr of cols) {
      const addr = `${cStr}${r}`;
      const authAddr = `${cStr}${sourceRow}`;
      const authEv = authSourceInventory[authAddr];
      const ev = observedInventory[addr];

      if (!ev || !ev.address || ev.styleId === undefined || !ev.normalizedType) {
        throw new Error('BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED');
      }

      if (!['string', 'number', 'date', 'boolean', 'blank'].includes(ev.normalizedType)) {
        throw new Error('BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED');
      }

      if (!authEv) {
        throw new Error('BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED');
      }

      if (ev.styleId !== authEv.styleId) {
        throw new Error('BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED');
      }

      const isOverlayCell = isPresentationOverlay && (
        (n >= 7 && (r === 31 || r === 32)) ||
        (n === 8 && (r === 35 || r === 36))
      ) && ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].includes(cStr);

      if (!isOverlayCell) {
        if (ev.normalizedType !== authEv.normalizedType) {
          throw new Error('BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED');
        }

        if (ev.nonblank !== authEv.nonblank) {
          throw new Error('BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED');
        }
      }

      const isClonedRow = r > 30 && r <= 30 + extraRows;
      let expectedMergeRef = relocateMergeRef(authEv.mergeRef, rowOffset, isClonedRow);
      if (isPresentationOverlay) {
        if (n >= 7 && r === 31 && ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].includes(cStr)) {
          expectedMergeRef = 'B31:J31';
        } else if (n === 8 && r === 35 && ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].includes(cStr)) {
          expectedMergeRef = 'B35:J35';
        }
      }
      if (ev.mergeRef !== expectedMergeRef) {
        throw new Error('BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED');
      }

      let isDynamic = false;
      let classification = null;
      let roleJustification = null;

      if (sourceRow === 2 || sourceRow === 3) {
        if (['B', 'C', 'D', 'E', 'F'].includes(cStr)) {
          classification = 'PROTECTED_STATIC_TITLE';
          roleJustification = 'Static sheet title';
          isDynamic = false;
        } else if (['G', 'H'].includes(cStr)) {
          classification = 'HEADER_VALUE';
          roleJustification = 'Dynamic fiscal year header input field';
          isDynamic = true;
        } else if (['J', 'K', 'L'].includes(cStr)) {
          if (r === 2) {
            classification = 'PROTECTED_STATIC_HEADER_LABEL';
            roleJustification = 'Static department header label';
            isDynamic = false;
          } else {
            classification = 'HEADER_VALUE';
            roleJustification = 'Dynamic department header value';
            isDynamic = true;
          }
        } else if (['M', 'N', 'O'].includes(cStr)) {
          if (r === 2) {
            classification = 'PROTECTED_STATIC_HEADER_LABEL';
            roleJustification = 'Static section header label';
            isDynamic = false;
          } else {
            classification = 'HEADER_VALUE';
            roleJustification = 'Dynamic section header value';
            isDynamic = true;
          }
        } else if (['P', 'Q'].includes(cStr)) {
          if (r === 2) {
            classification = 'PROTECTED_STATIC_HEADER_LABEL';
            roleJustification = 'Static position header label';
            isDynamic = false;
          } else {
            classification = 'HEADER_VALUE';
            roleJustification = 'Dynamic position header value';
            isDynamic = true;
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
          } else {
            classification = 'HEADER_VALUE';
            roleJustification = 'Dynamic employee name header value';
            isDynamic = true;
          }
        } else if (cStr === 'X' || cStr === 'I') {
          classification = 'PROTECTED_STATIC_HEADER_UNTOUCHED';
          roleJustification = 'Static header padding cell';
          isDynamic = false;
        }
      } else if (sourceRow === 4 || sourceRow === 5 || sourceRow === 6) {
        classification = 'PROTECTED_STATIC_HEADER_UNTOUCHED';
        roleJustification = 'Static sheet padding/separator row';
        isDynamic = false;
      } else if (sourceRow >= 7 && sourceRow <= 29) {
        if (['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].includes(cStr)) {
          const isOverlayCell = isPresentationOverlay && (
            (n >= 7 && (r === 31 || r === 32)) ||
            (n === 8 && (r === 35 || r === 36))
          );
          if (isOverlayCell) {
            classification = 'EXPANDED_COMPETENCY_PRESENTATION_VALUE';
            roleJustification = 'Dynamic expanded competency title and description presentation write target';
            isDynamic = true;
          } else {
            classification = 'PROTECTED_STATIC_COMPETENCY_TEXT';
            roleJustification = 'Static competency name, description, or rating guidance text';
            isDynamic = false;
          }
        } else if (['K', 'L', 'M', 'N', 'O', 'P', 'Q'].includes(cStr)) {
          classification = 'COMPETENCY_RATING_VALUE';
          roleJustification = 'Dynamic self-evaluation rating input field';
          isDynamic = true;
        } else if (['R', 'S', 'T', 'U', 'V', 'W', 'X'].includes(cStr)) {
          classification = 'COMPETENCY_RATING_VALUE';
          roleJustification = 'Dynamic chief-evaluation rating input field';
          isDynamic = true;
        }
      } else if (sourceRow === 30) {
        classification = 'PROTECTED_STATIC_COMPETENCY_TEXT';
        roleJustification = 'Static competency block padding row';
        isDynamic = false;
      } else if (sourceRow >= 31 && sourceRow <= 34) {
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
        throw new Error('BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED');
      }

      if (!isDynamic) {
        if (authEv.valHash && ev.valHash !== authEv.valHash) {
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

  const expectedCount = isPresentationOverlay
    ? (n === 6 ? 432 : (n === 7 ? 492 : 552))
    : (n === 6 ? 432 : (n === 7 ? 474 : 516));

  if (n === 6) {
    const sortedSensitive = [...SENSITIVE_RANGES_B].sort();
    if (JSON.stringify(sortedDynamic) !== JSON.stringify(sortedSensitive)) {
      throw new Error('BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED');
    }
    if (sortedDynamic.length !== 432) {
      throw new Error('BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED');
    }
  } else {
    if (sortedDynamic.length !== expectedCount) {
      throw new Error(`BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED: Expected ${expectedCount}, found ${sortedDynamic.length}`);
    }
  }

  return {
    classificationMap,
    dynamicAddresses: sortedDynamic,
    protectedStaticAddresses: [...protectedStaticAddresses].sort()
  };
}

export async function resolveExpandedPartBPrivacyRoles(buf = null, count = 6) {
  return resolvePartBPrivacyRoles(null, count, buf, true);
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

export async function getTypedPrivacyMetadata(partKey, bufOverride = null, competencyCount = 6) {
  const found = findLocalSourceTemplates();
  if (!found) throw new Error('BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE');

  let targetAddrs;
  let buf;

  if (partKey === 'A') {
    targetAddrs = SENSITIVE_RANGES_A;
    buf = bufOverride || fs.readFileSync(found.partA);
  } else {
    const n = competencyCount || 6;
    if (bufOverride) {
      buf = bufOverride;
    } else if (n !== 6) {
      const buffersObj = await getStructuralPartBBuffers();
      buf = buffersObj.buffers ? buffersObj.buffers[n] : (n === 6 ? buffersObj.bufB6 : (n === 7 ? buffersObj.bufB7 : buffersObj.bufB8));
    } else {
      buf = fs.readFileSync(found.partB);
    }
    const resolvedRoles = await resolvePartBPrivacyRoles(null, n, buf);
    targetAddrs = resolvedRoles.dynamicAddresses;
  }

  const wb = await XlsxPopulate.fromDataAsync(buf);
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

  // Corrective A: Parse _xlnm.Print_Area defined names strictly by localSheetId attribute
  const printAreasByLocalSheetId = {};
  const paMatches = [...workbookXml.matchAll(/<definedName [^>]*name="_xlnm\.Print_Area"[^>]*localSheetId="(\d+)"[^>]*>([^<]+)<\/definedName>/g)];
  for (const m of paMatches) {
    const sheetIdx = parseInt(m[1], 10);
    printAreasByLocalSheetId[sheetIdx] = m[2].replaceAll('&amp;', '&');
  }

  const sheetMatchesAlt = [...workbookXml.matchAll(/<sheet [^>]*name="([^"]+)"[^>]*>/g)];

  const sheetNames = [];
  const sheetStates = [];
  const sheets = {};

  for (let sheetIdx = 0; sheetIdx < sheetMatchesAlt.length; sheetIdx++) {
    const sm = sheetMatchesAlt[sheetIdx];
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

      // Strict actual dimension-tag evidence only (no row/cell synthesis)
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

      // Exact per-sheet print area binding without fallbacks
      const printArea = printAreasByLocalSheetId[sheetIdx] || '';

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

      // Mandatory exact dimension check (unconditional exact equality)
      if (obsSheet.dimension !== authSheet.dimension) {
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

const CANONICAL_WORKSHEET_REL_TYPE = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet';

export const OPENXML_WORKSHEET_CHILD_ORDER = [
  'sheetPr',
  'dimension',
  'sheetViews',
  'sheetFormatPr',
  'cols',
  'sheetData',
  'sheetCalcPr',
  'sheetProtection',
  'protectedRanges',
  'scenarios',
  'autoFilter',
  'sortState',
  'dataConsolidate',
  'customSheetViews',
  'mergeCells',
  'phoneticPr',
  'conditionalFormatting',
  'dataValidations',
  'hyperlinks',
  'printOptions',
  'pageMargins',
  'pageSetup',
  'headerFooter',
  'rowBreaks',
  'colBreaks',
  'customProperties',
  'cellWatchPr',
  'ignoredErrors',
  'smartTags',
  'drawing',
  'legacyDrawing',
  'legacyDrawingHF',
  'drawingHF',
  'picture',
  'oleObjects',
  'controls',
  'webPublishItems',
  'tableParts',
  'extLst'
];

// Elements under <worksheet> that are maxOccurs=1 in ECMA-376 schema
// cols and conditionalFormatting are repeatable; mergeCells, hyperlinks, oleObjects, controls, tableParts are maxOccurs=1
export const MAX_OCCURS_ONE_CHILDREN = new Set([
  'sheetPr',
  'dimension',
  'sheetViews',
  'sheetFormatPr',
  'sheetData',
  'sheetCalcPr',
  'sheetProtection',
  'protectedRanges',
  'scenarios',
  'autoFilter',
  'sortState',
  'dataConsolidate',
  'customSheetViews',
  'mergeCells',
  'phoneticPr',
  'dataValidations',
  'hyperlinks',
  'printOptions',
  'pageMargins',
  'pageSetup',
  'headerFooter',
  'rowBreaks',
  'colBreaks',
  'customProperties',
  'cellWatchPr',
  'ignoredErrors',
  'smartTags',
  'drawing',
  'legacyDrawing',
  'legacyDrawingHF',
  'drawingHF',
  'picture',
  'oleObjects',
  'controls',
  'webPublishItems',
  'tableParts',
  'extLst'
]);

export function validateRawTargetLexical(rawTarget) {
  if (typeof rawTarget !== 'string' || rawTarget.length === 0) return false;
  if (
    rawTarget.startsWith('/') ||
    rawTarget.startsWith('xl/') ||
    rawTarget.startsWith('./') ||
    rawTarget.includes('/./') ||
    rawTarget.includes('..') ||
    rawTarget.includes('//') ||
    rawTarget.includes('\\') ||
    rawTarget.includes('%') ||
    rawTarget.includes(':') ||
    rawTarget.includes('?') ||
    rawTarget.includes('#')
  ) {
    return false;
  }
  return true;
}

export function parseGlobalRelsXml(relsXml) {
  if (typeof relsXml !== 'string') {
    throw new Error('BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED');
  }

  const relsMatch = relsXml.match(/<Relationships[^>]*>([\s\S]*?)<\/Relationships>/i);
  if (!relsMatch) {
    throw new Error('BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED');
  }

  const inner = relsMatch[1];
  const tagMatches = [...inner.matchAll(/<([^>\s/]+)(?:\s[^>]*?)?(?:\/>|>[\s\S]*?<\/\1>)/gi)];

  // Coverage-complete gap validation: ensure text between Relationship tags is pure whitespace
  let lastEnd = 0;
  for (const m of tagMatches) {
    const textBetween = inner.slice(lastEnd, m.index);
    if (textBetween.trim().length > 0) {
      throw new Error('BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED');
    }
    lastEnd = m.index + m[0].length;
  }
  if (inner.slice(lastEnd).trim().length > 0) {
    throw new Error('BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED');
  }

  const relsMap = {};

  for (const m of tagMatches) {
    const fullTagName = m[1];
    const tag = m[0];

    // Fail closed on any namespace-prefixed Relationship tag (e.g. <r:Relationship>, <ñ:Relationship>) or non-Relationship tag
    if (fullTagName !== 'Relationship') {
      throw new Error('BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED');
    }

    const idMatch = tag.match(/\bId="([^"]+)"/);
    const typeMatch = tag.match(/\bType="([^"]+)"/);
    const targetMatch = tag.match(/\bTarget="([^"]+)"/);
    const isExternal = /\bTargetMode="External"/i.test(tag);

    if (!idMatch || !typeMatch || !targetMatch) {
      throw new Error('BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED');
    }

    const rId = idMatch[1];
    const type = typeMatch[1];
    const rawTarget = targetMatch[1];

    // Global duplicate relationship ID rejection across ALL relationship types
    if (relsMap[rId]) {
      throw new Error('BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED');
    }

    // Strict raw Target lexical validation
    if (!validateRawTargetLexical(rawTarget)) {
      throw new Error('BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED');
    }

    const zipPath = 'xl/' + rawTarget;

    relsMap[rId] = {
      rId,
      type,
      rawTarget,
      zipPath,
      isExternal
    };
  }

  return relsMap;
}

export function parseWorksheetTopLevelChildren(xml) {
  if (typeof xml !== 'string') return null;
  const wsMatch = xml.match(/<worksheet[^>]*>/);
  if (!wsMatch) return null;
  const startIdx = wsMatch.index + wsMatch[0].length;
  const endIdx = xml.indexOf('</worksheet>');
  if (endIdx === -1 || endIdx <= startIdx) return null;

  const inner = xml.slice(startIdx, endIdx);
  const matches = [...inner.matchAll(/<([^>\s/]+)(?:\s[^>]*?)?(?:\/>|>[\s\S]*?<\/\1>)/g)];

  // Coverage-complete gap validation: ensure text between direct children is pure whitespace
  let lastIndex = 0;
  for (const m of matches) {
    const gap = inner.slice(lastIndex, m.index);
    if (gap.trim().length > 0) {
      throw new Error('BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED');
    }
    lastIndex = m.index + m[0].length;
  }
  if (inner.slice(lastIndex).trim().length > 0) {
    throw new Error('BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED');
  }

  const children = [];
  const counts = {};

  for (const m of matches) {
    const fullTagHead = m[1];

    // Fail closed on any namespace prefix (e.g. x:sheetPr, ñ:sheetPr)
    if (fullTagHead.includes(':')) {
      throw new Error('BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED');
    }

    const tagName = fullTagHead;

    // Fail closed on unknown element not in ECMA-376 schema order map
    if (!OPENXML_WORKSHEET_CHILD_ORDER.includes(tagName)) {
      throw new Error('BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED');
    }

    counts[tagName] = (counts[tagName] || 0) + 1;
    // Independent maxOccurs=1 schema violation check
    if (MAX_OCCURS_ONE_CHILDREN.has(tagName) && counts[tagName] > 1) {
      throw new Error('BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED');
    }

    children.push({
      name: tagName,
      fullTag: m[0],
      startIndex: startIdx + m.index,
      endIndex: startIdx + m.index + m[0].length
    });
  }

  return children;
}

export function validateWorksheetSchemaOrder(children) {
  let lastOrderIdx = -1;
  for (const c of children) {
    const orderIdx = OPENXML_WORKSHEET_CHILD_ORDER.indexOf(c.name);
    if (orderIdx === -1 || orderIdx < lastOrderIdx) {
      return false; // Out of schema order
    }
    lastOrderIdx = orderIdx;
  }
  return true;
}

export function matchAndNormalizeOptionBSheetPr(obsXml, srcChildren, obsChildren, rawTarget, partKey) {
  if (
    partKey === 'B' &&
    rawTarget === 'worksheets/sheet2.xml' &&
    obsChildren.length > 0 &&
    obsChildren[0].name === 'sheetPr'
  ) {
    // 1. Source Sheet1 MUST NOT contain sheetPr
    const srcSheetPr = srcChildren.find(c => c.name === 'sheetPr');
    if (srcSheetPr) {
      throw new Error('BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED');
    }

    // 2. Observed sheetPr MUST be at index 0
    const obsSheetPr = obsChildren[0];

    // 3. Observed sheetPr MUST match exact pinned structure/fingerprint: "<sheetPr/>"
    if (obsSheetPr.fullTag.trim() !== '<sheetPr/>') {
      throw new Error('BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED');
    }

    // 4. Perform Option B internal normalization on working copy
    let removeStart = obsSheetPr.startIndex;
    let removeEnd = obsSheetPr.endIndex;

    // Include trailing whitespace/newline if present
    while (removeEnd < obsXml.length && (obsXml[removeEnd] === ' ' || obsXml[removeEnd] === '\t' || obsXml[removeEnd] === '\r' || obsXml[removeEnd] === '\n')) {
      removeEnd++;
    }

    const normalizedXml = obsXml.slice(0, removeStart) + obsXml.slice(removeEnd);

    // Re-parse obsChildren from normalized obsXml working copy
    const normalizedObsChildren = parseWorksheetTopLevelChildren(normalizedXml);
    if (!normalizedObsChildren || !validateWorksheetSchemaOrder(normalizedObsChildren)) {
      throw new Error('BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED');
    }

    return {
      normalized: true,
      obsXml: normalizedXml,
      obsChildren: normalizedObsChildren
    };
  }

  return {
    normalized: false,
    obsXml,
    obsChildren
  };
}

export function preserveWorksheetXmlDimensions(srcXml, obsXml, rawTarget, partKey) {
  const srcChildren = parseWorksheetTopLevelChildren(srcXml);
  let obsChildren = parseWorksheetTopLevelChildren(obsXml);

  if (!srcChildren || !obsChildren) {
    throw new Error('BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED');
  }

  if (!validateWorksheetSchemaOrder(srcChildren) || !validateWorksheetSchemaOrder(obsChildren)) {
    throw new Error('BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED');
  }

  let isObsXmlModified = false;

  // Option B allowed drift check & normalization
  const optBResult = matchAndNormalizeOptionBSheetPr(obsXml, srcChildren, obsChildren, rawTarget, partKey);
  if (optBResult.normalized) {
    obsXml = optBResult.obsXml;
    obsChildren = optBResult.obsChildren;
    isObsXmlModified = true;
  }

  const srcDimChildren = srcChildren.filter(c => c.name === 'dimension');
  if (srcDimChildren.length !== 1) {
    throw new Error('BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED');
  }
  const srcDimTag = srcDimChildren[0].fullTag;

  const obsDimChildren = obsChildren.filter(c => c.name === 'dimension');
  if (obsDimChildren.length > 1) {
    throw new Error('BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED');
  }

  if (obsDimChildren.length === 1) {
    if (obsDimChildren[0].fullTag !== srcDimTag) {
      throw new Error('BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED');
    }
    // Verify exact top-level child sequence match
    if (srcChildren.map(c => c.name).join(',') !== obsChildren.map(c => c.name).join(',')) {
      throw new Error('BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED');
    }
  } else {
    // Verification that observed top-level children match source EXACTLY with only dimension omitted
    const expectedObsNames = srcChildren.filter(c => c.name !== 'dimension').map(c => c.name);
    const actualObsNames = obsChildren.map(c => c.name);

    if (expectedObsNames.join(',') !== actualObsNames.join(',')) {
      throw new Error('BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED');
    }

    const srcDimIndex = srcChildren.findIndex(c => c.name === 'dimension');
    const predecessorName = srcDimIndex > 0 ? srcChildren[srcDimIndex - 1].name : null;
    const successorName = srcDimIndex < srcChildren.length - 1 ? srcChildren[srcDimIndex + 1].name : null;

    let insertionIndex = -1;

    if (predecessorName !== null) {
      const predChild = obsChildren.find(c => c.name === predecessorName);
      if (!predChild) {
        throw new Error('BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED');
      }
      insertionIndex = predChild.endIndex;
    } else if (successorName !== null) {
      const succChild = obsChildren.find(c => c.name === successorName);
      if (!succChild) {
        throw new Error('BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED');
      }
      insertionIndex = succChild.startIndex;
    } else {
      throw new Error('BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED');
    }

    obsXml = obsXml.slice(0, insertionIndex) + '\n  ' + srcDimTag + obsXml.slice(insertionIndex);

    // Verify that resulting obsXml has exact top-level child sequence match with srcXml
    const checkChildren = parseWorksheetTopLevelChildren(obsXml);
    if (!checkChildren || checkChildren.map(c => c.name).join(',') !== srcChildren.map(c => c.name).join(',')) {
      throw new Error('BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED');
    }

    isObsXmlModified = true;
  }

  return {
    isObsXmlModified,
    obsXml
  };
}

export async function preserveExactWorkbookDimensions(rawObservedBuf, partKey, sourceBufOverride = null) {
  try {
    if (partKey !== 'A' && partKey !== 'B') {
      throw new Error('BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED');
    }

    const expectedSha = partKey === 'A' ? EXPECTED_PART_A_SHA : EXPECTED_PART_B_SHA;
    let sourceBuf = sourceBufOverride;

    if (sourceBuf) {
      if (!Buffer.isBuffer(sourceBuf)) {
        throw new Error('BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED');
      }
      const sourceSha = crypto.createHash('sha256').update(sourceBuf).digest('hex');
      if (sourceSha !== expectedSha) {
        throw new Error('BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED');
      }
    } else {
      const found = findLocalSourceTemplates();
      if (!found) throw new Error('BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE');

      const sourceFile = partKey === 'A' ? found.partA : found.partB;
      sourceBuf = fs.readFileSync(sourceFile);
      const sourceSha = crypto.createHash('sha256').update(sourceBuf).digest('hex');
      if (sourceSha !== expectedSha) {
        throw new Error('BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE');
      }
    }

    if (!Buffer.isBuffer(rawObservedBuf)) {
      throw new Error('BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED');
    }

    const wbSource = await XlsxPopulate.fromDataAsync(sourceBuf);
    const wbObserved = await XlsxPopulate.fromDataAsync(rawObservedBuf);

    if (!wbSource._zip.files['xl/workbook.xml'] || !wbObserved._zip.files['xl/workbook.xml']) {
      throw new Error('BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED');
    }

    const srcWbXml = await wbSource._zip.files['xl/workbook.xml'].async('string');
    const srcRelsXmlFile = wbSource._zip.files['xl/_rels/workbook.xml.rels'];
    const srcRelsXml = srcRelsXmlFile ? await srcRelsXmlFile.async('string') : '';

    const obsWbXml = await wbObserved._zip.files['xl/workbook.xml'].async('string');
    const obsRelsXmlFile = wbObserved._zip.files['xl/_rels/workbook.xml.rels'];
    const obsRelsXml = obsRelsXmlFile ? await obsRelsXmlFile.async('string') : '';

    const srcRelMap = parseGlobalRelsXml(srcRelsXml);
    const obsRelMap = parseGlobalRelsXml(obsRelsXml);

    function parseSheets(wbXml, relMap) {
      const sheets = [];
      const seenZipPaths = new Set();
      const sheetMatches = [...wbXml.matchAll(/<sheet\s+[^>]*\/?>/g)];

      for (const m of sheetMatches) {
        const tag = m[0];
        const nameMatch = tag.match(/\bname="([^"]+)"/);
        const rIdMatch = tag.match(/\br:id="([^"]+)"/);

        if (!nameMatch || !rIdMatch) {
          throw new Error('BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED');
        }

        const name = nameMatch[1].replaceAll('&amp;', '&');
        const rId = rIdMatch[1];
        const rel = relMap[rId];

        if (!rel) {
          throw new Error('BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED');
        }

        // Strict exact canonical relationship Type matching
        if (rel.type !== CANONICAL_WORKSHEET_REL_TYPE || rel.isExternal) {
          throw new Error('BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED');
        }

        if (seenZipPaths.has(rel.zipPath)) {
          throw new Error('BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED');
        }
        seenZipPaths.add(rel.zipPath);

        sheets.push({ name, rId, rel });
      }
      return sheets;
    }

    const srcSheets = parseSheets(srcWbXml, srcRelMap);
    const obsSheets = parseSheets(obsWbXml, obsRelMap);

    if (srcSheets.length === 0 || srcSheets.length !== obsSheets.length) {
      throw new Error('BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED');
    }

    for (let i = 0; i < srcSheets.length; i++) {
      const s = srcSheets[i];
      const o = obsSheets[i];

      // Exact relationship tuple comparison including exact Type, rawTarget, zipPath, rId & TargetMode
      if (
        s.name !== o.name ||
        s.rId !== o.rId ||
        s.rel.rId !== o.rel.rId ||
        s.rel.type !== o.rel.type ||
        s.rel.rawTarget !== o.rel.rawTarget ||
        s.rel.zipPath !== o.rel.zipPath ||
        s.rel.isExternal !== o.rel.isExternal
      ) {
        throw new Error('BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED');
      }
    }

    const wbPreserved = await XlsxPopulate.fromDataAsync(rawObservedBuf);

    for (let i = 0; i < srcSheets.length; i++) {
      const srcSheet = srcSheets[i];
      const obsSheet = obsSheets[i];

      const srcFile = wbSource._zip.files[srcSheet.rel.zipPath];
      const obsFile = wbPreserved._zip.files[obsSheet.rel.zipPath];

      if (!srcFile || !obsFile) {
        throw new Error('BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED');
      }

      const srcXml = await srcFile.async('string');
      const obsXml = await obsFile.async('string');

      const res = preserveWorksheetXmlDimensions(srcXml, obsXml, srcSheet.rel.rawTarget, partKey);

      // PERSIST TO ZIP WORK-COPY IF MODIFIED (Option B normalized OR dimension restored!)
      if (res.isObsXmlModified) {
        wbPreserved._zip.file(obsSheet.rel.zipPath, res.obsXml);
      }
    }

    return await wbPreserved._zip.generateAsync({ type: 'nodebuffer' });
  } catch (err) {
    if (err.message === 'BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE') throw err;
    throw new Error('BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED');
  }
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

export async function getSanitizedDisposableBuffersPartB(competencyCount = 6, inputBuf = null) {
  const n = competencyCount || 6;
  if (![6, 7, 8].includes(n)) {
    throw new Error('BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED');
  }

  const found = findLocalSourceTemplates();
  if (!found) throw new Error('BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE');

  const buffersObj = await getStructuralPartBBuffers();
  const untouchedBuf = buffersObj.buffers ? buffersObj.buffers[n] : (n === 6 ? buffersObj.bufB6 : (n === 7 ? buffersObj.bufB7 : buffersObj.bufB8));
  const resolved = await resolvePartBPrivacyRoles(null, n, untouchedBuf);

  const bufCopy = Buffer.from(inputBuf || untouchedBuf);

  const wbB_orig = await XlsxPopulate.fromDataAsync(bufCopy);
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
  for (const addr of resolved.dynamicAddresses) {
    const v = sheetB_orig.cell(addr).value();
    if (v && typeof v === 'string' && v.trim().length >= 3 && !protectedHeaderTextsB.has(v.trim())) {
      collectedSensitiveB.push(v.trim());
    }
  }

  const wbB = await XlsxPopulate.fromDataAsync(bufCopy);
  const sheetB = wbB.sheet(0);

  for (const c of resolved.dynamicAddresses) {
    sheetB.cell(c).value(null);
  }

  let sanitizedBuf = await wbB.outputAsync();
  const wbB_zip = await XlsxPopulate.fromDataAsync(sanitizedBuf);
  const ssFileB = wbB_zip._zip.files['xl/sharedStrings.xml'];
  if (ssFileB) {
    let xmlB = await ssFileB.async('string');
    for (const token of collectedSensitiveB) {
      if (token && token.length >= 3 && xmlB.includes(token)) {
        xmlB = xmlB.replaceAll(token, '');
      }
    }
    wbB_zip._zip.file('xl/sharedStrings.xml', xmlB);
    sanitizedBuf = await wbB_zip._zip.generateAsync({ type: 'nodebuffer' });
  }

  return {
    bufB: sanitizedBuf,
    sensitiveB: collectedSensitiveB,
    dynamicAddresses: resolved.dynamicAddresses,
    protectedStaticAddresses: resolved.protectedStaticAddresses
  };
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

  // --- RAW OOXML HELPER FOR PART A INSERTION & MERGE CLONING ---
  async function performRawPartAInsertion(extraRows, printAreaStr) {
    const wbTemp = await XlsxPopulate.fromDataAsync(origBufA);
    wbTemp.sheet(0).cell('B29').value('SENTINEL_ROW_29');
    const tempBuf = await wbTemp.outputAsync();

    const wb = await XlsxPopulate.fromDataAsync(tempBuf);
    const sheetFile = wb._zip.files['xl/worksheets/sheet1.xml'];
    let sheetXml = await sheetFile.async('string');

    if (extraRows > 0) {
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
    }

    // Ensure dimension ref is present and exact
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

    wb._zip.file('xl/worksheets/sheet1.xml', sheetXml);

    // Update Print_Area in xl/workbook.xml
    let wbXml = await wb._zip.files['xl/workbook.xml'].async('string');
    wbXml = wbXml.replace(/<definedName name="_xlnm\.Print_Area"[^>]*>[^<]+<\/definedName>/, `<definedName name="_xlnm.Print_Area" localSheetId="0">'MBO Staff &amp; Chief'!${printAreaStr}</definedName>`);
    wb._zip.file('xl/workbook.xml', wbXml);

    return wb._zip.generateAsync({ type: 'nodebuffer' });
  }

  const buffers = {};
  for (let n = 4; n <= 10; n++) {
    const extraRows = n - 4;
    const printAreaStr = `$A$1:$BJ$${52 + extraRows}`;
    buffers[n] = await performRawPartAInsertion(extraRows, printAreaStr);
  }

  return {
    bufA4: buffers[4],
    bufA5: buffers[5],
    bufA6: buffers[6],
    bufA7: buffers[7],
    bufA8: buffers[8],
    bufA9: buffers[9],
    bufA10: buffers[10],
    buffers
  };
}

/**
 * RAW OOXML Structural Insertion & Merge Cloning for Part B
 */
export async function getStructuralPartBBuffers() {
  const found = findLocalSourceTemplates();
  if (!found) throw new Error('BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE');

  const origBufB = fs.readFileSync(found.partB);
  const sourceSha = crypto.createHash('sha256').update(origBufB).digest('hex');
  // --- RAW OWNER-TEMPLATE FAIL-CLOSED GUARDS (R5-R1) ---
  const rawWbTemp = await XlsxPopulate.fromDataAsync(origBufB);
  const rawSheetFile = rawWbTemp._zip.files['xl/worksheets/sheet1.xml'];
  const rawWbFile = rawWbTemp._zip.files['xl/workbook.xml'];
  if (!rawSheetFile || !rawWbFile) {
    throw new Error('BLOCKER_PART_B_STRUCTURAL_PREREQUISITE_FAILED: Raw worksheet XML or workbook XML missing');
  }

  const rawSheetXml = await rawSheetFile.async('string');
  const rawWbXml = await rawWbFile.async('string');

  const rawDimMatch = rawSheetXml.match(/<dimension ref="([^"]+)"\/>/);
  if (!rawDimMatch || rawDimMatch[1] !== 'A1:X35') {
    throw new Error(`BLOCKER_PART_B_STRUCTURAL_PREREQUISITE_FAILED: Raw main dimension tag must be A1:X35, found ${rawDimMatch ? rawDimMatch[1] : 'none'}`);
  }

  const rawMergesMatches = [...rawSheetXml.matchAll(/<mergeCell ref="([A-Z]+)(\d+):([A-Z]+)(\d+)"\/>/g)];
  if (rawMergesMatches.length !== 79) {
    throw new Error(`BLOCKER_PART_B_STRUCTURAL_PREREQUISITE_FAILED: Raw actual merge inventory length must equal 79, found ${rawMergesMatches.length}`);
  }

  const rawDeclaredCountMatch = rawSheetXml.match(/<mergeCells count="(\d+)">/);
  if (!rawDeclaredCountMatch || parseInt(rawDeclaredCountMatch[1], 10) !== 79) {
    throw new Error(`BLOCKER_PART_B_STRUCTURAL_PREREQUISITE_FAILED: Raw mergeCells declared count must equal 79, found ${rawDeclaredCountMatch ? rawDeclaredCountMatch[1] : 'none'}`);
  }

  const rawBlock27_30Merges = [];
  for (const m of rawMergesMatches) {
    const r1 = parseInt(m[2], 10);
    const r2 = parseInt(m[4], 10);
    if (r1 >= 27 && r2 <= 30) {
      rawBlock27_30Merges.push(m[0]);
    }
  }
  if (rawBlock27_30Merges.length !== 6) {
    throw new Error(`BLOCKER_PART_B_STRUCTURAL_PREREQUISITE_FAILED: Raw source block 27:30 must contain exactly 6 merges, found ${rawBlock27_30Merges.length}`);
  }

  for (let r = 27; r <= 31; r++) {
    const matches = [...rawSheetXml.matchAll(new RegExp(`<row r="${r}"[^>]*>`, 'g'))];
    if (matches.length !== 1) {
      throw new Error(`BLOCKER_PART_B_STRUCTURAL_PREREQUISITE_FAILED: Raw row ${r} must be present exactly once, found ${matches.length}`);
    }
  }

  const rawPrintAreas = [...rawWbXml.matchAll(/<definedName name="_xlnm\.Print_Area"([^>]*)>([^<]+)<\/definedName>/g)];
  if (rawPrintAreas.length !== 1) {
    throw new Error(`BLOCKER_PART_B_STRUCTURAL_PREREQUISITE_FAILED: Exactly one raw _xlnm.Print_Area definedName must exist, found ${rawPrintAreas.length}`);
  }

  const rawPrintAreaAttr = rawPrintAreas[0][1];
  const rawPrintAreaVal = rawPrintAreas[0][2].trim();

  const localSheetIdMatch = rawPrintAreaAttr.match(/localSheetId="(\d+)"/);
  if (!localSheetIdMatch || localSheetIdMatch[1] !== '0') {
    throw new Error(`BLOCKER_PART_B_STRUCTURAL_PREREQUISITE_FAILED: Raw Print_Area localSheetId must equal 0, found ${rawPrintAreaAttr}`);
  }

  if (rawPrintAreaVal !== "'(Part B) Competency'!$A$1:$X$35") {
    throw new Error(`BLOCKER_PART_B_STRUCTURAL_PREREQUISITE_FAILED: Raw Print_Area value must equal '(Part B) Competency'!$A$1:$X$35, found ${rawPrintAreaVal}`);
  }

  const rawSheet1PrintAreas = [...rawWbXml.matchAll(/<definedName name="_xlnm\.Print_Area"[^>]*localSheetId="1"[^>]*>/g)];
  if (rawSheet1PrintAreas.length > 0) {
    throw new Error('BLOCKER_PART_B_STRUCTURAL_PREREQUISITE_FAILED: No Print_Area must be bound to Sheet1/localSheetId 1');
  }

  // --- RAW OOXML HELPER FOR PART B BLOCK INSERTION & MERGE CLONING ---
  async function performRawPartBInsertion(extraBlocks) {
    const extraRows = 4 * extraBlocks;
    const expectedLastRow = 35 + extraRows;

    const wbTemp = await XlsxPopulate.fromDataAsync(origBufB);
    wbTemp.sheet(0).cell('B31').value('SENTINEL_ROW_31');
    const tempBuf = await wbTemp.outputAsync();

    const wb = await XlsxPopulate.fromDataAsync(tempBuf);
    const sheetFile = wb._zip.files['xl/worksheets/sheet1.xml'];
    if (!sheetFile) {
      throw new Error('BLOCKER_PART_B_STRUCTURAL_PREREQUISITE_FAILED: sheet1.xml missing');
    }
    let sheetXml = await sheetFile.async('string');

    // Fail-closed checks on prerequisites
    for (let r = 27; r <= 31; r++) {
      const matches = [...sheetXml.matchAll(new RegExp(`<row r="${r}"[^>]*>`, 'g'))];
      if (matches.length !== 1) {
        throw new Error(`BLOCKER_PART_B_STRUCTURAL_PREREQUISITE_FAILED: Row ${r} must be present exactly once`);
      }
    }

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

    if (block27_30Merges.length !== 6) {
      throw new Error(`BLOCKER_PART_B_STRUCTURAL_PREREQUISITE_FAILED: Expected 6 merges in source block 27:30, found ${block27_30Merges.length}`);
    }

    const countMatchB = sheetXml.match(/<mergeCells count="(\d+)">/);
    if (!countMatchB || parseInt(countMatchB[1], 10) !== 79) {
      throw new Error('BLOCKER_PART_B_STRUCTURAL_PREREQUISITE_FAILED: Baseline merge count must be 79');
    }

    if (extraBlocks > 0) {
      // Shift rows r >= 31 by +extraRows
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

      // Extract source block 27:30 XML
      let block27_30 = '';
      for (let r = 27; r <= 30; r++) {
        const m = sheetXml.match(new RegExp(`<row r="${r}"[^>]*>[\\s\\S]*?<\\/row>`));
        if (m) block27_30 += m[0] + '\n';
      }

      const clonedBlocksXml = [];
      for (let b = 1; b <= extraBlocks; b++) {
        const offset = 4 * b;
        const clonedBlock = block27_30
          .replace(/r="(\d+)"/g, (m, rStr) => `r="${parseInt(rStr, 10) + offset}"`)
          .replace(/<c r="([A-Z]+)(\d+)"/g, (m, col, rStr) => `<c r="${col}${parseInt(rStr, 10) + offset}"`);
        clonedBlocksXml.push(clonedBlock);
      }

      const row30Match = sheetXml.match(/<row r="30"[^>]*>[\s\S]*?<\/row>/);
      if (row30Match) {
        sheetXml = sheetXml.replace(row30Match[0], row30Match[0] + '\n' + clonedBlocksXml.join('\n'));
      }

      // Shift mergeCells for rows >= 31
      sheetXml = sheetXml.replace(/<mergeCell ref="([A-Z]+)(\d+):([A-Z]+)(\d+)"\/>/g, (match, c1, r1Str, c2, r2Str) => {
        let r1 = parseInt(r1Str, 10);
        let r2 = parseInt(r2Str, 10);
        if (r1 >= 31) r1 += extraRows;
        if (r2 >= 31) r2 += extraRows;
        return `<mergeCell ref="${c1}${r1}:${c2}${r2}"/>`;
      });

      // Append cloned mergeCells for inserted blocks
      const clonedMergesXmlB = [];
      for (let b = 1; b <= extraBlocks; b++) {
        const startR = 27 + 4 * b;
        for (const m of block27_30Merges) {
          clonedMergesXmlB.push(`<mergeCell ref="${m.c1}${startR + m.r1Offset}:${m.c2}${startR + m.r2Offset}"/>`);
        }
      }

      if (clonedMergesXmlB.length > 0) {
        sheetXml = sheetXml.replace(/<\/mergeCells>/, clonedMergesXmlB.join('\n') + '\n</mergeCells>');
      }

      // Update <mergeCells count="N">
      const currentCount = parseInt(countMatchB[1], 10);
      const newCount = currentCount + clonedMergesXmlB.length;
      sheetXml = sheetXml.replace(/<mergeCells count="\d+">/, `<mergeCells count="${newCount}">`);
    }

    // Ensure dimension ref is present and exact
    const dimensionTag = `<dimension ref="A1:X${expectedLastRow}"/>`;
    if (/<dimension [^>]*\/>/.test(sheetXml)) {
      sheetXml = sheetXml.replace(/<dimension [^>]*\/>/, dimensionTag);
    } else if (/<sheetPr[^>]*\/>/.test(sheetXml)) {
      sheetXml = sheetXml.replace(/<sheetPr[^>]*\/>/, `$& \n  ${dimensionTag}`);
    } else if (/<sheetPr[^>]*>[\s\S]*?<\/sheetPr>/.test(sheetXml)) {
      sheetXml = sheetXml.replace(/<sheetPr[^>]*>[\s\S]*?<\/sheetPr>/, `$& \n  ${dimensionTag}`);
    } else {
      sheetXml = sheetXml.replace(/<worksheet[^>]*>/, `$& \n  ${dimensionTag}`);
    }

    wb._zip.file('xl/worksheets/sheet1.xml', sheetXml);

    let wbXml = await wb._zip.files['xl/workbook.xml'].async('string');
    if (!wbXml.includes('_xlnm.Print_Area')) {
      throw new Error('BLOCKER_PART_B_STRUCTURAL_PREREQUISITE_FAILED: Print_Area missing');
    }
    wbXml = wbXml.replace(/<definedName name="_xlnm\.Print_Area"[^>]*>[^<]+<\/definedName>/, `<definedName name="_xlnm.Print_Area" localSheetId="0">'(Part B) Competency'!$A$1:$X$${expectedLastRow}</definedName>`);
    wb._zip.file('xl/workbook.xml', wbXml);

    return wb._zip.generateAsync({ type: 'nodebuffer' });
  }

  const buffers = {};
  for (let n = 6; n <= 8; n++) {
    const extraBlocks = n - 6;
    buffers[n] = await performRawPartBInsertion(extraBlocks);
  }

  return {
    bufB6: buffers[6],
    bufB7: buffers[7],
    bufB8: buffers[8],
    buffers
  };
}

/**
 * Production Validator for Expanded Presentation OOXML Overlay & Privacy Topology for Part B
 * Validates real in-memory workbook/buffer evidence against presentation overlay standards.
 */
export async function validateExpandedPresentationOverlayPartB(buf, count = 6, structuralBuf = null) {
  const n = count || 6;
  if (![6, 7, 8].includes(n)) {
    throw new Error('BLOCKER_PART_B_PRESENTATION_OVERLAY_UNRESOLVED: Invalid competency count');
  }

  // 1. Raw OOXML Inspection of final overlay buffer
  const inspFinal = await inspectRawWorksheetOOXML(buf);
  const expectedFinalMerges = n === 6 ? 79 : (n === 7 ? 86 : 93);
  if (inspFinal.rawMerges.length !== expectedFinalMerges ||
      inspFinal.mergeCountAttr !== String(expectedFinalMerges)) {
    throw new Error(`BLOCKER_PART_B_PRESENTATION_OVERLAY_UNRESOLVED: Effective merge count mismatch for N=${n}`);
  }

  // Validate exact required presentation title merges are present in rawMerges
  if (n === 7) {
    if (!inspFinal.rawMerges.includes('B31:J31')) {
      throw new Error('BLOCKER_PART_B_PRESENTATION_OVERLAY_UNRESOLVED: Missing N7 title merge B31:J31');
    }
  } else if (n === 8) {
    if (!inspFinal.rawMerges.includes('B31:J31') || !inspFinal.rawMerges.includes('B35:J35')) {
      throw new Error('BLOCKER_PART_B_PRESENTATION_OVERLAY_UNRESOLVED: Missing N8 title merges B31:J31 or B35:J35');
    }
  }

  // 2. Dynamic Privacy Overlay & Topology Validation
  const effectivePrivacy = await resolveExpandedPartBPrivacyRoles(buf, n);
  const expectedEffectiveDynamic = n === 6 ? 432 : (n === 7 ? 492 : 552);
  if (effectivePrivacy.dynamicAddresses.length !== expectedEffectiveDynamic) {
    throw new Error(`BLOCKER_PART_B_PRESENTATION_OVERLAY_UNRESOLVED: Effective privacy dynamic count mismatch for N=${n}`);
  }

  // Validate Rating Scale cells and padding rows are non-dynamic / protected static
  const ratingScaleRows = n === 6 ? [29] : (n === 7 ? [29, 33] : [29, 33, 37]);
  for (const rRow of ratingScaleRows) {
    for (const cStr of ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']) {
      const addr = `${cStr}${rRow}`;
      if (effectivePrivacy.dynamicAddresses.includes(addr)) {
        throw new Error(`BLOCKER_PART_B_PRESENTATION_OVERLAY_UNRESOLVED: Rating scale cell ${addr} marked dynamic`);
      }
    }
  }

  const paddingRows = n === 6 ? [30] : (n === 7 ? [30, 34] : [30, 34, 38]);
  for (const pRow of paddingRows) {
    for (const cStr of ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X']) {
      const addr = `${cStr}${pRow}`;
      if (effectivePrivacy.dynamicAddresses.includes(addr)) {
        throw new Error(`BLOCKER_PART_B_PRESENTATION_OVERLAY_UNRESOLVED: Padding cell ${addr} marked dynamic`);
      }
    }
  }

  // 3. XlsxPopulate Text & Sanitization State Validation
  const wbFinal = await XlsxPopulate.fromDataAsync(buf);
  const sheetFinal = wbFinal.sheet(0);

  function getCellTextValue(cell) {
    const val = cell.value();
    if (val === null || val === undefined) return '';
    if (typeof val === 'object' && typeof val.text === 'function') {
      return val.text().replaceAll('\r\n', '\n').trim();
    }
    return String(val).replaceAll('\r\n', '\n').trim();
  }

  // Validate Rating Scale static text survives
  for (const rRow of ratingScaleRows) {
    const text = getCellTextValue(sheetFinal.cell(`B${rRow}`));
    if (text !== 'Rating Scale') {
      throw new Error(`BLOCKER_PART_B_PRESENTATION_OVERLAY_UNRESOLVED: Rating scale text at B${rRow} corrupted`);
    }
  }

  // Validate expanded presentation targets are sanitized/blanked in final output
  if (n === 7) {
    const b31Val = sheetFinal.cell('B31').value();
    const b32Val = sheetFinal.cell('B32').value();
    if (b31Val !== null && b31Val !== undefined) {
      throw new Error('BLOCKER_PART_B_PRESENTATION_OVERLAY_UNRESOLVED: N7 B31 presentation target not sanitized');
    }
    if (b32Val !== null && b32Val !== undefined) {
      throw new Error('BLOCKER_PART_B_PRESENTATION_OVERLAY_UNRESOLVED: N7 B32 presentation target not sanitized');
    }
  } else if (n === 8) {
    for (const addr of ['B31', 'B32', 'B35', 'B36']) {
      const val = sheetFinal.cell(addr).value();
      if (val !== null && val !== undefined) {
        throw new Error(`BLOCKER_PART_B_PRESENTATION_OVERLAY_UNRESOLVED: N8 ${addr} presentation target not sanitized`);
      }
    }
  }

  // 4. Mechanical Observation of Actual Summary Start Row from Output Evidence
  const summaryMatches = [];
  const expectedSummaryStartRow = n === 6 ? 31 : (n === 7 ? 35 : 39);
  const maxSearchRow = 35 + 4 * (n - 6);

  for (let r = 25; r <= maxSearchRow + 5; r++) {
    const txtI = getCellTextValue(sheetFinal.cell(`I${r}`));
    const txtB = getCellTextValue(sheetFinal.cell(`B${r}`));
    if (txtI.includes('Part B : Competency 30%') || txtB.includes('[A] Total')) {
      summaryMatches.push(r);
    }
  }

  if (summaryMatches.length === 0) {
    throw new Error(`BLOCKER_PART_B_PRESENTATION_OVERLAY_UNRESOLVED: Summary block marker missing in final output for N=${n}`);
  }
  if (summaryMatches.length > 1) {
    throw new Error(`BLOCKER_PART_B_PRESENTATION_OVERLAY_UNRESOLVED: Duplicate summary block markers in final output for N=${n}`);
  }

  const observedSummaryStartRow = summaryMatches[0];
  if (observedSummaryStartRow !== expectedSummaryStartRow) {
    throw new Error(`BLOCKER_PART_B_PRESENTATION_OVERLAY_UNRESOLVED: Summary start row misplaced for N=${n} (expected ${expectedSummaryStartRow}, observed ${observedSummaryStartRow})`);
  }

  // 5. Package / Reference-Image Preservation Proof against Structural Input
  if (structuralBuf) {
    const sFp = await getWorkbookFingerprint(structuralBuf);
    const fFp = await getWorkbookFingerprint(buf);

    if (JSON.stringify(fFp.relTuples) !== JSON.stringify(sFp.relTuples)) {
      throw new Error(`BLOCKER_PART_B_PRESENTATION_OVERLAY_UNRESOLVED: Relationship tuples mutated for N=${n}`);
    }
    if (JSON.stringify(fFp.mediaFiles) !== JSON.stringify(sFp.mediaFiles)) {
      throw new Error(`BLOCKER_PART_B_PRESENTATION_OVERLAY_UNRESOLVED: Media files mutated for N=${n}`);
    }
    if (JSON.stringify(fFp.sheets['Sheet1']) !== JSON.stringify(sFp.sheets['Sheet1'])) {
      throw new Error(`BLOCKER_PART_B_PRESENTATION_OVERLAY_UNRESOLVED: Auxiliary Sheet1 mutated for N=${n}`);
    }
  }

  return {
    mergeCount: inspFinal.rawMerges.length,
    effectiveDynamicCount: effectivePrivacy.dynamicAddresses.length,
    observedSummaryStartRow
  };
}

/**
 * RAW OOXML Presentation Title Overlay & Stale Clone Sanitization Proof for Part B
 */
export async function getExpandedPresentationPartBBuffers() {
  const structural = await getStructuralPartBBuffers();
  const found = findLocalSourceTemplates();
  if (!found) throw new Error('BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE');
  const origBufB = fs.readFileSync(found.partB);
  const origSha = crypto.createHash('sha256').update(origBufB).digest('hex');

  const buffers = {};
  const intermediateMetrics = {};
  const effectiveMetrics = {};

  for (let n = 6; n <= 8; n++) {
    const rawBuf = structural.buffers ? structural.buffers[n] : (n === 6 ? structural.bufB6 : (n === 7 ? structural.bufB7 : structural.bufB8));
    const structuralFp = await getWorkbookFingerprint(rawBuf);

    // 1. Validate intermediate structural invariants BEFORE presentation overlay
    const inspIntermediate = await inspectRawWorksheetOOXML(rawBuf);
    const expectedIntermediateMerges = n === 6 ? 79 : (n === 7 ? 85 : 91);
    const expectedDimension = n === 6 ? '<dimension ref="A1:X35"/>' : (n === 7 ? '<dimension ref="A1:X39"/>' : '<dimension ref="A1:X43"/>');
    const expectedPrintArea = n === 6 ? "'(Part B) Competency'!$A$1:$X$35" : (n === 7 ? "'(Part B) Competency'!$A$1:$X$39" : "'(Part B) Competency'!$A$1:$X$43");
    const expectedSummaryStartRow = n === 6 ? 31 : (n === 7 ? 35 : 39);

    if (inspIntermediate.rawMerges.length !== expectedIntermediateMerges ||
        inspIntermediate.mergeCountAttr !== String(expectedIntermediateMerges)) {
      throw new Error(`BLOCKER_PART_B_PRESENTATION_OVERLAY_UNRESOLVED: Intermediate merge count mismatch for N=${n}`);
    }
    if (inspIntermediate.dimension !== expectedDimension) {
      throw new Error(`BLOCKER_PART_B_PRESENTATION_OVERLAY_UNRESOLVED: Intermediate dimension mismatch for N=${n}`);
    }
    if (inspIntermediate.printArea !== expectedPrintArea) {
      throw new Error(`BLOCKER_PART_B_PRESENTATION_OVERLAY_UNRESOLVED: Intermediate printArea mismatch for N=${n}`);
    }

    // Validate base privacy count FIRST
    const basePrivacy = await resolvePartBPrivacyRoles(null, n, rawBuf);
    const expectedBaseDynamic = n === 6 ? 432 : (n === 7 ? 474 : 516);
    if (basePrivacy.dynamicAddresses.length !== expectedBaseDynamic) {
      throw new Error(`BLOCKER_PART_B_PRESENTATION_OVERLAY_UNRESOLVED: Base privacy dynamic count mismatch for N=${n}`);
    }

    intermediateMetrics[n] = {
      mergeCount: inspIntermediate.rawMerges.length,
      dimension: inspIntermediate.dimension,
      printArea: inspIntermediate.printArea,
      summaryStartRow: expectedSummaryStartRow,
      baseDynamicCount: basePrivacy.dynamicAddresses.length
    };

    // 2. Identify & validate stale cloned presentation text BEFORE sanitization
    const wbTemp = await XlsxPopulate.fromDataAsync(rawBuf);
    const sheetTemp = wbTemp.sheet(0);

    const expectedStaleDesc = '6.นโยบายจรรยาบรรณและจริยธรรม (10 ประการ)                                    倫理・道徳方針（10項目）';

    function getCellTextValue(cell) {
      const val = cell.value();
      if (val === null || val === undefined) return '';
      if (typeof val === 'object' && typeof val.text === 'function') {
        return val.text().replaceAll('\r\n', '\n').trim();
      }
      return String(val).replaceAll('\r\n', '\n').trim();
    }

    if (n === 7) {
      // PRE-SANITIZE VALIDATION for N7: B31 (title target) must be mechanically blank/no-value from un-cloned B26:J27
      const b31Str = getCellTextValue(sheetTemp.cell('B31'));
      const b32Str = getCellTextValue(sheetTemp.cell('B32'));
      const b33Str = getCellTextValue(sheetTemp.cell('B33'));

      if (b31Str !== '') {
        throw new Error('BLOCKER_PART_B_PRESENTATION_OVERLAY_UNRESOLVED: Pre-sanitize title target B31 must be blank before mutation');
      }
      if (b32Str !== expectedStaleDesc) {
        throw new Error('BLOCKER_PART_B_PRESENTATION_OVERLAY_UNRESOLVED: Stale description in B32 did not match expected competency-6 clone');
      }
      if (b33Str !== 'Rating Scale') {
        throw new Error('BLOCKER_PART_B_PRESENTATION_OVERLAY_UNRESOLVED: Rating scale text in B33 corrupted');
      }
    } else if (n === 8) {
      // PRE-SANITIZE VALIDATION for N8: B31 and B35 (title targets) must be mechanically blank/no-value from un-cloned B26:J27
      const b31Str = getCellTextValue(sheetTemp.cell('B31'));
      const b35Str = getCellTextValue(sheetTemp.cell('B35'));
      const b32Str = getCellTextValue(sheetTemp.cell('B32'));
      const b36Str = getCellTextValue(sheetTemp.cell('B36'));
      const b33Str = getCellTextValue(sheetTemp.cell('B33'));
      const b37Str = getCellTextValue(sheetTemp.cell('B37'));

      if (b31Str !== '' || b35Str !== '') {
        throw new Error('BLOCKER_PART_B_PRESENTATION_OVERLAY_UNRESOLVED: Pre-sanitize title targets B31/B35 must be blank before mutation');
      }
      if (b32Str !== expectedStaleDesc || b36Str !== expectedStaleDesc) {
        throw new Error('BLOCKER_PART_B_PRESENTATION_OVERLAY_UNRESOLVED: Stale description in B32/B36 did not match expected competency-6 clone');
      }
      if (b33Str !== 'Rating Scale' || b37Str !== 'Rating Scale') {
        throw new Error('BLOCKER_PART_B_PRESENTATION_OVERLAY_UNRESOLVED: Rating scale text in B33/B37 corrupted');
      }
    }

    // 3. Sanitize/blank presentation write targets & preserve static rating scale ONLY AFTER validation passes
    if (n === 7) {
      sheetTemp.cell('B31').value(null);
      sheetTemp.cell('B32').value(null);
    } else if (n === 8) {
      sheetTemp.cell('B31').value(null);
      sheetTemp.cell('B32').value(null);
      sheetTemp.cell('B35').value(null);
      sheetTemp.cell('B36').value(null);
    }

    const sanitizedBuf = await wbTemp.outputAsync();

    // 4. Apply title merge overlay in OOXML
    const wbOut = await XlsxPopulate.fromDataAsync(sanitizedBuf);
    const sheetFile = wbOut._zip.files['xl/worksheets/sheet1.xml'];
    let sheetXml = await sheetFile.async('string');

    const overlayTitleMerges = [];
    if (n === 7) {
      overlayTitleMerges.push('B31:J31');
    } else if (n === 8) {
      overlayTitleMerges.push('B31:J31', 'B35:J35');
    }

    if (overlayTitleMerges.length > 0) {
      const titleMergesXml = overlayTitleMerges.map(m => `<mergeCell ref="${m}"/>`).join('\n');
      sheetXml = sheetXml.replace(/<\/mergeCells>/, `${titleMergesXml}\n</mergeCells>`);

      const currentCountMatch = sheetXml.match(/<mergeCells count="(\d+)">/);
      if (!currentCountMatch) {
        throw new Error('BLOCKER_PART_B_PRESENTATION_OVERLAY_UNRESOLVED: mergeCells count tag missing');
      }
      const newMergeCount = parseInt(currentCountMatch[1], 10) + overlayTitleMerges.length;
      sheetXml = sheetXml.replace(/<mergeCells count="\d+">/, `<mergeCells count="${newMergeCount}">`);
    }

    // Ensure dimension ref is present and exact
    const expectedLastRow = 35 + 4 * (n - 6);
    const dimensionTag = `<dimension ref="A1:X${expectedLastRow}"/>`;
    if (/<dimension [^>]*\/>/.test(sheetXml)) {
      sheetXml = sheetXml.replace(/<dimension [^>]*\/>/, dimensionTag);
    } else if (/<sheetPr[^>]*\/>/.test(sheetXml)) {
      sheetXml = sheetXml.replace(/<sheetPr[^>]*\/>/, `$& \n  ${dimensionTag}`);
    } else if (/<sheetPr[^>]*>[\s\S]*?<\/sheetPr>/.test(sheetXml)) {
      sheetXml = sheetXml.replace(/<sheetPr[^>]*>[\s\S]*?<\/sheetPr>/, `$& \n  ${dimensionTag}`);
    } else {
      sheetXml = sheetXml.replace(/<worksheet[^>]*>/, `$& \n  ${dimensionTag}`);
    }

    wbOut._zip.file('xl/worksheets/sheet1.xml', sheetXml);

    let wbXml = await wbOut._zip.files['xl/workbook.xml'].async('string');
    if (!wbXml.includes('_xlnm.Print_Area')) {
      throw new Error('BLOCKER_PART_B_PRESENTATION_OVERLAY_UNRESOLVED: Print_Area missing');
    }
    wbXml = wbXml.replace(/<definedName name="_xlnm\.Print_Area"[^>]*>[^<]+<\/definedName>/, `<definedName name="_xlnm.Print_Area" localSheetId="0">'(Part B) Competency'!$A$1:$X$${expectedLastRow}</definedName>`);
    wbOut._zip.file('xl/workbook.xml', wbXml);

    const finalBuf = await wbOut._zip.generateAsync({ type: 'nodebuffer' });

    // 5. Verify final effective OOXML metrics, dynamic privacy, summary topology & package preservation via production validator
    const inspFinal = await inspectRawWorksheetOOXML(finalBuf);
    const valResult = await validateExpandedPresentationOverlayPartB(finalBuf, n, rawBuf);

    effectiveMetrics[n] = {
      mergeCount: valResult.mergeCount,
      dimension: inspFinal.dimension,
      printArea: inspFinal.printArea,
      summaryStartRow: valResult.observedSummaryStartRow,
      effectiveDynamicCount: valResult.effectiveDynamicCount
    };

    buffers[n] = finalBuf;
  }

  // Source input byte immutability check
  const checkSourceSha = crypto.createHash('sha256').update(fs.readFileSync(found.partB)).digest('hex');
  if (checkSourceSha !== origSha) {
    throw new Error('BLOCKER_PART_B_PRESENTATION_OVERLAY_UNRESOLVED: Source bytes mutated');
  }

  return {
    bufB6: buffers[6],
    bufB7: buffers[7],
    bufB8: buffers[8],
    buffers,
    intermediateMetrics,
    effectiveMetrics
  };
}
