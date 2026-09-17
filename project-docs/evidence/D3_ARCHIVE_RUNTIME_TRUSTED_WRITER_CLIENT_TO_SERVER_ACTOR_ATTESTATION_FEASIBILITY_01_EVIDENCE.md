# Evidence: D3 Archive Runtime Trusted Writer Client-to-Server Actor Attestation Feasibility 01

## Document Control
- **Package**: `D3-ARCHIVE-RUNTIME-TRUSTED-WRITER-CLIENT-TO-SERVER-ACTOR-ATTESTATION-FEASIBILITY-01`
- **Authorization ID**: `MBO2026-D3-ARCHIVE-RUNTIME-TRUSTED-WRITER-CLIENT-TO-SERVER-ACTOR-ATTESTATION-FEASIBILITY-01-20260917-OWNER-01`
- **Base HEAD**: `eb99c79498e941d54220b93b0b94fff7ca57bace`
- **Mode**: `OFFICIAL_DOCUMENTATION_FEASIBILITY_ONLY / NO IMPLEMENTATION / NO LIVE I/O`
- **Locked Governance**:
  - `OWNER_RATIFIED_ARCHITECTURE = NONE`
  - `ARCHITECTURE_DECISION_RESULT = ARCHITECTURE_DECISION_NOT_READY`
  - `RECOMMENDED_CANDIDATE_FOR_OWNER_RATIFICATION = NONE`
  - `IMPLEMENTATION_AUTHORIZED = NO`
  - `DEPLOYMENT_AUTHORIZED = NO`
  - `UAT_AUTHORIZED = NO`
  - `APP798 GROUP everyone Add = NO`
  - `APP798 GROUP everyone View = NO`
  - `BROWSER_PRIVILEGED_SECRET = FORBIDDEN`
  - `APP794_ROUTE_SNAPSHOT_REUSE_BEFORE_ARCHIVE_SUCCESS = FORBIDDEN`
  - `ARCHIVE_HASH_CONFLICT = FAIL_CLOSED`
  - `ARCHIVE_ACTOR_NOT_RESOLVED = FAIL_CLOSED`

---

## Executive Summary & Core Verdict

The objective of this investigation is strictly to determine whether there is an officially supported mechanism by which a trusted backend can independently verify the exact Kintone human user who performed a specific Process Management transition **without trusting unverified identity assertions supplied by browser JavaScript**.

### Formal Evaluation Verdict
```text
ACTOR_ATTESTATION_FEASIBILITY = NOT_PROVEN
SUPPORTED_MECHANISM = NONE_PROVEN
ARCHIVED_BY_EXACT_ACTOR_PROOF = NOT_PROVEN

CRITICAL_UNRESOLVED_BLOCKERS =
1. UPDATE_STATUS webhook payload lacks actor/executor identity (only contains record, status, action, and new assignee).
2. Kintone webhooks provide no cryptographic origin validation (no HMAC, digital signature, mTLS, or shared secret).
3. Process Management status history (assignees/action author) is supported ONLY via client-side JavaScript API (kintone.app.record.getStatusHistory); server REST API (/k/v1/record/status.json) is PUT-only with no GET history endpoint.
4. Browser session cookies and kintone.getLoginUser() cannot be attested to an external backend without exposing privileged session credentials or trusting client-asserted payloads.
5. Cybozu OAuth 2.0 is Authorization Code Grant for API delegation only; it provides NO OpenID Connect (OIDC) ID token, NO userinfo endpoint, NO token introspection endpoint, and NO verifiable subject token.
6. Cybozu audit logs are manual UI export/download only; NO synchronous or programmatic server API exists to query the actor of a process transition in real time.
7. kintone.proxy() is an outbound HTTP client relay; it provides NO platform-signed user assertion or cryptographic attestation header.

ARCHITECTURE_DECISION_RESULT = ARCHITECTURE_DECISION_NOT_READY
RECOMMENDED_CANDIDATE_FOR_OWNER_RATIFICATION = NONE
OWNER_RATIFIED_ARCHITECTURE = NONE
IMPLEMENTATION_AUTHORIZED = NO
DEPLOYMENT_AUTHORIZED = NO
NEXT_GATE_AUTHORIZED = NO
AUTO_START_NEXT_WORK_PACKAGE = NO
FINAL_STATE = STOP FOR INDEPENDENT CONTROL PLANE REVIEW
```

---

## Detailed Research Findings by Question

### Research Question A — UPDATE_STATUS Webhook Payload & Semantics
- **Source Title**: Webhookの通知内容 (Webhook Notification Contents)
- **Source URL**: `https://jp.kintone.help/k/ja/id/040602`
- **Access Date**: 2026-09-17
- **Documented Capability**:
  - Kintone triggers webhooks on record creation (`ADD_RECORD`), record editing (`EDIT_RECORD`), comment creation (`ADD_COMMENT`), and status updates (`UPDATE_STATUS`).
  - When a status transition occurs, the payload JSON contains:
    - `type`: `"UPDATE_STATUS"`
    - `app`: app object (`id`, `name`)
    - `record`: record object with current field values
    - `action`: action name (string)
    - `status`: status string
    - `assignee`: assignee object (`code`, `name`) representing the **assigned user for the next status**, NOT the actor who triggered the transition.
- **Documented Limitation**:
  - The `UPDATE_STATUS` webhook payload contains **NO actor, executor, user, or modifier** field.
  - The `assignee` field in the webhook refers to the user designated to process the *next* step, not the human user who clicked the action button.
- **Direct Evidence or Inference**: **Direct Evidence**. The official webhook notification schema does NOT provide the identity of the transition executor. The backend cannot determine from the webhook alone who clicked the button.
- **Finding**:
  ```text
  UPDATE_STATUS_WEBHOOK_ACTOR_DATA = NONE
  ```

### Research Question B — Webhook Origin Authenticity & Cryptographic Attestation
- **Source Title**: Webhookを設定する (Configuring Webhooks) / Webhookの通知内容
- **Source URL**: `https://jp.kintone.help/k/ja/id/040600` / `https://jp.kintone.help/k/ja/id/040602`
- **Access Date**: 2026-09-17
- **Documented Capability**:
  - Kintone sends an HTTP POST request to the configured destination URL with payload `Content-Type: application/json`.
- **Documented Limitation**:
  - There is **no HMAC-SHA256 signature** header (such as `X-Kintone-Signature` or `X-Hub-Signature`).
  - There is **no platform-signed JWT or bearer token**.
  - There is **no mutual TLS (mTLS)** client certificate provided by Kintone.
  - There is **no shared-secret configuration parameter** provided in Kintone Webhook settings.
  - While cybozu.com publishes an egress IP list, IP filtering alone is vulnerable to spoofing/proxy hops and does not provide cryptographic payload authentication.
- **Direct Evidence or Inference**: **Direct Evidence** from official configuration parameters and notification specifications.
- **Finding**:
  ```text
  WEBHOOK_CRYPTOGRAPHIC_ORIGIN_ATTESTATION = NOT_PROVEN
  ```

### Research Question C — Status History (Client vs Server REST API)
- **Source Title 1**: レコードのステータス履歴を取得する (kintone.app.record.getStatusHistory)
  - **URL**: `https://cybozu.dev/ja/kintone/docs/js-api/record/get-status-history/`
  - **Access Date**: 2026-09-17
  - **Documented Capability**: `kintone.app.record.getStatusHistory(offset, limit)` runs in the browser client context (Record Details screen). It returns an array of transition entries, each containing `status`, `changedAt`, and `assignees` (`code`, `name`).
  - **Documented Limitation**: Client-side JavaScript API only. Execution requires an active browser session on the record detail page.
- **Source Title 2**: 1件のレコードのステータスを更新する (Update Status REST API)
  - **URL**: `https://cybozu.dev/ja/kintone/docs/rest-api/records/update-status/`
  - **Access Date**: 2026-09-17
  - **Documented Capability**: `/k/v1/record/status.json` accepts `PUT` to advance or change status.
  - **Documented Limitation**: Endpoint `/k/v1/record/status.json` and `/k/v1/records/status.json` support **ONLY `PUT`**. There is **NO `GET` method** to retrieve status history or past transition actors via REST API.
- **Direct Evidence or Inference**: **Direct Evidence**.
- **Distinction Recorded**:
  ```text
  STATUS_HISTORY_CLIENT_ACCESS = PROVEN_SUPPORTED
  STATUS_HISTORY_CLIENT_CONTEXT = KINTONE_RECORD_SCREEN_JAVASCRIPT_API
  STATUS_HISTORY_CLIENT_WORKER_DATA = PROVEN_AVAILABLE
  STATUS_HISTORY_CLIENT_WORKER_FIELDS = assignees[].code + assignees[].name
  STATUS_HISTORY_CLIENT_EVENT_CONTEXT_FIELDS = changedAt + status
  STATUS_HISTORY_SERVER_REST_ACCESS = PROVEN_UNSUPPORTED
  RECORD_STATUS_REST_HISTORY_READ = PROVEN_UNSUPPORTED
  SERVER_TRUSTED_HISTORY_ATTESTATION = NOT_PROVEN
  ```

### Research Question D — Session Authentication & Current User
- **Source Title**: ログインユーザーの情報を取得する (kintone.getLoginUser)
- **Source URL**: `https://cybozu.dev/ja/kintone/docs/js-api/kintone/get-login-user/`
- **Access Date**: 2026-09-17
- **Documented Capability**: `kintone.getLoginUser()` returns current logged-in user object (`id`, `code`, `name`, `email`, etc.) in the browser context.
- **Documented Limitation**:
  - The returned object is a plain JavaScript memory structure with no cryptographic signature, no token, and no proof of work.
  - Forwarding the browser's session cookies (`JSESSIONID`, `user-cookie`, etc.) to a third-party backend violates Kintone security architecture and credential isolation boundaries.
  - There is no official REST API that accepts a browser session cookie from an external server to validate user identity without exposing privileged session tokens.
- **Direct Evidence or Inference**: **Direct Evidence**.
- **Finding**:
  ```text
  SESSION_TO_BACKEND_USER_ATTESTATION = NOT_PROVEN
  ```

### Research Question E — Cybozu OAuth 2.0
- **Source Title**: OAuthクライアントを追加する (Adding OAuth Clients) / kintoneのOAuthスコープ
- **Source URL**: `https://cybozu.dev/ja/common/docs/oauth-client/add-client/` / `https://cybozu.dev/ja/common/docs/oauth-client/scope-kintone/`
- **Access Date**: 2026-09-17
- **Documented Capability**:
  - Supports RFC 6749 Authorization Code Grant (`response_type=code`, `grant_type=authorization_code`, `grant_type=refresh_token`).
  - Issues an opaque `access_token` (`token_type: "bearer"`, TTL 3600s) and long-lived `refresh_token`.
  - Client type supported: Confidential Client (`client_secret` required on token exchange).
- **Documented Limitation**:
  - **No OpenID Connect (OIDC)** support: No `openid` scope, no `id_token` (JWT), no UserInfo endpoint (`/oauth2/userinfo`), no JWKS discovery (`.well-known/openid-configuration`).
  - **No Token Introspection**: No RFC 7662 introspection endpoint to query token metadata, user identity, or active status.
  - Access token is an opaque bearer token meant strictly for Kintone REST API authorization, not identity attestation.
  - Does NOT support public clients with PKCE for single-page browser apps without exposing client secrets or relying on full web redirection hops.
- **Direct Evidence or Inference**: **Direct Evidence**.
- **Finding**:
  ```text
  OAUTH_USER_IDENTITY_ATTESTATION = NOT_PROVEN
  ```

### Research Question F — Audit Log Server API
- **Source Title**: 監査ログを閲覧する / 監査ログをダウンロードする (Viewing and Downloading Audit Logs)
- **Source URL**: `https://jp.kintone.help/general/ja/admin/list_systemadmin/list_audit/audit` / `https://jp.kintone.help/general/ja/admin/list_systemadmin/list_audit/download_audit`
- **Access Date**: 2026-09-17
- **Documented Capability**: Cybozu records audit events for user logins, record operations, and administrative tasks. Audit logs contain user login name, action, module, and timestamp.
- **Documented Limitation**:
  - Audit log access is provided strictly through the **cybozu.com System Administration Web UI** for manual viewing or CSV/ZIP batch download.
  - Cybozu User API (`/v1/users.json`, etc.) has **NO endpoint for querying or streaming audit logs**.
  - No real-time or synchronous REST API exists for a backend to fetch an event-scoped audit entry during a workflow transition.
- **Direct Evidence or Inference**: **Direct Evidence**.
- **Finding**:
  ```text
  AUDIT_LOG_SERVER_API = PROVEN_UNSUPPORTED
  ```

### Research Question G — kintone.proxy() & Outbound Relays
- **Source Title**: 外部のAPIを実行する (kintone.proxy)
- **Source URL**: `https://cybozu.dev/ja/kintone/docs/js-api/proxy/kintone-proxy/`
- **Access Date**: 2026-09-17
- **Documented Capability**: Allows browser JavaScript to issue HTTP GET, POST, PUT, DELETE requests to external server URLs via Cybozu proxy servers.
- **Documented Limitation**:
  - `kintone.proxy()` acts strictly as an HTTP forwarder to avoid CORS restrictions.
  - It does **NOT inject any authenticated Cybozu user identity token, HMAC signature, or client certificate**.
  - Any headers and body sent via `kintone.proxy()` are constructed entirely by client JavaScript and can be arbitrarily manipulated or spoofed by a user via browser DevTools.
- **Direct Evidence or Inference**: **Direct Evidence**.
- **Finding**:
  ```text
  KINTONE_PROXY_USER_ATTESTATION = NOT_PROVEN
  ```

### Research Question H — External IdP / OIDC Comparator
- **Assessment**:
  - As an architectural comparator only, an external corporate Identity Provider (e.g. Microsoft Entra ID, Okta, Google Workspace) with an OIDC Authorization Code Flow + PKCE could issue an RFC 7519 signed JWT `id_token` containing a cryptographically verifiable `sub`/`email`/`preferred_username` claim that an external backend can independently verify against the IdP's public JWKS.
  - **Governance Limitation**: Evaluated strictly as a theoretical reference point. Under the locked project baseline:
    - No external IdP integration is authorized or ratified.
    - No assumption of corporate SAML/IdP account mapping can be made.
    - No infrastructure or app registration exists.
- **Finding**:
  ```text
  EXTERNAL_IDP_COMPARATOR = THEORETICALLY_CAPABLE_BUT_UNRATIFIED_AND_OUT_OF_SCOPE
  ```

---

## Threat Model Evaluation Matrix

| Threat ID | Threat Vector | Evaluation against Native Kintone Mechanisms | Result |
| :--- | :--- | :--- | :--- |
| **TM-01** | Authenticated malicious employee using DevTools | Can edit JavaScript variables, tamper with `kintone.getLoginUser()`, forge `userCode` | **VULNERABLE** |
| **TM-02** | Forged userCode assertion | Any user identity payload sent from browser to backend is unauthenticated | **VULNERABLE** |
| **TM-03** | Forged `assignees[]` in client status history | Browser can construct arbitrary JSON and post to backend | **VULNERABLE** |
| **TM-04** | Forged status-history payload | Backend cannot cross-verify against REST status history endpoint (endpoint does not exist) | **VULNERABLE** |
| **TM-05** | Replay of valid client evidence | Captured payload from User A replayed during User B's transition | **VULNERABLE** |
| **TM-06** | Cross-record substitution | Client assertion captured on Record X submitted for Record Y | **VULNERABLE** |
| **TM-07** | Stale history entry | Client reads prior transition assignee instead of current transition | **VULNERABLE** |
| **TM-08** | Concurrent transition race | Two users transition simultaneously; client history read races | **VULNERABLE** |
| **TM-09** | Browser compromise / extension tampering | Client execution environment untrusted by definition | **VULNERABLE** |
| **TM-10** | Webhook spoofing | Webhook lacks HMAC/digital signature; attacker posts fake `UPDATE_STATUS` | **VULNERABLE** |
| **TM-11** | Webhook replay | Webhook has no timestamp signature or nonce; can be replayed | **VULNERABLE** |
| **TM-12** | Backend credential compromise | If browser holds privileged App798 secret, compromise is immediate | **FAIL-CLOSED** (Forbidden by baseline) |
| **TM-13** | Missing actor in webhook | Webhook lacks transition actor; backend cannot deduce actor | **FAIL-CLOSED** (`ARCHIVE_ACTOR_NOT_RESOLVED`) |
| **TM-14** | Service outage / network drop | Partial archive attempt; cannot resolve actor | **FAIL-CLOSED** |
| **TM-15** | Retry after partial archive attempt | Route snapshot reuse forbidden; cannot safely resolve actor | **FAIL-CLOSED** |

---

## Required Invariant Truth Table

| Invariant Item | Required Contract | Evaluated Truth | Status |
| :--- | :--- | :--- | :---: |
| `STATUS_HISTORY_CLIENT_ACCESS` | `PROVEN_SUPPORTED` | `PROVEN_SUPPORTED` | PASS |
| `STATUS_HISTORY_CLIENT_CONTEXT` | `KINTONE_RECORD_SCREEN_JAVASCRIPT_API` | `KINTONE_RECORD_SCREEN_JAVASCRIPT_API` | PASS |
| `STATUS_HISTORY_CLIENT_WORKER_DATA` | `PROVEN_AVAILABLE` | `PROVEN_AVAILABLE` | PASS |
| `STATUS_HISTORY_CLIENT_WORKER_FIELDS` | `assignees[].code + assignees[].name` | `assignees[].code + assignees[].name` | PASS |
| `STATUS_HISTORY_CLIENT_EVENT_CONTEXT_FIELDS` | `changedAt + status` | `changedAt + status` | PASS |
| `STATUS_HISTORY_SERVER_REST_ACCESS` | `PROVEN_UNSUPPORTED` | `PROVEN_UNSUPPORTED` | PASS |
| `RECORD_STATUS_REST_HISTORY_READ` | `PROVEN_UNSUPPORTED` | `PROVEN_UNSUPPORTED` | PASS |
| `CLIENT_TO_SERVER_TRUSTED_ACTOR_ATTESTATION` | Must be proven supported or not proven | `NOT_PROVEN` | PASS |
| `WEBHOOK_CRYPTOGRAPHIC_ORIGIN_ATTESTATION` | Must be proven supported or not proven | `NOT_PROVEN` | PASS |
| `SERVER_SIDE_EXACT_TRANSITION_ACTOR` | Must be proven supported or not proven | `NOT_PROVEN` | PASS |
| `ARCHIVED_BY_EXACT_ACTOR_PROOF` | Must be proven supported or not proven | `NOT_PROVEN` | PASS |
| `ACTOR_ATTESTATION_FEASIBILITY` | Evaluated against complete trust chain | `NOT_PROVEN` | PASS |
| `ARCHITECTURE_DECISION_RESULT` | Preserved baseline | `ARCHITECTURE_DECISION_NOT_READY` | PASS |
| `RECOMMENDED_CANDIDATE_FOR_OWNER_RATIFICATION`| Preserved baseline | `NONE` | PASS |
| `OWNER_RATIFIED_ARCHITECTURE` | Preserved baseline | `NONE` | PASS |

---

## Conclusion & Next Steps

Because no complete native Kintone trust chain exists from a Process Management transition to an independent backend verification:
- **`ACTOR_ATTESTATION_FEASIBILITY = NOT_PROVEN`**
- **`ARCHIVED_BY_EXACT_ACTOR_PROOF = NOT_PROVEN`**
- **`ARCHITECTURE_DECISION_RESULT = ARCHITECTURE_DECISION_NOT_READY`**

Under strict project governance, Hermes Agent ceases all operations and stops for independent Control Plane review. No implementation, deployment, or auto-start is authorized.
