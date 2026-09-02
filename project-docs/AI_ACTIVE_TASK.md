# AI ACTIVE TASK — D2-WP003-R4 SOURCE+TEST AUTHORIZED

Mode: **CONTROL PLANE / LOW-CREDIT / ONE-SHOT FEASIBILITY SOURCE+TEST / EXACT TWO FILES / NO KINTONE / NO DEPLOY / D3 HOLD**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-02 ICT

Repository truth and accepted newer Live evidence always win. Fresh-fetch current branch HEAD before acting.

```text
TASK_STATE = AUTHORIZED / WAIT ANTIGRAVITY IMPLEMENTATION
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
ACTIVE_WORK_PACKAGE = D2-WP003-R4
ACTIVE_WORK_PACKAGE_NAME = PART A OBJECTIVE INSERTION STRUCTURAL MATRIX CLOSURE
AUTHORIZED_SCOPE = FEASIBILITY SOURCE + TEST / EXACT TWO FILES ONLY
OWNER_APPROVAL_BASELINE_HEAD = b8deddc84794181723085983f6ec599f6f3bcf9b
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R4-SOURCE-TEST-20260902-01
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP003-R4-SOURCE-TEST-20260902-01
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
PRIVACY_PURGE_REQUIRED = NO
D3_EXECUTION = HOLD UNTIL D2 PASS / CLOSED
ANTIGRAVITY = AUTHORIZED ONLY FOR R4 / ONE-SHOT BOUNDED EXECUTION
CLAUDE = STOP / NOT NEEDED
```

## 1. Owner authorization

Owner explicitly authorized:

```text
D2-WP003-R4 SOURCE+TEST ตามขอบเขตที่เสนอ
```

Authorization token:

```text
D2-WP003-R4-SOURCE-TEST-20260902-01 = ACTIVE / ONE-SHOT / EXACT TWO FILES / DO NOT WIDEN / DO NOT REUSE
```

This authorization permits only the bounded feasibility SOURCE+TEST work below. It does not authorize production renderer changes, Part B structural work, preservation/reference-image changes, evidence publication, Kintone writes, deploys, Live UAT, PDF work, D3, or any next work package.

## 2. Frozen Part A authority

Exact owner-template SHA:

```text
PART_A_SHA256 = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
```

Frozen structural facts:
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

Preservation and reference-image gates are already PASS/CLOSED and must not be reopened without a proven regression.

## 3. Exact write scope — TWO FILES ONLY

Antigravity may modify exactly:

1. `scripts/export/mbo-xlsx-ooxml-feasibility.js`
2. `tests/mbo-xlsx-ooxml-feasibility.test.js`

Source permission is limited to the existing Part A feasibility structural helper area required to expose/prove objective counts 4–10.

Preferred bounded source direction:
- preserve existing 4/5/10 behavior;
- generalize the existing Part A feasibility helper to produce all seven objective counts 4,5,6,7,8,9,10 from the same insertion algorithm;
- maintain backward compatibility for existing `bufA4`, `bufA5`, `bufA10` callers if practical;
- do not duplicate production insertion logic inside tests;
- do not redesign the raw insertion algorithm merely because additional proof is being added;
- if exact matrix proof exposes an algorithm defect beyond bounded count generalization, STOP and deliver a blocker commit rather than widening scope.

## 4. Mandatory structural matrix

Exercise the REAL feasibility source path for every objective count:

```text
4, 5, 6, 7, 8, 9, 10
```

For objective count `N`:

```text
extraRows = N - 4
expectedLastRow = 52 + extraRows = 48 + N
expectedMergeCount = 193 + (14 * extraRows)
expectedDimension = A1:BL{expectedLastRow}
expectedPrintArea = 'MBO Staff & Chief'!$A$1:$BJ${expectedLastRow}
```

### A. Exact source identity
- verify exact Part A SHA before template-dependent matrix proof;
- do not reconstruct, substitute, publish, or commit the owner template binary.

### B. Full count matrix
- exercise all seven counts 4–10 from the actual source helper;
- no test-side duplicate insertion implementation may substitute for the real source path.

### C. Exact row/cell transformation
Using the 4-objective structural buffer as transformation baseline:
- rows 1:28 remain structurally unchanged;
- each inserted row 29 through `28 + extraRows` is an exact structural clone of baseline row 28 after deterministic row/cell reference substitution only;
- cell-address pattern and style-id pattern of every inserted row equals row 28 after row-number normalization;
- row-height/customHeight behavior of every inserted row equals row 28;
- every original downstream row `r >= 29` appears exactly once at `r + extraRows` with equivalent normalized cell refs/style pattern/row-height;
- no downstream row or cell is lost, duplicated, or left at its old row.

### D. Downstream sentinel relocation
- retain a privacy-safe sentinel on baseline downstream row 29;
- for every count prove sentinel moves to exactly `29 + extraRows`;
- prove sentinel is absent from old row 29 when `extraRows > 0`;
- prove sentinel appears exactly once at the expected shifted row.

### E. Exact merge transformation — NOT COUNT ONLY
- start from the complete sorted 4-objective merge inventory;
- retain every unaffected pre-insertion merge exactly;
- shift every applicable downstream merge by exactly `extraRows`;
- clone the complete row-28 merge pattern into each inserted objective row;
- require exact deep equality between computed expected merge inventory and actual merge inventory;
- declared `<mergeCells count>` equals actual merge inventory length;
- actual merge inventory length equals `193 + 14 * extraRows` for every count.

### F. Exact dimension and print area
For every count:
- exact worksheet dimension = `A1:BL{expectedLastRow}`;
- exact print area = `'MBO Staff & Chief'!$A$1:$BJ${expectedLastRow}`;
- includes/endsWith-only assertions are insufficient.

### G. Non-target structural invariants
Across the matrix, compared to the 4-objective structural baseline where applicable:
- sheet names/order/state unchanged;
- column structure/hash unchanged;
- paper size remains 8 / A3;
- orientation remains landscape;
- scale remains 58;
- fit-to-page, gridline, page-margin and page-setup properties unchanged except intentional dimension/print-area growth;
- relationship tuples unchanged;
- media inventory unchanged;
- no extra worksheet introduced.

### H. Formula authority
- formula inventory remains exactly empty for every objective count;
- R4 must not introduce formula-generation behavior.

### I. Privacy/artifact safety
- do not log employee-bearing template contents;
- do not commit generated workbook/image/PDF/evidence binaries;
- use only refs, counts, styles, hashes and privacy-safe sentinel values in proof.

## 5. Required execution sequence

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
- any next work package after R4.

Claude second review is not authorized or needed for this bounded R4 execution unless ChatGPT later finds material ambiguity during independent review.

## 7. Authorization ledger

```text
D2-WP003-R3-R36-TEST-20260902-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP003-R4-SOURCE-TEST-20260902-01 = ACTIVE / ONE-SHOT / EXACT TWO FILES
CONTROL-PLANE-D2-REVIEW-CORRECTIVE-20-ROUND-20260901 = ACTIVE / ROUND 15 OF 20
ANTIGRAVITY_AUTO_AUTH = NO
CLAUDE_AUTO_REVIEW = NO
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R4-SOURCE-TEST-20260902-01
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP003-R4-SOURCE-TEST-20260902-01
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_APP794_DEPLOY_AUTH = NONE
LIVE_UAT = NO
ROLLBACK = NO
D3_EXECUTION = HOLD
```

## 8. Exact next action

```text
NEXT_EXECUTOR = ANTIGRAVITY
NEXT_ACTION = EXECUTE ONLY D2-WP003-R4-SOURCE-TEST-20260902-01
EXPECTED_CHANGED_FILES = EXACTLY scripts/export/mbo-xlsx-ooxml-feasibility.js + tests/mbo-xlsx-ooxml-feasibility.test.js
EXPECTED_COMMITS = EXACTLY ONE BOUNDED IMPLEMENTATION/BLOCKER COMMIT
ANTIGRAVITY = STOP IMMEDIATELY AFTER PUSH/REPORT
CLAUDE = STOP
CHATGPT = INDEPENDENT REVIEW AFTER IMPLEMENTATION ARRIVES
D3 = HOLD
```
