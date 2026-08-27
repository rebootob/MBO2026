# AI ACTIVE TASK — D1 KINTONE-ONLY SOURCE FINAL CORRECTIVE: FAIL-CLOSED GATE + REAL UI + AUTOLOAD

> Control Plane: ChatGPT
> Execution Plane: Codex (temporary replacement for Antigravity)
> Repository: `rebootob/MBO2026`
> Canonical integration branch: `ai/antigravity-wp002c`
> Codex execution branch: `ai/codex-d1c3b`
> Reviewed implementation: `3e9f7aa59cd3c16285c84e69fe0c8a98705252d5`
> Mode: MINIMUM SOURCE CORRECTIVE + LOCAL TESTS ONLY / NO LIVE KINTONE WRITE / NO ACL CHANGE / NO DEPLOY

## 0. INDEPENDENT REVIEW RESULT

Accepted foundation from `3e9f7aa...`:
- browser module uses Web Crypto PBKDF2-SHA256 and no Node crypto import;
- hash format is compatible with `pbkdf2$100000$<saltHex>$<hashHex>`;
- page-memory principal concept exists;
- Force_Password_Change blocks `getEmployeeCode()` until password change;
- authenticated Employee_Code mismatch guard exists in `EmployeePartAUI.executeLookup()`;
- create record Employee_Code is intended to come from authenticated context;
- no Kintone live write, ACL change, schema change, customization deploy, or external runtime work occurred.

GitHub has no CI/workflow/status evidence. Do not claim CI PASS.

D1 source implementation is NOT accepted yet because the current production path is fail-open and the required UI/integration behavior is incomplete.

## 1. B1 — PRODUCTION LOGIN GATE IS CURRENTLY FAIL-OPEN

Current `src/main-mbo-app.js` initializes:

```js
let mboLoginGate = null;
```

and only blocks when `mboLoginGate` is truthy. No production caller initializes `setMboLoginGate()`.

Therefore current App794 record flow can render without MBO authentication.

### Required correction

- initialize the Kintone-only auth adapter and login gate automatically in production App794 customization;
- do not depend on an external caller/test hook to activate authentication;
- if adapter/gate initialization is unavailable or fails, fail closed with blocking UI/error; do not render Employee Self;
- preserve injectable seams only if useful for tests, but production must never rely on them.

Required classification after fix:

```text
GATE_UNINITIALIZED_BEHAVIOR = FAIL_CLOSED
MBO_LOGIN_EVERY_ENTRY = YES
```

## 2. B2 — `MboKintoneLoginGate` MUST BE A REAL BLOCKING UI

Current file is only an 8-line state class. It does not render a modal/full-screen gate.

Implement the minimum real UI required by the frozen user experience:
- blocking login modal/overlay with Username + Password;
- username = Employee_Code;
- do not expose native Employee Self custom UI before successful authorization;
- `Force_Password_Change=YES` shows forced new-password UI before data authorization;
- authenticated user has an own-password-change action;
- authenticated user has a logout action;
- logout clears page-memory principal and restores the blocking login gate;
- no hash/secret in DOM attributes, visible text, logs, URL/query, storage, or cookies;
- no localStorage/sessionStorage/cookie auth persistence;
- reload/re-entry requires login again.

Cover:
- App794 index/list entry (`app.record.index.show` or the minimum technically valid equivalent);
- create;
- detail;
- edit.

For a detail/edit Employee_Code mismatch, show a blocking access-denied gate/state. Do NOT merely `return event` and leave native/custom MBO content visible.

Do not claim native list/REST hard isolation; the shared-Kintone limitation remains documented.

## 3. B3 — AUTHENTICATED CREATE FLOW MUST AUTOLOAD APP53 + EXISTING ROUTING/SCORING

Current implementation only assigns:

```js
record.Employee_Code.value = authenticatedEmployeeCode
```

It does not automatically execute the existing App53 lookup / routing / scoring / duplicate / record-key path.

### Required correction

Reuse the existing employee-resolution logic already in `src/main-mbo-app.js` rather than duplicating it.

After successful MBO login on create:
1. call `EmployeeService.lookupEmployee(authenticatedEmployeeCode, kintoneApiWrapper)`;
2. preserve current App795 routing logic;
3. preserve current App796 published scoring lookup;
4. preserve duplicate check and Record_Key generation;
5. populate the same snapshot fields currently populated by the manual lookup path;
6. do not ask/select Employee_Code again.

Refactor only enough to share the existing lookup path between authenticated autoload and any remaining authorized non-employee/admin path.

The Kintone show event may return/await a Promise if needed; do not silently race UI render before authenticated employee resolution completes.

## 4. B4 — APP801 AUTH ADAPTER MUST COMPLETE THE MINIMUM EXISTING LOGIN LIFECYCLE

Keep the browser-only WebCrypto design and existing physical fields only. No schema additions.

Correct the minimum lifecycle:
- validate/map relevant physical fields consistently: `Employee_Code`, `Password_Hash`, `Password_Algorithm`, `Password_Changed_At`, `Force_Password_Change`, `Account_Status`, `Failed_Attempts`, `Locked_Until`, `Last_Login_At`, `Credential_Version`;
- malformed required credential state => fail closed;
- wrong password updates failed-attempt state using the accepted D1 semantics where practical (5 attempts, 15-minute lockout); do not weaken lockout silently;
- successful login resets failed-attempt/expired lock state as appropriate and updates `Last_Login_At`;
- `LOCKED` / `DISABLED` deny;
- temporary time lock in `Locked_Until` denies while active;
- never return Password_Hash from public adapter results.

### Password change

Forced first/default password change:
- allowed only after a valid login result with `Force_Password_Change=YES`;
- new password must not equal Employee_Code.

Normal own-password change:
- require current password verification before update;
- new password must not equal Employee_Code;
- update same PBKDF2 format;
- clear `Force_Password_Change`, failed count and lock;
- do not return the new hash.

No Activation Code. No persisted session fields.

## 5. B5 — EMPLOYEE SELF CONTEXT MUST REMAIN AUTHENTICATED EMPLOYEE ONLY

Preserve and prove:
- authenticated Employee_Code is the only Employee Self context;
- no Employee_Code input/selector after login;
- `0118` cannot switch lookup or mutation to `0119`;
- create flow binds `0118` from page-memory auth, not user input;
- detail/edit record belonging to `0119` is blocked for authenticated `0118` in the custom application gate;
- technical admin/support behavior stays separate and does not become Employee Self authority.

## 6. REQUIRED FOCUSED TESTS

Add only the missing focused evidence. Reuse current tests where valid.

Must prove:
1. production gate is automatically initialized or otherwise fail-closed; no `mboLoginGate === null` bypass;
2. actual blocking login UI exists and remains until authentication;
3. index/list, create, detail and edit entry paths invoke the gate;
4. wrong password is denied and failed-attempt state is updated;
5. 5th failed attempt locks according to the accepted 15-minute semantics;
6. disabled/locked/malformed/duplicate/missing credential fail closed;
7. forced password change blocks Employee Self data until success;
8. normal password change rejects wrong/missing current password;
9. password-change result exposes no hash;
10. logout clears page-memory principal and re-blocks UI;
11. page reload/new gate instance has no authenticated state;
12. create auth `0118` triggers App53 lookup with exactly `0118` and preserves existing routing/scoring resolution path;
13. create cannot substitute `0119`;
14. detail/edit 0119 is blocked for authenticated 0118 with blocking UI/state;
15. no Employee_Code lookup input for authenticated Employee Self;
16. no Node crypto import, localStorage, sessionStorage or auth cookies in Kintone browser modules;
17. relevant D1 regressions and full `npm test` pass locally.

Do not create broad duplicate test suites.

## 7. ALLOWED SOURCE SCOPE

Prefer only:
- `src/ui/mbo-kintone-auth-adapter.js`
- `src/ui/mbo-kintone-login-gate.js`
- `src/main-mbo-app.js`
- `src/ui/employee-part-a-ui.js`
- `tests/mbo-kintone-auth-adapter.test.js`
- `tests/mbo-kintone-login-gate.test.js`
- an existing focused main/UI test file only if required for integration evidence.

Do not modify deployment scripts/manifests unless test/build cannot see the modules; stop and report before widening production/deploy scope.

## 8. LIVE KINTONE — STILL FORBIDDEN

Do NOT:
- change App801 ACL or record permissions;
- add/remove App801 fields;
- provision/update real credentials;
- deploy App794 customization;
- change App794 ACL;
- execute migration;
- deploy/modify external gateway/server/runtime;
- work on D2-D7.

Mandatory:

```text
KINTONE_READS_EXECUTED = 0
KINTONE_WRITES_EXECUTED = 0
KINTONE_DEPLOY_EXECUTED = 0
APP801_ACL_CHANGE_EXECUTED = 0
```

## 9. VERIFICATION

Run focused tests, relevant D1 regression, then:

```bash
npm test
git diff --check
git status --short
```

No CI claim without GitHub CI evidence.

## 10. DELIVERY REPORT

Commit + push only to `ai/codex-d1c3b`.
Maximum implementer status remains:

```text
IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

Report:

```text
HEAD_BEFORE =
HEAD_AFTER =
FILES_CHANGED =
TEST_RESULTS =

PRODUCTION_GATE_INITIALIZATION = IMPLEMENTED_PENDING_REVIEW
GATE_UNINITIALIZED_BEHAVIOR = FAIL_CLOSED
BLOCKING_LOGIN_UI = IMPLEMENTED_PENDING_REVIEW
INDEX_LIST_GATE = IMPLEMENTED_PENDING_REVIEW
CREATE_GATE = IMPLEMENTED_PENDING_REVIEW
DETAIL_EDIT_GATE = IMPLEMENTED_PENDING_REVIEW
FORCE_PASSWORD_CHANGE_UI = IMPLEMENTED_PENDING_REVIEW
NORMAL_OWN_PASSWORD_CHANGE = IMPLEMENTED_PENDING_REVIEW
FAILED_ATTEMPT_LOCKOUT = IMPLEMENTED_PENDING_REVIEW
APP53_AUTHENTICATED_AUTOLOAD = IMPLEMENTED_PENDING_REVIEW
ROUTING_SCORING_AUTOLOAD_PRESERVED = IMPLEMENTED_PENDING_REVIEW
EMPLOYEE_0118_TO_0119_UI_SWITCH = BLOCKED_PENDING_REVIEW
PAGE_MEMORY_ONLY = PROVEN_PENDING_REVIEW
APP801_SCHEMA_WRITE_REQUIRED = NO
APP801_LIVE_ACL_CURRENT = BLOCKS_SHARED_EMPLOYEE_BROWSER
LIVE_RUNTIME_STATUS = BLOCKED_PENDING_SEPARATE_APP801_ACL_AUTHORIZATION

KINTONE_READS_EXECUTED = 0
KINTONE_WRITES_EXECUTED = 0
KINTONE_DEPLOY_EXECUTED = 0
APP801_ACL_CHANGE_EXECUTED = 0
D1_STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

Stop after commit + push. ChatGPT performs independent review.

---

# MANDATORY PROJECT CONTROL — DO NOT DROP

- D1 Login + password change + employee-self MBO gate = IN_PROGRESS / KINTONE-ONLY / SOURCE FINAL CORRECTIVE
- D2 Excel + PDF legacy-format export = IN_PROGRESS
- D3 migrate ALL history from Apps 283, 310, 305, 643, 307, 640, 715, 716 into App794 = IN_PROGRESS / WRITE NOT AUTHORIZED
- D4 HR Control Center / App800 end-to-end lifecycle = IN_PROGRESS
- D5 employee copy ONLY own previous planning fields = MUST_FIX
- D6 full E2E / security / regression closure = BLOCKED
- D7 Admin Support Center = PASS / CLOSED
