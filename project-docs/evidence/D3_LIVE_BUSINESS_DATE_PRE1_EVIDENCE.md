# Evidence: D3 Live Business Date Decision & Gap Review (D3-LIVE-BUSINESS-DATE-PRE1)

## 1. Execution Context
- **Package:** `D3-LIVE-BUSINESS-DATE-PRE1`
- **Canonical Base HEAD:** `f9dd1b8be13b5dd74fb81cb07e5ab4f3861d06b4`
- **Timestamp:** 2026-09-11
- **Mode:** `EVIDENCE / DECISION / GAP-REVIEW ONLY`

## 2. Hard Boundaries Audit
- `KINTONE_READS`: 0
- `KINTONE_WRITES`: 0
- `SOURCE_CHANGES`: 0
- `TEST_CHANGES`: 0
- `DEPLOYMENTS`: 0

## 3. Code & Test Evidence References
1. `src/main-mbo-app.js` (lines 65–82, 705–710, 1004–1007):
   - Confirmed `testResolutionBusinessDate = null` fails closed in production with `RESOLUTION_BUSINESS_DATE_REQUIRED`.
2. `src/services/d3-route-version-resolver.js` (lines 21–25, 40–60):
   - Confirmed regex `/^\d{4}-\d{2}-\d{2}$/` rejects timestamps (`INVALID_RESOLUTION_DATE`).
   - Confirmed interval comparison `from <= at && (!to || at <= to)`.
3. `src/services/routing-service.js` (lines 180–221):
   - Confirmed in-flight bound snapshot reuse when `!isStageBoundary`.
4. `tests/d3-runtime-route-binding.test.js` (`TC44`, `TC45`, `TC46`):
   - Confirmed regression guard rejecting fallback to record fields or arbitrary dates.

## 4. Synthesis & Status
- Primary decision document generated: `project-docs/D3_LIVE_BUSINESS_DATE_PRE1.md`.
- Blocker status updated to `LIVE_BUSINESS_DATE_PROVIDER = DECISION REQUIRED / DEPLOYMENT BLOCKER`.
