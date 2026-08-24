# AI ACTIVE TASK — STAGE 3B LIVING-DOC CORRECTION

> Control Plane: ChatGPT
> Execution Plane: Antigravity
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Starting HEAD: `aedff94fbb86b4dbab6cb49c8135a95b373cd04f`
> Rule: documentation-only. Do not access Kintone. Do not modify this file.

## REVIEW RESULT

Stage 3B technical activation evidence is accepted:

```text
App 796 = LIVE_DEPLOYED
Deploy POST attempts = 1
Deploy status = PROCESSING -> SUCCESS
Live App Detail = PASS
Live Settings = PASS
Live ACL = PASS / CREATOR_ONLY
Get Apps = PASS / App 796 returned
23 planned schema fields = absent
APP_CREATE = 0
ACL PUT = 0
Schema/record/delete writes = 0
Tests = 171/171 PASS
Activation commit = aedff94fbb86b4dbab6cb49c8135a95b373cd04f
```

MUST FIX: living docs still contain stale `Codex`, `ai/codex-wp002c`, `Stage 2`, and `PREVIEW_CREATED / NOT_DEPLOYED` state.

## ALLOWED FILES ONLY

Modify exactly:

- `project-docs/CURRENT_STATE.md`
- `project-docs/IMPLEMENTATION_STATUS.md`
- `project-docs/HANDOFF.md`
- `project-docs/AI_REVIEW_PACKAGE.md`

Do not modify source, tests, config, plans, `APP_REGISTRY.md`, `CHANGELOG_AI.md`, or `AI_ACTIVE_TASK.md`.

## REQUIRED STATE

Make the four documents consistent with:

```text
Active AI = Antigravity
Branch = ai/antigravity-wp002c
WP-002C Stage 2 = PASSED / FROZEN
WP-002C Stage 3A = PASS / R3
WP-002C Stage 3B = ACTIVATION COMPLETE / PENDING CHATGPT RE-REVIEW
SCORING_MASTER_APP_ID = 796
APP_STATUS = LIVE_DEPLOYED
DEPLOY_STATUS = SUCCESS
ACCESS_STATUS = CREATOR_ONLY / DEFAULT_DENY
SCHEMA_STATUS = NOT_CONFIGURED
BASELINE_SEED_STATUS = NOT_STARTED
PUBLISH_PIPELINE_STATUS = NOT_DEPLOYED
Stage3B DEPLOY POST attempts = 1
Tests = 171/171 PASS
NEXT_ACTION = AWAIT CHATGPT INDEPENDENT RE-REVIEW OF STAGE 3B DOCUMENT CONSISTENCY
WP-002D = NOT STARTED
```

`CURRENT_STATE.md`: replace stale Codex/Stage-2/preview state and update test total to 171/171.

`IMPLEMENTATION_STATUS.md`: replace stale operational header and make P3 WP-002C reflect Stage 3B activation complete/pending review. Keep whole WP-002C IN PROGRESS because schema/config/seeding/publish remain incomplete.

`HANDOFF.md`: update the top current-state block from Codex / codex branch / Stage 2 / preview-not-deployed to Antigravity / antigravity branch / Stage 3B / live-deployed. Preserve historical evidence sections below.

`AI_REVIEW_PACKAGE.md`: preserve successful Stage 3B technical evidence and explicitly reference activation commit `aedff94fbb86b4dbab6cb49c8135a95b373cd04f`. Do not self-mark the final Stage 3B review PASS/FROZEN.

## SAFETY

```text
Kintone calls = 0
APP_CREATE = 0
ACL PUT = 0
DEPLOY POST = 0
Schema/record/delete writes = 0
```

Do not use `.env.local`.
Do not start schema configuration.
Do not start WP-002D.

## VALIDATE / COMMIT / PUSH

Run:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git diff --check
git diff --name-only
npm test
```

Before editing, required HEAD is `aedff94fbb86b4dbab6cb49c8135a95b373cd04f` and branch is `ai/antigravity-wp002c`.

After editing, exactly four allowed files must be changed and tests must be `171/171 PASS`.

Commit exactly once:

```text
docs: align wp-002c stage3b living state
```

Push only to `origin/ai/antigravity-wp002c`, verify local HEAD equals remote HEAD and working tree is clean, then STOP.

# REVIEW EXPECTATION

ChatGPT will verify: exactly four docs changed; zero Kintone calls; no code/config changes; all stale Codex/Stage-2/preview state is corrected; App 796 remains LIVE_DEPLOYED with creator-only access and no schema; tests remain 171/171; Stage 3B remains pending ChatGPT re-review; WP-002D/schema work did not start.