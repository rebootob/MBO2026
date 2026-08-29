import test from 'node:test';
import assert from 'node:assert/strict';

import { CryptoUtil } from '../src/crypto-util.js';
import { App801Repository, validateEmployeeCode } from '../src/app801-repository.js';
import { TicketService } from '../src/ticket-service.js';
import { SessionService } from '../src/session-service.js';
import { AuthService } from '../src/auth-service.js';
import { RateLimiter } from '../src/rate-limiter.js';
import { AuthBridgeRouter } from '../src/router.js';
import { parseBridgeConfig } from '../src/config.js';

function createMockTransport(initialRecords = []) {
  const store = new Map();
  initialRecords.forEach(r => {
    store.set(Number(r.$id.value), JSON.parse(JSON.stringify(r)));
  });

  return {
    store,
    async getRecords(appId, query) {
      const empMatch = query.match(/Employee_Code = "([^"]+)"/);
      const tokenMatch = query.match(/Session_Token_Hash = "([^"]+)"/);
      const found = [];

      for (const rec of store.values()) {
        if (empMatch && rec.Employee_Code?.value === empMatch[1]) {
          found.push(rec);
        } else if (tokenMatch && rec.Session_Token_Hash?.value === tokenMatch[1]) {
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

// 1. Fixed legacy PBKDF2 vector
test('1. CryptoUtil: Fixed legacy PBKDF2 vector verification', async () => {
  const password = '0113';
  const saltHex = '00112233445566778899aabbccddeeff';
  const expectedHashHex = '51cbc01895f8689f4e6a7f8f227b2264c5675e992b3ce7d1db6010bb523be7c3';
  const storedHash = `pbkdf2$100000$${saltHex}$${expectedHashHex}`;

  const valid = await CryptoUtil.verifyPassword(password, storedHash);
  assert.equal(valid, true, 'Fixed legacy vector must verify true when saltHex is decoded as bytes');

  const invalid = await CryptoUtil.verifyPassword('wrongpass', storedHash);
  assert.equal(invalid, false, 'Wrong password must fail legacy vector');
});

// 2. Malformed PBKDF2 format rejected
test('2. CryptoUtil: Malformed PBKDF2 string formats fail closed', async () => {
  assert.equal(await CryptoUtil.verifyPassword('0113', 'invalid$hash$string'), false);
  assert.equal(await CryptoUtil.verifyPassword('0113', 'pbkdf2$100000$shortsalt$hash'), false);
  assert.equal(await CryptoUtil.verifyPassword('0113', 'pbkdf2$100000$00112233445566778899aabbccddeeff$nothex'), false);
});

// 3. Employee_Code canonical validation
test('3. Repository: Employee_Code whitespace and invalid characters rejected', () => {
  assert.equal(validateEmployeeCode('0113'), '0113');
  assert.throws(() => validateEmployeeCode('0113 '), /INVALID_EMPLOYEE_CODE/);
  assert.throws(() => validateEmployeeCode(' 0113'), /INVALID_EMPLOYEE_CODE/);
  assert.throws(() => validateEmployeeCode('0113\n'), /INVALID_EMPLOYEE_CODE/);
  assert.throws(() => validateEmployeeCode('0113;DROP'), /INVALID_EMPLOYEE_CODE/);
});

// 4. Exact App801 session fields and fail-closed parsing
test('4. Repository: Fail-closed parsing for missing or invalid security fields', async () => {
  const malformedRecords = [
    { $id: { value: '1' }, Employee_Code: { value: '0113' }, Password_Hash: { value: 'hash' }, Force_Password_Change: { value: 'NO' }, Failed_Attempts: { value: 0 }, Credential_Version: { value: 1 } }, // Missing Account_Status
    { $id: { value: '2' }, Employee_Code: { value: '0114' }, Password_Hash: { value: 'hash' }, Account_Status: { value: 'ACTIVE' }, Failed_Attempts: { value: 0 }, Credential_Version: { value: 1 } }, // Missing Force_Password_Change
    { $id: { value: '3' }, Employee_Code: { value: '0115' }, Password_Hash: { value: 'hash' }, Account_Status: { value: 'ACTIVE' }, Force_Password_Change: { value: 'NO' }, Credential_Version: { value: 1 } } // Missing Failed_Attempts
  ];

  for (const rec of malformedRecords) {
    const transport = createMockTransport([rec]);
    const repo = new App801Repository({ appId: 801, transport });
    await assert.rejects(() => repo.getCredential(rec.Employee_Code.value), /MALFORMED_CREDENTIAL_RECORD/);
  }
});

// 5. Server-side session resolution by token hash
test('5. Session: Validates session by raw sessionToken hash without client Employee_Code', async () => {
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

  const { router } = await setupBridge(initialRecords);

  const loginRes = await router.handleRequest({
    method: 'POST',
    url: '/v1/auth/login',
    body: { employeeCode: '0113', password: 'Pass0113!' }
  });

  const sessionToken = loginRes.body.sessionToken;
  assert.ok(sessionToken);

  const validateRes = await router.handleRequest({
    method: 'POST',
    url: '/v1/auth/session/validate',
    body: { sessionToken } // NO employeeCode in body!
  });

  assert.equal(validateRes.body.status, 'AUTHENTICATED');
  assert.equal(validateRes.body.valid, true);
  assert.equal(validateRes.body.employeeCode, '0113');
});

// 6. Duplicate token hash fails closed
test('6. Session: Duplicate Session_Token_Hash fails closed', async () => {
  const token = '11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff';
  const tokenHash = CryptoUtil.hashToken(token);

  const rec1 = { $id: { value: '1' }, Employee_Code: { value: '0113' }, Password_Hash: { value: 'h' }, Account_Status: { value: 'ACTIVE' }, Force_Password_Change: { value: 'NO' }, Failed_Attempts: { value: 0 }, Credential_Version: { value: 1 }, Session_Token_Hash: { value: tokenHash } };
  const rec2 = { $id: { value: '2' }, Employee_Code: { value: '0114' }, Password_Hash: { value: 'h' }, Account_Status: { value: 'ACTIVE' }, Force_Password_Change: { value: 'NO' }, Failed_Attempts: { value: 0 }, Credential_Version: { value: 1 }, Session_Token_Hash: { value: tokenHash } };

  const transport = createMockTransport([rec1, rec2]);
  const repo = new App801Repository({ appId: 801, transport });
  await assert.rejects(() => repo.getCredentialBySessionTokenHash(tokenHash), /DUPLICATE_SESSION_TOKEN_RECORD/);
});

// 7. Session_Credential_Version mismatch invalidates session
test('7. Session: Session_Credential_Version mismatch invalidates session', async () => {
  const passHash = await CryptoUtil.hashPassword('Pass0113!');
  const token = '11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff';
  const tokenHash = CryptoUtil.hashToken(token);

  const initialRecords = [{
    $id: { value: '1' },
    Employee_Code: { value: '0113' },
    Password_Hash: { value: passHash },
    Force_Password_Change: { value: 'NO' },
    Account_Status: { value: 'ACTIVE' },
    Failed_Attempts: { value: 0 },
    Credential_Version: { value: 2 }, // Account version incremented to 2
    Session_Token_Hash: { value: tokenHash },
    Session_Expires_At: { value: new Date(Date.now() + 100000).toISOString() },
    Session_Credential_Version: { value: 1 } // Session still version 1
  }];

  const { router } = await setupBridge(initialRecords);

  const res = await router.handleRequest({
    method: 'POST',
    url: '/v1/auth/session/validate',
    body: { sessionToken: token }
  });

  assert.equal(res.body.status, 'INVALID_SESSION');
  assert.equal(res.body.reason, 'CREDENTIAL_VERSION_MISMATCH');
});

// 8. Temporary lockout: 5th failure sets Locked_Until but leaves Account_Status ACTIVE
test('8. Lockout: 5 failed attempts set temporary Locked_Until while leaving Account_Status ACTIVE', async () => {
  const passHash = await CryptoUtil.hashPassword('CorrectPass!');
  const initialRecords = [{
    $id: { value: '1' },
    Employee_Code: { value: '0114' },
    Password_Hash: { value: passHash },
    Force_Password_Change: { value: 'NO' },
    Account_Status: { value: 'ACTIVE' },
    Failed_Attempts: { value: 0 },
    Credential_Version: { value: 1 }
  }];

  const { router, transport } = await setupBridge(initialRecords);

  for (let i = 1; i <= 5; i++) {
    await router.handleRequest({
      method: 'POST',
      url: '/v1/auth/login',
      body: { employeeCode: '0114', password: 'WrongPassword' }
    });
  }

  const rec = transport.store.get(1);
  assert.equal(rec.Account_Status.value, 'ACTIVE', 'Temporary lockout MUST NOT rewrite Account_Status to LOCKED');
  assert.ok(rec.Locked_Until.value, 'Locked_Until timestamp must be set');
});

// 9. Permanent LOCKED remains denied after time passes
test('9. Lockout: Permanent LOCKED status remains denied regardless of Locked_Until', async () => {
  const passHash = await CryptoUtil.hashPassword('Pass123!');
  const initialRecords = [{
    $id: { value: '1' },
    Employee_Code: { value: '0115' },
    Password_Hash: { value: passHash },
    Force_Password_Change: { value: 'NO' },
    Account_Status: { value: 'LOCKED' }, // Permanent lock
    Locked_Until: { value: null },
    Failed_Attempts: { value: 5 },
    Credential_Version: { value: 1 }
  }];

  const { router } = await setupBridge(initialRecords);

  const res = await router.handleRequest({
    method: 'POST',
    url: '/v1/auth/login',
    body: { employeeCode: '0115', password: 'Pass123!' }
  });

  assert.equal(res.body.status, 'ACCOUNT_LOCKED');
});

// 10. Logout revokes session matching presented raw token
test('10. Logout: Revokes session by token without requiring client Employee_Code', async () => {
  const passHash = await CryptoUtil.hashPassword('Pass0120!');
  const initialRecords = [{
    $id: { value: '1' },
    Employee_Code: { value: '0120' },
    Password_Hash: { value: passHash },
    Force_Password_Change: { value: 'NO' },
    Account_Status: { value: 'ACTIVE' },
    Failed_Attempts: { value: 0 },
    Credential_Version: { value: 1 }
  }];

  const { router, transport } = await setupBridge(initialRecords);

  const loginRes = await router.handleRequest({
    method: 'POST',
    url: '/v1/auth/login',
    body: { employeeCode: '0120', password: 'Pass0120!' }
  });

  const sessionToken = loginRes.body.sessionToken;

  const logoutRes = await router.handleRequest({
    method: 'POST',
    url: '/v1/auth/logout',
    body: { sessionToken }
  });

  assert.equal(logoutRes.body.status, 'LOGGED_OUT');
  assert.equal(transport.store.get(1).Session_Token_Hash.value, null);
});

// 11. Force Change cannot re-enable DISABLED or LOCKED accounts
test('11. Force Change: Cannot change password for DISABLED or LOCKED account', async () => {
  const passHash = await CryptoUtil.hashPassword('0121');
  const initialRecords = [{
    $id: { value: '1' },
    Employee_Code: { value: '0121' },
    Password_Hash: { value: passHash },
    Force_Password_Change: { value: 'YES' },
    Account_Status: { value: 'DISABLED' },
    Failed_Attempts: { value: 0 },
    Credential_Version: { value: 1 }
  }];

  const { router, ticketService } = await setupBridge(initialRecords);
  const ticket = ticketService.issueForceTicket('0121', 1);

  const res = await router.handleRequest({
    method: 'POST',
    url: '/v1/auth/password/force-change',
    body: { forceTicket: ticket, newPassword: 'NewPassword123!' }
  });

  assert.equal(res.body.status, 'ACCOUNT_DISABLED');
});

// 12. Password change derives identity from session token
test('12. Password Change: Derives identity from session token server-side', async () => {
  const passHash = await CryptoUtil.hashPassword('OldPass123!');
  const initialRecords = [{
    $id: { value: '1' },
    Employee_Code: { value: '0122' },
    Password_Hash: { value: passHash },
    Force_Password_Change: { value: 'NO' },
    Account_Status: { value: 'ACTIVE' },
    Failed_Attempts: { value: 0 },
    Credential_Version: { value: 1 }
  }];

  const { router, transport } = await setupBridge(initialRecords);

  const loginRes = await router.handleRequest({
    method: 'POST',
    url: '/v1/auth/login',
    body: { employeeCode: '0122', password: 'OldPass123!' }
  });

  const sessionToken = loginRes.body.sessionToken;

  const changeRes = await router.handleRequest({
    method: 'POST',
    url: '/v1/auth/password/change',
    body: {
      sessionToken,
      currentPassword: 'OldPass123!',
      newPassword: 'NewPass456!'
    }
  });

  assert.equal(changeRes.body.status, 'AUTHENTICATED');
  assert.equal(transport.store.get(1).Credential_Version.value, 2);
});

// 13. Sanitized error response for internal errors
test('13. Error Handling: Internal repository error text is sanitized and never leaked', async () => {
  const transport = {
    async getRecords() {
      throw new Error('INTERNAL_DATABASE_SECRET_PATH_EXPOSED');
    }
  };
  const repository = new App801Repository({ appId: 801, transport });
  const ticketService = new TicketService({ signingSecret: 'secret_key_32_bytes_min_test' });
  const sessionService = new SessionService({ repository });
  const authService = new AuthService({ repository, sessionService, ticketService });
  const router = new AuthBridgeRouter({ authService, sessionService, allowedOrigins: ['https://example.cybozu.com'] });

  const res = await router.handleRequest({
    method: 'POST',
    url: '/v1/auth/login',
    body: { employeeCode: '0113', password: 'pass' }
  });

  assert.equal(res.statusCode, 500);
  assert.equal(res.body.status, 'AUTH_SERVICE_UNAVAILABLE');
  assert.equal(res.body.reason.includes('SECRET'), false, 'Response body MUST NOT leak internal secret message');
});

// 14. Repository boundaries: NO createRecord or deleteRecord capabilities
test('14. Repository Boundaries: NO createRecord or deleteRecord capabilities exist', async () => {
  const { repository } = await setupBridge();
  assert.throws(() => repository.createRecord(), /UNAUTHORIZED_OPERATION/);
  assert.throws(() => repository.deleteRecord(), /UNAUTHORIZED_OPERATION/);
});

// 15. Config validation
test('15. Config Validation: Throws on missing secret or wildcard origins', () => {
  assert.throws(() => parseBridgeConfig({ FORCE_CHANGE_SIGNING_SECRET: '', ALLOWED_ORIGINS: 'https://example.com' }), /CONFIG_ERROR/);
  assert.throws(() => parseBridgeConfig({ FORCE_CHANGE_SIGNING_SECRET: 'valid_secret_key_32_bytes', ALLOWED_ORIGINS: '*' }), /CONFIG_ERROR/);
});
