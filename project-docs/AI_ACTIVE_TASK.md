# AI ACTIVE TASK — ANTIGRAVITY LIVE VERIFICATION CORRECTION

> **Control Plane:** ChatGPT / Project Lead / Architect / Independent Reviewer
> **Primary Execution Plane:** Antigravity
> **Codex:** NOT ACTIVE; do not delegate to Codex
> **Rule:** Execute exactly this verification correction. Do not redesign architecture, expand scope, or modify this file.

## ACTIVE TASK

- **Repository:** `rebootob/MBO2026`
- **WP:** `MBO-P03-WP-002C`
- **Stage:** `STAGE 3A — LIVE DEPLOYMENT VERIFICATION CORRECTION`
- **Branch:** `ai/codex-wp002c`
- **Current HEAD baseline:** `db6b2426c1c10b3ea96c7d9834a211df57389903`
- **Target App ID:** `796`
- **Exact App Name:** `MBO Profile & Scoring Configuration Master [Sandbox]`
- **Observed by Antigravity:** `DEPLOY_STATUS = SUCCESS`, preview ACL = creator-only/default-deny, live general-settings GET = HTTP 404
- **APP_CREATE:** `FORBIDDEN`
- **NEW ACL PUT:** `FORBIDDEN IN THIS TASK`
- **NEW DEPLOY POST:** `FORBIDDEN IN THIS TASK`
- **Schema / Layout / View / Process / Record / Delete Writes:** `FORBIDDEN`
- **Purpose:** determine the actual live state using the correct Kintone permission model before any further write authorization

## CONTROL PLANE CORRECTION

The previous reconciliation logic incorrectly treated:

```text
GET /k/v1/app/settings.json?app=796 -> HTTP 404
```

as conclusive proof that the live App does not exist.

That conclusion is invalid.

Kintone's official permission contract differs by endpoint:

```text
GET /k/v1/app/settings.json
  -> live App requires permission to VIEW records OR ADD records

GET /k/v1/app/acl.json
  -> live App requires App Management Permission

GET /k/v1/app/adminNotes.json
  -> live App requires App Management Permission
```

Because Stage 3A intentionally changed the App ACL to creator-only/default-deny, a live settings 404 can be caused by the authenticated execution account lacking record-view/add rights even when the App is already live.

Therefore:

```text
LIVE_SETTINGS_404 != LIVE_APP_ABSENT
```

Do not deploy again based on that 404.

## CURRENT SAFE INTERPRETATION

The prior Antigravity report established:

```text
Preview identity = exact App 796 / exact name / revision 3
Preview ACL = CREATOR rights true + Everyone rights false
Deploy status = SUCCESS
Planned schema fields present = NO
New writes during Antigravity reconciliation = 0
```

This is strong evidence that a previous Stage-3A deploy may already have completed.

The remaining job is read-only proof of the **live management configuration**.

## STEP 0 — LOCAL / GIT CHECK

Run:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
```

Required branch:

```text
ai/codex-wp002c
```

If local branch is behind remote, fast-forward only.

If worktree contains only the local report artifact created by the prior read-only run, do not commit it automatically. Preserve it locally as evidence and continue only if it does not affect source/config execution. If there are source/config changes, STOP.

Do not expose `.env.local` values.

## STEP 1 — READ-ONLY LIVE MANAGEMENT PROBES

Perform password-authenticated GET only.

### Probe 1 — live App ACL

```text
GET /k/v1/app/acl.json?app=796
```

This is the primary live-state verification endpoint for this reconciliation because its permission requirement is App Management Permission rather than record-view/add permission.

Capture:

```text
LIVE_ACL_HTTP_STATUS
LIVE_ACL_REVISION
LIVE_ACL_RIGHTS
```

Expected successful live ACL:

- exactly the intended `CREATOR` rights are true
- `Everyone` grants no rights
- no unexpected entity has rights
- valid revision

### Probe 2 — live App Admin Notes

```text
GET /k/v1/app/adminNotes.json?app=796
```

This is an independent live App management endpoint.

Capture only:

```text
LIVE_ADMIN_NOTES_HTTP_STATUS
LIVE_ADMIN_NOTES_REVISION
```

Do not change admin notes.

### Probe 3 — published App catalog

Attempt password-authenticated:

```text
GET /k/v1/apps.json?ids[0]=796
```

Interpret carefully: Get Apps returns only published Apps, but also requires view-record or add-record permission. Therefore:

- App 796 returned -> strong positive proof of publication
- empty/not found/permission failure -> NOT conclusive by itself because creator-only ACL may exclude the authenticated user

### Probe 4 — live general settings

Re-run:

```text
GET /k/v1/app/settings.json?app=796
```

Treat a 404 only as:

```text
LIVE_SETTINGS_NOT_VISIBLE_TO_CURRENT_AUTH_CONTEXT
```

Do not map it to `LIVE_ABSENT` unless management-level live probes also prove absence.

### Probe 5 — existing deploy and preview evidence

Reconfirm GET only:

```text
GET /k/v1/preview/app/deploy.json?apps[0]=796
GET /k/v1/preview/app/settings.json?app=796
GET /k/v1/preview/app/acl.json?app=796
GET /k/v1/preview/app/form/fields.json?app=796
```

Required:

```text
DEPLOY_STATUS = SUCCESS
PREVIEW_IDENTITY = exact
PLANNED_SCHEMA_FIELDS_PRESENT = NO
```

## STEP 2 — VERIFICATION DECISION

### CASE V1 — LIVE MANAGEMENT PROOF PASS

If **either** live management endpoint succeeds for exact App 796:

```text
GET /k/v1/app/acl.json?app=796 -> 200
OR
GET /k/v1/app/adminNotes.json?app=796 -> 200
```

and deploy status is `SUCCESS`, then classify:

```text
LIVE_DEPLOYMENT_VERIFICATION = PASS
APP_STATUS = LIVE_DEPLOYED
```

Additional required checks:

- live ACL must be creator-only/default-deny if live ACL is readable
- exact Preview identity remains App 796 / exact name
- planned schema fields absent

A 404 from live general settings does NOT overturn this PASS; document it as an access-context limitation.

Then perform **zero Kintone writes** and proceed to documentation/evidence update.

### CASE V2 — BOTH LIVE MANAGEMENT PROBES FAIL AS NOT-FOUND

If both:

```text
/k/v1/app/acl.json?app=796
/k/v1/app/adminNotes.json?app=796
```

return a true App-not-found condition while deploy status remains `SUCCESS`, classify:

```text
LIVE_DEPLOYMENT_STATE = INCONSISTENT
```

Make zero writes and STOP for Control Plane with exact safe HTTP/error codes.

Do not deploy again.

### CASE V3 — PERMISSION/AUTH ERROR

If management probes fail due to permission/auth rather than App-not-found:

```text
LIVE_DEPLOYMENT_STATE = UNVERIFIABLE_BY_CURRENT_AUTH_CONTEXT
```

Make zero writes and STOP. Report safe error codes/messages without credentials.

Do not deploy again.

## STEP 3 — USER ACCESS DIAGNOSIS AFTER V1 ONLY

If V1 proves the App is live but `GET /k/v1/app/settings.json` remains inaccessible, record:

```text
APP_LIVE = YES
CURRENT_AUTH_RECORD_ACCESS = NO/UNKNOWN
```

This means the deployment problem is resolved and the remaining issue is **access permission**, not App creation/deployment.

Do not change ACL in this task.

We need the exact Kintone login/user that the user wants to use in the browser before granting additional access. Do not guess or grant `Everyone` access.

## STEP 4 — TESTS

Run:

```bash
git diff --check
npm test
```

All existing tests must pass.

No implementation change is expected in this task unless a purely read-only verification helper already exists and requires no behavioral redesign. Prefer zero source change.

## STEP 5 — DOCUMENTATION ONLY AFTER V1

If `LIVE_DEPLOYMENT_VERIFICATION = PASS`, update only:

- `project-docs/CURRENT_STATE.md`
- `project-docs/HANDOFF.md`
- `project-docs/AI_REVIEW_PACKAGE.md`
- `project-docs/IMPLEMENTATION_STATUS.md`
- `project-docs/CHANGELOG_AI.md`
- `project-docs/APP_REGISTRY.md`

Required facts:

```text
Execution Plane = Antigravity
SCORING_MASTER_APP_ID = 796
APP_STATUS = LIVE_DEPLOYED
DEPLOY_STATUS = SUCCESS
ACCESS_STATUS = CREATOR_ONLY / DEFAULT_DENY
SCHEMA_STATUS = NOT_CONFIGURED
BASELINE_SEED_STATUS = NOT_STARTED
PUBLISH_PIPELINE_STATUS = NOT_DEPLOYED
PRODUCTION = FALSE
STAGE3A = COMPLETE / PENDING INDEPENDENT REVIEW
```

Also record if applicable:

```text
LIVE_GENERAL_SETTINGS_VISIBILITY = BLOCKED_BY_CURRENT_AUTH_CONTEXT
```

Do not claim the user's browser account has access until separately verified.

Commit exactly once:

```text
chore: record verified wp-002c live deployment
```

Push branch and STOP.

For V2 or V3, do not update App status to LIVE_DEPLOYED. Push no status claim; just report to Control Plane and STOP.

## KINTONE WRITE BOUNDARY

For this entire task:

```text
GET = allowed
APP_CREATE POST = 0
ACL PUT = 0
DEPLOY POST = 0
SCHEMA/LAYOUT/VIEW/PROCESS writes = 0
RECORD writes = 0
DELETE = 0
```

## FINAL REPORT

Report only:

- execution plane = Antigravity
- branch / HEAD
- live ACL HTTP status + verification result
- live adminNotes HTTP status + verification result
- Get Apps result for ID 796
- live general-settings result (visibility only; do not infer absence from 404 alone)
- deploy status
- preview identity/revision
- preview ACL state
- planned schema fields present YES/NO
- verification case V1/V2/V3
- tests total/passed/failed
- Kintone GET count
- all Kintone write counts (must all be zero)
- evidence/status commit SHA if V1
- final App state
- whether remaining issue is DEPLOYMENT or ACCESS_PERMISSION
- STOP confirmation

Never expose credentials or authorization headers.

# REVIEW EXPECTATION

ChatGPT will verify:

1. Antigravity did not treat live general-settings 404 alone as proof of App absence.
2. Live App existence was checked through management-level live endpoints.
3. Deploy status remained `SUCCESS`.
4. No second deploy POST occurred.
5. No ACL PUT occurred.
6. No APP_CREATE occurred.
7. No schema/record/delete write occurred.
8. App ID remained exactly 796.
9. Exact App name remained unchanged.
10. If live ACL endpoint succeeded, ACL is creator-only/default-deny.
11. `APP_STATUS = LIVE_DEPLOYED` is recorded only for V1.
12. If V1 + browser/access remains blocked, the issue is explicitly separated as access permission rather than deployment failure.
13. No `Everyone` grant is introduced.
14. Full regression passes.
15. WP-002D did not start.

Expected gates:

- `LIVE_MANAGEMENT_PROOF_GATE = PASS / FAIL / UNVERIFIABLE`
- `DEPLOYMENT_STATE_GATE = PASS / INCONSISTENT / UNVERIFIABLE`
- `ACCESS_CONTEXT_GATE = PASS / RESTRICTED / UNKNOWN`
- `WRITE_SCOPE_GATE = PASS / FAIL`
- `REGRESSION_GATE = PASS / FAIL`
- `WP002C_STAGE3A_GATE = PASS / BLOCKED`
