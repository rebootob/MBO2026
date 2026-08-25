# AI ACTIVE TASK — M10A RUNTIME INTEGRATION DISCOVERY + SEC-DEP-001 DECISION PREP

> **Control Plane:** ChatGPT / Independent Reviewer
> **Execution Plane:** Antigravity standalone only
> **Repository:** `rebootob/MBO2026`
> **Branch:** `ai/antigravity-wp002c`
> **Reviewed Head:** `c1a394a946ef93c8818f9fd3d98b1f0a9a8e4b1c`
> **Mode:** READ-ONLY DISCOVERY / RUNTIME GAP ANALYSIS / IMPLEMENTATION PLAN ONLY — KINTONE WRITES = 0

# NORTH STAR

```text
Applications / Masters / Dashboard foundation = PASS
M7 App795 routing                              = CLOSED / 17 OF 17
M9 Final Acceptance                            = PASS_WITH_OPEN_DEPENDENCIES

NEXT DELIVERY GOAL:
Employee -> App794 -> App795/App796/App797/App798 -> App800
must become a real, safe, end-to-end business runtime.

M10A = DISCOVER EXACT RUNTIME GAPS + SECURITY DECISION INPUT
NO IMPLEMENTATION WRITE YET
```

# WHY THIS TASK EXISTS

M9 proved that the delivered apps and dashboard are live and coherent, but it did NOT prove that the real employee-to-evaluation business workflow is fully wired.

Current known open dependency:

```text
SEC-DEP-001 = OPEN
Title = Shared Kintone Account Security Conflict
Impact = Employee Self-Service Record Isolation
Required before Employee Self-Service go-live:
Authenticated Identity -> Employee_Code -> Authorized Record
```

General employees may share a Kintone account, so native Kintone login identity alone cannot safely distinguish individual employees. Do not hide this behind UI logic.

This task must produce the smallest safe implementation package for the next step.
Do NOT implement it yet.

# HARD SAFETY

```text
KINTONE_WRITES_THIS_TASK = 0
SCHEMA_WRITES = 0
RECORD_WRITES = 0
PROCESS_WRITES = 0
CUSTOMIZATION_DEPLOY = 0
ACL_WRITES = 0
```

Protected apps remain READ ONLY:

```text
53, 139, 283, 305, 307, 310, 640, 643, 715, 716
```

Delivered apps 794, 795, 796, 797, 798, 800 are READ ONLY for M10A.

# STEP 1 — FREEZE CURRENT LIVE/REPO BASELINE

Verify branch/head and read current source + live GET evidence only as needed.

Record current status for:

```text
App53  Employee Namelist / source of employee, Section, Team
App794 Transaction / MBO record
App795 Routing / 17 active contexts
App796 Scoring / 8 published profiles
App797 Hoshin
App798 Archive
App800 HR Control Center
```

Do not rediscover already-frozen business routing or scoring unless a direct contradiction is found.

# STEP 2 — TRACE ACTUAL RUNTIME CALL PATHS

Inspect repository source and current Kintone customizations and determine whether each runtime edge is actually implemented and live:

```text
53 -> 794
794 -> 795
794 -> 796
794 -> 797
794 -> 798
794/795/796/797/798 -> 800
```

For every edge classify exactly one:

```text
LIVE_WIRED
IMPLEMENTED_NOT_DEPLOYED
IMPLEMENTED_PARTIAL
NOT_IMPLEMENTED
NOT_APPLICABLE_CURRENT_SCOPE
```

For each edge provide:

```text
source file/function
trigger/event
input contract
output contract
Kintone API/app dependency
failure behavior
whether fail-closed
whether live customization references the implementation
```

Do not infer wiring from architecture documents alone.

# STEP 3 — APP794 REAL BUSINESS FLOW MAP

Map the actual expected lifecycle of one employee MBO transaction from repository + live schema/process evidence.

At minimum answer:

```text
How is Employee_Code established?
How are employee snapshot fields populated?
How are Department / Section / Team derived?
How is Routing_Key computed?
How is App795 selected?
How is requester validated?
How are Manager L1 / optional L2 / GM levels assigned?
How is scoring profile selected from App796?
When/how is scoring config frozen onto the employee transaction?
How is Hoshin data consumed?
When/how is archive created?
What event/status drives each step?
What happens on missing/duplicate config?
```

If any answer is not implemented, mark it explicitly.

# STEP 4 — SEC-DEP-001 DEEP ANALYSIS

Do not implement a security workaround in this task.

Analyze the current shared-account model and identify the exact trust boundary.

Required finding:

```text
Can the current runtime deterministically bind the person using the browser/session
-> exact Employee_Code
without trusting user-editable input or a shared Kintone identity?
```

Classify:

```text
SECURE_BINDING_ALREADY_EXISTS
SECURE_BINDING_PARTIAL
SECURE_BINDING_ABSENT
```

Explicitly reject insecure patterns such as:

```text
employee selects own Employee_Code from dropdown
Employee_Code accepted from query string/localStorage without server-side validation
shared Kintone login treated as individual identity
hidden field treated as authorization
client-side filtering treated as access control
```

# STEP 5 — SECURITY OPTIONS FOR CONTROL-PLANE DECISION

Produce 2-4 feasible options for solving SEC-DEP-001 using the actual environment and current architecture.

For each option provide:

```text
Option name
Identity source
How identity binds to Employee_Code
Where validation occurs
Can employee impersonate another employee?
Impact on Kintone shared account model
Required apps/fields/customization/external component
Operational burden for HR/IT
Security strength
Implementation complexity
Rollback complexity
Recommended / not recommended
```

Do not choose a solution solely because it is easiest.
Recommend the smallest option that truly enforces record isolation.

If secure employee self-service cannot be achieved under the existing shared Kintone account constraint without an external identity layer or redesigned access model, say so explicitly.

# STEP 6 — DETERMINE SMALLEST IMPLEMENTATION PACKAGE

After runtime + security analysis, define the next package as one cohesive implementation milestone.

Preferred shape if supported by evidence:

```text
M10B Runtime Core:
1. trusted employee context resolver
2. App53 read-only employee snapshot
3. team-aware App795 routing resolver
4. App796 scoring profile resolver
5. fail-closed guards
6. App794 runtime integration
7. tests
8. deployment/read-back plan
```

But do NOT force this shape if source evidence shows a different smaller critical path.

Separate:

```text
BLOCKING_FOR_FIRST_SAFE_END_TO_END_TEST
REQUIRED_BEFORE_EMPLOYEE_SELF_SERVICE_GO_LIVE
DEFERRED_AFTER_UAT
```

Do not include legacy migration or Excel enhancement unless directly required.

# STEP 7 — CHANGE PLAN BEFORE ANY FUTURE WRITE

Produce a governed plan for the recommended next implementation.

For every proposed change state:

```text
WHAT changes
WHERE: exact existing file/function/app/field/process/customization
HOW
WHY
EXPECTED IMPACT
RISK
TEST PLAN
ROLLBACK PLAN
KINTONE WRITE REQUIRED? YES/NO
USER AUTHORIZATION REQUIRED? YES/NO
```

Prefer modifying existing source/functions. New files only with clear separation-of-concerns justification.

Apply mandatory No-Orphan rule:

```text
No duplicate resolver
No obsolete implementation retained
No _old/_v1 copies
No stale active routing/scoring assumptions
No unused config keys
```

# STEP 8 — TEST / GIT

Run:

```bash
npm test
git diff --check
git status --short
```

Required:

```text
npm test = PASS
git diff --check = PASS
KINTONE_WRITES_THIS_TASK = 0
NO_ORPHAN_ARTIFACT_GATE = PASS
local HEAD = origin/ai/antigravity-wp002c after push
```

Only update evidence/living docs and implementation plan in this task.
Do NOT deploy or mutate Kintone.

# HARD STOP

Stop and report BLOCKED if:

```text
live state contradicts frozen routing/scoring business truth
security binding cannot be characterized with available evidence
implementation would require modifying protected apps
an existing runtime implementation cannot be safely understood
```

Do not guess.

# FINAL REQUIRED SUMMARY

```text
M10A_RUNTIME_INTEGRATION_DISCOVERY = COMPLETE / BLOCKED

CROSS_APP_53_TO_794 = status
CROSS_APP_794_TO_795 = status
CROSS_APP_794_TO_796 = status
CROSS_APP_794_TO_797 = status
CROSS_APP_794_TO_798 = status
CROSS_APP_CONFIG_TO_800 = status

APP794_REAL_RUNTIME_READY = YES / PARTIAL / NO
RUNTIME_CRITICAL_GAPS = count + exact list

SEC_DEP_001 = OPEN / RESOLVED_BY_EXISTING_MECHANISM
SECURE_EMPLOYEE_BINDING = EXISTS / PARTIAL / ABSENT
RECOMMENDED_SECURITY_OPTION = exact option
USER_DECISION_REQUIRED = YES / NO + exact decision

NEXT_IMPLEMENTATION_PACKAGE = exact name
BLOCKING_FOR_FIRST_SAFE_END_TO_END_TEST = exact list
REQUIRED_BEFORE_EMPLOYEE_SELF_SERVICE_GO_LIVE = exact list
DEFERRED_AFTER_UAT = exact list

KINTONE_WRITES_THIS_TASK = 0
npm test = actual / PASS
GIT_DIFF_CHECK = PASS / FAIL
NO_ORPHAN_ARTIFACT_GATE = PASS / BLOCKED
GIT_PUSH_SYNC = PASS / FAIL

NEXT_ACTION = CHATGPT REVIEW / USER SECURITY DECISION / IMPLEMENTATION AUTHORIZATION
```

Update `CURRENT_STATE.md`, `HANDOFF.md`, `AI_REVIEW_PACKAGE.md`, `OPEN_ISSUES.md` only if factual evidence requires it. Add a focused plan/evidence document only if no suitable existing document can hold the M10A result without causing duplication.

Commit and push same branch, then STOP.
