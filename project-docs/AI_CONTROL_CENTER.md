# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.  
> Repository: `rebootob/MBO2026`  
> Branch: `ai/antigravity-wp002c`  
> Control Plane: ChatGPT  
> Execution Plane: Antigravity only when actual execution is required  
> Updated: 2026-08-28

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|---|
| D1 | Login + Password Change + Employee-Self MBO Gate | 🟠 GROUP+APP801 ACL PASS / CANDIDATE PASS=128 / APP801 PROVISIONING PASS / SOURCE CORRECTIVE PASS / LIVE LOGIN GATE RECOVERED / UAT DEFECT: INTERNAL NAVIGATION REQUIRES RE-LOGIN |
| D2 | Excel + PDF legacy-format export | 🟠 IN PROGRESS |
| D3 | 8 legacy PMS apps -> App794 | 🟠 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | App800 HR Control Center end-to-end | 🟠 IN PROGRESS |
| D5 | Copy own previous MBO only | 🔴 MUST FIX |
| D6 | Integrated E2E / Security / Regression | 🔴 BLOCKED |
| D7 | Admin Support Center | ✅ PASS / CLOSED |

No AI may silently drop D1–D7.

## 2. Authorization Ledger

```text
D1_SOURCE_IMPLEMENTATION            = SOURCE CORRECTIVE ACCEPTED
D1_LIVE_CUTOVER                     = IN PROGRESS / LOGIN GATE RUNTIME RECOVERED / NAVIGATION SESSION DEFECT OPEN
DEDICATED_MBO_ACCESS_GROUP_MODEL    = APPROVED / PASS
APP801_GROUP_ACL_MODEL              = APPROVED / PASS
D1_CREDENTIAL_CANDIDATE_RULE        = ACCEPTED / BASELINED
D1_CANDIDATE_USER_EXPORT_AUDIT      = PASS / 128 ACCEPTED CANDIDATES
APP801_CREDENTIAL_BULK_PROVISIONING = PASS / INDEPENDENTLY LIVE VERIFIED 2026-08-28
APP794_D1_CUSTOMIZATION_DEPLOY      = EXECUTED / NOT ACCEPTED
APP794_CORRECTIVE_REDEPLOY          = EXECUTED / ORIGINAL RUNTIME NULL DEFECT RECOVERED / FULL D1 ACCEPTANCE BLOCKED BY NEW UAT FINDING
D2-D7 LIVE WRITES                   = NOT AUTHORIZED unless separately recorded
```

The corrective redeploy authorization is consumed. No retry, rollback, new deploy, source refactor, App801 schema change, session implementation, or D2-D7 work is authorized by that approval.

## 3. Accepted D1 State That Remains Valid

```text
MBO_EMPLOYEE_ACCESS_GROUP = PASS
APP801_GROUP_ACL = PASS
CREDENTIAL_CANDIDATE_GATE = PASS / 128
APP801_PROVISIONING = PASS / 128 / independently live verified
D1_SOURCE_CORRECTIVE_PACKAGE = PASS
LOGIN_GATE_RUNTIME_INITIALIZATION = RECOVERED IN LIVE UI
```

Final D1 UAT is NOT PASS.

## 4. Executor Redeploy Evidence — Commit 9072100f7c62651b5710f03872bcad1831a6fefa

Exact Git comparison from authorizing commit `c9f91c54e527ffffd28d13ebd5685af5afe130d0` proves the executor evidence commit changes only:

```text
project-docs/D1_ACCESS_GROUP_SETUP_EVIDENCE.md
```

Executor reported build/test 804/804, revision 41 -> 42, target JS hash match, CSS hash preservation, CSS upload = 0, no source edit and no UAT execution.

These remain executor-reported live facts except where independently observed below.

## 5. Independent Live Observation — Navigation Reauthentication Defect

User screenshots from live App794 independently prove:

1. the prior `FAIL_CLOSED_GATE_NULL` runtime initialization failure is no longer the visible behavior;
2. MBO Login Gate renders and accepts login;
3. authenticated My MBO list renders for the employee context;
4. clicking `+ Create New MBO` navigates to the native create URL and immediately presents MBO Login again instead of continuing the authenticated MBO interaction.

Source review confirms the cause:

```text
renderEmployeeSelfIndex()
  -> createBtn.href = `/k/${appId}/edit`
  -> full Kintone page navigation / new JS page lifecycle

MboKintoneLoginGate
  -> principal stored only in instance/page memory
  -> new page initializes _principal = null
  -> requireLogin() renders login again
```

This matches the CURRENT durable D1 baseline, which explicitly says authentication is PAGE MEMORY ONLY and reload/re-entry requires MBO Login again.

Therefore this is not a redeploy regression. It is a newly rejected UX/security architecture behavior discovered during live UAT.

## 6. Required Architecture Decision Before Fix

User expectation is now:

```text
After successful MBO login, internal App794 navigation such as:
List -> Create
List -> Detail/Edit
Create/Edit -> return to List
must not require repeated MBO login during the same intended MBO browser session.
```

This conflicts with the existing baseline rule that every reload/re-entry requires login and that sessionStorage/browser token persistence is forbidden.

Do NOT implement a weak shortcut such as storing only Employee_Code / authenticated=true in localStorage, sessionStorage, URL, window.name, or hidden DOM. Those values are user-tamperable and would allow custom-gate impersonation.

Preferred proposed architecture for review:

```text
SHORT-LIVED OPAQUE MBO SESSION TOKEN
- successful login generates cryptographically random 256-bit token;
- browser sessionStorage stores only the raw short-lived bearer token plus non-secret identity reference needed for lookup;
- App801 stores only SHA-256(token) and expiry metadata, never the raw token;
- every new App794 page validates token hash + Employee_Code + Account_Status + Force_Password_Change + expiry before restoring in-page principal;
- mismatched/tampered identity or token fails closed to Login;
- Logout clears browser token and invalidates server-side token state;
- password change / disabled / locked account invalidates or denies the token;
- browser/tab close clears browser-side session state;
- no plaintext password / Password_Hash / credential salt stored in browser session state.
```

This architecture requires an explicit user/Control Plane decision because it changes the durable PAGE-MEMORY-ONLY auth rule and likely requires dedicated App801 session metadata fields / writes.

No App801 schema/write change is currently authorized.

## 7. JavaScript Modularity Requirement

Any future session implementation must follow `CONFIRMED_BASELINE/SOURCE_CODE_ARCHITECTURE.md`.

Required separation conceptually:

```text
mbo-kintone-auth-adapter.js   = credential/account verification
mbo-kintone-login-gate.js     = login/change-password UI gate
mbo-session-manager.js        = session token issue/restore/invalidate/expiry only
main-mbo-app.js               = bootstrap/orchestration only
```

Do not place session implementation into `main-mbo-app.js` or `employee-part-a-ui.js`.

## 8. Exact Next Action

```text
NEXT_ACTION_OWNER = User / ChatGPT architecture decision
ANTIGRAVITY_REQUIRED = NO
APP794_DEPLOY = NO
APP801_SCHEMA_WRITE = NO
SESSION_SOURCE_IMPLEMENTATION = NO
```

Antigravity remains HOLD until the session-continuity architecture is explicitly accepted and ChatGPT issues a narrow source/schema plan.

## 9. Knowledge / Baseline Maintenance

Baseline promotion:
`PENDING — existing PAGE-MEMORY-ONLY rule remains current until explicit user decision changes it.`

Reusable skill extraction:
`NONE yet — architecture is proposed, not accepted.`
