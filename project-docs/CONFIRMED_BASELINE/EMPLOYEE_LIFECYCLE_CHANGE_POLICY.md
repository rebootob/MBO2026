# CONFIRMED BASELINE — EMPLOYEE LIFECYCLE CHANGE POLICY

> Status: **CONFIRMED / DURABLE BUSINESS + SECURITY POLICY**  
> Confirmed by Owner: **2026-08-31 ICT**  
> Scope: employee resignation, transfer, department/section/team change, promotion/position change, Kintone-principal change, and manager/appraiser lifecycle change affecting App53/App795/App794/App801

## 1. Purpose

Employee organization data changes over time. MBO2026 must handle those changes without changing a person's identity, corrupting historical MBO evidence, silently replacing prior evaluators, or leaving open workflow authority assigned to a person who is no longer valid.

This policy is the durable authority for lifecycle-change semantics.

It does **not** itself authorize any App53/App794/App795/App801 write, Process change, deployment or bulk migration.

## 2. Core invariants

```text
EMPLOYEE_CODE = STABLE PERSON ID
APP53 = CURRENT EMPLOYEE / ORGANIZATION / POSITION TRUTH
APP795 = CURRENT ROUTING CONFIGURATION FOR FRESH ROUTE RESOLUTION
APP794 = ANNUAL MBO HISTORICAL SNAPSHOT + CURRENT WORKFLOW TRUTH
CURRENT_APPROVAL_AUTHORITY = AUTHORITATIVE NATIVE CURRENT ASSIGNEE
ORG_OR_POSITION_CHANGE != AUTOMATIC RETROACTIVE APP794 REWRITE
MID_CYCLE_CHANGE = HR_CONTROLLED EXPLICIT OPERATION + AUDIT
```

Rules:
- Employee_Code does not change merely because the employee changes Department, Section, Team, Position, manager, or Kintone user account.
- App53 represents the current employee/master state used by future/fresh resolution.
- App795 represents current routing configuration used when a route is freshly resolved.
- an existing App794 record must not silently mutate merely because App53 or App795 later changes;
- native current Workflow assignment remains the approval-authority boundary for an existing record;
- historical MBO records are retained and must not be deleted merely because the employee later moves, is promoted, changes login principal, or leaves the company.

## 3. New MBO / fresh route after a lifecycle change

When an MBO route is freshly created or freshly resolved after the lifecycle change is effective:

```text
current valid Employee_Code
  -> current active App53 employee state
  -> current Position / Department / Section / Team
  -> current App795 route
  -> applicable own-MBO self-appraiser elision
  -> new App794 route/requester snapshot
```

Examples:
- employee transfers from one Section to another -> a future/fresh MBO resolves from the new Section/Team;
- employee is promoted from Staff to Chief/Manager/GM -> a future/fresh MBO uses the current normalized Position and current route;
- employee moves into or out of an executive routing class -> a future/fresh route uses the currently applicable executive/non-executive rule;
- a new Fiscal Year must never inherit a stale previous-year route merely for convenience.

D5 Copy Own Previous MBO must therefore continue to exclude identity/routing/workflow snapshots from carry-forward.

## 4. Existing App794 record — no silent retroactive rewrite

Default rule for an already-created App794 record:

```text
APP53_CHANGED = NO AUTOMATIC APP794 SNAPSHOT REWRITE
APP795_CHANGED = NO AUTOMATIC APP794 SNAPSHOT REWRITE
```

This protects audit/history truth.

Do not silently rewrite existing values such as:
- Requester/User actor snapshot;
- appraiser/evaluator route slots;
- Manager/GM/First-Manager compatibility fields;
- Routing_Topology;
- prior comments, scores, timestamps or completed workflow history.

If the current-year business process should continue under a new manager/appraiser after a lifecycle change, that is a deliberate **mid-cycle lifecycle amendment**, not ordinary master-data refresh.

## 5. Mid-cycle lifecycle amendment — HR controlled only

A transfer, promotion, manager replacement, approver departure, or login-principal change may require an open current-year MBO to continue with a different operational actor.

That change must be explicit and controlled.

Before any mutation, HR operation must identify:

```text
Employee_Code
Affected App794 Record ID(s)
Current Status
Current native Assignee
Current requester / route snapshot
Requested new operational actor / route
Lifecycle event type
Business reason
Effective date
Changed by
Change timestamp
```

Required execution discipline:
1. inventory impacted open records first;
2. show old vs proposed new authority before write;
3. do not bulk-edit unrelated records;
4. require exact authorized target record(s);
5. use an approved Kintone-native workflow/reassignment mechanism for current authority;
6. preserve append-only audit evidence of old/new values, reason, actor and effective date;
7. after change, read back current status/assignee/access;
8. prove the stale prior actor no longer has approval authority unless another valid current role independently grants it;
9. no automatic rollback; rollback/reversal requires its own reviewed authorization.

If future remaining appraiser slots must also change, the implementation must preserve the previous route as audit evidence before changing operational route data. A silent overwrite with no trace is forbidden.

## 6. Resignation / inactive employee

Canonical App53 active-state rule remains:

```text
Number_0 = 1 -> Active/current
Number_0 = 0 -> Inactive/former
blank        -> not accepted as Active
```

For a resigned/inactive employee:
- Dedicated Employee-Self auto-binding must fail closed because the employee is no longer an active App53 identity row;
- no new Employee-Self MBO may be created as an active employee through normal flow;
- historical App794 MBO records remain retained for HR/audit according to permissions;
- historical scores/comments/attachments/workflow must not be deleted or rewritten solely because the person left;
- an open MBO must not be silently deleted, auto-completed or auto-approved; HR must resolve its business disposition explicitly;
- if the person uses the Shared MBO credential path, D4 lifecycle operations must support disabling the relevant App801 account and invalidating active App801 session state under controlled authorization;
- if the departing person is a current appraiser/approver for other employees, impacted open tasks must be inventoried and explicitly reassigned.

`RESIGNED != DELETE HISTORY`.

## 7. Transfer / Department / Section / Team change

Employee_Code remains unchanged.

App53 becomes the current organizational truth after the source change is approved.

Behavior:
- future/fresh route resolution uses the new current organizational values;
- existing App794 record does not change route automatically;
- if management wants the new organizational appraiser to take over the current-year MBO, HR must execute a mid-cycle lifecycle amendment under Section 5;
- previous workflow events remain historical truth;
- no automatic score reset, objective reset, history fabrication or duplicate own-MBO creation is permitted.

## 8. Promotion / Position change

Promotion or position change does not create a new employee identity.

```text
Employee_Code before = Employee_Code after
```

Future/fresh route resolution must use the current normalized Position, including executive-route precedence where applicable.

Existing App794 route/history remains unchanged by default. Any current-year handoff to a different evaluator chain requires the explicit HR-controlled amendment path.

This rule applies to changes such as Staff -> Chief, Chief -> Manager, Manager -> GM, or movement into/out of DGM/GM/VP routing classes.

## 9. Kintone user/principal change

A Kintone User Code is an authentication/business principal, not the stable person identifier.

If an employee's dedicated Kintone account changes:
- Employee_Code remains unchanged;
- App53 `MBO_Kintone_User` mapping must be changed only through protected exact authorization;
- old principal must no longer auto-bind to the employee after the effective mapping change;
- new principal may bind only after exact active mapping succeeds;
- do not create a second Employee_Code or duplicate own MBO;
- do not mass-rewrite historical actor evidence merely to replace the old username;
- open App794 records that depend operationally on the old requester/current actor must be impact-reviewed and explicitly rebound/amended only where needed, with audit evidence.

Historical evidence should continue to show who actually acted at the time.

## 10. Manager / appraiser transfer, promotion or resignation

Changing App795 updates the route used for future/fresh resolution. It does **not** automatically remove authority from already-open App794 records whose current native assignee is still the old user.

Required handling:

```text
find open App794 records where current Assignee = departing/changing actor
-> classify impacted records
-> resolve approved replacement
-> HR-controlled reassignment
-> readback
-> stale prior authority denial
```

Do not solve an appraiser departure by silently rewriting all historical records or by relying on static App795 membership as current authority.

## 11. D1 / D4 / D6 ownership

This policy does **not** reopen D1 merely because lifecycle operations are not yet implemented end-to-end.

```text
D1 = identity/security architecture and proven access boundary -> remains CLOSED unless regression is proven
D4 = HR lifecycle operational capability -> implementation/UAT responsibility
D6 = integrated lifecycle/security regression -> final project proof
```

D4 must ultimately provide controlled operational support for at least:
- identify inactive/resigned employees affecting active MBOs;
- identify current tasks assigned to a departing/changing appraiser;
- controlled current-assignee reassignment;
- controlled handling of remaining future route when business-approved;
- shared App801 disable/session invalidation where applicable;
- dedicated mapping/principal-change impact handling;
- old/new/reason/effective-date audit evidence;
- readback and exception reporting.

D6 must include lifecycle regression for resignation, transfer, promotion, manager/appraiser departure and Kintone-principal change.

## 12. Minimum D6 lifecycle security assertions

At minimum prove:
- inactive employee cannot obtain normal Employee-Self access;
- historical MBO remains retained and authorized HR can still inspect it;
- transfer/promotion does not silently rewrite an existing App794 record;
- new/fresh MBO resolves current App53/App795 values;
- current approver departure can be reassigned under controlled HR authority;
- stale prior approver loses current approval authority after reassignment;
- static App795 membership alone still cannot authorize an existing task;
- Kintone-principal change does not create duplicate Employee identity/MBO ownership;
- old historical actor evidence is not fabricated or silently rewritten;
- D5 carry-forward does not copy stale requester/route/workflow data.

## 13. Fail-closed / authorization rule

If lifecycle state is ambiguous, incomplete, duplicate, or cannot be safely reconciled, stop and send the case to HR rather than guessing.

```text
NO_LIFECYCLE_WRITE_WITHOUT_EXACT_AUTHORIZATION = YES
NO_AUTOMATIC_EXISTING_MBO_REROUTE = YES
NO_AUTOMATIC_HISTORY_REWRITE = YES
NO_AUTOMATIC_DELETE_ON_RESIGNATION = YES
NO_STATIC_APP795_CURRENT_AUTHORITY = YES
```

Any future change to these lifecycle semantics must update this Baseline in the same reviewed control cycle.
