# AI ACTIVE TASK — M10K APP53 RETIRED SECTION / ROUTING COVERAGE AUDIT

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Mode: APP53 + APP795 READ-ONLY AUDIT — NO KINTONE WRITE / NO DEPLOY

# NORTH STAR

Do not add routing for retired organization codes.

User-confirmed business fact:

```text
TMT3 = RETIRED / NO LONGER USED
Current canonical section = TMS1
```

Therefore an active App53 employee still carrying `Section = TMT3` is stale master data, not a missing App795 route.

The purpose of this task is to audit all active App53 employees against the confirmed current routing baseline, identify retired/stale section codes and any truly current section/team routing gaps, and separate data-cleanup issues from routing defects.

Do not fix any data in this task.

# CONFIRMED BASELINE — READ FIRST

Read completely:

```text
project-docs/CONFIRMED_BASELINE/README.md
project-docs/CONFIRMED_BASELINE/ROUTING_WORKFLOW.md
project-docs/CONFIRMED_BASELINE/EVALUATION_CLASSES.md
project-docs/CONFIRMED_BASELINE/LEGACY_PMS_APPS.md
```

Use `CONFIRMED_BASELINE` as the primary source of truth.

# HARD SAFETY

```text
APP53 = READ ONLY
APP795 = READ ONLY
APP794 = READ ONLY
OTHER_KINTONE_APPS = READ ONLY
KINTONE_WRITES_THIS_TASK = 0
APP794_DEPLOY = 0
APP795_WRITE = 0
APP53_WRITE = 0
```

# STEP 1 — READ CURRENT ACTIVE APP53 POPULATION

Read all active App53 employees needed for routing coverage.

For each active employee capture only the fields necessary for this audit:

```text
Employee Code
Section
Team (if applicable/currently populated)
Department (for context only)
Position (optional context only)
```

Expected active population baseline: 275 employees. Report actual.

Do not modify App53.

# STEP 2 — READ APP795 CURRENT ACTIVE ROUTING

Read App795 active routes and reconstruct the authoritative current routing keys.

Confirmed model:

```text
Non-TMG: Routing_Key = Section_Code
TMG1/TMG2: Routing_Key = Section_Code + "|" + Team
```

Confirmed active route count baseline: 17. Report actual.

Do not add or modify routes.

# STEP 3 — CLASSIFY EVERY ACTIVE EMPLOYEE

For each active App53 employee classify routing state as exactly one of:

```text
CURRENT_ROUTE_MATCH
RETIRED_SECTION_STALE_MASTER
CURRENT_SECTION_ROUTE_MISSING
TMG_TEAM_ROUTE_MISSING
TMG_TEAM_DATA_MISSING
DUPLICATE_ROUTE_CONFIG
DATA_QUALITY_ISSUE
```

Rules:

## CURRENT_ROUTE_MATCH
Current App53 section/team matches exactly one active App795 route.

## RETIRED_SECTION_STALE_MASTER
App53 contains a section code confirmed retired/obsolete and therefore should NOT receive a new App795 route.

At minimum:

```text
TMT3 -> RETIRED
canonical replacement/context = TMS1
```

Employee `0117` is known browser evidence for this condition unless live App53 has already changed.

## CURRENT_SECTION_ROUTE_MISSING
Section appears current/valid but there is no matching route. Do not assume a missing route is valid until business evidence confirms the section is current.

## TMG_TEAM_ROUTE_MISSING
TMG1/TMG2 employee has a Team, but exact `Section|Team` route is missing.

## TMG_TEAM_DATA_MISSING
TMG1/TMG2 employee is missing Team data required by the confirmed model.

## DUPLICATE_ROUTE_CONFIG
More than one active App795 row matches the same authoritative routing key.

## DATA_QUALITY_ISSUE
Blank/malformed/unsupported section/team values that cannot be classified safely.

# STEP 4 — RETIRED / UNKNOWN SECTION DISCOVERY

Produce distinct App53 section inventory with employee counts.

Compare against:

1. confirmed current App795 route sections
2. confirmed retired sections in `CONFIRMED_BASELINE`
3. existing project organization/routing evidence if needed

Do NOT automatically call every section absent from App795 "retired".

For every unmatched section output:

```text
SECTION_CODE
ACTIVE_EMPLOYEE_COUNT
EMPLOYEE_CODES
CURRENT/RETIRED/UNKNOWN
EVIDENCE
RECOMMENDED_ACTION
```

If status cannot be proven, mark `UNKNOWN_REQUIRES_USER_HR_DECISION`.

# STEP 5 — TMT3 SPECIFIC VALIDATION

Report:

```text
TMT3_ACTIVE_EMPLOYEE_COUNT = actual
TMT3_ACTIVE_EMPLOYEE_CODES = exact
TMT3_ROUTING_ROW_COUNT_APP795 = actual
TMT3_CLASSIFICATION = RETIRED_SECTION_STALE_MASTER
TMT3_NEW_ROUTE_REQUIRED = NO
CANONICAL_SECTION = TMS1
```

Do not write App53 or App795.

# STEP 6 — ROUTING COVERAGE TOTALS

Required exact totals:

```text
TOTAL_ACTIVE_APP53_EMPLOYEES = actual
CURRENT_ROUTE_MATCH_COUNT = actual
RETIRED_SECTION_STALE_MASTER_COUNT = actual
CURRENT_SECTION_ROUTE_MISSING_COUNT = actual
TMG_TEAM_ROUTE_MISSING_COUNT = actual
TMG_TEAM_DATA_MISSING_COUNT = actual
DUPLICATE_ROUTE_CONFIG_COUNT = actual
DATA_QUALITY_ISSUE_COUNT = actual
UNRESOLVED_BUSINESS_DECISION_COUNT = actual
```

Also report distinct affected employee codes for every non-match category.

# STEP 7 — CONFIRMED BASELINE GOVERNANCE

Do not add unverified findings to `CONFIRMED_BASELINE`.

The user-confirmed TMT3 retirement rule is already canonical and must remain.

If this audit discovers another retired/current mapping only through inference, keep it in review evidence and mark for user/HR decision.

If a new fact becomes explicitly verified during execution from authoritative current evidence, update the appropriate existing canonical baseline file only; no duplicate docs.

# STEP 8 — NO ORPHAN / NO AUTO-FIX

Do NOT:

```text
create TMT3 routing
create fallback routes
map TMT3 to TMS1 in runtime code silently
hardcode employee exceptions
change App53 records
change App795 records
change App794 runtime
create migration scripts that execute writes
```

This is an audit only.

# STEP 9 — VERIFY REPOSITORY STATE

Run:

```bash
npm test
git diff --check
git status --short
```

No runtime code changes are expected unless strictly necessary for audit tooling already allowed by project governance; prefer existing scripts/tools and documentation evidence.

# REQUIRED FINAL SUMMARY

```text
M10K_APP53_RETIRED_SECTION_AUDIT = COMPLETE / PARTIAL / BLOCKED

TOTAL_ACTIVE_APP53_EMPLOYEES = actual
APP795_ACTIVE_ROUTE_COUNT = actual

CURRENT_ROUTE_MATCH_COUNT = actual
RETIRED_SECTION_STALE_MASTER_COUNT = actual
CURRENT_SECTION_ROUTE_MISSING_COUNT = actual
TMG_TEAM_ROUTE_MISSING_COUNT = actual
TMG_TEAM_DATA_MISSING_COUNT = actual
DUPLICATE_ROUTE_CONFIG_COUNT = actual
DATA_QUALITY_ISSUE_COUNT = actual
UNRESOLVED_BUSINESS_DECISION_COUNT = actual

TMT3_ACTIVE_EMPLOYEE_COUNT = actual
TMT3_ACTIVE_EMPLOYEE_CODES = exact
TMT3_ROUTING_ROW_COUNT_APP795 = actual
TMT3_CLASSIFICATION = RETIRED_SECTION_STALE_MASTER
TMT3_CANONICAL_SECTION = TMS1
TMT3_NEW_ROUTE_REQUIRED = NO

OTHER_UNMATCHED_SECTIONS = exact matrix

APP53_CLEANUP_CANDIDATES = exact employee codes + current stale section + proposed canonical target only where target is confirmed
ROUTING_FIX_CANDIDATES = exact current sections/teams only where evidence proves routing is genuinely missing
USER_HR_DECISIONS_REQUIRED = exact

KINTONE_WRITES_THIS_TASK = 0
APP53_WRITE = 0
APP795_WRITE = 0
APP794_DEPLOY = 0

npm test = actual / PASS
GIT_DIFF_CHECK = PASS/FAIL
NO_ORPHAN_ARTIFACT_GATE = PASS/BLOCKED
GIT_PUSH_SYNC = PASS/FAIL

NEXT_ACTION = CHATGPT REVIEW BEFORE ANY APP53 DATA CORRECTION OR APP795 ROUTING CHANGE
```

Update factual living docs, commit and push the same branch, then STOP.

Do not write any Kintone app.