# AI ACTIVE TASK — D2-WP004-R2-PRE2-R3-R3 NEEDS CORRECTIVE

Mode: **CONTROL PLANE / NO ACTIVE EXECUTOR / LOW-CREDIT / NO RENDERER AUTH / NO KINTONE / NO DEPLOY / D3 HOLD**
Branch: `ai/antigravity-wp002c`
Updated: 2026-09-02 ICT

Fresh-fetch current HEAD first. Fast path: `D2_REVIEW_FAST_START.md` -> this file -> `phase-3/D2_WP004_R2_PRE2_PRESENTATION_AUTHORITY_DESIGN.md` -> exact PRE2-R3/R3-R1/R3-R2/R3-R3 feasibility diffs only.

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

## 2. PRE2-R3-R3 independent review authority

```text
AUTHORIZATION_COMMIT = bb9f508a69af41de5a4b1fae6a9d5013b9b8d3dd
IMPLEMENTATION_COMMIT = 1542ac8ebef1f22505ba0d240c9e064d2b2cd8f8
AUTH_TO_IMPLEMENTATION = EXACTLY ONE COMMIT
CHANGED_FILES =
  scripts/export/mbo-xlsx-ooxml-feasibility.js
  tests/mbo-xlsx-ooxml-feasibility.test.js
SCOPE_REVIEW = PASS
CONTENT_REVIEW = NEEDS CORRECTIVE
TOKEN = CONSUMED / DO NOT REUSE
GITHUB_RUNTIME_SIGNAL = UNAVAILABLE / NO STATUS / NO WORKFLOW RUN
```

Accepted R3-R3 improvements that PASS review and must not regress:
- `validatePreSanitizePartBPresentationState()` is a bounded production helper;
- positive `getExpandedPresentationPartBBuffers()` calls the pre-sanitize helper before any blanking;
- real structural B31/B35/B32/B36/B33/B37 mutations are tested directly against that helper and prove the intended pre-sanitize failure path;
- `validatePartBEffectivePrivacyOverlay()` is called by the positive final-overlay validator;
- positive effective counts remain N6/N7/N8 = 432/492/552;
- Rating Scale/padding non-dynamic checks remain in production validation;
- final merges remain 79/86/93;
- observed final summary rows remain 31/35/39;
- relationship/media/Sheet1 preservation remains checked;
- dimensions/Print_Area/source immutability/formula-zero remain accepted.

## 3. Remaining material blocker

### A. Dynamic validator does not enforce the exact authorized effective dynamic-address set

`validatePartBEffectivePrivacyOverlay()` currently proves:
- total dynamic-address count;
- required presentation ranges are present;
- Rating Scale is not dynamic;
- padding is not dynamic.

However it does **not** compare the complete observed effective dynamic-address set against the exact expected set derived from the already-closed base privacy topology plus the authorized presentation overlay.

Therefore a malformed evidence set can remove one otherwise-authorized non-presentation dynamic address and substitute an unrelated unauthorized address while keeping the same total count and all required presentation cells. Such evidence can pass the current helper as long as the substituted address is not a checked Rating Scale/padding cell.

The R3-R3 test labelled “Unauthorized dynamic presentation address” adds `Z99` without removing any existing address, so it is rejected by the count check (493 vs 492). This does not prove exact-set rejection independently from wrong-count rejection.

This conflicts with the authorized requirement:
`exact authorized expanded presentation dynamic set only / no unauthorized presentation dynamic address / no dynamic-authority widening outside accepted topology`.

Corrective requirement:
- derive the exact expected effective dynamic-address set from authoritative base privacy evidence for N plus only the authorized presentation additions;
- require exact set equality, including uniqueness, not only length;
- reject missing, duplicate, substituted or unauthorized addresses even when the total array length remains correct;
- keep Rating Scale/padding checks as defense in depth;
- add a same-count substitution negative test: remove one authorized non-required/base dynamic address and insert an unauthorized address; production helper must reject for exact-set mismatch;
- preserve the existing wrong-count negative test separately;
- no Production Renderer implementation.

## 4. Proposed smallest corrective — NOT AUTHORIZED

```text
PROPOSED_WORK_PACKAGE = D2-WP004-R2-PRE2-R3-R4
NAME = PART B EFFECTIVE DYNAMIC EXACT-SET PROOF CORRECTIVE
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

Exact R3-R4 objective:
1. preserve the accepted pre-sanitize helper unchanged unless a minimal compatibility adjustment is strictly necessary;
2. make effective dynamic validation compare exact unique address-set equality against authoritative expected base + presentation overlay topology;
3. prove same-count unauthorized substitution fails production validation;
4. prove duplicate/missing address fails even when raw array length could otherwise mask the issue;
5. preserve separate wrong-count, Rating Scale, padding, merge, summary, package/media/Sheet1 negatives;
6. preserve all accepted positive metrics;
7. exactly one corrective commit -> push -> report -> STOP;
8. do not implement Production Renderer.

Recommended Owner phrase:
`อนุมัติ D2-WP004-R2-PRE2-R3-R4 OOXML-FEASIBILITY+TEST CORRECTIVE ตามขอบเขตที่เสนอ`

## 5. Authorization ledger

```text
D2-WP004-R2-PRE2-R3-OOXML-FEASIBILITY-TEST-20260902-01 = CONSUMED / NEEDS CORRECTIVE / DO NOT REUSE
D2-WP004-R2-PRE2-R3-R1-OOXML-FEASIBILITY-TEST-CORRECTIVE-20260902-01 = CONSUMED / NEEDS CORRECTIVE / DO NOT REUSE
D2-WP004-R2-PRE2-R3-R2-OOXML-FEASIBILITY-TEST-CORRECTIVE-20260902-01 = CONSUMED / NEEDS CORRECTIVE / DO NOT REUSE
D2-WP004-R2-PRE2-R3-R3-OOXML-FEASIBILITY-TEST-CORRECTIVE-20260902-01 = CONSUMED / NEEDS CORRECTIVE / DO NOT REUSE
D2-WP004-R2-PRE2-R3-R4 = PROPOSED / NOT AUTHORIZED
NEXT_EXECUTOR = OWNER / CHATGPT CONTROL PLANE
NEXT_ACTION = DECIDE WHETHER TO AUTHORIZE PRE2-R3-R4
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```
