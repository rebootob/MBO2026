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
| D1 | Login + Password Change + Employee-Self MBO Gate | 🟠 SOURCE PASS / LIVE GROUP+APP801 ACL PASS / CANDIDATE AUDIT PASS = 128 / BULK PROVISIONING APPROVED + EXECUTION NEXT |
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
APP801_CREDENTIAL_BULK_PROVISIONING = APPROVED 2026-08-28 / EXACT TARGET POPULATION = 128 ACCEPTED CANDIDATES
APP794_D1_CUSTOMIZATION_DEPLOY      = WAITING CREDENTIAL GATE / DO NOT EXECUTE YET
D2-D7 LIVE WRITES                   = NOT AUTHORIZED unless separately recorded
```

Approval scope is exact:
- authorize App801 credential provisioning for the already accepted 128-candidate population only;
- safe create-only reconciliation is required;
- do not overwrite/reset existing App801 credential rows;
- do not expand the population if App53 has changed;
- no App794 deploy is included in this approval;
- no D2-D7 write is included.

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
`IN PROGRESS / GROUP+ACL PASS / CANDIDATE GATE PASS / PROVISIONING APPROVED / EXECUTION PENDING`

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

## 8. Approved Provisioning Safety Gates

Before the first App801 credential write, Antigravity must:

1. minimally live-read App53 fields needed to regenerate the candidate set in memory (`emp_text`, `Number_0`, record identity only if needed);
2. require the current live candidate count and rules to still resolve to exactly the accepted 128 population; if not, STOP with zero credential writes;
3. minimally read App801 existing credential identities using `Employee_Code` and non-secret metadata only; do not retrieve/render raw `Password_Hash` unless technically unavoidable;
4. fail closed on duplicate App801 rows for any target Employee_Code;
5. classify target population into existing unique rows vs missing rows;
6. preserve every existing credential row — NO overwrite, reset, rehash, password change, or account-state modification under this authorization;
7. create only missing credential rows;
8. use the confirmed password model for each newly created row:
   - Username/Employee_Code = exact Employee_Code string;
   - initial password = exact Employee_Code string;
   - PBKDF2-SHA256, iterations 100000;
   - stored hash format `pbkdf2$100000$<saltHex>$<hashHex>`;
   - unique cryptographically random salt per new credential;
   - `Force_Password_Change = YES`;
   - never persist/log/commit plaintext password;
   - never commit raw password hashes to Git;
9. verify exact live App801 schema/options immediately before creation; if a required non-secret field value (for example Account_Status/Password_Algorithm/default version semantics) cannot be proven from the live schema + confirmed implementation model, STOP before writing rather than inventing a value;
10. immediate post-write read-back by Employee_Code only plus non-secret metadata;
11. evidence must contain counts/status only — no full employee list, plaintext, salts, or hashes.

Maximum executor status remains:
`IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`

## 9. Remaining D1 Gate

After provisioning execution:

1. ChatGPT independently reviews provisioning evidence;
2. App794 customization deploy remains blocked until provisioning is accepted;
3. final D1 closure still requires manual UI UAT.

## 10. Exact Next Action

```text
NEXT_ACTION_OWNER = Antigravity
ANTIGRAVITY_REQUIRED = YES
DUPLICATE_WORK_RISK = NO
```

Execute exactly one narrow App801 create-only provisioning packet according to `project-docs/AI_ACTIVE_TASK.md`, commit sanitized evidence, then STOP.

## 11. Active Task

Current executor instruction:
`project-docs/AI_ACTIVE_TASK.md`

Expected executor maximum status:
`IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`

## 12. Knowledge Maintenance

Baseline promotion this cycle:
`NONE — user authorization is operational scope, not a new durable architecture rule.`

Skill extraction:
`NONE YET — extract only after independent review of actual provisioning execution.`
