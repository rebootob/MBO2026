# 00 MASTER JOBLIST — MBO2026 CONTINUITY CONTROL

> **ABSOLUTE FIRST FILE FOR EVERY AI / HUMAN IMPLEMENTER**
>
> Repository: `rebootob/MBO2026`  
> Working branch: `ai/antigravity-wp002c`  
> Control Plane: ChatGPT  
> Execution Plane: Antigravity  
> Objective: **Close the seven mandatory MBO deliverables without losing scope across chats, AI handoffs, or long contexts.**

---

# 0. NON-NEGOTIABLE CONTINUITY RULE

Before reading `AI_START_HERE.md`, `AI_ACTIVE_TASK.md`, source code, old chat summaries, or implementing anything, read this file first.

This file is the master job-level control plane. Tactical work packages may change, but none of the seven mandatory deliverables below may disappear, be silently deferred, renamed away, or declared complete without evidence.

If another living document omits one of these seven jobs, **this file wins for job completeness**. If a detailed business rule conflicts with `project-docs/CONFIRMED_BASELINE/`, the Confirmed Baseline wins for business/technical semantics and the conflict must be reported before implementation.

```text
RULE_01 = READ_00_MASTER_JOBLIST_FIRST
RULE_02 = READ_CONFIRMED_BASELINE_BEFORE_TECHNICAL_JUDGMENT
RULE_03 = NEVER_DROP_D1_TO_D7
RULE_04 = NO_FALSE_PASS
RULE_05 = IMPLEMENTER_CANNOT_SELF_CERTIFY_REVIEW_GATE
RULE_06 = UPDATE_JOB_STATUS_AFTER_EACH_EXECUTION_BLOCK
RULE_07 = NEXT_CHAT_MUST_CONTINUE_FROM_REPOSITORY_EVIDENCE, NOT MEMORY
RULE_08 = NO_LIVE_KINTONE_WRITE_OR_DEPLOY WITHOUT EXACT EXPLICIT AUTHORIZATION
RULE_09 = LEGACY_SOURCE_APPS_REMAIN_READ_ONLY
RULE_10 = SECURITY_AND_PRIVACY_ARE_RELEASE_BLOCKERS
```

---

# 1. THE SEVEN MANDATORY DELIVERABLES — DO NOT DROP ANY

## D1 — MBO LOGIN + PASSWORD CHANGE + STRICT EMPLOYEE DATA ISOLATION

### User requirement
- MBO has a secondary login layer after Kintone login.
- Initial MBO username = `Employee_Code`.
- Initial MBO password = `Employee_Code`.
- First login/default-password use must force user to set a new password.
- User can later change their own password.
- Employee A must never see Employee B's MBO information unless explicitly authorized by a legitimate business role.

### Required security model
```text
Kintone authenticated principal
        ↓ verified binding
Employee_Code (App53)
        ↓
Secondary MBO authentication/session
        ↓
Authorized record scope
```

### Hard security rules
- `Employee_Code` alone is NOT proof of identity.
- Password verification must not be implemented as browser-only secret comparison.
- `Password_Hash` / password secrets must never be exposed to employee browser JavaScript.
- App801 is credential/auth metadata store; employee browser direct access is prohibited.
- Default password = Employee Code is bootstrap-only; successful first/default login must require change.
- Account lockout / failed attempt / password-change state must fail closed.
- Direct URL, REST query, export, attachment, copy-MBO and historical-record access must obey the same identity scope.

### Release-blocker tests
```text
EMPLOYEE_A_CANNOT_ACCESS_EMPLOYEE_B = PASS
EMPLOYEE_A_CANNOT_EXPORT_EMPLOYEE_B = PASS
EMPLOYEE_A_CANNOT_COPY_EMPLOYEE_B = PASS
EMPLOYEE_A_CANNOT_DIRECT_URL_EMPLOYEE_B = PASS
EMPLOYEE_A_CANNOT_API_QUERY_EMPLOYEE_B = PASS
```

### Completion classification
- `IMPLEMENTED_PENDING_REVIEW`
- `BLOCKED_BACKEND_SECURITY`
- `PASS` only after independent security review and required runtime evidence.

---

## D2 — EXPORT EXCEL + PDF IN THE ORIGINAL/LEGACY FORMAT

### User requirement
Restore/provide exports using the same business format previously used, not a newly invented replacement format.

### Required outputs
```text
Excel Part A
Excel Part B
Combined / multi-sheet Excel where applicable
PDF matching the approved/original PMS presentation format
```

### Rules
- Reuse actual legacy templates/assets/format evidence where available.
- Do not claim “same format” without comparing to the real existing template/output.
- Support the current objective capacity, including 5–10 objectives, without corrupting formulas/layout.
- Export obeys authorization scope:
  - Employee: own records only.
  - Appraiser/Approver: only records legitimately assigned/authorized.
  - HR: according to approved HR access.
- Never leak confidential score/comment fields through exports.

### Acceptance
```text
PART_A_EXPORT = PASS
PART_B_EXPORT = PASS
COMBINED_EXPORT = PASS or NOT_APPLICABLE_WITH_REASON
PDF_EXPORT = PASS
FORMAT_PARITY = PASS
EXPORT_SECURITY = PASS
```

---

## D3 — MIGRATE ALL HISTORICAL PMS DATA FROM 8 LEGACY APPS INTO APP794

### Authoritative legacy source apps
```text
283 = PMS Staff & Chief
310 = PMS Assistant Manager
305 = PMS Sect.Mgr
643 = PMS Senior Manager
307 = PMS DGM
640 = PMS GM
715 = PMS VP
716 = Japan Staff
```

### Mandatory source policy
All eight legacy apps are permanently **READ ONLY**.

### Target
Historical records are consolidated into App794 as historical/migrated records while preserving traceability and isolation.

### Migration rules
- No source modification.
- No historical score recalculation using new formulas.
- Preserve source identity metadata.
- Idempotent / duplicate-safe.
- Handle promotion/history duplicates explicitly; never blindly select one source record.
- `Record_Origin = LEGACY_MIGRATED` (or canonical equivalent).
- Migrated historical records must never enter active workflow automatically.
- Same privacy/isolation rules as native App794 records.

### Required execution sequence
```text
READ-ONLY DISCOVERY
→ per-app FIELD MAPPING
→ DRY RUN
→ DUPLICATE/CONFLICT REPORT
→ RECONCILIATION
→ TARGET PRE-WRITE BACKUP
→ EXACT MIGRATION MANIFEST
→ EXPLICIT APP794 WRITE AUTHORIZATION
→ BATCH WRITE
→ READ-BACK VERIFY
→ RECONCILIATION
→ ROLLBACK BY EXACT BATCH MANIFEST IF FAILURE
```

### Important governance conflict
Older architecture marked migration `DEFERRED` until V2 stabilization/UAT. The user's newest direction requires migration in the current closeout mission. Before actual write, record the explicit superseding/deviation decision in governance docs. Do not silently ignore the older rule.

### Acceptance
```text
8_OF_8_SOURCE_APPS_MAPPED = PASS
DRY_RUN = PASS
RECONCILIATION = PASS
DUPLICATE_SAFETY = PASS
SECURITY_CONTINUITY = PASS
ACTUAL_WRITE = PASS only with explicit authorization + read-back evidence
```

---

## D4 — HR CONTROL CENTER / DASHBOARD MUST MANAGE THE MBO CYCLE END-TO-END

### Main app
`App800 = MBO HR Control Center`

### Objective
HR should perform at least 95% of routine MBO administration without IT intervention.

### Required operational modules
```text
1. Annual Cycle / Fiscal Year management
2. Five phase calendars (start/end)
3. Employee evaluation monitor
4. Pipeline / stage / overdue / completion dashboard
5. Search / filter / exception view
6. Routing health and routing management
7. Appraiser reassignment with reason/audit where authorized
8. Evaluation Profile / App796 health visibility
9. Hoshin readiness / management link or operation
10. Reopen / revision center
11. Login/account operational status (lock / must-change / reset workflow as safely designed)
12. Legacy migration status/reconciliation view
13. Admin/System Health linkage
14. Export/reporting where HR is authorized
```

### HR must be able to answer quickly
- Who has not started?
- Who is overdue?
- Who is waiting for which appraiser?
- Whose routing/profile is invalid?
- Which phase is open?
- Which records are blocked?
- Which records were migrated?
- Which users are locked/must-change password?

### Completion
Dashboard charts alone are NOT enough. Required operational management flows must work or be truthfully classified as blocked/pending authorization.

---

## D5 — COPY / CARRY FORWARD EMPLOYEE'S OWN PREVIOUS MBO

### User requirement
Employee can copy their own previous MBO planning content into a new fiscal year.

### Allowed whitelist
```text
Objective
Action Plan
Additional Agreement
Weight
```

### Default behavior
Difficulty is NOT carried forward unless a later explicit decision changes the rule.

### Must never copy
```text
Scores
Self ratings
Appraiser ratings
Appraiser comments
HR score/grade
Workflow status
Approval timestamps
Old appraisers
Old routing snapshot
Old evaluation profile snapshot
Old Hoshin snapshot
Confidential result fields
```

### Target FY must resolve fresh
```text
Current App53 employee facts
Current Evaluation Profile/App796
Current Routing/App795
Current Hoshin/App797
Current FY phase configuration
```

### Security
Only authenticated employee's own historical MBO may be used as carry-forward source.

### Workflow boundary
Allowed only for new/draft objective stage before workflow begins.

---

## D6 — INTEGRATED E2E / REGRESSION / SECURITY CLOSURE

This is not a separate feature; it proves D1–D5 + D7 work together.

### Minimum end-to-end matrix
```text
Employee login / forced password change
→ own record only
→ create/open current FY MBO
→ optional copy from own previous FY
→ objective workflow
→ appraiser route
→ mid-year
→ self evaluation
→ appraiser evaluation
→ HR final
→ HR Dashboard reflects state
→ Excel/PDF export respects scope
→ Admin Support Center can diagnose the same employee truthfully
→ historical migrated records remain historical/read-only/no active workflow
```

### Regression requirements
- targeted tests per subsystem
- full `npm test`
- normal build
- source/dist parity
- UI regression where affected
- direct-URL/access isolation test
- export isolation test
- copy-source isolation test
- no unauthorized Kintone writes

### Final result
No `PASS` merely because unit tests pass. E2E and security evidence are mandatory for go-live classification.

---

## D7 — ADMIN SUPPORT CENTER MUST BE FINISHED

### Technical user
`admin-form`

### Role boundary
```text
TECHNICAL ADMIN ONLY
0 BUSINESS WORKFLOW AUTHORITY
NO approve
NO return
NO submit
NO complete
NO impersonation
```

### Required capabilities
Given an `Employee_Code` (+ Fiscal Year where required), Admin Support Center must truthfully inspect:

```text
Employee identity/source evidence (App53)
Evaluation Profile expected vs actual
Part A / Part B weights expected vs actual
Routing Key expected vs stored/available evidence
Routing topology
Expected appraiser count
1st Appraiser expected vs actual
2nd Appraiser expected vs actual
3rd Appraiser expected vs actual
4th Appraiser expected vs actual
Current workflow status
Expected workflow path
Current active appraiser slot
Workflow current-state consistency
Real workflow audit history status
Root cause classification
Recommended repair class
Safe Before/After repair preview
Impact / risk / source-of-truth
Sanitized diagnostic snapshot
```

### Evidence rules
- App53 = employee master.
- App795 = routing master.
- App796 = published profile/scoring config.
- App794 = current MBO record/snapshot/process state.
- Reuse the same production profile resolver; no duplicate Admin-only mapping.
- Full route PASS requires complete authoritative Appraiser 1..N identities.
- Future M2/G2 topology cannot be called production-certified solely from Preview logic.
- Actual workflow transition history stays `PENDING_AUDIT_DESIGN / NOT_AVAILABLE` until a genuine audited source exists.
- Never fabricate employee, route, profile, status, timestamp, audit event or evidence.

### Repair model
Today/local closure may include:
```text
CHECK
→ ROOT CAUSE
→ PREPARE REPAIR
→ EXACT DIFF / IMPACT / RISK
```

`CONFIRM REPAIR` remains disabled unless a separately authorized Controlled Repair package is approved.

---

# 2. JOB STATUS BOARD — MUST BE MAINTAINED

Only evidence-based statuses are allowed:

```text
NOT_STARTED
IN_PROGRESS
IMPLEMENTED_PENDING_REVIEW
PASS
BLOCKED
PASS_WITH_DOCUMENTED_EXCEPTION
```

Current control-board starting point:

| ID | Deliverable | Status | Review/Blocker Note |
|---|---|---|---|
| D1 | Login + Privacy | IN_PROGRESS / SECURITY BLOCKER REVIEW REQUIRED | Trusted backend/session/identity binding must be secure |
| D2 | Excel + PDF Original Format | IN_PROGRESS | Existing Excel architecture exists; exact template parity must be verified |
| D3 | 8-App Legacy → App794 | IN_PROGRESS / WRITE NOT AUTHORIZED | Read-only discovery/dry-run first; actual write requires explicit authorization |
| D4 | HR Control Center End-to-End | IN_PROGRESS | App800 foundation exists; operational completeness still to prove |
| D5 | Copy Own Previous MBO | IN_PROGRESS | Carry-forward business rules already frozen; implementation/E2E required |
| D6 | Integrated E2E / Regression | NOT_STARTED | Runs after constituent implementations reach reviewable state |
| D7 | Admin Support Center | IMPLEMENTED_PENDING_REVIEW | Residual closure implementation exists; independent review required |

**Do not downgrade or remove a row.** Update only Status and Review/Blocker Note with evidence.

---

# 3. EXECUTION PRIORITY — FASTEST SAFE PATH

```text
P0. Read this file + Confirmed Baseline + latest Git state
P1. Independently review/close current D7 Admin Support Center checkpoint
P2. D1 Login/Identity/Privacy architecture + secure implementation boundary
P3. D5 Copy Previous MBO + D2 Excel/PDF (parallelizable after identity contract is fixed)
P4. D4 HR Control Center operational closure
P5. D3 Legacy migration mapping/dry-run/reconciliation; actual write only after explicit authorization
P6. D6 full integrated E2E/security/regression
P7. Update this Job Status Board + review package + current state + handoff
```

Do not waste time rebuilding subsystems already proven. Reuse existing modules and frozen business rules.

---

# 4. EVERY AI HANDOFF MUST ANSWER THESE 10 QUESTIONS

Before doing work, and again before stopping, record:

```text
1. What is current branch HEAD?
2. Which D1–D7 job(s) are being worked on?
3. What is their exact status before this work?
4. What files/components are being changed?
5. What authoritative baseline controls the change?
6. Is any Kintone GET/WRITE/DEPLOY required?
7. If write/deploy is required, is there exact explicit authorization?
8. What tests/evidence prove completion?
9. What remains blocked or unverified?
10. What is the exact next action for the next AI/chat?
```

If any question cannot be answered, stop and inspect repository evidence instead of guessing.

---

# 5. NO-DROP CHECKLIST — RUN BEFORE EVERY STOP

Before an AI says “done”, verify all seven IDs are still present:

```text
[ ] D1 LOGIN + PRIVACY
[ ] D2 EXCEL + PDF
[ ] D3 8-APP MIGRATION
[ ] D4 HR CONTROL CENTER
[ ] D5 COPY OWN PREVIOUS MBO
[ ] D6 INTEGRATED E2E
[ ] D7 ADMIN SUPPORT CENTER
```

If one is missing from the handoff/report, the handoff is INVALID.

---

# 6. NEW CHAT CONTINUATION PROMPT — COPY THIS INTO A BRAND-NEW CHAT

```text
We are continuing the MBO2026 project from repository evidence, not from chat memory.

Repository: rebootob/MBO2026
Branch: ai/antigravity-wp002c

You are the Control Plane / Project Lead / Architect / Independent Reviewer.
Antigravity is the Execution Plane.

MANDATORY FIRST ACTION:
1. Access the GitHub repository.
2. Read project-docs/00_MASTER_JOBLIST.md FIRST.
3. Then read project-docs/CONFIRMED_BASELINE/README.md and ALL files under project-docs/CONFIRMED_BASELINE/.
4. Then read project-docs/AI_START_HERE.md.
5. Read project-docs/AI_ACTIVE_TASK.md, TODAY_MBO_CLOSEOUT_MISSION.md, CURRENT_STATE.md, HANDOFF.md and AI_REVIEW_PACKAGE.md.
6. Inspect the latest branch HEAD and recent diff/commits before giving me a status.

The seven mandatory jobs must NEVER be dropped:
D1 Login + password change + strict employee data isolation
D2 Excel + PDF export in original legacy format
D3 migrate all history from 8 legacy PMS apps (283,310,305,643,307,640,715,716) into App794
D4 HR Control Center/App800 must manage the MBO cycle end-to-end
D5 employee can copy ONLY their own previous MBO planning fields into a new FY
D6 full integrated E2E/security/regression closure
D7 Admin Support Center must be completed

Critical login requirement:
- initial MBO username = Employee_Code
- initial MBO password = Employee_Code
- force password change on initial/default login
- user can change own password later
- Employee A must never see/export/copy/query Employee B data unless explicitly authorized by a legitimate business role
- do NOT implement insecure browser-only password verification or expose password hashes to browser

Governance:
- Confirmed Baseline wins over old docs/source when conflicts exist.
- App53 and the 8 legacy apps are protected/read-only sources.
- No Kintone write/deploy is authorized implicitly.
- Any actual App794 migration write, schema/process change, or deploy requires an exact planned operation and explicit authorization.
- admin-form = Technical Admin only, zero business workflow authority.
- Do not claim PASS without evidence.
- Implementer cannot self-certify the independent review gate.

FIRST RESPONSE TO ME:
A. Tell me current branch HEAD.
B. Give the D1–D7 scoreboard from repository evidence.
C. Tell me what was completed in the latest commit.
D. Tell me the highest-priority next action.
E. Continue from that action without asking me to repeat project history unless a real business decision is missing.

When I type “review”, independently review the latest work against Confirmed Baseline and source evidence.
When I type “ต่อไป”, execute the next logical Control Plane step, prepare/update the task for Antigravity, and keep D1–D7 intact.
```

---

# 7. RELATIONSHIP TO OTHER CONTROL DOCUMENTS

```text
00_MASTER_JOBLIST.md         = MASTER job completeness / continuity / no-drop control
CONFIRMED_BASELINE/*         = authoritative confirmed business + technical facts
AI_START_HERE.md             = reading/navigation protocol
AI_ACTIVE_TASK.md            = current tactical execution package
TODAY_MBO_CLOSEOUT_MISSION.md= current seven-deliverable closeout mission
AI_REVIEW_PACKAGE.md         = latest implementation/review evidence
CURRENT_STATE.md             = current system/repository operational state
HANDOFF.md                   = exact operational next action
```

A tactical task may focus on only one or two jobs at a time. That does not remove the other jobs from the mission.

---

# 8. DEFINITION OF PROJECT-CLOSE FOR THIS MISSION

The closeout mission is not complete until all seven deliverables have evidence-backed outcomes and no hidden P0 security/data-loss blocker remains.

```text
D1_LOGIN_PRIVACY = PASS
D2_EXPORT_EXCEL_PDF = PASS
D3_LEGACY_MIGRATION = PASS
D4_HR_CONTROL_CENTER = PASS
D5_COPY_PREVIOUS_MBO = PASS
D6_INTEGRATED_E2E = PASS
D7_ADMIN_SUPPORT_CENTER = PASS
P0_DEFECTS_OPEN = 0
SECURITY_ISOLATION_RELEASE_BLOCKER = PASS
```

If a real external/security authorization prevents one item from reaching PASS, report `BLOCKED` with exact evidence and the smallest required user decision. Never hide the blocker to make the scoreboard look complete.
