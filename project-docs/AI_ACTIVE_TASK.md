# AI ACTIVE TASK — D2-WP004-R1-R3-R2 CANONICAL INTEGRITY COMPLETION AUTHORIZED

Mode: **LOW-CREDIT / BOUNDED / ONE-SHOT / SOURCE+TEST / EXACT TWO EXISTING FILES / CANONICAL PART B INTEGRITY ONLY / NO RENDERER / NO KINTONE / NO DEPLOY / D3 HOLD**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-02 ICT

Fresh-fetch current HEAD first. Low-credit fast path: `D2_REVIEW_FAST_START.md` -> this file -> `CONFIRMED_BASELINE/D2_XLSX_TEMPLATE_SEMANTIC_MAPPING_CLOSURE.md` -> exact two writable files only. No broad repository scan. No workbook inspection. No semantic re-research.

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
ACTIVE_WORK_PACKAGE = D2-WP004-R1-R3-R2
ACTIVE_WORK_PACKAGE_NAME = TEMPLATE PROFILE CANONICAL INTEGRITY COMPLETION
TASK_STATE = AUTHORIZED / WAIT ANTIGRAVITY IMPLEMENTATION
OWNER_APPROVAL_BASELINE_HEAD = 60f236be437d3ff1af4bcbaa322ab486c6baee20
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP004-R1-R3-R2-SOURCE-TEST-20260902-01
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP004-R1-R3-R2-SOURCE-TEST-20260902-01
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = AUTHORIZED ONLY FOR R1-R3-R2 SOURCE+TEST / ONE-SHOT / LOW-CREDIT
CLAUDE = STOP
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```

This Owner authorization is execution-only for exactly one implementation or blocker commit after this authorization commit. Independent review begins only after Owner says `review`.

## 2. Authorization identity
```text
WORK_PACKAGE = D2-WP004-R1-R3-R2
AUTHORIZATION_TOKEN = D2-WP004-R1-R3-R2-SOURCE-TEST-20260902-01
MODE = SOURCE+TEST / BOUNDED / ONE-SHOT / LOW-CREDIT / EXACT TWO EXISTING FILES
OWNER_APPROVAL_BASELINE_HEAD = 60f236be437d3ff1af4bcbaa322ab486c6baee20
EXPECTED_COMMITS = EXACTLY ONE IMPLEMENTATION OR BLOCKER COMMIT AFTER THIS AUTHORIZATION COMMIT
```

Authorized writable files ONLY:
1. `src/profiles/mbo-xlsx-template-profile.js`
2. `tests/mbo-xlsx-template-profile.test.js`

No third file.

## 3. Durable semantic authority — DO NOT EXPAND
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

No semantic evidence work is authorized. Do not inspect owner XLSX, evidence history, MboExportService, workflow docs or other source. If this exact task cannot be executed from the listed Baseline and two writable files, stop and report blocker rather than broad-scan.

## 4. Prior R1-R3-R1 review truth
```text
R1_R3_R1_AUTHORIZATION = D2-WP004-R1-R3-R1-SOURCE-TEST-20260902-01
R1_R3_R1_AUTHORIZATION_COMMIT = 867111d785b7e85689725379249e7b278108d8cc
R1_R3_R1_IMPLEMENTATION_COMMIT = 6386e506b85ded87a57967705066e38d56212f73
R1_R3_R1_SCOPE = PASS / EXACT TWO AUTHORIZED FILES
R1_R3_R1_OBJECTIVE_COMMENT_ALIAS = PASS / REJECTS
R1_R3_R1_COMPETENCY_RATING_ALIAS = PASS / REJECTS
R1_R3_R1_BASIC_NULL_PATH_GUARD = PASS
R1_R3_R1_STATUS = CORRECTIVE REQUIRED
R1_R3_R1_TOKEN = CONSUMED / CORRECTIVE / DO NOT REUSE
R1_R3_R1_RUNTIME_SIGNAL = UNAVAILABLE / NO GITHUB STATUS OR WORKFLOW RUN
```

Preserve all accepted R1-R3-R1 behavior. Do not rework resolver semantics unless necessary to maintain these accepted invariants.

## 5. Exact remaining defect to correct
`validateMappingIntegrity()` must prove exact canonical identity for every Part B competency item, not just syntactic validity/non-empty path.

For each accepted competency count N=6/7/8, canonical rating rows are:
```text
N6: [9, 13, 17, 21, 25, 29]
N7: [9, 13, 17, 21, 25, 29, 33]
N8: [9, 13, 17, 21, 25, 29, 33, 37]
```

For each ordinal `b` from 1..N, require `mapB.competencies[b-1]` to have exactly:
```text
index = b
row = canonicalRatingRows[b-1]
SELF_RATING = K{canonicalRatingRows[b-1]}
projectionPath = partB.competencyItems[b-1].selfRating
```

Any wrong/missing value must throw exactly:
`EXPORT_TEMPLATE_PROFILE_UNRESOLVED`

Examples that MUST fail closed even though syntactically valid/non-empty:
- `index = 99`
- correct index but wrong `row`
- `SELF_RATING = K10` for competency 1
- `projectionPath = partB.competencyItems[5].selfRating` for competency 1

Do not add Chief writable mapping. `CHIEF_DYNAMIC_AUTHORITY = R:X` remains structural/privacy metadata only.

## 6. Required focused tests only
Add direct mutation negatives proving at least:
```text
PART_B_COMPETENCY_WRONG_INDEX = REJECT
PART_B_COMPETENCY_WRONG_ROW = REJECT
PART_B_COMPETENCY_WRONG_BUT_VALID_SELF_RATING_ADDRESS = REJECT
PART_B_COMPETENCY_WRONG_NONEMPTY_PROJECTION_PATH = REJECT
```

Each must throw `EXPORT_TEMPLATE_PROFILE_UNRESOLVED` through `validateMappingIntegrity()`.

Retain all accepted R1-R3-R1 tests and behavior, including:
```text
OBJECTIVE_i_COMMENT = REJECT
COMPETENCY_b_RATING = REJECT
OBJECTIVE_i_SELF_COMMENT = ACCEPT
COMPETENCY_b_SELF_RATING = ACCEPT
SUCCESSFUL_RESOLUTION_WITH_NULL_PATH = 0
DUPLICATE_EXCLUSIVE_WRITABLE_TARGETS = 0
CHIEF_SECURED_WRITABLE_ROLE = 0
```

## 7. Preserve accepted behavior
Do NOT regress:
- exact Part A/B SHA constants;
- Part A count numeric integer 4..10 only;
- Part B count numeric integer 6/7/8 only;
- exact semantic classification 18/22/5;
- strict non-canonical alias rejection;
- Part B structural/privacy topology;
- `SELF_DYNAMIC_AUTHORITY = K:Q`;
- `CHIEF_DYNAMIC_AUTHORITY = R:X` as structural/privacy metadata only;
- row30/34/38 protected non-dynamic;
- caller input and returned mapping immutability;
- stable blocker family `EXPORT_TEMPLATE_PROFILE_UNRESOLVED`;
- zero workbook I/O;
- zero Kintone/API adapter;
- zero scoring/formula mapping or recalculation.

Every successful `resolveSemanticRole()` result must continue to have a valid non-empty approved address and exact non-empty secured projection path.

## 8. Commands
Run exactly:
```bash
node --check src/profiles/mbo-xlsx-template-profile.js
node --check tests/mbo-xlsx-template-profile.test.js
node --test tests/mbo-xlsx-template-profile.test.js
node --test tests/mbo-export-service.test.js
npm audit --omit=dev
git status --porcelain
```

## 9. Explicitly forbidden / out of scope
Do NOT modify:
- `src/services/mbo-export-service.js`;
- feasibility source/tests;
- any Baseline/control document during executor work;
- package/dependency files;
- owner XLSX binaries;
- `dist/`;
- any repository file other than the two authorized files.

Do NOT:
- broad-scan repository;
- inspect workbooks;
- re-research semantics;
- create/edit Production XLSX Renderer;
- generate XLSX/PDF/image evidence;
- recalculate scoring;
- widen semantic authority;
- touch Kintone/ACL/process/customization;
- deploy;
- run Live UAT;
- invoke Claude;
- start Combined Excel parity, PDF parity, security regression or D3.

## 10. Verification / commit contract
Before commit:
```bash
git diff --name-only
git status --porcelain
```

Exactly these two repository paths may differ:
```text
src/profiles/mbo-xlsx-template-profile.js
tests/mbo-xlsx-template-profile.test.js
```

Then:
- create exactly ONE implementation OR blocker commit;
- push to `ai/antigravity-wp002c`;
- STOP immediately;
- do not self-declare PASS/CLOSED;
- do not start Production Renderer or next gate.

Report only:
- implementation/blocker commit SHA;
- exact changed files;
- both `node --check` results;
- both `node --test` results with pass/fail/skip counts;
- `npm audit --omit=dev` result;
- `git status --porcelain`;
- blocker if any.

## 11. Authorization ledger
```text
D2-WP004-R1-SOURCE-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP004-R1-R1-SOURCE-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP004-R1-R2-EVIDENCE-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP004-R1-R2-R1-EVIDENCE-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP004-R1-R2-R2-EVIDENCE-20260902-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP004-R1-R3-SOURCE-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP004-R1-R3-R1-SOURCE-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP004-R1-R3-R2-SOURCE-TEST-20260902-01 = ACTIVE / ONE-SHOT / SOURCE+TEST / LOW-CREDIT
CONTROL-PLANE-D2-REVIEW-CORRECTIVE-20-ROUND-20260901 = EXHAUSTED / DO NOT REUSE
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP004-R1-R3-R2-SOURCE-TEST-20260902-01
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP004-R1-R3-R2-SOURCE-TEST-20260902-01
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
NEXT_EXECUTOR = ANTIGRAVITY
NEXT_ACTION = EXECUTE EXACT R1-R3-R2 CONTRACT, PUSH ONE COMMIT, STOP
CLAUDE = STOP
KINTONE = NONE
DEPLOY = NONE
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```