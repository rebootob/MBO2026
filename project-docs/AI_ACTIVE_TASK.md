# AI ACTIVE TASK — D2-WP003-R5 SOURCE+TEST PROPOSED

Mode: **CONTROL PLANE / READ-ONLY PLANNING COMPLETE / PART A FROZEN / PART B SOURCE+TEST PROPOSAL / NO ACTIVE EXECUTOR / NO KINTONE / NO DEPLOY / D3 HOLD**  
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
REFERENCE_IMAGE_SOURCE_REVIEW = PASS / FROZEN
R4_SOURCE_REVIEW = PASS / FROZEN
R4_SOURCE_BASELINE = bf9ef7e82c78efc2e725614046745a3ccf394054 / FROZEN
R4-R2_STATUS = PASS / CLOSED
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_USED = 18
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_REMAINING = 2
ANTIGRAVITY_AUTO_AUTH = NO
CLAUDE_AUTO_REVIEW = NO
ACTIVE_WORK_PACKAGE = NONE
PROPOSED_WORK_PACKAGE = D2-WP003-R5
PROPOSED_WORK_PACKAGE_NAME = PART B COMPETENCY INSERTION STRUCTURAL MATRIX CLOSURE
PROPOSED_SCOPE = SOURCE+TEST / EXACT TWO FEASIBILITY FILES ONLY
PROPOSED_STATUS = WAIT OWNER AUTHORIZATION
PLANNING_BASELINE_HEAD = c67c93a7bec6d2a753855073360eb469d33859b9
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

## 1. READ-ONLY planning findings

Current source at planning baseline `c67c93a7bec6d2a753855073360eb469d33859b9` proves:

### Part B template/source authority
- exact Part B owner-template SHA = `c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3`;
- main sheet = `(Part B) Competency`;
- auxiliary sheet = `Sheet1`;
- baseline competency count = 6;
- complete source competency block used by current insertion algorithm = rows `27:30`;
- downstream summary/content threshold = row `31`;
- baseline main extent = `A1:X35`;
- baseline main merge count = `79`;
- main page authority already proven elsewhere: `paperSize=9` (A4), `orientation=portrait`, `scale=75`, horizontal centering enabled, protection present;
- workbook-wide formula inventory = 0.

### Current structural helper limitation
`getStructuralPartBBuffers()` currently:
- returns only `bufB6` and `bufB8`;
- creates 6 baseline by setting privacy-safe sentinel `B31 = SENTINEL_ROW_31`;
- hard-codes the 8 path to `extraRows = 8`;
- shifts original row nodes and cell refs with row >=31 by +8;
- clones source rows 27:30 to 31:34 and 35:38;
- shifts merge endpoints at row >=31 by +8;
- clones source-block merge ranges for the two inserted blocks;
- changes main dimension by +8 rows;
- hard-codes print area to `'(Part B) Competency'!$A$1:$X$43`.

### Current proof limitation
The existing test `FEASIBILITY_TRUE_PART_B_RAW_OOXML_BLOCK_INSERTION`:
- exercises only 6 and 8 competencies;
- checks only merge counts 79/91;
- uses print-area suffix checks rather than exact full-string authority;
- does not prove 7 competencies;
- does not prove exact row-node identity, block clone structure, downstream relocation, full merge-set equality, auxiliary `Sheet1` stability, full workbook invariants, defined-name stability or formulas for every matrix variant.

Conclusion:
`TEST-ONLY` would force test-side structural logic invention for 7 competencies and would not prove the real source path. Smallest safe scope is SOURCE+TEST on the two existing feasibility files only.

## 2. Proposed exact write scope — NOT AUTHORIZED

If and only if Owner explicitly authorizes R5, Antigravity may modify ONLY:

1. `scripts/export/mbo-xlsx-ooxml-feasibility.js`
2. `tests/mbo-xlsx-ooxml-feasibility.test.js`

Read-only as needed:
- current D2 operational docs;
- `CONFIRMED_BASELINE/D2_PART_A_STRUCTURAL_CLOSURE.md` only for pattern/reference;
- exact ignored Part B owner template after SHA verification;
- package metadata.

No other file is writable under the proposed R5 scope.

## 3. Mandatory SOURCE behavior if authorized

Generalize only the existing Part B feasibility helper. Do not redesign unrelated export logic.

Required output contract:

```text
getStructuralPartBBuffers() => {
  bufB6,
  bufB7,
  bufB8,
  buffers
}

buffers[6] === semantic 6-competency structural baseline
buffers[7] === real 7-competency structural variant
buffers[8] === semantic current 8-competency structural variant
```

For `N in {6,7,8}`:

```text
extraBlocks = N - 6
extraRows = 4 * extraBlocks
expectedLastRow = 35 + extraRows
expectedMergeCount = 79 + (6 * extraBlocks)
```

Use the SAME current raw-OOXML block algorithm:
- source block rows `27:30` are the clone authority;
- original rows/cells at `>=31` shift by `extraRows`;
- inserted block `j` uses exact source-block structure shifted by `4*j` rows, where `j=1..extraBlocks`;
- original merge endpoints at `>=31` shift by `extraRows`;
- only merge ranges wholly belonging to source block `27:30` are cloned for inserted blocks;
- dimension becomes exact `A1:X${expectedLastRow}`;
- print area becomes exact `'(Part B) Competency'!$A$1:$X$${expectedLastRow}`;
- sentinel `SENTINEL_ROW_31` must move with the original downstream row 31.

Preserve backwards-compatible `bufB6` and `bufB8` outputs. Add `bufB7` and `buffers`; do not remove existing consumers.

### Fail-closed structural prerequisites
Do not silently generate a partial workbook. If the exact SHA-verified template does not expose the expected structural prerequisites, throw a deterministic Part B structural blocker and STOP rather than guessing/reconstructing.

At minimum fail closed if any of these cannot be proven before mutation:
- main worksheet OOXML exists;
- required source rows 27,28,29,30 exist exactly once;
- row 31 downstream/sentinel source exists;
- source-block merge inventory is resolved and equals the expected 6 merge ranges for one 4-row competency block;
- baseline merge count/declaration resolves to 79;
- baseline dimension is exact `A1:X35`;
- baseline main print area is exact `'(Part B) Competency'!$A$1:$X$35`;
- required `<mergeCells>` and workbook print-area structures needed for bounded mutation are present.

Do not broaden this into generic XLSX repair or parser redesign.

## 4. Mandatory TEST matrix if authorized

Template-dependent proof may skip only when the exact owner template is unavailable. Do not reconstruct/invent/publish/commit the employee-bearing binary.

Run the REAL helper and prove every count 6,7,8.

### A. Exact SHA / real source path
- require exact Part B SHA before template-dependent structural proof;
- obtain variants only from `getStructuralPartBBuffers()`;
- do not duplicate insertion implementation inside tests.

### B. Exact row-node sequence + uniqueness
Using 6 competencies as the structural baseline:
- baseline row refs <=30 remain exactly unchanged;
- inserted blocks occupy exactly:
  - N=7: rows 31:34;
  - N=8: rows 31:34 and 35:38;
- every baseline row ref >=31 shifts exactly by `extraRows`;
- construct deterministic expected rowRefs from baseline plus inserted rows;
- require exact deep equality to inspector `rowRefs`;
- require `new Set(rowRefs).size === rowRefs.length`;
- no row loss, duplicate row nodes, unexpected row refs or improper old downstream row remains.

### C. Exact inserted-block structural clones
For each inserted block, map each target row to its source row in 27:30 and prove after row-number normalization:
- cell-reference pattern exact;
- style-id pattern exact;
- row height exact;
- customHeight exact.

Do not prove inserted blocks by count only.

### D. Exact downstream relocation
For every baseline row >=31:
- target row = baseline row + `extraRows`;
- normalized cell refs equal baseline;
- style pattern equal baseline;
- row height/customHeight equal baseline.

### E. Privacy-safe sentinel relocation
- N=6 => sentinel exactly at `B31`;
- N=7 => sentinel exactly at `B35`;
- N=8 => sentinel exactly at `B39`;
- sentinel exists exactly once;
- for N>6 it is absent from old `B31`;
- do not log any employee-bearing values.

### F. Full merge inventory equality
Do not use merge-count-only proof.

Build expected merge inventory from the 6 baseline:
- baseline merge endpoints at >=31 shift by `extraRows`;
- merges before downstream threshold remain unchanged;
- exact source-block merges wholly in rows 27:30 are cloned for each inserted block at +4 and +8 offsets as applicable;
- stable sort expected and observed inventories;
- require exact deep equality.

Also retain absolute authority:
- N=6 => merge count 79;
- N=7 => merge count 85;
- N=8 => merge count 91;
- declared merge count equals actual exact merge inventory size.

### G. Exact dimension + exact print area
Require exact strings, not `includes()` / `endsWith()` as primary proof:

```text
N=6 dimension = <dimension ref="A1:X35"/>
N=7 dimension = <dimension ref="A1:X39"/>
N=8 dimension = <dimension ref="A1:X43"/>

N=6 printArea = '(Part B) Competency'!$A$1:$X$35
N=7 printArea = '(Part B) Competency'!$A$1:$X$39
N=8 printArea = '(Part B) Competency'!$A$1:$X$43
```

### H. Workbook sheet / defined-name invariants
For every variant:
- exact sheet names/order match 6 baseline and remain `[(Part B) Competency, Sheet1]`;
- exact `sheetStates` match baseline;
- no extra/missing/reordered worksheet;
- main print area is bound only to localSheetId 0;
- auxiliary `Sheet1` print area remains empty;
- all non-print-area defined names remain identical;
- the only expected defined-name difference is the exact main print-area row endpoint for 7/8.

### I. Main-sheet non-target invariant equality
Compare `(Part B) Competency` to 6 baseline for all non-intentionally-changing fingerprint fields, at minimum:
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

`dimension`, `rawMerges`, `rawMergeCount`, `mergeCountAttr`, `rowHeightsHash`, and main `printArea` are intentionally structure-dependent and must be covered by the exact specialized proof above rather than compared unchanged.

Retain absolute main-sheet authority for every count:
- `paperSize === '9'` (A4);
- `orientation === 'portrait'`;
- `scale === '75'`;
- horizontal centering remains enabled;
- sheet protection remains present/non-`none`.

### J. Auxiliary Sheet1 exact stability
For every 6/7/8 structural variant:
- require exact deep equality of the entire `fpN.sheets['Sheet1']` fingerprint to the 6 structural baseline `Sheet1` fingerprint;
- this includes dimension, merge inventory/count, colsHash, rowHeightsHash, gridline/page settings, protection, empty print area and sheet relationships;
- R5 must not reopen or broaden Option B preservation policy. This is structural-variant-to-structural-baseline stability proof only.

### K. Package relationships / media
For every count:
- `relTuples` exactly equal 6 baseline;
- `mediaFiles` exactly equal 6 baseline;
- no extra worksheet relationship or media drift.

### L. Formula inventory
For every 6/7/8 variant:
- `getWorksheetFormulaSet(buffer).size === 0`;
- this helper scans all worksheets, so both Part B sheets remain formula-free.

## 5. Privacy boundary — explicitly OUT OF SCOPE for R5

Current accepted privacy classification/evidence describes the exact 6-block owner-template addresses. In expanded 7/8 structures, new competency blocks occupy rows that were summary/signature rows in the source layout and the original summary shifts downward.

R5 MUST NOT modify:
- `PART_B_SENSITIVE_RANGES`;
- `resolvePartBPrivacyRoles()`;
- typed privacy metadata;
- sanitization logic;
- privacy evidence.

Instead preserve this required future checkpoint:

```text
PART_B_EXPANDED_PRIVACY_ADDRESS_REMAP = REQUIRED BEFORE PRODUCTION RENDERER / SECURITY CLOSURE
```

Production renderer work must derive/move competency and summary privacy roles consistently with the expanded structure; it must not blindly apply original 6-block absolute addresses to 7/8 output.

This future requirement does not reopen the accepted source-template privacy evidence and does not block structural feasibility R5 by itself.

## 6. Frozen / out of scope

Do NOT modify under R5:
- Part A source/test behavior except unavoidable import/use continuity with no semantic change;
- preservation / Option B source or proof;
- reference-image source or proof;
- privacy/sanitization code or evidence;
- dependencies/package lock;
- production XLSX renderer;
- combined Excel export;
- PDF renderer/export;
- generated XLSX/images/PDF/evidence binaries;
- Kintone/App53/App794/App795/App801;
- ACL/process/deploy/Live UAT/rollback;
- D3;
- formula-authority next gate;
- any next work package after R5.

If the 6/7/8 matrix reveals a source defect that requires redesign beyond bounded generalization of the existing Part B feasibility helper, STOP and deliver a blocker. Do not widen scope.

Claude is not authorized or needed for implementation.

## 7. Required execution sequence if Owner authorizes R5

```bash
node --check scripts/export/mbo-xlsx-ooxml-feasibility.js
node --check tests/mbo-xlsx-ooxml-feasibility.test.js
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

Delivery rules if authorized:
- exactly ONE bounded SOURCE+TEST implementation or blocker commit;
- push to `ai/antigravity-wp002c`;
- STOP immediately after push/report;
- executor must not self-declare PASS/CLOSED;
- do not start privacy remapping, renderer, formula authority, Part A work or any next package.

Report only:
- implementation/blocker commit SHA;
- exact changed files;
- both `node --check` results;
- `node --test` result;
- `npm audit --omit=dev` result;
- `git status --porcelain`;
- blocker if any.

## 8. Authorization ledger

```text
D2-WP003-R3-R36-TEST-20260902-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP003-R4-SOURCE-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R4-R1-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R4-R2-TEST-20260902-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP003-R5 = PROPOSED / NOT AUTHORIZED
CONTROL-PLANE-D2-REVIEW-CORRECTIVE-20-ROUND-20260901 = ACTIVE / ROUND 18 OF 20
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
NEXT_ACTION = DECIDE WHETHER TO AUTHORIZE D2-WP003-R5 SOURCE+TEST AS PROPOSED
ACTIVE_WORK_PACKAGE = NONE
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
CHATGPT = INDEPENDENT REVIEW AFTER ANY AUTHORIZED IMPLEMENTATION ARRIVES
D3 = HOLD
```

No R5 implementation authorization exists until exact Owner approval is recorded.