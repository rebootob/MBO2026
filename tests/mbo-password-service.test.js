import test from 'node:test';
import assert from 'node:assert/strict';
import { MboPasswordDomainService } from '../src/services/mbo-password-service.js';

test('PASSWORD_DOMAIN: initial credential -> force-change state', () => {
  const cred = MboPasswordDomainService.provisionInitialCredential({
    employeeCode: 'EMP001',
    kintoneUserCode: 'somchai_k'
  });

  assert.equal(cred.Employee_Code, 'EMP001');
  assert.equal(cred.Kintone_User_Code, 'somchai_k');
  assert.equal(cred.Must_Change_Password, true);
  assert.equal(cred.Account_Status, 'ACTIVE');
  assert.ok(cred.Password_Hash.startsWith('pbkdf2$'));
  assert.equal('plaintextPassword' in cred, false);
});

test('PASSWORD_DOMAIN: plaintext is never returned/persisted by domain API', () => {
  const cred = MboPasswordDomainService.provisionInitialCredential({
    employeeCode: 'EMP001'
  });
  const jsonStr = JSON.stringify(cred);
  assert.equal(jsonStr.includes('EMP001'), true); // Employee_Code is present
  assert.equal(cred.password, undefined);
  assert.equal(cred.rawPassword, undefined);
  assert.equal(cred.plaintextPassword, undefined);
});

test('PASSWORD_DOMAIN: missing passwordMaxAgeDays config fails closed on changePassword', () => {
  const cred = MboPasswordDomainService.provisionInitialCredential({
    employeeCode: 'EMP001'
  });

  assert.throws(
    () => MboPasswordDomainService.changePassword({
      credentialRecord: cred,
      newPassword: 'MyNewSecurePassword#2026'
      // missing passwordMaxAgeDays
    }),
    /PASSWORD_MAX_AGE_CONFIG_REQUIRED/
  );
});

test('PASSWORD_DOMAIN: initial credential evaluation -> AUTHENTICATED_BUT_PASSWORD_CHANGE_REQUIRED', () => {
  const cred = MboPasswordDomainService.provisionInitialCredential({
    employeeCode: 'EMP001'
  });

  const evalResult = MboPasswordDomainService.evaluateCredentialState({
    credentialRecord: cred,
    inputPassword: 'EMP001'
  });

  assert.equal(evalResult.status, 'AUTHENTICATED_BUT_PASSWORD_CHANGE_REQUIRED');
  assert.equal(evalResult.requiresPasswordChange, true);
});

test('PASSWORD_DOMAIN: wrong password -> failed count behavior', () => {
  const cred = MboPasswordDomainService.provisionInitialCredential({
    employeeCode: 'EMP001'
  });

  const evalResult = MboPasswordDomainService.evaluateCredentialState({
    credentialRecord: cred,
    inputPassword: 'WRONG_PASSWORD'
  });

  assert.equal(evalResult.status, 'INVALID_CREDENTIALS');
  assert.equal(evalResult.failedLoginCount, 1);
  assert.equal(evalResult.isLocked, false);
});

test('PASSWORD_DOMAIN: max failed logins -> locks account', () => {
  const cred = {
    ...MboPasswordDomainService.provisionInitialCredential({ employeeCode: 'EMP001' }),
    Failed_Login_Count: 4
  };

  const evalResult = MboPasswordDomainService.evaluateCredentialState({
    credentialRecord: cred,
    inputPassword: 'WRONG_PASSWORD',
    maxFailedAttempts: 5
  });

  assert.equal(evalResult.status, 'INVALID_CREDENTIALS');
  assert.equal(evalResult.failedLoginCount, 5);
  assert.equal(evalResult.isLocked, true);
  assert.ok(evalResult.lockedUntil);
});

test('PASSWORD_DOMAIN: disabled account -> DENY', () => {
  const cred = {
    ...MboPasswordDomainService.provisionInitialCredential({ employeeCode: 'EMP001' }),
    Account_Status: 'DISABLED'
  };

  const evalResult = MboPasswordDomainService.evaluateCredentialState({
    credentialRecord: cred,
    inputPassword: 'EMP001'
  });

  assert.equal(evalResult.status, 'ACCOUNT_DISABLED');
});

test('PASSWORD_DOMAIN: locked account -> DENY', () => {
  const futureLock = new Date(Date.now() + 600000).toISOString();
  const cred = {
    ...MboPasswordDomainService.provisionInitialCredential({ employeeCode: 'EMP001' }),
    Locked_Until: futureLock
  };

  const evalResult = MboPasswordDomainService.evaluateCredentialState({
    credentialRecord: cred,
    inputPassword: 'EMP001'
  });

  assert.equal(evalResult.status, 'ACCOUNT_LOCKED');
});

test('PASSWORD_DOMAIN: hard Account_Status = LOCKED with null/expired Locked_Until -> DENY', () => {
  const credNullLock = {
    ...MboPasswordDomainService.provisionInitialCredential({ employeeCode: 'EMP001' }),
    Account_Status: 'LOCKED',
    Locked_Until: null
  };

  const evalNullRes = MboPasswordDomainService.evaluateCredentialState({
    credentialRecord: credNullLock,
    inputPassword: 'EMP001'
  });

  assert.equal(evalNullRes.status, 'ACCOUNT_LOCKED');

  const pastLock = new Date(Date.now() - 600000).toISOString();
  const credPastLock = {
    ...MboPasswordDomainService.provisionInitialCredential({ employeeCode: 'EMP001' }),
    Account_Status: 'LOCKED',
    Locked_Until: pastLock
  };

  const evalPastRes = MboPasswordDomainService.evaluateCredentialState({
    credentialRecord: credPastLock,
    inputPassword: 'EMP001'
  });

  assert.equal(evalPastRes.status, 'ACCOUNT_LOCKED');
});

test('PASSWORD_DOMAIN: expired password -> password-change-required only', () => {
  const pastExpiry = new Date(Date.now() - 60000).toISOString();
  const cred = {
    ...MboPasswordDomainService.provisionInitialCredential({ employeeCode: 'EMP001' }),
    Must_Change_Password: false,
    Password_Expires_At: pastExpiry
  };

  const evalResult = MboPasswordDomainService.evaluateCredentialState({
    credentialRecord: cred,
    inputPassword: 'EMP001'
  });

  assert.equal(evalResult.status, 'PASSWORD_EXPIRED');
  assert.equal(evalResult.requiresPasswordChange, true);
});

test('PASSWORD_DOMAIN: successful password change with explicit passwordMaxAgeDays -> new hash + expiry metadata', () => {
  const cred = MboPasswordDomainService.provisionInitialCredential({
    employeeCode: 'EMP001'
  });

  const updatedCred = MboPasswordDomainService.changePassword({
    credentialRecord: cred,
    newPassword: 'MyNewSecurePassword#2026',
    passwordMaxAgeDays: 90
  });

  assert.equal(updatedCred.Must_Change_Password, false);
  assert.ok(updatedCred.Password_Changed_At);
  assert.ok(updatedCred.Password_Expires_At);
  assert.equal(updatedCred.Failed_Login_Count, 0);
  assert.equal(updatedCred.Locked_Until, null);

  // Verify new password authenticates
  const evalResult = MboPasswordDomainService.evaluateCredentialState({
    credentialRecord: updatedCred,
    inputPassword: 'MyNewSecurePassword#2026'
  });

  assert.equal(evalResult.status, 'AUTHENTICATED_SUCCESS');
  assert.equal(evalResult.employeeCode, 'EMP001');
});

test('PASSWORD_DOMAIN: HR reset -> default Employee_Code-derived hash + force change', () => {
  const cred = MboPasswordDomainService.provisionInitialCredential({
    employeeCode: 'EMP001'
  });
  const changedCred = MboPasswordDomainService.changePassword({
    credentialRecord: cred,
    newPassword: 'CustomPassword',
    passwordMaxAgeDays: 90
  });

  const resetCred = MboPasswordDomainService.hrResetPassword({
    credentialRecord: changedCred
  });

  assert.equal(resetCred.Must_Change_Password, true);
  assert.equal(resetCred.Failed_Login_Count, 0);
  assert.equal(resetCred.Locked_Until, null);

  // Authenticates into force change state with default password (EMP001)
  const evalResult = MboPasswordDomainService.evaluateCredentialState({
    credentialRecord: resetCred,
    inputPassword: 'EMP001'
  });

  assert.equal(evalResult.status, 'AUTHENTICATED_BUT_PASSWORD_CHANGE_REQUIRED');
});
