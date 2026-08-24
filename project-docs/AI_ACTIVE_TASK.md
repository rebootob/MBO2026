# AI ACTIVE TASK — SECURE LIVE APP ACTIVATION

> **Control Plane:** ChatGPT / approved human reviewer
> **Execution Plane:** Codex
> **Rule:** Execute exactly this task. Do not redesign architecture or expand scope. Do not modify this file.

## ACTIVE TASK

- **WP:** `MBO-P03-WP-002C`
- **Stage:** `STAGE 3A — SECURE LIVE APP ACTIVATION CORRECTION`
- **Branch:** `ai/codex-wp002c`
- **Accepted Stage-2 Closure Commit:** `f96645cb94a566263532802ba15611d1a003ad1e`
- **Stage-2 Gate:** `PASS / FROZEN`
- **Verified App ID:** `796`
- **Exact App Name:** `MBO Profile & Scoring Configuration Master [Sandbox]`
- **Current State:** `PREVIEW_CREATED / NOT_DEPLOYED`
- **Target State:** `LIVE_DEPLOYED / CREATOR_ONLY / SCHEMA_NOT_CONFIGURED`
- **Environment:** `SANDBOX`
- **Production:** `FALSE`
- **Explicit User Authorization:** `YES — user explicitly requested that the App be actually created/accessible in Kintone, not left only as Preview`
- **APP_CREATE:** `FORBIDDEN — App 796 already exists in Preview; do not create another App`
- **Schema Writes:** `NO`
- **Record Writes:** `NO`
- **Delete:** `NO`
- **WP-002D:** `NOT STARTED`

## CONTROL PLANE REVIEW FINDING

Stage 2 correctly created a **pre-live / Preview App** and verified App ID `796`, but the user expectation for “create App” is that the App must exist in the live Kintone application list and be addressable at `/k/796/`.

Kintone's official contract is:

- `POST /k/v1/preview/app.json` creates a **Preview / pre-live App** only.
- `POST /k/v1/preview/app/deploy.json` deploys pre-live settings to the **live App**.
- Deployment completion must be verified with `GET /k/v1/preview/app/deploy.json` until the exact App reports `SUCCESS`.

Therefore this stage is a **requirement correction / live activation**, not a second App creation.

**Never call `POST /k/v1/preview/app.json` again.**

## WHAT / WHERE / HOW / WHY

### What

Securely activate existing Preview App `796` as a live Kintone App while keeping it empty and locked to the App creator.

### Where

Only App `796`:

`MBO Profile & Scoring Configuration Master [Sandbox]`

### How

1. Re-verify exact Preview identity.
2. Apply a creator-only pre-live App ACL.
3. Read back and verify the ACL.
4. Deploy App `796` exactly once using the latest revision.
5. Poll deploy status by GET only until `SUCCESS`, `FAIL`, `CANCEL`, or bounded timeout.
6. Verify the live App identity and live ACL using exact App ID `796`.
7. Update project state only after verified success.

### Why

The Preview App ID alone is not a usable live Kintone App. The user confirmed the required outcome is that the App actually exists in Kintone and `/k/796/` no longer reports “app not found”.

### Expected Impact

After success:

- App `796` is live in the Kintone tenant.
- App name remains exact.
- Only the App creator has App/record permissions at this stage.
- No business schema is configured yet.
- No records exist because this WP performs zero record writes.
- Apps 794/795 and all protected Apps are untouched.

## RISKS AND CONTROL

### Risk: duplicate App

Control: `APP_CREATE` is forbidden. App ID must remain `796`.

### Risk: exposing Sandbox to all users

Control: before deploy, set the pre-live App ACL to **CREATOR only**. Do not grant `Everyone` any permission.

### Risk: deploy POST transport uncertainty

Control: never retry the deploy POST automatically. If transport outcome is uncertain, use only deploy-status GET and live read-back to reconcile.

### Risk: partial activation / wrong identity

Control: exact-ID/name read-back is mandatory before and after deploy. Never search or substitute another App ID.

### Rollback

- Before deploy: if pre-live ACL update succeeds but deploy has not been attempted, STOP on any failure. Do not auto-revert.
- After deploy: do not delete the App automatically. Any corrective deploy/permission rollback requires a new Control Plane authorization.
- Never delete App 796 in this task.

## SYNC FIRST

Run:

```bash
git status --short
```

If working tree is not clean, STOP and report. Do not stash/discard automatically.

Then:

```bash
git fetch origin
git merge --ff-only origin/ai/codex-wp002c
git branch --show-current
```

Expected:

```text
ai/codex-wp002c
```

Confirm `f96645cb94a566263532802ba15611d1a003ad1e` is in branch history.

## PRE-WRITE SAFETY CHECKS

Before implementing/executing any Kintone write:

1. Confirm `DISCOVERY_MODE === true`.
2. Confirm default `WRITE_ALLOWED_APPS` remains `[]`.
3. Confirm `config/sandbox-apps.json` has exactly `scoringConfigMasterAppId = 796`.
4. Confirm Apps `794` and `795` remain unchanged.
5. Confirm `project-docs/APP_REGISTRY.md` registers App `796` with exact name.
6. Confirm `.env.local` provides `KINTONE_BASE_URL`, `KINTONE_USERNAME`, `KINTONE_PASSWORD` without printing values.
7. Confirm Preview settings read-back for exact App `796` returns exact name `MBO Profile & Scoring Configuration Master [Sandbox]` and a valid numeric revision.
8. Perform a read-only live settings check for exact App `796`.
   - If the live App already exists and exact identity verifies, STOP without any write and report `LIVE_ALREADY_DEPLOYED` for Control Plane reconciliation.
   - If live App is not found, continue.
   - If a different identity is returned, STOP.
9. Confirm no planned custom schema fields from WP-002C have been configured yet. Do not add/remove/update fields in this stage.
10. Run full `npm test` before the live write.

If any required precondition fails: STOP. No Kintone write.

## OFFICIAL KINTONE CONTRACT TO PRESERVE

### Preview App ACL

Use:

```text
PUT /k/v1/preview/app/acl.json
```

Target:

```text
app = 796
```

Kintone treats omitted `Everyone` rights as no permissions. This task intentionally uses a single `CREATOR` ACL entry only.

### Deploy

Use exactly:

```text
POST /k/v1/preview/app/deploy.json
```

Body must contain exactly one App:

```json
{
  "apps": [
    {
      "app": 796,
      "revision": "<LATEST_VERIFIED_PREVIEW_REVISION>"
    }
  ]
}
```

Do not use `revision = -1`. Use the exact latest verified revision.

### Deploy Status

Use GET only:

```text
GET /k/v1/preview/app/deploy.json?apps[0]=796
```

Valid status values:

```text
PROCESSING
SUCCESS
FAIL
CANCEL
```

Only `SUCCESS` permits final live verification.

## AUTHENTICATION

Use the existing password-authenticated connection path based on:

```text
KINTONE_USERNAME
KINTONE_PASSWORD
```

Do not print credentials or authorization headers.

For this task, do not depend on an API token for the activation path.

## FILE BOUNDARY

Allowed implementation changes:

- `src/core/kintone-client.js`
- `src/core/sandbox-write-guard.js` only for a narrow exact-App activation guard if necessary
- `tests/safety-guard.test.js`
- one single-purpose script if needed:
  - `scripts/kintone/activate-scoring-config-master-live.js`

Allowed post-success documentation changes:

- `project-docs/CURRENT_STATE.md`
- `project-docs/HANDOFF.md`
- `project-docs/AI_REVIEW_PACKAGE.md`
- `project-docs/IMPLEMENTATION_STATUS.md`
- `project-docs/CHANGELOG_AI.md`
- `project-docs/APP_REGISTRY.md`

Do not modify:

- `project-docs/AI_ACTIVE_TASK.md`
- `project-docs/phase-3/MBO-P03-WP-002C_PLAN.md`
- scoring/profile business modules
- App 794 configuration
- App 795 configuration
- any record data
- any field/schema/layout/view/process-management configuration

## REQUIRED NARROW ACTIVATION GUARD

The live-activation execution path must fail closed unless all of these are exact:

```text
workPackageId = MBO-P03-WP-002C
stage = STAGE_3A_LIVE_ACTIVATION
appId = 796
appName = MBO Profile & Scoring Configuration Master [Sandbox]
operation sequence = APP_ACL_PREVIEW_UPDATE -> APP_DEPLOY
explicitUserAuthorization = true
activeWindow = true
```

Use one unique authorization ID:

```text
MBO-P03-WP-002C-STAGE3A-20260824-2219-ICT
```

No generic arbitrary-App deploy capability may be introduced.

The dedicated path must not allow App 794, App 795, or any protected App.

## IMPLEMENTATION — SAFE CREATOR-ONLY ACL

Before deploy, set pre-live App permissions to exactly one `CREATOR` entry with:

```json
{
  "entity": { "type": "CREATOR" },
  "appEditable": true,
  "recordViewable": true,
  "recordAddable": true,
  "recordEditable": true,
  "recordDeletable": true,
  "recordImportable": true,
  "recordExportable": true
}
```

Do not include an `Everyone` entry.
Do not include any other user/group/organization in this stage.

Use the current preview revision in the ACL PUT when supported by the existing implementation path.

Validate the ACL PUT response contains a valid numeric revision string.

Then GET the exact preview ACL and verify:

- App ID is `796`
- CREATOR has the expected rights
- no `Everyone` entry grants any right
- no unexpected entity has rights
- returned revision is valid

If ACL read-back fails: STOP. Do not deploy.

## DEPLOY EXECUTION

After ACL read-back PASS:

1. Use the latest exact revision returned/read back after ACL update.
2. Send exactly one deploy POST for App `796`.
3. Never retry the deploy POST automatically.
4. After POST, poll deploy status with GET only.

Polling must be bounded. For example:

```text
max 30 GET checks
2 seconds between checks
```

Polling is read-only and may continue while status is `PROCESSING`.

### Deploy transport uncertainty

If the deploy POST throws, times out, or produces an uncertain transport outcome:

```text
DEPLOY_RESULT_UNCERTAIN
```

Do not send a second POST.

Use deploy-status GET for App `796` to reconcile:

- `SUCCESS` -> continue to live read-back
- `FAIL` or `CANCEL` -> STOP
- persistent `PROCESSING` / unknown -> STOP as uncertain

## FINAL LIVE VERIFICATION

After deploy status `SUCCESS`, perform password-authenticated read-only verification of exact App `796` using live endpoints.

Verify at minimum:

1. Live App settings for `796` exist.
2. Name is exactly:

   `MBO Profile & Scoring Configuration Master [Sandbox]`

3. Live revision is present and valid.
4. Live App ACL is creator-only as required.
5. No App ID substitution occurred.

If any live verification fails:

```text
LIVE_APP_VERIFICATION_FAILED
```

STOP.
Do not delete.
Do not redeploy automatically.
Do not create another App.

## TESTS — MOCK ONLY

Add/adjust tests proving at minimum:

1. activation rejects any App ID other than 796
2. activation rejects wrong App name
3. activation rejects wrong WP/stage
4. activation rejects missing explicit user authorization
5. APP_CREATE is not used anywhere in Stage 3A
6. preview identity must pass before ACL PUT
7. creator-only ACL body is exact
8. no Everyone permission is granted
9. ACL PUT targets only `/k/v1/preview/app/acl.json` for App 796
10. ACL failure prevents deploy
11. deploy body contains exactly one App: 796
12. deploy uses exact latest verified revision, never `-1`
13. deploy POST is attempted at most once
14. deploy transport uncertainty never retries POST
15. PROCESSING status causes GET-only polling
16. FAIL/CANCEL fail closed
17. SUCCESS proceeds to live identity read-back
18. live identity mismatch fails closed
19. live ACL mismatch fails closed
20. default `WRITE_ALLOWED_APPS` remains `[]`
21. `DISCOVERY_MODE` remains `true`
22. Apps 794/795 remain unchanged and are never targets
23. protected Apps remain hard-blocked
24. no schema/record/delete operation is generated

No real Kintone calls in unit tests.

## EXECUTION ORDER

Follow exactly:

1. Sync and run pre-write read-only checks.
2. Implement the narrow Stage-3A activation path and mocked tests.
3. Run:

```bash
git diff --check
npm test
```

4. If tests fail: STOP. No live write.
5. Commit implementation/tests BEFORE Kintone writes:

```text
feat: add controlled wp-002c live activation
```

6. Push `ai/codex-wp002c`.
7. Reconfirm clean worktree and exact branch.
8. Re-run exact preview identity and live-not-found checks.
9. Execute creator-only preview ACL PUT exactly once.
10. Verify preview ACL read-back.
11. Execute deploy POST exactly once.
12. Poll deploy status with GET only until final/bounded result.
13. If `SUCCESS`, verify exact live App identity and ACL.
14. If verification succeeds, update living docs and `APP_REGISTRY.md`:

```text
SCORING_MASTER_APP_ID = 796
APP_STATUS = LIVE_DEPLOYED
ACCESS_STATUS = CREATOR_ONLY
ENVIRONMENT = SANDBOX
PRODUCTION = FALSE
SCHEMA_STATUS = NOT_CONFIGURED
BASELINE_SEED_STATUS = NOT_STARTED
PUBLISH_PIPELINE_STATUS = NOT_DEPLOYED
```

`APP_REGISTRY.md` should no longer describe App 796 as only `Sandbox / Preview`; record it as live Sandbox with creator-only/default-deny governance.

15. Do not change `config/sandbox-apps.json` because ID remains `796`.
16. Run `git diff --check` and full `npm test` again.
17. Commit status/evidence changes:

```text
chore: record wp-002c live app activation
```

18. Push branch.
19. STOP for independent review.

Do not configure schema.
Do not seed records.
Do not begin WP-002D.

## KINTONE WRITE BOUNDARY — STAGE 3A

Maximum authorized writes for this stage:

```text
APP_CREATE POST             = 0
PREVIEW APP ACL PUT         = exactly 1
APP DEPLOY POST             = exactly 1
SCHEMA FIELD POST/PUT       = 0
LAYOUT PUT                  = 0
VIEW PUT                    = 0
PROCESS/PERMISSION OTHER    = 0
RECORD WRITES               = 0
DELETE                      = 0
```

Read-only GETs required for exact identity, ACL and deploy-status verification are allowed.

Cumulative project history must preserve the earlier Stage-2 App creation count separately:

```text
Historical APP_CREATE POST = 1
```

## FINAL REPORT

Report only:

- branch
- implementation commit SHA
- activation/status commit SHA if successful
- tests total/passed/failed before Kintone writes
- tests total/passed/failed after activation
- Stage-3A APP_CREATE POST count
- Stage-3A ACL PUT count
- Stage-3A DEPLOY POST count
- Stage-3A schema write count
- Stage-3A record write count
- deploy status final value
- live identity read-back PASS/FAIL/UNCERTAIN
- exact live App ID/name/revision
- live ACL verification PASS/FAIL
- final App status
- final access status
- final schema status

Never print credentials or authorization headers.

Then STOP.

# REVIEW EXPECTATION

Independent Reviewer will inspect GitHub and verify:

1. Stage-2 closure commit `f96645cb94a566263532802ba15611d1a003ad1e` is preserved and Stage 2 remains PASS/FROZEN.
2. No second APP_CREATE call was made; App ID remains exactly `796`.
3. Stage-3A implementation introduces only a narrow exact-App live-activation path.
4. No generic deploy bypass or arbitrary-App write capability was introduced.
5. `DISCOVERY_MODE` remains `true` and default `WRITE_ALLOWED_APPS` remains `[]`.
6. Preview identity for App 796 was verified before any write.
7. The creator-only ACL contained exactly the intended CREATOR rights and no Everyone grant.
8. ACL PUT targeted only `/k/v1/preview/app/acl.json` for App 796.
9. ACL read-back passed before deploy.
10. Deploy POST targeted only `/k/v1/preview/app/deploy.json` and contained exactly App 796 with the exact latest verified revision.
11. Deploy POST occurred at most once.
12. No automatic deploy POST retry exists.
13. Transport uncertainty is reconciled only with GET status/read-back.
14. Deploy status was checked with GET and final status is `SUCCESS` before claiming activation success.
15. Exact live App 796 identity was read back after deploy.
16. Exact live App name remained `MBO Profile & Scoring Configuration Master [Sandbox]`.
17. Live ACL remained creator-only.
18. No schema, layout, view, process-management, record, seed or delete operation occurred.
19. Apps 794/795 received zero writes.
20. Protected Apps received zero writes.
21. `config/sandbox-apps.json` still maps scoring master to 796 and 794/795 are unchanged.
22. `APP_REGISTRY.md` and living docs reflect `LIVE_DEPLOYED / CREATOR_ONLY / SCHEMA_NOT_CONFIGURED` only after verified success.
23. Full regression passes after activation.
24. WP-002D did not start.
25. Codex stopped after Stage-3A evidence push.

Expected gates:

- `STAGE3A_PREFLIGHT_GATE = PASS / FAIL`
- `ACL_LOCKDOWN_GATE = PASS / FAIL`
- `DEPLOY_EXECUTION_GATE = PASS / FAIL / UNCERTAIN`
- `LIVE_IDENTITY_GATE = PASS / FAIL`
- `LIVE_ACL_GATE = PASS / FAIL`
- `WRITE_SCOPE_GATE = PASS / FAIL`
- `REGRESSION_GATE = PASS / FAIL`
- `KINTONE_SAFETY_GATE = PASS / FAIL`
- `WP002C_STAGE3A_GATE = PASS / FAIL`
