# AI ACTIVE TASK — R2-C-R2 AUTHORIZED / ACTIVE

Mode: **CONTROL PLANE / BOUNDED EXECUTION AUTHORIZED / LOW-CREDIT / NO KINTONE / NO DEPLOY / D3 HOLD**
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

ACTIVE_WORK_PACKAGE = D2-WP004-R2-C-R2
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP004-R2-C-R2-SOURCE-TEST-CORRECTIVE-20260903-01
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP004-R2-C-R2-SOURCE-TEST-CORRECTIVE-20260903-01
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = D2-WP004-R2-C-R2-SOURCE-TEST-CORRECTIVE-20260903-01
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE

ANTIGRAVITY = BOUNDED / ONE-SHOT / MAX 1 COMMIT
CLAUDE = STOP
R2_B1_PRODUCTION_SOURCE = PASS / FROZEN
R2_B2_PRODUCTION_SOURCE = PASS / FROZEN
R2_B2_TEST_PROOF = PASS / FROZEN
R2_B2_RUNTIME_PROOF = PASS
R2-C-R2 = AUTHORIZED / ACTIVE
COMBINED_EXCEL_PARITY = NOT AUTHORIZED / LATER D2 GATE
D3 = HOLD
```

## 2. R2-C / R1 review identity

```text
R2_C_AUTHORIZATION_HEAD = f83cda813c8e7793502da411ec1bac1bca19f084
R2_C_IMPLEMENTATION = d9af2feb5fb2af1834675123fcd83f27a62fceb2
R2_C_R1_AUTHORIZATION_HEAD = 0bd15f14918751b2cda2c2acc66ea3ab6d40f61f
R2_C_R1_AUTHORIZATION_TOKEN = D2-WP004-R2-C-R1-SOURCE-TEST-CORRECTIVE-20260903-01
R2_C_R1_IMPLEMENTATION = aee75a8f01c681766ac6258cb02c267469ae97ff
R2_C_R1_AUTH_TO_IMPLEMENTATION = EXACTLY ONE COMMIT
R2_C_R1_OUT_OF_SCOPE_CHANGE = NONE
```

The original R2-C and R1 tokens are consumed. R2-C remains NOT CLOSED.

## 3. Accepted R1 improvements — MUST PRESERVE

Do not weaken:
- exact main-sheet workbook relationship binding to `sheet1.xml`;
- exactly one `_xlnm.Print_Area`, exact `localSheetId="0"`, exact Profile `layout.printArea`, exact dimension pre-write;
- every concrete target cell node required EXACTLY ONCE before mutation;
- Part A orphan `xl/media/image3.png` and current forbidden drawing-rel `rId3/image3.png` rejection;
- Part B declared merge count == actual count == Profile final count;
- Profile Rating Scale static merge and protected padding row guards;
- auxiliary workbook sheet `Sheet1` bound to `sheet2.xml`;
- caller-byte content immutability;
- whitespace-only nonempty secured text preserved;
- `xml:space="preserve"` for leading/trailing whitespace;
- real Employee-Self/Approver privacy proof for both Parts at representative scope;
- non-sheet1 byte-equality and representative sheet1 normalized/deep-equality proof.

## 4. Exact R2-C-R2 authorization

```text
WORK_PACKAGE = D2-WP004-R2-C-R2
NAME = SECURED SEMANTIC RENDERER EXACT ATTRIBUTE + FULL MATRIX CLOSURE
STATE = AUTHORIZED / ACTIVE
MODE = SOURCE+TEST CORRECTIVE / BOUNDED / ONE-SHOT / LOW-CREDIT
MAX_EXECUTOR_COMMITS = 1
AUTHORIZATION_BASE_HEAD = d0bbbd156a75d24364234e83143e4d70e1b6aab2
AUTHORIZATION_TOKEN = D2-WP004-R2-C-R2-SOURCE-TEST-CORRECTIVE-20260903-01
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
existing Profile/Preparer/Feasibility/export tests = FROZEN
project-docs/* = FORBIDDEN TO EXECUTOR
package.json / package-lock.json = FORBIDDEN
UI / dist / integration = FORBIDDEN
Combined Excel parity = NOT AUTHORIZED
Kintone write/deploy/Live UAT = FORBIDDEN
D3 = HOLD
```

## 5. R2-C-R2 exact corrective contract

### R2-A — exact raw opening-tag preservation

Correct `mutateCellInSheetXml` or equivalent so target mutation:
- locates exact target cell node by exact `r` identity;
- captures exact raw opening-tag text;
- does NOT parse/rebuild non-`t` attributes;
- removes/replaces/inserts only the exact cell `t` attribute required by string vs numeric representation;
- preserves every other raw opening-tag byte, attribute value and attribute order exactly;
- preserves `r`, `s`, namespaced, hyphenated and any other material attributes exactly;
- self-closing target may become paired only to carry authorized payload;
- existing paired body may change only for authorized value payload;
- missing target is never materialized;
- formula target fails closed;
- fail closed if the opening tag cannot be transformed safely under this narrow rule.

Whitespace/XML/value policy from R1 remains unchanged.

### R2-B — exact production post-write preservation

Before return independently compare rendered authority against prepared-before and fail closed unless:
- package entry inventory unchanged;
- every package entry other than `xl/worksheets/sheet1.xml` exact byte/content-equal;
- exact dimension unchanged;
- exact Print_Area unchanged;
- Part B merge inventory/count unchanged;
- Part B Rating Scale/padding topology unchanged;
- exact sheet1 cell-address inventory unchanged;
- exact target non-type opening-tag authority unchanged;
- formulas remain zero;
- every path-present value decodes exactly;
- optional/nonwritten sensitive targets remain blank;
- caller bytes remain content-identical;
- output is a NEW `Uint8Array`.

Browser-safe byte comparison only. No Node crypto dependency in production.

### R2-C — complete Profile-derived Part A test matrix

For every exact OWNER Part A N=4..10:
- construct exact role-name set required by frozen contract;
- exact role count = `10 + 5*N` => 30/35/40/45/50/55/60;
- resolve every address + projection path through frozen Profile;
- independently resolve secured projection truth;
- assert EVERY path-present target exact;
- assert EVERY path-absent optional target blank;
- assert EVERY effective sanitization address outside the actually-written set blank;
- retain formula/reference-image/input-immutability proof.

No fixed-cell sample substitute.

### R2-D — complete Profile-derived Part B test matrix

For exact OWNER Part B N=6/7/8:
- exact role counts 14/17/20;
- assert EVERY Profile-derived self-rating target;
- summaries present exact and absent blank;
- b1..b6 static title/description exact prepared-before parity;
- b7/b8 canonical presentation exact;
- FULL Chief R:X effective authority blank;
- Rating Scale and padding exact prepared-before parity;
- complete final merge inventory unchanged;
- auxiliary `Sheet1` exact prepared-before parity;
- EVERY nonwritten effective sanitization address blank;
- retain formulas/input immutability.

No K9/R31/B29-only proof.

### R2-E — independent authorized-diff exact-attribute proof

Test helper MUST NOT use production's parser/rebuilder strategy.

For representative count-aware variants including Part A and Part B expanded case:
- package inventory unchanged;
- non-sheet1 exact byte equality;
- exact before/after cell-address inventory equality;
- for each target compare raw opening tag after normalizing ONLY authorized `t` representation difference;
- neutralize ONLY target body/value payload while preserving all other raw XML;
- complete sheet1 XML equality after this narrow normalization;
- inject valid sentinel non-type attributes outside the current parser comfort zone, including namespaced and/or hyphenated forms, and prove exact survival.

### R2-F — complete fail-closed matrix

Preserve existing R1 cases and add at minimum:
- malformed Part B competency count;
- duplicate `_xlnm.Print_Area` inventory;
- wrong workbook main-sheet name/identity;
- Part A forbidden drawing/relationship reference reappearance independent of orphan media;
- Part B actual merge inventory mismatch with declared count left unchanged;
- Part B protected padding row missing;
- Part B protected padding row duplicate;
- Part B auxiliary `Sheet1` relationship/binding corruption;
- invalid object;
- invalid array;
- invalid bigint;
- `Infinity` and `-Infinity`;
- blank and whitespace-only required b7/b8 presentation;
- caller immutability on representative Part B failures.

### R2-G — complete real privacy / canonical presentation

In test code only use frozen `MboExportService.projectCombinedExport()` and prove:
- Employee-Self Part A + Part B;
- Approver Part A + Part B;
- N7 `COMP_LEAD` canonical `presentationTitle` / `presentationDescription`;
- N8 `COMP_STRAT` canonical `presentationTitle` / `presentationDescription`;
- conflicting raw `name`, `title`, `competencyName` aliases cannot influence renderer output;
- manager/GM/final/evaluator secrets remain absent package-wide wherever not SAFE.

## 6. Required runtime / regression gate

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

All must PASS.

## 7. Active executor protocol

Authorization is effective NOW and single-use.

Before modification:
- fresh-fetch exact authorization HEAD generated by this control update;
- verify token exactly;
- read this exact R2 contract;
- no broad exploration;
- no Git delivery rediscovery.

Before commit:

`git diff --name-only`

MUST show ONLY:

```text
src/services/mbo-xlsx-semantic-renderer.js
tests/mbo-xlsx-semantic-renderer.test.js
```

If strict proof requires any frozen-file modification:
- DO NOT modify frozen files;
- DO NOT weaken tests;
- DO NOT broaden scope;
- report exact blocker;
- STOP.

If all required tests/checks pass:
1. create EXACTLY ONE SOURCE+TEST corrective commit;
2. suggested message: `fix(d2): close exact renderer attributes and full matrix (R2-C-R2)`;
3. push `ai/antigravity-wp002c`;
4. report pushed SHA;
5. report exact changed files;
6. report focused PASS/FAIL/SKIP + matrix signals;
7. report frozen regression result;
8. report `node --check` result;
9. report `git diff --check` result;
10. STOP.

Do NOT modify `project-docs/*`.
Do NOT self-declare R2-C PASS/CLOSED.
Do NOT start Combined Excel.
Do NOT perform Kintone writes/deploy/Live UAT.
Do NOT start D3.

## 8. Authorization identity / stop condition

Owner explicitly authorized:

`อนุมัติ D2-WP004-R2-C-R2 SOURCE+TEST CORRECTIVE ตามขอบเขตที่เสนอ`

Single-use authorization token:

`D2-WP004-R2-C-R2-SOURCE-TEST-CORRECTIVE-20260903-01`

The token is consumed when executor either creates/pushes the authorized corrective commit or stops due to a contract blocker after beginning execution. After push/blocker, Antigravity MUST STOP and wait for independent ChatGPT review. No subsequent gate is authorized.
