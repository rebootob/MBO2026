# CONFIRMED BASELINE — D1 SHORT-LIVED SESSION CONTINUITY

> Status: **CONFIRMED / MANDATORY**  
> Initial confirmation: 2026-08-28  
> Reconfirmed: **2026-08-29 — KINTONE-ONLY / no external server or service**  
> Scope: App794 MBO session continuity across normal same-tab Kintone page navigation

---

## 1. Objective

After successful MBO login, an employee must continue normal App794 navigation without entering the MBO password again on every Kintone page load.

Covered continuity includes:

```text
List -> Create
List -> Detail/Edit
Create/Edit -> List
same-tab reload within an active MBO session
```

All authentication/session validation remains inside Kintone. No external Auth Bridge/server/session service is authorized.

---

## 2. Session Model

D1 uses a short-lived opaque bearer session token.

Confirmed behavior:
- browser creates a cryptographically random 256-bit token after successful authentication;
- raw token exists only in current-tab `sessionStorage`;
- App801 stores only SHA-256(token) + approved session metadata;
- browser does not store a trusted Employee_Code/authenticated flag as identity proof;
- every new App794 page revalidates the token against App801 through Kintone APIs under the current Kintone principal;
- invalid/missing/expired/tampered state fails closed to Login.

Browser storage key:

```text
ttmet.mbo794.session.v1
```

Only the raw opaque token is stored under that key.

---

## 3. Lifetime / Continuity Boundary

```text
ABSOLUTE_TTL = 8 hours
SLIDING_REFRESH = NO
ONE_ACTIVE_SESSION_PER_EMPLOYEE = YES
```

Rules:
- same-tab App794 navigation/reload may restore a valid session;
- closing the tab/browser session removes sessionStorage and requires Login again;
- new independent tab without token requires Login;
- expired token requires Login;
- validation does not extend expiry;
- new successful login invalidates the previous active session for that Employee_Code.

---

## 4. App801 Session Metadata

Session persistence remains on the existing App801 credential row:

```text
Session_Token_Hash          SINGLE_LINE_TEXT
Session_Issued_At           DATETIME
Session_Expires_At          DATETIME
Session_Credential_Version  NUMBER
Session_Kintone_User        SINGLE_LINE_TEXT
```

Rules:
- raw token never stored in App801;
- `Session_Token_Hash` = SHA-256(raw token);
- `Session_Credential_Version` equals credential version current when issued;
- password change increments `Credential_Version` and invalidates old session generation;
- `Session_Kintone_User` binds to the exact current Kintone principal;
- all session fields may be blank when no active session exists.

---

## 5. Session Validation Rules

A restored session is valid only when all checks pass:

```text
raw browser token exists
SHA-256(token) resolves exactly one App801 credential row
Account_Status = ACTIVE
Force_Password_Change = NO
Session_Expires_At is valid and > current time
Credential_Version is a positive integer
Session_Credential_Version = Credential_Version
Session_Kintone_User = current kintone.getLoginUser().code
Employee_Code is valid and present
```

Any missing/duplicate/malformed/mismatched state fails closed.

Do not return/render Password_Hash, password salt, or raw session token during validation.

---

## 6. Login / Password / Logout Lifecycle

### Normal login

```text
Browser reads App801 through Kintone API
-> verifies password/account state
-> generates opaque session token
-> writes only token hash + session metadata to App801
-> stores raw token in sessionStorage only after App801 session write succeeds
-> continues as authenticated Employee_Code
```

### Force Password Change

No usable Employee-Self session exists while `Force_Password_Change = YES`.

After successful forced change:
- increment `Credential_Version`;
- clear prior session fields;
- issue a new session tied to the new credential version;
- only then render Employee-Self content.

### Normal Change Password

After current-password verification:
- increment `Credential_Version`;
- invalidate prior session;
- issue a replacement session for current tab.

### Logout

Logout must:
- revoke/clear App801 session fields for the current token when resolvable;
- clear browser sessionStorage token;
- clear in-page principal;
- return to blocking MBO Login gate.

If App801 revocation fails, browser token must still clear and UI must fail closed; do not falsely report successful server-side/session-record revocation.

---

## 7. JavaScript Responsibility Boundaries

```text
mbo-kintone-auth-adapter.js
  = App801 credential/account/session-record access and validation

mbo-kintone-login-gate.js
  = Login / Force Password Change / Change Password / Logout UI flow

mbo-session-manager.js
  = raw token generation, SHA-256 token hashing, sessionStorage lifecycle,
    issue/restore/revoke orchestration

main-mbo-app.js
  = dependency construction + top-level event orchestration only
```

Rules:
- do not put token/storage/expiry implementation into `main-mbo-app.js`;
- do not put session code into `employee-part-a-ui.js`;
- do not duplicate credential/session validation rules;
- generated `dist/mbo-employee-app.js` may remain one bundle while source stays modular.

Any `services/mbo-auth-bridge/` code created during the superseded Auth Bridge experiment is not part of the approved D1 runtime and must not be connected/deployed.

---

## 8. Security Boundary / Known Limitation

Kintone-only shared-account limitation remains:

```text
DIRECT_URL_REST_HARD_ISOLATION = NOT_GUARANTEED_UNDER_SHARED_KINTONE_ACCOUNT
```

For browser-direct authentication to work, the approved `MBO_EMPLOYEE_ACCESS` principals require the App801 permissions defined in `D1_AUTH_SECURITY.md`. Those permissions also exist at the native Kintone principal/REST layer; custom JavaScript cannot create a hidden privileged App801 channel inside Kintone.

Raw session token is a bearer secret and must:
- never be logged;
- never be committed;
- never be placed in URL/query/hash;
- never be rendered in DOM;
- never be copied into localStorage/cookies;
- retain high entropy and the approved absolute TTL.

---

## 9. Final D1 UAT Additions

Final D1 UAT must prove:
- initial App794 entry without session shows Login;
- successful login creates same-tab session continuity;
- List -> Create and List -> Detail/Edit do not ask for password again;
- same-tab reload restores correct Employee_Code;
- new independent tab without token requires Login;
- expired/tampered token fails closed;
- Logout revokes/clears and re-blocks;
- password change rotates old session correctly;
- disabled/locked account cannot restore;
- different Kintone principal cannot restore the session;
- no raw token/password/Password_Hash appears in normal UI/DOM/logs;
- Employee A cannot use session state to become Employee B.

D1 remains open until these and the other D1 gates are independently reviewed.

---

## 10. Change Rule

Changes to Kintone-only/no-external-service architecture, token lifetime, browser storage type, session fields, one-session-per-employee rule, Kintone-principal binding, Credential_Version binding, or invalidation behavior require explicit user decision and Baseline update.
