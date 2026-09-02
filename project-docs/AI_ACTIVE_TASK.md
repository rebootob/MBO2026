# AI ACTIVE TASK — R1-R3 REVIEW CORRECTIVE / R1-R3-R1 STRICT PROFILE FIX PROPOSED

Mode: **CONTROL PLANE / NO ACTIVE EXECUTOR / LOW-CREDIT / NO SOURCE AUTH / NO TEST AUTH / NO KINTONE / NO DEPLOY / D3 HOLD**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-02 ICT

Fresh-fetch current HEAD first. Fast path: `D2_REVIEW_FAST_START.md` -> this file -> `CONFIRMED_BASELINE/D2_XLSX_TEMPLATE_SEMANTIC_MAPPING_CLOSURE.md` -> exact relevant diff only.

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
CONTROL_PLANE_REVIEW_CORRECTIVE_STANDING_AUTH = EXHAUSTED / DO NOT REUSE
ANTIGRAVITY_AUTO_AUTH = NO
CLAUDE_AUTO_REVIEW = NO
ACTIVE_WORK_PACKAGE = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```

## 2. D2-WP004-R1-R3 independent review
```text
AUTHORIZATION = D2-WP004-R1-R3-SOURCE-TEST-20260902-01
AUTHORIZATION_COMMIT = 228a38b909fd7185d9ba94cf4d53288736b4172c
IMPLEMENTATION_COMMIT = 7b9e0279b03043ec9a5cceb7e3814a688f7ea3b8
AUTH_TO_IMPLEMENTATION = EXACTLY ONE COMMIT
CHANGED_FILES =
  src/profiles/mbo-xlsx-template-profile.js
  tests/mbo-xlsx-template-profile.test.js
SCOPE_REVIEW = PASS
PURE_NO_WORKBOOK_IO = PASS
EXACT_SHA_COUNT_TOPOLOGY = PASS / PRESERVED
SEMANTIC_ALIGNMENT = CORRECTIVE REQUIRED
INDEPENDENT_RUNTIME_SIGNAL = UNAVAILABLE / NO GITHUB STATUS OR WORKFLOW RUN
STATUS = CORRECTIVE REQUIRED
TOKEN = CONSUMED / CORRECTIVE / DO NOT REUSE
```

## 3. Durable semantic authority — unchanged
Canonical authority:
`project-docs/CONFIRMED_BASELINE/D2_XLSX_TEMPLATE_SEMANTIC_MAPPING_CLOSURE.md`

```text
PROVEN_SAFE_TO_MAP = 18 EXACT
UNRESOLVED_KEEP_UNRESOLVED = 22 EXACT
NO_SECURED_PROJECTION_SOURCE_DO_NOT_MAP = 5 EXACT
DUPLICATE_EXCLUSIVE_SAFE_TO_MAP_TARGETS = 0
SAFE_TO_MAP_WITH_NULL_OR_UNKNOWN_SECURED_PATH = 0
CHIEF_FROZEN_AUTHORITY = R:X
CHIEF_SECURED_WRITABLE_ROLE = 0
```

No semantic Baseline expansion is authorized or proposed.

## 4. Proven R1-R3 defects

### DEFECT A — unauthorized objective alias widens writable authority
Current resolver accepts:
`OBJECTIVE_i_COMMENT`

It aliases that name to `SELF_COMMENT`, even though only canonical `OBJECTIVE_i_SELF_COMMENT` belongs to the exact SAFE Baseline. The returned address is writable while `getObjectiveProjectionPath(..., 'comment')` returns `null`.

This violates both:
```text
ONLY_EXACT_SAFE_SEMANTICS_MAY_RESOLVE = YES
WRITABLE_ROLE_WITH_NULL_PROJECTION_PATH = 0
```

Required correction: `OBJECTIVE_i_COMMENT` must throw exactly `EXPORT_TEMPLATE_PROFILE_UNRESOLVED`.

### DEFECT B — unauthorized competency alias widens writable authority
Current resolver accepts:
`COMPETENCY_b_RATING`

It resolves it as the safe self-rating mapping. Only canonical `COMPETENCY_b_SELF_RATING` is accepted by the semantic Baseline.

Required correction: `COMPETENCY_b_RATING` must throw exactly `EXPORT_TEMPLATE_PROFILE_UNRESOLVED`.

### DEFECT C — integrity validator does not validate the complete production safe mapping set
Current `validateMappingIntegrity()` validates useful address/padding basics but is incomplete against the R1-R3 contract:
- objective `projectionPaths` object existence is checked, but each required safe projection path is not required to be a valid non-empty path;
- Part A summary addresses/projection integrity is not fully validated;
- Part B safe headers are not fully validated for required mapping/address/projection presence;
- Part B competency list/index/address/projection integrity is not fully validated;
- Part B duplicate exclusive writable targets are not fully validated;
- actual production safe resolution/allowlist cannot be proven merely by array counts.

Required correction: integrity validation must validate actual safe mappings/resolutions and fail closed on missing/malformed/null/conflicting production-safe mapping data.

### DEFECT D — required negative tests are incomplete
Current tests prove many accepted cases, but the authorization required negative proof for malformed address and null projection path and strict exact safe-role authority. Missing direct proof includes:
- `OBJECTIVE_1_COMMENT` rejects;
- `COMPETENCY_1_RATING` rejects;
- null required objective projection path mutation rejects;
- malformed safe summary/Part B safe address mutation rejects;
- missing/null Part B competency projection mapping rejects;
- duplicate Part B exclusive safe target mutation rejects.

## 5. Proposed D2-WP004-R1-R3-R1 — NOT AUTHORIZED
```text
PROPOSED_WORK_PACKAGE = D2-WP004-R1-R3-R1
NAME = TEMPLATE PROFILE STRICT ALLOWLIST + INTEGRITY CORRECTIVE
STATE = PROPOSED / NOT AUTHORIZED
MODE = SOURCE+TEST / BOUNDED / ONE-SHOT IF AUTHORIZED / LOW-CREDIT
EXPECTED_WRITABLE_FILES =
  src/profiles/mbo-xlsx-template-profile.js
  tests/mbo-xlsx-template-profile.test.js
SOURCE_CHANGE = NOT AUTHORIZED YET
TEST_CHANGE = NOT AUTHORIZED YET
PRODUCTION_RENDERER = NOT AUTHORIZED
```

Recommended Owner phrase:
`อนุมัติ D2-WP004-R1-R3-R1 SOURCE+TEST ตามขอบเขตที่เสนอ`

## 6. Exact proposed R1-R3-R1 contract
If later authorized, modify ONLY the same two profile/test files.

### A. Strict canonical resolver allowlist
Production resolver must accept only canonical semantic names proven by the Baseline. In particular:
- accept `OBJECTIVE_i_SELF_COMMENT`; reject `OBJECTIVE_i_COMMENT`;
- accept `COMPETENCY_b_SELF_RATING`; reject `COMPETENCY_b_RATING`;
- do not introduce any replacement compatibility alias;
- any non-canonical/unknown semantic role must throw exactly `EXPORT_TEMPLATE_PROFILE_UNRESOLVED`.

Every successful resolver result must have:
```text
address = valid non-empty approved address
projectionPath = valid non-empty secured projection path
```
No successful production writable resolution may return null/unknown path.

### B. Complete production mapping-integrity validation
Keep the validator pure. Extend it so mutations fail closed for at least:
1. missing required Part A safe header/Hoshin/objective/summary mapping;
2. malformed Part A safe address;
3. null/empty required Part A objective projection path;
4. duplicate Part A exclusive safe target;
5. missing/malformed Part B safe header mapping;
6. missing/malformed Part B safe summary mapping;
7. wrong/missing competency count/index/self-rating address;
8. null/empty Part B competency self-rating projection path;
9. duplicate Part B exclusive safe target where applicable;
10. protected row30/34/38 exposed dynamic;
11. unsupported profile/template/count;
12. any claimed writable role whose resolver returns null/unknown secured path.

Default MBO2026 profile must pass.

### C. Preserve accepted behavior
Do not regress:
- exact SHA constants;
- Part A count integer 4..10;
- Part B count integer 6/7/8;
- Part B structural/privacy dynamic topology including K:Q self and R:X Chief structural authority;
- row30/34/38 protected;
- exact semantic Baseline 18/22/5;
- Chief secured writable role = zero;
- caller/returned mapping immutability;
- stable blocker family;
- zero workbook I/O;
- zero scoring/formula mapping/recalculation.

### D. Focused tests
Add/retain direct tests proving:
```text
SAFE_ROLE_CLASS_COUNT = 18
UNRESOLVED_ROLE_CLASS_COUNT = 22
NO_SOURCE_ROLE_CLASS_COUNT = 5
OBJECTIVE_i_COMMENT = REJECT
COMPETENCY_b_RATING = REJECT
OBJECTIVE_i_SELF_COMMENT = ACCEPT
COMPETENCY_b_SELF_RATING = ACCEPT
SUCCESSFUL_RESOLUTION_WITH_NULL_PATH = 0
CHIEF_SECURED_WRITABLE_ROLE = 0
```

Mutation tests must prove exact blocker for null objective path, malformed safe address, broken Part B header/summary/competency mapping/path, duplicate exclusive targets and protected-row exposure.

### E. Explicit out of scope
Do NOT modify any third file, `MboExportService`, feasibility source/tests, Baselines/control docs during executor work, packages, `dist`, or owner XLSX. Do NOT create Renderer, generate XLSX/PDF, touch Kintone, deploy, run Live UAT, invoke Claude, start parity/security regression or D3.

### F. Low-credit execution rule
If authorized, Antigravity should read only:
1. `D2_REVIEW_FAST_START.md`;
2. this `AI_ACTIVE_TASK.md`;
3. `CONFIRMED_BASELINE/D2_XLSX_TEMPLATE_SEMANTIC_MAPPING_CLOSURE.md`;
4. the two writable files.

No broad repository scan. Exactly one implementation/blocker commit, push, report, STOP.

## 7. Authorization ledger / exact next action
```text
D2-WP004-R1-SOURCE-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP004-R1-R1-SOURCE-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP004-R1-R2-EVIDENCE-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP004-R1-R2-R1-EVIDENCE-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP004-R1-R2-R2-EVIDENCE-20260902-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP004-R1-R3-SOURCE-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP004-R1-R3-R1 = PROPOSED / NOT AUTHORIZED
CONTROL-PLANE-D2-REVIEW-CORRECTIVE-20-ROUND-20260901 = EXHAUSTED / DO NOT REUSE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
NEXT_EXECUTOR = OWNER
NEXT_ACTION = DECIDE WHETHER TO AUTHORIZE D2-WP004-R1-R3-R1 SOURCE+TEST
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
KINTONE = NONE
DEPLOY = NONE
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```
