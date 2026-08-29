# AI ACTIVE TASK — APP794 WP2 R3 REV57 USER UAT

Mode: **CONTROL PLANE HOLD — USER RUNTIME UAT ONLY / NO LIVE WRITE**  
Branch: `ai/antigravity-wp002c`

## Status

```text
DEPLOYED_SOURCE_COMMIT = 9816cef195b6d3ffe039e5fb92c8dc8406c8967a
LIVE_REVISION          = 57
LIVE_JS_IDENTITY       = ac22a56cb9d78001384241fe12745f7a2da3da84
LIVE_CSS_IDENTITY      = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
INDEPENDENT_GIT_REVIEW = PASS
USER_RUNTIME_UAT       = PENDING
```

Deployment authorization `APP794-D1-WP2-R3-DEPLOY-20260829-01` is CONSUMED / CLOSED. It cannot be reused.

## Required User UAT — Rev57

1. **My MBO Home**
   - Must render as structured table, not loose text/card:
     `Fiscal Year | Status | Record Key | Action`
   - Create New MBO remains visible.
   - Open MBO / View History labels and links work.
   - Zero Delete UI.

2. **Back to My MBO**
   - Existing Detail/Edit must show a clearly visible prominent blue Back button/bar:
     `← กลับหน้า My MBO / Back to My MBO`
   - Same-tab navigation to current App794 index.
   - Create screen must not show Back.

3. **Kintone Comment Mirror**
   - Must load native comments successfully.
   - Must render structured read-only table:
     `# | ผู้แสดงความคิดเห็น / Author | วัน-เวลา / Date & Time | ความคิดเห็น / Comment`
   - Refresh remains available.
   - No Reply/Delete/Like/write controls in the mirror.

## Hold

Do NOT:
- perform another Live deploy;
- reuse prior authorization;
- rollback automatically;
- change source/tests/dist;
- write App794 records/schema/layout/ACL/process;
- write Kintone comments;
- write App801/App795/App796;
- execute Copy Previous MBO;
- execute D2-D7.

Next action is user runtime UAT evidence only.

Maximum status until user passes all three items:
`APP794_WP2_R3_REV57_PENDING_USER_UAT`
