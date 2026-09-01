# AI ACTIVE TASK — D2-WP003-R3-R23 AUTHORIZED EXECUTION

Mode: **EXECUTION PLANE / LOW-CREDIT / BOUNDED SOURCE + TEST ONLY / NO KINTONE / NO DEPLOY**
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-01 ICT

Repository truth and accepted newer Live evidence always win. Fresh-fetch current branch HEAD before acting.

```text
TASK_STATE = AUTHORIZED / READY FOR ANTIGRAVITY
D1_OVERALL = PASS / CLOSED
D2_STATUS = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R17 = PASS / CLOSED
D2-WP003-R3-R21 = REVIEWED / NOT PASS / NOT CLOSED
D2-WP003-R3-R22 = PASS / CLOSED
R3-R22_TEST_COMMIT = 9cb94250fc0fa3bfe458f406c09d0df709aa5b96
R3-R22_EVIDENCE_COMMIT = 5ae2f7f8cfe22dbed7b121505a40d3244a4673a0
RAW_PART_A_PARITY = BLOCKER_WORKBOOK_PARITY_UNRESOLVED
RAW_PART_B_PARITY = BLOCKER_WORKBOOK_PARITY_UNRESOLVED
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R23
ACTIVE_WORK_PACKAGE_NAME = SEPARATE MINIMAL EXACT-DIMENSION PRESERVATION PATH
AUTHORIZED_SCOPE = EXISTING FEASIBILITY SOURCE + TEST ONLY
AUTHORIZATION_DECISION_BASELINE_COMMIT = aca452faf4d3fc3ef82e957bd45f4e0874d9377e
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R23-SOURCE-20260901-01
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
PRIVACY_PURGE_REQUIRED = NO
D3_EXECUTION = HOLD UNTIL D2 PASS / CLOSED
ANTIGRAVITY = AUTHORIZED / EXECUTE ONCE / STOP AFTER COMMIT
```

## 1. Independently accepted R3-R22 closure

```text
R3-R22_SCOPE_REVIEW = PASS
R3-R22_SOURCE_REVIEW = PASS
R3-R22_RUNTIME_EVIDENCE_REVIEW = PASS
R3-R22_STATUS = PASS / CLOSED
```

Accepted evidence:
- exact Part A and Part B owner-template SHA-256 values matched canonical identity;
- mandatory feasibility tests passed `8/8`;
- `npm audit --omit=dev` reported `0` vulnerabilities;
- mutation-specific negatives use independently valid `fpOrigB/origBufB` baselines;
- exact-source Part A and Part B pass the real workbook validator;
- raw direct `xlsx-populate.outputAsync()` removes actual `<dimension>` evidence from Part A main, Part B main and Part B `Sheet1`;
- raw Part A and Part B therefore fail closed with `BLOCKER_WORKBOOK_PARITY_UNRESOLVED`;
- no source-to-output repair exists in the raw evidence path;
- evidence commit contains no owner binaries or raw employee/sample values.

R3-R22 closes proof isolation only. It does not close workbook preservation or D2-WP003.

## 2. Authorized corrective — ONE-SHOT / BOUNDED

```text
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R23
ACTIVE_WORK_PACKAGE_NAME = SEPARATE MINIMAL EXACT-DIMENSION PRESERVATION PATH
AUTHORIZED_SCOPE = EXISTING FEASIBILITY SOURCE + TEST ONLY
OWNER_AUTHORIZATION = ACCEPTED / 2026-09-01 ICT
AUTHORIZATION_ID = D2-WP003-R3-R23-SOURCE-20260901-01
AUTHORIZATION_DECISION_BASELINE_COMMIT = aca452faf4d3fc3ef82e957bd45f4e0874d9377e
EXECUTOR = ANTIGRAVITY / LOW-CREDIT / BOUNDED
```

R3-R23 is the smallest necessary next step because R3-R22 proved a real, isolated raw round-trip defect. The purpose is to prove a separate fail-closed preservation path without contaminating raw evidence.

## 3. Exact authorized write scope

Expected modifications ONLY:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`;
- `tests/mbo-xlsx-ooxml-feasibility.test.js`.

Read-only:
- `package.json` and `package-lock.json`;
- governance/baseline/evidence documents;
- exact ignored owner templates after SHA verification.

No new file or dependency. No generated XLSX/PDF/image/media/output publication.

Any need to touch another tracked file invalidates this authorization. Stop and return a blocker for Owner decision.

## 4. Mandatory preservation architecture

The accepted raw evidence path remains frozen:

```text
getNoOpParityBuffers() = DIRECT RAW outputAsync() EVIDENCE / NO REPAIR
```

R3-R23 must add a separate minimal preservation path/helper in the existing feasibility source. It must:
1. accept exact-source and raw-observed workbook buffers separately;
2. verify exact owner-template SHA before using source structure;
3. resolve every worksheet by exact workbook sheet name/order and workbook relationship target;
4. forbid first-sheet, cross-sheet, numeric-filename or missing-relationship fallback;
5. require exactly one actual source `<dimension .../>` tag for every worksheet;
6. if raw output has no dimension tag, insert the exact source tag at the schema-valid worksheet position;
7. if raw output already has the exact tag, leave it unchanged;
8. if raw output contains a conflicting/multiple dimension tag or mapping is ambiguous/missing, fail closed;
9. change no workbook evidence other than the exact missing dimension tags;
10. return a new preserved buffer without modifying the raw evidence buffer.

Use a dedicated deterministic blocker for preservation-path failure, for example:

```text
BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED
```

Do not normalize or disguise raw evidence as preserved evidence.

## 5. Mandatory proof

Tests must prove:

### Positive proof
- raw Part A and Part B remain unmodified and still produce the R3-R22 fail-closed result;
- separate preserved Part A and Part B buffers pass the real `validateWorkbookParity()`;
- Part A main, Part B main and Part B `Sheet1` contain the exact source dimension tags after preservation;
- worksheet names/order/relationship targets remain exact;
- a complete fingerprint comparison proves raw-to-preserved change is limited only to the authorized dimension fields;
- source buffers remain byte-identical and raw buffers remain byte-identical to their pre-preservation snapshots.

### Negative proof
- missing source dimension;
- multiple source dimensions;
- conflicting raw dimension;
- multiple raw dimensions;
- missing/ambiguous worksheet relationship mapping;
- wrong worksheet target/cross-sheet mapping attempt;
- malformed source or observed buffer.

Every negative must fail with the deterministic preservation blocker and must not return a partially repaired buffer.

### Regression proof
- preserve all R3-R22 source-backed mutation negatives;
- preserve deterministic workbook parity blocker normalization;
- preserve exact per-sheet print-area binding and Part B `Sheet1.colsHash` coverage;
- preserve R3-R17 header/privacy/typed-metadata and zero-sensitive-token tests;
- preserve existing image/insertion/formula feasibility tests;
- Difficulty Level remains blank temporarily.

## 6. Out of scope

Do not start:
- production sanitizer/XLSX renderer integration;
- reference-image closure;
- Part A objective insertion closure;
- Part B competency insertion closure;
- formula/no-formula authority closure;
- combined production Excel;
- PDF/UI;
- Kintone access/write/deploy;
- D3;
- R3-R24 or another work package.

## 7. Mandatory commands

```text
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

Antigravity must fresh-fetch the canonical branch before editing, verify the current HEAD contains this exact active authorization and descends from the authorization decision baseline, then record that fetched HEAD as its execution baseline. It must stop after one bounded implementation/blocker commit pushed to `ai/antigravity-wp002c` and report that commit for independent review. It must not create an evidence document, self-certify PASS, or declare D2-WP003/D2 PASS-CLOSED.

## 8. Authorization ledger

```text
D2-WP003-R3-R22-TEST-20260901-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP003-R3-R22-EVIDENCE-20260901-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP003-R3-R23-SOURCE-20260901-01 = ACTIVE / ONE-SHOT / DO NOT WIDEN
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R23-SOURCE-20260901-01
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
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

## 9. Exact next action

```text
NEXT_CONTROL_STEP = ANTIGRAVITY EXECUTES R3-R23 ONCE AND PUSHES ONE BOUNDED COMMIT
NEXT_EXECUTOR = ANTIGRAVITY
ANTIGRAVITY = AUTHORIZED / EXECUTE ONCE / STOP AFTER COMMIT
D3 = HOLD
```

After the bounded commit, stop for ChatGPT independent review. Do not continue to evidence publication, R3-R24, later D2 gates or D3.
