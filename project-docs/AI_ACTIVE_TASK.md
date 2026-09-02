# AI ACTIVE TASK — D2-WP004-R2-PRE1-R1 EVIDENCE-CORRECTIVE AUTHORIZED

Mode: **CONTROL PLANE / ANTIGRAVITY BOUNDED ONE-SHOT / EVIDENCE-CORRECTIVE ONLY / NO SOURCE AUTH / NO TEST AUTH / NO PROFILE AUTH / NO RENDERER AUTH / NO KINTONE / NO DEPLOY / D3 HOLD**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-02 ICT

Fresh-fetch current HEAD first. Fast path: `D2_REVIEW_FAST_START.md` -> this file -> existing PRE1 evidence -> only exact R1 inputs listed below.

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
R2_READ_ONLY_DESIGN = COMPLETE

D2_WP004_R2_PRE1 = NEEDS CORRECTIVE / NOT CLOSED
ACTIVE_WORK_PACKAGE = D2-WP004-R2-PRE1-R1
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = D2-WP004-R2-PRE1-R1-EVIDENCE-CORRECTIVE-20260902-01
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE

ANTIGRAVITY = AUTHORIZED / BOUNDED EVIDENCE-CORRECTIVE ONLY / ONE COMMIT -> PUSH -> STOP
CLAUDE = STOP
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```

Owner authorization phrase:
`อนุมัติ D2-WP004-R2-PRE1-R1 EVIDENCE-CORRECTIVE ตามขอบเขตที่เสนอ`

## 2. PRE1 review authority and blocker
```text
PRE1_AUTHORIZATION = D2-WP004-R2-PRE1-EVIDENCE-20260902-01
PRE1_AUTHORIZATION_COMMIT = 87c31ac7122137f2bbc2fb71f289c7155d76a1e3
PRE1_EVIDENCE_COMMIT = 653d8668950aaf45f291b6452a3c5b2de334a885
PRE1_SCOPE_REVIEW = PASS
PRE1_CONTENT_REVIEW = NEEDS CORRECTIVE
PRE1_TOKEN = CONSUMED / DO NOT REUSE
CONTROL_PLANE_BLOCKER_COMMIT = ddd33c317c91a8588bb340a6771e32b677817d97
```

Material blocker:
- owner N=6 competency-6 title merge is `B26:J27`;
- frozen Part B structural merge cloning only clones ranges satisfying `r1 >= 27 && r2 <= 30`;
- therefore `B26:J27` is not automatically cloned;
- the PRE1 evidence statement that cloned row31 is the bottom half of title merge `B30:J31` is unsupported and must be corrected mechanically.

Fail-closed consequence remains:
```text
N7_TITLE_GEOMETRY = UNRESOLVED
N8_TITLE_GEOMETRY = UNRESOLVED
N7_PRESENTATION_TRUTHFULNESS = BLOCKED
N8_PRESENTATION_TRUTHFULNESS = BLOCKED
PRODUCTION_RENDERER = NOT AUTHORIZED
```

## 3. AUTHORIZED WORK PACKAGE — D2-WP004-R2-PRE1-R1
```text
WORK_PACKAGE = D2-WP004-R2-PRE1-R1
NAME = PART B EXPANDED COMPETENCY PRESENTATION EVIDENCE CORRECTIVE
AUTHORIZATION = D2-WP004-R2-PRE1-R1-EVIDENCE-CORRECTIVE-20260902-01
STATE = AUTHORIZED / ACTIVE
MODE = EVIDENCE-ONLY / BOUNDED / ONE-SHOT / LOW-CREDIT
EXPECTED_WRITABLE_FILE = project-docs/phase-3/evidence/XLSX_PART_B_COMPETENCY_PRESENTATION_EVIDENCE.md ONLY
SOURCE_CHANGE = FORBIDDEN
TEST_CHANGE = FORBIDDEN
PROFILE_CHANGE = FORBIDDEN
RENDERER_CHANGE = FORBIDDEN
PACKAGE_CHANGE = FORBIDDEN
BASELINE_CHANGE = FORBIDDEN
CONTROL_DOC_CHANGE_BY_EXECUTOR = FORBIDDEN
OWNER_XLSX_SAVE_OR_MUTATION = FORBIDDEN
KINTONE_WRITE = FORBIDDEN
DEPLOY = FORBIDDEN
D3 = HOLD
```

## 4. Exact allowed READ-ONLY inputs
Antigravity may inspect ONLY:
1. existing `project-docs/phase-3/evidence/XLSX_PART_B_COMPETENCY_PRESENTATION_EVIDENCE.md`;
2. exact owner Part B template SHA256 `c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3`;
3. `project-docs/CONFIRMED_BASELINE/D2_PART_B_STRUCTURAL_CLOSURE.md`;
4. `project-docs/CONFIRMED_BASELINE/D2_PART_B_EXPANDED_PRIVACY_CLOSURE.md`;
5. `project-docs/CONFIRMED_BASELINE/D2_XLSX_TEMPLATE_SEMANTIC_MAPPING_CLOSURE.md`;
6. `project-docs/phase-3/evidence/COMPETENCY_SOURCE_EVIDENCE.md`;
7. `src/services/mbo-export-service.js`;
8. `src/profiles/mbo-xlsx-template-profile.js`;
9. `scripts/export/mbo-xlsx-ooxml-feasibility.js` and `tests/mbo-xlsx-ooxml-feasibility.test.js` ONLY for the exact already-frozen Part B block/merge transformation needed to correct N7/N8 presentation geometry.

No broad repository scan. Do not inspect unrelated apps/source/docs. Do not redesign architecture.

## 5. Exact R1 corrective contract
Correct the existing PRE1 evidence only.

Required corrections:
1. mechanically reconcile owner N=6 title/description/rating-label geometry with the actual N7/N8 structural transform;
2. explicitly state whether a competency 7/8 title merge exists after the frozen transform and the exact range if mechanically proven;
3. remove unsupported `B30:J31` or equivalent inferred title geometry unless mechanically proven;
4. treat `COMPETENCY_b_SELF_RATING` as already-frozen writable authority / collision check, not as a new presentation candidate;
5. `PRESENTATION_CANDIDATE_COUNT` must count only genuinely visible workbook presentation targets;
6. weight/category/group concepts with no workbook target must be separated as `NO_WORKBOOK_TARGET / NOT_A_PRESENTATION_TARGET`, not counted as visible presentation candidates;
7. explicitly classify every genuinely cloned presentation element using exactly one of:
   - `CLONE_AS_STATIC_VALID`;
   - `MUST_REWRITE_FROM_SECURED_PROJECTION`;
   - `UNRESOLVED / BLOCKED`;
8. explicitly classify cloned `Rating Scale` presentation;
9. do not infer alias precedence for `name/title/competencyName`, `weight/weightPercent`, `id/competencyId/code`, or `category/group`;
10. preserve accepted semantic authority exactly:
```text
SAFE_TO_MAP = 18 EXACT
UNRESOLVED_KEEP_UNRESOLVED = 22 EXACT
NO_SECURED_PROJECTION_SOURCE_DO_NOT_MAP = 5 EXACT
CHIEF_FROZEN_AUTHORITY = R:X / STRUCTURAL-PRIVACY ONLY
CHIEF_SECURED_WRITABLE_ROLE = 0
```
11. N7/N8 must remain BLOCKED unless BOTH exact workbook target ownership and deterministic secured source authority are proven;
12. evidence status remains `EVIDENCE CANDIDATE / AWAITING INDEPENDENT REVIEW`;
13. Antigravity must not self-declare PASS/CLOSED.

Required final ledger must include at minimum:
```text
OWNER_PART_B_SHA = EXACT MATCH / BLOCKER
PRESENTATION_CANDIDATE_COUNT = <mechanical visible-target count>
EXISTING_SAFE_COLLISION_CHECK = <including COMPETENCY_b_SELF_RATING>
PROVEN_SAFE_PRESENTATION_CANDIDATES = <count + roles>
UNRESOLVED_PRESENTATION_CANDIDATES = <count + roles/reasons>
NO_WORKBOOK_TARGET_CONCEPTS = <count + concepts>
CLONED_PRESENTATION_CLASSIFICATION = <all cloned visible elements classified>
N7_TITLE_GEOMETRY = PROVEN <range> / UNRESOLVED
N8_TITLE_GEOMETRY = PROVEN <range> / UNRESOLVED
N7_PRESENTATION_TRUTHFULNESS = PROVEN / BLOCKED
N8_PRESENTATION_TRUTHFULNESS = PROVEN / BLOCKED
DUPLICATE_EXISTING_SAFE_TARGETS = 0
SOURCE_TEST_PROFILE_RENDERER_CHANGE = 0
```

## 6. Executor protocol
```text
fresh-fetch authorization HEAD
-> verify branch ai/antigravity-wp002c
-> read this control file
-> inspect only exact allowed inputs
-> inspect owner XLSX READ-ONLY
-> edit only existing PRE1 evidence file
-> verify git diff contains exactly one authorized evidence file
-> commit exactly once
-> push ai/antigravity-wp002c
-> report commit SHA + exact changed file + concise corrected findings
-> STOP
```

No source changes. No tests changes. No profile changes. No renderer implementation. No Kintone. No deploy. No D3.

## 7. Authorization ledger / next action
```text
D2-WP004-R2-PRE1-EVIDENCE-20260902-01 = CONSUMED / NEEDS CORRECTIVE / DO NOT REUSE
D2-WP004-R2-PRE1-R1-EVIDENCE-CORRECTIVE-20260902-01 = ACTIVE / ONE-SHOT / CONSUME ON ONE CORRECTIVE EVIDENCE COMMIT
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
NEXT_EXECUTOR = ANTIGRAVITY
NEXT_ACTION = EXECUTE PRE1-R1 EVIDENCE-CORRECTIVE EXACTLY, PUSH, REPORT, STOP
CLAUDE = STOP
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```
