# AI ACTIVE TASK — M7D APP795 TEAM-AWARE ROUTING SCHEMA PREFLIGHT

> **Control Plane:** ChatGPT / Independent Reviewer
> **Execution Plane:** Antigravity standalone only
> **Repository:** `rebootob/MBO2026`
> **Branch:** `ai/antigravity-wp002c`
> **Reviewed head:** `b28d8d6d0fa6189b538fc05bd1ca60dc9736b976`
> **Mode:** PLAN + READ-ONLY PREFLIGHT ONLY — KINTONE WRITES = 0

# NORTH STAR

```text
M7A Requester Baseline              = PASS / 12 OF 12
M7C TMG Team Routing Discovery      = PASS / 7 OF 7 CURRENT TEAM FLOWS
M7D Team-Aware App795 Schema        = REQUIRED / PREFLIGHT ONLY
M7 OVERALL                          = OPEN
M9 FINAL ACCEPTANCE                 = BLOCKED_PENDING_FULL_M7
TODAY_DONE                          = NO
```

# AUTHORITATIVE BUSINESS REQUIREMENT

For routing resolution:

```text
TMG1 = 4 Teams
TMG2 = 3 Teams CURRENTLY
```

App53 remains the source of truth for employee Team.

Verified App53 Team field:

```text
Drop_down_2
Label = Team
```

App795 must support Team-aware routing for TMG1/TMG2.

For TMG1/TMG2, routing identity must be derived from:

```text
Section_Code + Team
```

For non-TMG sections, Team is not required for routing and may remain blank/null.

# IMPORTANT ARCHITECTURE CONSEQUENCE

Current App795 uses `Section_Code` as a unique routing identity.

That is incompatible with multiple routing rows under the same Section_Code for TMG1/TMG2.

Therefore the future target design must support a composite/business routing key, conceptually:

```text
Routing_Key
Section_Code
Team
```

Example only:

```text
TMG1|Admin
TMG1|CAD
TMG1|Marketing
TMG1|Production
TMG2|CAD
TMG2|Marketing
TMG2|Production
```

Do NOT create these fields yet in this task.
Do NOT change uniqueness yet in this task.
Do NOT write any Kintone data/schema in this task.

# PURPOSE

Prepare an exact, safe implementation plan for adding Team-aware routing to App795 while preserving existing requester/routing data and obeying the mandatory No-Orphan rule.

This task is PRE-FLIGHT ONLY.

# HARD SAFETY RULE — NO KINTONE WRITES

```text
KINTONE_WRITES = 0
POST = 0
PUT = 0
PATCH = 0
DELETE = 0
DEPLOY = 0
APP53_MODIFIED = NO
APP795_MODIFIED = NO
SCHEMA_MODIFIED = NO
PROCESS_MANAGEMENT_MODIFIED = NO
```

Absolutely prohibited in this task:

- creating Team field in App795
- creating Routing_Key field in App795
- changing Section_Code unique flag
- changing App795 records
- deleting/renaming fields
- deleting legacy fields
- seeding TMG routing records
- modifying App53
- modifying App794/796/797/798/800
- modifying protected legacy apps

# STEP 1 — READ CURRENT APP795 LIVE SCHEMA AND RECORDS

Read App795 schema and current records only.

Confirm exact current field definitions for:

```text
Section_Code
Section_Name
Requester_User
Manager_Level1_Approvers
Manager_Level1_Approval_Rule
Manager_Level2_Approvers
Manager_Level2_Approval_Rule
GM_Level1_Approvers
GM_Level1_Approval_Rule
GM_Level2_Approvers
GM_Level2_Approval_Rule
Active
Effective_From
Effective_To
Remark
legacy deprecated routing fields
```

Confirm specifically:

```text
Section_Code unique = current actual value
existing Team field = YES / NO
existing Routing_Key field = YES / NO
record count
current TMG1 records
current TMG2 records
```

Do not modify anything.

# STEP 2 — VERIFY APP53 TEAM SOURCE CONTRACT

Read App53 schema only as needed and reconfirm:

```text
Team field code = Drop_down_2
Section field code = exact current field code
Employee Code field code = exact current field code
```

Do not modify App53.

Define the future resolver contract:

```text
Employee Code
 -> App53
 -> Section_Code
 -> Team (Drop_down_2)
 -> if Section_Code in [TMG1, TMG2]: resolve App795 by Section_Code + Team
 -> otherwise: resolve App795 by Section_Code only
```

Document fail-closed behavior for:

```text
TMG employee with blank Team
TMG employee with unknown Team
multiple active routing rows for same Section+Team
no active routing row
multiple non-TMG active routing rows for same Section
```

# STEP 3 — DESIGN MINIMUM SAFE TARGET SCHEMA

Prepare the minimum safe target schema change proposal.

Expected conceptual target:

```text
Routing_Key     SINGLE_LINE_TEXT, required, unique
Section_Code    SINGLE_LINE_TEXT, required, NOT unique
Team            SINGLE_LINE_TEXT or DROP_DOWN decision based on source fidelity
```

Important:

- Team must preserve exact App53 values.
- Do not invent a duplicated Team master if App53 is the source of truth.
- Decide whether App795 `Team` should be stored as text snapshot/config value rather than a separate master.
- Explain why.
- Routing_Key must be deterministic and collision-safe.
- Do not implement until Control Plane/User explicitly approves the exact schema.

Recommend exact Routing_Key normalization rules, but do not silently normalize App53 Team values.

# STEP 4 — EXISTING DATA MIGRATION PLAN

Current App795 requester baseline contains 12 Section-level records.

Prepare an exact migration plan that preserves existing data.

For non-TMG sections:

```text
Team = blank
Routing_Key = Section_Code
```

For TMG1/TMG2:

Current Section-level placeholder/requester records must NOT remain as conflicting active routing records after Team-specific rows are introduced.

Plan exactly how to transition from current records to:

```text
TMG1 Admin
TMG1 CAD
TMG1 Marketing
TMG1 Production
TMG2 CAD
TMG2 Marketing
TMG2 Production
```

Do NOT execute migration.

Identify whether current TMG1/TMG2 requester records should be:

```text
updated/reused
superseded/deactivated
or replaced then safely removed
```

Choose the minimum-change approach consistent with No-Orphan and historical safety.

# STEP 5 — NO-ORPHAN IMPACT ANALYSIS

Mandatory rule:

```text
NO_ORPHAN_ARTIFACT_GATE = MANDATORY
```

Before any future schema implementation, identify all references to:

```text
Section_Code unique assumption
App795 lookups by Section_Code only
routing seeders
routing resolvers
App800 health logic
tests
schema-spec.js
docs
legacy deprecated routing fields
```

Produce exact files/functions/config keys that must change together in the future implementation.

Do not leave duplicate routing resolution paths.
Do not create `_old`, `_v1`, duplicate schema definitions, or dead helpers.

Do NOT delete deprecated App795 fields yet unless historical-data/reference safety is proven in a later authorized task.

# STEP 6 — FUTURE WRITE PLAN / SAFETY GATES

Prepare the exact future implementation sequence only:

```text
1. PREWRITE BACKUP App795 schema + records
2. verify backup SHA256 / durable path
3. add Team + Routing_Key / alter Section_Code uniqueness in preview schema
4. deploy
5. exact schema read-back
6. migrate existing records safely
7. seed/transform 7 TMG team-aware routing rows only from approved manifest
8. exact record read-back
9. verify duplicate Routing_Key = 0
10. verify stale Section-only active TMG routing rows = 0
11. run tests
12. verify No-Orphan gate
13. rollback plan ready
```

No step above is authorized for execution by this task.

# STEP 7 — TEST PLAN

Prepare tests for future implementation covering at minimum:

```text
TMG1 Admin resolves by Section+Team
TMG1 CAD resolves by Section+Team
TMG1 Marketing resolves by Section+Team
TMG1 Production resolves by Section+Team
TMG2 CAD resolves by Section+Team
TMG2 Marketing resolves by Section+Team
TMG2 Production resolves by Section+Team
non-TMG resolves by Section only
TMG blank Team fails closed
unknown TMG Team fails closed
duplicate Section+Team fails closed
Routing_Key uniqueness enforced
App53 remains read-only
```

# FINAL REQUIRED OUTPUT

Update current/living documentation with PRE-FLIGHT findings only.

Required final block:

```text
M7D_TEAM_AWARE_SCHEMA_PREFLIGHT = COMPLETE / PENDING CHATGPT REVIEW

APP53_TEAM_FIELD = exact
APP795_CURRENT_SECTION_CODE_UNIQUE = YES / NO
APP795_TEAM_FIELD_EXISTS = YES / NO
APP795_ROUTING_KEY_FIELD_EXISTS = YES / NO

TARGET_SCHEMA_PROPOSAL_READY = YES / NO
TARGET_TEAM_FIELD_TYPE = proposed type
TARGET_ROUTING_KEY_RULE = exact proposed rule
SECTION_CODE_UNIQUE_MUST_CHANGE = YES / NO

CURRENT_APP795_RECORD_COUNT = actual
CURRENT_TMG1_ROUTING_ROWS = actual
CURRENT_TMG2_ROUTING_ROWS = actual

MIGRATION_PLAN_READY = YES / NO
NO_ORPHAN_IMPACT_ANALYSIS = PASS / BLOCKED
STALE_ACTIVE_REFERENCE_TARGET = 0

KINTONE_WRITES = 0
APP53_MODIFIED = NO
APP795_MODIFIED = NO
SCHEMA_MODIFIED = NO

M7D_WRITE_AUTHORIZATION = NO
NEXT_ACTION = CHATGPT + USER REVIEW / EXPLICIT APPROVAL BEFORE ANY APP795 WRITE
```

Run:

```bash
npm test
git diff --check
git status --short
```

Commit/push documentation/preflight evidence only, same branch, then STOP.
