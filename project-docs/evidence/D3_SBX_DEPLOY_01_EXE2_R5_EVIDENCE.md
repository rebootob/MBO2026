# D3-SBX-DEPLOY-01-EXE2-R5 Evidence Record

Updated: 2026-09-13 ICT

## 1. Package & Execution Metadata
```text
PACKAGE = D3-SBX-DEPLOY-01-EXE2-R5
TITLE = APP794 UI CUSTOMIZATION DEPLOYMENT RETRY
AUTHORIZATION_ID = MBO2026-D3-EXE2-R5-20260913-OWNER-01
AUTHORIZED_BASE_HEAD = 22e7c788200bc05c36e2a10a971e0e15b3fe2bbe
AUTHORIZED_BASE_PARENT = a42c194254f2f015d429ab8ddc83013734eefc40
AUTHORIZED_BASE_TREE = a4d3f624559c35f505a5dc22749e33740797cd3a
AUTHORIZED_BASE_MESSAGE = fix(d3): correct deploy transport, retained convergence, and evidence accounting (exe2-r4)
EXECUTION_HEAD = 22e7c788200bc05c36e2a10a971e0e15b3fe2bbe
EXECUTION_PLANE = ANTIGRAVITY
ORCHESTRATION_CHANNEL = HERMES / TELEGRAM
TARGET_APP = 794
COMPONENT = APP794 UI CUSTOMIZATION ONLY
MODE = LIVE KINTONE SANDBOX DEPLOYMENT EXECUTION + CONTROL/EVIDENCE
STATUS = PASS / APP794 UI CUSTOMIZATION DEPLOYED / PREVIEW VERIFIED / DEPLOY SUCCESS / LIVE+PREVIEW CONVERGENCE VERIFIED / PROCESS PRESERVED / REVIEW REQUIRED
```

## 2. Hard Operational Accounting & Ceiling Compliance
```text
PROCESS_BASELINE_READS = 2 (CEILING: 2 GET max)
CUSTOMIZATION_PREFLIGHT_READS = 2 (CEILING: 2 GET max)
STEP_13_PREVIEW_READS = 4 (1 metadata + 2 downloads + 1 stability; CEILING: 4 GET max)
DEPLOY_POLLING_READS = 3 (CEILING: 20 GET max)
STEP_16_CONVERGENCE_READS = 8 (2 metadata + 4 downloads + 2 stability; CEILING: 8 GET max)
PROCESS_FINAL_READS = 2 (CEILING: 2 GET max)

TOTAL_KINTONE_GET_READS = 21 (CEILING: 38 GET max)
PROCESS_READS_TOTAL = 4 (CEILING: 4 GET max)
ZERO_READ_RETRY = ENFORCED (0 retries across all phases)
ZERO_AUXILIARY_READS = ENFORCED (0 auxiliary diagnostic reads outside bounded execution)

JS_UPLOADS = 1 (CEILING: 1 POST max)
CSS_UPLOADS = 1 (CEILING: 1 POST max)
CUSTOMIZATION_PUTS = 1 (CEILING: 1 PUT max)
DEPLOY_POSTS = 1 (CEILING: 1 POST max)
TOTAL_KINTONE_WRITES = 4 (CEILING: 4 max)
WRITE_RETRY_COUNT = 0 (CEILING: 0)
AUTOMATIC_ROLLBACK_WRITES = 0 (CEILING: 0)
PARTIAL_WRITE = FALSE (Full deployment lifecycle completed to SUCCESS)
ZERO_WRITE_FAIL_CLOSED = ENFORCED

SCHEMA_WRITES = 0
PROCESS_WRITES = 0 (Process Management untouched; 19 states / 40 actions preserved)
RECORD_WRITES = 0
ACL_WRITES = 0
OTHER_APP_WRITES = 0
UAT = 0
PRODUCTION_CUTOVER = 0
FULL_REPOSITORY_INTEGRATION_TEST = NOT CLAIMED
```

## 3. Dist Artifact Identity Invariant (Zero Drift)
```text
JS_FILE = dist/mbo-employee-app.js
JS_GIT_BLOB_SHA = 6a29a0e652ab8bb210589583b2a2ebfa2754aafa (MATCHES INVARIANT EXACTLY)
JS_RAW_SHA256 = cc80a23fa1adcd71fd8eae1ba95d78faa0694115aa672937c97c009b77e31bf3
JS_BYTE_LENGTH = 640471

CSS_FILE = dist/mbo-employee.css
CSS_GIT_BLOB_SHA = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61 (MATCHES INVARIANT EXACTLY)
CSS_RAW_SHA256 = c0257969a6a040ae33e08ad001b8aa0944e844fb3fd2578ca041ecf9d19f58fd
CSS_BYTE_LENGTH = 43728

DIST_DRIFT = 0 BYTES / BIT-FOR-BIT IDENTICAL
CLASSIC_BUNDLE_PARSE = PASS
ES_MODULE_IMPORT_RESIDUE = 0
ES_MODULE_EXPORT_RESIDUE = 0
```

## 4. Fresh JIT Baselines & Process Preservation Checks

### A. Pre-Write Process Baseline
- Endpoint: `GET /k/v1/app/status.json?app=794` & `GET /k/v1/preview/app/status.json?app=794`
- Live Process: revision `72`, 19 states, 40 actions, semantic fingerprint `bc22d11c3f89959178d8c3aac1b2c008d1c13d93f815bae2b746f800c523fdbd`
- Preview Process: revision `73`, 19 states, 40 actions, semantic fingerprint `bc22d11c3f89959178d8c3aac1b2c008d1c13d93f815bae2b746f800c523fdbd`
- Status: PASS / Canonical 19-state / 40-action contract confirmed unchanged before writes.

### B. Pre-Write Customization Baseline
- Endpoint: `GET /k/v1/app/customize.json?app=794` & `GET /k/v1/preview/app/customize.json?app=794`
- Live Customization: revision `72`, scope `ALL`, desktop JS: 1 (`mbo-employee-app.js`), desktop CSS: 1 (`mbo-employee.css`), mobile JS: 0, mobile CSS: 0
- Preview Customization: revision `73`, scope `ALL`, desktop JS: 1 (`mbo-employee-app.js`), desktop CSS: 1 (`mbo-employee.css`), mobile JS: 0, mobile CSS: 0
- Topology Alignment: PASS / Topology matched manifest inputs.

### C. Post-Deployment Process Final Verification
- Endpoint: `GET /k/v1/app/status.json?app=794` & `GET /k/v1/preview/app/status.json?app=794`
- Live Process: revision `74`, 19 states, 40 actions, semantic fingerprint `bc22d11c3f89959178d8c3aac1b2c008d1c13d93f815bae2b746f800c523fdbd`
- Preview Process: revision `74`, 19 states, 40 actions, semantic fingerprint `bc22d11c3f89959178d8c3aac1b2c008d1c13d93f815bae2b746f800c523fdbd`
- Status: PASS / Exactly 19 states and 40 actions preserved bit-for-bit in semantic fingerprint across deployment.

## 5. Itemized Chronological Network Accounting

| Seq | Timestamp (UTC) | Method | Endpoint | Category | Status | Observed Return / Action |
|:---:|:---:|:---:|:---|:---|:---:|:---|
| 1 | 2026-09-13T08:45:11.265Z | GET | `/k/v1/app/status.json?app=794` | Process Baseline | 200 | Live process: rev 72, 19 states, 40 actions, matching fingerprint |
| 2 | 2026-09-13T08:45:11.828Z | GET | `/k/v1/preview/app/status.json?app=794` | Process Baseline | 200 | Preview process: rev 73, 19 states, 40 actions, matching fingerprint |
| 3 | 2026-09-13T08:45:12.369Z | GET | `/k/v1/app/customize.json?app=794` | Customization Preflight | 200 | Live customization: rev 72, scope ALL, desktop 1/1, mobile 0/0 |
| 4 | 2026-09-13T08:45:12.543Z | GET | `/k/v1/preview/app/customize.json?app=794` | Customization Preflight | 200 | Preview customization: rev 73, scope ALL, desktop 1/1, mobile 0/0 |
| 5 | 2026-09-13T08:45:12.736Z | POST | `/k/v1/file.json` | Artifact Upload | 200 | Uploaded `mbo-employee-app.js` (640,471 bytes); fileKey issued |
| 6 | 2026-09-13T08:45:13.533Z | POST | `/k/v1/file.json` | Artifact Upload | 200 | Uploaded `mbo-employee.css` (43,728 bytes); fileKey issued |
| 7 | 2026-09-13T08:45:13.880Z | PUT | `/k/v1/preview/app/customize.json` | Preview PUT | 200 | Preview customization updated; staged preview revision 74 |
| 8 | 2026-09-13T08:45:14.272Z | GET | `/k/v1/preview/app/customize.json?app=794` | Step 13 Preview Readback | 200 | Preview readback: rev 74, target JS & CSS attached |
| 9 | 2026-09-13T08:45:14.669Z | GET | `/k/v1/file.json?fileKey=[REDACTED]` | Step 13 Preview JS Download | 200 | Downloaded attached preview JS; 640,471 bytes / SHA-256 match |
| 10 | 2026-09-13T08:45:15.195Z | GET | `/k/v1/file.json?fileKey=[REDACTED]` | Step 13 Preview CSS Download | 200 | Downloaded attached preview CSS; 43,728 bytes / SHA-256 match |
| 11 | 2026-09-13T08:45:15.457Z | GET | `/k/v1/preview/app/customize.json?app=794` | Step 13 Preview Stability | 200 | Preview stability re-read: rev 74, keys & topology stable |
| 12 | 2026-09-13T08:45:15.633Z | POST | `/k/v1/preview/app/deploy.json` | Step 14 Deploy POST | 200 | Deploy POST dispatched: app 794, revision 74 |
| 13 | 2026-09-13T08:45:15.837Z | GET | `/k/v1/preview/app/deploy.json?apps[0]=794` | Step 15 Deploy Polling | 200 | Poll check 1: status = `PROCESSING` |
| 14 | 2026-09-13T08:45:17.532Z | GET | `/k/v1/preview/app/deploy.json?apps[0]=794` | Step 15 Deploy Polling | 200 | Poll check 2: status = `PROCESSING` |
| 15 | 2026-09-13T08:45:19.221Z | GET | `/k/v1/preview/app/deploy.json?apps[0]=794` | Step 15 Deploy Polling | 200 | Poll check 3: status = `SUCCESS` |
| 16 | 2026-09-13T08:45:19.391Z | GET | `/k/v1/app/customize.json?app=794` | Step 16 Final Convergence | 200 | Final Live customization metadata: rev 74, scope ALL |
| 17 | 2026-09-13T08:45:19.564Z | GET | `/k/v1/preview/app/customize.json?app=794` | Step 16 Final Convergence | 200 | Final Preview customization metadata: rev 74, scope ALL |
| 18 | 2026-09-13T08:45:19.732Z | GET | `/k/v1/file.json?fileKey=[REDACTED]` | Step 16 Live JS Download | 200 | Downloaded Live target JS; 640,471 bytes / SHA-256 match |
| 19 | 2026-09-13T08:45:20.241Z | GET | `/k/v1/file.json?fileKey=[REDACTED]` | Step 16 Live CSS Download | 200 | Downloaded Live target CSS; 43,728 bytes / SHA-256 match |
| 20 | 2026-09-13T08:45:20.428Z | GET | `/k/v1/file.json?fileKey=[REDACTED]` | Step 16 Preview JS Download | 200 | Downloaded Preview target JS; 640,471 bytes / SHA-256 match |
| 21 | 2026-09-13T08:45:20.776Z | GET | `/k/v1/file.json?fileKey=[REDACTED]` | Step 16 Preview CSS Download | 200 | Downloaded Preview target CSS; 43,728 bytes / SHA-256 match |
| 22 | 2026-09-13T08:45:20.966Z | GET | `/k/v1/app/customize.json?app=794` | Step 16 Live Stability | 200 | Live stability re-read: rev 74, keys & topology stable |
| 23 | 2026-09-13T08:45:21.148Z | GET | `/k/v1/preview/app/customize.json?app=794` | Step 16 Preview Stability | 200 | Preview stability re-read: rev 74, keys & topology stable |
| 24 | 2026-09-13T08:45:21.311Z | GET | `/k/v1/app/status.json?app=794` | Process Final Audit | 200 | Final Live process: rev 74, 19 states, 40 actions, matching fingerprint |
| 25 | 2026-09-13T08:45:21.503Z | GET | `/k/v1/preview/app/status.json?app=794` | Process Final Audit | 200 | Final Preview process: rev 74, 19 states, 40 actions, matching fingerprint |

## 6. Final Terminal State & Convergence Verification
```text
FINAL_LIVE_REVISION = 74
FINAL_PREVIEW_REVISION = 74
FINAL_CONVERGENCE = PASS / LIVE AND PREVIEW CONVERGED AT REVISION 74
FINAL_TOPOLOGY_HASH = 20a414c96d016ccd9a94a37f35aa0fa87ac636c07cc3b13cc5028e221bb99d35
FINAL_LIVE_SCOPE = ALL
FINAL_PREVIEW_SCOPE = ALL
LIVE_JS_BYTE_VERIFICATION = PASS (640,471 bytes, SHA-256 cc80a23fa1adcd71fd8eae1ba95d78faa0694115aa672937c97c009b77e31bf3)
LIVE_CSS_BYTE_VERIFICATION = PASS (43,728 bytes, SHA-256 c0257969a6a040ae33e08ad001b8aa0944e844fb3fd2578ca041ecf9d19f58fd)
PREVIEW_JS_BYTE_VERIFICATION = PASS (640,471 bytes, SHA-256 cc80a23fa1adcd71fd8eae1ba95d78faa0694115aa672937c97c009b77e31bf3)
PREVIEW_CSS_BYTE_VERIFICATION = PASS (43,728 bytes, SHA-256 c0257969a6a040ae33e08ad001b8aa0944e844fb3fd2578ca041ecf9d19f58fd)
SAME_SIDE_STABILITY_RECHECK = PASS (Zero drift in revision, fileKeys, or topology on both Live and Preview)
FINAL_LIVE_PROCESS_FINGERPRINT = bc22d11c3f89959178d8c3aac1b2c008d1c13d93f815bae2b746f800c523fdbd (19 states, 40 actions)
FINAL_PREVIEW_PROCESS_FINGERPRINT = bc22d11c3f89959178d8c3aac1b2c008d1c13d93f815bae2b746f800c523fdbd (19 states, 40 actions)
PROCESS_CONTRACT_PRESERVATION = PASS (19 states / 40 actions untouched across deployment)
PARTIAL_WRITE = FALSE
```

## 7. Pre-Execution Test Evidence (Targeted Regression)
- Command: `node --test tests/deploy-customization-preservation.test.js tests/sandbox-write-guard.test.js`
- `tests/deploy-customization-preservation.test.js`: 51 / 51 PASS
- `tests/sandbox-write-guard.test.js`: 7 / 7 PASS
- Total Targeted Tests: 58 / 58 PASS (0 fail, 0 cancelled, 0 skipped)
- Full Repository Integration Test: NOT CLAIMED

## 8. Historical Accounting Reconciliation
- Historical stop-condition compliance violation in Identity-01 (`STOP_CONDITION_COMPLIANCE = VIOLATED`) is retained.
- Historical live byte identity before EXE2 (`HISTORICAL_LIVE_BYTE_IDENTITY = UNVERIFIED`) is retained.
- Internal server-side rekeying mechanics remain qualified as `SERVER_REKEYING_MECHANISM = UNVERIFIED`.
- Historical EXE2 facts (partial-write halt before deploy POST at revision 72/73) are retained without rewrite.

## 9. Final Governance State
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
