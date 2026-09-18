import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { createD3OAuthAttestationHandler } from '../src/server/routes/d3-oauth-attestation-handler.js';

function createMockReq(options = {}) {
  const chunks = options.body ? [Buffer.from(JSON.stringify(options.body))] : [];
  return {
    method: options.method || 'GET',
    url: options.url || '/',
    headers: options.headers || {},
    async *[Symbol.asyncIterator]() {
      for (const chunk of chunks) {
        yield chunk;
      }
    }
  };
}

function createMockRes() {
  let statusCode = 200;
  let headers = {};
  let body = '';

  return {
    writeHead: (code, hdrs) => {
      statusCode = code;
      headers = { ...headers, ...hdrs };
    },
    end: (chunk) => {
      if (chunk) body += chunk;
    },
    getStatusCode: () => statusCode,
    getBody: () => (body ? JSON.parse(body) : null),
    getRawBody: () => body,
    getHeaders: () => headers
  };
}

const mockAuthService = {
  getAuthenticatedPrincipal: async (token) => {
    if (token === 'VALID_SESSION_A') {
      return { employeeCode: 'EMP001', kintoneUserCode: 'user01', isTechnicalAdmin: false };
    }
    if (token === 'VALID_SESSION_B') {
      return { employeeCode: 'EMP002', kintoneUserCode: 'user02', isTechnicalAdmin: false };
    }
    if (token === 'INVALID_PRINCIPAL_NO_CODE') {
      return { kintoneUserCode: 'user03', isTechnicalAdmin: false };
    }
    // Expired, invalid or password-change-only returns null in real production MboAuthSessionService
    return null;
  }
};

test('D3OAuthAttestationHandler: rejects unauthenticated requests on authorize and callback', async () => {
  const handler = createD3OAuthAttestationHandler({
    authService: mockAuthService,
    oauthClient: { getAuthorizationUrl: () => 'https://kintone/oauth' }
  });

  // Missing session
  const req = createMockReq({ method: 'GET', url: '/api/mbo/d3/oauth/authorize' });
  const res = createMockRes();
  await handler(req, res, { url: new URL('http://localhost/api/mbo/d3/oauth/authorize') });
  assert.equal(res.getStatusCode(), 401);
  assert.equal(res.getBody().status, 'UNAUTHORIZED');

  // Expired session / invalid returns null
  const reqExp = createMockReq({ method: 'GET', url: '/api/mbo/d3/oauth/authorize' });
  const resExp = createMockRes();
  await handler(reqExp, resExp, {
    url: new URL('http://localhost/api/mbo/d3/oauth/authorize'),
    token: 'NON_EXISTENT_OR_EXPIRED_SESSION'
  });
  assert.equal(resExp.getStatusCode(), 401);
  assert.equal(resExp.getBody().status, 'UNAUTHORIZED');

  // Principal without employeeCode returns null/unauthorized
  const reqNoEmp = createMockReq({ method: 'GET', url: '/api/mbo/d3/oauth/authorize' });
  const resNoEmp = createMockRes();
  await handler(reqNoEmp, resNoEmp, {
    url: new URL('http://localhost/api/mbo/d3/oauth/authorize'),
    token: 'INVALID_PRINCIPAL_NO_CODE'
  });
  assert.equal(resNoEmp.getStatusCode(), 401);
  assert.equal(resNoEmp.getBody().status, 'UNAUTHORIZED');
});

test('D3OAuthAttestationHandler: authorizes with exact scopes, NO PKCE, and session-bound state', async () => {
  let passedScope = null;
  let passedResponseType = null;

  const mockOauthClient = {
    getAuthorizationUrl: ({ state, responseType, scope }) => {
      passedScope = scope;
      passedResponseType = responseType;
      return `https://kintone/oauth/authorize?state=${state}&scope=${encodeURIComponent(scope)}`;
    }
  };

  const handler = createD3OAuthAttestationHandler({
    authService: mockAuthService,
    oauthClient: mockOauthClient
  });

  const req = createMockReq({ method: 'GET', url: '/api/mbo/d3/oauth/authorize' });
  const res = createMockRes();
  await handler(req, res, {
    url: new URL('http://localhost/api/mbo/d3/oauth/authorize'),
    token: 'VALID_SESSION_A'
  });

  assert.equal(res.getStatusCode(), 200);
  assert.equal(passedScope, 'k:app_record:read k:app_record:write');
  assert.equal(passedResponseType, 'code');
  assert.ok(res.getBody().state);
  assert.ok(!res.getBody().state.includes('userCode'));
  assert.ok(!res.getRawBody().includes('code_challenge'));
  assert.ok(!res.getRawBody().includes('code_verifier'));
});

test('D3OAuthAttestationHandler: callback requires same sessionBinding and fails closed on cross-session callback', async () => {
  const storedGrants = new Map();
  const mockTokenStore = {
    storeGrant: async (binding, grant) => storedGrants.set(binding, grant)
  };

  const mockOauthClient = {
    getAuthorizationUrl: ({ state }) => `https://kintone/oauth/authorize?state=${state}`,
    exchangeCode: async ({ code }) => ({
      accessToken: 'MOCK_ACCESS_TOKEN_SECRET',
      refreshToken: 'MOCK_REFRESH_TOKEN_SECRET',
      expiresIn: 3600
    })
  };

  const handler = createD3OAuthAttestationHandler({
    authService: mockAuthService,
    oauthClient: mockOauthClient,
    tokenStore: mockTokenStore
  });

  // 1. Session A generates state
  const reqAuth = createMockReq({ method: 'GET', url: '/api/mbo/d3/oauth/authorize' });
  const resAuth = createMockRes();
  await handler(reqAuth, resAuth, {
    url: new URL('http://localhost/api/mbo/d3/oauth/authorize'),
    token: 'VALID_SESSION_A'
  });
  const state = resAuth.getBody().state;

  // 2. Session B attempts callback with state from Session A
  const reqCbB = createMockReq({ method: 'GET', url: `/api/mbo/d3/oauth/callback?code=CODE123&state=${state}` });
  const resCbB = createMockRes();
  await handler(reqCbB, resCbB, {
    url: new URL(`http://localhost/api/mbo/d3/oauth/callback?code=CODE123&state=${state}`),
    token: 'VALID_SESSION_B'
  });
  assert.equal(resCbB.getStatusCode(), 403);
  assert.equal(resCbB.getBody().status, 'OAUTH_STATE_SESSION_MISMATCH');

  // 3. Replay with Session A fails because state was consumed/cleared
  const reqCbA2 = createMockReq({ method: 'GET', url: `/api/mbo/d3/oauth/callback?code=CODE123&state=${state}` });
  const resCbA2 = createMockRes();
  await handler(reqCbA2, resCbA2, {
    url: new URL(`http://localhost/api/mbo/d3/oauth/callback?code=CODE123&state=${state}`),
    token: 'VALID_SESSION_A'
  });
  assert.equal(resCbA2.getStatusCode(), 403);
  assert.equal(resCbA2.getBody().status, 'STATE_INVALID');

  // 4. Now do valid flow: Session A authorises and callbacks with Session A
  const resAuth2 = createMockRes();
  await handler(reqAuth, resAuth2, {
    url: new URL('http://localhost/api/mbo/d3/oauth/authorize'),
    token: 'VALID_SESSION_A'
  });
  const state2 = resAuth2.getBody().state;

  const reqCbA = createMockReq({ method: 'GET', url: `/api/mbo/d3/oauth/callback?code=CODE456&state=${state2}` });
  const resCbA = createMockRes();
  await handler(reqCbA, resCbA, {
    url: new URL(`http://localhost/api/mbo/d3/oauth/callback?code=CODE456&state=${state2}`),
    token: 'VALID_SESSION_A'
  });
  assert.equal(resCbA.getStatusCode(), 200);
  assert.equal(resCbA.getBody().status, 'OAUTH_SUCCESS');

  // Check secret safety in callback response
  const rawBody = resCbA.getRawBody();
  assert.ok(!rawBody.includes('MOCK_ACCESS_TOKEN_SECRET'));
  assert.ok(!rawBody.includes('MOCK_REFRESH_TOKEN_SECRET'));
  assert.ok(!rawBody.includes('client_secret'));

  // Check grant stored under sessionBinding (hash of token), NOT userCode
  const expectedBindingA = crypto.createHash('sha256').update('VALID_SESSION_A').digest('hex');
  assert.ok(storedGrants.has(expectedBindingA));
  assert.ok(!storedGrants.has('EMP001'));
  assert.ok(!storedGrants.has('user01'));
});

test('D3OAuthAttestationHandler: prepare-transition enforces strict body allowlist (rejects userCode, tokens, etc.)', async () => {
  let executedTransition = null;
  const mockTransitionService = {
    executeTrustedTransition: async (params) => {
      executedTransition = params;
      return {
        status: 'TRANSITION_COMMITTED',
        recordId: params.recordId,
        targetStage: 'MIDYEAR',
        previousStatus: '05 Objective Approved',
        newStatus: '06 Employee Mid-Year'
      };
    }
  };

  const handler = createD3OAuthAttestationHandler({
    authService: mockAuthService,
    transitionService: mockTransitionService
  });

  // Rejects extra keys (userCode)
  const reqWithUserCode = createMockReq({
    method: 'POST',
    url: '/api/mbo/d3/transaction/prepare-transition',
    headers: { 'content-type': 'application/json' },
    body: {
      recordId: 100,
      intendedAction: 'Start Mid-Year',
      userCode: 'EMP001'
    }
  });
  const resWithUserCode = createMockRes();
  await handler(reqWithUserCode, resWithUserCode, {
    url: new URL('http://localhost/api/mbo/d3/transaction/prepare-transition'),
    token: 'VALID_SESSION_A'
  });
  assert.equal(resWithUserCode.getStatusCode(), 400);
  assert.equal(resWithUserCode.getBody().status, 'UNAUTHORIZED_PAYLOAD_KEYS');

  // Rejects accessToken or grantId
  const reqWithToken = createMockReq({
    method: 'POST',
    url: '/api/mbo/d3/transaction/prepare-transition',
    headers: { 'content-type': 'application/json' },
    body: {
      recordId: 100,
      intendedAction: 'Start Mid-Year',
      accessToken: 'TOKEN_123'
    }
  });
  const resWithToken = createMockRes();
  await handler(reqWithToken, resWithToken, {
    url: new URL('http://localhost/api/mbo/d3/transaction/prepare-transition'),
    token: 'VALID_SESSION_A'
  });
  assert.equal(resWithToken.getStatusCode(), 400);
  assert.equal(resWithToken.getBody().status, 'UNAUTHORIZED_PAYLOAD_KEYS');

  // Valid EXACT keys: recordId, intendedAction
  const validReq = createMockReq({
    method: 'POST',
    url: '/api/mbo/d3/transaction/prepare-transition',
    headers: { 'content-type': 'application/json' },
    body: {
      recordId: 100,
      intendedAction: 'Start Mid-Year'
    }
  });
  const validRes = createMockRes();
  await handler(validReq, validRes, {
    url: new URL('http://localhost/api/mbo/d3/transaction/prepare-transition'),
    token: 'VALID_SESSION_A'
  });
  assert.equal(validRes.getStatusCode(), 200);
  assert.equal(validRes.getBody().status, 'TRANSITION_COMMITTED');
  assert.equal(validRes.getBody().recordId, 100);

  // Transition received sessionBinding, not userCode from body
  const expectedBindingA = crypto.createHash('sha256').update('VALID_SESSION_A').digest('hex');
  assert.equal(executedTransition.sessionBinding, expectedBindingA);
  assert.equal(executedTransition.userCode, undefined);
});

test('D3OAuthAttestationHandler: Corrective 2 - strictly requires gateway context.token and forbids Authorization header fallback', async () => {
  let authServiceCalled = false;
  const spyAuthService = {
    getAuthenticatedPrincipal: async (token) => {
      authServiceCalled = true;
      return { employeeCode: 'EMP001', kintoneUserCode: 'user01' };
    }
  };

  const handler = createD3OAuthAttestationHandler({
    authService: spyAuthService,
    oauthClient: { getAuthorizationUrl: () => 'https://kintone/oauth' }
  });

  // Request has Authorization header but NO context.token
  const req = createMockReq({
    method: 'GET',
    url: '/api/mbo/d3/oauth/authorize',
    headers: {
      authorization: 'Bearer VALID_SESSION_A'
    }
  });
  const res = createMockRes();

  await handler(req, res, {
    url: new URL('http://localhost/api/mbo/d3/oauth/authorize')
    // notice: NO token in context!
  });

  assert.equal(res.getStatusCode(), 401);
  assert.equal(res.getBody().status, 'UNAUTHORIZED');
  assert.equal(authServiceCalled, false, 'Auth service must not be invoked using Authorization header fallback');
});

test('D3OAuthAttestationHandler: Corrective 3 - transaction status endpoint requires gateway session and enforces ownerSessionBinding', async () => {
  const bindingA = crypto.createHash('sha256').update('VALID_SESSION_A').digest('hex');
  const bindingB = crypto.createHash('sha256').update('VALID_SESSION_B').digest('hex');

  const mockNonceStore = new Map();
  const mockAttestationVerifier = {
    nonceStore: mockNonceStore
  };

  mockNonceStore.set('NONCE_OWNED_BY_A', {
    status: 'UNCONSUMED',
    issuedAt: Date.now(),
    expiresAt: Date.now() + 300000,
    ownerSessionBinding: bindingA,
    binding: {
      recordId: 100,
      intendedAction: 'Start Mid-Year'
    }
  });

  mockNonceStore.set('NONCE_OWNER_MISSING', {
    status: 'UNCONSUMED',
    issuedAt: Date.now(),
    expiresAt: Date.now() + 300000,
    binding: {
      recordId: 101,
      intendedAction: 'Start Mid-Year'
    }
  });

  mockNonceStore.set('NONCE_OWNER_NULL', {
    status: 'UNCONSUMED',
    issuedAt: Date.now(),
    expiresAt: Date.now() + 300000,
    ownerSessionBinding: null,
    binding: {
      recordId: 102,
      intendedAction: 'Start Mid-Year'
    }
  });

  mockNonceStore.set('NONCE_OWNER_BLANK', {
    status: 'UNCONSUMED',
    issuedAt: Date.now(),
    expiresAt: Date.now() + 300000,
    ownerSessionBinding: '   ',
    binding: {
      recordId: 103,
      intendedAction: 'Start Mid-Year'
    }
  });

  const handler = createD3OAuthAttestationHandler({
    authService: mockAuthService,
    attestationVerifier: mockAttestationVerifier
  });

  // 1. Unauthenticated request -> 401 UNAUTHORIZED
  const reqUnauth = createMockReq({ method: 'GET', url: '/api/mbo/d3/transaction/status/NONCE_OWNED_BY_A' });
  const resUnauth = createMockRes();
  await handler(reqUnauth, resUnauth, {
    url: new URL('http://localhost/api/mbo/d3/transaction/status/NONCE_OWNED_BY_A')
  });
  assert.equal(resUnauth.getStatusCode(), 401);
  assert.equal(resUnauth.getBody().status, 'UNAUTHORIZED');

  // 2. Unknown nonce under valid session -> 404 NONCE_NOT_FOUND
  const reqNotFound = createMockReq({ method: 'GET', url: '/api/mbo/d3/transaction/status/NONCE_DOES_NOT_EXIST' });
  const resNotFound = createMockRes();
  await handler(reqNotFound, resNotFound, {
    url: new URL('http://localhost/api/mbo/d3/transaction/status/NONCE_DOES_NOT_EXIST'),
    token: 'VALID_SESSION_A'
  });
  assert.equal(resNotFound.getStatusCode(), 404);
  assert.equal(resNotFound.getBody().status, 'NONCE_NOT_FOUND');

  // 3. ownerSessionBinding missing -> 403 STATUS_NONCE_OWNER_NOT_RESOLVED
  const reqMissing = createMockReq({ method: 'GET', url: '/api/mbo/d3/transaction/status/NONCE_OWNER_MISSING' });
  const resMissing = createMockRes();
  await handler(reqMissing, resMissing, {
    url: new URL('http://localhost/api/mbo/d3/transaction/status/NONCE_OWNER_MISSING'),
    token: 'VALID_SESSION_A'
  });
  assert.equal(resMissing.getStatusCode(), 403);
  assert.equal(resMissing.getBody().status, 'STATUS_NONCE_OWNER_NOT_RESOLVED');

  // 4. ownerSessionBinding null -> 403 STATUS_NONCE_OWNER_NOT_RESOLVED
  const reqNull = createMockReq({ method: 'GET', url: '/api/mbo/d3/transaction/status/NONCE_OWNER_NULL' });
  const resNull = createMockRes();
  await handler(reqNull, resNull, {
    url: new URL('http://localhost/api/mbo/d3/transaction/status/NONCE_OWNER_NULL'),
    token: 'VALID_SESSION_A'
  });
  assert.equal(resNull.getStatusCode(), 403);
  assert.equal(resNull.getBody().status, 'STATUS_NONCE_OWNER_NOT_RESOLVED');

  // 5. ownerSessionBinding blank/whitespace -> 403 STATUS_NONCE_OWNER_NOT_RESOLVED
  const reqBlank = createMockReq({ method: 'GET', url: '/api/mbo/d3/transaction/status/NONCE_OWNER_BLANK' });
  const resBlank = createMockRes();
  await handler(reqBlank, resBlank, {
    url: new URL('http://localhost/api/mbo/d3/transaction/status/NONCE_OWNER_BLANK'),
    token: 'VALID_SESSION_A'
  });
  assert.equal(resBlank.getStatusCode(), 403);
  assert.equal(resBlank.getBody().status, 'STATUS_NONCE_OWNER_NOT_RESOLVED');

  // 6. Cross-session lookup: Session B looks up nonce owned by Session A -> 403 STATUS_NONCE_SESSION_MISMATCH
  const reqCross = createMockReq({ method: 'GET', url: '/api/mbo/d3/transaction/status/NONCE_OWNED_BY_A' });
  const resCross = createMockRes();
  await handler(reqCross, resCross, {
    url: new URL('http://localhost/api/mbo/d3/transaction/status/NONCE_OWNED_BY_A'),
    token: 'VALID_SESSION_B'
  });
  assert.equal(resCross.getStatusCode(), 403);
  assert.equal(resCross.getBody().status, 'STATUS_NONCE_SESSION_MISMATCH');

  // 7. Same session lookup: Session A looks up its own nonce -> 200 OK
  const reqOwner = createMockReq({ method: 'GET', url: '/api/mbo/d3/transaction/status/NONCE_OWNED_BY_A' });
  const resOwner = createMockRes();
  await handler(reqOwner, resOwner, {
    url: new URL('http://localhost/api/mbo/d3/transaction/status/NONCE_OWNED_BY_A'),
    token: 'VALID_SESSION_A'
  });
  assert.equal(resOwner.getStatusCode(), 200);
  assert.equal(resOwner.getBody().status, 'OK');
  assert.equal(resOwner.getBody().nonceStatus, 'UNCONSUMED');
  assert.ok(resOwner.getBody().issuedAt);
  assert.ok(resOwner.getBody().expiresAt);

  // Sanitization check: response must never contain sensitive fields
  const rawBody = resOwner.getRawBody();
  assert.ok(!rawBody.includes(bindingA));
  assert.ok(!rawBody.includes('EMP001'));
  assert.ok(!rawBody.includes('user01'));
  assert.ok(!rawBody.includes('accessToken'));
  assert.ok(!rawBody.includes('refreshToken'));
});

test('D3OAuthAttestationHandler: Corrective 4 - sanitizes body errors and never exposes raw error messages', async () => {
  const handler = createD3OAuthAttestationHandler({
    authService: mockAuthService,
    transitionService: { executeTrustedTransition: async () => {} }
  });

  // 1. Unsupported content type
  const reqWrongType = createMockReq({
    method: 'POST',
    url: '/api/mbo/d3/transaction/prepare-transition',
    headers: { 'content-type': 'text/plain' },
    body: { recordId: 100 }
  });
  const resWrongType = createMockRes();
  await handler(reqWrongType, resWrongType, {
    url: new URL('http://localhost/api/mbo/d3/transaction/prepare-transition'),
    token: 'VALID_SESSION_A'
  });
  assert.equal(resWrongType.getStatusCode(), 400);
  assert.equal(resWrongType.getBody().status, 'UNSUPPORTED_CONTENT_TYPE');

  // 2. Malformed JSON body
  const reqMalformed = {
    method: 'POST',
    url: '/api/mbo/d3/transaction/prepare-transition',
    headers: { 'content-type': 'application/json' },
    async *[Symbol.asyncIterator]() {
      yield Buffer.from('{"invalid json: true');
    }
  };
  const resMalformed = createMockRes();
  await handler(reqMalformed, resMalformed, {
    url: new URL('http://localhost/api/mbo/d3/transaction/prepare-transition'),
    token: 'VALID_SESSION_A'
  });
  assert.equal(resMalformed.getStatusCode(), 400);
  assert.equal(resMalformed.getBody().status, 'INVALID_JSON_BODY');

  // 3. Body too large (> 64KB)
  const reqLarge = {
    method: 'POST',
    url: '/api/mbo/d3/transaction/prepare-transition',
    headers: { 'content-type': 'application/json' },
    async *[Symbol.asyncIterator]() {
      yield Buffer.alloc(70000, 97);
    }
  };
  const resLarge = createMockRes();
  await handler(reqLarge, resLarge, {
    url: new URL('http://localhost/api/mbo/d3/transaction/prepare-transition'),
    token: 'VALID_SESSION_A'
  });
  assert.equal(resLarge.getStatusCode(), 400);
  assert.equal(resLarge.getBody().status, 'BODY_TOO_LARGE');

  // 4. Unexpected stream/parser error
  const reqStreamErr = {
    method: 'POST',
    url: '/api/mbo/d3/transaction/prepare-transition',
    headers: { 'content-type': 'application/json' },
    async *[Symbol.asyncIterator]() {
      throw new Error('CATASTROPHIC_DISK_OR_NETWORK_FAILURE_SECRET_PATH_C:/private');
    }
  };
  const resStreamErr = createMockRes();
  await handler(reqStreamErr, resStreamErr, {
    url: new URL('http://localhost/api/mbo/d3/transaction/prepare-transition'),
    token: 'VALID_SESSION_A'
  });
  assert.equal(resStreamErr.getStatusCode(), 400);
  assert.equal(resStreamErr.getBody().status, 'INVALID_BODY');
  assert.ok(!resStreamErr.getRawBody().includes('CATASTROPHIC_DISK_OR_NETWORK_FAILURE_SECRET_PATH_C:/private'));
});
