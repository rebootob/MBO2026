# AI ACTIVE TASK — D2-WP003-R3-R18 EXECUTION AUTHORIZED

Mode: **ANTIGRAVITY / WORKBOOK-WIDE SOURCE-vs-ROUNDTRIP PARITY COMPLETENESS ONLY / NO BINARY PUBLISH / NO KINTONE / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-01 ICT

```text
TASK_STATE = AUTHORIZED_FOR_EXECUTION
D1_OVERALL = PASS / CLOSED
D2_STATUS = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R13 = PASS / CLOSED
D2-WP003-R3-R16 = PASS / CLOSED
D2-WP003-R3-R17 = PASS / CLOSED
HEADER_FINGERPRINT_SANITIZED_EXPORT_PARITY = PASS / CLOSED
PART_B_PRIVACY_CLASSIFICATION_EVIDENCE_PARITY = PASS / CLOSED
TYPED_PRIVACY_METADATA_COMPLETENESS = PASS / CLOSED
TYPED_METADATA_VALIDATOR_SHAPE = PASS / CLOSED
OWNER_DIFFICULTY_DECISION = LEAVE BLANK TEMPORARILY
PRIVACY_PURGE_REQUIRED = NO
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R18
ACTIVE_WORK_PACKAGE_NAME = WORKBOOK-WIDE SOURCE-vs-ROUNDTRIP PARITY COMPLETENESS
OWNER_APPROVAL = GRANTED 2026-09-01 ICT
EXECUTOR = ANTIGRAVITY
ANTIGRAVITY_MODE = LOW-CREDIT / BOUNDED
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R18-SOURCE-20260901-01
MAX_EXECUTOR_STATUS = WORKBOOK_PARITY_PROOF_PENDING_INDEPENDENT_REVIEW
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
D3_EXECUTION = HOLD UNTIL D2 PASS / CLOSED
```

## 1. Purpose — ONE DEFERRED FEASIBILITY BLOCKER ONLY

Close only **workbook-wide source-vs-roundtrip semantic structural parity completeness** for the exact SHA-verified Part A and Part B owner templates.

R3-R18 is a no-op roundtrip feasibility proof. It is NOT the production renderer, NOT PDF, NOT image semantic closure, NOT Kintone, and NOT D3.

## 2. Execution baseline and exact write scope

Control-plane pre-authorization checkpoint:

```text
4666db780a32179061c5f15f96bc0bda10ad4010
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

Bounded lookup only in repository root, `app info/data/`, and `exp/`.
If exact templates are unavailable: STOP `BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE`.
Never print/log/commit raw employee/sample values.

## 4. Reuse-first rule

Reuse existing accepted helpers/tests first:
- `findLocalSourceTemplates()`
- `getNoOpParityBuffers()`
- `getWorkbookFingerprint()`
- `FEASIBILITY_NO_OP_PARITY`
- exact SHA constants

Prefer extending `getWorkbookFingerprint()` minimally. Do NOT build a second workbook parser/architecture if the existing helper can be extended.

## 5. Critical parity rule

```text
PARITY AUTHORITY = EXACT SOURCE SEMANTIC STRUCTURE.
ZIP BYTE-FOR-BYTE EQUALITY IS NOT REQUIRED.
NO-OP ROUNDTRIP MUST PRESERVE ALL MATERIAL WORKBOOK/WORKSHEET STRUCTURE.
```

Authoritative expected evidence must be derived from the exact SHA source BEFORE any observed override/mutation.

Required semantic proof must cover BOTH workbooks and EVERY worksheet present, not only sheet1.

### Workbook-level evidence

At minimum prove source-vs-roundtrip equality for:
- exact sheet name list and order;
- sheet visibility/state where present;
- workbook defined-name inventory relevant to printing, including sheet-scoped/global print areas;
- workbook relationship inventory already exposed by existing proof;
- no missing or unexpected worksheets.

### Per-worksheet evidence for EVERY worksheet

At minimum prove source-vs-roundtrip equality for material structure that exists in the exact source:
- worksheet identity/index;
- used-range / `<dimension>`;
- exact merge refs and declared merge count;
- column-definition structure (`<cols>` semantic/hash evidence);
- explicit row-height evidence;
- sheet-view material flags, especially gridline visibility;
- page margins;
- page setup including paper size, orientation, scale and fit-to-page semantics where present;
- print options / centering semantics where present;
- sheet protection presence/semantic fingerprint where present;
- print area binding for the sheet;
- worksheet relationship inventory where applicable.

Part B second visible `Sheet1` MUST be included in workbook-wide evidence even though it has no user-facing print area.

Existing relationship/media parity assertions may remain, but R3-R18 must NOT expand into image identity/removal/preservation semantics; that is the next separate blocker.

Do not require raw sample cell-value equality and do not emit raw values. Header/privacy identity already closed in R3-R17 and must not be reopened.

## 6. Exact-source facts that must remain true

At minimum the current accepted exact-source facts must remain provable after no-op roundtrip:

Part A main sheet:
- sheet `MBO Staff & Chief`;
- 193 merges;
- print area A1:BJ52;
- paper A3 / landscape / scale 58%;
- hidden gridlines;
- source margins preserved;
- fit-to-page semantics preserved;
- explicit row-height/column structure preserved.

Part B workbook:
- sheets `[(Part B) Competency, Sheet1]` in exact order;
- main sheet 79 merges;
- main print area A1:X35;
- paper A4 / portrait / scale 75%;
- horizontally centered;
- hidden gridlines;
- source margins preserved;
- main sheet protection semantics preserved;
- `Sheet1` remains present/visible and structurally source-consistent.

Do not hard-code these as a substitute for source-derived equality. They are baseline sanity checks; exact SHA source remains authority.

## 7. Fail-closed validator requirement

Use a real bounded workbook-parity validator/resolver path. It must rebuild authoritative expected fingerprint(s) from exact SHA source before any observed override.

Any material mismatch must deterministically throw exactly:

```text
BLOCKER_WORKBOOK_PARITY_UNRESOLVED
```

Examples include:
- missing/extra/reordered/renamed worksheet;
- sheet state mismatch;
- dimension mismatch;
- merge set/count mismatch;
- columns or row-height structure mismatch;
- gridline/view mismatch;
- page margin/setup/fit/centering mismatch;
- protection mismatch;
- print-area mismatch;
- relevant relationship inventory mismatch;
- missing/extra required per-sheet evidence.

Do not rely on incidental TypeError/assertion failure.

## 8. Mandatory source-backed tests

Preserve ALL accepted existing tests.

Positive proof:
1. Part A exact source -> no-op roundtrip passes workbook-wide validator.
2. Part B exact source -> no-op roundtrip passes workbook-wide validator.
3. Proof explicitly covers every worksheet in each workbook, including Part B `Sheet1`.

Mandatory negative proof using a REAL source-backed fingerprint and the REAL validator, with authoritative baseline independently rebuilt from exact source before mutation:
- mutate/remove one worksheet identity/order/state item => exact blocker;
- mutate one real merge/dimension/column-or-row structural item => exact blocker;
- mutate one real page margin/page setup/print-area/view item => exact blocker;
- mutate one real Part B protection OR second-sheet structural item => exact blocker.

Observed fingerprint override is allowed only for negative testing. Expected evidence must never be derived from the mutated observed object.

## 9. Preserve accepted work

Do not regress or reopen:
- R3-R17 header fingerprint/sanitized export parity;
- Part B privacy classification/evidence parity;
- typed privacy metadata completeness/validator shape;
- range-driven privacy clearing / zero sensitive-token proof;
- exact template SHA proof;
- current reference-image test behavior;
- current insertion/formula tests;
- Difficulty Level blank decision.

## 10. Out of scope — DO NOT TOUCH

Do NOT work on:
- reference-image full inventory/removal/preservation closure beyond preserving existing tests;
- Part A objective insertion structural matrix closure;
- Part B competency insertion structural matrix closure;
- formula/no-formula authority closure;
- production sanitizer/renderer;
- export service/normalizer/application code;
- combined production Excel;
- PDF/UI;
- Live Kintone;
- deploy;
- D3 or another Work Package.

## 11. Mandatory commands

Run exactly:

```text
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

Before commit only authorized feasibility file(s) may differ. After commit/push working tree must be clean.

## 12. Completion contract

Commit/push only authorized feasibility file(s), maximum these two:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

Before editing, record fresh-fetched current remote canonical HEAD as `EXECUTION_BASELINE`.
After push, verify remote HEAD differs from `EXECUTION_BASELINE` and is a fast-forward descendant.

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
WORKBOOK_PARITY_PROOF_PENDING_INDEPENDENT_REVIEW
BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE
BLOCKER_WORKBOOK_PARITY_UNRESOLVED
```

Antigravity must not declare D2-WP003 or D2 PASS/CLOSED and must not start another blocker/Work Package.

## 13. Authorization ledger

```text
D2-WP003-R3-R16-TEST-20260901-01 = CONSUMED / REVIEWED / DO NOT REUSE
D2-WP003-R3-R17-SOURCE-20260901-01 = CONSUMED / REVIEWED / PASS-CLOSED / DO NOT REUSE
D2-WP003-R3-R18-SOURCE-20260901-01 = ACTIVE / ONE WORK PACKAGE ONLY
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R18-SOURCE-20260901-01
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

Authorization is consumed when the R3-R18 implementation/blocker commit is pushed for independent review or invalidated by any scope/dependency change.
