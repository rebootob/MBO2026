# AI ACTIVE TASK — M7B-R1 DEEP LEGACY ROUTING RESOLUTION

> **Control Plane:** ChatGPT / Independent Reviewer
> **Execution Plane:** Antigravity standalone only
> **Repository:** `rebootob/MBO2026`
> **Branch:** `ai/antigravity-wp002c`
> **Reviewed head:** `220b4d07d44dacd3444f71ad3c56fe8e2dc92dd7`
> **Mode:** READ-ONLY LEGACY DATA RESOLUTION — KINTONE WRITES = 0

# NORTH STAR

```text
M7A Requester Baseline 12/12 = PASS
M7B Full Routing Flow         = 1/12 VERIFIED, 11/12 AMBIGUOUS
M7 OVERALL                    = OPEN
M9 FINAL ACCEPTANCE           = BLOCKED_PENDING_M7B
TODAY_DONE                    = NO

NEXT_CRITICAL_PATH = DEEP-READ OLD PMS APPS -> RESOLVE LEGACY APPROVER NAMES/ROLES -> MAP TO KINTONE USERS -> USER REVIEW -> M7B WRITE
```

# PURPOSE

The previous M7B discovery confirmed that requester mappings are complete but 11 sections still have ambiguous manager/GM approvers because legacy records contain free-text or non-canonical approver data.

This task performs a deeper READ-ONLY investigation of the old PMS applications and related employee/user sources before asking the user to fill routing manually.

Do not guess approvers. Do not write anything to Kintone.

# TARGET ACTIVE SECTIONS

```text
TME1
TMF1
TMF2
TMF3
TMG1
TMG2
TMH1
TMH2
TMH3
TMS1
TMT1
TMT2
```

TMT3 remains retired/excluded.

# READ-ONLY SOURCES TO INSPECT DEEPLY

Protected legacy PMS apps:

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

Also inspect when useful:

```text
App53 Employee Namelist / organization data
App795 current routing records and schema
Kintone User API / organization/user directory read-only
repository routing/process docs and historical evidence
legacy process-management settings from each PMS app
```

# REQUIRED DEEP INSPECTION PER LEGACY APP

For each old PMS app, do not stop at field/schema inventory. Read enough existing records and process configuration to understand actual approver behavior.

Identify fields that may represent:

```text
Section / Department
Employee Code / Employee Name
Requester / Creator
Manager / First Manager / Section Manager
Second Manager / Senior Manager
GM / DGM / General Manager
Approver / Evaluator / Appraiser
Approval status / process assignee
Created By / Updated By where relevant
```

Inspect actual field TYPES and actual stored VALUES. Distinguish:

```text
USER_SELECT
ORGANIZATION_SELECT
GROUP_SELECT
SINGLE_LINE_TEXT / free text
Creator / Modifier system fields
Process assignee/action settings
```

Do not assume a free-text person name equals a Kintone user account.

# NAME / IDENTITY RESOLUTION

For every legacy approver candidate, try to resolve identity using authoritative evidence, in this order:

1. Exact Kintone USER_SELECT code already stored in legacy record/process configuration.
2. Exact employee code or email matching App53 and Kintone User API.
3. Exact full name with one-and-only-one match across App53 + Kintone User API.
4. Organization + position + name combination with one-and-only-one match.

If multiple people can match, classify AMBIGUOUS.
If no Kintone user account exists, classify NO_KINTONE_ACCOUNT and report the exact business role/name without inventing an account.

Do not expose unnecessary personal details in docs; exact user codes may be included in the review matrix when needed for approval, but omit unrelated user profile data.

# PROCESS-MANAGEMENT EVIDENCE

Inspect each legacy PMS app process management READ ONLY.

Determine whether approval actors are defined by:

```text
fixed users
field-based users
organizations/groups
creator/record owner
status/action assignees
```

Use this to reconstruct real historical routing rather than relying only on record free-text fields.

# SECTION-LEVEL OUTPUT

Produce one exact row for each active section:

```text
Section_Code
Requester_User
Manager_Level1 candidate(s)
Manager_Level1 source(s)
Manager_Level1 rule ALL/ANY if evidenced
Manager_Level2 candidate(s), if any
Manager_Level2 source(s)
Manager_Level2 rule
GM_Level1 candidate(s)
GM_Level1 source(s)
GM_Level1 rule
GM_Level2 candidate(s), if any
GM_Level2 source(s)
GM_Level2 rule
Topology
Legacy source app(s)
Identity resolution result
Confidence = VERIFIED / AMBIGUOUS / MISSING / NO_KINTONE_ACCOUNT
Exact unresolved question if not VERIFIED
```

A section may be VERIFIED only when every required active routing slot has authoritative identity evidence and routing order/rule evidence.

# CROSS-CHECK RULES

Cross-check candidate approvers against:

```text
App53 employee department/section/position
Kintone user existence
legacy app process settings
multiple legacy records from the same section
multiple years if available
```

Prefer consistent repeated evidence over a single old record.

If legacy years differ, report the latest relevant routing and show that historical routing changed. Do not silently choose one.

# WRITE SAFETY

Kintone writes = 0.

Never call POST/PUT/PATCH/DELETE/deploy/status-transition endpoints.

Protected apps remain READ ONLY:

```text
53,283,305,307,310,640,643,715,716
```

Sandbox apps also READ ONLY in this task:

```text
794,795,796,797,798,800
```

Before live calls:

```js
delete process.env.KINTONE_API_TOKEN;
```

Use username/password auth only. Never print credentials/auth headers.

# REPOSITORY / NO-ORPHAN

Prefer existing read-only utilities. Do not create duplicate discovery scripts or committed raw exports.

If a temporary local inspector is necessary, keep it untracked and delete it after use.

Do not commit raw Kintone record dumps, screenshots, temp JSON, or personal data exports.

Required:

```text
NO_ORPHAN_ARTIFACT_GATE = PASS
STALE_ACTIVE_REFERENCES = 0
```

# FINAL EVIDENCE

Update living docs and AI_REVIEW_PACKAGE with a concise exact matrix and counts.

Required final status:

```text
M7A_REQUESTER_BASELINE = PASS / 12/12
M7B_DEEP_LEGACY_RESOLUTION = COMPLETE / PENDING CHATGPT REVIEW
M7B_VERIFIED_COUNT = actual / 12
M7B_AMBIGUOUS_COUNT = actual
M7B_MISSING_COUNT = actual
M7B_NO_KINTONE_ACCOUNT_COUNT = actual
KINTONE_WRITES_THIS_TASK = 0
PROTECTED_WRITES_THIS_TASK = 0
NO_ORPHAN_ARTIFACT_GATE = PASS
npm test = actual / PASS
M7B_WRITE_AUTHORIZATION = NO
NEXT_ACTION = CHATGPT + USER REVIEW OF RESOLVED ROUTING MATRIX
```

Do not claim M7 complete unless all 12 are VERIFIED.
Do not execute any routing write in this task.

Commit/push same branch, then STOP.
