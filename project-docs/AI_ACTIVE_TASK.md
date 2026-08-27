# AI ACTIVE TASK — PROJECT CLOSE ROUND 2: BUNDLED LOCAL CLOSURE

> Control Plane: ChatGPT
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Starting HEAD: `98ccaef354a756f3b238d7b021b1bbce5827203d`
> Mode: **CREDIT-SAVER / PROJECT CLOSE / ONE LARGE LOCAL ROUND**
> Kintone authorization: **NONE**
> Kintone GET/WRITE/DEPLOY: **0 / 0 / 0**

## OBJECTIVE

Complete as much of the remaining MBO2026 closure as possible LOCALLY in one implementation/test round so that only one later controlled Kintone deploy/write/read-back round remains.

Do not contact Kintone. Do not browser-smoke. Do not deploy. Do not modify production/legacy apps. Do not reopen approved UI V2 visual design.

## REVIEW INPUT — ROUND 1

Round 1 HEAD `98ccaef354a756f3b238d7b021b1bbce5827203d` review:

```text
APP796_TIMEZONE_GUARD = PASS
IDENTITY_FOUNDATION = PASS_WITH_MUST_FIX
PASSWORD_DOMAIN_FOUNDATION = PASS_WITH_MUST_FIX
TRUSTED_SERVER_BOUNDARY = NO
MBO_SECONDARY_PASSWORD_SECURE_BACKEND = BLOCKED_NO_TRUSTED_SERVER_BOUNDARY
```

Three required corrections:

1. `HR` / `APPROVER` access must NOT be granted merely because a caller supplies the role string. Require an authoritative role assertion/context.
2. Technical admin (`admin-form` / `isTechnicalAdmin`) must NEVER silently become employee business identity. Technical-admin employee-self access must fail closed regardless of Employee_Code value.
3. Password max age must be injected/configured. Remove hard-coded `expiryDays = 90` business default.

Do not undo the App796 timezone-aware guard.

---

# MANDATORY 7 FINAL CLOSURE GATES

The final product must be designed toward all seven gates. This local round should close source/test readiness for as many as possible:

1. Login + Data Isolation
2. Excel + PDF Export
3. Legacy 8-App Migration -> App794
4. HR Dashboard Full-Cycle Management
5. Copy Previous MBO
6. Core App794/App795/App796 Integration
7. Hoshin Governance + MBO Integration

If a gate depends on live Kintone state, prepare the exact local implementation/manifest/test contract and leave runtime execution for the final authorized round.

---

# GATE 1 — SECURITY CORRECTIONS + SAFE INTEGRATION

## 1A. Identity / role authorization

Keep Kintone authenticated identity as the primary enforceable platform security boundary.

Fix `MboIdentityService` so:

```text
EMPLOYEE:
  authenticated Kintone identity -> exactly one bound Employee_Code
  target Employee_Code must equal bound Employee_Code

TECHNICAL ADMIN:
  isTechnicalAdmin=true -> DENY employee-self business operation always

HR / APPROVER:
  caller-supplied role string alone is NEVER sufficient
  require an authoritativeRoleContext / roleClaims / authorization predicate from trusted Kintone/runtime role resolution
  missing/unverified claim -> DENY
```

Do not invent production HR/approver membership data in tests. Use deterministic injected authoritative claims.

## 1B. Password lifecycle

Keep the existing password-domain foundation, but:

- remove hard-coded 90-day max age;
- require/inject `passwordMaxAgeDays` (or equivalent config object);
- invalid/missing max-age when expiry calculation is required -> FAIL CLOSED;
- failed-attempt threshold and lock duration remain injected/configurable;
- no plaintext persistence/logging/storage;
- no security questions.

## 1C. Secondary password runtime blocker

Repository review confirmed there is no trusted application-server boundary today.

Therefore:

```text
MBO_SECONDARY_PASSWORD_SECURE_BACKEND = BLOCKED_NO_TRUSTED_SERVER_BOUNDARY
```

Do NOT create browser-only hash verification and do NOT expose App801 hashes to employee browser code.

Continue to implement safe domain contracts, App801 schema/payload preparation, first-login/change/reset state machine, but do not falsely claim runtime secondary-password completion.

The later final report must distinguish:

```text
KINTONE_IDENTITY_DATA_ISOLATION = implementation gate
MBO_SECONDARY_PASSWORD_RUNTIME = blocked pending trusted backend
```

Do not let this blocker prevent closure of unrelated gates.

---

# GATE 6 — PREVIEW -> APP794 100% PARITY CLOSURE

`UI_V2_VISUAL_FREEZE = PASS`.

Do NOT redesign approved UI. Treat Preview Lab as the approved source of truth and close parity as one package, not field-by-field patching.

Required local work:

1. Compare `preview/index.html`, current App794 UI source, `dist/mbo-employee-app.js`, CSS, UI helpers, and approved UI baseline.
2. Move/reuse approved Preview behavior into maintainable source modules using existing architecture.
3. Preserve all confirmed UI rules:
   - 5 stages: Objectives / Mid-Year / Self Evaluation / Appraiser Evaluation / HR Final/Completed
   - Thai + English
   - ordinal Appraiser 1–4 labels only
   - same appraiser sequence through annual lifecycle
   - historical stage navigation read-only
   - attachments for Objectives/Mid-Year/Self Evaluation
   - Mid-Year user-entered progress %
   - native comments retained for Return/Reject
   - deadline/countdown/overdue
   - Workflow Action Timeline
   - prior-stage review for Appraiser/HR
   - permission-aware employee history
4. Do not alter frozen workflow topology/business paths.
5. Build local dist only once at the end if required.

Expected local status:

```text
PREVIEW_TO_APP794_PARITY_LOCAL = PASS
UI_V2_VISUAL_REDESIGN = 0
```

---

# GATE 7 — HOSHIN GOVERNANCE + MBO INTEGRATION

Reuse App797 foundation. Do not create a replacement Hoshin app.

Implement/finalize local domain/service/UI contracts for:

```text
Hoshin statuses: DRAFT / READY / PUBLISHED / INACTIVE
Levels: Department Hoshin + Section Hoshin
Selection: Fiscal Year + organization + effective date + PUBLISHED only
```

Create-MBO readiness:

```text
Employee -> App53 org -> FY
  -> exactly one valid Department Hoshin
  -> exactly one valid Section Hoshin
  -> READY_FOR_MBO
```

Fail closed errors:

```text
NO_DEPARTMENT_HOSHIN
NO_SECTION_HOSHIN
MULTIPLE_ACTIVE_HOSHIN
HOSHIN_NOT_PUBLISHED
HOSHIN_OUTSIDE_EFFECTIVE_DATE
ORGANIZATION_MISMATCH
```

App794 snapshot contract:

```text
Hoshin_Fiscal_Year
Department_Hoshin_ID
Department_Hoshin_Title
Department_Hoshin_Snapshot
Section_Hoshin_ID
Section_Hoshin_Title
Section_Hoshin_Snapshot
Hoshin_Snapshot_At
```

Historical MBO snapshot is immutable against later App797 edits.

Copy Previous must resolve NEW fiscal-year Hoshin, never reuse prior-year Hoshin snapshot.

Migration must preserve historical source Hoshin if source contains it; if absent mark `SOURCE_NOT_AVAILABLE`, never fabricate current Hoshin backwards.

Keep Hoshin separate from routing.

Expected local tests:

```text
HOSHIN_MASTER_GATE
HOSHIN_DUAL_LEVEL_GATE
HOSHIN_SNAPSHOT_GATE
HOSHIN_COPY_FORWARD_GATE
HOSHIN_EXPORT_GATE
```

---

# GATE 5 — COPY PREVIOUS MBO

Reuse `AnnualRecordService` / existing annual-record architecture. Do not build a parallel annual-record path.

Implement preview + create-candidate semantics:

```text
FY previous -> preview -> current FY Draft
```

Copy ONLY planning fields:

- Objective title/description
- KPI
- Target
- Measurement
- Weight
- planning notes

Never copy:

- Actual Result
- Achievement
- Self/Appraiser score
- comments/evaluation comments
- approvals
- timestamps
- workflow status/history
- revision/final result
- prior-year Hoshin snapshot

Current-year creation must regenerate:

- Fiscal Year
- Record_Key
- routing snapshot
- scoring/config snapshot
- NEW FY Department/Section Hoshin snapshot
- initial workflow state

Employee may copy only own MBO; HR path requires authoritative HR role assertion.
Duplicate `{FY}-{Employee}` must fail closed using existing duplicate guard.

Expected local gate:

```text
COPY_PREVIOUS_MBO_LOCAL = PASS
```

---

# GATE 4 — APP800 HR DASHBOARD + PHASE CALENDAR

Reuse current App800 HR Control Center / dashboard implementation. Do not create another HRCC app.

Complete local source for:

## Dashboard filters
- Fiscal Year
- Division
- Department
- Section
- Team
- Position
- Employee
- Status
- Approver

## Overview counts
- Total
- Not Started
- Draft
- Waiting Approval
- Returned
- Rejected
- In Progress
- Completed
- Overdue
- Routing Error
- Config Error
- Missing Approver

## Employee monitor
- employee identity/org
- current MBO
- current workflow status/stage
- appraiser sequence/topology
- stage progress
- Part A / Part B / final result
- history/migration source
- blocking errors

## HR operational actions — local contract only in this round
- initiate
- inspect
- correct allowable master-linked values
- reassign approver through governed path
- recalc routing
- return/reopen/resume when business rules allow
- carry forward / copy previous
- scoring monitor
- Excel/PDF export
- history
- diagnose blocker

No unrestricted HR bypass. All workflow-changing actions must preserve auditability and native Process constraints.

## Phase Calendar
HR configures open/close windows for:
- Objectives
- Mid-Year
- Self Evaluation
- Appraiser Evaluation
- HR Final

Calendar must gate availability/message/countdown only. Dates do NOT silently execute Kintone Process transitions.

Expected local status:

```text
HR_DASHBOARD_LOCAL = PASS
PHASE_CALENDAR_LOCAL = PASS
```

---

# GATE 2 — EXCEL + PDF EXPORT

Do NOT create a generic spreadsheet layout.

Confirmed project export doc already requires historical approved format and dynamic 10-objective handling.

Control Plane inspected the supplied historical templates. Use these findings as the design contract:

## Part A
- historical form structure is `A1:BF49`
- same overall layout family is used across Staff/Chief, Assistant Manager/Specialist, GM samples
- profile-specific Part A weight shown in form:
  - Staff / Chief = 70%
  - Assistant Manager = 60%
  - Manager-level / GM-family = 50% according to approved evaluation profile
- historical template visibly contains employee header, rating scales, Department/Section Hoshin area, objective rows, self evaluation, Appraiser 1/2 evaluation, comments, totals, evaluation-by/signature/date area
- old physical form shows 4 objective rows; new design must support Objective 1–10 without losing historical formatting semantics

## Part B
Historical competency forms are separate workbook/sheet layouts and vary by profile/competency set. Preserve approved profile-specific competency content and configured Part B weighting; do not infer competency count solely from filename/sample text.

## Required exports
- Part A workbook
- Part B workbook
- Combined workbook containing both
- PDF using the same approved data/scoring source and visually matching the approved MBO layout as closely as technically possible

## Dynamic 5–10 objectives
Use deterministic row expansion or overflow-page/sheet strategy while preserving:
- formulas
- merged-cell semantics
- borders/alignment
- print setup/page continuity
- totals
- appraiser columns

## Template binary rule
If the exact `.xlsx` binary templates are not present in the repository/local workspace accessible to Antigravity, DO NOT fabricate replacements and DO NOT block unrelated gates.
Implement the export mapping/renderer contract and report:

```text
EXPORT_TEMPLATE_BINARY_ASSET = MISSING_LOCAL | AVAILABLE
```

If missing, leave exact binary-template integration for the final execution round after assets are placed locally; do not substitute a generic template.

Expected local tests should cover data mapping for:
- Staff/Chief 70/30
- Assistant Manager 60/40
- Manager/GM-family 50/50
- 4 objectives
- 10 objectives
- Thai/English text
- current vs historical snapshot
- employee-self vs authorized approver vs HR export authorization

---

# GATE 3 — LEGACY 8-APP MIGRATION -> APP794

Legacy apps remain permanently READ ONLY:

```text
283, 305, 307, 310, 640, 643, 715, 716
```

Do not call them in this local round.

Implement/finalize local migration pipeline using injected/exported records:

```text
inventory
-> map source app/profile/FY/employee
-> normalize
-> group logical MBO records
-> detect duplicate FY/Employee
-> merge deterministically
-> validate target candidate
-> preserve provenance
-> produce dry-run manifest
```

Required provenance:
- source app
- source record id
- source revision when available
- source fiscal year
- migration batch id
- migration time placeholder/contract
- verification status
- attachment provenance

Rules:
- never silently discard attachments
- unexplained data loss = 0
- legacy originals never modified/deleted
- historical records become read-only historical MBO context after migration
- historical Hoshin: preserve source if present; otherwise `SOURCE_NOT_AVAILABLE`
- do not resolve present-day Hoshin backwards

Prepare reconciliation counters:

```text
SOURCE_RECORDS
LOGICAL_MBO_GROUPS
SUCCESS
MERGED
SKIPPED_EXPLAINED
FAILED
UNEXPLAINED_DATA_LOSS
TARGET_EXPECTED_COUNT
```

Expected local gate:

```text
LEGACY_MIGRATION_DRY_RUN_ENGINE = PASS
UNEXPLAINED_DATA_LOSS = 0 on deterministic fixtures
```

---

# APP796 — KEEP READY FOR FINAL REPAIR ROUND

Round 1 timezone fix passed. Do not touch App796 business data.

Preserve existing DGM repair workflow for later authorized execution:

```text
A restore PROF_DGM v1.0.0 Expected_Appraiser_Count 1 -> 2
B verify historical hash
C create PROF_DGM::v1.1.0 Count=1 VALIDATED
D triple-hash
E atomic old PUBLISHED->SUPERSEDED + new VALIDATED->PUBLISHED
F exactly one current DGM PUBLISHED
```

No Kintone execution now.

---

# CORE INTEGRATION TESTS

Add/adjust tests for the real integrated annual path, using pure/injected adapters only:

```text
Employee
-> identity binding
-> routing resolution
-> scoring profile/config resolution
-> Hoshin resolution/snapshot
-> annual record candidate
-> objectives validation
-> copy previous candidate
-> export projection
-> HR dashboard projection
```

Must preserve:
- M1_G1 current routes
- M1_ONLY executive direct DGM/GM/VP -> President
- TMG1/TMG2 exact Team matching
- TMT3 fail closed
- Appraiser slots 1–4 architecture
- profile != routing

No live Kintone calls.

---

# CODE QUALITY / CHANGE RULES

- Reuse existing modules first.
- New files only for clear separation of concerns.
- Do not duplicate business rules across UI/services/export/migration.
- Prefer pure domain/service functions with injected repositories/adapters.
- Do not rewrite working frozen core unnecessarily.
- Do not update stale docs broadly.
- Do not add dead placeholder code merely to claim a gate.
- No browser runtime test this round.

---

# HARD BOUNDARIES

```text
KINTONE_CALLS = 0
KINTONE_WRITES = 0
KINTONE_DEPLOYS = 0
BROWSER_SMOKE = 0
REAL_USER_ACTION = 0
REAL_NOTIFICATION = 0
APP53_WRITE = 0
LEGACY_APP_WRITE = 0
APP794_LIVE_WRITE = 0
APP795_LIVE_WRITE = 0
APP796_LIVE_WRITE = 0
APP797_LIVE_WRITE = 0
APP800_LIVE_WRITE = 0
APP801_LIVE_WRITE = 0
UI_V2_REDESIGN = 0
DGM_REPAIR_EXECUTION = 0
```

---

# EXECUTION PLAN — ONE ANTIGRAVITY ROUND

1. Confirm branch and pull latest.
2. Read this task only after confirmed baseline/project docs per repository governance.
3. Inspect existing source only for the features in this task; do not broad-discover Kintone.
4. Fix the three Round 1 security defects first.
5. Implement bundled local closures Gate 6 -> Gate 7 -> Gate 5 -> Gate 4 -> Gate 2 -> Gate 3, reusing existing architecture.
6. Add focused tests during implementation but do not repeatedly run the full suite.
7. Run targeted tests once near completion.
8. Run `npm test` ONCE after all source changes.
9. Run `npm run ui:build` ONCE only if App794/UI source changed.
10. Confirm no Kintone/browser/network execution.
11. Commit and push one coherent implementation commit (or minimal logically necessary commits; avoid micro-commit churn).
12. STOP for ChatGPT review.

# REQUIRED RETURN

Return only:

```text
STATUS: READY FOR CHATGPT REVIEW
START_HEAD:
END_HEAD:
FILES_CHANGED:

ROUND1_SECURITY_FIXES:
  HR_APPROVER_AUTHORIZATION:
  TECH_ADMIN_ISOLATION:
  PASSWORD_MAX_AGE_CONFIG:

GATE1_KINTONE_IDENTITY_DATA_ISOLATION:
MBO_SECONDARY_PASSWORD_SECURE_BACKEND:
GATE2_EXPORT_LOCAL:
EXPORT_TEMPLATE_BINARY_ASSET:
GATE3_MIGRATION_DRY_RUN:
GATE4_HR_DASHBOARD_LOCAL:
PHASE_CALENDAR_LOCAL:
GATE5_COPY_PREVIOUS_LOCAL:
GATE6_PREVIEW_APP794_PARITY_LOCAL:
GATE7_HOSHIN_INTEGRATION_LOCAL:
CORE_794_795_796_INTEGRATION_LOCAL:

TARGETED_TESTS:
NPM_TEST:
UI_BUILD:
KINTONE_CALLS: 0
KINTONE_WRITES: 0
KINTONE_DEPLOYS: 0
BROWSER_SMOKE: 0
BLOCKERS:
```

Then STOP.
