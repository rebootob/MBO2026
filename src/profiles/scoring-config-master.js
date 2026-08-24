import crypto from 'node:crypto';

/**
 * MBO V2 Phase 3 WP-002A: Scoring Configuration Master Foundation
 * 
 * Master Record Identity: Master_Record_Key = {Profile_Code}::{Scoring_Config_Version}
 * Governance Rules: DEC-035 (LIVE_KINTONE_FIRST), DEC-036 (APPRAISER_WEIGHT_AND_COMPLETENESS), DEC-037 (HYBRID_OPTION_C)
 */

export const PROFILE_CODES = {
  STAFF_CHIEF: 'PROF_STAFF_CHIEF',
  JAPANESE_STAFF: 'PROF_JAPANESE_STAFF',
  ASST_MGR: 'PROF_ASST_MGR',
  MANAGEMENT: 'PROF_MANAGEMENT',
  EXECUTIVE: 'PROF_EXECUTIVE'
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

  // 9. Competency Set Code Requirement
  if (!configPayload.Competency_Set_Code || typeof configPayload.Competency_Set_Code !== 'string' || configPayload.Competency_Set_Code.trim() === '') {
    throw new Error('MISSING_COMPETENCY_SET: Competency_Set_Code is required');
  }

  // 10. Effective Date Validity
  if (configPayload.Effective_From && configPayload.Effective_To) {
    const fromDate = new Date(configPayload.Effective_From);
    const toDate = new Date(configPayload.Effective_To);
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime()) || fromDate > toDate) {
      throw new Error('INVALID_EFFECTIVE_PERIOD: Effective_From must be prior to or equal to Effective_To');
    }
  }

  // Return validated config with computed configuration hash
  const computedHash = computeConfigurationHash(configPayload);
  return {
    isValid: true,
    computedHash
  };
}

/**
 * Returns canonical frozen baseline configurations for all 8 evaluation groups
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
      PartA_Rounding_Rule: 'UNIFIED_HALF_UP_2_DECIMALS',
      PartB_Raw_Rounding_Rule: 'UNIFIED_HALF_UP_2_DECIMALS',
      PartB_Weighted_Rounding_Rule: 'UNIFIED_HALF_UP_2_DECIMALS',
      Final_Rounding_Rule: 'UNIFIED_HALF_UP_2_DECIMALS',
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
      PartA_Rounding_Rule: 'UNIFIED_HALF_UP_2_DECIMALS',
      PartB_Raw_Rounding_Rule: 'UNIFIED_HALF_UP_2_DECIMALS',
      PartB_Weighted_Rounding_Rule: 'UNIFIED_HALF_UP_2_DECIMALS',
      Final_Rounding_Rule: 'UNIFIED_HALF_UP_2_DECIMALS',
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
      PartA_Rounding_Rule: 'UNIFIED_HALF_UP_2_DECIMALS',
      PartB_Raw_Rounding_Rule: 'UNIFIED_HALF_UP_2_DECIMALS',
      PartB_Weighted_Rounding_Rule: 'UNIFIED_HALF_UP_2_DECIMALS',
      Final_Rounding_Rule: 'UNIFIED_HALF_UP_2_DECIMALS',
      Supersedes_Config_Version: 'NONE',
      Config_Status: CONFIG_LIFECYCLE_STATUS.PUBLISHED
    },
    {
      Master_Record_Key: 'PROF_MANAGEMENT::v1.0.0',
      Profile_Code: PROFILE_CODES.MANAGEMENT,
      Profile_Family: PROFILE_FAMILIES.PROFILE_MANAGEMENT,
      Scoring_Config_Code: 'SCORE_CFG_MANAGEMENT_V1',
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
      PartA_Rounding_Rule: 'UNIFIED_HALF_UP_2_DECIMALS',
      PartB_Raw_Rounding_Rule: 'UNIFIED_HALF_UP_2_DECIMALS',
      PartB_Weighted_Rounding_Rule: 'UNIFIED_HALF_UP_2_DECIMALS',
      Final_Rounding_Rule: 'UNIFIED_HALF_UP_2_DECIMALS',
      Supersedes_Config_Version: 'NONE',
      Config_Status: CONFIG_LIFECYCLE_STATUS.PUBLISHED
    },
    {
      Master_Record_Key: 'PROF_EXECUTIVE::v1.0.0',
      Profile_Code: PROFILE_CODES.EXECUTIVE,
      Profile_Family: PROFILE_FAMILIES.PROFILE_EXECUTIVE,
      Scoring_Config_Code: 'SCORE_CFG_EXEC_V1',
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
      PartA_Rounding_Rule: 'UNIFIED_HALF_UP_2_DECIMALS',
      PartB_Raw_Rounding_Rule: 'UNIFIED_HALF_UP_2_DECIMALS',
      PartB_Weighted_Rounding_Rule: 'UNIFIED_HALF_UP_2_DECIMALS',
      Final_Rounding_Rule: 'UNIFIED_HALF_UP_2_DECIMALS',
      Supersedes_Config_Version: 'NONE',
      Config_Status: CONFIG_LIFECYCLE_STATUS.PUBLISHED
    }
  ];
}
