import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { MboAuthSessionService } from '../src/services/mbo-auth-session-service.js';
import { MboPasswordDomainService } from '../src/services/mbo-password-service.js';
import { MboIdentityService } from '../src/services/mbo-identity-service.js';

const PORT = process.env.PORT || 3000;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json'
};

const srcDir = path.resolve('src');
const previewDir = path.resolve('preview');
const distDir = path.resolve('dist');

// --- In-Memory Stores & Auth Setup for Local UAT Preview ---
class MemoryCredentialStore {
  constructor(initialData = {}) {
    this.credentials = new Map(Object.entries(initialData));
  }
  async getCredential(empCode) {
    const cred = this.credentials.get(empCode);
    return cred ? JSON.parse(JSON.stringify(cred)) : null;
  }
  async updateCredential(empCode, patch) {
    const existing = this.credentials.get(empCode) || { Employee_Code: empCode };
    const updated = { ...existing, ...patch };
    this.credentials.set(empCode, updated);
    return updated;
  }
}

class MemorySessionStore {
  constructor() {
    this.sessions = new Map();
  }
  async getSession(tokenHash) {
    const sess = this.sessions.get(tokenHash);
    return sess ? JSON.parse(JSON.stringify(sess)) : null;
  }
  async setSession(tokenHash, sessionObj) {
    this.sessions.set(tokenHash, JSON.parse(JSON.stringify(sessionObj)));
  }
  async deleteSession(tokenHash) {
    this.sessions.delete(tokenHash);
  }
}

const userMappings = [
  { Kintone_User_Code: 'emp0118', Employee_Code: '0118', Account_Status: 'ACTIVE' },
  { Kintone_User_Code: 'emp0119', Employee_Code: '0119', Account_Status: 'ACTIVE' },
  { Kintone_User_Code: 'admin-form', Employee_Code: 'ADMIN', Account_Status: 'ACTIVE' }
];

const initial0118 = MboPasswordDomainService.provisionInitialCredential({
  employeeCode: '0118',
  kintoneUserCode: 'emp0118'
});
const initial0119 = MboPasswordDomainService.provisionInitialCredential({
  employeeCode: '0119',
  kintoneUserCode: 'emp0119'
});

const credentialStore = new MemoryCredentialStore({
  '0118': initial0118,
  '0119': initial0119
});

const sessionStore = new MemorySessionStore();

const authService = new MboAuthSessionService({
  credentialStore,
  sessionStore,
  userMappings,
  passwordMaxAgeDays: 90,
  sessionDurationHours: 8
});

function parseCookies(req) {
  const list = {};
  const rc = req.headers.cookie;
  if (rc) {
    rc.split(';').forEach(cookie => {
      const parts = cookie.split('=');
      list[parts.shift().trim()] = decodeURIComponent(parts.join('='));
    });
  }
  return list;
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    let size = 0;
    req.on('data', chunk => {
      size += chunk.length;
      if (size > 8192) { // 8 KB limit
        reject(new Error('PAYLOAD_TOO_LARGE'));
      }
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error('INVALID_JSON'));
      }
    });
    req.on('error', err => reject(err));
  });
}

const server = http.createServer(async (req, res) => {
  let reqPath = req.url.split('?')[0];

  // --- API ROUTING FOR AUTHENTICATION PREVIEW ---
  if (reqPath.startsWith('/api/auth/')) {
    res.setHeader('Content-Type', 'application/json');

    try {
      if (req.method === 'POST' && reqPath === '/api/auth/login') {
        const body = await parseJsonBody(req);
        const { kintoneUserCode, mboUsername, password } = body;

        const result = await authService.login({ kintoneUserCode, mboUsername, password });

        if (result.sessionToken) {
          res.setHeader('Set-Cookie', `mbo_session_token=${result.sessionToken}; Path=/; HttpOnly; SameSite=Strict`);
        }

        // Sanitized response body — NO sessionToken, NO Password_Hash
        res.writeHead(200);
        res.end(JSON.stringify({
          status: result.status,
          employeeCode: result.employeeCode,
          requiresPasswordChange: result.requiresPasswordChange || false,
          reason: result.reason
        }));
        return;
      }

      if (req.method === 'GET' && reqPath === '/api/auth/me') {
        const cookies = parseCookies(req);
        const token = cookies.mbo_session_token || '';

        const principal = await authService.getAuthenticatedPrincipal(token);
        if (principal) {
          res.writeHead(200);
          res.end(JSON.stringify({
            authenticated: true,
            employeeCode: principal.employeeCode,
            kintoneUserCode: principal.kintoneUserCode
          }));
        } else {
          res.writeHead(200);
          res.end(JSON.stringify({ authenticated: false }));
        }
        return;
      }

      if (req.method === 'POST' && reqPath === '/api/auth/change-password') {
        const cookies = parseCookies(req);
        const token = cookies.mbo_session_token || '';
        const body = await parseJsonBody(req);
        const { currentPassword, newPassword } = body;

        try {
          const result = await authService.changePassword({
            sessionToken: token,
            currentPassword,
            newPassword
          });

          if (result.sessionToken) {
            res.setHeader('Set-Cookie', `mbo_session_token=${result.sessionToken}; Path=/; HttpOnly; SameSite=Strict`);
          }

          res.writeHead(200);
          res.end(JSON.stringify({
            status: result.status,
            employeeCode: result.employeeCode
          }));
        } catch (err) {
          res.writeHead(400);
          res.end(JSON.stringify({
            status: 'PASSWORD_CHANGE_FAILED',
            reason: err.message
          }));
        }
        return;
      }

      if (req.method === 'POST' && reqPath === '/api/auth/logout') {
        const cookies = parseCookies(req);
        const token = cookies.mbo_session_token || '';

        if (token) {
          try {
            await authService.logout(token);
          } catch (err) {
            res.writeHead(400);
            res.end(JSON.stringify({ status: 'LOGOUT_FAILED', reason: err.message }));
            return;
          }
        }

        res.setHeader('Set-Cookie', 'mbo_session_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict');
        res.writeHead(200);
        res.end(JSON.stringify({ status: 'LOGGED_OUT' }));
        return;
      }

      if (req.method === 'POST' && reqPath === '/api/auth/access-check') {
        const cookies = parseCookies(req);
        const token = cookies.mbo_session_token || '';

        const principal = await authService.getAuthenticatedPrincipal(token);
        if (!principal) {
          res.writeHead(401);
          res.end(JSON.stringify({
            authorized: false,
            code: 'UNAUTHENTICATED',
            reason: 'Session is invalid, expired, or password change required.'
          }));
          return;
        }

        const body = await parseJsonBody(req);
        const { targetEmployeeCode } = body;

        const authResult = MboIdentityService.authorizeEmployeeRecordAccess({
          authenticatedUser: principal,
          targetEmployeeCode,
          userRole: 'EMPLOYEE'
        });

        res.writeHead(200);
        res.end(JSON.stringify({
          authorized: authResult.authorized,
          code: authResult.code,
          reason: authResult.reason,
          targetEmployeeCode
        }));
        return;
      }

      res.writeHead(404);
      res.end(JSON.stringify({ error: '404 Endpoint Not Found' }));
      return;
    } catch (err) {
      res.writeHead(err.message === 'INVALID_JSON' || err.message === 'PAYLOAD_TOO_LARGE' ? 400 : 500);
      res.end(JSON.stringify({ error: err.message }));
      return;
    }
  }

  // --- STATIC FILE SERVING ---
  if (reqPath === '/') reqPath = '/index.html';

  let filePath = '';
  if (reqPath === '/index.html') {
    filePath = path.resolve('preview/index.html');
  } else if (reqPath === '/auth-preview.html') {
    filePath = path.resolve('preview/auth-preview.html');
  } else if (reqPath === '/mbo-employee.css') {
    filePath = path.resolve('dist/mbo-employee.css');
  } else if (reqPath === '/mbo-employee-app.js') {
    filePath = path.resolve('dist/mbo-employee-app.js');
  } else if (reqPath.startsWith('/src/')) {
    // Path containment guard for /src/ (R4 Bootstrap Repair)
    const relativeSubPath = reqPath.slice(5);
    filePath = path.resolve(srcDir, relativeSubPath);
    if (!filePath.startsWith(srcDir)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('403 Forbidden: Path traversal outside src/ restricted');
      return;
    }
  } else {
    const relativeSubPath = reqPath.startsWith('/') ? reqPath.slice(1) : reqPath;
    filePath = path.resolve(previewDir, relativeSubPath);
    if (!filePath.startsWith(previewDir) && !filePath.startsWith(distDir)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('403 Forbidden: Path traversal restricted');
      return;
    }
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`500 Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🧪 App794 Evaluation UI V2 - Status Preview Lab`);
  console.log(`   Status Preview Server: http://localhost:${PORT}`);
  console.log(`🔒 D1 Login & Session Boundary Local UAT Preview:`);
  console.log(`   http://localhost:${PORT}/auth-preview.html`);
  console.log(`   Press Ctrl+C to stop.`);
  console.log(`==================================================\n`);
});
