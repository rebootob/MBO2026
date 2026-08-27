/**
 * Phase 3 WP-002B: profile resolution and read-only scoring configuration resolver.
 * This module deliberately has no Kintone adapter: master records are injected.
 */
import { getJapaneseFiscalYear } from '../core/fiscal-year-engine.js';
import { isVerifiedEmployeeSnapshot } from '../services/employee-service.js';
import {
  PROFILE_CODES,
  getProfileCodeFromPosition as policyGetProfileCodeFromPosition,
  normalizeTitle as policyNormalizeTitle,
  ProfilePolicyError
} from './profile-codes-policy.js';
import {
  computeConfigurationHash,
  validateScoringMasterConfig
} from './scoring-config-master.js';

export { PROFILE_CODES };

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
  try {
    return policyNormalizeTitle(rawTitle);
  } catch (err) {
    if (err instanceof ProfilePolicyError) {
      throw new ProfileScoringResolverError(err.code);
    }
    throw err;
  }
}

export function getProfileCodeFromPosition(position) {
  try {
    return policyGetProfileCodeFromPosition(position);
  } catch (err) {
    if (err instanceof ProfilePolicyError) {
      throw new ProfileScoringResolverError(err.code);
    }
    throw err;
  }
}

export function resolveProfileCode(employeeSnapshot) {
  if (!isVerifiedEmployeeSnapshot(employeeSnapshot)) {
    throw new ProfileScoringResolverError('EMPLOYEE_SNAPSHOT_UNVERIFIED');
  }
  return getProfileCodeFromPosition(employeeSnapshot.Employee_Position);
}

function assertAuthenticatedContext(authenticatedContext) {
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
