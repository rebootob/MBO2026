# AI ACTIVE TASK — D1 PREVIEW FILEKEY PRESERVATION CORRECTIVE

> Read `project-docs/AI_CONTROL_CENTER.md` FIRST.  
> Execution Plane: Antigravity  
> Branch: `ai/antigravity-wp002c`  
> Mode: **SOURCE / TEST ONLY — NO LIVE KINTONE WRITE**

## 0. Review State

Corrective commit under review:

```text
5044eb47f0302327e6bc180d504f72132f6a0fbe
```

The bundle inclusion, modular-source guard, Employee Code format correction, and CSS Git preservation are provisionally accepted.

**Do not redo those corrections.**

One blocking defect remains in the future deploy implementation: retained FILE keys for a Preview customization PUT are currently taken from Production/effective customization instead of Preview/Test customization.

## 1. Read Only These Inputs

1. `project-docs/AI_CONTROL_CENTER.md`
2. this `project-docs/AI_ACTIVE_TASK.md`
3. `project-docs/CONFIRMED_BASELINE/AI_OPERATING_GOVERNANCE.md` — Source-Code Modularity section
4. `scripts/kintone/deploy-custom-ui.js`
5. a focused deploy-customization test file only

Do not scan repository/history.
Do not reopen bundle/auth/Employee-Code implementation unless a direct regression from this narrow change requires it.

## 2. Exact Defect to Fix

Current incorrect pattern:

```text
GET /k/v1/app/customize.json
  -> reuse Production FILE fileKeys
  -> PUT /k/v1/preview/app/customize.json
```

Kintone Preview customization update must retain existing uploaded files using FILE keys from Preview/Test customization state.

Correct pattern:

```text
GET effective/live customization
GET preview/test customization
  -> verify safe topology/scope alignment
  -> identify target in preview state
  -> upload replacement JS target only
  -> construct Preview PUT payload from preview state
  -> preserve preview non-target FILE keys
  -> include preview revision
```

## 3. Required Implementation

Update `scripts/kintone/deploy-custom-ui.js` only as needed so future live mode does all of the following:

1. Read effective/live state from `/k/v1/app/customize.json`.
2. Read Preview/Test state from `/k/v1/preview/app/customize.json`.
3. Before uploading anything, fail closed if live vs preview scope/topology differ unexpectedly.
   - compare scope;
   - compare ordered desktop/mobile entry counts;
   - compare entry type;
   - compare URL value for URL entries;
   - compare FILE name for FILE entries;
   - do not require live fileKey == preview fileKey.
4. In Preview/Test desktop JS, require exactly one FILE named `mbo-employee-app.js`.
5. Upload only the replacement `mbo-employee-app.js`.
6. Build the Preview PUT body from Preview/Test customization state.
7. Normalize PUT entries to API-supported fields only:

```text
URL  -> { type: 'URL', url: ... }
FILE -> { type: 'FILE', file: { fileKey: ... } }
```

8. Replace only the target JS `fileKey` with the newly uploaded target key.
9. Preserve all non-target Preview/Test FILE keys exactly, including CSS.
10. Preserve ordering, mobile entries, URL entries, and scope exactly.
11. Include `revision: previewCustomize.revision` in the Preview PUT request.
12. Fail closed if scope/revision/entry structure is malformed or target is missing/ambiguous.
13. Do not upload CSS.
14. Keep build-only mode free of Kintone network calls.

Do not change modular source architecture. Do not move this logic into `main-mbo-app.js`.

## 4. Focused Tests

Add or update one focused test for deploy customization preservation. A new dedicated test file is allowed here because deployment-preservation logic is a separate responsibility.

Tests must prove at minimum:

```text
PREVIEW_FILEKEY_SOURCE = PASS
ONLY_TARGET_JS_FILEKEY_REPLACED = PASS
NON_TARGET_CSS_PREVIEW_FILEKEY_PRESERVED = PASS
URL_ENTRY_ORDER_PRESERVED = PASS
MOBILE_ENTRY_ORDER_PRESERVED = PASS
SCOPE_PRESERVED = PASS
PREVIEW_REVISION_INCLUDED = PASS
LIVE_PREVIEW_FILEKEY_DIFFERENCE_ALLOWED = PASS
LIVE_PREVIEW_TOPOLOGY_DRIFT_BLOCKED = PASS
TARGET_MISSING_BLOCKED = PASS
TARGET_AMBIGUOUS_BLOCKED = PASS
CSS_UPLOAD_COUNT = 0
```

Do not make tests depend on real Kintone.

## 5. Regression Gates

Run locally:

```text
npm run ui:build
npm test
```

Confirm:

```text
AUTH_ADAPTER_DEFINITION_COUNT = 1
LOGIN_GATE_DEFINITION_COUNT = 1
EMPLOYEE_CODE_50.03 = PASS
EMPLOYEE_CODE_50.02 = PASS
EMPLOYEE_CODE_0050_2 = PASS
DIST_CSS_UNCHANGED = YES
```

If an already-correct bundle/auth/Employee-Code behavior regresses, fix only the direct regression and report it.

## 6. Explicitly Forbidden

- NO Kintone POST/PUT/DELETE;
- NO App794 upload/update/deploy;
- NO rollback;
- NO App794 record write;
- NO App801 write;
- NO App53/795/796 write;
- NO group/ACL change;
- NO UAT;
- NO D2-D7 implementation;
- NO broad refactor;
- NO copying feature logic into `main-mbo-app.js`;
- NO manual business-logic edits directly in `dist/mbo-employee-app.js`;
- NO reimplementation of the already corrected bundle/Employee-Code work.

## 7. Delivery

Commit only the necessary deploy-script/test changes plus generated dist only if `npm run ui:build` legitimately changes it. CSS must remain unchanged.

Do not modify Baseline, Control Center, or Active Task.
Do not commit secrets or live Kintone downloads.

Push one concise corrective commit and STOP.

Final report <= 15 lines:

```text
COMMIT_SHA
FILES_CHANGED
UI_BUILD_RESULT
NPM_TEST_RESULT
PREVIEW_FILEKEY_SOURCE
ONLY_TARGET_JS_FILEKEY_REPLACED
NON_TARGET_CSS_PREVIEW_FILEKEY_PRESERVED
PREVIEW_REVISION_INCLUDED
TOPOLOGY_DRIFT_BLOCKED
DIST_CSS_UNCHANGED
KINTONE_WRITES_EXECUTED = 0
APP794_DEPLOY_EXECUTED = 0
STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

Maximum status:

```text
IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

STOP after push. ChatGPT reviews again before any corrective redeploy can be considered.
