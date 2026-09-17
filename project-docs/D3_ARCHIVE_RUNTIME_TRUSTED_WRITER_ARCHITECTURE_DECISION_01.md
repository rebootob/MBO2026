# D3-ARCHIVE-RUNTIME-TRUSTED-WRITER-ARCHITECTURE-DECISION-01

## 1. Document Control & Decision Header

```text
DOCUMENT_ID                  = D3-ARCHIVE-RUNTIME-TRUSTED-WRITER-ARCHITECTURE-DECISION-01
PACKAGE                      = D3-ARCHIVE-RUNTIME-TRUSTED-WRITER-ARCHITECTURE-DECISION-01
CANONICAL_BRANCH             = ai/antigravity-wp002c
BASE_HEAD                    = 79e8687b7e23e43a4a7ca4b17d234fd084284a21
MODE                         = READ-ONLY + DOCS-ONLY ARCHITECTURE DECISION
PURPOSE                      = Define single Owner-ratifiable Trusted Archive Writer Architecture for D3
KINTONE_READS                = 0
KINTONE_WRITES               = 0
EXTERNAL_INFRA_WRITES        = 0
SOURCE_CHANGES               = 0
TEST_CHANGES                 = 0
DIST_CHANGES                 = 0
APP798_ACL_MODIFIED          = NO
ARCHITECTURE_DECISION        = READY_FOR_OWNER_RATIFICATION
SELECTED_ARCHITECTURE        = D3_TRUSTED_ARCHIVE_WRITER_SERVICE (D3-TAWS)
```

---

## 2. Locked Problem Statement & Architectural Context

1. **Client-Side Execution Context:**
   App 794 Desktop Customization (`dist/mbo-employee-app.js`) runs purely inside end-user web browsers on Cybozu Kintone SaaS (`https://rebootob.cybozu.com`). All native `kintone.api()` calls carry the ambient Cybozu session cookie of the logged-in user.
2. **Current Least-Privilege ACL of App 798 (Revision 6):**
   - `USER hr`: `appEditable=false`, `recordViewable=true`, `recordAddable=true`, `recordEditable=false`, `recordDeletable=false`
   - `GROUP everyone`: `appEditable=false`, `recordViewable=false`, `recordAddable=false`, `recordEditable=false`, `recordDeletable=false`
3. **Workflow Actor Collision:**
   - **Transition 1** (`05 Objective Approved` &rarr; `06 Employee Mid-Year`): Actor is Employee (`Requester_User`).
   - **Transition 2** (`10 Mid-Year Completed` &rarr; `11 Employee Self Evaluation`): Actor is Employee (`Requester_User`).
   - **Transition 3** (`15 HR Final Check` &rarr; `16 Completed`): Actor is HR Operator (`USER hr`).
   When employees execute Transitions 1 and 2, browser-executed writes to App 798 are rejected by Kintone with `HTTP 403 Forbidden` (`GAIA_IL02`).
4. **Mandatory Invariants:**
   - `APP794_ROUTE_SNAPSHOT_REUSE_BEFORE_ARCHIVE_SUCCESS = FORBIDDEN`: Archival must succeed **before** the workflow transition is committed.
   - Fail-closed: Any archive failure must return `false` to abort the transition.
   - Privacy: Ordinary employees must **not** gain broad `recordViewable=true` access to App 798.
   - Zero Browser Secrets: No API tokens, HR credentials, or private keys may ever be embedded in client-side JavaScript.
   - Zero Arbitrary Payloads: Browser must not be trusted to author or inject archive data.
5. **Architectural Gap:**
   App 794 dedicated browser users have no existing, deployed, authenticated server-side writer path. The existing `mbo-gateway-server.js` prototype was designed for Mode 2 (Shared Kintone Secondary Auth via App 801) and is currently undeployed.

---

## 3. Evaluation of Candidate Models

| Candidate | Description | Security Model | Synchronous Fail-Closed | Feasibility & Complexity | Rejection / Selection Reason |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Candidate 1: Dedicated Trusted Archive Writer Service (D3-TAWS)** | Standalone, stateless, least-privilege serverless service/function. Holds server credential for App 798; verifies caller via Cybozu OAuth/ticket; independently reconstructs snapshot from App 794; enforces idempotency; returns synchronous verdict. | **Strict Least Privilege:** Zero browser secrets. Server constructs payload. Verifies caller identity and workflow authority independently. | **COMPATIBLE:** Synchronous HTTP response before browser proceeds with transition. | **High Feasibility:** Stateless function; easily hosted on cloud serverless (AWS Lambda / Cloudflare Worker / Node container). | **SELECTED:** Fully satisfies all 7 architecture principles, privacy rules, and synchronous fail-closed invariants. |
| **Candidate 2: Extension of Existing `mbo-gateway-server`** | Extend Node.js gateway with `/api/mbo/archive/stage-completion`. | Relies on server-held token, but current gateway auth is tightly coupled to Mode 2 (App 801 secondary auth). Mode 1 users have no `mbo_session` cookie. | **COMPATIBLE** if synchronous HTTP is maintained. | **Medium Feasibility / High Risk:** Forces two distinct identity domains (Mode 1 vs Mode 2) into one server; gateway is currently undeployed. | **REJECTED AS UNIFIED SERVICE:** Architecture abstractions will be partially reused, but Mode 1 must not be coupled to Mode 2 secondary auth stores. |
| **Candidate 3: Kintone Native Webhooks / Event Bridge** | Kintone Webhook triggers external writer on status change. | Server-side write to App 798, but fires **asynchronously after** status change is already committed in App 794. | **FATAL FLAW (INCOMPATIBLE):** Webhook fires after transition. Cannot block transition if archive fails. | **Low Complexity / Fatal Governance Violation:** Breaks `APP794_ROUTE_SNAPSHOT_REUSE_BEFORE_ARCHIVE_SUCCESS`. | **REJECTED:** Violates synchronous archive-before-transition requirement. |
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
         |    Headers: Authorization: Bearer <Cybozu_OAuth_Token> (or Signed Cybozu Proxy Ticket)
         |    Body: { sourceRecordId: 17, actionName: "Start Mid-Year", targetStage: "OBJECTIVE" }
         v
[ D3-TAWS: Trusted Execution Boundary ]
         |
         | 3. Authenticate caller identity via Cybozu Identity Provider (User API)
         | 4. Fetch authoritative App 794 record via Server Credential (GET /k/v1/record.json?app=794&id=17)
         | 5. Validate caller against App 794 Workflow Authority (Must match Requester_User)
         | 6. Validate pre-transition status (Must be "05 Objective Approved")
         | 7. Construct canonical logicalSnapshot server-side (Zero browser payload trust)
         | 8. Compute Snapshot_Hash and evaluate idempotency against App 798
         |    - If identical exists: return HTTP 200 { status: "IDEMPOTENT_SUCCESS" }
         |    - If different hash exists for same key: return HTTP 409 (FAIL-CLOSED)
         | 9. Write canonical record to App 798 using least-privilege token (POST /k/v1/record.json)
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
Stateless serverless execution container (e.g. AWS Lambda / Cloudflare Worker / secure containerized microservice) deployed in the dedicated Orbis secure cloud boundary, isolated from client web applications.

### B. Caller Authentication
- **Primary Mechanism:** Cybozu OAuth 2.0 Access Token. App 794 client customization obtains an ephemeral bearer token via registered Cybozu OAuth2 Client (with scope `k:user:read` or `k:read`).
- **Validation:** D3-TAWS validates the token against Cybozu User API (`https://rebootob.cybozu.com/v1/users/own.json`) or Cybozu Token Introspection.
- **Alternative Bootstrap:** Where OAuth2 client registration is deferred by Owner, Cybozu HTTP Proxy (`kintone.proxy()`) with mutual pre-shared request signing key (HMAC-SHA256 of timestamp + recordId + userCode) verified by D3-TAWS against an internal Cybozu user lookup.
- **Rule:** Under no circumstances is `userCode` accepted on trust from browser body alone.

### C. Caller Authorization
D3-TAWS independently fetches the App 794 source record from Kintone and evaluates business authority:
- For `OBJECTIVE` stage (`05` &rarr; `06`): Authenticated user must equal `record.Requester_User.value[0].code` (or record's `Employee_Code`).
- For `MIDYEAR` stage (`10` &rarr; `11`): Authenticated user must equal `record.Requester_User.value[0].code`.
- For `FINAL` stage (`15` &rarr; `16`): Authenticated user must belong to HR Administrative Group.
Any mismatch results in immediate `HTTP 403 Forbidden` (`CALLER_UNAUTHORIZED_FOR_RECORD_TRANSITION`).

### D. Privileged Kintone Credential Storage
- Stored exclusively in server-side environment / secret manager (`KINTONE_ARCHIVE_WRITER_TOKEN`).
- Stored in AWS Secrets Manager / Cloudflare Secrets. Never checked into Git, never sent to browser, never written to client-accessible logs.

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
- Employees have zero direct view access to App 798.
- Privacy of salary, rating, and historical audit snapshots is 100% preserved.

### K. Hosting, Network, DNS, CORS
- **Hosting:** HTTPS Serverless function or container.
- **DNS:** Dedicated subdomain (e.g. `mbo-archive.orbis-internal.net` or secure API gateway).
- **TLS:** TLS 1.3 mandatory.
- **CORS:** Strict origin whitelist restricted to `https://rebootob.cybozu.com`. Methods restricted to `POST, OPTIONS`.

### L. Deployment Boundary
- Deployed independently from Kintone JavaScript.
- Deployed first; health checked; App 794 JavaScript updated to point to the live endpoint only after backend verification.

### M. Rollback Boundary
- If D3-TAWS fails or is taken offline, App 794 fails closed safely: workflow transitions are prevented, but no data corruption or unauthorized status changes can occur.
- Reverting App 794 JavaScript to previous build restores previous baseline immediately.

### N. Operational Ownership
- Managed under Orbis DevOps / Platform Engineering.
- Credentials rotated by Orbis Security Administrator.

### O. Audit & Logging
- Structured JSON logging: Timestamp, Request ID, Client IP, Authenticated Caller Code, App 794 Record ID, Target Stage, Action, Snapshot Hash, Result Status, Latency.
- Never log full payload contents containing confidential PII.
- CloudWatch / Datadog / Logflare integration with alerts on any HTTP 409 (hash conflict) or HTTP 5xx.

---

## 6. App 798 Server Credential Model

```text
CREDENTIAL_TYPE              = Kintone App API Token (or Dedicated Service Account API Token)
STORAGE_LOCATION             = Cloud Secret Manager (Server-side environment only)
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
| **T1: Caller Spoofing** | Attacker claims to be employee `E001` in HTTP request. | Authenticated via Cybozu OAuth2 / Token verification. Server inspects verified token principal, not body fields. | Negligible (bounded by Cybozu IdP security). |
| **T2: Replay Attack** | Attacker intercepts valid archive request and resends it. | State invariant: App 794 transitions to next status; replayed request finds status already moved and is rejected. 60s request expiration window. | Negligible. |
| **T3: Arbitrary Record Substitution** | Attacker requests archive for Record 999 belonging to another user. | Server checks caller code against authoritative `Requester_User` on Record 999. Rejects if not owner. | Negligible. |
| **T4: Employee-Code Substitution** | Attacker attempts to change employee code in archive. | Zero client payload accepted. Server extracts `Employee_Code` from canonical App 794 record. | Zero. |
| **T5: Payload Tampering** | Attacker modifies Part A score or objective text in payload. | Browser sends NO snapshot data. Server reads App 794 directly and computes canonical snapshot. | Zero. |
| **T6: Arbitrary App 798 Write** | Malicious user injects bogus record into App 798. | App 798 ACL denies all direct writes (`GROUP everyone: recordAddable=false`). Server token is never exposed. | Zero. |
| **T7: Credential Leakage** | API token exposed in Git or browser bundle. | Token stored strictly in server environment variable / secret vault. Never present in frontend code or Git. | Standard cloud infrastructure risk. |
| **T8: Privilege Escalation** | Employee attempts to trigger HR-only final archive transition (`15` &rarr; `16`). | D3-TAWS checks caller against HR group membership for `FINAL` stage. Rejects with HTTP 403 if not HR. | Negligible. |
| **T9: Archive Overwrite / Delete** | Attacker attempts to modify or delete historical archive. | Token has NO Edit and NO Delete rights on App 798. App 798 settings disable record deletion. | Zero. |
| **T10: Cross-User Archive Access** | Employee attempts to view other employees' archives. | App 798 `recordViewable=false` for `GROUP everyone`. D3-TAWS exposes NO archive read endpoint to clients. | Zero. |
| **T11: Service Outage / Downtime** | D3-TAWS service becomes unreachable during transition. | Browser catches fetch error / timeout and returns `false`. Transition fails closed safely; no data loss. | Low (temporary inability to submit transition until service recovers). |
| **T12: Duplicate Requests** | User clicks action button twice rapidly. | Idempotency engine queries App 798; second identical request returns `IDEMPOTENT_SUCCESS`. | Zero. |
| **T13: Hash-Conflict Attack** | State modified concurrently causing hash mismatch. | Server verifies hash against existing key; fails closed with HTTP 409 Conflict if key exists with different hash. | Zero. |
| **T14: CORS / Origin Abuse** | Rogue website tries to invoke D3-TAWS from external origin. | D3-TAWS CORS headers strictly enforce `Access-Control-Allow-Origin: https://rebootob.cybozu.com`. | Negligible. |
| **T15: CSRF / Session Confusion** | Attacker tricks browser into submitting cross-site request. | Browser communicates via JSON POST with custom `Authorization` header, triggering browser CORS preflight. | Zero. |

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

The implementation is partitioned into six clean, governed work packages:

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
HOSTING                  = AWS Lambda / Cloudflare Workers (Serverless Execution)
SECRET_STORAGE           = Cloud Provider Encrypted Secret Vault (AWS Secrets Manager / KMS)
NETWORK                  = Outbound HTTPS (443) to rebootob.cybozu.com; Inbound HTTPS (443) from browser
CORS                     = Strict Allow-Origin: https://rebootob.cybozu.com only
TLS                      = TLS 1.3 Enforced (Minimum TLS 1.2)
LOGGING                  = Structured JSON (PII-redacted, Request-ID correlated)
MONITORING               = CloudWatch / Datadog (Error rate, latency, 409 conflict alerts)
BACKUP                   = App 798 Kintone Native Daily Snapshot / Standard Orbis Backup
ROLLBACK                 = Blue/Green Serverless Alias Routing + Client Bundle Reversion
ENVIRONMENT_SEPARATION   = SANDBOX (App 794 / 798 Sbx) vs PRODUCTION (App 794 / 798 Prod)
```

---

## 11. Final Decision Verdict

```text
ARCHITECTURE_DECISION                    = READY_FOR_OWNER_RATIFICATION
SELECTED_MODEL                           = D3_TRUSTED_ARCHIVE_WRITER_SERVICE (D3-TAWS)
SYNCHRONOUS_ARCHIVE_BEFORE_TRANSITION    = PROVEN_BY_DESIGN
EVERYONE_APP798_VIEW                     = NO
EVERYONE_APP798_ADD                      = NO
BROWSER_SECRETS                          = NONE
ZERO_ARBITRARY_BROWSER_PAYLOAD           = ENFORCED
FAIL_CLOSED_PRESERVED                    = YES
IDEMPOTENCY_AND_HASH_CONFLICT_HANDLED    = YES
```

### Specific Items for Owner Ratification
1. **Hosting Platform Selection:** Confirm whether D3-TAWS should be targeted for AWS Lambda, Cloudflare Workers, or Orbis container host.
2. **Authentication Bootstrap:** Confirm whether Cybozu OAuth 2.0 Client registration will be created in `rebootob.cybozu.com` Kintone administration, or if Cybozu Proxy signed ticket bootstrap should be used for Sandbox UAT.
3. **Execution Authorization:** Ratify this decision document to authorize future work package `WP-D3-TAWS-01`.
