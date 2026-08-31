# MBO2026 — OPEN ISSUES & GATES

> Updated: 2026-08-31 ICT.  
> Current acceptance/status authority remains `AI_CONTROL_CENTER.md`.

| ID | Item | Status | Required next condition |
|---|---|---|---|
| D1-ACL-001 | App794 Dedicated record-level privacy / status-aware ACL | OPEN / CURRENT GATE | GET-only inspect current record ACL; design complete 16-status rule set; then request exact ACL authorization |
| D1-PATTAMA-UAT | Pattama interactive approver UAT | PENDING / NON-BLOCKING FOR CURRENT ACL DESIGN | Use real Pattama login later when available; do not reset another user's native Kintone password merely for UAT |
| D1-APPROVAL-TASKS | My Approval Tasks / assigned-record visibility and current-Assignee authority | IN PROGRESS | Preserve current native `Assignee` as authority; complete privacy/detail/action gates without App795 fallback |
| D1-SHARED | Shared-account Employee-Self final validation | OPEN | Validate App801 login/session/own-MBO behavior and deny approver authority |
| D1-DUALROLE | Dedicated Employee + Approver dual-role E2E | OPEN | Prove own MBO and assigned approval contexts remain separated |
| D1-COMMENTS-ATTACH | Comments/history/attachments truthfulness and permissions | OPEN | Complete after ACL/current-approver access rules are stable |
| D1-SHARED-CEILING | Shared-principal direct REST hard isolation | ACCEPTED PLATFORM LIMITATION | Keep explicit; never claim hard isolation that Kintone shared principal cannot enforce |
| D2-EXPORT-001 | Excel/PDF legacy-format closure | OPEN | Prove Part A/Part B/PDF/format parity/security/objective capacity |
| D3-MIG-001 | 8 legacy PMS Apps -> App794 migration | OPEN / WRITE NOT AUTHORIZED | Read-only mapping/dry-run/conflict/reconciliation/backup/exact manifest before target write approval |
| D4-E2E-001 | App800 HR Control Center full operations | OPEN | Complete remaining HR operational functions and secure UAT |
| D4-RESET-DEPLOY | App800 Reset MBO Password UI deployment | SOURCE SEMANTICS ACCEPTED / DEPLOY NOT AUTHORIZED | Fresh exact deploy authorization if/when deployment becomes current priority |
| D5-COPY-001 | Copy Own Previous MBO | OPEN | Implement approved carry-forward whitelist with fresh target-year configuration |
| D6-E2E-001 | Integrated E2E/security/regression | PENDING | After D1–D5 implementation/configuration are sufficiently ready |

## Closed / accepted D1 checkpoints

```text
APP53_MBO_Kintone_User_FIELD = PASS / LIVE
APP53_DEDICATED_MAPPING_24 = PASS
APP794_TWO_BUTTON_FIX_01_06_11 = PASS
GM_User_REQUIRED_FALSE = PASS
MBO_DEDICATED_ACCESS_APP_PERMISSION = PASS
D1_CLEAN_DEDICATED_ROUTING_SNAPSHOT_RECORD_12 = PASS
OWN_MBO_SELF_APPRAISER_ELISION_PAPATCHAYA = PASS
PAPATCHAYA_TO_PATTAMA_NATIVE_WORKFLOW = PASS
```

Do not reopen these without regression evidence.

## D1 authority reminders

Approval authority must never come from App795 static membership, `Manager_User`, `GM_User`, `First_Manager_User`, caller role strings or UI visibility. Current native App794 `Assignee` is the authoritative current approval identity for Dedicated approvers.

SHARED approver authority remains denied.

## App53 production boundary

```text
APP53_TOTAL_RECORDS = 281
MBO_Kintone_User = USER_SELECT / optional / live
DEDICATED_MAPPINGS = 24 verified
UNEXPECTED_NONEMPTY = 0
APP53 SCHEMA WRITE AUTH = NONE
APP53 RECORD WRITE AUTH = NONE
APP53 BULK WRITE AUTH = NONE
```

App53 remains read-only by default. No additional mapping/normalization write is authorized automatically.

## Own-MBO route rule

`OWN_MBO_SELF_APPROVER_ELISION = APPROVED`: self is removed from the employee's own effective route before snapshot; remaining approvers/order/rules are preserved and shifted; no autoapproval or fabricated history; fail closed if no non-self approver remains.

Current proven example:
`TMH2 papatchaya -> pattama / M1_G1` -> Papatchaya own effective route `pattama / M1_ONLY`.

## App802

Prior sandbox continuation path is cancelled/revoked. Do not resume/delete/repair App802 without separate exact authorization.

## D7

Admin Support Center source functionality is CLOSED. Reopen only if a new proven defect exists.
