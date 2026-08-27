/**
 * MBO Identity Service — Gate 1 Identity Binding & Employee Data Isolation
 */

export class MboIdentityService {
  /**
   * Resolves authenticated Kintone user to an authoritative Employee_Code.
   * @param {Object} params
   * @param {string} params.kintoneUserCode - Logged-in Kintone user code
   * @param {Array<Object>} params.userMappings - Employee mapping records
   * @returns {{ status: string, employeeCode?: string, reason?: string }}
   */
  static resolveEmployeeIdentity({ kintoneUserCode, userMappings }) {
    if (!kintoneUserCode || typeof kintoneUserCode !== 'string' || kintoneUserCode.trim() === '') {
      return {
        status: 'IDENTITY_MAPPING_MISSING',
        reason: 'LOGGED_IN_KINTONE_USER_REQUIRED'
      };
    }

    const cleanUserCode = kintoneUserCode.trim();
    if (!Array.isArray(userMappings)) {
      return {
        status: 'IDENTITY_MAPPING_MISSING',
        reason: 'NO_EMPLOYEE_MAPPING_FOUND'
      };
    }

    const matches = userMappings.filter(m => m && m.Kintone_User_Code === cleanUserCode && m.Account_Status !== 'DISABLED');

    if (matches.length === 0) {
      return {
        status: 'IDENTITY_MAPPING_MISSING',
        reason: 'NO_EMPLOYEE_MAPPING_FOUND'
      };
    }

    if (matches.length > 1) {
      return {
        status: 'IDENTITY_MAPPING_AMBIGUOUS',
        reason: 'MULTIPLE_EMPLOYEE_MAPPINGS_FOUND'
      };
    }

    const mapped = matches[0];
    if (!mapped.Employee_Code || typeof mapped.Employee_Code !== 'string' || mapped.Employee_Code.trim() === '') {
      return {
        status: 'IDENTITY_MAPPING_MISSING',
        reason: 'INVALID_MAPPED_EMPLOYEE_CODE'
      };
    }

    return {
      status: 'IDENTITY_BOUND',
      employeeCode: mapped.Employee_Code.trim(),
      kintoneUserCode: cleanUserCode
    };
  }

  /**
   * Validates MBO username equals the bound Employee_Code.
   */
  static validateMboUsername({ mboUsername, boundEmployeeCode }) {
    if (!mboUsername || !boundEmployeeCode || mboUsername.trim() !== boundEmployeeCode.trim()) {
      return {
        status: 'USERNAME_MISMATCH',
        reason: 'MBO_USERNAME_MUST_EQUAL_BOUND_EMPLOYEE_CODE'
      };
    }
    return {
      status: 'USERNAME_VALIDATED',
      employeeCode: boundEmployeeCode.trim()
    };
  }

  /**
   * Authorizes employee data access ensuring EMPLOYEE_A_CANNOT_ACCESS_EMPLOYEE_B.
   */
  static authorizeEmployeeRecordAccess({ authenticatedUser, targetEmployeeCode, userRole = 'EMPLOYEE' }) {
    if (!authenticatedUser || !authenticatedUser.employeeCode) {
      return {
        authorized: false,
        code: 'UNAUTHENTICATED',
        reason: 'Authenticated employee identity is required.'
      };
    }

    // Technical admin identity must not be silently treated as employee business identity
    if (authenticatedUser.isTechnicalAdmin && (!authenticatedUser.employeeCode || authenticatedUser.employeeCode === 'ADMIN')) {
      return {
        authorized: false,
        code: 'TECHNICAL_ADMIN_NOT_BUSINESS_EMPLOYEE',
        reason: 'Technical admin identity cannot perform employee self operations.'
      };
    }

    const cleanTarget = String(targetEmployeeCode || '').trim();
    const cleanAuthEmp = String(authenticatedUser.employeeCode).trim();

    if (userRole === 'EMPLOYEE') {
      if (cleanAuthEmp !== cleanTarget) {
        return {
          authorized: false,
          code: 'EMPLOYEE_A_CANNOT_ACCESS_EMPLOYEE_B',
          reason: `Data isolation violation: Employee ${cleanAuthEmp} cannot access Employee ${cleanTarget} records.`
        };
      }
      return {
        authorized: true,
        role: 'EMPLOYEE',
        employeeCode: cleanTarget
      };
    }

    if (userRole === 'HR' || userRole === 'APPROVER') {
      return {
        authorized: true,
        role: userRole,
        employeeCode: cleanTarget
      };
    }

    return {
      authorized: false,
      code: 'UNAUTHORIZED_ROLE',
      reason: `Role ${userRole} is not authorized.`
    };
  }
}
