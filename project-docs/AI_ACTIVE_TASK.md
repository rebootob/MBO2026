# AI ACTIVE TASK — D2-WP003-R3 EXECUTION AUTHORIZED

Mode: **ANTIGRAVITY / FEASIBILITY-FIRST OOXML PROOF / NO XLSX BINARY PUBLISH / NO KINTONE / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-01 ICT

```text
TASK_STATE = AUTHORIZED_FOR_EXECUTION
D1_OVERALL = PASS / CLOSED
D2_STATUS = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R2 = REVIEWED / NOT PASS / PURGED
ACTIVE_WORK_PACKAGE = D2-WP003-R3
ACTIVE_WORK_PACKAGE_NAME = THIRD PRIVACY PURGE + FEASIBILITY-FIRST OOXML STRUCTURE PROOF
OWNER_APPROVAL = GRANTED 2026-09-01 ICT
OWNER_DIFFICULTY_DECISION = LEAVE BLANK TEMPORARILY
THIRD_PRIVACY_PURGE = CANONICAL BRANCH FORCE-RESET COMPLETE
R3_SAFE_BASELINE = 22d8215287f0280fbbea668a275fee77b3801776
EXECUTOR = ANTIGRAVITY
ANTIGRAVITY_MODE = LOW-CREDIT / BOUNDED
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-SOURCE-20260901-01
MAX_EXECUTOR_STATUS = FEASIBILITY_PROOF_PENDING_INDEPENDENT_REVIEW
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
```

## 1. Why R3 is different

R2 repeated rejected production-style sanitizer/renderer logic and committed binaries before proving privacy/structure. R3 therefore **does not implement or publish the production renderer or sanitized assets**.

R3 exists only to prove, on exact ignored local owner workbooks and disposable local outputs, that:
1. `xlsx-populate@1.21.0` can round-trip the templates without material drift;
2. bounded OOXML manipulation can perform true Part A/Part B structural insertion;
3. exact header/value and privacy-sensitive ranges can be identified without overwriting labels;
4. the non-user-facing reference image can be identified and removed while approved branding survives;
5. Difficulty remains blank.

Only after independent R3 acceptance may a later package implement production sanitizer/renderer and publish sanitized binaries.

## 2. Privacy purge already completed

Owner explicitly approved R3 with Privacy Purge. ChatGPT force-reset canonical branch to the clean pre-R2-implementation authorization baseline.

Rules:
- do not create branch/tag/ref backups to purged lineages;
- do not fetch/reuse any prior generated `*_SANITIZED.xlsx`;
- do not record purged commit/blob identifiers in repository docs;
- do not commit any `.xlsx`, `.xls`, `.xlsm`, `.zip`, image extracted from owner workbooks, or disposable output in R3.

## 3. Exact owner-template identity

Only local originals with exact SHA-256 may be used:

```text
PART_A_SHA256 = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B_SHA256 = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
```

Bounded lookup only in repository root, `app info/data/`, and `exp/`.
If unavailable, STOP `BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE`.

Never print or commit source employee/sample values.

## 4. Low-credit read order

Fresh-fetch/reset first, then read only:
1. `project-docs/AI_CONTROL_CENTER.md`
2. `project-docs/AI_ACTIVE_TASK.md`
3. `project-docs/EXCEL_EXPORT.md`
4. `package.json`
5. `package-lock.json`
6. exact local owner templates after SHA verification

Do not scan the whole repository. Do not modify current application services.

## 5. Exact authorized R3 file scope

Allowed changes only:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js` — NEW
- `tests/mbo-xlsx-ooxml-feasibility.test.js` — NEW
- `package.json` — only add `xlsx-populate@1.21.0`
- `package-lock.json` — dependency consequence only

Everything else is forbidden in R3, including:
- `assets/export-templates/**`
- any `.xlsx` binary
- `scripts/export/sanitize-mbo-xlsx-templates.js`
- `src/services/mbo-xlsx-renderer.js`
- `src/core/kintone-normalizer.js`
- `src/services/mbo-export-service.js`
- existing export tests
- PDF/UI/Kintone/deploy code
- any second spreadsheet/XML library.

## 6. Dependency / no-op parity proof

Only `xlsx-populate@1.21.0` is authorized.

Before any OOXML mutation, prove no-op load/output/reparse materially preserves:
- sheet names/order;
- Part A print area `A1:BJ52`, A3 landscape, scale 58%;
- Part B print area `A1:X35`, A4 portrait, scale 75%, horizontal centering;
- Part A main-sheet merge count 193;
- Part B main-sheet merge count 79;
- representative row heights/column widths;
- Part B protection state;
- existing drawing/image relationship count and approved branding relationship(s);
- workbook reparse success.

If material drift occurs: STOP `BLOCKER_XLSX_LIBRARY_PARITY`.

Run `npm audit --omit=dev`; HIGH/CRITICAL attributable to this runtime dependency is a blocker.

## 7. Feasibility proof — header/value map

R3 must prove addresses, not publish sample values.

Frozen evidence:
- Part A header labels are on row 6; dynamic values belong in corresponding row-7 value ranges;
- Part B header labels are on row 2; dynamic values belong in corresponding row-3 value ranges.

The feasibility script may inspect local source values in memory, but output/logs may contain **addresses/types/counts only**, never source values.

Tests must prove representative label cells remain unchanged while a disposable copy can clear/replace the corresponding value-row ranges without touching labels.

If exact value ranges cannot be proven from the template structure, STOP `BLOCKER_HEADER_VALUE_MAP_UNRESOLVED`.

## 8. Feasibility proof — privacy map

R3 must define/derive a bounded sensitive-range map covering at minimum:
- employee identity;
- department/section/position/start-date;
- Hoshin/sample plan text;
- objective/action/target/result data;
- self/appraiser evaluation data;
- signatures/evaluator names;
- scores/grades;
- legacy Difficulty sample values.

Proof requirements on disposable local output:
1. collect values from designated source-sensitive ranges in memory, including text/numeric/date cell types, without logging them;
2. clear complete sensitive ranges while preserving labels/styles/merged geometry;
3. reparse and prove all designated sensitive ranges are empty;
4. scan all OOXML XML/text parts and prove collected sensitive text values do not survive;
5. no worksheet scoring formulas introduced.

If the range map is incomplete or ambiguous, STOP `BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED`.

## 9. Feasibility proof — reference image removal

Inventory workbook drawing/image relationships using only non-sensitive metadata such as relationship id, anchor coordinates, media filename/hash and dimensions. Do not extract/commit image bytes.

Identify the non-user-facing historical/reference screenshot by structural evidence and prove on a disposable copy that:
- its drawing relationship and media target are removed;
- approved user-facing branding/image relationship(s) remain;
- workbook reparses.

If the target cannot be distinguished safely from branding, STOP `BLOCKER_REFERENCE_IMAGE_ID_UNRESOLVED`.

## 10. Feasibility proof — TRUE Part A insertion

Do not use style-copying into occupied rows as proof.

Using bounded OOXML mutation inside the workbook package, prove on disposable copies:
- 4 objectives: legacy lower-section row 29 remains row 29;
- 5 objectives: existing rows 29+ shift by +1, new objective row is inserted at 29, old row-29 structural sentinel moves to row 30, print area becomes `A1:BJ53`;
- 10 objectives: existing rows 29+ shift by +6, objective row 10 is at row 34, old row-29 sentinel moves to row 35, print area becomes `A1:BJ58`;
- inserted rows clone representative row-28 style ids, merged ranges, border/alignment metadata and row height;
- affected row/cell references, merge references, dimension and print references are valid after reparse;
- A3 landscape/scale remain unchanged.

If this cannot be proven safely: STOP `BLOCKER_TRUE_STRUCTURAL_INSERTION_UNSAFE`.

## 11. Feasibility proof — TRUE Part B insertion

On disposable copies prove:
- six competencies: totals/signatures remain at row 31;
- eight competencies: existing rows 31+ shift by exactly +8;
- two complete four-row blocks are inserted before totals;
- old row-31 structural sentinel moves to row 39;
- print area becomes `A1:X43`;
- inserted block rows preserve representative style/merge/border/height metadata;
- A4 portrait, horizontal centering and protection remain unchanged;
- workbook reparses.

No business data renderer is required in R3; this is structural feasibility only.

## 12. Difficulty decision

```text
DIFFICULTY_LEVEL_EXPORT = BLANK TEMPORARILY
```

R3 must not read/invent any `Difficulty_*` field and must not modify application projection/normalizer. Privacy proof must demonstrate legacy sample Difficulty cells can be cleared in disposable output.

## 13. Required tests and evidence

`tests/mbo-xlsx-ooxml-feasibility.test.js` must cover all proofs above using exact local originals and disposable outputs outside tracked repository paths.

Run at minimum:
```text
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

After tests, `git status --porcelain` must contain only the four authorized source/dependency files before commit, and be clean after commit.

No generated XLSX/image/output may appear in Git diff.

## 14. Git / completion contract

Because branch history was rewritten again:
1. run `git status --porcelain`;
2. if non-clean, STOP and report exact paths — do not stash/preserve old WP003 files;
3. `git fetch --prune origin`;
4. checkout canonical branch and hard-reset to origin;
5. confirm local HEAD equals remote before work.

Push the smallest proof implementation only.

Final executor status:
```text
FEASIBILITY_PROOF_PENDING_INDEPENDENT_REVIEW
```

Do not declare PASS/CLOSED and do not start production sanitizer/renderer/binary publication.

Final report <=18 lines and include:
- proof commit SHA;
- exact changed files;
- source SHA verification;
- no-op parity result;
- header/value-map proof result;
- privacy-range proof result;
- reference-image identification/removal proof result;
- Part A 4/5/10 structural proof result;
- Part B 6/8 structural proof result;
- npm audit result;
- confirmation no binary/image/output committed;
- final status.

## 15. Authorization ledger

```text
D2-WP001-SOURCE-20260901-01 = CONSUMED / CLOSED / DO NOT REUSE
D2-WP001-R1-SOURCE-20260901-01 = CONSUMED / CLOSED / DO NOT REUSE
D2-WP002 = APPROVED / READ-ONLY / CLOSED
D2-WP003-SOURCE-20260901-01 = CONSUMED / INVALIDATED / PURGED / DO NOT REUSE
D2-WP003-R1-SOURCE-20260901-01 = CONSUMED / INVALIDATED / PURGED / DO NOT REUSE
D2-WP003-R2-SOURCE-20260901-01 = CONSUMED / REVIEWED / PURGED / DO NOT REUSE
D2-WP003-R3-SOURCE-20260901-01 = ACTIVE / ONE WORK PACKAGE ONLY
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-SOURCE-20260901-01
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

Authorization is consumed when the R3 proof commit is pushed for independent review or invalidated by scope/dependency change.