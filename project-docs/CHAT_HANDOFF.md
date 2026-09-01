# MBO2026 — CHAT HANDOFF

> Updated: 2026-09-01 ICT  
> Repository: `rebootob/MBO2026`  
> Canonical branch: `ai/antigravity-wp002c`

Repository/Kintone accepted evidence wins over embedded checkpoints. Fresh-fetch before acting.

## 1. Operating model

```text
ChatGPT = Control Plane / Architect / Independent Reviewer
Antigravity = execution plane only when genuinely necessary
```

No Live Kintone write/deploy/ACL/group/schema/record/session/password operation without exact explicit authorization. Never reuse consumed authorization.

Owner priority:

```text
COMPLETE D2 FULLY BEFORE D3.
```

## 2. Accepted foundations

```text
D1 = PASS / CLOSED
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003-R3-R13 = PASS / CLOSED
D2-WP003-R3-R16 = PASS / CLOSED
D2-WP003-R3-R17 = PASS / CLOSED
PART_B_PRIVACY_CLASSIFICATION_EVIDENCE_PARITY = PASS / CLOSED
TYPED_PRIVACY_METADATA_COMPLETENESS = PASS / CLOSED
TYPED_METADATA_VALIDATOR_SHAPE = PASS / CLOSED
HEADER_FINGERPRINT_SANITIZED_EXPORT_PARITY = PASS / CLOSED
DIFFICULTY_LEVEL_EXPORT = BLANK TEMPORARILY
```

Accepted template SHA-256:

```text
PART_A = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
```

## 3. R3-R18 reviewed result

```text
IMPLEMENTATION_COMMIT = e5d082059d05da4ac686568b55600fb12873e30d
D2-WP003-R3-R18_SCOPE_REVIEW = PASS
D2-WP003-R3-R18_SOURCE_REVIEW = FAIL / CORRECTIVE REQUIRED
D2-WP003-R3-R18_STATUS = NOT PASS / NOT CLOSED
PRIVACY_PURGE_REQUIRED = NO
```

Accepted R3-R18 work remains. Only two defects are open:
1. print-area binding must use actual worksheet index / exact `localSheetId`, with no fallback to another sheet's print area;
2. dimension evidence must compare exactly and missing observed evidence must fail closed.

## 4. Exact current gate — R3-R19 AUTHORIZED

```text
D2 = IN PROGRESS
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R18 = REVIEWED / NOT PASS / NOT CLOSED
D2-WP003-R3-R19 = PER-SHEET PRINT-AREA BINDING + MISSING EVIDENCE FAIL-CLOSED
STATUS = AUTHORIZED FOR ANTIGRAVITY EXECUTION
CONTROL_PLANE_PRE_AUTH_CHECKPOINT = f1848b3efffb034659817dbc9f7ff2088b76cf6f
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R19
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R19-SOURCE-20260901-01
ANTIGRAVITY = EXECUTE R3-R19 ONLY / LOW-CREDIT / BOUNDED
MAX_EXECUTOR_STATUS = WORKBOOK_PARITY_CORRECTIVE_PROOF_PENDING_INDEPENDENT_REVIEW
PRIVACY_PURGE_REQUIRED = NO
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
D3 = HOLD UNTIL D2 PASS / CLOSED
```

Read `project-docs/AI_ACTIVE_TASK.md` for the exact execution contract.

Antigravity must fresh-fetch current authorized canonical HEAD and record it as `EXECUTION_BASELINE`; do not reset to the pre-authorization checkpoint.

## 5. Exact authorized writes

ONLY:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

Read-only:
- package files;
- governance docs;
- exact owner templates after SHA verification.

No XLSX/image/media/output commit.

## 6. R3-R19 critical contract

```text
CORRECT ONLY THE TWO R3-R18 REVIEW DEFECTS.
```

Required:
- actual zero-based sheet index drives `localSheetId` print-area binding;
- no fallback that applies another sheet's print area;
- Part B main sheet retains exact source print area;
- Part B `Sheet1` proves no print area when exact source has none;
- dimension is a required per-sheet evidence field and source-vs-observed equality is exact;
- present-vs-missing/empty and different dimensions fail with `BLOCKER_WORKBOOK_PARITY_UNRESOLVED`;
- add real source-backed negative tests for wrong `Sheet1` print area and missing observed dimension.

Preserve every other accepted R3-R18 and earlier test/proof.

## 7. Out of scope

Do not touch image closure, insertion closure, formula authority, production renderer, combined Excel, PDF/UI, Kintone, deploy, D3 or another Work Package.

## 8. Required commands

```text
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

After push STOP at one of:

```text
WORKBOOK_PARITY_CORRECTIVE_PROOF_PENDING_INDEPENDENT_REVIEW
BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE
BLOCKER_WORKBOOK_PARITY_UNRESOLVED
```

## 9. Authorization ledger

```text
D2-WP003-R3-R18-SOURCE-20260901-01 = CONSUMED / REVIEWED / NOT PASS / DO NOT REUSE
D2-WP003-R3-R19-SOURCE-20260901-01 = ACTIVE / ONE CORRECTIVE ONLY
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R19-SOURCE-20260901-01
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
```

## 10. Exact next action

```text
NEXT_EXECUTOR = ANTIGRAVITY
ACTION = FRESH-FETCH CURRENT CANONICAL, RECORD EXECUTION_BASELINE, EXECUTE ONLY R3-R19, TEST/AUDIT, PUSH, STOP
NEXT_CONTROL_STEP = ChatGPT independent review
D3 = HOLD
```
