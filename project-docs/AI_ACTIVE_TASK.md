# AI ACTIVE TASK — WP2 R3 RUNTIME UI DIAGNOSTIC + CORRECTIVE

Mode: **RUNTIME DIAGNOSTIC FIRST / SOURCE-TEST-DIST CORRECTIVE ONLY — NO LIVE DEPLOY**  
Branch: `ai/antigravity-wp002c`

## Current Live Truth

```text
LIVE_APP794_REVISION        = 56
DEPLOYED_SOURCE_COMMIT      = cab6db3c3f917138abc45c5218a3a5a0d3f7d0d3
LIVE_JS_IDENTITY            = 79787f75a1edf0721d7d6ac71216a1366599f3e0
LIVE_CSS_IDENTITY           = b6f77930256378cbe1e190932103dfecea174fbc
TECHNICAL_READBACK          = PASS
USER_RUNTIME_UAT            = FAIL
LIVE_DEPLOY_AUTH            = NONE
```

Prior deployment authorization is CONSUMED/CLOSED and cannot be reused.

## User UAT Result

### 1. My MBO Home — FAIL
Data/query/actions work, but Live visual presentation remains flat/loose-text rather than a clearly structured table/card UI.

### 2. Back to My MBO — FAIL
User reports the Back button is not visibly present/accepted in Live Detail runtime.

### 3. Comment Mirror — DATA PASS / PRESENTATION FAIL
Native Kintone comments now load correctly. The `limit=10` API corrective worked. Current rendering is plain stacked text and does not match the user's supplied compact structured reference.

## R3 Gate A — Runtime DOM / Computed Style Diagnosis FIRST

Do not make speculative CSS tweaks before runtime evidence is captured.

Required user/runtime probes:

### My MBO index
Inspect:
- `.mbo-record-card-list`
- `.mbo-record-card`
- `.mbo-record-fy`
- `.mbo-card-action-btn`

Capture:
```text
MY_MBO_CARD_LIST_EXISTS
MY_MBO_CARD_EXISTS
MY_MBO_CARD_LIST_COMPUTED_DISPLAY
MY_MBO_CARD_COMPUTED_PADDING
MY_MBO_CARD_COMPUTED_BORDER_TOP
MY_MBO_FY_COMPUTED_BACKGROUND
MY_MBO_ACTION_COMPUTED_BACKGROUND
```

Expected from current CSS if stylesheet is truly applied:
- card list display = grid
- card padding approximately 18px
- card top border visible/blue
- FY background non-transparent blue tint
- Open MBO action blue background

### Existing Detail/Edit
Inspect:
- `.mbo-root`
- `[data-mbo-back-link]` / `.mbo-btn-back-home`
- `.mbo-native-comment-mirror`

Capture:
```text
MBO_ROOT_EXISTS
BACK_ELEMENT_EXISTS
BACK_TEXT
BACK_COMPUTED_DISPLAY
BACK_COMPUTED_BACKGROUND
COMMENT_MIRROR_EXISTS
COMMENT_COMPUTED_PADDING
COMMENT_COMPUTED_BORDER
```

Diagnosis rules:
- Element exists but expected computed CSS absent => investigate runtime stylesheet load/application, cascade, media rules, parse errors, or Kintone customization runtime behavior. Do not redesign selectors blindly.
- Back element absent => investigate actual main-mbo-app -> EmployeePartAUI render path and root lifecycle.
- Expected computed CSS present but UX still rejected => redesign layout only after preserving behavior/security.

## R3 Gate B — Corrective Scope After Diagnosis

Only these three UI areas may change:

1. `src/ui/employee-self-index-ui.js`
   - preserve exact Employee_Code query and Fiscal_Year desc semantics;
   - preserve Create/Open/View History URLs/status semantics;
   - zero Delete;
   - redesign My MBO as a clearly structured responsive table/card presentation accepted by user.

2. `src/ui/employee-record-navigation.js` and minimal `employee-part-a-ui.js` wiring only if runtime evidence proves needed
   - Detail/Edit visible prominent Back;
   - Create absent;
   - same-tab `/k/{currentAppId}/`;
   - no auth/session mutation;
   - no record/workflow write.

3. `src/ui/employee-comment-mirror.js`
   - preserve successful GET contract: `/k/v1/record/comments.json`, `limit=10`, truthful pagination, Refresh, Create GET=0, safe text, comment writes=0;
   - redesign presentation to match user reference: compact bilingual header/read-only notice/Refresh, structured comment rows or table/card, aligned visually with Workflow Action Timeline;
   - do NOT regress working comment data loading.

4. `src/styles/mbo-employee.css`
   - fix actual runtime style application issue if proven;
   - otherwise redesign only the three WP2 sections;
   - single stylesheet; no unrelated broad refactor.

## Mandatory Tests

- My MBO exact query/status/link/security regressions.
- DOM class-hook tests for card/table structure.
- Back actual main-mbo-app runtime integration: detail/edit visible, create absent.
- Comment direct globalThis.kintone.api request contract: limit=10.
- Comment Refresh + pagination + safe text + zero writes + Create GET=0.
- Add structural presentation tests for the new Comment layout.
- Attachment/Auth regression.
- Full `npm test`.
- `npm run ui:build`.
- deterministic clean rebuild / exact JS+CSS identities.
- hardened build-only network calls = 0.

## Strictly Forbidden

- NO Live deploy.
- NO App794 business-record write.
- NO form/schema/layout/ACL/process write.
- NO Kintone Comment POST/DELETE/reply.
- NO App801/App795/App796 writes.
- NO protected legacy writes.
- NO auth/session semantic changes.
- NO attachment/routing/scoring changes.
- NO Copy Previous MBO.
- NO D2-D7 execution.
- NO unrelated refactor.

## Completion

Commit + push source/tests/dist/evidence only after R3 diagnosis and corrective are complete.

Maximum status:
`WP2_R3_CORRECTED_CANDIDATE_PENDING_INDEPENDENT_REVIEW`
