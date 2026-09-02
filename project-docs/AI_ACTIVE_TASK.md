# AI ACTIVE TASK — D2-WP004-R2-PRE2-R3-R4 CORRECTIVE AUTHORIZED

Mode: **CONTROL PLANE / ANTIGRAVITY BOUNDED ONE-SHOT / OOXML-FEASIBILITY+TEST CORRECTIVE ONLY / LOW-CREDIT / NO RENDERER AUTH / NO KINTONE / NO DEPLOY / D3 HOLD**
Branch: `ai/antigravity-wp002c`
Updated: 2026-09-02 ICT

Fresh-fetch current HEAD first. Fast path: `D2_REVIEW_FAST_START.md` -> this file -> `phase-3/D2_WP004_R2_PRE2_PRESENTATION_AUTHORITY_DESIGN.md` -> exact PRE2-R3/R3-R1/R3-R2/R3-R3 diffs -> only the two authorized files.

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
D2_WP004_R2_PRE2_R3_R2 = NEEDS CORRECTIVE / NOT CLOSED
D2_WP004_R2_PRE2_R3_R3 = NEEDS CORRECTIVE / NOT CLOSED

SAFE_TO_MAP = 20 EXACT
UNRESOLVED = 22 EXACT
NO_SECURED_PROJECTION_SOURCE = 5 EXACT
CHIEF_FROZEN_AUTHORITY = R:X / NOT SECURED WRITABLE

ACTIVE_WORK_PACKAGE = D2-WP004-R2-PRE2-R3-R4
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP004-R2-PRE2-R3-R4-OOXML-FEASIBILITY-TEST-CORRECTIVE-20260902-01
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP004-R2-PRE2-R3-R4-OOXML-FEASIBILITY-TEST-CORRECTIVE-20260902-01
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
`อนุมัติ D2-WP004-R2-PRE2-R3-R4 OOXML-FEASIBILITY+TEST CORRECTIVE ตามขอบเขตที่เสนอ`

Authorization token:
`D2-WP004-R2-PRE2-R3-R4-OOXML-FEASIBILITY-TEST-CORRECTIVE-20260902-01`

Authorization basis HEAD:
`be11078acc8bbe366a089ad9e78065574695483b`

## 2. PRE2-R3-R3 review authority

```text
R3_R3_AUTHORIZATION_COMMIT = bb9f508a69af41de5a4b1fae6a9d5013b9b8d3dd
R3_R3_IMPLEMENTATION_COMMIT = 1542ac8ebef1f22505ba0d240c9e064d2b2cd8f8
R3_R3_REVIEW_BLOCKER_COMMIT = be11078acc8bbe366a089ad9e78065574695483b
R3_R3_SCOPE_REVIEW = PASS
R3_R3_CONTENT_REVIEW = NEEDS CORRECTIVE
R3_R3_TOKEN = CONSUMED / DO NOT REUSE
```

Accepted R3-R3 improvements that MUST NOT regress:
- `validatePreSanitizePartBPresentationState()` is a bounded production helper;
- positive `getExpandedPresentationPartBBuffers()` calls it before any presentation blanking;
- B31/B35/B32/B36/B33/B37 malformed structural evidence is proven against that exact pre-sanitize helper;
- `validatePartBEffectivePrivacyOverlay()` is called by the positive final-overlay validator;
- effective counts remain N6/N7/N8 = 432/492/552;
- final merges remain 79/86/93;
- observed final summary rows remain 31/35/39;
- Rating Scale/padding protection, relationship/media/Sheet1 preservation, dimensions, Print_Area, source immutability and formula-zero remain accepted.

## 3. AUTHORIZED WORK PACKAGE — D2-WP004-R2-PRE2-R3-R4

```text
WORK_PACKAGE = D2-WP004-R2-PRE2-R3-R4
NAME = PART B EFFECTIVE DYNAMIC EXACT-SET PROOF CORRECTIVE
AUTHORIZATION = D2-WP004-R2-PRE2-R3-R4-OOXML-FEASIBILITY-TEST-CORRECTIVE-20260902-01
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

Correct ONLY the remaining R3-R3 exact-set blocker. Do not redesign or broaden scope.

### A. Preserve pre-sanitize authority
Keep `validatePreSanitizePartBPresentationState()` behavior unchanged unless a minimal compatibility adjustment is strictly required by the exact-set implementation. Do not weaken any pre-sanitize proof.

### B. Exact effective dynamic-address authority
Strengthen `validatePartBEffectivePrivacyOverlay()` so it proves the complete observed effective dynamic-address set equals the exact authorized set for N.

The expected set must be derived from authoritative already-closed privacy topology, not from the malformed observed array itself.

Required authority:

```text
N6:
  EXPECTED_EFFECTIVE_DYNAMIC_SET = exact accepted N6 base dynamic set
  COUNT = 432
  PRESENTATION_ADDITION = none

N7:
  EXPECTED_EFFECTIVE_DYNAMIC_SET = exact accepted N7 base dynamic set + B31:J32
  COUNT = 492

N8:
  EXPECTED_EFFECTIVE_DYNAMIC_SET = exact accepted N8 base dynamic set + B31:J32 + B35:J36
  COUNT = 552
```

Requirements:
1. normalize addresses deterministically;
2. require every observed address to be valid and unique;
3. require exact set equality, not only array length;
4. reject any missing authorized address;
5. reject any duplicate address;
6. reject any substituted address even when total raw length is unchanged;
7. reject any unauthorized address outside the exact expected set;
8. preserve Rating Scale and padding checks as defense in depth;
9. do not broaden Chief R:X authority;
10. positive final-overlay validator must continue to use this exact helper.

Do not hardcode an unrelated parallel dynamic list if the authoritative expected set can be derived from existing source-backed privacy resolution. Prefer one source of truth.

### C. Same-count substitution proof
Add a direct production-helper negative test using real positive N7 or N8 dynamic evidence:
- start from the real accepted effective dynamic-address array;
- remove one authorized non-required/base dynamic address;
- insert one unauthorized address such as a valid worksheet address outside the expected authority;
- keep raw array length exactly unchanged;
- call `validatePartBEffectivePrivacyOverlay()`;
- require rejection specifically due exact-set mismatch / unauthorized address, not count mismatch.

Also prove:
- duplicate + compensating removal with same raw length rejects;
- missing authorized address rejects;
- existing wrong-count test remains separate and still rejects;
- existing Rating Scale/padding dynamic negatives remain passing.

### D. Preserve all accepted positive results

```text
INTERMEDIATE_MERGES = 79 / 85 / 91
FINAL_MERGES = 79 / 86 / 93
BASE_PRIVACY = 432 / 474 / 516
EFFECTIVE_PRIVACY = 432 / 492 / 552
SUMMARY_START_OBSERVED = 31 / 35 / 39
DIMENSIONS = A1:X35 / A1:X39 / A1:X43
TITLE_MERGES = B31:J31 / B35:J35
DESCRIPTION_MERGES = B32:J32 / B36:J36
RATING_SCALE = B33:J33 / B37:J37 / STATIC
PADDING = 30 / 34 / 38 / PROTECTED
FORMULA_INVENTORY = 0
```

Also preserve exact Print_Area, source bytes, relationship tuples, media/reference-image inventory, auxiliary Sheet1, Chief authority, and no scoring/recalculation.

No Production Renderer implementation is authorized.

## 5. Required focused tests

Modify only `tests/mbo-xlsx-ooxml-feasibility.test.js` and prove at minimum:
1. all existing relevant R3/R3-R1/R3-R2/R3-R3 positive and negative tests still pass;
2. N6/N7/N8 positive effective dynamic sets validate exactly at 432/492/552;
3. same-count authorized-address removal + unauthorized substitution rejects;
4. same-count duplicate + compensating removal rejects;
5. missing required/base authorized address rejects;
6. wrong-count evidence remains independently rejected;
7. Rating Scale marked dynamic rejects;
8. padding marked dynamic rejects;
9. pre-sanitize B31/B35/B32/B36/B33/B37 proof remains unchanged and passing;
10. final merges remain 79/86/93;
11. final summary remains mechanically observed 31/35/39;
12. dimensions and Print_Area remain exact;
13. package/media/Sheet1 preservation remains exact;
14. source bytes remain immutable;
15. formula inventory remains zero.

Run focused:
`tests/mbo-xlsx-ooxml-feasibility.test.js`

## 6. Executor protocol

```text
fresh-fetch authorization HEAD
-> verify branch ai/antigravity-wp002c
-> read fast-start + this file + PRE2 design + exact R3/R3-R1/R3-R2/R3-R3 diffs
-> modify only the two authorized files
-> implement minimum exact-set corrective
-> run focused OOXML feasibility tests
-> verify git diff contains exactly the two authorized files, or fewer only if legitimately unchanged
-> commit exactly once
-> push ai/antigravity-wp002c
-> report commit SHA + exact changed files + test command/result
-> STOP
```

Antigravity must NOT self-declare PASS/CLOSED.
Final executor status:
`CORRECTIVE EFFECTIVE DYNAMIC EXACT-SET PROOF COMPLETE / AWAITING CHATGPT INDEPENDENT REVIEW`.

## 7. Authorization ledger

```text
D2-WP004-R2-PRE2-R3-OOXML-FEASIBILITY-TEST-20260902-01 = CONSUMED / NEEDS CORRECTIVE / DO NOT REUSE
D2-WP004-R2-PRE2-R3-R1-OOXML-FEASIBILITY-TEST-CORRECTIVE-20260902-01 = CONSUMED / NEEDS CORRECTIVE / DO NOT REUSE
D2-WP004-R2-PRE2-R3-R2-OOXML-FEASIBILITY-TEST-CORRECTIVE-20260902-01 = CONSUMED / NEEDS CORRECTIVE / DO NOT REUSE
D2-WP004-R2-PRE2-R3-R3-OOXML-FEASIBILITY-TEST-CORRECTIVE-20260902-01 = CONSUMED / NEEDS CORRECTIVE / DO NOT REUSE
D2-WP004-R2-PRE2-R3-R4-OOXML-FEASIBILITY-TEST-CORRECTIVE-20260902-01 = ACTIVE / ONE-SHOT / CONSUME ON ONE CORRECTIVE COMMIT
NEXT_EXECUTOR = ANTIGRAVITY
NEXT_ACTION = EXECUTE PRE2-R3-R4 EXACTLY, PUSH, REPORT, STOP
CLAUDE = STOP
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```
