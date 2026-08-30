# CONFIRMED BASELINE — D1 AUTHENTICATION & ACCESS SECURITY

> Status: **CONFIRMED / CURRENT D1 ARCHITECTURE**  
> Reconfirmed by user: **2026-08-30 — KINTONE-ONLY HYBRID IDENTITY + approved blocker-resolution design**  
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

Canonical identity architecture:

```text
HYBRID_IDENTITY = DEDICATED_KINTONE_AUTO_BIND + SHARED_ACCOUNT_MBO_LOGIN
```

Two employee entry modes are supported:

```text
A. Dedicated Kintone User
   Kintone authenticated principal
     -> exact App53 MBO_Kintone_User mapping
     -> exactly one active canonical emp_text Employee_Code
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

Dedicated Kintone users do not require App801 access solely to prove their Employee-Self identity.

---

## 2. Identity Modes & Resolution Precedence

### 2.1 Dedicated Kintone User mode

Canonical physical mapping design is confirmed in `D1_HYBRID_IDENTITY_ACCESS_DESIGN.md`:

```text
App53 Field Code = MBO_Kintone_User
Type             = USER_SELECT
```

Canonical rule:

```text
current Kintone User Code
  -> exactly one active App53 row whose MBO_Kintone_User contains that exact user
  -> Number_0 = 1
  -> valid canonical emp_text Employee_Code
  -> DEDICATED_KINTONE_IDENTITY_BOUND
```

Required behavior:
- no secondary Employee_Code/password prompt after successful exact auto-binding;
- do not ask the user to choose another employee identity;
- exactly one active App53 mapping row is required;
- exactly one dedicated user must be selected for a valid mapping row;
- missing mapping -> `IDENTITY_MAPPING_MISSING` / fail closed;
- duplicate/ambiguous mapping -> `IDENTITY_MAPPING_AMBIGUOUS` / fail closed;
- missing/invalid `emp_text` -> fail closed;
- do not infer mapping from display name, email similarity, Section, Team, Position, App795 approver membership, Vendor Account Number, or guessed employee code;
- `admin-form` is always excluded from Employee-Self auto-binding and remains Technical Admin only.

Current audit examples:

```text
Vassana: vassana -> App53 #456 -> emp_text 0044 -> Active 1
Natta:   natta   -> App53 #578 -> emp_text BLANK -> Active 1
```

Therefore Natta remains fail-closed until the real canonical Employee_Code is verified/corrected in App53 under a separate protected write authorization.

The `MBO_Kintone_User` field is approved as design but is **not yet live-created**. App53 schema/record writes require a separate explicit authorization.

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

Runtime must distinguish dedicated and shared principals from authoritative configuration, not from a user-selectable UI toggle.

A shared principal must not accidentally auto-bind to one employee. A dedicated principal with a missing/ambiguous/incomplete mapping must not silently fall back to shared MBO identity.

---

## 3. Dual-Role Employee + Approver Model

A single person may simultaneously be:
- an Employee who owns exactly one MBO record per Fiscal Year; and
- an Approver/Appraiser for other employees' MBO records.

Confirmed user examples include Natta and Vassana.

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

### 3.1 Self-Approval Default Guard

Self-approval is prohibited. No route may allow a user to actually approve their own MBO.

### 3.2 Explicit Approved Own-MBO Self-Appraiser Exception

User approved the recommended narrow exception on 2026-08-30:

```text
OWN_MBO_SELF_APPROVER_ELISION = APPROVED
```

When the authoritative resolved route for the employee's **own MBO only** contains the same dedicated Kintone user as an appraiser:
- remove only that self appraiser from the effective route **before** workflow snapshot creation;
- preserve the remaining appraisers in order;
- shift remaining appraisers left and recalculate effective topology;
- never auto-approve;
- never fabricate approval history/comment/timestamp;
- never alter App795 subordinate routes to solve the own-record case;
- if no non-self appraiser remains, fail closed.

Confirmed Natta example:

```text
Master route TMG1|Marketing = natta -> uchida
Natta own effective route   = uchida
Natta own effective topology = M1_ONLY
Other TMG1/TMG2 Marketing employees remain = employee -> natta -> uchida
```

Detailed canonical semantics are in `D1_HYBRID_IDENTITY_ACCESS_DESIGN.md`.

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

Dedicated Kintone users authenticate through Kintone itself. `Reset MBO Password` must never be described as resetting a Kintone/cybozu password. Whether an App801 credential row remains present for a dedicated user as dormant/fallback data is not authorization to use that row for identity.

### HR / Technical Admin Password Reset

A controlled MBO Password Reset function is mandatory for:

```text
HR-authorized users
admin-form (Technical Admin / recovery)
```

Employee/shared principals must not receive this administrative reset function.

Reset semantics for selected Employee_Code:
- reset temporary MBO password to exact Employee_Code using canonical PBKDF2-SHA256 / 100000;
- `Force_Password_Change = YES`;
- `Failed_Attempts = 0`;
- clear temporary `Locked_Until`;
- increment positive-integer `Credential_Version` by exactly 1;
- clear all active App801 session fields;
- may update `Password_Changed_At`;
- MUST NOT change `Account_Status` or silently re-enable permanent `LOCKED` / `DISABLED`;
- target exactly one existing App801 row and fail closed on missing/duplicate/malformed identity;
- no credential record create/delete is part of password reset.

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

Confirmed behavior:
- `DISABLED` = deny;
- permanent `LOCKED` = deny;
- malformed credential/account state = fail closed;
- wrong password increments `Failed_Attempts`;
- 5 failed attempts trigger 15-minute temporary lock via `Locked_Until`;
- successful login resets applicable failed-attempt state and updates `Last_Login_At`;
- `Force_Password_Change=YES` blocks Employee-Self content until mandatory password change succeeds;
- shared-path session restore also denies disabled/locked/forced-change accounts.

Dedicated Kintone authentication/account lockout remains governed by Kintone/cybozu and is not reimplemented in App801.

---

## 6. Employee-Self & Approver Gate Coverage

The App794 identity/access gate applies to:
- index/home;
- create;
- detail;
- edit;
- Approver task entry.

Employee-Self rules:
- `My MBO` is scoped to the bound Employee_Code regardless of identity mode;
- gate initialization/identity-resolution failure fails closed;
- required custom host/space absence fails closed;
- Employee-Self detail/edit Employee_Code mismatch shows visible blocking state;
- create uses bound Employee_Code automatically without asking the user to type another identity.

Approver rules:
- `My Approval Tasks` is available only for a legitimate dedicated business actor and records currently assigned to that principal by authoritative Workflow state;
- Approver context does not widen `My MBO` ownership;
- shared employee sessions do not gain approval authority because several employees use the same shared account;
- current native Workflow assignment must be revalidated on approval record open/action;
- self-approval behavior follows Section 3.

Create flow reuses the established business path:

```text
Bound Employee_Code
  -> App53 employee lookup/snapshot
  -> App795 authoritative route
  -> approved own-MBO self-appraiser transformation when applicable
  -> effective Requester_User resolution
  -> App796 scoring/profile lookup
  -> duplicate check
  -> Record_Key generation
  -> snapshot/current-record preparation
```

Do not duplicate routing/scoring/duplicate logic in auth code.

---

## 7. Native Kintone Access Groups

### 7.1 Shared MBO-login group

Approved existing group:

```text
MBO_EMPLOYEE_ACCESS
```

This remains the native access boundary for shared MBO-login principals requiring browser-direct App801 access.

Current shared principals:

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

### 7.2 Dedicated Kintone employee/approver group — approved design

Dedicated users must not be placed into `MBO_EMPLOYEE_ACCESS` merely to make Hybrid Identity work.

Approved separate group design:

```text
MBO_DEDICATED_ACCESS
```

Target App794 App-level permission:

```text
View records   = YES
Add records    = YES
Edit records   = YES
Delete records = NO
Import         = NO
Export         = NO
App Admin      = NO
```

This App-level grant must be constrained by native App794 Record Permissions. App-level permission alone is not accepted as dedicated authorization.

Kintone Record Permissions support `FIELD_ENTITY` user fields. Approved target architecture uses the existing App794 user fields with status-aware conditions:

```text
Requester_User      -> own dedicated MBO principal
First_Manager_User  -> first-manager review stages
Manager_User        -> manager review stages
GM_User             -> GM review stages
```

Rules:
- own requester can view own MBO through lifecycle;
- own requester edit rights are only for requester/employee-controlled statuses;
- approver view/edit exists only at the corresponding current review status;
- prior approver access must disappear after transition/reassignment unless another valid role applies;
- HR final remains HR-native authority;
- completed own MBO is viewable but not Employee-Self editable;
- static App795 membership is never enough.

Exact ACL payload/write/readback requires a separate protected authorization and independent review. See `D1_HYBRID_IDENTITY_ACCESS_DESIGN.md`.

---

## 8. App801 App ACL Target — Shared KINTONE-ONLY Requirement

For browser-direct shared-account authentication, `MBO_EMPLOYEE_ACCESS` requires:

```text
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

Dedicated users do not receive App801 View/Edit solely for Hybrid Identity.

### Security ceiling of the shared path

A shared Kintone principal with App801 View/Edit may technically call native/direct Kintone REST outside custom UI and read credential/session records or submit permitted updates. Kintone browser customization has no elevated secret execution context that can read App801 while simultaneously denying the same underlying principal that REST capability.

This limitation MUST remain documented. Do not claim hard Employee_Code-level isolation under a shared Kintone account.
Do NOT embed Kintone API tokens or privileged credentials in browser JavaScript as a workaround.

---

## 9. App53 Employee / Identity Eligibility

App53 Employee Namelist remains source of truth.

```text
Field Code = Number_0
1 = Active/current
0 = Inactive/former
blank = unknown / not accepted as Active
```

Canonical Employee_Code source:

```text
emp_text = Employee ID / canonical Employee_Code
```

Employee candidate requires:
1. `Number_0 = 1`;
2. non-blank valid `emp_text`;
3. exactly one active App53 row for that Employee_Code.

Dedicated auto-binding additionally requires:
4. exact `MBO_Kintone_User` match to current dedicated Kintone User;
5. exactly one active mapping row;
6. mapping row selects exactly one dedicated user.

Duplicate active Employee_Code or mapping values fail closed. No synthetic replacement Employee_Code may be invented.

---

## 10. Dedicated Create-Path Security Ceiling

Dedicated users require native App794 Add permission under the current Kintone-only architecture. Normal UI/source must derive Employee_Code from the authoritative App53 mapping and expose no employee selector.

Browser customization is not a privileged server-side enforcement layer. Final D1 review must not claim stronger direct-REST create-field integrity than Kintone native permissions can actually prove. Any remaining Kintone-only direct-REST creation limitation must be documented explicitly rather than hidden by UI claims.

---

## 11. Final D1 UAT Closure

D1 cannot close on source implementation alone.

### Dedicated Kintone User path
- exact mapped dedicated user opens App794 and auto-binds without secondary MBO login;
- `My MBO` shows only bound Employee_Code;
- dedicated user can create/open own MBO through normal Employee-Self rules;
- independent new tab under same native Kintone session auto-binds again;
- missing/ambiguous/incomplete mapping fails closed;
- dedicated dual-role user sees `My Approval Tasks` separately from `My MBO`;
- only authoritative current native assignments are actionable;
- opening an unassigned arbitrary employee record is denied by native permission/runtime gates;
- Natta own effective route must remove `natta`, expose `uchida` as sole effective appraiser, and contain no fabricated/self approval event;
- transition away removes prior Approver access;
- dedicated path never exposes/pretends to change Kintone password through MBO password UI.

### Shared Kintone User path
- initial App794 entry without valid MBO session shows Login;
- valid employee credential works under approved shared principal;
- Force Password Change works;
- same-tab continuity across List/Create/Detail/Edit/reload;
- new independent tab without MBO token requires Login;
- expired/tampered/wrong-principal session fails closed;
- Change Password verifies current password and rotates session;
- lockout behavior works;
- Logout revokes/clears and re-blocks.

### Common / administrative gates
- HR-authorized user and `admin-form` can reset one selected App801-backed employee MBO password with exact semantics;
- unauthorized employee/shared users do not receive reset capability;
- reset is not Kintone/cybozu password reset;
- My MBO own-only/history/Completed/no-delete behavior remains accepted;
- create uses bound Employee_Code -> App53 -> App795 -> App796 -> duplicate -> snapshot path;
- no raw session token/plaintext password/Password_Hash in normal UI/DOM/logs;
- Live workflow/comment timeline never fabricates events;
- attachments remain truthful;
- final independent D1 review = PASS.

D1 remains open until ChatGPT independently reviews final live UAT evidence.

---

## 12. Change Rule

Any future change to:
- Kintone-only / no-external-service constraint;
- hybrid dedicated-vs-shared identity-mode selection;
- `MBO_Kintone_User` dedicated mapping design/semantics;
- App801 credential format / ACL model;
- `MBO_EMPLOYEE_ACCESS` shared-principal model;
- `MBO_DEDICATED_ACCESS` dedicated-principal model;
- dedicated status-aware FIELD_ENTITY Record ACL design;
- HR / `admin-form` password-reset authority;
- shared-path session architecture;
- Employee-Self identity binding;
- Approver authoritative-assignment rules;
- dual-role behavior;
- own-MBO self-appraiser exception;
- accepted Kintone-only isolation limitations;

requires explicit user decision and Baseline update in the same control cycle.
