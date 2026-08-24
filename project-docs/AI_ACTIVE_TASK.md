# AI ACTIVE TASK — STAGE 3A REVIEW CORRECTION & RECONCILIATION

> **Control Plane:** ChatGPT / approved human reviewer
> **Execution Plane:** Codex
> **Rule:** Execute exactly this task. Do not redesign architecture or expand scope. Do not modify this file.

## ACTIVE TASK

- **WP:** `MBO-P03-WP-002C`
- **Stage:** `STAGE 3A — LIVE ACTIVATION REVIEW CORRECTION + STATE RECONCILIATION`
- **Branch:** `ai/codex-wp002c`
- **Accepted Stage-2 Closure:** `f96645cb94a566263532802ba15611d1a003ad1e`
- **Stage-3A Implementation Commit Under Review:** `763aef5dfc3a293d7e9a01c5b673d0d56cbed7f4`
- **Verified App ID:** `796`
- **Exact App Name:** `MBO Profile & Scoring Configuration Master [Sandbox]`
- **Control Plane Review:** `BLOCKER + MUST FIX`
- **APP_CREATE:** `FORBIDDEN`
- **Schema / Layout / View / Process / Record / Delete Writes:** `FORBIDDEN`
- **WP-002D:** `NOT STARTED`

## REVIEW FINDINGS

### BLOCKER — LIVE ACTIVATION OUTCOME IS NOT EVIDENCED

GitHub contains only the Stage-3A implementation commit after the Control Plane authorization. There is no activation/status commit and the living state still records App 796 as:

```text
PREVIEW_CREATED / NOT_DEPLOYED
```

Therefore do **not** assume either:

- that no Stage-3A Kintone write occurred, or
- that deployment succeeded.

The exact Kintone state must be reconciled with read-only GETs before any new write.

### MUST FIX — DEPLOY SUCCESS RESPONSE CONTRACT

Kintone `POST /k/v1/preview/app/deploy.json` has **no response body on success**.

Current implementation incorrectly calls `response.json()` after an HTTP-successful deploy POST and therefore classifies the normal empty-body success path as transport/result uncertainty.

Fix the implementation and tests so:

- HTTP success from deploy POST does not require or parse JSON.
- HTTP non-success remains a clear failure.
- thrown/transport failure remains `DEPLOY_RESULT_UNCERTAIN` and is reconciled by GET only.
- deploy POST is never automatically retried.

Official endpoint remains:

```text
POST /k/v1/preview/app/deploy.json
```

Deployment status remains:

```text
GET /k/v1/preview/app/deploy.json?apps[0]=796
```

## STEP 0 — SYNC / CLEAN GATE

Run:

```bash
git status --short
```

If not clean: STOP and report. Do not stash/discard automatically.

Then:

```bash
git fetch origin
git merge --ff-only origin/ai/codex-wp002c
git branch --show-current
```

Expected branch:

```text
ai/codex-wp002c
```

Confirm commit `763aef5dfc3a293d7e9a01c5b673d0d56cbed7f4` is present.

## STEP 1 — READ-ONLY KINTONE RECONCILIATION FIRST

Before changing code and before any Kintone write, use password-authenticated **GET only** to inspect exact App 796.

Read:

1. Preview settings:
   `GET /k/v1/preview/app/settings.json?app=796`
2. Preview ACL:
   `GET /k/v1/preview/app/acl.json?app=796`
3. Deploy status:
   `GET /k/v1/preview/app/deploy.json?apps[0]=796`
4. Live settings:
   `GET /k/v1/app/settings.json?app=796`
5. If live settings exist, live ACL:
   `GET /k/v1/app/acl.json?app=796`

Never print credentials or auth headers.

Record locally for decision making:

```text
PREVIEW_IDENTITY
PREVIEW_REVISION
PREVIEW_ACL_STATE
DEPLOY_STATUS
LIVE_EXISTS
LIVE_IDENTITY
LIVE_REVISION
LIVE_ACL_STATE
```

### RECONCILIATION DECISION TREE

#### Case A — LIVE ALREADY EXISTS AND VERIFIES

If exact live App 796 exists, exact name matches, and live ACL is creator-only:

```text
RECONCILIATION = LIVE_ALREADY_DEPLOYED_VERIFIED
```

Then:

- perform **zero Kintone writes**
- do not run activation script
- do not deploy again
- do not PUT ACL again
- proceed to code correction/tests and status documentation only

#### Case B — DEPLOY STATUS = PROCESSING

Do not send any write.

Poll deploy status with GET only, bounded, until final state.

- `SUCCESS` -> verify live identity + ACL; then treat as Case A
- `FAIL` / `CANCEL` -> STOP and report `PRIOR_DEPLOY_FAILED`; no new deploy POST in this task
- timeout/unknown -> STOP `DEPLOY_RESULT_UNCERTAIN`

#### Case C — LIVE ABSENT BUT PREVIEW ACL IS ALREADY CREATOR-ONLY

This proves a prior Stage-3A ACL write may already have occurred.

Do not PUT ACL again.

Inspect deploy status:

- `SUCCESS` -> verify live; no write
- `PROCESSING` -> GET-only polling
- `FAIL` / `CANCEL` -> STOP; no second deploy authorization in this task
- no prior deploy state can be established -> STOP and report `PARTIAL_STAGE3A_STATE_REQUIRES_CONTROL_PLANE`

Do not guess that a deploy POST was never sent.

#### Case D — LIVE ABSENT, PREVIEW ACL NOT CREATOR-ONLY, AND NO PRIOR DEPLOY IS EVIDENCED

Only this clean state may proceed to a new Stage-3A execution after the code correction/tests pass.

## STEP 2 — CORRECT DEPLOY RESPONSE HANDLING

Allowed implementation files:

- `src/core/kintone-client.js`
- `tests/safety-guard.test.js`

Change the deploy POST handling so a normal HTTP-successful response with an empty body is accepted without JSON parsing.

Keep the existing exact App-796 guard and all fail-closed behavior.

Do not change the App ID, App name, endpoints, ACL design, `DISCOVERY_MODE`, or default `WRITE_ALLOWED_APPS`.

### REQUIRED NEW/ADJUSTED MOCK TESTS

Prove at minimum:

1. HTTP 200 deploy response with **empty/no JSON body** is the normal success submission path.
2. No JSON parse is required for deploy success.
3. Status polling still occurs after successful submission.
4. Deploy POST count remains exactly one.
5. Transport throw produces uncertainty and never retries POST.
6. Non-success HTTP deploy response fails without automatic retry.
7. `PROCESSING -> SUCCESS` uses GET-only polling.
8. No APP_CREATE/schema/record/delete call is generated.
9. Existing exact App-796/creator-only safety tests remain passing.

Update the mock so it reflects Kintone's real no-body deploy response instead of returning `{}`.

## STEP 3 — TEST / IMPLEMENTATION COMMIT

Run:

```bash
git diff --check
npm test
```

All tests must pass.

Commit code/test correction before any possible new live write:

```text
fix: align wp-002c deploy response contract
```

Push branch.

Reconfirm clean worktree.

## STEP 4 — EXECUTION ONLY IF RECONCILIATION CASE D

Only if Step 1 conclusively produced **Case D**, re-run the exact read-only preflight and execute the corrected activation path.

Maximum new writes in this correction execution:

```text
APP_CREATE              = 0
PREVIEW ACL PUT         = 1 maximum, only if not already applied
DEPLOY POST             = 1 maximum, only if no prior deploy is evidenced
SCHEMA/LAYOUT/VIEW      = 0
RECORD WRITES           = 0
DELETE                  = 0
```

Do not reuse a previous uncertain deploy POST as justification for another POST.

After any deploy submission, status reconciliation is GET only.

## STEP 5 — VERIFIED SUCCESS STATE

Success may be established either by:

- Case A reconciliation with zero writes, or
- a clean Case D activation that reaches deploy `SUCCESS`.

Require all:

```text
LIVE APP ID = 796
LIVE NAME = MBO Profile & Scoring Configuration Master [Sandbox]
LIVE ACL = CREATOR_ONLY
DEPLOY STATUS = SUCCESS
SCHEMA_STATUS = NOT_CONFIGURED
BASELINE_SEED_STATUS = NOT_STARTED
PRODUCTION = FALSE
```

Only then update:

- `project-docs/CURRENT_STATE.md`
- `project-docs/HANDOFF.md`
- `project-docs/AI_REVIEW_PACKAGE.md`
- `project-docs/IMPLEMENTATION_STATUS.md`
- `project-docs/CHANGELOG_AI.md`
- `project-docs/APP_REGISTRY.md`

Final app status wording:

```text
APP_STATUS = LIVE_DEPLOYED
ACCESS_STATUS = CREATOR_ONLY
SCHEMA_STATUS = NOT_CONFIGURED
```

Do not change `config/sandbox-apps.json`; App ID remains 796.

Then run:

```bash
git diff --check
npm test
```

Commit verified status evidence:

```text
chore: record verified wp-002c live activation
```

Push and STOP.

## FAILURE / PARTIAL STATE

If reconciliation finds a prior partial/failed/uncertain Stage-3A write state that does not fit verified success and does not fit clean Case D:

- make **no new Kintone write**
- preserve evidence
- push only the deploy-response code/test correction if applicable
- report exact read-only reconciliation result
- STOP for Control Plane

Do not create another App.
Do not delete App 796.
Do not start schema configuration.
Do not start WP-002D.

## FINAL REPORT

Report only:

- branch
- reconciliation case (A/B/C/D or partial)
- preview identity/revision result
- preview ACL state
- deploy status observed
- live App exists YES/NO
- live identity result
- live ACL result
- deploy-response correction commit SHA
- activation/status commit SHA if verified success
- tests total/passed/failed
- Kintone GET count
- new ACL PUT count in this task
- new DEPLOY POST count in this task
- APP_CREATE count in this task
- schema/record/delete write counts
- final App ID/status/access/schema state

Never print credentials or authorization headers.

Then STOP.

# REVIEW EXPECTATION

Independent Reviewer will verify:

1. Stage-3A outcome was reconciled with GETs before any new write.
2. No assumption was made from missing Git evidence about whether prior Kintone writes occurred.
3. Official deploy success is handled as an HTTP success with no required response body.
4. Unit tests model the real no-body deploy response.
5. No deploy POST retry exists.
6. No second APP_CREATE occurs; App ID remains exactly 796.
7. If prior ACL was already applied, it was not PUT again.
8. If prior deploy was PROCESSING/SUCCESS, only GET reconciliation occurred.
9. If prior deploy was FAIL/CANCEL/uncertain partial state, no new deploy POST occurred without new Control Plane authorization.
10. A new ACL PUT/deploy POST occurred only in conclusively clean Case D.
11. Exact App name and App ID were verified after deploy/reconciliation.
12. Live ACL is creator-only before status is marked successful.
13. App 796 is marked `LIVE_DEPLOYED` only after exact live verification.
14. Schema remains `NOT_CONFIGURED`; no fields/layout/views/process/records were changed.
15. `DISCOVERY_MODE = true` and default `WRITE_ALLOWED_APPS = []` remain unchanged.
16. Apps 794/795 and protected apps received zero writes.
17. Full regression passes.
18. WP-002D did not start.

Expected gates:

- `STAGE3A_RECONCILIATION_GATE = PASS / FAIL / UNCERTAIN`
- `DEPLOY_CONTRACT_GATE = PASS / FAIL`
- `ACL_LOCKDOWN_GATE = PASS / FAIL`
- `LIVE_IDENTITY_GATE = PASS / FAIL`
- `WRITE_SCOPE_GATE = PASS / FAIL`
- `REGRESSION_GATE = PASS / FAIL`
- `KINTONE_SAFETY_GATE = PASS / FAIL`
- `WP002C_STAGE3A_GATE = PASS / FAIL / BLOCKED`
