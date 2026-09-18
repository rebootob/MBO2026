# D3 Platform-Stamped OAuth Trusted Writer Live Provisioning Owner Decision Packet

**Document ID**: `D3_PLATFORM_STAMPED_OAUTH_TRUSTED_WRITER_LIVE_PROVISIONING_OWNER_DECISION_PACKET_01`
**Package ID**: `D3-ARCHIVE-RUNTIME-TRUSTED-WRITER-LIVE-PROVISIONING-OWNER-DECISION-PACKET-01-R1`
**Canonical Branch**: `ai/antigravity-wp002c`
**Base HEAD**: `829cf3b694656d539a4889d7a182c9bff9cad21f`
**Base Parent**: `ca47149f063a758eef97117804636c9ab5f00d43`
**Base Tree**: `1d22ab53f40e78d17d2cec368004668145e1c6ab`
**Authorization ID**: `MBO2026-D3-ARCHIVE-RUNTIME-TRUSTED-WRITER-LIVE-PROVISIONING-OWNER-DECISION-PACKET-01-R1-20260918-OWNER-01`
**Document Status**: `OWNER_DECISION_PACKET_READY / PENDING_OWNER_RATIFICATION`
**Role**: Single consolidated decision packet for Project Owner review and ratification of the seven unresolved live-provisioning decisions (`OD-D3-001` through `OD-D3-007`).

---

## 1. Package Provenance and Authorization

- **Governing Protocol**: Strict Orbis Governance (3-tier: Owner -> ChatGPT Control Plane -> Antigravity Execution Plane).
- **Owner Authorization**: This packet is prepared under explicit Owner Authorization ID `MBO2026-D3-ARCHIVE-RUNTIME-TRUSTED-WRITER-LIVE-PROVISIONING-OWNER-DECISION-PACKET-01-R1-20260918-OWNER-01`.
- **Purpose**: Prepare ONE comprehensive, self-contained, unbiased decision packet covering all seven unresolved technical and operational decisions required before live provisioning may be considered.
- **Authority Boundary**:
  - This package authorizes **decision preparation and documentation only**.
  - It does **not** select any options for the Owner (`OWNER_VALUES_SELECTED = 0`).
  - It does **not** ratify `OD-D3-001` through `OD-D3-007`.
  - It does **not** authorize live provisioning, Kintone I/O, OAuth client registration, real OAuth flow execution, Attestation App creation, schema/ACL changes, deployment, UAT, or next work packages.
  - Commit `2371e377bf5a34b02ee2f2a2f3677d2e7a30492c` remains `UNAUTHORIZED_AUTO_START_OUTPUT / NON_AUTHORITATIVE` (Git history preserved, retroactive ratification = `NO`).

---

## 2. Current Accepted Implementation Baseline & Exact Test Accounting

The software implementation for D3 platform-stamped OAuth trusted-writer architecture was verified, independently reviewed, and closed at:
- **Accepted Implementation Package**: `D3-ARCHIVE-RUNTIME-TRUSTED-WRITER-PLATFORM-STAMPED-OAUTH-IMPLEMENTATION-01-R3`
- **Accepted Implementation Commit SHA**: `f76edbaa99ea3d93f4440e181c4ab66768abb0ee`
- **Implementation Status**: `PASS / ACCEPTED / CLOSED`
- **Local Implementation Gate**: `ACCEPTED`
- **Targeted Test Results**:
  - `TARGETED_TEST_TOTAL`: 114
  - `TARGETED_TEST_PASS`: 114
  - `TARGETED_TEST_FAIL`: 0
- **Full Suite Accounting**:
  - `FULL_SUITE_TOTAL`: 1881
  - `FULL_SUITE_PASS`: 1827
  - `FULL_SUITE_FAIL`: 44
  - `FULL_SUITE_SKIPPED`: 10
  - `BASELINE_FAILURE_SET_EQUALS_R3`: `YES`
  - `FULL_SUITE_NEW_REGRESSION`: `NO`
- **Authoritative Test Evidence Statement**:
  - R3 targeted D3 suite passed 114/114.
  - Full npm suite retained the exact same 44 pre-existing baseline failure identities and introduced no new regression.
  - Pre-existing 44 baseline failures are accounted for and NOT reinterpreted as PASS.
- **Business UAT Status**: `NOT_PROVEN` (Full live business UAT has not been executed; production readiness is `NO`; D3 closure is `NOT_CLAIMED`).

---

## 3. Already-Locked Architecture — NOT OPEN FOR REDECISION

The following architectural invariants were ratified in Owner Decisions 008 (`D3_DECISION_008_ROUTE_SNAPSHOT_PERSISTENCE_SYNC`) and 009 (`D3_DECISION_009_PLATFORM_STAMPED_OAUTH_ATTESTATION_ARCHITECTURE_RATIFICATION`). They are **LOCKED_EXISTING_AUTHORITY** and **NOT OPEN FOR REDECISION** in this packet:

1. **Architecture Core**: `NATIVE_KINTONE_PLATFORM_STAMPED_OAUTH_ATTESTATION` is the sole authorized architecture.
2. **Attestation & Transition User Authority**: Must use the same backend-held user OAuth token authority (`SAME_BACKEND_HELD_USER_OAUTH_AUTHORITY`).
3. **Actor Identity Provenance**:
   - `ACTOR_IDENTITY_PROVENANCE = KINTONE_PLATFORM_STAMPED_CREATOR_ONLY`
   - `AUTHORITATIVE_ACTOR_SOURCE = CREATOR.value.code`
   - CREATOR is NOT one of the request/event binding fields submitted by the browser. Actor identity becomes authoritative ONLY AFTER privileged Attestation App readback by the backend.
4. **Attestation Event Binding Contract**:
   - `ATTESTATION_EVENT_BINDING_FIELDS`:
     - `Transaction_Nonce`
     - `App794_Record_ID`
     - `Archive_Key`
     - `Expected_From_Status`
     - `Intended_Action`
     - `Expected_Target_Status`
     - `Snapshot_Hash`
     - `Issued_At`
     - `Expires_At`
   - All 9 fields must match exactly between event request parameters and verified attestation record fields.
5. **App 794 Read Authority Separation**:
   - `APP794_AUTHORITATIVE_RECORD_SOURCE = BACKEND_FETCHED_KINTONE_APP794_RECORD`
   - `APP794_AUTHORITATIVE_READ_AUTHORITY = SAME_BACKEND_HELD_USER_OAUTH_AUTHORITY`
   - The backend fetches App 794 record state using the same backend-held user's OAuth authority involved in the transaction.
   - `PRIVILEGED_ATTESTATION_READER = ATTESTATION_APP_READBACK_ONLY`
   - The privileged Attestation Reader reads the Attestation App to verify platform-stamped CREATOR and event binding. It is NOT the App 794 authoritative reader. These authorities are distinct and must not be merged or swapped.
6. **Browser Authority**: Browser client has zero archive-fact authority and zero privileged secrets (`BROWSER_PRIVILEGED_SECRET = FORBIDDEN`).
7. **Token Handling**: Browser never sees, selects, or passes backend-held OAuth access/refresh tokens (`BROWSER_SELECTS_SERVER_TOKEN = FORBIDDEN`).
8. **Attestation Nonce**: Server-generated, cryptographically random, single-use, session-bound, and strictly time-limited (`ATTESTATION_NONCE_SERVER_GENERATED = YES`, `ATTESTATION_NONCE_SINGLE_USE = YES`).
9. **App 798 Archival Ordering**: App 798 archive record must be successfully persisted *before* executing the App 794 process transition (`APP798_ARCHIVE_BEFORE_TRANSITION = REQUIRED`).
10. **Snapshot Reuse**: App 794 route snapshot reuse before verified archive success is forbidden (`APP794_ROUTE_SNAPSHOT_REUSE_BEFORE_ARCHIVE_SUCCESS = FORBIDDEN`).
11. **Double Transition Prevention**: Double process transition attempts fail closed immediately (`DOUBLE_PROCESS_TRANSITION = FORBIDDEN`).
12. **App 798 Permissions**: Group `everyone` has View=NO, Add=NO, Edit=NO, Delete=NO (`APP798_GROUP_EVERYONE_VIEW = NO`, `APP798_GROUP_EVERYONE_ADD = NO`). Trusted Writer has View=YES, Add=YES, Edit=NO, Delete=NO (`APP798_TRUSTED_WRITER_READ = YES`, `APP798_TRUSTED_WRITER_ADD = YES`, `APP798_TRUSTED_WRITER_EDIT = NO`, `APP798_TRUSTED_WRITER_DELETE = NO`).
13. **Fail-Closed Principle**: Any missing binding, mismatched actor, invalid nonce, store error, or API failure results in instant termination and audit logging (`FAIL_CLOSED`, `ARCHIVE_ACTOR_NOT_RESOLVED = FAIL_CLOSED`).

---

## 4. Seven Unresolved Owner Decisions

The following seven operational and technical decisions remain unresolved. No live provisioning work may commence until the Owner formally ratifies an option for each.

| Decision ID | Topic | Current Status | Default | Owner Selection |
|---|---|---|---|---|
| `OD-D3-001-BACKEND-HOST` | Canonical Production Backend Hostname & TLS | `UNRESOLVED / OWNER_DECISION_REQUIRED` | `NONE` | `REQUIRED` |
| `OD-D3-002-TOKEN-STORE-PROVIDER` | Production `D3TokenStore` Persistence Engine | `UNRESOLVED / OWNER_DECISION_REQUIRED` | `NONE` | `REQUIRED` |
| `OD-D3-003-OAUTH-REGISTRATION-OPERATOR` | Cybozu Confidential OAuth Client Admin Operator | `UNRESOLVED / OWNER_DECISION_REQUIRED` | `NONE` | `REQUIRED` |
| `OD-D3-004-ATTESTATION-READER-IDENTITY` | Attestation App Privileged Reader Credential | `UNRESOLVED / OWNER_DECISION_REQUIRED` | `NONE` | `REQUIRED` |
| `OD-D3-005-APP798-WRITER-IDENTITY` | App 798 Trusted Writer Credential | `UNRESOLVED / OWNER_DECISION_REQUIRED` | `NONE` | `REQUIRED` |
| `OD-D3-006-SECRET-CUSTODY-MECHANISM` | Backend Production Secret Custody / Vault | `UNRESOLVED / OWNER_DECISION_REQUIRED` | `NONE` | `REQUIRED` |
| `OD-D3-007-TOKEN-STORE-PERSISTENCE-POLICY` | User OAuth Grant Restart & Retention Policy | `UNRESOLVED / OWNER_DECISION_REQUIRED` | `NONE` | `REQUIRED` |

- **DECISION_COUNT**: `7`
- **OWNER_VALUES_SELECTED**: `0`
- **NO_VALUES_INVENTED**: `YES`
- **OWNER_SELECTION_BIAS**: `NONE`

---

## 5. Neutral Candidate Analysis per Decision

### `OD-D3-001-BACKEND-HOST`: Canonical Production Backend Hostname & TLS

- **Exact Decision Needed**: Specify the canonical fully-qualified HTTPS hostname, reverse proxy / ingress routing, and TLS termination target for the MBO Gateway backend server in production.
- **Why Required**: Kintone Confidential OAuth Client registration requires a precise, non-wildcard redirect URI (`https://<OWNER_SELECTED_FQDN>/api/mbo/d3/oauth/callback`). In addition, browser client CORS origin whitelisting (`MBO_ALLOWED_ORIGIN`) depends directly on the public domain topology.
- **Prerequisites**: Domain ownership, DNS management authority, and valid SSL/TLS certificate issuance.
- **Candidate Options (Factual Topology Patterns)**:
  - **Option 1: Corporate Subdomain on Existing Enterprise Ingress**
    - *Topology*: `https://<OWNER_SELECTED_FQDN>` routing through corporate ingress / reverse proxy terminating TLS 1.3 to Node.js backend service.
    - *Security Characteristics*: Protected by existing enterprise WAF and TLS termination infrastructure.
    - *Operational Complexity*: Requires coordinated DNS and ingress route configuration.
    - *Prerequisites*: Access to corporate DNS and ingress controller.
  - **Option 2: Dedicated Cloud Container / PaaS Managed FQDN**
    - *Topology*: Direct cloud PaaS managed FQDN (`https://<OWNER_SELECTED_HOSTING_TARGET>`).
    - *Security Characteristics*: Automatic cloud certificate rotation, managed DDoS protection.
    - *Operational Complexity*: Low operational maintenance for certificate/TLS renewal; tied to cloud vendor lifecycle.
    - *Prerequisites*: Cloud subscription and container service provisioning.
  - **Option 3: Internal / VPN-Only Gateway with Private DNS**
    - *Topology*: Internal host reachable only over VPN / direct corporate network (`https://<OWNER_SELECTED_FQDN>`).
    - *Security Characteristics*: Zero public internet surface; requires all browser clients and Kintone API callbacks to route through corporate network.
    - *Operational Complexity*: High network administration complexity; requires split-horizon DNS and internal CA trust distribution.
    - *Prerequisites*: Enterprise VPN and internal DNS infrastructure.
- **Security & Operational Constraints**:
  - `PLAIN_HTTP` is strictly forbidden (`HTTPS` required).
  - Wildcards in redirect URI are prohibited by Cybozu OAuth.
  - Port numbers in production URI should be avoided (standard port 443 required).
  - No concrete hostnames or domains are invented here (`NO_VALUES_INVENTED = YES`).
- **Status**: `UNRESOLVED / OWNER_DECISION_REQUIRED` (Default: `NONE`).

---

### `OD-D3-002-TOKEN-STORE-PROVIDER`: Production `D3TokenStore` Persistence Engine

- **Exact Decision Needed**: Select the concrete persistence provider engine that implements the canonical `D3TokenStore` interface in production.
- **Canonical Source Interface Contract (`src/server/services/d3-token-store-interface.js`)**:
  ```javascript
  storeGrant(sessionBinding, grant)       // Persist grant bound to session
  loadGrant(sessionBinding)               // Retrieve valid grant if present and unexpired
  rotateGrant(sessionBinding, newGrant)   // Atomically rotate grant
  invalidateGrant(sessionBinding)         // Remove grant for session
  ```
  *(Note: Candidate provider internal operations such as connection pooling, indexing, and TTL eviction are provider implementation details and not modifications to the source interface contract).*
- **Why Required**: The test `InMemoryTokenStore` is ephemeral and strictly forbidden for multi-process, clustered, or production use because tokens are lost on restart and cannot be shared across multiple backend worker processes.
- **Comparison of Candidate Provider Classes**:

| Candidate Class | Security Properties | Persistence Behavior | Concurrency & Atomicity | Operational Complexity | Recovery Characteristics | Prerequisites | Interface Compatibility (`storeGrant`, `loadGrant`, `rotateGrant`, `invalidateGrant`) |
|---|---|---|---|---|---|---|---|
| **Option A: Managed Encrypted Key-Value Cache (e.g. Redis)** | AES-256 at-rest encryption, TLS in-transit, password/token auth | In-memory with optional persistence; key-level TTL eviction | Atomic single-key operations; well-suited for fast grant lookups | Low-to-Medium (requires dedicated client driver and connection management) | Instant reconnection; keys restored from snapshot if persistence enabled | Dedicated Redis instance / cluster | 100% compatible via key-value mapping on `sessionBinding` |
| **Option B: Encrypted Relational Database (e.g. PostgreSQL / MySQL)** | Field-level encryption + tablespace / disk encryption | ACID durable storage; indexed queryable table | Row-level locking (`SELECT ... FOR UPDATE`); full transactional consistency | Low (reuses existing database infrastructure) | Point-in-time recovery, standard replication | Existing database instance and migration schema | 100% compatible via SQL adapter implementing the 4 interface methods |
| **Option C: OS-Protected Encrypted Local Storage (Encrypted SQLite / Flat-File)** | OS file permissions (0600), filesystem/envelope encryption | Single-host durability across process restarts | SQLite file-level serialization; single-node only | Very Low (zero external network dependencies) | Restored via host filesystem backup; cannot scale across multiple nodes | Single-host VM deployment | 100% compatible for single-node; not scalable across multiple instances |
| **Option D: Cloud Key-Value / Secret Store (e.g. DynamoDB / Cloud Secret Manager)** | Cloud IAM policies, native KMS encryption, centralized audit trail | Distributed multi-AZ durability | Strong consistency modes supported; managed scalability | Medium (cloud SDK integration, IAM role configuration) | Managed high availability across availability zones | Cloud provider account and IAM role configuration | 100% compatible via SDK adapter implementing the 4 interface methods |

- **Security & Operational Constraints**:
  - Cleartext token storage in storage backend is strictly forbidden (must use AES-256-GCM encryption with `KINTONE_TOKEN_ENCRYPTION_KEY`).
  - Plaintext tokens must never be logged or serialized in error dumps.
- **Status**: `UNRESOLVED / OWNER_DECISION_REQUIRED` (Default: `NONE`).

---

### `OD-D3-003-OAUTH-REGISTRATION-OPERATOR`: Cybozu Confidential OAuth Client Registration Authority

- **Exact Decision Needed**: Identify which administrative role/entity within Cybozu/Kintone is designated to register, rotate credentials for, and manage the Confidential OAuth Client.
- **Why Required**: Registering an OAuth client in Cybozu requires access to Cybozu.com System Administration (`/admin/`). The registration produces `client_id` and `client_secret`. Strict custody of these credentials is mandatory.
- **Candidate Operator-Role Patterns**:
  - **Pattern 1: Primary Enterprise Cybozu System Administrator**
    - *Description*: The organization's designated primary Kintone/Cybozu tenant administrator performs registration directly in Cybozu Administration and securely hands off credentials via the designated secret custody mechanism.
    - *Security*: Aligns with standard IT administration hierarchy; audited under primary admin account.
    - *Operational Impact*: Dependent on enterprise IT administrator ticket and response SLA.
  - **Pattern 2: Dedicated Technical Service Account / DevOps Administrator**
    - *Description*: A designated technical administrator account created specifically for platform integrations with audited access.
    - *Security*: Separates application integrations from general user administration.
    - *Operational Impact*: Requires provisioning and life-cycle management of a dedicated admin seat.
  - **Pattern 3: Project Owner Direct Execution**
    - *Description*: Project Owner performs the Cybozu System Administration client registration personally.
    - *Security*: Minimal custody chain; credentials move directly from Cybozu to production secret vault.
    - *Operational Impact*: Requires direct Owner execution during provisioning gate.
- **Security & Operational Constraints**:
  - Operator must enforce MFA on Cybozu.com.
  - `client_secret` must never be shared via unencrypted channels (chat, email) or stored in Git.
  - Neither execution agent nor prompt may possess or invent administrator credentials.
- **Status**: `UNRESOLVED / OWNER_DECISION_REQUIRED` (Default: `NONE`).

---

### `OD-D3-004-ATTESTATION-READER-IDENTITY`: Attestation App Privileged Reader Credential Mechanism

- **Exact Decision Needed**: Select the credential type and identity mechanism for backend-to-Kintone privileged readback of Attestation records.
- **Why Required**: To complete attestation verification, the backend must query Kintone to read the record stamped by the user's OAuth submission, inspect the system-stamped `CREATOR` and `CREATED_TIME`, and match them against the active session.
- **Candidate Mechanisms**:
  - **Mechanism 1: Dedicated Kintone App API Token**
    - *Description*: An API Token generated specifically inside the Attestation App settings.
    - *Permissions*: Strictly `View records` (Read) checked. `Add records`, `Edit records`, `Delete records`, and `Manage app` unchecked.
    - *Security*: Restricted strictly to the Attestation App; cannot impersonate users, cannot write records, cannot transition processes.
    - *Operational Complexity*: Token must be regenerated if app is duplicated; straightforward generation in app settings.
  - **Mechanism 2: Dedicated Service User Account with Role-Based ACL**
    - *Description*: A distinct Cybozu user account provisioned for technical integrations.
    - *Permissions*: Restricted by Kintone App/Record/Field permissions to View-only in Attestation App.
    - *Security*: Requires username/password or personal authentication token; wider potential scope if permissions are misconfigured.
    - *Operational Complexity*: Consumes a Cybozu user license; subject to user credential rotation policies.
- **Mandatory Invariants Preserved**:
  - `PRIVILEGED_ATTESTATION_READER = ATTESTATION_APP_READBACK_ONLY`
  - Privileged Reader is strictly read-only (`READ = YES`, `ADD = NO`, `EDIT = NO`, `DELETE = NO`).
  - Zero workflow transition authority (`PROCESS_WRITE = NO`).
  - Backend-only custody; browser exposure strictly forbidden.
- **Status**: `UNRESOLVED / OWNER_DECISION_REQUIRED` (Default: `NONE`).

---

### `OD-D3-005-APP798-WRITER-IDENTITY`: App 798 Trusted Writer Credential Mechanism

- **Exact Decision Needed**: Select the credential type and identity mechanism for backend trusted writing of immutable archive records into App 798 (Revision Archive App).
- **Why Required**: Archival evidence records must be written by an isolated backend service authority that normal users cannot tamper with or bypass.
- **Candidate Mechanisms**:
  - **Mechanism 1: Dedicated App 798 API Token**
    - *Description*: An API Token generated inside App 798 settings.
    - *Permissions*: `View records` and `Add records` checked. `Edit records` and `Delete records` strictly unchecked.
    - *Security*: Enforced by platform permission layer: token without Edit/Delete permissions cannot alter existing archive records.
    - *Operational Complexity*: Generated directly in App 798 administration.
  - **Mechanism 2: Dedicated Service User Account with Restricted Role**
    - *Description*: A dedicated Cybozu service user account assigned to an exclusive role granted Add/View in App 798.
    - *Security*: Identifies writer as a specific named account in audit trail; requires user-level credential management.
    - *Operational Complexity*: Consumes a user license; requires password / token rotation governance.
- **Mandatory Invariants Preserved**:
  - `READ = YES`, `ADD = YES`, `EDIT = NO`, `DELETE = NO`.
  - Backend-only custody; browser exposure strictly forbidden.
  - Idempotency verification before write remains mandatory.
- **Status**: `UNRESOLVED / OWNER_DECISION_REQUIRED` (Default: `NONE`).

---

### `OD-D3-006-SECRET-CUSTODY-MECHANISM`: Production Secret Custody and Injection Mechanism

- **Exact Decision Needed**: Specify how production runtime secrets will be stored, rotated, and injected into the MBO Gateway runtime environment.
- **Secrets in Scope**:
  1. `KINTONE_OAUTH_CLIENT_SECRET` (Confidential OAuth secret)
  2. `KINTONE_TOKEN_ENCRYPTION_KEY` (AES-256 master key for token store at-rest encryption)
  3. `ATTESTATION_READER_CREDENTIAL` (API token or password for reading Attestation App)
  4. `APP798_WRITER_CREDENTIAL` (API token or password for writing App 798)
  5. `SESSION_SIGNING_SECRET` (HMAC key for backend session cookie / state nonce verification)
- **Candidate Custody Mechanisms**:
  - **Option 1: Cloud Provider Managed Secrets Vault (e.g. AWS Secrets Manager / GCP Secret Manager / Azure Key Vault)**
    - *Mechanism*: Secrets fetched dynamically at startup via cloud IAM instance role; zero plaintext secret files on host.
    - *Security*: Centralized audit logging, automated rotation support, granular IAM access policies.
    - *Operational Complexity*: Requires cloud SDK and IAM setup.
  - **Option 2: Container Platform / Kubernetes Secrets Engine**
    - *Mechanism*: Injected as encrypted environment variables or tmpfs-mounted secret files into container runtime.
    - *Security*: Managed within container platform; encrypted at rest in etcd.
    - *Operational Complexity*: Native to container orchestrator deployments.
  - **Option 3: OS-Level Protected Environment Configuration (systemd / encrypted configuration on secure host)**
    - *Mechanism*: Configuration file owned by dedicated service user (`chmod 0400` / `0600`), loaded directly by systemd service unit.
    - *Security*: Relies on host-level OS access controls and disk encryption (LUKS/BitLocker).
    - *Operational Complexity*: Simple, zero cloud dependency; requires audited host administration.
- **Mandatory Invariants Preserved**:
  - `BROWSER_SECRET_EXPOSURE = FORBIDDEN`
  - `TOKEN_LOGGING = FORBIDDEN`
  - `SECRET_IN_GIT = FORBIDDEN`
- **Status**: `UNRESOLVED / OWNER_DECISION_REQUIRED` (Default: `NONE`).

---

### `OD-D3-007-TOKEN-STORE-PERSISTENCE-POLICY`: User OAuth Grant Restart & Retention Policy

- **Exact Decision Needed**: Define the lifecycle and recovery behavior of user OAuth grants across backend service restarts and store flush events.
- **Comparison of Policies**:

| Metric / Dimension | Option A: Ephemeral / Re-authorization on Restart | Option B: Durable Encrypted Token Retention |
|---|---|---|
| **Core Behavior** | Backend restart flushes or discards active token store entries. Active users re-authenticate via OAuth on next transition action. | Tokens are retained in durable encrypted storage across backend restarts until natural expiry or explicit logout. |
| **User Impact** | Users encounter a one-click OAuth consent redirect upon next transition action after server restart. | Transparent to users across server restarts. No re-authentication needed if token is unexpired. |
| **Operational Complexity** | Low. Ephemeral management; no cross-restart migration or orphan token management. | Medium. Requires storage backups, persistent storage monitoring, periodic expired-token purge jobs. |
| **Security Exposure** | Minimal attack surface. Blast radius of compromise is limited to live memory runtime; restarts act as global session invalidation. | Requires ongoing cryptographic key management and reliable revocation handling. |
| **Recovery Behavior** | Immediate clean slate on backend reboot; zero risk of stale/corrupted token state. | Backend recovers previous session states; requires synchronization handling if store diverges from Cybozu OAuth server. |
| **Revocation / Invalidation** | Instantaneous on restart; per-session invalidation via `invalidateGrant`. | Requires reliable `invalidateGrant` execution and background TTL cleanup. |

- **Status**: `UNRESOLVED / OWNER_DECISION_REQUIRED` (Default: `NONE`).

---

## 6. Security and Operational Consequences Summary

1. **Host & DNS (`OD-D3-001`)**: Defines the network security boundary and ensures Kintone's redirect URI policy cannot be bypassed.
2. **Token Store (`OD-D3-002` & `OD-D3-007`)**: Balances operational simplicity against user re-authentication frequency. Ephemeral storage provides maximum fail-closed security, while durable storage improves continuous user convenience.
3. **Operator & Credential Isolation (`OD-D3-003`, `OD-D3-004`, `OD-D3-005`, `OD-D3-006`)**: Enforces strict separation of duties. The backend possesses only readback authority for Attestation and append-only authority for App 798, preventing escalation to unauthorized record alteration or workflow transitions.

---

## 7. Dependencies Between Decisions

```text
+-----------------------------------+
| OD-D3-001: Backend Production Host| <----+
+-----------------------------------+      |
                  |                        | Required for Redirect URI
                  v                        |
+-----------------------------------+      |
| OD-D3-003: OAuth Registration     | -----+
+-----------------------------------+
                  | Produces Client ID & Secret
                  v
+-----------------------------------+
| OD-D3-006: Secret Custody         | <----+ Injects credentials into backend
+-----------------------------------+      |
       |                   |               |
       v                   v               |
+-----------------+ +-----------------+    |
| OD-D3-004:      | | OD-D3-005:      | ---+
| Attestation Rdr | | App 798 Writer  |
+-----------------+ +-----------------+
                  |
+-----------------------------------+
| OD-D3-002: Token Store Provider   |
+-----------------------------------+
                  | Shapes implementation of
                  v
+-----------------------------------+
| OD-D3-007: Persistence Policy     |
+-----------------------------------+
```

- `OD-D3-001` (Backend Host) must be decided before `OD-D3-003` (OAuth Client Registration) can be executed, as the redirect URI requires the exact hostname.
- `OD-D3-006` (Secret Custody) depends on having selected credentials from `OD-D3-003`, `OD-D3-004`, and `OD-D3-005`.
- `OD-D3-007` (Persistence Policy) must align with the technical capability of `OD-D3-002` (Token Store Provider).

---

## 8. Exact Owner Input Required

The Project Owner is requested to review the neutral candidate options and provide selections for the following fields:

1. **`OD-D3-001`**: Selected Hostname Pattern / Target (e.g. Corporate Subdomain, Cloud PaaS, Internal Private Host).
2. **`OD-D3-002`**: Selected Token Store Engine (e.g. Redis, RDBMS, Encrypted Local Storage, Cloud KV).
3. **`OD-D3-003`**: Designated Registration Role (e.g. Cybozu Primary Admin, Dedicated Service Admin, Owner Direct).
4. **`OD-D3-004`**: Attestation Reader Credential Type (e.g. Dedicated App API Token or Service Account).
5. **`OD-D3-005`**: App 798 Writer Credential Type (e.g. Dedicated App API Token or Service Account).
6. **`OD-D3-006`**: Secret Custody Mechanism (e.g. Cloud Secrets Vault, Container Secrets, OS Protected Configuration).
7. **`OD-D3-007`**: Token Persistence Policy (Option A: Ephemeral or Option B: Durable).

---

## 9. Decision Capture Template

When the Project Owner is ready to ratify, the following template may be filled and issued in an Owner Directive or Control Plane instruction:

```text
================================================================================
OWNER RATIFICATION DIRECTIVE — LIVE PROVISIONING DECISION PACKET 01
================================================================================
AUTHORIZATION_ID: MBO2026-D3-LIVE-PROVISIONING-RATIFICATION-2026MMDD-OWNER-01
PROJECT: MBO2026
CANONICAL_BRANCH: ai/antigravity-wp002c

RATIFIED DECISIONS:
1. OD-D3-001-BACKEND-HOST:
   - SELECTED_OPTION: [ Option 1 / Option 2 / Option 3 ]
   - DETAILS: [ e.g. Domain / Hostname topology ]

2. OD-D3-002-TOKEN-STORE-PROVIDER:
   - SELECTED_OPTION: [ Option A (Redis) / Option B (RDBMS) / Option C (OS Storage) / Option D (Cloud KV) ]
   - DETAILS: [ Specific engine / technology ]

3. OD-D3-003-OAUTH-REGISTRATION-OPERATOR:
   - SELECTED_OPTION: [ Pattern 1 (Tenant Admin) / Pattern 2 (Tech Admin) / Pattern 3 (Owner Direct) ]
   - DETAILS: [ Designation of registering entity ]

4. OD-D3-004-ATTESTATION-READER-IDENTITY:
   - SELECTED_OPTION: [ Mechanism 1 (App API Token) / Mechanism 2 (Service Account) ]
   - DETAILS: [ Read-only token confirmation ]

5. OD-D3-005-APP798-WRITER-IDENTITY:
   - SELECTED_OPTION: [ Mechanism 1 (App API Token) / Mechanism 2 (Service Account) ]
   - DETAILS: [ Add+View token confirmation ]

6. OD-D3-006-SECRET-CUSTODY-MECHANISM:
   - SELECTED_OPTION: [ Option 1 (Cloud Vault) / Option 2 (Container Secrets) / Option 3 (Protected OS) ]
   - DETAILS: [ Secret injection strategy ]

7. OD-D3-007-TOKEN-STORE-PERSISTENCE-POLICY:
   - SELECTED_OPTION: [ Option A (Ephemeral) / Option B (Durable) ]
   - DETAILS: [ Restart / retention behavior ]

OWNER_SIGNATURE: [ Simple / Project Owner ]
DATE: [ YYYY-MM-DD ]
================================================================================
```

---

## 10. Explicit Non-Authorization Boundary

This decision packet carries the following absolute non-authorization boundaries:
- **`LIVE_PROVISIONING_AUTHORIZED`**: `NO`
- **`LIVE_KINTONE_READ_AUTHORIZED`**: `NO`
- **`LIVE_KINTONE_WRITE_AUTHORIZED`**: `NO`
- **`REAL_OAUTH_AUTHORIZED`**: `NO`
- **`OAUTH_CLIENT_REGISTRATION_AUTHORIZED`**: `NO`
- **`ATTESTATION_APP_CREATE_AUTHORIZED`**: `NO`
- **`SCHEMA_WRITE_AUTHORIZED`**: `NO`
- **`ACL_WRITE_AUTHORIZED`**: `NO`
- **`DEPLOYMENT_AUTHORIZED`**: `NO`
- **`UAT_AUTHORIZED`**: `NO`
- **`NEXT_WORK_PACKAGE_AUTO_START`**: `NO`

---

## 11. Proposed Sequence After Future Ratification

Only after the Project Owner issues formal ratification of all seven decisions and authorizes the subsequent work package, the execution sequence will proceed as follows:

1. **Step 1 — Provisioning Specification Package**: Update technical specifications with the exact ratified values and configurations.
2. **Step 2 — Token Store Adapter Package**: Implement and verify the production `D3TokenStore` provider adapter in local test suites (zero live I/O).
3. **Step 3 — Owner Live Provisioning Authorization**: Owner issues separate explicit authorization for administrative infrastructure setup (Attestation App creation, ACL setting, OAuth client registration).
4. **Step 4 — Controlled Readback Verification**: Readback and verify schema, ACLs, and endpoints against specifications.
5. **Step 5 — Bounded Live UAT**: Owner-guided live integration verification under formal test fixtures.

---

## 12. STOP State

**CURRENT STATE**: `STOP FOR INDEPENDENT CONTROL PLANE REVIEW THEN OWNER DECISION`

No further automated execution, file changes, or live interactions are permitted until formal review and Owner decision.
