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
      return { status: 'ACTIVE', employeeCode: 'EMP_A', role: 'EMPLOYEE' };
    }
    if (token === 'VALID_SESSION_B') {
      return { status: 'ACTIVE', employeeCode: 'EMP_B', role: 'EMPLOYEE' };
    }
    if (token === 'EXPIRED_SESSION') {
      return { status: 'EXPIRED', employeeCode: 'EMP_EXPIRED' };
    }
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

  // Expired session
  const reqExp = createMockReq({ method: 'GET', url: '/api/mbo/d3/oauth/authorize' });
  const resExp = createMockRes();
  await handler(reqExp, resExp, {
    url: new URL('http://localhost/api/mbo/d3/oauth/authorize'),
    token: 'EXPIRED_SESSION'
  });
  assert.equal(resExp.getStatusCode(), 401);
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
  assert.ok(!storedGrants.has('EMP_A'));
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
