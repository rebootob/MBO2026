# AI ACTIVE TASK — D1-C3B TRUSTED EMPLOYEE-SELF DATA GATEWAY + EXACT CUTOVER MANIFEST

> Control Plane: ChatGPT
> Execution Plane: Antigravity
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Independently reviewed implementation: `0bec4f4d4408c7cc7dcba1ddd7be90dcafb282ef`
> Mode: FASTEST SAFE PATH / MINIMUM SERVER-SIDE DATA BOUNDARY / NO LIVE KINTONE WRITE OR DEPLOY

## 0. INDEPENDENT REVIEW RESULT — D1-C3A ACCEPTED

Accepted from `0bec4f4d...` by source review:
- explicit `SHARED_KINTONE_SECONDARY_AUTH` mode exists;
- shared outer Kintone principal no longer requires impossible one-user-to-one-Employee_Code mapping in that explicit mode;
- MBO password remains mandatory and server-side;
- `Must_Change_Password === true` requires activation store + provisioned valid code + successful consume before restricted session issue;
- activation mismatch/replay/expired/wrong code fail closed;
- activation generation is 8 random bytes = 64-bit entropy / 16 uppercase hex chars;
- technical admin remains blocked;
- App801 repository enforces exact Employee_Code lookup and duplicate fail-closed;
- no live Kintone write/deploy occurred.

GitHub has no CI/status evidence for this commit. Do NOT claim CI PASS.

Minor test gaps (missing-capability test can fail earlier at credentialStore gate; no isolated consume-failure test) are NOT a reason to reopen C3A. Keep them for D6 regression unless a concrete runtime defect appears.

Classification:

```text
D1C3A_SOURCE = PASS / ACCEPTED
D1_OVERALL = IN_PROGRESS
```

## 1. FROZEN EMPLOYEE SELF UX/SECURITY RULE

After MBO authentication succeeds, the trusted session owns exactly one Employee_Code.

Employee Self-Service MUST NOT ask the employee to type/select Employee ID again.

Canonical flow:

```text
MBO login
 -> trusted session.employeeCode
 -> App53 employee facts for session.employeeCode
 -> App794 current/history only for session.employeeCode
```

Browser-supplied Employee_Code is never an authorization input.

Copy Previous, Export, History, direct record lookup and future write operations must all derive Employee_Code from the trusted session.

## 2. GOAL — ONE SMALL TRUSTED DATA BOUNDARY

Implement ONLY the server-side employee-self read gateway contract needed to prove D1 isolation after login.

Preferred new source:
- `src/services/mbo-employee-self-gateway.js`
- `tests/mbo-employee-self-gateway.test.js`

Reuse existing auth/session and Kintone transport patterns. Do NOT create a generic web framework, router framework or UI.

### Required server-only API/service behavior

A minimal class/service may expose equivalent methods:

```text
getEmployeeSelfBootstrap({ sessionToken, fiscalYear })
listOwnMboHistory({ sessionToken })
getOwnMboRecord({ sessionToken, recordId })
```

Rules:
1. Resolve principal ONLY by `MboAuthSessionService.getAuthenticatedPrincipal(sessionToken)` or injected equivalent trusted principal resolver.
2. Missing/expired/force-change/non-data-authorized session => deny.
3. Derive `employeeCode` ONLY from trusted principal.
4. App53 is READ ONLY. Query exact Employee_Code and fail closed on zero/duplicate active identity ambiguity.
5. App794 query must ALWAYS include exact `Employee_Code = session.employeeCode` scope.
6. `getOwnMboRecord(recordId)` must fetch/verify both recordId AND Employee_Code scope; record id alone is never sufficient.
7. Employee 0118 session cannot read/list/bootstrap 0119 even if browser sends/changes recordId, fiscal year, URL or query values.
8. Never return credential/session hashes or confidential fields that employee is not allowed to see.
9. No employeeCode selector/input is part of the employee-self service contract.
10. Transport is dependency-injected and server-only; tests must not call live Kintone.

Do NOT implement App794 writes in this package.
Do NOT implement D2 export or D5 copy here.

## 3. MINIMUM TESTS ONLY

Prove at minimum:
1. authenticated 0118 bootstrap queries App53/App794 with 0118 from session, not caller input;
2. 0118 history returns only 0118 query scope;
3. 0118 direct recordId lookup uses `recordId AND Employee_Code=0118` and cannot expose 0119;
4. missing/expired/non-data-authorized principal denied;
5. duplicate App53 employee identity fails closed;
6. gateway has no employeeCode request parameter used for authorization;
7. sanitized result contains no Password_Hash, Activation_Code_Hash, Session_Token_Hash;
8. technical admin/non-employee-self principal cannot use employee-self gateway.

Do not duplicate broad auth tests already accepted.

## 4. EXACT APP801 SCHEMA CUTOVER MANIFEST — PLAN ONLY

No live schema change yet.

Freeze the required App801 additions as ONE exact list unless current source contract proves otherwise:

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

Do NOT add credential-level `Kintone_User_Code` as employee identity proof.
App801 ACL remains current deny-all for GROUP everyone unless exact evidence requires otherwise.

## 5. APP794 DIRECT-ACCESS CUTOVER MANIFEST — READ ONLY / EXACT FACTS

Known accepted fact:

```text
APP794_APP_ACL = CREATOR full access; GROUP everyone view/add/edit/delete
APP794_RECORD_ACL = NONE
DIRECT_EMPLOYEE_ACCESS = UNSAFE
```

D1 cannot close while shared employee browser can directly read/query arbitrary App794 records.

Use minimum READ-ONLY Kintone GETs only if necessary to identify exact existing App794 fields/entities that can preserve legitimate HR/appraiser/approver access during cutover.

Report exact:
- authoritative App794 user/user-selection field codes for Appraiser/Approver access, if they exist;
- exact HR/group/user principal codes already proven in configuration, if any;
- whether a record-permission design can deny shared/general employee direct records while preserving legitimate privileged users;
- if exact privileged rule cannot yet be proven, state `APP794_ACL_CUTOVER = BLOCKED_PRIVILEGED_RULES_NOT_PROVEN` rather than guessing.

Do NOT execute ACL change.
Do NOT invent HR group/user codes.

## 6. TRUSTED RUNTIME CUTOVER FACT

Existing evidence says:

`TRUSTED_BACKEND_RUNTIME = NOT_AVAILABLE`

Do not create/deploy hosting in this package.

Provide the minimum portable runtime contract only:
- Node server-side process;
- App801/App794 privileged Kintone credential/API token stays server-side;
- opaque HttpOnly/Secure session cookie at the eventual HTTP boundary;
- employee browser calls gateway, not App794 REST directly.

If no actual host is configured, keep:

`TRUSTED_BACKEND_RUNTIME = NOT_AVAILABLE`

This is an operational deployment blocker, not permission to move secrets into browser JS.

## 7. REQUIRED DELIVERY REPORT

Report exactly:

```text
D1C3A_SOURCE = PASS_ACCEPTED
EMPLOYEE_SELF_GATEWAY = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW | BLOCKED:<reason>
EMPLOYEE_CODE_SOURCE = TRUSTED_SESSION_ONLY
APP53_EMPLOYEE_LOOKUP = IMPLEMENTED | BLOCKED
APP794_OWN_SCOPE_QUERY = IMPLEMENTED | BLOCKED
APP794_DIRECT_RECORD_SCOPE = IMPLEMENTED | BLOCKED

APP801_SCHEMA_MANIFEST = EXACT_9_FIELDS_ABOVE | CORRECTED_WITH_REASON
APP801_ACL_CHANGE = NO_CHANGE | <exact proposed change>
APP794_ACL_CUTOVER = READY:<exact rules> | BLOCKED_PRIVILEGED_RULES_NOT_PROVEN
TRUSTED_BACKEND_RUNTIME = <exact runtime> | NOT_AVAILABLE

KINTONE_READS_EXECUTED = N
KINTONE_WRITES_EXECUTED = 0
KINTONE_DEPLOY_EXECUTED = 0
D1C3B_STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW | BLOCKED_WITH_EXACT_EVIDENCE
D1_OVERALL_STATUS = IN_PROGRESS
```

## 8. VERIFICATION

Run only relevant tests plus full regression:

```bash
npm test -- tests/mbo-employee-self-gateway.test.js
npm test -- tests/mbo-auth-session-service.test.js tests/mbo-auth-kintone-repository.test.js tests/mbo-employee-self-gateway.test.js
npm test
git diff --check
git status --short
```

No CI claim without GitHub evidence.

## 9. ABSOLUTE OUT OF SCOPE

- no live App801 schema write
- no App801 credential provisioning
- no App794 record/schema/ACL write
- no Kintone deploy
- no hosting/deployment framework
- no UI changes
- no App800 activation UI
- no D2 export implementation
- no D3 migration write
- no D4 lifecycle work
- no D5 copy implementation
- no D6 broad E2E yet
- no D7 changes
- no unrelated refactor/docs cleanup

---

# MANDATORY PROJECT CONTROL — DO NOT DROP

- D1 Login + password change + strict employee data isolation = IN_PROGRESS / D1-A CLOSED / D1-B SOURCE ACCEPTED + UAT ACCESS CHECK RESIDUAL / D1-C1 SOURCE ACCEPTED / D1-C2 EVIDENCE ACCEPTED / D1-C3A SOURCE PASS / D1-C3B THIS TASK
- D2 Excel + PDF legacy-format export = IN_PROGRESS
- D3 migrate ALL history from Apps 283, 310, 305, 643, 307, 640, 715, 716 into App794 = IN_PROGRESS / WRITE NOT AUTHORIZED
- D4 HR Control Center / App800 end-to-end lifecycle = IN_PROGRESS
- D5 employee copy ONLY own previous planning fields = MUST_FIX
- D6 full E2E / security / regression closure = BLOCKED
- D7 Admin Support Center = PASS / CLOSED
