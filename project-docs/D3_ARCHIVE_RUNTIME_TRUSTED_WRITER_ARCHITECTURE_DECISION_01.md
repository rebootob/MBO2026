# D3-ARCHIVE-RUNTIME-TRUSTED-WRITER-ARCHITECTURE-DECISION-01

## 1. Document Control & Decision Header

```text
DOCUMENT_ID                  = D3-ARCHIVE-RUNTIME-TRUSTED-WRITER-ARCHITECTURE-DECISION-01
PACKAGE                      = D3-ARCHIVE-RUNTIME-TRUSTED-WRITER-ARCHITECTURE-DECISION-01-R1
CANONICAL_BRANCH             = ai/antigravity-wp002c
BASE_HEAD                    = 6b64ceef668dec45d92123715783289f800dc49f
MODE                         = ONE-FILE DOCS-ONLY ARCHITECTURE CORRECTIVE
PURPOSE                      = Define single Owner-ratifiable Trusted Archive Writer Architecture for D3
KINTONE_READS                = 0
KINTONE_WRITES               = 0
EXTERNAL_INFRA_WRITES        = 0
SOURCE_CHANGES               = 0
TEST_CHANGES                 = 0
DIST_CHANGES                 = 0
APP798_ACL_MODIFIED          = NO
CALLER_AUTHENTICATION        = CYBOZU_OAUTH2_USER_BOUND_TOKEN
BROWSER_PRIVILEGED_SECRET    = NONE
HMAC_BROWSER_SHARED_SECRET   = NONE
TOKEN_VALIDATION_MODEL       = USER_ENDPOINT_PROBING (UNPROVEN_ON_PLATFORM)
EVERYONE_APP798_VIEW         = NO
EVERYONE_APP798_ADD          = NO
SYNCHRONOUS_ARCHIVE_BEFORE_TRANSITION = YES
HASH_CONFLICT_FAIL_CLOSED    = YES
TRANSITION_FAIL_CLOSED       = YES
TLS_MINIMUM                  = 1.2
TLS_1_3                      = PREFERRED
HOSTING                      = MANAGED SERVERLESS OR HARDENED CONTAINER RUNTIME
ARCHITECTURE_DECISION        = BLOCKED_MORE_INFORMATION_REQUIRED
SELECTED_ARCHITECTURE        = D3_TRUSTED_ARCHIVE_WRITER_SERVICE (D3-TAWS)
```

---

## 2. Locked Problem Statement & Architectural Context

1. **Client-Side Execution Context:**
   App 794 Desktop Customization (`dist/mbo-employee-app.js`) runs inside end-user web browsers on Cybozu Kintone SaaS (`https://rebootob.cybozu.com`). All native `kintone.api()` calls carry the ambient Cybozu session cookie of the logged-in user.
2. **Current Least-Privilege ACL of App 798 (Revision 6):**
   - `USER hr`: `appEditable=false`, `recordViewable=true`, `recordAddable=true`, `recordEditable=false`, `recordDeletable=false`
   - `GROUP everyone`: `appEditable=false`, `recordViewable=false`, `recordAddable=false`, `recordEditable=false`, `recordDeletable=false`
3. **Workflow Actor Collision:**
   - **Transition 1** (`05 Objective Approved` &rarr; `06 Employee Mid-Year`): Actor is Employee (`Requester_User`).
   - **Transition 2** (`10 Mid-Year Completed` &rarr; `11 Employee Self Evaluation`): Actor is Employee (`Requester_User`).
   - **Transition 3** (`15 HR Final Check` &rarr; `16 Completed`): Actor is HR Operator (`USER hr`).
   When employees execute Transitions 1 and 2, browser-executed direct writes to App 798 are rejected by Kintone with `HTTP 403 Forbidden` (`GAIA_IL02`).
4. **Mandatory Invariants:**
   - `APP794_ROUTE_SNAPSHOT_REUSE_BEFORE_ARCHIVE_SUCCESS = FORBIDDEN`: Archival must succeed **before** the workflow transition is committed.
   - Fail-closed: Any archive failure must abort the transition (`return false`).
   - Privacy: Ordinary employees must **not** gain `recordViewable=true` or `recordAddable=true` access to App 798 (`EVERYONE_APP798_VIEW = NO`, `EVERYONE_APP798_ADD = NO`).
   - Zero Browser Secrets: `BROWSER_PRIVILEGED_SECRET = NONE`. No API tokens, HR credentials, private keys, or shared HMAC signing secrets may ever exist in client-side code or storage.
   - Zero Arbitrary Payloads: Browser must not author or inject archive data.
5. **Architectural Gap:**
   App 794 browser clients have no existing deployed authenticated server-side writer path. The existing `mbo-gateway-server.js` prototype was designed for Mode 2 (App 801 secondary auth) and is undeployed.

---

## 3. Evaluation of Candidate Models

| Candidate | Description | Security Model | Synchronous Fail-Closed | Feasibility & Complexity | Rejection / Selection Reason |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Candidate 1: Dedicated Trusted Archive Writer Service (D3-TAWS)** | Standalone, stateless, least-privilege service. Holds server credential for App 798; authenticates caller via Cybozu OAuth2 user-bound token; independently reconstructs snapshot from App 794; enforces idempotency; returns synchronous verdict. | **Strict Least Privilege:** Zero browser secrets (`BROWSER_PRIVILEGED_SECRET = NONE`). Server constructs payload. Verifies caller identity and workflow authority independently. | **COMPATIBLE:** Synchronous HTTP response before browser proceeds with transition. | **High Feasibility / Governance Blocked:** Core architecture is sound, but in-browser Cybozu OAuth2 token acquisition without client secret exposure is unproven on platform. | **SELECTED ARCHITECTURE (BLOCKED):** Conceptually selected, but marked `BLOCKED_MORE_INFORMATION_REQUIRED` pending proof of browser-safe Cybozu OAuth2 token issuance and validation. |
| **Candidate 2: Extension of Existing `mbo-gateway-server`** | Extend Node.js gateway with `/api/mbo/archive/stage-completion`. | Relies on server-held token, but current gateway auth is tightly coupled to Mode 2 (App 801 secondary auth). Mode 1 users have no `mbo_session` cookie. | **COMPATIBLE** if synchronous HTTP is maintained. | **Medium Feasibility / High Risk:** Forces two distinct identity domains (Mode 1 vs Mode 2) into one server; gateway is undeployed. | **REJECTED AS UNIFIED SERVICE:** Abstractions partially reused, but Mode 1 must not be coupled to Mode 2 secondary auth stores. |
| **Candidate 3: Kintone Native Webhooks / Event Bridge** | Kintone Webhook triggers external writer on status change. | Server-side write to App 798, but fires **asynchronously after** status change is committed in App 794. | **FATAL FLAW (INCOMPATIBLE):** Webhook fires after transition. Cannot block transition if archive fails. | **Low Complexity / Fatal Governance Violation:** Breaks `APP794_ROUTE_SNAPSHOT_REUSE_BEFORE_ARCHIVE_SUCCESS`. | **REJECTED:** Violates synchronous archive-before-transition requirement. |
| **Candidate 4: ACL Direct Browser Write (`GROUP everyone: recordAddable=true`)** | Grant `GROUP everyone` Add permission on App 798 while keeping `recordViewable=false`. | **Severe Vulnerability:** Unauthenticated payload submission. Any user can post arbitrary JSON to App 798 via DevTools console. No server-side integrity check. | **COMPATIBLE** synchronously, but zero data integrity. | **Trivially Feasible / Unacceptable Risk:** Direct violation of Principle 3 and Principle 5. | **REJECTED:** Violates prohibition against arbitrary browser-authored archive writes and abuse analysis rules. |
| **Candidate 5: Two-Phase Workflow Handshake via Kintone Process** | Split transition into `05 Approved` &rarr; `05.1 Archiving` &rarr; Privileged Worker &rarr; `06 Mid-Year`. | Relies on intermediate status and background worker polling/webhook. | **COMPATIBLE** through complex workflow state machine. | **Very High Complexity:** Requires changing App 794 process schema (19 states to 22+ states), breaking existing approved workflow definitions. | **REJECTED:** Excessive schema blast radius and organizational disruption when a synchronous trusted writer is achievable. |

---

## 4. Selected Architecture: D3 Trusted Archive Writer Service (D3-TAWS)

### 4.1 Architecture Overview
D3-TAWS is an isolated, stateless, HTTPS-based trusted execution boundary. It sits between the App 794 browser customization and the Kintone REST API for App 798.

```text
[ App 794 Browser Runtime ]
         |
         | 1. User clicks transition action ("Start Mid-Year")
         | 2. Browser calls D3-TAWS: POST /api/v1/archive/stage-completion
         |    Headers: Authorization: Bearer <Cybozu_User_OAuth_Token>
         |    Body: { sourceRecordId: 17, actionName: "Start Mid-Year", targetStage: "OBJECTIVE" }
         v
[ D3-TAWS: Trusted Execution Boundary ]
         |
         | 3. Authenticate caller identity via Cybozu User API (/v1/users/own.json)
         | 4. Fetch authoritative App 794 record via Server Credential (GET /k/v1/record.json?app=794&id=17)
         | 5. Validate caller against App 794 Workflow Authority (Must match Requester_User)
         | 6. Validate pre-transition status (Must be "05 Objective Approved")
         | 7. Construct canonical logicalSnapshot server-side (Zero browser payload trust)
         | 8. Compute Snapshot_Hash and evaluate idempotency against App 798
         |    - If identical exists: return HTTP 200 { status: "IDEMPOTENT_SUCCESS" }
         |    - If different hash exists for same key: return HTTP 409 (FAIL-CLOSED)
         | 9. Write canonical record to App 798 using server token (POST /k/v1/record.json)
         |
         v
[ Kintone App 798: Immutable Revision Archive ]
         |
         | 10. D3-TAWS returns HTTP 200 { success: true, archiveRecordId, snapshotHash }
         v
[ App 794 Browser Runtime ]
         |
         | 11. Event handler receives success -> returns event (Transition commits in Kintone)
         |     (If error or timeout: handler shows error UI -> returns false -> Transition BLOCKED)
```

---

## 5. Architectural Specifications (A through O)

### A. Runtime Location
Stateless execution container or function (managed serverless or hardened container runtime) deployed within the governed Orbis cloud boundary, isolated from client web applications.

### B. Caller Authentication
- **Sole Authoritative Model:** Cybozu OAuth 2.0 User-Bound Bearer Token (`CALLER_AUTHENTICATION = CYBOZU_OAUTH2_USER_BOUND_TOKEN`).
- **Complete Elimination of Shared Secrets:** `BROWSER_PRIVILEGED_SECRET = NONE` and `HMAC_BROWSER_SHARED_SECRET = NONE`. No pre-shared HMAC keys, signing secrets, or proxy bootstrap tokens may be held by or shared with browser code.
- **Token Authenticity Validation:** Cybozu Kintone SaaS does **not** provide an RFC 7662 token introspection endpoint (`/oauth2/introspect`). D3-TAWS must validate tokens by executing a server-side probe against Cybozu User API (`https://rebootob.cybozu.com/v1/users/own.json`) carrying the inbound bearer token.
- **Platform Unproven Status:** Because browser-safe Cybozu OAuth2 token acquisition without client secret exposure (e.g. standard PKCE public client) is not currently proven from repository or Cybozu documentation facts, this model remains provisional pending external factual verification. Under no circumstances will unauthenticated calls or arbitrary user code claims in the request body be accepted.

### C. Caller Authorization
D3-TAWS independently fetches the App 794 source record from Kintone and evaluates business authority:
- For `OBJECTIVE` stage (`05` &rarr; `06`): Authenticated user must match `record.Requester_User.value[0].code` (or record's `Employee_Code`).
- For `MIDYEAR` stage (`10` &rarr; `11`): Authenticated user must match `record.Requester_User.value[0].code`.
- For `FINAL` stage (`15` &rarr; `16`): Authenticated user must belong to the HR Administrative Group.
Any mismatch results in immediate `HTTP 403 Forbidden` (`CALLER_UNAUTHORIZED_FOR_RECORD_TRANSITION`).

### D. Privileged Kintone Credential Storage
- Stored exclusively in server-side environment / secret manager (`KINTONE_ARCHIVE_WRITER_TOKEN`).
- Managed via encrypted cloud secret vault. Never checked into Git, never sent to browser, never written to client-accessible logs.

### E. App 794 Source Record / State Verification
D3-TAWS performs authoritative read of App 794 using server credentials:
- Validates that Record ID exists and is not deleted.
- Validates current status matches exact transition entry condition:
  - `OBJECTIVE`: Current status must be `05 Objective Approved` and action must be `Start Mid-Year`.
  - `MIDYEAR`: Current status must be `10 Mid-Year Completed` and action must be `Start Self Evaluation`.
  - `FINAL`: Current status must be `15 HR Final Check` and action must be `Complete`.
- Validates required provenance fields (`Record_Key`, `Fiscal_Year`, `Employee_Code`, `Revision_Number`, `Routing_Model`, `Manager_Level1_Approvers`).

### F. Archive Payload Construction Authority
- **Authority:** Exclusively Server-Side (D3-TAWS).
- The browser submits only metadata: `{ sourceRecordId, actionName, targetStage }`.
- D3-TAWS executes `buildStageLogicalSnapshot` using the server-fetched App 794 record.
- D3-TAWS normalizes weights, strips volatile fields, formats JSON, and computes `Snapshot_Hash` using canonical SHA-256.

### G. Replay Protection
- Transition validation: A transition can only occur once from a given stage. Once App 794 moves to `06`, subsequent requests for `05` will be rejected as `INVALID_STAGE_STATE`.
- Nonce / Timestamp verification: Requests older than 60 seconds are rejected (`REQUEST_EXPIRED`).

### H. Idempotency & Hash-Conflict Handling
- D3-TAWS queries App 798 for existing records matching `Source_Record_Key = "..." and Evaluation_Stage = "..."`:
  - If match found and `Snapshot_Hash` is **identical**: Returns `HTTP 200 { status: "IDEMPOTENT_SUCCESS", archiveRecordId }`.
  - If match found and `Snapshot_Hash` is **different**: Fails closed immediately with `HTTP 409 Conflict` (`ARCHIVE_HASH_CONFLICT_DETECTED`). No write occurs.

### I. Synchronous Fail-Closed Behavior
- App 794 process event handler `app.record.detail.process.proceed` awaits the `fetch()` call to D3-TAWS.
- If D3-TAWS returns anything other than HTTP 200 with `success: true` (including HTTP 4xx, 5xx, network failure, or timeout > 5000ms), the client handler:
  1. Displays localized error message to user UI via `ValidationEngine`.
  2. Returns `false` to cancel the Kintone process transition.
- **Guarantee:** Workflow status never transitions without prior persistent archival.

### J. App 798 Privacy & Read Permissions
- App 798 ACL remains:
  - `USER hr`: Add + View
  - `GROUP everyone`: No Add, No View (`recordAddable=false`, `recordViewable=false`).
- Employees have zero direct view or add access to App 798 (`EVERYONE_APP798_VIEW = NO`, `EVERYONE_APP798_ADD = NO`).
- Privacy of salary, rating, and historical audit snapshots is strictly maintained.

### K. Hosting, Network, DNS, CORS, TLS
- **Hosting:** Managed serverless or hardened container runtime (`HOSTING = MANAGED SERVERLESS OR HARDENED CONTAINER RUNTIME`).
- **DNS:** Dedicated governed subdomain (e.g. `mbo-archive.orbis-internal.net` or secure API gateway).
- **TLS Policy:** Minimum TLS 1.2 (`TLS_MINIMUM = 1.2`), TLS 1.3 preferred (`TLS_1_3 = PREFERRED`).
- **CORS:** Strict origin whitelist restricted to `https://rebootob.cybozu.com`. Methods restricted to `POST, OPTIONS`.

### L. Deployment Boundary
- Deployed independently from Kintone JavaScript.
- Deployed and health-checked first; App 794 JavaScript updated to point to the live endpoint only after backend verification.

### M. Rollback Boundary
- If D3-TAWS fails or is taken offline, App 794 fails closed safely: workflow transitions are blocked, and no data corruption or unauthorized status changes can occur.
- Reverting App 794 JavaScript restores previous baseline immediately.

### N. Operational Ownership
- Managed under Orbis DevOps / Platform Engineering.
- Credentials rotated by Orbis Security Administrator.

### O. Audit & Logging
- Structured JSON logging: Timestamp, Request ID, Client IP, Authenticated Caller Code, App 794 Record ID, Target Stage, Action, Snapshot Hash, Result Status, Latency.
- Never log full payload contents containing confidential PII.
- Alerts configured on any HTTP 409 (hash conflict) or HTTP 5xx.

---

## 6. App 798 Server Credential Model

```text
CREDENTIAL_TYPE              = Kintone App API Token (or Dedicated Service Account API Token)
STORAGE_LOCATION             = Managed Encrypted Secret Vault (Server-side environment only)
APP798_PERMISSIONS           = Add (Yes), View (Yes - required for duplicate/idempotency check)
APP798_FORBIDDEN_PERMS       = Edit (NO), Delete (NO), Import (NO), Export (NO), App Admin (NO)
APP794_PERMISSIONS           = View / Read only (Required to verify source record)
APP794_FORBIDDEN_PERMS       = Add (NO), Edit (NO), Delete (NO), App Admin (NO)
ROTATION_SCHEDULE            = 90 days via zero-downtime dual-token rotation
SEPARATION                   = Dedicated Sandbox Token vs Dedicated Production Token
```

---

## 7. Threat Model & Security Controls

| Threat ID | Threat Description | Security Control | Residual Risk |
| :--- | :--- | :--- | :--- |
| **T1: Caller Spoofing** | Attacker claims to be employee `E001` in HTTP request. | Authenticated via Cybozu OAuth2 user-bound token. Server inspects verified token principal from Cybozu User API, ignoring body fields. | Low (bounded by Cybozu IdP security and token validation integrity). |
| **T2: Replay Attack** | Attacker intercepts valid archive request and resends it. | State invariant: App 794 transitions to next status; replayed request finds status already moved and is rejected. 60s request expiration window. | Low (bounded by state transition idempotency and 60s timestamp window). |
| **T3: Arbitrary Record Substitution** | Attacker requests archive for Record 999 belonging to another user. | Server checks caller code against authoritative `Requester_User` on Record 999. Rejects if not owner. | Low (bounded by server-side verification of Requester_User against authenticated identity). |
| **T4: Employee-Code Substitution** | Attacker attempts to change employee code in archive. | Zero client payload accepted. Server extracts `Employee_Code` from canonical App 794 record. | Low (bounded by server-side source-record field extraction and zero browser payload trust). |
| **T5: Payload Tampering** | Attacker modifies Part A score or objective text in payload. | Browser sends NO snapshot data. Server reads App 794 directly and computes canonical snapshot. | Low (bounded by server-side canonical payload reconstruction and hash computation). |
| **T6: Arbitrary App 798 Write** | Malicious user injects bogus record into App 798. | App 798 ACL denies all direct writes (`GROUP everyone: recordAddable=false`). Server token is never exposed. | Low (bounded by App 798 ACL denial for GROUP everyone and server token isolation). |
| **T7: Credential Leakage** | API token exposed in Git or browser bundle. | Token stored strictly in server environment variable / secret vault. Never present in frontend code or Git. | Moderate (bounded by cloud secret vault access controls and rotation schedule). |
| **T8: Privilege Escalation** | Employee attempts to trigger HR-only final archive transition (`15` &rarr; `16`). | D3-TAWS checks caller against HR group membership for `FINAL` stage. Rejects with HTTP 403 if not HR. | Low (bounded by server-side authorization check against HR group membership). |
| **T9: Archive Overwrite / Delete** | Attacker attempts to modify or delete historical archive. | Token has NO Edit and NO Delete rights on App 798. App 798 settings disable record deletion. | Low (bounded by token least privilege denying edit/delete and App 798 configuration). |
| **T10: Cross-User Archive Access** | Employee attempts to view other employees' archives. | App 798 `recordViewable=false` for `GROUP everyone`. D3-TAWS exposes NO archive read endpoint to clients. | Low (bounded by App 798 ACL denying view to everyone and absence of client read endpoints). |
| **T11: Service Outage / Downtime** | D3-TAWS service becomes unreachable during transition. | Browser catches fetch error / timeout and returns `false`. Transition fails closed safely; no data loss. | Moderate (operational availability risk: transitions safely blocked until service recovers). |
| **T12: Duplicate Requests** | User clicks action button twice rapidly. | Idempotency engine queries App 798; second identical request returns `IDEMPOTENT_SUCCESS`. | Low (bounded by database uniqueness constraints and server idempotency check). |
| **T13: Hash-Conflict Attack** | State modified concurrently causing hash mismatch. | Server verifies hash against existing key; fails closed with HTTP 409 Conflict if key exists with different hash. | Low (bounded by canonical SHA-256 hash comparison and HTTP 409 fail-closed behavior). |
| **T14: CORS / Origin Abuse** | Rogue website tries to invoke D3-TAWS from external origin. | D3-TAWS CORS headers strictly enforce `Access-Control-Allow-Origin: https://rebootob.cybozu.com`. | Low (bounded by strict CORS Allow-Origin header and browser preflight enforcement). |
| **T15: CSRF / Session Confusion** | Attacker tricks browser into submitting cross-site request. | Browser communicates via JSON POST with custom `Authorization` header, triggering browser CORS preflight. | Low (bounded by custom Authorization header requirement triggering mandatory CORS preflight). |

---

## 8. Repository Reuse Decision

```text
MBO_GATEWAY_REUSE = PARTIAL
```

### Exact Reused Abstractions
1. **`src/services/revision-archive-service.js`:**
   - Full reuse of snapshot validation, deterministic serialization, SHA-256 hash calculation, and idempotency logic.
2. **`src/services/revision-archive-kintone-repository.js`:**
   - Full reuse of App 798 query and post record abstraction.
3. **`src/main-mbo-app.js:buildStageLogicalSnapshot`:**
   - Canonical extraction logic of physical Kintone fields to logical snapshot schema.
4. **`src/services/mbo-employee-self-gateway.js`:**
   - Transport error handling and Kintone HTTP query error models.

### Explicitly Excluded / Not Reused
1. **`src/services/mbo-auth-session-service.js` & `App 801` Auth Repository:**
   - DO NOT reuse Mode 2 secondary auth (password/activation code). Dedicated Kintone desktop users rely on Cybozu SaaS identity, not App 801.

---

## 9. Future Implementation Boundaries (Work Packages)

The implementation is partitioned into governed work packages (subject to unblocking of platform facts):

1. **`WP-D3-TAWS-01` (Service Implementation):**
   - Implement standalone D3-TAWS service module using reused repository services.
   - Implement Cybozu token verification and App 794 authorization check.
2. **`WP-D3-CLIENT-01` (App 794 Client Integration):**
   - Update `executeProcessTransitionArchive` in `src/main-mbo-app.js` to invoke D3-TAWS via secure client adapter instead of direct `kintoneApiWrapper`.
3. **`WP-D3-TEST-01` (Security & Integration Test Suite):**
   - Automated unit and integration tests covering all 15 threat scenarios, idempotency, hash conflict, and fail-closed behavior.
4. **`WP-D3-SBX-INFRA-01` (Sandbox Deployment):**
   - Deploy D3-TAWS in Sandbox environment with Sandbox App 794 / App 798 API tokens.
   - Configure DNS, TLS, and CORS.
5. **`WP-D3-SBX-UAT-01` (Targeted Sandbox UAT):**
   - Execute real employee-triggered transitions (`05` &rarr; `06` and `10` &rarr; `11`) in Sandbox Kintone with real non-admin users.
   - Prove App 798 archive creation and unblocked workflow progression.
6. **`WP-D3-PROD-DEPLOY-01` (Production Cutover):**
   - Production deployment upon Owner explicit authorization and Gate 7 approval.

---

## 10. Operational Design

```text
HOSTING                  = MANAGED SERVERLESS OR HARDENED CONTAINER RUNTIME
SECRET_STORAGE           = MANAGED ENCRYPTED SECRET VAULT (Server-side environment only)
NETWORK                  = Outbound HTTPS (443) to rebootob.cybozu.com; Inbound HTTPS (443) from browser
CORS                     = Strict Allow-Origin: https://rebootob.cybozu.com only
TLS_MINIMUM              = 1.2
TLS_1_3                  = PREFERRED
LOGGING                  = Structured JSON (PII-redacted, Request-ID correlated)
MONITORING               = Cloud Monitoring (Error rate, latency, 409 conflict alerts)
BACKUP                   = App 798 Kintone Native Daily Snapshot / Standard Orbis Backup
ROLLBACK                 = Blue/Green Serverless Alias Routing + Client Bundle Reversion
ENVIRONMENT_SEPARATION   = SANDBOX (App 794 / 798 Sbx) vs PRODUCTION (App 794 / 798 Prod)
```

---

## 11. Final Decision Verdict

```text
ARCHITECTURE_DECISION                    = BLOCKED_MORE_INFORMATION_REQUIRED
SELECTED_MODEL                           = D3_TRUSTED_ARCHIVE_WRITER_SERVICE (D3-TAWS)
CALLER_AUTHENTICATION                    = CYBOZU_OAUTH2_USER_BOUND_TOKEN
BROWSER_PRIVILEGED_SECRET                = NONE
HMAC_BROWSER_SHARED_SECRET               = NONE
TOKEN_VALIDATION_MODEL                   = USER_ENDPOINT_PROBING (UNPROVEN_ON_PLATFORM)
SYNCHRONOUS_ARCHIVE_BEFORE_TRANSITION    = PROVEN_BY_DESIGN
EVERYONE_APP798_VIEW                     = NO
EVERYONE_APP798_ADD                      = NO
ZERO_ARBITRARY_BROWSER_PAYLOAD           = ENFORCED
FAIL_CLOSED_PRESERVED                    = YES
IDEMPOTENCY_AND_HASH_CONFLICT_HANDLED    = YES
TLS_MINIMUM                              = 1.2
TLS_1_3                                  = PREFERRED
HOSTING                                  = MANAGED SERVERLESS OR HARDENED CONTAINER RUNTIME
```

---

## 12. External Facts Required for Unblock (`EXTERNAL_FACTS_REQUIRED_FOR_UNBLOCK`)

Because Cybozu OAuth2 browser-bound token flow cannot be verified from repository truth or standard Cybozu documentation alone, the architecture decision is formally gated on obtaining and verifying the following seven external platform facts:

1. **Usable OAuth Client Registration:**
   - Confirmation whether `rebootob.cybozu.com` Cybozu.com Common Administration supports registering an OAuth client with a Public Client profile (no client secret required), or if all OAuth clients enforce client secret issuance.
2. **Browser User-Bound Token Flow Without Secret Exposure:**
   - Architectural proof of how in-browser JavaScript in Cybozu Kintone customization (`dist/mbo-employee-app.js`) can acquire a user-bound bearer token for the current ambient session without exposing a privileged client secret, or whether Cybozu native JavaScript APIs offer an undocumented/supported token provider.
3. **Token Authenticity Validation by D3-TAWS:**
   - Platform confirmation of the exact validation mechanism: since Cybozu lacks an RFC 7662 token introspection endpoint (`/oauth2/introspect`), validation of the token's validity, expiration, and issuer must be proven via server-side invocation of `https://rebootob.cybozu.com/v1/users/own.json`.
4. **User Identity Mapping:**
   - Exact schema and field definitions returned by the Cybozu token validation response (e.g. `code`, `id`, `name`) and proof of deterministic correlation with App 794 `Requester_User` and `Employee_Code`.
5. **Required Scopes:**
   - Definitive list of minimal Cybozu OAuth scopes required for caller identification (e.g. `k:user:read` vs `k:read`) that can be granted without exposing broader tenant administrative permissions.
6. **Token Expiration and Revocation Lifecycle:**
   - Exact token lifespan (TTL), handling of expiration during active user sessions, refresh token mechanics for browser clients, and behavior upon user session logout or account suspension.
7. **Tenant, Domain, and Audience Binding:**
   - Proof that token validation cryptographically or structurally binds the token strictly to the `rebootob.cybozu.com` tenant and D3-TAWS audience, preventing cross-tenant or cross-application token reuse.
