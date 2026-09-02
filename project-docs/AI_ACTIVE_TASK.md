# AI ACTIVE TASK — D2-WP003-R3-R28 AUTHORIZED

Mode: **BOUNDED ANTIGRAVITY EXECUTION / LOW-CREDIT / SOURCE+TEST ONLY / OPTION B / NO KINTONE / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-02 ICT

Repository truth and accepted newer Live evidence always win. Fresh-fetch current branch HEAD before acting.

```text
TASK_STATE = AUTHORIZED / WAIT ANTIGRAVITY IMPLEMENTATION
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
R3-R27_AUTHORIZATION_COMMIT = 671948b3d4a935118172a3c849d9265eb606ac73
R3-R27_IMPLEMENTATION_COMMIT = f7a7c82e7d39dc799be9b3687b2b4137c9797c7a
R3-R27_SCOPE_REVIEW = PASS
R3-R27_SOURCE_REVIEW = FAIL / CORRECTIVE REQUIRED
R3-R27_PROOF_REVIEW = FAIL / REGRESSION + WRONG-BRANCH + NO INDEPENDENT RUNTIME
D2-PRESERVATION-PARTB-SHEETPR-DECISION-01 = OPTION B APPROVED
PRESERVATION_POLICY = NARROW DETERMINISTIC ALLOWED-DRIFT
CONTROL_PLANE_REVIEW_CORRECTIVE_STANDING_AUTH = ACTIVE
CONTROL_PLANE_REVIEW_CORRECTIVE_MAX_ROUNDS = 20
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_USED = 5
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_REMAINING = 15
ANTIGRAVITY_AUTO_AUTH = NO
CLAUDE_AUTO_REVIEW = NO
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R28
WORK_PACKAGE_NAME = OPTION B WRITEBACK + COMPLETE XML TOKEN INVENTORY + EFFECTIVE PROOF CORRECTIVE
AUTHORIZED_SCOPE = EXISTING FEASIBILITY SOURCE + TEST ONLY
CORRECTIVE_SOURCE_BASELINE_COMMIT = f7a7c82e7d39dc799be9b3687b2b4137c9797c7a
AUTHORIZATION_BASELINE_HEAD = 27d1a642a860e7d306b70279f635edab30d8c804
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R28-SOURCE-20260902-01
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
อนุมัติ D2-WP003-R3-R28 ตามขอบเขตที่เสนอ
```

This creates exactly one bounded source/test authorization:

```text
D2-WP003-R3-R28-SOURCE-20260902-01 = ACTIVE / ONE-SHOT
```

It authorizes only the implementation and tests defined below. It does not authorize evidence publication, Kintone access/write, deploy, Live UAT, rollback, D3, R3-R29, another D2 work package, Claude execution, or scope expansion.

## 2. Governing architecture decision

The Owner previously approved:

```text
DECISION_ID = D2-PRESERVATION-PARTB-SHEETPR-DECISION-01
DECISION = OPTION B
STATUS = APPROVED / RECORDED
POLICY = NARROW DETERMINISTIC ALLOWED-DRIFT
```

Approved policy remains narrow:
- only one exact deterministic xlsx-populate-generated Part B `Sheet1` `<sheetPr/>` drift may be normalized;
- source must lack that element;
- normalization occurs inside preservation on the working copy only;
- caller source/raw buffers remain byte-immutable;
- modified/extra/duplicate/reordered/moved/other-sheet/Part-A `sheetPr` remains fail-closed;
- all other non-dimension drift remains forbidden.

## 3. Exact write scope

Antigravity may modify ONLY:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

Read-only as needed:
- `package.json`, `package-lock.json`;
- current governance/baseline documents;
- exact ignored owner templates only after SHA verification.

No new tracked file, dependency, generated workbook, evidence document, PDF, image/media, Kintone, deploy or D3 change.

If another tracked file appears necessary, STOP without changing it and report the blocker.

## 4. Mandatory source correction

R3-R28 MUST:

1. preserve all accepted R3-R27 direct-raw positive-path, exact part-key, source-SHA, strict raw Target, exact worksheet Type, global duplicate-ID and exact relationship-tuple gates;
2. keep `getNoOpParityBuffers()` completely frozen and unrepaired;
3. preserve Option B as one exact Part B `Sheet1` `<sheetPr/>` exception only; do not widen the allowlist;
4. make allowed-drift normalization persist to the working ZIP regardless of whether observed `<dimension>` is absent or already exactly correct; never return a buffer retaining an allowlisted drift that was logically normalized;
5. after allowed-drift normalization, require exact source-equivalent structure and exact dimension; return no partial buffer;
6. replace QName-shape regex assumptions with a coverage-complete direct-child tokenizer/gap validator that inventories every direct Relationship child and every worksheet top-level start element before semantic validation;
7. explicitly reject any unconsumed/non-whitespace direct-child markup, unknown direct child, namespace-prefixed Relationship, or namespace-prefixed worksheet top-level child, including Unicode QName forms;
8. retain exact canonical unprefixed source forms after SHA verification; do not normalize unknown QName forms into accepted ones;
9. preserve independent duplicate checks for maxOccurs=1 schema children and ensure the singleton set covers every singleton child actually claimed by the validator;
10. factor pure validation/normalization helpers as needed so XML inventory, Target lexical validation, duplicate-schema validation and Option B matching/normalization can be tested without bypassing production source-SHA gates;
11. keep production source-SHA enforcement before accepting any source override; do not weaken it to make tests easier;
12. retain deterministic `BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED` for preservation failures and `BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE` only for genuinely unavailable exact local templates.

## 5. Mandatory proof

### Always-runnable privacy-safe unit proof

Create template-independent tests in the EXISTING test file. They must run in a clean checkout without owner templates and prove at minimum:
- Unicode/dotted/ASCII-prefixed Relationship forms cannot evade inventory;
- Unicode/prefixed/unknown worksheet direct children cannot evade inventory;
- unconsumed direct-child markup fails closed;
- duplicate relationship IDs fail globally;
- duplicate maxOccurs=1 worksheet children fail independently;
- Target lexical rejection for leading `/`, already-`xl/`, leading `./`, embedded `/./`, `..`, repeated `//`, backslash, percent encoding, URI scheme/authority, query and fragment;
- Option B exact matcher accepts only exact Part B `Sheet1` `<sheetPr/>` in the pinned slot and rejects changed/extra/duplicate/moved/other-sheet/Part-A cases;
- Option B normalizer actually removes the element from returned normalized XML both when dimension is absent and when an exact dimension is already present.

If owner templates are unavailable:
- do not invent/rebuild them;
- exact-template-dependent tests may be explicitly skipped/reported unavailable;
- privacy-safe unit tests MUST still execute and pass;
- do not make the entire test file fail solely because ignored owner binaries are absent.

### Exact-template proof when templates are available

Retain and run:
- exact source SHA validation;
- direct raw `outBufA` / `outBufB` frozen behavior;
- direct raw preservation for A and B with no test-side pre-clean;
- preserved A/B real parity;
- exact dimensions for Part A main, Part B main and Part B Sheet1;
- source/raw byte immutability;
- exact print-area binding and Part B Sheet1 `colsHash` negative;
- Difficulty Level blank temporarily.

### Regression restoration

Restore all still-valid R3-R25/R3-R26 negatives removed in R3-R27, including at minimum:
- counterfeit worksheet-like Type URI;
- duplicate ID across worksheet/non-worksheet types;
- exact Type mismatch with same ID/target;
- leading-slash and already-`xl/` Target aliases;
- backslash and percent-encoded Target aliases;
- standard prefixed Relationship duplicate-ID attempt in addition to dotted/Unicode prefix cases;
- missing predecessor/successor boundary;
- any remaining valid R3-R24/R3-R25/R3-R26 negatives not superseded by approved Option B.

For source-structure cases that cannot pass the exact source-SHA gate by design:
- test the extracted pure structural helper directly;
- separately retain wrong-SHA production-gate proof;
- do not label a SHA-gate rejection as structural proof.

## 6. Frozen / out of scope

DO NOT:
- modify/repair `getNoOpParityBuffers()`;
- publish evidence;
- start reference-image closure;
- start Part A objective insertion closure;
- start Part B competency insertion closure;
- start formula/no-formula authority closure;
- start production sanitizer/XLSX renderer integration;
- generate combined production Excel/PDF;
- change UI;
- access/write/deploy Kintone;
- modify App53/App794/App795/App801 records/schema/ACL/process/groups/password/session;
- perform Live UAT;
- rollback automatically;
- start D3;
- start R3-R29 or another work package;
- invoke Claude;
- declare R3-R28, D2-WP003 or D2 PASS/CLOSED.

## 7. Required execution sequence

Antigravity must:
1. fresh-fetch `ai/antigravity-wp002c` and confirm the current authorization commit is present;
2. read `project-docs/CHAT_HANDOFF.md`;
3. read `project-docs/AI_CONTROL_CENTER.md`;
4. read this `project-docs/AI_ACTIVE_TASK.md`;
5. inspect only the two authorized source/test files and directly required package metadata;
6. implement the smallest correction satisfying this contract;
7. run:

```text
node --check scripts/export/mbo-xlsx-ooxml-feasibility.js
node --check tests/mbo-xlsx-ooxml-feasibility.test.js
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

8. if owner templates are unavailable, run all privacy-safe unit proof and report exact-template limitation honestly;
9. make exactly one bounded implementation/blocker commit;
10. push to `ai/antigravity-wp002c`;
11. STOP and report commit SHA, exact changed files, test results, dependency audit result and blocker, if any.

Antigravity self-report is NOT independent PASS evidence. ChatGPT performs final independent review after the commit reaches Git.

## 8. Stop conditions

STOP immediately if:
- another tracked file must change;
- a new dependency appears necessary;
- satisfying complete XML token inventory requires redesign outside these two files;
- Option B would need widening beyond the approved exact Part B `Sheet1` exception;
- Kintone/Live/deploy/evidence/PDF/renderer/D3 work appears necessary;
- authorization baseline/gate conflicts with newer repository truth.

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
D2-PRESERVATION-PARTB-SHEETPR-DECISION-01 = OPTION B APPROVED / ARCHITECTURE POLICY
D2-WP003-R3-R28-SOURCE-20260902-01 = ACTIVE / ONE-SHOT
CONTROL-PLANE-D2-REVIEW-CORRECTIVE-20-ROUND-20260901 = ACTIVE / ROUND 5 OF 20
ANTIGRAVITY_AUTO_AUTH = NO
CLAUDE_AUTO_REVIEW = NO
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R28-SOURCE-20260902-01
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
NEXT_ACTION = IMPLEMENT D2-WP003-R3-R28 EXACTLY WITHIN THIS ONE-SHOT SOURCE+TEST AUTHORIZATION
AFTER_COMMIT = STOP / CHATGPT INDEPENDENT REVIEW
CLAUDE = STOP / DO NOT INVOKE UNLESS CHATGPT LATER DETERMINES SECOND REVIEW IS MATERIAL
D3 = HOLD
```
