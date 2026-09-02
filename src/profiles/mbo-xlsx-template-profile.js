/**
 * MBO2026 Production XLSX Template Profile / Mapping Foundation
 * 
 * Centralized, pure semantic role-to-address mapping for MBO2026 Part A and Part B templates.
 * 
 * Aligned strictly to canonical baseline:
 * project-docs/CONFIRMED_BASELINE/D2_XLSX_TEMPLATE_SEMANTIC_MAPPING_CLOSURE.md
 * 
 * Rules:
 * - Pure configuration/resolver module (no filesystem I/O, no remote API adapters, no workbook binary parsers).
 * - Exact SHA256 validation for Part A and Part B.
 * - Part A objective counts domain: integer 4..10.
 * - Part B competency counts domain: integer 6, 7, 8.
 * - Exactly 18 SAFE_TO_MAP roles are production writable.
 * - All 22 UNRESOLVED roles throw EXPORT_TEMPLATE_PROFILE_UNRESOLVED.
 * - All 5 NO_SECURED_PROJECTION_SOURCE roles throw EXPORT_TEMPLATE_PROFILE_UNRESOLVED.
 * - Zero formula/scoring recreation.
 * - Zero duplicate exclusive writable targets.
 * - Zero writable roles with null projection path.
 */

export const MBO2026_PROFILE_ID = 'MBO2026';
export const PART_A_TEMPLATE_SHA256 = '03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3';
export const PART_B_TEMPLATE_SHA256 = 'c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3';

export const ACCEPTED_PART_A_OBJECTIVE_COUNTS = Object.freeze([4, 5, 6, 7, 8, 9, 10]);
export const ACCEPTED_PART_B_COMPETENCY_COUNTS = Object.freeze([6, 7, 8]);

export const CHIEF_DYNAMIC_AUTHORITY = 'R:X';
export const SELF_DYNAMIC_AUTHORITY = 'K:Q';

/**
 * Exact 18 SAFE_TO_MAP semantic roles
 */
export const PROVEN_SAFE_ROLES = Object.freeze([
  'HEADER_FISCAL_YEAR',
  'HEADER_EMPLOYEE_NAME',
  'HEADER_DEPARTMENT',
  'HEADER_SECTION',
  'HEADER_POSITION',
  'HEADER_EMPLOYEE_CODE',
  'HOSHIN_DEPARTMENT_HOSHIN_TITLE',
  'HOSHIN_SECTION_HOSHIN_TITLE',
  'OBJECTIVE_MEASUREMENT',
  'OBJECTIVE_WEIGHT',
  'OBJECTIVE_ACTUAL_RESULT',
  'OBJECTIVE_SELF_COMMENT',
  'OBJECTIVE_AVERAGE_SCORE',
  'SUMMARY_PART_A_RAW_SCORE',
  'SUMMARY_PART_A_WEIGHTED_SCORE',
  'COMPETENCY_SELF_RATING',
  'SUMMARY_PART_B_RAW_SCORE',
  'SUMMARY_PART_B_WEIGHTED_SCORE'
]);

/**
 * Exact 22 UNRESOLVED semantic roles
 */
export const UNRESOLVED_ROLES = Object.freeze([
  'HEADER_EMPLOYEE_NAME_TH',
  'HEADER_PROFILE_CODE',
  'HEADER_PROFILE_FAMILY',
  'HEADER_PART_A_WEIGHT_PERCENT',
  'HEADER_CHIEF_NAME',
  'OBJECTIVE_TITLE',
  'OBJECTIVE_DESCRIPTION',
  'OBJECTIVE_KPI',
  'OBJECTIVE_TARGET',
  'OBJECTIVE_PROGRESS_PERCENT',
  'OBJECTIVE_SELF_ACHIEVEMENT',
  'OBJECTIVE_MANAGER_ACHIEVEMENT',
  'OBJECTIVE_MANAGER_SCORE',
  'OBJECTIVE_MANAGER_COMMENT',
  'OBJECTIVE_GM_ACHIEVEMENT',
  'OBJECTIVE_GM_SCORE',
  'OBJECTIVE_GM_COMMENT',
  'OBJECTIVE_DIFFICULTY',
  'SUMMARY_WEIGHT_SUM',
  'SUMMARY_FINAL_SCORE',
  'SUMMARY_FINAL_GRADE',
  'COMPETENCY_CHIEF_RATING'
]);

/**
 * Exact 5 NO_SECURED_PROJECTION_SOURCE semantic roles
 */
export const NO_SECURED_SOURCE_ROLES = Object.freeze([
  'OVERALL_RATING_SUMMARY',
  'EMPLOYEE_COMMENTS',
  'CHIEF_FEEDBACK',
  'EMPLOYEE_SIGNATURE',
  'CHIEF_SIGNATURE'
]);

/**
 * Standard projection path mapping for canonical semantic roles
 */
export const SEMANTIC_PROJECTION_PATHS = Object.freeze({
  HEADER_FISCAL_YEAR: 'partA.header.fiscalYear',
  HEADER_EMPLOYEE_NAME: 'partA.header.employeeName',
  HEADER_DEPARTMENT: 'partA.header.department',
  HEADER_SECTION: 'partA.header.section',
  HEADER_POSITION: 'partA.header.position',
  HEADER_EMPLOYEE_CODE: 'partA.header.employeeCode',

  HOSHIN_DEPARTMENT_HOSHIN_TITLE: 'partA.hoshin.departmentHoshinTitle',
  HOSHIN_SECTION_HOSHIN_TITLE: 'partA.hoshin.sectionHoshinTitle',

  SUMMARY_PART_A_RAW_SCORE: 'partA.summary.rawPartAScore',
  SUMMARY_PART_A_WEIGHTED_SCORE: 'partA.summary.weightedPartAScore',
  SUMMARY_PART_B_RAW_SCORE: 'partB.rawPartBScore',
  SUMMARY_PART_B_WEIGHTED_SCORE: 'partB.weightedPartBScore'
});

/**
 * Helper to get projection path for an objective field
 */
export function getObjectiveProjectionPath(index, fieldKey) {
  const i = index - 1;
  const f = String(fieldKey || '').toLowerCase();
  const fieldPathMap = {
    measurement: `partA.objectives[${i}].measurement`,
    weight: `partA.objectives[${i}].weight`,
    actualresult: `partA.objectives[${i}].actualResult`,
    actual_result: `partA.objectives[${i}].actualResult`,
    selfcomment: `partA.objectives[${i}].selfComment`,
    self_comment: `partA.objectives[${i}].selfComment`,
    averagescore: `partA.objectives[${i}].averageScore`,
    average_score: `partA.objectives[${i}].averageScore`
  };
  return fieldPathMap[f] || null;
}

/**
 * Validate Part A objective count (must be integer 4..10)
 */
export function validatePartAObjectiveCount(count) {
  if (typeof count !== 'number' || !Number.isInteger(count) || count < 4 || count > 10) {
    throw new Error('EXPORT_TEMPLATE_PROFILE_UNRESOLVED');
  }
  return count;
}

/**
 * Validate Part B competency count (must be integer 6, 7, or 8)
 */
export function validatePartBCompetencyCount(count) {
  if (typeof count !== 'number' || !Number.isInteger(count) || ![6, 7, 8].includes(count)) {
    throw new Error('EXPORT_TEMPLATE_PROFILE_UNRESOLVED');
  }
  return count;
}

/**
 * Validate Template SHA256 string
 */
export function validateTemplateSha(partKey, sha) {
  if (typeof sha !== 'string') {
    throw new Error('EXPORT_TEMPLATE_PROFILE_UNRESOLVED');
  }
  const cleanSha = sha.trim().toLowerCase();
  if (partKey === 'A' && cleanSha === PART_A_TEMPLATE_SHA256) {
    return true;
  }
  if (partKey === 'B' && cleanSha === PART_B_TEMPLATE_SHA256) {
    return true;
  }
  throw new Error('EXPORT_TEMPLATE_PROFILE_UNRESOLVED');
}

/**
 * Validate a cell address or range string format (e.g. 'Z7', 'B25:E25')
 */
export function validateAddressFormat(addrStr) {
  if (typeof addrStr !== 'string' || !addrStr) return false;
  const cellRegex = /^[A-Z]{1,3}\d{1,7}$/;
  if (addrStr.includes(':')) {
    const parts = addrStr.split(':');
    return parts.length === 2 && cellRegex.test(parts[0]) && cellRegex.test(parts[1]);
  }
  return cellRegex.test(addrStr);
}

/**
 * Main MBO2026 Production Template Profile Class
 */
export class MboXlsxTemplateProfile {
  constructor(options = {}) {
    if (options.profileId && options.profileId !== MBO2026_PROFILE_ID) {
      throw new Error('EXPORT_TEMPLATE_PROFILE_UNRESOLVED');
    }
    if (options.partASha) {
      validateTemplateSha('A', options.partASha);
    }
    if (options.partBSha) {
      validateTemplateSha('B', options.partBSha);
    }

    this.profileId = MBO2026_PROFILE_ID;
    this.partASha = PART_A_TEMPLATE_SHA256;
    this.partBSha = PART_B_TEMPLATE_SHA256;
    Object.freeze(this);
  }

  validateTemplate(partKey, sha) {
    return validateTemplateSha(partKey, sha);
  }

  getPartAObjectiveDomain() {
    return ACCEPTED_PART_A_OBJECTIVE_COUNTS;
  }

  getPartBCompetencyDomain() {
    return ACCEPTED_PART_B_COMPETENCY_COUNTS;
  }

  /**
   * Get Part A mapping definition for objective count N (4..10)
   */
  getPartAMappings(objectiveCount) {
    const n = validatePartAObjectiveCount(objectiveCount);

    const header = Object.freeze({
      FISCAL_YEAR: 'N6',
      EMPLOYEE_NAME: 'AT7',
      DEPARTMENT: 'Z7',
      SECTION: 'AG7',
      POSITION: 'BD7',
      EMPLOYEE_CODE: 'AQ7'
    });

    const hoshin = Object.freeze({
      DEPARTMENT_HOSHIN_TITLE: 'G16',
      SECTION_HOSHIN_TITLE: 'AM16'
    });

    const objectives = [];
    for (let i = 1; i <= n; i++) {
      const r = 24 + i;
      objectives.push(Object.freeze({
        index: i,
        row: r,
        MEASUREMENT: `T${r}`,
        WEIGHT: `Y${r}`,
        ACTUAL_RESULT: `AK${r}`,
        SELF_COMMENT: `AD${r}`,
        AVERAGE_SCORE: `BC${r}`,

        projectionPaths: Object.freeze({
          measurement: getObjectiveProjectionPath(i, 'measurement'),
          weight: getObjectiveProjectionPath(i, 'weight'),
          actualResult: getObjectiveProjectionPath(i, 'actualResult'),
          selfComment: getObjectiveProjectionPath(i, 'selfComment'),
          averageScore: getObjectiveProjectionPath(i, 'averageScore')
        })
      }));
    }

    const summary = Object.freeze({
      PART_A_RAW_SCORE: `BC${25 + n}`,
      PART_A_WEIGHTED_SCORE: `BC${29 + n}`
    });

    return Object.freeze({
      profileId: this.profileId,
      objectiveCount: n,
      header,
      hoshin,
      objectives: Object.freeze(objectives),
      summary
    });
  }

  /**
   * Get Part B mapping definition for competency count N (6, 7, 8)
   */
  getPartBMappings(competencyCount) {
    const n = validatePartBCompetencyCount(competencyCount);

    const header = Object.freeze({
      FISCAL_YEAR: 'G2',
      DEPARTMENT: 'J3',
      SECTION: 'M3',
      POSITION: 'P3',
      EMPLOYEE_CODE: 'R3',
      EMPLOYEE_NAME: 'S3'
    });

    const protectedPaddingRows = [30];
    if (n >= 7) protectedPaddingRows.push(34);
    if (n === 8) protectedPaddingRows.push(38);

    const extraBlocks = n - 6;
    const summaryStartRow = 31 + 4 * extraBlocks;

    const summary = Object.freeze({
      startRow: summaryStartRow,
      endRow: summaryStartRow + 3,
      PART_B_RAW_SCORE: `B${summaryStartRow}`,
      PART_B_WEIGHTED_SCORE: `I${summaryStartRow}`
    });

    const competencies = [];
    const ratingRows = [9, 13, 17, 21, 25, 29];
    if (n >= 7) ratingRows.push(33);
    if (n === 8) ratingRows.push(37);

    for (let b = 1; b <= n; b++) {
      const r = ratingRows[b - 1];
      competencies.push(Object.freeze({
        index: b,
        row: r,
        SELF_RATING: `K${r}`,
        projectionPath: `partB.competencyItems[${b - 1}].selfRating`
      }));
    }

    return Object.freeze({
      profileId: this.profileId,
      competencyCount: n,
      header,
      protectedPaddingRows: Object.freeze(protectedPaddingRows),
      competencies: Object.freeze(competencies),
      summary
    });
  }

  /**
   * Resolve a named semantic role to its cell/range address and projection path
   */
  resolveSemanticRole(roleName, options = {}) {
    if (!roleName || typeof roleName !== 'string') {
      throw new Error('EXPORT_TEMPLATE_PROFILE_UNRESOLVED');
    }

    const partKey = options.partKey || 'A';
    const objectiveCount = options.objectiveCount !== undefined ? options.objectiveCount : 4;
    const competencyCount = options.competencyCount !== undefined ? options.competencyCount : 6;

    if (partKey === 'A') {
      const mappings = this.getPartAMappings(objectiveCount);

      if (roleName === 'HEADER_EMPLOYEE_NAME_TH' || roleName === 'HEADER_PROFILE_CODE' ||
          roleName === 'HEADER_PROFILE_FAMILY' || roleName === 'HEADER_PART_A_WEIGHT_PERCENT' ||
          roleName === 'HEADER_CHIEF_NAME') {
        throw new Error('EXPORT_TEMPLATE_PROFILE_UNRESOLVED');
      }

      if (roleName.startsWith('HEADER_')) {
        const key = roleName.replace('HEADER_', '');
        if (mappings.header[key]) {
          return {
            address: mappings.header[key],
            projectionPath: SEMANTIC_PROJECTION_PATHS[roleName] || null
          };
        }
      }

      if (roleName === 'HOSHIN_DEPARTMENT_HOSHIN_TITLE') {
        return {
          address: mappings.hoshin.DEPARTMENT_HOSHIN_TITLE,
          projectionPath: SEMANTIC_PROJECTION_PATHS.HOSHIN_DEPARTMENT_HOSHIN_TITLE
        };
      }

      if (roleName === 'HOSHIN_SECTION_HOSHIN_TITLE') {
        return {
          address: mappings.hoshin.SECTION_HOSHIN_TITLE,
          projectionPath: SEMANTIC_PROJECTION_PATHS.HOSHIN_SECTION_HOSHIN_TITLE
        };
      }

      if (roleName === 'SUMMARY_PART_A_RAW_SCORE') {
        return {
          address: mappings.summary.PART_A_RAW_SCORE,
          projectionPath: SEMANTIC_PROJECTION_PATHS.SUMMARY_PART_A_RAW_SCORE
        };
      }

      if (roleName === 'SUMMARY_PART_A_WEIGHTED_SCORE') {
        return {
          address: mappings.summary.PART_A_WEIGHTED_SCORE,
          projectionPath: SEMANTIC_PROJECTION_PATHS.SUMMARY_PART_A_WEIGHTED_SCORE
        };
      }

      if (roleName.startsWith('OBJECTIVE_')) {
        const match = roleName.match(/^OBJECTIVE_(\d+)_(.+)$/);
        if (match) {
          const idx = parseInt(match[1], 10);
          const rawField = match[2];

          // Reject unresolved objective roles
          const forbiddenFields = [
            'TITLE', 'NAME', 'OBJECTIVE_NAME_AND_TARGET', 'DESCRIPTION', 'KPI', 'PLAN_TARGET',
            'TARGET', 'PROGRESS_PERCENT', 'MID_TERM_PROGRESS', 'SELF_ACHIEVEMENT', 'SELF_RATING',
            'MANAGER_ACHIEVEMENT', 'MANAGER_SCORE', 'MANAGER_COMMENT',
            'GM_ACHIEVEMENT', 'GM_SCORE', 'GM_COMMENT', 'DIFFICULTY'
          ];
          if (forbiddenFields.includes(rawField)) {
            throw new Error('EXPORT_TEMPLATE_PROFILE_UNRESOLVED');
          }

          let propKey = rawField;
          if (rawField === 'COMMENT') propKey = 'SELF_COMMENT';

          const obj = mappings.objectives.find(o => o.index === idx);
          if (obj && obj[propKey]) {
            return {
              address: obj[propKey],
              projectionPath: getObjectiveProjectionPath(idx, rawField.toLowerCase())
            };
          }
        }
      }
    } else if (partKey === 'B') {
      const mappings = this.getPartBMappings(competencyCount);

      if (roleName.startsWith('HEADER_')) {
        const key = roleName.replace('HEADER_', '');
        if (mappings.header[key]) {
          return {
            address: mappings.header[key],
            projectionPath: SEMANTIC_PROJECTION_PATHS[roleName] || null
          };
        }
      }

      if (roleName === 'SUMMARY_PART_B_RAW_SCORE') {
        return {
          address: mappings.summary.PART_B_RAW_SCORE,
          projectionPath: SEMANTIC_PROJECTION_PATHS.SUMMARY_PART_B_RAW_SCORE
        };
      }

      if (roleName === 'SUMMARY_PART_B_WEIGHTED_SCORE') {
        return {
          address: mappings.summary.PART_B_WEIGHTED_SCORE,
          projectionPath: SEMANTIC_PROJECTION_PATHS.SUMMARY_PART_B_WEIGHTED_SCORE
        };
      }

      if (roleName.startsWith('COMPETENCY_')) {
        const match = roleName.match(/^COMPETENCY_(\d+)_(.+)$/);
        if (match) {
          const idx = parseInt(match[1], 10);
          const rawField = match[2];

          if (rawField === 'CHIEF_RATING') {
            throw new Error('EXPORT_TEMPLATE_PROFILE_UNRESOLVED');
          }

          if (rawField === 'SELF_RATING' || rawField === 'RATING') {
            const comp = mappings.competencies.find(c => c.index === idx);
            if (comp) {
              return {
                address: comp.SELF_RATING,
                projectionPath: comp.projectionPath
              };
            }
          }
        }
      }
    }

    throw new Error('EXPORT_TEMPLATE_PROFILE_UNRESOLVED');
  }

  /**
   * Check if a given cell address is a dynamic write target.
   */
  isDynamicWriteTarget(partKey, cellAddress, count = 6) {
    if (!cellAddress || typeof cellAddress !== 'string') {
      return false;
    }

    const addr = cellAddress.trim().toUpperCase();
    const match = addr.match(/^([A-Z]+)(\d+)$/);
    if (!match) return false;

    const row = parseInt(match[2], 10);
    const col = match[1];

    if (partKey === 'A') {
      const n = validatePartAObjectiveCount(count);
      const mappings = this.getPartAMappings(n);

      if (['N6', 'AT7', 'Z7', 'AG7', 'BD7', 'AQ7'].includes(addr)) return true;
      if (['G16', 'AM16'].includes(addr)) return true;

      if (row >= 25 && row <= 24 + n) {
        if (['T', 'Y', 'AK', 'AD', 'BC'].includes(col)) return true;
      }

      if (Object.values(mappings.summary).includes(addr)) return true;

      return false;
    } else if (partKey === 'B') {
      const n = validatePartBCompetencyCount(count);
      const mappings = this.getPartBMappings(n);

      if (mappings.protectedPaddingRows.includes(row)) {
        return false;
      }

      if (['G2', 'J3', 'M3', 'P3', 'R3', 'S3'].includes(addr)) return true;

      const isColInKtoX = ['K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X'].includes(col);

      if (row >= 7 && row <= 29 && isColInKtoX) {
        return true;
      }

      if (n >= 7 && row >= 31 && row <= 33 && isColInKtoX) {
        return true;
      }

      if (n === 8 && row >= 35 && row <= 37 && isColInKtoX) {
        return true;
      }

      const sStart = mappings.summary.startRow;
      if (row >= sStart && row <= sStart + 3) {
        return true;
      }

      return false;
    }

    return false;
  }
}

/**
 * Pure production mapping-integrity validator function.
 */
export function validateMappingIntegrity(profileOrOptions = {}) {
  const profile = profileOrOptions instanceof MboXlsxTemplateProfile 
    ? profileOrOptions 
    : new MboXlsxTemplateProfile(profileOrOptions);

  if (profile.profileId !== MBO2026_PROFILE_ID) {
    throw new Error('EXPORT_TEMPLATE_PROFILE_UNRESOLVED');
  }
  validateTemplateSha('A', profile.partASha);
  validateTemplateSha('B', profile.partBSha);

  for (const n of ACCEPTED_PART_A_OBJECTIVE_COUNTS) {
    const mapA = profile.getPartAMappings(n);

    const reqHeaders = ['FISCAL_YEAR', 'EMPLOYEE_NAME', 'DEPARTMENT', 'SECTION', 'POSITION', 'EMPLOYEE_CODE'];
    for (const k of reqHeaders) {
      if (!mapA.header || !mapA.header[k] || !validateAddressFormat(mapA.header[k])) {
        throw new Error('EXPORT_TEMPLATE_PROFILE_UNRESOLVED');
      }
    }

    const reqHoshin = ['DEPARTMENT_HOSHIN_TITLE', 'SECTION_HOSHIN_TITLE'];
    for (const k of reqHoshin) {
      if (!mapA.hoshin || !mapA.hoshin[k] || !validateAddressFormat(mapA.hoshin[k])) {
        throw new Error('EXPORT_TEMPLATE_PROFILE_UNRESOLVED');
      }
    }

    if (!Array.isArray(mapA.objectives) || mapA.objectives.length !== n) {
      throw new Error('EXPORT_TEMPLATE_PROFILE_UNRESOLVED');
    }
    const reqObjFields = ['MEASUREMENT', 'WEIGHT', 'ACTUAL_RESULT', 'SELF_COMMENT', 'AVERAGE_SCORE'];
    for (const obj of mapA.objectives) {
      for (const f of reqObjFields) {
        if (!obj[f] || !validateAddressFormat(obj[f])) {
          throw new Error('EXPORT_TEMPLATE_PROFILE_UNRESOLVED');
        }
      }
      if (!obj.projectionPaths || typeof obj.projectionPaths !== 'object') {
        throw new Error('EXPORT_TEMPLATE_PROFILE_UNRESOLVED');
      }
    }

    const writeAddrs = [];
    writeAddrs.push(...Object.values(mapA.header));
    writeAddrs.push(mapA.hoshin.DEPARTMENT_HOSHIN_TITLE, mapA.hoshin.SECTION_HOSHIN_TITLE);
    for (const obj of mapA.objectives) {
      writeAddrs.push(obj.MEASUREMENT, obj.WEIGHT, obj.ACTUAL_RESULT, obj.SELF_COMMENT, obj.AVERAGE_SCORE);
    }
    writeAddrs.push(mapA.summary.PART_A_RAW_SCORE, mapA.summary.PART_A_WEIGHTED_SCORE);

    if (new Set(writeAddrs).size !== writeAddrs.length) {
      throw new Error('EXPORT_TEMPLATE_PROFILE_UNRESOLVED');
    }
  }

  for (const n of ACCEPTED_PART_B_COMPETENCY_COUNTS) {
    const mapB = profile.getPartBMappings(n);

    const expectedPadding = [30];
    if (n >= 7) expectedPadding.push(34);
    if (n === 8) expectedPadding.push(38);

    if (!Array.isArray(mapB.protectedPaddingRows) || JSON.stringify(mapB.protectedPaddingRows) !== JSON.stringify(expectedPadding)) {
      throw new Error('EXPORT_TEMPLATE_PROFILE_UNRESOLVED');
    }

    const cols = ['B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X'];
    for (const pRow of mapB.protectedPaddingRows) {
      for (const col of cols) {
        if (profile.isDynamicWriteTarget('B', `${col}${pRow}`, n)) {
          throw new Error('EXPORT_TEMPLATE_PROFILE_UNRESOLVED');
        }
      }
    }

    const reqSummary = ['PART_B_RAW_SCORE', 'PART_B_WEIGHTED_SCORE'];
    for (const k of reqSummary) {
      if (!mapB.summary || !mapB.summary[k] || !validateAddressFormat(mapB.summary[k])) {
        throw new Error('EXPORT_TEMPLATE_PROFILE_UNRESOLVED');
      }
    }
  }

  return true;
}
