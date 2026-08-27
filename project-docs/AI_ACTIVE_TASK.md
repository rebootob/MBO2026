# AI ACTIVE TASK — D1-C4A FINAL CORRECTIVE: BROWSER TOPOLOGY + PORTABLE STARTUP

> Control Plane: ChatGPT
> Execution Plane: Codex (temporary replacement for Antigravity)
> Repository: `rebootob/MBO2026`
> Canonical integration branch: `ai/antigravity-wp002c`
> Codex execution branch: `ai/codex-d1c3b`
> Reviewed implementation: `1b18defa00451d37c591feff2f3dfa6cfb33b521`
> Mode: MINIMUM RUNTIME CORRECTIVE ONLY / NO KINTONE WRITE / NO DEPLOY / NO ACL CHANGE / NO UI

## 0. INDEPENDENT REVIEW RESULT

Accepted foundation from `1b18defa...`:
- source scope is limited to env contract, one Node HTTP runtime, focused runtime tests and one deployment note;
- configured shared outer Kintone principal is server-controlled and browser injection is rejected;
- raw session token is placed in an HttpOnly cookie and not returned in JSON;
- accepted auth/session/employee-self services are reused rather than duplicated;
- Employee_Code authorization remains trusted-session-only;
- production mode requires Secure cookie + an allowed origin;
- App801/App53/App794 secrets remain server-side;
- Kintone READ/WRITE/DEPLOY counters remain zero;
- no live host deployment occurred.

GitHub has no CI/workflow/status evidence. Do not claim CI PASS.

D1-C4A is NOT accepted yet because the runtime is not topology-neutral/portable enough for the actual browser boundary.

## 1. B1 — CROSS-ORIGIN KINTONE BROWSER PATH IS NOT IMPLEMENTED

Current server accepts `MBO_ALLOWED_ORIGIN` but sends no CORS headers and does not handle OPTIONS preflight.

A Kintone-hosted Employee UI calling a gateway on a different origin will preflight `POST application/json`; current runtime returns 404/no CORS and login cannot reach the gateway.

### Required correction

Implement a minimal exact-origin CORS boundary without a framework:
- never use `*` when cookies/credentials are used;
- if request `Origin` exactly equals configured `MBO_ALLOWED_ORIGIN`, emit:
  - `Access-Control-Allow-Origin: <exact configured origin>`
  - `Access-Control-Allow-Credentials: true`
  - `Vary: Origin`
- handle OPTIONS only for the gateway API with exact allowed origin;
- allow only required methods `GET, POST, OPTIONS` and required request header `Content-Type`;
- disallowed Origin => fail closed (403) for state-changing requests and preflight;
- do not create a generic CORS framework.

Document that browser requests from a distinct origin must use `credentials: include`; no UI implementation is authorized here.

## 2. B2 — COOKIE TOPOLOGY MUST SUPPORT SAME-SITE OR CROSS-SITE SAFELY

Current config accepts only `SameSite=Lax|Strict` and deliberately rejects `None`.

That makes a cross-site Kintone -> gateway session impossible even though final topology has not been chosen.

### Required correction

Allow exactly:
- `Strict`
- `Lax`
- `None`

Rules:
- `SameSite=None` requires `Secure=true` always;
- production always requires `Secure=true`;
- do not default silently to `None`;
- topology remains explicit through environment configuration.

Add focused tests for:
- production `SameSite=None + Secure=true + HTTPS allowed origin` accepted;
- `SameSite=None + Secure=false` rejected;
- `Lax/Strict` remain valid when otherwise safe.

## 3. B3 — PRODUCTION CONFIG FAIL-CLOSED HARDENING

Current parser treats any `NODE_ENV` other than exact `production` as non-production, so a typo like `prod` can silently enable insecure cookie behavior.

Also `MBO_ALLOWED_ORIGIN` and `KINTONE_BASE_URL` are only non-empty strings.

### Required correction

Keep it minimal:
- require `NODE_ENV` to be one of explicit supported values (`production`, `development`, `test`) when parsing runtime environment; unknown value => fail closed;
- production `MBO_ALLOWED_ORIGIN` must be one absolute HTTPS origin only (scheme + host + optional port; no path/query/hash);
- production `KINTONE_BASE_URL` must be a valid HTTPS base URL;
- never log server credential values.

Local tests may still directly inject a config object into `createMboGatewayServer()` without using production env parsing.

## 4. B4 — WINDOWS ENTRYPOINT IS NOT PORTABLE

Current direct-run guard:

```js
import.meta.url === `file://${process.argv[1]}`
```

is not portable for Windows `C:\...` paths.

### Required correction

Use Node URL/path utilities (`pathToFileURL` or equivalent built-in approach) so:

```text
node src/server/mbo-gateway-server.js
```

works as the documented direct entrypoint on both Windows and Linux.

Do not add a framework or OS-specific launcher unless strictly necessary.

## 5. MINIMUM HTTP REGRESSION TESTS STILL REQUIRED

The first C4A tests mock the services but do not yet prove several runtime-boundary requirements from the task.

Add only focused tests for these missing risks:
1. OPTIONS preflight from exact configured origin succeeds with exact CORS headers and credentials support;
2. wrong Origin preflight/state-changing request is denied;
3. first/default login result `ACTIVATION_CODE_REQUIRED` sets NO session cookie;
4. `PASSWORD_CHANGE_REQUIRED` cookie cannot obtain data when the employee gateway/auth composition reports an unauthorized/restricted session;
5. malformed fiscalYear through `/api/mbo/bootstrap` remains `INVALID_ARGUMENT` (use a composed/focused fake that actually enforces the accepted validation, not a mock that always returns success);
6. password change rotates HttpOnly cookie and does not expose token in JSON;
7. logout clears cookie; accepted auth-service session invalidation remains delegated to the already-tested service;
8. response JSON does not expose Password_Hash / Activation_Code_Hash / Session_Token_Hash / raw session token.

Do not duplicate the complete auth/service test suites.

## 6. DEPLOYMENT NOTE CORRECTION

Update the existing `project-docs/D1-C4A_GATEWAY_RUNTIME_DEPLOYMENT.md` only as needed:
- distinguish SAME-SITE vs CROSS-SITE browser topology;
- CROSS-SITE requires exact-origin CORS + browser `credentials: include` + `SameSite=None; Secure`;
- SAME-SITE may use Lax/Strict according to approved topology;
- retain Windows/Linux portability;
- do not claim rollback removes browser/server session state automatically. State that stopping/removing the gateway route makes sessions unusable while stopped; explicit App801 session revocation/clearing, if later required, is a separately authorized Kintone operation.

No new deployment document.

## 7. ALLOWED FILES ONLY

Prefer only:
- `src/server/mbo-gateway-server.js`
- `tests/mbo-gateway-server.test.js`
- `.env.example`
- `project-docs/D1-C4A_GATEWAY_RUNTIME_DEPLOYMENT.md`

No auth/session/activation/employee gateway changes unless a proven interface incompatibility makes it unavoidable. Stop and report before widening source scope.

## 8. OUT OF SCOPE / FORBIDDEN

- no live gateway deployment
- no DNS/TLS provisioning
- no Windows/Linux host changes
- no Kintone schema write
- no App801 field creation
- no credential provisioning
- no App794 ACL change
- no Kintone customization deploy
- no employee UI changes
- no D2-D7 implementation
- no migration
- no unrelated refactor

Mandatory:

```text
KINTONE_WRITES_EXECUTED = 0
KINTONE_DEPLOY_EXECUTED = 0
LIVE_SERVER_DEPLOY_EXECUTED = 0
```

## 9. VERIFICATION

Run:

```bash
npm test -- tests/mbo-gateway-server.test.js
npm test -- tests/mbo-password-service.test.js tests/mbo-identity-service.test.js tests/mbo-auth-session-service.test.js tests/mbo-auth-kintone-repository.test.js tests/mbo-activation-service.test.js tests/mbo-employee-self-gateway.test.js tests/mbo-gateway-server.test.js
npm test
git diff --check
git status --short
```

No CI claim without GitHub CI evidence.

## 10. DELIVERY REPORT

Commit + push only to `ai/codex-d1c3b`.
Maximum implementer status is `IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`.

Report:

```text
CORS_EXACT_ORIGIN = IMPLEMENTED_PENDING_REVIEW
CORS_PREFLIGHT = IMPLEMENTED_PENDING_REVIEW
COOKIE_SAMESITE_TOPOLOGY = STRICT_LAX_NONE_WITH_SECURE_GUARD
PRODUCTION_CONFIG_FAIL_CLOSED = IMPLEMENTED_PENDING_REVIEW
WINDOWS_LINUX_DIRECT_ENTRYPOINT = IMPLEMENTED_PENDING_REVIEW
ACTIVATION_FAILURE_NO_COOKIE = PROVEN_PENDING_REVIEW
RESTRICTED_SESSION_DATA_DENIAL_HTTP = PROVEN_PENDING_REVIEW
MALFORMED_FY_HTTP_DENIAL = PROVEN_PENDING_REVIEW
PORTABLE_RUNTIME_PACKAGE = READY_PENDING_INDEPENDENT_REVIEW
TRUSTED_BACKEND_RUNTIME = NOT_DEPLOYED
APP801_SCHEMA_MANIFEST = EXACT_9_FIELDS_NO_WRITE
APP794_ACL_CUTOVER = BLOCKED_PRIVILEGED_RULES_NOT_PROVEN
KINTONE_READS_EXECUTED = N
KINTONE_WRITES_EXECUTED = 0
KINTONE_DEPLOY_EXECUTED = 0
LIVE_SERVER_DEPLOY_EXECUTED = 0
D1C4A_STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
D1_OVERALL_STATUS = IN_PROGRESS
```

Stop after commit + push. ChatGPT performs independent review.

---

# MANDATORY PROJECT CONTROL — DO NOT DROP

- D1 Login + password change + strict employee data isolation = IN_PROGRESS / D1-A CLOSED / D1-B SOURCE ACCEPTED + UAT ACCESS CHECK RESIDUAL / D1-C1 SOURCE ACCEPTED / D1-C2 EVIDENCE ACCEPTED / D1-C3A PASS / D1-C3B PASS / D1-C4A FINAL CORRECTIVE
- D2 Excel + PDF legacy-format export = IN_PROGRESS
- D3 migrate ALL history from Apps 283, 310, 305, 643, 307, 640, 715, 716 into App794 = IN_PROGRESS / WRITE NOT AUTHORIZED
- D4 HR Control Center / App800 end-to-end lifecycle = IN_PROGRESS
- D5 employee copy ONLY own previous planning fields = MUST_FIX
- D6 full E2E / security / regression closure = BLOCKED
- D7 Admin Support Center = PASS / CLOSED
