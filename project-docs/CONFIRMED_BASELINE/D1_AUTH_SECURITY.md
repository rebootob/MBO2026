# CONFIRMED BASELINE — D1 AUTHENTICATION & ACCESS SECURITY

> Status: **CONFIRMED / CURRENT D1 ARCHITECTURE**  
> Reconfirmed by user: **2026-08-30 — HYBRID IDENTITY inside KINTONE-ONLY architecture**  
> Scope: App794 Employee-Self + Approver contexts, App801 shared-account credential store, dedicated Kintone-user auto-binding, HR/admin recovery

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

Canonical identity architecture is now:

```text
HYBRID_IDENTITY = DEDICATED_KINTONE_AUTO_BIND + SHARED_ACCOUNT_MBO_LOGIN
```

Two employee entry modes are supported:

```text
A. Dedicated Kintone User
   Kintone authenticated principal
     -> exact authoritative Kintone User <-> Employee_Code mapping
     -> Employee-Self identity auto-bound
     -> NO secondary MBO password login required

B. Shared Kintone User
   approved shared Kintone principal
     -> App794 MBO Login
     -> Employee_Code + App801 MBO password/session
     -> Employee-Self identity bound to authenticated Employee_Code
```

The previously proposed Auth Bridge architecture is superseded and must not be implemented, deployed, hosted, or used as a production dependency.

Known accepted Kintone-only limitation for the shared-account path:

```text
DIRECT_URL_REST_HARD_ISOLATION = NOT_GUARANTEED_UNDER_SHARED_KINTONE_ACCOUNT
```

Because several employees may use one shared Kintone principal, Kintone cannot distinguish Employee_Code identities inside that principal at the native ACL layer. Employee identity is therefore enforced by the custom MBO login/session layer for that path, but native hard REST isolation between employees sharing the same Kintone principal cannot be claimed.

Dedicated Kintone users do not require App801 access solely to prove their Employee-Self identity; their identity is the native Kintone principal plus the exact reviewed employee mapping.

---

## 2. Identity Modes & Resolution Precedence

### 2.1 Dedicated Kintone User mode

A person who has an individual Kintone account and an exact authoritative employee mapping may use that Kintone login directly for their own MBO.

Canonical rule:

```text
current Kintone User Code
  -> exactly one active employee mapping
  -> Employee_Code
  -> DEDICATED_KINTONE_IDENTITY_BOUND
```

Required behavior:
- no secondary Employee_Code/password prompt after successful exact auto-binding;
- do not ask the user to choose another employee identity;
- mapping must resolve exactly one active Employee_Code;
- missing mapping -> `IDENTITY_MAPPING_MISSING` / fail closed;
- duplicate/ambiguous mapping -> `IDENTITY_MAPPING_AMBIGUOUS` / fail closed;
- do not infer mapping from display name, email similarity, Section, Team, Position, or App795 approver membership;
- `admin-form` is always excluded from Employee-Self auto-binding and remains Technical Admin only;
- exact physical mapping source remains subject to the App53 read-only identity audit defined in `EMPLOYEE_MASTER_ROUTING.md` before implementation.

### 2.2 Shared Kintone User mode

For approved shared principals, the existing MBO credential path remains:

```text
Username = Employee_Code
Password = MBO password stored/managed through App801
```

Successful authentication binds Employee-Self behavior to the exact authenticated Employee_Code.

Rules:
- do not ask the employee to choose/re-enter another Employee_Code after successful MBO login;
- Employee A must not be able to switch custom Employee-Self context to Employee B;
- browser-stored Employee_Code/authenticated flags are not trusted as identity proof;
- session continuity follows `D1_SESSION_CONTINUITY.md`.

### 2.3 Mode selection safety

The runtime must distinguish dedicated and shared principals from authoritative configuration, not from a user-selectable UI toggle.

A shared principal must not accidentally auto-bind to one employee. A dedicated principal with a missing/ambiguous mapping must not silently fall back to another employee identity.

---

## 3. Dual-Role Employee + Approver Model

A single person may simultaneously be:
- an Employee who owns exactly one MBO record per Fiscal Year; and
- an Approver/Appraiser for other employees' MBO records.

Confirmed user examples include Natta and Vassana. Their exact Employee_Code <-> Kintone User mapping remains to be proven by read-only source audit; do not invent those codes.

Canonical separation:

```text
Employee-Self ownership identity = Employee_Code
Approver business identity        = current dedicated Kintone User Code
```

The same person is not duplicated as two employees and must not receive two own-MBO records for the same Fiscal Year.

Employee-Self authorization:

```text
target App794.Employee_Code == bound Employee_Code
```

Approver authorization:

```text
current Kintone User == authoritative current native Workflow assignee
```

A caller-supplied role string, App795 static route membership alone, UI visibility, or knowledge of another Employee_Code is not sufficient Approver authorization.

### Self-Approval Guard

If a person's own MBO is routed back to the same dedicated Kintone user as an Approver, runtime must fail closed rather than permit self-approval or silently skip a route member.

Canonical failure:

```text
SELF_APPROVAL_ROUTE_CONFLICT
```

Any business exception to this rule requires a separate explicit user decision and reviewed routing rule.

---

## 4. Password / Credential Model — App801

App801 is the approved MBO credential/auth-state source of truth for the shared-account MBO-login path.

```text
PBKDF2-SHA256
iterations = 100000
format = pbkdf2$100000$<saltHex>$<hashHex>
```

Initial/default shared-login model:

```text
initial password = Employee_Code
Force_Password_Change = YES
```

Rules:
- never store/log plaintext password;
- Browser Web Crypto implementation must remain compatible with existing App801 hashes;
- normal own-password change verifies current password;
- password change increments positive-integer `Credential_Version`;
- password change invalidates the old shared-path session generation.

Dedicated Kintone users authenticate through Kintone itself. `Reset MBO Password` must never be described as resetting a Kintone/cybozu password. Whether an App801 credential row remains present for a dedicated user as dormant/fallback data is not an authorization to use that row for identity and must not change dedicated-user auto-bind precedence without a separate reviewed decision.

### HR / Technical Admin Password Reset

A controlled MBO Password Reset function is mandatory for:

```text
HR-authorized users
admin-form (Technical Admin / recovery)
```

Employee/shared principals must not receive this administrative reset function.

Reset semantics for selected Employee_Code:
- reset temporary MBO password to the exact Employee_Code using canonical PBKDF2-SHA256 / 100000;
- set `Force_Password_Change = YES`;
- set `Failed_Attempts = 0`;
- clear temporary `Locked_Until`;
- increment positive-integer `Credential_Version` by exactly 1;
- clear all active App801 session fields so prior shared-path sessions are invalidated;
- may update `Password_Changed_At` to the reset timestamp for auditability;
- MUST NOT change `Account_Status` or silently re-enable a permanently `LOCKED` / `DISABLED` account;
- MUST target exactly one existing App801 row and fail closed on missing/duplicate/malformed identity;
- no credential record create/delete is part of password reset.

The final production UI must provide this function to HR and `admin-form` through an authorized administrative surface inside Kintone, with explicit target Employee_Code confirmation before write and observable success/failure feedback.

Accepted native administrative role:

```text
DISPLAY_NAME = MBO HR Administrators
GROUP_CODE   = HR_ADMIN_GROUP
```

User runtime readback on 2026-08-30 confirmed least-privilege access:
- App800: View=YES; Add/Edit/Delete/Manage/Import/Export=NO;
- App801: View=YES; Edit=YES; Add/Delete/Manage/Import/Export=NO.

Do not broaden these rights and do not add HR to `MBO_EMPLOYEE_ACCESS` as a shortcut.

---

## 5. Account State / Lockout — Shared MBO Credential Path

Confirmed behavior for the App801-backed shared-login path:
- `DISABLED` = deny;
- permanent `LOCKED` = deny;
- malformed credential/account state = fail closed;
- wrong password increments `Failed_Attempts`;
- 5 failed attempts trigger a 15-minute temporary lock via `Locked_Until`;
- successful login resets applicable failed-attempt state and updates `Last_Login_At`;
- `Force_Password_Change=YES` blocks shared-path Employee-Self content until mandatory password change succeeds;
- shared-path session restore must also deny disabled/locked/forced-change accounts.

Login UI must distinguish invalid credentials, locked/disabled state, and technical/permission failures. Do not map every denial to “Account is locked or disabled”.

Dedicated Kintone authentication/account lockout is governed by the Kintone/cybozu identity layer and is not reimplemented in App801.

---

## 6. Employee-Self & Approver Gate Coverage

The App794 identity/access gate applies to:
- index/home;
- create;
- detail;
- edit;
- Approver task entry.

Employee-Self rules:
- `My MBO` is scoped to the bound Employee_Code, regardless of whether that binding came from dedicated Kintone auto-bind or shared MBO login;
- gate initialization or identity-resolution failure fails closed;
- required custom host/space absence fails closed;
- Employee-Self detail/edit Employee_Code mismatch shows visible blocking state;
- create uses the bound Employee_Code automatically without asking the user to type another identity.

Approver rules:
- `My Approval Tasks` is available only when the current Kintone principal is a legitimate dedicated business actor and the record is currently assigned to that principal by authoritative Workflow state;
- Approver context does not widen `My MBO` ownership;
- shared employee sessions do not gain approval authority merely because several employees use the same shared Kintone account;
- current native Workflow assignment must be revalidated when opening an approval record;
- self-approval is blocked as defined above.

Create flow reuses the established business path:

```text
Bound Employee_Code
  -> App53 employee lookup/snapshot
  -> App795 routing validation
  -> effective Requester_User resolution
  -> App796 scoring/profile lookup
  -> duplicate check
  -> Record_Key generation
  -> snapshot/current-record preparation
```

Do not duplicate routing/scoring/duplicate logic in auth code.

---

## 7. Kintone Access Accounts — Shared Login Group

Approved group:

```text
MBO_EMPLOYEE_ACCESS
```

This group is the approved native access boundary for the shared MBO-login principals that require browser-direct App801 access.

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

Future shared principals should normally be enabled through this group rather than source-code changes.

Dedicated Kintone employees/approvers should not be granted App801 View/Edit merely to support Employee-Self auto-binding. Their native App794/workflow access must be reviewed separately from shared credential-store access.

`admin-form` remains Technical Admin/recovery authority and is not employee business authority. HR reset authority is an administrative credential-recovery function only and does not make HR the employee identity.

---

## 8. App801 App ACL Target — Shared KINTONE-ONLY Requirement

For the browser-direct shared-account authentication path to work, `MBO_EMPLOYEE_ACCESS` requires:

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
No App801 record/field ACL rule is assumed unless separately approved.

### Security ceiling of the shared path

A shared Kintone principal with App801 View/Edit permission may technically call native/direct Kintone REST outside the custom UI and read credential/session records or submit permitted updates. Kintone browser customization has no elevated secret execution context that can read App801 while simultaneously denying the same underlying Kintone principal that REST capability.

This limitation MUST remain documented. Do not claim hard Employee_Code-level isolation under a shared Kintone account.

Do NOT embed a Kintone API token or privileged credential in browser JavaScript as a workaround.

---

## 9. App53 Employee / Identity Candidate Eligibility

App53 Employee Namelist remains the employee source of truth.

```text
Field Code = Number_0
1 = Active/current
0 = Inactive/former
blank = unknown / not accepted as Active
```

Employee candidate requires:
1. `Number_0 = 1`;
2. non-blank Employee_Code (`emp_text`);
3. exactly one active App53 row for that Employee_Code.

For dedicated auto-binding, the system additionally requires exactly one reviewed Kintone User Code mapping to exactly one active Employee_Code. The physical App53 field/source for that mapping is **PENDING READ-ONLY AUDIT** and must not be invented or added silently.

Employee_Code is a string identifier and may contain supported punctuation/underscores. Duplicate active Employee_Code values fail closed. No synthetic replacement Employee_Code may be invented.

---

## 10. Final D1 UAT Closure

D1 cannot close on source implementation alone.

Final UAT must prove both identity modes.

### Dedicated Kintone User path
- exact mapped dedicated user opens App794 and auto-binds to the correct Employee_Code without secondary MBO login;
- `My MBO` shows only that Employee_Code;
- dedicated user can create/open own MBO through normal Employee-Self rules;
- independent new tab under the same valid native Kintone session auto-binds again; it is not incorrectly forced through the shared MBO token gate;
- missing/ambiguous mapping fails closed;
- dedicated dual-role user sees `My Approval Tasks` separately from `My MBO`;
- only authoritative current native assignments are actionable;
- opening an unassigned employee record is denied in Approver context;
- own record cannot be approved by the same dual-role user (`SELF_APPROVAL_ROUTE_CONFLICT`);
- dedicated path does not expose or pretend to change Kintone password through MBO password UI.

### Shared Kintone User path
- initial App794 entry without valid MBO session shows Login;
- valid employee credential works under approved shared/access Kintone principal;
- Force Password Change works;
- same-tab session continuity across List/Create/Detail/Edit and reload;
- new independent tab without MBO token requires Login;
- expired/tampered/wrong-principal session fails closed;
- normal Change Password verifies current password and rotates session;
- wrong-password / 5-attempt / 15-minute lockout works;
- Logout revokes/clears and re-blocks.

### Common / administrative gates
- HR-authorized user and `admin-form` can reset one selected App801-backed employee MBO password with the exact reset semantics above;
- unauthorized employee/shared users do not receive administrative reset capability;
- reset does not claim to reset Kintone/cybozu password;
- My MBO own-only/history/Completed/no-delete behavior remains accepted;
- create uses the bound Employee_Code -> App53 -> App795 -> App796 -> duplicate -> snapshot path;
- no raw session token, plaintext password, or Password_Hash appears in normal UI/DOM/logs;
- Live workflow/comment timeline never fabricates events;
- attachments remain truthful;
- final independent D1 review = PASS.

D1 remains open until ChatGPT independently reviews final live UAT evidence.

---

## 11. Change Rule

Any future change to:
- Kintone-only / no-external-service constraint;
- hybrid dedicated-vs-shared identity-mode selection;
- dedicated Kintone User <-> Employee_Code mapping source/semantics;
- App801 credential format;
- App801 ACL model;
- `MBO_EMPLOYEE_ACCESS` shared-principal group model;
- HR / `admin-form` password-reset authority or reset semantics;
- shared-path session architecture;
- Employee-Self identity binding;
- Approver authoritative-assignment rules;
- dual-role Employee + Approver behavior;
- self-approval guard;
- accepted shared-principal isolation limitation;

requires explicit user decision and Baseline update in the same control cycle.
