# AI ACTIVE TASK — R2-B1-R1 NEEDS CORRECTIVE / R2 PROPOSED

Mode: **CONTROL PLANE / NO ACTIVE EXECUTOR / LOW-CREDIT / NO KINTONE / NO DEPLOY / D3 HOLD**
Branch: `ai/antigravity-wp002c`
Updated: 2026-09-03 ICT

Fresh-fetch current HEAD first. Fast path: `D2_REVIEW_FAST_START.md` -> this file -> `phase-3/D2_WP004_R2_RENDERER_SANITIZER_DESIGN.md` -> directly relevant Part A baseline/profile/B1 source+test only.

## 1. Current truth

```text
OWNER_OBJECTIVE = COMPLETE D2 TO PASS / CLOSED BEFORE D3
D1 = PASS / CLOSED
D2 = IN PROGRESS
D2_PRESERVATION = PASS / CLOSED
D2_REFERENCE_IMAGE = PASS / CLOSED
D2_PART_A_STRUCTURAL = PASS / CLOSED
D2_PART_B_STRUCTURAL = PASS / CLOSED
D2_FORMULA_AUTHORITY = PASS / CLOSED
D2_PART_B_EXPANDED_PRIVACY = PASS / CLOSED
D2_XLSX_TEMPLATE_SEMANTIC_MAPPING = PASS / CLOSED
D2_XLSX_TEMPLATE_PROFILE = PASS / CLOSED
D2_WP004_R2_A = PASS / CLOSED AFTER R1
D2_WP004_R2_B1 = NEEDS CORRECTIVE / NOT CLOSED
D2_WP004_R2_B1_R1 = NEEDS CORRECTIVE / NOT CLOSED

SAFE_TO_MAP = 20 EXACT
UNRESOLVED = 22 EXACT
NO_SECURED_PROJECTION_SOURCE = 5 EXACT
CHIEF_FROZEN_AUTHORITY = R:X / NOT SECURED WRITABLE

ACTIVE_WORK_PACKAGE = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE

ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
PRODUCTION_RENDERER = B1 NOT CLOSED / B2+C NOT AUTHORIZED
D3 = HOLD
```

## 2. R2-B1-R1 implementation identity / scope review

```text
R2_B1_R1_AUTHORIZATION_TOKEN = D2-WP004-R2-B1-R1-SOURCE-TEST-CORRECTIVE-20260903-01
R2_B1_R1_AUTHORIZATION_COMMIT = fba306d1ce2dc3b318495a0e72bb4e4728353f28
R2_B1_R1_IMPLEMENTATION_COMMIT = 972c2a8b5f71bd661593a6856c1d1c25928af279
AUTH_TO_IMPLEMENTATION = EXACTLY ONE COMMIT
CHANGED_FILES = EXACTLY TWO AUTHORIZED FILES
  src/services/mbo-xlsx-template-preparer.js
  tests/mbo-xlsx-template-preparer.test.js
SCOPE_REVIEW = PASS
TOKEN_STATE = CONSUMED / DO NOT REUSE
GITHUB_COMBINED_STATUS = NONE
GITHUB_WORKFLOW_RUNS = NONE
RUNTIME_CERTIFICATION = NOT INDEPENDENTLY AVAILABLE
```

Accepted R1 improvements that must not regress:
- production reference-image handling moved away from simple substring-only deletion;
- production now checks a parsed rId3 relationship count and image relationship type;
- production requires target media to exist before removal;
- production checks a drawing anchor containing rId3 and attempts to distinguish incidental rId3 text;
- workbook-wide formula scan was added to the focused integration test;
- test coverage expanded for rowRefs, merge count, dimensions/Print_Area, page setup and basic image/branding checks;
- production remains browser-safe with no Node fs/path/crypto import and no feasibility import;
- no sentinel, semantic writer, scoring, Part B, Kintone or deploy scope expansion.

These improvements are not sufficient to close B1 because exact target authority and test-path reachability remain incorrect/incomplete.

## 3. MATERIAL BLOCKER A — source still widens the exact accepted reference-image tuple

Authorized/frozen exact tuple is:

```text
Id = rId3
Type = http://schemas.openxmlformats.org/officeDocument/2006/relationships/image
Target = ../media/image3.png
TargetMode = absent/null
MEDIA = xl/media/image3.png
```

Current R1 source still accepts states outside this authority:

```text
Target = media/image3.png          [incorrectly accepted alternative]
TargetMode = Internal              [incorrectly accepted when contract requires absent/null]
```

Therefore the production validator is not exact fail-closed yet.

The drawing-anchor check also counts matching anchors, not exact embed occurrences. One anchor containing multiple `r:embed="rId3"` occurrences can still satisfy `matchingAnchors.length === 1`. R2 must prove exact embed cardinality = 1 globally for the accepted anchor identity before mutation.

### Required R2 source correction
- accept ONLY exact Target `../media/image3.png`;
- require TargetMode attribute to be absent entirely;
- require exactly one Relationship element with Id `rId3` and exact Type/Target tuple;
- require exactly one exact `r:embed="rId3"` occurrence and exactly one enclosing accepted drawing anchor;
- reject malformed/non-self-closing/duplicate rId3 relationship evidence rather than silently ignoring it;
- preserve all accepted post-removal no-reference and unrelated-inventory checks;
- do not weaken exact owner-template SHA validation.

## 4. MATERIAL BLOCKER B — adversarial reference-image tests do not reach the reference validator

The corrective test mutates the owner workbook package first (missing/duplicate relationship, External TargetMode, missing media), re-generates new bytes, then calls:

`preparePartATemplate(mutatedBytes, ...)`

But production order is intentionally:

```text
exact owner-template SHA validation
-> workbook/package parsing
-> reference-image validation
```

Any package mutation changes the workbook bytes and therefore fails the SHA check before the reference-image validator executes.

Consequently these adversarial tests can PASS merely because `EXPORT_TEMPLATE_PREPARER_UNRESOLVED` is thrown for SHA mismatch. They do not prove missing/duplicate/wrong tuple/media conditions are rejected by the production reference-image validator.

### Required R2 reachability correction
Do NOT bypass or weaken production SHA validation.

Instead extract the smallest browser-safe pure production helper used by the real preparer, for example an exported/internal production function that validates the reference-image package evidence from drawing XML + relationship XML + media/reference inventory. The real `preparePartATemplate()` must call this SAME helper after SHA validation, and tests must call the SAME production helper directly with synthetic malformed XML/inventory to prove each adversarial condition reaches the intended validation logic.

No duplicated test-side validator is acceptable.

## 5. MATERIAL BLOCKER C — claimed complete Part A proof matrix is still materially incomplete

R1 test additions improve coverage but still do not satisfy the frozen `D2_PART_A_STRUCTURAL_CLOSURE.md` production-path proof.

Current R1 tests check row number presence/sequence and merge COUNT, but do not yet prove all required structural identity:

1. rows 1:28 structural identity against source baseline, including cell refs/style pattern/row height/custom-height behavior;
2. each inserted objective row exact normalized structural clone of source row 28 for those dimensions;
3. each original downstream row >=29 exact relocated structural identity, not merely that the target row number exists;
4. complete expected merge inventory deep equality; current test checks declared count and formula `193 + extra*14` but not exact merge set;
5. directly relevant frozen metadata parity (sheet state and required baseline metadata) rather than sheet-name-only spot check;
6. stale sensitive token absence from final sharedStrings/package content; current visible proof checks final cell nulls but not complete token purge evidence;
7. same-count sanitization topology substitution / protected-static mutation through production validation; current malformed profile example mutates dimension only;
8. complete unrelated drawing relationship/media inventory equality after normalizing only accepted rId3/image3 target; current test checks presence of rId1/rId2/rId4 and three media files, not full inventory equality.

R2 tests may use accepted feasibility helpers ONLY as test-side inspection/oracle support, but the actual mutation path must remain the production preparer.

## 6. MATERIAL BLOCKER D — independent real-template runtime evidence still unavailable

Repository truth for R1 implementation commit exposes:
- no combined CI status;
- no GitHub workflow run;
- no persisted test result artifact/log proving the focused real-template test executed and did not skip.

The integration test still has an explicit local-template skip path. Repository/source review therefore cannot independently certify that the N4..N10 matrix executed successfully in the executor environment.

R2 must run:

`node --test tests/mbo-xlsx-template-preparer.test.js`

with exact owner template present and report exact pass/fail/skip counts plus explicit `real owner-template integration = EXECUTED / NOT SKIPPED`. This executor report is necessary evidence but does not replace source/test review.

## 7. Exact next proposed corrective — NOT AUTHORIZED

```text
PROPOSED_WORK_PACKAGE = D2-WP004-R2-B1-R2
NAME = PART A EXACT REFERENCE VALIDATOR + REACHABLE PROOF CORRECTIVE
STATE = PROPOSED / NOT AUTHORIZED
MODE = SOURCE+TEST CORRECTIVE / BOUNDED / ONE-SHOT / LOW-CREDIT

PROPOSED_WRITABLE_FILES =
  src/services/mbo-xlsx-template-preparer.js
  tests/mbo-xlsx-template-preparer.test.js

MAX_EXECUTOR_COMMITS = 1
```

Correct ONLY Blockers A-D above. Do not redesign the preparer and do not broaden beyond Part A.

R2 source/test goals:
1. exact relationship Target only `../media/image3.png`;
2. TargetMode absent only;
3. exact relationship + embed cardinality fail-closed;
4. smallest production reference-evidence validator helper shared by real preparer and adversarial tests;
5. adversarial tests must prove intended validator error path, not generic SHA rejection;
6. exact row/clone/downstream structural identity proof;
7. exact merge-set equality;
8. required frozen metadata parity;
9. stale package/shared-string token purge proof;
10. same-count sanitization/protected-static mutation proof;
11. full normalized non-target relationship/media inventory equality;
12. real-template N4..N10 execution, not skipped;
13. preserve browser safety, exact SHA gate, zero formulas, zero semantic writes, zero Part B scope.

## 8. Forbidden scope remains

```text
src/services/mbo-export-service.js = FORBIDDEN
src/profiles/mbo-xlsx-template-profile.js = FORBIDDEN
scripts/export/mbo-xlsx-ooxml-feasibility.js = FORBIDDEN
tests/mbo-xlsx-ooxml-feasibility.test.js = FORBIDDEN
package.json / package-lock.json = FORBIDDEN
project-docs/* = FORBIDDEN TO EXECUTOR
UI / dist / integration = FORBIDDEN
R2-B2 = NOT AUTHORIZED
R2-C = NOT AUTHORIZED
Combined Excel = NOT AUTHORIZED
Kintone write/deploy/Live UAT = FORBIDDEN
D3 = HOLD
```

## 9. Owner decision

No execution is authorized now.

Recommended approval phrase if Owner accepts the smallest corrective:
`อนุมัติ D2-WP004-R2-B1-R2 SOURCE+TEST CORRECTIVE ตามขอบเขตที่เสนอ`

```text
ACTIVE_WORK_PACKAGE = NONE
ANTIGRAVITY = STOP / WAIT OWNER
PRODUCTION_RENDERER = B1 NOT CLOSED
R2-B2 = NOT AUTHORIZED
R2-C = NOT AUTHORIZED
D3 = HOLD
```
