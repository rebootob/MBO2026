# AI ACTIVE TASK — D2 REFERENCE-IMAGE R3-R31 REVIEW / R3-R32 TEST-ONLY PROPOSED

Mode: **CONTROL PLANE / LOW-CREDIT / SOURCE FROZEN / TEST-ONLY CORRECTIVE PROPOSED / NO KINTONE / NO DEPLOY**  
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
REFERENCE_IMAGE_SOURCE_REVIEW = PASS / FROZEN
D2-WP003-R3-R31_SCOPE_REVIEW = PASS
D2-WP003-R3-R31_PROOF_REVIEW = FAIL / FAIL-CLOSED INVENTORY COVERAGE INCOMPLETE
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_USED = 10
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_REMAINING = 10
ANTIGRAVITY_AUTO_AUTH = NO
CLAUDE_AUTO_REVIEW = NO
ACTIVE_WORK_PACKAGE = NONE
PROPOSED_WORK_PACKAGE = D2-WP003-R3-R32
PROPOSED_WORK_PACKAGE_NAME = REFERENCE-IMAGE FAIL-CLOSED INVENTORY PROOF CLOSURE
PROPOSED_SCOPE = TEST-ONLY / EXISTING FEASIBILITY TEST FILE ONLY
REFERENCE_IMAGE_SOURCE_BASELINE = CURRENT SOURCE / FROZEN / DO NOT MODIFY
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

## 1. R3-R31 authorization consumed

```text
AUTHORIZATION = D2-WP003-R3-R31-TEST-20260902-01
AUTHORIZATION_COMMIT = 0d208db2a9c874eec5942fd8d76d284453070d16
IMPLEMENTATION_COMMIT = 37325d8279c6e0a19072ca9593a9feda2f9c6174
AUTHORIZATION_STATUS = CONSUMED / CORRECTIVE / DO NOT REUSE
```

Scope review = PASS:
- implementation is exactly one commit after the authorization commit;
- only `tests/mbo-xlsx-ooxml-feasibility.test.js` changed;
- no production source/dependency/evidence/Kintone/deploy/D3 scope changed.

## 2. Accepted R3-R31 progress

R3-R31 added the correct high-level proof shape:
- exact Part A SHA assertion before template-dependent image proof;
- BEFORE/AFTER drawing-anchor inventories;
- BEFORE/AFTER drawing relationship inventories;
- BEFORE/AFTER `xl/media/*` path + SHA-256 inventories;
- exact target cardinality assertions for `rId3` / `image3.png`;
- target-normalized deep equality for anchors, relationships and media;
- existing target absence and `rId1`/`rId2` survival assertions retained.

Reference-image production source remains accepted and frozen.

## 3. R3-R31 proof blockers

### A. Drawing-anchor inventory is not coverage-complete

The new helper matches only literal `xdr:twoCellAnchor` and `xdr:oneCellAnchor`. It can silently omit relevant drawing anchors such as `absoluteAnchor` and markup using another namespace prefix. Because omitted BEFORE/AFTER items never enter the inventory, deep equality can false-pass.

### B. Drawing relationship inventory is not coverage-complete

The new helper matches only literal unprefixed `<Relationship ...>` tags and extracts only double-quoted attributes. Namespace-prefixed Relationship markup, valid alternate quoting, or relevant malformed/unparsed direct children can be silently skipped instead of failing closed.

This violates the R3-R31 proof rule:

```text
NO SILENT DROPPING OF MALFORMED/UNPARSED RELEVANT INVENTORY ENTRIES
```

### C. TargetMode is normalized instead of retained exactly

Missing `TargetMode` is converted to string `Internal`. R3-R31 required exact tuple identity including `TargetMode`; the proof should retain exact raw presence/value rather than inventing an equivalent default.

### D. Target relationship normalization predicate is too broad

The target relationship is normalized out by `(part, Id)` only. The proof must remove the exact expected target tuple only, including exact Type, raw Target and raw TargetMode identity.

## 4. Independent runtime signal

GitHub exposes no combined status checks and no workflow runs for implementation commit `37325d8279c6e0a19072ca9593a9feda2f9c6174`.

Control Plane does not claim independent runtime PASS.

## 5. Proposed D2-WP003-R3-R32 — NOT AUTHORIZED

```text
PROPOSED_WORK_PACKAGE = D2-WP003-R3-R32
PROPOSED_WORK_PACKAGE_NAME = REFERENCE-IMAGE FAIL-CLOSED INVENTORY PROOF CLOSURE
PROPOSED_SCOPE = TEST-ONLY / tests/mbo-xlsx-ooxml-feasibility.test.js
PROPOSED_STATUS = WAIT OWNER AUTHORIZATION
EXECUTOR = NONE
```

No Antigravity or Claude execution is authorized by this proposal.

## 6. Proposed mandatory TEST-ONLY corrective

If explicitly authorized, modify ONLY:
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

Mandatory direction:
1. preserve all accepted R3-R31 full target-normalized equality assertions;
2. make drawing-anchor inventory coverage-complete for all relevant direct anchor forms used by SpreadsheetDrawing, including `twoCellAnchor`, `oneCellAnchor`, and `absoluteAnchor`, independent of namespace prefix;
3. use a coverage/gap validation approach so relevant direct-child anchor markup cannot be silently skipped; unknown/malformed relevant markup must fail the test helper closed;
4. make drawing relationship inventory coverage-complete for direct Relationship children independent of namespace prefix and attribute quote style;
5. require every relationship inventory entry to have parseable exact Id, Type and raw Target; retain raw TargetMode presence/value exactly (`null`/absent remains distinct from an explicit value);
6. do not invent `Internal` for absent TargetMode in the inventory tuple;
7. normalize out the target relationship only when the complete exact expected tuple matches: expected drawing rel part + `rId3` + canonical image Type + raw `../media/image3.png` + exact raw TargetMode identity;
8. normalize out the target anchor only after exact target cardinality/part/embed identity proof;
9. retain media path + SHA-256 inventory exactly as R3-R31;
10. add always-runnable synthetic/adversarial tests inside the existing test file proving that at least these cannot evade inventory extraction:
   - `absoluteAnchor`;
   - alternate/non-`xdr` namespace prefix for a valid anchor;
   - prefixed Relationship element;
   - single-quoted relationship attributes;
   - missing required relationship attribute;
   - TargetMode presence/value drift;
   - unknown/unconsumed relevant direct anchor/relationship markup;
11. do not modify production source to make tests pass;
12. if exact owner template is unavailable, template-dependent equality proof may skip explicitly, but the privacy-safe synthetic/adversarial inventory tests must still run.

## 7. Required execution sequence if authorized

```bash
node --check tests/mbo-xlsx-ooxml-feasibility.test.js
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

Exactly one bounded TEST-ONLY implementation/blocker commit and push, then STOP.

## 8. Frozen / out of scope

Do NOT modify:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js` or any production source;
- preservation source / Option B policy / `getNoOpParityBuffers()`;
- dependencies or generated workbooks/images/PDFs;
- evidence/Kintone/deploy/Live UAT;
- Part A objective insertion;
- Part B competency insertion;
- formula closure;
- renderer/combined export/PDF;
- D3;
- R3-R33 or any next WP.

Claude second review is not needed at this gate.

## 9. Authorization ledger

```text
D2-WP003-R3-R30-TEST-20260902-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP003-R3-R31-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-PRESERVATION-PARTB-SHEETPR-DECISION-01 = OPTION B APPROVED / ARCHITECTURE POLICY
CONTROL-PLANE-D2-REVIEW-CORRECTIVE-20-ROUND-20260901 = ACTIVE / ROUND 10 OF 20
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

## 10. Exact next action

```text
NEXT_EXECUTOR = OWNER
NEXT_ACTION = DECIDE WHETHER TO AUTHORIZE D2-WP003-R3-R32 TEST-ONLY AS PROPOSED
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
D3 = HOLD
```
