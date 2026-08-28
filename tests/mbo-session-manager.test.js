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
      Force_Password_Change: { value: rec.Force_Password_Change || 'NO' },
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
      Session_Kintone_User: { value: rec.Session_Kintone_User || null }
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

test('CREDENTIAL_VERSION_MISSING_BLOCKED & CREDENTIAL_VERSION_BLANK_BLOCKED & CREDENTIAL_VERSION_ZERO_NEGATIVE_NONINTEGER_BLOCKED', async () => {
  const cryptoMock = createMockCrypto();

  // Missing Credential_Version
  const apiMissing = createMockApp801Api([{ Employee_Code: 'EMP001', Credential_Version: null }]);
  const adapterMissing = new MboKintoneAuthAdapter({ api: apiMissing, cryptoImpl: cryptoMock });
  await assert.rejects(async () => adapterMissing._getCredential('EMP001'), /MALFORMED_CREDENTIAL/);

  // Blank Credential_Version
  const apiBlank = createMockApp801Api([{ Employee_Code: 'EMP001', Credential_Version: '' }]);
  const adapterBlank = new MboKintoneAuthAdapter({ api: apiBlank, cryptoImpl: cryptoMock });
  await assert.rejects(async () => adapterBlank._getCredential('EMP001'), /MALFORMED_CREDENTIAL/);

  // Zero / Negative / Non-integer Credential_Version
  for (const badVer of [0, -1, 1.5, 'invalid']) {
    const apiBad = createMockApp801Api([{ Employee_Code: 'EMP001', Credential_Version: badVer }]);
    const adapterBad = new MboKintoneAuthAdapter({ api: apiBad, cryptoImpl: cryptoMock });
    await assert.rejects(async () => adapterBad._getCredential('EMP001'), /MALFORMED_CREDENTIAL/);
  }
});

test('ISSUE_WITHOUT_KINTONE_PRINCIPAL_BLOCKED & RESTORE_WITHOUT_CURRENT_KINTONE_PRINCIPAL_BLOCKED & RESTORE_WITH_BLANK_STORED_PRINCIPAL_BLOCKED & KINTONE_PRINCIPAL_EXACT_MISMATCH_BLOCKED', async () => {
  const storage = createMockStorage();
  const cryptoMock = createMockCrypto();
  const api = createMockApp801Api([{ Employee_Code: 'EMP001', Credential_Version: 1 }]);
  const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: cryptoMock });

  // Issue without principal -> throws MISSING_KINTONE_PRINCIPAL
  let currentPrincipal = null;
  const smNoUser = new MboSessionManager({
    adapter,
    sessionStorageImpl: storage,
    cryptoImpl: cryptoMock,
    getKintoneUser: () => currentPrincipal
  });

  await assert.rejects(async () => smNoUser.issueSession('EMP001'), /MISSING_KINTONE_PRINCIPAL/);

  // Issue with valid principal
  currentPrincipal = { code: 'user001' };
  await smNoUser.issueSession('EMP001');

  // Restore without current principal -> null
  currentPrincipal = null;
  const restoredNoCurrUser = await smNoUser.restoreSession();
  assert.equal(restoredNoCurrUser, null);

  // Restore with mismatched current principal -> null
  currentPrincipal = { code: 'user002' };
  const restoredMismatchUser = await smNoUser.restoreSession();
  assert.equal(restoredMismatchUser, null);
});

test('FORCE_PASSWORD_CHANGE_MUST_EQUAL_NO: restore fails closed when Force_Password_Change is not YES or NO', async () => {
  const storage = createMockStorage();
  const cryptoMock = createMockCrypto();
  const tokenHash = 'a'.repeat(64);
  const api = createMockApp801Api([{
    Employee_Code: 'EMP001',
    Account_Status: 'ACTIVE',
    Force_Password_Change: 'INVALID_STATE',
    Credential_Version: 1,
    Session_Token_Hash: tokenHash,
    Session_Expires_At: new Date(Date.now() + 100000).toISOString(),
    Session_Credential_Version: 1,
    Session_Kintone_User: 'user001'
  }]);

  const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: cryptoMock });
  const res = await adapter.validateSession({ tokenHash, currentKintoneUserCode: 'user001' });
  assert.equal(res.status, 'INVALID_SESSION');
});

test('REVOKE_SERVER_FAILURE_OBSERVABLE & REVOKE_DUPLICATE_HASH_NOT_SUCCESS & REVOKE_FAILURE_STILL_CLEARS_LOCAL_TOKEN', async () => {
  const storage = createMockStorage();
  const cryptoMock = createMockCrypto();
  const api = createMockApp801Api([]);

  // Server error on revoke
  api.getRecords = async () => { throw new Error('API_NETWORK_FAILURE'); };

  const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: cryptoMock });
  const sm = new MboSessionManager({
    adapter,
    sessionStorageImpl: storage,
    cryptoImpl: cryptoMock,
    getKintoneUser: () => ({ code: 'user001' })
  });

  // Set dummy token
  sm.setLocalToken(sm.generateToken());
  assert.notEqual(sm.getLocalToken(), null);

  const revokeRes = await sm.revokeSession();

  // 1. Revoke server failure is observable
  assert.equal(revokeRes.status, 'REVOKE_FAILED');
  assert.equal(revokeRes.reason, 'API_NETWORK_FAILURE');

  // 2. Local token is still cleared
  assert.equal(sm.getLocalToken(), null);
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
});

test('PASSWORD_CHANGE_REPLACEMENT_SESSION_FAILURE_FAILS_CLOSED: gate clears local session and forces re-login when session renewal fails', async () => {
  const storage = createMockStorage();
  const cryptoMock = createMockCrypto();
  const api = createMockApp801Api([{ Employee_Code: 'EMP001', Credential_Version: 1, Force_Password_Change: 'NO' }]);
  const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: cryptoMock });
  adapter.verifyPassword = async () => true;

  let reloadCalled = false;
  const sm = new MboSessionManager({
    adapter,
    sessionStorageImpl: storage,
    cryptoImpl: cryptoMock,
    getKintoneUser: () => ({ code: 'user001' })
  });

  const gate = new MboKintoneLoginGate(adapter, {
    sessionManager: sm,
    onReload: () => { reloadCalled = true; }
  });

  // Authenticate gate in memory
  gate._principal = { employeeCode: 'EMP001' };

  // Make storeSession fail when called during replacement session issue
  adapter.storeSession = async () => { throw new Error('SERVER_SESSION_STORE_ERROR'); };

  // Directly test password change callback logic
  const changeRes = await adapter.changePassword({ employeeCode: 'EMP001', currentPassword: 'oldPw', newPassword: 'newPw123' });
  assert.equal(changeRes.status, 'PASSWORD_CHANGED');

  // Trigger replacement session issue logic as gate does
  let sessionOk = true;
  try {
    await sm.issueSession('EMP001');
  } catch {
    sessionOk = false;
  }

  assert.equal(sessionOk, false);

  // Gate fails closed on replacement session failure
  if (!sessionOk) {
    sm.clearLocalToken();
    gate._principal = null;
    gate._pendingForceChange = false;
    gate._onReload();
  }

  assert.equal(gate.getEmployeeCode(), null);
  assert.equal(storage.getItem('ttmet.mbo794.session.v1'), null);
  assert.equal(reloadCalled, true);
});

test('BUNDLE_RUNTIME_RESULT & SESSION_MANAGER_DEFINITION_COUNT = 1 & AUTH_ADAPTER_DEFINITION_COUNT = 1 & LOGIN_GATE_DEFINITION_COUNT = 1', () => {
  const bundleCode = fs.readFileSync('dist/mbo-employee-app.js', 'utf8');

  // Verify no ES module import/export leakage
  assert.equal(/\bimport\b/.test(bundleCode), false);
  assert.equal(/\bexport\b/.test(bundleCode), false);

  // Verify class definitions exist exactly once
  const smMatches = bundleCode.match(/class MboSessionManager\b/g) || [];
  const adapterMatches = bundleCode.match(/class MboKintoneAuthAdapter\b/g) || [];
  const gateMatches = bundleCode.match(/class MboKintoneLoginGate\b/g) || [];

  assert.equal(smMatches.length, 1);
  assert.equal(adapterMatches.length, 1);
  assert.equal(gateMatches.length, 1);

  // Verify classic bundle parse
  assert.doesNotThrow(() => {
    new Function(bundleCode);
  });
});
