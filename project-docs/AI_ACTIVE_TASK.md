# AI ACTIVE TASK — D2-WP003-R5 SOURCE+TEST AUTHORIZED

Mode: **CONTROL PLANE / PART A FROZEN / PART B ONE-SHOT SOURCE+TEST / LOW-CREDIT / EXACT TWO FILES / NO KINTONE / NO DEPLOY / D3 HOLD**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-02 ICT

Repository truth and accepted newer Live evidence always win. Fresh-fetch current branch HEAD before acting.

```text
TASK_STATE = AUTHORIZED / WAIT ANTIGRAVITY IMPLEMENTATION
D1_OVERALL = PASS / CLOSED
D2_STATUS = IN PROGRESS
D2_PRESERVATION_GATE = PASS / CLOSED
D2_REFERENCE_IMAGE_GATE = PASS / CLOSED
D2_PART_A_STRUCTURAL_GATE = PASS / CLOSED
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_USED = 18
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_REMAINING = 2
ANTIGRAVITY_AUTO_AUTH = NO
CLAUDE_AUTO_REVIEW = NO
ACTIVE_WORK_PACKAGE = D2-WP003-R5
ACTIVE_WORK_PACKAGE_NAME = PART B COMPETENCY INSERTION STRUCTURAL MATRIX CLOSURE
AUTHORIZED_SCOPE = SOURCE+TEST / EXACT TWO FEASIBILITY FILES ONLY
OWNER_APPROVAL_BASELINE_HEAD = 519312ca84b99091a3e863815a398688111dcb39
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R5-SOURCE-TEST-20260902-01
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP003-R5-SOURCE-TEST-20260902-01
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
PRIVACY_PURGE_REQUIRED = NO
D3_EXECUTION = HOLD UNTIL D2 PASS / CLOSED
ANTIGRAVITY = AUTHORIZED ONLY FOR R5 / ONE-SHOT BOUNDED SOURCE+TEST
CLAUDE = STOP / NOT NEEDED
```

## 1. Owner authorization

Owner explicitly authorized:

`D2-WP003-R5 SOURCE+TEST ตามขอบเขตที่เสนอ`

Authorization token:

`D2-WP003-R5-SOURCE-TEST-20260902-01 = ACTIVE / ONE-SHOT / SOURCE+TEST / EXACT TWO FILES / DO NOT WIDEN / DO NOT REUSE`

## 2. Exact writable scope

Antigravity may modify ONLY:

1. `scripts/export/mbo-xlsx-ooxml-feasibility.js`
2. `tests/mbo-xlsx-ooxml-feasibility.test.js`

Everything else is READ-ONLY or forbidden.

## 3. Frozen source/template authority

- exact Part B SHA = `c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3`;
- main sheet = `(Part B) Competency`;
- auxiliary sheet = `Sheet1`;
- baseline competency count = 6;
- source competency clone block = rows `27:30`;
- downstream/summary threshold = row `31`;
- baseline main extent = `A1:X35`;
- baseline merge count = 79;
- main page authority = `paperSize=9` (A4), `orientation=portrait`, `scale=75`, horizontal centered, protected;
- workbook-wide formula inventory = 0.

Do not reopen preservation, Option B, reference-image or Part A.

## 4. Mandatory SOURCE behavior

Generalize ONLY the existing Part B feasibility helper. Do not redesign unrelated export logic.

Required output:

```text
getStructuralPartBBuffers() => {
  bufB6,
  bufB7,
  bufB8,
  buffers
}
```

`buffers[6]`, `[7]`, `[8]` must be real variants from the same source path.

For `N in {6,7,8}`:

```text
extraBlocks = N - 6
extraRows = 4 * extraBlocks
expectedLastRow = 35 + extraRows
expectedMergeCount = 79 + (6 * extraBlocks)
```

Use the SAME current raw OOXML algorithm:
- rows 27:30 are clone authority;
- original rows/cells at >=31 shift by `extraRows`;
- inserted block j is source rows 27:30 shifted by `4*j`, j=1..extraBlocks;
- original merge endpoints >=31 shift by `extraRows`;
- clone only merge ranges wholly belonging to source block 27:30;
- exact main dimension becomes `A1:X${expectedLastRow}`;
- exact main print area becomes `'(Part B) Competency'!$A$1:$X$${expectedLastRow}`;
- sentinel `SENTINEL_ROW_31` moves with original downstream row 31;
- preserve backward-compatible `bufB6` and `bufB8`; add `bufB7` and `buffers`.

### Fail closed before mutation

Throw a deterministic Part B structural blocker and STOP if any prerequisite is missing or ambiguous, at minimum:
- exact SHA template unavailable/mismatched;
- main worksheet XML missing;
- rows 27,28,29,30 not each present exactly once;
- downstream row 31 missing;
- source-block merge inventory cannot be proven as exactly 6 ranges;
- baseline merge count/declaration not exactly 79;
- baseline dimension not exact `A1:X35`;
- baseline main print area not exact `'(Part B) Competency'!$A$1:$X$35`;
- required mergeCells / print-area structures missing.

Do not build generic XLSX repair/parser behavior.

## 5. Mandatory TEST matrix

Template-dependent proof may skip only when exact owner template is unavailable. Do not reconstruct/invent/publish/commit template binaries.

Use ONLY real variants from `getStructuralPartBBuffers()`; do not duplicate insertion implementation inside tests.

For every N=6,7,8 prove:

### A. Exact row nodes
- baseline rows <=30 unchanged;
- inserted rows exactly 31:34 for N=7 and 31:38 for N=8;
- every baseline row >=31 shifts by `extraRows`;
- deterministic expected `rowRefs` deep-equals observed;
- `new Set(rowRefs).size === rowRefs.length`;
- no loss, duplicate, unexpected or stale downstream row.

### B. Exact inserted block clones
For each inserted row normalized against corresponding source row 27:30 require exact:
- cell-reference pattern;
- style-id pattern;
- row height;
- customHeight.

### C. Exact downstream relocation
For every baseline row >=31, shifted target row must preserve normalized cell refs, styles, row height and customHeight.

### D. Sentinel
- N=6 => `B31`;
- N=7 => `B35`;
- N=8 => `B39`;
- exists exactly once;
- for N>6 absent from old B31.

### E. Full merge inventory
Build expected merge set from 6 baseline:
- shift baseline merge endpoints >=31 by `extraRows`;
- keep pre-threshold merges unchanged;
- clone exact source-block merge ranges at +4/+8 as applicable;
- stable-sort and deep-equal full inventory.

Absolute counts:
- N=6 => 79
- N=7 => 85
- N=8 => 91
- declared merge count equals actual inventory size.

### F. Exact dimension + print area

```text
N=6: <dimension ref="A1:X35"/> ; '(Part B) Competency'!$A$1:$X$35
N=7: <dimension ref="A1:X39"/> ; '(Part B) Competency'!$A$1:$X$39
N=8: <dimension ref="A1:X43"/> ; '(Part B) Competency'!$A$1:$X$43
```

Use exact equality, not suffix/includes as primary proof.

### G. Workbook/sheet invariants
- exact sheet names/order = `[(Part B) Competency, Sheet1]`;
- exact `sheetStates` baseline equality;
- main print area only localSheetId 0;
- `Sheet1` print area remains empty;
- all non-print-area defined names identical;
- only intentional defined-name difference is main print-area endpoint.

### H. Main-sheet non-target invariants
Baseline equality for:
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

Also retain absolute authority for each N:
- `paperSize === '9'`;
- `orientation === 'portrait'`;
- `scale === '75'`;
- horizontal centering enabled;
- sheet protection present/non-none.

### I. Auxiliary Sheet1 exact stability
For every N, deep-equal entire `fpN.sheets['Sheet1']` to the 6 structural baseline Sheet1 fingerprint, including dimension, merges/count, colsHash, rowHeightsHash, grid/page settings, protection, empty print area and sheet relationships.

### J. Package / formulas
- `relTuples` exact baseline equality;
- `mediaFiles` exact baseline equality;
- `getWorksheetFormulaSet(buffer).size === 0` for all N.

## 6. Privacy boundary — OUT OF SCOPE

Do NOT modify:
- `PART_B_SENSITIVE_RANGES`;
- `resolvePartBPrivacyRoles()`;
- typed privacy metadata;
- sanitization logic;
- privacy evidence.

Required future checkpoint remains:

`PART_B_EXPANDED_PRIVACY_ADDRESS_REMAP = REQUIRED BEFORE PRODUCTION RENDERER / SECURITY CLOSURE`

R5 structural feasibility may close without performing that future remap.

## 7. Frozen / forbidden scope

Do NOT modify:
- Part A behavior;
- preservation / Option B;
- reference-image;
- privacy/sanitization;
- dependencies/package lock;
- production XLSX renderer;
- combined Excel;
- PDF;
- generated XLSX/image/PDF/evidence files;
- Kintone/App53/App794/App795/App801;
- ACL/process/deploy/Live UAT/rollback;
- D3;
- formula-authority next gate;
- any next WP.

If matrix reveals a defect requiring redesign beyond bounded generalization of the existing helper: STOP and deliver blocker. Do not widen scope.

## 8. Required execution

Run exactly:

```bash
node --check scripts/export/mbo-xlsx-ooxml-feasibility.js
node --check tests/mbo-xlsx-ooxml-feasibility.test.js
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

Then:
- create exactly ONE bounded SOURCE+TEST implementation or blocker commit;
- push to `ai/antigravity-wp002c`;
- STOP immediately;
- do not self-declare PASS/CLOSED;
- do not start any next gate;
- do not invoke Claude.

Report only:
- implementation/blocker SHA;
- exact changed files;
- both node --check results;
- node --test result;
- npm audit result;
- git status;
- blocker if any.

## 9. Authorization ledger

```text
D2-WP003-R3-R36-TEST-20260902-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP003-R4-SOURCE-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R4-R1-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R4-R2-TEST-20260902-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP003-R5-SOURCE-TEST-20260902-01 = ACTIVE / ONE-SHOT / SOURCE+TEST
CONTROL-PLANE-D2-REVIEW-CORRECTIVE-20-ROUND-20260901 = ACTIVE / ROUND 18 OF 20
```

## 10. Exact next action

```text
NEXT_EXECUTOR = ANTIGRAVITY
NEXT_ACTION = EXECUTE ONLY D2-WP003-R5-SOURCE-TEST-20260902-01
EXPECTED_CHANGED_FILES = EXACT TWO AUTHORIZED FEASIBILITY FILES ONLY
EXPECTED_COMMITS = EXACTLY ONE BOUNDED IMPLEMENTATION/BLOCKER COMMIT
ANTIGRAVITY = STOP AFTER PUSH/REPORT
CLAUDE = STOP
CHATGPT = INDEPENDENT REVIEW AFTER IMPLEMENTATION ARRIVES
D3 = HOLD
```