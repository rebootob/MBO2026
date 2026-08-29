# 00 MASTER JOBLIST — MBO2026 CONTINUITY CONTROL

> Repository: `rebootob/MBO2026`  
> Working branch: `ai/antigravity-wp002c`  
> Control Plane: ChatGPT  
> Execution Plane: Antigravity only when actual execution is required  
> Purpose: **D1–D7 completeness / no-drop authority across chats and handoffs.**

This file controls **job completeness**, not every technical detail. If a detailed business/security/technical rule conflicts with `project-docs/CONFIRMED_BASELINE/`, the applicable Confirmed Baseline wins and the conflict must be corrected before execution.

---

## 0. NON-NEGOTIABLE CONTINUITY RULES

```text
RULE_01 = NEVER_DROP_D1_TO_D7
RULE_02 = REPOSITORY_AND_LIVE_EVIDENCE_BEAT_CHAT_MEMORY
RULE_03 = CONFIRMED_BASELINE_CONTROLS_DURABLE_SEMANTICS
RULE_04 = NO_FALSE_PASS
RULE_05 = EXECUTOR_CANNOT_SELF_CERTIFY_INDEPENDENT_REVIEW
RULE_06 = NO_LIVE_KINTONE_WRITE_OR_DEPLOY WITHOUT EXACT AUTHORIZATION
RULE_07 = PROTECTED_LEGACY_SOURCE_APPS_REMAIN_READ_ONLY
RULE_08 = SECURITY_PRIVACY_AND_DATA_TRUTHFULNESS_ARE_RELEASE_BLOCKERS
RULE_09 = D1_IS_KINTONE_ONLY
RULE_10 = AUTH_BRIDGE_IS_CANCELLED_AND_MUST_NOT_RETURN
```

Use `AI_DOCUMENT_INDEX.md` for the lean read set. Do not broad-read historical documents merely because this is a handoff.

---

# 1. THE SEVEN MANDATORY DELIVERABLES

## D1 — LOGIN + PASSWORD CHANGE + EMPLOYEE-SELF MBO GATE

### Mandatory user outcome
- secondary MBO login inside Kintone;
- username = `Employee_Code`;
- initial/default password = `Employee_Code`;
- first/default login forces password change;
- employee can later change own password;
- Employee-Self UI is bound to authenticated Employee_Code;
- My MBO/history/create/detail/edit must not let an employee switch to another Employee_Code;
- production HR-authorized users and `admin-form` must have controlled Reset MBO Password capability;
- Live MBO UI must show truthful data only, including comments/history and attachments.

### Current architecture — supersedes older backend/Auth-Bridge wording

```text
D1 = KINTONE-ONLY
External server/service = FORBIDDEN
External auth service   = FORBIDDEN
External database       = FORBIDDEN
Reverse proxy           = FORBIDDEN
Auth Bridge             = CANCELLED / SUPERSEDED
```

Canonical flow:

```text
Kintone authenticated principal
  -> App794 browser customization
  -> MBO Employee_Code authentication/session
  -> App801 credential/session metadata through Kintone REST/JS API
  -> Employee-Self App794 scope
```

`MBO_EMPLOYEE_ACCESS` is the approved Kintone group for employee-facing/shared principals. Under the KINTONE-ONLY model, the group requires the exact App801 access defined in `CONFIRMED_BASELINE/D1_AUTH_SECURITY.md`.

Do **not** reintroduce the old statement that all employee-browser App801 access is prohibited; that wording belonged to an abandoned architecture and conflicts with the confirmed Kintone-only model.

### Accepted security ceiling

Because multiple employees can share one Kintone principal, native Kintone ACL cannot provide hard Employee_Code-level REST isolation inside that same shared principal.

```text
DIRECT_URL_REST_HARD_ISOLATION = NOT_GUARANTEED_UNDER_SHARED_KINTONE_ACCOUNT
```

This limitation must remain explicit. Do not claim stronger native isolation than Kintone can provide and do not embed privileged API credentials in browser code as a workaround.

### D1 release/closure gates

At minimum:
- login/default-password/forced-change = PASS;
- same-tab session continuity and reload = PASS;
- independent new tab without token -> login;
- expired/tampered/wrong-Kintone-principal session -> deny;
- logout revokes/clears/reblocks;
- own password change rotates credential/session;
- disabled/permanent-locked restore denied;
- 5 failed passwords -> 15-minute temporary lockout;
- My MBO own-only UI/history/detail/edit = PASS;
- Employee-Self delete unavailable and Kintone ACL denies employee delete;
- Create uses authenticated Employee_Code -> App53 -> App795 -> App796 -> duplicate -> snapshot path;
- cross-employee detail/edit visibly blocked;
- no plaintext password/raw token/hash exposure in normal UI/DOM/log;
- HR + `admin-form` Reset MBO Password production function = PASS;
- Live workflow/comment timeline never fabricates events;
- Native Kintone Comments remains the authoritative conversation channel;
- attachment UI truthfully shows no-file / pending / saved / multiple real filenames and uses Kintone-only storage;
- final independent D1 review = PASS.

D1 cannot be closed merely because unit tests or Create-show pass.

---

## D2 — EXCEL + PDF EXPORT IN ORIGINAL / LEGACY FORMAT

Mandatory outputs:

```text
Excel Part A
Excel Part B
Combined/multi-sheet Excel where applicable
PDF matching approved/original PMS presentation
```

Rules:
- compare against real legacy templates/output evidence;
- support current objective capacity without broken formulas/layout;
- employee exports own records only;
- appraiser/approver exports only legitimate assigned scope;
- HR follows approved authority;
- confidential scores/comments must not leak.

Acceptance:

```text
PART_A_EXPORT
PART_B_EXPORT
COMBINED_EXPORT or justified N/A
PDF_EXPORT
FORMAT_PARITY
EXPORT_SECURITY
```

---

## D3 — MIGRATE 8 LEGACY PMS APPS INTO APP794

Protected read-only source apps:

```text
283 PMS Staff & Chief
310 PMS Assistant Manager
305 PMS Sect.Mgr
643 PMS Senior Manager
307 PMS DGM
640 PMS GM
715 PMS VP
716 Japan Staff
```

Mandatory sequence:

```text
READ-ONLY DISCOVERY
-> FIELD MAPPING
-> DRY RUN
-> DUPLICATE/CONFLICT REPORT
-> RECONCILIATION
-> TARGET BACKUP
-> EXACT MIGRATION MANIFEST
-> EXPLICIT APP794 WRITE AUTHORIZATION
-> BATCH WRITE
-> READ-BACK
-> RECONCILIATION
-> MANIFEST-BASED ROLLBACK IF NEEDED
```

Rules:
- never modify legacy sources;
- no historical score recalculation with new formulas;
- preserve source traceability;
- migration must be duplicate-safe/idempotent;
- migrated records remain historical and must not enter active workflow automatically;
- same Employee-Self/privacy rules apply.

---

## D4 — APP800 HR CONTROL CENTER END-TO-END

HR should perform routine MBO administration without normal IT intervention.

Required operational coverage includes:
- Fiscal Year / annual cycle;
- five phase calendars;
- employee progress/pipeline/overdue/completion monitor;
- search/filter/exception handling;
- routing health/management;
- appraiser reassignment where authorized and audited;
- App796 profile/scoring health;
- Hoshin readiness/management linkage;
- reopen/revision center;
- login/account operational status and safe password-reset workflow;
- legacy migration status/reconciliation;
- Admin/System Health linkage;
- authorized reports/exports.

Dashboard charts alone are insufficient.

---

## D5 — COPY OWN PREVIOUS MBO

Employee may carry forward only their own previous MBO planning content into a new FY.

Default whitelist:

```text
Objective
Action Plan
Additional Agreement
Weight
```

Difficulty is not carried forward unless explicitly changed later.

Never copy scores, self/appraiser ratings, appraiser comments, HR results, workflow state, timestamps, old route/appraisers, old profile/Hoshin snapshot, or confidential result fields.

Target FY must resolve fresh App53/App795/App796/Hoshin/phase configuration.

---

## D6 — INTEGRATED E2E / SECURITY / REGRESSION

Proves D1–D5 + D7 work together.

Minimum path:

```text
MBO login / forced change
-> own MBO scope
-> create/open current FY
-> optional own-history carry-forward
-> Objectives workflow
-> Mid-Year
-> Self Evaluation
-> Appraiser Evaluation
-> HR Final
-> HR Control Center reflects truth
-> Excel/PDF export respects scope
-> Admin Support Center diagnosis is truthful
-> migrated history remains historical/read-only
```

Requires focused subsystem tests + full regression/build + Live evidence where relevant. No PASS from unit tests alone.

---

## D7 — ADMIN SUPPORT CENTER

`admin-form` is **Technical Admin only**:

```text
NO business approve
NO return
NO submit
NO complete
NO impersonation
```

Support Center must truthfully diagnose employee/profile/routing/appraiser/workflow/current-state evidence and never fabricate audit history. Controlled repair remains separately authorized.

Current source functionality is accepted/closed unless a new defect is discovered.

---

# 2. CURRENT D1–D7 STATUS POINTER

**Do not duplicate the live status board here.** Current evidence-backed status is maintained in:

`project-docs/AI_CONTROL_CENTER.md`

This Master Joblist only guarantees that D1–D7 and their acceptance outcomes cannot disappear.

At the 2026-08-29 handoff checkpoint:

```text
D1 = IN PROGRESS
D2 = IN PROGRESS
D3 = IN PROGRESS / LIVE WRITE NOT AUTHORIZED
D4 = IN PROGRESS
D5 = MUST FIX / IN PROGRESS
D6 = BLOCKED UNTIL CONSTITUENT WORK IS READY
D7 = SOURCE FUNCTIONALITY CLOSED / REOPEN ONLY ON NEW DEFECT
```

Always re-fetch Control Center because this checkpoint becomes stale as work proceeds.

---

# 3. CURRENT EXECUTION PRIORITY RULE

Do not use an old static priority list.

Priority must come from:
1. current `AI_CONTROL_CENTER.md` blocker/next action;
2. current `AI_ACTIVE_TASK.md` if execution is active;
3. relevant Baseline;
4. smallest safe action that moves the current gate forward.

Completed/accepted work must not be reimplemented.

---

# 4. EVERY HANDOFF MUST ANSWER

```text
1. Current branch HEAD?
2. Current D1–D7 scoreboard?
3. Exact current gate/blocker?
4. Current Active Task, if any?
5. What is already accepted and must not be reopened?
6. What files/components may change next?
7. Is Kintone write/deploy required?
8. If yes, what exact authorization covers it?
9. What evidence is still missing?
10. Exact next owner/action: ChatGPT | User | Antigravity?
```

If unclear, inspect repository/live evidence rather than guessing.

---

# 5. NO-DROP CHECKLIST

Before stopping or moving chats:

```text
[ ] D1 LOGIN + PASSWORD + EMPLOYEE-SELF
[ ] D2 EXCEL + PDF
[ ] D3 8-APP MIGRATION
[ ] D4 HR CONTROL CENTER
[ ] D5 COPY OWN PREVIOUS MBO
[ ] D6 INTEGRATED E2E/SECURITY
[ ] D7 ADMIN SUPPORT CENTER
```

---

# 6. NEW CHAT

Canonical new-chat instructions live only in:

`project-docs/NEW_CHAT_BOOTSTRAP_PROMPT.md`

Do not maintain a second long bootstrap prompt in this Master Joblist. The new chat must still re-fetch HEAD, Control Center, Active Task and relevant Baselines before acting.

---

# 7. PROJECT-CLOSE CONDITION

The mission is not complete until all seven have evidence-backed outcomes and no hidden P0 security/data-truthfulness blocker remains.

```text
D1 = PASS
D2 = PASS
D3 = PASS
D4 = PASS
D5 = PASS
D6 = PASS
D7 = PASS
P0_DEFECTS_OPEN = 0
```

If an external constraint prevents PASS, report `BLOCKED` with exact evidence and smallest required user decision. Never hide a blocker to make the board look complete.
