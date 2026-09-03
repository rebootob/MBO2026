# AI ACTIVE TASK — R2-C REVIEWED / NOT CLOSED / R2-C-R1 EXACT CORRECTIVE PROPOSAL READY

Mode: **CONTROL PLANE / NO ACTIVE EXECUTOR / LOW-CREDIT / NO KINTONE / NO DEPLOY / D3 HOLD**
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

ACTIVE_WORK_PACKAGE = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE

ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
R2_B1_PRODUCTION_SOURCE = PASS / FROZEN
R2_B2_PRODUCTION_SOURCE = PASS / FROZEN
R2_B2_TEST_PROOF = PASS / FROZEN
R2_B2_RUNTIME_PROOF = PASS
R2-C-R1 = EXACT CORRECTIVE PROPOSAL READY / NOT AUTHORIZED
COMBINED_EXCEL_PARITY = NOT AUTHORIZED / LATER D2 GATE
D3 = HOLD
```

## 2. R2-C authorization / implementation identity

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

The single-use R2-C token is consumed. No further R2-C modification is authorized by that token.

## 3. Accepted R2-C implementation portions — preserve in corrective

The independent review accepts these implementation directions and they must not be weakened:

- browser-safe production module imports `xlsx-populate` + frozen Template Profile only;
- no `MboExportService`, Kintone, raw record, preparer, scoring or Node-only production dependency;
- `partKey` domain is exact `A` / `B`;
- projection `exportType` is exact `COMBINED_MBO_WORKBOOK_AND_PDF`;
- Part A count derives from `projection.partA.objectivesCount` and exact objectives length;
- Part B count derives from `projection.partB.competencyItems.length`;
- all semantic targets resolve through frozen `profile.resolveSemanticRole()` and `projectionPath`;
- `profile.isDynamicWriteTarget()` + effective sanitization-set membership are enforced;
- duplicate Profile-resolved writable addresses fail closed;
- optional secured paths remain blank rather than reconstructed;
- expanded b7/b8 presentation is required and comes only from secured canonical projection paths;
- finite numbers only; unsupported present value types fail closed;
- renderer mutates only raw `xl/worksheets/sheet1.xml` on a private ZIP copy;
- formula inventory is checked before/after;
- non-written effective sensitive addresses are final-validated blank;
- output is a new `Uint8Array`.

These accepted portions do NOT close R2-C because the fail-closed prepared-buffer boundary and required proof matrix are incomplete.

## 4. Independent blockers — R2-C NOT CLOSED

### BLOCK A — prepared-buffer fail-closed authority is incomplete

Current production source is weaker than the authorized contract in these material ways:

1. **Print_Area is not exact**
   - current code checks only a string prefix like `'<sheet>'!$A$1:`;
   - it does not prove exactly one `_xlnm.Print_Area`, exact `localSheetId="0"`, and exact count-aware `layout.printArea` value;
   - wrong end-row / wrong exact authority can therefore pass the current guard.

2. **Main-sheet identity is not exact**
   - required workbook sheet identity / relationship binding to the main worksheet is not independently verified.

3. **Concrete target cell node EXACTLY-ONCE guard is missing**
   - contract requires every concrete SAFE target node to exist exactly once before mutation;
   - current mutation helper finds/replaces a matching node but does not prove zero duplicates;
   - missing/duplicate target topology must fail before any semantic write.

4. **Part A reference-image removal guard is incomplete**
   - current check is conditional on one drawing rel file and only scans that rel text;
   - exact forbidden `rId3` / `image3.png` references and orphan `xl/media/image3.png` must be rejected package-wide.

5. **Part B protected topology guard is incomplete**
   - current code checks only declared merge count and auxiliary sheet2 existence;
   - it must prove declared merge count == actual merge inventory count == frozen Profile final count;
   - every `layout.ratingScaleStaticRanges` merge must be present;
   - every `layout.protectedPaddingRows` row must exist exactly once;
   - auxiliary `Sheet1` identity must be correct, not merely an arbitrary `sheet2.xml` file.

### BLOCK B — exact secured string / target-attribute preservation is incomplete

1. Current code converts whitespace-only non-empty secured strings to blank using `val.trim() === ''`.
   - authorized policy says only exact empty string is blank;
   - secured strings otherwise preserve exact text.

2. Leading/trailing whitespace semantics are not explicitly preserved in inline string OOXML.
   - use valid inline-string OOXML with `xml:space="preserve"` when required by the exact secured text.

3. Current attribute parsing rebuilds only `\w+="..."` attributes.
   - this is not sufficient proof that every non-`t` structural attribute, including namespaced/material attributes if present, survives unchanged;
   - mutation must preserve the exact opening-tag structural authority except the narrowly authorized type representation change.

4. XML-invalid string validation must cover the authorized policy completely; do not silently normalize/truncate invalid secured text.

### BLOCK C — final production preservation validation is incomplete

Before return, production must compare against prepared-before authority and fail closed unless:

- exact dimension unchanged;
- exact Print_Area unchanged;
- exact Part B merge/protected topology unchanged;
- package entry inventory unchanged;
- non-target package entries remain untouched by renderer behavior;
- caller input bytes are content-identical to their pre-call snapshot, not merely equal length;
- no target cell was materialized/removed unexpectedly.

### BLOCK D — authorized TEST contract was materially under-proven

Current test suite contains useful smoke/integration checks but does not satisfy the exact closure contract:

1. Fail-closed test does NOT yet cover all required perturbations:
   - malformed Part B count;
   - dirty pre-render sensitive payload;
   - injected formula;
   - missing target node;
   - duplicate target node;
   - wrong exact Print_Area;
   - wrong sheet identity;
   - Part B Rating Scale / padding corruption;
   - Part A orphan/reference-image reappearance;
   - complete invalid scalar/XML-string cases.

2. Part A N4..N10 matrix currently spot-checks only a few cells.
   - must assert EVERY concrete SAFE path-present target from Profile/projection;
   - exact role counts 30..60;
   - every optional absent target blank;
   - every other effective sensitive address blank.

3. Part B N6/N7/N8 currently spot-checks only a subset.
   - must assert ALL self-rating targets;
   - exact role counts 14/17/20;
   - exact summaries when present / blank when absent;
   - b1..b6 title+description exact prepared-before parity;
   - b7/b8 exact canonical presentation;
   - complete Chief R:X blank proof;
   - Rating Scale + padding exact prepared-before parity;
   - auxiliary `Sheet1` byte/content parity.

4. Authorized-diff proof is incomplete.
   - current test proves non-sheet1 package entries are byte-equal;
   - it does NOT normalize only exact Profile-derived writable cell nodes and then deep-equal the complete `sheet1.xml`;
   - it does NOT yet prove target non-type attrs / cell inventory / no materialization-removal exactly.

5. Actual secured privacy proof is incomplete.
   - current proof is primarily Part A;
   - must cover Part A + Part B for real `MboExportService.projectCombinedExport()` Employee-Self and authorized Approver projections;
   - must prove Employee-Self Part A/Part B summaries and averageScore omissions remain blank;
   - Approver may write only SAFE averageScore + Part A/Part B summaries;
   - Manager/GM/final/evaluator secrets must remain absent package-wide;
   - N7/N8 real projection must prove canonical presentation is consumed rather than raw aliases.

6. Add exact whitespace/XML escaping preservation proof, including leading/trailing whitespace and special XML characters, plus invalid XML string fail-closed cases.

No test weakening, filters, skips or renderer-output-as-expected oracle is allowed.

## 5. Exact next corrective proposal — D2-WP004-R2-C-R1

```text
PROPOSED_WORK_PACKAGE = D2-WP004-R2-C-R1
NAME = SECURED SEMANTIC RENDERER EXACT PREPARED-GUARD + AUTHORIZED-DIFF CLOSURE
STATE = EXACT CORRECTIVE PROPOSAL READY / NOT AUTHORIZED
MODE = SOURCE+TEST CORRECTIVE / BOUNDED / ONE-SHOT / LOW-CREDIT
MAX_EXECUTOR_COMMITS = 1
```

Proposed writable files ONLY:

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

## 6. R2-C-R1 exact corrective contract

### R1-A — exact prepared package identity / target topology

Before any mutation:

- parse workbook sheet declarations and workbook relationships and prove the Profile main sheet binds to `xl/worksheets/sheet1.xml` exactly;
- require exactly one `_xlnm.Print_Area`, `localSheetId="0"`, and exact Profile `layout.printArea` text;
- dimension exact Profile authority;
- formula inventory zero;
- for every effective sanitization address, reject any pre-write value/formula payload;
- for every concrete SAFE target, require exactly one cell node;
- detect duplicate/missing target nodes before mutation;
- Part A: reject any surviving/reintroduced exact reference-image authority, including package media `xl/media/image3.png` and any `rId3` / `image3.png` relationship/drawing reference;
- Part B: require declared merge count == actual merge count == Profile final count; require every Profile Rating Scale static merge; require each protected padding row exactly once; require auxiliary workbook sheet named `Sheet1` bound to `xl/worksheets/sheet2.xml`.

### R1-B — exact raw OOXML semantic write

Preserve the accepted target-only raw OOXML principle.

- preserve the exact target opening-tag attributes except the narrowly authorized `t` representation change;
- do not parse/rebuild attributes in a way that can drop namespaced/material attributes;
- string writes use safe inline string OOXML;
- add `xml:space="preserve"` when the exact secured string requires whitespace preservation;
- whitespace-only non-empty strings remain exact secured strings (do NOT convert to blank);
- exact empty string / null / undefined / missing remains blank;
- reject invalid XML text completely;
- reject >32767 Excel text rather than truncate;
- finite number writes remain exact; zero is present;
- no missing cell materialization;
- formula in target fails closed.

### R1-C — exact final preservation validation

Capture prepared-before authority and prove after semantic write:

- formula inventory zero;
- dimension exact unchanged;
- Print_Area exact unchanged;
- Part B merge/protected topology exact unchanged;
- every written target decodes to exact secured value;
- every optional absent target blank;
- every non-written effective sensitive address blank;
- caller input bytes content-identical to pre-call bytes;
- output is a new `Uint8Array`;
- no unresolved/no-source role write.

### R1-D — complete strict test closure

Expand the existing new test file only. Expected truth comes from OWNER/prepared-before/Profile/projection, never renderer output.

Required test evidence:

- browser/dependency/no-important-hardcoded-address proof;
- all fail-closed perturbations in BLOCK D.1;
- OWNER Part A N4..N10, every concrete role and exact 30..60 role counts;
- OWNER Part B N6/N7/N8, every concrete role and exact 14/17/20 role counts;
- full sensitive-outside-target blank proof;
- full Chief R:X blank proof;
- prepared static/padding/rating/auxiliary parity;
- package entry inventory parity;
- every non-sheet1 package entry byte-equal;
- normalize ONLY exact Profile-derived writable cell nodes in before/after `sheet1.xml`, then complete deep equality;
- target attr + cell inventory equality outside exact value/type payload authorization;
- real Employee-Self and Approver projection privacy for BOTH Parts;
- N7/N8 real canonical presentation proof;
- whitespace / XML escaping / invalid XML cases;
- caller immutability success and failure.

## 7. Required runtime gate if R1 is later authorized

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

Required regression: `FAIL = 0`.

Also:

```text
node --check src/services/mbo-xlsx-semantic-renderer.js
git diff --check
```

Before commit, `git diff --name-only` must show ONLY the two authorized R1 files.

If strict proof exposes a required frozen-file change, executor must STOP without changing frozen files. Do not weaken tests or broaden scope.

## 8. Owner decision

No executor is active. R2-C is NOT CLOSED.

Recommended approval phrase:

`อนุมัติ D2-WP004-R2-C-R1 SOURCE+TEST CORRECTIVE ตามขอบเขตที่เสนอ`
