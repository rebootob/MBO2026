# AI ACTIVE TASK — D2-WP003-R4-R1 TEST-ONLY PROPOSED

Mode: **CONTROL PLANE / R4 SOURCE FROZEN / TEST-ONLY CORRECTIVE PROPOSED / NO ACTIVE EXECUTOR / NO KINTONE / NO DEPLOY / D3 HOLD**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-02 ICT

Repository truth and accepted newer Live evidence always win. Fresh-fetch current branch HEAD before acting.

```text
TASK_STATE = WAIT_OWNER_WORK_PACKAGE_AUTHORIZATION
D1_OVERALL = PASS / CLOSED
D2_STATUS = IN PROGRESS
D2_PRESERVATION_GATE = PASS / CLOSED
D2_REFERENCE_IMAGE_GATE = PASS / CLOSED
D2_PART_A_STRUCTURAL_GATE = CORRECTIVE REQUIRED / NOT CLOSED
REFERENCE_IMAGE_SOURCE_REVIEW = PASS / FROZEN
D2-WP003-R3-R36 = PASS / CLOSED
R4_SCOPE_REVIEW = PASS
R4_SOURCE_REVIEW = PASS / FROZEN
R4_PROOF_REVIEW = FAIL / STRUCTURAL INVARIANT MATRIX INCOMPLETE
R4_INDEPENDENT_RUNTIME_SIGNAL = UNAVAILABLE / NO CI STATUS OR WORKFLOW
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_USED = 16
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_REMAINING = 4
ANTIGRAVITY_AUTO_AUTH = NO
CLAUDE_AUTO_REVIEW = NO
ACTIVE_WORK_PACKAGE = NONE
PROPOSED_WORK_PACKAGE = D2-WP003-R4-R1
PROPOSED_WORK_PACKAGE_NAME = PART A STRUCTURAL INVARIANT PROOF CLOSURE
PROPOSED_SCOPE = TEST-ONLY / EXISTING FEASIBILITY TEST FILE ONLY
PROPOSED_STATUS = WAIT OWNER AUTHORIZATION
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
R4_SOURCE_BASELINE = bf9ef7e82c78efc2e725614046745a3ccf394054 / FROZEN FOR CORRECTIVE
PRIVACY_PURGE_REQUIRED = NO
D3_EXECUTION = HOLD UNTIL D2 PASS / CLOSED
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP / NOT NEEDED
```

## 1. R4 authorization consumed — corrective

```text
AUTHORIZATION = D2-WP003-R4-SOURCE-TEST-20260902-01
AUTHORIZATION_COMMIT = 8df05db6535a8ce871e987853e5a356ad67f4232
IMPLEMENTATION_COMMIT = bf9ef7e82c78efc2e725614046745a3ccf394054
AUTHORIZATION_STATUS = CONSUMED / CORRECTIVE / DO NOT REUSE
```

Independent review:
- exactly one implementation commit after authorization;
- exactly two changed files, both authorized;
- no production renderer, Part B, preservation/reference-image, privacy, dependency, Kintone, deploy or D3 scope change;
- `getStructuralPartABuffers()` now exposes real-path buffers for objective counts 4,5,6,7,8,9,10 while retaining `bufA4`, `bufA5`, `bufA10` compatibility;
- exact Part A SHA gate is present;
- full computed merge inventory deep equality is present;
- exact dimensions A1:BL52 through A1:BL58 are asserted;
- exact print areas through BJ52..BJ58 are asserted;
- normalized inserted/downstream cell-ref/style/row-height mappings are asserted;
- sentinel relocation/uniqueness is asserted;
- relationship/media equality and formula-empty proof are asserted;
- GitHub exposes no combined CI status and no workflow runs for this commit.

## 2. Why R4 is not closed

The authorization required proof that no downstream row is lost, duplicated, or left at its old row, and required full non-target workbook/sheet invariant parity.

Current test does not assert:
1. exact `inspN.rowRefs` sequence against a computed expected row sequence;
2. uniqueness of `inspN.rowRefs` (`Set.size === rowRefs.length`), so duplicate `<row r="...">` nodes are not explicitly rejected;
3. exact `fpN.sheetStates === baselineFp.sheetStates`;
4. exact main-sheet `showGridLines` equality against baseline;
5. exact main-sheet `fitToPage` equality against baseline;
6. exact main-sheet `pageMargins` equality against baseline;
7. remaining non-target per-sheet setup invariants available from the existing fingerprint helper, including `horizontalCentered`, `verticalCentered`, `sheetProtection`, and `sheetRels` where applicable.

`getWorkbookFingerprint()` already exposes the required fields and `inspectRawWorksheetOOXML()` already exposes `rowRefs`. Therefore no source change is required.

## 3. Accepted R4 source — freeze / retain

R4 source implementation commit:

`bf9ef7e82c78efc2e725614046745a3ccf394054`

Retain without modification unless a new independently proven source defect appears:
- objective count loop 4–10;
- same bounded raw insertion algorithm;
- backwards-compatible `bufA4`..`bufA10` outputs and `buffers` map;
- sentinel setup;
- row/cell shifting and row-28 cloning;
- merge shifting/cloning/count update;
- exact dimension synthesis for 52..58;
- exact print-area synthesis for 52..58.

R4-R1 does NOT authorize source changes.

## 4. Proposed R4-R1 exact write scope — NOT AUTHORIZED

If and only if Owner explicitly authorizes R4-R1, Antigravity may modify ONLY:

`tests/mbo-xlsx-ooxml-feasibility.test.js`

READ-ONLY:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`;
- exact R4 authorization/implementation diff;
- package metadata;
- exact ignored Part A owner template after SHA verification.

## 5. Mandatory TEST-ONLY corrective if authorized

Preserve every accepted R4 matrix assertion. Add only the missing proof.

For every objective count 4–10:

### A. Exact row-node sequence and uniqueness
Compute expected row refs from the 4-objective baseline:
- baseline rows <=28 remain unchanged;
- inserted refs are exactly 29 through `28 + extraRows`;
- every baseline row ref >=29 shifts to `r + extraRows`.

Then require:
- `assert.deepEqual(inspN.rowRefs, expectedRowRefs)` after deterministic numeric ordering compatible with the inspector;
- `new Set(inspN.rowRefs).size === inspN.rowRefs.length`;
- no unexpected row refs outside the exact expected sequence.

This must close no-loss/no-duplicate/no-old-row relocation proof rather than relying only on cell/style checks.

### B. Workbook sheet invariants
Require exact equality to the 4-objective baseline:
- `sheetNames`;
- `sheetStates`.

No extra worksheet may appear.

### C. Main-sheet non-target invariants
Using `fpN.sheets['MBO Staff & Chief']` versus the baseline main sheet, require exact equality for all non-intentionally-changing fields available from the existing fingerprint helper, including at minimum:
- `colsHash`;
- `showGridLines`;
- `pageMargins`;
- `paperSize`;
- `orientation`;
- `scale`;
- `fitToPage`;
- `horizontalCentered`;
- `verticalCentered`;
- `sheetProtection`;
- `sheetRels`.

Dimension, merge inventory/count and print area remain intentionally count-dependent and must retain the existing exact R4 assertions rather than be compared unchanged.

### D. Retain existing R4 proof
Do not remove or weaken:
- exact owner SHA gate;
- full 4–10 real-path matrix;
- full merge-set deep equality;
- inserted/downstream cell-ref/style/row-height proof;
- sentinel exact relocation/uniqueness;
- exact dimension and print-area assertions;
- relationship/media equality;
- formula inventory exactly empty.

### E. Safety
- no source modification;
- no test-side insertion implementation duplication;
- no employee-bearing values logged/committed;
- no generated workbook/image/PDF/evidence binary committed;
- if owner template is unavailable, skip only template-dependent proof explicitly; do not invent evidence.

## 6. Required execution sequence if authorized

Run exactly:

```bash
node --check tests/mbo-xlsx-ooxml-feasibility.test.js
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

Delivery rules:
- exactly ONE bounded TEST-ONLY implementation or blocker commit;
- push to `ai/antigravity-wp002c`;
- STOP immediately;
- do not self-declare PASS/CLOSED;
- do not start Part B or any next work package.

## 7. Frozen / out of scope

Do NOT modify:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js` under R4-R1;
- preservation / Option B / reference-image source or proof;
- Part B structural insertion;
- privacy/sanitization source;
- dependencies;
- production XLSX renderer/sanitizer;
- combined Excel;
- PDF;
- generated artifacts/evidence;
- Kintone/App53/App794/App795/App801;
- ACL/process/deploy/Live UAT/rollback;
- D3;
- any next work package after R4-R1.

Claude is not authorized or needed for this bounded proof corrective.

## 8. Authorization ledger

```text
D2-WP003-R3-R36-TEST-20260902-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP003-R4-SOURCE-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R4-R1 = PROPOSED / NOT AUTHORIZED
CONTROL-PLANE-D2-REVIEW-CORRECTIVE-20-ROUND-20260901 = ACTIVE / ROUND 16 OF 20
ANTIGRAVITY_AUTO_AUTH = NO
CLAUDE_AUTO_REVIEW = NO
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_APP794_DEPLOY_AUTH = NONE
LIVE_UAT = NO
ROLLBACK = NO
D3_EXECUTION = HOLD
```

## 9. Exact next action

```text
NEXT_EXECUTOR = OWNER
NEXT_ACTION = DECIDE WHETHER TO AUTHORIZE D2-WP003-R4-R1 TEST-ONLY AS PROPOSED
ACTIVE_WORK_PACKAGE = NONE
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
CHATGPT = INDEPENDENT REVIEW AFTER ANY AUTHORIZED IMPLEMENTATION ARRIVES
D3 = HOLD
```
