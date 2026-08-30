/**
 * MBO Identity Service — Gate 1 Identity Binding & Employee Data Isolation
 */

export class MboIdentityService {
  /**
   * Resolves authenticated dedicated Kintone user to an authoritative Employee_Code in App 53.
   * Canonical field specs: MBO_Kintone_User (USER_SELECT), Number_0 = 1 (Active), emp_text (Canonical Code).
   * @param {Object} params
   * @param {string} params.kintoneUserCode - Logged-in Kintone user code
   * @param {Array<Object>} params.userMappings - App 53 employee records
   * @returns {{ status: string, employeeCode?: string, kintoneUserCode?: string, reason?: string, recordId?: string|number }}
   */
  static resolveDedicatedKintoneUserMapping({ kintoneUserCode, userMappings }) {
    if (!kintoneUserCode || typeof kintoneUserCode !== 'string' || kintoneUserCode.trim() === '') {
      return {
        status: 'IDENTITY_MAPPING_MISSING',
        reason: 'LOGGED_IN_KINTONE_USER_REQUIRED'
      };
    }

    const cleanUserCode = kintoneUserCode.trim();

    // Technical admin identity NEVER binds Employee-Self business identity
    if (cleanUserCode === 'admin-form' || cleanUserCode === 'Administrator' || cleanUserCode === 'ADMIN') {
      return {
        status: 'IDENTITY_MAPPING_MISSING',
        reason: 'TECHNICAL_ADMIN_CANNOT_BIND_EMPLOYEE_SELF'
      };
    }

    if (!Array.isArray(userMappings)) {
      return {
        status: 'IDENTITY_MAPPING_MISSING',
        reason: 'NO_EMPLOYEE_MAPPING_FOUND'
      };
    }

    // Helper to check active status (Number_0 = 1 or Account_Status !== 'DISABLED')
    const isActive = (m) => {
      if (m.Number_0 !== undefined) {
        const val = typeof m.Number_0 === 'object' ? m.Number_0.value : m.Number_0;
        return String(val) === '1' || val === 1;
      }
      if (m.Account_Status !== undefined) {
        return m.Account_Status !== 'DISABLED';
      }
      return true; // Default active if status not specified
    };

    // Helper to extract selected user array from MBO_Kintone_User
    const getKintoneUsers = (m) => {
      if (m.MBO_Kintone_User !== undefined) {
        const val = typeof m.MBO_Kintone_User === 'object' && m.MBO_Kintone_User !== null ? m.MBO_Kintone_User.value : m.MBO_Kintone_User;
        if (Array.isArray(val)) return val;
      }
      if (m.Kintone_User_Code !== undefined) {
        const val = typeof m.Kintone_User_Code === 'object' ? m.Kintone_User_Code.value : m.Kintone_User_Code;
        if (val) return [{ code: String(val) }];
      }
      return [];
    };

    const activeMappings = userMappings.filter(m => m && isActive(m));

    const matches = activeMappings.filter(m => {
      const users = getKintoneUsers(m);
      // USER_SELECT field must contain EXACTLY ONE selected user
      if (users.length !== 1) return false;
      const userObj = users[0];
      const code = typeof userObj === 'object' ? (userObj.code || userObj.value) : userObj;
      return String(code || '').trim() === cleanUserCode;
    });

    if (matches.length === 0) {
      return {
        status: 'IDENTITY_MAPPING_MISSING',
        reason: 'NO_ACTIVE_EMPLOYEE_MAPPING_FOUND'
      };
    }

    if (matches.length > 1) {
      return {
        status: 'IDENTITY_MAPPING_AMBIGUOUS',
        reason: 'MULTIPLE_ACTIVE_EMPLOYEE_MAPPINGS_FOUND'
      };
    }

    const mapped = matches[0];
    const rawEmpText = mapped.emp_text !== undefined
      ? (typeof mapped.emp_text === 'object' ? mapped.emp_text?.value : mapped.emp_text)
      : (mapped.Employee_Code !== undefined ? (typeof mapped.Employee_Code === 'object' ? mapped.Employee_Code?.value : mapped.Employee_Code) : null);

    if (rawEmpText === null || rawEmpText === undefined || typeof rawEmpText !== 'string' || rawEmpText.trim() === '') {
      return {
        status: 'IDENTITY_MAPPING_INVALID_CANONICAL_CODE',
        reason: 'MAPPED_RECORD_MISSING_CANONICAL_EMP_TEXT'
      };
    }

    const cleanEmpCode = rawEmpText.trim();
    const recId = mapped.$id !== undefined ? (typeof mapped.$id === 'object' ? mapped.$id.value : mapped.$id) : (mapped.Record_Id || null);

    return {
      status: 'IDENTITY_BOUND',
      employeeCode: cleanEmpCode,
      kintoneUserCode: cleanUserCode,
      recordId: recId
    };
  }

  /**
   * Resolves authenticated Kintone user to an authoritative Employee_Code.
   * Direct wrapper around resolveDedicatedKintoneUserMapping for backward compatibility.
   * @param {Object} params
   * @param {string} params.kintoneUserCode - Logged-in Kintone user code
   * @param {Array<Object>} params.userMappings - Employee mapping records
   * @returns {{ status: string, employeeCode?: string, reason?: string }}
   */
  static resolveEmployeeIdentity({ kintoneUserCode, userMappings }) {
    const res = MboIdentityService.resolveDedicatedKintoneUserMapping({ kintoneUserCode, userMappings });
    if (res.status === 'IDENTITY_MAPPING_INVALID_CANONICAL_CODE') {
      return {
        status: 'IDENTITY_MAPPING_MISSING',
        reason: 'INVALID_MAPPED_EMPLOYEE_CODE'
      };
    }
    if (res.reason === 'NO_ACTIVE_EMPLOYEE_MAPPING_FOUND') {
      return { ...res, reason: 'NO_EMPLOYEE_MAPPING_FOUND' };
    }
    if (res.reason === 'MULTIPLE_ACTIVE_EMPLOYEE_MAPPINGS_FOUND') {
      return { ...res, reason: 'MULTIPLE_EMPLOYEE_MAPPINGS_FOUND' };
    }
    return res;
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
   * Technical Admin identity (admin-form / isTechnicalAdmin) CANNOT perform employee-self business ops.
   * HR / APPROVER role access requires authoritativeRoleContext assertion.
   */
  static authorizeEmployeeRecordAccess({ authenticatedUser, targetEmployeeCode, userRole = 'EMPLOYEE', authoritativeRoleContext = null }) {
    if (!authenticatedUser || !authenticatedUser.employeeCode) {
      return {
        authorized: false,
        code: 'UNAUTHENTICATED',
        reason: 'Authenticated employee identity is required.'
      };
    }

    // Technical admin identity isolation — NEVER silently treated as employee business identity
    const isTechAdminUser = authenticatedUser.isTechnicalAdmin === true ||
      authenticatedUser.kintoneUserCode === 'Administrator' ||
      authenticatedUser.kintoneUserCode === 'admin-form' ||
      authenticatedUser.employeeCode === 'ADMIN';

    if (isTechAdminUser) {
      return {
        authorized: false,
        code: 'TECHNICAL_ADMIN_CANNOT_PERFORM_BUSINESS_EMPLOYEE_SELF',
        reason: 'Technical admin identity cannot perform employee self business operations.'
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
      // Require authoritativeRoleContext — caller-supplied role string alone is NEVER sufficient
      if (!authoritativeRoleContext || typeof authoritativeRoleContext !== 'object') {
        return {
          authorized: false,
          code: 'UNVERIFIED_AUTHORITATIVE_ROLE_CLAIM',
          reason: `Role ${userRole} requires authoritative role context.`
        };
      }

      let isVerified = false;
      if (typeof authoritativeRoleContext.hasVerifiedRole === 'function') {
        isVerified = authoritativeRoleContext.hasVerifiedRole(userRole, cleanTarget);
      } else if (userRole === 'HR' && authoritativeRoleContext.isAuthorizedHR === true) {
        isVerified = true;
      } else if (userRole === 'APPROVER' && typeof authoritativeRoleContext.isAuthorizedApproverFor === 'function') {
        isVerified = authoritativeRoleContext.isAuthorizedApproverFor(cleanTarget);
      } else if (Array.isArray(authoritativeRoleContext.verifiedRoles)) {
        isVerified = authoritativeRoleContext.verifiedRoles.includes(userRole);
      }

      if (!isVerified) {
        return {
          authorized: false,
          code: 'UNVERIFIED_AUTHORITATIVE_ROLE_CLAIM',
          reason: `Role claim ${userRole} is not verified by authoritative role context for target ${cleanTarget}.`
        };
      }

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
