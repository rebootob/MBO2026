# AI ACTIVE TASK — D2-WP004-R2-PRE2-R3-R2 NEEDS CORRECTIVE

Mode: **CONTROL PLANE / NO ACTIVE EXECUTOR / LOW-CREDIT / NO RENDERER AUTH / NO KINTONE / NO DEPLOY / D3 HOLD**
Branch: `ai/antigravity-wp002c`
Updated: 2026-09-02 ICT

Fresh-fetch current HEAD first. Fast path: `D2_REVIEW_FAST_START.md` -> this file -> `phase-3/D2_WP004_R2_PRE2_PRESENTATION_AUTHORITY_DESIGN.md` -> exact PRE2-R3/R3-R1/R3-R2 feasibility diffs only.

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

## 2. PRE2-R3-R2 independent review authority

```text
AUTHORIZATION_COMMIT = bc429a140080d4bdab7fdf823e4f7a63fe896f97
IMPLEMENTATION_COMMIT = 298f480ad3f2257327dbea82c3bc3bcd41054b60
AUTH_TO_IMPLEMENTATION = EXACTLY ONE COMMIT
CHANGED_FILES =
  scripts/export/mbo-xlsx-ooxml-feasibility.js
  tests/mbo-xlsx-ooxml-feasibility.test.js
SCOPE_REVIEW = PASS
CONTENT_REVIEW = NEEDS CORRECTIVE
TOKEN = CONSUMED / DO NOT REUSE
GITHUB_RUNTIME_SIGNAL = UNAVAILABLE / NO STATUS / NO WORKFLOW RUN
```

Accepted R3-R2 improvements that pass review and must not regress:
- `validateExpandedPresentationOverlayPartB()` is now a bounded production feasibility validator and is called by the positive `getExpandedPresentationPartBBuffers()` pipeline;
- final summary start row is mechanically observed from final workbook text/topology rather than recorded from a hardcoded expected row;
- positive-path final merge counts remain 79/86/93;
- effective privacy counts remain 432/492/552;
- Rating Scale and padding protection remain in the production validator path;
- relationship tuples, media inventory and auxiliary Sheet1 preservation remain production-validator checked against structural input;
- source bytes/formula-zero/accepted dimensions/Print_Area remain preserved by the positive path.

## 3. Remaining material blockers

### A. Dynamic overlay negative proof is still missing
The authorized R3-R2 contract required real malformed evidence for:
- unauthorized presentation dynamic address;
- wrong effective dynamic count.

The R3-R2 negative matrix does not include either case. Current tests cover title/description content, Rating Scale, padding, merge range/count, summary, relationships, media and Sheet1, but they do not exercise malformed dynamic-address evidence against the production privacy/overlay validator.

Corrective requirement:
- add the smallest bounded production helper/validation seam only if necessary;
- malformed dynamic evidence must be passed to the same production validation logic used by the positive path;
- prove an extra/unauthorized dynamic presentation address rejects;
- prove an incorrect effective dynamic count derived from malformed real evidence rejects;
- no fake local count plus direct test throw.

### B. Stale title/description negative cases do not prove the intended pre-sanitize guards
The R3-R2 tests mutate `rawB7` structural buffers and then call the final-overlay validator.

However N7 structural input has intermediate merge count 85 while the final-overlay validator requires 86. Therefore those tests can reject on final merge-count mismatch before reaching any stale title/description condition.

This does not mechanically prove that the production pre-sanitize title/description guards themselves fail closed.

Corrective requirement:
- extract/reuse a bounded pre-sanitize presentation-state validator/helper used by the actual positive pipeline before blanking;
- it must validate B31/B35 blank state, B32/B36 exact stale description, and B33/B37 Rating Scale state as applicable;
- the positive pipeline must call this helper before sanitization;
- negative tests must mutate real structural buffers and call the same helper;
- prove title mutation fails for the title reason and stale-description mutation fails for the stale-description reason before any final-overlay merge-count validation;
- no test-only backdoor.

## 4. Proposed smallest corrective — NOT AUTHORIZED

```text
PROPOSED_WORK_PACKAGE = D2-WP004-R2-PRE2-R3-R3
NAME = PART B PRESENTATION PRE-SANITIZE + DYNAMIC-OVERLAY PROOF CORRECTIVE
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

Exact R3-R3 objective:
1. introduce/reuse one bounded production pre-sanitize validator used by the real positive pipeline;
2. prove mutated B31/B35 and B32/B36 structural evidence fails that validator before sanitization;
3. add real malformed dynamic-overlay evidence proving unauthorized dynamic address and wrong effective dynamic count fail production validation;
4. preserve all accepted R3/R3-R1/R3-R2 positive invariants;
5. exactly one corrective commit -> push -> report -> STOP;
6. do not implement Production Renderer.

Recommended Owner phrase:
`อนุมัติ D2-WP004-R2-PRE2-R3-R3 OOXML-FEASIBILITY+TEST CORRECTIVE ตามขอบเขตที่เสนอ`

## 5. Authorization ledger

```text
D2-WP004-R2-PRE2-R3-OOXML-FEASIBILITY-TEST-20260902-01 = CONSUMED / NEEDS CORRECTIVE / DO NOT REUSE
D2-WP004-R2-PRE2-R3-R1-OOXML-FEASIBILITY-TEST-CORRECTIVE-20260902-01 = CONSUMED / NEEDS CORRECTIVE / DO NOT REUSE
D2-WP004-R2-PRE2-R3-R2-OOXML-FEASIBILITY-TEST-CORRECTIVE-20260902-01 = CONSUMED / NEEDS CORRECTIVE / DO NOT REUSE
D2-WP004-R2-PRE2-R3-R3 = PROPOSED / NOT AUTHORIZED
NEXT_EXECUTOR = OWNER / CHATGPT CONTROL PLANE
NEXT_ACTION = DECIDE WHETHER TO AUTHORIZE PRE2-R3-R3
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```
