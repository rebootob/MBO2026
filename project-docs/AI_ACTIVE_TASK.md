# AI ACTIVE TASK — D2-WP003-R3-R19 EXECUTION AUTHORIZED

Mode: **ANTIGRAVITY / PER-SHEET PRINT-AREA BINDING + MISSING EVIDENCE FAIL-CLOSED ONLY / NO BINARY PUBLISH / NO KINTONE / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-01 ICT

```text
TASK_STATE = AUTHORIZED_FOR_EXECUTION
D1_OVERALL = PASS / CLOSED
D2_STATUS = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R17 = PASS / CLOSED
D2-WP003-R3-R18 = REVIEWED / NOT PASS / NOT CLOSED
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R19
ACTIVE_WORK_PACKAGE_NAME = PER-SHEET PRINT-AREA BINDING + MISSING EVIDENCE FAIL-CLOSED
OWNER_APPROVAL = GRANTED 2026-09-01 ICT
EXECUTOR = ANTIGRAVITY
ANTIGRAVITY_MODE = LOW-CREDIT / BOUNDED
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R19-SOURCE-20260901-01
MAX_EXECUTOR_STATUS = WORKBOOK_PARITY_CORRECTIVE_PROOF_PENDING_INDEPENDENT_REVIEW
PRIVACY_PURGE_REQUIRED = NO
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
D3_EXECUTION = HOLD UNTIL D2 PASS / CLOSED
```

## 1. Purpose — ONLY THE TWO R3-R18 REVIEW DEFECTS

Preserve all accepted R3-R18 workbook-wide parity work and correct only:

1. **Per-sheet print-area binding** — bind `_xlnm.Print_Area` by the actual worksheet index / `localSheetId`; never silently fall back to another sheet's print area.
2. **Missing required dimension evidence** — exact source-vs-observed dimension evidence must fail closed when missing or different.

Do not redesign the workbook fingerprint architecture and do not start the next D2 blocker.

## 2. Execution baseline and write scope

Control-plane pre-authorization checkpoint:

```text
f1848b3efffb034659817dbc9f7ff2088b76cf6f
```

This checkpoint is NOT the executor baseline. Antigravity MUST fresh-fetch the canonical branch after authorization sync and record the then-current remote HEAD as `EXECUTION_BASELINE` before editing. Do not reset behind the current authorized governance HEAD.

Authorized modifications ONLY:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

Read-only:
- `package.json`
- `package-lock.json`
- governance docs
- exact ignored owner templates after SHA verification

No dependency/package change. No XLSX/image/media/output publication.

## 3. Exact source identity

Use ONLY exact owner templates:

```text
PART_A_SHA256 = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B_SHA256 = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
```

If exact templates are unavailable: STOP `BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE`.
Never log/commit raw employee/sample values.

## 4. Corrective A — exact per-sheet print-area binding

Reuse `getWorkbookFingerprint()` and the existing workbook XML evidence.

Required behavior:
- determine each worksheet's real zero-based workbook index/order;
- parse `_xlnm.Print_Area` defined names with their exact `localSheetId`;
- bind a print area only to the worksheet whose index equals that `localSheetId`;
- if a source worksheet has no print-area defined name, its fingerprint must expose no print area (`''` or one documented absent representation used consistently);
- NO fallback to the first/global print-area entry when a sheet-scoped binding is absent;
- Part B main `(Part B) Competency` retains its source print area;
- Part B second visible `Sheet1` must prove the exact source condition: **no print area**.

Do not alter unrelated defined-name semantics.

## 5. Corrective B — missing dimension evidence fail-closed

For every worksheet represented by the authoritative exact-source fingerprint:
- observed dimension evidence must be present as a required field;
- compare exact source-vs-observed dimension value;
- source present vs observed empty/missing must throw;
- source empty vs observed non-empty must throw;
- different non-empty dimension must throw;
- do not gate the equality check on both values being truthy.

A material mismatch must deterministically throw exactly:

```text
BLOCKER_WORKBOOK_PARITY_UNRESOLVED
```

Do not rely on incidental `TypeError`.

## 6. Mandatory source-backed tests

Preserve ALL accepted existing tests from R3-R18 and earlier.

Add/strengthen only these proofs:

### Positive
1. Part A no-op roundtrip still passes `validateWorkbookParity()`.
2. Part B no-op roundtrip still passes `validateWorkbookParity()`.
3. Part B main sheet print area equals exact source binding.
4. Part B `Sheet1` print area is absent/empty exactly as source.
5. Dimensions for every worksheet equal exact-source fingerprints.

### Negative — REAL validator / REAL source-backed expected fingerprint
1. Start from real valid Part B observed fingerprint, set `Sheet1.printArea` to the main sheet print area (or any non-empty wrong binding) => exact `BLOCKER_WORKBOOK_PARITY_UNRESOLVED`.
2. Start from real valid observed fingerprint and remove/blank one worksheet's `dimension` while source has dimension evidence => exact blocker.

Authoritative expected fingerprint MUST be independently rebuilt from exact SHA source before observed mutation/override.

## 7. Preserve accepted R3-R18 work

Do not regress:
- all-worksheet fingerprint coverage;
- exact sheet names/order/state;
- Part B `Sheet1` representation;
- merge refs/counts;
- columns / row heights;
- gridline/view evidence;
- margins / page setup / fit / centering;
- protection;
- relationship comparison;
- R3-R17 header parity;
- privacy role / typed metadata / zero sensitive-token tests;
- current image/insertion/formula tests;
- Difficulty Level blank decision.

## 8. Out of scope — DO NOT TOUCH

Do NOT work on:
- reference-image full closure;
- Part A objective insertion closure;
- Part B competency insertion closure;
- formula authority closure;
- production sanitizer/XLSX renderer;
- export service/normalizer/application code;
- combined production Excel;
- PDF/UI;
- Live Kintone;
- deploy;
- D3;
- another Work Package.

## 9. Mandatory commands

Run exactly:

```text
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

Before commit only authorized feasibility file(s) may differ. After push working tree must be clean.

## 10. Completion contract

Before editing record fresh-fetched current remote canonical HEAD as `EXECUTION_BASELINE`.
Commit/push only the authorized feasibility file(s).
Verify remote HEAD is a fast-forward descendant of `EXECUTION_BASELINE`.

Report:
- EXECUTION_BASELINE SHA
- NEW COMMIT SHA
- PUSH SUCCESS
- REMOTE HEAD SHA
- exact changed files
- test result
- npm audit result
- final status

Final executor status must be exactly one of:

```text
WORKBOOK_PARITY_CORRECTIVE_PROOF_PENDING_INDEPENDENT_REVIEW
BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE
BLOCKER_WORKBOOK_PARITY_UNRESOLVED
```

Do not declare R3-R18, D2-WP003, or D2 PASS/CLOSED. Do not start R3-R20 or D3.

## 11. Authorization ledger

```text
D2-WP003-R3-R17-SOURCE-20260901-01 = CONSUMED / REVIEWED / PASS-CLOSED / DO NOT REUSE
D2-WP003-R3-R18-SOURCE-20260901-01 = CONSUMED / REVIEWED / NOT PASS / DO NOT REUSE
D2-WP003-R3-R19-SOURCE-20260901-01 = ACTIVE / ONE CORRECTIVE ONLY
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R19-SOURCE-20260901-01
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

Authorization is consumed when the R3-R19 implementation/blocker commit is pushed for independent review or invalidated by any scope/dependency change.
