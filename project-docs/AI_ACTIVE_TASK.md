# AI ACTIVE TASK — D1 KINTONE-ONLY FINAL UI-ISOLATION CORRECTIVE

> Control Plane: ChatGPT
> Execution Plane: Antigravity
> Repository: `rebootob/MBO2026`
> Working branch: `ai/antigravity-wp002c`
> Independently reviewed implementation: `d330514b4fddcb2c3e060209a4be50bb8fd2f24b`
> Mode: MINIMUM SOURCE CORRECTIVE + LOCAL TESTS ONLY / NO LIVE KINTONE ACL-SCHEMA CHANGE / NO DEPLOY

## 0. REVIEW RESULT

Accepted foundation from `d330514...`:
- real blocking Login UI exists;
- WebCrypto PBKDF2-SHA256 format is correct;
- page-memory principal only;
- Force Password Change UI exists;
- normal Change Password UI includes current password;
- Logout clears page-memory and reloads;
- failed-attempt + 15-minute lockout logic exists;
- detail/edit mismatch has blocking notice and hides native fields;
- authenticated Employee_Code suppresses employee lookup selector;
- source/tests are scoped to D1 and no live Kintone write/deploy/ACL change was performed.

D1 SOURCE IS NOT YET ACCEPTED FOR LIVE CUTOVER because the following release blockers remain.

## B1 — INDEX/LIST MUST NOT REVEAL OTHER EMPLOYEES AFTER LOGIN

Current `app.record.index.show` only requires login and then returns the native App794 list. Under the shared Kintone account that list can contain other employees.

Required:
- after login, authenticated Employee_Code is the only Employee Self context;
- native unrestricted App794 list must NOT remain visible to Employee Self;
- render a minimal Employee Self landing/index that queries App794 only with the authenticated Employee_Code, or an equivalent fail-closed custom index;
- show only the authenticated employee's current/history MBO navigation needed for D1;
- do not add D2 export/copy work here;
- no user-supplied Employee_Code query;
- ordinary UI for 0118 must not display 0119 records.

This does NOT claim hard direct-URL/REST isolation; that known shared-account limitation remains documented.

## B2 — INDEX GATE INITIALIZATION FAILURE MUST FAIL CLOSED

Current index handler logs and `return event` when `mboLoginGate` is null, leaving native list visible.

Required:
- if gate is null/failed, render a full-screen blocking error/overlay and hide/cover native index content;
- never return to an unrestricted native list on auth initialization failure.

## B3 — RECORD HOST FAILURE MUST FAIL CLOSED

Current record handler does:

```text
if (!uiHost) -> Retaining native form -> return event
```

This bypasses the MBO gate.

Required:
- do not retain native form unauthenticated;
- use a safe fallback blocking host such as document.body / app wrapper, or otherwise hide native record fields and render a blocking error;
- create/detail/edit must never show native employee MBO fields because `SPACE_HEADER` is missing.

## B4 — AUTHENTICATED CREATE AUTOLOAD MUST BE AWAITED

Current create path starts:

```js
ui.executeLookup(authenticatedEmployeeCode).catch(...)
```

and immediately returns the Kintone show event.

Required:
- make the authenticated create flow await the existing employee-resolution chain before considering setup complete;
- preserve the existing one shared logic path:
  authenticated Employee_Code
  -> App53 EmployeeService.lookupEmployee()
  -> App795 Routing
  -> App796 Scoring
  -> Duplicate Check
  -> Record_Key
  -> snapshot population;
- if autoload fails, show a blocking/fail-closed visible state; do not silently leave a partially initialized Employee Self form;
- do not duplicate business logic.

## B5 — ACCOUNT_STATUS=LOCKED MUST DENY

Current adapter accepts `LOCKED` as a valid status but login only unconditionally denies `DISABLED`; a `LOCKED` record with empty/expired Locked_Until can proceed.

Required:
- `Account_Status = LOCKED` => always `CREDENTIAL_DENIED`;
- `Account_Status = DISABLED` => always deny;
- temporary Failed_Attempts lockout continues to use `Locked_Until` while Account_Status remains ACTIVE;
- malformed Failed_Attempts / malformed Locked_Until required state must fail closed rather than producing NaN or silently allowing.

## B6 — FORCE CHANGE MUST REQUIRE FORCE FLAG

`forceChangePassword()` must not change a credential whose current `Force_Password_Change` is not YES.

Required:
- re-read exact credential;
- require `forceChange === true` before forced-password update;
- otherwise deny without write;
- gate still invokes this only after a valid password login produced `PASSWORD_CHANGE_REQUIRED`.

## B7 — BLOCKED NOTICE MUST NOT INJECT RECORD DATA AS HTML

Do not insert record Employee_Code or other record values into `innerHTML` without escaping.
Use DOM `textContent` / safe nodes for dynamic values.

## REQUIRED FOCUSED TEST EVIDENCE

Add only missing focused tests, preferably extending existing D1 tests / existing main integration test.

Prove:
1. index gate null => native index is blocked, not returned visible;
2. authenticated 0118 index renders/queries only 0118 MBO items and does not display 0119;
3. missing SPACE_HEADER cannot expose native create/detail/edit form;
4. create show does not complete authenticated setup until App53->795->796->duplicate->Record_Key autoload resolves;
5. create autoload failure produces blocking state;
6. `Account_Status=LOCKED` always denied even without Locked_Until;
7. malformed Failed_Attempts / invalid Locked_Until fail closed;
8. forceChangePassword is denied when Force_Password_Change=NO, zero update;
9. detail/edit 0119 remains blocked for authenticated 0118;
10. no regression in Login / force change / normal change / logout / PBKDF2 / page-memory tests;
11. full `npm test` passes locally;
12. `git diff --check` passes.

Do not add broad duplicate test suites.

## ALLOWED SOURCE SCOPE

Prefer only existing D1 files:
- `src/main-mbo-app.js`
- `src/ui/mbo-kintone-auth-adapter.js`
- `src/ui/mbo-kintone-login-gate.js`
- `src/ui/employee-part-a-ui.js` only if genuinely required
- existing D1 tests / existing main integration test
- `dist/mbo-employee-app.js` only as normal rebuilt artifact after source passes

Do not widen scope.

## LIVE KINTONE — STILL FORBIDDEN

Do NOT:
- change App801 ACL or record permissions;
- change Kintone schema;
- provision/update real credentials;
- deploy App794 customization;
- change App794 ACL;
- migrate data;
- work on D2-D7;
- merge/cherry-pick Codex branch.

Mandatory report counters:

```text
KINTONE_READS_EXECUTED = 0
KINTONE_WRITES_EXECUTED = 0
KINTONE_DEPLOY_EXECUTED = 0
APP801_ACL_CHANGE_EXECUTED = 0
```

## VERIFICATION + DELIVERY

Run focused tests, then:

```bash
npm test
git diff --check
git status --short
```

Commit + push ONLY to `ai/antigravity-wp002c`.
Maximum status:

```text
IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

Final report:

```text
HEAD_BEFORE =
HEAD_AFTER =
FILES_CHANGED =
TEST_RESULTS =

INDEX_EMPLOYEE_SELF_ONLY = IMPLEMENTED_PENDING_REVIEW
INDEX_GATE_NULL_FAIL_CLOSED = IMPLEMENTED_PENDING_REVIEW
RECORD_HOST_MISSING_FAIL_CLOSED = IMPLEMENTED_PENDING_REVIEW
CREATE_AUTOLOAD_AWAITED = IMPLEMENTED_PENDING_REVIEW
CREATE_AUTOLOAD_FAILURE_BLOCKED = IMPLEMENTED_PENDING_REVIEW
ACCOUNT_STATUS_LOCKED_DENIED = IMPLEMENTED_PENDING_REVIEW
MALFORMED_LOCKOUT_STATE_DENIED = IMPLEMENTED_PENDING_REVIEW
FORCE_CHANGE_REQUIRES_FORCE_FLAG = IMPLEMENTED_PENDING_REVIEW
BLOCKED_NOTICE_DYNAMIC_TEXT_SAFE = IMPLEMENTED_PENDING_REVIEW
EMPLOYEE_0118_TO_0119_UI_SWITCH = BLOCKED_PENDING_REVIEW
DIRECT_URL_REST_HARD_ISOLATION = NOT_GUARANTEED_UNDER_SHARED_KINTONE_ACCOUNT

KINTONE_READS_EXECUTED = 0
KINTONE_WRITES_EXECUTED = 0
KINTONE_DEPLOY_EXECUTED = 0
APP801_ACL_CHANGE_EXECUTED = 0
D1_STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

Stop after commit + push. ChatGPT performs independent review.

---

# PROJECT CONTROL

- D1 Login + password change + employee-self MBO gate = IN_PROGRESS / KINTONE-ONLY / FINAL UI-ISOLATION CORRECTIVE
- D2 Excel + PDF legacy-format export = IN_PROGRESS
- D3 migrate Apps 283,310,305,643,307,640,715,716 -> App794 = IN_PROGRESS / WRITE NOT AUTHORIZED
- D4 App800 HR Control Center end-to-end lifecycle = IN_PROGRESS
- D5 copy ONLY own prior Objective / Action Plan / Additional Agreement / Weight = MUST_FIX
- D6 integrated E2E/security/regression = BLOCKED
- D7 Admin Support Center = PASS / CLOSED
