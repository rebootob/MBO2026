/**
 * src/profiles/runtime-profile-resolver.js
 * Browser-Safe Runtime Profile Resolver for MBO V2 UI
 *
 * Resolves profile codes for verified employee snapshots without importing Node-only dependencies.
 */
import { isVerifiedEmployeeSnapshot } from '../services/employee-service.js';
import {
  PROFILE_CODES,
  getProfileCodeFromPosition,
  ProfilePolicyError
} from './profile-codes-policy.js';

export { PROFILE_CODES };

export class RuntimeProfileResolverError extends Error {
  constructor(code, message = code) {
    super(message);
    this.name = 'RuntimeProfileResolverError';
    this.code = code;
  }
}

export function resolveProfileCodeForSnapshot(employeeSnapshot) {
  if (!isVerifiedEmployeeSnapshot(employeeSnapshot)) {
    throw new RuntimeProfileResolverError('EMPLOYEE_SNAPSHOT_UNVERIFIED');
  }
  try {
    return getProfileCodeFromPosition(employeeSnapshot.Employee_Position);
  } catch (err) {
    if (err instanceof ProfilePolicyError) {
      throw new RuntimeProfileResolverError(err.code);
    }
    throw err;
  }
}

export const EXPECTED_APPRAISER_COUNT_BY_PROFILE = Object.freeze({
  [PROFILE_CODES.STAFF_CHIEF]: 2,
  [PROFILE_CODES.JAPANESE_STAFF]: 2,
  [PROFILE_CODES.ASST_MGR]: 2,
  [PROFILE_CODES.SECTION_MGR]: 2,
  [PROFILE_CODES.SENIOR_MGR]: 2,
  [PROFILE_CODES.DGM]: 1,
  [PROFILE_CODES.GM]: 1,
  [PROFILE_CODES.VP]: 1
});

export function resolveExpectedAppraiserCount(profileCode) {
  if (!profileCode || typeof profileCode !== 'string') {
    throw new RuntimeProfileResolverError('INVALID_PROFILE_CODE', 'Profile code is required and must be a string.');
  }
  const clean = profileCode.trim();
  const count = EXPECTED_APPRAISER_COUNT_BY_PROFILE[clean];
  if (count !== 1 && count !== 2) {
    throw new RuntimeProfileResolverError(
      'INVALID_PROFILE_CODE',
      `Unsupported or invalid profile code for expected appraiser count: ${clean}`
    );
  }
  return count;
}

