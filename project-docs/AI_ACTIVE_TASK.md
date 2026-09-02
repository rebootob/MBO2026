# AI ACTIVE TASK — D2-WP003-R3-R35 TEST-ONLY AUTHORIZED

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
D2-WP003-R3-R34_SCOPE_REVIEW = PASS
D2-WP003-R3-R34_PROOF_REVIEW = FAIL / XML NCNAME-QNAME + REGRESSION RETENTION INCOMPLETE
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_USED = 13
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_REMAINING = 7
ANTIGRAVITY_AUTO_AUTH = NO
CLAUDE_AUTO_REVIEW = NO
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R35
ACTIVE_WORK_PACKAGE_NAME = REFERENCE-IMAGE XML NAME/QNAME + REGRESSION RETENTION CLOSURE
AUTHORIZED_SCOPE = TEST-ONLY / EXISTING FEASIBILITY TEST FILE ONLY
OWNER_APPROVAL_BASELINE_HEAD = 263740a30af685fdf555186a074ffba7730de161
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP003-R3-R35-TEST-20260902-01
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
REFERENCE_IMAGE_SOURCE_BASELINE = CURRENT SOURCE / FROZEN / DO NOT MODIFY
PRIVACY_PURGE_REQUIRED = NO
D3_EXECUTION = HOLD UNTIL D2 PASS / CLOSED
ANTIGRAVITY = AUTHORIZED ONLY FOR R3-R35 / ONE-SHOT BOUNDED EXECUTION
CLAUDE = STOP / NOT NEEDED
```

## 1. Owner authorization

Owner explicitly authorized:

```text
D2-WP003-R3-R35 TEST-ONLY ตามขอบเขตที่เสนอ
```

Authorization token:

```text
D2-WP003-R3-R35-TEST-20260902-01 = ACTIVE / ONE-SHOT / TEST-ONLY / DO NOT WIDEN / DO NOT REUSE
```

This authorization permits only the bounded TEST-ONLY implementation below. It does not authorize production source changes, evidence publication, Kintone writes, deploys, Live UAT, PDF work, D3, R3-R36, or any next work package.

## 2. R3-R34 accepted progress — retain all

R3-R34 implementation:

```text
f2bace7e97080dd89e44ceb045ba7e5b7e4aaeec
```

Retain all accepted behavior/proof:
- exact case-sensitive local names for `wsDr`, anchors, `Relationships`, `Relationship`;
- target-normalized BEFORE/AFTER anchor equality;
- target-normalized BEFORE/AFTER drawing relationship equality;
- media path + SHA-256 equality;
- exact Part A SHA gate for template-dependent proof;
- direct Relationship START-TAG attribute extraction;
- complete attribute-region scanning that rejects unterminated quotes, unquoted values, malformed equals and stray text;
- leading-digit, leading-hyphen and leading-dot element-prefix negatives;
- valid `ns-1`, `pkg.rel` and non-ASCII-letter prefix positives;
- mixed single/double quoted valid Relationship attributes;
- exact full target relationship tuple binding before normalization;
- exact target anchor part/embed/cardinality binding;
- target absence, `rId1`/`rId2` survival and package-wide orphan safety.

Production/reference-image source remains accepted and frozen.

## 3. Exact write scope — ONLY ONE FILE

Modify ONLY:
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

READ-ONLY as needed:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`;
- exact R3-R33/R3-R34 authorization and implementation history;
- package metadata;
- exact ignored Part A owner template only after SHA verification.

Do NOT modify production source, dependencies, governance docs, generated workbook/image/PDF files, evidence, Kintone, deploy configuration, or any other tracked file.

## 4. Mandatory TEST-ONLY corrective

1. Preserve every accepted R3-R34 test/helper behavior.
2. Restore ALL accepted R3-R33 adversarial assertions; do not replace one regression matrix with another. Restore at minimum:
   - wrong-case anchor local-name rejection;
   - wrong-case Relationship local-name rejection;
   - nested-child `Id`/`Type`/`Target` substitution rejection;
   - duplicate `Id`, `Type`, `Target`, `TargetMode` rejection;
   - namespace-qualified required-attribute substitute rejection;
   - TargetMode absent/Internal/External tuple inequality proof.
3. Implement XML 1.0-compatible NameStartChar/NameChar validation by Unicode code point, not a rough BMP class.
4. NCName must exclude colon and validate all code points, including allowed supplementary-plane code points.
5. Prove valid NCName continuation examples including:
   - middle dot U+00B7;
   - combining mark continuation such as U+0301;
   - connector punctuation allowed by XML NameChar such as U+203F/U+2040.
6. Preserve valid `ns-1`, `pkg.rel`, non-ASCII-letter prefixes and invalid leading digit/hyphen/dot prefixes.
7. Validate every Relationship attribute name as XML name/QName before accepting the token:
   - unqualified = one valid NCName;
   - qualified = exactly one colon between valid prefix NCName and valid local NCName;
   - reject leading colon, trailing colon, multiple colons, leading-digit names/local names and invalid Name/QName forms.
8. Continue requiring exactly one UNQUALIFIED `Id`, exactly one UNQUALIFIED `Type`, exactly one UNQUALIFIED raw `Target`, and at most one UNQUALIFIED `TargetMode`.
9. Retain namespaced required-attribute substitute rejection, duplicate required-attribute rejection, nested-child substitution rejection and exact TargetMode identity.
10. Retain complete Relationship attribute-region consumption from R3-R34 and all malformed quote/unquoted/malformed equals/stray-text negatives.
11. For a prefixed `embed` QName observed by anchor inventory extraction, validate the prefix with the SAME NCName rules before using its value. Malformed QName/prefix must fail closed and must never yield a target rId.
12. Retain exact complete target relationship tuple normalization:
   - expected drawing relationship part;
   - `Id = rId3`;
   - canonical image relationship Type;
   - raw `Target = ../media/image3.png`;
   - exact raw TargetMode identity.
13. Retain exact target anchor part/embed/cardinality binding before normalization.
14. Retain exact target-normalized deep equality for anchors, drawing relationship tuples and media path/hash inventory.
15. Retain target absence assertions, `rId1`/`rId2` survival assertions and package-wide orphan-safety proof.
16. Add always-runnable privacy-safe synthetic/adversarial tests proving at minimum:
   - complete restored R3-R33 adversarial matrix;
   - every R3-R34 adversarial case remains;
   - valid middle-dot continuation;
   - valid combining-mark continuation;
   - valid connector-punctuation continuation;
   - invalid attribute name beginning with digit rejects;
   - invalid attribute name beginning with colon rejects;
   - invalid trailing-colon name rejects;
   - invalid multi-colon QName rejects;
   - valid unrelated qualified extra attribute with exactly one valid QName parses without satisfying required unqualified attributes;
   - malformed prefixed `embed` QName cannot yield a target rId.
17. Synthetic/adversarial tests MUST run even when owner templates are unavailable.
18. If exact owner template is unavailable, template-dependent full inventory equality proof may skip explicitly; do not reconstruct, invent, publish or commit the binary.
19. Do not modify production source merely to make tests pass.

## 5. Proof quality rules

Required characteristics:
- deterministic stable sorting before deep equality;
- exact case-sensitive local names;
- XML-compatible NameStartChar/NameChar/NCName/QName handling;
- complete direct Relationship start-tag attribute-region consumption;
- exact direct-start-tag attributes only;
- exact relationship tuple identity;
- raw relationship `Target` retained;
- raw TargetMode presence/value retained;
- exact target cardinality checks before normalization;
- no count-only/sentinel-only substitute for full inventory equality;
- no silent dropping of malformed/unparsed relevant inventory entries;
- no removal or weakening of accepted adversarial regression proof;
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
- R3-R36 or any next WP.

Claude second review is not authorized or needed for this bounded TEST-ONLY change unless ChatGPT later determines material ambiguity remains after repository review.

## 8. Authorization ledger

```text
D2-WP003-R3-R30-TEST-20260902-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP003-R3-R31-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R3-R32-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R3-R33-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R3-R34-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R3-R35-TEST-20260902-01 = ACTIVE / ONE-SHOT / TEST-ONLY
D2-PRESERVATION-PARTB-SHEETPR-DECISION-01 = OPTION B APPROVED / ARCHITECTURE POLICY
CONTROL-PLANE-D2-REVIEW-CORRECTIVE-20-ROUND-20260901 = ACTIVE / ROUND 13 OF 20
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
NEXT_ACTION = EXECUTE ONLY D2-WP003-R3-R35-TEST-20260902-01
EXPECTED_CHANGED_FILE = tests/mbo-xlsx-ooxml-feasibility.test.js ONLY
EXPECTED_COMMITS = EXACTLY ONE BOUNDED IMPLEMENTATION/BLOCKER COMMIT
ANTIGRAVITY = STOP IMMEDIATELY AFTER PUSH/REPORT
CLAUDE = STOP
CHATGPT = INDEPENDENT REVIEW AFTER IMPLEMENTATION ARRIVES
D3 = HOLD
```
