# AI ACTIVE TASK — R2-B2-R1 REVIEWED / NOT CLOSED / R2-B2-R2 PROPOSED

Mode: **CONTROL PLANE / NO ACTIVE EXECUTOR / LOW-CREDIT / NO KINTONE / NO DEPLOY / D3 HOLD**
Branch: `ai/antigravity-wp002c`
Updated: 2026-09-03 ICT

Read `D2_REVIEW_FAST_START.md` first, then this file, then only directly relevant frozen Part B baseline/design/source/test evidence for the next authorized gate.

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

ACTIVE_WORK_PACKAGE = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE

ANTIGRAVITY = STOP / WAIT OWNER
R2_B1_PRODUCTION_SOURCE = PASS / FROZEN
R2-B2-R2 = PROPOSED / NOT AUTHORIZED
R2-C = NOT AUTHORIZED
COMBINED_EXCEL_PARITY = NOT AUTHORIZED / LATER D2 GATE
D3 = HOLD
```

## 2. R2-B2-R1 identity / scope review

```text
R2_B2_R1_AUTHORIZATION_BASIS = 25f62aa86585621085d7a16b1992bef79148e504
R2_B2_R1_AUTHORIZATION_COMMIT = 06264a5c0d581b160019db877be49fbfc6b791c6
R2_B2_R1_AUTHORIZATION_TOKEN = D2-WP004-R2-B2-R1-SOURCE-TEST-CORRECTIVE-20260903-01
R2_B2_R1_IMPLEMENTATION_COMMIT = 67c60065e169f9339219dd334c51e9b70c355319
AUTH_TO_IMPLEMENTATION = EXACTLY ONE COMMIT
CHANGED_FILES = EXACTLY TWO AUTHORIZED FILES
  src/services/mbo-xlsx-template-preparer.js
  tests/mbo-xlsx-template-preparer-part-b.test.js
SCOPE_REVIEW = PASS
TOKEN_STATE = CONSUMED / DO NOT REUSE
GITHUB_COMBINED_STATUS = NONE
GITHUB_WORKFLOW_RUNS = NONE
```

## 3. Accepted R1 corrections — preserve

R1 materially corrects the original B2 merge defect and these directions are accepted:
- production now parses complete SOURCE merge ranges before mutation;
- exact six SOURCE block merges are required;
- SOURCE merge crossing row31 fails closed;
- merges entirely before row31 remain unchanged;
- merges entirely at/after row31 relocate both endpoints by `extraRows`;
- six SOURCE block merges clone by +4/+8 on both endpoints;
- malformed stretched Rating Scale merge path from initial B2 is removed;
- final merge inventory test now derives expected truth directly from exact owner SOURCE OOXML and deep-equals final output;
- duplicate final merge refs are rejected by test;
- auxiliary `Sheet1` raw XML parity was added;
- non-Print_Area defined-name parity was added;
- existing browser-safe/raw-OOXML sanitizer/Part A frozen boundaries remain preserved.

Do not reopen these accepted corrections without an independently proven regression.

## 4. BLOCKER A — intermediate merge authority is still not actually proved

The R1 test computes:

```text
expectedIntermediateMerges = deriveExpectedMergeInventory(srcMerges, n, false)
```

but never compares it to an actual intermediate production state. Only final output after title-overlay is deep-equalled to `expectedFinalMerges`.

The R1 authorization explicitly required:
- SOURCE-derived intermediate merge inventory deep equality = PASS;
- verify frozen intermediate authority before presentation overlay;
- N6/N7/N8 intermediate = 79/85/91 exact inventory, not count-only.

Current production still validates intermediate topology only by count plus Rating Scale/padding presence. There is no exact complete SOURCE-derived intermediate inventory equality guard before overlay.

Corrective requirement:
1. Build deterministic expected intermediate merge refs from exact raw SOURCE merge inventory.
2. Before overlay, compare complete actual intermediate refs against expected refs inside production and fail closed on any mismatch.
3. In test, prove the production intermediate validator directly (or expose a browser-safe pure helper used by production) and deepEqual actual intermediate sorted inventory to SOURCE-derived expected inventory.
4. No production-output-as-oracle and no count-only substitute.

## 5. BLOCKER B — production source-backed post-structural guard is still incomplete

R1 production guard currently verifies:
- intermediate merge count;
- Rating Scale merge presence;
- padding row existence;
- sanitization address count;
- no sanitization overlap with protected static addresses.

It still does NOT prove the R1-authorized minimum SOURCE-backed worksheet identity before overlay/sanitization:
- exact row/source-row relocation identity;
- style identity needed to distinguish dynamic vs protected/static cells;
- exact normalized SOURCE-derived structural identity of protected Rating Scale/padding rows.

`validateMappingIntegrity(profile)` is Profile authority only; it does not prove transformed worksheet identity.

Corrective requirement:
- add a browser-safe bounded SOURCE-derived structural guard using the already-loaded exact owner SOURCE OOXML;
- normalize only authorized row-number relocation;
- verify rows1:30, inserted rows from SOURCE27:30, and relocated SOURCE31:35 at the structural/style level needed for the security boundary;
- fail closed before presentation overlay/sanitization on mismatch;
- do not import feasibility/Node-only code.

## 6. BLOCKER C — semantic no-write proof still uses wrong competency targets

Frozen Part B Profile authority defines competency self-rating targets as:

```text
b1 = K9
b2 = K13
b3 = K17
b4 = K21
b5 = K25
b6 = K29
b7 = K33
b8 = K37
```

Current R1 test instead checks `R7..R12`, `R31`, `R35` for competency self-rating. Those are not the frozen semantic write targets, so the claimed semantic no-write proof is invalid.

Corrective requirement:
- derive semantic targets directly from `profile.getPartBMappings(n)`;
- assert every actual header anchor, each competency `SELF_RATING`, b7/b8 TITLE/DESCRIPTION when applicable, and summary write anchors are blank/unwritten after B2;
- do not hard-code unrelated proxy cells.

## 7. BLOCKER D — protected static exact value parity remains weaker than contract

R1 row structural proof plus final merge inventory now covers much of Rating Scale/padding structure, but the protected-static value proof still checks Rating Scale cells as merely non-null and padding as row existence.

R1 authorization required SOURCE-derived exact protected preservation.

Corrective requirement:
- derive exact SOURCE protected value/type/hash authority for source Rating Scale/padding rows;
- normalize cloned row numbers only for N7/N8;
- prove exact value/type/hash parity for protected Rating Scale and any nonblank protected padding content;
- keep existing structural/style/merge parity assertions.

## 8. Exact next proposed gate — NOT AUTHORIZED

```text
PROPOSED_WORK_PACKAGE = D2-WP004-R2-B2-R2
NAME = PART B INTERMEDIATE AUTHORITY + SOURCE-BACKED STRUCTURAL/SEMANTIC PROOF CLOSURE
STATE = PROPOSED / NOT AUTHORIZED
MODE = SOURCE+TEST CORRECTIVE / BOUNDED / ONE-SHOT / LOW-CREDIT

PROPOSED_WRITABLE_FILES =
  src/services/mbo-xlsx-template-preparer.js
  tests/mbo-xlsx-template-preparer-part-b.test.js

PROFILE_CHANGE_AUTH = NONE
EXPORT_SERVICE_CHANGE_AUTH = NONE
PART_A_CHANGE_AUTH = NONE
SEMANTIC_RENDERER_AUTH = NONE
MAX_EXECUTOR_COMMITS = 1
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

If stricter proof exposes another production defect, do not weaken tests. Report exact evidence and STOP.

## 10. Forbidden until further owner authorization

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

## 11. Owner decision

No executor is active.

Recommended approval phrase:

`อนุมัติ D2-WP004-R2-B2-R2 SOURCE+TEST CORRECTIVE ตามขอบเขตที่เสนอ`
