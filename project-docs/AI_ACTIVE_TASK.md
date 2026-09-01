# AI ACTIVE TASK — D2-WP003-R3-R20 EXECUTION AUTHORIZED

Mode: **ANTIGRAVITY / STRICT DIMENSION TAG EVIDENCE + RESTORE SECOND-SHEET STRUCTURAL NEGATIVE PROOF ONLY / NO BINARY PUBLISH / NO KINTONE / NO DEPLOY**  
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
D2-WP003-R3-R19 = REVIEWED / NOT PASS / NOT CLOSED
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R20
ACTIVE_WORK_PACKAGE_NAME = STRICT DIMENSION TAG EVIDENCE + RESTORE SECOND-SHEET STRUCTURAL NEGATIVE PROOF
OWNER_APPROVAL = GRANTED 2026-09-01 ICT
EXECUTOR = ANTIGRAVITY
ANTIGRAVITY_MODE = LOW-CREDIT / BOUNDED
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R20-SOURCE-20260901-01
MAX_EXECUTOR_STATUS = WORKBOOK_PARITY_STRICT_DIMENSION_PROOF_PENDING_INDEPENDENT_REVIEW
PRIVACY_PURGE_REQUIRED = NO
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
D3_EXECUTION = HOLD UNTIL D2 PASS / CLOSED
```

## 1. Purpose — ONLY TWO R3-R19 REVIEW DEFECTS

Preserve all accepted R3-R19 work and correct only:

1. **Strict actual OOXML dimension-tag evidence** — `getWorkbookFingerprint()` must fingerprint only the actual `<dimension .../>` element present in the worksheet OOXML. Never synthesize a replacement from row/cell coordinates when the tag is absent.
2. **Restore accepted Part B second-sheet structural negative proof** — restore the R3-R18 fail-closed `Sheet1.colsHash` mutation test removed in R3-R19.

Do not redesign workbook fingerprinting or start another D2 blocker.

## 2. Execution baseline and exact write scope

Control-plane pre-authorization checkpoint:

```text
0344e7a95bc34138c31dffdd2701525d8fb63105
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

Accepted source fact: exact owner workbooks contain explicit `<dimension>` evidence on Part A main, Part B main, and Part B `Sheet1`. There is no need to manufacture a dimension for source authority.

## 4. Preserve accepted R3-R19 work

DO NOT regress:
- `_xlnm.Print_Area` parsed by exact `localSheetId`;
- actual zero-based workbook sheet order drives print-area binding;
- no cross-sheet/first-print-area fallback;
- Part B main retains exact source print area;
- Part B `Sheet1` has no print area;
- validator dimension comparison remains unconditional exact equality;
- wrong `Sheet1.printArea` negative proof remains;
- blank observed-dimension negative proof remains;
- all-worksheet coverage, names/order/state, merges, columns, row heights, views/gridlines, margins, page setup/fit/centering, protection and relationships remain;
- R3-R17 header parity, privacy role, typed metadata, zero-sensitive-token tests remain;
- current image/insertion/formula tests remain;
- Difficulty Level remains blank temporarily.

## 5. Corrective A — strict actual dimension-tag evidence

In `getWorkbookFingerprint()`:
- extract the actual worksheet `<dimension .../>` element only;
- if the actual tag is absent, fingerprint dimension evidence as absent/empty using one consistent representation;
- REMOVE the R3-R19 fallback that computes/synthesizes a `<dimension .../>` string from row/cell coordinates;
- do not infer, reconstruct, repair, normalize into existence, or otherwise manufacture missing dimension evidence.

In `validateWorkbookParity()`:
- preserve unconditional exact equality for `obsSheet.dimension !== authSheet.dimension`;
- source-present vs observed absent/empty must fail closed;
- source-absent vs observed present must fail closed;
- changed actual dimension must fail closed;
- deterministic blocker remains exactly:

```text
BLOCKER_WORKBOOK_PARITY_UNRESOLVED
```

Do not rely on incidental TypeError/assertion failure.

## 6. Corrective B — restore second-sheet structural negative proof

Restore the accepted R3-R18 negative test using REAL Part B source-backed observed fingerprint:

```text
mutated.sheets['Sheet1'].colsHash = a deliberately invalid hash
```

Call the REAL `validateWorkbookParity()` and require exactly:

```text
BLOCKER_WORKBOOK_PARITY_UNRESOLVED
```

Do not remove or replace any currently accepted R3-R19 negative proof to make room for this test.

## 7. Mandatory source-backed tests

Preserve ALL existing accepted tests.

Positive:
1. Part A no-op roundtrip still passes `validateWorkbookParity()`.
2. Part B no-op roundtrip still passes `validateWorkbookParity()`.
3. Exact-source and no-op observed fingerprints retain actual dimension-tag evidence for every source worksheet.
4. R3-R19 print-area assertions remain unchanged and passing.

Negative:
1. Existing wrong `Sheet1.printArea` => exact workbook parity blocker.
2. Existing blank observed dimension fingerprint => exact blocker.
3. Restore `Sheet1.colsHash` mutation => exact blocker.
4. Add the smallest bounded helper-level/source-backed proof that an observed worksheet with its actual `<dimension>` tag removed is represented as missing dimension evidence and is rejected by the REAL validator. Prefer an in-memory disposable OOXML mutation; do not publish any binary/output. If the existing test architecture cannot safely create that in-memory mutation without dependency/refactor expansion, keep source change minimal and prove the missing-tag helper behavior through the smallest equivalent bounded mechanism. Do not fabricate source values.

Authoritative expected fingerprint MUST always be rebuilt from exact SHA source before observed mutation/override.

## 8. Out of scope — DO NOT TOUCH

Do NOT work on:
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
WORKBOOK_PARITY_STRICT_DIMENSION_PROOF_PENDING_INDEPENDENT_REVIEW
BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE
BLOCKER_WORKBOOK_PARITY_UNRESOLVED
```

Do not declare R3-R18, R3-R19, D2-WP003, or D2 PASS/CLOSED. Do not start the image blocker or D3.

## 11. Authorization ledger

```text
D2-WP003-R3-R18-SOURCE-20260901-01 = CONSUMED / REVIEWED / NOT PASS / DO NOT REUSE
D2-WP003-R3-R19-SOURCE-20260901-01 = CONSUMED / REVIEWED / NOT PASS / DO NOT REUSE
D2-WP003-R3-R20-SOURCE-20260901-01 = ACTIVE / ONE CORRECTIVE ONLY
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R20-SOURCE-20260901-01
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

Authorization is consumed when the R3-R20 implementation/blocker commit is pushed for independent review or invalidated by any scope/dependency change.
