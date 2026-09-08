# MBO2026 — Evidence: D1-UAT-DEFECT-003-SANDBOX-DEPLOY-R1

- **WORK_PACKAGE**: `D1-UAT-DEFECT-003-SANDBOX-DEPLOY-R1`
- **TITLE**: `App794 Sandbox Deployment — DEFECT-003`
- **AUTHORIZATION_ID**: `D1-UAT-DEFECT-003-SANDBOX-DEPLOY-20260908-01`
- **EXECUTION_SOURCE_HEAD**: `2a02ab2583f53c3906674713c2e09e1757449ba8`
- **DEPLOYMENT_DATE**: `2026-09-08`
- **TARGET_APP_ID**: `794`

---

## 1. Deployment Execution Matrix

| Parameter | Value |
|---|---|
| **WORK_PACKAGE** | `D1-UAT-DEFECT-003-SANDBOX-DEPLOY-R1` |
| **AUTHORIZATION_ID** | `D1-UAT-DEFECT-003-SANDBOX-DEPLOY-20260908-01` |
| **EXECUTION_SOURCE_HEAD** | `2a02ab2583f53c3906674713c2e09e1757449ba8` |
| **TARGET_APP_ID** | `794` |
| **PRE_DEPLOY_REVISION** | `69` |
| **POST_DEPLOY_REVISION** | `70` |
| **DEPLOYMENT_ATTEMPT_COUNT** | `1` |
| **DEPLOYMENT_STATUS** | `SUCCESS` |
| **RETRY_COUNT** | `0` |
| **ROLLBACK_COUNT** | `0` |
| **LIVE_SCOPE** | `ALL` |
| **PREVIEW_SCOPE** | `ALL` |
| **LIVE_TOPOLOGY** | `desktopJs: 1, desktopCss: 1, mobileJs: 0, mobileCss: 0` |
| **CANDIDATE_JS_BLOB** | `204d34db9e2eab297409a6a3d5e7f29c649779d5` |
| **CANDIDATE_CSS_BLOB** | `0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61` |
| **LIVE_JS_FILENAME** | `mbo-employee-app.js` |
| **LIVE_JS_FILEKEY** | `202609080328569E2D60EF0D0F4BCF8A42E75E451B0D0D297` |
| **LIVE_JS_BLOB** | `204d34db9e2eab297409a6a3d5e7f29c649779d5` |
| **LIVE_CSS_FILENAME** | `mbo-employee.css` |
| **LIVE_CSS_FILEKEY** | `2026090803285763E59EE005B94DECAFCEC0A06E48BB57251` |
| **LIVE_CSS_BLOB** | `0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61` |
| **CANDIDATE_TO_LIVE_JS_MATCH** | `YES` (exact byte-for-byte Git blob match) |
| **CANDIDATE_TO_LIVE_CSS_MATCH** | `YES` (exact byte-for-byte Git blob match) |

---

## 2. Zero-Write Accounting

The deployment was strictly confined to App794 desktop customization and live deploy:

```text
APP794_RECORD_WRITES = 0
APP53_WRITES = 0
APP795_WRITES = 0
APP796_WRITES = 0
APP797_WRITES = 0
APP798_WRITES = 0
APP800_WRITES = 0
APP801_WRITES = 0
SCHEMA_WRITES = 0
LAYOUT_WRITES = 0
ACL_WRITES = 0
PROCESS_WRITES = 0
```

---

## 3. Current System State & Locked Truth

```text
D1-UAT-DEFECT-003 = DEPLOYED / OWNER FOCUSED UAT PENDING
ORIGINAL_OWNER_UAT = 4/4 PASS
D2_ENGINEERING = PASS / CLOSED / DURABLE
D3 = HOLD
PRODUCTION_READY = NO
DEPLOYMENT_AUTHORIZATION_AFTER_EXECUTION = CONSUMED / CLOSED
KINTONE_WRITE_AUTHORIZATION = NONE AFTER EXECUTION
```

---

## 4. Focused Owner Runtime UAT for DEFECT-003 (Pending Owner Execution)

The App 794 Sandbox Live environment is now running revision 70 with DEFECT-003 implemented. The only remaining validation is the focused Owner runtime UAT:

1. **DEFECT003-UAT-1**: In MBO Login overlay, click "กลับหน้าหลัก Kintone / Back to Kintone Home" -> cleanly exits blocking overlay back to Kintone portal.
2. **DEFECT003-UAT-2**: In MBO Login overlay, click "ลืมรหัสผ่าน / Forgot Password" -> bilingual HR/Administrator support text appears without password reset or session mutation.
3. **DEFECT003-UAT-3**: Enter Employee 0113 under shared account -> `DEDICATED_ACCOUNT_REQUIRED` denial appears, and Back to Kintone Home button remains active and functional.

Original UAT cases 1 through 4 (Ms.Papatchaya auto-bind, tmh+0113 deny, tmh+shared allow, current-FY single record guard) remain locked at **4/4 PASS** and must not be repeated.
