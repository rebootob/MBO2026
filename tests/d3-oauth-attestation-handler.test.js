import test from 'node:test';
import assert from 'node:assert/strict';
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

test('D3OAuthAttestationHandler: rejects unconfigured OAuth client on authorize', async () => {
  const handler = createD3OAuthAttestationHandler({});
  const req = createMockReq({ method: 'GET', url: '/api/mbo/d3/oauth/authorize' });
  const res = createMockRes();

  await handler(req, res, { url: new URL('http://localhost/api/mbo/d3/oauth/authorize') });
  assert.equal(res.getStatusCode(), 500);
  assert.equal(res.getBody().status, 'DEPENDENCY_MISSING');
});

test('D3OAuthAttestationHandler: prepares transition nonce and returns unconsumed nonce and payload', async () => {
  const mockTransitionService = {
    executeTrustedTransition: async () => ({
      status: 'SUCCESS',
      recordId: 100,
      targetStage: 'MIDYEAR',
      previousStatus: '05 Objective Approved',
      newStatus: '06 Employee Mid-Year',
      nonce: 'NONCE_TEST_1234'
    })
  };

  const handler = createD3OAuthAttestationHandler({
    transitionService: mockTransitionService,
    config: { attestationAppId: '799' }
  });

  const req = createMockReq({
    method: 'POST',
    url: '/api/mbo/d3/transaction/prepare-transition',
    headers: { 'content-type': 'application/json' },
    body: {
      recordId: 100,
      intendedAction: 'Start Mid-Year',
      userCode: 'EMP001'
    }
  });
  const res = createMockRes();
  await handler(req, res, { url: new URL('http://localhost/api/mbo/d3/transaction/prepare-transition') });
  assert.equal(res.getStatusCode(), 200, `Handler failed with ${res.getStatusCode()}: ${res.getRawBody()}`);
  assert.equal(res.getBody().status, 'SUCCESS');
  assert.equal(res.getBody().recordId, 100);
  assert.equal(res.getBody().targetStage, 'MIDYEAR');
});
