# D3-ARCHIVE-RUNTIME-ACL-REMEDIATION-AND-DEPLOY-01 Evidence Artifact

## 1. Executive Summary & Authorization Ledger

```text
WORK_PACKAGE                  = D3-ARCHIVE-RUNTIME-ACL-REMEDIATION-AND-DEPLOY-01
MODE                          = BOUNDED APP798 LEAST-PRIVILEGE ACL REMEDIATION + APP794 ARCHIVE-RUNTIME DEPLOYMENT + READ-BACK + GIT DELIVERY
AUTHORIZATION_ID              = MBO2026-D3-ARCHIVE-RUNTIME-ACL-REMEDIATION-AND-DEPLOY-01-20260917-OWNER-01
AUTHORIZED_BASE_HEAD          = 6e511a656a9f101cb8e01b55fd1a6eda39d4d535
CANONICAL_BRANCH              = ai/antigravity-wp002c
LOCAL_REPOSITORY_ROOT         = C:/Users/allda/Desktop/Dev/git/MBO2026
OWNER_AUTHORIZATION           = APPROVED
SCOPE_CONTROL                 = STRICT
SCOPE_EXPANSION_AUTHORIZED    = NO
HERMES                        = ORCHESTRATOR ONLY
EXECUTION_PLANE               = ANTIGRAVITY ONLY

PHASE_0_ARTIFACT_FREEZE       = PASS (Zero rebuild, identical byte length & hashes)
PHASE_1_LIVE_BASELINE         = PASS (App 798 Rev 5 baseline verified; App 794 Rev 75 baseline downloaded)
PHASE_2_ACL_REMEDIATION       = PASS (App 798 USER 'hr' least-privilege Add/View granted; deployed to Rev 6)
PHASE_3_APP794_DEPLOYMENT     = PASS (App 794 deployed to Rev 76; downloaded live JS/CSS hashes verified)
PHASE_4_EVIDENCE_CONTROL_SYNC = PASS
TERMINAL_GATE                 = STOP = WAIT_FOR_CHATGPT_INDEPENDENT_REVIEW
NEXT_GATE_AUTHORIZED          = NO
PRODUCTION_READY              = NO
FULL_D3_BUSINESS_UAT          = NOT PROVEN (Live Customization & ACL Proven; Business UAT Pending Review)
```

---

## 2. Phase 0: Freeze Local Artifact Identity

Committed artifacts in `dist/` were deterministically verified prior to execution. No rebuild or modification was performed.

```text
PRIMARY_JS_ARTIFACT           = dist/mbo-employee-app.js
JS_BYTE_SIZE                  = 713130
JS_GIT_BLOB_SHA               = 3d75ca1e62e7d5475c061ba914a4f87956e9a829
JS_SHA256                     = c2049fba52d4fb6e82faf767ff359f37dbafab57aea1e9dada74c022b884989f
REBUILD_PERFORMED             = NO

SECONDARY_CSS_ARTIFACT        = dist/mbo-employee.css
CSS_BYTE_SIZE                 = 43728
CSS_GIT_BLOB_SHA              = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
CSS_SHA256                    = c0257969a6a040ae33e08ad001b8aa0944e844fb3fd2578ca041ecf9d19f58fd
REBUILD_PERFORMED             = NO
```

---

## 3. Phase 1: Live Read-Only Baseline

Baseline state before any mutations:

```text
APP798_BASELINE_REVISION      = 5
APP798_BASELINE_RIGHTS_COUNT  = 2 (CREATOR: full rights; GROUP 'everyone': view=false, add=false)
APP798_HR_RIGHTS_PRESENT      = NO

APP794_BASELINE_REVISION      = 75
APP794_BASELINE_CUSTOMIZE     = scope: ALL, desktop JS: 1 file, desktop CSS: 1 file
APP794_BASELINE_LIVE_JS_SHA   = cc80a23fa1adcd71fd8eae1ba95d78faa0694115aa672937c97c009b77e31bf3 (640,471 bytes)
APP794_BASELINE_LIVE_CSS_SHA  = c0257969a6a040ae33e08ad001b8aa0944e844fb3fd2578ca041ecf9d19f58fd (43,728 bytes)
BASELINE_DRIFT                = NO (100% matched expected pre-deploy values)
```

---

## 4. Phase 2: App 798 Least-Privilege ACL Remediation

Remediation of blocking condition `APP798_LIVE_ACL_NOT_PROVEN`:

1. **Preview Update**:
   - `PUT /k/v1/preview/app/acl.json` executed with exact 3 rights entries:
     - `CREATOR`: full rights (preserved)
     - `USER 'hr'`: `recordViewable: true`, `recordAddable: true`, all other privileges `false`
     - `GROUP 'everyone'`: all privileges `false` (preserved)
   - Preview revision returned: `6`

2. **Preview Read-back Verification**:
   - Verified 3 rights entries present.
   - USER `hr` granted strictly least-privilege `recordViewable: true` and `recordAddable: true`.
   - Admin, edit, delete, import, export denied.

3. **Deploy & Live Read-back**:
   - `POST /k/v1/preview/app/deploy.json` executed.
   - Polling status: Poll #1 returned `SUCCESS`.
   - Live read-back `GET /k/v1/app/acl.json?app=798`:
     - Live revision: `6`
     - Exact 3 rights matched bit-for-bit.
     - App 798 form schema and records verified untouched.

---

## 5. Phase 3: App 794 Archive-Runtime Deployment

Deployment of pinned archive-runtime customization to App 794:

1. **Upload**:
   - `dist/mbo-employee-app.js` uploaded to Kintone file storage.
   - `dist/mbo-employee.css` uploaded to Kintone file storage.

2. **Preview Customization**:
   - `PUT /k/v1/preview/app/customize.json` updated with scope `ALL`, desktop JS/CSS files, mobile empty.
   - Preview revision returned: `76`

3. **Preview Download Read-back**:
   - Downloaded preview JS: SHA-256 `c2049fba52d4fb6e82faf767ff359f37dbafab57aea1e9dada74c022b884989f` (713,130 bytes) -> PASS
   - Downloaded preview CSS: SHA-256 `c0257969a6a040ae33e08ad001b8aa0944e844fb3fd2578ca041ecf9d19f58fd` (43,728 bytes) -> PASS

4. **Deploy & Polling**:
   - `POST /k/v1/preview/app/deploy.json` executed for App 794.
   - Poll #1: `PROCESSING`
   - Poll #2: `SUCCESS`

5. **Live Read-back Verification**:
   - Live App 794 Revision: `76`
   - Scope: `ALL`
   - Desktop JS filename: `mbo-employee-app.js`, downloaded SHA-256: `c2049fba52d4fb6e82faf767ff359f37dbafab57aea1e9dada74c022b884989f` (713,130 bytes) -> EXACT MATCH
   - Desktop CSS filename: `mbo-employee.css`, downloaded SHA-256: `c0257969a6a040ae33e08ad001b8aa0944e844fb3fd2578ca041ecf9d19f58fd` (43,728 bytes) -> EXACT MATCH
   - App 798 customization verified untouched (no JS/CSS).
   - App 794 and App 798 process management, schema, and records verified untouched.

---

## 6. Terminal Invariants & Gate Status

```text
APP798_LIVE_ACL_PROVEN        = YES (USER 'hr' least-privilege Add/View deployed at Revision 6)
APP794_ARCHIVE_RUNTIME_PROVEN = YES (Customization bundle deployed at Revision 76 with matching SHA-256)
APP794_REVISION_STATE         = 76
APP798_REVISION_STATE         = 6
LIVE_BASELINE_DRIFT           = NONE
FULL_D3_BUSINESS_UAT          = NOT PROVEN
D3_CLOSURE                    = NOT CLAIMED
PRODUCTION_READY              = NO
STOP_REASON                   = WAIT_FOR_CHATGPT_INDEPENDENT_REVIEW
```
