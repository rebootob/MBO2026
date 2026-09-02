# AI ACTIVE TASK — D2-WP003-R3-R33 TEST-ONLY AUTHORIZED

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
D2-WP003-R3-R32_SCOPE_REVIEW = PASS
D2-WP003-R3-R32_PROOF_REVIEW = FAIL / XML PARSER FAIL-CLOSED CONTRACT INCOMPLETE
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_USED = 11
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_REMAINING = 9
ANTIGRAVITY_AUTO_AUTH = NO
CLAUDE_AUTO_REVIEW = NO
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R33
ACTIVE_WORK_PACKAGE_NAME = REFERENCE-IMAGE STRICT XML INVENTORY PARSER CLOSURE
AUTHORIZED_SCOPE = TEST-ONLY / EXISTING FEASIBILITY TEST FILE ONLY
OWNER_APPROVAL_BASELINE_HEAD = a276f318173745d1147c8a0ee96885b6bcbd65b8
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP003-R3-R33-TEST-20260902-01
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
REFERENCE_IMAGE_SOURCE_BASELINE = CURRENT SOURCE / FROZEN / DO NOT MODIFY
PRIVACY_PURGE_REQUIRED = NO
D3_EXECUTION = HOLD UNTIL D2 PASS / CLOSED
ANTIGRAVITY = AUTHORIZED ONLY FOR R3-R33 / ONE-SHOT BOUNDED EXECUTION
CLAUDE = STOP / NOT NEEDED
```

## 1. Owner authorization

Owner explicitly authorized:

```text
D2-WP003-R3-R33 TEST-ONLY ตามขอบเขตที่เสนอ
```

Authorization token:

```text
D2-WP003-R3-R33-TEST-20260902-01 = ACTIVE / ONE-SHOT / TEST-ONLY / DO NOT WIDEN / DO NOT REUSE
```

This authorization permits only the bounded TEST-ONLY implementation described below. It does not authorize production source changes, evidence publication, Kintone writes, deploys, Live UAT, PDF work, D3, R3-R34, or any next work package.

## 2. R3-R32 accepted progress and remaining blockers

R3-R32 implementation:

```text
dbb0797187cc59047c9864c97fa3514719319a23
```

Retain all accepted progress:
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

Production/reference-image source remains accepted and frozen.

Remaining proof blockers:
1. XML element local names are matched case-insensitively and malformed wrong-case names can be accepted;
2. QName prefix matching uses `\w+`, so valid hyphen/dot/non-ASCII prefixes are not handled namespace-independently;
3. Relationship required attributes are searched across the whole matched element instead of only the direct start tag;
4. adversarial proof does not yet cover wrong-case names, complete prefix variants, nested-child substitution, duplicate attributes, namespaced required-attribute substitutes, and explicit TargetMode tuple inequality.

## 3. Exact write scope — ONLY ONE FILE

Modify ONLY:
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

READ-ONLY as needed:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`;
- exact R3-R32 authorization / implementation history;
- package metadata;
- exact ignored Part A owner template only after SHA verification.

Do NOT modify production source, package/dependencies, governance docs, generated workbook/image/PDF files, evidence, application code, Kintone, deploy configuration, or any other tracked file.

## 4. Mandatory TEST-ONLY corrective

Preserve all accepted R3-R32 target-normalized full-inventory equality and exact tuple behavior, and make the proof parser strictly fail-closed.

Mandatory requirements:

1. XML local-name matching MUST be case-sensitive.
   - exact `wsDr` only;
   - exact `twoCellAnchor`, `oneCellAnchor`, `absoluteAnchor` only;
   - exact `Relationships` only;
   - exact `Relationship` only.
   Wrong-case variants must reject.

2. Replace `\w+` namespace-prefix assumptions with a coverage-complete QName/NCName-aware direct-tag approach or equivalent tokenizer.
   Valid alternate prefixes must not be rejected merely because they contain:
   - hyphen;
   - dot;
   - non-ASCII letters.

3. Namespace-prefix independence MUST NOT weaken local-name exactness. Unknown local names remain rejected.

4. Parse Relationship attributes ONLY from the direct Relationship START TAG.
   Nested child markup must never satisfy a missing parent attribute.

5. On the direct Relationship start tag require exactly one UNQUALIFIED:
   - `Id`;
   - `Type`;
   - raw `Target`.

6. Permit at most one UNQUALIFIED `TargetMode`.
   - absent remains `null`;
   - explicit value remains exact raw value.

7. Reject fail-closed:
   - duplicate `Id`;
   - duplicate `Type`;
   - duplicate `Target`;
   - duplicate `TargetMode`;
   - namespace-qualified substitutes such as `x:Id`, `x:Type`, `x:Target`, `x:TargetMode` when used instead of the required unqualified attribute;
   - malformed quoting;
   - nested-child substitutes;
   - unknown/unconsumed relevant direct markup.

8. Retain exact complete target relationship tuple normalization from R3-R32:
   - expected drawing relationship part;
   - `Id = rId3`;
   - canonical image relationship Type;
   - raw `Target = ../media/image3.png`;
   - exact raw TargetMode identity.

9. Retain exact target anchor part/embed/cardinality binding before normalization.

10. Retain exact target-normalized deep equality for:
   - anchors;
   - drawing relationship tuples;
   - media path/hash inventory.

11. Retain target absence assertions, `rId1`/`rId2` survival assertions and package-wide orphan-safety proof.

12. Add always-runnable privacy-safe synthetic/adversarial tests in the SAME test file proving at minimum:
   - wrong-case anchor local name rejects;
   - wrong-case Relationship local name rejects;
   - valid hyphenated prefix is handled;
   - valid dotted prefix is handled;
   - valid non-ASCII prefix is handled;
   - nested child `Id`/`Type`/`Target` cannot satisfy missing parent start-tag attributes;
   - duplicate `Id` rejects;
   - duplicate `Type` rejects;
   - duplicate `Target` rejects;
   - duplicate `TargetMode` rejects;
   - namespace-qualified required-attribute substitute rejects;
   - `TargetMode` absent vs explicit `Internal` vs explicit `External` produce distinct tuples and observable deep inequality.

13. Synthetic/adversarial tests MUST run even when owner templates are unavailable.

14. If exact owner template is unavailable, template-dependent full inventory equality proof may skip explicitly; do not reconstruct, invent, publish, or commit the binary.

15. Do not modify production source merely to make tests pass.

## 5. Proof quality rules

Required characteristics:
- deterministic stable sorting before deep equality;
- case-sensitive exact local names;
- QName-prefix independent direct-child coverage;
- exact direct-start-tag Relationship attributes only;
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
- R3-R34 or any next WP.

Claude second review is not authorized or needed for this bounded TEST-ONLY change unless ChatGPT later determines material ambiguity remains after repository review.

## 8. Authorization ledger

```text
D2-WP003-R3-R30-TEST-20260902-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP003-R3-R31-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R3-R32-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R3-R33-TEST-20260902-01 = ACTIVE / ONE-SHOT / TEST-ONLY
D2-PRESERVATION-PARTB-SHEETPR-DECISION-01 = OPTION B APPROVED / ARCHITECTURE POLICY
CONTROL-PLANE-D2-REVIEW-CORRECTIVE-20-ROUND-20260901 = ACTIVE / ROUND 11 OF 20
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
NEXT_ACTION = EXECUTE ONLY D2-WP003-R3-R33-TEST-20260902-01
EXPECTED_CHANGED_FILE = tests/mbo-xlsx-ooxml-feasibility.test.js ONLY
EXPECTED_COMMITS = EXACTLY ONE BOUNDED IMPLEMENTATION/BLOCKER COMMIT
ANTIGRAVITY = STOP IMMEDIATELY AFTER PUSH/REPORT
CLAUDE = STOP
CHATGPT = INDEPENDENT REVIEW AFTER IMPLEMENTATION ARRIVES
D3 = HOLD
```
