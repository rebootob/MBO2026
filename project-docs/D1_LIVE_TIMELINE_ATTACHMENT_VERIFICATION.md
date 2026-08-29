# D1 LIVE TIMELINE TRUTHFULNESS + ATTACHMENT CORRECTIVE VERIFICATION EVIDENCE

```text
START_HEAD                   = 52566ce5ee4ca591167b827d2dc9533b307104e4
CANONICAL_BRANCH             = ai/antigravity-wp002c
NPM_TEST                     = PASS (864/864 unit & integration tests passing)
FOCUSED_TESTS                = PASS (12/12 timeline & attachment tests passing)
BUILD_ONLY                   = PASS (0 Kintone network calls)
LIVE_KINTONE_WRITE           = 0
LIVE_DEPLOY_OCCURRED         = NO
MAXIMUM_STATUS               = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

## Summary of Source Correctives Implemented

1. **Workflow Action Timeline (`src/ui/employee-part-a-ui.js`):**
   - Live mode without `timelineEvents` input displays `0 Events Recorded` and `ยังไม่มีประวัติการดำเนินการ / No workflow history available`.
   - Zero hard-coded sample events (Sompong/Vichai/Returned/Approved/View Comments) are fabricated in Live mode.
   - Preview sample fixtures are permitted ONLY when `isPreviewMode === true`.
   - When authoritative `timelineEvents` are supplied, ONLY real supplied events are rendered.

2. **Attachment Lifecycle & Display (`src/ui/employee-part-a-ui.js`):**
   - Displays `ไม่มีไฟล์แนบ / No attachment` when no files exist in read-only mode.
   - Displays ALL actual filenames from Kintone FILE fields for saved attachments.
   - Displays selected local files immediately with `(รอบันทึก / Pending save)` markers in editable mode.
   - Supports removal of pending or saved attachments cleanly without touching unrelated fields.
   - Live mode ignores preview mock attachment filenames.

3. **Kintone Upload Boundary (`src/services/mbo-attachment-service.js`):**
   - Multipart `POST /k/v1/file.json` via `FormData` with `X-Requested-With: XMLHttpRequest` and `kintone.getRequestToken()`.
   - Captures returned upload `fileKey` and binds to exact requested FILE fields (`Objective_Attachment_n`, `MidYear_Attachment_n`, `Self_Attachment_n` / `Final_Attachment_n`).
   - Fails closed with visible error on upload failures. Zero live network calls in unit test suite.
