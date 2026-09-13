# D3-SBX-DEPLOY-01-EXE2 Evidence Record

Updated: 2026-09-13 ICT

> [!NOTE]
> **Forward Correction & Qualification Notice (R1):**
> See [`D3_SBX_DEPLOY_01_EXE2_EVIDENCE_R1.md`](file:///C:/Users/allda/Desktop/Dev/git/MBO2026/project-docs/evidence/D3_SBX_DEPLOY_01_EXE2_EVIDENCE_R1.md) for full root-cause investigation, exhaustive itemized read accounting (11 total GET calls vs. 3 in-executor calls), qualification of the Kintone re-keying hypothesis, and content identity qualifications.

## 1. Package & Execution Metadata
```text
PACKAGE = D3-SBX-DEPLOY-01-EXE2
TITLE = APP794 UI CUSTOMIZATION SANDBOX DEPLOYMENT
AUTHORIZED_BASE_HEAD = 2a6a216481c80523cbc39064a6579b20fcc731d4
AUTHORIZED_BASE_PARENT = f7d8ecdedab15ca784944d3178725c3e26963015
AUTHORIZED_BASE_TREE = 5c4b8c4a15009a5e0ad7fcad84a77397f0608b26
AUTHORIZED_BASE_MESSAGE = fix(d3): correct local safety bypasses in app794 ui deploy contract (exe2-r2)
EXECUTION_HEAD = 2a6a216481c80523cbc39064a6579b20fcc731d4
EXECUTION_PLANE = ANTIGRAVITY
ORCHESTRATION_CHANNEL = HERMES / TELEGRAM
TARGET_APP = 794
COMPONENT = UI CUSTOMIZATION ONLY
ONE_SHOT_AUTHORIZATION_ID = MBO2026-D3-EXE2-20260913-OWNER-01
STATUS = STOPPED / PREVIEW_READBACK_MISMATCH / TARGET JS ATTACHED FILEKEY MISMATCH / PARTIAL WRITE HALTED BEFORE DEPLOY POST / REVIEW REQUIRED
```

## 2. Pre-Execution Control Plane & Test Accounting
```text
LATEST_ACCEPTED_CONTROL_PLANE_VERDICT = EXE2-R2 = PASS / INDEPENDENTLY REVIEWED / LOCAL CORRECTIVE ACCEPTED
EXECUTOR_TEST_EVIDENCE = 47/47 TARGETED TESTS PASS (tests/deploy-customization-preservation.test.js 40/40, tests/sandbox-write-guard.test.js 7/7)
CONTROL_PLANE_RERUN_LIMITATION = Guard tests 7/7 PASS; customization suite could not load on fresh checkout lacking esbuild devDependency
FULL_REPOSITORY_INTEGRATION_TEST = NOT CLAIMED
```

## 3. Dist Artifact Identity Invariant (Zero Drift)
```text
JS_FILE = dist/mbo-employee-app.js
JS_GIT_BLOB_SHA = 6a29a0e652ab8bb210589583b2a2ebfa2754aafa (MATCHES PINNED INVARIANT)

CSS_FILE = dist/mbo-employee.css
CSS_GIT_BLOB_SHA = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61 (MATCHES PINNED INVARIANT)

DIST_DRIFT = 0 BYTES / BIT-FOR-BIT IDENTICAL
CLASSIC_BUNDLE_PARSE = PASS
ES_MODULE_IMPORT_RESIDUE = 0
ES_MODULE_EXPORT_RESIDUE = 0
```

## 4. Fresh JIT Pre-Write Baseline
```text
JIT_BASELINE_CAPTURE_TIME = 2026-09-13 ICT
JIT_LIVE_REVISION = 72
JIT_PREVIEW_REVISION = 72
JIT_SCOPE = ALL
JIT_DESKTOP_JS_COUNT = 1 (mbo-employee-app.js)
JIT_DESKTOP_CSS_COUNT = 1 (mbo-employee.css)
JIT_MOBILE_JS_COUNT = 0
JIT_MOBILE_CSS_COUNT = 0
JIT_SANITIZED_LIVE_TOPOLOGY_HASH = 20a414c96d016ccd9a94a37f35aa0fa87ac636c07cc3b13cc5028e221bb99d35
JIT_SANITIZED_PREVIEW_TOPOLOGY_HASH = 20a414c96d016ccd9a94a37f35aa0fa87ac636c07cc3b13cc5028e221bb99d35
JIT_TOPOLOGY_ALIGNMENT = PASS
GIT_WORKING_TREE_PREFLIGHT = CLEAN
SOURCE_HEAD_PREFLIGHT = 2a6a216481c80523cbc39064a6579b20fcc731d4 (MATCH)
```

## 5. Operational Write Budget & Execution Accounting
```text
JS_UPLOADS_ATTEMPTED = 1
JS_UPLOADS_ACCEPTED = 1
CSS_UPLOADS_ATTEMPTED = 1
CSS_UPLOADS_ACCEPTED = 1
TOTAL_FILE_UPLOADS = 2
CUSTOMIZATION_PUT_ATTEMPTED = 1
CUSTOMIZATION_PUT_ACCEPTED = 1 (STAGED_PREVIEW_REVISION = 73)
DEPLOY_POST_ATTEMPTED = 0
DEPLOY_POST_ACCEPTED = 0
DEPLOY_STATUS_POLLS = 0
WRITE_RETRY_COUNT = 0
AUTOMATIC_ROLLBACK_WRITES = 0
PARTIAL_WRITE = TRUE (File uploads and Preview PUT accepted; Deploy POST blocked fail-closed before execution)
ZERO_WRITE_FAIL_CLOSED = ENFORCED_BEFORE_DEPLOY_POST
IN_EXECUTOR_READS = 3 (executeDeployCustomUi preflight [2] + preview readback [1])
AUXILIARY_SESSION_READS = 8 (Pre-exec manual JIT [4] + Post-stop diagnostics [4])
TOTAL_HISTORICAL_SESSION_READS = 11 (VERIFIED by transcript log; see R1 for itemized breakdown)
PROCESS_WRITES = 0 (App 794 Process 19/40 untouched)
SCHEMA_WRITES = 0
RECORD_WRITES = 0
ACL_WRITES = 0
OTHER_APP_WRITES = 0
UAT = 0
PRODUCTION_CUTOVER = 0
```

## 6. Execution Stop Diagnostic & Terminal State Verification
```text
STOP_REASON = PREVIEW_READBACK_MISMATCH: Target JS attached fileKey does not match newly uploaded JS key.
STOP_BOUNDARY = STEP_13_PREVIEW_READBACK_BEFORE_DEPLOY
DEPLOY_POST_EXECUTED = NO (0 calls)
FINAL_LIVE_REVISION = 72 (POST_STOP_LIVE_REOBSERVED / LIVE_CONTENT_IDENTITY_UNVERIFIED_BY_DOWNLOAD)
FINAL_PREVIEW_REVISION = 73 (POST_STOP_PREVIEW_REVERIFIED / ATTACHED_CONTENT_IDENTITY_UNVERIFIED)
FINAL_LIVE_SCOPE = ALL
FINAL_PREVIEW_SCOPE = ALL
FINAL_LIVE_TOPOLOGY_HASH = 20a414c96d016ccd9a94a37f35aa0fa87ac636c07cc3b13cc5028e221bb99d35
FINAL_PREVIEW_TOPOLOGY_HASH = 20a414c96d016ccd9a94a37f35aa0fa87ac636c07cc3b13cc5028e221bb99d35
FINAL_CONVERGENCE = NOT_REACHED (Deploy POST blocked fail-closed; LIVE remains at revision 72 while PREVIEW is at revision 73; topology hash verifies structure only, not content hash)
SANITIZED_TOPOLOGY_STRUCTURE:
{
  "scope": "ALL",
  "desktop": {
    "js": [{ "type": "FILE", "name": "mbo-employee-app.js" }],
    "css": [{ "type": "FILE", "name": "mbo-employee.css" }]
  },
  "mobile": {
    "js": [],
    "css": []
  }
}
```

## 7. Root Cause Analysis & Security Compliance
1. **Contract Execution**: Execution was triggered via canonical `executeDeployCustomUi()` without overrides. Working tree was clean and HEAD matched `2a6a216481c80523cbc39064a6579b20fcc731d4`.
2. **Artifact Preparation**: Canonical artifacts were built and strictly verified against pinned identities (`dist/mbo-employee-app.js` = `6a29a0e652ab8bb210589583b2a2ebfa2754aafa`, `dist/mbo-employee.css` = `0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61`).
3. **Preflight**: JIT baseline verified Live revision 72, Preview revision 72, scope ALL, topology aligned.
4. **Authorization & Uploads**: Single-use authorization `MBO2026-D3-EXE2-20260913-OWNER-01` was consumed at write boundary. JS and CSS were uploaded cleanly (1 attempt each, zero retry).
5. **Preview PUT**: `PUT /k/v1/preview/app/customize.json` was dispatched with captured revision 72 and new upload fileKeys. Kintone accepted the payload and staged preview revision 73.
6. **Preview Readback Guard Halt**: Step 13 read back preview customization (`GET /k/v1/preview/app/customize.json?app=794`). It is hypothesized that Kintone internal storage re-keys uploaded files upon preview PUT ingest (`REKEYING_HYPOTHESIS / UNVERIFIED`); a fileKey mismatch alone does not prove attached content identity or confirm server-side re-keying mechanism. Line 836 of `scripts/kintone/deploy-custom-ui.js` strictly checks `targetJsEntries[0].file?.fileKey === newJsFileKey`. Because Kintone's attached fileKey differed from the upload fileKey, `validatePreviewReadback` threw `PREVIEW_READBACK_MISMATCH: Target JS attached fileKey does not match newly uploaded JS key.` The strict guard failed closed as designed. Filename or topology alone does not suffice for identity.
7. **Strict Fail-Closed Stop**: The deploy POST was completely blocked. No retries, no automatic rollback writes, and zero mutations occurred on Live Sandbox App 794 (retained at revision 72). App 794 Process Management (19 states / 40 actions deployed in EXE1-R2) remains untouched.
8. **Credential & Secret Redaction**: Zero secrets, tokens, credentials, passwords, or raw fileKeys are exposed in this evidence record or committed files.

## 8. Readiness & Post-Delivery Boundary
```text
ACTIVE_WORK_PACKAGE = NONE
NEXT_GATE_AUTHORIZED = NO
AUTO_START_NEXT_WORK_PACKAGE = NO
KINTONE_READ_AUTHORIZED = NO
KINTONE_WRITE_AUTHORIZED = NO
DEPLOYMENT_AUTHORIZED = NO
UAT_AUTHORIZED = NO
PRODUCTION_READY = NO
REVIEW_REQUIRED = YES
```
