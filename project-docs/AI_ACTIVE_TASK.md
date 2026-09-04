# AI ACTIVE TASK — R2-D-PRE1-R1 COMBINED XLSX CORRECTIVE EVIDENCE AUTHORIZED

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
D2_WP004_R2_D_PRE1_R1 = AUTHORIZED / ACTIVE

ACTIVE_WORK_PACKAGE = D2-WP004-R2-D-PRE1-R1
ACTIVE_D2_EVIDENCE_AUTH = D2-WP004-R2-D-PRE1-R1-EVIDENCE-ONLY-20260904-01
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE

ANTIGRAVITY = AUTHORIZED / BOUNDED EVIDENCE ONLY / MAX 1 COMMIT
CLAUDE = STOP
COMBINED_EXCEL_PARITY = PRE1-R1 CORRECTIVE EVIDENCE AUTHORIZED / IMPLEMENTATION NOT AUTHORIZED
D3 = HOLD
```

## 2. Owner authorization

Owner explicitly authorized on 2026-09-04 ICT:

`อนุมัติ D2-WP004-R2-D-PRE1-R1 EVIDENCE-ONLY ตามขอบเขตที่เสนอ`

Single-use authorization token:

`D2-WP004-R2-D-PRE1-R1-EVIDENCE-ONLY-20260904-01`

This token authorizes exactly one bounded corrective evidence commit and is consumed when that evidence commit is pushed.

## 3. Reviewed PRE1 evidence

PRE1 authorization HEAD:
`40a300405e22c59096e6902f2bd2709ee9bd9098`

PRE1 evidence commit:
`a77cbf6317b5744e0b9a0d696ab293878563c89d`

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

## 4. Accepted / frozen findings from PRE1

The following findings are accepted and do not need to be rediscovered unless R1 finds contradictory exact evidence:

```text
PART_A_OWNER_SHA_FOUND = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B_OWNER_SHA_FOUND = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
OWNER_COMBINED_TEMPLATE_IN_AUTHORIZED_INSPECTION_LOCATIONS = NOT_FOUND
DIRECT_COPY_WITHOUT_GLOBAL_REMAP = UNSAFE / DIRECTION ACCEPTED
NEXT_ARCHITECTURE_DIRECTION = POST_RENDER COMPOSITION LAYER / CANDIDATE
```

Frozen structural authorities remain:
- Part A owner workbook: one main business sheet `MBO Staff & Chief`; formula inventory zero; relationships/media preserved by closed preparer.
- Part B owner workbook: main `(Part B) Competency` + auxiliary `Sheet1`; exactly one Print_Area bound to localSheetId 0; auxiliary has no Print_Area; formula inventory zero; auxiliary fingerprint preserved by closed preparer.

## 5. Why PRE1 is not closed

R1 is corrective evidence only. It must close the following specific proof gaps without implementing a composer.

### Blocker A — incomplete exact package inventory

Corrective evidence must provide:
- full SHA-256 fingerprints, not abbreviated hashes, for `[Content_Types].xml`, `xl/workbook.xml`, `xl/_rels/workbook.xml.rels`, `xl/styles.xml`, `xl/sharedStrings.xml` when present, theme files, both main worksheet XMLs, main worksheet `.rels`, drawing XML/rels and relevant package relationship files;
- exact top-level style-table counts/presence including `numFmts`, `fonts`, `fills`, `borders`, `cellStyleXfs`, `cellXfs`, `cellStyles`, `dxfs`, `tableStyles`, `colors`, `extLst` where present;
- exact source-derived used style-ID set for each main business sheet;
- exact source-derived used shared-string index set for each main business sheet;
- exact worksheet relationship tuples `(Id, Type, Target, TargetMode)`;
- explicit presence/absence inventory for comments, tables, hyperlinks, externalLinks, drawings/charts and other relevant package dependencies;
- exact full hash proof for the theme comparison.

### Blocker B — auxiliary-sheet absence proof must be exhaustive

Final auxiliary verdict must be source-backed across formulas, defined names, workbook/worksheet/package relationships, data validation/reference expressions, hyperlinks, tables, drawings/charts, external refs/links, and literal `Sheet1` / `sheet2.xml` references in relevant OOXML parts.

### Blocker C — exact direct-copy collision proof

R1 must record exact representative collisions for:
- style IDs: same used style ID, different actual definition/dependency graph;
- shared-string indices: same used index, different actual string payload;
- Part B worksheet/drawing/media relationship and part-name collisions.

### Blocker D — workbook relationship-ID contradiction

Part A currently uses:
```text
rId1 -> sheet1.xml
rId2 -> styles.xml
rId3 -> sharedStrings.xml
rId4 -> theme1.xml
```

The PRE1 recommendation incorrectly proposed the new Part B sheet as workbook `r:id="rId2"`.

R1 must correct the future strategy: allocate a NEW UNIQUE workbook relationship ID derived from the current package. Do not hard-code `rId2`.

### Blocker E — style/drawing dependency graph is underspecified

If post-render composition remains selected, R1 must identify the exact dependency graph required by the Part B styles actually used, including applicable `numFmtId`, `fontId`, `fillId`, `borderId`, `xfId` / `cellStyleXfs` dependencies and any other referenced style collection.

Part A and Part B both own `xl/drawings/drawing1.xml`; the future strategy must require a unique Part B drawing part name and corresponding worksheet relationship/content-type handling, plus collision-safe media target naming.

## 6. Authorized work package — D2-WP004-R2-D-PRE1-R1

```text
WORK_PACKAGE = D2-WP004-R2-D-PRE1-R1
NAME = COMBINED XLSX EXACT PACKAGE-DEPENDENCY + RELATIONSHIP-ID CORRECTIVE EVIDENCE
STATE = AUTHORIZED / ACTIVE
MODE = EVIDENCE-ONLY / READ-ONLY OWNER-TEMPLATE INSPECTION / ULTRA-LOW-CREDIT
MAX_EXECUTOR_COMMITS = 1
WRITABLE_FILE = project-docs/phase-3/evidence/XLSX_COMBINED_WORKBOOK_COMPOSITION_EVIDENCE.md
```

Writable scope is ONLY the existing evidence Markdown file above. No source, tests, Profile, template binaries, package files, UI, dist or control docs are writable by executor.

## 7. R1 exact corrective contract

### R1-A — complete exact package inventories

For exact frozen Part A and Part B owner templates, correct/append the evidence with:
- full SHA-256 for all package objects named in Blocker A;
- exact top-level styles inventory/counts;
- exact used style-ID sets for both main sheets;
- exact used shared-string index sets for both main sheets;
- exact main-sheet relationship tuples;
- exact drawing relationship tuples and targets;
- explicit NONE/presence inventory for comments, tables, hyperlinks, externalLinks, charts and other relevant dependencies.

### R1-B — exhaustive auxiliary dependency proof

Deterministically scan all relevant workbook/worksheet/rels/defined-name/data-validation/external-link parts for `Sheet1`, `sheet2.xml` and cross-sheet references.

Choose exactly one final verdict:
- `AUXILIARY_NOT_REQUIRED_FOR_COMBINED`
- `AUXILIARY_REQUIRED_FOR_MAIN_SHEET`
- `AUXILIARY_DEPENDENCY_UNRESOLVED`

### R1-C — exact direct-copy collision proof

Provide source-derived representative collision examples for styles, shared strings and drawing/media relationships/part names. Retain or correct exactly one direct-copy verdict:
- `DIRECT_COPY_SAFE_WITH_PROOF`
- `DIRECT_COPY_UNSAFE_REMAP_REQUIRED`
- `DIRECT_COPY_BLOCKED_UNRESOLVED`

### R1-D — correct future strategy dependency map only

If `POST_RENDER_OOXML_COMPOSITION_WITH_EXACT_REMAP` remains selected, the evidence must explicitly require:
- Part A package remains base authority unless evidence proves a safer base;
- a new unique workbook relationship ID for Part B main sheet, derived rather than hard-coded;
- a unique worksheet part path derived from available package paths;
- a unique Part B drawing part because Part A already owns `drawing1.xml`;
- unique media names/targets where collisions exist;
- recursive exact style remap for every Part B style actually referenced and all referenced style dependencies;
- shared-string remap for every Part B shared-string index actually referenced;
- two correct Print_Area defined names with correct `localSheetId` bindings after the auxiliary sheet is excluded if evidence permits exclusion;
- exact `[Content_Types].xml` and relationship updates;
- preservation of all non-target Part A package authority and all Part B main-sheet visual/layout authority.

Do NOT implement the composer.

## 8. Required evidence document result

Update ONLY:

`project-docs/phase-3/evidence/XLSX_COMBINED_WORKBOOK_COMPOSITION_EVIDENCE.md`

Final machine-readable summary must include at minimum:
```text
PRE1_R1_RESULT = PASS | BLOCKED
OWNER_COMBINED_TEMPLATE = NOT_FOUND | FOUND | UNRESOLVED
PART_B_AUXILIARY = AUXILIARY_NOT_REQUIRED_FOR_COMBINED | AUXILIARY_REQUIRED_FOR_MAIN_SHEET | AUXILIARY_DEPENDENCY_UNRESOLVED
DIRECT_COPY = DIRECT_COPY_SAFE_WITH_PROOF | DIRECT_COPY_UNSAFE_REMAP_REQUIRED | DIRECT_COPY_BLOCKED_UNRESOLVED
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

PRE1-R1 must NOT:
- modify any file under `src/`;
- modify any existing or new test;
- modify `src/profiles/mbo-xlsx-template-profile.js`;
- modify any owner XLSX/template binary;
- generate or commit an XLSX binary;
- modify `project-docs/AI_ACTIVE_TASK.md`, `D2_REVIEW_FAST_START.md` or any other control document;
- modify package.json/package-lock;
- perform Kintone reads/writes beyond already available local file evidence;
- deploy or build UI/dist;
- start Combined XLSX implementation;
- start PDF;
- start D3.

If any conclusion requires broader scope, STOP and report the blocker.

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

Create exactly one evidence commit and push canonical branch. Suggested message:

`docs: complete combined xlsx dependency evidence (R2-D-PRE1-R1)`

Then STOP. Do not self-authorize implementation or the next gate.

## 11. Closure rule

PRE1/PRE1-R1 may close only after independent ChatGPT review proves:
```text
OWNER_COMBINED_TEMPLATE = deterministic
PART_B_AUXILIARY = deterministic and exhaustive
DIRECT_COPY = deterministic with exact collision proof
GLOBAL_REMAP_DEPENDENCIES = exact enough to write a bounded implementation contract
NEXT_STRATEGY = exactly one and internally consistent
```

PRE1/PRE1-R1 closure still does NOT authorize production Combined XLSX implementation.

## 12. Stop boundary

Combined XLSX implementation, Kintone writes, deploy, Live UAT, PDF and D3 remain forbidden until separately authorized.
