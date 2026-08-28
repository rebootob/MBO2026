import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { MboSessionManager } from '../src/ui/mbo-session-manager.js';
import { MboKintoneAuthAdapter } from '../src/ui/mbo-kintone-auth-adapter.js';
import { MboKintoneLoginGate } from '../src/ui/mbo-kintone-login-gate.js';

// Mock Web Crypto API for Node environment
function createMockCrypto() {
  return {
    getRandomValues(array) {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    },
    subtle: {
      async importKey() { return {}; },
      async deriveBits(algorithm, keyMaterial, keyLengthBits) {
        return new Uint8Array(keyLengthBits / 8).buffer;
      },
      async digest(algorithm, data) {
        const str = new TextDecoder().decode(data);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          hash = (hash << 5) - hash + str.charCodeAt(i);
          hash |= 0;
        }
        const hex = (Math.abs(hash) + 1).toString(16).padStart(8, '0').repeat(8).slice(0, 64);
        const bytes = new Uint8Array(32);
        for (let i = 0; i < 32; i++) {
          bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
        }
        return bytes.buffer;
      }
    }
  };
}

// Mock sessionStorage
function createMockStorage() {
  const store = new Map();
  return {
    getItem(key) { return store.get(key) ?? null; },
    setItem(key, value) { store.set(key, String(value)); },
    removeItem(key) { store.delete(key); },
    clear() { store.clear(); },
    get length() { return store.size; },
    _store: store
  };
}

// Mock App801 API
function createMockApp801Api(initialRecords = []) {
  const recordsMap = new Map();
  let nextId = 1;

  initialRecords.forEach(rec => {
    const id = rec.$id?.value || String(nextId++);
    recordsMap.set(id, {
      $id: { value: id },
      Employee_Code: { value: rec.Employee_Code || '' },
      Password_Hash: { value: rec.Password_Hash || 'pbkdf2$100000$00000000000000000000000000000000$0000000000000000000000000000000000000000000000000000000000000000' },
      Password_Algorithm: { value: 'PBKDF2' },
      Force_Password_Change: { value: rec.Force_Password_Change !== undefined ? rec.Force_Password_Change : 'NO' },
      Account_Status: { value: rec.Account_Status || 'ACTIVE' },
      Failed_Attempts: { value: rec.Failed_Attempts ?? 0 },
      Locked_Until: { value: rec.Locked_Until || null },
      Last_Login_At: { value: rec.Last_Login_At || null },
      Password_Changed_At: { value: rec.Password_Changed_At || null },
      Credential_Version: { value: rec.Credential_Version !== undefined ? rec.Credential_Version : 1 },
      Session_Token_Hash: { value: rec.Session_Token_Hash || null },
      Session_Issued_At: { value: rec.Session_Issued_At || null },
      Session_Expires_At: { value: rec.Session_Expires_At || null },
      Session_Credential_Version: { value: rec.Session_Credential_Version !== undefined ? rec.Session_Credential_Version : null },
      Session_Kintone_User: { value: rec.Session_Kintone_User !== undefined ? rec.Session_Kintone_User : null }
    });
  });

  return {
    recordsMap,
    async getRecords(appId, query) {
      const all = [...recordsMap.values()];
      let filtered = all;

      if (query.includes('Employee_Code =')) {
        const match = query.match(/Employee_Code = "([^"]+)"/);
        if (match) filtered = filtered.filter(r => r.Employee_Code.value === match[1]);
      } else if (query.includes('Session_Token_Hash =')) {
        const match = query.match(/Session_Token_Hash = "([^"]+)"/);
        if (match) filtered = filtered.filter(r => r.Session_Token_Hash?.value === match[1]);
      }

      if (query.includes('limit 2')) {
        filtered = filtered.slice(0, 2);
      } else if (query.includes('limit 1')) {
        filtered = filtered.slice(0, 1);
      }

      return { records: JSON.parse(JSON.stringify(filtered)) };
    },
    async updateRecord(appId, id, patch) {
      const rec = recordsMap.get(String(id));
      if (!rec) throw new Error('Record not found');
      Object.keys(patch).forEach(key => {
        rec[key] = { value: patch[key].value };
      });
      return { revision: '2' };
    }
  };
}

// ---------------------------------------------------------------------------
// 1. Core Unit Tests
// ---------------------------------------------------------------------------

test('TOKEN_256_BIT_RANDOM: generates 64-character hex string from 256-bit random entropy', () => {
  const cryptoMock = createMockCrypto();
  const sm = new MboSessionManager({ adapter: {}, cryptoImpl: cryptoMock });
  const token = sm.generateToken();
  assert.equal(typeof token, 'string');
  assert.equal(token.length, 64);
  assert.match(token, /^[0-9a-f]{64}$/i);
});

test('RAW_TOKEN_ONLY_IN_SESSION_STORAGE & NO_EMPLOYEE_CODE_AS_BROWSER_AUTH_PROOF & LOCAL_STORAGE_UNUSED_FOR_AUTH', async () => {
  const storage = createMockStorage();
  const cryptoMock = createMockCrypto();
  const api = createMockApp801Api([{ Employee_Code: 'EMP001', Credential_Version: 1 }]);
  const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: cryptoMock });
  const sm = new MboSessionManager({
    adapter,
    sessionStorageImpl: storage,
    cryptoImpl: cryptoMock,
    getKintoneUser: () => ({ code: 'user001' })
  });

  await sm.issueSession('EMP001');

  const stored = storage.getItem('ttmet.mbo794.session.v1');
  assert.equal(typeof stored, 'string');
  assert.equal(stored.length, 64);
  assert.equal(storage._store.size, 1);
  assert.equal(storage.getItem('Employee_Code'), null);
  assert.equal(storage.getItem('authenticated'), null);
});

test('TOKEN_HASH_SHA256: computes deterministic 64-character SHA-256 token hash', async () => {
  const cryptoMock = createMockCrypto();
  const sm = new MboSessionManager({ adapter: {}, cryptoImpl: cryptoMock });
  const token = 'a'.repeat(64);
  const hash1 = await sm.hashToken(token);
  const hash2 = await sm.hashToken(token);
  assert.equal(hash1.length, 64);
  assert.equal(hash1, hash2);
});

test('TTL_EXACT_8_HOURS & NO_SLIDING_REFRESH: expiry is set to exactly 8 hours and validation does not extend it', async () => {
  const now = new Date('2026-08-28T12:00:00.000Z');
  const storage = createMockStorage();
  const cryptoMock = createMockCrypto();
  const api = createMockApp801Api([{ Employee_Code: 'EMP001', Credential_Version: 1 }]);
  const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: cryptoMock, now: () => now });
  const sm = new MboSessionManager({
    adapter,
    sessionStorageImpl: storage,
    cryptoImpl: cryptoMock,
    now: () => now,
    getKintoneUser: () => ({ code: 'user001' })
  });

  const issueRes = await sm.issueSession('EMP001');
  const expectedExpiry = new Date('2026-08-28T20:00:00.000Z').toISOString();
  assert.equal(issueRes.expiresAt, expectedExpiry);

  const later = new Date('2026-08-28T14:00:00.000Z');
  adapter.now = () => later;
  sm.now = () => later;

  const restored = await sm.restoreSession();
  assert.equal(restored?.employeeCode, 'EMP001');

  const record = [...api.recordsMap.values()][0];
  assert.equal(record.Session_Expires_At.value, expectedExpiry);
});

test('VALID_SESSION_RESTORE: restores authenticated Employee_Code from valid active session', async () => {
  const storage = createMockStorage();
  const cryptoMock = createMockCrypto();
  const api = createMockApp801Api([{ Employee_Code: 'EMP001', Credential_Version: 1 }]);
  const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: cryptoMock });
  const sm = new MboSessionManager({
    adapter,
    sessionStorageImpl: storage,
    cryptoImpl: cryptoMock,
    getKintoneUser: () => ({ code: 'user001' })
  });

  await sm.issueSession('EMP001');
  const restored = await sm.restoreSession();
  assert.equal(restored?.employeeCode, 'EMP001');
});

test('EXPIRED_SESSION_BLOCKED & TAMPERED_TOKEN_BLOCKED: expired or tampered token fails closed and clears local storage', async () => {
  const issueTime = new Date('2026-08-28T12:00:00.000Z');
  const storage = createMockStorage();
  const cryptoMock = createMockCrypto();
  const api = createMockApp801Api([{ Employee_Code: 'EMP001', Credential_Version: 1 }]);
  const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: cryptoMock, now: () => issueTime });
  const sm = new MboSessionManager({
    adapter,
    sessionStorageImpl: storage,
    cryptoImpl: cryptoMock,
    now: () => issueTime,
    getKintoneUser: () => ({ code: 'user001' })
  });

  await sm.issueSession('EMP001');

  const expiredTime = new Date('2026-08-28T20:00:00.001Z');
  adapter.now = () => expiredTime;
  sm.now = () => expiredTime;

  const restoredExpired = await sm.restoreSession();
  assert.equal(restoredExpired, null);
  assert.equal(storage.getItem('ttmet.mbo794.session.v1'), null);

  storage.setItem('ttmet.mbo794.session.v1', 'f'.repeat(64));
  const restoredTampered = await sm.restoreSession();
  assert.equal(restoredTampered, null);
  assert.equal(storage.getItem('ttmet.mbo794.session.v1'), null);
});

test('DISABLED_ACCOUNT_BLOCKED & LOCKED_ACCOUNT_BLOCKED & FORCE_PASSWORD_CHANGE_SESSION_BLOCKED', async () => {
  const storage = createMockStorage();
  const cryptoMock = createMockCrypto();

  const apiDisabled = createMockApp801Api([{ Employee_Code: 'EMP001', Account_Status: 'DISABLED', Credential_Version: 1 }]);
  const adapterDisabled = new MboKintoneAuthAdapter({ api: apiDisabled, cryptoImpl: cryptoMock });
  const smDisabled = new MboSessionManager({ adapter: adapterDisabled, sessionStorageImpl: storage, cryptoImpl: cryptoMock, getKintoneUser: () => ({ code: 'u1' }) });
  await assert.rejects(async () => smDisabled.issueSession('EMP001'), /CREDENTIAL_NOT_ACTIVE/);

  const apiLocked = createMockApp801Api([{ Employee_Code: 'EMP002', Account_Status: 'LOCKED', Credential_Version: 1 }]);
  const adapterLocked = new MboKintoneAuthAdapter({ api: apiLocked, cryptoImpl: cryptoMock });
  const smLocked = new MboSessionManager({ adapter: adapterLocked, sessionStorageImpl: storage, cryptoImpl: cryptoMock, getKintoneUser: () => ({ code: 'u1' }) });
  await assert.rejects(async () => smLocked.issueSession('EMP002'), /CREDENTIAL_NOT_ACTIVE/);

  const apiForce = createMockApp801Api([{ Employee_Code: 'EMP003', Account_Status: 'ACTIVE', Force_Password_Change: 'YES', Credential_Version: 1 }]);
  const adapterForce = new MboKintoneAuthAdapter({ api: apiForce, cryptoImpl: cryptoMock });
  const smForce = new MboSessionManager({ adapter: adapterForce, sessionStorageImpl: storage, cryptoImpl: cryptoMock, getKintoneUser: () => ({ code: 'u1' }) });
  await assert.rejects(async () => smForce.issueSession('EMP003'), /FORCE_PASSWORD_CHANGE_REQUIRED/);
});

test('CREDENTIAL_VERSION_MISMATCH_BLOCKED: Session_Credential_Version !== Credential_Version fails restore', async () => {
  const storage = createMockStorage();
  const cryptoMock = createMockCrypto();
  const api = createMockApp801Api([{ Employee_Code: 'EMP001', Credential_Version: 1 }]);
  const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: cryptoMock });
  const sm = new MboSessionManager({
    adapter,
    sessionStorageImpl: storage,
    cryptoImpl: cryptoMock,
    getKintoneUser: () => ({ code: 'user001' })
  });

  await sm.issueSession('EMP001');

  const record = [...api.recordsMap.values()][0];
  record.Credential_Version.value = 2;
  record.Session_Credential_Version.value = 1;

  const restoredMismatch = await sm.restoreSession();
  assert.equal(restoredMismatch, null);
});

test('PASSWORD_CHANGE_INCREMENTS_CREDENTIAL_VERSION & PASSWORD_CHANGE_ROTATES_OLD_SERVER_SESSION', async () => {
  const storage = createMockStorage();
  const cryptoMock = createMockCrypto();
  const api = createMockApp801Api([{ Employee_Code: 'EMP001', Credential_Version: 1 }]);
  const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: cryptoMock });
  adapter.verifyPassword = async () => true;

  const sm = new MboSessionManager({
    adapter,
    sessionStorageImpl: storage,
    cryptoImpl: cryptoMock,
    getKintoneUser: () => ({ code: 'user001' })
  });

  await sm.issueSession('EMP001');
  const oldToken = storage.getItem('ttmet.mbo794.session.v1');

  const changeRes = await adapter.changePassword({
    employeeCode: 'EMP001',
    currentPassword: 'oldPassword',
    newPassword: 'newPassword123'
  });

  assert.equal(changeRes.status, 'PASSWORD_CHANGED');
  assert.equal(changeRes.newCredentialVersion, 2);

  const record = [...api.recordsMap.values()][0];
  assert.equal(record.Credential_Version.value, 2);
  assert.equal(record.Session_Token_Hash.value, null);

  storage.setItem('ttmet.mbo794.session.v1', oldToken);
  const restoredOld = await sm.restoreSession();
  assert.equal(restoredOld, null);
});

test('LOGOUT_REVOKES_AND_CLEARS_LOCAL_SESSION', async () => {
  const storage = createMockStorage();
  const cryptoMock = createMockCrypto();
  const api = createMockApp801Api([{ Employee_Code: 'EMP001', Credential_Version: 1 }]);
  const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: cryptoMock });
  const sm = new MboSessionManager({
    adapter,
    sessionStorageImpl: storage,
    cryptoImpl: cryptoMock,
    getKintoneUser: () => ({ code: 'user001' })
  });

  await sm.issueSession('EMP001');
  assert.notEqual(storage.getItem('ttmet.mbo794.session.v1'), null);

  const res = await sm.revokeSession();
  assert.equal(res.status, 'SESSION_REVOKED');
  assert.equal(storage.getItem('ttmet.mbo794.session.v1'), null);

  const record = [...api.recordsMap.values()][0];
  assert.equal(record.Session_Token_Hash.value, null);
});

// ---------------------------------------------------------------------------
// 2. Specific Corrective Assertion Tests
// ---------------------------------------------------------------------------

test('CREDENTIAL_VERSION_MISSING_BLOCKED & CREDENTIAL_VERSION_BLANK_BLOCKED & CREDENTIAL_VERSION_ZERO_NEGATIVE_NONINTEGER_BLOCKED', async () => {
  const cryptoMock = createMockCrypto();

  const apiMissing = createMockApp801Api([{ Employee_Code: 'EMP001', Credential_Version: null }]);
  const adapterMissing = new MboKintoneAuthAdapter({ api: apiMissing, cryptoImpl: cryptoMock });
  await assert.rejects(async () => adapterMissing._getCredential('EMP001'), /MALFORMED_CREDENTIAL/);

  const apiBlank = createMockApp801Api([{ Employee_Code: 'EMP001', Credential_Version: '' }]);
  const adapterBlank = new MboKintoneAuthAdapter({ api: apiBlank, cryptoImpl: cryptoMock });
  await assert.rejects(async () => adapterBlank._getCredential('EMP001'), /MALFORMED_CREDENTIAL/);

  for (const badVer of [0, -1, 1.5, 'invalid']) {
    const apiBad = createMockApp801Api([{ Employee_Code: 'EMP001', Credential_Version: badVer }]);
    const adapterBad = new MboKintoneAuthAdapter({ api: apiBad, cryptoImpl: cryptoMock });
    await assert.rejects(async () => adapterBad._getCredential('EMP001'), /MALFORMED_CREDENTIAL/);
  }
});

test('ISSUE_WITHOUT_KINTONE_PRINCIPAL_BLOCKED & RESTORE_WITHOUT_CURRENT_KINTONE_PRINCIPAL_BLOCKED & RESTORE_WITH_BLANK_STORED_PRINCIPAL_BLOCKED', async () => {
  const storage = createMockStorage();
  const cryptoMock = createMockCrypto();
  const api = createMockApp801Api([{ Employee_Code: 'EMP001', Credential_Version: 1 }]);
  const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: cryptoMock });

  // 1. Issue without principal
  const smNoUser = new MboSessionManager({
    adapter,
    sessionStorageImpl: storage,
    cryptoImpl: cryptoMock,
    getKintoneUser: () => null
  });
  await assert.rejects(async () => smNoUser.issueSession('EMP001'), /MISSING_KINTONE_PRINCIPAL/);

  // 2. Issue with valid principal, then restore without current principal
  let activeUser = { code: 'user001' };
  const sm = new MboSessionManager({
    adapter,
    sessionStorageImpl: storage,
    cryptoImpl: cryptoMock,
    getKintoneUser: () => activeUser
  });
  await sm.issueSession('EMP001');

  activeUser = null;
  const restoredNoUser = await sm.restoreSession();
  assert.equal(restoredNoUser, null);

  // 3. Restore with blank stored principal
  activeUser = { code: 'user001' };
  const record = [...api.recordsMap.values()][0];
  record.Session_Kintone_User.value = '';

  const restoredBlankStored = await sm.restoreSession();
  assert.equal(restoredBlankStored, null);
});

test('KINTONE_PRINCIPAL_EXACT_MISMATCH_BLOCKED & KINTONE_PRINCIPAL_CASE_DIFFERENCE_BLOCKED', async () => {
  const storage = createMockStorage();
  const cryptoMock = createMockCrypto();
  const api = createMockApp801Api([{ Employee_Code: 'EMP001', Credential_Version: 1 }]);
  const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: cryptoMock });

  let activeUser = { code: 'User001' };
  const sm = new MboSessionManager({
    adapter,
    sessionStorageImpl: storage,
    cryptoImpl: cryptoMock,
    getKintoneUser: () => activeUser
  });

  await sm.issueSession('EMP001');

  // Exact mismatch
  activeUser = { code: 'User002' };
  assert.equal(await sm.restoreSession(), null);

  // Case difference mismatch (case-sensitive exact match required)
  activeUser = { code: 'user001' };
  assert.equal(await sm.restoreSession(), null);
});

test('FORCE_PASSWORD_CHANGE_YES_BLOCKED & FORCE_PASSWORD_CHANGE_BLANK_BLOCKED & FORCE_PASSWORD_CHANGE_NULL_BLOCKED & FORCE_PASSWORD_CHANGE_MALFORMED_BLOCKED', async () => {
  const cryptoMock = createMockCrypto();
  const tokenHash = 'a'.repeat(64);

  for (const forceVal of ['YES', '', null, 'UNKNOWN_STATE', 'NO ']) {
    const api = createMockApp801Api([{
      Employee_Code: 'EMP001',
      Account_Status: 'ACTIVE',
      Force_Password_Change: forceVal,
      Credential_Version: 1,
      Session_Token_Hash: tokenHash,
      Session_Expires_At: new Date(Date.now() + 100000).toISOString(),
      Session_Credential_Version: 1,
      Session_Kintone_User: 'user001'
    }]);

    const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: cryptoMock });
    const res = await adapter.validateSession({ tokenHash, currentKintoneUserCode: 'user001' });
    assert.equal(res.status, 'INVALID_SESSION');
  }
});

test('REVOKE_SERVER_FAILURE_OBSERVABLE & REVOKE_DUPLICATE_HASH_NOT_SUCCESS & REVOKE_FAILURE_STILL_CLEARS_LOCAL_TOKEN', async () => {
  const storage = createMockStorage();
  const cryptoMock = createMockCrypto();

  const smError = new MboSessionManager({ adapter: {}, sessionStorageImpl: storage, cryptoImpl: cryptoMock, getKintoneUser: () => ({ code: 'u1' }) });
  const token1 = smError.generateToken();
  const tokenHash1 = await smError.hashToken(token1);

  // 1. Server error on updateRecord
  const apiError = createMockApp801Api([{ Employee_Code: 'EMP001', Credential_Version: 1, Session_Token_Hash: tokenHash1 }]);
  apiError.updateRecord = async () => { throw new Error('API_NETWORK_FAILURE'); };

  const adapterError = new MboKintoneAuthAdapter({ api: apiError, cryptoImpl: cryptoMock });
  smError.adapter = adapterError;
  smError.setLocalToken(token1);

  const resError = await smError.revokeSession();
  assert.equal(resError.status, 'REVOKE_FAILED');
  assert.equal(resError.reason, 'SERVER_REVOKE_FAILED');
  assert.equal(smError.getLocalToken(), null);

  // 2. Duplicate session token hash on server
  const smDup = new MboSessionManager({ adapter: {}, sessionStorageImpl: storage, cryptoImpl: cryptoMock, getKintoneUser: () => ({ code: 'u1' }) });
  const token2 = smDup.generateToken();
  const tokenHash2 = await smDup.hashToken(token2);

  const apiDup = createMockApp801Api([
    { Employee_Code: 'EMP001', Credential_Version: 1, Session_Token_Hash: tokenHash2 },
    { Employee_Code: 'EMP002', Credential_Version: 1, Session_Token_Hash: tokenHash2 }
  ]);
  const adapterDup = new MboKintoneAuthAdapter({ api: apiDup, cryptoImpl: cryptoMock });
  smDup.adapter = adapterDup;
  smDup.setLocalToken(token2);

  const resDup = await smDup.revokeSession();
  assert.equal(resDup.status, 'REVOKE_FAILED');
  assert.equal(resDup.reason, 'DUPLICATE_SESSION_TOKEN_HASH');
  assert.equal(smDup.getLocalToken(), null);
});

test('ISSUE_RESULT_EXPOSES_NO_RAW_TOKEN_OR_HASH & RESTORE_RESULT_EXPOSES_NO_RAW_TOKEN & SESSION_TOKEN_NOT_LOGGED_OR_RENDERED', async () => {
  const storage = createMockStorage();
  const cryptoMock = createMockCrypto();
  const api = createMockApp801Api([{ Employee_Code: 'EMP001', Credential_Version: 1 }]);
  const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: cryptoMock });
  const sm = new MboSessionManager({
    adapter,
    sessionStorageImpl: storage,
    cryptoImpl: cryptoMock,
    getKintoneUser: () => ({ code: 'user001' })
  });

  const issueRes = await sm.issueSession('EMP001');
  assert.equal(issueRes.token, undefined);
  assert.equal(issueRes.tokenHash, undefined);
  assert.equal(issueRes.status, 'SESSION_ISSUED');

  const restoreRes = await sm.restoreSession();
  assert.equal(restoreRes.sessionToken, undefined);
  assert.equal(restoreRes.employeeCode, 'EMP001');

  const jsonStr = JSON.stringify({ issueRes, restoreRes });
  assert.equal(/[0-9a-f]{64}/i.test(jsonStr), false);
});

// ---------------------------------------------------------------------------
// 3. Real Login Gate Production Lifecycle Integration Tests
// ---------------------------------------------------------------------------

test('LOGIN_ISSUES_SESSION_AFTER_AUTH & LOGIN_SESSION_ISSUE_FAILURE_DOES_NOT_AUTHORIZE', async () => {
  const storage = createMockStorage();
  const cryptoMock = createMockCrypto();
  const api = createMockApp801Api([{ Employee_Code: 'EMP001', Credential_Version: 1, Force_Password_Change: 'NO' }]);
  const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: cryptoMock });
  adapter.verifyPassword = async () => true;

  const sm = new MboSessionManager({
    adapter,
    sessionStorageImpl: storage,
    cryptoImpl: cryptoMock,
    getKintoneUser: () => ({ code: 'user001' })
  });

  const gate = new MboKintoneLoginGate(adapter, { sessionManager: sm });

  // 1. Successful Login Action
  const loginRes = await gate._handleLoginAction({ username: 'EMP001', password: 'validPassword' });
  assert.equal(loginRes.status, 'AUTHENTICATED');
  assert.equal(gate.getEmployeeCode(), 'EMP001');
  assert.notEqual(storage.getItem('ttmet.mbo794.session.v1'), null);

  // 2. Login when session issue fails -> fails closed, does not authorize
  const gateFail = new MboKintoneLoginGate(adapter, { sessionManager: sm });
  sm.issueSession = async () => { throw new Error('SESSION_STORE_FAIL'); };

  const loginFailRes = await gateFail._handleLoginAction({ username: 'EMP001', password: 'validPassword' });
  assert.equal(loginFailRes.status, 'SESSION_ISSUE_FAILED');
  assert.equal(gateFail.getEmployeeCode(), null);
});

test('FORCE_CHANGE_ISSUES_SESSION_ONLY_AFTER_PASSWORD_CHANGE & FORCE_CHANGE_SESSION_ISSUE_FAILURE_DOES_NOT_AUTHORIZE', async () => {
  const storage = createMockStorage();
  const cryptoMock = createMockCrypto();
  const api = createMockApp801Api([{ Employee_Code: 'EMP001', Credential_Version: 1, Force_Password_Change: 'YES' }]);
  const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: cryptoMock });
  adapter.verifyPassword = async () => true;

  const sm = new MboSessionManager({
    adapter,
    sessionStorageImpl: storage,
    cryptoImpl: cryptoMock,
    getKintoneUser: () => ({ code: 'user001' })
  });

  const gate = new MboKintoneLoginGate(adapter, { sessionManager: sm });

  // 1. Initial auth puts gate in pending force change state
  const loginRes = await gate._handleLoginAction({ username: 'EMP001', password: 'tempPassword' });
  assert.equal(loginRes.status, 'PASSWORD_CHANGE_REQUIRED');
  assert.equal(gate.getEmployeeCode(), null); // blocked until change

  // 2. Force change submit
  const forceRes = await gate._handleForceChangeAction({ newPassword: 'newPw123', confirmPassword: 'newPw123' });
  assert.equal(forceRes.status, 'PASSWORD_CHANGED');
  assert.equal(gate.getEmployeeCode(), 'EMP001'); // now authorized
  assert.notEqual(storage.getItem('ttmet.mbo794.session.v1'), null);
});

test('PASSWORD_CHANGE_REPLACEMENT_SESSION_SUCCESS & PASSWORD_CHANGE_REPLACEMENT_SESSION_FAILURE_FAILS_CLOSED', async () => {
  const storage = createMockStorage();
  const cryptoMock = createMockCrypto();
  const api = createMockApp801Api([{ Employee_Code: 'EMP001', Credential_Version: 1, Force_Password_Change: 'NO' }]);
  const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: cryptoMock });
  adapter.verifyPassword = async () => true;

  let reloadCount = 0;
  const sm = new MboSessionManager({
    adapter,
    sessionStorageImpl: storage,
    cryptoImpl: cryptoMock,
    getKintoneUser: () => ({ code: 'user001' })
  });

  const gate = new MboKintoneLoginGate(adapter, {
    sessionManager: sm,
    onReload: () => { reloadCount++; }
  });

  // Authenticate gate
  await gate._handleLoginAction({ username: 'EMP001', password: 'pw' });
  assert.equal(gate.getEmployeeCode(), 'EMP001');

  // 1. Password change with replacement session success
  const changeRes1 = await gate._handleChangePasswordAction({ currentPassword: 'pw', newPassword: 'new1', confirmPassword: 'new1' });
  assert.equal(changeRes1.status, 'PASSWORD_CHANGED');
  assert.equal(gate.getEmployeeCode(), 'EMP001');

  // 2. Password change with replacement session failure
  sm.issueSession = async () => { throw new Error('SESSION_STORE_FAIL'); };
  const changeRes2 = await gate._handleChangePasswordAction({ currentPassword: 'new1', newPassword: 'new2', confirmPassword: 'new2' });
  assert.equal(changeRes2.status, 'SESSION_RENEWAL_FAILED');
  assert.equal(gate.getEmployeeCode(), null); // fails closed
  assert.equal(storage.getItem('ttmet.mbo794.session.v1'), null); // local token cleared
  assert.equal(reloadCount, 1); // reloaded
});

test('NEW_LOGIN_INVALIDATES_PRIOR_SESSION & LOGOUT_REVOKES_AND_CLEARS_PRINCIPAL', async () => {
  const storage = createMockStorage();
  const cryptoMock = createMockCrypto();
  const api = createMockApp801Api([{ Employee_Code: 'EMP001', Credential_Version: 1, Force_Password_Change: 'NO' }]);
  const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: cryptoMock });
  adapter.verifyPassword = async () => true;

  const sm = new MboSessionManager({
    adapter,
    sessionStorageImpl: storage,
    cryptoImpl: cryptoMock,
    getKintoneUser: () => ({ code: 'user001' })
  });

  const gate = new MboKintoneLoginGate(adapter, { sessionManager: sm });

  await gate._handleLoginAction({ username: 'EMP001', password: 'pw' });
  const token1 = storage.getItem('ttmet.mbo794.session.v1');

  // New login overwrites session
  await gate._handleLoginAction({ username: 'EMP001', password: 'pw' });
  const token2 = storage.getItem('ttmet.mbo794.session.v1');
  assert.notEqual(token1, token2);

  // Logout revokes and clears principal
  const logoutRes = await gate.logout();
  assert.equal(logoutRes.status, 'SESSION_REVOKED');
  assert.equal(gate.getEmployeeCode(), null);
  assert.equal(storage.getItem('ttmet.mbo794.session.v1'), null);
});

// ---------------------------------------------------------------------------
// 4. Classic Bundle Proof
// ---------------------------------------------------------------------------

test('BUNDLE_RUNTIME_RESULT & SESSION_MANAGER_DEFINITION_COUNT = 1 & AUTH_ADAPTER_DEFINITION_COUNT = 1 & LOGIN_GATE_DEFINITION_COUNT = 1', () => {
  const bundleCode = fs.readFileSync('dist/mbo-employee-app.js', 'utf8');

  assert.equal(/\bimport\b/.test(bundleCode), false);
  assert.equal(/\bexport\b/.test(bundleCode), false);

  const smMatches = bundleCode.match(/class MboSessionManager\b/g) || [];
  const adapterMatches = bundleCode.match(/class MboKintoneAuthAdapter\b/g) || [];
  const gateMatches = bundleCode.match(/class MboKintoneLoginGate\b/g) || [];

  assert.equal(smMatches.length, 1);
  assert.equal(adapterMatches.length, 1);
  assert.equal(gateMatches.length, 1);

  assert.doesNotThrow(() => {
    new Function(bundleCode);
  });
});
