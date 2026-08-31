# AI ACTIVE TASK — D2-WP001-R1 EXECUTION AUTHORIZED

Mode: **ANTIGRAVITY EXECUTION PLANE / NARROW CORRECTIVE SOURCE CHANGE / NO KINTONE WRITE / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-01 ICT

```text
TASK_STATE = AUTHORIZED_FOR_EXECUTION
D1_OVERALL = PASS / CLOSED
D2_STATUS = IN PROGRESS
D2-DISCOVERY-001 = COMPLETE
PARENT_WORK_PACKAGE = D2-WP001
PARENT_IMPLEMENTATION_COMMIT = 4f4084b630642b2d1d6dcb0ab8093227bab8cc6c
PARENT_INDEPENDENT_REVIEW = CORRECTIVE REQUIRED
ACTIVE_WORK_PACKAGE = D2-WP001-R1
ACTIVE_WORK_PACKAGE_NAME = EXPORT AUTHORIZATION FAIL-CLOSED + NESTED CONFIDENTIALITY CORRECTIVE
OWNER_APPROVAL = GRANTED 2026-09-01 ICT
EXECUTOR = ANTIGRAVITY
ANTIGRAVITY_ACTION = EXECUTE THIS TASK ONLY
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP001-R1-SOURCE-20260901-01
MAX_EXECUTOR_STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

## 1. Objective

Correct only the blocking findings from ChatGPT independent review of `D2-WP001`.

Do not redesign the export system and do not broaden into renderer/template work.

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
8. `tests/core-794-795-796-integration.test.js`
9. only the exact existing D1 security source already imported/reused by the export service if needed

## 3. Authorized source scope

Allowed to change only:
- `src/services/mbo-export-service.js`
- `tests/mbo-export-service.test.js`
- `tests/core-794-795-796-integration.test.js` only if the existing export call-site must remain compatible with the corrected trusted-context contract

Do not modify unrelated D1 security services. Prefer no new file.

## 4. Required corrections

### A. Strict supported trusted-context shapes only

`validateExportAuthorization()` must fail closed for malformed, role-less or unsupported contexts.

Remove permissive general fallbacks that currently allow authorization merely because:
- caller supplied a matching `employeeCode`, or
- caller supplied bare `mode: DEDICATED` with current Assignee.

Supported source-level shapes for this R1 are limited to:

1. Employee-Self:
```text
{ type: 'EMPLOYEE_SELF', employeeCode: '<trusted bound Employee_Code>' }
```
The exact trusted Employee_Code must match App794 `Employee_Code`.

2. Approver:
```text
{ type: 'APPROVER', context: { mode: 'DEDICATED', kintoneUserCode: '<trusted dedicated principal>' } }
```
The principal must be authoritative current native App794 `Assignee` using the existing D1 rule.

Any other type/role/mode combination must fail closed in this WP.

### B. HR_ADMIN label must not self-authorize

Do not grant full export merely because caller passes `mode`, `type`, or `role = HR_ADMIN`.

Until a separately reviewed trusted HR export authority contract is defined/reused, HR-labeled caller objects must be denied by this export service.

Do not invent a new HR authentication system in R1.

### C. Preserve existing valid security rules

Must continue to prove:
- explicit Employee-Self cross-employee denied;
- SHARED Approver denied;
- DEDICATED current Assignee allowed;
- DEDICATED non-current-Assignee denied;
- stale/static Manager/App795/requester/appraiser membership alone denied;
- Technical Admin denied;
- unknown profile fails closed;
- confirmed profile weights unchanged.

### D. Employee-Self nested Part B confidentiality

For Employee-Self combined export, caller-supplied `competencyItems` must not be copied through blindly.

Use a strict safe projection/whitelist for each competency item. Employee-Self output may include only non-confidential business-safe competency descriptors/self data that are explicitly needed by the existing projection contract.

Manager/GM/appraiser ratings, comments, scores, weighted results, internal remarks or similarly privileged nested values must be omitted entirely.

If a property cannot be confidently classified safe, omit it fail-closed.

Approver projection may retain the existing full source-level competency payload only after explicit current-Assignee authorization.

### E. Mandatory tests

Add/retain focused tests proving at least:
- missing context denied;
- empty object denied;
- role-less matching `employeeCode` denied;
- bare `mode: DEDICATED` current Assignee denied;
- forged/caller-labeled HR_ADMIN denied for mode/type/role variants;
- explicit Employee-Self exact Employee_Code allowed;
- Employee-Self cross-employee denied;
- Employee-Self nested competency manager/GM/appraiser confidential properties absent;
- explicit SHARED Approver denied;
- explicit DEDICATED non-current-Assignee denied;
- stale/static route member denied;
- explicit DEDICATED current Assignee allowed;
- 4, 5 and 10 objectives remain exact;
- all confirmed profile weights remain exact.

## 5. Verification

Run actual offline tests and report exact commands/results:
- focused `tests/mbo-export-service.test.js`;
- `tests/core-794-795-796-integration.test.js` because its call-site was already touched by WP001;
- broader offline unit suite only if needed/available and it requires no Live Kintone.

No invented PASS.

## 6. Explicitly forbidden

Do NOT:
- implement `.xlsx` generation;
- implement PDF generation;
- add SheetJS/ExcelJS/jsPDF/PDFKit or package dependencies;
- modify `package.json` or lockfiles;
- add UI download buttons;
- modify build/runtime artifacts;
- access/write/deploy Live Kintone;
- change App53/App794/App795/App801 data/schema/ACL/Process Management;
- create Live UAT records;
- start D2-WP002 or D3/D4/D5/D6 implementation;
- broaden scope to template parity;
- rewrite D1 security architecture.

## 7. Git / completion contract

- Work on `ai/antigravity-wp002c`.
- Smallest corrective patch only.
- Prefer one implementation commit + push.
- Do not merge elsewhere.
- After push, STOP.
- Final executor status must be exactly `IMPLEMENTED_PENDING_INDEPENDENT_REVIEW` or a real blocker.
- Antigravity must not mark D2-WP001/R1 PASS or CLOSED.
- ChatGPT independently reviews actual diff/tests afterward.

Final report <= 15 concise lines and include:
- commit SHA;
- changed files;
- exact test commands/results;
- confirmation no dependency/build/deploy/Kintone write occurred;
- final status.

## 8. Authorization ledger

```text
D2-WP001-SOURCE-20260901-01 = CONSUMED / REVIEWED / DO NOT REUSE
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP001-R1-SOURCE-20260901-01
AUTHORIZED_SOURCE_SCOPE = mbo-export-service.js + mbo-export-service.test.js + exact dependent integration test only
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

This authorization is one corrective Work Package only. It is consumed when the R1 implementation commit is pushed for independent review, or invalidated if scope/risk materially changes.
