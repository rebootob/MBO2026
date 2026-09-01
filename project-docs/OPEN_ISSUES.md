# MBO2026 — OPEN ISSUES & GATES

> Updated: 2026-09-01 ICT.  
> Current acceptance/status authority remains `AI_CONTROL_CENTER.md`.

## 1. Open project gates

| ID | Item | Status | Required next condition |
|---|---|---|---|
| D2-EXPORT-001 | Excel/PDF original/legacy-format closure | IN PROGRESS | Close dimension preservation, then image/insertion/formula/renderer/PDF/security gates |
| D2-R3-R23 | Separate minimal exact-dimension preservation path | PROPOSED / NOT AUTHORIZED | Owner authorization; raw evidence path remains frozen |
| D3-MIG-001 | 8 legacy PMS Apps -> App794 migration | HOLD / WRITE NOT AUTHORIZED | Do not execute until D2 PASS/CLOSED; then dry-run/reconciliation/backup/exact manifest before write approval |
| D4-E2E-001 | App800 HR Control Center full operations | OPEN / NOT ACTIVE | Complete remaining HR operations and secure UAT under separate WP |
| D4-LIFECYCLE-001 | Employee lifecycle operations | OPEN / POLICY CONFIRMED / WRITE NOT AUTHORIZED | Controlled reassignment/principal/session/audit/readback operations |
| D5-COPY-001 | Copy Own Previous MBO | OPEN / NOT ACTIVE | Carry-forward whitelist with fresh target-year route/identity |
| D6-E2E-001 | Integrated E2E/security/regression | PENDING | After D2–D5 sufficiently ready; lifecycle/security regression mandatory |

## 2. D1 — CLOSED

```text
D1_OVERALL = PASS
FINAL_D1_SECURITY_REVIEW = PASS
APP794_LIVE_REVISION = 67
RUNTIME_SOURCE_COMMIT = c6864d09f59cfaf6e7c86da422452a816a5cf430
```

Former D1 gates remain closed. Accepted architecture ceilings are not ordinary defects:

```text
SHARED_DIRECT_URL_REST_HARD_ISOLATION = NOT GUARANTEED UNDER SHARED KINTONE PRINCIPAL
DEDICATED_DIRECT_REST_CREATE_FIELD_INTEGRITY = LIMITED BY NATIVE APP794 ADD PERMISSION
```

## 3. D2 current open gate

Canonical D2 contract: `project-docs/EXCEL_EXPORT.md`.

Latest review:

```text
R3-R22_TEST_COMMIT = 9cb94250fc0fa3bfe458f406c09d0df709aa5b96
R3-R22_EVIDENCE_COMMIT = 5ae2f7f8cfe22dbed7b121505a40d3244a4673a0
R3-R22_SCOPE_REVIEW = PASS
R3-R22_SOURCE_REVIEW = PASS
R3-R22_RUNTIME_EVIDENCE_REVIEW = PASS
R3-R22_STATUS = PASS / CLOSED
```

Accepted proof:
- raw direct `xlsx-populate.outputAsync()` no-op evidence;
- deterministic workbook-parity blocker normalization;
- actual dimension-tag/absence fingerprint only;
- exact per-sheet print-area binding;
- exact-source mutation proof isolation;
- raw Part A/Part B dimension loss and fail-closed validator result.

Remaining issue:
- raw no-op degradation is proven;
- a separate minimal preservation path is required without changing raw evidence;
- preserved output must change only exact missing dimension tags and pass workbook parity.

Proposed corrective:

```text
D2-WP003-R3-R22 = PASS / CLOSED
D2-WP003-R3-R23 = PROPOSED / NOT AUTHORIZED
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_WORK_PACKAGE = NONE
```

Expected R3-R23: keep raw evidence frozen; add a separate exact-dimension preservation path in existing feasibility source/test; exact worksheet mapping; no non-dimension changes; fail closed on ambiguity/conflict.

## 4. D2 remaining gates after workbook parity isolation

```text
REFERENCE_IMAGE_CLOSURE = OPEN
PART_A_INSERTION_MATRIX = OPEN
PART_B_INSERTION_MATRIX = OPEN
FORMULA_AUTHORITY_CLOSURE = OPEN
PRODUCTION_XLSX_RENDERER = OPEN
COMBINED_EXCEL_PARITY = OPEN
PDF_PARITY = OPEN
EXPORT_SECURITY_PRIVACY_REGRESSION = OPEN
FINAL_D2_REVIEW = OPEN
```

The proven raw no-op degradation requires the proposed preservation-strategy WP before later renderer work.

## 5. Employee lifecycle open gate

Canonical policy: `project-docs/CONFIRMED_BASELINE/EMPLOYEE_LIFECYCLE_CHANGE_POLICY.md`.

```text
EMPLOYEE_LIFECYCLE_POLICY = CONFIRMED
ACTIVE_LIFECYCLE_WRITE_AUTH = NONE
```

Policy confirmation is not implementation completion. D4 owns operational implementation and D6 owns regression proof.

## 6. App53 production boundary

```text
APP53_TOTAL_RECORDS = 281
MBO_Kintone_User = USER_SELECT / optional / LIVE
DEDICATED_MAPPINGS = 24 verified
UNEXPECTED_NONEMPTY = 0
APP53 SCHEMA WRITE AUTH = NONE
APP53 RECORD WRITE AUTH = NONE
APP53 BULK WRITE AUTH = NONE
```

## 7. App802

Prior sandbox continuation path is cancelled/revoked. Do not resume/delete/repair App802 without separate exact authorization.

## 8. D7

Admin Support Center source functionality is CLOSED. Reopen only if a new proven defect exists.

## 9. Current exact gate

```text
D2 = IN PROGRESS
ACTIVE_WORK_PACKAGE = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = STOP / WAIT OWNER
D3 = HOLD UNTIL D2 PASS / CLOSED
NEXT_CONTROL_STEP = OWNER DECIDES WHETHER TO AUTHORIZE D2-WP003-R3-R23
```
