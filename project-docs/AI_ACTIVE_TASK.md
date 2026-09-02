# AI ACTIVE TASK — R2-B1-R1 AUTHORIZED / ACTIVE

Mode: **CONTROL PLANE / BOUNDED EXECUTOR AUTHORIZED / LOW-CREDIT / NO KINTONE / NO DEPLOY / D3 HOLD**
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
D2_WP004_R2_B1_R1 = AUTHORIZED / ACTIVE

SAFE_TO_MAP = 20 EXACT
UNRESOLVED = 22 EXACT
NO_SECURED_PROJECTION_SOURCE = 5 EXACT
CHIEF_FROZEN_AUTHORITY = R:X / NOT SECURED WRITABLE

ACTIVE_WORK_PACKAGE = D2-WP004-R2-B1-R1
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP004-R2-B1-R1-SOURCE-TEST-CORRECTIVE-20260903-01
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP004-R2-B1-R1-SOURCE-TEST-CORRECTIVE-20260903-01
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = D2-WP004-R2-B1-R1-SOURCE-TEST-CORRECTIVE-20260903-01 / PART-A PREPARER CORRECTIVE ONLY
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE

ANTIGRAVITY = AUTHORIZED / BOUNDED CORRECTIVE / ONE-SHOT / ONE COMMIT -> PUSH -> STOP
CLAUDE = STOP
PRODUCTION_RENDERER = B1 CORRECTIVE ONLY / B2+C NOT AUTHORIZED
D3 = HOLD
```

## 2. Authorization identity

```text
WORK_PACKAGE = D2-WP004-R2-B1-R1
NAME = PART A REFERENCE-IDENTITY + PRODUCTION PROOF CORRECTIVE
STATE = AUTHORIZED / ACTIVE
MODE = SOURCE+TEST CORRECTIVE / BOUNDED / ONE-SHOT / LOW-CREDIT
AUTHORIZATION_TOKEN = D2-WP004-R2-B1-R1-SOURCE-TEST-CORRECTIVE-20260903-01
AUTHORIZATION_BASIS_HEAD = 6b548f986e6031411eed13f79df02d0471582ef0
MAX_EXECUTOR_COMMITS = 1
EXECUTOR = ANTIGRAVITY
FINAL_EXECUTOR_STATE = CORRECTIVE COMPLETE / AWAITING CHATGPT INDEPENDENT REVIEW
```

Owner authorization received exactly:
`อนุมัติ D2-WP004-R2-B1-R1 SOURCE+TEST CORRECTIVE ตามขอบเขตที่เสนอ`

The token is single-use. Antigravity must not self-declare PASS/CLOSED and must STOP immediately after one corrective implementation commit is pushed.

## 3. Prior B1 implementation identity / accepted scope

```text
R2_B1_AUTHORIZATION_TOKEN = D2-WP004-R2-B1-SOURCE-TEST-20260902-01
R2_B1_AUTHORIZATION_COMMIT = 2c34a164f978be97b5878027d7f0fef9843823ef
R2_B1_IMPLEMENTATION_COMMIT = aa7230e8c6449333f4d8079a2db935d0fa4dba7a
AUTH_TO_IMPLEMENTATION = EXACTLY ONE COMMIT
CHANGED_FILES = EXACTLY TWO AUTHORIZED FILES
  src/services/mbo-xlsx-template-preparer.js
  tests/mbo-xlsx-template-preparer.test.js
SCOPE_REVIEW = PASS
R2_B1_TOKEN_STATE = CONSUMED / DO NOT REUSE
GITHUB_COMBINED_STATUS = NONE
GITHUB_WORKFLOW_RUNS = NONE
```

Accepted B1 behavior that MUST NOT regress:
- production source imports `xlsx-populate` + production Template Profile only;
- no Node `fs/path/crypto` imports in production source;
- no feasibility-harness import in production source;
- no proof sentinel injection;
- async bytes-in -> new `Uint8Array` bytes-out;
- caller/source bytes copied before workbook mutation;
- production Profile integrity validated before template-dependent mutation;
- objective count domain 4..10 fail-closed;
- exact Part A SHA validated with browser `globalThis.crypto.subtle` before mutation;
- accepted Part A row/cell shifting + row-28 clone algorithm preserved;
- dimension / Print_Area progression preserved;
- page setup not intentionally rewritten;
- Profile-driven sensitive clearing retained;
- stale/shared-string purge foundation retained;
- no semantic/user writes, scoring, recalculation or Part B implementation;
- no formula creation introduced.

## 4. Exact writable scope

Antigravity may modify ONLY:

```text
src/services/mbo-xlsx-template-preparer.js
tests/mbo-xlsx-template-preparer.test.js
```

Forbidden:

```text
src/services/mbo-export-service.js
src/profiles/mbo-xlsx-template-profile.js
scripts/export/mbo-xlsx-ooxml-feasibility.js
tests/mbo-xlsx-ooxml-feasibility.test.js
project-docs/*
package.json
package-lock.json
dist/*
UI / integration
Part B production implementation
R2-C semantic renderer
Combined Excel
Kintone write/deploy/Live UAT
D3
```

No redesign and no broad generic framework.

## 5. MATERIAL BLOCKER A — exact reference-image identity/cardinality

R1 must replace substring-based prechecks with deterministic production validation BEFORE mutation.

Required exact pre-removal authority:

```text
DRAWING_ANCHOR:
  exactly one drawing anchor embeds exact relationship id rId3

RELATIONSHIP:
  exactly one tuple
  Id = rId3
  Type = http://schemas.openxmlformats.org/officeDocument/2006/relationships/image
  Target = ../media/image3.png
  TargetMode = absent/null

MEDIA:
  xl/media/image3.png exists exactly as accepted target
```

Must fail closed on:
- missing rId3 relationship;
- duplicate rId3 relationship;
- wrong Type;
- wrong Target;
- external TargetMode;
- zero or multiple exact rId3 anchors;
- incidental `rId3` text that is not the exact image embed;
- missing `xl/media/image3.png`;
- remaining relationship reference to image3.png after target relationship normalization.

Removal must delete ONLY:
- exact accepted rId3 anchor;
- exact accepted rId3 relationship;
- exact `xl/media/image3.png` after proving no remaining reference.

After removal production/test must prove:
- exact target anchor absent;
- exact target relationship absent;
- exact target media absent;
- no remaining relationship references image3.png;
- unrelated drawing relationship/media inventory is unchanged after normalizing only the accepted target removal;
- accepted branding topology including rId1/rId2 remains intact.

Production implementation must remain browser-safe and must not import feasibility proof code.

## 6. MATERIAL BLOCKER B — complete production proof matrix

Focused tests must call the REAL production preparer for mutation and add credible test-side inspection/oracle proof for the missing frozen Part A requirements.

Required real-template N4..N10 proofs:
1. exact numeric rowRefs sequence derived from source baseline;
2. rowRefs unique and no unexpected row nodes;
3. rows 1:28 structural identity preserved;
4. every inserted objective row is an exact normalized clone of source row 28 for cell refs, style pattern, row height and custom-height behavior;
5. every original downstream row >=29 relocates exactly by N-4 without stale/lost/duplicate identity;
6. complete expected merge inventory deep equality;
7. declared merge count equals actual merge inventory length;
8. exact dimensions A1:BL52..A1:BL58;
9. exact Print_Area BJ52..BJ58;
10. page setup paperSize=8 / landscape / scale=58;
11. sheet names/states and directly relevant frozen structural metadata remain preserved where required by `D2_PART_A_STRUCTURAL_CLOSURE.md`;
12. every Profile `effectiveSanitizationRanges` address is sanitized;
13. stale sensitive tokens collected pre-sanitize are absent from final cell/sharedStrings/package content where frozen privacy proof requires purge;
14. same-count sanitization topology substitution / unexpected protected-static mutation rejects through production validation;
15. exact normalized reference-image removal proof;
16. complete unrelated relationship/media/drawing inventory equality after accepted target normalization;
17. adversarial wrong reference tuple/cardinality/missing-media/orphan cases reject through SAME production validation/removal path;
18. workbook-wide formula inventory exactly zero for N4..N10, not only sheet1 spot-check;
19. caller bytes remain identical on success and failure paths;
20. no semantic/user values, scoring/recalculation or Part B mutation.

Tests may reuse accepted feasibility helpers ONLY as TEST-SIDE oracle/inspection support. They must not duplicate production insertion/removal logic as the actual implementation path.

## 7. MATERIAL BLOCKER C — real-template runtime evidence

Focused command:

`node --test tests/mbo-xlsx-template-preparer.test.js`

Antigravity must run it with the exact local Part A owner template present and SHA-matching.

The final report must state explicitly:
- exact command;
- pass/fail counts;
- whether the real owner-template integration test EXECUTED and DID NOT SKIP;
- N4..N10 matrix result.

If the owner template is unavailable or the integration test skips, DO NOT claim completion sufficient for closure. Report the limitation and STOP after the authorized commit only if the corrective source/test work itself is complete.

Executor self-report does not replace ChatGPT independent source/test review, but a skipped real-template matrix cannot close B1.

## 8. Production safety boundaries

Production source MUST NOT import/use:

```text
node:fs
node:path
node:crypto
filesystem template discovery
process.cwd / process.env template lookup
scripts/export/mbo-xlsx-ooxml-feasibility.js
proof sentinels
Kintone APIs
raw App794 records
```

Preserve exact Part A template SHA authority:

`03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3`

Preserve:

```text
N = 4..10
SOURCE_CLONE_ROW = 28
DOWNSTREAM_THRESHOLD_ROW = 29
DIMENSION = A1:BL52 .. A1:BL58
PRINT_AREA = 'MBO Staff & Chief'!$A$1:$BJ$52 .. $BJ$58
PAPER_SIZE = 8
ORIENTATION = landscape
SCALE = 58
FORMULA_AUTHORITY = 0
```

## 9. Executor protocol

Antigravity must execute exactly:

```text
fresh-fetch canonical branch
-> verify HEAD equals authorization commit supplied by Control Plane
-> read D2_REVIEW_FAST_START.md
-> read this AI_ACTIVE_TASK.md
-> read R2 renderer/sanitizer design
-> inspect only relevant Part A baseline/profile/B1 source+test/reference-image proof
-> correct only two authorized files
-> run focused real-template tests
-> verify git diff contains only two authorized files
-> exactly one corrective implementation commit
-> push canonical branch
-> report SHA + exact files + test result + real-template execution status
-> STOP
```

Do not modify control docs. Do not begin R2-B2/R2-C. Do not deploy. Do not perform Kintone writes.

Expected executor final status:
`R2-B1-R1 CORRECTIVE COMPLETE / AWAITING CHATGPT INDEPENDENT REVIEW`

## 10. Independent review gate

After push, ChatGPT Control Plane will independently fresh-fetch and verify:
- exactly one executor commit after this authorization;
- exactly two authorized files changed;
- accepted B1 behavior did not regress;
- exact deterministic reference-image parser/validation is non-circular and fail-closed;
- adversarial reference cases hit production code;
- full Part A N4..N10 structural/package/privacy proof matrix is credible;
- real-template integration evidence executed, not skipped;
- no B2/R2-C/semantic/scoring scope expansion;
- GitHub status/workflow signal when available.

Executor self-certification is not sufficient for PASS/CLOSED.

## 11. Remaining work — NOT AUTHORIZED

```text
R2-B2 = PART B SENTINEL-FREE PRODUCTION TEMPLATE PREPARER / SANITIZER EXPANSION
R2-C = SECURED SEMANTIC VALUE RENDERER
COMBINED_EXCEL_PARITY = later D2 gate
D2_FINAL_CLOSURE = after production preparer + semantic renderer + parity closure
D3 = HOLD UNTIL D2 PASS / CLOSED
```
