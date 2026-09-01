# AI ACTIVE TASK — D2-WP003-R3-R24 AUTHORIZED

Mode: **BOUNDED ANTIGRAVITY EXECUTION / LOW-CREDIT / SOURCE+TEST ONLY / NO KINTONE / NO DEPLOY**
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
R3-R23_IMPLEMENTATION_COMMIT = 0ca299d9b40e2152d998cd36a23bd8186cd1a5c0
R3-R23_SCOPE_REVIEW = PASS
R3-R23_SOURCE_REVIEW = FAIL / CORRECTIVE REQUIRED
R3-R23_PROOF_REVIEW = FAIL / INCOMPLETE
CONTROL_PLANE_REVIEW_CORRECTIVE_STANDING_AUTH = ACTIVE
CONTROL_PLANE_REVIEW_CORRECTIVE_MAX_ROUNDS = 20
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_USED = 1
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_REMAINING = 19
ANTIGRAVITY_AUTO_AUTH = NO
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R24
WORK_PACKAGE_NAME = STRICT RELATIONSHIP-TARGET + SCHEMA-ORDER + SOURCE-IDENTITY CORRECTIVE
AUTHORIZED_SCOPE = EXISTING FEASIBILITY SOURCE + TEST ONLY
CORRECTIVE_SOURCE_BASELINE_COMMIT = 0ca299d9b40e2152d998cd36a23bd8186cd1a5c0
AUTHORIZATION_BASELINE_HEAD = 948cd9d97779d1a8362f4a11f60c47472097c43a
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R24-SOURCE-20260902-01
AUTHORIZATION_MODE = ONE-SHOT / BOUNDED / DO NOT WIDEN / DO NOT REUSE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
PRIVACY_PURGE_REQUIRED = NO
D3_EXECUTION = HOLD UNTIL D2 PASS / CLOSED
ANTIGRAVITY = AUTHORIZED FOR THIS WP ONLY
```

## 1. Owner authorization

Owner explicitly authorized on 2026-09-02 ICT:

```text
อนุมัติ D2-WP003-R3-R24 ตามขอบเขตที่เสนอ
```

This creates exactly one bounded source/test authorization:

```text
D2-WP003-R3-R24-SOURCE-20260902-01 = ACTIVE / ONE-SHOT
```

It authorizes only the implementation and tests defined below. It does not authorize evidence publication, Kintone access/write, deploy, Live UAT, rollback, D3, later D2 work packages or scope expansion.

## 2. Why R3-R24 is required

Independent R3-R23 review proved the current preservation path cannot pass because:

1. source and observed worksheet relationship targets are resolved independently but exact target equality is not required, allowing real swapped/cross-sheet targets;
2. missing `<dimension>` is inserted immediately after `<worksheet>`, which can place it before an existing `<sheetPr>` and violate the required schema order;
3. `sourceBufOverride` can bypass exact owner-template SHA verification;
4. invalid `partKey` values can fall through to Part B behavior instead of failing closed;
5. mandatory duplicate/ambiguous/actual wrong-target/malformed-source negatives are incomplete.

R3-R24 is a strict bounded correction only. Do not redesign workbook preservation.

## 3. Exact write scope

Antigravity may modify ONLY:

- `scripts/export/mbo-xlsx-ooxml-feasibility.js`
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

Read-only as needed:

- `package.json`
- `package-lock.json`
- current governance/baseline documents
- exact ignored owner templates only after SHA verification

No new file, dependency, generated workbook, PDF, image/media or evidence document.

If any additional tracked file appears necessary, STOP without changing it and report the blocker to ChatGPT/Owner.

## 4. Mandatory implementation requirements

R3-R24 MUST:

1. accept only exact `partKey` values `A` or `B`; missing/other values fail closed;
2. enforce the exact expected Part A/Part B SHA-256 on every source-buffer path, including `sourceBufOverride` or any test-injection path, before trusting source structure;
3. parse worksheet relationships fail-closed independent of XML attribute order;
4. require exactly one worksheet relationship for each sheet `r:id`;
5. require exact worksheet relationship type, non-external target, unique relationship ID and unique normalized worksheet target;
6. require exact source/observed sheet name, order, relationship ID binding and normalized target equality;
7. reject missing, duplicate, ambiguous, swapped, cross-sheet, non-worksheet or external targets;
8. restore the exact source `<dimension .../>` only at the schema-valid source-equivalent slot: after optional `<sheetPr>` when present and before later worksheet children;
9. fail closed if source or observed XML cannot prove one unique schema-valid insertion point;
10. reject missing/multiple/conflicting source dimensions and multiple/conflicting observed dimensions;
11. preserve raw/source buffer immutability and introduce no workbook fingerprint change other than exact dimension restoration;
12. keep `getNoOpParityBuffers()` completely frozen as direct raw `xlsx-populate.outputAsync()` output with NO source-to-output repair;
13. retain deterministic `BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED` for preservation-path failures;
14. do not disguise exact template source-identity failures as a successful preservation result.

Accepted owner-template SHA-256 remains:

```text
PART_A = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
```

## 5. Mandatory tests / proof in the authorized test file

### Positive

Prove, when exact owner templates are available:
- exact SHA-verified Part A and Part B sources only;
- exact source Part A/Part B still validate TRUE;
- raw Part A/Part B remain unchanged and fail the real parity validator as already accepted;
- preserved Part A/Part B pass the real parity validator;
- exact dimensions are restored for Part A main, Part B main and Part B `Sheet1`;
- every restored dimension is after optional `sheetPr` and before later worksheet children;
- complete fingerprint parity except exact dimensions;
- source/raw byte hashes are unchanged.

### Mandatory negative cases

Each must fail deterministically and return no partially preserved buffer:
- invalid/missing `partKey`;
- arbitrary/wrong-SHA `sourceBufOverride`;
- missing relationship;
- duplicate relationship ID;
- duplicate normalized worksheet target;
- actual source/observed relationship-target swap while sheet names/order remain unchanged;
- cross-sheet target;
- non-worksheet relationship target/type;
- external target;
- missing/multiple/conflicting source dimension;
- multiple/conflicting observed dimension;
- missing/ambiguous/schema-invalid insertion point;
- malformed source buffer/XML;
- malformed observed buffer/XML.

### Regression preservation

Do not regress accepted R3-R22 foundations:
- source-backed mutation negatives use exact source baselines;
- exact per-sheet print-area binding by `localSheetId` + actual zero-based worksheet index;
- Part B `Sheet1.colsHash` negative proof;
- raw result pinning;
- R3-R17 header/privacy/typed-metadata and zero-sensitive-token tests;
- existing image/insertion/formula feasibility tests;
- Difficulty Level remains blank temporarily.

## 6. Explicitly frozen / out of scope

DO NOT:
- repair or modify `getNoOpParityBuffers()`;
- publish evidence documents/artifacts;
- begin reference-image closure;
- begin Part A objective insertion closure;
- begin Part B competency insertion closure;
- begin formula/no-formula authority closure;
- begin production sanitizer/XLSX renderer integration;
- generate combined production Excel or PDF;
- change UI;
- access/write/deploy Kintone;
- change App53/App794/App795/App801 records/schema/ACL/process/groups/password/session;
- perform Live UAT;
- rollback automatically;
- start D3;
- start R3-R25 or another work package;
- declare R3-R24, D2-WP003 or D2 PASS/CLOSED.

## 7. Required execution sequence

Antigravity must:

1. fresh-fetch `ai/antigravity-wp002c` and confirm it starts from the current authorization HEAD or a direct descendant containing this authorization;
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

8. if ignored exact owner templates are unavailable, do not invent/template-rebuild them; run all privacy-safe synthetic/unit proof available and report the exact-template limitation honestly;
9. commit exactly one bounded implementation/blocker commit;
10. push it to `ai/antigravity-wp002c`;
11. STOP and report commit SHA, exact changed files, test results, dependency audit result and any blocker.

Antigravity self-report is NOT independent PASS evidence. ChatGPT performs the independent review after the commit reaches Git.

## 8. Stop conditions

STOP immediately if:
- another tracked file must change;
- a new dependency appears necessary;
- owner-template identity cannot be verified where required;
- satisfying the correction would require redesign beyond this preservation path;
- Kintone/Live/deploy/evidence/PDF/renderer/D3 work appears necessary;
- authorization baseline/gate conflicts with newer repository truth.

No automatic rollback.

## 9. Authorization ledger

```text
D2-WP003-R3-R22-TEST-20260901-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP003-R3-R22-EVIDENCE-20260901-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP003-R3-R23-SOURCE-20260901-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
CONTROL-PLANE-D2-REVIEW-CORRECTIVE-20-ROUND-20260901 = ACTIVE / ROUND 1 OF 20
D2-WP003-R3-R24-SOURCE-20260902-01 = ACTIVE / ONE-SHOT
ANTIGRAVITY_AUTO_AUTH = NO
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R24-SOURCE-20260902-01
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
NEXT_ACTION = IMPLEMENT D2-WP003-R3-R24 EXACTLY WITHIN THIS ONE-SHOT SOURCE+TEST AUTHORIZATION
AFTER_COMMIT = STOP / CHATGPT INDEPENDENT REVIEW
D3 = HOLD
```
