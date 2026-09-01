# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / R3-R26 BLOCKED / OWNER PRESERVATION DECISION REQUIRED**  
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
- observed-only `sheetPr` exception removed;
- all valid R3-R24 preservation negatives restored;
- raw no-op path remains frozen.

Current blockers:
1. direct raw Part B `outBufB` is explicitly rejected because xlsx-populate injects an observed-only `sheetPr` into Part B `Sheet1`, while the current strict preservation invariant allows only source `dimension` omission;
2. positive Part B proof pre-cleans a derivative of `outBufB` by deleting that `<sheetPr>` before calling preservation, so the proof bypasses the real raw-input incompatibility;
3. the same test explicitly proves direct `outBufB` rejection, so the current dimension-only preservation policy and actual xlsx-populate output cannot both hold;
4. regex-only Relationship and worksheet-child inventory can still silently skip valid XML element names/prefixes outside restricted regex character classes;
5. some required alias sub-cases remain under-tested directly (for example repeated `//`, leading `./`, full URI scheme/authority forms);
6. no GitHub CI/status/workflow run exists for the implementation commit.

R3-R26 does not close preservation or D2-WP003.

## 6. Owner preservation-policy decision

```text
DECISION_ID = D2-PRESERVATION-PARTB-SHEETPR-DECISION-01
STATUS = WAIT OWNER
```

Option A — STRICT SOURCE-MINUS-DIMENSION:
- keep observed-only `sheetPr` forbidden;
- abandon/redesign the current direct xlsx-populate Part B preservation path because it cannot satisfy the invariant.

Option B — NARROW DETERMINISTIC ALLOWED-DRIFT:
- explicitly allow only a precisely fingerprinted deterministic xlsx-populate-injected Part B `Sheet1` `sheetPr` drift;
- normalization/removal must happen inside the authorized preservation path, never in test setup;
- arbitrary/changed/reordered/extra `sheetPr` remains fail-closed;
- all other non-dimension drift remains forbidden.

No new Antigravity/Claude work is authorized until Owner chooses A or B.

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
D2 = IN PROGRESS / BLOCKED
D2-WP003 = BLOCKED / NOT CLOSED
D2-WP003-R3-R26 = REVIEWED / BLOCKED / NOT CLOSED
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUND = 4 OF 20
D2-WP003-R3-R26-SOURCE-20260902-01 = CONSUMED / BLOCKED / DO NOT REUSE
ACTIVE_WORK_PACKAGE = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
D3 = HOLD UNTIL D2 PASS / CLOSED
ANTIGRAVITY = STOP
CLAUDE = STOP
```
