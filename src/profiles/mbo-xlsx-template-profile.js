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
 * - Part B source row 30 and N=7/8 clone rows 34/38 are protected non-dynamic padding and MUST NOT resolve as dynamic write targets.
 */

export const MBO2026_PROFILE_ID = 'MBO2026';
export const PART_A_TEMPLATE_SHA256 = '03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3';
export const PART_B_TEMPLATE_SHA256 = 'c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3';

export const ACCEPTED_PART_A_OBJECTIVE_COUNTS = Object.freeze([4, 5, 6, 7, 8, 9, 10]);
export const ACCEPTED_PART_B_COMPETENCY_COUNTS = Object.freeze([6, 7, 8]);

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
        CHIEF_COMMENT: `BD${r}`
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

    const competencies = [];
    const protectedPaddingRows = [];

    for (let b = 1; b <= n; b++) {
      const startRow = 7 + (b - 1) * 4;
      const ratingRows = Object.freeze([startRow, startRow + 1, startRow + 2]);
      const paddingRow = startRow + 3;
      protectedPaddingRows.push(paddingRow);

      competencies.push(Object.freeze({
        index: b,
        blockStartRow: startRow,
        paddingRow,
        ratingRows,
        selfRatings: Object.freeze(ratingRows.map(r => `K${r}`)),
        chiefRatings: Object.freeze(ratingRows.map(r => `R${r}`))
      }));
    }

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
      competencies: Object.freeze(competencies),
      protectedPaddingRows: Object.freeze(protectedPaddingRows),
      summary
    });
  }

  /**
   * Resolve a named semantic role to its cell/range address
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
        if (mappings.header[key]) return mappings.header[key];
      }

      if (roleName.startsWith('HOSHIN_')) {
        const key = roleName.replace('HOSHIN_', '');
        if (mappings.hoshin[key]) return mappings.hoshin[key];
      }

      if (roleName.startsWith('SUMMARY_')) {
        const key = roleName.replace('SUMMARY_', '');
        if (mappings.summary[key]) return mappings.summary[key];
      }

      if (roleName.startsWith('OBJECTIVE_')) {
        const match = roleName.match(/^OBJECTIVE_(\d+)_(.+)$/);
        if (match) {
          const idx = parseInt(match[1], 10);
          const field = match[2];
          const obj = mappings.objectives.find(o => o.index === idx);
          if (obj && obj[field]) return obj[field];
        }
      }
    } else if (partKey === 'B') {
      const mappings = this.getPartBMappings(competencyCount);

      if (roleName.startsWith('HEADER_')) {
        const key = roleName.replace('HEADER_', '');
        if (mappings.header[key]) return mappings.header[key];
      }

      if (roleName.startsWith('SUMMARY_')) {
        const key = roleName.replace('SUMMARY_', '');
        if (mappings.summary[key]) return mappings.summary[key];
      }

      if (roleName.startsWith('COMPETENCY_')) {
        const match = roleName.match(/^COMPETENCY_(\d+)_(SELF|CHIEF)_(\d+)$/);
        if (match) {
          const bIdx = parseInt(match[1], 10);
          const type = match[2];
          const rIdx = parseInt(match[3], 10) - 1;
          const comp = mappings.competencies.find(c => c.index === bIdx);
          if (comp && rIdx >= 0 && rIdx < 3) {
            return type === 'SELF' ? comp.selfRatings[rIdx] : comp.chiefRatings[rIdx];
          }
        }
      }
    }

    throw new Error('EXPORT_TEMPLATE_PROFILE_UNRESOLVED');
  }

  /**
   * Check if a given cell address is a dynamic write target.
   * Source row 30 and N=7/8 padding clones rows 34/38 are protected non-dynamic padding and ALWAYS return false.
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

      // Check header values
      if (['N6', 'Z7', 'AG7', 'AM7', 'AQ7', 'AT7', 'BD7'].includes(addr)) return true;
      // Check hoshin values
      if (['G8', 'G16'].includes(addr)) return true;

      // Check objective input rows (rows 25..24+N)
      if (row >= 25 && row <= 24 + n) {
        if (['B', 'F', 'I', 'W', 'AG', 'AM', 'AQ', 'AT', 'BD'].includes(col)) return true;
      }

      // Check summary score cells
      if (Object.values(mappings.summary).includes(addr)) return true;

      return false;
    } else if (partKey === 'B') {
      const n = validatePartBCompetencyCount(count);
      const mappings = this.getPartBMappings(n);

      // Check protected padding rows first (rows 10,14,18,22,26,30 for N=6; plus 34 for N=7; plus 38 for N=8)
      if (mappings.protectedPaddingRows.includes(row)) {
        return false;
      }

      // Check header value cells
      if (['G2', 'J3', 'M3', 'P3', 'R3', 'S3'].includes(addr)) return true;

      // Check rating cells in competency blocks
      for (const comp of mappings.competencies) {
        if (comp.ratingRows.includes(row)) {
          if (['K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X'].includes(col)) {
            return true;
          }
        }
      }

      // Check summary / signature cells
      const sStart = mappings.summary.startRow;
      if (row >= sStart && row <= sStart + 3) {
        return true;
      }

      return false;
    }

    return false;
  }
}
