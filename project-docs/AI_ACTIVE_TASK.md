# AI ACTIVE TASK — D1 PASSWORD RESET CORE R1 / SOURCE-ONLY

Mode: **ANTIGRAVITY SOURCE EXECUTION ONLY — NO LIVE KINTONE WRITE / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`

## 1. Objective

Implement the smallest missing D1 prerequisite for Production MBO Password Reset: the **current Kintone-only App801 reset core primitive** in the canonical browser auth adapter, with focused tests.

This packet does **NOT** implement the final HR/admin UI and does **NOT** authorize any Live Kintone operation.

## 2. Accepted Live Baseline — MUST REMAIN UNCHANGED

```text
DEPLOYED_SOURCE_COMMIT = 9816cef195b6d3ffe039e5fb92c8dc8406c8967a
LIVE_REVISION          = 57
LIVE_JS_IDENTITY       = ac22a56cb9d78001384241fe12745f7a2da3da84
LIVE_CSS_IDENTITY      = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
CURRENT_LIVE_RUNTIME   = ACCEPTED KNOWN-GOOD
```

WP2 R3 remains CLOSED. Do not modify/reopen its behavior.

Previous deployment authorization `APP794-D1-WP2-R3-DEPLOY-20260829-01` is CONSUMED / CLOSED and MUST NEVER be reused.

## 3. Read Set — NO BROAD SCAN

Read only:
1. `project-docs/AI_CONTROL_CENTER.md`
2. this `project-docs/AI_ACTIVE_TASK.md`
3. `project-docs/CONFIRMED_BASELINE/D1_AUTH_SECURITY.md`
4. `project-docs/CONFIRMED_BASELINE/D1_SESSION_CONTINUITY.md`
5. `project-docs/CONFIRMED_BASELINE/SOURCE_CODE_ARCHITECTURE.md`
6. `src/ui/mbo-kintone-auth-adapter.js`
7. `tests/mbo-kintone-auth-adapter.test.js`
8. `scripts/kintone/build-mbo-ui.js` only if needed to understand normal generated bundle behavior
9. `dist/mbo-employee-app.js` only as generated build output / source-to-dist evidence; never edit manually

Do not inspect historical Auth Bridge implementation for runtime design.

## 4. Canonical Feature Ownership

```text
FEATURE                  = D1 MBO Password Reset Core
CANONICAL_SOURCE_OWNER   = src/ui/mbo-kintone-auth-adapter.js
FOCUSED_TEST             = tests/mbo-kintone-auth-adapter.test.js
GENERATED_DIST_OUTPUT    = dist/mbo-employee-app.js only if normal ui:build changes it
LIVE_RESOURCE            = NONE IN THIS TASK
```

Do NOT move reset logic into `src/main-mbo-app.js`.
Do NOT reuse `src/services/mbo-password-service.js` as the production Kintone-only runtime owner; it contains older field semantics and is outside this R1 scope.

## 5. Required Source Behavior

Add one small public reset-core method to `MboKintoneAuthAdapter` using the adapter's existing canonical validation, `_getCredential(...)`, `createPasswordHash(...)`, current `now()` dependency, and existing App801 update transport.

Recommended public name: `resetMboPassword({ employeeCode })` unless an equally clear existing convention in the target file requires another name.

For exactly one valid existing App801 credential row:

```text
temporary password          = exact normalized Employee_Code
Password_Hash               = PBKDF2-SHA256 / 100000 via current createPasswordHash
Force_Password_Change       = YES
Failed_Attempts             = 0
Locked_Until                = null / cleared
Credential_Version          = existing positive integer + exactly 1
Session_Token_Hash          = cleared
Session_Issued_At           = cleared
Session_Expires_At          = cleared
Session_Credential_Version  = cleared
Session_Kintone_User        = cleared
Password_Changed_At         = reset timestamp from current adapter now() is allowed/preferred for auditability
```

Mandatory safety semantics:
- MUST NOT change `Account_Status`.
- A permanently `LOCKED` or `DISABLED` account MUST remain permanently `LOCKED` or `DISABLED` after reset.
- MUST target exactly one existing credential row; missing/duplicate/malformed identity/state fails closed.
- MUST NOT create or delete App801 records.
- MUST NOT expose/return plaintext password, `Password_Hash`, raw token, token hash, salt, or session secret.
- Return only a minimal non-secret success result such as `{ status: 'PASSWORD_RESET', employeeCode }`.
- Keep current Employee_Code validation semantics; do not invent a new normalization rule.
- Do not change login/session behavior outside what is necessary for this method.

## 6. Focused Tests — REQUIRED

Extend only `tests/mbo-kintone-auth-adapter.test.js` unless a directly necessary existing focused test must also change.

At minimum prove:
1. ACTIVE credential reset writes the exact required fields.
2. `Credential_Version` increments by exactly 1.
3. every active `Session_*` field is cleared.
4. `Force_Password_Change=YES`, `Failed_Attempts=0`, temporary `Locked_Until` cleared.
5. `Account_Status` is absent from the update payload / remains unchanged.
6. permanent `LOCKED` credential remains LOCKED; permanent `DISABLED` remains DISABLED.
7. missing credential fails closed with zero update.
8. duplicate credential fails closed with zero update.
9. malformed/missing/non-positive/non-integer `Credential_Version` fails closed with zero update.
10. successful return contains no password/hash/token/session secret.
11. supported canonical Employee_Code punctuation behavior remains unchanged.

Do not weaken existing auth/session tests to make the new tests pass.

## 7. Verification

Run:

```text
node --test tests/mbo-kintone-auth-adapter.test.js
node --test tests/mbo-session-manager.test.js tests/mbo-kintone-login-gate.test.js
npm run ui:build
node --test tests/classic-bundle.test.js tests/safety-guard.test.js
```

If a command fails for a clearly pre-existing/unrelated reason, report the exact failure; do not fix unrelated code.

If `npm run ui:build` changes `dist/mbo-employee-app.js`, commit that normal generated output. Never hand-edit the bundle.

## 8. Explicitly Forbidden

Do NOT:
- call Live Kintone POST/PUT/DELETE;
- write any App801 Live record;
- deploy App794/App800 customization;
- change App794/App800/App801 schema/layout/ACL/process settings;
- modify App795/App796 or protected source apps;
- implement the App800 HR/admin reset UI in this R1 packet;
- hardcode or invent HR-authorized user codes/groups;
- modify D7 Admin Support Center;
- modify `src/services/mbo-password-service.js`;
- revive/connect `services/mbo-auth-bridge/`;
- refactor unrelated auth/session code;
- reopen WP2 R3;
- self-certify independent PASS.

## 9. Delivery Contract

Deliver:
1. one narrow source implementation;
2. focused test changes;
3. generated `dist/mbo-employee-app.js` only if normal build changes it;
4. verification outputs summarized concisely;
5. one commit pushed to `ai/antigravity-wp002c`;
6. report commit SHA + changed files + test/build results;
7. STOP for ChatGPT independent review.

No Live action follows automatically.

## 10. Acceptance Ceiling

Maximum executor status:

```text
D1_PASSWORD_RESET_CORE_R1_IMPLEMENTED_PENDING_CHATGPT_REVIEW
```

Even after source PASS, D1 remains open. A separate future packet/review is still required for the authorized App800 HR + `admin-form` reset surface, real authorization evidence, deployment authorization, Live read-back/UAT, prior-session invalidation proof, and final D1 closure gates.
