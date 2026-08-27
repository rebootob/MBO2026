# AI ACTIVE TASK — D1-C4A PORTABLE TRUSTED NODE GATEWAY RUNTIME PACKAGE

> Control Plane: ChatGPT
> Execution Plane: Codex (temporary replacement for Antigravity)
> Repository: `rebootob/MBO2026`
> Canonical integration branch: `ai/antigravity-wp002c`
> Codex execution branch: `ai/codex-d1c3b`
> Independently reviewed implementation: `127a872f431e8a6ae41e9348e8f151d6ef0d123f`
> Mode: PORTABLE SERVER RUNTIME PACKAGE ONLY / NO LIVE KINTONE WRITE / NO DEPLOY / NO ACL CHANGE / NO UI

## 0. INDEPENDENT REVIEW RESULT — D1-C3B ACCEPTED

Accepted from `127a872f...`:
- App794 missing/malformed/mismatched `Employee_Code` fails closed;
- trusted `session.employeeCode` is validated by canonical `normalizeEmployeeCode()` before App53/App794 query use;
- query injection defenses remain enforced;
- App53 lookup reuses canonical `EmployeeService`;
- Employee Self App794 responses strip existing `CONFIDENTIAL_FIELDS` and auth/session secrets;
- 0118 -> 0119 record isolation remains enforced;
- App794 live facts were read with 3 READ-ONLY GETs;
- Kintone writes/deploys remained zero.

Accepted cutover facts:

```text
APP794_APP_ACL_CURRENT = CREATOR full record rights; GROUP everyone record view/add/edit/delete enabled
APP794_RECORD_ACL_CURRENT = NONE
APP794_PRIVILEGED_USER_FIELDS = Requester_User, Manager_Level1_Approvers, Manager_Level2_Approvers, GM_Level1_Approvers, GM_Level2_Approvers (USER_SELECT)
APP794_UNSAFE_EMPLOYEE_RULE = GROUP everyone direct App794 record access
APP794_ACL_CUTOVER = BLOCKED_PRIVILEGED_RULES_NOT_PROVEN
APP801_SCHEMA_MANIFEST = EXACT_9_FIELDS
APP801_ACL_CHANGE = NO_CHANGE
TRUSTED_BACKEND_RUNTIME = NOT_AVAILABLE
```

GitHub has no CI/workflow/status evidence for the implementation commit. Do not claim CI PASS.

Classification:

```text
D1C3B_SOURCE_AND_EVIDENCE = PASS / ACCEPTED
D1_OVERALL = IN_PROGRESS
```

## 1. GOAL

Build the minimum **portable Node.js trusted gateway runtime package** around the already accepted auth/session/employee-self services so the project is deployable later to an approved internal Windows/Linux server or VM.

This package is CODE + LOCAL TESTS ONLY.

Do NOT deploy it anywhere.
Do NOT modify Kintone.
Do NOT choose/invent a production host.

The runtime must remain portable and host-neutral.

## 2. TRUST BOUNDARY

Frozen architecture:

```text
Employee Browser
  -> Trusted Node Gateway
      -> MboAuthSessionService
      -> MboKintoneAuthRepository / App801
      -> EmployeeService / App53 READ ONLY
      -> MboEmployeeSelfGateway / App794
```

Rules:
1. Kintone/App801 privileged credentials or API tokens are server-side environment secrets only.
2. Never embed secrets in browser JS, source files, tests, logs, responses, or Git.
3. Employee identity after login comes only from trusted session `employeeCode`.
4. Browser must never supply/select another Employee_Code as an authorization input.
5. Explicit auth identity mode for Employee Self is `SHARED_KINTONE_SECONDARY_AUTH`.
6. Outer shared Kintone admission/audit principal must be a server-controlled configuration value, not trusted from a browser request field.
7. Technical admin remains unable to become Employee Self.
8. Raw session tokens must not be persisted; server persistence uses token hash only.
9. Password/Activation/Session hashes must never be returned to browser.
10. Force-password-change session has no MBO data authorization.

## 3. MINIMUM PORTABLE RUNTIME API

Implement a small Node server runtime using existing project dependencies where possible. Do NOT introduce a large framework if Node built-ins are sufficient.

Preferred runtime entrypoint may be equivalent to:

- `src/server/mbo-gateway-server.js`

Keep supporting files minimal and justified.

Expose only the minimum HTTP contract needed for D1:

```text
POST /api/mbo/login
POST /api/mbo/change-password
POST /api/mbo/logout
GET  /api/mbo/bootstrap?fiscalYear=FY2026
GET  /api/mbo/history
GET  /api/mbo/records/:recordId
GET  /health
```

### Login
Request body may contain only:
- `username` = MBO Employee_Code locator
- `password`
- `activationCode` only when first/default login requires it

Do NOT accept browser-supplied `kintoneUserCode` as trusted identity.
Use a server-controlled configured outer shared principal for the accepted shared-account mode.

### Session boundary
Use an opaque server session cookie at HTTP boundary.
Cookie must be:
- `HttpOnly`
- `Secure` in production mode
- explicit `Path=/`
- explicit SameSite policy controlled by configuration/topology

Because final hosting origin is not chosen yet, do NOT silently choose a cross-site production cookie policy. Runtime must fail closed in production mode if required origin/cookie security configuration is missing.

For local automated tests only, a clearly isolated test mode may permit loopback HTTP behavior without weakening production defaults.

### State-changing requests
Login/change-password/logout must reject malformed methods/content types/bodies and must enforce an explicit origin policy when an allowed browser origin is configured.
Do not create a generic auth/CSRF framework.

### Data endpoints
Bootstrap/history/direct-record endpoints must call the accepted `MboEmployeeSelfGateway`; do not duplicate its Employee_Code authorization logic.

## 4. RUNTIME CONFIG CONTRACT

Create only an example/config contract with placeholders, never real secrets.

Required logical configuration:

```text
NODE_ENV
PORT
MBO_ALLOWED_ORIGIN
MBO_COOKIE_SECURE
MBO_COOKIE_SAMESITE
MBO_OUTER_SHARED_KINTONE_PRINCIPAL
KINTONE_BASE_URL
KINTONE_APP801_ID=801
KINTONE_APP794_ID=794
KINTONE_APP53_ID=53
KINTONE_SERVER_CREDENTIAL=<server-side secret reference only>
```

If repository already has an env/config pattern, reuse it rather than creating a duplicate system.

Do not commit any live API token/password/cookie secret.

## 5. KINTONE TRANSPORT

Reuse existing `MboKintoneAuthRepository` and existing server-side transport patterns.
Do not redesign credential storage.

No live write/read is required for this package unless an existing test/preflight explicitly needs READ-ONLY evidence. Prefer mocks/local tests.

Mandatory:

```text
KINTONE_WRITES_EXECUTED = 0
KINTONE_DEPLOY_EXECUTED = 0
```

## 6. LOCAL TESTS — MINIMUM REQUIRED

Add focused runtime tests proving at least:

1. login request uses configured server-side shared outer principal, ignoring/rejecting browser attempts to inject a Kintone principal;
2. first/default login without required activation cannot obtain usable data session;
3. successful force-change login receives restricted session boundary and data endpoint remains denied;
4. after password change, authorized session can bootstrap own employee data;
5. 0118 session cannot read 0119 record through direct record route;
6. malformed fiscalYear/recordId remains denied through HTTP boundary;
7. technical admin Employee Self attempt remains denied;
8. logout invalidates session;
9. no Password_Hash / Activation_Code_Hash / Session_Token_Hash is returned;
10. production-mode startup/config fails closed when required security/origin/cookie settings are absent or unsafe.

Do not duplicate the whole service test suite.

## 7. DEPLOYMENT PACKAGE — PLAN ONLY

Provide a minimal deployment/rollback contract, not a live deployment.

Target portability:
- Windows Server/Windows VM with Node.js; OR
- Linux VM with Node.js.

Document only what is required to run as a service/process and what environment variables are needed.
Do not install OS packages remotely.
Do not provision DNS/certificates/firewall/service accounts.
Do not invent a server hostname/IP.

Required result:

```text
PORTABLE_RUNTIME_PACKAGE = READY | BLOCKED:<reason>
TRUSTED_BACKEND_RUNTIME = NOT_DEPLOYED
LIVE_HOST_DECISION = REQUIRED_AFTER_SOURCE_REVIEW
```

## 8. APP801 / APP794 — FROZEN, NO LIVE CHANGE

Do not change App801 schema in this package.
Keep exact future App801 additions frozen:

```text
Password_Expires_At                  DATETIME
Activation_Code_Hash                 SINGLE_LINE_TEXT
Activation_Expires_At                DATETIME
Activation_Used_At                   DATETIME
Session_Token_Hash                   SINGLE_LINE_TEXT
Session_Expires_At                   DATETIME
Session_Requires_Password_Change     DROP_DOWN YES|NO
Session_Data_Authorized              DROP_DOWN YES|NO
Session_Kintone_User_Code            SINGLE_LINE_TEXT
```

Do not change App794 ACL.
Current cutover remains:

```text
APP794_ACL_CUTOVER = BLOCKED_PRIVILEGED_RULES_NOT_PROVEN
```

Do not guess HR/appraiser/admin principal codes.

## 9. OUT OF SCOPE

- no live gateway deployment
- no DNS / TLS certificate provisioning
- no Windows/Linux server changes
- no Kintone schema write
- no credential provisioning
- no App794 ACL change
- no Kintone customization deploy
- no employee UI redesign
- no App800 activation screen
- no D2-D7 implementation
- no migration
- no unrelated refactor

## 10. VERIFICATION

Run focused runtime tests plus current D1 regression and full workspace tests:

```bash
npm test -- tests/mbo-gateway-server.test.js
npm test -- tests/mbo-password-service.test.js tests/mbo-identity-service.test.js tests/mbo-auth-session-service.test.js tests/mbo-auth-kintone-repository.test.js tests/mbo-activation-service.test.js tests/mbo-employee-self-gateway.test.js tests/mbo-gateway-server.test.js
npm test
git diff --check
git status --short
```

If the exact runtime test filename differs, report it explicitly.
No CI claim without GitHub CI evidence.

## 11. DELIVERY REPORT

Commit + push only to the Codex execution branch.
Maximum implementer status is `IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`.

Report exactly:

```text
HEAD_BEFORE =
HEAD_AFTER =
FILES_CHANGED =
TEST_RESULTS =

D1C3B_SOURCE_AND_EVIDENCE = PASS_ACCEPTED
PORTABLE_RUNTIME_PACKAGE = READY_PENDING_REVIEW | BLOCKED:<reason>
RUNTIME_HTTP_BOUNDARY = IMPLEMENTED | BLOCKED
SERVER_CONTROLLED_SHARED_PRINCIPAL = IMPLEMENTED | BLOCKED
OPAQUE_HTTPONLY_SESSION_COOKIE = IMPLEMENTED | BLOCKED
PRODUCTION_CONFIG_FAIL_CLOSED = IMPLEMENTED | BLOCKED
EMPLOYEE_CODE_AUTHORIZATION_SOURCE = TRUSTED_SESSION_ONLY

APP801_SCHEMA_MANIFEST = EXACT_9_FIELDS_NO_WRITE
APP794_ACL_CUTOVER = BLOCKED_PRIVILEGED_RULES_NOT_PROVEN
TRUSTED_BACKEND_RUNTIME = NOT_DEPLOYED
LIVE_HOST_DECISION = REQUIRED_AFTER_SOURCE_REVIEW

KINTONE_READS_EXECUTED = N
KINTONE_WRITES_EXECUTED = 0
KINTONE_DEPLOY_EXECUTED = 0
D1C4A_STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW | BLOCKED_WITH_EXACT_EVIDENCE
D1_OVERALL_STATUS = IN_PROGRESS
```

Stop after commit + push. ChatGPT performs independent review.

---

# MANDATORY PROJECT CONTROL — DO NOT DROP

- D1 Login + password change + strict employee data isolation = IN_PROGRESS / D1-A CLOSED / D1-B SOURCE ACCEPTED + UAT ACCESS CHECK RESIDUAL / D1-C1 SOURCE ACCEPTED / D1-C2 EVIDENCE ACCEPTED / D1-C3A PASS / D1-C3B PASS / D1-C4A PORTABLE RUNTIME PACKAGE
- D2 Excel + PDF legacy-format export = IN_PROGRESS
- D3 migrate ALL history from Apps 283, 310, 305, 643, 307, 640, 715, 716 into App794 = IN_PROGRESS / WRITE NOT AUTHORIZED
- D4 HR Control Center / App800 end-to-end lifecycle = IN_PROGRESS
- D5 employee copy ONLY own previous planning fields = MUST_FIX
- D6 full E2E / security / regression closure = BLOCKED
- D7 Admin Support Center = PASS / CLOSED
