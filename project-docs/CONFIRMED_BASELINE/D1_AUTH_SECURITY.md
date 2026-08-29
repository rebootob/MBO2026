# CONFIRMED BASELINE — D1 AUTHENTICATION & ACCESS SECURITY

> Status: **CONFIRMED / CURRENT D1 ARCHITECTURE**  
> Confirmed architecture change: **2026-08-29 — D1 Auth Bridge approved by user**  
> Scope: App794 Employee-Self MBO access + App801 credential store + Auth Bridge + Kintone shared-account model

---

## 1. Architecture Choice — AUTH BRIDGE

D1 now uses an **Auth Bridge** architecture.

The former browser-direct / KINTONE-ONLY credential path is superseded.

Canonical flow:

```text
App794 browser (shared Kintone principal such as s1)
  -> HTTPS MBO Auth Bridge
  -> server-side App801 access using a dedicated secret credential
  -> App801 remains private from employee/shared Kintone accounts
```

The browser must no longer read or update App801 credential/session records directly in the production auth path.

This architecture change is required by accepted live evidence:
- Employee `0113` credential state was read by Technical Admin and was `ACTIVE`, `Failed_Attempts=0`, `Locked_Until` blank, `Force_Password_Change=NO`, `Credential_Version=1`;
- Kintone principal `s1` received `403 / CB_NO02` when attempting App801 record access;
- direct navigation to App801 as the employee-facing principal also returned `CB_NO02`;
- therefore the live App801 privacy boundary is working, while the former browser-direct Auth Adapter cannot operate under that boundary.

**Do not fix this by granting App801 View/Edit to `s1`, `MBO_EMPLOYEE_ACCESS`, or `GROUP:everyone`.**

---

## 2. Trust Boundary

### Browser may hold
- Employee Code entered by the employee;
- plaintext password only transiently during the HTTPS login request;
- the current raw opaque session token in `sessionStorage` only;
- a short-lived force-change ticket in memory only while completing mandatory first password change;
- ordinary Employee-Self UI data that the authenticated flow is allowed to display.

### Browser must never receive
- `Password_Hash`;
- password salt/hash internals;
- another employee's credential/account/session metadata;
- `Session_Token_Hash`;
- App801 API token or other Bridge server secret;
- a server signing secret.

### Auth Bridge owns
- App801 credential lookup/update;
- PBKDF2 password verification and hash creation;
- failed-attempt / lockout state updates;
- forced-password-change verification;
- session token generation, hashing, persistence, validation and revocation;
- Credential_Version checks/rotation;
- safe machine-readable auth error normalization.

The shared Kintone principal is not the employee identity. Employee-Self identity remains the successfully authenticated `Employee_Code`.

---

## 3. App801 Credential / Password Model

App801 remains the credential/auth-state source of truth.

Confirmed password storage remains:

```text
PBKDF2-SHA256
iterations = 100000
format = pbkdf2$100000$<saltHex>$<hashHex>
```

Initial/default employee password remains:

```text
initial password = Employee_Code
Force_Password_Change = YES
```

Rules:
- never store or log plaintext password;
- Bridge must preserve compatibility with existing App801 PBKDF2 hashes;
- normal own-password change verifies the current password;
- password change increments positive-integer `Credential_Version`;
- password change invalidates the prior session and returns a replacement current-tab session only after the credential write succeeds.

---

## 4. Account State / Lockout

Confirmed behavior remains:
- `DISABLED` = deny;
- `LOCKED` = deny;
- malformed credential/account state = fail closed;
- wrong password increments `Failed_Attempts`;
- 5 failed attempts trigger a 15-minute temporary lock;
- successful login resets the applicable failed-attempt state and updates `Last_Login_At`;
- `Force_Password_Change=YES` prevents normal Employee-Self content until mandatory change completes;
- session restore also denies disabled/locked/forced-change accounts.

The Bridge returns safe machine-readable statuses so the UI does not mislabel unrelated failures as “locked or disabled”.

Required normalized statuses include at minimum:

```text
AUTHENTICATED
PASSWORD_CHANGE_REQUIRED
INVALID_CREDENTIALS
ACCOUNT_LOCKED
ACCOUNT_DISABLED
INVALID_SESSION
RATE_LIMITED
AUTH_SERVICE_UNAVAILABLE
```

Do not expose raw Kintone error payloads, credential contents, or secret values to the browser.

---

## 5. Auth Bridge HTTP Contract

Production transport is HTTPS only.

Canonical endpoints:

```text
POST /v1/auth/login
POST /v1/auth/session/validate
POST /v1/auth/logout
POST /v1/auth/password/change
POST /v1/auth/password/force-change
GET  /healthz
```

### Login
Request contains only the data required for login, including `employeeCode`, `password`, and current Kintone user context.

On successful normal login:
- Bridge verifies credential/account state;
- Bridge creates a cryptographically random 256-bit opaque session token;
- App801 stores only SHA-256(token) + approved session metadata;
- raw token is returned once to the browser and stored only in current-tab `sessionStorage`.

### Session validate
Browser sends the raw opaque session token over HTTPS. Bridge hashes it and validates the matching App801 session state. Successful validation returns only the authenticated `Employee_Code` plus non-secret session result data needed by the UI.

### Logout
Bridge revokes the matching App801 session fields when resolvable. Browser clears its local token whether or not remote revocation succeeds; remote failure must remain observable and must not be falsely reported as a successful server revocation.

### Normal password change
Requires a valid current session plus current-password verification. On success, increment `Credential_Version`, clear old session state, and issue one replacement session for the same tab.

### Forced password change
When the initial password is valid but `Force_Password_Change=YES`, Bridge returns a short-lived signed force-change ticket instead of a usable session.

Force-change ticket rules:
- memory only in browser;
- default TTL = 10 minutes;
- contains no password/hash/session token;
- includes Employee_Code, credential version, expiry and nonce;
- signed server-side using a Bridge-only secret;
- successful password change increments `Credential_Version`, making an old ticket unusable after the change;
- only after the password write succeeds may Bridge issue a normal session.

---

## 6. Short-Lived Session Model

The approved 8-hour same-tab session-continuity behavior remains.

```text
ABSOLUTE_TTL = 8 hours
SLIDING_REFRESH = NO
ONE_ACTIVE_SESSION_PER_EMPLOYEE = YES
BROWSER_STORAGE = sessionStorage only
KEY = ttmet.mbo794.session.v1
```

App801 session fields remain:

```text
Session_Token_Hash
Session_Issued_At
Session_Expires_At
Session_Credential_Version
Session_Kintone_User
```

Rules:
- raw token never stored in App801;
- browser-stored Employee_Code/authenticated flags are never trusted as proof of identity;
- Bridge validation resolves the Employee_Code from App801 session state;
- `Session_Credential_Version == Credential_Version` is mandatory;
- account must be ACTIVE and not Force-Change pending;
- expiry must be valid and in the future;
- current Kintone user context must match `Session_Kintone_User` exactly when that binding is applicable;
- tab/browser-session close removes the raw browser token;
- new independent tab without token requires login;
- validation never extends expiry.

Because shared Kintone accounts exist, `Session_Kintone_User` is a useful context binding but is not a unique employee identity proof.

---

## 7. App801 Access / ACL Target

App801 remains **private from employee/shared Kintone principals**.

Target employee-facing permission:

```text
MBO_EMPLOYEE_ACCESS / shared employee principals
View records   = NO
Edit records   = NO
Add records    = NO
Delete records = NO
Import         = NO
Export         = NO
App Admin      = NO
```

`GROUP:everyone` remains denied.

`admin-form` remains Technical Admin / recovery only and is not employee business authority.

Bridge server access must use a dedicated server-side Kintone credential/API token restricted to App801 and least privilege:

```text
View records = YES
Edit records = YES
Add records  = NO
Delete       = NO
App Admin    = NO
```

Secrets must be stored only in server environment/secret storage and never committed or bundled into App794 JavaScript.

Direct employee/shared-principal App801 access returning `CB_NO02` is an expected security result after cutover.

---

## 8. Bridge Transport / Runtime Security

Mandatory production controls:
- HTTPS only;
- exact allow-list CORS for approved Kintone origin(s), with local-development origins separate and disabled in production;
- do not treat CORS/Origin as the sole authentication security boundary;
- JSON body size limit;
- `Cache-Control: no-store` for auth responses;
- no cookies/localStorage auth;
- no password/session/force-ticket logging;
- sanitized structured logs with request correlation ID only;
- rate limiting for login endpoints, in addition to App801 failed-attempt lockout;
- production rate-limit design must remain effective for the chosen hosting topology;
- secrets supplied through environment/secret manager only;
- health endpoint exposes no secret/config/credential contents.

Hosting provider and live Bridge URL are **not yet approved** by this architecture decision. Live Bridge deployment and secret creation are separate gates.

---

## 9. Browser Source Responsibility Boundaries

Required browser-side split after cutover:

```text
mbo-auth-bridge-adapter.js
  = HTTPS client for Auth Bridge contract only

mbo-kintone-login-gate.js
  = Login / Force Password Change / Change Password / Logout UI flow

mbo-session-manager.js
  = browser sessionStorage lifecycle + Bridge session orchestration

main-mbo-app.js
  = dependency construction + top-level Kintone event orchestration only
```

The former `mbo-kintone-auth-adapter.js` browser-direct App801 implementation must not remain on the production dependency path after cutover. It may remain temporarily only as migration/reference code until an independently reviewed removal or archival step.

Production browser bundle must have **zero direct App801 credential/session GET/PUT calls** and must contain no App801 API token/Bridge server secret.

Do not put auth transport/session implementation into `employee-part-a-ui.js` or grow `main-mbo-app.js` into a catch-all.

---

## 10. Bridge Service Responsibility Boundaries

Bridge service should remain modular. At minimum separate:
- environment/config validation;
- App801 repository/Kintone HTTP access;
- auth/password/lockout service;
- session issue/validate/revoke service;
- force-change ticket signing/verification;
- HTTP routing / response normalization.

The first implementation should be provider-neutral Node.js 20 code with no production secret and no live deployment. Hosting-specific adaptation is a later gate.

---

## 11. Employee-Self Gate Coverage

The custom MBO gate still applies to App794 index/list, create, detail and edit.

Rules remain:
- My MBO list scoped to authenticated Employee_Code;
- create uses authenticated Employee_Code and existing App53 -> 795 -> 796 -> duplicate -> Record_Key -> snapshot business path;
- detail/edit mismatch visibly blocked;
- gate initialization/validation failure fails closed;
- routing/scoring/duplicate rules are not duplicated inside auth modules.

---

## 12. App53 Credential Candidate Eligibility

App53 remains the employee source of truth for credential eligibility.

Employee active-status source:

```text
Field Code = Number_0
1 = active/current
0 = inactive/former
blank = unknown / not active for provisioning
```

Candidate still requires:
1. `Number_0 = 1`;
2. non-blank Employee_Code source (`emp_text`);
3. exactly one active App53 row for that Employee_Code.

Employee_Code is a string identifier and may contain supported punctuation/underscores. Duplicate active Employee_Code values fail closed. No synthetic replacement Employee_Code may be invented.

---

## 13. Final D1 UAT Closure

D1 cannot close on source implementation alone.

Final live UAT must prove at minimum:
- employee/shared Kintone principal still receives `CB_NO02` for direct App801 access;
- App794 login succeeds through Bridge for an ACTIVE employee;
- browser Network/Console/DOM exposes no Password_Hash, Bridge secret, App801 API token or session hash;
- production browser path makes zero direct App801 credential/session API calls;
- initial/force password change works;
- wrong password and 5-attempt/15-minute lockout work;
- Login/List/Create/Detail/Edit same-tab session continuity remains;
- new tab without token, expired/tampered token and wrong Kintone context fail closed;
- Change Password rotates credential version and current-tab session;
- Logout revokes/clears and re-blocks;
- Employee A cannot become Employee B;
- My MBO history/no-delete/Completed display behavior remains accepted;
- final Create flow no longer raises the previously identified Kintone event-handler form-state error;
- live App794 deployment passes its separate deploy-guard and visual gates.

---

## 14. Change Rule

Future changes to any of the following require explicit Control Plane/user decision and Baseline update:
- Auth Bridge vs browser-direct architecture;
- App801 employee/shared-account privacy boundary;
- Bridge secret/credential scope;
- PBKDF2 format/iterations;
- force-change ticket model/TTL;
- session TTL/storage/one-session rule;
- Kintone-context or Credential_Version binding;
- lockout/password rules;
- App53 credential eligibility semantics.
