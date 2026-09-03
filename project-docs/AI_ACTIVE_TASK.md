# AI ACTIVE TASK — R2-B2-R3 TEST-ONLY AUTHORIZED / ACTIVE

Mode: **CONTROL PLANE / R2-B2-R3 TEST-ONLY CORRECTIVE AUTHORIZED / BOUNDED / ONE-SHOT / LOW-CREDIT / NO KINTONE / NO DEPLOY / D3 HOLD**
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
D2_WP004_R2_B2_R2 = REVIEWED / PRODUCTION SOURCE PASS / TEST PROOF GAP
D2_WP004_R2_B2_R3 = AUTHORIZED / ACTIVE / TEST-ONLY

ACTIVE_WORK_PACKAGE = D2-WP004-R2-B2-R3
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = R2-B2-R3 ONLY / PART-B TEST FILE ONLY
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE

ANTIGRAVITY = AUTHORIZED / TEST-ONLY / BOUNDED / ONE-SHOT / MAX 1 COMMIT
R2_B1_PRODUCTION_SOURCE = PASS / FROZEN
R2_B2_R2_PRODUCTION_SOURCE = PASS / FROZEN UNLESS STRICT R3 TEST PROVES REAL REGRESSION
R2-B2-R3 = AUTHORIZED / ACTIVE / TEST-ONLY
R2-C = NOT AUTHORIZED
COMBINED_EXCEL_PARITY = NOT AUTHORIZED / LATER D2 GATE
D3 = HOLD
```

## 2. R3 authorization identity

```text
R2_B2_R3_AUTHORIZATION_BASIS_HEAD = 29e683d305c652ec63af69fc36a8c84177e0aef1
R2_B2_R3_AUTHORIZATION_TOKEN = D2-WP004-R2-B2-R3-TEST-ONLY-CORRECTIVE-20260903-01
MAX_EXECUTOR_COMMITS = 1
```

Writable file ONLY:

```text
tests/mbo-xlsx-template-preparer-part-b.test.js
```

Forbidden/frozen:

```text
src/services/mbo-xlsx-template-preparer.js = FROZEN / NO R3 WRITE AUTH
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

## 3. Accepted R2 production source — preserve/freeze

Independent static review accepts these production corrections:
- browser-safe `deriveExpectedPartBMergeInventory()` is used by production;
- complete actual intermediate merge inventory is verified against exact SOURCE-derived expected inventory before title overlay;
- intermediate counts remain exact 79 / 85 / 91;
- final merge topology remains SOURCE-derived and exact;
- production parses SOURCE row structural authority before mutation;
- rows1:30, inserted SOURCE27:30 rows, and relocated SOURCE31:35 rows are guarded for structural/style/type identity under only authorized row relocation;
- protected Rating Scale/padding topology and effective sanitization overlap guards are fail-closed;
- semantic no-write proof derives actual targets from `profile.getPartBMappings(n)`, including K9/K13/K17/K21/K25/K29/K33/K37 and b7/b8 presentation/summary anchors;
- auxiliary Sheet1, non-Print_Area defined names, privacy, package/formula and caller-immutability proofs remain present.

Do not reopen production source under R3.

## 4. R3 TEST-ONLY objective

Close the remaining proof gap without production source changes.

### A. Exact protected static OWNER-SOURCE authority

Capture expected authority directly from the exact SHA-matching OWNER Part B SOURCE before calling production.

For protected Rating Scale and padding authority, compare SOURCE-derived exact representation including at minimum:
- row structural attributes;
- exact cell inventory;
- exact cell structural attributes including `s`, `t`, and any other attrs present;
- exact decoded value and/or exact normalized OOXML value payload;
- any nonblank protected padding content;
- no unexpected protected cell materialization/removal.

For cloned N7/N8 protected rows, expected truth must derive ONLY from SOURCE rows29/30 with authorized row-number normalization:

```text
SOURCE row29 -> N7 row33 -> N8 row33 and row37
SOURCE row30 -> N7 row34 -> N8 row34 and row38
```

Required protected matrix:

```text
N6: B29:J29 + padding row30
N7: B29:J29 + B33:J33 + padding rows30/34
N8: B29:J29 + B33:J33 + B37:J37 + padding rows30/34/38
```

Do NOT hard-code `Rating Scale` as the expected oracle. OWNER SOURCE is the oracle.

### B. Explicit intermediate merge proof in test

Production R2 already performs the accepted pre-overlay intermediate guard. R3 must add explicit test-side proof:
- derive expected intermediate inventory from OWNER SOURCE via the production pure helper;
- derive observable intermediate candidate from final output by removing ONLY authorized title overlays:
  - N7 remove `B31:J31`
  - N8 remove `B31:J31` and `B35:J35`
- sort and `assert.deepEqual()` candidate to SOURCE-derived expected intermediate inventory;
- require exact counts 79 / 85 / 91;
- retain final SOURCE-derived deep equality 79 / 86 / 93.

No production-output-as-expected-oracle. No count-only substitute. No test weakening.

### C. Preserve all accepted proof

Retain unchanged:
- Profile-derived semantic-target no-write proof;
- rows1:30 / inserted / downstream deep structural parity;
- final merge inventory deep equality;
- auxiliary Sheet1 full parity;
- non-target defined-name parity;
- privacy/sanitization;
- package/formula preservation;
- caller immutability;
- browser-safe/no sentinel boundary.

## 5. Focused runtime gate

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
protected Rating Scale/padding exact OWNER-SOURCE value+type+structure parity = PASS
actual Profile-derived semantic-target no-write proof = PASS
auxiliary Sheet1 full parity = PASS
non-target defined-name parity = PASS
privacy/sanitization = PASS
package/formula preservation = PASS
```

If strict proof passes with FAIL=0 / SKIP=0, R2-B2 becomes a closure candidate for ChatGPT independent review.

If strict proof exposes a production defect:
- DO NOT weaken tests;
- DO NOT modify source under TEST-ONLY authority;
- report exact evidence;
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
6. report pushed SHA, exact changed file, exact focused test command/results;
7. STOP;
8. do not self-declare R2-B2 PASS/CLOSED;
9. do not start R2-C or any later gate.

## 7. Executor stop state

After one authorized commit + push:

```text
R2-B2-R3 TEST-ONLY CORRECTIVE COMPLETE / AWAITING CHATGPT INDEPENDENT REVIEW
```
