# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / D2-WP001 PASS-CLOSED / D2-WP002 PASS-CLOSED / R3-R9 REVIEWED-NOT-PASS / R3-R10 AUTHORIZED**  
> Updated: 2026-09-01 ICT  
> Repository: `rebootob/MBO2026`  
> Canonical branch: `ai/antigravity-wp002c`

## 1. D2 objective

Deliver Excel/PDF outputs preserving approved legacy PMS presentation while using current App794/configuration truth and D1 security/privacy boundaries.

## 2. Authority split

```text
LEGACY TEMPLATE = VISUAL / LAYOUT AUTHORITY
CONFIRMED_BASELINE + CURRENT APP CONFIG = BUSINESS RULE AUTHORITY
SECURED MboExportService PROJECTION = EXPORT DATA AUTHORITY
```

Closed foundations:
```text
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
DIFFICULTY_LEVEL_EXPORT = BLANK TEMPORARILY
```

Accepted source fingerprints:
```text
PART_A_SHA256 = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B_SHA256 = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
```

## 3. Frozen geometry

Part A:
```text
MAIN_SHEET = MBO Staff & Chief
PRINT_AREA = A1:BJ52
PAPER_SIZE = A3 / paperSize 8
ORIENTATION = LANDSCAPE
SCALE = 58
MERGED_RANGES = 193
OBJECTIVE_ROWS = 25:28
LOWER_SECTION_START = 29
```

Part B:
```text
MAIN_SHEET = (Part B) Competency
SECOND_SHEET = Sheet1
PRINT_AREA = A1:X35
PAPER_SIZE = A4 / paperSize 9
ORIENTATION = PORTRAIT
SCALE = 75
HORIZONTAL_CENTERED = YES
SHEET_PROTECTION = YES
MERGED_RANGES = 79
FINAL_LEGACY_BLOCK = 27:30
TOTALS_SIGNATURE_START = 31
```

## 4. R3-R9 review result

Scope review = PASS. Source review = FAIL. Implementation `068bba6ae8cccc9bcc7fe9c36facf1effa97b63f` only added formula node-hash identity and did not implement final assertion closure. No Privacy Purge required.

Root blocker remains Part B source-backed privacy classification.

## 5. D2-WP003-R3-R10 — AUTHORIZED

```text
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R10
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R10-SOURCE-20260901-01
PRIVACY_PURGE_REQUIRED = NO
MAX_EXECUTOR_STATUS = CLASSIFICATION_PROOF_PENDING_INDEPENDENT_REVIEW
```

R3-R10 is intentionally narrow and may modify only:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`;
- `tests/mbo-xlsx-ooxml-feasibility.test.js`.

No package/dependency changes and no binary publication.

## 6. Mandatory R3-R10 proof

Use the exact SHA-verified Part B owner template and solve only source-backed classification:
- inspect actual rows 2:34;
- produce safe evidence for every classified address: merge membership, style id, normalized type `string|number|date|boolean|blank`, blank/nonblank and safe hash where useful;
- establish explicit source-role justification for every sensitive and protected-static address;
- build complete protected-static coverage for title/header labels/competency names/descriptions/rating guidance/other static text;
- tests iterate every sensitive and every protected address;
- prove exact `SENSITIVE ∩ PROTECTED_STATIC = empty`;
- broad-range/row-number/self-declared table is not acceptance evidence;
- ambiguity => `BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED`.

No typed/header/workbook/image/structural/formula closure is in R3-R10 scope. Those blockers remain deferred until this root classification gate is independently accepted.

## 7. Explicit exclusions

No XLSX/image/media/output commit; no package/dependency change; no production sanitizer/renderer; no normalizer/export-service change; no PDF/UI/Live Kintone/deploy; no next Work Package.

Mandatory commands:
```text
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

## 8. Current gate

```text
D2 = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R9 = REVIEWED / NOT PASS / NOT CLOSED
D2-WP003-R3-R10 = AUTHORIZED / EXECUTION ACTIVE
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R10-SOURCE-20260901-01
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = EXECUTE R3-R10 ONLY / LOW-CREDIT
PRIVACY_PURGE_REQUIRED = NO
```

D2 remains open until production Excel/combined/PDF parity and export security are independently accepted.
