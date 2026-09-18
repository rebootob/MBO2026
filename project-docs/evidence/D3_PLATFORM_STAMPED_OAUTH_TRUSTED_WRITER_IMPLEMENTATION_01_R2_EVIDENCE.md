# D3 Platform-Stamped OAuth Trusted Writer Implementation 01 R2 Evidence

**Package ID**: `D3-ARCHIVE-RUNTIME-TRUSTED-WRITER-PLATFORM-STAMPED-OAUTH-IMPLEMENTATION-01-R2`  
**Authorization ID**: `MBO2026-D3-ARCHIVE-RUNTIME-TRUSTED-WRITER-PLATFORM-STAMPED-OAUTH-IMPLEMENTATION-01-R2-20260918-OWNER-01`  
**Authorized Base Head**: `553c84fa8dc8a618788b66e77fe949e2a7a4bb8d`  
**Base Message**: `fix(d3): harden trusted oauth transaction authority`  
**Date**: 2026-09-18  

---

## 1. Purpose & Findings Addressed

This R2 package resolves the five Independent Control Plane findings identified during the review of R1 without altering the Owner-ratified `NATIVE_KINTONE_PLATFORM_STAMPED_OAUTH_ATTESTATION` architecture:

1. **Production `MboAuthSessionService` Principal Contract Alignment**:
   - Production `MboAuthSessionService.getAuthenticatedPrincipal` returns `{ employeeCode, kintoneUserCode, isTechnicalAdmin }` (non-null object with `employeeCode`), without a `status` field.
   - Removed artificial requirement for `principal.status === 'ACTIVE'` in route authorization resolution (`resolveAuthenticatedBinding`).
   - Verified that valid principal shapes are accepted while null/invalid objects fail closed with `401 UNAUTHORIZED`.

2. **Strict Gateway Context Authority (`context.token`)**:
   - Completely eliminated fallback to `req.headers.authorization`.
   - All session identity and derived `sessionBinding` originate solely from gateway context (`context.token`).
   - If `context.token` is missing or invalid, routes fail closed with `401 UNAUTHORIZED` regardless of any `Authorization` header present.

3. **Owner-Bound Transaction Status (`ownerSessionBinding`)**:
   - `D3AttestationVerifier.generateNonce(eventBinding, options)` records `ownerSessionBinding` within lifecycle metadata outside the sealed 9-field attestation binding.
   - `GET /api/mbo/d3/transaction/status/:nonce` extracts the caller's `sessionBinding` from `context.token` and validates equality against `entry.ownerSessionBinding`.
   - Cross-session or unauthenticated attempts to read transaction status are rejected fail-closed (`401 UNAUTHORIZED` or `403 STATUS_NONCE_SESSION_MISMATCH`).

4. **Error Message Sanitization**:
   - Replaced exposure of raw body-parser error messages (`err.message`) with strict sentinel status codes (`UNSUPPORTED_CONTENT_TYPE`, `BODY_TOO_LARGE`, `INVALID_JSON_BODY`, `INVALID_BODY`).
   - No internal server exception or parser details leak to the HTTP client.

5. **Exact Test Accounting & Baseline Equivalence**:
   - Baseline HEAD (`553c84fa8dc8a618788b66e77fe949e2a7a4bb8d`) Suite Accounting:
     - Tests: 1881, Suites: 9, Pass: 1827, Fail: 44, Cancelled: 0, Skipped: 10.
   - Post-R2 Suite Accounting:
     - Tests: 1881, Suites: 9, Pass: 1827, Fail: 44, Cancelled: 0, Skipped: 10.
     - Net new failures introduced: **0** (pre-existing 44 failures belong to historical legacy non-D3 tests).
   - Targeted D3 Suite Accounting (`tests/d3-*.test.js` and `tests/revision-archive-*.test.js`):
     - Tests: 114, Suites: 0, Pass: 114, Fail: 0, Cancelled: 0, Skipped: 0.

---

## 2. Invariants & Safety Verification

- `LIVE_KINTONE_READS`: 0
- `LIVE_KINTONE_WRITES`: 0
- `REAL_OAUTH_AUTHORIZATIONS`: 0
- `REAL_TOKEN_EXCHANGES`: 0
- `DEPLOYMENTS`: 0
- `UAT_ACTIONS`: 0
- `BROWSER_ARCHIVE_FACT_AUTHORITY`: NONE
- `ACTOR_IDENTITY_PROVENANCE`: KINTONE_PLATFORM_STAMPED_CREATOR_ONLY
- `APP798_ARCHIVE_BEFORE_TRANSITION`: REQUIRED
- `DOUBLE_PROCESS_TRANSITION`: FORBIDDEN

---

## 3. Test Command and Output Verification

Targeted verification command:
```bash
node --test \
  tests/d3-stage-logical-snapshot.test.js \
  tests/d3-oauth-attestation-handler.test.js \
  tests/d3-token-store.test.js \
  tests/d3-attestation-verifier.test.js \
  tests/d3-trusted-archive-transition-service.test.js \
  tests/d3-main-process-trusted-transition.test.js \
  tests/revision-archive-service.test.js \
  tests/revision-archive-kintone-repository.test.js
```
Output:
```text
ℹ tests 114
ℹ suites 0
ℹ pass 114
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
```
