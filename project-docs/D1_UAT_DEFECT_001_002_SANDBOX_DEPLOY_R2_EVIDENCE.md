# D1 App794 Sandbox Deployment Evidence — Defect 001/002 (R2 Reconciliation)

- **Date:** 2026-09-08 ICT
- **Branch:** `ai/antigravity-wp002c`
- **Active Work Package:** `D1-UAT-DEFECT-001-002-SANDBOX-DEPLOY-R2`
- **Authorization ID:** `D1-UAT-DEFECT-001-002-SANDBOX-DEPLOY-20260908-02`
- **Original Deployment Authorization ID:** `D1-UAT-DEFECT-001-002-SANDBOX-DEPLOY-20260907-01`
- **Target App:** App 794 (MBO Main Application Sandbox)
- **Execution Source HEAD:** `8c7f23552539fdbd1df2adc5346aa5d2361e2321`
- **Build Candidate Commit:** `d9efa5a0c418ad98ca8b70965b130a8b607e81b5`
- **Tooling Correction Commit:** `03b531383e86c643a5258a2baf6fdbd15bc9099e`
- **Target Scope:** Desktop Customization JS/CSS Only

---

## 1. Deployment Evidence Matrix

```text
WORK_PACKAGE                             = D1-UAT-DEFECT-001-002-SANDBOX-DEPLOY-R2
AUTHORIZATION_ID                         = D1-UAT-DEFECT-001-002-SANDBOX-DEPLOY-20260908-02
EXECUTION_SOURCE_HEAD                    = 8c7f23552539fdbd1df2adc5346aa5d2361e2321
BUILD_CANDIDATE_COMMIT                   = d9efa5a0c418ad98ca8b70965b130a8b607e81b5
TOOLING_CORRECTION_COMMIT                = 03b531383e86c643a5258a2baf6fdbd15bc9099e
TARGET_APP_ID                            = 794
PRE_DEPLOY_APP794_REVISION               = 67
POST_DEPLOY_APP794_REVISION              = 68
DEPLOYMENT_ATTEMPT_COUNT                 = 1
DEPLOYMENT_STATUS                        = SUCCESS (Deployed to Live Sandbox)
RETRY_COUNT                              = 0
ROLLBACK_COUNT                           = 0
LIVE_CUSTOMIZATION_SCOPE                 = ALL
PREVIEW_CUSTOMIZATION_SCOPE              = ALL
LIVE_DESKTOP_JS_COUNT                    = 1
LIVE_DESKTOP_CSS_COUNT                   = 1
LIVE_MOBILE_JS_COUNT                     = 0
LIVE_MOBILE_CSS_COUNT                    = 0
PREVIEW_DESKTOP_JS_COUNT                 = 1
PREVIEW_DESKTOP_CSS_COUNT                = 1
PREVIEW_MOBILE_JS_COUNT                  = 0
PREVIEW_MOBILE_CSS_COUNT                 = 0

CANDIDATE_JS_BLOB_SHA                    = 8958634b92b35f74b58a7a0b2abd09b8b5e93758
CANDIDATE_CSS_BLOB_SHA                   = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
LIVE_DEPLOYED_JS_FILENAME                = mbo-employee-app.js
LIVE_DEPLOYED_JS_FILEKEY                 = 202609071516409748D72F72DF4E67B4E3325BF3042693155
LIVE_DOWNLOADED_JS_BLOB_SHA              = 8958634b92b35f74b58a7a0b2abd09b8b5e93758
LIVE_DEPLOYED_CSS_FILENAME               = mbo-employee .css
LIVE_DEPLOYED_CSS_FILEKEY                = 20260907151640DFE2C7F53C354FD6845F2E846D766911104
LIVE_DOWNLOADED_CSS_BLOB_SHA             = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61

CANDIDATE_TO_LIVE_JS_MATCH               = YES (exact byte-for-byte Git blob match)
CANDIDATE_TO_LIVE_CSS_MATCH              = YES (exact byte-for-byte Git blob match)

APP794_RECORD_WRITES                     = 0
APP53_WRITES                             = 0
APP795_WRITES                            = 0
APP796_WRITES                            = 0
APP797_WRITES                            = 0
APP798_WRITES                            = 0
APP800_WRITES                            = 0
APP801_WRITES                            = 0
SCHEMA_WRITES                            = 0
LAYOUT_WRITES                            = 0
ACL_WRITES                               = 0
PROCESS_WRITES                           = 0

D2_STAGE_STATUS                          = PASS / CLOSED / DURABLE (unchanged)
D3_STAGE_STATUS                          = HOLD (not started)
OWNER_RUNTIME_UAT                        = PENDING_OWNER_EXECUTION
CONTROL_PLANE_REVIEW                     = PENDING_INDEPENDENT_REVIEW
```

---

## 2. Technical Reconstruction & Reconciliation Log

1. **Candidate Build & Commit (`d9efa5a0c418ad98ca8b70965b130a8b607e81b5`)**:
   - Source identity corrections for `D1-UAT-DEFECT-001` (Shared principal forbidden from dedicated employee login) and `D1-UAT-DEFECT-002` (current-FY MBO navigates to existing record instead of create path) were bundled into `dist/mbo-employee-app.js` and `dist/mbo-employee.css`.
   - Immutable Git blob identity:
     - `dist/mbo-employee-app.js` = `8958634b92b35f74b58a7a0b2abd09b8b5e93758`
     - `dist/mbo-employee.css` = `0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61`

2. **App 794 Sandbox Live Deployment (R1 Execution)**:
   - Under authorization `D1-UAT-DEFECT-001-002-SANDBOX-DEPLOY-20260907-01`, `executeDeployCustomUi()` uploaded the candidate artifacts and deployed Live Sandbox App 794 from revision 67 to revision 68.
   - Deployed assets:
     - JS fileKey `202609071516409748D72F72DF4E67B4E3325BF3042693155` (`mbo-employee-app.js`)
     - CSS fileKey `20260907151640DFE2C7F53C354FD6845F2E846D766911104` (`mbo-employee .css`)
   - Direct GET verification confirmed:
     - Live revision = 68
     - Downloaded Live JS Git blob = `8958634b92b35f74b58a7a0b2abd09b8b5e93758` (**MATCH**)
     - Downloaded Live CSS Git blob = `0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61` (**MATCH**)

3. **Tooling Correction (`03b531383e86c643a5258a2baf6fdbd15bc9099e`)**:
   - `scripts/kintone/deploy-custom-ui.js` and preservation tests were corrected so that the canonical target CSS name is `"mbo-employee.css"` rather than the historical spaced `"mbo-employee .css"`.
   - In subsequent preflight checks under R2 (`D1-UAT-DEFECT-001-002-SANDBOX-DEPLOY-20260908-02`), preflight halted before network write due to the existing remote filename retaining the historical space.

4. **Case A Reconciliation**:
   - Direct readback from Kintone Sandbox confirms App 794 is already running the exact reviewed candidate code (`8958634b...` and `0532c1c3...`) deployed at revision 68.
   - Zero additional writes were performed in R2.
   - Zero record, schema, ACL, or workflow writes were performed across all apps.
   - Attempt count is strictly 1 (from R1); retry count is 0; rollback count is 0.

---

## 3. Scope & Invariants Confirmation

- **Zero Record Writes**: Confirmed 0 record writes across Apps 53, 794, 795, 796, 797, 798, 800, and 801.
- **Zero Schema / Process Writes**: Confirmed 0 schema, layout, ACL, or Process Management alterations.
- **Stage D2**: Remains `PASS / CLOSED / DURABLE`.
- **Stage D3**: Remains strictly on `HOLD`.
- **Authority**: Antigravity does not claim Owner UAT PASS or Control Plane PASS. The sandbox is ready for Owner runtime UAT.
