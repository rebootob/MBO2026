# AI ACTIVE TASK — R2-D-PRE1 REVIEWED / PARTIAL PASS / PRE1-R1 PROPOSAL READY

Mode: **CONTROL PLANE / NO ACTIVE EXECUTOR / LOW-CREDIT / NO KINTONE / NO DEPLOY / D3 HOLD**
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
D2_WP004_R2_D_PRE1_R1 = CORRECTIVE EVIDENCE PROPOSAL READY / NOT AUTHORIZED

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
COMBINED_EXCEL_PARITY = PRE1 EVIDENCE REVIEWED / IMPLEMENTATION NOT AUTHORIZED
D3 = HOLD
```

## 2. Reviewed PRE1 evidence

Authorization HEAD:
`40a300405e22c59096e6902f2bd2709ee9bd9098`

Evidence commit:
`a77cbf6317b5744e0b9a0d696ab293878563c89d`

Commit message:
`docs: add combined xlsx composition evidence (R2-D-PRE1)`

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

## 3. Accepted / frozen findings from PRE1

The following findings are accepted and do not need to be rediscovered in PRE1-R1 unless a contradiction is found:

```text
PART_A_OWNER_SHA_FOUND = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B_OWNER_SHA_FOUND = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
OWNER_COMBINED_TEMPLATE_IN_AUTHORIZED_INSPECTION_LOCATIONS = NOT_FOUND
DIRECT_COPY_WITHOUT_GLOBAL_REMAP = UNSAFE
PART_A_THEME_VS_PART_B_THEME = REPORTED IDENTICAL / MUST GET EXACT HASH IN R1
NEXT_ARCHITECTURE_DIRECTION = POST_RENDER COMPOSITION LAYER / CANDIDATE
```

Frozen structural authorities remain:
- Part A owner workbook: one main business sheet `MBO Staff & Chief`; formula inventory zero; relationships/media preserved by closed preparer.
- Part B owner workbook: main `(Part B) Competency` + auxiliary `Sheet1`; exactly one Print_Area bound to localSheetId 0; auxiliary has no Print_Area; formula inventory zero; auxiliary fingerprint preserved by closed preparer.

## 4. Why PRE1 is NOT CLOSED

PRE1 contract required deterministic, source-backed package dependency evidence. The submitted document is directionally correct but incomplete and contains one concrete internal contradiction in the proposed future relationship IDs.

### Blocker A — PRE1-B package inventory is incomplete

The evidence does not yet provide the complete exact inventories required for composition review:
- full SHA-256 fingerprints are truncated for `styles.xml` and `sharedStrings.xml`;
- exact style table authority is incomplete: `numFmts`, `cellStyleXfs`, `cellStyles` and other present top-level style collections/dependencies are not inventoried;
- exact referenced style-ID SET for Part A main sheet is missing;
- Part B style use is asserted as `0..141` but not emitted as a source-derived exact set/fingerprint;
- exact shared-string index SET used by each main business sheet is missing;
- exact worksheet `.rels` relationship tuple inventory for both main sheets is missing;
- explicit presence/absence inventory for comments, tables, hyperlinks, externalLinks, charts/drawings and other sheet-local package dependencies is incomplete;
- exact full hash proof for the reportedly identical theme is missing.

### Blocker B — PRE1-C auxiliary-sheet absence proof is not exhaustive enough

`AUXILIARY_NOT_REQUIRED_FOR_COMBINED` is plausible but not yet frozen.

R1 must explicitly prove no dependency from Part B main sheet/workbook/package to auxiliary `Sheet1` through:
- formulas;
- defined names;
- worksheet/workbook/package relationships;
- data validation/reference expressions;
- hyperlinks;
- tables;
- drawings/charts;
- external references/links;
- literal sheet-name / `sheet2.xml` references in relevant OOXML parts.

### Blocker C — direct-copy verdict needs exact collision proof

`DIRECT_COPY_UNSAFE_REMAP_REQUIRED` is accepted directionally, but R1 must record source-derived exact proof for the collision classes, including at least:
- exact used style-ID sets for both main sheets plus representative same-ID/different-definition collisions;
- exact used shared-string index sets plus representative same-index/different-string collisions;
- exact Part B worksheet/drawing/media relationship tuples that would collide if copied naively.

### Blocker D — proposed `rId2` for the new sheet conflicts with PRE1's own inventory

PRE1 states Part A `xl/_rels/workbook.xml.rels` is:
```text
rId1 -> sheet1.xml
rId2 -> styles.xml
rId3 -> sharedStrings.xml
rId4 -> theme1.xml
```

But its recommendation later proposes:
```xml
<sheet name="(Part B) Competency" sheetId="2" r:id="rId2"/>
```

That cannot be used without also remapping an existing Part A relationship. The future composer must allocate a NEW UNIQUE workbook relationship ID (for this authority it would normally be the next unused ID, but implementation must derive it rather than hard-code assumptions).

### Blocker E — style/drawing remap dependency graph is underspecified

A safe strategy cannot describe style remap as merely appending `cellXfs` plus fonts/fills/borders. R1 must identify the exact referenced dependency graph from Part B `cellXfs`, including all actually used custom number formats and `xfId`/cellStyleXfs dependencies where present.

Similarly Part A and Part B both use `xl/drawings/drawing1.xml`; a combined package cannot retain both under the same part name. R1 must explicitly identify the need for a unique Part B drawing part name and corresponding worksheet relationship/content-type handling, plus unique media target naming where collision exists.

## 5. Exact next proposal — D2-WP004-R2-D-PRE1-R1

```text
WORK_PACKAGE = D2-WP004-R2-D-PRE1-R1
NAME = COMBINED XLSX EXACT PACKAGE-DEPENDENCY + RELATIONSHIP-ID CORRECTIVE EVIDENCE
STATE = PROPOSED / NOT AUTHORIZED
MODE = EVIDENCE-ONLY / READ-ONLY OWNER-TEMPLATE INSPECTION / ULTRA-LOW-CREDIT
MAX_EXECUTOR_COMMITS = 1
WRITABLE_FILE = project-docs/phase-3/evidence/XLSX_COMBINED_WORKBOOK_COMPOSITION_EVIDENCE.md
```

No source/test/Profile/template binary/control-doc changes are authorized for executor.

### R1-A — complete exact package inventories

For exact frozen Part A and Part B owner templates, append/correct evidence with:
- full SHA-256 for `[Content_Types].xml`, workbook.xml, workbook.xml.rels, styles.xml, sharedStrings.xml (if present), theme files, main sheet XML, main sheet `.rels`, drawing XML/rels and relevant package relationship files;
- exact top-level styles table counts/presence including at least numFmts, fonts, fills, borders, cellStyleXfs, cellXfs, cellStyles, dxfs/tableStyles/colors/extLst where present;
- exact source-derived used style-ID set for each main sheet;
- exact source-derived used shared-string index set for each main sheet;
- exact main-sheet relationship tuples `(Id, Type, Target, TargetMode)`;
- explicit NONE/presence inventory for comments, tables, hyperlinks, externalLinks, drawings/charts and other package dependencies.

### R1-B — exhaustive auxiliary dependency proof

Perform deterministic read-only scans of all relevant workbook/worksheet/rels/defined-name/data-validation/external-link parts for `Sheet1`, `sheet2.xml` and cross-sheet references.

Choose exactly one final auxiliary verdict:
- `AUXILIARY_NOT_REQUIRED_FOR_COMBINED`
- `AUXILIARY_REQUIRED_FOR_MAIN_SHEET`
- `AUXILIARY_DEPENDENCY_UNRESOLVED`

### R1-C — exact direct-copy collision proof

Provide exact representative collisions for:
- style IDs;
- shared-string indices;
- drawing/media relationship/part names.

Retain or correct exactly one direct-copy verdict.

### R1-D — correct strategy dependency map only; no implementation

If `POST_RENDER_OOXML_COMPOSITION_WITH_EXACT_REMAP` remains selected, correct the future design so it explicitly requires:
- unique new workbook `rId` for Part B sheet, derived from current package rather than hard-coded to `rId2`;
- unique new worksheet part (`sheet2.xml` only if available/appropriate);
- unique drawing part name because Part A already owns `drawing1.xml`;
- unique media names/targets where collisions exist;
- recursive style dependency remap for every Part B style actually referenced (cellXfs -> numFmt/font/fill/border/xfId dependencies as applicable);
- shared-string remap for every Part B shared-string index actually referenced;
- correct workbook defined-name/localSheetId handling for two Print_Areas;
- exact `[Content_Types].xml` and relationship updates;
- preserve Part A package as the base authority unless evidence proves another safer base.

Do NOT implement the composer.

## 6. PRE1-R1 closure rule

PRE1 may close only after independent review proves:
```text
OWNER_COMBINED_TEMPLATE = deterministic
PART_B_AUXILIARY = deterministic and exhaustive
DIRECT_COPY = deterministic with exact collision proof
GLOBAL_REMAP_DEPENDENCIES = exact enough to write a bounded implementation contract
NEXT_STRATEGY = exactly one, internally consistent
```

PRE1/PRE1-R1 closure will still NOT authorize production Combined XLSX implementation.

## 7. Stop boundary

Antigravity is stopped. PRE1-R1 is NOT authorized until the Owner explicitly approves it.

Combined XLSX source/test implementation, Kintone writes, deploy, Live UAT, PDF and D3 remain forbidden.

Recommended approval phrase:

`อนุมัติ D2-WP004-R2-D-PRE1-R1 EVIDENCE-ONLY ตามขอบเขตที่เสนอ`
