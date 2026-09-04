# AI ACTIVE TASK — R2-C-R5 AUTHORIZED / ACTIVE

Mode: **CONTROL PLANE / BOUNDED EXECUTION AUTHORIZED / LOW-CREDIT / NO KINTONE / NO DEPLOY / D3 HOLD**
Branch: `ai/antigravity-wp002c`
Updated: 2026-09-04 ICT

Read `D2_REVIEW_FAST_START.md` first, then this file. This file is authoritative for the active R5 gate if fast-start still shows the immediately preceding proposal state. Read only exact R2-C renderer/test/Profile/export/preparer evidence required by this gate. Do not reopen closed R2-B1/R2-B2 without proven regression.

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
R2_C_R4_IMPLEMENTATION = 721413335a7fba56dedd1cc4bcf2265e9ee0d849
R2_C_R4_SOURCE = PARTIAL PASS / EXACT T-TOKEN WHITESPACE DEFECT REMAINS
R2_C_R4_TEST_PROOF = PARTIAL PASS / ORACLE + PART-B NONWRITTEN/RATING XML GAPS REMAIN
R2_C_R4_RUNTIME_REPOSITORY_SIGNAL = UNAVAILABLE / NO STATUS / NO WORKFLOW RUN

ACTIVE_WORK_PACKAGE = D2-WP004-R2-C-R5
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP004-R2-C-R5-SOURCE-TEST-CORRECTIVE-20260904-01
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP004-R2-C-R5-SOURCE-TEST-CORRECTIVE-20260904-01
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = D2-WP004-R2-C-R5-SOURCE-TEST-CORRECTIVE-20260904-01
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE

ANTIGRAVITY = BOUNDED / ONE-SHOT / MAX 1 COMMIT
CLAUDE = STOP
R2_B1_PRODUCTION_SOURCE = PASS / FROZEN
R2_B2_PRODUCTION_SOURCE = PASS / FROZEN
R2_B2_TEST_PROOF = PASS / FROZEN
R2_B2_RUNTIME_PROOF = PASS
R2-C-R5 = AUTHORIZED / ACTIVE
COMBINED_EXCEL_PARITY = NOT AUTHORIZED / LATER D2 GATE
D3 = HOLD
```

## 2. R2-C-R5 authorization identity

```text
WORK_PACKAGE = D2-WP004-R2-C-R5
NAME = SECURED SEMANTIC RENDERER EXACT T-TOKEN + INDEPENDENT BYTE-ORACLE CLOSURE
STATE = AUTHORIZED / ACTIVE
MODE = SOURCE+TEST CORRECTIVE / BOUNDED / ONE-SHOT / LOW-CREDIT
MAX_EXECUTOR_COMMITS = 1
AUTHORIZATION_BASIS_HEAD = e1c40f4934b01685bb516c6e87edd2cfb577d628
AUTHORIZATION_TOKEN = D2-WP004-R2-C-R5-SOURCE-TEST-CORRECTIVE-20260904-01
```

Owner authorization:

`อนุมัติ D2-WP004-R2-C-R5 SOURCE+TEST CORRECTIVE ตามขอบเขตที่เสนอ`

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

## 4. Accepted R4 behavior — MUST PRESERVE

Do not weaken:
- exact unprefixed `r` / `t` identity and `custom:r/custom:t/data-r/data-t` collision resistance;
- browser-safe direct `JSZip` raw OOXML package mutation;
- secured projection only and frozen Profile-derived semantic roles/paths;
- exact prepared-buffer main-sheet / Print_Area / dimension / target-exactly-once guards;
- Part A reference-image removal guard;
- Part B merge / Rating Scale / padding / auxiliary-sheet guards;
- non-sheet1 package byte comparison and caller-byte immutability;
- Part A N4..N10 strict typed exact path truth + optional omission proof;
- Part B N6/N7/N8 strict typed exact path truth + summary omission;
- b1..b6 static presentation parity, protected-padding XML parity, sorted merge-ref parity and `sheet2.xml` byte parity;
- whitespace preservation with `xml:space="preserve"`;
- XML 1.0 C0/lone-surrogate/U+FFFE/U+FFFF rejection and valid Thai/supplementary Unicode;
- no formulas, no score reconstruction, no raw Kintone access;
- Employee-Self / Approver privacy and N7 `COMP_LEAD` + N8 `COMP_STRAT` canonical presentation / alias resistance.

R4 remains partial PASS only. R2-C remains NOT CLOSED.

## 5. R2-C-R5 exact corrective contract

### R5-A — exact `t` token splice

Production mutation must:
- identify target only by exact unprefixed `r="ADDRESS"`;
- replace exact unprefixed `t="old"` with `t="inlineStr"` byte-for-byte in place;
- remove exact unprefixed `t="old"` by deleting ONLY those token characters and preserving all preceding/following whitespace bytes exactly;
- when no unprefixed `t` exists and string type is needed, insert only the authorized minimum separator + `t="inlineStr"` immediately before the original closing delimiter;
- never use `\s*` as part of deletion of existing `t`;
- never trim/rebuild/canonicalize other opening-tag bytes;
- retain all R1-R4 exact-target/formula/missing/duplicate/collision protections.

### R5-B — source-aware production full-sheet preservation

Before return fail closed unless complete `sheet1.xml` equals prepared-before after neutralizing ONLY authorized differences.

Normalization must use prepared-before target authority:
- source target has exact unprefixed `t`: mask/replace only the exact token text on before+after while preserving every surrounding byte;
- source target lacks `t`: remove only the exact renderer-authorized inserted separator+`t="..."` sequence from rendered side for comparison; do not consume any pre-existing whitespace;
- neutralize only the authorized target body/value payload;
- preserve all other raw bytes, including delimiter spacing;
- no `.trim()`, `.trimEnd()`, `\s*` delimiter canonicalization or lookalike normalization;
- retain exact package inventory, non-sheet1 byte equality, cell inventory, value/privacy/formula/caller-immutability guards.

### R5-C — truly independent whitespace-sensitive test oracle

TEST must keep the R4 sentinel target with:
- `custom:r/custom:t/data-r/data-t`;
- multiple spaces;
- tab;
- newline;
- explicit whitespace immediately after the real unprefixed `t` token before another attribute or closing delimiter.

Implement an oracle separately from production helpers. It must:
- derive before/after target-node boundaries independently;
- mask exact authorized body payload only;
- mask only the exact unprefixed `t` token or the exact known inserted sequence;
- compare every other byte exactly;
- explicitly assert pre-existing separator bytes immediately after `t` survive;
- not reuse production normalizer helper/regex strategy;
- not trim or canonicalize delimiters.

### R5-D — complete Part B nonwritten + Rating Scale XML closure

For BOTH full-summary and summary-omitted variants at N=6/7/8:
- derive actually-written addresses from Profile role/projectionPath presence;
- iterate EVERY address in `effectiveSanitizationRanges`;
- every address outside the actually-written set must decode blank;
- retain FULL Chief R:X blank proof;
- for EVERY address in EVERY `ratingScaleStaticRange`, compare exact raw prepared-before vs rendered-after cell-node XML plus decoded value/type parity;
- no string coercion in expected-value comparison;
- retain complete b1..b6 static, protected-padding row XML, sorted exact merge inventory, `sheet2.xml` byte parity, formula-zero and input-immutability proof.

### R5-E — preserve all accepted proof

Do not weaken:
- Part A typed truth/omission;
- Part B typed truth/summary omission;
- privacy;
- N7/N8 canonical alias resistance;
- XML 1.0 validity;
- package parity;
- target uniqueness;
- formula-zero;
- caller-byte immutability;
- all existing fail-closed perturbation proof.

Expected truth may derive only from exact OWNER template, prepared-before bytes, frozen Profile, secured projection and frozen `MboExportService.projectCombinedExport()` in TEST code where already authorized. Never derive expected truth from renderer output.

If strict proof requires a frozen-file change: STOP. Do not weaken tests or broaden scope.

## 6. Runtime / regression gate

Focused:

`node --test tests/mbo-xlsx-semantic-renderer.test.js`

Required:

```text
FAIL = 0
SKIP = 0
exact t-token whitespace preservation = PASS
production source-aware complete sheet1 equality = PASS
independent byte oracle with post-t whitespace sentinel = PASS
Part A N4..N10 exact typed truth + omission = PASS
Part B N6/N7/N8 full + omitted complete nonwritten blank proof = PASS
Part B complete Rating Scale raw-cell XML parity = PASS
complete static/padding/merge/sheet2 parity = PASS
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
- verify the exact R5 token;
- read this exact R5 contract;
- no broad exploration / no Git delivery rediscovery.

Before commit run `git diff --name-only`. It MUST show ONLY:

```text
src/services/mbo-xlsx-semantic-renderer.js
tests/mbo-xlsx-semantic-renderer.test.js
```

If strict proof requires any frozen-file change: STOP. Do not weaken tests. Do not broaden scope.

If all required checks pass:
1. create EXACTLY ONE SOURCE+TEST corrective commit;
2. suggested message: `fix(d2): close exact t-token and independent byte oracle (R2-C-R5)`;
3. push `ai/antigravity-wp002c`;
4. report pushed SHA, exact changed files, focused PASS/FAIL/SKIP, exact t-token proof, production preservation proof, independent oracle proof, Part A/Part B matrices, Rating Scale XML proof, privacy/canonical proof, XML proof, regression result, `node --check`, and `git diff --check`;
5. STOP.

Do NOT modify `project-docs/*`.
Do NOT self-declare R2-C PASS/CLOSED.
Do NOT start Combined Excel.
Do NOT perform Kintone writes/deploy/Live UAT.
Do NOT start D3.

Final executor state after successful push:

`R2-C-R5 SOURCE+TEST CORRECTIVE COMPLETE / AWAITING CHATGPT INDEPENDENT REVIEW`
