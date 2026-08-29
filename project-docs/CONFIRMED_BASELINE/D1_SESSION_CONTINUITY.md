# CONFIRMED BASELINE — D1 SHORT-LIVED SESSION CONTINUITY

> Status: **CONFIRMED / MANDATORY**  
> Initial confirmation: 2026-08-28  
> Auth transport update: **2026-08-29 — D1 Auth Bridge approved**  
> Scope: App794 MBO session continuity across normal same-tab Kintone page navigation

---

## 1. Objective

After a successful MBO login, an employee must continue normal App794 navigation without entering the MBO password again on every Kintone page load.

Covered continuity includes at minimum:

```text
List -> Create
List -> Detail/Edit
Create/Edit -> List
same-tab reload within an active MBO session
```

The former browser-direct App801 session validation path is superseded by the approved Auth Bridge architecture in `D1_AUTH_SECURITY.md`.

The continuity semantics below remain mandatory; only the trusted component that reads/writes App801 changes from Browser to Auth Bridge.

---

## 2. Session Model

D1 uses a **short-lived opaque bearer session token**.

Confirmed behavior:
- Auth Bridge creates a cryptographically random 256-bit token after successful authentication;
- raw token exists only in browser `sessionStorage` for the current tab/session;
- App801 stores only SHA-256(token) + approved session metadata;
- browser does not store a trusted Employee_Code/authenticated flag as identity proof;
- every new App794 page revalidates the raw token through Auth Bridge before restoring Employee-Self principal;
- Auth Bridge resolves/validates the App801 session server-side;
- invalid/missing/expired/tampered session state fails closed to the blocking MBO Login gate.

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
- closing the tab/browser session removes browser-side sessionStorage and requires login again;
- a new independent tab without token requires login;
- expired token requires login;
- validation does not extend expiry;
- a new successful login invalidates the previous active session for that Employee_Code.

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
- raw token is never stored in App801;
- `Session_Token_Hash` = SHA-256(raw token);
- `Session_Credential_Version` must equal credential version current when issued;
- password change increments `Credential_Version` and invalidates old session generation;
- `Session_Kintone_User` retains exact current Kintone user context binding when applicable;
- employee/shared browser principal does not directly read or write these fields after Auth Bridge cutover.

---

## 5. Session Validation Rules

A restored session is valid only when Auth Bridge confirms:

```text
raw browser token exists
SHA-256(token) resolves exactly one App801 credential row
Account_Status = ACTIVE
Force_Password_Change = NO
Session_Expires_At is valid and > current time
Credential_Version is a positive integer
Session_Credential_Version = Credential_Version
Session_Kintone_User matches current Kintone context when binding is applicable
Employee_Code is valid and present
```

Any missing/duplicate/malformed/mismatched state fails closed.

Browser receives only safe validation result data required to restore Employee-Self context. It must not receive `Password_Hash`, password salt, session hash, or App801 secret values.

---

## 6. Login / Password / Logout Lifecycle

### Normal login

```text
Browser sends Employee_Code + password to Auth Bridge over HTTPS
-> Bridge verifies App801 credential/account state
-> Bridge generates opaque session token
-> Bridge writes only token hash + session metadata to App801
-> Bridge returns raw token once
-> browser stores raw token in sessionStorage
-> continue as authenticated Employee_Code
```

### Force Password Change

No usable session is issued while `Force_Password_Change = YES`.

Bridge returns a short-lived signed force-change ticket defined by `D1_AUTH_SECURITY.md`. After successful mandatory change:
- increment `Credential_Version`;
- clear prior session fields;
- issue a normal session tied to new credential version;
- only then render Employee-Self content.

### Normal Change Password

After valid session + current password verification and successful change:
- increment `Credential_Version`;
- invalidate prior server-side session;
- issue a replacement session for current tab.

### Logout

Logout must:
- request Bridge revocation for current token;
- clear browser sessionStorage token;
- clear in-page principal;
- return to blocking MBO Login gate.

If remote revocation fails, browser token still clears and UI fails closed; remote failure remains observable.

---

## 7. Responsibility Boundaries

Browser:

```text
mbo-auth-bridge-adapter.js
  = Auth Bridge HTTPS client

mbo-kintone-login-gate.js
  = Login / Force Password Change / Change Password / Logout UI

mbo-session-manager.js
  = sessionStorage lifecycle + Bridge session orchestration

main-mbo-app.js
  = dependency construction + top-level Kintone event orchestration only
```

Bridge:
- App801 repository access;
- password verification/hash creation;
- lockout/account checks;
- session issue/validate/revoke;
- force-change ticket signing/verification.

The former browser-direct `mbo-kintone-auth-adapter.js` must not remain on the production dependency path after cutover.

---

## 8. Security Boundaries

`sessionStorage` remains readable by JavaScript executing in the same origin/tab, so the raw session token remains a bearer secret and must:
- never be logged;
- never be committed;
- never be placed in URL/query/hash;
- never be rendered in DOM;
- never be copied into localStorage/cookies;
- retain high entropy and short absolute lifetime.

Auth Bridge removes the prior requirement for shared employee Kintone principals to access App801 directly. Direct App801 access by those principals must remain denied.

Because shared Kintone principals exist, Kintone user context binding does not create unique native employee identity; authenticated Employee_Code remains the Employee-Self identity.

---

## 9. Final D1 UAT Additions

Final D1 UAT must prove at minimum:
- initial App794 entry without session shows Login;
- successful Bridge login creates usable same-tab session continuity;
- List -> Create and List -> Detail/Edit do not ask for MBO password again;
- same-tab reload restores correct Employee_Code;
- new independent tab without token requires Login;
- expired/tampered token fails closed;
- Logout revokes/clears and re-blocks;
- password change rotates old session correctly;
- disabled/locked account cannot restore;
- wrong Kintone context fails closed when binding applies;
- browser has zero direct App801 credential/session API calls;
- employee/shared Kintone principal direct App801 access remains `CB_NO02`;
- no raw token/password/Password_Hash/App801 API token appears in normal UI/DOM/logs;
- Employee A cannot use session state to become Employee B.

D1 remains open until these and other D1 gates are independently reviewed.

---

## 10. Create-Flow Defect Status

The previously observed Kintone event-handler form-state defect is separate from session continuity and has its own accepted source corrective. It remains part of final live UAT after combined deployment.

---

## 11. Change Rule

Changes to token lifetime, browser storage type, session fields, one-session-per-employee rule, Kintone-context binding, Credential_Version binding, force-change ticket model, or invalidation behavior require explicit Control Plane/user decision and Baseline update.
