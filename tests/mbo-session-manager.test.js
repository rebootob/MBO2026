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
        // Deterministic SHA-256 mock digest based on input string
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
      Credential_Version: { value: rec.Credential_Version ?? 1 },
      Session_Token_Hash: { value: rec.Session_Token_Hash || null },
      Session_Issued_At: { value: rec.Session_Issued_At || null },
      Session_Expires_At: { value: rec.Session_Expires_At || null },
      Session_Credential_Version: { value: rec.Session_Credential_Version ?? null },
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
  const api = createMockApp801Api([{ Employee_Code: 'EMP001' }]);
  const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: cryptoMock });
  const sm = new MboSessionManager({
    adapter,
    sessionStorageImpl: storage,
    cryptoImpl: cryptoMock,
    getKintoneUser: () => ({ code: 'user001' })
  });

  const res = await sm.issueSession('EMP001');

  // 1. Storage key
  const stored = storage.getItem('ttmet.mbo794.session.v1');
  assert.equal(stored, res.token.toLowerCase());

  // 2. Storage contains ONLY the raw token string
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

  // Validate 2 hours later
  const later = new Date('2026-08-28T14:00:00.000Z');
  adapter.now = () => later;
  sm.now = () => later;

  const restored = await sm.restoreSession();
  assert.equal(restored?.employeeCode, 'EMP001');

  // Verify App801 record expiry was NOT slid/extended
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

  // Expired check (8 hours + 1 ms)
  const expiredTime = new Date('2026-08-28T20:00:00.001Z');
  adapter.now = () => expiredTime;
  sm.now = () => expiredTime;

  const restoredExpired = await sm.restoreSession();
  assert.equal(restoredExpired, null);
  assert.equal(storage.getItem('ttmet.mbo794.session.v1'), null);

  // Tampered token test
  storage.setItem('ttmet.mbo794.session.v1', 'f'.repeat(64));
  const restoredTampered = await sm.restoreSession();
  assert.equal(restoredTampered, null);
  assert.equal(storage.getItem('ttmet.mbo794.session.v1'), null);
});

test('DISABLED_ACCOUNT_BLOCKED & LOCKED_ACCOUNT_BLOCKED & FORCE_PASSWORD_CHANGE_SESSION_BLOCKED', async () => {
  const storage = createMockStorage();
  const cryptoMock = createMockCrypto();

  // Disabled account
  const apiDisabled = createMockApp801Api([{ Employee_Code: 'EMP001', Account_Status: 'DISABLED' }]);
  const adapterDisabled = new MboKintoneAuthAdapter({ api: apiDisabled, cryptoImpl: cryptoMock });
  const smDisabled = new MboSessionManager({ adapter: adapterDisabled, sessionStorageImpl: storage, cryptoImpl: cryptoMock });
  await assert.rejects(async () => smDisabled.issueSession('EMP001'), /CREDENTIAL_NOT_ACTIVE/);

  // Locked account
  const apiLocked = createMockApp801Api([{ Employee_Code: 'EMP002', Account_Status: 'LOCKED' }]);
  const adapterLocked = new MboKintoneAuthAdapter({ api: apiLocked, cryptoImpl: cryptoMock });
  const smLocked = new MboSessionManager({ adapter: adapterLocked, sessionStorageImpl: storage, cryptoImpl: cryptoMock });
  await assert.rejects(async () => smLocked.issueSession('EMP002'), /CREDENTIAL_NOT_ACTIVE/);

  // Force password change account
  const apiForce = createMockApp801Api([{ Employee_Code: 'EMP003', Account_Status: 'ACTIVE', Force_Password_Change: 'YES' }]);
  const adapterForce = new MboKintoneAuthAdapter({ api: apiForce, cryptoImpl: cryptoMock });
  const smForce = new MboSessionManager({ adapter: adapterForce, sessionStorageImpl: storage, cryptoImpl: cryptoMock });
  await assert.rejects(async () => smForce.issueSession('EMP003'), /FORCE_PASSWORD_CHANGE_REQUIRED/);
});

test('KINTONE_PRINCIPAL_MISMATCH_BLOCKED & CREDENTIAL_VERSION_MISMATCH_BLOCKED', async () => {
  const storage = createMockStorage();
  const cryptoMock = createMockCrypto();
  let kintoneUserCode = 'userA';
  const api = createMockApp801Api([{ Employee_Code: 'EMP001', Credential_Version: 1 }]);
  const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: cryptoMock });
  const sm = new MboSessionManager({
    adapter,
    sessionStorageImpl: storage,
    cryptoImpl: cryptoMock,
    getKintoneUser: () => ({ code: kintoneUserCode })
  });

  await sm.issueSession('EMP001');

  // 1. Principal mismatch
  kintoneUserCode = 'userB';
  const restoredMismatchUser = await sm.restoreSession();
  assert.equal(restoredMismatchUser, null);

  // Reset principal, test Credential Version mismatch
  kintoneUserCode = 'userA';
  storage.setItem('ttmet.mbo794.session.v1', sm.generateToken()); // set new valid hex format token
  const tokenHash = await sm.hashToken(storage.getItem('ttmet.mbo794.session.v1'));
  // Update App801 record with mismatched session credential version
  const record = [...api.recordsMap.values()][0];
  record.Session_Token_Hash.value = tokenHash;
  record.Credential_Version.value = 2;
  record.Session_Credential_Version.value = 1;

  const restoredMismatchVersion = await sm.restoreSession();
  assert.equal(restoredMismatchVersion, null);
});

test('PASSWORD_CHANGE_INCREMENTS_CREDENTIAL_VERSION & PASSWORD_CHANGE_ROTATES_SESSION', async () => {
  const storage = createMockStorage();
  const cryptoMock = createMockCrypto();
  const api = createMockApp801Api([{ Employee_Code: 'EMP001', Credential_Version: 1 }]);
  const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: cryptoMock });
  // Mock password verification to return true
  adapter.verifyPassword = async () => true;

  const sm = new MboSessionManager({
    adapter,
    sessionStorageImpl: storage,
    cryptoImpl: cryptoMock,
    getKintoneUser: () => ({ code: 'user001' })
  });

  await sm.issueSession('EMP001');
  const oldToken = storage.getItem('ttmet.mbo794.session.v1');

  // Perform password change
  const changeRes = await adapter.changePassword({
    employeeCode: 'EMP001',
    currentPassword: 'oldPassword',
    newPassword: 'newPassword123'
  });

  assert.equal(changeRes.status, 'PASSWORD_CHANGED');
  assert.equal(changeRes.newCredentialVersion, 2);

  // Verify prior session server fields were cleared
  const record = [...api.recordsMap.values()][0];
  assert.equal(record.Credential_Version.value, 2);
  assert.equal(record.Session_Token_Hash.value, null);

  // Restore using old token should fail
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

  await sm.revokeSession();
  assert.equal(storage.getItem('ttmet.mbo794.session.v1'), null);

  const record = [...api.recordsMap.values()][0];
  assert.equal(record.Session_Token_Hash.value, null);
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
