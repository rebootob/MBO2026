# AI ACTIVE TASK — D2-WP003-R3-R22 RUNTIME EVIDENCE AUTHORIZED

Mode: **ANTIGRAVITY / READ-ONLY TEST EXECUTION + ONE SAFE EVIDENCE FILE / NO SOURCE CHANGE / NO KINTONE / NO DEPLOY**
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-01 ICT

Repository truth and accepted newer Live evidence always win. Fresh-fetch current branch HEAD before acting.

```text
TASK_STATE = AUTHORIZED_FOR_EVIDENCE_CAPTURE
D1_OVERALL = PASS / CLOSED
D2_STATUS = IN PROGRESS
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R21 = REVIEWED / NOT PASS / NOT CLOSED
D2-WP003-R3-R22_TEST_COMMIT = 9cb94250fc0fa3bfe458f406c09d0df709aa5b96
D2-WP003-R3-R22_SCOPE_REVIEW = PASS
D2-WP003-R3-R22_SOURCE_REVIEW = PASS
D2-WP003-R3-R22_RUNTIME_EVIDENCE = REQUIRED / NOT YET ACCEPTED
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R22-E1
ACTIVE_WORK_PACKAGE_NAME = PRIVACY-SAFE RUNTIME EVIDENCE CAPTURE
OWNER_APPROVAL = GRANTED 2026-09-01 ICT
EXECUTOR = ANTIGRAVITY
ANTIGRAVITY_MODE = LOW-CREDIT / BOUNDED
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = D2-WP003-R3-R22-EVIDENCE-20260901-01
MAX_EXECUTOR_STATUS = R3_R22_EVIDENCE_PENDING_INDEPENDENT_REVIEW
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
D3_EXECUTION = HOLD UNTIL D2 PASS / CLOSED
```

## 1. Purpose — COMPLETE R3-R22 EVIDENCE ONLY

The R3-R22 test source at commit `9cb94250fc0fa3bfe458f406c09d0df709aa5b96` has already passed independent scope/source review.

The remaining gap is that the independent reviewer cannot access the exact SHA-verified owner templates and GitHub has no CI/status evidence. Antigravity must run the already-authorized tests against the exact local owner templates and commit one privacy-safe evidence document for independent review.

No implementation or test correction is authorized.

## 2. Execution baseline and exact write scope

Control-plane pre-authorization checkpoint:

```text
9cb94250fc0fa3bfe458f406c09d0df709aa5b96
```

This checkpoint is NOT the executor baseline. Antigravity MUST fresh-fetch after this authorization is committed/pushed and record the then-current remote HEAD as `EXECUTION_BASELINE` before running commands.

Authorized creation ONLY:

```text
project-docs/D2_WP003_R3_R22_RUNTIME_EVIDENCE.md
```

Mandatory READ-ONLY:
- `tests/mbo-xlsx-ooxml-feasibility.test.js`;
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`;
- `package.json` and `package-lock.json`;
- all existing governance/baseline/evidence documents;
- exact ignored owner templates.

No other tracked file may change. No dependency or lockfile change. No generated XLSX/PDF/image/media/output may be committed.

If any source/test change appears necessary, STOP `BLOCKER_AUTHORIZATION_SCOPE_INVALIDATED` and still record only the safe blocker evidence in the authorized evidence file.

## 3. Exact template identity and privacy boundary

Use ONLY templates whose SHA-256 values equal:

```text
PART_A_SHA256 = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B_SHA256 = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
```

If either exact template is unavailable or mismatched:
- do not run it as canonical evidence;
- record only observed SHA or `NOT_AVAILABLE` and the blocker;
- STOP `BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE`.

Never write to Git:
- owner template binaries;
- raw workbook/output buffers;
- raw employee/sample/confidential values;
- cell values, names, employee codes or sensitive tokens;
- screenshots or extracted workbook XML containing values.

Allowed safe evidence:
- SHA-256 values;
- boolean presence/absence;
- test names/counts/status/duration;
- blocker identifiers;
- validator status;
- dependency audit summary;
- commit/file/status metadata.

## 4. Mandatory read-only execution

Fresh-fetch canonical HEAD and verify:

```text
git merge-base --is-ancestor 9cb94250fc0fa3bfe458f406c09d0df709aa5b96 HEAD
```

Before tests confirm tracked source/test files match remote HEAD and working tree has no tracked change.

Run exactly:

```text
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

Do not alter tests to make them pass. Do not repair raw no-op buffers.

## 5. Required evidence document

Create `project-docs/D2_WP003_R3_R22_RUNTIME_EVIDENCE.md` containing all sections below.

### A. Provenance
- `EXECUTION_BASELINE` SHA;
- `TEST_SOURCE_COMMIT = 9cb94250fc0fa3bfe458f406c09d0df709aa5b96`;
- current branch and remote HEAD;
- Node and npm versions;
- exact changed-file scope before evidence commit.

### B. Template verification
- expected Part A/Part B SHA;
- observed Part A/Part B SHA;
- exact match `YES/NO` for each;
- no filenames outside the approved canonical names and no cell values.

### C. Mandatory command results
- exact command names;
- exit codes;
- test total/pass/fail/skipped/cancelled/duration;
- names of failed tests and safe blocker identifiers only if failure occurs;
- `npm audit --omit=dev` vulnerability total;
- clean tracked status confirmation before creating the evidence file.

### D. R3-R22 proof matrix

Record only safe booleans/statuses:

| Evidence | Source | Raw no-op | Real validator result |
|---|---|---|---|
| Part A main `<dimension>` present | YES/NO | YES/NO | TRUE/BLOCKER |
| Part B main `<dimension>` present | YES/NO | YES/NO | TRUE/BLOCKER |
| Part B `Sheet1` `<dimension>` present | YES/NO | YES/NO | covered by Part B result |

Also state:
- exact-source Part A validator result;
- exact-source Part B validator result;
- raw Part A validator result;
- raw Part B validator result;
- all mutation negatives used `fpOrigB/origBufB`: `YES/NO`;
- dimension removal started from exact-source XML with tag proven present: `YES/NO`;
- no source-to-output repair: `YES/NO`.

### E. Privacy and scope attestation
- no raw values or binaries committed;
- source/test/dependency files unchanged;
- only the authorized evidence file differs before commit;
- no Kintone, deploy, Live UAT or D3 action.

### F. Executor conclusion

Use exactly one:

```text
R3_R22_EVIDENCE_PENDING_INDEPENDENT_REVIEW
BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE
BLOCKER_WORKBOOK_PARITY_UNRESOLVED
BLOCKER_AUTHORIZATION_SCOPE_INVALIDATED
```

Antigravity must not declare R3-R22, D2-WP003 or D2 PASS/CLOSED.

## 6. Commit and push contract

Before commit:

```text
git diff --name-only
```

The output must contain only:

```text
project-docs/D2_WP003_R3_R22_RUNTIME_EVIDENCE.md
```

Commit message:

```text
docs(d2): record R3-R22 privacy-safe runtime evidence
```

Push only to `ai/antigravity-wp002c`.
Verify remote HEAD is a fast-forward descendant of `EXECUTION_BASELINE` and working tree is clean after push.

Report the evidence commit SHA and STOP for independent review.

## 7. Out of scope — DO NOT TOUCH

Do not:
- edit source or tests;
- edit existing governance/baseline/evidence files;
- add helpers, fixtures, dependencies or scripts;
- commit templates or generated artifacts;
- start preservation strategy, image closure, insertion closure, formula authority, renderer or PDF;
- access/write/deploy Kintone;
- start R3-R23, D3 or another work package.

## 8. Authorization ledger

```text
D2-WP003-R3-R22-TEST-20260901-01 = CONSUMED / IMPLEMENTED / SOURCE REVIEW PASS / DO NOT REUSE
D2-WP003-R3-R22-EVIDENCE-20260901-01 = ACTIVE / ONE EVIDENCE FILE ONLY
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = D2-WP003-R3-R22-EVIDENCE-20260901-01
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
D3_EXECUTION = HOLD
```

Authorization is consumed when the evidence/blocker commit is pushed or invalidated by any scope change.
