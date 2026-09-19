# Evidence: D3 App 794 Customization Build and Deployment 01 (R1)

- **Project:** MBO2026
- **Repository:** `rebootob/MBO2026`
- **Canonical Branch:** `ai/antigravity-wp002c`
- **Package:** `D3-KINTONE-ONLY-APP794-CUSTOMIZATION-BUILD-DEPLOY-01-R1`
- **Authorization ID:** `MBO2026-D3-KINTONE-ONLY-APP794-CUSTOMIZATION-BUILD-DEPLOY-01-R1-20260919-OWNER-01`
- **Authorized Base HEAD:** `b2209ec13a3c459841164f0976c2640c5b07a20c`
- **Execution Date:** 2026-09-19
- **Mode:** DOCS + EVIDENCE + REPOSITORY-HYGIENE CORRECTIVE ONLY

---

## 1. Mandatory Preflight Verification

```text
WORKING_DIRECTORY = C:/Users/allda/Desktop/Dev/git/MBO2026
GIT_STATUS_PREFLIGHT = CLEAN
FETCH_ORIGIN = SUCCESS
LOCAL_HEAD = b2209ec13a3c459841164f0976c2640c5b07a20c
ORIGIN_HEAD = b2209ec13a3c459841164f0976c2640c5b07a20c
HEAD_MATCH = YES
HEAD_DRIFT = NO
```

---

## 2. PART A — Dist Artifact Policy Investigation & Determination

Independent investigation into the authoritative repository tracking and delivery policy for `dist/mbo-employee-app.js`.

### Evidence Evaluated:
1. **Current Git Tracking State:**
   - Pre-package Base HEAD (`eff014c28826539eeac4430ca1b038e5ba7f1cd1`):
     `git ls-tree eff014c28826539eeac4430ca1b038e5ba7f1cd1 dist/mbo-employee-app.js` confirmed blob `3d75ca1e62e7d5475c061ba914a4f87956e9a829`.
   - File was actively tracked prior to package execution.
2. **`.gitignore` Rules:**
   - Neither `dist/` nor `dist/mbo-employee-app.js` is ignored in `.gitignore`.
3. **Historical Commit Pattern:**
   - Regularly committed across D1 and D3 deployment, bugfix, and release commits:
     - `0e91203`: `fix(d3): bind archive snapshots to canonical persisted fields`
     - `b348f86`: `fix(d3): enforce exact archive provenance and fail-closed transitions`
     - `79d03b2`: `feat(d3): wire immutable stage archives and deliver closure evidence`
     - `f3e4d35`: `chore(d3): prepare sandbox deployment candidate`
     - `2a02ab2`: `build(d1): refresh App794 candidate for defect 003`
     - `d9efa5a`: `build: refresh MBO sandbox bundle for UAT identity fixes`
     - `09c306d`: `build(dist): compile App794 employee UI bundle for D1 release`
4. **Build & Deploy Script Behavior:**
   - `scripts/kintone/build-mbo-ui.js` compiles ESbuild bundle directly to `dist/mbo-employee-app.js`.
   - `scripts/kintone/deploy-custom-ui.js` requires clean working tree or exact hash match for tracked candidate files.
   - `AGENTS.md` and repository run-control governance explicitly treat `dist/mbo-employee-app.js` as an approved tracked generated artifact.
   - Under `CURRENT_SECURITY_TARGET = BUSINESS_AUDITABILITY_AND_TRACEABILITY`, tracking the exact candidate bundle deployed to Kintone ensures cryptographic auditability and 1:1 bit equivalence against live Kintone environments.

### Determination:
```text
DIST_ARTIFACT_TRACKED_BEFORE_PACKAGE = YES
DIST_ARTIFACT_POLICY = TRACKED_DEPLOYMENT_ARTIFACT
DIST_ARTIFACT_HISTORICAL_PATTERN = TRACKED_ACROSS_RELEASES
DIST_ARTIFACT_BUILD_SCRIPT_BEHAVIOR = BUILT_FROM_SRC_KINTONE_MBO_CONTROL_CUSTOM_UI
DIST_ARTIFACT_STATE = POLICY_COMPLIANT
ARTIFACT_COMMIT_EXPECTED = YES
LIVE_DEPLOYED_ARTIFACT_UNCHANGED = YES
```

---

## 3. PART B — External Helper Truth Verification

Deterministic repository audit of `handleD3BrowserTrustedTransition` and `/api/mbo/d3/transaction/prepare-transition` across `src/`, `dist/`, and `tests/`.

### Source & Call Site Analysis:
1. **`handleD3BrowserTrustedTransition`:**
   - **Declarations in `src/`:** 1 (`src/main-mbo-app.js` line 1494)
   - **Runtime Call Sites in `src/`:** 0 (No production code invokes this function)
   - **Declarations in `dist/`:** 1 (`dist/mbo-employee-app.js` line 13307)
   - **Runtime Call Sites in `dist/`:** 0
   - **Test Call Sites in `tests/`:** 4 (`tests/d3-main-process-trusted-transition.test.js` lines 20, 42, 65, 81)
2. **`/api/mbo/d3/transaction/prepare-transition`:**
   - **References in `src/`:** 4
     - 1 in `src/main-mbo-app.js` (line 1502 fallback default URL inside unused helper)
     - 3 in `src/server/routes/d3-oauth-attestation-handler.js` (lines 9, 192, 193 in test/mock server route)
   - **References in `dist/`:** 1 (`dist/mbo-employee-app.js` line 13313 inside unused helper)
   - **References in `tests/`:** 18 (4 in `d3-main-process-trusted-transition.test.js`, 14 in `d3-oauth-attestation-handler.test.js`)

### Determination:
```text
EXTERNAL_HELPER_PRESENT = YES
EXTERNAL_HELPER_DECLARATION_COUNT = 1
EXTERNAL_HELPER_CALL_SITE_COUNT = 0
EXTERNAL_ENDPOINT_REFERENCE_COUNT = 4
EXTERNAL_HELPER_RUNTIME_CALL_SITE_COUNT = 0
EXTERNAL_HELPER_RUNTIME_CALL_PROVEN = NO
DECISION_009_EXTERNAL_PATH_ACTIVE = NOT_PROVEN_ACTIVE
```

---

## 4. Strict Safety & Boundary Verification

```text
SOURCE_CHANGE = 0
TEST_CHANGE = 0
SCRIPTS_CHANGE = 0
PACKAGE_JSON_CHANGE = 0
PRODUCTION_REFACTOR = NO
HANDLE_D3_BROWSER_TRUSTED_TRANSITION_REMOVED = NO

KINTONE_READ_COUNT = 0
KINTONE_WRITE_COUNT = 0
REBUILD = NO
REDEPLOY = NO
UAT = NO

CURRENT_GATE = STOP_FOR_INDEPENDENT_CONTROL_PLANE_REVIEW
```
