# Confirmed Employee Master Routing Context

Status: CONFIRMED / CANONICAL FOR MBO ROUTING INPUT

Evidence basis:
- User-provided Employee Namelist export from App53.
- User confirmation on 2026-08-26 for TMG2 CAD routing semantics.
- User-confirmed App53 active-status field semantics on 2026-08-28.

## Source of Truth

- App53 Employee Namelist is the employee-source master used to derive routing context for App794/App795.
- Routing decisions must use real App53 values and must not invent Position, Section, Team, or employee identity values.
- App795 remains the routing master for evaluator/approver destination data.

## Confirmed Routing Context Dimensions

App794 routing context must be able to derive at least:
- Position
- Department where applicable
- Section
- Team
- Active/Inactive employee status where needed to identify the current valid person/master row

Do not add duplicate employee-master fields when App53 already provides the required source data.

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

1. Normalize Position.
2. If normalized Position is `GENERAL_MANAGER`, resolve the dedicated GM route from App795 and route to the configured President destination.
3. Otherwise use existing exact Section/Team routing behavior.
4. TMG routes remain strict exact-match routes with no Section-only fallback.
5. Missing, duplicate, or incomplete routing data must fail closed.

## Security / Authorization Preservation

M10M does not authorize widening requester access.

`Requester_User` behavior must remain consistent with the confirmed routing/workflow baseline. An empty `Requester_User` list must not silently become an allow-all rule unless a separately confirmed business/security decision explicitly authorizes that behavior.

## Change Rule

Any future change to:
- App53 routing-source semantics;
- App53 `Number_0` active/inactive semantics;
- General Manager position normalization;
- TMG2 Team membership/route split;
- TMG2 CAD same-route decision;
- President resolution semantics;
- employee active-status interpretation for routing;

must update this canonical baseline in the same reviewed change.