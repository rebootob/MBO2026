# Evidence: D3 Live Business Date Provider Contract Hardening and Real Integration Test Corrective (D3-LIVE-BUSINESS-DATE-IMP1-R1)

## 1. Package Identification & Authorization
- **Package:** `D3-LIVE-BUSINESS-DATE-IMP1-R1`
- **Project:** MBO2026
- **Repository:** `rebootob/MBO2026`
- **Canonical Branch:** `ai/antigravity-wp002c`
- **Base HEAD:** `cc2210595aeab9b2575ccde8848fe7edc0aba248`
- **Mode:** `LOCAL CONTRACT HARDENING + REAL INTEGRATION TEST CORRECTIVE / ZERO KINTONE LIVE I/O / ZERO DEPLOYMENT`
- **Owner Authorization:** Explicitly authorized by Owner in Control Plane conversation: `"อนุมัติ D3-LIVE-BUSINESS-DATE-IMP1-R1 LOCAL CONTRACT HARDENING + REAL INTEGRATION TEST CORRECTIVE / ZERO KINTONE LIVE I/O / ZERO DEPLOYMENT"`
- **Verdict:** **`PASS / AUTHORITY ENDPOINT LOCKED / REAL PRODUCTION-SEAM TESTS PASS / TEST ACCOUNTING CORRECTED / REVIEW REQUIRED`**

---

## 2. Control Plane Review Findings & Resolution

### Finding 1: Endpoint Override Gap
- **Defect:** Historical IMP1 allowed `options.endpoint`, permitting callers to theoretically override the authoritative Kintone endpoint.
- **Resolution:**
  - `AUTHORITATIVE_ENDPOINT = '/k/'` is locked as an immutable constant.
  - Caller override via `options.endpoint`, `options.url`, `options.origin`, or `options.host` is strictly forbidden and fails closed with `ENDPOINT_OVERRIDE_FORBIDDEN`.
  - Production provider unconditionally issues `HEAD /k/` with `{ credentials: 'same-origin', cache: 'no-store' }`.
  - Added test proving public provider contract cannot silently redirect authority to any other endpoint.

### Finding 2: Simulated Integration-Test Gap
- **Defect:** Historical IMP1 tests for Requirements 9 and 10 simulated the seam logic inside the test body instead of executing the actual production path.
- **Resolution:**
  - Exported production seam `resolveD3RoutingProfileWithDateSeam` in `src/main-mbo-app.js`, which is the exact function invoked by `onLookupEmployee`.
  - Added real production integration tests in `tests/live-business-date-provider.test.js`:
    - **Path A (Explicit Date):** Proves actual production code accepts explicit date, `LiveBusinessDateProvider` is NOT invoked, and exact date reaches `RoutingService.resolveRoutingProfile` input.
    - **Path B (Provider Date):** Proves actual production code invokes provider when no explicit date is given, server-derived date is obtained via `HEAD /k/`, exact date reaches `RoutingService.resolveRoutingProfile` unchanged, and end-to-end route version resolution succeeds.
    - **Path C (Failure Path):** Proves provider failure through actual production path fails closed (`LiveBusinessDateProviderError`), and `RoutingService.resolveRoutingProfile` is NEVER invoked (zero silent continuation).

### Finding 3: Inaccurate Targeted-Test Accounting
- **Defect:** Historical IMP1 described targeted execution as `178/178 PASS` without acknowledging the 2 attributed pre-existing baseline failures from `tests/create-handler-form-state.test.js`.
- **Resolution:**
  - Corrected historical IMP1 accounting across evidence and control documents to explicitly acknowledge the 2 attributed baseline failures.
  - Separately documented R1's own exact test execution metrics.

---

## 3. Authoritative Contract & Seam Status

```text
AUTHORITATIVE_ENDPOINT = /k/
ENDPOINT_OVERRIDE_ALLOWED = NO
FETCH_IMPL_TEST_INJECTION = YES
REAL_PRODUCTION_SEAM_TEST = PASS
EXPLICIT_DATE_BYPASS_TEST = PASS
PROVIDER_FORWARDING_TEST = PASS
PROVIDER_FAILURE_FAIL_CLOSED_TEST = PASS
```

---

## 4. Test Execution & Accounting

### A. Historical IMP1 Test Accounting (Corrected)
```text
IMP1_TARGETED_EXECUTION_TOTAL = 180
IMP1_TARGETED_PASS = 178
IMP1_TARGETED_FAIL = 2
IMP1_PRE_EXISTING_BASELINE_FAIL = 2
IMP1_NEW_REGRESSION_FAIL = 0
```
*(The 2 failures in `tests/create-handler-form-state.test.js` were independently verified as pre-existing on base HEAD `803a242cfbb0daad839a52b2f2dc8a94cdeb0a9f` and `cc2210595aeab9b2575ccde8848fe7edc0aba248`; zero new regression).*

### B. R1 Execution Test Accounting
```text
R1_TARGETED_EXECUTION_TOTAL = 184
R1_TARGETED_PASS = 182
R1_TARGETED_FAIL = 2
R1_PRE_EXISTING_BASELINE_FAIL = 2
R1_NEW_REGRESSION_FAIL = 0
```

Breakdown of R1 test suite:
- `tests/live-business-date-provider.test.js`: **15/15 PASS (0 FAIL)**
  - Req 1: HTTP 200 + valid RFC1123 Date returns Asia/Bangkok YYYY-MM-DD (`PASS`)
  - Req 2: UTC/Bangkok boundary conversions (`PASS`)
  - Req 3: missing/empty Date header fails closed (`PASS`)
  - Req 4: invalid Date header fails closed (`PASS`)
  - Req 5: fetch/network rejection fails closed (`PASS`)
  - Req 6: non-2xx response fails closed (`PASS`)
  - Req 7: fetch unavailable fails closed (`PASS`)
  - Req 8: local clock independence (`PASS`)
  - Req 9: Authoritative endpoint locked to `/k/` (`PASS`)
  - Req 10: Request strictly targets `/k/` with same-origin and no-store (`PASS`)
  - Req 11: Real production seam Path A - explicit date bypasses provider (`PASS`)
  - Req 12: Real production seam Path B - provider acquires server date and reaches RoutingService (`PASS`)
  - Req 13: Real production seam Path B - end-to-end routing version resolution (`PASS`)
  - Req 14: Real production seam Path C - provider failure fails closed with 0 silent continuation (`PASS`)
  - Req 15: setResolutionBusinessDateForTests preserves deterministic test seam (`PASS`)
- Other targeted regression tests: **167/167 PASS (0 FAIL)**
  - `tests/d3-runtime-route-binding.test.js`: 48/48 PASS
  - `tests/routing-service.test.js`: 37/37 PASS
  - `tests/d3-route-version-resolver.test.js`: 7/7 PASS
  - `tests/d3-route-viability-service.test.js`: 7/7 PASS
  - `tests/d3-snapshot-serializer.test.js`: 7/7 PASS
  - `tests/d3-workflow-payload.test.js`: 61/61 PASS
- Baseline attribution:
  - `tests/create-handler-form-state.test.js`: 0 PASS / 2 FAIL (`PRE_EXISTING_BASELINE_FAILURE`)

---

## 5. Hard Boundaries & Operational Counters

```text
KINTONE_LIVE_READS = 0
KINTONE_WRITES = 0
SCHEMA_WRITES = 0
RECORD_WRITES = 0
PROCESS_WRITES = 0
ACL_WRITES = 0
BROWSER_PROBES = 0
DEPLOYMENTS = 0
UAT = 0
FULL_REPOSITORY_INTEGRATION_TEST = NOT CLAIMED
```

---

## 6. Control & Blocker Status

```text
D3-LIVE-BUSINESS-DATE-IMP1 = PASS / LOCAL PROVIDER IMPLEMENTED / CONTRACT HARDENED / REAL INTEGRATION VERIFIED / INDEPENDENT REVIEW PENDING

D3-LIVE-BUSINESS-DATE-IMP1-R1 = PASS / AUTHORITY ENDPOINT LOCKED / REAL PRODUCTION-SEAM TESTS PASS / TEST ACCOUNTING CORRECTED / REVIEW REQUIRED

LIVE_BUSINESS_DATE_PROVIDER = AUTHORITY LOCKED / ACQUISITION MECHANISM VERIFIED / LOCAL IMPLEMENTATION COMPLETE / CONTRACT HARDENED / REAL INTEGRATION TARGETED TESTS COMPLETE / DEPLOYMENT STILL BLOCKED PENDING REVIEW/NEXT GATE (see `project-docs/evidence/D3_LIVE_BUSINESS_DATE_IMP1_R1_EVIDENCE.md`)

ACTIVE_WORK_PACKAGE = NONE
LAST_ATTEMPTED_PACKAGE = D3-LIVE-BUSINESS-DATE-IMP1-R1
LAST_CLOSED_CONTROL_PACKAGE = D3-LIVE-BUSINESS-DATE-IMP1-R1
NEXT_GATE_AUTHORIZED = NO
AUTO_START_NEXT_WORK_PACKAGE = NO
DEPLOYMENT_AUTHORIZED = NO
UAT_AUTHORIZED = NO
PRODUCTION_READY = NO
```
