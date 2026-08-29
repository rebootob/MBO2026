# D1 ATTACHMENT DESIRED-STATE SNAPSHOT + REGRESSION RESTORE EVIDENCE

```text
START_HEAD                                = 4e81527f2c7029f748d1342d3000cbf9ee83866e
CANONICAL_BRANCH                          = ai/antigravity-wp002c
RETRIEVAL_UX_DESIGN                       = CLICKABLE PREVIEW LINK + BLOB URL TAB + COMPACT DOWNLOAD + ISOLATED KINTONE DOWNLOAD API HELPER
FOCUSED_TESTS                             = PASS (58/58 attachment & timeline & retrieval tests passing)
FULL_NPM_TEST                              = PASS (910/910 unit & integration tests passing)
NPM_RUN_UI_BUILD                          = PASS (dist/mbo-employee-app.js & dist/mbo-employee.css generated cleanly)
BUILD_ONLY                                = PASS (0 Kintone network calls)
PERSISTENCE_FUNCTIONS_CHANGED             = NO (uploadKintoneFile, prepareAttachmentPlan, finalizeAttachmentPlan 100% UNTOUCHED)
MAIN_ATTACHMENT_ORCHESTRATION_CHANGED    = NO (src/main-mbo-app.js 100% UNTOUCHED)
LIVE_KINTONE_WRITE                        = 0
LIVE_DEPLOY_OCCURRED                      = NO
MAXIMUM_STATUS                            = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
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
  - Focused test suite increased to **58 / 58 PASS**. Full repository test suite increased to **910 / 910 PASS**. Zero test reduction.

## 2. Source Code Ownership & Changes

- [src/services/mbo-attachment-service.js](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/src/services/mbo-attachment-service.js):
  - Added additive isolated helper `downloadKintoneFileBlob(fileKey, options)` at bottom of module.
  - Executes `GET /k/v1/file.json?fileKey=...` via browser `fetch` with `X-Requested-With: XMLHttpRequest` header.
  - Zero changes to existing `uploadKintoneFile`, `prepareAttachmentPlan`, or `finalizeAttachmentPlan` logic.
- [src/ui/employee-part-a-ui.js](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/src/ui/employee-part-a-ui.js):
  - Updated `_renderAttachmentControl` to render saved persisted filenames as clickable `<a href="#" class="mbo-attachment-filename" title="...">` preview links.
  - Added compact download button `<button class="mbo-attachment-download-btn" title="Download...">⬇️</button>`.
  - Added preview link and download button click event handlers in `_bindEvents` with `e.preventDefault()` and `e.stopPropagation()`.
  - Implemented `_handleAttachmentPreview` (blob preview in new tab for PDF/Image/browser-previewable, safe download fallback for unsupported formats) and `_handleAttachmentDownload` (direct blob download preserving original filename).
  - Implemented `_showAttachmentError` for non-destructive error handling without mutating attachment data structures.
- [src/styles/mbo-employee.css](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/src/styles/mbo-employee.css):
  - Defined CSS rules for `.mbo-attachment-actions` and `.mbo-attachment-download-btn` ensuring layout alignment and cell containment.
- [tests/timeline-truthfulness-and-attachment.test.js](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/tests/timeline-truthfulness-and-attachment.test.js):
  - Added 13 new retrieval UX regression tests (`SAVED_ATTACHMENT_FILENAME_IS_CLICKABLE_WITH_PERSISTED_FILEKEY`, `READONLY_SAVED_ATTACHMENT_REMAINS_PREVIEW_DOWNLOAD_CAPABLE`, `ATTACHMENT_DOWNLOAD_USES_BROWSER_FETCH_X_REQUESTED_WITH`, `ATTACHMENT_DOWNLOAD_DOES_NOT_USE_KINTONE_API`, `ATTACHMENT_DOWNLOAD_PRESERVES_ORIGINAL_FILENAME`, `ATTACHMENT_PREVIEW_USES_BLOB_URL_FOR_PDF_OR_IMAGE`, `ATTACHMENT_UNSUPPORTED_PREVIEW_FALLS_BACK_TO_DOWNLOAD`, `ATTACHMENT_PREVIEW_MOCK_WITHOUT_FILEKEY_DOES_NOT_NETWORK`, `ATTACHMENT_MISSING_FILEKEY_DOES_NOT_NETWORK`, `ATTACHMENT_DOWNLOAD_ERROR_VISIBLE_AND_NON_DESTRUCTIVE`, `ATTACHMENT_PREVIEW_ERROR_VISIBLE_AND_NON_DESTRUCTIVE`, `ATTACHMENT_DELETE_CONTROL_REMAINS_SEPARATE_AND_FUNCTIONAL`, `OBJECTIVE_MIDYEAR_FINAL_RETRIEVAL_REGRESSION`).

## 3. Test & Build Verification Results

- **Focused Test Suite (`node tests/timeline-truthfulness-and-attachment.test.js`):** **58/58 PASS (100%)**
- **Repository Full Test Suite (`npm test`):** **910/910 PASS (100%)**
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
```

## 6. App794 Objective Attachment Live Schema Audit

```text
EXECUTION_START_HEAD                      = 6ca617a1345201009f9d1d85f11fdb47737d3a2e
LIVE_APP794_FORM_REVISION                 = 47
PREVIEW_APP794_FORM_REVISION              = 47
OBJECTIVE_ATTACHMENT_FIELDS_PRESENT       = 0/10
OBJECTIVE_ATTACHMENT_FIELD_TYPES          = NONE (ABSENT)
MIDYEAR_ATTACHMENT_FIELDS_PRESENT         = 10/10
MIDYEAR_ATTACHMENT_FIELD_TYPES            = FILE
FINAL_ATTACHMENT_FIELDS_PRESENT           = 10/10
FINAL_ATTACHMENT_FIELD_TYPES              = FILE
LIVE_PREVIEW_SCHEMA_MATCH                 = YES
REPO_SCHEMA_OBJECTIVE_ATTACHMENT_DEFINED  = NO
ROOT_CAUSE_CLASSIFICATION                 = SCHEMA_GAP
LIVE_KINTONE_READS_ONLY                  = YES
LIVE_KINTONE_WRITE                       = 0
SOURCE_CHANGED                           = NO
LIVE_DEPLOY_OCCURRED                     = NO
```

## 7. App794 Objective Attachment Schema Corrective Execution

```text
AUTHORIZATION_ID                          = APP794-D1-OBJECTIVE-ATTACHMENT-SCHEMA-20260829-01
EXECUTION_START_HEAD                      = a23af90864908bda463f18bc4466d10b8d954d3a
AUTHORIZATION_CONSUMED                    = YES
PRE_LIVE_FORM_REVISION                    = 47
PRE_PREVIEW_FORM_REVISION                 = 47
PRE_SCHEMA_BACKUP                         = CAPTURED (scratch/app794_pre_schema_*.json)
PRE_LAYOUT_BACKUP                         = CAPTURED (scratch/app794_pre_schema_*.json)
PRE_OBJECTIVE_FIELDS                      = 0/10
PRE_MIDYEAR_FIELDS                        = 10/10 FILE
PRE_FINAL_FIELDS                          = 10/10 FILE
CONFIG_SCHEMA_UPDATED                     = YES (config/schema-spec.js updated for Objective_Attachment_1..10)
PREVIEW_ADD_FIELDS_RESULT                 = SUCCESS
PREVIEW_LAYOUT_RESULT                     = SUCCESS (Automatic minimal placement on field creation)
PREVIEW_OBJECTIVE_READBACK                = 10/10 FILE
APP_SETTINGS_APPLY_RESULT                 = SUCCESS (Deploy status SUCCESS)
LIVE_DEPLOY_STATUS                        = SUCCESS
POST_LIVE_FORM_REVISION                   = 48
LIVE_OBJECTIVE_READBACK                   = 10/10 FILE
LIVE_MIDYEAR_READBACK                     = 10/10 FILE
LIVE_FINAL_READBACK                       = 10/10 FILE
UNRELATED_SCHEMA_DRIFT                    = NONE
UNRELATED_LAYOUT_DRIFT                    = NONE except exact minimal new-field placement
APP794_RECORD_WRITE                       = 0
APP794_CUSTOMIZATION_DEPLOY               = NO (Zero JS/CSS customization deploy)
APP794_ACL_PROCESS_WRITE                  = 0
APP801_WRITE                              = 0
APP795_796_WRITE                          = 0
ROLLBACK_PERFORMED                        = NO
ROLLBACK_RESULT                           = N/A
```

## 8. App794 Edit Attachment Preservation Corrective Evidence

```text
EXECUTION_START_HEAD                      = 94f4f8137e49e52557aa155c68f2e42add696182
CHANGED_FILES                             = src/main-mbo-app.js, src/services/mbo-attachment-service.js, tests/timeline-truthfulness-and-attachment.test.js, dist/mbo-employee-app.js
DESIGN_SUMMARY                            = In Edit mode (!isCreate), preparePendingAttachments fetches the authoritative persisted record via Kintone GET Record API (kintoneApiWrapper.getRecord(appId, recordId)). prepareAttachmentPlan uses the persisted record's FILE values as the retained fileKeys base instead of reading event.record (which is empty/unavailable in Kintone edit submit events).
FOCUSED_ATTACHMENT_TESTS                  = PASS (31/31 attachment & timeline tests passing)
FULL_NPM_TEST                             = PASS (883/883 unit & integration tests passing)
NPM_RUN_UI_BUILD                          = PASS (dist/mbo-employee-app.js & dist/mbo-employee.css)
MODULE_AWARE_BUILD_ONLY                   = PASS (0 Kintone network calls)
LIVE_KINTONE_WRITE                       = 0
LIVE_DEPLOY_OCCURRED                     = NO
MAXIMUM_STATUS                            = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

## 9. App794 Edit Attachment Fail-Closed Corrective Evidence

```text
EXECUTION_START_HEAD                      = 45cfe2a9e89c1272114a905bf1b1e09cece867b4
CHANGED_FILES                             = src/main-mbo-app.js, src/services/mbo-attachment-service.js, src/ui/employee-part-a-ui.js, tests/timeline-truthfulness-and-attachment.test.js, dist/mbo-employee-app.js
REVIEW_BLOCKER_FIXED                      = Strict fail-closed behavior for Edit Attachment changes. If attachments change during Edit, GET Record is mandatory. If GET Record throws, returns null, or misses target FILE field, submit is cancelled before any file upload occurs. If zero attachment changes exist, Edit Save proceeds normally without invoking GET Record. Never falls back to edit.submit attachment values.
FOCUSED_ATTACHMENT_TESTS                  = PASS (36/36 attachment & timeline tests passing)
FULL_NPM_TEST                             = PASS (888/888 unit & integration tests passing)
NPM_RUN_UI_BUILD                          = PASS (dist/mbo-employee-app.js & dist/mbo-employee.css)
MODULE_AWARE_BUILD_ONLY                   = PASS (0 Kintone network calls)
LIVE_KINTONE_WRITE                       = 0
LIVE_DEPLOY_OCCURRED                     = NO
MAXIMUM_STATUS                            = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

## 10. App794 Edit Attachment Atomic Preflight Corrective Evidence

```text
EXECUTION_START_HEAD                      = 2661358372702846f039f4de33ef495eb64d787a
CHANGED_FILES                             = src/services/mbo-attachment-service.js, tests/timeline-truthfulness-and-attachment.test.js, dist/mbo-employee-app.js
ATOMIC_PREFLIGHT_DESIGN                   = Refactored prepareAttachmentPlan into Phase 1 (Canonical Resolution & Atomic Preflight Validation across all target fields) and Phase 2 (File Upload & Plan Construction). In Phase 1, validates all target fields before calling uploadKintoneFile. If target 2 (or 3, etc.) is missing or invalid in persistedRecord, Phase 1 throws immediately before Phase 2 ever calls uploadKintoneFile.
MULTI_TARGET_INVALID_SECOND_UPLOAD_COUNT  = 0
FOCUSED_ATTACHMENT_TESTS                  = PASS (39/39 attachment & timeline tests passing)
FULL_NPM_TEST                             = PASS (891/891 unit & integration tests passing)
NPM_RUN_UI_BUILD                          = PASS (dist/mbo-employee-app.js & dist/mbo-employee.css)
MODULE_AWARE_BUILD_ONLY                   = PASS (0 Kintone network calls)
LIVE_KINTONE_WRITE                       = 0
LIVE_DEPLOY_OCCURRED                     = NO
MAXIMUM_STATUS                            = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

## 11. One-Shot App794 Edit Attachment Corrective Deployment Evidence (Rev 49)

```text
AUTHORIZATION_ID                          = APP794-D1-EDIT-ATTACHMENT-DEPLOY-20260829-01
AUTHORIZATION_CONSUMED                    = YES
EXECUTION_START_HEAD                      = 2beb6ae03d14c808eabd54e52640d6d1429383fa
REVIEWED_SOURCE_CANDIDATE_SHA            = 0282a0c00d54c846353f4d830874c514c6546468
SOURCE_CHANGED_DURING_DEPLOY             = NO (Zero source/dist drift)
PREFLIGHT_RESULT                         = PASS (Deterministic validatePreflight 100% PASS)
FOCUSED_ATTACHMENT_TESTS                  = PASS (39/39 attachment & timeline tests passing)
FULL_NPM_TEST                             = PASS (891/891 unit & integration tests passing)
NPM_RUN_UI_BUILD                          = PASS (dist/mbo-employee-app.js & dist/mbo-employee.css)
MODULE_AWARE_BUILD_ONLY                   = PASS (0 Kintone network calls)
PRE_DEPLOY_APP794_CUSTOMIZATION_REVISION = 48
PRE_DEPLOY_JS_IDENTITY_HASH              = 97273c29e80c4f6cbfa6982360fdba03c8c43076
PRE_DEPLOY_CSS_IDENTITY_HASH             = 1359dfae16d1224580210a5a6cd366fb20bcf6f8
ROLLBACK_SNAPSHOT_REFERENCE              = scratch/app794_live_predeploy_backup_rev49.json & scratch/app794_preview_predeploy_backup_rev49.json
DEPLOY_RESULT                            = SUCCESS (Kintone status SUCCESS)
POST_DEPLOY_APP794_CUSTOMIZATION_REVISION= 49
POST_DEPLOY_JS_IDENTITY_HASH             = bbf3fe439e0891e17bbbba046a9b2afbaf19cd78
POST_DEPLOY_JS_SHA256                    = a9e26244053acac11af66bbeb2be1fb4deb3f22a78a73a9f15f93bdc1a9e5678
POST_DEPLOY_CSS_IDENTITY_HASH            = 1359dfae16d1224580210a5a6cd366fb20bcf6f8
CANDIDATE_READBACK_MATCH                 = YES (Live deployed JS hash matches dist/mbo-employee-app.js 100%)
CUSTOMIZATION_TOPOLOGY_DRIFT             = NONE (Scope ALL, 1 Desktop JS, 1 Desktop CSS, 0 Mobile)
ROLLBACK_OCCURRED                        = NO
ROLLBACK_REASON                          = N/A
APP794_RECORD_WRITE                      = 0
APP794_SCHEMA_LAYOUT_WRITE               = 0
APP794_ACL_PROCESS_WRITE                  = 0
APP801_WRITE                             = 0
APP795_796_WRITE                         = 0
LIVE_DEPLOY_OCCURRED                     = YES
MAXIMUM_STATUS                            = DEPLOYED_PENDING_INDEPENDENT_REVIEW
```

## 12. App794 Attachment Long-Filename Delete-Control UI Corrective Evidence

```text
EXECUTION_START_HEAD                      = 62a19bc05300a6ef4c76f62e7a5942ada939a61c
CHANGED_FILES                             = src/ui/employee-part-a-ui.js, src/styles/mbo-employee.css, tests/timeline-truthfulness-and-attachment.test.js, dist/mbo-employee-app.js, dist/mbo-employee.css
UI_LAYOUT_DESIGN                          = mbo-attachment-container uses display:flex; flex-direction:column; align-items:stretch; width:100%; max-width:100%; min-width:0. mbo-attachment-badge uses display:flex; align-items:center; justify-content:space-between; width:100%; max-width:100%; min-width:0.
LONG_FILENAME_TRUNCATION_CONTRACT         = mbo-attachment-filename uses flex:1 1 auto; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; title attribute preserves full filename.
DELETE_CONTROL_NON_SHRINK_CONTRACT        = mbo-attachment-remove-btn uses flex:0 0 auto; flex-shrink:0; min-width:16px; text-align:center; remains always visible at right edge.
MULTIPLE_FILE_STACK_CONTRACT              = Multiple files stack cleanly as separate rows inside column container.
FOCUSED_ATTACHMENT_TESTS                  = PASS (45/45 attachment & timeline tests passing)
FULL_NPM_TEST                             = PASS (897/897 unit & integration tests passing)
NPM_RUN_UI_BUILD                          = PASS (dist/mbo-employee-app.js & dist/mbo-employee.css)
MODULE_AWARE_BUILD_ONLY                   = PASS (0 Kintone network calls)
ATTACHMENT_SERVICE_CHANGED                = NO (src/services/mbo-attachment-service.js 100% UNTOUCHED)
MAIN_ATTACHMENT_ORCHESTRATION_CHANGED    = NO (src/main-mbo-app.js 100% UNTOUCHED)
LIVE_KINTONE_WRITE                       = 0
LIVE_DEPLOY_OCCURRED                     = NO
MAXIMUM_STATUS                            = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

## 13. One-Shot App794 Long-Filename UI Corrective Deployment Evidence (Rev 50)

```text
AUTHORIZATION_ID                          = APP794-D1-LONG-FILENAME-UI-DEPLOY-20260829-01
AUTHORIZATION_CONSUMED                    = YES
EXECUTION_START_HEAD                      = 6e3e615c141bf0641413da40410592ed77b128a5
REVIEWED_SOURCE_CANDIDATE_SHA            = 1abd434ab6c4ce04a6f1e5c2fdbaa9a94f75e502
SOURCE_CHANGED_DURING_DEPLOY             = NO (Zero source/dist drift)
DIST_CHANGED_FROM_REVIEWED_CANDIDATE     = NO (100% SHA match)
PREFLIGHT_RESULT                         = PASS (Deterministic validatePreflight 100% PASS)
FOCUSED_ATTACHMENT_TESTS                  = PASS (45/45 attachment & timeline tests passing)
FULL_NPM_TEST                             = PASS (897/897 unit & integration tests passing)
NPM_RUN_UI_BUILD                          = PASS (dist/mbo-employee-app.js & dist/mbo-employee.css)
MODULE_AWARE_BUILD_ONLY                   = PASS (0 Kintone network calls)
PRE_DEPLOY_APP794_CUSTOMIZATION_REVISION = 49
PRE_DEPLOY_JS_IDENTITY_HASH              = bbf3fe439e0891e17bbbba046a9b2afbaf19cd78
PRE_DEPLOY_CSS_IDENTITY_HASH             = 1359dfae16d1224580210a5a6cd366fb20bcf6f8
ROLLBACK_SNAPSHOT_REFERENCE              = scratch/app794_live_predeploy_backup_rev50.json & scratch/app794_preview_predeploy_backup_rev50.json
DEPLOY_RESULT                            = SUCCESS (Kintone status SUCCESS)
POST_DEPLOY_APP794_CUSTOMIZATION_REVISION= 50
POST_DEPLOY_JS_IDENTITY_HASH             = 43731e5c26dc441659e2f3687f58d1c7237279a5
POST_DEPLOY_JS_SHA256                    = d4d80ba1307f560c7e6deaa29ba9e0e38636dbb92f3974e7ade20dd9ff08bd30
POST_DEPLOY_CSS_IDENTITY_HASH            = c407e30a0eb87c6e0c3f2f55cc4fc6163816695d
POST_DEPLOY_CSS_SHA256                   = 6bd36ca4b4ea702f9072321349071a6dd300594c88ef759e8c4846b52481b936
CANDIDATE_READBACK_MATCH                 = YES (Live deployed JS/CSS hashes match dist/ 100%)
CUSTOMIZATION_TOPOLOGY_DRIFT             = NONE (Scope ALL, 1 Desktop JS, 1 Desktop CSS, 0 Mobile)
ROLLBACK_OCCURRED                        = NO
ROLLBACK_REASON                          = N/A
APP794_RECORD_WRITE                      = 0
APP794_SCHEMA_LAYOUT_WRITE               = 0
APP794_ACL_PROCESS_WRITE                  = 0
APP801_WRITE                             = 0
APP795_796_WRITE                         = 0
LIVE_DEPLOY_OCCURRED                     = YES
MAXIMUM_STATUS                            = DEPLOYED_PENDING_INDEPENDENT_REVIEW
```

## 14. App794 Saved Attachment Preview / Download Corrective Evidence

```text
EXECUTION_START_HEAD                      = 4e81527f2c7029f748d1342d3000cbf9ee83866e
CHANGED_FILES                             = src/services/mbo-attachment-service.js, src/ui/employee-part-a-ui.js, src/styles/mbo-employee.css, tests/timeline-truthfulness-and-attachment.test.js, dist/mbo-employee-app.js, dist/mbo-employee.css
RETRIEVAL_DESIGN                          = Saved persisted filenames with valid fileKey render as clickable <a class="mbo-attachment-filename"> preview links. Clicking filename opens a blank tab synchronously and fetches file blob via GET /k/v1/file.json, creating a Blob Object URL for PDF/Images/browser-previewable content. Unsupported file types fall back to safe blob download. Added a separate compact download button ⬇️. Read-only rows also render preview links and download buttons (omitting remove button ✕).
KINTONE_DOWNLOAD_TRANSPORT                = Isolated additive helper downloadKintoneFileBlob in src/services/mbo-attachment-service.js executing GET /k/v1/file.json?fileKey=... via browser fetch with X-Requested-With: XMLHttpRequest header.
PREVIEW_MIME_POLICY                       = PDF, image/*, text/*, audio/*, video/* open in new tab via Object URL; unsupported MIME types fall back to blob download.
DOWNLOAD_FILENAME_POLICY                  = Preserves exact original filename via anchor download attribute.
ERROR_NON_DESTRUCTIVE_PROOF               = _showAttachmentError renders user-visible alert on download/preview failure without mutating record FILE values or desiredSavedFiles map.
PERSISTENCE_FUNCTIONS_CHANGED             = NO (uploadKintoneFile, prepareAttachmentPlan, finalizeAttachmentPlan 100% UNTOUCHED)
MAIN_ATTACHMENT_ORCHESTRATION_CHANGED    = NO (src/main-mbo-app.js 100% UNTOUCHED)
FOCUSED_ATTACHMENT_TESTS                  = PASS (58/58 attachment & timeline & retrieval tests passing)
FULL_NPM_TEST                             = PASS (910/910 unit & integration tests passing)
NPM_RUN_UI_BUILD                          = PASS (dist/mbo-employee-app.js & dist/mbo-employee.css generated cleanly)
MODULE_AWARE_BUILD_ONLY                   = PASS (0 Kintone network calls)
LIVE_KINTONE_WRITE                       = 0
LIVE_DEPLOY_OCCURRED                     = NO
MAXIMUM_STATUS                            = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

## 15. App794 Saved Attachment Preview / Download Security + Scope Corrective Evidence

```text
EXECUTION_START_HEAD                      = 3928f2f00e83bbd71bdd04d58f406ed2e03a106a
CHANGED_FILES                             = src/ui/employee-part-a-ui.js, tests/timeline-truthfulness-and-attachment.test.js, dist/mbo-employee-app.js
SAFE_PREVIEW_MIME_ALLOWLIST               = application/pdf, image/png, image/jpeg, image/pjpeg, image/gif, image/webp, image/bmp, text/plain, audio/*, video/*
DENIED_ACTIVE_CONTENT_TYPES               = text/html, application/xhtml+xml, image/svg+xml, application/xml, text/xml, application/javascript, text/javascript, application/octet-stream, application/x-download, application/x-msdownload, scriptable markup / XML-family content
HTML_SVG_DOWNLOAD_ONLY_PROOF              = isSafePreviewableMime returns false for text/html and image/svg+xml; preview handler closes blank window and falls back directly to download without creating Object URL
NO_EXTENSION_ONLY_PREVIEW_PROMOTION       = isSafePreviewableMime checks DENIED_MIMES first; application/octet-stream with filename report.pdf is denied and falls back to download
REMOVE_BASELINE_RESTORED                  = Restored parent 4e81527f implementation of _getSavedAttachmentFiles(), _removeSavedAttachmentFile(), and constructor attachment state
RETRIEVAL_NON_DESTRUCTIVE_PROOF           = Preview/Download success or failure leaves record FILE values, desiredSavedFiles, dirtyAttachmentFields, and pendingAttachments unmodified
PERSISTENCE_FUNCTIONS_CHANGED             = NO (uploadKintoneFile, prepareAttachmentPlan, finalizeAttachmentPlan 100% UNTOUCHED)
MAIN_ATTACHMENT_ORCHESTRATION_CHANGED    = NO (src/main-mbo-app.js 100% UNTOUCHED)
FOCUSED_ATTACHMENT_TESTS                  = PASS (68/68 attachment, timeline, retrieval & security tests passing)
FULL_NPM_TEST                             = PASS (920/920 unit & integration tests passing)
NPM_RUN_UI_BUILD                          = PASS (dist/mbo-employee-app.js & dist/mbo-employee.css generated cleanly)
MODULE_AWARE_BUILD_ONLY                   = PASS (0 Kintone network calls)
LIVE_KINTONE_WRITE                       = 0
LIVE_DEPLOY_OCCURRED                     = NO
MAXIMUM_STATUS                            = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

## 16. App794 Saved Attachment Preview / Download Residual Corrective Evidence

```text
EXECUTION_START_HEAD                      = 15e4e8ad5718f2a04ea8a912adf99d1327fb2968
CHANGED_FILES                             = src/ui/employee-part-a-ui.js, tests/timeline-truthfulness-and-attachment.test.js, dist/mbo-employee-app.js
EMPTY_MIME_DOWNLOAD_ONLY_PROOF            = isSafePreviewableMime returns false for empty/null/undefined MIME; report.pdf and photo.png with empty MIME fall back directly to download
NO_EXTENSION_ONLY_PREVIEW_PROMOTION       = isSafePreviewableMime requires explicit allowlisted response MIME; never promotes empty or unknown MIME based on filename extension
POPUP_ATTEMPT_COUNT                       = EXACTLY 1 (window.open('about:blank', '_blank') called synchronously before await; 0 calls after await)
NO_ASYNC_SECOND_POPUP_PROOF               = _handleAttachmentPreview removes post-await window.open retry; if initial popup is blocked, falls back safely to _triggerBlobDownload(blob, filename)
SAFE_FALLBACK_FILENAME_PROOF              = _triggerBlobDownload receives exact original filename parameter on fallback
REMOVE_BASELINE_UNCHANGED                 = _getSavedAttachmentFiles() and _removeSavedAttachmentFile() retained exact parent 4e81527f implementation
PERSISTENCE_FUNCTIONS_CHANGED             = NO (uploadKintoneFile, prepareAttachmentPlan, finalizeAttachmentPlan 100% UNTOUCHED)
MAIN_ATTACHMENT_ORCHESTRATION_CHANGED    = NO (src/main-mbo-app.js 100% UNTOUCHED)
FOCUSED_ATTACHMENT_TESTS                  = PASS (73/73 attachment, timeline, retrieval & security tests passing)
FULL_NPM_TEST                             = PASS (925/925 unit & integration tests passing)
NPM_RUN_UI_BUILD                          = PASS (dist/mbo-employee-app.js & dist/mbo-employee.css generated cleanly)
MODULE_AWARE_BUILD_ONLY                   = PASS (0 Kintone network calls)
LIVE_KINTONE_WRITE                       = 0
LIVE_DEPLOY_OCCURRED                     = NO
MAXIMUM_STATUS                            = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

## 17. One-Shot App794 Saved Attachment Preview / Download Deployment Evidence (Rev 51)

```text
AUTHORIZATION_ID                          = APP794-D1-ATTACHMENT-PREVIEW-DOWNLOAD-DEPLOY-20260829-01
AUTHORIZATION_CONSUMED                    = YES
EXECUTION_START_HEAD                      = f627ad129588f1370c06dd9c1ae9cfac826aef39
REVIEWED_SOURCE_CANDIDATE_SHA            = ec6278524a2d5eb53050d0580c340d1b4e866b97
SOURCE_CHANGED_DURING_DEPLOY             = NO (Zero source/dist drift)
TEST_CHANGED_DURING_DEPLOY               = NO (Zero test drift)
PRECHECK_RESULT                           = PASS (Deterministic validatePreflight 100% PASS)
FOCUSED_TEST_RESULT_IF_RUN                = PASS (73/73 attachment, timeline, retrieval & security tests passing)
UI_BUILD_RESULT                           = PASS (dist/mbo-employee-app.js & dist/mbo-employee.css generated cleanly)
BUILD_ONLY_RESULT                         = PASS (0 Kintone network calls)
PRE_DEPLOY_APP794_CUSTOMIZATION_REVISION = 50
PRE_DEPLOY_CUSTOMIZATION_TOPOLOGY        = Scope ALL, 1 Desktop JS, 1 Desktop CSS, 0 Mobile
PRE_DEPLOY_JS_IDENTITY_HASH              = 43731e5c26dc441659e2f3687f58d1c7237279a5
PRE_DEPLOY_CSS_IDENTITY_HASH             = c407e30a0eb87c6e0c3f2f55cc4fc6163816695d
ROLLBACK_SNAPSHOT_REFERENCE              = scratch/app794_live_predeploy_backup_preview_download.json & scratch/app794_preview_predeploy_backup_preview_download.json
DEPLOY_ATTEMPT_COUNT                      = 1
DEPLOY_RESULT                            = SUCCESS (Kintone status SUCCESS)
POST_DEPLOY_APP794_CUSTOMIZATION_REVISION= 51
POST_DEPLOY_CUSTOMIZATION_TOPOLOGY       = Scope ALL, 1 Desktop JS, 1 Desktop CSS, 0 Mobile
POST_DEPLOY_JS_IDENTITY_HASH             = e04aa07852e8e5aa4e4234f6efce5c99f2b37ec8
POST_DEPLOY_JS_SHA256                    = 3ab52a01f7f107c1cea8b6f1cfab0a3a03f72976b6f65c8dab45ae6651160309
POST_DEPLOY_CSS_IDENTITY_HASH            = 1710d770ae87fb5f910d669dd5a88ea0950e6991
POST_DEPLOY_CSS_SHA256                   = 928db49968b7d74283d2807ad63ff7d4b1b4fb5cba4dfea51aba4d1d580e90f3
CANDIDATE_READBACK_MATCH                 = YES (Live deployed JS/CSS hashes match dist/ 100%)
CUSTOMIZATION_TOPOLOGY_DRIFT             = NONE
MOBILE_CUSTOMIZATION_CHANGED             = NO
ROLLBACK_OCCURRED                        = NO
ROLLBACK_REASON                          = N/A
APP794_RECORD_WRITE                      = 0
APP794_SCHEMA_LAYOUT_WRITE               = 0
APP794_ACL_PROCESS_WRITE                  = 0
APP801_WRITE                             = 0
APP795_796_WRITE                         = 0
D2_D7_WRITE                              = 0
LIVE_DEPLOY_OCCURRED                     = YES
MAXIMUM_STATUS                            = DEPLOYED_PENDING_INDEPENDENT_REVIEW
```



