# AI ACTIVE TASK — D2 PRIVACY CLOSED / D2-WP004-R1 TEMPLATE PROFILE FOUNDATION PROPOSED

Mode: **CONTROL PLANE / NO ACTIVE EXECUTOR / NO KINTONE / NO DEPLOY / D3 HOLD**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-02 ICT

Fresh-fetch current HEAD first. Fast path: `D2_REVIEW_FAST_START.md` -> this file -> directly relevant Baseline -> exact diff.

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
ACTIVE_WORK_PACKAGE = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
D3 = HOLD
```

## 2. Frozen D2 authority consumed by Production Renderer work
Read only as needed:
- `CONFIRMED_BASELINE/D2_PART_A_STRUCTURAL_CLOSURE.md`
- `CONFIRMED_BASELINE/D2_PART_B_STRUCTURAL_CLOSURE.md`
- `CONFIRMED_BASELINE/D2_FORMULA_AUTHORITY_CLOSURE.md`
- `CONFIRMED_BASELINE/D2_PART_B_EXPANDED_PRIVACY_CLOSURE.md`
- `CONFIRMED_BASELINE/EXPORT_TEMPLATE_MAPPING_ARCHITECTURE.md`

Secured export-data authority remains:
`src/services/mbo-export-service.js`

Do not modify it in R1.

Accepted owner-template identities:
```text
PART_A_TEMPLATE_SHA256 = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B_TEMPLATE_SHA256 = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
PART_A_OBJECTIVE_COUNTS = 4..10
PART_B_COMPETENCY_COUNTS = 6,7,8
```

Mandatory architecture:
```text
NO_SCATTERED_CELL_ADDRESS_IN_PRODUCTION_RENDERER = MANDATORY
CENTRALIZED_TEMPLATE_PROFILE_MAPPING = MANDATORY
UNKNOWN_TEMPLATE_OR_MAPPING = FAIL_CLOSED
```

## 3. Proposed Work Package — NOT AUTHORIZED
```text
PROPOSED_WORK_PACKAGE = D2-WP004-R1
NAME = MBO2026 PRODUCTION XLSX TEMPLATE PROFILE / MAPPING FOUNDATION
STATE = PROPOSED / NOT AUTHORIZED
MODE = SOURCE+TEST / BOUNDED / ONE-SHOT WHEN AUTHORIZED
EXPECTED_WRITABLE_FILES =
  src/profiles/mbo-xlsx-template-profile.js
  tests/mbo-xlsx-template-profile.test.js
SOURCE_EXISTING_FILES = READ-ONLY
WORKBOOK_MUTATION = FORBIDDEN
GENERATED_XLSX = FORBIDDEN
```

No authorization token exists yet.

Recommended Owner phrase if approved:
`อนุมัติ D2-WP004-R1 SOURCE+TEST ตามขอบเขตที่เสนอ`

## 4. Exact R1 contract

### A. Pure Template Profile only
Create `src/profiles/mbo-xlsx-template-profile.js` as the single production mapping owner for the accepted MBO2026 XLSX template family.

R1 is pure configuration/resolution logic only:
- no `fs`;
- no Kintone API;
- no `xlsx-populate`;
- no workbook read/write/mutation;
- no generated binary;
- no scoring calculation.

### B. Deterministic identity
The profile must expose deterministic template identity/version metadata including the exact accepted Part A and Part B SHA-256 values above.

Unknown/mismatched template identity must fail closed with one stable production error family such as:
`EXPORT_TEMPLATE_PROFILE_UNRESOLVED`

Do not silently accept another template revision.

### C. Supported cardinalities
The profile must explicitly support only:
- Part A objectives: integer 4..10;
- Part B competencies: integer 6, 7, 8.

Missing, fractional, stringly ambiguous, below/above-range, or otherwise unsupported count input must fail closed.

### D. Semantic role boundary
Expose semantic workbook roles/mapping APIs rather than requiring future renderer code to know raw addresses.

The mapping must cover the workbook roles that later Production Renderer needs from the current secured projection, grouped by responsibility, for example:
- common/header identity roles;
- Part A Hoshin/objective/evaluation/summary roles;
- Part B header roles;
- Part B competency self/chief dynamic rating roles;
- Part B summary/comment/signature roles.

Part B protected static competency text/padding must remain non-writable. In particular source row30 and N7/N8 clones 34/38 must never resolve as dynamic write roles.

The profile may use ranges and count-aware resolver functions. Future renderer must consume this API instead of embedding equivalent workbook literals.

### E. Preserve authority boundaries
The profile must NOT:
- calculate Part A/Part B/final scores;
- reconstruct fields omitted by `MboExportService` Employee-Self projection;
- decide export authorization;
- embed Kintone field-code lookup/business rules;
- contain duplicate rendering/sanitization logic;
- weaken structural/privacy gates.

`MboExportService` remains secured projection authority. Kintone/App794 remains scoring truth.

### F. Fail-closed mapping contract
At minimum prove stable blocker behavior for:
- unknown profile/template version;
- wrong Part A SHA;
- wrong Part B SHA;
- unsupported objective count;
- unsupported competency count;
- unknown semantic role;
- missing required mapping entry;
- conflicting/duplicate semantic mapping where exclusivity is required.

No best-effort fallback to nearest count/template/address is allowed.

## 5. R1 tests
Create `tests/mbo-xlsx-template-profile.test.js`.

Required proof:
1. exact Part A/Part B SHA identity values;
2. exact accepted objective-count domain 4..10;
3. exact accepted competency-count domain 6/7/8;
4. semantic mappings resolve deterministically for every accepted count;
5. unsupported identity/count/role fail closed;
6. row30/34/38 protected Part B padding cannot resolve as dynamic write targets;
7. centralized mapping contains no duplicate semantic owner for the same exclusive write responsibility;
8. profile resolution does not mutate caller input;
9. module imports no `fs`, Kintone adapter, or `xlsx-populate` and performs no workbook I/O;
10. tests do not require owner-template binaries to be present because R1 is pure mapping.

Tests may contain expected address/range literals as independent assertions; the production mapping literals themselves must live only in the profile module.

## 6. Frozen / forbidden
Do NOT modify:
- `src/services/mbo-export-service.js`;
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`;
- `tests/mbo-xlsx-ooxml-feasibility.test.js`;
- existing structural/privacy/formula behavior;
- package dependencies or `package-lock.json`;
- Kintone records/apps/settings/ACL/process/customization;
- deployed JS/CSS/dist files.

Do NOT:
- create the Production Renderer yet;
- create XLSX/PDF outputs;
- start Combined Excel parity, PDF parity, security regression or D3;
- invoke Claude.

## 7. Expected commands if authorized
```bash
node --check src/profiles/mbo-xlsx-template-profile.js
node --check tests/mbo-xlsx-template-profile.test.js
node --test tests/mbo-xlsx-template-profile.test.js
node --test tests/mbo-export-service.test.js
npm audit --omit=dev
git status --porcelain
```

Exactly one bounded implementation OR blocker commit, exactly the two authorized files, push canonical branch, report, STOP, no self-PASS/CLOSED.

## 8. Why R1 is separate from renderer
The repository already has proven feasibility structural/privacy logic, but Production Renderer has no canonical template-mapping module yet. Building a full renderer first would encourage scattered addresses or copy-paste of evidence logic.

R1 creates the stable semantic/template boundary first. After R1 independent PASS, the next Production Renderer work package can write workbook data through this profile and can promote only the minimum proven structural/sanitization behavior needed by production without duplicating unrelated feasibility code.

## 9. Authorization ledger / exact next action
```text
D2-WP003-R7-R3-TEST-20260902-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP004-R1 = PROPOSED / NOT AUTHORIZED
ACTIVE_WORK_PACKAGE = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
NEXT_EXECUTOR = OWNER
NEXT_ACTION = DECIDE WHETHER TO AUTHORIZE D2-WP004-R1 SOURCE+TEST UNDER THIS EXACT TWO-FILE CONTRACT
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
KINTONE = NONE
DEPLOY = NONE
D3 = HOLD
```
