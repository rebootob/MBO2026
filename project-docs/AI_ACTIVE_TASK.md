# AI ACTIVE TASK — APP794 CORRECTIVE REDEPLOY

> Read `project-docs/AI_CONTROL_CENTER.md` FIRST.  
> Execution Plane: Antigravity  
> Branch: `ai/antigravity-wp002c`  
> Mode: **ONE EXACT LIVE APP794 CORRECTIVE REDEPLOY — THEN STOP**

## 0. Authorization / Accepted Source

User explicitly authorized:

```text
อนุมัติ App794 Corrective Redeploy
```

Accepted corrective source commit:

```text
ed1d8e8573efeb47845cc07dcd81853842ed307e
```

Accepted pre-deploy artifact identities:

```text
dist/mbo-employee-app.js Git blob SHA = 2a9a3c5bfe896b51f482c016f66863bffeddb679
dist/mbo-employee.css    Git blob SHA = 1359dfae16d1224580210a5a6cd366fb20bcf6f8
```

This task authorizes execution only. It does **not** authorize source changes, JavaScript refactor, UAT, rollback write, or D2-D7 work.

Maximum executor status:

```text
IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

## 1. Read Only These Inputs

1. `project-docs/AI_CONTROL_CENTER.md`
2. this `project-docs/AI_ACTIVE_TASK.md`
3. `scripts/kintone/deploy-custom-ui.js`
4. `tests/deploy-customization-preservation.test.js` only if needed to understand a test failure
5. `project-docs/CONFIRMED_BASELINE/D1_AUTH_SECURITY.md` only for D1 security/UAT boundary
6. `project-docs/CONFIRMED_BASELINE/SOURCE_CODE_ARCHITECTURE.md` only for the no-refactor rule
7. existing `project-docs/D1_ACCESS_GROUP_SETUP_EVIDENCE.md` only when appending sanitized redeploy evidence

Do not scan repository/history. Do not plan new work.

## 2. Mandatory Git / Source Integrity Gate

Before execution:

1. Sync branch `ai/antigravity-wp002c` to latest HEAD.
2. Confirm no source/business/dist changes were introduced after accepted source commit other than expected Control Plane documents. If unexpected source changes exist: STOP before Kintone write.
3. Do not edit source, tests, build logic, CSS, or generated dist manually.

No source-fix-on-the-fly is allowed in this task.

## 3. Mandatory Local Build + Test Gate — BEFORE ANY KINTONE WRITE

Run exactly:

```text
npm run ui:build
npm test
```

Both must exit successfully.

Then verify generated artifact identity:

```text
git hash-object dist/mbo-employee-app.js
# MUST equal:
2a9a3c5bfe896b51f482c016f66863bffeddb679

git hash-object dist/mbo-employee.css
# MUST equal:
1359dfae16d1224580210a5a6cd366fb20bcf6f8
```

Also confirm the accepted regression signals from the test run remain PASS:

```text
AUTH_ADAPTER_DEFINITION_COUNT = 1
LOGIN_GATE_DEFINITION_COUNT = 1
EMPLOYEE_CODE_50.03 = PASS
EMPLOYEE_CODE_50.02 = PASS
EMPLOYEE_CODE_0050_2 = PASS
```

If build/test/artifact identity fails:

```text
DEPLOY_RESULT = BLOCKED_LOCAL_GATE
KINTONE_WRITES_EXECUTED = 0
APP794_DEPLOY_EXECUTED = 0
```

STOP. Do not edit source in this task.

## 4. Mandatory App794 Read-Only Backup / Precheck

Target:

```text
APP_ID = 794
```

Before the first remote write:

1. GET effective/live customization.
2. GET Preview/Test customization.
3. Save rollback-ready local backup of both customization states outside Git.
4. Save/download relevant current effective FILE bytes locally where available so pre/post content hashes can be compared, at minimum target JS and CSS.
5. Record sanitized pre-change facts only:
   - live/preview revision where applicable;
   - scope;
   - desktop/mobile JS/CSS entry counts/order/types/names;
   - target JS identity;
   - non-target FILE identities/fileKeys needed for preservation proof;
   - pre-change effective CSS content hash.
6. Do not commit raw backup files, Kintone auth headers/tokens/cookies, or downloaded customization contents.

Backup must be rollback-ready, but **rollback write is not authorized in this task**.

## 5. Mandatory Strict Preflight — STILL BEFORE ANY WRITE

Use the accepted implementation in `scripts/kintone/deploy-custom-ui.js`.

Preflight must pass all of these before file upload:

```text
EXPLICIT_DESKTOP_MOBILE_STRUCTURE = PASS
EXPLICIT_JS_CSS_ARRAYS = PASS
SCOPE in ALL|ADMIN|NONE = PASS
LIVE_PREVIEW_SCOPE_MATCH = PASS
PREVIEW_REVISION_POSITIVE_INTEGER = PASS
PREVIEW_REVISION_MINUS_ONE_REJECTED = PASS
VALID_URL_FILE_ENTRY_STRUCTURE = PASS
LIVE_PREVIEW_TOPOLOGY_ALIGNMENT = PASS
EXACTLY_ONE_PREVIEW_DESKTOP_JS_TARGET = PASS
ALL_RETAINED_PREVIEW_FILEKEYS_PRESENT = PASS
SAME_FILENAME_NON_TARGET_FILEKEY_REQUIRED = PASS
```

Any preflight failure:

```text
KINTONE_WRITES_EXECUTED = 0
APP794_DEPLOY_EXECUTED = 0
STOP
```

## 6. Authorized Remote Write Sequence — EXACTLY THIS SCOPE

Only after Sections 2–5 PASS:

### Step 1 — Upload target JS only

Upload exactly:

```text
mbo-employee-app.js
```

Expected counters:

```text
TARGET_JS_UPLOAD_COUNT = 1
CSS_UPLOAD_COUNT = 0
OTHER_FILE_UPLOAD_COUNT = 0
```

### Step 2 — Preview customization PUT

Build payload from the **current Preview/Test state** and:
- replace only the exact Preview desktop JS target fileKey;
- preserve every non-target Preview FILE fileKey;
- preserve URL entries;
- preserve desktop/mobile order;
- preserve scope;
- include the exact accepted Preview revision;
- do not add/remove/reorder unrelated customization entries.

Expected:

```text
PREVIEW_CUSTOMIZATION_PUT_COUNT = 1
```

### Step 3 — Deploy App794

Request deploy for App794 only and poll until terminal status.

Expected:

```text
APP794_DEPLOY_REQUEST_COUNT = 1
```

If upload, PUT, or deploy fails:
- STOP immediately;
- no blind retry;
- read back actual current state with GET only;
- no automatic rollback write;
- report sanitized partial state/blocker.

## 7. Mandatory Post-Deploy Independent-Ready Read-Back

After deployment reports SUCCESS, GET effective/live customization and Preview/Test customization again.

Verify at minimum:

```text
DEPLOY_STATUS = SUCCESS
TARGET_JS_PRESENT_EXACTLY_ONCE = YES
TARGET_JS_CONTENT_IDENTITY = accepted artifact / exact hash match
CSS_UPLOAD_COUNT = 0
EFFECTIVE_CSS_CONTENT_HASH_AFTER = EFFECTIVE_CSS_CONTENT_HASH_BEFORE
PREVIEW_NON_TARGET_FILEKEYS_PRESERVED = YES
SCOPE_PRESERVED = YES
DESKTOP_ORDER_PRESERVED = YES
MOBILE_ORDER_PRESERVED = YES
URL_ENTRIES_PRESERVED = YES
NON_TARGET_ENTRY_COUNT_PRESERVED = YES
```

For target JS verification, download the effective target JS after deploy and compute an exact content identity compatible with the accepted local artifact, preferably `git hash-object` on the downloaded bytes. It must equal:

```text
2a9a3c5bfe896b51f482c016f66863bffeddb679
```

Do not expose raw JS/CSS contents in evidence.

If any post-deploy verification mismatches:

```text
DEPLOY_RESULT = IMPLEMENTED_WITH_POSTCHECK_BLOCKER
```

STOP. Do not retry or rollback automatically.

## 8. Mandatory Counters / No-Scope-Creep Proof

Report all:

```text
KINTONE_WRITES_EXECUTED = <exact total remote writes>
TARGET_JS_UPLOAD_COUNT = <0 or 1>
CSS_UPLOAD_COUNT = 0
OTHER_FILE_UPLOAD_COUNT = 0
PREVIEW_CUSTOMIZATION_PUT_COUNT = <0 or 1>
APP794_DEPLOY_REQUEST_COUNT = <0 or 1>
APP794_RECORD_WRITES_EXECUTED = 0
APP801_WRITES_EXECUTED = 0
APP53_WRITES_EXECUTED = 0
APP795_WRITES_EXECUTED = 0
APP796_WRITES_EXECUTED = 0
GROUP_ACL_WRITES_EXECUTED = 0
D2_D7_WRITES_EXECUTED = 0
ROLLBACK_WRITES_EXECUTED = 0
UAT_EXECUTED = 0
SOURCE_FILES_MODIFIED = 0
```

Note: GET/read-back/poll calls are not remote writes for this counter.

## 9. Evidence / Git Delivery

Append one sanitized section to existing:

```text
project-docs/D1_ACCESS_GROUP_SETUP_EVIDENCE.md
```

Section title:

```text
## 11. App794 Corrective Redeploy — D1 Runtime Recovery
```

Evidence may include only:
- accepted source commit;
- build/test outcome;
- artifact Git blob/hash identities;
- live/preview revisions and topology summaries;
- target/non-target preservation result;
- deployment status;
- mandatory counters;
- sanitized HTTP/error code/message if blocked.

Do NOT commit:
- raw Kintone backup JSON;
- downloaded live JS/CSS contents;
- API tokens/headers/cookies;
- credential data;
- Password_Hash/salt/plaintext;
- full employee lists/personal data.

Prefer one evidence commit + one push.

## 10. Explicitly Forbidden

- NO source edit;
- NO JavaScript refactor/modularization;
- NO `employee-part-a-ui.js` change;
- NO `main-mbo-app.js` change;
- NO CSS upload;
- NO automatic retry after a write failure;
- NO automatic rollback/restore write;
- NO App794 record write;
- NO App801/App53/App795/App796 write;
- NO group/ACL change;
- NO UAT;
- NO D2-D7 work;
- NO follow-on task creation.

## 11. Final Report — <= 18 Lines

Return only:

```text
COMMIT_SHA
UI_BUILD_RESULT
NPM_TEST_RESULT
JS_ARTIFACT_IDENTITY_RESULT
CSS_ARTIFACT_IDENTITY_RESULT
BACKUP_RESULT
LIVE_REVISION_BEFORE
PREVIEW_REVISION_BEFORE
STRICT_PREFLIGHT_RESULT
TARGET_JS_UPLOAD_COUNT
CSS_UPLOAD_COUNT
PREVIEW_CUSTOMIZATION_PUT_COUNT
APP794_DEPLOY_REQUEST_COUNT
DEPLOY_STATUS
TARGET_JS_CONTENT_HASH_MATCH
CSS_CONTENT_HASH_PRESERVED
NON_TARGET_CUSTOMIZATION_PRESERVED
MANDATORY_COUNTERS
BLOCKER = NONE or sanitized blocker
STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

STOP after push. Do not start UAT or modularization. ChatGPT performs the independent review.