# TODAY MBO CLOSEOUT MISSION — 7 REQUIRED DELIVERABLES

> Control Plane: ChatGPT
> Execution Plane: Antigravity
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Target: **CLOSE ALL SEVEN REQUIRED DELIVERABLES TODAY**
> Default Kintone write/deploy authorization: **NONE unless separately and explicitly authorized for the exact operation**

## 0. TODAY NORTH STAR

Today is not a partial-feature day. The system must be brought to an evidence-backed closeout state for all seven major deliverables below.

```text
D1 LOGIN + EMPLOYEE DATA ISOLATION
D2 EXCEL + PDF ORIGINAL-FORMAT EXPORT
D3 LEGACY 8-APP -> APP794 MIGRATION
D4 HR CONTROL CENTER END-TO-END MANAGEMENT
D5 COPY OWN PREVIOUS MBO
D6 INTEGRATED E2E / REGRESSION / RELEASE EVIDENCE
D7 ADMIN SUPPORT CENTER FINAL CLOSURE
```

No deliverable may be silently omitted, renamed away, or marked PASS without evidence.

---

# 1. DELIVERABLE 1 — LOGIN + EMPLOYEE DATA ISOLATION

## Business requirement

Employee self-service requires a secondary MBO login after the Kintone login boundary.

Initial credential rule:

```text
Username = Employee_Code
Initial Password = Employee_Code
Must_Change_Password = true
```

On first successful MBO login, the employee must be forced to set a new password before accessing MBO data.

## Security requirements

- Initial password is bootstrap-only.
- New password must never be stored or verified in plain text.
- Password hash/verification must not execute in browser-only JavaScript.
- Browser must never receive `Password_Hash` or secret material.
- App801 remains credential metadata/store; employee browser direct credential-store access is prohibited.
- Authenticated identity must bind deterministically to exactly one Employee_Code.
- Employee A must never view/read/edit/export/copy Employee B data.
- Client-side hiding alone is not an authorization boundary.

## Mandatory tests

```text
FIRST_LOGIN_EMPLOYEE_CODE_PASSWORD = PASS
FORCED_PASSWORD_CHANGE = PASS
NEW_PASSWORD_LOGIN = PASS
OLD_INITIAL_PASSWORD_AFTER_CHANGE = DENIED
WRONG_PASSWORD = DENIED
LOCKOUT_POLICY = VERIFIED OR EXPLICITLY BLOCKED BY MISSING POLICY EVIDENCE
EMPLOYEE_A_CANNOT_ACCESS_EMPLOYEE_B = PASS
DIRECT_URL_CROSS_EMPLOYEE = DENIED
EXPORT_CROSS_EMPLOYEE = DENIED
COPY_CROSS_EMPLOYEE = DENIED
```

## Same-day closure rule

A secure production claim is allowed only if a trusted server-side verification boundary exists and is evidenced. If no trusted backend exists, Antigravity must complete the client/domain/provider contract and fail closed, and report `SECURE_BACKEND_REQUIRED` rather than implementing insecure browser password verification.

---

# 2. DELIVERABLE 2 — EXCEL + PDF EXPORT IN ORIGINAL FORMAT

## Required outputs

At minimum preserve the approved/legacy presentation semantics for:

```text
PMS_*_PART_A.xlsx
PMS_*_PART_B.xlsx
Combined Multi-Sheet Workbook
PDF equivalent of the original business form
```

Do not redesign the export and call it the old/original format.

## Requirements

- Reuse the original templates/assets where they actually exist.
- Preserve formulas, merged cells, printable areas, labels and business layout.
- Support 2–10 active Objectives.
- For more objectives than the historical template physically supports, use controlled row expansion/overflow while preserving layout semantics.
- Export must use the employee's correct frozen FY Profile/weights and record values.
- Export authorization must use the same data-isolation boundary as record access.
- Employee exports own record only.
- Assigned Appraiser/authorized HR export only within authorized scope.
- Confidential Step4/Step5 data must not leak into employee exports.

## Acceptance

```text
EXCEL_PART_A = PASS
EXCEL_PART_B = PASS
EXCEL_COMBINED = PASS
PDF_EXPORT = PASS
ORIGINAL_FORMAT_PARITY = PASS / NEEDS_USER_VISUAL_CONFIRMATION
2_TO_10_OBJECTIVES = PASS
EXPORT_SECURITY = PASS
```

---

# 3. DELIVERABLE 3 — MIGRATE ALL LEGACY DATA FROM 8 PMS APPS TO APP794

## Read-only source apps

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

All eight legacy apps remain permanently READ ONLY.

## Migration destination

`App794` only, using `Record_Origin = LEGACY_MIGRATED` or the reviewed equivalent.

Historical migrated records must never enter the active current-year workflow.

## Required migration pipeline

```text
SOURCE DISCOVERY / USER-PROVIDED EXPORT INPUT
-> FIELD MAPPING PER LEGACY APP
-> NORMALIZATION WITHOUT ALTERING SOURCE
-> DUPLICATE / PROMOTION HISTORY RESOLUTION
-> DRY RUN
-> SOURCE COUNT RECONCILIATION
-> EXACT TARGET MANIFEST
-> TARGET PRE-MIGRATION BACKUP/CHECKPOINT
-> AUTHORIZED BATCH WRITE TO APP794
-> READ-BACK
-> RECONCILIATION
-> BATCH RESULT
-> ROLLBACK BY EXACT MANIFEST IF FAILED
```

## Mandatory traceability

Each migrated target record must preserve enough metadata to identify at least:

```text
Legacy_Source_App_ID
Legacy_Source_Record_ID
Source profile/class
Employee_Code
Fiscal_Year
Migration_Batch_ID
Record_Origin
Migration status/time
```

No historical score may be recalculated using current MBO V2 formulas.

## Governance conflict resolution

Existing governance previously deferred production migration until V2 stabilization/UAT. The user's latest same-day direction makes migration a current required deliverable. Before actual writes, document this as an explicit reviewed change/supersession to the deferral decision; do not silently contradict frozen docs.

## Acceptance

```text
ALL_8_APPS_MAPPED = PASS
DRY_RUN = PASS
SOURCE_COUNT_RECONCILED = PASS
DUPLICATE_SAFE = PASS
HISTORICAL_SCORE_NOT_RECALCULATED = PASS
MIGRATION_SECURITY_ISOLATION = PASS
WRITE_BATCH = PASS only after exact explicit authorization
READBACK = PASS
ROLLBACK_MANIFEST = PASS
```

If exact Kintone write authorization is not granted, close same-day implementation at:

`MIGRATION_READY_FOR_CONTROLLED_WRITE = PASS`

and do not fabricate `MIGRATION_COMPLETE`.

---

# 4. DELIVERABLE 4 — HR CONTROL CENTER MUST MANAGE THE FULL MBO CYCLE

App800 must function as an HR operations console, not only a dashboard.

## Required operational modules

```text
A. Pipeline Overview
B. Employee Evaluation Monitor
C. Search / Filter by FY, org, position, profile, route, status, overdue
D. Five-Phase Calendar Management
E. Routing Operations
F. Current-record Appraiser Reassignment workflow/contract
G. Profile/Scoring Configuration Health
H. Hoshin Management
I. Reopen / Revision Center
J. Login / Account Support
K. Legacy Migration Monitor
L. System / Configuration Health
M. Admin Support Center entry/link where appropriate
```

## HR operational target

HR should perform >=95% of normal operating support without IT intervention, subject to native authorization and controlled-repair boundaries.

## Important safety boundary

HR business operations and `admin-form` technical operations are different roles. Do not merge them.

## Acceptance

```text
HR_MONITORING = PASS
HR_PHASE_CALENDAR = PASS
HR_ROUTING_OPERATIONS = PASS
HR_REASSIGNMENT_CONTRACT = PASS
HR_HOSHIN_MANAGEMENT = PASS
HR_REOPEN_REVISION = PASS
HR_LOGIN_SUPPORT = PASS
HR_MIGRATION_MONITOR = PASS
HR_HEALTH_MONITOR = PASS
```

Any operation requiring an unimplemented authorized write path must be clearly classified, not represented as a working button.

---

# 5. DELIVERABLE 5 — COPY OWN PREVIOUS MBO

## User flow

```text
Create/Open target FY Draft
-> COPY PREVIOUS MBO
-> choose previous own FY record
-> preview whitelist fields
-> confirm copy
-> re-resolve target FY configuration
```

## Allowed whitelist

```text
Objective
Action Plan
Additional Agreement
Weight
```

Difficulty is not copied by default unless a later confirmed rule changes this.

## Never copy

```text
Self/Appraiser ratings
Scores / grade
Manager/GM/Appraiser comments
HR decision
Workflow status
Approval timestamps
Old Requester/Approver authority
Old Appraiser identities
Old routing snapshot
Old profile/scoring snapshot
Old Hoshin snapshot
Authentication/security metadata
```

## Target FY rules

- Only own previous MBO can be copied by Employee.
- Target FY Profile resolves fresh according to target-year rule.
- Target FY Routing resolves fresh.
- Target FY Hoshin resolves fresh.
- Copy is allowed only before target workflow begins (`NEW_RECORD` / `01 Draft Objective` equivalent).
- One employee + one FY remains exactly one primary MBO record.

## Acceptance

```text
COPY_OWN_PREVIOUS = PASS
COPY_OTHER_EMPLOYEE = DENIED
COPY_WHITELIST_ONLY = PASS
NO_SCORE_COMMENT_WORKFLOW_COPY = PASS
TARGET_PROFILE_REFRESH = PASS
TARGET_ROUTING_REFRESH = PASS
TARGET_HOSHIN_REFRESH = PASS
```

---

# 6. DELIVERABLE 6 — INTEGRATED E2E / REGRESSION / RELEASE EVIDENCE

This is the integration gate proving that D1–D5 and D7 do not break existing MBO behavior.

## Required integrated scenarios

```text
Employee login -> own annual MBO -> copy previous -> edit objectives -> export
Appraiser route resolution -> assigned-record visibility only
HR monitor -> route/profile/status visibility -> approved operation contract
Admin-form -> diagnostic only -> no business action authority
Legacy historical record -> visible only within authorized scope -> no active workflow
Privacy adversarial tests -> direct URL / export / copy isolation
```

## Required test families

```text
Static/source checks
Targeted unit tests
Routing/profile/scoring regression
Workflow regression
Privacy/security tests
Export tests
Migration dry-run reconciliation tests
HR Control Center tests
Admin Support Center tests
Full npm test
Build
Source/dist parity
No-orphan check
```

## Acceptance

No global PASS if any P0 security/data-loss issue remains.

---

# 7. DELIVERABLE 7 — ADMIN SUPPORT CENTER FINAL CLOSURE

This is now a mandatory same-day closeout deliverable.

## Core user requirement

Technical admin `admin-form` must be able to enter Employee Code (+ FY where applicable) and answer reliably:

```text
Is this employee's Evaluation Profile correct?
Is this employee's Routing Key/Topology correct?
Are Appraiser 1..4 assigned to the correct people?
Is the current workflow state consistent with the expected route?
What evidence is missing?
What is the root cause?
What is the safe repair candidate?
```

## Mandatory boundaries

```text
admin-form = TECHNICAL_ADMIN_ONLY
business workflow authority = NONE
cannot submit/approve/return/complete/score as another role
Controlled Repair stays disabled unless separately authorized
```

## Required functionality

```text
System Health
Employee Check
Evaluation Profile expected-vs-actual
Routing expected-vs-actual
Ordinal Appraiser 1..4 exact comparison
Workflow expected-path/current-state validation
Workflow audit-source status
Diagnostic Snapshot
Root Cause Classification
Prepare Repair
Before/After exact diff
Impact/Risk/Source of Truth
```

## Required remaining closure rules

- Use shared production profile policy; no duplicate admin profile mapping.
- Route resolution must be separable from requester authorization.
- Full App795 evidence requires every required Appraiser 1..N identity.
- Admin UI entry must itself enforce `admin-form` identity.
- Production-intended diagnostic provider must be READ ONLY.
- Preview fixtures must be clearly marked non-production evidence.
- Future M2/G2 topology must not be production-certified merely because Preview supports it.
- Actual workflow transition history remains `NOT_AVAILABLE / PENDING_AUDIT_DESIGN` until a real audited source exists.
- Missing evidence must never render as green/PASS.
- Repair diff must show only actual changed fields, including changed Appraiser slots.

## Same-day Admin closure acceptance

```text
ADMIN_IDENTITY_GATE = PASS
ADMIN_ZERO_BUSINESS_AUTHORITY = PASS
EMPLOYEE_CHECK = PASS
PROFILE_VALIDATION = PASS
ROUTE_VALIDATION = PASS
APPRAISER_1_TO_4_VALIDATION = PASS
WORKFLOW_CURRENT_STATE_VALIDATION = PASS
WORKFLOW_AUDIT_SOURCE_STATUS = HONEST / NO FABRICATION
PREPARE_REPAIR = PASS
CONFIRM_REPAIR = DISABLED
ADMIN_LOCAL_CLOSURE = PASS
```

Actual persistent workflow action history may remain a production follow-up only if no trusted audit source currently exists; this must not block honest local closure of current-state diagnostics.

---

# 8. EXECUTION ORDER FOR TODAY

Do not execute seven tracks randomly. Use this dependency order:

```text
BLOCK A — 20-30 min
Review and close current Admin residual implementation checkpoint.

BLOCK B — 60-90 min
D1 Login / Identity / Privacy architecture + implementable secure boundaries.

BLOCK C — 60 min
D5 Copy Previous + D2 Export, both built on identity/record-isolation rules.

BLOCK D — 60-90 min
D7 Admin Support final local closure and regression.

BLOCK E — 60-90 min
D4 HR Control Center operational closure.

BLOCK F — 60-120 min
D3 Legacy migration mapping + dry run + reconciliation + controlled-write package.

BLOCK G — 45-60 min
D6 Integrated E2E + full tests + build + review package.
```

Parallelize only independent pure-code/test work. Do not parallelize writes to the same Kintone app or the same Git file.

---

# 9. SPEED RULES — FINISH TODAY WITHOUT LOWERING SAFETY

1. Reuse existing source/services before creating new modules.
2. User may provide exports/data from Kintone apps to reduce Antigravity discovery cost; prefer those exports when supplied.
3. No broad refactor of frozen UI.
4. No redesign of established business rules.
5. One canonical resolver per concern: identity, profile, routing, ordinal appraisers.
6. Build adapters around existing core logic rather than duplicating policy.
7. Each block ends with targeted test before moving on.
8. Do not spend time proving facts already frozen in Confirmed Baseline unless source conflicts.
9. Stop only for a real blocker: security architecture, missing authoritative data, or explicit write authorization.
10. Every blocker must include the exact next action needed; never leave `TBD` alone.

---

# 10. END-OF-DAY SCOREBOARD

Antigravity/Control Plane must report exactly:

```text
D1_LOGIN_PRIVACY = PASS | BLOCKED(reason)
D2_EXPORT_EXCEL_PDF = PASS | BLOCKED(reason)
D3_LEGACY_MIGRATION = PASS | READY_FOR_CONTROLLED_WRITE | BLOCKED(reason)
D4_HR_CONTROL_CENTER = PASS | BLOCKED(reason)
D5_COPY_PREVIOUS_MBO = PASS | BLOCKED(reason)
D6_INTEGRATED_E2E = PASS | FAIL
D7_ADMIN_SUPPORT_CENTER = PASS | BLOCKED(reason)

P0_DEFECTS_OPEN = N
KINTONE_WRITES_TODAY = N
KINTONE_DEPLOYS_TODAY = N
REAL_USER_DATA_IMPACT = N
FINAL_GO_LIVE_READINESS = PASS | BLOCKED(reason)
```

No deliverable may disappear from this scoreboard.

---

# 11. DEFINITION OF DONE FOR TODAY

Today is considered successfully closed only when:

- D1, D2, D4, D5, D7 are implementation/review PASS at the authorized environment boundary.
- D3 is either fully migrated with explicit authorized write + readback/reconciliation, OR reaches `READY_FOR_CONTROLLED_WRITE = PASS` with exact manifest/backup/rollback and waits only for explicit write authorization.
- D6 integrated regression is PASS.
- No known P0 privacy/data-loss defect remains.
- No insecure browser-only password verification is introduced.
- No legacy source app is modified.
- `admin-form` retains zero business workflow authority.
- Controlled Repair remains disabled unless explicitly authorized separately.
- Living docs and review package tell the truth about anything still requiring Production authorization.
