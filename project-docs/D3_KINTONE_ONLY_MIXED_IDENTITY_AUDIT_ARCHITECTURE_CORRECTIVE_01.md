# D3 Architecture & Control Corrective — Kintone-Only Mixed-Identity Audit Architecture

## Document Control Header

```text
DOCUMENT_ID                  = D3-KINTONE-ONLY-MIXED-IDENTITY-AUDIT-ARCHITECTURE-CORRECTIVE-01
PACKAGE_ID                   = D3-KINTONE-ONLY-MIXED-IDENTITY-AUDIT-LIVE-ARTIFACT-READONLY-VERIFICATION-01
AUTHORIZATION_ID             = MBO2026-D3-KINTONE-ONLY-MIXED-IDENTITY-AUDIT-LIVE-ARTIFACT-READONLY-VERIFICATION-01-20260918-OWNER-01
REVISION                     = R3 (LIVE KINTONE APP 794 ARTIFACT VERIFICATION & DIVERGENCE AUDIT)
CANONICAL_BRANCH             = ai/antigravity-wp002c
BASE_GIT_HEAD                = e496c230f687e7129eb3b2cc821624ba36dbc251
GOVERNANCE_STATUS            = SUBMITTED_FOR_INDEPENDENT_CONTROL_PLANE_REVIEW
EXECUTION_MODE               = LIVE_KINTONE_READ_ONLY_ARTIFACT_VERIFICATION
ZERO_IO_WRITE_VERIFIED       = YES
STOP_FOR_REVIEW              = YES
```

---

## 1. Executive Summary & Purpose

This corrective establishes authoritative repository and live runtime truth resolving the architectural divergence between:
1. **Current Source Truth (`src/main-mbo-app.js`):** Implements `handleD3BrowserTrustedTransition` sending `POST /api/mbo/d3/transaction/prepare-transition` and returning `false` (Trusted External Writer pattern).
2. **Current Repository Dist File (`dist/mbo-employee-app.js`):** Canonical build artifact (`REPOSITORY_DIST_ARTIFACT`) produced by `scripts/kintone/build-mbo-ui.js` used by the deployment pipeline.
3. **Current Live Deployed Kintone App 794 Customization:** Downloaded directly from Kintone App 794 live metadata (Revision 76).

### Definitive Runtime Findings:
- **Live vs Repository Dist Equality:** `LIVE_EQUALS_REPOSITORY_DIST = YES`. The live JavaScript artifact attached to App 794 is **100% byte-identical** to repository `dist/mbo-employee-app.js` (SHA-256: `c2049fba52d4fb6e82faf767ff359f37dbafab57aea1e9dada74c022b884989f`, byte length: `713130`).
- **Live Runtime Wiring:** In the live deployed artifact, `kintone.events.on('app.record.detail.process.proceed')` (line 12732) is actively wired to `executeProcessTransitionArchive(record, event, { apiAdapter: kintoneApiWrapper })`. It **does not contain** `handleD3BrowserTrustedTransition` or `/api/mbo/d3/transaction/prepare-transition`.
- **Runtime Path Determination:**
  ```text
  LIVE_DEPLOYED_D3_PATH             = LEGACY_EXECUTE_PROCESS_TRANSITION_ARCHIVE_PATH
  LIVE_DEPLOYED_ACTOR_OVERRIDE_PATH = ACTIVE_OR_REACHABLE
  ```
- **Actor Spoof-Risk Assessment:** Because the live deployed Kintone environment actively executes `executeProcessTransitionArchive(...)`, the helper's internal precedence (`options.actor || loginUser?.code`) is reachable in the live execution graph. Caller-supplied actor spoof risk is formally documented for Control Plane follow-up.
- **Strict Owner Governance Preserved:** Dual-identity audit in SHARED mode must preserve both `Actual_Operator_Employee_Code` and `Kintone_Login_User_Code`; `App794.Employee_Code` remains Subject Employee; `KINTONE_ONLY_PLATFORM_LEVEL_ANTI_FORGERY = NOT_PROVEN`; `GROUP everyone Add = YES` is rejected; Decision 009 remains `NOT_SUPERSEDED_AT_THIS_STAGE`.

---

## 2. Tripartite Source, Dist, and Live Artifact Comparison

```text
========================================================================================================================
TRIPARTITE COMPARISON TABLE: ARTIFACT & RUNTIME PATH TRUTH
========================================================================================================================
DIMENSION                      A. CURRENT SOURCE             B. REPOSITORY DIST            C. LIVE DEPLOYED APP 794
------------------------------------------------------------------------------------------------------------------------
Location / Identifier          src/main-mbo-app.js           dist/mbo-employee-app.js      Kintone App 794 Desktop JS
Classification                 CANONICAL_SOURCE              REPOSITORY_DIST_ARTIFACT      LIVE_ATTACHED_CUSTOMIZATION
Customization Revision         N/A                           N/A                           76
Customization Scope            N/A                           N/A                           ALL
File Name                      main-mbo-app.js               mbo-employee-app.js           mbo-employee-app.js
FileKey                        N/A                           N/A                           202609170459422F30CF75...
SHA-256 Hash                   (Source tree)                 c2049fba52d4fb6e82faf767...   c2049fba52d4fb6e82faf767...
Byte Length                    (Source text)                 713130 bytes                  713130 bytes
Equality to Live Artifact      NO (Architectural divergence) YES (Identical)               YES (Baseline)
Active D3 Process Proceed Path handleD3BrowserTrusted...     executeProcessTransition...   executeProcessTransition...
Target API Endpoint            /api/mbo/d3/transaction/...   Direct Kintone REST (App 798) Direct Kintone REST (App 798)
executeProcessTransition...    EXPORT_ONLY_HELPER (Uncalled) ACTIVE_WIRED_CALLER           ACTIVE_WIRED_CALLER
========================================================================================================================
```

### Analysis of Architectural Divergence:
The repository source (`src/main-mbo-app.js`) was refactored toward the Decision 009 Trusted External Writer architecture (`handleD3BrowserTrustedTransition`), but this refactoring **has not been built or deployed to Kintone App 794**. The live environment continues to execute the earlier client-side direct archive architecture bundled in `dist/mbo-employee-app.js`.

---

## 3. Mandatory Call-Site Inventory for `executeProcessTransitionArchive`

Across the repository, all occurrences of `executeProcessTransitionArchive` were re-audited and classified:

```text
========================================================================================================================
CALL SITE INVENTORY: executeProcessTransitionArchive(...)
========================================================================================================================
1. CANONICAL SOURCE DECLARATION / EXPORT
   File:                     src/main-mbo-app.js (line 1355)
   Function:                 export async function executeProcessTransitionArchive(record, event, options = {})
   Runtime Classification:   EXPORT_ONLY_HELPER
   Options Object Source:    N/A (Function declaration)
   Actor Argument Present:   N/A
   User Controlled:          N/A
   Active In Source Path:    NO (Uncalled in src/)

2. REPOSITORY DIST ARTIFACT & LIVE DEPLOYED EVENT HOOK
   File:                     dist/mbo-employee-app.js (lines 12771–12773) [Identical to Live App 794 JS]
   Function:                 kintone.events.on('app.record.detail.process.proceed', async function(event) { ... })
   Runtime Classification:   REPOSITORY_DIST_ARTIFACT / LIVE_ACTIVE_RUNTIME
   Options Object Source:    Inline literal: { apiAdapter: kintoneApiWrapper }
   Actor Argument Present:   NO (options.actor is undefined at this specific call site)
   Actor Value Source:       Falls back internally to kintone.getLoginUser().code
   User Controlled:          NO
   Active In Live Path:      YES (Actively executed upon user process action in live App 794)

3. AUTOMATED INTEGRATION TEST SUITE
   File:                     tests/d3-stage-archive-integration.test.js
   Function:                 25 distinct test invocations
                             Lines: 103, 125, 147, 169, 188, 207, 226, 237, 248, 293, 316,
                             340, 365, 379, 401, 420, 447, 466, 474, 616, 628, 640, 667, 701, 712.
   Runtime Classification:   TEST
   Options Object Source:    Mock test fixture objects
   Actor Argument Present:   YES (in select override test cases, e.g. { actor: 'custom.actor' })
   Actor Value Source:       Hardcoded test mock string fixtures
   User Controlled:          NO (Automated Node test harness)
========================================================================================================================
```

---

## 4. Live Runtime Reachability & Actor Spoof-Risk Assessment

### 4.1 Live Runtime Conclusion
Based on byte-identical download and static inspection of the live Kintone App 794 desktop customization:
```text
================================================================================
LIVE RUNTIME DETERMINATION:
================================================================================
LIVE_DEPLOYED_D3_PATH             = LEGACY_EXECUTE_PROCESS_TRANSITION_ARCHIVE_PATH
LIVE_DEPLOYED_ACTOR_OVERRIDE_PATH = ACTIVE_OR_REACHABLE
================================================================================
```

### 4.2 Actor Derivation Order & Spoof Vulnerability
Inside `executeProcessTransitionArchive`:
```javascript
const apiAdapter = options.apiAdapter || kintoneApiWrapper;
const loginUser = options.loginUser || ((typeof kintone !== 'undefined' && typeof kintone.getLoginUser === 'function') ? kintone.getLoginUser() : null);
const actorCode = String(options.actor || loginUser?.code || '').trim();
```
1. **Derivation Order:**
   - Tier 1: `options.actor`
   - Tier 2: `loginUser?.code`
   - Tier 3: Fail-closed empty check (`ACTOR_IDENTITY_UNRESOLVED`).
2. **Vulnerability Analysis:**
   - While the standard event listener at line 12771 passes `{ apiAdapter: kintoneApiWrapper }` without `options.actor`, the function itself resides in active execution memory on the client browser.
   - Because execution occurs entirely client-side without backend cryptographic sealing, an operator manipulating client-side state or invoking the helper directly via browser console/scripts can supply an arbitrary `options.actor`, which will be recorded as `Archived_By` in App 798.
   - Furthermore, in `SHARED` mode, the fallback `loginUser.code` captures only the shared Kintone account (e.g., `f2`), dropping the human operator (`EMP00125`).
   - Consequently, the live deployed artifact exhibits both **operator identity loss in SHARED mode** and **reachability of the actor override parameter**.

---

## 5. App 798 Trust Boundary & Platform-Level Anti-Forgery

### 5.1 Rejection of Insecure ACL Workarounds
- Granting `GROUP everyone: Add = YES` to App 798 allows any authenticated domain user to forge audit records directly via `POST /k/v1/record.json` using browser DevTools. This is **rejected** as an untrusted design.

### 5.2 Preservation of Owner Locks
- **Dual Identity Mandate:** In `SHARED` mode, audit records must capture BOTH `Actual_Operator_Employee_Code` (from Login Lock) AND `Kintone_Login_User_Code` (from Kintone session). They must never be collapsed.
- **Subject Separation:** `record.Employee_Code` is strictly the Subject Employee (the employee being evaluated), never the operator.
- **Anti-Forgery Determination:**
  ```text
  KINTONE_ONLY_PLATFORM_LEVEL_ANTI_FORGERY = NOT_PROVEN
  ```
  In a 100% Kintone-only environment without server-side validation or backend secrets, application fields written by browser clients cannot be cryptographically proven against direct REST API spoofing.
- **Decision 009 Status:** Decision 009 established the external trusted writer architecture to eliminate client-side forgery. Because Kintone-only platform anti-forgery is `NOT_PROVEN`, Decision 009 is:
  ```text
  Decision 009 = NOT_SUPERSEDED_AT_THIS_STAGE
  ```

---

## 6. Zero-Write & Governance Accounting

```text
================================================================================
VERIFICATION ACCOUNTING & METRICS
================================================================================
KINTONE_READS                      = 2 (App 794 Customize Metadata + File Download)
KINTONE_WRITES                     = 0
FILE_UPLOADS                       = 0
CUSTOMIZATION_WRITES               = 0
DEPLOY_POSTS                       = 0
SCHEMA_WRITES                      = 0
ACL_WRITES                         = 0
PROCESS_WRITES                     = 0
RECORD_WRITES                      = 0
SOURCE_CHANGES                     = 0
TEST_CHANGES                       = 0
DEPLOYMENT                         = 0
UAT                                = 0
================================================================================
```

---

## 7. Mandatory Stop Condition

```text
STOP_FOR_INDEPENDENT_CONTROL_PLANE_REVIEW = YES
CURRENT_STATUS                           = SAFE_STOP
```
