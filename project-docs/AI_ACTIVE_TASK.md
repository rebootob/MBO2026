# AI ACTIVE TASK — R2-D-PRE1-R1 REVIEWED / PARTIAL PASS / PRE1-R2 PROPOSAL READY

Mode: **CONTROL PLANE / NO ACTIVE EXECUTOR / ULTRA-LOW-CREDIT / NO KINTONE / NO DEPLOY / D3 HOLD**
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
D2_WP004_R2_D_PRE1_R2 = RESIDUAL PACKAGE-GRAPH CORRECTIVE PROPOSAL READY / NOT AUTHORIZED

ACTIVE_WORK_PACKAGE = NONE
ACTIVE_D2_EVIDENCE_AUTH = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE

ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
COMBINED_EXCEL_PARITY = PRE1-R1 REVIEWED / IMPLEMENTATION NOT AUTHORIZED
D3 = HOLD
```

## 2. Reviewed PRE1-R1 evidence

Authorization HEAD:
`d272f1b7012fcec5bafa2f7338613c46bf2a278e`

Evidence commit:
`4b2cea2ecaecbb9438d476b0ce5bf7f40088aab2`

Commit message:
`docs: complete combined xlsx dependency evidence (R2-D-PRE1-R1)`

Scope review:
```text
AHEAD_BY = 1
BEHIND_BY = 0
CHANGED_FILES = 1
ONLY_CHANGED_FILE = project-docs/phase-3/evidence/XLSX_COMBINED_WORKBOOK_COMPOSITION_EVIDENCE.md
SOURCE_CHANGE = 0
TEST_CHANGE = 0
TEMPLATE_BINARY_CHANGE = 0
```

Scope = PASS.

## 3. Accepted / frozen from PRE1 + PRE1-R1

The following findings are accepted and do not need another broad rediscovery unless contradictory exact evidence appears:

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

The auxiliary verdict is accepted because R1 records no formulas, defined-name dependency, data validation, hyperlink, table, chart, external reference/link, worksheet relationship, or literal main-sheet cross-reference requiring auxiliary `Sheet1`.

The direct-copy verdict is accepted because style definitions and shared-string indices differ across the two workbook-global authorities and the two packages contain same-named drawing/printer-settings parts. Some R1 collision wording is not exact (see Blocker C), but the final unsafe verdict remains correct.

## 4. Why PRE1/PRE1-R1 are still NOT CLOSED

R1 substantially improved exact evidence, but the future dependency map still contains material contradictions with frozen structural authority and omits one same-path package collision. Therefore `GLOBAL_REMAP_DEPENDENCIES = EXACT` is not yet accepted.

### Blocker A — Part A Print_Area is wrong and loses dynamic authority

R1 proposes:
```text
'MBO Staff & Chief'!$A$1:$X$52
```

Frozen Part A structural authority is:
```text
objectiveCount 4..10
Print_Area = 'MBO Staff & Chief'!$A$1:$BJ$52 .. $BJ$58
```

The composer must not reconstruct a fixed/base Print_Area. It must preserve the exact already-rendered Part A `_xlnm.Print_Area` value and keep it bound to final `localSheetId=0`.

### Blocker B — Part B Print_Area is incorrectly hard-coded to N=6

R1 proposes fixed:
```text
'(Part B) Competency'!$A$1:$X$35
```

Frozen Part B authority is dynamic:
```text
N=6 -> $X$35
N=7 -> $X$39
N=8 -> $X$43
```

The composer must preserve the exact already-rendered Part B Print_Area and rebind it to final `localSheetId=1`; it must not infer/hard-code N=6.

### Blocker C — worksheet-local rId and media collision semantics are misstated

`rId` values inside different worksheet/drawing `.rels` parts are local namespaces. Part A `sheet1.xml.rels:rId2` and future Part B `sheet2.xml.rels:rId2` may coexist; the collision is the shared target part path `xl/drawings/drawing1.xml`, not the local rId value itself.

Likewise `xl/media/image1.jpeg` and `xl/media/image1.png` are different OPC part names and do not collide merely because their base stem or local drawing `rId1` matches. A composer may rename the Part B image defensively, but evidence must not classify this as a mandatory path collision unless the exact path is identical.

R2 must correct the dependency model so implementation remaps only actual global/part-path conflicts.

### Blocker D — omitted printerSettings package-part collision

R1's own exact inventory proves:
```text
Part A main sheet rId1 -> ../printerSettings/printerSettings1.bin
Part B main sheet rId1 -> ../printerSettings/printerSettings1.bin
```

and the two `printerSettings1.bin` payloads have different size/SHA.

A combined package cannot preserve both payloads under the same OPC part path. The future strategy must allocate a unique Part B printer-settings part path (for example a derived free `printerSettingsN.bin`), copy the exact Part B payload, retarget Part B sheet relationship, and make any required `[Content_Types].xml` handling explicit.

### Blocker E — derived IDs/part names and default style 0 must be exact

R1 states future composer MUST use `rId5`, `sheet2.xml`, and `drawing2.xml`. Those are valid expected next-free values for the inspected exact Part A package, but the implementation contract must require derivation/uniqueness checks and fail closed on occupation rather than blindly hard-code them.

R1 style-set evidence starts at style 1. Cells without an explicit `s` attribute use style 0. R2 must prove Part A and Part B style-0/default semantics are identical, or require the composer to preserve Part B default-style semantics explicitly. Without this proof, exact visual parity is not closed.

### Blocker F — workbook extended properties must be classified

R1 inventories different `docProps/app.xml` payloads but does not state whether adding the second business sheet requires updating workbook extended properties such as worksheet count / TitlesOfParts. R2 must deterministically classify this as `UPDATE_REQUIRED` or `PRESERVE_BASE_SAFE_WITH_PROOF`; do not leave it implicit.

## 5. Exact next proposal — D2-WP004-R2-D-PRE1-R2

```text
WORK_PACKAGE = D2-WP004-R2-D-PRE1-R2
NAME = COMBINED XLSX DYNAMIC PRINT-AREA + RESIDUAL OPC PART-GRAPH CORRECTIVE EVIDENCE
STATE = PROPOSED / NOT AUTHORIZED
MODE = EVIDENCE-ONLY / TARGETED READ-ONLY OWNER+RENDERED AUTHORITY CHECK / ULTRA-LOW-CREDIT
MAX_EXECUTOR_COMMITS = 1
WRITABLE_FILE = project-docs/phase-3/evidence/XLSX_COMBINED_WORKBOOK_COMPOSITION_EVIDENCE.md
```

No source/test/Profile/template binary/control-doc changes are authorized for executor.

## 6. PRE1-R2 exact corrective contract

R2 is targeted only. Do NOT redo the accepted full package inventory.

### R2-A — dynamic Print_Area preservation contract

Using frozen Part A 4..10 and Part B 6/7/8 authorities, correct the strategy so the future composer:
- reads the exact `_xlnm.Print_Area` value from already-rendered Part A and Part B packages;
- requires exactly one valid source Print_Area per business workbook;
- preserves the Part A value byte/semantic-equivalent and binds it to final `localSheetId=0`;
- preserves the Part B value byte/semantic-equivalent and binds it to final `localSheetId=1`;
- never hard-codes `X52`, `BJ52`, `X35`, or any fixed variant in production composition logic;
- fails closed on missing/duplicate/malformed/unexpected sheet-binding authority.

Evidence must explicitly list the frozen matrices `BJ52..BJ58` and `X35/X39/X43` only as acceptance authorities, not as composer-calculation logic.

### R2-B — exact printerSettings collision/remap

Record the exact Part A and Part B printerSettings SHA/relationship tuples already inventoried and correct the future part graph:
- Part A printer settings remain unchanged in base package;
- Part B printer settings receive a derived unique OPC part path;
- Part B sheet relationship retains any local rId that is valid in its own `.rels` namespace or derives a unique local rId only when required;
- relationship target and content-type declarations are updated exactly;
- no Part A payload is overwritten.

### R2-C — correct local/global relationship and media semantics

Correct the evidence wording:
- workbook relationship IDs are unique within `workbook.xml.rels`;
- worksheet relationship IDs are unique only within each worksheet `.rels` file;
- drawing relationship IDs are unique only within each drawing `.rels` file;
- same local rId across different `.rels` files is not a collision;
- only identical OPC part paths collide globally;
- explicitly state whether Part B `image1.png` truly collides with any Part A media part by exact full path.

### R2-D — derived free ID/part-path contract

For workbook rId, worksheet path, drawing path, printerSettings path and any renamed media path:
- record the current expected next-free candidate from exact owner package;
- require production implementation to derive/check availability and fail closed on collision;
- do not encode the evidence candidate as an unconditional production constant.

### R2-E — default style-0 parity

Compare exact Part A vs Part B `cellXfs[0]` / applicable default-style dependency and choose exactly one:
- `DEFAULT_STYLE0_PARITY = IDENTICAL_WITH_PROOF`
- `DEFAULT_STYLE0_PARITY = REMAP_REQUIRED`
- `DEFAULT_STYLE0_PARITY = UNRESOLVED`

If not identical, future strategy must define how cells without explicit `s` preserve Part B style semantics.

### R2-F — docProps/app.xml classification

Determine whether the combined two-sheet workbook must update `docProps/app.xml` worksheet count / sheet title vectors or whether preserving Part A app properties is safe and standards-valid. Choose exactly one:
- `APP_PROPERTIES = UPDATE_REQUIRED`
- `APP_PROPERTIES = PRESERVE_BASE_SAFE_WITH_PROOF`
- `APP_PROPERTIES = UNRESOLVED`

If update is required, identify the exact fields/structures only; do not implement.

## 7. PRE1/PRE1-R2 closure rule

PRE1 may close after independent review only if:
```text
OWNER_COMBINED_TEMPLATE = NOT_FOUND / accepted
PART_B_AUXILIARY = AUXILIARY_NOT_REQUIRED_FOR_COMBINED / accepted
DIRECT_COPY = DIRECT_COPY_UNSAFE_REMAP_REQUIRED / accepted
DYNAMIC_PRINT_AREA_PRESERVATION = EXACT
PRINTER_SETTINGS_PART_GRAPH = EXACT
RELATIONSHIP_NAMESPACE_MODEL = EXACT
DEFAULT_STYLE0_PARITY = deterministic
APP_PROPERTIES = deterministic
GLOBAL_REMAP_DEPENDENCIES = EXACT
NEXT_STRATEGY = POST_RENDER_OOXML_COMPOSITION_WITH_EXACT_REMAP / internally consistent
```

Closure still does NOT authorize production Combined XLSX implementation.

## 8. Stop boundary

Antigravity is stopped. PRE1-R2 is NOT authorized until Owner explicitly approves it.

Combined XLSX implementation, Kintone writes, deploy, Live UAT, PDF and D3 remain forbidden.

Recommended approval phrase:

`อนุมัติ D2-WP004-R2-D-PRE1-R2 EVIDENCE-ONLY ตามขอบเขตที่เสนอ`
