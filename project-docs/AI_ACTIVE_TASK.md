# AI ACTIVE TASK — D2-WP003-R4 PART A STRUCTURAL MATRIX PROPOSED

Mode: **CONTROL PLANE / READ-ONLY PLAN COMPLETE / LOW-CREDIT / NO ACTIVE EXECUTOR / NO KINTONE / NO DEPLOY / D3 HOLD**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-02 ICT

Repository truth and accepted newer Live evidence always win. Fresh-fetch current branch HEAD before acting.

```text
TASK_STATE = WAIT_OWNER_WORK_PACKAGE_AUTHORIZATION
D1_OVERALL = PASS / CLOSED
D2_STATUS = IN PROGRESS
D2_PRESERVATION_GATE = PASS / CLOSED
D2_REFERENCE_IMAGE_GATE = PASS / CLOSED
REFERENCE_IMAGE_SOURCE_REVIEW = PASS / FROZEN
D2-WP003-R3-R36 = PASS / CLOSED
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_USED = 15
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_REMAINING = 5
ANTIGRAVITY_AUTO_AUTH = NO
CLAUDE_AUTO_REVIEW = NO
ACTIVE_WORK_PACKAGE = NONE
PROPOSED_WORK_PACKAGE = D2-WP003-R4
PROPOSED_WORK_PACKAGE_NAME = PART A OBJECTIVE INSERTION STRUCTURAL MATRIX CLOSURE
PROPOSED_SCOPE = FEASIBILITY SOURCE + TEST / EXACT TWO FILES ONLY
PROPOSED_STATUS = WAIT OWNER AUTHORIZATION
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
PRIVACY_PURGE_REQUIRED = NO
D3_EXECUTION = HOLD UNTIL D2 PASS / CLOSED
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP / NOT NEEDED
```

## 1. Owner continuation and READ-ONLY finding

Owner explicitly continued D2 after R3-R36 closure. This control cycle performed READ-ONLY inspection only; it did not authorize implementation.

Current source truth:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js` already contains `getStructuralPartABuffers()` and raw OOXML Part A row/merge insertion logic;
- the helper currently returns only `bufA4`, `bufA5`, and `bufA10`;
- the current insertion path clones source row 28 for inserted objective rows and shifts downstream rows beginning at row 29;
- current source extends print area for only 5 and 10 objective examples;
- reference-image and preservation source are separate accepted/frozen controls and must not be reopened.

Current proof truth:
- `tests/mbo-xlsx-ooxml-feasibility.test.js` has one Part A structural feasibility test;
- it tests only 4, 5 and 10 objective variants;
- it asserts only total raw merge count, declared merge count and print-area ending;
- counts 6, 7, 8 and 9 are not proven;
- exact row/cell/style/row-height/merge transformation, dimension progression and downstream-content relocation are not proven.

Conclusion:
```text
TEST_ONLY_IS_SUFFICIENT = NO
MINIMUM_SAFE_NEXT_SCOPE = FEASIBILITY SOURCE + TEST / EXACT TWO FILES
PRODUCTION_RENDERER_REQUIRED_NOW = NO
CLAUDE_REQUIRED_NOW = NO
```

## 2. Frozen Part A source facts

Exact owner-template SHA:

```text
PART_A_SHA256 = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
```

Accepted structural facts:
- main sheet = `MBO Staff & Chief`;
- used range = A1:BL52;
- print area = A1:BJ52;
- 193 base merge refs;
- objective rows = 25:28 for four base objectives;
- row 28 is the current source clone row for additional objective rows;
- each additional objective row currently implies 14 cloned merge refs;
- zero legacy formulas;
- A3 landscape;
- scale 58%;
- fit-to-page retained;
- gridlines hidden.

These facts are structural authority for R4; R4 does not authorize content/business-rule changes.

## 3. Proposed exact write scope — NOT AUTHORIZED

If and only if Owner explicitly authorizes R4, Antigravity may modify exactly:

1. `scripts/export/mbo-xlsx-ooxml-feasibility.js`
2. `tests/mbo-xlsx-ooxml-feasibility.test.js`

Source permission is limited to the existing Part A feasibility structural helper area required to expose/prove counts 4–10. Do not modify preservation logic, reference-image logic, privacy logic, Part B structural logic, production renderer code or any other source.

Preferred bounded source direction:
- preserve existing 4/5/10 behavior;
- generalize the existing Part A feasibility helper to produce all seven objective counts 4, 5, 6, 7, 8, 9, 10 from the same insertion algorithm;
- maintain backward compatibility for existing `bufA4`, `bufA5`, `bufA10` callers if practical;
- do not redesign the raw insertion algorithm merely because additional proof is being added;
- if exact matrix proof exposes an algorithm defect outside bounded count generalization, STOP and deliver a blocker commit rather than widening scope.

## 4. Mandatory structural matrix if authorized

The real feasibility source path must be exercised for every objective count:

```text
4, 5, 6, 7, 8, 9, 10
```

For count `N`:

```text
extraRows = N - 4
expectedLastRow = 52 + extraRows = 48 + N
expectedMergeCount = 193 + (14 * extraRows)
expectedDimension = A1:BL{expectedLastRow}
expectedPrintArea = 'MBO Staff & Chief'!$A$1:$BJ${expectedLastRow}
```

Mandatory proof:

### A. Exact source identity
- verify exact Part A SHA before template-dependent matrix proof;
- do not reconstruct or substitute owner template binary.

### B. Full count matrix
- exercise all seven counts 4–10 from the actual source helper;
- no test-side duplicate implementation of row insertion may substitute for the real source path.

### C. Exact row/cell transformation
Using the 4-objective structural buffer as the transformation baseline:
- rows 1:28 remain structurally unchanged;
- every inserted row 29 through `28 + extraRows` must be an exact structural clone of source row 28 after only deterministic row/cell reference substitution;
- cell-address pattern and style-id pattern of every inserted row must equal row 28 after row-number normalization;
- row-height/customHeight behavior of every inserted row must equal row 28;
- every original downstream row `r >= 29` must appear exactly once at `r + extraRows` with equivalent cell refs/style pattern/row-height after row-number normalization;
- no downstream row or cell may be lost, duplicated or left at its old row.

### D. Downstream sentinel relocation
- retain a privacy-safe sentinel on the baseline downstream row;
- for every count, prove the sentinel moves from row 29 to exactly `29 + extraRows`;
- prove it is absent from the old row after insertion and appears exactly once at the shifted row.

### E. Exact merge transformation — NOT COUNT ONLY
- start from the complete sorted 4-objective merge inventory;
- retain every pre-insertion merge unaffected;
- shift every applicable downstream merge by exactly `extraRows`;
- clone the complete row-28 merge pattern into every inserted objective row;
- require exact deep equality between computed expected merge inventory and actual merge inventory;
- declared `<mergeCells count>` must equal actual merge inventory length;
- merge count must equal `193 + 14 * extraRows` for each count.

### F. Dimension and print area
For every count:
- exact worksheet dimension must equal `A1:BL{expectedLastRow}`;
- exact print area must equal `'MBO Staff & Chief'!$A$1:$BJ${expectedLastRow}`;
- no partial/includes-only assertion is sufficient.

### G. Non-target structural invariants
Across the matrix, compared to the 4-objective structural baseline where applicable:
- sheet names/order/state unchanged;
- column structure/hash unchanged;
- paper size remains 8 / A3;
- orientation remains landscape;
- scale remains 58;
- fit-to-page/gridline/page-margin/page-setup properties remain unchanged except intentional row/dimension/print-area growth;
- relationship tuples unchanged;
- media inventory unchanged;
- no extra worksheet introduced.

### H. Formula authority
- formula inventory remains exactly empty for every Part A count;
- no formula-generation behavior may be introduced in R4.

### I. Privacy/artifact safety
- no employee-bearing template contents may be logged or committed;
- no generated workbook/image/PDF/evidence binary may be committed;
- structural proof should use refs, counts, styles, hashes and privacy-safe sentinel values only.

## 5. Required execution sequence if authorized

Run exactly:

```bash
node --check scripts/export/mbo-xlsx-ooxml-feasibility.js
node --check tests/mbo-xlsx-ooxml-feasibility.test.js
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

Delivery rules:
- exactly ONE bounded implementation or blocker commit;
- push to `ai/antigravity-wp002c`;
- STOP immediately after push/report;
- executor must not self-declare PASS/CLOSED;
- if owner template is unavailable or matrix reveals an out-of-scope algorithm defect, deliver a blocker rather than inventing evidence or widening source changes.

Report only:
- implementation/blocker commit SHA;
- exact changed files;
- both `node --check` results;
- `node --test` result;
- `npm audit --omit=dev` result;
- `git status --porcelain`;
- blocker if any.

## 6. Frozen / out of scope

Do NOT modify or reopen:
- D2 preservation source or Option B policy;
- `preserveExactWorkbookDimensions()` / `preserveWorksheetXmlDimensions()` except read-only inspection;
- `getReferenceImageBuffers()` or accepted reference-image proof;
- Part B structural insertion logic;
- privacy/sanitization logic;
- dependencies;
- production XLSX renderer/sanitizer;
- combined Excel;
- PDF;
- generated artifacts/evidence;
- Kintone/App53/App794/App795/App801;
- ACL/process/deploy/Live UAT/rollback;
- D3;
- next work package after R4.

Claude is not authorized or needed for the proposal.

## 7. Authorization ledger

```text
D2-WP003-R3-R36-TEST-20260902-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP003-R4 = PROPOSED / NOT AUTHORIZED
CONTROL-PLANE-D2-REVIEW-CORRECTIVE-20-ROUND-20260901 = ACTIVE / ROUND 15 OF 20
ANTIGRAVITY_AUTO_AUTH = NO
CLAUDE_AUTO_REVIEW = NO
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_APP794_DEPLOY_AUTH = NONE
LIVE_UAT = NO
ROLLBACK = NO
D3_EXECUTION = HOLD
```

## 8. Exact next action

```text
NEXT_EXECUTOR = OWNER
NEXT_ACTION = DECIDE WHETHER TO AUTHORIZE D2-WP003-R4 FEASIBILITY SOURCE+TEST AS PROPOSED
ACTIVE_WORK_PACKAGE = NONE
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
CHATGPT = INDEPENDENT REVIEW AFTER ANY AUTHORIZED IMPLEMENTATION ARRIVES
D3 = HOLD
```
