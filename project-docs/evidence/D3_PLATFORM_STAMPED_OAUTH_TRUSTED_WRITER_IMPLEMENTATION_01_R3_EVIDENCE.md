# D3 Platform-Stamped OAuth Trusted Writer Implementation 01 R3 Evidence

**Package ID**: `D3-ARCHIVE-RUNTIME-TRUSTED-WRITER-PLATFORM-STAMPED-OAUTH-IMPLEMENTATION-01-R3`  
**Authorization ID**: `MBO2026-D3-ARCHIVE-RUNTIME-TRUSTED-WRITER-PLATFORM-STAMPED-OAUTH-IMPLEMENTATION-01-R3-20260918-OWNER-01`  
**Base Head**: `eb0c2c7bc2b2cc4bda6b5b6182b73bca6b6f91bc`  
**Base Tree**: `6e837ad5c9b86a249b5147041d0ab196b650dfd9`  
**Date**: 2026-09-18  

---

## 1. Exact Changed Files

- `src/server/routes/d3-oauth-attestation-handler.js`
- `tests/d3-oauth-attestation-handler.test.js`
- `project-docs/evidence/D3_PLATFORM_STAMPED_OAUTH_TRUSTED_WRITER_IMPLEMENTATION_01_R3_EVIDENCE.md`

---

## 2. Findings Addressed & Corrective Proof

### Corrective 1: Nonce Owner Must Be Provable (Fail-Closed Enforcement)

In `src/server/routes/d3-oauth-attestation-handler.js` (`GET /api/mbo/d3/transaction/status/:nonce`), the endpoint previously only rejected if `entry.ownerSessionBinding` was truthy and mismatched the session. If `ownerSessionBinding` was missing, null, or blank, it previously failed open.

Under R3:
- Valid authenticated gateway session is required (`authSession.sessionBinding`).
- Nonce must exist in store.
- `entry.ownerSessionBinding` must be a non-empty string; if missing, null, or whitespace-only, the request fails closed immediately with HTTP 403 `STATUS_NONCE_OWNER_NOT_RESOLVED`.
- Exact equality with `authSession.sessionBinding` is required; if mismatched, HTTP 403 `STATUS_NONCE_SESSION_MISMATCH` is returned.
- Only exact owner match returns HTTP 200 `OK`.
- Response does not expose `sessionBinding` or any sensitive token/user material.

**Verification Locks**:
- `STATUS_NONCE_OWNER_REQUIRED`: YES
- `MISSING_OWNER_SESSION_BINDING`: FAIL_CLOSED (`403 STATUS_NONCE_OWNER_NOT_RESOLVED`)
- `BLANK_OWNER_SESSION_BINDING`: FAIL_CLOSED (`403 STATUS_NONCE_OWNER_NOT_RESOLVED`)
- `CROSS_SESSION_STATUS_LOOKUP`: FAIL_CLOSED (`403 STATUS_NONCE_SESSION_MISMATCH`)
- `EXACT_OWNER_STATUS_LOOKUP`: PASS (`200 OK`)

---

## 3. Targeted Test Results

Command:
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

Summary:
- `TARGETED_TEST_TOTAL`: 114
- `TARGETED_TEST_PASS`: 114
- `TARGETED_TEST_FAIL`: 0
- `TARGETED_TEST_CANCELLED`: 0
- `TARGETED_TEST_SKIPPED`: 0
- `TARGETED_TEST_TODO`: 0

---

## 4. Full Suite Accounting & Baseline Failure Identity Proof

### Baseline HEAD (`eb0c2c7bc2b2cc4bda6b5b6182b73bca6b6f91bc`)
- `BASELINE_HEAD`: `eb0c2c7bc2b2cc4bda6b5b6182b73bca6b6f91bc`
- `BASELINE_NPM_TEST_TOTAL`: 1881
- `BASELINE_NPM_TEST_PASS`: 1827
- `BASELINE_NPM_TEST_FAIL`: 44
- `BASELINE_NPM_TEST_SKIPPED`: 10

### R3 HEAD Suite Accounting
- `R3_NPM_TEST_TOTAL`: 1881
- `R3_NPM_TEST_PASS`: 1827
- `R3_NPM_TEST_FAIL`: 44
- `R3_NPM_TEST_SKIPPED`: 10

### Normalized Sorted Failure Test Names (Exact Match Proof)

Both Baseline HEAD and R3 HEAD produced the exact same 44 legacy failure identities:

1. `BLOCKER_1_DEPLOY_POST_FAILURE_SANITIZED_AND_ZERO_RETRY: deploy POST failure records sanitized error, zero retry, and does not poll further`
2. `BLOCKER_1_DEPLOY_POST_TRANSPORT_CONTRACT: getApp794DeployRequestOptions provides authorized bypass, object body, and single serialization`
3. `BLOCKER_2_RETAINED_FILE_KEY_DRIFT_BEFORE_DEPLOY_STOPS_WITH_ZERO_DEPLOY_POST`
4. `BLOCKER_2_RETAINED_FILE_KEY_DRIFT_IN_CONVERGENCE_AND_STABILITY_FAILS`
5. `BLOCKER_B_AUTHORIZATION_CONSUMPTION: Not consumed during local validation/build/read preflight; consumed at upload boundary; replay rejected; invalid auth causes zero network`
6. `BLOCKER_C_UPLOAD_ERROR_SANITIZATION: JS upload max 1, CSS upload max 1, upload failure sanitized and zero retry`
7. `BLOCKER_D_PREVIEW_READBACK_BEFORE_DEPLOY: PUT max 1, PUT failure causes zero deploy POST and zero retry; preview read-back mismatch blocks deploy POST`
8. `DIFFERENT_FILEKEYS_WITH_MATCHING_BYTES_PASS_DEPLOYMENT: Keys differ across upload, preview, and live, but bytes match canonical => PASS`
9. `DOWNLOAD_ERROR_STOPS_WITH_ZERO_RETRY: Preview JS or CSS download failure causes immediate fail-closed and deploy POST = 0`
10. `EXPORT_SERVICE_GENERATE_COMBINED_XLSX_APPROVER_BOUNDARY: generates combined workbook with 10 objectives, 8 competencies, b7/b8 presentation & secured summary values actually rendered`
11. `EXPORT_SERVICE_GENERATE_COMBINED_XLSX_EMPLOYEE_SELF: generates 2-sheet combined workbook omitting confidential ratings/comments, rendering safe values & 0 formulas`
12. `EXPORT_SERVICE_GENERATE_COMBINED_XLSX_INPUT_IMMUTABILITY: caller template buffers are not mutated during export generation`
13. `EXPORT_SERVICE_GENERATE_COMBINED_XLSX_INVALID_TEMPLATE_FAIL_CLOSED: authorized context with invalid Part A or Part B template bytes throws EXPORT_TEMPLATE_PREPARER_UNRESOLVED`
14. `FINAL_CONVERGENCE_CONTENT_MISMATCH_OR_DRIFT_FAILS: Live or Preview byte mismatch or post-download stability drift causes convergence to fail`
15. `FULL_E2E_MOCK_EXECUTION: Zero real network, deploy POST max 1, PUT max 1, upload max 1 each, full convergence`
16. `PREPARER_PART_A_OWNER_TEMPLATE_INTEGRATION: N=4..10 complete proof matrix, deep row structural parity & frozen baseline matrix`
17. `PREPARER_PART_B_OWNER_TEMPLATE_INTEGRATION: N=6/7/8 complete proof matrix, deep row structural parity & frozen baseline matrix`
18. `PREVIEW_CONTENT_MISMATCH_INDEPENDENTLY_BLOCKS_DEPLOY_POST: JS or CSS content mismatch independently causes deploy POST = 0`
19. `PREVIEW_STABILITY_DRIFT_STOPS_BEFORE_DEPLOY_POST: Revision, fileKey, scope, or topology drift after download stops deploy POST`
20. `R2-D1: Caller Input Byte Immutability`
21. `R2-D1: Exact Dynamic Print Area Equality Proof (Corrective D)`
22. `R2-D1: Exact Frozen Layout, Page Setup, Protection, and Merge Preservation (Corrective E)`
23. `R2-D1: Exhaustive Deterministic Matrix (Part A 4..10 x Part B 6/7/8 = 21 combinations)`
24. `R2-D1: Fail-Closed Negative Controls & Relationship Graph Boundary`
25. `R2-D1: Metadata Parts (docProps/app.xml and [Content_Types].xml)`
26. `R2-D1: Negative Control against Fixed Offsets`
27. `R2-D1: Privacy & Referenced-Only Shared Strings Proof (Corrective G)`
28. `R2-D1: Rendered-Source-Derived Style & SST Remapping & Negative Control`
29. `R2-D1: Secured Scalar Values & Privacy Preservation`
30. `R2-D1: Source-Derived Sheet Path Resolution & Non-Standard Zip Path`
31. `R2-D1: Valid Drawing, Media, PrinterSettings and Package Rel Namespaces`
32. `R3: Altered Local Relationship IDs (Corrective F)`
33. `R3: Multiple Media Distinctness Control (Corrective G)`
34. `R3: Sanitized / Non-Written Cells Remain Blank Proof (Corrective H)`
35. `R4-C1: Strict Business-Sheet Relationship TargetMode & Safety Authority`
36. `R4: Exact Sanitized Cell Authority Proof (Corrective C)`
37. `R4: Strict workbook.xml.rels Authority & Negative Controls (Corrective B)`
38. `REGRESSION_FINDING_2: CALLER_ARTIFACT_OVERRIDE_CANNOT_BYPASS_IDENTITY_GUARD`
39. `RENDERER_TEST_B: Complete fail-closed boundary & perturbation matrix`
40. `RENDERER_TEST_C: Full Part A exact Profile/projection truth matrix proof (N4..N10)`
41. `RENDERER_TEST_D: Full Part B exact Profile/projection truth & static matrix proof (N6/N7/N8)`
42. `RENDERER_TEST_E: Independent collision-proof authorized-diff exact-attribute proof with sentinels`
43. `RENDERER_TEST_F: Real privacy & N7 + N8 canonical presentation / alias resistance proof`
44. `RENDERER_TEST_G: XML 1.0 exact string validity & Unicode / emoji preservation proof`

- `BASELINE_FAILURE_SET_EQUALS_R3`: YES
- `FULL_SUITE_NEW_REGRESSION`: NO

---

## 5. Security Invariants & Zero Live I/O Declaration

- `REAL_AUTH_PRINCIPAL_CONTRACT`: PASS
- `GATEWAY_CONTEXT_TOKEN_ONLY`: PASS
- `AUTHORIZATION_HEADER_FALLBACK`: FORBIDDEN
- `FULL_9_FIELD_ATTESTATION_BINDING`: PASS
- `CREATOR_ONLY_ACTOR`: PASS
- `APP794_SYSTEM_REVISION_REQUIRED`: PASS
- `APP794_EXPECTED_REVISION`: PASS
- `RAW_INTERNAL_ERROR_TO_BROWSER`: FORBIDDEN
- `DOUBLE_PROCESS_TRANSITION_GUARD`: PASS
- `APP798_ARCHIVE_BEFORE_TRANSITION`: PASS

**Zero Live I/O Declarations**:
- `LIVE_KINTONE_READS`: 0
- `LIVE_KINTONE_WRITES`: 0
- `REAL_OAUTH_AUTHORIZATIONS`: 0
- `REAL_TOKEN_EXCHANGES`: 0
- `OAUTH_CLIENT_REGISTRATIONS`: 0
- `DEPLOYMENTS`: 0
- `UAT_ACTIONS`: 0

No credentials, OAuth tokens, session tokens, sessionBinding values, real Kintone data, or raw secrets are recorded.
