# D3 Architecture & Control Corrective — Kintone-Only Mixed-Identity Audit Architecture

## Document Control Header

```text
DOCUMENT_ID                  = D3-KINTONE-ONLY-MIXED-IDENTITY-AUDIT-ARCHITECTURE-CORRECTIVE-01
PACKAGE_ID                   = D3-KINTONE-ONLY-MIXED-IDENTITY-AUDIT-LIVE-ARTIFACT-EVIDENCE-CORRECTIVE-01
AUTHORIZATION_ID             = MBO2026-D3-KINTONE-ONLY-MIXED-IDENTITY-AUDIT-LIVE-ARTIFACT-EVIDENCE-CORRECTIVE-01-20260918-OWNER-01
REVISION                     = R4 (LIVE ARTIFACT EVIDENCE CORRECTIVE: OPTIONS.ACTOR REACHABILITY & SHARED IDENTITY GAP)
CANONICAL_BRANCH             = ai/antigravity-wp002c
BASE_GIT_HEAD                = 411d0bca631f826e4cb9d2bd3faa96bffacbfd23
GOVERNANCE_STATUS            = SUBMITTED_FOR_INDEPENDENT_CONTROL_PLANE_REVIEW
EXECUTION_MODE               = DOCS_AND_EVIDENCE_CORRECTIVE_ONLY
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
  LIVE_DEPLOYED_D3_PATH                        = LEGACY_EXECUTE_PROCESS_TRANSITION_ARCHIVE_PATH
  LIVE_EXECUTE_PROCESS_TRANSITION_ARCHIVE_PATH = ACTIVE
  LIVE_STANDARD_CALLER_OPTIONS_ACTOR           = NOT_SUPPLIED
  LIVE_OPTIONS_ACTOR_EXTERNAL_INJECTION        = NOT_PROVEN
  LIVE_SHARED_ACTUAL_OPERATOR_GAP              = PRESENT
  ```
- **Correction of Evidence Over-Claim:**
  - The standard live event caller passes `{ apiAdapter: kintoneApiWrapper }` and **does not supply** `options.actor`.
  - The live bundle encapsulates its logic in a scoped IIFE and **does not expose** `executeProcessTransitionArchive` on `window`, `globalThis`, or any public runtime API.
  - Therefore, claims of arbitrary external actor override injection via DevTools are **NOT_PROVEN**.
- **The Actual Shared-Identity Gap:**
  - Because `options.actor` is not supplied by the standard live caller, actor derivation falls back to `kintone.getLoginUser().code`.
  - Under `SHARED` mode (e.g. factory kiosk using shared account `f2`), the archive record in App 798 records only `Kintone_Login_User_Code = f2`, losing the `Actual_Operator_Employee_Code` from the existing MBO Login Lock / App 801 identity context.
  - This is the real, verified business defect requiring future implementation.
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
Standard Caller options.actor  N/A                           NOT_SUPPLIED                  NOT_SUPPLIED
External Injection Reachable   N/A                           NOT_PROVEN                    NOT_PROVEN
Shared Actual Operator Gap     RESOLVED_IN_DRAFT_SOURCE      PRESENT                       PRESENT
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
   Actor Argument Present:   NO (options.actor is NOT_SUPPLIED)
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

## 4. Live Runtime Evidence & Shared Identity Defect Analysis

### 4.1 Live Runtime Status
Based on byte-identical download and static inspection of the live Kintone App 794 desktop customization:
```text
================================================================================
LIVE RUNTIME DETERMINATION:
================================================================================
LIVE_DEPLOYED_D3_PATH                        = LEGACY_EXECUTE_PROCESS_TRANSITION_ARCHIVE_PATH
LIVE_EXECUTE_PROCESS_TRANSITION_ARCHIVE_PATH = ACTIVE
LIVE_STANDARD_CALLER_OPTIONS_ACTOR           = NOT_SUPPLIED
LIVE_OPTIONS_ACTOR_EXTERNAL_INJECTION        = NOT_PROVEN
LIVE_SHARED_ACTUAL_OPERATOR_GAP              = PRESENT
================================================================================
```

### 4.2 Detailed Assessment of Actor Override & Shared Identity Gap
Inside `executeProcessTransitionArchive`:
```javascript
const apiAdapter = options.apiAdapter || kintoneApiWrapper;
const loginUser = options.loginUser || ((typeof kintone !== 'undefined' && typeof kintone.getLoginUser === 'function') ? kintone.getLoginUser() : null);
const actorCode = String(options.actor || loginUser?.code || '').trim();
```

1. **Standard Live Invocation:**
   The exact live event handler wiring in `dist/mbo-employee-app.js` (lines 12771–12773) is:
   ```javascript
   const archiveOutcome = await executeProcessTransitionArchive(record, event, {
     apiAdapter: kintoneApiWrapper
   });
   ```
   At this call site, `options.actor` is **not supplied**.

2. **External Injection Reachability (`NOT_PROVEN`):**
   - The live bundle is built as an immediately invoked functional bundle without exposing `executeProcessTransitionArchive` onto `window` or `globalThis`.
   - Claims that an end-user or operator can execute arbitrary actor override injection from DevTools are unsupported by current artifact evidence and classified as **NOT_PROVEN**.

3. **The Real Defect — Shared Actual Operator Gap (`PRESENT`):**
   - Because `options.actor` is absent in the standard live caller, actor derivation falls back to:
     `kintone.getLoginUser().code`
   - In `DEDICATED` mode, `loginUser.code` represents the personal Kintone user.
   - In `SHARED` mode (shared factory kiosk account such as `f2`), `loginUser.code` records only `f2`.
   - The current live archive helper does **not** capture or record `Actual_Operator_Employee_Code` from the existing MBO Login Lock / App 801 identity context.
   - Therefore, the audit record in App 798 fails to preserve the identity of the physical person performing the transition. This is the real business defect (`LIVE_SHARED_ACTUAL_OPERATOR_GAP = PRESENT`).

---

## 5. App 798 Trust Boundary & Platform-Level Anti-Forgery

### 5.1 Rejection of Insecure ACL Workarounds
- Granting `GROUP everyone: Add = YES` to App 798 allows any authenticated domain user to create audit records directly via `POST /k/v1/record.json`. This is **rejected** as an untrusted design.

### 5.2 Preservation of Owner Locks
- **Dual Identity Mandate:** In `SHARED` mode, audit records must capture BOTH `Actual_Operator_Employee_Code` (from Login Lock) AND `Kintone_Login_User_Code` (from Kintone session). They must never be collapsed into one identity.
- **Subject Separation:** `record.Employee_Code` is strictly the Subject Employee (the employee being evaluated), never the operator.
- **Dedicated Mode Operator:** Must resolve through authoritative App 53 mapping.
- **Shared Mode Operator:** Must resolve through existing MboKintoneLoginGate / MboSessionManager / App 801. No second login, no second PIN system.
- **Anti-Forgery Determination:**
  ```text
  KINTONE_ONLY_PLATFORM_LEVEL_ANTI_FORGERY = NOT_PROVEN
  ```
  In a 100% Kintone-only environment without server-side validation or backend secrets, application fields written by browser clients cannot be cryptographically proven against direct REST API spoofing.
- **Decision 009 Status:** Decision 009 established the external trusted writer architecture to eliminate client-side forgery. Because Kintone-only platform anti-forgery is `NOT_PROVEN`, Decision 009 is:
  ```text
  Decision 009 = NOT_SUPERSEDED_AT_THIS_STAGE
  ```
  (Preserved as historical provenance pending subsequent scope reconciliation).

---

## 6. Zero-I/O & Governance Accounting

```text
================================================================================
VERIFICATION ACCOUNTING & METRICS (PACKAGE: EVIDENCE-CORRECTIVE-01)
================================================================================
KINTONE_API_READS (THIS PACKAGE)           = 0
KINTONE_API_WRITES (THIS PACKAGE)          = 0
KINTONE_READS_FROM_PRIOR_VERIFICATION      = 2
KINTONE_WRITES_FROM_PRIOR_VERIFICATION     = 0
FILE_DOWNLOADS                             = 0
FILE_UPLOADS                               = 0
CUSTOMIZATION_WRITES                       = 0
DEPLOY_POSTS                               = 0
SCHEMA_WRITES                              = 0
ACL_WRITES                                 = 0
PROCESS_WRITES                             = 0
RECORD_WRITES                              = 0
SOURCE_CHANGES                             = 0
TEST_CHANGES                               = 0
DEPLOYMENT                                 = 0
UAT                                        = 0
REAL_OAUTH                                 = 0
EXTERNAL_BACKEND_PROVISIONING              = 0
================================================================================
```

---

## 7. Mandatory Stop Condition

```text
STOP_FOR_INDEPENDENT_CONTROL_PLANE_REVIEW = YES
CURRENT_STATUS                           = SAFE_STOP
```
