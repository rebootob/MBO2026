# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / R3-R17 PASS-CLOSED / R3-R18 REVIEWED-NOT-PASS / R3-R19 PROPOSED**  
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

## 4. R3-R18 independent review

Implementation:

```text
e5d082059d05da4ac686568b55600fb12873e30d
```

Execution baseline:

```text
7d8fa41c93e950011b59d8a6951830fa6d289301
```

Verdict:

```text
D2-WP003-R3-R18_SCOPE_REVIEW = PASS
D2-WP003-R3-R18_SOURCE_REVIEW = FAIL / CORRECTIVE REQUIRED
D2-WP003-R3-R18_STATUS = NOT PASS / NOT CLOSED
PRIVACY_PURGE_REQUIRED = NO
```

Accepted R3-R18 work:
- `getWorkbookFingerprint()` now builds evidence for every worksheet;
- workbook sheet names/order/state are compared;
- Part B `Sheet1` is explicitly included;
- per-sheet merges, columns, explicit row heights, gridline/view flag, margins, page setup, fit/centering, protection and relationships are represented and compared;
- expected evidence is rebuilt from exact SHA source before observed override;
- positive Part A/B no-op validation and structural negative tests exist;
- previously accepted tests remain.

Remaining blockers:

### A. Per-sheet print-area binding
Current `getWorkbookFingerprint()` computes the requested `localSheetId` before the current `sheets[name]` entry is assigned. The expression therefore resolves to `0` for every worksheet and falls back to the first print-area defined name. This can incorrectly give Part B second `Sheet1` the main `'(Part B) Competency'!$A$1:$X$35` print area, even though the source second sheet has no user-facing print area.

Required authority:
- resolve `localSheetId` from actual worksheet index/order;
- bind each defined print area to its exact source sheet;
- no fallback that silently applies another sheet's print area;
- if a source sheet has no print area, observed must also have no print area.

### B. Missing dimension evidence
Current validator checks dimension only when both `obsSheet.dimension` and `authSheet.dimension` are truthy. An observed empty/missing dimension can bypass the comparison.

Required authority:
- exact dimension evidence equality for each source sheet;
- present-vs-missing must fail closed with `BLOCKER_WORKBOOK_PARITY_UNRESOLVED`.

### C. Missing negative proof
Add real source-backed negative tests for:
- wrong/non-empty print-area binding on Part B `Sheet1`;
- missing observed dimension on a sheet that has source dimension evidence.

## 5. Next proposed corrective — NOT AUTHORIZED

```text
PROPOSED_WORK_PACKAGE = D2-WP003-R3-R19
PROPOSED_WORK_PACKAGE_NAME = PER-SHEET PRINT-AREA BINDING + MISSING EVIDENCE FAIL-CLOSED
PROPOSED_STATUS = WAIT OWNER AUTHORIZATION
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ANTIGRAVITY = STOP / WAIT OWNER
```

R3-R19 is expected to be a minimal feasibility source/test correction only. Preserve all other accepted R3-R18 behavior.

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
D2-WP003-R3-R17 = PASS / CLOSED
D2-WP003-R3-R18 = REVIEWED / NOT PASS / NOT CLOSED
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
D2-WP003-R3-R17-SOURCE-20260901-01 = CONSUMED / REVIEWED / PASS-CLOSED / DO NOT REUSE
D2-WP003-R3-R18-SOURCE-20260901-01 = CONSUMED / REVIEWED / NOT PASS / DO NOT REUSE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
```
