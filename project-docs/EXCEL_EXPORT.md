# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / R3-R17 PASS-CLOSED / R3-R18 REVIEWED-NOT-PASS / R3-R19 REVIEWED-NOT-PASS / R3-R20 PROPOSED**  
> Updated: 2026-09-01 ICT  
> Repository: `rebootob/MBO2026`  
> Canonical branch: `ai/antigravity-wp002c`

## 1. D2 objective and priority

Deliver Excel/PDF outputs preserving approved legacy PMS presentation while using current App794/configuration truth and D1 security/privacy boundaries.

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

## 4. R3-R19 independent review

Implementation:

```text
4a3092b3e69a68d3a5e864173f8c2e5c182eee54
```

Execution baseline:

```text
d2f43ade77da4895a371749b997c5337f5cbbf42
```

Verdict:

```text
D2-WP003-R3-R19_SCOPE_REVIEW = PASS
D2-WP003-R3-R19_SOURCE_REVIEW = FAIL / CORRECTIVE REQUIRED
D2-WP003-R3-R19_STATUS = NOT PASS / NOT CLOSED
PRIVACY_PURGE_REQUIRED = NO
```

Accepted R3-R19 changes:
- `_xlnm.Print_Area` now maps by exact `localSheetId` and actual zero-based worksheet order;
- no cross-sheet fallback;
- Part B main sheet keeps its exact print area;
- Part B second `Sheet1` is proven to have no print area;
- validator compares dimension exactly without truthiness gating;
- real negative tests cover wrong `Sheet1.printArea` and blank observed dimension.

Remaining blockers:

### A. Actual dimension-tag evidence must remain fail-closed
Current helper synthesizes a `<dimension .../>` string from row/cell coordinates if the workbook XML lacks a real `<dimension>` tag. That can hide missing observed evidence. Exact owner-template source files already contain explicit dimension tags on all relevant worksheets, so the proof must fingerprint the actual tag/absence condition instead of manufacturing a replacement.

### B. Preserve accepted second-sheet structural negative proof
R3-R18 included a fail-closed mutation of Part B `Sheet1.colsHash`. R3-R19 removed that test even though the corrective contract required all accepted R3-R18 tests/proofs to remain. Restore it without redesigning the validator.

## 5. Next proposed corrective — NOT AUTHORIZED

```text
PROPOSED_WORK_PACKAGE = D2-WP003-R3-R20
PROPOSED_WORK_PACKAGE_NAME = STRICT DIMENSION TAG EVIDENCE + RESTORE SECOND-SHEET STRUCTURAL NEGATIVE PROOF
PROPOSED_STATUS = WAIT OWNER AUTHORIZATION
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ANTIGRAVITY = STOP / WAIT OWNER
```

R3-R20 should be a minimal feasibility source/test correction only:
- preserve R3-R19 print-area binding and unconditional dimension equality;
- remove synthetic dimension reconstruction and expose actual OOXML dimension evidence only;
- prove missing actual dimension evidence fails with `BLOCKER_WORKBOOK_PARITY_UNRESOLVED`;
- restore the Part B `Sheet1.colsHash` negative test;
- no unrelated refactor.

## 6. D2 remaining closure path

After workbook-wide parity is independently accepted, continue bounded steps:
1. reference-image inventory/removal/preservation closure;
2. Part A objective insertion structural matrix closure;
3. Part B competency insertion structural matrix closure;
4. formula/no-formula authority closure;
5. production sanitizer + XLSX renderer using secured export projection;
6. combined Part A + Part B Excel output parity;
7. PDF generation/parity for Part A A3 landscape and Part B A4 portrait;
8. export authorization/security/privacy regression;
9. final D2 independent closure review.

Do not auto-start the next step.

## 7. Current gate

```text
D2 = IN PROGRESS
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R19 = REVIEWED / NOT PASS / NOT CLOSED
ACTIVE_WORK_PACKAGE = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
D3 = HOLD UNTIL D2 PASS / CLOSED
ANTIGRAVITY = STOP / WAIT OWNER
PRIVACY_PURGE_REQUIRED = NO
```

## 8. Authorization ledger

```text
D2-WP003-R3-R18-SOURCE-20260901-01 = CONSUMED / REVIEWED / NOT PASS / DO NOT REUSE
D2-WP003-R3-R19-SOURCE-20260901-01 = CONSUMED / REVIEWED / NOT PASS / DO NOT REUSE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
```
