# CONFIRMED BASELINE — D1 IDENTITY / SESSION CONTINUITY

> Status: **CONFIRMED / MANDATORY**  
> Initial confirmation: 2026-08-28  
> Reconfirmed: **2026-08-30 — HYBRID IDENTITY / KINTONE-ONLY**  
> Scope: App794 continuity for dedicated Kintone users and shared-account MBO sessions

---

## 1. Objective

App794 now supports two identity-continuity modes:

```text
A. DEDICATED_KINTONE_AUTO_BIND
B. SHARED_ACCOUNT_MBO_SESSION
```

Both remain entirely inside Kintone. No external Auth Bridge/server/session service is authorized.

The user must not repeatedly authenticate within normal App794 navigation when their applicable identity mode remains valid.

---

## 2. Dedicated Kintone User Continuity

A dedicated Kintone user with an exact authoritative Kintone User Code <-> active Employee_Code mapping does **not** require the App801 MBO bearer-token session to prove Employee-Self identity.

Canonical flow:

```text
current native Kintone session
  -> kintone.getLoginUser().code
  -> exact authoritative employee mapping
  -> bound Employee_Code
  -> Employee-Self context
```

Rules:
- re-resolve/revalidate the mapping on App794 entry/page initialization;
- no secondary Employee_Code/password prompt after exact mapping succeeds;
- no user-selectable employee identity switch;
- missing mapping fails closed;
- ambiguous mapping fails closed;
- `admin-form` never auto-binds to Employee-Self;
- a new browser tab under the same valid native Kintone login may auto-bind again; absence of `ttmet.mbo794.session.v1` is **not** an error for this dedicated mode;
- closing/reopening App794 while the native Kintone session remains valid may auto-bind again;
- Kintone/cybozu login/logout/password policy remains native platform behavior and must not be reimplemented as an MBO password session.

Dedicated users who are also Approvers keep the same Kintone principal for Approver context; Approver authorization is separately revalidated from authoritative current Workflow assignment.

---

## 3. Shared-Account MBO Session Model

For approved shared Kintone principals, D1 continues to use a short-lived opaque MBO bearer session token after successful Employee_Code + MBO password authentication.

Confirmed behavior:
- browser creates a cryptographically random 256-bit token after successful MBO authentication;
- raw token exists only in current-tab `sessionStorage`;
- App801 stores only SHA-256(token) + approved session metadata;
- browser does not store a trusted Employee_Code/authenticated flag as identity proof;
- every new App794 page revalidates the token against App801 through Kintone APIs under the current Kintone principal;
- invalid/missing/expired/tampered state fails closed to MBO Login.

Browser storage key:

```text
ttmet.mbo794.session.v1
```

Only the raw opaque token is stored under that key.

---

## 4. Shared Session Lifetime / Continuity Boundary

```text
ABSOLUTE_TTL = 8 hours
SLIDING_REFRESH = NO
ONE_ACTIVE_SESSION_PER_EMPLOYEE = YES
```

Rules for the shared path:
- same-tab App794 navigation/reload may restore a valid MBO session;
- closing the tab/browser session removes sessionStorage and requires MBO Login again;
- new independent tab without token requires MBO Login;
- expired token requires MBO Login;
- validation does not extend expiry;
- new successful MBO login invalidates the previous active shared-path session for that Employee_Code.

Do not apply the `new independent tab without token -> Login` rule to a correctly mapped dedicated Kintone user. Dedicated mode relies on the native Kintone session plus mapping, not the App801 bearer token.

---

## 5. App801 Session Metadata — Shared Path

Shared-path session persistence remains on the existing App801 credential row:

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
- MBO password change increments `Credential_Version` and invalidates old shared session generation;
- `Session_Kintone_User` binds to the exact current shared Kintone principal;
- all session fields may be blank when no active MBO session exists.

Dedicated auto-binding must not create a fake App801 MBO session merely to imitate the shared path.

---

## 6. Shared Session Validation Rules

A restored shared MBO session is valid only when all checks pass:

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

## 7. Login / Password / Logout Lifecycle

### Shared-account normal MBO login

```text
Browser reads App801 through Kintone API
-> verifies MBO password/account state
-> generates opaque session token
-> writes only token hash + session metadata to App801
-> stores raw token in sessionStorage only after App801 session write succeeds
-> continues as authenticated Employee_Code
```

### Shared-account Force Password Change

No usable shared Employee-Self MBO session exists while `Force_Password_Change = YES`.

After successful forced change:
- increment `Credential_Version`;
- clear prior session fields;
- issue a new session tied to the new credential version;
- only then render Employee-Self content.

### Shared-account normal Change MBO Password

After current MBO-password verification:
- increment `Credential_Version`;
- invalidate prior MBO session;
- issue a replacement MBO session for current tab.

### Shared-account MBO Logout

MBO Logout must:
- revoke/clear App801 session fields for the current token when resolvable;
- clear browser sessionStorage token;
- clear in-page Employee_Code principal;
- return to blocking MBO Login gate.

If App801 revocation fails, browser token must still clear and UI must fail closed; do not falsely report successful server-side/session-record revocation.

### Dedicated Kintone user

Dedicated auto-bound users do not need MBO Login / Force MBO Password Change / Change MBO Password / MBO Logout controls as part of normal Employee-Self entry.

The MBO UI must not claim that `Reset MBO Password` or `Change MBO Password` changes the user's native Kintone/cybozu password. Native Kintone logout/password management remains outside the MBO credential lifecycle.

---

## 8. JavaScript Responsibility Boundaries

```text
mbo-identity-service.js
  = dedicated Kintone User -> Employee_Code binding and role-context authorization helpers

mbo-kintone-auth-adapter.js
  = App801 shared credential/account/session-record access and validation

mbo-kintone-login-gate.js
  = shared-account Login / Force Password Change / Change Password / Logout UI flow

mbo-session-manager.js
  = shared raw token generation, SHA-256 token hashing, sessionStorage lifecycle,
    issue/restore/revoke orchestration

main-mbo-app.js
  = dependency construction + top-level mode/event orchestration only
```

Rules:
- do not put mapping/session implementation into `main-mbo-app.js`;
- do not put session code into `employee-part-a-ui.js`;
- do not duplicate credential/session validation rules;
- do not force dedicated auto-bind through the App801 bearer-session implementation;
- generated `dist/mbo-employee-app.js` may remain one bundle while source stays modular.

Any `services/mbo-auth-bridge/` code created during the superseded Auth Bridge experiment is not part of the approved D1 runtime and must not be connected/deployed.

---

## 9. Security Boundary / Known Limitation

Shared-account limitation remains:

```text
DIRECT_URL_REST_HARD_ISOLATION = NOT_GUARANTEED_UNDER_SHARED_KINTONE_ACCOUNT
```

For browser-direct shared authentication to work, approved `MBO_EMPLOYEE_ACCESS` principals require the App801 permissions defined in `D1_AUTH_SECURITY.md`. Those permissions also exist at the native Kintone principal/REST layer; custom JavaScript cannot create a hidden privileged App801 channel inside Kintone.

Raw shared-session token is a bearer secret and must:
- never be logged;
- never be committed;
- never be placed in URL/query/hash;
- never be rendered in DOM;
- never be copied into localStorage/cookies;
- retain high entropy and the approved absolute TTL.

Dedicated mode has a different proof boundary: native Kintone authentication + exact authoritative Employee_Code mapping. A display name or App795 approver row is not sufficient identity proof.

---

## 10. Final D1 UAT Additions

### Dedicated path
- exact mapped dedicated principal auto-binds without secondary MBO login;
- same Kintone principal maps to exactly one correct Employee_Code;
- missing and ambiguous mapping fail closed;
- same-tab reload and independent new tab under valid Kintone login re-bind correctly;
- dedicated user's `My MBO` remains own-only;
- dual-role user can separately enter valid `My Approval Tasks` without changing Employee-Self identity;
- unassigned approval record is denied;
- self-approval is denied.

### Shared path
- initial App794 entry without MBO session shows Login;
- successful MBO login creates same-tab session continuity;
- List -> Create and List -> Detail/Edit do not ask for MBO password again;
- same-tab reload restores correct Employee_Code;
- new independent tab without token requires MBO Login;
- expired/tampered token fails closed;
- MBO Logout revokes/clears and re-blocks;
- MBO password change rotates old session correctly;
- disabled/locked account cannot restore;
- different Kintone principal cannot restore the shared session;
- no raw token/password/Password_Hash appears in normal UI/DOM/logs;
- Employee A cannot use session state to become Employee B.

D1 remains open until these and the other D1 gates are independently reviewed.

---

## 11. Change Rule

Changes to Kintone-only/no-external-service architecture, hybrid identity-mode behavior, dedicated mapping semantics, shared token lifetime, browser storage type, App801 session fields, one-session-per-employee rule, Kintone-principal binding, Credential_Version binding, invalidation behavior, or dedicated-vs-shared continuity rules require explicit user decision and Baseline update.
