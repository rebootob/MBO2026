# AI ACTIVE TASK — D1 APP794 ATTACHMENT LONG-FILENAME UI ONE-SHOT DEPLOY

Mode: **ANTIGRAVITY ONE-SHOT APP794 CUSTOMIZATION DEPLOY — EXACT AUTHORIZATION ONLY**
Branch: `ai/antigravity-wp002c`
Live App794 customization revision before task: `49`
Reviewed source candidate: `1abd434ab6c4ce04a6f1e5c2fdbaa9a94f75e502`
Independent source verdict: **PASS**
Authorization ID: `APP794-D1-LONG-FILENAME-UI-DEPLOY-20260829-01`
Authorization status at task creation: **AUTHORIZED / ONE-SHOT / UNCONSUMED**

## Accepted State

```text
ATTACHMENT_PERSISTENCE_SOURCE      = PASS
ATTACHMENT_PERSISTENCE_DEPLOYMENT  = PASS / REV49
ATTACHMENT_PERSISTENCE_LIVE_REPORT = USER REPORTS WORKING
LONG_FILENAME_DELETE_VISIBILITY    = LIVE FAIL ON REV49
LONG_FILENAME_UI_SOURCE_CORRECTIVE = PASS
REVIEWED_CANDIDATE                 = 1abd434ab6c4ce04a6f1e5c2fdbaa9a94f75e502
```

Do not reopen schema or attachment persistence logic.

## Exact User Authorization

User authorized:

`อนุมัติ App794 deploy Attachment Long-Filename UI corrective candidate 1abd434`

This authorizes only one App794 customization deployment attempt of the already-reviewed candidate. It does not authorize source fixes, schema/layout changes, business-record writes, ACL/process changes, or work on other apps.

## Mandatory Pre-Deploy Gate

Before any Kintone customization write:

1. Re-fetch canonical branch HEAD.
2. Read `project-docs/AI_CONTROL_CENTER.md` and this Active Task.
3. Verify reviewed candidate remains exactly `1abd434ab6c4ce04a6f1e5c2fdbaa9a94f75e502`.
4. Verify production source/generated candidate bundle have not drifted after candidate review; only Control Plane docs may differ.
5. Run deterministic preflight.
6. Run focused attachment/timeline tests required by current deploy safety gate; do not edit source/tests to make them pass.
7. Run `npm run ui:build`.
8. Run module-aware build-only deployment check and prove 0 Kintone calls.
9. Verify built `dist/mbo-employee-app.js` and `dist/mbo-employee.css` correspond to the reviewed candidate. Unexpected content/hash drift => STOP.
10. Read current App794 customization settings/revision and capture exact desktop JS/CSS identities/topology.
11. Capture rollback snapshot of current Live/Preview App794 customization BEFORE write.

If any gate fails, STOP. Do not patch, rebuild a different candidate, widen scope, or deploy under this authorization.

## Authorized Deployment Scope

Only after every pre-deploy gate passes:

```text
TARGET_APP                    = 794
WRITE_TYPE                    = KINTONE APP CUSTOMIZATION JS/CSS ONLY
REVIEWED_CANDIDATE            = 1abd434ab6c4ce04a6f1e5c2fdbaa9a94f75e502
SOURCE CHANGE                 = FORBIDDEN
TEST CHANGE                   = FORBIDDEN DURING DEPLOY
SCHEMA/LAYOUT WRITE           = FORBIDDEN
BUSINESS RECORD WRITE         = FORBIDDEN
ACL/PROCESS WRITE             = FORBIDDEN
APP801 WRITE                  = FORBIDDEN
APP795/796 WRITE              = FORBIDDEN
ROUTING/SCORING/AUTH/RESET    = FORBIDDEN
D2-D7 EXECUTION               = FORBIDDEN
EXTERNAL SERVICE/STORAGE      = FORBIDDEN
BROAD REFACTOR                = FORBIDDEN
```

Deploy only the reviewed App794 desktop customization JS/CSS generated from the accepted candidate. Do not add/remove unrelated customization entries or mobile customization.

## Post-Deploy Readback

After the one customization write attempt:

1. Wait for Kintone deployment status `SUCCESS` or definitive failure.
2. Read back App794 customization revision/settings.
3. Read back desktop JS/CSS identities/topology.
4. Prove deployed JS/CSS match the reviewed candidate bundle exactly.
5. Verify no unexpected customization topology change.
6. Verify no business-record/schema/layout/ACL/process/App801/App795/App796 write occurred.
7. If readback does not match candidate, use the captured rollback snapshot only if existing safe tooling supports the exact rollback, record result, and STOP. No second forward attempt under this authorization.

## Required Evidence

Append deployment evidence to `project-docs/D1_ATTACHMENT_PERSISTENCE_CORRECTIVE_EVIDENCE.md` including at minimum:

```text
AUTHORIZATION_ID
EXECUTION_START_HEAD
REVIEWED_SOURCE_CANDIDATE_SHA
SOURCE_CHANGED_DURING_DEPLOY
DIST_CHANGED_FROM_REVIEWED_CANDIDATE
PRECHECK_RESULT
FOCUSED_ATTACHMENT_TESTS
FULL_NPM_TEST_IF_RUN
UI_BUILD_RESULT
BUILD_ONLY_RESULT
PRE_DEPLOY_APP794_CUSTOMIZATION_REVISION
PRE_DEPLOY_JS_IDENTITY_HASH
PRE_DEPLOY_CSS_IDENTITY_HASH
PRE_DEPLOY_CUSTOMIZATION_TOPOLOGY
ROLLBACK_SNAPSHOT_REFERENCE
DEPLOY_RESULT
POST_DEPLOY_APP794_CUSTOMIZATION_REVISION
POST_DEPLOY_JS_IDENTITY_HASH
POST_DEPLOY_CSS_IDENTITY_HASH
POST_DEPLOY_CUSTOMIZATION_TOPOLOGY
CANDIDATE_READBACK_MATCH
CUSTOMIZATION_TOPOLOGY_DRIFT
ROLLBACK_OCCURRED
ROLLBACK_REASON
APP794_RECORD_WRITE = 0
APP794_SCHEMA_LAYOUT_WRITE = 0
APP794_ACL_PROCESS_WRITE = 0
APP801_WRITE = 0
APP795_796_WRITE = 0
AUTHORIZATION_CONSUMED = YES
LIVE_DEPLOY_OCCURRED
FINAL_COMMIT_SHA
```

Commit + push deployment evidence only after execution. Do not modify production source as part of evidence recording.

## Stop Rule

After exactly one deployment attempt, authorization is consumed whether the attempt succeeds, fails, or is rolled back. STOP for ChatGPT independent review.

Maximum executor status:
`DEPLOYED_PENDING_INDEPENDENT_REVIEW`

Do not self-PASS the deployment. Do not perform user Live UAT.

## User UAT After Independent Deployment Review PASS

```text
UAT_UI_01 long saved filename stays inside cell and ellipsizes
UAT_UI_02 delete ✕ remains visible at right edge
UAT_UI_03 multiple long files stack; every delete ✕ remains visible
UAT_UI_04 pending/error long filename remains contained
UAT_UI_05 saved remove still removes only selected file after Save
UAT_UI_06 Objective / Mid-Year / Final(Self) visual regression
UAT_UI_07 attachment persistence remains working
```
