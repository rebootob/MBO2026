# MBO2026 — OPEN ISSUES & GATES

> Updated: 2026-08-31 ICT.  
> Current acceptance/status authority remains `AI_CONTROL_CENTER.md`.

## 1. Open project gates

| ID | Item | Status | Required next condition |
|---|---|---|---|
| D2-EXPORT-001 | Excel/PDF original/legacy-format closure | READY / NOT STARTED | Owner starts D2; perform read-only export/source/sample discovery before implementation |
| D3-MIG-001 | 8 legacy PMS Apps -> App794 migration | OPEN / WRITE NOT AUTHORIZED | Read-only mapping/dry-run/conflict/reconciliation/backup/exact manifest before target write approval |
| D4-E2E-001 | App800 HR Control Center full operations | OPEN | Complete remaining HR operational functions and secure UAT |
| D4-LIFECYCLE-001 | Employee lifecycle operations | OPEN / POLICY CONFIRMED / WRITE NOT AUTHORIZED | Implement controlled inactive/resigned impact handling, reassignment, principal/session handling, audit/readback/exception reporting under a separately approved Work Package |
| D4-RESET-DEPLOY | App800 Reset MBO Password UI deployment | SOURCE SEMANTICS ACCEPTED / DEPLOY NOT AUTHORIZED | Fresh exact deploy authorization if/when deployment becomes current priority |
| D5-COPY-001 | Copy Own Previous MBO | OPEN | Implement approved carry-forward whitelist with fresh target-year current identity/routing and no stale requester/route/workflow state |
| D6-E2E-001 | Integrated E2E/security/regression | PENDING | After D1–D5 are sufficiently ready; must include lifecycle/security regression |

## 2. D1 — CLOSED

```text
D1_OVERALL = PASS
FINAL_D1_SECURITY_REVIEW = PASS
APP794_LIVE_REVISION = 67
RUNTIME_SOURCE_COMMIT = c6864d09f59cfaf6e7c86da422452a816a5cf430
```

Former D1 gates are closed and must not remain listed as active issues:

```text
D1-ACL-001 = CLOSED / PASS
D1-APPROVAL-TASKS = CLOSED / PASS
D1-SHARED = CLOSED / PASS
D1-DUALROLE = CLOSED / PASS
D1-COMMENTS-ATTACH = CLOSED / PASS
D1-PATTAMA-UAT = CREDENTIAL-LIMITED / NON-BLOCKING / NO RESET REQUIRED
```

Accepted evidence includes Dedicated record privacy, foreign-record denial, Shared session runtime, live dual-role separation, current-Assignee authority, HR non-employee runtime and comments/history/attachment truthfulness.

Synthetic Records #13 and #14 were deleted after bounded UAT; no D1 synthetic test record remains.

## 3. Accepted D1 platform limitations — not defects

```text
D1-SHARED-CEILING:
SHARED_DIRECT_URL_REST_HARD_ISOLATION = NOT GUARANTEED UNDER SHARED KINTONE PRINCIPAL

D1-DEDICATED-CREATE-CEILING:
DEDICATED_DIRECT_REST_CREATE_FIELD_INTEGRITY = LIMITED BY NATIVE APP794 ADD PERMISSION
```

These are accepted architecture ceilings. Keep them visible; do not reopen them as ordinary defects unless the Owner explicitly changes architecture.

## 4. Employee lifecycle open gate

Canonical policy: `project-docs/CONFIRMED_BASELINE/EMPLOYEE_LIFECYCLE_CHANGE_POLICY.md`.

```text
EMPLOYEE_LIFECYCLE_POLICY = CONFIRMED
ACTIVE_LIFECYCLE_WRITE_AUTH = NONE
```

Policy confirmation is not implementation completion. D4 still has to implement the controlled operational path and D6 still has to prove lifecycle/security regression. Existing App794 records must not be silently rewritten when App53/App795 changes.

## 5. D2 pre-start gate

Canonical D2 scope: `project-docs/EXCEL_EXPORT.md`.

Before source changes:

```text
inventory existing export source/tests
locate approved legacy Excel/PDF samples
map App794 fields to legacy output
review current PDF mechanism
review export security/confidentiality guards
produce gap list and smallest D2 Work Package
```

```text
D2_STATUS = READY / NOT STARTED
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_WORK_PACKAGE = NONE
```

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

App53 remains read-only by default.

## 7. App802

Prior sandbox continuation path is cancelled/revoked. Do not resume/delete/repair App802 without separate exact authorization.

## 8. D7

Admin Support Center source functionality is CLOSED. Reopen only if a new proven defect exists.
