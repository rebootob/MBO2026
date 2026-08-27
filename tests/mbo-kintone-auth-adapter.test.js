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
    const api = makeApi({ hash });
    const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: globalThis.crypto, now: nowFn });
    const result = await adapter.forceChangePassword({ employeeCode: '0118', newPassword: '0118' });
    assert.equal(result.status, 'INVALID_PASSWORD');
    assert.equal(api.updates.length, 0);
  });

  it('forceChangePassword succeeds without requiring currentPassword', async () => {
    const { hash } = await makeHashedCredential('old');
    const api = makeApi({ hash, force: 'YES' });
    const adapter = new MboKintoneAuthAdapter({ api, cryptoImpl: globalThis.crypto, now: nowFn });
    const result = await adapter.forceChangePassword({ employeeCode: '0118', newPassword: 'FreshNew1' });
    assert.equal(result.status, 'PASSWORD_CHANGED');
    assert.equal(result.employeeCode, '0118');
    const update = api.updates[0];
    assert.equal(update.fields.Force_Password_Change.value, 'NO');
  });

});
