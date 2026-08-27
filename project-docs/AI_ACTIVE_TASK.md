# AI ACTIVE TASK — ADMIN SUPPORT CENTER FINAL CLOSURE PACKAGE

> Control Plane: ChatGPT
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Starting implementation HEAD: `2765d272ae6e11909fc654fa7b72d4a35647c60b`
> Mode: **FINAL LOCAL CLOSURE / ADMIN SUPPORT CENTER + REQUIRED SHARED LOGIC ONLY / NO KINTONE EXECUTION / NO DEPLOY**
> Kintone write/deploy authorization: **NONE**

## 0. MANDATORY ENTRY RULE

Read ALL files under `project-docs/CONFIRMED_BASELINE/` before changing source.

Baseline wins over source, tests, Preview fixtures, old docs, and previous task wording.

Do not modify `CONFIRMED_BASELINE` in this package.

Confirmed boundaries that MUST remain true:

```text
ADMIN_FORM_KINTONE_USER = admin-form
ADMIN_FORM_ROLE = TECHNICAL_ADMIN_ONLY
ADMIN_FORM_BUSINESS_AUTHORITY = NONE
APP53 = AUTHORITATIVE EMPLOYEE MASTER INPUT
APP795 = AUTHORITATIVE ROUTING MASTER
APP796 = AUTHORITATIVE PUBLISHED SCORING/PROFILE CONFIG
APP794 = MBO RECORD / SNAPSHOT / PROCESS STATE
PROCESS_STATES = 16
PROCESS_ACTIONS = 28
CURRENT_ACTIVE_STANDARD_ROUTE = M1_G1
EXECUTIVE_DIRECT_ROUTE = M1_ONLY
PROFILE_AND_ROUTING = SEPARATE CONCERNS
CONFIRM_REPAIR = DISABLED
KINTONE_DEPLOY = 0
```

This task is intentionally larger than a micro-fix. Fix the Admin Support Center chain end-to-end locally so the next independent review is not forced into another sequence of tiny patches.

---

# 1. INDEPENDENT REVIEW FINDINGS TO FIX

The current direction is useful, but **Admin Support Center is NOT closed yet**.

Deep review of current source found the following defects / incomplete contracts.

## P0-A — `admin-form` business authorization leak in RoutingService

Current `RoutingService.validateRequesterAccess()` allows:

```javascript
cleanUser === 'Administrator' || cleanUser === 'admin-form'
```

This conflicts directly with the confirmed baseline:

```text
ADMIN_FORM_BUSINESS_AUTHORITY = NONE
```

`admin-form` may inspect routing but MUST NOT gain requester/create/approve/return/score/complete authority.

### Required fix

Separate **route resolution** from **business requester authorization**.

Preferred minimal architecture:

```text
resolveRoutingProfile(...)          -> read-only route resolution from App795
assertRequesterAuthorized(...)      -> business authorization
validateRequesterAccess(...)        -> composition for normal employee create flow
```

Exact naming may vary, but responsibilities MUST be separated.

Rules:

```text
admin-form may call/read route-resolution logic for diagnostics
admin-form MUST fail business requester authorization
Administrator alias MUST NOT be silently treated as admin-form
business requester authorization must come from Requester_User baseline only
no technical-admin bypass
```

Do not hard-code `President` user code.

Add security regression tests proving:

```text
admin-form route inspection = allowed through diagnostic/read-only resolver
admin-form business requester authorization = denied
administrator business requester bypass = denied unless independently baseline-authorized (currently it is not)
normal Requester_User member = allowed
non-member = denied
```

---

## P0-B — Employee Check UI is not a real employee-centric CHECK workflow yet

`src/admin/admin-support-center.js` renders:

```text
Employee Code
Fiscal Year
[CHECK EMPLOYEE]
```

but the component is currently render-only. There is no owned controller/event contract that turns a typed employee code into a new diagnostic evidence bundle.

This means the screen can look functional while only displaying the already supplied current-record context.

### Required fix

Implement a real Admin Support Center interaction/controller contract without contacting Kintone during this task.

Required local architecture:

```text
AdminSupportCenterUI
  -> bindEvents()/mount() or equivalent
  -> CHECK EMPLOYEE callback
  -> async diagnostic provider callback/repository
  -> returns evidence bundle
  -> re-renders selected Employee_Code + Fiscal Year results
```

Use dependency injection so tests can use deterministic fake providers.

Production-intended provider contract MAY be wired to existing read-only services but MUST NOT execute a real Kintone call in this task.

Suggested evidence bundle:

```text
employeeSnapshot            // App53-derived, verified
mboRecordSnapshot           // App794 Employee_Code + Fiscal Year exact record
routingExpectation          // App795 resolved authoritative route
profileExpectation          // shared profile policy + App796 published config
workflowCurrentState        // App794 current Process status
workflowAuditHistory        // real audit source only; otherwise explicit unavailable status
phaseConfigEvidence         // App800 only when actually supplied
sourceVersions / identifiers
```

CHECK must be independent from employee edit/create behavior.

**Do not mutate the current App794 record when admin checks another employee.**
Do not call `onEmployeeCodeChanged` from Admin Support Center.
Do not use employee business lookup as an implicit write path.

### UI behavior

```text
blank Employee Code -> validation error, no lookup
blank/invalid Fiscal Year -> validation error, no lookup
loading state -> visible
not found -> NOT_FOUND / NOT_EVIDENCED
multiple App794 annual records -> ERROR / AMBIGUOUS_RECORD
provider failure -> ERROR / fail closed
successful evidence -> re-render all diagnostic sections
```

`NOT_EVIDENCED` must NOT appear as an editable input value; use blank input + placeholder/status text.

---

## P0-C — Profile diagnostic duplicates and weakens the authoritative runtime profile resolver

Current `AdminDiagnosticModel.evaluateProfileMatch()` contains its own small hard-coded `positionMap`.

The repository already has `src/profiles/profile-scoring-resolver.js` with a broader frozen normalized-title policy and `resolveProfileCode()` using verified employee snapshot semantics.

Duplicating profile policy in Admin diagnostics will drift and can produce a different answer from runtime.

### Required fix

Admin diagnostics MUST use the same canonical profile-resolution policy as production runtime.

Prefer reuse of existing `normalizeTitle()` / `resolveProfileCode()` or extract one shared pure policy module if required to avoid coupling.

Do NOT maintain a second independent position->profile map in `src/admin`.

Respect baseline evidence semantics:

```text
verified employee snapshot required
invalid/blank/unknown classification -> fail closed / NOT_EVIDENCED
profile code must not be guessed merely to get coverage
```

If historical membership / promotion conflict evidence is not available to this local diagnostic provider, state that limitation explicitly; do not invent a historical decision.

---

## P0-D — authoritativeProfile content validation is still too permissive

Current logic permits missing `PartA_Weight` / `PartB_Weight` inside `authoritativeProfile` because undefined weights can be treated as matching.

For a record repair candidate, authoritative App796 evidence must be complete enough to prove the intended profile snapshot.

### Required fix

For `PROFILE_MASTER_EVIDENCED = true`, require exact complete evidence:

```text
Profile_Code
PartA_Weight
PartB_Weight
Fiscal_Year if part of provider contract
Config_Status = PUBLISHED when supplied from App796
Config identity/version/hash where available
```

At minimum, code + both weights are mandatory for repair authorization.

Rules:

```text
missing code -> NOT_EVIDENCED
missing PartA -> NOT_EVIDENCED
missing PartB -> NOT_EVIDENCED
wrong code -> ERROR / MASTER_CONFLICT
wrong weights -> ERROR / MASTER_CONFLICT
complete expected code+weights -> EVIDENCED
```

A malformed/incomplete object MUST NOT authorize `FIX_THIS_RECORD`.

---

## P0-E — authoritativeRoute completeness is still too permissive for normal routes

Current non-executive route comparison contains semantics like:

```javascript
!authoritativeRoute.appraiser1 || match
```

Therefore an App795 route object with no appraiser identities can still lead to route PASS if key/topology/count match.

That does NOT answer the user's real support question:

> Employee Code XX is assigned to the correct 1st/2nd/3rd/4th Appraiser or not?

### Required fix

Create one canonical normalized authoritative route contract.

For any route expected count `N`:

```text
Routing_Key required
Routing_Topology required
Expected_Appraiser_Count required and valid 1..4
required ordinal slots 1..N must each contain exactly one resolvable Kintone user code
slots N+1..4 must be empty/not applicable unless topology contract explicitly requires them
```

Full `ROUTE_MATCH = PASS` requires exact comparison of:

```text
Routing_Key
Routing_Topology
Expected_Appraiser_Count
Appraiser 1 user code
Appraiser 2 user code (if required)
Appraiser 3 user code (if required)
Appraiser 4 user code (if required)
```

Missing required authoritative slot => `NOT_EVIDENCED`, never PASS.
Wrong actual slot => `ERROR`, reason must identify exact ordinal mismatch, e.g.:

```text
1ST_APPRAISER_MISMATCH
2ND_APPRAISER_MISMATCH
3RD_APPRAISER_MISMATCH
4TH_APPRAISER_MISMATCH
```

Unexpected extra actual slot beyond expected count => ERROR.

Executive DGM/GM/VP remains:

```text
POSITION_DGM / POSITION_GM / POSITION_VP
M1_ONLY
count = 1
Appraiser 1 exactly equals authoritative App795 configured President destination
```

Do not infer President user from title or hard-code a username.

---

## P0-F — Appraiser ordinal mapping from App794 storage is potentially wrong

Current `buildRecordDiagnostic()` uses fixed fallbacks such as:

```text
appraiser1 <- First_Manager_User
appraiser2 <- GM_User
```

This is incorrect for current `M1_G1`, where the ordinal route is logically:

```text
1st Appraiser = Manager_User
2nd Appraiser = GM_User
```

For `M1_M2_G1`, ordinal mapping is:

```text
1st = First_Manager_User
2nd = Manager_User
3rd = GM_User
```

For `M1_ONLY`:

```text
1st = Manager_User (executive single configured destination in current storage semantics)
```

### Required fix

Add/reuse ONE canonical route-slot normalizer based on `Routing_Topology` and actual route fields.

Do not let Admin Support Center invent its own slot mapping independently from runtime/Preview normalization.

The normalized result should expose:

```text
expectedCount
slots: [
  { slot:1, userCode, sourceField },
  ...
]
```

Use this normalized ordinal representation everywhere in Admin diagnostics, route comparison, workflow active-slot check, snapshot, and repair diff.

Add tests for M1_G1, M1_ONLY, M1_M2_G1, missing slot, and extra slot.

---

## P0-G — Repair diff does not include the actual appraiser assignments

Current route repair candidate includes:

```text
Routing_Key
Routing_Topology
Expected_Appraiser_Count
```

but not Appraiser 1..4.

This is incomplete because the main routing defect can be "wrong person assigned".

### Required fix

For a safe route-only or route+profile `FIX_THIS_RECORD` candidate, exact Before/After must include all changed ordinal appraiser assignments.

Example:

```text
1st_Appraiser: natta -> phubodin
2nd_Appraiser: uchida -> uchida (unchanged; do not list if unchanged)
```

Prefer displaying ordinal business labels while retaining technical source fields in Technical Details.

Only include fields that actually differ.
Do not show an "exact diff" for BLOCKED / NOT_EVIDENCED / NO_REPAIR_NEEDED.

Never include objectives, ratings, comments, HR decisions, password/secret material.

---

## P0-H — Admin Support Center UI can visually misrepresent uncertainty

Current status style map does not explicitly define `INCOMPLETE_EVIDENCE`; fallback styling can resolve to PASS/green.

Also Expected/Actual table cells can render a ✅ simply because two uncertainty strings are equal, e.g. `NOT_EVIDENCED === NOT_EVIDENCED`.

### Required fix

```text
PASS -> green
WARNING -> amber
ERROR -> red
NOT_EVIDENCED / NOT_AVAILABLE / INCOMPLETE_EVIDENCE / PENDING_* -> gray/amber, never green
BLOCKED -> gray
```

Do not calculate cell checkmarks by raw string equality when status is uncertain.

Each row must show semantic status:

```text
MATCH
MISMATCH
NOT_EVIDENCED
NOT_APPLICABLE
```

Color is secondary; text status is mandatory.

---

## P0-I — CHECK / tabs / snapshot interaction must have real event wiring

The AdminSupportCenterUI currently returns HTML only.

Implement event wiring with cleanup to avoid duplicate handlers across re-render.

Required locally testable interactions:

```text
tab switching
CHECK EMPLOYEE
Generate Diagnostic Snapshot
Prepare Repair view/update
```

Snapshot button must actually reveal/copyable sanitized snapshot output.
No inline eval or unsafe HTML.

Do not enable Confirm Repair.

---

## P0-J — Admin identity health check should validate technical-admin identity, not merely any non-empty login

For Admin Support Center health:

```text
loginUserCode = admin-form -> PASS
other login -> ERROR/BLOCKED
missing -> ERROR
```

The feature must never display a healthy admin identity merely because some user code exists.

Exact production gate remains normalized `admin-form` only.

---

## P1-A — Production-intended diagnostic provider must be read-only and independent from business writes

Implement a provider/repository interface locally, using fake transport in tests.

If wiring a production-intended Kintone adapter, it may define GET requests only but **do not execute any Kintone call during this task**.

Intended lookup by `Employee_Code + Fiscal Year`:

```text
1. App53: exact employee source snapshot
2. Shared profile resolver: expected Profile_Code
3. App796: exactly one PUBLISHED config for profile+FY; duplicate/missing fail closed
4. App795: exact route result using position-priority then Section/Team semantics
5. App794: exact annual record for Employee_Code+FY; 0 => NOT_FOUND, >1 => AMBIGUOUS_RECORD
6. current workflow status from App794 record
7. App800 status only if explicitly fetched/provided
```

Provider must NOT:

```text
PUT/POST/DELETE
call kintone.app.record.set
mutate current form
trigger workflow actions
impersonate requester/appraiser/HR
```

Keep Kintone execution count = 0 in this package.

---

## P1-B — `Routing_Key` snapshot/integration must be evidence-complete

Review the actual App794 schema/source usage before assuming a stored `Routing_Key` field exists.

Current normal employee lookup resolves `routing.Routing_Key`, but `fieldsToSync` in `main-mbo-app.js` does not visibly persist `Routing_Key` in the reviewed section.

Required:

1. Inspect source/schema evidence already in repository.
2. If App794 physical `Routing_Key` exists and is intended snapshot evidence, wire it consistently without Kintone deployment.
3. If physical field does NOT exist or is unconfirmed, do NOT invent it; Admin diagnostic should distinguish:
   - derived expected Routing Key from App53 inputs
   - actual stored Routing Key = NOT_AVAILABLE
   - current stored topology/appraiser fields
4. Do not require schema change in this local package.
5. Document `PENDING_SCHEMA_REVIEW` if needed.

---

## P1-C — Workflow Trace: do not over-certify future topologies

Confirmed current active App795 routes are `M1_G1`; Executive Direct `M1_ONLY` is separately confirmed sandbox implementation/review status.
First-Manager states exist, but future M2/G2 activation requires separately reviewed routing + compatible Process support/UAT.

Current Admin model contains expected paths for multiple future topology codes.

### Required classification

Do NOT return production-certified workflow PASS for an unreviewed future topology merely because a local array exists.

Use explicit capability classification, e.g.:

```text
M1_G1 -> CURRENT_CONFIRMED
M1_ONLY -> CONFIRMED_EXECUTIVE_DIRECT_CONTEXT
M1_M2_G1 -> FUTURE / NOT_CURRENTLY_CERTIFIED unless evidence says otherwise
M1_G1_G2 -> FUTURE / NOT_CURRENTLY_CERTIFIED
M1_M2_G1_G2 -> FUTURE / NOT_CURRENTLY_CERTIFIED
unknown -> ERROR / FAIL_CLOSED
```

Preview may demonstrate future capacity but production diagnostic must label it non-certified.

---

## P1-D — Workflow actual log / audit tracking remains an explicit blocker, not fake completeness

The user explicitly requires admin-form to track whether workflow actually ran incorrectly.

Current source can validate expected path + current state, but there is no confirmed production action-history persistence source.

Do NOT synthesize history from:

```text
Updated_datetime
current Status
Date.now()
Preview timestamps
```

### Required local closure

Implement a clear audit-source contract in Admin diagnostics:

```text
workflowExpectedPath
workflowCurrentStateValidation
workflowHistorySourceStatus
workflowHistoryEntries[] only from real supplied audit evidence
```

If no real source:

```text
WORKFLOW_ACTUAL_HISTORY = PENDING_AUDIT_DESIGN
```

Add a concise design note in living docs for the future authorized schema package. Preferred minimal candidate may be an App794 append-only `Approval_History` table or another reviewed audit mechanism, but DO NOT choose/implement a Kintone schema write in this task without authorization.

The design note must identify required fields at minimum:

```text
Phase
Action
Appraiser_Slot / Actor_Role_Context
Actor_Kintone_User_Code
Action_At
From_Status
To_Status
Result
Comment/Reason reference if allowed by privacy policy
Correlation/Record identity
```

Admin panel must clearly distinguish:

```text
EXPECTED PATH
CURRENT STATE CHECK
ACTUAL HISTORY (PENDING or EVIDENCED)
```

This is allowed to remain `PENDING_SCHEMA_AUTHORIZATION`; it must NOT block local CHECK/Profile/Route closure, but it DOES block claiming full production workflow-history tracking.

---

## P1-E — Build/version evidence must not be misleading

`BUILD_VERSION_INFO.commitSha` is manually hard-coded to a previous control/task commit.

A diagnostic build identifier must not look like the currently running implementation SHA if it is actually stale.

Required:

- either inject deterministic build metadata through the existing build process,
- or rename semantics to clearly state `controlTaskSha` / `sourceBuildId` and avoid claiming runtime commit identity,
- no external dependency.

Tests must prove it never silently identifies a parent/control commit as the implementation runtime SHA.

---

# 2. TARGET ADMIN SUPPORT CENTER OPERATING FLOW

Final local UX target:

```text
[ Employee Code ] [ Fiscal Year ] [ CHECK ]
                  ↓
          Evidence Collection
                  ↓
┌─────────────────────────────────────────────┐
│ Employee / App53          PASS / ERROR      │
│ Evaluation Profile       PASS / ERROR       │
│ Routing Assignment       PASS / ERROR       │
│ Workflow Current State   PASS / ERROR       │
│ Actual Workflow History  EVIDENCED/PENDING  │
└─────────────────────────────────────────────┘
                  ↓
        Root Cause Classification
                  ↓
[ PREPARE REPAIR ] only if safely evidenced
                  ↓
 Before / After / Source / Impact / Risk
                  ↓
[ CONFIRM REPAIR ] = DISABLED
```

The most important business answer must be obvious:

```text
Employee Code: XXXXX
Fiscal Year: FY2026

Evaluation Profile
Expected: ...
Actual: ...
Result: PASS / MISMATCH / NOT_EVIDENCED
Source: App53 + shared profile policy + App796

Routing
Expected Routing Key: ...
Actual/Stored Routing Key: ... or NOT_AVAILABLE
Expected 1st..4th Appraiser: ...
Actual 1st..4th Appraiser: ...
Result: PASS / MISMATCH / NOT_EVIDENCED
Source: App53 + App795

Workflow
Current Status: ...
Expected current slot/actor: ...
Actual slot/actor: ...
Current State Result: PASS / ERROR
Actual History: EVIDENCED / PENDING_AUDIT_DESIGN
```

---

# 3. REPAIR CLASSIFIER — FINAL REQUIRED SEMANTICS

Allowed root-cause results:

```text
NO_REPAIR_NEEDED
FIX_THIS_RECORD
FIX_EMPLOYEE_MASTER_FIRST
FIX_ROUTING_MASTER_FIRST
FIX_SCORING_PROFILE_MASTER_FIRST
ESCALATE_WORKFLOW_REPAIR
BLOCKED_NOT_ENOUGH_EVIDENCE
```

Rules:

```text
App53 wrong -> FIX_EMPLOYEE_MASTER_FIRST
App53 correct + App795 wrong -> FIX_ROUTING_MASTER_FIRST
App53/profile classification correct + App796 wrong -> FIX_SCORING_PROFILE_MASTER_FIRST
Masters fully evidenced correct + App794 stale -> FIX_THIS_RECORD
workflow inconsistency requiring state/process manipulation -> ESCALATE_WORKFLOW_REPAIR
missing/ambiguous source evidence -> BLOCKED_NOT_ENOUGH_EVIDENCE
all exact match -> NO_REPAIR_NEEDED
```

Priority:

```text
workflow safety conflict > master defects > record stale repair > no repair
```

Do not infer master wrongness from a record mismatch alone.
`isApp53InputWrong`, `isApp795RouteWrong`, `isApp796ProfileWrong` may remain provider-classified evidence only if their provenance is explicit; raw caller booleans must not become untrusted production authority.

If practical, model evidence objects instead of free booleans:

```text
{ status, source, reason, verified }
```

---

# 4. STRICT SECURITY / PRIVACY BOUNDARY

Must remain impossible from Admin Support Center:

```text
Submit MBO
Approve
Return
Complete
Score
Change Process Status
Act as Requester
Act as Appraiser
Act as HR
Impersonate user
Modify App53/App795/App796/App794
Display password hash
Display tokens/cookies/secrets
Dump entire record
```

`admin-form` can inspect evidence only.

Controlled Repair remains a future separately authorized package.

```text
CONFIRM_REPAIR_ENABLED = NO
REPAIR_WRITE_IMPLEMENTED = NO
```

---

# 5. TEST MATRIX — MUST BE COMPREHENSIVE

Do not merely adjust tests to implementation. Tests must enforce baseline semantics.

At minimum cover:

## Security
```text
admin-form technical panel allowed
administrator denied technical panel
admin-form requester business bypass denied
administrator requester business bypass denied
Requester_User exact member allowed in normal business flow
Employee_Code/status cannot elevate admin identity
no business buttons/actions in admin surface
```

## Employee Check Controller
```text
CHECK button invokes injected provider once
blank employee blocks
invalid FY blocks
provider loading state
not found
ambiguous App794 annual records
provider error fail closed
successful result rerenders selected employee
checking another employee does not mutate current record
re-render does not duplicate handlers
```

## Profile
```text
shared runtime profile resolver used / policy parity
Staff/Chief
Japanese Staff
Assistant Manager
Section Manager
Senior Manager
DGM/GM/VP
known aliases from existing resolver
unknown title fail closed
unverified employee snapshot fail closed
missing authoritative profile code/PartA/PartB -> NOT_EVIDENCED
wrong authoritative code -> MASTER_CONFLICT
wrong authoritative weights -> MASTER_CONFLICT
complete App796 evidence -> EVIDENCED
```

## Routing
```text
non-TMG expected key
TMG1/TMG2 exact Section|Team
missing Team -> TEAM_REQUIRED / fail closed
missing route -> ROUTE_NOT_FOUND
ambiguous route -> AMBIGUOUS_ROUTE
DGM/GM/VP Position keys
M1_ONLY exact appraiser1
M1_G1 exact appraiser1/appraiser2
M1_M2_G1 ordinal mapping if represented locally
missing required authoritative slot -> NOT_EVIDENCED
wrong slot1/2/3/4 -> exact ordinal mismatch
extra actual slot -> ERROR
Routing Key alone never full PASS
partial route object never full PASS
```

## Ordinal Storage Mapping
```text
M1_G1: Manager_User -> slot1; GM_User -> slot2
M1_ONLY: Manager_User -> slot1
M1_M2_G1: First_Manager_User -> slot1; Manager_User -> slot2; GM_User -> slot3
missing required field
extra field / inconsistent topology
```

## Workflow
```text
canonical 16 status names only
M1_G1 cannot enter 02/07/12
M1_ONLY cannot enter 04/09/14
active slot consistency
unknown status fail closed
missing topology not PASS
future/unreviewed topology not production-certified PASS
history absent -> PENDING_AUDIT_DESIGN
actual supplied audit entries preserved as evidence, not fabricated
```

## Repair
```text
profile-only stale -> exact profile fields only
route-only stale -> exact routing + changed ordinal appraiser fields only
profile+route stale -> both domains only when both masters fully evidenced
bad/missing profile master blocks profile repair
bad/missing route master blocks route repair
workflow error always escalates
blocked candidate shows no executable/exact repair diff
NO_REPAIR_NEEDED shows no misleading changed fields
Confirm Repair disabled
```

## UI/Snapshot
```text
INCOMPLETE_EVIDENCE not styled PASS
NOT_EVIDENCED==NOT_EVIDENCED does not render MATCH checkmark
HTML escaping
snapshot explicit allowlist
secret redaction defense-in-depth
snapshot button works
snapshot excludes evaluation comments/objectives/password material
```

Run:

```text
admin-targeted tests
all related routing/profile tests
full npm test
normal build
```

If repo has no CI status, report local Antigravity execution evidence only; do not claim GitHub CI PASS.

---

# 6. SOURCE SCOPE / ARCHITECTURE RULES

Keep modular production source.

Preferred ownership:

```text
src/admin/admin-diagnostic-model.js
src/admin/admin-support-center.js
src/admin/<one provider/controller module if justified>
existing src/services/routing-service.js for separation of resolution/auth
existing src/profiles/profile-scoring-resolver.js or a shared extracted pure policy
existing appraiser normalizer/shared route-slot normalizer where appropriate
minimal src/main-mbo-app.js wiring only
```

Do not create many micro-files.
Do not refactor unrelated Employee/Appraiser/HR screens.
Do not change accepted business UI presentation.
Do not perform broad R2 refactor.

Source remains `src/`.
Production bundle remains `dist/mbo-employee-app.js` generated by normal build.

---

# 7. NO KINTONE EXECUTION BOUNDARY

During this package:

```text
KINTONE_RUNTIME_GET_EXECUTED = 0
KINTONE_WRITE = 0
KINTONE_DEPLOY = 0
SCHEMA_CHANGE = 0
PROCESS_CHANGE = 0
ACL_CHANGE = 0
WORKFLOW_ACTION = 0
REAL_RECORD_MUTATION = 0
```

Production-intended read-only provider code may be implemented and tested against fake/injected transport only.

Do NOT use live Kintone as evidence in this task.

---

# 8. DOCUMENTATION CLEANUP

Update only living docs:

```text
project-docs/AI_REVIEW_PACKAGE.md
project-docs/CURRENT_STATE.md
project-docs/HANDOFF.md
```

Correct stale/contradictory wording.

Admin Support Center status after this task must be reported honestly as one of:

```text
LOCAL_CHECK_AND_REPAIR_PREP = PASS
LOCAL_CHECK_AND_REPAIR_PREP = IMPLEMENTED_BUT_NEEDS_FIX
```

Workflow actual-history status must remain separate:

```text
WORKFLOW_ACTUAL_HISTORY = PENDING_AUDIT_SCHEMA_AUTHORIZATION
```

unless a real already-existing evidence source is proven from repository material without Kintone contact.

Do NOT write `DEFECTS_REMAINING = NONE` if workflow actual history persistence is still pending; classify it explicitly as a production/audit design blocker rather than a local CHECK defect.

Do not repeat unsupported historical claims such as specific browser password implementation unless exact source is inspected in this execution.

---

# 9. REQUIRED FINAL REPORT

Return exact evidence:

```text
IMPLEMENTATION_HEAD = <sha>
PARENT_HEAD = 2765d272ae6e11909fc654fa7b72d4a35647c60b

SOURCE_CHANGED_FILES = <exact list>
TEST_CHANGED_FILES = <exact list>
DIST_CHANGED_FILES = <exact list>
DOC_CHANGED_FILES = <exact list>

ADMIN_FORM_EXACT_GATE = PASS|FAIL
ADMIN_FORM_BUSINESS_AUTHORITY = NONE|CONFLICT
ADMIN_FORM_REQUESTER_BYPASS_REMOVED = PASS|FAIL
ROUTE_RESOLUTION_AUTH_SEPARATION = PASS|FAIL

EMPLOYEE_CHECK_INTERACTION = PASS|FAIL
EMPLOYEE_CHECK_PROVIDER_CONTRACT = PASS|FAIL
CURRENT_RECORD_MUTATION_FROM_ADMIN_CHECK = 0|FAIL

PROFILE_SHARED_POLICY_PARITY = PASS|FAIL
AUTHORITATIVE_PROFILE_COMPLETENESS = PASS|FAIL
PROFILE_REPAIR_EVIDENCE = PASS|FAIL

ROUTE_AUTHORITATIVE_COMPLETENESS = PASS|FAIL
ORDINAL_APPRAISER_MAPPING = PASS|FAIL
EXECUTIVE_APPRAISER_VALIDATION = PASS|FAIL
NORMAL_ROUTE_APPRAISER_VALIDATION = PASS|FAIL
EXTRA_SLOT_GUARD = PASS|FAIL

WORKFLOW_CURRENT_STATE_VALIDATION = PASS|FAIL
FUTURE_TOPOLOGY_CERTIFICATION_GUARD = PASS|FAIL
WORKFLOW_ACTUAL_HISTORY = EVIDENCED|PENDING_AUDIT_SCHEMA_AUTHORIZATION|FAIL

REPAIR_ROOT_CAUSE_CLASSIFIER = PASS|FAIL
REPAIR_DIFF_INCLUDES_CHANGED_APPRAISERS = PASS|FAIL
BLOCKED_REPAIR_HAS_NO_FAKE_DIFF = PASS|FAIL
CONFIRM_REPAIR = DISABLED|FAIL

INCOMPLETE_EVIDENCE_UI = PASS|FAIL
SNAPSHOT_ALLOWLIST = PASS|FAIL
HTML_OUTPUT_ESCAPING = PASS|FAIL

TARGETED_TESTS = <command/result/count>
RELATED_TESTS = <command/result/count>
NPM_TEST = <command/result/count>
BUILD = <command/result>
GITHUB_CI_EVIDENCE = PRESENT|ABSENT

KINTONE_RUNTIME_GET_EXECUTED = 0
KINTONE_WRITES = 0
KINTONE_DEPLOYS = 0

LOCAL_CHECK_AND_REPAIR_PREP = PASS|IMPLEMENTED_BUT_NEEDS_FIX
FINAL_KINTONE_EXECUTION_READINESS = BLOCKED
REMAINING_PRODUCTION_BLOCKERS = <exact list>
```

Commit implementation + tests + generated dist + living docs, push once, then STOP for independent ChatGPT review.
