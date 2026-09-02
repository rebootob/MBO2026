# AI ACTIVE TASK — D2-WP004-R2-PRE2-R1-R1 SOURCE+TEST CORRECTIVE AUTHORIZED

Mode: **CONTROL PLANE / ANTIGRAVITY BOUNDED ONE-SHOT / SOURCE+TEST CORRECTIVE ONLY / LOW-CREDIT / NO PROFILE AUTH / NO OOXML AUTH / NO RENDERER AUTH / NO KINTONE / NO DEPLOY / D3 HOLD**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-02 ICT

Fresh-fetch current HEAD first. Read `D2_REVIEW_FAST_START.md` -> this file -> `phase-3/D2_WP004_R2_PRE2_PRESENTATION_AUTHORITY_DESIGN.md` -> exact PRE2-R1 implementation diff -> only the two authorized files.

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
ACTIVE_WORK_PACKAGE = D2-WP004-R2-PRE2-R1-R1
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP004-R2-PRE2-R1-R1-SOURCE-TEST-CORRECTIVE-20260902-01
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP004-R2-PRE2-R1-R1-SOURCE-TEST-CORRECTIVE-20260902-01
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = AUTHORIZED / BOUNDED SOURCE+TEST CORRECTIVE / ONE COMMIT -> PUSH -> STOP
CLAUDE = STOP
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```

Owner authorization phrase:
`อนุมัติ D2-WP004-R2-PRE2-R1-R1 SOURCE+TEST CORRECTIVE ตามขอบเขตที่เสนอ`

Authorization token:
`D2-WP004-R2-PRE2-R1-R1-SOURCE-TEST-CORRECTIVE-20260902-01`

## 2. Prior review authority

```text
PRE2_R1_AUTHORIZATION_COMMIT = b8c3de176da8d90b35d2b53ce1cf37c2bb5a7833
PRE2_R1_IMPLEMENTATION_COMMIT = 9154ab33f2fd6262fa5d3e7717f7eed4f4052e0a
PRE2_R1_SCOPE_REVIEW = PASS
PRE2_R1_CONTENT_REVIEW = NEEDS CORRECTIVE
PRE2_R1_REVIEW_BLOCKER_COMMIT = 1803144a18f4572dce73b524b5f5baab55923d11
PRE2_R1_TOKEN = CONSUMED / DO NOT REUSE
```

## 3. AUTHORIZED WORK PACKAGE — D2-WP004-R2-PRE2-R1-R1

```text
WORK_PACKAGE = D2-WP004-R2-PRE2-R1-R1
NAME = EXPANDED COMPETENCY CANONICAL PRESENTATION PROJECTION CORRECTIVE
AUTHORIZATION = D2-WP004-R2-PRE2-R1-R1-SOURCE-TEST-CORRECTIVE-20260902-01
STATE = AUTHORIZED / ACTIVE
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

No other file may be edited.

## 4. Exact corrective contract

Correct PRE2-R1 only. Do not redesign.

### A. Restore N1..6 backward compatibility
For ordinals 1..6:
- preserve exact pre-PRE2-R1 projection behavior;
- if an item is non-object, return/pass it through exactly as before rather than throwing a new presentation error;
- do not require `presentationTitle` or `presentationDescription`;
- do not add or synthesize new presentation fields for b1..6.

### B. Expanded validation only for b7/b8
For ordinal 7:
```text
item must be an object
item.code === 'COMP_LEAD' EXACT / CASE-SENSITIVE / NO TRIM-NORMALIZATION
item.description = nonblank string
presentationTitle = '7. Leadership & People Management'
presentationDescription = exact item.description
```

For ordinal 8:
```text
item must be an object
item.code === 'COMP_STRAT' EXACT / CASE-SENSITIVE / NO TRIM-NORMALIZATION
item.description = nonblank string
presentationTitle = '8. Strategy & Coaching'
presentationDescription = exact item.description
```

Wrong/missing/malformed expanded item, code or description => throw `EXPORT_COMPETENCY_PRESENTATION_UNRESOLVED`.

Ordinal >8 remains unsupported and may fail closed with the same blocker family.

### C. Employee-Self presentation boundary
- do NOT globally whitelist caller-supplied `presentationTitle` / `presentationDescription` in `safeKeys`;
- b1..6 caller-supplied presentation fields must not gain new Employee-Self exposure through this WP;
- for b7/b8 only, assign `presentationTitle` and `presentationDescription` from the canonical values computed by `MboExportService`;
- existing evaluator/confidential stripping remains unchanged.

### D. Approver boundary
- b7/b8 receive the same computed canonical presentation values;
- preserve existing authorized full projection behavior;
- do not alter authorization, weighting, scoring, Part A or Chief authority.

### E. Alias resistance
`name`, `title`, `competencyName`, legacy labels, lowercase/whitespace variants must never override or normalize into accepted canonical identity.

## 5. Required focused tests

Modify only `tests/mbo-export-service.test.js` and prove at minimum:
1. b7 exact `COMP_LEAD` succeeds with exact canonical title;
2. b8 exact `COMP_STRAT` succeeds with exact canonical title;
3. exact `description` passthrough is preserved;
4. conflicting aliases cannot override canonical title;
5. b7 missing/wrong code fails closed;
6. b8 missing/wrong code fails closed;
7. lowercase code fails closed;
8. leading/trailing whitespace code fails closed;
9. b7/b8 missing or blank description fails closed;
10. ordinals 1..6 preserve pre-PRE2-R1 non-object pass-through behavior;
11. b1..6 Employee-Self caller-supplied `presentationTitle/presentationDescription` are not newly exposed;
12. Employee-Self b7/b8 receives only computed canonical presentation plus existing safe fields and still strips evaluator data;
13. Approver b7/b8 gets same computed canonical presentation;
14. existing export authorization/security tests continue to pass.

Run focused `mbo-export-service` tests.

## 6. Executor protocol

```text
fresh-fetch authorization HEAD
-> verify branch ai/antigravity-wp002c
-> read this control file + PRE2 design + prior implementation diff
-> inspect only exact authorized source/test files
-> implement minimal corrective
-> run focused tests
-> verify git diff contains exactly the two authorized files (or fewer if legitimately unchanged)
-> commit exactly once
-> push ai/antigravity-wp002c
-> report commit SHA + exact files + test command/result
-> STOP
```

Antigravity must not self-declare PASS/CLOSED. Final executor status:
`CORRECTIVE IMPLEMENTATION COMPLETE / AWAITING CHATGPT INDEPENDENT REVIEW`.

## 7. Authorization ledger

```text
D2-WP004-R2-PRE2-R1-SOURCE-TEST-20260902-01 = CONSUMED / NEEDS CORRECTIVE / DO NOT REUSE
D2-WP004-R2-PRE2-R1-R1-SOURCE-TEST-CORRECTIVE-20260902-01 = ACTIVE / ONE-SHOT / CONSUME ON ONE CORRECTIVE COMMIT
NEXT_EXECUTOR = ANTIGRAVITY
NEXT_ACTION = EXECUTE PRE2-R1-R1 CORRECTIVE EXACTLY, PUSH, REPORT, STOP
CLAUDE = STOP
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```
