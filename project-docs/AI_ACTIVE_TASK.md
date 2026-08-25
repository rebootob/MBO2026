# AI ACTIVE TASK — M7C-R1 RESOLVE TMG2 FOURTH TEAM DISCREPANCY (READ ONLY)

> **Control Plane:** ChatGPT / Independent Reviewer
> **Execution Plane:** Antigravity standalone only
> **Repository:** `rebootob/MBO2026`
> **Branch:** `ai/antigravity-wp002c`
> **Reviewed head:** `95d5eabca55d6102aa703d1843d87c338fd354d1`
> **Mode:** READ-ONLY DISCREPANCY RESOLUTION / EVIDENCE ONLY — KINTONE WRITES = 0

# NORTH STAR

```text
M7A Requester Baseline              = PASS / 12 OF 12 SECTIONS
M7B Section-Level Routing           = OPEN
M7C TMG Team-Based Routing          = PARTIAL
TMG1                                = 4/4 Team flows VERIFIED
TMG2                                = 3/4 Team flows VERIFIED
TMG2 FOURTH TEAM                    = MISSING / MUST RESOLVE
M7 OVERALL                          = OPEN
M9 FINAL ACCEPTANCE                 = BLOCKED_PENDING_M7
TODAY_DONE                          = NO
```

# CONTROL-PLANE REVIEW FINDING

The previous M7C discovery correctly performed READ-ONLY analysis and verified:

```text
APP53_TEAM_FIELD = Drop_down_2
TMG1 active Team values = Admin, CAD, Marketing, Production
TMG2 observed active Team values = CAD, Marketing, Production
```

However, the user has explicitly confirmed the business rule:

```text
TMG1 = 4 routing lines divided by Team
TMG2 = 4 routing lines divided by Team
```

Therefore the expected M7C target remains:

```text
EXPECTED_TOTAL_TEAM_FLOWS = 8
```

Do NOT redefine the target to 7 merely because the current active App53 query returned only 3 TMG2 Team values.

Treat the missing fourth TMG2 routing line as a discrepancy requiring READ-ONLY investigation.

Current known verified TMG flows from prior evidence:

```text
TMG1 Admin       -> amporn / uchida
TMG1 CAD         -> phubodin / uchida
TMG1 Marketing   -> natta / uchida
TMG1 Production  -> prompan / uchida
TMG2 CAD         -> phubodin / uchida
TMG2 Marketing   -> natta / uchida
TMG2 Production  -> prompan / uchida
```

The unresolved business line is provisionally referred to as:

```text
TMG2 fourth Team / possible historical Admin line
```

Do NOT assume the exact Team value is `Admin` until proven from authoritative evidence.

# PURPOSE

Determine why live/current App53 returns only 3 TMG2 Team values while the business owner confirms 4 TMG2 Team routing lines.

Possible causes to investigate, without assuming any one is correct:

```text
1. fourth Team currently has zero active employees
2. fourth Team exists only in inactive/former employee records
3. Team value was renamed or normalized historically
4. Section changed while routing line remains valid
5. App53 active-status filtering excluded the Team
6. Team value is blank/malformed/legacy alias in App53
7. App139/legacy routing contains a valid fourth TMG2 line independent of current employee population
8. current App53 data quality issue
```

The task is discovery only. No implementation or correction is authorized.

# HARD SAFETY RULE — READ ONLY

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
NO App53 modification
NO App795 modification
NO App139 modification
NO legacy app modification
NO cleanup
NO migration
NO routing seed
NO status transition
```

Required:

```text
KINTONE_WRITES_THIS_TASK = 0
APP53_MODIFIED = NO
APP795_MODIFIED = NO
APP139_MODIFIED = NO
LEGACY_APPS_MODIFIED = NO
SCHEMA_MODIFIED = NO
PROCESS_MANAGEMENT_MODIFIED = NO
```

Before Kintone network access:

```js
delete process.env.KINTONE_API_TOKEN;
```

Use authorized username/password authentication only.
Never print credentials, auth headers, passwords, tokens, or unnecessary employee personal data.

# STEP 0 — GIT SAFETY

Require:

```text
branch = ai/antigravity-wp002c
95d5eabc... is ancestor
local HEAD = origin branch
tracked tree clean before execution
```

No reset/rebase/force push/history rewrite.

Do not create duplicate runtime scripts.
Use existing read-only utilities first.
Temporary local inspection helpers must remain untracked and be removed after use.
Do not commit raw record dumps or personal-data exports.

# STEP 1 — RECHECK APP53 WITHOUT LOSING HISTORICAL SIGNAL

Verify exact App53 field codes again for:

```text
Employee Code
Section
Team
Position
employment/active status
other status fields used to exclude former/inactive employees
```

Confirm Team field remains:

```text
Drop_down_2
```

Then inspect TMG2 across multiple populations separately:

```text
A. currently active employees only
B. all visible TMG2 records regardless of active status
C. former/inactive employees historically assigned to TMG2
D. records whose Team is blank or unusual
E. records whose Section historically/currently resembles TMG2 but may have changed
```

Produce exact distinct Team values and counts for each population.

Do not publish employee names unless necessary for a specific routing proof.

Required questions:

```text
Does a fourth TMG2 Team value exist anywhere in App53?
If yes, what exact value is stored?
Is it currently zero-active but historically populated?
Was it renamed?
Is there evidence of data-quality drift?
```

# STEP 2 — DEEP SEARCH APP139 FOR THE FOURTH TMG2 LINE

App139 is an approved READ-ONLY evidence source for this task.

Inspect schema, actual historical records, views, customizations if relevant, and Process Management.

Search specifically for TMG2 routing evidence using:

```text
TMG2
Section-Team
Team field
Text_8 / Team
Text_3 / Section-Team
Manager-G / GM-G process states if present
all historical TMG-related statuses/groups/actions
records with TMG2 and unusual/missing Team values
```

Determine whether App139 proves a fourth TMG2 routing line even if no current App53 employee occupies that Team.

Capture provenance:

```text
Team exact value
legacy status/process state
group/user actor
manager approver
GM approver
historical record evidence
latest/representative dates where useful
```

# STEP 3 — SEARCH OTHER LEGACY PMS APPS READ ONLY

Inspect when relevant:

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

Look for any TMG2-specific fourth branch using:

```text
TMG2
Team values
Section-Team combinations
Manager/GM approval groups
process states
historical records
routing code/customization references
```

If a fourth branch is represented by a group/status name rather than Team text, cross-link it back to App53/App139 evidence before classifying VERIFIED.

# STEP 4 — KINTONE USER / GROUP IDENTITY RESOLUTION

For any candidate fourth-line approver, cross-check against:

```text
Kintone User Directory
Kintone Groups used by legacy process management
App53 employee identity
historical record values
```

Do not infer identities from titles alone.
Do not guess between conflicting candidates.

Classify candidate fourth flow as:

```text
VERIFIED
AMBIGUOUS
MISSING
NO_KINTONE_ACCOUNT
```

# STEP 5 — RECONSTRUCT EXACT TMG2 FOUR-LINE MATRIX

Final target must remain four conceptual TMG2 lines:

```text
TMG2 | <Team exact value 1>
TMG2 | <Team exact value 2>
TMG2 | <Team exact value 3>
TMG2 | <Team exact value 4>
```

For each line report:

```text
Team exact value
Current active employee count
Historical employee count if available
Requester rule/source
Manager L1 user code(s)
Manager L1 rule
Manager L2 if any
GM L1 user code(s)
GM L1 rule
GM L2 if any
Topology
Evidence sources
Confidence
Unresolved question
```

Do NOT invent the fourth Team label.

If current App53 still has only three distinct active Team values but historical evidence proves a fourth routing line, report both facts separately:

```text
TMG2_ACTIVE_TEAM_VALUES_CURRENT = 3
TMG2_BUSINESS_ROUTING_LINES = 4
TMG2_FOURTH_LINE_CURRENT_POPULATION = 0 / unknown
```

# STEP 6 — ARCHITECTURE CONSEQUENCE ONLY

Do not change App795.

Reconfirm whether Team-aware routing is required.

Expected likely state remains:

```text
APP795_TEAM_AWARE_CHANGE_REQUIRED = YES
```

But report from evidence, not assumption.

The future design must be able to retain a valid routing line even when a Team has zero currently active employees, if the business route still exists.

Recommendation only. No schema implementation.

# STEP 7 — TEST / NO-ORPHAN

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

Update current/living documentation and AI_REVIEW_PACKAGE with sanitized findings only.

Required final block:

```text
M7C_R1_TMG2_FOURTH_TEAM_DISCOVERY = COMPLETE / PENDING CHATGPT REVIEW

APP53_TEAM_FIELD = exact
TMG1_BUSINESS_ROUTING_LINES = 4
TMG2_BUSINESS_ROUTING_LINES = 4
EXPECTED_TOTAL_TEAM_FLOWS = 8

TMG2_ACTIVE_TEAM_VALUES_CURRENT = actual
TMG2_ALL_VISIBLE_TEAM_VALUES = exact count
TMG2_FOURTH_TEAM_EXACT_VALUE = exact / UNRESOLVED
TMG2_FOURTH_TEAM_CURRENT_ACTIVE_COUNT = actual / unknown
TMG2_FOURTH_FLOW_STATUS = VERIFIED / AMBIGUOUS / MISSING / NO_KINTONE_ACCOUNT

M7C_VERIFIED = X / 8
M7C_AMBIGUOUS = X
M7C_MISSING = X
M7C_NO_KINTONE_ACCOUNT = X

APP795_TEAM_AWARE_CHANGE_REQUIRED = YES / NO / UNDETERMINED

KINTONE_WRITES = 0
POST = 0
PUT = 0
PATCH = 0
DELETE = 0

APP53_MODIFIED = NO
APP795_MODIFIED = NO
APP139_MODIFIED = NO
LEGACY_APPS_MODIFIED = NO
SCHEMA_MODIFIED = NO
PROCESS_MANAGEMENT_MODIFIED = NO

NO_ORPHAN_ARTIFACT_GATE = PASS
npm test = actual / PASS

M7_WRITE_AUTHORIZATION = NO
M9_FINAL_ACCEPTANCE = BLOCKED_PENDING_M7
NEXT_ACTION = CHATGPT + USER REVIEW ONLY
```

Do not mark M7 complete unless all required routing lines are proven and later explicitly approved/written.
Do not proceed to M9.
Do not seed App795.
Do not modify any Kintone data, field, schema, or process configuration.

Commit investigation/evidence documentation only if required by governance, push same branch, then STOP.
