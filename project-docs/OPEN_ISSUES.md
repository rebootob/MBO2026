# MBO2026 — OPEN ISSUES & GATES

> Updated: 2026-08-30 20:45 ICT.  
> Current acceptance/status authority remains `AI_CONTROL_CENTER.md`.

| ID | Item | Status | Required next condition |
|---|---|---|---|
| D1-HOME-001 | My Approval Tasks Home Index integration | OPEN / CURRENT GATE | Execute exact 3-file Active Task, focused integration test + diff check, then ChatGPT review |
| D1-DETAIL-001 | Dedicated cross-employee assigned-record Detail authority | PENDING GATE 2 | Open only after Home Gate PASS; fresh `Assignee` revalidation required before allowing non-own record context |
| D1-PROCESS-001 | Fresh current-Assignee check before Approve/Return/process action | PENDING GATE 3 | Open only after Detail gate; fail closed on stale/unassigned record |
| D1-CONFIG-001 | App53 dedicated mapping field + mappings | PROTECTED / NOT AUTHORIZED | Separate exact production authorization for schema, mappings and any data correction |
| D1-NATTA-001 | Natta canonical Employee_Code | UNRESOLVED / FAIL CLOSED | Real canonical `emp_text` value must be verified before any correction/binding |
| D1-NATIVE-ACL-001 | Dedicated native App794 least-privilege ACL/Record ACL | DESIGN CONFIRMED / NOT AUTHORIZED | Exact payload + independent review + explicit ACL authorization |
| D1-SHARED-CEILING | Shared-principal direct REST hard isolation | ACCEPTED PLATFORM LIMITATION | Keep explicit; do not make false hard-isolation claim |
| D4-RESET-DEPLOY-001 | App800 Reset MBO Password UI deployment | SOURCE ACCEPTED / DEPLOY NOT AUTHORIZED | Fresh exact deploy authorization and candidate verification |
| D2-EXPORT-001 | Excel/PDF legacy-format closure | OPEN | Prove Part A/Part B/PDF/format parity/security, including objective capacity |
| D3-MIG-001 | 8 legacy PMS Apps -> App794 migration | OPEN / WRITE NOT AUTHORIZED | Read-only mapping/dry run/reconciliation/backup/exact manifest before target write approval |
| D4-E2E-001 | App800 HR Control Center full operations | OPEN | Complete remaining HR operational functions and secure UAT |
| D5-COPY-001 | Copy own previous MBO | OPEN | Implement approved planning whitelist with fresh target-year configuration |
| D6-E2E-001 | Integrated E2E/security/regression | PENDING | After D1–D5 implementation/configuration are ready |

## D1 authority reminders

Approval authority must never come from App795 static membership, `Manager_User`, `GM_User`, `First_Manager_User`, a caller-provided role or UI visibility. Current native App794 `Assignee` is the authority for Dedicated approvers.

SHARED approver authority remains denied.

## App53 production boundary

```text
APP53_MAPPING_AUDIT = COMPLETE
MBO_Kintone_User FIELD DESIGN = CONFIRMED USER_SELECT
LIVE FIELD = NOT CREATED
Vassana = 0044 proven
Natta = emp_text blank / unresolved
APP53 SCHEMA WRITE AUTH = NONE
APP53 RECORD WRITE AUTH = NONE
APP53 BULK WRITE AUTH = NONE
```

Adding the field, populating mappings and correcting Natta are distinct protected operations and must not be bundled silently.

## Own-MBO route rule

`OWN_MBO_SELF_APPROVER_ELISION = APPROVED`: self is removed from the employee's own effective route before snapshot; remaining approvers/order/rules are preserved; no autoapproval or fabricated history; fail closed if no non-self approver remains.

## D7

Admin Support Center source functionality is CLOSED. Reopen only if a new proven defect exists.