
(function() {
  'use strict';

  /**
 * MBO System Constants & Enums
 */

const BUSINESS_STAGES = {
  NEW_RECORD: 'NEW_RECORD',
  OBJECTIVE_INPUT: 'OBJECTIVE_INPUT',
  MIDYEAR_INPUT: 'MIDYEAR_INPUT',
  SELF_EVALUATION: 'SELF_EVALUATION',
  READ_ONLY: 'READ_ONLY',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR'
};

const STATUS_TO_STAGE_MAP = {
  '01 Draft Objective': BUSINESS_STAGES.OBJECTIVE_INPUT,
  '02 First Manager Objective Review': BUSINESS_STAGES.READ_ONLY,
  '03 Manager Objective Review': BUSINESS_STAGES.READ_ONLY,
  '04 GM Objective Review': BUSINESS_STAGES.READ_ONLY,
  '05 Objective Approved': BUSINESS_STAGES.READ_ONLY,
  '06 Employee Mid-Year': BUSINESS_STAGES.MIDYEAR_INPUT,
  '07 First Manager Mid-Year Review': BUSINESS_STAGES.READ_ONLY,
  '08 Manager Mid-Year Review': BUSINESS_STAGES.READ_ONLY,
  '09 GM Mid-Year Review': BUSINESS_STAGES.READ_ONLY,
  '10 Mid-Year Completed': BUSINESS_STAGES.READ_ONLY,
  '11 Employee Self Evaluation': BUSINESS_STAGES.SELF_EVALUATION,
  '12 First Manager Final Evaluation': BUSINESS_STAGES.READ_ONLY,
  '13 Manager Final Evaluation': BUSINESS_STAGES.READ_ONLY,
  '14 GM Final Evaluation': BUSINESS_STAGES.READ_ONLY,
  '15 HR Final Check': BUSINESS_STAGES.READ_ONLY,
  '16 Completed': BUSINESS_STAGES.READ_ONLY
};

const CONFIDENTIAL_FIELDS = [
  "Manager_Achievement_1",
  "GM_Achievement_1",
  "Manager_Objective_Score_1",
  "GM_Objective_Score_1",
  "Manager_Comment_1",
  "GM_Comment_1",
  "Average_Objective_Score_1",
  "MBO_Point_1",
  "Manager_Achievement_2",
  "GM_Achievement_2",
  "Manager_Objective_Score_2",
  "GM_Objective_Score_2",
  "Manager_Comment_2",
  "GM_Comment_2",
  "Average_Objective_Score_2",
  "MBO_Point_2",
  "Manager_Achievement_3",
  "GM_Achievement_3",
  "Manager_Objective_Score_3",
  "GM_Objective_Score_3",
  "Manager_Comment_3",
  "GM_Comment_3",
  "Average_Objective_Score_3",
  "MBO_Point_3",
  "Manager_Achievement_4",
  "GM_Achievement_4",
  "Manager_Objective_Score_4",
  "GM_Objective_Score_4",
  "Manager_Comment_4",
  "GM_Comment_4",
  "Average_Objective_Score_4",
  "MBO_Point_4",
  "Manager_Achievement_5",
  "GM_Achievement_5",
  "Manager_Objective_Score_5",
  "GM_Objective_Score_5",
  "Manager_Comment_5",
  "GM_Comment_5",
  "Average_Objective_Score_5",
  "MBO_Point_5",
  "Manager_Achievement_6",
  "GM_Achievement_6",
  "Manager_Objective_Score_6",
  "GM_Objective_Score_6",
  "Manager_Comment_6",
  "GM_Comment_6",
  "Average_Objective_Score_6",
  "MBO_Point_6",
  "Manager_Achievement_7",
  "GM_Achievement_7",
  "Manager_Objective_Score_7",
  "GM_Objective_Score_7",
  "Manager_Comment_7",
  "GM_Comment_7",
  "Average_Objective_Score_7",
  "MBO_Point_7",
  "Manager_Achievement_8",
  "GM_Achievement_8",
  "Manager_Objective_Score_8",
  "GM_Objective_Score_8",
  "Manager_Comment_8",
  "GM_Comment_8",
  "Average_Objective_Score_8",
  "MBO_Point_8",
  "Manager_Achievement_9",
  "GM_Achievement_9",
  "Manager_Objective_Score_9",
  "GM_Objective_Score_9",
  "Manager_Comment_9",
  "GM_Comment_9",
  "Average_Objective_Score_9",
  "MBO_Point_9",
  "Manager_Achievement_10",
  "GM_Achievement_10",
  "Manager_Objective_Score_10",
  "GM_Objective_Score_10",
  "Manager_Comment_10",
  "GM_Comment_10",
  "Average_Objective_Score_10",
  "MBO_Point_10",
  "Manager_Competency_Rating_1",
  "GM_Competency_Rating_1",
  "Manager_Competency_Comment_1",
  "GM_Competency_Comment_1",
  "Competency_Result_1",
  "Manager_Competency_Rating_2",
  "GM_Competency_Rating_2",
  "Manager_Competency_Comment_2",
  "GM_Competency_Comment_2",
  "Competency_Result_2",
  "Manager_Competency_Rating_3",
  "GM_Competency_Rating_3",
  "Manager_Competency_Comment_3",
  "GM_Competency_Comment_3",
  "Competency_Result_3",
  "Manager_Competency_Rating_4",
  "GM_Competency_Rating_4",
  "Manager_Competency_Comment_4",
  "GM_Competency_Comment_4",
  "Competency_Result_4",
  "Manager_Competency_Rating_5",
  "GM_Competency_Rating_5",
  "Manager_Competency_Comment_5",
  "GM_Competency_Comment_5",
  "Competency_Result_5",
  "Manager_Competency_Rating_6",
  "GM_Competency_Rating_6",
  "Manager_Competency_Comment_6",
  "GM_Competency_Comment_6",
  "Competency_Result_6",
  "PartA_Raw_Score",
  "PartA_Weighted_Score",
  "PartB_Raw_Score",
  "PartB_Weighted_Score",
  "Final_Confidential_Score",
  "Final_Grade"
];

/**
 * Build deterministic Record Key preserving leading zeroes
 * @param {string} fiscalYear e.g. "FY2026"
 * @param {string} employeeCode e.g. "0149"
 * @returns {string} e.g. "FY2026-0149"
 */
function buildRecordKey(fiscalYear, employeeCode) {
  const fy = String(fiscalYear || '').trim();
  const emp = String(employeeCode || '').trim();
  if (!fy || !emp) {
    return '';
  }
  return `${fy}-${emp}`;
}


  /**
 * Japanese Fiscal Year & Record Key Engine (MBO V2 Pure Foundation)
 *
 * Rules:
 * 1. Japanese Fiscal Year runs from 1 April to 31 March.
 *    - Example: 2027-04-01 to 2028-03-31 is FY2027.
 *    - Example: 2027-03-31 is FY2026.
 * 2. Employee Code is strictly required to be a String matching /^[A-Za-z0-9_-]+$/, preserving leading zeros (e.g. "0149").
 *    Numeric input (e.g. 149), spaces (e.g. "01 49"), slashes, and symbols are rejected to prevent silent corruption.
 * 3. Fiscal Year must match /^FY\d{4}$/i.
 * 4. Record Key is strictly formatted as "{Fiscal_Year}-{Employee_Code}" (e.g. "FY2027-0149") and must satisfy /^FY\d{4}-[A-Za-z0-9_-]+$/.
 * 5. Strict date/time validation rejects invalid calendar dates and invalid timestamp hours/minutes/seconds.
 */

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function getDaysInMonth(year, month) {
  const days = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return days[month - 1];
}

/**
 * Parse and strictly validate a date input (string or Date object).
 * Rejects invalid calendar dates, invalid months/days, invalid hours/minutes/seconds, and trailing garbage.
 * @param {Date|string} dateInput - Date object or ISO date string (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss...)
 * @returns {{ year: number, month: number, day: number }}
 */
function parseAndValidateDate(dateInput) {
  if (dateInput === null || dateInput === undefined) {
    throw new Error('Date input cannot be null or undefined.');
  }

  let year, month, day;

  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();

    // Check for exact YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss(Z|offset)
    const dateMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|([+-])(\d{2}):(\d{2}))?)?$/);
    if (!dateMatch) {
      throw new Error(`Invalid date format (must be YYYY-MM-DD or ISO-8601): "${dateInput}"`);
    }

    year = parseInt(dateMatch[1], 10);
    month = parseInt(dateMatch[2], 10);
    day = parseInt(dateMatch[3], 10);

    // If time components exist, strictly validate hour, minute, second, and timezone offset
    if (dateMatch[4] !== undefined) {
      const hour = parseInt(dateMatch[4], 10);
      const minute = parseInt(dateMatch[5], 10);
      const second = parseInt(dateMatch[6], 10);

      if (hour < 0 || hour > 23) {
        throw new Error(`Invalid hour: ${hour} in date "${dateInput}". Hour must be between 00 and 23.`);
      }
      if (minute < 0 || minute > 59) {
        throw new Error(`Invalid minute: ${minute} in date "${dateInput}". Minute must be between 00 and 59.`);
      }
      if (second < 0 || second > 59) {
        throw new Error(`Invalid second: ${second} in date "${dateInput}". Second must be between 00 and 59.`);
      }

      // If timezone offset exists, validate offset bounds
      if (dateMatch[8] !== undefined) {
        const offsetHour = parseInt(dateMatch[9], 10);
        const offsetMinute = parseInt(dateMatch[10], 10);
        if (offsetHour < 0 || offsetHour > 14) {
          throw new Error(`Invalid timezone offset hour: ${offsetHour} in date "${dateInput}".`);
        }
        if (offsetMinute < 0 || offsetMinute > 59) {
          throw new Error(`Invalid timezone offset minute: ${offsetMinute} in date "${dateInput}".`);
        }
      }
    }

    // If ISO string with UTC 'Z' timezone, evaluate in UTC
    if (dateMatch[7] === 'Z') {
      const d = new Date(trimmed);
      if (isNaN(d.getTime())) {
        throw new Error(`Invalid date input: "${dateInput}"`);
      }
      year = d.getUTCFullYear();
      month = d.getUTCMonth() + 1;
      day = d.getUTCDate();
    }
  } else if (dateInput instanceof Date) {
    if (isNaN(dateInput.getTime())) {
      throw new Error('Invalid Date object instance.');
    }
    year = dateInput.getFullYear();
    month = dateInput.getMonth() + 1;
    day = dateInput.getDate();
  } else {
    throw new Error(`Unsupported date input type: ${typeof dateInput}`);
  }

  // Validate Year range
  if (year < 1900 || year > 2100) {
    throw new Error(`Year ${year} is out of supported range (1900-2100).`);
  }

  // Validate Month range (1 to 12)
  if (month < 1 || month > 12) {
    throw new Error(`Invalid month: ${month} in date "${dateInput}". Month must be between 01 and 12.`);
  }

  // Validate Day range for specific month/year
  const maxDays = getDaysInMonth(year, month);
  if (day < 1 || day > maxDays) {
    throw new Error(`Invalid day: ${day} for month ${month}/${year} in date "${dateInput}". Maximum valid day is ${maxDays}.`);
  }

  return { year, month, day };
}

/**
 * Calculate the Japanese Fiscal Year from a strictly validated date.
 * @param {Date|string} dateInput - Date object or ISO date string (YYYY-MM-DD)
 * @returns {string} Fiscal Year string in format "FYXXXX" (e.g. "FY2027")
 */
function getJapaneseFiscalYear(dateInput = new Date()) {
  const { year, month } = parseAndValidateDate(dateInput);

  // Japanese FY: April (Month 4) to March (Month 3 of next calendar year)
  const fiscalYearNumber = month >= 4 ? year : year - 1;
  return `FY${fiscalYearNumber}`;
}

/**
 * Validate that a string qualifies as a canonical Employee Code.
 * Must match /^[A-Za-z0-9_-]+$/.
 * @param {any} code - Value to test
 * @returns {boolean} True if code is non-empty string matching /^[A-Za-z0-9_-]+$/
 */
function isValidEmployeeCode(code) {
  if (typeof code !== 'string') {
    return false;
  }
  const trimmed = code.trim();
  if (trimmed.length === 0) {
    return false;
  }
  return /^[A-Za-z0-9_-]+$/.test(trimmed);
}

/**
 * Normalize and strictly validate an Employee Code.
 * Enforces String type and format /^[A-Za-z0-9_-]+$/ to guarantee canonical leading zeros are never destroyed.
 * Rejects numeric inputs (e.g. 149), spaces (e.g. "01 49"), slashes, and non-string types.
 * @param {string} code - Raw employee code input (must be string)
 * @returns {string} Canonical preserved string representation (e.g. "0149")
 */
function normalizeEmployeeCode(code) {
  if (code === null || code === undefined) {
    throw new Error('Employee Code cannot be null or undefined.');
  }

  if (typeof code !== 'string') {
    throw new Error(`Employee Code must be a string (received ${typeof code}). Numeric codes like ${code} are rejected to protect canonical leading zeros.`);
  }

  const strCode = code.trim();
  if (strCode.length === 0) {
    throw new Error('Employee Code cannot be empty.');
  }

  if (!/^[A-Za-z0-9_-]+$/.test(strCode)) {
    throw new Error(`Invalid Employee Code format: "${code}". Employee Code must contain only alphanumeric characters, underscores, and hyphens (no spaces or slashes).`);
  }

  return strCode;
}

/**
 * Validate that a given Record Key conforms to standard MBO V2 format.
 * @param {string} recordKey - Record Key string to validate
 * @returns {boolean} True if format matches /^FY\d{4}-[A-Za-z0-9_-]+$/
 */
function isValidRecordKeyFormat(recordKey) {
  if (!recordKey || typeof recordKey !== 'string') {
    return false;
  }
  return /^FY\d{4}-[A-Za-z0-9_-]+$/.test(recordKey.trim());
}

/**
 * Generate standard MBO Record Key from Fiscal Year and Employee Code.
 * Validates that Fiscal Year matches /^FY\d{4}$/i and Employee Code satisfies canonical contract.
 * Guarantees that the returned Record Key satisfies isValidRecordKeyFormat() === true.
 * @param {string} fiscalYear - Fiscal Year string (e.g. "FY2027")
 * @param {string} employeeCode - Canonical string Employee Code (e.g. "0149")
 * @returns {string} Standard Record Key (e.g. "FY2027-0149")
 */
function generateRecordKey(fiscalYear, employeeCode) {
  if (!fiscalYear || typeof fiscalYear !== 'string') {
    throw new Error('Fiscal Year is required and must be a string.');
  }

  const cleanFy = fiscalYear.trim().toUpperCase();
  if (!/^FY\d{4}$/.test(cleanFy)) {
    throw new Error(`Invalid Fiscal Year format: "${fiscalYear}". Expected format is FYYYYY (e.g. FY2027).`);
  }

  const cleanEmpCode = normalizeEmployeeCode(employeeCode);
  const generatedKey = `${cleanFy}-${cleanEmpCode}`;

  if (!isValidRecordKeyFormat(generatedKey)) {
    throw new Error(`Generated Record Key "${generatedKey}" violates canonical Record Key format.`);
  }

  return generatedKey;
}


  

/**
 * MBO V2 Phase 3 WP-002A: Scoring Configuration Master Foundation
 * 
 * Master Record Identity: Master_Record_Key = {Profile_Code}::{Scoring_Config_Version}
 * Governance Rules: DEC-035 (LIVE_KINTONE_FIRST), DEC-036 (APPRAISER_WEIGHT_AND_COMPLETENESS), DEC-038 (KINTONE_ONLY)
 */

const PROFILE_CODES = {
  STAFF_CHIEF: 'PROF_STAFF_CHIEF',
  JAPANESE_STAFF: 'PROF_JAPANESE_STAFF',
  ASST_MGR: 'PROF_ASST_MGR',
  SECTION_MGR: 'PROF_SECTION_MGR',
  SENIOR_MGR: 'PROF_SENIOR_MGR',
  DGM: 'PROF_DGM',
  GM: 'PROF_GM',
  VP: 'PROF_VP'
};

const PROFILE_FAMILIES = {
  PROFILE_STAFF_CHIEF: 'PROFILE_STAFF_CHIEF',
  PROFILE_JAPANESE_STAFF: 'PROFILE_JAPANESE_STAFF',
  PROFILE_MANAGEMENT: 'PROFILE_MANAGEMENT',
  PROFILE_EXECUTIVE: 'PROFILE_EXECUTIVE'
};

const PART_A_SCORING_MODES = {
  DIFFICULTY_ACHIEVEMENT_MATRIX: 'DIFFICULTY_ACHIEVEMENT_MATRIX',
  ACHIEVEMENT_DIRECT: 'ACHIEVEMENT_DIRECT'
};

const APPRAISER_WEIGHT_RULES = {
  EQUAL_DISTRIBUTION_V1: 'EQUAL_DISTRIBUTION_V1'
};

const ALLOWED_ROUNDING_RULES = {
  ROUNDING_LEGACY_PER_APP_CALC: 'ROUNDING_LEGACY_PER_APP_CALC',
  ROUNDING_LEGACY_FINAL_ROUND_2: 'ROUNDING_LEGACY_FINAL_ROUND_2',
  UNIFIED_HALF_UP_2_DECIMALS: 'UNIFIED_HALF_UP_2_DECIMALS'
};

const KNOWN_COMPETENCY_SETS = {
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

const CONFIG_LIFECYCLE_STATUS = {
  DRAFT: 'DRAFT',
  VALIDATED: 'VALIDATED',
  PUBLISHED: 'PUBLISHED',
  SUPERSEDED: 'SUPERSEDED',
  RETIRED: 'RETIRED'
};

/**
 * 19 Immutable Payload Fields for Configuration Hash computation
 */
const IMMUTABLE_PAYLOAD_FIELDS = [
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
const EXCLUDED_AUDIT_FIELDS = [
  'Config_Status',
  'Published_At',
  'Published_By',
  'Configuration_Hash'
];

/**
 * Generates deterministic Master_Record_Key = {Profile_Code}::{Scoring_Config_Version}
 */
function generateMasterRecordKey(profileCode, scoringConfigVersion) {
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
function computeConfigurationHash(configPayload) {
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
function validateScoringMasterConfig(configPayload, existingKeys = []) {
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
function getCanonicalBaselineMasterConfigs() {
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
      Expected_Appraiser_Count: 1,
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
function canonicalizeScoringConfigPayload(payload) {
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


  /**
 * Phase 3 WP-002B: profile resolution and read-only scoring configuration resolver.
 * This module deliberately has no Kintone adapter: master records are injected.
 */




const POSITION_TO_PROFILE = new Map([
  ['staff', PROFILE_CODES.STAFF_CHIEF],
  ['senior staff', PROFILE_CODES.STAFF_CHIEF],
  ['chief', PROFILE_CODES.STAFF_CHIEF],
  ['marketing chief', PROFILE_CODES.STAFF_CHIEF],
  ['support marketing staff', PROFILE_CODES.STAFF_CHIEF],
  ['support marketing chief', PROFILE_CODES.STAFF_CHIEF],
  ['supoort marketing staff', PROFILE_CODES.STAFF_CHIEF],
  ['supoort marketing chief', PROFILE_CODES.STAFF_CHIEF],
  ['technical service engineer', PROFILE_CODES.STAFF_CHIEF],
  ['technical service chief', PROFILE_CODES.STAFF_CHIEF],
  ['accounting staff', PROFILE_CODES.STAFF_CHIEF],
  ['chief of engineer', PROFILE_CODES.STAFF_CHIEF],
  ['marketing engineer', PROFILE_CODES.STAFF_CHIEF],
  ['engineering staff', PROFILE_CODES.STAFF_CHIEF],
  ['it staff', PROFILE_CODES.STAFF_CHIEF],
  ['technical chief', PROFILE_CODES.STAFF_CHIEF],
  ['technician', PROFILE_CODES.STAFF_CHIEF],
  ['safety officer', PROFILE_CODES.STAFF_CHIEF],
  ['service engineer', PROFILE_CODES.STAFF_CHIEF],
  ['chief of safety officer', PROFILE_CODES.STAFF_CHIEF],
  ['technical staff', PROFILE_CODES.STAFF_CHIEF],
  ['accounting chief', PROFILE_CODES.STAFF_CHIEF],
  ['design engineer', PROFILE_CODES.STAFF_CHIEF],
  ['marketing staff', PROFILE_CODES.STAFF_CHIEF],
  ['operator', PROFILE_CODES.STAFF_CHIEF],
  ['assistant chief', PROFILE_CODES.STAFF_CHIEF],
  ['coordinator', PROFILE_CODES.STAFF_CHIEF],
  ['messenger', PROFILE_CODES.STAFF_CHIEF],
  ['senior chief', PROFILE_CODES.STAFF_CHIEF],
  ['trainee', PROFILE_CODES.STAFF_CHIEF],
  ['cam staff', PROFILE_CODES.STAFF_CHIEF],
  ['specialist', PROFILE_CODES.STAFF_CHIEF],
  ['executive management coordinator', PROFILE_CODES.STAFF_CHIEF],
  ['safety', PROFILE_CODES.STAFF_CHIEF],
  ['senior specilaist', PROFILE_CODES.STAFF_CHIEF],
  ['warehouse support', PROFILE_CODES.STAFF_CHIEF],
  ['driver', PROFILE_CODES.STAFF_CHIEF],
  ['contract (apite)', PROFILE_CODES.STAFF_CHIEF],
  ['interpreter', PROFILE_CODES.STAFF_CHIEF],
  ['warehouse staff', PROFILE_CODES.STAFF_CHIEF],
  ['safety officer& iso control', PROFILE_CODES.STAFF_CHIEF],
  ['clerk', PROFILE_CODES.STAFF_CHIEF],
  ['japanese staff', PROFILE_CODES.JAPANESE_STAFF],
  ['expatriate', PROFILE_CODES.JAPANESE_STAFF],
  ['expatriate japanese staff', PROFILE_CODES.JAPANESE_STAFF],
  ['advisor', PROFILE_CODES.JAPANESE_STAFF],
  ['contract (japan support)', PROFILE_CODES.JAPANESE_STAFF],
  ['assistant manager', PROFILE_CODES.ASST_MGR],
  ['assistant section manager', PROFILE_CODES.ASST_MGR],
  ['asst. section manager', PROFILE_CODES.ASST_MGR],
  ['design engineer assistant manager', PROFILE_CODES.ASST_MGR],
  ['section manager', PROFILE_CODES.SECTION_MGR],
  ['manager', PROFILE_CODES.SECTION_MGR],
  ['co project manager', PROFILE_CODES.SECTION_MGR],
  ['factory manager', PROFILE_CODES.GM],
  ['senior manager', PROFILE_CODES.SENIOR_MGR],
  ['deputy general manager', PROFILE_CODES.DGM],
  ['general manager', PROFILE_CODES.GM],
  ['vice president', PROFILE_CODES.VP],
  ['president', PROFILE_CODES.VP]
]);

const AMBIGUOUS_TITLES = new Set([]);

const OUTPUT_FIELDS = [
  'Profile_Code', 'Profile_Family', 'Scoring_Config_Code', 'Scoring_Config_Version',
  'Fiscal_Year', 'Expected_Appraiser_Count', 'Appraiser_Weight_Rule_Code',
  'PartA_Weight', 'PartB_Weight', 'Part_A_Scoring_Mode', 'Competency_Set_Code',
  'PartA_Rounding_Rule', 'PartB_Raw_Rounding_Rule',
  'PartB_Weighted_Rounding_Rule', 'Final_Rounding_Rule', 'Effective_From',
  'Effective_To', 'Configuration_Hash'
];

class ProfileScoringResolverError extends Error {
  constructor(code, message = code) {
    super(message);
    this.name = 'ProfileScoringResolverError';
    this.code = code;
  }
}

/** Applies the frozen title normalization policy. */
function normalizeTitle(rawTitle) {
  if (typeof rawTitle !== 'string' || rawTitle.trim() === '') {
    throw new ProfileScoringResolverError('PROFILE_SOURCE_INVALID');
  }
  return rawTitle.trim().replace(/\s+/g, ' ').toLowerCase();
}

function resolveProfileCode(employeeSnapshot) {
  if (!isVerifiedEmployeeSnapshot(employeeSnapshot)) {
    throw new ProfileScoringResolverError('EMPLOYEE_SNAPSHOT_UNVERIFIED');
  }
  const normalizedTitle = normalizeTitle(employeeSnapshot.Employee_Position);
  if (AMBIGUOUS_TITLES.has(normalizedTitle)) {
    throw new ProfileScoringResolverError('PROFILE_RESOLUTION_AMBIGUOUS');
  }
  const profileCode = POSITION_TO_PROFILE.get(normalizedTitle);
  if (!profileCode) {
    throw new ProfileScoringResolverError('PROFILE_SOURCE_INVALID');
  }
  return profileCode;
}

function assertAuthenticatedContext(authenticatedContext) {
  // This pre-verified caller contract is not the production security boundary.
  // Native Kintone permissions or approved server-side controls remain that boundary.
  if (!authenticatedContext || typeof authenticatedContext !== 'object' || authenticatedContext.isAuthenticated !== true) {
    throw new ProfileScoringResolverError('AUTHENTICATED_CONTEXT_REQUIRED');
  }
}

function assertFiscalYear(fiscalYear) {
  if (typeof fiscalYear !== 'string' || !/^FY\d{4}$/i.test(fiscalYear.trim())) {
    throw new ProfileScoringResolverError('FISCAL_YEAR_INVALID');
  }
  return fiscalYear.trim().toUpperCase();
}

function assertIsoDate(date, code) {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
    throw new ProfileScoringResolverError(code);
  }
  try {
    getJapaneseFiscalYear(date.trim());
  } catch {
    throw new ProfileScoringResolverError(code);
  }
  return date.trim();
}

function isEligibleConfig(config, profileCode, fiscalYear, effectiveDate) {
  if (!config || typeof config !== 'object' ||
      config.Profile_Code !== profileCode || config.Fiscal_Year !== fiscalYear ||
      config.Config_Status !== 'PUBLISHED') return false;
  try {
    const from = assertIsoDate(config.Effective_From, 'SCORING_CONFIG_NOT_FOUND');
    const to = assertIsoDate(config.Effective_To, 'SCORING_CONFIG_NOT_FOUND');
    return from <= effectiveDate && effectiveDate <= to;
  } catch {
    return false;
  }
}

function toResolvedOutput(config) {
  const result = {};
  for (const field of OUTPUT_FIELDS) result[field] = config[field];
  return result;
}

function resolveProfileScoringConfig({
  employeeSnapshot,
  fiscalYear,
  effectiveDate,
  masterConfigRecords,
  authenticatedContext
} = {}) {
  assertAuthenticatedContext(authenticatedContext);
  const requestedFiscalYear = assertFiscalYear(fiscalYear);
  const requestedEffectiveDate = assertIsoDate(effectiveDate, 'EFFECTIVE_DATE_INVALID');
  if (getJapaneseFiscalYear(requestedEffectiveDate) !== requestedFiscalYear) {
    throw new ProfileScoringResolverError('FISCAL_YEAR_EFFECTIVE_DATE_MISMATCH');
  }
  if (!Array.isArray(masterConfigRecords)) {
    throw new ProfileScoringResolverError('SCORING_CONFIG_NOT_FOUND');
  }

  const resolvedProfileCode = resolveProfileCode(employeeSnapshot);
  const matches = masterConfigRecords.filter(config =>
    isEligibleConfig(config, resolvedProfileCode, requestedFiscalYear, requestedEffectiveDate)
  );
  if (matches.length === 0) throw new ProfileScoringResolverError('SCORING_CONFIG_NOT_FOUND');
  if (matches.length !== 1) throw new ProfileScoringResolverError('SCORING_CONFIG_AMBIGUOUS');

  const config = matches[0];
  try {
    validateScoringMasterConfig(config);
  } catch {
    throw new ProfileScoringResolverError('SCORING_CONFIG_INVALID');
  }
  if (typeof config.Configuration_Hash !== 'string' || config.Configuration_Hash.length !== 64 ||
      computeConfigurationHash(config) !== config.Configuration_Hash) {
    throw new ProfileScoringResolverError('SCORING_CONFIG_INTEGRITY_FAILED');
  }
  return toResolvedOutput(config);
}


  /**
 * Safe Host Resolver for Kintone Record UI
 */

function getRecordUiHost(preferredSpaceId = 'SPACE_HEADER') {
  if (typeof kintone === 'undefined' || !kintone.app || !kintone.app.record) {
    return null;
  }

  // 1. Try specified Space Field
  if (typeof kintone.app.record.getSpaceElement === 'function') {
    const spaceEl = kintone.app.record.getSpaceElement(preferredSpaceId);
    if (spaceEl) return spaceEl;

    // Fallback space IDs
    const fallbackSpaceIds = ['SPACE_HEADER', 'SPACE_MBO_ROOT', 'SPACE_PART_A'];
    for (const id of fallbackSpaceIds) {
      if (id !== preferredSpaceId) {
        const el = kintone.app.record.getSpaceElement(id);
        if (el) return el;
      }
    }
  }

  // 2. Fallback: Record Header Menu Space Element
  if (typeof kintone.app.record.getHeaderMenuSpaceElement === 'function') {
    const menuEl = kintone.app.record.getHeaderMenuSpaceElement();
    if (menuEl) return menuEl;
  }

  return null;
}


  /**
 * Business Rule Validation Engine (Bilingual Thai / English + Field-level errors)
 */



class ValidationEngine {
  /**
   * Validate record against stage business rules
   * @param {Object} record Kintone record object
   * @param {string} stage Current business stage
   * @returns {Object} { isValid: boolean, fieldErrors: Array<{field: string, messageTH: string, messageEN: string, message: string}>, errors: string[] }
   */
  static validate(record, stage) {
    const fieldErrors = [];

    if (!record) {
      fieldErrors.push({
        field: 'RECORD',
        messageTH: 'ไม่พบข้อมูล Record',
        messageEN: 'Record data not found',
        message: 'ไม่พบข้อมูล Record\nRecord data not found'
      });
      return this._formatResult(fieldErrors);
    }

    if (stage === BUSINESS_STAGES.CONFIGURATION_ERROR) {
      fieldErrors.push({
        field: 'SYSTEM',
        messageTH: 'ระบบไม่สามารถระบุขั้นตอนการทำงานได้ กรุณาติดต่อ HR / Administrator (SYSTEM CONFIGURATION ERROR)',
        messageEN: 'Unable to identify workflow stage. Please contact HR / Administrator.',
        message: 'ระบบไม่สามารถระบุขั้นตอนการทำงานได้ กรุณาติดต่อ HR / Administrator (SYSTEM CONFIGURATION ERROR)\nUnable to identify workflow stage. Please contact HR / Administrator.'
      });
      return this._formatResult(fieldErrors);
    }

    if (stage === BUSINESS_STAGES.READ_ONLY) {
      return this._formatResult([]);
    }

    // Common checks
    const empCode = this._val(record.Employee_Code);
    if (!empCode) {
      fieldErrors.push({
        field: 'Employee_Code',
        messageTH: 'กรุณาระบุรหัสพนักงานและกดค้นหา',
        messageEN: 'Please enter Employee Code and search',
        message: 'กรุณาระบุรหัสพนักงานและกดค้นหา\nPlease enter Employee Code and search'
      });
    }

    const empName = this._val(record.Employee_Name);
    if (!empName) {
      fieldErrors.push({
        field: 'Employee_Code',
        messageTH: 'กรุณากดค้นหาและยืนยันข้อมูลพนักงานก่อนบันทึก',
        messageEN: 'Please search and verify employee profile before saving',
        message: 'กรุณากดค้นหาและยืนยันข้อมูลพนักงานก่อนบันทึก\nPlease search and verify employee profile before saving'
      });
    }

    const fy = this._val(record.Fiscal_Year);
    if (!fy) {
      fieldErrors.push({
        field: 'Fiscal_Year',
        messageTH: 'กรุณาระบุรอบการประเมิน (Fiscal Year)',
        messageEN: 'Please enter Fiscal Year',
        message: 'กรุณาระบุรอบการประเมิน (Fiscal Year)\nPlease enter Fiscal Year'
      });
    }

    const objCount = parseInt(this._val(record.Objective_Count) || '4', 10);
    if (isNaN(objCount) || objCount < 2 || objCount > 10) {
      fieldErrors.push({
        field: 'Objective_Count',
        messageTH: 'จำนวน Objective ต้องอยู่ระหว่าง 2 ถึง 10 ข้อ',
        messageEN: 'Objective Count must be between 2 and 10',
        message: 'จำนวน Objective ต้องอยู่ระหว่าง 2 ถึง 10 ข้อ\nObjective Count must be between 2 and 10'
      });
      return this._formatResult(fieldErrors);
    }

    // Stage 1: OBJECTIVE_INPUT or NEW_RECORD (Create Submit validates objectives)
    if (stage === BUSINESS_STAGES.OBJECTIVE_INPUT || stage === BUSINESS_STAGES.NEW_RECORD) {
      const profileCode = this._val(record.Profile_Code);
      if (!profileCode) {
        fieldErrors.push({
          field: 'Employee_Code',
          messageTH: 'ไม่พบข้อมูล Profile Code ของพนักงาน กรุณากดค้นหาเพื่อระบุกลุ่มประเมิน',
          messageEN: 'Employee scoring profile code was not found. Please search to resolve profile.',
          message: 'ไม่พบข้อมูล Profile Code ของพนักงาน กรุณากดค้นหาเพื่อระบุกลุ่มประเมิน\nEmployee scoring profile code was not found. Please search to resolve profile.'
        });
      }

      const routingTopo = this._val(record.Routing_Topology);
      const requesterUserVal = record.Requester_User?.value;
      const hasRequester = Array.isArray(requesterUserVal) && requesterUserVal.length > 0;

      if (!routingTopo || !hasRequester) {
        fieldErrors.push({
          field: 'Employee_Code',
          messageTH: 'ไม่พบข้อมูล Routing ของพนักงาน กรุณากดค้นหาเพื่อระบุเส้นทางอนุมัติ',
          messageEN: 'Employee routing workflow was not found. Please search to resolve routing.',
          message: 'ไม่พบข้อมูล Routing ของพนักงาน กรุณากดค้นหาเพื่อระบุเส้นทางอนุมัติ\nEmployee routing workflow was not found. Please search to resolve routing.'
        });
      }

      // Automatically clear inactive rows so stale values do not leak into saved record
      this.clearInactiveRows(record);

      let totalWeight = 0;

      for (let i = 1; i <= objCount; i++) {
        const obj = this._val(record[`Objective_${i}`]);
        const plan = this._val(record[`Action_Plan_${i}`]);
        const weightVal = this._val(record[`Weight_${i}`]);
        const weight = parseFloat(weightVal || '0');
        const diffVal = this._val(record[`Difficulty_${i}`]);
        const diff = parseInt(diffVal, 10);

        if (!obj) {
          fieldErrors.push({
            field: `Objective_${i}`,
            messageTH: `กรุณาระบุเป้าหมายข้อที่ ${i}`,
            messageEN: `Please enter Objective ${i}`,
            message: `กรุณาระบุเป้าหมายข้อที่ ${i}\nPlease enter Objective ${i}`
          });
        }
        if (!plan) {
          fieldErrors.push({
            field: `Action_Plan_${i}`,
            messageTH: `กรุณาระบุแผนปฏิบัติการข้อที่ ${i}`,
            messageEN: `Please enter Action Plan ${i}`,
            message: `กรุณาระบุแผนปฏิบัติการข้อที่ ${i}\nPlease enter Action Plan ${i}`
          });
        }
        if (!weightVal || isNaN(weight) || weight <= 0 || weight > 100) {
          fieldErrors.push({
            field: `Weight_${i}`,
            messageTH: `กรุณาระบุน้ำหนักข้อที่ ${i} (1 - 100%)`,
            messageEN: `Please enter Weight ${i} (1 - 100%)`,
            message: `กรุณาระบุน้ำหนักข้อที่ ${i} (1 - 100%)\nPlease enter Weight ${i} (1 - 100%)`
          });
        } else {
          totalWeight += weight;
        }
        if (!diffVal || isNaN(diff) || diff < 1 || diff > 4) {
          fieldErrors.push({
            field: `Difficulty_${i}`,
            messageTH: `กรุณาเลือกระดับความยากข้อที่ ${i} (1 - 4)`,
            messageEN: `Please select Difficulty Level ${i} (1 - 4)`,
            message: `กรุณาเลือกระดับความยากข้อที่ ${i} (1 - 4)\nPlease select Difficulty Level ${i} (1 - 4)`
          });
        }
      }

      if (Math.round(totalWeight) !== 100) {
        fieldErrors.push({
          field: 'Total_Weight',
          messageTH: `ผลรวมน้ำหนักต้องเท่ากับ 100% (ปัจจุบันได้ ${totalWeight}%)`,
          messageEN: `Total Weight must equal 100% (Currently ${totalWeight}%)`,
          message: `ผลรวมน้ำหนักต้องเท่ากับ 100% (ปัจจุบันได้ ${totalWeight}%)\nTotal Weight must equal 100% (Currently ${totalWeight}%)`
        });
      }
    }

    // Stage 2: MIDYEAR_INPUT
    if (stage === BUSINESS_STAGES.MIDYEAR_INPUT) {
      for (let i = 1; i <= objCount; i++) {
        const progVal = this._val(record[`Progress_Percent_${i}`]);
        const prog = parseFloat(progVal || '0');
        if (progVal === '' || isNaN(prog) || prog < 0 || prog > 100) {
          fieldErrors.push({
            field: `Progress_Percent_${i}`,
            messageTH: `กรุณาระบุความคืบหน้า % ข้อที่ ${i} (0 - 100%)`,
            messageEN: `Please enter Progress % ${i} (0 - 100%)`,
            message: `กรุณาระบุความคืบหน้า % ข้อที่ ${i} (0 - 100%)\nPlease enter Progress % ${i} (0 - 100%)`
          });
        }
      }
    }

    // Stage 3: SELF_EVALUATION
    if (stage === BUSINESS_STAGES.SELF_EVALUATION) {
      for (let i = 1; i <= objCount; i++) {
        const actual = this._val(record[`Actual_Result_${i}`]);
        const achVal = this._val(record[`Self_Achievement_${i}`]);
        const ach = parseInt(achVal, 10);

        if (!actual) {
          fieldErrors.push({
            field: `Actual_Result_${i}`,
            messageTH: `กรุณาระบุผลการดำเนินงานจริงข้อที่ ${i}`,
            messageEN: `Please enter Actual Result ${i}`,
            message: `กรุณาระบุผลการดำเนินงานจริงข้อที่ ${i}\nPlease enter Actual Result ${i}`
          });
        }
        if (!achVal || isNaN(ach) || ach < 1 || ach > 5) {
          fieldErrors.push({
            field: `Self_Achievement_${i}`,
            messageTH: `กรุณาเลือกระดับผลสำเร็จข้อที่ ${i} (1 - 5)`,
            messageEN: `Please select Self Achievement ${i} (1 - 5)`,
            message: `กรุณาเลือกระดับผลสำเร็จข้อที่ ${i} (1 - 5)\nPlease select Self Achievement ${i} (1 - 5)`
          });
        }
      }
    }

    return this._formatResult(fieldErrors);
  }

  static _formatResult(fieldErrors) {
    return {
      isValid: fieldErrors.length === 0,
      fieldErrors: fieldErrors,
      errors: fieldErrors.map(e => e.message)
    };
  }

  static clearInactiveRows(record) {
    if (!record) return;
    const objCount = parseInt(this._val(record.Objective_Count) || '4', 10);
    if (isNaN(objCount) || objCount < 2 || objCount > 10) return;

    for (let i = objCount + 1; i <= 10; i++) {
      const rowFields = [
        `Objective_${i}`, `Action_Plan_${i}`, `Weight_${i}`, `Difficulty_${i}`,
        `Progress_Percent_${i}`, `Actual_Result_${i}`, `Self_Achievement_${i}`,
        `Midyear_Comment_${i}`, `Appraiser_Achievement_${i}`, `Appraiser_Comment_${i}`
      ];
      rowFields.forEach(f => {
        if (record[f]) {
          if (typeof record[f] === 'object' && 'value' in record[f]) {
            record[f].value = '';
          } else {
            record[f] = '';
          }
        }
      });
    }
  }

  /**
   * Validate workflow action against record topology and assigned user fields
   * @param {Object} record Kintone record object
   * @param {string} actionName Name of process action (event.action?.value)
   * @param {string} stage Resolved business stage from STATUS_TO_STAGE_MAP
   * @returns {Object} { isValid: boolean, fieldErrors: Array, errors: string[] }
   */
  static validateWorkflowAction(record, actionName, stage) {
    const fieldErrors = [];

    if (!record) {
      fieldErrors.push({
        field: 'RECORD',
        messageTH: 'ไม่พบข้อมูล Record',
        messageEN: 'Record data not found',
        message: 'ไม่พบข้อมูล Record\nRecord data not found'
      });
      return this._formatResult(fieldErrors);
    }

    if (stage === BUSINESS_STAGES.CONFIGURATION_ERROR) {
      fieldErrors.push({
        field: 'Status',
        messageTH: 'สถานะขั้นตอนการทำงานไม่ถูกต้อง หรือไม่ตรงกับระบบ (CONFIGURATION_ERROR)',
        messageEN: 'Workflow status is invalid or unmapped (CONFIGURATION_ERROR)',
        message: 'สถานะขั้นตอนการทำงานไม่ถูกต้อง หรือไม่ตรงกับระบบ (CONFIGURATION_ERROR)\nWorkflow status is invalid or unmapped (CONFIGURATION_ERROR)'
      });
      return this._formatResult(fieldErrors);
    }

    const topology = this._val(record.Routing_Topology);
    const status = this._val(record.Status);

    // 1. Exact Topology Whitelist Guard
    const RECOGNIZED_TOPOLOGIES = ['M1_G1', 'M1_M2_G1', 'M1_G1_G2', 'M1_M2_G1_G2', 'M1_ONLY'];
    if (!topology || !RECOGNIZED_TOPOLOGIES.includes(topology)) {
      fieldErrors.push({
        field: 'Routing_Topology',
        messageTH: `รูปแบบเส้นทางการอนุมัติ "${topology || 'BLANK'}" ไม่ถูกต้องหรือยังไม่ได้ระบุ (UNKNOWN TOPOLOGY FAIL-CLOSED)`,
        messageEN: `Routing topology "${topology || 'BLANK'}" is invalid or unmapped.`,
        message: `รูปแบบเส้นทางการอนุมัติ "${topology || 'BLANK'}" ไม่ถูกต้องหรือยังไม่ได้ระบุ (UNKNOWN TOPOLOGY FAIL-CLOSED)\nRouting topology "${topology || 'BLANK'}" is invalid or unmapped.`
      });
      return this._formatResult(fieldErrors);
    }

    // 2. G2 Topology Guard: Any G2 topology is NOT supported by current 16-state Process Management
    if (topology.includes('G2')) {
      fieldErrors.push({
        field: 'Routing_Topology',
        messageTH: `เส้นทางการอนุมัติรูปแบบ ${topology} ยังไม่รองรับในระบบปัจจุบัน (G2 UNSUPPORTED CONFIGURATION ERROR)`,
        messageEN: `Routing topology ${topology} is not supported by current Process Management workflow.`,
        message: `เส้นทางการอนุมัติรูปแบบ ${topology} ยังไม่รองรับในระบบปัจจุบัน (G2 UNSUPPORTED CONFIGURATION ERROR)\nRouting topology ${topology} is not supported by current Process Management workflow.`
      });
      return this._formatResult(fieldErrors);
    }

    // 3. First-Manager source states guard (02, 07, 12 require M2 topology)
    const firstMgrStates = [
      '02 First Manager Objective Review',
      '07 First Manager Mid-Year Review',
      '12 First Manager Final Evaluation'
    ];
    if (firstMgrStates.includes(status) && !topology.includes('M2')) {
      fieldErrors.push({
        field: 'Status',
        messageTH: `สถานะ ${status} ใช้ได้เฉพาะเส้นทางที่มี First Manager (M2 Topology) เท่านั้น`,
        messageEN: `Status ${status} is valid only for topologies containing First Manager (M2).`,
        message: `สถานะ ${status} ใช้ได้เฉพาะเส้นทางที่มี First Manager (M2 Topology) เท่านั้น\nStatus ${status} is valid only for topologies containing First Manager (M2).`
      });
      return this._formatResult(fieldErrors);
    }

    const firstManagerSubmits = [
      'Submit Objective to First Manager',
      'Submit Mid-Year to First Manager',
      'Submit Final to First Manager'
    ];

    const directManagerSubmits = [
      'Submit Objective to Manager',
      'Submit Mid-Year to Manager',
      'Submit Final to Manager'
    ];

    const hasFirstManager = Array.isArray(record.First_Manager_User?.value) && record.First_Manager_User.value.length > 0;
    const hasManager = Array.isArray(record.Manager_User?.value) && record.Manager_User.value.length > 0;
    const hasGM = Array.isArray(record.GM_User?.value) && record.GM_User.value.length > 0;
    const hasRequester = Array.isArray(record.Requester_User?.value) && record.Requester_User.value.length > 0;

    // 4. First-Manager Submit Actions Guard
    if (firstManagerSubmits.includes(actionName)) {
      if (!topology.includes('M2')) {
        fieldErrors.push({
          field: 'Routing_Topology',
          messageTH: `การส่งรายการผ่าน First Manager (${actionName}) ไม่สามารถใช้ได้กับเส้นทาง ${topology || 'Direct Manager'}`,
          messageEN: `Action "${actionName}" is not allowed for topology ${topology || 'Direct Manager'}.`,
          message: `การส่งรายการผ่าน First Manager (${actionName}) ไม่สามารถใช้ได้กับเส้นทาง ${topology || 'Direct Manager'}\nAction "${actionName}" is not allowed for topology ${topology || 'Direct Manager'}.`
        });
      } else if (!hasFirstManager) {
        fieldErrors.push({
          field: 'First_Manager_User',
          messageTH: `ไม่พบข้อมูลผู้อนุมัติ First_Manager_User สำหรับการส่งรายการ (${actionName})`,
          messageEN: `First_Manager_User is empty for action "${actionName}".`,
          message: `ไม่พบข้อมูลผู้อนุมัติ First_Manager_User สำหรับการส่งรายการ (${actionName})\nFirst_Manager_User is empty for action "${actionName}".`
        });
      }
    }

    // 5. Direct-Manager Submit Actions Guard
    if (directManagerSubmits.includes(actionName)) {
      if (topology.includes('M2')) {
        fieldErrors.push({
          field: 'Routing_Topology',
          messageTH: `เส้นทาง ${topology} ต้องส่งรายการผ่าน First Manager เท่านั้น`,
          messageEN: `Action "${actionName}" is not allowed for topology ${topology}. First Manager submit must be used.`,
          message: `เส้นทาง ${topology} ต้องส่งรายการผ่าน First Manager เท่านั้น\nAction "${actionName}" is not allowed for topology ${topology}. First Manager submit must be used.`
        });
      } else if (!hasManager) {
        fieldErrors.push({
          field: 'Manager_User',
          messageTH: `ไม่พบข้อมูลผู้อนุมัติ Manager_User สำหรับการส่งรายการ (${actionName})`,
          messageEN: `Manager_User is empty for action "${actionName}".`,
          message: `ไม่พบข้อมูลผู้อนุมัติ Manager_User สำหรับการส่งรายการ (${actionName})\nManager_User is empty for action "${actionName}".`
        });
      }
    }

    // 6. Manager Hand-over Actions Guard
    const managerHandoverActions = [
      'Approve Objective', // from 02 to 03
      'Approve Mid-Year First Manager', // from 07 to 08
      'Approve Final First Manager' // from 12 to 13
    ];
    if (managerHandoverActions.includes(actionName) && (status.startsWith('02') || status.startsWith('07') || status.startsWith('12'))) {
      if (!hasManager) {
        fieldErrors.push({
          field: 'Manager_User',
          messageTH: `ไม่พบข้อมูลผู้อนุมัติ Manager_User สำหรับการส่งเรื่องในขั้นตอนต่อไป`,
          messageEN: `Manager_User is empty for action "${actionName}".`,
          message: `ไม่พบข้อมูลผู้อนุมัติ Manager_User สำหรับการส่งเรื่องในขั้นตอนต่อไป\nManager_User is empty for action "${actionName}".`
        });
      }
    }

    // 7. GM Hand-over Actions Guard
    const gmHandoverActions = [
      'Approve Objective', // from 03 to 04
      'Approve Mid-Year Manager', // from 08 to 09
      'Approve Final Manager' // from 13 to 14
    ];
    if (gmHandoverActions.includes(actionName) && (status.startsWith('03') || status.startsWith('08') || status.startsWith('13'))) {
      if (topology !== 'M1_ONLY' && !hasGM) {
        fieldErrors.push({
          field: 'GM_User',
          messageTH: `ไม่พบข้อมูลผู้อนุมัติ GM_User สำหรับการส่งเรื่องในขั้นตอนต่อไป`,
          messageEN: `GM_User is empty for action "${actionName}".`,
          message: `ไม่พบข้อมูลผู้อนุมัติ GM_User สำหรับการส่งเรื่องในขั้นตอนต่อไป\nGM_User is empty for action "${actionName}".`
        });
      }
    }

    // 8. Complete Requester_User Hand-over Guard (Return & Self/Requester Hand-off Actions)
    const returnActions = [
      'Return Objective',
      'Return Mid-Year First Manager',
      'Return Mid-Year Manager',
      'Return Mid-Year GM',
      'Return Final First Manager',
      'Return Final Manager',
      'Return Final GM',
      'Return Final HR'
    ];

    const isRequesterHandoffAction =
      (status.startsWith('04') && actionName === 'Approve Objective') ||
      (status.startsWith('05') && actionName === 'Start Mid-Year') ||
      (status.startsWith('09') && actionName === 'Approve Mid-Year GM') ||
      (status.startsWith('10') && actionName === 'Start Self Evaluation') ||
      returnActions.includes(actionName);

    if (isRequesterHandoffAction && !hasRequester) {
      fieldErrors.push({
        field: 'Requester_User',
        messageTH: `ไม่พบข้อมูลผู้ขอประเมิน Requester_User สำหรับการดำเนินงาน (${actionName})`,
        messageEN: `Requester_User is empty for action "${actionName}".`,
        message: `ไม่พบข้อมูลผู้ขอประเมิน Requester_User สำหรับการดำเนินงาน (${actionName})\nRequester_User is empty for action "${actionName}".`
      });
    }

    return this._formatResult(fieldErrors);
  }

  static _val(field) {
    if (field === null || field === undefined) return '';
    if (typeof field === 'object' && 'value' in field) {
      return field.value !== null && field.value !== undefined ? String(field.value).trim() : '';
    }
    return String(field).trim();
  }
}


  /**
 * Employee Service - Read-only lookup from App 53 (Employee Namelist)
 */



const SNAPSHOT_FIELDS = [
  'Employee_Code', 'Employee_Name', 'Employee_Name_TH', 'Employee_Department',
  'Employee_Section', 'Team', 'Employee_Position', 'Employee_Email', 'Employee_Start_Date'
];
const verifiedSnapshotFingerprints = new WeakMap();

function getSnapshotFingerprint(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return null;
  return JSON.stringify(SNAPSHOT_FIELDS.map(field => snapshot[field] ?? null));
}

/**
 * Returns true only for an unmodified snapshot object created by a successful
 * EmployeeService.lookupEmployee call. This is provenance evidence, not an
 * authentication or authorization boundary.
 */
function isVerifiedEmployeeSnapshot(snapshot) {
  const registeredFingerprint = verifiedSnapshotFingerprints.get(snapshot);
  return typeof registeredFingerprint === 'string' &&
    registeredFingerprint === getSnapshotFingerprint(snapshot);
}

class EmployeeLookupError extends Error {
  constructor(code, userMessageTH, userMessageEN, cause = null) {
    super(userMessageTH);
    this.name = 'EmployeeLookupError';
    this.code = code;
    this.userMessageTH = userMessageTH;
    this.userMessageEN = userMessageEN;
    this.cause = cause;
  }
}

class EmployeeService {
  /**
   * Lookup employee by Employee Code in App 53 (Read-Only)
   * Canonical Business Employee Code is sourced strictly from App53.emp_text.
   * @param {string} empCode - Input employee code string
   * @param {Object} kintoneApi - Kintone API client instance
   * @returns {Promise<{ status: string, employee: Object }>}
   */
  static async lookupEmployee(empCode, kintoneApi) {
    // 1. Strict Input Validation before API call
    if (empCode === null || empCode === undefined) {
      throw new EmployeeLookupError(
        'EMPLOYEE_CODE_INVALID',
        'กรุณาระบุรหัสพนักงาน\nPlease enter Employee Code',
        'Please enter Employee Code'
      );
    }

    if (typeof empCode !== 'string') {
      throw new EmployeeLookupError(
        'EMPLOYEE_CODE_INVALID',
        `รหัสพนักงานต้องเป็นข้อความ (String) เท่านั้น\nEmployee Code must be a string (received ${typeof empCode})`,
        `Employee Code must be a string (received ${typeof empCode})`
      );
    }

    const cleanCode = empCode.trim();
    if (cleanCode.length === 0 || !isValidEmployeeCode(cleanCode)) {
      throw new EmployeeLookupError(
        'EMPLOYEE_CODE_INVALID',
        `รูปแบบรหัสพนักงานไม่ถูกต้อง (${empCode})\nInvalid Employee Code format (${empCode})`,
        `Invalid Employee Code format (${empCode})`
      );
    }

    // 2. Query Construction (Injection-safe dual representation for query only)
    const isDigitOnly = /^\d+$/.test(cleanCode);
    let query;
    if (isDigitOnly) {
      const numericRep = parseInt(cleanCode, 10);
      query = `(emp_text = "${cleanCode}" or Number = ${numericRep}) limit 2`;
    } else {
      query = `emp_text = "${cleanCode}" limit 2`;
    }

    // 3. Query Execution with safe error wrapping
    let resp;
    try {
      resp = await kintoneApi.getRecords(53, query);
    } catch (err) {
      throw new EmployeeLookupError(
        'SOURCE_ACCESS_ERROR',
        'ไม่สามารถตรวจสอบข้อมูลพนักงานได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง หรือติดต่อ HR / Administrator\nUnable to verify employee information at this time. Please try again or contact HR / Administrator.',
        'Unable to verify employee information at this time. Please try again or contact HR / Administrator.',
        err
      );
    }

    // 4. Source Response Structure Validation (DEF-009)
    if (!resp || typeof resp !== 'object' || !Array.isArray(resp.records)) {
      throw new EmployeeLookupError(
        'SOURCE_RESPONSE_INVALID',
        'โครงสร้างข้อมูลตอบกลับจากระบบ Employee Master ไม่ถูกต้อง กรุณาติดต่อ HR / Administrator\nInvalid response structure received from Employee Master. Please contact HR / Administrator.',
        'Invalid response structure received from Employee Master. Please contact HR / Administrator.'
      );
    }

    const records = resp.records;

    // 5. Exactly-One Match Rule
    if (records.length === 0) {
      throw new EmployeeLookupError(
        'EMPLOYEE_NOT_FOUND',
        `ไม่พบข้อมูลพนักงานสำหรับรหัส ${cleanCode} ในระบบ Employee Master\nEmployee code ${cleanCode} was not found in Employee Master (App 53)`,
        `Employee code ${cleanCode} was not found in Employee Master (App 53)`
      );
    }

    if (records.length > 1) {
      throw new EmployeeLookupError(
        'EMPLOYEE_SOURCE_AMBIGUOUS',
        `พบรหัสพนักงาน ${cleanCode} ซ้ำซ้อนในระบบ Employee Master กรุณาติดต่อ HR / Administrator\nDuplicate employee records found for code ${cleanCode}. Please contact HR / Administrator.`,
        `Duplicate employee records found for code ${cleanCode}. Please contact HR / Administrator.`
      );
    }

    const emp = records[0];

    // 6. Source Complete Validation: Canonical code must exist in emp_text
    const rawEmpText = emp.emp_text?.value;
    if (!rawEmpText || typeof rawEmpText !== 'string' || !isValidEmployeeCode(rawEmpText.trim())) {
      throw new EmployeeLookupError(
        'EMPLOYEE_SOURCE_INCOMPLETE',
        `ข้อมูลพนักงานสำหรับรหัส ${cleanCode} ในระบบ Employee Master ไม่สมบูรณ์ (ขาดรหัส Canonical emp_text) กรุณาติดต่อ HR\nEmployee Master record for code ${cleanCode} is incomplete (missing or invalid emp_text). Please contact HR.`,
        `Employee Master record for code ${cleanCode} is incomplete (missing or invalid emp_text). Please contact HR.`
      );
    }

    const canonicalCode = rawEmpText.trim();

    // 7. Identity Consistency Validation (DEF-008)
    let isConsistent = false;
    if (canonicalCode === cleanCode) {
      isConsistent = true;
    } else if (isDigitOnly && /^\d+$/.test(canonicalCode)) {
      isConsistent = parseInt(canonicalCode, 10) === parseInt(cleanCode, 10);
    }

    if (!isConsistent) {
      throw new EmployeeLookupError(
        'EMPLOYEE_SOURCE_MISMATCH',
        `ข้อมูลรหัสพนักงานในระบบ Employee Master ไม่ตรงกับรหัสที่ร้องขอ (${cleanCode}) กรุณาติดต่อ HR\nEmployee Master canonical identity does not match requested code (${cleanCode}). Please contact HR.`,
        `Employee Master canonical identity does not match requested code (${cleanCode}). Please contact HR.`
      );
    }

    // 8. Return and register the 9 header snapshot fields (Hoshin excluded).
    const employee = {
      Employee_Code: canonicalCode,
      Employee_Name: emp.Text?.value || '',
      Employee_Name_TH: emp.Text_0?.value || '',
      Employee_Department: emp.Drop_down_0?.value || '',
      Employee_Section: emp.Drop_down?.value || '',
      Team: emp.Drop_down_2?.value || emp.Team?.value || '',
      Employee_Position: emp.Text_2?.value || '',
      Employee_Email: emp.Text_4?.value || '',
      Employee_Start_Date: emp.Date?.value || ''
    };
    verifiedSnapshotFingerprints.set(employee, getSnapshotFingerprint(employee));
    return { status: 'EMPLOYEE_FOUND', employee };
  }

  /**
   * Check for duplicate MBO in App 794 for Fiscal Year + Employee Code
   */
  static async checkDuplicateMBO(mboAppId, fiscalYear, empCode, currentRecordId, kintoneApi) {
    const cleanCode = String(empCode || '').trim();
    const cleanFY = String(fiscalYear || '').trim();
    if (!cleanCode || !cleanFY) return;

    let query = `Fiscal_Year = "${cleanFY}" and Employee_Code = "${cleanCode}"`;
    if (currentRecordId) {
      query += ` and $id != "${currentRecordId}"`;
    }

    let resp;
    try {
      resp = await kintoneApi.getRecords(mboAppId, query);
    } catch (err) {
      throw new Error(`ไม่สามารถตรวจสอบข้อมูลรายการซ้ำได้ กรุณาลองใหม่อีกครั้ง หรือติดต่อ HR / Administrator\nUnable to verify record uniqueness. Please try again or contact HR / Administrator.`);
    }

    if (!resp || typeof resp !== 'object' || !Array.isArray(resp.records)) {
      throw new Error(`ไม่สามารถตรวจสอบข้อมูลรายการซ้ำได้ กรุณาลองใหม่อีกครั้ง หรือติดต่อ HR / Administrator\nUnable to verify record uniqueness. Please try again or contact HR / Administrator.`);
    }

    if (resp.records.length > 0) {
      throw new Error(`พนักงานรหัส ${cleanCode} มี MBO สำหรับ ${cleanFY} อยู่แล้ว ไม่สามารถสร้างรายการซ้ำได้\nEmployee ID ${cleanCode} already has an MBO record for ${cleanFY}. Duplicate creation is blocked.`);
    }
  }
}


  /**
 * Routing Service - App 795 Routing Master Validator & Topology Resolver
 * Pure New Model (Manager L1/L2, GM L1/L2, Executive Direct M1_ONLY)
 * Enhanced for M10M-R2 Executive Direct Routing (DGM / GM / VP -> President)
 */

class RoutingService {
  /**
   * Normalize position string to canonical routing position class
   * @param {string} positionCode
   * @returns {string} Normalized Position Class
   */
  static normalizePosition(positionCode) {
    const clean = String(positionCode || '').trim();
    if (/^(Deputy\s*General\s*Manager|DGM)$/i.test(clean)) {
      return 'DEPUTY_GENERAL_MANAGER';
    }
    if (/^(General\s*Manager|GM)$/i.test(clean)) {
      return 'GENERAL_MANAGER';
    }
    if (/^(Vice\s*President|VP)$/i.test(clean)) {
      return 'VICE_PRESIDENT';
    }
    return clean;
  }

  /**
   * Validate current user access and resolve sequential routing topology from App 795
   * Supports Position Priority (DGM/GM/VP -> President) and Team-aware routing keys (Section_Code|Team)
   * @param {number} routingAppId
   * @param {string} sectionCode
   * @param {string} teamCode
   * @param {string} loginUserCode
   * @param {Object} kintoneApi
   * @param {string} positionCode
   * @returns {Object} Full Sequential Routing Profile
   */
  static async validateRequesterAccess(routingAppId, sectionCode, teamCode, loginUserCode, kintoneApi, positionCode = '') {
    const cleanPosition = String(positionCode || '').trim();
    const normalizedPos = RoutingService.normalizePosition(cleanPosition);
    const cleanSection = String(sectionCode || '').trim();
    const cleanTeam = String(teamCode || '').trim();
    const cleanUser = String(loginUserCode || '').trim();

    // 1. Executive Direct Position Priority Rule: DGM / GM / VP -> President Route in App795 (M1_ONLY)
    const isExecutiveDirect = ['DEPUTY_GENERAL_MANAGER', 'GENERAL_MANAGER', 'VICE_PRESIDENT'].includes(normalizedPos);

    if (isExecutiveDirect) {
      let routingKey = 'POSITION_GM';
      if (normalizedPos === 'DEPUTY_GENERAL_MANAGER') routingKey = 'POSITION_DGM';
      if (normalizedPos === 'VICE_PRESIDENT') routingKey = 'POSITION_VP';

      const execQuery = `Routing_Key = "${routingKey}" and Active in ("Active") limit 2`;
      const resp = await kintoneApi.getRecords(routingAppId, execQuery);
      const execRecords = resp?.records || [];

      if (execRecords.length === 0) {
        throw new Error(`ไม่พบข้อมูลการตั้งค่า Routing สำหรับตำแหน่ง ${normalizedPos} (${routingKey}) ใน Routing Master (App 795) (APPROVER_NOT_FOUND)\nRouting configuration for executive position ${normalizedPos} (${routingKey}) was not found in Routing Master.`);
      }

      if (execRecords.length > 1) {
        throw new Error(`พบข้อมูล Routing ซ้ำซ้อนสำหรับ Routing Key ${routingKey} ใน Routing Master (App 795) (AMBIGUOUS_ROUTE)\nDuplicate active routing records found for key ${routingKey} in Routing Master.`);
      }

      const route = execRecords[0];
      const presidentApprover = route.Manager_Level1_Approvers?.value || route.GM_Level1_Approvers?.value || [];

      if (!presidentApprover || presidentApprover.length === 0) {
        throw new Error(`ไม่พบข้อมูลผู้อนุมัติสำหรับตำแหน่ง ${normalizedPos} ใน Routing Master (App 795) (APPROVER_NOT_FOUND)\nNo valid approver target configured for executive position ${normalizedPos} in Routing Master.`);
      }

      // Check requester authorization against App795 Requester_User list
      const requesters = route.Requester_User?.value || [];
      const isAuthorized = requesters.some(u => u.code === cleanUser) || cleanUser === 'Administrator' || cleanUser === 'admin-form';

      if (!isAuthorized) {
        throw new Error(`บัญชีนี้ (${cleanUser}) ไม่มีสิทธิ์สร้าง MBO สำหรับตำแหน่ง ${cleanPosition}\nThis account (${cleanUser}) is not authorized to create an MBO for executive position ${cleanPosition}.`);
      }

      return {
        Routing_Key: route.Routing_Key?.value || routingKey,
        Requester_User: requesters,
        Manager_Level1_Approvers: presidentApprover,
        Manager_Level1_Approval_Rule: route.Manager_Level1_Approval_Rule?.value || 'ALL',
        Manager_Level2_Approvers: [],
        Manager_Level2_Approval_Rule: 'ALL',
        GM_Level1_Approvers: [],
        GM_Level1_Approval_Rule: 'ALL',
        GM_Level2_Approvers: [],
        GM_Level2_Approval_Rule: 'ALL',
        Has_Manager_Level2: 'No',
        Has_GM_Level2: 'No',
        Routing_Topology: 'M1_ONLY',
        Manager_User: presidentApprover,
        First_Manager_User: [],
        GM_User: [],
        Matched_Rule: routingKey,
        Position: cleanPosition,
        Section: cleanSection,
        Team: cleanTeam
      };
    }

    // 2. Section & Team Validation for Non-Executive
    if (!cleanSection) {
      throw new Error('ไม่พบข้อมูล Section ของพนักงาน กรุณาตรวจสอบ Employee Master (App 53)\nEmployee section is missing in Employee Master.');
    }

    const isTmgSection = cleanSection === 'TMG1' || cleanSection === 'TMG2' || /^TMG/i.test(cleanSection);

    if (isTmgSection && !cleanTeam) {
      throw new Error(`ไม่พบข้อมูล Team ของพนักงานใน Section ${cleanSection} กรุณาตรวจสอบ Employee Master (App 53) (TEAM_REQUIRED)\nTeam is required for employee in section ${cleanSection}.`);
    }

    const primaryRoutingKey = cleanTeam ? `${cleanSection}|${cleanTeam}` : cleanSection;

    // 3. App795 Query by Routing_Key
    const query = `Routing_Key = "${primaryRoutingKey}" and Active in ("Active") limit 2`;
    const resp = await kintoneApi.getRecords(routingAppId, query);
    const records = resp?.records || [];

    // Fail-Closed: Routing Not Found
    if (records.length === 0) {
      const targetLabel = cleanTeam ? `${cleanSection} / Team ${cleanTeam}` : cleanSection;
      throw new Error(`ไม่พบการตั้งค่า Routing สำหรับ Section ${targetLabel} ใน Routing Master (App 795) กรุณาติดต่อ HR / Administrator (ROUTE_NOT_FOUND)\nRouting configuration for section ${targetLabel} was not found in Routing Master.`);
    }

    // Fail-Closed: Duplicate Active Routing Key
    if (records.length > 1) {
      throw new Error(`พบข้อมูล Routing ซ้ำซ้อนสำหรับ Routing Key ${primaryRoutingKey} ใน Routing Master (App 795) กรุณาติดต่อ HR / Administrator (AMBIGUOUS_ROUTE)\nDuplicate active routing records found for key ${primaryRoutingKey} in Routing Master.`);
    }

    const route = records[0];
    const requesters = route.Requester_User?.value || [];
    // Strict Requester Authorization (BLOCKER B Fix: NO blank Requester_User allow-all fallback)
    const isAuthorized = requesters.some(u => u.code === cleanUser) || cleanUser === 'Administrator' || cleanUser === 'admin-form';

    if (!isAuthorized) {
      throw new Error(`บัญชีนี้ (${cleanUser}) ไม่มีสิทธิ์สร้าง MBO สำหรับพนักงานใน Section ${cleanSection}\nThis account (${cleanUser}) is not authorized to create an MBO for section ${cleanSection}.`);
    }

    // Pure New Model as Source of Truth
    const mgrL1 = route.Manager_Level1_Approvers?.value || [];
    const mgrL1Rule = route.Manager_Level1_Approval_Rule?.value || 'ALL';

    const mgrL2 = route.Manager_Level2_Approvers?.value || [];
    const mgrL2Rule = route.Manager_Level2_Approval_Rule?.value || 'ALL';

    const gmL1 = route.GM_Level1_Approvers?.value || [];
    const gmL1Rule = route.GM_Level1_Approval_Rule?.value || 'ALL';

    const gmL2 = route.GM_Level2_Approvers?.value || [];
    const gmL2Rule = route.GM_Level2_Approval_Rule?.value || 'ALL';

    const hasMgrL2 = mgrL2.length > 0;
    const hasGmL2 = gmL2.length > 0;

    let topology = 'M1_G1';
    if (hasMgrL2 && hasGmL2) {
      topology = 'M1_M2_G1_G2';
    } else if (hasMgrL2) {
      topology = 'M1_M2_G1';
    } else if (hasGmL2) {
      topology = 'M1_G1_G2';
    }

    return {
      Routing_Key: route.Routing_Key?.value || primaryRoutingKey,
      Requester_User: requesters,
      Manager_Level1_Approvers: mgrL1,
      Manager_Level1_Approval_Rule: mgrL1Rule,
      Manager_Level2_Approvers: mgrL2,
      Manager_Level2_Approval_Rule: mgrL2Rule,
      GM_Level1_Approvers: gmL1,
      GM_Level1_Approval_Rule: gmL1Rule,
      GM_Level2_Approvers: gmL2,
      GM_Level2_Approval_Rule: gmL2Rule,
      Has_Manager_Level2: hasMgrL2 ? 'Yes' : 'No',
      Has_GM_Level2: hasGmL2 ? 'Yes' : 'No',
      Routing_Topology: topology,
      Manager_User: mgrL1,
      First_Manager_User: mgrL2,
      GM_User: gmL1,
      Matched_Rule: route.Routing_Key?.value || primaryRoutingKey,
      Position: cleanPosition,
      Section: cleanSection,
      Team: cleanTeam
    };
  }
}


  /**
 * Employee Part A & Part B UI Renderer - Evaluation UI V2 (R5 Route-Aware Five-Stage UX)
 * Source of Truth: exp/PMS_Staff & Chief_PART_A.xlsx & Bilingual Specification
 */




const CANONICAL_TOPOLOGIES = ['M1_G1', 'M1_M2_G1', 'M1_G1_G2', 'M1_M2_G1_G2', 'M1_ONLY'];

const WORKFLOW_PATH_M1_ONLY = [
  '01 Draft Objective',
  '03 Manager Objective Review',
  '05 Objective Approved',
  '06 Employee Mid-Year',
  '08 Manager Mid-Year Review',
  '10 Mid-Year Completed',
  '11 Employee Self Evaluation',
  '13 Manager Final Evaluation',
  '15 HR Final Check',
  '16 Completed'
];

const WORKFLOW_PATH_M1_G1 = [
  '01 Draft Objective',
  '03 Manager Objective Review',
  '04 GM Objective Review',
  '05 Objective Approved',
  '06 Employee Mid-Year',
  '08 Manager Mid-Year Review',
  '09 GM Mid-Year Review',
  '10 Mid-Year Completed',
  '11 Employee Self Evaluation',
  '13 Manager Final Evaluation',
  '14 GM Final Evaluation',
  '15 HR Final Check',
  '16 Completed'
];

const WORKFLOW_PATH_M1_M2_G1 = [
  '01 Draft Objective',
  '02 First Manager Objective Review',
  '03 Manager Objective Review',
  '04 GM Objective Review',
  '05 Objective Approved',
  '06 Employee Mid-Year',
  '07 First Manager Mid-Year Review',
  '08 Manager Mid-Year Review',
  '09 GM Mid-Year Review',
  '10 Mid-Year Completed',
  '11 Employee Self Evaluation',
  '12 First Manager Final Evaluation',
  '13 Manager Final Evaluation',
  '14 GM Final Evaluation',
  '15 HR Final Check',
  '16 Completed'
];

const DEFAULT_PHASE_CALENDAR = {
  objectives: { start: '2026-01-01', end: '2026-03-31', label: 'Jan 1 - Mar 31, 2026' },
  midyear: { start: '2026-06-01', end: '2026-07-31', label: 'Jun 1 - Jul 31, 2026' },
  selfEvaluation: { start: '2026-10-01', end: '2026-10-31', label: 'Oct 1 - Oct 31, 2026' },
  appraiserEvaluation: { start: '2026-11-01', end: '2026-11-30', label: 'Nov 1 - Nov 30, 2026' },
  hrFinal: { start: '2026-12-01', end: '2026-12-31', label: 'Dec 1 - Dec 31, 2026' }
};

const ROUTE_SCENARIOS = {
  CURRENT_STANDARD: {
    id: 'CURRENT_STANDARD',
    labelTH: 'เส้นทางมาตรฐานปัจจุบัน — ผู้ประเมิน 2 คน',
    labelEN: 'Current Standard — 2 Appraisers',
    topology: 'M1_G1',
    appraiserCount: 2,
    isRuntimeSupported: true
  },
  EXTENDED: {
    id: 'EXTENDED',
    labelTH: 'เส้นทางขยาย — ผู้ประเมิน 3 คน',
    labelEN: 'Extended Route — 3 Appraisers',
    topology: 'M1_M2_G1',
    appraiserCount: 3,
    isRuntimeSupported: true
  },
  EXECUTIVE_DIRECT: {
    id: 'EXECUTIVE_DIRECT',
    labelTH: 'เส้นทางผู้บริหารโดยตรง — ผู้ประเมิน 1 คน',
    labelEN: 'Executive Direct — 1 Appraiser',
    topology: 'M1_ONLY',
    appraiserCount: 1,
    isRuntimeSupported: true
  },
  FUTURE_CAPACITY: {
    id: 'FUTURE_CAPACITY',
    labelTH: 'เส้นทางรองรับอนาคต — ผู้ประเมิน 4 คน',
    labelEN: 'Future Capacity — 4 Appraisers',
    topology: 'M1_M2_G1',
    appraiserCount: 4,
    isRuntimeSupported: false,
    badgeText: 'Preview Only'
  }
};

function parseObjectiveCount(rawVal, fallback = null) {
  if (rawVal === null || rawVal === undefined || rawVal === '') return fallback;
  const str = String(rawVal).trim();
  if (!/^\d+$/.test(str)) return fallback;
  const countVal = parseInt(str, 10);
  if (countVal < 1 || countVal > 10) return fallback;
  return countVal;
}

const EVALUATION_PROFILES = {
  PROF_STAFF_CHIEF: {
    id: 'PROF_STAFF_CHIEF',
    nameTH: 'Staff / Chief (70/30)',
    nameEN: 'Staff / Chief (70/30)',
    partAWeight: 70,
    partBWeight: 30,
    compSetCode: 'COMP_SET_OPERATIONAL_V1'
  },
  PROF_JAPANESE_STAFF: {
    id: 'PROF_JAPANESE_STAFF',
    nameTH: 'Japanese Staff (70/30)',
    nameEN: 'Japanese Staff (70/30)',
    partAWeight: 70,
    partBWeight: 30,
    compSetCode: 'COMP_SET_OPERATIONAL_V1'
  },
  PROF_ASST_MGR: {
    id: 'PROF_ASST_MGR',
    nameTH: 'Assistant Manager (60/40)',
    nameEN: 'Assistant Manager (60/40)',
    partAWeight: 60,
    partBWeight: 40,
    compSetCode: 'COMP_SET_MANAGEMENT_V1'
  },
  PROF_SECTION_MGR: {
    id: 'PROF_SECTION_MGR',
    nameTH: 'Section Manager (50/50)',
    nameEN: 'Section Manager (50/50)',
    partAWeight: 50,
    partBWeight: 50,
    compSetCode: 'COMP_SET_MANAGEMENT_V1'
  },
  PROF_SENIOR_MGR: {
    id: 'PROF_SENIOR_MGR',
    nameTH: 'Senior Manager (50/50)',
    nameEN: 'Senior Manager (50/50)',
    partAWeight: 50,
    partBWeight: 50,
    compSetCode: 'COMP_SET_MANAGEMENT_V1'
  },
  PROF_DGM: {
    id: 'PROF_DGM',
    nameTH: 'DGM (50/50)',
    nameEN: 'DGM (50/50)',
    partAWeight: 50,
    partBWeight: 50,
    compSetCode: 'COMP_SET_MANAGEMENT_V1'
  },
  PROF_GM: {
    id: 'PROF_GM',
    nameTH: 'GM (50/50)',
    nameEN: 'GM (50/50)',
    partAWeight: 50,
    partBWeight: 50,
    compSetCode: 'COMP_SET_MANAGEMENT_V1'
  },
  PROF_VP: {
    id: 'PROF_VP',
    nameTH: 'VP (50/50)',
    nameEN: 'VP (50/50)',
    partAWeight: 50,
    partBWeight: 50,
    compSetCode: 'COMP_SET_MANAGEMENT_V1'
  }
};

function normalizeProfileCode(rawCode) {
  if (!rawCode || typeof rawCode !== 'string') return null;
  const clean = rawCode.trim();
  if (!clean) return null;

  const legacyAliasMap = {
    PROF_STAFF_OPERATIONAL: 'PROF_STAFF_CHIEF',
    PROF_STAFF_JAPANESE: 'PROF_JAPANESE_STAFF',
    PROF_SECT_MGR: 'PROF_SECTION_MGR',
    PROF_SR_MGR: 'PROF_SENIOR_MGR'
  };

  const canonical = legacyAliasMap[clean] || clean;
  return EVALUATION_PROFILES[canonical] ? canonical : null;
}

function getEvaluationProfile(rawCode) {
  const canonicalCode = normalizeProfileCode(rawCode);
  return canonicalCode ? EVALUATION_PROFILES[canonicalCode] : null;
}

function calculateDeadlineInfo(startDateIso, endDateIso, nowIso = '2026-06-15', isCompleted = false) {
  if (isCompleted) {
    return {
      status: 'Completed',
      labelTH: 'เสร็จแล้ว',
      labelEN: 'Completed',
      daysTextTH: 'ดำเนินการเสร็จสมบูรณ์เรียบร้อยแล้ว',
      daysTextEN: 'Phase process completed',
      calloutTextTH: 'เสร็จสมบูรณ์',
      calloutTextEN: 'COMPLETED',
      badgeClass: 'mbo-deadline-completed',
      isCompleted: true
    };
  }

  const parseLocalDate = (isoStr) => {
    const s = String(isoStr || '').trim();
    return new Date(s.includes('T') ? s : `${s}T00:00:00`);
  };

  const now = parseLocalDate(nowIso);
  const start = parseLocalDate(startDateIso);
  const end = parseLocalDate(endDateIso);

  now.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const msPerDay = 86400000;

  if (now < start) {
    const diffDays = Math.round((start - now) / msPerDay);
    return {
      status: 'Upcoming',
      labelTH: 'ยังไม่เปิด',
      labelEN: 'Upcoming',
      daysTextTH: `เริ่มใน ${diffDays} วัน (${startDateIso})`,
      daysTextEN: `Opens in ${diffDays} days (${startDateIso})`,
      calloutTextTH: `เริ่มใน ${diffDays} วัน`,
      calloutTextEN: `Opens in ${diffDays} days`,
      badgeClass: 'mbo-deadline-upcoming',
      isUpcoming: true,
      diffDays
    };
  }

  if (now > end) {
    const overdueDays = Math.round((now - end) / msPerDay);
    return {
      status: 'Overdue',
      labelTH: 'เกินกำหนด',
      labelEN: 'Overdue',
      daysTextTH: `เกินกำหนด ${overdueDays} วัน (ครบกำหนด ${endDateIso})`,
      daysTextEN: `${overdueDays} days overdue (Due ${endDateIso})`,
      calloutTextTH: `เกินกำหนด ${overdueDays} วัน`,
      calloutTextEN: `${overdueDays} DAYS OVERDUE`,
      badgeClass: 'mbo-deadline-overdue',
      isOverdue: true,
      overdueDays
    };
  }

  const remDays = Math.round((end - now) / msPerDay);
  if (remDays === 0) {
    return {
      status: 'Due Today',
      labelTH: 'ครบกำหนดวันนี้',
      labelEN: 'Due Today',
      daysTextTH: `ครบกำหนดวันนี้ (${endDateIso})`,
      daysTextEN: `Due today (${endDateIso})`,
      calloutTextTH: `ครบกำหนดวันนี้`,
      calloutTextEN: `DUE TODAY`,
      badgeClass: 'mbo-deadline-due-today',
      isDueToday: true,
      remDays: 0
    };
  }

  const isDueSoon = remDays >= 1 && remDays <= 7;
  return {
    status: 'Open',
    labelTH: 'กำลังเปิด',
    labelEN: 'Open',
    daysTextTH: `เหลือ ${remDays} วัน (ครบกำหนด ${endDateIso})`,
    daysTextEN: `${remDays} days remaining (Due ${endDateIso})`,
    calloutTextTH: `เหลือ ${remDays} วัน`,
    calloutTextEN: `${remDays} DAYS REMAINING`,
    badgeClass: isDueSoon ? 'mbo-deadline-due-soon' : 'mbo-deadline-open',
    isOpen: true,
    isDueSoon,
    remDays
  };
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatUserDisplay(userArr) {
  if (!userArr || !Array.isArray(userArr) || userArr.length === 0) return '-';
  const u = userArr[0];
  if (typeof u === 'string') return escapeHtml(u);
  if (typeof u === 'object' && u !== null) {
    if (u.name && u.code) return `${escapeHtml(u.name)} (${escapeHtml(u.code)})`;
    if (u.name) return escapeHtml(u.name);
    if (u.code) return escapeHtml(u.code);
  }
  return '-';
}

function classifyTopologyForUI(topology) {
  if (topology === null || topology === undefined) {
    return { isCanonical: false, isSupportedV1: false, isM1G1: false, isM1M2G1: false, isM1Only: false, isG2: false, raw: '' };
  }
  const raw = String(topology).trim();
  if (!raw || !CANONICAL_TOPOLOGIES.includes(raw)) {
    return { isCanonical: false, isSupportedV1: false, isM1G1: false, isM1M2G1: false, isM1Only: false, isG2: false, raw };
  }
  if (raw === 'M1_G1_G2' || raw === 'M1_M2_G1_G2') {
    return { isCanonical: true, isSupportedV1: false, isM1G1: false, isM1M2G1: false, isM1Only: false, isG2: true, raw };
  }
  return {
    isCanonical: true,
    isSupportedV1: true,
    isM1G1: raw === 'M1_G1',
    isM1M2G1: raw === 'M1_M2_G1',
    isM1Only: raw === 'M1_ONLY',
    isG2: false,
    raw
  };
}

function getApplicableWorkflowPath(topology = 'M1_G1') {
  const topInfo = classifyTopologyForUI(topology);
  if (!topInfo.isCanonical || !topInfo.isSupportedV1) return null;
  if (topInfo.isM1Only) return WORKFLOW_PATH_M1_ONLY;
  if (topInfo.isM1G1) return WORKFLOW_PATH_M1_G1;
  if (topInfo.isM1M2G1) return WORKFLOW_PATH_M1_M2_G1;
  return null;
}

function getVisualScreen(status) {
  const currentStatus = String(status || '').trim();

  if (['01 Draft Objective', '02 First Manager Objective Review', '03 Manager Objective Review', '04 GM Objective Review', '05 Objective Approved'].includes(currentStatus)) {
    return 'objectives'; // Stage 1
  }
  if (['06 Employee Mid-Year', '07 First Manager Mid-Year Review', '08 Manager Mid-Year Review', '09 GM Mid-Year Review', '10 Mid-Year Completed'].includes(currentStatus)) {
    return 'midyear'; // Stage 2
  }
  if (currentStatus === '11 Employee Self Evaluation') {
    return 'self_eval'; // Stage 3
  }
  if (['12 First Manager Final Evaluation', '13 Manager Final Evaluation', '14 GM Final Evaluation'].includes(currentStatus)) {
    return 'appraiser_eval'; // Stage 4
  }
  if (['15 HR Final Check', '16 Completed'].includes(currentStatus)) {
    return 'hr_final'; // Stage 5
  }
  return null; // Fail closed for unknown status
}

function getProcessProgress(status, topology = 'M1_G1') {
  const currentStatus = String(status || '').trim();
  const pathList = getApplicableWorkflowPath(topology);

  if (!pathList) {
    return {
      percent: 0,
      stepIndex: 1,
      label: 'Invalid / Unsupported Topology',
      isMismatch: true,
      mismatchMessage: `Routing topology ("${escapeHtml(String(topology || ''))}") is missing, unrecognized, or unsupported in V1.`
    };
  }

  const idx = pathList.indexOf(currentStatus);
  if (idx === -1) {
    return {
      percent: 0,
      stepIndex: 1,
      label: 'Status Not Applicable to Route',
      isMismatch: true,
      mismatchMessage: `Status "${escapeHtml(currentStatus)}" is not applicable to active ${escapeHtml(String(topology))} route.`
    };
  }

  const percent = Math.round(((idx + 1) / pathList.length) * 100);
  const macroStage = getMacroStage(currentStatus);

  return {
    percent,
    stepIndex: macroStage,
    label: `${macroStage}. Stage Progress (${idx + 1}/${pathList.length}: ${currentStatus})`,
    isMismatch: false,
    mismatchMessage: ''
  };
}

function getPhaseCalendarStatus(stageKey, currentStatus, nowIso = '2026-06-15', calendar = DEFAULT_PHASE_CALENDAR) {
  const currentStage = getMacroStage(currentStatus);
  const stageMap = { objectives: 1, midyear: 2, selfEvaluation: 3, appraiserEvaluation: 4, hrFinal: 5 };
  const targetStage = stageMap[stageKey] || 1;
  const cal = calendar || DEFAULT_PHASE_CALENDAR;
  const dates = cal[stageKey] || { start: '2026-01-01', end: '2026-12-31', label: 'TBD' };

  const isCompleted = (currentStage > targetStage) || (currentStatus === '16 Completed');
  return calculateDeadlineInfo(dates.start, dates.end, nowIso, isCompleted);
}

// Normalized Verified Business Competency Definitions (R2-05 Fail-Closed Selection)
const COMPETENCIES_LIST = [
  { id: 1, nameTH: '1. Adaptability', nameEN: 'Adaptability', desc: 'ปรับตัวอย่างยืดหยุ่น ยอมรับการเปลี่ยนแปลงและเรียนรู้สิ่งใหม่ / Demonstrate flexibility and open-mindedness to organizational changes.' },
  { id: 2, nameTH: '2. Problem Solving', nameEN: 'Problem Solving & Decision Making', desc: 'การแก้ปัญหาและการตัดสินใจอย่างมีหลักการ / Analyze root causes and make effective decisions.' },
  { id: 3, nameTH: '3. Customer Focus', nameEN: 'Customer Focus & Service Excellence', desc: 'การมุ่งเน้นลูกค้าและผู้รับบริการ ส่งมอบบริการที่มีคุณภาพ / Prioritize internal/external customer needs and quality delivery.' },
  { id: 4, nameTH: '4. Additional Value Creation', nameEN: 'Value Creation & Innovation', desc: 'การสร้างมูลค่าเพิ่มและนวัตกรรมใหม่ในงาน / Proactively seek improvements and innovative solutions.' },
  { id: 5, nameTH: '5. Safety Awareness', nameEN: 'Safety & Environmental Awareness', desc: 'ความตระหนักด้านความปลอดภัยและสิ่งแวดล้อม / Adhere to safety standards and environmental responsibility.' },
  { id: 6, nameTH: '6. Compliance / COCE', nameEN: 'Compliance & Code of Conduct (COCE)', desc: 'การปฏิบัติตามกฎระเบียบและจริยธรรมธุรกิจ [Evaluated / Excluded from Score] / Evaluated for compliance but excluded from numerical score weight.', isCOCE: true },
  { id: 7, nameTH: '7. Leadership & People Management', nameEN: 'Leadership & People Management', desc: 'ภาวะผู้นำและการบริหารคน สร้างแรงจูงใจในการทำงาน / Lead, empower, and guide team members effectively.', isManagementOnly: true },
  { id: 8, nameTH: '8. Strategy & Coaching', nameEN: 'Strategy & Coaching / Advising', desc: 'การกำหนดกลยุทธ์และการเป็นพี่เลี้ยงในการพัฒนาทีมงาน / Align with strategic goals and mentor staff.', isManagementOnly: true }
];

function getApplicableCompetencies(setCode) {
  const code = String(setCode || '').trim();
  if (code === 'COMP_SET_OPERATIONAL_V1') {
    return COMPETENCIES_LIST.filter(c => !c.isManagementOnly); // 6 items
  }
  if (code === 'COMP_SET_MANAGEMENT_V1') {
    return COMPETENCIES_LIST; // 8 items
  }
  return null; // Fail closed for invalid/blank competency set code
}

function normalizeAppraiserData(record, appraiserCount = 2, previewOptions = {}) {
  const count = Math.min(Math.max(parseInt(appraiserCount || 2, 10), 1), 4);
  const slots = [];

  const getVal = (code) => {
    if (!record) return '';
    const field = record[code];
    if (field === null || field === undefined) return '';
    if (typeof field === 'object' && 'value' in field) return field.value ?? '';
    return String(field);
  };

  const activeObjCount = parseObjectiveCount(getVal('Objective_Count'));
  if (activeObjCount === null) {
    return {
      slots: [],
      totalCount: count,
      completedCount: 0,
      completionPercent: 0,
      isFullyComplete: false,
      isInvalidConfig: true,
      partA: { completed: 0, total: 0, isComplete: false },
      partB: { completed: 0, total: 0, isComplete: false }
    };
  }

  const compSetCode = getVal('Competency_Set_Code') || previewOptions.competencySetCode;
  const applicableCompList = getApplicableCompetencies(compSetCode);

  if (!applicableCompList) {
    return {
      slots: [],
      totalCount: count,
      completedCount: 0,
      completionPercent: 0,
      isFullyComplete: false,
      isInvalidConfig: true,
      partA: { completed: 0, total: 0, isComplete: false },
      partB: { completed: 0, total: 0, isComplete: false }
    };
  }

  const slotLabels = ['1st Appraiser', '2nd Appraiser', '3rd Appraiser', '4th Appraiser'];

  let totalRequiredPartARatings = count * activeObjCount;
  let completedRequiredPartARatings = 0;

  let totalRequiredPartBRatings = count * applicableCompList.length;
  let completedRequiredPartBRatings = 0;

  for (let i = 1; i <= count; i++) {
    const label = slotLabels[i - 1];
    const partARatings = {};
    const partBRatings = {};
    const partAComments = {};
    const partBComments = {};

    let slotPartARatedCount = 0;
    let slotPartBRatedCount = 0;

    if (i === 1) {
      for (let k = 1; k <= activeObjCount; k++) {
        partAComments[k] = getVal(`Manager_Comment_${k}`) || previewOptions.slot1CommentsA?.[k] || '';
        const val = getVal(`Manager_Achievement_${k}`) || previewOptions.slot1RatingsA?.[k];
        if (val) {
          partARatings[k] = String(val);
          slotPartARatedCount++;
        }
      }
      applicableCompList.forEach(comp => {
        partBComments[comp.id] = getVal(`Manager_Competency_Comment_${comp.id}`) || previewOptions.slot1CommentsB?.[comp.id] || '';
        const val = getVal(`Manager_Competency_Rating_${comp.id}`) || previewOptions.slot1RatingsB?.[comp.id];
        if (val) {
          partBRatings[comp.id] = String(val);
          slotPartBRatedCount++;
        }
      });
    } else if (i === 2) {
      for (let k = 1; k <= activeObjCount; k++) {
        partAComments[k] = getVal(`GM_Comment_${k}`) || previewOptions.slot2CommentsA?.[k] || '';
        const val = getVal(`GM_Achievement_${k}`) || previewOptions.slot2RatingsA?.[k];
        if (val) {
          partARatings[k] = String(val);
          slotPartARatedCount++;
        }
      }
      applicableCompList.forEach(comp => {
        partBComments[comp.id] = getVal(`GM_Competency_Comment_${comp.id}`) || previewOptions.slot2CommentsB?.[comp.id] || '';
        const val = getVal(`GM_Competency_Rating_${comp.id}`) || previewOptions.slot2RatingsB?.[comp.id];
        if (val) {
          partBRatings[comp.id] = String(val);
          slotPartBRatedCount++;
        }
      });
    } else {
      for (let k = 1; k <= activeObjCount; k++) {
        partAComments[k] = previewOptions[`slot${i}CommentsA`]?.[k] || '';
        const val = previewOptions[`slot${i}RatingsA`]?.[k];
        if (val) {
          partARatings[k] = String(val);
          slotPartARatedCount++;
        }
      }
      applicableCompList.forEach(comp => {
        partBComments[comp.id] = previewOptions[`slot${i}CommentsB`]?.[comp.id] || '';
        const val = previewOptions[`slot${i}RatingsB`]?.[comp.id];
        if (val) {
          partBRatings[comp.id] = String(val);
          slotPartBRatedCount++;
        }
      });
    }

    completedRequiredPartARatings += slotPartARatedCount;
    completedRequiredPartBRatings += slotPartBRatedCount;

    const isPartAComplete = (slotPartARatedCount === activeObjCount);
    const isPartBComplete = (slotPartBRatedCount === applicableCompList.length);
    const isSlotCompleted = isPartAComplete && isPartBComplete;

    slots.push({
      slotIndex: i,
      label,
      isCompleted: isSlotCompleted,
      isPartAComplete,
      isPartBComplete,
      partARatings,
      partBRatings,
      partAComments,
      partBComments
    });
  }

  const completedCount = slots.filter(s => s.isCompleted).length;
  const completionPercent = Math.round((completedCount / count) * 100);
  const isFullyComplete = (completedCount === count);

  return {
    slots,
    totalCount: count,
    completedCount,
    completionPercent,
    isFullyComplete,
    isInvalidConfig: false,
    partA: {
      completed: completedRequiredPartARatings,
      total: totalRequiredPartARatings,
      isComplete: completedRequiredPartARatings === totalRequiredPartARatings
    },
    partB: {
      completed: completedRequiredPartBRatings,
      total: totalRequiredPartBRatings,
      isComplete: completedRequiredPartBRatings === totalRequiredPartBRatings
    }
  };
}

function getStatusGuidance(status, topology) {
  const currentStatus = String(status || '').trim();
  const topInfo = classifyTopologyForUI(topology);

  if (!topInfo.isCanonical) {
    return {
      th: topInfo.raw
        ? `⚠️ แจ้งเตือนคอนฟิก: ข้อมูล Routing Topology ("${escapeHtml(topInfo.raw)}") ไม่ถูกต้องตามระเบียบประเมิน กรุณาติดต่อ HR / Administrator`
        : '⚠️ แจ้งเตือนคอนฟิก: ไม่พบข้อมูล Routing Topology ในระเบียบประเมิน กรุณาติดต่อ HR / Administrator',
      en: topInfo.raw
        ? `⚠️ Configuration warning: Unrecognized Routing Topology ("${escapeHtml(topInfo.raw)}"). Please contact HR / Administrator.`
        : '⚠️ Configuration warning: Routing Topology not specified in record. Please contact HR / Administrator.',
      isWarning: true
    };
  }

  if (topInfo.isG2) {
    return {
      th: `⚠️ แจ้งเตือนคอนฟิก: เส้นทาง ${escapeHtml(topInfo.raw)} ยังไม่เปิดใช้งานในระบบ MBO V1 ปัจจุบัน (รองรับ M1_G1 และ M1_M2_G1 เท่านั้น)`,
      en: `⚠️ Configuration warning: Topology ${escapeHtml(topInfo.raw)} is unsupported in current V1 workflow. Please contact HR / Administrator.`,
      isWarning: true
    };
  }

  const firstManagerWarning = {
    th: '⚠️ แจ้งเตือนคอนฟิก: เส้นทาง M1_G1 ไม่ใช้ First Manager หากพบสถานะนี้ กรุณาติดต่อ HR / Administrator',
    en: '⚠️ Configuration warning: M1_G1 topology does not use First Manager. Please contact HR / Administrator.',
    isWarning: true
  };

  const guidanceMap = {
    '01 Draft Objective': {
      th: 'กรอกเป้าหมายและแผนงานให้สมบูรณ์ (ผลรวมน้ำหนัก 100%) แล้วกดปุ่ม Submit ด้านบน เพื่อส่งให้ Manager พิจารณา',
      en: 'Fill Objectives & Action Plan (Total Weight 100%), then click Submit above for Manager review.',
      isWarning: false
    },
    '02 First Manager Objective Review': topInfo.isM1G1 ? firstManagerWarning : {
      th: 'อยู่ระหว่างการพิจารณาเป้าหมายโดย First Manager / ตรวจสอบเป้าหมายและอนุมัติผ่านปุ่ม Kintone ด้านบน',
      en: 'Under First Manager review for Objectives. Please review and approve via Kintone buttons above.',
      isWarning: false
    },
    '03 Manager Objective Review': {
      th: 'อยู่ระหว่างการพิจารณาเป้าหมายโดย Manager / ตรวจสอบเป้าหมายและอนุมัติผ่านปุ่ม Kintone ด้านบน',
      en: 'Under Manager review for Objectives. Please review and approve via Kintone buttons above.',
      isWarning: false
    },
    '04 GM Objective Review': {
      th: 'อยู่ระหว่างการพิจารณาเป้าหมายโดย GM / ตรวจสอบเป้าหมายและอนุมัติผ่านปุ่ม Kintone ด้านบน',
      en: 'Under GM review for Objectives. Please review and approve via Kintone buttons above.',
      isWarning: false
    },
    '05 Objective Approved': {
      th: 'เป้าหมายได้รับการอนุมัติเรียบร้อยแล้ว รอเริ่มขั้นตอนการทบทวนกลางปี',
      en: 'Objectives Approved. Waiting to start Mid-Year review.',
      isWarning: false
    },
    '06 Employee Mid-Year': {
      th: 'กรอกผลการทบทวนกลางปีและความคืบหน้า แล้วกดปุ่ม Submit ด้านบน เพื่อส่งให้ Manager',
      en: 'Fill Mid-Year progress & review notes, then click Submit above to Manager.',
      isWarning: false
    },
    '07 First Manager Mid-Year Review': topInfo.isM1G1 ? firstManagerWarning : {
      th: 'อยู่ระหว่างการทบทวนกลางปีโดย First Manager / ตรวจสอบความคืบหน้าและอนุมัติผ่านปุ่ม Kintone ด้านบน',
      en: 'Under First Manager Mid-Year review. Please review and approve via Kintone buttons above.',
      isWarning: false
    },
    '08 Manager Mid-Year Review': {
      th: 'อยู่ระหว่างการทบทวนกลางปีโดย Manager / ตรวจสอบความคืบหน้าและอนุมัติผ่านปุ่ม Kintone ด้านบน',
      en: 'Under Manager Mid-Year review. Please review and approve via Kintone buttons above.',
      isWarning: false
    },
    '09 GM Mid-Year Review': {
      th: 'อยู่ระหว่างการทบทวนกลางปีโดย GM / ตรวจสอบความคืบหน้าและอนุมัติผ่านปุ่ม Kintone ด้านบน',
      en: 'Under GM Mid-Year review. Please review and approve via Kintone buttons above.',
      isWarning: false
    },
    '10 Mid-Year Completed': {
      th: 'การทบทวนกลางปีเสร็จสมบูรณ์ รอเริ่มขั้นตอนการประเมินตนเองปลายปี',
      en: 'Mid-Year review completed. Waiting to start Year-End self-evaluation.',
      isWarning: false
    },
    '11 Employee Self Evaluation': {
      th: 'กรอกผลงานจริงและประเมินตนเองปลายปี แล้วกดปุ่ม Submit ด้านบน เพื่อส่งให้ Manager',
      en: 'Fill actual results & self-evaluation, then click Submit above to Manager.',
      isWarning: false
    },
    '12 First Manager Final Evaluation': topInfo.isM1G1 ? firstManagerWarning : {
      th: 'อยู่ระหว่างการประเมินผลงานปลายปีโดย First Manager / ตรวจสอบและประเมินผลผ่านปุ่ม Kintone ด้านบน',
      en: 'Under First Manager Final evaluation. Please evaluate and approve via Kintone buttons above.',
      isWarning: false
    },
    '13 Manager Final Evaluation': {
      th: 'อยู่ระหว่างการประเมินผลงานปลายปีโดย Manager / ตรวจสอบและประเมินผลผ่านปุ่ม Kintone ด้านบน',
      en: 'Under Manager Final evaluation. Please evaluate and approve via Kintone buttons above.',
      isWarning: false
    },
    '14 GM Final Evaluation': {
      th: 'อยู่ระหว่างการประเมินผลงานปลายปีโดย GM / ตรวจสอบและประเมินผลผ่านปุ่ม Kintone ด้านบน',
      en: 'Under GM Final evaluation. Please evaluate and approve via Kintone buttons above.',
      isWarning: false
    },
    '15 HR Final Check': {
      th: 'อยู่ระหว่างการตรวจสอบขั้นสุดท้ายโดย HR Final Check',
      en: 'Under HR Final check and verification.',
      isWarning: false
    },
    '16 Completed': {
      th: 'กระบวนการประเมิน MBO เสร็จสมบูรณ์เรียบร้อยแล้ว',
      en: 'MBO Evaluation process fully completed.',
      isWarning: false
    }
  };

  return guidanceMap[currentStatus] || {
    th: 'สถานะการทำงานปัจจุบัน (ดำเนินการผ่านปุ่ม Kintone ด้านบน)',
    en: 'Current workflow status (Process actions available via Kintone buttons above).',
    isWarning: false
  };
}

function getMacroStage(status) {
  const screen = getVisualScreen(status);
  switch (screen) {
    case 'objectives': return 1;
    case 'midyear': return 2;
    case 'self_eval': return 3;
    case 'appraiser_eval': return 4;
    case 'hr_final': return 5;
    default: return 1;
  }
}

class EmployeePartAUI {
  constructor(options = {}) {
    this.container = options.container;
    this.record = options.record || {};
    this.stage = options.stage || BUSINESS_STAGES.READ_ONLY;
    this.isEditable = options.isEditable || false;
    this.isCreate = options.isCreate || false;
    this.appraiserCount = options.appraiserCount || 2;
    this.previewOptions = options.previewOptions || {};
    this.isPreviewMode = Boolean(options.isPreviewMode || options.previewOptions?.isPreviewMode);
    this.selectedViewStage = options.selectedViewStage || null;

    const rawSlot = options.activeSlotIndex || options.previewOptions?.activeSlotIndex || 1;
    this.activeSlotIndex = Math.min(Math.max(parseInt(rawSlot, 10), 1), this.appraiserCount);

    this.onFieldChange = options.onFieldChange || (() => {});
    this.onLookupEmployee = options.onLookupEmployee || (() => {});
    this.onEmployeeCodeChanged = options.onEmployeeCodeChanged || (() => {});
    this.currentErrors = [];

    this.isEmployeeVerified = !this.isCreate;
  }

  _getResolvedViewerRole() {
    const rawRole = (this.previewOptions && this.previewOptions.viewerRole) ? String(this.previewOptions.viewerRole).toLowerCase() : 'auto';
    if (rawRole === 'employee') return 'EMPLOYEE';
    if (rawRole === 'appraiser') return 'APPRAISER';
    if (rawRole === 'hr') return 'HR';

    const status = this._getVal('Status') || '01 Draft Objective';
    if (['15 HR Final Check', '16 Completed'].includes(status)) {
      return 'HR';
    }
    if (['02 First Manager Objective Review', '03 Manager Objective Review', '04 GM Objective Review',
         '07 First Manager Mid-Year Review', '08 Manager Mid-Year Review', '09 GM Mid-Year Review',
         '12 First Manager Final Evaluation', '13 Manager Final Evaluation', '14 GM Final Evaluation'].includes(status)) {
      return 'APPRAISER';
    }
    return 'EMPLOYEE';
  }

  render() {
    if (!this.container) return;
    this.container.innerHTML = '';

    const root = document.createElement('div');
    root.className = 'mbo-root';
    this.root = root;

    if (this.stage === BUSINESS_STAGES.CONFIGURATION_ERROR) {
      root.appendChild(this._renderErrorBanner('ไม่สามารถระบุขั้นตอนการทำงานได้ กรุณาติดต่อ HR / Administrator (SYSTEM CONFIGURATION ERROR)<br/>Unable to identify workflow stage. Please contact HR / Administrator.'));
      this.container.appendChild(root);
      return;
    }

    const status = this.isCreate ? '01 Draft Objective' : (this._getVal('Status') || '01 Draft Objective');
    const currentVisualScreen = getVisualScreen(status);

    if (!currentVisualScreen) {
      root.appendChild(this._renderErrorBanner('ไม่พบข้อมูลสถานะหรือสถานะไม่ถูกต้องตามระเบียบประเมิน (CONFIGURATION / UNKNOWN STATUS ERROR)<br/>Unrecognized status value in record. Please contact HR / Administrator.'));
      this.container.appendChild(root);
      return;
    }

    const currentStageNum = getMacroStage(status);
    const stageMap = { objectives: 1, midyear: 2, self_eval: 3, appraiser_eval: 4, hr_final: 5 };

    if (this.selectedViewStage) {
      const selectedStageNum = stageMap[this.selectedViewStage];
      if (!selectedStageNum || (selectedStageNum > currentStageNum && status !== '16 Completed')) {
        this.selectedViewStage = null;
      }
    }

    const effectiveVisualScreen = this.selectedViewStage || currentVisualScreen;
    const isHistoricalView = Boolean(this.selectedViewStage && effectiveVisualScreen !== currentVisualScreen);
    this.isHistoricalView = isHistoricalView;

    // R3-01: STEP 1 Lookup section is rendered on Create BEFORE fail-closed scoring snapshot validation!
    if (this.isCreate) {
      root.appendChild(this._renderLookupSection());
    }

    // Fail-Closed Snapshot Validation ONLY applies when lookup has succeeded OR on existing saved records (R3-01)
    const shouldValidateSnapshot = !(this.isCreate && !this.isEmployeeVerified);

    if (shouldValidateSnapshot) {
      const compSetCode = this._getVal('Competency_Set_Code') || this.previewOptions.competencySetCode;
      const applicableCompList = getApplicableCompetencies(compSetCode);
      if (!applicableCompList) {
        root.appendChild(this._renderErrorBanner(`ไม่พบข้อมูลชุดสมรรถนะ (Competency_Set_Code: "${escapeHtml(compSetCode || 'ว่าง')}") กรุณาติดต่อ HR / Administrator (CONFIGURATION ERROR)<br/>Invalid or missing Competency_Set_Code in configuration.`));
        this.container.appendChild(root);
        return;
      }

      const partAWeight = parseFloat(this._getVal('PartA_Weight') || this.previewOptions.partAWeight || '');
      const partBWeight = parseFloat(this._getVal('PartB_Weight') || this.previewOptions.partBWeight || '');
      if (isNaN(partAWeight) || isNaN(partBWeight) || (partAWeight + partBWeight) !== 100) {
        root.appendChild(this._renderErrorBanner(`ไม่พบสัดส่วนคะแนนประเมินที่ถูกต้อง (PartA_Weight + PartB_Weight ต้องเท่ากับ 100%) กรุณาติดต่อ HR / Administrator (CONFIGURATION ERROR)<br/>Invalid or missing PartA_Weight / PartB_Weight ratio configuration.`));
        this.container.appendChild(root);
        return;
      }
    }

    // Top Overall Process Progress Bar (5 Phases + Route Aware + Phase Calendar)
    root.appendChild(this._renderOverallProgressBar(status));

    // R6-R3: Dismissible Urgency Toast (if due soon, due today, or overdue)
    const urgencyToast = this._renderUrgencyToast(status);
    if (urgencyToast) {
      root.appendChild(urgencyToast);
    }

    // R6-R4: SINGLE PERSISTENT COMPACT STATUS & DEADLINE STRIP
    root.appendChild(this._renderCompactStatusStrip(status));

    // Header Section (Horizontal Summary)
    root.appendChild(this._renderHeader());

    // Approval Route Context
    root.appendChild(this._renderRouteContext());

    // Collapsible Legend & Guidelines
    root.appendChild(this._renderCollapsibleLegendAndGuidelines());

    // Custom Error Summary Area
    const errorSummaryContainer = document.createElement('div');
    errorSummaryContainer.id = 'mbo-error-summary-anchor';
    root.appendChild(errorSummaryContainer);

    // Hoshin Section (2 Columns Horizontal)
    root.appendChild(this._renderHoshin());

    // R6-R6: Historical Stage Review Banner
    if (isHistoricalView) {
      root.appendChild(this._renderHistoryBanner(effectiveVisualScreen, status));
    }

    // Render exact 1 of 5 Visual Screens
    const origStage = this.stage;
    const origEditable = this.isEditable;

    if (isHistoricalView) {
      this.stage = BUSINESS_STAGES.READ_ONLY;
      this.isEditable = false;
    }

    try {
      if (effectiveVisualScreen === 'objectives') {
        root.appendChild(this._renderScreenObjectives());
      } else if (effectiveVisualScreen === 'midyear') {
        root.appendChild(this._renderScreenMidYear());
      } else if (effectiveVisualScreen === 'self_eval') {
        root.appendChild(this._renderScreenSelfEval());
      } else if (effectiveVisualScreen === 'appraiser_eval') {
        const resolvedRole = this._getResolvedViewerRole();
        if (resolvedRole === 'EMPLOYEE') {
          const privacyCard = document.createElement('div');
          privacyCard.className = 'mbo-restricted-notice mbo-wide-card';
          privacyCard.style.padding = '24px 20px';
          privacyCard.style.margin = '12px 0';
          privacyCard.style.background = '#f8fafc';
          privacyCard.style.border = '1px solid #cbd5e1';
          privacyCard.style.borderRadius = '8px';
          privacyCard.style.textAlign = 'center';
          privacyCard.innerHTML = `
            <div style="font-size:16px; font-weight:700; color:#0f172a; margin-bottom:6px;">
              🔒 อยู่ระหว่างการประเมินโดยผู้ประเมิน / Appraiser Evaluation in progress
            </div>
            <div style="font-size:13px; color:#475569;">
              ข้อมูลรายละเอียดการประเมิน Part A & Part B และผลคะแนนถูกสงวนสิทธิ์สำหรับผู้ประเมินตามลำดับขั้นและ HR<br/>
              Detailed Appraiser Evaluation ratings, comments, and scoring context are restricted to authorized Appraiser and HR reviewers.
            </div>
          `;
          root.appendChild(privacyCard);
        } else {
          root.appendChild(this._renderScreenAppraiserEval());
        }
      } else if (effectiveVisualScreen === 'hr_final') {
        const resolvedRole = this._getResolvedViewerRole();
        if (resolvedRole === 'EMPLOYEE') {
          const hrPrivacyCard = document.createElement('div');
          hrPrivacyCard.className = 'mbo-restricted-notice mbo-wide-card';
          hrPrivacyCard.style.padding = '24px 20px';
          hrPrivacyCard.style.margin = '12px 0';
          hrPrivacyCard.style.background = '#f0f9ff';
          hrPrivacyCard.style.border = '1px solid #bae6fd';
          hrPrivacyCard.style.borderRadius = '8px';
          hrPrivacyCard.style.textAlign = 'center';
          hrPrivacyCard.innerHTML = `
            <div style="font-size:16px; font-weight:700; color:#0369a1; margin-bottom:6px;">
              🔒 HR กำลังตรวจสอบผลขั้นสุดท้าย / HR Final Review in progress
            </div>
            <div style="font-size:13px; color:#334155;">
              ผลการประเมินสรุปและรายละเอียดขั้นสุดท้ายอยู่ระหว่างการตรวจสอบโดยฝ่ายทรัพยากรบุคคล<br/>
              Final evaluation summary breakdown is restricted to authorized HR reviewers.
            </div>
          `;
          root.appendChild(hrPrivacyCard);
        } else {
          root.appendChild(this._renderScreenHrFinal());
        }
      }
    } finally {
      this.stage = origStage;
      this.isEditable = origEditable;
    }

    // Native Kintone Comment Thread Coexistence Placeholder
    root.appendChild(this._renderNativeCommentPlaceholder());

    // Workflow Action Timeline Frame (Read-Only Lifecycle Audit Trail)
    root.appendChild(this._renderWorkflowActionTimeline());

    this.container.appendChild(root);
    this._updateTotalWeightDisplay();
    this._refreshAllFieldHighlights(root);
    this._bindEvents(root);

    if (this.currentErrors && this.currentErrors.length > 0) {
      this._renderInlineErrors(this.currentErrors);
    }
  }

  _renderHistoryBanner(viewScreenKey, currentStatus) {
    const phases = [
      { key: 'objectives', nameTH: '1. เป้าหมาย', nameEN: 'Objectives', stage: 1 },
      { key: 'midyear', nameTH: '2. ทบทวนกลางปี', nameEN: 'Mid-Year', stage: 2 },
      { key: 'self_eval', nameTH: '3. ประเมินตนเอง', nameEN: 'Self Evaluation', stage: 3 },
      { key: 'appraiser_eval', nameTH: '4. การประเมินโดยผู้ประเมิน', nameEN: 'Appraiser Evaluation', stage: 4 },
      { key: 'hr_final', nameTH: '5. HR ตรวจสอบขั้นสุดท้าย / เสร็จสิ้น', nameEN: 'HR Final / Completed', stage: 5 }
    ];

    const targetPhase = phases.find(p => p.key === viewScreenKey) || phases[0];
    const banner = document.createElement('div');
    banner.className = 'mbo-history-banner';
    banner.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px;">
        <span style="font-size:20px;">📜</span>
        <div>
          <div style="font-weight:700; font-size:13px; color:#1e40af;">
            กำลังดูข้อมูลย้อนหลัง: ${escapeHtml(targetPhase.nameTH)} (${escapeHtml(targetPhase.nameEN)}) — อ่านอย่างเดียว / Read Only
          </div>
          <div style="font-size:11px; color:#3b82f6; margin-top:2px;">
            สถานะปัจจุบันของ Workflow ในระบบ: <strong>[${escapeHtml(currentStatus)}]</strong> (การดูย้อนหลังไม่มีผลต่อสถานะระบบ)
          </div>
        </div>
      </div>
      <button type="button" class="mbo-back-to-current-btn" data-action="back-to-current">
        ↩️ กลับสู่ขั้นตอนปัจจุบัน / Back to Current Phase
      </button>
    `;

    const backBtn = banner.querySelector('[data-action="back-to-current"]');
    if (backBtn) {
      backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.selectedViewStage = null;
        this.render();
      });
    }

    return banner;
  }

  _renderOverallProgressBar(status) {
    const card = document.createElement('div');
    card.className = 'mbo-overall-progress-card';

    const rawTopology = this._getVal('Routing_Topology');
    const prog = getProcessProgress(status, rawTopology);
    const calendar = this.previewOptions.phaseCalendar || DEFAULT_PHASE_CALENDAR;
    const nowIso = this.previewOptions.previewNow || '2026-06-15';

    if (prog.isMismatch) {
      card.innerHTML = `
        <div style="padding:12px 16px; background:#fffbe6; border:1px solid #ffe58f; border-radius:6px; color:#b45309; font-size:13px; font-weight:700;">
          ⚠️ Route Warning / Status Mismatch: ${escapeHtml(prog.mismatchMessage)}
        </div>
      `;
      return card;
    }

    const phases = [
      { key: 'objectives', calKey: 'objectives', nameTH: '1. เป้าหมาย', nameEN: 'Objectives', stage: 1 },
      { key: 'midyear', calKey: 'midyear', nameTH: '2. ทบทวนกลางปี', nameEN: 'Mid-Year', stage: 2 },
      { key: 'self_eval', calKey: 'selfEvaluation', nameTH: '3. ประเมินตนเอง', nameEN: 'Self Evaluation', stage: 3 },
      { key: 'appraiser_eval', calKey: 'appraiserEvaluation', nameTH: '4. การประเมินโดยผู้ประเมิน', nameEN: 'Appraiser Evaluation', stage: 4 },
      { key: 'hr_final', calKey: 'hrFinal', nameTH: '5. HR ตรวจสอบขั้นสุดท้าย / เสร็จสิ้น', nameEN: 'HR Final / Completed', stage: 5 }
    ];

    const currentStage = getMacroStage(status);
    const currentVisualScreen = getVisualScreen(status);
    const effectiveVisualScreen = (this.selectedViewStage && (phases.find(p => p.key === this.selectedViewStage)?.stage <= currentStage || status === '16 Completed'))
      ? this.selectedViewStage
      : currentVisualScreen;
    const isHistoricalView = Boolean(this.selectedViewStage && effectiveVisualScreen !== currentVisualScreen);

    const resolvedRole = this._getResolvedViewerRole();
    const phaseStepsHtml = phases.map(p => {
      const deadline = getPhaseCalendarStatus(p.calKey, status, nowIso, calendar);
      const isCurrentStage = (currentStage === p.stage);
      const isViewedStage = (effectiveVisualScreen === p.key);
      const isReachable = (p.stage <= currentStage || status === '16 Completed') && (resolvedRole !== 'EMPLOYEE' || p.stage <= 3);

      let stepClass = 'mbo-phase-step';
      if (isViewedStage && isHistoricalView) {
        stepClass += ' viewing-history';
      } else if (isCurrentStage) {
        stepClass += ' active';
      } else if (currentStage > p.stage || deadline.status === 'Completed') {
        stepClass += ' completed';
      } else {
        stepClass += ' locked';
      }

      if (isReachable) {
        stepClass += ' clickable';
      }

      let badgeText = `[${escapeHtml(deadline.labelTH)} / ${escapeHtml(deadline.labelEN)}]`;
      if (isViewedStage && isHistoricalView) {
        badgeText = '[ Viewing / กำลังดู ]';
      } else if (isCurrentStage) {
        badgeText = '[ Current / ปัจจุบัน ]';
      }

      const tooltipText = isReachable 
        ? 'คลิกเพื่อดูข้อมูลย้อนหลัง / Click to view history' 
        : (resolvedRole === 'EMPLOYEE' && p.stage >= 4 
            ? 'รายละเอียดสงวนสิทธิ์สำหรับผู้ประเมิน/HR / Restricted to Appraisers/HR' 
            : 'ยังไม่ถึงขั้นตอน / Unreached stage');

      return `
        <div class="${stepClass}" ${isReachable ? `data-stage-key="${p.key}"` : ''} title="${tooltipText}">
          <div style="font-size:12px; font-weight:700;">${escapeHtml(p.nameTH)}</div>
          <div style="font-size:10px; font-weight:600; opacity:0.9;">${escapeHtml(p.nameEN)}</div>
          <div class="mbo-deadline-badge ${isViewedStage && isHistoricalView ? 'mbo-deadline-history' : deadline.badgeClass}">
            ${badgeText}
          </div>
          <div style="font-size:9.5px; margin-top:2px; opacity:0.85;">
            ${escapeHtml(deadline.daysTextEN)}
          </div>
        </div>
      `;
    }).join('');

    card.innerHTML = `
      <div class="mbo-progress-phases">
        ${phaseStepsHtml}
      </div>
      <div class="mbo-progress-bar-wrap" style="margin-top:10px;">
        <div class="mbo-progress-bar-fill" style="width: ${prog.percent}%;"></div>
      </div>
      <div class="mbo-progress-label" style="margin-top:6px; display:flex; justify-content:space-between; align-items:center;">
        <span>📊 ความคืบหน้าตามเส้นทาง / Route Progress: <strong>${prog.percent}%</strong> (${escapeHtml(prog.label)})</span>
        <span style="font-size:11px; color:#64748b;">📅 Simulated Date: <strong>${escapeHtml(nowIso)}</strong></span>
      </div>
    `;
    card.querySelectorAll('.mbo-phase-step.clickable').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const stageKey = el.getAttribute('data-stage-key');
        if (!stageKey) return;
        const targetPhase = phases.find(p => p.key === stageKey);
        if (!targetPhase) return;
        if (targetPhase.stage <= currentStage || status === '16 Completed') {
          if (targetPhase.key === currentVisualScreen) {
            this.selectedViewStage = null;
          } else {
            this.selectedViewStage = stageKey;
          }
          this.render();
        }
      });
    });

    return card;
  }

  _renderCompactStatusStrip(status) {
    const currentStatus = String(status || '').trim();
    const rawTopology = this._getVal('Routing_Topology');
    const topInfo = classifyTopologyForUI(rawTopology);

    const phases = [
      { key: 'objectives', nameTH: '1. เป้าหมาย', nameEN: 'Objectives', stage: 1 },
      { key: 'midyear', nameTH: '2. ทบทวนกลางปี', nameEN: 'Mid-Year', stage: 2 },
      { key: 'selfEvaluation', nameTH: '3. ประเมินตนเอง', nameEN: 'Self Evaluation', stage: 3 },
      { key: 'appraiserEvaluation', nameTH: '4. การประเมินโดยผู้ประเมิน', nameEN: 'Appraiser Evaluation', stage: 4 },
      { key: 'hrFinal', nameTH: '5. HR ตรวจสอบขั้นสุดท้าย / เสร็จสิ้น', nameEN: 'HR Final / Completed', stage: 5 }
    ];

    const currentStage = getMacroStage(status);
    const activePhase = phases.find(p => p.stage === currentStage) || phases[0];
    const calendar = this.previewOptions.phaseCalendar || DEFAULT_PHASE_CALENDAR;
    const nowIso = this.previewOptions.previewNow || '2026-06-15';
    const deadline = getPhaseCalendarStatus(activePhase.key, status, nowIso, calendar);

    let bannerClass = 'mbo-urgency-green';
    let pillClass = 'pill-green';
    let icon = '⏳';

    if (deadline.isCompleted) {
      bannerClass = 'mbo-urgency-green';
      pillClass = 'pill-green';
      icon = '✓';
    } else if (deadline.isOverdue) {
      bannerClass = 'mbo-urgency-red mbo-pulse-active';
      pillClass = 'pill-red';
      icon = '🚨';
    } else if (deadline.isDueToday) {
      bannerClass = 'mbo-urgency-orange mbo-pulse-active';
      pillClass = 'pill-orange';
      icon = '⚠️';
    } else if (deadline.isDueSoon || (deadline.remDays >= 1 && deadline.remDays <= 7)) {
      bannerClass = 'mbo-urgency-amber mbo-pulse-active';
      pillClass = 'pill-amber';
      icon = '⏰';
    } else if (deadline.isUpcoming) {
      bannerClass = 'mbo-urgency-neutral';
      pillClass = 'pill-neutral';
      icon = '📅';
    }

    const exactDueDate = calendar[activePhase.key]?.end || 'N/A';
    const statusGuidance = getStatusGuidance(status, rawTopology);

    let actorSummary = '';
    if (['01 Draft Objective', '06 Employee Mid-Year', '11 Employee Self Evaluation'].includes(currentStatus)) {
      actorSummary = '👤 <strong>Action Required: Requester / Employee (พนักงาน):</strong> กรอกข้อมูลแล้วกดส่งเรื่องขออนุมัติ';
    } else if (['02 First Manager Objective Review', '03 Manager Objective Review', '04 GM Objective Review', '07 First Manager Mid-Year Review', '08 Manager Mid-Year Review', '09 GM Mid-Year Review'].includes(currentStatus)) {
      actorSummary = '👥 <strong>Action Required: Workflow Approver (ผู้อนุมัติ):</strong> ตรวจสอบและพิจารณาอนุมัติผ่านปุ่ม Kintone';
    } else if (['12 First Manager Final Evaluation', '13 Manager Final Evaluation', '14 GM Final Evaluation'].includes(currentStatus)) {
      actorSummary = '👥 <strong>Action Required: Appraiser (ผู้ประเมิน):</strong> ให้คะแนน Part A & Part B แล้วกดอนุมัติ';
    } else if (currentStatus === '05 Objective Approved') {
      actorSummary = deadline.isUpcoming ? '🔒 <strong>รอเวลา:</strong> อยู่ระหว่างรอเปิดช่วงทบทวนกลางปี' : '🚀 <strong>พร้อมเริ่ม:</strong> พนักงานกดปุ่ม "Start Mid-Year" ใน Kintone';
    } else if (currentStatus === '10 Mid-Year Completed') {
      actorSummary = deadline.isUpcoming ? '🔒 <strong>รอเวลา:</strong> อยู่ระหว่างรอเปิดช่วงประเมินตนเอง' : '🚀 <strong>พร้อมเริ่ม:</strong> พนักงานกดปุ่ม "Start Self Evaluation" ใน Kintone';
    } else if (currentStatus === '15 HR Final Check') {
      actorSummary = '🏛️ <strong>HR Admin:</strong> ตรวจสอบความถูกต้องขั้นสุดท้ายแล้วกดเสร็จสิ้น';
    } else if (currentStatus === '16 Completed') {
      actorSummary = '✓ <strong>เสร็จสมบูรณ์:</strong> การประเมินเสร็จสิ้นเรียบร้อยแล้ว';
    }

    const card = document.createElement('div');
    card.className = 'mbo-compact-status-strip-wrap';
    card.innerHTML = `
      <div class="mbo-urgency-callout mbo-compact-status-strip ${bannerClass}">
        <div class="mbo-urgency-icon">${icon}</div>
        <div class="mbo-urgency-content">
          <div class="mbo-urgency-header-row">
            <div class="mbo-urgency-phase-title">
              📌 ${escapeHtml(activePhase.nameTH)} (${escapeHtml(activePhase.nameEN)}) — <span style="font-weight:600;">[${escapeHtml(currentStatus)}]</span>
            </div>
            <div class="mbo-urgency-badge-pill ${pillClass}">
              ${escapeHtml(deadline.calloutTextTH)} / ${escapeHtml(deadline.calloutTextEN)}
            </div>
          </div>
          <div class="mbo-urgency-sub-date">
            <span>${actorSummary}</span>
            <span style="margin-left:12px; color:#475569;">📅 ครบกำหนด: <strong>${escapeHtml(exactDueDate)}</strong></span>
          </div>
          ${statusGuidance && statusGuidance.isWarning ? `<div style="font-size:11px; font-weight:700; color:#b45309; margin-top:3px;">${escapeHtml(statusGuidance.th)}</div>` : ''}
        </div>
      </div>
    `;

    return card;
  }

  _renderDeadlineUrgencyBanner(status) {
    const card = document.createElement('div');
    card.className = 'mbo-deadline-urgency-container';

    const phases = [
      { key: 'objectives', nameTH: '1. เป้าหมาย', nameEN: 'Objectives', stage: 1 },
      { key: 'midyear', nameTH: '2. ทบทวนกลางปี', nameEN: 'Mid-Year', stage: 2 },
      { key: 'selfEvaluation', nameTH: '3. ประเมินตนเอง', nameEN: 'Self Evaluation', stage: 3 },
      { key: 'appraiserEvaluation', nameTH: '4. การประเมินโดยผู้ประเมิน', nameEN: 'Appraiser Evaluation', stage: 4 },
      { key: 'hrFinal', nameTH: '5. HR ตรวจสอบขั้นสุดท้าย / เสร็จสิ้น', nameEN: 'HR Final / Completed', stage: 5 }
    ];

    const currentStage = getMacroStage(status);
    const activePhase = phases.find(p => p.stage === currentStage) || phases[0];
    const calendar = this.previewOptions.phaseCalendar || DEFAULT_PHASE_CALENDAR;
    const nowIso = this.previewOptions.previewNow || '2026-06-15';
    const deadline = getPhaseCalendarStatus(activePhase.key, status, nowIso, calendar);

    let bannerClass = 'mbo-urgency-green';
    let icon = '⏳';

    if (deadline.isCompleted) {
      bannerClass = 'mbo-urgency-green';
      icon = '✓';
    } else if (deadline.isOverdue) {
      bannerClass = 'mbo-urgency-red mbo-pulse-active';
      icon = '🚨';
    } else if (deadline.isDueToday) {
      bannerClass = 'mbo-urgency-orange mbo-pulse-active';
      icon = '⚠️';
    } else if (deadline.isDueSoon || (deadline.remDays >= 1 && deadline.remDays <= 7)) {
      bannerClass = 'mbo-urgency-amber mbo-pulse-active';
      icon = '⏰';
    } else if (deadline.isUpcoming) {
      bannerClass = 'mbo-urgency-neutral';
      icon = '📅';
    }

    const exactDueDate = calendar[activePhase.key]?.end || 'N/A';

    card.innerHTML = `
      <div class="mbo-urgency-callout ${bannerClass}">
        <div class="mbo-urgency-icon">${icon}</div>
        <div class="mbo-urgency-content">
          <div class="mbo-urgency-phase-title">
            📌 ขั้นตอนปัจจุบัน / CURRENT PHASE: ${escapeHtml(activePhase.nameTH)} (${escapeHtml(activePhase.nameEN)})
          </div>
          <div class="mbo-urgency-main-number">
            ${escapeHtml(deadline.calloutTextTH)} / ${escapeHtml(deadline.calloutTextEN)}
          </div>
          <div class="mbo-urgency-sub-date">
            📅 กำหนดส่งคงเหลือ / Phase Due Date: <strong>${escapeHtml(exactDueDate)}</strong> (วันที่จำลองประเมิน / Simulated Date: ${escapeHtml(nowIso)})
          </div>
        </div>
      </div>
    `;

    return card;
  }

  _renderUrgencyToast(status) {
    if (this._toastDismissed) return null;

    const phases = [
      { key: 'objectives', nameTH: '1. เป้าหมาย', nameEN: 'Objectives', stage: 1 },
      { key: 'midyear', nameTH: '2. ทบทวนกลางปี', nameEN: 'Mid-Year', stage: 2 },
      { key: 'selfEvaluation', nameTH: '3. ประเมินตนเอง', nameEN: 'Self Evaluation', stage: 3 },
      { key: 'appraiserEvaluation', nameTH: '4. การประเมินโดยผู้ประเมิน', nameEN: 'Appraiser Evaluation', stage: 4 },
      { key: 'hrFinal', nameTH: '5. HR ตรวจสอบขั้นสุดท้าย / เสร็จสิ้น', nameEN: 'HR Final / Completed', stage: 5 }
    ];

    const currentStage = getMacroStage(status);
    const activePhase = phases.find(p => p.stage === currentStage) || phases[0];
    const calendar = this.previewOptions.phaseCalendar || DEFAULT_PHASE_CALENDAR;
    const nowIso = this.previewOptions.previewNow || '2026-06-15';
    const deadline = getPhaseCalendarStatus(activePhase.key, status, nowIso, calendar);

    const isDueSoon = deadline.isDueSoon || (deadline.remDays >= 1 && deadline.remDays <= 7);
    const isDueToday = deadline.isDueToday;
    const isOverdue = deadline.isOverdue;

    if (!isDueSoon && !isDueToday && !isOverdue) {
      return null;
    }

    const toast = document.createElement('div');
    toast.className = `mbo-urgency-toast ${isOverdue ? 'overdue' : (isDueToday ? 'due-today' : 'due-soon')}`;

    let msgTH = '';
    if (isOverdue) {
      msgTH = `⚠️ เกินกำหนด ${deadline.overdueDays || ''} วัน — กรุณาดำเนินการโดยเร็ว / Please take action as soon as possible.`;
    } else if (isDueToday) {
      msgTH = `⚠️ ครบกำหนดวันนี้ — กรุณาดำเนินการให้เสร็จสิ้นภายในวันนี้ / Due Today! Please complete your action today.`;
    } else {
      msgTH = `⏳ เหลือ ${deadline.remDays} วัน — กรุณาดำเนินการภายในกำหนด / Please complete action before deadline.`;
    }

    const toastBody = document.createElement('div');
    toastBody.className = 'mbo-urgency-toast-body';

    const toastText = document.createElement('div');
    toastText.className = 'mbo-urgency-toast-text';
    toastText.innerHTML = `<strong>${escapeHtml(activePhase.nameTH)}:</strong> ${escapeHtml(msgTH)}`;
    toastBody.appendChild(toastText);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'mbo-urgency-toast-close';
    closeBtn.type = 'button';
    closeBtn.textContent = '✕ ปิด / Dismiss';
    closeBtn.addEventListener('click', () => {
      this._toastDismissed = true;
      if (typeof toast.remove === 'function') {
        toast.remove();
      } else if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    });

    toastBody.appendChild(closeBtn);
    toast.appendChild(toastBody);

    return toast;
  }

  _renderActorBanner(status) {
    const currentStatus = String(status || '').trim();
    const rawTopology = this._getVal('Routing_Topology');
    const topInfo = classifyTopologyForUI(rawTopology);
    const card = document.createElement('div');
    card.className = 'mbo-actor-banner-card';
    card.style.marginBottom = '14px';

    if (!topInfo.isCanonical || !topInfo.isSupportedV1) {
      card.innerHTML = `
        <div style="background:#fef2f2; border:1px solid #fecaca; padding:10px 14px; border-radius:6px; color:#991b1b; font-size:13px; font-weight:700;">
          ⚠️ Route Warning: Cannot determine stage owner because routing topology is missing, unrecognized, or unsupported in V1 (${escapeHtml(topInfo.raw || 'None')}).
        </div>
      `;
      return card;
    }

    const pathList = getApplicableWorkflowPath(rawTopology);
    if (pathList && !pathList.includes(currentStatus)) {
      card.innerHTML = `
        <div style="background:#fffbe6; border:1px solid #ffe58f; padding:10px 14px; border-radius:6px; color:#b45309; font-size:13px; font-weight:700;">
          ⚠️ Route Mismatch: Status "${escapeHtml(currentStatus)}" is not applicable to active ${escapeHtml(topInfo.raw)} route.
        </div>
      `;
      return card;
    }

    let actorTitle = '';
    let actorDesc = '';
    let badgeColor = '#0284c7';
    let badgeBg = '#e0f2fe';

    if (['01 Draft Objective', '06 Employee Mid-Year', '11 Employee Self Evaluation'].includes(currentStatus)) {
      actorTitle = '👤 Action Required: Requester / Employee (พนักงานผู้รับการประเมิน)';
      actorDesc = 'พนักงานกรอกข้อมูลและบันทึกเป้าหมาย/ผลงานในส่วนที่รับผิดชอบ จากนั้นกดปุ่มส่งเรื่องเพื่อขออนุมัติ';
      badgeColor = '#0284c7'; badgeBg = '#e0f2fe';
    } else if (['02 First Manager Objective Review', '03 Manager Objective Review', '04 GM Objective Review', '07 First Manager Mid-Year Review', '08 Manager Mid-Year Review', '09 GM Mid-Year Review'].includes(currentStatus)) {
      actorTitle = '👥 Action Required: Workflow Approver (ผู้บังคับบัญชา / ผู้อนุมัติตามลำดับขั้น)';
      actorDesc = 'ผู้อนุมัติตามลำดับขั้นตรวจสอบความถูกต้องและพิจารณาอนุมัติผ่านปุ่ม Kintone ด้านบน';
      badgeColor = '#b45309'; badgeBg = '#fef3c7';
    } else if (['12 First Manager Final Evaluation', '13 Manager Final Evaluation', '14 GM Final Evaluation'].includes(currentStatus)) {
      actorTitle = '👥 Action Required: Workflow Approver & Scoring Appraisers (ผู้บังคับบัญชา & ผู้ประเมิน)';
      actorDesc = 'ผู้ประเมินให้คะแนน Part A (Objectives) และ Part B (Competencies) พร้อมข้อเสนอแนะ จากนั้นกดปุ่มอนุมัติ';
      badgeColor = '#6d28d9'; badgeBg = '#f3e8ff';
    } else if (currentStatus === '05 Objective Approved') {
      const calendar = this.previewOptions.phaseCalendar || DEFAULT_PHASE_CALENDAR;
      const nowIso = this.previewOptions.previewNow || '2026-06-15';
      const deadline = calculateDeadlineInfo(calendar.midyear.start, calendar.midyear.end, nowIso, false);

      if (deadline.isUpcoming) {
        actorTitle = '🔒 Waiting Boundary: 05 Objective Approved — ยังไม่ต้องดำเนินการ / No action required yet';
        actorDesc = `เป้าหมายได้รับการอนุมัติเรียบร้อยแล้ว อยู่ระหว่างรอเปิดช่วงเวลาทบทวนกลางปี (Mid-Year opens in ${deadline.diffDays || 0} days on ${calendar.midyear.start})`;
        badgeColor = '#047857'; badgeBg = '#d1fae5';
      } else {
        actorTitle = '🚀 Ready Boundary: 05 Objective Approved — พร้อมเริ่มทบทวนกลางปี / Ready to start Mid-Year';
        actorDesc = `ช่วงเวลาทบทวนกลางปีเปิดแล้ว (พนักงาน Requester เป็นผู้ดำเนินการ: กรุณากดปุ่ม "Start Mid-Year" ในระบบ Kintone เพื่อเข้าสู่ช่วงทบทวนกลางปี)`;
        badgeColor = '#0284c7'; badgeBg = '#e0f2fe';
      }
    } else if (currentStatus === '10 Mid-Year Completed') {
      const calendar = this.previewOptions.phaseCalendar || DEFAULT_PHASE_CALENDAR;
      const nowIso = this.previewOptions.previewNow || '2026-06-15';
      const deadline = calculateDeadlineInfo(calendar.selfEvaluation.start, calendar.selfEvaluation.end, nowIso, false);

      if (deadline.isUpcoming) {
        actorTitle = '🔒 Waiting Boundary: 10 Mid-Year Completed — ยังไม่ต้องดำเนินการ / No action required yet';
        actorDesc = `การทบทวนกลางปีเสร็จสมบูรณ์เรียบร้อยแล้ว อยู่ระหว่างรอเปิดช่วงเวลาประเมินตนเองปลายปี (Self Evaluation opens in ${deadline.diffDays || 0} days on ${calendar.selfEvaluation.start})`;
        badgeColor = '#047857'; badgeBg = '#d1fae5';
      } else {
        actorTitle = '🚀 Ready Boundary: 10 Mid-Year Completed — พร้อมเริ่มประเมินตนเอง / Ready to start Self Evaluation';
        actorDesc = `ช่วงเวลาประเมินตนเองเปิดแล้ว (พนักงาน Requester เป็นผู้ดำเนินการ: กรุณากดปุ่ม "Start Self Evaluation" ในระบบ Kintone เพื่อเข้าสู่ช่วงประเมินตนเอง)`;
        badgeColor = '#0284c7'; badgeBg = '#e0f2fe';
      }
    } else if (currentStatus === '15 HR Final Check') {
      actorTitle = '🔍 Action Required: HR Final Check (ฝ่ายทรัพยากรบุคคล)';
      actorDesc = 'HR ตรวจสอบความถูกต้องและอนุมัติปิดรอบประเมิน MBO';
      badgeColor = '#0369a1'; badgeBg = '#e0f2fe';
    } else if (currentStatus === '16 Completed') {
      actorTitle = '🎉 Status: Completed — All Evaluation Phases Closed (เสร็จสิ้นสมบูรณ์)';
      actorDesc = 'กระบวนการประเมินเสร็จสมบูรณ์เรียบร้อย ข้อมูลทั้งหมดถูกล็อกถาวรเพื่อใช้อ้างอิง';
      badgeColor = '#15803d'; badgeBg = '#dcfce7';
    }

    card.innerHTML = `
      <div style="background:${badgeBg}; border:1px solid ${badgeColor}; padding:10px 16px; border-radius:6px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-size:13.5px; font-weight:700; color:${badgeColor};">${actorTitle}</div>
          <div style="font-size:12px; color:#334155; margin-top:2px;">${actorDesc}</div>
        </div>
        <div style="font-size:11px; font-weight:700; background:#ffffff; color:${badgeColor}; padding:4px 10px; border-radius:12px; border:1px solid ${badgeColor}; white-space:nowrap;">
          Actor-Aware Context
        </div>
      </div>
    `;

    return card;
  }

  _renderAttachmentControl(fieldCode, stageLabel, isEditable) {
    let recField = this.record[fieldCode];
    if ((!recField || !recField.value || (Array.isArray(recField.value) && recField.value.length === 0)) && fieldCode.startsWith('Self_Attachment_')) {
      const altCode = fieldCode.replace('Self_Attachment_', 'Final_Attachment_');
      recField = this.record[altCode];
    }
    const rawVal = recField ? recField.value : null;
    let fileName = null;
    if (Array.isArray(rawVal) && rawVal.length > 0 && rawVal[0] && rawVal[0].name) {
      fileName = rawVal[0].name;
    } else if (rawVal && typeof rawVal === 'object' && rawVal.name) {
      fileName = rawVal.name;
    } else if (typeof rawVal === 'string' && rawVal) {
      fileName = rawVal;
    }

    const mockFile = this.previewOptions.attachments?.[fieldCode] || (fileName ? { name: fileName } : null);

    if (mockFile && mockFile.name) {
      return `
        <div class="mbo-attachment-badge">
          📎 <span style="max-width:110px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(mockFile.name)}</span>
          ${isEditable ? `<button type="button" class="mbo-attachment-remove-btn" data-code="${escapeHtml(fieldCode)}" style="border:none; background:none; cursor:pointer; color:#dc2626; font-weight:700; padding:0 2px;">✕</button>` : ''}
        </div>
      `;
    }

    if (isEditable) {
      return `
        <div class="mbo-attachment-box">
          <label class="mbo-attachment-btn">
            📎 แนบไฟล์ (เลือกได้ / Optional)
            <input type="file" class="mbo-attachment-file-input" data-code="${escapeHtml(fieldCode)}" style="display:none;" />
          </label>
          <div style="font-size:9.5px; color:#64748b; margin-top:2px;">Optional evidence (${escapeHtml(stageLabel)})</div>
        </div>
      `;
    }

    return `<span style="font-size:11px; color:#94a3b8; font-style:italic;">ไม่มีไฟล์แนบ / No attachment</span>`;
  }

  _renderWorkflowActionTimeline() {
    const card = document.createElement('div');
    card.className = 'mbo-timeline-card';

    const resolvedRole = this._getResolvedViewerRole();
    let events = this.previewOptions.timelineEvents || [
      { stage: '1. Objectives', actor: '1st Appraiser (ผู้ประเมินลำดับที่ 1)', name: 'Manager Sompong (m01)', action: 'Approved Objectives', time: '14 Feb 2026 • 09:42', outcome: 'approved', commentNotice: false },
      { stage: '1. Objectives', actor: '2nd Appraiser (ผู้ประเมินลำดับที่ 2)', name: 'GM Vichai (g01)', action: 'Returned for Revision', time: '15 Feb 2026 • 10:18', outcome: 'returned', commentNotice: true },
      { stage: '1. Objectives', actor: 'Employee / Requester (พนักงาน)', name: 'Somchai Prasert (0118)', action: 'Resubmitted Objectives', time: '16 Feb 2026 • 08:30', outcome: 'resubmitted', commentNotice: false },
      { stage: '1. Objectives', actor: '2nd Appraiser (ผู้ประเมินลำดับที่ 2)', name: 'GM Vichai (g01)', action: 'Approved Objectives', time: '16 Feb 2026 • 13:05', outcome: 'approved', commentNotice: false },
      { stage: '4. Appraiser Evaluation', actor: '1st Appraiser (ผู้ประเมินลำดับที่ 1)', name: 'Manager Sompong (m01)', action: 'Scoring Completed', time: '20 Nov 2026 • 14:22', outcome: 'approved', commentNotice: false }
    ];

    if (resolvedRole === 'EMPLOYEE') {
      events = events.filter(e => {
        const stageStr = String(e.stage || '').toLowerCase();
        return !stageStr.includes('4.') && !stageStr.includes('5.') && !stageStr.includes('appraiser evaluation') && !stageStr.includes('hr final');
      });
    }

    const rowsHtml = events.map((e, idx) => {
      const outcomeClass = escapeHtml(e.outcome || 'approved');
      const badgeText = e.outcome === 'returned' ? 'Returned' : (e.outcome === 'resubmitted' ? 'Resubmitted' : 'Approved');
      const isReturned = e.outcome === 'returned';

      return `
        <tr class="${isReturned ? 'returned-row' : ''}">
          <td style="text-align:center; font-weight:700; color:#64748b;">${idx + 1}</td>
          <td><span style="font-size:11px; font-weight:700; color:#0284c7; background:#e0f2fe; padding:2px 6px; border-radius:4px;">${escapeHtml(e.stage)}</span></td>
          <td style="font-weight:700; color:#1e293b;">${escapeHtml(e.actor)}</td>
          <td style="font-weight:600; color:#0f172a;">${escapeHtml(e.name)}</td>
          <td style="font-weight:600; color:#334155;">${escapeHtml(e.action)}</td>
          <td style="font-size:11.5px; color:#475569; white-space:nowrap;">🕒 ${escapeHtml(e.time)}</td>
          <td style="text-align:center;"><span class="mbo-timeline-badge ${outcomeClass}">${escapeHtml(badgeText)}</span></td>
          <td style="font-size:11px;">${e.commentNotice ? `<span style="color:#dc2626; font-weight:700;">💬 ดูความคิดเห็น / View Comments</span>` : '<span style="color:#94a3b8;">—</span>'}</td>
        </tr>
      `;
    }).join('');

    card.innerHTML = `
      <details open style="cursor:pointer;">
        <summary class="mbo-timeline-title">
          <span>📜 ประวัติการดำเนินการ / Workflow Action Timeline (Read-Only Audit Trail)</span>
          <span style="font-size:11px; font-weight:600; color:#64748b; background:#e2e8f0; padding:2px 8px; border-radius:10px;">${events.length} Events Recorded</span>
        </summary>
        <div class="mbo-table-container" style="margin-top:10px;">
          <table class="mbo-timeline-table">
            <thead>
              <tr>
                <th style="width:35px; text-align:center;">#</th>
                <th style="width:17%;">ขั้นตอน / Stage</th>
                <th style="width:20%;">ผู้ดำเนินการ / Actor</th>
                <th style="width:16%;">ชื่อผู้ดำเนินการ / Person</th>
                <th style="width:16%;">การดำเนินการ / Action</th>
                <th style="width:14%;">วัน-เวลา / Date & Time</th>
                <th style="width:12%; text-align:center;">ผลลัพธ์ / Result</th>
                <th style="width:12%;">หมายเหตุ / Comments</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      </details>
    `;
    return card;
  }

  _renderNativeCommentPlaceholder() {
    const card = document.createElement('div');
    card.className = 'mbo-native-comment-placeholder';
    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong style="color:#0f172a; font-size:13px;">💬 ความคิดเห็นใน Kintone / Kintone Comments (Native Platform)</strong>
          <div style="font-size:11.5px; color:#475569; margin-top:2px;">
            เมื่อมีการส่งกลับให้แก้ไข (Return / Reject) ผู้ประเมินและพนักงานสามารถสื่อสารผ่านช่องทางความคิดเห็นหลักของ Kintone ทางด้านขวามือของหน้าจอ
          </div>
        </div>
        <span style="font-size:10.5px; font-weight:700; background:#e2e8f0; color:#334155; padding:4px 8px; border-radius:4px; white-space:nowrap;">
          Native Platform Coexistence
        </span>
      </div>
    `;
    return card;
  }

  _renderScreenObjectives() {
    const container = document.createElement('div');
    container.className = 'mbo-table-container';

    const isObjectiveStage = this.isCreate || this.stage === BUSINESS_STAGES.OBJECTIVE_INPUT || this.stage === BUSINESS_STAGES.NEW_RECORD;
    const isObjEditable = this.isEditable && isObjectiveStage && this.isEmployeeVerified;

    let count = parseObjectiveCount(this._getVal('Objective_Count'));
    if (count === null && this.isCreate === true) {
      count = 4; // True create/new record draft default choice in UI selection
    }

    if (count === null) {
      const errCard = document.createElement('div');
      errCard.style.padding = '20px';
      errCard.style.margin = '12px 0';
      errCard.style.background = '#fef2f2';
      errCard.style.border = '1px solid #fca5a5';
      errCard.style.borderRadius = '6px';
      errCard.style.color = '#991b1b';
      errCard.innerHTML = `
        <div style="font-size:15px; font-weight:700;">⚠️ ไม่พบข้อมูลจำนวนเป้าหมายที่ถูกต้อง (1..10) / Invalid Objective Count (1..10)</div>
        <div style="font-size:12.5px; margin-top:4px;">ค่า Objective_Count ในระเบียนข้อมูลเป็นค่าว่าง หรือไม่ถูกต้อง / Objective_Count is invalid or missing in record data.</div>
      `;
      container.appendChild(errCard);
      return container;
    }

    const bar = document.createElement('div');
    bar.className = 'mbo-table-header-bar';
    bar.innerHTML = `
      <span>STEP 3: Part A : MBO (การตั้งเป้าหมายผลงาน / Objectives Setup)</span>
      <div style="font-size: 13px; font-weight: normal; display: flex; align-items: center; gap: 8px;">
        <span>จำนวนเป้าหมาย / Number of Objectives:</span>
        ${isObjEditable ? `
          <select id="mbo-obj-count-select" class="mbo-cell-select" style="width: 65px; height: 28px; font-size: 13px; padding: 2px 6px; background: #ffffff;">
            ${[1,2,3,4,5,6,7,8,9,10].map(n => `<option value="${n}" ${count === n ? 'selected' : ''}>${n}</option>`).join('')}
          </select>
        ` : `<strong>${count} Objectives</strong>`}
      </div>
    `;
    container.appendChild(bar);

    if (this.isCreate && !this.isEmployeeVerified) {
      const lockBanner = document.createElement('div');
      lockBanner.style.padding = '30px 20px';
      lockBanner.style.textAlign = 'center';
      lockBanner.style.background = '#f8fafc';
      lockBanner.style.border = '1px dashed #cbd5e1';
      lockBanner.style.borderRadius = '6px';
      lockBanner.style.margin = '12px 0';
      lockBanner.style.color = '#64748b';
      lockBanner.innerHTML = `
        <div style="font-size: 18px; margin-bottom: 6px;">🔒 ตารางตั้งเป้าหมายถูกล็อกชั่วคราว / Objective Setup is Locked</div>
        <div style="font-size: 13px;">กรุณาระบุรหัสพนักงานใน <strong>STEP 1</strong> และกดปุ่มค้นหาก่อนเพื่อปลดล็อกการตั้งเป้าหมาย<br/>Please identify and verify employee profile in STEP 1 to unlock objective setup.</div>
      `;
      container.appendChild(lockBanner);
      return container;
    }

    const currentStatus = this._getVal('Status') || '01 Draft Objective';
    if (currentStatus === '05 Objective Approved') {
      const calendar = this.previewOptions.phaseCalendar || DEFAULT_PHASE_CALENDAR;
      const boundaryBanner = document.createElement('div');
      boundaryBanner.style.padding = '16px 20px';
      boundaryBanner.style.background = '#f0fdf4';
      boundaryBanner.style.border = '1px solid #86efac';
      boundaryBanner.style.borderRadius = '6px';
      boundaryBanner.style.margin = '12px 0';
      boundaryBanner.innerHTML = `
        <div style="font-size:15px; font-weight:700; color:#166534; margin-bottom:4px;">🔒 05 Objective Approved — Stage 1 Complete</div>
        <div style="font-size:12.5px; color:#334155;">เป้าหมายได้รับการอนุมัติเรียบร้อยแล้ว อยู่ระหว่างรอเปิดช่วงเวลาทบทวนกลางปี (Mid-Year Start Date: <strong>${escapeHtml(calendar.midyear.start)}</strong>)</div>
      `;
      container.appendChild(boundaryBanner);
    }

    // Desktop Horizontal Spreadsheet Table Layout (R5)
    const table = document.createElement('table');
    table.className = 'mbo-grid-table';
    table.innerHTML = `
      <thead>
        <tr>
          <th style="width: 40px; text-align: center;">#</th>
          <th style="width: 28%;">
            เป้าหมายและผลลัพธ์ที่คาดหวัง / Objectives & Target *
            <span class="th-sub">[ระบุเป้าหมาย ตัวชี้วัด และค่าเป้าหมาย]</span>
          </th>
          <th style="width: 28%;">
            แผนปฏิบัติการ / Action Plan *
            <span class="th-sub">[ระบุกิจกรรม ขั้นตอน และระยะเวลาดำเนินการ]</span>
          </th>
          <th style="width: 16%;">
            ข้อตกลงเพิ่มเติม / Additional Agreement
            <span class="th-sub">[ข้อตกลงหรือหมายเหตุเพิ่มเติม]</span>
          </th>
          <th style="width: 7%; text-align: center;">
            น้ำหนัก *
            <span class="th-sub">(Weight %)</span>
          </th>
          <th style="width: 11%; text-align: center;">
            ความยาก *
            <span class="th-sub">[Difficulty 1-4]</span>
          </th>
          <th style="width: 10%; text-align: center;">
            แนบไฟล์ / Attach File
            <span class="th-sub">(Optional)</span>
          </th>
        </tr>
      </thead>
    `;

    const tbody = document.createElement('tbody');
    table.appendChild(tbody);

    for (let i = 1; i <= count; i++) {
      const objVal = this._getVal(`Objective_${i}`);
      const actVal = this._getVal(`Action_Plan_${i}`);
      const addVal = this._getVal(`Additional_Agreement_${i}`);
      const wVal = this._getVal(`Weight_${i}`);
      const diffVal = this._getVal(`Difficulty_${i}`);
      const attachHtml = this._renderAttachmentControl(`Objective_Attachment_${i}`, 'Objectives', isObjEditable);

      const tr = document.createElement('tr');
      tr.dataset.objIndex = String(i);
      tr.innerHTML = `
        <td class="mbo-row-num-cell">${i}</td>
        <td>
          <textarea class="mbo-cell-textarea mbo-field" data-code="Objective_${i}" data-required="true" ${!isObjEditable ? 'readonly' : ''} placeholder="ระบุเป้าหมายและผลลัพธ์ที่คาดหวัง...">${escapeHtml(objVal)}</textarea>
          <span class="mbo-cell-tag" data-target="Objective_${i}"></span>
        </td>
        <td>
          <textarea class="mbo-cell-textarea mbo-field" data-code="Action_Plan_${i}" data-required="true" ${!isObjEditable ? 'readonly' : ''} placeholder="ระบุกิจกรรมและแผนงานเพื่อบรรลุเป้าหมาย...">${escapeHtml(actVal)}</textarea>
          <span class="mbo-cell-tag" data-target="Action_Plan_${i}"></span>
        </td>
        <td>
          <textarea class="mbo-cell-textarea mbo-field" data-code="Additional_Agreement_${i}" ${!isObjEditable ? 'readonly' : ''} style="min-height:75px;" placeholder="ข้อตกลงเพิ่มเติม...">${escapeHtml(addVal)}</textarea>
          <span class="mbo-cell-tag" data-target="Additional_Agreement_${i}"></span>
        </td>
        <td style="text-align:center; vertical-align:top;">
          <input type="number" min="1" max="100" class="mbo-cell-input mbo-field mbo-weight-input" data-code="Weight_${i}" data-required="true" value="${escapeHtml(wVal)}" ${!isObjEditable ? 'readonly' : ''} style="text-align:center; height:36px;" placeholder="30" />
          <span class="mbo-cell-tag" data-target="Weight_${i}"></span>
        </td>
        <td style="vertical-align:top;">
          ${isObjEditable ? `
            <select class="mbo-cell-select mbo-field" data-code="Difficulty_${i}" data-required="true" style="height:36px;">
              <option value="" ${!diffVal ? 'selected' : ''}>-- กรุณาเลือกระดับความยาก / Please select --</option>
              <option value="1" ${diffVal === '1' ? 'selected' : ''}>1 : Normal (ง่าย)</option>
              <option value="2" ${diffVal === '2' ? 'selected' : ''}>2 : Moderate (ปานกลาง)</option>
              <option value="3" ${diffVal === '3' ? 'selected' : ''}>3 : Difficult (ยาก)</option>
              <option value="4" ${diffVal === '4' ? 'selected' : ''}>4 : Challenging (ท้าทายมาก)</option>
            </select>
          ` : `
            <input type="text" class="mbo-cell-input mbo-field-state-locked" value="${diffVal ? `Level ${escapeHtml(diffVal)}` : 'ยังไม่ได้ระบุ / Not selected'}" readonly style="height:36px;" />
          `}
          <span class="mbo-cell-tag" data-target="Difficulty_${i}"></span>
        </td>
        <td style="vertical-align:top; text-align:center;">
          ${attachHtml}
        </td>
      `;
      tbody.appendChild(tr);
    }

    container.appendChild(table);

    // Total Weight Summary
    container.appendChild(this._renderWeightSummary());

    return container;
  }

  _renderScreenMidYear() {
    const container = document.createElement('div');
    container.className = 'mbo-table-container';

    const isMidEditable = this.isEditable && this.stage === BUSINESS_STAGES.MIDYEAR_INPUT;

    const count = parseObjectiveCount(this._getVal('Objective_Count'));
    if (count === null) {
      const errCard = document.createElement('div');
      errCard.style.padding = '20px';
      errCard.style.margin = '12px 0';
      errCard.style.background = '#fef2f2';
      errCard.style.border = '1px solid #fca5a5';
      errCard.style.borderRadius = '6px';
      errCard.style.color = '#991b1b';
      errCard.innerHTML = `
        <div style="font-size:15px; font-weight:700;">⚠️ ไม่พบข้อมูลจำนวนเป้าหมายที่ถูกต้อง (1..10) / Invalid Objective Count (1..10)</div>
        <div style="font-size:12.5px; margin-top:4px;">ค่า Objective_Count ในระเบียนข้อมูลเป็นค่าว่าง หรือไม่ถูกต้อง / Objective_Count is invalid or missing in record data.</div>
      `;
      container.appendChild(errCard);
      return container;
    }

    const bar = document.createElement('div');
    bar.className = 'mbo-table-header-bar';
    bar.innerHTML = `
      <span>STEP 3: ทบทวนกลางปี / Stage 2 — Mid-Year Progress & Review (1..${count})</span>
      <span style="font-weight: normal; font-size: 12px; color: #cbd5e1;">[Horizontal Table Layout]</span>
    `;
    container.appendChild(bar);

    const currentStatus = this._getVal('Status') || '06 Employee Mid-Year';
    if (currentStatus === '10 Mid-Year Completed') {
      const calendar = this.previewOptions.phaseCalendar || DEFAULT_PHASE_CALENDAR;
      const boundaryBanner = document.createElement('div');
      boundaryBanner.style.padding = '24px 20px';
      boundaryBanner.style.textAlign = 'center';
      boundaryBanner.style.background = '#f0fdf4';
      boundaryBanner.style.border = '1px dashed #86efac';
      boundaryBanner.style.borderRadius = '6px';
      boundaryBanner.style.margin = '12px';
      boundaryBanner.innerHTML = `
        <div style="font-size:16px; font-weight:700; color:#166534; margin-bottom:6px;">🔒 10 Mid-Year Completed — Stage 2 Complete</div>
        <div style="font-size:13px; color:#334155;">การทบทวนกลางปีเสร็จสมบูรณ์เรียบร้อยแล้ว อยู่ระหว่างรอเปิดช่วงเวลาประเมินตนเองปลายปี (Self Eval Start Date: <strong>${escapeHtml(calendar.selfEvaluation.start)}</strong>)</div>
      `;
      container.appendChild(boundaryBanner);
      return container;
    }

    const table = document.createElement('table');
    table.className = 'mbo-grid-table';
    table.innerHTML = `
      <thead>
        <tr>
          <th style="width:40px; text-align:center;">#</th>
          <th style="width:22%;">เป้าหมาย & แผนงาน / Objective & Action Plan (Read-Only)</th>
          <th style="width:16%;">ความคืบหน้าของเป้าหมาย / Objective Progress (%)</th>
          <th style="width:17%;">ทบทวนเป็นระยะ / Periodical Review</th>
          <th style="width:17%;">ผลสำเร็จปัจจุบัน / Milestone Result</th>
          <th style="width:16%;">ปัญหาอุปสรรค / Issue & Next Action</th>
          <th style="width:12%; text-align:center;">แนบไฟล์ / Attach File <span class="th-sub">(Optional)</span></th>
        </tr>
      </thead>
    `;

    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    for (let i = 1; i <= count; i++) {
      const objVal = this._getVal(`Objective_${i}`);
      const actVal = this._getVal(`Action_Plan_${i}`);
      const wVal = this._getVal(`Weight_${i}`) || '0';
      const prog = parseInt(this._getVal(`Progress_Percent_${i}`) || '0', 10);
      const revVal = this._getVal(`Periodical_Review_${i}`);
      const resVal = this._getVal(`MidYear_Result_${i}`);
      const riskVal = this._getVal(`MidYear_Issue_Risk_${i}`);
      const nextActVal = this._getVal(`MidYear_Next_Action_${i}`);
      const attachHtml = this._renderAttachmentControl(`MidYear_Attachment_${i}`, 'Mid-Year', isMidEditable);

      const tr = document.createElement('tr');
      tr.dataset.objIndex = String(i);
      tr.innerHTML = `
        <td class="mbo-row-num-cell">${i}</td>
        <td>
          <strong style="color:#1e3a8a; font-size:13px;">#${i} ${escapeHtml(objVal) || '(No title)'}</strong>
          <div style="font-size:11px; color:#0369a1; font-weight:700; margin:2px 0 4px 0;">Weight: ${escapeHtml(wVal)}%</div>
          <div style="font-size:12px; color:#475569; background:#f8fafc; padding:6px; border-radius:4px;">${escapeHtml(actVal) || '-'}</div>
        </td>
        <td>
          <div style="font-size:10.5px; font-weight:700; color:#0369a1; margin-bottom:2px;">
            ความคืบหน้าของเป้าหมาย / Objective Progress (%)
          </div>
          <div style="font-size:9.5px; color:#64748b; margin-bottom:4px;">
            พนักงานระบุความคืบหน้าปัจจุบัน 0–100% / Employee-reported current progress 0–100%
          </div>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
            ${isMidEditable ? `
              <input type="number" min="0" max="100" class="mbo-cell-input mbo-field mbo-prog-num" data-code="Progress_Percent_${i}" value="${prog}" style="width:60px; height:28px; font-size:12px; font-weight:700; text-align:center;" />
              <input type="range" min="0" max="100" class="mbo-field mbo-prog-range" data-code="Progress_Percent_${i}" value="${prog}" style="width:80px;" />
            ` : `
              <strong style="font-size:13px; color:#0369a1;">${prog}%</strong>
            `}
          </div>
          <div class="mbo-progress-bar-container" style="height:8px; background:#e2e8f0; border-radius:4px; overflow:hidden;">
            <div class="mbo-progress-bar-fill" style="width: ${prog}%; height:100%; background:#0284c7;"></div>
          </div>
        </td>
        <td>
          <textarea class="mbo-cell-textarea mbo-field" data-code="Periodical_Review_${i}" ${!isMidEditable ? 'readonly' : ''} style="min-height:75px;" placeholder="บันทึกทบทวน...">${escapeHtml(revVal)}</textarea>
        </td>
        <td>
          <textarea class="mbo-cell-textarea mbo-field" data-code="MidYear_Result_${i}" ${!isMidEditable ? 'readonly' : ''} style="min-height:75px;" placeholder="ผลสำเร็จปัจจุบัน...">${escapeHtml(resVal)}</textarea>
        </td>
        <td>
          <textarea class="mbo-cell-textarea mbo-field" data-code="MidYear_Issue_Risk_${i}" ${!isMidEditable ? 'readonly' : ''} style="min-height:38px; margin-bottom:4px;" placeholder="ปัญหา/อุปสรรค...">${escapeHtml(riskVal)}</textarea>
          <textarea class="mbo-cell-textarea mbo-field" data-code="MidYear_Next_Action_${i}" ${!isMidEditable ? 'readonly' : ''} style="min-height:38px;" placeholder="แนวทางแก้ไข...">${escapeHtml(nextActVal)}</textarea>
        </td>
        <td style="vertical-align:top; text-align:center;">
          ${attachHtml}
        </td>
      `;
      tbody.appendChild(tr);
    }

    container.appendChild(table);
    return container;
  }

  _renderScreenSelfEval() {
    const container = document.createElement('div');
    container.className = 'mbo-table-container';

    const isSelfEditable = this.isEditable && this.stage === BUSINESS_STAGES.SELF_EVALUATION;

    const count = parseObjectiveCount(this._getVal('Objective_Count'));
    if (count === null) {
      const errCard = document.createElement('div');
      errCard.style.padding = '20px';
      errCard.style.margin = '12px 0';
      errCard.style.background = '#fef2f2';
      errCard.style.border = '1px solid #fca5a5';
      errCard.style.borderRadius = '6px';
      errCard.style.color = '#991b1b';
      errCard.innerHTML = `
        <div style="font-size:15px; font-weight:700;">⚠️ ไม่พบข้อมูลจำนวนเป้าหมายที่ถูกต้อง (1..10) / Invalid Objective Count (1..10)</div>
        <div style="font-size:12.5px; margin-top:4px;">ค่า Objective_Count ในระเบียนข้อมูลเป็นค่าว่าง หรือไม่ถูกต้อง / Objective_Count is invalid or missing in record data.</div>
      `;
      container.appendChild(errCard);
      return container;
    }

    const bar = document.createElement('div');
    bar.className = 'mbo-table-header-bar';
    bar.innerHTML = `
      <span>STEP 3: ประเมินตนเองปลายปี / Stage 3 — Self Evaluation (1..${count})</span>
      <span style="font-weight: normal; font-size: 12px; color: #cbd5e1;">[Horizontal Table Layout]</span>
    `;
    container.appendChild(bar);

    // Status 10 Boundary check
    const currentStatus = this._getVal('Status') || '11 Employee Self Evaluation';
    if (currentStatus === '10 Mid-Year Completed') {
      const calendar = this.previewOptions.phaseCalendar || DEFAULT_PHASE_CALENDAR;
      const boundaryBanner = document.createElement('div');
      boundaryBanner.style.padding = '24px 20px';
      boundaryBanner.style.textAlign = 'center';
      boundaryBanner.style.background = '#f0fdf4';
      boundaryBanner.style.border = '1px dashed #86efac';
      boundaryBanner.style.borderRadius = '6px';
      boundaryBanner.style.margin = '12px';
      boundaryBanner.innerHTML = `
        <div style="font-size:16px; font-weight:700; color:#166534; margin-bottom:6px;">🔒 10 Mid-Year Completed — Stage 2 Complete</div>
        <div style="font-size:13px; color:#334155;">การทบทวนกลางปีเสร็จสมบูรณ์เรียบร้อยแล้ว อยู่ระหว่างรอเปิดช่วงเวลาประเมินตนเองปลายปี (Self Eval Start Date: <strong>${escapeHtml(calendar.selfEvaluation.start)}</strong>)</div>
      `;
      container.appendChild(boundaryBanner);
      return container;
    }

    const table = document.createElement('table');
    table.className = 'mbo-grid-table';
    table.innerHTML = `
      <thead>
        <tr>
          <th style="width:40px; text-align:center;">#</th>
          <th style="width:23%;">เป้าหมาย / Objective (Read-Only)</th>
          <th style="width:33%;">ผลการดำเนินงานจริง / Actual Result & Achievement *</th>
          <th style="width:14%;">ประเมินตนเอง / Self Achievement [1-5] *</th>
          <th style="width:18%;">ความคิดเห็นตนเอง / Self Reflection</th>
          <th style="width:12%; text-align:center;">แนบไฟล์ / Attach File <span class="th-sub">(Optional)</span></th>
        </tr>
      </thead>
    `;

    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    for (let i = 1; i <= count; i++) {
      const objVal = this._getVal(`Objective_${i}`);
      const wVal = this._getVal(`Weight_${i}`) || '0';
      const prog = this._getVal(`Progress_Percent_${i}`) || '0';
      const actResult = this._getVal(`Actual_Result_${i}`);
      const selfAch = this._getVal(`Self_Achievement_${i}`) || '3';
      const selfComment = this._getVal(`Self_Comment_${i}`);
      const attachHtml = this._renderAttachmentControl(`Self_Attachment_${i}`, 'Self Evaluation', isSelfEditable) || this._renderAttachmentControl(`Final_Attachment_${i}`, 'Self Evaluation', isSelfEditable);

      const tr = document.createElement('tr');
      tr.dataset.objIndex = String(i);
      tr.innerHTML = `
        <td class="mbo-row-num-cell">${i}</td>
        <td>
          <strong style="color:#1e3a8a; font-size:13px;">#${i} ${escapeHtml(objVal) || '(No title)'}</strong>
          <div style="font-size:11px; color:#0369a1; font-weight:700; margin-top:2px;">Weight: ${escapeHtml(wVal)}% | Mid Progress: ${escapeHtml(prog)}%</div>
        </td>
        <td>
          <textarea class="mbo-cell-textarea mbo-field" data-code="Actual_Result_${i}" data-required="true" ${!isSelfEditable ? 'readonly' : ''} style="min-height:80px;" placeholder="สรุปผลงานจริงที่บรรลุเมื่อสิ้นปี...">${escapeHtml(actResult)}</textarea>
        </td>
        <td>
          ${isSelfEditable ? `
            <select class="mbo-cell-select mbo-field" data-code="Self_Achievement_${i}" style="height:36px;">
              <option value="1" ${selfAch === '1' ? 'selected' : ''}>1 : Rarely meet</option>
              <option value="2" ${selfAch === '2' ? 'selected' : ''}>2 : Partially meet</option>
              <option value="3" ${selfAch === '3' ? 'selected' : ''}>3 : Fully meet</option>
              <option value="4" ${selfAch === '4' ? 'selected' : ''}>4 : Exceeded</option>
              <option value="5" ${selfAch === '5' ? 'selected' : ''}>5 : Remarkable</option>
            </select>
          ` : `
            <input type="text" class="mbo-cell-input mbo-field-state-locked" value="Level ${escapeHtml(selfAch)}" readonly style="height:36px;" />
          `}
        </td>
        <td>
          <textarea class="mbo-cell-textarea mbo-field" data-code="Self_Comment_${i}" ${!isSelfEditable ? 'readonly' : ''} style="min-height:80px;" placeholder="ข้อคิดเห็นประกอบการประเมินตนเอง...">${escapeHtml(selfComment)}</textarea>
        </td>
        <td style="vertical-align:top; text-align:center;">
          ${attachHtml}
        </td>
      `;
      tbody.appendChild(tr);
    }

    container.appendChild(table);
    return container;
  }

  _renderScreenAppraiserEval() {
    const wrap = document.createElement('div');

    const appraiserInfo = normalizeAppraiserData(this.record, this.appraiserCount, this.previewOptions);
    const compSetCode = this._getVal('Competency_Set_Code') || this.previewOptions.competencySetCode;
    const applicableCompList = getApplicableCompetencies(compSetCode);

    const currentStatus = this._getVal('Status') || '13 Manager Final Evaluation';
    const rawTopology = this._getVal('Routing_Topology') || 'M1_G1';
    const topInfo = classifyTopologyForUI(rawTopology);

    let activeSlot = 1;
    if (this.previewOptions.activeSlotIndex !== undefined && this.previewOptions.activeSlotIndex !== null) {
      activeSlot = parseInt(this.previewOptions.activeSlotIndex, 10);
    } else if (currentStatus === '12 First Manager Final Evaluation') {
      activeSlot = 1;
    } else if (currentStatus === '13 Manager Final Evaluation') {
      activeSlot = topInfo.isM1M2G1 ? 2 : 1;
    } else if (currentStatus === '14 GM Final Evaluation') {
      activeSlot = topInfo.isM1M2G1 ? 3 : 2;
    }

    // Top Appraiser Completion Card
    const compCard = document.createElement('div');
    compCard.className = 'mbo-appraiser-completion-card';
    compCard.innerHTML = `
      <div class="mbo-appraiser-completion-info">
        👥 สถานะการประเมินของผู้ประเมิน / Appraiser Evaluation Completion:
        <strong>${appraiserInfo.completedCount} / ${appraiserInfo.totalCount} Complete (${appraiserInfo.completionPercent}%)</strong>
        <div style="font-size:11.5px; font-weight:normal; color:#475569; margin-top:2px;">
          Part A Ratings: <strong>${appraiserInfo.partA.completed}/${appraiserInfo.partA.total}</strong> | Part B Ratings: <strong>${appraiserInfo.partB.completed}/${appraiserInfo.partB.total}</strong>
          | Active Slot: <strong style="color:#0284c7;">Slot ${activeSlot} (${appraiserInfo.slots.find(s => s.slotIndex === activeSlot)?.label || ''})</strong>
        </div>
      </div>
      <div class="mbo-appraiser-slots-pills">
        ${appraiserInfo.slots.map(s => `
          <span class="mbo-appraiser-slot-pill ${s.isCompleted ? 'done' : 'pending'} ${s.slotIndex === activeSlot ? 'active' : ''}">
            ${s.isCompleted ? '✓' : '⏳'} ${escapeHtml(s.label)} ${s.slotIndex === activeSlot ? '(Active)' : ''}
          </span>
        `).join('')}
      </div>
    `;
    wrap.appendChild(compCard);

    const count = parseObjectiveCount(this._getVal('Objective_Count'));
    if (count === null) {
      const errCard = document.createElement('div');
      errCard.style.padding = '20px';
      errCard.style.margin = '12px 0';
      errCard.style.background = '#fef2f2';
      errCard.style.border = '1px solid #fca5a5';
      errCard.style.borderRadius = '6px';
      errCard.style.color = '#991b1b';
      errCard.innerHTML = `
        <div style="font-size:15px; font-weight:700;">⚠️ ไม่พบข้อมูลจำนวนเป้าหมายที่ถูกต้อง (1..10) / Invalid Objective Count (1..10)</div>
        <div style="font-size:12.5px; margin-top:4px;">ค่า Objective_Count ในระเบียนข้อมูลเป็นค่าว่าง หรือไม่ถูกต้อง / Objective_Count is invalid or missing in record data.</div>
      `;
      wrap.appendChild(errCard);
      return wrap;
    }

    // PART A Horizontal Matrix Table Container
    const partAContainer = document.createElement('div');
    partAContainer.className = 'mbo-table-container';

    const barA = document.createElement('div');
    barA.className = 'mbo-table-header-bar';
    barA.innerHTML = `
      <span>PART A: การประเมินเป้าหมายผลงาน / Part A Objectives Evaluation (1..${count})</span>
      <span style="font-weight: normal; font-size: 12px; color: #cbd5e1;">[Horizontal Appraiser Matrix]</span>
    `;
    partAContainer.appendChild(barA);

    const tableA = document.createElement('table');
    tableA.className = 'mbo-grid-table';

    let slotHeadersHtml = '';
    appraiserInfo.slots.forEach(s => {
      const slotTitle = (s.slotIndex >= 3) ? `${escapeHtml(s.label)} (Preview Logical Slot)` : escapeHtml(s.label);
      const isActiveCol = (s.slotIndex === activeSlot);
      slotHeadersHtml += `<th style="width: 16%; ${isActiveCol ? 'background:#0284c7; color:#ffffff;' : ''}">${slotTitle} ${isActiveCol ? '★ Active' : ''}</th>`;
    });

    tableA.innerHTML = `
      <thead>
        <tr>
          <th class="sticky-col" style="width: 40px; text-align: center;">#</th>
          <th class="sticky-col" style="width: 22%; left: 40px;">เป้าหมาย & แผนงาน / Objective</th>
          <th style="width: 18%;">ผลงานจริง & หลักฐาน / Evidence Context</th>
          ${slotHeadersHtml}
          <th class="sticky-right" style="width: 10%; text-align: center;">คะแนนสรุป / Result</th>
        </tr>
      </thead>
    `;

    const tbodyA = document.createElement('tbody');
    tableA.appendChild(tbodyA);

    for (let i = 1; i <= count; i++) {
      const objVal = this._getVal(`Objective_${i}`);
      const wVal = this._getVal(`Weight_${i}`) || '0';
      const diffVal = this._getVal(`Difficulty_${i}`);
      const actResult = this._getVal(`Actual_Result_${i}`);
      const selfAch = this._getVal(`Self_Achievement_${i}`) || '-';

      const avgScore = this._getVal(`Average_Objective_Score_${i}`);
      const mboPoint = this._getVal(`MBO_Point_${i}`);

      const objAttachHtml = this._renderAttachmentControl(`Objective_Attachment_${i}`, 'Objectives', false);
      const midAttachHtml = this._renderAttachmentControl(`MidYear_Attachment_${i}`, 'Mid-Year', false);
      const selfAttachHtml = this._renderAttachmentControl(`Self_Attachment_${i}`, 'Self Evaluation', false);

      let slotCellsHtml = '';
      appraiserInfo.slots.forEach(s => {
        const ratingVal = s.partARatings[i] || '';
        const itemComment = s.partAComments[i] || '';
        const isSlotEditable = this.isEditable && (s.slotIndex === activeSlot);

        const ratingDataCode = s.slotIndex === 1 ? `Manager_Achievement_${i}` : (s.slotIndex === 2 ? `GM_Achievement_${i}` : '');
        const commentDataCode = s.slotIndex === 1 ? `Manager_Comment_${i}` : (s.slotIndex === 2 ? `GM_Comment_${i}` : '');

        if (isSlotEditable) {
          slotCellsHtml += `
            <td style="background:#f0f9ff; border:2px solid #0284c7;">
              <div style="font-size:10px; font-weight:700; color:#0284c7; margin-bottom:2px;">[EDITABLE / ACTIVE APPRAISER]</div>
              <div style="font-size:11px; font-weight:700; color:#475569; margin-bottom:2px;">Rating [1-5]:</div>
              <select class="mbo-cell-select ${ratingDataCode ? 'mbo-field' : ''}" ${ratingDataCode ? `data-code="${ratingDataCode}"` : `data-preview-slot="${s.slotIndex}"`} style="height:32px; font-size:12px;">
                <option value="" ${!ratingVal ? 'selected' : ''}>-- Select --</option>
                <option value="1" ${ratingVal === '1' ? 'selected' : ''}>1 : Rarely meet</option>
                <option value="2" ${ratingVal === '2' ? 'selected' : ''}>2 : Partially meet</option>
                <option value="3" ${ratingVal === '3' ? 'selected' : ''}>3 : Fully meet</option>
                <option value="4" ${ratingVal === '4' ? 'selected' : ''}>4 : Exceeded</option>
                <option value="5" ${ratingVal === '5' ? 'selected' : ''}>5 : Remarkable</option>
              </select>
              <div style="font-size:11px; font-weight:700; color:#475569; margin:4px 0 2px 0;">Feedback:</div>
              <textarea class="mbo-wide-textarea ${commentDataCode ? 'mbo-field' : ''}" ${commentDataCode ? `data-code="${commentDataCode}"` : `data-preview-slot="${s.slotIndex}"`} style="min-height:45px; font-size:12px;" placeholder="Comment...">${escapeHtml(itemComment)}</textarea>
            </td>
          `;
        } else {
          slotCellsHtml += `
            <td style="background:#f8fafc; color:#334155; font-size:12px;">
              <div style="font-size:10px; font-weight:700; color:#64748b; margin-bottom:2px;">[READ-ONLY / VISIBLE]</div>
              <strong>Score:</strong> ${ratingVal ? `L${escapeHtml(ratingVal)}` : '<span style="color:#94a3b8;">-</span>'}<br/>
              <div style="margin-top:2px; font-style:italic; color:#475569;">"${escapeHtml(itemComment || 'No comment recorded')}"</div>
            </td>
          `;
        }
      });

      let resultContextHtml = '';
      if (appraiserInfo.isFullyComplete) {
        resultContextHtml = `
          <div style="font-size:11px; color:#166534; background:#f0fdf4; padding:6px; border-radius:4px; border:1px solid #bbf7d0;">
            Avg: <strong>${escapeHtml(avgScore || '-')}</strong><br/>
            Point: <strong>${escapeHtml(mboPoint || '-')}</strong>
          </div>
        `;
      } else {
        resultContextHtml = `
          <div style="font-size:11px; color:#991b1b; background:#fef2f2; padding:6px; border-radius:4px; border:1px solid #fecaca;">
            <span class="mbo-pending-badge">⚠️ Pending</span>
          </div>
        `;
      }

      const tr = document.createElement('tr');
      tr.dataset.objIndex = String(i);
      tr.innerHTML = `
        <td class="mbo-row-num-cell sticky-col">${i}</td>
        <td class="sticky-col" style="left:40px;">
          <strong style="color:#0f172a; font-size:13px;">#${i} ${escapeHtml(objVal) || '(No title)'}</strong>
          <div style="font-size:11px; color:#0369a1; font-weight:700; margin-top:2px;">
            Weight: ${escapeHtml(wVal)}% | Diff: ${diffVal ? `L${escapeHtml(diffVal)}` : 'N/A'} | Self: L${escapeHtml(selfAch)}
          </div>
        </td>
        <td>
          <div style="font-size:12px; color:#334155; background:#f8fafc; padding:6px; border-radius:4px; min-height:50px;">${escapeHtml(actResult) || '-'}</div>
          <div style="margin-top:4px; font-size:9.5px; color:#64748b; display:flex; flex-direction:column; gap:2px;">
            <div>📌 Obj File: ${objAttachHtml}</div>
            <div>📌 Mid File: ${midAttachHtml}</div>
            <div>📌 Self File: ${selfAttachHtml}</div>
          </div>
        </td>
        ${slotCellsHtml}
        <td class="sticky-right" style="vertical-align:middle; text-align:center;">${resultContextHtml}</td>
      `;
      tbodyA.appendChild(tr);
    }

    partAContainer.appendChild(tableA);
    wrap.appendChild(partAContainer);

    // PART B Horizontal Matrix Table Container
    const partBContainer = document.createElement('div');
    partBContainer.className = 'mbo-table-container';

    const barB = document.createElement('div');
    barB.className = 'mbo-table-header-bar';
    barB.innerHTML = `
      <span>PART B: การประเมินสมรรถนะ / Part B Competency Evaluation (${applicableCompList.length} Items)</span>
      <span style="font-weight: normal; font-size: 12px; color: #cbd5e1;">[${escapeHtml(compSetCode)}]</span>
    `;
    partBContainer.appendChild(barB);

    const tableB = document.createElement('table');
    tableB.className = 'mbo-grid-table';

    tableB.innerHTML = `
      <thead>
        <tr>
          <th class="sticky-col" style="width: 25%;">สมรรถนะ / Competency Item</th>
          ${slotHeadersHtml}
          <th class="sticky-right" style="width: 12%; text-align: center;">ผลการประเมิน / Result</th>
        </tr>
      </thead>
    `;

    const tbodyB = document.createElement('tbody');
    tableB.appendChild(tbodyB);

    applicableCompList.forEach(comp => {
      let slotCellsHtml = '';
      appraiserInfo.slots.forEach(s => {
        const ratingVal = s.partBRatings[comp.id] || '';
        const itemComment = s.partBComments[comp.id] || '';
        const isSlotEditable = this.isEditable && (s.slotIndex === activeSlot);

        const ratingDataCode = s.slotIndex === 1 ? `Manager_Competency_Rating_${comp.id}` : (s.slotIndex === 2 ? `GM_Competency_Rating_${comp.id}` : '');
        const commentDataCode = s.slotIndex === 1 ? `Manager_Competency_Comment_${comp.id}` : (s.slotIndex === 2 ? `GM_Competency_Comment_${comp.id}` : '');

        if (isSlotEditable) {
          slotCellsHtml += `
            <td style="background:#f0f9ff; border:2px solid #0284c7;">
              <div style="font-size:10px; font-weight:700; color:#0284c7; margin-bottom:2px;">[EDITABLE / ACTIVE APPRAISER]</div>
              <div style="font-size:11px; font-weight:700; color:#475569; margin-bottom:2px;">Score [1-5]:</div>
              <select class="mbo-cell-select ${ratingDataCode ? 'mbo-field' : ''}" ${ratingDataCode ? `data-code="${ratingDataCode}"` : `data-preview-slot="${s.slotIndex}"`} style="height:32px; font-size:12px;">
                <option value="" ${!ratingVal ? 'selected' : ''}>-- Select --</option>
                <option value="1" ${ratingVal === '1' ? 'selected' : ''}>1 : Unsatisfactory</option>
                <option value="2" ${ratingVal === '2' ? 'selected' : ''}>2 : Needs Improvement</option>
                <option value="3" ${ratingVal === '3' ? 'selected' : ''}>3 : Meets Standard</option>
                <option value="4" ${ratingVal === '4' ? 'selected' : ''}>4 : Exceeds Standard</option>
                <option value="5" ${ratingVal === '5' ? 'selected' : ''}>5 : Outstanding</option>
              </select>
              <div style="font-size:11px; font-weight:700; color:#475569; margin:4px 0 2px 0;">Feedback:</div>
              <textarea class="mbo-wide-textarea ${commentDataCode ? 'mbo-field' : ''}" ${commentDataCode ? `data-code="${commentDataCode}"` : `data-preview-slot="${s.slotIndex}"`} style="min-height:40px; font-size:12px;" placeholder="Comment...">${escapeHtml(itemComment)}</textarea>
            </td>
          `;
        } else {
          slotCellsHtml += `
            <td style="background:#f8fafc; color:#334155; font-size:12px;">
              <div style="font-size:10px; font-weight:700; color:#64748b; margin-bottom:2px;">[READ-ONLY / VISIBLE]</div>
              <strong>Score:</strong> ${ratingVal ? `L${escapeHtml(ratingVal)}` : '<span style="color:#94a3b8;">-</span>'}<br/>
              <div style="margin-top:2px; font-style:italic; color:#475569;">"${escapeHtml(itemComment || 'No comment recorded')}"</div>
            </td>
          `;
        }
      });

      const compResult = this._getVal(`Competency_Result_${comp.id}`);

      let partBResultLabel = '';
      if (comp.isCOCE) {
        partBResultLabel = '<span class="mbo-coce-badge">Evaluated / Excluded</span>';
      } else if (appraiserInfo.isFullyComplete) {
        partBResultLabel = `<span style="font-size:11px; color:#166534; font-weight:700;">Result: ${escapeHtml(compResult || '-')}</span>`;
      } else {
        partBResultLabel = '<span style="font-size:11px; color:#991b1b; font-weight:700;">Pending</span>';
      }

      const tr = document.createElement('tr');
      tr.dataset.compId = String(comp.id);
      tr.innerHTML = `
        <td class="sticky-col">
          <strong style="color:#0f172a; font-size:13px;">${escapeHtml(comp.nameTH)}</strong>
          <div style="font-size:11px; color:#64748b; margin-top:2px;">${escapeHtml(comp.desc)}</div>
        </td>
        ${slotCellsHtml}
        <td class="sticky-right" style="vertical-align:middle; text-align:center;">${partBResultLabel}</td>
      `;
      tbodyB.appendChild(tr);
    });

    partBContainer.appendChild(tableB);
    wrap.appendChild(partBContainer);

    // Score Completeness Summary Banner (Fail closed if incomplete R2-03)
    const scoreSummaryCard = document.createElement('div');
    scoreSummaryCard.className = 'mbo-wide-card';
    if (appraiserInfo.isFullyComplete) {
      scoreSummaryCard.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h3 style="margin:0; color:#166534; font-size:15px;">✅ สรุปการประเมินสมบูรณ์ / Evaluation Complete</h3>
            <p style="margin:4px 0 0 0; font-size:12.5px; color:#475569;">ผู้ประเมินทุกท่านลงคะแนนครบถ้วนแล้ว (Part A & Part B Required Data Complete)</p>
          </div>
          <div style="font-weight:700; font-size:14px; color:#166534; background:#dcfce7; padding:8px 16px; border-radius:6px;">
            Part A + Part B Verified Complete
          </div>
        </div>
      `;
    } else {
      scoreSummaryCard.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h3 style="margin:0; color:#991b1b; font-size:15px;">⏳ อยู่ระหว่างการลงคะแนน / Rating Incomplete</h3>
            <p style="margin:4px 0 0 0; font-size:12.5px; color:#475569;">อยู่ระหว่างการรวบรวมผลประเมินจากผู้ประเมิน (${appraiserInfo.completedCount}/${appraiserInfo.totalCount} Complete Slots)</p>
          </div>
          <div>
            <span class="mbo-pending-badge">⚠️ Combined Result Pending / Incomplete</span>
          </div>
        </div>
      `;
    }
    wrap.appendChild(scoreSummaryCard);

    return wrap;
  }

  _renderScreenHrFinal() {
    const wrap = document.createElement('div');

    const status = this._getVal('Status') || '15 HR Final Check';
    const isCompleted = status === '16 Completed';
    const appraiserInfo = normalizeAppraiserData(this.record, this.appraiserCount, this.previewOptions);

    const partAWeight = this._getVal('PartA_Weight') || this.previewOptions.partAWeight;
    const partBWeight = this._getVal('PartB_Weight') || this.previewOptions.partBWeight;

    const execSummaryCard = document.createElement('div');
    execSummaryCard.className = 'mbo-wide-card';
    execSummaryCard.style.borderTop = isCompleted ? '4px solid #166534' : '4px solid #0284c7';

    execSummaryCard.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:10px; margin-bottom:12px;">
        <div>
          <h2 style="margin:0; font-size:17px; color:${isCompleted ? '#166534' : '#0284c7'};">
            ${isCompleted ? '🎉 ผลการประเมินเสร็จสมบูรณ์ / MBO Evaluation Completed' : '🔍 ตรวจสอบขั้นสุดท้ายโดย HR / HR Final Check'}
          </h2>
          <span style="font-size:12px; color:#64748b;">
            ${isCompleted ? 'กระบวนการประเมินเสร็จสิ้นสมบูรณ์และถูกล็อกถาวร' : 'อยู่ระหว่างการตรวจสอบความถูกต้องและอนุมัติปิดรอบประเมินโดย HR'}
          </span>
        </div>
        <div style="text-align:right;">
          <span style="font-size:13px; font-weight:700; padding:4px 12px; border-radius:12px; background:${isCompleted ? '#dcfce7' : '#e0f2fe'}; color:${isCompleted ? '#166534' : '#0369a1'};">
            ${escapeHtml(status)}
          </span>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:12px; margin-bottom:14px;">
        <div style="background:#f8fafc; padding:10px; border-radius:6px; border:1px solid #e2e8f0;">
          <div style="font-size:11px; font-weight:700; color:#64748b;">Appraiser Completion</div>
          <div style="font-size:14px; font-weight:700; color:#0f172a; margin-top:2px;">
            ${appraiserInfo.completedCount} / ${appraiserInfo.totalCount} Appraisers (${appraiserInfo.completionPercent}%)
          </div>
        </div>
        <div style="background:#f8fafc; padding:10px; border-radius:6px; border:1px solid #e2e8f0;">
          <div style="font-size:11px; font-weight:700; color:#64748b;">Part A Weight (Objectives)</div>
          <div style="font-size:14px; font-weight:700; color:#0369a1; margin-top:2px;">${escapeHtml(partAWeight)}%</div>
        </div>
        <div style="background:#f8fafc; padding:10px; border-radius:6px; border:1px solid #e2e8f0;">
          <div style="font-size:11px; font-weight:700; color:#64748b;">Part B Weight (Competencies)</div>
          <div style="font-size:14px; font-weight:700; color:#0369a1; margin-top:2px;">${escapeHtml(partBWeight)}%</div>
        </div>
        <div style="background:#f8fafc; padding:10px; border-radius:6px; border:1px solid #e2e8f0;">
          <div style="font-size:11px; font-weight:700; color:#64748b;">Final Result Status</div>
          <div style="font-size:14px; font-weight:700; margin-top:2px;">
            ${appraiserInfo.isFullyComplete ? '<span style="color:#166534;">Verified & Complete</span>' : '<span style="color:#991b1b;">Pending / Incomplete</span>'}
          </div>
        </div>
      </div>
    `;

    wrap.appendChild(execSummaryCard);

    // Read-only Part A & Part B Breakdown (R3-03 Read-Only Result Context)
    const readOnlyBreakdown = this._renderReadOnlyAppraiserBreakdown(appraiserInfo);
    wrap.appendChild(readOnlyBreakdown);

    return wrap;
  }

  _renderReadOnlyAppraiserBreakdown(appraiserInfo) {
    const container = document.createElement('div');
    container.className = 'mbo-table-container';
    const compSetCode = this._getVal('Competency_Set_Code') || this.previewOptions.competencySetCode;
    const applicableCompList = getApplicableCompetencies(compSetCode);

    const count = parseObjectiveCount(this._getVal('Objective_Count'));
    if (count === null) {
      const errCard = document.createElement('div');
      errCard.style.padding = '20px';
      errCard.style.margin = '12px 0';
      errCard.style.background = '#fef2f2';
      errCard.style.border = '1px solid #fca5a5';
      errCard.style.borderRadius = '6px';
      errCard.style.color = '#991b1b';
      errCard.innerHTML = `
        <div style="font-size:15px; font-weight:700;">⚠️ ไม่พบข้อมูลจำนวนเป้าหมายที่ถูกต้อง (1..10) / Invalid Objective Count (1..10)</div>
        <div style="font-size:12.5px; margin-top:4px;">ค่า Objective_Count ในระเบียนข้อมูลเป็นค่าว่าง หรือไม่ถูกต้อง / Objective_Count is invalid or missing in record data.</div>
      `;
      container.appendChild(errCard);
      return container;
    }

    const bar = document.createElement('div');
    bar.className = 'mbo-table-header-bar';
    bar.innerHTML = `
      <span>📋 รายละเอียดผลประเมินย้อนหลัง / Evaluation Detail Breakdown (Read-Only)</span>
    `;
    container.appendChild(bar);

    const tableA = document.createElement('table');
    tableA.className = 'mbo-grid-table';

    let slotHeadersHtml = '';
    appraiserInfo.slots.forEach(s => {
      slotHeadersHtml += `<th style="width: 16%;">${escapeHtml(s.label)}</th>`;
    });

    tableA.innerHTML = `
      <thead>
        <tr>
          <th style="width: 40px; text-align: center;">#</th>
          <th style="width: 25%;">Part A Objectives</th>
          <th style="width: 20%;">Actual Result</th>
          ${slotHeadersHtml}
        </tr>
      </thead>
    `;

    const tbodyA = document.createElement('tbody');
    tableA.appendChild(tbodyA);

    for (let i = 1; i <= count; i++) {
      const objVal = this._getVal(`Objective_${i}`);
      const wVal = this._getVal(`Weight_${i}`) || '0';
      const actResult = this._getVal(`Actual_Result_${i}`);

      const mgrScore = this._getVal(`Manager_Objective_Score_${i}`);
      const gmScore = this._getVal(`GM_Objective_Score_${i}`);
      const avgScore = this._getVal(`Average_Objective_Score_${i}`);
      const mboPoint = this._getVal(`MBO_Point_${i}`);

      const midAttachHtml = this._getAttachmentHtml(`MidYear_Attachment_${i}`, this.previewOptions.midyearAttachments?.[i]);
      const selfAttachHtml = this._getAttachmentHtml(`Final_Attachment_${i}`, this.previewOptions.finalAttachments?.[i]);

      let slotCellsHtml = '';
      appraiserInfo.slots.forEach(s => {
        const ratingVal = s.partARatings[i] || '-';
        const commentVal = s.partAComments[i] || '-';
        slotCellsHtml += `
          <td style="font-size:12px;">
            <strong>Rating:</strong> L${escapeHtml(ratingVal)}<br/>
            <span style="color:#475569;">"${escapeHtml(commentVal)}"</span>
          </td>
        `;
      });

      let partAResultContext = '';
      if (appraiserInfo.isFullyComplete) {
        partAResultContext = `
          <div style="font-size:11px; color:#166534; background:#f0fdf4; padding:4px; border-radius:4px; border:1px solid #bbf7d0;">
            Avg: <strong>${escapeHtml(avgScore || '-')}</strong><br/>
            Point: <strong>${escapeHtml(mboPoint || '-')}</strong>
          </div>
        `;
      } else {
        partAResultContext = `
          <div style="font-size:11px; color:#991b1b; background:#fef2f2; padding:4px; border-radius:4px; border:1px solid #fecaca;">
            <span class="mbo-pending-badge">⚠️ Combined Result Pending / Incomplete</span>
          </div>
        `;
      }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="mbo-row-num-cell">${i}</td>
        <td>
          <strong style="color:#0f172a; font-size:13px;">#${i} ${escapeHtml(objVal)}</strong>
          <div style="font-size:11px; color:#0369a1; font-weight:700;">Weight: ${escapeHtml(wVal)}%</div>
        </td>
        <td>
          <div style="font-size:12px; color:#334155; background:#f8fafc; padding:4px; border-radius:4px;">${escapeHtml(actResult || '-')}</div>
          <div style="font-size:10px; color:#64748b; margin-top:2px;">Mid: ${midAttachHtml} | Self: ${selfAttachHtml}</div>
        </td>
        ${slotCellsHtml}
        <td style="vertical-align:middle; text-align:center;">${partAResultContext}</td>
      `;
      tbodyA.appendChild(tr);
    }

    container.appendChild(tableA);

    // Part B Competency Summary Table
    const tableB = document.createElement('table');
    tableB.className = 'mbo-grid-table';
    tableB.style.marginTop = '14px';

    tableB.innerHTML = `
      <thead>
        <tr>
          <th style="width: 30%;">Part B Competency Item</th>
          ${slotHeadersHtml}
        </tr>
      </thead>
    `;

    const tbodyB = document.createElement('tbody');
    tableB.appendChild(tbodyB);

    applicableCompList.forEach(comp => {
      const compResult = this._getVal(`Competency_Result_${comp.id}`);

      let slotCellsHtml = '';
      appraiserInfo.slots.forEach(s => {
        const ratingVal = s.partBRatings[comp.id] || '-';
        const commentVal = s.partBComments[comp.id] || '-';
        slotCellsHtml += `
          <td style="font-size:12px;">
            <strong>Score:</strong> L${escapeHtml(ratingVal)}<br/>
            <span style="color:#475569;">"${escapeHtml(commentVal)}"</span>
          </td>
        `;
      });

      let compResultBadge = '';
      if (comp.isCOCE) {
        compResultBadge = '<span class="mbo-coce-badge">Evaluated / Excluded</span>';
      } else if (appraiserInfo.isFullyComplete) {
        compResultBadge = `<span style="font-size:11px; color:#166534; font-weight:700;">Result: ${escapeHtml(compResult || '-')}</span>`;
      } else {
        compResultBadge = '<span style="font-size:11px; color:#991b1b; font-weight:700;">Pending</span>';
      }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <strong style="color:#0f172a; font-size:13px;">${escapeHtml(comp.nameTH)}</strong>
        </td>
        ${slotCellsHtml}
        <td style="vertical-align:middle; text-align:center;">${compResultBadge}</td>
      `;
      tbodyB.appendChild(tr);
    });

    container.appendChild(tableB);
    return container;
  }

  _getAttachmentHtml(fieldCode, fixtureArr) {
    const fileVal = this.record[fieldCode];
    let realFileList = [];
    if (fileVal && typeof fileVal === 'object' && Array.isArray(fileVal.value)) {
      realFileList = fileVal.value.map(f => f.name || f.fileKey || 'Attachment');
    }

    if (realFileList.length > 0) {
      return realFileList.map(fn => `<span class="mbo-attachment-chip">📄 ${escapeHtml(fn)}</span>`).join(' ');
    }
    if (this.isPreviewMode) {
      const fixtureFiles = fixtureArr || [`Evidence_${fieldCode}.pdf`];
      return fixtureFiles.map(fn => `<span class="mbo-attachment-chip" style="border-style:dashed;">📄 ${escapeHtml(fn)} (Preview)</span>`).join(' ');
    }
    return '<span style="color:#94a3b8; font-size:11px;">No attachment / ไม่มีไฟล์แนบ</span>';
  }

  syncFromDom() {
    if (!this.root) return;
    this.root.querySelectorAll('.mbo-field').forEach(input => {
      const code = input.dataset.code;
      if (code) {
        const val = input.value !== undefined ? input.value : '';
        this._setVal(code, val);
      }
    });
  }

  showValidationErrors(fieldErrors = []) {
    this.currentErrors = fieldErrors;
    this._renderInlineErrors(fieldErrors);
    this.focusFirstInvalidField(fieldErrors);
  }

  clearValidationErrors() {
    this.currentErrors = [];
    if (!this.root) return;
    const summaryAnchor = this.root.querySelector('#mbo-error-summary-anchor');
    if (summaryAnchor) summaryAnchor.innerHTML = '';
    this.root.querySelectorAll('.mbo-field').forEach(input => {
      this._refreshSingleFieldHighlight(input, this.root);
    });
  }

  focusFirstInvalidField(fieldErrors = []) {
    if (!this.root || !fieldErrors || fieldErrors.length === 0) return;
    const firstField = fieldErrors[0].field;
    if (!firstField) return;

    if (firstField === 'Employee_Code' && this.isCreate) {
      const empInput = this.root.querySelector('#mbo-lookup-emp-input');
      if (empInput) {
        empInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        requestAnimationFrame(() => empInput.focus());
      }
      return;
    }

    if (firstField === 'Total_Weight') {
      const weightBox = this.root.querySelector('#mbo-weight-summary-box');
      if (weightBox) {
        weightBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const input = this.root.querySelector(`.mbo-field[data-code="${firstField}"]`);
    if (input) {
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      requestAnimationFrame(() => {
        try {
          input.focus();
          if (typeof input.select === 'function') input.select();
        } catch (e) {}
      });
    }
  }

  _renderStatusGuidanceCard() {
    const card = document.createElement('div');

    const status = this.isCreate ? '01 Draft Objective' : (this._getVal('Status') || '01 Draft Objective');
    const rawTopology = this._getVal('Routing_Topology');
    const guidance = getStatusGuidance(status, rawTopology);

    const cardClass = guidance.isWarning ? 'mbo-guidance-warning' : 'mbo-guidance-info';

    card.className = `mbo-workflow-guidance-card ${cardClass}`;
    card.style.marginBottom = '14px';
    card.innerHTML = `
      <div class="mbo-guidance-header">
        <div class="mbo-guidance-status-pill">
          📌 สถานะปัจจุบัน / Current Status: <strong>${escapeHtml(status)}</strong>
        </div>
        <div class="mbo-guidance-notice">
          💡 การส่งเรื่อง / อนุมัติ / ดำเนินการขั้นตอนถัดไป กรุณากดปุ่มสั่งการด้านบนของ Kintone (Process action buttons)
        </div>
      </div>
      <div class="mbo-guidance-body">
        <div class="mbo-guidance-text-th">${escapeHtml(guidance.th)}</div>
        <div class="mbo-guidance-text-en">${escapeHtml(guidance.en)}</div>
      </div>
    `;
    return card;
  }

  _renderRouteContext() {
    const card = document.createElement('div');
    card.className = 'mbo-route-context-card';

    const rawTopology = this._getVal('Routing_Topology');
    const topInfo = classifyTopologyForUI(rawTopology);
    const appCount = Math.min(Math.max(parseInt(this.appraiserCount || 2, 10), 1), 4);

    const requesterUser = this._getValObj('Requester_User');
    const managerUser = this._getValObj('Manager_User');
    const gmUser = this._getValObj('GM_User');
    const firstManagerUser = this._getValObj('First_Manager_User');

    const pos = this._getVal('Employee_Position') || '-';
    const sec = this._getVal('Employee_Section') || '-';
    const team = this._getVal('Team') || '-';
    const routingKey = this._getVal('Routing_Key') || sec;

    let topologyBadgeHtml = '';
    if (!topInfo.isCanonical) {
      topologyBadgeHtml = `<span class="mbo-route-topology-badge" style="background: #fef2f2; color: #dc2626;">Technical Details: ⚠️ Unrecognized Topology (${escapeHtml(topInfo.raw || 'Not Specified')})</span>`;
    } else if (topInfo.isG2) {
      topologyBadgeHtml = `<span class="mbo-route-topology-badge" style="background: #fffbe6; color: #b45309;">Technical Details: ⚠️ Unsupported in V1 (${escapeHtml(topInfo.raw)})</span>`;
    } else {
      topologyBadgeHtml = `<span class="mbo-route-topology-badge">Technical Details: ${escapeHtml(topInfo.raw)} (${appCount} Slots) | Pos: ${escapeHtml(pos)} | Sec: ${escapeHtml(sec)}${team !== '-' ? ` | Team: ${escapeHtml(team)}` : ''} | Rule: ${escapeHtml(routingKey)} | Source: App795</span>`;
    }

    if (!topInfo.isSupportedV1) {
      card.innerHTML = `
        <div class="mbo-route-title">
          <span>🔗 เส้นทางผู้ประเมินและอนุมัติ / Evaluation & Approval Route</span>
          ${topologyBadgeHtml}
        </div>
        <div style="padding: 10px; background: #fffbe6; border: 1px solid #ffe58f; border-radius: 4px; font-size: 12.5px; color: #b45309;">
          ⚠️ <strong>ไม่อยู่ในเส้นทางอนุมัติมาตรฐาน V1 / Unsupported V1 Approval Route</strong><br/>
          ${topInfo.isG2
            ? `เส้นทาง ${escapeHtml(topInfo.raw)} ยังไม่เปิดใช้งานในระบบ MBO V1 ปัจจุบัน (รองรับ M1_G1 และ M1_M2_G1 เท่านั้น)`
            : `ข้อมูล Routing Topology (${escapeHtml(topInfo.raw || 'ว่าง')}) ไม่ถูกต้องตามระเบียบประเมิน`}
        </div>
      `;
      return card;
    }

    const status = this.isCreate ? '01 Draft Objective' : (this._getVal('Status') || '01 Draft Objective');
    const macroStage = getMacroStage(status);

    const steps = [
      {
        slotIndex: 0,
        roleTH: 'พนักงาน',
        roleEN: 'Employee',
        userName: formatUserDisplay(requesterUser) !== '-' ? formatUserDisplay(requesterUser) : (this._getVal('Employee_Name') || 'Requester Employee'),
        statusBadge: macroStage === 1 ? 'กำลังดำเนินการ / Current' : 'ตรวจสอบแล้ว / Reviewed'
      },
      {
        slotIndex: 1,
        roleTH: 'ผู้ประเมินลำดับที่ 1',
        roleEN: '1st Appraiser',
        userName: formatUserDisplay(managerUser) !== '-' ? formatUserDisplay(managerUser) : '1st Appraiser',
        statusBadge: macroStage === 4 ? 'ให้คะแนนแล้ว / Scored' : (macroStage > 1 ? 'ตรวจสอบแล้ว / Reviewed' : 'รอดำเนินการ / Waiting')
      }
    ];

    if (appCount >= 2) {
      steps.push({
        slotIndex: 2,
        roleTH: 'ผู้ประเมินลำดับที่ 2',
        roleEN: '2nd Appraiser',
        userName: formatUserDisplay(gmUser) !== '-' ? formatUserDisplay(gmUser) : '2nd Appraiser',
        statusBadge: macroStage === 4 ? 'ให้คะแนนแล้ว / Scored' : (macroStage > 1 ? 'ตรวจสอบแล้ว / Reviewed' : 'รอดำเนินการ / Waiting')
      });
    }

    if (appCount >= 3) {
      steps.push({
        slotIndex: 3,
        roleTH: 'ผู้ประเมินลำดับที่ 3',
        roleEN: '3rd Appraiser',
        userName: formatUserDisplay(firstManagerUser) !== '-' ? formatUserDisplay(firstManagerUser) : (this.previewOptions.slot3Name || '3rd Appraiser (Preview)'),
        statusBadge: macroStage === 4 ? 'ให้คะแนนแล้ว / Scored' : (macroStage > 1 ? 'ตรวจสอบแล้ว / Reviewed' : 'รอดำเนินการ / Waiting')
      });
    }

    if (appCount >= 4) {
      steps.push({
        slotIndex: 4,
        roleTH: 'ผู้ประเมินลำดับที่ 4',
        roleEN: '4th Appraiser',
        userName: this.previewOptions.slot4Name || '4th Appraiser (Preview)',
        statusBadge: macroStage === 4 ? 'ให้คะแนนแล้ว / Scored' : (macroStage > 1 ? 'ตรวจสอบแล้ว / Reviewed' : 'รอดำเนินการ / Waiting')
      });
    }

    steps.push({
      slotIndex: 5,
      roleTH: 'HR Final Check',
      roleEN: 'HR Final / HR Admin',
      userName: 'ฝ่ายทรัพยากรบุคคล / HR Control Center',
      statusBadge: status === '16 Completed' ? 'เสร็จแล้ว / Completed' : (status === '15 HR Final Check' ? 'กำลังดำเนินการ / Current' : 'รอดำเนินการ / Waiting')
    });

    const routeStepsHtml = steps.map(s => `
      <div class="mbo-route-step ${s.slotIndex === this.activeSlotIndex ? 'active-slot' : ''}">
        <div style="font-size: 11px; font-weight: 700; color: #475569;">${escapeHtml(s.roleTH)} / ${escapeHtml(s.roleEN)}</div>
        <div class="mbo-route-user" style="font-size: 12.5px; font-weight: 700; color: #0f172a; margin: 2px 0;">${escapeHtml(s.userName)}</div>
        <div style="font-size: 10.5px; color: #0284c7; font-weight: 600;">[${escapeHtml(s.statusBadge)}]</div>
      </div>
    `).join('');

    card.innerHTML = `
      <div class="mbo-route-title">
        <span>🔗 เส้นทางผู้ประเมินและอนุมัติ / Evaluation & Approval Route</span>
        ${topologyBadgeHtml}
      </div>
      <div class="mbo-route-grid">
        ${routeStepsHtml}
      </div>
    `;
    return card;
  }

  _renderCollapsibleLegendAndGuidelines() {
    const card = document.createElement('div');
    card.className = 'mbo-collapsible-card';
    card.innerHTML = `
      <details class="mbo-details" open>
        <summary class="mbo-summary">
          <span>📌 คำอธิบายสถานะช่องข้อมูลและเกณฑ์อ้างอิง / Field Legend & Rating Guidelines</span>
          <span class="mbo-summary-hint">(กดเพื่อซ่อน/แสดง / Click to toggle)</span>
        </summary>
        <div class="mbo-details-body">
          <div class="mbo-legend-row">
            <div class="mbo-legend-title">สถานะช่องข้อมูล / Field State Key:</div>
            <div class="mbo-legend-items">
              <span class="mbo-legend-chip mbo-chip-editable">🟢 กรอกได้ / Editable</span>
              <span class="mbo-legend-chip mbo-chip-required">🟡 ต้องกรอก / Required</span>
              <span class="mbo-legend-chip mbo-chip-system">🔵 ข้อมูลจากระบบ / System Data</span>
              <span class="mbo-legend-chip mbo-chip-locked">⚪ ระบบล็อก / Locked</span>
              <span class="mbo-legend-chip mbo-chip-error">🔴 ไม่ถูกต้อง / Invalid</span>
            </div>
          </div>
          <div class="mbo-guideline-row">
            <div class="mbo-guideline-col">
              <strong>ระดับความยาก / Difficulty Level [1-4]:</strong><br/>
              Level 4: Challenging (ท้าทายมาก) | Level 3: Difficult (ยาก) | Level 2: Achievable normal (ปานกลาง) | Level 1: Easily achievable (ง่าย)
            </div>
            <div class="mbo-guideline-col">
              <strong>ระดับผลงาน / Achievement Level [1-5]:</strong><br/>
              Level 5: Remarkable (สูงสุด) | Level 4: Exceeding (เกินเป้า) | Level 3: Fully meet (ตามเป้า) | Level 2: Partially meet (บางส่วน) | Level 1: Rarely meet (ต่ำกว่าเป้า)
            </div>
          </div>
        </div>
      </details>
    `;
    return card;
  }

  _renderInlineErrors(fieldErrors = []) {
    if (!this.root) return;
    const summaryAnchor = this.root.querySelector('#mbo-error-summary-anchor');
    if (!summaryAnchor) return;

    if (fieldErrors.length === 0) {
      summaryAnchor.innerHTML = '';
      return;
    }

    const errorCount = fieldErrors.length;
    const summaryCard = document.createElement('div');
    summaryCard.className = 'mbo-error-summary-card';

    summaryCard.innerHTML = `
      <div class="mbo-error-summary-header">
        <span>⚠️ พบข้อมูลที่ต้องแก้ไข ${errorCount} รายการ / ${errorCount} items require correction</span>
      </div>
      <div class="mbo-error-summary-list">
        ${fieldErrors.map((err, idx) => `
          <button type="button" class="mbo-error-item-btn" data-field="${escapeHtml(err.field)}">
            <span class="mbo-error-item-num">${idx + 1}</span>
            <div class="mbo-error-item-text">
              <div>${escapeHtml(err.messageTH)}</div>
              <div class="en-sub">${escapeHtml(err.messageEN)}</div>
            </div>
          </button>
        `).join('')}
      </div>
    `;

    summaryCard.querySelectorAll('.mbo-error-item-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const field = btn.dataset.field;
        this.focusFirstInvalidField([{ field }]);
      });
    });

    summaryAnchor.innerHTML = '';
    summaryAnchor.appendChild(summaryCard);

    fieldErrors.forEach(err => {
      if (err.field === 'Total_Weight') {
        const box = this.root.querySelector('#mbo-weight-summary-box');
        if (box) box.className = 'mbo-weight-summary invalid';
        return;
      }

      if (err.field === 'Employee_Code' && this.isCreate) {
        const empInput = this.root.querySelector('#mbo-lookup-emp-input');
        if (empInput) {
          empInput.classList.remove('mbo-field-state-editable');
          empInput.classList.add('mbo-field-state-error');
        }
        return;
      }

      const input = this.root.querySelector(`.mbo-field[data-code="${err.field}"]`);
      if (input) {
        input.classList.remove('mbo-field-state-editable', 'mbo-field-state-required-empty');
        input.classList.add('mbo-field-state-error');

        const tagEl = this.root.querySelector(`.mbo-cell-tag[data-target="${err.field}"]`);
        if (tagEl) {
          const msgThFormatted = escapeHtml(err.messageTH || '').replace(/\n/g, '<br/>');
          const msgEnFormatted = escapeHtml(err.messageEN || '').replace(/\n/g, '<br/>');
          tagEl.innerHTML = `
            <span class="mbo-cell-error-msg">
              ❌ ${msgThFormatted}<br/>
              <span style="opacity: 0.85; font-size: 11px;">${msgEnFormatted}</span>
            </span>
          `;
        }
      }
    });
  }

  _renderErrorBanner(msg) {
    const banner = document.createElement('div');
    banner.className = 'mbo-alert-banner mbo-alert-error';
    banner.innerHTML = `⚠️ <span>${msg}</span>`;
    return banner;
  }

  _renderLookupSection() {
    const box = document.createElement('div');
    box.className = 'mbo-header-card';
    box.style.borderTopColor = this.isEmployeeVerified ? '#059669' : '#0284c7';
    box.style.background = this.isEmployeeVerified ? '#f0fdf4' : '#f0f9ff';

    const empCode = this._getVal('Employee_Code');
    const badgeText = this.isEmployeeVerified
      ? '<span style="color: #059669; font-weight: 700;">✓ ยืนยันข้อมูลพนักงานแล้ว / Employee verified</span>'
      : '<span style="color: #0284c7; font-weight: 600;">(กรุณาระบุรหัสพนักงานและกดค้นหา / Please enter Employee ID)</span>';

    box.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <div style="font-size: 14px; font-weight: 700; color: #0f172a;">
          STEP 1: ระบุพนักงาน / Identify Employee (App 53)
        </div>
        <div style="font-size: 13px;">${badgeText}</div>
      </div>
      <div style="display: flex; gap: 10px; align-items: center; max-width: 650px;">
        <input type="text" id="mbo-lookup-emp-input" class="mbo-cell-input mbo-field-state-editable" placeholder="กรอกรหัสพนักงาน เช่น 0149 / Enter Employee ID..." value="${escapeHtml(empCode)}" style="flex: 1; font-weight: 600;" />
        <button type="button" id="mbo-lookup-btn" style="background: #0284c7; color: white; border: none; padding: 0 18px; height: 36px; border-radius: 4px; font-weight: 600; cursor: pointer;">
          ค้นหาพนักงาน / Search
        </button>
      </div>
      <div id="mbo-lookup-msg" style="font-size: 12px; margin-top: 6px;"></div>
    `;
    return box;
  }

  _renderHeader() {
    const card = document.createElement('div');
    card.className = 'mbo-header-card';

    const fy = this._getVal('Fiscal_Year') || 'FY2026';
    const status = this.isCreate ? 'NEW RECORD (กำลังสร้าง)' : (this._getVal('Status') || '01 Draft Objective');

    const empCode = this._getVal('Employee_Code');
    const empName = this._getVal('Employee_Name');
    const empSection = this._getVal('Employee_Section');
    const empPosition = this._getVal('Employee_Position');
    const empDept = this._getVal('Employee_Department');
    const empStartDate = this._getVal('Employee_Start_Date');

    card.innerHTML = `
      <div class="mbo-title-bar">
        <h1 class="mbo-main-title">
          แบบประเมินผลการปฏิบัติงาน / Management By Objectives (MBO)
          <span class="mbo-fy-badge">${escapeHtml(fy)}</span>
        </h1>
        <div class="mbo-status-badge">${escapeHtml(status)}</div>
      </div>
      <div style="font-size: 13px; font-weight: 700; color: #475569; margin-bottom: 8px;">
        STEP 2: ข้อมูลพนักงาน / Employee Information [🔵 ระบบ / System Data]
      </div>
      <div class="mbo-profile-grid-horizontal">
        <div class="mbo-profile-item">
          <span class="mbo-profile-label">รหัส / Emp. ID</span>
          <div class="mbo-profile-value" id="mbo-header-emp-code" title="${escapeHtml(empCode)}">${escapeHtml(empCode) || '-'}</div>
        </div>
        <div class="mbo-profile-item">
          <span class="mbo-profile-label">ชื่อ-นามสกุล / Name</span>
          <div class="mbo-profile-value" id="mbo-header-emp-name" title="${escapeHtml(empName)}">${escapeHtml(empName) || '-'}</div>
        </div>
        <div class="mbo-profile-item">
          <span class="mbo-profile-label">ส่วนงาน / Section</span>
          <div class="mbo-profile-value" id="mbo-header-emp-section" title="${escapeHtml(empSection)}">${escapeHtml(empSection) || '-'}</div>
        </div>
        <div class="mbo-profile-item">
          <span class="mbo-profile-label">ตำแหน่ง / Position</span>
          <div class="mbo-profile-value" id="mbo-header-emp-position" title="${escapeHtml(empPosition)}">${escapeHtml(empPosition) || '-'}</div>
        </div>
        <div class="mbo-profile-item">
          <span class="mbo-profile-label">แผนก / Department</span>
          <div class="mbo-profile-value" id="mbo-header-emp-dept" title="${escapeHtml(empDept)}">${escapeHtml(empDept) || '-'}</div>
        </div>
        <div class="mbo-profile-item">
          <span class="mbo-profile-label">วันเริ่มงาน / Start Date</span>
          <div class="mbo-profile-value" id="mbo-header-emp-start-date" title="${escapeHtml(empStartDate)}">${escapeHtml(empStartDate) || '-'}</div>
        </div>
      </div>
    `;
    return card;
  }

  _renderHoshin() {
    const grid = document.createElement('div');
    grid.className = 'mbo-hoshin-grid';

    const deptHoshin = this._getVal('Department_Hoshin');
    const secHoshin = this._getVal('Section_Hoshin');

    grid.innerHTML = `
      <div class="mbo-hoshin-box">
        <h2 class="mbo-hoshin-title">
          <span>เป้าหมายแผนก / Department's Hoshin</span>
          <span class="mbo-hoshin-subtitle">(Set up by Dept. Manager) [🔵 ระบบ / System]</span>
        </h2>
        <div class="mbo-hoshin-content" id="mbo-dept-hoshin-view">${escapeHtml(deptHoshin) || '(No Department Hoshin set)'}</div>
      </div>
      <div class="mbo-hoshin-box">
        <h2 class="mbo-hoshin-title">
          <span>เป้าหมายส่วนงาน / Section's Hoshin</span>
          <span class="mbo-hoshin-subtitle">(Set up by Sect. Manager) [🔵 ระบบ / System]</span>
        </h2>
        <div class="mbo-hoshin-content" id="mbo-sec-hoshin-view">${escapeHtml(secHoshin) || '(No Section Hoshin set)'}</div>
      </div>
    `;
    return grid;
  }

  _renderWeightSummary() {
    const summary = document.createElement('div');
    summary.id = 'mbo-weight-summary-box';
    summary.className = 'mbo-weight-summary valid';
    summary.innerHTML = `
      <div class="mbo-weight-text" id="mbo-weight-calc-text">ผลรวมน้ำหนัก / Total Weight: 0%</div>
      <div class="mbo-weight-status" id="mbo-weight-calc-status">Checking...</div>
    `;
    return summary;
  }

  _bindEvents(root) {
    root.querySelectorAll('.mbo-field').forEach(input => {
      input.addEventListener('input', (e) => {
        const code = e.target.dataset.code;
        const val = e.target.value;
        this._setVal(code, val);
        this.onFieldChange(code, val);

        if (this.currentErrors && this.currentErrors.length > 0) {
          this.currentErrors = this.currentErrors.filter(err => err.field !== code);
          this._renderInlineErrors(this.currentErrors);
        }

        this._refreshSingleFieldHighlight(e.target, root);

        if (code.startsWith('Weight_')) {
          this._updateTotalWeightDisplay();
        }
        if (code.startsWith('Progress_Percent_')) {
          const row = e.target.closest('td') || e.target.closest('div');
          const fill = row?.querySelector('.mbo-progress-bar-fill');
          if (fill) fill.style.width = `${val}%`;
          const lbl = row?.querySelector('label strong');
          if (lbl) lbl.textContent = `${val}%`;
        }
      });
    });

    if (this.isPreviewMode) {
      root.querySelectorAll('[data-preview-slot]').forEach(input => {
        input.addEventListener('change', (e) => {
          const slotIdx = e.target.dataset.previewSlot;
          const tagName = e.target.tagName.toLowerCase();
          const val = e.target.value;

          if (!this.previewOptions[`slot${slotIdx}RatingsA`]) this.previewOptions[`slot${slotIdx}RatingsA`] = {};
          if (!this.previewOptions[`slot${slotIdx}CommentsA`]) this.previewOptions[`slot${slotIdx}CommentsA`] = {};
          if (!this.previewOptions[`slot${slotIdx}RatingsB`]) this.previewOptions[`slot${slotIdx}RatingsB`] = {};
          if (!this.previewOptions[`slot${slotIdx}CommentsB`]) this.previewOptions[`slot${slotIdx}CommentsB`] = {};

          const objRow = e.target.closest('[data-obj-index]');
          const compRow = e.target.closest('[data-comp-id]');

          if (objRow) {
            const objIndex = objRow.dataset.objIndex;
            if (tagName === 'select') this.previewOptions[`slot${slotIdx}RatingsA`][objIndex] = val;
            if (tagName === 'textarea') this.previewOptions[`slot${slotIdx}CommentsA`][objIndex] = val;
          } else if (compRow) {
            const compId = compRow.dataset.compId;
            if (tagName === 'select') this.previewOptions[`slot${slotIdx}RatingsB`][compId] = val;
            if (tagName === 'textarea') this.previewOptions[`slot${slotIdx}CommentsB`][compId] = val;
          }
        });
      });
    }

    const countSelect = root.querySelector('#mbo-obj-count-select');
    if (countSelect) {
      countSelect.addEventListener('change', (e) => {
        const count = e.target.value;
        this._setVal('Objective_Count', count);
        this.onFieldChange('Objective_Count', count);
        ValidationEngine.clearInactiveRows(this.record);
        this.render();
      });
    }

    const lookupInput = root.querySelector('#mbo-lookup-emp-input');
    if (lookupInput) {
      lookupInput.addEventListener('input', (e) => {
        const newCode = e.target.value.trim();
        const oldCode = this._getVal('Employee_Code');
        if (newCode !== oldCode) {
          this.isEmployeeVerified = false;
          this.onEmployeeCodeChanged(newCode);
          const msgEl = root.querySelector('#mbo-lookup-msg');
          if (msgEl) msgEl.innerHTML = '<span style="color: #b45309;">⚠️ มีการแก้ไขรหัสพนักงาน กรุณากดค้นหาใหม่ / Employee code changed. Please re-search.</span>';
        }
      });

      lookupInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const lookupBtn = root.querySelector('#mbo-lookup-btn');
          if (lookupBtn) lookupBtn.click();
        }
      });
    }

    const lookupBtn = root.querySelector('#mbo-lookup-btn');
    if (lookupBtn && lookupInput) {
      lookupBtn.addEventListener('click', async () => {
        const code = lookupInput.value.trim();
        const msgEl = root.querySelector('#mbo-lookup-msg');
        if (!code) {
          if (msgEl) msgEl.innerHTML = '<span style="color: #dc2626;">กรุณาระบุรหัสพนักงาน / Please enter Employee ID</span>';
          return;
        }

        if (msgEl) msgEl.innerHTML = '<span style="color: #0369a1;">กำลังค้นหาข้อมูลจาก App 53 และตรวจสอบสิทธิ์... / Searching App 53 & verifying access...</span>';
        try {
          await this.executeLookup(code);
        } catch (err) {
          // Handled inside executeLookup
        }
      });
    }
  }

  async executeLookup(empCode) {
    const code = String(empCode || '').trim();
    if (!code) return;
    this.isEmployeeVerified = false;
    if (typeof this.onEmployeeCodeChanged === 'function') {
      this.onEmployeeCodeChanged(code);
    }
    try {
      await this.onLookupEmployee(code);
      this.isEmployeeVerified = true;
      this.clearValidationErrors();
      this.render();
    } catch (err) {
      this.isEmployeeVerified = false;
      this.render();
      const newMsgEl = this.root ? this.root.querySelector('#mbo-lookup-msg') : null;
      if (newMsgEl) {
        const formattedMsg = escapeHtml(err.message || '').replace(/\n/g, '<br/>');
        newMsgEl.innerHTML = `<div style="color: #dc2626; line-height: 1.4; padding: 6px 0;">❌ ${formattedMsg}</div>`;
      }
      throw err;
    }
  }

  _refreshAllFieldHighlights(root) {
    root.querySelectorAll('.mbo-field').forEach(input => {
      this._refreshSingleFieldHighlight(input, root);
    });
  }

  _refreshSingleFieldHighlight(input, root) {
    const code = input.dataset.code;
    const isReadonly = input.readOnly || input.disabled;
    const val = input.value?.trim() || '';
    const isRequired = input.dataset.required === 'true';

    const isErr = this.currentErrors && this.currentErrors.some(err => err.field === code);

    input.classList.remove(
      'mbo-field-state-editable',
      'mbo-field-state-required-empty',
      'mbo-field-state-locked',
      'mbo-field-state-error'
    );

    const tagEl = root.querySelector(`.mbo-cell-tag[data-target="${code}"]`);

    if (isErr) {
      input.classList.add('mbo-field-state-error');
      return;
    }

    if (isReadonly) {
      input.classList.add('mbo-field-state-locked');
      if (tagEl) tagEl.innerHTML = '<span style="color: #64748b;">⚪ [ล็อก / Locked]</span>';
    } else {
      if (isRequired && !val) {
        input.classList.add('mbo-field-state-required-empty');
        if (tagEl) tagEl.innerHTML = '<span style="color: #854d0e;">🟡 [ต้องกรอก / Required]</span>';
      } else {
        input.classList.add('mbo-field-state-editable');
        if (tagEl) tagEl.innerHTML = '<span style="color: #166534;">🟢 [กรอกได้ / Editable]</span>';
      }
    }
  }

  _updateTotalWeightDisplay() {
    const count = parseObjectiveCount(this._getVal('Objective_Count'));
    const box = document.getElementById('mbo-weight-summary-box');
    const txt = document.getElementById('mbo-weight-calc-text');
    const st = document.getElementById('mbo-weight-calc-status');
    if (!box || !txt || !st) return;

    if (count === null) {
      box.className = 'mbo-weight-summary invalid';
      txt.textContent = 'ผลรวมน้ำหนัก / Total Weight: Invalid Objective_Count (1..10)';
      st.textContent = '❌ Invalid Count';
      return;
    }

    let total = 0;
    const parts = [];
    for (let i = 1; i <= count; i++) {
      const w = parseFloat(this._getVal(`Weight_${i}`) || '0');
      total += isNaN(w) ? 0 : w;
      parts.push(`${w || 0}%`);
    }

    txt.textContent = `ผลรวมน้ำหนัก / Total Weight: ${parts.join(' + ')} = ${total}%`;
    if (Math.round(total) === 100) {
      box.className = 'mbo-weight-summary valid';
      st.innerHTML = '✅ ครบ 100% สมบูรณ์ / Complete (100%)';
    } else {
      box.className = 'mbo-weight-summary invalid';
      st.innerHTML = `❌ ไม่ถูกต้อง: ผลรวมต้องเท่ากับ 100% (ขาด/เกิน ${Math.abs(100 - total)}%) / Must equal 100%`;
    }
  }

  _getValObj(code) {
    const field = this.record[code];
    if (field && typeof field === 'object' && Array.isArray(field.value)) {
      return field.value;
    }
    return [];
  }

  _getVal(code) {
    const field = this.record[code];
    if (field === null || field === undefined) return '';
    if (typeof field === 'object' && 'value' in field) {
      return field.value !== null && field.value !== undefined ? String(field.value) : '';
    }
    return String(field);
  }

  _setVal(code, val) {
    if (this.record[code] && typeof this.record[code] === 'object') {
      this.record[code].value = val;
    }
  }
}


  /**
 * TTMET MBO V2 - Main Entry Point for Kintone Customization
 */









let activeUiInstance = null;

function getActiveUiInstance() {
  return activeUiInstance;
}

function isSemanticValueMatch(valA, valB, fieldType) {
  if (valA === valB) return true;

  if (Array.isArray(valA) && Array.isArray(valB)) {
    if (valA.length !== valB.length) return false;
    return valA.every((item, idx) => {
      const bItem = valB[idx];
      if (typeof item === 'object' && item !== null && typeof bItem === 'object' && bItem !== null) {
        return item.code === bItem.code;
      }
      return item === bItem;
    });
  }

  if (fieldType === 'NUMBER' || typeof valA === 'number' || typeof valB === 'number') {
    const numA = Number(valA);
    const numB = Number(valB);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA === numB;
    }
  }

  const strA = String(valA ?? '').trim();
  const strB = String(valB ?? '').trim();
  return strA === strB;
}

function syncRecordToKintone(record, options = {}) {
  const requireVerifiedPersistence = options.requireVerifiedPersistence === true;
  const requiredFields = Array.isArray(options.requiredFields) ? options.requiredFields : [];

  if (typeof kintone === 'undefined' || !kintone.app || !kintone.app.record) {
    if (requireVerifiedPersistence) {
      throw new Error('Kintone record API is unavailable (kintone.app.record missing)');
    }
    return false;
  }

  if (typeof kintone.app.record.get !== 'function' || typeof kintone.app.record.set !== 'function') {
    if (requireVerifiedPersistence) {
      throw new Error('Kintone record get/set API functions are unavailable');
    }
    return false;
  }

  const currentData = kintone.app.record.get();
  if (!currentData || !currentData.record) {
    if (requireVerifiedPersistence) {
      throw new Error('Current Kintone form record object is unavailable');
    }
    return false;
  }

  const kintoneRecord = currentData.record;

  // 1. Verify required destination fields exist in Kintone form schema
  if (requireVerifiedPersistence) {
    for (const fieldCode of requiredFields) {
      if (!kintoneRecord[fieldCode]) {
        throw new Error(`ไม่พบช่องข้อมูล ${fieldCode} ในแบบฟอร์ม (App 794)\nField ${fieldCode} does not exist on Kintone form schema.`);
      }
    }
  }

  // 2. Clone record and copy matching source values
  const targetRecord = JSON.parse(JSON.stringify(kintoneRecord));
  Object.keys(record).forEach(k => {
    if (targetRecord[k] && record[k] && record[k].value !== undefined) {
      targetRecord[k].value = record[k].value;
    }
  });

  // 3. Perform kintone.app.record.set
  try {
    kintone.app.record.set({ record: targetRecord });
  } catch (e) {
    if (requireVerifiedPersistence) {
      throw new Error(`kintone.app.record.set failed: ${e.message}`);
    }
    console.warn('[MBO V2] syncRecordToKintone warning:', e);
    return false;
  }

  // 4. Post-set read-back verification
  if (requireVerifiedPersistence) {
    const postSetData = kintone.app.record.get();
    const postSetRecord = postSetData?.record;

    if (!postSetRecord) {
      throw new Error('Post-set Kintone form record read-back failed');
    }

    for (const fieldCode of requiredFields) {
      const sourceVal = record[fieldCode]?.value;
      const readBackVal = postSetRecord[fieldCode]?.value;
      const fieldType = postSetRecord[fieldCode]?.type;

      if (!isSemanticValueMatch(sourceVal, readBackVal, fieldType)) {
        throw new Error(`Form state read-back mismatch for field ${fieldCode}: expected ${JSON.stringify(sourceVal)}, got ${JSON.stringify(readBackVal)}`);
      }
    }
  }

  return true;
}

if (typeof kintone !== 'undefined') {
  const ROUTING_APP_ID = 795;
  const EMPLOYEE_APP_ID = 53;
  const SCORING_APP_ID = 796;

  function getMboAppId() {
    return kintone.app.getId() || 794;
  }

  const kintoneApiWrapper = {
    getRecords: async (appId, query) => {
      const resp = await kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', {
        app: appId,
        query: query
      });
      return resp;
    }
  };

  function hideAllNativeFields(record) {
    Object.keys(record).forEach(code => {
      try {
        kintone.app.record.setFieldShown(code, false);
      } catch (e) {
        // ignore system fields that cannot be hidden
      }
    });
  }

  /**
   * Resolve Business Stage based on Event Type and Workflow Status
   * On Create: Returns NEW_RECORD without reading Process Management Status
   * On Edit/Detail: Reads Process Status from saved record
   */
  function resolveBusinessStage(event) {
    if (event.type === 'app.record.create.show' || event.type === 'app.record.create.submit') {
      return BUSINESS_STAGES.NEW_RECORD;
    }

    const status = event.record?.Status?.value || '';
    if (STATUS_TO_STAGE_MAP[status] !== undefined) {
      return STATUS_TO_STAGE_MAP[status];
    }
    return BUSINESS_STAGES.CONFIGURATION_ERROR;
  }





  // Hook 1: Record Show (Detail, Edit, Create)
  kintone.events.on(['app.record.detail.show', 'app.record.edit.show', 'app.record.create.show'], function (event) {
    const record = event.record;
    const isCreate = event.type === 'app.record.create.show';
    const isEdit = event.type === 'app.record.edit.show';
    const isDetail = event.type === 'app.record.detail.show';

    // 1. Resolve UI host element safely
    const uiHost = getRecordUiHost('SPACE_HEADER');
    if (!uiHost) {
      console.warn('[MBO V2] Custom UI host element not found. Retaining native form.');
      return event;
    }

    const stage = resolveBusinessStage(event);

    // Default Fiscal Year on Create - safely mutating .value only
    if (isCreate && record.Fiscal_Year && !record.Fiscal_Year.value) {
      record.Fiscal_Year.value = 'FY2026';
    }

    // 2. Instantiate and render Custom UI
    const options = {
      container: uiHost,
      record: record,
      stage: stage,
      isEditable: isCreate || isEdit,
      isCreate: isCreate,
      onFieldChange: (code, val) => {
        if (record[code]) {
          record[code].value = val;
        }
        syncRecordToKintone(record);
      },
      onEmployeeCodeChanged: (newCode) => {
        const USER_SELECT_FIELDS = new Set([
          'Requester_User',
          'Manager_Level1_Approvers',
          'Manager_Level2_Approvers',
          'GM_Level1_Approvers',
          'GM_Level2_Approvers',
          'First_Manager_User',
          'Manager_User',
          'GM_User'
        ]);

        const fieldsToClear = [
          'Employee_Name', 'Employee_Name_TH', 'Employee_Section',
          'Employee_Department', 'Employee_Position', 'Employee_Email',
          'Employee_Start_Date', 'Department_Hoshin', 'Section_Hoshin', 'Record_Key',
          'Manager_Level1_Approvers', 'Manager_Level2_Approvers',
          'GM_Level1_Approvers', 'GM_Level2_Approvers',
          'Has_Manager_Level2', 'Has_GM_Level2', 'Routing_Topology',
          'First_Manager_User', 'Manager_User', 'GM_User', 'Requester_User'
        ];
        if (record.Employee_Code) record.Employee_Code.value = newCode;
        fieldsToClear.forEach(k => {
          if (record[k]) {
            record[k].value = USER_SELECT_FIELDS.has(k) ? [] : '';
          }
        });
        syncRecordToKintone(record);
      },
      onLookupEmployee: async (empCode) => {
        // Step 1: Employee Lookup from App 53 (Read-Only)
        const empLookupRes = await EmployeeService.lookupEmployee(empCode, kintoneApiWrapper);
        const empProfile = empLookupRes.employee || empLookupRes;

        // Step 2: Routing Validation from App 795 (Team-Aware + Position Priority)
        const loginUser = kintone.getLoginUser();
        const routing = await RoutingService.validateRequesterAccess(
          ROUTING_APP_ID,
          empProfile.Employee_Section,
          empProfile.Team,
          loginUser.code,
          kintoneApiWrapper,
          empProfile.Employee_Position
        );

        // Step 3: Published Scoring Configuration Lookup from App 796
        const fy = record.Fiscal_Year?.value || 'FY2026';
        let scoringConfig = null;
        try {
          const profileCode = resolveProfileCode(empProfile);
          const scoringQuery = `Profile_Code = "${profileCode}" and Config_Status in ("PUBLISHED") and Fiscal_Year = "${fy}" limit 2`;
          const scoringRes = await kintoneApiWrapper.getRecords(SCORING_APP_ID, scoringQuery);
          const scoringRecords = scoringRes?.records || [];

          if (scoringRecords.length === 0) {
            throw new Error(`ไม่พบการตั้งค่า Scoring Master (App 796) ที่สถานะ PUBLISHED สำหรับตำแหน่ง ${empProfile.Employee_Position} (${profileCode}) ใน ${fy}\nPublished scoring configuration was not found in App 796 for position ${empProfile.Employee_Position} (${profileCode}) in ${fy}.`);
          }
          if (scoringRecords.length > 1) {
            throw new Error(`พบการตั้งค่า Scoring Master (App 796) ซ้ำซ้อนสำหรับโปรไฟล์ ${profileCode} ใน ${fy}\nDuplicate published scoring configurations found in App 796 for profile ${profileCode} in ${fy}.`);
          }

          const scRec = scoringRecords[0];
          scoringConfig = {
            Profile_Code: profileCode,
            PartA_Weight: scRec.PartA_Weight?.value ? Number(scRec.PartA_Weight.value) : undefined,
            PartB_Weight: scRec.PartB_Weight?.value ? Number(scRec.PartB_Weight.value) : undefined,
            Part_A_Scoring_Mode: scRec.Part_A_Scoring_Mode?.value || '',
            Competency_Set_Code: scRec.Competency_Set_Code?.value || '',
            Configuration_Hash: scRec.Configuration_Hash?.value || ''
          };
        } catch (scoringErr) {
          console.warn('[MBO V2] Scoring resolution info:', scoringErr.message);
          // Re-throw if it's a fail-closed error
          throw scoringErr;
        }

        // Step 4: Record Key & Duplicate Check
        const generatedKey = buildRecordKey(fy, empProfile.Employee_Code);
        await EmployeeService.checkDuplicateMBO(getMboAppId(), fy, empProfile.Employee_Code, record.$id?.value, kintoneApiWrapper);

        // Step 5: Snapshot data safely into record in-memory
        const fieldsToSync = {
          Employee_Code: empProfile.Employee_Code,
          Employee_Name: empProfile.Employee_Name,
          Employee_Name_TH: empProfile.Employee_Name_TH,
          Employee_Section: empProfile.Employee_Section,
          Employee_Department: empProfile.Employee_Department,
          Employee_Position: empProfile.Employee_Position,
          Employee_Email: empProfile.Employee_Email,
          Employee_Start_Date: empProfile.Employee_Start_Date,
          Requester_User: routing.Requester_User,
          Manager_Level1_Approvers: routing.Manager_Level1_Approvers,
          Manager_Level1_Approval_Rule: routing.Manager_Level1_Approval_Rule,
          Manager_Level2_Approvers: routing.Manager_Level2_Approvers,
          Manager_Level2_Approval_Rule: routing.Manager_Level2_Approval_Rule,
          GM_Level1_Approvers: routing.GM_Level1_Approvers,
          GM_Level1_Approval_Rule: routing.GM_Level1_Approval_Rule,
          GM_Level2_Approvers: routing.GM_Level2_Approvers,
          GM_Level2_Approval_Rule: routing.GM_Level2_Approval_Rule,
          Has_Manager_Level2: routing.Has_Manager_Level2,
          Has_GM_Level2: routing.Has_GM_Level2,
          Routing_Topology: routing.Routing_Topology,
          First_Manager_User: routing.First_Manager_User,
          Manager_User: routing.Manager_User,
          GM_User: routing.GM_User,
          Fiscal_Year: fy,
          Record_Key: generatedKey
        };

        if (empProfile.Department_Hoshin !== undefined) {
          fieldsToSync.Department_Hoshin = empProfile.Department_Hoshin;
        }
        if (empProfile.Section_Hoshin !== undefined) {
          fieldsToSync.Section_Hoshin = empProfile.Section_Hoshin;
        }

        if (scoringConfig) {
          if (scoringConfig.Profile_Code) fieldsToSync.Profile_Code = scoringConfig.Profile_Code;
          if (scoringConfig.PartA_Weight !== undefined) fieldsToSync.PartA_Weight = scoringConfig.PartA_Weight;
          if (scoringConfig.PartB_Weight !== undefined) fieldsToSync.PartB_Weight = scoringConfig.PartB_Weight;
          if (scoringConfig.Part_A_Scoring_Mode) fieldsToSync.Part_A_Scoring_Mode = scoringConfig.Part_A_Scoring_Mode;
          if (scoringConfig.Competency_Set_Code) fieldsToSync.Competency_Set_Code = scoringConfig.Competency_Set_Code;
          if (scoringConfig.Configuration_Hash) fieldsToSync.Configuration_Hash = scoringConfig.Configuration_Hash;
        }

        Object.entries(fieldsToSync).forEach(([k, val]) => {
          if (record[k] && val !== undefined) {
            record[k].value = val;
          }
        });

        const CORE_SNAPSHOT_FIELDS = [
          'Profile_Code',
          'PartA_Weight',
          'PartB_Weight',
          'Part_A_Scoring_Mode',
          'Competency_Set_Code',
          'Configuration_Hash',
          'Routing_Topology',
          'Requester_User',
          'Record_Key'
        ];

        // Push directly to Kintone Form State with verified persistence and post-set read-back
        syncRecordToKintone(record, {
          requireVerifiedPersistence: true,
          requiredFields: CORE_SNAPSHOT_FIELDS
        });
      }
    };

    const ui = new EmployeePartAUI(options);
    activeUiInstance = ui;

    try {
      ui.render();
      hideAllNativeFields(record);
    } catch (renderError) {
      console.error('[MBO V2] Error rendering custom UI:', renderError);
    }

    return event;
  });

  // Hook 2: Record Submit (Create & Edit) -> Uses return false and Inline Errors
  kintone.events.on(['app.record.create.submit', 'app.record.edit.submit'], async function (event) {
    const record = event.record;
    const isCreate = event.type === 'app.record.create.submit';
    const stage = resolveBusinessStage(event);

    // 1. Sync custom UI values to record
    if (activeUiInstance) {
      activeUiInstance.syncFromDom();
    }

    // 2. Must verify employee before save (Fail-Closed: block if UI instance is missing or unverified)
    if (!activeUiInstance || activeUiInstance.isEmployeeVerified !== true) {
      if (activeUiInstance) {
        activeUiInstance.showValidationErrors([{
          field: 'Employee_Code',
          messageTH: 'กรุณาระบุรหัสพนักงานและกดค้นหาเพื่อยืนยันข้อมูลก่อนบันทึก',
          messageEN: 'Please enter Employee Code and click Search to verify employee profile before saving.',
          message: 'กรุณาระบุรหัสพนักงานและกดค้นหาเพื่อยืนยันข้อมูลก่อนบันทึก'
        }]);
      }
      return false;
    }

    // 3. Build and validate deterministic Record Key
    const fy = record.Fiscal_Year?.value || 'FY2026';
    const code = record.Employee_Code?.value || '';
    const recordKey = buildRecordKey(fy, code);

    if (!recordKey) {
      if (activeUiInstance) {
        activeUiInstance.showValidationErrors([{
          field: 'Employee_Code',
          messageTH: 'ไม่สามารถสร้าง Record Key ได้ กรุณาระบุรหัสพนักงานและรอบการประเมิน',
          messageEN: 'Cannot generate Record Key. Please enter Employee Code and Fiscal Year.',
          message: 'ไม่สามารถสร้าง Record Key ได้ กรุณาระบุรหัสพนักงานและรอบการประเมิน'
        }]);
      }
      return false;
    }

    if (record.Record_Key) {
      record.Record_Key.value = recordKey;
    }

    // 4. Duplicate Check Guard (Fail-Closed)
    try {
      const currentId = record.$id?.value;
      const query = `Record_Key = "${recordKey}" ${currentId ? `and $id != "${currentId}"` : ''}`;
      const duplicateRes = await kintoneApiWrapper.getRecords(getMboAppId(), query);

      if (!duplicateRes || typeof duplicateRes !== 'object' || !Array.isArray(duplicateRes.records)) {
        if (activeUiInstance) {
          activeUiInstance.showValidationErrors([{
            field: 'Employee_Code',
            messageTH: 'ไม่สามารถตรวจสอบข้อมูลรายการซ้ำได้ กรุณาลองใหม่อีกครั้ง หรือติดต่อ HR / Administrator',
            messageEN: 'Unable to verify record uniqueness. Please try again or contact HR / Administrator.',
            message: 'ไม่สามารถตรวจสอบข้อมูลรายการซ้ำได้ กรุณาลองใหม่อีกครั้ง หรือติดต่อ HR / Administrator'
          }]);
        }
        return false;
      }

      if (duplicateRes.records.length > 0) {
        if (activeUiInstance) {
          activeUiInstance.showValidationErrors([{
            field: 'Employee_Code',
            messageTH: `พนักงานรหัส ${code} มี MBO สำหรับ ${fy} อยู่แล้ว ไม่สามารถสร้างรายการซ้ำได้`,
            messageEN: `Employee ID ${code} already has an MBO record for ${fy}. Duplicate creation is blocked.`,
            message: `พนักงานรหัส ${code} มี MBO สำหรับ ${fy} อยู่แล้ว ไม่สามารถสร้างรายการซ้ำได้`
          }]);
        }
        return false;
      }
    } catch (err) {
      console.error('[MBO V2] Duplicate check error:', err);
      if (activeUiInstance) {
        activeUiInstance.showValidationErrors([{
          field: 'Employee_Code',
          messageTH: 'ไม่สามารถตรวจสอบข้อมูลรายการซ้ำได้ กรุณาลองใหม่อีกครั้ง หรือติดต่อ HR / Administrator',
          messageEN: 'Unable to verify record uniqueness. Please try again or contact HR / Administrator.',
          message: 'ไม่สามารถตรวจสอบข้อมูลรายการซ้ำได้ กรุณาลองใหม่อีกครั้ง หรือติดต่อ HR / Administrator'
        }]);
      }
      return false;
    }

    // 5. Stage Business Rule Validation
    const validation = ValidationEngine.validate(record, stage);
    if (!validation.isValid) {
      if (activeUiInstance) {
        activeUiInstance.showValidationErrors(validation.fieldErrors);
      }
      return false; // Cancel submit: NO native top error banner!
    }

    if (activeUiInstance) {
      activeUiInstance.clearValidationErrors();
    }

    return event;
  });

  // Hook 3: Process Action (Workflow Proceed)
  kintone.events.on('app.record.detail.process.proceed', function (event) {
    const record = event.record;
    const actionName = event.action?.value || '';
    const stage = resolveBusinessStage(event);

    // 1. Topology & Action Validation (Fail-Closed)
    const actionValidation = ValidationEngine.validateWorkflowAction(record, actionName, stage);
    if (!actionValidation.isValid) {
      if (activeUiInstance) {
        activeUiInstance.showValidationErrors(actionValidation.fieldErrors);
      }
      return false; // Cancel transition
    }

    // 2. Stage Business Rule Validation
    const validation = ValidationEngine.validate(record, stage);
    if (!validation.isValid) {
      if (activeUiInstance) {
        activeUiInstance.showValidationErrors(validation.fieldErrors);
      }
      return false; // Cancel transition
    }

    return event;
  });
}


})();
