# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.  
> Repository: `rebootob/MBO2026`  
> Branch: `ai/antigravity-wp002c`  
> Control Plane: ChatGPT  
> Execution Plane: Antigravity only when actual execution is required  
> Updated: 2026-08-28

## 1. Read Routing

Before opening other project documents, use:
`project-docs/AI_DOCUMENT_INDEX.md`

Permanent governance:
`project-docs/CONFIRMED_BASELINE/AI_OPERATING_GOVERNANCE.md`

Lean document policy:
`project-docs/CONFIRMED_BASELINE/DOCUMENT_CONTROL.md`

Do not browse/read historical project docs by default.

## 2. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|---|
| D1 | Login + Password Change + Employee-Self MBO Gate | 🟠 SOURCE PASS / LIVE GROUP+APP801 ACL PASS / CANDIDATE AUDIT PASS = 128 / BULK PROVISIONING AUTHORIZATION PENDING |
| D2 | Excel + PDF legacy-format export | 🟠 IN PROGRESS |
| D3 | 8 legacy PMS apps -> App794 | 🟠 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | App800 HR Control Center end-to-end | 🟠 IN PROGRESS |
| D5 | Copy own previous MBO only | 🔴 MUST FIX |
| D6 | Integrated E2E / Security / Regression | 🔴 BLOCKED |
| D7 | Admin Support Center | ✅ PASS / CLOSED |

No AI may silently drop D1–D7.

## 3. Authorization Ledger

```text
D1_SOURCE_IMPLEMENTATION            = APPROVED / SOURCE ACCEPTED
D1_LIVE_CUTOVER                     = APPROVED
DEDICATED_MBO_ACCESS_GROUP_MODEL    = APPROVED
APP801_GROUP_ACL_MODEL              = APPROVED / LIVE RECONCILED
D1_CREDENTIAL_CANDIDATE_RULE        = ACCEPTED / BASELINED
D1_CANDIDATE_USER_EXPORT_AUDIT      = PASS / 128 ACCEPTED CANDIDATES
APP801_CREDENTIAL_BULK_PROVISIONING = NOT AUTHORIZED YET
APP794_D1_CUSTOMIZATION_DEPLOY      = WAITING CREDENTIAL GATE / DO NOT EXECUTE YET
D2-D7 LIVE WRITES                   = NOT AUTHORIZED unless separately recorded
```

Do not repeatedly ask for the same unchanged approval.
New approval is required only when scope/risk materially changes or a new production-impacting write is introduced.

## 4. D1 Accepted State

Accepted source commit:
`63796999a321a24e1cbd29ceaad82b43980fe8ea`

Live group + App801 ACL corrective evidence accepted:
`b9d4fa830c4c0e3b827362e143639f9a307adbac`

Credential-candidate rule Baseline:
`project-docs/CONFIRMED_BASELINE/D1_AUTH_SECURITY.md`

App53 active-status semantics Baseline:
`project-docs/CONFIRMED_BASELINE/EMPLOYEE_MASTER_ROUTING.md`

Source status:
`PASS / ACCEPTED`

Live cutover status:
`IN PROGRESS / GROUP+ACL PASS / CANDIDATE GATE PASS / PROVISIONING NOT YET AUTHORIZED`

Manual final UAT:
`NOT STARTED`

## 5. Confirmed App53 Active Status Semantics

User-confirmed on 2026-08-28:

```text
Field Code = Number_0
Label      = Status
Type       = NUMBER
1          = Active / current employee
0          = Inactive / former employee
blank      = unknown / not accepted as Active
```

The Kintone system field code `Status` is not the employee Active/Inactive source.

## 6. Accepted Credential Candidate Rule

Candidate =

```text
App53 Number_0 = 1
+ non-blank Employee_Code (emp_text)
+ Employee_Code unique across active rows
```

Additional rules:
- Employee_Code is a string identifier; no numeric-only rule.
- `Number_0 = 0` is excluded.
- blank `Number_0` fails closed.
- blank `emp_text` is excluded.
- duplicate Employee_Code across active rows excludes all conflicting active rows.
- absent Employee_Code must not receive a synthetic credential.

## 7. Accepted User-Provided App53 Audit — 2026-08-28

The user supplied a current read-only App53 CSV directly to ChatGPT. ChatGPT independently recalculated the candidate population from the file and the user confirmed the business meaning of `Number_0`.

Observed data:

```text
APP53_TOTAL_ROWS = 281
APP53_ACTIVE_ROWS = 204
APP53_INACTIVE_ROWS = 75
APP53_UNKNOWN_STATUS_ROWS = 2
TOTAL_BLANK_EMP_TEXT_ROWS = 79
APP53_ACTIVE_BLANK_EMPLOYEE_CODE_ROWS = 76
APP53_ACTIVE_NONBLANK_ROWS = 128
APP53_DUPLICATE_ACTIVE_CODES = NONE
APP53_DUPLICATE_ACTIVE_ROWS_EXCLUDED = 0
APP53_ELIGIBLE_CREDENTIAL_CANDIDATES = 128
```

Accepted exception handling:

```text
50.03  = ELIGIBLE
50.02  = ELIGIBLE
0050_2 = ELIGIBLE
0118   = ELIGIBLE
0119   = NOT_FOUND / no credential
9000   = duplicated only on inactive rows / no active conflict
0284   = Number_0 blank / NOT ELIGIBLE until source status is resolved
```

Second isolation-UAT employee code:

```text
0171 = ELIGIBLE
```

The earlier expected count `200` is superseded and rejected. It incorrectly treated all 281 App53 rows as active.

No full employee list or personal details are committed to Git.

## 8. Remaining D1 Gate

Before any App801 credential write:

1. obtain explicit user authorization for App801 bulk credential provisioning for the accepted 128-candidate population;
2. after authorization, perform a narrow pre-write App801 read-back/reconciliation so existing credential rows are not duplicated or overwritten blindly;
3. create only the required missing credentials using the confirmed D1 password model;
4. immediate post-write read-back and sanitized evidence;
5. independently review provisioning before App794 customization deploy;
6. App794 deploy remains blocked until credential provisioning is accepted;
7. final D1 closure still requires manual UI UAT.

## 9. Exact Next Action

```text
NEXT_ACTION_OWNER = User
ANTIGRAVITY_REQUIRED = NO
DUPLICATE_WORK_RISK = YES if candidate audit is repeated
```

Waiting for exact authorization decision:

```text
APP801_CREDENTIAL_BULK_PROVISIONING = APPROVE | DO_NOT_APPROVE
TARGET_POPULATION = 128 accepted active unique Employee_Code candidates
```

Until approval, Antigravity remains stopped and no Kintone credential writes are allowed.

## 10. Active Task

Current executor state:
`project-docs/AI_ACTIVE_TASK.md`

Expected mode now:
`HOLD / WAITING USER PROVISIONING AUTHORIZATION`

## 11. Knowledge Maintenance

Baseline promotion this cycle:
- `CONFIRMED_BASELINE/EMPLOYEE_MASTER_ROUTING.md` — confirmed `Number_0` active/inactive semantics.
- `CONFIRMED_BASELINE/D1_AUTH_SECURITY.md` — D1 candidate rule bound to the confirmed App53 active-status field.

Skill extraction:
`NONE REQUIRED — this cycle confirms project-specific source semantics rather than a new reusable Kintone technique.`
