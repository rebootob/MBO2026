# AI ACTIVE TASK — D1 AUTH BRIDGE WP1 CORE CORRECTIVE

Mode: **SOURCE / TEST / LOCAL ONLY — ZERO LIVE KINTONE / ZERO DEPLOY**
Branch: `ai/antigravity-wp002c`
Max status: `IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`

## Read only
1. `project-docs/AI_CONTROL_CENTER.md`
2. this file
3. `project-docs/CONFIRMED_BASELINE/D1_AUTH_SECURITY.md`
4. `project-docs/CONFIRMED_BASELINE/D1_SESSION_CONTINUITY.md`
5. `src/ui/mbo-kintone-auth-adapter.js` for exact legacy compatibility
6. `services/mbo-auth-bridge/` only

Do not scan repo. Do not touch App794 browser production source.

## Fix only WP1 core contract

1. **PBKDF2 legacy compatibility**
   - salt in serialized hash is hex text, but PBKDF2 input salt must be decoded bytes (`Buffer.from(saltHex, 'hex')`).
   - require exactly `pbkdf2$100000$<valid hex salt>$<64 hex hash>`.
   - add independent fixed vector:
     - password `0113`
     - saltHex `00112233445566778899aabbccddeeff`
     - expected hash `51cbc01895f8689f4e6a7f8f227b2264c5675e992b3ce7d1db6010bb523be7c3`

2. **Exact App801 fields + fail-closed parsing**
   Use exact live field codes:
   - `Session_Token_Hash`
   - `Session_Issued_At`
   - `Session_Expires_At`
   - `Session_Credential_Version`
   - `Session_Kintone_User`
   Remove `Session_Kintone_User_Code`.
   Missing/invalid Account_Status, Force_Password_Change, Failed_Attempts, Locked_Until, Credential_Version or session version state must fail closed; never default security state to ACTIVE/NO/version 1.
   Employee_Code must use existing exact canonical validation `/^[A-Za-z0-9_.-]+$/` and reject leading/trailing whitespace.

3. **Token resolves identity server-side**
   - add repository lookup by exact `Session_Token_Hash` with `limit 2` and duplicate fail-closed.
   - session validate request must require raw `sessionToken` + Kintone context only; do not trust browser Employee_Code.
   - hash token -> resolve exactly one row -> derive Employee_Code -> validate ACTIVE, Force=NO, expiry, `Session_Credential_Version === Credential_Version`, exact `Session_Kintone_User` when applicable.
   - create session writes issued-at, expiry, session credential version and Kintone user.

4. **Lifecycle identity/security**
   - logout must revoke the session matching the presented raw token; no Employee_Code-only revoke endpoint.
   - normal password change derives employee identity from validated session token; do not trust browser Employee_Code.
   - force change derives employee from signed ticket, requires current ACTIVE + Force=YES + matching Credential_Version, and must never set a DISABLED/LOCKED account back to ACTIVE.
   - after force/normal password change: increment Credential_Version, invalidate old session, then issue replacement session.

5. **Lock semantics**
   - permanent `Account_Status=LOCKED` always denies.
   - 5 wrong passwords create a 15-minute temporary lock via `Locked_Until`; do not set permanent Account_Status=LOCKED for temporary lockout.
   - successful login after temporary lock expiry clears Failed_Attempts/Locked_Until but does not rewrite permanent account status.

6. **Config/response fail-closed**
   - no default signing secret.
   - no default `*` CORS allow-list.
   - validate mandatory config values/placeholders at runtime boundary.
   - browser responses must never contain raw repository/Kintone `err.message`; return stable sanitized status/reason.
   - remove invalid `start: node src/server.js` until a real server runtime is authorized/implemented; do not add live server/transport in this corrective.

## Tests — mandatory

Keep existing useful tests and add non-skippable proofs for:
- fixed legacy PBKDF2 vector above;
- malformed PBKDF2 rejected;
- exact App801 session field codes;
- malformed/missing security fields fail closed;
- Employee_Code whitespace/invalid characters rejected;
- token-hash lookup resolves Employee_Code without client Employee_Code;
- duplicate token hash fails closed;
- Session_Credential_Version mismatch invalid;
- Kintone context mismatch invalid;
- logout requires/matches session token;
- password change identity comes from session token;
- force ticket expired/tampered/version mismatch denied;
- disabled/locked account cannot be re-enabled by force change;
- 5th failure sets temporary Locked_Until but leaves Account_Status ACTIVE;
- permanent LOCKED remains denied after time passes;
- internal repository error text/secret is not returned to browser;
- no create/delete capability;
- CORS/no-store/rate-limit remain.

Run:
```text
npm --prefix services/mbo-auth-bridge test
npm test
```

## Forbidden
- NO live Kintone read/write
- NO App801 ACL or record write
- NO production token/secret
- NO Bridge deploy
- NO App794 deploy
- NO browser integration / `main-mbo-app.js` / Login Gate / Session Manager edits
- NO dist
- NO Deploy Guard
- NO D2-D7

Commit + push one concise corrective commit, then STOP.
Do not Self-PASS.
