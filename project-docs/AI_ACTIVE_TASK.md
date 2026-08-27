# AI ACTIVE TASK — D1-B MINIMAL LOGIN UI PREVIEW / USER MANUAL UAT ONLY

> Control Plane: ChatGPT
> Execution Plane: Antigravity
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Independently reviewed implementation: `35cb98d05ace3e00fbf719cabf6688375764e30d`
> D1-A status: CLOSED / SOURCE + SECURITY BOUNDARY ACCEPTED
> Mode: MINIMAL LOCAL UI UAT ONLY / NO PRODUCTION INTEGRATION
> Kintone read/write/deploy/schema/process/ACL authorization: NONE

## 0. REVIEW RESULT

D1-A Trusted Auth / Session Boundary is accepted from independent source review.

Accepted D1-A properties include:
- Node/server-only password verification and session issuance
- PBKDF2 remains server-side
- trusted Employee_Code binding uses existing identity rules
- initial/default password login produces restricted password-change session
- restricted session cannot access MBO data
- normal authenticated session is opaque and bound to one Employee_Code
- raw session token is hashed in server store
- credential failed-count / lockout persistence fails closed
- missing/invalid/expired/malformed sessions fail closed
- password change rotates/revokes old session
- logout invalidates session
- login will not mint a session unless session store has get/set/delete lifecycle capability
- technical admin cannot become employee-self principal
- Employee A/B access rule remains enforced by existing identity service

Do NOT reopen D1-A unless a concrete new defect is evidenced.

D1 overall is NOT PASS yet. User explicitly requires a UI they can manually test.

This task is ONLY D1-B: a local Login UI Preview for manual UAT. It is NOT production App801/Kintone integration.

Target implementer result:

`D1B_STATUS = READY_FOR_USER_MANUAL_UAT`

Do NOT self-certify D1 PASS.

---

## 1. GOAL

Provide a local browser UI the user can open and manually test this flow:

```text
Simulated trusted Kintone principal (LOCAL UAT fixture only)
  -> MBO username + password
  -> first/default login
  -> forced password change
  -> authenticated employee session
  -> own-data access check
  -> Employee A -> Employee B access blocked
  -> logout
  -> old session unusable
  -> login again with new password
```

Use the EXISTING `MboAuthSessionService`, `MboPasswordDomainService`, and `MboIdentityService`. Do not duplicate auth/security rules in browser JavaScript.

---

## 2. MINIMUM FILE/SCOPE

Prefer modifying only:
- `scripts/ui-preview-server.js`
- add ONE UI file: `preview/auth-preview.html`

Tests only if a very small existing-style Node test is useful. Do NOT add a framework.

Do not modify existing App794 employee UI unless a tiny navigation link is truly necessary. A direct URL to `/auth-preview.html` is acceptable and preferred to avoid regressions.

---

## 3. LOCAL AUTH PREVIEW SERVER — REQUIRED

Extend the existing local `scripts/ui-preview-server.js` only enough to host D1-B local auth UAT endpoints.

### 3.1 Server-side fixture only

Use in-memory LOCAL TEST data only. Minimum fixture identities:

```text
Employee A:
  Kintone principal fixture = emp0118
  Employee_Code = 0118
  initial MBO username = 0118
  initial MBO password = 0118

Employee B:
  Kintone principal fixture = emp0119
  Employee_Code = 0119
  initial MBO username = 0119
  initial MBO password = 0119

Technical Admin fixture:
  Kintone principal fixture = admin-form
  must NOT become employee-self principal
```

The principal switch is strictly a visible LOCAL UAT simulation. Label it clearly in UI. Do NOT present it as production identity architecture.

Restarting `npm run ui:preview` may reset the in-memory fixture. That is acceptable and preferable to adding reset infrastructure.

### 3.2 Reuse actual D1-A service

The Node preview server must call `MboAuthSessionService`. Browser code must NOT import:
- `mbo-auth-session-service.js`
- `mbo-password-service.js`
- `node:crypto`

### 3.3 Minimum local endpoints

Implement only what is needed, names may vary but keep them simple:

```text
POST /api/auth/login
POST /api/auth/change-password
GET  /api/auth/me
POST /api/auth/logout
POST /api/auth/access-check
```

Required behavior:

- `login`: server supplies the selected LOCAL simulated Kintone principal to the trusted auth service, receives service result, and never sends `Password_Hash` or credential record to browser.
- `change-password`: use current server session; force-change must work without re-entering current password; normal self-change requires current password as D1-A already enforces.
- `me`: returns only sanitized authenticated principal or unauthenticated state.
- `logout`: truly revokes session and clears browser cookie.
- `access-check`: derive authenticated employee from server session, NOT from a browser-supplied authenticatedUser object; then use existing `MboIdentityService.authorizeEmployeeRecordAccess()` for the target Employee_Code.

### 3.4 Browser session handling

For this local preview, prefer an `HttpOnly` cookie so browser JavaScript does not hold/read the raw session token.

Minimum cookie properties for localhost UAT:

```text
HttpOnly
SameSite=Strict
Path=/
```

Do not require `Secure` on plain `http://localhost` preview. Production cookie/TLS deployment is later work.

The raw auth session token must NOT be returned in client JSON and must NOT be written to localStorage/sessionStorage.

### 3.5 Safe HTTP handling

Keep this tiny but fail closed:
- JSON body size limit (small, e.g. <= 8 KB)
- invalid JSON => 400
- unsupported method/path => appropriate status
- auth errors => sanitized message/status; no stack trace/Password_Hash/credential object
- do not add CORS broad allow rules; same-origin localhost preview is enough

---

## 4. UI — REQUIRED FOR USER UAT

Create `preview/auth-preview.html` as a clean simple corporate login/UAT page.

The user must be able to test WITHOUT DevTools scripting.

### Required visible elements

1. Clear banner:
   - `LOCAL D1 LOGIN UAT — NO KINTONE WRITE / NO PRODUCTION DATA`
2. Simulated Kintone Principal dropdown:
   - Employee 0118
   - Employee 0119
   - Technical Admin (`admin-form`)
   - clearly label this dropdown as LOCAL TEST FIXTURE ONLY
3. MBO Username input
4. Password input
5. Login button
6. Result/status message area
7. Forced Change Password screen/state:
   - New Password
   - Confirm New Password
   - Change Password button
   - must not allow new password = Employee_Code
8. Authenticated screen/state:
   - display sanitized Employee_Code
   - display session/auth status (do NOT display token)
   - Change Own Password option for normal session (Current Password + New + Confirm)
   - Logout button
9. Data Isolation UAT area:
   - Target Employee Code input
   - `Check Access` button
   - visible ALLOW/BLOCK result
   - user can test own code and another employee code
10. Small UAT checklist on page so user knows exactly what to try.

Do not display:
- Password_Hash
- raw credential record
- raw session token
- salts/hash internals

Do not log passwords/session tokens to browser console.

---

## 5. USER MANUAL UAT ACCEPTANCE

After implementation, user should be able to run:

```bash
npm run ui:preview
```

and open:

```text
http://localhost:3000/auth-preview.html
```

Manual UAT sequence must be possible:

1. Select Employee 0118.
2. Login username `0118`, password `0118`.
3. UI MUST force Change Password and MUST NOT show authenticated MBO data-access state yet.
4. Try new password `0118` => BLOCK.
5. Set a different new password => success, authenticated Employee 0118 state.
6. Access check target `0118` => ALLOW.
7. Access check target `0119` => BLOCK with Employee A cannot access B semantics.
8. Logout => back to unauthenticated Login UI.
9. `/api/auth/me`/UI state after logout => unauthenticated.
10. Login with old default `0118` => FAIL.
11. Login with new password => SUCCESS.
12. Select `admin-form` and attempt employee login => BLOCK technical admin from employee-self principal.
13. Normal change-password flow requires current password.
14. Wrong password messages work; repeated wrong attempts use existing lockout behavior. User may restart preview server to reset fixtures.
15. Existing `http://localhost:3000/` Status Preview Lab still renders; D1-B must not break D7/App794 preview.

### Browser security observation

User/ChatGPT may inspect DevTools manually. Required:
- no `Password_Hash` in page source, UI, console, or API response
- no raw session token in page/console/localStorage/sessionStorage/client JSON
- no `node:crypto` browser request/error

Password itself will naturally be submitted in the local login/change-password POST request body; do not claim otherwise. Production transport/TLS is later integration.

---

## 6. DO NOT EXPAND SCOPE

Do NOT in D1-B:
- implement real App801 GET/WRITE
- create/change App801 schema
- call live Kintone APIs
- change Kintone ACL/process
- deploy anything
- implement production HTTP hosting/reverse proxy
- claim localhost fixture principal switch is production trust
- integrate every App794 route/direct URL yet
- work on D2-D6
- change D7
- refactor D1-A core unless a concrete runtime defect blocks this UI
- add React/Vue/framework/Playwright/Cypress

This is a manual UAT bridge only.

---

## 7. MINIMUM VERIFICATION

Run:

```bash
npm test -- tests/mbo-auth-session-service.test.js
npm test -- tests/mbo-password-service.test.js tests/mbo-identity-service.test.js tests/mbo-auth-session-service.test.js
npm test
npm run ui:preview
git diff --check
git status --short
```

If browser automation is unavailable, report `BROWSER_VERIFIED = NO` honestly. Do not self-certify manual UI PASS.

Do not run Kintone.

---

## 8. DELIVERY REPORT

Report:
- exact implementation commit SHA
- exact files changed
- local URL
- exact fixture credentials/principals for UAT
- targeted/full tests
- ui:preview startup result
- browser actually verified YES/NO
- whether existing `/` preview still loads if verified
- `KINTONE_READS_EXECUTED = 0`
- `KINTONE_WRITES_EXECUTED = 0`
- `KINTONE_DEPLOY_EXECUTED = 0`
- `D1A_STATUS = CLOSED`
- `D1B_STATUS = READY_FOR_USER_MANUAL_UAT`
- `D1_OVERALL_STATUS = IN_PROGRESS / RUNTIME + APP801 + DIRECT-ACCESS INTEGRATION STILL PENDING`

Do NOT mark D1 overall PASS.

---

# MANDATORY PROJECT CONTROL — DO NOT DROP

- D1 Login + password change + strict employee data isolation = IN_PROGRESS / D1-A CLOSED / D1-B UI UAT THIS TASK
- D2 Excel + PDF legacy-format export = IN_PROGRESS
- D3 migrate ALL history from Apps 283, 310, 305, 643, 307, 640, 715, 716 into App794 = IN_PROGRESS / WRITE NOT AUTHORIZED
- D4 HR Control Center / App800 end-to-end lifecycle = IN_PROGRESS
- D5 employee copy ONLY own previous planning fields = MUST_FIX
- D6 full E2E / security / regression closure = BLOCKED
- D7 Admin Support Center = PASS / CLOSED
