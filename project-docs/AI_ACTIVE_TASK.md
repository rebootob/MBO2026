# AI ACTIVE TASK — D2 CONTINUITY / OPTION B APPROVED / R3-R27 PROPOSED

Mode: **CONTROL PLANE / OWNER PRESERVATION POLICY DECIDED / R3-R27 PROPOSED / NO KINTONE / NO DEPLOY**  
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
R3-R26_IMPLEMENTATION_COMMIT = b8cd007483e6e3ffbdc5767571e4f90d34973d2b
R3-R26_SCOPE_REVIEW = PASS
R3-R26_SOURCE_REVIEW = FAIL / PRESERVATION-INVARIANT CONFLICT + XML SCANNER GAP
R3-R26_PROOF_REVIEW = FAIL / CONTRACT-BYPASS + INCOMPLETE
D2-PRESERVATION-PARTB-SHEETPR-DECISION-01 = OPTION B APPROVED
PRESERVATION_POLICY = NARROW DETERMINISTIC ALLOWED-DRIFT
CONTROL_PLANE_REVIEW_CORRECTIVE_STANDING_AUTH = ACTIVE
CONTROL_PLANE_REVIEW_CORRECTIVE_MAX_ROUNDS = 20
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_USED = 4
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_REMAINING = 16
ANTIGRAVITY_AUTO_AUTH = NO
ACTIVE_WORK_PACKAGE = NONE
PROPOSED_WORK_PACKAGE = D2-WP003-R3-R27
PROPOSED_WORK_PACKAGE_NAME = NARROW PART B SHEETPR ALLOWED-DRIFT + COMPLETE XML INVENTORY CORRECTIVE
PROPOSED_SCOPE = EXISTING FEASIBILITY SOURCE + TEST ONLY
CORRECTIVE_BASELINE_COMMIT = b8cd007483e6e3ffbdc5767571e4f90d34973d2b
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
PRIVACY_PURGE_REQUIRED = NO
D3_EXECUTION = HOLD UNTIL D2 PASS / CLOSED
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP / NOT NEEDED AT THIS GATE
```

## 1. Owner architecture decision — APPROVED

Owner explicitly approved on 2026-09-02 ICT:

```text
อนุมัติ Option B — D2-PRESERVATION-PARTB-SHEETPR-DECISION-01
```

Decision result:

```text
DECISION_ID = D2-PRESERVATION-PARTB-SHEETPR-DECISION-01
DECISION = OPTION B
STATUS = APPROVED / RECORDED
POLICY = NARROW DETERMINISTIC ALLOWED-DRIFT
```

This decision changes the preservation policy only. It does NOT authorize Antigravity implementation and does NOT create a source-change authorization.

Approved policy:
- direct raw Part B may contain exactly one specifically proven deterministic xlsx-populate-generated `sheetPr` drift in `Sheet1`;
- this exception is not generic `sheetPr` tolerance;
- source must lack the allowed element;
- the raw observed element must match one exact pinned structure/fingerprint derived from exact SHA-verified owner-template round-trip evidence;
- the allowed element must occur in the exact pinned worksheet and exact pinned slot;
- normalization/removal must happen inside `preserveExactWorkbookDimensions()` on its working copy, never in test setup and never by changing the raw input buffer;
- any modified, extra, duplicate, reordered or differently located `sheetPr` must fail closed;
- every other non-dimension drift remains forbidden;
- Part A receives no allowed-drift expansion.

## 2. Why R3-R27 is proposed

R3-R26 proved the strict source-minus-dimension invariant conflicts with actual direct Part B xlsx-populate output. The positive Part B proof only passed after pre-cleaning a derivative buffer outside the preservation function.

Option B resolves that architecture conflict narrowly. R3-R27 is the smallest implementation needed to apply the approved exception inside the preservation path while closing the remaining XML-inventory and proof gaps.

## 3. Proposed R3-R27 — NOT AUTHORIZED

```text
PROPOSED_WORK_PACKAGE = D2-WP003-R3-R27
PROPOSED_WORK_PACKAGE_NAME = NARROW PART B SHEETPR ALLOWED-DRIFT + COMPLETE XML INVENTORY CORRECTIVE
PROPOSED_SCOPE = EXISTING FEASIBILITY SOURCE + TEST ONLY
PROPOSED_STATUS = WAIT OWNER AUTHORIZATION
EXECUTOR = NONE
```

No Antigravity or Claude execution is authorized by this proposal.

## 4. Proposed exact write scope if authorized

Modify ONLY:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

Read-only as needed:
- `package.json`, `package-lock.json`;
- current governance/baseline documents;
- exact ignored owner templates only after SHA verification.

No new file, dependency, generated workbook, evidence document, PDF, image/media, Kintone, deploy or D3 change.

## 5. Proposed mandatory source correction

If explicitly authorized, R3-R27 MUST:

1. preserve all accepted R3-R26 exact `A`/`B` part-key, source-SHA, strict raw relationship Target, exact worksheet Type, global duplicate-ID and exact relationship-tuple gates;
2. preserve raw `getNoOpParityBuffers()` completely frozen and unrepaired;
3. derive the one allowed Part B `Sheet1` injected `sheetPr` structure/fingerprint only from exact SHA-verified owner-template direct round-trip evidence; if exact identity cannot be established, STOP and report blocker rather than inventing an allowlist;
4. pin that allowed drift as an exact deterministic allowlist: exact part `B`, exact sheet `Sheet1`, source has zero matching `sheetPr`, observed has exactly one matching pinned element, exact pinned top-level slot and exact pinned structure/value/fingerprint;
5. perform allowed-drift validation and normalization/removal only inside `preserveExactWorkbookDimensions()` on the working preservation copy before exact source-minus-dimension structural comparison;
6. never mutate the caller's source or raw buffers;
7. reject arbitrary, modified, extra, duplicate, reordered, moved or differently structured observed-only `sheetPr` deterministically;
8. reject any observed-only `sheetPr` in Part A or any Part B sheet other than the exact allowed `Sheet1` case;
9. after the one approved normalization, require exact source top-level child order with only exact source `dimension` omitted before restoration; all other non-dimension drift remains fail-closed;
10. replace regex-only incomplete XML inventory with coverage-first parsing/gap validation that cannot silently skip any direct Relationship child or worksheet top-level start element because of QName characters/prefix forms; unknown or namespace-prefixed direct children must be explicitly rejected unless exact source contract permits them;
11. reject duplicate schema child names independently where the ECMA-376 slot is maxOccurs=1, not merely by incidental source/observed sequence mismatch;
12. retain deterministic `BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED` and return no partially preserved buffer on any failure;
13. retain exact source identity failures and privacy boundaries without masking them as preservation success.

## 6. Proposed mandatory proof

### Direct raw positive proof

When exact owner templates are available:
- exact source Part A/Part B validate TRUE;
- raw `outBufA` and raw `outBufB` remain byte-identical and continue to fail the real parity validator before preservation as already accepted;
- `preserveExactWorkbookDimensions(outBufA, 'A')` passes without any pre-cleaning;
- **`preserveExactWorkbookDimensions(outBufB, 'B')` must pass using the direct raw buffer with NO test-side deletion or pre-cleaning**;
- Part B normalization of the one allowed `Sheet1` `sheetPr` happens only inside the preservation function;
- preserved Part A/Part B pass real parity;
- Part A main, Part B main and Part B `Sheet1` dimensions equal source exactly;
- no non-dimension fingerprint change remains after the approved internal normalization + dimension restoration;
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
- namespace prefix containing a dot or other valid QName character cannot evade Relationship inventory;
- unknown/prefixed worksheet top-level child cannot be silently skipped;
- duplicate top-level maxOccurs=1 schema child rejects independently;
- repeated `//` Target alias;
- leading `./` Target alias;
- embedded `/./` Target alias;
- full URI scheme/authority Target form;
- query and fragment Target forms;
- all R3-R24/R3-R25/R3-R26 restored negatives remain present.

### Privacy-safe proof when owner templates are unavailable

- do not invent/rebuild owner templates;
- run privacy-safe synthetic/unit proof for the pure Target lexical validator, Relationship inventory coverage, worksheet-child inventory coverage, duplicate-schema validator and exact allowlist matcher/normalizer where those helpers can be tested without weakening production source-SHA gates;
- report exact-template-dependent proof as unavailable rather than claiming PASS.

## 7. Frozen / out of scope

Do NOT start evidence publication, reference-image closure, Part A objective insertion closure, Part B competency insertion closure, formula authority, production sanitizer/renderer, combined Excel/PDF, UI, Kintone, deploy, Live UAT, rollback, D3, R3-R28 or another WP.

Claude second review is not required automatically. Use Claude again only if ChatGPT finds material ambiguity after an implementation reaches Git.

## 8. Expected execution sequence if later authorized

```text
fresh-fetch authorization HEAD
read CHAT_HANDOFF -> AI_CONTROL_CENTER -> AI_ACTIVE_TASK
modify only the two authorized files
node --check scripts/export/mbo-xlsx-ooxml-feasibility.js
node --check tests/mbo-xlsx-ooxml-feasibility.test.js
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
exactly one bounded implementation/blocker commit
push
STOP
```

Antigravity must not self-declare PASS/CLOSED.

## 9. Authorization ledger

```text
D2-WP003-R3-R22-TEST-20260901-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP003-R3-R22-EVIDENCE-20260901-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP003-R3-R23-SOURCE-20260901-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R3-R24-SOURCE-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R3-R25-SOURCE-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R3-R26-SOURCE-20260902-01 = CONSUMED / BLOCKED / DO NOT REUSE
D2-PRESERVATION-PARTB-SHEETPR-DECISION-01 = OPTION B APPROVED / ARCHITECTURE POLICY ONLY
CONTROL-PLANE-D2-REVIEW-CORRECTIVE-20-ROUND-20260901 = ACTIVE / ROUND 4 OF 20
ANTIGRAVITY_AUTO_AUTH = NO
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
NEXT_ACTION = DECIDE WHETHER TO AUTHORIZE D2-WP003-R3-R27 AS PROPOSED
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP / NOT NEEDED AT THIS GATE
D3 = HOLD
```
