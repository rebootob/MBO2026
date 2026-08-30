# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only for minimum necessary source/runtime execution
> Updated: 2026-08-30 — LEAN CORRECTIVE CANDIDATE REVIEWED / CLEANUP R2 OPEN / APP53 PRODUCTION READ-ONLY

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|
| D1 | 🟠 IN PROGRESS. App794 Rev60 accepted. Hybrid Identity Core Source R1 PASS at `c20e406b9b289984e57ebf2c52c9223094bc5f5a`. Runtime Entry candidate `31d4bf55343f2dddea7a4dc016828083e6c4c699` fixes the three major security findings, but is **CORRECTIVE R2** because it violated Lean scope, still has a local-context fallback, and lacks several mandatory focused runtime proofs. |
| D2 | 🟠 Excel + PDF legacy-format export IN PROGRESS |
| D3 | 🟠 8 legacy PMS -> App794 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | 🟠 App800 HR Control Center IN PROGRESS; Reset UI/tooling accepted; live remains prior MVP. |
| D5 | 🟠 Copy own previous MBO IN PROGRESS |
| D6 | 🔴 Integrated E2E / Security / Regression pending |
| D7 | ✅ Admin Support Center source functionality CLOSED |

## 2. Lean Antigravity Rule — MANDATORY

```text
ANTIGRAVITY = MINIMUM NECESSARY SOURCE EXECUTION ONLY
CHATGPT     = PLAN / REVIEW / CONTROL DOCS / EVIDENCE INTERPRETATION
```

Ordinary corrective:
```text
exact source edit -> smallest focused tests -> git diff --check -> commit/push -> STOP
```

Do NOT use Antigravity by default for broad scans, full npm test, UI build, long evidence docs, Control Plane docs, or unrelated regression repair. Full test/build is reserved for a source-acceptance or pre-deploy milestone.

## 3. Accepted Hybrid Baseline

```text
HYBRID_IDENTITY = DEDICATED_KINTONE_AUTO_BIND + SHARED_ACCOUNT_MBO_LOGIN
APP794_LIVE_REVISION = 60
HYBRID_CORE_SOURCE = PASS
HYBRID_RUNTIME_ENTRY_SOURCE = NOT YET ACCEPTED
LIVE_DEPLOY_READY = NO
```

Approved SHARED native principals are exactly:
```text
t1, t2, s1, f1, f2, f3, e1, tmh, g_request
```

Dedicated mapping remains:
```text
exact native Kintone user
-> App53 MBO_Kintone_User exact match
-> Number_0 = 1
-> canonical emp_text Employee_Code
-> Employee-Self
```

No wildcard/prefix/numeric heuristic. Dedicated mapping failure never falls back to SHARED login.

## 4. App53 Production Protection — MANDATORY

```text
APP53_ENVIRONMENT       = PRODUCTION
APP53_DEFAULT_MODE      = READ_ONLY
APP53_SCHEMA_WRITE_AUTH = NONE
APP53_RECORD_WRITE_AUTH = NONE
APP53_BULK_WRITE_AUTH   = NONE
```

Current audited facts:
```text
Vassana: vassana -> App53 #456 -> emp_text 0044 -> Active 1
Natta:   natta   -> App53 #578 -> emp_text BLANK -> Active 1
MBO_Kintone_User live field = NOT YET CREATED
```

No App53 change is authorized. Natta Employee_Code must never be guessed.

## 5. Review — Candidate `31d4bf55343f2dddea7a4dc016828083e6c4c699`

Review result:
```text
RESULT          = CORRECTIVE R2
SOURCE_ACCEPTED = NO
DEPLOY_READY    = NO
```

### Fixed correctly

1. **Exact SHARED set fixed.** `resolveKintonePrincipalMode()` now returns SHARED only for the exact approved 9; numeric/prefix heuristics are removed.
2. **DEDICATED -> SHARED fallback removed.** Dedicated mapping failure now returns `DEDICATED_MAPPING_FAILED` without calling `mboLoginGate.requireLogin()`.
3. **DeleteGuard runtime wiring fixed.** Registered delete handler now passes `getEmployeeSelfContext: () => currentEmployeeSelfContext` while preserving the shared gate fallback.
4. **App800 HR reset test restored correctly.** Current blob is exact pre-WP `eb2a3cdfb6bee6a6d67f15cc3210f139a1635756`.

### Remaining blocker A — local context still has silent fallback

`setupRecordUiWithAuth(...)` still accepts non-object `contextOrCode` and converts it into a SHARED context. That contradicts the required rule that missing/malformed resolved context must fail closed.

Inside Create lookup, code still uses:
```text
context.kintoneUserCode || kintone.getLoginUser()?.code
```

The Create authorization seam must use the already-resolved local `context.kintoneUserCode` only. No fallback/re-read is allowed there.

### Remaining blocker B — mandatory focused runtime proof incomplete

Committed integration proof covers valid dedicated entry, missing mapping, and delete guard. It does NOT yet explicitly prove all Lean minimum cases:
- valid DEDICATED with `mboLoginGate = null`;
- ambiguous dedicated mapping -> blocked and gate calls 0;
- invalid canonical `emp_text` -> blocked and gate calls 0;
- Create through local DEDICATED context snapshots dedicated `Requester_User`.

### Remaining blocker C — Lean scope violated

The candidate ran `npm run ui:build`, created a new corrective evidence file, modified generated `dist/mbo-employee-app.js`, modified `tests/classic-bundle.test.js`, and changed unrelated tests to adapt their mock principals. The Lean task explicitly forbade these actions.

Files that must be restored to Control Plane base `248174b67735a26318bbeadf8e341f8a3db31708`:
```text
dist/mbo-employee-app.js
tests/classic-bundle.test.js
tests/create-handler-form-state.test.js
tests/objective-save-validation.test.js
tests/timeline-truthfulness-and-attachment.test.js
```

Delete the newly created:
```text
project-docs/D1_HYBRID_IDENTITY_EMPLOYEE_SELF_RUNTIME_ENTRY_R1_CORRECTIVE_R1_EVIDENCE.md
```

Do NOT revert the correctly restored `tests/hr-control-center-reset-ui.test.js`; keep its exact blob `eb2a3cdf...`.

## 6. Current Active Task

```text
ACTIVE_TASK = D1 HYBRID EMPLOYEE-SELF RUNTIME R1 — LEAN CLEANUP R2
OWNER       = ANTIGRAVITY
SOURCE_EDIT = src/main-mbo-app.js ONLY
TEST_EDIT   = tests/employee-main-mbo-app-integration.test.js ONLY
PLUS        = exact cleanup/restoration of over-scope files listed in AI_ACTIVE_TASK.md
FULL_TEST   = NO
UI_BUILD    = NO
EVIDENCE    = NO
APP53_LIVE  = NO
DEPLOY      = NO
```

`src/services/mbo-identity-service.js` is accepted for this corrective and is READ-ONLY unless ChatGPT reopens it.

## 7. Authorization Ledger

```text
ACTIVE_LIVE_AUTH          = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH        = NONE
ACTIVE_ACL_WRITE_AUTH     = NONE
ACTIVE_GROUP_WRITE_AUTH   = NONE
APP53_SCHEMA_WRITE_AUTH   = NONE
APP53_RECORD_WRITE_AUTH   = NONE
APP53_BULK_WRITE_AUTH     = NONE
ROLLBACK_AUTH             = NONE
```

No App53/App794/App795/App801 live write, ACL/group change, customization upload/deploy, password reset, Process update, or rollback is authorized.

## 8. Next Gate

If Lean Cleanup R2 passes independent review, ChatGPT may then authorize **one** source-acceptance milestone full test/build. Protected Kintone configuration and My Approval Tasks remain separate later gates.