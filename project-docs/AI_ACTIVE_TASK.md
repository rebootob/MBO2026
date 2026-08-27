# AI ACTIVE TASK — D1-C3B CLOSURE GATE: TWO FAIL-CLOSED FIXES + EXACT CUTOVER FACTS

> Control Plane: ChatGPT
> Execution Plane: Antigravity
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Independently reviewed implementation: `a2395104b7a392ad5a9f7574db87bcbdd63939d8`
> Mode: MINIMUM CLOSURE ONLY / NO KINTONE WRITE / NO DEPLOY / NO UI

## 0. INDEPENDENT REVIEW RESULT

Accepted from `a2395104...`:
- fiscalYear validation blocks malformed/injection values before Kintone calls;
- recordId validation blocks malformed/injection values before Kintone calls;
- App53 lookup reuses `EmployeeService.lookupEmployee()` canonical `emp_text` / `Number` contract;
- App794 Employee Self responses reuse `CONFIDENTIAL_FIELDS` and strip auth/session secrets;
- mismatched App794 Employee_Code is denied;
- 0118 -> 0119 direct-record compound scope remains enforced;
- scope remained only gateway + focused tests;
- no Kintone write/deploy occurred.

GitHub has no CI/workflow/status evidence. Do not claim CI PASS. The implementer-reported 730/730 local result is not independent CI evidence.

D1-C3B is NOT closed yet for only the items below.

## 1. SOURCE FIX A — MISSING APP794 EMPLOYEE_CODE MUST FAIL CLOSED

Current `_sanitizeApp794Record()` only rejects when `Employee_Code.value` exists as a string and differs from the trusted employee.

Required exact behavior:
- `Employee_Code` missing => FAIL CLOSED;
- `Employee_Code.value` missing/null/non-string/empty => FAIL CLOSED;
- normalized/trimmed value must exactly equal trusted `session.employeeCode`;
- no record data returned on failure.

Apply to bootstrap/history/direct-record through the existing sanitizer only. Do not add a second path.

Add one focused regression test proving an App794 record with missing Employee_Code is rejected.

## 2. SOURCE FIX B — VALIDATE TRUSTED SESSION EMPLOYEE_CODE BEFORE ANY QUERY

Before using `principal.employeeCode` in any App53/App794 query, validate/normalize it with the existing canonical Employee Code utility (`normalizeEmployeeCode` or equivalent existing contract).

Rules:
- only canonical `[A-Za-z0-9_-]+` Employee_Code is accepted;
- malformed trusted-session employeeCode => fail closed before any Kintone call;
- do not invent a new regex if the existing utility can be reused.

Add one focused test using a malformed session employeeCode containing quote/operator text and prove zero Kintone calls.

Do NOT modify auth/session service in this package.

## 3. EXACT APP794 CUTOVER FACTS — READ ONLY, NO MORE SOURCE DISCOVERY

The previous corrective executed zero Kintone reads and therefore did not complete the required cutover evidence.

Use minimum READ-ONLY Kintone GETs, preferably <= 3, to report:

```text
APP794_APP_ACL_CURRENT = <exact entities/principal codes + rights>
APP794_RECORD_ACL_CURRENT = <exact rules or NONE>
APP794_PRIVILEGED_USER_FIELDS = <exact existing Requester/Appraiser/Approver USER_SELECT field codes/types>
APP794_UNSAFE_EMPLOYEE_RULE = <exact GROUP everyone rule>
APP794_ACL_CUTOVER = READY:<exact deny/preserve design> | BLOCKED_PRIVILEGED_RULES_NOT_PROVEN
```

Do not invent HR group/user codes.
Do not change ACL.
Do not deploy.
Never print employee personal data or secrets.

Known accepted baseline remains:
- GROUP everyone direct App794 access is unsafe;
- native shared Kintone principal cannot distinguish employee 0118 vs 0119;
- employee browser must eventually use trusted gateway, not unrestricted direct App794 REST.

## 4. APP801 SCHEMA MANIFEST — FREEZE, NO WRITE

Keep exactly these 9 planned additions:

```text
Password_Expires_At                  DATETIME
Activation_Code_Hash                 SINGLE_LINE_TEXT
Activation_Expires_At                DATETIME
Activation_Used_At                   DATETIME
Session_Token_Hash                   SINGLE_LINE_TEXT
Session_Expires_At                   DATETIME
Session_Requires_Password_Change     DROP_DOWN YES|NO
Session_Data_Authorized              DROP_DOWN YES|NO
Session_Kintone_User_Code            SINGLE_LINE_TEXT
```

`APP801_ACL_CHANGE = NO_CHANGE` unless exact new read evidence proves otherwise.
No credential-level Kintone_User_Code identity field.

## 5. TRUSTED RUNTIME FACT

Do not build hosting here.

If no actual deployed trusted host exists, report:

```text
TRUSTED_BACKEND_RUNTIME = NOT_AVAILABLE
```

This remains a deployment blocker for live D1 closure, not a reason to expose Kintone/App801 secrets to browser code.

## 6. ALLOWED SOURCE FILES ONLY

- `src/services/mbo-employee-self-gateway.js`
- `tests/mbo-employee-self-gateway.test.js`

No other source/UI changes.
No auth changes.
No D2-D7 work.

## 7. VERIFICATION

Run:

```bash
npm test -- tests/mbo-employee-self-gateway.test.js
npm test -- tests/mbo-password-service.test.js tests/mbo-identity-service.test.js tests/mbo-auth-session-service.test.js tests/mbo-auth-kintone-repository.test.js tests/mbo-activation-service.test.js tests/mbo-employee-self-gateway.test.js
npm test
git diff --check
git status --short
```

## 8. DELIVERY REPORT / COMMIT MESSAGE BODY

Include exact facts in the implementation/evidence commit message body and completion report; do not create a documentation framework.

```text
APP794_MISSING_EMPLOYEE_CODE_FAIL_CLOSED = YES
TRUSTED_SESSION_EMPLOYEE_CODE_CANONICAL_VALIDATION = YES
APP794_APP_ACL_CURRENT = <exact>
APP794_RECORD_ACL_CURRENT = <exact>
APP794_PRIVILEGED_USER_FIELDS = <exact>
APP794_UNSAFE_EMPLOYEE_RULE = <exact>
APP794_ACL_CUTOVER = READY:<exact rules> | BLOCKED_PRIVILEGED_RULES_NOT_PROVEN
APP801_SCHEMA_MANIFEST = EXACT_9_FIELDS
APP801_ACL_CHANGE = NO_CHANGE | <exact reason>
TRUSTED_BACKEND_RUNTIME = <exact runtime> | NOT_AVAILABLE
KINTONE_READS_EXECUTED = N
KINTONE_WRITES_EXECUTED = 0
KINTONE_DEPLOY_EXECUTED = 0
D1C3B_STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW | BLOCKED_WITH_EXACT_EVIDENCE
D1_OVERALL_STATUS = IN_PROGRESS
```

If this closure gate passes independent review, Control Plane will decide/request the exact live App801 schema + runtime + App794 ACL cutover authorization. Antigravity must not self-authorize it.

---

# MANDATORY PROJECT CONTROL — DO NOT DROP

- D1 Login + password change + strict employee data isolation = IN_PROGRESS / D1-A CLOSED / D1-B SOURCE ACCEPTED + UAT ACCESS CHECK RESIDUAL / D1-C1 SOURCE ACCEPTED / D1-C2 EVIDENCE ACCEPTED / D1-C3A PASS / D1-C3B CLOSURE GATE
- D2 Excel + PDF legacy-format export = IN_PROGRESS
- D3 migrate ALL history from Apps 283, 310, 305, 643, 307, 640, 715, 716 into App794 = IN_PROGRESS / WRITE NOT AUTHORIZED
- D4 HR Control Center / App800 end-to-end lifecycle = IN_PROGRESS
- D5 employee copy ONLY own previous planning fields = MUST_FIX
- D6 full E2E / security / regression closure = BLOCKED
- D7 Admin Support Center = PASS / CLOSED
