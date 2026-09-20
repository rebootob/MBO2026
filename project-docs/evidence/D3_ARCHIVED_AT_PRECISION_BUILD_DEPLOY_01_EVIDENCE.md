# Evidence: D3-ARCHIVED-AT-PRECISION-BUILD-DEPLOY-01

- Work Package: `D3-ARCHIVED-AT-PRECISION-BUILD-DEPLOY-01`
- Authorization ID: `MBO2026-D3-ARCHIVED-AT-PRECISION-BUILD-DEPLOY-01-20260919-OWNER-01`
- Base Commit: `8f706a5d300e1688e22621d380bb5a841f8cbcc4`
- Canonical Branch: `ai/antigravity-wp002c`
- Target App: App 794 (MBO Evaluation Records)
- Timestamp: 2026-09-20T00:06:00Z
- Operator: Hermes / Antigravity Execution Plane

---

## 1. Preflight Invariants & Safety Verification
- Base Head Check: `8f706a5d300e1688e22621d380bb5a841f8cbcc4` == `origin/ai/antigravity-wp002c` (Zero Base Drift)
- Pre-deploy App 794 Revision: `78`
- Post-deploy App 794 Revision: `79`
- Shared UAT State: Record 19 Status preserved at `06 Employee Mid-Year` (No re-run)
- Dedicated UAT: Not started / Untouched

---

## 2. Build & Deploy Artifact Bit-Matching Verification
- **Artifact Path:** `dist/mbo-employee-app.js`
- **Source Files Changed in this Package:** `0`
- **Test Files Changed in this Package:** `0`

### Generated Build Artifact
- **File:** `dist/mbo-employee-app.js`
- **Byte Size:** `726358`
- **SHA256:** `2f6e861ee59ca061672f9c419c5fb2db1d6bbd21aafe66827829d66a64e73741`
- **Blob SHA1:** `4511cbcd208140edafff3cec54feed31758b1aaf`

### Accompanying Preserved Asset
- **File:** `dist/mbo-employee-css`
- **Byte Size:** `43728`
- **SHA256:** `c0257969a6a040ae33e08ad001b8aa0944e844fb3fd2578ca041ecf9d19f58fd`
- **Blob SHA1:** `0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61`

### Live Readback Verification (Kintone Live Deployment)
- **Live FileKey (JS):** `20260920000535BFD88D5DFA354EF186295DBEEC48C4B0083`
- **Downloaded JS Byte Size:** `726358`
- **Downloaded JS SHA256:** `2f6e861ee59ca061672f9c419c5fb2db1d6bbd21aafe66827829d66a64e73741`
- **Bit-for-Bit Matching Result:** `LIVE_JS_SHA256 == BUILT_JS_SHA256` -> **MATCH (YES)**
- **Live FileKey (CSS):** `2026092000053570FFB2F735D648169C8CC58126264AF9115`
- **Downloaded CSS Byte Size:** `43728`
- **Downloaded CSS SHA256:** `c0257969a6a040ae33e08ad001b8aa0944e844fb3fd2578ca041ecf9d19f58fd`
- **Bit-for-Bit Matching Result:** `LIVE_CSS_SHA256 == BUILT_CSS_SHA256` -> **MATCH (YES)**

---

## 3. Test Suite Verification
- Node test run on archive test suites:
  - `tests/revision-archive-service.test.js`
  - `tests/revision-archive-kintone-repository.test.js`
  - `tests/d3-archive-idempotency.test.js`
- Outcome: **103 tests passed, 0 failed, 0 skipped**.

---

## 4. Mutation Accounting
- `SOURCE_CHANGE_COUNT = 0`
- `TEST_CHANGE_COUNT = 0`
- `APP794_RECORD_WRITE_COUNT = 0`
- `APP798_RECORD_WRITE_COUNT = 0`
- `APP794_SCHEMA_WRITE_COUNT = 0`
- `APP798_SCHEMA_WRITE_COUNT = 0`
- `ACL_WRITE_COUNT = 0`
- `PROCESS_TRANSITION_COUNT = 0`
- `START_MID_YEAR_COUNT = 0`
- `BUILD_COUNT = 1`
- `CUSTOMIZATION_DEPLOYMENT_COUNT = 1`
- `DEPLOYMENT_STATUS = SUCCESS`
