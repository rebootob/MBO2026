# Confirmed Routing & Workflow Baseline

Status: CONFIRMED / FROZEN WHERE STATED

## App795 Routing Model

- App795 is the routing master.
- Active routing rows: 17.
- `Routing_Key` is authoritative for runtime lookup.
- Non-TMG routing uses `Routing_Key = Section_Code` with Team blank.
- TMG1/TMG2 routing uses `Routing_Key = Section_Code + "|" + Team`.
- TMG1/TMG2 exact team routing is mandatory; missing Team, missing exact route, or duplicate route must FAIL CLOSED.
- TMG routing must never fall back to Section-only routing.
- `Requester_User` is the authoritative Kintone shared workflow/requester boundary under the Kintone-only model. It is not individual employee authentication.

## Confirmed TMG Team Routes

- TMG1 Admin -> `amporn` -> `uchida`
- TMG1 CAD -> `phubodin` -> `uchida`
- TMG1 Marketing -> `natta` -> `uchida`
- TMG1 Production -> `prompan` -> `uchida`
- TMG2 CAD -> `phubodin` -> `uchida`
- TMG2 Marketing -> `natta` -> `uchida`
- TMG2 Production -> `prompan` -> `uchida`

TMG2 has no Admin route in the confirmed baseline.

## Workflow Baseline

Confirmed process path:

`SUBMITTED -> HR_REVIEW -> GM_APPROVAL -> APPROVED -> EXECUTION_PENDING -> APPLIED`

Rejected work follows the approved reject path with a reason and returns to the applicable draft/resubmission path. Exact runtime transition permissions must remain aligned with the authoritative App794/App795 process configuration and reviewed evidence.

## Runtime Safety

- Missing routing -> FAIL CLOSED.
- Duplicate routing -> FAIL CLOSED.
- Missing scoring profile -> FAIL CLOSED.
- Duplicate scoring profile -> FAIL CLOSED.
- Shared Kintone account identity must never be described as individual employee authentication.
- UI hiding alone is not an authorization boundary.

## Change Rule

Any change to routing rows, requester identities, approvers, TMG team structure, or workflow path must update this canonical file in the same reviewed change. Old/obsolete routing must be removed after reference/data migration under the NO_ORPHAN_ARTIFACT_GATE.