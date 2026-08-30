# AI ACTIVE TASK — D1 HYBRID IDENTITY BLOCKER RESOLUTION DESIGN R1

Mode: **CHATGPT CONTROL-PLANE DESIGN / USER BUSINESS DECISION ONLY — NO SOURCE CHANGE / NO LIVE WRITE / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`

## 0. Starting Point

Hybrid Identity Mapping & Dual-Role READ-ONLY Audit R1/R2 is complete.

Evidence:
`project-docs/D1_HYBRID_IDENTITY_MAPPING_DUAL_ROLE_AUDIT_R1_EVIDENCE.md`

Audit safety:
```text
R1 GET=10 / POST=0 / PUT=0 / DELETE=0
R2 GET=8  / POST=0 / PUT=0 / DELETE=0
```

Audit result:
```text
APP53_MAPPING_SOURCE                           = SOURCE_FIELD_NOT_PRESENT
NATTA_EXACT_EMPLOYEE_CODE_MAPPING             = NOT_PROVABLE
VASSANA_EXACT_EMPLOYEE_CODE_MAPPING           = NOT_PROVABLE_FROM_AUTHORITATIVE_MAPPING_FIELD
NATTA_SELF_APPROVAL_CONFLICT                   = CONFIRMED
VASSANA_SELF_APPROVAL_CONFLICT                 = NO_CURRENT_CONFLICT_FOUND
DEDICATED_NATTA_NATIVE_APP794_ACCESS           = NOT_GRANTED_BY_CURRENT_APP_ACL
DEDICATED_VASSANA_NATIVE_APP794_ACCESS         = NOT_GRANTED_BY_CURRENT_APP_ACL
HYBRID_IDENTITY_SOURCE_IMPLEMENTATION_READY    = NO
```

Antigravity source execution is NOT authorized in this task.

## 1. Confirmed Architecture That Must Be Preserved

```text
HYBRID_IDENTITY = DEDICATED_KINTONE_AUTO_BIND + SHARED_ACCOUNT_MBO_LOGIN
```

Dedicated user target:
```text
native Kintone login
-> exact authoritative Kintone User Code <-> active Employee_Code mapping
-> Employee-Self auto-bind
-> no secondary MBO Employee_Code/password login
```

Shared user target remains:
```text
approved shared Kintone principal
-> Employee_Code + App801 MBO password
-> Employee-Self scope
```

Dual-role separation:
```text
My MBO ownership  = bound Employee_Code
Approver identity = current dedicated Kintone User
Approval Tasks    = current authoritative native Workflow assignee == dedicated Kintone User
```

`admin-form` remains technical admin only and never Employee-Self or normal Approver.

## 2. Blocker A — Physical Mapping Source

R2 App53 schema proves:
- `emp_text` = Employee ID;
- `Number` = Code;
- `Number_0` = employee active Status;
- `Drop_down` = Section;
- `Drop_down_0` = Department;
- `Drop_down_1` = Section Name;
- `Drop_down_2` = Team;
- `Text_2` = Position;
- `Text_4` = Email;
- `Text_6` = Vendor Account Number;
- no USER_SELECT field exists;
- no reviewed Kintone User Code/login mapping field exists.

Therefore:
```text
DEDICATED_MAPPING_PHYSICAL_SOURCE = SOURCE_FIELD_NOT_PRESENT
```

Do not infer mapping from name, email, App795 route membership, or Vendor Account Number.

### Decision required
Control Plane must recommend and user must explicitly choose an authoritative physical mapping source before any implementation.

Preferred design candidate to evaluate:
- add one dedicated Kintone user mapping field to protected App53, using a Kintone `USER_SELECT` field with one user only per active employee row;
- do not create a duplicate employee master;
- exact field code/name and schema change require separate explicit authorization before write.

No App53 schema write is authorized by this design task.

## 3. Blocker B — Natta Self-Approval

Read-only facts:
```text
Natta Kintone User = natta
App53 Record       = 578
Position           = Manager
Section            = TMG1
Team               = Marketing
Current own route  = TMG1|Marketing
Manager L1         = natta
GM L1              = uchida
```

Therefore current own route conflicts with the canonical no-self-approval rule:

```text
NATTA_SELF_APPROVAL_ROUTE_CONFLICT = CONFIRMED
```

### Forbidden implicit behaviors
- do not auto-approve;
- do not silently skip Natta;
- do not silently treat `uchida` as the route without an explicit business rule;
- do not alter App795 route for subordinate TMG1/TMG2 Marketing merely to fix Natta's own MBO.

### Decision required
User must approve a specific own-MBO exception rule for employees whose resolved route includes themselves.

Control Plane should present the smallest safe options, with recommended option separated from alternatives.

## 4. Blocker C — Dedicated App794 Native Access

Current App794 App ACL:
```text
CREATOR             = full
MBO_EMPLOYEE_ACCESS = View/Add/Edit
Everyone            = denied
Record ACL           = empty
Field ACL            = empty
```

Current `MBO_EMPLOYEE_ACCESS` members:
```text
t1,t2,s1,f1,f2,f3,e1,tmh,g_request
```

`natta` and `vassana` are not members.

Therefore dedicated users cannot rely on current native App794 access.

### Security target
A later design must permit a dedicated user to access:
1. own MBO record by exact bound Employee_Code;
2. records currently assigned to the user's native Kintone principal for approval;
3. no arbitrary other employee records.

UI hiding / JavaScript filtering is not an authorization boundary.
Do not grant App801 access solely to simulate shared-login behavior.

### Decision/design required
Control Plane must define the least-privilege native Kintone App/Record ACL strategy and prove it is technically compatible with Kintone's permission model before implementation.

## 5. Vassana Reference Case

```text
Kintone User = vassana
App53 Record = 456
Position     = Deputy General Manager
Section      = TMF3
Employee ID  = 0044
Active       = 1
```

Position override applies before Section routing.
Current App795 `POSITION_DGM` resolves Manager L1 to `tsuchihira`.

```text
VASSANA_SELF_APPROVAL_ROUTE_CONFLICT = NO_CURRENT_CONFLICT_FOUND
```

Vassana remains Manager L1 Approver for TMF1/TMF2/TMF3, but that static App795 membership alone must never authorize a record action.

## 6. App794 Approval Task Model — Structural Result

App794 schema/process already exposes:
```text
Assignee (STATUS_ASSIGNEE)
Requester_User
First_Manager_User
Manager_User
GM_User
Employee_Code
Fiscal_Year
Status
```

The target design remains:
```text
My Approval Tasks = current records whose authoritative native Assignee contains the current dedicated Kintone User
```

At audit time App794 contained only one current record and no Natta/Vassana target match, so no live task-count UAT claim is accepted yet.

## 7. Exact Allowed Actions

Allowed:
- ChatGPT architecture/security design;
- repository read-only inspection;
- user decision collection;
- Control Plane documentation updates.

Not allowed:
```text
ANTIGRAVITY_SOURCE_CHANGE   = 0
APP53_SCHEMA_WRITE          = 0
APP53_RECORD_WRITE          = 0
APP794_ACL_WRITE            = 0
APP794_RECORD_WRITE         = 0
APP795_ROUTE_WRITE          = 0
PROCESS_WRITE               = 0
CUSTOMIZATION_UPLOAD        = 0
DEPLOY                      = 0
PASSWORD_RESET_EXECUTION    = 0
ROLLBACK                    = 0
```

## 8. Exit Criteria

This design task closes only when user decisions are explicit for all three blockers:

1. authoritative dedicated Kintone User mapping source;
2. Natta/self-route exception semantics;
3. dedicated App794 least-privilege native access model.

Then Control Plane must update relevant confirmed baselines and create a narrow source implementation WP.

Do not start implementation from assumptions.

## 9. Next Owner

```text
NEXT_OWNER = CHATGPT CONTROL PLANE + USER
NEXT_STEP  = present recommended blocker-resolution design and obtain explicit decisions
```
