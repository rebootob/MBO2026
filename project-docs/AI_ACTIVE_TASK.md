# AI ACTIVE TASK — D2 REFERENCE-IMAGE R3-R33 REVIEW / R3-R34 TEST-ONLY PROPOSED

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
D2-WP003-R3-R33_SCOPE_REVIEW = PASS
D2-WP003-R3-R33_PROOF_REVIEW = FAIL / NCNAME + ATTRIBUTE COVERAGE FAIL-CLOSED INCOMPLETE
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_USED = 12
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_REMAINING = 8
ANTIGRAVITY_AUTO_AUTH = NO
CLAUDE_AUTO_REVIEW = NO
ACTIVE_WORK_PACKAGE = NONE
PROPOSED_WORK_PACKAGE = D2-WP003-R3-R34
PROPOSED_WORK_PACKAGE_NAME = REFERENCE-IMAGE NCNAME + ATTRIBUTE TOKEN COVERAGE CLOSURE
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

## 1. R3-R33 authorization consumed

```text
AUTHORIZATION = D2-WP003-R3-R33-TEST-20260902-01
AUTHORIZATION_COMMIT = a638ee5e28b66d87768eb44d3cad32801878b9ef
IMPLEMENTATION_COMMIT = adc974704898686efffd7ac121b4b58820581461
AUTHORIZATION_STATUS = CONSUMED / CORRECTIVE / DO NOT REUSE
```

Scope review = PASS:
- implementation is exactly one commit after the authorization commit;
- only `tests/mbo-xlsx-ooxml-feasibility.test.js` changed;
- no production source/dependency/evidence/Kintone/deploy/D3 scope changed.

## 2. Accepted R3-R33 progress

Retain all of this:
- case-sensitive exact local names for `wsDr`, anchors, `Relationships`, `Relationship`;
- target-normalized BEFORE/AFTER anchor equality;
- target-normalized BEFORE/AFTER drawing relationship equality;
- media path + SHA-256 equality;
- exact Part A SHA gate for template-dependent proof;
- direct Relationship START-TAG attribute extraction;
- nested-child attribute substitution rejection;
- duplicate `Id`, `Type`, `Target`, `TargetMode` rejection;
- namespace-qualified required-attribute substitute rejection when the unqualified required attribute is absent;
- absent TargetMode retained as `null`;
- explicit `Internal` / `External` values retained distinctly;
- TargetMode tuple inequality proof;
- exact full target relationship tuple binding before normalization;
- exact target anchor part/embed/cardinality binding;
- target absence, `rId1`/`rId2` survival and package-wide orphan safety;
- positive prefix examples for hyphen, dot and non-ASCII characters.

Reference-image production source remains accepted and frozen.

## 3. R3-R33 proof blockers

### A. Prefix token is broader than XML NCName

Current optional prefix pattern is effectively:

```text
[^\s/>:]+
```

This is not NCName-aware. It accepts XML-invalid prefix tokens such as a prefix beginning with a digit, even though R3-R33 explicitly required QName/NCName-aware handling.

Control Plane independently reproduced acceptance of an invalid prefix such as `1bad:`.

### B. Relationship start-tag attribute region is not coverage-complete

Current attribute extraction finds recognized quoted attributes but does not prove that the entire start-tag attribute region was consumed only by valid quoted attribute tokens.

Therefore malformed or unquoted extra syntax can be silently ignored while valid `Id`, `Type`, and `Target` remain sufficient for acceptance.

Control Plane independently reproduced acceptance of examples equivalent to:
- an unterminated quoted extra attribute;
- an unquoted extra attribute.

This violates the explicit R3-R33 requirement that malformed quoting and unconsumed relevant syntax fail closed.

### C. Adversarial proof does not exercise these remaining failure modes

Current always-runnable tests do not independently prove:
- invalid NCName prefix rejection;
- leading-digit prefix rejection;
- leading-hyphen / leading-dot invalid prefix rejection;
- malformed quoted attribute rejection when required attributes are otherwise present;
- unquoted attribute rejection when required attributes are otherwise present;
- complete attribute-region consumption.

## 4. Independent runtime signal

GitHub exposes no combined status checks and no workflow runs for implementation commit `adc974704898686efffd7ac121b4b58820581461`.

Control Plane does not claim independent runtime PASS.

## 5. Proposed D2-WP003-R3-R34 — NOT AUTHORIZED

```text
PROPOSED_WORK_PACKAGE = D2-WP003-R3-R34
PROPOSED_WORK_PACKAGE_NAME = REFERENCE-IMAGE NCNAME + ATTRIBUTE TOKEN COVERAGE CLOSURE
PROPOSED_SCOPE = TEST-ONLY / tests/mbo-xlsx-ooxml-feasibility.test.js
PROPOSED_STATUS = WAIT OWNER AUTHORIZATION
EXECUTOR = NONE
```

No Antigravity or Claude execution is authorized by this proposal.

## 6. Proposed mandatory TEST-ONLY corrective

If explicitly authorized, modify ONLY:
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

Mandatory direction:
1. preserve all accepted R3-R33 target-normalized equality, case-sensitive local-name behavior, exact target tuple behavior and existing adversarial tests;
2. replace the broad optional-prefix token with a genuinely NCName-aware validator/tokenizer;
3. permit valid prefix examples already required (`ns-1`, `pkg.rel`, non-ASCII letter prefix) but reject invalid NCName forms including at minimum leading digit, leading hyphen and leading dot;
4. do not broaden accepted local names; exact case-sensitive local names remain mandatory;
5. for each direct Relationship start tag, tokenize/validate the COMPLETE attribute region so every non-whitespace character is consumed by a syntactically valid attribute token;
6. permit single- or double-quoted attribute values as already accepted;
7. reject malformed/unterminated quotes, unquoted values, stray tokens, malformed `=` syntax, or any unconsumed attribute-region text;
8. continue requiring exactly one unqualified `Id`, exactly one unqualified `Type`, exactly one unqualified raw `Target`, and at most one unqualified `TargetMode`;
9. retain duplicate required-attribute and namespaced-substitute rejection;
10. retain absent TargetMode as `null`, explicit values exactly, and exact full target tuple normalization;
11. add always-runnable privacy-safe synthetic/adversarial tests proving at minimum:
   - valid hyphenated prefix still passes;
   - valid dotted prefix still passes;
   - valid non-ASCII-letter prefix still passes;
   - leading-digit prefix rejects;
   - leading-hyphen prefix rejects;
   - leading-dot prefix rejects;
   - malformed unterminated quoted attribute rejects even when Id/Type/Target are valid;
   - unquoted extra attribute rejects even when Id/Type/Target are valid;
   - malformed equals/stray attribute-region text rejects;
   - complete valid mixed single/double quoted attributes still parse;
12. synthetic/adversarial tests must run when owner templates are absent;
13. template-dependent full inventory equality may skip only when exact owner template is unavailable;
14. do not change production source to make tests pass.

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
- R3-R35 or any next WP.

Claude second review is not needed at this gate.

## 9. Authorization ledger

```text
D2-WP003-R3-R30-TEST-20260902-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP003-R3-R31-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R3-R32-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R3-R33-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-PRESERVATION-PARTB-SHEETPR-DECISION-01 = OPTION B APPROVED / ARCHITECTURE POLICY
CONTROL-PLANE-D2-REVIEW-CORRECTIVE-20-ROUND-20260901 = ACTIVE / ROUND 12 OF 20
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
NEXT_ACTION = DECIDE WHETHER TO AUTHORIZE D2-WP003-R3-R34 TEST-ONLY AS PROPOSED
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
D3 = HOLD
```
