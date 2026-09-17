# Evidence: D3 Archive Runtime Trusted Writer Architecture Decision 02

## Document Control
- **Package**: `D3-ARCHIVE-RUNTIME-TRUSTED-WRITER-ARCHITECTURE-DECISION-02-R1-CLOSE`
- **Base HEAD**: `798da943fdf66b3750900a8f4dcf4984ae5ee806`
- **Mode**: `ONE_FILE_EVIDENCE_CONTRACT_CLOSURE`
- **Owner Authorization**: `APPROVED`
- **Scope Control**: `STRICT (SCOPE_EXPANSION_AUTHORIZED = NO)`
- **SUPERSEDES_R1_EVIDENCE_CONTRACT_GAPS**: `YES`

---

## 1. Executive Verdict & Required Terminal Contract

```yaml
PACKAGE: D3-ARCHIVE-RUNTIME-TRUSTED-WRITER-ARCHITECTURE-DECISION-02-R1-CLOSE
BASE_HEAD: 798da943fdf66b3750900a8f4dcf4984ae5ee806
MODE: ONE_FILE_EVIDENCE_CONTRACT_CLOSURE
SUPERSEDES_R1_EVIDENCE_CONTRACT_GAPS: YES

RECORD_STATUS_REST_HISTORY_READ: PROVEN_UNSUPPORTED
STATUS_HISTORY_CLIENT_ACCESS: PROVEN_SUPPORTED
STATUS_HISTORY_CLIENT_CONTEXT: KINTONE_RECORD_SCREEN_JAVASCRIPT_API
STATUS_HISTORY_CLIENT_WORKER_DATA: PROVEN_AVAILABLE
STATUS_HISTORY_CLIENT_WORKER_FIELDS: assignees[].code + assignees[].name
STATUS_HISTORY_CLIENT_EVENT_CONTEXT_FIELDS: changedAt + status
STATUS_HISTORY_SERVER_REST_ACCESS: PROVEN_UNSUPPORTED
STATUS_HISTORY_SERVER_ACCESS: PROVEN_UNSUPPORTED
CLIENT_TO_SERVER_TRUSTED_ACTOR_ATTESTATION: NOT_PROVEN
SERVER_INDEPENDENT_STATUS_HISTORY_ACTOR_LOOKUP: NOT_PROVEN
WEBHOOK_EVENT_TYPE: UPDATE_STATUS
WEBHOOK_EXACT_HUMAN_ACTOR: NOT_PROVEN
WEBHOOK_SIGNING_MECHANISM: NO_DOCUMENTED_WEBHOOK_SIGNING_MECHANISM_ESTABLISHED_IN_REVIEWED_OFFICIAL_SOURCES
UPDATED_BY_AS_TRANSITION_ACTOR: NOT_PROVEN
SERVER_SIDE_EXACT_TRANSITION_ACTOR: NOT_PROVEN
ARCHIVED_BY_EXACT_ACTOR_PROOF_FOR_TRUSTED_WRITER: NOT_PROVEN
ARCHIVED_BY_EXACT_ACTOR_PROOF: NOT_PROVEN

FAMILY_A_VERDICT: REJECTED_UNFEASIBLE_WITHOUT_EXTERNAL_IDP
FAMILY_B_VERDICT: NOT_READY_ACTOR_TRUST_BOUNDARY_UNRESOLVED
FAMILY_C_VERDICT: REJECTED_CRITICAL_SECURITY_FLAWS

ARCHITECTURE_DECISION_RESULT: ARCHITECTURE_DECISION_NOT_READY
RECOMMENDED_CANDIDATE_FOR_OWNER_RATIFICATION: NONE

LOCKED_DECISION_CHANGE_REQUIRED: YES
NEW_INFRASTRUCTURE_REQUIRED: YES
NEW_IDENTITY_INFRASTRUCTURE_REQUIRED: NO
APP798_EVERYONE_ADD_REQUIRED: NO
APP798_EVERYONE_VIEW_REQUIRED: NO
BROWSER_PRIVILEGED_SECRET_REQUIRED: NO

CRITICAL_UNRESOLVED_SECURITY_BLOCKERS: YES
OWNER_RATIFIED_ARCHITECTURE: NONE
IMPLEMENTATION_AUTHORIZED: NO
DEPLOYMENT_AUTHORIZED: NO
FULL_D3_BUSINESS_UAT: NOT_PROVEN
D3_CLOSURE: NOT_CLAIMED
PRODUCTION_READY: NO

NEXT_GATE_AUTHORIZED: NO
AUTO_START_NEXT_WORK_PACKAGE: NO
FINAL_STATE: STOP_FOR_INDEPENDENT_CONTROL_PLANE_REVIEW
```

---

## 2. Accepted Authority & Historical Context

1. **Accepted Predecessor Packages**:
   - `D3-ARCHIVE-RUNTIME-AUTHORIZATION-MODEL-CORRECTIVE-01`: `PASS_SAFE_STOP` at commit `79e8687b7e23e43a4a7ca4b17d234fd084284a21`. Direct browser write to App798 is impossible for regular employees without exposing confidential evaluation archives (`GROUP everyone Add=NO, View=NO`).
   - `D3-ARCHIVE-RUNTIME-UNAUTHORIZED-AUTO-START-RECONCILIATION-01`: Reconciled exploratory commits `6b64ceef` and `a69034f2` as non-authoritative research (`bc86b97e793911ad71999288ee44928749978104`).
   - `D3-ARCHIVE-RUNTIME-TRUSTED-WRITER-IDENTITY-FEASIBILITY-01`: Independently reviewed and accepted at commit `8be55309732a7c6d99569e0716369fc74e2f0aa9`. Established `IDENTITY_FEASIBILITY_RESULT = IDENTITY_MODEL_NOT_PROVEN` from official Cybozu/Kintone platform documentation.
   - `D3-ARCHIVE-RUNTIME-TRUSTED-WRITER-ARCHITECTURE-DECISION-02`: Initial analysis at `f4ef47379c4c403d49ecf27302d558009e5c7b49`.
   - `D3-ARCHIVE-RUNTIME-TRUSTED-WRITER-ARCHITECTURE-DECISION-02-R1`: Corrective package at commit `798da943fdf66b3750900a8f4dcf4984ae5ee806` downgrading Family B and establishing unproven server-side transition actor identity.
2. **Accepted Platform Truths (Official Cybozu/Kintone Documentation)**:
   - Cybozu OAuth supports Confidential Clients only; PKCE and Public Clients are unsupported.
   - Cybozu OAuth does not provide OpenID Connect `id_token` or token introspection.
   - `kintone.proxy()` is a CORS forward proxy without cryptographic user attestation.
   - Browser session cookies are `HttpOnly` and cannot be securely validated externally.
   - Browser privileged secrets (API tokens, admin passwords, shared HMAC keys) are strictly forbidden.
   - **REST Status History Contract**: REST endpoint `/k/v1/record/status.json` supports **only `PUT`**. There is **no `GET` method** for `/k/v1/record/status.json` or `/k/v1/records/status.json` (`RECORD_STATUS_REST_HISTORY_READ = PROVEN_UNSUPPORTED`, `STATUS_HISTORY_SERVER_REST_ACCESS = PROVEN_UNSUPPORTED`).
   - **Status History Client Access Contract**: Status history is proven supported via client JavaScript `kintone.app.record.getStatusHistory(offset, limit)` in record screen contexts (`STATUS_HISTORY_CLIENT_ACCESS = PROVEN_SUPPORTED`, `STATUS_HISTORY_CLIENT_WORKER_DATA = PROVEN_AVAILABLE`). Documented fields include `changedAt`, `status`, and `assignees[]` (`assignees[].code`, `assignees[].name`), representing the workers for that history entry.
   - **Status History Server Access Contract**: Status history is unavailable from server-side REST API (`STATUS_HISTORY_SERVER_ACCESS = PROVEN_UNSUPPORTED`, `STATUS_HISTORY_SERVER_REST_ACCESS = PROVEN_UNSUPPORTED`).
   - **Real Trust Gap**: While client-side Kintone exposes status-history worker information, the trusted backend has no proven server-side mechanism to independently obtain or cryptographically validate that exact history entry without trusting browser-supplied data (`CLIENT_TO_SERVER_TRUSTED_ACTOR_ATTESTATION = NOT_PROVEN`, `SERVER_INDEPENDENT_STATUS_HISTORY_ACTOR_LOOKUP = NOT_PROVEN`, `SERVER_SIDE_EXACT_TRANSITION_ACTOR = NOT_PROVEN`, `ARCHIVED_BY_EXACT_ACTOR_PROOF_FOR_TRUSTED_WRITER = NOT_PROVEN`).

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
- **Server-Side Actor Identity Verification Analysis**:
  - **REST Status History Gap**: Official Cybozu documentation establishes that `/k/v1/record/status.json` only accepts `PUT` requests (`RECORD_STATUS_REST_HISTORY_READ = PROVEN_UNSUPPORTED`, `STATUS_HISTORY_SERVER_REST_ACCESS = PROVEN_UNSUPPORTED`). There is no server-side REST audit endpoint for status history (`STATUS_HISTORY_SERVER_ACCESS = PROVEN_UNSUPPORTED`).
  - **Client-Side Status History API**: In the browser, `kintone.app.record.getStatusHistory(offset, limit)` returns status history entries containing `changedAt`, `status`, and `assignees[]` (`assignees[].code`, `assignees[].name`) who performed the work (`STATUS_HISTORY_CLIENT_ACCESS = PROVEN_SUPPORTED`, `STATUS_HISTORY_CLIENT_WORKER_DATA = PROVEN_AVAILABLE`).
  - **Real Trust Boundary Gap**: The unresolved architecture problem is that client-side Kintone can expose status-history worker information, BUT the trusted backend has no proven server-side mechanism to independently obtain or cryptographically validate that exact history entry without trusting browser-supplied data (`CLIENT_TO_SERVER_TRUSTED_ACTOR_ATTESTATION = NOT_PROVEN`, `SERVER_INDEPENDENT_STATUS_HISTORY_ACTOR_LOOKUP = NOT_PROVEN`). The issue is TRUST BOUNDARY, not absence of client data.
  - **Updated By ($modifier) Non-Equivalence**: Standard `GET /k/v1/record.json` returns `$modifier` (Updated by). The reviewed official contract does not establish that Updated By is a durable, event-scoped identity authority for the exact archived workflow transition under all concurrent or subsequent modification cases (`UPDATED_BY_AS_TRANSITION_ACTOR = NOT_PROVEN`).
  - **Webhook Contract & Boundaries**:
    - The reviewed official platform event type for status changes is `UPDATE_STATUS` (`WEBHOOK_EVENT_TYPE = UPDATE_STATUS`).
    - Webhook delivery in Kintone is asynchronous and does not establish guaranteed exact human transition actor proof (`WEBHOOK_EXACT_HUMAN_ACTOR = NOT_PROVEN`).
    - Based on reviewed official sources, there is no documented cryptographic webhook signing mechanism (e.g., HMAC-SHA256 headers) established (`WEBHOOK_SIGNING_MECHANISM = NO_DOCUMENTED_WEBHOOK_SIGNING_MECHANISM_ESTABLISHED_IN_REVIEWED_OFFICIAL_SOURCES`).
  - **Archived_By Contract Failure**: Under the locked D3 archive contract, `Archived_By` must represent exact authoritative actor provenance and cannot be substituted with worker credentials, inferred record fields, assignee, unverified Updated By, or unverified client status-history payloads (`ARCHIVED_BY_EXACT_ACTOR_PROOF_FOR_TRUSTED_WRITER = NOT_PROVEN`, `SERVER_SIDE_EXACT_TRANSITION_ACTOR = NOT_PROVEN`).
- **Evaluation Criteria**:
  - *Actual Actor Identity Assurance*: **NOT_PROVEN**. Exact human actor attribution on server cannot be proven via documented Kintone REST APIs or cryptographically validated from the client without trusting untrusted browser inputs.
  - *Caller Spoofing Resistance*: Medium to High (state-driven, but unverified actor).
  - *Privileged Browser Secret Requirement*: Zero (browser holds no secrets).
  - *App798 Privacy*: Preserved (`GROUP everyone Add = NO, View = NO`).
  - *Canonical Payload Integrity*: Enforced (worker reads App794 physical fields).
  - *Locked D3 Invariant Compatibility*: Requires modifying App794 process management status graph.
  - *Infrastructure Requirement*: External worker service required.
- **Verdict**: **`NOT_READY_ACTOR_TRUST_BOUNDARY_UNRESOLVED`**. Until client-to-server trusted actor attestation or an independently server-verifiable equivalent is proven, Family B cannot satisfy the locked provenance contract.

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
| **Actor Identity Assurance** | High (OIDC JWT Claims) | **NOT_PROVEN (Client data available, Server trust boundary unproven)** | High (Kintone Session) |
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
| **New Identity Infrastructure Required** | **YES (Enterprise IdP Mandatory)** | NO (but actor trust boundary unproven) | NO |
| **Process/Schema Blast Radius** | Low (Docs/Client Hook) | Medium (App794 Status Graph Change) | Low (App798 ACL Change) |
| **Operational Complexity** | High (Dual IdP + Token Lifecycle) | Low-Medium (Standard Server Worker) | Low |
| **UX Impact** | Silent (or IdP Redirect Popup) | Transient Status ("Archiving...") | Immediate |
| **Critical Security Blockers** | Missing IdP Infrastructure | **Actor Trust Boundary Unresolved** | **FATAL (DevTools Arbitrary POST)** |
| **OVERALL ARCHITECTURE VERDICT** | **REJECTED** | **NOT_READY_ACTOR_TRUST_BOUNDARY_UNRESOLVED** | **REJECTED** |

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
   - Documentation confirms there is **no `GET` method** or query interface on `/k/v1/record/status.json` (`RECORD_STATUS_REST_HISTORY_READ = PROVEN_UNSUPPORTED`).
2. **Cybozu JavaScript API Reference (`getStatusHistory`)**:
   - URL: `https://cybozu.dev/ja/kintone/docs/js-api/record/get-status-history/`
   - Function: `kintone.app.record.getStatusHistory(offset, limit)`
   - Scope: Available exclusively inside browser client context (`レコード詳細画面`, `レコード編集画面`, `レコード印刷画面`).
   - Fields: Returns history entries containing `changedAt`, `status`, and `assignees[]` (`assignees[].code`, `assignees[].name`) documenting the users/workers who performed the status action (`STATUS_HISTORY_CLIENT_ACCESS = PROVEN_SUPPORTED`, `STATUS_HISTORY_CLIENT_WORKER_DATA = PROVEN_AVAILABLE`).
   - Boundary: Client-only JavaScript API; unavailable in server-side REST API (`STATUS_HISTORY_SERVER_REST_ACCESS = PROVEN_UNSUPPORTED`). Trusted backend cannot query this endpoint directly.
3. **Cybozu Webhook Specification (`UPDATE_STATUS`)**:
   - URL: `https://cybozu.dev/ja/kintone/docs/webhook/`
   - Official event type for record status updates: `UPDATE_STATUS` (`WEBHOOK_EVENT_TYPE = UPDATE_STATUS`).
   - Webhook delivery is asynchronous and does not establish verified exact human actor provenance (`WEBHOOK_EXACT_HUMAN_ACTOR = NOT_PROVEN`).
   - Reviewed official sources do not establish any supported cryptographic signing mechanism (such as HMAC headers) (`WEBHOOK_SIGNING_MECHANISM = NO_DOCUMENTED_WEBHOOK_SIGNING_MECHANISM_ESTABLISHED_IN_REVIEWED_OFFICIAL_SOURCES`).
