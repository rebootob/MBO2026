# D3 Decision 010 — Kintone-Only Scope Reconciliation & Mixed-Identity Business Auditability

## Decision Header
```text
DECISION                     = OWNER_DEC_D3_010
STATUS                       = OWNER APPROVED / LOCKED
VALUE                        = KINTONE_ONLY_MIXED_IDENTITY_BUSINESS_AUDITABILITY
OWNER_AUTHORIZATION          = EXPLICITLY APPROVED
AUTHORIZATION_ID             = MBO2026-D3-KINTONE-ONLY-SCOPE-RECONCILIATION-01-20260918-OWNER-01
BASE_HEAD                    = 4bc00a9a6794e81eaed331048a6aad84b391435a
CURRENT_SYSTEM_BOUNDARY      = KINTONE_ONLY
CURRENT_SECURITY_TARGET      = BUSINESS_AUDITABILITY_AND_TRACEABILITY
DECISION_009_STATUS          = HISTORICAL_ARCHITECTURE_DECISION (NOT_CURRENT_IMPLEMENTATION_TARGET)
```

---

## 1. Authoritative System Boundary

**Authoritative Target:** `MBO2026 = KINTONE-ONLY APPLICATION`

### In-Scope Systems & Components
* **App 53:** Employee / Dedicated Identity Mapping
* **App 794:** MBO Transactional Workflow
* **App 795:** Routing Master
* **App 798:** Audit / Historical Archive
* **App 801:** Shared-User Login Lock / Authenticated Employee Session
* **Kintone Native Process Management:** Native workflow transitions within Kintone
* **Kintone JavaScript Customization:** Browser-side client scripts running within Kintone
* **Kintone REST APIs:** Standard REST endpoints within the existing Kintone tenant
* **Existing Kintone Account / Session Model:** Standard Kintone login principals and session management

### Out-of-Scope Components
The following external and complex infrastructure components are **NOT** part of the current target architecture and MUST NOT be provisioned, implemented, deployed, or required as a prerequisite for D3 closure:
* External backend services / daemons
* External trusted writer services
* Redis / caching clusters
* PostgreSQL / MySQL / separate SQL databases
* Cloud runtimes (AWS Lambda, GCP Cloud Run, Docker containers, VPS)
* External secret vaults (HashiCorp Vault, AWS Secrets Manager)
* Separate attestation services
* New external identity providers
* New OAuth infrastructure / OAuth client registrations / OAuth token custody servers
* Dedicated external transaction engines

---

## 2. Audit Target & Non-Repudiation Position

* **Target:** `BUSINESS_AUDITABILITY_AND_TRACEABILITY`
* **Non-Target:** `CRYPTOGRAPHIC_NON_REPUDIATION_PLATFORM`
* **Platform Anti-Forgery Fact:** `KINTONE_ONLY_PLATFORM_LEVEL_ANTI_FORGERY = NOT_PROVEN`
  - This platform limitation is acknowledged and accepted by the Owner for this business context.
  - This limitation MUST NOT automatically trigger expansion into an external backend or OAuth architecture.
* **Prohibited ACL Design:** `GROUP everyone Add = YES` remains **NOT ACCEPTED** as a trusted anti-forgery design.
* **Core Audit Questions Answered in Kintone:**
  1. **WHO:** Actual Operator Employee Code
  2. **LOGIN_ACCOUNT:** Kintone Login User Code
  3. **IDENTITY_MODE:** SHARED or DEDICATED
  4. **WHAT:** Action / Event Name
  5. **RECORD:** App 794 Record ID
  6. **FROM_STATUS:** Previous Process Status
  7. **TO_STATUS:** Target Process Status
  8. **WHEN:** Recorded Timestamp / Business Date
  9. **REASON:** User Action Reason / Comments
  10. **SNAPSHOT / HASH:** Route Snapshot Payload and Integrity Hash

---

## 3. Mixed-Identity Contract

Three distinct identities MUST be maintained without collapsing:

1. **SUBJECT EMPLOYEE (`App794.Employee_Code`):**
   - The employee whose performance/objectives are being evaluated.
   - **NOT** automatically the operator performing the action.
2. **ACTUAL OPERATOR EMPLOYEE (`Actual_Operator_Employee_Code`):**
   - The individual human employee who physically performed the transition/action.
3. **KINTONE LOGIN PRINCIPAL (`Kintone_Login_User_Code`):**
   - The Kintone user account/session context in which the browser executed.

### Operating Modes & Resolution Rules
* **SHARED Mode (`Identity_Mode = SHARED`):**
  - Used when multiple employees share a single Kintone terminal/account (e.g. `f2` on a factory or kiosk device).
  - `Actual_Operator_Employee_Code` **MUST** be resolved from the existing authenticated employee session in `MboKintoneLoginGate` / `MboSessionManager` / `App801`.
  - `Kintone_Login_User_Code` **MUST** be captured from `kintone.getLoginUser().code`.
  - Both identities **MUST** be preserved alongside each other (e.g. `Actual_Operator = EMP00125`, `Kintone_User = f2`).
* **DEDICATED Mode (`Identity_Mode = DEDICATED`):**
  - Used when employees log in with individual Kintone accounts.
  - `Actual_Operator_Employee_Code` **MUST** resolve through the authoritative `App 53` mapping.
  - `Kintone_Login_User_Code` is the employee's own active Kintone user code.
* **Authentication Contract:**
  - `NO_SECOND_LOGIN = YES`
  - `NO_SECOND_PIN = YES`
  - Existing login and session gates MUST be reused; no redundant credentials or login layers shall be built.

---

## 4. Treatment of Decision 009

* **Historical Provenance:** Preserved in full. Git history, previous review records, and document files (e.g. `D3_DECISION_009_PLATFORM_STAMPED_OAUTH_ATTESTATION_ARCHITECTURE_RATIFICATION.md`) remain untouched and recorded as historical engineering investigations.
* **Current Authority:** Decision 009 is **SUPERSEDED** by Decision 010 regarding current implementation target and system boundary:
  - `DECISION_009_CURRENT_IMPLEMENTATION_TARGET = NO`
  - `DECISION_009_EXTERNAL_INFRASTRUCTURE_PATH = OUT_OF_CURRENT_SCOPE`
  - `DECISION_009_STATUS = HISTORICAL_ARCHITECTURE_DECISION`
* Decision 009 MUST NOT be used by any agent to authorize external backend, OAuth client provisioning, or external trusted writer implementations.

---

## 5. Accepted Live Reality & Current Gap

* **Live App 794 Baseline:** Revision `76`, Scope `ALL`, Desktop JS `mbo-employee-app.js` (713,130 bytes, SHA-256: `c2049fba52d4fb6e82faf767ff359f37dbafab57aea1e9dada74c022b884989f`).
* **Live Equals Repo Dist:** `YES` (`dist/mbo-employee-app.js` matches byte-for-byte).
* **Live Path:** `LIVE_DEPLOYED_D3_PATH = LEGACY_EXECUTE_PROCESS_TRANSITION_ARCHIVE_PATH` (`ACTIVE`).
* **Live Standard Caller:** `LIVE_STANDARD_CALLER_OPTIONS_ACTOR = NOT_SUPPLIED`.
* **External Injection:** `LIVE_OPTIONS_ACTOR_EXTERNAL_INJECTION = NOT_PROVEN`.
* **Current Live Business Defect:**
  - `LIVE_SHARED_ACTUAL_OPERATOR_GAP = PRESENT`
  - In the live standard caller, because `options.actor` is not supplied, the archive writer falls back to `kintone.getLoginUser().code`. In `SHARED` mode, this records only the shared account (e.g. `f2`) and omits the Login Lock authenticated employee identity (`App801`).
  - This gap is the precise technical defect to be resolved under Decision 010.

---

## 6. Execution & Implementation Guardrails

* **Current Implementation Authorized:** `NO`
* **Kintone Reads / Writes Authorized:** `NO`
* **Deployments Authorized:** `NO`
* **UAT Authorized:** `NO`
* **Stop Gate:** `STOP_FOR_INDEPENDENT_CONTROL_PLANE_REVIEW = YES`
