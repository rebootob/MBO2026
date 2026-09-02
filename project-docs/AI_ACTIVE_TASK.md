# AI ACTIVE TASK — D2-WP003-R3-R36 TEST-ONLY AUTHORIZED

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
D2-WP003-R3-R35_SCOPE_REVIEW = PASS
D2-WP003-R3-R35_PROOF_REVIEW = FAIL / PREFIXED EMBED MALFORMED-QNAME FAIL-CLOSED INCOMPLETE
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_USED = 14
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_REMAINING = 6
ANTIGRAVITY_AUTO_AUTH = NO
CLAUDE_AUTO_REVIEW = NO
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R36
ACTIVE_WORK_PACKAGE_NAME = REFERENCE-IMAGE PREFIXED EMBED FAIL-CLOSED CLOSURE
AUTHORIZED_SCOPE = TEST-ONLY / EXISTING FEASIBILITY TEST FILE ONLY
OWNER_APPROVAL_BASELINE_HEAD = 5c902bb1d2f474a09fc4f845fd562507be7ceebf
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP003-R3-R36-TEST-20260902-01
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
REFERENCE_IMAGE_SOURCE_BASELINE = CURRENT SOURCE / FROZEN / DO NOT MODIFY
PRIVACY_PURGE_REQUIRED = NO
D3_EXECUTION = HOLD UNTIL D2 PASS / CLOSED
ANTIGRAVITY = AUTHORIZED ONLY FOR R3-R36 / ONE-SHOT BOUNDED EXECUTION
CLAUDE = STOP / NOT NEEDED
```

## 1. Owner authorization

Owner explicitly authorized:

```text
D2-WP003-R3-R36 TEST-ONLY ตามขอบเขตที่เสนอ
```

Authorization token:

```text
D2-WP003-R3-R36-TEST-20260902-01 = ACTIVE / ONE-SHOT / TEST-ONLY / DO NOT WIDEN / DO NOT REUSE
```

This authorization permits only the bounded TEST-ONLY implementation below. It does not authorize production source changes, evidence publication, Kintone writes, deploys, Live UAT, PDF work, D3, R3-R37, or any next work package.

## 2. R3-R35 accepted progress — freeze / retain

R3-R35 implementation:

```text
2ea39f1d10dca9ba4b830e4207a4abf7cf797644
```

Retain every accepted R3-R35 behavior/proof, including:
- XML 1.0-compatible NameStartChar/NameChar code-point validation;
- NCName validation excluding colon and including allowed supplementary-plane code points;
- Relationship attribute-name validation as one NCName or exactly one-colon QName;
- invalid leading/trailing/multi-colon and leading-digit attribute-name rejection;
- complete restored R3-R33 adversarial matrix;
- complete retained R3-R34 adversarial matrix;
- valid middle-dot, combining-mark and connector-punctuation continuation proof;
- valid unrelated qualified extra-attribute proof;
- exact case-sensitive local names for `wsDr`, anchors, `Relationships`, `Relationship`;
- direct Relationship START-TAG attribute extraction and complete attribute-region consumption;
- duplicate `Id`, `Type`, `Target`, `TargetMode` rejection;
- namespace-qualified required-attribute substitute rejection;
- nested-child substitution rejection;
- exact raw TargetMode identity and absent/Internal/External tuple inequality;
- exact full target relationship tuple binding before normalization;
- exact target anchor part/embed/cardinality binding;
- target-normalized BEFORE/AFTER anchor equality;
- target-normalized BEFORE/AFTER relationship equality;
- media path + SHA-256 equality;
- target absence, `rId1`/`rId2` survival and package-wide orphan safety;
- exact Part A SHA gate for template-dependent proof.

Reference-image production source remains accepted and frozen.

## 3. Exact write scope — ONLY ONE FILE

Modify ONLY:
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

READ-ONLY as needed:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`;
- exact R3-R35 authorization/implementation history;
- package metadata;
- exact ignored Part A owner template only after SHA verification.

Do NOT modify production source, dependencies, governance docs, generated workbook/image/PDF files, evidence, Kintone, deploy configuration, or any other tracked file.

## 4. Mandatory TEST-ONLY corrective

1. Preserve every accepted R3-R35 helper behavior and every R3-R33/R3-R34/R3-R35 adversarial assertion.
2. Do NOT alter the XML NameStartChar/NameChar/NCName/QName logic already accepted in R3-R35.
3. In drawing-anchor inventory, malformed attributes whose intended local name is `embed` must FAIL CLOSED rather than be ignored.
4. Exact unqualified `embed="..."` may retain current accepted handling.
5. Qualified `prefix:embed="..."` may yield a relationship id only when:
   - the full QName contains exactly one colon;
   - the prefix is a valid NCName;
   - local name is exactly case-sensitive `embed`.
6. Malformed candidates must throw `BLOCKER_DRAWING_ANCHOR_PARSING_FAILED`, including at minimum:
   - `1bad:embed="rId3"`;
   - `:embed="rId3"`;
   - `foo::embed="rId3"`;
   - any other invalid prefix/QName form whose local-name intent is `embed`.
7. No malformed prefixed `embed` candidate may be silently converted to `blipRId = null`.
8. Retain and directly prove valid `r:embed="rId3"` extraction returns exact `rId3`.
9. Replace the current malformed-prefixed-embed `blipRId === null` assertion with fail-closed `assert.throws(...)` proof, and add the required invalid QName variants above.
10. Retain exact target anchor part/embed/cardinality proof before normalization.
11. Retain exact complete target relationship tuple normalization and target-normalized deep equality for anchors, relationships and media path/SHA-256 inventory.
12. Retain target absence, `rId1`/`rId2` survival, package-wide orphan safety and exact Part A SHA gate.
13. Synthetic/adversarial tests MUST run even when owner templates are unavailable.
14. If the exact owner template is unavailable, only template-dependent full inventory equality proof may skip explicitly; do not reconstruct, invent, publish or commit the binary.
15. Do not modify production source merely to make tests pass.

Minimum always-runnable proof:
- valid `r:embed="rId3"` => exact `blipRId = rId3`;
- `1bad:embed="rId3"` => blocker throw;
- `:embed="rId3"` => blocker throw;
- `foo::embed="rId3"` => blocker throw;
- all prior R3-R33/R3-R34/R3-R35 adversarial tests remain present and unchanged except the malformed-embed expectation required above.

## 5. Proof quality rules

Required characteristics:
- deterministic stable sorting before deep equality;
- exact case-sensitive local names;
- accepted XML NameStartChar/NameChar/NCName/QName logic remains frozen;
- malformed prefixed `embed` cannot be silently dropped;
- valid prefixed `embed` exact rId extraction retained;
- exact direct-start-tag relationship attributes only;
- exact relationship tuple identity;
- raw relationship `Target` retained;
- raw TargetMode presence/value retained;
- exact target cardinality checks before normalization;
- no count-only/sentinel-only substitute for full inventory equality;
- no removal or weakening of accepted adversarial regression proof;
- any helper changed in the test file must be directly exercised by the same change.

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

Do not start another corrective or work package automatically. Do not self-declare PASS/CLOSED.

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
- R3-R37 or any next WP.

Claude second review is not authorized or needed for this bounded TEST-ONLY change unless ChatGPT later determines material ambiguity remains after repository review.

## 8. Authorization ledger

```text
D2-WP003-R3-R30-TEST-20260902-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP003-R3-R31-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R3-R32-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R3-R33-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R3-R34-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R3-R35-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R3-R36-TEST-20260902-01 = ACTIVE / ONE-SHOT / TEST-ONLY
D2-PRESERVATION-PARTB-SHEETPR-DECISION-01 = OPTION B APPROVED / ARCHITECTURE POLICY
CONTROL-PLANE-D2-REVIEW-CORRECTIVE-20-ROUND-20260901 = ACTIVE / ROUND 14 OF 20
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
NEXT_ACTION = EXECUTE ONLY D2-WP003-R3-R36-TEST-20260902-01
EXPECTED_CHANGED_FILE = tests/mbo-xlsx-ooxml-feasibility.test.js ONLY
EXPECTED_COMMITS = EXACTLY ONE BOUNDED IMPLEMENTATION/BLOCKER COMMIT
ANTIGRAVITY = STOP IMMEDIATELY AFTER PUSH/REPORT
CLAUDE = STOP
CHATGPT = INDEPENDENT REVIEW AFTER IMPLEMENTATION ARRIVES
D3 = HOLD
```
