# AI ACTIVE TASK — D1 PRE-UPLOAD SAFETY CORRECTIVE

> Read `project-docs/AI_CONTROL_CENTER.md` FIRST.  
> Execution Plane: Antigravity  
> Branch: `ai/antigravity-wp002c`  
> Mode: **SOURCE / TEST ONLY — NO LIVE KINTONE WRITE**

## 0. Review State

Corrective commit reviewed:

```text
e55dbf5c1003ca3bdc071228fd6daf97956e16c9
```

Preview/Test fileKey sourcing and non-target preservation are provisionally accepted.

**Do not redo bundle/auth/Employee-Code/fileKey corrections.**

One safety defect remains: some validation happens only after the replacement JS file has already been uploaded.

## 1. Read Only These Inputs

1. `project-docs/AI_CONTROL_CENTER.md`
2. this `project-docs/AI_ACTIVE_TASK.md`
3. `project-docs/CONFIRMED_BASELINE/AI_OPERATING_GOVERNANCE.md` — Source-Code Modularity section
4. `scripts/kintone/deploy-custom-ui.js`
5. `tests/deploy-customization-preservation.test.js`

Do not scan repository/history.
Do not reopen unrelated source.

## 2. Exact Defect to Fix

Current unsafe order:

```text
read live/preview
partial topology validation
UPLOAD JS
then validate target/payload details
```

Required safe order:

```text
read live/preview
FULL deterministic preflight validation
  -> explicit valid scope
  -> explicit preview revision
  -> valid entry structures/types
  -> topology alignment
  -> exactly one target
  -> all retained preview FILE keys present
ONLY THEN upload target JS once
build payload from already validated preview state
PUT preview with preview revision
```

No remote write/file upload may happen before full preflight passes.

## 3. Required Implementation

Update existing deploy implementation only as needed:

1. Add/reuse a focused preflight helper; do not move logic into `main-mbo-app.js`.
2. Validate live and preview customization before upload.
3. `scope` must be explicitly present and valid; do not silently fallback to `ALL` for malformed/missing source state.
4. Preview `revision` must be present/non-empty before upload and must be included in Preview PUT.
5. Validate all desktop/mobile JS/CSS entries before upload:
   - supported type only: `URL` or `FILE`;
   - URL entry requires non-empty string `url`;
   - FILE entry requires non-empty string `file.name` for topology validation;
   - Preview FILE entry retained in payload requires non-empty string `file.fileKey`.
6. Live-vs-preview fileKey difference remains allowed.
7. Require exactly one Preview desktop FILE target named `mbo-employee-app.js` before upload.
8. Missing/ambiguous target must fail before upload.
9. Topology/scope drift must fail before upload.
10. Only after preflight PASS may exactly one replacement JS upload occur.
11. Continue to upload no CSS and preserve Preview non-target fileKeys/order/URL/mobile/scope.
12. Keep modular source architecture intact.
13. Keep build-only mode free of Kintone network calls.

Do not broaden this into a deployment-framework refactor.

## 4. Focused Tests

Update the existing focused test file. Tests must prove at minimum:

```text
VALID_PREFLIGHT_PASS = PASS
MISSING_SCOPE_BLOCKED_PRE_UPLOAD = PASS
MISSING_REVISION_BLOCKED_PRE_UPLOAD = PASS
UNSUPPORTED_ENTRY_TYPE_BLOCKED_PRE_UPLOAD = PASS
MALFORMED_URL_BLOCKED_PRE_UPLOAD = PASS
MALFORMED_FILE_NAME_BLOCKED_PRE_UPLOAD = PASS
MISSING_RETAINED_PREVIEW_FILEKEY_BLOCKED_PRE_UPLOAD = PASS
TARGET_MISSING_BLOCKED_PRE_UPLOAD = PASS
TARGET_AMBIGUOUS_BLOCKED_PRE_UPLOAD = PASS
TOPOLOGY_DRIFT_BLOCKED_PRE_UPLOAD = PASS
LIVE_PREVIEW_FILEKEY_DIFFERENCE_ALLOWED = PASS
ONLY_TARGET_JS_FILEKEY_REPLACED = PASS
NON_TARGET_CSS_PREVIEW_FILEKEY_PRESERVED = PASS
PREVIEW_REVISION_INCLUDED = PASS
CSS_UPLOAD_COUNT = 0
```

Prefer a testable function boundary that lets tests prove the upload/write callback count remains zero for invalid preflight states. Do not call real Kintone.

## 5. Regression Gates

Run locally:

```text
npm run ui:build
npm test
```

Confirm no regression in already corrected areas:

```text
AUTH_ADAPTER_DEFINITION_COUNT = 1
LOGIN_GATE_DEFINITION_COUNT = 1
EMPLOYEE_CODE_50.03 = PASS
EMPLOYEE_CODE_50.02 = PASS
EMPLOYEE_CODE_0050_2 = PASS
DIST_CSS_UNCHANGED = YES
```

## 6. Explicitly Forbidden

- NO Kintone POST/PUT/DELETE;
- NO file upload to Kintone;
- NO App794 customization deploy;
- NO rollback;
- NO App794 record write;
- NO App801 write;
- NO App53/795/796 write;
- NO group/ACL change;
- NO UAT;
- NO D2-D7 implementation;
- NO broad refactor;
- NO merging modules into `main-mbo-app.js`;
- NO manual business-logic edits in generated `dist/mbo-employee-app.js`;
- NO reimplementation of already provisionally accepted fixes.

## 7. Delivery

Commit only necessary deploy-script/test changes plus generated dist only if build legitimately changes it. CSS must remain unchanged.

Do not modify Baseline, Control Center, or Active Task.
Do not commit secrets/live downloads.

Push one concise corrective commit and STOP.

Final report <= 15 lines:

```text
COMMIT_SHA
FILES_CHANGED
UI_BUILD_RESULT
NPM_TEST_RESULT
VALID_PREFLIGHT_PASS
MISSING_REVISION_BLOCKED_PRE_UPLOAD
MISSING_SCOPE_BLOCKED_PRE_UPLOAD
TARGET_MISSING_BLOCKED_PRE_UPLOAD
TARGET_AMBIGUOUS_BLOCKED_PRE_UPLOAD
MALFORMED_ENTRY_BLOCKED_PRE_UPLOAD
ZERO_REMOTE_WRITES_ON_INVALID_PREFLIGHT
DIST_CSS_UNCHANGED
KINTONE_WRITES_EXECUTED = 0
APP794_DEPLOY_EXECUTED = 0
STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

Maximum status:

```text
IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

STOP after push. ChatGPT reviews before any corrective redeploy is considered.
