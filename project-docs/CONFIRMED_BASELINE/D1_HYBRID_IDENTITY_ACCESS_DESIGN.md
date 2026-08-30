# CONFIRMED BASELINE — D1 HYBRID IDENTITY ACCESS DESIGN

> Status: **CONFIRMED BUSINESS DESIGN / LIVE KINTONE WRITES NOT YET AUTHORIZED**  
> Confirmed by user: **2026-08-30 — “เอาตามที่แนะนำ”**  
> Scope: dedicated Kintone employee mapping, own-MBO self-approval exception, dedicated App794 least-privilege access design

---

## 1. Confirmed Hybrid Identity Architecture

```text
HYBRID_IDENTITY = DEDICATED_KINTONE_AUTO_BIND + SHARED_ACCOUNT_MBO_LOGIN
```

Dedicated employees/approvers use native Kintone authentication and must resolve through an exact authoritative mapping to exactly one active App53 Employee_Code. Shared Kintone principals continue to use Employee_Code + App801 MBO password/session.

No external server, external authentication service, reverse proxy, or duplicate Employee Master is introduced.

---

## 2. Confirmed Physical Mapping Design — App53

Read-only Audit R2 proved App53 currently has no USER_SELECT field and no authoritative Kintone User Code/login mapping field.

The approved physical mapping design is to add one dedicated App53 field:

```text
Field Code = MBO_Kintone_User
Label      = MBO Kintone User
Type       = USER_SELECT
Purpose    = authoritative dedicated Kintone User <-> Employee_Code mapping
```

Business/data rules:
- mapping applies only to active employees (`Number_0 = 1`);
- runtime requires exactly one selected Kintone user for a dedicated employee mapping;
- current Kintone User Code must match the selected App53 user code exactly;
- matched App53 row must contain a valid canonical Employee_Code in `emp_text`;
- duplicate/multiple active mappings fail closed;
- missing mapping fails closed;
- do not infer mapping from employee name, email, Position, Section, Team, App795 approver membership, `Text_6` Vendor Account Number, or any similarity heuristic;
- do not create a duplicate Employee Master.

Canonical failure classes remain:

```text
IDENTITY_MAPPING_MISSING
IDENTITY_MAPPING_AMBIGUOUS
```

### Current target evidence

Vassana:
```text
Kintone User = vassana
App53 Record = 456
Employee_Code/emp_text = 0044
Active = 1
```

Natta:
```text
Kintone User = natta
App53 Record = 578
Employee_Code/emp_text = BLANK
Active = 1
```

Therefore Natta cannot become `IDENTITY_BOUND` until the real canonical Employee_Code is provided/corrected in App53. Do not substitute `Number = 243`, Vendor Account Number, email, or a guessed padded value.

### Write authorization boundary

This Baseline confirms the design only. It does **not** authorize:
- adding `MBO_Kintone_User` to App53;
- populating Natta/Vassana mapping values;
- correcting Natta `emp_text`;
- any App53 schema or record write.

Those are protected changes requiring a separate exact user authorization.

---

## 3. Confirmed Own-MBO Self-Approval Exception

Default rule remains: self-approval is prohibited.

The user explicitly approved one narrow exception transformation for an employee's **own MBO only**:

```text
OWN_MBO_SELF_APPROVER_ELISION = APPROVED
```

When the resolved App795 route for the employee's own MBO contains the same dedicated Kintone user as an appraiser:
1. remove only that self appraiser from the effective route before the App794 workflow snapshot is created;
2. preserve every remaining appraiser in the original order;
3. shift remaining appraisers left into the effective sequential appraiser slots;
4. recalculate the effective routing topology from the remaining appraisers;
5. never execute an approval automatically;
6. never create a synthetic approval event/comment/history item;
7. never modify the underlying App795 route merely to solve the person's own MBO;
8. subordinate/other-employee routes remain unchanged;
9. if no valid non-self appraiser remains, fail closed and do not create/submit an actionable self-approval route.

This is an explicit business rule, not a silent skip and not an auto-approval.

### Confirmed Natta example

Current App795 route:

```text
TMG1|Marketing
1st = natta
2nd = uchida
```

For Natta's own MBO only, approved effective route becomes:

```text
1st Appraiser = uchida
Routing_Topology = M1_ONLY
```

For every other TMG1/TMG2 Marketing employee, the route remains unchanged:

```text
employee -> natta -> uchida
```

Runtime/UI should make the effective own-route adjustment observable in route preview/technical details; it must not pretend Natta approved herself.

---

## 4. Confirmed Dedicated App794 Access Principle

Dedicated users must be separated from the shared-principal native access group.

```text
MBO_EMPLOYEE_ACCESS = shared MBO-login principals only
Dedicated users     = separate native access boundary
```

Approved technical group code for the dedicated boundary:

```text
MBO_DEDICATED_ACCESS
```

Dedicated users must not receive App801 View/Edit merely to support Employee-Self auto-binding.

Target App794 App-level permission for `MBO_DEDICATED_ACCESS`:

```text
View records   = YES
Add records    = YES
Edit records   = YES
Delete records = NO
Import         = NO
Export         = NO
App Admin      = NO
```

App-level permission alone is not sufficient authorization. Record-level permission is mandatory.

---

## 5. Confirmed Native Record-ACL Model for Dedicated Users

Kintone Record Permissions support `FIELD_ENTITY` entries that grant permissions to the user contained in a User field. This permits native record authorization to follow the existing App794 user snapshot fields without creating another employee master or duplicating owner identity.

Canonical field roles:

```text
Requester_User       = effective requester / dedicated own-record principal
First_Manager_User   = current 1st-manager field where that stage exists
Manager_User         = current manager/appraiser field
GM_User              = current GM/appraiser field
```

Dedicated native access target:

```text
My MBO
  -> Requester_User contains current dedicated Kintone user

My Approval Tasks
  -> current workflow stage corresponds to the relevant approver field
  -> that field contains current dedicated Kintone user
```

Record ACL must be status-aware because Manager_User/GM_User/First_Manager_User may remain populated after a record advances. Static App795 membership or a stale snapshot field alone is not enough.

Required behavior:
- own dedicated user can view own MBO throughout its lifecycle;
- own dedicated user can edit only during employee/requester-controlled statuses permitted by the business workflow;
- First Manager can view/edit only during the applicable First-Manager review statuses;
- Manager can view/edit only during Manager review statuses;
- GM can view/edit only during GM review statuses;
- after transition/reassignment, prior approver access must disappear unless that person is also the record owner or has another currently valid role;
- `15 HR Final Check` remains governed by HR native authorization, not the dedicated employee group;
- `16 Completed` remains viewable to the own dedicated requester but not editable through the employee role;
- `admin-form` remains Technical Admin only and gains no business workflow authority from this design.

The exact ordered Record ACL payload, status filters, preview revision, and readback checks must be prepared/reviewed before any live ACL write.

---

## 6. Shared-Principal Compatibility

The existing shared path remains intentionally separate:

```text
MBO_EMPLOYEE_ACCESS
= t1,t2,s1,f1,f2,f3,e1,tmh,g_request
```

Shared principals continue to use App801-backed MBO Employee_Code/password identity. They do not gain Approver mode merely because they can access App794.

The previously documented Kintone-only security ceiling remains:

```text
DIRECT_URL_REST_HARD_ISOLATION = NOT_GUARANTEED_UNDER_SHARED_KINTONE_ACCOUNT
```

Do not weaken the dedicated native ACL model to imitate this shared-account limitation.

---

## 7. Dedicated Create-Path Security Note

A dedicated principal requires native App794 Add permission to create an MBO inside the current Kintone-only architecture. Normal UI/source must auto-bind Employee_Code from the authoritative App53 mapping and must not expose an employee selector.

However, browser customization is not a privileged server-side enforcement layer. Final D1 security review must not claim stronger direct-REST create-field integrity than Kintone native permissions can actually prove.

Required source behavior remains fail-closed and exact:

```text
current Kintone User
-> App53 MBO_Kintone_User exact active row
-> canonical emp_text Employee_Code
-> App53 snapshot
-> App795 effective route
-> duplicate check
-> App794 create
```

Any unresolved native direct-REST creation limitation must remain explicitly documented at final D1 closure rather than hidden by UI claims.

---

## 8. Implementation Order — Confirmed Plan

Implementation is split into separate gates so source work and protected live configuration cannot be conflated.

### Gate A — Source/Test only

Implement and test:
- dedicated App53 mapping resolver using `MBO_Kintone_User` + active `Number_0` + canonical `emp_text`;
- dedicated-vs-shared mode selection with no UI toggle;
- effective requester = dedicated Kintone user for dedicated mode;
- own-MBO self-appraiser elision and effective topology recalculation;
- `My MBO` vs `My Approval Tasks` separation;
- current native assignee revalidation for Approver actions;
- missing/ambiguous mapping fail-closed;
- Natta blank Employee_Code remains fail-closed in tests/evidence;
- shared path regression unchanged.

No App53/App794/App795/App801 live write or deployment is authorized by Gate A.

### Gate B — Protected Kintone configuration

Requires a separate exact user authorization before execution:
- add App53 `MBO_Kintone_User` USER_SELECT field;
- populate reviewed dedicated mappings;
- correct Natta `emp_text` only after the real Employee_Code is provided/verified;
- create/populate `MBO_DEDICATED_ACCESS` group as approved;
- update App794 App ACL and Record ACL to the independently reviewed exact payload;
- perform preview/live deployment/readback only under the specific authorization.

### Gate C — Controlled Live UAT

After source + configuration are independently accepted:
- dedicated Vassana auto-bind / My MBO / own route;
- dedicated Natta auto-bind only after real Employee_Code exists;
- Natta own route shows Uchida as effective sole appraiser, with no self-approval event;
- Natta/Vassana approval tasks appear only when currently assigned;
- unassigned arbitrary record access denied for dedicated users;
- transition away removes Approver access;
- shared MBO login regression remains accepted;
- final D1 independent review.

---

## 9. Authorization State

```text
BUSINESS_DESIGN_CONFIRMED       = YES
APP53_SCHEMA_WRITE_AUTH         = NONE
APP53_RECORD_WRITE_AUTH         = NONE
APP794_APP_ACL_WRITE_AUTH       = NONE
APP794_RECORD_ACL_WRITE_AUTH    = NONE
GROUP_WRITE_AUTH                = NONE
CUSTOMIZATION_DEPLOY_AUTH       = NONE
SOURCE_IMPLEMENTATION_AUTH      = NOT IMPLIED BY LIVE WRITE
```

No live write/deploy is authorized by this Baseline.

---

## 10. Change Rule

Any change to:
- `MBO_Kintone_User` as the authoritative mapping design;
- exact-one-user / active-row / canonical-emp_text mapping rules;
- own-MBO self-appraiser elision semantics;
- Natta effective own-route behavior;
- separation of `MBO_DEDICATED_ACCESS` from `MBO_EMPLOYEE_ACCESS`;
- status-aware FIELD_ENTITY Record ACL architecture;
- `Requester_User` as the dedicated effective requester/own-record principal;

requires an explicit user decision and same-cycle Baseline update.
