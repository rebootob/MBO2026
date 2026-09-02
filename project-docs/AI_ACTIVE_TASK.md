# AI ACTIVE TASK — D2-WP004-R1 TEMPLATE PROFILE FOUNDATION AUTHORIZED

Mode: **LOW-CREDIT / BOUNDED / ONE-SHOT / EXACT TWO NEW FILES / PURE MAPPING / NO WORKBOOK I/O / NO KINTONE / NO DEPLOY / D3 HOLD**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-02 ICT

Fresh-fetch current HEAD first. Fast path: `D2_REVIEW_FAST_START.md` -> this file -> directly relevant Baseline -> exact implementation diff.

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
CONTROL_PLANE_REVIEW_CORRECTIVE_STANDING_AUTH = EXHAUSTED / DO NOT REUSE
ANTIGRAVITY_AUTO_AUTH = NO
CLAUDE_AUTO_REVIEW = NO
ACTIVE_WORK_PACKAGE = D2-WP004-R1
ACTIVE_WORK_PACKAGE_NAME = MBO2026 PRODUCTION XLSX TEMPLATE PROFILE / MAPPING FOUNDATION
TASK_STATE = AUTHORIZED / WAIT ANTIGRAVITY IMPLEMENTATION
OWNER_APPROVAL_BASELINE_HEAD = 77908178f9d91d8fe7cce4db553f66324770a50b
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP004-R1-SOURCE-TEST-20260902-01
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP004-R1-SOURCE-TEST-20260902-01
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = AUTHORIZED ONLY FOR R1 / ONE-SHOT / LOW-CREDIT
CLAUDE = STOP
D3 = HOLD
```

This Owner authorization is execution-only for exactly one SOURCE+TEST implementation/blocker commit. Independent review begins only when Owner says `review`.

## 2. Authorization identity
```text
WORK_PACKAGE = D2-WP004-R1
AUTHORIZATION_TOKEN = D2-WP004-R1-SOURCE-TEST-20260902-01
MODE = SOURCE+TEST / BOUNDED / ONE-SHOT / PURE MAPPING
OWNER_APPROVAL_BASELINE_HEAD = 77908178f9d91d8fe7cce4db553f66324770a50b
EXPECTED_COMMITS = EXACTLY ONE IMPLEMENTATION OR BLOCKER COMMIT AFTER THIS AUTHORIZATION COMMIT
```

Authorized writable files ONLY:
1. `src/profiles/mbo-xlsx-template-profile.js` — NEW
2. `tests/mbo-xlsx-template-profile.test.js` — NEW

Any existing-file modification or any third file is out of scope and must block completion.

## 3. Frozen D2 authority consumed by R1
Read only as needed:
- `CONFIRMED_BASELINE/D2_PART_A_STRUCTURAL_CLOSURE.md`
- `CONFIRMED_BASELINE/D2_PART_B_STRUCTURAL_CLOSURE.md`
- `CONFIRMED_BASELINE/D2_FORMULA_AUTHORITY_CLOSURE.md`
- `CONFIRMED_BASELINE/D2_PART_B_EXPANDED_PRIVACY_CLOSURE.md`
- `CONFIRMED_BASELINE/EXPORT_TEMPLATE_MAPPING_ARCHITECTURE.md`

Secured export-data authority remains read-only:
`src/services/mbo-export-service.js`

Accepted owner-template identities:
```text
PART_A_TEMPLATE_SHA256 = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B_TEMPLATE_SHA256 = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
PART_A_OBJECTIVE_COUNTS = integers 4..10
PART_B_COMPETENCY_COUNTS = integers 6,7,8
```

Mandatory architecture:
```text
NO_SCATTERED_CELL_ADDRESS_IN_PRODUCTION_RENDERER = MANDATORY
CENTRALIZED_TEMPLATE_PROFILE_MAPPING = MANDATORY
UNKNOWN_TEMPLATE_OR_MAPPING = FAIL_CLOSED
```

## 4. Exact R1 contract

### A. Pure centralized Template Profile only
Create `src/profiles/mbo-xlsx-template-profile.js` as the single production mapping owner for the accepted MBO2026 XLSX template family.

R1 is pure configuration/resolution logic only:
- no `fs`;
- no Kintone API/adapter;
- no `xlsx-populate`;
- no workbook read/write/mutation;
- no generated XLSX/PDF/binary;
- no scoring calculation;
- no renderer orchestration.

### B. Deterministic identity
Expose deterministic template identity/version metadata with the exact accepted Part A and Part B SHA-256 values above.

Unknown/mismatched template identity must fail closed with stable production error family:
`EXPORT_TEMPLATE_PROFILE_UNRESOLVED`

Do not silently accept a different template revision.

### C. Exact supported cardinalities
Explicitly support only:
- Part A objectives: integer 4..10;
- Part B competencies: integer 6, 7, 8.

Reject missing, non-integer, fractional, stringly ambiguous, below/above-range or unsupported values. No nearest-count fallback/coercion.

### D. Semantic role boundary
Expose semantic workbook roles/mapping APIs so future renderer code does not own raw workbook addresses.

Mapping must cover roles needed from the current secured projection, grouped clearly by responsibility, including at minimum:
- common/header identity roles;
- Part A Hoshin roles;
- Part A objective/evaluation roles;
- Part A summary/result roles applicable to authorized projections;
- Part B header roles;
- Part B competency self/chief dynamic rating roles;
- Part B summary/comment/signature roles.

Part B protected static competency text and padding remain non-writable. Source row30 and N=7/N=8 clones rows34/38 must never resolve as dynamic write roles.

The profile may use ranges/count-aware resolver functions. Production address/range literals belong here, not in future renderer/business logic.

### E. Preserve authority boundaries
The profile must NOT:
- calculate Part A/Part B/final scores;
- reconstruct fields omitted by Employee-Self secured projection;
- decide export authorization;
- embed Kintone field-code lookup/business rules;
- duplicate renderer/sanitizer/structural mutation logic;
- weaken structural/privacy/formula Baselines.

`MboExportService` remains secured projection authority. Kintone/App794 remains scoring truth.

### F. Fail-closed mapping behavior
At minimum prove blocker behavior for:
- unknown profile/template version;
- wrong Part A SHA;
- wrong Part B SHA;
- unsupported objective count;
- unsupported competency count;
- unknown semantic role;
- missing required mapping entry;
- conflicting/duplicate semantic mapping where exclusivity is required.

No best-effort fallback is allowed.

## 5. Exact R1 test contract
Create `tests/mbo-xlsx-template-profile.test.js`.

Required proof:
1. exact Part A/Part B SHA identity values;
2. exact accepted objective-count domain = 4,5,6,7,8,9,10;
3. exact accepted competency-count domain = 6,7,8;
4. semantic mappings resolve deterministically for every accepted count;
5. unsupported identity/count/role fail closed;
6. source row30 and N7/N8 padding clones rows34/38 cannot resolve as dynamic write targets;
7. centralized mapping has no duplicate semantic owner for the same exclusive write responsibility;
8. profile resolution does not mutate caller input;
9. production profile source imports no `fs`, Kintone adapter, or `xlsx-populate` and performs no workbook I/O;
10. tests run without owner-template binaries because R1 is pure mapping.

Tests may contain expected address/range literals as independent assertions; production mapping literals must live only in the profile module.

## 6. Explicitly forbidden / out of scope
Do NOT modify:
- `src/services/mbo-export-service.js`;
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`;
- `tests/mbo-xlsx-ooxml-feasibility.test.js`;
- any existing source/test file;
- `package.json` or `package-lock.json`;
- `dist/` or deployed JS/CSS;
- structural/privacy/formula Baselines or behavior.

Do NOT:
- create Production XLSX Renderer yet;
- render/mutate/read workbook binaries;
- create generated XLSX/PDF/image/evidence binaries;
- recalculate scoring;
- touch Kintone/ACL/process/customization/deploy/Live UAT;
- start Combined Excel parity, PDF parity, security regression or D3;
- invoke Claude.

## 7. Required commands
Run exactly:
```bash
node --check src/profiles/mbo-xlsx-template-profile.js
node --check tests/mbo-xlsx-template-profile.test.js
node --test tests/mbo-xlsx-template-profile.test.js
node --test tests/mbo-export-service.test.js
npm audit --omit=dev
git status --porcelain
```

No template-dependent skip is expected because R1 is pure mapping. If any skip occurs, report it exactly and do not call skipped proof PASS.

## 8. Commit/push contract
After testing:
- create exactly ONE bounded R1 implementation commit OR exactly ONE blocker commit;
- commit must contain ONLY the two authorized new files;
- push to `ai/antigravity-wp002c`;
- STOP immediately after push/report;
- do not self-declare PASS/CLOSED;
- do not start Production Renderer or next gate.

Report only:
- implementation/blocker commit SHA;
- exact changed files;
- both `node --check` results;
- both `node --test` results including skips if any;
- `npm audit --omit=dev` result;
- `git status --porcelain`;
- blocker, if any.

## 9. Review focus after Owner says `review`
ChatGPT will independently verify:
- authorization -> implementation = exactly one commit;
- exactly two authorized NEW files and no existing-file drift;
- no workbook I/O/imports and no renderer implementation;
- exact template SHA/cardinality authority;
- complete deterministic semantic role API;
- row30/34/38 protected non-writable semantics;
- fail-closed unknown template/count/role/missing/conflict behavior;
- caller immutability;
- no duplicate mapping ownership;
- GitHub status/workflow signal truth.

## 10. Authorization ledger / exact next action
```text
D2-WP003-R7-R3-TEST-20260902-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP004-R1-SOURCE-TEST-20260902-01 = ACTIVE / ONE-SHOT / SOURCE+TEST / EXACT TWO NEW FILES
CONTROL-PLANE-D2-REVIEW-CORRECTIVE-20-ROUND-20260901 = EXHAUSTED / DO NOT REUSE
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP004-R1-SOURCE-TEST-20260902-01
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP004-R1-SOURCE-TEST-20260902-01
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
NEXT_EXECUTOR = ANTIGRAVITY
NEXT_ACTION = EXECUTE ONLY D2-WP004-R1-SOURCE-TEST-20260902-01; CREATE EXACTLY ONE TWO-NEW-FILE IMPLEMENTATION/BLOCKER COMMIT; PUSH; REPORT; STOP
ANTIGRAVITY = AUTHORIZED ONLY FOR R1
CLAUDE = STOP
KINTONE = NONE
DEPLOY = NONE
D3 = HOLD
```
