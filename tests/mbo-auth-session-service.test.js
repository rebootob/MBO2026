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

class ReadOnlyCredentialStore {
  constructor(initialData = {}) {
    this.credentials = new Map(Object.entries(initialData));
  }

  async getCredential(empCode) {
    const cred = this.credentials.get(empCode);
    return cred ? JSON.parse(JSON.stringify(cred)) : null;
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

class NoDeleteSessionStore {
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
}

test('D1-A Trusted Auth & Opaque Session Core Test Suite (Final Revocation Corrective)', async (t) => {
  const userMappings = [
    { Kintone_User_Code: 'emp0118', Employee_Code: '0118', Account_Status: 'ACTIVE' },
    { Kintone_User_Code: 'emp0119', Employee_Code: '0119', Account_Status: 'ACTIVE' },
    { Kintone_User_Code: 'admin-form', Employee_Code: 'ADMIN', Account_Status: 'ACTIVE' }
  ];

  const initial0118Cred = MboPasswordDomainService.provisionInitialCredential({
    employeeCode: '0118',
    kintoneUserCode: 'emp0118'
  });

  // Login Revocation-Capability Gate 1: Initial login fails closed if deleteSession is missing
  await t.test('G1. Initial login fails closed without issuing session token if deleteSession capability is missing', async () => {
    const credStore = new FakeCredentialStore({ '0118': initial0118Cred });
    const noDeleteSessStore = new NoDeleteSessionStore();
    const service = new MboAuthSessionService({ credentialStore: credStore, sessionStore: noDeleteSessStore, userMappings });

    await assert.rejects(async () => {
      await service.login({ kintoneUserCode: 'emp0118', mboUsername: '0118', password: '0118' });
    }, { message: /SESSION_STORE_INCOMPLETE/ });
  });

  // Login Revocation-Capability Gate 2: Normal login fails closed if deleteSession is missing
  await t.test('G2. Normal login fails closed without issuing session token if deleteSession capability is missing', async () => {
    const normalCred = MboPasswordDomainService.changePassword({
      credentialRecord: initial0118Cred,
      newPassword: 'SecurePassword123!',
      passwordMaxAgeDays: 90
    });
    const credStore = new FakeCredentialStore({ '0118': normalCred });
    const noDeleteSessStore = new NoDeleteSessionStore();
    const service = new MboAuthSessionService({ credentialStore: credStore, sessionStore: noDeleteSessStore, userMappings });

    await assert.rejects(async () => {
      await service.login({ kintoneUserCode: 'emp0118', mboUsername: '0118', password: 'SecurePassword123!' });
    }, { message: /SESSION_STORE_INCOMPLETE/ });
  });

  // Revocation Test 1: sessionStore without deleteSession() => changePassword fails closed
  await t.test('R1. changePassword() fails closed if sessionStore deleteSession capability is missing', async () => {
    const credStore = new FakeCredentialStore({ '0118': initial0118Cred });
    const noDeleteSessStore = new NoDeleteSessionStore();
    const service = new MboAuthSessionService({ credentialStore: credStore, sessionStore: noDeleteSessStore, userMappings });

    const rawToken = 'force_token_123';
    const tokenHash = MboAuthSessionService.hashToken(rawToken);
    await noDeleteSessStore.setSession(tokenHash, {
      tokenHash,
      employeeCode: '0118',
      kintoneUserCode: 'emp0118',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
      requiresPasswordChange: true,
      isDataAuthorized: false
    });

    await assert.rejects(async () => {
      await service.changePassword({ sessionToken: rawToken, newPassword: 'NewSecurePassword123!' });
    }, { message: /SESSION_STORE_INCOMPLETE/ });
  });

  // Revocation Test 2: Successful password change revokes old token and issues new token
  await t.test('R2. Successful password change revokes old token and activates new token', async () => {
    const credStore = new FakeCredentialStore({ '0118': initial0118Cred });
    const sessStore = new FakeSessionStore();
    const service = new MboAuthSessionService({ credentialStore: credStore, sessionStore: sessStore, userMappings });

    const loginRes = await service.login({ kintoneUserCode: 'emp0118', mboUsername: '0118', password: '0118' });
    const oldToken = loginRes.sessionToken;

    const changeRes = await service.changePassword({ sessionToken: oldToken, newPassword: 'NewSecurePassword123!' });
    const newToken = changeRes.sessionToken;

    // Old token MUST produce null principal
    const oldPrincipal = await service.getAuthenticatedPrincipal(oldToken);
    assert.equal(oldPrincipal, null);

    // New token MUST produce valid principal
    const newPrincipal = await service.getAuthenticatedPrincipal(newToken);
    assert.ok(newPrincipal);
    assert.equal(newPrincipal.employeeCode, '0118');
  });

  // Revocation Test 3: sessionStore without deleteSession() => logout fails closed
  await t.test('R3. logout() fails closed if sessionStore deleteSession capability is missing', async () => {
    const noDeleteSessStore = new NoDeleteSessionStore();
    const service = new MboAuthSessionService({ sessionStore: noDeleteSessStore, userMappings });

    await assert.rejects(async () => {
      await service.logout('some_active_token');
    }, { message: /SESSION_STORE_INCOMPLETE/ });
  });

  // Revocation Test 4: Successful logout invalidates session token
  await t.test('R4. Successful logout invalidates session token', async () => {
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

    assert.ok(await service.getAuthenticatedPrincipal(token));
    const logoutRes = await service.logout(token);
    assert.equal(logoutRes.status, 'LOGGED_OUT');
    assert.equal(await service.getAuthenticatedPrincipal(token), null);
  });

  // B1.1: Missing updateCredential fails closed / configuration error
  await t.test('B1.1 Missing updateCredential in credentialStore fails closed on login', async () => {
    const readOnlyStore = new ReadOnlyCredentialStore({ '0118': initial0118Cred });
    const sessStore = new FakeSessionStore();
    const service = new MboAuthSessionService({ credentialStore: readOnlyStore, sessionStore: sessStore, userMappings });

    await assert.rejects(async () => {
      await service.login({ kintoneUserCode: 'emp0118', mboUsername: '0118', password: '0118' });
    }, { message: /CREDENTIAL_STORE_INCOMPLETE/ });
  });

  // B1.2: Failed count 4 + wrong password => persists count 5 and non-null Locked_Until
  await t.test('B1.2 Failed count 4 + wrong password persists count 5 and non-null Locked_Until', async () => {
    const cred4 = { ...initial0118Cred, Failed_Login_Count: 4 };
    const credStore = new FakeCredentialStore({ '0118': cred4 });
    const sessStore = new FakeSessionStore();
    const service = new MboAuthSessionService({ credentialStore: credStore, sessionStore: sessStore, userMappings });

    const res = await service.login({ kintoneUserCode: 'emp0118', mboUsername: '0118', password: 'wrongpassword' });

    assert.equal(res.status, 'INVALID_CREDENTIALS');
    assert.equal(res.reason, 'Account is locked.');

    const updatedCred = await credStore.getCredential('0118');
    assert.equal(updatedCred.Failed_Login_Count, 5);
    assert.ok(updatedCred.Locked_Until);
  });

  // B2.1: Expired force-change session cannot change password
  await t.test('B2.1 Expired force-change session cannot change password', async () => {
    const credStore = new FakeCredentialStore({ '0118': initial0118Cred });
    const sessStore = new FakeSessionStore();
    const service = new MboAuthSessionService({ credentialStore: credStore, sessionStore: sessStore, userMappings });

    const rawToken = 'force_token_123';
    const tokenHash = MboAuthSessionService.hashToken(rawToken);
    await sessStore.setSession(tokenHash, {
      tokenHash,
      employeeCode: '0118',
      kintoneUserCode: 'emp0118',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      expiresAt: new Date(Date.now() - 3600000).toISOString(), // expired 1hr ago
      requiresPasswordChange: true,
      isDataAuthorized: false
    });

    await assert.rejects(async () => {
      await service.changePassword({ sessionToken: rawToken, newPassword: 'NewSecurePassword123!' });
    }, { message: /EXPIRED_SESSION/ });
  });

  // B2.2: Expired normal session cannot change password
  await t.test('B2.2 Expired normal session cannot change password', async () => {
    const normalCred = MboPasswordDomainService.changePassword({
      credentialRecord: initial0118Cred,
      newPassword: 'CurrentPassword123!',
      passwordMaxAgeDays: 90
    });
    const credStore = new FakeCredentialStore({ '0118': normalCred });
    const sessStore = new FakeSessionStore();
    const service = new MboAuthSessionService({ credentialStore: credStore, sessionStore: sessStore, userMappings });

    const rawToken = 'normal_token_123';
    const tokenHash = MboAuthSessionService.hashToken(rawToken);
    await sessStore.setSession(tokenHash, {
      tokenHash,
      employeeCode: '0118',
      kintoneUserCode: 'emp0118',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      expiresAt: new Date(Date.now() - 3600000).toISOString(), // expired 1hr ago
      requiresPasswordChange: false,
      isDataAuthorized: true
    });

    await assert.rejects(async () => {
      await service.changePassword({ sessionToken: rawToken, currentPassword: 'CurrentPassword123!', newPassword: 'NextPassword123!' });
    }, { message: /EXPIRED_SESSION/ });
  });

  // B2.3: Malformed session state flags cannot change password
  await t.test('B2.3 Malformed session state flags fail closed on changePassword', async () => {
    const credStore = new FakeCredentialStore({ '0118': initial0118Cred });
    const sessStore = new FakeSessionStore();
    const service = new MboAuthSessionService({ credentialStore: credStore, sessionStore: sessStore, userMappings });

    const rawToken = 'malformed_token_123';
    const tokenHash = MboAuthSessionService.hashToken(rawToken);
    await sessStore.setSession(tokenHash, {
      tokenHash,
      employeeCode: '0118',
      kintoneUserCode: 'emp0118',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
      requiresPasswordChange: true,
      isDataAuthorized: true
    });

    await assert.rejects(async () => {
      await service.changePassword({ sessionToken: rawToken, newPassword: 'NewSecurePassword123!' });
    }, { message: /MALFORMED_SESSION_STATE/ });
  });

  // B2.4: Missing or invalid expiresAt cannot produce authenticated principal
  await t.test('B2.4 Missing or invalid expiresAt cannot produce authenticated principal', async () => {
    const sessStore = new FakeSessionStore();
    const service = new MboAuthSessionService({ sessionStore: sessStore, userMappings });

    const rawToken1 = 'token_no_exp';
    const hash1 = MboAuthSessionService.hashToken(rawToken1);
    await sessStore.setSession(hash1, { tokenHash: hash1, employeeCode: '0118', requiresPasswordChange: false, isDataAuthorized: true });
    assert.equal(await service.getAuthenticatedPrincipal(rawToken1), null);

    const rawToken2 = 'token_bad_exp';
    const hash2 = MboAuthSessionService.hashToken(rawToken2);
    await sessStore.setSession(hash2, { tokenHash: hash2, employeeCode: '0118', expiresAt: 'INVALID_DATE', requiresPasswordChange: false, isDataAuthorized: true });
    assert.equal(await service.getAuthenticatedPrincipal(rawToken2), null);
  });

  // Standard D1-A Core Acceptance Tests
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

    const oldLoginRes = await service.login({ kintoneUserCode: 'emp0118', mboUsername: '0118', password: '0118' });
    assert.equal(oldLoginRes.status, 'INVALID_CREDENTIALS');

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

    await assert.rejects(async () => {
      await service.changePassword({
        sessionToken: loginRes.sessionToken,
        newPassword: 'NextSecurePass2!'
      });
    }, { message: /CURRENT_PASSWORD_REQUIRED/ });

    await assert.rejects(async () => {
      await service.changePassword({
        sessionToken: loginRes.sessionToken,
        currentPassword: 'WrongCurrentPassword',
        newPassword: 'NextSecurePass2!'
      });
    }, { message: /INVALID_CURRENT_PASSWORD/ });

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
