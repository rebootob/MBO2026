# AI ACTIVE TASK — D2-WP003-R3-R26 AUTHORIZED

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
D2-WP003-R3-R24 = REVIEWED / NOT PASS / NOT CLOSED
D2-WP003-R3-R25 = REVIEWED / NOT PASS / NOT CLOSED
R3-R25_IMPLEMENTATION_COMMIT = 60b24f39b78013d37fe210192bb97876e0184638
R3-R25_SCOPE_REVIEW = PASS
R3-R25_SOURCE_REVIEW = FAIL / CORRECTIVE REQUIRED
R3-R25_PROOF_REVIEW = FAIL / REGRESSION + INCOMPLETE
CONTROL_PLANE_REVIEW_CORRECTIVE_STANDING_AUTH = ACTIVE
CONTROL_PLANE_REVIEW_CORRECTIVE_MAX_ROUNDS = 20
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_USED = 3
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_REMAINING = 17
ANTIGRAVITY_AUTO_AUTH = NO
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R26
WORK_PACKAGE_NAME = STRICT TARGET LEXICAL IDENTITY + PROOF REGRESSION RESTORE CORRECTIVE
AUTHORIZED_SCOPE = EXISTING FEASIBILITY SOURCE + TEST ONLY
CORRECTIVE_SOURCE_BASELINE_COMMIT = 60b24f39b78013d37fe210192bb97876e0184638
AUTHORIZATION_BASELINE_HEAD = 6dd0d5d10c054438f40cc665ef653c5f6166efa3
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R26-SOURCE-20260902-01
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
อนุมัติ D2-WP003-R3-R26 ตามขอบเขตที่เสนอ
```

This creates exactly one bounded source/test authorization:

```text
D2-WP003-R3-R26-SOURCE-20260902-01 = ACTIVE / ONE-SHOT
```

It authorizes only the implementation and tests defined below. It does not authorize evidence publication, Kintone access/write, deploy, Live UAT, rollback, D3, later D2 work packages or scope expansion.

## 2. Why R3-R26 is required

Independent R3-R25 review proved remaining preservation-path defects and a proof regression:

1. target lexical identity remains fail-open because leading-slash and already-`xl/` aliases can normalize into the same ZIP path as the owner source;
2. prefixed Relationship elements can be skipped by the global relationship parser;
3. prefixed worksheet top-level elements can be skipped by the top-level-child parser;
4. observed-only `sheetPr` can be silently ignored even though only source `dimension` omission is authorized;
5. multiple valid R3-R24 preservation negatives were removed despite the explicit regression-preservation requirement.

R3-R26 is the smallest bounded correction. Do not redesign workbook preservation.

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

R3-R26 MUST:

1. preserve accepted R3-R25 exact `A`/`B` part-key, source-SHA, exact worksheet Type, global duplicate-ID and exact relationship-tuple gates;
2. preserve the exact raw relationship `Target` lexical form from source and observed separately from the ZIP lookup path;
3. require exact source/observed raw `Target` equality for each worksheet relationship before ZIP lookup;
4. reject leading slash, `./`, embedded `/./`, `..`, repeated slash, backslash, percent-encoded slash/dot-segment aliases, URI scheme/authority, query/fragment and any non-canonical worksheet target lexical form;
5. compute ZIP lookup path only after lexical validation, without treating `Target="xl/..."` as equivalent to source `Target="worksheets/..."`;
6. parse or explicitly reject every Relationship element including namespace-prefixed forms so duplicate IDs cannot be hidden from the global inventory;
7. parse or explicitly reject every worksheet top-level child including namespace-prefixed forms so structural elements cannot be silently skipped;
8. remove the unauthorized observed-only `sheetPr` exception; observed top-level child order must equal exact source order with only exact source `dimension` omitted for restoration;
9. retain exact predecessor/successor restoration and generic schema-order rejection;
10. preserve raw/source buffer immutability and introduce no workbook fingerprint change other than exact dimension restoration;
11. keep `getNoOpParityBuffers()` completely frozen as direct raw `xlsx-populate.outputAsync()` output with NO source-to-output repair;
12. retain deterministic `BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED` for preservation-path failures and return no partially preserved buffer;
13. do not disguise exact template source-identity failures as successful preservation.

Accepted owner-template SHA-256 remains:

```text
PART_A = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
```

## 5. Mandatory tests / proof in the authorized test file

### Restore all valid preservation negatives first

Restore ALL valid R3-R24 preservation negatives before adding/retaining R3-R25/R3-R26 negatives.

Mandatory retained/restored negatives include:
- invalid AND missing `partKey`;
- wrong-SHA source override;
- missing relationship;
- duplicate relationship ID;
- duplicate worksheet target;
- actual relationship-target swap with sheet names/order unchanged;
- cross-sheet mapping;
- non-worksheet Type/target;
- external target/TargetMode;
- missing/multiple source dimension;
- conflicting/multiple observed dimension;
- malformed source buffer/XML;
- malformed observed buffer/XML.

### Mandatory R3-R25/R3-R26 additions

Each must fail deterministically before returning a preserved buffer:
- counterfeit worksheet-like Type URI;
- duplicate ID across worksheet/non-worksheet types;
- exact Type mismatch with same ID/target;
- leading-slash Target alias;
- already-`xl/` Target alias;
- `./` and `/./` Target aliases;
- repeated-slash/backslash target aliases;
- percent-encoded alias/dot-segment form;
- URI scheme/authority/query/fragment target form;
- prefixed Relationship duplicate-ID attempt;
- prefixed/unknown worksheet top-level child attempt;
- observed `sheetPr` not present in source;
- reordered `sheetPr`;
- missing predecessor/successor boundary;
- duplicate/ambiguous schema-boundary case.

### Positive / regression preservation

Prove, when exact owner templates are available:
- exact source Part A/Part B validate TRUE;
- raw Part A/Part B remain frozen and fail real parity as accepted;
- preserved Part A/Part B pass real parity;
- Part A main, Part B main and Part B `Sheet1` dimensions equal source exactly;
- dimensions occupy the exact source-equivalent predecessor/successor slot;
- no non-dimension fingerprint change;
- source/raw hashes remain byte-identical;
- all R3-R22 and R3-R17 accepted tests remain present;
- exact per-sheet print-area binding and Part B `Sheet1.colsHash` negative proof remain present;
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
- start R3-R27 or another work package;
- declare R3-R26, D2-WP003 or D2 PASS/CLOSED.

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
D2-WP003-R3-R24-SOURCE-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R3-R25-SOURCE-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
CONTROL-PLANE-D2-REVIEW-CORRECTIVE-20-ROUND-20260901 = ACTIVE / ROUND 3 OF 20
D2-WP003-R3-R26-SOURCE-20260902-01 = ACTIVE / ONE-SHOT
ANTIGRAVITY_AUTO_AUTH = NO
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R26-SOURCE-20260902-01
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
NEXT_ACTION = IMPLEMENT D2-WP003-R3-R26 EXACTLY WITHIN THIS ONE-SHOT SOURCE+TEST AUTHORIZATION
AFTER_COMMIT = STOP / CHATGPT INDEPENDENT REVIEW
D3 = HOLD
```
