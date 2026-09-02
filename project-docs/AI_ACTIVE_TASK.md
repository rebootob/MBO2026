# AI ACTIVE TASK — D2-WP003-R3-R31 TEST-ONLY AUTHORIZED

Mode: **CONTROL PLANE / LOW-CREDIT / ONE-SHOT TEST-ONLY EXECUTION / NO SOURCE / NO KINTONE / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-02 ICT

Repository truth and accepted newer Live evidence always win. Fresh-fetch current branch HEAD before acting.

```text
TASK_STATE = AUTHORIZED / WAIT ANTIGRAVITY IMPLEMENTATION
D1_OVERALL = PASS / CLOSED
D2_STATUS = IN PROGRESS
D2_PRESERVATION_GATE = PASS / CLOSED
D2-WP003-R3-R30 = PASS / CLOSED
D2_REFERENCE_IMAGE_GATE = CORRECTIVE REQUIRED / NOT CLOSED
REFERENCE_IMAGE_SOURCE_REVIEW = PASS / ORPHAN-SAFE TARGET REMOVAL RETAINED
REFERENCE_IMAGE_PROOF_REVIEW = FAIL / TARGET-NORMALIZED FULL INVENTORY EQUALITY ABSENT
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_USED = 9
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_REMAINING = 11
ANTIGRAVITY_AUTO_AUTH = NO
CLAUDE_AUTO_REVIEW = NO
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R31
ACTIVE_WORK_PACKAGE_NAME = REFERENCE-IMAGE TARGET-NORMALIZED INVENTORY CLOSURE
AUTHORIZED_SCOPE = TEST-ONLY / EXISTING FEASIBILITY TEST FILE ONLY
OWNER_APPROVAL_BASELINE_HEAD = b1d51964011a3ff1c0ffa20a368fb75c48954f5a
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP003-R3-R31-TEST-20260902-01
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
REFERENCE_IMAGE_SOURCE_BASELINE = CURRENT SOURCE / FROZEN / DO NOT MODIFY
PRIVACY_PURGE_REQUIRED = NO
D3_EXECUTION = HOLD UNTIL D2 PASS / CLOSED
ANTIGRAVITY = AUTHORIZED ONLY FOR R3-R31 / ONE-SHOT BOUNDED EXECUTION
CLAUDE = STOP / NOT NEEDED
```

## 1. Owner authorization

Owner explicitly authorized:

```text
D2-WP003-R3-R31 TEST-ONLY ตามขอบเขตที่เสนอ
```

Authorization token:

```text
D2-WP003-R3-R31-TEST-20260902-01 = ACTIVE / ONE-SHOT / DO NOT WIDEN / DO NOT REUSE
```

This authorization permits only the bounded TEST-ONLY implementation described below. It does not authorize source changes, evidence publication, Kintone writes, deploys, Live UAT, PDF work, D3, R3-R32, or any next work package.

## 2. Frozen source truth

Current production/reference-image source behavior is accepted for this corrective and MUST NOT be redesigned or modified:
- `getReferenceImageBuffers()` operates on the exact Part A template path already used by the feasibility harness;
- target drawing anchor `rId3` is removed from the drawing XML;
- target relationship `rId3` is removed from the drawing relationship part;
- `xl/media/image3.png` is removed only after scanning all remaining `.rels` parts and failing closed if the media is still referenced;
- caller does not publish the owner binary.

Current test is insufficient because it proves only target absence plus `rId1/rId2` survival. Historical independent reviews R3-R5 through R3-R9 repeatedly required target-normalized exact equality of every non-target image-related item.

## 3. Exact write scope — ONLY ONE FILE

Modify ONLY:
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

READ-ONLY as needed:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`;
- exact historical R3-R5 through R3-R9 repository versions;
- package metadata;
- exact ignored Part A owner template only after SHA verification.

Do NOT modify production source, package/dependencies, governance docs, generated workbook/image/PDF files, evidence, application code, Kintone, deploy configuration, or any other file.

## 4. Mandatory TEST-ONLY proof

Preserve all current tests and add exact reference-image closure proof using existing `origBufA` and `outBufA` from the current harness.

Mandatory requirements:

1. Assert exact Part A owner-template identity before template-dependent proof.
2. Snapshot complete BEFORE and AFTER drawing-anchor inventories across relevant `xl/drawings/*.xml` parts using a stable part/path plus stable anchor identity/hash.
3. Snapshot complete BEFORE and AFTER drawing relationship inventories across relevant drawing `.rels` parts using exact tuples:
   - `part`
   - `Id`
   - `Type`
   - raw `Target`
   - `TargetMode`
4. Snapshot complete BEFORE and AFTER `xl/media/*` inventories using exact media path plus SHA-256 content hash.
5. Prove exact target identity exists in BEFORE:
   - exactly one expected target anchor embedding `rId3` in the expected drawing part;
   - exactly one target relationship `rId3` using the canonical image relationship Type and resolving to `xl/media/image3.png`;
   - exact target media `xl/media/image3.png` exists.
6. Normalize ONLY those exact target anchor / relationship / media items out of BEFORE.
7. Require exact deep equality:
   - normalized BEFORE anchors == AFTER anchors;
   - normalized BEFORE relationships == AFTER relationships;
   - normalized BEFORE media filename/hash inventory == AFTER media inventory.
8. Retain explicit target-absence assertions.
9. Retain explicit branding/non-target survival assertions such as `rId1` / `rId2` only as supplemental proof, not as a substitute for full inventory equality.
10. Retain package-wide orphan-safety proof. Do not weaken it.
11. Do not change production source merely to make the new proof pass.
12. If the exact owner template is unavailable, skip the template-dependent proof explicitly; do not reconstruct, invent, publish, or commit the binary.

## 5. Proof quality rules

The implementation must fail closed and must not rely on weak count-only or sentinel-only assertions.

Required characteristics:
- deterministic stable sorting before deep equality;
- exact tuple identity for drawing relationships;
- raw relationship `Target` retained for comparison;
- SHA-256 for media content identity;
- exact target cardinality checks before normalization;
- no silent dropping of malformed/unparsed relevant inventory entries;
- no replacement of full inventory equality with only `rId1/rId2` checks.

If a test helper is added inside the test file, it must be directly exercised by the same test change. Do not create unused proof helpers.

## 6. Required execution sequence

Run exactly:

```bash
node --check tests/mbo-xlsx-ooxml-feasibility.test.js
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

Then:
- create exactly one bounded TEST-ONLY implementation or blocker commit;
- push to `ai/antigravity-wp002c`;
- STOP;
- report commit SHA, changed file, test result, audit result, `git status --porcelain`, and any blocker.

Do not start another corrective or work package automatically.

## 7. Frozen / out of scope

Do NOT modify:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js` or any production source;
- preservation source or Option B policy;
- `getNoOpParityBuffers()`;
- dependencies;
- generated workbook/image/PDF files;
- privacy evidence or employee-bearing binaries;
- Kintone/App53/App794/App795/App801;
- ACL/process configuration;
- customization deploy;
- Live UAT / rollback;
- Part A objective insertion closure;
- Part B competency insertion closure;
- formula/no-formula closure;
- production renderer/sanitizer;
- combined Excel;
- PDF;
- D3;
- R3-R32 or any next WP.

Claude second review is not authorized or needed for this bounded TEST-ONLY change unless ChatGPT later determines material ambiguity remains after repository review.

## 8. Authorization ledger

```text
D2-WP003-R3-R30-TEST-20260902-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP003-R3-R31-TEST-20260902-01 = ACTIVE / ONE-SHOT / TEST-ONLY
D2-PRESERVATION-PARTB-SHEETPR-DECISION-01 = OPTION B APPROVED / ARCHITECTURE POLICY
CONTROL-PLANE-D2-REVIEW-CORRECTIVE-20-ROUND-20260901 = ACTIVE / ROUND 9 OF 20
ANTIGRAVITY_AUTO_AUTH = NO
CLAUDE_AUTO_REVIEW = NO
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_APP794_DEPLOY_AUTH = NONE
LIVE_UAT = NO
ROLLBACK = NO
D3_EXECUTION = HOLD
```

## 9. Exact next action

```text
NEXT_EXECUTOR = ANTIGRAVITY
NEXT_ACTION = EXECUTE ONLY D2-WP003-R3-R31-TEST-20260902-01
EXPECTED_CHANGED_FILE = tests/mbo-xlsx-ooxml-feasibility.test.js ONLY
EXPECTED_COMMITS = EXACTLY ONE BOUNDED IMPLEMENTATION/BLOCKER COMMIT
ANTIGRAVITY = STOP IMMEDIATELY AFTER PUSH/REPORT
CLAUDE = STOP
CHATGPT = INDEPENDENT REVIEW AFTER IMPLEMENTATION ARRIVES
D3 = HOLD
```
