import test from 'node:test';
import assert from 'node:assert/strict';
import { MboIdentityService } from '../src/services/mbo-identity-service.js';

test('IDENTITY_BINDING: valid Kintone user maps to exactly one Employee_Code -> PASS', () => {
  const userMappings = [
    { Kintone_User_Code: 'somchai_k', Employee_Code: 'EMP001', Account_Status: 'ACTIVE' },
    { Kintone_User_Code: 'somsri_k', Employee_Code: 'EMP002', Account_Status: 'ACTIVE' }
  ];

  const result = MboIdentityService.resolveEmployeeIdentity({
    kintoneUserCode: 'somchai_k',
    userMappings
  });

  assert.equal(result.status, 'IDENTITY_BOUND');
  assert.equal(result.employeeCode, 'EMP001');
  assert.equal(result.kintoneUserCode, 'somchai_k');
});

test('IDENTITY_BINDING: no mapping -> DENY', () => {
  const userMappings = [
    { Kintone_User_Code: 'somsri_k', Employee_Code: 'EMP002', Account_Status: 'ACTIVE' }
  ];

  const result = MboIdentityService.resolveEmployeeIdentity({
    kintoneUserCode: 'unknown_user',
    userMappings
  });

  assert.equal(result.status, 'IDENTITY_MAPPING_MISSING');
  assert.equal(result.reason, 'NO_EMPLOYEE_MAPPING_FOUND');
});

test('IDENTITY_BINDING: missing logged-in Kintone user -> DENY', () => {
  const result = MboIdentityService.resolveEmployeeIdentity({
    kintoneUserCode: '',
    userMappings: []
  });

  assert.equal(result.status, 'IDENTITY_MAPPING_MISSING');
  assert.equal(result.reason, 'LOGGED_IN_KINTONE_USER_REQUIRED');
});

test('IDENTITY_BINDING: ambiguous mapping -> DENY', () => {
  const userMappings = [
    { Kintone_User_Code: 'somchai_k', Employee_Code: 'EMP001', Account_Status: 'ACTIVE' },
    { Kintone_User_Code: 'somchai_k', Employee_Code: 'EMP003', Account_Status: 'ACTIVE' }
  ];

  const result = MboIdentityService.resolveEmployeeIdentity({
    kintoneUserCode: 'somchai_k',
    userMappings
  });

  assert.equal(result.status, 'IDENTITY_MAPPING_AMBIGUOUS');
  assert.equal(result.reason, 'MULTIPLE_EMPLOYEE_MAPPINGS_FOUND');
});

test('IDENTITY_BINDING: MBO username != bound Employee_Code -> DENY', () => {
  const result = MboIdentityService.validateMboUsername({
    mboUsername: 'EMP002',
    boundEmployeeCode: 'EMP001'
  });

  assert.equal(result.status, 'USERNAME_MISMATCH');
  assert.equal(result.reason, 'MBO_USERNAME_MUST_EQUAL_BOUND_EMPLOYEE_CODE');
});

test('EMPLOYEE_DATA_ISOLATION: employee own record -> PASS', () => {
  const authUser = { employeeCode: 'EMP001', kintoneUserCode: 'somchai_k' };
  const result = MboIdentityService.authorizeEmployeeRecordAccess({
    authenticatedUser: authUser,
    targetEmployeeCode: 'EMP001',
    userRole: 'EMPLOYEE'
  });

  assert.equal(result.authorized, true);
  assert.equal(result.role, 'EMPLOYEE');
  assert.equal(result.employeeCode, 'EMP001');
});

test('EMPLOYEE_DATA_ISOLATION: Employee A requests Employee B -> DENY', () => {
  const authUser = { employeeCode: 'EMP001', kintoneUserCode: 'somchai_k' };
  const result = MboIdentityService.authorizeEmployeeRecordAccess({
    authenticatedUser: authUser,
    targetEmployeeCode: 'EMP002',
    userRole: 'EMPLOYEE'
  });

  assert.equal(result.authorized, false);
  assert.equal(result.code, 'EMPLOYEE_A_CANNOT_ACCESS_EMPLOYEE_B');
});

test('EMPLOYEE_DATA_ISOLATION: technical admin identity (admin-form / isTechnicalAdmin) DENIED employee self business ops', () => {
  const authUser1 = { isTechnicalAdmin: true, employeeCode: 'EMP001', kintoneUserCode: 'admin' };
  const result1 = MboIdentityService.authorizeEmployeeRecordAccess({
    authenticatedUser: authUser1,
    targetEmployeeCode: 'EMP001',
    userRole: 'EMPLOYEE'
  });
  assert.equal(result1.authorized, false);
  assert.equal(result1.code, 'TECHNICAL_ADMIN_CANNOT_PERFORM_BUSINESS_EMPLOYEE_SELF');

  const authUser2 = { employeeCode: 'EMP001', kintoneUserCode: 'admin-form' };
  const result2 = MboIdentityService.authorizeEmployeeRecordAccess({
    authenticatedUser: authUser2,
    targetEmployeeCode: 'EMP001',
    userRole: 'EMPLOYEE'
  });
  assert.equal(result2.authorized, false);
  assert.equal(result2.code, 'TECHNICAL_ADMIN_CANNOT_PERFORM_BUSINESS_EMPLOYEE_SELF');
});

test('EMPLOYEE_DATA_ISOLATION: HR/approver access DENIED without authoritative role context', () => {
  const authUser = { employeeCode: 'EMP001', kintoneUserCode: 'somchai_k' };

  // Caller passing role string alone -> DENY
  const resultWithoutCtx = MboIdentityService.authorizeEmployeeRecordAccess({
    authenticatedUser: authUser,
    targetEmployeeCode: 'EMP002',
    userRole: 'HR'
  });
  assert.equal(resultWithoutCtx.authorized, false);
  assert.equal(resultWithoutCtx.code, 'UNVERIFIED_AUTHORITATIVE_ROLE_CLAIM');

  // Caller with unverified role context -> DENY
  const unverifiedCtx = {
    hasVerifiedRole: () => false
  };
  const resultUnverified = MboIdentityService.authorizeEmployeeRecordAccess({
    authenticatedUser: authUser,
    targetEmployeeCode: 'EMP002',
    userRole: 'HR',
    authoritativeRoleContext: unverifiedCtx
  });
  assert.equal(resultUnverified.authorized, false);
  assert.equal(resultUnverified.code, 'UNVERIFIED_AUTHORITATIVE_ROLE_CLAIM');
});

test('EMPLOYEE_DATA_ISOLATION: HR/approver access PASSES with verified authoritative role context', () => {
  const authUser = { employeeCode: 'HR001', kintoneUserCode: 'hr_user' };

  const verifiedCtx = {
    hasVerifiedRole: (role, target) => role === 'HR' && target === 'EMP002'
  };
  const resultVerified = MboIdentityService.authorizeEmployeeRecordAccess({
    authenticatedUser: authUser,
    targetEmployeeCode: 'EMP002',
    userRole: 'HR',
    authoritativeRoleContext: verifiedCtx
  });

  assert.equal(resultVerified.authorized, true);
  assert.equal(resultVerified.role, 'HR');
  assert.equal(resultVerified.employeeCode, 'EMP002');
});

test('PRINCIPAL_MODE: admin-form -> TECHNICAL_ADMIN unchanged', () => {
  assert.equal(MboIdentityService.resolveKintonePrincipalMode({ kintoneUserCode: 'admin-form' }), 'TECHNICAL_ADMIN');
  assert.equal(MboIdentityService.resolveKintonePrincipalMode({ kintoneUserCode: 'Administrator' }), 'TECHNICAL_ADMIN');
  assert.equal(MboIdentityService.resolveKintonePrincipalMode({ kintoneUserCode: 'ADMIN' }), 'TECHNICAL_ADMIN');
});

test('PRINCIPAL_MODE: approved shared principal -> SHARED unchanged', () => {
  assert.equal(MboIdentityService.resolveKintonePrincipalMode({ kintoneUserCode: 's1' }), 'SHARED');
  assert.equal(MboIdentityService.resolveKintonePrincipalMode({ kintoneUserCode: 't1' }), 'SHARED');
});

test('PRINCIPAL_MODE: candidate dedicated without groups -> DEDICATED', () => {
  assert.equal(MboIdentityService.resolveKintonePrincipalMode({ kintoneUserCode: 'somchai_k' }), 'DEDICATED');
  assert.equal(MboIdentityService.resolveKintonePrincipalMode({ kintoneUserCode: 'hr' }), 'DEDICATED');
});

test('HR_ADMIN_GROUP: isHrAdminGroupMember verifies ONLY exact group code HR_ADMIN_GROUP', () => {
  assert.equal(MboIdentityService.isHrAdminGroupMember([{ code: 'HR_ADMIN_GROUP', name: 'HR Admin' }]), true);
  assert.equal(MboIdentityService.isHrAdminGroupMember([{ code: 'OTHER_GROUP', name: 'HR Admin' }]), false, 'code=OTHER_GROUP, name="HR Admin" must be false');
  assert.equal(MboIdentityService.isHrAdminGroupMember([{ code: 'HR', name: 'HR' }]), false, 'code=HR, name="HR" must be false');
  assert.equal(MboIdentityService.isHrAdminGroupMember([{ code: 'HR_ADMIN', name: 'HR Admin' }]), false, 'code=HR_ADMIN must be false');
  assert.equal(MboIdentityService.isHrAdminGroupMember([{ code: 'ENGINEERING', name: 'Dev Team' }]), false);
  assert.equal(MboIdentityService.isHrAdminGroupMember([]), false);
  assert.equal(MboIdentityService.isHrAdminGroupMember(null), false);
});

test('PRINCIPAL_MODE: unmapped user + verified HR_ADMIN_GROUP -> HR_ADMIN mode', () => {
  const hrGroups = [{ code: 'HR_ADMIN_GROUP', name: 'HR Admin' }];
  assert.equal(MboIdentityService.resolveKintonePrincipalMode({ kintoneUserCode: 'hr', userGroups: hrGroups }), 'HR_ADMIN');
  assert.equal(MboIdentityService.resolveKintonePrincipalMode({ kintoneUserCode: 'somchai_hr', userGroups: hrGroups }), 'HR_ADMIN');
});

test('PRINCIPAL_MODE: username "hr" without verified HR_ADMIN_GROUP -> DEDICATED candidate (not HR_ADMIN)', () => {
  const nonHrGroups = [{ code: 'ENGINEERING', name: 'Dev Team' }];
  const wrongCodeGroups = [{ code: 'HR_ADMIN', name: 'HR Admin' }];
  assert.equal(MboIdentityService.resolveKintonePrincipalMode({ kintoneUserCode: 'hr', userGroups: nonHrGroups }), 'DEDICATED');
  assert.equal(MboIdentityService.resolveKintonePrincipalMode({ kintoneUserCode: 'hr', userGroups: wrongCodeGroups }), 'DEDICATED');
  assert.equal(MboIdentityService.resolveKintonePrincipalMode({ kintoneUserCode: 'hr', userGroups: [] }), 'DEDICATED');
  assert.equal(MboIdentityService.resolveKintonePrincipalMode({ kintoneUserCode: 'hr', userGroups: null }), 'DEDICATED');
});
