# MBO2026 — PROJECT CONTEXT & SCOPE

> Updated: 2026-08-30 20:45 ICT

MBO2026 is TTMET's Kintone-only Management By Objectives / Performance Management system. The project consolidates annual planning, Mid-Year review, Self Evaluation, multi-step Appraiser evaluation, HR Final operations, legacy export/migration and administration around App794 and related MBO apps.

## Operating roles

- **Employee / Appraisee** — owns exactly one MBO per Fiscal Year, sets objectives, records Mid-Year progress and Self Evaluation.
- **Appraiser / Approver** — may review/approve records only when the user's dedicated Kintone principal is the authoritative current native Workflow assignee.
- **HR** — manages annual process/phase configuration, monitoring, approved account operations, routing/scoring/Hoshin/revision administration and reports.
- **Technical Admin (`admin-form`)** — diagnosis/recovery only; no normal Employee-Self or business approval authority.

## Identity architecture

```text
HYBRID_IDENTITY = DEDICATED_KINTONE_AUTO_BIND + SHARED_ACCOUNT_MBO_LOGIN
```

### Dedicated Kintone user
Native Kintone authentication -> exact active App53 `MBO_Kintone_User` mapping design -> canonical `emp_text` Employee_Code -> Employee-Self auto-bind. No second MBO password login after exact binding.

The physical `MBO_Kintone_User` USER_SELECT field is confirmed design but is not yet live in protected Production App53.

### Shared Kintone user
Approved shared Kintone principal -> Employee_Code + App801 MBO password/session -> Employee-Self scope.

Shared-account native direct-REST hard Employee_Code isolation cannot be guaranteed and must not be overstated.

## Dual-role Employee + Approver

One person remains one employee/one own MBO per FY even if also an Approver.

```text
My MBO = bound Employee_Code
My Approval Tasks = current dedicated Kintone User + authoritative current App794 Assignee
```

App795 route membership and snapshot fields are configuration/context, not current approval authority.

Own-MBO self-appraiser handling uses the approved route-elision rule: remove self only from own effective route before snapshot, preserve remaining approvers/order/rules, never autoapprove; fail closed if no non-self approver remains.

## Seven mandatory deliverables

```text
D1 Hybrid Identity + Password + Employee-Self + Approver Access
D2 Excel + PDF Original/Legacy Format Export
D3 8 Legacy PMS Apps -> App794 Migration
D4 App800 HR Control Center End-to-End
D5 Copy Own Previous MBO
D6 Integrated E2E / Security / Regression
D7 Admin Support Center
```

Current status belongs in `AI_CONTROL_CENTER.md`; closure criteria belong in `00_MASTER_JOBLIST.md`.