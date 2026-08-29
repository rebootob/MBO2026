# D1 ATTACHMENT PERSISTENCE CORRECTIVE EVIDENCE

```text
START_HEAD                   = 63010a394c128b5565f2d9547129e3d9db60f725
CANONICAL_BRANCH             = ai/antigravity-wp002c
CORRECTIVE_DESIGN            = KINTONE-SUPPORTED ATTACHMENT PERSISTENCE LIFECYCLE
FOCUSED_TESTS                = PASS (19/19 attachment & timeline tests passing)
FULL_NPM_TEST                 = PASS (871/871 unit & integration tests passing)
BUILD_ONLY                   = PASS (0 Kintone network calls)
LIVE_KINTONE_WRITE           = 0
LIVE_DEPLOY_OCCURRED         = NO
MAXIMUM_STATUS               = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

## 1. Root Cause & Corrective Architecture Summary

- **Live UAT Defect Corrected:** Native Kintone Save in App 794 previously failed with `event.record['Objective_Attachment_1'].type is invalid`. This occurred because direct `event.record[fieldCode]` mutation destroyed native Kintone field metadata and attempted unsupported Attachment field updates inside submit event objects.
- **Kintone-Supported Lifecycle Implemented:**
  1. **Submit Event (`app.record.create.submit` / `app.record.edit.submit`):**
     - Performs existing local validation (weight totals, required fields, duplicate checks).
     - Uploads pending local files via `uploadKintoneFile` (`POST /k/v1/file.json`) to receive temporary `fileKey`s.
     - **Leaves `event.record` Attachment fields completely untouched/unmutated** (preserving `type: 'FILE'`).
     - Prepares an `attachmentBindingPlan` in memory containing target field codes and their desired fileKey list.
     - Returns `event` cleanly so native Kintone record save completes naturally.
  2. **Submit Success Event (`app.record.create.submit.success` / `app.record.edit.submit.success`):**
     - Receives `event.appId` and `event.recordId`.
     - Finalizes attachment binding using Kintone Update Record REST API (`PUT /k/v1/record.json`).
     - Preserves existing retained files and leaves unrelated attachment fields untouched.
     - Displays explicit, truthful diagnostic notifications if post-save REST binding fails.

## 2. Source Code Ownership & Changes

- [src/services/mbo-attachment-service.js](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/src/services/mbo-attachment-service.js): Implemented `prepareAttachmentPlan` (pre-save file upload + plan construction without mutating `event.record`) and `finalizeAttachmentPlan` (post-save REST PUT `/k/v1/record.json` update).
- [src/ui/employee-part-a-ui.js](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/src/ui/employee-part-a-ui.js): Added `preparePendingAttachments` and `finalizeAttachmentPlan` methods on `EmployeePartAUI`.
- [src/main-mbo-app.js](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/src/main-mbo-app.js): Updated submit handlers to call `preparePendingAttachments` (pre-save) and added `app.record.create.submit.success` / `app.record.edit.submit.success` hooks to call `finalizeAttachmentPlan` (post-save). Maintained strict orchestration-only policy.

## 3. Test & Build Evidence

- **Focused Test Suite (`node tests/timeline-truthfulness-and-attachment.test.js`):** **19/19 PASS (100%)**
  - `TIMELINE_LIVE_NO_DATA_ZERO_FAKE_EVENTS`: PASS
  - `TIMELINE_PREVIEW_FIXTURES_ALLOWED`: PASS
  - `TIMELINE_LIVE_AUTHORITATIVE_EVENTS_ONLY`: PASS
  - `ATTACHMENT_READONLY_ZERO_FILES`: PASS
  - `ATTACHMENT_READONLY_SINGLE_FILE`: PASS
  - `ATTACHMENT_READONLY_MULTIPLE_FILES`: PASS
  - `ATTACHMENT_LIVE_MODE_NO_PREVIEW_MOCK_LEAK`: PASS
  - `ATTACHMENT_PENDING_FILE_STATE`: PASS
  - `ATTACHMENT_REAL_REMOVE_BUTTON_CLICK_EVENT`: PASS
  - `ATTACHMENT_SERVICE_PREPARE_AND_FINALIZE`: PASS
  - `ATTACHMENT_SERVICE_UPLOAD_ERROR_VISIBILITY`: PASS
  - `ATTACHMENT_SELF_FINAL_FALLBACK_REGRESSION`: PASS
  - `CREATE_SUBMIT_ZERO_PENDING_NO_ATTACHMENT_MUTATION`: PASS
  - `EDIT_SUBMIT_ZERO_PENDING_NO_ATTACHMENT_MUTATION`: PASS
  - `CREATE_SUBMIT_PENDING_UPLOAD_PREPARES_PLAN`: PASS
  - `CREATE_SUBMIT_SUCCESS_REST_BIND_EXACT_FIELD`: PASS
  - `EDIT_SUBMIT_SUCCESS_REST_BIND_EXACT_FIELD`: PASS
  - `UPLOAD_FAILURE_PRE_SAVE_FAILS_CLOSED`: PASS
  - `POST_SAVE_BIND_FAILURE_VISIBLE_TRUTHFUL_ERROR`: PASS
- **Repository Full Test Suite (`npm test`):** **871/871 PASS (100%)**
- **Candidate Bundle Build (`npm run ui:build`):** `PASS` (`dist/mbo-employee-app.js` & `dist/mbo-employee.css` generated cleanly)
- **Module-Aware Build-Only Check (`node --env-file=.env.local scripts/kintone/deploy-custom-ui.js --build-only`):** `PASS` (0 Kintone network calls)
- **Live Writes & Deployment:** Zero Live Kintone write performed (`LIVE_KINTONE_WRITE = 0`, `LIVE_DEPLOY_OCCURRED = NO`).
