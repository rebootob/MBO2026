# AI ACTIVE TASK — D2-WP003-R4-R2 TEST-ONLY PROPOSED

Mode: **CONTROL PLANE / R4 SOURCE FROZEN / R4-R1 PROOF MOSTLY ACCEPTED / TEST-ONLY CORRECTIVE PROPOSED / NO ACTIVE EXECUTOR / NO KINTONE / NO DEPLOY / D3 HOLD**  
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
R4_SOURCE_REVIEW = PASS / FROZEN
R4_SOURCE_BASELINE = bf9ef7e82c78efc2e725614046745a3ccf394054 / FROZEN
R4-R1_SCOPE_REVIEW = PASS
R4-R1_PROOF_REVIEW = FAIL / ACCEPTED ABSOLUTE PAGE-SETUP ASSERTIONS REGRESSED
R4-R1_INDEPENDENT_RUNTIME_SIGNAL = UNAVAILABLE / NO CI STATUS OR WORKFLOW
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_USED = 17
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_REMAINING = 3
ANTIGRAVITY_AUTO_AUTH = NO
CLAUDE_AUTO_REVIEW = NO
ACTIVE_WORK_PACKAGE = NONE
PROPOSED_WORK_PACKAGE = D2-WP003-R4-R2
PROPOSED_WORK_PACKAGE_NAME = PART A ABSOLUTE PAGE-SETUP ASSERTION RETENTION CLOSURE
PROPOSED_SCOPE = TEST-ONLY / EXISTING FEASIBILITY TEST FILE ONLY
PROPOSED_STATUS = WAIT OWNER AUTHORIZATION
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
PRIVACY_PURGE_REQUIRED = NO
D3_EXECUTION = HOLD UNTIL D2 PASS / CLOSED
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP / NOT NEEDED
```

## 1. R4-R1 authorization consumed — corrective

```text
AUTHORIZATION = D2-WP003-R4-R1-TEST-20260902-01
AUTHORIZATION_COMMIT = 8b0eb2ca2058c458c40286b6b2d5f55bdb34d703
IMPLEMENTATION_COMMIT = 8a49a9af11f03ec3c2d2e2e3b5cafebe5befd8c6
AUTHORIZATION_STATUS = CONSUMED / CORRECTIVE / DO NOT REUSE
```

Independent review proves:
- implementation is the direct child of the authorization commit;
- exactly one implementation commit exists after authorization;
- only `tests/mbo-xlsx-ooxml-feasibility.test.js` changed;
- no source, Part B, preservation/reference-image, privacy, dependency, renderer, Kintone, deploy or D3 scope change occurred;
- `inspectRawWorksheetOOXML().rowRefs` is numeric and deterministically sorted, so the new exact sequence proof is meaningful;
- GitHub exposes no combined CI status and no workflow runs for the implementation.

## 2. Accepted R4-R1 progress — freeze / retain

The following R4-R1 proof additions are accepted and must not be removed or weakened:
- exact computed `rowRefs` sequence for every objective count 4–10;
- `rowRefs` uniqueness via `Set.size === rowRefs.length`;
- exact `sheetNames` baseline equality;
- exact `sheetStates` baseline equality;
- exact main-sheet baseline equality for:
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

All previously accepted R4 proof also remains required:
- exact Part A SHA gate;
- real source-path matrix for counts 4,5,6,7,8,9,10;
- full merge-set deep equality;
- exact merge count/declaration;
- inserted-row normalized cell-ref/style/row-height proof;
- downstream shifted-row normalized cell-ref/style/row-height proof;
- sentinel relocation and uniqueness;
- exact dimensions A1:BL52..A1:BL58;
- exact print areas BJ52..BJ58;
- relationship tuple equality;
- media inventory equality;
- formula inventory exactly empty.

R4 source implementation `bf9ef7e82c78efc2e725614046745a3ccf394054` remains PASS/FROZEN and is not writable under the proposed corrective.

## 3. Why R4-R1 is not closed

R4-R1 was explicitly required to **preserve every accepted R4 matrix assertion**.

Before R4-R1, the accepted R4 matrix asserted for every objective count:
- `paperSize === '8'`;
- `orientation === 'landscape'`;
- `scale === '58'`.

R4-R1 removed those absolute assertions and replaced them with baseline-relative equality only:
- `currentMain.paperSize === baselineMain.paperSize`;
- `currentMain.orientation === baselineMain.orientation`;
- `currentMain.scale === baselineMain.scale`.

Relative equality is useful and is accepted, but it is not equivalent to retaining the absolute authority assertions. A wrong-but-consistent baseline could satisfy relative equality. Therefore the previous accepted constants must be restored while keeping the new relative-equality assertions.

No source defect is proven.

## 4. Proposed R4-R2 exact write scope — NOT AUTHORIZED

If and only if Owner explicitly authorizes R4-R2, Antigravity may modify ONLY:

`tests/mbo-xlsx-ooxml-feasibility.test.js`

READ-ONLY as needed:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`;
- R4 and R4-R1 authorization/implementation history;
- package metadata;
- exact ignored Part A owner template only after SHA verification.

## 5. Mandatory TEST-ONLY corrective if authorized

Preserve every current R4 and R4-R1 assertion. Add back only the three accepted absolute per-count page-setup assertions.

For EVERY objective count 4,5,6,7,8,9,10, require in addition to the existing baseline-relative equality:

```text
currentMain.paperSize === '8'
currentMain.orientation === 'landscape'
currentMain.scale === '58'
```

Equivalent assertions using the existing `inspN.pageSetup` values are acceptable only if they preserve the exact same absolute semantics. Preferred direction is to keep the current `currentMain` baseline-equality assertions and add the three authority constants directly beside them.

Do NOT replace baseline equality with absolute-only proof; both forms must coexist.

Do NOT remove or weaken any current R4-R1 proof, especially:
- rowRefs exact sequence/uniqueness;
- sheetNames/sheetStates equality;
- `showGridLines`, `pageMargins`, `fitToPage`, centered/protection/sheetRels equality;
- full merge/row/sentinel/dimension/print-area/relationship/media/formula matrix.

## 6. Safety / fail-safe behavior

- no source modification;
- no test-side insertion implementation duplication;
- no employee-bearing values logged or committed;
- no generated workbook/image/PDF/evidence binary committed;
- if owner template is unavailable, skip only template-dependent proof explicitly;
- do not reconstruct or invent owner template/evidence;
- if a new source defect is independently proven, STOP and deliver a blocker; do not modify source under R4-R2.

## 7. Required execution sequence if authorized

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
- STOP immediately after push/report;
- executor must not self-declare PASS/CLOSED;
- do not start Part B or any next work package.

Report only:
- implementation/blocker commit SHA;
- exact changed file;
- `node --check` result;
- `node --test` result;
- `npm audit --omit=dev` result;
- `git status --porcelain`;
- blocker if any.

## 8. Frozen / out of scope

Do NOT modify:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`;
- R4 accepted source baseline;
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
- any next work package after R4-R2.

Claude is not authorized or needed for this directly proven proof regression.

## 9. Authorization ledger

```text
D2-WP003-R3-R36-TEST-20260902-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP003-R4-SOURCE-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R4-R1-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R4-R2 = PROPOSED / NOT AUTHORIZED
CONTROL-PLANE-D2-REVIEW-CORRECTIVE-20-ROUND-20260901 = ACTIVE / ROUND 17 OF 20
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

## 10. Exact next action

```text
NEXT_EXECUTOR = OWNER
NEXT_ACTION = DECIDE WHETHER TO AUTHORIZE D2-WP003-R4-R2 TEST-ONLY AS PROPOSED
ACTIVE_WORK_PACKAGE = NONE
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
CHATGPT = INDEPENDENT REVIEW AFTER ANY AUTHORIZED IMPLEMENTATION ARRIVES
D3 = HOLD
```
