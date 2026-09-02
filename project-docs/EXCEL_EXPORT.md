# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / OPTION B APPROVED / R3-R27 PROPOSED**  
> Updated: 2026-09-02 ICT  
> Repository: `rebootob/MBO2026`  
> Canonical branch: `ai/antigravity-wp002c`

## 1. D2 objective and owner priority

Deliver Excel/PDF outputs preserving approved legacy PMS presentation while using current App794/configuration truth and D1 security/privacy boundaries.

```text
COMPLETE D2 FULLY BEFORE D3.
```

## 2. Authority split / source identity

```text
LEGACY TEMPLATE = VISUAL / LAYOUT AUTHORITY
CONFIRMED_BASELINE + CURRENT APP CONFIG = BUSINESS RULE AUTHORITY
SECURED MboExportService PROJECTION = EXPORT DATA AUTHORITY
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
D2-WP003-R3-R22 = PASS / CLOSED
PART_B_PRIVACY_CLASSIFICATION_EVIDENCE_PARITY = PASS / CLOSED
TYPED_PRIVACY_METADATA_COMPLETENESS = PASS / CLOSED
TYPED_METADATA_VALIDATOR_SHAPE = PASS / CLOSED
HEADER_FINGERPRINT_SANITIZED_EXPORT_PARITY = PASS / CLOSED
DIFFICULTY_LEVEL_EXPORT = BLANK TEMPORARILY
```

Do not reopen these without proven regression. Raw `getNoOpParityBuffers()` remains direct unrepaired `xlsx-populate.outputAsync()` output.

## 4. Frozen legacy/template facts

Part A:
- main sheet `MBO Staff & Chief`;
- source used range A1:BL52; print A1:BJ52;
- A3 landscape, scale 58%, fit-to-page, hidden gridlines;
- 193 merges, no legacy formulas;
- legacy base 4 objective rows, expandable through 10 by structural insertion.

Part B:
- sheet order exactly `(Part B) Competency`, `Sheet1`;
- main used/print A1:X35;
- A4 portrait, scale 75%, horizontal centering, hidden gridlines, protection;
- 79 main-sheet merges, no legacy formulas;
- six legacy competency blocks; expandable to eight by complete 4-row block insertion;
- `Sheet1` remains part of workbook-wide structural parity and has no print area.

```text
LEGACY_TEMPLATE_FORMULA_COUNT = 0
APPLICATION SCORING / SECURED PROJECTION = CALCULATION AUTHORITY
PDF PART_A = A3 LANDSCAPE
PDF PART_B = A4 PORTRAIT / PROTECTED PRESENTATION
```

## 5. Latest reviewed implementation — R3-R26

```text
AUTHORIZATION_COMMIT = d9eeb38436c2b9a45246048af41c682805bb847e
IMPLEMENTATION_COMMIT = b8cd007483e6e3ffbdc5767571e4f90d34973d2b
D2-WP003-R3-R26_SCOPE_REVIEW = PASS
D2-WP003-R3-R26_SOURCE_REVIEW = FAIL / PRESERVATION-INVARIANT CONFLICT + XML SCANNER GAP
D2-WP003-R3-R26_PROOF_REVIEW = FAIL / CONTRACT-BYPASS + INCOMPLETE
D2-WP003-R3-R26_STATUS = BLOCKED / NOT PASS / NOT CLOSED
PRIVACY_PURGE_REQUIRED = NO
```

Accepted R3-R26 improvements:
- strict raw relationship Target lexical identity and no alias normalization;
- exact canonical worksheet relationship Type + global duplicate-ID + exact relationship tuple remain enforced;
- observed-only `sheetPr` generic exception removed;
- all valid R3-R24 preservation negatives restored;
- raw no-op path remains frozen.

R3-R26 proved an architecture conflict: direct raw Part B `outBufB` includes one xlsx-populate-generated observed-only `sheetPr` in `Sheet1`, while the strict source-minus-dimension rule rejected it. The positive Part B proof only passed after test-side pre-cleaning, so it did not prove direct raw preservation. Regex-only XML inventory and several alias proof sub-cases also remained incomplete.

## 6. Approved preservation-policy decision

```text
DECISION_ID = D2-PRESERVATION-PARTB-SHEETPR-DECISION-01
DECISION = OPTION B
STATUS = APPROVED
POLICY = NARROW DETERMINISTIC ALLOWED-DRIFT
```

Option B authorizes the policy only:
- exactly one deterministic xlsx-populate-generated Part B `Sheet1` `sheetPr` may be normalized only if its exact structure/value/fingerprint and exact slot are pinned from SHA-verified owner-template round-trip evidence;
- exact source must lack that element;
- normalization/removal occurs inside preservation on the working copy, never in test setup;
- raw/source inputs remain byte-immutable;
- modified/extra/duplicate/reordered/moved/other-sheet/Part-A `sheetPr` remains fail-closed;
- every other non-dimension drift remains forbidden.

## 7. Proposed R3-R27 — NOT AUTHORIZED

```text
PROPOSED_WORK_PACKAGE = D2-WP003-R3-R27
PROPOSED_WORK_PACKAGE_NAME = NARROW PART B SHEETPR ALLOWED-DRIFT + COMPLETE XML INVENTORY CORRECTIVE
PROPOSED_SCOPE = EXISTING FEASIBILITY SOURCE + TEST ONLY
CORRECTIVE_BASELINE_COMMIT = b8cd007483e6e3ffbdc5767571e4f90d34973d2b
PROPOSED_STATUS = WAIT OWNER AUTHORIZATION
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP / NOT NEEDED AT THIS GATE
```

R3-R27 direction:
- implement the one approved `Sheet1` drift allowlist inside `preserveExactWorkbookDimensions()`;
- direct raw `outBufB` must be used for the positive Part B preservation proof with no test-side pre-cleaning;
- close Relationship/worksheet-child XML inventory gaps so valid QName forms cannot be silently skipped;
- reject duplicate maxOccurs=1 schema children independently;
- add repeated `//`, leading `./`, embedded `/./`, full URI scheme/authority, query/fragment and other missing proof sub-cases;
- retain all restored R3-R24/R3-R25/R3-R26 negatives and exact source-SHA/raw/privacy boundaries;
- add privacy-safe unit proof for pure validators when exact owner templates are unavailable.

## 8. D2 remaining closure path

After preservation closes:
1. reference-image inventory/removal/preservation closure;
2. Part A objective insertion structural matrix closure;
3. Part B competency insertion structural matrix closure;
4. formula/no-formula authority closure;
5. production sanitizer + XLSX renderer using secured export projection;
6. combined Part A + Part B Excel output parity;
7. PDF generation/parity;
8. export authorization/security/privacy regression;
9. final D2 independent closure review.

Do not auto-start any next step.

## 9. Current gate / authorization ledger

```text
D2 = IN PROGRESS
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R26 = REVIEWED / BLOCKED / NOT CLOSED
D2-PRESERVATION-PARTB-SHEETPR-DECISION-01 = OPTION B APPROVED
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUND = 4 OF 20
D2-WP003-R3-R26-SOURCE-20260902-01 = CONSUMED / BLOCKED / DO NOT REUSE
ACTIVE_WORK_PACKAGE = NONE
PROPOSED_WORK_PACKAGE = D2-WP003-R3-R27
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
D3 = HOLD UNTIL D2 PASS / CLOSED
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
```
