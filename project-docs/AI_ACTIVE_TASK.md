# AI ACTIVE TASK — D2-WP003-R5-R1 SOURCE+TEST AUTHORIZED

Mode: **CONTROL PLANE / R5 MATRIX FROZEN / PART B ONE-SHOT CORRECTIVE SOURCE+TEST / LOW-CREDIT / EXACT TWO FILES / NO KINTONE / NO DEPLOY / D3 HOLD**  
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
D2_PART_B_STRUCTURAL_GATE = CORRECTIVE REQUIRED / NOT CLOSED
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_USED = 19
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_REMAINING = 1
ANTIGRAVITY_AUTO_AUTH = NO
CLAUDE_AUTO_REVIEW = NO
ACTIVE_WORK_PACKAGE = D2-WP003-R5-R1
ACTIVE_WORK_PACKAGE_NAME = PART B RAW-BASELINE FAIL-CLOSED + DEFINED-NAME PROOF CLOSURE
AUTHORIZED_SCOPE = SOURCE+TEST / EXACT SAME TWO FEASIBILITY FILES ONLY
OWNER_APPROVAL_BASELINE_HEAD = 24d7841af7156f0de2e2aa3c37464b9cb7e81bd2
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R5-R1-SOURCE-TEST-20260902-01
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP003-R5-R1-SOURCE-TEST-20260902-01
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
PRIVACY_PURGE_REQUIRED = NO
D3_EXECUTION = HOLD UNTIL D2 PASS / CLOSED
ANTIGRAVITY = AUTHORIZED ONLY FOR R5-R1 / ONE-SHOT BOUNDED SOURCE+TEST
CLAUDE = STOP / NOT NEEDED
```

## 1. Owner authorization

Owner explicitly authorized:

`D2-WP003-R5-R1 SOURCE+TEST ตามขอบเขตที่เสนอ`

Authorization token:

`D2-WP003-R5-R1-SOURCE-TEST-20260902-01 = ACTIVE / ONE-SHOT / SOURCE+TEST / EXACT TWO FILES / DO NOT WIDEN / DO NOT REUSE`

## 2. R5 reviewed baseline — frozen

```text
R5_AUTHORIZATION = D2-WP003-R5-SOURCE-TEST-20260902-01 / CONSUMED / CORRECTIVE / DO NOT REUSE
R5_AUTHORIZATION_COMMIT = f1f0b627f4b612120a27a3467bb6e8713a1f526a
R5_IMPLEMENTATION_COMMIT = 068e719a7b6c0fee66613619a7aa7ed359960cb5
R5_SCOPE_REVIEW = PASS
R5_MATRIX_SOURCE_BEHAVIOR = PASS / FROZEN EXCEPT FAIL-CLOSED BASELINE GUARD
R5_MATRIX_PROOF = PASS EXCEPT DEFINED-NAME CONTROL
R5_INDEPENDENT_RUNTIME_SIGNAL = UNAVAILABLE / NO GITHUB STATUS OR WORKFLOW RUN
R5_STATUS = CORRECTIVE REQUIRED
```

Do NOT redesign or weaken accepted R5 controls. Frozen behavior/proof includes:
- real variants `bufB6`, `bufB7`, `bufB8`, `buffers[6..8]` from one bounded source path;
- source block rows 27:30; downstream threshold row 31; 4 rows per added competency;
- exact rowRefs sequence/uniqueness;
- rows 1:30 structural stability;
- inserted-block normalized cell refs/style/row height/customHeight;
- downstream rows 31:35 exact relocation;
- sentinel relocation B31/B35/B39 and uniqueness;
- full merge inventory equality and declared/actual counts 79/85/91;
- exact output dimensions A1:X35/A1:X39/A1:X43;
- exact output main Print_Area endpoints X35/X39/X43;
- sheet names/order/states;
- Part B main non-target invariants and absolute A4/portrait/75/horizontal-centered/protected authority;
- exact auxiliary `Sheet1` fingerprint stability;
- relationship/media equality;
- workbook-wide formula inventory exactly 0.

## 3. Exact writable scope

Antigravity may modify ONLY:

1. `scripts/export/mbo-xlsx-ooxml-feasibility.js`
2. `tests/mbo-xlsx-ooxml-feasibility.test.js`

Everything else is READ-ONLY or forbidden.

## 4. Mandatory SOURCE corrective

Retain the accepted R5 6/7/8 insertion algorithm unchanged except for bounded prerequisite guards.

Before creating/mutating the xlsx-populate structural working copy, inspect the exact SHA-verified RAW owner-template package and fail closed with the deterministic Part B structural blocker family if any required fact is false or ambiguous.

Required raw-source authority:

```text
PART_B_SHA256 == c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
raw main worksheet XML exists
raw main dimension tag == <dimension ref="A1:X35"/>
raw actual merge inventory length == 79
raw mergeCells declared count == 79
raw source-block rows 27:30 contain exactly 6 merge ranges
required rows 27,28,29,30,31 are each present exactly once
raw workbook.xml exists
exactly one _xlnm.Print_Area definedName exists
that Print_Area localSheetId == 0
that Print_Area normalized value == '(Part B) Competency'!$A$1:$X$35
no Print_Area is bound to Sheet1/localSheetId 1
```

Important:
- actual raw merge inventory and declared count must BOTH equal 79;
- validate the unmodified owner-template package before structural working-copy mutation;
- after raw-source guards PASS, current deterministic output emission/re-emission of count-dependent dimension and main Print_Area for N=6/7/8 is allowed bounded construction;
- do NOT build generic XLSX repair/tolerance/parser redesign;
- if required structure cannot be located unambiguously, throw blocker and STOP.

## 5. Mandatory TEST corrective

Retain EVERY accepted R5 assertion.

### A. Raw owner-template baseline proof

Before assessing generated variants, prove from exact SHA-verified raw source:
- exact dimension `A1:X35`;
- actual raw merges = 79;
- declared merge count = 79;
- source-block rows 27:30 merge inventory = exactly 6;
- exactly one `_xlnm.Print_Area`;
- Print_Area `localSheetId` = exactly `0`;
- normalized Print_Area value = exactly `'(Part B) Competency'!$A$1:$X$35`;
- source `Sheet1` printArea = empty string;
- no Print_Area for localSheetId 1.

### B. Defined-name proof for every N=6,7,8

For each real variant from `getStructuralPartBBuffers()`:

1. Fingerprint proof:
```text
fpN.sheets['(Part B) Competency'].printArea === expectedPrintArea
fpN.sheets['Sheet1'].printArea === ''
```

2. Parse/filter `fpN.definedNames` deterministically and require:
- exactly one `_xlnm.Print_Area` entry;
- `localSheetId` exactly `0`;
- normalized value exactly expectedPrintArea;
- no `_xlnm.Print_Area` for localSheetId 1;
- no unbound/missing-localSheetId Print_Area.

3. Non-print-area defined-name invariance:
- remove ONLY the exact main `_xlnm.Print_Area` entry from baseline and current inventories;
- stable-sort remaining entries deterministically;
- require exact deep equality;
- no unexpected defined name appears, disappears or rebinds.

4. Do not use `includes()` / `endsWith()` as primary authority for print-area binding/value.

## 6. Frozen / forbidden scope

Do NOT modify or weaken:
- accepted R5 6/7/8 insertion/matrix logic and proof;
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
- generated XLSX/image/PDF/evidence binaries;
- Kintone/App53/App794/App795/App801;
- ACL/process/deploy/Live UAT/rollback;
- D3;
- formula-authority next gate;
- any next work package.

Required future checkpoint remains:

`PART_B_EXPANDED_PRIVACY_ADDRESS_REMAP = REQUIRED BEFORE PRODUCTION RENDERER / SECURITY CLOSURE`

Claude is not authorized or needed.

## 7. Required execution

Run exactly:

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
- STOP immediately after push/report;
- do not self-declare PASS/CLOSED;
- do not start another gate;
- do not invoke Claude.

Report only:
- implementation/blocker commit SHA;
- exact changed files;
- both node --check results;
- node --test result;
- npm audit result;
- git status --porcelain;
- blocker if any.

## 8. Authorization ledger

```text
D2-WP003-R3-R36-TEST-20260902-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP003-R4-SOURCE-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R4-R1-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R4-R2-TEST-20260902-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP003-R5-SOURCE-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R5-R1-SOURCE-TEST-20260902-01 = ACTIVE / ONE-SHOT / SOURCE+TEST
CONTROL-PLANE-D2-REVIEW-CORRECTIVE-20-ROUND-20260901 = ACTIVE / ROUND 19 OF 20 / 1 REMAINING
```

## 9. Exact next action

```text
NEXT_EXECUTOR = ANTIGRAVITY
NEXT_ACTION = EXECUTE ONLY D2-WP003-R5-R1-SOURCE-TEST-20260902-01
EXPECTED_CHANGED_FILES = EXACT TWO AUTHORIZED FEASIBILITY FILES ONLY
EXPECTED_COMMITS = EXACTLY ONE BOUNDED IMPLEMENTATION/BLOCKER COMMIT
ANTIGRAVITY = STOP AFTER PUSH/REPORT
CLAUDE = STOP
CHATGPT = INDEPENDENT REVIEW AFTER IMPLEMENTATION ARRIVES
D3 = HOLD
```