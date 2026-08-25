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

## Confirmed Retired Section Rule

- `TMT3` is a retired/obsolete section code and is no longer in use.
- Current canonical section replacing the old `TMT3` structure is `TMS1`.
- Do NOT create or restore an App795 routing row for `TMT3`.
- If an active App53 employee still carries `Section = TMT3`, treat it as stale Employee Master data requiring source-data review/correction rather than a missing-routing defect.
- Runtime missing-route behavior for stale `TMT3` must remain FAIL CLOSED until the App53 source record is corrected/confirmed.

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

Any change to routing rows, requester identities, approvers, TMG team structure, retired/canonical section codes, or workflow path must update this canonical file in the same reviewed change. Old/obsolete routing must be removed after reference/data migration under the NO_ORPHAN_ARTIFACT_GATE.