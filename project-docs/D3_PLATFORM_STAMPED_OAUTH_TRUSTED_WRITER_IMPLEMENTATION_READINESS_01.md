# D3-ARCHIVE-RUNTIME-TRUSTED-WRITER-PLATFORM-STAMPED-OAUTH-IMPLEMENTATION-READINESS-01

- PACKAGE: `D3-ARCHIVE-RUNTIME-TRUSTED-WRITER-PLATFORM-STAMPED-OAUTH-IMPLEMENTATION-READINESS-01-R1`
- AUTHORIZATION_ID: `MBO2026-D3-ARCHIVE-RUNTIME-TRUSTED-WRITER-PLATFORM-STAMPED-OAUTH-IMPLEMENTATION-READINESS-01-R1-20260918-OWNER-01`
- REPOSITORY: `rebootob/MBO2026`
- CANONICAL_BRANCH: `ai/antigravity-wp002c`
- AUTHORIZED_BASE_HEAD: `5907a6b059a59cf1e0de7c43a865454da48c6f12`
- AUTHORIZED_BASE_PARENT: `5d60f4e5f0d0b498cae39e43f967f797ac572027`
- AUTHORIZED_BASE_TREE: `2b8053aab6df91338bd3b1bef7b343190680da11`
- BASE_MESSAGE: `docs(d3): define ratified oauth trusted writer implementation boundary`
- MODE: `ONE-FILE TECHNICAL READINESS CORRECTIVE / DOCS-DESIGN ONLY / ZERO LIVE I/O / NO SOURCE CHANGE / NO TEST CHANGE`

---

## 1. Executive Summary & Locked Architecture Baseline

This document establishes the bounded, implementation-ready engineering contract for the Owner-ratified D3 trusted-actor architecture:

- `OWNER_DEC_D3_009` = `LOCKED / OWNER APPROVED`
- `OWNER_RATIFIED_ARCHITECTURE` = `NATIVE_KINTONE_PLATFORM_STAMPED_OAUTH_ATTESTATION`
- `NO_MORE_NATIVE_ACTOR_RESEARCH` = `YES`
- `TRUSTED_WRITER_ACTOR_ARCHITECTURE_SELECTION_BLOCKER` = `RESOLVED`
- `APP798_GROUP_EVERYONE_ADD` = `NO`
- `APP798_GROUP_EVERYONE_VIEW` = `NO`
- `BROWSER_PRIVILEGED_SECRET` = `FORBIDDEN`
- `ARCHIVED_BY_SOURCE` = `KINTONE_PLATFORM_STAMPED_CREATED_BY`
- `ARCHIVE_ACTOR_NOT_RESOLVED` = `FAIL_CLOSED`
- `APP794_ROUTE_SNAPSHOT_REUSE_BEFORE_ARCHIVE_SUCCESS` = `FORBIDDEN`
- `ARCHIVE_HASH_CONFLICT` = `FAIL_CLOSED`
- `SAME_LOGICAL_EVENT_DUPLICATE_ROW` = `FORBIDDEN`
- `PKCE_SUPPORT` = `PROVEN_UNSUPPORTED`
- `OAUTH_CLIENT_TYPE` = `CONFIDENTIAL_CLIENT`
- `GATEWAY_RUNTIME_MODEL` = `NODE_HTTP`
- `ACCESS_TOKEN_BROWSER_EXPOSURE` = `FORBIDDEN`
- `ATTESTATION_RECORD_CREATOR_CALLER` = `TRUSTED_BACKEND_USING_BACKEND_HELD_USER_OAUTH_AUTHORITY`
- `ACTOR_IDENTITY_PROVENANCE` = `KINTONE_PLATFORM_STAMPED_CREATOR_ONLY`
- `ATTESTATION_ACTOR_PROOF_FIELD_TYPE` = `CREATOR`
- `BLIND_TRANSITION_RETRY_AFTER_TIMEOUT` = `FORBIDDEN`

**Zero Implementation / Zero Live I/O Contract**:
- `IMPLEMENTATION_AUTHORIZED` = `NO`
- `DEPLOYMENT_AUTHORIZED` = `NO`
- `KINTONE_READ_AUTHORIZED` = `NO`
- `KINTONE_WRITE_AUTHORIZED` = `NO`
- `PROCESS_WRITE_AUTHORIZED` = `NO`
- `UAT_AUTHORIZED` = `NO`
- `FULL_D3_BUSINESS_UAT` = `NOT_PROVEN`
- `D3_CLOSURE` = `NOT_CLAIMED`
- `PRODUCTION_READY` = `NO`
- `NEXT_GATE_AUTHORIZED` = `NO`
- `AUTO_START_NEXT_WORK_PACKAGE` = `NO`

---

## 2. Targeted Source Inspection & Canonical Facts

Repository inspection of canonical source and test files confirms:

1. **Existing MBO Gateway (`src/server/mbo-gateway-server.js`)**:
   - Runtime model is native `node:http` (`createServer`), **NOT Express**.
   - No Express router, middleware, or external framework is present; framework migration is unauthorized (`FRAMEWORK_MIGRATION_AUTHORIZED = NO`).
   - Routes currently implemented:
     - `POST /api/mbo/login`
     - `POST /api/mbo/change-password`
     - `POST /api/mbo/logout`
     - `GET  /api/mbo/bootstrap`
     - `GET  /api/mbo/history`
     - `GET  /api/mbo/records/:id`
     - `GET  /health`
   - Features built-in cookie parsing, JSON body parsing, CORS headers, and runtime dependency injection.
   - Does not yet expose D3 OAuth authorization or attestation transition transaction routes.
   - Seam contract: D3 trusted endpoints must be integrated as a dedicated handler/dispatcher module compatible with `node:http` (`IncomingMessage` / `ServerResponse`), reusing the existing gateway composition.

2. **Existing Archive Domain Service (`src/services/revision-archive-service.js`)**:
   - Contains complete, verified archive business logic: deterministic `Archive_Key` generation, canonical D3 snapshot hashing (`hashD3Snapshot`), snapshot validation, duplicate detection, uncertain-write recovery, and post-create readback verification.
   - Completely decoupled from transport; operates solely via an injected repository abstraction.
   - **Must be reused as-is** without code modification.

3. **Existing Repository Abstraction (`src/services/revision-archive-kintone-repository.js`)**:
   - Strictly locked to `REVISION_ARCHIVE_APP_ID = 798` (caller cannot override app ID).
   - Operates via an injected Kintone API adapter (`getRecords`, `addRecord`).
   - Supports read-only querying and append-only row creation; row mutation or deletion is strictly impossible.
   - **Must be reused as-is** without code modification, powered by backend privileged credentials.

4. **Existing Browser Application (`src/main-mbo-app.js`)**:
   - Lines 1680–1728 attempt to construct `RevisionArchiveService` in the browser and write directly to App 798.
   - Because `APP798 GROUP everyone Add = NO`, browser direct write fails closed.
   - Future implementation will modify this browser transition hook to request trusted transaction execution from the gateway without ever touching App 798 credentials or OAuth access tokens.

---

## 3. Trusted Backend Runtime Seam

- `TRUSTED_BACKEND_IMPLEMENTATION_SEAM` = `ADD_DEDICATED_D3_TRUSTED_RUNTIME_MODULE_UNDER_EXISTING_NODE_HTTP_GATEWAY`
- `EXISTING_GATEWAY_REUSE` = `YES`
- `NEW_STANDALONE_BACKEND` = `NO`
- `FRAMEWORK_MIGRATION_AUTHORIZED` = `NO`

### Architectural Boundary:
- The existing `createMboGatewayServer()` in `src/server/mbo-gateway-server.js` remains the primary HTTP entry point.
- D3 trusted operations are handled by a dedicated, modular request dispatcher (e.g. `src/server/routes/d3-oauth-attestation-handler.js`).
- The dispatcher adheres strictly to native `node:http` contracts (`(req, res)` handlers, standard Stream body buffering, and JSON serialization) to ensure complete compatibility without introducing third-party framework dependencies.

---

## 4. OAuth Authorization & Token Lifecycle Seam

### 4.1 Cybozu OAuth Parameters & Ground Truth
- `OAUTH_CLIENT_TYPE` = `CONFIDENTIAL_CLIENT`
- `OAUTH_GRANT_TYPE` = `AUTHORIZATION_CODE`
- `PKCE_SUPPORT` = `PROVEN_UNSUPPORTED` (RFC 7636 is not supported by Cybozu; PKCE must not be used or emitted).
- `PUBLIC_CLIENT_SUPPORT` = `PROVEN_UNSUPPORTED` (Cybozu strictly mandates client authentication via HTTP Basic Auth `client_id:client_secret`).
- `STATE_PARAMETER_REQUIRED` = `YES` (High-entropy, cryptographically random, single-use, time-bounded state).
- `CALLBACK_STATE_VALIDATION` = `REQUIRED` (Must match state stored in backend session/cookie; fails closed on mismatch).
- `TOKEN_EXCHANGE_SERVER_SIDE_ONLY` = `YES` (POST `/oauth2/token` is called strictly by trusted backend using Basic authentication).
- `OAUTH_CLIENT_SECRET_BROWSER_EXPOSURE` = `FORBIDDEN`.

### 4.2 End-to-End OAuth Sequence

```text
Browser User                    Trusted Gateway (node:http)              Cybozu OAuth Platform
     │                                      │                                      │
     │── 1. GET /api/mbo/oauth/authorize ──>│                                      │
     │                                      │── 2. Generate random state           │
     │                                      │      & save in session/cookie        │
     │<─ 3. 302 Redirect to Cybozu Auth ────│                                      │
     │                                                                             │
     │── 4. User Authenticates & Approves Scopes (k:app_record:read,write) ───────>│
     │                                                                             │
     │<─ 5. 302 Redirect to Gateway Callback (?code=...&state=...) ────────────────│
     │                                      │                                      │
     │── 6. GET /api/mbo/oauth/callback ───>│                                      │
     │                                      │── 7. Validate state parameter        │
     │                                      │── 8. Back-channel POST /oauth2/token │
     │                                      │      (Authorization: Basic id:secret)│
     │                                      │<─ 9. Return { access_token,          │
     │                                      │               refresh_token, ... } ──│
     │                                      │── 10. Store grant securely in backend│
     │                                      │       bound to server session        │
     │<─ 11. 302 Return to App794 (NO TOKEN)│                                      │
```

### 4.3 Browser Token Custody Contract
- `ACCESS_TOKEN_BROWSER_STORAGE` = `FORBIDDEN`
- `REFRESH_TOKEN_BROWSER_STORAGE` = `FORBIDDEN`
- `ACCESS_TOKEN_BROWSER_EXPOSURE` = `FORBIDDEN`
- `BROWSER_SELECTS_SERVER_TOKEN` = `FORBIDDEN`
- `BROWSER_SUPPLIES_OAUTH_ACCESS_TOKEN` = `FORBIDDEN`
- The browser never receives, stores, forwards, or proxies OAuth access or refresh tokens.

---

## 5. Secure Token Storage Contract

### 5.1 Storage Interface (`D3TokenStore`)

```javascript
/**
 * Interface for D3 Secure Token Storage (Server-Side Only)
 */
export class D3TokenStore {
  /**
   * Persists an OAuth grant bound to a server session.
   * NOTE: Authoritative userCode is NOT stored here because OAuth token endpoints
   * do not provide authoritative user identity prior to Attestation readback.
   *
   * @param {string} sessionId - Backend-managed session identifier
   * @param {object} grantData - Grant metadata:
   *   { accessToken, refreshToken, expiresAt, scope, oauthGrantId, serverSessionBinding, authorizationMetadata }
   * @returns {Promise<void>}
   */
  async storeGrant(sessionId, grantData) { throw new Error('NOT_IMPLEMENTED'); }

  /**
   * Loads the backend-held user OAuth grant for a session.
   * @param {string} sessionId
   * @returns {Promise<object|null>}
   */
  async loadGrant(sessionId) { throw new Error('NOT_IMPLEMENTED'); }

  /**
   * Rotates an expired or refreshed grant.
   * @param {string} sessionId
   * @param {object} newGrantData
   * @returns {Promise<void>}
   */
  async rotateGrant(sessionId, newGrantData) { throw new Error('NOT_IMPLEMENTED'); }

  /**
   * Invalidates and deletes a grant.
   * @param {string} sessionId
   * @returns {Promise<void>}
   */
  async invalidateGrant(sessionId) { throw new Error('NOT_IMPLEMENTED'); }
}
```

### 5.2 Actor Identity Provenance Invariants
- `OAUTH_GRANT_AUTHORITATIVE_ACTOR_USERCODE` = `NONE_BEFORE_ATTESTATION_READBACK`
- `AUTHORITATIVE_ACTOR_SOURCE` = `KINTONE_PLATFORM_STAMPED_CREATED_BY_READBACK`
- `BROWSER_USERCODE_AS_ACTOR` = `FORBIDDEN`
- `REQUEST_USERCODE_AS_ACTOR` = `FORBIDDEN`
- `OAUTH_GRANT_USERCODE_INFERENCE_AS_ACTOR` = `FORBIDDEN`
- `ARCHIVED_BY_FROM_PLATFORM_CREATED_BY_ONLY` = `YES`

Neither the browser, the gateway session, nor the OAuth grant metadata can declare authoritative actor identity. The user's identity is established solely when Kintone stamps `Created by` (`CREATOR`) on the Attestation record, which is subsequently read back and verified by the backend.

### 5.3 Storage Security Rules
- `TOKEN_STORE_PRODUCTION_IN_MEMORY_ONLY` = `FORBIDDEN` (Production requires encrypted persistent store; memory mock permitted only in unit test suites).
- `TOKEN_STORE_FAILS_CLOSED_IF_UNAVAILABLE` = `YES`.
- `TOKEN_LOGGING` = `FORBIDDEN` (Tokens and secrets must never be written to logs or error strings).

---

## 6. Attestation App Schema & ACL Contract

### 6.1 Logical Schema & System Field Contract

The dedicated Attestation App acts as the hardware/platform security boundary stamping the actor's identity.

| Logical Field | Suggested Field Code | Field Type | Semantic Contract & Constraints |
|---|---|---|---|
| Attestation Nonce | `Attestation_Nonce` | `SINGLE_LINE_TEXT` | Server-generated high-entropy cryptographic nonce (Unique constraint) |
| Target Record ID | `App794_Record_ID` | `NUMBER` | App 794 Target Record ID |
| Target Archive Key | `Archive_Key` | `SINGLE_LINE_TEXT` | Deterministic SHA-256 archive key for App 798 |
| Expected From Status | `Expected_From_Status` | `SINGLE_LINE_TEXT` | Pre-transition status (e.g. `15 HR Final Check`) |
| Intended Action | `Intended_Action` | `SINGLE_LINE_TEXT` | Action to be executed (e.g. `Complete`) |
| Expected Target Status | `Expected_Target_Status`| `SINGLE_LINE_TEXT` | Target status (e.g. `16 Completed`) |
| Snapshot Hash | `Snapshot_Hash` | `SINGLE_LINE_TEXT` | Canonical SHA-256 hash of D3 route snapshot |
| Issued At | `Issued_At` | `DATETIME` | Server creation timestamp |
| Expires At | `Expires_At` | `DATETIME` | Short-lived expiration timestamp (TTL <= 60s) |
| Platform Actor | `作成者` / System Field | **`CREATOR`** | **Kintone platform system field stamped by Kintone server**. Type is strictly `CREATOR`, NOT `USER_SELECT`. Value is `{ code, name }`. |
| Platform Time | `作成日時` / System Field | **`CREATED_TIME`** | **Kintone platform system timestamp**. Type is strictly `CREATED_TIME`, NOT `DATETIME`. |

### Field Type Specifications:
- `ATTESTATION_ACTOR_PROOF_FIELD_TYPE` = `CREATOR`
- `ATTESTATION_PLATFORM_TIME_FIELD_TYPE` = `CREATED_TIME`
- `CREATOR_VALUE_REQUIRED` = `exact platform-returned user object containing code/name`
- `AUTHORITATIVE_ACTOR_VALUE` = `CREATOR.value.code`
- `CREATOR_OVERRIDE_BY_NORMAL_WORKFLOW_USER` = `FORBIDDEN BY NO APP-MANAGE PERMISSION`
- `ATTESTATION_CREATOR_PHYSICAL_FIELD_CODE` = `PROVISIONING_LOCK_REQUIRED` (The exact physical field code is pinned at provisioning time prior to live execution; modeling as custom USER_SELECT is strictly forbidden).

### 6.2 App Access Control List (ACL) Contract
- **Normal Workflow Users (`GROUP: everyone`)**:
  - `ADD` = `YES` (Required to post attestation record using backend-held OAuth authority).
  - `VIEW` = `NO` (Forbidden to read any records in the Attestation App).
  - `EDIT` = `NO` (Immutable; cannot edit).
  - `DELETE` = `NO` (Cannot delete).
  - `APP_MANAGEMENT` = `NO` (Strictly guarantees user cannot forge `CREATOR` or `CREATED_TIME`).
- **Privileged Backend Reader (`USER: mbo_attestation_reader`)**:
  - `VIEW` = `YES` (Permitted to query record by `Attestation_Nonce` to read `CREATOR`).
  - `ADD` = `NO`.
  - `EDIT` = `NO`.
  - `DELETE` = `NO`.

---

## 7. Platform-Stamped Created By Verification Flow

### 7.1 Complete Transaction Trust Flow

```text
[ Browser ]                  [ Trusted Backend (Gateway) ]              [ Kintone Platform ]
     │                                      │                                      │
     │── 1. POST /transaction/execute ─────>│                                      │
     │      { recordId, action, ... }       │── 2. Load backend-held OAuth grant   │
     │                                      │── 3. Generate server-side Nonce      │
     │                                      │── 4. POST /k/v1/record.json          │
     │                                      │      (Attestation App)               │
     │                                      │      USING USER OAUTH BEARER TOKEN   │
     │                                      │                                      │
     │                                      │<─ 5. Kintone stamps CREATOR & returns│
     │                                      │      { id: attestationId } ──────────│
     │                                      │                                      │
     │                                      │── 6. GET /k/v1/record.json           │
     │                                      │      (Attestation App by ID/Nonce)   │
     │                                      │      USING PRIVILEGED READER TOKEN   │
     │                                      │<─ 7. Returns record + CREATOR stamp ─│
     │                                      │                                      │
     │                                      │── 8. Verify Nonce, Hash, Context,    │
     │                                      │      Extract actor = CREATOR.code    │
     │                                      │                                      │
     │                                      │── 9. Execute App 798 Archive         │
     │                                      │      USING PRIVILEGED WRITER TOKEN   │
     │                                      │      Archived_By = actor             │
     │                                      │<─ 10. App 798 write verified ────────│
     │                                      │                                      │
     │                                      │── 11. PUT /k/v1/record/status.json   │
     │                                      │       (App 794 Process Management)   │
     │                                      │       USING SAME USER OAUTH TOKEN    │
     │                                      │<─ 12. App 794 transition succeeds ───│
     │<─ 13. Transaction Complete ──────────│                                      │
```

### 7.2 Strict Validation Invariants
- `ATTESTATION_RECORD_CREATOR_CALLER` = `TRUSTED_BACKEND_USING_BACKEND_HELD_USER_OAUTH_AUTHORITY`.
- The browser **never** interacts directly with the Attestation App.
- Multi-point verification before writing to App 798:
  1. Record retrieved by `Attestation_Nonce` must exist.
  2. Server clock must satisfy `now <= Expires_At`.
  3. `Snapshot_Hash` in record must match expected payload hash.
  4. `Archive_Key` in record must match computed deterministic archive key.
  5. `App794_Record_ID`, `Expected_From_Status`, and `Intended_Action` must match.
  6. `CREATOR` must be present, valid object, with non-empty `code`.
  7. If any check fails: **FAIL CLOSED**, abort transaction, do not touch App 798.

---

## 8. App 798 Trusted Writer Integration

- **App ID**: `798` (strictly immutable via `REVISION_ARCHIVE_APP_ID`).
- **ACL Enforcement**: `APP798 GROUP everyone Add = NO`, `APP798 GROUP everyone View = NO`.
- **Actor Identity Binding**:
  - `Archived_By` = Authoritative user code extracted from platform-stamped `CREATOR`.
  - **Strictly Forbidden**: Browser-supplied userCode, session userCode, synthetic `SYSTEM`, requester fallback, or guessed user.
- **Service Integration**:
  - Backend executes `RevisionArchiveService.archiveStageCompletion(...)` via `RevisionArchiveKintoneRepository` instantiated with `KINTONE_APP798_TRUSTED_WRITER_CREDENTIAL`.
  - Full domain validation preserved: snapshot structure, scorer weights totaling 100, duplicate archive key prevention, and post-write verification.

---

## 9. App 794 Process Transition Seam & Authority Continuity

### 9.1 Authority Continuity Rule
- `ATTESTATION_AND_TRANSITION_USER_AUTHORITY` = `SAME_BACKEND_HELD_USER_OAUTH_AUTHORITY`.
- The exact same retained OAuth access token that created the Attestation record must be used to execute the App 794 Process Management transition (`PUT /k/v1/record/status.json`).
- Guarantees Kintone native Process Management status history stamps the identical human actor who authorized the archive.

### 9.2 Token Degradation & Fail-Closed Behavior
- If the OAuth token expires, is revoked, or fails before App 794 transition:
  - `NO SILENT TOKEN SUBSTITUTION`
  - `NO DIFFERENT USER TOKEN`
  - `NO SERVICE-ACCOUNT TRANSITION FALLBACK`
  - `FAIL_CLOSED` = Mandatory.
  - Transaction halts; client must re-authorize under standard protocol.

---

## 10. Ordering, Failure Model & Ambiguous Transition Recovery

### 10.1 Strict Execution Order
1. **Prepare Expectation**: Server computes nonce and transaction envelope.
2. **Attestation Record Creation**: Server creates Attestation record using backend-held user OAuth authority.
3. **Privileged Verification**: Server reads record with privileged reader, validates all fields, extracts `CREATOR.value.code`.
4. **App 798 Archive Creation**: Server invokes `RevisionArchiveService` with privileged writer credential (`Archived_By = CREATOR.value.code`).
5. **App 798 Archive Verification**: Verified via immediate readback and idempotency confirmation.
6. **App 794 Process Transition**: Server executes process status update using same user OAuth authority.

**Universal Invariant**: `APP794_ROUTE_SNAPSHOT_REUSE_BEFORE_ARCHIVE_SUCCESS` = `FORBIDDEN`.

### 10.2 Transition Timeout & Ambiguous Result Recovery Contract
`BLIND_TRANSITION_RETRY_AFTER_TIMEOUT` = `FORBIDDEN`.

Because Kintone REST API does not provide distributed transactions or two-phase commit, transport timeout on Step 6 creates an ambiguous state. Blindly retrying the transition is forbidden.

#### Required Recovery Sequence:
```text
App 798 Archive Verified
          │
          ▼
App 794 Status Transition Request Dispatched
          │
          ▼
Response Timeout / Network Ambiguity
          │
          ▼
Authoritative App 794 State Readback
          │
          ├──> Case A: Status is still Expected_From_Status & Revision matches pre-transition
          │    └── Classification: TRANSITION_NOT_COMMITTED_RETRYABLE
          │    └── Safe retry permitted by implementation contract using same user authority.
          │
          ├──> Case B: Status has reached Expected_Target_Status
          │    └── Classification: TRANSITION_COMMITTED_STATE_OBSERVED
          │    └── Record state as observed target; DO NOT send transition request again.
          │    └── Do NOT overclaim exact execution attribution solely from target status.
          │
          ├──> Case C: Status has moved to unexpected state or revision conflict
          │    └── Classification: TRANSITION_CONFLICT
          │    └── FAIL CLOSED; do not retry; surface conflict error.
          │
          └──> Case D: App 794 cannot be read or state remains ambiguous
               └── Classification: TRANSITION_RESULT_AMBIGUOUS
               └── FAIL CLOSED; NO AUTOMATIC RETRY. Operator investigation required.
```

Under no circumstances is the App 798 archive row deleted or altered.

---

## 11. Exact Implementation Source File Plan

For the subsequent `IMPLEMENTATION-01` package, the candidate source file plan is:

| File Path | Action | Description & Runtime Architecture |
|---|---|---|
| `src/server/mbo-gateway-server.js` | `MODIFY_EXISTING` | Mount D3 OAuth & trusted transaction dispatcher into existing `node:http` server composition. |
| `src/server/routes/d3-oauth-attestation-handler.js` | `CREATE_NEW` | `node:http`-compatible request dispatcher for `/api/mbo/oauth/*` and `/api/mbo/d3/transaction/*`. |
| `src/server/services/d3-token-store-interface.js` | `CREATE_NEW` | Abstract interface and contracts for server-side OAuth grant lifecycle. |
| `src/server/services/d3-attestation-verifier.js` | `CREATE_NEW` | Nonce management, attestation schema validation, and privileged readback verifier. |
| `src/server/services/d3-trusted-archive-transition-service.js` | `CREATE_NEW` | High-level orchestrator: coordinates Attestation, `RevisionArchiveService`, and App 794 transition. |
| `src/services/revision-archive-service.js` | `NO_CHANGE` | Reused directly as canonical archive domain engine. |
| `src/services/revision-archive-kintone-repository.js` | `NO_CHANGE` | Reused directly for App 798 repository operations. |
| `src/main-mbo-app.js` | `MODIFY_EXISTING` | Adapt client-side transition handler to request trusted transaction execution from gateway. |

---

## 12. Exact Implementation Test Plan

For the subsequent `IMPLEMENTATION-01` package, the candidate test suite plan is:

| Test File Path | Action | Scope / Test Requirements |
|---|---|---|
| `tests/d3-oauth-attestation-handler.test.js` | `CREATE_NEW` | Unit & integration tests for `node:http` request handling, state validation, and error serialization. |
| `tests/d3-attestation-verifier.test.js` | `CREATE_NEW` | Unit tests for nonce lifecycle, TTL verification, snapshot hash matching, and `CREATOR` extraction. |
| `tests/d3-trusted-archive-transition-service.test.js` | `CREATE_NEW` | Workflow orchestration tests with mocked Kintone adapters covering success, timeout, and fail-closed paths. |
| `tests/d3-token-store.test.js` | `CREATE_NEW` | Memory mock test harness ensuring grant isolation, TTL rotation, and scrubbing. |
| `tests/revision-archive-service.test.js` | `NO_CHANGE` | Canonical baseline test suite (reused as-is). |
| `tests/revision-archive-kintone-repository.test.js` | `NO_CHANGE` | Canonical baseline test suite (reused as-is). |

### Mandatory Test Assertions in Future Implementation:
1. `PKCE` parameters are never generated, emitted, or expected in OAuth requests.
2. OAuth `client_secret` never appears in browser responses or client-accessible paths.
3. OAuth `access_token` and `refresh_token` are never returned to the browser.
4. Browser cannot submit arbitrary access tokens to the transaction endpoint.
5. Browser cannot select or override backend token grants.
6. Browser-supplied `userCode` or request payload `actor` cannot become the archive actor.
7. OAuth grant metadata prior to Attestation readback has no authoritative user code.
8. Platform-stamped `CREATOR` readback is the sole actor authority for `Archived_By`.
9. Missing, malformed, or unauthorized `CREATOR` fails closed before touching App 798.
10. Gateway tests exercise native `node:http` request/response behavior, not Express mocks.
11. App 794 transition timeout never triggers blind retry.
12. App 794 transition timeout triggers authoritative state readback.
13. Unexpected App 794 state after timeout classifies as `TRANSITION_RESULT_AMBIGUOUS` and fails closed.
14. Target state observation alone does not overclaim execution attribution.

---

## 13. Runtime Configuration & Secrets Contract

The following environment variables are required by the trusted runtime. **No credentials, secrets, or keys are committed to git.**

- `KINTONE_BASE_URL`: Base URL of the Kintone domain (e.g. `https://example.kintone.com`).
- `KINTONE_OAUTH_CLIENT_ID`: Confidential OAuth Client ID registered in Kintone Administration.
- `KINTONE_OAUTH_CLIENT_SECRET`: Confidential OAuth Client Secret for server-side token exchange.
- `KINTONE_OAUTH_REDIRECT_URI`: Server callback URI matching Kintone client registration.
- `KINTONE_ATTESTATION_APP_ID`: App ID of the dedicated Attestation App.
- `KINTONE_APP798_TRUSTED_WRITER_CREDENTIAL`: Privileged API token or service credential with `ADD` permission on App 798.
- `KINTONE_ATTESTATION_READER_CREDENTIAL`: Privileged API token or service credential with `VIEW` permission on Attestation App.
- `TOKEN_STORE_CONFIGURATION`: Connection string or encryption key for server-side grant storage.

---

## 14. Deployment & Scope Boundary

- **IMPLEMENTATION-01 Scope**:
  - `LOCAL SOURCE + TEST ONLY`.
  - Zero live Kintone calls.
  - Zero external network requests.
  - Injected mock adapters for unit and integration testing.
- **Separate Future Gates Required Before Live Execution**:
  1. Kintone Attestation App provisioning (Pinning physical field codes, schema fields, and ACLs).
  2. Kintone OAuth client registration in Cybozu Users & System Administration.
  3. Secure environment secrets deployment on hosting server.
  4. Live integration verification and business UAT.

---

## 15. Terminal Readiness Verdict

```text
IMPLEMENTATION_READINESS =
PASS

IMPLEMENTATION_BOUNDARY =
LOCKED

OAUTH_BACKEND_CONTRACT =
CORRECTED / DEFINED

PKCE_SUPPORT =
PROVEN_UNSUPPORTED

OAUTH_CLIENT_TYPE =
CONFIDENTIAL_CLIENT

TOKEN_CUSTODY_CONTRACT =
DEFINED

ACCESS_TOKEN_BROWSER_EXPOSURE =
FORBIDDEN

ACTOR_IDENTITY_PROVENANCE =
KINTONE_PLATFORM_STAMPED_CREATOR_ONLY

GATEWAY_RUNTIME_MODEL =
NODE_HTTP

FRAMEWORK_MIGRATION_AUTHORIZED =
NO

ATTESTATION_SYSTEM_FIELD_CONTRACT =
DEFINED

ATTESTATION_ACTOR_PROOF_FIELD_TYPE =
CREATOR

TRANSITION_AMBIGUOUS_RESULT_RECOVERY =
DEFINED

BLIND_TRANSITION_RETRY_AFTER_TIMEOUT =
FORBIDDEN

EXACT_IMPLEMENTATION_SOURCE_FILES =
DEFINED

EXACT_IMPLEMENTATION_TEST_FILES =
DEFINED

NEXT_RECOMMENDED_GATE =
D3-ARCHIVE-RUNTIME-TRUSTED-WRITER-PLATFORM-STAMPED-OAUTH-IMPLEMENTATION-01

IMPLEMENTATION_AUTHORIZED =
NO

DEPLOYMENT_AUTHORIZED =
NO

KINTONE_READ_AUTHORIZED =
NO

KINTONE_WRITE_AUTHORIZED =
NO

PROCESS_WRITE_AUTHORIZED =
NO

UAT_AUTHORIZED =
NO

NEXT_GATE_AUTHORIZED =
NO

AUTO_START_NEXT_WORK_PACKAGE =
NO
```
