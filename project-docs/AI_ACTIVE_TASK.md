# AI ACTIVE TASK — D1 KINTONE-ONLY LIVE CUTOVER AUTHORIZATION GATE

> Control Plane: ChatGPT
> Execution Plane: Antigravity
> Repository: `rebootob/MBO2026`
> Working branch: `ai/antigravity-wp002c`
> Independently reviewed source commit: `63796999a321a24e1cbd29ceaad82b43980fe8ea`
> Mode: CONTROL / PLAN ONLY — NO LIVE KINTONE WRITE OR DEPLOY WITHOUT EXPLICIT USER AUTHORIZATION

## 0. INDEPENDENT SOURCE REVIEW RESULT

D1 Kintone-only source implementation is accepted for the next gate.

Accepted source behavior:
- real blocking MBO Login UI;
- Username = Employee_Code;
- WebCrypto PBKDF2-SHA256 `pbkdf2$100000$<saltHex>$<hashHex>`;
- page-memory authentication only; reload/re-entry requires login again;
- Force Password Change UI;
- normal Change Password requires Current Password;
- Logout clears page-memory and reloads;
- failed attempts + 15-minute temporary lockout;
- `Account_Status=LOCKED` and `DISABLED` deny;
- malformed failed-attempt / lockout state fails closed;
- force password change requires `Force_Password_Change=YES`;
- App794 index/list Employee Self view queries only authenticated Employee_Code and hides the unrestricted native list;
- create/detail/edit gate fail-closed on missing gate/host;
- authenticated create awaits existing App53 -> App795 -> App796 -> duplicate -> Record_Key -> snapshot resolution;
- detail/edit employee mismatch blocks custom UI and hides native fields;
- authenticated Employee Self does not expose Employee_Code lookup/selector;
- blocked dynamic values use safe DOM text nodes/textContent.

Known architecture limitation remains:
`DIRECT_URL_REST_HARD_ISOLATION = NOT_GUARANTEED_UNDER_SHARED_KINTONE_ACCOUNT`.

GitHub has no CI/status/workflow evidence for the implementation commit. Do not claim CI PASS. Manual Kintone UI UAT remains mandatory before D1 closes.

## 1. LIVE CUTOVER IS NOT YET AUTHORIZED

Do NOT perform any of the following until ChatGPT records explicit user authorization:
- App801 app permission change;
- App801 record permission change;
- App801 credential provisioning/update;
- App794 customization upload/deploy;
- App794 ACL change;
- migration or D2-D7 work.

Current mandatory counters remain:

```text
KINTONE_WRITES_EXECUTED = 0
KINTONE_DEPLOY_EXECUTED = 0
APP801_ACL_CHANGE_EXECUTED = 0
```

## 2. LIVE APP801 FACT + SECURITY TRADE-OFF

Current live fact from prior read-only reconciliation:

```text
APP801_APP_ACL_CURRENT:
  CREATOR:null => full app/record rights
  GROUP:everyone => view/add/edit/delete/import/export = false
APP801_RECORD_ACL_CURRENT = NONE
SHARED_EMPLOYEE_CAN_READ_APP801 = NO
SHARED_EMPLOYEE_CAN_UPDATE_APP801 = NO
```

The Kintone-only browser login needs the shared employee Kintone principal to:
1. READ App801 credential data needed to verify Password_Hash;
2. UPDATE App801 for failed attempts, Last_Login_At, and own password change.

Because employees share one Kintone principal, native Kintone ACL cannot distinguish employee 0118 from 0119 inside App801. If that shared principal receives App801 read/edit rights, a technically capable user using direct Kintone REST can potentially read credential hashes and modify credential records outside the custom UI gate.

This is an inherent Kintone-only/shared-account limitation. Do not hide or overstate it.

Preferred minimum live permission change, once the exact shared Kintone USER code is proven and the user explicitly accepts the trade-off:
- grant ONLY that exact shared Kintone USER principal the minimum App801 record rights required for browser login/password lifecycle;
- prefer View=YES, Edit=YES, Add=NO, Delete=NO, Import=NO, Export=NO;
- do not broaden to `GROUP:everyone` unless separately justified and explicitly authorized;
- preserve creator/admin recovery access.

Do not invent the shared Kintone user code. Prove it before write.

## 3. CREDENTIAL PROVISIONING GATE

Before any credential write, establish exact current App801 credential state read-only:
- number of employee credential records;
- duplicate Employee_Code records;
- missing App53 employees;
- malformed hashes/status/force-change values;
- whether initial Employee_Code/Employee_Code credential provisioning is already complete.

If provisioning is required, prepare an exact dry-run candidate only. Initial/default password is Employee_Code and must be stored only as PBKDF2 hash. No plaintext persistence.

Actual provisioning remains a separate explicit Kintone WRITE authorization.

## 4. CUSTOMIZATION DEPLOYMENT GATE

Source artifact currently includes rebuilt `dist/mbo-employee-app.js` from the accepted D1 source.

Before deployment:
- identify exact current App794 JavaScript customization slots/files;
- exact file to replace/add;
- backup/read-back plan;
- rollback artifact/version;
- no unrelated customization replacement.

Actual upload/deploy remains separate explicit authorization.

## 5. REQUIRED MANUAL UAT BEFORE D1 CLOSE

After separately authorized ACL/provision/deploy actions, manual UI UAT must prove at minimum:
1. enter App794/list -> MBO Login appears;
2. initial/default Employee_Code password behavior;
3. Force Password Change completes;
4. reload/re-entry asks Login again;
5. new password login succeeds;
6. wrong password denied and lockout behavior visible;
7. Change Password requires correct current password;
8. Logout immediately returns to Login on reload;
9. login 0118 -> My MBO list shows only 0118 ordinary UI items;
10. create -> App53/App795/App796/Record_Key autoload completes without Employee ID re-entry;
11. detail/edit record 0119 while authenticated 0118 -> blocked UI;
12. no Password_Hash/raw credential secret rendered in normal UI/DOM/storage;
13. residual Access Check: 0118 own = ALLOW, 0119 = BLOCK in custom Employee Self path.

Known limitation to document in UAT sign-off:
- direct REST/native hard employee isolation is not guaranteed under the shared Kintone account.

## 6. CURRENT STATUS / NEXT ACTION

```text
D1_SOURCE = PASS / ACCEPTED
D1_LIVE_CUTOVER = BLOCKED_PENDING_EXPLICIT_USER_AUTHORIZATION
D1_MANUAL_UAT = NOT_STARTED_FOR_LIVE_KINTONE_ONLY_BUILD
```

Execution Plane must STOP. Do not make live changes until a new explicitly authorized task is issued.

---

# PROJECT CONTROL

- D1 Login + password change + employee-self MBO gate = IN_PROGRESS / SOURCE ACCEPTED / LIVE CUTOVER AUTHORIZATION REQUIRED
- D2 Excel + PDF legacy-format export = IN_PROGRESS
- D3 migrate Apps 283,310,305,643,307,640,715,716 -> App794 = IN_PROGRESS / WRITE NOT AUTHORIZED
- D4 App800 HR Control Center end-to-end lifecycle = IN_PROGRESS
- D5 copy ONLY own prior Objective / Action Plan / Additional Agreement / Weight = MUST_FIX
- D6 integrated E2E/security/regression = BLOCKED
- D7 Admin Support Center = PASS / CLOSED
