# CONFIRMED BASELINE — D1 AUTHENTICATION & ACCESS SECURITY

> Status: **CONFIRMED / CURRENT D1 ARCHITECTURE**  
> Scope: App794 Employee-Self MBO access + App801 credential store + Kintone access-account model

---

## 1. Architecture Choice

D1 uses a **KINTONE-ONLY** architecture.

There is no external Node gateway, Windows/Linux application server, external authentication service, reverse proxy, external database, or external session service in the current approved architecture.

The MBO login is an **application/UI authorization gate inside Kintone**.

Known accepted limitation:

```text
DIRECT_URL_REST_HARD_ISOLATION = NOT_GUARANTEED_UNDER_SHARED_KINTONE_ACCOUNT
```

Because multiple employees may enter Kintone through shared/access accounts, native Kintone principal-level isolation cannot distinguish one employee identity from another inside the same shared principal. The custom MBO layer must therefore fail closed and bind employee-self behavior to the authenticated MBO Employee_Code.

Do not claim native hard employee-level isolation under this architecture.

---

## 2. MBO Login Identity

Every time an employee enters/re-enters/reloads the MBO application:
- show the MBO Login gate;
- Username = `Employee_Code`;
- Password = MBO password stored/managed through App801;
- successful login binds the current in-page Employee Self context to that exact authenticated Employee_Code;
- do not ask the employee to select/re-enter Employee ID after successful login;
- employee A must not be able to switch the custom Employee Self context to employee B.

Authentication state is **PAGE MEMORY ONLY**.

Forbidden auth persistence:
- no localStorage auth session;
- no sessionStorage auth session;
- no cookie-based custom MBO auth persistence;
- no persistent browser token used to skip the next MBO login.

Reload/re-entry requires MBO login again.

Logout clears the in-page authentication context and returns the page to the blocking MBO Login gate.

---

## 3. Password / Credential Model — App801

App801 is the approved MBO credential/auth-state source.

Confirmed password storage:

```text
PBKDF2-SHA256
iterations = 100000
format = pbkdf2$100000$<saltHex>$<hashHex>
```

Browser implementation uses Web Crypto compatible behavior.
Do not use Node-only `node:crypto` in browser modules.

Never store or log plaintext MBO passwords.
Never render raw Password_Hash values in normal UI.

Initial/default employee password model:

```text
initial password = Employee_Code
Force_Password_Change = YES
```

On first/forced-change login, the employee must change the password before Employee Self content is rendered.

Normal own-password change requires verification of the current password before the new password is saved.

---

## 4. Account State / Lockout

Confirmed behavior:
- `DISABLED` = deny;
- `LOCKED` = deny;
- malformed lockout/auth state = fail closed;
- wrong-password attempts increment `Failed_Attempts`;
- 5 failed attempts trigger 15-minute lockout;
- successful login resets the applicable failed-attempt state and updates `Last_Login_At`;
- forced-password-change state is controlled by `Force_Password_Change=YES`.

---

## 5. Employee-Self Gate Coverage

The custom MBO gate applies to App794 Employee-Self flows including:
- index/list;
- create;
- detail;
- edit.

Rules:
- custom My MBO list must be scoped to the authenticated Employee_Code;
- gate initialization failure must fail closed;
- required custom host/space absence must fail closed rather than expose native Employee Self content;
- detail/edit Employee_Code mismatch must show a visible blocking state;
- employee context source is the authenticated MBO Employee_Code only.

Create flow must reuse the established shared business path for the authenticated Employee_Code:

```text
Authenticated Employee_Code
  -> App53 employee lookup/snapshot
  -> App795 routing validation
  -> App796 scoring/profile lookup
  -> duplicate check
  -> Record_Key generation
  -> snapshot/current-record preparation
```

Do not duplicate routing/scoring/duplicate business rules in a separate auth-only implementation.

---

## 6. Kintone Access Accounts — Dedicated Group Model

The approved permanent Kintone access-account model is a dedicated Kintone group:

```text
MBO_EMPLOYEE_ACCESS
```

Kintone shared/access principals used for ordinary employee access are members of this group.

Initial confirmed principal set supplied by the user:

```text
f1
f2
f3
tmh
e1
s1
g_request
t1
t2
```

Future shared/access accounts should normally be enabled for D1 by adding them to `MBO_EMPLOYEE_ACCESS`, without source-code redesign and without adding separate App801 USER ACL rows for each account.

Do not use `GROUP:everyone` for App801 employee access.

`admin-form` remains Technical Admin only and is not employee business authority.

---

## 7. App801 App ACL Target Model

`MBO_EMPLOYEE_ACCESS` target App801 app permission:

```text
View records   = YES
Edit records   = YES
Add records    = NO
Delete records = NO
Import         = NO
Export         = NO
App Admin      = NO
```

Preserve creator/admin recovery rights.
Keep `GROUP:everyone` denied.
No App801 record ACL rule is part of the approved baseline unless a future explicit architecture change is confirmed.

Security limitation remains: a Kintone principal granted App801 View/Edit through the shared/access group may technically use native/direct Kintone REST outside the custom UI to read credential hashes or mutate credential records. This risk is inherent to the approved Kintone-only shared-principal model and must remain documented.

---

## 8. Live Cutover / UAT Closure Rule

Source implementation alone cannot close D1.

Final D1 closure requires live manual UI UAT proving at minimum:
- blocking Login on App794 entry;
- initial/default credential behavior;
- Force Password Change;
- reload/re-entry requires Login again;
- new password login works;
- wrong-password / lockout behavior;
- normal Change Password requires current password;
- Logout re-blocks;
- Employee A custom My MBO list shows only A's ordinary UI items;
- create autoload path completes without Employee ID re-entry;
- Employee A opening Employee B detail/edit is visibly blocked;
- no raw Password_Hash/plain password appears in normal UI/DOM/storage.

D1 is not PASS/CLOSED until ChatGPT independently reviews the final live UAT evidence.

---

## 9. Change Rule

Any future change to:
- Kintone-only architecture;
- App801 credential format;
- page-memory-only auth rule;
- `MBO_EMPLOYEE_ACCESS` group model;
- App801 ACL model;
- Employee Self identity binding;
- lockout/password rules;
- D1 hard-isolation limitation;

requires explicit user/Control Plane decision and must be updated in this baseline in the same control cycle.
