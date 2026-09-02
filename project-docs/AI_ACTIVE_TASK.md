# AI ACTIVE TASK — D2-WP003-R3-R32 TEST-ONLY AUTHORIZED

Mode: **CONTROL PLANE / LOW-CREDIT / ONE-SHOT TEST-ONLY EXECUTION / SOURCE FROZEN / NO KINTONE / NO DEPLOY**  
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
REFERENCE_IMAGE_SOURCE_REVIEW = PASS / FROZEN
D2-WP003-R3-R31_SCOPE_REVIEW = PASS
D2-WP003-R3-R31_PROOF_REVIEW = FAIL / FAIL-CLOSED INVENTORY COVERAGE INCOMPLETE
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_USED = 10
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_REMAINING = 10
ANTIGRAVITY_AUTO_AUTH = NO
CLAUDE_AUTO_REVIEW = NO
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R32
ACTIVE_WORK_PACKAGE_NAME = REFERENCE-IMAGE FAIL-CLOSED INVENTORY PROOF CLOSURE
AUTHORIZED_SCOPE = TEST-ONLY / EXISTING FEASIBILITY TEST FILE ONLY
OWNER_APPROVAL_BASELINE_HEAD = d6afdf8ef9d241253ce4f97e346d9e87e9cf8442
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP003-R3-R32-TEST-20260902-01
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
REFERENCE_IMAGE_SOURCE_BASELINE = CURRENT SOURCE / FROZEN / DO NOT MODIFY
PRIVACY_PURGE_REQUIRED = NO
D3_EXECUTION = HOLD UNTIL D2 PASS / CLOSED
ANTIGRAVITY = AUTHORIZED ONLY FOR R3-R32 / ONE-SHOT BOUNDED EXECUTION
CLAUDE = STOP / NOT NEEDED
```

## 1. Owner authorization

Owner explicitly authorized:

```text
D2-WP003-R3-R32 TEST-ONLY ตามขอบเขตที่เสนอ
```

Authorization token:

```text
D2-WP003-R3-R32-TEST-20260902-01 = ACTIVE / ONE-SHOT / TEST-ONLY / DO NOT WIDEN / DO NOT REUSE
```

This authorization permits only the bounded TEST-ONLY implementation described below. It does not authorize production source changes, evidence publication, Kintone writes, deploys, Live UAT, PDF work, D3, R3-R33, or any next work package.

## 2. R3-R31 accepted progress and remaining blockers

R3-R31 implementation:

```text
37325d8279c6e0a19072ca9593a9feda2f9c6174
```

Accepted progress:
- exact Part A SHA assertion before template-dependent image proof;
- BEFORE/AFTER drawing-anchor inventories;
- BEFORE/AFTER drawing relationship inventories;
- BEFORE/AFTER `xl/media/*` path + SHA-256 inventories;
- exact target cardinality assertions for `rId3` / `image3.png`;
- target-normalized deep equality for anchors, relationships and media;
- existing target absence and `rId1`/`rId2` survival assertions retained.

Production/reference-image source remains accepted and frozen.

Remaining proof blockers:
1. anchor inventory recognizes only literal `xdr:twoCellAnchor` / `xdr:oneCellAnchor` and can silently omit `absoluteAnchor` or alternate namespace prefixes;
2. relationship inventory recognizes only literal unprefixed `<Relationship ...>` and double-quoted attributes, so relevant variants can be silently skipped;
3. absent `TargetMode` is normalized to `Internal` instead of retaining exact raw presence/value;
4. target relationship normalization filters by `(part, Id)` instead of the full exact tuple.

## 3. Exact write scope — ONLY ONE FILE

Modify ONLY:
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

READ-ONLY as needed:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`;
- exact R3-R31 authorization / implementation history;
- package metadata;
- exact ignored Part A owner template only after SHA verification.

Do NOT modify production source, package/dependencies, governance docs, generated workbook/image/PDF files, evidence, application code, Kintone, deploy configuration, or any other tracked file.

## 4. Mandatory TEST-ONLY corrective

Preserve all accepted R3-R31 target-normalized full-inventory equality assertions and make the proof extraction fail-closed.

Mandatory requirements:

1. Drawing-anchor inventory must cover all relevant direct SpreadsheetDrawing anchor forms used by the contract:
   - `twoCellAnchor`
   - `oneCellAnchor`
   - `absoluteAnchor`
   independent of namespace prefix.

2. Use coverage/gap validation so relevant direct-child anchor markup cannot be silently skipped. Unknown or malformed relevant direct-child markup must fail the helper closed.

3. Drawing relationship inventory must cover direct Relationship children independent of namespace prefix and attribute quote style.

4. Every relationship entry must have parseable exact:
   - `Id`
   - `Type`
   - raw `Target`

5. Retain raw `TargetMode` presence/value exactly. Missing remains `null`/absent and is distinct from an explicit value. Do NOT invent `Internal` for an absent attribute.

6. Normalize out the target relationship ONLY when the complete exact expected tuple matches:
   - expected drawing relationship part;
   - `Id = rId3`;
   - canonical image relationship Type;
   - raw `Target = ../media/image3.png`;
   - exact raw TargetMode identity.

7. Normalize out the target anchor only after exact target cardinality + expected part + exact embed identity are proved.

8. Retain media path + SHA-256 inventory exactly as accepted in R3-R31.

9. Retain exact target-normalized deep equality for:
   - anchors;
   - drawing relationship tuples;
   - media path/hash inventory.

10. Retain explicit target-absence assertions and `rId1`/`rId2` survival assertions as supplemental proof.

11. Retain package-wide orphan-safety proof. Do not weaken it.

12. Add always-runnable privacy-safe synthetic/adversarial tests inside the SAME existing test file proving these cannot evade inventory extraction:
   - `absoluteAnchor`;
   - valid anchor with alternate/non-`xdr` namespace prefix;
   - prefixed Relationship element;
   - single-quoted relationship attributes;
   - missing required relationship attribute;
   - TargetMode presence/value drift;
   - unknown/unconsumed relevant direct anchor markup;
   - unknown/unconsumed relevant direct relationship markup.

13. Synthetic/adversarial helpers/tests must run even if exact owner templates are unavailable.

14. If exact owner template is unavailable, template-dependent inventory equality proof may skip explicitly; do not reconstruct, invent, publish, or commit the binary.

15. Do not modify production source merely to make tests pass.

## 5. Proof quality rules

Required characteristics:
- deterministic stable sorting before deep equality;
- coverage-complete direct-child inventory or explicit fail-closed gap detection;
- exact relationship tuple identity;
- raw relationship `Target` retained;
- raw TargetMode presence/value retained;
- exact target cardinality checks before normalization;
- no count-only or sentinel-only substitute for full inventory equality;
- no silent dropping of malformed/unparsed relevant inventory entries;
- any helper added in the test file must be directly exercised by the same change.

## 6. Required execution sequence

Run exactly:

```bash
node --check tests/mbo-xlsx-ooxml-feasibility.test.js
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

Then:
- create exactly ONE bounded TEST-ONLY implementation or blocker commit;
- push to `ai/antigravity-wp002c`;
- STOP immediately;
- report commit SHA, changed file, node check result, test result, npm audit result, `git status --porcelain`, and blocker if any.

Do not start another corrective or work package automatically.

## 7. Frozen / out of scope

Do NOT modify:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js` or any production source;
- preservation source / Option B policy / `getNoOpParityBuffers()`;
- dependencies;
- generated workbooks/images/PDFs;
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
- R3-R33 or any next WP.

Claude second review is not authorized or needed for this bounded TEST-ONLY change unless ChatGPT later determines material ambiguity remains after repository review.

## 8. Authorization ledger

```text
D2-WP003-R3-R30-TEST-20260902-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP003-R3-R31-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R3-R32-TEST-20260902-01 = ACTIVE / ONE-SHOT / TEST-ONLY
D2-PRESERVATION-PARTB-SHEETPR-DECISION-01 = OPTION B APPROVED / ARCHITECTURE POLICY
CONTROL-PLANE-D2-REVIEW-CORRECTIVE-20-ROUND-20260901 = ACTIVE / ROUND 10 OF 20
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
NEXT_ACTION = EXECUTE ONLY D2-WP003-R3-R32-TEST-20260902-01
EXPECTED_CHANGED_FILE = tests/mbo-xlsx-ooxml-feasibility.test.js ONLY
EXPECTED_COMMITS = EXACTLY ONE BOUNDED IMPLEMENTATION/BLOCKER COMMIT
ANTIGRAVITY = STOP IMMEDIATELY AFTER PUSH/REPORT
CLAUDE = STOP
CHATGPT = INDEPENDENT REVIEW AFTER IMPLEMENTATION ARRIVES
D3 = HOLD
```
