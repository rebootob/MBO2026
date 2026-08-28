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

## 3. Employee-Self Delete Policy

Employee-Self users must **not be able to delete App794 MBO records**.

This is a security requirement, not merely a visual preference.

Required protection layers:
1. My MBO custom UI contains no Delete action.
2. Employee-Self delete attempts from App794 detail must fail closed through a supported Kintone delete-submit guard tied to the authenticated MBO principal.
3. Cross-employee ownership checks remain unchanged.
4. No REST/API delete path may be added for Employee-Self.
5. Before final D1 closure, App794 Kintone permission/ACL must be checked READ-ONLY to confirm whether the shared/employee-facing Kintone principal can delete records. If Kintone Delete permission is currently allowed, changing that ACL requires separate explicit live authorization.

Technical-admin/HR deletion policy is outside this baseline unless separately authorized. Do not silently remove technical administration capabilities.

## 4. UX

My MBO should remain the approved bilingual coherent shell.

Recommended list columns:
- `ปีงบประมาณ / Fiscal Year`
- `รหัสบันทึก / Record Key`
- `สถานะ / Status`
- `การดำเนินการ / Action`

The primary record action should be a bilingual view/detail action such as `ดูรายละเอียด / View Details` or `ดูย้อนหลัง / View History`; do not label the list action `View / Edit` as a blanket promise of edit rights.

## 5. Non-Goals

This baseline does not authorize:
- App794 deploy;
- App794 ACL write;
- App801 write;
- record deletion;
- routing/scoring changes;
- D2-D7 writes.
