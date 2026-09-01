# AI ACTIVE TASK — D2-WP003-R3-R1 EXECUTION AUTHORIZED

Mode: **ANTIGRAVITY / CONTRACT-COMPLETE OOXML FEASIBILITY CORRECTIVE / NO BINARY PUBLISH / NO KINTONE / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-01 ICT

```text
TASK_STATE = AUTHORIZED_FOR_EXECUTION
D1_OVERALL = PASS / CLOSED
D2_STATUS = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3 = REVIEWED / NOT PASS / NOT CLOSED
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R1
ACTIVE_WORK_PACKAGE_NAME = CONTRACT-COMPLETE OOXML FEASIBILITY PROOF CORRECTIVE
OWNER_APPROVAL = GRANTED 2026-09-01 ICT
PRIVACY_PURGE_REQUIRED = NO
OWNER_DIFFICULTY_DECISION = LEAVE BLANK TEMPORARILY
EXECUTOR = ANTIGRAVITY
ANTIGRAVITY_MODE = LOW-CREDIT / BOUNDED
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R1-SOURCE-20260901-01
MAX_EXECUTOR_STATUS = FEASIBILITY_PROOF_PENDING_INDEPENDENT_REVIEW
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
```

## 1. Purpose

Correct the existing R3 feasibility proof only. Do not build the production sanitizer/renderer and do not publish any workbook/image/binary output.

R3-R1 must objectively prove that the accepted legacy templates can be handled safely before any later production Work Package is authorized.

## 2. Exact source scope

Authorized modifications ONLY:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

Read-only:
- `package.json`
- `package-lock.json`
- exact ignored owner templates after SHA verification
- governance docs listed below

`xlsx-populate@1.21.0` is already present and pinned. Package/dependency changes are NOT authorized in R3-R1. If a dependency correction is genuinely required, STOP and request a new authorization.

No other file may change.

## 3. Exact owner-template identity

Only local originals with exact SHA-256 may be used:

```text
PART_A_SHA256 = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B_SHA256 = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
```

Bounded lookup only in repository root, `app info/data/`, and `exp/`.
If unavailable: STOP `BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE`.

Never log, print, commit or include source employee/sample values in errors.

## 4. Low-credit read order

Fresh-fetch current canonical branch first, then read only:
1. `project-docs/AI_CONTROL_CENTER.md`
2. `project-docs/AI_ACTIVE_TASK.md`
3. `project-docs/EXCEL_EXPORT.md`
4. `scripts/export/mbo-xlsx-ooxml-feasibility.js`
5. `tests/mbo-xlsx-ooxml-feasibility.test.js`
6. `package.json`
7. exact owner templates after SHA verification

No whole-repo scan.

## 5. No-binary rule

R3-R1 must NOT commit or publish:
- `.xlsx`, `.xls`, `.xlsm`, `.zip`;
- images/media extracted from workbooks;
- disposable outputs;
- `assets/export-templates/**`.

Disposable workbook buffers may exist only in memory or ignored temporary local paths and must not appear in Git diff.

## 6. Mandatory proof architecture

Tests must inspect the mutated disposable workbook/OOXML directly. Acceptance MUST NOT rely on:
- helper-returned `pass: true` booleans;
- unconditional assertions such as `assert.ok(true)`;
- sentinel movement alone;
- a helper claiming a property without the test measuring that property.

Helpers may return buffers and non-sensitive structural metadata. The test must independently inspect the resulting package and assert the required structure.

Any unresolved evidence must fail closed with the documented blocker.

## 7. Material no-op parity proof

For BOTH exact source workbooks:
1. load -> output -> reparse with `xlsx-populate@1.21.0`;
2. independently compare before/after material structure.

Must prove at minimum:
- sheet names AND order unchanged;
- Part A print area `A1:BJ52`;
- Part A A3 / landscape / scale 58%;
- Part B print area `A1:X35`;
- Part B A4 / portrait / scale 75% / horizontal centering;
- Part A main-sheet merge count = 193;
- Part B main-sheet merge count = 79;
- representative row heights and column widths unchanged;
- Part B protection presence/state unchanged;
- drawing/image relationship counts and approved-branding relationship inventory unchanged;
- workbook reparses successfully.

Use OOXML/package attributes where high-level APIs are insufficient.

Failure => `BLOCKER_XLSX_LIBRARY_PARITY`.

## 8. Header label/value map proof

Frozen evidence:
- Part A row 6 = labels; runtime values belong in corresponding row-7 value ranges.
- Part B row 2 = labels; runtime values belong in corresponding row-3 value ranges.

R3-R1 must derive/prove exact value-range addresses from workbook structure without logging values.

On disposable copies:
- snapshot representative label cell/range addresses plus non-sensitive hash/fingerprint of label content;
- mutate/clear ONLY the proven Part A row-7 value ranges;
- mutate/clear ONLY the proven Part B row-3 value ranges;
- reparse;
- prove label fingerprints are unchanged;
- prove only the intended value ranges changed.

Do NOT clear row-6 Part A labels or row-2 Part B labels.

If exact value ranges cannot be proved: STOP `BLOCKER_HEADER_VALUE_MAP_UNRESOLVED`.

## 9. Range-driven privacy proof

Do NOT derive the sensitive set from `sharedStrings.xml` heuristics.

Define/derive an explicit bounded sensitive cell/range map from the accepted workbook structure covering at minimum:
- employee identity/name/code;
- department/section/position/start date;
- Hoshin/sample plan/business text;
- objective/action/target/result fields;
- self evaluation;
- manager/GM/appraiser evaluation fields;
- evaluator/signature/name areas;
- scores/grades/summary values;
- legacy Difficulty sample values.

Proof requirements:
1. collect designated source-cell values in memory by cell type (text/numeric/date) without logging them;
2. clear the complete designated ranges on a disposable copy while preserving labels/styles/merges;
3. output and reparse;
4. independently assert every designated sensitive cell/range is empty after reparse;
5. for collected text values, scan all OOXML XML/text parts in memory and assert those values do not survive;
6. error messages may include only safe addresses/part names/counts/hashes, never source values;
7. prove zero worksheet scoring formulas are introduced.

If the map is incomplete/ambiguous: STOP `BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED`.

## 10. Reference-image removal proof

Inventory drawings/media/relationships using non-sensitive metadata only: relationship id, anchor coordinates, media filename/hash, dimensions and relationship target.

R3-R1 must identify the non-user-facing historical/reference screenshot separately from approved branding.

On a disposable package actually:
- remove the target drawing anchor/object;
- remove its relationship;
- remove its media target if orphaned;
- update related OOXML/content-type entries when required;
- preserve approved branding relationship(s)/media;
- reparse successfully.

Tests must independently prove:
- target relationship/object is absent;
- target media is absent if orphaned;
- approved branding relationship(s) remain;
- workbook reparses.

If target cannot be distinguished safely: STOP `BLOCKER_REFERENCE_IMAGE_ID_UNRESOLVED`.

## 11. TRUE Part A OOXML insertion proof

Use bounded OOXML structural mutation, not value/style copying into already occupied rows.

Each scenario starts from a fresh disposable copy.

### 4 objectives
- no insertion;
- original lower-section row 29 remains row 29;
- original print area remains `A1:BJ52`.

### 5 objectives
- insert exactly one new objective row after row 28;
- shift all existing rows 29+ down by +1;
- old row-29 structural sentinel/content moves to row 30;
- print area becomes `A1:BJ53`.

### 10 objectives
- insert exactly six new objective rows after row 28;
- shift all existing rows 29+ down by +6;
- objective-row slot 10 is row 34;
- old row-29 structural sentinel/content moves to row 35;
- print area becomes `A1:BJ58`.

For inserted rows, clone the full relevant row-28 OOXML structure, including representative:
- row height;
- cell references;
- style IDs;
- merged ranges;
- border/alignment/number-format references embodied by styles;
- any applicable validation/reference metadata present in the source.

Update affected:
- row `r` attributes;
- cell `r` references;
- merged-range refs;
- worksheet dimension refs;
- print-area refs;
- other affected range refs that actually exist in the source package.

After reparse, tests must independently compare structure from the resulting OOXML. Preserve A3 landscape and scale 58%.

Failure => `BLOCKER_TRUE_STRUCTURAL_INSERTION_UNSAFE`.

## 12. TRUE Part B OOXML block insertion proof

Each scenario starts from a fresh disposable copy.

### 6 competencies
- no insertion;
- totals/signatures remain beginning row 31;
- print area remains `A1:X35`.

### 8 competencies
- insert two complete four-row competency blocks before row 31;
- use the final legacy competency block structure as the structural source only where proven appropriate;
- shift all existing rows 31+ down exactly +8;
- old row-31 structural sentinel/content moves to row 39;
- print area becomes `A1:X43`.

Update and prove row/cell refs, merge refs, dimension, print area and any other affected existing range references.

Inserted blocks must preserve representative source block:
- row heights;
- style IDs;
- merged ranges;
- border/alignment structure.

After reparse preserve:
- A4 portrait;
- scale 75%;
- horizontal centering;
- Part B protection state.

Failure => `BLOCKER_TRUE_STRUCTURAL_INSERTION_UNSAFE`.

## 13. Difficulty decision

```text
DIFFICULTY_LEVEL_EXPORT = BLANK TEMPORARILY
```

Do not read/invent any `Difficulty_*` application field. Do not modify normalizer/export-service.

Feasibility proof must directly inspect the disposable sanitized Part A structure and prove designated legacy Difficulty cells/ranges are blank after sanitization. No unconditional test is allowed.

## 14. Mandatory commands

Run:
```text
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

Before commit, Git diff/status must contain only the two authorized files. After commit/push, working tree must be clean.

No GitHub CI exists; local test evidence must be reported exactly and is subject to independent source review.

## 15. Explicitly forbidden

Do NOT:
- modify `package.json` or `package-lock.json`;
- create/publish workbook/image/binary output;
- create production sanitizer/renderer;
- modify `src/services/mbo-export-service.js`;
- modify `src/core/kintone-normalizer.js`;
- modify existing export tests;
- implement Difficulty fields;
- implement PDF/UI;
- access/read/write/export Live Kintone;
- deploy;
- add dependencies;
- start another Work Package.

## 16. Completion contract

Push only the smallest corrective proof changes in the two authorized files.

Final executor status must be exactly one of:
```text
FEASIBILITY_PROOF_PENDING_INDEPENDENT_REVIEW
BLOCKER_XLSX_LIBRARY_PARITY
BLOCKER_HEADER_VALUE_MAP_UNRESOLVED
BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED
BLOCKER_REFERENCE_IMAGE_ID_UNRESOLVED
BLOCKER_TRUE_STRUCTURAL_INSERTION_UNSAFE
```

Antigravity must not declare PASS/CLOSED.

Final report <=18 concise lines and include:
- implementation commit SHA;
- exact changed filenames;
- exact source SHA verification result;
- no-op parity result;
- header/value map result;
- privacy-range result;
- reference-image removal result;
- Part A 4/5/10 structural result;
- Part B 6/8 structural result;
- Difficulty blank result;
- test pass/fail counts;
- `npm audit --omit=dev` result;
- confirmation no binary/output/application/Kintone/deploy changes;
- final status.

## 17. Authorization ledger

```text
D2-WP001-SOURCE-20260901-01 = CONSUMED / CLOSED / DO NOT REUSE
D2-WP001-R1-SOURCE-20260901-01 = CONSUMED / CLOSED / DO NOT REUSE
D2-WP002 = APPROVED / READ-ONLY / CLOSED
D2-WP003-SOURCE-20260901-01 = CONSUMED / INVALIDATED / PURGED / DO NOT REUSE
D2-WP003-R1-SOURCE-20260901-01 = CONSUMED / INVALIDATED / PURGED / DO NOT REUSE
D2-WP003-R2-SOURCE-20260901-01 = CONSUMED / REVIEWED / PURGED / DO NOT REUSE
D2-WP003-R3-SOURCE-20260901-01 = CONSUMED / REVIEWED / DO NOT REUSE
D2-WP003-R3-R1-SOURCE-20260901-01 = ACTIVE / ONE WORK PACKAGE ONLY
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R1-SOURCE-20260901-01
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_APP794_DEPLOY_AUTH = NONE
APP53_WRITE = NO
APP794_WRITE = NO
APP795_WRITE = NO
APP801_WRITE = NO
ACL_PROCESS_WRITE = NO
KINTONE_CUSTOMIZATION_DEPLOY = NO
LIVE_UAT = NO
ROLLBACK = NO
```

Authorization is consumed when the R3-R1 proof commit is pushed for independent review or invalidated by any scope/dependency change.