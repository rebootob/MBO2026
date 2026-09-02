# AI ACTIVE TASK — D2-WP003-R3-R34 TEST-ONLY AUTHORIZED

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
D2-WP003-R3-R33_SCOPE_REVIEW = PASS
D2-WP003-R3-R33_PROOF_REVIEW = FAIL / NCNAME + ATTRIBUTE COVERAGE FAIL-CLOSED INCOMPLETE
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_USED = 12
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_REMAINING = 8
ANTIGRAVITY_AUTO_AUTH = NO
CLAUDE_AUTO_REVIEW = NO
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R34
ACTIVE_WORK_PACKAGE_NAME = REFERENCE-IMAGE NCNAME + ATTRIBUTE TOKEN COVERAGE CLOSURE
AUTHORIZED_SCOPE = TEST-ONLY / EXISTING FEASIBILITY TEST FILE ONLY
OWNER_APPROVAL_BASELINE_HEAD = 473dbff1b4bc47329e2bfb9d42e14b719cdd217c
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP003-R3-R34-TEST-20260902-01
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
REFERENCE_IMAGE_SOURCE_BASELINE = CURRENT SOURCE / FROZEN / DO NOT MODIFY
PRIVACY_PURGE_REQUIRED = NO
D3_EXECUTION = HOLD UNTIL D2 PASS / CLOSED
ANTIGRAVITY = AUTHORIZED ONLY FOR R3-R34 / ONE-SHOT BOUNDED EXECUTION
CLAUDE = STOP / NOT NEEDED
```

## 1. Owner authorization

Owner explicitly authorized:

```text
D2-WP003-R3-R34 TEST-ONLY ตามขอบเขตที่เสนอ
```

Authorization token:

```text
D2-WP003-R3-R34-TEST-20260902-01 = ACTIVE / ONE-SHOT / TEST-ONLY / DO NOT WIDEN / DO NOT REUSE
```

This authorization permits only the bounded TEST-ONLY implementation described below. It does not authorize production source changes, evidence publication, Kintone writes, deploys, Live UAT, PDF work, D3, R3-R35, or any next work package.

## 2. R3-R33 accepted progress and remaining blockers

R3-R33 implementation:

```text
adc974704898686efffd7ac121b4b58820581461
```

Retain all accepted progress:
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

Remaining proof blockers:
1. prefix pattern is broader than XML NCName and accepts invalid forms such as leading digit;
2. Relationship start-tag attribute extraction does not prove complete token-region consumption, so malformed/unquoted extra syntax can be silently skipped;
3. always-runnable proof does not yet reject invalid NCName prefixes or malformed/unquoted attribute-region syntax.

## 3. Exact write scope — ONLY ONE FILE

Modify ONLY:
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

READ-ONLY as needed:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`;
- exact R3-R33 authorization / implementation history;
- package metadata;
- exact ignored Part A owner template only after SHA verification.

Do NOT modify production source, package/dependencies, governance docs, generated workbook/image/PDF files, evidence, application code, Kintone, deploy configuration, or any other tracked file.

## 4. Mandatory TEST-ONLY corrective

Preserve all accepted R3-R33 proof behavior and close only NCName + Relationship start-tag token coverage.

Mandatory requirements:

1. Replace the broad optional-prefix token with a genuinely NCName-aware validator/tokenizer or equivalent strict parser.

2. Preserve positive valid prefix behavior already required:
   - `ns-1` must be accepted;
   - `pkg.rel` must be accepted;
   - a non-ASCII-letter prefix such as `ñ` must be accepted.

3. Reject invalid NCName prefix forms at minimum:
   - leading digit, e.g. `1bad`;
   - leading hyphen, e.g. `-bad`;
   - leading dot, e.g. `.bad`.

4. Do not broaden accepted local names. Exact case-sensitive local names remain mandatory:
   - `wsDr`;
   - `twoCellAnchor`;
   - `oneCellAnchor`;
   - `absoluteAnchor`;
   - `Relationships`;
   - `Relationship`.

5. For each direct `Relationship` START TAG, tokenize/validate the COMPLETE attribute region. Every non-whitespace character between the element QName and the closing `>` or `/>` must be consumed by a syntactically valid attribute token.

6. Valid attribute tokens may use single- or double-quoted values as already accepted.

7. Reject fail-closed:
   - unterminated single-quoted value;
   - unterminated double-quoted value;
   - unquoted attribute value;
   - stray token text;
   - malformed `=` syntax;
   - any other unconsumed attribute-region character/text.

8. Continue requiring exactly one UNQUALIFIED:
   - `Id`;
   - `Type`;
   - raw `Target`.

9. Continue permitting at most one UNQUALIFIED `TargetMode`.
   - absent remains `null`;
   - explicit value remains exact raw value.

10. Retain duplicate `Id`, `Type`, `Target`, `TargetMode` rejection and namespaced required-attribute substitute rejection.

11. Retain exact complete target relationship tuple normalization from R3-R33:
   - expected drawing relationship part;
   - `Id = rId3`;
   - canonical image relationship Type;
   - raw `Target = ../media/image3.png`;
   - exact raw TargetMode identity.

12. Retain exact target anchor part/embed/cardinality binding before normalization.

13. Retain exact target-normalized deep equality for:
   - anchors;
   - drawing relationship tuples;
   - media path/hash inventory.

14. Retain target absence assertions, `rId1`/`rId2` survival assertions and package-wide orphan-safety proof.

15. Add always-runnable privacy-safe synthetic/adversarial tests in the SAME existing test file proving at minimum:
   - valid hyphenated prefix still passes;
   - valid dotted prefix still passes;
   - valid non-ASCII-letter prefix still passes;
   - leading-digit prefix rejects;
   - leading-hyphen prefix rejects;
   - leading-dot prefix rejects;
   - malformed unterminated quoted extra attribute rejects even when `Id`/`Type`/`Target` are otherwise valid;
   - unquoted extra attribute rejects even when `Id`/`Type`/`Target` are otherwise valid;
   - malformed equals syntax rejects;
   - stray/unconsumed attribute-region text rejects;
   - complete valid mixed single/double quoted attributes still parse.

16. Synthetic/adversarial tests MUST run even when owner templates are unavailable.

17. If exact owner template is unavailable, template-dependent full inventory equality proof may skip explicitly; do not reconstruct, invent, publish, or commit the binary.

18. Do not modify production source merely to make tests pass.

## 5. Proof quality rules

Required characteristics:
- deterministic stable sorting before deep equality;
- exact case-sensitive local names;
- genuinely NCName-aware prefix validation;
- complete direct Relationship start-tag attribute-region consumption;
- exact direct-start-tag attributes only;
- exact relationship tuple identity;
- raw relationship `Target` retained;
- raw TargetMode presence/value retained;
- exact target cardinality checks before normalization;
- no count-only or sentinel-only substitute for full inventory equality;
- no silent dropping of malformed/unparsed relevant inventory entries;
- any helper added/changed in the test file must be directly exercised by the same change.

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
- R3-R35 or any next WP.

Claude second review is not authorized or needed for this bounded TEST-ONLY change unless ChatGPT later determines material ambiguity remains after repository review.

## 8. Authorization ledger

```text
D2-WP003-R3-R30-TEST-20260902-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP003-R3-R31-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R3-R32-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R3-R33-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R3-R34-TEST-20260902-01 = ACTIVE / ONE-SHOT / TEST-ONLY
D2-PRESERVATION-PARTB-SHEETPR-DECISION-01 = OPTION B APPROVED / ARCHITECTURE POLICY
CONTROL-PLANE-D2-REVIEW-CORRECTIVE-20-ROUND-20260901 = ACTIVE / ROUND 12 OF 20
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
NEXT_ACTION = EXECUTE ONLY D2-WP003-R3-R34-TEST-20260902-01
EXPECTED_CHANGED_FILE = tests/mbo-xlsx-ooxml-feasibility.test.js ONLY
EXPECTED_COMMITS = EXACTLY ONE BOUNDED IMPLEMENTATION/BLOCKER COMMIT
ANTIGRAVITY = STOP IMMEDIATELY AFTER PUSH/REPORT
CLAUDE = STOP
CHATGPT = INDEPENDENT REVIEW AFTER IMPLEMENTATION ARRIVES
D3 = HOLD
```
