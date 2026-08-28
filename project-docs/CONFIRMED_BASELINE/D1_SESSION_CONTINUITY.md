# CONFIRMED BASELINE — D1 SHORT-LIVED SESSION CONTINUITY

> Status: **CONFIRMED / MANDATORY**  
> Confirmed by user decision: 2026-08-28  
> Scope: App794 MBO session continuity across normal same-tab Kintone page navigation

---

## 1. Objective

After a successful MBO login, an employee must be able to continue normal App794 navigation without entering the MBO password again on every Kintone page load.

Covered continuity includes at minimum:

```text
List -> Create
List -> Detail/Edit
Create/Edit -> List
same-tab reload within an active MBO session
```

This supersedes the former D1 rule that authentication state was PAGE-MEMORY-ONLY and every reload/re-entry required a new MBO login.

The architecture remains KINTONE-ONLY. No external authentication/session server is introduced.

---

## 2. Session Model

D1 uses a **short-lived opaque bearer session token**.

Confirmed behavior:
- a successful login creates a cryptographically random 256-bit token;
- the raw token exists only in the browser `sessionStorage` for the current tab/session;
- App801 stores only a SHA-256 hash of the token, never the raw token;
- the browser does not store a trusted Employee_Code/authenticated flag as proof of identity;
- every new App794 page must revalidate the token against App801 before restoring the in-page Employee Self principal;
- invalid/missing/expired/tampered session state fails closed to the blocking MBO Login gate.

Browser storage key:

```text
ttmet.mbo794.session.v1
```

Only the raw opaque token is stored under that key. Employee_Code is resolved from validated App801 session state, not trusted from browser storage.

---

## 3. Lifetime / Continuity Boundary

Confirmed session lifetime:

```text
ABSOLUTE_TTL = 8 hours
SLIDING_REFRESH = NO
```

Rules:
- same-tab App794 navigation and reload may restore the validated session;
- closing the tab/browser session removes browser-side sessionStorage and requires login again;
- a new independent tab without the token requires login;
- expired token requires login;
- session validation does not extend expiry;
- login again issues a new session and invalidates the previous active session for that Employee_Code.

The initial implementation supports **one active MBO session per Employee_Code**.

---

## 4. App801 Session Metadata

Session persistence belongs to the existing App801 credential record for the Employee_Code.

Required new App801 fields:

```text
Session_Token_Hash          SINGLE_LINE_TEXT
Session_Issued_At           DATETIME
Session_Expires_At          DATETIME
Session_Credential_Version  NUMBER
Session_Kintone_User        SINGLE_LINE_TEXT
```

Field rules:
- all session fields may be blank when no active session exists;
- do not store raw token;
- do not store plaintext password;
- do not reuse Password_Hash as a session field;
- `Session_Token_Hash` is SHA-256 of the random token;
- `Session_Credential_Version` must equal the credential version current when the session is issued;
- `Session_Kintone_User` binds the session to the Kintone principal that issued it.

Existing `Credential_Version` becomes an active security control:
- it must be a positive integer;
- password change increments it;
- session validation requires `Session_Credential_Version == Credential_Version`;
- a version mismatch invalidates the session.

Adding these fields to live App801 is a separate Production Schema Write and requires explicit authorization. Architecture approval alone does not authorize the schema change.

---

## 5. Session Validation Rules

A restored session is valid only when all applicable checks pass:

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

Do not return or render Password_Hash, password salt, or raw session token during validation.

---

## 6. Login / Password / Logout Lifecycle

### Normal login

```text
Password verified
-> account state verified
-> issue new opaque token
-> write only token hash + session metadata to App801
-> store raw token in sessionStorage only after server-side session write succeeds
-> continue as authenticated Employee_Code
```

### Force Password Change

No usable session is issued while `Force_Password_Change = YES`.

After the forced password change succeeds:
- increment `Credential_Version`;
- clear any prior session fields;
- issue a new session tied to the new credential version;
- only then render Employee Self content.

### Normal Change Password

After current password verification and successful change:
- increment `Credential_Version`;
- invalidate the previous server-side session;
- issue a replacement session for the current tab so the user may continue working without another login.

### Logout

Logout must:
- revoke/clear the server-side session fields for the current token when resolvable;
- clear browser sessionStorage token;
- clear in-page principal;
- return to the blocking MBO Login gate.

If revocation fails, browser token must still be cleared and the UI must fail closed; do not silently report a successful server revocation that did not occur.

---

## 7. JavaScript Responsibility Boundaries

Session implementation must stay modular.

Required responsibility split:

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
- do not put token generation/storage/expiry implementation into `main-mbo-app.js`;
- do not put session code into `employee-part-a-ui.js`;
- do not duplicate credential/session validation rules across modules;
- generated `dist/mbo-employee-app.js` may remain one deployment bundle, but source modules remain separate.

---

## 8. Security Boundaries / Known Limitations

This design improves navigation continuity but does not remove the known Kintone-only shared-account limitation:

```text
DIRECT_URL_REST_HARD_ISOLATION = NOT_GUARANTEED_UNDER_SHARED_KINTONE_ACCOUNT
```

`sessionStorage` is origin-scoped browser storage and is readable by JavaScript executing in the same origin/tab. The token therefore remains a bearer secret and must:
- never be logged;
- never be committed;
- never be placed in URL/query/hash;
- never be rendered in DOM;
- never be copied into localStorage/cookies;
- have high entropy and short absolute lifetime.

Binding the session to `Session_Kintone_User` reduces cross-principal reuse but does not turn the custom gate into native Kintone employee-level isolation.

---

## 9. Final D1 UAT Additions

Final D1 UAT must now prove at minimum:
- initial App794 entry without session shows Login;
- successful login creates usable same-tab session continuity;
- List -> Create does not ask for MBO password again;
- List -> Detail/Edit does not ask for MBO password again;
- same-tab reload during valid session restores the correct Employee_Code;
- new independent tab without token requires Login;
- expired/tampered token fails closed to Login;
- Logout revokes/clears session and re-blocks;
- password change rotates/invalidate old session correctly;
- disabled/locked account cannot restore session;
- session cannot restore under a different Kintone principal;
- no raw token/password/Password_Hash appears in normal UI/DOM/logs;
- Employee A cannot use session state to become Employee B.

D1 remains open until these and the other D1 UAT gates are independently reviewed.

---

## 10. Separate Open Create-Flow Defect

Live UAT also exposed a separate Create-flow defect:

```text
Employee Profile Resolution Failed
You cannot call kintone.app.record.get() in handler or during processing a handler.
```

This is not the session-continuity defect and must not be hidden inside the session work package.

It requires its own narrow corrective because the current create-show async path calls `syncRecordToKintone()`, which uses `kintone.app.record.get()/set()` while a Kintone event handler is still processing.

Fix session continuity first as one cohesive work package, independently review it, then correct the Create form-state/event-handler defect as a separate work package.

---

## 11. Change Rule

Changes to token lifetime, browser storage type, session fields, one-session-per-employee rule, Kintone-principal binding, credential-version binding, or session invalidation behavior require explicit Control Plane/user decision and Baseline update.