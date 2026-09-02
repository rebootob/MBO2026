# AI ACTIVE TASK — D2-WP004-R2-PRE1 NEEDS CORRECTIVE

Mode: **CONTROL PLANE / NO ACTIVE EXECUTOR / LOW-CREDIT / NO SOURCE AUTH / NO TEST AUTH / NO PROFILE AUTH / NO RENDERER AUTH / NO KINTONE / NO DEPLOY / D3 HOLD**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-02 ICT

Fresh-fetch current HEAD first. Fast path: `D2_REVIEW_FAST_START.md` -> this file -> `phase-3/D2_WP004_R2_RENDERER_SANITIZER_DESIGN.md` -> exact PRE1 evidence -> only directly relevant frozen structural source/test when needed for review.

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
ACTIVE_WORK_PACKAGE = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE

ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```

## 2. PRE1 authorization / implementation review
```text
AUTHORIZATION = D2-WP004-R2-PRE1-EVIDENCE-20260902-01
AUTHORIZATION_COMMIT = 87c31ac7122137f2bbc2fb71f289c7155d76a1e3
EVIDENCE_COMMIT = 653d8668950aaf45f291b6452a3c5b2de334a885
AUTH_TO_EVIDENCE = EXACTLY ONE COMMIT
CHANGED_FILE = project-docs/phase-3/evidence/XLSX_PART_B_COMPETENCY_PRESENTATION_EVIDENCE.md ONLY
SCOPE_REVIEW = PASS
EXECUTOR_SELF_CERTIFICATION = NONE
TOKEN = CONSUMED / DO NOT REUSE
```

Evidence scope is clean, but independent content review found a material structural inconsistency, so PRE1 cannot close yet.

## 3. Material review finding — cloned title geometry is unproven / evidence statement incorrect
PRE1 evidence records the owner N=6 competency-6 title merge as:
```text
B26:J27
```

The frozen Part B structural implementation/test authority clones source-block merge ranges only when the entire merge is inside rows 27:30:
```text
r1 >= 27 && r2 <= 30
```

Therefore `B26:J27` does NOT qualify for cloned-merge creation.

The evidence statement:
```text
Row 31 (cloned row 27): Bottom half of title merge B30:J31
```
is not supported by the frozen structural algorithm and must not be used as authority.

This matters because PRE1 exists specifically to prove exact visible presentation ownership for N7/N8. Until the actual post-expansion title geometry is mechanically established, `COMPETENCY_b_TITLE` target ownership for competency 7/8 is unresolved independently of the projection-alias problem.

Fail-closed consequence:
```text
N7_TITLE_GEOMETRY = UNRESOLVED
N8_TITLE_GEOMETRY = UNRESOLVED
N7_PRESENTATION_TRUTHFULNESS = BLOCKED
N8_PRESENTATION_TRUTHFULNESS = BLOCKED
PRODUCTION_RENDERER = NOT AUTHORIZED
```

## 4. Secondary evidence-quality corrections required
The corrective evidence must also repair the candidate ledger:

1. `COMPETENCY_b_SELF_RATING` is an already-frozen writable semantic, not a new presentation candidate. It may be recorded as an existing-safe collision check, but must not inflate the mechanical presentation-candidate count.
2. Every genuinely cloned presentation element must receive one explicit decision required by the PRE1 contract:
   - `CLONE_AS_STATIC_VALID`; or
   - `MUST_REWRITE_FROM_SECURED_PROJECTION`; or
   - `UNRESOLVED / BLOCKED`.
3. The cloned `Rating Scale` presentation must be explicitly classified rather than only mentioned incidentally.
4. Weight/category/group concepts must not be counted as workbook presentation candidates when the workbook inspection proves no visible target exists; they may be recorded separately as `NO_WORKBOOK_TARGET / NOT_A_PRESENTATION_TARGET`.
5. Do not infer or invent title merge geometry for N7/N8. Record exact observed/generated geometry only from the already-accepted structural path or fail closed.

## 5. Proposed smallest corrective — NOT AUTHORIZED
```text
PROPOSED_WORK_PACKAGE = D2-WP004-R2-PRE1-R1
NAME = PART B EXPANDED COMPETENCY PRESENTATION EVIDENCE CORRECTIVE
STATE = PROPOSED / NOT AUTHORIZED
MODE = EVIDENCE-ONLY / BOUNDED / ONE-SHOT / LOW-CREDIT
EXPECTED_WRITABLE_FILE = project-docs/phase-3/evidence/XLSX_PART_B_COMPETENCY_PRESENTATION_EVIDENCE.md ONLY
SOURCE_CHANGE = FORBIDDEN
TEST_CHANGE = FORBIDDEN
PROFILE_CHANGE = FORBIDDEN
RENDERER_CHANGE = FORBIDDEN
PACKAGE_CHANGE = FORBIDDEN
BASELINE_CHANGE = FORBIDDEN
CONTROL_DOC_CHANGE_BY_EXECUTOR = FORBIDDEN
KINTONE_WRITE = FORBIDDEN
DEPLOY = FORBIDDEN
D3 = HOLD
```

Recommended Owner phrase:
`อนุมัติ D2-WP004-R2-PRE1-R1 EVIDENCE-CORRECTIVE ตามขอบเขตที่เสนอ`

## 6. Exact proposed R1 corrective contract
If later authorized, Antigravity may edit ONLY the existing PRE1 evidence file.

Allowed READ-ONLY inputs are limited to:
1. exact owner Part B template SHA256 `c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3`;
2. `project-docs/CONFIRMED_BASELINE/D2_PART_B_STRUCTURAL_CLOSURE.md`;
3. `project-docs/CONFIRMED_BASELINE/D2_PART_B_EXPANDED_PRIVACY_CLOSURE.md`;
4. `project-docs/CONFIRMED_BASELINE/D2_XLSX_TEMPLATE_SEMANTIC_MAPPING_CLOSURE.md`;
5. `project-docs/phase-3/evidence/COMPETENCY_SOURCE_EVIDENCE.md`;
6. `src/services/mbo-export-service.js`;
7. `src/profiles/mbo-xlsx-template-profile.js`;
8. `scripts/export/mbo-xlsx-ooxml-feasibility.js` and `tests/mbo-xlsx-ooxml-feasibility.test.js` ONLY for the exact already-frozen Part B block/merge transformation needed to correct N7/N8 presentation geometry. No unrelated feasibility review.

Corrective outputs must:
- mechanically reconcile owner N6 title/description/rating-label geometry with actual N7/N8 structural output;
- explicitly state whether a competency 7/8 title merge exists after the frozen transform and its exact range if it does;
- remove unsupported `B30:J31` / equivalent inferred geometry unless mechanically proven;
- separate existing-safe rating semantics from new presentation candidates;
- enumerate only genuinely visible workbook presentation targets in `PRESENTATION_CANDIDATE_COUNT`;
- classify every cloned presentation field as static-valid, must-rewrite, or unresolved;
- preserve 18/22/5 authority and Chief R:X privacy authority;
- keep N7/N8 blocked unless both exact workbook target and deterministic secured source are proven;
- remain `EVIDENCE CANDIDATE / AWAITING INDEPENDENT REVIEW`;
- never self-declare PASS/CLOSED.

Exactly one corrective evidence commit -> push -> report -> STOP.

## 7. Authorization ledger / next action
```text
D2-WP004-R2-PRE1-EVIDENCE-20260902-01 = CONSUMED / NEEDS CORRECTIVE / DO NOT REUSE
D2-WP004-R2-PRE1-R1 = PROPOSED / NOT AUTHORIZED
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
NEXT_EXECUTOR = OWNER / CHATGPT CONTROL PLANE
NEXT_ACTION = DECIDE WHETHER TO AUTHORIZE PRE1-R1 EVIDENCE-CORRECTIVE
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```
