# AI ACTIVE TASK — R2-B1-R3 NEEDS CORRECTIVE / R4 PROPOSED

Mode: **CONTROL PLANE / NO ACTIVE EXECUTOR / LOW-CREDIT / NO KINTONE / NO DEPLOY / D3 HOLD**
Branch: `ai/antigravity-wp002c`
Updated: 2026-09-03 ICT

Fresh-fetch current HEAD first. Fast path: `D2_REVIEW_FAST_START.md` -> this file -> `phase-3/D2_WP004_R2_RENDERER_SANITIZER_DESIGN.md` -> directly relevant Part A baseline/profile/B1 source+test only.

## 1. Current truth

```text
OWNER_OBJECTIVE = COMPLETE D2 TO PASS / CLOSED BEFORE D3
D1 = PASS / CLOSED
D2 = IN PROGRESS
D2_PART_A_STRUCTURAL = PASS / CLOSED
D2_XLSX_TEMPLATE_PROFILE = PASS / CLOSED
D2_WP004_R2_A = PASS / CLOSED AFTER R1
D2_WP004_R2_B1 = NEEDS CORRECTIVE / NOT CLOSED
D2_WP004_R2_B1_R1 = NEEDS CORRECTIVE / NOT CLOSED
D2_WP004_R2_B1_R2 = NEEDS CORRECTIVE / NOT CLOSED
D2_WP004_R2_B1_R3 = NEEDS CORRECTIVE / NOT CLOSED

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

## 2. R3 implementation identity / scope review

```text
R3_AUTHORIZATION_TOKEN = D2-WP004-R2-B1-R3-SOURCE-TEST-CORRECTIVE-20260903-01
R3_AUTHORIZATION_COMMIT = ee2cd8edcac49efd900435feed5d78381e0ee01c
R3_IMPLEMENTATION_COMMIT = 4f7ea4a4f4e84c1f8e88f2aee1ac17f4f067f0df
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

Accepted R3 improvements that MUST NOT regress:
- exact owner SHA gate remains before workbook/package mutation;
- production remains browser-safe and Part-A-only;
- shared production helper remains used by real preparer and adversarial tests;
- exact Target `../media/image3.png`, TargetMode absent, exact embed cardinality and media existence remain enforced;
- rId3 occurrence accounting now sees mixed syntactic evidence instead of self-closing-only discovery;
- namespace-prefixed / duplicate / open-only malformed cases are explicitly tested;
- updated drawing rels are checked for zero surviving `rId3` / `image3.png`;
- complete merge set is now source-derived and deep-compared;
- stale source tokens are checked against final sharedStrings;
- same-count sanitization substitution is tested through production profile validation;
- no semantic writer, scoring, Part B, Kintone or deploy scope expansion.

## 3. MATERIAL BLOCKER A — canonical rId3 syntax is still widened

R3 contract required non-self-closing rId3 relationship evidence to reject. Current helper explicitly treats a paired form such as:

`<Relationship ... Id="rId3" ...></Relationship>`

as valid when it is the only rId3 relationship and the tuple otherwise matches, because `isPairedClosing` is accepted.

Required next correction:
- canonical accepted rId3 relationship syntax must be exactly one self-closing `<Relationship .../>` element;
- a single paired/non-self-closing rId3 relationship must reject, not only a duplicate paired relationship;
- open-only, paired, namespace-prefixed, mixed duplicate and malformed rId3 evidence must all fail closed;
- retain exact Type/Target/TargetMode/embed/media gates and post-removal zero-reference proof.

## 4. MATERIAL BLOCKER B — frozen Part A deep row identity proof still incomplete

Frozen baseline requires rows 1:28 exact structural identity; inserted rows exact normalized row-28 clones for cell refs, style pattern, row height and custom-height behavior; and downstream rows >=29 exact relocated structural identity.

Current R3 test still mainly proves:
- row number sequence/uniqueness;
- rows 1:28 presence plus height/customHeight spot checks;
- inserted rows presence plus fixed `ht` / `customFormat` spot checks;
- downstream target row numbers.

It does NOT yet deep-compare source-derived normalized row identities for:
- cell reference inventory;
- cell style indices/pattern;
- exact row attributes including height/customHeight/customFormat where applicable;
- inserted row-28 normalized clone identity;
- downstream original-row normalized identity after relocation;
- stale/lost/duplicate downstream structural identity.

## 5. MATERIAL BLOCKER C — frozen sheet/package parity still incomplete

`D2_PART_A_STRUCTURAL_CLOSURE.md` requires exact baseline equality for:
- `sheetNames` and `sheetStates`;
- `colsHash`;
- `showGridLines`;
- `pageMargins`;
- `paperSize`, `orientation`, `scale`;
- `fitToPage`;
- `horizontalCentered`, `verticalCentered`;
- `sheetProtection`;
- `sheetRels`;
- relationship tuples;
- media inventory;
- formula inventory empty.

Current R3 tests prove page setup, sheet name, exact normalized drawing1 rels/drawing XML, and selected media presence, but not the complete baseline matrix above.

Required next proof:
- derive these authorities from the exact source template and deep-equal N4..N10 output;
- deep-equal complete non-target relationship tuple inventory and complete media inventory after normalizing only accepted rId3/image3 removal;
- add protected/static topology mutation rejection through production profile validation;
- extend stale sensitive token proof to relevant final XML/package text required by the frozen privacy contract, not sharedStrings only.

## 6. Runtime evidence

Repository truth for R3 exposes no combined CI status and no GitHub workflow run. The integration test still has a local-template skip path. Executor must run:

`node --test tests/mbo-xlsx-template-preparer.test.js`

with the exact owner template present and report exact PASS/FAIL/SKIP plus `real owner-template integration = EXECUTED / NOT SKIPPED` and `N4..N10 matrix = PASS`.

## 7. Exact next proposed corrective — NOT AUTHORIZED

```text
PROPOSED_WORK_PACKAGE = D2-WP004-R2-B1-R4
NAME = PART A CANONICAL RELATIONSHIP + FROZEN BASELINE PARITY COMPLETION
STATE = PROPOSED / NOT AUTHORIZED
MODE = SOURCE+TEST CORRECTIVE / BOUNDED / ONE-SHOT / LOW-CREDIT

PROPOSED_WRITABLE_FILES =
  src/services/mbo-xlsx-template-preparer.js
  tests/mbo-xlsx-template-preparer.test.js

MAX_EXECUTOR_COMMITS = 1
```

R4 must correct ONLY Blockers A-C and provide the required real-template run report. Production source change should remain minimal: close the single non-self-closing canonical-syntax gap without redesigning the preparer.

## 8. Forbidden scope remains

```text
src/services/mbo-export-service.js = FORBIDDEN
src/profiles/mbo-xlsx-template-profile.js = FORBIDDEN
scripts/export/mbo-xlsx-ooxml-feasibility.js = FORBIDDEN
tests/mbo-xlsx-ooxml-feasibility.test.js = FORBIDDEN
project-docs/* = FORBIDDEN TO EXECUTOR
package.json / package-lock.json = FORBIDDEN
UI / dist / integration = FORBIDDEN
R2-B2 = NOT AUTHORIZED
R2-C = NOT AUTHORIZED
Combined Excel = NOT AUTHORIZED
Kintone write/deploy/Live UAT = FORBIDDEN
D3 = HOLD
```

## 9. Owner decision

No execution is authorized now.

Recommended approval phrase:
`อนุมัติ D2-WP004-R2-B1-R4 SOURCE+TEST CORRECTIVE ตามขอบเขตที่เสนอ`

```text
ACTIVE_WORK_PACKAGE = NONE
ANTIGRAVITY = STOP / WAIT OWNER
PRODUCTION_RENDERER = B1 NOT CLOSED
R2-B2 = NOT AUTHORIZED
R2-C = NOT AUTHORIZED
D3 = HOLD
```
