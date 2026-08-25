# AI ACTIVE TASK — M10F-R1 TMG EXACT ROUTING MUST-FIX

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Reviewed Head: `002728311c23096f80df06ab6325a4de2ea5a5df`
> Mode: REPOSITORY CODE FIX + TESTS ONLY — NO KINTONE WRITE / NO DEPLOY

# NORTH STAR

```text
Apps foundation              = READY
App795 routing               = READY 17/17
App796 scoring               = READY 8/8
App800 dashboard             = LIVE
M10F implementation          = COMPLETE WITH 1 MUST-FIX

THIS TASK:
Close the TMG routing safety defect before App794 deployment.
TMG1/TMG2 must use exact Section|Team routing only and must never fall back to Section-only routing.
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
```

# REQUIRED FIX

Modify existing `src/services/routing-service.js` only as needed.

Required behavior:

```text
TMG1/TMG2:
- Team is mandatory.
- Query exact Routing_Key = Section_Code + "|" + Team.
- If exact route not found => FAIL CLOSED.
- If duplicate exact route => FAIL CLOSED.
- NEVER fall back to Section_Code-only lookup.

Non-TMG:
- Use Section-only routing.
- Preserve existing intended behavior.
```

Do not infer TMG status from the mere presence of a Team value. Use exact section rule for `TMG1` and `TMG2`.

# REQUIRED REGRESSION TESTS

Extend existing routing tests. At minimum add:

```text
TMG1 exact route success
TMG2 exact route success
TMG1 missing Team => fail closed
TMG2 missing Team => fail closed
TMG exact route missing => fail closed and prove NO section fallback query occurs
Non-TMG route remains section-only
Duplicate exact TMG route => fail closed
```

Keep existing tests passing.

# NO-ORPHAN / CLEANUP

Do not create a second routing service or helper unless strictly necessary.
Remove obsolete fallback logic for TMG rather than leaving dead branches/comments.
No `_old`, `_v1`, duplicate resolver, or stale workaround.

# VERIFY

Run:

```bash
npm test
git diff --check
git status --short
```

Required final summary:

```text
M10F_R1_TMG_EXACT_ROUTING_FIX = COMPLETE / BLOCKED
TMG_SECTION_FALLBACK = REMOVED / STILL_PRESENT
TMG_MISSING_TEAM_FAIL_CLOSED = PASS/FAIL
TMG_EXACT_ROUTE_MISSING_FAIL_CLOSED = PASS/FAIL
NON_TMG_SECTION_ROUTING = PASS/FAIL
TEST_COUNT = actual
npm test = PASS/FAIL
KINTONE_WRITES_THIS_TASK = 0
APP794_CUSTOMIZATION_DEPLOY = 0
GIT_DIFF_CHECK = PASS/FAIL
NO_ORPHAN_ARTIFACT_GATE = PASS/BLOCKED
GIT_PUSH_SYNC = PASS/FAIL
NEXT_ACTION = CHATGPT REVIEW ONLY
```

Commit and push same branch, then STOP.

Do NOT deploy App794.
Do NOT change Kintone schema/process/records.
Do NOT modify routing master data.
