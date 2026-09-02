# AI ACTIVE TASK — D2-WP004-R2-PRE2-R3-R1 NEEDS CORRECTIVE

Mode: **CONTROL PLANE / NO ACTIVE EXECUTOR / LOW-CREDIT / NO RENDERER AUTH / NO KINTONE / NO DEPLOY / D3 HOLD**
Branch: `ai/antigravity-wp002c`
Updated: 2026-09-02 ICT

Fresh-fetch current HEAD first. Fast path: `D2_REVIEW_FAST_START.md` -> this file -> `phase-3/D2_WP004_R2_PRE2_PRESENTATION_AUTHORITY_DESIGN.md` -> exact PRE2-R3/R3-R1 feasibility diff only.

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

## 2. PRE2-R3 / R3-R1 independent review authority

```text
PRE2_R3_AUTHORIZATION_COMMIT = e73831089337d3bc93c6b809894f6891be2a3ce9
PRE2_R3_IMPLEMENTATION_COMMIT = 431b0a298e994002e590f0eef5b3169eddb5d540
PRE2_R3_REVIEW_BLOCKER_COMMIT = 2a0403fbfedef60f71219031fae27746ee590cc7
PRE2_R3_SCOPE_REVIEW = PASS
PRE2_R3_CONTENT_REVIEW = NEEDS CORRECTIVE

PRE2_R3_R1_AUTHORIZATION_COMMIT = f2e2bbcfe4465e0249542c41fef807c7645c603a
PRE2_R3_R1_IMPLEMENTATION_COMMIT = 4e66cca1d2a41b4d40cf8b1b41587b47abbb590f
PRE2_R3_R1_AUTH_TO_IMPLEMENTATION = EXACTLY ONE COMMIT
PRE2_R3_R1_CHANGED_FILES =
  scripts/export/mbo-xlsx-ooxml-feasibility.js
  tests/mbo-xlsx-ooxml-feasibility.test.js
PRE2_R3_R1_SCOPE_REVIEW = PASS
PRE2_R3_R1_CONTENT_REVIEW = NEEDS CORRECTIVE
GITHUB_RUNTIME_SIGNAL = UNAVAILABLE / NO STATUS / NO WORKFLOW RUN
```

Accepted parts that now pass review and must not regress:
- pre-sanitize title targets `B31/B35` are checked blank before mutation;
- stale descriptions `B32/B36` and Rating Scale text are checked before sanitization;
- final structural-vs-overlay relationship tuples, media inventory, and auxiliary Sheet1 fingerprints are compared on the positive path;
- intermediate merges remain 79/85/91;
- final merges remain 79/86/93;
- base privacy remains 432/474/516;
- effective privacy remains 432/492/552;
- dimensions and Print_Area remain accepted values;
- source bytes immutable and formula inventory zero on positive path.

## 3. Remaining material blockers

### A. Negative fail-closed tests are self-fulfilling and do not exercise production validation
Several new negative cases create local `fake...` values and then throw the expected blocker directly inside the test. They do not pass malformed workbook/buffer/topology into the production feasibility validators/pipeline.

Examples include:
- fake merge count;
- fake dynamic-address count;
- fake summary row;
- fake relationship tuples;
- fake media inventory.

These tests can pass even if production code has no corresponding fail-closed behavior.

Corrective requirement:
- extract bounded pure production validators/helpers where needed, or allow validation of supplied in-memory evidence without weakening production authority;
- negative tests must invoke those production validators/helpers using malformed real evidence/buffers/topology;
- no test-only backdoor and no direct `throw expected error` as the proof itself.

Required real negative cases remain:
1. wrong title overlay range;
2. duplicate/extra/wrong title merge or wrong final merge count;
3. wrong effective dynamic count / unauthorized presentation dynamic cell;
4. wrong stale title/description expectation;
5. Rating Scale mutation;
6. padding/protected mutation;
7. wrong summary topology;
8. relationship/media/reference-image regression.

### B. Final summary topology is still not mechanically read from final output
The R3-R1 implementation sets:

```text
summaryStartRowFromTopology = n === 6 ? 31 : (n === 7 ? 35 : 39)
```

and compares it to another expected value. This is still a computed expectation, not evidence read from the final workbook after the XlsxPopulate/raw-OOXML round-trip.

Corrective requirement:
- identify an accepted summary/signature topology marker from the structural input;
- inspect the final output and locate/prove that marker/block actually starts at row 31/35/39;
- wrong/moved final summary topology must fail the production validator.

## 4. Proposed smallest corrective — NOT AUTHORIZED

```text
PROPOSED_WORK_PACKAGE = D2-WP004-R2-PRE2-R3-R2
NAME = PART B EXPANDED PRESENTATION OOXML PROOF VALIDATOR CORRECTIVE
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

Exact R3-R2 objective:
1. replace self-throwing/fake negative assertions with production-validator-driven malformed-evidence tests;
2. add a bounded reusable final-overlay validator/helper if necessary;
3. mechanically derive final summary topology from actual final workbook evidence;
4. prove malformed real overlay merge/dynamic/protected/summary/package evidence fails closed;
5. preserve all accepted positive metrics and package preservation;
6. exactly one corrective commit -> push -> report -> STOP;
7. do not implement Production Renderer.

Recommended Owner phrase:
`อนุมัติ D2-WP004-R2-PRE2-R3-R2 OOXML-FEASIBILITY+TEST CORRECTIVE ตามขอบเขตที่เสนอ`

## 5. Authorization ledger

```text
D2-WP004-R2-PRE2-R3-OOXML-FEASIBILITY-TEST-20260902-01 = CONSUMED / NEEDS CORRECTIVE / DO NOT REUSE
D2-WP004-R2-PRE2-R3-R1-OOXML-FEASIBILITY-TEST-CORRECTIVE-20260902-01 = CONSUMED / NEEDS CORRECTIVE / DO NOT REUSE
D2-WP004-R2-PRE2-R3-R2 = PROPOSED / NOT AUTHORIZED
NEXT_EXECUTOR = OWNER / CHATGPT CONTROL PLANE
NEXT_ACTION = DECIDE WHETHER TO AUTHORIZE PRE2-R3-R2
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```
