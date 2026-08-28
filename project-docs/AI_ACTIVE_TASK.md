# AI ACTIVE TASK — HOLD / D1 SESSION CONTINUITY ARCHITECTURE DECISION

> Execution Plane: Antigravity  
> Branch: `ai/antigravity-wp002c`  
> Mode: **NO EXECUTION NOW**

## Current Live Finding

User live UAT shows:

```text
Login succeeds
My MBO list renders
Click + Create New MBO
-> native App794 create page loads
-> MBO Login is required again
```

Source cause is confirmed:

```text
createBtn.href = `/k/${appId}/edit`
+ MBO principal is page-memory only
+ new Kintone page lifecycle resets principal
```

The previous `FAIL_CLOSED_GATE_NULL` runtime initialization defect is no longer the visible blocker.

## Architecture Conflict

Current durable baseline says:

```text
AUTH_STATE = PAGE_MEMORY_ONLY
RELOAD_OR_REENTRY = REQUIRE_LOGIN_AGAIN
NO_SESSION_STORAGE_AUTH
NO_BROWSER_TOKEN_PERSISTENCE
```

The user's current UAT expectation rejects repeated login during normal internal App794 navigation.

This requires a deliberate auth architecture change. Do not improvise a persistence shortcut.

## STOP Rules

Until ChatGPT records an explicit architecture decision and replaces this HOLD, Antigravity must not:

- modify source/tests/build/dist;
- add sessionStorage/localStorage auth state;
- add browser token logic;
- add App801 fields;
- modify App801 records/schema/ACL;
- upload/deploy/redeploy App794;
- retry/rollback previous deploy;
- refactor JavaScript;
- modify `main-mbo-app.js`;
- modify `employee-part-a-ui.js`;
- start D2-D7 implementation;
- run a broad repo scan;
- create follow-on work.

## Proposed Direction — NOT YET AUTHORIZED

Preferred secure Kintone-only pattern:

```text
mbo-session-manager.js
  -> random 256-bit session token
  -> raw token stored only in sessionStorage for same-tab continuity
  -> App801 stores only token hash + expiry
  -> every new page revalidates token against App801/account state
  -> tampered Employee_Code/token fails closed
  -> logout/password change invalidates session
```

This is a proposal only. It is not an execution task and does not authorize App801 schema/write changes.

## Modularity Rule

Any accepted session implementation must remain separate by responsibility:

```text
mbo-kintone-auth-adapter.js = credential/account verification
mbo-kintone-login-gate.js   = login/password UI
mbo-session-manager.js      = session continuity only
main-mbo-app.js             = orchestration only
```

No catch-all implementation.

## Next Action

```text
NEXT_ACTION_OWNER = User / ChatGPT
ANTIGRAVITY_REQUIRED = NO
STATUS = HOLD_PENDING_D1_SESSION_CONTINUITY_DECISION
```

STOP.
