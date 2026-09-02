# AI ACTIVE TASK — D2-WP003-R3-R30 TEST-ONLY AUTHORIZED

Mode: **BOUNDED ANTIGRAVITY EXECUTION / LOW-CREDIT / TEST-ONLY / NO SOURCE / NO KINTONE / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-02 ICT

Repository truth and accepted newer Live evidence always win. Fresh-fetch current branch HEAD before acting.

```text
TASK_STATE = AUTHORIZED / WAIT ANTIGRAVITY TEST-ONLY IMPLEMENTATION
D1_OVERALL = PASS / CLOSED
D2_STATUS = IN PROGRESS
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R29 = REVIEWED / NOT PASS / NOT CLOSED
R3-R29_AUTHORIZATION_COMMIT = 1ff838f6f10e846cdd00925d62b444946b35445b
R3-R29_IMPLEMENTATION_COMMIT = 6fde9127f4b49197758723f5813978800704b8cf
R3-R29_SCOPE_REVIEW = PASS
R3-R29_SOURCE_REVIEW = PASS
R3-R29_PROOF_REVIEW = FAIL / INCOMPLETE REGRESSION RESTORE
D2-PRESERVATION-PARTB-SHEETPR-DECISION-01 = OPTION B APPROVED
PRESERVATION_POLICY = NARROW DETERMINISTIC ALLOWED-DRIFT
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_USED = 7
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_REMAINING = 13
ANTIGRAVITY_AUTO_AUTH = NO
CLAUDE_AUTO_REVIEW = NO
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R30
WORK_PACKAGE_NAME = TEST-ONLY FINAL PROOF COMPLETION FOR PRESERVATION GATE
AUTHORIZED_SCOPE = EXISTING FEASIBILITY TEST FILE ONLY
CORRECTIVE_BASELINE_COMMIT = 6fde9127f4b49197758723f5813978800704b8cf
AUTHORIZATION_BASELINE_HEAD = c92fd00af120fff16b7e598c74c077055f4e6ead
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP003-R3-R30-TEST-20260902-01
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
AUTHORIZATION_MODE = ONE-SHOT / BOUNDED / TEST-ONLY / DO NOT WIDEN / DO NOT REUSE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
PRIVACY_PURGE_REQUIRED = NO
D3_EXECUTION = HOLD UNTIL D2 PASS / CLOSED
ANTIGRAVITY = AUTHORIZED FOR THIS TEST-ONLY WP ONLY
CLAUDE = STOP / NOT AUTHORIZED / NOT NEEDED UNLESS CHATGPT LATER FINDS MATERIAL AMBIGUITY
```

## 1. Owner authorization

Owner explicitly authorized on 2026-09-02 ICT:

```text
อนุมัติ D2-WP003-R3-R30 TEST-ONLY ตามขอบเขตที่เสนอ
```

This creates exactly one bounded TEST-ONLY authorization:

```text
D2-WP003-R3-R30-TEST-20260902-01 = ACTIVE / ONE-SHOT
```

This does NOT authorize production source changes, evidence publication, Kintone access/write, deploy, Live UAT, rollback, D3, R3-R31, another work package, Claude execution or scope expansion.

## 2. R3-R29 accepted source baseline

R3-R29 source review is PASS and is frozen for R3-R30:
- worksheet singleton semantics corrected;
- `cols` and `conditionalFormatting` remain repeatable;
- supported maxOccurs=1 children are independently guarded;
- pure `preserveWorksheetXmlDimensions()` is used by production preservation;
- production exact source-SHA enforcement remains;
- Option B write-back and XML gap/inventory behavior remain;
- `getNoOpParityBuffers()` remains frozen.

R3-R30 MUST NOT modify production source merely to make a test pass.

## 3. Exact write scope

Modify ONLY:
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

Read-only as needed:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`;
- prior accepted test versions in Git history;
- `package.json`, `package-lock.json`;
- exact ignored owner templates only after SHA verification.

No other tracked file may change.
No new file, dependency, artifact, workbook, PDF, image or evidence document may be created.

## 4. Mandatory TEST-ONLY proof completion

R3-R30 MUST ONLY complete the missing proof from R3-R29:

1. retain every current R3-R29 test and assertion unless an exact duplicate is being restored from prior accepted Git history;
2. add always-runnable pure structural proof that duplicate Option B `sheetPr` fails closed;
3. add always-runnable pure structural proof that an extra unexpected `sheetPr` fails closed;
4. add always-runnable `preserveWorksheetXmlDimensions()` rejection proof for:
   - moved observed-only `sheetPr`;
   - other-sheet observed-only `sheetPr`;
   - Part-A observed-only `sheetPr`;
5. restore a distinct counterfeit worksheet-like relationship Type URI negative, separate from the current styles/non-worksheet Type case;
6. restore the exact previously accepted typed-privacy negatives from Git history for:
   - array `typeCounts`;
   - fractional count;
   - non-number count;
7. do not remove, weaken, rename away, or bypass existing R3-R29 regression proof;
8. do not change production source or validators;
9. do not add a workaround that converts expected fail-closed behavior into permissive behavior.

If exact owner templates are unavailable:
- do NOT reconstruct or invent them;
- template-dependent integration cases may skip explicitly;
- all always-runnable privacy-safe pure tests MUST still execute.

## 5. Required execution sequence

Run exactly:

```text
node --check tests/mbo-xlsx-ooxml-feasibility.test.js
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

Then:
1. make exactly ONE bounded test-only implementation/blocker commit;
2. push to `ai/antigravity-wp002c`;
3. STOP;
4. report commit SHA, exact changed file, test result, npm audit result and blocker if any.

Antigravity self-report is not independent PASS evidence. ChatGPT performs the independent Git review.

## 6. Stop conditions / frozen scope

STOP immediately if satisfying R3-R30 would require:
- modifying `scripts/export/mbo-xlsx-ooxml-feasibility.js` or any production source;
- another tracked file;
- a new dependency;
- widening Option B;
- evidence publication;
- Kintone/Live/deploy/PDF/renderer work;
- reference-image/objective/competency/formula closure work;
- D3 or R3-R31.

No automatic rollback.

## 7. Authorization ledger

```text
D2-WP003-R3-R28-SOURCE-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R3-R29-SOURCE-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R3-R30-TEST-20260902-01 = ACTIVE / ONE-SHOT
D2-PRESERVATION-PARTB-SHEETPR-DECISION-01 = OPTION B APPROVED / ARCHITECTURE POLICY
CONTROL-PLANE-D2-REVIEW-CORRECTIVE-20-ROUND-20260901 = ACTIVE / ROUND 7 OF 20
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

## 8. Exact next action

```text
NEXT_EXECUTOR = ANTIGRAVITY
NEXT_ACTION = IMPLEMENT D2-WP003-R3-R30 TEST-ONLY EXACTLY WITHIN ONE FILE
AFTER_COMMIT = STOP / CHATGPT INDEPENDENT REVIEW
CLAUDE = STOP / DO NOT INVOKE
D3 = HOLD
```
