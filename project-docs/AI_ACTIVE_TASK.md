# AI ACTIVE TASK — ANTIGRAVITY STAGE 3B CONTROLLED DEPLOY

> **Control Plane:** ChatGPT / Project Lead / Architect / Independent Reviewer
> **Primary Execution Plane:** Antigravity
> **Codex:** NOT ACTIVE; do not delegate to Codex
> **Rule:** Execute exactly this task. Do not redesign architecture, expand scope, or modify this file.

## ACTIVE TASK

- **Repository:** `rebootob/MBO2026`
- **WP:** `MBO-P03-WP-002C`
- **Stage:** `STAGE 3B — CONTROLLED DEPLOY OF EXISTING PREVIEW APP 796`
- **Execution / Review Branch:** `ai/antigravity-wp002c`
- **Required Starting HEAD:** `c3b3388dc5b09c5a08a673bdbd8c972e030ea549`
- **Target App ID:** `796`
- **Exact App Name:** `MBO Profile & Scoring Configuration Master [Sandbox]`
- **Expected Preview Revision:** `3`
- **Environment:** `SANDBOX`
- **Production:** `FALSE`
- **User Authorization:** `YES — continue with the next Control Plane step and activate the existing App 796`
- **APP_CREATE:** `FORBIDDEN`
- **ACL PUT:** `FORBIDDEN`
- **DEPLOY POST:** `EXACTLY ONE MAXIMUM, subject to all preflight gates`
- **Schema / Layout / View / Process / Record / Delete Writes:** `FORBIDDEN`
- **WP-002D:** `NOT STARTED`

## CONTROL PLANE DECISION

Stage 3A exact reconciliation passed with:

```text
LIVE_STATE = PREVIEW_ONLY_STRONG_EVIDENCE
DEPLOYMENT_REQUIRED = YES_PENDING_CONTROL_PLANE_AUTHORIZATION
```

Evidence already established:

```text
Preview App 796 exists
Preview name exact
Preview revision = 3
Preview ACL = CREATOR allowed / Everyone denied
Planned WP-002C schema fields = absent
Live App ACL = GAIA_AP01 / App 796 not found
Live Admin Notes = GAIA_AP01 / App 796 not found
Live General Settings = GAIA_AP01 / App 796 not found
Live App Detail = GAIA_AP01 / App 796 not found
Get Apps = HTTP 200 / apps=[]
Auth context = same configured context as Stage 2
Regression = 171/171 PASS
Stage-3A Kintone writes = 0
```

The Kintone deploy-status GET currently reporting `SUCCESS` is **not sufficient proof that App 796 is activated**, because exact live lookups still show `GAIA_AP01` and the administration UI reports the App as not activated.

This Stage 3B authorizes one new deploy submission of the **existing Preview App 796**.

**Never call Add App / APP_CREATE again.**

## WHAT / WHERE / HOW / WHY

### What

Activate existing Preview App `796` as a live Kintone App.

### Where

Only:

```text
App ID = 796
Name = MBO Profile & Scoring Configuration Master [Sandbox]
```

### How

1. Verify Git state.
2. Re-run exact GET-only preflight.
3. Run full regression before write.
4. Submit exactly one deploy POST using exact Preview revision `3`.
5. Never retry the deploy POST.
6. Reconcile using GET only.
7. Require positive live App proof before claiming success.
8. Update Git evidence/living docs and push.
9. STOP for ChatGPT review.

### Why

App 796 was created only as a pre-live/Preview App. The user requires a usable live Kintone App at `/k/796/`. Kintone's Deploy App Settings API is the activation step for pre-live App settings.

### Expected Impact

On verified success:

```text
APP_ID = 796
APP_STATUS = LIVE_DEPLOYED
ACCESS_STATUS = CREATOR_ONLY / DEFAULT_DENY
SCHEMA_STATUS = NOT_CONFIGURED
BASELINE_SEED_STATUS = NOT_STARTED
PUBLISH_PIPELINE_STATUS = NOT_DEPLOYED
ENVIRONMENT = SANDBOX
PRODUCTION = FALSE
```

Apps 794/795 and all protected Apps remain untouched.

## RISKS / CONTROLS

### Duplicate App risk

Control:

```text
APP_CREATE = 0
```

Never create a replacement App or accept a new App ID.

### Duplicate deploy risk

Control: deploy POST can be submitted **at most once in this task**. A timeout, connection reset, empty response, uncertain response, or post-submit verification problem must never cause a second deploy POST.

### Wrong revision risk

Control: preflight Preview revision must be exactly `3`. If it is not exactly `3`, STOP before any write and report `PREVIEW_REVISION_DRIFT`.

### Permission drift risk

Control: preflight Preview ACL must still be the verified creator-only/default-deny state. Do not PUT ACL in this task.

### Scope expansion risk

Control: no form-field, layout, view, process, customization, record, seed, delete, or other settings change is authorized.

### Rollback

There is **no automatic rollback** in this task.

If deploy is submitted and final verification does not pass:

- do not delete App 796
- do not create another App
- do not send a second deploy POST
- do not call deploy with `revert=true`
- preserve exact evidence in Git
- STOP for Control Plane

Any corrective/revert action requires a new authorization.

## STEP 0 — GIT SAFETY GATE

Run:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git fetch origin
git rev-parse origin/ai/antigravity-wp002c
```

Required before execution:

```text
branch = ai/antigravity-wp002c
HEAD = c3b3388dc5b09c5a08a673bdbd8c972e030ea549
local HEAD = origin/ai/antigravity-wp002c
working tree = clean
```

If any condition fails: STOP. Do not reset, rebase, stash, force-push, or discard automatically.

Never commit `.env.local` or any secret.

## STEP 1 — EXACT PRE-WRITE READ-ONLY PREFLIGHT

Use the existing password-authenticated `.env.local` connection context. Never print credentials or authorization headers.

Perform GET only:

```text
GET /k/v1/preview/app/settings.json?app=796
GET /k/v1/preview/app/acl.json?app=796
GET /k/v1/preview/app/form/fields.json?app=796
GET /k/v1/app.json?id=796
GET /k/v1/apps.json?ids[0]=796
```

Required preconditions:

### Preview identity

```text
name = MBO Profile & Scoring Configuration Master [Sandbox]
revision = 3
```

### Preview ACL

Expected:

```text
CREATOR = intended rights true
Everyone = no granted rights
no unexpected entity grants access
revision = 3
```

Do not modify ACL.

### Preview schema

All 23 planned WP-002C schema fields must still be absent.

### Live state

Expected R3 baseline remains:

```text
GET /k/v1/app.json?id=796 -> GAIA_AP01 / not found
GET /k/v1/apps.json?ids[0]=796 -> apps=[]
```

If **positive live App 796 evidence already exists** during this preflight, STOP without any write and report:

```text
LIVE_ALREADY_EXISTS_REQUIRES_RECONCILIATION
```

Do not deploy again.

If Preview revision/name/ACL/schema differs from expected: STOP with zero writes.

## STEP 2 — REGRESSION BEFORE WRITE

Run:

```bash
git diff --check
npm test
```

Expected:

```text
171/171 PASS
```

All tests must pass before the deploy POST.

No repository source-code change is required or authorized for the deploy operation itself.

Use the existing password-authenticated connection helper or an equivalent safe local one-off execution mechanism. Do not add a generic deployment framework or commit a new deploy utility merely for this one-time operation.

## STEP 3 — EXACT ONE-TIME DEPLOY WRITE

Authorization ID:

```text
MBO-P03-WP-002C-STAGE3B-20260825-0600-ICT
```

Submit exactly one request:

```text
POST /k/v1/preview/app/deploy.json
```

Exact body:

```json
{
  "apps": [
    {
      "app": 796,
      "revision": "3"
    }
  ]
}
```

Rules:

- exactly one App
- App ID exactly `796`
- revision exactly `3`
- omit `revert`
- never use `revision = -1`
- never send APP_CREATE
- never send ACL PUT
- never send another settings write
- do not require a JSON response body; successful Kintone deploy submission has no response body

### POST attempt accounting

As soon as the request is sent, record locally:

```text
STAGE3B_DEPLOY_POST_ATTEMPTS = 1
```

This remains `1` even if the transport result is uncertain.

Never issue attempt `2`.

### Non-success HTTP response

If Kintone returns an explicit non-2xx response:

```text
DEPLOY_SUBMISSION_FAILED
```

Do not retry. Reconcile with GET only if useful, preserve evidence, then STOP.

### Transport uncertainty

If timeout / connection error / lost response occurs:

```text
DEPLOY_SUBMISSION_RESULT = UNCERTAIN
```

Do not retry. Continue only with read-only reconciliation.

## STEP 4 — POST-DEPLOY GET-ONLY RECONCILIATION

After the single deploy submission, use GET only.

Poll:

```text
GET /k/v1/preview/app/deploy.json?apps[0]=796
```

Bounded polling:

```text
maximum 30 checks
approximately 2 seconds between checks
```

Valid status values:

```text
PROCESSING
SUCCESS
FAIL
CANCEL
```

Do not require observing `PROCESSING`. If the first post-submit status is already `SUCCESS`, proceed to live verification.

If `FAIL` or `CANCEL`: STOP, no retry.

If bounded polling does not reach a usable final state: STOP as uncertain, no retry.

## STEP 5 — POSITIVE LIVE VERIFICATION

A deploy-status value of `SUCCESS` alone is not enough.

Require positive live evidence using GET only:

```text
GET /k/v1/app.json?id=796
GET /k/v1/app/settings.json?app=796
GET /k/v1/app/acl.json?app=796
GET /k/v1/apps.json?ids[0]=796
GET /k/v1/app/form/fields.json?app=796
```

Required success state:

### Live identity

```text
App ID = 796
Name = MBO Profile & Scoring Configuration Master [Sandbox]
```

### Published catalog

`Get Apps` must include App 796 for the authenticated execution context.

### Live ACL

Creator-only/default-deny state must be readable and match the intended state.

### Live schema

The 23 planned WP-002C business schema fields must remain absent.

If live App is not visible immediately after deploy status `SUCCESS`, perform bounded GET-only live verification for up to approximately 60 seconds.

If positive live evidence still cannot be obtained:

```text
DEPLOY_POST_SENT = YES
LIVE_VERIFICATION = FAILED_OR_UNCERTAIN
```

Do not retry deploy. Preserve evidence and STOP.

## STEP 6 — SUCCESS DOCUMENTATION

Only after positive live verification PASS, update:

- `project-docs/CURRENT_STATE.md`
- `project-docs/HANDOFF.md`
- `project-docs/AI_REVIEW_PACKAGE.md`
- `project-docs/IMPLEMENTATION_STATUS.md`
- `project-docs/CHANGELOG_AI.md`
- `project-docs/APP_REGISTRY.md`

Required corrections include removing stale Codex / Stage-2-only operational headers where applicable.

Required state:

```text
Active AI = Antigravity
Execution Branch = ai/antigravity-wp002c
WP-002C Stage 2 = PASSED / FROZEN
WP-002C Stage 3A Reconciliation = PASS / R3
WP-002C Stage 3B = COMPLETE / PENDING INDEPENDENT REVIEW
SCORING_MASTER_APP_ID = 796
APP_STATUS = LIVE_DEPLOYED
DEPLOY_STATUS = SUCCESS
ACCESS_STATUS = CREATOR_ONLY / DEFAULT_DENY
SCHEMA_STATUS = NOT_CONFIGURED
BASELINE_SEED_STATUS = NOT_STARTED
PUBLISH_PIPELINE_STATUS = NOT_DEPLOYED
ENVIRONMENT = SANDBOX
PRODUCTION = FALSE
NEXT_ACTION = AWAIT CHATGPT INDEPENDENT REVIEW OF STAGE 3B
```

Do not mark Stage 3B review PASS/FROZEN yourself.

`APP_REGISTRY.md` must identify App 796 as live Sandbox / creator-only at this checkpoint.

Do not change App IDs in `config/sandbox-apps.json`.

## STEP 7 — FAILURE / UNCERTAIN WRITE EVIDENCE

If the deploy POST was attempted but verified success was not achieved, update only the minimum safe living evidence necessary to avoid losing the write history:

- `project-docs/CURRENT_STATE.md`
- `project-docs/HANDOFF.md`
- `project-docs/AI_REVIEW_PACKAGE.md`
- `project-docs/IMPLEMENTATION_STATUS.md`
- `project-docs/CHANGELOG_AI.md`

Record exactly:

```text
STAGE3B_DEPLOY_POST_ATTEMPTS = 1
APP_ID = 796
DEPLOY_RESULT = FAILED / UNCERTAIN / STATUS_<value>
LIVE_VERIFICATION = FAIL / UNCERTAIN
NO RETRY EXECUTED
APP_CREATE = 0
ACL PUT = 0
SCHEMA/RECORD/DELETE WRITES = 0
```

Do not mark App 796 as LIVE_DEPLOYED unless positive live verification passed.

Do not change APP_REGISTRY to live unless success is verified.

## STEP 8 — FINAL TEST / GIT COMMIT / PUSH

After documentation changes:

```bash
git diff --check
npm test
git status --short
git diff --name-only
```

Expected regression remains fully passing.

### Verified success commit

Use exactly:

```text
chore: record wp-002c app 796 activation
```

### Attempted but failed/uncertain commit

Use exactly:

```text
chore: record wp-002c deploy attempt evidence
```

Commit exactly once according to the actual outcome.

Push only:

```bash
git push origin ai/antigravity-wp002c
```

Then verify:

```bash
git fetch origin
git rev-parse HEAD
git rev-parse origin/ai/antigravity-wp002c
git status --short
```

Required:

```text
local HEAD = remote HEAD
working tree = clean
```

Then STOP.

Do not configure the 23-field schema.
Do not seed baseline records.
Do not start WP-002D.
Do not merge to develop.

## KINTONE WRITE BOUNDARY — STAGE 3B

Maximum NEW writes:

```text
APP_CREATE POST = 0
PREVIEW ACL PUT = 0
DEPLOY POST = 1 maximum
SCHEMA FIELD POST/PUT = 0
LAYOUT PUT = 0
VIEW PUT = 0
PROCESS/CUSTOMIZATION WRITE = 0
RECORD WRITE = 0
DELETE = 0
```

Apps 794 and 795:

```text
WRITE COUNT = 0
```

Protected Apps 53, 283, 305, 307, 310, 640, 643, 715, 716:

```text
WRITE COUNT = 0
```

## FINAL REPORT

Report only:

- execution plane = Antigravity
- branch
- starting HEAD
- authorization ID
- preflight Preview identity/revision result
- preflight Preview ACL result
- preflight planned-schema result
- preflight live-state result
- tests before deploy total/passed/failed
- Stage3B APP_CREATE count
- Stage3B ACL PUT count
- Stage3B DEPLOY POST attempt count
- deploy POST HTTP/transport outcome
- post-submit deploy-status sequence/final status
- live App Detail verification PASS/FAIL
- live General Settings verification PASS/FAIL
- live ACL verification PASS/FAIL
- Get Apps publication verification PASS/FAIL
- live planned-schema absence PASS/FAIL
- tests after operation total/passed/failed
- all other write counts
- evidence/status commit SHA
- changed files
- local HEAD / remote HEAD match YES/NO
- working tree clean YES/NO
- final App ID
- final App status
- final access status
- final schema status
- STOP confirmation

Never reveal credentials, usernames, passwords, tokens, cookies, authorization headers, or `.env.local` content.

# REVIEW EXPECTATION

ChatGPT will inspect GitHub branch `ai/antigravity-wp002c` directly and verify:

1. Starting HEAD includes `c3b3388dc5b09c5a08a673bdbd8c972e030ea549`.
2. Execution stayed on `ai/antigravity-wp002c`.
3. Exact Preview identity/name/revision `3` passed before write.
4. Preview ACL remained creator-only/default-deny; no ACL PUT occurred.
5. Planned WP-002C schema fields were absent before deploy.
6. R3 live-not-found baseline was reconfirmed before deploy.
7. Full regression passed before the write.
8. No APP_CREATE occurred; App ID remained exactly 796.
9. Deploy request targeted only `/k/v1/preview/app/deploy.json`.
10. Deploy body contained exactly App 796 / revision 3 / no revert.
11. Deploy POST attempt count was <= 1 and never retried.
12. Empty successful deploy response was handled without JSON parsing requirement.
13. All post-submit reconciliation used GET only.
14. Deploy `SUCCESS` was not treated alone as proof of live activation.
15. Positive live App Detail/settings/catalog evidence was required before `LIVE_DEPLOYED` was claimed.
16. Live ACL verified creator-only/default-deny on success.
17. Planned business schema fields remained absent after activation.
18. No schema/layout/view/process/customization/record/delete write occurred.
19. Apps 794/795 received zero writes.
20. Protected Apps received zero writes.
21. If deploy outcome was uncertain/failed, no retry/revert/delete/new-App operation occurred and write evidence was preserved.
22. Living docs accurately identify Antigravity branch/status and remove stale operational Codex/Stage-2-only metadata after verified success.
23. Full regression passed after the operation.
24. Git local/remote HEADs were synchronized.
25. Stage 3B remains pending ChatGPT independent review until user requests `review`.
26. WP-002D and schema configuration did not start.

Expected gates:

- `STAGE3B_PREFLIGHT_GATE = PASS / FAIL`
- `DEPLOY_WRITE_SCOPE_GATE = PASS / FAIL`
- `DEPLOY_SINGLE_ATTEMPT_GATE = PASS / FAIL`
- `DEPLOY_STATUS_GATE = PASS / FAIL / UNCERTAIN`
- `LIVE_IDENTITY_GATE = PASS / FAIL / UNVERIFIABLE`
- `LIVE_ACL_GATE = PASS / FAIL / UNVERIFIABLE`
- `SCHEMA_PRESERVATION_GATE = PASS / FAIL`
- `REGRESSION_GATE = PASS / FAIL`
- `GIT_PUSH_SYNC_GATE = PASS / FAIL`
- `KINTONE_SAFETY_GATE = PASS / FAIL`
- `WP002C_STAGE3B_GATE = PASS / FAIL / BLOCKED`
