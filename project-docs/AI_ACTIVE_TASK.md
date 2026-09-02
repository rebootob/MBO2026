# AI ACTIVE TASK — D2 R7-R1 CORRECTIVE / R7-R2 PROPOSED / NO ACTIVE EXECUTOR

Mode: **CONTROL PLANE / PRIVACY FAIL-CLOSED CORRECTIVE / NO KINTONE / NO DEPLOY / D3 HOLD**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-02 ICT

Fresh-fetch current HEAD first. Fast path: `D2_REVIEW_FAST_START.md` -> this file -> directly relevant Baseline -> exact diff.

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
ACTIVE_WORK_PACKAGE = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
D3 = HOLD
```

## 2. R7-R1 independent review
Authorization commit: `273d5ccbbb24d6aaa1b5ae23bab2a0941977d591`  
Implementation commit: `7c1be393bbddaf1f6b439d13229ad256c23517cf`

Authorization -> implementation = exactly one commit and exactly two authorized files.

```text
R7-R1_SCOPE_REVIEW = PASS
R7-R1_ROW30_ROLE_MAPPING = PASS / FROZEN
R7-R1_DYNAMIC_CARDINALITY = PASS / FROZEN (432 / 474 / 516)
R7-R1_STYLE_MERGE_SOURCE_BACKING = PASS / FROZEN
R7-R1_EXPANDED_PACKAGE_TOKEN_PURGE = PASS / FROZEN
R7-R1_ZERO_FORMULA_PROOF = PASS / FROZEN
R7-R1_FAIL_CLOSED_SOURCE_EVIDENCE = CORRECTIVE REQUIRED
R7-R1_INDEPENDENT_RUNTIME_SIGNAL = UNAVAILABLE / NO GITHUB STATUS OR WORKFLOW RUN
R7-R1_STATUS = CORRECTIVE REQUIRED
D2-WP003-R7-R1-SOURCE-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
```

No Claude review is needed; remaining defects are directly provable from source/test.

## 3. Freeze accepted R7-R1 work — DO NOT REDESIGN
Keep exactly:
- support only N=6/7/8;
- real `getStructuralPartBBuffers()` usage;
- source-role row mapping: original rows unchanged, clones 27/28/29 dynamic pattern + row30 padding static, shifted summary normalized by `extraRows`;
- exact dynamic counts N6=432, N7=474, N8=516;
- row30 and clones 34/38 excluded from dynamic inventory;
- source-backed styleId + normalized merge relocation;
- count-aware typed metadata API/cardinality;
- expanded package/sharedStrings synthetic sensitive-token purge proof;
- caller buffer immutability proof;
- formula inventory = 0;
- all Preservation / Reference Image / Part A / Part B Structural / Formula Authority proof.

## 4. Remaining proven defects
### DEFECT A — protected-static authority bypass
Current resolver contains an exception equivalent to:
```text
if ([30,34,38].includes(r) && cStr === 'B') allow valHash/normalizedType drift
```
This weakens source-backed authority. Synthetic static proof data must be injected only AFTER authoritative role validation, not by teaching the resolver to tolerate protected-static drift.

R7-R2 must remove every such production-like source-authority bypass. Source row30 and every clone must remain exact protected-static authority before proof mutation.

### DEFECT B — exact normalizedType/nonblank source evidence not enforced for all pre-mutation structural roles
R7-R1 validates style and merge for all rows, but the authoritative pre-mutation role proof does not directly enforce source-relative `normalizedType` and `nonblank` for dynamic evidence, and does not directly compare `nonblank` even for static evidence.

R7-R2 must separate:
1. authoritative role validation on the untouched real structural buffer; from
2. later disposable proof-token mutation/sanitization.

Before any synthetic mutation, validate each relevant observed target record against its normalized source authority for:
- styleId;
- normalized merge identity;
- normalizedType;
- nonblank;
- protected-static valHash when source static valHash exists.

After that authoritative validation succeeds, synthetic dynamic/static proof mutation may occur on a disposable copy without weakening the resolver.

### DEFECT C — direct negative proof missing
Add direct fail-closed tests proving at minimum:
- dynamic target normalizedType mismatch on untouched structural inventory => `BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED`;
- dynamic target nonblank mismatch => blocker;
- protected row30/clone static valHash mismatch => blocker;
- protected row30/clone normalizedType mismatch => blocker;
- missing/changed style and merge negative tests remain;
- unsupported N remains blocker.

## 5. Proposed corrective — D2-WP003-R7-R2
```text
PROPOSED_WORK_PACKAGE = D2-WP003-R7-R2
NAME = PART B PRIVACY SOURCE-EVIDENCE FAIL-CLOSED FINAL CORRECTIVE
STATE = PROPOSED / NOT AUTHORIZED
MODE = SOURCE+TEST / BOUNDED / ONE-SHOT WHEN AUTHORIZED
EXPECTED_WRITABLE_FILES =
  scripts/export/mbo-xlsx-ooxml-feasibility.js
  tests/mbo-xlsx-ooxml-feasibility.test.js
```

No authorization token exists yet.

## 6. Exact R7-R2 corrective contract
If Owner authorizes:

### SOURCE
1. Remove B30/B34/B38 static hash/type bypasses and any equivalent tolerance.
2. Preserve exact accepted row mapping/counts/style+merge logic.
3. Implement/retain an authoritative pre-mutation resolver/proof path that compares expected source-relative `styleId`, relocated `mergeRef`, `normalizedType`, `nonblank`, and static `valHash` where applicable.
4. Count-aware sanitizer may use a prevalidated role map/dynamic inventory or otherwise avoid rerunning strict source validation after synthetic proof-token injection.
5. Do not add generic tolerance or production renderer behavior.

### TEST
1. Retain all accepted R7-R1 6/7/8 cardinality/row30/token-purge/metadata/formula tests.
2. Prove untouched real structural N6/N7/N8 buffers pass strict source evidence validation before token injection.
3. Add negative inventory mutations for dynamic normalizedType, dynamic nonblank, row30-clone static hash, row30-clone normalizedType; all must fail closed.
4. Only after strict role validation, inject synthetic sensitive/static proof tokens on disposable copies and run existing count-aware sanitization/package scan.
5. No real employee-bearing source values in logs/evidence.

## 7. Explicitly OUT OF SCOPE
Do NOT:
- redesign row mapping/cardinality or Part B structural insertion;
- create Production XLSX Renderer;
- modify `src/services/mbo-export-service.js`;
- recalculate scores;
- modify dependencies/package-lock;
- commit generated XLSX/PDF/image/evidence binaries;
- modify Part A behavior;
- touch Kintone/ACL/process/deploy/Live UAT;
- start Combined Excel/PDF/security regression/D3;
- invoke Claude.

## 8. Required commands if authorized
```bash
node --check scripts/export/mbo-xlsx-ooxml-feasibility.js
node --check tests/mbo-xlsx-ooxml-feasibility.test.js
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```
Report template-dependent skips exactly; skipped proof is not runtime PASS.

## 9. Commit contract if authorized
Exactly one implementation OR blocker commit after authorization commit; exactly the two authorized files; push canonical branch; STOP; no self-PASS/CLOSED; no next gate.

## 10. Authorization ledger / next action
```text
D2-WP003-R7-SOURCE-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R7-R1-SOURCE-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R7-R2 = PROPOSED / NOT AUTHORIZED
CONTROL-PLANE-D2-REVIEW-CORRECTIVE-20-ROUND-20260901 = EXHAUSTED / DO NOT REUSE
NEXT_EXECUTOR = OWNER
NEXT_ACTION = DECIDE WHETHER TO AUTHORIZE D2-WP003-R7-R2 SOURCE+TEST UNDER THIS EXACT TWO-FILE CONTRACT
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
KINTONE = NONE
DEPLOY = NONE
D3 = HOLD
```
