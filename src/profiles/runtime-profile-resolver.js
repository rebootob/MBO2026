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
