# AI ACTIVE TASK — R2-B1 NEEDS CORRECTIVE / R1 PROPOSED

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

## 2. R2-B1 implementation identity / scope review

```text
R2_B1_AUTHORIZATION_TOKEN = D2-WP004-R2-B1-SOURCE-TEST-20260902-01
R2_B1_AUTHORIZATION_COMMIT = 2c34a164f978be97b5878027d7f0fef9843823ef
R2_B1_IMPLEMENTATION_COMMIT = aa7230e8c6449333f4d8079a2db935d0fa4dba7a
AUTH_TO_IMPLEMENTATION = EXACTLY ONE COMMIT
CHANGED_FILES = EXACTLY TWO AUTHORIZED NEW FILES
  src/services/mbo-xlsx-template-preparer.js
  tests/mbo-xlsx-template-preparer.test.js
SCOPE_REVIEW = PASS
TOKEN_STATE = CONSUMED / DO NOT REUSE
GITHUB_COMBINED_STATUS = NONE
GITHUB_WORKFLOW_RUNS = NONE
RUNTIME_CERTIFICATION = NOT INDEPENDENTLY AVAILABLE
```

## 3. Accepted B1 improvements — preserve in corrective

The implementation is directionally correct and must not regress these accepted points:

- production source imports `xlsx-populate` + production Template Profile only;
- no Node `fs/path/crypto` imports in production source;
- no feasibility-harness import in production source;
- no proof sentinel injection;
- asynchronous bytes-in -> new `Uint8Array` bytes-out;
- caller bytes are copied before workbook mutation;
- production Profile integrity is validated before template-dependent mutation;
- objective count domain 4..10 fails closed;
- Part A SHA is validated with browser `globalThis.crypto.subtle` before mutation;
- accepted Part A row/cell shifting and row-28 cloning algorithm is ported from closed feasibility authority;
- dimension progression and Print_Area progression are implemented;
- page setup is not intentionally rewritten;
- base sensitive ranges are cleared before structural expansion, producing count-aware cleared final regions through accepted shift/clone geometry;
- shared-string purge exists for collected sensitive string values;
- no semantic/user-value writes, scoring, recalculation or Part B implementation were added;
- formula creation was not introduced;
- reference-image removal is isolated to the Part A production path rather than a broad generic framework.

These accepted points are not sufficient to close B1 because the exact fail-closed reference-image contract and required proof matrix remain incomplete.

## 4. MATERIAL BLOCKER A — reference-image identity/cardinality is not fail-closed

Authorized B1 requires exact pre-removal identity:

```text
DRAWING_ANCHOR = exactly one anchor with exact relationship embed rId3
RELATIONSHIP = exactly one tuple
  Id = rId3
  Type = http://schemas.openxmlformats.org/officeDocument/2006/relationships/image
  Target = ../media/image3.png
  TargetMode = absent/null
MEDIA = xl/media/image3.png exists as exact accepted target
```

Current production source only prechecks substring presence:

```text
drawingRels.includes('rId3')
drawingRels.includes('image3.png')
```

and then removes:
- any `twoCellAnchor` containing text `rId3`;
- any `<Relationship ... Id="rId3" .../>` regardless of Type/Target/cardinality.

Therefore malformed same-package states can pass the precheck, including examples where:
- `rId3` points to another target while another relationship mentions `image3.png`;
- `rId3` is non-image relationship type;
- more than one rId3 relationship/anchor exists;
- rId3 text exists in an anchor without being the exact embed relationship;
- `xl/media/image3.png` is missing before removal.

This violates the accepted Reference Image authority and B1 exact fail-closed contract.

### Required correction

Production B1 must use deterministic production parsing/validation for drawing anchors + drawing relationships and prove the exact tuple/cardinality before mutation. It may implement the smallest browser-safe parser/helper needed; it must not import the Node feasibility harness.

After removal it must prove:
- exact target anchor absent;
- exact rId3 relationship absent;
- exact media absent;
- no remaining relationship references image3.png;
- unrelated drawing relationship/media inventory is unchanged after normalizing only the accepted target removal.

## 5. MATERIAL BLOCKER B — focused proof matrix is materially incomplete

The authorized test contract and frozen Part A baseline require production-path proof for more than dimension/Print_Area/cell clearing.

Current focused test does prove:
- static browser-safety import boundary;
- no feasibility import/sentinel string;
- wrong SHA/count/profile rejection examples;
- caller bytes unchanged for wrong-SHA failure;
- real-template loop N4..N10 when local template is available;
- dimension / Print_Area / page setup spot assertions;
- sheet1 formula-node count zero;
- final sensitive cell clearing;
- basic rId3/image3 absence and branding rId1/rId2/rId4 presence;
- sample semantic fields remain blank.

But it does NOT yet prove the required frozen production structure/package contract:

1. exact numeric rowRefs sequence + uniqueness for N4..N10;
2. rows 1:28 structural identity preservation;
3. every inserted objective row is an exact normalized structural clone of source row 28 (cell refs/style pattern/row height/custom-height behavior);
4. every original downstream row >=29 relocates exactly by N-4 with no stale/duplicate/lost row identity;
5. complete expected merge inventory deep equality and declared merge count == actual inventory length for every N;
6. sheet names/states and other frozen structural metadata where required by `D2_PART_A_STRUCTURAL_CLOSURE.md`;
7. stale sensitive token absence from final sharedStrings/package content, not only final cell nulls;
8. same-count sanitization topology substitution / unexpected static mutation fail-closed proof specific to production B1;
9. complete unrelated relationship/media/drawing inventory equality after normalizing only accepted reference-image removal;
10. adversarial reference-image tuple/cardinality/missing-media/orphan conditions using the SAME production validator/removal path;
11. workbook-wide formula inventory exactly zero rather than only a sheet1 regex spot-check when multiple worksheet parts exist.

Tests may use accepted feasibility helpers only as TEST-SIDE oracle/inspection support. They must call the new production preparer for the actual mutation path and must not duplicate production insertion logic inside tests.

## 6. MATERIAL BLOCKER C — independent real-template runtime evidence unavailable

The B1 authorization explicitly states that an environment skip is not sufficient for closure and independent review must see an accepted real owner-template execution result.

Current repository truth provides:
- no combined CI status;
- no GitHub workflow run;
- no persisted independent runtime result for `node --test tests/mbo-xlsx-template-preparer.test.js`.

The integration test itself skips when the local owner template is unavailable. Therefore repository/source review cannot certify that the real-template matrix actually executed successfully in the executor environment.

A corrective implementation must still run the focused command against the exact local owner template and report explicitly whether the integration test executed (not skipped). Executor self-report alone does not replace source/test review, but a skipped matrix cannot close B1.

## 7. Exact next proposed corrective — NOT AUTHORIZED

```text
PROPOSED_WORK_PACKAGE = D2-WP004-R2-B1-R1
NAME = PART A REFERENCE-IDENTITY + PRODUCTION PROOF CORRECTIVE
STATE = PROPOSED / NOT AUTHORIZED
MODE = SOURCE+TEST CORRECTIVE / BOUNDED / ONE-SHOT / LOW-CREDIT

PROPOSED_WRITABLE_FILES =
  src/services/mbo-xlsx-template-preparer.js
  tests/mbo-xlsx-template-preparer.test.js

MAX_EXECUTOR_COMMITS = 1
```

Correct ONLY the three B1 review blockers above. Do not redesign the preparer and do not broaden beyond Part A.

### R1 source requirements
- preserve all accepted B1 implementation behavior;
- replace substring-based reference-image identity validation with exact deterministic production validation;
- require exact anchor/relationship/media identity and cardinality before mutation;
- reject wrong Type, wrong Target, duplicate/missing rId3, missing media, malformed anchor identity, or remaining image3 reference;
- preserve unrelated drawing relationship/media inventory after accepted normalization;
- no Node-only production dependency;
- no feasibility import;
- no sentinel;
- no Part B / semantic writer / scoring.

### R1 test requirements
Add production-path proofs for all missing items in Blocker B, especially:
- rowRefs/rows1:28/clone/downstream relocation;
- complete merge inventory/count;
- stale shared-string/package token purge;
- exact normalized relationship/media/drawing inventory;
- adversarial exact reference-image tuple/cardinality matrix;
- workbook-wide zero formulas;
- real-template N4..N10 execution.

Focused command remains:
`node --test tests/mbo-xlsx-template-preparer.test.js`

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
`อนุมัติ D2-WP004-R2-B1-R1 SOURCE+TEST CORRECTIVE ตามขอบเขตที่เสนอ`

```text
ACTIVE_WORK_PACKAGE = NONE
ANTIGRAVITY = STOP / WAIT OWNER
PRODUCTION_RENDERER = B1 NOT CLOSED
R2-B2 = NOT AUTHORIZED
R2-C = NOT AUTHORIZED
D3 = HOLD
```
