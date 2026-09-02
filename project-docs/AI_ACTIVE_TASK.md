# AI ACTIVE TASK — D2-WP004-R2-PRE2-R3 NEEDS CORRECTIVE

Mode: **CONTROL PLANE / NO ACTIVE EXECUTOR / LOW-CREDIT / NO RENDERER AUTH / NO KINTONE / NO DEPLOY / D3 HOLD**
Branch: `ai/antigravity-wp002c`
Updated: 2026-09-02 ICT

Fresh-fetch current HEAD first. Fast path: `D2_REVIEW_FAST_START.md` -> this file -> `phase-3/D2_WP004_R2_PRE2_PRESENTATION_AUTHORITY_DESIGN.md` -> exact PRE2-R3 feasibility diff only.

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

ACTIVE_WORK_PACKAGE = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE

ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```

## 2. PRE2-R3 independent review

```text
AUTHORIZATION = D2-WP004-R2-PRE2-R3-OOXML-FEASIBILITY-TEST-20260902-01
AUTHORIZATION_COMMIT = e73831089337d3bc93c6b809894f6891be2a3ce9
IMPLEMENTATION_COMMIT = 431b0a298e994002e590f0eef5b3169eddb5d540
AUTH_TO_IMPLEMENTATION = EXACTLY ONE COMMIT
CHANGED_FILES =
  scripts/export/mbo-xlsx-ooxml-feasibility.js
  tests/mbo-xlsx-ooxml-feasibility.test.js
SCOPE_REVIEW = PASS
CONTENT_REVIEW = NEEDS CORRECTIVE
TOKEN = CONSUMED / DO NOT REUSE
GITHUB_RUNTIME_SIGNAL = UNAVAILABLE / NO STATUS / NO WORKFLOW RUN
```

Accepted parts of the implementation:
- frozen intermediate merge counts 79/85/91 are validated before overlay;
- final title overlays target B31:J31 and B35:J35 with final merge counts 79/86/93;
- base privacy counts 432/474/516 are validated before effective overlay counts 432/492/552;
- Rating Scale and padding remain non-dynamic in the positive-path proof;
- source owner-template bytes are hash-checked for immutability;
- formula inventory remains zero in the positive-path proof.

## 3. Material blockers

### A. Stale title target is mutated before its expected pre-sanitize state is validated
The proof validates stale description values at B32/B36 and Rating Scale text, but it does not validate the pre-sanitize title targets B31/B35. It then blanks B31/B35 unconditionally.

This violates the authorized fail-closed order:
```text
identify exact stale title/description state
-> validate it is the expected clone state
-> only then sanitize
```

Corrective requirement:
- mechanically establish the expected pre-sanitize state for B31 and B35 from the frozen source-row transform;
- if the correct expected title target state is blank/no-value, prove that explicitly;
- if any unexpected value exists there, fail closed before mutation;
- validate B32/B36 stale description state as already done;
- only after all presentation targets are validated may they be blanked.

### B. Required negative fail-closed matrix is incomplete
The authorized test contract explicitly requires fail-closed proof for malformed/wrong overlay range, wrong merge count, wrong dynamic count, wrong stale-clone expectation, and unexpected protected-cell mutation.

The new PRE2-R3 test is primarily positive-path. It does not directly demonstrate those required overlay-specific negative cases.

Corrective requirement:
- add bounded test hooks/helpers or pure validation helpers only where necessary;
- do not add a production backdoor;
- prove each specified malformed state rejects with the PRE2-R3 blocker family.

### C. Final overlay package/reference-image preservation is not directly proven
The pipeline round-trips the structural buffers through XlsxPopulate and raw ZIP/XML mutation. The PRE2-R3 contract requires no package/relationship or reference-image regression in the final overlay outputs.

Existing structural tests prove preservation for the structural stage, but the new final overlay buffers themselves are not fingerprint-compared for relationship tuples/media/reference-image package invariants.

Corrective requirement:
- compare final overlay output package/relationship/media/reference-image invariants against the accepted structural input for each N=6/7/8;
- only intended worksheet merge/content/defined-name changes may differ;
- fail closed on unrelated package/reference-image regression.

### D. Final summary-row preservation is asserted indirectly, not mechanically re-proven after overlay round-trip
The implementation records `summaryStartRow` from the expected count during intermediate validation, but the final overlay proof does not directly verify the relocated summary remains at exact rows 31/35/39 after the XlsxPopulate/raw-XML round-trip.

Corrective requirement:
- mechanically prove final summary location/content topology remains at 31/35/39 for N6/N7/N8 after overlay;
- do not merely record the expected row number.

## 4. Proposed smallest corrective — NOT AUTHORIZED

```text
PROPOSED_WORK_PACKAGE = D2-WP004-R2-PRE2-R3-R1
NAME = PART B EXPANDED PRESENTATION OOXML + PRIVACY OVERLAY PROOF CORRECTIVE
STATE = PROPOSED / NOT AUTHORIZED
MODE = OOXML-FEASIBILITY+TEST / BOUNDED / ONE-SHOT / LOW-CREDIT
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

Required R3-R1 corrective:
1. validate exact pre-sanitize state for all title/description targets B31/B32/B35/B36 before mutation;
2. prove title targets are exactly the mechanically expected frozen-transform state and reject unexpected values;
3. keep description stale-clone and Rating Scale validation;
4. add overlay-specific negative tests for wrong overlay range, merge count, dynamic count, stale expectation and protected mutation;
5. mechanically verify final summary rows 31/35/39 after overlay;
6. mechanically verify final package/relationship/media/reference-image preservation for N6/N7/N8;
7. preserve intermediate 79/85/91, final 79/86/93, base privacy 432/474/516, effective privacy 432/492/552;
8. preserve dimensions, Print_Area, source immutability and zero formulas;
9. exactly one corrective commit -> push -> report -> STOP;
10. do not implement Production Renderer.

Recommended Owner phrase:
`อนุมัติ D2-WP004-R2-PRE2-R3-R1 OOXML-FEASIBILITY+TEST CORRECTIVE ตามขอบเขตที่เสนอ`

## 5. Authorization ledger

```text
D2-WP004-R2-PRE2-R3-OOXML-FEASIBILITY-TEST-20260902-01 = CONSUMED / NEEDS CORRECTIVE / DO NOT REUSE
D2-WP004-R2-PRE2-R3-R1 = PROPOSED / NOT AUTHORIZED
NEXT_EXECUTOR = OWNER / CHATGPT CONTROL PLANE
NEXT_ACTION = DECIDE WHETHER TO AUTHORIZE PRE2-R3-R1
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```
