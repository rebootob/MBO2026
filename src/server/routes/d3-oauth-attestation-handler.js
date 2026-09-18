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
 * - Strict request key allowlists (recordId, intendedAction ONLY for prepare-transition)
 * - Zero secret logging / serialization
 * - Session binding derived server-side via authService.getAuthenticatedPrincipal
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
  const keys = Object.keys(body);
  return keys.length === allowed.length && keys.every(k => allowed.includes(k));
}

function deriveSessionBinding(sessionToken) {
  return crypto.createHash('sha256').update(String(sessionToken)).digest('hex');
}

export function createD3OAuthAttestationHandler({
  config = {},
  tokenStore,
  oauthClient,
  transitionService,
  attestationVerifier,
  authService
} = {}) {
  // Ephemeral state tracker for OAuth state validation: Map<state, { createdAt, sessionBinding }>
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

  async function resolveAuthenticatedBinding(req, context) {
    const rawToken = context?.token || (req.headers.authorization ? req.headers.authorization.replace(/^Bearer\s+/i, '') : null);
    if (!rawToken || !authService) {
      return { ok: false, status: 'UNAUTHORIZED', code: 401 };
    }

    try {
      const principal = await authService.getAuthenticatedPrincipal(rawToken);
      if (!principal || principal.status !== 'ACTIVE' || !principal.employeeCode) {
        return { ok: false, status: 'UNAUTHORIZED', code: 401 };
      }
      const sessionBinding = deriveSessionBinding(rawToken);
      return { ok: true, sessionBinding, principal };
    } catch {
      return { ok: false, status: 'UNAUTHORIZED', code: 401 };
    }
  }

  return async function handleD3Request(req, res, context = {}) {
    const url = context.url || new URL(req.url, 'http://localhost');
    const pathname = url.pathname;
    cleanupStaleStates();

    // 1. GET /api/mbo/d3/oauth/authorize
    if (req.method === 'GET' && pathname === '/api/mbo/d3/oauth/authorize') {
      if (!oauthClient) {
        return sendJson(res, 500, { status: 'DEPENDENCY_MISSING' });
      }

      const authSession = await resolveAuthenticatedBinding(req, context);
      if (!authSession.ok) {
        return sendJson(res, authSession.code, { status: authSession.status });
      }

      // Generate cryptographically random state parameter bound to sessionBinding
      const state = crypto.randomBytes(24).toString('hex');
      stateStore.set(state, {
        createdAt: Date.now(),
        sessionBinding: authSession.sessionBinding
      });

      // PROVEN_UNSUPPORTED: Never generate PKCE code_challenge or code_verifier
      // EXACT SCOPES: k:app_record:read k:app_record:write
      const authorizeUrl = oauthClient.getAuthorizationUrl({
        state,
        responseType: 'code',
        scope: 'k:app_record:read k:app_record:write'
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
        return sendJson(res, 500, { status: 'DEPENDENCY_MISSING' });
      }

      const authSession = await resolveAuthenticatedBinding(req, context);
      if (!authSession.ok) {
        return sendJson(res, authSession.code, { status: authSession.status });
      }

      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');

      if (!code || !state) {
        return sendJson(res, 400, { status: 'INVALID_CALLBACK' });
      }

      const stateEntry = stateStore.get(state);
      if (!stateEntry) {
        return sendJson(res, 403, { status: 'STATE_INVALID' });
      }

      if (stateEntry.sessionBinding !== authSession.sessionBinding) {
        stateStore.delete(state);
        return sendJson(res, 403, { status: 'OAUTH_STATE_SESSION_MISMATCH' });
      }

      stateStore.delete(state); // Single-use state

      try {
        // Confidential server-side authorization code exchange
        const grant = await oauthClient.exchangeCode({ code });
        if (!grant || !grant.accessToken) {
          return sendJson(res, 502, { status: 'OAUTH_EXCHANGE_FAILED' });
        }

        // Store grant under sessionBinding
        await tokenStore.storeGrant(authSession.sessionBinding, grant);

        // Security Contract:
        // Return NO user identity claim derived from token response
        // Return NO access_token, NO refresh_token, NO client_secret, NO raw provider payload
        return sendJson(res, 200, {
          status: 'OAUTH_SUCCESS'
        });
      } catch {
        // Never log or return raw provider secret details or internal err.message
        return sendJson(res, 500, { status: 'OAUTH_EXCHANGE_ERROR' });
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
        return sendJson(res, 500, { status: 'DEPENDENCY_MISSING' });
      }

      const authSession = await resolveAuthenticatedBinding(req, context);
      if (!authSession.ok) {
        return sendJson(res, authSession.code, { status: authSession.status });
      }

      let body;
      try {
        body = await readJsonBody(req);
      } catch (err) {
        return sendJson(res, 400, { status: err.message || 'INVALID_BODY' });
      }

      // Browser request body must allow EXACTLY: recordId, intendedAction
      // Reject: userCode, employeeCode, actor, accessToken, refreshToken, grantId, etc.
      if (!exactKeys(body, ['recordId', 'intendedAction'])) {
        return sendJson(res, 400, { status: 'UNAUTHORIZED_PAYLOAD_KEYS' });
      }

      const { recordId, intendedAction } = body;
      if (!recordId || !intendedAction) {
        return sendJson(res, 400, { status: 'MISSING_REQUIRED_FIELDS' });
      }

      try {
        const result = await transitionService.executeTrustedTransition({
          recordId,
          intendedAction,
          sessionBinding: authSession.sessionBinding
        });

        // Safe response: zero tokens/secrets, sanitized status/error codes
        return sendJson(res, 200, {
          status: result.status,
          recordId: result.recordId,
          targetStage: result.targetStage,
          previousStatus: result.previousStatus,
          newStatus: result.newStatus
        });
      } catch (err) {
        const statusCode = err.name === 'D3TransitionError' ? 400 : 500;
        // Never expose err.message, stack, raw provider payload, tokens, or internal secrets to browser
        return sendJson(res, statusCode, {
          status: err.code || 'TRANSITION_ERROR'
        });
      }
    }

    // 4. GET /api/mbo/d3/transaction/status/:nonce
    const statusMatch = pathname.match(/^\/api\/mbo\/d3\/transaction\/status\/([^/]+)$/);
    if (req.method === 'GET' && statusMatch) {
      const nonce = decodeURIComponent(statusMatch[1]);
      if (!attestationVerifier) {
        return sendJson(res, 500, { status: 'DEPENDENCY_MISSING' });
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
