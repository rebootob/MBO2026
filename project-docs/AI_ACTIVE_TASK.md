# AI ACTIVE TASK — ADMIN SUPPORT CENTER DIAGNOSTIC HARDENING

> Control Plane: ChatGPT
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Starting review HEAD: `0fcda0d4a6f4386ee39594bf4720f630b0e4b4c0`
> Mode: **LOCAL MICRO-FIX / ADMIN SUPPORT CENTER ONLY / NO KINTONE / NO DEPLOY**
> Kintone authorization: **NONE**

## REVIEW RESULT BEFORE THIS TASK

Read `project-docs/CONFIRMED_BASELINE/` first.

Independent ChatGPT review found the Admin Support Center implementation direction useful, but it is **NOT yet accepted as final PASS**.

Confirmed business boundary:

```text
ADMIN_FORM_KINTONE_USER = admin-form
ADMIN_FORM_ROLE = TECHNICAL_ADMIN_ONLY
ADMIN_FORM_BUSINESS_AUTHORITY = NONE
PROCESS_STATES = 16
PROCESS_ACTIONS = 28
APP795 = AUTHORITATIVE ROUTING MASTER
EVALUATION_PROFILE_AND_ROUTING = SEPARATE CONCERNS
```

Do not change Employee/Appraiser/HR accepted UI behavior.

## OBJECTIVE

Harden Admin Support Center so `admin-form` can reliably diagnose three critical questions for every MBO record:

1. **WORKFLOW TRACE** — Is the workflow running through the correct states/actors/active appraiser slot for the resolved topology?
2. **EVALUATION PROFILE** — Is the record assigned the correct evaluation profile/Part A:Part B ratio for the employee classification?
3. **ROUTE ASSIGNMENT** — Is the record assigned the correct Routing Key / topology / 1st..4th Appraisers for this employee/record?

The panel must distinguish **EXPECTED** vs **ACTUAL** vs **NOT EVIDENCED**. Never fabricate PASS from defaults.

## P0 SECURITY FIX — EXACT ADMIN IDENTITY

Current code incorrectly allows `administrator` in addition to `admin-form`.

Fix production-intended access gate to exactly:

```javascript
normalize(kintoneLoginUserCode) === 'admin-form'
```

Case/outer whitespace normalization is acceptable if consistent, but NO second alias/user may be granted access.

Required:

```text
admin-form = ALLOW
ADMIN-FORM = ALLOW if normalization retained
administrator = DENY
hr = DENY
Employee_Code=admin-form with different login = DENY
workflow status cannot elevate access
```

## P0 DIAGNOSTIC TRUTH — REMOVE FABRICATED DEFAULTS

Current diagnostic model contains unsafe/misleading defaults such as:

```text
expectedAppraiserCount = 2
routingResult = PASS/M1_G1
profileCode = PROF_STAFF_CHIEF
Part A/B = 70/30
App800 status = PASS
schema state = PASS
fallback fiscal year / other inferred values presented as truth
```

Remove any default that can make unknown production data appear valid.

Missing evidence must render one of:

```text
NOT_AVAILABLE
NOT_EVIDENCED
PENDING_DESIGN
ERROR / FAIL_CLOSED
```

Only return PASS when supplied runtime/repository evidence proves it.

## A. WORKFLOW TRACE / WORKFLOW ROUTE VALIDATION

Add a dedicated read-only section/card/table named approximately:

```text
Workflow Trace / Workflow Route Validation
การตรวจสอบเส้นทาง Workflow
```

Purpose: let `admin-form` quickly detect whether workflow is running incorrectly.

### A1. Expected Path

Use confirmed topology semantics to show the **expected path** for the resolved topology where supported.

Examples:

```text
M1_ONLY
01 -> 03 -> 05 -> 06 -> 08 -> 10 -> 11 -> 13 -> 15 -> 16

M1_G1
01 -> 03 -> 04 -> 05 -> 06 -> 08 -> 09 -> 10 -> 11 -> 13 -> 14 -> 15 -> 16
```

Do not invent support for future topology if runtime semantics are not confirmed.

### A2. Current Workflow Consistency

For current record show:

```text
Current Status
Resolved Topology
Expected Current Actor Type/Slot
Actual Current Actor/assignee evidence when supplied
Expected Active Appraiser Slot
Actual Active Appraiser Slot
Consistency = PASS / ERROR / NOT_EVIDENCED
Reason
```

Detect at minimum:

```text
M1_G1 record enters First-Manager state 02/07/12 -> ERROR / FAIL_CLOSED
M1_ONLY record enters GM state 04/09/14 -> ERROR / FAIL_CLOSED
Active appraiser slot inconsistent with current appraiser workflow state -> ERROR
Current status unknown/unmapped -> ERROR / FAIL_CLOSED
Required appraiser missing for current slot -> ERROR
```

### A3. Workflow Log / Actual History Boundary

Important: do NOT fabricate a production workflow action log.

Current project baseline has production audit persistence/source still pending design. Therefore distinguish:

```text
EXPECTED_WORKFLOW_PATH = available from confirmed process/topology
CURRENT_STATE_VALIDATION = available from current record/runtime context
ACTUAL_TRANSITION_HISTORY = only available if a real audited source is supplied
```

If no real production audit source exists, display:

```text
ACTUAL_WORKFLOW_HISTORY = PENDING_AUDIT_DESIGN / NOT_AVAILABLE
```

Never synthesize transition timestamps/history from:

```text
Updated_datetime
current status
Date.now()
Preview fixture timestamps
```

Preview may use deterministic synthetic history only when explicitly labeled `PREVIEW FIXTURE / NOT PRODUCTION AUDIT`.

## B. EVALUATION PROFILE VALIDATION

Add explicit **Expected vs Actual Evaluation Profile** diagnostic.

Evaluation Profile is NOT routing.

Show where evidence exists:

```text
Employee Position / classification input
Expected Profile Code
Actual Record Profile Code
Expected Part A Weight
Actual Part A Weight
Expected Part B Weight
Actual Part B Weight
Expected Appraiser Count if profile contract defines it
Profile Source / App796 config identity/version where available
PROFILE_MATCH = PASS / ERROR / NOT_EVIDENCED
Mismatch reason
```

Use confirmed evaluation class baseline:

```text
Staff/Chief = 70/30
Japanese Staff = 70/30
Assistant Manager = 60/40
Section Manager = 50/50
Senior Manager = 50/50
DGM/GM/VP = 50/50
```

Do NOT assign `PROF_STAFF_CHIEF` merely because profile evidence is missing.

If position/profile mapping evidence is unavailable, return `NOT_EVIDENCED`, not PASS.

## C. ROUTE ASSIGNMENT VALIDATION

Add explicit **Expected vs Actual Route Assignment** diagnostic for each record/employee.

Production route validation must use authoritative routing semantics, NOT Preview `Route Scenario` labels as truth.

Show where evidence exists:

```text
Employee Code
Position
Section
Team
Expected Routing Key
Actual/Stored Routing Key
Expected Topology
Actual/Stored Topology
Expected Appraiser Count
Actual Appraiser Count
Expected 1st Appraiser
Actual 1st Appraiser
Expected 2nd Appraiser
Actual 2nd Appraiser
Expected 3rd Appraiser
Actual 3rd Appraiser
Expected 4th Appraiser
Actual 4th Appraiser
ROUTE_MATCH = PASS / ERROR / NOT_EVIDENCED
Reason
Authoritative Source = App53 inputs + App795 route result
```

Confirmed routing rules:

```text
Non-TMG -> Routing_Key = Section_Code
TMG1/TMG2 -> Routing_Key = Section_Code + "|" + Team
TMG missing Team / missing exact row / duplicate row -> FAIL CLOSED
TMG must never fall back to Section-only
DGM/GM/VP -> dedicated POSITION_DGM / POSITION_GM / POSITION_VP direct-President single-appraiser route where confirmed
```

For route/appraiser identity comparison normalize Kintone user codes safely and compare exact slot sequence. Never infer organization title from ordinal slot.

### Route Scenario terminology

`CURRENT_STANDARD`, `EXTENDED`, `EXECUTIVE_DIRECT`, `FUTURE_CAPACITY` are Preview/business presentation scenarios. They must NOT be treated as authoritative Production assignment IDs unless separately persisted/reviewed.

Admin production diagnostics should prioritize:

```text
Routing_Key
Routing_Topology
Expected_Appraiser_Count
1st..4th resolved Kintone user codes
App795 source/result
```

Preview may show Route Scenario as secondary display context only, clearly marked Preview.

## D. DIAGNOSTIC SNAPSHOT HARDENING

Current generic recursive serializer is too permissive.

Change diagnostic snapshot to an **explicit allowlist contract**. Snapshot must contain only approved diagnostic fields/sections.

Never blindly clone arbitrary input or entire Kintone record.

Keep recursive redaction as defense-in-depth, but allowlisting is primary.

Exclude:

```text
Password_Hash
password
secret
token
cookie
authorization header
raw credential objects
free-text confidential evaluation comments unless explicitly required later
```

Include new sanitized summaries:

```text
workflowValidation
workflowHistorySourceStatus
profileValidation
routeValidation
healthSummary
recordIdentity
buildVersion
validationErrors
```

## E. HTML OUTPUT SAFETY

All record/config/user-derived strings rendered into Admin Support Center HTML must be escaped before interpolation.

Add a minimal shared/local HTML escaping helper; do not add dependencies.

Test payloads containing `<script>`, `<img onerror=...>`, `&`, quotes must render as escaped text, never executable markup.

## F. UI / INFORMATION ARCHITECTURE

Keep existing Admin Support Center, but make troubleshooting immediately readable.

Recommended sections/tabs:

```text
1. System Health
2. Record Diagnostic
3. Workflow / Route / Profile Validation
4. Controlled Repair — DISABLED
```

Within validation section, show three compact blocks:

```text
Workflow Trace
Evaluation Profile Check
Route Assignment Check
```

Use Expected / Actual / Result / Reason columns where practical.

Do not redesign Employee/Appraiser/HR screens.

## G. CONTROLLED REPAIR BOUNDARY

Still disabled.

```text
REPAIR_WRITE_IMPLEMENTED = NO
KINTONE_WRITE = 0
WORKFLOW_ACTION = 0
IMPERSONATION = 0
```

No Approve/Return/Submit/Complete/Score/Change Status capability.

## TEST REQUIREMENTS

Add/update focused tests proving at minimum:

```text
1. exact admin-form identity gate; administrator denied
2. no Employee_Code/status elevation
3. missing route/profile/App800/schema evidence never defaults to PASS
4. M1_G1 in First-Manager state fails diagnostic
5. M1_ONLY in GM state fails diagnostic
6. active appraiser slot follows current workflow and mismatch is detected
7. unknown workflow status fails closed
8. expected vs actual profile match PASS
9. profile mismatch ERROR
10. missing profile evidence NOT_EVIDENCED
11. expected vs actual routing match PASS
12. wrong Routing_Key ERROR
13. wrong appraiser user in any ordinal slot ERROR
14. wrong appraiser count ERROR
15. TMG exact-team missing route FAIL_CLOSED
16. Preview Route Scenario is not used as Production routing authority
17. actual workflow history absent => PENDING_AUDIT_DESIGN/NOT_AVAILABLE, not synthetic history
18. snapshot uses allowlist and cannot dump arbitrary record/secrets
19. HTML dynamic content escaped
20. Controlled Repair remains disabled / zero business authority
```

Run targeted tests, full `npm test`, and build.

## HARD BOUNDARY

```text
KINTONE_GET = 0
KINTONE_WRITE = 0
KINTONE_DEPLOY = 0
SCHEMA_CHANGE = 0
PROCESS_CHANGE = 0
ACL_CHANGE = 0
EMPLOYEE_APPRAISER_HR_UI_REDESIGN = 0
```

Allowed implementation scope:

```text
src/admin/**
minimal existing integration wiring only if required
preview/** only for local Admin fixture/visibility
admin-focused tests
built dist bundle via normal build
living review docs
```

Do not modify Confirmed Baseline.

## REQUIRED FINAL REPORT

Return:

```text
IMPLEMENTATION_HEAD = <sha>
ADMIN_FORM_EXACT_ID_GATE = PASS|FAIL
FABRICATED_DIAGNOSTIC_DEFAULTS_REMOVED = PASS|FAIL
WORKFLOW_TRACE_VALIDATION = PASS|FAIL
ACTUAL_WORKFLOW_HISTORY_BOUNDARY = PASS|FAIL
EVALUATION_PROFILE_VALIDATION = PASS|FAIL
ROUTE_ASSIGNMENT_VALIDATION = PASS|FAIL
ACTIVE_APPRAISER_WORKFLOW_CONSISTENCY = PASS|FAIL
SNAPSHOT_ALLOWLIST = PASS|FAIL
HTML_OUTPUT_ESCAPING = PASS|FAIL
CONTROLLED_REPAIR = DISABLED|FAIL
ADMIN_FORM_BUSINESS_AUTHORITY = NONE|CONFLICT
APP794_EMPLOYEE_APPRAISER_HR_UI_CHANGED = NO|YES
TARGETED_TESTS = <result>
NPM_TEST = <result>
BUILD = <result>
KINTONE_CALLS = 0
KINTONE_WRITES = 0
KINTONE_DEPLOYS = 0
DEFECTS_REMAINING = <exact list or NONE>
FINAL_KINTONE_EXECUTION_READINESS = BLOCKED
```

Commit and push once, then STOP for ChatGPT review.
