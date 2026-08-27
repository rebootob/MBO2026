# AI ACTIVE TASK — D1-C3B FINAL CORRECTIVE: QUERY-SAFE EMPLOYEE GATEWAY + EXACT CUTOVER FACTS

> Control Plane: ChatGPT
> Execution Plane: Antigravity
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Reviewed implementation: `f9258223a16849fa87965b00325d2eaf05dbb460`
> Mode: MINIMUM D1 SECURITY CORRECTIVE + READ-ONLY CUTOVER FACTS / NO KINTONE WRITE / NO DEPLOY / NO UI

## 0. INDEPENDENT REVIEW RESULT

Accepted from `f9258223...`:
- source scope is small: new employee-self gateway + focused tests only;
- trusted principal is resolved through the accepted auth service;
- employeeCode is derived from trusted session, not a browser employee selector;
- App794 queries include employee scope;
- technical admin / invalid session denial structure exists;
- no Kintone write or deploy occurred.

D1-C3B is NOT accepted yet because the following concrete runtime/security blockers remain.

## 1. B1 — BROWSER QUERY INPUT CAN ALTER KINTONE QUERY LOGIC

Current gateway interpolates browser-supplied `fiscalYear` and `recordId` directly into Kintone query strings.

This can allow quote/operator injection and can weaken the intended `Employee_Code = session.employeeCode` scope.

### Required correction

- `fiscalYear`, when supplied, must be validated against the canonical MBO fiscal-year contract `^FY\d{4}$` (case-insensitive is acceptable, normalize to uppercase). Reject anything else before any Kintone call.
- `recordId` must normalize to a positive integer-string only: `^\d+$`. Reject quotes, spaces, operators, decimals, signs, or other characters before any Kintone call.
- Never interpolate unvalidated browser-controlled query fragments.
- Employee_Code remains trusted-session-only and must satisfy the existing canonical Employee Code rules.

Add focused tests proving malicious fiscalYear / recordId strings cannot change query scope and result in `INVALID_ARGUMENT` with zero Kintone call.

## 2. B2 — APP53 LOOKUP DOES NOT USE THE CANONICAL APP53 CONTRACT

Current gateway queries:

```text
emp_text = "<code>" OR Employee_Code = "<code>"
```

But the accepted `EmployeeService` proves App53 canonical Employee Code is `emp_text`, with numeric fallback through field `Number`. `Employee_Code` is a normalized domain field, not the canonical App53 field code.

### Required correction

Reuse `EmployeeService.lookupEmployee(employeeCode, kintoneApiAdapter)` instead of duplicating App53 identity logic.

Create only a tiny adapter over the gateway transport if needed:

```text
getRecords(appId, query) -> trusted server transport GET
```

Benefits required:
- App53 canonical `emp_text` / `Number` query behavior reused;
- exactly-one and canonical identity consistency reused;
- Employee Self receives the canonical safe employee snapshot, not the whole raw App53 record.

Do NOT modify `EmployeeService` unless a proven incompatibility exists.

## 3. B3 — RAW APP794 RECORD CAN LEAK CONFIDENTIAL EMPLOYEE-HIDDEN FIELDS

Current `_sanitizeRecord()` removes only auth hashes/secrets and otherwise returns the full App794 record.

The repository already defines `CONFIDENTIAL_FIELDS` in `src/config/constants.js`, including Manager/GM scores/comments, weighted scores, final confidential score and grade.

### Required correction

For every App794 record returned through Employee Self:
- strip ALL field codes in existing `CONFIDENTIAL_FIELDS`;
- strip Password/Activation/Session/TOTP/recovery secrets as already intended;
- verify returned `Employee_Code.value` exactly equals trusted `session.employeeCode` before returning it;
- if an App794 response contains a mismatched or missing Employee_Code where a record is expected, fail closed and return no record data.

Apply this to:
- bootstrap current record;
- history list;
- direct record lookup.

Do not invent a second confidential-field list. Reuse `CONFIDENTIAL_FIELDS`.

## 4. REQUIRED TESTS — ONLY NEW RISKS

Add focused tests only for:
1. invalid/malicious fiscalYear rejected before Kintone call;
2. invalid/malicious recordId rejected before Kintone call;
3. App53 bootstrap reuses canonical EmployeeService behavior (`emp_text` / `Number`) and returns canonical employee snapshot;
4. App794 confidential fields are absent from bootstrap/history/direct-record responses;
5. App794 response with Employee_Code different from session employee fails closed;
6. existing 0118 -> 0119 direct-record denial remains passing.

Keep existing gateway/auth tests passing. Do not duplicate broad D1 tests.

## 5. EXACT CUTOVER FACTS — COMPLETE THE PART MISSED IN THE FIRST C3B COMMIT

No live changes. Use only minimum READ-ONLY Kintone GETs, preferably <= 3, to freeze App794 cutover facts if current repo evidence is not sufficient.

Read only as needed:
- App794 form fields relevant to Requester/Appraiser/Approver access;
- App794 App ACL;
- App794 Record ACL.

Report exact current field/principal codes. Do not invent HR groups/users.

Required output:

```text
APP794_APP_ACL_CURRENT = <exact entities/rights>
APP794_RECORD_ACL_CURRENT = <exact rules or NONE>
APP794_PRIVILEGED_USER_FIELDS = <exact existing Requester/Appraiser/Approver field codes>
APP794_ACL_CUTOVER = READY:<exact proposed preserve/deny rules> | BLOCKED_PRIVILEGED_RULES_NOT_PROVEN
```

Known unsafe employee rule must remain identified:

```text
GROUP everyone direct App794 view/query access = UNSAFE
```

Do NOT execute ACL changes yet.

## 6. APP801 EXACT SCHEMA MANIFEST — PLAN ONLY

Freeze exactly these 9 additions for the later authorized schema package:

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

`APP801_ACL_CHANGE = NO_CHANGE` unless a new exact read proves otherwise.

Do NOT add credential-level Kintone_User_Code as identity proof.

## 7. TRUSTED RUNTIME FACT

Do not create hosting in this package.

If no actual server host/runtime has been configured, report:

```text
TRUSTED_BACKEND_RUNTIME = NOT_AVAILABLE
```

Required future runtime remains:
- Node server-side process;
- privileged App801/App794 Kintone credential/token server-side only;
- opaque HttpOnly/Secure session boundary;
- Employee Self browser uses gateway, never direct unrestricted App794 REST.

## 8. ALLOWED FILES / SCOPE

Preferred source changes only:
- `src/services/mbo-employee-self-gateway.js`
- `tests/mbo-employee-self-gateway.test.js`

Existing imports from `EmployeeService`, `CONFIDENTIAL_FIELDS`, and fiscal-year/employee validation utilities are allowed.

No auth changes.
No UI changes.
No App794 writes.
No App801 writes/schema changes.
No ACL changes.
No deploy.
No D2-D7 implementation.
No generic framework/refactor.

## 9. VERIFICATION

Run:

```bash
npm test -- tests/mbo-employee-self-gateway.test.js
npm test -- tests/mbo-password-service.test.js tests/mbo-identity-service.test.js tests/mbo-auth-session-service.test.js tests/mbo-auth-kintone-repository.test.js tests/mbo-activation-service.test.js tests/mbo-employee-self-gateway.test.js
npm test
git diff --check
git status --short
```

No CI claim without GitHub CI evidence.

## 10. DELIVERY REPORT

Report:

```text
EMPLOYEE_SELF_GATEWAY = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW | BLOCKED:<reason>
QUERY_INPUT_VALIDATION = PASS_PENDING_REVIEW
APP53_CANONICAL_LOOKUP = REUSED_EMPLOYEE_SERVICE
APP794_RETURN_SCOPE_VERIFY = PASS_PENDING_REVIEW
APP794_CONFIDENTIAL_FILTER = REUSED_CONFIDENTIAL_FIELDS

APP801_SCHEMA_MANIFEST = EXACT_9_FIELDS
APP801_ACL_CHANGE = NO_CHANGE | <exact reason>
APP794_APP_ACL_CURRENT = <exact>
APP794_RECORD_ACL_CURRENT = <exact>
APP794_PRIVILEGED_USER_FIELDS = <exact>
APP794_ACL_CUTOVER = READY:<exact rules> | BLOCKED_PRIVILEGED_RULES_NOT_PROVEN
TRUSTED_BACKEND_RUNTIME = <exact runtime> | NOT_AVAILABLE

KINTONE_READS_EXECUTED = N
KINTONE_WRITES_EXECUTED = 0
KINTONE_DEPLOY_EXECUTED = 0
D1C3B_CORRECTIVE = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW | BLOCKED_WITH_EXACT_EVIDENCE
D1_OVERALL_STATUS = IN_PROGRESS
```

If this passes independent review, Control Plane decides the exact one-time live schema/runtime/ACL authorization package. Do not self-authorize live cutover.

---

# MANDATORY PROJECT CONTROL — DO NOT DROP

- D1 Login + password change + strict employee data isolation = IN_PROGRESS / D1-A CLOSED / D1-B SOURCE ACCEPTED + UAT ACCESS CHECK RESIDUAL / D1-C1 SOURCE ACCEPTED / D1-C2 EVIDENCE ACCEPTED / D1-C3A PASS / D1-C3B CORRECTIVE
- D2 Excel + PDF legacy-format export = IN_PROGRESS
- D3 migrate ALL history from Apps 283, 310, 305, 643, 307, 640, 715, 716 into App794 = IN_PROGRESS / WRITE NOT AUTHORIZED
- D4 HR Control Center / App800 end-to-end lifecycle = IN_PROGRESS
- D5 employee copy ONLY own previous planning fields = MUST_FIX
- D6 full E2E / security / regression closure = BLOCKED
- D7 Admin Support Center = PASS / CLOSED
