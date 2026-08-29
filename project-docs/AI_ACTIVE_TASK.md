# AI ACTIVE TASK — APP794 D1 ATTACHMENT PERSISTENCE CORRECTIVE DEPLOY

Mode: **ANTIGRAVITY AUTHORIZED ONE-SHOT DEPLOYMENT — NO SOURCE CHANGE**
Branch: `ai/antigravity-wp002c`

## Explicit User Authorization

User explicitly authorized:

`อนุมัติ App794 deploy D1 Attachment persistence corrective`

Authorization is one-shot and limited to the deployment operation in this file.

Reviewed source/test candidate:
`2aed3578b710e0283c7a436e7fa7a225ec3e7afb`

Control Plane authorization base before authorization docs:
`497f9ddc58e3eb34c7b01f3f6d6d5c22330ef47e`

Current Live App794 before this deployment is expected to be customization revision 46. Verify; do not assume.

## Accepted implementation — DO NOT REIMPLEMENT

```text
ATTACHMENT_POST_SAVE_REST_CORE             = PASS
SUBMIT_EVENT_ATTACHMENT_NON_MUTATION       = PASS
POST_SAVE_FAILURE_VISIBLE_SOURCE           = PASS
EXPLICIT_DESIRED_SAVED_FILE_SNAPSHOT       = PASS
REAL_HANDLER_SEPARATE_SUBMIT_RECORD_REMOVE = PASS
TIMELINE_ATTACHMENT_REGRESSION_COVERAGE    = PASS
FOCUSED_EXECUTOR_EVIDENCE                  = PASS 26/26
FULL_NPM_TEST_EXECUTOR_EVIDENCE             = PASS 878/878
SOURCE_OWNERSHIP_MODULAR                    = PASS
```

No source fix, refactor, cleanup or feature work is authorized during this deployment.

## Execute Exactly This Sequence

1. Fetch latest `ai/antigravity-wp002c`.
2. Read only:
   - `project-docs/AI_CONTROL_CENTER.md`
   - `project-docs/AI_ACTIVE_TASK.md`
   - existing `project-docs/D1_ATTACHMENT_PERSISTENCE_CORRECTIVE_EVIDENCE.md` only when writing deployment evidence.
3. Verify that application source and reviewed candidate provenance remain unchanged since `2aed3578...`; Control Plane documentation commits after that are expected.
4. Run required deployment preflight. Fail closed on provenance/config/auth/preflight mismatch.
5. Run normal candidate build / module-aware build-only as required. Do not edit source to make build pass.
6. BEFORE any deployment, capture exact App794 current customization state sufficient for rollback:
   - current revision;
   - current JS/CSS customization assets/provenance;
   - exact pre-deploy snapshot/backup reference.
7. Deploy **App794 customization only** using the already-reviewed source/candidate.
8. Wait until Kintone reports deployment completion.
9. Read back Live App794 customization:
   - post-deploy revision;
   - JS/CSS asset identity/hash/provenance;
   - verify Live candidate corresponds to reviewed build/source.
10. If deploy or readback/provenance comparison fails, rollback only to the exact pre-deploy App794 customization snapshot from step 6, then read back rollback state and record it.
11. Add a concise **Deployment Evidence** section to the existing `project-docs/D1_ATTACHMENT_PERSISTENCE_CORRECTIVE_EVIDENCE.md`; do not create extra evidence files unless technically unavoidable.
12. Commit + push evidence only.
13. STOP for ChatGPT Independent Review.

## Strict Write Boundary

Authorized Live operation:

```text
APP794 CUSTOMIZATION DEPLOY = YES / ONE-SHOT
APP794 CUSTOMIZATION ROLLBACK = YES, ONLY IF DEPLOY/READBACK FAILS
```

Forbidden:

```text
SOURCE / REFACTOR CHANGE       = NO
APP794 RECORD WRITE            = NO
APP794 ACL/SCHEMA/PROCESS      = NO
APP801 WRITE                   = NO
APP795/796 WRITE               = NO
ROUTING/SCORING CHANGE         = NO
AUTH/SESSION/RESET CHANGE      = NO
D2-D7 EXECUTION                = NO
EXTERNAL SERVICE               = NO
BROAD REFACTOR                 = NO
```

Do not reuse this authorization for a second deploy attempt after the sequence has completed/been rolled back. A materially new deploy requires new user authorization.

## Required Evidence Fields

Append exact values/results for:

```text
EXECUTION_START_HEAD
REVIEWED_SOURCE_CANDIDATE_SHA = 2aed3578b710e0283c7a436e7fa7a225ec3e7afb
SOURCE_CHANGED_DURING_DEPLOY  = NO
PREFLIGHT_RESULT
BUILD_RESULT
BUILD_ONLY_RESULT
PRE_DEPLOY_APP794_REVISION
PRE_DEPLOY_JS_IDENTITY/HASH
PRE_DEPLOY_CSS_IDENTITY/HASH
ROLLBACK_SNAPSHOT_REFERENCE
DEPLOY_RESULT
POST_DEPLOY_APP794_REVISION
POST_DEPLOY_JS_IDENTITY/HASH
POST_DEPLOY_CSS_IDENTITY/HASH
CANDIDATE_READBACK_MATCH
ROLLBACK_OCCURRED = YES/NO
ROLLBACK_REASON
APP794_RECORD_WRITE = 0
APP794_ACL_SCHEMA_PROCESS_WRITE = 0
APP801_WRITE = 0
APP795_796_WRITE = 0
LIVE_DEPLOY_OCCURRED = YES (unless preflight aborts before deploy)
FINAL_EVIDENCE_COMMIT_SHA
```

If preflight aborts before deployment, record `LIVE_DEPLOY_OCCURRED = NO` and stop; do not improvise a workaround.

## Executor Status Ceiling

Maximum executor status:

`DEPLOYED_PENDING_INDEPENDENT_REVIEW`

or, if aborted before deploy:

`BLOCKED_PENDING_CONTROL_PLANE_REVIEW`

Do not Self-PASS.
