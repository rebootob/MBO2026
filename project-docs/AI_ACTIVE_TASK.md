# AI ACTIVE TASK — ONE-SHOT APP794 D1 TIMELINE + ATTACHMENT DEPLOY

Mode: **ANTIGRAVITY DEPLOY/READBACK ONLY — EXACT ONE-SHOT AUTHORIZATION**
Branch: `ai/antigravity-wp002c`

## Authorization

User explicitly authorized on 2026-08-29:

`App794 deploy D1 Timeline + Attachment corrective`

This is a **single-use deployment authorization**. It is consumed after one successful deployment attempt, or after rollback if rollback becomes necessary.

## Accepted source/test provenance

Independent Review accepted executor candidate:

`433f3106f4f7de0627098dab1f22fb7d032a542d`

Accepted gate:

```text
TIMELINE_LIVE_TRUTHFULNESS              = PASS
ATTACHMENT_DISPLAY/PENDING/REMOVE       = PASS
ATTACHMENT_UPLOAD_SERVICE               = PASS
ATTACHMENT_SUBMIT_INTEGRATION_SOURCE    = PASS
SUBMIT_HANDLER_LEVEL_TEST_PROOF         = PASS
FOCUSED_TESTS                           = PASS (17/17 evidence)
FULL_NPM_TEST                           = PASS (869/869 evidence)
BUILD_ONLY                              = PASS evidence
LIVE_KINTONE_WRITE                      = 0 during source/test gate
```

Current Control Plane HEAD at authorization time:

`eb0e1d8b9fecdba2658dd93e8e48e236d9a521e0`

Commits after `433f310...` are Control Plane documentation only. Before deploy, verify there is **no source/dist/test change after the accepted candidate**:

```bash
git fetch origin --prune
git checkout ai/antigravity-wp002c
git pull --ff-only
git rev-parse HEAD
git diff --name-only 433f3106f4f7de0627098dab1f22fb7d032a542d..HEAD -- src dist tests
```

Expected final command output: **empty**.

If any `src/`, `dist/`, or `tests/` file changed after the accepted candidate, **STOP — DO NOT DEPLOY** and report `BLOCKED_SOURCE_PROVENANCE_CHANGED`.

## Exact allowed operation

Deploy only the already accepted App794 customization containing the D1 Timeline + Attachment corrective.

Allowed:
- synchronize local repo to canonical branch;
- verify accepted source provenance;
- build current accepted App794 customization bundle;
- run module-aware build-only preflight;
- read current App794 customization state;
- create a local pre-deploy backup/snapshot of current App794 customization;
- deploy App794 JavaScript/CSS customization using the existing established deployment tooling;
- wait for Kintone deployment completion;
- read back App794 customization/deployment state;
- if deployment/readback fails, restore the **exact pre-deploy App794 customization snapshot only**;
- write one concise deployment evidence document and commit/push that evidence only.

## Mandatory pre-deploy checks

1. Canonical branch HEAD matches remote.
2. No source/dist/test changes exist after accepted commit `433f310...`.
3. Do **not** modify source to make deployment work.
4. Run the established candidate build:

```bash
npm run ui:build
```

5. Run module-aware preflight only:

```bash
node --env-file=.env.local scripts/kintone/deploy-custom-ui.js --build-only
```

6. Preflight must PASS before any Live write.

Do not rerun broad development/refactor work. Full `npm test` is not required again unless the build/preflight exposes a new source defect because the same source/test candidate has already passed Independent Review.

## Mandatory backup before Live write

Before deployment:
- read current App794 customization configuration/status/revision through the existing Kintone deployment tooling/API;
- save the exact pre-deploy customization snapshot locally under the project's secure local backup practice;
- record pre-deploy revision/status and the exact customization asset references needed for rollback;
- do not commit credentials, tokens, secrets, or private environment data.

Known previously accepted Live customization revision was revision 45, but **fresh readback is authoritative**. Do not assume revision 45 if Live reports otherwise.

## Deployment

Use the repository's existing App794 custom-UI deployment path only. Do not invent a new deploy script or alternate architecture.

Deploy scope:

```text
APP794 CUSTOMIZATION JS/CSS = YES / EXACT ACCEPTED CANDIDATE
APP794 RECORD WRITE         = NO
APP794 ACL WRITE            = NO
APP794 SCHEMA WRITE         = NO
APP794 PROCESS WRITE        = NO
APP801 WRITE                = NO
APP795 WRITE                = NO
APP796 WRITE                = NO
ROUTING/SCORING CHANGE      = NO
AUTH/RESET CHANGE           = NO
D2-D7 EXECUTION             = NO
EXTERNAL SERVICE            = NO
SOURCE REFACTOR             = NO
```

## Readback acceptance evidence

After deploy, record:
- PRE_DEPLOY_HEAD;
- accepted source candidate SHA;
- source-provenance diff result;
- pre-deploy App794 customization revision/status;
- backup path/identifier with secrets excluded;
- build result;
- build-only result;
- actual deploy command/tool used;
- Kintone deployment completion status;
- post-deploy App794 customization revision/status;
- post-deploy JavaScript/CSS customization readback proving the expected candidate assets are active;
- `APP794_RECORD_WRITE = 0`;
- `APP794_ACL_WRITE = 0`;
- `APP801_WRITE = 0`;
- `APP795_796_WRITE = 0`;
- rollback performed = YES/NO;
- final Git SHA after evidence commit.

Create/update only one concise evidence file, preferably:

`project-docs/D1_APP794_TIMELINE_ATTACHMENT_DEPLOY_EVIDENCE.md`

Commit + push the evidence document only.

Maximum executor status:

`DEPLOYED_PENDING_INDEPENDENT_REVIEW`

Antigravity must not self-certify PASS.

## Rollback authorization boundary

Rollback is authorized **only if this exact deployment fails or post-deploy readback does not match the accepted App794 customization**.

Rollback may restore only the exact pre-deploy App794 customization snapshot captured immediately before this deployment.

Rollback does not authorize any App794 record/ACL/schema/process change or any App801/App795/App796 change.

## STOP conditions

STOP without deployment if:
- source provenance changed after accepted candidate;
- build or build-only fails;
- pre-deploy backup/readback cannot be obtained;
- target app is not App794;
- deployment tooling proposes unrelated app/settings writes.

After deploy/readback/evidence commit, STOP for ChatGPT independent review.
