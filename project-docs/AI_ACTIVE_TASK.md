# AI ACTIVE TASK — REVIEW CORRECTION

> **Control Plane:** ChatGPT / approved human reviewer
> **Execution Plane:** Codex
> **Rule:** Execute exactly this correction task. Do not redesign architecture, expand scope, or perform any Kintone operation. Do not modify this file.

## ACTIVE TASK

- **WP:** `MBO-P03-WP-002C`
- **Stage:** `STAGE 2 INDEPENDENT REVIEW CORRECTION — LIVING DOC CONSISTENCY ONLY`
- **Branch:** `ai/codex-wp002c`
- **Review Result:** `MUST FIX`
- **Implementation Commit:** `81f6452fe3416e09c91051df9be3de8bb4a391b9`
- **Registry/Status Commit:** `9e5e746a44187ba32f55b905a4df37d2202ddf05`
- **Verified App ID:** `796`
- **Verified App Name:** `MBO Profile & Scoring Configuration Master [Sandbox]`
- **App Status:** `PREVIEW_CREATED / NOT_DEPLOYED`
- **Kintone Writes Authorized:** `NONE`
- **Source-Code Changes Authorized:** `NONE`
- **Schema / Deploy / Record Writes:** `NO`

## REVIEW FINDING

Stage-2 implementation and safety boundaries passed technical review, but the living documentation is internally inconsistent and must be corrected before `WP002C_STAGE2_GATE = PASS`.

This is a documentation-only correction. Do not repeat APP_CREATE, do not call Kintone, and do not change implementation behavior.

## SYNC FIRST

Run:

```bash
git status --short
git fetch origin
git merge --ff-only origin/ai/codex-wp002c
git branch --show-current
```

Expected branch:

```text
ai/codex-wp002c
```

If the worktree is not clean before sync, STOP and report. Do not stash/discard automatically.

## ALLOWED FILES

Only these files may be changed:

- `project-docs/CURRENT_STATE.md`
- `project-docs/HANDOFF.md`
- `project-docs/AI_REVIEW_PACKAGE.md`
- `project-docs/IMPLEMENTATION_STATUS.md`

Do not modify:

- `project-docs/AI_ACTIVE_TASK.md`
- source code under `src/`
- scripts under `scripts/`
- tests under `tests/`
- `config/sandbox-apps.json`
- `project-docs/APP_REGISTRY.md`
- Kintone configuration or records

## REQUIRED CORRECTIONS

### 1. `project-docs/CURRENT_STATE.md`

Make the active WP description consistent with actual Stage-2 completion.

Replace stale `Plan Only` wording for the active WP with wording that clearly states:

```text
MBO-P03-WP-002C — Stage 2 complete / independent review correction pending
```

Preserve:

- `SCORING_MASTER_APP_ID = 796`
- `APP_STATUS = PREVIEW_CREATED / NOT_DEPLOYED`
- `ENVIRONMENT = SANDBOX`
- `PRODUCTION = FALSE`
- `SCHEMA_STATUS = NOT_CONFIGURED`
- `BASELINE_SEED_STATUS = NOT_STARTED`
- `PUBLISH_PIPELINE_STATUS = NOT_DEPLOYED`
- `DISCOVERY_MODE = true`
- `WRITE_ALLOWED_APPS = []`

### 2. `project-docs/HANDOFF.md`

Remove stale WP-002B implementation-scope wording from the current WP-002C Stage-2 handoff.

The current Stage-2 implementation scope must identify the actual Stage-2 artifacts, at minimum:

- `scripts/kintone/create-scoring-config-master-preview.js`
- `src/core/kintone-client.js`
- `src/core/sandbox-write-guard.js`
- `tests/safety-guard.test.js`

Keep historical WP-002B information only in clearly historical WP-002B sections.

Update the handoff timestamp/status metadata so it does not imply the handoff predates the completed Stage-2 work.

### 3. `project-docs/AI_REVIEW_PACKAGE.md`

Make the Stage-2 review evidence self-consistent.

Required updates:

- Replace `WP-002C Stage-2 Registry/Status Commit = (this commit)` with the actual SHA:

  `9e5e746a44187ba32f55b905a4df37d2202ddf05`

- Stage-2 test evidence must reflect the actual final regression baseline:

  `161/161 PASS`

- Do not present `tests/profile-scoring-resolver.test.js (148/148 total)` as the current Stage-2 full-suite evidence. It may remain only as historical WP-002B evidence if explicitly labeled historical.

- Preserve the verified Stage-2 facts:
  - APP_CREATE POST = 1
  - PUT = 0
  - DELETE = 0
  - DEPLOY = 0
  - RECORD WRITES = 0
  - returned App ID = 796
  - exact identity read-back name = `MBO Profile & Scoring Configuration Master [Sandbox]`
  - create/read-back revision = `2`
  - final status = `PREVIEW_CREATED / NOT_DEPLOYED`
  - `WRITE_ALLOWED_APPS = []`

### 4. `project-docs/IMPLEMENTATION_STATUS.md`

Correct the Phase Progress Summary row for WP-002C.

It must no longer say only:

```text
Kintone Profile & Scoring Configuration Master (Plan) | PLAN_CREATED / PENDING INDEPENDENT REVIEW
```

It must reflect actual state:

```text
Stage 2 complete / independent review correction pending
```

Do not mark the independent review PASS yet. Control Plane owns the final Gate decision.

Also update stale handoff timestamp metadata if needed for consistency.

## INVARIANTS

These facts must not change during this correction:

```text
SCORING_MASTER_APP_ID = 796
APP_STATUS = PREVIEW_CREATED / NOT_DEPLOYED
APP_CREATE POST = 1
PUT = 0
DELETE = 0
DEPLOY = 0
RECORD WRITES = 0
DISCOVERY_MODE = true
WRITE_ALLOWED_APPS = []
Apps 794 and 795 unchanged
Protected Apps unchanged
WP-002D NOT STARTED
```

## VALIDATION

Run:

```bash
git diff --check
npm test
```

Expected regression baseline:

```text
161/161 PASS
```

Then verify the diff contains documentation changes only.

Commit exactly once with a documentation-only commit, suggested message:

```text
docs: align wp-002c stage2 review evidence
```

Push `ai/codex-wp002c` and STOP.

## FINAL REPORT

Report only:

- branch
- correction commit SHA
- changed files
- `git diff --check` result
- tests total/passed/failed
- confirmation `Kintone operations = 0`
- confirmation `source/test/config changes = 0`
- final App ID/status preserved

Then STOP. Do not start WP-002D.

# REVIEW EXPECTATION

Independent Reviewer will verify:

1. Correction commit changes documentation only.
2. `CURRENT_STATE.md` no longer describes active WP-002C as `Plan Only`.
3. `HANDOFF.md` current Stage-2 implementation scope names the actual Stage-2 artifacts rather than WP-002B resolver files.
4. `AI_REVIEW_PACKAGE.md` records registry/status commit SHA `9e5e746a44187ba32f55b905a4df37d2202ddf05`.
5. Stage-2 final regression evidence is consistently `161/161 PASS`.
6. `IMPLEMENTATION_STATUS.md` Phase Progress Summary reflects Stage-2 completion and review correction pending.
7. No document falsely marks independent review PASS before Control Plane approval.
8. App ID `796` and exact App name remain unchanged.
9. App status remains `PREVIEW_CREATED / NOT_DEPLOYED`.
10. `WRITE_ALLOWED_APPS` remains `[]` and `DISCOVERY_MODE` remains `true`.
11. No Kintone operation occurs during the correction.
12. No source, test, config, schema, deploy, or record change occurs.
13. WP-002D does not start.

Expected post-correction review gates:

- `DOC_CONSISTENCY_GATE = PASS / FAIL`
- `WRITE_SCOPE_GATE = PASS / FAIL`
- `REGRESSION_GATE = PASS / FAIL`
- `KINTONE_SAFETY_GATE = PASS / FAIL`
- `WP002C_STAGE2_GATE = PASS / FAIL`
