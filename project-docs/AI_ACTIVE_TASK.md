# AI ACTIVE TASK — CONTROLLED EXECUTION

> **Control Plane:** ChatGPT / approved human reviewer
> **Execution Plane:** Codex
> **Rule:** Execute exactly this task. Do not redesign architecture or expand scope. Do not modify this file.

## ACTIVE TASK

- **WP:** `MBO-P03-WP-002C`
- **Stage:** `IMPLEMENTATION STAGE 1 — APP-CREATION SAFETY PREFLIGHT`
- **Branch:** `ai/codex-wp002c`
- **Accepted develop base:** `9d263a4`
- **Target App:** `MBO Profile & Scoring Configuration Master [Sandbox]`
- **App ID:** `NOT_ALLOCATED`
- **App Status:** `NOT_CREATED`
- **Kintone write authorization:** `NO`
- **App creation authorization:** `NO`

This stage implements and unit-tests the safety primitives needed before any real App creation. **No Kintone write may occur.**

## SYNC FIRST

Before editing:

```bash
git status --short
```

If not clean, STOP and report. Do not stash/discard automatically.

Then:

```bash
git fetch origin
git merge --ff-only origin/ai/codex-wp002c
```

Verify branch is still `ai/codex-wp002c`.

## FILE BOUNDARY

Allowed source changes only:

- `src/core/sandbox-write-guard.js`
- `src/core/kintone-client.js`
- `tests/safety-guard.test.js`
- `tests/sandbox-write-guard.test.js` only if required to preserve/extend existing guard regression coverage

Allowed living-doc updates only after tests pass:

- `project-docs/CURRENT_STATE.md`
- `project-docs/IMPLEMENTATION_STATUS.md`
- `project-docs/HANDOFF.md`
- `project-docs/AI_REVIEW_PACKAGE.md`
- `project-docs/CHANGELOG_AI.md`

Do **not** create a new helper/service/test file in this stage unless an existing file genuinely cannot contain the responsibility. Prefer the existing files above.

Do not modify:

- `config/sandbox-apps.json`
- `project-docs/APP_REGISTRY.md`
- scoring/profile resolver modules
- App794/App795 config
- `project-docs/AI_ACTIVE_TASK.md`

## IMPLEMENTATION 1 — EXACT APP_CREATE AUTHORIZATION GUARD

In `src/core/sandbox-write-guard.js`, add a narrow exported guard for the pre-ID bootstrap, e.g.:

`assertAppCreationAuthorization(authConfig, requestConfig)`

Use the approved constants/contracts rather than caller-defined authority.

It must fail closed unless **all** are true:

- `authConfig` and `requestConfig` are valid objects
- work package is exactly `MBO-P03-WP-002C`
- operation is exactly `APP_CREATE`
- `activeWindow === true`
- `explicitUserAuthorization === true`
- a non-empty single-use authorization identifier/nonce exists
- authorization is not already marked consumed/used
- authorized App name is exactly `MBO Profile & Scoring Configuration Master [Sandbox]`
- requested App name is exactly the same approved name
- expected-change manifest exists
- manifest authorizes exactly **one** `APP_CREATE` for that exact App name

Reject:

- wrong/missing WP
- wrong/missing operation
- closed window
- missing explicit authorization
- missing/blank authorization identifier
- consumed authorization
- wrong/blank App name
- generic POST semantics
- missing/empty manifest
- manifest with a different target
- manifest authorizing multiple App creations

This guard must **not require an App ID**, because the ID does not exist yet.

Do not weaken these existing invariants:

- `DISCOVERY_MODE === true`
- protected Apps are absolute deny
- `WRITE_ALLOWED_APPS` default remains empty
- ordinary App-ID writes remain governed by the existing guards

Do not use `dryRunBypassDiscovery` as the APP_CREATE solution.

## IMPLEMENTATION 2 — APP-CREATION REQUEST PREFLIGHT ONLY

In `src/core/kintone-client.js`, add a **pure/preflight authorization path** for future App creation. Do not wire it to execute a real write in this stage.

The preflight must enforce:

- method exactly `POST`
- path exactly `/k/v1/preview/app.json`
- request body App name exactly `MBO Profile & Scoring Configuration Master [Sandbox]`
- successful `assertAppCreationAuthorization(...)`

Any other write endpoint/method must remain denied by existing safety behavior.

**Critical Stage-1 invariant:** the existing network `kintoneRequest()` must still block non-GET execution under current discovery state. Stage 1 must not create a usable network-write escape hatch.

If useful, expose a clearly named pure helper such as:

`assertAppCreationRequestPreflight(...)`

Do not call `fetch()` from this preflight helper.

## IMPLEMENTATION 3 — APP-CREATE AUTHENTICATION CAPABILITY

Kintone's Add Preview App API (`POST /k/v1/preview/app.json`) does not support API-token authentication. Build the future App-create auth preparation into the existing `kintone-client.js` without executing a request.

Add a small helper that prepares/validates the connection for `APP_CREATE` and:

- requires Kintone username + password authentication for this Node-based path
- rejects token-only credentials for `APP_CREATE`
- never treats an API token as sufficient for App creation
- if both password credentials and token exist, the APP_CREATE-specific headers must not include `X-Cybozu-API-Token`
- preserve Basic Auth headers if configured
- never log or return plaintext credentials

Do not change generic read authentication behavior unnecessarily.

## TESTS

Extend existing safety tests. At minimum prove:

1. valid exact WP/name/operation/manifest authorization passes guard validation
2. wrong WP rejected
3. wrong operation rejected
4. missing explicit user authorization rejected
5. closed window rejected
6. wrong App name rejected
7. missing/invalid manifest rejected
8. multiple App-create targets rejected
9. consumed/used authorization rejected
10. APP_CREATE preflight accepts only `POST /k/v1/preview/app.json`
11. wrong path/method rejected
12. token-only APP_CREATE authentication rejected
13. username/password APP_CREATE authentication accepted
14. APP_CREATE headers do not include API token
15. existing generic `kintoneRequest()` still blocks POST under `DISCOVERY_MODE`
16. existing protected-App and App794/App795 safety regression still passes

No real HTTP request in tests. No real Kintone connection.

## KINTONE SAFETY

For this stage:

```text
WRITE_ALLOWED_APPS = []
APP_CREATE = 0
POST = 0
PUT = 0
DELETE = 0
DEPLOY = 0
```

Do not create the target App.
Do not update `config/sandbox-apps.json`.
Do not update `APP_REGISTRY.md`.
Do not touch Apps 53, 283, 305, 307, 310, 640, 643, 715, 716, 794, or 795.

## VERIFY

Run:

```bash
git diff --check
npm test
```

All existing 148 baseline tests must remain passing, plus the new Stage-1 tests.

Inspect the final diff. If any file outside the authorized boundary changed, STOP and revert only your own unauthorized change before committing.

## DOCUMENT STATUS

After code/tests pass, update necessary living docs to state:

- `WP-002C PLAN_GATE = PASS`
- `WP-002C IMPLEMENTATION_STAGE_1 = COMPLETE / PENDING_INDEPENDENT_REVIEW`
- `APP_CREATION_AUTHORIZED = NO`
- `SCORING_MASTER_APP_ID = NOT_ALLOCATED`
- `APP_STATUS = NOT_CREATED`
- Kintone writes = 0

Do not mark Stage 1 review PASS yourself.

## GIT

Commit implementation/tests first:

`feat: add wp-002c app creation safety preflight`

Then, if living docs changed, use a separate metadata commit:

`docs: update wp-002c stage1 review metadata`

Push `ai/codex-wp002c`.

Do not merge to `develop`.

## FINAL REPORT

Report only:

- branch
- source/test files changed
- implementation commit SHA
- metadata commit SHA if any
- total tests / passed / failed
- App created YES/NO
- `SCORING_MASTER_APP_ID`
- POST/PUT/DELETE/DEPLOY counts

Then STOP.

# REVIEW EXPECTATION

Independent Reviewer will inspect the GitHub diff and verify:

1. `assertAppCreationAuthorization` is narrow, fail-closed, exact-WP, exact-operation, exact-name, manifest-scoped, and does not require an App ID.
2. No generic discovery/write safety was weakened.
3. `DISCOVERY_MODE` remains true and default write allow-list remains empty.
4. APP_CREATE preflight is restricted to `POST /k/v1/preview/app.json`.
5. Stage 1 cannot execute a real Kintone write through the new path.
6. Token-only authentication cannot be used for APP_CREATE.
7. Password-based APP_CREATE preparation does not send an API-token header.
8. Existing protected-App invariants remain intact.
9. Apps 794/795 remain untouched.
10. `config/sandbox-apps.json` and `APP_REGISTRY.md` remain unchanged.
11. Target App remains `NOT_CREATED` and ID remains `NOT_ALLOCATED`.
12. No Kintone POST/PUT/DELETE/DEPLOY occurred.
13. Existing 148 tests plus all new Stage-1 tests pass.
14. No scoring/business-rule source changed.
15. WP-002D did not start.

Expected gates:

- `APP_CREATE_GUARD_GATE = PASS / FAIL`
- `KINTONE_PREFLIGHT_GATE = PASS / FAIL`
- `APP_CREATE_AUTH_MODE_GATE = PASS / FAIL`
- `REGRESSION_GATE = PASS / FAIL`
- `KINTONE_SAFETY_GATE = PASS / FAIL`
- `WP002C_STAGE1_GATE = PASS / FAIL`
