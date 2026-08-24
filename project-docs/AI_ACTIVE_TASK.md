# AI ACTIVE TASK — CONTROLLED EXECUTION

> **Control Plane:** ChatGPT / approved human reviewer
> **Execution Plane:** Codex
> **Rule:** Execute exactly this correction task. Do not redesign architecture or expand scope. Do not modify this file.

## ACTIVE TASK

- **WP:** `MBO-P03-WP-002C`
- **Stage:** `IMPLEMENTATION STAGE 1 — CORRECTION`
- **Branch:** `ai/codex-wp002c`
- **Accepted develop base:** `9d263a4`
- **Target App:** `MBO Profile & Scoring Configuration Master [Sandbox]`
- **App ID:** `NOT_ALLOCATED`
- **App Status:** `NOT_CREATED`
- **Kintone write authorization:** `NO`
- **App creation authorization:** `NO`

## REVIEW FINDING

Stage 1 is close to PASS, but one safety issue remains:

`assertAppCreationAuthorization()` checks caller-supplied flags such as `authorizationConsumed` / `authorizationUsed`, but it does not itself prevent replay of the same authorization ID. Calling the guard twice with the same valid authorization object can still pass twice.

This violates the planned one-time bootstrap contract and must be corrected before any real APP_CREATE stage.

## SYNC FIRST

```bash
git status --short
```

If not clean, STOP and report.

Then:

```bash
git fetch origin
git merge --ff-only origin/ai/codex-wp002c
```

Remain on `ai/codex-wp002c`.

## FILE BOUNDARY

Allowed changes:

- `src/core/sandbox-write-guard.js`
- `tests/safety-guard.test.js`
- living docs only if needed to correct final test counts/status

Do not change:

- `src/core/kintone-client.js` unless strictly required by the replay fix
- `config/sandbox-apps.json`
- `project-docs/APP_REGISTRY.md`
- scoring/profile modules
- `project-docs/AI_ACTIVE_TASK.md`

## REQUIRED FIX — REAL SINGLE-USE / REPLAY PROTECTION

Implement real in-process replay protection for Stage-1 authorization IDs.

Requirements:

1. A valid `authorizationId` may pass authorization only once per process.
2. The guard must maintain consumed authorization IDs internally in module-private state.
3. Caller-supplied `authorizationConsumed` / `authorizationUsed` may remain as additional fail-closed inputs, but must not be the only replay control.
4. After the first successful authorization, a second call with the same `authorizationId` must fail closed even if the caller again sends `authorizationConsumed: false`.
5. Different valid authorization IDs must remain independently usable once each.
6. Blank/missing IDs remain rejected.
7. Do not expose a public function that lets normal callers clear or mark the internal consumed registry.
8. No persistent storage is required in Stage 1; process-local protection is sufficient for this preflight stage. Stage 2 will define the real execution lifecycle before any Kintone write.

Suggested deterministic error:

`APP CREATE BLOCKED: Authorization has already been consumed.`

## TESTS

Add direct regression tests proving:

- first use of authorization ID A passes
- second use of the same authorization ID A fails
- re-creating a fresh auth object with the same ID A still fails
- authorization ID B can still pass once
- caller setting `authorizationConsumed: false` cannot bypass internal replay protection
- all existing Stage-1 safety tests still pass

Avoid test cross-contamination by using unique authorization IDs per test case.

## DOCUMENTATION CORRECTION

The branch now has 5 additional Stage-1 tests over the prior 148 baseline tests, so current full-suite evidence is:

`153/153 PASS`

Update only living-document locations that claim the **current overall** test total is still `148/148`.

Do not rewrite historical WP-002B references that correctly record `148/148` at that earlier point in time.

## KINTONE SAFETY

```text
WRITE_ALLOWED_APPS = []
APP_CREATE = 0
POST = 0
PUT = 0
DELETE = 0
DEPLOY = 0
```

Do not create any Kintone App.
Do not perform any real network write.

## VERIFY

Run:

```bash
git diff --check
npm test
```

Expected after correction:

`153/153 PASS` or higher only if additional top-level regression tests are added intentionally.

## GIT

Implementation correction commit:

`fix: enforce one-time wp-002c app creation authorization`

Then, if living docs change, separate metadata commit:

`docs: correct wp-002c stage1 test evidence`

Push `ai/codex-wp002c`.
Do not merge.

## FINAL REPORT

Report only:

- branch
- files changed
- correction commit SHA
- metadata commit SHA if any
- total tests / passed / failed
- App created YES/NO
- `SCORING_MASTER_APP_ID`
- POST/PUT/DELETE/DEPLOY counts

Then STOP.

# REVIEW EXPECTATION

Independent Reviewer will verify:

1. Replay protection is module-private and not caller-controlled.
2. Same authorization ID cannot pass twice in one process.
3. A fresh object using an already-consumed ID is still rejected.
4. Different authorization IDs remain independently usable once.
5. Existing exact-WP, exact-operation, exact-name, manifest and closed-window protections remain intact.
6. `DISCOVERY_MODE` remains true.
7. `WRITE_ALLOWED_APPS` remains empty.
8. Generic network POST remains blocked.
9. No Kintone write occurred.
10. Target App remains `NOT_CREATED` / `NOT_ALLOCATED`.
11. Current overall test evidence is accurately recorded as `153/153` or the actual higher passing count.
12. Historical WP-002B `148/148` references are not rewritten incorrectly.

Expected gates:

- `APP_CREATE_REPLAY_GATE = PASS / FAIL`
- `APP_CREATE_GUARD_GATE = PASS / FAIL`
- `REGRESSION_GATE = PASS / FAIL`
- `KINTONE_SAFETY_GATE = PASS / FAIL`
- `WP002C_STAGE1_GATE = PASS / FAIL`
