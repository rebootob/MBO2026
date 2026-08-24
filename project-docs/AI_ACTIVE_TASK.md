# AI ACTIVE TASK — ANTIGRAVITY LIVE VERIFICATION + GIT CONTROL

> **Control Plane:** ChatGPT / Project Lead / Architect / Independent Reviewer
> **Primary Execution Plane:** Antigravity
> **Codex:** NOT ACTIVE; do not delegate to Codex
> **Rule:** Execute exactly this task. Do not redesign architecture, expand scope, or modify this file.

## ACTIVE TASK

- **Repository:** `rebootob/MBO2026`
- **WP:** `MBO-P03-WP-002C`
- **Stage:** `STAGE 3A — LIVE DEPLOYMENT VERIFICATION CORRECTION`
- **Execution Branch:** `ai/antigravity-wp002c`
- **Review Branch:** `ai/antigravity-wp002c`
- **Source Handoff Branch:** `ai/codex-wp002c`
- **Handoff Baseline Commit:** `18e1d5510e7a03a7a5c3afded0fb36ca9cc9effc`
- **Target App ID:** `796`
- **Exact App Name:** `MBO Profile & Scoring Configuration Master [Sandbox]`
- **Observed by Antigravity:** `DEPLOY_STATUS = SUCCESS`, preview ACL = creator-only/default-deny, live general-settings GET = HTTP 404
- **APP_CREATE:** `FORBIDDEN`
- **NEW ACL PUT:** `FORBIDDEN IN THIS TASK`
- **NEW DEPLOY POST:** `FORBIDDEN IN THIS TASK`
- **Schema / Layout / View / Process / Record / Delete Writes:** `FORBIDDEN`
- **Purpose:** prove the actual live state using correct Kintone management-level GETs and leave auditable Git evidence on the Antigravity branch

## EXECUTION / REVIEW OWNERSHIP

Effective immediately:

```text
ChatGPT = Control Plane
Antigravity = Primary Execution Plane
Codex = Optional specialist only if later authorized
```

For this WP, all new execution commits must go to:

```text
ai/antigravity-wp002c
```

Do not commit new work to `ai/codex-wp002c`.
Do not rename the branch.
Do not merge to `develop`.

When the user asks ChatGPT to `review`, ChatGPT will inspect GitHub branch:

```text
ai/antigravity-wp002c
```

and compare it against the last approved/assigned Control Plane baseline.

## GIT SAFETY GATE — MANDATORY FIRST

Run:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git remote -v
```

Required branch:

```text
ai/antigravity-wp002c
```

If currently on `ai/codex-wp002c`, switch safely:

```bash
git fetch origin
git switch ai/antigravity-wp002c
```

If the branch does not exist locally:

```bash
git fetch origin
git switch --track origin/ai/antigravity-wp002c
```

Then:

```bash
git pull --ff-only
```

Required conditions before execution:

```text
working tree = clean
branch = ai/antigravity-wp002c
remote branch exists
no divergence
HEAD includes Handoff Baseline Commit 18e1d5510e7a03a7a5c3afded0fb36ca9cc9effc
```

Verify baseline ancestry:

```bash
git merge-base --is-ancestor 18e1d5510e7a03a7a5c3afded0fb36ca9cc9effc HEAD
```

Expected exit code: `0`.

If dirty, diverged, wrong branch, non-fast-forward, or baseline ancestry fails: STOP and report. Do not stash/reset/rebase/force-push automatically.

Never commit `.env.local` or secrets.

## CONTROL PLANE CORRECTION

Do not treat:

```text
GET /k/v1/app/settings.json?app=796 -> HTTP 404
```

as conclusive proof that the live App does not exist.

Use management-level live endpoints for proof because Stage 3A intentionally applies creator-only/default-deny record permissions.

Therefore:

```text
LIVE_SETTINGS_404 != LIVE_APP_ABSENT
```

## STEP 1 — READ-ONLY LIVE MANAGEMENT PROBES

Perform password-authenticated GET only.

### Probe 1 — Live App ACL

```text
GET /k/v1/app/acl.json?app=796
```

Capture:

```text
LIVE_ACL_HTTP_STATUS
LIVE_ACL_REVISION
LIVE_ACL_RIGHTS
```

If HTTP 200, verify creator-only/default-deny:

- intended `CREATOR` rights are true
- `Everyone` grants no rights
- no unexpected entity grants rights
- valid revision

### Probe 2 — Live App Admin Notes

```text
GET /k/v1/app/adminNotes.json?app=796
```

Capture:

```text
LIVE_ADMIN_NOTES_HTTP_STATUS
LIVE_ADMIN_NOTES_REVISION
```

Do not modify admin notes.

### Probe 3 — Published App Catalog

```text
GET /k/v1/apps.json?ids[0]=796
```

Interpret carefully:

- returned App 796 = positive publication evidence
- empty/not-visible is not conclusive by itself because access may restrict listing

### Probe 4 — Live General Settings

```text
GET /k/v1/app/settings.json?app=796
```

If 404, record only:

```text
LIVE_SETTINGS_NOT_VISIBLE_TO_CURRENT_AUTH_CONTEXT
```

Do not infer App absence from this endpoint alone.

### Probe 5 — Preview / Deploy Evidence

Reconfirm:

```text
GET /k/v1/preview/app/deploy.json?apps[0]=796
GET /k/v1/preview/app/settings.json?app=796
GET /k/v1/preview/app/acl.json?app=796
GET /k/v1/preview/app/form/fields.json?app=796
```

Required:

```text
DEPLOY_STATUS = SUCCESS
PREVIEW_IDENTITY = exact App 796 / exact name
PLANNED_SCHEMA_FIELDS_PRESENT = NO
```

Never expose credentials or authorization headers.

## STEP 2 — VERIFICATION DECISION

### CASE V1 — LIVE MANAGEMENT PROOF PASS

If either management-level live endpoint returns HTTP 200 for exact App 796:

```text
GET /k/v1/app/acl.json?app=796
OR
GET /k/v1/app/adminNotes.json?app=796
```

and deploy status remains `SUCCESS`, classify:

```text
LIVE_DEPLOYMENT_VERIFICATION = PASS
APP_STATUS = LIVE_DEPLOYED
```

Additional conditions:

- exact Preview identity remains valid
- planned schema fields remain absent
- live ACL is creator-only/default-deny if readable

A live general-settings 404 does not overturn this PASS.

Remaining browser problem, if any, must be classified separately as:

```text
ACCESS_PERMISSION
```

not deployment failure.

### CASE V2 — BOTH MANAGEMENT PROBES PROVE APP NOT FOUND

If both live management endpoints return a true App-not-found condition while deploy status is `SUCCESS`:

```text
LIVE_DEPLOYMENT_STATE = INCONSISTENT
```

Make zero writes and STOP.

### CASE V3 — MANAGEMENT PROBES BLOCKED BY AUTH/PERMISSION

If management endpoints cannot prove state due to authorization/permission:

```text
LIVE_DEPLOYMENT_STATE = UNVERIFIABLE_BY_CURRENT_AUTH_CONTEXT
```

Make zero writes and STOP.

## KINTONE WRITE BOUNDARY

This task is read-only:

```text
GET = allowed
APP_CREATE POST = 0
ACL PUT = 0
DEPLOY POST = 0
SCHEMA/LAYOUT/VIEW/PROCESS writes = 0
RECORD writes = 0
DELETE = 0
```

No exception.

## STEP 3 — REGRESSION

Run:

```bash
git diff --check
npm test
```

All tests must pass.

Prefer zero source-code change in this verification task.

## STEP 4 — DOCUMENTATION ONLY FOR V1

Only if `LIVE_DEPLOYMENT_VERIFICATION = PASS`, update:

- `project-docs/CURRENT_STATE.md`
- `project-docs/HANDOFF.md`
- `project-docs/AI_REVIEW_PACKAGE.md`
- `project-docs/IMPLEMENTATION_STATUS.md`
- `project-docs/CHANGELOG_AI.md`
- `project-docs/APP_REGISTRY.md`

Required status:

```text
Execution Plane = Antigravity
Execution Branch = ai/antigravity-wp002c
Review Branch = ai/antigravity-wp002c
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

If general settings remain 404, record:

```text
LIVE_GENERAL_SETTINGS_VISIBILITY = BLOCKED_BY_CURRENT_AUTH_CONTEXT
REMAINING_ISSUE = ACCESS_PERMISSION
```

Do not change `config/sandbox-apps.json`.
Do not mark independent review PASS.

## STEP 5 — GIT COMMIT / PUSH / REVIEW PACKAGE

Before commit:

```bash
git status --short
git diff --check
git diff --name-only
```

For V1, changed files must be documentation/evidence only as authorized above.

Commit exactly once:

```text
chore: record verified wp-002c live deployment
```

Then push explicitly:

```bash
git push origin ai/antigravity-wp002c
```

After push verify:

```bash
git status --short
git rev-parse HEAD
git rev-parse origin/ai/antigravity-wp002c
```

Required:

```text
working tree = clean
local HEAD = origin/ai/antigravity-wp002c
```

Do not force push.
Do not push to `ai/codex-wp002c`.
Do not merge `develop`.

## STEP 6 — FINAL GIT REVIEW EVIDENCE

The final report must include enough information for ChatGPT to review GitHub without screenshots:

```text
execution branch
baseline commit
final commit SHA
commit message
changed files
local HEAD
remote HEAD
working tree clean YES/NO
push result
```

Also include Kintone safe evidence and test totals.

If V2 or V3 occurs, make no false `LIVE_DEPLOYED` documentation commit. If there is no authorized documentation change, do not create a meaningless commit. Report and STOP.

## FINAL REPORT

Report only:

- execution plane = Antigravity
- repository
- execution/review branch = `ai/antigravity-wp002c`
- baseline commit
- HEAD before work
- verification case V1/V2/V3
- live ACL HTTP status + verification
- live adminNotes HTTP status + verification
- Get Apps result for 796
- live general-settings visibility result
- deploy status
- preview identity/revision
- preview ACL state
- planned schema fields present YES/NO
- tests total/passed/failed
- Kintone GET count
- every Kintone write count (must be zero)
- changed files
- final commit SHA if created
- commit message
- push result
- local HEAD
- remote `origin/ai/antigravity-wp002c` HEAD
- working tree clean YES/NO
- final App state
- remaining issue = DEPLOYMENT / ACCESS_PERMISSION / NONE / UNVERIFIABLE
- STOP confirmation

Never expose credentials, `.env.local`, passwords, tokens, cookies, or authorization headers.

# REVIEW EXPECTATION

ChatGPT will review **GitHub branch `ai/antigravity-wp002c` directly** and verify:

1. Execution occurred on `ai/antigravity-wp002c`, not `ai/codex-wp002c`.
2. Handoff baseline `18e1d5510e7a03a7a5c3afded0fb36ca9cc9effc` is in branch ancestry.
3. No force-push/rebase or history replacement occurred.
4. Local/remote HEAD were synchronized after push.
5. Only authorized files changed.
6. Live general-settings 404 was not used alone to infer App absence.
7. Management-level GET probes were used for live-state proof.
8. Deploy status remained `SUCCESS`.
9. No second deploy POST occurred.
10. No ACL PUT occurred.
11. No APP_CREATE occurred.
12. No schema/layout/view/process/record/delete write occurred.
13. App ID remained exactly 796.
14. Exact App name remained unchanged.
15. If live ACL was readable, it remained creator-only/default-deny.
16. `APP_STATUS = LIVE_DEPLOYED` is recorded only for V1.
17. Browser inability, if present after V1, is classified as `ACCESS_PERMISSION`, not deployment failure.
18. Full regression passes.
19. Stage 3A remains pending ChatGPT Independent Review until `review` is requested.
20. WP-002D did not start.
21. Antigravity stopped after the authorized push/report.

Expected gates:

- `GIT_EXECUTION_BRANCH_GATE = PASS / FAIL`
- `GIT_HISTORY_GATE = PASS / FAIL`
- `GIT_PUSH_SYNC_GATE = PASS / FAIL`
- `LIVE_MANAGEMENT_PROOF_GATE = PASS / FAIL / UNVERIFIABLE`
- `DEPLOYMENT_STATE_GATE = PASS / INCONSISTENT / UNVERIFIABLE`
- `ACCESS_CONTEXT_GATE = PASS / RESTRICTED / UNKNOWN`
- `WRITE_SCOPE_GATE = PASS / FAIL`
- `REGRESSION_GATE = PASS / FAIL`
- `WP002C_STAGE3A_GATE = PASS / BLOCKED`
