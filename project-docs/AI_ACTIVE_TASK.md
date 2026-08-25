# AI ACTIVE TASK — M7E RESOLVE REMAINING 7 NON-TMG ROUTING FLOWS

> **Control Plane:** ChatGPT / Independent Reviewer
> **Execution Plane:** Antigravity standalone only
> **Repository:** `rebootob/MBO2026`
> **Branch:** `ai/antigravity-wp002c`
> **Mode:** READ-ONLY DISCOVERY ONLY — KINTONE WRITES = 0

# NORTH STAR

```text
M7A Requester Baseline              = PASS / 12 OF 12
M7C TMG Team Routing Discovery      = PASS / 7 OF 7 CURRENT TEAM FLOWS
M7D Team-Aware App795 Preflight     = PASS FOR PREFLIGHT / NO WRITE AUTHORIZATION
M7E Remaining Non-TMG Routing       = EXECUTE READ-ONLY DISCOVERY NOW
M7 OVERALL                          = OPEN
M9 FINAL ACCEPTANCE                 = BLOCKED_PENDING_FULL_M7
TODAY_DONE                          = NO
```

# TARGET

Resolve full routing for exactly these 7 Sections:

```text
TMF1
TMF2
TMF3
TMH1
TMH2
TMH3
TMT1
```

Already verified and OUT OF SCOPE for rediscovery:

```text
TME1
TMS1
TMT2
```

TMG routing is already handled separately:

```text
TMG1 = 4 Team flows VERIFIED
TMG2 = 3 Team flows VERIFIED
```

Do not reopen TMG discovery.

# HARD RULE — READ ONLY

This task is discovery only.

```text
KINTONE_WRITES = 0
POST = 0
PUT = 0
PATCH = 0
DELETE = 0
DEPLOY = 0
```

Do NOT:

- modify App795
- add Team
- add Routing_Key
- change Section_Code unique setting
- seed routing
- modify App53
- modify legacy applications
- change Process Management
- delete old fields
- migrate data
- execute M9

Before Kintone network access:

```js
delete process.env.KINTONE_API_TOKEN;
```

Use authorized read-only access only. Never expose credentials, auth headers, passwords, tokens, or unnecessary personal data.

# READ-ONLY SOURCES

Deep-read all authoritative evidence that can help resolve the 7 Sections:

```text
App53
App139
App795 current records
Legacy PMS Apps:
283
305
307
310
640
643
715
716
Kintone User Directory
Kintone Groups
Legacy Process Management
repository routing decisions/docs
```

Do not stop at schema inspection.

Inspect actual records, historical approver values, process states, groups, actors, and repeated historical patterns.

# REQUIRED ROUTING CONTRACT

For every Section determine:

```text
Section_Code
Requester_User

Manager_Level1_Approvers
Manager_Level1_Approval_Rule

Manager_Level2_Approvers if applicable
Manager_Level2_Approval_Rule

GM_Level1_Approvers
GM_Level1_Approval_Rule

GM_Level2_Approvers if applicable
GM_Level2_Approval_Rule

Routing topology/order
Active
Effective period if evidenced
```

Approval rule must be:

```text
ALL
ANY
UNKNOWN
```

Never assume ALL/ANY.

# IDENTITY RESOLUTION

Resolve approver identity using this evidence priority:

1. Exact Kintone user code in USER_SELECT or process actor
2. Exact Process Management user/group membership
3. Exact employee code/email uniquely matching App53 + Kintone User Directory
4. Exact name with one-and-only-one authoritative match
5. Repeated historical routing evidence consistent across multiple records

Never infer approver from job title alone.
Never choose automatically when two sources conflict.

# SPECIAL REQUIREMENT — EXPLAIN WHY IT WAS AMBIGUOUS

For each of the 7 Sections, explicitly report:

```text
PREVIOUS_AMBIGUITY_REASON
SOURCES_FOUND
CONFLICTING_CANDIDATES
RESOLUTION_EVIDENCE
```

Classify final result as:

```text
VERIFIED
AMBIGUOUS
MISSING
NO_KINTONE_ACCOUNT
```

A Section may be marked `VERIFIED` only when all required routing slots and routing order are proven.

# REQUIRED MATRIX

Produce exactly 7 rows:

```text
Section
Requester
Manager L1
Manager L1 Rule
Manager L2
Manager L2 Rule
GM L1
GM L1 Rule
GM L2
GM L2 Rule
Topology
Source App(s)
Process/Group/Field Evidence
Confidence
Remaining Question
```

# DO NOT CHANGE APP795 YET

The already-reviewed future App795 target remains conceptually:

```text
Routing_Key = unique
Section_Code = non-unique
Team = required for TMG routing context
```

But this task must NOT implement any of those changes.

Resolve the 7 remaining routing flows first so schema migration + routing seed can be done later in one controlled write window.

# NO-ORPHAN / SAFETY

Do not create duplicate discovery scripts or raw exports in Git.

Temporary inspectors must remain untracked and be removed afterward.

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

```text
M7E_NON_TMG_ROUTING_DISCOVERY = COMPLETE / PENDING CHATGPT REVIEW

TARGET_SECTIONS = 7
VERIFIED = X/7
AMBIGUOUS = X
MISSING = X
NO_KINTONE_ACCOUNT = X

TMG_ROUTING_REOPENED = NO
APP795_MODIFIED = NO
APP53_MODIFIED = NO
LEGACY_APPS_MODIFIED = NO
SCHEMA_MODIFIED = NO
PROCESS_MANAGEMENT_MODIFIED = NO

KINTONE_WRITES = 0
POST = 0
PUT = 0
PATCH = 0
DELETE = 0

npm test = actual / PASS
NO_ORPHAN_ARTIFACT_GATE = PASS

M7_WRITE_AUTHORIZATION = NO
M9_FINAL_ACCEPTANCE = BLOCKED_PENDING_FULL_M7

NEXT_ACTION = CHATGPT + USER REVIEW OF 7-SECTION ROUTING MATRIX
```

Update only the required living evidence/docs, commit and push to:

`ai/antigravity-wp002c`

Then STOP.
