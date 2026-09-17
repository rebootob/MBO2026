# Evidence: D3 Archive Runtime Trusted Writer Architecture Decision 02

## Document Control
- **Package**: `D3-ARCHIVE-RUNTIME-TRUSTED-WRITER-ARCHITECTURE-DECISION-02`
- **Base HEAD**: `8be55309732a7c6d99569e0716369fc74e2f0aa9`
- **Mode**: `ARCHITECTURE DECISION / DOCS-ONLY / NO IMPLEMENTATION / NO LIVE I/O`
- **Owner Authorization**: `APPROVED`
- **Scope Control**: `STRICT (SCOPE_EXPANSION_AUTHORIZED = NO)`

---

## 1. Executive Verdict & Summary Indicators

- **FAMILY_A_VERDICT**: `REJECTED_UNFEASIBLE_WITHOUT_EXTERNAL_IDP`
- **FAMILY_B_VERDICT**: `RECOMMENDED_READY_FOR_OWNER_RATIFICATION`
- **FAMILY_C_VERDICT**: `REJECTED_CRITICAL_SECURITY_FLAWS`
- **ARCHITECTURE_DECISION_RESULT**: `ARCHITECTURE_DECISION_READY_FOR_OWNER_RATIFICATION`
- **RECOMMENDED_CANDIDATE_FOR_OWNER_RATIFICATION**: `FAMILY_B_WORKFLOW_ARCHIVE_HANDSHAKE_REDESIGN`
- **LOCKED_DECISION_CHANGE_REQUIRED**: `YES`
- **NEW_INFRASTRUCTURE_REQUIRED**: `YES`
- **NEW_IDENTITY_INFRASTRUCTURE_REQUIRED**: `NO`
- **APP798_EVERYONE_ADD_REQUIRED**: `NO`
- **APP798_EVERYONE_VIEW_REQUIRED**: `NO`
- **BROWSER_PRIVILEGED_SECRET_REQUIRED**: `NO`
- **CRITICAL_UNRESOLVED_SECURITY_BLOCKERS**: `NONE` (for Family B; Family C has critical blockers: arbitrary DevTools POST, unverified payload; Family A is blocked by external IdP dependency)
- **OWNER_RATIFIED_ARCHITECTURE**: `NONE`
- **IMPLEMENTATION_AUTHORIZED**: `NO`
- **DEPLOYMENT_AUTHORIZED**: `NO`
- **FULL_D3_BUSINESS_UAT**: `NOT_PROVEN`
- **D3_CLOSURE**: `NOT_CLAIMED`
- **PRODUCTION_READY**: `NO`
- **NEXT_GATE_AUTHORIZED**: `NO`
- **AUTO_START_NEXT_WORK_PACKAGE**: `NO`
- **FINAL_STATE**: `STOP FOR INDEPENDENT CONTROL PLANE REVIEW`

---

## 2. Accepted Authority & Historical Context

1. **Accepted Predecessor Packages**:
   - `D3-ARCHIVE-RUNTIME-AUTHORIZATION-MODEL-CORRECTIVE-01`: `PASS_SAFE_STOP` at commit `79e8687b7e23e43a4a7ca4b17d234fd084284a21`. Direct browser write to App798 is impossible for regular employees without exposing confidential evaluation archives (`GROUP everyone Add=NO, View=NO`).
   - `D3-ARCHIVE-RUNTIME-UNAUTHORIZED-AUTO-START-RECONCILIATION-01`: Reconciled exploratory commits `6b64ceef` and `a69034f2` as non-authoritative research (`bc86b97e793911ad71999288ee44928749978104`).
   - `D3-ARCHIVE-RUNTIME-TRUSTED-WRITER-IDENTITY-FEASIBILITY-01`: Independently reviewed and accepted at commit `8be55309732a7c6d99569e0716369fc74e2f0aa9`. Established `IDENTITY_FEASIBILITY_RESULT = IDENTITY_MODEL_NOT_PROVEN` from official Cybozu/Kintone platform documentation.
2. **Accepted Platform Truths**:
   - Cybozu OAuth supports Confidential Clients only; PKCE and Public Clients are unsupported.
   - Cybozu OAuth does not provide OpenID Connect `id_token` or token introspection.
   - `kintone.proxy()` is a CORS forward proxy without cryptographic user attestation.
   - Browser session cookies are `HttpOnly` and cannot be securely validated externally.
   - Browser privileged secrets (API tokens, admin passwords, shared HMAC keys) are strictly forbidden.

---

## 3. Mandatory Architecture Families Evaluation

### Family A: External Trusted Identity Boundary
*(Enterprise OIDC / Corporate IdP / Entra ID / Google Workspace / Dedicated Auth Gateway)*

- **Mechanism**:
  The browser customization authenticates the user against an external enterprise Identity Provider (e.g., Microsoft Entra ID or Google Workspace) using Authorization Code Grant with PKCE. The resulting cryptographically signed OIDC ID token is forwarded to a Trusted Archive Writer backend. The backend validates token signatures against the enterprise IdP's JWKS, extracts authoritative identity claims, authoritatively maps them to the Kintone employee record, fetches canonical App794 data directly from Kintone using backend credentials (`USER hr`), computes canonical hashes, writes the archive record to App798, and responds to App794.
- **Evaluation Criteria**:
  - *Actual Actor Identity Assurance*: Strong (verified via enterprise cryptographic signature).
  - *Caller Spoofing Resistance*: High (tamper-proof claims in signed JWT).
  - *Privileged Browser Secret Requirement*: None (OIDC PKCE uses dynamic client-side verifiers).
  - *Trusted Execution Boundary*: External backend with privileged `USER hr` Kintone credentials.
  - *App798 Privacy*: Preserved (`GROUP everyone Add = NO, View = NO`).
  - *Canonical Payload Integrity*: Enforced (backend fetches App794 directly).
  - *Locked D3 Invariant Compatibility*: Compatible with synchronous browser event gating.
  - *Infrastructure & Identity Dependency*: **CRITICAL LIMITATION**. Requires an active, enterprise-grade IdP infrastructure (Entra ID / Google) federated with all Kintone user accounts, plus enterprise app registration, CORS/redirect provisioning, and ongoing IdP user lifecycle synchronization. Native Cybozu/Kintone platform cannot provide this.
- **Verdict**: **`REJECTED_UNFEASIBLE_WITHOUT_EXTERNAL_IDP`**. While theoretically secure, it introduces external identity infrastructure dependencies not authorized, not deployed, and entirely outside Kintone's native domain.

---

### Family B: Workflow / Archive Handshake Redesign
*(Pending Archive State / Privileged Archive Worker / Two-Phase Transition / Archive Command Queue)*

- **Mechanism**:
  Decouples untrusted browser execution from the archive write operation by redesigning the App794 Process Management workflow into an authoritative two-phase transition:
  1. **Phase 1 (User Action)**: The employee in App794 initiates a workflow action (e.g., "Submit Evaluation"). Instead of attempting to write to App798 from the browser or invoking an external browser-authenticated writer, App794 transitions into a protected intermediate status: `Archive Pending` (or `Evaluating - Archiving`).
  2. **Phase 2 (Privileged Worker Execution)**: A trusted, server-side Privileged Archive Worker (running as a secure service with `USER hr` credentials) detects the transition (via Kintone Webhook or scheduled queue poller). The worker reads the App794 canonical record and inspects Kintone's native, platform-authoritative Process Management History (`kintone.api('/k/v1/record/status')`). This audit log immutably records the exact authenticated Kintone user who performed the transition.
  3. **Verification & Write**: The worker authoritatively confirms that the actor is authorized, computes the canonical archive payload and SHA-256 hash from App794 physical fields, writes the immutable record to App798, and, upon verified write success, programmatically advances App794 from `Archive Pending` to the target business state (e.g., `Manager Review`).
  4. **Fail-Closed Guarantees**: If the archive write fails, hash conflict occurs, or validation errors arise, the worker halts, does NOT advance App794, and logs an error or reverts the state, preserving absolute fail-closed integrity.
- **Evaluation Criteria**:
  - *Actual Actor Identity Assurance*: **ABSOLUTE / PLATFORM-AUTHORITATIVE**. Identity is extracted directly from Kintone's internal, server-recorded Process Management status log. No browser assertion is trusted.
  - *Caller Spoofing Resistance*: **IMMUNE**. Untrusted browser clients cannot invoke or bypass the worker; the worker acts strictly upon verified Kintone server-state changes.
  - *Privileged Browser Secret Requirement*: **ZERO**. Browser holds no secrets, tokens, or HMAC keys.
  - *Trusted Execution Boundary*: Worker runs exclusively in a secure backend environment.
  - *App798 Privacy*: **100% PRESERVED**. `GROUP everyone Add = NO, View = NO`. Only `USER hr` holds Add/View.
  - *Canonical Payload Integrity*: **ENFORCED SERVER-SIDE**. Worker reads physical App794 fields directly.
  - *Source-Record & Stage Anti-Substitution*: Verified against live Kintone record ID and current status.
  - *Replay & Idempotency*: Worker checks App798 for existing stage hash before writing; duplicate processing is safely no-op'd.
  - *Locked D3 Invariant Compatibility*: **REQUIRES LOCKED INVARIANT CHANGE**. Modifies App794 Process Management status graph by introducing an intermediate pending status and moving the business state advancement from the client event hook to the server worker.
  - *Infrastructure Requirement*: Standard lightweight worker service (e.g., AWS Lambda / Node.js container / existing gateway server extension). Zero new external identity infrastructure required.
- **Verdict**: **`RECOMMENDED_READY_FOR_OWNER_RATIFICATION`**. This is the singular architecture that resolves all security, privacy, and identity challenges natively within Kintone's architectural boundaries without unevidenced external dependencies.

---

### Family C: Controlled Kintone Permission Model
*(Add without View / Record ACL / Field ACL / Immutable Constraints in Browser)*

- **Mechanism**:
  Relies entirely on native Kintone ACL configuration: granting regular employees (`GROUP everyone`) `Add` permission on App798, but restricting `View` permission (e.g., View = NO, or View restricted by Record ACL where `Created By = loginUser`). Archive writes are performed directly from the browser customization during `app.record.detail.process.proceed`.
- **Evaluation Criteria**:
  - *Actual Actor Identity Assurance*: High (uses native browser Kintone session).
  - *Caller Spoofing Resistance*: **CRITICALLY COMPROMISED**. While Kintone assigns `Created By` to the session user, the user controls the HTTP request payload entirely.
  - *DevTools Arbitrary POST Vulnerability*: **FATAL FLAW**. Any authenticated employee can open browser DevTools and execute arbitrary `kintone.api('/k/v1/record', 'POST', { app: 798, record: { ... } })` requests, injecting fabricated ratings, manipulated scores, or counterfeit audit logs directly into App798.
  - *Canonical Payload Integrity*: **UNENFORCEABLE**. Kintone standard field/record ACLs cannot validate that submitted archive field values match canonical App794 physical field values.
  - *App798 Privacy*: **VIOLATED**. Violates the standing constraint `APP798 GROUP everyone Add = NO`.
- **Verdict**: **`REJECTED_CRITICAL_SECURITY_FLAWS`**. Fundamentally insecure against authenticated employee tampering and DevTools abuse.

---

## 4. Comprehensive Decision Criteria & Comparative Matrix

| Evaluation Dimension | Family A (External IdP OIDC) | Family B (Workflow Handshake Redesign) | Family C (Controlled Kintone ACL) |
| :--- | :---: | :---: | :---: |
| **Actor Identity Assurance** | High (OIDC JWT Claims) | **Absolute (Kintone Process Audit Log)** | High (Kintone Session) |
| **Caller Spoofing Resistance** | High | **Absolute (Server-Triggered)** | **Zero (DevTools Payload Manipulation)** |
| **Browser Privileged Secrets** | None | **None** | None |
| **App798 Privacy (`everyone` Add/View=NO)** | **Preserved (Add=NO, View=NO)** | **Preserved (Add=NO, View=NO)** | **Violated (`everyone` Add=YES needed)** |
| **Canonical Payload Integrity** | Enforced by Backend | **Enforced by Backend Worker** | **Unenforceable (Browser Controlled)** |
| **Source-Record Anti-Substitution** | Verified by Backend | **Verified by Backend Worker** | Weak / Client Controlled |
| **Stage/Event Anti-Substitution** | Verified by Backend | **Verified by Backend Worker** | Weak / Client Controlled |
| **Replay Handling & Idempotency** | Supported via Hash Check | **Supported via Hash Check & Status Lock** | Difficult in Browser |
| **Hash-Conflict Fail-Closed** | Yes | **Yes** | Yes |
| **Locked D3 Invariant Compatibility** | Yes (Keeps client hook) | **No (Requires Workflow Status Update)** | Yes (Keeps client hook) |
| **New Infrastructure Required** | Yes (Backend + IdP) | **Yes (Backend Worker only)** | No |
| **New Identity Infrastructure Required** | **YES (Enterprise IdP Mandatory)** | **NO (Uses Native Kintone Audit)** | NO |
| **Process/Schema Blast Radius** | Low (Docs/Client Hook) | **Medium (App794 Status Graph Change)** | Low (App798 ACL Change) |
| **Operational Complexity** | High (Dual IdP + Token Lifecycle) | **Low-Medium (Standard Server Worker)** | Low |
| **UX Impact** | Silent (or IdP Redirect Popup) | **Transient Status ("Archiving...")** | Immediate |
| **Critical Security Blockers** | None (if IdP exists) | **NONE** | **FATAL (DevTools Arbitrary POST)** |
| **OVERALL ARCHITECTURE VERDICT** | **REJECTED** | **RECOMMENDED FOR RATIFICATION** | **REJECTED** |

---

## 5. Threat Modeling & Failure Mode Analysis

| Threat / Failure Scenario | Family A Resilience | Family B Resilience | Family C Resilience |
| :--- | :--- | :--- | :--- |
| **1. Malicious Employee DevTools Abuse** | Resilient: Payload computed by backend. | **Resilient**: App798 write inaccessible to browser. | **Vulnerable**: User can POST arbitrary records. |
| **2. Forged userCode / Impersonation** | Resilient: Identity taken from verified JWT. | **Resilient**: Identity taken from Kintone status log. | Resilient: Kintone stamps `Created By`. |
| **3. Forged Record ID / Target Substitution**| Resilient: Backend validates record ownership. | **Resilient**: Worker triggered by exact App794 ID. | **Vulnerable**: User can submit any target ID. |
| **4. Arbitrary Snapshot Score Tampering** | Resilient: Backend fetches canonical fields. | **Resilient**: Worker fetches canonical fields. | **Vulnerable**: Browser submits score payload. |
| **5. Network Replay / Duplicate Action** | Resilient: SHA-256 conflict fails closed. | **Resilient**: Status transitions are atomic in Kintone.| Complex: Client retry may create duplicates. |
| **6. Backend Worker Outage / Timeout** | Client hook hangs or rejects (fail-closed). | Record remains in `Archive Pending` (fail-closed).| N/A (Direct Kintone API). |
| **7. Leaked Backend Credential (`USER hr`)** | High impact: Restricted to secure backend. | High impact: Restricted to secure backend. | N/A (Uses user session). |
| **8. Unauthorized Archive Visibility** | Protected: `everyone` View = NO. | **Protected**: `everyone` View = NO. | Fragile: Dependent on complex Record ACLs. |

---

## 6. Required Locked Invariant Adjustments (Family B)

To adopt **Family B (`FAMILY_B_WORKFLOW_ARCHIVE_HANDSHAKE_REDESIGN`)**, the Owner must formally ratify changes to the following previously locked assumptions:

1. **Workflow Status Graph Mutation (App794)**:
   - *Previous Invariant*: App794 process management transitions directly between business stages (e.g., `Goal Setting` $\rightarrow$ `Mid-term Review`) via client-side proceed event.
   - *Required New Invariant*: Introduction of intermediate transitional statuses (e.g., `Goal Setting - Archiving` $\rightarrow$ `Goal Setting Completed`) or an asynchronous processing queue state where human users cannot trigger subsequent actions until worker confirmation.
2. **Transition Authority Shift**:
   - *Previous Invariant*: Browser client event hook executes synchronous archive and authorizes transition in a single user turn.
   - *Required New Invariant*: User action initiates transition to `Archive Pending`; final business state transition is executed authoritatively by the Privileged Worker via Kintone REST API upon verified App798 write.

---

## 7. Final Governance State & Declarations

- **ARCHITECTURE_DECISION_RESULT**: `ARCHITECTURE_DECISION_READY_FOR_OWNER_RATIFICATION`
- **RECOMMENDED_CANDIDATE_FOR_OWNER_RATIFICATION**: `FAMILY_B_WORKFLOW_ARCHIVE_HANDSHAKE_REDESIGN`
- **OWNER_RATIFIED_ARCHITECTURE**: `NONE` (Awaiting explicit Owner ratification)
- **IMPLEMENTATION_AUTHORIZED**: `NO`
- **DEPLOYMENT_AUTHORIZED**: `NO`
- **FULL_D3_BUSINESS_UAT**: `NOT_PROVEN`
- **D3_CLOSURE**: `NOT_CLAIMED`
- **PRODUCTION_READY**: `NO`
- **NEXT_GATE_AUTHORIZED**: `NO`
- **AUTO_START_NEXT_WORK_PACKAGE**: `NO`
- **FINAL_STATE**: `STOP FOR INDEPENDENT CONTROL PLANE REVIEW`
