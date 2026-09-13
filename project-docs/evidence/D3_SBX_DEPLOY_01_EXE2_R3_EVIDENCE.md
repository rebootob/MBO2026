# D3-SBX-DEPLOY-01-EXE2-R3 Evidence Record

Updated: 2026-09-13 ICT

## 1. Package & Execution Metadata
```text
PACKAGE = D3-SBX-DEPLOY-01-EXE2-R3
TITLE = LOCAL TARGET CONTENT-IDENTITY CORRECTIVE
AUTHORIZATION_ID = MBO2026-D3-EXE2-R3-20260913-OWNER-01
AUTHORIZED_BASE_HEAD = e719261b7107b30582325ab4e6b451bdcf9be2c8
AUTHORIZED_BASE_PARENT = 703e0f875c45c5db8e6c1e820b11aa77fa8aac39
AUTHORIZED_BASE_TREE = 3741641c6d4427baa31a5cd1e113871b77a36504
AUTHORIZED_BASE_MESSAGE = docs(d3): clarify app794 ui customization identity stop chronology and live baseline (exe2-identity-01-r1)
EXECUTION_PLANE = ANTIGRAVITY
ORCHESTRATION_CHANNEL = HERMES / TELEGRAM
TARGET_APP = 794
COMPONENT = APP794 UI CUSTOMIZATION TARGET CONTENT-IDENTITY VERIFICATION
MODE = LOCAL SOURCE + TARGETED MOCK TESTS + CONTROL/EVIDENCE ONLY
STATUS = PASS / LOCAL TARGET CONTENT-IDENTITY CORRECTIVE COMPLETE / TARGETED TESTS PASS / ARTIFACT IDENTITY UNCHANGED / ZERO KINTONE I/O / ZERO DEPLOYMENT / REVIEW REQUIRED
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

## 4. Implementation Changes & Changed Files
- `scripts/kintone/deploy-custom-ui.js`:
  - Exported `formatSanitizedDownloadError(error, filename)`: redacts credentials, passwords, fileKeys, tokens, and cookies from download network error messages.
  - Exported `verifyTargetContentIdentity({ content, expectedSha256, expectedByteLength, targetFileName, location })`: verifies raw byte buffer SHA-256 and byte length against candidate/canonical release artifacts; throws fail-closed error upon any mismatch.
  - Exported `validatePreviewStability(initialPreview, stabilityPreview)`: verifies revision, attached target fileKeys, scope, and topology do not drift across preview content verification.
  - Exported `validateLiveStability(initialLive, stabilityLive)`: verifies revision, attached target fileKeys, scope, and topology do not drift across live content verification.
  - Updated `validatePreviewReadback`: replaced `fileKey === uploadKey` string equality assertion with target entry existence, valid non-empty string fileKey, scope, and retained entry preservation checks.
  - Updated `validateCustomizationConvergence`: replaced `liveKey === previewKey === uploadKey` string equality assertions with target entry existence, valid non-empty string fileKeys, scope, and retained entry preservation checks.
  - Updated `executeDeployCustomUi`:
    - Integrated pluggable `options.downloadFile` (defaulting to authenticated Kintone download) with sanitized error handling.
    - Step 13 (Preview Verification Before Deploy POST): downloads raw bytes for JS & CSS via attached preview keys (max 1 attempt each, zero retry), verifies SHA-256 and byte length against canonical release artifacts immediately upon receipt (failing closed before initiating subsequent downloads on mismatch), re-reads preview metadata to verify stability (revision, target fileKeys, topology) before deploy POST. Fail-closed before deploy POST if any verification fails.
    - Step 16 (Final Convergence Verification): downloads raw bytes for targets on BOTH Live and Preview (max 1 attempt each, zero retry), verifies SHA-256 and byte length on both Live and Preview against canonical release artifacts, and verifies post-download stability.
- `tests/deploy-customization-preservation.test.js`:
  - Updated `BLOCKER_D_PREVIEW_READBACK_BEFORE_DEPLOY`, `BLOCKER_F_FINAL_CONVERGENCE`, and `FULL_E2E_MOCK_EXECUTION` to reflect download-based byte identity verification and updated stability read counts.
  - Added test suite `TARGET_CONTENT_IDENTITY_VERIFICATION`: verifies differing fileKeys with matching byte/hash/size pass, while matching fileKeys with mismatched bytes fail closed.
  - Added test suite `PREVIEW_CONTENT_MISMATCH_INDEPENDENTLY_BLOCKS_DEPLOY_POST`: verifies Preview JS or CSS content mismatch independently causes deploy POST = 0 and halts further downloads immediately.
  - Added test suite `DOWNLOAD_ERROR_STOPS_WITH_ZERO_RETRY`: verifies preview JS or CSS download failure causes immediate fail-closed and deploy POST = 0 with sanitized errors.
  - Added test suite `PREVIEW_STABILITY_DRIFT_STOPS_BEFORE_DEPLOY_POST`: verifies revision, target fileKey, scope, or topology drift after download stops deploy POST with deploy POST = 0.
  - Added test suite `FINAL_CONVERGENCE_CONTENT_MISMATCH_OR_DRIFT_FAILS`: verifies Live or Preview byte mismatch or post-download stability drift causes convergence to fail closed.
  - Added test suite `DIFFERENT_FILEKEYS_WITH_MATCHING_BYTES_PASS_DEPLOYMENT`: verifies complete end-to-end deployment pass when upload, preview, and live fileKeys all differ while byte identity matches.

## 5. Blocker-to-Fix Mapping & Technical Resolution
```text
PREVIOUS BLOCKER:
- Deployment tooling in EXE2 failed closed at Step 13 because attached preview fileKey differed from uploadKey token.
- Platform behavior analysis (IDENTITY-01 and IDENTITY-01-R1) proved that Kintone platform assigns new server fileKeys upon upload, while the attached preview files resolve to exact canonical release bytes (SHA-256 cc80a23f... / 640,471 bytes JS, c0257969... / 43,728 bytes CSS).
- Asserting fileKey string equality was an erroneous implementation assumption that blocked valid deployment.

CORRECTIVE RESOLUTION (EXE2-R3):
1. Target Content-Identity Verification:
   - Raw byte buffer SHA-256 and byte length are verified directly against canonical release artifacts.
   - Distinct server fileKeys are accepted as valid platform behavior as long as byte identity matches canonical.
2. Immediate Fail-Closed on Mismatch:
   - Content verification runs immediately after each download; if JS byte identity fails, CSS download is skipped.
   - Zero deploy POST on preview content mismatch.
3. Post-Download Metadata Stability:
   - Re-reads metadata to ensure revision, attached target fileKeys, scope, and topology did not drift during verification.
4. Final Convergence Content Verification:
   - Both Live and Preview targets must resolve to exact canonical release bytes after deploy polling SUCCESS.
5. Strict Read Accounting & Ceilings:
   - Max 1 download attempt per target file, zero retry.
   - Step 13 reads: 1 preview readback GET + 2 downloads (JS, CSS) + 1 preview stability GET = 4 GETs max.
   - Step 16 reads: 1 live GET + 1 preview GET + 4 downloads (Live JS, Live CSS, Preview JS, Preview CSS) + 1 live stability GET = 7 GETs max.
```

## 6. Historical Governance Acceptance (Identity-01-R1 Findings)
```text
- STOP_CONDITION_COMPLIANCE = VIOLATED: Honestly documented for historical Identity-01 execution; script proceeded with 5 reads after Seq 3 buffer arrival and 2 reads after console comparison.
- HISTORICAL_LIVE_BYTE_IDENTITY = UNVERIFIED: Honestly documented due to lack of pre-EXE2 cryptographic hash baseline; no retroactive claims of LIVE byte immutability based solely on revision 72 metadata.
- PREVIEW_BYTE_IDENTITY = EMPIRICAL FINDING: Preview JS (640,471 bytes, SHA-256 cc80a23f...) and Preview CSS (43,728 bytes, SHA-256 c0257969...) match canonical artifacts bit-for-bit without overriding package governance verdict.
- SERVER_REKEYING_MECHANISM = UNVERIFIED PLATFORM BEHAVIOR: Empirical token resolution observed; internal server mechanics not proven.
```

## 7. Test Accounting & Verification
- Command: `node --test tests/deploy-customization-preservation.test.js tests/sandbox-write-guard.test.js`
- `tests/deploy-customization-preservation.test.js`: 46 / 46 PASS
- `tests/sandbox-write-guard.test.js`: 7 / 7 PASS
- **Total Targeted Tests:** 53 / 53 PASS (0 FAIL, 0 CANCELLED, 0 SKIPPED)
- **Full Repository Integration Test:** NOT CLAIMED

## 8. Project & Readiness State
```text
ACTIVE_WORK_PACKAGE = NONE
NEXT_GATE_AUTHORIZED = NO
AUTO_START_NEXT_WORK_PACKAGE = NO
KINTONE_READ_AUTHORIZED = NO
KINTONE_WRITE_AUTHORIZED = NO
PROCESS_WRITE_AUTHORIZED = NO
DEPLOYMENT_AUTHORIZED = NO
UAT_AUTHORIZED = NO
PRODUCTION_READY = NO
```
