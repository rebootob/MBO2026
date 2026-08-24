# AI ACTIVE TASK — CONTROLLED EXECUTION

> **Control Plane:** ChatGPT / approved human reviewer
> **Execution Plane:** Codex
> **Rule:** Execute exactly this task. Do not redesign architecture or expand scope. Do not modify this file.

## ACTIVE TASK

- **WP:** `MBO-P03-WP-002C`
- **Stage:** `IMPLEMENTATION STAGE 2 — CONTROLLED PREVIEW APP CREATION + IDENTITY REGISTRATION`
- **Branch:** `ai/codex-wp002c`
- **Accepted develop base:** `9d263a4`
- **Stage-1 Gate:** `PASS`
- **Target App:** `MBO Profile & Scoring Configuration Master [Sandbox]`
- **Current App ID:** `NOT_ALLOCATED`
- **Current App Status:** `NOT_CREATED`
- **Environment:** `SANDBOX`
- **Production:** `FALSE`
- **Explicit User Authorization:** `YES — user authorized continuation after Stage-1 PASS`
- **Authorized Kintone write:** exactly one `POST /k/v1/preview/app.json` for the exact target App name
- **Schema writes:** `NO`
- **Deploy to operating environment:** `NO`
- **Record writes:** `NO`

This stage may create the App **only in Kintone's preview/test settings environment**. It must not deploy the App to the operating environment yet.

## OFFICIAL KINTONE CONTRACT TO PRESERVE

For this stage:

- Create preview App: `POST /k/v1/preview/app.json`
- Request body: `{ "name": "MBO Profile & Scoring Configuration Master [Sandbox]" }`
- Create response must contain string `app` and `revision`
- API-token authentication is not valid for Add Preview App; use username/password authentication in this Node path
- Identity read-back: `GET /k/v1/preview/app/settings.json?app=<RETURNED_APP_ID>`

Do not change endpoints or add Space/Thread parameters.

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
```

Verify branch:

```bash
git branch --show-current
```

Expected: `ai/codex-wp002c`

## PRE-WRITE SAFETY CHECKS

Before implementing or executing the real write:

1. Confirm `DISCOVERY_MODE === true`.
2. Confirm `WRITE_ALLOWED_APPS` remains `[]`.
3. Confirm `config/sandbox-apps.json` does NOT already contain a positive `scoringConfigMasterAppId`.
4. Confirm `project-docs/APP_REGISTRY.md` does NOT already register the target exact name.
5. Confirm target exact name is unchanged.
6. Confirm `.env.local` provides `KINTONE_BASE_URL`, `KINTONE_USERNAME`, and `KINTONE_PASSWORD` without printing values.
7. Do not request or print credentials.
8. Run `npm test` before the live write. Expected current baseline: `154/154 PASS`.

If any check fails: STOP. No Kintone write.

## FILE BOUNDARY

Allowed implementation changes before the live call:

- `src/core/kintone-client.js`
- `src/core/sandbox-write-guard.js` only if necessary to recognize the future registered App ID without weakening any existing guard
- `tests/safety-guard.test.js`
- `config/sandbox-apps.json` ONLY AFTER successful exact identity read-back
- `project-docs/APP_REGISTRY.md` ONLY AFTER successful exact identity read-back
- necessary living docs after success/failure

A dedicated new script is allowed only if needed to provide a safe single-purpose executable. Prefer one cohesive script:

- `scripts/kintone/create-scoring-config-master-preview.js`

Do not modify the legacy `scripts/kintone/create-sandbox-apps.js` behavior.

Do not modify scoring/profile modules.
Do not modify App794/App795 configuration.
Do not modify `project-docs/AI_ACTIVE_TASK.md`.

## IMPLEMENTATION — SINGLE-PURPOSE EXECUTION PATH

Implement the smallest safe executable path that:

1. Builds the exact Stage-2 authorization object internally.
2. Uses one unique authorization ID for this execution:

   `MBO-P03-WP-002C-STAGE2-20260824-2144-ICT`

3. Calls the existing Stage-1 `assertAppCreationRequestPreflight(...)` exactly once.
4. Uses `getAppCreationConnection()` so APP_CREATE headers use username/password and do not include API token.
5. Sends exactly one real request:

   `POST /k/v1/preview/app.json`

6. Sends exactly this body:

```json
{
  "name": "MBO Profile & Scoring Configuration Master [Sandbox]"
}
```

7. Does not call the generic discovery-blocked `kintoneRequest()` for the POST.
8. Does not provide a generic authorized-write bypass usable by other endpoints.
9. Does not retry APP_CREATE automatically for any reason.

The single-purpose function/script may call `fetch()` directly only after the Stage-1 preflight has passed and only for this exact endpoint/body.

## TRANSPORT / RESPONSE FAILURE RULE

This is critical.

If the APP_CREATE POST:

- throws a network/transport error,
- times out,
- returns an unparseable response,
- returns a response without a valid positive `app` ID,
- or otherwise leaves uncertainty whether the server created the App,

then:

`APP_CREATE_RESULT_UNCERTAIN`

STOP immediately.

Do NOT retry.
Do NOT issue another POST.
Do NOT guess an App ID.
Do NOT search a range of IDs.
Do NOT register anything.

Report the uncertainty for independent reconciliation.

If Kintone returns a clear non-success HTTP response before a valid App ID is received, report the exact HTTP status/error code without credentials and STOP. Do not retry automatically.

## RESPONSE VALIDATION

A successful create response must have:

- `app`: string representing a positive integer
- `revision`: non-empty numeric string

Convert `app` to a positive integer only after validating its format.

Do not trust the returned ID as final identity until read-back succeeds.

## EXACT IDENTITY READ-BACK

Immediately after receiving the returned real App ID, perform a password-authenticated GET:

`GET /k/v1/preview/app/settings.json?app=<RETURNED_APP_ID>`

No API token header for this Stage-2 identity verification path.

Verify at minimum:

- returned App ID is the exact ID used for read-back
- `name === "MBO Profile & Scoring Configuration Master [Sandbox]"`
- `revision` is present and valid
- no other App ID is substituted

If name/identity verification fails:

`APP_IDENTITY_VERIFICATION_FAILED`

Then:

- STOP
- do NOT register the ID in either registry
- do NOT delete the App automatically
- do NOT retry creation
- report the returned App ID for controlled quarantine/recovery

## REGISTER ONLY AFTER VERIFIED READ-BACK

Only after exact identity read-back PASS:

### 1. Update `config/sandbox-apps.json`

Add explicit keys without changing existing 794/795 values:

```json
"scoringConfigMasterAppId": <REAL_VERIFIED_ID>
```

and add purpose text clearly identifying:

`MBO Profile & Scoring Configuration Master [Sandbox]`

Preserve existing `mboV2AppId = 794` and `routingMasterAppId = 795` exactly.

Update `getSandboxAppIds()` minimally so the verified `scoringConfigMasterAppId` is recognized as a registered sandbox target after it exists.

Default `WRITE_ALLOWED_APPS` must remain `[]`.

### 2. Update `project-docs/APP_REGISTRY.md`

Add exactly one row for the real verified App ID:

- Environment: `Sandbox / Preview`
- Name: `MBO Profile & Scoring Configuration Master [Sandbox]`
- Permission: `WP-SCOPED WRITABLE / DEFAULT DENY`
- Purpose: `Versioned MBO evaluation profile and scoring configuration master`

Do not mark it Production.
Do not mark it Deployed.

## APP STATUS AFTER STAGE 2

After successful Stage 2, record:

- `SCORING_MASTER_APP_ID = <REAL_VERIFIED_ID>`
- `APP_STATUS = PREVIEW_CREATED / NOT_DEPLOYED`
- `ENVIRONMENT = SANDBOX`
- `PRODUCTION = FALSE`
- `SCHEMA_STATUS = NOT_CONFIGURED`
- `BASELINE_SEED_STATUS = NOT_STARTED`
- `PUBLISH_PIPELINE_STATUS = NOT_DEPLOYED`

Do not call `/k/v1/preview/app/deploy.json` in this stage.

## KINTONE WRITE BOUNDARY

Authorized maximum for this stage:

```text
APP_CREATE POST = exactly 1
PUT             = 0
DELETE          = 0
DEPLOY          = 0
RECORD WRITES   = 0
```

Apps 53, 283, 305, 307, 310, 640, 643, 715, 716 remain permanent READ ONLY.
Apps 794 and 795 receive zero writes.

## TESTS

Before the live write, add/adjust unit tests for the Stage-2 execution path using mocked `fetch` only. Prove:

1. exact one POST endpoint/body is constructed
2. preflight failure prevents fetch
3. token header is absent
4. password auth header is present
5. malformed create response rejected
6. invalid/non-positive App ID rejected
7. transport failure produces `APP_CREATE_RESULT_UNCERTAIN` and no retry
8. identity read-back uses the exact returned App ID
9. identity name mismatch fails closed
10. successful verified identity returns the exact positive App ID
11. registry logic recognizes `scoringConfigMasterAppId` only when it is a positive integer
12. 794 and 795 remain unchanged and protected by their existing rules
13. default `WRITE_ALLOWED_APPS` remains empty

No real Kintone calls in unit tests.

Run full tests before live execution.

## EXECUTION ORDER

Follow exactly:

1. Implement narrow Stage-2 execution path and mock tests.
2. Run:

```bash
git diff --check
npm test
```

3. If tests fail: STOP. No live write.
4. Commit implementation/tests BEFORE live write:

`feat: add controlled wp-002c preview app creator`

5. Push `ai/codex-wp002c`.
6. Reconfirm clean worktree and exact branch.
7. Execute the single-purpose Stage-2 creation script/function exactly once.
8. If creation or identity verification fails/uncertain: STOP; do not retry.
9. If identity verification passes, update both registries with the exact real App ID.
10. Update living docs with actual App ID and `PREVIEW_CREATED / NOT_DEPLOYED`.
11. Run `git diff --check` and `npm test` again.
12. Commit registry/status changes:

`chore: register wp-002c scoring master preview app`

13. Push branch.
14. STOP. Do not configure schema and do not deploy.

## FINAL REPORT

Report only:

- branch
- implementation commit SHA
- registry/status commit SHA if successful
- tests total/passed/failed before live write
- tests total/passed/failed after registration
- Kintone POST count
- Kintone PUT count
- Kintone DELETE count
- Kintone DEPLOY count
- returned App ID if any
- identity read-back PASS/FAIL/UNCERTAIN
- exact App name read back
- final `SCORING_MASTER_APP_ID`
- final App status

Never print credentials or authorization headers.

Then STOP.

# REVIEW EXPECTATION

Independent Reviewer will inspect GitHub and verify:

1. Stage-2 live creation was explicitly limited to the exact App name `MBO Profile & Scoring Configuration Master [Sandbox]`.
2. Only `POST /k/v1/preview/app.json` was authorized for creation.
3. Add Preview App used username/password auth and did not send API-token auth.
4. No generic write bypass was introduced.
5. APP_CREATE was attempted at most once.
6. No automatic retry path exists.
7. Uncertain transport outcome fails closed as `APP_CREATE_RESULT_UNCERTAIN`.
8. Returned `app` and `revision` were validated.
9. Identity was read back from `GET /k/v1/preview/app/settings.json` using the exact returned App ID.
10. Exact App name was verified before registration.
11. On successful verification, the same real ID was registered in both `config/sandbox-apps.json` and `APP_REGISTRY.md`.
12. Existing App IDs 794 and 795 were not changed.
13. `getSandboxAppIds()` recognizes the new App only after a positive registered ID exists.
14. `WRITE_ALLOWED_APPS` remains `[]` after Stage 2.
15. No schema, permission, process-management, record, seed, or publish configuration was written.
16. No deploy call occurred.
17. Protected Apps received zero writes.
18. Apps 794 and 795 received zero writes.
19. Final status is `PREVIEW_CREATED / NOT_DEPLOYED`, not Production/Deployed.
20. Full regression passes after registration.
21. WP-002D did not start.

Expected gates:

- `APP_CREATE_EXECUTION_GATE = PASS / FAIL / UNCERTAIN`
- `APP_IDENTITY_READBACK_GATE = PASS / FAIL`
- `APP_REGISTRATION_GATE = PASS / FAIL`
- `WRITE_SCOPE_GATE = PASS / FAIL`
- `REGRESSION_GATE = PASS / FAIL`
- `KINTONE_SAFETY_GATE = PASS / FAIL`
- `WP002C_STAGE2_GATE = PASS / FAIL`
