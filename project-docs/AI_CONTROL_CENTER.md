# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/` and reusable lessons live in `skills/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual source/runtime execution is required
> Updated: 2026-08-30 — D1 PASSWORD RESET CORE R1 SOURCE IMPLEMENTED; PENDING CHATGPT REVIEW

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|
| D1 | 🟠 **OVERALL IN PROGRESS.** WP2 R3 UI remains CLOSED / App794 Live Revision 57 accepted known-good. D1 Password Reset Core R1 source implementation (`resetMboPassword`) completed with 100% PASS unit tests (`src/ui/mbo-kintone-auth-adapter.js`, `tests/mbo-kintone-auth-adapter.test.js`). Status: `D1_PASSWORD_RESET_CORE_R1_IMPLEMENTED_PENDING_CHATGPT_REVIEW`. |
| D2 | 🟠 Excel + PDF legacy-format export IN PROGRESS |
| D3 | 🟠 8 legacy PMS -> App794 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | 🟠 App800 HR Control Center IN PROGRESS |
| D5 | 🟠 Copy own previous MBO READY TO RESUME on a future explicit task; do not start automatically. |
| D6 | 🔴 Integrated E2E / Security / Regression pending until constituent work is ready. |
| D7 | ✅ Admin Support Center source functionality CLOSED; reopen only on a new proven defect. |

## 2. Accepted Live App794 Baseline — WP2 R3

```text
LIVE_REVISION               = 57
DEPLOYED_SOURCE_COMMIT      = 9816cef195b6d3ffe039e5fb92c8dc8406c8967a
LIVE_SCOPE                  = ALL
LIVE_TOPOLOGY               = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
LIVE_JS_IDENTITY            = ac22a56cb9d78001384241fe12745f7a2da3da84
LIVE_CSS_IDENTITY           = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
EXECUTOR_TECH_READBACK      = PASS / EXACT PAIR
INDEPENDENT_GIT_REVIEW      = PASS
USER_RUNTIME_UAT            = PASS
CURRENT_LIVE_RUNTIME        = ACCEPTED KNOWN-GOOD
```

WP2 R3 is CLOSED. Do not reopen without regression evidence.

## 3. D1 Password Reset Core R1 Source Implementation

- Public reset method `resetMboPassword({ employeeCode })` added to `MboKintoneAuthAdapter` (`src/ui/mbo-kintone-auth-adapter.js`).
- Implements current App801 field semantics:
  - Temporary password = exact `Employee_Code`
  - `Password_Hash` = `pbkdf2$100000$<saltHex>$<hashHex>` via `createPasswordHash`
  - `Force_Password_Change` = `YES`
  - `Failed_Attempts` = `0`
  - `Locked_Until` = `null`
  - `Credential_Version` = `cred.credentialVersion + 1`
  - `Session_*` fields = `null` (clears active session)
  - `Password_Changed_At` = `now().toISOString()`
  - `Account_Status` = preserved (absent from update payload; permanent `LOCKED` or `DISABLED` remains `LOCKED` or `DISABLED`)
  - Fail closed on missing/duplicate/malformed identity or credential version
  - Returns `{ status: 'PASSWORD_RESET', employeeCode }` without exposing secrets
- Unit tests added in `tests/mbo-kintone-auth-adapter.test.js` (40/40 PASS).

## 4. Current Gate

```text
CURRENT_GATE                  = D1 PASSWORD RESET CORE R1 SOURCE IMPLEMENTED / PENDING CHATGPT REVIEW
CURRENT_MODE                  = SOURCE-ONLY EXECUTION / NO LIVE WRITE
WP2_R3_STATUS                 = CLOSED / REV57 ACCEPTED KNOWN-GOOD
D1_OVERALL                    = IN PROGRESS
LIVE_DEPLOY_AUTHORIZED        = NO
APP794_RECORD_WRITE           = NO
APP794_FORM_SCHEMA_LAYOUT     = NO
APP794_ACL_PROCESS            = NO
KINTONE_COMMENT_WRITE         = NO
APP801_LIVE_WRITE             = NO
APP795_APP796_WRITE           = NO
NEXT_OWNER                    = CHATGPT INDEPENDENT REVIEW
```

Maximum status: `D1_PASSWORD_RESET_CORE_R1_IMPLEMENTED_PENDING_CHATGPT_REVIEW`.
