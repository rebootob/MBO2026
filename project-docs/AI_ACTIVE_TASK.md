# AI ACTIVE TASK — D2 REFERENCE-IMAGE REVIEW / R3-R31 TEST-ONLY PROPOSED

Mode: **CONTROL PLANE / LOW-CREDIT / READ-ONLY REVIEW COMPLETE / TEST-ONLY NEXT / NO KINTONE / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-02 ICT

Repository truth and accepted newer Live evidence always win. Fresh-fetch current branch HEAD before acting.

```text
TASK_STATE = WAIT_OWNER_CORRECTIVE_APPROVAL
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
ACTIVE_WORK_PACKAGE = NONE
PROPOSED_WORK_PACKAGE = D2-WP003-R3-R31
PROPOSED_WORK_PACKAGE_NAME = REFERENCE-IMAGE TARGET-NORMALIZED INVENTORY CLOSURE
PROPOSED_SCOPE = TEST-ONLY / EXISTING FEASIBILITY TEST FILE ONLY
REFERENCE_IMAGE_SOURCE_BASELINE = CURRENT HEAD SOURCE / DO NOT MODIFY
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
PRIVACY_PURGE_REQUIRED = NO
D3_EXECUTION = HOLD UNTIL D2 PASS / CLOSED
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP / NOT NEEDED
```

## 1. Control Plane READ-ONLY reference-image review

Current source behavior is useful and retained:
- `getReferenceImageBuffers()` operates on the exact Part A template path already used by the feasibility harness;
- target drawing anchor `rId3` is removed from the drawing XML;
- target relationship `rId3` is removed from the drawing relationship part;
- `xl/media/image3.png` is removed only after scanning all remaining `.rels` parts and failing closed if the media is still referenced;
- caller does not publish the owner binary.

Current test is insufficient for closure. It proves only:
- target `rId3` absent;
- target `image3.png` absent;
- branding `rId1` and `rId2` remain.

## 2. Historical acceptance contract recovered from repository truth

Independent reviews R3-R5 through R3-R9 repeatedly required exact target-normalized BEFORE/AFTER equality for the complete reference-image inventory. The blocker was never merely orphan safety.

Required proof categories:
- complete drawing-anchor inventory;
- complete drawing-relationship inventory;
- complete media filename + content-hash inventory;
- remove only the exact target items from BEFORE;
- require normalized BEFORE == AFTER for every non-target item.

The current spot-check test is the same proof shape that those historical reviews explicitly rejected as insufficient. No later accepted repository proof was found that closes this inventory-equality requirement, and the current test does not contain it.

Therefore:

```text
REFERENCE_IMAGE_SOURCE = ACCEPTED FOR CURRENT CORRECTIVE / DO NOT REDESIGN
REFERENCE_IMAGE_PROOF = INCOMPLETE
REFERENCE_IMAGE_GATE = NOT CLOSED
```

## 3. Proposed D2-WP003-R3-R31 — NOT AUTHORIZED

```text
PROPOSED_WORK_PACKAGE = D2-WP003-R3-R31
PROPOSED_WORK_PACKAGE_NAME = REFERENCE-IMAGE TARGET-NORMALIZED INVENTORY CLOSURE
PROPOSED_SCOPE = TEST-ONLY / tests/mbo-xlsx-ooxml-feasibility.test.js
PROPOSED_STATUS = WAIT OWNER AUTHORIZATION
EXECUTOR = NONE
```

No Antigravity or Claude execution is authorized by this proposal.

## 4. Proposed exact write scope if authorized

Modify ONLY:
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

Read-only as needed:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`;
- exact historical R3-R5 through R3-R9 repository versions;
- package metadata;
- exact ignored Part A owner template only after SHA verification.

No production source change. No new file/dependency/artifact/evidence/Kintone/deploy/PDF/D3 change.

## 5. Proposed mandatory TEST-ONLY proof

If explicitly authorized, R3-R31 MUST preserve all current tests and add exact reference-image closure proof using `origBufA` and `outBufA` from the existing harness:

1. assert exact Part A owner-template identity before template-dependent proof;
2. snapshot complete BEFORE and AFTER drawing-anchor inventories across relevant `xl/drawings/*.xml` parts using stable part/path + anchor identity/hash;
3. snapshot complete BEFORE and AFTER drawing relationship inventories across relevant drawing `.rels` parts using exact `(part, Id, Type, Target, TargetMode)` tuples;
4. snapshot complete BEFORE and AFTER `xl/media/*` inventories using exact media path + SHA-256 content hash;
5. prove the exact target identity exists in BEFORE:
   - exactly one target anchor embedding `rId3` in the expected drawing part;
   - exactly one target relationship `rId3` with image relationship Type and target resolving to `xl/media/image3.png`;
   - exact target media `xl/media/image3.png` exists;
6. normalize ONLY those exact target anchor/relationship/media items out of BEFORE;
7. require exact deep equality:
   - normalized BEFORE anchors == AFTER anchors;
   - normalized BEFORE relationships == AFTER relationships;
   - normalized BEFORE media filename/hash inventory == AFTER media inventory;
8. retain explicit target absence and branding/non-target survival assertions as supplemental proof;
9. do not weaken package-wide orphan safety;
10. do not modify production source merely to make proof pass.

If exact owner template is unavailable, this template-dependent proof may skip explicitly; do not reconstruct or invent the binary.

## 6. Required execution sequence if authorized

```text
node --check tests/mbo-xlsx-ooxml-feasibility.test.js
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

Exactly one bounded TEST-ONLY commit and push, then STOP. Report SHA, changed file, tests, audit and blocker if any.

## 7. Frozen / out of scope

Do NOT modify:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js` or other production source;
- preservation source or Option B policy;
- `getNoOpParityBuffers()`;
- dependencies or generated workbook/image/PDF files;
- evidence/Kintone/deploy/Live UAT;
- Part A objective insertion, Part B competency insertion, formula closure, renderer, combined export, PDF or D3;
- R3-R32 or another work package.

Claude second review is not needed. Use Claude only if a future Git implementation produces material ambiguity that ChatGPT cannot resolve from repository truth.

## 8. Authorization ledger

```text
D2-WP003-R3-R30-TEST-20260902-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-PRESERVATION-PARTB-SHEETPR-DECISION-01 = OPTION B APPROVED / ARCHITECTURE POLICY
CONTROL-PLANE-D2-REVIEW-CORRECTIVE-20-ROUND-20260901 = ACTIVE / ROUND 9 OF 20
ANTIGRAVITY_AUTO_AUTH = NO
CLAUDE_AUTO_REVIEW = NO
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
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
NEXT_EXECUTOR = OWNER
NEXT_ACTION = DECIDE WHETHER TO AUTHORIZE D2-WP003-R3-R31 TEST-ONLY AS PROPOSED
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
D3 = HOLD
```
