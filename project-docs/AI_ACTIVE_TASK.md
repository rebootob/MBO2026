# AI ACTIVE TASK — R2-C-R4 AUTHORIZED / ACTIVE

Mode: **CONTROL PLANE / BOUNDED EXECUTION AUTHORIZED / LOW-CREDIT / NO KINTONE / NO DEPLOY / D3 HOLD**
Branch: `ai/antigravity-wp002c`
Updated: 2026-09-04 ICT

Read `D2_REVIEW_FAST_START.md` first, then this file. This file is authoritative for the active R4 gate if fast-start still shows the immediately preceding proposal state. Read only exact R2-C renderer/test/Profile/export/preparer evidence required by this gate. Do not reopen closed R2-B1/R2-B2 without proven regression.

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
R2_C_R3_IMPLEMENTATION = 0ee456e1a78de982ba6b14c1f42f9747e40cc4e9
R2_C_R3_SOURCE = PARTIAL PASS / RAW-BYTE PRESERVATION GAP REMAINS
R2_C_R3_TEST_PROOF = PARTIAL PASS / PART B COMPLETE PARITY GAPS REMAIN

ACTIVE_WORK_PACKAGE = D2-WP004-R2-C-R4
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP004-R2-C-R4-SOURCE-TEST-CORRECTIVE-20260904-01
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP004-R2-C-R4-SOURCE-TEST-CORRECTIVE-20260904-01
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = D2-WP004-R2-C-R4-SOURCE-TEST-CORRECTIVE-20260904-01
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE

ANTIGRAVITY = BOUNDED / ONE-SHOT / MAX 1 COMMIT
CLAUDE = STOP
R2_B1_PRODUCTION_SOURCE = PASS / FROZEN
R2_B2_PRODUCTION_SOURCE = PASS / FROZEN
R2_B2_TEST_PROOF = PASS / FROZEN
R2_B2_RUNTIME_PROOF = PASS
R2-C-R4 = AUTHORIZED / ACTIVE
COMBINED_EXCEL_PARITY = NOT AUTHORIZED / LATER D2 GATE
D3 = HOLD
```

## 2. R2-C-R4 authorization identity

```text
WORK_PACKAGE = D2-WP004-R2-C-R4
NAME = SECURED SEMANTIC RENDERER RAW-BYTE PRESERVATION + PART B COMPLETE PARITY CLOSURE
STATE = AUTHORIZED / ACTIVE
MODE = SOURCE+TEST CORRECTIVE / BOUNDED / ONE-SHOT / LOW-CREDIT
MAX_EXECUTOR_COMMITS = 1
AUTHORIZATION_BASIS_HEAD = 9eef261a0d5b44d7a01be8529a326ae71b9871ee
AUTHORIZATION_TOKEN = D2-WP004-R2-C-R4-SOURCE-TEST-CORRECTIVE-20260904-01
```

Owner authorization:

`อนุมัติ D2-WP004-R2-C-R4 SOURCE+TEST CORRECTIVE ตามขอบเขตที่เสนอ`

The token is single-use and is consumed when executor pushes the one authorized implementation commit or stops after beginning execution due to a contract blocker.

## 3. Writable scope

Writable ONLY:

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

## 4. Accepted R3 behavior — MUST PRESERVE

Do not weaken:
- exact unprefixed `r` / `t` identity and `custom:r/custom:t/data-r/data-t` collision resistance;
- browser-safe direct `JSZip` raw OOXML package mutation;
- secured projection only and frozen Profile-derived semantic roles/paths;
- exact prepared-buffer main-sheet / Print_Area / dimension / target-exactly-once guards;
- Part A reference-image removal guard;
- Part B merge / Rating Scale / padding / auxiliary-sheet guards;
- non-sheet1 package byte comparison and caller-byte immutability;
- Part A N4..N10 exact path-present truth + optional omission proof;
- Part B N6/N7/N8 exact path-present truth;
- protected padding exact row XML parity and auxiliary `sheet2.xml` byte parity;
- whitespace preservation with `xml:space="preserve"`;
- XML 1.0 C0/lone-surrogate/U+FFFE/U+FFFF rejection and valid Thai/supplementary Unicode;
- no formulas, no score reconstruction, no raw Kintone access;
- Employee-Self / Approver privacy and N7 `COMP_LEAD` + N8 `COMP_STRAT` canonical presentation / alias resistance.

## 5. R2-C-R4 exact corrective contract

### R4-A — raw-byte exact target mutation

Correct production mutation so:
- exact unprefixed `r="ADDRESS"` is the only target identity;
- exact unprefixed `t` is the only opening-tag attribute allowed to change;
- no `.trim()`, `.trimEnd()` or general opening-tag reconstruction;
- existing non-`t` opening-tag bytes, whitespace, order and values remain byte-identical;
- `custom:r/custom:t/data-r/data-t` and other lookalikes remain byte-identical;
- missing/duplicate target or formula => fail closed;
- when exact unprefixed `t` exists, replace/remove only that exact token without changing surrounding unauthorized bytes;
- when exact unprefixed `t` does not exist, insert only the minimum authorized ` t="..."` immediately before the original closing delimiter;
- self-closing-to-paired conversion is limited to the exact authorized cell payload operation.

### R4-B — production complete prepared-before sheet equality

Before return fail closed unless:
- package entry inventory unchanged;
- every non-sheet1 package entry byte-equal;
- exact cell-address inventory unchanged;
- complete rendered `sheet1.xml` equals prepared-before after a production normalization that neutralizes ONLY:
  1. exact authorized target body/value payload;
  2. exact unprefixed target `t` representation.
- no other byte, whitespace, static cell, merge, dimension, row, padding, Rating Scale or non-target XML may differ;
- production normalizer MUST NOT use `.trim()` or normalize namespaced/hyphenated/lookalike attributes;
- existing exact value/privacy/formula/caller-immutability checks remain.

### R4-C — independent raw-byte authorized-diff test

Inject on an actual writable target:
- `custom:t="KEEP_CUSTOM_T"`
- `custom:r="KEEP_CUSTOM_R"`
- `data-t="KEEP_DATA_T"`
- `data-r="KEEP_DATA_R"`
- deliberate multiple spaces, tab and/or newline between non-authorized attributes.

The independent TEST oracle must:
- be implemented independently from production normalizer logic;
- normalize only the authorized body and exact unprefixed `t`;
- never use `.trim()` / `.trimEnd()` on opening-tag authority;
- preserve all other whitespace/attribute bytes;
- require complete normalized `sheet1.xml` equality;
- require exact cell inventory and non-sheet1 byte equality.

### R4-D — exact Part A scalar truth finalization

For OWNER Part A N4..N10 preserve the accepted full role/path matrix and optional omission proof, but assert:
- secured string expected => decoded value type is `string` and value is exactly equal with no coercion;
- secured numeric expected => decoded value type is `number`, finite, and exactly equal;
- omitted optional average-score + Part A summary values remain blank;
- every effective sanitization address outside actually-written target set remains blank;
- formulas zero, reference image absent and input immutable.

### R4-E — complete Part B closure matrix

For OWNER Part B N6/N7/N8, run BOTH full-summary and summary-omitted projections.

For every N prove:
- exact 14/17/20 Profile-derived role sets;
- every path-present target exact type + value from independently resolved projectionPath truth;
- both summary cells exact when present;
- both summary cells blank when omitted;
- every effective sanitization address outside the actually-written set blank;
- FULL Chief R:X blank;
- b7/b8 canonical presentation exact where applicable;
- b1..b6 complete static title/description authority exact prepared-before parity, not representative spot checks;
- every Rating Scale static range exact prepared-before cell/value/XML parity across the complete range, not start-cell only;
- every protected padding row exact prepared-before XML parity;
- complete merge inventory equals prepared-before as sorted exact refs, not count only;
- `sheet2.xml` byte-equal;
- formulas zero and input immutable.

The complete normalized-sheet equality proof may serve as the stronger package-level preservation proof, but explicit Part B assertions above MUST still exist for diagnosable failures.

### R4-F — no proof weakening / closure behavior

- Do not remove or weaken any accepted R1/R2/R3 fail-closed, privacy, alias-resistance, XML-validity or prepared-buffer tests.
- Expected truth may derive only from exact OWNER template, prepared-before bytes, frozen Profile, secured projection and frozen `MboExportService.projectCombinedExport()` in TEST code where already authorized.
- Never use renderer output as expected oracle.
- If strict proof exposes a frozen-file defect, STOP; do not modify frozen files and do not weaken tests.

## 6. Runtime / regression gate

Focused:

`node --test tests/mbo-xlsx-semantic-renderer.test.js`

Required:

```text
FAIL = 0
SKIP = 0
Part A N4..N10 exact typed truth + omission matrix = PASS
Part B N6/N7/N8 exact typed truth + summary omission + complete static parity = PASS
raw-byte spacing + custom:r/custom:t/data-r/data-t sentinel = PASS
independent complete sheet1 authorized-diff = PASS
production complete sheet1 prepared-before preservation = PASS
Employee-Self + Approver both Parts = PASS
N7 + N8 canonical / alias resistance = PASS
XML 1.0 validity + whitespace/Unicode = PASS
formula inventory = 0
```

Frozen regression bundle:

`node --test tests/mbo-xlsx-template-profile.test.js tests/mbo-xlsx-template-preparer.test.js tests/mbo-xlsx-template-preparer-part-b.test.js tests/mbo-export-service.test.js`

Required: `FAIL = 0`.

Also run:

```text
node --check src/services/mbo-xlsx-semantic-renderer.js
git diff --check
```

All must PASS.

## 7. Executor protocol

Before modification:
- fresh-fetch canonical branch;
- HEAD must equal the authorization commit generated by this control update;
- verify this exact token;
- read this exact R4 contract;
- no broad exploration / no Git delivery rediscovery.

Before commit run `git diff --name-only`. It MUST show ONLY:

```text
src/services/mbo-xlsx-semantic-renderer.js
tests/mbo-xlsx-semantic-renderer.test.js
```

If strict proof requires any frozen-file change: STOP. Do not weaken tests. Do not broaden scope.

If all required checks pass:
1. create EXACTLY ONE SOURCE+TEST corrective commit;
2. suggested message: `fix(d2): close raw-byte preservation and Part B parity (R2-C-R4)`;
3. push `ai/antigravity-wp002c`;
4. report pushed SHA, exact changed files, focused PASS/FAIL/SKIP, Part A typed matrix, Part B complete matrix, raw-byte sentinel proof, production/independent sheet1 preservation proof, privacy/canonical proof, XML proof, regression result, `node --check`, and `git diff --check`;
5. STOP.

Do NOT modify `project-docs/*`.
Do NOT self-declare R2-C PASS/CLOSED.
Do NOT start Combined Excel.
Do NOT perform Kintone writes/deploy/Live UAT.
Do NOT start D3.

Final executor state after successful push:

`R2-C-R4 SOURCE+TEST CORRECTIVE COMPLETE / AWAITING CHATGPT INDEPENDENT REVIEW`
