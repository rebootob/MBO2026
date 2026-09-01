# AI ACTIVE TASK — D2-WP003-R3-R25 AUTHORIZED

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
R3-R24_IMPLEMENTATION_COMMIT = cb5276d48c0386e2d890604b57697e6bf49ed85b
R3-R24_SCOPE_REVIEW = PASS
R3-R24_SOURCE_REVIEW = FAIL / CORRECTIVE REQUIRED
R3-R24_PROOF_REVIEW = FAIL / INCOMPLETE
CONTROL_PLANE_REVIEW_CORRECTIVE_STANDING_AUTH = ACTIVE
CONTROL_PLANE_REVIEW_CORRECTIVE_MAX_ROUNDS = 20
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_USED = 2
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_REMAINING = 18
ANTIGRAVITY_AUTO_AUTH = NO
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R25
WORK_PACKAGE_NAME = EXACT RELATIONSHIP-TYPE + SCHEMA-SLOT FAIL-CLOSED CORRECTIVE
AUTHORIZED_SCOPE = EXISTING FEASIBILITY SOURCE + TEST ONLY
CORRECTIVE_SOURCE_BASELINE_COMMIT = cb5276d48c0386e2d890604b57697e6bf49ed85b
AUTHORIZATION_BASELINE_HEAD = 260e5aee21a6c6580194a4ad66ed4178dba61ed4
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R25-SOURCE-20260902-01
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
อนุมัติ D2-WP003-R3-R25 ตามขอบเขตที่เสนอ
```

This creates exactly one bounded source/test authorization:

```text
D2-WP003-R3-R25-SOURCE-20260902-01 = ACTIVE / ONE-SHOT
```

It authorizes only the implementation and tests defined below. It does not authorize evidence publication, Kintone access/write, deploy, Live UAT, rollback, D3, later D2 work packages or scope expansion.

## 2. Why R3-R25 is required

Independent R3-R24 review proved the strict preservation path still cannot pass because:

1. worksheet relationship type is accepted by suffix matching rather than exact canonical relationship-type equality;
2. duplicate relationship IDs are checked only after worksheet filtering, not globally across all relationships;
3. source/observed relationship equality does not bind the complete Type/TargetMode semantics;
4. dimension insertion searches for `<sheetPr>` anywhere instead of proving the exact source-equivalent top-level child slot;
5. mandatory counterfeit-type, cross-type duplicate-ID and schema-invalid insertion-point negatives are absent.

R3-R25 is the smallest bounded correction for these remaining preservation-path defects. Do not redesign workbook preservation.

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

R3-R25 MUST:

1. preserve the accepted R3-R24 exact `partKey` values `A`/`B` and exact expected source SHA-256 gates on every source-buffer path;
2. parse all workbook relationships attribute-order-independently before filtering and reject duplicate relationship IDs globally across all relationship types;
3. for every workbook sheet `r:id`, require exactly one relationship whose Type equals the exact canonical worksheet relationship Type used by the verified owner source; suffix matching such as `endsWith('/worksheet')` is forbidden;
4. require internal/non-external worksheet relationship semantics and exact source/observed tuple equality for relationship ID, exact Type, normalized target and external-mode state;
5. normalize worksheet targets strictly and reject path traversal, alias/ambiguous normalization, duplicate normalized targets, cross-sheet mappings, counterfeit worksheet types, external targets and missing targets fail-closed;
6. derive the source dimension slot from the exact source worksheet top-level child order, not from an unconstrained search for `<sheetPr>`;
7. require the observed worksheet top-level child order to equal the source top-level child order with only the exact source `<dimension>` omitted when restoration is needed;
8. insert the exact source `<dimension .../>` only at the exact source-equivalent predecessor/successor boundary;
9. reject missing, duplicate, reordered or ambiguous `sheetPr`/neighbor boundaries and reject any case where the restored dimension would occur after a later schema child;
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

### Positive

Prove, when exact owner templates are available:
- exact SHA-verified Part A and Part B sources only;
- exact source Part A/Part B still validate TRUE;
- raw Part A/Part B remain unchanged and fail the real parity validator as already accepted;
- preserved Part A/Part B pass the real parity validator;
- exact dimensions are restored for Part A main, Part B main and Part B `Sheet1`;
- every restored dimension occupies the exact source-equivalent top-level child slot, including predecessor and successor checks;
- complete fingerprint parity except exact dimensions;
- source/raw byte hashes are unchanged.

### Mandatory negative additions

Preserve the valid R3-R24/R3-R22 negatives and add explicit proof that each of these fails deterministically before returning a preserved buffer:
- worksheet-like counterfeit relationship Type URI that still ends with `/worksheet`;
- duplicate relationship ID where one duplicate is worksheet and one is non-worksheet;
- source/observed relationship Type mismatch with the same ID and target;
- external/TargetMode mismatch;
- target alias/path traversal/ambiguous normalization;
- observed `<sheetPr>` moved after `sheetData` or another later top-level child;
- missing expected source-equivalent predecessor/successor boundary;
- duplicate/ambiguous top-level `sheetPr` or schema-slot boundary.

### Regression preservation

Do not regress accepted R3-R22/R3-R24 foundations:
- exact `A`/`B` partKey and source-SHA enforcement;
- source-backed mutation negatives use exact source baselines;
- exact per-sheet print-area binding by `localSheetId` + actual zero-based worksheet index;
- Part B `Sheet1.colsHash` negative proof;
- raw result pinning and raw no-op unrepaired behavior;
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
- start R3-R26 or another work package;
- declare R3-R25, D2-WP003 or D2 PASS/CLOSED.

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
CONTROL-PLANE-D2-REVIEW-CORRECTIVE-20-ROUND-20260901 = ACTIVE / ROUND 2 OF 20
D2-WP003-R3-R25-SOURCE-20260902-01 = ACTIVE / ONE-SHOT
ANTIGRAVITY_AUTO_AUTH = NO
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R25-SOURCE-20260902-01
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
NEXT_ACTION = IMPLEMENT D2-WP003-R3-R25 EXACTLY WITHIN THIS ONE-SHOT SOURCE+TEST AUTHORIZATION
AFTER_COMMIT = STOP / CHATGPT INDEPENDENT REVIEW
D3 = HOLD
```
