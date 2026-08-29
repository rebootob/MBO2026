# CONFIRMED BASELINE — D1 EMPLOYEE-SELF MY MBO HISTORY / NO-DELETE

Status: **CONFIRMED / MANDATORY**
Confirmed by user: 2026-08-29
Scope: App794 Employee-Self My MBO list and record access behavior

## 1. My MBO List Ownership

After successful MBO login, the Employee-Self index must show only MBO records whose `Employee_Code` exactly matches the authenticated MBO Employee Code.

Required query behavior:
- exact `Employee_Code` match to authenticated Employee Code;
- newest Fiscal Year first;
- no cross-employee records;
- empty state when that employee has no MBO records.

## 2. History / Past MBO Access

The employee must be able to open prior MBO records from the My MBO list for review/history.

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
2. When an authenticated MBO Employee-Self principal exists (`mboLoginGate.getEmployeeCode()`), supported Kintone delete-submit events must be cancelled fail-closed with a bilingual Employee-Self message.
3. The Employee-Self delete guard is **not** an Admin/HR authorization engine. If no authenticated MBO Employee-Self principal exists, this guard must abstain and return the original event unchanged; existing Kintone permissions and separately governed Admin/HR policies remain authoritative.
4. Missing/invalid Employee-Self sessions are already blocked from Employee-Self record rendering by the MBO Login Gate; the delete guard must not convert that condition into a global deny-all policy for every App794 user.
5. Cross-employee ownership checks remain unchanged.
6. No REST/API delete path may be added for Employee-Self.
7. Kintone App-level permission must independently deny Delete to the employee-facing access group; source/UI guards are defense-in-depth and are not a substitute for native permission denial.

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

Technical-admin/HR deletion policy remains outside this baseline unless separately authorized. Do not silently remove technical administration capabilities.

## 5. UX

My MBO should remain the approved bilingual coherent shell.

Recommended list columns:
- `ปีงบประมาณ / Fiscal Year`
- `รหัสบันทึก / Record Key`
- `สถานะ / Status`
- `การดำเนินการ / Action`

The primary record action should be a bilingual view/detail action such as `ดูรายละเอียด / View Details` or `ดูย้อนหลัง / View History`; do not label the list action `View / Edit` as a blanket promise of edit rights.

## 6. Non-Goals

This baseline does not authorize:
- App794 deploy;
- any further App794 ACL write;
- App801 write;
- record deletion;
- routing/scoring changes;
- D2-D7 writes.
