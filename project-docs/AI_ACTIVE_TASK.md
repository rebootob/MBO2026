# AI ACTIVE TASK — D1 ATTACHMENT SUBMIT-LIFECYCLE TEST + EVIDENCE CORRECTIVE

Mode: **ANTIGRAVITY TEST/EVIDENCE ONLY — NO LIVE WRITE**
Branch: `ai/antigravity-wp002c`

> This task follows Independent Review of commit `9b91d10422d7ec424e636dae4f37d3846fa55bb4`. Production submit integration source is accepted. The remaining gap is handler-level verification plus fresh full-suite/build evidence.

## Mandatory architecture

```text
D1 = KINTONE-ONLY
External server/service = FORBIDDEN
Auth Bridge = CANCELLED / DO NOT CONTINUE
APP794 DEPLOY = NO
LIVE KINTONE WRITE = NO
```

Relevant durable baseline:
`project-docs/CONFIRMED_BASELINE/D1_LIVE_UI_TRUTHFULNESS_ATTACHMENTS.md`

## Accepted source state — DO NOT REIMPLEMENT

```text
TIMELINE_LIVE_TRUTHFULNESS_SOURCE        = PASS
ATTACHMENT_DISPLAY/PENDING/REMOVE_SOURCE = PASS
MBO_ATTACHMENT_SERVICE_SOURCE            = PASS
ATTACHMENT_SUBMIT_INTEGRATION_SOURCE     = PASS
```

The accepted submit source already calls:
`await activeUiInstance.uploadPendingAttachments({ record: event.record })`
after local validation and before successful return, with fail-closed cancellation on upload error.

Do not redesign Timeline, attachment UI, upload service, routing, scoring, auth, reset-password, App795/App796, or D2-D7.

## Exact verification defect

Current `tests/timeline-truthfulness-and-attachment.test.js` adds tests named `SUBMIT_LIFECYCLE_*`, but they call `EmployeePartAUI.uploadPendingAttachments()` directly. They do not execute the actual registered `app.record.create.submit` / `app.record.edit.submit` handler in `src/main-mbo-app.js`.

Also, the test renamed to `real click handler removes pending file` still directly splices the model and does not trigger the real click handler.

The previous verification document reports results from the earlier gate and is not fresh evidence for the final submit-integration commit.

## Required tests

Add the smallest focused harness needed to exercise the actual registered Kintone submit handler path.

Must prove:
1. create submit + zero pending files => no upload call; submit succeeds;
2. edit submit + zero pending files => no upload call; submit succeeds;
3. create submit + pending Objective file => handler calls upload after validation and returned fileKey lands on exact `event.record.Objective_Attachment_n`;
4. edit submit + pending Mid-Year or Self file => exact target field only;
5. unrelated attachment field remains unchanged;
6. upload failure from handler path => handler returns/cancels fail-closed and visible error path is invoked;
7. no Live network calls in tests;
8. Timeline Live/Preview regressions remain PASS;
9. existing attachment service/UI tests remain PASS.

For pending-remove coverage, either:
- trigger the actual remove click handler in the test; OR
- rename the test so it does not falsely claim real-handler coverage.

## Fresh execution evidence required

For the new final SHA, record:
- START_HEAD;
- changed files;
- focused handler-level test names/results;
- focused timeline/attachment suite result;
- full `npm test` exact pass count/result;
- module-aware build/build-only result;
- `LIVE_KINTONE_WRITE = 0`;
- `LIVE_DEPLOY_OCCURRED = NO`;
- final commit SHA.

Update `project-docs/D1_LIVE_TIMELINE_ATTACHMENT_VERIFICATION.md` or create one tightly scoped replacement evidence file so the evidence clearly corresponds to the new final SHA.

## Preferred scope

Expected changes:
- `tests/timeline-truthfulness-and-attachment.test.js` and/or one small handler-focused test file;
- verification evidence document;
- rebuilt `dist` only if the normal mandatory build changes it.

Production source changes are **not authorized by default**. Change `src/main-mbo-app.js` / UI/service only if a real handler-level test exposes a genuine defect, and report that defect explicitly.

## Forbidden

```text
APP794 DEPLOY                = NO
APP794 RECORD/ACL WRITE      = NO
APP801 WRITE                 = NO
APP795/796 WRITE             = NO
LIVE FILE UPLOAD DURING TEST = NO
ROUTING/SCORING/AUTH/RESET   = NO
D2-D7                        = NO
EXTERNAL SERVICE             = NO
```

Commit + push to `ai/antigravity-wp002c`.
STOP.
Do not Deploy.
Do not Self-PASS.
Maximum status = `IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`.
