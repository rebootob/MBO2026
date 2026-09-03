# AI ACTIVE TASK — R2-C-R1 REVIEWED / NOT CLOSED / R2-C-R2 EXACT CORRECTIVE PROPOSAL READY

Mode: **CONTROL PLANE / NO ACTIVE EXECUTOR / LOW-CREDIT / NO KINTONE / NO DEPLOY / D3 HOLD**
Branch: `ai/antigravity-wp002c`
Updated: 2026-09-03 ICT

Read `D2_REVIEW_FAST_START.md` first, then this file, then only exact R2-C renderer/test/Profile/export/preparer evidence required by the current gate. Do not reopen closed R2-B1/R2-B2 without a proven regression.

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

R2-C = REVIEWED / NOT CLOSED
R2_C_IMPLEMENTATION = d9af2feb5fb2af1834675123fcd83f27a62fceb2
R2_C_R1_IMPLEMENTATION = aee75a8f01c681766ac6258cb02c267469ae97ff
R2_C_R1_SOURCE = PARTIAL PASS / CORRECTIVE REQUIRED
R2_C_R1_TEST_PROOF = PARTIAL / MATERIAL GAPS
R2_C_R1_RUNTIME_REPOSITORY_SIGNAL = UNAVAILABLE / NO STATUS / NO WORKFLOW RUN

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
R2-C-R2 = EXACT CORRECTIVE PROPOSAL READY / NOT AUTHORIZED
COMBINED_EXCEL_PARITY = NOT AUTHORIZED / LATER D2 GATE
D3 = HOLD
```

## 2. R2-C-R1 review identity

```text
R2_C_R1_AUTHORIZATION_HEAD = 0bd15f14918751b2cda2c2acc66ea3ab6d40f61f
R2_C_R1_AUTHORIZATION_TOKEN = D2-WP004-R2-C-R1-SOURCE-TEST-CORRECTIVE-20260903-01
R2_C_R1_IMPLEMENTATION = aee75a8f01c681766ac6258cb02c267469ae97ff
AUTH_TO_IMPLEMENTATION = EXACTLY ONE COMMIT
IMPLEMENTATION_MESSAGE = fix(d2): close secured semantic renderer guard and proof gaps (R2-C-R1)
CHANGED_FILES =
  src/services/mbo-xlsx-semantic-renderer.js
  tests/mbo-xlsx-semantic-renderer.test.js
OUT_OF_SCOPE_CHANGE = NONE
```

The R1 token is consumed. No further change is authorized by it.

## 3. Accepted R1 improvements — preserve

Independent review accepts these R1 changes and they must not be weakened:

- exact main-sheet workbook relationship binding to `sheet1.xml` is now checked;
- exactly one `_xlnm.Print_Area`, `localSheetId="0"`, exact Profile `layout.printArea`, and exact dimension are checked pre-write;
- target cell nodes are required EXACTLY ONCE before mutation;
- Part A rejects orphan `xl/media/image3.png` and current forbidden drawing-rel `rId3/image3.png` authority;
- Part B requires declared merge count == actual count == Profile final count;
- Profile Rating Scale static merges and protected padding rows are guarded;
- auxiliary workbook sheet `Sheet1` is bound to `sheet2.xml`;
- caller-byte content immutability is checked, not length-only;
- whitespace-only nonempty secured text is no longer normalized blank;
- `xml:space="preserve"` is emitted for leading/trailing whitespace;
- real Employee-Self/Approver privacy proof now covers both Parts at least at representative scope;
- authorized-diff proof now compares non-sheet1 package entries byte-for-byte and performs sheet1 normalization/deep equality at representative N4/N6 scope.

These are partial PASS only; R2-C remains NOT CLOSED.

## 4. Independent blockers after R1

### BLOCK A — production target opening-tag preservation is still not exact

The authorized R1 rule was: **do not parse/rebuild attributes in a way that can drop namespaced/material attributes**.

Current renderer still parses target attributes with a whitelist-shaped regex and reconstructs the opening tag. Supporting `prefix:name` is an improvement but still can drop or reorder valid/material attributes outside that parser shape and therefore does not preserve the exact prepared opening-tag authority.

R2-C-R2 must instead:
- capture the exact raw target opening tag / raw attribute text;
- preserve every byte/attribute/order outside only the narrowly authorized `t` type representation change and self-closing-to-paired form required for a value payload;
- never reconstruct non-`t` attributes from parsed key/value pairs;
- preserve `r`, `s`, namespaced, hyphenated, and any other material attribute exactly;
- fail closed if an opening tag cannot be safely transformed under this narrow rule.

### BLOCK B — production final preservation validation is still incomplete

R1 added strong pre-write guards, but production still does not explicitly prove all authorized R1-C post-write invariants against prepared-before authority.

R2-C-R2 production must capture and verify after mutation/output:
- exact dimension unchanged;
- exact Print_Area unchanged;
- Part B merge inventory/count unchanged;
- Part B Rating Scale/padding topology unchanged;
- package entry inventory unchanged;
- every package entry other than `xl/worksheets/sheet1.xml` content-identical to prepared-before;
- exact target-cell inventory unchanged (no materialization/removal);
- target non-type opening-tag authority unchanged;
- caller input bytes content-identical;
- formula inventory zero and existing value/privacy validation preserved.

Browser-safe byte comparison is sufficient; no Node crypto dependency is authorized.

### BLOCK C — R1 test matrix remains materially under-proven

Despite test names saying “complete matrix”, the implementation remains spot-check-based in material areas.

Part A N4..N10 currently does NOT prove every concrete Profile-derived SAFE role, exact role counts 30..60, all optional absent roles, and every other effective sanitization address.

Part B N6/N7/N8 currently still spot-checks examples such as `K9`, `R31`, `B29`; it does NOT prove all self-rating targets, exact role counts 14/17/20, full Chief R:X blank authority, complete static presentation/padding/rating parity, summaries present/absent, and every nonwritten sensitive address.

### BLOCK D — fail-closed perturbation matrix is incomplete

R1 added several useful perturbations, but still lacks required coverage including at least:
- malformed Part B competency count;
- duplicate `_xlnm.Print_Area` inventory;
- wrong workbook main-sheet name/identity, not relationship target only;
- Part A forbidden drawing/relationship reference reappearance independent of orphan media;
- Part B actual merge inventory mismatch with declared count left unchanged;
- Part B protected padding row missing AND duplicate;
- Part B auxiliary `Sheet1` relationship/binding corruption;
- invalid objects/arrays/bigints and both `Infinity` / `-Infinity` in addition to boolean/NaN;
- blank/whitespace-only required b7/b8 presentation fail-closed behavior;
- caller immutability on representative Part B failures.

### BLOCK E — authorized-diff oracle is not independent enough

Current test normalizer parses/rebuilds target attributes using the same attribute-parser pattern as production. That can normalize away the same attribute-loss defect it is supposed to detect.

R2-C-R2 test proof must:
- compare target opening tags independently from production mutation logic;
- normalize ONLY `t` representation and value/body payload authorization;
- preserve/compare all other raw opening-tag bytes/attributes exactly;
- compare complete cell-address inventory before/after;
- perform complete sheet1 deep equality after only this narrow independent normalization;
- include at least one test sentinel attribute outside the current parser comfort zone (for example a valid namespaced and/or hyphenated material attribute) and prove it survives exactly.

### BLOCK F — privacy/canonical presentation proof needs N8 completeness

Current real projection privacy proof covers representative Part A and Part B N7, but closure must also prove N8 canonical `COMP_STRAT` presentation from frozen `MboExportService` and demonstrate raw alias fields cannot influence renderer output.

## 5. Exact next corrective proposal — D2-WP004-R2-C-R2

```text
PROPOSED_WORK_PACKAGE = D2-WP004-R2-C-R2
NAME = SECURED SEMANTIC RENDERER EXACT ATTRIBUTE + FULL MATRIX CLOSURE
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
existing Profile/Preparer/Feasibility/export tests = FROZEN
project-docs/* = FORBIDDEN TO EXECUTOR
package.json / package-lock.json = FORBIDDEN
UI / dist / integration = FORBIDDEN
Combined Excel parity = NOT AUTHORIZED
Kintone write/deploy/Live UAT = FORBIDDEN
D3 = HOLD
```

## 6. R2-C-R2 exact corrective contract

### R2-A — exact raw opening-tag preservation

Correct `mutateCellInSheetXml` (or equivalent) so target mutation:
- locates the exact target cell node by exact `r` identity;
- captures raw opening-tag text;
- does NOT parse/rebuild non-`t` attributes;
- removes/replaces/inserts only the exact cell `t` attribute required by string vs numeric representation;
- preserves all other raw opening-tag bytes/attribute values/order exactly;
- preserves `r`, `s`, namespaced and hyphenated attributes exactly;
- self-closing target may become paired only to carry authorized payload;
- existing paired target body may change only as authorized value payload;
- no absent target materialization; formula target fails closed.

Whitespace/XML/value policy from R1 remains unchanged.

### R2-B — exact production post-write preservation

Before returning, independently compare rendered authority to prepared-before and fail closed unless:
- package entry inventory unchanged;
- every non-sheet1 package entry exact byte-equal/content-equal;
- dimension and exact Print_Area unchanged;
- Part B merge/rating/padding topology unchanged;
- exact sheet1 cell address inventory unchanged;
- exact non-type target opening-tag authority unchanged;
- formulas zero;
- path-present values exact;
- optional/nonwritten sensitive targets blank;
- caller bytes content-identical;
- output NEW Uint8Array.

### R2-C — complete Profile-derived Part A test matrix

For each OWNER Part A N=4..10:
- construct the exact role-name set required by the frozen contract;
- require exact count `10 + 5*N`;
- resolve every address/path through Profile;
- independently resolve secured projection truth;
- assert every path-present target exact;
- assert every path-absent optional target blank;
- assert every effective sanitization address not in the actually-written set blank;
- formula/reference-image/input-immutability proof retained.

No fixed-cell sample substitute.

### R2-D — complete Profile-derived Part B test matrix

For OWNER Part B N=6/7/8:
- exact role counts 14/17/20;
- assert every Profile-derived self-rating target;
- summaries present exact and absent blank;
- b1..b6 static title/description exact prepared-before parity;
- b7/b8 canonical presentation exact;
- FULL Chief R:X effective authority blank;
- Rating Scale and padding exact prepared-before parity;
- complete final merge inventory unchanged;
- auxiliary `Sheet1` exact prepared-before parity;
- every nonwritten effective sanitization address blank;
- formulas/input immutability retained.

### R2-E — independent authorized-diff proof

Test helper MUST NOT share the production attribute parser/rebuilder strategy.

For representative count-aware variants including Part A and Part B expanded case:
- compare package inventory;
- non-sheet1 byte equality;
- compare exact before/after cell address inventories;
- for each target, compare raw opening tag after normalizing only authorized `t` difference;
- replace only target body/value payload with a neutral marker while preserving all other raw XML;
- complete sheet1 XML equality after that narrow normalization;
- inject sentinel non-type attributes (including namespaced/hyphenated valid forms) and prove exact survival.

### R2-F — complete fail-closed/privacy proof

Add all missing BLOCK D perturbations and preserve existing ones.

Real `MboExportService.projectCombinedExport()` privacy must cover:
- Employee-Self Part A + Part B;
- Approver Part A + Part B;
- N7 `COMP_LEAD` canonical presentation;
- N8 `COMP_STRAT` canonical presentation;
- conflicting raw `name/title/competencyName` aliases cannot alter secured renderer output;
- manager/GM/final/evaluator secret tokens absent package-wide where not SAFE.

## 7. Required runtime / regression gate if R2 later authorized

Focused:

`node --test tests/mbo-xlsx-semantic-renderer.test.js`

Required:

```text
FAIL = 0
SKIP = 0
OWNER Part A N4..N10 full Profile-derived matrix = PASS
OWNER Part B N6/N7/N8 full Profile-derived matrix = PASS
complete fail-closed perturbation matrix = PASS
independent authorized-diff exact-attribute proof = PASS
Employee-Self + Approver BOTH Parts = PASS
N7 + N8 canonical presentation / alias resistance = PASS
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

Before commit `git diff --name-only` must show ONLY the two authorized files.

If strict proof requires any frozen-file modification, executor must STOP. Do not weaken tests or broaden scope.

## 8. Owner decision

No executor is active. R2-C is NOT CLOSED.

Recommended approval phrase:

`อนุมัติ D2-WP004-R2-C-R2 SOURCE+TEST CORRECTIVE ตามขอบเขตที่เสนอ`
