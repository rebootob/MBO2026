# MBO2026 — PROJECT CONTEXT & SCOPE

> Updated: 2026-08-31 ICT

MBO2026 is TTMET's Kintone-only Management By Objectives / Performance Management system. The project consolidates annual planning, Mid-Year review, Self Evaluation, multi-step Appraiser evaluation, HR Final operations, legacy export/migration and administration around App794 and related MBO apps.

## Operating roles

- **Employee / Appraisee** — owns exactly one MBO per Fiscal Year, sets objectives, records Mid-Year progress and Self Evaluation.
- **Appraiser / Approver** — may review/approve records only when the user's dedicated Kintone principal is the authoritative current native Workflow assignee.
- **HR** — manages annual process/phase configuration, monitoring, approved account operations, routing/scoring/Hoshin/revision administration and reports.
- **Technical Admin (`admin-form`)** — diagnosis/recovery only; no normal Employee-Self or business approval authority.

## Identity architecture — D1 closed

```text
D1 = PASS / CLOSED
HYBRID_IDENTITY = DEDICATED_KINTONE_AUTO_BIND + SHARED_ACCOUNT_MBO_LOGIN
```

### Dedicated Kintone user
Native Kintone authentication -> exact active App53 `MBO_Kintone_User` -> canonical `emp_text` Employee_Code -> Employee-Self auto-bind. No second MBO password login after exact binding.

Current operational truth:

```text
MBO_Kintone_User = USER_SELECT / optional / LIVE
DEDICATED_MAPPINGS_VERIFIED = 24
```

Current counts/evidence belong in `AI_CONTROL_CENTER.md` and `TEST_STATUS.md`.

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

## D1 Kintone-only security ceilings

```text
SHARED_DIRECT_URL_REST_HARD_ISOLATION = NOT GUARANTEED
DEDICATED_DIRECT_REST_CREATE_FIELD_INTEGRITY = LIMITED BY NATIVE APP794 ADD PERMISSION
```

These limits remain part of the confirmed project context after D1 closure.

## Employee lifecycle architecture — confirmed

Canonical durable policy: `project-docs/CONFIRMED_BASELINE/EMPLOYEE_LIFECYCLE_CHANGE_POLICY.md`.

```text
EMPLOYEE_CODE = STABLE PERSON ID
APP53 = CURRENT EMPLOYEE / ORGANIZATION / POSITION TRUTH
APP795 = CURRENT ROUTING CONFIGURATION FOR FRESH ROUTE RESOLUTION
APP794 = ANNUAL HISTORICAL SNAPSHOT + CURRENT WORKFLOW TRUTH
CURRENT_APPROVAL_AUTHORITY = AUTHORITATIVE NATIVE CURRENT ASSIGNEE
APP53_OR_APP795_CHANGE != AUTOMATIC RETROACTIVE APP794 REWRITE
MID_CYCLE_CHANGE = HR-CONTROLLED EXPLICIT OPERATION + AUDIT
```

This policy covers resignation/inactive state, Department/Section/Team transfer, promotion/Position change, Dedicated Kintone-principal change, and manager/appraiser transfer, promotion, replacement or resignation.

For existing App794 records, current routing/history/snapshots must not silently change when App53/App795 changes. If an open record must move to a new appraiser, HR must use an explicit controlled reassignment with old/new authority, reason, effective date, actor, timestamp and readback evidence. Historical MBO remains retained when an employee leaves.

Lifecycle ownership:

```text
D1 = remains CLOSED unless identity/security regression is proven
D4 = HR lifecycle operational implementation
D5 = fresh current identity/route resolution; never carry stale requester/route/workflow snapshots
D6 = integrated lifecycle/security regression
```

No lifecycle write is authorized merely because this architecture is confirmed.

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

Current checkpoint:

```text
D1 = PASS / CLOSED
EMPLOYEE_LIFECYCLE_POLICY = CONFIRMED
D2 = READY / NOT STARTED
PRE_D2_DOCUMENTATION_SYNC = COMPLETE
ACTIVE_WORK_PACKAGE = NONE
```

D2 begins only after Owner instruction. Its canonical pre-start scope is `project-docs/EXCEL_EXPORT.md`.

Current status belongs in `AI_CONTROL_CENTER.md`; closure criteria belong in `00_MASTER_JOBLIST.md`.
