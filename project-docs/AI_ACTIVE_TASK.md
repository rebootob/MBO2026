# AI ACTIVE TASK — D2-WP003-R7-R1 SOURCE+TEST AUTHORIZED

Mode: **LOW-CREDIT / BOUNDED / ONE-SHOT / EXACT TWO FILES / NO KINTONE / NO DEPLOY / D3 HOLD**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-02 ICT

Repository truth and accepted newer Live evidence always win. Fresh-fetch current branch HEAD before acting.

## 0. Fast read path

1. `project-docs/D2_REVIEW_FAST_START.md`
2. this file
3. `project-docs/CONFIRMED_BASELINE/D2_PART_B_STRUCTURAL_CLOSURE.md`
4. `project-docs/CONFIRMED_BASELINE/D2_FORMULA_AUTHORITY_CLOSURE.md`
5. exact R7 implementation diff only as needed

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
D2_PART_B_EXPANDED_PRIVACY_GATE = CORRECTIVE REQUIRED / NOT CLOSED
CONTROL_PLANE_REVIEW_CORRECTIVE_STANDING_AUTH = EXHAUSTED / 20 OF 20 / DO NOT REUSE
ANTIGRAVITY_AUTO_AUTH = NO
CLAUDE_AUTO_REVIEW = NO
ACTIVE_WORK_PACKAGE = D2-WP003-R7-R1
ACTIVE_WORK_PACKAGE_NAME = PART B EXPANDED PRIVACY ROLE + FAIL-CLOSED + TOKEN-PURGE CORRECTIVE
TASK_STATE = AUTHORIZED / WAIT ANTIGRAVITY IMPLEMENTATION
OWNER_APPROVAL_BASELINE_HEAD = ff4b830cef3301e15f4571b3abe0c7d1ef7fdfe3
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R7-R1-SOURCE-TEST-20260902-01
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP003-R7-R1-SOURCE-TEST-20260902-01
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
D3_EXECUTION = HOLD UNTIL D2 PASS / CLOSED
ANTIGRAVITY = AUTHORIZED ONLY FOR R7-R1 / ONE-SHOT / LOW-CREDIT
CLAUDE = STOP
```

The prior 20-round standing review/corrective authorization remains exhausted and is NOT renewed by R7-R1. After implementation Antigravity stops. Owner/ChatGPT will explicitly initiate independent review.

## 2. Authorization identity

```text
WORK_PACKAGE = D2-WP003-R7-R1
AUTHORIZATION_TOKEN = D2-WP003-R7-R1-SOURCE-TEST-20260902-01
MODE = SOURCE+TEST / BOUNDED / ONE-SHOT
OWNER_APPROVAL_BASELINE_HEAD = ff4b830cef3301e15f4571b3abe0c7d1ef7fdfe3
EXPECTED_COMMITS = EXACTLY ONE IMPLEMENTATION OR BLOCKER COMMIT AFTER THIS AUTHORIZATION COMMIT
```

Writable files ONLY:
1. `scripts/export/mbo-xlsx-ooxml-feasibility.js`
2. `tests/mbo-xlsx-ooxml-feasibility.test.js`

Any other changed file is out of scope and must block completion.

## 3. R7 review truth / frozen accepted portions

R7 authorization:
`D2-WP003-R7-SOURCE-TEST-20260902-01`

R7 implementation:
`993f3bfcc04bd02b0026a677fa5cb10a12c5d5b6`

```text
R7_SCOPE_REVIEW = PASS
R7_SOURCE_REVIEW = CORRECTIVE REQUIRED
R7_PROOF_CODE_REVIEW = CORRECTIVE REQUIRED
R7_INDEPENDENT_RUNTIME_SIGNAL = UNAVAILABLE / NO GITHUB STATUS OR WORKFLOW RUN
R7_STATUS = CORRECTIVE REQUIRED
D2-WP003-R7-SOURCE-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
```

KEEP/FREEZE from R7:
- exactly two-file scope discipline;
- competency support restricted to N=6,7,8;
- real `getStructuralPartBBuffers()` path;
- summary/signature destinations 31:34 / 35:38 / 39:42 for N=6/7/8;
- count-aware typed metadata API direction;
- source-6 privacy behavior;
- Formula Authority / zero formula inventory;
- all Preservation / Reference Image / Part A / Part B structural proof.

Do NOT redesign Part B structural insertion.

## 4. Exact corrective contract

### A. Exact source-row role mapping — no contiguous-row assumption

Accepted source authority:
```text
SOURCE_DYNAMIC_COMPETENCY_ROWS = 7..29
CLONE_SOURCE_DYNAMIC_ROWS = 27,28,29
CLONE_SOURCE_PADDING_ROW = 30 / NON-DYNAMIC
DYNAMIC_COLUMNS_PER_RATING_ROW = K:X = 14
N=6_DYNAMIC_COUNT = 432
N=7_DYNAMIC_COUNT = 474
N=8_DYNAMIC_COUNT = 516
```

For each inserted block index `b = 0..extraBlocks-1`:
```text
blockStart = 31 + (4 * b)
blockStart+0 maps to source row 27
blockStart+1 maps to source row 28
blockStart+2 maps to source row 29
blockStart+3 maps to source row 30 and MUST be NON-DYNAMIC
```

Requirements:
- original source row 30 remains non-dynamic for every N;
- K:X on every target clone of source row 30 must NOT enter `dynamicAddresses`;
- cloned source rows 27:29 preserve static B:J / dynamic K:X semantics;
- summary/signature rows relocate exactly by `extraRows = 4 * (N-6)`;
- no stale summary role remains inside inserted blocks;
- exact dynamic counts = 432 / 474 / 516;
- dynamic addresses are unique and disjoint from protected static addresses.

Do not solve by introducing another blanket rectangle or second unrelated classification table.

### B. Source-backed structural-role FAIL-CLOSED validation

Before accepting any count-aware role for N=7/8, map observed target evidence to expected source authority:
- original header/competency row => same source row;
- inserted block row => source 27/28/29/30 by exact block offset;
- shifted summary row => source summary 31/32/33/34 after exact `extraRows` normalization.

For evidence needed to classify safely, prove source-relative identity of:
- `styleId`;
- merge identity normalized only for exact row relocation/cloning;
- `normalizedType`;
- `nonblank` state;
- static value hash when protected static source value participates in role authority.

Missing, malformed, mismatched or ambiguous evidence MUST throw exactly the existing blocker family:
`BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED`.

Do not weaken exact owner-template SHA gates or the frozen structural matrix.

### C. Required negative expanded structural-role proof

Using only privacy-safe in-memory/cloned inventories or disposable buffers, prove at minimum:
- changed style on a cloned target role => blocker;
- wrong/missing merge identity on a cloned target role => blocker;
- missing target inventory record => blocker;
- source-row-30 clone presented as dynamic/role-inconsistent => blocker;
- unsupported competency count => blocker.

Do not modify or commit owner template binaries.

### D. Expanded feasibility sanitization + package token-purge proof

R7-R1 may add/extend feasibility-only helper(s) in the authorized source file. This is NOT Production Renderer.

For each N=6,7,8:
1. obtain the real structural buffer from `getStructuralPartBBuffers()`;
2. resolve corrected exact count-aware dynamic addresses;
3. inject privacy-safe synthetic sensitive proof tokens into representative dynamic locations, including for expanded variants at minimum:
   - inserted rating cell for N=7/N=8;
   - shifted summary/signature cell for N=7/N=8;
4. optionally use a distinct static proof token in a protected clone/padding cell only after role authority validation so static survival can be proved without changing the authority evidence;
5. sanitize every exact dynamic address;
6. purge sensitive strings left in sharedStrings/package evidence using the existing accepted disposable-sanitization strategy; clearing worksheet references alone is insufficient;
7. prove every synthetic sensitive token is absent from relevant `xl/*.xml` and `.rels` parts, including `xl/sharedStrings.xml` when present;
8. prove protected static proof token/fingerprint survives where applicable;
9. prove original caller structural buffer bytes are unchanged;
10. prove formula inventory remains exactly zero.

Never log or commit real employee/template values.

### E. Typed privacy metadata proof

For each N=6,7,8:
- metadata address set equals corrected `dynamicAddresses` exactly;
- `uniqueCount` equals 432 / 474 / 516 respectively;
- `totalReconciled === uniqueCount`;
- accepted normalized types only;
- source row30 and every row30 clone are absent from dynamic metadata;
- duplicate/missing/extra/malformed metadata remains fail-closed.

Retain the previously accepted typed-privacy negative regression matrix unless a strictly stronger equivalent replaces it with no coverage loss.

### F. Preserve non-target proof

Do not remove/weaken:
- R5/R5-R1 Part B structural matrix proof;
- Preservation / Option B;
- Reference Image;
- Part A proof;
- Formula Authority / zero-formula proof;
- `Sheet1`, relationship/media, dimensions/merges/Print_Area proof in the shared test file;
- exact source-6 privacy mapping.

If corrective work would require weakening these, STOP and report blocker instead of widening scope.

## 5. Explicitly OUT OF SCOPE

Do NOT:
- create Production XLSX Renderer;
- modify `src/services/mbo-export-service.js`;
- implement or recalculate scoring;
- modify dependencies/package-lock;
- commit generated XLSX/PDF/image/evidence binaries;
- modify Part A source behavior;
- redesign Part B structural insertion;
- touch Kintone records/apps/settings/ACL/process/customization;
- deploy anything;
- perform Live UAT;
- start Combined Excel, PDF, security-regression, D3, or any later WP;
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

If local owner-template binaries are unavailable and template-dependent proof skips, report that truth exactly. Skipped proof is NOT runtime PASS.

## 7. Commit/push contract

After implementation/testing:
- create exactly ONE bounded R7-R1 implementation commit OR exactly ONE blocker commit;
- commit must change only the two authorized files;
- push to `ai/antigravity-wp002c`;
- STOP immediately after push/report;
- do not self-declare PASS/CLOSED;
- do not start Production Renderer or another gate.

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
D2-WP003-R7-SOURCE-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R7-R1-SOURCE-TEST-20260902-01 = ACTIVE / ONE-SHOT / SOURCE+TEST
CONTROL-PLANE-D2-REVIEW-CORRECTIVE-20-ROUND-20260901 = EXHAUSTED / DO NOT REUSE
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R7-R1-SOURCE-TEST-20260902-01
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP003-R7-R1-SOURCE-TEST-20260902-01
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
D3_EXECUTION = HOLD
```

## 9. Exact next action

```text
NEXT_EXECUTOR = ANTIGRAVITY
NEXT_ACTION = EXECUTE ONLY D2-WP003-R7-R1-SOURCE-TEST-20260902-01; CREATE EXACTLY ONE BOUNDED IMPLEMENTATION/BLOCKER COMMIT; PUSH; REPORT; STOP
EXPECTED_CHANGED_FILES = scripts/export/mbo-xlsx-ooxml-feasibility.js + tests/mbo-xlsx-ooxml-feasibility.test.js ONLY
ANTIGRAVITY = AUTHORIZED ONLY FOR R7-R1 / ONE-SHOT
CLAUDE = STOP
CHATGPT = INDEPENDENT REVIEW ONLY AFTER OWNER INITIATES REVIEW
KINTONE = NONE
DEPLOY = NONE
D3 = HOLD
```
