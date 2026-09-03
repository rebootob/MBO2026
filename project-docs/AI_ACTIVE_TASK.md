# AI ACTIVE TASK — R2-B1-R5 REVIEWED / TEST PROOF STILL INCOMPLETE / R6 PROPOSED

Mode: **CONTROL PLANE / NO ACTIVE EXECUTOR / LOW-CREDIT / NO KINTONE / NO DEPLOY / D3 HOLD**
Branch: `ai/antigravity-wp002c`
Updated: 2026-09-03 ICT

Read `D2_REVIEW_FAST_START.md` first, then this file, then the R2 renderer/sanitizer design, `CONFIRMED_BASELINE/D2_PART_A_STRUCTURAL_CLOSURE.md`, and only exact Part A profile/source/test evidence needed.

## 1. Current truth

```text
D1 = PASS / CLOSED
D2 = IN PROGRESS
D2_PART_A_STRUCTURAL = PASS / CLOSED
D2_XLSX_TEMPLATE_PROFILE = PASS / CLOSED
D2_WP004_R2_A = PASS / CLOSED AFTER R1
D2_WP004_R2_B1 = NEEDS TEST-ONLY CORRECTIVE / NOT CLOSED
D2_WP004_R2_B1_R4 = SOURCE REVIEW PASS / SOURCE FROZEN
D2_WP004_R2_B1_R5 = REVIEWED / TEST PROOF INCOMPLETE / NOT CLOSED

ACTIVE_WORK_PACKAGE = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE

ANTIGRAVITY = STOP / WAIT OWNER
R2_B1_PRODUCTION_SOURCE = ACCEPTED / FROZEN
R2-B2 = NOT AUTHORIZED
R2-C = NOT AUTHORIZED
D3 = HOLD
```

## 2. R5 identity / scope review

```text
R5_AUTHORIZATION_TOKEN = D2-WP004-R2-B1-R5-TEST-ONLY-CORRECTIVE-20260903-01
R5_AUTHORIZATION_COMMIT = e6700ff83ba1627b5fcdac181f23641df7ae14f7
R5_IMPLEMENTATION_COMMIT = 961febd3e62164d05ed5448e1868d62287dcb4c3
AUTH_TO_IMPLEMENTATION = EXACTLY ONE COMMIT
CHANGED_FILES = EXACTLY ONE AUTHORIZED FILE
  tests/mbo-xlsx-template-preparer.test.js
SCOPE_REVIEW = PASS
TOKEN_STATE = CONSUMED / DO NOT REUSE
GITHUB_COMBINED_STATUS = NONE
GITHUB_WORKFLOW_RUNS = NONE
```

R5 accepted improvements:
- missing owner template now FAILS instead of returning null;
- owner-template SHA mismatch now FAILS;
- integration test no longer uses `t.skip()` for missing/wrong owner template;
- exact page-setup assertions have explicit failure messages;
- stale sensitive token checks now include `sheet1.xml` in addition to `sharedStrings.xml`.

These improvements are accepted but do not satisfy the full R5 authorization contract.

## 3. MATERIAL TEST BLOCKER A — exact row structural equality still not proven

Current `parseRowObjects()` stores selected fields and a `{col, style}` cell list. Integration assertions still iterate SOURCE cells and look for matching OUTPUT cells. This remains one-way inclusion rather than exact structural equality.

Required remaining proof for rows 1:28, inserted rows, and relocated downstream rows:
- deterministic normalized row-attribute object equality after removing/rewriting only row-number authority;
- exact ordered cell structural inventory deep equality;
- exact cell-column/reference topology and style pattern;
- output cell count must equal expected cell count;
- no extra cells and no missing cells;
- inserted row = exact normalized source row 28 at target row;
- downstream row = exact normalized source row at relocated row;
- no stale/lost/duplicate downstream structural identity.

Do not use source-subset `.find()` proof as closure evidence.

## 4. MATERIAL TEST BLOCKER B — frozen metadata/package object still incomplete

Frozen baseline requires exact equality for:

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

Current test still does not fully prove this deterministic object:
- `sheetStates` is not asserted;
- `fitToPage` is not explicitly source-derived/asserted;
- pageMargins / printOptions / sheetProtection are guarded by `if (sourceTag)` and therefore do not prove source-absence equals output-absence;
- relationship proof is limited to selected drawing/sheet relationship files rather than complete normalized relevant package relationship-tuple inventory;
- `colsHash` is not explicitly derived as a deterministic authority object, even though exact cols XML is partially compared.

R6 must build one source-derived frozen metadata/package object and deep-equal the normalized output object for every N4..N10.

## 5. MATERIAL TEST BLOCKER C — privacy/profile proof still incomplete

Current R5 test checks privacy strings in sensitive cells, `sharedStrings.xml`, and `sheet1.xml` only.

Still required:
- protected/static topology mutation rejection through real `validateMappingIntegrity()`;
- stale sensitive tokens absent from all relevant UTF-8 XML/text package entries, excluding only explicitly justified source-authorized static text;
- do not inspect binary media as text.

Same-count sanitization substitution proof is accepted and must remain.

## 6. Runtime evidence

The focused integration can no longer silently skip, which is accepted. However repository truth for R5 still exposes no combined CI status and no workflow run. No persisted independent runtime artifact is available in GitHub.

For closure, executor must run exactly:

`node --test tests/mbo-xlsx-template-preparer.test.js`

and report:

```text
FAIL = 0
SKIP = 0
real owner-template integration = EXECUTED / NOT SKIPPED
N4..N10 matrix = PASS
```

Do not claim closure if the focused command fails.

## 7. Exact next proposed corrective — NOT AUTHORIZED

```text
PROPOSED_WORK_PACKAGE = D2-WP004-R2-B1-R6
NAME = PART A EXACT PROOF MATRIX COMPLETION
STATE = PROPOSED / NOT AUTHORIZED
MODE = TEST-ONLY CORRECTIVE / BOUNDED / ONE-SHOT / LOW-CREDIT

PROPOSED_WRITABLE_FILES =
  tests/mbo-xlsx-template-preparer.test.js

SOURCE_CHANGE_AUTH = NONE
PROFILE_CHANGE_AUTH = NONE
MAX_EXECUTOR_COMMITS = 1
```

R6 must correct ONLY Blockers A-C and run the focused owner-template test. Do not modify production source/profile.

## 8. R6 forbidden scope

```text
src/services/mbo-xlsx-template-preparer.js = FROZEN / FORBIDDEN
src/profiles/mbo-xlsx-template-profile.js = FROZEN / FORBIDDEN
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

## 9. Owner decision

No execution is authorized now.

Recommended approval phrase:
`อนุมัติ D2-WP004-R2-B1-R6 TEST-ONLY CORRECTIVE ตามขอบเขตที่เสนอ`

```text
ACTIVE_WORK_PACKAGE = NONE
ANTIGRAVITY = STOP / WAIT OWNER
R2_B1_SOURCE = ACCEPTED / FROZEN
R2_B1_TEST_PROOF = NOT CLOSED
R2-B2 = NOT AUTHORIZED
R2-C = NOT AUTHORIZED
D3 = HOLD
```
