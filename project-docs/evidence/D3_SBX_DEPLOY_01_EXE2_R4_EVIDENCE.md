# D3-SBX-DEPLOY-01-EXE2-R4 Evidence Record

Updated: 2026-09-13 ICT

## 1. Package & Execution Metadata
```text
PACKAGE = D3-SBX-DEPLOY-01-EXE2-R4
TITLE = LOCAL EXACT BLOCKER CORRECTIVE
AUTHORIZATION_ID = MBO2026-D3-EXE2-R4-20260913-OWNER-01
AUTHORIZED_BASE_HEAD = a42c194254f2f015d429ab8ddc83013734eefc40
AUTHORIZED_BASE_PARENT = e719261b7107b30582325ab4e6b451bdcf9be2c8
AUTHORIZED_BASE_TREE = 59af050506f5a58c7fb6ecf524465aed1190d441
AUTHORIZED_BASE_MESSAGE = fix(d3): verify app794 custom ui raw-byte identity in preview and convergence (exe2-r3)
EXECUTION_PLANE = ANTIGRAVITY
ORCHESTRATION_CHANNEL = HERMES / TELEGRAM
TARGET_APP = 794
COMPONENT = APP794 UI CUSTOMIZATION LOCAL EXACT BLOCKER CORRECTIVE
MODE = LOCAL SOURCE + TARGETED MOCK TESTS + CONTROL/EVIDENCE ONLY
STATUS = PASS / LOCAL EXACT BLOCKER CORRECTIVE COMPLETE / TARGETED TESTS PASS / ARTIFACT IDENTITY UNCHANGED / ZERO KINTONE I/O / ZERO DEPLOYMENT / REVIEW REQUIRED
```

## 2. Hard Operational Accounting & Zero-I/O Verification
```text
KINTONE_READS = 0
KINTONE_WRITES = 0
FILE_UPLOADS = 0
CUSTOMIZATION_PUTS = 0
DEPLOY_POSTS = 0
LIVE_POLLS = 0
SCHEMA_WRITES = 0
PROCESS_WRITES = 0
RECORD_WRITES = 0
ACL_WRITES = 0
UAT = 0
PRODUCTION_CUTOVER = 0
WRITE_RETRY_COUNT = 0
AUTOMATIC_ROLLBACK_WRITES = 0
PARTIAL_WRITE = FALSE
ZERO_WRITE_FAIL_CLOSED = ENFORCED
```

## 3. Dist Artifact Identity Invariant (Zero Drift)
```text
JS_FILE = dist/mbo-employee-app.js
JS_GIT_BLOB_SHA = 6a29a0e652ab8bb210589583b2a2ebfa2754aafa (MATCHES INVARIANT EXACTLY)

CSS_FILE = dist/mbo-employee.css
CSS_GIT_BLOB_SHA = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61 (MATCHES INVARIANT EXACTLY)

DIST_DRIFT = 0 BYTES / BIT-FOR-BIT IDENTICAL / ZERO REBUILD / ZERO COMPILATION
```

## 4. Blocker-to-Fix Mapping & Technical Resolution

### Blocker 1: Deploy POST Transport Contract
- **Previous Defect:** Step 14 deploy POST bypassed `getApp794DeployRequestOptions`, serialized body to string before passing to client (resulting in double JSON serialization by default client), and omitted sanitized error handling.
- **Corrective Fix:**
  - Restored `getApp794DeployRequestOptions('/k/v1/preview/app/deploy.json', 'POST', { apps: [{ app, revision: previewStability.revision }] })`.
  - Body passed as an object so the default client (`kintoneRequest`) serializes it exactly once.
  - Preserved exact App794 and verified preview revision binding (`previewStability.revision`).
  - Restored sanitized deploy POST error handling (`formatSanitizedUploadError(deployErr, 'preview-deploy-post')`) redacting secrets, tokens, passwords, and fileKeys.
  - Enforced fail-closed response status check (`deployResponse.status >= 400`).
  - Strict PUT max 1 / deploy POST max 1 / zero retry preserved.
  - Shared discovery policy unchanged; bypassDiscovery granted strictly to authorized endpoints only.

### Blocker 2: Retained-Entry Preservation
- **Previous Defect:** `baselinePreview` (captured before writes) was not passed to final convergence, leaving retained entries unverified against baseline; `validatePreviewStability` and `validateLiveStability` did not verify that retained entries (FILE keys, URLs, names, types, order) remained unchanged.
- **Corrective Fix:**
  - Passed `baselinePreview: previewCustomize` to `validateCustomizationConvergence` in Step 16 to verify both `finalPreview` and `finalLive` retained entries against the pre-write baseline.
  - Updated `validatePreviewStability` and `validateLiveStability` to compare all 4 sections (`desktop.js`, `desktop.css`, `mobile.js`, `mobile.css`), verifying retained FILE keys, URLs, names, types, and ordering do not change.
  - Relaxed upload/LIVE/PREVIEW key equality ONLY for target JS/CSS whose raw-byte SHA-256 and byte lengths are verified against canonical artifacts.
  - Target keys must remain stable between initial and post-download reads on the same side.
  - Any retained-key drift (even if filename is unchanged) fails closed.
  - Preserved immediate content mismatch STOP before subsequent downloads and before deploy POST.
  - No identity/stability guards bypassed; no caller bypasses added.

### Blocker 3: Evidence Consistency & Read Accounting
- **Previous Defect:** R3 evidence miscounted Step 16 read ceiling as 7 GETs (omitting preview stability read), conflated Step 13 + Step 16 sum (12) with total execution reads, and asserted server re-keying mechanism proof.
- **Corrective Fix:**
  - Step 13 ceiling: maximum 4 GET calls (1 preview readback + 2 downloads + 1 preview stability).
  - Step 16 ceiling: maximum 8 GET calls:
    - Initial LIVE/PREVIEW metadata: 2 GETs
    - Target downloads (Live JS, Live CSS, Preview JS, Preview CSS): 4 GETs
    - Final LIVE/PREVIEW stability metadata: 2 GETs
  - Separated preflight GETs (2) and bounded polling (up to 20 GETs) from Step 13 and Step 16; their sum (12) is explicitly NOT total execution reads.
  - Recorded `SERVER_REKEYING_MECHANISM = UNVERIFIED` (empirical token resolution observed; internal server key issuance mechanisms are not proven).
  - Recorded latest Control Plane review of R3 as `REQUEST CORRECTIVE`.
  - Synced `Identity-01-R1` acceptance as evidence clarification accepted, retaining the historical stop-condition violation (`STOP_CONDITION_COMPLIANCE = VIOLATED`).

## 5. Implementation Changes & Changed Files
- `scripts/kintone/deploy-custom-ui.js`:
  - Restored `getApp794DeployRequestOptions` with object body and sanitized error handling for deploy POST in Step 14.
  - Passed `baselinePreview: previewCustomize` to `validateCustomizationConvergence` in Step 16.
  - Enhanced `validatePreviewStability` and `validateLiveStability` with comprehensive entry-by-entry verification across all lists.
  - Strengthened `compareRetained` in `validatePreviewReadback` and `validateCustomizationConvergence` to detect order/placement swaps.
- `tests/deploy-customization-preservation.test.js`:
  - Added test suite `BLOCKER_1_DEPLOY_POST_TRANSPORT_CONTRACT`: verifies authorized bypass, object body, and single serialization.
  - Added test suite `BLOCKER_1_DEPLOY_POST_FAILURE_SANITIZED_AND_ZERO_RETRY`: verifies sanitized error, zero retry, and deploy polling = 0.
  - Added test suite `BLOCKER_2_RETAINED_FILE_KEY_DRIFT_BEFORE_DEPLOY_STOPS_WITH_ZERO_DEPLOY_POST`: verifies readback & stability retained key drift causes deploy POST = 0.
  - Added test suite `BLOCKER_2_RETAINED_FILE_KEY_DRIFT_IN_CONVERGENCE_AND_STABILITY_FAILS`: verifies live & preview convergence/stability retained key drift fails.
  - Added test suite `BLOCKER_2_RETAINED_URL_ORDER_TYPE_DRIFT_IS_BLOCKED`: verifies URL, order, and type drift fails closed.
- `project-docs/evidence/D3_SBX_DEPLOY_01_EXE2_R3_EVIDENCE.md`:
  - Added corrective notice banner recording Control Plane review verdict `REQUEST CORRECTIVE`.
  - Corrected Step 16 read ceiling to 8 GETs max and separated preflight/polling from Step 13/16 reads.
  - Qualified `SERVER_REKEYING_MECHANISM = UNVERIFIED`.
  - Synced `Identity-01-R1` acceptance as evidence clarification accepted with historical stop-condition violation retained.

## 6. Targeted Regression Test Results
- Command: `node --test tests/deploy-customization-preservation.test.js tests/sandbox-write-guard.test.js`
- `tests/deploy-customization-preservation.test.js`: 51 / 51 PASS
- `tests/sandbox-write-guard.test.js`: 7 / 7 PASS
- **Total Targeted Tests:** 58 / 58 PASS (0 FAIL, 0 CANCELLED, 0 SKIPPED)
- **Full Repository Integration Test:** NOT CLAIMED

## 7. Final Governance State
```text
RESULT = REVIEW REQUIRED
ACTIVE_WORK_PACKAGE = NONE
NEXT_GATE_AUTHORIZED = NO
AUTO_START_NEXT_WORK_PACKAGE = NO
KINTONE_READ_AUTHORIZED = NO
KINTONE_WRITE_AUTHORIZED = NO
PROCESS_WRITE_AUTHORIZED = NO
DEPLOYMENT_AUTHORIZED = NO
UAT_AUTHORIZED = NO
PRODUCTION_READY = NO
FULL_REPOSITORY_INTEGRATION_TEST = NOT CLAIMED
```
