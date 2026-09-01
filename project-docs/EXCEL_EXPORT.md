# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / R3-R25 CORRECTIVE / R3-R26 PROPOSED**  
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

## 5. Latest reviewed implementation — R3-R25

```text
IMPLEMENTATION_COMMIT = 60b24f39b78013d37fe210192bb97876e0184638
D2-WP003-R3-R25_SCOPE_REVIEW = PASS
D2-WP003-R3-R25_SOURCE_REVIEW = FAIL / CORRECTIVE REQUIRED
D2-WP003-R3-R25_PROOF_REVIEW = FAIL / REGRESSION + INCOMPLETE
D2-WP003-R3-R25_STATUS = NOT PASS / NOT CLOSED
PRIVACY_PURGE_REQUIRED = NO
```

R3-R25 accepted improvements:
- exact canonical worksheet relationship Type;
- global duplicate relationship-ID checking before sheet binding;
- exact source/observed Type/target/TargetMode tuple comparison;
- predecessor/successor schema checks;
- raw no-op path remains frozen.

Remaining blockers:
- relationship Target lexical identity is not strict: leading-slash and already-`xl/` aliases can normalize to the same ZIP path as the verified source;
- Relationship scanner only recognizes unprefixed `<Relationship>` tags, so prefixed relationship elements can be omitted from the global inventory;
- worksheet top-level child scanner only recognizes unprefixed alphanumeric element names, so prefixed top-level children can be silently skipped;
- observed-only `sheetPr` exception weakens exact source-minus-dimension top-level-order equality;
- R3-R25 removed valid R3-R24 preservation negatives despite explicit regression-preservation requirements;
- removed proof includes missing relationship, duplicate target, actual target swap, cross-sheet, non-worksheet/external, source/observed dimension and malformed-buffer negatives;
- target alias proof covers `..` traversal but not leading-slash/already-`xl/`/dot/encoded aliases;
- no GitHub CI/status checks or workflow runs exist for the implementation commit.

R3-R25 does not close preservation or D2-WP003.

## 6. Proposed R3-R26 — NOT AUTHORIZED

```text
PROPOSED_WORK_PACKAGE = D2-WP003-R3-R26
PROPOSED_WORK_PACKAGE_NAME = STRICT TARGET LEXICAL IDENTITY + PROOF REGRESSION RESTORE CORRECTIVE
PROPOSED_SCOPE = EXISTING FEASIBILITY SOURCE + TEST ONLY
CORRECTIVE_BASELINE_COMMIT = 60b24f39b78013d37fe210192bb97876e0184638
PROPOSED_STATUS = WAIT OWNER AUTHORIZATION
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ANTIGRAVITY = STOP / WAIT OWNER
```

R3-R26 direction:
- preserve exact Type/global-ID/source-SHA gates;
- compare exact raw source/observed relationship Target lexical form before ZIP lookup;
- reject leading slash, already-`xl/`, dot segments, encoded aliases and URI ambiguity;
- parse or explicitly reject namespace-prefixed Relationship/top-level worksheet children;
- require exact source-minus-dimension top-level child order with no observed-only `sheetPr` exception;
- restore all valid R3-R24 preservation negatives, then retain/add R3-R25/R3-R26 proof;
- keep raw buffers frozen.

## 7. D2 remaining closure path

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

## 8. Current gate / authorization ledger

```text
D2 = IN PROGRESS
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R25 = REVIEWED / NOT PASS / NOT CLOSED
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUND = 3 OF 20
D2-WP003-R3-R25-SOURCE-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
ACTIVE_WORK_PACKAGE = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
D3 = HOLD UNTIL D2 PASS / CLOSED
ANTIGRAVITY = STOP / WAIT OWNER
```
