/**
 * MBO2026 Production XLSX Template Profile / Mapping Foundation
 * 
 * Centralized, pure semantic role-to-address mapping for MBO2026 Part A and Part B templates.
 * 
 * Rules:
 * - Pure configuration/resolver module (no filesystem I/O, no remote API adapters, no workbook binary parsers).
 * - Exact SHA256 validation for Part A and Part B.
 * - Part A objective counts domain: integer 4..10.
 * - Part B competency counts domain: integer 6, 7, 8.
 * - Fails closed with EXPORT_TEMPLATE_PROFILE_UNRESOLVED on any invalid/unsupported input or unmapped role.
 * - Part B source row 30 (for N=6/7/8) and clone rows 34 (for N=7/8) & 38 (for N=8) are protected non-dynamic padding and MUST NOT resolve as dynamic write targets.
 * - Rows 10, 14, 18, 22, 26 (columns K:X) in pristine source Part B ARE DYNAMIC competency rating rows.
 */

export const MBO2026_PROFILE_ID = 'MBO2026';
export const PART_A_TEMPLATE_SHA256 = '03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3';
export const PART_B_TEMPLATE_SHA256 = 'c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3';

export const ACCEPTED_PART_A_OBJECTIVE_COUNTS = Object.freeze([4, 5, 6, 7, 8, 9, 10]);
export const ACCEPTED_PART_B_COMPETENCY_COUNTS = Object.freeze([6, 7, 8]);

/**
 * Standard projection path mapping for canonical semantic roles
 */
export const SEMANTIC_PROJECTION_PATHS = Object.freeze({
  HEADER_FISCAL_YEAR: 'partA.header.fiscalYear',
  HEADER_EMPLOYEE_NAME: 'partA.header.employeeName',
  HEADER_EMPLOYEE_NAME_TH: 'partA.header.employeeNameTH',
  HEADER_DEPARTMENT: 'partA.header.department',
  HEADER_SECTION: 'partA.header.section',
  HEADER_POSITION: 'partA.header.position',
  HEADER_EMPLOYEE_CODE: 'partA.header.employeeCode',
  HEADER_PROFILE_CODE: 'partA.header.profileCode',
  HEADER_PROFILE_FAMILY: 'partA.header.profileFamily',
  HEADER_PART_A_WEIGHT_PERCENT: 'partA.header.partAWeightPercent',

  HOSHIN_DEPARTMENT_HOSHIN_TITLE: 'partA.hoshin.departmentHoshinTitle',
  HOSHIN_SECTION_HOSHIN_TITLE: 'partA.hoshin.sectionHoshinTitle',

  HEADER_PART_B_WEIGHT_PERCENT: 'partB.partBWeightPercent',

  SUMMARY_PART_A_RAW_SCORE: 'partA.summary.rawPartAScore',
  SUMMARY_PART_A_WEIGHTED_SCORE: 'partA.summary.weightedPartAScore',
  SUMMARY_PART_B_RAW_SCORE: 'partB.rawPartBScore',
  SUMMARY_PART_B_WEIGHTED_SCORE: 'partB.weightedPartBScore',
  SUMMARY_FINAL_SCORE: 'finalResult.finalWeightedScore',
  SUMMARY_FINAL_GRADE: 'finalResult.grade'
});

/**
 * Helper to get projection path for an objective field
 */
export function getObjectiveProjectionPath(index, fieldKey) {
  const i = index - 1;
  const f = String(fieldKey || '').toLowerCase();
  const fieldPathMap = {
    title: `partA.objectives[${i}].title`,
    name: `partA.objectives[${i}].title`,
    objective_name_and_target: `partA.objectives[${i}].title`,
    description: `partA.objectives[${i}].description`,
    kpi: `partA.objectives[${i}].kpi`,
    target: `partA.objectives[${i}].target`,
    plan_target: `partA.objectives[${i}].target`,
    measurement: `partA.objectives[${i}].measurement`,
    weight: `partA.objectives[${i}].weight`,
    progresspercent: `partA.objectives[${i}].progressPercent`,
    mid_term_progress: `partA.objectives[${i}].progressPercent`,
    actualresult: `partA.objectives[${i}].actualResult`,
    selfachievement: `partA.objectives[${i}].selfAchievement`,
    self_rating: `partA.objectives[${i}].selfAchievement`,
    selfcomment: `partA.objectives[${i}].selfComment`,
    self_comment: `partA.objectives[${i}].selfComment`,
    managerachievement: `partA.objectives[${i}].managerAchievement`,
    managerscore: `partA.objectives[${i}].managerScore`,
    managercomment: `partA.objectives[${i}].managerComment`,
    gmachievement: `partA.objectives[${i}].gmAchievement`,
    gmscore: `partA.objectives[${i}].gmScore`,
    gmcomment: `partA.objectives[${i}].gmComment`,
    averagescore: `partA.objectives[${i}].averageScore`
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
      EMPLOYEE_NAME: 'Z7',
      DEPARTMENT: 'AG7',
      SECTION: 'AM7',
      POSITION: 'AQ7',
      EMPLOYEE_CODE: 'AT7',
      CHIEF_NAME: 'BD7'
    });

    const hoshin = Object.freeze({
      CORPORATE_HOSHIN_LABEL: 'B4',
      CORPORATE_HOSHIN_TEXT: 'G8',
      DEPARTMENT_HOSHIN_LABEL: 'G4',
      DEPARTMENT_HOSHIN_TEXT: 'G16'
    });

    const objectives = [];
    for (let i = 1; i <= n; i++) {
      const r = 24 + i;
      objectives.push(Object.freeze({
        index: i,
        row: r,
        OBJECTIVE_NAME_AND_TARGET: `B${r}`,
        WEIGHT: `F${r}`,
        PLAN_TARGET: `I${r}`,
        MID_TERM_PROGRESS: `W${r}`,
        SELF_RATING: `AG${r}`,
        CHIEF_RATING: `AM${r}`,
        FINAL_RATING: `AQ${r}`,
        SELF_COMMENT: `AT${r}`,
        CHIEF_COMMENT: `BD${r}`,

        projectionPaths: Object.freeze({
          title: getObjectiveProjectionPath(i, 'title'),
          description: getObjectiveProjectionPath(i, 'description'),
          kpi: getObjectiveProjectionPath(i, 'kpi'),
          target: getObjectiveProjectionPath(i, 'target'),
          measurement: getObjectiveProjectionPath(i, 'measurement'),
          weight: getObjectiveProjectionPath(i, 'weight'),
          progressPercent: getObjectiveProjectionPath(i, 'progressPercent'),
          actualResult: getObjectiveProjectionPath(i, 'actualResult'),
          selfAchievement: getObjectiveProjectionPath(i, 'selfAchievement'),
          selfComment: getObjectiveProjectionPath(i, 'selfComment')
        })
      }));
    }

    const weightSumRow = 25 + n;
    const summary = Object.freeze({
      WEIGHT_SUM_ROW: weightSumRow,
      WEIGHT_SUM: `F${weightSumRow}`,
      PART_A_RAW_SCORE: `BC${25 + n}`,
      PART_A_WEIGHTED_SCORE: `BI${25 + n}`,
      PART_B_RAW_SCORE: `BC${26 + n}`,
      PART_B_WEIGHTED_SCORE: `BI${26 + n}`,
      FINAL_SCORE: `BC${27 + n}`,
      FINAL_GRADE: `BI${27 + n}`
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
    const extraBlocks = n - 6;
    const extraRows = 4 * extraBlocks;

    const header = Object.freeze({
      FISCAL_YEAR: 'G2',
      DEPARTMENT_LABEL: 'J2',
      DEPARTMENT_VALUE: 'J3',
      SECTION_LABEL: 'M2',
      SECTION_VALUE: 'M3',
      POSITION_LABEL: 'P2',
      POSITION_VALUE: 'P3',
      EMPLOYEE_ID_LABEL: 'R2',
      EMPLOYEE_ID_VALUE: 'R3',
      EMPLOYEE_NAME_LABEL: 'S2',
      EMPLOYEE_NAME_VALUE: 'S3'
    });

    const protectedPaddingRows = [30];
    if (n >= 7) protectedPaddingRows.push(34);
    if (n === 8) protectedPaddingRows.push(38);

    const summaryStartRow = 31 + extraRows;
    const summary = Object.freeze({
      startRow: summaryStartRow,
      endRow: summaryStartRow + 3,
      OVERALL_RATING_SUMMARY: `B${summaryStartRow}`,
      EMPLOYEE_COMMENTS: `E${summaryStartRow}`,
      CHIEF_FEEDBACK: `I${summaryStartRow}`,
      EMPLOYEE_SIGNATURE: `Q${summaryStartRow}`,
      CHIEF_SIGNATURE: `T${summaryStartRow}`
    });

    return Object.freeze({
      profileId: this.profileId,
      competencyCount: n,
      header,
      protectedPaddingRows: Object.freeze(protectedPaddingRows),
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

      if (roleName.startsWith('HEADER_')) {
        const key = roleName.replace('HEADER_', '');
        if (mappings.header[key]) {
          return {
            address: mappings.header[key],
            projectionPath: SEMANTIC_PROJECTION_PATHS[roleName] || null
          };
        }
      }

      if (roleName === 'HOSHIN_DEPARTMENT_HOSHIN_TITLE' || roleName === 'HOSHIN_DEPARTMENT_HOSHIN_TEXT') {
        return {
          address: mappings.hoshin.DEPARTMENT_HOSHIN_TEXT,
          projectionPath: SEMANTIC_PROJECTION_PATHS.HOSHIN_DEPARTMENT_HOSHIN_TITLE
        };
      }

      if (roleName === 'HOSHIN_SECTION_HOSHIN_TITLE' || roleName === 'HOSHIN_SECTION_HOSHIN_TEXT') {
        return {
          address: mappings.hoshin.DEPARTMENT_HOSHIN_TEXT,
          projectionPath: SEMANTIC_PROJECTION_PATHS.HOSHIN_SECTION_HOSHIN_TITLE
        };
      }

      if (roleName.startsWith('SUMMARY_')) {
        const key = roleName.replace('SUMMARY_', '');
        if (mappings.summary[key]) {
          return {
            address: mappings.summary[key],
            projectionPath: SEMANTIC_PROJECTION_PATHS[roleName] || null
          };
        }
      }

      if (roleName.startsWith('OBJECTIVE_')) {
        const match = roleName.match(/^OBJECTIVE_(\d+)_(.+)$/);
        if (match) {
          const idx = parseInt(match[1], 10);
          const rawField = match[2];

          // Map field aliases (TITLE, WEIGHT, PLAN_TARGET, etc.)
          let propKey = rawField;
          if (rawField === 'TITLE' || rawField === 'NAME') propKey = 'OBJECTIVE_NAME_AND_TARGET';
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

      if (roleName.startsWith('SUMMARY_')) {
        const key = roleName.replace('SUMMARY_', '');
        if (mappings.summary[key]) {
          return {
            address: mappings.summary[key],
            projectionPath: SEMANTIC_PROJECTION_PATHS[roleName] || null
          };
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

      if (['N6', 'Z7', 'AG7', 'AM7', 'AQ7', 'AT7', 'BD7'].includes(addr)) return true;
      if (['G8', 'G16'].includes(addr)) return true;

      if (row >= 25 && row <= 24 + n) {
        if (['B', 'F', 'I', 'W', 'AG', 'AM', 'AQ', 'AT', 'BD'].includes(col)) return true;
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

    const reqHeaders = ['FISCAL_YEAR', 'EMPLOYEE_NAME', 'DEPARTMENT', 'SECTION', 'POSITION', 'EMPLOYEE_CODE', 'CHIEF_NAME'];
    for (const k of reqHeaders) {
      if (!mapA.header || !mapA.header[k] || !validateAddressFormat(mapA.header[k])) {
        throw new Error('EXPORT_TEMPLATE_PROFILE_UNRESOLVED');
      }
    }

    const reqHoshin = ['CORPORATE_HOSHIN_LABEL', 'CORPORATE_HOSHIN_TEXT', 'DEPARTMENT_HOSHIN_LABEL', 'DEPARTMENT_HOSHIN_TEXT'];
    for (const k of reqHoshin) {
      if (!mapA.hoshin || !mapA.hoshin[k] || !validateAddressFormat(mapA.hoshin[k])) {
        throw new Error('EXPORT_TEMPLATE_PROFILE_UNRESOLVED');
      }
    }

    if (!Array.isArray(mapA.objectives) || mapA.objectives.length !== n) {
      throw new Error('EXPORT_TEMPLATE_PROFILE_UNRESOLVED');
    }
    const reqObjFields = ['OBJECTIVE_NAME_AND_TARGET', 'WEIGHT', 'PLAN_TARGET', 'MID_TERM_PROGRESS', 'SELF_RATING', 'CHIEF_RATING', 'FINAL_RATING', 'SELF_COMMENT', 'CHIEF_COMMENT'];
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
    writeAddrs.push(mapA.hoshin.CORPORATE_HOSHIN_TEXT, mapA.hoshin.DEPARTMENT_HOSHIN_TEXT);
    for (const obj of mapA.objectives) {
      writeAddrs.push(obj.OBJECTIVE_NAME_AND_TARGET, obj.WEIGHT, obj.PLAN_TARGET, obj.MID_TERM_PROGRESS, obj.SELF_RATING, obj.CHIEF_RATING, obj.FINAL_RATING, obj.SELF_COMMENT, obj.CHIEF_COMMENT);
    }
    writeAddrs.push(mapA.summary.WEIGHT_SUM, mapA.summary.PART_A_RAW_SCORE, mapA.summary.PART_A_WEIGHTED_SCORE, mapA.summary.PART_B_RAW_SCORE, mapA.summary.PART_B_WEIGHTED_SCORE, mapA.summary.FINAL_SCORE, mapA.summary.FINAL_GRADE);

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

    const reqSummary = ['OVERALL_RATING_SUMMARY', 'EMPLOYEE_COMMENTS', 'CHIEF_FEEDBACK', 'EMPLOYEE_SIGNATURE', 'CHIEF_SIGNATURE'];
    for (const k of reqSummary) {
      if (!mapB.summary || !mapB.summary[k] || !validateAddressFormat(mapB.summary[k])) {
        throw new Error('EXPORT_TEMPLATE_PROFILE_UNRESOLVED');
      }
    }
  }

  return true;
}
