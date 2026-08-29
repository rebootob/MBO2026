# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual execution is required
> Updated: 2026-08-29

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|---|
| D1 | Login + Password Change + Employee-Self MBO Gate | 🟠 SOURCE GATES PASS / LIVE AUTH BLOCKED BY APP801 PERMISSION BOUNDARY / AUTH ARCHITECTURE DECISION REQUIRED / DEPLOY GUARD OPEN / FINAL UAT BLOCKED |
| D2 | Excel + PDF legacy-format export | 🟠 IN PROGRESS |
| D3 | 8 legacy PMS apps -> App794 | 🟠 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | App800 HR Control Center end-to-end | 🟠 IN PROGRESS |
| D5 | Copy own previous MBO only | 🔴 MUST FIX |
| D6 | Integrated E2E / Security / Regression | 🔴 BLOCKED |
| D7 | Admin Support Center | ✅ SOURCE FUNCTIONALITY CLOSED / MODULE-AWARE BUNDLE DEPENDENCY CLOSURE ACCEPTED |

No AI may silently drop D1–D7.

## 2. Gate Ledger

```text
D1_SESSION_CONTINUITY_ARCHITECTURE       = PASS / BASELINED
APP801_SESSION_SCHEMA_WRITE              = PASS / ACCEPTED
APP794_SESSION_CONTINUITY_DEPLOY         = EXECUTED / REVISION 43 / PARTIAL RUNTIME ACCEPTANCE
D1_SESSION_LIST_TO_CREATE_CONTINUITY     = PASS / USER LIVE OBSERVATION
D1_BUNDLE_DEPENDENCY_CORRECTIVE          = PASS / ACCEPTED AT 2a766d0e...
D1_CREATE_HANDLER_CORRECTIVE             = PASS / ACCEPTED AT 162d1088...
D1_EMPLOYEE_SELF_INDEX_SOURCE_TEST       = PASS / ACCEPTED AT 9319be2d...
D1_EMPLOYEE_SELF_INDEX_VISUAL            = PASS / USER APPROVED 2026-08-29
D1_MY_MBO_HISTORY_LIST                   = PASS
D1_MY_MBO_COMPLETED_STATUS_DISPLAY       = PASS
D1_EMPLOYEE_SELF_DELETE_GUARD            = PASS / ACCEPTED AT 1b2930eb...
APP801_SHARED_PRINCIPAL_ACCESS           = DENIED / LIVE VERIFIED CB_NO02 FOR s1
D1_BROWSER_DIRECT_APP801_AUTH            = BLOCKED / ARCHITECTURE CONFLICT CONFIRMED
APP794_DELETE_PERMISSION_READONLY_CHECK  = DEFERRED UNTIL AUTH WORKS
APP794_DEPLOY_GUARD_INTEGRATION          = OPEN / MUST CLOSE BEFORE FUTURE LIVE DEPLOY
D1_LIVE_CUTOVER                          = BLOCKED
D2-D7 LIVE WRITES                        = NOT AUTHORIZED unless separately recorded
```

No new App794 deploy is authorized.
No App801 ACL widening is authorized.

## 3. Live Security Finding — App801 / Shared Principal

User live verification on 2026-08-29 established:
- App801 credential row for Employee_Code `0113` exists and is healthy: `Account_Status=ACTIVE`, `Failed_Attempts=0`, `Locked_Until` blank, `Force_Password_Change=NO`, `Credential_Version=1`;
- Kintone shared principal `s1` cannot open App801 and receives `CB_NO02`;
- direct REST read from App794 browser as `s1` to App801 also returns HTTP 403 / `CB_NO02`;
- therefore the current browser-direct auth adapter cannot authenticate Employee `0113` under `s1` even though the credential itself is valid;
- the Login UI currently maps this generic credential-denied condition to the misleading text `Account is locked or disabled. Please contact HR.`

Security interpretation:
- current App801 ACL is correctly protecting the credential store from the shared Kintone principal;
- widening App801 READ/UPDATE to `s1` would make browser-direct auth work but would expose the credential store and session metadata to a shared principal via REST, which is not acceptable as the default correction;
- do not put an App801 API token, privileged Kintone credential, or equivalent secret inside App794 browser JavaScript.

## 4. Required Architecture Decision

Preferred correction:

```text
App794 Browser
  -> Trusted Auth Bridge (HTTPS)
      -> App801 via server-side Kintone credential/API token
```

Required properties:
- App801 remains private from `s1`;
- browser never reads `Password_Hash` or App801 session metadata directly;
- privileged Kintone secret exists only server-side;
- bridge exposes only narrow auth/session endpoints;
- existing Employee-Self UI and My MBO behavior stay in App794;
- direct App801 browser calls are removed from the production dependency path;
- Login UI maps stable error codes accurately instead of showing lock/disable for every denial;
- final UAT must prove `s1` still gets CB_NO02 when trying App801 directly while MBO Login works through the bridge.

Alternative Kintone-only behavior may be considered only with explicit acceptance of the shared-principal exposure limitation. Do not implement by silently widening App801 ACL.

## 5. Exact Next Action

```text
NEXT_ACTION_OWNER              = USER + CONTROL PLANE
ANTIGRAVITY_REQUIRED           = NO / HOLD UNTIL ARCHITECTURE APPROVED
ACTION                         = DECIDE D1 AUTH BRIDGE ARCHITECTURE
KINTONE_WRITE                  = NO
APP794_DEPLOY                  = NO
APP801_ACL_WRITE               = NO
APP801_RECORD_WRITE            = NO
DEPLOY_GUARD_FIX               = NO UNTIL AUTH SOURCE PLAN IS APPROVED
D2_D7_WRITE                    = NO
```

After Auth architecture approval:
1. issue one narrow Source/Test work package for Auth Bridge + browser adapter boundary;
2. independent review;
3. close Deploy Guard Integration;
4. request exact live authorization for bridge secret/config and one combined App794 corrective deploy;
5. run final D1 UAT including no direct App801 access for `s1`.

## 6. Reusable Lessons

- A browser customization cannot securely use a shared Kintone principal to read a private credential store without exposing that store to the same principal.
- App801 ACL denial for `s1` is a security control, not a defect to bypass casually.
- Privileged App801 access must remain outside browser-delivered JavaScript.
- Error UI must preserve the difference between invalid credentials, locked/disabled account, and authorization/service failures.
