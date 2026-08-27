import test from 'node:test';
import assert from 'node:assert/strict';
import { createMboGatewayServer, parseGatewayConfig } from '../src/server/mbo-gateway-server.js';

const config = { production: false, allowedOrigin: 'http://localhost:5173', cookieSecure: false, cookieSameSite: 'Lax', outerSharedKintonePrincipal: 'shared-server-principal' };

async function withServer(overrides, fn) {
  const calls = { login: [], logout: [], bootstrap: [], history: [], record: [] };
  const authService = {
    async login(v) { calls.login.push(v); return overrides.loginResult || { status: 'AUTHENTICATED_SUCCESS', sessionToken: 'opaque-0118', employeeCode: '0118' }; },
    async changePassword(v) { calls.change = v; return { status: 'PASSWORD_CHANGED_SUCCESS', sessionToken: 'opaque-new' }; },
    async logout(v) { calls.logout.push(v); return { status: 'LOGGED_OUT' }; }
  };
  const employeeSelfGateway = {
    async getEmployeeSelfBootstrap(v) { calls.bootstrap.push(v); return overrides.bootstrapResult || { status: 'SUCCESS', employeeCode: '0118' }; },
    async listOwnMboHistory(v) { calls.history.push(v); return { status: 'SUCCESS', records: [] }; },
    async getOwnMboRecord(v) { calls.record.push(v); return v.recordId === '0119' ? { status: 'RECORD_NOT_FOUND' } : v.recordId.includes('"') ? { status: 'INVALID_ARGUMENT' } : { status: 'SUCCESS', record: { Employee_Code: { value: '0118' } } }; }
  };
  const server = createMboGatewayServer({ config, authService, employeeSelfGateway });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try { await fn(`http://127.0.0.1:${server.address().port}`, calls); } finally { await new Promise(resolve => server.close(resolve)); }
}
async function request(base, path, options = {}) {
  const response = await fetch(base + path, options); return { status: response.status, body: await response.json(), cookie: response.headers.get('set-cookie') };
}

test('gateway login uses only configured shared principal and returns opaque HttpOnly cookie', async () => {
  await withServer({}, async (base, calls) => {
    const r = await request(base, '/api/mbo/login', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: config.allowedOrigin }, body: JSON.stringify({ username: '0118', password: 'pw', kintoneUserCode: 'attacker' }) });
    assert.equal(r.status, 400); assert.equal(calls.login.length, 0);
    const ok = await request(base, '/api/mbo/login', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: config.allowedOrigin }, body: JSON.stringify({ username: '0118', password: 'pw' }) });
    assert.equal(ok.body.status, 'AUTHENTICATED_SUCCESS'); assert.match(ok.cookie, /HttpOnly/); assert.match(ok.cookie, /Path=\//); assert.match(ok.cookie, /SameSite=Lax/); assert.equal(calls.login[0].kintoneUserCode, 'shared-server-principal'); assert.equal(JSON.stringify(ok.body).includes('opaque-0118'), false);
  });
});

test('force-change login remains restricted and does not expose hashes or raw token', async () => {
  await withServer({ loginResult: { status: 'PASSWORD_CHANGE_REQUIRED', sessionToken: 'restricted-token', requiresPasswordChange: true } }, async (base) => {
    const r = await request(base, '/api/mbo/login', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: config.allowedOrigin }, body: JSON.stringify({ username: '0118', password: '0118' }) });
    assert.equal(r.body.status, 'PASSWORD_CHANGE_REQUIRED'); assert.equal(r.body.requiresPasswordChange, true); assert.equal(JSON.stringify(r.body).match(/Password_Hash|Activation_Code_Hash|Session_Token_Hash|restricted-token/), null);
  });
});

test('data routes use only the opaque cookie and keep 0118 from reading 0119', async () => {
  await withServer({}, async (base, calls) => {
    const cookie = 'mbo_session=opaque-0118';
    const bootstrap = await request(base, '/api/mbo/bootstrap?fiscalYear=FY2026&employeeCode=0119', { headers: { Cookie: cookie } });
    assert.equal(bootstrap.body.status, 'SUCCESS'); assert.equal(calls.bootstrap[0].sessionToken, 'opaque-0118'); assert.equal(calls.bootstrap[0].fiscalYear, 'FY2026');
    const denied = await request(base, '/api/mbo/records/0119', { headers: { Cookie: cookie } });
    assert.equal(denied.body.status, 'RECORD_NOT_FOUND'); assert.equal(calls.record[0].sessionToken, 'opaque-0118');
  });
});

test('malformed HTTP input and technical-admin/invalid session responses remain denied', async () => {
  await withServer({ bootstrapResult: { status: 'UNAUTHORIZED_PRINCIPAL' } }, async (base, calls) => {
    const bad = await request(base, '/api/mbo/records/1%22%20or%20%24id%3E0', { headers: { Cookie: 'mbo_session=bad' } });
    assert.equal(bad.body.status, 'INVALID_ARGUMENT');
    const admin = await request(base, '/api/mbo/bootstrap', { headers: { Cookie: 'mbo_session=admin' } });
    assert.equal(admin.body.status, 'UNAUTHORIZED_PRINCIPAL'); assert.equal(calls.bootstrap.length, 1);
  });
});

test('change-password rotates cookie and logout invalidates it', async () => {
  await withServer({}, async (base, calls) => {
    const changed = await request(base, '/api/mbo/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: config.allowedOrigin, Cookie: 'mbo_session=restricted' }, body: JSON.stringify({ newPassword: 'new-password' }) });
    assert.equal(changed.body.status, 'PASSWORD_CHANGED_SUCCESS'); assert.equal(calls.change.sessionToken, 'restricted'); assert.match(changed.cookie, /HttpOnly/);
    const logout = await request(base, '/api/mbo/logout', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: config.allowedOrigin, Cookie: 'mbo_session=opaque-0118' }, body: '{}' });
    assert.equal(logout.body.status, 'LOGGED_OUT'); assert.equal(calls.logout[0], 'opaque-0118'); assert.match(logout.cookie, /Max-Age=0/);
  });
});

test('production configuration fails closed without required origin/cookie/server secrets', () => {
  assert.throws(() => parseGatewayConfig({ NODE_ENV: 'production', PORT: '3000', MBO_OUTER_SHARED_KINTONE_PRINCIPAL: 'shared', KINTONE_BASE_URL: 'https://k.example', KINTONE_SERVER_CREDENTIAL: 'secret', MBO_COOKIE_SAMESITE: 'Lax', MBO_COOKIE_SECURE: 'false' }), /GATEWAY_CONFIG_PRODUCTION_COOKIE_ORIGIN_REQUIRED/);
  assert.throws(() => parseGatewayConfig({ NODE_ENV: 'production', PORT: '3000', MBO_ALLOWED_ORIGIN: 'https://app.example', MBO_COOKIE_SECURE: 'true', MBO_COOKIE_SAMESITE: 'None', MBO_OUTER_SHARED_KINTONE_PRINCIPAL: 'shared', KINTONE_BASE_URL: 'https://k.example', KINTONE_SERVER_CREDENTIAL: 'secret' }), /GATEWAY_CONFIG_INVALID_COOKIE_SAMESITE/);
});
