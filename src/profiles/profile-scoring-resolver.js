/**
 * Phase 3 WP-002B: profile resolution and read-only scoring configuration resolver.
 * This module deliberately has no Kintone adapter: master records are injected.
 */
import { getJapaneseFiscalYear } from '../core/fiscal-year-engine.js';
import { isVerifiedEmployeeSnapshot } from '../services/employee-service.js';
import {
  PROFILE_CODES,
  computeConfigurationHash,
  validateScoringMasterConfig
} from './scoring-config-master.js';

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

export class ProfileScoringResolverError extends Error {
  constructor(code, message = code) {
    super(message);
    this.name = 'ProfileScoringResolverError';
    this.code = code;
  }
}

/** Applies the frozen title normalization policy. */
export function normalizeTitle(rawTitle) {
  if (typeof rawTitle !== 'string' || rawTitle.trim() === '') {
    throw new ProfileScoringResolverError('PROFILE_SOURCE_INVALID');
  }
  return rawTitle.trim().replace(/\s+/g, ' ').toLowerCase();
}

export function resolveProfileCode(employeeSnapshot) {
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

export function resolveProfileScoringConfig({
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
