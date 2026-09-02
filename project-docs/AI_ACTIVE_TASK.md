# AI ACTIVE TASK — D2 REFERENCE-IMAGE R3-R35 REVIEW / R3-R36 TEST-ONLY PROPOSED

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
D2-WP003-R3-R35_SCOPE_REVIEW = PASS
D2-WP003-R3-R35_PROOF_REVIEW = FAIL / PREFIXED EMBED MALFORMED-QNAME FAIL-CLOSED INCOMPLETE
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_USED = 14
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_REMAINING = 6
ANTIGRAVITY_AUTO_AUTH = NO
CLAUDE_AUTO_REVIEW = NO
ACTIVE_WORK_PACKAGE = NONE
PROPOSED_WORK_PACKAGE = D2-WP003-R3-R36
PROPOSED_WORK_PACKAGE_NAME = REFERENCE-IMAGE PREFIXED EMBED FAIL-CLOSED CLOSURE
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

## 1. R3-R35 authorization consumed

```text
AUTHORIZATION = D2-WP003-R3-R35-TEST-20260902-01
AUTHORIZATION_COMMIT = 3eb083b9d5920f1002ce3bf069d60d87325f0136
IMPLEMENTATION_COMMIT = 2ea39f1d10dca9ba4b830e4207a4abf7cf797644
AUTHORIZATION_STATUS = CONSUMED / CORRECTIVE / DO NOT REUSE
```

Scope review = PASS:
- implementation is exactly one commit after the authorization commit;
- only `tests/mbo-xlsx-ooxml-feasibility.test.js` changed;
- no production source/dependency/evidence/Kintone/deploy/D3 scope changed.

## 2. Accepted R3-R35 progress — freeze / retain

Retain all of this:
- XML 1.0-compatible `NameStartChar` code-point ranges excluding colon for NCName;
- XML 1.0-compatible `NameChar` continuation support including hyphen, dot, digits, U+00B7, U+0300–U+036F and U+203F–U+2040;
- supplementary-plane NameStartChar coverage through U+EFFFF;
- NCName validation by Unicode code point;
- Relationship attribute name validation as one NCName or exactly one-colon QName with valid prefix/local NCNames;
- invalid leading/trailing/multi-colon and leading-digit attribute-name rejection;
- complete restored R3-R33 adversarial matrix;
- complete retained R3-R34 adversarial matrix;
- valid middle-dot, combining-mark and connector-punctuation continuation proof;
- valid unrelated qualified extra attribute proof without satisfying required unqualified attributes;
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

## 3. R3-R35 remaining proof blocker

### Malformed prefixed `embed` QName is ignored rather than fail-closed rejected

Current anchor inventory scans quoted attributes and handles a name ending in `:embed` by extracting the prefix and only using the value if `isValidNCName(prefix)` is true.

For malformed input equivalent to:

```xml
<a:blip 1bad:embed="rId3"/>
```

the helper does **not** throw. It silently ignores the malformed attribute and returns the anchor with `blipRId = null`.

The R3-R35 authorization required:

```text
Malformed QName/prefix must fail closed and must never yield a target rId.
```

The current R3-R35 synthetic test proves only the second half by asserting `blipRId === null`; it does not prove fail-closed rejection.

This violates the explicit no-silent-dropping/fail-closed proof contract. No production source defect is established.

## 4. Independent runtime signal

GitHub exposes no combined status checks and no workflow runs for implementation commit `2ea39f1d10dca9ba4b830e4207a4abf7cf797644`.

Control Plane does not claim independent runtime PASS.

## 5. Proposed D2-WP003-R3-R36 — NOT AUTHORIZED

```text
PROPOSED_WORK_PACKAGE = D2-WP003-R3-R36
PROPOSED_WORK_PACKAGE_NAME = REFERENCE-IMAGE PREFIXED EMBED FAIL-CLOSED CLOSURE
PROPOSED_SCOPE = TEST-ONLY / tests/mbo-xlsx-ooxml-feasibility.test.js
PROPOSED_STATUS = WAIT OWNER AUTHORIZATION
EXECUTOR = NONE
```

No Antigravity or Claude execution is authorized by this proposal.

## 6. Proposed mandatory TEST-ONLY corrective

If explicitly authorized, modify ONLY:
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

Mandatory direction:
1. preserve every accepted R3-R35 helper behavior and every R3-R33/R3-R34/R3-R35 adversarial assertion;
2. do not alter XML NameStartChar/NameChar/NCName/QName logic that passed review;
3. when anchor inventory encounters an attribute whose intended local name is `embed`:
   - unqualified exact `embed` may retain current accepted handling;
   - qualified `prefix:embed` may be used only when the full QName has exactly one colon and the prefix is a valid NCName;
   - malformed candidates such as `1bad:embed`, `:embed`, `foo::embed`, or any invalid prefix/QName form must throw `BLOCKER_DRAWING_ANCHOR_PARSING_FAILED` rather than being ignored;
4. no malformed prefixed `embed` candidate may be silently converted to `blipRId = null`;
5. retain valid `r:embed="rId3"` extraction and exact target-anchor/cardinality proof;
6. change/add always-runnable synthetic proof so malformed prefixed `embed` cases use `assert.throws(...)` and valid prefixed `embed` still yields the exact rId;
7. retain target-normalized BEFORE/AFTER anchor/relationship/media deep equality, target absence, branding survival, orphan-safety and exact owner-template SHA gate;
8. synthetic tests must run without owner templates;
9. template-dependent proof may skip only when exact owner template is unavailable;
10. do not modify production source merely to make tests pass.

Minimum adversarial proof:
- valid `r:embed="rId3"` => exact `blipRId = rId3`;
- `1bad:embed="rId3"` => blocker throw;
- `:embed="rId3"` => blocker throw;
- `foo::embed="rId3"` => blocker throw;
- all prior R3-R33/R3-R34/R3-R35 tests remain present.

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
- R3-R37 or any next WP.

Claude second review is not needed at this gate.

## 9. Authorization ledger

```text
D2-WP003-R3-R30-TEST-20260902-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP003-R3-R31-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R3-R32-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R3-R33-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R3-R34-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R3-R35-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-PRESERVATION-PARTB-SHEETPR-DECISION-01 = OPTION B APPROVED / ARCHITECTURE POLICY
CONTROL-PLANE-D2-REVIEW-CORRECTIVE-20-ROUND-20260901 = ACTIVE / ROUND 14 OF 20
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
NEXT_ACTION = DECIDE WHETHER TO AUTHORIZE D2-WP003-R3-R36 TEST-ONLY AS PROPOSED
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
D3 = HOLD
```
