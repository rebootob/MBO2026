# AI ACTIVE TASK — M10E APP794 RUNTIME ADAPTER PREFLIGHT

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Reviewed Head: `c77aac51b1248ce8dbd843354cfda6122dbee9a5`
> Mode: READ-ONLY / REPOSITORY PREFLIGHT ONLY — NO KINTONE WRITES / NO DEPLOY

# NORTH STAR

```text
Apps foundation             = READY
App795 routing              = READY 17/17
App796 scoring              = READY 8/8
App800 HR Control Center    = LIVE
App801                      = LIVE / restricted / reserved
Kintone-only direction      = SELECTED
PATH_B Section Requester    = SELECTED

NEXT DELIVERY GOAL:
Make App794 runtime behavior use authoritative App795 routing + App53 employee master + App796 scoring,
without pretending a shared Kintone account is individual authentication.
```

# HARD SAFETY

```text
KINTONE_WRITES_THIS_TASK = 0
APP794_CUSTOMIZATION_DEPLOY = 0
APP794_SCHEMA_WRITES = 0
APP794_RECORD_WRITES = 0
APP795_WRITES = 0
APP796_WRITES = 0
APP53_WRITES = 0
APP801_WRITES = 0
PROCESS_WRITES = 0
EXTERNAL_DEPLOY = 0
```

# STEP 1 — INSPECT CURRENT APP794 RUNTIME CODE

Identify the exact current repository modules/customization files that affect App794 runtime behavior.

Required:

```text
CURRENT_APP794_RUNTIME_FILES = exact
CURRENT_EMPLOYEE_RESOLUTION = exact
CURRENT_ROUTING_RESOLUTION = exact
CURRENT_SCORING_RESOLUTION = exact
CURRENT_REQUESTER_USER_USAGE = exact
CURRENT_DEPLOYMENT_STATUS = exact
```

Do not create duplicate adapters if an existing module can be extended safely.

# STEP 2 — FREEZE AUTHORITATIVE DATA FLOW

Design exact runtime flow:

```text
shared Kintone account
  -> App794 page
  -> employee selection/context for business entry (NOT authentication)
  -> App53 READ ONLY employee snapshot
  -> derive Section + Team
  -> App795 Routing_Key resolution
  -> Requester_User / Manager / GM routing
  -> App796 scoring profile resolution
  -> App794 business fields / validation / workflow behavior
```

Required rules:
- App53 remains employee master / READ ONLY.
- App795 is authoritative routing source.
- TMG uses Section + Team Routing_Key.
- Non-TMG uses Section only.
- App796 is authoritative scoring source.
- Shared Kintone user must never be labeled individual employee identity.
- Employee_Code/query/localStorage must not be described as trusted authentication.

# STEP 3 — FIELD MAPPING

Read-only inspect App794, App53, App795, App796 schema/contracts and produce exact field mapping needed by runtime adapter.

At minimum resolve:

```text
App53 Employee_Code field
App53 Department field
App53 Section field
App53 Team field
App53 Position/Profile field(s)
App794 target Employee_Code field
App794 Requester_User field
App794 routing/approver fields actually present
App794 scoring/profile fields actually present
```

If any exact field code is unresolved, mark BLOCKED rather than guess.

# STEP 4 — ROUTING BEHAVIOR

Verify implementation plan for all active routing:

```text
17/17 App795 rows
TMG1 = 4 teams
TMG2 = 3 teams
Non-TMG = Section-only
Routing_Key duplicate handling = fail closed
Missing route = fail closed
Inactive route = fail closed
```

Define exactly what App794 shows to user when routing cannot resolve.

# STEP 5 — SCORING BEHAVIOR

Verify exact App796 runtime resolver contract against 8 published profiles.

Required:

```text
published config only
position/profile mapping exact
missing profile = fail closed
multiple active matching profiles = fail closed
no fallback to hardcoded stale ratios
```

Preserve current frozen ratios and source-of-truth rules.

# STEP 6 — PATH_B REQUESTER MODEL

Define how `Requester_User` from App795 is used operationally.

Required:

```text
Requester_User is workflow/request submission identity under shared-account constraint
Requester_User is NOT employee authentication identity
Employee business record remains tied to selected/validated App53 Employee_Code
Approver routing must derive from App795 only
```

Explain limitations clearly so UI does not imply individual login security.

# STEP 7 — UI / ERROR STATES

Design minimal runtime UX for:

```text
employee not found
Section missing
Team missing where TMG requires team
routing missing
routing duplicate
scoring profile missing
scoring profile duplicate
inactive employee if such field exists
successful resolution
```

Do not overbuild dashboard or unrelated UI.

# STEP 8 — IMPLEMENTATION PLAN FOR NEXT TASK

Produce exact smallest deployment-ready repository scope only.

Must include:

```text
WHAT
WHERE exact files/functions
HOW
WHY
EXPECTED IMPACT
RISKS
TEST PLAN
ROLLBACK PLAN
NO-ORPHAN PLAN
```

Prefer modifying existing files/functions.
New files only with clear separation-of-concerns justification.

Next task should separate:

```text
A. repository code implementation/test only
B. App794 customization deployment
C. any schema/process write if unexpectedly required
```

Do not combine B/C without explicit user authorization.

# STEP 9 — TEST MATRIX

Define tests covering at least:

```text
non-TMG route
TMG1 team route
TMG2 team route
missing team
unknown employee
missing route
duplicate route
valid scoring profile
missing scoring profile
duplicate scoring profile
Requester_User mapping
no stale hardcoded routing/scoring fallback
```

Run existing tests:

```bash
npm test
git diff --check
git status --short
```

# FINAL REQUIRED SUMMARY

```text
M10E_APP794_RUNTIME_PREFLIGHT = COMPLETE / BLOCKED

CURRENT_APP794_RUNTIME_FILES = actual
FIELD_MAPPING_COMPLETE = YES/NO
APP53_READ_ONLY = YES
APP795_ROUTING_SOURCE = YES
APP796_SCORING_SOURCE = YES
TMG_TEAM_AWARE = YES/NO
REQUESTER_USER_MODEL = exact

RUNTIME_IMPLEMENTATION_READY = YES/NO
NEXT_REPOSITORY_SCOPE = exact
NEXT_TASK_KINTONE_WRITES = NONE / exact
NEXT_TASK_CUSTOMIZATION_DEPLOY = NO
USER_AUTHORIZATION_REQUIRED_FOR_DEPLOY = YES

KINTONE_WRITES_THIS_TASK = 0
npm test = actual / PASS
GIT_DIFF_CHECK = PASS/FAIL
NO_ORPHAN_ARTIFACT_GATE = PASS/BLOCKED
GIT_PUSH_SYNC = PASS/FAIL

NEXT_ACTION = CHATGPT REVIEW ONLY
```

Update only living docs required to record current factual preflight conclusions.
Commit and push same branch, then STOP.

Do NOT deploy App794 customization.
Do NOT change App794 schema/process.
Do NOT touch App53/App795/App796/App801 state.
