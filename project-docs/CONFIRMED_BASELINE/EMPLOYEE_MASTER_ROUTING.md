# Confirmed Employee Master Routing Context

Status: CONFIRMED / CANONICAL FOR MBO ROUTING INPUT

Evidence basis:
- User-provided Employee Namelist export from App53.
- User confirmation on 2026-08-26 for TMG2 CAD routing semantics.
- User-confirmed App53 active-status field semantics on 2026-08-28.
- User-confirmed Hybrid Identity / dual-role Employee + Approver architecture on 2026-08-30.
- User-run App53/App794/App795 READ-ONLY Hybrid Identity Audit R1/R2 on 2026-08-30.
- User decision on 2026-08-30 approving the recommended dedicated mapping design.

## Source of Truth

- App53 Employee Namelist is the employee-source master used to derive routing context and Employee-Self ownership for App794/App795.
- Routing/identity decisions must use real reviewed App53 values and must not invent Position, Section, Team, Employee_Code, or Kintone-user identity values.
- App795 remains the routing master for evaluator/approver destination data.
- Do not create a duplicate Employee Master merely to support Kintone-user mapping.

## Confirmed Routing / Identity Context Dimensions

App794 must be able to derive at least:
- Employee_Code;
- Position;
- Department where applicable;
- Section;
- Team;
- Active/Inactive employee status where needed to identify the current valid person/master row;
- for dedicated Kintone users, an exact authoritative Kintone User Code <-> Employee_Code mapping.

Do not add duplicate employee-master fields when App53 already provides the required source data.

## Dedicated Kintone User Mapping — Confirmed Physical Design / Write Pending

User-confirmed architecture:

```text
HYBRID_IDENTITY = DEDICATED_KINTONE_AUTO_BIND + SHARED_ACCOUNT_MBO_LOGIN
```

READ-ONLY Audit R2 proved App53 currently has no suitable Kintone-user/user-select/login mapping field. The user then approved the recommended physical mapping design:

```text
Field Code = MBO_Kintone_User
Label      = MBO Kintone User
Type       = USER_SELECT
Location   = protected App53 Employee Namelist
```

Canonical dedicated auto-bind contract:

```text
current Kintone User Code
  -> exactly one active App53 row where MBO_Kintone_User contains that exact user
  -> Number_0 = 1
  -> valid canonical emp_text Employee_Code
  -> DEDICATED_KINTONE_IDENTITY_BOUND
```

Required mapping behavior:
- mapping is 1 Kintone User Code -> 1 active Employee_Code;
- runtime requires exactly one selected dedicated Kintone user on the mapping row;
- one active Employee_Code must not map ambiguously to multiple dedicated Kintone users unless a separately reviewed business rule explicitly allows it;
- missing mapping -> fail closed;
- duplicate/ambiguous mapping -> fail closed;
- missing/invalid canonical `emp_text` -> fail closed;
- do not infer from display name, email similarity, route membership, Position, Section, Team, `Text_6` Vendor Account Number, or manual guess;
- do not use App795 approver membership as proof that a Kintone user owns a particular Employee_Code;
- `admin-form` is excluded from Employee-Self auto-binding.

Canonical current classification:

```text
DEDICATED_MAPPING_BUSINESS_RULE   = CONFIRMED
DEDICATED_MAPPING_PHYSICAL_DESIGN = APP53.MBO_Kintone_User USER_SELECT
DEDICATED_MAPPING_FIELD_LIVE      = NOT YET CREATED / WRITE NOT AUTHORIZED
```

Protected write boundary:
- adding `MBO_Kintone_User` is an App53 schema write and requires separate exact authorization;
- populating dedicated mappings is an App53 record write and requires separate exact authorization;
- do not create the field or mapping silently from source implementation.

### Current audited examples

Vassana:
```text
Kintone User = vassana
App53 Record = 456
emp_text     = 0044
Number_0     = 1
```

Natta:
```text
Kintone User = natta
App53 Record = 578
emp_text     = blank
Number_0     = 1
```

Natta therefore remains fail-closed for dedicated auto-bind until the real canonical Employee_Code is provided/verified and App53 is corrected under separate authorization. Do not substitute `Number = 243`, email, Vendor Account Number, or a guessed zero-padded value.

The detailed access/self-approval design is canonical in `D1_HYBRID_IDENTITY_ACCESS_DESIGN.md`.

## Confirmed App53 Active / Inactive Semantics

Canonical employee active-status source in App53:

```text
Field Code = Number_0
Label      = Status
Type       = NUMBER
1          = Active / current employee
0          = Inactive / former employee
blank      = unknown / not accepted as Active
```

Rules:
- use `Number_0 = 1` when a flow requires the current/Active employee population;
- `Number_0 = 0` is not current/Active;
- blank `Number_0` must fail closed where current employee status is required until the source row is corrected/confirmed;
- the Kintone system field code `Status` is workflow/process status and is not the employee Active/Inactive source.

Dedicated Kintone auto-binding must only bind to an Active/current employee row.

## Dual-Role Employee + Approver Semantics

The same physical person may have two simultaneous business contexts:

```text
Employee-Self ownership = Employee_Code from App53
Approver identity        = dedicated Kintone User Code used by native Workflow/App795 route
```

This does not create two employee master rows and does not create two own-MBO records.

For the person's own MBO:
- use that person's own App53 Position/Department/Section/Team to resolve routing;
- do not reuse the person's Approver role as their own route;
- do not infer their own manager from the fact that they approve another team;
- self-approval is prohibited by default;
- the explicit approved own-MBO exception is defined in `D1_HYBRID_IDENTITY_ACCESS_DESIGN.md`: remove only the self appraiser before workflow snapshot, preserve/shift remaining appraisers, recalculate topology, and never auto-approve.

For records of other employees:
- the person's dedicated Kintone user may appear as an App795 approver destination;
- actionable access still requires the record's authoritative current native Workflow assignment to that user.

## Position Normalization

The Employee Namelist contains formatting/case variants of position labels. Confirmed examples include:
- `Deputy General Manager`, `DGM`
- `General Manager`, `General manager`, `GM`
- `Vice President`, `VP`
- leading/trailing-space variants on position names

Routing code must not depend on exact raw capitalization/spacing for a special-position decision.

For M10M-R2, normalize executive variants to canonical routing classes:

`DEPUTY_GENERAL_MANAGER`
`GENERAL_MANAGER`
`VICE_PRESIDENT`

This normalization is a technical classification step only. The business destination must still be resolved from App795; do not hard-code the President user in JavaScript.

## Confirmed Executive Population & Routing (M10M-R2)

The active Employee Namelist contains Executive records across multiple Sections. Section-first routing is unsafe for Executives. The special Executive Position rule must be evaluated before normal Section/Team routing.

Canonical M10M-R2 business rule:

`DEPUTY_GENERAL_MANAGER -> President (M1_ONLY)`
`GENERAL_MANAGER -> President (M1_ONLY)`
`VICE_PRESIDENT -> President (M1_ONLY)`

President is the single appraiser slot (`1st Appraiser`). Non-executive positions do not receive Executive Direct routing.

## President Resolution

The Employee Namelist contains more than one historical President record with different active status. Therefore Position name alone is not sufficient to infer the current valid President identity.

Runtime/business routing must not create or guess a Kintone user code such as `president`.

The President destination for the executive route must come from reviewed App795 routing-master data and must fail closed when no valid destination is configured.

Required failure:

`APPROVER_NOT_FOUND`

## Confirmed TMG2 Team Values

For active employees in Section `TMG2`, the provided Employee Namelist confirms these Team values:

- `Production`
- `CAD`
- `Marketing`

Canonical exact routing keys are therefore:

- `TMG2|Production`
- `TMG2|CAD`
- `TMG2|Marketing`

TMG2 has no confirmed Admin team route.

Unknown or missing TMG2 Team must not fall back to a generic TMG2 route.

Required behavior:
- missing required Team -> `TEAM_REQUIRED`
- unknown/no exact Team route -> `ROUTE_NOT_FOUND`
- duplicate exact winning route -> `AMBIGUOUS_ROUTE`

## TMG2 CAD — Confirmed Same Route Across Work Context

User-confirmed on 2026-08-26:

`TMG2 + CAD` uses the same evaluator/approver route even when employees are associated with different work/section-name context such as Die Casting or Injection.

Therefore:

- Routing key remains `TMG2|CAD`.
- Do NOT add Section Name / Die Casting / Injection as an additional routing criterion for TMG2 CAD.
- Do NOT split CAD into separate Die Casting CAD and Injection CAD routing rows.
- App795 should have one authoritative active `TMG2|CAD` route.

## M10M / Hybrid Precedence

For current routing + Hybrid Identity behavior:

1. Resolve active employee identity from App53.
2. For dedicated mode, resolve exact `MBO_Kintone_User` -> active canonical `emp_text` Employee_Code or fail closed.
3. Normalize Position.
4. If normalized Position is `DEPUTY_GENERAL_MANAGER`, `GENERAL_MANAGER`, or `VICE_PRESIDENT`, resolve the corresponding executive route from App795 before Section routing.
5. Otherwise use existing exact Section/Team routing behavior.
6. For own MBO only, apply the explicitly approved self-appraiser elision rule after the authoritative route is resolved and before workflow snapshot creation.
7. TMG routes remain strict exact-match routes with no Section-only fallback.
8. Missing, duplicate, or incomplete routing/identity data must fail closed.

## Security / Authorization Preservation

Hybrid identity does not authorize widening requester or approver access.

- `Requester_User` remains the App795 shared-requester fallback for shared-account employees.
- Dedicated users use their exact mapped Kintone principal as the effective requester actor for their own record, subject to reviewed implementation/readback.
- An empty `Requester_User` list must not silently become an allow-all rule for shared employees.
- Approver access requires authoritative current Workflow assignment; App795 route membership alone is not enough.
- dedicated users are separated from shared `MBO_EMPLOYEE_ACCESS`; the approved target is `MBO_DEDICATED_ACCESS` plus status-aware native Record ACL as defined in `D1_HYBRID_IDENTITY_ACCESS_DESIGN.md`.

## Completed Read-Only Identity Audit

The required Natta/Vassana App53/App795/App794 audit is complete. Durable accepted results:

```text
App53 mapping field before change = NOT PRESENT
Approved future mapping field      = MBO_Kintone_User / USER_SELECT
Natta Kintone user                 = natta
Natta App53 record                 = 578
Natta emp_text                     = blank
Natta Section/Team                 = TMG1 / Marketing
Natta own self-route conflict      = confirmed
Vassana Kintone user               = vassana
Vassana App53 record               = 456
Vassana emp_text                   = 0044
Vassana Position                   = Deputy General Manager
```

Raw audit evidence is recorded in `D1_HYBRID_IDENTITY_MAPPING_DUAL_ROLE_AUDIT_R1_EVIDENCE.md`. No audit result itself authorizes a write.

## Change Rule

Any future change to:
- App53 routing-source semantics;
- `MBO_Kintone_User` dedicated mapping design/source/semantics;
- App53 `Number_0` active/inactive semantics;
- dual-role Employee + Approver identity separation;
- own-MBO self-appraiser exception semantics;
- executive position normalization;
- TMG2 Team membership/route split;
- TMG2 CAD same-route decision;
- President resolution semantics;
- employee active-status interpretation for routing;

must update this canonical baseline in the same reviewed change.
