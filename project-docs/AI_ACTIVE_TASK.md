# AI ACTIVE TASK — R2-C AUTHORIZED / ACTIVE

Mode: **CONTROL PLANE / BOUNDED EXECUTION AUTHORIZED / LOW-CREDIT / NO KINTONE / NO DEPLOY / D3 HOLD**
Branch: `ai/antigravity-wp002c`
Updated: 2026-09-03 ICT

Read `D2_REVIEW_FAST_START.md` first, then this file, then only exact R2-C source/test/Profile/export/preparer evidence required by the current gate. Do not reopen closed R2-B1/R2-B2 without a proven regression.

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

ACTIVE_WORK_PACKAGE = D2-WP004-R2-C
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP004-R2-C-SOURCE-TEST-20260903-01
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP004-R2-C-SOURCE-TEST-20260903-01
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = D2-WP004-R2-C-SOURCE-TEST-20260903-01
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE

ANTIGRAVITY = BOUNDED / ONE-SHOT / MAX 1 COMMIT
CLAUDE = STOP
R2_B1_PRODUCTION_SOURCE = PASS / FROZEN
R2_B2_PRODUCTION_SOURCE = PASS / FROZEN
R2_B2_TEST_PROOF = PASS / FROZEN
R2_B2_RUNTIME_PROOF = PASS
R2-C = AUTHORIZED / ACTIVE
COMBINED_EXCEL_PARITY = NOT AUTHORIZED / LATER D2 GATE
D3 = HOLD
```

## 2. Durable R2-B2 closure identity

```text
R2_B2_IMPLEMENTATION = 0b4bac862aa2906d1ac11071431dbb268c7b7b5e
R2_B2_R1_IMPLEMENTATION = 67c60065e169f9339219dd334c51e9b70c355319
R2_B2_R2_IMPLEMENTATION = 33f1beb3ae292f1ad24857ea04511b3fa445cd2e
R2_B2_R3_IMPLEMENTATION = ffd2c90011706011b51612b56c63a4786d43c653
R2_B2_R4_IMPLEMENTATION = 401caf0d2c4132a4f224140f156d7255a1319a88
R2_B2_R4_RUNTIME = PASS 3 / FAIL 0 / SKIP 0
R2_B2_R4_OWNER_TEMPLATE_INTEGRATION = EXECUTED / NOT SKIPPED
R2_B2_R4_N6_N7_N8_MATRIX = PASS
R2_B2 = PASS / CLOSED / FROZEN
```

Do not reopen R2-B2 source/test behavior without independently proven regression.

## 3. Exact R2-C authorization

```text
WORK_PACKAGE = D2-WP004-R2-C
NAME = SECURED SEMANTIC VALUE RENDERER — PART A + PART B
STATE = AUTHORIZED / ACTIVE
MODE = SOURCE+TEST / BOUNDED / ONE-SHOT / LOW-CREDIT
MAX_EXECUTOR_COMMITS = 1
AUTHORIZATION_BASE_HEAD = e8020a39e6ea6bb0ab1dc78d38972bfa5fee331c
AUTHORIZATION_TOKEN = D2-WP004-R2-C-SOURCE-TEST-20260903-01
```

Writable files ONLY:

```text
src/services/mbo-xlsx-semantic-renderer.js                    NEW
tests/mbo-xlsx-semantic-renderer.test.js                     NEW
```

Frozen / forbidden to executor:

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

No existing production file is writable in this work package.

## 4. Production API contract

Create browser-safe production module:

```js
export async function renderSecuredSemanticValues(
  preparedBytes,
  {
    partKey,
    projection,
    profile = new MboXlsxTemplateProfile()
  } = {}
)
```

Return:

```text
NEW Uint8Array
```

Exact API rules:
- `partKey` must be exactly `A` or `B`;
- caller bytes must never be mutated;
- caller-supplied count is NOT accepted;
- Part A objective count is derived only from `projection.partA.objectivesCount` and must exactly equal `projection.partA.objectives.length`;
- Part B competency count is derived only from `projection.partB.competencyItems.length`;
- accepted domains remain Part A 4..10 and Part B 6/7/8;
- `projection.exportType` must be exactly `COMBINED_MBO_WORKBOOK_AND_PDF`;
- only option keys `partKey`, `projection`, `profile` are accepted; unknown/raw-record options fail closed;
- source must not import `MboExportService`, Kintone adapters, Node `fs/path/crypto`, scoring services, or preparer implementation;
- production dependency may use browser-safe `xlsx-populate` and the frozen Template Profile only;
- validate `validateMappingIntegrity(profile)` before mutation;
- fail-closed error family: `EXPORT_TEMPLATE_RENDERER_UNRESOLVED`.

The renderer is NOT an authorization service. Its sole data input authority is the already-secured plain projection returned upstream by `MboExportService.projectCombinedExport()`.

## 5. Exact secured projection rule

Renderer must resolve values ONLY through the exact `projectionPath` returned by frozen Template Profile semantic resolution.

Path resolution rules:
- exact property/index traversal only;
- no aliases;
- no fallback keys;
- no first-nonblank guessing;
- no raw-record lookup;
- no scoring calculation/reconstruction;
- no `eval` or dynamic code execution;
- prototype-sensitive path tokens must fail closed;
- every path segment must be an own property / exact array index.

If an otherwise-safe path is absent because the secured projection omitted it:

```text
LEAVE THE PRE-SANITIZED TARGET BLANK
DO NOT RECONSTRUCT
DO NOT FAIL MERELY BECAUSE OPTIONAL SECURED DATA IS OMITTED
```

This preserves Employee-Self privacy for omitted `averageScore`, Part A/Part B summaries and other confidential values.

Exception — expanded Part B presentation is required for truthful N7/N8 output:
- N>=7 requires nonblank-string `COMPETENCY_7_TITLE` and `COMPETENCY_7_DESCRIPTION` secured paths;
- N=8 also requires nonblank-string `COMPETENCY_8_TITLE` and `COMPETENCY_8_DESCRIPTION` secured paths;
- missing/malformed expanded presentation => fail closed;
- renderer writes the secured canonical strings exactly and does not derive aliases or compose its own title.

## 6. Exact concrete SAFE write plan — Profile-derived addresses only

Renderer must build semantic role names by count, then obtain BOTH address and projection path from `profile.resolveSemanticRole(...)`.

No important workbook address may be hard-coded in the renderer.

### Part A concrete roles

Always:

```text
HEADER_FISCAL_YEAR
HEADER_EMPLOYEE_NAME
HEADER_DEPARTMENT
HEADER_SECTION
HEADER_POSITION
HEADER_EMPLOYEE_CODE
HOSHIN_DEPARTMENT_HOSHIN_TITLE
HOSHIN_SECTION_HOSHIN_TITLE
SUMMARY_PART_A_RAW_SCORE
SUMMARY_PART_A_WEIGHTED_SCORE
```

For every objective i=1..N:

```text
OBJECTIVE_i_MEASUREMENT
OBJECTIVE_i_WEIGHT
OBJECTIVE_i_ACTUAL_RESULT
OBJECTIVE_i_SELF_COMMENT
OBJECTIVE_i_AVERAGE_SCORE
```

Concrete role count:

```text
10 + (5 * N)
N4 = 30
N5 = 35
...
N10 = 60
```

### Part B concrete roles

Always:

```text
HEADER_FISCAL_YEAR
HEADER_EMPLOYEE_NAME
HEADER_DEPARTMENT
HEADER_SECTION
HEADER_POSITION
HEADER_EMPLOYEE_CODE
SUMMARY_PART_B_RAW_SCORE
SUMMARY_PART_B_WEIGHTED_SCORE
```

For every competency b=1..N:

```text
COMPETENCY_b_SELF_RATING
```

Expanded presentation only:

```text
N7/N8:
  COMPETENCY_7_TITLE
  COMPETENCY_7_DESCRIPTION

N8:
  COMPETENCY_8_TITLE
  COMPETENCY_8_DESCRIPTION
```

Concrete role counts:

```text
N6 = 14
N7 = 17
N8 = 20
```

Forbidden writes remain all frozen UNRESOLVED / NO_SECURED_SOURCE roles, including Chief R:X, objective manager/GM roles, final score/grade, signatures/comments and b1..6 presentation.

For every resolved concrete safe role, production must additionally verify:
- non-null exact projection path;
- valid exact cell address;
- `profile.isDynamicWriteTarget(partKey, address, count) === true`;
- address lies inside the exact prepared effective sanitization topology;
- no duplicate concrete writable address.

Any violation => fail closed.

## 7. Prepared-buffer pre-write guard

R2-C consumes R2-B1/B2 prepared output, not owner-template bytes directly.

Before writing, fail closed unless the prepared package satisfies the relevant frozen Profile topology:

Common:
- required workbook + main worksheet OOXML exist;
- main sheet identity matches Profile authority;
- exact count-aware dimension matches Profile layout;
- exact count-aware Print_Area matches Profile layout;
- formula inventory across worksheets = zero;
- every effective sanitization address has zero value-bearing payload (`<v>` / `<is>`) and zero formula before write;
- every concrete safe target cell node exists exactly once;
- caller bytes remain immutable.

Part A additionally:
- closed reference-image removal remains effective: forbidden reference image tuple/media must not reappear.

Part B additionally:
- final merge count matches frozen R2-B2 authority 79/86/93 from Profile;
- protected Rating Scale merges remain present;
- protected padding rows remain present;
- auxiliary `Sheet1` exists and remains untouched.

Renderer must not redo structural preparation or sanitization. Any dirty/unprepared/mismatched buffer fails closed.

## 8. Value/type write policy

Allowed final secured scalar values:

```text
string
finite number
null / undefined / missing -> leave blank
empty string -> leave blank
```

Forbidden present values:

```text
NaN / Infinity / -Infinity
boolean
object
array
function
symbol
bigint
unsupported scalar/coercion
```

Do not coerce objects/booleans into strings.

String rules:
- preserve exact secured text;
- XML-escape safely;
- preserve leading/trailing whitespace semantics when present;
- reject XML-invalid control characters;
- reject values exceeding Excel cell-text limit rather than truncate.

Number rules:
- write exact finite numeric value;
- no rounding/scoring/recalculation.

Zero must be treated as a present writable value, not as missing.

## 9. Mutation implementation principle

Use the accepted raw-OOXML preservation principle rather than worksheet-wide reserialization.

Required behavior:
- load a private copy of prepared bytes;
- mutate only `xl/worksheets/sheet1.xml` exact authorized target cell nodes;
- do not materialize absent target cells;
- formula in any target => fail closed;
- preserve target `r`, style `s` and all non-type structural attributes;
- string values may change only the target cell type representation needed for a valid inline string and add exact escaped inline-string payload;
- numeric values may remove incompatible target `t` and add exact `<v>` payload;
- leave missing/null/empty secured paths in their sanitized blank state;
- never touch merges, dimensions, row attributes, page setup, protection, relationships, media, defined names or auxiliary sheets;
- do not use sharedStrings for newly written values;
- output from the mutated ZIP as a NEW Uint8Array.

R2-C must not call or rerun `preparePartATemplate()` / `preparePartBTemplate()` in production.

## 10. Final production validation

Before return, verify:
- formula inventory remains exactly zero;
- every path-present writable target decodes to the exact secured scalar value;
- every path-absent optional target remains blank;
- every effective sensitive/dynamic address outside the exact written-safe target set remains blank;
- Part B Chief authority R:X remains blank except no write is ever authorized there;
- b1..6 Part B owner-template static presentation remains untouched;
- expanded b7/b8 presentation equals exact secured canonical projection strings;
- no unresolved/no-source role is written;
- count-aware dimension/Print_Area/merge/protected topology remains unchanged from the prepared input.

## 11. Exact R2-C test contract

Create NEW:

`tests/mbo-xlsx-semantic-renderer.test.js`

Test expected truth must come from:
- exact OWNER templates used only to produce prepared input through already-closed preparers;
- the frozen Template Profile;
- the input secured projection;
- prepared-before bytes for preservation comparisons.

Never use renderer output as expected truth.

Owner templates missing / wrong SHA => FAIL / NO SKIP.

### Test A — browser-safe / dependency boundary

Prove production renderer:
- imports zero Node-only modules;
- imports no Kintone/raw record services;
- imports no `MboExportService`;
- contains no scoring calculation/formula recreation;
- contains no important hard-coded workbook addresses.

### Test B — fail-closed input/prepared-buffer boundary

Cover at minimum:
- invalid partKey;
- missing/invalid combined projection exportType;
- malformed Part A objective count/length mismatch;
- malformed Part B competency count;
- unknown option/raw-record option;
- dirty pre-render sensitive payload;
- injected formula;
- missing/duplicate mapped target cell;
- wrong dimension / Print_Area / sheet identity;
- invalid present scalar type;
- missing required b7/b8 canonical presentation;
- caller-byte immutability on success and failure.

### Test C — real OWNER Part A N4..N10 matrix

For every N=4..10:
1. prepare exact owner Part A with closed preparer;
2. render from independently built secured combined-projection fixture;
3. assert every concrete SAFE path-present target equals projection truth;
4. assert optional absent safe paths remain blank;
5. assert all other effective sanitization addresses remain blank;
6. assert exact role counts 30..60;
7. assert output is NEW Uint8Array;
8. assert prepared input immutable;
9. assert formula inventory zero;
10. assert reference image remains removed.

### Test D — real OWNER Part B N6/N7/N8 matrix

For N=6/7/8:
- exact concrete role counts 14/17/20;
- all self-rating targets exact;
- b1..6 static title/description unchanged from prepared input;
- N7 b7 title/description exact secured canonical values;
- N8 b7+b8 title/description exact secured canonical values;
- Rating Scale/padding exact prepared-input parity;
- Chief R:X remains blank;
- summary targets exact only when secured paths present;
- all other effective sanitization addresses remain blank;
- final merge 79/86/93 unchanged;
- auxiliary Sheet1 unchanged;
- formulas zero;
- input immutable.

### Test E — exact preservation / authorized-diff proof

For both Parts:
- package entry inventory unchanged;
- every package entry except `xl/worksheets/sheet1.xml` byte-equal to prepared input;
- normalize ONLY exact Profile-derived target cell nodes in prepared-before and rendered-after `sheet1.xml`, then require full XML deep equality;
- target cells preserve `r`, `s` and every non-type structural attribute;
- no unexpected cell materialization/removal.

This is the primary no-side-effect proof.

### Test F — actual secured projection privacy boundary

Use Node test code to obtain REAL projections from existing frozen `MboExportService.projectCombinedExport()` for representative Employee-Self and authorized Approver contexts.

Employee-Self proof:
- allowed self/header/hoshin/objective values write;
- omitted `averageScore` stays blank;
- Part A/Part B summary targets stay blank;
- manager/GM/final-grade/final-score/evaluator secret tokens never appear anywhere in rendered package.

Approver proof:
- exact SAFE `averageScore` and Part A/Part B summaries may write when present;
- manager/GM comments/ratings and final score/grade remain forbidden/unwritten even though they may exist in the secured approver projection;
- unresolved/no-source unique tokens do not appear in package.

Expanded N7/N8 projection must come from existing canonical `presentationTitle` / `presentationDescription`; renderer must not use raw `name/title/competencyName` aliases.

## 12. Focused runtime / regression gate

Focused command:

`node --test tests/mbo-xlsx-semantic-renderer.test.js`

Required focused closure evidence:

```text
FAIL = 0
SKIP = 0
real OWNER Part A N4..N10 = EXECUTED / PASS
real OWNER Part B N6/N7/N8 = EXECUTED / PASS
Employee-Self privacy = PASS
Approver SAFE-only write = PASS
authorized-diff preservation = PASS
formula inventory = 0
```

Frozen regression bundle:

`node --test tests/mbo-xlsx-template-profile.test.js tests/mbo-xlsx-template-preparer.test.js tests/mbo-xlsx-template-preparer-part-b.test.js tests/mbo-export-service.test.js`

Regression requirement:

```text
FAIL = 0
closed Profile/Part A/Part B preparer/export security behavior preserved
```

Also run:

```text
node --check src/services/mbo-xlsx-semantic-renderer.js
git diff --check
```

## 13. Active executor protocol

Authorization is effective NOW and is single-use.

Before modification:
- fresh-fetch exact authorization HEAD generated by this control update;
- read this exact R2-C contract;
- verify authorization token exactly;
- no broad exploration;
- no Git delivery rediscovery.

Before commit:

`git diff --name-only`

MUST contain ONLY:

```text
src/services/mbo-xlsx-semantic-renderer.js
tests/mbo-xlsx-semantic-renderer.test.js
```

Then:
1. focused test PASS;
2. frozen regression bundle PASS;
3. `node --check` PASS;
4. `git diff --check` PASS;
5. exactly ONE SOURCE+TEST commit;
6. push `ai/antigravity-wp002c`;
7. report pushed SHA, exact files and exact test results;
8. STOP;
9. do not modify `project-docs/*`;
10. do not self-declare R2-C PASS/CLOSED;
11. do not start Combined Excel, Kintone/deploy/Live UAT or D3.

Suggested implementation commit message:

`feat(d2): add secured semantic xlsx renderer (R2-C)`

## 14. Authorization identity / stop condition

Owner explicitly authorized:

`อนุมัติ D2-WP004-R2-C SOURCE+TEST ตามขอบเขตที่เสนอ`

Single-use authorization token:

`D2-WP004-R2-C-SOURCE-TEST-20260903-01`

The token is consumed when the executor either:
- creates/pushes the authorized implementation commit; or
- stops due to a contract blocker after beginning authorized execution.

After push or blocker report, Antigravity MUST STOP and wait for independent ChatGPT review. No subsequent gate is authorized.
