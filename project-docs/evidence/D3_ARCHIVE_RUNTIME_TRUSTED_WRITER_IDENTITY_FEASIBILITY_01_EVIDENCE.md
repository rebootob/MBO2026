# Evidence: D3 Archive Runtime Trusted Writer Identity Feasibility 01

## Document Control
- **Package**: `D3-ARCHIVE-RUNTIME-TRUSTED-WRITER-IDENTITY-FEASIBILITY-01`
- **Base HEAD**: `bc86b97e793911ad71999288ee44928749978104`
- **Mode**: `READ_ONLY_RESEARCH_DOCS_ONLY`
- **Owner Authorization**: `APPROVED`
- **Scope Control**: `STRICT (SCOPE_EXPANSION_AUTHORIZED = NO)`
- **Identity Feasibility Result**: `IDENTITY_MODEL_NOT_PROVEN`
- **Owner Ratified Architecture**: `NONE`
- **Implementation Authorized**: `NO`
- **Deployment Authorized**: `NO`
- **Full D3 Business UAT**: `NOT_PROVEN`
- **D3 Closure**: `NOT_CLAIMED`
- **Production Ready**: `NO`
- **Next Gate Authorized**: `NO`
- **Auto Start Next Work Package**: `NO`

---

## 1. Governance & Authority Baseline

- **Authorized Baseline Safe-Stop**:
  - Commit: `79e8687b7e23e43a4a7ca4b17d234fd084284a21`
  - Status: `PASS_SAFE_STOP`
  - Stop Reason: `ARCHIVE_TRUSTED_WRITE_ARCHITECTURE_DECISION_REQUIRED`
- **Prior Reconciled Commits**:
  - Commit `6b64ceef668dec45d92123715783289f800dc49f`: `NON_AUTHORITATIVE_EXPLORATORY_OUTPUT`
  - Commit `a69034f29827157297de368af386aa07134b81de`: `NON_AUTHORITATIVE_EXPLORATORY_OUTPUT`
  - Reconciled by: `bc86b97e793911ad71999288ee44928749978104` (`docs(d3): reconcile unauthorized trusted writer auto-start`)
- **Standing Architecture Constraints**:
  - `D3_TAWS_STATUS = RESEARCH_ONLY`
  - `OWNER_RATIFIED_ARCHITECTURE = NONE`
  - `CYBOZU_OAUTH2_USER_BOUND_TOKEN = UNPROVEN`
  - `ARCHITECTURE_DECISION = BLOCKED_MORE_INFORMATION_REQUIRED`

---

## 2. Repository Facts Inspected

1. `project-docs/D3_ARCHIVE_RUNTIME_TRUSTED_WRITER_ARCHITECTURE_DECISION_01.md`:
   - Identified proposed D3-TAWS backend relying on `CYBOZU_OAUTH2_USER_BOUND_TOKEN` as the identity mechanism between App794 browser and trusted writer backend.
   - Flagged that OAuth public client / PKCE / identity validation was unproven.
2. `project-docs/evidence/D3_ARCHIVE_RUNTIME_AUTHORIZATION_MODEL_CORRECTIVE_01_EVIDENCE.md`:
   - Confirmed direct App798 write fails for non-HR employees because GROUP `everyone` has `Add = NO`, `View = NO`.
   - Confirmed browser privileged credentials (API tokens, admin passwords, shared HMAC keys) are strictly forbidden.
3. `project-docs/evidence/D3_ARCHIVE_RUNTIME_UNAUTHORIZED_AUTO_START_RECONCILIATION_01_EVIDENCE.md`:
   - Confirmed all exploratory research commits remain non-authoritative.
4. `src/server/mbo-gateway-server.js` & `src/services/mbo-employee-self-gateway.js`:
   - Gateway currently supports Mode 2 authentication via LINE LIFF ID Token (OpenID Connect verified against LINE OAuth2 servers), mapped through App801 (`APP_EMPLOYEE_MAPPING`).
   - Gateway provides zero native session authentication for Mode 1 (desktop Kintone browser actors).
5. `src/main-mbo-app.js`:
   - Lines 1300-1360: Workflow proceed event (`app.record.detail.process.proceed`) returns a Promise and executes synchronous archive before permitting process management state change, enforcing fail-closed cancellation if archiving fails.

---

## 3. Authoritative External Sources Reviewed

1. **Cybozu Developer Network — Adding OAuth Clients (`OAuthクライアントを追加する`)**:
   - URL: `https://cybozu.dev/ja/common/docs/oauth-client/add-client/`
   - Access Date: 2026-09-17
   - Status: Official Documentation
   - Finding: Cybozu OAuth 2.0 explicitly supports **only** Confidential Clients (`クライアントタイプはConfidential Clientに対応しています`) and Authorization Code Grant (`グラントタイプはAuthorization Code Grant（認可コードグラント）に対応しています`). The token endpoint `POST /oauth2/token` strictly mandates `Authorization: Basic Base64(client_id:client_secret)` alongside `grant_type=authorization_code`. Public Clients are **not** supported. RFC 7636 (PKCE) is **not** supported.
2. **Cybozu Developer Network — kintone OAuth Scopes (`kintoneのOAuthスコープ一覧`)**:
   - URL: `https://cybozu.dev/ja/common/docs/oauth-client/scope-kintone/`
   - Access Date: 2026-09-17
   - Status: Official Documentation
   - Finding: Available Kintone OAuth scopes are strictly limited to data/app permissions: `k:app_record:read`, `k:app_record:write`, `k:app_settings:read`, `k:app_settings:write`, `k:file:read`, `k:file:write`. There are **no** user identity scopes (`openid`, `profile`, `user:read`). Token response returns only `{ access_token, token_type, expires_in, scope }` with no `id_token` or user identifier.
3. **Cybozu Developer Network — User API Overview & Authentication (`User APIの認証方式`)**:
   - URL: `https://cybozu.dev/ja/common/docs/user-api/overview/authentication/`
   - Access Date: 2026-09-17
   - Status: Official Documentation
   - Finding: Cybozu User API supports API token authentication, Password authentication, and Session authentication (browser). It does **not** support OAuth bearer token authentication. Furthermore, Cybozu publishes no RFC 7662 OAuth token introspection endpoint.
4. **Cybozu Developer Network — kintone.proxy() API (`kintone.proxy()：外部のAPIを実行する`)**:
   - URL: `https://cybozu.dev/ja/kintone/docs/js-api/proxy/kintone-proxy/`
   - Access Date: 2026-09-17
   - Status: Official Documentation
   - Finding: `kintone.proxy()` is exclusively a server-side forward proxy to bypass browser Same-Origin Policy (CORS). It transmits only the headers and data explicitly supplied by client JavaScript. It attaches **no** user assertion, signed token, or platform session cookie to the outbound request.
5. **Cybozu Developer Network — REST API Authentication Methods (`認証方式`)**:
   - URL: `https://cybozu.dev/ja/kintone/docs/rest-api/overview/authentication/`
   - Access Date: 2026-09-17
   - Status: Official Documentation
   - Finding: Lists supported authentication methods (Password, API Token, OAuth Client, Session). Session authentication is strictly valid from browser JS to Kintone REST API; no mechanism is provided for external servers to validate Kintone session cookies.

---

## 4. Capability-by-Capability Findings (Q1 - Q8)

### Q1 — OAuth Client Model (Public Client / PKCE)
- **Question**: Does current Cybozu/Kintone OAuth support a browser/public-client flow that allows an App794 customization to obtain a user-bound access token without exposing a client secret?
- **Finding**: **PROVEN_UNSUPPORTED**.
- **Evidence**: Cybozu documentation for `OAuthクライアントを追加する` explicitly defines:
  - `クライアントタイプはConfidential Clientに対応しています。` (Confidential Client only)
  - `グラントタイプはAuthorization Code Grant（認可コードグラント）に対応しています。`
  - Token exchange (`/oauth2/token`) mandates client authentication via `Authorization: Basic Base64(client_id:client_secret)`.
  - There is zero documentation or support for Public Clients, PKCE (`code_challenge` / `code_verifier`), or browser-safe token exchange.
  - Embedding `client_secret` in App794 browser code is required to obtain tokens, which directly violates the security non-negotiable banning privileged secrets in the browser.

### Q2 — Token Validation / User Identity Derivation
- **Question**: If a user-bound bearer token exists, can a trusted backend use that token to derive the authenticated Cybozu user identity through an officially supported API?
- **Finding**: **PROVEN_UNSUPPORTED / NOT_PROVEN**.
- **Evidence**:
  - Cybozu OAuth is an OAuth 2.0 authorization framework implementation, **not** an OpenID Connect (OIDC) identity provider.
  - Token endpoint does not return an `id_token`.
  - Scopes are limited to `k:app_record:*`, `k:app_settings:*`, `k:file:*`. No `openid`, `profile`, or `user:read` scopes exist.
  - Cybozu User API (`/v1/user.json`, `/v1/users.json`) does not support OAuth authentication (only Password, API Token, and Session).
  - No RFC 7662 token introspection endpoint (`/oauth2/introspect`) or UserInfo endpoint (`/oauth2/userinfo`) exists.
  - Even if a backend received a bearer token, it has no supported API to verify which user authorized the token.

### Q3 — kintone.proxy() Client Proxy Authentication
- **Question**: Can `kintone.proxy()` transmit an authenticated proof of the current logged-in user to an external backend?
- **Finding**: **PROVEN_UNSUPPORTED**.
- **Evidence**:
  - `kintone.proxy()` only relays HTTP requests from the Kintone server infrastructure to bypass CORS.
  - It forwards only headers and payload supplied by the browser JavaScript call.
  - It does not sign the request, does not inject user claims, and does not attach cryptographic proof of caller identity.
  - Relying on headers populated by browser JavaScript (e.g., `userCode`) constitutes unauthenticated, easily spoofed caller input.

### Q4 — Session Cookie Forwarding
- **Question**: Can the Cybozu browser session/JSESSIONID be securely and officially forwarded to a custom external backend and validated there?
- **Finding**: **PROVEN_UNSUPPORTED**.
- **Evidence**:
  - Cybozu session cookies (`JSESSIONID`, etc.) are scoped to `*.cybozu.com` and flagged `HttpOnly`.
  - Browser JavaScript cannot access `HttpOnly` cookies via `document.cookie`.
  - Browser security models (SameSite, CORS) prevent cross-domain exfiltration of session credentials.
  - Cybozu provides no public/official API allowing a third-party server to validate session cookies.
  - Scraping or reverse-engineering session endpoints violates platform terms and security non-negotiables.

### Q5 — Native Signed Identity / Ticket
- **Question**: Does Kintone provide any official signed user assertion, signed proxy ticket, JWT identity token, or server-verifiable current-user ticket?
- **Finding**: **NOT PROVEN / NONE DOCUMENTED**.
- **Evidence**:
  - `kintone.getLoginUser()` returns only a plain, mutable, client-side JavaScript object (`{ id, code, name, email }`).
  - No platform API exists to generate asymmetric signed tokens (JWTs) verifiable via public key.
  - Any symmetric signing in the browser would require embedding a shared secret in client code, which is strictly forbidden.

### Q6 — Existing Gateway Reuse for Mode 1
- **Question**: Can the current repository gateway authenticate existing Mode-1 dedicated Kintone users without App801 secondary login, new credential exchange, browser secrets, or new external identity infrastructure?
- **Finding**: **PROVEN_UNSUPPORTED**.
- **Evidence**:
  - `src/server/mbo-gateway-server.js` and `src/services/mbo-employee-self-gateway.js` authenticate solely via LINE LIFF ID tokens for Mode 2.
  - The gateway has no capability to authenticate native Kintone desktop sessions without introducing either:
    1. Secondary interactive user login (violating constraint).
    2. Shared API secret embedded in App794 (violating constraint).
    3. Integration with an external IdP / SSO (new infrastructure).

### Q7 — Synchronous Fail-Closed Compatibility
- **Question**: Does the identity option support the mandatory synchronous archive-before-transition sequence?
- **Finding**:
  - Client-side event hook `app.record.detail.process.proceed` supports asynchronous Promise returns, allowing blocking pre-transition validation.
  - Asynchronous alternatives (e.g., Kintone Webhooks) trigger strictly **after** the record status change has already committed in Kintone. Webhooks are incompatible because they cannot fail-closed or prevent the workflow transition.
  - However, because client-side pre-transition hooks cannot securely prove caller identity to an external backend without browser secrets, the synchronous chain cannot be completed securely.

### Q8 — App798 Privacy Protection
- **Question**: Can the option preserve `GROUP everyone App798 Add = NO` and `GROUP everyone App798 View = NO`?
- **Finding**:
  - Conceptually, offloading archive writes to a trusted backend would keep App798 direct permissions restricted to administrative accounts (such as `USER hr`).
  - However, because the backend caller identity mechanism is unproven and insecure, this cannot be safely realized.

---

## 5. Feasibility Matrix

| Candidate Identity Mechanism | Supported by Official Docs | Browser Secret Required | Authenticates Actual Caller | Server Can Verify Identity | Synchronous Fail-Closed Compatible | App798 Direct Employee Permission Required | Repository Native | New Infra Required | Security Status | Verdict |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **1. Cybozu OAuth User-Bound Token** | NO (Confidential only) | YES (`client_secret`) | NO (No userinfo API) | NO | YES | NO | NO | YES | INSECURE | **REJECTED** |
| **2. OAuth Auth Code + PKCE / Public Client** | NO (Unsupported) | NO (in PKCE spec) | NO (Platform unsupported) | NO | YES | NO | NO | YES | PLATFORM_UNSUPPORTED | **REJECTED** |
| **3. kintone.proxy() Request Relay** | YES (Proxy only) | YES (to authenticate) | NO (Transmits client data) | NO | YES | NO | YES | YES | INSECURE / SPOOFABLE | **REJECTED** |
| **4. Browser Session Cookie Forwarding** | NO | NO | NO (External validation impossible) | NO | YES | NO | NO | YES | INSECURE / UNSUPPORTED | **REJECTED** |
| **5. Existing mbo-gateway Mode 2 Identity** | YES (for LINE LIFF) | NO | YES (LINE users only) | YES (LINE OIDC) | NO (Incompatible with Mode 1 Kintone desktop) | NO | YES | NO | INAPPLICABLE FOR MODE 1 | **REJECTED** |
| **6. Kintone Webhook / Event Bridge** | YES | NO | PARTIAL (Post-transition) | YES (Webhook token) | NO (Strictly post-event async) | NO | NO | YES | VIOLATES FAIL-CLOSED | **REJECTED** |
| **7. Direct App798 Browser Write (Baseline)** | YES | NO | YES (Kintone session) | N/A (Direct Kintone API) | YES | YES (`everyone` Add/View needed) | YES | NO | VIOLATES APP798 PRIVACY | **REJECTED (Safe-Stop)** |
| **8. Native Signed Identity / Ticket** | NO (Non-existent) | N/A | N/A | N/A | N/A | N/A | N/A | N/A | NOT DOCUMENTED | **NOT PROVEN** |

---

## 6. Detailed Security & Risk Analyses

### Browser-Secret Analysis
- Any design requiring App794 browser customization to authenticate against an external backend (or Cybozu OAuth token endpoint) without user interaction requires a pre-shared secret, API token, or OAuth `client_secret`.
- JavaScript running in user browsers is fully inspectable via DevTools. Secrets embedded in JS bundles, DOM storage, or runtime memory are compromised by definition.
- Therefore, all architectures requiring browser secrets are fundamentally rejected.

### Caller Spoofing Analysis
- If an external backend accepts a plain `userCode` or employee ID parameter from `kintone.proxy()` or `fetch()` without independent cryptographic attestation, any authenticated Kintone user can spoof any other employee's identity by modifying the outbound HTTP request.
- Without a platform-signed token or server-verified bearer token, the trusted writer backend has zero defense against identity impersonation.

### Synchronous Fail-Closed Analysis
- The business requirement mandates that an evaluation phase transition in App794 cannot succeed unless an immutable archive record is durably written to App798.
- Post-event asynchronous mechanisms (Kintone Webhooks, AWS Lambda event listeners, Zapier/Make bridges) execute after the status transition has committed. In the event of backend network failure, schema mismatch, or storage failure, the transition is already final, breaking fail-closed integrity.

### Existing Gateway Reuse Analysis
- The existing gateway in `src/server/mbo-gateway-server.js` was purpose-built for Mode 2 (LINE LIFF employee self-service). It relies on LINE's OpenID Connect infrastructure to verify user identity.
- Native Mode 1 users access Kintone directly via desktop web browsers without LINE. The gateway cannot authenticate Mode 1 users unless they perform a redundant secondary login or bind their accounts to a third-party IdP.

---

## 7. Unsupported & Undocumented Assumptions Disproven

1. **Assumption: Cybozu OAuth supports PKCE for public clients.**
   - **Disproven**: Official Cybozu documentation explicitly confirms that OAuth client registration supports only `Confidential Client`. Token requests mandate HTTP Basic Authentication using `client_id:client_secret`. PKCE is not supported.
2. **Assumption: A Cybozu OAuth access token can be used by a backend to identify the user.**
   - **Disproven**: Cybozu OAuth does not issue OpenID Connect ID tokens, has no `openid` scope, and exposes no token introspection or userinfo endpoint.
3. **Assumption: `kintone.proxy()` provides platform-authenticated external requests.**
   - **Disproven**: `kintone.proxy()` is strictly an HTTP proxy for CORS circumvention. It does not sign requests or attach verified user identity.
4. **Assumption: Kintone provides verifiable client-side identity tickets.**
   - **Disproven**: Kintone JavaScript APIs expose only unsigned client-side objects (`kintone.getLoginUser()`).

---

## 8. Remaining Uncertainties

- Whether Cybozu has any roadmap to support OAuth 2.0 PKCE / OpenID Connect in future platform releases.
- Whether an enterprise Kintone environment utilizing SAML SSO allows extracting an enterprise SAML assertion from the browser session without violating browser security boundaries (currently not documented or supported by Kintone client JS APIs).

---

## 9. Final Decision & Verdict

Under the mandatory decision rule:
> The package may conclude `IDENTITY_MODEL_FEASIBLE_AND_PROVEN` ONLY IF an identity mechanism is supported by authoritative evidence and satisfies ALL required criteria (authenticates caller, server verified, no browser secrets, no caller-supplied userCode trust, synchronous, App798 privacy preserved, authoritative record fetchable, fail-closed, deployable). Otherwise: `IDENTITY_MODEL_NOT_PROVEN`.

### Verdict:
```text
IDENTITY_FEASIBILITY_RESULT = IDENTITY_MODEL_NOT_PROVEN
```

### Summary of Missing Proof & Blockers:
1. **Platform OAuth Limitation**: Cybozu OAuth strictly requires confidential client credentials (`client_secret`), making direct browser-based token acquisition insecure.
2. **Token Identity Gap**: Cybozu OAuth lacks OpenID Connect ID tokens, user profile scopes, and token introspection endpoints, preventing a backend from verifying the authenticating user.
3. **No Native Signed Assertion**: Kintone provides no API to generate verifiable, platform-signed identity assertions from browser customizations.
4. **Asynchronous Incompatibility**: Native Webhooks cannot enforce the required synchronous fail-closed archive-before-transition sequence.

---

## 10. Standing Architecture Control Invariants
- `OWNER_RATIFIED_ARCHITECTURE = NONE`
- `IMPLEMENTATION_AUTHORIZED = NO`
- `DEPLOYMENT_AUTHORIZED = NO`
- `FULL_D3_BUSINESS_UAT = NOT_PROVEN`
- `D3_CLOSURE = NOT_CLAIMED`
- `PRODUCTION_READY = NO`
- `NEXT_GATE_AUTHORIZED = NO`
- `AUTO_START_NEXT_WORK_PACKAGE = NO`
- `FINAL_STATE = STOP FOR INDEPENDENT CONTROL PLANE REVIEW`
