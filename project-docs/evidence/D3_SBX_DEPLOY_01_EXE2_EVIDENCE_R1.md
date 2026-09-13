# D3-SBX-DEPLOY-01-EXE2-EVIDENCE-R1 Evidence Record
## Local Evidence Clarification: Root-Cause Investigation, Exhaustive Read Accounting, and Content Identity Qualification

Updated: 2026-09-13 ICT

---

## 1. Package & Governance Metadata

```text
PACKAGE = D3-SBX-DEPLOY-01-EXE2-EVIDENCE-R1
TITLE = LOCAL EVIDENCE CLARIFICATION
MODE = EXISTING LOCAL EVIDENCE + DOCS ONLY
AUTHORIZED_BASE_HEAD = 8b436f03c52c791a01200952c3b2e0611b7e1b82
AUTHORIZED_BASE_PARENT = 2a6a216481c80523cbc39064a6579b20fcc731d4
AUTHORIZED_BASE_TREE = dcd27eaf75b03b5a722c691fc0af1891e79696cc
AUTHORIZED_BASE_MESSAGE = docs(d3): record app794 ui customization deploy execution stop and partial-write state (exe2)
EXECUTION_PLANE = ANTIGRAVITY
ORCHESTRATION_CHANNEL = HERMES / TELEGRAM
TARGET_APP = 794
COMPONENT = UI CUSTOMIZATION EVIDENCE ONLY
STATUS = PASS / LOCAL EVIDENCE CLARIFICATION COMPLETE / REVIEW REQUIRED
```

### New Package Operational Counters (Docs-Only R1)
```text
KINTONE_READS = 0
KINTONE_WRITES = 0
FILE_UPLOADS = 0
CUSTOMIZATION_PUTS = 0
DEPLOY_POSTS = 0
LIVE_POLLS = 0
SOURCE_TEST_CHANGES = 0
PROCESS_WRITES = 0
SCHEMA_WRITES = 0
RECORD_WRITES = 0
ACL_WRITES = 0
UAT = 0
PRODUCTION_CUTOVER = 0
FULL_REPOSITORY_INTEGRATION_TEST = NOT CLAIMED
```
*(No builds, no tests rerun, no network or API calls executed in this package.)*

---

## 2. Preserved Historical Facts from EXE2 Execution

The factual state established during `D3-SBX-DEPLOY-01-EXE2` is preserved without alteration:
- **Authorization ID**: `MBO2026-D3-EXE2-20260913-OWNER-01` was consumed at the write boundary of EXE2 and is **NOT reused**.
- **JS upload**: 1 accepted (`POST /k/v1/file.json` returning upload fileKey).
- **CSS upload**: 1 accepted (`POST /k/v1/file.json` returning upload fileKey).
- **Preview PUT**: 1 accepted (`PUT /k/v1/preview/app/customize.json` with revision 72 accepted; staged preview revision 73).
- **Deploy POST**: 0 calls (halted fail-closed before POST invocation).
- **Write retries**: 0.
- **Automatic rollback writes**: 0.
- **PARTIAL_WRITE**: `TRUE` (Uploads and Preview PUT succeeded; Live deployment not executed).
- **DEPLOYMENT**: `NOT COMPLETED`.
- **Process Management**: App 794 Process 19/40 (deployed in EXE1-R2) remains untouched.

---

## 3. Exhaustive Itemized Read Accounting for Historical EXE2

The previous record (`D3_SBX_DEPLOY_01_EXE2_EVIDENCE.md`) reported `KINTONE_READS = 3`, which accounted only for the 3 reads executed internally within `executeDeployCustomUi()`. A complete audit of the execution transcript (`d4106588-ccd3-47ef-aaab-a9c2f9fa70a5`) reveals an aggregate total of **11 Kintone GET read calls** executed across the EXE2 session:
- **In-executor reads**: 3 calls
- **Pre-execution auxiliary reads**: 4 calls
- **Post-stop auxiliary/verification reads**: 4 calls

### Detailed Chronological Breakdown of Historical EXE2 Reads

| Seq | Transcript Step | Timestamp (UTC) | Endpoint | Category | Purpose & Observed Return |
|:---:|:---:|:---:|:---|:---|:---|
| 1 | Step 63 | 2026-09-13T00:09:42Z | `GET /k/v1/app/customize.json?app=794` | Auxiliary (Pre-exec) | Manual JIT baseline inspection: observed `revision: 72`, `scope: ALL`, desktop JS: 1, desktop CSS: 1. |
| 2 | Step 63 | 2026-09-13T00:09:42Z | `GET /k/v1/preview/app/customize.json?app=794` | Auxiliary (Pre-exec) | Manual JIT baseline inspection: observed `revision: 72`, `scope: ALL`, desktop JS: 1, desktop CSS: 1. |
| 3 | Step 65 | 2026-09-13T00:09:55Z | `GET /k/v1/app/customize.json?app=794` | Auxiliary (Pre-exec) | Manual topology hash computation: live topology hash `20a414c96d...`. |
| 4 | Step 65 | 2026-09-13T00:09:55Z | `GET /k/v1/preview/app/customize.json?app=794` | Auxiliary (Pre-exec) | Manual topology hash computation: preview topology hash `20a414c96d...`. |
| 5 | Step 69 (Script Step 7) | 2026-09-13T00:10:10Z | `GET /k/v1/app/customize.json?app=794` | In-executor | Internal preflight check inside `executeDeployCustomUi`: live baseline `revision: 72`. |
| 6 | Step 69 (Script Step 7) | 2026-09-13T00:10:10Z | `GET /k/v1/preview/app/customize.json?app=794` | In-executor | Internal preflight check inside `executeDeployCustomUi`: preview baseline `revision: 72`. |
| 7 | Step 69 (Script Step 13) | 2026-09-13T00:10:12Z | `GET /k/v1/preview/app/customize.json?app=794` | In-executor | Preview read-back verification after PUT: observed `revision: 73`. Halted fail-closed on attached fileKey mismatch. |
| 8 | Step 71 | 2026-09-13T00:10:19Z | `GET /k/v1/preview/app/customize.json?app=794` | Auxiliary (Post-stop) | Diagnostic inspection: confirmed `revision: 73`, desktop JS length 1 (`hasFileKey: true`, length 49), desktop CSS length 1 (`hasFileKey: true`, length 49). |
| 9 | Step 73 | 2026-09-13T00:10:26Z | `GET /k/v1/app/customize.json?app=794` | Auxiliary (Post-stop) | Live status inspection: confirmed `revision: 72`, `scope: ALL`, desktop JS: 1 (`mbo-employee-app.js`), desktop CSS: 1 (`mbo-employee.css`). |
| 10 | Step 75 | 2026-09-13T00:10:31Z | `GET /k/v1/app/customize.json?app=794` | Auxiliary (Post-stop) | Post-stop topology check: confirmed live `revision: 72`, sanitized live hash `20a414c96d...`. |
| 11 | Step 75 | 2026-09-13T00:10:31Z | `GET /k/v1/preview/app/customize.json?app=794` | Auxiliary (Post-stop) | Post-stop topology check: confirmed preview `revision: 73`, sanitized preview hash `20a414c96d...`. |

### Summary of Historical EXE2 Read Counts
```text
IN_EXECUTOR_READS = 3 (executeDeployCustomUi preflight [2] + preview read-back [1])
AUXILIARY_PRE_EXECUTION_READS = 4 (Step 63 [2] + Step 65 [2])
AUXILIARY_POST_STOP_READS = 4 (Step 71 [1] + Step 73 [1] + Step 75 [2])
TOTAL_HISTORICAL_EXE2_KINTONE_READS = 11
TOTAL_READ_ACCOUNTING = VERIFIED (Exhaustively proven by step-by-step transcript logs)
```

### Provenance of Terminal Revisions
- **FINAL_PREVIEW_REVISION = 73**:
  - Origin: Staged by `PUT /k/v1/preview/app/customize.json` in Step 69.
  - Verification: Read back in Step 69 (Seq 7), diagnostic re-read in Step 71 (Seq 8, rev 73), and post-stop verification in Step 75 (Seq 11, rev 73).
  - Provenance: `POST_STOP_PREVIEW_REVERIFIED` (Revision 73).
- **FINAL_LIVE_REVISION = 72**:
  - Origin: Baseline revision prior to execution (observed in Seqs 1, 3, 5).
  - Verification: Re-observed post-stop via dedicated `GET /k/v1/app/customize.json?app=794` calls in Step 73 (Seq 9, rev 72) and Step 75 (Seq 10, rev 72).
  - Provenance: `POST_STOP_LIVE_REOBSERVED_REVISION_72` (Live revision confirmed unchanged at 72 post-stop; deploy POST was never dispatched). Note that while revision 72 is re-observed, live content bytes were not downloaded.

---

## 4. FileKey Mismatch Investigation & Root-Cause Qualification

### Separation of Observed Fact from Hypothesis

1. **Observed Facts**:
   - Step 69 uploaded candidate files via `POST /k/v1/file.json`:
     - JS file `mbo-employee-app.js` uploaded successfully, returning a string upload key (`uploadJsKey`).
     - CSS file `mbo-employee.css` uploaded successfully, returning a string upload key (`uploadCssKey`).
   - The PUT payload (`buildPreviewCustomizePayload`) substituted `uploadJsKey` into `desktop.js[0].file.fileKey` and `uploadCssKey` into `desktop.css[0].file.fileKey`.
   - Kintone accepted the PUT request with HTTP 200, updating the preview customization.
   - Step 13 read back preview customization (`GET /k/v1/preview/app/customize.json?app=794`).
   - In `validatePreviewReadback` (lines 835–837 of `scripts/kintone/deploy-custom-ui.js`):
     ```javascript
     if (newJsFileKey && targetJsEntries[0].file?.fileKey !== newJsFileKey) {
       throw new Error('PREVIEW_READBACK_MISMATCH: Target JS attached fileKey does not match newly uploaded JS key.');
     }
     ```
     The equality condition `targetJsEntries[0].file?.fileKey === newJsFileKey` evaluated to **`false`**.
   - In Step 71 diagnostic output, the attached file keys were confirmed to exist and be non-empty strings of length 49:
     - `jsEntry.file.fileKey`: length 49, `hasFileKey: true`
     - `cssEntry.file.fileKey`: length 49, `hasFileKey: true`
   - Raw file keys were never logged or committed, preserving secret redaction.

2. **Sanitized Comparison (Zero Secret Exposure)**:
   ```text
   UPLOAD_JS_FILEKEY_PRESENT = TRUE
   ATTACHED_PREVIEW_JS_FILEKEY_PRESENT = TRUE
   UPLOAD_JS_FILEKEY_LENGTH = 49 characters (sanitized)
   ATTACHED_PREVIEW_JS_FILEKEY_LENGTH = 49 characters (sanitized)
   KEYS_STRICT_EQUAL = FALSE
   ```

3. **Classification of Root Cause**:
   - **Status**: `REKEYING_HYPOTHESIS / UNVERIFIED`.
   - **Rationale**: While it is hypothesized that Kintone internal storage re-keys uploaded files upon PUT ingest (assigning an internal storage reference rather than echoing the temporary `POST /k/v1/file.json` upload token), a `fileKey` string inequality alone does **not** prove attached content identity or confirm the server-side mechanism.
   - Because no attached file bytes were downloaded and compared with the local candidate build, the root cause cannot be stated as proven fact. It remains an unverified hypothesis.

4. **Safety Invariant on Guard Enforcement**:
   - The strict check in `validatePreviewReadback` functioned exactly as designed: detecting any divergence from expectation and halting execution fail-closed **before** invoking `POST /k/v1/preview/app/deploy.json`.
   - The guard must **never** be weakened, nor should filename or topology alone be accepted as proof of content identity.

---

## 5. Content Identity & Convergence Verification

### Candidate vs. Staged vs. Live Content Accounting

1. **LOCAL_CANDIDATE_IDENTITY: VERIFIED**
   - Candidate artifacts built from authorized base `2a6a216481c80523cbc39064a6579b20fcc731d4`:
     - `dist/mbo-employee-app.js`: Git blob SHA `6a29a0e652ab8bb210589583b2a2ebfa2754aafa` (bit-for-bit identical with pinned invariant).
     - `dist/mbo-employee.css`: Git blob SHA `0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61` (bit-for-bit identical with pinned invariant).
   - Classic bundle parse passes cleanly; zero ES module import/export residue.

2. **PREVIEW_ATTACHED_CONTENT_IDENTITY: ATTACHED_CONTENT_IDENTITY_UNVERIFIED**
   - The bytes of the staged preview files were not downloaded from Kintone during EXE2.
   - Read-back GET calls returned only metadata (`type`, `name`, `fileKey`), not the file payload or byte digest.
   - In the absence of downloaded bytes, attached content identity cannot be verified.

3. **LIVE_CONTENT_IDENTITY: UNVERIFIED_BY_DOWNLOAD**
   - Live Sandbox App 794 was re-observed at revision 72 post-stop (Steps 73 and 75).
   - Deploy POST was not executed (0 calls).
   - Zero live mutations were made.
   - However, live attached files were not downloaded in EXE2 to compute content digests. Therefore, live content is verified as unmutated at the revision level, but is qualified as `UNVERIFIED_BY_DOWNLOAD` at the content byte level.

4. **Topology Hash vs. Content Hash Distinction**:
   - Sanitized topology hash: `20a414c96d016ccd9a94a37f35aa0fa87ac636c07cc3b13cc5028e221bb99d35`.
   - **Scope of topology hash**: Verifies only the structure `{ scope: "ALL", desktop: { js: [{ type: "FILE", name: "mbo-employee-app.js" }], css: [{ type: "FILE", name: "mbo-employee.css" }] }, mobile: { js: [], css: [] } }`.
   - **Limitation**: The topology hash does **not** hash file content, digest, or code bytes. Topology equality does not prove content equality.

5. **Final Convergence Status**:
   - `FINAL_CONVERGENCE = NOT_REACHED`.
   - Execution stopped before deploy POST; Live App 794 remains at revision 72 while Preview is staged at revision 73.

---

## 6. Audit, Security & Redaction

- **Secret Redaction**: Zero API tokens, passwords, raw fileKey values, or sensitive environment variables are exposed in this record or the repository.
- **Git History Integrity**: No rebase, reset, or force push. All changes are committed forward-only.

---

## 7. Post-Delivery Control Boundary

```text
ACTIVE_WORK_PACKAGE = NONE
ACTIVE_WORK_PACKAGE_STATUS = NONE / D3-SBX-DEPLOY-01-EXE2-EVIDENCE-R1 CLOSED
LAST_ATTEMPTED_PACKAGE = D3-SBX-DEPLOY-01-EXE2-EVIDENCE-R1
LAST_CLOSED_CONTROL_PACKAGE = D3-SBX-DEPLOY-01-EXE2-EVIDENCE-R1
NEXT_GATE_AUTHORIZED = NO
AUTO_START_NEXT_WORK_PACKAGE = NO
KINTONE_READ_AUTHORIZED = NO
KINTONE_WRITE_AUTHORIZED = NO
DEPLOYMENT_AUTHORIZED = NO
UAT_AUTHORIZED = NO
PRODUCTION_READY = NO
REVIEW_REQUIRED = YES
```
