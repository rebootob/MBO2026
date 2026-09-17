# Evidence: D3 Archive Runtime Trusted Writer Native OAuth Transaction Architecture Decision 03

## Document Control
- **Package**: `D3-ARCHIVE-RUNTIME-TRUSTED-WRITER-NATIVE-OAUTH-TRANSACTION-ARCHITECTURE-DECISION-03`
- **Authorization ID**: `MBO2026-D3-ARCHIVE-RUNTIME-TRUSTED-WRITER-NATIVE-OAUTH-TRANSACTION-ARCHITECTURE-DECISION-03-20260917-OWNER-01`
- **Base HEAD**: `1c29f128dd49e09e34a140b91ddf53e0f3fcdecd`
- **Mode**: `ONE-FILE ARCHITECTURE DECISION / OFFICIAL-DOCUMENTATION ONLY FOR MATERIAL CLAIMS / NO IMPLEMENTATION / NO LIVE I/O`
- **Scope Control**: `STRICT (SCOPE_EXPANSION_AUTHORIZED = NO)`
- **Target File**: `project-docs/evidence/D3_ARCHIVE_RUNTIME_TRUSTED_WRITER_NATIVE_OAUTH_TRANSACTION_ARCHITECTURE_DECISION_03_EVIDENCE.md`

---

## 1. Executive Verdict & Terminal Contract

```yaml
PACKAGE: D3-ARCHIVE-RUNTIME-TRUSTED-WRITER-NATIVE-OAUTH-TRANSACTION-ARCHITECTURE-DECISION-03
AUTHORIZATION_ID: MBO2026-D3-ARCHIVE-RUNTIME-TRUSTED-WRITER-NATIVE-OAUTH-TRANSACTION-ARCHITECTURE-DECISION-03-20260917-OWNER-01
BASE_HEAD: 1c29f128dd49e09e34a140b91ddf53e0f3fcdecd

OAUTH_TOKEN_BOUND_TO_AUTHORIZING_USER: PROVEN_SUPPORTED
OAUTH_BACKEND_EXACT_USER_IDENTITY: NOT_PROVEN
APP798_WRITE_UNDER_OAUTH_USER_AUTHORITY: NOT_PROVEN
ARCHIVED_BY_FROM_OAUTH_IDENTITY: NOT_PROVEN
PROCESS_TRANSITION_VIA_USER_OAUTH: PROVEN_SUPPORTED
SAME_OAUTH_SUBJECT_FOR_ARCHIVE_AND_TRANSITION: NOT_PROVEN
OAUTH_TRANSACTION_PARTIAL_FAILURE_SAFETY: PROVEN_DESIGNABLE
OAUTH_PRIVILEGED_SECRET_LOCATION: TRUSTED_BACKEND_ONLY
NEW_INFRASTRUCTURE_REQUIRED: YES
NEW_IDENTITY_PROVIDER_REQUIRED: NO

NATIVE_USER_OAUTH_TRANSACTION_TRUST_CHAIN: NOT_PROVEN
ARCHIVED_BY_EXACT_ACTOR_PROOF: NOT_PROVEN

ARCHITECTURE_DECISION_RESULT: ARCHITECTURE_DECISION_NOT_READY
RECOMMENDED_CANDIDATE_FOR_OWNER_RATIFICATION: NONE

NO_MORE_NATIVE_ACTOR_RESEARCH: YES
OWNER_BUSINESS_DECISION_REQUIRED: YES
OWNER_DECISION_OPTIONS:
  - A. EXTERNAL_TRUSTED_IDENTITY_BOUNDARY
  - B. AMEND_D3_008_ARCHIVED_BY_REQUIREMENT

OWNER_RATIFIED_ARCHITECTURE: NONE
IMPLEMENTATION_AUTHORIZED: NO
DEPLOYMENT_AUTHORIZED: NO
FULL_D3_BUSINESS_UAT: NOT_PROVEN
D3_CLOSURE: NOT_CLAIMED
PRODUCTION_READY: NO
NEXT_GATE_AUTHORIZED: NO
AUTO_START_NEXT_WORK_PACKAGE: NO
FINAL_STATE: STOP FOR INDEPENDENT CONTROL PLANE REVIEW
```

---

## 2. Locked Baseline & Governance Parameters

This decision operates under the strict constraints ratified in prior control gates:
1. `OWNER_RATIFIED_ARCHITECTURE = NONE`
2. `ARCHITECTURE_DECISION_RESULT = ARCHITECTURE_DECISION_NOT_READY`
3. `CLIENT_TO_SERVER_TRUSTED_ACTOR_ATTESTATION = NOT_PROVEN`
4. `SERVER_SIDE_EXACT_TRANSITION_ACTOR = NOT_PROVEN`
5. `ARCHIVED_BY_EXACT_ACTOR_PROOF = NOT_PROVEN`
6. `BROWSER_PRIVILEGED_SECRET = FORBIDDEN`
7. `APP798 GROUP everyone Add = NO`
8. `APP798 GROUP everyone View = NO`
9. `APP794_ROUTE_SNAPSHOT_REUSE_BEFORE_ARCHIVE_SUCCESS = FORBIDDEN`
10. `ARCHIVE_HASH_CONFLICT = FAIL_CLOSED`
11. `ARCHIVE_ACTOR_NOT_RESOLVED = FAIL_CLOSED`

---

## 3. Official Documentation Authority & Citation Index

Every material factual claim regarding Cybozu / Kintone platform capabilities and limitations is grounded in current official technical documentation:

### Source 1: Cybozu Common Admin — OAuth Client Specification
- **SOURCE_TITLE**: OAuthクライアントを追加する (Adding an OAuth Client)
- **SOURCE_URL**: `https://cybozu.dev/ja/common/docs/oauth-client/add-client/`
- **ACCESS_DATE**: 2026-09-17
- **DOCUMENTED_CAPABILITY**:
  - cybozu.com supports OAuth 2.0 Authorization Code Grant (`grant_type=authorization_code`) for Confidential Clients.
  - Cybozu.com common administrator configures authorized users per client (`利用者の設定`).
  - End-user consents to authorization via interactive prompt: `（クライアント名）から次の操作が実行されます -> 【許可】`.
  - Token endpoint (`/oauth2/token`) returns `access_token`, `refresh_token`, `token_type: bearer`, `expires_in: 3600`, and `scope`.
  - Refresh tokens have no expiration and can be refreshed via `grant_type=refresh_token`.
- **DOCUMENTED_LIMITATION**:
  - The token response contract is purely OAuth 2.0 (RFC 6749) and contains **no** user identifier (`user_id`, `user_code`), **no** OpenID Connect `id_token`, and **no** `sub` claim.
  - Maximum of 20 OAuth clients per cybozu.com domain.
  - Maximum of 10 refresh tokens per client per user.
- **EVIDENCE_CLASS**: `DIRECT_DOCUMENTED`

### Source 2: Cybozu Common Admin — Kintone OAuth Scopes
- **SOURCE_TITLE**: kintoneのOAuthスコープ (Kintone OAuth Scopes)
- **SOURCE_URL**: `https://cybozu.dev/ja/common/docs/oauth-client/scope-kintone/`
- **ACCESS_DATE**: 2026-09-17
- **DOCUMENTED_CAPABILITY**:
  - Scopes supported:
    - `k:app_record:read`
    - `k:app_record:write` (covers `POST /k/v1/record.json`, `PUT /k/v1/record/status.json`, `PUT /k/v1/records/status.json`)
    - `k:app_settings:read`, `k:app_settings:write`
    - `k:file:read`, `k:file:write`
- **DOCUMENTED_LIMITATION**:
  - OAuth scopes apply strictly to Kintone Application Records, Settings, and Files.
  - There are **no** OAuth scopes defined for User API (`/v1/users*`), Organization API, or cybozu.com common administrative APIs.
- **EVIDENCE_CLASS**: `DIRECT_DOCUMENTED`

### Source 3: Cybozu Common Admin — User API Authentication Specification
- **SOURCE_TITLE**: User API共通仕様: 認証 (User API Common Specification: Authentication)
- **SOURCE_URL**: `https://cybozu.dev/ja/common/docs/user-api/overview/authentication/`
- **ACCESS_DATE**: 2026-09-17
- **DOCUMENTED_CAPABILITY**:
  - User API supports API Token Authentication (`Authorization: Bearer cy.s.api1...`), Password Authentication (`X-Cybozu-Authorization: Base64(login:password)`), and Browser Session Authentication (`kintone.api()`).
- **DOCUMENTED_LIMITATION**:
  - User API explicitly does **not** support OAuth 2.0 Bearer access tokens. OAuth tokens issued via `/oauth2/token` cannot query `/v1/users.json` or `/v1/users/own.json`.
- **EVIDENCE_CLASS**: `DIRECT_DOCUMENTED`

### Source 4: Kintone REST API Authentication Specification
- **SOURCE_TITLE**: kintone REST APIの共通仕様: 認証 (Kintone REST API Common Specifications: Authentication)
- **SOURCE_URL**: `https://cybozu.dev/ja/kintone/docs/rest-api/overview/authentication/`
- **ACCESS_DATE**: 2026-09-17
- **DOCUMENTED_CAPABILITY**:
  - Kintone REST API supports OAuth clients with Bearer token header (`Authorization: Bearer <access_token>`).
  - Requests execute under the authority and access permissions of the authorizing user.
- **DOCUMENTED_LIMITATION**:
  - Kintone REST API does not provide any dedicated "who-am-i", token introspection, or current-user identity query endpoint.
- **EVIDENCE_CLASS**: `DIRECT_DOCUMENTED`

---

## 4. Technical Analysis

### Question 1 — OAuth User Binding
- **Question**: What does a Kintone/Cybozu OAuth access token represent? Are REST operations performed with that token bound to the authorizing user?
- **Finding**:
  - Official documentation demonstrates that Cybozu OAuth 2.0 uses Authorization Code Grant.
  - The token is granted when a specific Kintone user approves authorization (`ユーザーによる認可`).
  - REST requests sent with `Authorization: Bearer <access_token>` operate under the specific authorization and permissions of that user.
  - When records are created or updated via Kintone REST API with this token, system audit fields (`$creator`, `$modifier`) attribute the mutation to that authorizing user.
- **Verdict**:
  - `OAUTH_TOKEN_BOUND_TO_AUTHORIZING_USER = PROVEN_SUPPORTED`

---

### Question 2 — Backend Who-Am-I / Subject Extraction
- **Question**: Can a trusted backend independently extract or establish the exact Kintone user identity (`user_code` / `user_id`) represented by the OAuth token without relying on client assertions?
- **Finding**:
  1. **Token Response**: The response from `POST /oauth2/token` returns `{ "access_token", "token_type": "bearer", "expires_in": 3600, "refresh_token", "scope" }`. It contains no `user_id`, no `user_code`, no `sub` claim, and no OpenID Connect `id_token`.
  2. **Token Introspection (RFC 7662)**: Cybozu does not provide an OAuth 2.0 token introspection endpoint (`/oauth2/introspect` or similar).
  3. **UserInfo Endpoint (OIDC)**: Cybozu does not implement OpenID Connect; no `/oauth2/userinfo` exists.
  4. **User API (`/v1/users.json`)**: User API documentation specifically lists supported authentication methods as API Token, Password, and Session authentication. It does **not** accept OAuth 2.0 Bearer tokens.
  5. **Kintone REST API (`/k/v1/*`)**: Kintone REST API contains no endpoint returning the current user's profile (unlike the client-side JavaScript API `kintone.getLoginUser()`).
  6. **Conclusion**: While the backend holds a token that the platform recognizes internally as belonging to a user, the backend **cannot independently introspect or resolve the exact Kintone user identity** from official platform endpoints. An unauthenticated browser assertion (such as passing `userCode` alongside the request) violates zero-trust backend attestation.
- **Verdict**:
  - `OAUTH_BACKEND_EXACT_USER_IDENTITY = NOT_PROVEN`

---

### Question 3 — App798 Write Under OAuth User Authority
- **Question**: Can the backend write to App798 using the authorizing user's OAuth token under current security constraints?
- **Finding**:
  - Current ratified security constraint requires:
    - `APP798 GROUP everyone Add = NO`
    - `APP798 GROUP everyone View = NO`
  - Access to App798 is restricted to authorized HR/Admin personnel to protect sensitive evaluation audit snapshots.
  - If an arbitrary employee (evaluatee or evaluator) initiates an evaluation workflow action, their OAuth access token carries only that employee's user permissions.
  - Executing `POST /k/v1/record.json` for App798 with the employee's OAuth token results in an HTTP `403 Forbidden` (`GAIA_IL01` / `CB_NO02` - Permission Denied).
  - To enable user OAuth tokens to write App798, App798 permissions would have to be opened (`GROUP everyone Add = YES`), which violates established baseline security and exposes audit records to untrusted creation.
- **Verdict**:
  - `APP798_WRITE_UNDER_OAUTH_USER_AUTHORITY = NOT_PROVEN`

---

### Question 4 — Archived_By Exact Identity Derivation
- **Question**: Can the backend populate App798 `Archived_By` with the exact Kintone human identity derived independently from OAuth authority?
- **Finding**:
  - Because Question 2 failed (`OAUTH_BACKEND_EXACT_USER_IDENTITY = NOT_PROVEN`), the backend cannot obtain a verified `user_code` from the token alone.
  - Deriving `Archived_By` would require accepting an unauthenticated caller parameter (e.g. from browser JavaScript `kintone.getLoginUser().code`), which violates the non-repudiation and anti-spoofing requirements of D3-008.
  - Additionally, because Question 3 failed (`APP798_WRITE_UNDER_OAUTH_USER_AUTHORITY = NOT_PROVEN`), the write itself cannot execute under the end-user's token, preventing `$creator` from serving as the authoritative native actor.
- **Verdict**:
  - `ARCHIVED_BY_FROM_OAUTH_IDENTITY = NOT_PROVEN`

---

### Question 5 — Process Transition Under User OAuth Authority
- **Question**: Can the same OAuth authority perform the required App794 Process Management status transition?
- **Finding**:
  - The Kintone OAuth scope `k:app_record:write` explicitly encompasses `PUT /k/v1/record/status.json` ("1件のレコードのステータスを更新する").
  - The operation executes under the user's authority, checking the user's transition privileges in App794 Process Management settings and recording that user in the record's `$modifier` and status history.
- **Verdict**:
  - `PROCESS_TRANSITION_VIA_USER_OAUTH = PROVEN_SUPPORTED`

---

### Question 6 — Same-Subject Continuity
- **Question**: Can the backend prove that App798 archive write authority and App794 Process Management transition authority belong to the same exact OAuth-authorized Kintone user?
- **Finding**:
  - Due to the permission blocker on App798 (Question 3), App798 cannot be written with the employee's OAuth token.
  - If App798 is written using a privileged service token (Trusted Writer) while App794 is transitioned using the user's OAuth token, the dual-authority split persists:
    - App798 `Archived_By` reflects the service token (or an unauthenticated assertion).
    - App794 reflects the user.
  - Furthermore, without OAuth token introspection or user extraction (Question 2), the backend cannot programmatically attest that both actions are bound to the same human identity.
- **Verdict**:
  - `SAME_OAUTH_SUBJECT_FOR_ARCHIVE_AND_TRANSITION = NOT_PROVEN`

---

### Question 7 — Ordering, Partial Failure & Transaction Semantics
- **Question**: Can a two-step REST sequence (Archive Prepare -> App798 Write -> App794 Status Transition) be designed safely to handle partial failures?
- **Finding**:
  - **Ordering**: The sequence strictly enforces `ARCHIVE_BEFORE_TRANSITION = MANDATORY`.
  - **Deduplication / Idempotency**: Using `ARCHIVE_KEY_IDEMPOTENT_EVENT_IDENTITY = YES` guarantees that repeated requests with the same key will not create duplicate rows in App798.
  - **Partial Failure Handling**:
    - If App798 write fails: Entire operation aborts; transition is not attempted; fail-closed.
    - If App798 succeeds but App794 transition fails (network timeout, concurrent lock): A retry with the identical archive key verifies existing App798 archive existence and re-attempts the transition without re-inserting.
  - **Cross-App Atomicity Limitation**: Kintone REST API does not provide multi-app distributed transaction rollback (ACID). If transition fails permanently (e.g. invalid action name, permission revoked), the App798 archive record remains as an orphaned snapshot unless compensated. However, compensation design patterns are feasible at the application layer.
- **Verdict**:
  - `OAUTH_TRANSACTION_PARTIAL_FAILURE_SAFETY = PROVEN_DESIGNABLE`

---

### Question 8 — Token Security & Credential Boundary
- **Question**: Does this architecture maintain privileged secrets outside the browser?
- **Finding**:
  - Cybozu OAuth Authorization Code Grant requires the client secret and token endpoint exchange to occur server-to-server.
  - Browser JavaScript receives only authorization codes and redirects to the trusted backend.
  - OAuth client secret and refresh tokens reside exclusively in secure backend storage.
- **Verdict**:
  - `OAUTH_PRIVILEGED_SECRET_LOCATION = TRUSTED_BACKEND_ONLY`

---

### Question 9 — Deployment & Infrastructure Impact
- **Question**: What infrastructure mutations or operational additions would this architecture require if ratified?
- **Finding**:
  1. **OAuth Client Registration**: Registration of a confidential OAuth client in cybozu.com common administration (subject to the 20-client limit).
  2. **User Authorization Lifecycle**: Every Kintone user must undergo an interactive OAuth authorization consent flow (`STEP2 / STEP3`), requiring token storage, session linking, and refresh handling.
  3. **Backend Vault**: Encrypted database/store for managing per-user refresh tokens.
  4. **ACL Adjustments**: Without external identity bridging, App798 ACL would require granting Add permissions to all workflow participants, weakening archive isolation.
  5. **No New External IdP**: The flow relies solely on Cybozu OAuth, so no third-party identity provider (Auth0, Okta, Entra ID) is introduced at this layer.
- **Verdict**:
  - `NEW_INFRASTRUCTURE_REQUIRED = YES`
  - `NEW_IDENTITY_PROVIDER_REQUIRED = NO`

---

## 5. Decision Bar Evaluation

### Evaluation Against Criteria:
| Required Critical Link | Evaluation Result | Status |
| :--- | :--- | :--- |
| **Human User -> Official OAuth Authorization** | Supported via Authorization Code Grant | **PROVEN** |
| **Backend Independently Resolves Exact Kintone User** | No ID token, no userinfo, User API rejects OAuth | **NOT_PROVEN** |
| **Same User Authority Writes App798** | App798 Everyone Add = NO; normal users fail 403 | **NOT_PROVEN** |
| **Archived_By Derived Authoritatively** | Dependent on backend identity extraction | **NOT_PROVEN** |
| **Same User Authority Performs Process Transition** | Scope `k:app_record:write` supports PUT status | **PROVEN** |
| **Same-Subject Continuity Across Both Calls** | Cannot introspect subject; App798 write fails | **NOT_PROVEN** |
| **Archive Occurs Before Transition** | Bounded sequence enforces order | **PROVEN** |
| **Retry / Conflict / Partial Failure Safe** | Idempotent key deduplication designable | **PROVEN** |
| **No Privileged Browser Secret** | Confidential client secrets backend-only | **PROVEN** |
| **Preserve App798 Everyone Add/View = NO** | Incompatible with ordinary employee OAuth tokens | **NOT_PROVEN** |

### Decision Gate Result:
Because critical links in the trust chain fail verification:
- `NATIVE_USER_OAUTH_TRANSACTION_TRUST_CHAIN = NOT_PROVEN`
- `ARCHIVED_BY_EXACT_ACTOR_PROOF = NOT_PROVEN`
- `ARCHITECTURE_DECISION_RESULT = ARCHITECTURE_DECISION_NOT_READY`
- `RECOMMENDED_CANDIDATE_FOR_OWNER_RATIFICATION = NONE`

---

## 6. Terminal Recommendation & Owner Business Decision

This package represents the **final native-Kintone actor architecture research gate**.
Comprehensive investigation across all native Kintone platform surfaces establishes:
1. **Client-side JavaScript API**: Accesses actor and status history, but runs in untrusted browser context.
2. **Kintone Webhooks**: Delivery envelope lacks dedicated transition actor fields; logs lack programmatic server query API.
3. **Cybozu Audit Logs**: Expose user/action, but lack programmatic real-time query API and exact-event binding.
4. **Kintone Native OAuth 2.0**: Binds tokens to users internally, but provides no backend identity introspection/userinfo endpoint, and cannot write to restricted audit apps (App798) under ordinary employee credentials without violating ACL isolation.

Therefore, native Kintone capabilities **cannot** satisfy the dual requirements of:
- Independent backend actor attestation without browser trust.
- App798 restricted audit isolation (`APP798 GROUP everyone Add = NO`).

### Mandatory Control Directive:
- `NO_MORE_NATIVE_ACTOR_RESEARCH = YES`
- `OWNER_BUSINESS_DECISION_REQUIRED = YES`

### Owner Decision Options:
1. **OPTION A: EXTERNAL_TRUSTED_IDENTITY_BOUNDARY**
   - Introduce an external trusted identity boundary (e.g. enterprise OIDC/SAML provider, corporate single-sign-on token, or trusted session gateway) where the backend independently validates the human identity via signed JWT/IdP claims, verifies authorization, writes App798 via privileged Trusted Writer credentials, and attributes `Archived_By` to the attested IdP identity.
2. **OPTION B: AMEND_D3_008_ARCHIVED_BY_REQUIREMENT**
   - Formally amend D3-008 control requirements to recognize that in a secure Trusted Writer architecture with restricted App798 ACL:
     - `Archived_By` records the authoritative write subsystem (`SYSTEM_TRUSTED_WRITER`).
     - The business initiator / transition actor is captured as caller-attested payload metadata (`Initiated_By_Assertion`), backed by App794 native process status history and cybozu.com audit logs for non-repudiation.

Neither Option A nor Option B is selected by this package. Both require Owner business ratification.

---

## 7. Absolute Stop & Execution Boundary

```text
CONTROL_DOCS_CHANGED = 0
SOURCE_FILES_CHANGED = 0
TEST_FILES_CHANGED = 0
DIST_FILES_CHANGED = 0
SCRIPT_FILES_CHANGED = 0

KINTONE_READS = 0
KINTONE_WRITES = 0
APP794_READS = 0
APP794_WRITES = 0
APP798_READS = 0
APP798_WRITES = 0

OAUTH_CLIENT_REGISTRATIONS = 0
OAUTH_AUTHORIZATIONS = 0
TOKEN_EXCHANGES = 0
WEBHOOK_REGISTRATIONS = 0
DEPLOYMENTS = 0
BUSINESS_UAT_ACTIONS = 0
EXTERNAL_INFRA_MUTATIONS = 0

OWNER_RATIFIED_ARCHITECTURE = NONE
IMPLEMENTATION_AUTHORIZED = NO
DEPLOYMENT_AUTHORIZED = NO
NEXT_GATE_AUTHORIZED = NO
AUTO_START_NEXT_WORK_PACKAGE = NO

FINAL_STATE = STOP FOR INDEPENDENT CONTROL PLANE REVIEW
```
