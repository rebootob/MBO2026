# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only for minimum necessary execution
> Updated: 2026-09-01 — D1 CLOSED / D2-WP001 PASS-CLOSED / D2-WP002 PASS-CLOSED / WP003 PROPOSED

## 1. Whole-project scoreboard

| ID | Status | Current checkpoint |
|---|---|---|
| D1 Hybrid Identity + Password + Employee-Self + Approver Access | ✅ PASS / CLOSED | Final security review PASS with documented Kintone-only ceilings |
| D2 Excel + PDF Original/Legacy Format | 🟠 IN PROGRESS / WP001+WP002 CLOSED | Security/projection foundation and legacy-template renderer contract accepted; XLSX renderer not implemented yet |
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

## 3. D2-WP001 — PASS / CLOSED

Accepted foundation remains:
- explicit supported trusted export contexts only;
- Employee-Self exact Employee_Code scoping;
- cross-employee denial;
- SHARED Approver denial;
- current native Assignee authority for DEDICATED Approver export;
- stale/static route authority denied;
- HR/Technical caller labels do not self-authorize;
- Employee-Self Part A/Part B confidentiality projection enforced;
- exact 4/5/10 objective projection covered;
- confirmed profile weights preserved.

Corrective implementation commit:
`1d48dc218fe7e2c542773bcf441332f8b06f88f9`.

Offline verification evidence accepted: export tests 10/10 PASS, integration 1/1 PASS, working tree clean.

## 4. D2-WP002 — PASS / CLOSED

Owner explicitly approved WP002 and directly provided the legacy Part A and Part B Excel binaries to ChatGPT. Antigravity was not needed.

Evidence fingerprints:

```text
PART_A_SHA256 = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B_SHA256 = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
ORIGINAL_BINARY_COMMIT = NO
```

Accepted structural findings:

### Part A
```text
Sheet = MBO Staff & Chief
Print area = A1:BJ52
Paper = A3 landscape
Scale = 58%
Legacy objective rows = 25:28
Legacy objective row height = 140.1 pt
Merged ranges = 193
Cell style records = 429
Worksheet formulas = 0
```

### Part B
```text
Sheet = (Part B) Competency
Print area = A1:X35
Paper = A4 portrait
Scale = 75%
Horizontal centered = yes
Sheet protected = yes
Competency blocks in supplied sample = 6
Merged ranges = 79
Cell style records = 142
Worksheet formulas = 0
```

The second Part B worksheet `Sheet1` contains only orphan/helper labels and is not part of the user-facing renderer contract unless later evidence proves otherwise.

## 5. D2 frozen renderer rules

Canonical detailed contract: `project-docs/EXCEL_EXPORT.md`.

Key rules:
- use legacy files as **visual/layout authority**, not business-rule authority;
- use Confirmed Baseline + App794 secured projection as **business/data authority**;
- use a **template-preserving renderer**, not workbook-from-scratch reconstruction;
- runtime template assets must be sanitized and contain no employee/sample/confidential data;
- preserve approved static branding, styles, merges, widths/heights and print settings;
- remove non-user-facing historical/reference screenshots from runtime assets;
- Part A 5–10 objectives: insert/clone vertical objective blocks after legacy row 28, shift lower sections, extend print area, keep A3 landscape horizontal geometry;
- Part B 6/8 competencies: insert repeated blocks before totals/signatures, shift lower sections, extend print area, keep A4 portrait geometry;
- legacy workbook has no formulas; authoritative scores should be written from current scoring/projection services;
- stale legacy text/weights must not override current profile/configuration truth.

Important legacy conflicts recorded:
- Part A static `2 till 4 objectives` text is stale versus current up-to-10 requirement;
- sample fiscal/appraisal dates are stale sample values;
- Part B sample title/filename/context is inconsistent and displays a static 30% weight; current Profile_Code weighting must control title/weights. Assistant Manager remains 60/40; Staff/Chief remains 70/30.

## 6. PDF evidence state

No approved legacy PDF sample was supplied in WP002.

Frozen geometry for future PDF:
- Part A = A3 landscape presentation;
- Part B = A4 portrait presentation.

Exact legacy PDF visual-parity acceptance remains pending evidence and must not be claimed yet.

## 7. Proposed D2-WP003 — approval pending

```text
D2-WP003 = SANITIZED TEMPLATE ASSETS + XLSX RENDERER FOUNDATION
STATUS = PROPOSED / OWNER APPROVAL REQUIRED / NOT STARTED
ACTIVE_WORK_PACKAGE = NONE
CURRENT_EXECUTOR = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ANTIGRAVITY = STOP / WAIT OWNER
```

Proposed outcome:
- sanitized Part A/Part B runtime templates;
- smallest template-preserving XLSX renderer consuming secured MboExportService projection;
- rendering tests for Part A 4/5/10 objectives;
- rendering tests for Part B 6/8 competencies;
- structural parity checks for sheet name, merges, print geometry and no confidential sample data.

PDF generation, UI buttons, Live Kintone and deploy remain outside WP003 unless separately authorized.

## 8. Current gate

```text
D1 = CLOSED / PASS
D2 = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
ACTIVE_WORK_PACKAGE = NONE
PROPOSED_WORK_PACKAGE = D2-WP003
NEXT_REQUIRED_OWNER_DECISION = APPROVE / CORRECT / REJECT D2-WP003
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ANTIGRAVITY = STOP / WAIT OWNER
```

No other Work Package may auto-start.

## 9. Authorization ledger

```text
D2-WP001-SOURCE-20260901-01 = CONSUMED / REVIEWED / DO NOT REUSE
D2-WP001-R1-SOURCE-20260901-01 = CONSUMED / CLOSED / DO NOT REUSE
D2-WP002 = APPROVED / READ-ONLY / CLOSED
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
