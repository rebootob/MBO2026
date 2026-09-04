/**
 * Production Secured Semantic Value Renderer — Part A + Part B (R2-C-R3)
 * 
 * Browser-safe asynchronous renderer:
 *   - Consumes prepared + sanitized XLSX bytes, secured projection object, and Template Profile.
 *   - Performs raw OOXML target-cell-only mutation on xl/worksheets/sheet1.xml.
 *   - Matches and mutates exact unprefixed r="ADDR" and unprefixed t="..." attributes only.
 *   - Preserves exact raw opening tag attributes, attribute values, and attribute ordering.
 *   - Resolves all write targets through profile.resolveSemanticRole(roleName, { partKey, objectiveCount, competencyCount }).
 *   - Zero calculation, zero raw-record lookup, zero formula creation, zero hard-coded workbook addresses.
 */
import JSZip from 'jszip';
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

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

function isValidXml10String(str) {
  if (typeof str !== 'string') return false;
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(str)) return false;
  if (/[\uFFFE\uFFFF]/.test(str)) return false;
  if (/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/.test(str)) return false;
  if (/(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/.test(str)) return false;
  return true;
}

function mutateOpeningTag(fullOpenTag, targetTVal) {
  const hasUnprefixedT = /(?<=\s|^)t="[^"]*"/.test(fullOpenTag);
  let newTag = fullOpenTag;
  if (targetTVal === 'inlineStr') {
    if (hasUnprefixedT) {
      newTag = newTag.replace(/(?<=\s|^)t="[^"]*"/, 't="inlineStr"');
    } else {
      if (newTag.endsWith('/>')) {
        newTag = newTag.slice(0, -2) + ' t="inlineStr"/>';
      } else if (newTag.endsWith('>')) {
        newTag = newTag.slice(0, -1) + ' t="inlineStr">';
      }
    }
  } else if (targetTVal === null) {
    if (hasUnprefixedT) {
      newTag = newTag.replace(/(?<=\s|^)t="[^"]*"/, '');
    }
  }
  return newTag;
}

function mutateCellInSheetXml(sheetXml, addr, val) {
  const selfRegex = new RegExp(`<c\\b[^>]*?(?<=[\\s<])r="${addr}"(?=[\\s/>])[^>]*?\\/>`);
  const selfMatch = sheetXml.match(selfRegex);

  if (selfMatch) {
    const fullSelfTag = selfMatch[0];

    if (val === undefined || val === null || val === '') {
      const newSelfTag = mutateOpeningTag(fullSelfTag, null);
      return sheetXml.replace(fullSelfTag, () => newSelfTag);
    } else if (typeof val === 'number') {
      const openTag = fullSelfTag.slice(0, -2) + '>';
      const mutatedOpen = mutateOpeningTag(openTag, null);
      const newPairedTag = `${mutatedOpen}<v>${val}</v></c>`;
      return sheetXml.replace(fullSelfTag, () => newPairedTag);
    } else if (typeof val === 'string') {
      const openTag = fullSelfTag.slice(0, -2) + '>';
      const mutatedOpen = mutateOpeningTag(openTag, 'inlineStr');
      const escaped = escapeXmlText(val);
      const spaceAttr = /^\s|\s$/.test(val) ? ' xml:space="preserve"' : '';
      const newPairedTag = `${mutatedOpen}<is><t${spaceAttr}>${escaped}</t></is></c>`;
      return sheetXml.replace(fullSelfTag, () => newPairedTag);
    } else {
      throw new Error(`EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Unsupported value type for cell ${addr}`);
    }
  }

  const pairedRegex = new RegExp(`(<c\\b[^>]*?(?<=[\\s<])r="${addr}"(?=[\\s/>])[^>/]*>)((?:(?!<c\\b)[\\s\\S])*?)(<\\/c>)`);
  const pairedMatch = sheetXml.match(pairedRegex);

  if (pairedMatch) {
    const oldMatchStr = pairedMatch[0];
    const fullOpenTag = pairedMatch[1];
    const body = pairedMatch[2];
    if (body && /<f[\s>]/.test(body)) {
      throw new Error(`EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Target cell ${addr} contains formula`);
    }

    if (val === undefined || val === null || val === '') {
      const selfOpen = fullOpenTag.slice(0, -1) + '/>';
      const mutatedSelf = mutateOpeningTag(selfOpen, null);
      return sheetXml.replace(oldMatchStr, () => mutatedSelf);
    } else if (typeof val === 'number') {
      const mutatedOpen = mutateOpeningTag(fullOpenTag, null);
      const newPairedTag = `${mutatedOpen}<v>${val}</v></c>`;
      return sheetXml.replace(oldMatchStr, () => newPairedTag);
    } else if (typeof val === 'string') {
      const mutatedOpen = mutateOpeningTag(fullOpenTag, 'inlineStr');
      const escaped = escapeXmlText(val);
      const spaceAttr = /^\s|\s$/.test(val) ? ' xml:space="preserve"' : '';
      const newPairedTag = `${mutatedOpen}<is><t${spaceAttr}>${escaped}</t></is></c>`;
      return sheetXml.replace(oldMatchStr, () => newPairedTag);
    } else {
      throw new Error(`EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Unsupported value type for cell ${addr}`);
    }
  }

  throw new Error(`EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Target cell ${addr} node missing in sheet XML`);
}

function normalizeTargetNodesForPreservation(srcSheetXml, renderedSheetXml, targetAddrs) {
  let normSrc = srcSheetXml;
  let normRendered = renderedSheetXml;

  for (const addr of targetAddrs) {
    const nodeRegex = new RegExp(`<c\\b[^>]*?(?<=[\\s<])r="${addr}"(?=[\\s/>])(?:[^>]*?\\/>|[^>]*?>[\\s\\S]*?<\\/c>)`);
    const srcMatch = normSrc.match(nodeRegex);
    const renderedMatch = normRendered.match(nodeRegex);

    if (!srcMatch || !renderedMatch) {
      continue;
    }

    const srcFullNode = srcMatch[0];
    const renderedFullNode = renderedMatch[0];

    const srcOpenMatch = srcFullNode.match(/^<c\b[^>]*?>/);
    const renderedOpenMatch = renderedFullNode.match(/^<c\b[^>]*?>/);
    if (!srcOpenMatch || !renderedOpenMatch) continue;

    const srcOpenTag = srcOpenMatch[0];
    const renderedOpenTag = renderedOpenMatch[0];

    const srcCleanAttrs = srcOpenTag
      .replace(/^<c\s*/, '')
      .replace(/\/?>$/, '')
      .replace(/(?<=\s|^)t="[^"]*"\s*/, '')
      .trim();

    const renderedCleanAttrs = renderedOpenTag
      .replace(/^<c\s*/, '')
      .replace(/\/?>$/, '')
      .replace(/(?<=\s|^)t="[^"]*"\s*/, '')
      .trim();

    const normSrcNode = srcCleanAttrs ? `<c ${srcCleanAttrs}/>` : '<c/>';
    const normRenderedNode = renderedCleanAttrs ? `<c ${renderedCleanAttrs}/>` : '<c/>';

    normSrc = normSrc.replace(srcFullNode, () => normSrcNode);
    normRendered = normRendered.replace(renderedFullNode, () => normRenderedNode);
  }

  return { normSrc, normRendered };
}

export async function renderSecuredSemanticValues(
  preparedBytes,
  {
    partKey,
    projection,
    profile = new MboXlsxTemplateProfile()
  } = {}
) {
  // 1. Option key validation (strict 3 keys only)
  const allowedOptionKeys = new Set(['partKey', 'projection', 'profile']);
  if (arguments.length > 1 && arguments[1] && typeof arguments[1] === 'object') {
    for (const key of Object.keys(arguments[1])) {
      if (!allowedOptionKeys.has(key)) {
        throw new Error(`EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Unknown option key: ${key}`);
      }
    }
  }

  // 2. Validate Part Key
  if (partKey !== 'A' && partKey !== 'B') {
    throw new Error('EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Invalid partKey (must be A or B)');
  }

  // 3. Validate Profile integrity
  validateMappingIntegrity(profile);

  // 4. Validate Projection object & exportType
  if (!projection || typeof projection !== 'object' || projection.exportType !== 'COMBINED_MBO_WORKBOOK_AND_PDF') {
    throw new Error('EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Invalid projection or exportType');
  }

  // 5. Validate Prepared Bytes
  if (!preparedBytes || (typeof preparedBytes !== 'object' && !(preparedBytes instanceof ArrayBuffer))) {
    throw new Error('EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Invalid preparedBytes input');
  }

  // 6. Determine Count & Validate Count Domain
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

  // 7. Make Private Copy & Snapshot of Prepared Bytes
  const srcView = preparedBytes instanceof Uint8Array ? preparedBytes : new Uint8Array(preparedBytes);
  const srcSnapshot = new Uint8Array(srcView.byteLength || srcView.length);
  srcSnapshot.set(srcView);

  const zip = await JSZip.loadAsync(srcSnapshot);

  const sheet1File = zip.file('xl/worksheets/sheet1.xml');
  const wbFile = zip.file('xl/workbook.xml');
  const wbRelsFile = zip.file('xl/_rels/workbook.xml.rels');
  if (!sheet1File || !wbFile || !wbRelsFile) {
    throw new Error('EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Required OOXML files missing');
  }

  const srcSheet1Xml = await sheet1File.async('string');
  const wbXml = await wbFile.async('string');
  const wbRelsXml = await wbRelsFile.async('string');
  let sheetXml = srcSheet1Xml;

  const layout = partKey === 'A' ? profile.getPartALayoutTopology(count) : profile.getPartBLayoutTopology(count);

  // R1-A.1 / R2-F: Workbook main sheet identity & relationship binding to sheet1.xml
  const escapedMainSheetName = escapeXmlText(layout.mainSheetName);
  const sheetEntryRegex = new RegExp(`<sheet[^>]*name="${escapeRegExp(escapedMainSheetName)}"[^>]*r:id="([^"]+)"`);
  const sheetEntryMatch = wbXml.match(sheetEntryRegex);
  if (!sheetEntryMatch) {
    throw new Error('EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Main sheet entry missing in workbook.xml');
  }
  const mainSheetRId = sheetEntryMatch[1];

  const relRegex = new RegExp(`<Relationship[^>]*Id="${mainSheetRId}"[^>]*Target="([^"]+)"`);
  const relMatch = wbRelsXml.match(relRegex);
  if (!relMatch) {
    throw new Error('EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Main sheet relationship missing in workbook.xml.rels');
  }
  const mainSheetTarget = relMatch[1];
  if (mainSheetTarget !== 'worksheets/sheet1.xml' && mainSheetTarget !== 'xl/worksheets/sheet1.xml') {
    throw new Error(`EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Main sheet target mismatch: expected worksheets/sheet1.xml, got ${mainSheetTarget}`);
  }

  // R1-A.2 / R2-F: Print_Area definedName inventory & attributes
  const printAreaMatches = [...wbXml.matchAll(/<definedName[^>]*name="_xlnm\.Print_Area"[^>]*>([\s\S]*?)<\/definedName>/g)];
  if (printAreaMatches.length !== 1) {
    throw new Error(`EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Print_Area inventory count must be 1, found ${printAreaMatches.length}`);
  }
  const printAreaNodeStr = printAreaMatches[0][0];
  if (!printAreaNodeStr.includes('localSheetId="0"')) {
    throw new Error('EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Print_Area missing localSheetId="0"');
  }
  const printAreaText = printAreaMatches[0][1].trim();
  const expectedPrintAreaEscaped = layout.printArea.replace(/&/g, '&amp;');
  if (printAreaText !== expectedPrintAreaEscaped) {
    throw new Error(`EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Print_Area text mismatch: expected ${expectedPrintAreaEscaped}, got ${printAreaText}`);
  }

  // R1-A.5: Dimension tag
  if (!sheetXml.includes(`dimension ref="${layout.dimension}"`)) {
    throw new Error('EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Dimension tag mismatch with Profile topology');
  }

  // R1-A.6: Formula inventory = 0
  for (const fName in zip.files) {
    if (fName.startsWith('xl/worksheets/') && fName.endsWith('.xml')) {
      const xml = await zip.files[fName].async('string');
      if (/<f[\s>]/.test(xml)) {
        throw new Error('EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Formula found in prepared input');
      }
    }
  }

  // R1-A.7: Pre-write payload check on effective sanitization addresses
  const sanAddresses = layout.effectiveSanitizationRanges.flatMap(r => expandRangeToAddresses(r));
  const sanSet = new Set(sanAddresses);

  for (const addr of sanAddresses) {
    const pairedMatch = sheetXml.match(new RegExp(`<c\\b[^>]*?(?<=[\\s<])r="${addr}"(?=[\\s\\/>])[^>\\/]*>([\\s\\S]*?)<\\/c>`));
    if (pairedMatch) {
      const body = pairedMatch[1];
      if (/<(?:v|is|f|t)[\s>]/.test(body)) {
        throw new Error(`EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Sanitized cell ${addr} contains pre-write payload or formula`);
      }
    }
  }

  // R1-A.8 / R2-F: Part A / Part B specific guards
  if (partKey === 'A') {
    // Reject image3.png in xl/media/
    if (zip.files['xl/media/image3.png']) {
      throw new Error('EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Forbidden image3.png present in Part A input');
    }
    // Reject image3.png / rId3 in drawing rels
    const drawingRelsFile = zip.files['xl/drawings/_rels/drawing1.xml.rels'];
    if (drawingRelsFile) {
      const relsXml = await drawingRelsFile.async('string');
      if (relsXml.includes('rId3') || relsXml.includes('image3.png')) {
        throw new Error('EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Reference image rId3/image3.png present in Part A input');
      }
    }
  } else {
    // Part B checks:
    const sheet2File = zip.files['xl/worksheets/sheet2.xml'];
    if (!sheet2File) {
      throw new Error('EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Auxiliary Sheet1 missing in Part B input');
    }

    // Verify Sheet1 in workbook.xml binds to xl/worksheets/sheet2.xml
    const auxSheetEntryMatch = wbXml.match(/<sheet[^>]*name="Sheet1"[^>]*r:id="([^"]+)"/);
    if (!auxSheetEntryMatch) {
      throw new Error('EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Auxiliary Sheet1 missing in workbook.xml');
    }
    const auxSheetRId = auxSheetEntryMatch[1];
    const auxRelMatch = wbRelsXml.match(new RegExp(`<Relationship[^>]*Id="${auxSheetRId}"[^>]*Target="([^"]+)"`));
    if (!auxRelMatch || (auxRelMatch[1] !== 'worksheets/sheet2.xml' && auxRelMatch[1] !== 'xl/worksheets/sheet2.xml')) {
      throw new Error('EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Auxiliary Sheet1 binding mismatch');
    }

    // Merge counts: declared merge count == actual merge inventory count == Profile final merge count
    const declaredMergeMatch = sheetXml.match(/<mergeCells count="(\d+)">/);
    const declaredMergeCount = declaredMergeMatch ? parseInt(declaredMergeMatch[1], 10) : 0;
    const actualMerges = [...sheetXml.matchAll(/<mergeCell ref="([A-Z0-9:]+)"\/>/g)].map(m => m[1]);
    const actualMergeSet = new Set(actualMerges);

    if (declaredMergeCount !== layout.finalOverlayMergeCount || actualMerges.length !== layout.finalOverlayMergeCount) {
      throw new Error(`EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Part B merge count mismatch: expected ${layout.finalOverlayMergeCount}, declared ${declaredMergeCount}, actual ${actualMerges.length}`);
    }

    // Every ratingScaleStaticRanges merge exists exactly as authorized
    for (const staticRange of layout.ratingScaleStaticRanges) {
      if (!actualMergeSet.has(staticRange)) {
        throw new Error(`EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Rating Scale static merge ${staticRange} missing`);
      }
    }

    // Every protected padding row exists exactly once
    for (const padRow of layout.protectedPaddingRows) {
      const rowMatches = [...sheetXml.matchAll(new RegExp(`<row[^>]*r="${padRow}"[^>]*>`, 'g'))];
      if (rowMatches.length !== 1) {
        throw new Error(`EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Protected padding row ${padRow} missing`);
      }
    }
  }

  // R1-A.10 / R2-C / R2-D: Concrete Profile-derived target node existence & uniqueness
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

  const concreteTargets = [];
  const targetAddrSet = new Set();

  for (const rName of roleNames) {
    const roleOptions = {
      partKey,
      objectiveCount: count,
      competencyCount: count
    };
    const roleInfo = profile.resolveSemanticRole(rName, roleOptions);
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

  // Check that EVERY target cell node exists EXACTLY ONCE in sheetXml using exact unprefixed r="ADDR"
  for (const target of concreteTargets) {
    const addr = target.address;
    const matches = [...sheetXml.matchAll(new RegExp(`<c\\b[^>]*?(?<=[\\s<])r="${addr}"(?=[\\s\\/>])[^>]*?\\/>|<c\\b[^>]*?(?<=[\\s<])r="${addr}"(?=[\\s\\/>])[^>\\/]*>[\\s\\S]*?<\\/c>`, 'g'))];
    if (matches.length === 0) {
      throw new Error(`EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Target cell node ${addr} missing in sheet XML`);
    }
    if (matches.length > 1) {
      throw new Error(`EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Target cell node ${addr} duplicate in sheet XML`);
    }
  }

  // R1-B / R2-A / R3-F: Extract Secured Scalar Values & Mutate sheetXml
  const writtenValueMap = new Map();

  for (const target of concreteTargets) {
    let val = resolvePath(projection, target.projectionPath);

    // Expanded Part B presentation titles/descriptions exception
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
        if (!isValidXml10String(val)) {
          throw new Error(`EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Invalid XML 1.0 string for role ${target.roleName}`);
        }
        if (val.length > 32767) {
          throw new Error(`EXPORT_TEMPLATE_RENDERER_UNRESOLVED: String exceeds Excel limit for role ${target.roleName}`);
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

  // R2-B / R3-B: Production Post-Write Preservation Validation
  zip.file('xl/worksheets/sheet1.xml', sheetXml);

  // Generate NEW Uint8Array from mutated zip directly (preserving all raw XML attributes)
  const renderedBytes = await zip.generateAsync({ type: 'uint8array' });

  // 1. Package entry inventory unchanged & non-sheet1 byte equality
  const renderedZip = await JSZip.loadAsync(renderedBytes);
  const srcZipKeys = Object.keys(zip.files).sort();
  const renderedZipKeys = Object.keys(renderedZip.files).sort();

  if (renderedZipKeys.length !== srcZipKeys.length) {
    throw new Error('EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Package entry inventory count mismatch');
  }
  for (let i = 0; i < srcZipKeys.length; i++) {
    if (srcZipKeys[i] !== renderedZipKeys[i]) {
      throw new Error(`EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Package entry key mismatch at index ${i}`);
    }
    const key = srcZipKeys[i];
    if (key !== 'xl/worksheets/sheet1.xml') {
      const srcBytes = await zip.files[key].async('uint8array');
      const renderedBytesEntry = await renderedZip.files[key].async('uint8array');
      if (srcBytes.length !== renderedBytesEntry.length) {
        throw new Error(`EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Non-sheet1 entry ${key} length mismatch`);
      }
      for (let b = 0; b < srcBytes.length; b++) {
        if (srcBytes[b] !== renderedBytesEntry[b]) {
          throw new Error(`EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Non-sheet1 entry ${key} byte mismatch at offset ${b}`);
        }
      }
    }
  }

  // 2. Cell address inventory unchanged before vs after (unprefixed r="ADDR" check)
  const srcCellAddrs = [...srcSheet1Xml.matchAll(/<c\b[^>]*?(?<=[\s<])r="([A-Z0-9]+)"(?=[\s/>])/g)].map(m => m[1]);
  const renderedCellAddrs = [...sheetXml.matchAll(/<c\b[^>]*?(?<=[\s<])r="([A-Z0-9]+)"(?=[\s/>])/g)].map(m => m[1]);
  if (renderedCellAddrs.length !== srcCellAddrs.length) {
    throw new Error(`EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Cell address inventory count mismatch: expected ${srcCellAddrs.length}, got ${renderedCellAddrs.length}`);
  }
  for (let i = 0; i < srcCellAddrs.length; i++) {
    if (srcCellAddrs[i] !== renderedCellAddrs[i]) {
      throw new Error(`EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Cell address inventory mismatch at index ${i}`);
    }
  }

  // 3. Target non-type opening tag authority unchanged (unprefixed t="..." check)
  for (const target of concreteTargets) {
    const addr = target.address;
    const srcMatch = srcSheet1Xml.match(new RegExp(`<c\\b[^>]*?(?<=[\\s<])r="${addr}"(?=[\\s\\/>])[^>]*?>|<c\\b[^>]*?(?<=[\\s<])r="${addr}"(?=[\\s\\/>])[^>]*?\\/>`));
    const renderedMatch = sheetXml.match(new RegExp(`<c\\b[^>]*?(?<=[\\s<])r="${addr}"(?=[\\s\\/>])[^>]*?>|<c\\b[^>]*?(?<=[\\s<])r="${addr}"(?=[\\s\\/>])[^>]*?\\/>`));
    if (srcMatch && renderedMatch) {
      const srcAttrsClean = srcMatch[0].replace(/\/?>$/, '').replace(/(?<=\s|^)t="[^"]*"/, '').trim();
      const renderedAttrsClean = renderedMatch[0].replace(/\/?>$/, '').replace(/(?<=\s|^)t="[^"]*"/, '').trim();
      if (srcAttrsClean !== renderedAttrsClean) {
        throw new Error(`EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Non-type target opening tag modified for ${addr}`);
      }
    }
  }

  // 4. Formula inventory zero check
  for (const fName in renderedZip.files) {
    if (fName.startsWith('xl/worksheets/') && fName.endsWith('.xml')) {
      const xml = await renderedZip.files[fName].async('string');
      if (/<f[\s>]/.test(xml)) {
        throw new Error('EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Formula detected after rendering');
      }
    }
  }

  // 5. Complete sheet1.xml prepared-before preservation check (R5-B)
  const targetAddrs = concreteTargets.map(t => t.address);
  const { normSrc: normSrcSheet1, normRendered: normRenderedSheet1 } = normalizeTargetNodesForPreservation(srcSheet1Xml, sheetXml, targetAddrs);
  if (normRenderedSheet1 !== normSrcSheet1) {
    console.log("PRESERVATION FAIL: normSrc len=", normSrcSheet1.length, "normRend len=", normRenderedSheet1.length);
    for (let i = 0; i < Math.max(normSrcSheet1.length, normRenderedSheet1.length); i++) {
      if (normSrcSheet1[i] !== normRenderedSheet1[i]) {
        console.log(`Diff offset ${i}:\nSRC:  ${JSON.stringify(normSrcSheet1.slice(Math.max(0, i-20), i+40))}\nREND: ${JSON.stringify(normRenderedSheet1.slice(Math.max(0, i-20), i+40))}`);
        break;
      }
    }
    throw new Error('EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Complete sheet1 preservation check failed');
  }

  // Load fresh DOM from renderedBytes to perform final value & topology verification
  const wbOut = await XlsxPopulate.fromDataAsync(renderedBytes);
  const sheetOut = wbOut.sheet(0);

  // Verify every written target decodes to exact secured scalar truth
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

  // Assert caller bytes content-identical to pre-call snapshot
  const postView = preparedBytes instanceof Uint8Array ? preparedBytes : new Uint8Array(preparedBytes);
  if (postView.length !== srcSnapshot.length) {
    throw new Error('EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Caller bytes length mutated');
  }
  for (let i = 0; i < postView.length; i++) {
    if (postView[i] !== srcSnapshot[i]) {
      throw new Error(`EXPORT_TEMPLATE_RENDERER_UNRESOLVED: Caller bytes content mutated at offset ${i}`);
    }
  }

  return renderedBytes;
}
