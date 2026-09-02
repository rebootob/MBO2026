# AI ACTIVE TASK — D2-WP004-R2-PRE2-R1 NEEDS CORRECTIVE

Mode: **CONTROL PLANE / NO ACTIVE EXECUTOR / LOW-CREDIT / NO PROFILE AUTH / NO OOXML AUTH / NO RENDERER AUTH / NO KINTONE / NO DEPLOY / D3 HOLD**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-02 ICT

Fresh-fetch current HEAD first. Read `D2_REVIEW_FAST_START.md` -> this file -> `phase-3/D2_WP004_R2_PRE2_PRESENTATION_AUTHORITY_DESIGN.md` -> exact PRE2-R1 source/test diff only.

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
D2_WP004_R2_PRE1 = PASS / CLOSED
D2_WP004_R2_PRE1_R1 = PASS / CLOSED
D2_WP004_R2_PRE2 = READ-ONLY DESIGN COMPLETE
D2_WP004_R2_PRE2_R1 = NEEDS CORRECTIVE / NOT CLOSED

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

## 2. PRE2-R1 implementation review

```text
AUTHORIZATION = D2-WP004-R2-PRE2-R1-SOURCE-TEST-20260902-01
AUTHORIZATION_COMMIT = b8c3de176da8d90b35d2b53ce1cf37c2bb5a7833
IMPLEMENTATION_COMMIT = 9154ab33f2fd6262fa5d3e7717f7eed4f4052e0a
AUTH_TO_IMPLEMENTATION = EXACTLY ONE COMMIT
CHANGED_FILES =
  src/services/mbo-export-service.js
  tests/mbo-export-service.test.js
SCOPE_REVIEW = PASS
CONTENT_REVIEW = NEEDS CORRECTIVE
TOKEN = CONSUMED / DO NOT REUSE
GITHUB_RUNTIME_SIGNAL = UNAVAILABLE / NO STATUS / NO WORKFLOW RUN
```

## 3. Material blockers

### A. N1..6 backward compatibility regression
Before PRE2-R1, a non-object competency item was returned unchanged by the projection mapper. The implementation now throws `EXPORT_COMPETENCY_PRESENTATION_UNRESOLVED` for every non-object item, including ordinals 1..6.

This violates the PRE2-R1 contract:

```text
COMPETENCY_1_TO_6 = PRESERVE EXISTING PROJECTION BEHAVIOR
NO BACKWARD-COMPATIBILITY REGRESSION
```

Corrective rule:
- preserve the previous behavior for ordinals 1..6;
- apply expanded presentation validation only where required for ordinals 7/8;
- unsupported ordinal >8 may fail closed.

### B. Expanded-only presentation fields are exposed for N1..6 Employee-Self input
The implementation added `presentationTitle` and `presentationDescription` to the Employee-Self `safeKeys` list. This lets caller-supplied presentation fields pass through for ordinals 1..6, even though PRE2 design requires new presentation authority for inserted competencies 7/8 only.

Corrective rule:
- do NOT globally whitelist caller-supplied `presentationTitle` / `presentationDescription`;
- for Employee-Self, assign these fields only from the canonical values computed for b7/b8;
- b1..6 must not gain new presentation fields through this WP.

### C. Exact code validation is not exact
The implementation currently uses `String(item.code || '').trim().toUpperCase()` before comparison. Therefore non-exact values such as lowercase or whitespace variants can be accepted.

PRE2-R1 requires exact code identity:

```text
b7 code === COMP_LEAD
b8 code === COMP_STRAT
```

Corrective rule:
- require the exact canonical string; do not case-normalize or trim into acceptance.

### D. Focused tests do not cover all required fail-closed cases
Current tests cover b7 missing code and b8 wrong code, but do not directly prove b8 missing code. They also do not prove rejection of lowercase/whitespace code variants or N1..6 non-object backward compatibility.

## 4. Proposed smallest corrective — NOT AUTHORIZED

```text
PROPOSED_WORK_PACKAGE = D2-WP004-R2-PRE2-R1-R1
NAME = EXPANDED COMPETENCY CANONICAL PRESENTATION PROJECTION CORRECTIVE
STATE = PROPOSED / NOT AUTHORIZED
MODE = SOURCE+TEST / BOUNDED / ONE-SHOT / LOW-CREDIT
WRITABLE_FILES =
  src/services/mbo-export-service.js
  tests/mbo-export-service.test.js

PROFILE_CHANGE = FORBIDDEN
OOXML_FEASIBILITY_CHANGE = FORBIDDEN
RENDERER_CHANGE = FORBIDDEN
BASELINE_CHANGE = FORBIDDEN
CONTROL_DOC_CHANGE_BY_EXECUTOR = FORBIDDEN
PACKAGE_CHANGE = FORBIDDEN
DIST_CHANGE = FORBIDDEN
KINTONE_WRITE = FORBIDDEN
DEPLOY = FORBIDDEN
D3 = HOLD
```

Required R1-R1 corrective:
1. restore exact pre-PRE2-R1 projection behavior for ordinals 1..6, including non-object handling;
2. canonical presentation validation remains only for ordinals 7/8;
3. Employee-Self gets `presentationTitle/presentationDescription` only from computed b7/b8 canonical values, never arbitrary caller-supplied fields for b1..6;
4. require exact case-sensitive code strings `COMP_LEAD` / `COMP_STRAT` with no trim/uppercase normalization into acceptance;
5. preserve exact nonblank `description` passthrough for b7/b8;
6. add direct tests for b8 missing code, lowercase/whitespace code rejection, and N1..6 backward compatibility;
7. preserve all existing authorization/privacy behavior;
8. exactly one corrective implementation commit -> push -> report -> STOP.

Recommended Owner phrase:
`อนุมัติ D2-WP004-R2-PRE2-R1-R1 SOURCE+TEST CORRECTIVE ตามขอบเขตที่เสนอ`

## 5. Authorization ledger

```text
D2-WP004-R2-PRE2-R1-SOURCE-TEST-20260902-01 = CONSUMED / NEEDS CORRECTIVE / DO NOT REUSE
D2-WP004-R2-PRE2-R1-R1 = PROPOSED / NOT AUTHORIZED
NEXT_EXECUTOR = OWNER / CHATGPT CONTROL PLANE
NEXT_ACTION = DECIDE WHETHER TO AUTHORIZE PRE2-R1-R1
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```
