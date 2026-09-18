# D3 Platform-Stamped OAuth Trusted Writer Live Provisioning Readiness

**Document ID**: `D3-ARCHIVE-RUNTIME-TRUSTED-WRITER-PLATFORM-STAMPED-OAUTH-LIVE-PROVISIONING-READINESS-01`
**Package ID**: `D3-ARCHIVE-RUNTIME-TRUSTED-WRITER-PLATFORM-STAMPED-OAUTH-LIVE-PROVISIONING-READINESS-01`
**Authorization ID**: `MBO2026-D3-ARCHIVE-RUNTIME-TRUSTED-WRITER-PLATFORM-STAMPED-OAUTH-LIVE-PROVISIONING-READINESS-01-20260918-OWNER-01`
**Mode**: DOCS + LOCAL/REPOSITORY READINESS ONLY / ZERO LIVE KINTONE I/O / ZERO REAL OAUTH / ZERO OAUTH CLIENT REGISTRATION / ZERO DEPLOYMENT / ZERO UAT
**Canonical Branch**: `ai/antigravity-wp002c`
**Authorized Base Head**: `f76edbaa99ea3d93f4440e181c4ab66768abb0ee`
**Authorized Base Tree**: `eb52214db1db8c22ff0c0dfba8ffb747ce395bc3`
**Status**: READINESS CONTRACT SPECIFIED / AWAITING OWNER DECISIONS

---

## 1. Purpose & Authority

This document establishes the exact provisioning and readiness contract required to move the accepted local D3 trusted-writer implementation (`D3-ARCHIVE-RUNTIME-TRUSTED-WRITER-PLATFORM-STAMPED-OAUTH-IMPLEMENTATION-01-R3`) toward a future Owner-authorized live provisioning gate.

**CRITICAL GOVERNANCE BOUNDARIES**:
- **THIS PACKAGE DOES NOT CREATE OR CHANGE ANY LIVE INFRASTRUCTURE.**
- **ZERO LIVE KINTONE READS / ZERO LIVE KINTONE WRITES.**
- **ZERO REAL OAUTH AUTHORIZATIONS / ZERO REAL TOKEN EXCHANGES.**
- **ZERO OAUTH CLIENT REGISTRATIONS / ZERO DEPLOYMENTS / ZERO UAT ACTIONS.**
- **NO SOURCE CODE MUTATIONS / NO TEST SUITE MUTATIONS.**
- **OWNER DECISIONS MUST BE RATIFIED PRIOR TO ANY LIVE EXECUTION.**

### Implementation State Authority
Under Git evidence and repository verification:
- `IMPLEMENTATION_01_R3`: **PASS / ACCEPTED / CLOSED** (Commit `f76edbaa99ea3d93f4440e181c4ab66768abb0ee`)
- `LOCAL_IMPLEMENTATION_GATE`: **ACCEPTED**
- `FULL_D3_BUSINESS_UAT`: **NOT_PROVEN**
- `D3_CLOSURE`: **NOT_CLAIMED**
- `PRODUCTION_READY`: **NO**

---

## 2. Locked Architectural Tenets

All live provisioning specifications in this document adhere immutably to:
1. `OWNER_RATIFIED_ARCHITECTURE = NATIVE_KINTONE_PLATFORM_STAMPED_OAUTH_ATTESTATION`
2. `ATTESTATION_AND_TRANSITION_USER_AUTHORITY = SAME_BACKEND_HELD_USER_OAUTH_AUTHORITY`
3. `ACTOR_IDENTITY_PROVENANCE = KINTONE_PLATFORM_STAMPED_CREATOR_ONLY` (`CREATOR.value.code`)
4. `OAUTH_CLIENT_TYPE = CONFIDENTIAL_CLIENT`
5. `OAUTH_GRANT_TYPE = AUTHORIZATION_CODE`
6. `PKCE_SUPPORT = PROVEN_UNSUPPORTED` (Standard Cybozu OAuth requires confidential credentials without PKCE)
7. `BROWSER_APP798_CREDENTIAL = FORBIDDEN`
8. `BROWSER_PRIVILEGED_SECRET = FORBIDDEN`
9. `TOKEN_STORE_PRODUCTION_IN_MEMORY_ONLY = FORBIDDEN`
10. `APP798_TRUSTED_WRITER_READ = YES`
11. `APP798_TRUSTED_WRITER_ADD = YES`
12. `APP798_TRUSTED_WRITER_EDIT = NO`
13. `APP798_TRUSTED_WRITER_DELETE = NO`

---

## 3. Readiness Output 1: Dedicated Attestation App Schema

The dedicated Attestation App serves as the single-use platform attestation ledger. It records user-submitted attestations stamped by Kintone with the user's platform identity (`CREATOR`), read back by the trusted backend, and consumed once.

### Required Logical & Physical Fields

| Field Code | Proposed Kintone Field Type | Required | Uniqueness Requirement | Max Length / Validation | Caller Write Authority (OAuth User) | Read Authority | Implementation Contract Rationale |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `Transaction_Nonce` | `SINGLE_LINE_TEXT` | YES | Unique (Enforce in Kintone field settings) | 64 hex characters (256-bit entropy) | ADD ONLY (via OAuth) | Privileged Reader / Trusted Backend | Single-use nonce binding; indexed lookup and replay rejection. |
| `App794_Record_ID` | `NUMBER` or `SINGLE_LINE_TEXT` (See Note 1) | YES | Non-unique (One record has multiple historical stage transitions) | Positive integer string / digits | ADD ONLY (via OAuth) | Privileged Reader / Trusted Backend | Binds attestation to specific evaluation target record. |
| `Archive_Key` | `SINGLE_LINE_TEXT` | YES | Non-unique (Attestation attempts may abort/retry) | Max 255 chars, pipe-delimited format | ADD ONLY (via OAuth) | Privileged Reader / Trusted Backend | Exact match with App 798 archive evidence key. |
| `Expected_From_Status` | `SINGLE_LINE_TEXT` | YES | Non-unique | Max 64 chars (e.g., `05 Objective Approved`) | ADD ONLY (via OAuth) | Privileged Reader / Trusted Backend | Prevents state drift; must match record status before transition. |
| `Intended_Action` | `SINGLE_LINE_TEXT` | YES | Non-unique | Max 64 chars (e.g., `Start Mid-Year`) | ADD ONLY (via OAuth) | Privileged Reader / Trusted Backend | Governed stage transition action name. |
| `Expected_Target_Status` | `SINGLE_LINE_TEXT` | YES | Non-unique | Max 64 chars (e.g., `06 Employee Mid-Year`) | ADD ONLY (via OAuth) | Privileged Reader / Trusted Backend | Expected post-transition state verification. |
| `Snapshot_Hash` | `SINGLE_LINE_TEXT` | YES | Non-unique | 64 hex characters (SHA-256) | ADD ONLY (via OAuth) | Privileged Reader / Trusted Backend | Cryptographic integrity digest of pre-transition logical state. |
| `Issued_At` | `SINGLE_LINE_TEXT` or `DATETIME` (See Note 1) | YES | Non-unique | ISO-8601 with timezone (e.g. `2026-09-18T12:00:00.000Z`) | ADD ONLY (via OAuth) | Privileged Reader / Trusted Backend | Backend TTL lower boundary verification. |
| `Expires_At` | `SINGLE_LINE_TEXT` or `DATETIME` (See Note 1) | YES | Non-unique | ISO-8601 with timezone (e.g. `2026-09-18T12:01:00.000Z`) | ADD ONLY (via OAuth) | Privileged Reader / Trusted Backend | Backend TTL upper boundary verification (max 60 seconds). |
| `CREATOR` (System) | Built-in `RECORD_CREATOR` | Automatic | N/A | Cybozu User Entity | Read-Only platform stamped | Privileged Reader / Trusted Backend | **Sole authoritative provenance of actor identity (`CREATOR.value.code`).** |
| `CREATED_TIME` (System) | Built-in `CREATED_TIME` | Automatic | N/A | Cybozu Timestamp | Read-Only platform stamped | Privileged Reader / Trusted Backend | Platform timestamp verification. |

**Note 1 (Field Type Specification & Compatibility)**:
- In the accepted local implementation (`d3-attestation-verifier.js`), all payload values are formatted as `{ value: String(...) }`.
- In Kintone REST API, `SINGLE_LINE_TEXT` accepts `{ value: String }` directly for string, number, and ISO-8601 timestamps without formatting friction.
- For `App794_Record_ID`, `Issued_At`, and `Expires_At`, `SINGLE_LINE_TEXT` is proven compatible with zero format conversion risks. If Kintone native `NUMBER` or `DATETIME` field types are preferred for UI filtering, formatting must conform to Kintone API restrictions (UTC ISO strings for DATETIME).
- **LOCKED RULE**: No extra business fields allowed. No manual `actor` or `userCode` field allowed.

---

## 4. Readiness Output 2: Attestation App ACL Principles

Access control to the dedicated Attestation App must enforce strict fail-closed boundary isolation:

### Role / Identity Permissions

1. **Workflow / OAuth User (Authenticated Employee)**:
   - **ADD RECORD**: `YES` (Allowed solely to create attestation records stamped with their own OAuth identity).
   - **VIEW RECORDS**: `NO` (Workflow users have zero read permission across the app; records cannot be viewed via Kintone portal or API by standard users).
   - **EDIT RECORDS**: `NO` (Attestation records are immutable).
   - **DELETE RECORDS**: `NO` (Attestation records must never be purged or deleted by users).
   - **MANAGE APP**: `NO`.
   - **CREATOR Override**: **STRICTLY FORBIDDEN** (Platform stamps `CREATOR` automatically; API cannot override creator under user OAuth).

2. **Privileged Attestation Reader (Dedicated Service Principal / API Token)**:
   - **VIEW RECORDS**: `YES` (Granted read access to all records to inspect attestation payload, `CREATOR`, and system fields).
   - **ADD RECORD**: `NO` (Privileged reader must never create attestations on behalf of users).
   - **EDIT RECORDS**: `NO` (Privileged reader cannot alter attestations).
   - **DELETE RECORDS**: `NO`.
   - **MANAGE APP**: `NO` (Runtime credential must be separated from administrative provisioning credential).

3. **Everyone / Public Group**:
   - **VIEW RECORDS**: `NO`.
   - **ADD RECORD**: `NO`.
   - **EDIT RECORDS**: `NO`.
   - **DELETE RECORDS**: `NO`.

*If Kintone ACL configuration requires minimal viewing rights for a user to complete record creation under OAuth, an explicit technical justification and Owner review are required before broadening permissions.*

---

## 5. Readiness Output 3: Cybozu Confidential OAuth Client Contract

Registration contract for Cybozu OAuth Client:

### Contract Specifications
- **CLIENT_TYPE**: `CONFIDENTIAL_CLIENT`
- **GRANT_TYPE**: `AUTHORIZATION_CODE`
- **PKCE**: `NOT USED` (Explicitly verified unsupported by Cybozu OAuth)
- **SCOPES**:
  - `k:app_record:read`
  - `k:app_record:write`
  - *No other scopes permitted.*
- **LOGICAL REDIRECT ROUTE**: `/api/mbo/d3/oauth/callback`
- **PUBLIC REDIRECT URL PATTERN**: `https://<OAUTH_REDIRECT_HOST>/api/mbo/d3/oauth/callback`
- **REGISTRATION OWNER**: Dedicated Administrative Cybozu Account (See Owner Decision `OD-D3-003`).
- **SECRET CUSTODY**: Backend environment secret vault only; zero git/client/browser exposure.
- **ALLOWED ENVIRONMENTS**: Production gateway instance only (and explicitly authorized staging instance if provisioned).
- **ROTATION / REVOCATION**: Re-generation of `client_secret` in Cybozu System Administration; immediate revocation of compromised clients.
- **STATE & SESSION BINDING**: Gateway generates cryptographic `state` parameter bound to the caller's authenticated session with 10-minute TTL; validated on callback.

*Hostname Lock*:
`OAUTH_REDIRECT_HOST = OWNER_DECISION_REQUIRED` (See Owner Decision `OD-D3-001`). No public hostname may be invented by the execution agent.

---

## 6. Readiness Output 4: Trusted Backend Hosting Architecture

The backend gateway hosts `src/server/mbo-gateway-server.js` using `node:http`.

### Production Hosting Requirements
1. **Endpoint & TLS**:
   - Must terminate TLS (HTTPS) via a trusted certificate authority (no self-signed certificates in production).
   - TLS termination may be handled by reverse proxy (NGINX, Caddy, Cloudflare, ALB) or native Node TLS.
2. **Process Lifecycle**:
   - Managed by a reliable supervisor (systemd, PM2, Docker container runtime, Kubernetes) ensuring automatic restarts on failure.
3. **Network Reachability**:
   - Outbound: Stable HTTPS reachability to `https://<subdomain>.kintone.com` / `https://<subdomain>.cybozu.com`.
   - Inbound: Accessible by authorized client browsers over HTTPS.
4. **Cookie & Origin Security**:
   - `MBO_COOKIE_SECURE=true` (Strict HTTPS-only cookies).
   - `MBO_COOKIE_SAMESITE=Lax` or `Strict` (Or `None` if cross-site embedding requires, which strictly mandates `Secure=true`).
   - `MBO_ALLOWED_ORIGIN`: Must strictly match the canonical frontend origin.
5. **Operational Logging Restrictions**:
   - Zero logging of Authorization headers, OAuth tokens (`access_token`, `refresh_token`), cookie values, or raw secret parameters.

*Hosting Target Lock*:
`TRUSTED_BACKEND_HOSTING_TARGET = OWNER_DECISION_REQUIRED` (See Owner Decision `OD-D3-001`).

---

## 7. Readiness Output 5: Production Secure Token Store Architecture

The local implementation provides `D3TokenStore` (interface) and `InMemoryTokenStore` (test-only).

### Production Custody Requirements
1. **Zero Production In-Memory**: `InMemoryTokenStore` must throw `PRODUCTION_IN_MEMORY_FORBIDDEN` in production.
2. **Encryption at Rest**: All persisted OAuth tokens (`accessToken`, `refreshToken`) must be encrypted using AES-256-GCM (or authenticated equivalent) using `KINTONE_TOKEN_ENCRYPTION_KEY`.
3. **Session-Keyed Storage**: Grants are keyed solely by server-derived session bindings (`SHA-256(sessionToken)`), never by unhashed credentials or raw tokens.
4. **Atomic Operations**: `storeGrant`, `loadGrant`, `rotateGrant`, `invalidateGrant` must execute atomically.
5. **Zero Token Exposure**: Tokens are never logged, serialized into error messages, returned to the browser, or committed to Git.
6. **Fail-Closed Availability**: If the token store is unreachable or decryptions fail, requests must fail closed with `503 SERVICE_UNAVAILABLE` or `401 UNAUTHORIZED`.
7. **Lifecycle & Expiration**: Token records must respect OAuth `expires_in` semantics and session invalidation on user logout.

*Storage Provider Lock*:
`PRODUCTION_TOKEN_STORE_PROVIDER = OWNER_DECISION_REQUIRED` (See Owner Decision `OD-D3-002`).

---

## 8. Readiness Output 6: App 798 (Revision Archive) Trusted Writer Credential

App 798 is an append-only historical audit ledger.

### Runtime Credential Contract
- **Target App**: `798` (App ID fixed by governance).
- **Required Privileges**:
  - `READ / VIEW RECORDS`: **YES** (Required for pre-write duplicate check via `findByArchiveKey`).
  - `ADD RECORD`: **YES** (Required to write immutable archive evidence).
  - `EDIT RECORDS`: **STRICTLY FORBIDDEN (NO)**.
  - `DELETE RECORDS`: **STRICTLY FORBIDDEN (NO)**.
- **Kintone App Permissions**:
  - Everyone group: Add = NO, View = NO, Edit = NO, Delete = NO.
  - App 798 Trusted Writer Service Identity: Add = YES, View = YES, Edit = NO, Delete = NO.
- **Custody Boundary**: Backend environment only (`KINTONE_APP798_TRUSTED_WRITER_CREDENTIAL`); zero browser exposure.
- **Idempotency**: Strict pre-check on `Archive_Key` ensures zero duplicate snapshots.

---

## 9. Readiness Output 7: Privileged Attestation Reader Credential

The Attestation Reader reads and verifies user-created attestations in the Attestation App.

### Credential Boundary & Constraints
- **Target App**: Dedicated Attestation App (e.g. App ID 799 or provisioned equivalent).
- **Required Privileges**:
  - `VIEW RECORDS`: **YES** (Read attestation fields, `CREATOR`, and `CREATED_TIME`).
  - `ADD RECORD`: **NO** (Must NEVER create attestations; creation is reserved exclusively for the user's OAuth authority).
  - `EDIT RECORDS`: **NO**.
  - `DELETE RECORDS`: **NO**.
- **Separation of Concerns**:
  - Distinct and decoupled from user OAuth credentials.
  - Distinct and decoupled from App 798 Trusted Writer credentials.
  - Strictly forbidden from being used to bypass workflow transitions or fake actor identities.

---

## 10. Readiness Output 8: Secret & Configuration Matrix

| Variable Name | Classification | Source / Custody Owner | Browser Exposure Allowed | Log Exposure Allowed | Rotation Required | Provisioning Prerequisite | Runtime Validation Requirement |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `KINTONE_BASE_URL` | Non-Secret Configuration | System Admin / Owner | NO | YES | NO | Cybozu subdomain allocated | Must be valid HTTPS URL |
| `KINTONE_OAUTH_CLIENT_ID` | Non-Secret Identifier | Cybozu OAuth Admin | NO | YES | Optional | OAuth client registered in Cybozu | Non-empty string |
| `KINTONE_OAUTH_CLIENT_SECRET` | Highly Sensitive Secret | Cybozu OAuth Admin | **FORBIDDEN (NO)** | **FORBIDDEN (NO)** | YES (On schedule/leak) | OAuth client registered in Cybozu | Non-empty string; rejected if logged |
| `KINTONE_OAUTH_REDIRECT_URI` | Configuration URI | System Admin / Owner | NO | YES | On domain change | DNS / HTTPS host configured | Must match registered Cybozu callback |
| `KINTONE_ATTESTATION_APP_ID` | Configuration ID | Kintone Admin | NO | YES | NO | Attestation App created | Positive safe integer |
| `KINTONE_ATTESTATION_READER_CREDENTIAL`| Highly Sensitive Secret | Kintone Admin | **FORBIDDEN (NO)** | **FORBIDDEN (NO)** | YES (Periodic) | Attestation App API token generated | Non-empty string; minimum ACL enforced |
| `KINTONE_APP798_TRUSTED_WRITER_CREDENTIAL` | Highly Sensitive Secret | Kintone Admin | **FORBIDDEN (NO)** | **FORBIDDEN (NO)** | YES (Periodic) | App 798 API token generated | Non-empty string; Add+View only |
| `KINTONE_TOKEN_ENCRYPTION_KEY` | Highly Sensitive Secret | Security Admin / Owner | **FORBIDDEN (NO)** | **FORBIDDEN (NO)** | YES (Key versioning) | Secret vault generated | 256-bit cryptographic key (hex/base64) |
| `KINTONE_APP794_ID` | Configuration ID | Kintone Admin | NO | YES | NO | Evaluation App 794 active | Safe integer (defaults to 794) |
| `KINTONE_APP798_ID` | Configuration ID | Kintone Admin | NO | YES | NO | Archive App 798 active | Safe integer (locked to 798) |
| `MBO_ALLOWED_ORIGIN` | Configuration Origin | Frontend Host Admin | NO | YES | On domain change | Frontend origin defined | Valid HTTPS origin matching caller |
| `MBO_COOKIE_SECURE` | Configuration Flag | Backend Config | NO | YES | NO | HTTPS enabled | Must be `'true'` in production |
| `MBO_COOKIE_SAMESITE` | Configuration Flag | Backend Config | NO | YES | NO | Browser policy defined | `'Lax'`, `'Strict'`, or `'None'` |

---

## 11. Readiness Output 9: Ordered Future Provisioning Sequence

*Note: Execution is strictly deferred until explicit Owner authorization and decision ratification.*

```
[Phase 1: Owner Decisions]
       │
       ▼
1. Ratify Owner Decisions (OD-D3-001 through OD-D3-007)
       │
       ▼
[Phase 2: Infrastructure & Custody]
       │
       ▼
2. Provision Trusted Backend Hosting & Secure HTTPS Endpoints
3. Deploy Production Secure Token Store & Configure Token Encryption Key
       │
       ▼
[Phase 3: Kintone Space & Apps Setup]
       │
       ▼
4. Create Dedicated Attestation App with 9 Governed Event-Binding Fields
5. Configure Strict Attestation App ACL (OAuth User Add-Only, Everyone Denied)
6. Generate Privileged Attestation Reader Credential (Read-Only)
7. Generate App 798 Trusted Writer Credential (Add+View Only, Zero Edit/Delete)
       │
       ▼
[Phase 4: OAuth Client Registration]
       │
       ▼
8. Register Cybozu Confidential OAuth Client with Scopes (k:app_record:read, k:app_record:write)
9. Configure Exact Redirect URI (https://<OAUTH_REDIRECT_HOST>/api/mbo/d3/oauth/callback)
       │
       ▼
[Phase 5: Runtime Deployment & Verification]
       │
       ▼
10. Securely Inject Environment Variables to Backend Runtime
11. Start Gateway Service (Verify InMemoryTokenStore rejection in production)
12. Execute Read-Only Preflight & Health Check (/health, config validation)
13. Conduct Bounded Sandbox OAuth Integration Test
14. Execute Single-Transaction Bounded UAT
15. Stop for Independent Control Plane Review
```

---

## 12. Readiness Output 10: Verification & Readback Plan

For every future mutable provisioning step, the following automated or manual readbacks are strictly mandated:

1. **Attestation App Verification**:
   - Query Kintone App Form API: Verify existence and field codes of all 9 fields.
   - Query Kintone App Permissions API: Verify Everyone has NO access; OAuth users have Add-only; Privileged Reader has View-only.
2. **OAuth Registration Verification**:
   - Inspect Cybozu OAuth settings: Verify Client Type is Confidential, Grant is Authorization Code, scopes are strictly limited to `k:app_record:read` and `k:app_record:write`.
   - Verify redirect URI string equality without trailing slashes.
   - **Zero Secret Evidence**: Verify that no client secrets or auth codes are committed to Git.
3. **App 798 Permissions Verification**:
   - Verify App 798 API token permissions: Read/View = YES, Add = YES, Edit = NO, Delete = NO.
4. **Backend Gateway Verification**:
   - Health endpoint responds `200 OK`.
   - Production mode rejection: verify gateway refuses to boot if `NODE_ENV=production` and `InMemoryTokenStore` is used.
   - Secure cookie enforcement: verify `Secure` and `SameSite` flags are present in Set-Cookie headers.

---

## 13. Readiness Output 11: Fail-Closed STOP Conditions

Future live provisioning and testing must halt immediately (`FAIL-CLOSED`) upon encountering any of the following:

1. `HEAD_DRIFT`: Canonical branch HEAD diverges from expected commit SHA.
2. `UNRESOLVED_OWNER_DECISION`: Attempt to provision without prior ratified decisions.
3. `ATTESTATION_SCHEMA_MISMATCH`: Field codes or types in Kintone Attestation App differ from specification.
4. `ATTESTATION_ACL_OVERPERMISSION`: Attestation App grants View, Edit, or Delete to regular users, or Add to the privileged reader.
5. `OAUTH_REDIRECT_MISMATCH`: Runtime redirect URI does not exactly match Cybozu client registration.
6. `OAUTH_SCOPE_MISMATCH`: Scopes include unauthorized permissions beyond `k:app_record:read` and `k:app_record:write`.
7. `TOKEN_STORE_NOT_PRODUCTION_SAFE`: `InMemoryTokenStore` detected in production environment.
8. `TOKEN_STORE_UNAVAILABLE`: Backend storage engine unreachable or encryption key missing.
9. `PRIVILEGED_READER_OVERPERMISSION`: Attestation Reader has write or edit rights.
10. `APP798_WRITER_OVERPERMISSION`: App 798 credential has edit or delete permissions.
11. `SECRET_EXPOSURE`: Sensitive tokens or secrets appear in response bodies, logs, or Git commits.
12. `TLS_ORIGIN_COOKIE_MISMATCH`: Plaintext HTTP detected, origin mismatch, or insecure cookies.
13. `RUNTIME_CONFIG_INCOMPLETE`: Any required environment variable is missing or empty.
14. `UNEXPECTED_KINTONE_REVISION`: Record revision mismatch during transition execution.
15. `UNAUTHORIZED_NETWORK_OR_WRITE_ACTION`: Attempted write outside designated boundary.

---

## 14. Owner Decision Register

The following unresolved decisions must be formally ratified by the Owner before initiating live provisioning:

### `OD-D3-001-BACKEND-HOST`
- **Question**: What is the canonical public HTTPS hostname for the production trusted backend gateway?
- **Why Required**: Required to lock `KINTONE_OAUTH_REDIRECT_URI` (`https://<host>/api/mbo/d3/oauth/callback`) and Cybozu client registration.
- **Safe Options / Constraints**:
  - Option A: Subdomain of existing enterprise infrastructure (e.g., `mbo-api.orbis.co.th`).
  - Option B: Dedicated cloud container / API gateway hostname.
  - Constraint: Must support valid HTTPS / TLS termination and CORS matching `MBO_ALLOWED_ORIGIN`.
- **Default**: `NONE` (Owner decision required).

### `OD-D3-002-TOKEN-STORE-PROVIDER`
- **Question**: What persistence engine will implement the production `D3TokenStore`?
- **Why Required**: Local `InMemoryTokenStore` is strictly forbidden in production.
- **Safe Options / Constraints**:
  - Option A: Encrypted Redis instance (session TTL matching).
  - Option B: Encrypted relational database (PostgreSQL / MySQL) table with envelope encryption.
  - Option C: Encrypted filesystem key-value store with OS-managed permissions.
  - Option D: Cloud Secret / Key-Value service (AWS Secrets Manager, GCP Secret Manager, Azure Key Vault).
  - Constraint: Must support atomic get/set/delete, encryption at rest, zero plaintext logging.
- **Default**: `NONE` (Owner decision required).

### `OD-D3-003-OAUTH-REGISTRATION-OPERATOR`
- **Question**: Which Cybozu administrative account is designated to register and manage the Confidential OAuth Client?
- **Why Required**: Client registration requires Cybozu System Administration privileges and long-term credential accountability.
- **Safe Options / Constraints**:
  - Option A: Primary Enterprise Cybozu System Administrator.
  - Option B: Dedicated MBO Technical Service Administrator.
  - Constraint: Account must have 2FA and adhere to enterprise password policy.
- **Default**: `NONE` (Owner decision required).

### `OD-D3-004-ATTESTATION-READER-IDENTITY`
- **Question**: What credential mechanism will be provisioned for the Privileged Attestation Reader?
- **Why Required**: Backend requires independent readback authority to verify user-stamped attestations.
- **Safe Options / Constraints**:
  - Option A: Dedicated Kintone App API Token (View-only permissions on Attestation App).
  - Option B: Dedicated Service Account (Basic/Password Auth with View-only role).
  - Constraint: Must be strictly read-only and restricted exclusively to the Attestation App.
- **Default**: `NONE` (Owner decision required).

### `OD-D3-005-APP798-WRITER-IDENTITY`
- **Question**: What credential mechanism will be provisioned for the App 798 Trusted Writer?
- **Why Required**: Backend requires isolated trusted-writer authority to persist evidence records.
- **Safe Options / Constraints**:
  - Option A: Dedicated App 798 API Token (View + Add permissions only).
  - Option B: Dedicated Service Account with custom permission profile.
  - Constraint: Must never possess Edit or Delete permissions.
- **Default**: `NONE` (Owner decision required).

### `OD-D3-006-SECRET-CUSTODY-MECHANISM`
- **Question**: What secret management mechanism will store backend credentials in production?
- **Why Required**: Secrets (`KINTONE_OAUTH_CLIENT_SECRET`, `KINTONE_TOKEN_ENCRYPTION_KEY`, API tokens) must never reside in files committed to source control.
- **Safe Options / Constraints**:
  - Option A: Enterprise Cloud Secrets Manager (AWS/Azure/GCP).
  - Option B: Local encrypted environment injection via systemd / container secrets.
  - Option C: HashiCorp Vault / Doppler.
- **Default**: `NONE` (Owner decision required).

### `OD-D3-007-TOKEN-STORE-PERSISTENCE-POLICY`
- **Question**: What is the recovery policy for OAuth token grants across backend server restarts?
- **Why Required**: Determines whether user OAuth sessions survive process restarts or require transparent re-authorization.
- **Safe Options / Constraints**:
  - Option A: Ephemeral server-session cache (Process restart invalidates token store; users seamlessly re-authenticate when executing transition).
  - Option B: Durable encrypted storage (Tokens survive process restarts until explicit logout or token expiration).
- **Default**: `NONE` (Owner decision required).

---

## 15. Readiness Conclusion & Summary

- `READINESS_STATUS`: **PASS_WITH_OWNER_DECISIONS_REQUIRED**
- `OWNER_DECISIONS_REQUIRED_COUNT`: **7**
- `OWNER_DECISION_IDS`:
  1. `OD-D3-001-BACKEND-HOST`
  2. `OD-D3-002-TOKEN-STORE-PROVIDER`
  3. `OD-D3-003-OAUTH-REGISTRATION-OPERATOR`
  4. `OD-D3-004-ATTESTATION-READER-IDENTITY`
  5. `OD-D3-005-APP798-WRITER-IDENTITY`
  6. `OD-D3-006-SECRET-CUSTODY-MECHANISM`
  7. `OD-D3-007-TOKEN-STORE-PERSISTENCE-POLICY`
- `ZERO_LIVE_IO_VERIFIED`: **YES**
