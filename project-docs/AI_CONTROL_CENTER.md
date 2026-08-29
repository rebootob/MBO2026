# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/` and reusable lessons live in `skills/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual source/runtime execution is required
> Updated: 2026-08-30 — D1 PASSWORD RESET CORE R1 SOURCE ACCEPTED BY INDEPENDENT CHATGPT REVIEW; LIVE APP794 REV57 UNCHANGED

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|
| D1 | 🟠 **OVERALL IN PROGRESS.** WP2 R3 UI remains CLOSED / App794 Live Revision 57 accepted known-good. D1 Password Reset Core R1 source is now independently ACCEPTED. Production HR/`admin-form` reset surface + authority + deploy/UAT remain open. |
| D2 | 🟠 Excel + PDF legacy-format export IN PROGRESS |
| D3 | 🟠 8 legacy PMS -> App794 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | 🟠 App800 HR Control Center IN PROGRESS |
| D5 | 🟠 Copy own previous MBO READY TO RESUME only on a future explicit task; do not start automatically. |
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

WP2 R3 remains CLOSED. Do not reopen without regression evidence.

## 3. D1 Password Reset Core R1 — Independent Review

```text
R1_SOURCE_COMMIT            = e77c891407d5ccfa3d52401a28922f37a2b1b959
R1_INDEPENDENT_REVIEW       = PASS
R1_LIVE_DEPLOY              = NONE
R1_LIVE_APP801_WRITE        = NONE
R1_STATUS                   = D1_PASSWORD_RESET_CORE_R1_SOURCE_ACCEPTED
```

Accepted source behavior in `src/ui/mbo-kintone-auth-adapter.js`:
- `resetMboPassword({ employeeCode })` uses the canonical Kintone-only auth adapter.
- Temporary password = exact canonical `Employee_Code`.
- PBKDF2-SHA256 / 100000 hash is generated via the adapter's existing Web Crypto implementation.
- `Force_Password_Change = YES`.
- `Failed_Attempts = 0`; temporary `Locked_Until` is cleared.
- positive-integer `Credential_Version` increments by exactly 1.
- all active App801 `Session_*` fields are cleared.
- `Account_Status` is not included in the update payload, so permanent `LOCKED` / `DISABLED` state is preserved.
- missing/duplicate/malformed credential state fails closed through the canonical credential lookup/validation path.
- success result exposes no password/hash/token/session secret.

Focused committed tests in `tests/mbo-kintone-auth-adapter.test.js` exercise required R1 contracts, including ACTIVE, permanent LOCKED/DISABLED, temporary lock clear, missing/duplicate/malformed credential versions, special canonical Employee_Code formats and invalid Employee_Code rejection.

Generated `dist/mbo-employee-app.js` contains the reviewed source-equivalent reset primitive. No App800/D7/Auth Bridge/schema/ACL source change is part of the R1 implementation commit.

### Verification evidence boundary

Executor reported:

```text
node --test tests/mbo-kintone-auth-adapter.test.js                                  = 40/40 PASS
node --test tests/mbo-session-manager.test.js tests/mbo-kintone-login-gate.test.js = 39/39 PASS
npm run ui:build                                                                    = PASS
node --test tests/classic-bundle.test.js tests/safety-guard.test.js                 = 223/223 PASS
```

GitHub exposes no commit status checks for `e77c891...`, so do not claim independent CI confirmation beyond the reviewed committed source/tests/dist and executor-reported command results.

## 4. Governance Review Note

Antigravity changed `AI_ACTIVE_TASK.md` and `AI_CONTROL_CENTER.md` in the implementation commit although the R1 packet did not authorize executor ownership of those Control Plane documents.

This is treated as an out-of-scope documentation/governance deviation, not a source-code defect. ChatGPT normalized both control documents during this review.

Future executor rule remains: do not modify `AI_CONTROL_CENTER.md`, promote status, or replace/close the Active Task unless the exact packet explicitly instructs that document change.

No new durable Baseline fact was created by R1; the implementation conforms to the already-confirmed password-reset semantics in `CONFIRMED_BASELINE/D1_AUTH_SECURITY.md`.

## 5. Current Gate

```text
CURRENT_GATE                  = D1 PASSWORD RESET CORE R1 SOURCE ACCEPTED / CONTROL PLANE HOLD
CURRENT_MODE                  = NO ACTIVE EXECUTION / NO LIVE WRITE
WP2_R3_STATUS                 = CLOSED / REV57 ACCEPTED KNOWN-GOOD
D1_RESET_CORE_R1              = SOURCE PASS
D1_OVERALL                    = IN PROGRESS
LIVE_DEPLOY_AUTHORIZED        = NO
ACTIVE_KINTONE_WRITE_AUTH     = NONE
APP801_LIVE_WRITE             = NO
ROLLBACK_AUTH                 = NONE
NEXT_OWNER                    = USER / CHATGPT CONTROL PLANE
```

## 6. Next D1 Reset Boundary — NOT YET ASSIGNED

The next reset stage is the authorized Production reset surface for:
- HR-authorized users; and
- `admin-form` Technical Admin / recovery.

Before source execution is opened, Control Plane must define/verify the exact authorization evidence and surface. The final UI must require explicit target Employee_Code confirmation, show observable success/failure, withhold the capability from employee/shared principals, and later prove Live reset/session invalidation/forced-change behavior through separately authorized deployment and UAT.

Do not start R2, deploy, or write App801 automatically.

## 7. Authorization Ledger

```text
PRIOR_AUTHORIZATION_ID       = APP794-D1-WP2-R3-DEPLOY-20260829-01
PRIOR_AUTHORIZATION_STATUS   = CONSUMED / CLOSED / NEVER REUSE
ACTIVE_LIVE_AUTH             = NONE
ACTIVE_KINTONE_WRITE_AUTH    = NONE
ACTIVE_DEPLOY_AUTH           = NONE
ROLLBACK_AUTH                = NONE
```
