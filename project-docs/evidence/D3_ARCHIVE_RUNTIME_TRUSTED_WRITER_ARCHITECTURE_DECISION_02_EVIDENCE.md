# Evidence: D3 Archive Runtime Trusted Writer Architecture Decision 02

## Document Control
- **Package**: `D3-ARCHIVE-RUNTIME-TRUSTED-WRITER-ARCHITECTURE-DECISION-02-R1`
- **Base HEAD**: `f4ef47379c4c403d49ecf27302d558009e5c7b49`
- **Mode**: `ARCHITECTURE DECISION / DOCS-ONLY / NO IMPLEMENTATION / NO LIVE I/O`
- **Owner Authorization**: `ALREADY APPROVED`
- **Scope Control**: `STRICT (SCOPE_EXPANSION_AUTHORIZED = NO)`

---

## 1. Executive Verdict & Summary Indicators

- **FAMILY_A_VERDICT**: `REJECTED_UNFEASIBLE_WITHOUT_EXTERNAL_IDP`
- **FAMILY_B_VERDICT**: `REJECTED_ACTOR_IDENTITY_UNPROVEN_ON_SERVER`
- **FAMILY_C_VERDICT**: `REJECTED_CRITICAL_SECURITY_FLAWS`
- **ARCHITECTURE_DECISION_RESULT**: `ARCHITECTURE_DECISION_NOT_READY`
- **RECOMMENDED_CANDIDATE_FOR_OWNER_RATIFICATION**: `NONE`
- **SERVER_SIDE_EXACT_TRANSITION_ACTOR**: `UNPROVEN`
- **LOCKED_DECISION_CHANGE_REQUIRED**: `YES` (if Family B or similar workflow redesign is pursued in the future)
- **NEW_INFRASTRUCTURE_REQUIRED**: `YES`
- **NEW_IDENTITY_INFRASTRUCTURE_REQUIRED**: `NO` (for Kintone-native paths, but actor proof is absent; YES for Family A)
- **APP798_EVERYONE_ADD_REQUIRED**: `NO`
- **APP798_EVERYONE_VIEW_REQUIRED**: `NO`
- **BROWSER_PRIVILEGED_SECRET_REQUIRED**: `NO`
- **CRITICAL_UNRESOLVED_SECURITY_BLOCKERS**: `YES`
  1. *Actor Identity Verification Gap*: Server-side verification of the exact human transition actor is `UNPROVEN` in Kintone REST API.
  2. *API Endpoint Invalidation*: `/k/v1/record/status.json` is strictly `PUT`-only (no `GET` endpoint exists), and process status history is exposed only to client-side JS (`kintone.app.record.getStatusHistory`) with no REST audit API.
  3. *Client-side Forgery Vulnerability*: Family C permits arbitrary DevTools `POST` without payload or actor verification.
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
   - `D3-ARCHIVE-RUNTIME-TRUSTED-WRITER-ARCHITECTURE-DECISION-02`: Initial analysis committed at `f4ef47379c4c403d49ecf27302d558009e5c7b49`, identifying architectural families but relying on an unverified assumption regarding server-side status history retrieval.
2. **Accepted Platform Truths (Official Cybozu/Kintone Documentation)**:
   - Cybozu OAuth supports Confidential Clients only; PKCE and Public Clients are unsupported.
   - Cybozu OAuth does not provide OpenID Connect `id_token` or token introspection.
   - `kintone.proxy()` is a CORS forward proxy without cryptographic user attestation.
   - Browser session cookies are `HttpOnly` and cannot be securely validated externally.
   - Browser privileged secrets (API tokens, admin passwords, shared HMAC keys) are strictly forbidden.
   - **Correction on Status History REST API**: Cybozu REST API endpoint `/k/v1/record/status.json` supports **only `PUT`** (updating status). There is **NO `GET` method** for `/k/v1/record/status.json` or `/k/v1/records/status.json`.
   - **Correction on Status History Access**: Status history is only accessible via the client-side JavaScript API (`kintone.app.record.getStatusHistory()`). There is no public, platform-supported REST endpoint to query granular historical process actions or historical assignees/operators for a record from an external server worker.

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
  Decouples untrusted browser execution from the archive write operation by redesigning the App794 Process Management workflow into a two-phase transition:
  1. **Phase 1 (User Action)**: The employee in App794 initiates a workflow action (e.g., "Submit Evaluation"). App794 transitions into an intermediate pending status: `Archive Pending`.
  2. **Phase 2 (Privileged Worker Execution)**: A server-side Privileged Archive Worker (with `USER hr` credentials) detects the transition (via Kintone Webhook or polling). The worker reads App794, attempts to verify the transition actor, writes the immutable archive record to App798, and advances App794 to the next business state.
- **Detailed Evaluation of Server-Side Actor Identity Verification**:
  - **The Invalid Assumption**: The previous proposal assumed that an external worker could query `GET /k/v1/record/status.json` to retrieve the Process Management audit log and identify the exact user who executed the status action.
  - **Platform Reality (Cybozu REST API Specification)**:
    - Official Cybozu documentation establishes that `/k/v1/record/status.json` only accepts `PUT` requests (to update a record's status).
    - There is **no REST API endpoint** for retrieving record status history or process action logs. Status history (`kintone.app.record.getStatusHistory()`) is exclusively available in the client-side JavaScript environment.
    - Standard `GET /k/v1/record.json` returns only the current status (`status.value`), current assignees (`assignee.value`), and the standard system field `Updated by` (`$modifier.value`).
    - **Actor Identity Gap**: While `$modifier` reflects the user who performed the last modification (or status change), Cybozu documentation does NOT guarantee that `$modifier` uniquely and securely attributes the specific workflow action if concurrent or background field updates occur, nor does it provide cryptographic proof. If a Webhook payload is utilized (`type: "STATUS_CHANGE"`), it conveys the status transition and `modifier` object, but Webhook delivery in Kintone is asynchronous, non-blocking, and lacks HMAC signature verification (Kintone webhooks do not support request signing or shared secret verification without custom header matching).
  - **Verdict on Actor Verification**: `SERVER_SIDE_EXACT_TRANSITION_ACTOR = UNPROVEN`. Without a certified, authoritative audit log REST API or signed webhook, an external backend worker cannot authoritatively and tamper-proof verify the exact human transition actor strictly from Kintone REST API.
- **Evaluation Criteria**:
  - *Actual Actor Identity Assurance*: **UNPROVEN**. Exact human actor attribution on server cannot be verified via official Kintone REST API.
  - *Caller Spoofing Resistance*: Medium to High (worker acts on Kintone state, but cannot conclusively prove *which* user triggered the state change versus an unrelated record update).
  - *Privileged Browser Secret Requirement*: Zero (browser holds no secrets).
  - *App798 Privacy*: Preserved (`GROUP everyone Add = NO, View = NO`).
  - *Canonical Payload Integrity*: Enforced (worker reads App794 physical fields).
  - *Locked D3 Invariant Compatibility*: Requires modifying App794 process management status graph.
  - *Infrastructure Requirement*: External worker service required.
- **Verdict**: **`REJECTED_ACTOR_IDENTITY_UNPROVEN_ON_SERVER`**. Because exact actor identity verification cannot be proven on the server using documented Cybozu REST APIs, Family B cannot be recommended for Owner ratification at this stage.

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
| **Actor Identity Assurance** | High (OIDC JWT Claims) | **UNPROVEN (No REST Status History API)** | High (Kintone Session) |
| **Caller Spoofing Resistance** | High | Medium-High (State-driven, but unverified actor) | **Zero (DevTools Payload Manipulation)** |
| **Browser Privileged Secrets** | None | None | None |
| **App798 Privacy (`everyone` Add/View=NO)** | **Preserved (Add=NO, View=NO)** | **Preserved (Add=NO, View=NO)** | **Violated (`everyone` Add=YES needed)** |
| **Canonical Payload Integrity** | Enforced by Backend | Enforced by Backend Worker | **Unenforceable (Browser Controlled)** |
| **Source-Record Anti-Substitution** | Verified by Backend | Verified by Backend Worker | Weak / Client Controlled |
| **Stage/Event Anti-Substitution** | Verified by Backend | Partial (Current status known, actor unproven) | Weak / Client Controlled |
| **Replay Handling & Idempotency** | Supported via Hash Check | Supported via Hash Check & Status Lock | Difficult in Browser |
| **Hash-Conflict Fail-Closed** | Yes | Yes | Yes |
| **Locked D3 Invariant Compatibility** | Yes (Keeps client hook) | No (Requires Workflow Status Update) | Yes (Keeps client hook) |
| **New Infrastructure Required** | Yes (Backend + IdP) | Yes (Backend Worker) | No |
| **New Identity Infrastructure Required** | **YES (Enterprise IdP Mandatory)** | NO (but actor identity unproven) | NO |
| **Process/Schema Blast Radius** | Low (Docs/Client Hook) | Medium (App794 Status Graph Change) | Low (App798 ACL Change) |
| **Operational Complexity** | High (Dual IdP + Token Lifecycle) | Low-Medium (Standard Server Worker) | Low |
| **UX Impact** | Silent (or IdP Redirect Popup) | Transient Status ("Archiving...") | Immediate |
| **Critical Security Blockers** | Missing IdP Infrastructure | **Actor Identity Unproven on Server** | **FATAL (DevTools Arbitrary POST)** |
| **OVERALL ARCHITECTURE VERDICT** | **REJECTED** | **REJECTED** | **REJECTED** |

---

## 5. Threat Modeling & Failure Mode Analysis

| Threat / Failure Scenario | Family A Resilience | Family B Resilience | Family C Resilience |
| :--- | :--- | :--- | :--- |
| **1. Malicious Employee DevTools Abuse** | Resilient: Payload computed by backend. | Resilient: App798 write inaccessible to browser. | **Vulnerable**: User can POST arbitrary records. |
| **2. Forged userCode / Impersonation** | Resilient: Identity taken from verified JWT. | **Vulnerable / Unproven**: Worker cannot authoritatively verify exact human actor. | Resilient: Kintone stamps `Created By`. |
| **3. Forged Record ID / Target Substitution**| Resilient: Backend validates record ownership. | Resilient: Worker triggered by exact App794 ID. | **Vulnerable**: User can submit any target ID. |
| **4. Arbitrary Snapshot Score Tampering** | Resilient: Backend fetches canonical fields. | Resilient: Worker fetches canonical fields. | **Vulnerable**: Browser submits score payload. |
| **5. Network Replay / Duplicate Action** | Resilient: SHA-256 conflict fails closed. | Resilient: Status transitions are atomic in Kintone. | Complex: Client retry may create duplicates. |
| **6. Backend Worker Outage / Timeout** | Client hook hangs or rejects (fail-closed). | Record remains in `Archive Pending` (fail-closed).| N/A (Direct Kintone API). |
| **7. Leaked Backend Credential (`USER hr`)** | High impact: Restricted to secure backend. | High impact: Restricted to secure backend. | N/A (Uses user session). |
| **8. Unauthorized Archive Visibility** | Protected: `everyone` View = NO. | Protected: `everyone` View = NO. | Fragile: Dependent on complex Record ACLs. |

---

## 6. Official Platform Reference & Evidence Grounding

1. **Cybozu REST API Reference (`/k/v1/record/status.json`)**:
   - URL: `https://cybozu.dev/ja/kintone/docs/rest-api/records/update-status/`
   - HTTP Method: `PUT` only.
   - Purpose: Updates status of a single record (`1件のレコードのステータスを更新する`).
   - Request Parameters: `app`, `id`, `action`, `assignee` (optional), `revision` (optional).
   - Response: `revision`.
   - Documentation confirms there is **no `GET` method** or query interface on `/k/v1/record/status.json`.
2. **Cybozu JavaScript API Reference (`getStatusHistory`)**:
   - URL: `https://cybozu.dev/ja/kintone/docs/js-api/record/get-status-history/`
   - Function: `kintone.app.record.getStatusHistory(offset, limit)`
   - Scope: Available exclusively inside browser client context (`レコード詳細画面`, `レコード編集画面`, `レコード印刷画面`).
   - Unavailable in server-side REST API.
3. **Cybozu Webhook Specification**:
   - URL: `https://cybozu.dev/ja/kintone/docs/webhook/`
   - Webhook events are asynchronous HTTP POST notifications.
   - Kintone native webhooks do NOT support HMAC-SHA256 signature verification headers. Therefore, external endpoints cannot cryptographically verify that an incoming webhook was authentically generated by Kintone rather than an attacker.

---

## 7. Final Governance State & Declarations

- **ARCHITECTURE_DECISION_RESULT**: `ARCHITECTURE_DECISION_NOT_READY`
- **RECOMMENDED_CANDIDATE_FOR_OWNER_RATIFICATION**: `NONE`
- **SERVER_SIDE_EXACT_TRANSITION_ACTOR**: `UNPROVEN`
- **OWNER_RATIFIED_ARCHITECTURE**: `NONE`
- **IMPLEMENTATION_AUTHORIZED**: `NO`
- **DEPLOYMENT_AUTHORIZED**: `NO`
- **FULL_D3_BUSINESS_UAT**: `NOT_PROVEN`
- **D3_CLOSURE**: `NOT_CLAIMED`
- **PRODUCTION_READY**: `NO`
- **NEXT_GATE_AUTHORIZED**: `NO`
- **AUTO_START_NEXT_WORK_PACKAGE**: `NO`
- **FINAL_STATE**: `STOP FOR INDEPENDENT CONTROL PLANE REVIEW`
