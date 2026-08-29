# D1 ATTACHMENT REMOVE-STATE & POST-SAVE VISIBILITY CORRECTIVE EVIDENCE

```text
START_HEAD                   = 83987037215813c44cd7a4b7470a5aa616ea7aad
CANONICAL_BRANCH             = ai/antigravity-wp002c
CORRECTIVE_DESIGN            = REMOVE DESIRED STATE PERSISTENCE + POST-SAVE VISIBLE FAILURE
FOCUSED_TESTS                = PASS (11/11 attachment & timeline tests passing)
FULL_NPM_TEST                 = PASS (863/863 unit & integration tests passing)
BUILD_ONLY                   = PASS (0 Kintone network calls)
LIVE_KINTONE_WRITE           = 0
LIVE_DEPLOY_OCCURRED         = NO
MAXIMUM_STATUS               = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

## 1. Blocker Corrections Summary

### Blocker 1 — Saved-File Removal Desired-State Persistence (`PASS`)
- **Issue Corrected:** Previously, when a user clicked "remove" on a saved attachment file in the custom UI, the file was removed from UI state but no explicit dirty state was carried into `prepareAttachmentPlan()`.
- **Solution Implemented:**
  - `EmployeePartAUI` tracks dirty/modified attachment field codes in `dirtyAttachmentFields` whenever a saved file is removed via `_removeSavedAttachmentFile` or a pending file is added.
  - `preparePendingAttachments` passes `dirtyFields` to `prepareAttachmentPlan(record, pendingAttachments, { dirtyFields })`.
  - `prepareAttachmentPlan` evaluates the dirty field set, reads the exact desired retained fileKeys from `record[targetCode].value`, and includes them in the prepared post-save REST update plan even when no new pending upload is present.
  - Remove + Add in the same field produces the exact desired combination of retained fileKeys plus newly uploaded fileKeys.

### Blocker 2 — Post-Save REST Failure Visible Truthful Error (`PASS`)
- **Issue Corrected:** On post-save REST binding failure (`PUT /k/v1/record.json`), Kintone's default submit.success behavior would perform normal page redirection, causing inline error messages to disappear silently.
- **Solution Implemented:**
  - In `src/main-mbo-app.js` submit.success handlers (`app.record.create.submit.success` / `app.record.edit.submit.success`), if post-save REST binding fails:
    1. Renders validation error inline (`activeUiInstance.showValidationErrors(...)`).
    2. Displays a visible alert/notification explicitly stating: `Record saved, but attachment binding failed: [Error details]`.
    3. Sets `event.url = location.href` (or `null`) to block Kintone's default redirect, ensuring the user retains the page with the visible error.
  - On the success path, `event` is returned unmodified to preserve normal Kintone redirect behavior.

## 2. Source Code Ownership & Changes

- [src/services/mbo-attachment-service.js](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/src/services/mbo-attachment-service.js): Updated `prepareAttachmentPlan` to process `dirtyFields` and construct exact post-save REST plans for saved-file removals.
- [src/ui/employee-part-a-ui.js](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/src/ui/employee-part-a-ui.js): Updated `_removeSavedAttachmentFile` to record dirty field codes, passed `dirtyFields` in `preparePendingAttachments`, and cleared dirty state in `finalizeAttachmentPlan`.
- [src/main-mbo-app.js](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/src/main-mbo-app.js): Updated submit.success catch block to trigger visible alert/notification and set `event.url` to prevent silent redirect on error.
- [tests/timeline-truthfulness-and-attachment.test.js](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/tests/timeline-truthfulness-and-attachment.test.js): Updated focused tests covering all 11 required contract assertions.

## 3. Test & Build Verification Results

- **Focused Test Suite (`node tests/timeline-truthfulness-and-attachment.test.js`):** **11/11 PASS (100%)**
  - `EXISTING_SAVED_FILES_PRESERVED`: PASS
  - `EXPLICIT_REMOVE_DESIRED_STATE`: PASS
  - `REMOVE_PLUS_ADD_EXACT_DESIRED_STATE`: PASS
  - `UNRELATED_ATTACHMENT_FIELDS_UNCHANGED`: PASS
  - `EDIT_SUBMIT_PENDING_UPLOAD_PREPARES_PLAN`: PASS
  - `SUBMIT_EVENT_ATTACHMENT_OBJECT_UNCHANGED`: PASS
  - `POST_SAVE_BIND_FAILURE_VISIBLE_TRUTHFUL_ERROR`: PASS
  - `POST_SAVE_BIND_FAILURE_NO_SILENT_REDIRECT`: PASS
  - `SUCCESS_PATH_NORMAL_REDIRECT_BEHAVIOR`: PASS
  - `NO_LIVE_NETWORK_IN_TESTS`: PASS
  - `TIMELINE_ATTACHMENT_REGRESSION`: PASS
- **Repository Full Test Suite (`npm test`):** **863/863 PASS (100%)**
- **Candidate Bundle Build (`npm run ui:build`):** `PASS` (`dist/mbo-employee-app.js` & `dist/mbo-employee.css` generated cleanly)
- **Module-Aware Build-Only Check (`node --env-file=.env.local scripts/kintone/deploy-custom-ui.js --build-only`):** `PASS` (0 Kintone network calls)
- **Live Writes & Deployment:** Zero Live Kintone write performed (`LIVE_KINTONE_WRITE = 0`, `LIVE_DEPLOY_OCCURRED = NO`).
