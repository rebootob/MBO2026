# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / D2-WP001 PASS-CLOSED / D2-WP002 PASS-CLOSED / R3-R13 PASS-CLOSED / R3-R16 PASS-CLOSED / R3-R17 PASS-CLOSED / R3-R18 AUTHORIZED**  
> Updated: 2026-09-01 ICT  
> Repository: `rebootob/MBO2026`  
> Canonical branch: `ai/antigravity-wp002c`

## 1. D2 objective

Deliver Excel/PDF outputs preserving approved legacy PMS presentation while using current App794/configuration truth and D1 security/privacy boundaries.

Owner priority:

```text
COMPLETE D2 FULLY BEFORE D3.
```

## 2. Authority split

```text
LEGACY TEMPLATE = VISUAL / LAYOUT AUTHORITY
CONFIRMED_BASELINE + CURRENT APP CONFIG = BUSINESS RULE AUTHORITY
SECURED MboExportService PROJECTION = EXPORT DATA AUTHORITY
```

Accepted source fingerprints:

```text
PART_A_SHA256 = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B_SHA256 = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
```

## 3. Accepted feasibility foundations

```text
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003-R3-R13 = PASS / CLOSED
D2-WP003-R3-R16 = PASS / CLOSED
D2-WP003-R3-R17 = PASS / CLOSED
PART_B_PRIVACY_CLASSIFICATION_EVIDENCE_PARITY = PASS / CLOSED
TYPED_PRIVACY_METADATA_COMPLETENESS = PASS / CLOSED
TYPED_METADATA_VALIDATOR_SHAPE = PASS / CLOSED
HEADER_FINGERPRINT_SANITIZED_EXPORT_PARITY = PASS / CLOSED
DIFFICULTY_LEVEL_EXPORT = BLANK TEMPORARILY
```

Accepted privacy/typed-metadata/header work must not reopen without proven regression.

## 4. D2-WP003-R3-R18 — AUTHORIZED

Purpose: **workbook-wide source-vs-roundtrip semantic structural parity completeness only**.

```text
CONTROL_PLANE_PRE_AUTH_CHECKPOINT = 4666db780a32179061c5f15f96bc0bda10ad4010
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R18-SOURCE-20260901-01
EXECUTOR = ANTIGRAVITY
ANTIGRAVITY_MODE = LOW-CREDIT / BOUNDED
MAX_EXECUTOR_STATUS = WORKBOOK_PARITY_PROOF_PENDING_INDEPENDENT_REVIEW
PRIVACY_PURGE_REQUIRED = NO
```

Authorized writes ONLY:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`;
- `tests/mbo-xlsx-ooxml-feasibility.test.js`.

No package/dependency changes and no binary publication.

Antigravity must fresh-fetch current authorized canonical HEAD and use that as `EXECUTION_BASELINE`; the pre-authorization checkpoint is not an executor reset target.

## 5. Workbook-wide parity authority

Critical rule:

```text
EXACT SHA SOURCE = STRUCTURAL AUTHORITY.
SEMANTIC PARITY IS REQUIRED; ZIP BYTE EQUALITY IS NOT.
EVERY WORKSHEET MUST BE INCLUDED.
```

Reuse current `getWorkbookFingerprint()` and `FEASIBILITY_NO_OP_PARITY` before adding anything.

Expected source fingerprints must be derived BEFORE mutation/override.

Required workbook-level parity:
- exact sheet names/order;
- sheet visibility/state where present;
- defined-name/print-area inventory;
- relevant workbook relationship inventory;
- no missing/extra worksheets.

Required per-sheet parity for every worksheet:
- used-range/dimension;
- exact merge refs and declared merge count;
- column structure;
- explicit row-height structure;
- material sheet-view/gridline flags;
- page margins;
- page setup: paper/orientation/scale/fit semantics where present;
- print options / centering where present;
- protection semantics where present;
- sheet print-area binding;
- relevant worksheet relationships where present.

Part B second visible `Sheet1` must be covered even though it is not the user-facing printed sheet.

Do not compare or log raw employee/sample values.

Existing relationship/media assertions may stay, but full image identity/removal/preservation closure remains the next separate blocker.

## 6. Accepted exact-source sanity facts

These are baseline sanity facts, not substitutes for source-derived equality.

### Part A
- main sheet `MBO Staff & Chief`;
- 193 merges;
- print area A1:BJ52;
- A3 landscape;
- scale 58%;
- hidden gridlines;
- source margins and fit-to-page semantics preserved;
- explicit row heights and column structure preserved.

### Part B
- sheet order `[(Part B) Competency, Sheet1]`;
- main sheet 79 merges;
- main print area A1:X35;
- A4 portrait;
- scale 75%;
- horizontally centered;
- hidden gridlines;
- source margins preserved;
- main sheet protection semantics preserved;
- second `Sheet1` remains present/visible/structurally source-consistent.

## 7. Fail-closed proof

A real source-backed workbook parity validator must deterministically throw:

```text
BLOCKER_WORKBOOK_PARITY_UNRESOLVED
```

for material mismatch such as:
- missing/extra/reordered/renamed worksheet;
- state mismatch;
- dimension or merge mismatch;
- column/row-height mismatch;
- sheet-view/gridline mismatch;
- page margin/setup/fit/centering mismatch;
- protection mismatch;
- print-area mismatch;
- relevant relationship mismatch;
- missing/extra per-sheet evidence.

No incidental TypeError as the blocker contract.

## 8. Mandatory tests

Preserve ALL accepted existing tests.

Positive source-backed proof:
- Part A exact source -> no-op roundtrip passes workbook-wide validator;
- Part B exact source -> no-op roundtrip passes workbook-wide validator;
- every worksheet is explicitly represented, including Part B `Sheet1`.

Mandatory negative cases through the real validator with expected evidence rebuilt independently from exact source before mutation:
- worksheet identity/order/state mutation;
- one real merge/dimension/column-or-row mutation;
- one real margin/page setup/print-area/view mutation;
- one real Part B protection or second-sheet structural mutation.

## 9. Explicit exclusions

R3-R18 does NOT close or modify:
- reference-image full inventory/removal/preservation semantics;
- Part A objective insertion structural matrix;
- Part B competency insertion structural matrix;
- formula/no-formula authority;
- production sanitizer/XLSX renderer;
- export service/normalizer/application;
- combined production Excel;
- PDF/UI;
- Live Kintone;
- deploy;
- D3.

Mandatory commands:

```text
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

Final executor status exactly one of:

```text
WORKBOOK_PARITY_PROOF_PENDING_INDEPENDENT_REVIEW
BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE
BLOCKER_WORKBOOK_PARITY_UNRESOLVED
```

## 10. D2 remaining closure path

After R3-R18 is independently accepted, remaining work stays bounded and proceeds unless later evidence proves a step already satisfied:

1. reference-image inventory/removal/preservation closure;
2. Part A objective insertion structural matrix closure;
3. Part B competency insertion structural matrix closure;
4. formula/no-formula authority closure;
5. production sanitizer + XLSX renderer using secured export projection;
6. combined Part A + Part B Excel output parity;
7. PDF generation/parity for Part A A3 landscape and Part B A4 portrait;
8. export authorization/security/privacy regression;
9. final D2 independent closure review.

Do not auto-start any next step without bounded authorization.

## 11. Current gate

```text
D2 = IN PROGRESS
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R17 = PASS / CLOSED
D2-WP003-R3-R18 = AUTHORIZED / EXECUTION ACTIVE
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R18
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R18-SOURCE-20260901-01
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
D3 = HOLD UNTIL D2 PASS / CLOSED
ANTIGRAVITY = EXECUTE R3-R18 ONLY / LOW-CREDIT / BOUNDED
PRIVACY_PURGE_REQUIRED = NO
```

## 12. Authorization ledger

```text
D2-WP003-R3-R17-SOURCE-20260901-01 = CONSUMED / REVIEWED / PASS-CLOSED / DO NOT REUSE
D2-WP003-R3-R18-SOURCE-20260901-01 = ACTIVE / ONE WORK PACKAGE ONLY
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R18-SOURCE-20260901-01
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
```
