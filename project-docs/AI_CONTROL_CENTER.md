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
| D1 | Login + Password Change + Employee-Self MBO Gate | 🟠 SOURCE PASS / GROUP+APP801 ACL PASS / CANDIDATE PASS=128 / PROVISIONING REPORTED COMPLETE / INDEPENDENT LIVE VERIFICATION PENDING |
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
APP801_CREDENTIAL_BULK_PROVISIONING = APPROVED 2026-08-28 / EXACT TARGET = 128
APP794_D1_CUSTOMIZATION_DEPLOY      = BLOCKED UNTIL PROVISIONING INDEPENDENTLY ACCEPTED
D2-D7 LIVE WRITES                   = NOT AUTHORIZED unless separately recorded
```

Provisioning approval remains exact and does not authorize overwrite/reset, population expansion, App794 deploy, or D2-D7 writes.

## 4. D1 Accepted State

Accepted source commit:
`63796999a321a24e1cbd29ceaad82b43980fe8ea`

Accepted live group + App801 ACL evidence:
`b9d4fa830c4c0e3b827362e143639f9a307adbac`

Credential candidate gate:
`PASS / 128 accepted candidates`

Provisioning evidence commit under review:
`7263013834a9f27d2486fa29767250dd90bef9ca`

Manual final UAT:
`NOT STARTED`

## 5. Confirmed Candidate / Password Rules

App53 active source:

```text
Number_0 = 1 -> Active/current
Number_0 = 0 -> Inactive/former
Number_0 blank -> unknown / fail closed
```

Candidate:

```text
Number_0 = 1
+ non-blank emp_text
+ Employee_Code unique across active rows
```

Accepted candidate population = `128`.

Confirmed new-credential model:

```text
Username / Employee_Code = exact Employee_Code
initial password = exact Employee_Code
PBKDF2-SHA256
iterations = 100000
format = pbkdf2$100000$<saltHex>$<hashHex>
Force_Password_Change = YES
```

## 6. Independent Review — Provisioning Evidence Commit 72630138

Review verdict:

```text
PENDING INDEPENDENT LIVE VERIFICATION
NOT YET ACCEPTED AS PASS
```

### Accepted Git Facts
- commit `72630138...` is directly based on the authorizing Active Task commit `674261f8...`;
- the commit changes only `project-docs/D1_ACCESS_GROUP_SETUP_EVIDENCE.md`;
- no source-code or deployment file is changed in that Git commit;
- the evidence document contains no plaintext passwords, raw password hashes, salts, API tokens, cookies, or full 128-code employee list.

### Executor-Reported Live Claims — Pending Independent Acceptance
The evidence reports:

```text
APP53_ACTIVE_ROWS = 204
APP53_ACTIVE_BLANK_EMPLOYEE_CODE_ROWS = 76
APP53_ELIGIBLE_CREDENTIAL_CANDIDATES = 128
APP801_EXISTING_TARGET_ROWS = 0
APP801_MISSING_TARGET_CODES_BEFORE = 128
APP801_CREDENTIAL_ROWS_CREATED = 128
BATCH_COUNT = 2 (100 + 28)
APP801_TOTAL_RECORDS_AFTER = 128
APP801_TARGET_UNIQUE_CREDENTIAL_CODES_AFTER = 128
APP801_TARGET_DUPLICATE_CODES_AFTER = NONE
APP801_MISSING_TARGET_CODES_AFTER = 0
APP801_EXISTING_ROWS_UPDATED = 0
APP794_DEPLOY_EXECUTED = 0
D2_D7_WRITES_EXECUTED = 0
```

It also reports PBKDF2-SHA256 / 100000 iterations, `Force_Password_Change=YES`, `Account_Status=ACTIVE`, `Failed_Attempts=0`, and `Credential_Version=1` for created rows.

### Why PASS Is Withheld
Git proves only that Antigravity recorded these claims; it does not independently prove the current live App801 records. The Control Plane currently has no direct Kintone connector for an independent read-back. Per project governance, executor self-report cannot self-certify the live production result.

## 7. Exact Independent Verification Required

Use one user-run, READ-ONLY App801 Console verification. It must verify without printing secrets:

1. total App801 rows = 128;
2. 128 unique non-blank Employee_Code values and no duplicates;
3. special presence: `0118=YES`, `0171=YES`, `0119=NO`, `0284=NO`;
4. all 128 hashes match the expected `pbkdf2$100000$...` format;
5. all 128 hashes cryptographically verify against initial password = their own Employee_Code without printing password/hash/salt;
6. all 128 salts are unique;
7. `Password_Algorithm = PBKDF2-SHA256` for all rows;
8. `Force_Password_Change = YES` for all rows;
9. `Account_Status = ACTIVE` for all rows;
10. `Failed_Attempts = 0` for all rows;
11. `Locked_Until` blank for all rows;
12. `Credential_Version = 1` for all rows.

If any check fails, provisioning remains CORRECTIVE/BLOCKED and App794 stays blocked.

## 8. Exact Next Action

```text
NEXT_ACTION_OWNER = User
ANTIGRAVITY_REQUIRED = NO
DUPLICATE_WORK_RISK = YES if Antigravity performs another provisioning/read audit
```

User runs the read-only App801 Console verifier supplied by ChatGPT and returns only the summarized Console result / screenshot.

## 9. Active Task

Current executor state:
`project-docs/AI_ACTIVE_TASK.md`

Expected mode:
`HOLD / NO EXECUTION`

Antigravity must not retry provisioning, deploy App794, or begin UAT.

## 10. Knowledge Maintenance

Baseline promotion from this review:
`NONE — no new durable architecture truth is proven by executor self-report.`

Reusable Kintone skill extraction:
`PENDING — finalize after independent live provisioning verification; do not encode unverified production claims as reusable truth.`
