# CONFIRMED BASELINE — D1 AUTHENTICATION & ACCESS SECURITY

> Status: **CONFIRMED / CURRENT D1 ARCHITECTURE**  
> Reconfirmed by user: **2026-08-29 — KINTONE-ONLY is mandatory; no external server/service**  
> Scope: App794 Employee-Self MBO access + App801 credential store + Kintone shared-account model

---

## 1. Architecture Choice — KINTONE-ONLY

D1 MUST be completed entirely inside Kintone.

```text
EXTERNAL_SERVER       = FORBIDDEN
EXTERNAL_AUTH_SERVICE = FORBIDDEN
AUTH_BRIDGE            = CANCELLED / NOT AUTHORIZED
EXTERNAL_DATABASE      = FORBIDDEN
REVERSE_PROXY          = FORBIDDEN
```

Canonical flow:

```text
App794 browser customization
  -> Kintone REST/JavaScript API under the current Kintone principal
  -> App801 credential/auth-state records
```

The previously proposed Auth Bridge architecture is superseded and must not be implemented, deployed, hosted, or used as a production dependency.

Known accepted Kintone-only limitation:

```text
DIRECT_URL_REST_HARD_ISOLATION = NOT_GUARANTEED_UNDER_SHARED_KINTONE_ACCOUNT
```

Because several employees may use one shared Kintone principal (for example `s1`), Kintone cannot distinguish Employee_Code identities inside that principal at the native ACL layer. Employee identity is therefore enforced by the custom MBO login/session layer, but native hard REST isolation between employees sharing the same Kintone principal cannot be claimed.

---

## 2. MBO Login Identity

Username = `Employee_Code`.
Password = MBO password stored/managed through App801.

Successful authentication binds Employee-Self behavior to the exact authenticated Employee_Code.

Rules:
- do not ask the employee to choose/re-enter another Employee_Code after successful login;
- Employee A must not be able to switch custom Employee-Self context to Employee B;
- browser-stored Employee_Code/authenticated flags are not trusted as identity proof;
- session continuity follows `D1_SESSION_CONTINUITY.md`.

---

## 3. Password / Credential Model — App801

App801 is the approved credential/auth-state source of truth.

```text
PBKDF2-SHA256
iterations = 100000
format = pbkdf2$100000$<saltHex>$<hashHex>
```

Initial/default model:

```text
initial password = Employee_Code
Force_Password_Change = YES
```

Rules:
- never store/log plaintext password;
- Browser Web Crypto implementation must remain compatible with existing App801 hashes;
- normal own-password change verifies current password;
- password change increments positive-integer `Credential_Version`;
- password change invalidates the old session generation.

### HR / Technical Admin Password Reset

A controlled MBO Password Reset function is mandatory for:

```text
HR-authorized users
admin-form (Technical Admin / recovery)
```

Employee/shared principals must not receive this administrative reset function.

Reset semantics for selected Employee_Code:
- reset temporary password to the exact Employee_Code using the canonical PBKDF2-SHA256 / 100000 format;
- set `Force_Password_Change = YES`;
- set `Failed_Attempts = 0`;
- clear temporary `Locked_Until`;
- increment positive-integer `Credential_Version` by exactly 1;
- clear all active App801 session fields so prior sessions are invalidated;
- may update `Password_Changed_At` to the reset timestamp for auditability;
- MUST NOT change `Account_Status` or silently re-enable a permanently `LOCKED` / `DISABLED` account;
- MUST target exactly one existing App801 row and fail closed on missing/duplicate/malformed identity;
- no credential record create/delete is part of password reset.

The final production UI must provide this function to HR and `admin-form` through an authorized administrative surface inside Kintone, with explicit target Employee_Code confirmation before write and observable success/failure feedback.

---

## 4. Account State / Lockout

Confirmed behavior:
- `DISABLED` = deny;
- permanent `LOCKED` = deny;
- malformed credential/account state = fail closed;
- wrong password increments `Failed_Attempts`;
- 5 failed attempts trigger a 15-minute temporary lock via `Locked_Until`;
- successful login resets applicable failed-attempt state and updates `Last_Login_At`;
- `Force_Password_Change=YES` blocks Employee-Self content until mandatory password change succeeds;
- session restore must also deny disabled/locked/forced-change accounts.

Login UI must distinguish invalid credentials, locked/disabled state, and technical/permission failures. Do not map every denial to “Account is locked or disabled”.

---

## 5. Employee-Self Gate Coverage

The custom MBO gate applies to App794 Employee-Self flows:
- index/list;
- create;
- detail;
- edit.

Rules:
- My MBO list is scoped to authenticated Employee_Code;
- gate initialization failure fails closed;
- required custom host/space absence fails closed;
- detail/edit Employee_Code mismatch shows visible blocking state;
- Employee-Self identity source is authenticated MBO Employee_Code only.

Create flow reuses the established business path:

```text
Authenticated Employee_Code
  -> App53 employee lookup/snapshot
  -> App795 routing validation
  -> App796 scoring/profile lookup
  -> duplicate check
  -> Record_Key generation
  -> snapshot/current-record preparation
```

Do not duplicate routing/scoring/duplicate logic in auth code.

---

## 6. Kintone Access Accounts — Dedicated Group

Approved group:

```text
MBO_EMPLOYEE_ACCESS
```

Initial shared/access principals:

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

Future shared/access accounts should normally be enabled through this group rather than source-code changes.

`admin-form` remains Technical Admin/recovery authority and is not employee business authority. HR reset authority is an administrative credential-recovery function only and does not make HR the employee identity.

---

## 7. App801 App ACL Target — KINTONE-ONLY Requirement

For the browser-direct Kintone-only authentication path to work, the employee-facing shared/access group requires App801 record access:

```text
MBO_EMPLOYEE_ACCESS
View records   = YES
Edit records   = YES
Add records    = NO
Delete records = NO
Import         = NO
Export         = NO
App Admin      = NO
```

Preserve Technical Admin/recovery rights.
Keep `GROUP:everyone` denied.
No App801 record ACL rule is assumed unless separately approved.

### Security ceiling of this Kintone-only design

A shared Kintone principal with App801 View/Edit permission may technically call native/direct Kintone REST outside the custom UI and read credential/session records or submit permitted updates. Kintone browser customization has no elevated secret execution context that can read App801 while simultaneously denying the same underlying Kintone principal that REST capability.

This limitation MUST remain documented. Do not claim hard Employee_Code-level isolation under a shared Kintone account.

Do NOT embed a Kintone API token or privileged credential in browser JavaScript as a workaround.

---

## 8. Accepted Live Evidence / ACL Resolution

User live verification on 2026-08-29 established:
- Employee_Code `0113` credential state before reset: `Account_Status=ACTIVE`, `Failed_Attempts=0`, `Locked_Until` blank, `Force_Password_Change=NO`, `Credential_Version=1`;
- Kintone principal `s1` is a member of `MBO_EMPLOYEE_ACCESS`;
- App801 App Permission row for `MBO_EMPLOYEE_ACCESS` is View=YES, Edit=YES, Add/Delete/Manage/Import/Export=NO;
- App801 was initially in the `Private` App Group, where Kintone warned that configured app permissions are not applied;
- user changed App801 App Group to `Public` while preserving the permission rows;
- after apply, `s1` could open App801 and view the 128 credential records, resolving the prior `403 / CB_NO02` blocker.

---

## 9. App53 Credential Candidate Eligibility

App53 Employee Namelist remains the employee source of truth.

```text
Field Code = Number_0
1 = Active/current
0 = Inactive/former
blank = unknown / not accepted as Active
```

Credential candidate requires:
1. `Number_0 = 1`;
2. non-blank Employee_Code (`emp_text`);
3. exactly one active App53 row for that Employee_Code.

Employee_Code is a string identifier and may contain supported punctuation/underscores. Duplicate active Employee_Code values fail closed. No synthetic replacement Employee_Code may be invented.

---

## 10. Final D1 UAT Closure

D1 cannot close on source implementation alone.

Final UAT must prove at minimum:
- initial App794 entry without valid MBO session shows Login;
- valid employee credential works under approved shared/access Kintone principal;
- Force Password Change works;
- HR-authorized user and `admin-form` can reset one selected employee MBO password with the exact reset semantics above;
- unauthorized employee/shared users do not receive the administrative reset capability;
- a reset invalidates the employee's prior session and forces password change on next successful login;
- reset does not change permanent `Account_Status`;
- same-tab session continuity across List/Create/Detail/Edit and reload;
- new independent tab without token requires Login;
- expired/tampered/wrong-principal session fails closed;
- normal Change Password verifies current password and rotates session;
- wrong-password / 5-attempt / 15-minute lockout works;
- Logout revokes/clears and re-blocks;
- Employee A My MBO shows only A's UI records;
- create autoload uses authenticated Employee_Code without re-entry;
- Employee A opening Employee B detail/edit is visibly blocked;
- no raw session token, plaintext password, or Password_Hash appears in normal UI/DOM/logs;
- My MBO history / Completed / no-delete behavior remains accepted;
- Create flow no longer raises the known Kintone event-handler form-state error.

D1 remains open until ChatGPT independently reviews final live UAT evidence.

---

## 11. Change Rule

Any future change to:
- Kintone-only / no-external-service constraint;
- App801 credential format;
- App801 ACL model;
- `MBO_EMPLOYEE_ACCESS` group model;
- HR / `admin-form` password-reset authority or reset semantics;
- session architecture;
- Employee-Self identity binding;
- lockout/password rules;
- accepted shared-principal isolation limitation;

requires explicit user decision and Baseline update in the same control cycle.
