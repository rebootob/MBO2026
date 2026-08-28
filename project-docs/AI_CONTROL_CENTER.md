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
| D1 | Login + Password Change + Employee-Self MBO Gate | 🟠 SOURCE PASS / LIVE GROUP+APP801 ACL PASS / CANDIDATE RULE ACCEPTED / USER APP53 EXPORT AUDITED / ACTIVE FIELD SEMANTICS CONFIRMATION PENDING |
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
D1_CANDIDATE_USER_EXPORT_AUDIT      = COMPLETED / PROVISIONAL UNTIL ACTIVE FIELD SEMANTICS CONFIRMED
APP801_CREDENTIAL_BULK_PROVISIONING = NOT AUTHORIZED YET
APP794_D1_CUSTOMIZATION_DEPLOY      = WAITING CURRENT GATE / DO NOT EXECUTE YET
D2-D7 LIVE WRITES                   = NOT AUTHORIZED unless separately recorded
```

Do not repeatedly ask for the same unchanged approval.
New approval is required only when scope/risk materially changes or a new production-impacting write is introduced.

## 4. D1 Accepted State

Accepted source commit:
`63796999a321a24e1cbd29ceaad82b43980fe8ea`

Live group + App801 ACL corrective evidence accepted:
`b9d4fa830c4c0e3b827362e143639f9a307adbac`

Credential-candidate Baseline update:
`b7e3115442cfc9204c2a2d2331e8ea30389d3e72`

Durable D1 truth:
`project-docs/CONFIRMED_BASELINE/D1_AUTH_SECURITY.md`

Source status:
`PASS / ACCEPTED`

Live cutover status:
`IN PROGRESS / GROUP+ACL GATE PASS / USER EXPORT CANDIDATE AUDIT PROVISIONAL`

Manual final UAT:
`NOT STARTED`

## 5. Accepted Credential Candidate Rule

App53 remains the employee source of truth.

A credential candidate must be:

```text
ACTIVE App53 row
+ non-blank Employee_Code (emp_text)
+ Employee_Code unique across active App53 rows
```

Accepted handling:
- Employee_Code is an identifier string; no numeric-only rule.
- `50.03`, `50.02`, `0050_2` are not excluded merely because of punctuation/underscore.
- blank `emp_text` rows are excluded until App53 is corrected.
- duplicate active Employee_Code fails closed for all conflicting rows; do not silently select/deduplicate one row.
- an absent Employee_Code such as `0119` must not receive a synthetic credential.

## 6. User-Provided App53 Export Audit — 2026-08-28

The user exported current App53 data read-only and supplied the CSV directly to ChatGPT. This supersedes the planned Antigravity read-only candidate audit and avoids duplicate execution.

Export columns:

```text
$id
emp_text
Text_2
Status
Number_0
```

Observed current data:

```text
APP53_TOTAL_ROWS = 281
STATUS_FIELD_BLANK_ROWS = 281
NUMBER_0_VALUE_1_ROWS = 204
NUMBER_0_VALUE_0_ROWS = 75
NUMBER_0_BLANK_ROWS = 2
TOTAL_BLANK_EMP_TEXT_ROWS = 79
```

If and only if live field `Number_0` is confirmed to be the Active/Inactive field with `1 = Active`, then the candidate audit result is:

```text
APP53_ACTIVE_ROWS = 204
APP53_ACTIVE_BLANK_EMPLOYEE_CODE_ROWS = 76
APP53_ACTIVE_NONBLANK_ROWS = 128
APP53_DUPLICATE_ACTIVE_CODES = NONE
APP53_DUPLICATE_ACTIVE_ROWS_EXCLUDED = 0
APP53_ELIGIBLE_CREDENTIAL_CANDIDATES = 128
```

Special-code observations under the same `Number_0=1` assumption:

```text
50.03  = present / Number_0=1 / unique
50.02  = present / Number_0=1 / unique
0050_2 = present / Number_0=1 / unique
0118   = present / Number_0=1 / unique
0119   = not present
```

Duplicate code `9000` exists on two rows, but both rows have `Number_0=0`; therefore it is not an active-code conflict if `Number_0=1` is confirmed as Active.

One non-blank code `0284` has `Number_0` blank and must fail closed until its active/inactive state is known.

Potential second isolation-UAT code from the export:

```text
0171
```

It is unique, non-blank, ordinary/non-executive, and has `Number_0=1`; eligibility remains conditional on confirming `Number_0=1` means Active.

The earlier expected count `200` is rejected as unsupported by the user export; it incorrectly treated all 281 App53 rows as active and treated inactive duplicate `9000` rows as an active conflict.

## 7. Remaining D1 Gate

Before any credential write:

1. confirm exact live field label/type for `Number_0` and exact meaning of values `1` / `0`;
2. if `Number_0=1` is confirmed Active, accept the 128-person candidate set above;
3. decide/resolve the one non-blank row `0284` whose `Number_0` is blank;
4. after ChatGPT accepts the candidate audit, obtain/record separate authorization for App801 bulk credential provisioning;
5. App794 deploy remains blocked until provisioning is safely completed and reviewed.

## 8. Exact Next Action

```text
NEXT_ACTION_OWNER = User
ANTIGRAVITY_REQUIRED = NO
DUPLICATE_WORK_RISK = YES if Antigravity runs the superseded candidate audit
```

Next action:
- user runs one read-only console schema check for App53 field `Number_0`;
- return field code + label + type only;
- ChatGPT then finalizes the candidate count without Antigravity.

## 9. Active Task

Current executor state:
`project-docs/AI_ACTIVE_TASK.md`

Expected mode now:
`HOLD / WAITING USER APP53 FIELD CONFIRMATION`

## 10. Knowledge Maintenance

Baseline promotion:
`NONE — candidate eligibility rule is already baselined; current App53 counts are operational evidence.`

Skill extraction:
`NONE REQUIRED — user-provided read-only export replaced an unnecessary executor audit.`
