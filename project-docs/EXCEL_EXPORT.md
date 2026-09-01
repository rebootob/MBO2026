# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / D2-WP001 PASS-CLOSED / D2-WP002 PASS-CLOSED / R3-R9 REVIEWED-NOT-PASS / R3-R10 PROPOSED**  
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

Scope review = PASS. Implementation `068bba6ae8cccc9bcc7fe9c36facf1effa97b63f` changed only the two authorized feasibility files. No binary/package/application/Kintone/deploy changes; no Privacy Purge required.

Actual accepted progress is limited to formula worksheet/cell/node-hash identity.

Feasibility acceptance = FAIL because the final assertion closure was not implemented. The test file adds only a completion comment and the previous blockers remain:
1. Part B classification is still hard-coded/self-declared rather than source-backed.
2. typed metadata exact address-set/duplicate/type/nonblank/date/boolean reconciliation is incomplete.
3. header normalized-type/runtime merged-region proof is incomplete.
4. workbook source-vs-output parity is incomplete for dimension, mergeCountAttr, explicit row-height/customHeight, full page/protection and reparse.
5. reference-image proof lacks complete target-normalized inventory equality.
6. structural matrix remains incomplete across Part A 4/5/10 and Part B 6/8.
7. formula helper now has node hash, but the original/sanitized/structural test matrix is still incomplete.
8. GitHub has no CI/status evidence.

## 5. Proposed D2-WP003-R3-R10

R3-R10 is intentionally narrow to conserve executor credits. It must solve only **source-backed Part B privacy classification** before any other proof work resumes.

Expected writes only:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`;
- `tests/mbo-xlsx-ooxml-feasibility.test.js`.

Mandatory direction:
- load the exact SHA-verified Part B owner template;
- inspect rows 2:34 from actual source;
- attach safe evidence per candidate address: merge membership, style id, normalized type, blank/nonblank and safe hash where needed;
- build complete protected-static roles from actual template structure and frozen labels/competency/rating guidance;
- every sensitive address must have source evidence and explicit role justification;
- tests iterate every sensitive and protected-static address and prove exact disjointness;
- broad range / row-number membership alone is not proof;
- any unresolved address => `BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED`.

No typed/header/workbook/image/structural/formula closure is in R3-R10 scope. Those resume only after the root classification blocker is independently accepted.

## 6. Current gate

```text
D2 = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R9 = REVIEWED / NOT PASS / NOT CLOSED
D2-WP003-R3-R10 = PROPOSED / OWNER APPROVAL REQUIRED / NOT STARTED
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = STOP / WAIT OWNER
PRIVACY_PURGE_REQUIRED = NO
```

D2 remains open until production Excel/combined/PDF parity and export security are independently accepted.
