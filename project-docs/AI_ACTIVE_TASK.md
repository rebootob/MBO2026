# AI ACTIVE TASK — D2-WP004-R1-R3-R1 STRICT PROFILE FIX AUTHORIZED

Mode: **LOW-CREDIT / BOUNDED / ONE-SHOT / SOURCE+TEST / EXACT TWO EXISTING FILES / STRICT CANONICAL ALLOWLIST + INTEGRITY / NO RENDERER / NO KINTONE / NO DEPLOY / D3 HOLD**  
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
ACTIVE_WORK_PACKAGE = D2-WP004-R1-R3-R1
ACTIVE_WORK_PACKAGE_NAME = TEMPLATE PROFILE STRICT ALLOWLIST + INTEGRITY CORRECTIVE
TASK_STATE = AUTHORIZED / WAIT ANTIGRAVITY IMPLEMENTATION
OWNER_APPROVAL_BASELINE_HEAD = d6b9bd23f9e86ecf3fdf77e0008c226badc57bff
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP004-R1-R3-R1-SOURCE-TEST-20260902-01
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP004-R1-R3-R1-SOURCE-TEST-20260902-01
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = AUTHORIZED ONLY FOR R1-R3-R1 SOURCE+TEST / ONE-SHOT / LOW-CREDIT
CLAUDE = STOP
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```

This Owner authorization is execution-only for exactly one implementation or blocker commit after this authorization commit. Independent review begins only after Owner says `review`.

## 2. Authorization identity
```text
WORK_PACKAGE = D2-WP004-R1-R3-R1
AUTHORIZATION_TOKEN = D2-WP004-R1-R3-R1-SOURCE-TEST-20260902-01
MODE = SOURCE+TEST / BOUNDED / ONE-SHOT / LOW-CREDIT / EXACT TWO EXISTING FILES
OWNER_APPROVAL_BASELINE_HEAD = d6b9bd23f9e86ecf3fdf77e0008c226badc57bff
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

No semantic evidence work is authorized. Do not inspect owner XLSX, evidence history, MboExportService, workflow docs or other source unless this exact contract cannot be executed from the listed Baseline and two files; if blocked, produce one blocker commit/report rather than broad-scan.

## 4. Prior R1-R3 review truth
```text
R1_R3_AUTHORIZATION = D2-WP004-R1-R3-SOURCE-TEST-20260902-01
R1_R3_AUTHORIZATION_COMMIT = 228a38b909fd7185d9ba94cf4d53288736b4172c
R1_R3_IMPLEMENTATION_COMMIT = 7b9e0279b03043ec9a5cceb7e3814a688f7ea3b8
R1_R3_SCOPE = PASS / EXACT TWO AUTHORIZED FILES
R1_R3_PURE_NO_WORKBOOK_IO = PASS
R1_R3_SHA_COUNT_TOPOLOGY = PASS / PRESERVED
R1_R3_STATUS = CORRECTIVE REQUIRED
R1_R3_TOKEN = CONSUMED / CORRECTIVE / DO NOT REUSE
R1_R3_RUNTIME_SIGNAL = UNAVAILABLE / NO GITHUB STATUS OR WORKFLOW RUN
```

## 5. Exact proven defects to correct

### DEFECT A — unauthorized objective alias
Current resolver accepts non-canonical:
`OBJECTIVE_i_COMMENT`

It aliases to `SELF_COMMENT` and may return a writable address with `projectionPath = null`.

Required:
```text
OBJECTIVE_i_SELF_COMMENT = ACCEPT (canonical only)
OBJECTIVE_i_COMMENT = REJECT / EXPORT_TEMPLATE_PROFILE_UNRESOLVED
```

Do not add another compatibility alias.

### DEFECT B — unauthorized competency alias
Current resolver accepts non-canonical:
`COMPETENCY_b_RATING`

Required:
```text
COMPETENCY_b_SELF_RATING = ACCEPT (canonical only)
COMPETENCY_b_RATING = REJECT / EXPORT_TEMPLATE_PROFILE_UNRESOLVED
```

### DEFECT C — incomplete production mapping-integrity validation
Keep validator pure, but validate the actual production-safe mapping set instead of only metadata/counts.

At minimum fail closed for:
1. missing required Part A safe header mapping;
2. missing required Part A Hoshin mapping;
3. missing required Part A safe objective mapping;
4. malformed Part A safe address;
5. null/empty required Part A objective projection path;
6. missing/malformed Part A safe summary mapping;
7. duplicate Part A exclusive safe target;
8. missing/malformed Part B safe header mapping;
9. missing/malformed Part B safe summary mapping;
10. wrong/missing Part B competency count/index/self-rating address;
11. null/empty Part B competency self-rating projection path;
12. duplicate Part B exclusive safe target where applicable;
13. protected row30/34/38 exposed dynamic;
14. unsupported profile/template/count;
15. any successful production writable resolution with null/unknown secured projection path.

Default accepted MBO2026 profile must validate successfully.

### DEFECT D — missing negative tests
Add direct tests proving exact `EXPORT_TEMPLATE_PROFILE_UNRESOLVED` for at least:
- `OBJECTIVE_1_COMMENT`;
- `COMPETENCY_1_RATING`;
- null required objective projection-path mutation;
- malformed Part A safe summary address mutation;
- broken/malformed Part B safe header mutation;
- broken/malformed Part B safe summary mutation;
- missing/wrong Part B competency mapping/index/address;
- null/empty Part B competency projection path;
- duplicate Part B exclusive safe target mutation;
- protected row30/34/38 exposure.

## 6. Preserve accepted behavior
Do NOT regress:
- exact Part A SHA `03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3`;
- exact Part B SHA `c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3`;
- Part A count = numeric integer 4..10 only;
- Part B count = numeric integer 6/7/8 only;
- Part B structural/privacy topology;
- `SELF_DYNAMIC_AUTHORITY = K:Q`;
- `CHIEF_DYNAMIC_AUTHORITY = R:X` as structural/privacy metadata only;
- row30/34/38 protected non-dynamic;
- exact semantic classification 18/22/5;
- Chief secured writable role = zero;
- caller input immutability;
- immutable returned mapping structures;
- stable error family `EXPORT_TEMPLATE_PROFILE_UNRESOLVED`;
- zero workbook I/O;
- zero Kintone/API adapter;
- zero scoring/formula mapping or recalculation.

Every successful `resolveSemanticRole()` result must have both:
```text
address = valid non-empty approved address
projectionPath = valid non-empty secured projection path
```

Non-canonical/unknown roles must fail closed; do not normalize or alias them into an accepted role.

## 7. Required tests/invariants
Tests must directly prove:
```text
SAFE_ROLE_CLASS_COUNT = 18
UNRESOLVED_ROLE_CLASS_COUNT = 22
NO_SOURCE_ROLE_CLASS_COUNT = 5
OBJECTIVE_i_COMMENT = REJECT
COMPETENCY_b_RATING = REJECT
OBJECTIVE_i_SELF_COMMENT = ACCEPT
COMPETENCY_b_SELF_RATING = ACCEPT
SUCCESSFUL_RESOLUTION_WITH_NULL_PATH = 0
DUPLICATE_EXCLUSIVE_WRITABLE_TARGETS = 0
CHIEF_FROZEN_AUTHORITY = R:X
CHIEF_SECURED_WRITABLE_ROLE = 0
FORMULA_OR_SCORING_MAPPING = 0
```

Retain direct proof of Department/Section/Hoshin ownership, N6/N7/N8 summary relocation and row30/34/38 protection.

## 8. Low-credit read boundary
Antigravity should read ONLY:
1. `project-docs/D2_REVIEW_FAST_START.md`;
2. `project-docs/AI_ACTIVE_TASK.md`;
3. `project-docs/CONFIRMED_BASELINE/D2_XLSX_TEMPLATE_SEMANTIC_MAPPING_CLOSURE.md`;
4. `src/profiles/mbo-xlsx-template-profile.js`;
5. `tests/mbo-xlsx-template-profile.test.js`.

Do NOT broad-scan the repository. Do NOT re-read evidence history. Do NOT inspect XLSX templates. Do NOT invoke Claude.

## 9. Commands
Run exactly:
```bash
node --check src/profiles/mbo-xlsx-template-profile.js
node --check tests/mbo-xlsx-template-profile.test.js
node --test tests/mbo-xlsx-template-profile.test.js
node --test tests/mbo-export-service.test.js
npm audit --omit=dev
git status --porcelain
```

## 10. Explicit out of scope
Do NOT modify:
- `src/services/mbo-export-service.js`;
- feasibility source/tests;
- any Baseline/control document during executor work;
- package.json / package-lock.json;
- owner XLSX binaries;
- `dist/`;
- any third repository file.

Do NOT:
- create/edit Production XLSX Renderer;
- read/write/mutate XLSX workbook in production code;
- generate XLSX/PDF/image evidence;
- recalculate scores;
- widen semantic authority;
- reconstruct confidential Employee-Self fields;
- touch Kintone/ACL/process/customization;
- deploy;
- run Live UAT;
- invoke Claude;
- start Combined Excel parity, PDF parity, security regression or D3.

## 11. Verification / commit contract
Before commit:
```bash
git diff --name-only
git status --porcelain
```

Exactly these two paths may differ:
```text
src/profiles/mbo-xlsx-template-profile.js
tests/mbo-xlsx-template-profile.test.js
```

Then:
- create exactly ONE implementation OR blocker commit;
- push to `ai/antigravity-wp002c`;
- STOP immediately;
- do not self-declare PASS/CLOSED;
- do not start Renderer or next gate.

Report only:
- implementation/blocker commit SHA;
- exact changed files;
- both `node --check` results;
- both `node --test` results with pass/fail/skip counts;
- `npm audit --omit=dev` result;
- `git status --porcelain`;
- blocker if any.

## 12. Authorization ledger
```text
D2-WP004-R1-SOURCE-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP004-R1-R1-SOURCE-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP004-R1-R2-EVIDENCE-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP004-R1-R2-R1-EVIDENCE-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP004-R1-R2-R2-EVIDENCE-20260902-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP004-R1-R3-SOURCE-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP004-R1-R3-R1-SOURCE-TEST-20260902-01 = ACTIVE / ONE-SHOT / SOURCE+TEST / LOW-CREDIT
CONTROL-PLANE-D2-REVIEW-CORRECTIVE-20-ROUND-20260901 = EXHAUSTED / DO NOT REUSE
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP004-R1-R3-R1-SOURCE-TEST-20260902-01
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP004-R1-R3-R1-SOURCE-TEST-20260902-01
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
NEXT_EXECUTOR = ANTIGRAVITY
NEXT_ACTION = EXECUTE EXACT R1-R3-R1 CONTRACT, PUSH ONE COMMIT, STOP
CLAUDE = STOP
KINTONE = NONE
DEPLOY = NONE
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```