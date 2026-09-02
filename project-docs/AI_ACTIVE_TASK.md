# AI ACTIVE TASK — D2-WP003-R3-R27 AUTHORIZED

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
R3-R26_IMPLEMENTATION_COMMIT = b8cd007483e6e3ffbdc5767571e4f90d34973d2b
D2-PRESERVATION-PARTB-SHEETPR-DECISION-01 = OPTION B APPROVED
PRESERVATION_POLICY = NARROW DETERMINISTIC ALLOWED-DRIFT
CONTROL_PLANE_REVIEW_CORRECTIVE_STANDING_AUTH = ACTIVE
CONTROL_PLANE_REVIEW_CORRECTIVE_MAX_ROUNDS = 20
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_USED = 4
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_REMAINING = 16
ANTIGRAVITY_AUTO_AUTH = NO
CLAUDE_AUTO_REVIEW = NO
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R27
WORK_PACKAGE_NAME = NARROW PART B SHEETPR ALLOWED-DRIFT + COMPLETE XML INVENTORY CORRECTIVE
AUTHORIZED_SCOPE = EXISTING FEASIBILITY SOURCE + TEST ONLY
CORRECTIVE_SOURCE_BASELINE_COMMIT = b8cd007483e6e3ffbdc5767571e4f90d34973d2b
AUTHORIZATION_BASELINE_HEAD = 8b5582bd3c9ba4cf5e92cbad47c10e2777e07a06
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R27-SOURCE-20260902-01
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
อนุมัติ D2-WP003-R3-R27 ตามขอบเขตที่เสนอ
```

This creates exactly one bounded source/test authorization:

```text
D2-WP003-R3-R27-SOURCE-20260902-01 = ACTIVE / ONE-SHOT
```

It authorizes only the implementation and tests defined below. It does not authorize evidence publication, Kintone access/write, deploy, Live UAT, rollback, D3, R3-R28, another D2 work package, Claude execution, or scope expansion.

## 2. Governing architecture decision

The Owner already approved:

```text
DECISION_ID = D2-PRESERVATION-PARTB-SHEETPR-DECISION-01
DECISION = OPTION B
STATUS = APPROVED / RECORDED
POLICY = NARROW DETERMINISTIC ALLOWED-DRIFT
```

Approved policy boundaries:
- direct raw Part B may contain exactly one specifically proven deterministic xlsx-populate-generated `sheetPr` drift in `Sheet1`;
- this is NOT generic `sheetPr` tolerance;
- source must lack the allowed element;
- the raw observed element must match one exact pinned structure/fingerprint derived from exact SHA-verified owner-template direct round-trip evidence;
- the allowed element must occur in the exact pinned worksheet and exact pinned slot;
- normalization/removal must happen only inside `preserveExactWorkbookDimensions()` on its working copy, never in test setup and never by changing caller raw/source buffers;
- modified, extra, duplicate, reordered, moved, other-sheet or Part-A `sheetPr` must fail closed;
- all other non-dimension drift remains forbidden.

## 3. Exact write scope

Antigravity may modify ONLY:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

Read-only as needed:
- `package.json`, `package-lock.json`;
- current governance/baseline documents;
- exact ignored owner templates only after SHA verification.

No new file, dependency, generated workbook, evidence document, PDF, image/media, Kintone, deploy or D3 change.

If another tracked file appears necessary, STOP without changing it and report the blocker.

## 4. Mandatory source correction

R3-R27 MUST:

1. preserve all accepted R3-R26 exact `A`/`B` part-key, source-SHA, strict raw relationship Target, exact worksheet Type, global duplicate-ID and exact relationship-tuple gates;
2. keep raw `getNoOpParityBuffers()` completely frozen and unrepaired;
3. derive the one allowed Part B `Sheet1` injected `sheetPr` structure/fingerprint only from exact SHA-verified owner-template direct round-trip evidence; if exact identity cannot be established, STOP and report blocker rather than inventing an allowlist;
4. pin that allowed drift as an exact deterministic allowlist: exact part `B`, exact sheet `Sheet1`, source has zero matching `sheetPr`, observed has exactly one matching pinned element, exact pinned top-level slot and exact pinned structure/value/fingerprint;
5. perform allowed-drift validation and normalization/removal only inside `preserveExactWorkbookDimensions()` on the working preservation copy before exact source-minus-dimension structural comparison;
6. never mutate the caller's source or raw buffers;
7. reject arbitrary, modified, extra, duplicate, reordered, moved or differently structured observed-only `sheetPr` deterministically;
8. reject any observed-only `sheetPr` in Part A or any Part B sheet other than the exact allowed `Sheet1` case;
9. after the single approved normalization, require exact source top-level child order with only exact source `dimension` omitted before restoration; all other non-dimension drift remains fail-closed;
10. replace regex-only incomplete XML inventory with coverage-first parsing/gap validation that cannot silently skip any direct Relationship child or worksheet top-level start element because of QName characters/prefix forms; unknown or namespace-prefixed direct children must be explicitly rejected unless the exact source contract permits them;
11. reject duplicate schema child names independently where the ECMA-376 slot is maxOccurs=1, not merely by incidental source/observed sequence mismatch;
12. retain deterministic `BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED` and return no partially preserved buffer on any failure;
13. retain exact source identity failures and privacy boundaries without masking them as preservation success.

Accepted owner-template SHA-256 remains:

```text
PART_A = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
```

## 5. Mandatory proof

### Direct raw positive proof

When exact owner templates are available:
- exact source Part A/Part B validate TRUE;
- raw `outBufA` and raw `outBufB` remain byte-identical and continue to fail the real parity validator before preservation as already accepted;
- `preserveExactWorkbookDimensions(outBufA, 'A')` passes without pre-cleaning;
- **`preserveExactWorkbookDimensions(outBufB, 'B')` must pass using the direct raw buffer with NO test-side deletion or pre-cleaning**;
- Part B normalization of the one allowed `Sheet1` `sheetPr` occurs only inside the preservation function;
- preserved Part A/Part B pass real parity;
- Part A main, Part B main and Part B `Sheet1` dimensions equal source exactly;
- no non-dimension fingerprint change remains after the approved internal normalization plus dimension restoration;
- source/raw hashes remain byte-identical.

### Allowed-drift negatives

Must prove deterministic rejection of:
- changed attribute/value/content of the pinned allowed `sheetPr`;
- second/duplicate `sheetPr`;
- moved/reordered allowed `sheetPr`;
- same `sheetPr` on Part B main sheet;
- same `sheetPr` on Part A;
- unknown/different observed-only `sheetPr`;
- source unexpectedly containing the allowlisted element when the policy expects absence.

### XML-inventory / schema negatives

Must explicitly prove:
- namespace prefix containing a dot or another valid QName character cannot evade Relationship inventory;
- unknown/prefixed worksheet top-level child cannot be silently skipped;
- duplicate top-level maxOccurs=1 schema child rejects independently;
- repeated `//` Target alias;
- leading `./` Target alias;
- embedded `/./` Target alias;
- full URI scheme/authority Target form;
- query Target form;
- fragment Target form;
- all restored R3-R24/R3-R25/R3-R26 negatives remain present and effective.

### Privacy-safe proof when owner templates are unavailable

- do not invent/rebuild owner templates;
- run privacy-safe synthetic/unit proof for pure Target lexical validation, Relationship inventory coverage, worksheet-child inventory coverage, duplicate-schema validation and exact allowlist matcher/normalizer where these can be tested without weakening production source-SHA gates;
- exact-template-dependent proof must be reported unavailable rather than claimed PASS.

## 6. Frozen / out of scope

DO NOT:
- modify or repair `getNoOpParityBuffers()`;
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
- start R3-R28 or another work package;
- invoke Claude;
- declare R3-R27, D2-WP003 or D2 PASS/CLOSED.

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

8. if exact owner templates are unavailable, run all privacy-safe synthetic/unit proof possible and report the exact-template limitation honestly;
9. make exactly one bounded implementation/blocker commit;
10. push to `ai/antigravity-wp002c`;
11. STOP and report commit SHA, exact changed files, test results, dependency audit result and blocker, if any.

Antigravity self-report is NOT independent PASS evidence. ChatGPT performs final independent review after the commit reaches Git.

## 8. Stop conditions

STOP immediately if:
- another tracked file must change;
- a new dependency appears necessary;
- exact allowlist identity cannot be derived from SHA-verified owner-template round-trip evidence;
- satisfying the correction would require redesign outside Option B preservation scope;
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
D2-PRESERVATION-PARTB-SHEETPR-DECISION-01 = OPTION B APPROVED / ARCHITECTURE POLICY
D2-WP003-R3-R27-SOURCE-20260902-01 = ACTIVE / ONE-SHOT
CONTROL-PLANE-D2-REVIEW-CORRECTIVE-20-ROUND-20260901 = ACTIVE / ROUND 4 OF 20
ANTIGRAVITY_AUTO_AUTH = NO
CLAUDE_AUTO_REVIEW = NO
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R27-SOURCE-20260902-01
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
NEXT_ACTION = IMPLEMENT D2-WP003-R3-R27 EXACTLY WITHIN THIS ONE-SHOT SOURCE+TEST AUTHORIZATION
AFTER_COMMIT = STOP / CHATGPT INDEPENDENT REVIEW
CLAUDE = STOP / DO NOT INVOKE UNLESS CHATGPT LATER DETERMINES SECOND REVIEW IS MATERIAL
D3 = HOLD
```
