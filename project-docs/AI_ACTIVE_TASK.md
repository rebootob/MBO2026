# AI ACTIVE TASK — D2-WP004-R2-PRE2-R1 SOURCE+TEST AUTHORIZED

Mode: **CONTROL PLANE / ANTIGRAVITY BOUNDED ONE-SHOT / SOURCE+TEST ONLY / LOW-CREDIT / NO PROFILE AUTH / NO OOXML AUTH / NO RENDERER AUTH / NO KINTONE / NO DEPLOY / D3 HOLD**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-02 ICT

Fresh-fetch current HEAD first. Read `D2_REVIEW_FAST_START.md` -> this file -> `phase-3/D2_WP004_R2_PRE2_PRESENTATION_AUTHORITY_DESIGN.md` -> only the two authorized source/test files and directly referenced code needed to implement this exact contract.

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

ACTIVE_WORK_PACKAGE = D2-WP004-R2-PRE2-R1
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP004-R2-PRE2-R1-SOURCE-TEST-20260902-01
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP004-R2-PRE2-R1-SOURCE-TEST-20260902-01
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE

ANTIGRAVITY = AUTHORIZED / BOUNDED SOURCE+TEST / ONE COMMIT -> PUSH -> STOP
CLAUDE = STOP
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```

Owner authorization phrase:
`อนุมัติ D2-WP004-R2-PRE2-R1 SOURCE+TEST ตามขอบเขตที่เสนอ`

Authorization token:
`D2-WP004-R2-PRE2-R1-SOURCE-TEST-20260902-01`

## 2. Frozen PRE2 design authority

Design:
`project-docs/phase-3/D2_WP004_R2_PRE2_PRESENTATION_AUTHORITY_DESIGN.md`

Mandatory decisions:

```text
COMPETENCY_1_TO_6_PRESENTATION = OWNER TEMPLATE STATIC AUTHORITY / DO NOT REWRITE
EXPANDED_ORDINAL_7 = COMP_LEAD
EXPANDED_ORDINAL_8 = COMP_STRAT
CANONICAL_EXPANDED_IDENTITY = code
ALIAS_PRECEDENCE = FORBIDDEN
```

Required secured projection fields for expanded items only:

```text
partB.competencyItems[b-1].presentationTitle
partB.competencyItems[b-1].presentationDescription
```

Exact titles:

```text
b=7 + code=COMP_LEAD  -> 7. Leadership & People Management
b=8 + code=COMP_STRAT -> 8. Strategy & Coaching
```

Exact description rule:

```text
presentationDescription = exact nonblank item.description
```

No fallback to `name`, `title`, `competencyName`, legacy label text, stale workbook text, translation, concatenation, or first-nonblank guessing.

Proposed fail-closed error family:
`EXPORT_COMPETENCY_PRESENTATION_UNRESOLVED`

## 3. AUTHORIZED WORK PACKAGE — D2-WP004-R2-PRE2-R1

```text
WORK_PACKAGE = D2-WP004-R2-PRE2-R1
NAME = EXPANDED COMPETENCY CANONICAL PRESENTATION PROJECTION
AUTHORIZATION = D2-WP004-R2-PRE2-R1-SOURCE-TEST-20260902-01
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

## 4. Exact implementation contract

Modify `MboExportService.projectCombinedExport()` only as needed to canonicalize expanded competency presentation at the secured projection boundary.

For each `competencyItems` entry:

### A. N6 / competencies 1..6
- preserve existing projection behavior;
- do not require `presentationTitle` or `presentationDescription`;
- do not rewrite or normalize existing aliases merely for this WP;
- no backward-compatibility regression.

### B. Expanded competency 7
When ordinal/index 7 is present:
- exact `code` must be `COMP_LEAD`;
- emit `presentationTitle = "7. Leadership & People Management"`;
- `description` must be a nonblank string;
- emit `presentationDescription` equal to the exact `description` value;
- if code is missing/wrong or description blank/missing, throw `EXPORT_COMPETENCY_PRESENTATION_UNRESOLVED`.

### C. Expanded competency 8
When ordinal/index 8 is present:
- exact `code` must be `COMP_STRAT`;
- emit `presentationTitle = "8. Strategy & Coaching"`;
- `description` must be a nonblank string;
- emit `presentationDescription` equal to the exact `description` value;
- if code is missing/wrong or description blank/missing, throw `EXPORT_COMPETENCY_PRESENTATION_UNRESOLVED`.

### D. Ordinal determination
Use deterministic array ordinal in `partB.competencyItems` / source `competencyItems` position for this bounded WP unless existing code already provides an equally strict canonical ordinal. Do not introduce a new schema guess.

### E. Alias resistance
Conflicting values in:
`name`, `title`, `competencyName`, or legacy labels
must not override the code-derived canonical `presentationTitle`.

### F. Privacy
Employee-Self projection may expose only the new safe presentation fields plus the already-allowed safe keys; evaluator fields must remain omitted exactly as before.
Approver projection must produce the same canonical presentation identity while preserving existing authorized full projection behavior.

Do not change export authorization rules, profile weighting, score calculations, Part A projection, or Chief authority.

## 5. Required focused tests

Add/adjust tests in `tests/mbo-export-service.test.js` only.

At minimum prove:
1. b7 `COMP_LEAD` -> exact canonical `presentationTitle`;
2. b8 `COMP_STRAT` -> exact canonical `presentationTitle`;
3. expanded `presentationDescription` equals exact input `description`;
4. conflicting `name/title/competencyName` cannot override canonical title;
5. b7 wrong/missing code fails closed;
6. b8 wrong/missing code fails closed;
7. b7/b8 missing or blank description fails closed;
8. N6 remains backward-compatible and does not require expanded canonical fields;
9. Employee-Self still strips manager/GM/evaluator/score fields while retaining canonical presentation values;
10. Approver gets the same canonical presentation title/description for expanded items;
11. no regression to existing export authorization/security tests.

Run the focused export-service test file. If practical under the existing repository test contract, run the existing relevant export-service suite only; do not broaden into unrelated repository work.

## 6. Executor protocol

```text
fresh-fetch authorization HEAD
-> verify branch ai/antigravity-wp002c
-> read this control file + PRE2 design
-> inspect only exact authorized source/test scope
-> implement minimal source change
-> add focused tests
-> run tests
-> verify git diff contains exactly the two authorized files (or fewer if one legitimately unchanged)
-> commit exactly once
-> push ai/antigravity-wp002c
-> report commit SHA + exact changed files + test command/result
-> STOP
```

Antigravity must NOT:
- edit Template Profile;
- edit OOXML feasibility source/tests;
- implement title merges;
- implement renderer/sanitizer;
- alter Baselines/control docs;
- change package/package-lock/dist;
- perform Kintone writes/deploys;
- start D3;
- self-declare PRE2-R1 PASS/CLOSED.

Final status from executor must remain:
`IMPLEMENTATION COMPLETE / AWAITING CHATGPT INDEPENDENT REVIEW`.

## 7. Authorization ledger

```text
D2-WP004-R2-PRE1-EVIDENCE-20260902-01 = CONSUMED / CLOSED / DO NOT REUSE
D2-WP004-R2-PRE1-R1-EVIDENCE-CORRECTIVE-20260902-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP004-R2-PRE2 = READ-ONLY DESIGN COMPLETE
D2-WP004-R2-PRE2-R1-SOURCE-TEST-20260902-01 = ACTIVE / ONE-SHOT / CONSUME ON ONE IMPLEMENTATION COMMIT

NEXT_EXECUTOR = ANTIGRAVITY
NEXT_ACTION = EXECUTE PRE2-R1 SOURCE+TEST EXACTLY, PUSH, REPORT, STOP
CLAUDE = STOP
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```
