# AI ACTIVE TASK — R2-B2-R4 TEST-ONLY AUTHORIZED / ACTIVE

Mode: **CONTROL PLANE / R2-B2-R4 TEST-ONLY CORRECTIVE AUTHORIZED / BOUNDED / ONE-SHOT / LOW-CREDIT / NO KINTONE / NO DEPLOY / D3 HOLD**
Branch: `ai/antigravity-wp002c`
Updated: 2026-09-03 ICT

Read `D2_REVIEW_FAST_START.md` first, then this file, then only exact Part B source/test/Profile evidence required for this corrective.

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
D2_WP004_R2_B2 = NOT CLOSED
D2_WP004_R2_B2_R1 = REVIEWED / PARTIAL CORRECTIVE PASS
D2_WP004_R2_B2_R2 = REVIEWED / PRODUCTION SOURCE PASS / FROZEN
D2_WP004_R2_B2_R3 = REVIEWED / TEST-ONLY PARTIAL PASS / PROTECTED PADDING PAYLOAD PROOF GAP
D2_WP004_R2_B2_R4 = AUTHORIZED / ACTIVE / TEST-ONLY

ACTIVE_WORK_PACKAGE = D2-WP004-R2-B2-R4
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = R2-B2-R4 ONLY / PART-B TEST FILE ONLY
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE

ANTIGRAVITY = AUTHORIZED / TEST-ONLY / BOUNDED / ONE-SHOT / MAX 1 COMMIT
R2_B1_PRODUCTION_SOURCE = PASS / FROZEN
R2_B2_R2_PRODUCTION_SOURCE = PASS / FROZEN UNLESS STRICT R4 TEST PROVES REAL REGRESSION
R2-B2-R4 = AUTHORIZED / ACTIVE / TEST-ONLY
R2-C = NOT AUTHORIZED
COMBINED_EXCEL_PARITY = NOT AUTHORIZED / LATER D2 GATE
D3 = HOLD
```

## 2. R4 authorization identity

```text
R2_B2_R4_AUTHORIZATION_BASIS_HEAD = 917a4dd0218956011d398fe00d13aba38e28ba49
R2_B2_R4_AUTHORIZATION_TOKEN = D2-WP004-R2-B2-R4-TEST-ONLY-CORRECTIVE-20260903-01
MAX_EXECUTOR_COMMITS = 1
```

Writable file ONLY:

```text
tests/mbo-xlsx-template-preparer-part-b.test.js
```

Forbidden/frozen:

```text
src/services/mbo-xlsx-template-preparer.js = FROZEN / NO R4 WRITE AUTH
src/profiles/mbo-xlsx-template-profile.js = FROZEN
existing Part A behavior/test = FROZEN
src/services/mbo-export-service.js = FORBIDDEN
feasibility source/tests = FORBIDDEN
project-docs/* = FORBIDDEN TO EXECUTOR
package.json / package-lock.json = FORBIDDEN
UI / dist / integration = FORBIDDEN
R2-C = NOT AUTHORIZED
Combined Excel = NOT AUTHORIZED
Kintone write/deploy/Live UAT = FORBIDDEN
D3 = HOLD
```

If strict TEST-ONLY proof exposes a real production defect, DO NOT modify production source. Report exact evidence and STOP for a separately authorized source corrective.

## 3. Accepted R2/R3 source and test corrections — preserve/freeze

Preserve without weakening:
- production exact OWNER-SOURCE-derived intermediate merge guard before overlay;
- explicit R3 test-side intermediate reconstruction deep equality;
- exact intermediate counts 79 / 85 / 91;
- final SOURCE-derived merge deep equality 79 / 86 / 93;
- production SOURCE-backed rows1:30 / inserted SOURCE27:30 / relocated SOURCE31:35 structural/style/type guard;
- protected Rating Scale/padding topology and sanitization-overlap guard;
- Rating Scale OWNER-SOURCE row29 B:J value parity;
- Profile-derived semantic no-write proof including K9/K13/K17/K21/K25/K29/K33/K37 and b7/b8 presentation/summary anchors;
- auxiliary Sheet1 parity;
- non-Print_Area defined-name parity;
- privacy/sanitization, package/formula preservation and caller immutability;
- browser-safe / no-sentinel boundary.

## 4. R4 TEST-ONLY objective — protected padding OWNER-SOURCE payload proof closure

Capture exact protected padding authority directly from the exact SHA-matching OWNER Part B SOURCE before calling production.

Required SOURCE mapping:

```text
SOURCE row30 -> N6 row30
SOURCE row30 -> N7 rows30 + 34
SOURCE row30 -> N8 rows30 + 34 + 38
```

For every protected padding row prove exact OWNER-SOURCE-derived parity including:
- row structural attributes;
- exact cell inventory;
- exact cell structural attributes including `s`, `t`, and every other material attribute present;
- exact decoded cell value for every materialized cell;
- exact normalized OOXML value payload (`<v>...</v>` / inline-string payload as applicable), or an equivalent complete SOURCE-derived payload representation;
- any nonblank padding content;
- no unexpected cell materialization;
- no unexpected cell removal;
- only authorized row-number normalization for cloned rows34/38.

Expected truth must come from OWNER SOURCE row30 only. Do not use production output as the expected oracle. Do not assume the padding row is blank.

A suitable test-only parser/helper may be added inside the authorized test file to capture complete cell payload authority. It must not normalize away meaningful value/type/style/payload differences.

## 5. Required focused runtime gate

Run exactly:

`node --test tests/mbo-xlsx-template-preparer-part-b.test.js`

Closure candidate requires:

```text
FAIL = 0
SKIP = 0
real owner Part B template = EXECUTED / NOT SKIPPED
N6/N7/N8 matrix = PASS
SOURCE-derived intermediate merge test deep equality = PASS
SOURCE-derived final merge deep equality = PASS
production SOURCE-backed row/style/static guard = PASS
protected Rating Scale exact OWNER-SOURCE value+type+structure parity = PASS
protected padding exact OWNER-SOURCE value+payload+type+structure parity = PASS
actual Profile-derived semantic-target no-write proof = PASS
auxiliary Sheet1 full parity = PASS
non-target defined-name parity = PASS
privacy/sanitization = PASS
package/formula preservation = PASS
```

If strict R4 proof passes with FAIL=0 / SKIP=0 and no new production defect appears, R2-B2 becomes a closure candidate for ChatGPT independent review.

If strict proof exposes a production defect:
- DO NOT weaken tests;
- DO NOT modify production source under R4 authority;
- report exact OWNER-SOURCE vs output evidence;
- STOP.

## 6. Execution protocol

Before commit:

`git diff --name-only`

MUST show ONLY:

```text
tests/mbo-xlsx-template-preparer-part-b.test.js
```

Then:
1. run the exact focused test;
2. require FAIL=0 and SKIP=0;
3. verify real owner Part B N6/N7/N8 executed;
4. create EXACTLY ONE TEST-ONLY corrective commit;
5. push to `ai/antigravity-wp002c`;
6. report pushed SHA, exact changed file and exact focused test result;
7. STOP;
8. do not self-declare R2-B2 PASS/CLOSED;
9. do not start R2-C or any later gate.

## 7. Executor stop state

After one authorized commit + push:

```text
R2-B2-R4 TEST-ONLY CORRECTIVE COMPLETE / AWAITING CHATGPT INDEPENDENT REVIEW
```
