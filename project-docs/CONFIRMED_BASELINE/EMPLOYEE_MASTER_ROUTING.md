# Confirmed Employee Master Routing Context

Status: CONFIRMED / CANONICAL FOR MBO ROUTING INPUT

Evidence basis:
- User-provided Employee Namelist export from App53.
- User confirmation on 2026-08-26 for TMG2 CAD routing semantics.
- User-confirmed App53 active-status field semantics on 2026-08-28.
- User-confirmed Hybrid Identity / dual-role Employee + Approver architecture on 2026-08-30.

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

## Dedicated Kintone User Mapping — Confirmed Architecture / Physical Source Pending Audit

User-confirmed architecture:

```text
HYBRID_IDENTITY = DEDICATED_KINTONE_AUTO_BIND + SHARED_ACCOUNT_MBO_LOGIN
```

For a dedicated Kintone user to skip the secondary MBO login, runtime must prove:

```text
current Kintone User Code
  -> exactly one active App53 employee identity
  -> exactly one Employee_Code
```

Required mapping behavior:
- mapping is 1 Kintone User Code -> 1 active Employee_Code;
- one active Employee_Code must not map ambiguously to multiple dedicated Kintone users unless a separately reviewed business rule explicitly allows it;
- missing mapping -> fail closed;
- duplicate/ambiguous mapping -> fail closed;
- do not infer from display name, email similarity, route membership, Position, Section, or Team;
- do not use App795 approver membership as proof that a Kintone user owns a particular Employee_Code;
- `admin-form` is excluded from Employee-Self auto-binding;
- Natta and Vassana are user-confirmed examples of people who are both MBO employees and Approvers, but their exact Employee_Code <-> Kintone User Code values must be read-only verified before implementation.

Canonical current classification:

```text
DEDICATED_MAPPING_BUSINESS_RULE = CONFIRMED
DEDICATED_MAPPING_PHYSICAL_SOURCE = PENDING_READ_ONLY APP53 AUDIT
```

Before adding any App53 field, first inventory the current App53 schema and records to determine whether a suitable Kintone-user/user-select/login-code field already exists. If none exists, adding a new mapping field is a protected App53 schema change and requires a separate explicit authorization; do not create it silently.

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
- if own route resolves back to the same person as Approver, fail closed with `SELF_APPROVAL_ROUTE_CONFLICT`.

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

The President destination for the GM route must come from reviewed App795 routing-master data and must fail closed when no valid destination is configured.

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

## M10M Precedence

For the current M10M implementation scope:

1. Resolve active employee identity from App53.
2. For dedicated mode, resolve the exact Kintone User <-> Employee_Code mapping or fail closed.
3. Normalize Position.
4. If normalized Position is `GENERAL_MANAGER`, resolve the dedicated GM route from App795 and route to the configured President destination.
5. Otherwise use existing exact Section/Team routing behavior.
6. TMG routes remain strict exact-match routes with no Section-only fallback.
7. Missing, duplicate, or incomplete routing/identity data must fail closed.

## Security / Authorization Preservation

Hybrid identity does not authorize widening requester or approver access.

- `Requester_User` remains the App795 shared-requester fallback for shared-account employees.
- Dedicated users use their exact mapped Kintone principal as the effective requester actor for their own record, subject to reviewed implementation/readback.
- An empty `Requester_User` list must not silently become an allow-all rule for shared employees.
- Approver access requires authoritative current Workflow assignment; App795 route membership alone is not enough.

## Required Read-Only Identity Audit Before Hybrid Implementation

Before source implementation, produce evidence for at least the confirmed dual-role examples Natta and Vassana:

```text
App53 active employee row
Employee_Code
Employee display name
Position
Department
Section
Team
existing Kintone-user-related field(s), if any
exact Kintone User Code if the source supports it
App795 routes where the Kintone user is an Approver
own-MBO route resolved from the employee's own App53 context
```

The audit is READ-ONLY. App53 is protected. No schema/record write is implied by this baseline.

## Change Rule

Any future change to:
- App53 routing-source semantics;
- dedicated Kintone User <-> Employee_Code mapping source/semantics;
- App53 `Number_0` active/inactive semantics;
- dual-role Employee + Approver identity separation;
- General Manager position normalization;
- TMG2 Team membership/route split;
- TMG2 CAD same-route decision;
- President resolution semantics;
- employee active-status interpretation for routing;

must update this canonical baseline in the same reviewed change.
