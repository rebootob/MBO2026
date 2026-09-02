# AI ACTIVE TASK — D2 R7 PRIVACY REMAP PROPOSED / NO ACTIVE EXECUTOR

Mode: **CONTROL PLANE / FORMULA AUTHORITY CLOSED / R7 PROPOSED NOT AUTHORIZED / NO KINTONE / NO DEPLOY / D3 HOLD**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-02 ICT

Repository truth and accepted newer Live evidence always win. Fresh-fetch current branch HEAD before acting.

## 0. Fast read path

1. `project-docs/D2_REVIEW_FAST_START.md`
2. this file
3. only the directly relevant `CONFIRMED_BASELINE/` file
4. exact authorization→implementation diff and changed files when review begins

Do not re-read closed-gate internals by default.

## 1. Current truth

```text
OWNER_OBJECTIVE = COMPLETE D2 TO PASS / CLOSED BEFORE D3
D1_OVERALL = PASS / CLOSED
D2_STATUS = IN PROGRESS
D2_PRESERVATION_GATE = PASS / CLOSED
D2_REFERENCE_IMAGE_GATE = PASS / CLOSED
D2_PART_A_STRUCTURAL_GATE = PASS / CLOSED
D2_PART_B_STRUCTURAL_GATE = PASS / CLOSED
D2_FORMULA_AUTHORITY_GATE = PASS / CLOSED
CONTROL_PLANE_REVIEW_CORRECTIVE_STANDING_AUTH = EXHAUSTED / 20 OF 20 / DO NOT REUSE
ANTIGRAVITY_AUTO_AUTH = NO
CLAUDE_AUTO_REVIEW = NO
ACTIVE_WORK_PACKAGE = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
PRIVACY_PURGE_REQUIRED = NO
D3_EXECUTION = HOLD UNTIL D2 PASS / CLOSED
ANTIGRAVITY = STOP
CLAUDE = STOP
```

## 2. Newly closed gate — Formula Authority

Durable authority:
`project-docs/CONFIRMED_BASELINE/D2_FORMULA_AUTHORITY_CLOSURE.md`

```text
SCORING_SOURCE_OF_TRUTH = KINTONE / APP794 + CONFIRMED SCORING CONFIG
EXPORT_DATA_AUTHORITY = SECURED MboExportService PROJECTION
LEGACY_EXCEL_TEMPLATE_AUTHORITY = VISUAL / LAYOUT ONLY
EXCEL_SCORE_FORMULAS = FORBIDDEN
EXPORT_RENDERER_SCORE_RECALCULATION = FORBIDDEN
AUTHORIZED_APPROVER_EXPORT = WRITE SCALAR VALUES FROM SECURED PROJECTION ONLY
EMPLOYEE_SELF_CONFIDENTIAL_SCORE_FIELDS = OMIT / BLANK; NEVER RECALCULATE
PRODUCTION_XLSX_FORMULA_INVENTORY = EXACTLY ZERO
```

Do not reopen without proven contradictory repository/live evidence.

## 3. Proposed next gate — D2-WP003-R7

```text
PROPOSED_WORK_PACKAGE = D2-WP003-R7
NAME = PART B EXPANDED PRIVACY ADDRESS REMAP 6/7/8
STATE = PROPOSED / NOT AUTHORIZED
MODE = SOURCE+TEST / BOUNDED / TWO EXISTING FILES ONLY
EXPECTED_WRITABLE_FILES =
  scripts/export/mbo-xlsx-ooxml-feasibility.js
  tests/mbo-xlsx-ooxml-feasibility.test.js
ANTIGRAVITY = STOP UNTIL OWNER AUTHORIZATION
CLAUDE = STOP
```

Why R7 comes before production renderer:
- current `PART_B_SENSITIVE_RANGES` and sanitizer/privacy classification are authority only for the original 6-competency source layout;
- accepted structural variants insert complete rows 27:30 blocks;
- for N=7 the first inserted block occupies rows 31:34 and original summary/signature rows shift to 35:38;
- for N=8 inserted blocks occupy 31:34 and 35:38 and original summary/signature rows shift to 39:42;
- using the old fixed 31:34 summary privacy map on expanded workbooks would classify/sanitize the wrong cells.

## 4. R7 exact proposed contract

### A. Preserve source-6 behavior
The exact accepted 6-block privacy mapping remains the baseline and must not be weakened.

Header dynamic addresses remain unchanged.

Original competency rating roles remain:
- self rating columns K:Q over source competency dynamic rows;
- chief rating columns R:X over source competency dynamic rows.

Original summary/signature dynamic roles remain rows 31:34 only for N=6.

### B. Count-aware 6/7/8 mapping
Support only competency counts 6,7,8. All other counts fail closed.

For:
```text
extraBlocks = N - 6
extraRows = 4 * extraBlocks
summaryStart = 31 + extraRows
summaryEnd = 34 + extraRows
```

Required transformed roles:
- header roles stay at the original addresses;
- original competency roles before row 31 stay unchanged;
- each inserted 4-row block inherits source rows 27:30 role semantics exactly;
- source row 30 is not silently promoted to a dynamic rating row if it is not dynamic in the 6-block authority;
- original summary/signature roles relocate exactly by `extraRows`;
- no stale summary role may remain at rows 31:34 for N=7/8;
- no duplicate/overlapping/conflicting dynamic role classification;
- protected static competency text in cloned blocks remains protected and must never be cleared as sensitive dynamic data.

Expected summary ranges:
```text
N=6 => rows 31:34
N=7 => rows 35:38
N=8 => rows 39:42
```

Expected added competency dynamic-row semantics are derived from cloned source rows 27:30, not invented from a blanket rectangular clear.

### C. Real structural-buffer proof
R7 proof must use real outputs from the accepted `getStructuralPartBBuffers()` path for 6/7/8.

Do not duplicate structural insertion logic in tests.

The privacy resolver must fail closed if the observed structural variant does not match the accepted row/style/merge role evidence needed to classify it safely.

### D. Sanitization proof for expanded variants
For N=6/7/8 prove:
- every dynamic sensitive address appropriate to that count is cleared/sanitized;
- protected static competency text remains byte/value-fingerprint stable where applicable;
- shifted summary/signature data is sanitized at its new addresses;
- stale old summary addresses are not treated as summary after insertion;
- sensitive test tokens are absent from worksheet/sharedStrings/package evidence after sanitization;
- typed privacy metadata remains complete and fail-closed for the exact count-aware sensitive-address inventory;
- no employee-bearing source value is logged or committed.

### E. Frozen dependencies
Do not redesign or weaken:
- Preservation / Option B;
- Reference Image;
- Part A structural matrix;
- Part B structural matrix 6/7/8;
- Formula Authority;
- `MboExportService` security/authorization behavior.

### F. Explicitly out of scope for R7
Do not create production renderer yet.
Do not modify `src/services/mbo-export-service.js`.
Do not modify dependencies/package-lock.
Do not create generated XLSX/PDF/image/evidence binaries.
Do not touch Kintone, deploy, ACL, process, Live UAT or D3.

## 5. Remaining D2 after R7

1. R7 expanded Part B privacy remap 6/7/8;
2. production XLSX renderer/sanitizer consuming secured projection + frozen structural/privacy/formula contracts;
3. combined Excel parity;
4. PDF parity;
5. export authorization/security/privacy regression;
6. final independent D2 closure;
7. only then may D3 leave HOLD.

## 6. Fast review procedure

When Owner says `review` after an authorized executor push:
1. fresh-fetch HEAD;
2. read Fast-Start + this file;
3. validate exact authorization token/commit/files;
4. compare authorization→implementation;
5. inspect changed code + directly touched privacy/structural contract only;
6. verify accepted proof was not removed/weakened;
7. check GitHub combined status/workflow runs;
8. no CI/workflow => `INDEPENDENT_RUNTIME_SIGNAL = UNAVAILABLE`;
9. verdict = PASS/CLOSED, CORRECTIVE REQUIRED, or BLOCKED;
10. no auto-start next WP.

## 7. Authorization ledger note

Previous one-shot authorizations remain consumed and must never be reused. The old 20-round standing Control Plane authorization remains exhausted and is not silently extended.

R7 currently has **NO authorization token**.

## 8. Exact next action

```text
NEXT_EXECUTOR = OWNER
NEXT_ACTION = DECIDE WHETHER TO AUTHORIZE D2-WP003-R7 SOURCE+TEST UNDER THE PROPOSED TWO-FILE CONTRACT
ACTIVE_WORK_PACKAGE = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ANTIGRAVITY = STOP
CLAUDE = STOP
KINTONE = NONE
DEPLOY = NONE
D3 = HOLD
```
