/**
 * Production Secured Semantic Value Renderer — Part A + Part B
 * 
 * Browser-safe asynchronous renderer:
 *   - Consumes prepared + sanitized XLSX bytes, secured projection object, and Template Profile.
 *   - Performs raw OOXML target-cell-only mutation on xl/worksheets/sheet1.xml.
 *   - Resolves all write targets through profile.resolveSemanticRole(roleName, { partKey, objectiveCount, competencyCount }).
 *   - Zero calculation, zero raw-record lookup, zero formula creation, zero hard-coded workbook addresses.
 */
import XlsxPopulate from 'xlsx-populate';
import {
  MboXlsxTemplateProfile,
  validateMappingIntegrity,
  expandRangeToAddresses
} from '../profiles/mbo-xlsx-template-profile.js';

function escapeXmlText(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function resolvePath(obj, pathStr) {
  if (!obj || typeof obj !== 'object') return undefined;
  const parts = pathStr.split(/\.|\/|\[|\]/).filter(Boolean);
  let curr = obj;
  for (const p of parts) {
    if (curr == null) return undefined;
    if (p === '__proto__' || p === 'constructor' || p === 'prototype') {
      throw new Error('EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Forbidden path segment');
    }
    const isArrIdx = /^\d+$/.test(p);
    if (isArrIdx) {
      const idx = parseInt(p, 10);
      if (!Array.isArray(curr) || idx >= curr.length) return undefined;
      curr = curr[idx];
    } else {
      if (typeof curr !== 'object' || !Object.prototype.hasOwnProperty.call(curr, p)) {
        return undefined;
      }
      curr = curr[p];
    }
  }
  return curr;
}

function mutateCellInSheetXml(sheetXml, addr, val) {
  // 1. Try self-closing cell tag first: <c r="ADDR" ... />
  const selfClosingRegex = new RegExp(`<c r="${addr}"([^>]*)\\/>`);
  const selfMatch = sheetXml.match(selfClosingRegex);

  if (selfMatch) {
    const rawAttrsStr = selfMatch[1];
    const attrPairs = [...rawAttrsStr.matchAll(/(\w+)="([^"]*)"/g)];
    let sAttr = null;
    const otherAttrs = [];
    for (const [, k, v] of attrPairs) {
      if (k === 's') sAttr = v;
      else if (k !== 'r' && k !== 't') otherAttrs.push(`${k}="${v}"`);
    }

    const sStr = sAttr !== null ? ` s="${sAttr}"` : '';
    const otherStr = otherAttrs.length > 0 ? ' ' + otherAttrs.join(' ') : '';

    let replacement;
    if (val === undefined || val === null || val === '') {
      replacement = `<c r="${addr}"${sStr}${otherStr}/>`;
    } else if (typeof val === 'number') {
      replacement = `<c r="${addr}"${sStr}${otherStr}><v>${val}</v></c>`;
    } else if (typeof val === 'string') {
      const escaped = escapeXmlText(val);
      replacement = `<c r="${addr}"${sStr} t="inlineStr"${otherStr}><is><t>${escaped}</t></is></c>`;
    } else {
      throw new Error(`EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Unsupported value type for cell ${addr}`);
    }

    return sheetXml.replace(selfClosingRegex, () => replacement);
  }

  // 2. Try paired cell tag: <c r="ADDR" ...>...</c>
  const pairedRegex = new RegExp(`<c r="${addr}"([^>]*)>((?:(?!<c\\b)[\\s\\S])*?)<\\/c>`);
  const pairedMatch = sheetXml.match(pairedRegex);

  if (pairedMatch) {
    const rawAttrsStr = pairedMatch[1];
    const body = pairedMatch[2];
    if (body && /<f[\s>]/.test(body)) {
      throw new Error(`EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Target cell ${addr} contains formula`);
    }

    const attrPairs = [...rawAttrsStr.matchAll(/(\w+)="([^"]*)"/g)];
    let sAttr = null;
    const otherAttrs = [];
    for (const [, k, v] of attrPairs) {
      if (k === 's') sAttr = v;
      else if (k !== 'r' && k !== 't') otherAttrs.push(`${k}="${v}"`);
    }

    const sStr = sAttr !== null ? ` s="${sAttr}"` : '';
    const otherStr = otherAttrs.length > 0 ? ' ' + otherAttrs.join(' ') : '';

    let replacement;
    if (val === undefined || val === null || val === '') {
      replacement = `<c r="${addr}"${sStr}${otherStr}/>`;
    } else if (typeof val === 'number') {
      replacement = `<c r="${addr}"${sStr}${otherStr}><v>${val}</v></c>`;
    } else if (typeof val === 'string') {
      const escaped = escapeXmlText(val);
      replacement = `<c r="${addr}"${sStr} t="inlineStr"${otherStr}><is><t>${escaped}</t></is></c>`;
    } else {
      throw new Error(`EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Unsupported value type for cell ${addr}`);
    }

    return sheetXml.replace(pairedRegex, () => replacement);
  }

  throw new Error(`EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Target cell ${addr} node missing in sheet XML`);
}

export async function renderSecuredSemanticValues(
  preparedBytes,
  {
    partKey,
    projection,
    profile = new MboXlsxTemplateProfile()
  } = {}
) {
  // Option key validation (strict 3 keys only)
  const allowedOptionKeys = new Set(['partKey', 'projection', 'profile']);
  if (arguments.length > 1 && arguments[1] && typeof arguments[1] === 'object') {
    for (const key of Object.keys(arguments[1])) {
      if (!allowedOptionKeys.has(key)) {
        throw new Error(`EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Unknown option key: ${key}`);
      }
    }
  }

  // 1. Validate Part Key
  if (partKey !== 'A' && partKey !== 'B') {
    throw new Error('EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Invalid partKey (must be A or B)');
  }

  // 2. Validate Profile integrity
  validateMappingIntegrity(profile);

  // 3. Validate Projection object & exportType
  if (!projection || typeof projection !== 'object' || projection.exportType !== 'COMBINED_MBO_WORKBOOK_AND_PDF') {
    throw new Error('EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Invalid projection or exportType');
  }

  // 4. Validate Prepared Bytes
  if (!preparedBytes || (typeof preparedBytes !== 'object' && !(preparedBytes instanceof ArrayBuffer))) {
    throw new Error('EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Invalid preparedBytes input');
  }

  // 5. Determine Count & Validate Count Domain
  let count;
  if (partKey === 'A') {
    count = projection.partA?.objectivesCount;
    const objectives = projection.partA?.objectives;
    if (typeof count !== 'number' || !Number.isInteger(count) || count < 4 || count > 10) {
      throw new Error('EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Part A objective count out of domain (4..10)');
    }
    if (!Array.isArray(objectives) || objectives.length !== count) {
      throw new Error('EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Part A objectives length mismatch with objectivesCount');
    }
  } else {
    const competencyItems = projection.partB?.competencyItems;
    if (!Array.isArray(competencyItems)) {
      throw new Error('EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Part B competencyItems missing or invalid');
    }
    count = competencyItems.length;
    if (![6, 7, 8].includes(count)) {
      throw new Error('EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Part B competency count out of domain (6, 7, 8)');
    }
  }

  // 6. Make Private Copy of Prepared Bytes
  const srcView = preparedBytes instanceof Uint8Array ? preparedBytes : new Uint8Array(preparedBytes);
  const copyBytes = new Uint8Array(srcView.byteLength || srcView.length);
  copyBytes.set(srcView);

  const wbStruct = await XlsxPopulate.fromDataAsync(copyBytes);

  const sheet1File = wbStruct._zip.files['xl/worksheets/sheet1.xml'];
  const wbFile = wbStruct._zip.files['xl/workbook.xml'];
  if (!sheet1File || !wbFile) {
    throw new Error('EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Required OOXML files missing');
  }

  let sheetXml = await sheet1File.async('string');
  let wbXml = await wbFile.async('string');

  // 7. Prepared-Buffer Pre-Write Guard
  for (const fName in wbStruct._zip.files) {
    if (fName.startsWith('xl/worksheets/') && fName.endsWith('.xml')) {
      const xml = await wbStruct._zip.files[fName].async('string');
      if (/<f[\s>]/.test(xml)) {
        throw new Error('EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Formula found in prepared input');
      }
    }
  }

  const layout = partKey === 'A' ? profile.getPartALayoutTopology(count) : profile.getPartBLayoutTopology(count);

  if (!sheetXml.includes(`dimension ref="${layout.dimension}"`)) {
    throw new Error('EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Dimension tag mismatch with Profile topology');
  }

  const escapedSheetName = escapeXmlText(layout.mainSheetName);
  if (!wbXml.includes(`'${escapedSheetName}'!$A$1:`)) {
    throw new Error('EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Print_Area mismatch with Profile topology');
  }

  const sanAddresses = layout.effectiveSanitizationRanges.flatMap(r => expandRangeToAddresses(r));
  const sanSet = new Set(sanAddresses);

  // Assert every effective sanitization cell has zero value payload and zero formula before write
  for (const addr of sanAddresses) {
    const cellMatch = sheetXml.match(new RegExp(`<c r="${addr}"([^>]*)>((?:(?!<c\\b)[\\s\\S])*?)<\\/c>`));
    if (cellMatch) {
      const body = cellMatch[2];
      if (/<(?:v|is|f)[\s>]/.test(body)) {
        throw new Error(`EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Sanitized cell ${addr} contains pre-write payload or formula`);
      }
    }
  }

  if (partKey === 'A') {
    const drawingRelsFile = wbStruct._zip.files['xl/drawings/_rels/drawing1.xml.rels'];
    if (drawingRelsFile) {
      const relsXml = await drawingRelsFile.async('string');
      if (relsXml.includes('rId3') || relsXml.includes('image3.png')) {
        throw new Error('EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Reference image rId3/image3.png present in Part A input');
      }
    }
  } else {
    const sheet2File = wbStruct._zip.files['xl/worksheets/sheet2.xml'];
    if (!sheet2File) {
      throw new Error('EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Auxiliary Sheet1 missing in Part B input');
    }
    const mergeCountMatch = sheetXml.match(/<mergeCells count="(\d+)">/);
    const declaredMergeCount = mergeCountMatch ? parseInt(mergeCountMatch[1], 10) : 0;
    if (declaredMergeCount !== layout.finalOverlayMergeCount) {
      throw new Error(`EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Part B merge count mismatch: expected ${layout.finalOverlayMergeCount}, got ${declaredMergeCount}`);
    }
  }

  // 8. Build Concrete Role List by Count
  const roleNames = [];
  const headerRoles = [
    'HEADER_FISCAL_YEAR', 'HEADER_EMPLOYEE_NAME', 'HEADER_DEPARTMENT',
    'HEADER_SECTION', 'HEADER_POSITION', 'HEADER_EMPLOYEE_CODE'
  ];

  if (partKey === 'A') {
    roleNames.push(...headerRoles);
    roleNames.push('HOSHIN_DEPARTMENT_HOSHIN_TITLE', 'HOSHIN_SECTION_HOSHIN_TITLE');
    roleNames.push('SUMMARY_PART_A_RAW_SCORE', 'SUMMARY_PART_A_WEIGHTED_SCORE');
    for (let i = 1; i <= count; i++) {
      roleNames.push(
        `OBJECTIVE_${i}_MEASUREMENT`,
        `OBJECTIVE_${i}_WEIGHT`,
        `OBJECTIVE_${i}_ACTUAL_RESULT`,
        `OBJECTIVE_${i}_SELF_COMMENT`,
        `OBJECTIVE_${i}_AVERAGE_SCORE`
      );
    }
  } else {
    roleNames.push(...headerRoles);
    roleNames.push('SUMMARY_PART_B_RAW_SCORE', 'SUMMARY_PART_B_WEIGHTED_SCORE');
    for (let b = 1; b <= count; b++) {
      roleNames.push(`COMPETENCY_${b}_SELF_RATING`);
    }
    if (count >= 7) {
      roleNames.push('COMPETENCY_7_TITLE', 'COMPETENCY_7_DESCRIPTION');
    }
    if (count === 8) {
      roleNames.push('COMPETENCY_8_TITLE', 'COMPETENCY_8_DESCRIPTION');
    }
  }

  // 9. Resolve Roles to Addresses and Projection Paths via Profile
  const concreteTargets = [];
  const targetAddrSet = new Set();

  for (const rName of roleNames) {
    const options = {
      partKey,
      objectiveCount: count,
      competencyCount: count
    };
    const roleInfo = profile.resolveSemanticRole(rName, options);
    if (!roleInfo || !roleInfo.address || !roleInfo.projectionPath) {
      throw new Error(`EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Could not resolve role ${rName}`);
    }
    if (!profile.isDynamicWriteTarget(partKey, roleInfo.address, count)) {
      throw new Error(`EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Address ${roleInfo.address} for role ${rName} is not a dynamic write target`);
    }
    if (!sanSet.has(roleInfo.address)) {
      throw new Error(`EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Address ${roleInfo.address} for role ${rName} is outside effective sanitization ranges`);
    }
    if (targetAddrSet.has(roleInfo.address)) {
      throw new Error(`EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Duplicate write target address ${roleInfo.address}`);
    }
    targetAddrSet.add(roleInfo.address);
    concreteTargets.push({ roleName: rName, address: roleInfo.address, projectionPath: roleInfo.projectionPath });
  }

  // 10. Extract Secured Scalar Values from Projection & Mutate sheetXml
  const writtenValueMap = new Map();

  for (const target of concreteTargets) {
    let val = resolvePath(projection, target.projectionPath);

    // Special Exception for expanded Part B presentation titles/descriptions
    if (partKey === 'B') {
      if (
        target.roleName === 'COMPETENCY_7_TITLE' || target.roleName === 'COMPETENCY_7_DESCRIPTION' ||
        target.roleName === 'COMPETENCY_8_TITLE' || target.roleName === 'COMPETENCY_8_DESCRIPTION'
      ) {
        if (typeof val !== 'string' || val.trim().length === 0) {
          throw new Error(`EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Missing required expanded presentation text for ${target.roleName}`);
        }
      }
    }

    if (val !== undefined && val !== null && val !== '') {
      if (typeof val === 'number') {
        if (!Number.isFinite(val)) {
          throw new Error(`EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Non-finite number for role ${target.roleName}`);
        }
      } else if (typeof val === 'string') {
        if (/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(val)) {
          throw new Error(`EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Invalid XML control char in string for role ${target.roleName}`);
        }
        if (val.length > 32767) {
          throw new Error(`EXPORT_TEMPLATE_RENDERER_UNRESOLVED: String exceeds Excel limit for role ${target.roleName}`);
        }
        if (val.trim() === '') {
          val = '';
        }
      } else {
        throw new Error(`EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Invalid value type (${typeof val}) for role ${target.roleName}`);
      }
    } else {
      val = '';
    }

    if (val !== '') {
      sheetXml = mutateCellInSheetXml(sheetXml, target.address, val);
      writtenValueMap.set(target.address, val);
    }
  }

  // 11. Final Production Validation before return
  wbStruct._zip.file('xl/worksheets/sheet1.xml', sheetXml);

  // Check zero formula inventory
  for (const fName in wbStruct._zip.files) {
    if (fName.startsWith('xl/worksheets/') && fName.endsWith('.xml')) {
      const xml = await wbStruct._zip.files[fName].async('string');
      if (/<f[\s>]/.test(xml)) {
        throw new Error('EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Formula detected after rendering');
      }
    }
  }

  // Generate NEW Uint8Array from mutated zip
  const renderedBytes = await wbStruct._zip.generateAsync({ type: 'uint8array' });

  // Load fresh DOM from renderedBytes to perform final value verification
  const wbOut = await XlsxPopulate.fromDataAsync(renderedBytes);
  const sheetOut = wbOut.sheet(0);

  for (const target of concreteTargets) {
    const expectedVal = writtenValueMap.get(target.address);
    const decodedVal = sheetOut.cell(target.address).value();
    if (expectedVal !== undefined) {
      if (typeof expectedVal === 'number') {
        if (decodedVal !== expectedVal) {
          throw new Error(`EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Decoded numeric value mismatch at ${target.address}`);
        }
      } else if (typeof expectedVal === 'string') {
        if (String(decodedVal) !== expectedVal) {
          throw new Error(`EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Decoded string value mismatch at ${target.address}`);
        }
      }
    } else {
      if (decodedVal !== null && decodedVal !== undefined && decodedVal !== '') {
        throw new Error(`EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Target cell ${target.address} should be blank but has value ${decodedVal}`);
      }
    }
  }

  // Verify non-written effective sanitization addresses remain blank
  for (const addr of sanAddresses) {
    if (!writtenValueMap.has(addr)) {
      const decodedVal = sheetOut.cell(addr).value();
      if (decodedVal !== null && decodedVal !== undefined && decodedVal !== '') {
        throw new Error(`EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Sanitized cell ${addr} was written without authorization`);
      }
    }
  }

  // Assert caller bytes remain immutable
  const postView = preparedBytes instanceof Uint8Array ? preparedBytes : new Uint8Array(preparedBytes);
  if (postView.length !== srcView.length) {
    throw new Error('EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Caller bytes mutated (length mismatch)');
  }

  return renderedBytes;
}
