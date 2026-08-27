import http from 'node:http';
import { MboAuthSessionService } from '../services/mbo-auth-session-service.js';
import { MboKintoneAuthRepository } from '../services/mbo-auth-kintone-repository.js';
import { MboEmployeeSelfGateway } from '../services/mbo-employee-self-gateway.js';

const COOKIE_NAME = 'mbo_session';
const MAX_BODY_BYTES = 16 * 1024;

export function parseGatewayConfig(env = process.env) {
  const production = env.NODE_ENV === 'production';
  const config = {
    production,
    port: Number(env.PORT || 3000),
    allowedOrigin: env.MBO_ALLOWED_ORIGIN || '',
    cookieSecure: env.MBO_COOKIE_SECURE === 'true',
    cookieSameSite: env.MBO_COOKIE_SAMESITE || '',
    outerSharedKintonePrincipal: env.MBO_OUTER_SHARED_KINTONE_PRINCIPAL || '',
    kintoneBaseUrl: (env.KINTONE_BASE_URL || '').replace(/\/$/, ''),
    kintoneServerCredential: env.KINTONE_SERVER_CREDENTIAL || '',
    app801Id: Number(env.KINTONE_APP801_ID || 801),
    app794Id: Number(env.KINTONE_APP794_ID || 794),
    app53Id: Number(env.KINTONE_APP53_ID || 53)
  };
  if (!Number.isSafeInteger(config.port) || config.port < 1 || config.port > 65535) throw new Error('GATEWAY_CONFIG_INVALID_PORT');
  if (![config.app801Id, config.app794Id, config.app53Id].every(id => Number.isSafeInteger(id) && id > 0)) throw new Error('GATEWAY_CONFIG_INVALID_APP_ID');
  if (!config.outerSharedKintonePrincipal || !config.kintoneBaseUrl || !config.kintoneServerCredential) throw new Error('GATEWAY_CONFIG_MISSING_SERVER_SECRET_OR_KINTONE_SETTINGS');
  if (!['Lax', 'Strict'].includes(config.cookieSameSite)) throw new Error('GATEWAY_CONFIG_INVALID_COOKIE_SAMESITE');
  if (production && (!config.allowedOrigin || !config.cookieSecure)) throw new Error('GATEWAY_CONFIG_PRODUCTION_COOKIE_ORIGIN_REQUIRED');
  return config;
}

function cookies(header = '') { return Object.fromEntries(header.split(';').map(v => v.trim().split('=').map(decodeURIComponent)).filter(v => v.length === 2)); }
function sessionCookie(token, config, expired = false) {
  return `${COOKIE_NAME}=${encodeURIComponent(expired ? '' : token)}; HttpOnly; Path=/; SameSite=${config.cookieSameSite};${config.cookieSecure ? ' Secure;' : ''}${expired ? ' Max-Age=0;' : ''}`;
}
function send(res, status, body, cookie) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...(cookie ? { 'Set-Cookie': cookie } : {}) });
  res.end(JSON.stringify(body));
}
async function readJson(req) {
  if (req.headers['content-type']?.split(';')[0] !== 'application/json') throw new Error('UNSUPPORTED_CONTENT_TYPE');
  let bytes = 0; let raw = '';
  for await (const chunk of req) { bytes += chunk.length; if (bytes > MAX_BODY_BYTES) throw new Error('BODY_TOO_LARGE'); raw += chunk; }
  try { const value = JSON.parse(raw); if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(); return value; } catch { throw new Error('INVALID_JSON_BODY'); }
}
function stateChangingAllowed(req, config) {
  const origin = req.headers.origin;
  return !config.allowedOrigin || origin === config.allowedOrigin;
}
function exactKeys(body, allowed) { return Object.keys(body).every(k => allowed.includes(k)); }

export function createMboGatewayServer({ config, authService, employeeSelfGateway }) {
  if (!config || !authService || !employeeSelfGateway) throw new Error('GATEWAY_DEPENDENCY_INCOMPLETE');
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      const token = cookies(req.headers.cookie)[COOKIE_NAME];
      if (req.method === 'GET' && url.pathname === '/health') return send(res, 200, { status: 'OK' });
      if (['POST'].includes(req.method) && !stateChangingAllowed(req, config)) return send(res, 403, { status: 'ORIGIN_DENIED' });
      if (req.method === 'POST' && url.pathname === '/api/mbo/login') {
        const body = await readJson(req);
        if (!exactKeys(body, ['username', 'password', 'activationCode']) || typeof body.username !== 'string' || typeof body.password !== 'string') return send(res, 400, { status: 'INVALID_LOGIN_REQUEST' });
        const result = await authService.login({ kintoneUserCode: config.outerSharedKintonePrincipal, mboUsername: body.username, password: body.password, activationCode: body.activationCode, identityMode: 'SHARED_KINTONE_SECONDARY_AUTH' });
        const tokenOut = result.sessionToken;
        const bodyOut = { status: result.status, requiresPasswordChange: result.requiresPasswordChange === true };
        return send(res, result.status === 'AUTHENTICATED_SUCCESS' || result.status === 'PASSWORD_CHANGE_REQUIRED' ? 200 : 401, bodyOut, tokenOut ? sessionCookie(tokenOut, config) : undefined);
      }
      if (req.method === 'POST' && url.pathname === '/api/mbo/change-password') {
        const body = await readJson(req);
        if (!token || !exactKeys(body, ['currentPassword', 'newPassword']) || typeof body.newPassword !== 'string') return send(res, 400, { status: 'INVALID_PASSWORD_CHANGE_REQUEST' });
        const result = await authService.changePassword({ sessionToken: token, currentPassword: body.currentPassword, newPassword: body.newPassword });
        return send(res, 200, { status: result.status }, sessionCookie(result.sessionToken, config));
      }
      if (req.method === 'POST' && url.pathname === '/api/mbo/logout') {
        await authService.logout(token); return send(res, 200, { status: 'LOGGED_OUT' }, sessionCookie('', config, true));
      }
      if (req.method === 'GET' && url.pathname === '/api/mbo/bootstrap') return send(res, 200, await employeeSelfGateway.getEmployeeSelfBootstrap({ sessionToken: token, fiscalYear: url.searchParams.get('fiscalYear') ?? undefined }));
      if (req.method === 'GET' && url.pathname === '/api/mbo/history') return send(res, 200, await employeeSelfGateway.listOwnMboHistory({ sessionToken: token }));
      const recordMatch = url.pathname.match(/^\/api\/mbo\/records\/([^/]+)$/);
      if (req.method === 'GET' && recordMatch) return send(res, 200, await employeeSelfGateway.getOwnMboRecord({ sessionToken: token, recordId: decodeURIComponent(recordMatch[1]) }));
      return send(res, 404, { status: 'NOT_FOUND' });
    } catch (error) {
      const status = error.message === 'UNSUPPORTED_CONTENT_TYPE' || error.message === 'INVALID_JSON_BODY' || error.message === 'BODY_TOO_LARGE' ? 400 : 500;
      return send(res, status, { status: status === 400 ? error.message : 'GATEWAY_ERROR' });
    }
  });
}

export function createRuntimeFromEnvironment(env = process.env) {
  const config = parseGatewayConfig(env);
  const headers = { 'X-Cybozu-API-Token': config.kintoneServerCredential };
  const repository = new MboKintoneAuthRepository({ appId: config.app801Id, baseUrl: config.kintoneBaseUrl, headers });
  const authService = new MboAuthSessionService({ credentialStore: repository, sessionStore: repository, activationStore: repository, identityMode: 'SHARED_KINTONE_SECONDARY_AUTH' });
  const employeeSelfGateway = new MboEmployeeSelfGateway({ authService, app53Id: config.app53Id, app794Id: config.app794Id, baseUrl: config.kintoneBaseUrl, headers });
  return { config, server: createMboGatewayServer({ config, authService, employeeSelfGateway }) };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { config, server } = createRuntimeFromEnvironment();
  server.listen(config.port, () => console.log(`MBO trusted gateway listening on port ${config.port}`));
}
