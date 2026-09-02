# AI ACTIVE TASK — R2-B1-R4 SOURCE ACCEPTED / TEST PROOF INCOMPLETE / R5 PROPOSED

Mode: **CONTROL PLANE / NO ACTIVE EXECUTOR / LOW-CREDIT / NO KINTONE / NO DEPLOY / D3 HOLD**
Branch: `ai/antigravity-wp002c`
Updated: 2026-09-03 ICT

Fresh-fetch current HEAD first. Fast path: `D2_REVIEW_FAST_START.md` -> this file -> `phase-3/D2_WP004_R2_RENDERER_SANITIZER_DESIGN.md` -> `CONFIRMED_BASELINE/D2_PART_A_STRUCTURAL_CLOSURE.md` -> exact Part A profile/B1 source+test only.

## 1. Current truth

```text
OWNER_OBJECTIVE = COMPLETE D2 TO PASS / CLOSED BEFORE D3
D1 = PASS / CLOSED
D2 = IN PROGRESS
D2_PART_A_STRUCTURAL = PASS / CLOSED
D2_XLSX_TEMPLATE_PROFILE = PASS / CLOSED
D2_WP004_R2_A = PASS / CLOSED AFTER R1
D2_WP004_R2_B1 = NEEDS TEST-ONLY CORRECTIVE / NOT CLOSED
D2_WP004_R2_B1_R1 = NOT CLOSED
D2_WP004_R2_B1_R2 = NOT CLOSED
D2_WP004_R2_B1_R3 = NOT CLOSED
D2_WP004_R2_B1_R4 = SOURCE REVIEW PASS / TEST PROOF INCOMPLETE

ACTIVE_WORK_PACKAGE = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE

ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
R2_B1_PRODUCTION_SOURCE = ACCEPTED / FREEZE PENDING TEST CLOSURE
R2-B2 = NOT AUTHORIZED
R2-C = NOT AUTHORIZED
D3 = HOLD
```

## 2. R4 identity / scope review

```text
R4_AUTHORIZATION_TOKEN = D2-WP004-R2-B1-R4-SOURCE-TEST-CORRECTIVE-20260903-01
R4_AUTHORIZATION_COMMIT = 83928aff4bae8d8e1160897fbe78524f856e996f
R4_IMPLEMENTATION_COMMIT = fc9b1a87f3883c49eb30f918189c679f5a1aa411
AUTH_TO_IMPLEMENTATION = EXACTLY ONE COMMIT
CHANGED_FILES = EXACTLY TWO AUTHORIZED FILES
  src/services/mbo-xlsx-template-preparer.js
  tests/mbo-xlsx-template-preparer.test.js
SCOPE_REVIEW = PASS
TOKEN_STATE = CONSUMED / DO NOT REUSE
GITHUB_COMBINED_STATUS = NONE
GITHUB_WORKFLOW_RUNS = NONE
```

## 3. R4 SOURCE REVIEW = PASS / FREEZE

The R4 production-source corrective is accepted. Do not modify `src/services/mbo-xlsx-template-preparer.js` again unless a new independently proven source defect appears.

Accepted production behavior now includes:
- browser-safe Part A preparer; no Node fs/path/crypto production dependency;
- exact owner SHA gate before template-dependent mutation;
- caller bytes copied before mutation;
- sentinel-free Part A N4..N10 row/merge relocation;
- Profile-driven sanitization foundation;
- shared production `validateAndRemoveReferenceImage()` helper used by real preparer and adversarial tests;
- accepted rId3 relationship is exactly one canonical self-closing `<Relationship .../>` element;
- paired/open-only/namespace-prefixed/mixed duplicate rId3 evidence rejects;
- exact Type / Target `../media/image3.png` / TargetMode absent / media existence / embed cardinality enforced;
- updated drawing rels must contain zero rId3 and zero image3.png;
- other `.rels` files are scanned before media removal;
- no semantic writer, scoring, Part B, Kintone, deploy or D3 scope.

R5 must be TEST-ONLY. Production source is frozen for R5.

## 4. R4 TEST IMPROVEMENTS ACCEPTED

R4 tests materially improved proof by adding:
- canonical self-closing rejection matrix;
- source-derived row object inspection;
- source-derived complete merge-set equality;
- source cols/pageMargins/printOptions/sheetProtection/sheetRels comparisons;
- source-derived media inventory minus image3;
- drawing1 relationship and anchor normalization checks;
- stale-token sharedStrings proof;
- same-count sanitization substitution proof;
- workbook-wide zero-formula proof.

These are accepted but still insufficient to satisfy the exact frozen R4 test contract.

## 5. MATERIAL TEST BLOCKER A — row structural equality is still one-way / partial

Current test iterates source cells and confirms matching output cells/styles, but does not prove output has no extra structural cells. It also compares selected row attributes rather than one exact normalized structural identity.

R5 must TEST-ONLY prove for rows 1:28, inserted rows, and relocated downstream rows:
- exact normalized row-attribute map equality after removing/rewriting only row number authority;
- exact ordered cell structural inventory equality, not source-subset inclusion;
- exact cell column/reference topology;
- exact style index/pattern;
- exact height/customHeight/customFormat and any other structurally relevant row attributes from source;
- no extra cells, no missing cells;
- inserted row identity = source row 28 normalized to target row;
- downstream identity = exact source row normalized to relocated row;
- no stale/lost/duplicate downstream structural identity.

Authorized sanitized values may differ; structural topology must not.

## 6. MATERIAL TEST BLOCKER B — frozen baseline matrix is not complete

`D2_PART_A_STRUCTURAL_CLOSURE.md` requires exact baseline equality for:

```text
sheetNames
sheetStates
colsHash
showGridLines
pageMargins
paperSize
orientation
scale
fitToPage
horizontalCentered
verticalCentered
sheetProtection
sheetRels
relationship tuples
media inventory
formula inventory = EMPTY
```

Current R4 test does not yet explicitly and completely prove all of these. In particular:
- `sheetStates` is not asserted;
- `fitToPage` is not explicitly source-derived and asserted;
- conditional checks can miss an output-added tag when the source tag is absent;
- complete relationship tuple inventory across the relevant package is not deep-compared; drawing1 rels + sheet1 rels alone are insufficient for the frozen relationship-tuples authority;
- `colsHash` may be proven by exact cols XML equality, but R5 should make the equivalence explicit and deterministic;
- source absence must equal output absence for pageMargins/printOptions/sheetProtection and other frozen metadata, not skip assertion.

R5 must derive the frozen metadata object from exact source and deep-equal the normalized output object for every N4..N10.

## 7. MATERIAL TEST BLOCKER C — privacy/profile proof incomplete

R4 still lacks:
- protected/static topology mutation rejection through production `validateMappingIntegrity()`;
- stale sensitive source-token absence from relevant final XML/package text beyond sharedStrings and sensitive cells.

R5 must add these without changing production source/profile.

For package stale-token proof, inspect relevant UTF-8 XML/text package entries and exclude only explicitly source-authorized static/non-sensitive text when justified. Do not inspect binary media as text.

## 8. MATERIAL TEST BLOCKER D — real-template test can still SKIP

Current focused integration test still does:

```text
if owner template unavailable or SHA mismatch -> t.skip(...)
```

This permits a green test command without executing the real N4..N10 owner-template matrix.

R5 must remove this closure ambiguity TEST-SIDE only:
- focused B1 integration test must FAIL CLOSED if exact owner Part A template is unavailable or SHA mismatched;
- do not silently skip the real owner-template matrix;
- synthetic/browser-safety tests remain always-runnable;
- executor must run exact focused command with owner template present.

GitHub currently exposes no combined CI status and no workflow runs. Closure may rely on independent source/test-contract review plus an executor run report only if the focused test itself can no longer pass by skipping owner-template integration.

## 9. Exact next proposed corrective — NOT AUTHORIZED

```text
PROPOSED_WORK_PACKAGE = D2-WP004-R2-B1-R5
NAME = PART A FROZEN PROOF CLOSURE
STATE = PROPOSED / NOT AUTHORIZED
MODE = TEST-ONLY CORRECTIVE / BOUNDED / ONE-SHOT / LOW-CREDIT

PROPOSED_WRITABLE_FILES =
  tests/mbo-xlsx-template-preparer.test.js

SOURCE_CHANGE_AUTH = NONE
PROFILE_CHANGE_AUTH = NONE
MAX_EXECUTOR_COMMITS = 1
```

R5 goals:
1. exact normalized row identity equality including no-extra/no-missing cells;
2. exact inserted row-28 clone identity;
3. exact downstream relocated identity and no stale/lost/duplicate structure;
4. exact source-derived frozen metadata object equality including sheetStates and fitToPage;
5. complete normalized relationship tuple inventory equality;
6. complete media inventory equality minus only image3;
7. protected/static topology mutation rejection through production validator;
8. stale sensitive token absence from relevant final XML/package text;
9. owner-template integration FAILS rather than SKIPS if template unavailable/SHA mismatch;
10. focused command passes with PASS/FAIL/SKIP report and N4..N10 PASS.

## 10. R5 forbidden scope

```text
src/services/mbo-xlsx-template-preparer.js = FROZEN / FORBIDDEN
src/profiles/mbo-xlsx-template-profile.js = FORBIDDEN
src/services/mbo-export-service.js = FORBIDDEN
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

## 11. Owner decision

No execution is authorized now.

Recommended approval phrase:
`อนุมัติ D2-WP004-R2-B1-R5 TEST-ONLY CORRECTIVE ตามขอบเขตที่เสนอ`

```text
ACTIVE_WORK_PACKAGE = NONE
ANTIGRAVITY = STOP / WAIT OWNER
R2_B1_SOURCE = ACCEPTED / FROZEN
R2_B1_TEST_PROOF = NOT CLOSED
R2-B2 = NOT AUTHORIZED
R2-C = NOT AUTHORIZED
D3 = HOLD
```
