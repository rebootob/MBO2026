# AI ACTIVE TASK — D2-WP003-R2 EXECUTION AUTHORIZED

Mode: **ANTIGRAVITY EXECUTION PLANE / PRIVACY-FIRST TRUE XLSX STRUCTURAL INSERTION / NO PDF / NO UI / NO KINTONE / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-01 ICT

```text
TASK_STATE = AUTHORIZED_FOR_EXECUTION
D1_OVERALL = PASS / CLOSED
D2_STATUS = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
ACTIVE_WORK_PACKAGE = D2-WP003-R2
ACTIVE_WORK_PACKAGE_NAME = SECOND PRIVACY PURGE + TRUE XLSX STRUCTURAL INSERTION CORRECTIVE
OWNER_APPROVAL = GRANTED 2026-09-01 ICT
OWNER_DIFFICULTY_DECISION = LEAVE BLANK TEMPORARILY
SECOND_PRIVACY_PURGE = CANONICAL BRANCH FORCE-RESET COMPLETE
R2_SAFE_BASELINE = a3953ff701a01c8af9dcf6bf2525a58e4888973e
EXECUTOR = ANTIGRAVITY
ANTIGRAVITY_MODE = LOW-CREDIT / BOUNDED
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R2-SOURCE-20260901-01
MAX_EXECUTOR_STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
```

## 1. Privacy containment already completed by ChatGPT

The Owner explicitly approved `D2-WP003-R2` with a second Privacy Purge.

ChatGPT force-reset the canonical branch to the clean R1 authorization baseline before opening R2. The reviewed R1 implementation and its generated binaries are no longer in the canonical branch tree/history lineage.

Rules:
- do not create a backup branch/tag/ref to any purged lineage;
- do not fetch/reuse any previously generated `*_SANITIZED.xlsx` binary;
- do not record purged commit/blob identifiers in repository docs;
- rebuild only from exact accepted owner-template inputs;
- Git hosting may retain unreachable objects/caches until provider garbage collection; do not create new refs to them.

## 2. Accepted owner-template identity — fail closed

Only use local originals whose SHA-256 exactly matches:

```text
PART_A_SHA256 = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B_SHA256 = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
```

Bounded lookup only in repository root, `app info/data/`, and `exp/`.

Expected source names:
- `PMS_Staff & Chief_PART_A.xlsx`
- `PMS_Staff & Chief_PART_B.xlsx`

If exact inputs are unavailable: STOP `BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE`.
Original employee-bearing workbooks are evidence only and must never be committed.

## 3. Read order — low credit

Fresh-fetch/reset local branch first, then read only:
1. `project-docs/AI_CONTROL_CENTER.md`
2. `project-docs/AI_ACTIVE_TASK.md`
3. `project-docs/EXCEL_EXPORT.md`
4. `project-docs/CONFIRMED_BASELINE/EVALUATION_CLASSES.md`
5. `src/services/mbo-export-service.js` — READ ONLY
6. `package.json`
7. `package-lock.json`
8. exact local source templates after SHA verification
9. only directly required imported helpers when a focused test fails

No whole-repo scan.

## 4. Exact authorized R2 file scope

Allowed implementation paths only:
- `scripts/export/sanitize-mbo-xlsx-templates.js` — NEW
- `src/services/mbo-xlsx-renderer.js` — NEW
- `tests/mbo-xlsx-renderer.test.js` — NEW
- `assets/export-templates/PMS_PART_A_SANITIZED.xlsx` — NEW only after privacy proof passes
- `assets/export-templates/PMS_PART_B_SANITIZED.xlsx` — NEW only after privacy proof passes
- `package.json` — only `xlsx-populate@1.21.0`
- `package-lock.json` — dependency consequence only

Explicitly NOT authorized in R2:
- `src/core/kintone-normalizer.js`
- `src/services/mbo-export-service.js`
- `tests/mbo-export-service.test.js`
- any Difficulty field/projection change
- any second spreadsheet/XML package

No other source/test/assets are authorized.

## 5. Owner decision — Difficulty Level blank in WP003

The legacy Part A form contains Difficulty Level (`AA:AB`) but no canonical current source field is proven.

Owner decision for R2:
```text
DIFFICULTY_LEVEL_EXPORT = BLANK TEMPORARILY
```

Therefore:
- do not invent/read `Difficulty_*` or any guessed App794 field;
- do not modify normalizer/export projection;
- sanitized template must clear any legacy sample Difficulty value;
- renderer must leave Difficulty output cells blank;
- tests must assert Difficulty cells remain blank for generated Part A output.

A future field implementation requires a separately approved Work Package after canonical schema evidence exists.

## 6. Dependency / no-op parity gate

Exactly one runtime dependency is authorized:
```text
xlsx-populate = 1.21.0
```

Install it only after fresh reset. Before mappings, run a no-op load/write proof on both exact source workbooks.

Must preserve materially:
- sheet names/order;
- Part A `A1:BJ52`, A3 landscape, scale 58%;
- Part B `A1:X35`, A4 portrait, scale 75%, horizontal centering;
- main-sheet merge counts Part A 193 / Part B 79;
- key row heights/column widths;
- Part B protection state;
- required user-facing branding/image relationships;
- workbook reparses successfully.

If material drift occurs: STOP `BLOCKER_XLSX_LIBRARY_PARITY`. Do not switch libraries.

Run `npm audit --omit=dev`; HIGH/CRITICAL attributable to the new dependency is a blocker.

## 7. Privacy-first sanitizer contract — no heuristic-only proof

The prior approach based mainly on `sharedStrings.xml` heuristics is forbidden as the sole proof.

Required privacy proof is range-driven + OOXML-wide:
1. derive the actual sensitive value cells/ranges from the accepted source structure; preserve label cells;
2. collect source values from those sensitive ranges at runtime, including text, numeric and date values, without logging/committing them;
3. clear the complete sensitive ranges for employee identity/org/start date/Hoshin/objective/action/result/self evaluation/appraiser evaluation/signature/score/sample business data;
4. clear all legacy sample Difficulty values;
5. remove the identified non-user-facing historical/reference drawing/image and its relationships/media target while preserving approved user-facing branding;
6. re-open the generated workbook and prove all designated sensitive ranges are empty regardless of cell value type;
7. inspect all XML/text OOXML parts and prove extracted sensitive text values do not survive;
8. verify expected drawing/image relationships after removal so the reference screenshot is absent and approved branding remains;
9. assert no worksheet scoring formulas are introduced;
10. only after all privacy checks pass may sanitized binaries be committed.

Do not print real source-sensitive values in logs, tests, docs or commit messages.

## 8. Header/value mapping — labels must survive

Frozen evidence:
- Part A header labels are on row 6; dynamic employee/org/start-date values belong in corresponding row-7 value ranges.
- Part B header labels are on row 2; dynamic employee/org/position/name values belong in corresponding row-3 value ranges.

Tests must snapshot/assert representative label text before rendering and prove it remains unchanged afterward while dynamic values appear in the value row.

Do not write business values to row-6 Part A label anchors or row-2 Part B label anchors.

## 9. True Part A structural insertion — 4 / 5 / 10

Renderer contract:
```text
INPUT = sanitized template Buffer/ArrayBuffer + already-authorized secured projection
OUTPUT = XLSX Buffer/Uint8Array/ArrayBuffer
NO Kintone API
NO raw unrestricted App794 read
NO filesystem dependency inside renderer service
NO authorization widening
```

For 4 objectives:
- preserve rows 25–28 and lower section original positions.

For 5–10 objectives:
- **actually shift existing rows 29+ downward** by `extra = objectiveCount - 4` before writing new objective rows;
- create new objective rows immediately after row 28;
- clone full row-28 objective structure: style IDs, borders, alignment, merged ranges, row height, relevant data validation/format metadata if present;
- update every affected cell/range reference, merged-range reference, row number, dimension and print-area reference required for a valid workbook;
- lower review/summary/signature/overall sections must move by exactly +1 for 5 objectives and +6 for 10;
- summary/score anchors must move with those sections;
- extend print area bottom from 52 by the same inserted-row count;
- keep A3 landscape and existing horizontal geometry;
- never overwrite original lower-section rows and never truncate objectives.

Important implementation rule:
- `xlsx-populate` high-level style copying into an existing row is **not row insertion** and is forbidden.
- If high-level API has no true insert-row primitive, perform bounded OOXML-level row/reference surgery inside the XLSX package using the already authorized workbook package access; no second library is authorized.
- If true insertion cannot be proven without material drift: STOP `BLOCKER_TRUE_STRUCTURAL_INSERTION_UNSAFE`.

## 10. True Part B structural insertion — 6 / 8

For 6 competencies:
- preserve the six legacy blocks and totals/signatures at legacy positions.

For exactly 8 competencies:
- **actually shift totals/signatures beginning row 31 downward by 8 rows** before writing items 7 and 8;
- insert two complete 4-row repeated competency blocks before totals/signatures;
- clone block styles, borders, merged ranges, row heights and required metadata;
- update all affected OOXML row/cell/merge/dimension/print-area references;
- extend print area from row 35 to row 43;
- preserve A4 portrait, horizontal centering and protection behavior;
- dynamic current Part B weight must come from secured projection; stale static 30% must not survive.

If true block insertion cannot be proven safely: STOP `BLOCKER_TRUE_STRUCTURAL_INSERTION_UNSAFE`.

## 11. Mandatory tests / evidence

`tests/mbo-xlsx-renderer.test.js` must prove at least:
- exact source SHA checks pass;
- no-op parity gate passes;
- sanitized template sheet names and print geometry;
- designated sensitive source ranges are empty after sanitization for text/numeric/date cell types;
- extracted sensitive text absent from all XML/text parts;
- non-user-facing reference image removed; approved branding retained;
- header labels preserved; dynamic header values written to value rows;
- Difficulty cells blank;
- Part A 4: lower section stays at row 29;
- Part A 5: old row-29 lower-section sentinel/content/structure moves to row 30, new objective occupies row 29, print area ends row 53;
- Part A 10: old row-29 lower section moves to row 35, objective 10 occupies row 34, print area ends row 58;
- Part A inserted rows retain representative row-28 style/merge/height properties;
- Part B 6: totals begin row 31;
- Part B 8: test input contains **exactly eight items**, old totals row 31 moves to row 39, items 7/8 occupy inserted blocks, print area ends row 43;
- Part B inserted blocks retain representative style/merge/height properties;
- Assistant Manager current weighting remains 60/40 and stale 30% is absent;
- A3 landscape / A4 portrait / Part B protection remain valid;
- zero worksheet scoring formulas introduced;
- Employee-Self output cannot gain manager/GM/appraiser confidential data;
- malformed template/projection fails closed.

Run at minimum:
```text
node --test tests/mbo-export-service.test.js
node --test tests/mbo-xlsx-renderer.test.js
node --test tests/core-794-795-796-integration.test.js
npm audit --omit=dev
git status --porcelain
```

## 12. Explicitly forbidden

Do NOT:
- create refs/tags/backups to purged history;
- reuse prior generated sanitized binaries;
- commit original owner workbooks or extracted real sample values;
- change Difficulty/normalizer/export-service;
- implement PDF;
- add UI/download buttons;
- modify `src/main-mbo-app.js`;
- access/read/write/export Live Kintone;
- deploy;
- add a second spreadsheet/XML dependency;
- start D2-WP004 or D3–D6.

## 13. Git / completion contract

Because remote history was rewritten again:
1. first run `git status --porcelain`;
2. if not clean, STOP and report — do not stash/preserve old WP003 files;
3. if clean: `git fetch --prune origin` then hard-reset local canonical branch to origin;
4. confirm local HEAD equals remote HEAD before work.

Smallest implementation possible. Push only after privacy + structural tests pass.
Final executor status must be `IMPLEMENTED_PENDING_INDEPENDENT_REVIEW` or a real blocker. Antigravity must not declare PASS/CLOSED.

Final executor report <=18 concise lines and include:
- implementation commit SHA(s);
- exact changed filenames;
- source SHA verification;
- no-op parity;
- privacy proof summary without sensitive values;
- true 4/5/10 and true 6/8 structural test results;
- Difficulty blank confirmation;
- `npm audit --omit=dev` result;
- original/purged binaries not reused/referenced;
- no PDF/UI/Kintone/deploy;
- final status.

## 14. Authorization ledger

```text
D2-WP001-SOURCE-20260901-01 = CONSUMED / CLOSED / DO NOT REUSE
D2-WP001-R1-SOURCE-20260901-01 = CONSUMED / CLOSED / DO NOT REUSE
D2-WP002 = APPROVED / READ-ONLY / CLOSED
D2-WP003-SOURCE-20260901-01 = CONSUMED / INVALIDATED / DO NOT REUSE
D2-WP003-R1-SOURCE-20260901-01 = CONSUMED / INVALIDATED / PURGED / DO NOT REUSE
D2-WP003-R2-SOURCE-20260901-01 = ACTIVE / ONE WORK PACKAGE ONLY
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R2-SOURCE-20260901-01
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

Authorization is consumed when R2 implementation is pushed for independent review or invalidated by any material scope/dependency change.