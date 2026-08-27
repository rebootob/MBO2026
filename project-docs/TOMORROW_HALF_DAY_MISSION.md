# TOMORROW HALF-DAY MISSION — MBO2026

> Purpose: execution-ready plan for the next working session.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Target duration: approximately 4–5 hours.
> User mandate: **all 6 items below are mandatory; none may be silently dropped.**
> This document is a planning/control document only. It does not itself authorize Kintone writes, schema changes, process changes, ACL changes, or deployment.

---

## 0. MISSION SUCCESS DEFINITION

The half-day mission contains exactly six mandatory business outcomes:

1. Employee login + strict employee data isolation.
2. Excel + PDF export in the previous/original business format.
3. Migration of historical data from all 8 legacy PMS apps into App794.
4. HR Control Center / HR Dashboard full-cycle management capability.
5. Employee self-service copy/carry-forward of the employee's own prior MBO.
6. Integrated end-to-end verification proving the above five features work together safely.

No item may be declared complete from UI mockup alone. Each item needs implementation evidence, tests, and where applicable Kintone read-back evidence after explicit write authorization.

---

# 1. LOGIN + EMPLOYEE DATA ISOLATION

## 1.1 User Requirement Confirmed for This Mission

The requested secondary MBO login behavior is:

```text
Username default = Employee_Code
Initial Password default = Employee_Code
User may change password after login
```

Security interpretation:

- Initial password equal to Employee_Code is accepted only as a bootstrap credential.
- First successful login with the bootstrap password MUST require immediate password change before accessing MBO data.
- The system must never store plaintext passwords.
- Password hash/verification must be server-side/trusted-service-side only; browser JavaScript must never receive `Password_Hash`.
- App801 is credential metadata/storage and general employees must not directly read credential records.
- Account must fail closed if disabled/locked/expired.

Required states/fields conceptually include:

```text
Employee_Code
Kintone_User_Code
Password_Hash                  // server-side only
Must_Change_Password
Password_Changed_At
Password_Expires_At
Failed_Login_Count
Locked_Until
Account_Status
```

## 1.2 Mandatory Identity Binding

Access must use BOTH identities correctly:

```text
Kintone authenticated principal
        ↓ exact verified binding
Employee_Code
        ↓ secondary MBO authentication
Authorized employee session
        ↓
Own App794 records only
```

Rules:

- User cannot type another Employee_Code and gain access.
- Secondary username must equal the Employee_Code bound to the current authorized Kintone principal.
- Employee A cannot access Employee B by URL, record ID, REST query, export, attachment link, search, or history screen.
- `admin-form` remains Technical Admin only and must not become an Employee/Requester/Appraiser/HR business identity.
- HR/appraiser access is role-based and separate from employee self-access.

## 1.3 First-Login UX

```text
MBO Login
Username: Employee Code
Password: initial Employee Code
        ↓
BOOTSTRAP_PASSWORD_DETECTED
        ↓
Force Change Password
        ↓
New Password + Confirm Password
        ↓
Password policy validation
        ↓
Session established
```

Recommended minimum password policy for the new password:

- configurable from App800/service configuration;
- minimum length >= 8 as initial practical target;
- cannot equal Employee_Code;
- cannot equal current/bootstrap password;
- lockout after configured failed attempts;
- policy must fail closed if production config is missing rather than silently using hidden defaults.

## 1.4 Half-Day Acceptance Tests

```text
LOGIN-01 valid bootstrap login -> MUST_CHANGE_PASSWORD
LOGIN-02 wrong password -> denied + failed count
LOGIN-03 changed password -> old password rejected
LOGIN-04 disabled/locked account -> denied
LOGIN-05 user A login cannot request employee B session
LOGIN-06 Employee A cannot open Employee B App794 URL
LOGIN-07 Employee A cannot export Employee B data
LOGIN-08 admin-form is not business employee authority
LOGIN-09 browser payload/log/snapshot contains no Password_Hash
```

### Critical feasibility note

Client-side-only password checking is NOT acceptable as a real security boundary. If a trusted backend/serverless verifier is not available tomorrow, the team may complete the local/service contract and UI but **must not call the login feature production-secure or Gate-7 ready**. The fastest secure path is to use native individual Kintone principals as the primary security boundary plus the secondary MBO login backed by a trusted server-side verifier.

---

# 2. EXCEL + PDF EXPORT — ORIGINAL FORMAT PARITY

## 2.1 Existing Confirmed Deliverables

Repository documentation already specifies Excel deliverables:

```text
PMS_Staff & Chief_PART_A.xlsx
PMS_Staff & Chief_PART_B.xlsx
Combined Multi-Sheet Workbook
```

The legacy/original Excel template supports up to 4 objectives; current design supports up to 10, so export must expand rows/pages without corrupting formulas or formatting.

## 2.2 Mandatory Rule: Do Not Invent the Old Format

Before implementation, Antigravity must locate the actual prior template/assets/source that previously produced the accepted Excel/PDF format.

Possible evidence locations:

- repository binary/template assets;
- previous export implementation;
- archived legacy templates;
- user-provided canonical sample file if available.

If the actual original template cannot be found:

```text
ORIGINAL_EXPORT_TEMPLATE = MISSING
```

Do NOT fabricate a new visual layout and call it the original format.

## 2.3 Export Scope

Employee own-record export:

```text
Excel Part A
Excel Part B
Combined Excel
PDF printable MBO
```

Security:

- employee: own record only;
- appraiser: assigned records only if policy allows export;
- HR: authorized enterprise scope;
- export layer must enforce authorization before obtaining source data;
- employee export must exclude fields that employee is not allowed to view.

PDF should preserve the approved business layout, pagination, Thai/English text, objective rows, appraisal summary, and attachments as references where supported.

## 2.4 Export Acceptance

```text
EXPORT-01 Excel opens without repair warning
EXPORT-02 formulas/formatting preserved
EXPORT-03 2, 4, 5, and 10 objective cases render correctly
EXPORT-04 PDF has no clipped/overflow content
EXPORT-05 employee export contains no confidential unauthorized fields
EXPORT-06 output matches canonical old-format sample/template
EXPORT-07 record identity/FY/employee/profile values match App794 source
```

---

# 3. MIGRATE ALL 8 LEGACY PMS APPS -> APP794

## 3.1 Source Apps — PERMANENT READ ONLY

Exactly these eight legacy apps are the source:

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

Legacy apps must NEVER be modified.

## 3.2 Important Baseline Conflict / Change Control

Current frozen migration governance says legacy migration is deferred until MBO V2 is stable/UAT approved. The user has now explicitly requested migration as a next-session half-day target.

Therefore tomorrow starts with an explicit control-plane reconciliation:

```text
OLD: LEGACY_MIGRATION_STATUS = DEFERRED
NEW USER TARGET: EXECUTE LEGACY MIGRATION TO APP794
```

Do not silently ignore the conflict. Record the new user decision/change context before any write.

## 3.3 Migration Contract

Every migrated record must include traceability such as:

```text
Record_Origin = LEGACY_MIGRATED
Legacy_Source_App_ID
Legacy_Source_Record_ID
Legacy_Source_Record_Number
Legacy_Source_Revision
Legacy_Source_Profile
Employee_Code
Fiscal_Year
Migration_Batch_ID
Migrated_At
Migration_Status
```

Unique identity:

```text
Legacy_Source_App_ID + Legacy_Source_Record_ID
```

Duplicate source => fail closed.

Historical scores must be preserved as historical values; do NOT recalculate old years with current scoring formulas.

Migrated legacy records must not enter current active workflow.

## 3.4 Required Execution Sequence

```text
A. Discover/read all 8 schemas + records
B. Build exact per-app field mapping
C. Identify employee/FY/duplicate/promotion conflicts
D. DRY_RUN = true
E. Reconcile source count
F. Produce exact target manifest
G. STOP for explicit App794 write authorization
H. Backup App794 target checkpoint
I. Batch write with deterministic Migration_Batch_ID
J. Post-write read-back
K. Reconcile counts + hashes/keys
L. Roll back only failed batch if verification fails
```

Reconciliation equation:

```text
SOURCE_TOTAL
=
MIGRATED
+ APPROVED_SKIPPED
+ DOCUMENTED_ERRORS
```

No unexplained missing record is acceptable.

## 3.5 Migration Acceptance

```text
MIG-01 all 8 source apps included
MIG-02 source apps writes = 0
MIG-03 dry-run reconciliation = 100%
MIG-04 duplicate source detection = PASS
MIG-05 historical score not recalculated
MIG-06 migrated records cannot enter active workflow
MIG-07 employee isolation also applies to migrated history
MIG-08 exact batch manifest retained
MIG-09 post-write read-back = 100% for successful batch
MIG-10 rollback can target batch records only
```

---

# 4. HR CONTROL CENTER / DASHBOARD — FULL-CYCLE MANAGEMENT

App800 must be the HR operational control plane, not only a chart dashboard.

## 4.1 Required Modules

1. **Annual Cycle / Phase Calendar**
   - Objectives start/end
   - Mid-Year start/end
   - Self Evaluation start/end
   - Appraiser Evaluation start/end
   - HR Final start/end

2. **Employee Evaluation Monitor**
   - Employee Code/name
   - FY
   - current stage/status
   - profile
   - route/appraisers
   - completion
   - overdue
   - issue state

3. **Routing Operations**
   - inspect App795 route
   - identify missing/duplicate/inactive appraiser
   - future routing changes
   - controlled current-record reassignment with reason where authorized

4. **Profile / Scoring Health**
   - App796 published config coverage
   - profile mismatch
   - missing config
   - configuration version/hash/status

5. **Hoshin Management**
   - Department/Section Hoshin readiness
   - version state
   - Ready/Superseded health

6. **Reopen / Revision Center**
   - controlled reopen
   - reason
   - revision number
   - archive linkage
   - audit

7. **Authentication Operations**
   - account status
   - Must Change Password
   - failed login/lock state
   - reset bootstrap credential action through trusted service only
   - NEVER display Password_Hash

8. **Migration / Export / Health Monitor**
   - migration batch status
   - source/target reconciliation
   - export readiness
   - Admin Support diagnostics
   - configuration blockers

## 4.2 HR Dashboard UX

Goal: HR sees exceptions first.

```text
Critical Blocker
Action Required
Overdue Warning
Information
```

Examples:

```text
12 employees missing valid route  -> [Inspect]
3 locked login accounts            -> [Manage]
5 overdue Mid-Year records         -> [Open Monitor]
1 duplicate App796 config          -> [Inspect Config]
Migration batch incomplete         -> [Reconcile]
```

Routine HR administration target remains >=95% without IT intervention, but destructive/high-risk schema/process/security changes remain controlled operations.

---

# 5. COPY / CARRY FORWARD OWN PREVIOUS MBO

This feature MUST copy planning content only, never clone the whole record.

## 5.1 User Flow

```text
Create new FY MBO
        ↓
[Copy Previous MBO]
        ↓
Show employee's own eligible previous FY records only
        ↓
Select source FY
        ↓
Preview copied fields
        ↓
Confirm
        ↓
Populate current Draft Objectives
```

## 5.2 Strict Copy Whitelist

Allowed:

```text
Objective
Action_Plan
Additional_Agreement
Weight
```

Default NOT copied:

```text
Difficulty
scores
self achievement
appraiser ratings
appraiser comments
HR comments/grade
workflow status
approval timestamps
old appraisers
old routing
old profile
old scoring config
old Hoshin snapshot
old audit/history
```

Target FY must resolve fresh:

```text
Profile
Part A/B weights
Scoring config
Routing/Appraisers
Current Hoshin
Phase calendar
```

Carry forward is allowed only in `NEW_RECORD` / `01 Draft Objective` before workflow starts.

## 5.3 Security

Employee can only select their own prior records. Query must be based on verified authenticated identity, not arbitrary typed Employee_Code.

## 5.4 Acceptance

```text
COPY-01 own previous FY appears
COPY-02 other employee record never appears
COPY-03 only whitelist fields copied
COPY-04 scores/comments/appraisers never copied
COPY-05 target profile/routing resolved fresh
COPY-06 current Hoshin remains current FY
COPY-07 disabled after workflow starts
COPY-08 resulting objective weights validated to 100% before submit
```

---

# 6. INTEGRATED HALF-DAY TEST / DEFINITION OF DONE

The mission is not complete until the six capabilities are checked together.

Minimum integrated scenario:

```text
Employee 0111
↓
Authenticate with bootstrap Employee_Code/password
↓
Force password change
↓
Open only own MBO
↓
Create next FY MBO
↓
Copy prior own objectives
↓
Resolve current FY Profile from App53/App796
↓
Resolve route/appraisers from App795
↓
Save Draft
↓
Export Excel + PDF canonical format
↓
HR sees record in App800 monitor
↓
HR can diagnose route/profile/status
↓
Employee cannot access another employee
↓
Migrated historical records are visible only within authorized historical scope
```

Mandatory final scoreboard:

```text
MISSION_1_LOGIN_ISOLATION = PASS|BLOCKED
MISSION_2_EXCEL_PDF_EXPORT = PASS|BLOCKED
MISSION_3_LEGACY_8APP_MIGRATION = PASS|DRY_RUN_PASS_AWAITING_WRITE_AUTH|BLOCKED
MISSION_4_HR_FULL_CYCLE = PASS|BLOCKED
MISSION_5_COPY_OWN_MBO = PASS|BLOCKED
MISSION_6_INTEGRATED_E2E = PASS|BLOCKED

HALF_DAY_MISSION_COMPLETE = YES only if all six required outcomes satisfy their approved completion level.
```

---

# 7. HALF-DAY EXECUTION ORDER

Target window: ~4–5 hours. Do not spend the first half of the session refactoring unrelated code.

## Block A — 0:00–0:25 — Preflight / Freeze Inputs

- review latest HEAD and Admin Support closure status;
- read Confirmed Baseline;
- locate original Excel/PDF template/assets;
- inspect App801/auth service boundary;
- inspect legacy migration mapping assets/scripts;
- inspect App800 existing dashboard modules;
- inspect carry-forward code/status;
- produce a one-page readiness matrix.

No implementation until missing prerequisites are identified.

## Block B — 0:25–1:20 — Login + Isolation First

Security is first because export, history, copy, and dashboard depend on authorization.

Implement/test:

- identity binding;
- bootstrap password rule;
- force password change;
- trusted password verifier boundary;
- own-record authorization;
- cross-employee denial tests.

If trusted server boundary is absent, stop claiming production security and isolate remaining work as sandbox/local implementation.

## Block C — 1:20–2:00 — Carry Forward + Export

These should reuse already-resolved record/profile/authorization context.

Implement:

- strict carry-forward whitelist;
- own-record source selector;
- Excel export parity;
- PDF print/export parity;
- authorization test on exports.

## Block D — 2:00–3:00 — Legacy Migration Engine

- exact eight-app mapping;
- dry run;
- reconciliation;
- manifest;
- duplicate detection;
- migrated-record workflow lock;
- target write package prepared.

If explicit Kintone App794 migration write authorization is granted, execute controlled batch + read-back. Otherwise finish at `DRY_RUN_PASS_AWAITING_WRITE_AUTH` rather than pretending migration is complete.

## Block E — 3:00–3:45 — HR Control Center Full-Cycle Integration

Prioritize one operational shell using existing App800 instead of building a new dashboard app.

Wire/verify:

- employee monitor;
- five calendars;
- routing/profile health;
- auth account status;
- migration status;
- reopen/reassignment links/actions according to existing authorization;
- export/diagnostics entry points.

## Block F — 3:45–4:30/5:00 — Integrated Regression + Review Package

- targeted tests;
- full npm test;
- build;
- source/dist parity;
- browser/local preview where required;
- authorized sandbox smoke only if approved;
- document exact remaining blockers;
- commit/push once per approved execution package;
- stop for independent ChatGPT review.

---

# 8. PRIORITY / SCOPE CONTROL RULES

To finish in half a day:

```text
P0 = Login security/isolation
P0 = Copy own MBO authorization
P0 = Export authorization + existing-format parity
P0 = Legacy migration dry-run/reconciliation
P0 = HR monitor/control essentials

NO broad UI redesign
NO unrelated refactor
NO new app unless existing App800/App801 truly cannot support requirement
NO new routing architecture
NO scoring redesign
NO schema invention without reviewed evidence
```

Reuse existing modules and masters wherever possible.

---

# 9. TOMORROW ANTIGRAVITY MASTER INSTRUCTION

Use this after the current Admin Support checkpoint is reviewed/closed and this mission is promoted to the active task:

```text
Read project-docs/TOMORROW_HALF_DAY_MISSION.md completely.
Read ALL project-docs/CONFIRMED_BASELINE files before implementation.
Read project-docs/SECURITY_MODEL.md, BUSINESS_RULES.md, EXCEL_EXPORT.md,
APP_REGISTRY.md, CURRENT_STATE.md and the latest AI_REVIEW_PACKAGE.md.

This is a half-day closure mission with SIX mandatory outcomes.
Do not silently drop, defer, rename, or replace any of the six.

MANDATORY OUTCOMES:
1. Employee secondary login and strict cross-employee data isolation.
   Username = Employee_Code.
   Bootstrap password = Employee_Code.
   Force password change on first successful bootstrap login.
   Password hash must remain server/trusted-service side only.
2. Excel and PDF export in the canonical previous format.
3. Migration of all eight legacy PMS apps to App794 using dry-run,
   reconciliation, exact source traceability, batch manifest and rollback safety.
4. App800 HR Control Center full-cycle operational management.
5. Employee can copy only their OWN prior MBO planning fields into a new FY draft.
6. Integrated end-to-end regression proving all above work together safely.

SECURITY NON-NEGOTIABLE:
Employee A must not be able to read/export/copy Employee B data by UI,
URL, record ID, API, search, history, attachment or export path.
Client-side hiding is not a security boundary.
admin-form remains Technical Admin only with zero business workflow authority.

MIGRATION NON-NEGOTIABLE:
Legacy apps 283,310,305,643,307,640,715,716 remain READ ONLY.
No historical score recalculation.
No active workflow for migrated records.
Run DRY_RUN and reconciliation before any App794 write.
Do not execute App794 migration writes unless the user/control plane explicitly
opens a write window for the migration package.

EXPORT NON-NEGOTIABLE:
Locate the real canonical legacy template/previous implementation first.
Do not invent a new visual format and call it the old format.

CARRY-FORWARD NON-NEGOTIABLE:
Whitelist only Objective, Action_Plan, Additional_Agreement, Weight.
Do not copy scores, comments, appraisers, routing, profile, workflow, audit,
old Hoshin snapshots, or confidential values.
Resolve target FY profile/routing/Hoshin fresh.

WORK METHOD:
- Inspect existing implementation first and reuse it.
- Avoid unrelated refactors.
- Keep modular src as source of truth and rebuild dist normally.
- Add targeted tests for every requirement.
- Run full npm test and build.
- Update living docs truthfully.
- Do not claim PASS without evidence.
- Commit and push according to the approved write/deploy boundary, then STOP for ChatGPT review.

Final report MUST contain six separate mission statuses and an exact blocker list.
```

---

# 10. CONTROL-PLANE DECISIONS NEEDED BEFORE LIVE EXECUTION

These are not questions that block local preparation, but they block specific live actions:

1. **Trusted login backend/serverless runtime** — required for production-secure secondary password verification.
2. **App794 legacy migration write authorization** — required after dry-run/reconciliation.
3. **Any App800/App801 schema/config writes** discovered necessary during preflight — must have explicit manifest and authorization.
4. **Deployment authorization** — local implementation/build does not equal deployment approval.

Everything else should be prepared before asking the user, so the user only needs to approve exact high-risk actions rather than design details.
