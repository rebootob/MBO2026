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

## App794 Workflow Baseline — Current Live Process

Canonical current count:
- Process states: **16**
- Process actions/transitions: **28**

The earlier `27 actions` wording was a Control Plane counting/documentation error; independent recount and live read-back confirm 28.

### Current active `M1_G1` path

Goal setting:
`01 Draft Objective -> 03 Manager Objective Review -> 04 GM Objective Review -> 05 Objective Approved`

Mid-Year:
`05 Objective Approved -> 06 Employee Mid-Year -> 08 Manager Mid-Year Review -> 09 GM Mid-Year Review -> 10 Mid-Year Completed`

Final Evaluation:
`10 Mid-Year Completed -> 11 Employee Self Evaluation -> 13 Manager Final Evaluation -> 14 GM Final Evaluation -> 15 HR Final Check -> 16 Completed`

### First-Manager states present in Process Management

App794 also contains:
- `02 First Manager Objective Review`
- `07 First Manager Mid-Year Review`
- `12 First Manager Final Evaluation`

They are not applicable to the current 17 active `M1_G1` routes because `First_Manager_User` is empty. Runtime must not allow an `M1_G1` record to enter a First-Manager path. Future M2 activation requires reviewed compatible routing and UAT.

### Return / resubmit baseline

- Objective review return from Manager or GM -> `01 Draft Objective`.
- Mid-Year review return from Manager or GM -> `06 Employee Mid-Year`.
- Final review return from Manager or GM -> `11 Employee Self Evaluation`.
- HR final return -> `11 Employee Self Evaluation`.
- Resubmission follows the topology-appropriate route again.

## Confirmed Technical Administrator Role — `admin-form`

User-confirmed business rule:

- `admin-form` is **not part of the normal MBO workflow**.
- `admin-form` is a technical administrator identity used only for inspection, debugging, troubleshooting, controlled repair, and verification.
- `admin-form` has **no business authority** to approve, return, complete, submit, or otherwise act on behalf of Requester, Manager, GM, or HR.
- `admin-form` must never be represented as a workflow approver or as having delegated approval authority.
- `admin-form` may inspect/debug workflow state but must not execute positive or negative business workflow UAT actions.

Canonical classification:

`ADMIN_FORM_ROLE = TECHNICAL_ADMIN_ONLY`

`ADMIN_FORM_WORKFLOW_AUTHORITY = NONE`

## HR Final Check Native Authorization — App794 Sandbox

R12D-A confirmed that App794 originally had no native authorization boundary at `15 HR Final Check`: status15 used `assignee.type = ONE` with an empty entities list `[]`, actions had no restrictive filter, ACLs did not establish an HR-only boundary, and runtime JavaScript did not establish HR actor authorization.

R12D-D then performed an explicitly authorized controlled Sandbox Process repair:
- live/preview revision became `36 / 36`;
- Process remained exactly **16 states / 28 actions**;
- `15 HR Final Check.assignee.type = ONE` remained unchanged;
- status15 assignee entity changed from empty `[]` to `USER: admin-form`;
- production HR group `Manager HR_x52y75` was not added to Sandbox;
- `Complete -> 16 Completed` unchanged;
- `Return Final HR -> 11 Employee Self Evaluation` unchanged;
- all non-target Process semantics matched the pre-write snapshot;
- existing records at status15 were `0` before and after;
- no record transition, notification, record/schema/ACL/customization write occurred.

After the user's explicit clarification of `admin-form` authority, that R12D-D mapping was reclassified as a temporary Sandbox technical lock only.

R12E-B then executed the separately authorized Project Close Mode remap:
- pre-write live/preview revision `36 / 36`;
- pre-write status15 record count `0`;
- fresh pre-write backup readable;
- exactly one Process semantic diff;
- `15 HR Final Check.assignee.entities` changed from `USER: admin-form` to `USER: hr`;
- `assignee.type = ONE` retained;
- Process remained exactly **16 states / 28 actions**;
- all non-target Process semantics remained unchanged;
- post-deploy live/preview revision became `37 / 37`;
- no synthetic UAT record was created and no workflow transition was executed in that attempt because browser UI login as `hr` was not yet available.

Canonical current Sandbox classification:

`STATUS15_SANDBOX_CURRENT_ASSIGNEE = USER: hr`

`STATUS15_SANDBOX_CURRENT_CLASSIFICATION = CONTROLLED_SANDBOX_UAT_BOUNDARY`

`STATUS15_BUSINESS_HR_AUTHORIZATION_CERTIFIED = NO`

`FUNCTIONAL_WORKFLOW_UAT = NOT_COMPLETED`

This current `hr` mapping is approved only for App794 Sandbox controlled UAT/regression. It is not the production HR authorization mapping and does not certify production role isolation.

Production/go-live configuration remains a separate gate and must map the native status15 boundary to the approved production HR entity under a later reviewed change. No real-HR workflow or notification test is required solely for parity proof.

## Project Close Mode — Single-Account Sandbox Functional UAT

User-confirmed decision for **App794 Sandbox Functional UAT only**:

- Kintone account `hr` is explicitly authorized by the user to be used as the controlled Workflow test account in App794 Sandbox.
- To shorten project closure, the same controlled account may represent the logical UAT roles `UAT_REQUESTER`, `UAT_MANAGER`, `UAT_GM`, and `UAT_HR` in the synthetic Sandbox record.
- `admin-form` remains excluded from every business workflow role and from positive/negative business workflow actions.
- This single-account model is accepted only to prove the **functional state flow, business validation, return/resubmit behavior, and M1_G1 topology guards**.
- It does **not** prove login-level separation of Requester vs Manager vs GM vs HR and must never be cited as production role-isolation evidence.
- Because no second controlled business-workflow identity is used, a native status15 non-assignee denial test is not part of this closure UAT. No claim of such a runtime denial test may be made.
- Production authorization remains a separate go-live gate and must be verified structurally from native Kintone Process/permission configuration without sending real-user workflow or notification solely for certification.

Confirmed Sandbox UAT logical mapping:

`UAT_REQUESTER = hr`

`UAT_MANAGER = hr`

`UAT_GM = hr`

`UAT_HR = hr`

`SANDBOX_FUNCTIONAL_UAT_ROLE_ISOLATION_CLAIM = NOT_TESTED`

`REAL_USER_IMPACT = 0`

## Runtime Safety

- Missing routing -> FAIL CLOSED.
- Duplicate routing -> FAIL CLOSED.
- Missing scoring profile -> FAIL CLOSED.
- Duplicate scoring profile -> FAIL CLOSED.
- Unknown/unmapped App794 Process status -> FAIL CLOSED as configuration error.
- Workflow action inconsistent with `Routing_Topology` -> FAIL CLOSED.
- For current `M1_G1`, First-Manager submit actions must not proceed.
- App794 Sandbox status15 currently uses the user-approved controlled Sandbox UAT account `hr`; functional workflow UAT remains pending until browser UI execution under `hr` is completed.
- `admin-form` is technical-admin-only and has no business approval authority.
- Single-account `hr` Sandbox UAT may certify functional workflow behavior only, not production role isolation.
- Production HR entity mapping remains a separate pre-go-live configuration/parity gate.
- Shared Kintone account identity must never be described as individual employee authentication.
- UI hiding alone is not an authorization boundary.

## Change Rule

Any change to routing rows, requester identities, approvers, TMG team structure, retired/canonical section codes, App794 Process statuses/actions, workflow path, administrator authority, Sandbox UAT actor model, or HR Final Check authorization boundary must update this canonical file in the same reviewed change. Old/obsolete routing must be removed after reference/data migration under the NO_ORPHAN_ARTIFACT_GATE.