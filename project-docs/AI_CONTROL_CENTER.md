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
| D1 | Login + Password Change + Employee-Self MBO Gate | 🟠 AUTH BRIDGE ARCHITECTURE APPROVED / PRIOR SOURCE GATES PASS / BRIDGE WP1 ACTIVE / LIVE CUTOVER BLOCKED |
| D2 | Excel + PDF legacy-format export | 🟠 IN PROGRESS |
| D3 | 8 legacy PMS apps -> App794 | 🟠 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | App800 HR Control Center end-to-end | 🟠 IN PROGRESS |
| D5 | Copy own previous MBO only | 🔴 MUST FIX |
| D6 | Integrated E2E / Security / Regression | 🔴 BLOCKED |
| D7 | Admin Support Center | ✅ SOURCE FUNCTIONALITY CLOSED / MODULE-AWARE BUNDLE DEPENDENCY CLOSURE ACCEPTED |

No AI may silently drop D1–D7.

## 2. Gate Ledger

```text
D1_AUTH_BRIDGE_ARCHITECTURE              = PASS / USER APPROVED + BASELINED 2026-08-29
D1_BROWSER_DIRECT_APP801_AUTH             = SUPERSEDED / BLOCKED BY DESIGN
APP801_SHARED_PRINCIPAL_ACCESS            = DENIED / LIVE VERIFIED CB_NO02 FOR s1
APP801_EMPLOYEE_FACING_PRIVACY            = KEEP PRIVATE / NO ACL WIDENING
D1_SESSION_CONTINUITY_ARCHITECTURE        = PASS / UPDATED TO BRIDGE TRANSPORT
APP801_SESSION_SCHEMA_WRITE               = PASS / ACCEPTED
APP794_SESSION_CONTINUITY_DEPLOY           = EXECUTED / REVISION 43 / OLD BROWSER-DIRECT PATH
D1_SESSION_LIST_TO_CREATE_CONTINUITY      = PASS / USER LIVE OBSERVATION
D1_BUNDLE_DEPENDENCY_CORRECTIVE           = PASS
D1_CREATE_HANDLER_CORRECTIVE              = PASS
D1_EMPLOYEE_SELF_INDEX_SOURCE_TEST        = PASS
D1_EMPLOYEE_SELF_INDEX_VISUAL             = PASS
D1_MY_MBO_HISTORY_LIST                    = PASS
D1_MY_MBO_COMPLETED_STATUS_DISPLAY        = PASS
D1_EMPLOYEE_SELF_DELETE_GUARD             = PASS
D1_AUTH_BRIDGE_WP1_CORE                   = ACTIVE / SOURCE+TEST ONLY
D1_AUTH_BRIDGE_WP2_BROWSER_INTEGRATION    = PENDING AFTER WP1 REVIEW
APP794_DELETE_PERMISSION_READONLY_CHECK   = PENDING / AFTER AUTH PATH RESTORED OR ADMIN ACL READBACK
APP794_DEPLOY_GUARD_INTEGRATION           = OPEN / AFTER BRIDGE SOURCE INTEGRATION
D1_LIVE_CUTOVER                           = BLOCKED / NO LIVE AUTH BRIDGE YET
D2-D7 LIVE WRITES                         = NOT AUTHORIZED unless separately recorded
```

No new App794 deploy is authorized.
No App801 ACL widening is authorized.
No Auth Bridge live deployment, secret creation, or production Kintone API token is authorized in WP1.

## 3. Accepted Live Security Evidence

2026-08-29 user-side verification established:
- Employee_Code `0113`: `Account_Status=ACTIVE`, `Failed_Attempts=0`, `Locked_Until` blank, `Force_Password_Change=NO`, `Credential_Version=1`;
- shared Kintone principal `s1` cannot open App801 and receives `CB_NO02`;
- `s1` direct REST read of App801 also receives HTTP 403 / `CB_NO02`;
- former browser-direct adapter therefore cannot operate without weakening App801 privacy;
- Login UI currently mislabels generic credential-denied failures as locked/disabled.

Decision:
- keep App801 private;
- do not grant `s1`, `MBO_EMPLOYEE_ACCESS`, or Everyone App801 credential-store access;
- privileged App801 access moves to Auth Bridge server side only.

## 4. Approved Auth Bridge Architecture

Canonical Baselines:
- `project-docs/CONFIRMED_BASELINE/D1_AUTH_SECURITY.md`
- `project-docs/CONFIRMED_BASELINE/D1_SESSION_CONTINUITY.md`

Canonical flow:

```text
App794 Browser
  -> HTTPS Auth Bridge
      -> App801 using server-side-only least-privilege credential/API token
```

Preserved behaviors:
- PBKDF2-SHA256 / 100000;
- initial password = Employee_Code + Force Change;
- 5 failures -> 15-minute lock;
- 8-hour absolute same-tab opaque session;
- one active session per Employee_Code;
- Credential_Version binding;
- logout + normal password-change session rotation;
- My MBO / Create / History / No-Delete behavior.

New mandatory boundary:
- production browser has zero direct App801 credential/session GET/PUT calls;
- browser never receives Password_Hash, Session_Token_Hash, App801 API token or Bridge secret;
- employee/shared principal continues to receive CB_NO02 for direct App801 access.

## 5. Implementation Sequence

### WP1 — Auth Bridge Core / Contract — ACTIVE
Source/test/local only:
- provider-neutral Node.js 20 service;
- no production secrets;
- no live Kintone calls;
- mock/injected App801 repository in tests;
- implement auth/password/lockout/session/force-change-ticket contract;
- document environment names only;
- browser production path remains untouched in WP1.

### WP2 — Browser Integration — PENDING
After independent WP1 PASS:
- add `mbo-auth-bridge-adapter.js`;
- route login/session/password/logout through Bridge;
- remove browser-direct App801 adapter from production dependency path;
- correct UI error mapping;
- prove production bundle has zero direct App801 credential/session calls.

### WP3 — Deploy Safety / Live Cutover — PENDING
After WP2 PASS:
- select/approve hosting;
- create server-side secret/API token under exact authorization;
- close App794 Deploy Guard Integration;
- deploy Bridge + one combined App794 corrective package;
- final D1 UAT.

## 6. Exact Next Action

```text
NEXT_ACTION_OWNER              = Antigravity
ANTIGRAVITY_REQUIRED           = YES — WP1 SOURCE/TEST ONLY
KINTONE_WRITE                  = NO
APP794_DEPLOY                  = NO
APP801_ACL_WRITE               = NO
APP801_RECORD_WRITE            = NO
AUTH_BRIDGE_LIVE_DEPLOY        = NO
PRODUCTION_SECRET_CREATION     = NO
DEPLOY_GUARD_FIX               = NO IN WP1
D2_D7_WRITE                    = NO
MAX_EXECUTOR_STATUS            = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

## 7. Reusable Lessons

- Shared Kintone principals must not be granted direct access to a credential store merely to make browser authentication work.
- Privileged credential verification belongs behind a server-side trust boundary when browser principals are shared.
- CORS is useful transport hardening but is not a secret/authentication mechanism by itself.
- Error UI must distinguish credential, account-state, rate-limit and service failures without exposing credential internals.
