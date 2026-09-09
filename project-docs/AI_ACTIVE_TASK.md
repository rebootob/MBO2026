# AI ACTIVE TASK — MBO2026

Updated: 2026-09-09 ICT

> Convenience execution/review handoff view. Exact authorization remains governed by Owner decisions plus `project-docs/control/02_ACTIVE_WORK_PACKAGE.md` and newer accepted evidence.
> Latest compact handoff evidence: `project-docs/MBO2026_CONTINUATION_CHECKPOINT_2026-09-09.md`.

## Current task state

```text
CURRENT_WORK_PACKAGE = D3-IMP-06
TITLE = App800 HR Versioned Routing Self-Service
OWNER_AUTHORIZED = YES
EXECUTION_COMPLETE = YES
INDEPENDENT_CONTROL_PLANE_REVIEW = COMPLETE
CURRENT_VERDICT = PARTIAL PASS / CORRECTIVE REQUIRED
D3-IMP-06_CLOSED = NO
D3-IMP-06_EXECUTION_EVIDENCE_HEAD = e05b1bdafbd3e68d82646ad7e7d61f8ebe634396

NEXT_PROPOSED_GATE = D3-IMP-06-R1
NEXT_PROPOSED_TITLE = Fail-Closed HR Routing Authority + Canonical Sequence + Revision-Guarded Integration Corrective
D3-IMP-06-R1_AUTHORIZED = NO
NEXT_ACTION = WAIT FOR EXPLICIT OWNER AUTHORIZATION OR OWNER CHANGE/REJECTION OF THE PROPOSED CORRECTIVE
AUTO_START_NEXT_WORK_PACKAGE = NO

D3-PREFLIGHT-READONLY = NOT AUTHORIZED
DEPLOYMENT_AUTHORIZED = NO
KINTONE_READS_AUTHORIZED = NO BY CURRENT PACKAGE
KINTONE_WRITES_AUTHORIZED = NO
PRODUCTION_READY = NO
LIVE_BUSINESS_DATE_PROVIDER = UNRESOLVED / DEPLOYMENT BLOCKER
```

## Closed D3 package chain

```text
D3-IMP-01 = PASS / CLOSED
D3-IMP-02 = PASS / CLOSED
D3-IMP-02-R2 = PASS / CLOSED
D3-IMP-03 = PASS / CLOSED
D3-IMP-03-R2 = PASS / CLOSED
D3-IMP-04 = PASS / CLOSED
D3-IMP-04-R2 = PASS / CLOSED
D3-IMP-05 = PASS / CLOSED
D3-IMP-05-R1 = PASS / CLOSED
```

## D3-IMP-06 accepted portions

```text
ROLE_SEPARATION = ACCEPTED
HR_BUSINESS_AUTHORITY = ACCEPTED
ADMIN_FORM_TECHNICAL_AUTHORITY = ACCEPTED
SERVICE_LAYER_HR_GUARD = ACCEPTED
LOCAL_ONLY_BOUNDARY = ACCEPTED
VERSION_KEY_BASE_FORMAT = ACCEPTED
REMARK_FIELD_AUTHORITY = ACCEPTED
ZERO_KINTONE_EXECUTION = ACCEPTED
```

Role model:

```text
APP800_ACCESS = hr OR admin-form
ROUTING_VIEW_PREVIEW_VALIDATE = hr OR admin-form
ROUTING_CREATE_EDIT_PUBLISH_SUPERSEDE = hr ONLY
ADMIN_FORM_IMPLICIT_HR_AUTHORITY = NO
DUAL_ROLE = UNION
HISTORICAL_ROUTE_DELETE = NEVER
```

## D3-IMP-06 independent review findings

One bounded corrective must close all of these together:

1. Canonical M2 route sequence in App800/UI must be `M2 -> M1 -> G1` and `M2 -> M1 -> G1 -> G2`, not M1-first.
2. Remove implicit/default `K_expected`, scorer plan and process capability behavior; missing authority must fail closed.
3. Require explicit proof that supplied App795 version history for the exact Routing_Key is complete before deriving `max + 1` / first version.
4. Supersession must compare both supplied expected revisions against actual `$revision` values and reject stale revisions; active and new versions must share the exact Routing_Key.
5. Align UI event binder method names/arguments with the real HR routing management service API and propagate the explicit principal through preview/validate paths.
6. Restore unauthorized `dist/hr-control-center-bundle.js` change to the D3-IMP-06 starting-head version; no build/deployment artifact update is authorized.

Full evidence and reasoning:

`project-docs/MBO2026_CONTINUATION_CHECKPOINT_2026-09-09.md`

## Proposed authorization wording — NOT an authorization

```text
อนุมัติ D3-IMP-06-R1 Fail-Closed HR Routing Authority + Canonical Sequence + Revision-Guarded Integration Corrective แบบ LOCAL-ONLY / ZERO KINTONE / ZERO PROCESS WRITE / ZERO DEPLOYMENT
```

Do not execute merely because this text exists.

## Current authority routing

1. Latest explicit Owner decision.
2. Accepted concrete Git/Kintone/runtime evidence.
3. `project-docs/MBO2026_CONTINUATION_CHECKPOINT_2026-09-09.md` for the latest D3-IMP-06 review handoff evidence.
4. `project-docs/AI_CONTROL_CENTER.md`.
5. `project-docs/control/02_ACTIVE_WORK_PACKAGE.md`.
6. `project-docs/control/00_MASTER_DELIVERY_CONTROL.md`.
7. `project-docs/AI_DOCUMENT_INDEX.md`.
8. `project-docs/MBO_CONTROL_GOVERNANCE_CONSOLIDATION.md`.

If older control wording conflicts with the newer Owner authorization or the accepted D3-IMP-06 review evidence, do not guess: fresh-fetch exact Git evidence, use authority precedence, and perform only a bounded documentation consistency sync if needed.

## Permanent boundary

```text
D3-IMP-06-R1_AUTHORIZED = NO
D3-PREFLIGHT-READONLY_AUTHORIZED = NO
DEPLOYMENT_AUTHORIZED = NO
KINTONE_WRITES_AUTHORIZED = NO
PRODUCTION_READY = NO
```
