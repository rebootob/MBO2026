# AI ACTIVE TASK — D2-WP003-R3-R29 AUTHORIZED

Mode: **BOUNDED ANTIGRAVITY EXECUTION / LOW-CREDIT / SOURCE+TEST ONLY / OPTION B / NO KINTONE / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-02 ICT

Repository truth and accepted newer Live evidence always win. Fresh-fetch current branch HEAD before acting.

```text
TASK_STATE = AUTHORIZED / WAIT ANTIGRAVITY IMPLEMENTATION
D1_OVERALL = PASS / CLOSED
D2_STATUS = IN PROGRESS
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
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R29
WORK_PACKAGE_NAME = SINGLETON SCHEMA FIX + FULL REGRESSION RESTORE + EFFECTIVE STRUCTURAL PROOF
AUTHORIZED_SCOPE = EXISTING FEASIBILITY SOURCE + TEST ONLY
CORRECTIVE_SOURCE_BASELINE_COMMIT = 7fcf68e687ed2e76df418a4c7b0dd7b5bf8663de
AUTHORIZATION_BASELINE_HEAD = aca5434fc66719ec3963242e34e75ec4f0d69a35
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R29-SOURCE-20260902-01
AUTHORIZATION_MODE = ONE-SHOT / BOUNDED / DO NOT WIDEN / DO NOT REUSE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
PRIVACY_PURGE_REQUIRED = NO
D3_EXECUTION = HOLD UNTIL D2 PASS / CLOSED
ANTIGRAVITY = AUTHORIZED FOR THIS WP ONLY
CLAUDE = STOP / NOT AUTHORIZED / NOT NEEDED UNLESS CHATGPT LATER FINDS MATERIAL AMBIGUITY
```

## 1. Owner authorization

Owner explicitly authorized on 2026-09-02 ICT:

```text
อนุมัติ D2-WP003-R3-R29 ตามขอบเขตที่เสนอ
```

This creates exactly one bounded source/test authorization:

```text
D2-WP003-R3-R29-SOURCE-20260902-01 = ACTIVE / ONE-SHOT
```

This does NOT authorize evidence publication, Kintone access/write, deploy, Live UAT, rollback, D3, R3-R30, another work package, Claude execution or scope expansion.

## 2. Governing preservation policy

Owner-approved architecture remains:

```text
D2-PRESERVATION-PARTB-SHEETPR-DECISION-01 = OPTION B APPROVED
PRESERVATION_POLICY = NARROW DETERMINISTIC ALLOWED-DRIFT
```

Only one exact deterministic xlsx-populate-generated Part B `Sheet1` `<sheetPr/>` drift may be normalized inside preservation. Source must lack it; exact structure and slot must match the pinned allowlist. Part A and every other non-dimension drift remain fail-closed. Caller source/raw inputs remain byte-immutable.

## 3. Exact write scope

Modify ONLY:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

Read-only as needed:
- `package.json`, `package-lock.json`;
- current governance/baseline documents;
- prior repository versions needed only to restore accepted tests;
- exact ignored owner templates only after SHA verification.

No new tracked file, dependency, generated workbook, evidence document, PDF, image/media, Kintone, deploy or D3 change.

## 4. Mandatory source correction

R3-R29 MUST:

1. preserve all accepted R3-R28 improvements: direct raw A/B path, persistent Option B write-back, coverage/gap XML parsing, exact source SHA, exact relationship tuple and frozen `getNoOpParityBuffers()`;
2. correct worksheet occurrence semantics for the supported child set:
   - `cols` and `conditionalFormatting` are repeatable and must not be rejected merely as duplicates by singleton logic;
   - supported maxOccurs=1 children including `mergeCells`, `hyperlinks`, `oleObjects`, `controls`, `tableParts` and every other singleton accepted by the validator must be independently guarded;
3. keep Option B narrow; do not widen `<sheetPr/>` tolerance;
4. factor a pure worksheet structural preservation/validation helper sufficient to test source dimension count, observed dimension conflict/count and predecessor/successor placement without passing mutated sources through the production SHA gate;
5. keep production `sourceBufOverride` exact-SHA gated before source acceptance;
6. retain deterministic blocker normalization and never return a partial preserved buffer;
7. do not broaden XML acceptance beyond exact canonical forms needed by the SHA-verified templates.

## 5. Mandatory proof

### Always-runnable privacy-safe proof

Retain the current R3-R28 unit tests and add/repair:
- actual non-ASCII Unicode-prefixed Relationship rejection;
- actual non-ASCII Unicode/prefixed worksheet-child rejection;
- duplicate singleton proof for at least `mergeCells`, `hyperlinks`, `oleObjects`, `controls`, `tableParts`;
- repeatable `cols` proof showing multiple `cols` groups are not rejected merely by singleton logic;
- explicit duplicate and extra Option B `sheetPr` rejection;
- effective fail-closed structural proof for moved/other-sheet/Part-A observed-only `sheetPr`;
- pure structural tests for missing/multiple source dimension, conflicting/multiple observed dimension, missing predecessor/successor boundary and malformed/unconsumed worksheet markup.

### Restore regression coverage

Restore every still-valid R3-R24/R3-R25/R3-R26/R3-R28 negative that was deleted, including at minimum:
- invalid + missing `partKey`;
- wrong-SHA source override;
- missing relationship;
- duplicate relationship ID;
- duplicate worksheet target;
- real relationship target swap;
- cross-sheet mapping;
- non-worksheet/counterfeit/exact Type mismatches;
- external `TargetMode`;
- all lexical Target aliases;
- missing/multiple source dimension via pure structural proof;
- conflicting/multiple observed dimension;
- malformed source/observed XML via pure structural proof where SHA would otherwise mask the branch;
- print-area exact-sheet negative;
- Part B `Sheet1.colsHash` negative;
- accepted header-fingerprint negative matrix;
- accepted typed-privacy metadata negative matrix.

Use prior repository versions as recovery reference. Do not invent replacement expected values when accepted tests already exist in Git history.

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

If owner templates are absent, template-dependent tests may skip, but always-runnable unit proof MUST execute.

## 6. Frozen / out of scope

DO NOT:
- modify/repair `getNoOpParityBuffers()`;
- publish evidence;
- start reference-image closure;
- start Part A objective insertion closure;
- start Part B competency insertion closure;
- start formula/no-formula authority closure;
- start production sanitizer/XLSX renderer;
- generate combined Excel/PDF;
- change UI;
- access/write/deploy Kintone;
- modify App53/App794/App795/App801 records/schema/ACL/process/groups/password/session;
- perform Live UAT;
- rollback automatically;
- start D3;
- start R3-R30 or another work package;
- invoke Claude;
- declare R3-R29, D2-WP003 or D2 PASS/CLOSED.

## 7. Required execution sequence

Antigravity must:
1. fresh-fetch `ai/antigravity-wp002c` and confirm this authorization commit is present;
2. read `project-docs/CHAT_HANDOFF.md`;
3. read `project-docs/AI_CONTROL_CENTER.md`;
4. read this `project-docs/AI_ACTIVE_TASK.md`;
5. inspect only the two authorized source/test files plus prior Git versions strictly needed to restore deleted accepted tests;
6. implement the smallest correction satisfying this contract;
7. run:

```text
node --check scripts/export/mbo-xlsx-ooxml-feasibility.js
node --check tests/mbo-xlsx-ooxml-feasibility.test.js
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

8. if owner templates are unavailable, execute all privacy-safe unit proof and report exact-template limitation honestly;
9. make exactly ONE bounded implementation/blocker commit;
10. push to `ai/antigravity-wp002c`;
11. STOP and report commit SHA, exact changed files, test results, dependency audit result and blocker if any.

Antigravity self-report is not independent PASS evidence. ChatGPT performs final independent review from Git.

## 8. Stop conditions

STOP immediately if:
- another tracked file must change;
- a new dependency is required;
- satisfying the contract requires redesign outside the two authorized files;
- Option B would need widening;
- Kintone/Live/deploy/evidence/PDF/renderer/D3 work appears necessary;
- the authorization baseline conflicts with newer repository truth.

No automatic rollback.

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
D2-WP003-R3-R29-SOURCE-20260902-01 = ACTIVE / ONE-SHOT
CONTROL-PLANE-D2-REVIEW-CORRECTIVE-20-ROUND-20260901 = ACTIVE / ROUND 6 OF 20
ANTIGRAVITY_AUTO_AUTH = NO
CLAUDE_AUTO_REVIEW = NO
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
NEXT_EXECUTOR = ANTIGRAVITY
NEXT_ACTION = IMPLEMENT D2-WP003-R3-R29 EXACTLY WITHIN THIS ONE-SHOT SOURCE+TEST AUTHORIZATION
AFTER_COMMIT = STOP / CHATGPT INDEPENDENT REVIEW
CLAUDE = STOP / DO NOT INVOKE UNLESS CHATGPT LATER DETERMINES SECOND REVIEW IS MATERIAL
D3 = HOLD
```
