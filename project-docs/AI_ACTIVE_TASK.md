# AI ACTIVE TASK — D2-WP001 EXECUTION AUTHORIZED

Mode: **ANTIGRAVITY EXECUTION PLANE / NARROW SOURCE CHANGE / NO KINTONE WRITE / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-01 ICT

```text
TASK_STATE = AUTHORIZED_FOR_EXECUTION
D1_OVERALL = PASS / CLOSED
D2_STATUS = IN PROGRESS
D2-DISCOVERY-001 = COMPLETE
ACTIVE_WORK_PACKAGE = D2-WP001
ACTIVE_WORK_PACKAGE_NAME = EXPORT AUTHORIZATION + PROJECTION FOUNDATION
OWNER_APPROVAL = GRANTED 2026-09-01 ICT
EXECUTOR = ANTIGRAVITY
ANTIGRAVITY_ACTION = EXECUTE THIS TASK ONLY
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP001-SOURCE-20260901-01
MAX_EXECUTOR_STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

## 1. Objective

Close the D2 export authorization/security and objective-projection test gaps before any binary Excel/PDF rendering work.

This Work Package is intentionally limited to source-level authorization/projection behavior and focused automated tests.

## 2. Read only these files first

Antigravity low-credit mode. Do not whole-repo scan.

Read only:
1. `project-docs/AI_CONTROL_CENTER.md`
2. `project-docs/AI_ACTIVE_TASK.md`
3. `project-docs/EXCEL_EXPORT.md`
4. `project-docs/CONFIRMED_BASELINE/EVALUATION_CLASSES.md`
5. `project-docs/SECURITY_MODEL.md`
6. `src/services/mbo-export-service.js`
7. `tests/mbo-export-service.test.js`
8. only exact existing D1 security source/constants that must be reused by the patch

## 3. Authorized source scope

Primary files allowed to change:
- `src/services/mbo-export-service.js`
- `tests/mbo-export-service.test.js`

Existing D1 security services/constants may be imported/reused when needed, but do **not** refactor or modify unrelated D1 behavior.

No new runtime/source file unless separation is demonstrably necessary. Prefer no new file.

## 4. Required implementation outcomes

### A. Trusted export context — fail closed

Export projection must not expose protected evaluation data merely because a caller supplies an App794 record.

Introduce/require an explicit trusted export authorization context. Missing, malformed or unsupported context must fail closed.

Do not invent a new authentication system. Reuse current D1 identity/authority semantics.

### B. Employee-Self export

For Employee-Self export:
- trusted Employee_Code must exactly match the App794 record Employee_Code;
- cross-employee export must fail closed;
- confidential manager/GM/appraiser scores, ratings, internal comments, weighted/final confidential scores and final grade must not be present in the Employee-Self export projection;
- do not hide confidential values in unused/hidden properties — omit them entirely.

Use existing `CONFIDENTIAL_FIELDS` semantics as the privacy baseline where applicable.

### C. Approver export authority

Approver export is allowed only for a trusted **DEDICATED** Kintone principal that is authoritative current native App794 `Assignee`.

Requirements:
- reuse current-Assignee semantics from `MboApprovalTaskService` or the exact underlying rule;
- SHARED principal as Approver = denied;
- stale/static App795/snapshot/requester/appraiser membership alone must not authorize export;
- current Assignee mismatch = denied.

Do not change workflow authority rules.

### D. Profile weights

Preserve Confirmed Baseline exactly:
- `PROF_STAFF_CHIEF` = 70/30
- `PROF_JAPANESE_STAFF` = 70/30
- `PROF_ASST_MGR` = 60/40
- `PROF_SECTION_MGR` = 50/50
- `PROF_SENIOR_MGR` = 50/50
- `PROF_DGM` = 50/50
- `PROF_GM` = 50/50
- `PROF_VP` = 50/50

Unknown/unmapped profile remains fail closed.

### E. Objective capacity tests

Add focused tests that independently prove exact projection behavior for:
- 4 objectives
- 5 objectives
- 10 objectives

No silent truncation and no phantom extra objectives.

### F. Mandatory negative/security tests

At minimum prove:
- missing trusted export context -> denied/fail closed;
- Employee-Self cross-employee record -> denied;
- Employee-Self confidential fields absent from result;
- SHARED Approver -> denied;
- DEDICATED non-current-Assignee -> denied;
- stale/static route membership without current Assignee -> denied;
- authorized DEDICATED current Assignee -> allowed under this source-level projection contract.

## 5. Explicitly forbidden in WP001

Do NOT:
- implement `.xlsx` generation;
- implement PDF generation;
- add SheetJS/ExcelJS/jsPDF/PDFKit or any package dependency;
- add UI download buttons;
- modify `package.json` or lockfiles;
- modify build/runtime artifacts;
- access/write/deploy Live Kintone;
- change App53/App794/App795/App801 records/schema/ACL/Process Management;
- create Live UAT records;
- read/export confidential Live employee data;
- start D2-WP002 or D3/D4/D5/D6 work;
- broaden scope to template parity.

## 6. Verification

Run focused tests covering the changed export contract. Run the broader existing unit test command only if needed to detect regression and it does not require Live Kintone.

No invented PASS. Report actual commands/results only.

## 7. Git / completion contract

- Work on `ai/antigravity-wp002c` unless repository state requires the already-established execution workflow.
- Smallest patch only.
- Prefer one implementation commit + push.
- Do not merge to another branch.
- After push, STOP.
- Final executor status must be exactly `IMPLEMENTED_PENDING_INDEPENDENT_REVIEW` or a real blocker.
- Antigravity must not mark D2-WP001 PASS/CLOSED.
- ChatGPT performs independent Git diff/test review afterward.

Final report <= 15 concise lines and include:
- commit SHA;
- changed files;
- focused tests and results;
- confirmation no dependency/build/deploy/Kintone write occurred;
- final status.

## 8. Authorization ledger

```text
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP001-SOURCE-20260901-01
AUTHORIZED_SOURCE_SCOPE = mbo-export-service.js + mbo-export-service.test.js + necessary imports only
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_APP794_DEPLOY_AUTH = NONE
APP53_WRITE = NO
APP794_WRITE = NO
APP795_WRITE = NO
APP801_WRITE = NO
ACL_PROCESS_WRITE = NO
KINTONE_CUSTOMIZATION_DEPLOY = NO
LIVE_UAT = NO
ROLLBACK = NO
```

This authorization is one-work-package only. It is consumed when D2-WP001 implementation is pushed for independent review, or invalidated if scope/risk materially changes.
