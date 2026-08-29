# AI ACTIVE TASK — D1 AUTH BRIDGE WP1 CORE / CONTRACT

Mode: **SOURCE / TEST / LOCAL ONLY — ZERO KINTONE WRITE / ZERO LIVE DEPLOY**
Branch: `ai/antigravity-wp002c`
Max status: `IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`

## Read only
1. `project-docs/AI_CONTROL_CENTER.md`
2. this file
3. `project-docs/CONFIRMED_BASELINE/D1_AUTH_SECURITY.md`
4. `project-docs/CONFIRMED_BASELINE/D1_SESSION_CONTINUITY.md`
5. `project-docs/CONFIRMED_BASELINE/SOURCE_CODE_ARCHITECTURE.md`
6. `src/ui/mbo-kintone-auth-adapter.js` only for existing PBKDF2/App801 field compatibility
7. `src/ui/mbo-session-manager.js` only for existing session contract compatibility

Do not scan repo.

## Goal
Build the **server-side Auth Bridge core** only. Do not connect App794 production browser code yet.

Create a provider-neutral **Node.js 20** service under:

```text
services/mbo-auth-bridge/
```

Use Node built-ins only for WP1 unless absolutely required. Keep service-local package/test setup separate from browser package.

## Required responsibilities
Keep modules separated for:
- environment/config validation;
- App801 repository/Kintone HTTP access;
- PBKDF2/password + lockout/auth service;
- session issue/validate/revoke service;
- force-change ticket signing/verification;
- HTTP routing/response normalization.

Do not create one giant server file.

## Required Auth Contract
Implement local/testable handlers for:

```text
POST /v1/auth/login
POST /v1/auth/session/validate
POST /v1/auth/logout
POST /v1/auth/password/change
POST /v1/auth/password/force-change
GET  /healthz
```

Required normalized statuses include:

```text
AUTHENTICATED
PASSWORD_CHANGE_REQUIRED
INVALID_CREDENTIALS
ACCOUNT_LOCKED
ACCOUNT_DISABLED
INVALID_SESSION
RATE_LIMITED
AUTH_SERVICE_UNAVAILABLE
```

Do not return raw Kintone errors or credential records.

## Security / compatibility rules
- Preserve PBKDF2-SHA256, 100000 iterations, existing `pbkdf2$100000$<saltHex>$<hashHex>` format.
- Preserve App801 field names and existing 5 failures -> 15-minute lockout.
- Normal successful login resets failed state and updates Last_Login_At.
- Normal login issues random 256-bit opaque token server-side.
- App801 stores only SHA-256(token) + existing session metadata.
- Session TTL = 8h absolute / no sliding / one active session per Employee_Code.
- Preserve Credential_Version and exact Kintone-user-context binding semantics.
- Force Change returns a signed memory-only ticket, not a session.
- Force ticket TTL = 10 minutes; HMAC-SHA256; includes Employee_Code + Credential_Version + expiry + nonce; no password/hash/session token.
- Successful force change increments Credential_Version and then issues normal session.
- Normal password change validates session + current password, increments Credential_Version, invalidates old session and returns replacement session.
- Logout is server-revocation aware.
- App801 repository supports READ + UPDATE existing records only. NO create/delete path.
- Bridge never logs password, raw session token, Password_Hash, force ticket, App801 API token or signing secret.
- Auth responses use `Cache-Control: no-store`.
- CORS uses configured allow-list. Treat CORS as transport hardening, not sole auth security.
- Include a rate-limiter boundary/test double; no hosting-specific production assumption in WP1.

## Environment names only
Document placeholders only; never add real values:

```text
KINTONE_BASE_URL
APP801_ID
KINTONE_API_TOKEN
FORCE_CHANGE_SIGNING_SECRET
ALLOWED_ORIGINS
PORT
```

No `.env` with secrets. `.env.example` may contain names/placeholders only.

## Tests — mandatory
Use mocked/injected Kintone repository/network. **No live ttmet.cybozu.com calls.**

Prove at minimum:
1. existing PBKDF2 format verify + new hash compatibility;
2. valid ACTIVE login -> raw session returned, only token hash persisted;
3. wrong password increments attempts and 5th failure produces 15-minute lock;
4. LOCKED / DISABLED denied with correct stable status;
5. Force Change -> ticket only, no usable session;
6. tampered/expired/version-mismatched force ticket denied;
7. successful Force Change increments Credential_Version + issues session;
8. session validation checks ACTIVE, Force=NO, expiry, Credential_Version, Kintone context;
9. logout clears persisted session fields;
10. normal password change rotates Credential_Version + session;
11. duplicate/malformed credential/session rows fail closed;
12. no response exposes Password_Hash / Session_Token_Hash / API token / signing secret;
13. repository/router has no record create/delete capability;
14. disallowed Origin rejected; allowed Origin receives no-store response;
15. injected limiter can produce `RATE_LIMITED`.

## Required run

```text
npm --prefix services/mbo-auth-bridge test
npm test
```

Do not run any live deploy script.

## Forbidden
- NO Kintone write/read against live domain
- NO App801 ACL change
- NO App801 record write
- NO production API token/secret creation
- NO Auth Bridge live deploy
- NO App794 deploy
- NO App794 browser integration in WP1
- NO edits to `src/main-mbo-app.js`
- NO edits to Login Gate / My MBO UI / routing / scoring / workflow
- NO dist change
- NO Deploy Guard fix
- NO D2-D7

Commit + push one concise WP1 commit, then STOP.
Do not Self-PASS.
