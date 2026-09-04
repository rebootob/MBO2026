# AI ACTIVE TASK — R2-C-R2 REVIEWED / NOT CLOSED / R2-C-R3 EXACT CORRECTIVE PROPOSAL READY

Mode: **CONTROL PLANE / NO ACTIVE EXECUTOR / LOW-CREDIT / NO KINTONE / NO DEPLOY / D3 HOLD**
Branch: `ai/antigravity-wp002c`
Updated: 2026-09-04 ICT

Read `D2_REVIEW_FAST_START.md` first, then this file, then only exact R2-C renderer/test/Profile/export/preparer evidence required by the current gate. Do not reopen closed R2-B1/R2-B2 without proven regression.

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
R2_C_R2_IMPLEMENTATION = cdc68c35f7b110bf3a80ed6026b1d14ed89ffd52
R2_C_R2_SOURCE = PARTIAL PASS / ONE MATERIAL ATTRIBUTE-IDENTITY DEFECT REMAINS
R2_C_R2_TEST_PROOF = PARTIAL / EXACT-TRUTH + PARITY GAPS REMAIN
R2_C_R2_RUNTIME_REPOSITORY_SIGNAL = UNAVAILABLE / NO STATUS / NO WORKFLOW RUN

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
R2-C-R3 = EXACT CORRECTIVE PROPOSAL READY / NOT AUTHORIZED
COMBINED_EXCEL_PARITY = NOT AUTHORIZED / LATER D2 GATE
D3 = HOLD
```

## 2. R2-C-R2 review identity

```text
R2_C_R2_AUTHORIZATION_HEAD = 4b7fd8a3bb203f0e69249f4dcb3de741058cf490
R2_C_R2_AUTHORIZATION_TOKEN = D2-WP004-R2-C-R2-SOURCE-TEST-CORRECTIVE-20260903-01
R2_C_R2_IMPLEMENTATION = cdc68c35f7b110bf3a80ed6026b1d14ed89ffd52
AUTH_TO_IMPLEMENTATION = EXACTLY ONE COMMIT
IMPLEMENTATION_MESSAGE = fix(d2): close exact renderer attributes and full matrix (R2-C-R2)
CHANGED_FILES =
  src/services/mbo-xlsx-semantic-renderer.js
  tests/mbo-xlsx-semantic-renderer.test.js
OUT_OF_SCOPE_CHANGE = NONE
```

The R2 token is consumed. No further change is authorized by it.

## 3. Accepted R2 improvements — MUST PRESERVE

Independent review accepts these R2 improvements:

- renderer now uses direct `JSZip` package mutation rather than worksheet-wide serialization;
- raw target opening-tag text is retained instead of rebuilding all attributes from parsed key/value pairs;
- pre-write exact main-sheet / Print_Area / dimension / target-exactly-once / Part A image / Part B merge-rating-padding-aux guards remain;
- non-sheet1 package entries are post-write byte-compared;
- sheet1 cell-address inventory is post-write compared;
- target non-type opening-tag authority is post-write compared;
- caller bytes remain content-immutable;
- whitespace/XML preservation behavior remains;
- fail-closed suite now covers many previously missing malformed Part B / Print_Area / sheet-name / relationship / merge / padding / scalar cases;
- Part A and Part B tests now build complete Profile-derived role-name sets and check exact role counts;
- real privacy proof now exercises N8 canonical `COMP_STRAT` together with N7 `COMP_LEAD` and conflicting alias fields.

These improvements are partial PASS only. R2-C remains NOT CLOSED.

## 4. Independent blockers after R2

### BLOCK A — exact unprefixed `t` / `r` identity is still not safe

Production now preserves raw attributes generally, but its narrow regex uses word-boundary forms such as `\bt="..."` and `\br="..."`.

A word boundary also exists after a namespace colon. Therefore valid attributes such as:

```text
custom:t="KEEP"
custom:r="KEEP"
```

can collide with logic intended only for the cell's **unprefixed** `t` / `r` attributes. This violates the R2 requirement that namespaced attributes survive exactly.

R3 must:
- identify cell address only from the exact unprefixed `r` attribute;
- modify/remove/replace only the exact unprefixed cell `t` attribute;
- never match or change `prefix:r`, `prefix:t`, `data-r`, `data-t` or similar attributes;
- preserve all non-target attributes byte-for-byte and in order;
- use browser-safe logic without Node-only dependencies.

### BLOCK B — authorized-diff oracle can still hide the same `custom:t` defect

The R2 test normalizer also removes `t` using a word-boundary pattern similar to production. Its sentinel uses `custom:sentinel` and `data-hyphenated`, but not a collision-prone `custom:t` / `custom:r` case.

R3 test proof must be independent and must inject at least:

```text
custom:t="KEEP_CUSTOM_T"
custom:r="KEEP_CUSTOM_R"
data-t="KEEP_DATA_T"
data-r="KEEP_DATA_R"
```

on a writable target while retaining the real unprefixed `r` and, where appropriate, unprefixed `t`.

After render all sentinel attributes must survive exactly and the oracle must normalize only the unprefixed cell `t` representation and authorized body payload.

### BLOCK C — Part A “full matrix” still does not prove exact projection truth

R2 builds the complete Profile-derived role set and correct 30..60 role counts, but for each role it only proves the target is nonblank.

R3 must independently resolve each `projectionPath` in TEST code and assert:
- every path-present target equals the exact secured projection scalar;
- numeric values compare numerically and strings exactly;
- every path-absent optional target is blank;
- include a second projection per N with optional average scores / summaries omitted so **all** optional paths are checked, not one sample cell;
- every effective sanitization address outside the actually-written target set remains blank.

Expected truth must never come from renderer output.

### BLOCK D — Part B “full matrix” still lacks exact truth / absent-summary / static parity closure

R2 builds exact 14/17/20 role sets, but again checks role targets mainly for nonblank presence.

R3 must prove for N=6/7/8:
- every Profile-derived target equals exact secured `projectionPath` truth;
- all self-rating targets exact;
- both summary targets exact when present;
- both summary targets blank when omitted;
- b7/b8 canonical presentation exact;
- all effective nonwritten sensitive addresses blank;
- FULL Chief R:X blank;
- b1..b6 static presentation exact prepared-before parity;
- every Rating Scale static range exact prepared-before parity, not only the start-cell label;
- every protected padding row exact prepared-before row/cell/value/payload parity;
- complete merge inventory exact prepared-before parity;
- auxiliary `Sheet1` (`sheet2.xml`) byte/content parity with prepared-before.

### BLOCK E — production post-write preservation should close with complete prepared-before sheet authority

Current post-write checks are strong but split across inventory/open-tag/value checks. R3 should add a narrow production preservation comparison over `sheet1.xml`:
- normalize only exact authorized target unprefixed `t` representation + target value body;
- compare the complete remaining rendered `sheet1.xml` against prepared-before;
- this directly proves dimension, merges, row/padding/rating/static/non-target XML remain unchanged;
- the production normalizer must itself obey exact unprefixed attribute identity and must not normalize namespaced `*:t` attributes.

The independent TEST oracle must be implemented separately and must not copy the production normalizer strategy blindly.

### BLOCK F — XML validity boundary needs exact XML 1.0 character proof

Existing validation covers C0 controls but not every XML 1.0-invalid JavaScript string, such as lone surrogate code units and noncharacters U+FFFE/U+FFFF.

R3 production/test should fail closed for XML 1.0-invalid scalar strings while preserving valid Thai/Unicode/supplementary characters.

## 5. Exact next corrective proposal — D2-WP004-R2-C-R3

```text
PROPOSED_WORK_PACKAGE = D2-WP004-R2-C-R3
NAME = SECURED SEMANTIC RENDERER UNPREFIXED-ATTRIBUTE + EXACT-TRUTH CLOSURE
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

## 6. R2-C-R3 exact corrective contract

### R3-A — exact unprefixed cell-attribute handling

Correct production target matching/mutation so:
- target identity is the exact unprefixed XML attribute `r="ADDRESS"` only;
- only the exact unprefixed XML attribute `t="..."` may be inserted/replaced/removed;
- namespace-prefixed or hyphenated lookalikes are never interpreted as cell `r`/`t`;
- all other raw opening-tag bytes, attribute values and ordering are preserved exactly;
- missing or duplicate exact unprefixed target cell => fail closed;
- formula target => fail closed.

### R3-B — complete production prepared-before preservation

Before return:
- package inventory unchanged;
- non-sheet1 entries byte-equal;
- cell inventory unchanged;
- complete `sheet1.xml` equals prepared-before after normalizing ONLY authorized target body plus exact unprefixed cell `t` representation;
- namespaced/hyphenated sentinel-like attributes are never normalized away;
- existing formula/value/privacy/caller-immutability validation remains.

### R3-C — exact Part A truth matrix

For every OWNER Part A N=4..10:
- exact 30..60 role set from Profile;
- independently resolve every `projectionPath` in test code;
- exact value equality for every path-present role;
- run optional-omission projection and prove all absent averageScore + Part A summary paths blank;
- every other effective sanitization address blank;
- formula/reference-image/input-immutability retained.

### R3-D — exact Part B truth/static matrix

For OWNER Part B N=6/7/8:
- exact 14/17/20 role sets;
- independent exact `projectionPath` value equality for all roles;
- summaries present exact + omitted blank;
- b7/b8 canonical exact;
- full nonwritten/Chief R:X blank;
- b1..b6 static presentation prepared-before parity;
- complete Rating Scale static range parity;
- complete protected padding row/cell/value/payload parity;
- exact final merge inventory parity;
- auxiliary `sheet2.xml` byte/content parity;
- formulas/input immutability retained.

### R3-E — independent collision-proof authorized-diff oracle

Test must inject collision-prone sentinels on a writable target:

```text
custom:t="KEEP_CUSTOM_T"
custom:r="KEEP_CUSTOM_R"
data-t="KEEP_DATA_T"
data-r="KEEP_DATA_R"
```

Requirements:
- real unprefixed `r` remains the target identity;
- all sentinel attrs survive byte-for-byte;
- test oracle strips/normalizes only the exact unprefixed cell `t` attribute and target body;
- complete sheet1 equality after narrow normalization;
- cell inventory unchanged;
- non-sheet1 byte equality.

### R3-F — XML 1.0 exact string validity

Fail closed for XML 1.0-invalid strings including:
- forbidden C0 controls already covered;
- lone high surrogate;
- lone low surrogate;
- U+FFFE;
- U+FFFF.

Prove valid Thai/Unicode and a valid supplementary-plane character survive exactly.

## 7. Runtime / regression gate if R3 is later authorized

Focused:

`node --test tests/mbo-xlsx-semantic-renderer.test.js`

Required:

```text
FAIL = 0
SKIP = 0
OWNER Part A N4..N10 exact Profile/projection truth matrix = PASS
OWNER Part B N6/N7/N8 exact Profile/projection truth + static matrix = PASS
unprefixed r/t collision sentinels = PASS
independent full sheet1 authorized-diff = PASS
Employee-Self + Approver BOTH Parts = PASS
N7 + N8 canonical / alias resistance = PASS
XML 1.0 validity + whitespace/Unicode = PASS
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

Before commit, `git diff --name-only` must show ONLY the two authorized files.

If strict proof requires any frozen-file modification, executor must STOP. Do not weaken tests or broaden scope.

## 8. Owner decision

No executor is active. R2-C remains NOT CLOSED.

Recommended approval phrase:

`อนุมัติ D2-WP004-R2-C-R3 SOURCE+TEST CORRECTIVE ตามขอบเขตที่เสนอ`
