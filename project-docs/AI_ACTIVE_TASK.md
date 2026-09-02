# AI ACTIVE TASK — D2-WP003-R4-R2 TEST-ONLY AUTHORIZED

Mode: **CONTROL PLANE / R4 SOURCE FROZEN / R4-R1 PROOF FROZEN / LOW-CREDIT / ONE-SHOT TEST-ONLY / ONE FILE / NO KINTONE / NO DEPLOY / D3 HOLD**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-02 ICT

Repository truth and accepted newer Live evidence always win. Fresh-fetch current branch HEAD before acting.

```text
TASK_STATE = AUTHORIZED / WAIT ANTIGRAVITY IMPLEMENTATION
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
ACTIVE_WORK_PACKAGE = D2-WP003-R4-R2
ACTIVE_WORK_PACKAGE_NAME = PART A ABSOLUTE PAGE-SETUP ASSERTION RETENTION CLOSURE
AUTHORIZED_SCOPE = TEST-ONLY / EXISTING FEASIBILITY TEST FILE ONLY
OWNER_APPROVAL_BASELINE_HEAD = f566fa300818e53e78342710332573e0294d4c4b
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP003-R4-R2-TEST-20260902-01
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
PRIVACY_PURGE_REQUIRED = NO
D3_EXECUTION = HOLD UNTIL D2 PASS / CLOSED
ANTIGRAVITY = AUTHORIZED ONLY FOR R4-R2 / ONE-SHOT BOUNDED TEST-ONLY EXECUTION
CLAUDE = STOP / NOT NEEDED
```

## 1. Owner authorization

Owner explicitly authorized:

```text
D2-WP003-R4-R2 TEST-ONLY ตามขอบเขตที่เสนอ
```

Authorization token:

```text
D2-WP003-R4-R2-TEST-20260902-01 = ACTIVE / ONE-SHOT / TEST-ONLY / ONE FILE / DO NOT WIDEN / DO NOT REUSE
```

This authorization permits only the bounded proof corrective below. It does not authorize source changes, Part B work, preservation/reference-image changes, evidence publication, renderer work, Kintone writes, deploys, PDF, D3 or any next work package.

## 2. Frozen accepted source and proof

Accepted R4 source implementation:

`bf9ef7e82c78efc2e725614046745a3ccf394054`

Accepted R4-R1 implementation:

`8a49a9af11f03ec3c2d2e2e3b5cafebe5befd8c6`

R4 source remains frozen and is not writable under R4-R2.

Retain every accepted R4/R4-R1 proof, including:
- exact Part A owner-template SHA gate;
- real source-path matrix for objective counts 4,5,6,7,8,9,10;
- exact computed `rowRefs` sequence for every count;
- `rowRefs` uniqueness via `Set.size === rowRefs.length`;
- full merge-set deep equality and merge count/declaration;
- inserted-row normalized cell-ref/style/row-height proof;
- downstream shifted-row normalized cell-ref/style/row-height proof;
- sentinel exact relocation and uniqueness;
- exact dimensions A1:BL52..A1:BL58;
- exact print areas BJ52..BJ58;
- exact `sheetNames` and `sheetStates` baseline equality;
- exact main-sheet baseline equality for `colsHash`, `showGridLines`, `pageMargins`, `paperSize`, `orientation`, `scale`, `fitToPage`, `horizontalCentered`, `verticalCentered`, `sheetProtection`, `sheetRels`;
- relationship tuple equality;
- media inventory equality;
- formula inventory exactly empty.

Do not remove or weaken any of the above.

## 3. Exact write scope — ONE FILE ONLY

Antigravity may modify ONLY:

`tests/mbo-xlsx-ooxml-feasibility.test.js`

READ-ONLY as needed:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`;
- R4 / R4-R1 authorization and implementation history;
- package metadata;
- exact ignored Part A owner template only after SHA verification.

## 4. Mandatory TEST-ONLY corrective

For EVERY objective count 4,5,6,7,8,9,10, retain the current baseline-relative equality and ADD BACK the previously accepted absolute authority assertions:

```text
currentMain.paperSize === '8'
currentMain.orientation === 'landscape'
currentMain.scale === '58'
```

Equivalent assertions using the existing `inspN.pageSetup` fields are acceptable only if they preserve the same absolute semantics.

Preferred direction: add the three absolute assertions immediately beside the current relative assertions:

```text
currentMain.paperSize === baselineMain.paperSize
currentMain.orientation === baselineMain.orientation
currentMain.scale === baselineMain.scale
```

Both relative and absolute proof MUST coexist.

Do NOT replace relative equality with absolute-only proof.

Do NOT remove or weaken:
- rowRefs sequence/uniqueness;
- sheetNames/sheetStates equality;
- showGridLines/pageMargins/fitToPage/centered/protection/sheetRels equality;
- full merge/row/sentinel/dimension/print-area/relationship/media/formula matrix.

No other behavioral change is required or authorized.

## 5. Safety / fail-safe behavior

- no source modification;
- no test-side insertion implementation duplication;
- no employee-bearing values logged or committed;
- no generated workbook/image/PDF/evidence binary committed;
- if owner template is unavailable, skip only template-dependent proof explicitly;
- do not reconstruct or invent owner template/evidence;
- if a new source defect is independently proven, STOP and deliver a blocker; do not modify source under R4-R2.

## 6. Required execution sequence

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

## 7. Frozen / out of scope

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

## 8. Authorization ledger

```text
D2-WP003-R3-R36-TEST-20260902-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP003-R4-SOURCE-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R4-R1-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R4-R2-TEST-20260902-01 = ACTIVE / ONE-SHOT / TEST-ONLY
CONTROL-PLANE-D2-REVIEW-CORRECTIVE-20-ROUND-20260901 = ACTIVE / ROUND 17 OF 20
ANTIGRAVITY_AUTO_AUTH = NO
CLAUDE_AUTO_REVIEW = NO
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP003-R4-R2-TEST-20260902-01
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_APP794_DEPLOY_AUTH = NONE
LIVE_UAT = NO
ROLLBACK = NO
D3_EXECUTION = HOLD
```

## 9. Exact next action

```text
NEXT_EXECUTOR = ANTIGRAVITY
NEXT_ACTION = EXECUTE ONLY D2-WP003-R4-R2-TEST-20260902-01
EXPECTED_CHANGED_FILE = tests/mbo-xlsx-ooxml-feasibility.test.js ONLY
EXPECTED_COMMITS = EXACTLY ONE BOUNDED TEST-ONLY IMPLEMENTATION/BLOCKER COMMIT
ANTIGRAVITY = STOP IMMEDIATELY AFTER PUSH/REPORT
CLAUDE = STOP
CHATGPT = INDEPENDENT REVIEW AFTER IMPLEMENTATION ARRIVES
D3 = HOLD
```
