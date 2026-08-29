# AI ACTIVE TASK — WP2 LIVE UAT CORRECTIVE (SOURCE / TEST / DIST ONLY)

Mode: **SOURCE / TEST / DIST ONLY — NO LIVE DEPLOY**  
Branch: `ai/antigravity-wp002c`  

## Objectives

Correct 3 Live UAT issues only:
1. **Back to My MBO:** Prominent styled navigation button/bar on Detail/Edit (`mbo-btn-back-home`); absent on Create.
2. **My MBO Home UI:** Card/list presentation enhancements for FY, Status, Record Key, and Open MBO action.
3. **Comment Mirror:** Fixed input parsing (numeric `appId` and `recordId`) to eliminate `CB_VA01: Missing or invalid input` error on Live.

## Candidate Artifacts

```text
CANDIDATE_JS_BLOB_SHA  = fb9c4bdaba3c95ab13963462e5019746ceef3be5
CANDIDATE_CSS_BLOB_SHA = b6f77930256378cbe1e190932103dfecea174fbc
TEST_SUITE_RESULT      = PASS (954 / 954 PASS)
UI_BUILD               = PASS
```

## Current Status

Status: **`WP2_LIVE_UAT_CORRECTIVE_PENDING_INDEPENDENT_REVIEW`**

## Strictly Forbidden

- NO Live deploy
- NO App794 write
- NO schema/form/layout write
- NO ACL/process write
- NO Kintone Comment write
- NO App801/App795/App796 write
- NO protected legacy app write
- NO Copy Previous MBO
- NO D2-D7 execution