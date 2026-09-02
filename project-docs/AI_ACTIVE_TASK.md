# AI ACTIVE TASK — D2 REFERENCE-IMAGE R3-R32 REVIEW / R3-R33 TEST-ONLY PROPOSED

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
D2-WP003-R3-R32_SCOPE_REVIEW = PASS
D2-WP003-R3-R32_PROOF_REVIEW = FAIL / XML PARSER FAIL-CLOSED CONTRACT INCOMPLETE
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_USED = 11
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_REMAINING = 9
ANTIGRAVITY_AUTO_AUTH = NO
CLAUDE_AUTO_REVIEW = NO
ACTIVE_WORK_PACKAGE = NONE
PROPOSED_WORK_PACKAGE = D2-WP003-R3-R33
PROPOSED_WORK_PACKAGE_NAME = REFERENCE-IMAGE STRICT XML INVENTORY PARSER CLOSURE
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

## 1. R3-R32 authorization consumed

```text
AUTHORIZATION = D2-WP003-R3-R32-TEST-20260902-01
AUTHORIZATION_COMMIT = e1360a76fad3592ae20fd75ba14dab5422c7c01d
IMPLEMENTATION_COMMIT = dbb0797187cc59047c9864c97fa3514719319a23
AUTHORIZATION_STATUS = CONSUMED / CORRECTIVE / DO NOT REUSE
```

Scope review = PASS:
- implementation is exactly one commit after the authorization commit;
- only `tests/mbo-xlsx-ooxml-feasibility.test.js` changed;
- no production source/dependency/evidence/Kintone/deploy/D3 scope changed.

## 2. Accepted R3-R32 progress

Retain all of this:
- target-normalized BEFORE/AFTER anchor equality;
- target-normalized BEFORE/AFTER drawing relationship equality;
- media path + SHA-256 equality;
- exact Part A SHA gate for template-dependent proof;
- `absoluteAnchor` support;
- alternate-prefix sample support;
- prefixed Relationship + single-quoted attribute support;
- required Relationship attribute rejection;
- absent `TargetMode` retained as `null` instead of invented `Internal`;
- explicit `TargetMode` value retained;
- exact full target relationship tuple binding before normalization;
- exact target anchor part/embed/cardinality binding;
- target absence, `rId1`/`rId2` survival and package-wide orphan safety.

Reference-image production source remains accepted and frozen.

## 3. R3-R32 proof blockers

### A. XML element local names are matched case-insensitively

The helpers use `/i`/`/gi` for `wsDr`, anchor local names, `Relationships` and `Relationship`. XML element/QName matching is case-sensitive. Malformed values such as lowercase `twocellanchor` or `relationship` can therefore be accepted instead of failing closed.

### B. QName prefix grammar is not namespace-prefix independent

The helpers use `\w+` for optional prefixes. Valid XML NCName-style prefixes may contain characters not covered by ASCII `\w`, including hyphen, dot and non-ASCII letters. R3-R32 required inventory behavior independent of namespace prefix; valid alternate prefixes must not be rejected solely because of this regex assumption.

### C. Relationship required attributes are searched across the whole matched element

`Id`, `Type`, `Target` and `TargetMode` are extracted by searching the full matched `<Relationship ...>...</Relationship>` string. A malformed Relationship with missing parent attributes but nested child markup containing `Id`/`Type`/`Target` can satisfy the parser and false-pass. Required attributes must be read from the direct Relationship start tag only.

### D. Adversarial matrix does not yet prove all strictness properties

The current synthetic test covers useful examples but does not independently prove:
- wrong-case local names reject;
- valid hyphen/dot/non-ASCII prefixes behave correctly;
- nested-child attributes cannot satisfy missing Relationship start-tag attributes;
- duplicate required Relationship attributes reject;
- TargetMode absence/presence/value drift is observable as tuple inequality rather than only value extraction.

## 4. Independent runtime signal

GitHub exposes no combined status checks and no workflow runs for implementation commit `dbb0797187cc59047c9864c97fa3514719319a23`.

Control Plane does not claim independent runtime PASS.

## 5. Proposed D2-WP003-R3-R33 — NOT AUTHORIZED

```text
PROPOSED_WORK_PACKAGE = D2-WP003-R3-R33
PROPOSED_WORK_PACKAGE_NAME = REFERENCE-IMAGE STRICT XML INVENTORY PARSER CLOSURE
PROPOSED_SCOPE = TEST-ONLY / tests/mbo-xlsx-ooxml-feasibility.test.js
PROPOSED_STATUS = WAIT OWNER AUTHORIZATION
EXECUTOR = NONE
```

No Antigravity or Claude execution is authorized by this proposal.

## 6. Proposed mandatory TEST-ONLY corrective

If explicitly authorized, modify ONLY:
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

Mandatory direction:
1. preserve all accepted R3-R32 full target-normalized equality and exact tuple behavior;
2. make XML local-name matching case-sensitive; wrong-case `wsDr`, anchor names, `Relationships` and `Relationship` must reject;
3. replace `\w+` prefix assumptions with a coverage-complete QName/NCName-aware direct-tag approach or an equivalent tokenizer that does not reject valid hyphen/dot/non-ASCII namespace prefixes merely because of the prefix characters;
4. preserve namespace-prefix independence without normalizing unknown local names into accepted names;
5. parse Relationship attributes from the direct Relationship START TAG only;
6. require exactly one unqualified `Id`, exactly one unqualified `Type`, exactly one unqualified raw `Target`, and at most one unqualified `TargetMode` on that start tag;
7. reject duplicate required attributes, namespace-qualified substitutes, nested-child substitutes, malformed quoting, or unconsumed direct markup;
8. retain absent TargetMode as `null`, explicit values exactly, and full target tuple normalization exactly as R3-R32;
9. add always-runnable privacy-safe synthetic/adversarial tests proving at minimum:
   - wrong-case anchor local name rejects;
   - wrong-case Relationship local name rejects;
   - hyphenated prefix valid case is handled;
   - dotted prefix valid case is handled;
   - non-ASCII prefix valid case is handled;
   - nested child `Id`/`Type`/`Target` cannot satisfy missing parent start-tag attributes;
   - duplicate `Id`, duplicate `Type`, duplicate `Target`, duplicate `TargetMode` reject;
   - namespace-qualified required attribute substitute rejects;
   - TargetMode absent vs explicit Internal vs External remain distinct tuples and deep inequality is observable;
10. synthetic/adversarial tests must run when owner templates are absent;
11. template-dependent full inventory equality may skip only when exact owner template is unavailable;
12. do not change production source to make tests pass.

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
- R3-R34 or any next WP.

Claude second review is not needed at this gate.

## 9. Authorization ledger

```text
D2-WP003-R3-R30-TEST-20260902-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP003-R3-R31-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R3-R32-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-PRESERVATION-PARTB-SHEETPR-DECISION-01 = OPTION B APPROVED / ARCHITECTURE POLICY
CONTROL-PLANE-D2-REVIEW-CORRECTIVE-20-ROUND-20260901 = ACTIVE / ROUND 11 OF 20
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
NEXT_ACTION = DECIDE WHETHER TO AUTHORIZE D2-WP003-R3-R33 TEST-ONLY AS PROPOSED
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
D3 = HOLD
```
