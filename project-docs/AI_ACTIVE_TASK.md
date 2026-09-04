# AI ACTIVE TASK — R2-C PASS / CLOSED / R2-D-PRE1 COMBINED XLSX EVIDENCE PROPOSAL READY

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

ACTIVE_WORK_PACKAGE = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE

ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
COMBINED_EXCEL_PARITY = PLANNING / PRE1 EVIDENCE PROPOSED / NOT AUTHORIZED
D3 = HOLD
```

## 2. Combined Excel deliverable authority

Repository export skill requires:

```text
COMBINED_WORKBOOK = ONE .xlsx
SHEET_1 = PART A
SHEET_2 = PART B
```

Current closed production engine renders Part A and Part B from separate owner templates. No production combined-XLSX composition/orchestration module exists in the current source tree.

Frozen source identities:

```text
PART_A_TEMPLATE_SHA256 = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B_TEMPLATE_SHA256 = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
PART_A_MAIN_SHEET = MBO Staff & Chief
PART_B_MAIN_SHEET = (Part B) Competency
PART_B_AUXILIARY_SHEET = Sheet1
```

The Part B auxiliary sheet is not automatically authorized to appear in the Combined Workbook. Target combined output remains exactly two business sheets unless evidence proves a different owner authority.

## 3. Why an evidence gate is required before implementation

A safe combined workbook cannot be inferred by simply copying `sheet1.xml` from one XLSX into another. XLSX package-level dependencies can be workbook-global, including:
- `xl/styles.xml` style IDs and cellXfs;
- `xl/sharedStrings.xml` indices;
- workbook sheet IDs and relationship IDs;
- `[Content_Types].xml` overrides;
- worksheet relationships, drawings/media/comments/tables/hyperlinks;
- themes, defined names, properties and other package relationships.

Both closed preparer and renderer intentionally preserve owner-template package authority. Combined composition must not invalidate that authority by guessing/remapping package-global identities without exact evidence.

Therefore implementation is NOT yet authorized.

## 4. Exact next proposal — D2-WP004-R2-D-PRE1

```text
PROPOSED_WORK_PACKAGE = D2-WP004-R2-D-PRE1
NAME = COMBINED XLSX OWNER-TEMPLATE + OOXML COMPOSITION COMPATIBILITY EVIDENCE
STATE = PROPOSED / NOT AUTHORIZED
MODE = EVIDENCE-ONLY / READ-ONLY OWNER-TEMPLATE INSPECTION / LOW-CREDIT
MAX_EXECUTOR_COMMITS = 1
EXPECTED_FILE = project-docs/phase-3/evidence/XLSX_COMBINED_WORKBOOK_COMPOSITION_EVIDENCE.md
```

If later authorized, writable scope is ONLY the expected evidence Markdown file. No source, tests, Profile, template binaries, package files, UI or dist are writable.

## 5. PRE1 exact evidence contract

### PRE1-A — exact local owner-template discovery

Read-only inspect the local repository/workspace locations already used for owner XLSX evidence, including `app info/data` and `exp` where present.

Record:
- all plausible MBO/PMS `.xlsx` candidate filenames and paths;
- SHA-256 of candidates;
- workbook sheet names/order/state;
- whether an owner/legacy Combined workbook already exists.

Do NOT copy/upload XLSX binaries into Git. Do NOT modify template files.

Require exact frozen identities for the known Part A and Part B owner templates. If the expected SHA cannot be found, report `BLOCKED_OWNER_TEMPLATE_IDENTITY` and STOP evidence conclusions.

### PRE1-B — exact package dependency inventory

For exact Part A and Part B owner workbooks, record read-only package inventories and fingerprints relevant to composition:
- `[Content_Types].xml`;
- `xl/workbook.xml` + `xl/_rels/workbook.xml.rels`;
- `xl/styles.xml` including key table counts/fingerprint;
- `xl/sharedStrings.xml` presence/count/fingerprint;
- `xl/theme/*`;
- main worksheet path + worksheet `.rels`;
- drawings/media/comments/tables/hyperlinks/external links if any;
- workbook defined names;
- package relationships/properties relevant to sheet insertion.

For each main business sheet, derive:
- referenced style-ID set;
- static shared-string index usage/count if applicable;
- sheet-local relationship IDs and targets;
- whether any dependency points to auxiliary sheets.

### PRE1-C — Part B auxiliary-sheet necessity

Prove whether `(Part B) Competency` depends on auxiliary `Sheet1` through formulas, defined names, relationships, external references, tables, charts, drawings or any other required package dependency.

Formula authority remains zero. Do not assume the auxiliary sheet is removable merely because formulas are zero.

Verdict must be one of:
- `AUXILIARY_NOT_REQUIRED_FOR_COMBINED`
- `AUXILIARY_REQUIRED_FOR_MAIN_SHEET`
- `AUXILIARY_DEPENDENCY_UNRESOLVED`

### PRE1-D — direct-copy compatibility verdict

Determine whether copying the rendered Part B main worksheet into the Part A workbook as Sheet 2 could preserve exact visual/layout semantics **without** remapping workbook-global dependencies.

Explicitly assess styles, shared strings, relationships, content types and theme authority.

Verdict must be one of:
- `DIRECT_COPY_SAFE_WITH_PROOF`
- `DIRECT_COPY_UNSAFE_REMAP_REQUIRED`
- `DIRECT_COPY_BLOCKED_UNRESOLVED`

No implementation may be performed.

### PRE1-E — composition strategy recommendation

Evidence must select exactly one next strategy:

1. `REUSE_EXISTING_OWNER_COMBINED_TEMPLATE`
   - only if an exact owner/legacy combined template is discovered and its authority is proven;

2. `POST_RENDER_OOXML_COMPOSITION_WITH_EXACT_REMAP`
   - Part A and Part B remain independently prepared/rendered through frozen engines, then a new bounded composition layer merges only the two business sheets and remaps proven workbook-global dependencies;

3. `COMPOSITION_BLOCKED_PENDING_NEW_OWNER_AUTHORITY`
   - if exact visual/package parity cannot be proven safely.

For the selected strategy, state the smallest future source/test file boundary but DO NOT implement it.

## 6. Mandatory non-goals

PRE1 must NOT:
- modify `src/services/mbo-xlsx-template-preparer.js`;
- modify `src/services/mbo-xlsx-semantic-renderer.js`;
- modify `src/services/mbo-export-service.js`;
- modify `src/profiles/mbo-xlsx-template-profile.js`;
- modify any existing test;
- generate or commit an XLSX binary;
- perform Kintone reads/writes beyond already available local evidence;
- deploy or build UI/dist;
- start PDF work;
- start D3.

## 7. Review/closure rule

After evidence is pushed, ChatGPT independently reviews the exact evidence against frozen package/template authorities.

PRE1 closes only if it gives a deterministic, source-backed answer for:
- whether an owner combined template exists;
- whether Part B auxiliary `Sheet1` is required;
- whether direct sheet copy is safe;
- exact global dependencies needing remap if direct copy is unsafe;
- one smallest future composition strategy.

PRE1 closure does NOT authorize Combined XLSX implementation.

## 8. Owner decision

No executor is active. This proposal is NOT authorized.

Recommended owner approval phrase:

`อนุมัติ D2-WP004-R2-D-PRE1 EVIDENCE-ONLY ตามขอบเขตที่เสนอ`

Combined Excel implementation, Kintone writes, deploy, Live UAT, PDF and D3 remain forbidden until separately authorized.
