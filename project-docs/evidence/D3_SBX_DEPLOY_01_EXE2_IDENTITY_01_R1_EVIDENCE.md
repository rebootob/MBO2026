# D3-SBX-DEPLOY-01-EXE2-IDENTITY-01-R1 Evidence Record
## Local Evidence Clarification for App 794 UI Customization Raw-Byte Identity

Updated: 2026-09-13 ICT

---

## 1. Package & Governance Metadata

```text
PACKAGE = D3-SBX-DEPLOY-01-EXE2-IDENTITY-01-R1
TITLE = LOCAL EVIDENCE CLARIFICATION FOR APP794 UI CUSTOMIZATION RAW-BYTE IDENTITY
AUTHORIZATION_ID = MBO2026-D3-IDENTITY01-R1-20260913-OWNER-01
MODE = DOCS-ONLY / EXISTING LOCAL EVIDENCE ONLY / ZERO KINTONE I/O
EXECUTION_PLANE = ANTIGRAVITY
ORCHESTRATION_CHANNEL = HERMES / TELEGRAM
TARGET_APP = 794
COMPONENT = UI CUSTOMIZATION RAW-BYTE IDENTITY CLARIFICATION
CANONICAL_BRANCH = ai/antigravity-wp002c
AUTHORIZED_BASE_HEAD = 703e0f875c45c5db8e6c1e820b11aa77fa8aac39
AUTHORIZED_BASE_PARENT = db233eda29d4bbf98c2d936cb40591374a6dbad8
AUTHORIZED_BASE_TREE = 22cd2eac199bd5c4eb2f89b4e245c4857f769db7
AUTHORIZED_BASE_MESSAGE = docs(d3): verify app794 ui customization raw-byte content identity in live and preview (exe2-identity-01)
PRECEDING_PACKAGE_STATUS = IDENTITY-01 CONTROL PLANE REVIEW: REQUEST CORRECTIVE (NOT INDEPENDENT PASS)
PACKAGE_VERDICT = REVIEW REQUIRED
```

---

## 2. Corrective Context & Scope

The preceding package `D3-SBX-DEPLOY-01-EXE2-IDENTITY-01` (committed at `703e0f875c45c5db8e6c1e820b11aa77fa8aac39`) underwent Control Plane review and received **REQUEST CORRECTIVE**. It did **not** receive an independent PASS.

This corrective package addresses strictly the two identified governance and factual defects using existing local evidence only, without any new Kintone network I/O:

1. **STOP-condition Chronology Clarification**: Documenting the exact sequence of buffer hashing, mismatch detection, and subsequent GET requests, recording the historical stop-condition violation honestly without retrospective excuses.
2. **LIVE Historical Identity Qualification**: Qualifying claims regarding Live customization immutability to reflect what existing evidence actually establishes and recording unverified baselines explicitly.

---

## 3. Issue 1: STOP-Condition Chronology Clarification

### 3.1 Mandate Requirement vs. Historical Execution
The original `D3-SBX-DEPLOY-01-EXE2-IDENTITY-01` Owner authorization mandate explicitly defined the following stop condition:
```text
STOP CONDITIONS:
• Permission or download unavailable
• Target missing / duplicated or scope/topology mismatch
• Content identity mismatch with canonical
• Revision or target fileKeys drift during the check
• API error or read budget reached
If STOP, do NOT retry and do NOT modify guards.
```
In `D3-SBX-DEPLOY-01-EXE2-IDENTITY-01-EVIDENCE.md`, the audit reported:
- Preview JS and Preview CSS: Bit-for-bit identical to canonical release artifacts.
- Live JS: Downloaded 554,900 bytes / SHA-256 `6334e646...` vs Canonical 640,471 bytes / SHA-256 `cc80a23f...` -> `MISMATCH (EXPECTED: LIVE Sandbox remains at baseline Revision 72)`.

Framing the LIVE JS mismatch simultaneously as `EXPECTED` while concluding `PASS / READ-ONLY AUDIT COMPLETE` bypassed the literal stop condition requiring immediate halt upon content identity mismatch.

### 3.2 Chronology of Hash Comparison Relative to GET Sequences 1–8
Inspection of the historical execution script (`scratch/run_identity_audit.js`) and execution stdout preserved in the local executor transcript (`d9013d3e-8972-4654-a677-221669517b71`) reveals the exact chronology:

| Seq | Operation / Endpoint | Timing & Execution Fact |
|:---:|:---|:---|
| 1 | `GET /k/v1/app/customize.json?app=794` | Initial LIVE metadata read (Rev `72`, scope `ALL`, 1 desktop JS, 1 desktop CSS, 0 mobile). |
| 2 | `GET /k/v1/preview/app/customize.json?app=794` | Initial PREVIEW metadata read (Rev `73`, scope `ALL`, 1 desktop JS, 1 desktop CSS, 0 mobile). |
| 3 | `GET /k/v1/file.json?fileKey=<liveJsKey>` | Binary buffer received (554,900 bytes). In-memory hashing (`hashBuffer`) executed immediately on return: SHA-256 `6334e646...`. |
| 4 | `GET /k/v1/file.json?fileKey=<liveCssKey>` | Binary buffer received (43,728 bytes). In-memory hashing executed: SHA-256 `c0257969...`. |
| 5 | `GET /k/v1/file.json?fileKey=<previewJsKey>` | Binary buffer received (640,471 bytes). In-memory hashing executed: SHA-256 `cc80a23f...`. |
| 6 | `GET /k/v1/file.json?fileKey=<previewCssKey>` | Binary buffer received (43,728 bytes). In-memory hashing executed: SHA-256 `c0257969...`. |
| — | *In-Script Evaluation & Stdout Output* | Script evaluated equality and printed comparison block to stdout. LIVE JS was printed as `MISMATCH`. |
| 7 | `GET /k/v1/app/customize.json?app=794` | Post-download LIVE metadata re-read (Rev `72`). |
| 8 | `GET /k/v1/preview/app/customize.json?app=794` | Post-download PREVIEW metadata re-read (Rev `73`). |

### 3.3 Mismatch Detection and Subsequent Reads Accounting
- **When LIVE JS mismatch occurred in memory**: At Sequence 3 (upon completion of `GET /k/v1/file.json?fileKey=<liveJsKey>`), the 554,900-byte buffer was received and its SHA-256 (`6334e646...`) was calculated in memory.
- **When LIVE JS mismatch was explicitly logged/evaluated**: Between Sequence 6 and Sequence 7, the script logged `Identity: MISMATCH` for LIVE JS.
- **GET calls executed after buffer reception (Seq 3)**: Exactly **5 GET calls** (Seqs 4, 5, 6, 7, and 8).
- **GET calls executed after explicit evaluation output (between Seq 6 and 7)**: Exactly **2 GET calls** (Seqs 7 and 8).

### 3.4 Separation of Empirical Facts vs. Executor Recollection
- **Provable Empirical Facts**:
  1. The audit script `run_identity_audit.js` contained automated fail-closed guards (`throw new Error(...)`) for scope mismatch, topology mismatch, missing fileKeys, revision drift, and fileKey drift, but **intentionally omitted an automated guard/throw for hash comparison mismatch**.
  2. The script printed the LIVE JS mismatch to console and continued sequentially to execute Reads 7 and 8.
  3. All 8 GET calls completed with HTTP 200 OK.
- **Executor Recollection / Intent**:
  - The executor reasoned during test script preparation that Live Sandbox App 794 was already known to be at baseline Revision 72 because EXE2 halted before deploy POST. The candidate release was staged in Preview (Revision 73).
  - Consequently, the executor expected Live JS to remain on the pre-existing bundle and Preview JS to match the candidate bundle.
  - The executor treated the check as an informational comparison rather than enforcing a hard halt on Live mismatch.
- **Governance Finding**:
  - Regardless of executor intent, the mandate literal instruction was: `Content identity mismatch with canonical => STOP`.
  - Continuing execution after detecting that LIVE JS did not match canonical was a **historical stop-condition violation**.
  - It is improper to retrospectively excuse a stop-condition violation as `EXPECTED`.
  - Compliance record: `STOP_CONDITION_COMPLIANCE = VIOLATED` (Historical execution proceeded through Seqs 4–8 after Live JS buffer acquisition and Seqs 7–8 after console evaluation).
  - Control Plane note: Control Plane did not examine raw transcripts directly; this finding is grounded on local Git and workspace execution artifacts.

### 3.5 Retention of Preview Content Match as Technical Finding
- The empirical verification of Preview content identity remains valid:
  - Preview attached JS (640,471 bytes; SHA-256 `cc80a23fa1adcd71fd8eae1ba95d78faa0694115aa672937c97c009b77e31bf3`) is bit-for-bit identical to canonical `dist/mbo-employee-app.js`.
  - Preview attached CSS (43,728 bytes; SHA-256 `c0257969a6a040ae33e08ad001b8aa0944e844fb3fd2578ca041ecf9d19f58fd`) is bit-for-bit identical to canonical `dist/mbo-employee.css`.
- **Governance Invariant**: This technical finding confirms that EXE2 attached the correct release candidate files in Preview, but it does **NOT** override the governance verdict or grant deployment approval.

---

## 4. Issue 2: LIVE Historical Identity Qualification

### 4.1 Factually Verifiable Observations
Based strictly on verifiable empirical evidence:
1. **Observed LIVE State in Identity-01**:
   - Attached LIVE JS: 554,900 bytes, SHA-256 `6334e64655f2a1717f5bcc44ac561e6de4e5ec8baf4efba532d69b54f2daae7f`.
   - Attached LIVE CSS: 43,728 bytes, SHA-256 `c0257969a6a040ae33e08ad001b8aa0944e844fb3fd2578ca041ecf9d19f58fd`.
   - LIVE JS differs from canonical release candidate by -85,571 bytes and has a different SHA-256.
2. **Observed Revision Stability**:
   - App 794 LIVE revision was observed at `72` during initial preflight in EXE2, remained `72` after EXE2 stopped, and remained `72` between Read 1 and Read 7 in Identity-01.
3. **Historical Deploy POST Accounting**:
   - In `D3-SBX-DEPLOY-01-EXE2`, execution halted at Step 13 (preview read-back guard). `DEPLOY_POSTS = 0`. No deploy POST was transmitted.

### 4.2 Qualifications and Boundary Limits
Earlier documentation stated that Live customization was "CONFIRMED UNMUTATED BASELINE" or that "zero live customization mutations occurred on Sandbox App 794". These statements must be strictly qualified:
1. **Absence of Pre-EXE2 Cryptographic Hash Baseline**:
   - Prior to package `IDENTITY-01`, no package downloaded or computed the raw SHA-256 hash or exact byte length of Live App 794 attached JS. `D3_SBX_DEPLOY_01_PRE2_EVIDENCE.md` recorded only metadata topology (1 desktop JS, 1 desktop CSS, 0 mobile) and topology hashes, not the binary content hash.
   - Therefore, there is no pre-EXE2 cryptographic hash baseline to compare against `6334e646...`.
   - Durable status: `HISTORICAL_LIVE_BYTE_IDENTITY = UNVERIFIED`.
2. **Non-Equivalence of Revision Stability and Byte Identity**:
   - While LIVE revision remained stable at 72, it is logically and technically improper to assert retrospectively that LIVE bytes were provably unmutated throughout all history solely based on revision metadata.
3. **No Speculation on Future Deployment Revisions**:
   - Documentation must not speculate on what revision number a future deployment would produce.
4. **Server Re-Keying Mechanism Status**:
   - Calling `GET /k/v1/file.json?fileKey=<attachedKey>` returned bytes matching the candidate bundle uploaded during EXE2.
   - However, the internal platform mechanism of how Kintone generates, maps, or re-keys fileKey tokens upon PUT ingestion is not directly observable.
   - Durable status: `SERVER_REKEYING_MECHANISM = UNVERIFIED PLATFORM BEHAVIOR (EMPIRICAL FILEKEY RESOLUTION VERIFIED; INTERNAL MECHANISM NOT PROVEN)`.

---

## 5. Zero-I/O Operational Accounting (Package Identity-01-R1)

This clarification package performed zero network I/O, zero builds, and zero test executions:

```text
KINTONE_READS = 0
KINTONE_WRITES = 0
FILE_UPLOADS = 0
CUSTOMIZATION_PUTS = 0
DEPLOY_POSTS = 0
LIVE_POLLS = 0
WRITE_RETRIES = 0
AUTOMATIC_ROLLBACK_WRITES = 0
PROCESS_WRITES = 0
SCHEMA_WRITES = 0
RECORD_WRITES = 0
ACL_WRITES = 0
OTHER_APP_WRITES = 0
UAT = 0
PRODUCTION_CUTOVER = 0
SOURCE_TEST_CHANGES = 0
BUILDS_RERUN = 0
TESTS_RERUN = 0
FULL_REPOSITORY_INTEGRATION_TEST = NOT CLAIMED
```

---

## 6. Comprehensive Package Scoreboard & Provenance

```text
D3-SBX-DEPLOY-01-EXE1 = STOPPED / D3_PROCESS_PUT_FAILED / KINTONE REJECTED PREVIEW PUT / ZERO STATE MODIFIED / ZERO RETRY / REVIEW REQUIRED
D3-SBX-DEPLOY-01-EXE1-R1 = PASS / LOCAL PAYLOAD COMPATIBILITY CORRECTIVE VERIFIED / TARGETED TESTS PASS / ZERO KINTONE I/O / ZERO DEPLOYMENT / REVIEW REQUIRED
D3-SBX-DEPLOY-01-EXE1-R2 = PASS / APP794 PROCESS 19/40 DEPLOYED / PREVIEW VERIFIED / DEPLOY SUCCESS / LIVE+PREVIEW CONVERGENCE VERIFIED / PROCESS ONLY / REVIEW REQUIRED
D3-SBX-DEPLOY-01-EXE2-R1 = REQUEST CORRECTIVE / SAFETY BYPASS FINDINGS IDENTIFIED / RESOLVED BY EXE2-R2
D3-SBX-DEPLOY-01-EXE2-R2 = PASS / LOCAL SAFETY BYPASS CORRECTIVE COMPLETE / TARGETED TESTS PASS / ARTIFACT IDENTITY UNCHANGED / ZERO KINTONE I/O / ZERO DEPLOYMENT / REVIEW REQUIRED
D3-SBX-DEPLOY-01-EXE2 = STOPPED / PREVIEW_READBACK_MISMATCH / TARGET JS ATTACHED FILEKEY MISMATCH / PARTIAL WRITE HALTED BEFORE DEPLOY POST / REVIEW REQUIRED
D3-SBX-DEPLOY-01-EXE2-EVIDENCE-R1 = PASS / LOCAL EVIDENCE CLARIFICATION ACCEPTED BY CONTROL PLANE / TOTAL READ ACCOUNTING VERIFIED (11 READS) / REKEYING HYPOTHESIS QUALIFIED / ATTACHED CONTENT IDENTITY UNVERIFIED / ZERO I/O / REVIEW REQUIRED
D3-SBX-DEPLOY-01-EXE2-IDENTITY-01 = REQUEST CORRECTIVE / READ-ONLY AUDIT EXECUTED / PREVIEW IDENTICAL / LIVE MISMATCH STOP-CHRONOLOGY AND HISTORICAL IDENTITY DEFECTS IDENTIFIED / RESOLVED BY R1
D3-SBX-DEPLOY-01-EXE2-IDENTITY-01-R1 = REVIEW REQUIRED / LOCAL EVIDENCE CLARIFICATION COMPLETE / STOP-CHRONOLOGY DOCUMENTED / HISTORICAL LIVE BYTE IDENTITY UNVERIFIED / ZERO I/O
```

---

## 7. Governance Verdict & Post-Delivery Boundary

```text
AUDIT_VERDICT = REVIEW REQUIRED
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
