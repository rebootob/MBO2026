import test from 'node:test';
import assert from 'node:assert/strict';
import { MboAuthSessionService } from '../src/services/mbo-auth-session-service.js';
import { MboPasswordDomainService } from '../src/services/mbo-password-service.js';
import { MboIdentityService } from '../src/services/mbo-identity-service.js';

// Simple in-memory fake stores for testing
class FakeCredentialStore {
  constructor(initialData = {}) {
    this.credentials = new Map(Object.entries(initialData));
  }

  async getCredential(empCode) {
    const cred = this.credentials.get(empCode);
    return cred ? JSON.parse(JSON.stringify(cred)) : null;
  }

  async updateCredential(empCode, patch) {
    const existing = this.credentials.get(empCode) || { Employee_Code: empCode };
    const updated = { ...existing, ...patch };
    this.credentials.set(empCode, updated);
    return updated;
  }
}

class FakeSessionStore {
  constructor() {
    this.sessions = new Map();
  }

  async getSession(tokenHash) {
    const sess = this.sessions.get(tokenHash);
    return sess ? JSON.parse(JSON.stringify(sess)) : null;
  }

  async setSession(tokenHash, sessionObj) {
    this.sessions.set(tokenHash, JSON.parse(JSON.stringify(sessionObj)));
  }

  async deleteSession(tokenHash) {
    this.sessions.delete(tokenHash);
  }
}

test('D1-A Trusted Auth & Opaque Session Core Test Suite', async (t) => {
  const userMappings = [
    { Kintone_User_Code: 'emp0118', Employee_Code: '0118', Account_Status: 'ACTIVE' },
    { Kintone_User_Code: 'emp0119', Employee_Code: '0119', Account_Status: 'ACTIVE' },
    { Kintone_User_Code: 'admin-form', Employee_Code: 'ADMIN', Account_Status: 'ACTIVE' }
  ];

  const initial0118Cred = MboPasswordDomainService.provisionInitialCredential({
    employeeCode: '0118',
    kintoneUserCode: 'emp0118'
  });

  const initial0119Cred = MboPasswordDomainService.provisionInitialCredential({
    employeeCode: '0119',
    kintoneUserCode: 'emp0119'
  });

  await t.test('1. Initial login returns PASSWORD_CHANGE_REQUIRED state', async () => {
    const credStore = new FakeCredentialStore({ '0118': initial0118Cred });
    const sessStore = new FakeSessionStore();
    const service = new MboAuthSessionService({ credentialStore: credStore, sessionStore: sessStore, userMappings });

    const res = await service.login({ kintoneUserCode: 'emp0118', mboUsername: '0118', password: '0118' });

    assert.equal(res.status, 'PASSWORD_CHANGE_REQUIRED');
    assert.equal(res.employeeCode, '0118');
    assert.equal(res.requiresPasswordChange, true);
    assert.ok(res.sessionToken);
    assert.equal(res.Password_Hash, undefined);
  });

  await t.test('2. Password-change-required session cannot obtain authorized MBO data principal', async () => {
    const credStore = new FakeCredentialStore({ '0118': initial0118Cred });
    const sessStore = new FakeSessionStore();
    const service = new MboAuthSessionService({ credentialStore: credStore, sessionStore: sessStore, userMappings });

    const res = await service.login({ kintoneUserCode: 'emp0118', mboUsername: '0118', password: '0118' });
    const principal = await service.getAuthenticatedPrincipal(res.sessionToken);

    assert.equal(principal, null);
  });

  await t.test('3. Username not equal to bound Employee_Code is DENIED', async () => {
    const credStore = new FakeCredentialStore({ '0118': initial0118Cred });
    const sessStore = new FakeSessionStore();
    const service = new MboAuthSessionService({ credentialStore: credStore, sessionStore: sessStore, userMappings });

    const res = await service.login({ kintoneUserCode: 'emp0118', mboUsername: '0119', password: '0118' });

    assert.equal(res.status, 'USERNAME_MISMATCH');
  });

  await t.test('4. Wrong password fails and updates failed attempt count', async () => {
    const credStore = new FakeCredentialStore({ '0118': initial0118Cred });
    const sessStore = new FakeSessionStore();
    const service = new MboAuthSessionService({ credentialStore: credStore, sessionStore: sessStore, userMappings });

    const res = await service.login({ kintoneUserCode: 'emp0118', mboUsername: '0118', password: 'wrongpassword' });

    assert.equal(res.status, 'INVALID_CREDENTIALS');
    const updatedCred = await credStore.getCredential('0118');
    assert.equal(updatedCred.Failed_Login_Count, 1);
  });

  await t.test('5. Lockout result is persisted and fails closed', async () => {
    const lockedCred = { ...initial0118Cred, Locked_Until: new Date(Date.now() + 600000).toISOString() };
    const credStore = new FakeCredentialStore({ '0118': lockedCred });
    const sessStore = new FakeSessionStore();
    const service = new MboAuthSessionService({ credentialStore: credStore, sessionStore: sessStore, userMappings });

    const res = await service.login({ kintoneUserCode: 'emp0118', mboUsername: '0118', password: '0118' });

    assert.equal(res.status, 'ACCOUNT_LOCKED');
  });

  await t.test('6. Normal login returns opaque session and sanitized result with NO Password_Hash', async () => {
    const normalCred = MboPasswordDomainService.changePassword({
      credentialRecord: initial0118Cred,
      newPassword: 'SecurePassword123!',
      passwordMaxAgeDays: 90
    });

    const credStore = new FakeCredentialStore({ '0118': normalCred });
    const sessStore = new FakeSessionStore();
    const service = new MboAuthSessionService({ credentialStore: credStore, sessionStore: sessStore, userMappings });

    const res = await service.login({ kintoneUserCode: 'emp0118', mboUsername: '0118', password: 'SecurePassword123!' });

    assert.equal(res.status, 'AUTHENTICATED_SUCCESS');
    assert.ok(res.sessionToken);
    assert.equal(res.Password_Hash, undefined);
    assert.equal(res.salt, undefined);

    const principal = await service.getAuthenticatedPrincipal(res.sessionToken);
    assert.equal(principal.employeeCode, '0118');
    assert.equal(principal.kintoneUserCode, 'emp0118');
  });

  await t.test('7. Session principal for Employee A cannot access Employee B records', async () => {
    const normalCred = MboPasswordDomainService.changePassword({
      credentialRecord: initial0118Cred,
      newPassword: 'SecurePassword123!',
      passwordMaxAgeDays: 90
    });

    const credStore = new FakeCredentialStore({ '0118': normalCred });
    const sessStore = new FakeSessionStore();
    const service = new MboAuthSessionService({ credentialStore: credStore, sessionStore: sessStore, userMappings });

    const loginRes = await service.login({ kintoneUserCode: 'emp0118', mboUsername: '0118', password: 'SecurePassword123!' });
    const principal = await service.getAuthenticatedPrincipal(loginRes.sessionToken);

    // Attempt to access Employee 0119 records
    const authResult = MboIdentityService.authorizeEmployeeRecordAccess({
      authenticatedUser: principal,
      targetEmployeeCode: '0119',
      userRole: 'EMPLOYEE'
    });

    assert.equal(authResult.authorized, false);
    assert.equal(authResult.code, 'EMPLOYEE_A_CANNOT_ACCESS_EMPLOYEE_B');
  });

  await t.test('8. Force-change rejects Employee_Code default password as new password', async () => {
    const credStore = new FakeCredentialStore({ '0118': initial0118Cred });
    const sessStore = new FakeSessionStore();
    const service = new MboAuthSessionService({ credentialStore: credStore, sessionStore: sessStore, userMappings });

    const loginRes = await service.login({ kintoneUserCode: 'emp0118', mboUsername: '0118', password: '0118' });

    await assert.rejects(async () => {
      await service.changePassword({
        sessionToken: loginRes.sessionToken,
        newPassword: '0118'
      });
    }, { message: /CANNOT_REUSE_DEFAULT_PASSWORD/ });
  });

  await t.test('9. After successful password change, old password fails and new password authenticates', async () => {
    const credStore = new FakeCredentialStore({ '0118': initial0118Cred });
    const sessStore = new FakeSessionStore();
    const service = new MboAuthSessionService({ credentialStore: credStore, sessionStore: sessStore, userMappings });

    const loginRes = await service.login({ kintoneUserCode: 'emp0118', mboUsername: '0118', password: '0118' });
    const changeRes = await service.changePassword({
      sessionToken: loginRes.sessionToken,
      newPassword: 'NewSecurePassword123!'
    });

    assert.equal(changeRes.status, 'PASSWORD_CHANGED_SUCCESS');

    // Old password '0118' now fails
    const oldLoginRes = await service.login({ kintoneUserCode: 'emp0118', mboUsername: '0118', password: '0118' });
    assert.equal(oldLoginRes.status, 'INVALID_CREDENTIALS');

    // New password authenticates
    const newLoginRes = await service.login({ kintoneUserCode: 'emp0118', mboUsername: '0118', password: 'NewSecurePassword123!' });
    assert.equal(newLoginRes.status, 'AUTHENTICATED_SUCCESS');
  });

  await t.test('10. Normal own-password change requires current password proof', async () => {
    const normalCred = MboPasswordDomainService.changePassword({
      credentialRecord: initial0118Cred,
      newPassword: 'CurrentSecurePass1!',
      passwordMaxAgeDays: 90
    });

    const credStore = new FakeCredentialStore({ '0118': normalCred });
    const sessStore = new FakeSessionStore();
    const service = new MboAuthSessionService({ credentialStore: credStore, sessionStore: sessStore, userMappings });

    const loginRes = await service.login({ kintoneUserCode: 'emp0118', mboUsername: '0118', password: 'CurrentSecurePass1!' });

    // Missing current password -> error
    await assert.rejects(async () => {
      await service.changePassword({
        sessionToken: loginRes.sessionToken,
        newPassword: 'NextSecurePass2!'
      });
    }, { message: /CURRENT_PASSWORD_REQUIRED/ });

    // Wrong current password -> error
    await assert.rejects(async () => {
      await service.changePassword({
        sessionToken: loginRes.sessionToken,
        currentPassword: 'WrongCurrentPassword',
        newPassword: 'NextSecurePass2!'
      });
    }, { message: /INVALID_CURRENT_PASSWORD/ });

    // Valid current password -> success
    const changeRes = await service.changePassword({
      sessionToken: loginRes.sessionToken,
      currentPassword: 'CurrentSecurePass1!',
      newPassword: 'NextSecurePass2!'
    });

    assert.equal(changeRes.status, 'PASSWORD_CHANGED_SUCCESS');
  });

  await t.test('11. Logout invalidates session token', async () => {
    const normalCred = MboPasswordDomainService.changePassword({
      credentialRecord: initial0118Cred,
      newPassword: 'SecurePassword123!',
      passwordMaxAgeDays: 90
    });

    const credStore = new FakeCredentialStore({ '0118': normalCred });
    const sessStore = new FakeSessionStore();
    const service = new MboAuthSessionService({ credentialStore: credStore, sessionStore: sessStore, userMappings });

    const loginRes = await service.login({ kintoneUserCode: 'emp0118', mboUsername: '0118', password: 'SecurePassword123!' });
    const token = loginRes.sessionToken;

    const principalBefore = await service.getAuthenticatedPrincipal(token);
    assert.ok(principalBefore);

    await service.logout(token);

    const principalAfter = await service.getAuthenticatedPrincipal(token);
    assert.equal(principalAfter, null);
  });

  await t.test('12. Technical admin cannot become an employee-self principal through auth service', async () => {
    const credStore = new FakeCredentialStore({ '0118': initial0118Cred });
    const sessStore = new FakeSessionStore();
    const service = new MboAuthSessionService({ credentialStore: credStore, sessionStore: sessStore, userMappings });

    const res = await service.login({ kintoneUserCode: 'admin-form', mboUsername: 'ADMIN', password: '0118' });

    assert.equal(res.status, 'TECHNICAL_ADMIN_CANNOT_BECOME_EMPLOYEE_SELF');
  });
});
