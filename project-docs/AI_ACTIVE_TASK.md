# AI ACTIVE TASK — D2 CONTINUITY / R3-R28 REVIEWED CORRECTIVE / R3-R29 PROPOSED

Mode: **CONTROL PLANE / INDEPENDENT REVIEW COMPLETE / LOW-CREDIT / NO KINTONE / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-02 ICT

Repository truth and accepted newer Live evidence always win. Fresh-fetch current branch HEAD before acting.

```text
TASK_STATE = WAIT_OWNER_CORRECTIVE_APPROVAL
D1_OVERALL = PASS / CLOSED
D2_STATUS = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R22 = PASS / CLOSED
D2-WP003-R3-R23 = REVIEWED / NOT PASS / NOT CLOSED
D2-WP003-R3-R24 = REVIEWED / NOT PASS / NOT CLOSED
D2-WP003-R3-R25 = REVIEWED / NOT PASS / NOT CLOSED
D2-WP003-R3-R26 = REVIEWED / BLOCKED / NOT CLOSED
D2-WP003-R3-R27 = REVIEWED / NOT PASS / NOT CLOSED
D2-WP003-R3-R28 = REVIEWED / NOT PASS / NOT CLOSED
R3-R28_AUTHORIZATION_COMMIT = 9598602238d2f46614b6a135f0422b8e744b862a
R3-R28_IMPLEMENTATION_COMMIT = 7fcf68e687ed2e76df418a4c7b0dd7b5bf8663de
R3-R28_SCOPE_REVIEW = PASS
R3-R28_SOURCE_REVIEW = FAIL / SINGLETON-SCHEMA CONTRACT GAP
R3-R28_PROOF_REVIEW = FAIL / REGRESSION + WRONG-BRANCH + INCOMPLETE
D2-PRESERVATION-PARTB-SHEETPR-DECISION-01 = OPTION B APPROVED
PRESERVATION_POLICY = NARROW DETERMINISTIC ALLOWED-DRIFT
CONTROL_PLANE_REVIEW_CORRECTIVE_STANDING_AUTH = ACTIVE
CONTROL_PLANE_REVIEW_CORRECTIVE_MAX_ROUNDS = 20
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_USED = 6
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_REMAINING = 14
ANTIGRAVITY_AUTO_AUTH = NO
CLAUDE_AUTO_REVIEW = NO
ACTIVE_WORK_PACKAGE = NONE
PROPOSED_WORK_PACKAGE = D2-WP003-R3-R29
PROPOSED_WORK_PACKAGE_NAME = SINGLETON SCHEMA FIX + FULL REGRESSION RESTORE + EFFECTIVE STRUCTURAL PROOF
PROPOSED_SCOPE = EXISTING FEASIBILITY SOURCE + TEST ONLY
CORRECTIVE_BASELINE_COMMIT = 7fcf68e687ed2e76df418a4c7b0dd7b5bf8663de
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
PRIVACY_PURGE_REQUIRED = NO
D3_EXECUTION = HOLD UNTIL D2 PASS / CLOSED
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP / NOT NEEDED AT THIS GATE
```

## 1. Independent R3-R28 review

Authorization consumed:

```text
D2-WP003-R3-R28-SOURCE-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
```

Scope review = PASS:
- implementation is exactly one commit ahead of authorization;
- only `scripts/export/mbo-xlsx-ooxml-feasibility.js` and `tests/mbo-xlsx-ooxml-feasibility.test.js` changed;
- no dependency/evidence/Kintone/deploy/PDF/renderer/D3 scope expansion;
- `getNoOpParityBuffers()` remains frozen.

Accepted improvements:
- Option B normalization now persists to the working ZIP for both already-correct-dimension and missing-dimension successful paths;
- direct raw `outBufB` positive path remains preserved;
- coverage/gap parsing now captures QName heads without ASCII-only name classes and rejects unknown/prefixed/unconsumed direct-child markup;
- always-runnable template-independent tests were added for Target lexical validation, Relationship inventory, worksheet-child inventory and Option B normalization;
- exact-template tests now skip explicitly when ignored owner templates are unavailable rather than making the entire file fail.

## 2. Proven source defect

`MAX_OCCURS_ONE_CHILDREN` does not match the worksheet schema it claims to enforce.

Current source includes `cols` in the singleton set even though CT_Worksheet permits `cols` with `maxOccurs="unbounded"`, while singleton worksheet children accepted by `OPENXML_WORKSHEET_CHILD_ORDER` such as `mergeCells`, `hyperlinks`, `oleObjects`, `controls`, and `tableParts` are omitted from the independent singleton set.

This violates R3-R28 mandatory source requirement 9: independent maxOccurs=1 checks must cover every singleton child actually claimed by the validator and must not misclassify repeatable children.

## 3. Proof/test defects

### A. Structural source negative still hits SHA gate first

The current `Missing predecessor/successor boundary` regression mutates exact `origBufB` and passes the resulting buffer through `sourceBufOverride`. Production source SHA validation rejects it before the structural boundary logic executes.

R3-R28 explicitly required source-structure cases to test an extracted pure structural helper directly while separately retaining wrong-SHA production proof. This is still not satisfied.

### B. Mandatory exact-template proof regressed

R3-R28 explicitly required retention of:
- exact per-sheet print-area binding proof;
- Part B `Sheet1.colsHash` negative.

These are absent from the current R3-R28 test file.

### C. Full prior regression matrix was not retained

The R3-R28 diff changes the test file by +251 / -808 lines. Several still-valid R3-R24/R3-R25/R3-R26 preservation negatives that existed before R3-R28 are absent, including at minimum:
- missing relationship;
- duplicate worksheet target;
- actual relationship-target swap;
- cross-sheet mapping;
- external TargetMode;
- missing/multiple source dimension structural proof;
- conflicting/multiple observed dimension;
- malformed source/observed XML structural proof.

The instruction was to restore/retain still-valid regression coverage, not replace the matrix with only four integration negatives.

### D. Always-runnable unit matrix is incomplete

The tests say `Unicode` but use only ASCII prefixes (`r`, `ns.1`, `pkg`, `x`, `ns`); no actual non-ASCII QName proof is present.

Option B pure tests prove changed attributes and normalization/no-normalization, but do not explicitly prove duplicate/extra `sheetPr` and do not prove fail-closed preservation semantics for moved/other-sheet/Part-A cases; those cases only return `normalized: false` in the helper-level test.

### E. Accepted non-preservation regression coverage was reduced

Previously accepted header-fingerprint and typed-privacy negative tests were removed while positive checks remain. Accepted D2 foundations are frozen unless a proven regression justifies reopening; removing their regression guards is not authorized by R3-R28.

### F. No independent runtime signal

GitHub reports no status checks and no workflow runs for implementation commit `7fcf68e687ed2e76df418a4c7b0dd7b5bf8663de`.

Control Plane therefore does not claim independent runtime PASS.

## 4. Proposed R3-R29 — NOT AUTHORIZED

```text
PROPOSED_WORK_PACKAGE = D2-WP003-R3-R29
PROPOSED_WORK_PACKAGE_NAME = SINGLETON SCHEMA FIX + FULL REGRESSION RESTORE + EFFECTIVE STRUCTURAL PROOF
PROPOSED_SCOPE = EXISTING FEASIBILITY SOURCE + TEST ONLY
PROPOSED_STATUS = WAIT OWNER AUTHORIZATION
EXECUTOR = NONE
```

No Antigravity or Claude execution is authorized by this proposal.

## 5. Proposed exact write scope if authorized

Modify ONLY:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

Read-only as needed:
- `package.json`, `package-lock.json`;
- current governance/baseline documents;
- prior accepted test versions at `f7a7c82e7d39dc799be9b3687b2b4137c9797c7a` and earlier accepted/corrective commits only as recovery reference;
- exact ignored owner templates only after SHA verification.

No new tracked file, dependency, generated workbook, evidence document, PDF, image/media, Kintone, deploy or D3 change.

## 6. Proposed mandatory source correction

If explicitly authorized, R3-R29 MUST:

1. preserve all accepted R3-R28 improvements: direct raw A/B path, persistent Option B write-back, coverage/gap XML parsing, exact source SHA, exact relationship tuple and frozen `getNoOpParityBuffers()`;
2. correct worksheet occurrence semantics for the exact supported child set: `cols` and `conditionalFormatting` are repeatable; supported singleton children including `mergeCells`, `hyperlinks`, `oleObjects`, `controls`, `tableParts` and all other maxOccurs=1 entries in the supported order must be independently guarded;
3. keep Option B narrow; do not widen `<sheetPr/>` tolerance;
4. factor a pure worksheet structural preservation/validation helper sufficient to test source dimension count, observed dimension conflict/count and predecessor/successor placement without passing mutated sources through the production SHA gate;
5. production `sourceBufOverride` must remain exact-SHA gated before source acceptance;
6. retain deterministic blocker normalization and no partial preserved buffer;
7. do not broaden XML acceptance beyond exact canonical forms needed by the SHA-verified templates.

## 7. Proposed mandatory proof

### Always-runnable privacy-safe proof

Retain current R3-R28 unit tests and add/repair:
- actual non-ASCII Unicode-prefixed Relationship rejection;
- actual non-ASCII Unicode/prefixed worksheet-child rejection;
- duplicate singleton proof for at least `mergeCells`, `hyperlinks`, `oleObjects`, `controls`, `tableParts`;
- repeatable `cols` proof showing multiple `cols` groups are not rejected merely by singleton logic;
- explicit duplicate and extra Option B `sheetPr` rejection;
- effective fail-closed structural proof for moved/other-sheet/Part-A observed-only `sheetPr`;
- pure structural tests for missing/multiple source dimension, conflicting/multiple observed dimension, missing predecessor/successor boundary and malformed/unconsumed worksheet markup.

### Restore regression coverage

Restore every still-valid R3-R24/R3-R25/R3-R26/R3-R28 negative that was deleted, including at minimum:
- invalid + missing partKey;
- wrong-SHA source override;
- missing relationship;
- duplicate relationship ID;
- duplicate worksheet target;
- real relationship target swap;
- cross-sheet mapping;
- non-worksheet/counterfeit/exact Type mismatches;
- external TargetMode;
- all lexical Target aliases;
- missing/multiple source dimension via pure structural proof;
- conflicting/multiple observed dimension;
- malformed source/observed XML via pure structural proof where SHA would otherwise mask the branch;
- print-area exact-sheet negative;
- Part B `Sheet1.colsHash` negative;
- accepted header-fingerprint negative matrix;
- accepted typed-privacy metadata negative matrix.

Use prior repository versions as recovery reference; do not invent new expected values when the accepted tests already exist in Git history.

### Exact-template proof when templates are available

Retain:
- exact owner-template SHA;
- direct raw A/B parity failure before preservation;
- direct raw A/B preservation with no test-side pre-clean;
- preserved A/B real parity;
- exact dimensions for all relevant worksheets;
- exact per-sheet print-area bindings including Part B `Sheet1` empty print area;
- Part B `Sheet1.colsHash` negative;
- source/raw byte immutability;
- Difficulty Level blank temporarily.

If templates are absent, template-dependent tests may skip but always-runnable unit proof must execute.

## 8. Frozen / out of scope

Do NOT publish evidence, start reference-image closure, objective/competency insertion closure, formula authority, production renderer, combined Excel/PDF, UI, Kintone, deploy, Live UAT, rollback, D3, R3-R30 or another WP.

Claude second review is not needed automatically. Use Claude only if ChatGPT later finds material ambiguity after a future implementation reaches Git.

## 9. Authorization ledger

```text
D2-WP003-R3-R22-TEST-20260901-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP003-R3-R22-EVIDENCE-20260901-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP003-R3-R23-SOURCE-20260901-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R3-R24-SOURCE-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R3-R25-SOURCE-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R3-R26-SOURCE-20260902-01 = CONSUMED / BLOCKED / DO NOT REUSE
D2-WP003-R3-R27-SOURCE-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R3-R28-SOURCE-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-PRESERVATION-PARTB-SHEETPR-DECISION-01 = OPTION B APPROVED / ARCHITECTURE POLICY
CONTROL-PLANE-D2-REVIEW-CORRECTIVE-20-ROUND-20260901 = ACTIVE / ROUND 6 OF 20
ANTIGRAVITY_AUTO_AUTH = NO
CLAUDE_AUTO_REVIEW = NO
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_APP794_DEPLOY_AUTH = NONE
APP53_WRITE = NO
APP794_WRITE = NO
APP795_WRITE = NO
APP801_WRITE = NO
ACL_PROCESS_WRITE = NO
KINTONE_CUSTOMIZATION_DEPLOY = NO
LIVE_UAT = NO
ROLLBACK = NO
D3_EXECUTION = HOLD
```

## 10. Exact next action

```text
NEXT_EXECUTOR = OWNER
NEXT_ACTION = DECIDE WHETHER TO AUTHORIZE D2-WP003-R3-R29 AS PROPOSED
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP / NOT NEEDED AT THIS GATE
D3 = HOLD
```
