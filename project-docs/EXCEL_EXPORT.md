# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / R3-R21 REVIEWED-NOT-PASS / R3-R22 PROPOSED TEST-ONLY**  
> Updated: 2026-09-01 ICT  
> Repository: `rebootob/MBO2026`  
> Canonical branch: `ai/antigravity-wp002c`

## 1. D2 objective and owner priority

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

Original employee-bearing binaries remain ignored/not publishable.

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

Do not reopen these without proven regression.

## 4. Frozen legacy/template facts

Part A:
- main sheet `MBO Staff & Chief`;
- source used range A1:BL52; print A1:BJ52;
- A3 landscape, scale 58%, fit-to-page, hidden gridlines;
- 193 merges, no legacy formulas;
- legacy base 4 objective rows, expandable through 10 by structural insertion;
- sanitized output must remove employee/sample/confidential values and historical screenshot while preserving approved branding/layout.

Part B:
- sheet order exactly `(Part B) Competency`, `Sheet1`;
- main used/print A1:X35;
- A4 portrait, scale 75%, horizontal centering, hidden gridlines, protection;
- 79 main-sheet merges, no legacy formulas;
- six legacy competency blocks; expandable to eight by complete 4-row block insertion before totals;
- `Sheet1` remains part of workbook-wide structural parity and has no print area.

Formula authority:
```text
LEGACY_TEMPLATE_FORMULA_COUNT = 0
APPLICATION SCORING / SECURED PROJECTION = CALCULATION AUTHORITY
```

PDF target:
```text
PART_A = A3 LANDSCAPE
PART_B = A4 PORTRAIT / PROTECTED PRESENTATION
```

## 5. Latest reviewed implementation — R3-R21

```text
IMPLEMENTATION = 1587b20b3920618b79b335c66bbdde1778570626
EXECUTION_BASELINE = 9853f018b2f759c8da19e0f2713216584a3f2113
D2-WP003-R3-R21_SCOPE_REVIEW = PASS
D2-WP003-R3-R21_SOURCE_REVIEW = FAIL / CORRECTIVE REQUIRED
D2-WP003-R3-R21_STATUS = NOT PASS / NOT CLOSED
PRIVACY_PURGE_REQUIRED = NO
```

Accepted source implementation:
- raw no-op output comes directly from `xlsx-populate.outputAsync()` without source-to-output dimension repair;
- workbook parity validator deterministically preserves template-source blocker and normalizes all other parity-path failures to `BLOCKER_WORKBOOK_PARITY_UNRESOLVED`;
- actual dimension-tag/absence fingerprinting only;
- exact per-sheet print-area binding by `localSheetId` and actual sheet index;
- Part B `Sheet1.colsHash` negative proof exists.

Remaining blocker is proof baseline isolation:
- mutation-specific negative tests use raw Part B `fpOutB/outBufB` as baseline even when raw output may already be parity-invalid;
- rejection can therefore be caused by a pre-existing dimension mismatch rather than the intended mutation;
- actual dimension removal must begin from a source buffer known to contain the tag;
- raw no-op result must be pinned independently.

## 6. Proposed R3-R22 — NOT AUTHORIZED

```text
PROPOSED_WORK_PACKAGE = D2-WP003-R3-R22
PROPOSED_WORK_PACKAGE_NAME = VALID SOURCE-BACKED NEGATIVE BASELINES + RAW NO-OP RESULT PINNING
PROPOSED_SCOPE = TEST-ONLY
PROPOSED_STATUS = WAIT OWNER AUTHORIZATION
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ANTIGRAVITY = STOP / WAIT OWNER
```

Expected R3-R22 direction:
- source implementation is read-only;
- mutation-specific negatives start from exact-source/source-backed fingerprints independently proven valid through the real validator;
- actual dimension-tag removal starts from exact source buffer containing the tag;
- raw Part A, Part B main and Part B `Sheet1` dimension presence/absence and real validator result are evaluated separately with no repair;
- deterministic normalization proof is isolated from any pre-existing raw parity defect;
- no unrelated source refactor.

## 7. D2 remaining closure path

After workbook-wide parity truth/proof isolation is independently accepted:
1. if raw no-op degradation is proven, authorize separate minimal preservation strategy;
2. reference-image inventory/removal/preservation closure;
3. Part A objective insertion structural matrix closure;
4. Part B competency insertion structural matrix closure;
5. formula/no-formula authority closure;
6. production sanitizer + XLSX renderer using secured export projection;
7. combined Part A + Part B Excel output parity;
8. PDF generation/parity;
9. export authorization/security/privacy regression;
10. final D2 independent closure review.

Do not auto-start any next step.

## 8. Current gate

```text
D2 = IN PROGRESS
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R21 = REVIEWED / NOT PASS / NOT CLOSED
ACTIVE_WORK_PACKAGE = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
D3 = HOLD UNTIL D2 PASS / CLOSED
ANTIGRAVITY = STOP / WAIT OWNER
PRIVACY_PURGE_REQUIRED = NO
```

## 9. Authorization ledger

```text
D2-WP003-R3-R18-SOURCE-20260901-01 = CONSUMED / DO NOT REUSE
D2-WP003-R3-R19-SOURCE-20260901-01 = CONSUMED / DO NOT REUSE
D2-WP003-R3-R20-SOURCE-20260901-01 = CONSUMED / DO NOT REUSE
D2-WP003-R3-R21-SOURCE-20260901-01 = CONSUMED / DO NOT REUSE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
```
