# AI ACTIVE TASK — R2-C-R3 AUTHORIZED / ACTIVE

Mode: **CONTROL PLANE / BOUNDED EXECUTION AUTHORIZED / LOW-CREDIT / NO KINTONE / NO DEPLOY / D3 HOLD**
Branch: `ai/antigravity-wp002c`
Updated: 2026-09-04 ICT

Read `D2_REVIEW_FAST_START.md` first, then this file. This file is authoritative for the active R3 gate if fast-start still shows the immediately preceding proposal state. Read only exact R2-C renderer/test/Profile/export/preparer evidence required by this gate. Do not reopen closed R2-B1/R2-B2 without proven regression.

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

ACTIVE_WORK_PACKAGE = D2-WP004-R2-C-R3
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP004-R2-C-R3-SOURCE-TEST-CORRECTIVE-20260904-01
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP004-R2-C-R3-SOURCE-TEST-CORRECTIVE-20260904-01
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = D2-WP004-R2-C-R3-SOURCE-TEST-CORRECTIVE-20260904-01
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE

ANTIGRAVITY = BOUNDED / ONE-SHOT / MAX 1 COMMIT
CLAUDE = STOP
R2_B1_PRODUCTION_SOURCE = PASS / FROZEN
R2_B2_PRODUCTION_SOURCE = PASS / FROZEN
R2_B2_TEST_PROOF = PASS / FROZEN
R2_B2_RUNTIME_PROOF = PASS
R2-C-R3 = AUTHORIZED / ACTIVE
COMBINED_EXCEL_PARITY = NOT AUTHORIZED / LATER D2 GATE
D3 = HOLD
```

## 2. R2-C-R3 authorization identity

```text
WORK_PACKAGE = D2-WP004-R2-C-R3
NAME = SECURED SEMANTIC RENDERER UNPREFIXED-ATTRIBUTE + EXACT-TRUTH CLOSURE
STATE = AUTHORIZED / ACTIVE
MODE = SOURCE+TEST CORRECTIVE / BOUNDED / ONE-SHOT / LOW-CREDIT
MAX_EXECUTOR_COMMITS = 1
AUTHORIZATION_BASIS_HEAD = 86834f0c1b51cd6694dfa0e34817f6394f67f7f7
AUTHORIZATION_TOKEN = D2-WP004-R2-C-R3-SOURCE-TEST-CORRECTIVE-20260904-01
```

Owner authorization:

`อนุมัติ D2-WP004-R2-C-R3 SOURCE+TEST CORRECTIVE ตามขอบเขตที่เสนอ`

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

## 4. Accepted R2 behavior — MUST PRESERVE

Do not weaken:
- direct browser-safe `JSZip` raw OOXML package mutation;
- secured projection only, frozen Profile-derived semantic roles/paths;
- exact prepared-buffer main-sheet / Print_Area / dimension / target-exactly-once guards;
- Part A reference-image removal guard;
- Part B merge / Rating Scale / padding / auxiliary-sheet guards;
- non-sheet1 package byte comparison;
- caller-byte content immutability;
- whitespace preservation with `xml:space="preserve"` where required;
- no formulas, no score reconstruction, no raw Kintone access;
- N7 `COMP_LEAD` and N8 `COMP_STRAT` canonical presentation + alias-resistance privacy proof.

## 5. R2-C-R3 exact corrective contract

### R3-A — exact unprefixed cell-attribute handling

Correct production target matching/mutation so:
- target identity is ONLY the exact unprefixed XML attribute `r="ADDRESS"`;
- only the exact unprefixed XML attribute `t="..."` may be inserted/replaced/removed;
- `custom:r`, `custom:t`, `prefix:r`, `prefix:t`, `data-r`, `data-t` and similar attributes MUST NOT be interpreted as cell `r`/`t`;
- all other raw opening-tag bytes, values and attribute ordering are preserved exactly;
- missing or duplicate exact unprefixed target cell => fail closed;
- formula target => fail closed;
- browser-safe only; no Node-only production dependency.

### R3-B — complete production prepared-before preservation

Before return prove:
- package inventory unchanged;
- every non-sheet1 entry byte/content-equal to prepared-before;
- exact cell-address inventory unchanged;
- complete `sheet1.xml` equals prepared-before after normalizing ONLY authorized target body and exact unprefixed cell `t` representation;
- namespaced/hyphenated/lookalike attributes are never normalized away;
- existing formula/value/privacy/caller-immutability checks remain.

### R3-C — exact Part A truth matrix

For every exact OWNER Part A N=4..10:
- exact Profile-derived role count = `10 + 5*N` => 30/35/40/45/50/55/60;
- independently resolve every `projectionPath` in TEST code;
- every path-present target equals exact secured projection scalar (numbers numeric, strings exact);
- run a second projection per N with optional average scores and Part A summaries omitted;
- prove EVERY omitted optional role remains blank;
- every effective sanitization address outside actually written target set remains blank;
- formula/reference-image/input-immutability proof retained.

Expected truth must never derive from renderer output.

### R3-D — exact Part B truth/static matrix

For exact OWNER Part B N=6/7/8:
- exact Profile-derived role counts = 14/17/20;
- independently resolve every `projectionPath` in TEST code;
- all self-ratings exact;
- both summaries exact when present and blank when omitted;
- b7/b8 canonical presentation exact;
- every nonwritten effective sensitive address blank;
- FULL Chief R:X authority blank;
- b1..b6 static title/description exact prepared-before parity;
- every Rating Scale static range exact prepared-before parity;
- every protected padding row exact prepared-before row/cell/type/value/payload parity;
- complete merge inventory exact prepared-before parity;
- auxiliary `xl/worksheets/sheet2.xml` byte/content parity;
- formulas/input immutability retained.

### R3-E — independent collision-proof authorized-diff oracle

TEST must inject on a writable target, while preserving real unprefixed `r` and where applicable unprefixed `t`:

```text
custom:t="KEEP_CUSTOM_T"
custom:r="KEEP_CUSTOM_R"
data-t="KEEP_DATA_T"
data-r="KEEP_DATA_R"
```

Require:
- all four sentinels survive byte-for-byte;
- test oracle is independent of production mutation logic;
- oracle normalizes ONLY exact unprefixed cell `t` and authorized target body;
- complete remaining `sheet1.xml` equality;
- exact cell inventory unchanged;
- non-sheet1 byte equality.

### R3-F — XML 1.0 exact string validity

Fail closed for XML 1.0-invalid strings including:
- forbidden C0 controls already covered;
- lone high surrogate;
- lone low surrogate;
- U+FFFE;
- U+FFFF.

Prove valid Thai/Unicode and at least one valid supplementary-plane character survive exactly.

## 6. Runtime / regression gate

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
- read this exact R3 contract;
- no broad exploration / no Git delivery rediscovery.

Before commit run `git diff --name-only`. It MUST show ONLY:

```text
src/services/mbo-xlsx-semantic-renderer.js
tests/mbo-xlsx-semantic-renderer.test.js
```

If strict proof requires any frozen-file change: STOP. Do not weaken tests. Do not broaden scope.

If all required checks pass:
1. create EXACTLY ONE SOURCE+TEST corrective commit;
2. suggested message: `fix(d2): close unprefixed attributes and exact truth (R2-C-R3)`;
3. push `ai/antigravity-wp002c`;
4. report pushed SHA, exact changed files, focused PASS/FAIL/SKIP, Part A/Part B matrices, collision proof, privacy/canonical proof, XML proof, regression result, `node --check`, and `git diff --check`;
5. STOP.

Do NOT modify `project-docs/*`.
Do NOT self-declare R2-C PASS/CLOSED.
Do NOT start Combined Excel.
Do NOT perform Kintone writes/deploy/Live UAT.
Do NOT start D3.

Final executor state after successful push:

`R2-C-R3 SOURCE+TEST CORRECTIVE COMPLETE / AWAITING CHATGPT INDEPENDENT REVIEW`
