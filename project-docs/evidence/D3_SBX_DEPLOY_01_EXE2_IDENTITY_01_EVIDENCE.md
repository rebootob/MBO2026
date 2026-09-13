# D3-SBX-DEPLOY-01-EXE2-IDENTITY-01 Evidence Record
## App 794 UI Customization Raw-Byte Content Identity Verification

Updated: 2026-09-13 ICT

---

## 1. Package & Governance Metadata

```text
PACKAGE = D3-SBX-DEPLOY-01-EXE2-IDENTITY-01
TITLE = APP794 UI CUSTOMIZATION RAW-BYTE CONTENT IDENTITY VERIFICATION
AUTHORIZATION_ID = MBO2026-D3-EXE2-IDENTITY01-20260913-OWNER-01
MODE = READ-ONLY AUDIT / ZERO WRITE
EXECUTION_PLANE = ANTIGRAVITY
ORCHESTRATION_CHANNEL = HERMES / TELEGRAM
TARGET_APP = 794
COMPONENT = UI CUSTOMIZATION RAW-BYTE CONTENT IDENTITY
CANONICAL_BRANCH = ai/antigravity-wp002c
AUTHORIZED_BASE_HEAD = db233eda29d4bbf98c2d936cb40591374a6dbad8
AUTHORIZED_BASE_PARENT = 8b436f03c52c791a01200952c3b2e0611b7e1b82
AUTHORIZED_BASE_TREE = 9980f3d5048f321cbf7fc3bd7642a24df3a4becd
AUTHORIZED_BASE_MESSAGE = docs(d3): clarify app794 ui customization deploy root cause, read accounting, and content identity (exe2-r1)
PRECEDING_PACKAGE_STATUS = EXE2-EVIDENCE-R1 ACCEPTED BY CONTROL PLANE (WITHOUT CLAIMING CONTROL PLANE RE-INSPECTED RAW TRANSCRIPT DIRECTLY)
AUDIT_RESULT = REVIEW REQUIRED
```

---

## 2. Canonical Pinned Artifacts (Computed Pre-I/O)

In strict accordance with the execution instructions, raw-byte SHA-256 and byte length were computed directly from Git blobs at the authorized base HEAD *prior* to initiating any network I/O:

```text
JS Artifact: dist/mbo-employee-app.js
- Git Blob: 6a29a0e652ab8bb210589583b2a2ebfa2754aafa
- Byte Length: 640471 bytes
- Raw SHA-256: cc80a23fa1adcd71fd8eae1ba95d78faa0694115aa672937c97c009b77e31bf3

CSS Artifact: dist/mbo-employee.css
- Git Blob: 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
- Byte Length: 43728 bytes
- Raw SHA-256: c0257969a6a040ae33e08ad001b8aa0944e844fb3fd2578ca041ecf9d19f58fd
```
*(Tracked dist files on disk were verified as bit-for-bit identical to these canonical Git blobs.)*

---

## 3. Operational Read & Write Accounting

```text
TOTAL_GET_READS = 8 (Budget: <= 8)
- CUSTOMIZATION_METADATA_GETS = 4 (Live initial, Preview initial, Live final, Preview final)
- FILE_DOWNLOAD_GETS = 4 (Live JS, Live CSS, Preview JS, Preview CSS)
READ_RETRIES = 0
DISCOVERY_CALLS = 0
ALTERNATIVE_ENDPOINTS = 0
ALTERNATIVE_CREDENTIALS = 0

ZERO-WRITE OPERATIONAL ACCOUNTING:
- UPLOAD = 0
- PUT = 0
- DEPLOY_POST = 0
- DEPLOY_POLLING = 0
- ROLLBACK_WRITES = 0
- PROCESS_WRITES = 0
- SCHEMA_WRITES = 0
- RECORD_WRITES = 0
- ACL_WRITES = 0
- OTHER_APP_WRITES = 0
- UAT = 0
- PRODUCTION_CUTOVER = 0
- SOURCE_TEST_CHANGES = 0
- BUILDS_RERUN = 0
- TESTS_RERUN = 0
- FULL_REPOSITORY_INTEGRATION_TEST = NOT CLAIMED
```

---

## 4. Itemized Chronological Read Breakdown

Every single attempted network request is accounted for below in chronological order:

| Seq | Endpoint | Parameters / Query | HTTP Status | Duration | Response Type / Observed Return |
|:---:|:---|:---|:---:|:---:|:---|
| 1 | `GET /k/v1/app/customize.json` | `app=794` | 200 OK | 454 ms | Initial LIVE metadata: revision `72`, scope `ALL`, desktop JS `1`, desktop CSS `1`, mobile `0`. |
| 2 | `GET /k/v1/preview/app/customize.json` | `app=794` | 200 OK | 187 ms | Initial PREVIEW metadata: revision `73`, scope `ALL`, desktop JS `1`, desktop CSS `1`, mobile `0`. |
| 3 | `GET /k/v1/file.json` | `fileKey=[REDACTED]` (Live JS) | 200 OK | 357 ms | Binary download of attached Live JS: 554,900 bytes. |
| 4 | `GET /k/v1/file.json` | `fileKey=[REDACTED]` (Live CSS) | 200 OK | 236 ms | Binary download of attached Live CSS: 43,728 bytes. |
| 5 | `GET /k/v1/file.json` | `fileKey=[REDACTED]` (Preview JS) | 200 OK | 258 ms | Binary download of attached Preview JS: 640,471 bytes. |
| 6 | `GET /k/v1/file.json` | `fileKey=[REDACTED]` (Preview CSS) | 200 OK | 262 ms | Binary download of attached Preview CSS: 43,728 bytes. |
| 7 | `GET /k/v1/app/customize.json` | `app=794` | 200 OK | 183 ms | Post-download re-read LIVE metadata: revision `72`, fileKeys and topology unchanged. |
| 8 | `GET /k/v1/preview/app/customize.json` | `app=794` | 200 OK | 182 ms | Post-download re-read PREVIEW metadata: revision `73`, fileKeys and topology unchanged. |

---

## 5. Scope & Topology Verification

Both LIVE and PREVIEW customization structures were verified against the required topology before file downloads:
- **Scope**: Both LIVE and PREVIEW report `ALL` (verified matching).
- **Target Desktop JS**: Exactly 1 entry named `mbo-employee-app.js` with non-empty `fileKey` present in both LIVE and PREVIEW.
- **Target Desktop CSS**: Exactly 1 entry named `mbo-employee.css` with non-empty `fileKey` present in both LIVE and PREVIEW.
- **Mobile Entries**: 0 JS and 0 CSS entries in both LIVE and PREVIEW (matching baseline).
- **Sanitized Key Analysis**:
  - Live JS fileKey: length 49 characters (sanitized)
  - Live CSS fileKey: length 49 characters (sanitized)
  - Preview JS fileKey: length 49 characters (sanitized)
  - Preview CSS fileKey: length 49 characters (sanitized)
  - `Live JS fileKey === Preview JS fileKey`: `false`
  - `Live CSS fileKey === Preview CSS fileKey`: `false`

---

## 6. Raw-Byte Content Identity Comparison

Downloaded file buffers were hashed directly using SHA-256 without conversion or encoding transformations:

### A. PREVIEW (Staged Revision 73)
```text
PREVIEW JS (mbo-employee-app.js):
- Downloaded Byte Length: 640471 bytes
- Canonical Byte Length:  640471 bytes -> MATCH (0 bytes drift)
- Downloaded SHA-256:     cc80a23fa1adcd71fd8eae1ba95d78faa0694115aa672937c97c009b77e31bf3
- Canonical SHA-256:      cc80a23fa1adcd71fd8eae1ba95d78faa0694115aa672937c97c009b77e31bf3
- Comparison Outcome:     BIT-FOR-BIT IDENTICAL (100% MATCH)

PREVIEW CSS (mbo-employee.css):
- Downloaded Byte Length: 43728 bytes
- Canonical Byte Length:  43728 bytes -> MATCH (0 bytes drift)
- Downloaded SHA-256:     c0257969a6a040ae33e08ad001b8aa0944e844fb3fd2578ca041ecf9d19f58fd
- Canonical SHA-256:      c0257969a6a040ae33e08ad001b8aa0944e844fb3fd2578ca041ecf9d19f58fd
- Comparison Outcome:     BIT-FOR-BIT IDENTICAL (100% MATCH)
```

### B. LIVE (Current Sandbox Revision 72)
```text
LIVE JS (mbo-employee-app.js):
- Downloaded Byte Length: 554900 bytes
- Canonical Byte Length:  640471 bytes -> DIFFERENCE: -85571 bytes
- Downloaded SHA-256:     6334e64655f2a1717f5bcc44ac561e6de4e5ec8baf4efba532d69b54f2daae7f
- Canonical SHA-256:      cc80a23fa1adcd71fd8eae1ba95d78faa0694115aa672937c97c009b77e31bf3
- Comparison Outcome:     MISMATCH (EXPECTED: LIVE Sandbox remains at baseline Revision 72)

LIVE CSS (mbo-employee.css):
- Downloaded Byte Length: 43728 bytes
- Canonical Byte Length:  43728 bytes -> MATCH (0 bytes drift)
- Downloaded SHA-256:     c0257969a6a040ae33e08ad001b8aa0944e844fb3fd2578ca041ecf9d19f58fd
- Canonical SHA-256:      c0257969a6a040ae33e08ad001b8aa0944e844fb3fd2578ca041ecf9d19f58fd
- Comparison Outcome:     BIT-FOR-BIT IDENTICAL (100% MATCH)
```

### Analysis of Content Identity Findings
1. **Preview Content Identity**:
   - The staged customization files in Preview (Revision 73) were downloaded and proven **bit-for-bit identical** to the repository's canonical release artifacts (`dist/mbo-employee-app.js` and `dist/mbo-employee.css`).
   - This empirically demonstrates that the `PUT /k/v1/preview/app/customize.json` call in `D3-SBX-DEPLOY-01-EXE2` accurately attached the correct release candidate files.

2. **Live Content Invariant**:
   - Live App 794 remains at Revision 72 holding the pre-existing JS bundle (554,900 bytes; SHA-256 `6334e646...`).
   - This confirms that because the deploy POST was halted fail-closed in EXE2, **zero live customization mutations occurred on Sandbox App 794**.
   - Live CSS already matched the canonical CSS artifact (`43728` bytes; SHA-256 `c0257969...`), consistent with earlier preflight audits.

---

## 7. Empirical Findings on FileKey Behavior

The audit strictly adheres to the rule: *Do not conclude that fileKeys changed due to server re-keying unless empirical evidence proves it.*

Based strictly on empirical observations:
1. In EXE2, `POST /k/v1/file.json` uploaded the candidate JS and CSS, returning temporary upload fileKey tokens.
2. The PUT request submitted those upload fileKeys in the customization payload.
3. Subsequent `GET /k/v1/preview/app/customize.json` responses returned attached `fileKey` strings differing from the temporary upload keys.
4. In this audit, calling `GET /k/v1/file.json?fileKey=<attachedKey>` using those attached fileKeys downloaded content that matches canonical artifacts with 100% cryptographic identity (`cc80a23f...` and `c0257969...`).
5. **Conclusion**: The empirical evidence proves that the attached fileKey in Kintone's customization metadata directly references the exact bytes uploaded from the canonical release bundle. However, the internal server-side mechanism by which Kintone assigns or maps fileKeys upon PUT ingestion remains an internal platform characteristic and is not modeled as an unverified external theory.

---

## 8. Drift & Consistency Verification

A second re-read of customization metadata (Seqs 7 & 8) was performed after the file downloads to verify stability throughout the audit:
- **LIVE Revision**: Initial `72` -> Final `72` (**STABLE**)
- **PREVIEW Revision**: Initial `73` -> Final `73` (**STABLE**)
- **LIVE Target JS FileKey**: Bit-for-bit identical between initial and final reads (**STABLE**)
- **LIVE Target CSS FileKey**: Bit-for-bit identical between initial and final reads (**STABLE**)
- **PREVIEW Target JS FileKey**: Bit-for-bit identical between initial and final reads (**STABLE**)
- **PREVIEW Target CSS FileKey**: Bit-for-bit identical between initial and final reads (**STABLE**)
- **Scope & Topology**: Remained identical and unchanged throughout the entire audit.

---

## 9. Limitations & Audit Boundaries

- **Read-Only Scope**: No writes were attempted or permitted.
- **No Deployment Execution**: This package does not deploy Preview revision 73 to Live Sandbox revision 74.
- **Safety Guards**: No guards were modified or relaxed.
- **Confidentiality**: Zero secrets, credentials, API tokens, raw fileKeys, or raw response bodies are committed or disclosed.

---

## 10. Verdict & Post-Delivery Control Boundary

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
