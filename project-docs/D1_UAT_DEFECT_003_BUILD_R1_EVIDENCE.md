# MBO2026 — Evidence: D1-UAT-DEFECT-003-BUILD-R1

- **WORK_PACKAGE**: `D1-UAT-DEFECT-003-BUILD-R1`
- **TITLE**: `App794 Candidate Build & Artifact Verification`
- **OWNER_AUTHORIZATION**: `APPROVED`
- **SOURCE_HEAD**: `2a286acf35dfef969cfa41b0f0bfd93a8d0f66b3`
- **BUILD_DATE**: `2026-09-08`
- **BUILD_COMMAND**: `npm run ui:build` (`node scripts/kintone/build-mbo-ui.js`)
- **BUILD_EXIT_CODE**: `0`

---

## 1. Artifact Identity and Hashes

| Artifact | Size (bytes) | Git Blob ID | Status / Match |
|---|---|---|---|
| **OLD_LIVE_JS_BLOB** | 550,769 | `8958634b92b35f74b58a7a0b2abd09b8b5e93758` | Previous deployed bundle (Rev 69) |
| **NEW_CANDIDATE_JS_BLOB** | 554,900 | `204d34db9e2eab297409a6a3d5e7f29c649779d5` | Freshly built candidate (contains Defect-003) |
| **OLD_LIVE_CSS_BLOB** | 43,728 | `0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61` | Canonical CSS (Rev 69) |
| **NEW_CANDIDATE_CSS_BLOB** | 43,728 | `0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61` | Exact byte-for-byte match |

- **CSS_MATCH_EXPECTED**: `YES` (Blob identical: `0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61`)
- **JS_DRIFT_CONFIRMED**: `YES` (New candidate `204d34db...` differs from old live `8958634b...`)

---

## 2. Bundle Content Verification

All expected `D1-UAT-DEFECT-003` markers are verified present in `dist/mbo-employee-app.js`:

| Marker / Token | Presence | Encoding |
|---|---|---|
| `Back to Kintone Home` | **PRESENT** | ASCII |
| `กลับหน้าหลัก Kintone` | **PRESENT** | Unicode escape `\u0E01\u0E25\u0E31\u0E1A\u0E2B\u0E19\u0E49\u0E32\u0E2B\u0E25\u0E31\u0E01 Kintone` |
| `Forgot Password` | **PRESENT** | ASCII |
| `ลืมรหัสผ่าน` | **PRESENT** | Unicode escape `\u0E25\u0E37\u0E21\u0E23\u0E2B\u0E31\u0E2A\u0E1C\u0E48\u0E32\u0E19` |
| `data-mbo-back-home` | **PRESENT** | ASCII DOM attribute |
| `data-mbo-forgot-password-help` | **PRESENT** | ASCII DOM attribute |
| `DEDICATED_ACCOUNT_REQUIRED` | **PRESENT** | ASCII constant |

- **DEFECT003_MARKERS_PRESENT**: `YES`

---

## 3. Scope and Invariants

- **SOURCE_FILES_CHANGED**: `0` (`src/**` untouched)
- **TEST_FILES_CHANGED**: `0` (`tests/**` untouched)
- **SCRIPT_FILES_CHANGED**: `0` (`scripts/**` untouched)
- **CONFIG_FILES_CHANGED**: `0`
- **KINTONE_WRITES**: `0` (Zero network writes)
- **DEPLOYMENT_PERFORMED**: `NO`
- **APP794_LIVE_REVISION**: `69 UNCHANGED`
- **DEFECT003_DEPLOYMENT**: `PENDING`
- **DEFECT003_OWNER_UAT**: `PENDING`
- **D3_STATUS**: `HOLD`

---

## 4. Next Permitted Action

- **Control Plane Review**: Awaiting independent review of candidate build artifacts.
- **Deployment Authorization**: NONE. Deployment requires explicit separate Owner authorization.
