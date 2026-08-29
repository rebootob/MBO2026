# AI ACTIVE TASK — D1 ATTACHMENT SUBMIT-LIFECYCLE INTEGRATION CORRECTIVE

Mode: **ANTIGRAVITY SOURCE/TEST ONLY — NO LIVE WRITE**
Branch: `ai/antigravity-wp002c`

> This task supersedes the broader Timeline + Attachment corrective. Independent review of commit `7247df478eab2a4320019040df1740457b0bfc69` accepted Timeline source truthfulness and attachment display/pending/remove source behavior, but found missing create/edit submit integration for actual upload+binding.

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
TIMELINE_LIVE_TRUTHFULNESS_SOURCE       = PASS
TIMELINE_PREVIEW_FIXTURE_GATE           = PASS
ATTACHMENT_ZERO/MULTIPLE_DISPLAY        = PASS
ATTACHMENT_PENDING_DISPLAY              = PASS
ATTACHMENT_INPUT_HANDLER                = PASS
ATTACHMENT_REMOVE_HANDLER               = PASS
ATTACHMENT_PREVIEW_LEAK_GUARD           = PASS
MBO_ATTACHMENT_SERVICE                  = PASS / KINTONE-ONLY
```

Do not rewrite Timeline logic. Do not redesign attachment UI. Do not reopen routing/scoring/auth/App795/App796/Create-handler work.

## Exact defect to fix

`src/main-mbo-app.js` handles:
- `app.record.create.submit`
- `app.record.edit.submit`

but currently does not invoke pending attachment upload/binding before returning the submit event.

`EmployeePartAUI.uploadPendingAttachments()` and `src/services/mbo-attachment-service.js` exist, but service-only existence does not persist files unless the submit lifecycle invokes it against the exact current submit record.

## Required behavior

For both create and edit submit:

1. keep existing `syncFromDom()` and fail-closed employee/Record_Key/duplicate/business validation behavior;
2. do **not** upload files until those local checks have passed;
3. immediately before successful `return event`, if there are pending attachments:
   - invoke Kintone-only pending upload/binding;
   - bind fileKeys to the exact current `event.record` FILE fields;
   - ensure Objective / Mid-Year / Self (`Final_` fallback where applicable) target only the requested field;
4. on upload/bind error:
   - mark/display not-saved/error state;
   - cancel submit fail-closed;
   - do not pretend the file was saved;
5. no attachment remains optional; zero pending attachments must submit normally;
6. unrelated attachment fields must remain unchanged.

### Record-object correctness

Do not assume the record object retained from `show` is the same object as `event.record` during submit.

Choose the smallest safe integration, for example by allowing `uploadPendingAttachments()` to accept the exact submit record or otherwise explicitly passing `event.record` to the attachment service.

`src/main-mbo-app.js` must remain orchestration-only.

## Focused tests — mandatory

Add/adjust tests that exercise the **real submit lifecycle**, not only the service in isolation:

1. create submit + zero pending files => no upload call; submit succeeds unchanged;
2. edit submit + zero pending files => no upload call; submit succeeds unchanged;
3. create submit + pending Objective file => upload called once; returned fileKey appears on exact `event.record.Objective_Attachment_n`;
4. edit submit + pending Mid-Year/Self file => exact target field only;
5. unrelated attachment field remains unchanged;
6. upload failure => submit cancelled and visible not-saved/error state;
7. no Live network calls in tests;
8. existing 12 timeline/attachment focused tests remain PASS;
9. Timeline Live/Preview regression remains PASS.

If practical, improve the pending-remove focused test so it exercises the real remove handler rather than manually splicing the model.

## Mandatory checks

- new submit-lifecycle focused tests PASS;
- existing `tests/timeline-truthfulness-and-attachment.test.js` PASS;
- full `npm test` PASS;
- module-aware build/build-only PASS;
- no external dependency/service;
- no Live App794/App801/App795/App796 write;
- no deploy/customization write;
- no routing/scoring/auth/reset-password change;
- no D2-D7 change.

## Preferred source scope

Expected files:
- `src/main-mbo-app.js`
- `src/ui/employee-part-a-ui.js` only if needed to pass the exact current submit record safely
- `tests/timeline-truthfulness-and-attachment.test.js` and/or one tightly focused submit-lifecycle test file

Do not modify `src/services/mbo-attachment-service.js` unless a real integration defect requires a minimal change.

## Evidence required

Report:
- START_HEAD fetched at execution start;
- changed files;
- exact create/edit submit integration behavior;
- proof binding targets the exact submit `event.record`;
- focused tests/results;
- full `npm test` result;
- build-only result;
- `LIVE_KINTONE_WRITE = 0`;
- final commit SHA.

Commit + push to `ai/antigravity-wp002c`.
STOP.
Do not Deploy.
Do not Self-PASS.
Maximum status = `IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`.
