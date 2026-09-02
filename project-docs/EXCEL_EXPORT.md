# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / R3-R27 CORRECTIVE / R3-R28 PROPOSED**  
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

## 5. Approved preservation-policy decision

```text
D2-PRESERVATION-PARTB-SHEETPR-DECISION-01 = OPTION B APPROVED
POLICY = NARROW DETERMINISTIC ALLOWED-DRIFT
```

Exactly one deterministic xlsx-populate-generated Part B `Sheet1` `<sheetPr/>` drift may be normalized only when source absence, exact structure and exact slot are proven from the SHA-verified template round trip. Normalization must happen inside preservation on the working copy. Raw/source buffers remain byte-immutable. All other non-dimension drift remains fail-closed; Part A has no exception.

## 6. Latest reviewed implementation — R3-R27

```text
AUTHORIZATION_COMMIT = 671948b3d4a935118172a3c849d9265eb606ac73
IMPLEMENTATION_COMMIT = f7a7c82e7d39dc799be9b3687b2b4137c9797c7a
D2-WP003-R3-R27_SCOPE_REVIEW = PASS
D2-WP003-R3-R27_SOURCE_REVIEW = FAIL / CORRECTIVE REQUIRED
D2-WP003-R3-R27_PROOF_REVIEW = FAIL / REGRESSION + WRONG-BRANCH + NO INDEPENDENT RUNTIME
D2-WP003-R3-R27_STATUS = NOT PASS / NOT CLOSED
PRIVACY_PURGE_REQUIRED = NO
```

Accepted R3-R27 improvements:
- positive Part B proof now uses direct raw `outBufB` with no test-side pre-clean;
- Option B handling occurs inside `preserveExactWorkbookDimensions()`;
- the allowed case checks Part B `worksheets/sheet2.xml`, source absence, observed first-child `sheetPr`, and exact tag `<sheetPr/>`;
- repeated `//`, leading `./`, embedded `/./`, URI scheme/authority, query and fragment negatives were added;
- raw no-op path remains frozen.

Current blockers:
1. allowed-drift removal changes local `obsXml`, but ZIP write-back happens only in the missing-dimension restoration branch; an already-correct observed dimension can therefore return a workbook that still contains the supposedly normalized `sheetPr`;
2. Relationship and worksheet-child inventory remains regex-only with ASCII QName classes and no proof that all direct-child markup was consumed; Unicode QName forms can be skipped rather than fail closed;
3. several valid R3-R25/R3-R26 negatives were removed again, including counterfeit/exact-Type, leading slash/already-`xl/`, backslash/percent-encoded and missing-boundary cases;
4. source-structure negative tests that mutate `sourceBufOverride` reject at the exact source-SHA gate before structural parsing, so their labels overstate what is proven;
5. no separate clean-checkout privacy-safe unit proof exists for pure lexical/XML/allowlist logic;
6. no GitHub CI/status/workflow signal exists for the implementation commit.

R3-R27 does not close preservation or D2-WP003.

## 7. Proposed R3-R28 — NOT AUTHORIZED

```text
PROPOSED_WORK_PACKAGE = D2-WP003-R3-R28
PROPOSED_WORK_PACKAGE_NAME = OPTION B WRITEBACK + COMPLETE XML TOKEN INVENTORY + EFFECTIVE PROOF CORRECTIVE
PROPOSED_SCOPE = EXISTING FEASIBILITY SOURCE + TEST ONLY
CORRECTIVE_BASELINE_COMMIT = f7a7c82e7d39dc799be9b3687b2b4137c9797c7a
PROPOSED_STATUS = WAIT OWNER AUTHORIZATION
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP / NOT NEEDED AT THIS GATE
```

R3-R28 direction:
- persist Option B normalization in every successful path;
- replace QName-regex assumptions with complete direct-child token/gap inventory that rejects any unknown/prefixed/Unicode markup rather than silently skipping it;
- factor pure validators so structural rules can be unit-tested without weakening exact source SHA enforcement;
- allow exact-template tests to skip/report unavailable only when ignored local templates are absent, while privacy-safe unit tests still run;
- restore all still-valid R3-R25/R3-R26 regression negatives;
- separate wrong-SHA gate proof from synthetic source-structure proof;
- keep raw buffers, source SHA, privacy boundaries and D3 hold frozen.

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
D2-WP003-R3-R27 = REVIEWED / NOT PASS / NOT CLOSED
D2-PRESERVATION-PARTB-SHEETPR-DECISION-01 = OPTION B APPROVED
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUND = 5 OF 20
D2-WP003-R3-R27-SOURCE-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
ACTIVE_WORK_PACKAGE = NONE
PROPOSED_WORK_PACKAGE = D2-WP003-R3-R28
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
D3 = HOLD UNTIL D2 PASS / CLOSED
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
```
