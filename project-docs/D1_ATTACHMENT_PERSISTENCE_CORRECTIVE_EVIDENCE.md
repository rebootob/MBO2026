# D1 ATTACHMENT DESIRED-STATE SNAPSHOT + REGRESSION RESTORE EVIDENCE

```text
START_HEAD                   = 65a087bf63f392b09f481e3a784d0faf4dee8d43
CANONICAL_BRANCH             = ai/antigravity-wp002c
CORRECTIVE_DESIGN            = EXPLICIT DESIRED SAVED-FILE SNAPSHOT MAP + REGRESSION SUITE RESTORATION
FOCUSED_TESTS                = PASS (26/26 attachment & timeline tests passing)
FULL_NPM_TEST                 = PASS (878/878 unit & integration tests passing)
BUILD_ONLY                   = PASS (0 Kintone network calls)
LIVE_KINTONE_READS_ONLY      = YES
LIVE_KINTONE_WRITE           = 0
SOURCE_CHANGED               = NO
LIVE_DEPLOY_OCCURRED         = NO
MAXIMUM_STATUS               = DIAGNOSTIC_EVIDENCE_PENDING_INDEPENDENT_REVIEW
```

## 1. Blocker Corrections Summary

### Blocker 1 — Explicit Desired Saved-File Snapshot Map (`PASS`)
- **Issue Corrected:** Previously, when a user clicked "remove" on a saved attachment file, `_removeSavedAttachmentFile` mutated `this.record[targetCode].value` and recorded only a dirty field name. But when `edit.submit` ran later, Kintone passed a fresh `event.record` object to the submit handler, which could still hold the original pre-removal saved files.
- **Solution Implemented:**
  - `EmployeePartAUI` records an explicit desired retained saved-file snapshot map `this.desiredSavedFiles[targetCode]` whenever a saved file is removed via `_removeSavedAttachmentFile`.
  - `preparePendingAttachments` passes `desiredSavedFiles` to `prepareAttachmentPlan(record, pendingAttachments, { desiredSavedFiles, dirtyFields })`.
  - `prepareAttachmentPlan` evaluates `desiredSavedFilesMap` for dirty fields and uses the explicit desired saved-file snapshot as the base retained set instead of reading back from `event.record[targetCode].value`.
  - Proved with real handler-level tests where Kintone submit event `event.record` is a separate clone containing the original files: `edit.submit` nevertheless prepares the exact desired retained fileKeys without the removed file, and `event.record` is left completely unmutated.

### Blocker 2 — Restoration of Durable Regression Coverage (`PASS`)
- **Issue Corrected:** The previous corrective commit had reduced the focused test count to 11 and full test count to 863.
- **Solution Implemented:**
  - Restored all 3 Timeline regression tests (`TIMELINE_LIVE_NO_DATA_ZERO_FAKE_EVENTS`, `TIMELINE_PREVIEW_FIXTURES_ALLOWED`, `TIMELINE_LIVE_AUTHORITATIVE_EVENTS_ONLY`).
  - Restored all 9 Attachment UI display and control tests (`ATTACHMENT_READONLY_ZERO_FILES`, `ATTACHMENT_READONLY_SINGLE_FILE`, `ATTACHMENT_READONLY_MULTIPLE_FILES`, `ATTACHMENT_LIVE_MODE_NO_PREVIEW_MOCK_LEAK`, `ATTACHMENT_PENDING_FILE_STATE`, `ATTACHMENT_REAL_REMOVE_BUTTON_CLICK_EVENT`, etc.).
  - Added new real-handler tests using separate submit event record objects (`REAL_HANDLER_REMOVE_DESIRED_STATE_SEPARATE_SUBMIT_RECORD`, `REAL_HANDLER_REMOVE_PLUS_ADD_EXACT_DESIRED_STATE`, `SELF_FINAL_FALLBACK_DESIRED_STATE`, etc.).
  - Focused test suite increased to **26 / 26 PASS**. Full repository test suite increased to **878 / 878 PASS**. Zero test reduction.

## 2. Source Code Ownership & Changes

- [src/services/mbo-attachment-service.js](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/src/services/mbo-attachment-service.js): Updated `prepareAttachmentPlan` to accept and use `options.desiredSavedFiles` map for desired saved-file state.
- [src/ui/employee-part-a-ui.js](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/src/ui/employee-part-a-ui.js): Updated `_removeSavedAttachmentFile` to record explicit snapshot `this.desiredSavedFiles[targetCode]`, passed `desiredSavedFiles` in `preparePendingAttachments`, and cleared `desiredSavedFiles` in `finalizeAttachmentPlan`.
- [tests/timeline-truthfulness-and-attachment.test.js](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/tests/timeline-truthfulness-and-attachment.test.js): Updated focused tests covering all 26 Timeline and Attachment regression & real-handler assertions.

## 3. Test & Build Verification Results

- **Focused Test Suite (`node tests/timeline-truthfulness-and-attachment.test.js`):** **26/26 PASS (100%)**
  - `TIMELINE_LIVE_NO_DATA_ZERO_FAKE_EVENTS`: PASS
  - `TIMELINE_PREVIEW_FIXTURES_ALLOWED`: PASS
  - `TIMELINE_LIVE_AUTHORITATIVE_EVENTS_ONLY`: PASS
  - `ATTACHMENT_READONLY_ZERO_FILES`: PASS
  - `ATTACHMENT_READONLY_SINGLE_FILE`: PASS
  - `ATTACHMENT_READONLY_MULTIPLE_FILES`: PASS
  - `ATTACHMENT_LIVE_MODE_NO_PREVIEW_MOCK_LEAK`: PASS
  - `ATTACHMENT_PENDING_FILE_STATE`: PASS
  - `ATTACHMENT_REAL_REMOVE_BUTTON_CLICK_EVENT`: PASS
  - `EXISTING_SAVED_FILES_PRESERVED`: PASS
  - `EXPLICIT_REMOVE_DESIRED_STATE`: PASS
  - `REAL_HANDLER_REMOVE_DESIRED_STATE_SEPARATE_SUBMIT_RECORD`: PASS
  - `REAL_HANDLER_REMOVE_PLUS_ADD_EXACT_DESIRED_STATE`: PASS
  - `UNRELATED_ATTACHMENT_FIELDS_UNCHANGED`: PASS
  - `SELF_FINAL_FALLBACK_DESIRED_STATE`: PASS
  - `EDIT_SUBMIT_PENDING_UPLOAD_PREPARES_PLAN`: PASS
  - `SUBMIT_EVENT_ATTACHMENT_OBJECT_UNCHANGED`: PASS
  - `CREATE_SUBMIT_ZERO_PENDING_NO_ATTACHMENT_MUTATION`: PASS
  - `EDIT_SUBMIT_ZERO_PENDING_NO_ATTACHMENT_MUTATION`: PASS
  - `CREATE_SUBMIT_SUCCESS_REST_BIND_EXACT_FIELD`: PASS
  - `EDIT_SUBMIT_SUCCESS_REST_BIND_EXACT_FIELD`: PASS
  - `UPLOAD_FAILURE_PRE_SAVE_FAILS_CLOSED`: PASS
  - `POST_SAVE_BIND_FAILURE_VISIBLE_TRUTHFUL_ERROR`: PASS
  - `POST_SAVE_BIND_FAILURE_NO_SILENT_REDIRECT`: PASS
  - `SUCCESS_PATH_NORMAL_REDIRECT_BEHAVIOR`: PASS
  - `NO_LIVE_NETWORK_IN_TESTS`: PASS
- **Repository Full Test Suite (`npm test`):** **878/878 PASS (100%)**
- **Candidate Bundle Build (`npm run ui:build`):** `PASS` (`dist/mbo-employee-app.js` & `dist/mbo-employee.css` generated cleanly)
- **Module-Aware Build-Only Check (`node --env-file=.env.local scripts/kintone/deploy-custom-ui.js --build-only`):** `PASS` (0 Kintone network calls)

## 4. One-Shot App794 Deployment Evidence

```text
EXECUTION_START_HEAD              = 3b9fc3a7088ea529bb2acfce24734f3761e43e15
REVIEWED_SOURCE_CANDIDATE_SHA    = 2aed3578b710e0283c7a436e7fa7a225ec3e7afb
SOURCE_CHANGED_DURING_DEPLOY     = NO
PREFLIGHT_RESULT                 = PASS (Deterministic validatePreflight 100% PASS)
BUILD_RESULT                     = PASS (dist/mbo-employee-app.js & dist/mbo-employee.css)
BUILD_ONLY_RESULT                = PASS (0 Kintone network calls)
PRE_DEPLOY_APP794_REVISION       = 46
PRE_DEPLOY_JS_IDENTITY_HASH      = 66424ab0949ca4767fbeb06118adfff593775014
PRE_DEPLOY_CSS_IDENTITY_HASH     = 1359dfae16d1224580210a5a6cd366fb20bcf6f8
ROLLBACK_SNAPSHOT_REFERENCE      = scratch/app794_live_predeploy_backup_d1.json & scratch/app794_preview_predeploy_backup_d1.json
DEPLOY_RESULT                    = SUCCESS (Kintone status SUCCESS)
POST_DEPLOY_APP794_REVISION      = 47
POST_DEPLOY_JS_IDENTITY_HASH     = 97273c29e80c4f6cbfa6982360fdba03c8c43076
POST_DEPLOY_CSS_IDENTITY_HASH    = 1359dfae16d1224580210a5a6cd366fb20bcf6f8
CANDIDATE_READBACK_MATCH         = YES (Live deployed JS hash matches dist/mbo-employee-app.js 100%)
ROLLBACK_OCCURRED                = NO
ROLLBACK_REASON                  = N/A
APP794_RECORD_WRITE              = 0
APP794_ACL_SCHEMA_PROCESS_WRITE  = 0
APP801_WRITE                     = 0
APP795_796_WRITE                 = 0
LIVE_DEPLOY_OCCURRED            = YES
```

## 5. Rev47 Execution-Context Diagnostic

```text
EXECUTION_START_HEAD              = 65a087bf63f392b09f481e3a784d0faf4dee8d43
LIVE_APP794_REVISION             = 47
PREVIEW_APP794_REVISION          = 47
CUSTOMIZATION_SCOPE              = ALL
DESKTOP_JS_TOPOLOGY              = 1 FILE entry (mbo-employee-app.js, size 448,802 bytes, fileKey 202608290651375D3352D45E9440EEBEBC59C344554AA3071)
DESKTOP_CSS_TOPOLOGY             = 1 FILE entry (mbo-employee.css, size 37,996 bytes, fileKey 202608290651373D6CE2A99CF845E78D74F59A1D76047D068)
MOBILE_TOPOLOGY                  = [] (0 entries)
DUPLICATE_MBO_BUNDLE             = NO (Single JS bundle deployed in customization topology)
SOURCE_DECLARATION_RESET_FINDINGS= activeUiInstance is declared at module scope in src/main-mbo-app.js (var activeUiInstance = null) and set during async setupRecordUiWithAuth (activeUiInstance = ui). Overwrite risk if re-initialized; no other reset function exists.
TEST_LIFECYCLE_GAP_FINDINGS     = Unit tests run sequentially in Node.js without browser DOM page unload or native Kintone navigation. In Live Browser, submit.success is an async function: Kintone native form submit triggers immediate page navigation (location.href) upon native save completion; un-awaited microtasks and in-flight fetch('/k/v1/record.json') requests inside finalizeAttachmentPlan get aborted by the browser during page unload (net::ERR_ABORTED).
ROOT_CAUSE_CLASSIFICATION        = D. OTHER — BROWSER PAGE UNLOAD ABORTS ASYNC POST-SAVE REST BINDING / UN-AWAITED SUBMIT.SUCCESS PROMISE IN KINTONE LIVE LIFECYCLE (COMBINED WITH B. ACTIVE_UI_INSTANCE LIFECYCLE/CONTEXT LOSS RISK)
LIVE_KINTONE_READS_ONLY          = YES
LIVE_KINTONE_WRITE               = 0
SOURCE_CHANGED                   = NO
LIVE_DEPLOY_OCCURRED             = NO
MAXIMUM_STATUS                   = DIAGNOSTIC_EVIDENCE_PENDING_INDEPENDENT_REVIEW
```
