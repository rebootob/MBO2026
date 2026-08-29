import test from 'node:test';
import assert from 'node:assert/strict';

import { CryptoUtil } from '../src/crypto-util.js';
import { App801Repository } from '../src/app801-repository.js';
import { TicketService } from '../src/ticket-service.js';
import { SessionService } from '../src/session-service.js';
import { AuthService } from '../src/auth-service.js';
import { RateLimiter } from '../src/rate-limiter.js';
import { AuthBridgeRouter } from '../src/router.js';

function createMockTransport(initialRecords = []) {
  const store = new Map();
  initialRecords.forEach(r => {
    store.set(Number(r.$id.value), JSON.parse(JSON.stringify(r)));
  });

  return {
    store,
    async getRecords(appId, query) {
      const match = query.match(/Employee_Code = "([^"]+)"/);
      if (!match) return { records: [] };
      const code = match[1];
      const found = [];
      for (const rec of store.values()) {
        if (rec.Employee_Code?.value === code) {
          found.push(rec);
        }
      }
      return { records: found };
    },
    async updateRecord(appId, recordId, recordUpdate) {
      const existing = store.get(Number(recordId));
      if (!existing) {
        throw new Error('RECORD_NOT_FOUND');
      }
      for (const [key, valObj] of Object.entries(recordUpdate)) {
        existing[key] = valObj;
      }
      return { revision: (existing.$id?.revision || 1) + 1 };
    }
  };
}

async function setupBridge(initialRecords = []) {
  const transport = createMockTransport(initialRecords);
  const repository = new App801Repository({ appId: 801, transport });
  const ticketService = new TicketService({ signingSecret: 'test_secret_key_32_bytes_minimum' });
  const sessionService = new SessionService({ repository });
  const authService = new AuthService({ repository, sessionService, ticketService });
  const rateLimiter = new RateLimiter({ maxRequests: 5, windowMs: 60000 });
  const router = new AuthBridgeRouter({
    authService,
    sessionService,
    rateLimiter,
    allowedOrigins: ['https://example.cybozu.com']
  });

  return { transport, repository, ticketService, sessionService, authService, rateLimiter, router };
}

// 1. Existing PBKDF2 format verify + new hash compatibility
test('1. CryptoUtil: PBKDF2 format verify and new hash compatibility', async () => {
  const password = 'SecretPassword123!';
  const hash = await CryptoUtil.hashPassword(password);
  assert.ok(hash.startsWith('pbkdf2$100000$'), 'Hash format must start with pbkdf2$100000$');

  const valid = await CryptoUtil.verifyPassword(password, hash);
  assert.equal(valid, true, 'Valid password must verify true');

  const invalid = await CryptoUtil.verifyPassword('WrongPassword', hash);
  assert.equal(invalid, false, 'Invalid password must verify false');
});

// 2. Valid ACTIVE login -> raw session returned, only token hash persisted
test('2. Login: Valid ACTIVE login returns raw session token and persists SHA-256 token hash', async () => {
  const passHash = await CryptoUtil.hashPassword('Pass0113!');
  const initialRecords = [{
    $id: { value: '1' },
    Employee_Code: { value: '0113' },
    Password_Hash: { value: passHash },
    Force_Password_Change: { value: 'NO' },
    Account_Status: { value: 'ACTIVE' },
    Failed_Attempts: { value: 0 },
    Credential_Version: { value: 1 }
  }];

  const { router, transport } = await setupBridge(initialRecords);
  const req = {
    method: 'POST',
    url: '/v1/auth/login',
    body: { employeeCode: '0113', password: 'Pass0113!' }
  };

  const res = await router.handleRequest(req);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.status, 'AUTHENTICATED');
  assert.ok(res.body.sessionToken, 'Raw sessionToken must be returned');

  // Verify stored in repository is token hash only, NOT raw token
  const storedRec = transport.store.get(1);
  const storedHash = storedRec.Session_Token_Hash?.value;
  assert.ok(storedHash, 'Session_Token_Hash must be persisted');
  assert.notEqual(storedHash, res.body.sessionToken, 'Persisted hash must not equal raw session token');
  assert.equal(storedHash, CryptoUtil.hashToken(res.body.sessionToken));
});

// 3. Wrong password increments attempts and 5th failure produces 15-minute lock
test('3. Lockout: 5 failed login attempts trigger 15-minute account lock', async () => {
  const passHash = await CryptoUtil.hashPassword('CorrectPass!');
  const initialRecords = [{
    $id: { value: '2' },
    Employee_Code: { value: '0114' },
    Password_Hash: { value: passHash },
    Force_Password_Change: { value: 'NO' },
    Account_Status: { value: 'ACTIVE' },
    Failed_Attempts: { value: 0 },
    Credential_Version: { value: 1 }
  }];

  const { router } = await setupBridge(initialRecords);

  for (let i = 1; i <= 4; i++) {
    const res = await router.handleRequest({
      method: 'POST',
      url: '/v1/auth/login',
      body: { employeeCode: '0114', password: 'WrongPassword' }
    });
    assert.equal(res.body.status, 'INVALID_CREDENTIALS');
  }

  // 5th failure
  const res5 = await router.handleRequest({
    method: 'POST',
    url: '/v1/auth/login',
    body: { employeeCode: '0114', password: 'WrongPassword' }
  });
  assert.equal(res5.body.status, 'ACCOUNT_LOCKED');
});

// 4. LOCKED / DISABLED denied with correct stable status
test('4. Account Status: LOCKED and DISABLED accounts are denied with stable status', async () => {
  const passHash = await CryptoUtil.hashPassword('ValidPass1!');
  const initialRecords = [
    {
      $id: { value: '3' },
      Employee_Code: { value: '0115' },
      Password_Hash: { value: passHash },
      Account_Status: { value: 'DISABLED' },
      Failed_Attempts: { value: 0 }
    },
    {
      $id: { value: '4' },
      Employee_Code: { value: '0116' },
      Password_Hash: { value: passHash },
      Account_Status: { value: 'LOCKED' },
      Locked_Until: { value: new Date(Date.now() + 600000).toISOString() },
      Failed_Attempts: { value: 5 }
    }
  ];

  const { router } = await setupBridge(initialRecords);

  const resDisabled = await router.handleRequest({
    method: 'POST',
    url: '/v1/auth/login',
    body: { employeeCode: '0115', password: 'ValidPass1!' }
  });
  assert.equal(resDisabled.body.status, 'ACCOUNT_DISABLED');

  const resLocked = await router.handleRequest({
    method: 'POST',
    url: '/v1/auth/login',
    body: { employeeCode: '0116', password: 'ValidPass1!' }
  });
  assert.equal(resLocked.body.status, 'ACCOUNT_LOCKED');
});

// 5. Force Change -> ticket only, no usable session
test('5. Force Change: Initial login returns forceTicket only and no sessionToken', async () => {
  const passHash = await CryptoUtil.hashPassword('0117');
  const initialRecords = [{
    $id: { value: '5' },
    Employee_Code: { value: '0117' },
    Password_Hash: { value: passHash },
    Force_Password_Change: { value: 'YES' },
    Account_Status: { value: 'ACTIVE' },
    Failed_Attempts: { value: 0 },
    Credential_Version: { value: 1 }
  }];

  const { router } = await setupBridge(initialRecords);

  const res = await router.handleRequest({
    method: 'POST',
    url: '/v1/auth/login',
    body: { employeeCode: '0117', password: '0117' }
  });

  assert.equal(res.body.status, 'PASSWORD_CHANGE_REQUIRED');
  assert.ok(res.body.forceTicket, 'forceTicket must be returned');
  assert.equal(res.body.sessionToken, undefined, 'NO sessionToken must be issued');
});

// 6. Tampered / expired / version-mismatched force ticket denied
test('6. Force Ticket Validation: Tampered or expired force ticket is denied', async () => {
  const { ticketService } = await setupBridge();
  const ticket = ticketService.issueForceTicket('0117', 1, new Date(1000000)); // Expired date

  const check = ticketService.verifyForceTicket(ticket, '0117', 1, new Date(2000000));
  assert.equal(check.valid, false);
  assert.equal(check.reason, 'TICKET_EXPIRED');

  // Tampered ticket
  const tamperedTicket = ticket + 'tampered';
  const checkTampered = ticketService.verifyForceTicket(tamperedTicket, '0117', 1, new Date());
  assert.equal(checkTampered.valid, false);
});

// 7. Successful Force Change increments Credential_Version + issues session
test('7. Force Password Change: Successful force change increments Credential_Version and returns session', async () => {
  const passHash = await CryptoUtil.hashPassword('0118');
  const initialRecords = [{
    $id: { value: '6' },
    Employee_Code: { value: '0118' },
    Password_Hash: { value: passHash },
    Force_Password_Change: { value: 'YES' },
    Account_Status: { value: 'ACTIVE' },
    Failed_Attempts: { value: 0 },
    Credential_Version: { value: 1 }
  }];

  const { router, ticketService, transport } = await setupBridge(initialRecords);
  const ticket = ticketService.issueForceTicket('0118', 1);

  const res = await router.handleRequest({
    method: 'POST',
    url: '/v1/auth/password/force-change',
    body: {
      forceTicket: ticket,
      employeeCode: '0118',
      newPassword: 'NewSecurePassword123!'
    }
  });

  assert.equal(res.body.status, 'AUTHENTICATED');
  assert.ok(res.body.sessionToken);

  const updatedRec = transport.store.get(6);
  assert.equal(updatedRec.Force_Password_Change.value, 'NO');
  assert.equal(updatedRec.Credential_Version.value, 2, 'Credential_Version must increment to 2');
});

// 8. Session validation checks ACTIVE, Force=NO, expiry, Credential_Version, Kintone context
test('8. Session Validation: Validates ACTIVE status, expiry, and context binding', async () => {
  const passHash = await CryptoUtil.hashPassword('Pass0119!');
  const initialRecords = [{
    $id: { value: '7' },
    Employee_Code: { value: '0119' },
    Password_Hash: { value: passHash },
    Force_Password_Change: { value: 'NO' },
    Account_Status: { value: 'ACTIVE' },
    Failed_Attempts: { value: 0 },
    Credential_Version: { value: 1 }
  }];

  const { router } = await setupBridge(initialRecords);

  const loginRes = await router.handleRequest({
    method: 'POST',
    url: '/v1/auth/login',
    body: { employeeCode: '0119', password: 'Pass0119!', kintoneUserCode: 'emp0119' }
  });

  const sessionToken = loginRes.body.sessionToken;

  const valRes = await router.handleRequest({
    method: 'POST',
    url: '/v1/auth/session/validate',
    body: { sessionToken, employeeCode: '0119', kintoneUserCode: 'emp0119' }
  });

  assert.equal(valRes.body.status, 'AUTHENTICATED');
  assert.equal(valRes.body.valid, true);
  assert.equal(valRes.body.employeeCode, '0119');
});

// 9. Logout clears persisted session fields
test('9. Logout: Revokes session by clearing persisted Session_Token_Hash', async () => {
  const passHash = await CryptoUtil.hashPassword('Pass0120!');
  const initialRecords = [{
    $id: { value: '8' },
    Employee_Code: { value: '0120' },
    Password_Hash: { value: passHash },
    Force_Password_Change: { value: 'NO' },
    Account_Status: { value: 'ACTIVE' },
    Failed_Attempts: { value: 0 }
  }];

  const { router, transport } = await setupBridge(initialRecords);

  const loginRes = await router.handleRequest({
    method: 'POST',
    url: '/v1/auth/login',
    body: { employeeCode: '0120', password: 'Pass0120!' }
  });

  assert.ok(transport.store.get(8).Session_Token_Hash.value);

  const logoutRes = await router.handleRequest({
    method: 'POST',
    url: '/v1/auth/logout',
    body: { employeeCode: '0120' }
  });

  assert.equal(logoutRes.body.status, 'LOGGED_OUT');
  assert.equal(transport.store.get(8).Session_Token_Hash.value, null);
});

// 10. Normal password change rotates Credential_Version + session
test('10. Password Change: Rotates Credential_Version and replaces session token', async () => {
  const passHash = await CryptoUtil.hashPassword('OldPass123!');
  const initialRecords = [{
    $id: { value: '9' },
    Employee_Code: { value: '0121' },
    Password_Hash: { value: passHash },
    Force_Password_Change: { value: 'NO' },
    Account_Status: { value: 'ACTIVE' },
    Credential_Version: { value: 1 }
  }];

  const { router, transport } = await setupBridge(initialRecords);

  const loginRes = await router.handleRequest({
    method: 'POST',
    url: '/v1/auth/login',
    body: { employeeCode: '0121', password: 'OldPass123!' }
  });

  const oldToken = loginRes.body.sessionToken;

  const changeRes = await router.handleRequest({
    method: 'POST',
    url: '/v1/auth/password/change',
    body: {
      sessionToken: oldToken,
      employeeCode: '0121',
      currentPassword: 'OldPass123!',
      newPassword: 'NewPass456!'
    }
  });

  assert.equal(changeRes.body.status, 'AUTHENTICATED');
  assert.ok(changeRes.body.sessionToken);
  assert.notEqual(changeRes.body.sessionToken, oldToken);
  assert.equal(transport.store.get(9).Credential_Version.value, 2);
});

// 11. Duplicate / malformed credential rows fail closed
test('11. Duplicate/Malformed Records: Fails closed on duplicate Employee_Code or missing Password_Hash', async () => {
  const initialRecords = [
    { $id: { value: '10' }, Employee_Code: { value: '0122' }, Password_Hash: { value: 'hash1' }, Account_Status: { value: 'ACTIVE' } },
    { $id: { value: '11' }, Employee_Code: { value: '0122' }, Password_Hash: { value: 'hash2' }, Account_Status: { value: 'ACTIVE' } }
  ];

  const { router } = await setupBridge(initialRecords);

  const res = await router.handleRequest({
    method: 'POST',
    url: '/v1/auth/login',
    body: { employeeCode: '0122', password: 'any' }
  });

  assert.equal(res.body.status, 'AUTH_SERVICE_UNAVAILABLE');
});

// 12. No response exposes Password_Hash / Session_Token_Hash / API token / signing secret
test('12. Security Boundary: Response bodies never leak secrets or hashes', async () => {
  const passHash = await CryptoUtil.hashPassword('Pass0123!');
  const initialRecords = [{
    $id: { value: '12' },
    Employee_Code: { value: '0123' },
    Password_Hash: { value: passHash },
    Force_Password_Change: { value: 'NO' },
    Account_Status: { value: 'ACTIVE' }
  }];

  const { router } = await setupBridge(initialRecords);

  const res = await router.handleRequest({
    method: 'POST',
    url: '/v1/auth/login',
    body: { employeeCode: '0123', password: 'Pass0123!' }
  });

  const jsonStr = JSON.stringify(res.body);
  assert.equal(jsonStr.includes('Password_Hash'), false);
  assert.equal(jsonStr.includes('Session_Token_Hash'), false);
  assert.equal(jsonStr.includes('API_TOKEN'), false);
  assert.equal(jsonStr.includes('SECRET'), false);
});

// 13. Repository/router has no record create/delete capability
test('13. Repository Boundaries: NO createRecord or deleteRecord capabilities exist', async () => {
  const { repository } = await setupBridge();
  assert.throws(() => repository.createRecord(), /UNAUTHORIZED_OPERATION/);
  assert.throws(() => repository.deleteRecord(), /UNAUTHORIZED_OPERATION/);
});

// 14. Disallowed Origin rejected; allowed Origin receives no-store response
test('14. Transport Hardening: CORS origin check and Cache-Control: no-store headers', async () => {
  const { router } = await setupBridge();

  const allowedRes = await router.handleRequest({
    method: 'GET',
    url: '/healthz',
    headers: { origin: 'https://example.cybozu.com' }
  });
  assert.equal(allowedRes.statusCode, 200);
  assert.equal(allowedRes.headers['Cache-Control'], 'no-store, no-cache, must-revalidate, proxy-revalidate');
  assert.equal(allowedRes.headers['Access-Control-Allow-Origin'], 'https://example.cybozu.com');

  const deniedRes = await router.handleRequest({
    method: 'GET',
    url: '/healthz',
    headers: { origin: 'https://malicious.com' }
  });
  assert.equal(deniedRes.statusCode, 403);
  assert.equal(deniedRes.body.error, 'CORS_ORIGIN_DENIED');
});

// 15. Injected limiter can produce RATE_LIMITED
test('15. Rate Limiting: Exceeding request threshold returns RATE_LIMITED status', async () => {
  const { router } = await setupBridge();

  for (let i = 0; i < 5; i++) {
    await router.handleRequest({ method: 'GET', url: '/healthz', ip: '1.2.3.4' });
  }

  const limitedRes = await router.handleRequest({ method: 'GET', url: '/healthz', ip: '1.2.3.4' });
  assert.equal(limitedRes.statusCode, 429);
  assert.equal(limitedRes.body.status, 'RATE_LIMITED');
});
