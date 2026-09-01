# AI ACTIVE TASK — D2-WP003-R3-R22 EXECUTION AUTHORIZED

Mode: **ANTIGRAVITY / TEST-PROOF ISOLATION ONLY / SOURCE READ-ONLY / NO BINARY PUBLISH / NO KINTONE / NO DEPLOY**
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-01 ICT

Repository truth and accepted newer Live evidence always win. Fresh-fetch current branch HEAD before acting.

```text
TASK_STATE = AUTHORIZED_FOR_EXECUTION
D1_OVERALL = PASS / CLOSED
D2_STATUS = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R17 = PASS / CLOSED
D2-WP003-R3-R18 = REVIEWED / NOT PASS / NOT CLOSED
D2-WP003-R3-R19 = REVIEWED / NOT PASS / NOT CLOSED
D2-WP003-R3-R20 = REVIEWED / NOT PASS / NOT CLOSED
D2-WP003-R3-R21 = REVIEWED / NOT PASS / NOT CLOSED
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R22
ACTIVE_WORK_PACKAGE_NAME = VALID SOURCE-BACKED NEGATIVE BASELINES + RAW NO-OP RESULT PINNING
OWNER_APPROVAL = GRANTED 2026-09-01 ICT
EXECUTOR = ANTIGRAVITY
ANTIGRAVITY_MODE = LOW-CREDIT / BOUNDED
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R22-TEST-20260901-01
MAX_EXECUTOR_STATUS = TEST_PROOF_ISOLATION_PENDING_INDEPENDENT_REVIEW
PRIVACY_PURGE_REQUIRED = NO
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
D3_EXECUTION = HOLD UNTIL D2 PASS / CLOSED
```

## 1. Purpose — ISOLATE TEST PROOF ONLY

Preserve the accepted R3-R21 source implementation. Correct only the remaining test-proof defect:

1. mutation-specific negative tests must not use raw Part B `fpOutB/outBufB` as their validity baseline because raw Part B may already be parity-invalid;
2. each mutation-specific negative must start from an independently valid exact-source/source-backed fingerprint and buffer proven through the real `validateWorkbookParity()`;
3. actual `<dimension>` removal must start from an exact source buffer whose target worksheet is first proven to contain the actual tag;
4. raw Part A / Part B main / Part B `Sheet1` no-op dimension evidence and real-validator outcome must be pinned separately from mutation-specific negative proof;
5. deterministic blocker-normalization proof must also use a valid source-backed baseline.

This is TEST-ONLY. Do not change implementation behavior in this work package.

## 2. Execution baseline and exact write scope

Control-plane pre-authorization checkpoint:

```text
d02b46bc6a600225077780799efd6580440fc005
```

This checkpoint is NOT the executor baseline. Antigravity MUST fresh-fetch the canonical branch after this authorization is committed/pushed and record the then-current remote HEAD as `EXECUTION_BASELINE` before editing. Never reset behind the current authorized governance HEAD.

Authorized modification ONLY:
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

Mandatory READ-ONLY:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`
- `package.json`
- `package-lock.json`
- all governance documents
- exact ignored owner templates after SHA verification

No new file. No dependency/package change. No XLSX/image/media/output publication.

If any implementation/source change outside the single authorized test file appears necessary, STOP and report an authorization-invalidating blocker. Do not widen scope.

## 3. Exact source identity and privacy boundary

Use ONLY exact owner templates:

```text
PART_A_SHA256 = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B_SHA256 = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
```

If exact templates are unavailable: STOP `BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE`.
Never log, snapshot, commit or publish raw employee/sample/confidential cell values or owner binaries.

## 4. Preserve accepted R3-R21 implementation and proof

DO NOT regress or reopen:
- direct raw `xlsx-populate.outputAsync()` buffers from `getNoOpParityBuffers()` with no source repair;
- `BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE` preservation and normalization of every other parity-path failure to `BLOCKER_WORKBOOK_PARITY_UNRESOLVED`;
- strict actual `<dimension .../>` evidence only, with no row/cell synthesis;
- exact print-area binding by `localSheetId` and actual zero-based worksheet index;
- workbook-wide all-sheet coverage, including Part B `Sheet1`;
- Part B `Sheet1.colsHash` negative coverage;
- R3-R17 header, privacy-role, typed-metadata and zero-sensitive-token proofs;
- existing image/insertion/formula feasibility tests;
- Difficulty Level remains blank temporarily.

The implementation file is read-only even if a test exposes raw no-op degradation.

## 5. Corrective A — INDEPENDENTLY VALID SOURCE-BACKED BASELINE

Inside the existing no-op parity test, build exact-source fingerprints independently from `origBufA/origBufB`.

Before any mutation-specific proof, require the real validator to prove the exact source baselines valid:

```text
validateWorkbookParity(origBufA, 'A') === true
validateWorkbookParity(origBufB, 'B') === true
```

For every mutation-specific negative currently based on `fpOutB/outBufB`:
- clone the exact-source `fpOrigB` or another independently real-validator-proven source-backed fingerprint;
- pass the exact-source `origBufB` as the associated buffer when a fingerprint override is used;
- change only the one intended field for that negative proof;
- require exactly `BLOCKER_WORKBOOK_PARITY_UNRESOLVED`;
- ensure a rejection cannot be caused by a pre-existing raw output defect.

This includes at minimum:
- wrong Part B `Sheet1.printArea`;
- blank/changed worksheet dimension fingerprint;
- Part B `Sheet1.colsHash` mutation;
- non-serializable/malformed fingerprint normalization;
- worksheet order mutation;
- merge mutation;
- page setup/orientation mutation;
- sheet-protection mutation.

Do not weaken or delete negative coverage merely to make tests pass.

## 6. Corrective B — ACTUAL DIMENSION-TAG REMOVAL FROM KNOWN-VALID SOURCE

The dimension-removal proof must start from exact-source `origBufB`, not raw `outBufB`.

Required preconditions and proof:
1. open the exact source buffer in memory only;
2. resolve the intended worksheet OOXML deterministically;
3. assert the source worksheet XML actually contains the exact `<dimension .../>` tag before mutation;
4. remove exactly that tag from the disposable in-memory source copy;
5. assert the mutation really changed the XML/tag presence;
6. validate the mutated buffer through the real `validateWorkbookParity()`;
7. require exactly `BLOCKER_WORKBOOK_PARITY_UNRESOLVED`.

If the exact source target has no dimension tag, STOP and report the evidence mismatch. Do not silently run a no-op replacement and claim negative proof.

## 7. Corrective C — RAW NO-OP RESULT PINNING, SEPARATE FROM NEGATIVE PROOF

Keep raw observed buffers unmodified and unrepaired.

Separately capture safe structural evidence for:
- Part A source main-sheet dimension presence/absence;
- Part A raw no-op main-sheet dimension presence/absence;
- Part B source main-sheet dimension presence/absence;
- Part B raw no-op main-sheet dimension presence/absence;
- Part B source `Sheet1` dimension presence/absence;
- Part B raw no-op `Sheet1` dimension presence/absence.

Evaluate raw `outBufA/outBufB` only through the real validator:
- if raw output has exact workbook parity, require `true`;
- if raw output degrades material evidence, require exactly `BLOCKER_WORKBOOK_PARITY_UNRESOLVED` and report which safe dimension-presence comparison differs;
- never repair/reinsert/copy a source tag into raw output;
- never reuse a parity-invalid raw fingerprint as the starting point of another negative test.

The raw no-op outcome is evidence. It does not authorize a preservation strategy or implementation fix.

## 8. Out of scope — DO NOT TOUCH

Do NOT work on:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js` or any implementation source;
- preservation strategy/renderer for a proven raw no-op defect;
- reference-image full closure;
- Part A objective insertion closure;
- Part B competency insertion closure;
- formula/no-formula authority closure;
- production sanitizer/XLSX renderer;
- export service/normalizer/application code;
- combined production Excel;
- PDF/UI;
- Live Kintone;
- deploy;
- D3;
- R3-R23 or another Work Package.

## 9. Mandatory commands

Run exactly:

```text
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

Before commit only `tests/mbo-xlsx-ooxml-feasibility.test.js` may differ. After push working tree must be clean.

## 10. Completion contract

Before editing, record fresh-fetched current remote canonical HEAD as `EXECUTION_BASELINE`.
Commit/push only the authorized test file.
Verify remote HEAD is a fast-forward descendant of `EXECUTION_BASELINE`.

Report:
- `EXECUTION_BASELINE` SHA;
- new implementation/test commit SHA;
- push result and remote HEAD SHA;
- exact changed files;
- test totals and result;
- `npm audit --omit=dev` result;
- exact-source Part A and Part B validator result;
- safe source-vs-raw dimension-presence matrix for Part A main, Part B main and Part B `Sheet1`;
- raw Part A and raw Part B real-validator result;
- confirmation that every mutation-specific negative used a real-validator-proven source-backed baseline;
- confirmation that dimension removal started from a source XML tag proven present;
- final executor status.

Final executor status must be exactly one of:

```text
TEST_PROOF_ISOLATION_PENDING_INDEPENDENT_REVIEW
BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE
BLOCKER_WORKBOOK_PARITY_UNRESOLVED
BLOCKER_AUTHORIZATION_SCOPE_INVALIDATED
```

Do not declare workbook parity, D2-WP003 or D2 PASS/CLOSED. Do not start preservation strategy, image closure, R3-R23 or D3.

## 11. Authorization ledger

```text
D2-WP003-R3-R18-SOURCE-20260901-01 = CONSUMED / REVIEWED / NOT PASS / DO NOT REUSE
D2-WP003-R3-R19-SOURCE-20260901-01 = CONSUMED / REVIEWED / NOT PASS / DO NOT REUSE
D2-WP003-R3-R20-SOURCE-20260901-01 = CONSUMED / REVIEWED / NOT PASS / DO NOT REUSE
D2-WP003-R3-R21-SOURCE-20260901-01 = CONSUMED / REVIEWED / NOT PASS / DO NOT REUSE
D2-WP003-R3-R22-TEST-20260901-01 = ACTIVE / ONE TEST-ONLY CORRECTIVE
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R22-TEST-20260901-01
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

Authorization is consumed when the R3-R22 implementation/blocker commit is pushed for independent review or invalidated by any scope/dependency change.
