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
 * - 18 SAFE_TO_MAP baseline roles (expanded to candidate 20 roles with b7/b8 title & description).
 * - All 22 UNRESOLVED roles throw EXPORT_TEMPLATE_PROFILE_UNRESOLVED.
 * - All 5 NO_SECURED_PROJECTION_SOURCE roles throw EXPORT_TEMPLATE_PROFILE_UNRESOLVED.
 * - OBJECTIVE_i_COMMENT and COMPETENCY_b_RATING non-canonical aliases REJECT with EXPORT_TEMPLATE_PROFILE_UNRESOLVED.
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
 * Part A Layout & Topology Constants
 */
export const PART_A_BASE_OBJECTIVE_COUNT = 4;
export const PART_A_SOURCE_CLONE_ROW = 28;
export const PART_A_DOWNSTREAM_THRESHOLD_ROW = 29;
export const PART_A_MAIN_SHEET_NAME = 'MBO Staff & Chief';
export const PART_A_BASE_SENSITIVE_RANGES = Object.freeze([
  'N6:Q7',
  'Z7:AF7',
  'AG7:AL7',
  'AM7:AP7',
  'AQ7:AS7',
  'AT7:BC7',
  'BD7:BI7',
  'G8:S8',
  'G16:AF19',
  'AM16:BI19',
  'B25:BI28',
  'BC29:BI35',
  'B37:S42',
  'AI37:AY42',
  'B47:N50'
]);

/**
 * Part B Layout & Topology Constants
 */
export const PART_B_BASE_COMPETENCY_COUNT = 6;
export const PART_B_SOURCE_CLONE_BLOCK = '27:30';
export const PART_B_SOURCE_BLOCK_HEIGHT = 4;
export const PART_B_DOWNSTREAM_THRESHOLD_ROW = 31;
export const PART_B_MAIN_SHEET_NAME = '(Part B) Competency';
export const PART_B_AUXILIARY_SHEET_NAME = 'Sheet1';
export const PART_B_BASE_SENSITIVE_RANGES = Object.freeze([
  'G2:H3',
  'J3:L3',
  'M3:O3',
  'P3:Q3',
  'R3',
  'S3:W3',
  'K7:Q29',
  'R7:X29',
  'B31:D34',
  'E31:H34',
  'I31:P34',
  'Q31:S34',
  'T31:X34'
]);

/**
 * Exact candidate 20 SAFE_TO_MAP semantic roles (18 baseline + expanded b7/b8 presentation role families)
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
  'COMPETENCY_TITLE',
  'COMPETENCY_DESCRIPTION',
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
 * Expand range string (e.g. 'B31:J32' or 'R3') into array of cell addresses
 */
export function expandRangeToAddresses(rangeStr) {
  if (typeof rangeStr !== 'string' || !rangeStr) return [];
  const trimmed = rangeStr.trim().toUpperCase();
  if (!trimmed.includes(':')) {
    return [trimmed];
  }
  const [start, end] = trimmed.split(':');
  const m1 = start.match(/^([A-Z]+)(\d+)$/);
  const m2 = end.match(/^([A-Z]+)(\d+)$/);
  if (!m1 || !m2) return [trimmed];

  function colToNum(colStr) {
    let num = 0;
    for (let i = 0; i < colStr.length; i++) {
      num = num * 26 + (colStr.charCodeAt(i) - 64);
    }
    return num;
  }

  function numToCol(num) {
    let col = '';
    while (num > 0) {
      let rem = (num - 1) % 26;
      col = String.fromCharCode(65 + rem) + col;
      num = Math.floor((num - 1) / 26);
    }
    return col;
  }

  const c1 = colToNum(m1[1]);
  const r1 = parseInt(m1[2], 10);
  const c2 = colToNum(m2[1]);
  const r2 = parseInt(m2[2], 10);

  const addresses = [];
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      addresses.push(`${numToCol(c)}${r}`);
    }
  }
  return addresses;
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
   * Get Part A layout & sanitization topology for objective count N (4..10)
   */
  getPartALayoutTopology(objectiveCount = 4) {
    const n = validatePartAObjectiveCount(objectiveCount);
    const extraRows = n - PART_A_BASE_OBJECTIVE_COUNT;
    const lastRow = 52 + extraRows;
    const dimension = `A1:BL${lastRow}`;
    const printArea = `'${PART_A_MAIN_SHEET_NAME}'!$A$1:$BJ$${lastRow}`;

    const effectiveSanitizationRanges = [
      'N6:Q7',
      'Z7:AF7',
      'AG7:AL7',
      'AM7:AP7',
      'AQ7:AS7',
      'AT7:BC7',
      'BD7:BI7',
      'G8:S8',
      'G16:AF19',
      'AM16:BI19',
      `B25:BI${24 + n}`,
      `BC${25 + n}:BI${31 + n}`,
      `B${33 + n}:S${38 + n}`,
      `AI${33 + n}:AY${38 + n}`,
      `B${43 + n}:N${46 + n}`
    ];

    return Object.freeze({
      profileId: this.profileId,
      objectiveCount: n,
      mainSheetName: PART_A_MAIN_SHEET_NAME,
      baseObjectiveCount: PART_A_BASE_OBJECTIVE_COUNT,
      sourceCloneRow: PART_A_SOURCE_CLONE_ROW,
      downstreamThresholdRow: PART_A_DOWNSTREAM_THRESHOLD_ROW,
      extraRows,
      dimension,
      printArea,
      pageSetup: Object.freeze({
        paperSize: 8,
        orientation: 'landscape',
        scale: 58
      }),
      formulaCount: 0,
      baseSensitiveRanges: PART_A_BASE_SENSITIVE_RANGES,
      effectiveSanitizationRanges: Object.freeze(effectiveSanitizationRanges)
    });
  }

  /**
   * Get Part B layout & sanitization topology for competency count N (6, 7, 8)
   */
  getPartBLayoutTopology(competencyCount = 6) {
    const n = validatePartBCompetencyCount(competencyCount);
    const extraBlocks = n - PART_B_BASE_COMPETENCY_COUNT;
    const extraRows = PART_B_SOURCE_BLOCK_HEIGHT * extraBlocks;

    const summaryStartRow = 31 + extraRows;
    const summaryEndRow = summaryStartRow + 3;
    const lastRow = 35 + extraRows;

    const dimension = `A1:X${lastRow}`;
    const printArea = `'${PART_B_MAIN_SHEET_NAME}'!$A$1:$X$${lastRow}`;

    const intermediateMergeCount = n === 6 ? 79 : (n === 7 ? 85 : 91);
    const finalOverlayMergeCount = n === 6 ? 79 : (n === 7 ? 86 : 93);

    const protectedPaddingRows = [30];
    if (n >= 7) protectedPaddingRows.push(34);
    if (n === 8) protectedPaddingRows.push(38);

    const ratingScaleStaticRanges = ['B29:J29'];
    if (n >= 7) ratingScaleStaticRanges.push('B33:J33');
    if (n === 8) ratingScaleStaticRanges.push('B37:J37');

    const presentationDynamicRanges = [];
    if (n >= 7) presentationDynamicRanges.push('B31:J32');
    if (n === 8) presentationDynamicRanges.push('B35:J36');

    const baseDynamicCount = n === 6 ? 432 : (n === 7 ? 474 : 516);
    const effectiveDynamicCount = n === 6 ? 432 : (n === 7 ? 492 : 552);

    const effectiveSanitizationRanges = [
      'G2:H3',
      'J3:L3',
      'M3:O3',
      'P3:Q3',
      'R3',
      'S3:W3',
      `K7:Q${29 + extraRows}`,
      `R7:X${29 + extraRows}`,
      `B${summaryStartRow}:D${summaryEndRow}`,
      `E${summaryStartRow}:H${summaryEndRow}`,
      `I${summaryStartRow}:P${summaryEndRow}`,
      `Q${summaryStartRow}:S${summaryEndRow}`,
      `T${summaryStartRow}:X${summaryEndRow}`
    ];
    if (n >= 7) effectiveSanitizationRanges.push('B31:J32');
    if (n === 8) effectiveSanitizationRanges.push('B35:J36');

    return Object.freeze({
      profileId: this.profileId,
      competencyCount: n,
      mainSheetName: PART_B_MAIN_SHEET_NAME,
      auxiliarySheetName: PART_B_AUXILIARY_SHEET_NAME,
      baseCompetencyCount: PART_B_BASE_COMPETENCY_COUNT,
      sourceCloneBlockRows: PART_B_SOURCE_CLONE_BLOCK,
      sourceBlockHeight: PART_B_SOURCE_BLOCK_HEIGHT,
      downstreamThresholdRow: PART_B_DOWNSTREAM_THRESHOLD_ROW,
      extraBlocks,
      extraRows,
      dimension,
      printArea,
      intermediateMergeCount,
      finalOverlayMergeCount,
      summaryStartRow,
      summaryEndRow,
      pageSetup: Object.freeze({
        paperSize: 9,
        orientation: 'portrait',
        scale: 75
      }),
      formulaCount: 0,
      protectedPaddingRows: Object.freeze(protectedPaddingRows),
      ratingScaleStaticRanges: Object.freeze(ratingScaleStaticRanges),
      presentationDynamicRanges: Object.freeze(presentationDynamicRanges),
      baseDynamicCount,
      effectiveDynamicCount,
      baseSensitiveRanges: PART_B_BASE_SENSITIVE_RANGES,
      effectiveSanitizationRanges: Object.freeze(effectiveSanitizationRanges)
    });
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
      const compObj = {
        index: b,
        row: r,
        SELF_RATING: `K${r}`,
        projectionPath: `partB.competencyItems[${b - 1}].selfRating`
      };

      if (b === 7) {
        compObj.TITLE = 'B31';
        compObj.titleProjectionPath = 'partB.competencyItems[6].presentationTitle';
        compObj.DESCRIPTION = 'B32';
        compObj.descriptionProjectionPath = 'partB.competencyItems[6].presentationDescription';
        compObj.titleMerge = 'B31:J31';
        compObj.descriptionMerge = 'B32:J32';
        compObj.ratingScaleRange = 'B33:J33';
        compObj.paddingRow = 34;
      } else if (b === 8) {
        compObj.TITLE = 'B35';
        compObj.titleProjectionPath = 'partB.competencyItems[7].presentationTitle';
        compObj.DESCRIPTION = 'B36';
        compObj.descriptionProjectionPath = 'partB.competencyItems[7].presentationDescription';
        compObj.titleMerge = 'B35:J35';
        compObj.descriptionMerge = 'B36:J36';
        compObj.ratingScaleRange = 'B37:J37';
        compObj.paddingRow = 38;
      }

      competencies.push(Object.freeze(compObj));
    }

    const overlayMap = {};
    if (n >= 7) {
      overlayMap.b7 = Object.freeze({
        TITLE: 'B31',
        TITLE_MERGE: 'B31:J31',
        DESCRIPTION: 'B32',
        DESCRIPTION_MERGE: 'B32:J32',
        RATING_SCALE: 'B33:J33',
        PADDING_ROW: 34
      });
    }
    if (n === 8) {
      overlayMap.b8 = Object.freeze({
        TITLE: 'B35',
        TITLE_MERGE: 'B35:J35',
        DESCRIPTION: 'B36',
        DESCRIPTION_MERGE: 'B36:J36',
        RATING_SCALE: 'B37:J37',
        PADDING_ROW: 38
      });
    }

    return Object.freeze({
      profileId: this.profileId,
      competencyCount: n,
      header,
      protectedPaddingRows: Object.freeze(protectedPaddingRows),
      competencies: Object.freeze(competencies),
      presentationOverlay: Object.freeze(overlayMap),
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

          // Reject unresolved objective roles and non-canonical COMMENT alias
          const forbiddenFields = [
            'TITLE', 'NAME', 'OBJECTIVE_NAME_AND_TARGET', 'DESCRIPTION', 'KPI', 'PLAN_TARGET',
            'TARGET', 'PROGRESS_PERCENT', 'MID_TERM_PROGRESS', 'SELF_ACHIEVEMENT', 'SELF_RATING',
            'MANAGER_ACHIEVEMENT', 'MANAGER_SCORE', 'MANAGER_COMMENT',
            'GM_ACHIEVEMENT', 'GM_SCORE', 'GM_COMMENT', 'DIFFICULTY', 'COMMENT'
          ];
          if (forbiddenFields.includes(rawField)) {
            throw new Error('EXPORT_TEMPLATE_PROFILE_UNRESOLVED');
          }

          const obj = mappings.objectives.find(o => o.index === idx);
          if (obj && obj[rawField]) {
            const pathStr = getObjectiveProjectionPath(idx, rawField.toLowerCase());
            if (!pathStr) {
              throw new Error('EXPORT_TEMPLATE_PROFILE_UNRESOLVED');
            }
            return {
              address: obj[rawField],
              projectionPath: pathStr
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

          if (rawField === 'CHIEF_RATING' || rawField === 'RATING') {
            throw new Error('EXPORT_TEMPLATE_PROFILE_UNRESOLVED');
          }

          if (rawField === 'TITLE' || rawField === 'DESCRIPTION') {
            if (idx <= 6 || idx > competencyCount) {
              throw new Error('EXPORT_TEMPLATE_PROFILE_UNRESOLVED');
            }
            const comp = mappings.competencies.find(c => c.index === idx);
            if (comp) {
              if (rawField === 'TITLE') {
                return {
                  address: comp.TITLE,
                  projectionPath: comp.titleProjectionPath
                };
              }
              if (rawField === 'DESCRIPTION') {
                return {
                  address: comp.DESCRIPTION,
                  projectionPath: comp.descriptionProjectionPath
                };
              }
            }
          }

          if (rawField === 'SELF_RATING') {
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

      // Expanded presentation dynamic targets for B31, B32 (n>=7) and B35, B36 (n===8)
      if (n >= 7 && ['B31', 'B32'].includes(addr)) return true;
      if (n === 8 && ['B35', 'B36'].includes(addr)) return true;

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
    const layoutA = profile.getPartALayoutTopology(n);
    if (!layoutA || layoutA.objectiveCount !== n || layoutA.mainSheetName !== 'MBO Staff & Chief' ||
        layoutA.sourceCloneRow !== 28 || layoutA.downstreamThresholdRow !== 29 ||
        layoutA.pageSetup.paperSize !== 8 || layoutA.pageSetup.orientation !== 'landscape' || layoutA.pageSetup.scale !== 58 ||
        layoutA.formulaCount !== 0) {
      throw new Error('EXPORT_TEMPLATE_PROFILE_UNRESOLVED');
    }

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
      for (const f of reqObjFields) {
        const key = f === 'MEASUREMENT' ? 'measurement'
          : f === 'WEIGHT' ? 'weight'
          : f === 'ACTUAL_RESULT' ? 'actualResult'
          : f === 'SELF_COMMENT' ? 'selfComment'
          : 'averageScore';
        if (typeof obj.projectionPaths[key] !== 'string' || !obj.projectionPaths[key]) {
          throw new Error('EXPORT_TEMPLATE_PROFILE_UNRESOLVED');
        }
      }
    }

    const reqASummary = ['PART_A_RAW_SCORE', 'PART_A_WEIGHTED_SCORE'];
    for (const k of reqASummary) {
      if (!mapA.summary || !mapA.summary[k] || !validateAddressFormat(mapA.summary[k])) {
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
    const layoutB = profile.getPartBLayoutTopology(n);
    if (!layoutB || layoutB.competencyCount !== n || layoutB.mainSheetName !== '(Part B) Competency' ||
        layoutB.auxiliarySheetName !== 'Sheet1' || layoutB.sourceBlockHeight !== 4 || layoutB.downstreamThresholdRow !== 31 ||
        layoutB.pageSetup.paperSize !== 9 || layoutB.pageSetup.orientation !== 'portrait' || layoutB.pageSetup.scale !== 75 ||
        layoutB.formulaCount !== 0) {
      throw new Error('EXPORT_TEMPLATE_PROFILE_UNRESOLVED');
    }

    const reqBHeaders = ['FISCAL_YEAR', 'DEPARTMENT', 'SECTION', 'POSITION', 'EMPLOYEE_CODE', 'EMPLOYEE_NAME'];
    for (const k of reqBHeaders) {
      if (!mapB.header || !mapB.header[k] || !validateAddressFormat(mapB.header[k])) {
        throw new Error('EXPORT_TEMPLATE_PROFILE_UNRESOLVED');
      }
    }

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

    if (!Array.isArray(mapB.competencies) || mapB.competencies.length !== n) {
      throw new Error('EXPORT_TEMPLATE_PROFILE_UNRESOLVED');
    }

    const expectedRatingRows = [9, 13, 17, 21, 25, 29];
    if (n >= 7) expectedRatingRows.push(33);
    if (n === 8) expectedRatingRows.push(37);

    const bWriteAddrs = [];
    bWriteAddrs.push(...Object.values(mapB.header));

    for (let b = 1; b <= n; b++) {
      const comp = mapB.competencies[b - 1];
      const expectedRow = expectedRatingRows[b - 1];
      const expectedSelfRating = `K${expectedRow}`;
      const expectedProjectionPath = `partB.competencyItems[${b - 1}].selfRating`;

      if (!comp || 
          comp.index !== b || 
          comp.row !== expectedRow || 
          comp.SELF_RATING !== expectedSelfRating || 
          !validateAddressFormat(comp.SELF_RATING) || 
          comp.projectionPath !== expectedProjectionPath) {
        throw new Error('EXPORT_TEMPLATE_PROFILE_UNRESOLVED');
      }

      if (b === 7) {
        if (comp.TITLE !== 'B31' ||
            comp.titleProjectionPath !== 'partB.competencyItems[6].presentationTitle' ||
            comp.DESCRIPTION !== 'B32' ||
            comp.descriptionProjectionPath !== 'partB.competencyItems[6].presentationDescription' ||
            comp.titleMerge !== 'B31:J31' ||
            comp.descriptionMerge !== 'B32:J32' ||
            comp.ratingScaleRange !== 'B33:J33' ||
            comp.paddingRow !== 34) {
          throw new Error('EXPORT_TEMPLATE_PROFILE_UNRESOLVED');
        }
        if (!mapB.presentationOverlay || !mapB.presentationOverlay.b7 ||
            mapB.presentationOverlay.b7.TITLE !== 'B31' ||
            mapB.presentationOverlay.b7.TITLE_MERGE !== 'B31:J31' ||
            mapB.presentationOverlay.b7.DESCRIPTION !== 'B32' ||
            mapB.presentationOverlay.b7.DESCRIPTION_MERGE !== 'B32:J32' ||
            mapB.presentationOverlay.b7.RATING_SCALE !== 'B33:J33' ||
            mapB.presentationOverlay.b7.PADDING_ROW !== 34) {
          throw new Error('EXPORT_TEMPLATE_PROFILE_UNRESOLVED');
        }
        bWriteAddrs.push(comp.TITLE, comp.DESCRIPTION);
      }

      if (b === 8) {
        if (comp.TITLE !== 'B35' ||
            comp.titleProjectionPath !== 'partB.competencyItems[7].presentationTitle' ||
            comp.DESCRIPTION !== 'B36' ||
            comp.descriptionProjectionPath !== 'partB.competencyItems[7].presentationDescription' ||
            comp.titleMerge !== 'B35:J35' ||
            comp.descriptionMerge !== 'B36:J36' ||
            comp.ratingScaleRange !== 'B37:J37' ||
            comp.paddingRow !== 38) {
          throw new Error('EXPORT_TEMPLATE_PROFILE_UNRESOLVED');
        }
        if (!mapB.presentationOverlay || !mapB.presentationOverlay.b8 ||
            mapB.presentationOverlay.b8.TITLE !== 'B35' ||
            mapB.presentationOverlay.b8.TITLE_MERGE !== 'B35:J35' ||
            mapB.presentationOverlay.b8.DESCRIPTION !== 'B36' ||
            mapB.presentationOverlay.b8.DESCRIPTION_MERGE !== 'B36:J36' ||
            mapB.presentationOverlay.b8.RATING_SCALE !== 'B37:J37' ||
            mapB.presentationOverlay.b8.PADDING_ROW !== 38) {
          throw new Error('EXPORT_TEMPLATE_PROFILE_UNRESOLVED');
        }
        bWriteAddrs.push(comp.TITLE, comp.DESCRIPTION);
      }

      bWriteAddrs.push(comp.SELF_RATING);
    }

    // Verify b1..6 TITLE and DESCRIPTION reject
    for (let b = 1; b <= 6; b++) {
      try {
        profile.resolveSemanticRole(`COMPETENCY_${b}_TITLE`, { partKey: 'B', competencyCount: n });
        throw new Error('FAIL');
      } catch (err) {
        if (err.message === 'FAIL') throw new Error('EXPORT_TEMPLATE_PROFILE_UNRESOLVED');
      }
      try {
        profile.resolveSemanticRole(`COMPETENCY_${b}_DESCRIPTION`, { partKey: 'B', competencyCount: n });
        throw new Error('FAIL');
      } catch (err) {
        if (err.message === 'FAIL') throw new Error('EXPORT_TEMPLATE_PROFILE_UNRESOLVED');
      }
    }

    // If n === 7, verify b8 TITLE and DESCRIPTION reject
    if (n === 7) {
      try {
        profile.resolveSemanticRole('COMPETENCY_8_TITLE', { partKey: 'B', competencyCount: 7 });
        throw new Error('FAIL');
      } catch (err) {
        if (err.message === 'FAIL') throw new Error('EXPORT_TEMPLATE_PROFILE_UNRESOLVED');
      }
      try {
        profile.resolveSemanticRole('COMPETENCY_8_DESCRIPTION', { partKey: 'B', competencyCount: 7 });
        throw new Error('FAIL');
      } catch (err) {
        if (err.message === 'FAIL') throw new Error('EXPORT_TEMPLATE_PROFILE_UNRESOLVED');
      }
    }

    bWriteAddrs.push(mapB.summary.PART_B_RAW_SCORE, mapB.summary.PART_B_WEIGHTED_SCORE);

    if (new Set(bWriteAddrs).size !== bWriteAddrs.length) {
      throw new Error('EXPORT_TEMPLATE_PROFILE_UNRESOLVED');
    }
  }

  return true;
}
