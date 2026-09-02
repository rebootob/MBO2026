# AI ACTIVE TASK — D2-WP004-R2-PRE2-R3-R1 CORRECTIVE AUTHORIZED

Mode: **CONTROL PLANE / ANTIGRAVITY BOUNDED ONE-SHOT / OOXML-FEASIBILITY+TEST CORRECTIVE ONLY / LOW-CREDIT / NO RENDERER AUTH / NO KINTONE / NO DEPLOY / D3 HOLD**
Branch: `ai/antigravity-wp002c`
Updated: 2026-09-02 ICT

Fresh-fetch current HEAD first. Fast path: `D2_REVIEW_FAST_START.md` -> this file -> `phase-3/D2_WP004_R2_PRE2_PRESENTATION_AUTHORITY_DESIGN.md` -> exact PRE2-R3 implementation diff -> only the two authorized files.

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

SAFE_TO_MAP = 20 EXACT
UNRESOLVED = 22 EXACT
NO_SECURED_PROJECTION_SOURCE = 5 EXACT
CHIEF_FROZEN_AUTHORITY = R:X / NOT SECURED WRITABLE

ACTIVE_WORK_PACKAGE = D2-WP004-R2-PRE2-R3-R1
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP004-R2-PRE2-R3-R1-OOXML-FEASIBILITY-TEST-CORRECTIVE-20260902-01
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP004-R2-PRE2-R3-R1-OOXML-FEASIBILITY-TEST-CORRECTIVE-20260902-01
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
`อนุมัติ D2-WP004-R2-PRE2-R3-R1 OOXML-FEASIBILITY+TEST CORRECTIVE ตามขอบเขตที่เสนอ`

Authorization token:
`D2-WP004-R2-PRE2-R3-R1-OOXML-FEASIBILITY-TEST-CORRECTIVE-20260902-01`

Authorization basis HEAD:
`2a0403fbfedef60f71219031fae27746ee590cc7`

## 2. Prior PRE2-R3 review authority

```text
PRE2_R3_AUTHORIZATION_COMMIT = e73831089337d3bc93c6b809894f6891be2a3ce9
PRE2_R3_IMPLEMENTATION_COMMIT = 431b0a298e994002e590f0eef5b3169eddb5d540
PRE2_R3_SCOPE_REVIEW = PASS
PRE2_R3_CONTENT_REVIEW = NEEDS CORRECTIVE
PRE2_R3_REVIEW_BLOCKER_COMMIT = 2a0403fbfedef60f71219031fae27746ee590cc7
PRE2_R3_TOKEN = CONSUMED / DO NOT REUSE
```

Accepted implementation parts must not regress:
- intermediate merges N6/N7/N8 = 79/85/91;
- final overlay merges = 79/86/93;
- base privacy = 432/474/516;
- effective privacy = 432/492/552;
- exact title merges `B31:J31` / `B35:J35`;
- description merges `B32:J32` / `B36:J36`;
- Rating Scale static at `B33:J33` / `B37:J37`;
- padding rows 30/34/38 protected;
- dimensions and Print_Area preserved;
- source bytes immutable;
- formula inventory zero.

## 3. AUTHORIZED WORK PACKAGE — D2-WP004-R2-PRE2-R3-R1

```text
WORK_PACKAGE = D2-WP004-R2-PRE2-R3-R1
NAME = PART B EXPANDED PRESENTATION OOXML + PRIVACY OVERLAY PROOF CORRECTIVE
AUTHORIZATION = D2-WP004-R2-PRE2-R3-R1-OOXML-FEASIBILITY-TEST-CORRECTIVE-20260902-01
STATE = AUTHORIZED / ACTIVE
MODE = OOXML-FEASIBILITY+TEST CORRECTIVE / BOUNDED / ONE-SHOT / LOW-CREDIT

WRITABLE_FILES =
  scripts/export/mbo-xlsx-ooxml-feasibility.js
  tests/mbo-xlsx-ooxml-feasibility.test.js

EXPORT_SERVICE_CHANGE = FORBIDDEN
PROFILE_CHANGE = FORBIDDEN
PRODUCTION_RENDERER_CHANGE = FORBIDDEN
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

Correct PRE2-R3 only. Do not redesign or broaden scope.

### A. Pre-sanitize state validation for ALL expanded presentation targets
Before mutating any expanded presentation target, mechanically validate the frozen structural-transform state for:

```text
N7: B31, B32
N8: B31, B32, B35, B36
```

Required behavior:
- establish expected title-target state for `B31/B35` mechanically from the accepted source-row transform;
- if expected state is blank/no-value, assert exactly blank/no-value before mutation;
- unexpected title content must fail closed with the PRE2-R3 blocker family;
- continue exact stale competency-6 description validation at `B32/B36`;
- continue exact Rating Scale validation at `B33/B37`;
- only after every title/description target validates may sanitization blank those targets.

Do not silently erase unexpected values.

### B. Overlay-specific negative fail-closed proof
Add bounded pure/helper validation where necessary, without a production backdoor, to prove rejection for:
1. wrong title overlay range;
2. wrong final merge count or duplicate/unexpected title merge;
3. wrong effective dynamic count or unauthorized dynamic overlay range;
4. wrong stale title/description expectation;
5. unexpected protected Rating Scale or padding mutation;
6. unrelated package/reference-image relationship mutation;
7. wrong final summary topology.

All must reject with the PRE2-R3 blocker family (or the existing narrower privacy blocker where that is the authoritative validator).

### C. Final summary topology proof
After XlsxPopulate/raw-OOXML round-trip, mechanically verify final summary remains at exact start rows:

```text
N6 = 31
N7 = 35
N8 = 39
```

Use actual final worksheet topology/content/relocation evidence, not merely an expected variable recorded before mutation.
Preserve the already-accepted summary/signature block structure.

### D. Final package/reference-image preservation proof
For each N6/N7/N8 final overlay buffer:
- fingerprint accepted structural input and final overlay output;
- relationship tuples must remain unchanged except no intended relationship change exists in this corrective, therefore require exact equality;
- media inventory must remain exact equality;
- reference-image drawing/media/relationship topology must remain exact equality;
- auxiliary Sheet1/package relationships remain preserved;
- fail closed on any unrelated package/reference-image regression.

Worksheet merge/content changes and exact Print_Area value already authorized are not permission to alter relationships/media.

### E. Preserve all accepted metrics and geometry
Must remain exact:

```text
INTERMEDIATE MERGES = 79 / 85 / 91
FINAL MERGES = 79 / 86 / 93
BASE PRIVACY = 432 / 474 / 516
EFFECTIVE PRIVACY = 432 / 492 / 552
DIMENSIONS = A1:X35 / A1:X39 / A1:X43
SUMMARY START = 31 / 35 / 39
```

Overlay:
- N7 title merge `B31:J31`
- N8 title merges `B31:J31`, `B35:J35`
- dynamic presentation only `B31:J32` and, for N8, `B35:J36`
- Rating Scale static
- padding protected
- Chief authority unchanged
- source/caller bytes immutable
- formula inventory zero
- no scoring/recalculation logic.

## 5. Required focused tests

Modify only `tests/mbo-xlsx-ooxml-feasibility.test.js` and prove at minimum:
1. existing relevant structural/privacy tests still pass;
2. pre-sanitize `B31/B35` exact expected state is validated before blanking;
3. pre-sanitize `B32/B36` exact stale competency-6 description is validated;
4. unexpected title value fails closed before mutation;
5. unexpected stale description fails closed;
6. wrong overlay merge range fails closed;
7. wrong merge count / duplicate or extra title merge fails closed;
8. wrong dynamic count / unauthorized presentation dynamic cell fails closed;
9. Rating Scale mutation fails closed;
10. padding/protected mutation fails closed;
11. final summary rows are mechanically proven 31/35/39;
12. wrong final summary topology fails closed;
13. final relationship tuples equal accepted structural input for N6/N7/N8;
14. final media/reference-image inventory equals accepted structural input for N6/N7/N8;
15. synthetic package/reference-image relationship regression fails closed;
16. final merges remain 79/86/93;
17. effective privacy remains 432/492/552;
18. dimensions and Print_Area remain exact;
19. source bytes remain immutable;
20. formula inventory remains zero.

Run focused:
`tests/mbo-xlsx-ooxml-feasibility.test.js`

## 6. Executor protocol

```text
fresh-fetch authorization HEAD
-> verify branch ai/antigravity-wp002c
-> read this file + PRE2 design + exact PRE2-R3 implementation diff
-> modify only the two authorized files
-> implement minimum corrective
-> run focused OOXML feasibility tests
-> verify git diff contains exactly the two authorized files (or fewer if legitimately unchanged)
-> commit exactly once
-> push ai/antigravity-wp002c
-> report commit SHA + exact changed files + test command/result
-> STOP
```

Antigravity must not self-declare PASS/CLOSED.
Final executor status:
`CORRECTIVE FEASIBILITY PROOF COMPLETE / AWAITING CHATGPT INDEPENDENT REVIEW`.

## 7. Authorization ledger

```text
D2-WP004-R2-PRE2-R3-OOXML-FEASIBILITY-TEST-20260902-01 = CONSUMED / NEEDS CORRECTIVE / DO NOT REUSE
D2-WP004-R2-PRE2-R3-R1-OOXML-FEASIBILITY-TEST-CORRECTIVE-20260902-01 = ACTIVE / ONE-SHOT / CONSUME ON ONE CORRECTIVE COMMIT
NEXT_EXECUTOR = ANTIGRAVITY
NEXT_ACTION = EXECUTE PRE2-R3-R1 CORRECTIVE EXACTLY, PUSH, REPORT, STOP
CLAUDE = STOP
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```
