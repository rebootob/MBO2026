# AI ACTIVE TASK — R2-C-R1 AUTHORIZED / ACTIVE

Mode: **CONTROL PLANE / BOUNDED EXECUTION AUTHORIZED / LOW-CREDIT / NO KINTONE / NO DEPLOY / D3 HOLD**
Branch: `ai/antigravity-wp002c`
Updated: 2026-09-03 ICT

Read `D2_REVIEW_FAST_START.md` first, then this file, then only the exact R2-C renderer/test/Profile/export/preparer evidence required by the current gate. Do not reopen closed R2-B1/R2-B2 without a proven regression.

## 1. Current truth

```text
D1 = PASS / CLOSED
D2 = IN PROGRESS
D2_PART_A_STRUCTURAL = PASS / CLOSED / FROZEN
D2_PART_B_STRUCTURAL = PASS / CLOSED / FROZEN
D2_PART_B_EXPANDED_PRIVACY = PASS / CLOSED / FROZEN
D2_XLSX_TEMPLATE_PROFILE = PASS / CLOSED / FROZEN
D2_WP004_R2_A = PASS / CLOSED AFTER R1
D2_WP004_R2_B1 = PASS / CLOSED AFTER R10
D2_WP004_R2_B2 = PASS / CLOSED AFTER R4 RUNTIME PROOF

R2-C = REVIEWED / SOURCE+TEST DEFECTS / NOT CLOSED
R2_C_IMPLEMENTATION = d9af2feb5fb2af1834675123fcd83f27a62fceb2
R2_C_PRODUCTION_SOURCE = PARTIAL PASS / CORRECTIVE REQUIRED
R2_C_TEST_PROOF = PARTIAL / MATERIAL GAPS
R2_C_RUNTIME_REPOSITORY_SIGNAL = UNAVAILABLE / NO STATUS / NO WORKFLOW RUN

ACTIVE_WORK_PACKAGE = D2-WP004-R2-C-R1
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP004-R2-C-R1-SOURCE-TEST-CORRECTIVE-20260903-01
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP004-R2-C-R1-SOURCE-TEST-CORRECTIVE-20260903-01
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = D2-WP004-R2-C-R1-SOURCE-TEST-CORRECTIVE-20260903-01
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE

ANTIGRAVITY = BOUNDED / ONE-SHOT / MAX 1 COMMIT
CLAUDE = STOP
R2_B1_PRODUCTION_SOURCE = PASS / FROZEN
R2_B2_PRODUCTION_SOURCE = PASS / FROZEN
R2_B2_TEST_PROOF = PASS / FROZEN
R2_B2_RUNTIME_PROOF = PASS
R2-C-R1 = AUTHORIZED / ACTIVE
COMBINED_EXCEL_PARITY = NOT AUTHORIZED / LATER D2 GATE
D3 = HOLD
```

## 2. R2-C review identity

```text
R2_C_AUTHORIZATION_HEAD = f83cda813c8e7793502da411ec1bac1bca19f084
R2_C_AUTHORIZATION_TOKEN = D2-WP004-R2-C-SOURCE-TEST-20260903-01
R2_C_IMPLEMENTATION = d9af2feb5fb2af1834675123fcd83f27a62fceb2
AUTH_TO_IMPLEMENTATION = EXACTLY ONE COMMIT
IMPLEMENTATION_MESSAGE = feat(d2): add secured semantic xlsx renderer (R2-C)
CHANGED_FILES =
  src/services/mbo-xlsx-semantic-renderer.js
  tests/mbo-xlsx-semantic-renderer.test.js
OUT_OF_SCOPE_CHANGE = NONE
```

The original R2-C token is consumed. R2-C is NOT CLOSED.

## 3. Exact R2-C-R1 authorization

```text
WORK_PACKAGE = D2-WP004-R2-C-R1
NAME = SECURED SEMANTIC RENDERER EXACT PREPARED-GUARD + AUTHORIZED-DIFF CLOSURE
STATE = AUTHORIZED / ACTIVE
MODE = SOURCE+TEST CORRECTIVE / BOUNDED / ONE-SHOT / LOW-CREDIT
MAX_EXECUTOR_COMMITS = 1
AUTHORIZATION_BASE_HEAD = 232df40a96a555fee4796fccfce7ef14ee67d2ba
AUTHORIZATION_TOKEN = D2-WP004-R2-C-R1-SOURCE-TEST-CORRECTIVE-20260903-01
```

Writable files ONLY:

```text
src/services/mbo-xlsx-semantic-renderer.js
tests/mbo-xlsx-semantic-renderer.test.js
```

Frozen / forbidden:

```text
src/profiles/mbo-xlsx-template-profile.js = FROZEN
src/services/mbo-xlsx-template-preparer.js = FROZEN
src/services/mbo-export-service.js = FROZEN
existing XLSX Profile/Preparer/Feasibility tests = FROZEN
project-docs/* = FORBIDDEN TO EXECUTOR
package.json / package-lock.json = FORBIDDEN
UI / dist / integration = FORBIDDEN
Combined Excel parity = NOT AUTHORIZED
Kintone write/deploy/Live UAT = FORBIDDEN
D3 = HOLD
```

## 4. Accepted R2-C portions — MUST PRESERVE

Do not weaken these accepted implementation directions:

- browser-safe production module imports `xlsx-populate` + frozen Template Profile only;
- no `MboExportService`, Kintone, raw record, preparer, scoring or Node-only production dependency;
- `partKey` domain is exact `A` / `B`;
- projection `exportType` is exact `COMBINED_MBO_WORKBOOK_AND_PDF`;
- Part A count derives from `projection.partA.objectivesCount` and exact objectives length;
- Part B count derives from `projection.partB.competencyItems.length`;
- all semantic targets resolve through frozen `profile.resolveSemanticRole()` and exact `projectionPath`;
- `profile.isDynamicWriteTarget()` + effective sanitization-set membership are enforced;
- duplicate Profile-resolved writable addresses fail closed;
- optional secured paths remain blank rather than reconstructed;
- expanded b7/b8 presentation is required and comes only from secured canonical projection paths;
- finite numbers only; unsupported present value types fail closed;
- renderer mutates only raw `xl/worksheets/sheet1.xml` on a private ZIP copy;
- formula inventory is checked before/after;
- non-written effective sensitive addresses remain blank;
- output is a new `Uint8Array`.

## 5. R2-C-R1 exact corrective contract

### R1-A — exact prepared package identity / target topology

Before ANY mutation, production must fail closed unless all of the following are true:

1. Parse workbook sheet declarations + workbook relationships and prove the Profile main sheet binds to `xl/worksheets/sheet1.xml` exactly.
2. Require exactly ONE `_xlnm.Print_Area`, exact `localSheetId="0"`, and exact count-aware Profile `layout.printArea` text.
3. Dimension must equal exact Profile authority.
4. Formula inventory across worksheets must be zero.
5. Every effective sanitization address must have zero pre-write value/formula payload.
6. Every concrete SAFE target cell node must exist EXACTLY ONCE before mutation.
7. Missing OR duplicate target nodes must fail before any semantic write.
8. Part A: reject any surviving/reintroduced reference-image authority package-wide, including:
   - `xl/media/image3.png` orphan media;
   - any `rId3` reference associated with the forbidden reference image authority;
   - any relationship/drawing reference to `image3.png`.
9. Part B:
   - declared merge count == actual merge inventory count == Profile final merge count;
   - every `layout.ratingScaleStaticRanges` merge exists exactly as authorized;
   - every `layout.protectedPaddingRows` row exists exactly once;
   - workbook auxiliary sheet named exactly `Sheet1` binds to `xl/worksheets/sheet2.xml`.

Do NOT rerun structural preparation or sanitization.

### R1-B — exact raw OOXML semantic write

Preserve target-only raw OOXML mutation.

- preserve the exact target opening-tag structural attributes except the narrowly authorized `t` representation change;
- do NOT parse/rebuild attributes in a way that can drop namespaced/material attributes;
- string writes use valid inline-string OOXML;
- add `xml:space="preserve"` when exact secured text requires leading/trailing/whitespace preservation;
- whitespace-only NONEMPTY strings remain exact secured strings;
- ONLY exact empty string / null / undefined / missing stays blank;
- reject XML-invalid text completely;
- reject text >32767 Excel characters; never truncate;
- finite numbers write exact numeric value; zero is PRESENT;
- booleans/objects/arrays/functions/symbols/bigints/non-finite numbers fail closed;
- no missing cell materialization;
- formula in target fails closed;
- no sharedStrings creation.

### R1-C — exact final preservation validation

Capture prepared-before authority and before return fail closed unless:

- formula inventory remains zero;
- exact dimension unchanged;
- exact Print_Area unchanged;
- Part B merge/rating-scale/padding topology unchanged;
- package entry inventory unchanged;
- every written target decodes to exact secured scalar truth;
- every optional absent target remains blank;
- every non-written effective sensitive address remains blank;
- caller input bytes are CONTENT-identical to pre-call snapshot, not merely same length;
- output is a NEW `Uint8Array`;
- no target cell materialized/removed unexpectedly;
- no unresolved/no-source role was written.

## 6. Complete strict TEST closure contract

Expand only:

`tests/mbo-xlsx-semantic-renderer.test.js`

Expected truth comes from exact OWNER template / prepared-before bytes / frozen Profile / secured projection. NEVER renderer output as expected truth.

Owner template missing or wrong SHA => FAIL / NO SKIP.

### Test A — browser/dependency/static source boundary

Prove renderer production source:
- zero Node-only imports;
- zero `MboExportService`/Kintone/preparer/scoring imports;
- no `eval`;
- no important hard-coded workbook addresses;
- no scoring/formula reconstruction.

### Test B — complete fail-closed perturbation matrix

Cover at minimum:

- invalid partKey;
- invalid/missing combined exportType;
- malformed Part A count/length;
- malformed Part B competency count;
- unknown/raw-record option;
- dirty pre-render sensitive payload;
- injected formula;
- missing target node;
- duplicate target node;
- wrong exact dimension;
- wrong exact Print_Area end-row/value;
- wrong Print_Area localSheetId/count;
- wrong main sheet identity / workbook relationship binding;
- Part A orphan `xl/media/image3.png` reappearance;
- Part A forbidden relationship/drawing reference reappearance;
- Part B declared-vs-actual merge corruption;
- Part B Rating Scale merge corruption;
- Part B padding row missing/duplicate;
- Part B auxiliary `Sheet1` binding corruption;
- invalid present scalar types;
- non-finite numbers;
- invalid XML control text;
- >32767 text;
- missing/blank required b7/b8 canonical presentation;
- caller-byte immutability on EVERY representative failure.

### Test C — real OWNER Part A N4..N10 complete matrix

For EVERY N=4..10:

- prepare exact OWNER Part A using closed preparer;
- exact concrete role count = `10 + 5*N` => 30..60;
- derive every writable address/path from Profile;
- assert EVERY path-present SAFE target equals projection truth;
- assert EVERY optional absent SAFE target remains blank;
- assert EVERY other effective sanitization address outside written target set remains blank;
- output NEW Uint8Array;
- prepared input content-immutable;
- formula inventory zero;
- exact reference-image removal remains effective.

No cell spot-check substitute.

### Test D — real OWNER Part B N6/N7/N8 complete matrix

For N=6/7/8:

- exact role counts 14/17/20;
- assert ALL Profile-derived self-rating targets;
- summaries exact when present / blank when absent;
- b1..b6 title+description exact prepared-before parity;
- b7/b8 exact secured canonical title/description when applicable;
- FULL Chief R:X effective sensitive authority remains blank;
- Rating Scale static ranges exact prepared-before parity;
- protected padding exact prepared-before parity;
- final merge inventory/count unchanged;
- auxiliary `Sheet1` exact prepared-before parity;
- every other nonwritten effective sanitization address blank;
- formula inventory zero;
- prepared input content-immutable.

No K9/R31/B29-only spot-check substitute.

### Test E — exact authorized-diff proof

For representative Part A and Part B, and enough count variants to prove count-aware target behavior:

- package entry inventory unchanged;
- EVERY package entry except `xl/worksheets/sheet1.xml` byte-equal to prepared input;
- derive exact writable target set from frozen Profile;
- normalize ONLY the authorized value/type payload of those exact writable cell nodes in before/after `sheet1.xml`;
- require complete remaining `sheet1.xml` deep equality;
- target `r`, `s` and every non-type structural attribute equal before/after;
- exact cell inventory equal before/after;
- no cell materialization/removal.

### Test F — actual secured projection privacy boundary, BOTH Parts

In TEST code only, use frozen `MboExportService.projectCombinedExport()` for representative:

- `EMPLOYEE_SELF`;
- authorized `APPROVER`.

Employee-Self must prove on BOTH Part A and Part B:
- allowed header/hoshin/objective/self-rating values may write;
- `averageScore` remains blank when omitted;
- Part A summary remains blank;
- Part B summary remains blank;
- manager/GM/final score/final grade/evaluator secret tokens are absent package-wide.

Approver must prove on BOTH Parts:
- SAFE averageScore may write when present;
- SAFE Part A summary may write when present;
- SAFE Part B summary may write when present;
- manager/GM comments/ratings remain unwritten;
- final score/grade remain unwritten;
- unresolved/no-source secret tokens absent package-wide.

N7/N8 privacy/projection proof must use REAL canonical `presentationTitle` / `presentationDescription` from the frozen export service and prove renderer does not consume raw `name/title/competencyName` aliases.

### Test G — exact string / XML preservation

Cover path-present secured strings containing:
- leading whitespace;
- trailing whitespace;
- whitespace-only NONEMPTY content;
- `& < > " '` characters;
- normal Unicode/Thai text.

Require decoded output equals exact secured string and OOXML uses preservation-safe representation when required.

Also prove invalid XML controls fail closed and >32767 text fails closed.

## 7. Required runtime / regression gate

Focused:

`node --test tests/mbo-xlsx-semantic-renderer.test.js`

Required:

```text
FAIL = 0
SKIP = 0
OWNER Part A N4..N10 = EXECUTED / PASS
OWNER Part B N6/N7/N8 = EXECUTED / PASS
exact prepared-buffer fail-closed perturbations = PASS
Employee-Self Part A + Part B privacy = PASS
Approver SAFE-only Part A + Part B = PASS
authorized-diff full sheet1 normalization/deep equality = PASS
whitespace/XML preservation = PASS
formula inventory = 0
```

Frozen regression bundle:

`node --test tests/mbo-xlsx-template-profile.test.js tests/mbo-xlsx-template-preparer.test.js tests/mbo-xlsx-template-preparer-part-b.test.js tests/mbo-export-service.test.js`

Required regression:

```text
FAIL = 0
closed Profile / Part A / Part B preparer / export security behavior preserved
```

Also run:

```text
node --check src/services/mbo-xlsx-semantic-renderer.js
git diff --check
```

All must PASS.

## 8. Active executor protocol

Authorization is effective NOW and single-use.

Before modification:
- fresh-fetch exact authorization HEAD generated by this control update;
- verify token exactly;
- read this exact R1 contract;
- no broad exploration;
- no Git delivery rediscovery.

Before commit:

`git diff --name-only`

MUST show ONLY:

```text
src/services/mbo-xlsx-semantic-renderer.js
tests/mbo-xlsx-semantic-renderer.test.js
```

If stricter proof exposes a required frozen-file change:
- DO NOT modify frozen files;
- DO NOT weaken tests;
- DO NOT broaden scope;
- report exact blocker;
- STOP.

If all required tests/checks pass:

1. create EXACTLY ONE SOURCE+TEST corrective commit;
2. suggested message: `fix(d2): close secured semantic renderer guard and proof gaps (R2-C-R1)`;
3. push `ai/antigravity-wp002c`;
4. report pushed SHA;
5. report exact changed files;
6. report focused PASS/FAIL/SKIP and required matrix signals;
7. report frozen regression result;
8. report `node --check` result;
9. report `git diff --check` result;
10. STOP.

Do NOT modify `project-docs/*`.
Do NOT self-declare R2-C PASS/CLOSED.
Do NOT start Combined Excel.
Do NOT perform Kintone writes/deploy/Live UAT.
Do NOT start D3.

## 9. Authorization identity / stop condition

Owner explicitly authorized:

`อนุมัติ D2-WP004-R2-C-R1 SOURCE+TEST CORRECTIVE ตามขอบเขตที่เสนอ`

Single-use authorization token:

`D2-WP004-R2-C-R1-SOURCE-TEST-CORRECTIVE-20260903-01`

The token is consumed when the executor either:
- creates/pushes the authorized corrective implementation commit; or
- stops due to a contract blocker after beginning authorized execution.

After push or blocker report, Antigravity MUST STOP and wait for independent ChatGPT review. No subsequent gate is authorized.
