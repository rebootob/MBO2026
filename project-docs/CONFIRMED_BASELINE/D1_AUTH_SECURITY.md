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

## 2. MBO Login Identity / Session Continuity

Username = `Employee_Code` and Password = the MBO password stored/managed through App801.

Successful authentication binds Employee Self context to the exact authenticated Employee_Code. The user must not be asked to select/re-enter Employee ID after successful login, and employee A must not be able to switch the custom Employee Self context to employee B.

The former PAGE-MEMORY-ONLY rule is superseded by the explicitly approved short-lived session-continuity architecture in:

```text
project-docs/CONFIRMED_BASELINE/D1_SESSION_CONTINUITY.md
```

Current rule:
- initial entry without a valid MBO session shows Login;
- a validated short-lived session may survive normal same-tab App794 page navigation/reload;
- raw session token is stored only in `sessionStorage` for the current tab;
- App801 stores only token hash + session metadata;
- browser-stored Employee_Code/authenticated flags are not trusted as identity proof;
- session restore must revalidate App801 account/session state and current Kintone principal;
- tab/browser-session close, expiry, invalid/tampered session, or failed validation requires Login again;
- localStorage/cookie/custom persistent auth tokens remain forbidden.

Logout clears the in-page principal, clears browser session token, revokes the server-side session when resolvable, and returns to the blocking MBO Login gate.

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

`Credential_Version` is a positive-integer credential generation marker and is also used by the approved session-continuity model to invalidate sessions across password changes.

---

## 4. Account State / Lockout

Confirmed behavior:
- `DISABLED` = deny;
- `LOCKED` = deny;
- malformed lockout/auth state = fail closed;
- wrong-password attempts increment `Failed_Attempts`;
- 5 failed attempts trigger 15-minute lockout;
- successful login resets the applicable failed-attempt state and updates `Last_Login_At`;
- forced-password-change state is controlled by `Force_Password_Change=YES`;
- session restoration must also deny disabled/locked/forced-change accounts.

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

Security limitation remains: a Kintone principal granted App801 View/Edit through the shared/access group may technically use native/direct Kintone REST outside the custom UI to read credential hashes or mutate credential/session records. This risk is inherent to the approved Kintone-only shared-principal model and must remain documented.

---

## 8. App53 Credential Candidate Eligibility

App53 Employee Namelist is the employee source of truth for deciding which employee identities may receive App801 MBO credentials.

Confirmed employee active-status semantics:

```text
Field Code = Number_0
Label      = Status
Type       = NUMBER
1          = Active / current employee
0          = Inactive / former employee
blank      = unknown / not accepted as Active
```

The Kintone system field code `Status` is not the employee Active/Inactive source.

A credential candidate must satisfy all of the following:

```text
1. App53 Number_0 = 1.
2. Employee_Code source value (`emp_text`) is present and non-blank.
3. That Employee_Code identifies exactly one active App53 employee row.
```

Rules:
- Employee_Code is an identifier string, not a numeric quantity.
- Do **not** invent a numeric-only validation rule.
- Values containing punctuation or underscores, such as `50.03`, `50.02`, or `0050_2`, remain eligible when they otherwise satisfy the Active + non-blank + unique rule.
- A blank Employee_Code cannot receive an App801 credential because D1 Username and initial/default password are both Employee_Code; such rows remain excluded until App53 source data is corrected.
- When the same Employee_Code exists on more than one active App53 row, fail closed for that code. Do not arbitrarily choose one row and do not silently deduplicate. All conflicting active rows for that Employee_Code remain excluded until the App53 source-of-truth conflict is resolved.
- `Number_0 = 0` rows are excluded from the active candidate population.
- blank `Number_0` rows fail closed and do not receive credentials until App53 source status is corrected/confirmed.
- Do not create a credential for an employee code that is absent from App53.
- Provisioning must preserve the canonical Employee_Code identity semantics used by the authenticated Employee-Self gate; no synthetic replacement code may be invented during provisioning.

Candidate-set counts are operational evidence and belong in `AI_CONTROL_CENTER.md` / execution evidence, not in this durable Baseline.

---

## 9. Live Cutover / UAT Closure Rule

Source implementation alone cannot close D1.

Final D1 closure requires live manual UI UAT proving at minimum:
- blocking Login on initial App794 entry without valid session;
- initial/default credential behavior;
- Force Password Change;
- same-tab session continuity across List/Create/Detail/Edit and reload;
- new tab/browser session without token requires Login;
- expired/tampered/wrong-principal session fails closed;
- new password login works;
- wrong-password / lockout behavior;
- normal Change Password requires current password and rotates session;
- Logout revokes/clears session and re-blocks;
- Employee A custom My MBO list shows only A's ordinary UI items;
- create autoload path completes without Employee ID re-entry;
- Employee A opening Employee B detail/edit is visibly blocked;
- no raw session token, Password_Hash, or plaintext password appears in normal UI/DOM/logs;
- no trusted Employee_Code/authenticated flag is taken from user-tamperable browser storage.

D1 is not PASS/CLOSED until ChatGPT independently reviews the final live UAT evidence.

The separate Create-handler defect documented in `D1_SESSION_CONTINUITY.md` must also be resolved before D1 closure.

---

## 10. Change Rule

Any future change to:
- Kintone-only architecture;
- App801 credential format;
- short-lived session architecture / token lifetime / storage model;
- `MBO_EMPLOYEE_ACCESS` group model;
- App801 ACL model;
- Employee Self identity binding;
- App53 `Number_0` active-status semantics;
- credential-candidate eligibility semantics;
- lockout/password rules;
- D1 hard-isolation limitation;

requires explicit user/Control Plane decision and must be updated in the applicable Confirmed Baseline in the same control cycle.