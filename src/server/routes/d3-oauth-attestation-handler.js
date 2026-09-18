import crypto from 'node:crypto';

/**
 * Native node:http route handler for D3 OAuth & Attestation endpoints.
 *
 * Endpoints:
 * - GET  /api/mbo/d3/oauth/authorize
 * - GET  /api/mbo/d3/oauth/callback
 * - POST /api/mbo/d3/transaction/prepare-transition
 * - GET  /api/mbo/d3/transaction/status/:nonce
 *
 * Strictly adheres to:
 * - OAUTH_CLIENT_TYPE = CONFIDENTIAL_CLIENT
 * - OAUTH_GRANT_TYPE = AUTHORIZATION_CODE
 * - PKCE_SUPPORT = PROVEN_UNSUPPORTED (zero PKCE code_challenge / code_verifier)
 * - Browser receives NO tokens (zero access_token / refresh_token exposure)
 * - Strict request key allowlists
 * - Zero secret logging / serialization
 */

const MAX_BODY_BYTES = 16 * 1024;

function sendJson(res, status, body, headers = {}) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...(res.corsHeaders || {}),
    ...headers
  });
  res.end(JSON.stringify(body));
}

async function readJsonBody(req) {
  if (req.headers['content-type']?.split(';')[0] !== 'application/json') {
    throw new Error('UNSUPPORTED_CONTENT_TYPE');
  }
  let bytes = 0;
  let raw = '';
  for await (const chunk of req) {
    bytes += chunk.length;
    if (bytes > MAX_BODY_BYTES) throw new Error('BODY_TOO_LARGE');
    raw += chunk;
  }
  try {
    const value = JSON.parse(raw);
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error();
    return value;
  } catch {
    throw new Error('INVALID_JSON_BODY');
  }
}

function exactKeys(body, allowed) {
  return Object.keys(body).every(k => allowed.includes(k));
}

export function createD3OAuthAttestationHandler({
  config = {},
  tokenStore,
  oauthClient,
  transitionService,
  attestationVerifier,
  authService
} = {}) {
  // Ephemeral state tracker for OAuth state validation: Map<state, { createdAt, userCode }>
  const stateStore = new Map();
  const STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes

  function cleanupStaleStates() {
    const now = Date.now();
    for (const [state, entry] of stateStore.entries()) {
      if (now - entry.createdAt > STATE_TTL_MS) {
        stateStore.delete(state);
      }
    }
  }

  return async function handleD3Request(req, res, context = {}) {
    const url = context.url || new URL(req.url, 'http://localhost');
    const pathname = url.pathname;
    cleanupStaleStates();

    // 1. GET /api/mbo/d3/oauth/authorize
    if (req.method === 'GET' && pathname === '/api/mbo/d3/oauth/authorize') {
      if (!oauthClient) {
        return sendJson(res, 500, { status: 'DEPENDENCY_MISSING', error: 'OAuth client not configured' });
      }

      // Generate cryptographically random state parameter
      const state = crypto.randomBytes(24).toString('hex');
      const userCode = url.searchParams.get('userCode') || 'current';
      stateStore.set(state, { createdAt: Date.now(), userCode });

      // PROVEN_UNSUPPORTED: Never generate PKCE code_challenge or code_verifier
      const authorizeUrl = oauthClient.getAuthorizationUrl({
        state,
        responseType: 'code',
        scope: 'kintone:record:read kintone:record:write'
      });

      return sendJson(res, 200, {
        status: 'OK',
        authorizationUrl: authorizeUrl,
        state
      });
    }

    // 2. GET /api/mbo/d3/oauth/callback
    if (req.method === 'GET' && pathname === '/api/mbo/d3/oauth/callback') {
      if (!oauthClient || !tokenStore) {
        return sendJson(res, 500, { status: 'DEPENDENCY_MISSING', error: 'OAuth dependencies not configured' });
      }

      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');

      if (!code || !state) {
        return sendJson(res, 400, { status: 'INVALID_CALLBACK', error: 'Missing code or state parameter' });
      }

      const stateEntry = stateStore.get(state);
      if (!stateEntry) {
        return sendJson(res, 403, { status: 'STATE_INVALID', error: 'Invalid or expired OAuth state' });
      }
      stateStore.delete(state); // Single-use state

      try {
        // Confidential server-side authorization code exchange
        const grant = await oauthClient.exchangeCode({ code });
        if (!grant || !grant.accessToken) {
          return sendJson(res, 502, { status: 'OAUTH_EXCHANGE_FAILED' });
        }

        const userCode = grant.userCode || stateEntry.userCode;
        await tokenStore.storeGrant(userCode, grant);

        // Security Contract: Never return tokens or secrets to browser
        return sendJson(res, 200, {
          status: 'OAUTH_SUCCESS',
          userCode
        });
      } catch (err) {
        // Never log or return raw provider secret details
        return sendJson(res, 500, { status: 'OAUTH_EXCHANGE_ERROR', message: err.message });
      }
    }

    // 3. POST /api/mbo/d3/transaction/prepare-transition
    if (req.method === 'POST' && pathname === '/api/mbo/d3/transaction/prepare-transition') {
      // Check origin
      const origin = req.headers.origin;
      if (config.allowedOrigin && origin !== config.allowedOrigin) {
        return sendJson(res, 403, { status: 'ORIGIN_DENIED' });
      }

      if (!transitionService) {
        return sendJson(res, 500, { status: 'DEPENDENCY_MISSING', error: 'Transition service not configured' });
      }

      let body;
      try {
        body = await readJsonBody(req);
      } catch (err) {
        return sendJson(res, 400, { status: err.message || 'INVALID_BODY' });
      }

      // Strict request key allowlist: browser cannot inject arbitrary tokens or grants
      if (!exactKeys(body, ['recordId', 'intendedAction', 'userCode'])) {
        return sendJson(res, 400, { status: 'UNAUTHORIZED_PAYLOAD_KEYS' });
      }

      const { recordId, intendedAction, userCode } = body;
      if (!recordId || !intendedAction || !userCode) {
        return sendJson(res, 400, { status: 'MISSING_REQUIRED_FIELDS' });
      }

      try {
        const result = await transitionService.executeTrustedTransition({
          recordId,
          intendedAction,
          userCode
        });

        // Safe response: zero tokens/secrets
        return sendJson(res, 200, {
          status: result.status,
          recordId: result.recordId,
          targetStage: result.targetStage,
          previousStatus: result.previousStatus,
          newStatus: result.newStatus
        });
      } catch (err) {
        const statusCode = err.name === 'D3TransitionError' ? 400 : 500;
        return sendJson(res, statusCode, {
          status: err.code || 'TRANSITION_ERROR',
          message: err.message,
          ...(err.details || {})
        });
      }
    }

    // 4. GET /api/mbo/d3/transaction/status/:nonce
    const statusMatch = pathname.match(/^\/api\/mbo\/d3\/transaction\/status\/([^/]+)$/);
    if (req.method === 'GET' && statusMatch) {
      const nonce = decodeURIComponent(statusMatch[1]);
      if (!attestationVerifier) {
        return sendJson(res, 500, { status: 'DEPENDENCY_MISSING', error: 'Attestation verifier not configured' });
      }

      const entry = attestationVerifier.nonceStore?.get(nonce);
      if (!entry) {
        return sendJson(res, 404, { status: 'NONCE_NOT_FOUND' });
      }

      return sendJson(res, 200, {
        status: 'OK',
        nonceStatus: entry.status,
        issuedAt: new Date(entry.issuedAt).toISOString(),
        expiresAt: new Date(entry.expiresAt).toISOString()
      });
    }

    // Not handled by D3 handler
    return false;
  };
}
