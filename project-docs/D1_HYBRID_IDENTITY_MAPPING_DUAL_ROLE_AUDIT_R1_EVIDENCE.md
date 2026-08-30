# D1 HYBRID IDENTITY MAPPING & DUAL-ROLE READ-ONLY AUDIT R1 — EVIDENCE

Status: **CONTROL PLANE REVIEWED / READ-ONLY AUDIT COMPLETE / IMPLEMENTATION BLOCKED ON MAPPING SOURCE + NATTA SELF-APPROVAL RULE**

Date: 2026-08-30

## 1. Safety / Mutation Proof

User-run Browser Console evidence was READ-ONLY.

```text
R1 GET  = 10
R1 POST = 0
R1 PUT  = 0
R1 DELETE = 0

R2 GET  = 8
R2 POST = 0
R2 PUT  = 0
R2 DELETE = 0
```

No App53/App794/App795 record/schema/ACL/Process/customization/password/deploy write occurred.

## 2. Authoritative Dedicated Kintone Principals

Read-only Kintone user-directory evidence from R1:

```text
Natta   -> Kintone User Code = natta   / valid = true
Vassana -> Kintone User Code = vassana / valid = true
```

These user codes are authoritative for Approver identity only. They do not, by themselves, prove Employee_Code ownership.

## 3. App53 Physical Schema — Mapping Source Result

R2 App53 form-field readback proves:

```text
Drop_down   = Section
Drop_down_0 = Departmant
Drop_down_1 = Section Name
Drop_down_2 = Team
emp_text    = Employee ID
Number      = Code
Number_0    = Status
Text        = Name - Surname
Text_0      = ชื่อ - นามสกุล
Text_2      = Position
Text_4      = Email
Text_6      = Vendor Account Number
```

App53 contains **no USER_SELECT field** and no field whose reviewed label/code establishes an authoritative Kintone User Code/login mapping.

`Text_6` must not be used for identity mapping because it is explicitly `Vendor Account Number`.

Canonical classification:

```text
DEDICATED_MAPPING_BUSINESS_RULE   = CONFIRMED
DEDICATED_MAPPING_PHYSICAL_SOURCE = SOURCE_FIELD_NOT_PRESENT
HYBRID_AUTO_BIND_IMPLEMENTATION   = BLOCKED
```

Any App53 schema addition requires separate explicit user authorization.

## 4. Natta — App53 + Routing Facts

Exact reviewed App53 row:

```text
App53 Record ID   = 578
Name              = Ms.Natta Niphatthakosolsuk
Position          = Manager
Department        = Mold & Engineering
Section           = TMG1
Section Name      = Die Casting
Team              = Marketing
Status Number_0   = 1 (Active)
Employee ID       = blank
Code              = 243
Email             = n_natta@ttmet.co.th
Kintone User Code = natta
```

Important identity conclusion:
- `emp_text` is the source field labelled Employee ID, but it is blank for Natta.
- `Number = 243` is labelled only `Code`; it must not be silently reclassified as Employee_Code without a reviewed business/source rule.
- therefore an exact Kintone User Code -> Employee_Code mapping is **not currently provable** for Natta.

App795 readback:

```text
TMG1|Marketing -> Manager L1 = natta -> GM L1 = uchida
TMG2|Marketing -> Manager L1 = natta -> GM L1 = uchida
```

Natta's own routing context is non-executive Manager + `TMG1|Marketing`. Under the current canonical routing precedence, that own route resolves Manager L1 back to `natta`.

Canonical current result:

```text
NATTA_SELF_APPROVAL_ROUTE_CONFLICT = CONFIRMED
```

Runtime must fail closed with `SELF_APPROVAL_ROUTE_CONFLICT` until the user approves a separate business exception/routing rule. Do not silently skip Natta, auto-approve, or reinterpret the route.

## 5. Vassana — App53 + Routing Facts

Exact reviewed App53 row:

```text
App53 Record ID   = 456
Name              = Ms.Vassana Maenthong
Position          = Deputy General Manager
Department        = Industrial Services
Section           = TMF3
Section Name      = Sales Engineering
Team              = blank
Status Number_0   = 1 (Active)
Employee ID       = 0044
Code              = 44
Email             = vassana@ttmet.co.th
Kintone User Code = vassana
```

Identity conclusion:
- `emp_text = 0044` is an Employee ID value.
- there is still no authoritative App53 field linking `vassana` to `0044`; email/name similarity must not be used as the mapping boundary.
- exact dedicated auto-bind therefore remains blocked even though the employee row and Kintone principal are individually clear.

Routing conclusion:
- `Deputy General Manager` is an executive class and must use Position override before Section routing.
- active App795 `POSITION_DGM` route resolves single Manager L1 approver to `tsuchihira` with remark `Executive Direct Routing for POSITION_DGM`.
- Vassana's own route therefore does **not** self-resolve to `vassana` under the current executive routing rule.

```text
VASSANA_SELF_APPROVAL_ROUTE_CONFLICT = NO_CURRENT_CONFLICT_FOUND
```

Vassana is also Manager L1 Approver for active App795 routes `TMF1`, `TMF2`, and `TMF3`; this proves approver-role membership only, not Employee_Code ownership.

## 6. App794 / My Approval Tasks Structural Evidence

R2 App794 schema proves native fields include:

```text
Employee_Code
Requester_User
First_Manager_User
Manager_User
GM_User
Assignee (STATUS_ASSIGNEE)
Status
```

R1 Process readback proves review states use native FIELD_ENTITY assignees (`First_Manager_User`, `Manager_User`, `GM_User`) and requester-owned states use `Requester_User`.

Therefore the architectural definition remains valid:

```text
My Approval Tasks = records whose authoritative CURRENT native Workflow assignee == current dedicated Kintone User
```

However R2 found only one current App794 record and no Natta/Vassana target record match, so this audit does not claim live task-count/UAT evidence for either person.

## 7. App794 Native Access Blocker for Dedicated Users

R1 App794 App ACL readback is:

```text
CREATOR             = full
MBO_EMPLOYEE_ACCESS = View/Add/Edit
Everyone            = denied
Record ACL           = empty
Field ACL            = empty
```

R2 group-membership readback for `MBO_EMPLOYEE_ACCESS` contains only:

```text
t1, t2, s1, f1, f2, f3, e1, tmh, g_request
```

Neither `natta` nor `vassana` is a member.

Canonical conclusion:

```text
DEDICATED_NATTA_NATIVE_APP794_ACCESS   = NOT_GRANTED_BY_CURRENT_APP_ACL
DEDICATED_VASSANA_NATIVE_APP794_ACCESS = NOT_GRANTED_BY_CURRENT_APP_ACL
```

A later Hybrid Identity implementation must include a reviewed native App794 authorization design for dedicated employee/approver principals. UI hiding or JavaScript checks alone are not sufficient.

Do not grant App801 View/Edit merely to mimic shared-session behavior; dedicated identity should remain independent of App801 bearer-session proof.

## 8. Audit Outcome

```text
D1_HYBRID_IDENTITY_MAPPING_DUAL_ROLE_AUDIT_R1 = COMPLETE_WITH_BLOCKERS
APP53_MAPPING_SOURCE                           = SOURCE_FIELD_NOT_PRESENT
NATTA_EXACT_EMPLOYEE_CODE_MAPPING             = NOT_PROVABLE
VASSANA_EXACT_EMPLOYEE_CODE_MAPPING           = NOT_PROVABLE_FROM_AUTHORITATIVE_MAPPING_FIELD
NATTA_SELF_APPROVAL_CONFLICT                   = CONFIRMED
VASSANA_SELF_APPROVAL_CONFLICT                 = NO_CURRENT_CONFLICT_FOUND
DEDICATED_APP794_NATIVE_ACCESS                 = NOT_PRESENT_FOR_NATTA_OR_VASSANA
SOURCE_IMPLEMENTATION_READY                    = NO
```

## 9. Required Decisions Before Source Implementation

Control Plane must obtain explicit user decisions for:

1. **Dedicated mapping physical source** — whether to add a dedicated Kintone User mapping field to protected App53 or approve another authoritative mapping source. No schema write is authorized by this audit.
2. **Natta own-MBO self-approval exception** — approve a specific routing rule for cases where the employee is the current route's own approver, or keep fail-closed behavior. Do not silently skip.
3. **Dedicated App794 native access** — design the least-privilege native App/Record authorization that permits own MBO + currently assigned approval records without giving arbitrary cross-employee access.

Until all three are resolved and reviewed:

```text
HYBRID_IDENTITY_SOURCE_IMPLEMENTATION = BLOCKED
LIVE_WRITE                            = NO
DEPLOY                                = NO
```
