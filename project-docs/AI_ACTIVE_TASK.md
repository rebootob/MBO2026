# AI ACTIVE TASK — D1 KINTONE-ONLY SOURCE BLOCKER CORRECTIVE

> Control Plane: ChatGPT
> Execution Plane: Codex
> Repository: `rebootob/MBO2026`
> Canonical branch: `ai/antigravity-wp002c`
> Codex branch: `ai/codex-d1c3b`
> Reviewed head: `5aa4291896fab3a6a56d8d9c21687c019257c7cc`
> Mode: SOURCE + LOCAL TESTS ONLY / NO LIVE KINTONE WRITE / NO ACL CHANGE / NO DEPLOY

## Independent review result

Current source is NOT accepted and must NOT be merged yet.

Accepted foundation:
- browser WebCrypto PBKDF2 hash format remains compatible;
- production adapter/gate is now instantiated;
- wrong-password writes failed-attempt state;
- no live Kintone write/deploy/ACL change was executed by the package.

Exact remaining release blockers:

1. **Parse/runtime blocker** — `src/main-mbo-app.js` uses `await mboLoginGate.requireLogin(...)` inside a non-async record-show callback. Make the Kintone event handler async/Promise-safe and prove the module parses/imports.

2. **Index/list gate missing** — add the minimum valid `app.record.index.show` blocking MBO login gate. Reload/new page must require login again. Do not expose Employee Self/list content before auth.

3. **Forced password-change UI incomplete** — when login returns `PASSWORD_CHANGE_REQUIRED`, the blocking gate must show new-password + confirmation UI, complete password change, and only then authorize data. It must not just print the status and remain stuck.

4. **Authenticated own password-change + logout UI missing** — after authentication provide small authenticated controls for Change Password and Logout. Normal Change Password MUST require current password verification before update. Logout clears page-memory principal and restores the blocking login gate.

5. **Create autoload still missing** — after authenticated create login, automatically execute the existing employee resolution path with exactly `authenticatedEmployeeCode`: App53 lookup -> App795 routing -> App796 published scoring -> duplicate check -> Record_Key -> snapshot population. Reuse/refactor the existing `onLookupEmployee` logic; do not duplicate business rules. Do not ask Employee_Code again.

6. **Detail/edit mismatch must block visibly** — authenticated `0118` opening record `0119` must render a full blocking access-denied state. Do not merely `return event` while native/custom MBO data could remain visible.

## Required auth adapter corrections

Keep existing physical App801 fields only; schema write remains NO.

- normal own-password change API must accept/verify `currentPassword` before changing;
- forced change may proceed only from an already authenticated `PASSWORD_CHANGE_REQUIRED` gate state;
- new password must not equal Employee_Code;
- wrong password increment + 5 attempts / 15-minute lock semantics remain;
- successful login resets failed state and updates `Last_Login_At`;
- never expose/hash-log credential data.

## Focused test evidence required

Add only missing tests and reuse current ones. Prove:
- `src/main-mbo-app.js` parses/imports after async correction;
- index/list, create, detail, edit invoke the gate;
- blocking login UI exists;
- Force Password Change UI completes before authorization;
- normal password change rejects missing/wrong current password;
- logout clears context and re-blocks;
- create auth `0118` calls App53 with exactly `0118` and preserves routing/scoring/duplicate/Record_Key path;
- create cannot substitute `0119`;
- detail/edit `0119` is visibly blocked for auth `0118`;
- wrong-password lockout reaches 5th attempt / 15 minutes;
- no Node crypto import, localStorage, sessionStorage, or auth cookies in browser modules;
- focused tests plus full `npm test`, `git diff --check` pass locally.

## Scope

Prefer only:
- `src/main-mbo-app.js`
- `src/ui/mbo-kintone-auth-adapter.js`
- `src/ui/mbo-kintone-login-gate.js`
- `src/ui/employee-part-a-ui.js` only if needed
- existing/new focused D1 tests only

Do NOT touch deploy scripts, schema, ACL, App794 ACL, migration, external runtime, or D2-D7.

Mandatory counters:

```text
KINTONE_READS_EXECUTED = 0
KINTONE_WRITES_EXECUTED = 0
KINTONE_DEPLOY_EXECUTED = 0
APP801_ACL_CHANGE_EXECUTED = 0
```

Commit + push only to `ai/codex-d1c3b`.
Maximum status: `IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`.

Final report:

```text
HEAD_BEFORE =
HEAD_AFTER =
FILES_CHANGED =
TEST_RESULTS =
MAIN_MODULE_PARSE = PASS|FAIL
INDEX_LIST_GATE =
CREATE_GATE =
DETAIL_EDIT_GATE =
FORCE_PASSWORD_CHANGE_UI =
NORMAL_OWN_PASSWORD_CHANGE =
LOGOUT_REBLOCK =
APP53_AUTHENTICATED_AUTOLOAD =
ROUTING_SCORING_AUTOLOAD_PRESERVED =
DETAIL_EDIT_MISMATCH_BLOCKING_UI =
FAILED_ATTEMPT_LOCKOUT =
APP801_SCHEMA_WRITE_REQUIRED = NO
LIVE_RUNTIME_STATUS = BLOCKED_PENDING_SEPARATE_APP801_ACL_AUTHORIZATION
KINTONE_READS_EXECUTED = 0
KINTONE_WRITES_EXECUTED = 0
KINTONE_DEPLOY_EXECUTED = 0
APP801_ACL_CHANGE_EXECUTED = 0
D1_STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

# Mandatory project control
- D1 = IN_PROGRESS / KINTONE-ONLY / SOURCE BLOCKER CORRECTIVE
- D2 = IN_PROGRESS
- D3 = IN_PROGRESS / WRITE NOT AUTHORIZED
- D4 = IN_PROGRESS
- D5 = MUST_FIX
- D6 = BLOCKED
- D7 = PASS / CLOSED
