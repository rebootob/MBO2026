# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only for minimum necessary execution
> Updated: 2026-09-01 — D1 CLOSED / D2-WP001+WP002 CLOSED / D2-WP003 AUTHORIZED

## 1. Whole-project scoreboard

| ID | Status | Current checkpoint |
|---|---|---|
| D1 Hybrid Identity + Password + Employee-Self + Approver Access | ✅ PASS / CLOSED | Final security review PASS; current approval authority = native current Assignee |
| D2 Excel + PDF Original/Legacy Format | 🟠 IN PROGRESS / WP003 AUTHORIZED | Projection/security + template design closed; sanitized XLSX renderer foundation now authorized |
| D3 8 Legacy PMS Apps → App794 | 🟠 IN PROGRESS / WRITE NOT AUTHORIZED | Read-only/mapping/reconciliation path only |
| D4 App800 HR Control Center E2E | 🟠 IN PROGRESS | Employee lifecycle operations mandatory scope |
| D5 Copy Own Previous MBO | 🟠 IN PROGRESS | Fresh target-year routing/identity required |
| D6 Integrated E2E / Security / Regression | 🔴 PENDING | Lifecycle/security regression required |
| D7 Admin Support Center | ✅ SOURCE FUNCTIONALITY CLOSED | Reopen only proven defect |

## 2. Frozen completed foundations

```text
D1 = PASS / CLOSED
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
```

D2-WP001 accepted:
- explicit trusted export contexts only;
- Employee-Self exact Employee_Code;
- SHARED denied;
- DEDICATED Approver requires current native App794 Assignee;
- stale/static route authority denied;
- Employee-Self confidential Part A/Part B values omitted;
- exact 4/5/10 objective projection covered;
- profile weights preserved.

D2-WP002 accepted owner-provided binary evidence and froze the template-preserving renderer contract. Original employee-bearing binaries remain outside Git.

Evidence hashes:
```text
PART_A_SHA256 = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B_SHA256 = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
```

## 3. Frozen renderer rules

Canonical detail: `project-docs/EXCEL_EXPORT.md`.

```text
LEGACY TEMPLATE = VISUAL / LAYOUT AUTHORITY
CURRENT BASELINE + CONFIG = BUSINESS RULE AUTHORITY
SECURED MboExportService PROJECTION = EXPORT DATA AUTHORITY
```

Part A = A3 landscape; legacy objective blocks rows 25–28; extend vertically for 5–10 objectives without horizontal compression.

Part B = A4 portrait; six legacy competency blocks; extend to eight for management sets; dynamic profile/weight text must use current configuration.

Legacy workbooks contain zero worksheet formulas. Initial renderer writes authoritative calculated values; it does not create a second scoring engine.

PDF exact visual parity remains pending; no approved PDF sample has been supplied.

## 4. D2-WP003 — AUTHORIZED

```text
ACTIVE_WORK_PACKAGE = D2-WP003
WORK_PACKAGE_NAME = SANITIZED TEMPLATE ASSETS + XLSX RENDERER FOUNDATION
OWNER_APPROVAL = GRANTED
EXECUTOR = ANTIGRAVITY
ANTIGRAVITY_MODE = LOW-CREDIT / BOUNDED
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-SOURCE-20260901-01
MAX_EXECUTOR_STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

Exact authorized implementation scope is defined in `AI_ACTIVE_TASK.md`.

Authorized outcomes only:
- SHA-verified local legacy source templates;
- sanitized runtime Part A/Part B assets;
- template-preserving `mbo-xlsx-renderer` consuming secured projection only;
- Part A 4/5/10 rendering;
- Part B 6/8 rendering;
- structural/privacy/fail-closed tests;
- exactly one dependency `xlsx-populate@1.21.0`, conditional on no-op round-trip parity and runtime audit.

If no exact-hash source template is locally available, or if library no-op roundtrip changes material workbook structure, Antigravity must STOP with a blocker rather than substituting/rebuilding.

## 5. Explicit exclusions

WP003 does not authorize:
- PDF generator;
- download/export UI;
- `src/main-mbo-app.js` changes;
- Live Kintone reads/writes/export;
- deployment;
- original legacy binary commit;
- another XLSX/PDF library;
- D2-WP004 or D3–D6 implementation.

## 6. Current gate

```text
D1 = CLOSED / PASS
D2 = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003 = AUTHORIZED / EXECUTION ACTIVE
CURRENT_EXECUTOR = ANTIGRAVITY
NEXT_CONTROL_GATE = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

No other Work Package may auto-start.

## 7. Authorization ledger

```text
D2-WP001-SOURCE-20260901-01 = CONSUMED / CLOSED / DO NOT REUSE
D2-WP001-R1-SOURCE-20260901-01 = CONSUMED / CLOSED / DO NOT REUSE
D2-WP002 = APPROVED / READ-ONLY / CLOSED
D2-WP003-SOURCE-20260901-01 = ACTIVE
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-SOURCE-20260901-01
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
