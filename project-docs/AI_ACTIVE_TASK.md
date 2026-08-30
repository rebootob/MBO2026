# AI ACTIVE TASK — APP794 CUMULATIVE PRE-DEPLOY VERIFICATION / READ-ONLY

Mode: **ANTIGRAVITY VERIFICATION EXECUTION ONLY — NO LIVE KINTONE WRITE / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`

## 1. Objective

Verify the next immutable App794 release candidate completely **before** any Live authorization.

This is NOT a deployment task.

```text
LIVE_KINTONE_POST_PUT_DELETE = FORBIDDEN
CUSTOMIZATION_UPLOAD         = FORBIDDEN
PREVIEW_CUSTOMIZATION_PUT    = FORBIDDEN
DEPLOY_POST                  = FORBIDDEN
ROLLBACK                     = FORBIDDEN
SOURCE_EDIT                  = FORBIDDEN
```

Allowed Kintone activity in this task = **GET only** for current App794 customization/readback evidence.

## 2. Candidate Identity — DO NOT USE CURRENT DOCS HEAD AS RELEASE SOURCE

The immutable source candidate is exactly:

`98108e9e387d01b6d3c3a35cce5baf13324be50e`

Current canonical branch HEAD contains later Control Plane documentation commits and is **not** the release-source identity.

Create a temporary detached Git worktree pinned exactly to the candidate. Do not reset/rewrite the canonical branch.

Recommended pattern:

```text
git worktree add --detach <temporary-path> 98108e9e387d01b6d3c3a35cce5baf13324be50e
```

Perform candidate tests/build inside that detached worktree. Remove the temporary worktree after evidence is captured.

Candidate worktree gates:
- `git rev-parse HEAD` = exact candidate SHA above;
- tracked worktree clean before verification;
- tracked worktree clean after build verification;
- no source/test/config changes are allowed.

## 3. Important Release-Scope Classification

This is a **cumulative accepted-source candidate**, not an R4-only candidate.

Compared with the accepted Live Rev57 source commit:

`9816cef195b6d3ffe039e5fb92c8dc8406c8967a`

runtime source delta includes accepted changes from both:

1. **D1 Password Reset Core R1** — source accepted, currently no Live reset UI/write authorized;
2. **App794 WP2 R4 Error-State Back Navigation** — source accepted.

The cumulative release must not be represented as “Back button only”.

Before verification, prove the runtime/source delta from Live source -> candidate and report all changed runtime source/dist/test files. Unexpected runtime files = STOP / report to ChatGPT.

Expected directly relevant runtime source owners include:
- `src/main-mbo-app.js`;
- `src/ui/mbo-kintone-auth-adapter.js`;
- generated `dist/mbo-employee-app.js`.

No CSS business-source change is expected for these accepted changes.

## 4. Required Reading — NO BROAD SCAN

Read only:
1. `project-docs/AI_CONTROL_CENTER.md`
2. this `project-docs/AI_ACTIVE_TASK.md`
3. `project-docs/CONFIRMED_BASELINE/ROLLBACK_RECOVERY_SAFETY.md`
4. `project-docs/CONFIRMED_BASELINE/SOURCE_CODE_ARCHITECTURE.md`
5. `skills/mbo-kintone-ui-runtime-debugging/SKILL.md`
6. `package.json`
7. `scripts/kintone/build-mbo-ui.js`
8. `scripts/kintone/deploy-custom-ui.js`
9. `src/core/kintone-client.js` only for connection/header construction needed by the GET-only readback
10. exact focused tests listed below

Do not broad-scan repository history or unrelated D2-D7 files.

## 5. Candidate Test / Build Verification — NO NETWORK

Inside the detached candidate worktree, install existing dependencies only if required. Do not change package metadata or lock files.

Run at minimum:

```text
node --test tests/employee-record-navigation.test.js tests/employee-main-mbo-app-integration.test.js tests/mbo-kintone-auth-adapter.test.js
node --test tests/deploy-customization-preservation.test.js
```

Then run build-only through the existing deployment tooling. **Do not execute Live mode.**

Use the exported build-only path or equivalent existing CLI behavior that guarantees zero Kintone API calls:

```text
executeDeployCustomUi({ isBuildOnly: true })
```

Capture:
- candidate JS Git blob identity;
- candidate CSS Git blob identity.

Then run:

```text
node --test tests/classic-bundle.test.js tests/css-structure.test.js
```

Required clean-reproduction proof after build:
- `git diff --exit-code -- dist/mbo-employee-app.js dist/mbo-employee.css` = zero diff;
- tracked worktree remains clean.

Do not manually edit generated `dist`.

## 6. Candidate Immutable Git Artifact Cross-Check

Without rebuilding historical releases, obtain immutable Git blob identities directly from Git for:

Candidate:

```text
98108e9e387d01b6d3c3a35cce5baf13324be50e:dist/mbo-employee-app.js
98108e9e387d01b6d3c3a35cce5baf13324be50e:dist/mbo-employee.css
```

The candidate build-only identities must exactly equal the immutable candidate Git blob identities.

Mismatch = STOP.

## 7. Current Live Rev57 Read-Only Preflight — GET ONLY

Accepted current Live baseline expected by Control Plane:

```text
APP                         = 794
LIVE_REVISION               = 57
LIVE_SCOPE                  = ALL
LIVE_TOPOLOGY               = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
LIVE_JS_IDENTITY            = ac22a56cb9d78001384241fe12745f7a2da3da84
LIVE_CSS_IDENTITY           = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
LIVE_DEPLOYED_SOURCE_COMMIT = 9816cef195b6d3ffe039e5fb92c8dc8406c8967a
```

Perform a separate **GET-only** readback. Do NOT call `executeDeployCustomUi()` in Live mode.

Allowed network methods/endpoints are limited to GET required to read:
- `/k/v1/app/customize.json?app=794`;
- `/k/v1/preview/app/customize.json?app=794`;
- `/k/v1/file.json?fileKey=...` for the exact current customization FILE entries required to compute identities.

Use existing connection settings only. Never print passwords/tokens/auth headers.

Read and report:
- Live revision;
- Live scope;
- Live desktop/mobile entry counts and order/type/name;
- Live JS identity from actual downloaded bytes;
- Live CSS identity from actual downloaded bytes;
- Preview revision;
- Preview scope/topology and target entry names;
- network method count proving `POST=0`, `PUT=0`, `DELETE=0`.

Any Live revision/scope/topology/identity drift from the expected Rev57 baseline = STOP. Do not repair or deploy.

## 8. Rollback Manifest Proof — IMMUTABLE / NO REBUILD

The exact rollback target remains the accepted Rev57 content from immutable source:

`9816cef195b6d3ffe039e5fb92c8dc8406c8967a`

Do NOT rebuild that historical commit for rollback proof.

Use immutable Git objects directly, e.g. equivalent of:

```text
git rev-parse 9816cef195b6d3ffe039e5fb92c8dc8406c8967a:dist/mbo-employee-app.js
git rev-parse 9816cef195b6d3ffe039e5fb92c8dc8406c8967a:dist/mbo-employee.css
```

Required rollback manifest evidence:

```text
ROLLBACK_SOURCE_COMMIT
ROLLBACK_JS_PATH
ROLLBACK_JS_IDENTITY
ROLLBACK_CSS_PATH
ROLLBACK_CSS_IDENTITY
ROLLBACK_SCOPE = ALL
ROLLBACK_TOPOLOGY = 1/1/0/0
ROLLBACK_IDENTITIES_MATCH_CURRENT_ACCEPTED_LIVE = YES/NO
```

Expected rollback identities must equal the accepted Live Rev57 JS/CSS identities exactly.

If immutable Git artifacts cannot reproduce the accepted Live pair exactly => STOP / BLOCKED. No deploy authorization can follow.

## 9. Evidence File — ONLY ALLOWED REPOSITORY CHANGE

After verification, create or update exactly one executor evidence file:

`project-docs/APP794_PREDEPLOY_VERIFICATION_EVIDENCE.md`

This file is raw verification evidence only. It must say:

`STATUS = PENDING_CHATGPT_REVIEW`

It must include:
- execution timestamp;
- candidate source commit;
- candidate cumulative runtime scope classification;
- runtime diff file list from Live source -> candidate;
- every command executed and exit status;
- focused test pass/fail counts;
- build-only result;
- candidate JS/CSS identities from build;
- candidate JS/CSS immutable Git identities;
- clean-rebuild / zero tracked dist diff result;
- Live GET-only revision/scope/topology/actual JS+CSS identities;
- Preview GET-only revision/scope/topology;
- GET endpoint list;
- explicit `POST_COUNT=0`, `PUT_COUNT=0`, `DELETE_COUNT=0`;
- rollback manifest and immutable Git identities;
- any warning/gap.

Do not place secrets, auth headers, passwords, tokens, `.env` values or file contents in evidence.

Commit/push **only this evidence file** to `ai/antigravity-wp002c`.

Do not modify:
- `AI_CONTROL_CENTER.md`;
- `AI_ACTIVE_TASK.md`;
- Confirmed Baselines;
- Skill files;
- source/tests/scripts/config/package files;
- generated dist on canonical branch.

## 10. Stop Conditions

STOP immediately and report without write/deploy if any of these occurs:
- candidate detached worktree HEAD mismatch;
- unexpected runtime delta;
- focused test failure;
- build/classic/CSS failure;
- build produces tracked dist drift;
- candidate built identities differ from immutable candidate Git identities;
- Live Rev57 revision/scope/topology/JS/CSS identity drift;
- rollback Git artifacts do not exactly reproduce accepted Rev57 identities;
- GET-only verification cannot be completed safely;
- any command would require POST/PUT/DELETE to continue.

Do not fix source in this task.

## 11. Delivery Contract

Deliver:
1. one evidence commit only;
2. evidence commit SHA;
3. concise summary of PASS/FAIL observations;
4. STOP for ChatGPT Independent Review.

Maximum executor status:

`APP794_PREDEPLOY_VERIFICATION_EVIDENCE_CAPTURED_PENDING_CHATGPT_REVIEW`

No Live authorization exists and no deployment follows automatically.
