# AI ACTIVE TASK — D2-WP003 EXECUTION AUTHORIZED

Mode: **ANTIGRAVITY EXECUTION PLANE / XLSX FOUNDATION ONLY / NO PDF / NO UI / NO KINTONE / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-01 ICT

```text
TASK_STATE = AUTHORIZED_FOR_EXECUTION
D1_OVERALL = PASS / CLOSED
D2_STATUS = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
ACTIVE_WORK_PACKAGE = D2-WP003
ACTIVE_WORK_PACKAGE_NAME = SANITIZED TEMPLATE ASSETS + XLSX RENDERER FOUNDATION
OWNER_APPROVAL = GRANTED 2026-09-01 ICT
EXECUTOR = ANTIGRAVITY
ANTIGRAVITY_MODE = LOW-CREDIT / BOUNDED
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-SOURCE-20260901-01
MAX_EXECUTOR_STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
```

## 1. Objective

Implement only the Excel binary foundation frozen by D2-WP002:
1. create sanitized runtime Part A and Part B template assets from the accepted legacy binaries;
2. implement a template-preserving XLSX renderer that consumes the already-secured `MboExportService` projection;
3. prove Part A exact 4 / 5 / 10 objective rendering;
4. prove Part B exact 6 / 8 competency rendering;
5. preserve legacy visual/print structure while current baseline/data rules remain authoritative.

Do **not** implement PDF, download UI, Live Kintone integration, deployment or another Work Package.

## 2. Accepted template identity — fail closed

Only use local legacy binaries whose SHA-256 exactly matches the WP002 evidence:

```text
PART_A_SHA256 = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B_SHA256 = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
```

Bounded lookup only. Check exact filenames in these locations; do not broad-scan the machine:
- repository root;
- `app info/data/`;
- `exp/`.

Expected source names:
- `PMS_Staff & Chief_PART_A.xlsx`
- `PMS_Staff & Chief_PART_B.xlsx`

If exact matching local binaries are unavailable, **STOP with BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE**. Do not substitute another workbook and do not reconstruct from screenshots.

Original employee-bearing binaries are input evidence only and must remain gitignored / uncommitted.

## 3. Read order — low-credit

Fresh-fetch HEAD, then read only:
1. `project-docs/AI_CONTROL_CENTER.md`
2. `project-docs/AI_ACTIVE_TASK.md`
3. `project-docs/EXCEL_EXPORT.md`
4. `project-docs/CONFIRMED_BASELINE/EVALUATION_CLASSES.md`
5. `src/services/mbo-export-service.js`
6. `package.json`
7. `package-lock.json`
8. exact local legacy template binaries after SHA verification
9. only directly imported helper/security files when a test failure requires them

No whole-repo scan.

## 4. Exact authorized file scope

Allowed source/assets only:
- `src/services/mbo-xlsx-renderer.js` — NEW
- `scripts/export/sanitize-mbo-xlsx-templates.js` — NEW
- `tests/mbo-xlsx-renderer.test.js` — NEW
- `assets/export-templates/PMS_PART_A_SANITIZED.xlsx` — NEW sanitized binary only
- `assets/export-templates/PMS_PART_B_SANITIZED.xlsx` — NEW sanitized binary only
- `package.json` — only for the single dependency below
- `package-lock.json` — lockfile consequence only

Do not modify `src/services/mbo-export-service.js` in WP003. The renderer consumes its secured projection contract; it must not widen authorization or data fields.

No other source/test/assets are authorized without a new Owner approval.

## 5. Dependency authorization — exact and conditional

Exactly one new runtime dependency is authorized:

```text
xlsx-populate = 1.21.0
```

Purpose: existing-workbook/template-preserving XLSX manipulation with Node/browser compatibility.

Before implementing mappings, perform a **no-op round-trip proof** on both exact accepted legacy binaries. Load and write without business-data edits, then inspect the output.

Mandatory no-op proof must show no material drift in at least:
- user-facing sheet names/order;
- Part A print area `A1:BJ52`, A3 landscape, scale 58%;
- Part B print area `A1:X35`, A4 portrait, scale 75%, horizontal centered;
- main-sheet merge counts (Part A 193, Part B 79);
- row/column geometry needed by the frozen contract;
- Part B protection state;
- approved branding/image relationships remain present;
- workbook opens/parses successfully after round trip.

If any material drift occurs, revert package/source experiment and **STOP with BLOCKER_XLSX_LIBRARY_PARITY**. Do not silently switch to ExcelJS/SheetJS/another library.

Run `npm audit --omit=dev`. Any HIGH/CRITICAL finding attributable to the new runtime dependency is a blocker; stop and report it rather than adding another package.

## 6. Sanitized template asset contract

Create runtime assets only after source hashes and no-op proof pass.

Sanitized assets must preserve:
- approved branding;
- main user-facing sheet name;
- merged ranges / styles / borders;
- column widths / row heights;
- page setup / margins / print area;
- Part B protection behavior where compatible;
- legacy static labels that remain valid current presentation text.

Sanitized assets must remove:
- employee names / IDs;
- sample dates;
- sample Department/Section values when employee-specific;
- sample Hoshin text;
- objectives/action plans/results;
- self/appraiser ratings, comments, scores;
- signature names/dates;
- confidential/sample values;
- non-user-facing historical/reference screenshots.

Do not commit original binaries.

Sanitization evidence must compare sensitive values extracted at runtime from the ignored originals against **all XML/text parts of the sanitized package** and prove those sensitive source values do not survive. Do not hardcode real employee/sample values into Git tests or docs.

## 7. Renderer service contract

`src/services/mbo-xlsx-renderer.js` must be data-source agnostic and browser-oriented:

```text
INPUT = sanitized template Buffer/ArrayBuffer + already-authorized export projection
OUTPUT = XLSX Buffer/Uint8Array/ArrayBuffer
NO direct Kintone API calls
NO raw unrestricted App794 reads
NO role resolution inside renderer
NO filesystem requirement inside renderer service
```

Fail closed for missing/invalid template data or malformed projection.

The renderer must not calculate a second business rule engine. Legacy templates contain zero worksheet formulas. Write values already supplied by the secured projection/current scoring/configuration truth.

## 8. Part A required behavior

Frozen structure authority remains `EXCEL_EXPORT.md`.

For 4 objectives:
- retain the legacy four objective rows 25–28;
- map projection values into the frozen Part A columns;
- retain lower review/signature/summary structure.

For 5 and 10 objectives:
- insert/clone additional objective row blocks immediately after legacy row 28;
- preserve the row-28 horizontal merges/styles/borders/alignment/height;
- shift all lower sections downward exactly by inserted row count;
- extend print-area bottom accordingly;
- keep A3 landscape and existing horizontal geometry;
- never truncate objectives.

Stale legacy wording `2 till 4 objectives` must not be emitted as current business truth.

## 9. Part B required behavior

For 6 competencies:
- use the six legacy repeated competency blocks;
- map current projection data and dynamic profile/weight text.

For 8 competencies:
- insert two repeated competency blocks before totals/signatures;
- preserve block styles/merges/layout;
- shift totals/signatures downward;
- extend print-area bottom;
- keep A4 portrait geometry.

Do not hardcode the stale sample `30%` weight or inconsistent sample profile title. Current Profile_Code weighting wins.

## 10. Mandatory tests / evidence

`tests/mbo-xlsx-renderer.test.js` must cover at least:
- accepted sanitized template sheet names;
- no legacy sensitive sample values survive sanitized OOXML evidence run;
- Part A 4 objectives: valid XLSX, exact objective count, baseline print geometry;
- Part A 5 objectives: one inserted block, lower sections shifted, no truncation;
- Part A 10 objectives: six inserted blocks, all 10 rendered, extended print area;
- Part B 6 competencies: six blocks and correct current profile weighting text/value;
- Part B 8 competencies: two inserted blocks, totals shifted, extended print area;
- Part A remains A3 landscape;
- Part B remains A4 portrait and protected as required;
- key merged ranges/styles survive;
- output does not introduce worksheet scoring formulas;
- Employee-Self-safe projection does not magically gain confidential evaluator data in renderer output;
- malformed template/projection fails closed.

Run at minimum:
```text
node --test tests/mbo-export-service.test.js
node --test tests/mbo-xlsx-renderer.test.js
node --test tests/core-794-795-796-integration.test.js
npm audit --omit=dev
```

If a library/API limitation makes 5/10 or 8-block template-preserving rendering unsafe, STOP and report a blocker. Do not degrade to workbook-from-scratch output.

## 11. Explicitly forbidden

Do NOT:
- implement PDF generation;
- add export/download UI buttons;
- modify `src/main-mbo-app.js`;
- perform Live Kintone reads/writes/exports;
- deploy Kintone customization;
- add any dependency other than `xlsx-populate@1.21.0`;
- commit original owner workbooks;
- commit employee/sample confidential values in source/tests/docs;
- commit generated test-output XLSX files;
- change D1 authorization semantics;
- start D2-WP004 or D3/D4/D5/D6 work.

## 12. Git / completion contract

- Work only on `ai/antigravity-wp002c`.
- Smallest implementation possible.
- Prefer one implementation commit; a second commit is acceptable only for sanitized binary assets if Git tooling requires it.
- Push and STOP.
- Final status must be `IMPLEMENTED_PENDING_INDEPENDENT_REVIEW` or a real blocker.
- Antigravity must not mark WP003 PASS/CLOSED.

Final executor report <= 18 concise lines and include:
- implementation commit SHA(s);
- exact changed files;
- source template paths + SHA verification result (no employee values);
- no-op round-trip parity result;
- exact test command results;
- `npm audit --omit=dev` result;
- confirmation original binaries were not committed;
- confirmation no PDF/UI/Kintone/deploy work occurred;
- final status.

## 13. Authorization ledger

```text
D2-WP001-SOURCE-20260901-01 = CONSUMED / CLOSED / DO NOT REUSE
D2-WP001-R1-SOURCE-20260901-01 = CONSUMED / CLOSED / DO NOT REUSE
D2-WP002 = APPROVED / READ-ONLY / CLOSED
D2-WP003-SOURCE-20260901-01 = ACTIVE / ONE WORK PACKAGE ONLY
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-SOURCE-20260901-01
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

Authorization is consumed when implementation is pushed for independent review, or invalidated by any material scope/dependency change.
