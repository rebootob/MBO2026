# D3-ARCHIVE-RUNTIME-TRUSTED-WRITER-PLATFORM-STAMPED-OAUTH-IMPLEMENTATION-READINESS-01

- PACKAGE: `D3-ARCHIVE-RUNTIME-TRUSTED-WRITER-PLATFORM-STAMPED-OAUTH-IMPLEMENTATION-READINESS-01-R3`
- AUTHORIZATION_ID: `MBO2026-D3-ARCHIVE-RUNTIME-TRUSTED-WRITER-PLATFORM-STAMPED-OAUTH-IMPLEMENTATION-READINESS-01-R3-20260918-OWNER-01`
- DATE: `2026-09-18`
- STATUS: `LOCKED READINESS SPECIFICATION / CORRECTIVE R3`
- CANONICAL_BRANCH: `ai/antigravity-wp002c`

---

## 1. Executive Summary & Control Bounds

This document defines the **Implementation-Ready Engineering Contract** for the D3 Revision Archive Trusted Writer runtime and native Kintone platform-stamped OAuth attestation architecture, formally ratified by the Owner under `OWNER_DEC_D3_009`.

### 1.1 Governance Constraints & Non-Negotiable Locks
- `OWNER_DEC_D3_009` = `LOCKED / OWNER APPROVED`
- `OWNER_RATIFIED_ARCHITECTURE` = `NATIVE_KINTONE_PLATFORM_STAMPED_OAUTH_ATTESTATION`
- `NO_MORE_NATIVE_ACTOR_RESEARCH` = `YES`
- `TRUSTED_WRITER_ACTOR_ARCHITECTURE_SELECTION_BLOCKER` = `RESOLVED`
- `OAUTH_CLIENT_TYPE` = `CONFIDENTIAL_CLIENT`
- `OAUTH_GRANT_TYPE` = `AUTHORIZATION_CODE`
- `PKCE_SUPPORT` = `PROVEN_UNSUPPORTED`
- `GATEWAY_RUNTIME_MODEL` = `NODE_HTTP`
- `FRAMEWORK_MIGRATION_AUTHORIZED` = `NO`
- `APP794_AUTHORITATIVE_RECORD_SOURCE` = `BACKEND_FETCHED_KINTONE_APP794_RECORD`
- `APP794_AUTHORITATIVE_READ_AUTHORITY` = `SAME_BACKEND_HELD_USER_OAUTH_AUTHORITY`
- `BROWSER_ARCHIVE_FACT_AUTHORITY` = `NONE`
- `CANONICAL_STAGE_SNAPSHOT_BUILDER` = `SHARED_PURE_MODULE`
- `ARCHIVE_KEY_AUTHORITY` = `EXISTING_BUILD_ARCHIVE_KEY`
- `SNAPSHOT_HASH_AUTHORITY` = `EXISTING_CANONICAL_D3_SNAPSHOT_SERIALIZER`
- `DUPLICATE_ARCHIVE_KEY_ALGORITHM` = `FORBIDDEN`
- `DUPLICATE_SNAPSHOT_HASH_ALGORITHM` = `FORBIDDEN`
- `APP798_GROUP_EVERYONE_ADD` = `NO`
- `APP798_GROUP_EVERYONE_VIEW` = `NO`
- `APP798_TRUSTED_WRITER_READ` = `YES`
- `APP798_TRUSTED_WRITER_ADD` = `YES`
- `APP798_TRUSTED_WRITER_EDIT` = `NO`
- `APP798_TRUSTED_WRITER_DELETE` = `NO`
- `APP798_TRUSTED_WRITER_SCOPE` = `READ_PLUS_APPEND_ONLY_CREATE`
- `BROWSER_APP798_CREDENTIAL` = `FORBIDDEN`
- `BROWSER_PRIVILEGED_SECRET` = `FORBIDDEN`
- `ACCESS_TOKEN_BROWSER_STORAGE` = `FORBIDDEN`
- `REFRESH_TOKEN_BROWSER_STORAGE` = `FORBIDDEN`
- `ACCESS_TOKEN_BROWSER_EXPOSURE` = `FORBIDDEN`
- `BROWSER_SELECTS_SERVER_TOKEN` = `FORBIDDEN`
- `BROWSER_SUPPLIES_OAUTH_ACCESS_TOKEN` = `FORBIDDEN`
- `OAUTH_CLIENT_SECRET_BROWSER_EXPOSURE` = `FORBIDDEN`
- `TOKEN_STORE_PRODUCTION_IN_MEMORY_ONLY` = `FORBIDDEN`
- `TOKEN_STORE_FAILS_CLOSED_IF_UNAVAILABLE` = `YES`
- `TOKEN_LOGGING` = `FORBIDDEN`
- `TOKEN_IN_ERROR_PAYLOAD` = `FORBIDDEN`
- `TOKEN_IN_GIT` = `FORBIDDEN`
- `IN_MEMORY_TOKEN_STORE` = `TEST_ONLY`
- `ATTESTATION_NONCE_SERVER_GENERATED` = `YES`
- `ATTESTATION_NONCE_SINGLE_USE` = `YES`
- `ATTESTATION_EVENT_BINDING_REQUIRED` = `YES`
- `ATTESTATION_REPLAY_DETECTED` = `FAIL_CLOSED`
- `ATTESTATION_NONCE_HIGH_ENTROPY` = `YES`
- `ATTESTATION_NONCE_FIELD_CODE` = `Transaction_Nonce`
- `ATTESTATION_EVENT_BINDING_FIELDS` = `Transaction_Nonce + App794_Record_ID + Archive_Key + Expected_From_Status + Intended_Action + Expected_Target_Status + Snapshot_Hash + Issued_At + Expires_At`
- `ATTESTATION_ACTOR_PROOF_FIELD_TYPE` = `CREATOR`
- `ATTESTATION_PLATFORM_TIME_FIELD_TYPE` = `CREATED_TIME`
- `ATTESTATION_EXPIRY_REQUIRED` = `YES`
- `ATTESTATION_EXPIRED` = `FAIL_CLOSED`
- `ATTESTATION_MAX_TTL_SECONDS` = `60`
- `ATTESTATION_RECORD_CREATOR_CALLER` = `TRUSTED_BACKEND_USING_BACKEND_HELD_USER_OAUTH_AUTHORITY`
- `ACTOR_IDENTITY_PROVENANCE` = `KINTONE_PLATFORM_STAMPED_CREATOR_ONLY`
- `REVISION_ARCHIVE_SERVICE_RESPONSIBILITY` = `ARCHIVE_DOMAIN_ONLY`
- `APP794_TRANSITION_ORCHESTRATION` = `D3_TRUSTED_ARCHIVE_TRANSITION_SERVICE`
- `BLIND_TRANSITION_RETRY_AFTER_TIMEOUT` = `FORBIDDEN`
- `IMPLEMENTATION_AUTHORIZED` = `NO`
- `DEPLOYMENT_AUTHORIZED` = `NO`
- `KINTONE_READ_AUTHORIZED` = `NO`
- `KINTONE_WRITE_AUTHORIZED` = `NO`
- `PROCESS_WRITE_AUTHORIZED` = `NO`
- `UAT_AUTHORIZED` = `NO`
- `FULL_D3_BUSINESS_UAT` = `NOT_PROVEN`
- `D3_CLOSURE` = `NOT_CLAIMED`
- `PRODUCTION_READY` = `NO`

---

## 2. Verification of Repository Facts (Truth Baseline)

Pre-implementation inspection of repository code establishes the following facts:

1. **Gateway Server Model (`src/server/mbo-gateway-server.js`)**:
   - Runtime model is native `node:http` (`createServer`), **NOT Express**.
   - No Express router, middleware, or external framework is present; framework migration is unauthorized (`FRAMEWORK_MIGRATION_AUTHORIZED = NO`).
   - Current server routes: `POST /api/mbo/login`, `POST /api/mbo/change-password`, `POST /api/mbo/logout`, `GET /api/mbo/bootstrap`, `GET /api/mbo/history`, `GET /api/mbo/records/:id`, `GET /health`.
   - Employs explicit cookie handling, JSON body parsing, CORS/origin checking, and clean dependency injection.
   - Reuse existing gateway server via modular D3 handler: `EXISTING_GATEWAY_REUSE = YES`, `NEW_STANDALONE_BACKEND = NO`.

2. **Core Archive Service (`src/services/revision-archive-service.js`)**:
   - `buildArchiveKey(...)` is the single canonical exported authority for deriving deterministic archive keys (`ARCHIVE_KEY_AUTHORITY = EXISTING_BUILD_ARCHIVE_KEY`).
   - `REVISION_ARCHIVE_SERVICE_RESPONSIBILITY = ARCHIVE_DOMAIN_ONLY`: Core domain responsibilities include archive event validation, actor validation, canonical Archive_Key handling, canonical snapshot/hash validation, duplicate/idempotency check, App 798 append, uncertain-write recovery, and App 798 post-create/readback verification.
   - `RevisionArchiveService` does NOT fetch authoritative App 794 workflow state, does NOT create OAuth attestation, does NOT orchestrate App 794 Process Management transition, and does NOT perform transition-timeout state recovery.
   - All transition orchestration and workflow state recovery responsibilities belong to the future trusted backend service (`APP794_TRANSITION_ORCHESTRATION = D3_TRUSTED_ARCHIVE_TRANSITION_SERVICE`).
   - Core archive business logic and invariant validation remain locked (`NO_CHANGE`).

3. **Kintone Archive Repository Interface (`src/services/revision-archive-kintone-repository.js`)**:
   - Requires an injected Kintone API adapter providing both `getRecords` (for pre-write lookup, duplicate check, and readback verification) and `addRecord` (for append-only archive write).
   - Core archive repository logic remains locked (`NO_CHANGE`).

4. **Main Bootstrap & Snapshot Construction (`src/main-mbo-app.js`)**:
   - Contains browser-side bootstrap, session wiring, and currently houses `buildStageLogicalSnapshot(...)`.
   - Browser client must NOT serve as archive authority (`BROWSER_ARCHIVE_FACT_AUTHORITY = NONE`).
   - Snapshot logic must be extracted into a shared pure module (`src/services/d3-stage-logical-snapshot.js`) consumed by backend using authoritative Kintone records.

5. **Test Harness**:
   - Local mock unit tests (`tests/revision-archive-service.test.js` and `tests/revision-archive-kintone-repository.test.js`) enforce zero unverified writes, idempotency, and fail-closed behaviors.

---

## 3. The 12 Engineering Readiness Contracts

### Contract 1: Trusted Backend Runtime Seam
- **Hosting Model**: Dedicated D3 trusted runtime module registered under the existing Node.js HTTP gateway server (`src/server/mbo-gateway-server.js`).
- **Protocol**: Native `node:http` request/response pipeline (`IncomingMessage` / `ServerResponse`).
- **Endpoints**:
  - `GET /api/mbo/d3/oauth/authorize`: Initiates Cybozu OAuth flow with server-generated cryptographic state.
  - `GET /api/mbo/d3/oauth/callback`: Handles authorization code callback, validates state, executes confidential token exchange server-side.
  - `POST /api/mbo/d3/transaction/prepare-transition`: Receives transaction intent (`recordId`, `intendedAction`), executes full authoritative server-side pipeline.
  - `GET /api/mbo/d3/transaction/status/:nonce`: Queries transaction state for recovery (read-only; never re-authorizes consumed nonce).

### Contract 2: OAuth Lifecycle & Confidential Client Seam
- **Client Classification**: `OAUTH_CLIENT_TYPE = CONFIDENTIAL_CLIENT`
- **Grant Type**: `OAUTH_GRANT_TYPE = AUTHORIZATION_CODE`
- **PKCE Support**: `PKCE_SUPPORT = PROVEN_UNSUPPORTED` (Cybozu OAuth does not support RFC 7636 PKCE; PKCE parameters must not be emitted or expected).
- **Client Secret Protection**: `client_secret` is retained strictly server-side in secure runtime configuration; browser exposure is forbidden (`OAUTH_CLIENT_SECRET_BROWSER_EXPOSURE = FORBIDDEN`).
- **State Validation**: Server generates high-entropy cryptographic state bound to user session, validated upon callback (`STATE_PARAMETER_REQUIRED = YES`, `CALLBACK_STATE_VALIDATION = REQUIRED`).
- **Token Exchange**: Server-side Basic Auth exchange against Cybozu token endpoint (`TOKEN_EXCHANGE_SERVER_SIDE_ONLY = YES`).
- **Zero Browser Token Exposure**: Browser never receives, stores, or handles OAuth `access_token` or `refresh_token` (`ACCESS_TOKEN_BROWSER_STORAGE = FORBIDDEN`, `REFRESH_TOKEN_BROWSER_STORAGE = FORBIDDEN`, `ACCESS_TOKEN_BROWSER_EXPOSURE = FORBIDDEN`, `BROWSER_SELECTS_SERVER_TOKEN = FORBIDDEN`, `BROWSER_SUPPLIES_OAUTH_ACCESS_TOKEN = FORBIDDEN`).

### Contract 3: Secure Server-Side Token Custody & Actor Identity Provenance
- **Token Custody & Security Guardrails**:
  - Tokens are stored server-side via `D3TokenStoreInterface` bound to authenticated gateway session ID.
  - `TOKEN_STORE_PRODUCTION_IN_MEMORY_ONLY = FORBIDDEN` (Production requires encrypted persistent store; in-memory mock permitted only in unit test suites: `IN_MEMORY_TOKEN_STORE = TEST_ONLY`).
  - `TOKEN_STORE_FAILS_CLOSED_IF_UNAVAILABLE = YES`.
  - `TOKEN_LOGGING = FORBIDDEN`.
  - `TOKEN_IN_ERROR_PAYLOAD = FORBIDDEN`.
  - `TOKEN_IN_GIT = FORBIDDEN`.
- **Allowed Grant Metadata**:
  - `accessToken`
  - `refreshToken`
  - `expiresAt`
  - `scope`
  - `oauthGrantId`
  - `serverSessionBinding`
  - `authorizationMetadata`
- **Actor Identity Provenance Contract**:
  - `OAUTH_GRANT_AUTHORITATIVE_ACTOR_USERCODE = NONE_BEFORE_ATTESTATION_READBACK`
  - `AUTHORITATIVE_ACTOR_SOURCE = KINTONE_PLATFORM_STAMPED_CREATED_BY_READBACK`
  - Browser-supplied, session-supplied, or inferred `userCode` is strictly forbidden from being treated as authoritative actor identity (`BROWSER_USERCODE_AS_ACTOR = FORBIDDEN`, `REQUEST_USERCODE_AS_ACTOR = FORBIDDEN`).
  - Authoritative actor user code is established **exclusively** after platform-stamped Created By readback and validation from the Attestation App.
- **Token Continuity**:
  - `ATTESTATION_AND_TRANSITION_USER_AUTHORITY = SAME_BACKEND_HELD_USER_OAUTH_AUTHORITY`
  - The exact same retained OAuth authority must be used for:
    1. Authoritative App 794 record read
    2. Attestation App record creation
    3. App 794 Process Management status transition
  - Silent token substitution, user switching, or service-account fallback is strictly forbidden (`FAIL_CLOSED`).

### Contract 4: App 794 Authoritative Record Source & Pre-Attestation Pipeline
- **Authority Rule**:
  - Browser is NOT an authority for archive facts (`BROWSER_ARCHIVE_FACT_AUTHORITY = NONE`).
  - Browser provides bounded transaction intent only (`recordId`, `intendedAction`).
  - All archive facts, snapshot data, hashes, and keys are derived exclusively by the backend from a live fetched Kintone App 794 record.
- **Pre-Attestation Order of Operations**:
  1. **Intent Submission**: Browser posts `{ recordId, intendedAction }` to trusted backend.
  2. **OAuth Authority Load**: Backend loads backend-held user OAuth authority bound to session.
  3. **Authoritative App 794 Fetch**: Backend fetches App 794 record from Kintone using the SAME user OAuth authority (`APP794_AUTHORITATIVE_RECORD_SOURCE = BACKEND_FETCHED_KINTONE_APP794_RECORD`, `APP794_AUTHORITATIVE_READ_AUTHORITY = SAME_BACKEND_HELD_USER_OAUTH_AUTHORITY`).
  4. **Record Derivation**: Backend derives Record ID, `Record_Key`, `Employee_Code`, `Fiscal_Year`, current `Status`, `Revision_Number`, active D3 route provenance, and business snapshot fields.
  5. **Status & Transition Validation**: Backend verifies current status permits `intendedAction` according to locked D3 stage transition rules.
  6. **Stage Determination**: Backend resolves target evaluation stage.
  7. **Canonical Snapshot Construction**: Backend builds canonical D3 logical snapshot using `CANONICAL_STAGE_SNAPSHOT_BUILDER = SHARED_PURE_MODULE` (`src/services/d3-stage-logical-snapshot.js`).
  8. **Snapshot Hash Computation**: Backend computes canonical hash using `SNAPSHOT_HASH_AUTHORITY = EXISTING_CANONICAL_D3_SNAPSHOT_SERIALIZER`.
  9. **Archive Key Derivation**: Backend derives deterministic key using `ARCHIVE_KEY_AUTHORITY = EXISTING_BUILD_ARCHIVE_KEY` from `src/services/revision-archive-service.js`.
  10. **Envelope Binding**: Backend binds authoritative `recordId`, `Archive_Key`, `Expected_From_Status`, `Intended_Action`, `Expected_Target_Status`, `Snapshot_Hash`, `Issued_At`, `Expires_At`, and high-entropy nonce into Attestation transaction envelope.
  11. **Pipeline Continuation**: Proceeds to Attestation write, CREATOR verification, App 798 archive write, verification readback, and App 794 transition.
- **Fail-Closed on App 794 Read Failure**:
  - If App 794 fetch fails (401/403, record not found, malformed record, missing required fields, status/revision unresolvable, OAuth authority unavailable, mismatch), the process halts immediately (`FAIL_CLOSED`).
  - Conceptual error classes: `APP794_AUTHORITATIVE_READ_FAILED`, `APP794_RECORD_NOT_FOUND`, `APP794_AUTHORITATIVE_RECORD_INVALID`, `APP794_STATUS_NOT_RESOLVED`, `APP794_REVISION_NOT_RESOLVED`, `APP794_TRANSITION_INTENT_MISMATCH`.
  - No Attestation App record is written if pre-attestation App 794 fetch fails.

### Contract 5: Attestation App Schema & Full Event-Binding Envelope
- **Purpose**: A dedicated write-audit app used solely to obtain Kintone server-stamped actor identity (`CREATOR`) and bind transaction event intent.
- **Canonical Envelope Fields**:
  - `ATTESTATION_EVENT_BINDING_FIELDS = Transaction_Nonce + App794_Record_ID + Archive_Key + Expected_From_Status + Intended_Action + Expected_Target_Status + Snapshot_Hash + Issued_At + Expires_At`
  - `ATTESTATION_NONCE_FIELD_CODE = Transaction_Nonce` (Single-line text, unique indexed string, server-generated, high-entropy)
  - `App794_Record_ID` (Number: authoritative record ID)
  - `Archive_Key` (Single-line text: canonical archive key from `buildArchiveKey`)
  - `Expected_From_Status` (Single-line text: backend-verified pre-transition status)
  - `Intended_Action` (Single-line text: validated workflow action intent)
  - `Expected_Target_Status` (Single-line text: canonical target transition status)
  - `Snapshot_Hash` (Single-line text: SHA-256 canonical hex string)
  - `Issued_At` (Server-generated ISO timestamp)
  - `Expires_At` (Server-generated ISO timestamp: short-lived TTL contract)
- **Platform System Fields**:
  - `CREATOR` (`ATTESTATION_ACTOR_PROOF_FIELD_TYPE = CREATOR`): Injected by platform; returns `{ code, name }`. Physical field code to be locked at provisioning (`ATTESTATION_CREATOR_PHYSICAL_FIELD_CODE = PROVISIONING_LOCK_REQUIRED`).
  - `CREATED_TIME` (`ATTESTATION_PLATFORM_TIME_FIELD_TYPE = CREATED_TIME`): Platform-generated server timestamp.
- **TTL & Expiry Semantics**:
  - `ATTESTATION_EXPIRY_REQUIRED = YES`
  - `ATTESTATION_EXPIRED = FAIL_CLOSED`
  - `ATTESTATION_MAX_TTL_SECONDS = 60`
- **ACL Contract**:
  - `GROUP everyone Add`: Allowed for target users so user OAuth token can create record.
  - `GROUP everyone View`: **Forbidden** (`APP_ATTESTATION_GROUP_EVERYONE_VIEW = NO`). Only privileged backend service account may view/read.
  - `GROUP everyone Edit/Delete`: **Forbidden**.
  - `CREATOR_OVERRIDE_BY_NORMAL_WORKFLOW_USER = FORBIDDEN` (Platform system field semantics prevent client tampering).

### Contract 6: Platform-Stamped Created By Verification & Replay Protection
- **Nonce Single-Use & Replay Defense**:
  - `ATTESTATION_NONCE_SERVER_GENERATED = YES`
  - `ATTESTATION_NONCE_SINGLE_USE = YES`
  - `ATTESTATION_EVENT_BINDING_REQUIRED = YES`
  - `ATTESTATION_REPLAY_DETECTED = FAIL_CLOSED`
  - `ATTESTATION_NONCE_HIGH_ENTROPY = YES`
  - The backend maintains trusted transaction-state tracking whether a nonce is `UNCONSUMED` or `CONSUMED`.
  - After successful privileged attestation verification, the nonce MUST be marked `CONSUMED` before any App 798 mutation is permitted.
  - A second execution attempt using a consumed nonce must fail closed (`FAIL_CLOSED`).
  - Read-only transaction status lookups may reference the transaction identifier, but must never reactivate or re-authorize a consumed nonce.
  - Replay protection guarantees: No replay may produce a second App 798 archive row, a second App 794 transition attempt, or a second actor attestation acceptance.
- **Complete Privileged Readback Verification Checklist**:
  Before App 798 write, privileged backend verification must confirm:
  1. Attestation record exists (`ATTESTATION_NOT_FOUND`).
  2. `Transaction_Nonce` matches expected server-generated nonce (`ATTESTATION_NONCE_MISMATCH`).
  3. Nonce is `UNCONSUMED` (`ATTESTATION_REPLAY_DETECTED`).
  4. Nonce is not expired (`ATTESTATION_EXPIRED`).
  5. `App794_Record_ID` matches authoritative backend-fetched App 794 record (`ATTESTATION_RECORD_ID_MISMATCH`).
  6. `Archive_Key` matches canonical `buildArchiveKey(...)` result (`ATTESTATION_ARCHIVE_KEY_MISMATCH`).
  7. `Expected_From_Status` matches backend-fetched App 794 status (`ATTESTATION_FROM_STATUS_MISMATCH`).
  8. `Intended_Action` matches validated transaction intent (`ATTESTATION_ACTION_MISMATCH`).
  9. `Expected_Target_Status` matches canonical transition mapping (`ATTESTATION_TARGET_STATUS_MISMATCH`).
  10. `Snapshot_Hash` matches canonical server-computed hash (`ATTESTATION_SNAPSHOT_HASH_MISMATCH`).
  11. `CREATOR` exists and contains exact nonblank user code (`ATTESTATION_ACTOR_NOT_RESOLVED`).
  12. Created record is bound to the expected transaction/event.
  - If ANY check fails: Abort transaction immediately with `FAIL_CLOSED`. No App 798 mutation.
  - Authoritative actor user code is strictly extracted from `CREATOR.value.code` (`ARCHIVED_BY_FROM_PLATFORM_CREATED_BY_ONLY = YES`).

### Contract 7: App 798 Trusted Writer Integration & Credential Contract
- **Credential Scope**:
  - `APP798_TRUSTED_WRITER_READ = YES` (Required for duplicate check, conflict detection, and post-write verification).
  - `APP798_TRUSTED_WRITER_ADD = YES` (Required for append-only archive write).
  - `APP798_TRUSTED_WRITER_EDIT = NO` (Prohibited; archive records are immutable).
  - `APP798_TRUSTED_WRITER_DELETE = NO` (Prohibited; archive records are immutable).
  - `APP798_TRUSTED_WRITER_SCOPE = READ_PLUS_APPEND_ONLY_CREATE`
- **ACL Baseline**:
  - `APP798_GROUP_EVERYONE_ADD = NO`
  - `APP798_GROUP_EVERYONE_VIEW = NO`
  - Browser holds zero App 798 credentials (`BROWSER_APP798_CREDENTIAL = FORBIDDEN`).
- **Archive Execution**:
  - Backend delegates immutable archive creation to `RevisionArchiveService` and `RevisionArchiveKintoneRepository`.
  - Injected actor is strictly the platform-verified user code: `Archived_By = CREATOR.value.code`.
  - Service performs pre-write duplicate check via `Archive_Key`, executes `addRecord`, and verifies record identity via readback.

### Contract 8: App 794 Process-Transition & Timeout Recovery Contract
- **Orchestration Ownership**: Orchestration is owned by `D3_TRUSTED_ARCHIVE_TRANSITION_SERVICE` (`APP794_TRANSITION_ORCHESTRATION = D3_TRUSTED_ARCHIVE_TRANSITION_SERVICE`).
- **Execution**: Backend executes App 794 process transition using the SAME backend-held user OAuth authority.
- **Fail-Closed Invariant**: App 794 transition must never be attempted before App 798 archive write is verified.
- **Timeout / Ambiguous Result Recovery**:
  - `BLIND_TRANSITION_RETRY_AFTER_TIMEOUT = FORBIDDEN`
  - If App 794 transition request times out or returns network/transport ambiguity:
    1. Backend performs authoritative GET readback of App 794 record using user OAuth authority.
    2. Backend compares observed `status` and `revision` against pre-transition state.
    3. Result classification:
       - `TRANSITION_NOT_COMMITTED_RETRYABLE`: Record remains in exact original from-status and revision has not changed. Safe retry is permitted by contract.
       - `TRANSITION_COMMITTED_STATE_OBSERVED`: Record has already reached expected target status. Do NOT re-send transition; report observed committed state.
       - `TRANSITION_CONFLICT`: Record transitioned to an unexpected status or revision changed concurrently. Handoff to human review; no automated transition.
       - `TRANSITION_RESULT_AMBIGUOUS`: Readback fails, status cannot be determined, or state is inconsistent. Fail closed immediately (`FAIL_CLOSED`); no blind retry.
  - App 798 archive record is immutable and must never be rolled back or deleted.

### Contract 9: Single Authority Contracts (Snapshot, Key, Hash)
- **Single Snapshot Builder Authority**:
  - `CANONICAL_STAGE_SNAPSHOT_BUILDER = SHARED_PURE_MODULE`
  - Extraction to `src/services/d3-stage-logical-snapshot.js` (CREATE_NEW).
  - Pure deterministic transformation; zero network, credential, browser, or server globals.
  - Accepts server-fetched App 794 record and transition context, performs provenance checks, and outputs canonical logical snapshot.
  - `BROWSER_BACKEND_DUPLICATED_SNAPSHOT_LOGIC = FORBIDDEN`.
- **Single Archive Key Authority**:
  - `ARCHIVE_KEY_AUTHORITY = EXISTING_BUILD_ARCHIVE_KEY`
  - Reuses existing exported `buildArchiveKey(...)` from `src/services/revision-archive-service.js`.
  - `DUPLICATE_ARCHIVE_KEY_ALGORITHM = FORBIDDEN`.
- **Single Snapshot Hash Authority**:
  - `SNAPSHOT_HASH_AUTHORITY = EXISTING_CANONICAL_D3_SNAPSHOT_SERIALIZER`
  - Reuses canonical serializer and SHA-256 hash implementation.
  - `DUPLICATE_SNAPSHOT_HASH_ALGORITHM = FORBIDDEN`.

### Contract 10: Exact Future Implementation Source Plan
The candidate IMPLEMENTATION-01 source file changes are strictly pinned:

1. `src/server/mbo-gateway-server.js` (`MODIFY_EXISTING`):
   - Mount D3 OAuth and transaction HTTP dispatchers under existing Node.js HTTP gateway server.
   - Inject token store and service dependencies.
2. `src/server/routes/d3-oauth-attestation-handler.js` (`CREATE_NEW`):
   - Native `node:http` request dispatcher for D3 OAuth routes (`/authorize`, `/callback`) and transaction endpoints.
   - Zero Express dependencies.
3. `src/server/services/d3-token-store-interface.js` (`CREATE_NEW`):
   - Server-side token-store interface + test-only local mock/in-memory adapter where needed (`IN_MEMORY_TOKEN_STORE = TEST_ONLY`; NOT an approved production in-memory-only storage solution).
4. `src/server/services/d3-attestation-verifier.js` (`CREATE_NEW`):
   - Service performing attestation record creation via user OAuth, nonce tracking/consumption, and privileged readback verification.
5. `src/server/services/d3-trusted-archive-transition-service.js` (`CREATE_NEW`):
   - Orchestrates the full pre-attestation App 794 fetch, snapshot generation, attestation, App 798 archive write, and App 794 transition (`APP794_TRANSITION_ORCHESTRATION = D3_TRUSTED_ARCHIVE_TRANSITION_SERVICE`).
6. `src/services/d3-stage-logical-snapshot.js` (`CREATE_NEW`):
   - Shared pure module for building canonical D3 stage logical snapshots from server-fetched Kintone records.
7. `src/services/revision-archive-service.js` (`NO_CHANGE`):
   - Preserved as canonical archive domain engine (`REVISION_ARCHIVE_SERVICE_RESPONSIBILITY = ARCHIVE_DOMAIN_ONLY`).
8. `src/services/revision-archive-kintone-repository.js` (`NO_CHANGE`):
   - Preserved as canonical Kintone archive repository.
9. `src/main-mbo-app.js` (`MODIFY_EXISTING`):
   - Refactor client transition trigger to submit bounded transaction intent (`recordId`, `intendedAction`) to trusted backend instead of performing client-side archive writes.
   - Consume shared snapshot builder for local UI displays.

### Contract 11: Exact Future Implementation Test Plan
The candidate IMPLEMENTATION-01 test file changes are strictly pinned across the 7 planned files:

1. `tests/d3-stage-logical-snapshot.test.js` (`CREATE_NEW`):
   - Unit tests for pure snapshot builder: deterministic output, field mapping, missing provenance rejection.
   - Rejection of client-injected fields and verification of shared snapshot logic.
2. `tests/d3-oauth-attestation-handler.test.js` (`CREATE_NEW`):
   - Native `node:http` request handling, query parsing, state validation, confidential code exchange.
   - **OAuth / Token Safety Invariants**:
     - PKCE parameters are never emitted or required (`PKCE_SUPPORT = PROVEN_UNSUPPORTED`).
     - OAuth `client_secret` never reaches browser output (`OAUTH_CLIENT_SECRET_BROWSER_EXPOSURE = FORBIDDEN`).
     - `access_token` never reaches browser output (`ACCESS_TOKEN_BROWSER_EXPOSURE = FORBIDDEN`).
     - `refresh_token` never reaches browser output (`REFRESH_TOKEN_BROWSER_STORAGE = FORBIDDEN`).
     - Browser cannot submit arbitrary OAuth access token (`BROWSER_SUPPLIES_OAUTH_ACCESS_TOKEN = FORBIDDEN`).
     - Browser cannot select backend grant/token (`BROWSER_SELECTS_SERVER_TOKEN = FORBIDDEN`).
     - Tokens and secrets never appear in logs (`TOKEN_LOGGING = FORBIDDEN`).
     - Tokens and secrets never appear in error payloads (`TOKEN_IN_ERROR_PAYLOAD = FORBIDDEN`).
3. `tests/d3-token-store.test.js` (`CREATE_NEW`):
   - Unit tests for token encryption, grant retention, session isolation, expiration scrubbing.
   - Guardrails:
     - Rejection of production in-memory configuration (`TOKEN_STORE_PRODUCTION_IN_MEMORY_ONLY = FORBIDDEN`).
     - Store fails closed if unavailable (`TOKEN_STORE_FAILS_CLOSED_IF_UNAVAILABLE = YES`).
     - In-memory mock adapter active only in test harness (`IN_MEMORY_TOKEN_STORE = TEST_ONLY`).
4. `tests/d3-attestation-verifier.test.js` (`CREATE_NEW`):
   - **Actor / CREATOR Safety Invariants**:
     - Browser-supplied `userCode` cannot become archive actor (`BROWSER_USERCODE_AS_ACTOR = FORBIDDEN`).
     - Request actor cannot become archive actor (`REQUEST_USERCODE_AS_ACTOR = FORBIDDEN`).
     - OAuth grant metadata has no authoritative actor before attestation (`OAUTH_GRANT_AUTHORITATIVE_ACTOR_USERCODE = NONE_BEFORE_ATTESTATION_READBACK`).
     - Missing CREATOR fails closed (`ATTESTATION_ACTOR_NOT_RESOLVED`).
     - Malformed CREATOR fails closed (`ATTESTATION_ACTOR_NOT_RESOLVED`).
     - Blank `CREATOR.code` fails closed (`ATTESTATION_ACTOR_NOT_RESOLVED`).
     - Platform CREATOR readback is sole `Archived_By` authority.
   - **Nonce / Replay / Event-Binding Invariants**:
     - Expired nonce fails closed (`ATTESTATION_EXPIRED`).
     - Reused nonce fails closed (`ATTESTATION_REPLAY_DETECTED`).
     - Consumed nonce fails closed (`ATTESTATION_REPLAY_DETECTED`).
     - Wrong nonce fails closed (`ATTESTATION_NONCE_MISMATCH`).
     - Nonce bound to another App 794 record fails closed (`ATTESTATION_RECORD_ID_MISMATCH`).
     - Wrong `App794_Record_ID` fails closed (`ATTESTATION_RECORD_ID_MISMATCH`).
     - Wrong `Archive_Key` fails closed (`ATTESTATION_ARCHIVE_KEY_MISMATCH`).
     - Wrong `Expected_From_Status` fails closed (`ATTESTATION_FROM_STATUS_MISMATCH`).
     - Wrong `Intended_Action` fails closed (`ATTESTATION_ACTION_MISMATCH`).
     - Wrong `Expected_Target_Status` fails closed (`ATTESTATION_TARGET_STATUS_MISMATCH`).
     - Wrong `Snapshot_Hash` fails closed (`ATTESTATION_SNAPSHOT_HASH_MISMATCH`).
     - Missing expiry fails closed (`ATTESTATION_EXPIRED`).
     - Attestation verification failure occurs before App 798 mutation.
5. `tests/d3-trusted-archive-transition-service.test.js` (`CREATE_NEW`):
   - **App 794 Authoritative Source Invariants (R2 Retained)**:
     - Browser snapshot cannot override backend App 794 fetch.
     - Browser `Snapshot_Hash` cannot override canonical hash.
     - Browser `Archive_Key` cannot override canonical key.
     - Browser status cannot override authoritative status.
     - Browser revision cannot override authoritative revision.
     - App 794 authoritative fetch occurs before attestation.
     - App 794 read failure stops before Attestation write.
     - Shared snapshot builder receives backend-fetched App 794 record.
   - **App 798 Trusted Writer Invariants (R2 Retained)**:
     - `READ` permission required (`APP798_TRUSTED_WRITER_READ = YES`).
     - `ADD` permission required (`APP798_TRUSTED_WRITER_ADD = YES`).
     - Read denied fails closed.
     - `EDIT` never invoked (`APP798_TRUSTED_WRITER_EDIT = NO`).
     - `DELETE` never invoked (`APP798_TRUSTED_WRITER_DELETE = NO`).
     - Duplicate/archive conflict remains fail-closed.
     - Uncertain App 798 write uses canonical recovery semantics.
     - Archive success/readback verification required before transition.
   - **Transition & Recovery Invariants**:
     - Token expires before transition -> fail closed.
     - App 798 archive failure -> no App 794 transition.
     - Archive succeeds / transition fails -> archive retained.
     - Transition timeout never causes blind retry (`BLIND_TRANSITION_RETRY_AFTER_TIMEOUT = FORBIDDEN`).
     - Transition timeout performs authoritative App 794 readback.
     - Expected target state observed -> do not re-send transition.
     - Unexpected state/revision -> conflict/fail closed.
     - Unreadable ambiguous state -> no automatic retry.
6. `tests/revision-archive-service.test.js` (`NO_CHANGE`):
   - Preserved baseline archive service unit tests (`REVISION_ARCHIVE_SERVICE_RESPONSIBILITY = ARCHIVE_DOMAIN_ONLY`).
7. `tests/revision-archive-kintone-repository.test.js` (`NO_CHANGE`):
   - Preserved baseline repository unit tests.

### Contract 12: Runtime Secrets & Configuration Contract
- `KINTONE_OAUTH_CLIENT_ID`: OAuth Client ID (Confidential client).
- `KINTONE_OAUTH_CLIENT_SECRET`: OAuth Client Secret (Strictly backend-only; zero browser exposure; zero logging).
- `KINTONE_OAUTH_REDIRECT_URI`: Registered callback URI pointing to gateway endpoint.
- `KINTONE_APP798_TRUSTED_WRITER_CREDENTIAL`: Service account or API token with `READ` + `ADD` permissions on App 798 (`EDIT` / `DELETE` strictly forbidden).
- `KINTONE_ATTESTATION_READER_CREDENTIAL`: Privileged credential with `READ` permission on Attestation App.
- `KINTONE_ATTESTATION_APP_ID`: Target Kintone App ID for Attestation.
- `KINTONE_TOKEN_ENCRYPTION_KEY`: Symmetric encryption key (AES-256-GCM) for storing backend-held OAuth grants.

---

## 4. Final Readiness Gate Evaluation

| Item | Requirement | Status | Verification Note |
| :--- | :--- | :--- | :--- |
| 1 | Architecture Locked | **PASS** | `OWNER_DEC_D3_009` ratified; native platform-stamped Created By architecture |
| 2 | OAuth Client Specification | **PASS** | `CONFIDENTIAL_CLIENT`; PKCE unsupported; state validation mandatory; browser token exposure forbidden |
| 3 | Token Custody & Storage | **PASS** | Server-side only; production in-memory forbidden; test mock allowed; zero logging |
| 4 | Actor Identity Provenance | **PASS** | Sole source is Kintone platform-stamped `CREATOR` readback |
| 5 | Nonce Single-Use & Replay | **PASS** | Server-generated; high-entropy; single-use unconsumed/consumed lifecycle; replay fails closed |
| 6 | Full Event-Binding Envelope | **PASS** | Nonce, App794 ID, Archive Key, From Status, Action, Target Status, Hash, Issued At, Expires At (TTL <= 60s) |
| 7 | Complete Privileged Readback | **PASS** | 12-point verification checklist; 11 explicit fail-closed conceptual errors |
| 8 | App 794 Authoritative Source | **PASS** | Server-fetched App 794 record via user OAuth authority; browser has zero archive authority |
| 9 | Single Snapshot / Key / Hash | **PASS** | Shared pure module; canonical `buildArchiveKey`; canonical D3 serializer; duplicate algorithms forbidden |
| 10 | App 798 Writer Permissions | **PASS** | `READ` + `ADD` locked; `EDIT` / `DELETE` forbidden; `everyone` group denied |
| 11 | Source Responsibilities | **PASS** | `RevisionArchiveService` = archive domain only; `d3-trusted-archive-transition-service` = transition orchestration |
| 12 | Transition Timeout Recovery | **PASS** | Blind retry forbidden; authoritative state readback and classification locked |

---

## 5. Control Truth & Authority Assertions

```text
IMPLEMENTATION_READINESS = PASS
IMPLEMENTATION_BOUNDARY = LOCKED
NONCE_SINGLE_USE_REPLAY_CONTRACT = LOCKED
FULL_EVENT_BINDING_CONTRACT = LOCKED
TOKEN_STORE_SECURITY_GUARDRAILS = LOCKED
R1_ADVERSARIAL_TEST_CONTRACT = RETAINED
R2_AUTHORITATIVE_SOURCE_FIXES = RETAINED
R2_APP798_PERMISSION_FIXES = RETAINED
ATTESTATION_NONCE_SERVER_GENERATED = YES
ATTESTATION_NONCE_SINGLE_USE = YES
ATTESTATION_EVENT_BINDING_REQUIRED = YES
ATTESTATION_REPLAY_DETECTED = FAIL_CLOSED
ATTESTATION_NONCE_HIGH_ENTROPY = YES
ATTESTATION_NONCE_FIELD_CODE = Transaction_Nonce
ATTESTATION_EVENT_BINDING_FIELDS = Transaction_Nonce + App794_Record_ID + Archive_Key + Expected_From_Status + Intended_Action + Expected_Target_Status + Snapshot_Hash + Issued_At + Expires_At
ATTESTATION_ACTOR_PROOF_FIELD_TYPE = CREATOR
ATTESTATION_PLATFORM_TIME_FIELD_TYPE = CREATED_TIME
ATTESTATION_EXPIRY_REQUIRED = YES
ATTESTATION_EXPIRED = FAIL_CLOSED
ATTESTATION_MAX_TTL_SECONDS = 60
TOKEN_STORE_PRODUCTION_IN_MEMORY_ONLY = FORBIDDEN
TOKEN_STORE_FAILS_CLOSED_IF_UNAVAILABLE = YES
TOKEN_LOGGING = FORBIDDEN
TOKEN_IN_ERROR_PAYLOAD = FORBIDDEN
TOKEN_IN_GIT = FORBIDDEN
IN_MEMORY_TOKEN_STORE = TEST_ONLY
OAUTH_CLIENT_SECRET_BROWSER_EXPOSURE = FORBIDDEN
ACCESS_TOKEN_BROWSER_EXPOSURE = FORBIDDEN
ACCESS_TOKEN_BROWSER_STORAGE = FORBIDDEN
REFRESH_TOKEN_BROWSER_STORAGE = FORBIDDEN
BROWSER_SUPPLIES_OAUTH_ACCESS_TOKEN = FORBIDDEN
BROWSER_SELECTS_SERVER_TOKEN = FORBIDDEN
REVISION_ARCHIVE_SERVICE_RESPONSIBILITY = ARCHIVE_DOMAIN_ONLY
APP794_TRANSITION_ORCHESTRATION = D3_TRUSTED_ARCHIVE_TRANSITION_SERVICE
APP794_AUTHORITATIVE_RECORD_SOURCE = BACKEND_FETCHED_KINTONE_APP794_RECORD
APP794_AUTHORITATIVE_READ_AUTHORITY = SAME_BACKEND_HELD_USER_OAUTH_AUTHORITY
CANONICAL_STAGE_SNAPSHOT_BUILDER = SHARED_PURE_MODULE
BROWSER_ARCHIVE_FACT_AUTHORITY = NONE
ARCHIVE_KEY_AUTHORITY = EXISTING_BUILD_ARCHIVE_KEY
SNAPSHOT_HASH_AUTHORITY = EXISTING_CANONICAL_D3_SNAPSHOT_SERIALIZER
DUPLICATE_ARCHIVE_KEY_ALGORITHM = FORBIDDEN
DUPLICATE_SNAPSHOT_HASH_ALGORITHM = FORBIDDEN
APP798_TRUSTED_WRITER_READ = YES
APP798_TRUSTED_WRITER_ADD = YES
APP798_TRUSTED_WRITER_EDIT = NO
APP798_TRUSTED_WRITER_DELETE = NO
APP798_TRUSTED_WRITER_SCOPE = READ_PLUS_APPEND_ONLY_CREATE
OAUTH_BACKEND_CONTRACT = PASS
PKCE_SUPPORT = PROVEN_UNSUPPORTED
OAUTH_CLIENT_TYPE = CONFIDENTIAL_CLIENT
TOKEN_CUSTODY_CONTRACT = PASS
ACTOR_IDENTITY_PROVENANCE = KINTONE_PLATFORM_STAMPED_CREATOR_ONLY
GATEWAY_RUNTIME_MODEL = NODE_HTTP
FRAMEWORK_MIGRATION_AUTHORIZED = NO
ATTESTATION_SYSTEM_FIELD_CONTRACT = PASS
TRANSITION_AMBIGUOUS_RESULT_RECOVERY = PASS
BLIND_TRANSITION_RETRY_AFTER_TIMEOUT = FORBIDDEN
NEXT_RECOMMENDED_GATE = D3-ARCHIVE-RUNTIME-TRUSTED-WRITER-PLATFORM-STAMPED-OAUTH-IMPLEMENTATION-01
IMPLEMENTATION_AUTHORIZED = NO
DEPLOYMENT_AUTHORIZED = NO
KINTONE_READ_AUTHORIZED = NO
KINTONE_WRITE_AUTHORIZED = NO
PROCESS_WRITE_AUTHORIZED = NO
UAT_AUTHORIZED = NO
FULL_D3_BUSINESS_UAT = NOT_PROVEN
D3_CLOSURE = NOT_CLAIMED
PRODUCTION_READY = NO
NEXT_GATE_AUTHORIZED = NO
AUTO_START_NEXT_WORK_PACKAGE = NO
INDEPENDENT_CONTROL_PLANE_REVIEW = REQUIRED
```
