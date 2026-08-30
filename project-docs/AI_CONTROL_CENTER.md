# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/` and reusable lessons live in `skills/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual source/runtime execution is required
> Updated: 2026-08-30 — HYBRID EMPLOYEE-SELF RUNTIME ENTRY R1 = LEAN CORRECTIVE / APP53 PRODUCTION READ-ONLY

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|
| D1 | 🟠 **OVERALL IN PROGRESS.** App794 Rev60 accepted. Hybrid Identity + Dual-Role architecture confirmed. Natta/Vassana read-only audit completed. Hybrid Identity Core Source R1 is **PASS** at `c20e406b9b289984e57ebf2c52c9223094bc5f5a`. Runtime source inventory is complete. Initial Hybrid Employee-Self Runtime Entry R1 candidate `6eccb3987372d9d50c06cc4249e264c86f11bb3d` is **CORRECTIVE**. Current gate = narrow Lean Corrective only. Protected App53/group/ACL/deploy work remains unauthorized. My Approval Tasks remains deferred pending separate current-native-assignee proof. |
| D2 | 🟠 Excel + PDF legacy-format export IN PROGRESS |
| D3 | 🟠 8 legacy PMS -> App794 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | 🟠 App800 HR Control Center IN PROGRESS; Reset UI source/tooling accepted; deployed App800 remains prior MVP until separately authorized deployment. |
| D5 | 🟠 Copy own previous MBO IN PROGRESS / future focused task |
| D6 | 🔴 Integrated E2E / Security / Regression pending; must include shared-login + dedicated-login + dual-role separation |
| D7 | ✅ Admin Support Center source functionality CLOSED; reopen only on proven defect. |

## 2. Lean Antigravity Execution Rule — MANDATORY

Antigravity is an execution worker, not the Control Plane.

Default rule:
```text
ANTIGRAVITY = MINIMUM NECESSARY SOURCE/RUNTIME EXECUTION ONLY
CHATGPT     = PLANNING + INVENTORY + REVIEW + CONTROL DOCS + EVIDENCE INTERPRETATION
```

For ordinary corrective rounds, Antigravity should normally do only:
```text
1. edit the exact authorized source seam;
2. run the smallest focused tests covering that change;
3. run git diff --check;
4. commit + push;
5. STOP.
```

Do not spend Antigravity by default on:
- broad repository scans;
- planning or architecture work;
- Control Center / Active Task / Baseline authoring;
- long evidence/report documents;
- full `npm test` on every corrective;
- full UI build on every corrective;
- unrelated regression suites;
- repeated runtime discovery already possible through Git review.

Full repository test/build is reserved for meaningful milestones, normally:
```text
SOURCE ACCEPTANCE MILESTONE
PRE-DEPLOY FINAL VERIFICATION
FINAL REGRESSION / RELEASE GATE
```

If a focused test reveals a defect outside the exact authorized seam, Antigravity must STOP and report rather than expand scope.

## 3. Accepted App794 / Hybrid Core Baselines

```text
APP794_LIVE_REVISION          = 60
APP794_PREVIEW_REVISION       = 60
APP794_ACCEPTED_SOURCE        = 1ed342ad137a4a364496a28d29bdffd24a99b511
APP794_ACCEPTED_JS            = 115a08ace32bdf850cb5eebf25b953d1803114d0
APP794_ACCEPTED_CSS           = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
REV60_USER_UAT                = PASS
HYBRID_CORE_ACCEPTED_COMMIT   = c20e406b9b289984e57ebf2c52c9223094bc5f5a
HYBRID_CORE_SOURCE            = PASS
HYBRID_RUNTIME_ENTRY_SOURCE   = NOT YET ACCEPTED
LIVE_DEPLOY_READY             = NO
```

Accepted Hybrid core rules:
- strict dedicated mapping uses only `Number_0=1`, exact `MBO_Kintone_User[].code`, canonical `emp_text`;
- legacy `resolveEmployeeIdentity()` fallback is **not** the future dedicated runtime API;
- DEDICATED requester = exact dedicated Kintone user;
- SHARED requester behavior remains trim + case-insensitive compatibility against authoritative App795 `Requester_User`;
- own-MBO self-appraiser elision preserves approver slots, users, rules, order and topology;
- Natta own example remains `natta -> uchida / M1_G1` -> effective `uchida / M1_ONLY` with no auto-approval;
- generic 3-slot/4-slot transformations have committed regression proof.

## 4. Confirmed Hybrid Identity / Dual Role

```text
HYBRID_IDENTITY = DEDICATED_KINTONE_AUTO_BIND + SHARED_ACCOUNT_MBO_LOGIN
DUAL_ROLE_EMPLOYEE_APPROVER = CONFIRMED
```

Dedicated path:
```text
native Kintone login
-> exact App53 MBO_Kintone_User mapping
-> Number_0 = 1
-> valid canonical emp_text Employee_Code
-> Employee-Self auto-bind
-> NO App801 bearer session / NO second MBO password
```

Shared path:
```text
approved shared Kintone principal
-> current App794 MBO Login
-> Employee_Code + App801 MBO password/session
```

Approved shared Kintone principals are **exactly**:
```text
t1, t2, s1, f1, f2, f3, e1, tmh, g_request
```

No wildcard, prefix, numeric-user heuristic, UI choice, App795 membership, or session presence may expand that set.

Dual-role separation:
```text
My MBO ownership  = bound Employee_Code
Approver identity = current dedicated Kintone User
Approval Tasks    = authoritative CURRENT native Workflow assignee == current dedicated Kintone User
```

Static App795 membership, stale route snapshots, UI visibility, or caller-supplied roles are not Approver authorization.

## 5. App53 Production Protection — MANDATORY

```text
APP53_ENVIRONMENT                 = PRODUCTION
APP53_DEFAULT_MODE                = READ_ONLY
APP53_SCHEMA_WRITE_AUTH           = NONE
APP53_RECORD_WRITE_AUTH           = NONE
APP53_BULK_WRITE_AUTH             = NONE
```

Adding `MBO_Kintone_User`, populating mapping values, and correcting Natta `emp_text` are three separate protected concerns. Each future write requires its own exact one-shot authorization, fresh pre-write evidence, reviewed backup/recovery material, exact payload, impact/rollback plan and immediate post-write readback. No source/test/deploy approval for another resource implies App53 permission.

Current audited facts:
```text
Vassana: vassana -> App53 #456 -> emp_text 0044 -> Active 1
Natta:   natta   -> App53 #578 -> emp_text BLANK -> Active 1
MBO_Kintone_User live field = NOT YET CREATED
```

Natta remains fail closed until the real canonical Employee_Code is proven/corrected under separate protected authorization. Never infer from `Number=243`, Vendor Account Number, email, name, or padding.

## 6. Runtime Integration Source Inventory R1 — COMPLETE

Inventory established these safe seams:
- identity mode + strict mapping semantics: `src/services/mbo-identity-service.js`;
- targeted App53 read-only candidate data access: `src/services/employee-service.js`;
- top-level event/mode orchestration: `src/main-mbo-app.js`;
- Employee-Self delete defense-in-depth: `src/security/delete-guard-policy.js`;
- shared login/session internals remain read-only;
- routing transformation/effective-requester core remains accepted/read-only;
- build is esbuild from `src/main-mbo-app.js`; no manual dist edits;
- My Approval Tasks/current-native-assignee source contract is not yet proven and is a separate later gate.

## 7. Hybrid Employee-Self Runtime Entry R1 — INDEPENDENT REVIEW

Executor candidate:
```text
CANDIDATE_COMMIT = 6eccb3987372d9d50c06cc4249e264c86f11bb3d
BASE             = 7989b950247d269440f588da580cb9b56726b406
COMMITS          = 1
REVIEW_RESULT    = CORRECTIVE
SOURCE_ACCEPTED  = NO
DEPLOY_READY     = NO
```

Blocking findings:

### R1-A — Unauthorized SHARED expansion
Candidate incorrectly classified numeric and `req*` / `test*` / `user*` principals as SHARED. Only the exact approved 9 may be SHARED.

### R1-B — DEDICATED mapping failure falls back to SHARED login
Candidate can call `mboLoginGate.requireLogin()` after DEDICATED mapping failure. This must be removed; DEDICATED failure is fail closed.

### R1-C — DEDICATED delete guard not connected in real runtime
`DeleteGuardPolicy` accepts hybrid context, but the registered App794 delete handler does not pass the current Employee-Self context provider.

### R1-D — Out-of-scope App800/HR test modification
`tests/hr-control-center-reset-ui.test.js` was modified outside scope and must be restored exactly to pre-WP blob `eb2a3cdfb6bee6a6d67f15cc3210f139a1635756`.

### R1-F — Create must use resolved local context
Create requester/self-elision must use the already resolved `context.mode` and `context.kintoneUserCode`, not mutable global fallback or silent `'SHARED'` default.

The previously requested broad proof/build work is now deferred to the next milestone under the Lean Antigravity rule. Current corrective only fixes these proven source defects and runs focused tests.

## 8. Current Active Task

```text
ACTIVE_TASK = D1 HYBRID EMPLOYEE-SELF RUNTIME R1 — LEAN CORRECTIVE
OWNER       = ANTIGRAVITY
MODE        = MINIMUM SOURCE + FOCUSED TEST ONLY
APP53_MODE  = PRODUCTION READ_ONLY
LIVE_ACCESS = NO
LIVE_WRITE  = NO
FULL_NPM_TEST = DEFERRED
UI_BUILD      = DEFERRED
DEPLOY        = NO
```

Exact task scope is in `AI_ACTIVE_TASK.md`.

## 9. App800 Reset UI / Tooling — Accepted, Not Deployed

```text
APP800_RESET_UI_SOURCE_COMMIT            = a7a9f02aff6b497f3f8e0009dd377437a3701416
APP800_DEPLOY_TOOL_IMPLEMENTATION_COMMIT = 14b911d9cde8b59b6c15e6b05bc8fccfbb6727fd
APP800_DEPLOY_TOOL_TEST_EVIDENCE_COMMIT  = 9b0377dd56b1a7b74f60dc748babd7d00f8d5fdd
APP800_RESET_UI_SOURCE                   = PASS
APP800_DEPLOYMENT_TOOL_COMPATIBILITY_R1  = PASS
LIVE_DEPLOYED                            = NO
ACTIVE_DEPLOY_AUTH                       = NONE
```

Reset MBO Password means App801-backed MBO credential reset only, never native Kintone/cybozu password reset.

## 10. Authorization Ledger / Safety

```text
LATEST_DEPLOY_AUTH        = APP794-R4-1-NATIVE-CANCEL-DEPLOY-20260830-01 — CONSUMED / CLOSED / NEVER REUSE
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

No App800/App801/App794/App53 record write, App53 schema/bulk change, group creation/membership write, App795 route write, customization upload, deployment, password reset execution, ACL write, Process update, or rollback is authorized.

## 11. Next Gate

```text
CURRENT_GATE  = D1 HYBRID EMPLOYEE-SELF RUNTIME R1 — LEAN CORRECTIVE
CURRENT_OWNER = ANTIGRAVITY
NEXT_REVIEWER = CHATGPT
```

After this focused corrective passes review, ChatGPT will decide whether the source has reached the milestone where one full test/build verification is justified. Protected Kintone configuration remains a separate authorization gate. My Approval Tasks remains blocked until Control Plane separately proves the authoritative current-native-assignee runtime contract.