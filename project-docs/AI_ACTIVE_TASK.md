# AI ACTIVE TASK — D1 READ-ONLY — CREDENTIAL CANDIDATE LIVE AUDIT

> Read `project-docs/AI_CONTROL_CENTER.md` FIRST.  
> Execution Plane: Antigravity  
> Branch: `ai/antigravity-wp002c`  
> Mode: **ONE NARROW READ-ONLY AUDIT ONLY**

## 0. Scope / Authorization

This task is READ-ONLY.

It authorizes no Kintone write and no deployment.

Strictly forbidden:
- NO App801 credential create/update/reset;
- NO App794 customization upload/deploy;
- NO App53/795/796 write;
- NO group/ACL change;
- NO source-code change;
- NO D2-D7 work.

## 1. Read Only These Project Inputs

1. `project-docs/AI_CONTROL_CENTER.md`
2. this `project-docs/AI_ACTIVE_TASK.md`
3. `project-docs/CONFIRMED_BASELINE/D1_AUTH_SECURITY.md`

Do not scan the repository or historical documents.

## 2. Live App53 Read — Required

Read current App53 employee data and the minimum live schema needed to identify:
- Employee_Code source field (`emp_text`);
- Active/Inactive field and the exact live value meaning Active;
- record identity only as needed to distinguish duplicate rows.

Do not modify App53.
Do not export unrelated employee data into Git.
Do not commit full employee lists, personal details, tokens, cookies, or credentials.

## 3. Apply the Confirmed Candidate Rule Exactly

Candidate =

```text
current/Active App53 row
+ non-blank emp_text
+ emp_text unique across active App53 rows
```

Rules:
- Employee_Code is a string identifier; DO NOT impose numeric-only validation.
- `50.03`, `50.02`, `0050_2` remain eligible if Active + non-blank + unique.
- blank `emp_text` = excluded.
- when one Employee_Code appears on 2+ active rows, exclude ALL conflicting active rows for that code; do not choose/deduplicate one row.
- absent employee code = not a candidate; do not invent a replacement identity.

## 4. Required Audit Results

Produce sanitized evidence only:

```text
APP53_ACTIVE_ROWS = <count>
APP53_BLANK_EMPLOYEE_CODE_ROWS = <count>
APP53_DUPLICATE_ACTIVE_CODES = <code:row_count only>
APP53_DUPLICATE_ACTIVE_ROWS_EXCLUDED = <count>
APP53_ELIGIBLE_CREDENTIAL_CANDIDATES = <count>

SPECIAL_50_03 = ELIGIBLE|NOT_ELIGIBLE|NOT_FOUND + reason
SPECIAL_50_02 = ELIGIBLE|NOT_ELIGIBLE|NOT_FOUND + reason
SPECIAL_0050_2 = ELIGIBLE|NOT_ELIGIBLE|NOT_FOUND + reason
CANDIDATE_0118 = ELIGIBLE|NOT_ELIGIBLE|NOT_FOUND + reason
CANDIDATE_0119 = ELIGIBLE|NOT_ELIGIBLE|NOT_FOUND + reason
```

Expected from prior evidence, but DO NOT force-match it:

```text
EXPECTED_ACTIVE_ROWS = 281
EXPECTED_BLANK_ROWS = 79
EXPECTED_DUPLICATE_CODE = 9000 with 2 active rows
EXPECTED_ELIGIBLE_CANDIDATES = 200
```

If live data differs, report the live truth exactly.

## 5. Second Isolation-UAT Candidate

Nominate one additional employee code for later two-employee isolation UAT.

Selection rule:
- must be current/Active;
- non-blank unique Employee_Code;
- not `0118`;
- ordinary non-executive employee preferred;
- no need to write a credential now.

Report only:

```text
SECOND_UAT_EMPLOYEE_CODE = <code>
SECOND_UAT_CANDIDATE_STATUS = ELIGIBLE
```

Do not commit unnecessary personal data.

## 6. Optional App801 Read-Back

If available through the existing read path, read App801 credential record count only and report:

```text
APP801_CREDENTIAL_COUNT = <count>
```

Do not open/render raw Password_Hash values.
Do not write App801.

## 7. Mandatory Zero-Write Counters

```text
KINTONE_WRITES_EXECUTED = 0
APP801_CREDENTIAL_WRITES_EXECUTED = 0
APP794_DEPLOY_EXECUTED = 0
APP53_WRITES_EXECUTED = 0
D2_D7_WRITES_EXECUTED = 0
```

If any write occurs unexpectedly, STOP and report exact blocker.

## 8. Evidence / Delivery

Update the existing evidence file only:

`project-docs/D1_ACCESS_GROUP_SETUP_EVIDENCE.md`

Append one concise section:

`## 10. Credential Candidate Live Audit`

Include only:
- field code/value used for Active determination;
- counts above;
- duplicate code summary;
- special-code results;
- 0118 / 0119 result;
- second UAT employee code;
- optional App801 credential count;
- mandatory zero-write counters.

Do not add a full employee list.
Do not create another evidence document.

Prefer one commit + one push.
Final executor report <= 15 concise lines.

Maximum executor status:

```text
READ_AUDIT_COMPLETE_PENDING_INDEPENDENT_REVIEW
```

STOP after push or on the first real blocker. ChatGPT performs the independent review next.
