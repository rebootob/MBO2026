# AI ACTIVE TASK — D2-WP003-R1 EXECUTION AUTHORIZED

Mode: **ANTIGRAVITY EXECUTION PLANE / PRIVACY-FIRST XLSX CORRECTIVE / NO PDF / NO UI / NO KINTONE / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-01 ICT

```text
TASK_STATE = AUTHORIZED_FOR_EXECUTION
D1_OVERALL = PASS / CLOSED
D2_STATUS = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
ACTIVE_WORK_PACKAGE = D2-WP003-R1
ACTIVE_WORK_PACKAGE_NAME = PRIVACY PURGE + SANITIZER + STRUCTURAL XLSX RENDERER CORRECTIVE
OWNER_APPROVAL = GRANTED 2026-09-01 ICT
PRIVACY_PURGE = CANONICAL BRANCH FORCE-RESET TO SAFE PRE-IMPLEMENTATION BASELINE COMPLETE
SAFE_BASELINE = 731ba80a976847e579d80fc30012df54fd36badf
EXECUTOR = ANTIGRAVITY
ANTIGRAVITY_MODE = LOW-CREDIT / BOUNDED
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R1-SOURCE-20260901-01
MAX_EXECUTOR_STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
```

## 1. Privacy containment already completed by ChatGPT

The Owner explicitly approved `D2-WP003-R1` with Privacy Purge.

ChatGPT force-reset the canonical branch back to the safe pre-implementation authorization baseline before opening R1. The unsafe WP003 implementation and its binary assets are therefore no longer in the canonical branch tree/history lineage.

Rules:
- do not recreate a backup ref/branch/tag to the purged lineage;
- do not fetch, cite, publish or record the purged commit/blob identifiers in Git docs;
- do not reuse any prior generated `*_SANITIZED.xlsx` file;
- rebuild sanitized assets only from the exact accepted local owner-template inputs below.

Git hosting may retain unreachable objects/caches until provider garbage collection. R1 must not create new refs to them.

## 2. Accepted owner-template identity — fail closed

Only use local originals whose SHA-256 exactly matches:

```text
PART_A_SHA256 = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B_SHA256 = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
```

Bounded lookup only in:
- repository root;
- `app info/data/`;
- `exp/`.

Expected source names:
- `PMS_Staff & Chief_PART_A.xlsx`
- `PMS_Staff & Chief_PART_B.xlsx`

If exact matching originals are unavailable, STOP with `BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE`.

Original employee-bearing workbooks remain gitignored input evidence and must never be committed.

## 3. Read order — low credit

Fresh-fetch HEAD, then read only:
1. `project-docs/AI_CONTROL_CENTER.md`
2. `project-docs/AI_ACTIVE_TASK.md`
3. `project-docs/EXCEL_EXPORT.md`
4. `project-docs/CONFIRMED_BASELINE/EVALUATION_CLASSES.md`
5. `project-docs/FIELD_DICTIONARY.md`
6. `src/services/mbo-export-service.js`
7. `src/core/kintone-normalizer.js`
8. `package.json`
9. `package-lock.json`
10. exact local source templates after SHA verification
11. only directly imported helpers required by a failing focused test

No whole-repo scan.

## 4. Exact authorized R1 file scope

Allowed implementation paths only:
- `scripts/export/sanitize-mbo-xlsx-templates.js` — NEW
- `src/services/mbo-xlsx-renderer.js` — NEW
- `tests/mbo-xlsx-renderer.test.js` — NEW
- `assets/export-templates/PMS_PART_A_SANITIZED.xlsx` — NEW, only after privacy proof passes
- `assets/export-templates/PMS_PART_B_SANITIZED.xlsx` — NEW, only after privacy proof passes
- `package.json` — only `xlsx-populate@1.21.0`
- `package-lock.json` — dependency consequence only
- `src/core/kintone-normalizer.js` — only if a canonical App794 Difficulty field is proven and exact projection support is required
- `src/services/mbo-export-service.js` — only for the same narrowly proven Difficulty projection support
- `tests/mbo-export-service.test.js` — only for that Difficulty projection/security regression

No other source/test/assets are authorized.

## 5. Dependency gate — no-op parity first

Exactly one new runtime dependency remains authorized:

```text
xlsx-populate = 1.21.0
```

Before sanitizer/renderer mappings, install it and perform a no-op load/write round-trip on both exact source workbooks.

Proof must validate at minimum:
- user-facing sheet names/order;
- Part A print area `A1:BJ52`, A3 landscape, scale 58%;
- Part B print area `A1:X35`, A4 portrait, scale 75%, horizontal centering;
- main-sheet merge counts Part A 193 / Part B 79;
- key row heights and column widths used by the frozen contract;
- Part B protection state;
- approved branding/image relationships needed by the user-facing form;
- workbook reparses successfully.

If material drift occurs, revert dependency experiment and STOP with `BLOCKER_XLSX_LIBRARY_PARITY`. Do not switch libraries.

Run `npm audit --omit=dev`. HIGH/CRITICAL findings attributable to the new runtime dependency are a blocker.

## 6. Privacy-first sanitizer contract

Do not sanitize by guessing isolated anchor cells.

Required approach:
1. derive actual value cells/ranges from the accepted template structure, preserving label cells;
2. clear all sample employee identity/org/date/Hoshin/objective/result/evaluator/signature/score values across the complete applicable merged ranges;
3. remove the non-user-facing historical/reference screenshot/drawing while retaining approved user-facing branding;
4. extract non-empty sensitive/sample text values from the ignored originals at runtime without committing those values;
5. unzip/inspect **all XML/text parts** of each generated sanitized OOXML package and assert those extracted sensitive values are absent;
6. assert generated sanitized assets contain no worksheet formulas introduced by sanitization;
7. only after these checks pass may the sanitized binaries be committed.

Tests/docs must never hardcode real employee names, IDs, dates, evaluator names/comments or other source sample values.

## 7. Correct header/value anchors

Preserve labels and write current values into the value row/ranges.

At minimum verify from the owner templates before coding:
- Part A labels are in row 6 while employee/org/start-date values are in the corresponding row-7 value ranges;
- Part B labels are in row 2 while employee/org/position/name values are in the corresponding row-3 value ranges.

Tests must prove label text survives and current values replace sample values in the correct value cells.

## 8. Part A structural renderer — real 4/5/10 behavior

Renderer input/output contract:

```text
INPUT = sanitized template Buffer/ArrayBuffer + already-authorized secured projection
OUTPUT = XLSX Buffer/Uint8Array/ArrayBuffer
NO Kintone API
NO unrestricted raw App794 read
NO filesystem dependency inside renderer service
NO authorization widening
```

For 4 objectives:
- preserve legacy objective rows 25–28;
- keep lower sections at their legacy positions;
- map values only into designated value ranges.

For 5–10 objectives:
- insert actual rows immediately after row 28;
- clone the complete row-28 objective block structure: merges, styles, borders, alignments, row height and relevant dimensions;
- shift review/comment/summary/signature/overall sections downward by the inserted row count;
- move score/summary anchors with the shifted sections; no hardcoded collision at legacy row 29;
- extend print-area bottom by inserted rows;
- keep A3 landscape and legacy horizontal geometry/scale behavior;
- render all objectives with no truncation.

Tests must prove positions before/after insertion, not merely that text appears in later cells.

## 9. Part B structural renderer — real 6/8 behavior

For 6 competencies:
- preserve the six legacy repeated blocks and totals/signatures at legacy positions.

For 8 competencies:
- insert two complete repeated competency blocks before totals/signatures;
- clone block merges/styles/borders/row heights/layout;
- shift totals/signatures downward;
- extend print-area bottom;
- preserve A4 portrait, horizontal centering and protection behavior;
- render dynamic current profile title and Part B weighting from secured projection/configuration, not stale static sample text.

The 8-item test must supply exactly eight items and prove both added blocks and shifted totals.

## 10. Difficulty Level projection gap — fail closed

The frozen Part A layout includes Difficulty Level (`AA:AB`), but current repository search/FIELD_DICTIONARY does not prove a canonical Difficulty field.

Rules:
- do not invent a Kintone field code;
- do not let renderer read raw App794 directly;
- inspect only the directly relevant App794 field/config evidence available in the bounded workspace;
- if a canonical current field is proven, add only the narrow normalizer/export projection field plus security regression tests;
- if no canonical field can be proven, STOP and report `BLOCKER_DIFFICULTY_SOURCE_UNRESOLVED` rather than guessing.

## 11. Mandatory tests/evidence

`tests/mbo-xlsx-renderer.test.js` must cover at least:
- sanitized template sheet names and baseline print geometry;
- extraction-based proof that source sensitive/sample text does not survive any sanitized OOXML XML/text part;
- user-facing branding retained and non-user-facing reference screenshot removed;
- Part A 4 objective structural parity;
- Part A 5 objective: one inserted/cloned row block, lower sections shifted by 1, print area extended, summary shifted;
- Part A 10 objective: six inserted/cloned row blocks, lower sections shifted by 6, print area extended, all 10 rendered;
- Part B 6 competency structural parity;
- Part B 8 competency: exactly two inserted blocks, totals/signatures shifted, print area extended;
- correct current Assistant Manager weighting 60/40 and no stale 30% business rule;
- A3 landscape / A4 portrait preserved;
- key merges/styles/row heights preserved after insertions;
- Part B protection preserved as required;
- zero worksheet scoring formulas introduced;
- Employee-Self-safe projection cannot gain manager/GM/appraiser confidential data through renderer;
- malformed template/projection fails closed.

Run at minimum:
```text
node --test tests/mbo-export-service.test.js
node --test tests/mbo-xlsx-renderer.test.js
node --test tests/core-794-795-796-integration.test.js
npm audit --omit=dev
```

Also report `git status --porcelain` and exact changed filenames.

## 12. Explicitly forbidden

Do NOT:
- create refs/tags/backups to purged history;
- commit original owner workbooks or extracted real sample values;
- reuse old generated sanitized binaries;
- implement PDF;
- add UI/download button;
- modify `src/main-mbo-app.js`;
- access/read/write/export Live Kintone;
- deploy;
- add a second spreadsheet library;
- start D2-WP004 or D3–D6 work.

## 13. Git / completion contract

- Work only on `ai/antigravity-wp002c` after fresh fetch of the rewritten branch.
- **Because history was force-rewritten, do not push from a stale local checkout.** Re-fetch/reset local branch to origin before making R1 changes.
- Smallest implementation possible.
- Push only after privacy tests pass.
- STOP at `IMPLEMENTED_PENDING_INDEPENDENT_REVIEW` or a real blocker.
- Antigravity must not mark PASS/CLOSED.

Final executor report <= 18 lines and include:
- implementation commit SHA(s);
- exact changed files;
- source template SHA verification PASS;
- no-op parity result;
- privacy extraction/OOXML scan result without printing source values;
- exact 4/5/10 and 6/8 structural test results;
- Difficulty field result or blocker;
- `npm audit --omit=dev` result;
- confirmation original binaries/purged history were not re-referenced;
- confirmation no PDF/UI/Kintone/deploy;
- final status.

## 14. Authorization ledger

```text
D2-WP001-SOURCE-20260901-01 = CONSUMED / CLOSED / DO NOT REUSE
D2-WP001-R1-SOURCE-20260901-01 = CONSUMED / CLOSED / DO NOT REUSE
D2-WP002 = APPROVED / READ-ONLY / CLOSED
D2-WP003-SOURCE-20260901-01 = CONSUMED / INVALIDATED BY REVIEW / DO NOT REUSE
D2-WP003-R1-SOURCE-20260901-01 = ACTIVE / ONE WORK PACKAGE ONLY
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R1-SOURCE-20260901-01
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

Authorization is consumed when R1 implementation is pushed for independent review or invalidated by material scope/dependency change.