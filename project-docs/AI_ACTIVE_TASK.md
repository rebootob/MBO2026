# AI ACTIVE TASK — R2-B1-R2 NEEDS CORRECTIVE / R3 PROPOSED

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
D2_WP004_R2_B1_R2 = NEEDS CORRECTIVE / NOT CLOSED

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

## 2. R2 implementation identity / scope review

```text
R2_AUTHORIZATION_TOKEN = D2-WP004-R2-B1-R2-SOURCE-TEST-CORRECTIVE-20260903-01
R2_AUTHORIZATION_COMMIT = 5b2f81d1c3353e7333d7d9d59e767c75e307ec41
R2_IMPLEMENTATION_COMMIT = ffb76e9d92a66eeeb268e648f3433db0781e893e
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

Accepted R2 improvements that MUST NOT regress:
- production remains browser-safe; no Node fs/path/crypto import and no feasibility import;
- exact owner-template SHA validation remains before workbook/package mutation;
- caller bytes are copied before mutation;
- Part A only, N4..N10, sentinel-free;
- exact reference Target is now `../media/image3.png` only;
- any TargetMode attribute is rejected;
- exact embed count checks were added;
- production reference-image logic was extracted into shared production helper `validateAndRemoveReferenceImage()`;
- real preparer calls that same helper after SHA validation;
- adversarial tests call the same production helper directly, so SHA no longer masks the intended validator path;
- workbook-wide formula scan remains in focused integration test;
- no semantic writer, scoring, Part B, Kintone or deploy scope expansion.

These improvements are not sufficient to close B1 because fail-closed relationship parsing/post-removal validation and the required complete Part A proof matrix remain incomplete.

## 3. MATERIAL BLOCKER A — malformed/non-self-closing rId3 relationship can evade exact validation

Current production helper discovers relationships only with:

```text
<Relationship .../>
```

using a self-closing-only regex.

Therefore a package containing:
- one valid self-closing rId3 relationship, AND
- one malformed or non-self-closing second rId3 relationship such as `<Relationship ... Id="rId3" ...></Relationship>`

can leave `matchingRels.length === 1` and pass pre-removal validation. The valid relationship is removed, but the malformed/non-self-closing rId3 evidence can remain in `drawing1.xml.rels`.

The real preparer then scans other `.rels` files while explicitly excluding `drawing1.xml.rels`, so a surviving malformed `image3.png` reference in that same relationship file is not caught before `xl/media/image3.png` is removed.

This violates the authorized R2 requirement to reject malformed/non-self-closing/duplicate rId3 evidence and to prove no remaining image3 reference after normalization.

### Required R3 source correction
- parse/validate coverage-completely enough that every `Relationship` element/evidence in `drawing1.xml.rels` is accounted for;
- fail closed on malformed/non-self-closing/namespace-prefixed/duplicate rId3 evidence instead of silently ignoring it;
- after target removal, explicitly prove updated `drawing1.xml.rels` contains zero rId3 and zero image3.png references;
- then prove all other `.rels` files also contain zero image3.png references before media removal;
- do not weaken exact tuple, TargetMode-absent, embed-cardinality, media-existence or owner-SHA gates.

## 4. MATERIAL BLOCKER B — complete frozen Part A structural proof is still incomplete

R2 integration test still primarily proves row-number existence/sequence and merge count arithmetic. It does NOT yet prove the full frozen structural identity required by `D2_PART_A_STRUCTURAL_CLOSURE.md`:

1. rows 1:28 structural identity against the source baseline, including cell refs, style pattern, row height and custom-height behavior;
2. each inserted row exact normalized structural clone of source row 28 for those dimensions;
3. each original downstream row >=29 exact relocated structural identity, not merely target row-number existence;
4. complete expected merge inventory deep equality; current test checks count (`193 + extra*14`) rather than exact merge set;
5. directly relevant frozen metadata parity beyond sheet-name spot check, including required sheet state / structural metadata routed by the Part A baseline.

### Required R3 test correction
Use test-side inspection/oracle logic to derive the source baseline and compare actual production output deeply for N4..N10. The production mutation path must remain `preparePartATemplate()`.

## 5. MATERIAL BLOCKER C — privacy/package proof is still incomplete

R2 tests prove final sensitive cells are null, but do not yet prove:
- stale sensitive tokens collected pre-sanitize are absent from final `sharedStrings.xml` and relevant package XML/content;
- same-count sanitization topology substitution fails closed through production Profile validation;
- protected/static topology mutation fails closed through production Profile validation;
- complete unrelated drawing relationship/media inventory equality after normalizing only accepted rId3/image3 removal.

Presence checks for rId1/rId2/rId4 and selected media files are not equivalent to full normalized non-target inventory equality.

## 6. MATERIAL BLOCKER D — independent real-template runtime evidence remains unavailable

Repository truth for R2 implementation commit exposes:
- no combined CI status;
- no GitHub workflow run;
- no persisted test artifact/log proving `node --test tests/mbo-xlsx-template-preparer.test.js` executed with owner template present and no skip.

The focused integration test still contains an explicit local-template skip path. Repository/source review therefore cannot independently certify the real N4..N10 run.

R3 executor must run the focused command and report exact pass/fail/skip counts and explicitly state `real owner-template integration = EXECUTED / NOT SKIPPED` plus `N4..N10 matrix = PASS/FAIL`.

## 7. Exact next proposed corrective — NOT AUTHORIZED

```text
PROPOSED_WORK_PACKAGE = D2-WP004-R2-B1-R3
NAME = PART A COVERAGE-COMPLETE REFERENCE + DEEP PARITY CORRECTIVE
STATE = PROPOSED / NOT AUTHORIZED
MODE = SOURCE+TEST CORRECTIVE / BOUNDED / ONE-SHOT / LOW-CREDIT

PROPOSED_WRITABLE_FILES =
  src/services/mbo-xlsx-template-preparer.js
  tests/mbo-xlsx-template-preparer.test.js

MAX_EXECUTOR_COMMITS = 1
```

Correct ONLY Blockers A-D above. Do not redesign the preparer and do not broaden beyond Part A.

R3 goals:
1. coverage-complete fail-closed drawing relationship validation;
2. explicit post-removal zero-reference validation in updated drawing rels + all other rels;
3. adversarial malformed/non-self-closing/duplicate relationship tests against the SAME production helper;
4. deep rows1:28 / inserted clone / downstream structural identity proof;
5. exact merge-set deep equality;
6. required frozen metadata parity;
7. stale shared-string/package token purge proof;
8. same-count sanitization/protected-static mutation proof;
9. full normalized non-target relationship/media inventory equality;
10. real-template N4..N10 execution, not skipped;
11. preserve exact SHA gate, browser safety, zero formulas, zero semantic writes and zero Part B scope.

## 8. Exact writable/forbidden scope for proposed R3

Proposed writable files ONLY:

```text
src/services/mbo-xlsx-template-preparer.js
tests/mbo-xlsx-template-preparer.test.js
```

Forbidden remains:

```text
src/services/mbo-export-service.js
src/profiles/mbo-xlsx-template-profile.js
scripts/export/mbo-xlsx-ooxml-feasibility.js
tests/mbo-xlsx-ooxml-feasibility.test.js
project-docs/* = FORBIDDEN TO EXECUTOR
package.json / package-lock.json
UI / dist / integration
R2-B2
R2-C
Combined Excel
Kintone write/deploy/Live UAT
D3
```

## 9. Owner decision

No execution is authorized now.

Recommended approval phrase if Owner accepts the smallest corrective:
`อนุมัติ D2-WP004-R2-B1-R3 SOURCE+TEST CORRECTIVE ตามขอบเขตที่เสนอ`

```text
ACTIVE_WORK_PACKAGE = NONE
ANTIGRAVITY = STOP / WAIT OWNER
PRODUCTION_RENDERER = B1 NOT CLOSED
R2-B2 = NOT AUTHORIZED
R2-C = NOT AUTHORIZED
D3 = HOLD
```
