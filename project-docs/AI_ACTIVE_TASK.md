# AI ACTIVE TASK — M10F APP794 RUNTIME ADAPTER REPOSITORY IMPLEMENTATION

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Reviewed Head: `2de27c5c21bcf91bd2114cc84202a0d5b781e327`
> Mode: REPOSITORY CODE IMPLEMENTATION + TESTS ONLY — NO KINTONE WRITE / NO CUSTOMIZATION DEPLOY

# NORTH STAR

```text
Apps foundation          = READY
App795 routing           = READY 17/17
App796 scoring           = READY 8/8
App800 dashboard         = LIVE
Kintone-only PATH_B      = SELECTED
M10E runtime preflight   = PASS

THIS TASK:
Implement the repository-side App794 runtime adapter so employee context resolves from App53,
routing from App795, scoring from App796, and App794 receives fail-closed runtime behavior.
Do not deploy to Kintone in this task.
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

# IMPLEMENTATION SCOPE

Modify existing modules first:

```text
src/main-mbo-app.js
src/services/routing-service.js
src/services/employee-service.js
src/profiles/profile-scoring-resolver.js
src/ui/employee-part-a-ui.js
```

Create a new file only if separation of concerns clearly requires it.
No `_old`, `_v1`, duplicate service, duplicate resolver, or dead helper.

# REQUIRED RUNTIME FLOW

```text
App794 employee context
  -> App53 READ ONLY lookup
  -> derive Section + Team + Position/Profile context
  -> build Routing_Key
  -> App795 exact route resolution
  -> Requester_User + Manager/GM routing
  -> App796 exact published scoring profile resolution
  -> normalized runtime result for App794
```

Rules:

```text
TMG1/TMG2: Routing_Key = Section_Code + "|" + Team
Non-TMG:   Routing_Key = Section_Code

Requester_User = workflow/request submission identity only
Requester_User != employee authentication identity
Shared Kintone account != individual employee identity
```

# FAIL-CLOSED RULES

Implementation must stop business progression on:

```text
employee not found
required Section missing
TMG Team missing
routing not found
routing duplicate
inactive routing
scoring profile not found
scoring profile duplicate
invalid/unpublished scoring profile
```

No stale hardcoded routing/scoring fallback.
No silent first-match behavior on duplicates.
No guessed field mapping.

# APP53 CONTRACT

App53 remains authoritative Employee Master and READ ONLY.
Use the exact field mapping frozen by M10E.
Do not duplicate employee master data into new config files.

# APP795 CONTRACT

Use current team-aware routing model only:

```text
17/17 active routing baseline
TMG1 = 4 teams
TMG2 = 3 teams
non-TMG = section-only
Routing_Key unique
Section_Code intentionally non-unique for TMG
```

Approver data must come from App795 only.

# APP796 CONTRACT

Use published/current scoring configuration only.
Preserve frozen source-of-truth behavior and exact 8-profile baseline.
Do not reintroduce hardcoded scoring ratios as runtime fallback.

# UI / ERROR BEHAVIOR

Implement minimal user-facing resolution states using existing UI structures where possible:

```text
employee not found
missing section/team
routing configuration error
scoring configuration error
successful resolution
```

Messages must be understandable but must not expose internal secrets/configuration unnecessarily.
Do not redesign unrelated dashboard/UI.

# TEST REQUIREMENTS

Add/extend automated tests for at least:

```text
non-TMG route success
TMG1 team route success
TMG2 team route success
TMG missing team fail-closed
unknown employee fail-closed
missing route fail-closed
duplicate route fail-closed
inactive route fail-closed
valid published scoring resolution
missing scoring fail-closed
duplicate scoring fail-closed
Requester_User mapping
no stale hardcoded route fallback
no stale hardcoded scoring fallback
```

Run full suite:

```bash
npm test
git diff --check
git status --short
```

# NO-ORPHAN GATE

After implementation:

```text
search for replaced runtime logic
remove obsolete active implementations when safe
remove unused imports/helpers/config keys
no duplicate route/scoring resolver path
no dead implementation files
NO_ORPHAN_ARTIFACT_GATE = PASS
```

If an old artifact must remain for historical compatibility, document the exact active reason; otherwise remove it.

# REQUIRED FINAL SUMMARY

```text
M10F_APP794_RUNTIME_REPOSITORY_IMPLEMENTATION = COMPLETE / BLOCKED

FILES_CHANGED = exact
NEW_FILES_CREATED = exact / NONE
APP53_RUNTIME_LOOKUP = IMPLEMENTED / BLOCKED
APP795_TEAM_AWARE_ROUTING = IMPLEMENTED / BLOCKED
APP796_SCORING_RESOLUTION = IMPLEMENTED / BLOCKED
REQUESTER_USER_MAPPING = IMPLEMENTED / BLOCKED
FAIL_CLOSED_RUNTIME = PASS / FAIL
STALE_HARDCODED_ROUTING_FALLBACK = 0 / actual
STALE_HARDCODED_SCORING_FALLBACK = 0 / actual

KINTONE_WRITES_THIS_TASK = 0
APP794_CUSTOMIZATION_DEPLOY = 0
npm test = actual / PASS
GIT_DIFF_CHECK = PASS/FAIL
NO_ORPHAN_ARTIFACT_GATE = PASS/BLOCKED
GIT_PUSH_SYNC = PASS/FAIL

NEXT_ACTION = CHATGPT CODE REVIEW ONLY
```

Update only living docs needed to record factual implementation state.
Commit and push same branch, then STOP.

Do NOT deploy App794 customization.
Do NOT modify Kintone schema/process/records.
Do NOT touch App53/App795/App796/App801 state.
