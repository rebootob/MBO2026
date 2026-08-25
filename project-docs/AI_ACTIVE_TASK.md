# AI ACTIVE TASK — DELIVERY DAY SPRINT 03B: ACR-002 APPROVED / APP 795 ROUTING BASELINE SEED

> **Control Plane:** ChatGPT / Independent Reviewer
> **Execution Plane:** Antigravity standalone only
> **Repository:** `rebootob/MBO2026`
> **Branch:** `ai/antigravity-wp002c`
> **Reviewed head:** `55b85c4fed16701ee57801a73e1b9ff3f1aa81bd`
> **User authorization:** `ACR-002 APPROVED` on 2026-08-25
> **Mode:** CONTROLLED APP795 RECORD WRITE ONLY

# TODAY NORTH STAR — DO NOT DRIFT

```text
M4 App 797 Hoshin Master        = PASS
M5 App 798 Revision Archive     = PASS
M6 App 796 Scoring Baseline     = PASS / 8 OF 8 PUBLISHED
M7 App 795 Routing Baseline     = EXECUTE 11 MISSING MAPPINGS NOW
M8 App 800 HR Dashboard MVP     = PASS
M9 End-to-end Smoke Test        = NEXT IMMEDIATELY AFTER M7 REVIEW

TODAY_DONE = NO
NEXT_CRITICAL_PATH = APP795 12/12 -> CHATGPT REVIEW -> M9 END-TO-END SMOKE
```

# CONTROL PLANE DECISION

User explicitly approved `ACR-002 — Delivery-Day Acceleration of DEC-034 Routing Seed Boundary`.

This approval changes SCHEDULING ONLY. It does not change business architecture, routing model, requester assignments, or retired-section rules.

Update DECISIONS.md:

```text
ACR-002 Status = APPROVED BY USER / ACTIVE FOR SPRINT03B ONLY
Approval date = 2026-08-25
Supersedes DEC-034 timing boundary only for the 11 missing requester baseline records
DEC-019 architecture remains unchanged
DEC-031 requester mapping remains unchanged
DEC-032 TMT3 retirement remains unchanged
```

After Sprint03B completes and is independently reviewed, ACR-002 write window is CLOSED. Do not treat it as permanent broad App795 authorization.

# EXACT TARGET BASELINE

Existing record to KEEP if exact:

```text
TME1 -> e1
```

Create only these 11 missing active requester mappings:

```text
TMF1 -> f1
TMF2 -> f2
TMF3 -> f3
TMG1 -> g_request
TMG2 -> g_request
TMH1 -> tmh
TMH2 -> tmh
TMH3 -> tmh
TMS1 -> s1
TMT1 -> t1
TMT2 -> t2
```

Strict exclusion:

```text
TMT3 = RETIRED / MUST NOT EXIST AS NEW ACTIVE BASELINE RECORD
```

Section_Name must come from the already verified Sprint03A preflight / approved source. NEVER guess a Section_Name.

Do not populate unverified approver slots. This acceleration is REQUESTER BASELINE ONLY.

# STEP 0 — GIT / SECURITY / SCOPE PRECONDITIONS

Require:

```text
branch = ai/antigravity-wp002c
55b85c4... is ancestor
local HEAD = origin branch before work
tracked tree clean
```

No reset/rebase/force push/history rewrite.

Read at minimum:

```text
project-docs/AI_ACTIVE_TASK.md
project-docs/CURRENT_STATE.md
project-docs/HANDOFF.md
project-docs/AI_REVIEW_PACKAGE.md
project-docs/DECISIONS.md
project-docs/APP_REGISTRY.md
project-docs/BUSINESS_RULES.md
config/sandbox-apps.json
config/schema-spec.js
src/core/sandbox-write-guard.js
```

Inspect existing App795-related scripts/tests before adding anything.

`.env.local`:

```text
ignored = YES
tracked = NO
printed = NO
committed = NO
```

Before any live network operation:

```js
delete process.env.KINTONE_API_TOKEN;
```

Use username/password authentication only.
Never print credentials, auth headers, or full User API payloads.

Protected apps remain permanently READ ONLY:

```text
53, 283, 305, 307, 310, 640, 643, 715, 716
```

Zero writes also to:

```text
794, 796, 797, 798, 800
```

Only App795 record creation is authorized.

# STEP 1 — ACR/DOC STATE + CURRENT DOC OBSERVATIONS

Update ACR-002 from PROPOSED to APPROVED BY USER.

While touching living docs, reconcile these already-known observation-level stale current values WITHOUT opening another cleanup sprint:

- current Active Sandbox Apps list must include 794,795,796,797,798,800
- current test total must use actual latest test total after this sprint, not stale 471/471
- current M6/App796 = 8/8 published
- current M7 = controlled write authorized by approved ACR-002
- historical state may remain historical

Do not rewrite historical forensic evidence.

# STEP 2 — EXACT APP795 READ-ONLY PREFLIGHT BEFORE CODE WRITE PATH

Before any App795 write, GET and verify:

```text
registry routingMasterAppId = 795
exact expected sandbox app identity
live + preview field schema
live + preview app ACL
all existing routing records required to determine active coverage
```

Verify:

```text
current active coverage = exactly 1/12
existing exact pilot = TME1 -> e1
no unexpected active duplicate section mappings
no active TMT3 record
all 11 target Section_Codes are currently missing
```

If ANY of these differ, STOP WITH ZERO WRITES and report exact safe drift summary. Do not merge/repair/delete automatically.

Reverify the 9 requester user accounts through the read-only User API before write. Require all expected codes valid/existing. Do not print user details.

Required prewrite state:

```text
APP795_PREFLIGHT_GATE = PASS
CURRENT_ACTIVE_COVERAGE = 1/12
TME1_PILOT_GATE = PASS
TARGET_11_ALL_MISSING_GATE = PASS
TMT3_ACTIVE_RECORD_GATE = PASS (none)
REQUESTER_ACCOUNT_GATE = 9/9 PASS
```

# STEP 3 — DURABLE PREWRITE BACKUP

Before App795 write create NEW retained backup:

```text
backups/delivery-sprint-03b/app795/<UTC_TIMESTAMP>/
```

Capture enough state for exact rollback/reconciliation:

```text
live settings
preview settings
live fields
preview fields
live ACL
preview ACL
all existing App795 records
record count
active routing count
```

Create SHA-256 manifest.
Retain until ChatGPT independent review.
Do not commit raw backup.
Do not overwrite/delete prior backups.

# STEP 4 — IMPLEMENT ONE CONTROLLED ROUTING BASELINE SEEDER

Search first for an existing App795 seed/publisher script.

- If a suitable existing script exists, modify/reuse it.
- If none exists, create exactly ONE justified script:

```text
scripts/kintone/seed-routing-baseline.js
```

Do not create duplicate helper/domain files.

The script must use `config/sandbox-apps.json` for App ID, not hardcode business behavior into multiple places.

Create path rules:

```text
POST only to /k/v1/record.json
body.app must equal 795
one record per POST, sequentially
maximum successful creates = 11
PUT = 0
DELETE = 0
schema writes = 0
deploy = 0
```

Before each POST enforce exact process-local App795 allow-list through the existing sandbox write guard pattern:

```text
assertSandboxWriteTarget(795, registry, [795], { dryRunBypassDiscovery: true })
```

Use a narrow transport that rejects:

```text
wrong app
PUT
DELETE
PATCH
unapproved endpoint
unexpected body shape
```

No blind retry after uncertain POST.

# STEP 5 — RECORD PAYLOAD EXACTNESS

For each of the 11 records, payload must contain ONLY the existing approved App795 requester-baseline fields necessary for the current live schema.

At minimum semantic values must resolve to:

```text
Section_Code = exact target code
Section_Name = exact verified approved name
Requester_User = exact verified user code
Active = Active
```

If the live schema requires additional fields, use only fields already frozen/verified by existing architecture and preflight evidence. Do NOT invent approver identities or new business defaults.

Before first write, construct an exact in-memory manifest of 11 records and validate:

```text
count = 11
Section_Code unique = 11
none = TME1
none = TMT3
all Section_Name non-empty and verified
all Requester_User from approved mapping
all Active = Active
```

# STEP 6 — AUTOMATED TESTS BEFORE LIVE WRITE

Add tests to the most relevant existing routing/safety test file. Avoid unnecessary new test files.

Minimum coverage:

```text
exact 11-create manifest
exact requester mapping per section
TME1 excluded from CREATE manifest
TMT3 excluded
duplicate section rejected
unknown section rejected
empty/unverified Section_Name rejected
unknown requester rejected
wrong app rejected
PUT/DELETE/PATCH rejected
POST body.app must be 795
max create set = exact 11
write guard only [795]
no schema/deploy paths
NO_ORPHAN: exactly one active routing seeder implementation
```

Run full `npm test` before live write. Zero failures.

Commit code/tests and ACR approval/current-doc prep exactly:

```text
feat: add controlled app795 routing baseline seed
```

Push BEFORE live write.

# STEP 7 — LIVE WRITE: APP795 ONLY

Run the committed script exactly once after tests + backup + preflight pass.

Expected write budget:

```text
App795 POST record creates = 11
App795 PUT = 0
App795 DELETE = 0
App795 schema/deploy = 0
other sandbox app writes = 0
protected app writes = 0
```

Sequential operation only.

If any POST is uncertain/fails:

- STOP immediately
- NO retry
- NO automatic delete
- perform GET-only exact reconciliation
- identify exact successfully-created sections vs missing sections
- retain backup
- mark M7 = BLOCKED_PARTIAL
- return for ChatGPT review

# STEP 8 — FINAL APP795 READBACK

On successful sequence, GET all relevant records and require:

```text
active baseline count = exactly 12
exact sections = TME1, TMF1, TMF2, TMF3, TMG1, TMG2, TMH1, TMH2, TMH3, TMS1, TMT1, TMT2
one active record per Section_Code
TME1 -> e1 unchanged
all 11 newly created requester mappings exact
TMT3 active count = 0
no duplicate active sections
```

Verify 12/12 business baseline by field values, not merely record count.

Required:

```text
M7_ROUTING_BASELINE_GATE = PASS
M7_ACTIVE_COVERAGE = 12/12
M7_DUPLICATE_ACTIVE_SECTION_COUNT = 0
M7_TMT3_ACTIVE_COUNT = 0
```

# NO-ORPHAN / CLEANUP RULE

Mandatory project rule remains active.

This sprint MUST NOT create dead/duplicate scripts, temp JSON manifests, walkthrough files, local discovery exports, or other unneeded Git artifacts.

If an old routing seed artifact is superseded by the implementation, safely reconcile/remove the old active artifact after verifying references.

Never delete live Kintone records merely because they look old without a separately approved migration/cleanup plan.

Required:

```text
NO_ORPHAN_ARTIFACT_GATE = PASS
STALE_ACTIVE_REFERENCES = 0
```

# STEP 9 — EVIDENCE / CLOSE WRITE WINDOW

Run full `npm test` again after live write.

Update living docs:

```text
M6 = PASS / 8/8 PUBLISHED
M7 = PASS / 12/12 ACTIVE REQUESTER BASELINE
M8 = PASS
ACR-002 = APPROVED / EXECUTED / WRITE WINDOW CLOSED
M9 = NEXT
```

AI_REVIEW_PACKAGE must record:

```text
SPRINT03B = COMPLETE / PENDING CHATGPT REVIEW
ACR_002_USER_APPROVAL = YES
APP795_PREWRITE_BACKUP_PATH = safe path
APP795_BACKUP_MANIFEST_SHA256 = value
APP795_PREWRITE_ACTIVE_COVERAGE = 1/12
APP795_POST_COUNT = actual
APP795_PUT_COUNT = 0
APP795_DELETE_COUNT = 0
APP795_SCHEMA_DEPLOY_WRITES = 0
APP795_FINAL_ACTIVE_COVERAGE = actual
TMT3_ACTIVE_COUNT = 0
DUPLICATE_ACTIVE_SECTION_COUNT = 0
App794/796/797/798/800 writes = 0
protected writes = 0
records created = actual
NO_ORPHAN_ARTIFACT_GATE = PASS
STALE_ACTIVE_REFERENCES = 0
npm test = actual total / PASS
ACR_002_WRITE_WINDOW = CLOSED
NEXT_ACTION = M9 END-TO-END SMOKE TEST
```

Preserve Stage3C historical evidence exception unchanged.

Commit exactly:

```text
docs: record app795 routing baseline seed evidence
```

Push; verify local HEAD = remote HEAD; tracked tree clean; STOP.

# STRICT OUT OF SCOPE

Do NOT:

- write App794
- write App796/797/798/800
- modify App795 schema
- delete/update TME1
- seed TMT3
- guess approver slots
- implement twin-status engine here
- implement M9 in same task
- add fake/test Kintone records
- remove App795 legacy fields in this task
- touch protected production apps

# REVIEW EXPECTATION

```text
ACR002_APPROVAL_GATE = PASS expected
APP795_PREFLIGHT_GATE
APP795_PREWRITE_BACKUP_GATE
APP795_EXACT_11_MANIFEST_GATE
APP795_WRITE_GUARD_GATE
APP795_11_CREATE_GATE
APP795_12_OF_12_READBACK_GATE
APP795_TME1_PRESERVATION_GATE
APP795_TMT3_EXCLUSION_GATE
APP795_DUPLICATE_ACTIVE_GATE
OTHER_SANDBOX_ZERO_WRITE_GATE
PROTECTED_ZERO_WRITE_GATE
NO_ORPHAN_ARTIFACT_GATE
REGRESSION_GATE
DOC_EVIDENCE_CONSISTENCY_GATE
GIT_PUSH_SYNC_GATE
DELIVERY_SPRINT_03B_GATE
```
