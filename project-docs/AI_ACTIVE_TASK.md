# AI ACTIVE TASK — D2-WP003-R5-R1 SOURCE+TEST PROPOSED

Mode: **CONTROL PLANE / R5 INDEPENDENT REVIEW COMPLETE / PART B CORRECTIVE REQUIRED / R5-R1 PROPOSED / NO ACTIVE EXECUTOR / LOW-CREDIT / NO KINTONE / NO DEPLOY / D3 HOLD**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-02 ICT

Repository truth and accepted newer Live evidence always win. Fresh-fetch current branch HEAD before acting.

```text
TASK_STATE = WAIT_OWNER_WORK_PACKAGE_AUTHORIZATION
D1_OVERALL = PASS / CLOSED
D2_STATUS = IN PROGRESS
D2_PRESERVATION_GATE = PASS / CLOSED
D2_REFERENCE_IMAGE_GATE = PASS / CLOSED
D2_PART_A_STRUCTURAL_GATE = PASS / CLOSED
D2_PART_B_STRUCTURAL_GATE = CORRECTIVE REQUIRED / NOT CLOSED
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_USED = 19
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_REMAINING = 1
ANTIGRAVITY_AUTO_AUTH = NO
CLAUDE_AUTO_REVIEW = NO
ACTIVE_WORK_PACKAGE = NONE
PROPOSED_WORK_PACKAGE = D2-WP003-R5-R1
PROPOSED_WORK_PACKAGE_NAME = PART B RAW-BASELINE FAIL-CLOSED + DEFINED-NAME PROOF CLOSURE
PROPOSED_SCOPE = SOURCE+TEST / EXACT SAME TWO FEASIBILITY FILES ONLY
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

## 1. R5 authorization + implementation reviewed

```text
R5_AUTHORIZATION = D2-WP003-R5-SOURCE-TEST-20260902-01
R5_AUTHORIZATION_COMMIT = f1f0b627f4b612120a27a3467bb6e8713a1f526a
R5_IMPLEMENTATION_COMMIT = 068e719a7b6c0fee66613619a7aa7ed359960cb5
R5_SCOPE_REVIEW = PASS
R5_MATRIX_SOURCE_BEHAVIOR = PASS / FROZEN EXCEPT FAIL-CLOSED BASELINE GUARD
R5_MATRIX_PROOF = PASS EXCEPT DEFINED-NAME CONTROL
R5_INDEPENDENT_RUNTIME_SIGNAL = UNAVAILABLE / NO GITHUB STATUS OR WORKFLOW RUN
R5_STATUS = CORRECTIVE REQUIRED
R5_AUTHORIZATION_STATE = CONSUMED / CORRECTIVE / DO NOT REUSE
```

Authorization→implementation is exactly one commit and changes only:
1. `scripts/export/mbo-xlsx-ooxml-feasibility.js`
2. `tests/mbo-xlsx-ooxml-feasibility.test.js`

No production renderer, privacy/sanitization, dependencies, Kintone, deploy, D3 or next-WP files were changed.

## 2. Accepted/frozen R5 behavior and proof

Do NOT redesign or weaken the following accepted R5 work:

### Source matrix behavior
`getStructuralPartBBuffers()` now returns real variants:

```text
bufB6
bufB7
bufB8
buffers[6]
buffers[7]
buffers[8]
```

using the same bounded raw-OOXML algorithm:
- source competency block rows 27:30;
- downstream threshold row 31;
- one inserted competency = 4 rows;
- original rows/cells >=31 shift by 4 * extraBlocks;
- exact source-block merge ranges are cloned per inserted block;
- output dimension and main print endpoint are deterministic for 6/7/8.

### Accepted matrix proof
For every N=6,7,8 the implementation test now proves:
- exact output dimension:
  - 6 => `<dimension ref="A1:X35"/>`
  - 7 => `<dimension ref="A1:X39"/>`
  - 8 => `<dimension ref="A1:X43"/>`
- exact main print area values X35/X39/X43;
- exact rowRefs sequence and uniqueness;
- rows 1:30 structural baseline stability;
- inserted block normalized cell refs/style/row height/customHeight vs source rows 27:30;
- downstream rows 31:35 exact relocation;
- sentinel B31/B35/B39 relocation and uniqueness;
- full merge inventory equality and declared/actual counts 79/85/91;
- sheet names/order and sheetStates baseline equality;
- main non-target invariants: colsHash, gridlines, margins, paperSize, orientation, scale, fitToPage, centering, protection, sheetRels;
- absolute Part B authority: paperSize=9 (A4), portrait, scale=75, horizontally centered, protected;
- exact auxiliary `Sheet1` fingerprint stability;
- package relationship/media equality;
- workbook-wide formula inventory exactly 0.

These accepted controls are frozen for R5-R1 and must remain present.

## 3. Exact R5 blockers

### BLOCKER A — raw-source fail-closed prerequisites incomplete

Current R5 source checks exact owner-template SHA, required rows 27:31, source-block merge count 6, declared merge count 79, and presence of Print_Area. However it does NOT yet explicitly prove all required RAW OWNER-TEMPLATE facts before constructing/mutating the xlsx-populate working copy:
- main source dimension exact `A1:X35`;
- total actual raw main-sheet merge inventory exactly 79 in addition to declared count 79;
- exactly one `_xlnm.Print_Area` defined name for Part B source;
- that Print_Area is bound to `localSheetId="0"`;
- exact raw source value is `'(Part B) Competency'!$A$1:$X$35`;
- no source Print_Area is bound to auxiliary `Sheet1`.

Current code can emit/replace dimension and Print_Area on the working copy after round-trip. That output construction is acceptable ONLY after raw owner-template authority is proven first.

Important clarification for R5-R1:
- exact owner-template SHA remains mandatory;
- raw-source prerequisite checks must inspect the unmodified owner-template package (`origBufB`) before working-copy mutation;
- after these raw-source checks PASS, deterministic emission/re-emission of count-dependent dimension/Print_Area on the working copy is allowed because xlsx-populate may omit/rewrite structural metadata during round-trip;
- do NOT convert this into generic XLSX repair or tolerance for an unknown template.

### BLOCKER B — defined-name proof incomplete

Current R5 test proves output print-area value and `Sheet1` fingerprint stability, but does not explicitly satisfy the R5 defined-name contract:
- exactly one `_xlnm.Print_Area` must exist for every 6/7/8 variant;
- it must have `localSheetId="0"`;
- its value must equal the exact expected main print area for N;
- `Sheet1` printArea must equal empty string explicitly;
- all non-print-area defined names must deep-equal the 6 structural baseline;
- no unexpected defined name may appear/disappear/rebind.

## 4. Proposed R5-R1 exact writable scope — NOT AUTHORIZED

If and only if Owner explicitly authorizes R5-R1, Antigravity may modify ONLY:

1. `scripts/export/mbo-xlsx-ooxml-feasibility.js`
2. `tests/mbo-xlsx-ooxml-feasibility.test.js`

No other file is writable.

## 5. Mandatory SOURCE corrective if authorized

Retain the R5 6/7/8 algorithm unchanged except for bounded prerequisite guards.

Before any working-copy structural mutation, using the exact SHA-verified raw owner-template package, fail closed with the existing deterministic Part B structural blocker family if any of these is false:

```text
raw main worksheet XML exists
raw main dimension tag == <dimension ref="A1:X35"/>
raw actual merge inventory length == 79
raw mergeCells declared count == 79
raw source-block rows 27:30 contain exactly 6 merge ranges
required rows 27,28,29,30,31 are each present exactly once
workbook.xml exists
exactly one _xlnm.Print_Area definedName exists
that Print_Area localSheetId == 0
that Print_Area value == '(Part B) Competency'!$A$1:$X$35
no Print_Area is bound to Sheet1/localSheetId 1
```

Do not trust declared merge count alone; actual raw merge inventory and declaration must both equal 79.

After those checks pass, preserve current bounded working-copy construction for N=6/7/8, including deterministic count-dependent dimension and main Print_Area emission. Do not redesign the insertion algorithm.

If a required raw package structure cannot be located unambiguously: throw blocker and STOP rather than guessing.

## 6. Mandatory TEST corrective if authorized

Retain every accepted R5 assertion.

Additionally, before invoking/assessing generated variants, prove exact raw owner-template baseline authority from the exact SHA-verified source buffer:
- exact source dimension A1:X35;
- actual raw merges 79 and declared count 79;
- exact source-block merge count 6;
- exact source main Print_Area/localSheetId0;
- source `Sheet1` printArea empty.

For each generated variant N=6,7,8 add explicit defined-name proof:

1. From `getWorkbookFingerprint(bufN)` require:
   - `fpN.sheets['(Part B) Competency'].printArea === expectedPrintArea`;
   - `fpN.sheets['Sheet1'].printArea === ''`.

2. Parse/filter `fpN.definedNames` deterministically:
   - exactly one entry whose name is `_xlnm.Print_Area`;
   - its `localSheetId` is exactly `0`;
   - its normalized value equals `expectedPrintArea`;
   - no `_xlnm.Print_Area` exists for localSheetId 1 or without the required localSheetId.

3. Remove only the exact main Print_Area entry from baseline and current defined-name inventories, stable-sort the remaining entries, and require exact deep equality. This proves every non-print-area defined name is unchanged.

4. Do not use `includes()`/`endsWith()` as the primary authority for print-area binding/value.

## 7. Frozen / forbidden scope

R5-R1 must NOT modify or weaken:
- accepted 6/7/8 row/block/merge/sentinel/dimension/output print-area matrix logic;
- Part A behavior/proof;
- preservation / Option B;
- reference-image;
- `PART_B_SENSITIVE_RANGES`;
- `resolvePartBPrivacyRoles()`;
- typed privacy metadata;
- sanitization/privacy evidence;
- dependencies/package lock;
- production XLSX renderer;
- combined Excel;
- PDF;
- generated workbook/image/PDF/evidence binaries;
- Kintone/App53/App794/App795/App801;
- ACL/process/deploy/Live UAT/rollback;
- D3;
- formula-authority next gate;
- any next WP.

Required future checkpoint remains:
`PART_B_EXPANDED_PRIVACY_ADDRESS_REMAP = REQUIRED BEFORE PRODUCTION RENDERER / SECURITY CLOSURE`.

Claude is not authorized or needed for R5-R1 unless ChatGPT later proves material ambiguity.

## 8. Required execution if Owner authorizes R5-R1

```bash
node --check scripts/export/mbo-xlsx-ooxml-feasibility.js
node --check tests/mbo-xlsx-ooxml-feasibility.test.js
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

Delivery rules:
- exactly ONE bounded SOURCE+TEST implementation or blocker commit;
- push to `ai/antigravity-wp002c`;
- STOP after push/report;
- do not self-declare PASS/CLOSED;
- do not start another gate;
- do not invoke Claude.

## 9. Authorization ledger

```text
D2-WP003-R3-R36-TEST-20260902-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP003-R4-SOURCE-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R4-R1-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R4-R2-TEST-20260902-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP003-R5-SOURCE-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R5-R1 = PROPOSED / NOT AUTHORIZED
CONTROL-PLANE-D2-REVIEW-CORRECTIVE-20-ROUND-20260901 = ACTIVE / ROUND 19 OF 20 / 1 REMAINING
```

## 10. Exact next action

```text
NEXT_EXECUTOR = OWNER
NEXT_ACTION = DECIDE WHETHER TO AUTHORIZE D2-WP003-R5-R1 SOURCE+TEST AS PROPOSED
ACTIVE_WORK_PACKAGE = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
CHATGPT = WAIT OWNER
D3 = HOLD
```
