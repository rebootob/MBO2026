# AI ACTIVE TASK — R2-B2-R2 REVIEWED / SOURCE PASS / R2-B2-R3 TEST-ONLY PROPOSED

Mode: **CONTROL PLANE / NO ACTIVE EXECUTOR / LOW-CREDIT / NO KINTONE / NO DEPLOY / D3 HOLD**
Branch: `ai/antigravity-wp002c`
Updated: 2026-09-03 ICT

Read `D2_REVIEW_FAST_START.md` first, then this file, then only exact Part B source/test/Profile evidence required for the next authorized gate.

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
D2_WP004_R2_B2_R2 = REVIEWED / SOURCE CORRECTIVE PASS / TEST PROOF GAP

ACTIVE_WORK_PACKAGE = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE

ANTIGRAVITY = STOP / WAIT OWNER
R2_B1_PRODUCTION_SOURCE = PASS / FROZEN
R2_B2_R2_PRODUCTION_SOURCE = PASS / FROZEN UNLESS STRICT R3 TEST PROVES REGRESSION
R2-B2-R3 = PROPOSED / NOT AUTHORIZED / TEST-ONLY
R2-C = NOT AUTHORIZED
COMBINED_EXCEL_PARITY = NOT AUTHORIZED / LATER D2 GATE
D3 = HOLD
```

## 2. R2-B2-R2 identity / scope review

```text
R2_B2_R2_AUTHORIZATION_BASIS = 0940bca9a1fe9d683a933df7deb1a5dd23028218
R2_B2_R2_AUTHORIZATION_COMMIT = 5aba1f4bcdb978b1dbb42f6cef06c6e7084699ea
R2_B2_R2_AUTHORIZATION_TOKEN = D2-WP004-R2-B2-R2-SOURCE-TEST-CORRECTIVE-20260903-01
R2_B2_R2_IMPLEMENTATION_COMMIT = 33f1beb3ae292f1ad24857ea04511b3fa445cd2e
AUTH_TO_IMPLEMENTATION = EXACTLY ONE COMMIT
CHANGED_FILES = EXACTLY TWO AUTHORIZED FILES
  src/services/mbo-xlsx-template-preparer.js
  tests/mbo-xlsx-template-preparer-part-b.test.js
SCOPE_REVIEW = PASS
TOKEN_STATE = CONSUMED / DO NOT REUSE
GITHUB_COMBINED_STATUS = NONE
GITHUB_WORKFLOW_RUNS = NONE
```

## 3. Accepted R2 source corrections — freeze

Independent static review accepts these R2 production corrections:
- browser-safe `deriveExpectedPartBMergeInventory()` is used by production;
- complete actual intermediate merge inventory is sorted and compared item-by-item to exact SOURCE-derived expected inventory before presentation overlay;
- intermediate merge count remains exact 79 / 85 / 91;
- previously accepted final merge topology remains SOURCE-derived and unchanged;
- production parses SOURCE row structural authority before mutation;
- rows1:30 are checked against SOURCE row/style/type identity;
- inserted rows are checked against SOURCE27:30 identity under authorized row relocation;
- relocated SOURCE31:35 rows are checked against SOURCE identity under `extraRows` relocation;
- protected Rating Scale merge presence and padding topology are checked before sanitization;
- effective sanitization count and zero protected-static overlap remain fail-closed;
- semantic no-write proof now derives actual targets from `profile.getPartBMappings(n)`, including the frozen SELF_RATING anchors K9/K13/K17/K21/K25/K29/K33/K37, b7/b8 presentation targets and summary anchors;
- auxiliary Sheet1 parity, non-Print_Area defined-name parity, privacy and package/formula proofs remain present;
- Part A/Profile/export-service/feasibility/Kintone/D3 boundaries remain preserved.

Do not change production source again unless the strict R3 test proves a real production regression.

## 4. Remaining blocker — protected static exact SOURCE parity is not yet proved

R2 authorization required protected Rating Scale/padding **exact SOURCE-derived value/type/hash + structure parity**.

Current R2 test still proves only:
- protected padding row exists;
- Rating Scale merge exists and is one-row high;
- top-left Rating Scale value equals hard-coded string `Rating Scale`.

This is not the required SOURCE-derived exact preservation proof. It does not prove all protected static values/payload/types, and it does not prove any nonblank protected padding content against OWNER SOURCE.

Why this matters: sharedStrings/privacy purging and raw package mutation must never alter protected static content. The expected truth must come from the exact SHA-matching OWNER Part B SOURCE, not literals or production output.

## 5. R3 TEST-ONLY exact corrective proposal — NOT AUTHORIZED

```text
PROPOSED_WORK_PACKAGE = D2-WP004-R2-B2-R3
NAME = PART B PROTECTED STATIC + INTERMEDIATE TEST PROOF CLOSURE
STATE = PROPOSED / NOT AUTHORIZED
MODE = TEST-ONLY CORRECTIVE / BOUNDED / ONE-SHOT / LOW-CREDIT

PROPOSED_WRITABLE_FILE ONLY =
  tests/mbo-xlsx-template-preparer-part-b.test.js

SOURCE_CHANGE_AUTH = NONE
PROFILE_CHANGE_AUTH = NONE
PART_A_CHANGE_AUTH = NONE
EXPORT_SERVICE_CHANGE_AUTH = NONE
SEMANTIC_RENDERER_AUTH = NONE
MAX_EXECUTOR_COMMITS = 1
```

R3 must not alter production source unless strict proof exposes a new real defect; if that happens, STOP and report evidence for a separately authorized source corrective.

## 6. Required R3 proof additions

### A. Exact protected static OWNER-SOURCE authority

Capture expected authority directly from exact OWNER SOURCE before calling production.

For protected Rating Scale and padding authority, compare exact SOURCE-derived representation including at minimum:
- row structural attributes;
- exact cell inventory;
- exact cell structural attributes (`s`, `t`, and any other attrs present);
- exact decoded value and/or exact normalized value payload;
- any nonblank protected padding content;
- no unexpected protected cell materialization/removal.

For cloned N7/N8 protected rows derive expected authority ONLY from SOURCE rows29/30 with authorized row-number normalization:

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

Do not hard-code `Rating Scale` as the expected oracle. SOURCE is the oracle.

### B. Explicit intermediate merge proof in test

Production R2 already performs the actual pre-overlay exact intermediate equality guard and is accepted by static review. R3 test must add an explicit test-side proof without production output as expected truth:
- derive expected intermediate inventory from OWNER SOURCE via the production pure helper;
- derive the observable intermediate candidate from final output by removing ONLY the exact authorized title overlays for N7/N8;
- sort and `assert.deepEqual()` it to SOURCE-derived expected intermediate inventory;
- require 79 / 85 / 91 exactly;
- keep final merge SOURCE-derived deep equality 79 / 86 / 93 unchanged.

This is additive proof only; do not weaken any existing assertion.

### C. Preserve all already-correct R2 proof

Retain:
- Profile-derived semantic-target no-write proof;
- rows1:30 / inserted / downstream deep structural parity;
- final merge inventory deep equality;
- auxiliary Sheet1 full parity;
- non-target defined-name parity;
- privacy/sanitization;
- package/formula preservation;
- caller immutability;
- browser-safe/no sentinel boundary.

## 7. Focused runtime gate

Exact command:

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

If strict protected proof passes with `FAIL=0 / SKIP=0`, R2-B2 becomes a closure candidate for ChatGPT independent review.

If strict proof exposes a production defect:
- DO NOT weaken tests;
- DO NOT modify source under TEST-ONLY authority;
- report exact evidence;
- STOP.

## 8. Forbidden until owner authorization

```text
src/services/mbo-xlsx-template-preparer.js = FROZEN / NO R3 WRITE AUTH
src/profiles/mbo-xlsx-template-profile.js = FROZEN
src/services/mbo-export-service.js = FORBIDDEN
scripts/export/mbo-xlsx-ooxml-feasibility.js = FORBIDDEN
existing feasibility tests = FORBIDDEN
existing Part A preparer test = FROZEN
project-docs/* = FORBIDDEN TO EXECUTOR
package.json / package-lock.json = FORBIDDEN
UI / dist / integration = FORBIDDEN
R2-C = NOT AUTHORIZED
Combined Excel = NOT AUTHORIZED
Kintone write/deploy/Live UAT = FORBIDDEN
D3 = HOLD
```

## 9. Owner decision

No executor is active.

Recommended approval phrase:

`อนุมัติ D2-WP004-R2-B2-R3 TEST-ONLY CORRECTIVE ตามขอบเขตที่เสนอ`
