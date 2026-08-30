# AI ACTIVE TASK — D1 HYBRID IDENTITY MAPPING & DUAL-ROLE READ-ONLY AUDIT R1

Mode: **CHATGPT CONTROL-PLANE READ-ONLY DISCOVERY / USER-ASSISTED KINTONE GET EVIDENCE — NO SOURCE CHANGE / NO LIVE WRITE / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`

## 0. Starting Point

App800 Reset UI source and deployment-tool compatibility are now independently accepted.

```text
APP800_RESET_UI_SOURCE_COMMIT                = a7a9f02aff6b497f3f8e0009dd377437a3701416
APP800_DEPLOY_TOOL_IMPLEMENTATION_COMMIT     = 14b911d9cde8b59b6c15e6b05bc8fccfbb6727fd
APP800_DEPLOY_TOOL_TEST_EVIDENCE_COMMIT      = 9b0377dd56b1a7b74f60dc748babd7d00f8d5fdd
APP800_DEPLOYMENT_TOOL_COMPATIBILITY_R1      = PASS
APP800_LIVE_DEPLOYED                         = NO
ACTIVE_DEPLOY_AUTH                           = NONE
```

The confirmed next architecture is:

```text
HYBRID_IDENTITY = DEDICATED_KINTONE_AUTO_BIND + SHARED_ACCOUNT_MBO_LOGIN
DUAL_ROLE_EMPLOYEE_APPROVER = CONFIRMED
```

Natta and Vassana are the confirmed example class: each person is both an MBO employee and an Approver.

This task proves the real physical identity/routing data before implementation. It does not implement Hybrid Identity.

## 1. Ownership / Executor Rule

```text
PRIMARY_OWNER = CHATGPT CONTROL PLANE
ANTIGRAVITY_SOURCE_EXECUTION = NOT AUTHORIZED
```

If Antigravity reads this task without a new explicit narrow instruction, it must **STOP**. Do not edit source, schema, routing, ACL, Process, or customization.

For live Kintone facts that Git cannot prove, preferred evidence path is a **user-run Browser Console GET-only verifier** prepared by ChatGPT, or user-provided App53/App795 exports. Antigravity GET-only runtime execution may be used only if Control Plane later opens a separate narrow evidence-collection instruction.

## 2. Business Architecture Being Audited

Dedicated Kintone user:

```text
native Kintone login
-> exact authoritative Kintone User Code
-> exactly one active App53 Employee_Code
-> Employee-Self auto-bind
-> no secondary MBO Employee_Code/password login
```

Shared Kintone principal:

```text
approved shared Kintone principal
-> App794 MBO Login
-> Employee_Code + App801 MBO password
-> Employee-Self context
```

Dual-role user:

```text
My MBO             = own bound Employee_Code
My Approval Tasks  = current dedicated Kintone User as authoritative current Workflow assignee
```

The same person must not receive two employee rows or two own-MBO records.

Self approval must fail closed:

```text
SELF_APPROVAL_ROUTE_CONFLICT
```

## 3. Exact Audit Targets

Target people:
- Natta
- Vassana

Do not infer exact spelling/login code from display name. The live/source evidence must prove the authoritative Kintone User Code.

For each target prove:

### App53 Employee Identity
- exact active App53 record ID;
- Employee_Code;
- employee display/name fields available in source;
- Position;
- Department;
- Section;
- Team;
- `Number_0` active status and require `Number_0 = 1` for dedicated auto-bind;
- all existing Kintone-user/login/user-select-related field codes and values that could serve as authoritative mapping.

### Dedicated Kintone Principal
- exact Kintone User Code from an authoritative Kintone source;
- active/usable user status where the available read-only API exposes it;
- no mapping by name similarity alone.

### App795 Routing
- all active route rows where the exact Kintone User appears as Manager/Approver destination;
- exact Routing_Key;
- Manager/GM slot membership and order;
- Requester_User values;
- own route resolved from the person's own App53 Position/Section/Team;
- prove own route does not incorrectly reuse their Approver role.

### App794 / Native Workflow
- current Process configuration relevant to assignee behavior;
- how current record assignee is represented/read;
- whether `My Approval Tasks` can be defined as current authoritative native assignee = current dedicated Kintone User;
- current App794 App ACL, Record ACL and Field ACL readback relevant to dedicated approver access;
- do not assume browser UI hiding is sufficient authorization.

## 4. Mapping Decision Contract

For each dedicated user, classification must be exactly one of:

```text
EXACT_1_TO_1_MAPPING
MAPPING_MISSING
MAPPING_AMBIGUOUS
SOURCE_FIELD_NOT_PRESENT
```

Rules:
- exact mapping requires one active App53 employee row and one exact dedicated Kintone User Code;
- do not infer from display name, email similarity, App795 approver membership, Position, Section, Team, or manual guess;
- App795 membership proves approver identity only, not Employee_Code ownership;
- missing or duplicate mapping fails closed;
- `admin-form` is never auto-bound as Employee-Self;
- do not invent `Kintone_User_Code` field if App53 has no suitable field.

If App53 has no suitable field, record `SOURCE_FIELD_NOT_PRESENT` and STOP before any schema proposal/change. Any App53 schema change requires a separate explicit authorization.

## 5. Required Security / Workflow Conclusions

Audit evidence must allow Control Plane to answer:

1. Can Natta login with her dedicated Kintone account and be mapped to exactly one Employee_Code?
2. Can Vassana login with her dedicated Kintone account and be mapped to exactly one Employee_Code?
3. What exact physical field/source provides each mapping?
4. Which App794 record is each person's own MBO for a fiscal year?
5. Which records are approval tasks because current native assignee equals the dedicated user?
6. Can a dedicated user open only own MBO + currently assigned subordinate MBOs without gaining arbitrary employee access?
7. Can a shared Kintone principal remain restricted to Employee_Code/App801 login and never gain approver mode?
8. Can self-approval be detected and blocked reliably?
9. Does current native ACL/Process configuration support this architecture, or is a later security change required?
10. Is App53 schema change required, or can existing fields be reused?

## 6. Required Future Test Matrix — Design Only in This Audit

Do not implement yet. Record expected tests for later WP:

- shared principal Employee A can access only Employee A after MBO login;
- shared principal cannot enter Approver context;
- dedicated Vassana enters own My MBO without secondary MBO password;
- dedicated Natta enters own My MBO without secondary MBO password;
- dedicated user can open a subordinate record only when authoritative current native assignee matches that user;
- dedicated user cannot open arbitrary other employee records;
- transition away from user removes record from My Approval Tasks;
- returned/reassigned record follows current authoritative assignee;
- own record cannot be approved by the same bound person;
- missing/ambiguous dedicated mapping fails closed;
- approval queue count equals records currently assigned, not number of employees represented by an App795 route.

## 7. Allowed Actions

READ-ONLY only:
- GitHub/repository source and docs inspection;
- Kintone GET endpoints;
- App53 form-field/schema GET;
- App53 target-record GET;
- App795 target-route GET;
- App794 process/settings/ACL/record GET needed for the audit;
- Kintone user/directory GET if available and authorized;
- user-provided exports/screenshots/Browser Console GET evidence.

## 8. Forbidden Actions

```text
LIVE_POST                   = 0
LIVE_PUT                    = 0
LIVE_DELETE                 = 0
APP53_RECORD_WRITE          = 0
APP53_SCHEMA_WRITE          = 0
APP795_ROUTE_WRITE          = 0
APP794_RECORD_WRITE         = 0
PROCESS_WRITE               = 0
ACL_WRITE                   = 0
CUSTOMIZATION_UPLOAD        = 0
DEPLOY                      = 0
PASSWORD_RESET_EXECUTION    = 0
SOURCE_IMPLEMENTATION       = 0
ROLLBACK                    = 0
```

No App800 deployment is authorized by this task.

## 9. Evidence Deliverable

After read-only collection, Control Plane will create/update:

`project-docs/D1_HYBRID_IDENTITY_MAPPING_DUAL_ROLE_AUDIT_R1_EVIDENCE.md`

Evidence must clearly separate:
- Git/source-proven facts;
- live Kintone GET-proven facts;
- user-confirmed business rules;
- unresolved facts.

Maximum audit status before independent Control Plane conclusion:

`D1_HYBRID_IDENTITY_MAPPING_DUAL_ROLE_AUDIT_R1_EVIDENCE_COLLECTED`

No source implementation begins automatically.

## 10. Next Owner

```text
NEXT_OWNER = CHATGPT CONTROL PLANE
NEXT_STEP  = prepare the minimal read-only evidence collection for Natta + Vassana, beginning with App53 schema/mapping-source proof
```
