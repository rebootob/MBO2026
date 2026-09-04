# AI ACTIVE TASK — R2-D-PRE1-R2 RESIDUAL PACKAGE-GRAPH EVIDENCE AUTHORIZED

Mode: **CONTROL PLANE / BOUNDED EVIDENCE EXECUTOR / ULTRA-LOW-CREDIT / NO KINTONE / NO DEPLOY / D3 HOLD**
Branch: `ai/antigravity-wp002c`
Updated: 2026-09-04 ICT

Read `D2_REVIEW_FAST_START.md` first, then this file. Do not reopen R2-B1/R2-B2/R2-C without a proven regression.

## 1. Current truth

```text
D1 = PASS / CLOSED
D2 = IN PROGRESS
D2_PART_A_STRUCTURAL = PASS / CLOSED / FROZEN
D2_PART_B_STRUCTURAL = PASS / CLOSED / FROZEN
D2_PART_B_EXPANDED_PRIVACY = PASS / CLOSED / FROZEN
D2_XLSX_TEMPLATE_PROFILE = PASS / CLOSED / FROZEN
D2_WP004_R2_A = PASS / CLOSED
D2_WP004_R2_B1 = PASS / CLOSED / FROZEN
D2_WP004_R2_B2 = PASS / CLOSED / FROZEN
D2_WP004_R2_C = PASS / CLOSED / FROZEN
R2_C_RUNTIME_EVIDENCE = PASS / OWNER WORKSTATION

D2_WP004_R2_D_PRE1 = REVIEWED / PARTIAL PASS / NOT CLOSED
D2_WP004_R2_D_PRE1_R1 = REVIEWED / PARTIAL PASS / NOT CLOSED
D2_WP004_R2_D_PRE1_R2 = AUTHORIZED / ACTIVE

ACTIVE_WORK_PACKAGE = D2-WP004-R2-D-PRE1-R2
ACTIVE_D2_EVIDENCE_AUTH = D2-WP004-R2-D-PRE1-R2-EVIDENCE-ONLY-20260904-01
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE

ANTIGRAVITY = AUTHORIZED / BOUNDED EVIDENCE ONLY / MAX 1 COMMIT
CLAUDE = STOP
COMBINED_EXCEL_PARITY = PRE1-R2 TARGETED CORRECTIVE EVIDENCE AUTHORIZED / IMPLEMENTATION NOT AUTHORIZED
D3 = HOLD
```

## 2. Owner authorization

Owner explicitly authorized on 2026-09-04 ICT:

`อนุมัติ D2-WP004-R2-D-PRE1-R2 EVIDENCE-ONLY ตามขอบเขตที่เสนอ`

Authorization basis HEAD:
`106ef390a2b86f7b756e853604a5d270517d6244`

Single-use authorization token:

`D2-WP004-R2-D-PRE1-R2-EVIDENCE-ONLY-20260904-01`

This token authorizes exactly one bounded R2 evidence commit. It is consumed when that evidence commit is pushed.

## 3. Accepted / frozen from PRE1 + PRE1-R1

Do not redo these unless contradictory exact evidence appears:

```text
PART_A_OWNER_SHA_FOUND = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B_OWNER_SHA_FOUND = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
OWNER_COMBINED_TEMPLATE_IN_AUTHORIZED_LOCATIONS = NOT_FOUND
PART_B_AUXILIARY = AUXILIARY_NOT_REQUIRED_FOR_COMBINED / ACCEPTED
DIRECT_COPY_WITHOUT_GLOBAL_REMAP = UNSAFE / ACCEPTED
PART_A_THEME_VS_PART_B_THEME = IDENTICAL SHA256 e6029ab4958414b8bb862b17ffed3a708d1513e61a07d88e966071cca31d1bd4
PACKAGE_FULL_SHA_INVENTORY = ACCEPTED AS R1 EVIDENCE
USED_STYLE_ID_SETS = ACCEPTED AS R1 EVIDENCE
USED_SHARED_STRING_INDEX_SETS = ACCEPTED AS R1 EVIDENCE
RELATIONSHIP_TUPLE_INVENTORY = ACCEPTED AS R1 EVIDENCE
CANDIDATE_DIRECTION = POST_RENDER_OOXML_COMPOSITION_WITH_EXACT_REMAP
```

Evidence commits:
- PRE1: `a77cbf6317b5744e0b9a0d696ab293878563c89d`
- PRE1-R1: `4b2cea2ecaecbb9438d476b0ce5bf7f40088aab2`

## 4. Frozen structural authorities relevant to R2

Part A:
```text
objectiveCount 4..10
Print_Area = 'MBO Staff & Chief'!$A$1:$BJ$52 .. $BJ$58
formula inventory = 0
```

Part B:
```text
N=6 -> '(Part B) Competency'!$A$1:$X$35
N=7 -> '(Part B) Competency'!$A$1:$X$39
N=8 -> '(Part B) Competency'!$A$1:$X$43
formula inventory = 0
```

The future composer must preserve already-rendered workbook authority. It must not re-calculate print areas from counts.

## 5. Why PRE1/PRE1-R1 are not yet closed

Residual blockers only:

1. R1 hard-coded wrong/fixed Print_Area values instead of preserving the exact already-rendered Part A/Part B values.
2. Both source packages use `xl/printerSettings/printerSettings1.bin` with different payloads; R1 did not include this actual same-path OPC collision in the future graph.
3. R1 incorrectly treated equal local rIds across different `.rels` namespaces as collisions and described `image1.jpeg` vs `image1.png` as a mandatory media collision despite different full OPC paths.
4. Current next-free `rId5`, `sheet2.xml`, `drawing2.xml` may be evidence candidates, but production must derive/check free IDs/paths and fail closed rather than blindly hard-code them.
5. Part B cells without explicit `s` use default style 0; style-0 parity/remap must be deterministic.
6. `docProps/app.xml` impact from changing workbook sheet inventory must be classified deterministically.

## 6. Authorized work package — D2-WP004-R2-D-PRE1-R2

```text
WORK_PACKAGE = D2-WP004-R2-D-PRE1-R2
NAME = COMBINED XLSX DYNAMIC PRINT-AREA + RESIDUAL OPC PART-GRAPH CORRECTIVE EVIDENCE
STATE = AUTHORIZED / ACTIVE
MODE = EVIDENCE-ONLY / TARGETED READ-ONLY OWNER+RENDERED AUTHORITY CHECK / ULTRA-LOW-CREDIT
MAX_EXECUTOR_COMMITS = 1
WRITABLE_FILE = project-docs/phase-3/evidence/XLSX_COMBINED_WORKBOOK_COMPOSITION_EVIDENCE.md
```

Writable scope is ONLY the existing evidence Markdown file above.

No source, tests, Profile, template binaries, package files, UI, dist or control docs are writable by executor.

## 7. R2 exact corrective contract

R2 is targeted only. Do NOT redo the accepted R1 package inventory.

### R2-A — dynamic Print_Area preservation

Correct the future strategy so the composer:
- reads the exact `_xlnm.Print_Area` from the already-rendered Part A package;
- reads the exact `_xlnm.Print_Area` from the already-rendered Part B package;
- requires exactly one valid source Print_Area per business workbook;
- preserves Part A's exact value and binds it to final `localSheetId=0`;
- preserves Part B's exact value and binds it to final `localSheetId=1`;
- never hard-codes any fixed Part A or Part B variant in production composition logic;
- fails closed on missing, duplicate, malformed, wrong-sheet or otherwise unexpected Print_Area authority.

Evidence must list the frozen Part A `BJ52..BJ58` and Part B `X35/X39/X43` matrices only as acceptance authorities, not as production calculation logic.

### R2-B — printerSettings actual part-path collision

Correct the package graph using the already-inventoried exact Part A/Part B printer settings payloads and relationships:
- preserve Part A `xl/printerSettings/printerSettings1.bin` unchanged;
- allocate a derived free Part B printer-settings OPC path;
- copy the exact Part B payload to that unique path;
- retarget the Part B worksheet relationship to the unique path;
- preserve/derive a valid worksheet-local rId as appropriate;
- update content-type handling if required;
- never overwrite the Part A payload.

### R2-C — relationship namespace and media semantics

Evidence must state correctly:
- workbook rIds are unique within `xl/_rels/workbook.xml.rels`;
- worksheet rIds are unique only within that worksheet's `.rels` file;
- drawing rIds are unique only within that drawing's `.rels` file;
- same local rId in different `.rels` parts is not itself a collision;
- identical full OPC part paths are global collisions;
- explicitly determine whether Part B `xl/media/image1.png` has any exact full-path collision with Part A media. Do not classify `.jpeg` vs `.png` as the same OPC path.

### R2-D — derive and verify free IDs / part paths

For the future Part B workbook relationship ID and new worksheet/drawing/printerSettings/media part paths:
- record the expected next-free candidate for the exact inspected base package;
- require implementation to derive/check availability from the actual rendered base package;
- fail closed if an intended candidate is already occupied or package authority differs;
- do not make the evidence candidate an unconditional production constant.

### R2-E — default style 0 parity

Compare exact Part A vs Part B `cellXfs[0]` and its applicable dependencies for cells without explicit `s`.

Choose exactly one:
- `DEFAULT_STYLE0_PARITY = IDENTICAL_WITH_PROOF`
- `DEFAULT_STYLE0_PARITY = REMAP_REQUIRED`
- `DEFAULT_STYLE0_PARITY = UNRESOLVED`

If not identical, document the required future preservation/remap behavior. Do not implement.

### R2-F — docProps/app.xml classification

Determine whether a final two-sheet workbook requires updating `docProps/app.xml` worksheet count / TitlesOfParts or related extended-property structures, or whether retaining Part A app properties is standards-valid and parity-safe.

Choose exactly one:
- `APP_PROPERTIES = UPDATE_REQUIRED`
- `APP_PROPERTIES = PRESERVE_BASE_SAFE_WITH_PROOF`
- `APP_PROPERTIES = UNRESOLVED`

If update is required, identify only the exact structures/fields that future implementation must update.

## 8. Required final evidence result

Update ONLY:
`project-docs/phase-3/evidence/XLSX_COMBINED_WORKBOOK_COMPOSITION_EVIDENCE.md`

Final machine-readable summary must include:

```text
PRE1_R2_RESULT = PASS | BLOCKED
OWNER_COMBINED_TEMPLATE = NOT_FOUND | FOUND | UNRESOLVED
PART_B_AUXILIARY = AUXILIARY_NOT_REQUIRED_FOR_COMBINED | AUXILIARY_REQUIRED_FOR_MAIN_SHEET | AUXILIARY_DEPENDENCY_UNRESOLVED
DIRECT_COPY = DIRECT_COPY_SAFE_WITH_PROOF | DIRECT_COPY_UNSAFE_REMAP_REQUIRED | DIRECT_COPY_BLOCKED_UNRESOLVED
DYNAMIC_PRINT_AREA_PRESERVATION = EXACT | UNRESOLVED
PRINTER_SETTINGS_PART_GRAPH = EXACT | UNRESOLVED
RELATIONSHIP_NAMESPACE_MODEL = EXACT | UNRESOLVED
DEFAULT_STYLE0_PARITY = IDENTICAL_WITH_PROOF | REMAP_REQUIRED | UNRESOLVED
APP_PROPERTIES = UPDATE_REQUIRED | PRESERVE_BASE_SAFE_WITH_PROOF | UNRESOLVED
GLOBAL_REMAP_DEPENDENCIES = EXACT | UNRESOLVED
NEXT_STRATEGY = REUSE_EXISTING_OWNER_COMBINED_TEMPLATE | POST_RENDER_OOXML_COMPOSITION_WITH_EXACT_REMAP | COMPOSITION_BLOCKED_PENDING_NEW_OWNER_AUTHORITY
SOURCE_CHANGE = 0
TEST_CHANGE = 0
TEMPLATE_CHANGE = 0
XLSX_BINARY_COMMITTED = 0
KINTONE_WRITE = 0
DEPLOY = 0
```

## 9. Mandatory non-goals

PRE1-R2 must NOT:
- modify any `src/` file;
- modify any existing/new test;
- modify Profile/preparer/renderer/export service;
- modify any owner XLSX/template binary;
- generate or commit a combined XLSX;
- modify `project-docs/AI_ACTIVE_TASK.md`, `D2_REVIEW_FAST_START.md` or any other control document;
- modify package.json/package-lock;
- perform Kintone writes/deploy/Live UAT;
- build UI/dist;
- start PDF;
- start D3;
- self-authorize implementation or a next gate.

If a conclusion requires broader scope, STOP and report it rather than expanding scope.

## 10. Verification before commit/push

Before commit:

```text
git diff --name-only
  = project-docs/phase-3/evidence/XLSX_COMBINED_WORKBOOK_COMPOSITION_EVIDENCE.md only

git diff --check
  = PASS

XLSX_BINARY_ADDED_OR_MODIFIED = NONE
SOURCE_CHANGED = NONE
TEST_CHANGED = NONE
PROFILE_CHANGED = NONE
CONTROL_DOC_CHANGED = NONE
KINTONE_WRITE = 0
DEPLOY = 0
```

Create exactly one evidence commit, push canonical branch, then STOP.

Suggested message:
`docs: close residual combined xlsx evidence gaps (R2-D-PRE1-R2)`

## 11. Closure rule

PRE1/PRE1-R2 may close only after independent ChatGPT review proves:

```text
OWNER_COMBINED_TEMPLATE = deterministic
PART_B_AUXILIARY = deterministic
DIRECT_COPY = deterministic
DYNAMIC_PRINT_AREA_PRESERVATION = EXACT
PRINTER_SETTINGS_PART_GRAPH = EXACT
RELATIONSHIP_NAMESPACE_MODEL = EXACT
DEFAULT_STYLE0_PARITY = deterministic
APP_PROPERTIES = deterministic
GLOBAL_REMAP_DEPENDENCIES = EXACT
NEXT_STRATEGY = exactly one and internally consistent
```

Closure still does NOT authorize production Combined XLSX implementation.

## 12. Stop boundary

Combined XLSX implementation, Kintone writes, deploy, Live UAT, PDF and D3 remain forbidden until separately authorized.
