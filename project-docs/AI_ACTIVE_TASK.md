# AI ACTIVE TASK — D2-WP004-R2-PRE2-R3-R2 CORRECTIVE AUTHORIZED

Mode: **CONTROL PLANE / ANTIGRAVITY BOUNDED ONE-SHOT / OOXML-FEASIBILITY+TEST CORRECTIVE ONLY / LOW-CREDIT / NO RENDERER AUTH / NO KINTONE / NO DEPLOY / D3 HOLD**
Branch: `ai/antigravity-wp002c`
Updated: 2026-09-02 ICT

Fresh-fetch current HEAD first. Fast path: `D2_REVIEW_FAST_START.md` -> this file -> `phase-3/D2_WP004_R2_PRE2_PRESENTATION_AUTHORITY_DESIGN.md` -> exact PRE2-R3/R3-R1 diffs -> only the two authorized files.

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
D2_WP004_R2_PRE2_R1 = PASS / CLOSED AFTER CORRECTIVE
D2_WP004_R2_PRE2_R1_R1 = PASS / CLOSED
D2_WP004_R2_PRE2_R2 = PASS / CLOSED
D2_WP004_R2_PRE2_R3 = NEEDS CORRECTIVE / NOT CLOSED
D2_WP004_R2_PRE2_R3_R1 = NEEDS CORRECTIVE / NOT CLOSED

SAFE_TO_MAP = 20 EXACT
UNRESOLVED = 22 EXACT
NO_SECURED_PROJECTION_SOURCE = 5 EXACT
CHIEF_FROZEN_AUTHORITY = R:X / NOT SECURED WRITABLE

ACTIVE_WORK_PACKAGE = D2-WP004-R2-PRE2-R3-R2
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP004-R2-PRE2-R3-R2-OOXML-FEASIBILITY-TEST-CORRECTIVE-20260902-01
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP004-R2-PRE2-R3-R2-OOXML-FEASIBILITY-TEST-CORRECTIVE-20260902-01
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE

ANTIGRAVITY = AUTHORIZED / BOUNDED CORRECTIVE / ONE COMMIT -> PUSH -> STOP
CLAUDE = STOP
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```

Owner authorization phrase:
`อนุมัติ D2-WP004-R2-PRE2-R3-R2 OOXML-FEASIBILITY+TEST CORRECTIVE ตามขอบเขตที่เสนอ`

Authorization token:
`D2-WP004-R2-PRE2-R3-R2-OOXML-FEASIBILITY-TEST-CORRECTIVE-20260902-01`

Authorization basis HEAD:
`cf564c4fb6ee10a2926331eacef1a0b02839c56c`

## 2. Accepted corrective truth — MUST NOT REGRESS

```text
INTERMEDIATE_MERGES = N6 79 / N7 85 / N8 91
FINAL_MERGES = N6 79 / N7 86 / N8 93
BASE_PRIVACY = N6 432 / N7 474 / N8 516
EFFECTIVE_PRIVACY = N6 432 / N7 492 / N8 552
DIMENSIONS = A1:X35 / A1:X39 / A1:X43
PRINT_AREA = accepted exact N6/N7/N8 values
TITLE_MERGES = B31:J31 / B35:J35
DESCRIPTION_MERGES = B32:J32 / B36:J36
RATING_SCALE = B33:J33 / B37:J37 / STATIC
PADDING = rows 30 / 34 / 38 / PROTECTED
FORMULA_INVENTORY = 0
```

Already accepted from R3-R1 and must remain:
- pre-sanitize B31/B35 are validated blank before mutation;
- stale B32/B36 descriptions are validated before mutation;
- Rating Scale text is validated before sanitization;
- positive-path structural-vs-final relationship tuples are equal;
- positive-path media inventory is equal;
- auxiliary Sheet1 is preserved;
- source owner-template bytes remain immutable.

## 3. AUTHORIZED WORK PACKAGE — D2-WP004-R2-PRE2-R3-R2

```text
WORK_PACKAGE = D2-WP004-R2-PRE2-R3-R2
NAME = PART B EXPANDED PRESENTATION OOXML PROOF VALIDATOR CORRECTIVE
AUTHORIZATION = D2-WP004-R2-PRE2-R3-R2-OOXML-FEASIBILITY-TEST-CORRECTIVE-20260902-01
STATE = AUTHORIZED / ACTIVE
MODE = OOXML-FEASIBILITY+TEST CORRECTIVE / BOUNDED / ONE-SHOT / LOW-CREDIT

WRITABLE_FILES =
  scripts/export/mbo-xlsx-ooxml-feasibility.js
  tests/mbo-xlsx-ooxml-feasibility.test.js

EXPORT_SERVICE_CHANGE = FORBIDDEN
PROFILE_CHANGE = FORBIDDEN
PRODUCTION_RENDERER_CHANGE = FORBIDDEN
BASELINE_CHANGE_BY_EXECUTOR = FORBIDDEN
CONTROL_DOC_CHANGE_BY_EXECUTOR = FORBIDDEN
PACKAGE_CHANGE = FORBIDDEN
DIST_CHANGE = FORBIDDEN
KINTONE_WRITE = FORBIDDEN
DEPLOY = FORBIDDEN
D3 = HOLD
```

No other file may be edited.

## 4. Exact corrective contract

Correct ONLY the two remaining R3-R1 review blockers.
Do not redesign the feasibility harness and do not implement Production Renderer.

### A. Replace self-fulfilling negative tests with production-validator-driven proof
The current negative matrix contains fake local values and direct expected throws. Those are not sufficient.

Required correction:
- extract/reuse bounded production validation helpers where necessary;
- validators must operate on real in-memory workbook/buffer/topology/evidence produced by the feasibility pipeline;
- tests must mutate real evidence/buffers or provide malformed evidence to the same validator used by the positive path;
- the production validator must emit the blocker;
- tests must NOT directly throw the expected blocker as their proof;
- no test-only production backdoor.

Required real negative cases:
1. wrong title overlay merge range;
2. duplicate/extra/wrong title merge or wrong final merge count;
3. wrong effective dynamic count or unauthorized presentation dynamic address;
4. wrong stale title state;
5. wrong stale description state;
6. Rating Scale mutation;
7. protected padding mutation;
8. wrong final summary topology;
9. relationship tuple regression;
10. media/reference-image inventory regression;
11. auxiliary Sheet1/package regression where applicable.

Use `BLOCKER_PART_B_PRESENTATION_OVERLAY_UNRESOLVED` or the existing narrower authoritative privacy blocker where that validator already owns the failure.

### B. Mechanical final summary topology from ACTUAL final output
Do NOT compute final summary row from `n` and call that topology evidence.

Required behavior:
- identify the accepted summary/signature block marker/topology from the structural input;
- inspect the final overlay workbook after all XlsxPopulate/raw-OOXML round trips;
- mechanically locate the corresponding summary/signature block in final output;
- prove actual final start rows:
  - N6 = 31
  - N7 = 35
  - N8 = 39
- preserve block ordering/content topology;
- if marker/block is moved, duplicated, missing or malformed, production validation must fail closed.

The final `effectiveMetrics[n].summaryStartRow` must come from observed final workbook evidence, not from `n === 6 ? ...` hardcoding.

### C. Production final-overlay validator is allowed if bounded
A small reusable production helper is authorized in the feasibility source only if needed to validate final overlay evidence.

It may validate only:
- exact overlay merge set/count;
- effective privacy overlay address set/count;
- protected Rating Scale/padding state;
- actual final summary topology;
- relationship/media/reference-image/Sheet1 preservation.

It must NOT:
- become the Production Renderer;
- write semantic values;
- broaden dynamic authority;
- change Export Service/Profile authority;
- add scoring/recalculation.

### D. Positive-path invariants remain exact
Preserve all accepted positive metrics listed in section 2.

## 5. Required focused tests

Modify only `tests/mbo-xlsx-ooxml-feasibility.test.js` and prove at minimum:

1. existing relevant structural/privacy/overlay positive tests still pass;
2. actual final summary topology is observed from final workbook as 31/35/39;
3. wrong/moved final summary marker/block passed into production validator fails;
4. wrong title-overlay merge range passed into production validator fails;
5. duplicate/extra title merge passed into production validator fails;
6. wrong final merge count passed into production validator fails;
7. unauthorized presentation dynamic address passed into production privacy/overlay validation fails;
8. wrong effective dynamic count from malformed real evidence fails;
9. stale title mutation on real structural buffer fails pre-sanitize validation;
10. stale description mutation on real structural buffer fails pre-sanitize validation;
11. Rating Scale mutation on real structural/final evidence fails;
12. padding mutation on real evidence fails;
13. relationship tuple mutation on real fingerprint/evidence fails production preservation validator;
14. media/reference-image mutation on real fingerprint/evidence fails production preservation validator;
15. auxiliary Sheet1 mutation fails if included in final-overlay preservation validator;
16. positive final relationship tuples/media/Sheet1 still exactly equal structural input;
17. final merges remain 79/86/93;
18. effective privacy remains 432/492/552;
19. dimensions and Print_Area remain exact;
20. source bytes remain immutable;
21. formula inventory remains zero.

Forbidden test pattern:
```text
const fakeX = ...
if (fakeX !== expected) throw new Error(expectedBlocker)
```
when that throw is not coming from the production feasibility validator under test.

Run focused:
`tests/mbo-xlsx-ooxml-feasibility.test.js`

## 6. Executor protocol

```text
fresh-fetch authorization HEAD
-> verify branch ai/antigravity-wp002c
-> read fast-start + this file + PRE2 design + exact R3/R3-R1 diff
-> modify only the two authorized files
-> implement minimal validator corrective
-> run focused OOXML feasibility tests
-> verify git diff contains only the two authorized files
-> commit exactly once
-> push ai/antigravity-wp002c
-> report commit SHA + exact changed files + test command/result
-> STOP
```

Antigravity must NOT self-declare PASS/CLOSED.
Final executor status:
`CORRECTIVE FEASIBILITY VALIDATOR COMPLETE / AWAITING CHATGPT INDEPENDENT REVIEW`.

## 7. Authorization ledger

```text
D2-WP004-R2-PRE2-R3-OOXML-FEASIBILITY-TEST-20260902-01 = CONSUMED / NEEDS CORRECTIVE / DO NOT REUSE
D2-WP004-R2-PRE2-R3-R1-OOXML-FEASIBILITY-TEST-CORRECTIVE-20260902-01 = CONSUMED / NEEDS CORRECTIVE / DO NOT REUSE
D2-WP004-R2-PRE2-R3-R2-OOXML-FEASIBILITY-TEST-CORRECTIVE-20260902-01 = ACTIVE / ONE-SHOT / CONSUME ON ONE CORRECTIVE COMMIT
NEXT_EXECUTOR = ANTIGRAVITY
NEXT_ACTION = EXECUTE PRE2-R3-R2 EXACTLY, PUSH, REPORT, STOP
CLAUDE = STOP
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```
