# AI ACTIVE TASK — D1 KINTONE-ONLY SOURCE IMPLEMENTATION: MBO LOGIN GATE

> Control Plane: ChatGPT
> Execution Plane: Codex (temporary replacement for Antigravity)
> Repository: `rebootob/MBO2026`
> Canonical integration branch: `ai/antigravity-wp002c`
> Codex execution branch: `ai/codex-d1c3b`
> Independently reviewed reconciliation commit: `cc9cc537a42d484428d26905240087582bb1970a`
> Mode: SOURCE + LOCAL TESTS ONLY / NO LIVE KINTONE WRITE / NO ACL CHANGE / NO DEPLOY

## 0. INDEPENDENT REVIEW RESULT — RECONCILIATION ACCEPTED

Accepted live facts:

```text
KINTONE_ONLY_ARCHITECTURE = ACCEPTED
EXTERNAL_GATEWAY_REQUIRED = NO
PAGE_MEMORY_AUTH_CONTEXT = YES
ACTIVATION_CODE_REQUIRED = NO
PERSISTED_SESSION_FIELDS_REQUIRED = NO
KINTONE_SCHEMA_WRITE_REQUIRED = NO

APP801_APP_ACL_CURRENT =
  CREATOR:null => appEditable/view/add/edit/delete/import/export=true
  GROUP:everyone => appEditable/view/add/edit/delete/import/export=false
APP801_RECORD_ACL_CURRENT = NONE
SHARED_EMPLOYEE_CAN_READ_APP801 = NO
SHARED_EMPLOYEE_CAN_UPDATE_APP801 = NO
KINTONE_ONLY_LOGIN_RUNTIME = BLOCKED_APP801_BROWSER_READ
```

Therefore current live App801 ACL blocks browser runtime. Do NOT change ACL in this package. The purpose of this package is to finish and test the Kintone-only source so the later live authorization can be one controlled ACL + customization deployment package.

GitHub has no CI/workflow/status evidence for the reconciliation commit. Do not claim CI PASS.

## 1. FROZEN USER EXPERIENCE

Every time an employee enters MBO, including the App794 entry/list page and any create/detail/edit record entry:

```text
Open MBO
  -> MBO Login gate
  -> Username = Employee_Code
  -> Password = MBO password from App801
  -> successful login binds authenticated Employee_Code in PAGE MEMORY ONLY
  -> no Employee ID selector/input after login
  -> load only the authenticated employee context in the custom Employee Self UI
```

Leaving/reloading/re-entering MBO must require login again.

Initial/default password remains Employee_Code. If `Force_Password_Change = YES`, successful default login must require password change before Employee Self data is rendered.

Employee can change own password and logout. Logout clears page-memory auth context only.

No Activation Code. No persisted MBO session token. No localStorage/sessionStorage/cookie auth persistence.

## 2. SECURITY CLASSIFICATION — DO NOT OVERCLAIM

This is a Kintone customization/application login gate under a shared Kintone account.

It is NOT hard native Kintone employee isolation. Direct URL/REST bypass cannot be guaranteed against a technically capable user while the shared Kintone principal retains native App794 access.

Do not claim otherwise.

App801 hash data must never be rendered, logged, copied into DOM attributes, localStorage/sessionStorage, cookies, query strings, or error messages.

The later live ACL decision will explicitly accept or reject the browser-readable App801 hash tradeoff. This source package does not make that live decision.

## 3. REQUIRED SOURCE IMPLEMENTATION — MINIMUM ONLY

Preferred change set:

1. `src/ui/mbo-kintone-auth-adapter.js` NEW
   - browser-only Kintone API adapter for App801;
   - NO Node imports;
   - use Web Crypto (`crypto.subtle`) PBKDF2 SHA-256;
   - verify existing format exactly:
     `pbkdf2$100000$<saltHex>$<hashHex>`;
   - create new password hash in same format using `crypto.getRandomValues()` salt;
   - exact one credential record by normalized Employee_Code, duplicate/missing/malformed fail closed;
   - map physical fields exactly: `Employee_Code`, `Password_Hash`, `Password_Algorithm`, `Password_Changed_At`, `Force_Password_Change`, `Account_Status`, `Failed_Attempts`, `Locked_Until`, `Last_Login_At`, `Credential_Version`;
   - preserve existing lockout semantics where practical;
   - expose sanitized results only; never return Password_Hash outside adapter internals;
   - password change update contract: Password_Hash, Password_Changed_At, Force_Password_Change=NO, Failed_Attempts reset, Locked_Until clear; Last_Login_At as applicable;
   - do not use old Activation/Session fields.

2. `src/ui/mbo-kintone-login-gate.js` NEW
   - modal/full blocking login gate;
   - username/password only;
   - `Force_Password_Change=YES` => force new password before data authorization;
   - normal own-password change action;
   - logout action;
   - authenticated principal stored only in module/class page memory;
   - no localStorage/sessionStorage/cookie auth persistence;
   - return/expose only authenticated Employee_Code, never credential/hash data.

3. `src/main-mbo-app.js` MODIFY
   - App794-only gate must run before Employee Self custom UI render;
   - cover App794 entry/list plus create/detail/edit flows as technically supported by current customization;
   - after authentication, Employee Self source = authenticated MBO Employee_Code only;
   - App53 lookup must reuse `EmployeeService.lookupEmployee(authenticatedEmployeeCode, kintoneApiWrapper)`;
   - create flow binds record Employee_Code from authenticated context;
   - detail/edit flow must compare record Employee_Code to authenticated context and block custom Employee Self rendering on mismatch;
   - do not trust Employee_Code from URL/query/input for authorization;
   - preserve current routing/scoring/record-key logic after the authenticated employee has been resolved;
   - no external gateway/server calls.

4. `src/ui/employee-part-a-ui.js` MODIFY
   - authenticated Employee Self must not render `_renderLookupSection()` / `#mbo-lookup-emp-input`;
   - Employee_Code display only;
   - reject mutation/lookup to a different Employee_Code when authenticated context is present;
   - keep admin/support behavior separate; do not grant technical admin Employee Self authority.

5. Focused tests only. Prefer:
   - `tests/mbo-kintone-auth-adapter.test.js`
   - `tests/mbo-kintone-login-gate.test.js`
   - update existing main/UI tests only if required.

Do not modify deploy scripts/manifests in this package unless build/test cannot include the modules without a minimal manifest change. If that happens, report exact reason and keep deploy execution zero.

## 4. REQUIRED TEST EVIDENCE

Prove at minimum:

1. PBKDF2 WebCrypto verification is compatible with the existing `pbkdf2$100000$...` format.
2. wrong password denied.
3. malformed/duplicate/missing App801 credential fails closed.
4. disabled/locked credential denied.
5. default login with `Force_Password_Change=YES` cannot render Employee Self until password change succeeds.
6. password change creates same PBKDF2 format and never returns/logs hash.
7. successful login returns/binds only normalized authenticated Employee_Code.
8. page auth state is memory-only; no localStorage/sessionStorage/cookie persistence.
9. 0118 authenticated context cannot switch lookup/input to 0119.
10. detail/edit record for 0119 is blocked from 0118 custom Employee Self context.
11. create flow binds Employee_Code from authenticated context, not free-form input.
12. logout clears in-page auth context.
13. no Node `crypto` import in Kintone browser modules.
14. existing D1 and full workspace tests still pass.

Because current live App801 ACL denies employee browser access, local tests must use injected/mock Kintone API data; do NOT weaken or change live ACL for tests.

## 5. LIVE KINTONE — STRICTLY FORBIDDEN THIS PACKAGE

Do NOT:
- change App801 ACL;
- change App801 record permissions;
- add/remove App801 fields;
- provision/update real credentials;
- deploy App794 customization;
- change App794 ACL;
- execute migration;
- deploy or modify external server/gateway runtime.

Mandatory:

```text
KINTONE_WRITES_EXECUTED = 0
KINTONE_DEPLOY_EXECUTED = 0
APP801_ACL_CHANGE_EXECUTED = 0
```

## 6. VERIFICATION

Run focused new tests, relevant D1 regression, then:

```bash
npm test
git diff --check
git status --short
```

No CI claim without GitHub CI evidence.

## 7. DELIVERY REPORT

Commit + push only to `ai/codex-d1c3b`.
Do NOT push directly to `ai/antigravity-wp002c`.

Maximum status:
`IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`

Report:

```text
HEAD_BEFORE =
HEAD_AFTER =
FILES_CHANGED =
TEST_RESULTS =

KINTONE_ONLY_ARCHITECTURE = ACCEPTED
MBO_LOGIN_EVERY_ENTRY = IMPLEMENTED_PENDING_REVIEW
PAGE_MEMORY_AUTH_CONTEXT = IMPLEMENTED_PENDING_REVIEW
EMPLOYEE_ID_REENTRY_AFTER_LOGIN = NO
WEBCRYPTO_PBKDF2_COMPATIBILITY = PROVEN_PENDING_REVIEW
FORCE_PASSWORD_CHANGE = IMPLEMENTED_PENDING_REVIEW
OWN_PASSWORD_CHANGE = IMPLEMENTED_PENDING_REVIEW
LOGOUT_PAGE_CONTEXT_CLEAR = IMPLEMENTED_PENDING_REVIEW
EMPLOYEE_SELF_CONTEXT_SOURCE = AUTHENTICATED_MBO_EMPLOYEE_CODE
EMPLOYEE_0118_TO_0119_UI_SWITCH = BLOCKED_PENDING_REVIEW
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

- D1 Login + password change + employee-self MBO gate = IN_PROGRESS / KINTONE-ONLY / SOURCE IMPLEMENTATION
- D2 Excel + PDF legacy-format export = IN_PROGRESS
- D3 migrate ALL history from Apps 283, 310, 305, 643, 307, 640, 715, 716 into App794 = IN_PROGRESS / WRITE NOT AUTHORIZED
- D4 HR Control Center / App800 end-to-end lifecycle = IN_PROGRESS
- D5 employee copy ONLY own previous planning fields = MUST_FIX
- D6 full E2E / security / regression closure = BLOCKED
- D7 Admin Support Center = PASS / CLOSED
