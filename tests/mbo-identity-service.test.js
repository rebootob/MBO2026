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

test('EMPLOYEE_DATA_ISOLATION: technical admin identity without employee code -> DENY', () => {
  const authUser = { isTechnicalAdmin: true, employeeCode: 'ADMIN', kintoneUserCode: 'admin' };
  const result = MboIdentityService.authorizeEmployeeRecordAccess({
    authenticatedUser: authUser,
    targetEmployeeCode: 'EMP001',
    userRole: 'EMPLOYEE'
  });

  assert.equal(result.authorized, false);
  assert.equal(result.code, 'TECHNICAL_ADMIN_NOT_BUSINESS_EMPLOYEE');
});

test('EMPLOYEE_DATA_ISOLATION: HR/approver access remains role-authorized', () => {
  const authUser = { employeeCode: 'HR001', kintoneUserCode: 'hr_user' };
  const result = MboIdentityService.authorizeEmployeeRecordAccess({
    authenticatedUser: authUser,
    targetEmployeeCode: 'EMP001',
    userRole: 'HR'
  });

  assert.equal(result.authorized, true);
  assert.equal(result.role, 'HR');
});
