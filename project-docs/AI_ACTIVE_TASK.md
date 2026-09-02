# AI ACTIVE TASK — D2-WP003-R7-R3 TEST-ONLY AUTHORIZED

Mode: **LOW-CREDIT / BOUNDED / ONE-SHOT / EXACT ONE TEST FILE / NO SOURCE CHANGE / NO KINTONE / NO DEPLOY / D3 HOLD**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-02 ICT

Fresh-fetch current HEAD first. Fast path: `D2_REVIEW_FAST_START.md` -> this file -> exact test diff only.

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
D2_PART_B_EXPANDED_PRIVACY = CORRECTIVE REQUIRED / NOT CLOSED
CONTROL_PLANE_REVIEW_CORRECTIVE_STANDING_AUTH = EXHAUSTED / DO NOT REUSE
ANTIGRAVITY_AUTO_AUTH = NO
CLAUDE_AUTO_REVIEW = NO
ACTIVE_WORK_PACKAGE = D2-WP003-R7-R3
ACTIVE_WORK_PACKAGE_NAME = PART B ROW30 STATIC EVIDENCE DIRECT NEGATIVE PROOF CLOSURE
TASK_STATE = AUTHORIZED / WAIT ANTIGRAVITY IMPLEMENTATION
OWNER_APPROVAL_BASELINE_HEAD = 93f373c6321f94cc45700e15506769583eb48b21
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP003-R7-R3-TEST-20260902-01
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = AUTHORIZED ONLY FOR R7-R3 / ONE-SHOT / LOW-CREDIT
CLAUDE = STOP
D3 = HOLD
```

This Owner authorization is execution-only for exactly one TEST-ONLY implementation/blocker commit. Independent review begins only when Owner says `review`.

## 2. Authorization identity
```text
WORK_PACKAGE = D2-WP003-R7-R3
AUTHORIZATION_TOKEN = D2-WP003-R7-R3-TEST-20260902-01
MODE = TEST-ONLY / BOUNDED / ONE-SHOT
OWNER_APPROVAL_BASELINE_HEAD = 93f373c6321f94cc45700e15506769583eb48b21
EXPECTED_COMMITS = EXACTLY ONE IMPLEMENTATION OR BLOCKER COMMIT AFTER THIS AUTHORIZATION COMMIT
```

Writable file ONLY:
`tests/mbo-xlsx-ooxml-feasibility.test.js`

Source changes are FORBIDDEN. Any other changed file is out of scope and must block completion.

## 3. Frozen accepted authority — DO NOT REDESIGN
R7-R2 implementation: `6975b1f076b9b3f4baa3b6cb4ca844767f513f0a`

```text
R7-R2_SOURCE_REVIEW = PASS / FROZEN
STATIC_AUTHORITY_BYPASS_REMOVAL = PASS / FROZEN
STRICT_PREMUTATION_STYLE_MERGE_TYPE_NONBLANK = PASS / FROZEN
PROTECTED_STATIC_VALHASH_ENFORCEMENT = PASS / FROZEN WHERE SOURCE HAS VALHASH
VALIDATION_VS_SYNTHETIC_MUTATION_SEPARATION = PASS / FROZEN
ROW_MAPPING_AND_CARDINALITY = PASS / FROZEN 432/474/516
EXPANDED_PACKAGE_TOKEN_PURGE = PASS / FROZEN
CALLER_BUFFER_IMMUTABILITY = PASS / FROZEN
ZERO_FORMULA = PASS / FROZEN
```

Do NOT modify `scripts/export/mbo-xlsx-ooxml-feasibility.js` or weaken/remove any accepted test.

## 4. Exact R7-R3 TEST-ONLY contract
Use privacy-safe in-memory inventories from the REAL N=7 structural buffer.

### A. row30-clone normalizedType ONLY
- fresh pristine inventory;
- target `B34` (N=7 clone of source row30);
- mutate ONLY `normalizedType` to a deterministic different accepted normalized type;
- do NOT mutate `nonblank`, `valHash`, `styleId`, or `mergeRef`;
- `resolvePartBPrivacyRoles(..., 7)` must throw exactly `BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED`.

### B. row30-clone nonblank ONLY
- fresh pristine inventory;
- target `B34`;
- mutate ONLY `nonblank` to the opposite boolean;
- all other evidence unchanged;
- must throw exactly `BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED`.

### C. row30/clone static valHash applicability + direct proof
- inspect pristine protected source-row30 evidence, not an unrelated row;
- if any exact protected source-row30 record has a non-empty `valHash`, map that source cell to its N=7 row30-clone target and mutate ONLY target `valHash`; all other evidence unchanged; require exact blocker;
- if NO protected source-row30 record has a non-empty source `valHash`, assert that exact fact in the test and retain the accepted existing `B7` single-field static-valHash negative test as generic mechanism proof;
- do NOT fabricate fake source-row30 valHash authority.

### D. Preserve all existing proof
Do not remove/weaken existing positive/negative tests, including dynamic type/nonblank, changed style, merge, missing-record, unsupported count, 432/474/516 cardinality, row30/34/38 non-dynamic semantics, typed metadata, expanded token purge, immutable caller buffer, and formula=0.

## 5. Explicitly OUT OF SCOPE
Do NOT:
- modify `scripts/export/mbo-xlsx-ooxml-feasibility.js`;
- create Production XLSX Renderer;
- modify `src/services/mbo-export-service.js`;
- change scoring;
- modify dependencies/package-lock;
- commit generated XLSX/PDF/image/evidence binaries;
- touch Part A behavior;
- touch Kintone/ACL/process/deploy/Live UAT;
- start Combined Excel/PDF/security regression/D3;
- invoke Claude.

## 6. Required commands
Run exactly:
```bash
node --check tests/mbo-xlsx-ooxml-feasibility.test.js
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

If local owner-template binaries are unavailable and template-dependent tests skip, report the skip truth exactly. Skipped proof is not runtime PASS.

## 7. Commit/push contract
After testing:
- create exactly ONE bounded R7-R3 TEST-ONLY implementation commit OR exactly ONE blocker commit;
- commit must change only `tests/mbo-xlsx-ooxml-feasibility.test.js`;
- push to `ai/antigravity-wp002c`;
- STOP immediately after push/report;
- do not self-declare PASS/CLOSED;
- do not start the next gate.

Report only:
- commit SHA;
- exact changed file;
- `node --check` result;
- `node --test` result including skip count if any;
- `npm audit --omit=dev` result;
- `git status --porcelain`;
- blocker, if any.

## 8. Authorization ledger
```text
D2-WP003-R7-SOURCE-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R7-R1-SOURCE-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R7-R2-SOURCE-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R7-R3-TEST-20260902-01 = ACTIVE / ONE-SHOT / TEST-ONLY
CONTROL-PLANE-D2-REVIEW-CORRECTIVE-20-ROUND-20260901 = EXHAUSTED / DO NOT REUSE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP003-R7-R3-TEST-20260902-01
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
D3 = HOLD
```

## 9. Exact next action
```text
NEXT_EXECUTOR = ANTIGRAVITY
NEXT_ACTION = EXECUTE ONLY D2-WP003-R7-R3-TEST-20260902-01; CREATE EXACTLY ONE TEST-ONLY IMPLEMENTATION/BLOCKER COMMIT; PUSH; REPORT; STOP
EXPECTED_CHANGED_FILE = tests/mbo-xlsx-ooxml-feasibility.test.js ONLY
SOURCE_CHANGES = FORBIDDEN
ANTIGRAVITY = AUTHORIZED ONLY FOR R7-R3
CLAUDE = STOP
CHATGPT = INDEPENDENT REVIEW ONLY AFTER OWNER INITIATES `review`
KINTONE = NONE
DEPLOY = NONE
D3 = HOLD
```
