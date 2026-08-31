# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only for minimum necessary execution
> Updated: 2026-09-01 — D1 CLOSED / D2-WP001 PASS-CLOSED / WP002 PROPOSED

## 1. Whole-project scoreboard

| ID | Status | Current checkpoint |
|---|---|---|
| D1 Hybrid Identity + Password + Employee-Self + Approver Access | ✅ PASS / CLOSED | Final security review PASS with documented Kintone-only ceilings |
| D2 Excel + PDF Original/Legacy Format | 🟠 IN PROGRESS / WP001 CLOSED | Projection/security foundation PASS; next proposed gate is legacy template evidence + renderer design contract |
| D3 8 Legacy PMS Apps → App794 | 🟠 IN PROGRESS / WRITE NOT AUTHORIZED | Read-only/mapping/reconciliation path only |
| D4 App800 HR Control Center E2E | 🟠 IN PROGRESS | Employee lifecycle operations are mandatory scope |
| D5 Copy Own Previous MBO | 🟠 IN PROGRESS | Fresh target-year routing/identity required |
| D6 Integrated E2E / Security / Regression | 🔴 PENDING | Lifecycle/security regression required |
| D7 Admin Support Center | ✅ SOURCE FUNCTIONALITY CLOSED | Reopen only proven defect |

## 2. D1 architecture — frozen

```text
D1 = KINTONE-ONLY / CLOSED PASS
APP794_LIVE_REVISION = 67
RUNTIME_SOURCE_COMMIT = c6864d09f59cfaf6e7c86da422452a816a5cf430
FINAL_D1_SECURITY_REVIEW = PASS
CURRENT_APPROVAL_AUTHORITY = NATIVE CURRENT ASSIGNEE
SHARED_APPROVER_AUTHORITY = DENIED
```

Accepted Kintone-only ceilings remain:

```text
SHARED_DIRECT_URL_REST_HARD_ISOLATION = NOT GUARANTEED
DEDICATED_DIRECT_REST_CREATE_FIELD_INTEGRITY = LIMITED BY NATIVE APP794 ADD PERMISSION
```

Do not reopen D1 without proven regression.

## 3. D2 discovery — complete

Canonical D2 document: `project-docs/EXCEL_EXPORT.md`.

Accepted discovery remains:
- export layer began as projection/data-model only;
- App794 objective normalization supports slots 1..10;
- confirmed profile weights include Assistant Manager 60/40;
- legacy workbook binaries are intentionally gitignored local references;
- real `.xlsx`/PDF rendering is still not implemented.

## 4. D2-WP001 — PASS / CLOSED

Original implementation:

```text
D2-WP001_COMMIT = 4f4084b630642b2d1d6dcb0ab8093227bab8cc6c
ORIGINAL_REVIEW = CORRECTIVE REQUIRED
```

Corrective implementation:

```text
D2-WP001-R1_COMMIT = 1d48dc218fe7e2c542773bcf441332f8b06f88f9
R1_SCOPE_REVIEW = PASS
R1_SOURCE_REVIEW = PASS
```

Owner then supplied Antigravity offline verification evidence from the canonical checkout:

```text
node --test tests/mbo-export-service.test.js
PASS = 10 / 10
FAIL = 0

node --test tests/core-794-795-796-integration.test.js
PASS = 1 / 1
FAIL = 0

git status --porcelain
CLEAN = YES
```

Therefore:

```text
D2-WP001 = PASS / CLOSED
D2-WP001-R1 = PASS / CLOSED
```

Accepted foundation:
- explicit supported trusted export contexts only;
- Employee-Self exact Employee_Code scoping;
- cross-employee denial;
- SHARED approver denial;
- current native Assignee authority for DEDICATED approver export;
- stale/static route authority denied;
- HR/Technical caller labels do not self-authorize;
- Employee-Self Part A/Part B confidentiality projection enforced;
- exact 4/5/10 objective capacity covered;
- confirmed profile weights preserved.

D2 itself remains open because binary workbook/PDF parity is not implemented or accepted yet.

## 5. Proposed D2-WP002 — approval pending

```text
D2-WP002 = LEGACY TEMPLATE EVIDENCE + RENDERER DESIGN CONTRACT
STATUS = PROPOSED / OWNER APPROVAL REQUIRED / NOT STARTED
ACTIVE_WORK_PACKAGE = NONE
CURRENT_EXECUTOR = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ANTIGRAVITY = STOP / WAIT OWNER
```

Preferred evidence path:
1. Owner provides the approved legacy Excel/PDF files directly to ChatGPT if available;
2. otherwise Antigravity may inspect gitignored local templates READ-ONLY after explicit WP002 approval;
3. original employee-bearing binaries must not be committed to Git.

Required template evidence at minimum:
- `PMS_Staff & Chief_PART_A.xlsx`;
- `PMS_Staff & Chief_PART_B.xlsx`;
- approved PDF sample if exact PDF parity is required.

WP002 must freeze the renderer contract before implementation: sheets, merged cells, labels, cell mappings, formatting, formulas, print settings, signatures, 5–10 objective expansion, PDF pagination/layout, and safe evidence handling.

## 6. Current gate

```text
D1 = CLOSED / PASS
D2 = IN PROGRESS / WP001 PASS-CLOSED
ACTIVE_WORK_PACKAGE = NONE
PROPOSED_WORK_PACKAGE = D2-WP002
NEXT_REQUIRED_OWNER_DECISION = APPROVE / CORRECT / REJECT D2-WP002
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ANTIGRAVITY = STOP / WAIT OWNER
```

No other Work Package may auto-start.

## 7. Authorization ledger

```text
D2-WP001-SOURCE-20260901-01 = CONSUMED / REVIEWED / DO NOT REUSE
D2-WP001-R1-SOURCE-20260901-01 = CONSUMED / CLOSED / DO NOT REUSE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_APP794_DEPLOY_AUTH = NONE
ACTIVE_RECORD_ACL_WRITE_AUTH = NONE
ACTIVE_PROCESS_UAT_WRITE_AUTH = NONE
ACTIVE_GROUP_WRITE_AUTH = NONE
APP53_SCHEMA_WRITE_AUTH = NONE
APP53_RECORD_WRITE_AUTH = NONE
APP53_BULK_WRITE_AUTH = NONE
APP795_WRITE_AUTH = NONE
APP801_WRITE_AUTH = NONE
ACTIVE_LIFECYCLE_WRITE_AUTH = NONE
PRODUCTION_ROLLBACK_AUTH = NONE
```
