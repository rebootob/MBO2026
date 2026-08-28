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
| D1 | Login + Password Change + Employee-Self MBO Gate | 🟠 GROUP+APP801 ACL PASS / CANDIDATE PASS=128 / APP801 PROVISIONING PASS / LOGIN GATE LIVE RECOVERED / SESSION CONTINUITY ARCHITECTURE APPROVED / SOURCE+TEST IMPLEMENTATION NEXT / CREATE-HANDLER DEFECT OPEN |
| D2 | Excel + PDF legacy-format export | 🟠 IN PROGRESS |
| D3 | 8 legacy PMS apps -> App794 | 🟠 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | App800 HR Control Center end-to-end | 🟠 IN PROGRESS |
| D5 | Copy own previous MBO only | 🔴 MUST FIX |
| D6 | Integrated E2E / Security / Regression | 🔴 BLOCKED |
| D7 | Admin Support Center | ✅ PASS / CLOSED |

No AI may silently drop D1–D7.

## 2. Authorization Ledger

```text
D1_SOURCE_IMPLEMENTATION                 = SESSION CONTINUITY SOURCE/TEST WORK PACKAGE ISSUED
D1_SESSION_CONTINUITY_ARCHITECTURE       = APPROVED 2026-08-28 / BASELINED
D1_LIVE_CUTOVER                          = IN PROGRESS / FINAL UAT BLOCKED
DEDICATED_MBO_ACCESS_GROUP_MODEL         = APPROVED / PASS
APP801_GROUP_ACL_MODEL                   = APPROVED / PASS
D1_CREDENTIAL_CANDIDATE_RULE             = ACCEPTED / BASELINED
D1_CANDIDATE_USER_EXPORT_AUDIT           = PASS / 128 ACCEPTED CANDIDATES
APP801_CREDENTIAL_BULK_PROVISIONING      = PASS / INDEPENDENTLY LIVE VERIFIED 2026-08-28
APP794_CORRECTIVE_REDEPLOY               = EXECUTED / LOGIN-GATE NULL DEFECT RECOVERED
APP801_SESSION_SCHEMA_WRITE              = NOT AUTHORIZED
APP801_SESSION_RECORD_MIGRATION          = NOT REQUIRED / NEW FIELDS MAY START BLANK
APP794_SESSION_CONTINUITY_DEPLOY          = NOT AUTHORIZED
D1_CREATE_HANDLER_CORRECTIVE             = NOT YET IMPLEMENTED / SEPARATE WORK PACKAGE
D2-D7 LIVE WRITES                        = NOT AUTHORIZED unless separately recorded
```

Architecture approval authorizes the Control Plane to prepare and issue the source/test implementation work package. It does **not** authorize App801 schema changes, App794 deploy, live session writes, or UAT closure.

## 3. Durable Architecture — Accepted

Canonical session architecture:

```text
project-docs/CONFIRMED_BASELINE/D1_SESSION_CONTINUITY.md
```

Key confirmed rules:

```text
TOKEN                    = cryptographically random 256-bit opaque bearer token
BROWSER_STORAGE          = sessionStorage only / current tab
BROWSER_TRUSTED_IDENTITY = NONE
SERVER_STORAGE           = SHA-256(token) + metadata in existing App801 credential row
ABSOLUTE_TTL             = 8 hours
SLIDING_REFRESH          = NO
ACTIVE_SESSIONS          = one per Employee_Code
KINTONE_PRINCIPAL_BIND   = YES
CREDENTIAL_VERSION_BIND  = YES
NEW_TAB_WITHOUT_TOKEN    = LOGIN REQUIRED
SAME_TAB_NAV/RELOAD      = RESTORE AFTER APP801 VALIDATION
```

Required new App801 fields are architecturally confirmed but not yet authorized for live schema creation:

```text
Session_Token_Hash          SINGLE_LINE_TEXT
Session_Issued_At           DATETIME
Session_Expires_At          DATETIME
Session_Credential_Version  NUMBER
Session_Kintone_User        SINGLE_LINE_TEXT
```

Existing `Credential_Version` becomes a positive-integer session invalidation control and increments on password change.

## 4. JavaScript Ownership — Mandatory

Session code must be split by responsibility:

```text
src/ui/mbo-kintone-auth-adapter.js
  = App801 credential/account/session-record data access + server-side validation

src/ui/mbo-kintone-login-gate.js
  = Login / Force Change / Change Password / Logout UI flow

src/ui/mbo-session-manager.js
  = token generation/hash/sessionStorage/issue/restore/revoke orchestration

src/main-mbo-app.js
  = dependency construction + top-level event orchestration only
```

Do not put session implementation into `employee-part-a-ui.js` or turn `main-mbo-app.js` into a catch-all.

## 5. Separate Live Create Defect — Do Not Mix

User live UAT separately proved:

```text
Employee Profile Resolution Failed
You cannot call kintone.app.record.get() in handler or during processing a handler.
```

Source cause is the create-show async path calling `syncRecordToKintone()`, which uses `kintone.app.record.get()/set()` while the Kintone handler is still processing.

This is **not** part of the session-continuity source work package. It remains open for a later narrow corrective after session source review.

## 6. Current Execution Packet

Next task is SOURCE / TEST ONLY.

Permitted purpose:
- implement the accepted session architecture in modular source;
- add focused tests/mocks;
- update classic bundle source order;
- run build/test;
- generate dist through the accepted build only;
- push one concise source/test commit and STOP.

Explicitly forbidden in this task:
- Kintone POST/PUT/DELETE/upload/deploy;
- App801 field/schema creation;
- App801 live session writes;
- App794 deploy;
- Create-handler defect fix;
- broad refactor;
- `employee-part-a-ui.js` change;
- D2-D7 work.

## 7. Exact Next Action

```text
NEXT_ACTION_OWNER = Antigravity
ANTIGRAVITY_REQUIRED = YES — one narrow cohesive session source/test work package
DUPLICATE_WORK_RISK = LOW if executor reads only Active Task inputs
MAX_EXECUTOR_STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

After executor push, ChatGPT independently reviews source/test evidence. Only after source PASS will the Control Plane consider asking for exact App801 Session Schema authorization.

## 8. Knowledge / Baseline Maintenance

Baseline promotion:
`PASS — D1_SESSION_CONTINUITY.md created and D1_AUTH_SECURITY.md updated.`

Reusable skill extraction:
`PENDING until implementation review proves the pattern in code.`