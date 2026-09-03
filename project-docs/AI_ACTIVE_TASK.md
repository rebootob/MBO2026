# AI ACTIVE TASK — R2-B2-R2 AUTHORIZED / ACTIVE

Mode: **CONTROL PLANE / R2-B2-R2 SOURCE+TEST CORRECTIVE AUTHORIZED / BOUNDED / ONE-SHOT / LOW-CREDIT / NO KINTONE / NO DEPLOY / D3 HOLD**
Branch: `ai/antigravity-wp002c`
Updated: 2026-09-03 ICT

Read `D2_REVIEW_FAST_START.md` first, then this file, then only directly relevant frozen Part B baseline/design/source/test evidence for this corrective.

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
D2_WP004_R2_B2_R1 = REVIEWED / PARTIAL CORRECTIVE PASS / PROOF+GUARD GAPS
D2_WP004_R2_B2_R2 = AUTHORIZED / ACTIVE

ACTIVE_WORK_PACKAGE = D2-WP004-R2-B2-R2
ACTIVE_D2_SOURCE_CHANGE_AUTH = R2-B2-R2 ONLY / PREPARER FILE ONLY
ACTIVE_D2_TEST_CHANGE_AUTH = R2-B2-R2 ONLY / PART-B TEST FILE ONLY
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE

ANTIGRAVITY = AUTHORIZED / BOUNDED / ONE-SHOT / MAX 1 COMMIT
R2_B1_PRODUCTION_SOURCE = PASS / FROZEN
R2-B2-R2 = AUTHORIZED / ACTIVE
R2-C = NOT AUTHORIZED
COMBINED_EXCEL_PARITY = NOT AUTHORIZED / LATER D2 GATE
D3 = HOLD
```

## 2. R2-B2-R1 identity / review basis

```text
R2_B2_R1_AUTHORIZATION_BASIS = 25f62aa86585621085d7a16b1992bef79148e504
R2_B2_R1_AUTHORIZATION_COMMIT = 06264a5c0d581b160019db877be49fbfc6b791c6
R2_B2_R1_AUTHORIZATION_TOKEN = D2-WP004-R2-B2-R1-SOURCE-TEST-CORRECTIVE-20260903-01
R2_B2_R1_IMPLEMENTATION_COMMIT = 67c60065e169f9339219dd334c51e9b70c355319
R2_B2_R1_SCOPE_REVIEW = PASS
R2_B2_R1_TOKEN_STATE = CONSUMED / DO NOT REUSE
GITHUB_COMBINED_STATUS = NONE
GITHUB_WORKFLOW_RUNS = NONE

R2_B2_R2_AUTHORIZATION_BASIS_HEAD = 0940bca9a1fe9d683a933df7deb1a5dd23028218
R2_B2_R2_AUTHORIZATION_TOKEN = D2-WP004-R2-B2-R2-SOURCE-TEST-CORRECTIVE-20260903-01
MAX_EXECUTOR_COMMITS = 1
```

Writable files ONLY:

```text
src/services/mbo-xlsx-template-preparer.js
tests/mbo-xlsx-template-preparer-part-b.test.js
```

Forbidden/frozen:

```text
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

## 3. Accepted R1 corrections — preserve

Preserve these accepted corrections:
- production parses complete SOURCE merge ranges before mutation;
- exact six SOURCE block merges are required;
- SOURCE merge crossing row31 fails closed;
- merges entirely before row31 remain unchanged;
- merges entirely at/after row31 relocate both endpoints by `extraRows`;
- six SOURCE block merges clone by +4/+8 on both endpoints;
- malformed stretched Rating Scale merge path from initial B2 is removed;
- final merge inventory derives expected truth directly from exact owner SOURCE OOXML and deep-equals final output;
- duplicate final merge refs are rejected by test;
- auxiliary `Sheet1` raw XML parity exists;
- non-Print_Area defined-name parity exists;
- browser-safe/raw-OOXML sanitizer/Part A frozen boundaries remain preserved.

Do not reopen these accepted corrections unless an independently proven regression appears.

## 4. BLOCKER A — close exact intermediate merge authority

Current R1 test computes:

```text
expectedIntermediateMerges = deriveExpectedMergeInventory(srcMerges, n, false)
```

but does not compare it against an actual intermediate production state before title-overlay.

Required R2 corrective:
1. Build deterministic expected intermediate merge refs directly from exact raw SOURCE merge inventory.
2. Before presentation overlay, compare complete actual intermediate refs against complete expected refs inside production and fail closed on any mismatch.
3. Verify exact sorted inventories, not just counts/presence:
   - N6 = 79
   - N7 = 85
   - N8 = 91
4. Test must directly prove this production intermediate authority. A browser-safe pure helper used by production may be exposed/tested if helpful.
5. No production output may be used as the expected oracle.
6. No count-only substitute and no weakening of final merge proof.

## 5. BLOCKER B — close SOURCE-backed row/style/static production guard

Before presentation overlay/sanitization, production must fail closed unless transformed worksheet identity matches exact owner SOURCE authority under only authorized row relocation/cloning.

Required bounded SOURCE-derived checks:
- rows1:30 structural/style identity remains SOURCE-exact;
- inserted rows derive from SOURCE27:30 with row-number relocation only;
- relocated SOURCE31:35 matches SOURCE structural/style identity after `extraRows` relocation;
- exact cell structural attrs needed for security classification are preserved, including style/type attributes where present;
- protected Rating Scale topology matches SOURCE-derived authority;
- protected padding topology matches SOURCE-derived authority;
- Profile effective sanitization set/count remains exact;
- effective sanitization has zero overlap with protected static authority.

Use only browser-safe helpers inside the production preparer. Do not import/call the Node feasibility harness.

The guard must execute BEFORE presentation overlay and raw sanitization and must fail closed on material divergence.

## 6. BLOCKER C — correct actual frozen semantic-target no-write proof

Frozen Part B Profile authority is authoritative. Derive targets from:

```text
profile.getPartBMappings(n)
```

Do not hard-code unrelated proxy cells.

At minimum prove blank/unwritten after B2 for:
- all actual header mapping anchors;
- every competency `SELF_RATING` target:
  - b1 K9
  - b2 K13
  - b3 K17
  - b4 K21
  - b5 K25
  - b6 K29
  - b7 K33 when N>=7
  - b8 K37 when N=8
- b7 TITLE/DESCRIPTION B31/B32 when applicable;
- b8 TITLE/DESCRIPTION B35/B36 when applicable;
- actual Part B summary write anchors from Profile mappings.

This is no-semantic-write proof only. B2-R2 must not write any secured projection values.

## 7. BLOCKER D — close protected static exact SOURCE value parity

Derive protected static value/type/hash authority from exact owner SOURCE.

Required:
- source Rating Scale/padding values/types/hashes are captured from SOURCE only;
- N7/N8 cloned protected authority derives from SOURCE27:30 with row-number normalization only;
- exact value/type/hash parity is proved for protected Rating Scale and any nonblank protected padding content;
- existing structural/style/merge parity assertions remain;
- protected static cells must not be cleared or semantically rewritten.

Protected authority:

```text
N6: Rating Scale B29:J29 / padding row30
N7: Rating Scale B29:J29 + B33:J33 / padding rows30 + 34
N8: Rating Scale B29:J29 + B33:J33 + B37:J37 / padding rows30 + 34 + 38
```

## 8. R2-B2-R2 authorization

```text
WORK_PACKAGE = D2-WP004-R2-B2-R2
NAME = PART B INTERMEDIATE AUTHORITY + SOURCE-BACKED STRUCTURAL/SEMANTIC PROOF CLOSURE
STATE = AUTHORIZED / ACTIVE
MODE = SOURCE+TEST CORRECTIVE / BOUNDED / ONE-SHOT / LOW-CREDIT
AUTHORIZATION_BASIS_HEAD = 0940bca9a1fe9d683a933df7deb1a5dd23028218
AUTHORIZATION_TOKEN = D2-WP004-R2-B2-R2-SOURCE-TEST-CORRECTIVE-20260903-01
MAX_EXECUTOR_COMMITS = 1

WRITABLE_FILES =
  src/services/mbo-xlsx-template-preparer.js
  tests/mbo-xlsx-template-preparer-part-b.test.js

PROFILE_CHANGE_AUTH = NONE
EXPORT_SERVICE_CHANGE_AUTH = NONE
PART_A_CHANGE_AUTH = NONE
SEMANTIC_RENDERER_AUTH = NONE
```

R2 must correct ONLY Blocks A-D above and preserve all accepted B2/R1/R2-B1 behavior.

## 9. Required R2 focused runtime gate

Exact command:

`node --test tests/mbo-xlsx-template-preparer-part-b.test.js`

Closure candidate requires:

```text
FAIL = 0
SKIP = 0
real owner Part B template = EXECUTED / NOT SKIPPED
N6/N7/N8 matrix = PASS
SOURCE-derived intermediate merge inventory deep equality = PASS
SOURCE-derived final merge inventory deep equality = PASS
production SOURCE-backed row/style/static guard = PASS
protected Rating Scale/padding exact value+structure parity = PASS
actual frozen semantic-target no-write proof = PASS
auxiliary Sheet1 full parity = PASS
non-target defined-name parity = PASS
privacy/sanitization = PASS
package/formula preservation = PASS
```

If stricter proof exposes another production defect:
- do not weaken tests;
- do not broaden source changes;
- report exact evidence;
- STOP without claiming closure.

## 10. Execution protocol

Before commit:

`git diff --name-only`

It MUST show only:

```text
src/services/mbo-xlsx-template-preparer.js
tests/mbo-xlsx-template-preparer-part-b.test.js
```

Then:
1. run the exact focused test;
2. require FAIL=0 and SKIP=0;
3. verify real owner Part B N6/N7/N8 executed;
4. create EXACTLY ONE SOURCE+TEST corrective commit;
5. push to `ai/antigravity-wp002c`;
6. report pushed SHA, exact changed files, exact test command/results;
7. STOP;
8. do not self-declare R2-B2 PASS/CLOSED;
9. do not start R2-C or any later gate.

## 11. Forbidden until further owner authorization

```text
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

## 12. Executor stop state

After one authorized commit + push:

```text
R2-B2-R2 SOURCE+TEST CORRECTIVE COMPLETE / AWAITING CHATGPT INDEPENDENT REVIEW
```

Do not continue beyond that state.