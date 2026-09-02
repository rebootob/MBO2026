# AI ACTIVE TASK — D2 REFERENCE-IMAGE R3-R34 REVIEW / R3-R35 TEST-ONLY PROPOSED

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
D2-WP003-R3-R34_SCOPE_REVIEW = PASS
D2-WP003-R3-R34_PROOF_REVIEW = FAIL / XML NCNAME-QNAME + REGRESSION RETENTION INCOMPLETE
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_USED = 13
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_REMAINING = 7
ANTIGRAVITY_AUTO_AUTH = NO
CLAUDE_AUTO_REVIEW = NO
ACTIVE_WORK_PACKAGE = NONE
PROPOSED_WORK_PACKAGE = D2-WP003-R3-R35
PROPOSED_WORK_PACKAGE_NAME = REFERENCE-IMAGE XML NAME/QNAME + REGRESSION RETENTION CLOSURE
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

## 1. R3-R34 authorization consumed

```text
AUTHORIZATION = D2-WP003-R3-R34-TEST-20260902-01
AUTHORIZATION_COMMIT = 29837a5b84ad7b3397ec256a0bcf193f80d67b7e
IMPLEMENTATION_COMMIT = f2bace7e97080dd89e44ceb045ba7e5b7e4aaeec
AUTHORIZATION_STATUS = CONSUMED / CORRECTIVE / DO NOT REUSE
```

Scope review = PASS:
- implementation is exactly one commit after the authorization commit;
- only `tests/mbo-xlsx-ooxml-feasibility.test.js` changed;
- no production source/dependency/evidence/Kintone/deploy/D3 scope changed.

## 2. Accepted R3-R34 progress

Retain all of this:
- case-sensitive exact local names for `wsDr`, anchors, `Relationships`, `Relationship`;
- target-normalized BEFORE/AFTER anchor equality;
- target-normalized BEFORE/AFTER drawing relationship equality;
- media path + SHA-256 equality;
- exact Part A SHA gate for template-dependent proof;
- direct Relationship START-TAG attribute extraction;
- complete scanning that now rejects the specifically targeted unterminated quote, unquoted value, malformed equals and stray attribute-region syntax;
- leading-digit, leading-hyphen and leading-dot element-prefix negatives;
- valid `ns-1`, `pkg.rel` and non-ASCII-letter prefix positives;
- mixed single/double quoted valid Relationship attributes;
- exact full target relationship tuple binding before normalization;
- exact target anchor part/embed/cardinality binding;
- target absence, `rId1`/`rId2` survival and package-wide orphan safety.

Reference-image production source remains accepted and frozen.

## 3. R3-R34 proof blockers

### A. `isValidNCName()` is still an approximation, not XML NCName-complete

Current validator hard-codes broad BMP ranges. It rejects XML-valid NameChar forms such as middle-dot and combining-mark continuation characters and does not model the XML NameStartChar/NameChar ranges exactly, including supplementary-plane NameStartChar.

Control Plane independently reproduced examples where valid NCNames equivalent to `a·b` and `a` + combining acute are rejected.

### B. Relationship attribute names are not validated as XML Name/QName tokens

The current attribute-name matcher accepts characters from a broad class including digits and colon without validating QName structure. Therefore XML-invalid attribute names such as leading-digit names, leading-colon names, trailing-colon names or multi-colon names can be accepted as syntactically valid extra attributes while `Id`, `Type` and `Target` remain valid.

Control Plane independently reproduced acceptance of examples equivalent to:
- `1bad="x"`;
- `:bad="x"`;
- `foo::bar="x"`.

This contradicts the R3-R34 rule that the entire attribute region must consist only of syntactically valid attribute tokens.

### C. Accepted R3-R33 adversarial proof was removed

R3-R34 replaced the existing parser adversarial test body and removed explicit accepted assertions that R3-R34 was required to preserve, including:
- wrong-case anchor local-name rejection;
- wrong-case Relationship local-name rejection;
- nested-child `Id`/`Type`/`Target` substitution rejection;
- duplicate `Id`, `Type`, `Target`, `TargetMode` rejection;
- namespaced required-attribute substitute rejection;
- TargetMode absent/Internal/External tuple inequality proof.

Behavior may still exist in helpers, but the accepted regression proof itself was removed, so the gate cannot be closed.

### D. Additional prefix-bearing embed proof remains incomplete

If the anchor inventory extracts a prefixed `embed` attribute, that QName prefix must not bypass the same NCName validity rules. A malformed prefix on the embed QName must fail closed rather than still yielding the target rId.

## 4. Independent runtime signal

GitHub exposes no combined status checks and no workflow runs for implementation commit `f2bace7e97080dd89e44ceb045ba7e5b7e4aaeec`.

Control Plane does not claim independent runtime PASS.

## 5. Proposed D2-WP003-R3-R35 — NOT AUTHORIZED

```text
PROPOSED_WORK_PACKAGE = D2-WP003-R3-R35
PROPOSED_WORK_PACKAGE_NAME = REFERENCE-IMAGE XML NAME/QNAME + REGRESSION RETENTION CLOSURE
PROPOSED_SCOPE = TEST-ONLY / tests/mbo-xlsx-ooxml-feasibility.test.js
PROPOSED_STATUS = WAIT OWNER AUTHORIZATION
EXECUTOR = NONE
```

No Antigravity or Claude execution is authorized by this proposal.

## 6. Proposed mandatory TEST-ONLY corrective

If explicitly authorized, modify ONLY:
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

Mandatory direction:
1. preserve every accepted R3-R34 test and helper behavior;
2. restore all accepted R3-R33 adversarial assertions listed in section 3C; do not replace one negative matrix with another;
3. implement XML 1.0-compatible NCName validation based on actual NameStartChar/NameChar code-point ranges rather than a rough broad-character class;
4. NCName must exclude colon and validate all code points, including supplementary-plane code points where allowed;
5. prove valid continuation examples such as middle-dot, combining mark and connector punctuation are accepted when XML-valid;
6. preserve the already accepted valid `ns-1`, `pkg.rel`, and non-ASCII-letter prefix examples and invalid leading-digit/hyphen/dot examples;
7. validate each Relationship attribute name as a syntactically valid XML name form before accepting the token:
   - unqualified attribute name = one valid NCName;
   - qualified attribute name = exactly one colon separating valid prefix NCName and valid local NCName;
   - reject leading colon, trailing colon, multiple colons, leading-digit local/name, or other invalid Name/QName forms;
8. continue requiring exactly one UNQUALIFIED `Id`, exactly one UNQUALIFIED `Type`, exactly one UNQUALIFIED raw `Target`, and at most one UNQUALIFIED `TargetMode`;
9. retain namespaced required-attribute substitute rejection, duplicate required-attribute rejection, nested-child substitution rejection and exact TargetMode identity;
10. retain complete Relationship attribute-region consumption from R3-R34, including malformed quote/unquoted/malformed equals/stray text negatives;
11. if a prefixed `embed` QName is observed by anchor inventory extraction, validate that prefix with the same NCName rules before using its value; malformed QName prefix must fail closed;
12. retain exact complete target relationship tuple normalization, exact target anchor part/embed/cardinality binding, full anchor/relationship/media deep equality, target absence, branding survival and orphan-safety proof;
13. add always-runnable privacy-safe synthetic/adversarial tests proving at minimum:
   - restored complete R3-R33 adversarial matrix;
   - all R3-R34 adversarial matrix remains;
   - valid NCName with middle-dot continuation;
   - valid NCName with combining-mark continuation;
   - valid connector-punctuation continuation;
   - invalid attribute name beginning with digit rejects;
   - invalid attribute name beginning with colon rejects;
   - invalid trailing-colon name rejects;
   - invalid multi-colon QName rejects;
   - valid unrelated qualified extra attribute with exactly one valid QName parses without satisfying required unqualified attributes;
   - malformed prefixed `embed` QName cannot yield a target rId;
14. synthetic/adversarial tests must run when owner templates are absent;
15. template-dependent full inventory equality may skip only when exact owner template is unavailable;
16. do not change production source merely to make tests pass.

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
- R3-R36 or any next WP.

Claude second review is not needed at this gate.

## 9. Authorization ledger

```text
D2-WP003-R3-R30-TEST-20260902-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP003-R3-R31-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R3-R32-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R3-R33-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R3-R34-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-PRESERVATION-PARTB-SHEETPR-DECISION-01 = OPTION B APPROVED / ARCHITECTURE POLICY
CONTROL-PLANE-D2-REVIEW-CORRECTIVE-20-ROUND-20260901 = ACTIVE / ROUND 13 OF 20
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
NEXT_ACTION = DECIDE WHETHER TO AUTHORIZE D2-WP003-R3-R35 TEST-ONLY AS PROPOSED
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
D3 = HOLD
```
