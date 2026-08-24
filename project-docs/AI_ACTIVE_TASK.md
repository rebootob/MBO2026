# AI ACTIVE TASK — ANTIGRAVITY EXECUTION HANDOFF

> **Control Plane:** ChatGPT / Project Lead / Architect / Independent Reviewer
> **Primary Execution Plane:** Antigravity
> **Codex:** NOT ACTIVE for this task; do not delegate to Codex unless Control Plane explicitly authorizes it later
> **Rule:** Execute exactly this task. Do not redesign architecture, expand scope, or modify this file.

## ACTIVE TASK

- **Repository:** `rebootob/MBO2026`
- **WP:** `MBO-P03-WP-002C`
- **Stage:** `STAGE 3A — LIVE APP ACTIVATION RECONCILIATION & COMPLETION`
- **Branch:** `ai/codex-wp002c`
- **Branch Note:** legacy branch name is intentionally retained until WP-002C reaches a safe checkpoint; DO NOT rename or create a replacement branch
- **Current HEAD Before Handoff:** `db6b2426c1c10b3ea96c7d9834a211df57389903`
- **Accepted Stage-2 Closure:** `f96645cb94a566263532802ba15611d1a003ad1e`
- **Stage-3A Initial Implementation:** `763aef5dfc3a293d7e9a01c5b673d0d56cbed7f4`
- **Deploy Contract Fix:** `db6b2426c1c10b3ea96c7d9834a211df57389903`
- **Target App ID:** `796`
- **Exact App Name:** `MBO Profile & Scoring Configuration Master [Sandbox]`
- **Last Documented App State:** `PREVIEW_CREATED / NOT_DEPLOYED`
- **APP_CREATE:** `FORBIDDEN`
- **Schema / Layout / View / Process / Record / Delete Writes:** `FORBIDDEN`
- **WP-002D:** `NOT STARTED`

## EXECUTION PLANE CHANGE

Effective immediately:

```text
ChatGPT = Control Plane
Antigravity = Primary Execution Plane
Codex = Optional Code Specialist only when explicitly authorized by ChatGPT
```

Antigravity owns end-to-end local execution for this task, including:

- local Git/worktree inspection
- `.env.local` use without exposing secrets
- terminal commands
- Kintone GET reconciliation
- controlled Kintone writes only when this task explicitly permits them
- tests
- commits
- push
- evidence/status updates

Antigravity must not redesign architecture or widen scope. If anything is ambiguous or unsafe, STOP and report to Control Plane rather than inventing a new solution.

## CURRENT CONTROL PLANE REVIEW STATUS

The deploy empty-body defect has already been corrected in commit:

```text
db6b2426c1c10b3ea96c7d9834a211df57389903
```

Do not redo that correction unless actual local tests prove a regression.

The remaining BLOCKER is operational evidence: GitHub still does not prove whether App 796 was previously partially activated, fully deployed, or untouched after Stage-3A implementation.

Therefore the **first action is READ-ONLY reconciliation against Kintone**.

## STEP 0 — LOCAL / GIT SAFETY GATE

Run:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
```

Required:

```text
branch = ai/codex-wp002c
HEAD = db6b2426c1c10b3ea96c7d9834a211df57389903
working tree = clean
```

If local HEAD is behind remote, perform:

```bash
git fetch origin
git merge --ff-only origin/ai/codex-wp002c
```

If worktree is dirty, diverged, or merge is not fast-forward: STOP and report. Do not stash/discard/reset automatically.

Confirm `.env.local` contains the required Kintone connection variables without printing secret values.

## STEP 1 — KINTONE READ-ONLY RECONCILIATION

Before any Kintone write, inspect exact App `796` using password-authenticated GET only.

Required reads:

1. `GET /k/v1/preview/app/settings.json?app=796`
2. `GET /k/v1/preview/app/acl.json?app=796`
3. `GET /k/v1/preview/app/deploy.json?apps[0]=796`
4. `GET /k/v1/app/settings.json?app=796`
5. If live App exists: `GET /k/v1/app/acl.json?app=796`
6. `GET /k/v1/preview/app/form/fields.json?app=796` to confirm planned WP-002C schema fields are still absent

Never print credentials, passwords, API tokens, cookies, or authorization headers.

Capture only safe evidence:

```text
PREVIEW_IDENTITY
PREVIEW_REVISION
PREVIEW_ACL_STATE
DEPLOY_STATUS
LIVE_EXISTS
LIVE_IDENTITY
LIVE_REVISION
LIVE_ACL_STATE
PLANNED_SCHEMA_FIELDS_PRESENT = YES/NO
```

Exact identity must remain:

```text
App ID = 796
Name = MBO Profile & Scoring Configuration Master [Sandbox]
```

If any different identity is observed: STOP immediately.

## STEP 2 — RECONCILIATION DECISION

### CASE A — LIVE ALREADY DEPLOYED AND VERIFIED

If:

- live App 796 exists
- exact name matches
- live ACL is creator-only
- deploy status is `SUCCESS`
- planned WP-002C schema fields are absent

then:

```text
RECONCILIATION = LIVE_ALREADY_DEPLOYED_VERIFIED
```

Actions:

- Kintone writes = 0
- DO NOT run activation script
- DO NOT PUT ACL again
- DO NOT deploy again
- proceed directly to tests + documentation/evidence update

### CASE B — DEPLOY STATUS = PROCESSING

Perform GET-only bounded polling.

- `SUCCESS` -> verify live identity/ACL/schema and continue as Case A
- `FAIL` / `CANCEL` -> STOP; no new write
- bounded timeout/unknown -> STOP as `DEPLOY_RESULT_UNCERTAIN`

### CASE C — LIVE ABSENT BUT PREVIEW ACL ALREADY CREATOR-ONLY

Treat this as evidence of a possible prior partial Stage-3A execution.

- DO NOT PUT ACL again
- inspect deploy state
- `SUCCESS` -> live verification
- `PROCESSING` -> GET-only polling
- `FAIL` / `CANCEL` / no reliable deploy state -> STOP

Report:

```text
PARTIAL_STAGE3A_STATE_REQUIRES_CONTROL_PLANE
```

Do not deploy again in this case.

### CASE D — CLEAN UNEXECUTED STATE

Only if all are conclusively true:

- live App 796 does not exist
- preview App exact identity is valid
- preview ACL is not already the Stage-3A creator-only ACL
- no prior deploy is PROCESSING/SUCCESS/FAIL/CANCEL in a way indicating previous Stage-3A execution
- planned schema fields are absent

then:

```text
RECONCILIATION = CLEAN_STAGE3A_EXECUTION_ALLOWED
```

Only Case D may perform new Stage-3A writes.

## STEP 3 — REGRESSION BEFORE ANY NEW WRITE

Run:

```bash
git diff --check
npm test
```

All tests must pass.

The existing implementation must preserve:

- deploy success does not parse a response body
- deploy POST is at most once
- transport uncertainty never auto-retries POST
- status polling is GET only
- target App is hard-coded/narrowly authorized to 796
- no APP_CREATE path is used by Stage 3A
- `DISCOVERY_MODE = true`
- default `WRITE_ALLOWED_APPS = []`

If tests fail: STOP. No Kintone write.

## STEP 4 — NEW WRITE EXECUTION ONLY FOR CASE D

Use the already implemented controlled activation path in:

```text
scripts/kintone/activate-scoring-config-master-live.js
```

Do not create a new implementation unless the current path cannot execute for a concrete defect; if so, STOP and report before redesigning.

Maximum NEW Kintone writes permitted in this Antigravity task:

```text
APP_CREATE              = 0
PREVIEW ACL PUT         = 1 maximum
DEPLOY POST             = 1 maximum
SCHEMA FIELD WRITE      = 0
LAYOUT WRITE            = 0
VIEW WRITE              = 0
PROCESS WRITE           = 0
RECORD WRITE            = 0
DELETE                  = 0
```

Required write order:

1. exact preview identity re-check
2. creator-only preview ACL PUT once
3. preview ACL GET read-back
4. deploy POST once using exact latest verified preview revision
5. deploy-status GET polling only
6. exact live identity GET
7. exact live ACL GET
8. preview field GET confirming planned schema is still absent

Never retry ACL PUT or deploy POST automatically.

If write outcome is uncertain, reconcile with GET only and STOP if not provably successful.

## STEP 5 — VERIFIED SUCCESS CRITERIA

Do not claim success until all are true:

```text
LIVE APP ID = 796
LIVE NAME = MBO Profile & Scoring Configuration Master [Sandbox]
DEPLOY STATUS = SUCCESS
LIVE ACL = CREATOR_ONLY
APP_STATUS = LIVE_DEPLOYED
ACCESS_STATUS = CREATOR_ONLY
SCHEMA_STATUS = NOT_CONFIGURED
BASELINE_SEED_STATUS = NOT_STARTED
PUBLISH_PIPELINE_STATUS = NOT_DEPLOYED
ENVIRONMENT = SANDBOX
PRODUCTION = FALSE
```

The user-visible Kintone route `/k/796/` should therefore correspond to an existing live App, subject to the creator-only permission boundary.

## STEP 6 — DOCUMENTATION AFTER VERIFIED SUCCESS ONLY

Only after verified success update:

- `project-docs/CURRENT_STATE.md`
- `project-docs/HANDOFF.md`
- `project-docs/AI_REVIEW_PACKAGE.md`
- `project-docs/IMPLEMENTATION_STATUS.md`
- `project-docs/CHANGELOG_AI.md`
- `project-docs/APP_REGISTRY.md`

Required status:

```text
Execution Plane = Antigravity
WP-002C Stage 2 = PASSED / FROZEN
WP-002C Stage 3A = COMPLETE / PENDING INDEPENDENT REVIEW
SCORING_MASTER_APP_ID = 796
APP_STATUS = LIVE_DEPLOYED
ACCESS_STATUS = CREATOR_ONLY
SCHEMA_STATUS = NOT_CONFIGURED
BASELINE_SEED_STATUS = NOT_STARTED
PUBLISH_PIPELINE_STATUS = NOT_DEPLOYED
```

`APP_REGISTRY.md` must describe App 796 as a live Sandbox App, creator-only/default-deny at this stage.

Do not change `config/sandbox-apps.json`; App ID remains `796`.

Do not mark Stage 3A review PASS; Control Plane owns that Gate.

## STEP 7 — FINAL TEST / COMMIT / PUSH

Run:

```bash
git diff --check
npm test
```

If documentation/evidence changed after verified success, commit exactly once:

```text
chore: record verified wp-002c live activation
```

If Case A required documentation only, use the same commit message.

Push:

```text
ai/codex-wp002c
```

Then STOP.

Do not start schema configuration.
Do not start WP-002D.
Do not rename the branch.
Do not delegate to Codex.

## FAILURE / PARTIAL STATE

If reconciliation is not Case A or clean Case D:

- make no new Kintone write
- do not create another App
- do not delete App 796
- do not alter schema
- do not update docs to `LIVE_DEPLOYED`
- report exact safe reconciliation evidence
- STOP for ChatGPT Control Plane

## FINAL REPORT

Report only:

- execution plane = Antigravity
- branch
- HEAD before execution
- reconciliation case
- preview identity/revision
- preview ACL state
- deploy status
- live exists YES/NO
- live identity/revision
- live ACL state
- planned schema fields present YES/NO
- tests total/passed/failed
- new Kintone GET count
- new ACL PUT count
- new deploy POST count
- APP_CREATE count
- schema/layout/view/process/record/delete write counts
- evidence/status commit SHA if created
- final App ID
- final App status
- final access status
- final schema status
- STOP confirmation

Never expose credentials or authorization headers.

# REVIEW EXPECTATION

ChatGPT Independent Reviewer will inspect GitHub and verify:

1. Antigravity, not Codex, executed the handoff task.
2. Branch `ai/codex-wp002c` was intentionally preserved and not renamed mid-WP.
3. Reconciliation GETs occurred before any new Kintone write.
4. No assumption was made about prior Stage-3A execution from Git history alone.
5. No second APP_CREATE occurred; App ID remains exactly 796.
6. Exact App name remains `MBO Profile & Scoring Configuration Master [Sandbox]`.
7. Deploy success path does not require parsing a response body.
8. Deploy POST has no automatic retry.
9. If prior ACL/deploy state was detected, no duplicate corresponding write occurred.
10. New writes occurred only for conclusively clean Case D.
11. New ACL PUT count is <= 1 and new deploy POST count is <= 1.
12. Apps 794/795 and protected apps received zero writes.
13. No schema/layout/view/process/record/delete operation occurred.
14. Live status is claimed only after deploy `SUCCESS` plus exact live identity and creator-only ACL verification.
15. Planned schema fields remain absent.
16. `DISCOVERY_MODE = true` and default `WRITE_ALLOWED_APPS = []` remain intact.
17. Full regression passes.
18. Living docs identify Antigravity as Execution Plane after verified success.
19. Stage 3A remains `PENDING INDEPENDENT REVIEW` until ChatGPT reviews it.
20. WP-002D did not start.
21. Antigravity stopped after evidence push.

Expected gates:

- `EXECUTION_HANDOFF_GATE = PASS / FAIL`
- `STAGE3A_RECONCILIATION_GATE = PASS / FAIL / UNCERTAIN`
- `DEPLOY_CONTRACT_GATE = PASS / FAIL`
- `ACL_LOCKDOWN_GATE = PASS / FAIL`
- `LIVE_IDENTITY_GATE = PASS / FAIL`
- `WRITE_SCOPE_GATE = PASS / FAIL`
- `REGRESSION_GATE = PASS / FAIL`
- `KINTONE_SAFETY_GATE = PASS / FAIL`
- `WP002C_STAGE3A_GATE = PASS / FAIL / BLOCKED`
