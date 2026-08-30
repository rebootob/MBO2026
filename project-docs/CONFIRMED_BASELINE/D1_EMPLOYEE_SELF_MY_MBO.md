# CONFIRMED BASELINE — D1 EMPLOYEE-SELF MY MBO HISTORY / NO-DELETE

Status: **CONFIRMED / MANDATORY**
Confirmed by user: 2026-08-29; Hybrid Identity extension confirmed 2026-08-30
Scope: App794 Employee-Self My MBO list and record access behavior

## 1. My MBO List Ownership

`My MBO` is always scoped to the exact **bound Employee_Code**, regardless of how that Employee_Code was authenticated/resolved.

Canonical identity sources:

```text
Dedicated Kintone user
  -> exact authoritative Kintone User <-> active Employee_Code mapping
  -> bound Employee_Code

Shared Kintone user
  -> successful Employee_Code + MBO password/session
  -> bound Employee_Code
```

Required query behavior:
- exact `Employee_Code` match to bound Employee_Code;
- newest Fiscal Year first;
- no cross-employee records;
- empty state when that employee has no MBO records;
- no user-selectable Employee_Code switch;
- dedicated Kintone auto-bind must not widen My MBO to records the same person can approve for others.

A dual-role Employee + Approver still has exactly one own MBO per Fiscal Year. Approval tasks are a separate context defined by `D1_AUTH_SECURITY.md`, `ROUTING_WORKFLOW.md`, and `UI_UX.md`.

## 2. History / Past MBO Access

The employee must be able to open prior owned MBO records from the My MBO list for review/history.

User-facing list action must be view-oriented, not delete-oriented. The list must not present a Delete action.

Opening a list row/action must navigate to the owned App794 record detail view. Existing lifecycle/stage rules continue to decide whether any current record functionality is editable; this baseline does not widen edit rights.

## 3. Status Display Rule

The My MBO `สถานะ / Status` column must reflect the authoritative workflow status.

Canonical final workflow status is `16 Completed`.

Display rule:
- when the authoritative App794 workflow status is `16 Completed` or already `Completed`, display exactly `Completed` in My MBO;
- while the workflow is still `15 HR Final Check`, do **not** display `Completed` yet;
- do not infer completion from Fiscal Year, dates, score presence, or any other heuristic;
- this is a My MBO display normalization only and does not change workflow/routing semantics.

## 4. Employee-Self Delete Policy

Employee-Self users must **not be able to delete App794 MBO records**.

This is a security requirement, not merely a visual preference.

Required protection layers:
1. My MBO custom UI contains no Delete action.
2. When a valid Employee-Self bound Employee_Code exists, supported Kintone delete-submit events for that Employee-Self context must be cancelled fail-closed with a bilingual message.
3. The bound Employee_Code may come from either dedicated Kintone auto-binding or the shared MBO Login/session path; delete protection must not depend solely on `mboLoginGate.getEmployeeCode()` once Hybrid Identity is implemented.
4. The Employee-Self delete guard is **not** an Admin/HR/Approver authorization engine. If there is no valid Employee-Self context, this guard must abstain and separately governed native/business authorization remains authoritative.
5. Missing/invalid identity state is already blocked from Employee-Self rendering; the delete guard must not convert that condition into an unreviewed global deny-all policy for every App794 context.
6. Cross-employee ownership checks remain mandatory.
7. No REST/API delete path may be added for Employee-Self.
8. Kintone App-level permission must independently deny Delete to employee-facing principals; source/UI guards are defense-in-depth and are not a substitute for native permission denial.

### Accepted live App794 ACL — 2026-08-29

Initial read-only evidence under Kintone `admin-form` showed `everyone` had View/Add/Edit/Delete=true and there was no explicit `MBO_EMPLOYEE_ACCESS` row. User explicitly authorized a narrow App794 App-ACL correction.

Live correction completed with read-back:

```text
ACL revision: 43 -> 44

CREATOR
  existing technical-admin full rights preserved

MBO_EMPLOYEE_ACCESS
  View   = YES
  Add    = YES
  Edit   = YES
  Delete = NO
  Manage = NO
  Import = NO
  Export = NO

everyone
  View/Edit/Add/Delete/Manage/Import/Export = NO

APP794_ACL_CORRECTION_OVERALL_PASS = true
```

The App794 ACL-write authorization used for this correction is consumed/closed. Further ACL changes require a new explicit authorization.

Hybrid Identity implementation must separately verify the native App794 access needed by dedicated Kintone employee/approver principals. This baseline does **not** authorize broadening `everyone` or reusing `MBO_EMPLOYEE_ACCESS` as a shortcut for dedicated-user App801 access.

Technical-admin/HR deletion policy remains outside this baseline unless separately authorized. Do not silently remove technical administration capabilities.

## 5. UX

My MBO should remain the approved bilingual coherent shell.

Recommended list columns:
- `ปีงบประมาณ / Fiscal Year`
- `รหัสบันทึก / Record Key`
- `สถานะ / Status`
- `การดำเนินการ / Action`

The primary record action should be a bilingual view/detail action such as `ดูรายละเอียด / View Details` or `ดูย้อนหลัง / View History`; do not label the list action `View / Edit` as a blanket promise of edit rights.

For a dual-role dedicated user, the App794 Home must present `My MBO` separately from `My Approval Tasks`. Records shown because the user is an Approver must never appear as owned My MBO rows.

## 6. Hybrid Identity UAT Additions

Before D1 closure prove:
- dedicated mapped user My MBO = exact own Employee_Code only;
- shared MBO-login user My MBO = exact authenticated Employee_Code only;
- dual-role user's approval tasks do not leak into My MBO;
- clicking an approval task does not change the bound Employee-Self identity;
- returning from approval work restores/retains the same own My MBO identity;
- self-approval is denied under the routing/security baseline;
- no Employee-Self delete becomes available in either identity mode.

## 7. Non-Goals

This baseline does not authorize:
- App794 deploy;
- any further App794 ACL write;
- App801 write;
- App53 schema/record write;
- record deletion;
- routing/scoring changes;
- D2-D7 writes.
