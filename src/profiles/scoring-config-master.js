import crypto from 'node:crypto';

/**
 * MBO V2 Phase 3 WP-002A: Scoring Configuration Master Foundation
 * 
 * Master Record Identity: Master_Record_Key = {Profile_Code}::{Scoring_Config_Version}
 * Governance Rules: DEC-035 (LIVE_KINTONE_FIRST), DEC-036 (APPRAISER_WEIGHT_AND_COMPLETENESS), DEC-038 (KINTONE_ONLY)
 */

export const PROFILE_CODES = {
  STAFF_CHIEF: 'PROF_STAFF_CHIEF',
  JAPANESE_STAFF: 'PROF_JAPANESE_STAFF',
  ASST_MGR: 'PROF_ASST_MGR',
  SECTION_MGR: 'PROF_SECTION_MGR',
  SENIOR_MGR: 'PROF_SENIOR_MGR',
  DGM: 'PROF_DGM',
  GM: 'PROF_GM',
  VP: 'PROF_VP'
};

export const PROFILE_FAMILIES = {
  PROFILE_STAFF_CHIEF: 'PROFILE_STAFF_CHIEF',
  PROFILE_JAPANESE_STAFF: 'PROFILE_JAPANESE_STAFF',
  PROFILE_MANAGEMENT: 'PROFILE_MANAGEMENT',
  PROFILE_EXECUTIVE: 'PROFILE_EXECUTIVE'
};

export const PART_A_SCORING_MODES = {
  DIFFICULTY_ACHIEVEMENT_MATRIX: 'DIFFICULTY_ACHIEVEMENT_MATRIX',
  ACHIEVEMENT_DIRECT: 'ACHIEVEMENT_DIRECT'
};

export const APPRAISER_WEIGHT_RULES = {
  EQUAL_DISTRIBUTION_V1: 'EQUAL_DISTRIBUTION_V1'
};

export const ALLOWED_ROUNDING_RULES = {
  ROUNDING_LEGACY_PER_APP_CALC: 'ROUNDING_LEGACY_PER_APP_CALC',
  ROUNDING_LEGACY_FINAL_ROUND_2: 'ROUNDING_LEGACY_FINAL_ROUND_2',
  UNIFIED_HALF_UP_2_DECIMALS: 'UNIFIED_HALF_UP_2_DECIMALS'
};

export const KNOWN_COMPETENCY_SETS = {
  COMP_SET_OPERATIONAL_V1: {
    code: 'COMP_SET_OPERATIONAL_V1',
    totalItems: 6,
    includedItemsCount: 5,
    coceItemIndex: 6,
    coceIncludedInScore: false,
    scoredItemIndexes: [1, 2, 3, 4, 5]
  },
  COMP_SET_MANAGEMENT_V1: {
    code: 'COMP_SET_MANAGEMENT_V1',
    totalItems: 8,
    includedItemsCount: 7,
    coceItemIndex: 6,
    coceIncludedInScore: false,
    scoredItemIndexes: [1, 2, 3, 4, 5, 7, 8]
  }
};

export const CONFIG_LIFECYCLE_STATUS = {
  DRAFT: 'DRAFT',
  VALIDATED: 'VALIDATED',
  PUBLISHED: 'PUBLISHED',
  SUPERSEDED: 'SUPERSEDED',
  RETIRED: 'RETIRED'
};

/**
 * 19 Immutable Payload Fields for Configuration Hash computation
 */
export const IMMUTABLE_PAYLOAD_FIELDS = [
  'Master_Record_Key',
  'Profile_Code',
  'Profile_Family',
  'Scoring_Config_Code',
  'Scoring_Config_Version',
  'Effective_From',
  'Effective_To',
  'Fiscal_Year',
  'PartA_Weight',
  'PartB_Weight',
  'Expected_Appraiser_Count',
  'Appraiser_Weight_Rule_Code',
  'Part_A_Scoring_Mode',
  'Competency_Set_Code',
  'PartA_Rounding_Rule',
  'PartB_Raw_Rounding_Rule',
  'PartB_Weighted_Rounding_Rule',
  'Final_Rounding_Rule',
  'Supersedes_Config_Version'
];

/**
 * Explicitly excluded audit/lifecycle fields (must NOT affect Configuration_Hash)
 */
export const EXCLUDED_AUDIT_FIELDS = [
  'Config_Status',
  'Published_At',
  'Published_By',
  'Configuration_Hash'
];

/**
 * Generates deterministic Master_Record_Key = {Profile_Code}::{Scoring_Config_Version}
 */
export function generateMasterRecordKey(profileCode, scoringConfigVersion) {
  if (!profileCode || typeof profileCode !== 'string' || profileCode.trim() === '') {
    throw new Error('PROFILE_CODE_INVALID: Profile_Code is required');
  }
  if (!scoringConfigVersion || typeof scoringConfigVersion !== 'string' || scoringConfigVersion.trim() === '') {
    throw new Error('CONFIG_VERSION_INVALID: Scoring_Config_Version is required');
  }
  return `${profileCode.trim()}::${scoringConfigVersion.trim()}`;
}

/**
 * Computes deterministic SHA-256 hash over the 19 immutable payload fields only
 */
export function computeConfigurationHash(configPayload) {
  if (!configPayload || typeof configPayload !== 'object') {
    throw new Error('CONFIG_PAYLOAD_INVALID: Payload object is required');
  }

  // Extract and sort immutable payload fields
  const immutableObject = {};
  for (const field of IMMUTABLE_PAYLOAD_FIELDS.slice().sort()) {
    immutableObject[field] = configPayload[field] !== undefined ? configPayload[field] : null;
  }

  const canonicalJson = JSON.stringify(immutableObject);
  return crypto.createHash('sha256').update(canonicalJson, 'utf8').digest('hex');
}

/**
 * Validates a Master Configuration Record against MBO V2 scoring invariants
 */
export function validateScoringMasterConfig(configPayload, existingKeys = []) {
  if (!configPayload || typeof configPayload !== 'object') {
    throw new Error('CONFIG_PAYLOAD_INVALID: Payload object is required');
  }

  // 1. Version requirement
  if (!configPayload.Scoring_Config_Version || typeof configPayload.Scoring_Config_Version !== 'string' || configPayload.Scoring_Config_Version.trim() === '') {
    throw new Error('MISSING_CONFIG_VERSION: Scoring_Config_Version is required');
  }

  // 2. Profile Code requirement & stability check
  if (!configPayload.Profile_Code || !Object.values(PROFILE_CODES).includes(configPayload.Profile_Code)) {
    throw new Error('INVALID_PROFILE_CODE: Profile_Code is invalid or unsupported');
  }

  // 3. Master_Record_Key generation and match
  const expectedKey = generateMasterRecordKey(configPayload.Profile_Code, configPayload.Scoring_Config_Version);
  if (!configPayload.Master_Record_Key || configPayload.Master_Record_Key !== expectedKey) {
    throw new Error(`INVALID_MASTER_RECORD_KEY: Expected ${expectedKey} but got ${configPayload.Master_Record_Key}`);
  }

  // 4. Duplicate Key Rejection
  if (Array.isArray(existingKeys) && existingKeys.includes(configPayload.Master_Record_Key)) {
    throw new Error(`MASTER_CONFIG_DUPLICATE: Key ${configPayload.Master_Record_Key} already exists`);
  }

  // 5. PartA + PartB Weight Validation (Must sum to 100)
  const partA = Number(configPayload.PartA_Weight);
  const partB = Number(configPayload.PartB_Weight);
  if (isNaN(partA) || isNaN(partB) || (partA + partB !== 100)) {
    throw new Error(`INVALID_SCORING_WEIGHTS: PartA_Weight (${partA}) + PartB_Weight (${partB}) must equal 100`);
  }

  // 6. Expected Appraiser Count Validation (Must be 1 or 2)
  const kExpected = Number(configPayload.Expected_Appraiser_Count);
  if (![1, 2].includes(kExpected)) {
    throw new Error(`INVALID_APPRAISER_COUNT: Expected_Appraiser_Count must be 1 or 2, got ${configPayload.Expected_Appraiser_Count}`);
  }

  // 7. Appraiser Weight Rule Validation
  if (!configPayload.Appraiser_Weight_Rule_Code || !Object.values(APPRAISER_WEIGHT_RULES).includes(configPayload.Appraiser_Weight_Rule_Code)) {
    throw new Error('INVALID_APPRAISER_WEIGHT_RULE: Appraiser_Weight_Rule_Code is invalid');
  }

  // 8. Part A Scoring Mode Validation
  if (!configPayload.Part_A_Scoring_Mode || !Object.values(PART_A_SCORING_MODES).includes(configPayload.Part_A_Scoring_Mode)) {
    throw new Error('INVALID_PART_A_MODE: Part_A_Scoring_Mode is invalid');
  }

  // 9. Competency Set Code Requirement & COCE Exclusion Check
  if (!configPayload.Competency_Set_Code || typeof configPayload.Competency_Set_Code !== 'string' || configPayload.Competency_Set_Code.trim() === '') {
    throw new Error('MISSING_COMPETENCY_SET: Competency_Set_Code is required');
  }
  const compSet = KNOWN_COMPETENCY_SETS[configPayload.Competency_Set_Code];
  if (!compSet) {
    throw new Error(`INVALID_COMPETENCY_SET: Competency_Set_Code ${configPayload.Competency_Set_Code} is invalid`);
  }
  if (compSet.coceIncludedInScore !== false || compSet.coceItemIndex !== 6) {
    throw new Error('INVALID_COCE_GOVERNANCE: COCE must have coceItemIndex = 6 and coceIncludedInScore = false');
  }

  // 10. Rounding Rules Validation
  const roundingFields = [
    'PartA_Rounding_Rule',
    'PartB_Raw_Rounding_Rule',
    'PartB_Weighted_Rounding_Rule',
    'Final_Rounding_Rule'
  ];
  for (const field of roundingFields) {
    const rule = configPayload[field];
    if (!rule || !Object.values(ALLOWED_ROUNDING_RULES).includes(rule)) {
      throw new Error(`INVALID_ROUNDING_RULE: ${field} value '${rule}' is not an allowed rounding rule`);
    }
  }

  // 11. Effective Date Requirement & Validity (Fail-Closed)
  if (!configPayload.Effective_From || typeof configPayload.Effective_From !== 'string' || configPayload.Effective_From.trim() === '') {
    throw new Error('MISSING_EFFECTIVE_PERIOD: Effective_From is required');
  }
  if (!configPayload.Effective_To || typeof configPayload.Effective_To !== 'string' || configPayload.Effective_To.trim() === '') {
    throw new Error('MISSING_EFFECTIVE_PERIOD: Effective_To is required');
  }

  const fromDate = new Date(configPayload.Effective_From);
  const toDate = new Date(configPayload.Effective_To);
  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime()) || fromDate > toDate) {
    throw new Error('INVALID_EFFECTIVE_PERIOD: Effective_From must be prior to or equal to Effective_To');
  }

  // Return validated config with computed configuration hash
  const computedHash = computeConfigurationHash(configPayload);
  return {
    isValid: true,
    computedHash
  };
}

/**
 * Returns canonical frozen baseline configurations for ALL 8 evaluation groups
 */
export function getCanonicalBaselineMasterConfigs() {
  return [
    {
      Master_Record_Key: 'PROF_STAFF_CHIEF::v1.0.0',
      Profile_Code: PROFILE_CODES.STAFF_CHIEF,
      Profile_Family: PROFILE_FAMILIES.PROFILE_STAFF_CHIEF,
      Scoring_Config_Code: 'SCORE_CFG_STAFF_CHIEF_V1',
      Scoring_Config_Version: 'v1.0.0',
      Effective_From: '2026-04-01',
      Effective_To: '2027-03-31',
      Fiscal_Year: 'FY2026',
      PartA_Weight: 70,
      PartB_Weight: 30,
      Expected_Appraiser_Count: 2,
      Appraiser_Weight_Rule_Code: APPRAISER_WEIGHT_RULES.EQUAL_DISTRIBUTION_V1,
      Part_A_Scoring_Mode: PART_A_SCORING_MODES.DIFFICULTY_ACHIEVEMENT_MATRIX,
      Competency_Set_Code: 'COMP_SET_OPERATIONAL_V1',
      PartA_Rounding_Rule: ALLOWED_ROUNDING_RULES.ROUNDING_LEGACY_PER_APP_CALC,
      PartB_Raw_Rounding_Rule: ALLOWED_ROUNDING_RULES.ROUNDING_LEGACY_PER_APP_CALC,
      PartB_Weighted_Rounding_Rule: ALLOWED_ROUNDING_RULES.ROUNDING_LEGACY_PER_APP_CALC,
      Final_Rounding_Rule: ALLOWED_ROUNDING_RULES.ROUNDING_LEGACY_PER_APP_CALC,
      Supersedes_Config_Version: 'NONE',
      Config_Status: CONFIG_LIFECYCLE_STATUS.PUBLISHED
    },
    {
      Master_Record_Key: 'PROF_JAPANESE_STAFF::v1.0.0',
      Profile_Code: PROFILE_CODES.JAPANESE_STAFF,
      Profile_Family: PROFILE_FAMILIES.PROFILE_JAPANESE_STAFF,
      Scoring_Config_Code: 'SCORE_CFG_JAPANESE_STAFF_V1',
      Scoring_Config_Version: 'v1.0.0',
      Effective_From: '2026-04-01',
      Effective_To: '2027-03-31',
      Fiscal_Year: 'FY2026',
      PartA_Weight: 70,
      PartB_Weight: 30,
      Expected_Appraiser_Count: 2,
      Appraiser_Weight_Rule_Code: APPRAISER_WEIGHT_RULES.EQUAL_DISTRIBUTION_V1,
      Part_A_Scoring_Mode: PART_A_SCORING_MODES.DIFFICULTY_ACHIEVEMENT_MATRIX,
      Competency_Set_Code: 'COMP_SET_OPERATIONAL_V1',
      PartA_Rounding_Rule: ALLOWED_ROUNDING_RULES.ROUNDING_LEGACY_PER_APP_CALC,
      PartB_Raw_Rounding_Rule: ALLOWED_ROUNDING_RULES.ROUNDING_LEGACY_PER_APP_CALC,
      PartB_Weighted_Rounding_Rule: ALLOWED_ROUNDING_RULES.ROUNDING_LEGACY_PER_APP_CALC,
      Final_Rounding_Rule: ALLOWED_ROUNDING_RULES.ROUNDING_LEGACY_PER_APP_CALC,
      Supersedes_Config_Version: 'NONE',
      Config_Status: CONFIG_LIFECYCLE_STATUS.PUBLISHED
    },
    {
      Master_Record_Key: 'PROF_ASST_MGR::v1.0.0',
      Profile_Code: PROFILE_CODES.ASST_MGR,
      Profile_Family: PROFILE_FAMILIES.PROFILE_MANAGEMENT,
      Scoring_Config_Code: 'SCORE_CFG_ASST_MGR_V1',
      Scoring_Config_Version: 'v1.0.0',
      Effective_From: '2026-04-01',
      Effective_To: '2027-03-31',
      Fiscal_Year: 'FY2026',
      PartA_Weight: 60,
      PartB_Weight: 40,
      Expected_Appraiser_Count: 2,
      Appraiser_Weight_Rule_Code: APPRAISER_WEIGHT_RULES.EQUAL_DISTRIBUTION_V1,
      Part_A_Scoring_Mode: PART_A_SCORING_MODES.DIFFICULTY_ACHIEVEMENT_MATRIX,
      Competency_Set_Code: 'COMP_SET_MANAGEMENT_V1',
      PartA_Rounding_Rule: ALLOWED_ROUNDING_RULES.ROUNDING_LEGACY_PER_APP_CALC,
      PartB_Raw_Rounding_Rule: ALLOWED_ROUNDING_RULES.ROUNDING_LEGACY_PER_APP_CALC,
      PartB_Weighted_Rounding_Rule: ALLOWED_ROUNDING_RULES.ROUNDING_LEGACY_PER_APP_CALC,
      Final_Rounding_Rule: ALLOWED_ROUNDING_RULES.ROUNDING_LEGACY_PER_APP_CALC,
      Supersedes_Config_Version: 'NONE',
      Config_Status: CONFIG_LIFECYCLE_STATUS.PUBLISHED
    },
    {
      Master_Record_Key: 'PROF_SECTION_MGR::v1.0.0',
      Profile_Code: PROFILE_CODES.SECTION_MGR,
      Profile_Family: PROFILE_FAMILIES.PROFILE_MANAGEMENT,
      Scoring_Config_Code: 'SCORE_CFG_SECTION_MGR_V1',
      Scoring_Config_Version: 'v1.0.0',
      Effective_From: '2026-04-01',
      Effective_To: '2027-03-31',
      Fiscal_Year: 'FY2026',
      PartA_Weight: 50,
      PartB_Weight: 50,
      Expected_Appraiser_Count: 2,
      Appraiser_Weight_Rule_Code: APPRAISER_WEIGHT_RULES.EQUAL_DISTRIBUTION_V1,
      Part_A_Scoring_Mode: PART_A_SCORING_MODES.DIFFICULTY_ACHIEVEMENT_MATRIX,
      Competency_Set_Code: 'COMP_SET_MANAGEMENT_V1',
      PartA_Rounding_Rule: ALLOWED_ROUNDING_RULES.ROUNDING_LEGACY_PER_APP_CALC,
      PartB_Raw_Rounding_Rule: ALLOWED_ROUNDING_RULES.ROUNDING_LEGACY_PER_APP_CALC,
      PartB_Weighted_Rounding_Rule: ALLOWED_ROUNDING_RULES.ROUNDING_LEGACY_PER_APP_CALC,
      Final_Rounding_Rule: ALLOWED_ROUNDING_RULES.ROUNDING_LEGACY_FINAL_ROUND_2,
      Supersedes_Config_Version: 'NONE',
      Config_Status: CONFIG_LIFECYCLE_STATUS.PUBLISHED
    },
    {
      Master_Record_Key: 'PROF_SENIOR_MGR::v1.0.0',
      Profile_Code: PROFILE_CODES.SENIOR_MGR,
      Profile_Family: PROFILE_FAMILIES.PROFILE_MANAGEMENT,
      Scoring_Config_Code: 'SCORE_CFG_SENIOR_MGR_V1',
      Scoring_Config_Version: 'v1.0.0',
      Effective_From: '2026-04-01',
      Effective_To: '2027-03-31',
      Fiscal_Year: 'FY2026',
      PartA_Weight: 50,
      PartB_Weight: 50,
      Expected_Appraiser_Count: 2,
      Appraiser_Weight_Rule_Code: APPRAISER_WEIGHT_RULES.EQUAL_DISTRIBUTION_V1,
      Part_A_Scoring_Mode: PART_A_SCORING_MODES.DIFFICULTY_ACHIEVEMENT_MATRIX,
      Competency_Set_Code: 'COMP_SET_MANAGEMENT_V1',
      PartA_Rounding_Rule: ALLOWED_ROUNDING_RULES.ROUNDING_LEGACY_PER_APP_CALC,
      PartB_Raw_Rounding_Rule: ALLOWED_ROUNDING_RULES.ROUNDING_LEGACY_PER_APP_CALC,
      PartB_Weighted_Rounding_Rule: ALLOWED_ROUNDING_RULES.ROUNDING_LEGACY_PER_APP_CALC,
      Final_Rounding_Rule: ALLOWED_ROUNDING_RULES.ROUNDING_LEGACY_FINAL_ROUND_2,
      Supersedes_Config_Version: 'NONE',
      Config_Status: CONFIG_LIFECYCLE_STATUS.PUBLISHED
    },
    {
      Master_Record_Key: 'PROF_DGM::v1.0.0',
      Profile_Code: PROFILE_CODES.DGM,
      Profile_Family: PROFILE_FAMILIES.PROFILE_MANAGEMENT,
      Scoring_Config_Code: 'SCORE_CFG_DGM_V1',
      Scoring_Config_Version: 'v1.0.0',
      Effective_From: '2026-04-01',
      Effective_To: '2027-03-31',
      Fiscal_Year: 'FY2026',
      PartA_Weight: 50,
      PartB_Weight: 50,
      Expected_Appraiser_Count: 2,
      Appraiser_Weight_Rule_Code: APPRAISER_WEIGHT_RULES.EQUAL_DISTRIBUTION_V1,
      Part_A_Scoring_Mode: PART_A_SCORING_MODES.DIFFICULTY_ACHIEVEMENT_MATRIX,
      Competency_Set_Code: 'COMP_SET_MANAGEMENT_V1',
      PartA_Rounding_Rule: ALLOWED_ROUNDING_RULES.ROUNDING_LEGACY_PER_APP_CALC,
      PartB_Raw_Rounding_Rule: ALLOWED_ROUNDING_RULES.ROUNDING_LEGACY_PER_APP_CALC,
      PartB_Weighted_Rounding_Rule: ALLOWED_ROUNDING_RULES.ROUNDING_LEGACY_PER_APP_CALC,
      Final_Rounding_Rule: ALLOWED_ROUNDING_RULES.ROUNDING_LEGACY_PER_APP_CALC,
      Supersedes_Config_Version: 'NONE',
      Config_Status: CONFIG_LIFECYCLE_STATUS.PUBLISHED
    },
    {
      Master_Record_Key: 'PROF_GM::v1.0.0',
      Profile_Code: PROFILE_CODES.GM,
      Profile_Family: PROFILE_FAMILIES.PROFILE_EXECUTIVE,
      Scoring_Config_Code: 'SCORE_CFG_GM_V1',
      Scoring_Config_Version: 'v1.0.0',
      Effective_From: '2026-04-01',
      Effective_To: '2027-03-31',
      Fiscal_Year: 'FY2026',
      PartA_Weight: 50,
      PartB_Weight: 50,
      Expected_Appraiser_Count: 1,
      Appraiser_Weight_Rule_Code: APPRAISER_WEIGHT_RULES.EQUAL_DISTRIBUTION_V1,
      Part_A_Scoring_Mode: PART_A_SCORING_MODES.ACHIEVEMENT_DIRECT,
      Competency_Set_Code: 'COMP_SET_MANAGEMENT_V1',
      PartA_Rounding_Rule: ALLOWED_ROUNDING_RULES.ROUNDING_LEGACY_PER_APP_CALC,
      PartB_Raw_Rounding_Rule: ALLOWED_ROUNDING_RULES.ROUNDING_LEGACY_PER_APP_CALC,
      PartB_Weighted_Rounding_Rule: ALLOWED_ROUNDING_RULES.ROUNDING_LEGACY_PER_APP_CALC,
      Final_Rounding_Rule: ALLOWED_ROUNDING_RULES.ROUNDING_LEGACY_PER_APP_CALC,
      Supersedes_Config_Version: 'NONE',
      Config_Status: CONFIG_LIFECYCLE_STATUS.PUBLISHED
    },
    {
      Master_Record_Key: 'PROF_VP::v1.0.0',
      Profile_Code: PROFILE_CODES.VP,
      Profile_Family: PROFILE_FAMILIES.PROFILE_EXECUTIVE,
      Scoring_Config_Code: 'SCORE_CFG_VP_V1',
      Scoring_Config_Version: 'v1.0.0',
      Effective_From: '2026-04-01',
      Effective_To: '2027-03-31',
      Fiscal_Year: 'FY2026',
      PartA_Weight: 50,
      PartB_Weight: 50,
      Expected_Appraiser_Count: 1,
      Appraiser_Weight_Rule_Code: APPRAISER_WEIGHT_RULES.EQUAL_DISTRIBUTION_V1,
      Part_A_Scoring_Mode: PART_A_SCORING_MODES.ACHIEVEMENT_DIRECT,
      Competency_Set_Code: 'COMP_SET_MANAGEMENT_V1',
      PartA_Rounding_Rule: ALLOWED_ROUNDING_RULES.ROUNDING_LEGACY_PER_APP_CALC,
      PartB_Raw_Rounding_Rule: ALLOWED_ROUNDING_RULES.ROUNDING_LEGACY_PER_APP_CALC,
      PartB_Weighted_Rounding_Rule: ALLOWED_ROUNDING_RULES.ROUNDING_LEGACY_PER_APP_CALC,
      Final_Rounding_Rule: ALLOWED_ROUNDING_RULES.ROUNDING_LEGACY_PER_APP_CALC,
      Supersedes_Config_Version: 'NONE',
      Config_Status: CONFIG_LIFECYCLE_STATUS.PUBLISHED
    }
  ];
}
/**
 * Canonicalizes a scoring config payload to enforce strict string representations 
 * for the 19 immutable fields, enabling stable hash computation across number/string formats.
 */
export function canonicalizeScoringConfigPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('CONFIG_PAYLOAD_INVALID: Payload object is required');
  }

  const canonical = {};

  for (const field of IMMUTABLE_PAYLOAD_FIELDS) {
    const val = payload[field];
    if (val === undefined || val === null) {
      throw new Error(`CANONICALIZATION_FAILED: Missing immutable field '${field}'`);
    }

    if (field === 'PartA_Weight' || field === 'PartB_Weight') {
      const strVal = typeof val === 'string' ? val.trim() : String(val);
      if (strVal === '') {
        throw new Error(`CANONICALIZATION_FAILED: Invalid numeric field '${field}'`);
      }
      const num = Number(strVal);
      if (isNaN(num) || !isFinite(num)) {
        throw new Error(`CANONICALIZATION_FAILED: Invalid numeric field '${field}'`);
      }
      canonical[field] = String(num);
    } else if (field === 'Expected_Appraiser_Count') {
      const strVal = typeof val === 'string' ? val.trim() : String(val);
      if (strVal === '') {
        throw new Error(`CANONICALIZATION_FAILED: Invalid appraiser count '${field}'`);
      }
      const num = Number(strVal);
      if (isNaN(num) || !isFinite(num) || !Number.isInteger(num)) {
        throw new Error(`CANONICALIZATION_FAILED: Expected_Appraiser_Count must be an integer`);
      }
      canonical[field] = String(num);
    } else if (field === 'Effective_From' || field === 'Effective_To') {
      if (typeof val !== 'string') {
        throw new Error(`CANONICALIZATION_FAILED: ${field} must be a string`);
      }
      const trimmed = val.trim();
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(trimmed)) {
        throw new Error(`CANONICALIZATION_FAILED: ${field} must be formatted YYYY-MM-DD`);
      }
      const parsedDate = new Date(trimmed);
      if (isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== trimmed) {
        throw new Error(`CANONICALIZATION_FAILED: ${field} represents an invalid calendar date`);
      }
      canonical[field] = trimmed;
    } else {
      if (typeof val !== 'string') {
        throw new Error(`CANONICALIZATION_FAILED: Field '${field}' must be a string`);
      }
      const trimmed = val.trim();
      if (trimmed === '' && field !== 'Supersedes_Config_Version') {
        throw new Error(`CANONICALIZATION_FAILED: Field '${field}' cannot be empty`);
      }
      canonical[field] = trimmed;
    }
  }

  return canonical;
}
