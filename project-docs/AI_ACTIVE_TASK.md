# AI ACTIVE TASK — ADMIN SUPPORT CENTER LOCAL IMPLEMENTATION

> Control Plane: ChatGPT
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Starting implementation HEAD: `b2f0a5647e1436e16ec65550ae069fac2ed0be6f`
> Mode: **LOCAL IMPLEMENTATION / NO KINTONE / NO DEPLOY**
> Kintone authorization: **NONE**

## CONFIRMED ENTRY STATE

Read `project-docs/CONFIRMED_BASELINE/` first.

Confirmed facts for this package:

```text
APP794_LOCAL_UI_CLOSURE = PASS
FINAL_LOCAL_VISUAL_REGRESSION_GATE = PASS
UI_FROZEN = YES
ADMIN_FORM_KINTONE_USER = YES
ADMIN_FORM_ROLE = TECHNICAL_ADMIN_ONLY
ADMIN_FORM_BUSINESS_AUTHORITY = NONE
PROCESS_STATES = 16
PROCESS_ACTIONS = 28
FINAL_KINTONE_EXECUTION_READINESS = BLOCKED
```

`admin-form` is a real Kintone user account. It may receive dedicated technical diagnostic capability, but must never gain normal business workflow authority.

Do not redesign or refactor the already accepted Employee/Appraiser/HR UI.

## OBJECTIVE

Implement the first safe local version of **Admin Support Center** for Kintone user `admin-form`.

This package is for supportability and troubleshooting only.

The Admin Support Center must make it easy to answer:

1. What is wrong?
2. Where is the failure?
3. What authoritative source/config produced the current value?
4. What is the fail-closed reason?
5. What should a technical administrator inspect next?

The first implementation MUST remain read-only.

Do NOT implement real repair/write operations in this package.

## ACCESS BOUNDARY

Production-intended gate:

```javascript
kintone.getLoginUser().code === 'admin-form'
```

Use the existing identity abstraction where practical; do not duplicate identity logic unnecessarily.

Expected behavior:

```text
admin-form             -> Admin Support Center available
Employee               -> not available
Appraiser              -> not available
HR                     -> not available unless separately authorized later
ambiguous/restricted   -> not available
```

Do not use `Employee_Code`, workflow status, position, or route membership to grant technical-admin access.

## UI STRUCTURE

Create a clearly separated technical-admin surface titled approximately:

```text
Admin Support Center
ศูนย์ตรวจสอบระบบสำหรับผู้ดูแล
TECHNICAL ADMIN / READ-ONLY DIAGNOSTICS
```

Prefer 3 conceptual tabs/sections:

```text
1. System Health
2. Record Diagnostic
3. Controlled Repair
```

For this package:

```text
System Health = IMPLEMENT
Record Diagnostic = IMPLEMENT
Controlled Repair = PLACEHOLDER / DISABLED ONLY
```

The disabled Controlled Repair area must clearly state that repair requires a separate authorized maintenance package.

Do not expose any active write/repair button.

## A. SYSTEM HEALTH

Provide a compact health summary that can classify each diagnostic item as:

```text
PASS
WARNING
ERROR
BLOCKED
NOT_AVAILABLE
```

Include where evidence is available locally/runtime:

```text
Identity resolution
Requester mapping
Routing resolution
Current Active Appraiser slot
Evaluation Profile resolution
Objective_Count / objective completeness
Scoring completeness
Phase calendar/config resolution
Workflow status/current actor
Viewer/privacy resolution
App800 config state
App801 auth-contract state (masked/status only)
Attachment mapping state
Schema/field expectation state where safely detectable
Bundle/source version identifier
Overall health summary
```

The summary should expose human-readable reason text rather than only raw booleans.

Example style only; do not hardcode fake production truth:

```text
Routing: ERROR — exact TMG route not resolved
Active Appraiser: PASS — 2nd Appraiser
Scoring: WARNING — Part B incomplete
```

## B. RECORD DIAGNOSTIC

Provide a structured read-only diagnostic view for the current App794 record when enough data is available.

Include, where supported:

```text
Record ID
MBO Key
Fiscal Year
Employee Code / employee identity inputs
Requester_User
Logged-in Kintone user code
Current Process Status
Current workflow actor
Resolved Active Appraiser slot
1st Appraiser
2nd Appraiser
3rd Appraiser
4th Appraiser
Expected Appraiser Count
Routing Key
Section / Team routing inputs
Route resolution result
Route fail-closed reason
Evaluation Profile
Part A weight
Part B weight
Objective_Count
Objective completeness
Rating/completion state
App800 phase/config resolution status
Viewer role / privacy resolver result
Validation errors
Workflow/audit diagnostic source status
Build/source version
```

Do not fabricate missing values. Render clear `NOT AVAILABLE`, `PENDING DESIGN`, or fail-closed reason where appropriate.

## C. DIAGNOSTIC SNAPSHOT

Implement a safe **Generate Diagnostic Snapshot** capability for local/support use.

The snapshot should be copyable text or downloadable local JSON/text only if this fits the existing project architecture without unnecessary new dependency.

Prefer a simple deterministic plain object/string output.

It may contain:

```text
record identity
employee/requester identity inputs
workflow status/current actor
routing inputs/results
appraiser slots
active appraiser slot
evaluation profile
objective count/completeness
scoring completion summary
phase/config status
privacy/viewer result
validation/fail-closed errors
bundle/source version
```

It MUST NOT contain:

```text
Password_Hash
password
secret
token
session cookie
authorization header
raw credential material
```

Do not dump the entire Kintone record blindly.

## D. CONTROLLED REPAIR — DISABLED CONTRACT ONLY

Show a disabled/placeholder area describing the future guarded maintenance workflow:

```text
Reason / Ticket
Backup
Pre-check
Exact Diff Preview
Explicit Confirmation
Execute One Repair
Read-back Verification
Audit Log
Rollback Information
```

But for this task:

```text
REPAIR_WRITE_IMPLEMENTED = NO
KINTONE_WRITE = 0
WORKFLOW_ACTION = 0
SCHEMA_CHANGE = 0
PROCESS_CHANGE = 0
ACL_CHANGE = 0
```

## STRICTLY FORBIDDEN BUSINESS ACTIONS

`admin-form` must not receive these capabilities:

```text
Submit MBO
Approve Objective
Return Objective
Approve Mid-Year
Return Mid-Year
Score as Appraiser
Complete HR Final
Return HR Final
Act as Requester
Act as Appraiser
Act as HR
Change Workflow Status
Impersonate another business user
```

If an existing UI component exposes one of these actions while Admin Support Center is active, ensure the technical admin surface does not make that action available through the new feature.

Do not broaden Kintone native permissions in this package.

## SECRET / PRIVACY RULES

Least privilege applies.

- Never display password hashes or credential secrets.
- Never dump App801 credential records into browser diagnostics.
- Show only auth-contract/config health needed for troubleshooting.
- Do not expose more Employee/Appraiser/HR confidential data than needed to diagnose routing/workflow/configuration.
- Prefer IDs/codes/status/reason over free-text confidential evaluation comments.
- Diagnostic snapshot must be explicitly sanitized.

## SOURCE STRUCTURE

Keep modular production-source rules.

Prefer a small number of clearly owned modules such as:

```text
src/admin/admin-support-center.js
src/admin/admin-diagnostic-model.js
```

Exact filenames may vary if an existing module is a better fit.

Do NOT create many micro-files.
Do NOT move or refactor unrelated Employee/Appraiser/HR rendering.
Do NOT perform R2 route/timeline refactor.

`src/` remains source of truth.
Production delivery remains the built bundle.

## PREVIEW / LOCAL TESTABILITY

Provide a local Preview path/fixture for Admin Support Center that does not require a real Kintone call.

The Preview must allow inspection of at least:

```text
healthy record
routing fail-closed record
incomplete scoring record
missing config/not-available record
```

Synthetic fixture data must be visibly Preview/local only and must never leak into production runtime.

## TEST REQUIREMENTS

Add focused tests for at least:

```text
admin-form access allowed
non-admin access denied
Employee_Code cannot grant admin access
workflow status cannot grant admin access
technical admin surface exposes no business action capability
active appraiser diagnostic follows resolved current slot
routing fail-closed reason rendered/modeled
missing data remains NOT_AVAILABLE rather than fabricated
snapshot sanitizes Password_Hash/password/secret/token fields
snapshot does not blindly serialize full record
Controlled Repair remains disabled
```

Run targeted tests and full `npm test`.
Run build if required by the repository's normal bundle workflow.

Do not claim PASS if test/build evidence is unavailable.

## NO KINTONE BOUNDARY

```text
KINTONE_GET = 0
KINTONE_WRITE = 0
KINTONE_DEPLOY = 0
APP53_CALL = 0
APP794_CALL = 0
APP795_CALL = 0
APP796_CALL = 0
APP797_CALL = 0
APP800_CALL = 0
APP801_CALL = 0
```

No Kintone browser smoke in this package.
No schema/process/ACL/customization write.

## DOCUMENTATION

After implementation/tests, update only the necessary living docs:

```text
project-docs/AI_REVIEW_PACKAGE.md
project-docs/CURRENT_STATE.md
project-docs/HANDOFF.md
```

Do not modify `CONFIRMED_BASELINE` unless a new fact is explicitly user-confirmed and separately reviewed.

## REQUIRED FINAL REPORT

Return exactly enough evidence for independent review:

```text
IMPLEMENTATION_HEAD = <sha>
SOURCE_CHANGED_FILES = <exact list>
TEST_CHANGED_FILES = <exact list>
PREVIEW_CHANGED_FILES = <exact list>
DIST_CHANGED_FILES = <exact list or NONE>

ADMIN_FORM_KINTONE_USER_GATE = PASS|FAIL
NON_ADMIN_ACCESS_DENIED = PASS|FAIL
ADMIN_FORM_BUSINESS_AUTHORITY = NONE|CONFLICT
SYSTEM_HEALTH = PASS|FAIL
RECORD_DIAGNOSTIC = PASS|FAIL
DIAGNOSTIC_SNAPSHOT = PASS|FAIL
SNAPSHOT_SECRET_SANITIZATION = PASS|FAIL
ACTIVE_APPRAISER_DIAGNOSTIC = PASS|FAIL
ROUTING_FAIL_CLOSED_DIAGNOSTIC = PASS|FAIL
CONTROLLED_REPAIR = DISABLED|FAIL

TARGETED_TESTS = <result>
NPM_TEST = <result>
BUILD = <result>

KINTONE_CALLS = 0
KINTONE_WRITES = 0
KINTONE_DEPLOYS = 0

APP794_EMPLOYEE_APPRAISER_HR_UI_CHANGED = NO|YES
FINAL_KINTONE_EXECUTION_READINESS = BLOCKED
REMAINING_BLOCKERS = <exact list>
```

Commit implementation + tests + required docs, push once, then STOP for ChatGPT review.
