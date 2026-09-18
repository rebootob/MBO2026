# D3 Platform-Stamped OAuth Trusted Writer Live Provisioning Owner Decision Packet

**Document ID**: `D3_PLATFORM_STAMPED_OAUTH_TRUSTED_WRITER_LIVE_PROVISIONING_OWNER_DECISION_PACKET_01`
**Package ID**: `D3-ARCHIVE-RUNTIME-TRUSTED-WRITER-LIVE-PROVISIONING-OWNER-DECISION-PACKET-01`
**Canonical Branch**: `ai/antigravity-wp002c`
**Base HEAD**: `ca47149f063a758eef97117804636c9ab5f00d43`
**Base Tree**: `4d2d9d8693679fc176c54a3bc6e8c2092c6adad6`
**Authorization ID**: `MBO2026-D3-ARCHIVE-RUNTIME-TRUSTED-WRITER-LIVE-PROVISIONING-OWNER-DECISION-PACKET-01-20260918-OWNER-01`
**Document Status**: `OWNER_DECISION_PACKET_READY / PENDING_OWNER_RATIFICATION`
**Role**: Single consolidated decision packet for Project Owner review and ratification of the seven unresolved live-provisioning decisions (`OD-D3-001` through `OD-D3-007`).

---

## 1. Package Provenance and Authorization

- **Governing Protocol**: Strict Orbis Governance (3-tier: Owner -> ChatGPT Control Plane -> Antigravity Execution Plane).
- **Owner Authorization**: This packet is prepared under explicit Owner Authorization ID `MBO2026-D3-ARCHIVE-RUNTIME-TRUSTED-WRITER-LIVE-PROVISIONING-OWNER-DECISION-PACKET-01-20260918-OWNER-01`.
- **Purpose**: Prepare ONE comprehensive, self-contained decision packet covering all seven unresolved technical and operational decisions required before live provisioning may be considered.
- **Authority Boundary**:
  - This package authorizes **decision preparation and documentation only**.
  - It does **not** select any options for the Owner.
  - It does **not** ratify `OD-D3-001` through `OD-D3-007`.
  - It does **not** authorize live provisioning, Kintone I/O, OAuth client registration, real OAuth flow execution, Attestation App creation, schema/ACL changes, deployment, UAT, or next work packages.
  - Commit `2371e377bf5a34b02ee2f2a2f3677d2e7a30492c` remains `UNAUTHORIZED_AUTO_START_OUTPUT / NON_AUTHORITATIVE` (Git history preserved, retroactive ratification = NO).

---

## 2. Current Accepted Implementation Baseline

The software implementation for D3 platform-stamped OAuth trusted-writer architecture was verified, independently reviewed, and closed at:
- **Accepted Implementation Package**: `D3-ARCHIVE-RUNTIME-TRUSTED-WRITER-PLATFORM-STAMPED-OAUTH-IMPLEMENTATION-01-R3`
- **Accepted Implementation Commit SHA**: `f76edbaa99ea3d93f4440e181c4ab66768abb0ee`
- **Implementation Status**: `PASS / ACCEPTED / CLOSED`
- **Local Verification Gate**: `ACCEPTED` (169/169 unit/integration tests passing; zero regression across all baseline suites).
- **Business UAT Status**: `NOT_PROVEN` (Full live business UAT has not been executed; production readiness is `NO`; D3 closure is `NOT_CLAIMED`).

---

## 3. Already-Locked Architecture — NOT OPEN FOR REDECISION

The following architectural invariants were ratified in Owner Decisions 008 (`D3_DECISION_008_ROUTE_SNAPSHOT_PERSISTENCE_SYNC`) and 009 (`D3_DECISION_009_PLATFORM_STAMPED_OAUTH_ATTESTATION_ARCHITECTURE_RATIFICATION`). They are **LOCKED_EXISTING_AUTHORITY** and **NOT OPEN FOR REDECISION** in this packet:

1. **Architecture Core**: `NATIVE_KINTONE_PLATFORM_STAMPED_OAUTH_ATTESTATION` is the sole authorized architecture.
2. **Attestation & Transition User Authority**: Must use the same backend-held user OAuth token authority (`SAME_BACKEND_HELD_USER_OAUTH_AUTHORITY`).
3. **Actor Identity Provenance**: Actor identity is derived strictly from Kintone platform-stamped `CREATOR` field on the attestation record (`KINTONE_PLATFORM_STAMPED_CREATOR_ONLY`).
4. **Browser Authority**: Browser client has zero archive-fact authority and zero privileged secrets (`BROWSER_PRIVILEGED_SECRET = FORBIDDEN`).
5. **Token Handling**: Browser never sees, selects, or passes backend-held OAuth access/refresh tokens (`BROWSER_SELECTS_SERVER_TOKEN = FORBIDDEN`).
6. **Attestation Nonce**: Server-generated, cryptographically random, single-use, session-bound, and strictly time-limited (`ATTESTATION_NONCE_SERVER_GENERATED = YES`, `ATTESTATION_NONCE_SINGLE_USE = YES`).
7. **Attestation Event Binding**: Full 9-field canonical binding (`appId`, `recordId`, `fromStatus`, `toStatus`, `actionName`, `revision`, `actorCode`, `clientTimestamp`, `nonce`) must match exactly between event request and verified attestation record.
8. **App 794 Pre-requisite**: Authoritative App 794 record state is fetched directly by the backend from Kintone via privileged reader before transition; expected revision checks must match.
9. **App 798 Archival Ordering**: App 798 archive record must be successfully persisted *before* executing the App 794 process transition (`APP798_ARCHIVE_BEFORE_TRANSITION = REQUIRED`).
10. **Snapshot Reuse**: App 794 route snapshot reuse before verified archive success is forbidden (`APP794_ROUTE_SNAPSHOT_REUSE_BEFORE_ARCHIVE_SUCCESS = FORBIDDEN`).
11. **Double Transition Prevention**: Double process transition attempts fail closed immediately (`DOUBLE_PROCESS_TRANSITION = FORBIDDEN`).
12. **App 798 Permissions**: Group `everyone` has View=NO, Add=NO, Edit=NO, Delete=NO. Trusted Writer has View=YES, Add=YES, Edit=NO, Delete=NO (`APP798_GROUP_EVERYONE_VIEW = NO`, `APP798_GROUP_EVERYONE_ADD = NO`).
13. **Fail-Closed Principle**: Any missing binding, mismatched actor, invalid nonce, store error, or API failure results in instant termination and audit logging (`FAIL_CLOSED`).

---

## 4. Seven Unresolved Owner Decisions

The following seven operational and technical decisions remain unresolved. No live provisioning work may commence until the Owner formally ratifies an option for each.

| Decision ID | Topic | Current Status | Default | Owner Selection |
|---|---|---|---|---|
| `OD-D3-001-BACKEND-HOST` | Canonical Production Backend Hostname & TLS | `UNRESOLVED / PROPOSED / NOT OWNER RATIFIED` | `NONE` | `REQUIRED` |
| `OD-D3-002-TOKEN-STORE-PROVIDER` | Production `D3TokenStore` Persistence Engine | `UNRESOLVED / PROPOSED / NOT OWNER RATIFIED` | `NONE` | `REQUIRED` |
| `OD-D3-003-OAUTH-REGISTRATION-OPERATOR` | Cybozu Confidential OAuth Client Admin Operator | `UNRESOLVED / PROPOSED / NOT OWNER RATIFIED` | `NONE` | `REQUIRED` |
| `OD-D3-004-ATTESTATION-READER-IDENTITY` | Attestation App Privileged Reader Credential | `UNRESOLVED / PROPOSED / NOT OWNER RATIFIED` | `NONE` | `REQUIRED` |
| `OD-D3-005-APP798-WRITER-IDENTITY` | App 798 Trusted Writer Credential | `UNRESOLVED / PROPOSED / NOT OWNER RATIFIED` | `NONE` | `REQUIRED` |
| `OD-D3-006-SECRET-CUSTODY-MECHANISM` | Backend Production Secret Custody / Vault | `UNRESOLVED / PROPOSED / NOT OWNER RATIFIED` | `NONE` | `REQUIRED` |
| `OD-D3-007-TOKEN-STORE-PERSISTENCE-POLICY` | User OAuth Grant Restart & Retention Policy | `UNRESOLVED / PROPOSED / NOT OWNER RATIFIED` | `NONE` | `REQUIRED` |

---

## 5. Candidate Options per Decision

### `OD-D3-001-BACKEND-HOST`: Canonical Production Backend Hostname & TLS

- **Exact Decision Needed**: Specify the canonical fully-qualified HTTPS hostname, reverse proxy / ingress routing, and TLS termination target for the MBO Gateway backend server in production.
- **Why Required**: Kintone Confidential OAuth Client registration requires a precise, non-wildcard redirect URI (`https://<host>/api/mbo/d3/oauth/callback`). In addition, browser client CORS origin whitelisting (`MBO_ALLOWED_ORIGIN`) depends directly on the public domain topology.
- **Prerequisites**: Domain ownership, DNS management authority, and valid SSL/TLS certificate issuance.
- **Candidate Options (Engineering Patterns)**:
  - **Option 1: Corporate Subdomain on Existing Ingress**
    - *Pattern*: `https://mbo-api.orbis.co.th` (example topology only; real name to be determined by Owner).
    - *Routing*: Routed via enterprise reverse proxy (Nginx, Traefik, AWS ALB, Cloudflare) terminating TLS 1.3 to Node.js backend.
  - **Option 2: Dedicated Cloud Container / App Service FQDN**
    - *Pattern*: Direct cloud PaaS managed FQDN (e.g. AWS App Runner, Google Cloud Run, Azure App Service endpoint).
    - *Routing*: Cloud-managed TLS and automatic scaling endpoint.
  - **Option 3: Internal / VPN-Only Gateway with Private DNS**
    - *Pattern*: Internal enterprise host reachable only over VPN / direct corporate network, provided Kintone browser clients and users reside within or route through that network.
- **Security & Operational Constraints**:
  - `PLAIN_HTTP` is strictly forbidden (`HTTPS` required).
  - Wildcards in redirect URI are prohibited by Cybozu OAuth.
  - Port numbers in production URI should be avoided (use standard port 443).
- **Information Still Missing**: Specific domain name, hosting provider, DNS infrastructure ownership.
- **Authority Tag**: `ENGINEERING_CANDIDATE` — `OWNER_DECISION_REQUIRED` (Default: `NONE`).

---

### `OD-D3-002-TOKEN-STORE-PROVIDER`: Production `D3TokenStore` Persistence Engine

- **Exact Decision Needed**: Select the concrete persistence provider class that implements the `D3TokenStoreInterface` (`get`, `set`, `delete`, `touch`, `clearExpired`) in production.
- **Why Required**: The local `InMemoryTokenStore` is ephemeral and strictly forbidden for multi-process, clustered, or production use because tokens are lost on restart and cannot be shared across multiple backend worker processes.
- **Comparison of Candidate Provider Classes**:

| Candidate Class | Security Properties | Persistence Behavior | Atomicity & Concurrency | Operational Complexity | Recovery Characteristics | Prerequisites | Compatibility with D3 Contract |
|---|---|---|---|---|---|---|---|
| **Option A: Managed Encrypted Redis (e.g., Redis Cloud, AWS ElastiCache)** | At-rest encryption (AES-256), in-transit TLS, auth token/password | In-memory with optional RDB/AOF persistence; native key TTL | Native atomic operations (`GET`, `SET EX`, `DEL`), excellent for session locking | Low-to-Medium (standard Redis client library) | Instant reconnection; keys restored from AOF/snapshot if configured | Dedicated Redis cluster/instance | 100% compliant with key-value semantics and TTL expiry |
| **Option B: Encrypted Relational Database (PostgreSQL / MySQL)** | Field-level envelope encryption + DB-level disk encryption (LUKS/AWS RDS KMS) | Fully durable ACID transactions; table with indexed `session_binding` | Strong ACID transactions with row-level locking (`SELECT ... FOR UPDATE`) | Low (leverages existing corporate RDBMS) | Standard DB replication, point-in-time recovery | Existing relational DB instance & migration schema | 100% compliant; requires SQL adapter implementation |
| **Option C: OS-Protected Encrypted Local Storage (Encrypted SQLite / Flat-file)** | File permissions (0600), SQLCipher or AES-GCM envelope encryption | Single-host durability; survives process restarts on same VM | SQLite atomic transactions with file locks | Very Low (no external network dependencies) | Backed up with VM snapshots; single point of failure (cannot cluster) | Single VM backend only (cannot scale horizontally) | 100% compliant for single-node deployments |
| **Option D: Cloud Key-Value / Secret Store (AWS Secrets Manager, DynamoDB with KMS)** | Strong cloud IAM policies, native KMS envelope encryption, automatic audit log | Cloud-durable across availability zones | Strongly consistent reads/writes supported (DynamoDB) | Medium (cloud SDK integration and IAM configuration) | Managed high availability across AZs | Cloud provider subscription and IAM roles | Compliant; slight latency overhead compared to Redis |

- **Security & Operational Constraints**:
  - Cleartext token storage in storage backend is strictly forbidden (must use AES-256-GCM encryption with `KINTONE_TOKEN_ENCRYPTION_KEY`).
  - Plaintext tokens must never be logged or serialized in error dumps.
- **Authority Tag**: `ENGINEERING_CANDIDATE` — `OWNER_DECISION_REQUIRED` (Default: `NONE`).

---

### `OD-D3-003-OAUTH-REGISTRATION-OPERATOR`: Cybozu Confidential OAuth Client Registration Authority

- **Exact Decision Needed**: Identify which administrative role/entity within Cybozu/Kintone is designated to register, rotate credentials for, and manage the Confidential OAuth Client.
- **Why Required**: Registering an OAuth client in Cybozu requires access to Cybozu.com System Administration (`/admin/`). The registration produces `client_id` and `client_secret`. Strict custody of these credentials is mandatory.
- **Permitted Operator-Role Patterns**:
  - **Pattern 1: Primary Enterprise Cybozu System Administrator**
    - The organization's designated primary Kintone/Cybozu tenant administrator performs registration directly in Cybozu Administration and securely hands off the credentials via the secret custody mechanism.
  - **Pattern 2: Dedicated Technical Service Account / DevOps Administrator**
    - A dedicated administrative user code created specifically for platform integrations with audited access.
  - **Pattern 3: Project Owner Direct Execution**
    - Project Owner (`Simple`) performs the Cybozu System Administration client registration personally.
- **Security & Operational Constraints**:
  - Operator must use 2FA / MFA on Cybozu.com.
  - `client_secret` must never be shared via unencrypted channels (Slack, email, chat) or stored in Git.
  - Neither execution agent nor prompt may invent or possess administrator credentials.
- **Information Still Missing**: Exact enterprise administrator role designation.
- **Authority Tag**: `ENGINEERING_CANDIDATE` — `OWNER_DECISION_REQUIRED` (Default: `NONE`).

---

### `OD-D3-004-ATTESTATION-READER-IDENTITY`: Attestation App Privileged Reader Credential Mechanism

- **Exact Decision Needed**: Select the credential type and identity mechanism for backend-to-Kintone privileged readback of Attestation records.
- **Why Required**: To complete attestation verification, the backend must query Kintone to read the record stamped by the user's OAuth submission, inspect the system-stamped `CREATOR` and `CREATED_TIME`, and match them against the active session.
- **Comparison of Technically Supportable Candidate Mechanisms**:
  - **Mechanism 1: Dedicated Kintone App API Token (Recommended Pattern)**
    - *Description*: An API Token generated specifically inside the Attestation App settings.
    - *Permissions*: Strictly `View records` (Read) checked. `Add records`, `Edit records`, `Delete records`, and `Manage app` unchecked.
    - *Security*: Cannot be used to impersonate users, cannot write records, cannot transition processes. Scope is restricted exclusively to the Attestation App.
  - **Mechanism 2: Dedicated Service User Account with Role-Based ACL**
    - *Description*: A distinct Cybozu user account provisioned for technical integrations.
    - *Permissions*: Restricted by Kintone App/Record/Field permissions to View-only in Attestation App.
    - *Security*: Requires username/password or personal token custody; broader attack surface than App API token.
- **Mandatory Invariants Preserved**:
  - Privileged Reader is strictly read-only (`READ = YES`, `ADD = NO`, `EDIT = NO`, `DELETE = NO`).
  - Zero workflow transition authority (`PROCESS_WRITE = NO`).
  - Backend-only custody; browser exposure strictly forbidden.
- **Authority Tag**: `ENGINEERING_CANDIDATE` — `OWNER_DECISION_REQUIRED` (Default: `NONE`).

---

### `OD-D3-005-APP798-WRITER-IDENTITY`: App 798 Trusted Writer Credential Mechanism

- **Exact Decision Needed**: Select the credential type and identity mechanism for backend trusted writing of immutable archive records into App 798 (Revision Archive App).
- **Why Required**: Archival evidence records must be written by an isolated backend service authority that normal users cannot tamper with or bypass.
- **Comparison of Technically Supportable Candidate Mechanisms**:
  - **Mechanism 1: Dedicated App 798 API Token (Recommended Pattern)**
    - *Description*: An API Token generated inside App 798 settings.
    - *Permissions*: `View records` and `Add records` checked. `Edit records` and `Delete records` strictly unchecked.
    - *Security*: Hardened by Kintone platform rules: an API token without Edit/Delete permissions cannot alter existing archive entries under any circumstance.
  - **Mechanism 2: Dedicated Service User Account with Restricted Role**
    - *Description*: A dedicated service user account assigned to a role granted Add/View in App 798.
    - *Security*: More complex to maintain; requires password rotation policies.
- **Mandatory Invariants Preserved**:
  - `READ = YES`, `ADD = YES`, `EDIT = NO`, `DELETE = NO`.
  - Backend-only custody; browser exposure strictly forbidden.
  - Idempotency check before write remains mandatory.
- **Authority Tag**: `ENGINEERING_CANDIDATE` — `OWNER_DECISION_REQUIRED` (Default: `NONE`).

---

### `OD-D3-006-SECRET-CUSTODY-MECHANISM`: Production Secret Custody and Injection Mechanism

- **Exact Decision Needed**: Specify how production runtime secrets will be stored, rotated, and injected into the MBO Gateway runtime environment.
- **Secrets in Scope**:
  1. `KINTONE_OAUTH_CLIENT_SECRET` (Confidential OAuth secret)
  2. `KINTONE_TOKEN_ENCRYPTION_KEY` (AES-256 master key for token store at-rest encryption)
  3. `ATTESTATION_READER_CREDENTIAL` (API token or password for reading Attestation App)
  4. `APP798_WRITER_CREDENTIAL` (API token or password for writing App 798)
  5. `SESSION_SIGNING_SECRET` (HMAC key for backend session cookie / state nonce verification)
- **Comparison of Candidate Custody Mechanisms**:
  - **Option 1: Cloud Provider Managed Secrets Vault (AWS Secrets Manager, GCP Secret Manager, Azure Key Vault)**
    - *Mechanism*: Secrets fetched at runtime startup via cloud IAM instance role without storing on disk.
    - *Pros*: Full audit logging, automatic rotation capabilities, zero files on host.
    - *Cons*: Requires cloud infrastructure integration.
  - **Option 2: Container Platform / Kubernetes Secrets / Docker Secrets**
    - *Mechanism*: Injected as encrypted environment variables or tmpfs-mounted files into container runtime.
    - *Pros*: Native to modern CI/CD and container orchestrators.
    - *Cons*: Requires container platform.
  - **Option 3: OS-Level Protected Environment Configuration (systemd / encrypted .env on secure host)**
    - *Mechanism*: File owned by dedicated service user with `chmod 0400` / `0600`, injected into systemd service unit.
    - *Pros*: Simple, zero external cloud dependency.
    - *Cons*: Host administrator access control must be strictly audited.
- **Mandatory Invariants Preserved**:
  - `BROWSER_SECRET_EXPOSURE = FORBIDDEN`
  - `TOKEN_LOGGING = FORBIDDEN`
  - `SECRET_IN_GIT = FORBIDDEN`
- **Authority Tag**: `ENGINEERING_CANDIDATE` — `OWNER_DECISION_REQUIRED` (Default: `NONE`).

---

### `OD-D3-007-TOKEN-STORE-PERSISTENCE-POLICY`: User OAuth Grant Restart & Retention Policy

- **Exact Decision Needed**: Define the lifecycle and recovery behavior of user OAuth grants across backend service restarts and store flush events.
- **Comparison of Policies**:

| Metric / Dimension | Option A: Ephemeral / Re-authorization on Restart | Option B: Durable Encrypted Token Retention |
|---|---|---|
| **Core Behavior** | Backend restart flushes or discards active token store entries. Active users must re-authenticate via OAuth on their next transition action. | Tokens are retained in durable encrypted storage across backend restarts until natural expiry or explicit logout. |
| **User Impact** | Users encounter a one-click OAuth consent redirect upon next transition action after a server maintenance restart. Minor UX friction. | Completely transparent to users across server restarts. No re-authentication needed if token is unexpired. |
| **Operational Complexity** | Very Low. Simple cache management; no cross-restart migration or lingering orphan token management. | Medium. Requires storage backups, persistent disk/database health, periodic expired-token purge jobs. |
| **Security Exposure** | Minimal attack surface. Blast radius of compromise is limited to live memory runtime; restarts act as global session invalidation. | Higher lingering risk. Tokens persist on disk/database; requires robust cryptographic key management and explicit revocation. |
| **Recovery Behavior** | Immediate clean slate on backend reboot; zero risk of stale/corrupted token state. | Backend recovers previous session states; risk of corrupted state if database is out-of-sync with Kintone OAuth server. |
| **Revocation / Logout** | Instantaneous on restart; per-session delete via API. | Requires reliable delete API and periodic background cleanup. |

- **Authority Tag**: `ENGINEERING_CANDIDATE` — `OWNER_DECISION_REQUIRED` (Default: `NONE`).

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

The Project Owner is requested to review the options and provide selections for the following fields:

1. **`OD-D3-001`**: Selected Hostname Pattern / Target (e.g. Subdomain, Cloud PaaS, Private Host).
2. **`OD-D3-002`**: Selected Token Store Engine (e.g. Redis, PostgreSQL/MySQL, OS Encrypted File, Cloud Key-Value).
3. **`OD-D3-003`**: Designated Registration Role (e.g. Cybozu Primary Admin, Dedicated Service Admin, Owner Direct).
4. **`OD-D3-004`**: Attestation Reader Credential Type (e.g. Dedicated App API Token [Recommended] or Service Account).
5. **`OD-D3-005`**: App 798 Writer Credential Type (e.g. Dedicated App API Token [Recommended] or Service Account).
6. **`OD-D3-006`**: Secret Custody Mechanism (e.g. Cloud Secrets Manager, Container/Kube Secrets, Protected OS Host Config).
7. **`OD-D3-007`**: Token Persistence Policy (`OPTION_A_EPHEMERAL` [Recommended for initial phase] or `OPTION_B_DURABLE`).

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
   - SELECTED_OPTION: [ Option A (Redis) / Option B (RDBMS) / Option C (OS File) / Option D (Cloud KV) ]
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
