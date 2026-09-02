# AI ACTIVE TASK — D2-WP003-R7 SOURCE+TEST AUTHORIZED

Mode: **LOW-CREDIT / BOUNDED / ONE-SHOT / EXACT TWO FILES / NO KINTONE / NO DEPLOY / D3 HOLD**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-02 ICT

Repository truth and accepted newer Live evidence always win. Fresh-fetch current branch HEAD before acting.

## 0. Fast read path

1. `project-docs/D2_REVIEW_FAST_START.md`
2. this file
3. `project-docs/CONFIRMED_BASELINE/D2_PART_B_STRUCTURAL_CLOSURE.md`
4. `project-docs/CONFIRMED_BASELINE/D2_FORMULA_AUTHORITY_CLOSURE.md`
5. exact changed source/test files only

Do not re-scan closed gates by default.

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
ACTIVE_WORK_PACKAGE = D2-WP003-R7
ACTIVE_WORK_PACKAGE_NAME = PART B EXPANDED PRIVACY ADDRESS REMAP 6/7/8
TASK_STATE = AUTHORIZED / WAIT ANTIGRAVITY IMPLEMENTATION
OWNER_APPROVAL_BASELINE_HEAD = a76bc4fe6619ba9c1f369b5ed18a70e7837ba816
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R7-SOURCE-TEST-20260902-01
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP003-R7-SOURCE-TEST-20260902-01
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
PRIVACY_PURGE_REQUIRED = NO
D3_EXECUTION = HOLD UNTIL D2 PASS / CLOSED
ANTIGRAVITY = AUTHORIZED ONLY FOR R7 / ONE-SHOT / LOW-CREDIT
CLAUDE = STOP
```

The exhausted prior 20-round standing review/corrective authorization is NOT renewed by R7. After implementation, Antigravity stops. Owner/ChatGPT will explicitly initiate any independent review/corrective action.

## 2. Authorization identity

```text
WORK_PACKAGE = D2-WP003-R7
AUTHORIZATION_TOKEN = D2-WP003-R7-SOURCE-TEST-20260902-01
MODE = SOURCE+TEST / BOUNDED / ONE-SHOT
EXPECTED_COMMITS = EXACTLY ONE IMPLEMENTATION OR BLOCKER COMMIT AFTER THIS AUTHORIZATION COMMIT
```

Writable files ONLY:
1. `scripts/export/mbo-xlsx-ooxml-feasibility.js`
2. `tests/mbo-xlsx-ooxml-feasibility.test.js`

Any other changed file is out of scope and must block completion.

## 3. Frozen dependencies — DO NOT REDESIGN

The following are PASS/CLOSED/FROZEN unless this R7 work produces concrete regression evidence:
- Preservation / Option B;
- Reference Image;
- Part A structural matrix 4..10;
- Part B structural matrix 6/7/8;
- Formula Authority;
- `MboExportService` authorization/projection behavior.

Frozen Part B structural facts:
```text
N=6 => dimension A1:X35 / summary-signature rows 31:34
N=7 => dimension A1:X39 / inserted block rows 31:34 / summary-signature rows 35:38
N=8 => dimension A1:X43 / inserted blocks rows 31:38 / summary-signature rows 39:42
SOURCE_CLONE_BLOCK = rows 27:30
DOWNSTREAM_THRESHOLD = row 31
```

Formula Authority remains:
```text
EXCEL_SCORE_FORMULAS = FORBIDDEN
EXPORT_RENDERER_SCORE_RECALCULATION = FORBIDDEN
PRODUCTION_XLSX_FORMULA_INVENTORY = EXACTLY ZERO
```

## 4. R7 exact implementation contract

### A. Preserve N=6 privacy authority exactly

The accepted source-6 privacy classification/sensitive-address behavior is the baseline.

R7 must not weaken or broaden it.

Header roles remain at their existing addresses.

Existing source competency role semantics remain authoritative, including the distinction between:
- protected static competency text/guidance;
- dynamic self-evaluation rating cells;
- dynamic chief-evaluation rating cells;
- source summary/signature dynamic cells.

Do NOT turn source row 30 or any protected static cell into a dynamic sensitive cell merely because it lies inside a cloned 4-row block.

### B. Count-aware mapping supports ONLY 6, 7, 8

For:
```text
extraBlocks = N - 6
extraRows = 4 * extraBlocks
summaryStart = 31 + extraRows
summaryEnd = 34 + extraRows
```

Required behavior:
- N=6 preserves the exact accepted mapping;
- N=7 relocates original summary/signature roles to rows 35:38;
- N=8 relocates original summary/signature roles to rows 39:42;
- inserted block 1 inherits source rows 27:30 privacy-role semantics at rows 31:34;
- inserted block 2, when N=8, inherits the same source rows 27:30 privacy-role semantics at rows 35:38;
- protected static cells in cloned blocks remain protected/static;
- dynamic rating cells in cloned blocks remain dynamic/sensitive;
- no stale source-summary role may remain at rows 31:34 in N=7/8;
- no stale source-summary role may remain at rows 35:38 in N=8;
- no duplicate address, overlapping conflicting role, or ambiguous classification is allowed;
- unsupported count, missing expected row/merge/style evidence, or role ambiguity must fail closed using the existing privacy blocker family.

Prefer deriving count-aware roles from accepted source-backed role evidence rather than introducing a second independent privacy classification table.

### C. Use REAL structural variants

R7 proof must consume real outputs from accepted:
`getStructuralPartBBuffers()`

for N=6/7/8.

Do NOT duplicate/reimplement Part B row insertion in test code.

Any count-aware privacy resolver/proof helper added in the feasibility source must validate the observed variant against the structural evidence needed to classify safely before clearing/sanitizing values.

### D. Count-aware sanitization proof

R7 may add/extend feasibility-only helper(s) in the authorized source file to prove sanitized 6/7/8 structural variants. This is NOT the Production Renderer.

For every N=6,7,8 prove:
- exact expected dynamic-address inventory for that variant;
- inventory addresses are unique;
- protected static competency text in original and cloned blocks is not part of the dynamic clear set;
- every dynamic sensitive address is cleared/sanitized;
- shifted summary/signature dynamic values are cleared at their new addresses;
- stale old summary addresses are not cleared as summary when they belong to inserted competency blocks;
- privacy-safe synthetic sensitive tokens inserted for proof are absent from relevant worksheet/sharedStrings/package evidence after sanitization;
- static protected proof tokens/fingerprints survive where required;
- caller/source buffers required to remain immutable by frozen preservation rules are not mutated in place.

Do not log or commit real employee-bearing template values.

### E. Typed privacy metadata proof

For every N=6,7,8:
- metadata must describe the exact count-aware dynamic-address inventory;
- address cardinality must equal the exact unique dynamic inventory;
- each metadata record must use only accepted normalized types;
- malformed/missing/extra/duplicate metadata must fail closed;
- metadata for N=6 must remain compatible with the previously accepted source-6 authority;
- metadata must not silently classify protected static clone cells as dynamic.

Retain the previously accepted typed-privacy negative regression matrix unless a directly equivalent stronger proof replaces it without coverage loss.

### F. Preserve non-target invariants

R7 must not remove/weaken accepted proof for:
- Part B row/merge/dimension/Print_Area structural matrix;
- sheet names/order/states;
- `Sheet1` stability;
- relationships/media stability;
- workbook formula inventory exactly zero;
- preservation/reference-image controls directly exercised by the same test file.

If a required edit accidentally weakens prior accepted proof, STOP and report blocker rather than widening scope.

## 5. Explicitly OUT OF SCOPE

Do NOT:
- create Production XLSX renderer;
- modify `src/services/mbo-export-service.js`;
- implement score calculation/recalculation;
- modify dependencies or package-lock;
- publish generated XLSX/PDF/image/evidence binaries;
- modify Part A source behavior;
- redesign Part B structural insertion;
- touch Kintone records/apps/settings/ACL/process/customization;
- deploy anything;
- perform Live UAT;
- start Combined Excel, PDF, security-regression, D3, or any next WP;
- invoke Claude.

## 6. Required commands

Run exactly:

```bash
node --check scripts/export/mbo-xlsx-ooxml-feasibility.js
node --check tests/mbo-xlsx-ooxml-feasibility.test.js
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

If local owner-template binaries are unavailable and template-dependent tests skip, report that truth exactly. Do not claim runtime PASS for skipped template-dependent proof.

## 7. Commit/push contract

After implementation/testing:
- create exactly ONE bounded R7 implementation commit OR exactly ONE blocker commit;
- commit must change only the two authorized files;
- push to `ai/antigravity-wp002c`;
- STOP immediately after push/report;
- do not self-declare PASS/CLOSED;
- do not start the next gate.

Report only:
- commit SHA;
- exact changed files;
- both `node --check` results;
- `node --test` result including skip count if any;
- `npm audit --omit=dev` result;
- `git status --porcelain`;
- blocker, if any.

## 8. Authorization ledger

```text
D2-WP003-R7-SOURCE-TEST-20260902-01 = ACTIVE / ONE-SHOT / SOURCE+TEST
CONTROL-PLANE-D2-REVIEW-CORRECTIVE-20-ROUND-20260901 = EXHAUSTED / 20 OF 20 / DO NOT REUSE
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R7-SOURCE-TEST-20260902-01
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP003-R7-SOURCE-TEST-20260902-01
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
D3_EXECUTION = HOLD
```

## 9. Exact next action

```text
NEXT_EXECUTOR = ANTIGRAVITY
NEXT_ACTION = EXECUTE ONLY D2-WP003-R7-SOURCE-TEST-20260902-01; CREATE EXACTLY ONE BOUNDED IMPLEMENTATION/BLOCKER COMMIT; PUSH; REPORT; STOP
EXPECTED_CHANGED_FILES = scripts/export/mbo-xlsx-ooxml-feasibility.js + tests/mbo-xlsx-ooxml-feasibility.test.js ONLY
ANTIGRAVITY = AUTHORIZED ONLY FOR R7
CLAUDE = STOP
CHATGPT = INDEPENDENT REVIEW ONLY AFTER OWNER INITIATES REVIEW
KINTONE = NONE
DEPLOY = NONE
D3 = HOLD
```