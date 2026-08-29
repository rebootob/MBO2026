/**
 * D1 — MboKintoneAuthAdapter tests
 *
 * Uses globalThis.crypto (WebCrypto, available in Node 19+).
 * Injects a mock Kintone API for App801 reads and writes.
 * App801 ACL currently blocks live browser reads; all tests use mocked data.
 *
 * Source no-Node-crypto assertion: verifies no Node crypto import in browser module.
 */
import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { MboKintoneAuthAdapter } from '../src/ui/mbo-kintone-auth-adapter.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ADAPTER_SRC = readFileSync(join(__dirname, '../src/ui/mbo-kintone-auth-adapter.js'), 'utf8');

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

const NOW = new Date('2026-08-27T10:00:00.000Z');
const nowFn = () => NOW;

/**
 * Build a valid pbkdf2$... hash for a known password using the adapter.
 * Returns { hash, adapter } for reuse.
 */
async function makeHashedCredential(password, employeeCode = '0118') {
  const api = { getRecords: async () => ({ records: [] }), updateRecord: async () => {} };
  const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: globalThis.crypto, now: nowFn });
  const hash = await adapter.createPasswordHash(password);
  return { hash, adapter };
}

/**
 * Build a mock Kintone API for App801 with one credential record.
 */
function makeApi(overrides = {}) {
  const defaults = {
    employeeCode: '0118',
    hash: null, // set per test after createPasswordHash
    status: 'ACTIVE',
    force: 'NO',
    failedAttempts: 0,
    lockedUntil: null,
    credentialVersion: 1,
  };
  const c = { ...defaults, ...overrides };

  let storedRecord = {
    $id: { value: '42' },
    Employee_Code: { value: c.employeeCode },
    Password_Hash: { value: c.hash },
    Account_Status: { value: c.status },
    Force_Password_Change: { value: c.force },
    Failed_Attempts: { value: c.failedAttempts },
    Locked_Until: { value: c.lockedUntil },
    Credential_Version: { value: c.credentialVersion },
    Last_Login_At: { value: null },
    Password_Changed_At: { value: null },
  };

  const updates = [];

  return {
    getRecords: async (appId, query) => {
      if (query.includes(`"${c.employeeCode}"`)) {
        return { records: [storedRecord] };
      }
      return { records: [] };
    },
    updateRecord: async (appId, id, fields) => {
      updates.push({ appId, id, fields });
      // Apply updates to storedRecord so subsequent reads see them
      Object.entries(fields).forEach(([k, v]) => {
        if (storedRecord[k]) storedRecord[k].value = v.value;
        else storedRecord[k] = { value: v.value };
      });
      return {};
    },
    updates,
    get storedRecord() { return storedRecord; },
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('D1 MboKintoneAuthAdapter', () => {

  // ── Static source checks ─────────────────────────────────────────────────

  it('29. no Node crypto import in browser module source', () => {
    assert.doesNotMatch(ADAPTER_SRC, /import\s+.*from\s+['"]crypto['"]/,
      'Must not import Node crypto module');
    assert.doesNotMatch(ADAPTER_SRC, /require\s*\(\s*['"]crypto['"]\s*\)/,
      'Must not require Node crypto module');
  });

  it('28. no localStorage/sessionStorage/cookie reference in adapter source', () => {
    assert.doesNotMatch(ADAPTER_SRC, /localStorage/);
    assert.doesNotMatch(ADAPTER_SRC, /sessionStorage/);
    assert.doesNotMatch(ADAPTER_SRC, /document\.cookie/);
  });

  // ── PBKDF2 hash format ───────────────────────────────────────────────────

  it('createPasswordHash produces correct pbkdf2$100000$<saltHex>$<hashHex> format', async () => {
    const { hash } = await makeHashedCredential('secret123');
    const parts = hash.split('$');
    assert.equal(parts[0], 'pbkdf2');
    assert.equal(parts[1], '100000');
    assert.match(parts[2], /^[0-9a-f]+$/i, 'salt must be hex');
    assert.match(parts[3], /^[0-9a-f]{64}$/i, 'hash must be 64-char hex (256-bit)');
  });

  it('createPasswordHash produces different salts each call (non-deterministic)', async () => {
    const { adapter } = await makeHashedCredential('pw');
    const h1 = await adapter.createPasswordHash('pw');
    const h2 = await adapter.createPasswordHash('pw');
    assert.notEqual(h1, h2, 'Each hash should use a unique random salt');
  });

  it('1. verifyPassword returns true for matching password and stored hash', async () => {
    const password = 'TestPassword!';
    const { hash, adapter } = await makeHashedCredential(password);
    const result = await adapter.verifyPassword(password, hash);
    assert.equal(result, true);
  });

  it('2. verifyPassword returns false for wrong password', async () => {
    const { hash, adapter } = await makeHashedCredential('correct');
    assert.equal(await adapter.verifyPassword('wrong', hash), false);
  });

  it('3. verifyPassword returns false for malformed hash', async () => {
    const api = { getRecords: async () => ({ records: [] }), updateRecord: async () => {} };
    const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: globalThis.crypto, now: nowFn });
    assert.equal(await adapter.verifyPassword('pw', 'notahash'), false);
    assert.equal(await adapter.verifyPassword('pw', 'pbkdf2$100000$badhex$tooshort'), false);
    assert.equal(await adapter.verifyPassword('pw', null), false);
    assert.equal(await adapter.verifyPassword('pw', ''), false);
  });

  // ── login: AUTHENTICATED ────────────────────────────────────────────────

  it('5. login returns AUTHENTICATED for valid ACTIVE credential', async () => {
    const { hash } = await makeHashedCredential('goodpw');
    const api = makeApi({ hash });
    const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: globalThis.crypto, now: nowFn });
    const result = await adapter.login({ username: '0118', password: 'goodpw' });
    assert.equal(result.status, 'AUTHENTICATED');
    assert.equal(result.employeeCode, '0118');
    assert.ok(!('Password_Hash' in result), 'Password_Hash must not be returned');
  });

  it('6. login returns PASSWORD_CHANGE_REQUIRED when Force_Password_Change=YES', async () => {
    const { hash } = await makeHashedCredential('pw');
    const api = makeApi({ hash, force: 'YES' });
    const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: globalThis.crypto, now: nowFn });
    const result = await adapter.login({ username: '0118', password: 'pw' });
    assert.equal(result.status, 'PASSWORD_CHANGE_REQUIRED');
    assert.equal(result.employeeCode, '0118');
    assert.ok(!('Password_Hash' in result), 'hash must not be returned');
  });

  it('19. successful login resets Failed_Attempts=0 and updates Last_Login_At', async () => {
    const { hash } = await makeHashedCredential('pw');
    const api = makeApi({ hash, failedAttempts: 3 });
    const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: globalThis.crypto, now: nowFn });
    await adapter.login({ username: '0118', password: 'pw' });
    const update = api.updates[0];
    assert.equal(update.fields.Failed_Attempts.value, 0);
    assert.equal(update.fields.Last_Login_At.value, NOW.toISOString());
  });

  // ── login: INVALID_CREDENTIALS / lockout ──────────────────────────────

  it('7. login returns INVALID_CREDENTIALS for wrong password', async () => {
    const { hash } = await makeHashedCredential('good');
    const api = makeApi({ hash });
    const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: globalThis.crypto, now: nowFn });
    const result = await adapter.login({ username: '0118', password: 'bad' });
    assert.equal(result.status, 'INVALID_CREDENTIALS');
  });

  it('8. login increments Failed_Attempts on wrong password', async () => {
    const { hash } = await makeHashedCredential('pw');
    const api = makeApi({ hash, failedAttempts: 2 });
    const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: globalThis.crypto, now: nowFn });
    await adapter.login({ username: '0118', password: 'wrong' });
    assert.equal(api.updates[0].fields.Failed_Attempts.value, 3);
    assert.equal(api.updates[0].fields.Locked_Until.value, null, 'No lockout before 5 attempts');
  });

  it('9. 5th wrong password sets Locked_Until = now + 15 minutes', async () => {
    const { hash } = await makeHashedCredential('pw');
    const api = makeApi({ hash, failedAttempts: 4 }); // next attempt is 5th
    const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: globalThis.crypto, now: nowFn });
    await adapter.login({ username: '0118', password: 'wrong' });
    const lock = api.updates[0].fields.Locked_Until.value;
    assert.ok(lock, 'Locked_Until must be set on 5th failure');
    const lockDate = new Date(lock);
    const expected = new Date(NOW.getTime() + 15 * 60 * 1000);
    assert.equal(lockDate.toISOString(), expected.toISOString());
  });

  // ── login: CREDENTIAL_DENIED ──────────────────────────────────────────

  it('10. login returns CREDENTIAL_DENIED for DISABLED account', async () => {
    const { hash } = await makeHashedCredential('pw');
    const api = makeApi({ hash, status: 'DISABLED' });
    const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: globalThis.crypto, now: nowFn });
    const result = await adapter.login({ username: '0118', password: 'pw' });
    assert.equal(result.status, 'CREDENTIAL_DENIED');
  });

  it('11. login returns CREDENTIAL_DENIED for active lockout (ACTIVE status with Locked_Until in future)', async () => {
    const { hash } = await makeHashedCredential('pw');
    const futureLock = new Date(NOW.getTime() + 10 * 60 * 1000).toISOString();
    const api = makeApi({ hash, status: 'ACTIVE', lockedUntil: futureLock });
    const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: globalThis.crypto, now: nowFn });
    const result = await adapter.login({ username: '0118', password: 'pw' });
    assert.equal(result.status, 'CREDENTIAL_DENIED');
  });

  it('11b. expired lockout (Locked_Until in past) does NOT block login', async () => {
    const { hash } = await makeHashedCredential('pw');
    const pastLock = new Date(NOW.getTime() - 60 * 1000).toISOString();
    const api = makeApi({ hash, status: 'ACTIVE', lockedUntil: pastLock });
    const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: globalThis.crypto, now: nowFn });
    const result = await adapter.login({ username: '0118', password: 'pw' });
    assert.equal(result.status, 'AUTHENTICATED');
  });

  it('12. login returns CREDENTIAL_DENIED for missing credential', async () => {
    const api = { getRecords: async () => ({ records: [] }), updateRecord: async () => {} };
    const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: globalThis.crypto, now: nowFn });
    const result = await adapter.login({ username: '0118', password: 'pw' });
    assert.equal(result.status, 'CREDENTIAL_DENIED');
  });

  it('13. login returns CREDENTIAL_DENIED for duplicate credential records', async () => {
    const { hash } = await makeHashedCredential('pw');
    const rec = {
      $id: { value: '1' }, Employee_Code: { value: '0118' },
      Password_Hash: { value: hash }, Account_Status: { value: 'ACTIVE' },
      Force_Password_Change: { value: 'NO' }, Failed_Attempts: { value: 0 }, Locked_Until: { value: null }
    };
    const api = { getRecords: async () => ({ records: [rec, rec] }), updateRecord: async () => {} };
    const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: globalThis.crypto, now: nowFn });
    const result = await adapter.login({ username: '0118', password: 'pw' });
    assert.equal(result.status, 'CREDENTIAL_DENIED');
  });

  it('14. login returns CREDENTIAL_DENIED for malformed credential (missing hash)', async () => {
    const rec = {
      $id: { value: '1' }, Employee_Code: { value: '0118' },
      Password_Hash: { value: null }, Account_Status: { value: 'ACTIVE' },
      Force_Password_Change: { value: 'NO' }, Failed_Attempts: { value: 0 }, Locked_Until: { value: null }
    };
    const api = { getRecords: async () => ({ records: [rec] }), updateRecord: async () => {} };
    const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: globalThis.crypto, now: nowFn });
    const result = await adapter.login({ username: '0118', password: 'pw' });
    assert.equal(result.status, 'CREDENTIAL_DENIED');
  });

  it('2b. login with malformed session employeeCode (injection chars) returns CREDENTIAL_DENIED (zero Kintone calls)', async () => {
    const calls = [];
    const api = {
      getRecords: async () => { calls.push('get'); return { records: [] }; },
      updateRecord: async () => { calls.push('update'); }
    };
    const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: globalThis.crypto, now: nowFn });
    const result = await adapter.login({ username: '0118" or "1"="1', password: 'pw' });
    assert.equal(result.status, 'CREDENTIAL_DENIED');
    assert.equal(calls.length, 0, 'Zero Kintone calls must be made for malformed Employee_Code');
  });

  it('2c. login with special formatted Employee Codes (50.03, 50.02, 0050_2) succeeds for valid credential', async () => {
    const specialCodes = ['50.03', '50.02', '0050_2'];
    for (const code of specialCodes) {
      const { hash } = await makeHashedCredential('pass123', code);
      const api = makeApi({ employeeCode: code, hash });
      const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: globalThis.crypto, now: nowFn });
      const result = await adapter.login({ username: code, password: 'pass123' });
      assert.equal(result.status, 'AUTHENTICATED');
      assert.equal(result.employeeCode, code);
    }
  });

  it('2d. login with leading/trailing or inner space rejects cleanly with zero Kintone calls', async () => {
    const calls = [];
    const api = {
      getRecords: async () => { calls.push('get'); return { records: [] }; },
      updateRecord: async () => { calls.push('update'); }
    };
    const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: globalThis.crypto, now: nowFn });

    const r1 = await adapter.login({ username: ' 0118', password: 'pw' });
    assert.equal(r1.status, 'CREDENTIAL_DENIED');

    const r2 = await adapter.login({ username: '0118 ', password: 'pw' });
    assert.equal(r2.status, 'CREDENTIAL_DENIED');

    const r3 = await adapter.login({ username: '01 18', password: 'pw' });
    assert.equal(r3.status, 'CREDENTIAL_DENIED');

    assert.equal(calls.length, 0, 'Zero Kintone calls must be made for spaced Employee_Code');
  });

  it('B5. login returns CREDENTIAL_DENIED for Account_Status=LOCKED even without Locked_Until', async () => {
    const { hash } = await makeHashedCredential('pw');
    const api = makeApi({ hash, status: 'LOCKED', lockedUntil: null });
    const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: globalThis.crypto, now: nowFn });
    const result = await adapter.login({ username: '0118', password: 'pw' });
    assert.equal(result.status, 'CREDENTIAL_DENIED');
    assert.equal(result.reason, 'Account is locked.');
  });

  it('B5b. login returns CREDENTIAL_DENIED for malformed Failed_Attempts (non-numeric)', async () => {
    const { hash } = await makeHashedCredential('pw');
    const api = makeApi({ hash, failedAttempts: 'invalid_number' });
    const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: globalThis.crypto, now: nowFn });
    const result = await adapter.login({ username: '0118', password: 'pw' });
    assert.equal(result.status, 'CREDENTIAL_DENIED');
  });

  it('B5c. login returns CREDENTIAL_DENIED for malformed Locked_Until (invalid date string)', async () => {
    const { hash } = await makeHashedCredential('pw');
    const api = makeApi({ hash, lockedUntil: 'not-a-valid-date' });
    const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: globalThis.crypto, now: nowFn });
    const result = await adapter.login({ username: '0118', password: 'pw' });
    assert.equal(result.status, 'CREDENTIAL_DENIED');
  });

  // ── changePassword ───────────────────────────────────────────────────────

  it('15. changePassword rejects wrong current password', async () => {
    const { hash } = await makeHashedCredential('correct');
    const api = makeApi({ hash });
    const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: globalThis.crypto, now: nowFn });
    const result = await adapter.changePassword({
      employeeCode: '0118', currentPassword: 'wrong', newPassword: 'NewPass!1'
    });
    assert.equal(result.status, 'INVALID_CREDENTIALS');
    assert.equal(api.updates.length, 0, 'No update must occur on wrong current password');
  });

  it('16. changePassword rejects newPassword equal to employeeCode', async () => {
    const { hash } = await makeHashedCredential('good');
    const api = makeApi({ hash });
    const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: globalThis.crypto, now: nowFn });
    const result = await adapter.changePassword({
      employeeCode: '0118', currentPassword: 'good', newPassword: '0118'
    });
    assert.equal(result.status, 'INVALID_PASSWORD');
    assert.equal(api.updates.length, 0);
  });

  it('17. changePassword never returns or exposes Password_Hash in result', async () => {
    const { hash } = await makeHashedCredential('old');
    const api = makeApi({ hash });
    const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: globalThis.crypto, now: nowFn });
    const result = await adapter.changePassword({
      employeeCode: '0118', currentPassword: 'old', newPassword: 'NewSecret99'
    });
    assert.equal(result.status, 'PASSWORD_CHANGED');
    assert.equal(result.employeeCode, '0118');
    assert.ok(!('Password_Hash' in result), 'Password_Hash must not appear in result');
    assert.ok(!('hash' in result), 'hash must not appear in result');
  });

  it('changePassword stores new pbkdf2 hash and clears lockout fields', async () => {
    const { hash } = await makeHashedCredential('old');
    const api = makeApi({ hash, failedAttempts: 2 });
    const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: globalThis.crypto, now: nowFn });
    await adapter.changePassword({ employeeCode: '0118', currentPassword: 'old', newPassword: 'NewOK!' });
    const update = api.updates[0];
    assert.match(update.fields.Password_Hash.value, /^pbkdf2\$100000\$/);
    assert.equal(update.fields.Force_Password_Change.value, 'NO');
    assert.equal(update.fields.Failed_Attempts.value, 0);
    assert.equal(update.fields.Locked_Until.value, null);
  });

  // ── forceChangePassword ──────────────────────────────────────────────────

  it('18. forceChangePassword rejects newPassword equal to employeeCode', async () => {
    const { hash } = await makeHashedCredential('any');
    const api = makeApi({ hash, force: 'YES' });
    const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: globalThis.crypto, now: nowFn });
    const result = await adapter.forceChangePassword({ employeeCode: '0118', newPassword: '0118' });
    assert.equal(result.status, 'INVALID_PASSWORD');
    assert.equal(api.updates.length, 0);
  });

  it('forceChangePassword succeeds without requiring currentPassword when Force_Password_Change=YES', async () => {
    const { hash } = await makeHashedCredential('old');
    const api = makeApi({ hash, force: 'YES' });
    const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: globalThis.crypto, now: nowFn });
    const result = await adapter.forceChangePassword({ employeeCode: '0118', newPassword: 'FreshNew1' });
    assert.equal(result.status, 'PASSWORD_CHANGED');
    assert.equal(result.employeeCode, '0118');
    const update = api.updates[0];
    assert.equal(update.fields.Force_Password_Change.value, 'NO');
  });

  it('B6. forceChangePassword is denied when Force_Password_Change=NO (zero update)', async () => {
    const { hash } = await makeHashedCredential('old');
    const api = makeApi({ hash, force: 'NO' });
    const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: globalThis.crypto, now: nowFn });
    const result = await adapter.forceChangePassword({ employeeCode: '0118', newPassword: 'FreshNew1' });
    assert.equal(result.status, 'CREDENTIAL_DENIED');
    assert.equal(api.updates.length, 0, 'Zero updates must be executed when forceChange is not required');
  });

  // ── resetMboPassword (R1 Password Reset Core) ───────────────────────────

  it('R1-1. resetMboPassword updates ACTIVE credential with exact required fields and increments Credential_Version by 1', async () => {
    const { hash } = await makeHashedCredential('oldsecret');
    const api = makeApi({ hash, failedAttempts: 3, credentialVersion: 5 });
    const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: globalThis.crypto, now: nowFn });

    const result = await adapter.resetMboPassword({ employeeCode: '0118' });

    assert.equal(result.status, 'PASSWORD_RESET');
    assert.equal(result.employeeCode, '0118');
    assert.ok(!('Password_Hash' in result), 'Must not return Password_Hash');
    assert.ok(!('hash' in result), 'Must not return hash');
    assert.ok(!('token' in result), 'Must not return session token');
    assert.ok(!('password' in result), 'Must not return plaintext password');

    assert.equal(api.updates.length, 1, 'Exactly one update payload must be executed');
    const update = api.updates[0];
    const fields = update.fields;

    // 1. Password_Hash must be new pbkdf2 hash for employeeCode '0118'
    assert.match(fields.Password_Hash.value, /^pbkdf2\$100000\$/);
    const isValidTempPw = await adapter.verifyPassword('0118', fields.Password_Hash.value);
    assert.equal(isValidTempPw, true, 'Temporary password must be the exact Employee_Code');

    // 2. Credential_Version must increment by 1 (5 -> 6)
    assert.equal(fields.Credential_Version.value, 6);

    // 3. Force_Password_Change=YES, Failed_Attempts=0, Locked_Until=null
    assert.equal(fields.Force_Password_Change.value, 'YES');
    assert.equal(fields.Failed_Attempts.value, 0);
    assert.equal(fields.Locked_Until.value, null);
    assert.equal(fields.Password_Changed_At.value, NOW.toISOString());

    // 4. All Session_* fields cleared
    assert.equal(fields.Session_Token_Hash.value, null);
    assert.equal(fields.Session_Issued_At.value, null);
    assert.equal(fields.Session_Expires_At.value, null);
    assert.equal(fields.Session_Credential_Version.value, null);
    assert.equal(fields.Session_Kintone_User.value, null);

    // 5. Account_Status must NOT be present in update payload
    assert.ok(!('Account_Status' in fields), 'Account_Status must be absent from update payload');
  });

  it('R1-2. resetMboPassword preserves permanent LOCKED and DISABLED Account_Status so login remains denied', async () => {
    const { hash: lockHash } = await makeHashedCredential('old');
    const lockApi = makeApi({ hash: lockHash, status: 'LOCKED', credentialVersion: 1 });
    const lockAdapter = new MboKintoneAuthAdapter({ api: lockApi, cryptoImpl: globalThis.crypto, now: nowFn });

    const lockResult = await lockAdapter.resetMboPassword({ employeeCode: '0118' });
    assert.equal(lockResult.status, 'PASSWORD_RESET');
    assert.ok(!('Account_Status' in lockApi.updates[0].fields), 'Account_Status absent from update');

    // Login with reset temporary password must still be denied because Account_Status is LOCKED
    const lockLogin = await lockAdapter.login({ username: '0118', password: '0118' });
    assert.equal(lockLogin.status, 'CREDENTIAL_DENIED');
    assert.equal(lockLogin.reason, 'Account is locked.');

    const { hash: disHash } = await makeHashedCredential('old');
    const disApi = makeApi({ hash: disHash, status: 'DISABLED', credentialVersion: 2 });
    const disAdapter = new MboKintoneAuthAdapter({ api: disApi, cryptoImpl: globalThis.crypto, now: nowFn });

    const disResult = await disAdapter.resetMboPassword({ employeeCode: '0118' });
    assert.equal(disResult.status, 'PASSWORD_RESET');
    assert.ok(!('Account_Status' in disApi.updates[0].fields), 'Account_Status absent from update');

    const disLogin = await disAdapter.login({ username: '0118', password: '0118' });
    assert.equal(disLogin.status, 'CREDENTIAL_DENIED');
    assert.equal(disLogin.reason, 'Account is disabled.');
  });

  it('R1-3. resetMboPassword clears temporary Locked_Until on ACTIVE account', async () => {
    const { hash } = await makeHashedCredential('old');
    const futureLock = new Date(NOW.getTime() + 10 * 60 * 1000).toISOString();
    const api = makeApi({ hash, status: 'ACTIVE', lockedUntil: futureLock, failedAttempts: 5 });
    const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: globalThis.crypto, now: nowFn });

    const resetResult = await adapter.resetMboPassword({ employeeCode: '0118' });
    assert.equal(resetResult.status, 'PASSWORD_RESET');
    assert.equal(api.updates[0].fields.Locked_Until.value, null);
    assert.equal(api.updates[0].fields.Failed_Attempts.value, 0);

    // Subsequent login with temporary password should now return PASSWORD_CHANGE_REQUIRED (because Force_Password_Change=YES)
    const loginResult = await adapter.login({ username: '0118', password: '0118' });
    assert.equal(loginResult.status, 'PASSWORD_CHANGE_REQUIRED');
  });

  it('R1-4. resetMboPassword fails closed for missing credential (zero updates)', async () => {
    const api = { getRecords: async () => ({ records: [] }), updateRecord: async () => {} };
    const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: globalThis.crypto, now: nowFn });
    const result = await adapter.resetMboPassword({ employeeCode: '0118' });
    assert.equal(result.status, 'CREDENTIAL_DENIED');
    assert.equal(result.reason, 'CREDENTIAL_NOT_FOUND');
  });

  it('R1-5. resetMboPassword fails closed for duplicate credential (zero updates)', async () => {
    const { hash } = await makeHashedCredential('pw');
    const rec = {
      $id: { value: '1' }, Employee_Code: { value: '0118' },
      Password_Hash: { value: hash }, Account_Status: { value: 'ACTIVE' },
      Force_Password_Change: { value: 'NO' }, Failed_Attempts: { value: 0 },
      Locked_Until: { value: null }, Credential_Version: { value: 1 }
    };
    const updates = [];
    const api = { getRecords: async () => ({ records: [rec, rec] }), updateRecord: async (a, b, c) => updates.push(c) };
    const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: globalThis.crypto, now: nowFn });
    const result = await adapter.resetMboPassword({ employeeCode: '0118' });
    assert.equal(result.status, 'CREDENTIAL_DENIED');
    assert.equal(result.reason, 'DUPLICATE_CREDENTIAL');
    assert.equal(updates.length, 0, 'Zero updates for duplicate credential');
  });

  it('R1-6. resetMboPassword fails closed for malformed Credential_Version (null, blank, non-integer, <= 0)', async () => {
    const invalidVersions = [null, undefined, '', 'abc', 0, -1, 1.5];
    for (const badVer of invalidVersions) {
      const { hash } = await makeHashedCredential('pw');
      const updates = [];
      const api = makeApi({ hash, credentialVersion: badVer });
      api.updateRecord = async (a, b, c) => updates.push(c);
      const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: globalThis.crypto, now: nowFn });

      const result = await adapter.resetMboPassword({ employeeCode: '0118' });
      assert.equal(result.status, 'CREDENTIAL_DENIED');
      assert.equal(result.reason, 'MALFORMED_CREDENTIAL');
      assert.equal(updates.length, 0, `Zero updates for bad Credential_Version=${badVer}`);
    }
  });

  it('R1-7. resetMboPassword supports special canonical Employee_Code formats (50.03, 50.02, 0050_2)', async () => {
    const specialCodes = ['50.03', '50.02', '0050_2'];
    for (const code of specialCodes) {
      const { hash } = await makeHashedCredential('old', code);
      const api = makeApi({ employeeCode: code, hash, credentialVersion: 2 });
      const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: globalThis.crypto, now: nowFn });

      const result = await adapter.resetMboPassword({ employeeCode: code });
      assert.equal(result.status, 'PASSWORD_RESET');
      assert.equal(result.employeeCode, code);

      const update = api.updates[0];
      assert.equal(update.fields.Credential_Version.value, 3);
      const isMatch = await adapter.verifyPassword(code, update.fields.Password_Hash.value);
      assert.equal(isMatch, true, `Temporary password must equal exact code ${code}`);
    }
  });

  it('R1-8. resetMboPassword rejects invalid Employee_Code format (spaces, injection chars) with zero Kintone calls', async () => {
    const invalidCodes = [' 0118', '0118 ', '01 18', '0118" or "1"="1'];
    for (const badCode of invalidCodes) {
      const calls = [];
      const api = {
        getRecords: async () => { calls.push('get'); return { records: [] }; },
        updateRecord: async () => { calls.push('update'); }
      };
      const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: globalThis.crypto, now: nowFn });
      const result = await adapter.resetMboPassword({ employeeCode: badCode });
      assert.equal(result.status, 'CREDENTIAL_DENIED');
      assert.equal(calls.length, 0, `Zero API calls for bad code '${badCode}'`);
    }
  });

});

