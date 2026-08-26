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

## Confirmed Current Live Routing Coverage (R12A)

Live read-only discovery on App795 confirmed all 17 active routing rows currently resolve to topology `M1_G1`:
- Manager Level 1: exactly 1 approver, rule `ALL`.
- Manager Level 2 / `First_Manager_User`: not populated on current active routes.
- GM Level 1: exactly 1 approver, rule `ALL`.
- GM Level 2: not populated on current active routes.

This is the confirmed current live state, not permission to remove generic M2/G2 support from source architecture. Any future activation of M2/G2 requires separately reviewed App795 data plus compatible App794 Process Management support before use.

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

## App794 Workflow Baseline — Current Live Process (R12A / R12C Count Reconciliation)

R12A live read-only discovery confirmed the App794 workflow matrix shown in the review evidence. Independent R12C pre-write read-back later counted the same configuration as **16 Process Management states and 28 actions**. Recounting the R12A matrix confirms it contains 28 action rows; the earlier `27 actions` wording was a Control Plane counting/documentation error, not evidence of a live Process Management change.

Canonical current count:
- Process states: **16**
- Process actions/transitions: **28**

### Current active `M1_G1` path

Goal setting:
`01 Draft Objective -> 03 Manager Objective Review -> 04 GM Objective Review -> 05 Objective Approved`

Mid-Year:
`05 Objective Approved -> 06 Employee Mid-Year -> 08 Manager Mid-Year Review -> 09 GM Mid-Year Review -> 10 Mid-Year Completed`

Final Evaluation:
`10 Mid-Year Completed -> 11 Employee Self Evaluation -> 13 Manager Final Evaluation -> 14 GM Final Evaluation -> 15 HR Final Check -> 16 Completed`

### First-Manager states present in Process Management

App794 also contains these First-Manager states/actions:
- `02 First Manager Objective Review`
- `07 First Manager Mid-Year Review`
- `12 First Manager Final Evaluation`

They are not applicable to the current 17 active `M1_G1` routes because `First_Manager_User` is empty. Runtime must not allow an `M1_G1` record to enter a First-Manager action/path. Future M2 activation requires a reviewed compatible route and UAT before use.

### Return / resubmit baseline

- Objective review return from Manager or GM -> `01 Draft Objective`.
- Mid-Year review return from Manager or GM -> `06 Employee Mid-Year`.
- Final review return from Manager or GM -> `11 Employee Self Evaluation`.
- HR final return -> `11 Employee Self Evaluation`.
- Resubmission then follows the topology-appropriate route again.

## HR Final Check Native Authorization — App794 Sandbox (R12D-A / R12D-D)

R12D-A read-only audit confirmed that App794 originally had no native authorization boundary at `15 HR Final Check`: status 15 used `assignee.type = ONE` with an empty assignee entities list `[]`, the `Complete` and `Return Final HR` actions had no restrictive action filter, App/Record/Field ACL did not create an HR-only boundary, and deployed JavaScript had no HR/current-actor authorization guard.

R12D-D then performed an explicitly authorized, controlled native Process Management repair on **App794 Sandbox only**. Confirmed post-deploy state:
- App794 live/preview revision: `36 / 36`.
- Process structure remains exactly **16 states / 28 actions**.
- `15 HR Final Check.assignee.type = ONE` remains unchanged.
- `15 HR Final Check.assignee.entities` is now exactly the controlled Sandbox user `USER: admin-form`.
- Production HR group `Manager HR_x52y75` is **not** present in the App794 Sandbox Process payload.
- `Complete -> 16 Completed` is unchanged.
- `Return Final HR -> 11 Employee Self Evaluation` is unchanged.
- All non-target Process semantics match the pre-write snapshot.
- Existing records at `15 HR Final Check` were `0` before and after the repair, so there is no legacy status-15 record carrying the prior unassigned semantics.
- R12D-D executed no record transition, no workflow notification, and no record/schema/ACL/customization write.

Confirmed App794 Sandbox classification after R12D-D:
`NATIVE_STATUS15_AUTHORIZATION_BOUNDARY = CONTROLLED_SANDBOX_USER_ADMIN_FORM`.

This resolves the prior **App794 Sandbox** missing-native-assignee blocker sufficiently to proceed to separately authorized isolated Workflow UAT. It does **not** certify the production HR mapping. Production/go-live configuration must map the same native Process boundary to the separately confirmed production HR entity under a later reviewed change; no real-HR workflow or notification test is required solely for parity proof.

Future isolated UAT must preserve `REAL_USER_IMPACT = 0`; no real HR/manager/GM workflow or notification test is permitted.

## Runtime Safety

- Missing routing -> FAIL CLOSED.
- Duplicate routing -> FAIL CLOSED.
- Missing scoring profile -> FAIL CLOSED.
- Duplicate scoring profile -> FAIL CLOSED.
- Unknown/unmapped App794 Process status -> FAIL CLOSED as configuration error.
- Workflow action inconsistent with `Routing_Topology` -> FAIL CLOSED.
- For current `M1_G1`, First-Manager submit actions must not proceed.
- App794 Sandbox `15 HR Final Check` is natively assigned to controlled user `admin-form`; isolated UAT must prove positive assignee behavior and negative non-assignee denial before Workflow Functional UAT can PASS.
- Production HR entity mapping remains a separate pre-go-live configuration/parity gate and must not be tested by sending a real workflow/notification to HR solely for certification.
- Shared Kintone account identity must never be described as individual employee authentication.
- UI hiding alone is not an authorization boundary.

## Change Rule

Any change to routing rows, requester identities, approvers, TMG team structure, retired/canonical section codes, App794 Process statuses/actions, workflow path, or HR Final Check authorization boundary must update this canonical file in the same reviewed change. Old/obsolete routing must be removed after reference/data migration under the NO_ORPHAN_ARTIFACT_GATE.
