# AI ACTIVE TASK — M7C TMG TEAM-BASED ROUTING DISCOVERY (READ ONLY)

> **Control Plane:** ChatGPT / Independent Reviewer
> **Execution Plane:** Antigravity standalone only
> **Repository:** `rebootob/MBO2026`
> **Branch:** `ai/antigravity-wp002c`
> **Reviewed head:** `73c4e76f49b8937b43179882db4cda6975c1cfed`
> **Mode:** READ-ONLY DISCOVERY / EVIDENCE ONLY — KINTONE WRITES = 0

# NORTH STAR

```text
M7A Requester Baseline                 = PASS / 12 OF 12 SECTIONS
M7B Section-Level Routing Discovery    = PARTIAL / 3 VERIFIED, 7 AMBIGUOUS, 2 MISSING
M7C TMG Team-Based Routing             = REQUIRED / EXECUTE READ-ONLY DISCOVERY NOW
M7 OVERALL                              = OPEN
M9 FINAL ACCEPTANCE                     = BLOCKED_PENDING_M7
TODAY_DONE                              = NO
```

Critical business clarification from user:

```text
TMG1 = 4 routing lines, divided by Team
TMG2 = 4 routing lines, divided by Team
```

Therefore TMG1/TMG2 MUST NOT be treated as one routing flow per Section_Code.

For TMG routing, Team must be derived from App53 employee master data.

# OBJECTIVE

Discover the real 8 Team-based routing flows:

```text
TMG1 = 4 Team flows
TMG2 = 4 Team flows
TOTAL = 8 Team routing flows
```

Do not guess Team names.
Do not guess approvers.
Do not modify anything.

# HARD SAFETY RULE — READ ONLY ONLY

This task is investigation only.

ABSOLUTELY PROHIBITED:

```text
NO Kintone record create
NO Kintone record update
NO Kintone record delete
NO schema change
NO Process Management change
NO deploy
NO POST
NO PUT
NO PATCH
NO DELETE
NO field rename
NO field removal
NO App795 modification
NO App53 modification
NO legacy app modification
NO cleanup of Kintone data/schema
NO migration
NO routing seed
NO status transition
```

Required:

```text
KINTONE_WRITES_THIS_TASK = 0
APP53_MODIFIED = NO
APP795_MODIFIED = NO
LEGACY_APPS_MODIFIED = NO
SCHEMA_MODIFIED = NO
PROCESS_MANAGEMENT_MODIFIED = NO
```

Before Kintone network access:

```js
delete process.env.KINTONE_API_TOKEN;
```

Use authorized username/password authentication only.
Never print credentials, authentication headers, passwords, raw secrets, or unnecessary personal employee data.

# STEP 0 — GIT / REPOSITORY SAFETY

Require:

```text
branch = ai/antigravity-wp002c
73c4e76f... is ancestor
local HEAD = origin branch
tracked tree clean before execution
```

No reset/rebase/force push/history rewrite.

Do not create duplicate runtime scripts.
Prefer existing read-only utilities.
If a temporary local inspector is necessary, keep it untracked and delete it after use.
Do not commit raw Kintone exports, personal-data dumps, screenshots, or temporary JSON.

# STEP 1 — VERIFY APP53 TEAM SOURCE

Read App53 schema and only the records needed to understand TMG1/TMG2.

Confirm exact field codes for:

```text
Employee Code
Section / Section Code
Team
Position
Active/employment status if available
other fields genuinely required to distinguish routing
```

Existing external evidence suggests Team may be App53 field:

```text
Drop_down_2
```

BUT VERIFY THIS DIRECTLY FROM APP53. Do not assume.

Find active/current employees whose Section is:

```text
TMG1
TMG2
```

Group by exact Team value from App53.

Required result must prove:

```text
TMG1_TEAM_COUNT = 4
TMG2_TEAM_COUNT = 4
```

If live App53 does not produce exactly 4 + 4, STOP and report discrepancy. Do not force the expected count.

Preserve Team values exactly as stored in App53.
Do not normalize, rename, translate, abbreviate, or invent Team values.

For each Team report employee count only; do not list employee names unless a specific identity is necessary to prove routing evidence.

# STEP 2 — DEFINE DISCOVERY ROUTING IDENTITY

For investigation, derive the business routing identity as:

```text
Section_Code + exact Team value
```

Example structure only:

```text
TMG1 | <exact Team value>
TMG1 | <exact Team value>
TMG1 | <exact Team value>
TMG1 | <exact Team value>
TMG2 | <exact Team value>
TMG2 | <exact Team value>
TMG2 | <exact Team value>
TMG2 | <exact Team value>
```

Do NOT create a permanent `Routing_Key` field or modify App795 in this task.
Recommendation only is allowed.

# STEP 3 — DEEP READ LEGACY ROUTING SOURCES FOR EACH TEAM

Read only the relevant historical apps and evidence.

Inspect at minimum:

```text
283
305
307
310
640
643
715
716
```

Also inspect App139 or another legacy app only if repository/project evidence shows it contains useful Section-Team/routing evidence.

For TMG1/TMG2 search using:

```text
exact Section value
exact Team value
Section-Team combinations
historical records
approval status values
Process Management states
Process Management assignee groups/users
manager approval fields
GM approval fields
historical approver names/codes
```

Do not stop at form/schema inspection.
Inspect actual historical records and Process Management configuration when necessary.

# STEP 4 — CROSS-CHECK APPROVER IDENTITIES

For every candidate approver, cross-check against:

```text
App53 employee master
Kintone User Directory
legacy Process Management actors/groups
historical record approver evidence
repository routing/process documentation
```

Identity resolution priority:

1. exact Kintone USER_SELECT code stored in record/process configuration
2. exact employee code/email uniquely matching App53 + Kintone User Directory
3. exact full name with exactly one match
4. organization + position + name combination with exactly one match

Never infer an approver from title alone.
Never pick between conflicting candidates automatically.
Never reuse Requester_User as approver unless independently proven.

Classifications:

```text
VERIFIED
AMBIGUOUS
MISSING
NO_KINTONE_ACCOUNT
```

# STEP 5 — DETERMINE FULL ROUTING TOPOLOGY FOR EACH OF THE 8 TEAM FLOWS

For every exact TMG1/TMG2 Team, determine when evidence supports it:

```text
Requester rule/source
Manager_Level1_Approvers
Manager_Level1_Approval_Rule = ALL / ANY / UNKNOWN
Manager_Level2_Approvers, if applicable
Manager_Level2_Approval_Rule
GM_Level1_Approvers
GM_Level1_Approval_Rule
GM_Level2_Approvers, if applicable
GM_Level2_Approval_Rule
routing order/topology
HR final check behavior if evidenced
```

Possible topology examples only:

```text
M1 -> G1
M1 -> M2 -> G1
M1 -> G1 -> G2
M1 -> M2 -> G1 -> G2
```

Do not force a topology if evidence is incomplete.

# STEP 6 — EXACT 8-FLOW DISCOVERY MATRIX

Produce exactly one row per live TMG Team.

Required columns/content:

```text
Section_Code
Team exact value
Employee count
Requester rule/source
Manager L1 candidate(s)
Manager L1 Kintone user code(s)
Manager L1 rule
Manager L2 candidate(s), if any
Manager L2 Kintone user code(s)
Manager L2 rule
GM L1 candidate(s)
GM L1 Kintone user code(s)
GM L1 rule
GM L2 candidate(s), if any
GM L2 Kintone user code(s)
GM L2 rule
Topology
Legacy source app(s)
Source field/process state/group/record evidence
Confidence = VERIFIED / AMBIGUOUS / MISSING / NO_KINTONE_ACCOUNT
Exact unresolved question if not VERIFIED
```

A Team flow is VERIFIED only if all required active routing slots, routing order, and required rule(s) are supported by authoritative evidence.

# STEP 7 — ARCHITECTURE COMPATIBILITY CHECK ONLY

Assess whether current App795 model is compatible with Team-based routing.

Specifically inspect the implications of current:

```text
Section_Code unique
```

versus required business reality:

```text
TMG1 has 4 Team flows
TMG2 has 4 Team flows
```

Report only:

```text
APP795_TEAM_AWARE_CHANGE_REQUIRED = YES / NO / UNDETERMINED
```

If YES, provide the minimum safe design recommendation, for example conceptual fields such as:

```text
Routing_Key
Section_Code
Team
```

but DO NOT implement, rename, add, remove, or alter any field.

No App795 write authorization exists in this task.

# STEP 8 — NO-ORPHAN / TEST SAFETY

No new persistent runtime implementation should be created for this discovery unless absolutely necessary and justified.

Do not delete existing historical evidence.
Do not clean or remove live Kintone artifacts.

Run:

```bash
npm test
git diff --check
git status --short
```

Required:

```text
NO_ORPHAN_ARTIFACT_GATE = PASS
STALE_ACTIVE_REFERENCES = 0
KINTONE_WRITES_THIS_TASK = 0
```

# FINAL REQUIRED SUMMARY

Update living documentation / AI_REVIEW_PACKAGE only with sanitized findings.

Required final block:

```text
M7C_TMG_TEAM_ROUTING_DISCOVERY = COMPLETE / PENDING CHATGPT REVIEW

APP53_TEAM_FIELD = exact field code
TMG1_TEAM_COUNT = actual
TMG2_TEAM_COUNT = actual
EXPECTED_TOTAL_TEAM_FLOWS = 8

VERIFIED = X
AMBIGUOUS = X
MISSING = X
NO_KINTONE_ACCOUNT = X

APP795_TEAM_AWARE_CHANGE_REQUIRED = YES / NO / UNDETERMINED

KINTONE_GETS = actual
KINTONE_WRITES = 0
POST = 0
PUT = 0
PATCH = 0
DELETE = 0

APP53_MODIFIED = NO
APP795_MODIFIED = NO
LEGACY_APPS_MODIFIED = NO
SCHEMA_MODIFIED = NO
PROCESS_MANAGEMENT_MODIFIED = NO

NO_ORPHAN_ARTIFACT_GATE = PASS
npm test = actual / PASS

M7_WRITE_AUTHORIZATION = NO
NEXT_ACTION = CHATGPT + USER REVIEW ONLY
```

Do not mark M7 complete.
Do not proceed to M9.
Do not seed App795.
Do not alter routing schema.
Do not delete or clean old fields.

Commit only investigation/evidence documentation if required by current governance, push same branch, then STOP.
