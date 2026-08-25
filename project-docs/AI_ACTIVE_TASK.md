# AI ACTIVE TASK — DELIVERY DAY SPRINT 04: M9 END-TO-END SMOKE + FINAL NO-ORPHAN CLEANUP

> **Control Plane:** ChatGPT / Independent Reviewer
> **Execution Plane:** Antigravity standalone only
> **Repository:** `rebootob/MBO2026`
> **Branch:** `ai/antigravity-wp002c`
> **Reviewed head:** `894547f00335fb6161dd7955961dbe16d3d2f452`
> **Mode:** READ-ONLY / TEST-ONLY END-TO-END SMOKE + REPO CLEANUP; KINTONE WRITES = 0

# TODAY NORTH STAR — FINAL DELIVERY PATH

```text
M4 App797 Hoshin Master       = PASS
M5 App798 Revision Archive    = PASS
M6 App796 Scoring Baseline    = PASS / 8 OF 8 PUBLISHED
M7 App795 Routing Baseline    = PASS / 12 OF 12 ACTIVE REQUESTER BASELINE
M8 App800 HR Dashboard MVP    = PASS
M9 End-to-End Smoke Test      = EXECUTE NOW

TODAY_DONE = NO
NEXT_CRITICAL_PATH = M9 READ-ONLY SMOKE + FINAL NO-ORPHAN CLEANUP -> CHATGPT REVIEW -> TODAY DONE DECISION
```

# CONTROL-PLANE REVIEW — SPRINT 03B-R2

Accepted live/business state:

```text
APP795_SCHEMA_REQUIRED_FLAG_GATE = PASS
Manager_User.required = false
GM_User.required = false
APP795_REQUESTER_BASELINE = 12/12
TME1 -> e1 preserved
new requester records with Manager_User data = 0
new requester records with GM_User data = 0
new requester records with First_Manager_User data = 0
TMT3 active count = 0
duplicate active Section_Code = 0
Apps794/796/797/798/800 writes = 0
protected app writes = 0
npm test = 500/500 PASS (reported evidence)
```

Sprint03B-R2 business gate is accepted. Do NOT mutate App795 again in this sprint.

# OBSERVATIONS TO CLOSE INSIDE THIS SPRINT — DO NOT OPEN ANOTHER CLEANUP SPRINT

Current repository still has stale current-state text and execution-only code:

```text
CURRENT_STATE still contains old 1/12 M7 rows
CURRENT_STATE still contains ACR-002 PROPOSED wording
CURRENT_STATE test status still contains stale 471/471
some current/handoff rows still describe M7 blocked
rollback-only executable helper remains in seed-routing-baseline.js
```

These are cleanup items to be handled in the same M9 implementation/evidence commits.

Historical Git history/backups/evidence must remain intact.

# STEP 0 — GIT / SECURITY

Require:

```text
branch = ai/antigravity-wp002c
reviewed head 894547f... is ancestor
local HEAD = origin branch
tracked tree clean
```

No reset/rebase/force push/history rewrite.

Before any Kintone network call:

```js
delete process.env.KINTONE_API_TOKEN;
```

Use username/password auth only.

This Sprint performs ZERO Kintone writes.

Blocked methods across ALL Kintone calls:

```text
POST
PUT
PATCH
DELETE
schema mutation
deploy
record creation
record update
status transition
```

Protected apps remain READ ONLY:

```text
53,283,305,307,310,640,643,715,716
```

Sandbox apps also READ ONLY in M9:

```text
794,795,796,797,798,800
```

# STEP 1 — FINAL NO-ORPHAN REPO CLEANUP

## 1A Remove obsolete rollback-only executable path

In existing:

```text
scripts/kintone/seed-routing-baseline.js
```

Remove rollback-only runtime code that was introduced solely for Sprint03B-R1 and is no longer part of active operation:

```text
createNarrowRollbackTransport
executeRoutingRollback
related rollback-only exports/comments
```

Remove corresponding rollback-only unit tests.

Do NOT remove historical rollback evidence from docs/Git history/backups.

Do NOT create replacement rollback script.

Keep only justified active/bootstrap code needed for reproducible App795 requester baseline/schema contract verification.

If any rollback function has an active non-test caller outside its own historical test block, STOP and report rather than removing it.

## 1B Reconcile living current state

Update current/living sections only:

```text
M6 = PASS / App796 8/8 PUBLISHED
M7 = PASS / App795 12/12 ACTIVE REQUESTER BASELINE
M8 = PASS
ACR-002 = APPROVED / EXECUTED / WRITE WINDOW CLOSED
Manager_User.required = false
GM_User.required = false
M9 = IN PROGRESS / then final result after smoke
latest npm test total = actual
Active Sandbox Apps = 794,795,796,797,798,800
```

Remove stale CURRENT values such as:

```text
M7 = 1/12
ACR-002 PROPOSED / USER APPROVAL REQUIRED
M7 write blocked
stale 471/471 current test total
CURRENT_STATE active-app list that omits 797/798/800
```

Preserve historical forensic sections if clearly historical.

Required:

```text
NO_ORPHAN_ARTIFACT_GATE = PASS
STALE_ACTIVE_REFERENCES = 0
ROLLBACK_ONLY_ACTIVE_RUNTIME = 0
```

# STEP 2 — M9 READ-ONLY LIVE APP HEALTH PREFLIGHT

Read-only verify exact sandbox app identities from registry:

```text
794 MBO transaction
795 Routing Master
796 Scoring Master
797 Hoshin Master
798 Revision Archive
800 HR Control Center
```

For each relevant app GET only:

```text
app/settings identity
form field metadata required for contract checks
ACL where required
record count / bounded records needed for verification
customization metadata for App800
```

Required live health assertions:

## App795

```text
active requester baseline = exactly 12
exact Section_Code set = TME1,TMF1,TMF2,TMF3,TMG1,TMG2,TMH1,TMH2,TMH3,TMS1,TMT1,TMT2
exact requester mapping matches DEC-031
TMT3 active count = 0
duplicate active Section_Code count = 0
Manager_User.required = false
GM_User.required = false
```

## App796

```text
record count = 8
PUBLISHED count = 8
VALIDATED count = 0
exact 8 profile codes present
PROF_STAFF_CHIEF = 70/30
PROF_JAPANESE_STAFF = 70/30
PROF_ASST_MGR = 60/40
PROF_SECTION_MGR = 50/50
PROF_SENIOR_MGR = 50/50
PROF_DGM = 50/50
PROF_GM = 50/50
PROF_VP = 50/50
stored config hashes structurally valid
```

Do not modify/publish/supersede scoring records.

## App797

```text
exact identity
Hoshin_Status field exists
custom Status field absent
Creator-only ACL / approved native security state
record count reported exactly
```

Do not create Hoshin records merely to make smoke pass.
If record count is 0, report `HOSHIN_DATA_READINESS = NOT_SEEDED` rather than inventing data.

## App798

```text
exact identity
15-field archive contract intact
Reason required=true
Snapshot_JSON required=true
Archived_At required=true
Creator-only ACL
record count reported exactly
```

## App800

```text
exact identity = MBO HR Control Center [Sandbox]
Creator-only ACL
live customization metadata includes expected JS FILE and CSS FILE
record count = 0
```

# STEP 3 — APP794 READ-ONLY READINESS SMOKE

Do NOT create artificial App794 records.

GET-only verify:

```text
exact App794 identity
required core field contract for Fiscal_Year, Employee_Code, Requester_User, Status and scoring/routing snapshot fields needed by current architecture
native process/status configuration exists and remains unchanged
record count = actual
```

If App794 has existing suitable records, inspect only safe fields needed to verify status readability and dashboard consumption.

If App794 has 0 usable records, do NOT manufacture test data. Record:

```text
APP794_DATA_DRIVEN_E2E = NOT_EXECUTABLE_WITHOUT_ARTIFICIAL_WRITE
```

This is not a smoke failure if architectural/static/live-read contracts pass; DEC-029 prohibits artificial writes.

# STEP 4 — CROSS-APP CONTRACT SMOKE (NO LIVE WRITE)

Implement/extend tests using injected/fake dependencies against the same production modules, not duplicate logic.

Validate the chain:

```text
Employee/annual identity input
-> App795 requester resolution for representative sections
-> App796 evaluation/scoring profile resolution for representative positions
-> App794 annual record initialization payload construction / validation path
-> Dashboard App800 consumption contract / status aggregation helpers
```

Representative cases at minimum:

```text
Staff/Chief section requester resolution
Assistant Manager = 60/40
Section Manager+ = 50/50
Japanese Staff = 70/30
TMG shared requester g_request
TMH shared requester tmh
retired TMT3 rejected
unknown Section_Code rejected/fail-closed
unknown position/profile rejected/fail-closed
missing published scoring config rejected/fail-closed
```

Do not duplicate scoring/routing business rules into a new parallel implementation solely for test.

If current architecture does not yet expose a complete App794 payload builder/live resolver path, test the nearest existing canonical integration boundaries and record the exact missing integration as a blocker/observation. Do not fake a PASS.

# STEP 5 — HRCC RUNTIME CONTRACT SMOKE

Using the existing dependency-injected HRCC runtime/tests:

```text
App800 no-op outside App800
GET-only contract
App794 pagination bounded
App795 health returns 12/12 using Active="Active"
App796 health count reflects 8 PUBLISHED
App797 health count semantics = Ready_For_MBO="YES"
App798 archive count total
filters FY/Department/Section/Status work
pipeline aggregation works
XSS escaping still enforced
quick links use registry IDs
unavailable source renders unavailable, not zero
```

If an actual authenticated browser observation is practical in Antigravity standalone, record:

```text
HRCC_BROWSER_RENDER = PASS
```

Only if directly observed.
Otherwise:

```text
HRCC_BROWSER_RENDER = NOT_DIRECTLY_OBSERVED
```

Do not claim browser PASS from metadata/unit tests alone.

# STEP 6 — TEST / STATIC SAFETY

Run full:

```bash
npm test
git diff --check
git status --short
```

Zero test failures.

Search active repository for:

```text
hardcoded unauthorized Manager_User = suthas -> 0
hardcoded unauthorized GM_User = somrudee -> 0
active executeRoutingRollback symbol -> 0
active createNarrowRollbackTransport symbol -> 0
stale current M7 1/12 wording -> 0
stale current ACR-002 PROPOSED wording -> 0
```

Historical commit messages/forensic docs are allowed if clearly historical.

# STEP 7 — EVIDENCE / FINAL DELIVERY STATUS

Update living docs and AI_REVIEW_PACKAGE with exact evidence.

Required final block:

```text
DELIVERY_SPRINT_04_M9 = COMPLETE / PENDING CHATGPT REVIEW
M6_APP796 = PASS / 8/8 PUBLISHED
M7_APP795 = PASS / 12/12 ACTIVE REQUESTER BASELINE
M8_APP800 = PASS
APP795_MANAGER_USER_REQUIRED = false
APP795_GM_USER_REQUIRED = false
APP795_TMT3_ACTIVE_COUNT = 0
APP795_DUPLICATE_ACTIVE_COUNT = 0
APP796_PUBLISHED_COUNT = 8
APP797_RECORD_COUNT = actual
APP798_RECORD_COUNT = actual
APP800_RECORD_COUNT = 0
APP800_CUSTOMIZE_METADATA = PASS
APP794_RECORD_COUNT = actual
APP794_DATA_DRIVEN_E2E = PASS / NOT_EXECUTABLE_WITHOUT_ARTIFICIAL_WRITE / BLOCKED with exact reason
CROSS_APP_CONTRACT_SMOKE = PASS/FAIL
HRCC_RUNTIME_CONTRACT_SMOKE = PASS/FAIL
HRCC_BROWSER_RENDER = PASS or NOT_DIRECTLY_OBSERVED
KINTONE_WRITES_THIS_TASK = 0
PROTECTED_WRITES_THIS_TASK = 0
NO_ORPHAN_ARTIFACT_GATE = PASS
ROLLBACK_ONLY_ACTIVE_RUNTIME = 0
STALE_ACTIVE_REFERENCES = 0
npm test = actual total / PASS
TODAY_DELIVERY_TARGET = PASS / BLOCKED with exact reason
```

Do not mark TODAY_DELIVERY_TARGET PASS if a genuine runtime/business blocker remains.

Expected exactly two commits after this Control Plane task:

```text
1. test: run m9 cross-app smoke and remove obsolete rollback path
2. docs: record m9 final delivery evidence
```

Push; require local HEAD = remote HEAD; tracked tree clean; STOP.

# STRICT OUT OF SCOPE

Do NOT:

- write any Kintone app
- create fake App794 smoke records
- modify App795 schema/records
- modify App796 records
- create Hoshin/archive records for test
- redeploy App800
- alter scoring ratios
- invent routing approvers
- reactivate TMT3
- delete deprecated App795 legacy fields in live Kintone
- expand dashboard UI/features in this sprint

# REVIEW EXPECTATION

```text
M7_FINAL_LIVE_BASELINE_GATE = PASS expected
M9_LIVE_APP_HEALTH_GATE
M9_APP794_READINESS_GATE
M9_CROSS_APP_CONTRACT_GATE
M9_HRCC_RUNTIME_GATE
M9_BROWSER_OBSERVATION_GATE
KINTONE_ZERO_WRITE_GATE
PROTECTED_ZERO_WRITE_GATE
NO_ORPHAN_ARTIFACT_GATE
REGRESSION_GATE
DOC_EVIDENCE_CONSISTENCY_GATE
GIT_PUSH_SYNC_GATE
TODAY_DELIVERY_TARGET_GATE
```