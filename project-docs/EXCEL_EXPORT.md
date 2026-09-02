# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / R3-R28 CORRECTIVE / R3-R29 PROPOSED**  
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

Exactly one deterministic xlsx-populate-generated Part B `Sheet1` `<sheetPr/>` drift may be normalized only when source absence, exact structure and exact slot are proven from the SHA-verified template round trip. All other non-dimension drift remains forbidden.

## 6. Latest reviewed implementation — R3-R28

```text
AUTHORIZATION_COMMIT = 9598602238d2f46614b6a135f0422b8e744b862a
IMPLEMENTATION_COMMIT = 7fcf68e687ed2e76df418a4c7b0dd7b5bf8663de
D2-WP003-R3-R28_SCOPE_REVIEW = PASS
D2-WP003-R3-R28_SOURCE_REVIEW = FAIL / SINGLETON-SCHEMA CONTRACT GAP
D2-WP003-R3-R28_PROOF_REVIEW = FAIL / REGRESSION + WRONG-BRANCH + INCOMPLETE
D2-WP003-R3-R28_STATUS = NOT PASS / NOT CLOSED
PRIVACY_PURGE_REQUIRED = NO
```

Accepted R3-R28 improvements:
- Option B write-back persistence fixed;
- XML Relationship/worksheet top-level inventory now uses coverage/gap validation rather than ASCII QName-only matching;
- template-independent unit tests added;
- exact-template tests can skip when local ignored owner binaries are absent;
- direct raw A/B path remains frozen.

Current blockers:
1. singleton occurrence set is wrong/incomplete (`cols` is repeatable but guarded as singleton; supported singleton containers such as `mergeCells`, `hyperlinks`, `oleObjects`, `controls`, `tableParts` are omitted);
2. missing-boundary source structural test still rejects at source SHA first;
3. required exact per-sheet print-area binding and Part B `Sheet1.colsHash` negative are absent;
4. much prior valid preservation regression coverage was removed;
5. actual non-ASCII Unicode QName proof is absent;
6. Option B duplicate/extra/moved/other-sheet/Part-A fail-closed unit proof is incomplete;
7. accepted header-fingerprint and typed-privacy negative matrices were reduced;
8. no GitHub CI/status/workflow signal exists.

R3-R28 does not close preservation or D2-WP003.

## 7. Proposed R3-R29 — NOT AUTHORIZED

```text
PROPOSED_WORK_PACKAGE = D2-WP003-R3-R29
PROPOSED_WORK_PACKAGE_NAME = SINGLETON SCHEMA FIX + FULL REGRESSION RESTORE + EFFECTIVE STRUCTURAL PROOF
PROPOSED_SCOPE = EXISTING FEASIBILITY SOURCE + TEST ONLY
CORRECTIVE_BASELINE_COMMIT = 7fcf68e687ed2e76df418a4c7b0dd7b5bf8663de
PROPOSED_STATUS = WAIT OWNER AUTHORIZATION
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP / NOT NEEDED AT THIS GATE
```

R3-R29 direction:
- correct maxOccurs semantics for the exact supported worksheet child set;
- preserve R3-R28 write-back and XML coverage improvements;
- factor effective pure worksheet structural validation for dimension/boundary proof;
- restore every still-valid R3-R24/R3-R25/R3-R26 regression deleted in R3-R28 from Git history;
- restore exact per-sheet print-area and Part B `Sheet1.colsHash` proof;
- restore accepted header-fingerprint and typed-privacy negative guards;
- add real non-ASCII Unicode QName negatives;
- complete Option B negative/fail-closed proof.

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
D2-WP003-R3-R28 = REVIEWED / NOT PASS / NOT CLOSED
D2-PRESERVATION-PARTB-SHEETPR-DECISION-01 = OPTION B APPROVED
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUND = 6 OF 20
D2-WP003-R3-R28-SOURCE-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
ACTIVE_WORK_PACKAGE = NONE
PROPOSED_WORK_PACKAGE = D2-WP003-R3-R29
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
D3 = HOLD UNTIL D2 PASS / CLOSED
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
```
