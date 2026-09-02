# AI ACTIVE TASK — D2-WP003-R4-R1 TEST-ONLY AUTHORIZED

Mode: **CONTROL PLANE / R4 SOURCE FROZEN / LOW-CREDIT / ONE-SHOT TEST-ONLY / ONE FILE / NO KINTONE / NO DEPLOY / D3 HOLD**  
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
R4_SCOPE_REVIEW = PASS
R4_SOURCE_REVIEW = PASS / FROZEN
R4_PROOF_REVIEW = FAIL / STRUCTURAL INVARIANT MATRIX INCOMPLETE
R4_INDEPENDENT_RUNTIME_SIGNAL = UNAVAILABLE / NO CI STATUS OR WORKFLOW
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_USED = 16
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_REMAINING = 4
ANTIGRAVITY_AUTO_AUTH = NO
CLAUDE_AUTO_REVIEW = NO
ACTIVE_WORK_PACKAGE = D2-WP003-R4-R1
ACTIVE_WORK_PACKAGE_NAME = PART A STRUCTURAL INVARIANT PROOF CLOSURE
AUTHORIZED_SCOPE = TEST-ONLY / EXISTING FEASIBILITY TEST FILE ONLY
OWNER_APPROVAL_BASELINE_HEAD = 5f22caf6ffc9d539ce0df0c23663dd934385d923
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP003-R4-R1-TEST-20260902-01
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
R4_SOURCE_BASELINE = bf9ef7e82c78efc2e725614046745a3ccf394054 / FROZEN
PRIVACY_PURGE_REQUIRED = NO
D3_EXECUTION = HOLD UNTIL D2 PASS / CLOSED
ANTIGRAVITY = AUTHORIZED ONLY FOR R4-R1 / ONE-SHOT BOUNDED TEST-ONLY EXECUTION
CLAUDE = STOP / NOT NEEDED
```

## 1. Owner authorization

Owner explicitly authorized:

```text
D2-WP003-R4-R1 TEST-ONLY ตามขอบเขตที่เสนอ
```

Authorization token:

```text
D2-WP003-R4-R1-TEST-20260902-01 = ACTIVE / ONE-SHOT / TEST-ONLY / ONE FILE / DO NOT WIDEN / DO NOT REUSE
```

This authorization permits only the bounded proof corrective below. It does not authorize source changes, Part B work, preservation/reference-image changes, evidence publication, renderer work, Kintone writes, deploys, PDF, D3 or any next work package.

## 2. R4 source baseline — FROZEN

Accepted R4 source implementation:

`bf9ef7e82c78efc2e725614046745a3ccf394054`

Retain without modification unless ChatGPT later proves a new source defect:
- real-path objective buffers for counts 4–10;
- backwards-compatible `bufA4`..`bufA10` and `buffers` map;
- existing row/cell shifting and row-28 cloning;
- merge shifting/cloning/count update;
- exact dimension synthesis A1:BL52..A1:BL58;
- exact print-area synthesis BJ52..BJ58;
- sentinel setup.

R4-R1 does NOT authorize `scripts/export/mbo-xlsx-ooxml-feasibility.js` changes.

## 3. Exact write scope — ONE FILE ONLY

Antigravity may modify ONLY:

`tests/mbo-xlsx-ooxml-feasibility.test.js`

READ-ONLY as needed:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`;
- R4 authorization/implementation history;
- package metadata;
- exact ignored Part A owner template only after SHA verification.

## 4. Mandatory TEST-ONLY corrective

Preserve every accepted R4 matrix assertion. Add only the missing exact structural invariant proof.

For EVERY objective count 4,5,6,7,8,9,10:

### A. Exact row-node sequence + uniqueness

Using the 4-objective structural buffer as baseline:
- baseline row refs <=28 remain unchanged;
- inserted row refs are exactly 29 through `28 + extraRows`;
- every baseline row ref >=29 shifts to exactly `r + extraRows`.

Construct the expected row-ref sequence from baseline row refs and require exact equality to `inspN.rowRefs` using deterministic numeric order compatible with the inspector.

Also require:
- `new Set(inspN.rowRefs).size === inspN.rowRefs.length`;
- no unexpected row refs;
- no duplicate row refs;
- no downstream baseline row remains at its old ref when `extraRows > 0` except refs intentionally occupied by inserted rows;
- the exact expected sequence itself is the authoritative no-loss/no-duplicate proof.

Do not substitute count-only or cell-only assertions for row-node identity.

### B. Workbook sheet invariants

Require exact equality to the 4-objective baseline:
- `fpN.sheetNames === baselineFp.sheetNames`;
- `fpN.sheetStates === baselineFp.sheetStates`.

This must prove no extra/missing/reordered/retagged sheet state.

### C. Main-sheet non-target invariant equality

Let:
- `baselineMain = baselineFp.sheets['MBO Staff & Chief']`
- `currentMain = fpN.sheets['MBO Staff & Chief']`

Require exact equality for all non-intentionally-changing fields exposed by the existing fingerprint helper, including at minimum:
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

Dimension, raw merge inventory/count and print area are intentionally count-dependent and must retain the existing exact R4 matrix assertions instead of being compared unchanged.

### D. Retain ALL accepted R4 proof

Do NOT remove or weaken:
- exact Part A owner-template SHA gate;
- real source-path matrix for all objective counts 4–10;
- full computed merge inventory deep equality;
- exact merge count/declaration;
- inserted row normalized cell-ref/style/row-height proof;
- downstream shifted row normalized cell-ref/style/row-height proof;
- sentinel exact relocation and uniqueness;
- exact dimension A1:BL52..A1:BL58;
- exact print area BJ52..BJ58;
- relationship tuple equality;
- media inventory equality;
- formula inventory exactly empty.

### E. Safety / no proof invention

- no source modification;
- no duplicate insertion implementation in test code;
- no employee-bearing values logged or committed;
- no generated workbook/image/PDF/evidence binary committed;
- if owner template is unavailable, skip only template-dependent proof explicitly;
- do not reconstruct or invent owner template/evidence;
- if a newly proven source defect appears, STOP and deliver a blocker; do not modify source under this authorization.

## 5. Required execution sequence

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

## 6. Frozen / out of scope

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
- any next work package after R4-R1.

Claude is not authorized or needed for this bounded proof corrective.

## 7. Authorization ledger

```text
D2-WP003-R3-R36-TEST-20260902-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP003-R4-SOURCE-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R4-R1-TEST-20260902-01 = ACTIVE / ONE-SHOT / TEST-ONLY
CONTROL-PLANE-D2-REVIEW-CORRECTIVE-20-ROUND-20260901 = ACTIVE / ROUND 16 OF 20
ANTIGRAVITY_AUTO_AUTH = NO
CLAUDE_AUTO_REVIEW = NO
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP003-R4-R1-TEST-20260902-01
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
NEXT_ACTION = EXECUTE ONLY D2-WP003-R4-R1-TEST-20260902-01
EXPECTED_CHANGED_FILE = tests/mbo-xlsx-ooxml-feasibility.test.js ONLY
EXPECTED_COMMITS = EXACTLY ONE BOUNDED TEST-ONLY IMPLEMENTATION/BLOCKER COMMIT
ANTIGRAVITY = STOP IMMEDIATELY AFTER PUSH/REPORT
CLAUDE = STOP
CHATGPT = INDEPENDENT REVIEW AFTER IMPLEMENTATION ARRIVES
D3 = HOLD
```
