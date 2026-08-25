# AI ACTIVE TASK — M10I-R2 HISTORICAL EVIDENCE RECONCILIATION

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Reviewed Head: `16767cf76464db1779046dec16a7bf09296947b6`
> Mode: REPOSITORY RECONCILIATION + KINTONE READ-ONLY VERIFICATION ONLY — NO KINTONE WRITE / NO APP794 DEPLOY

# NORTH STAR

Use `project-docs/CONFIRMED_BASELINE/` as the primary business source of truth before living review/handoff docs.

Confirmed historical evidence now exists for all 8 legacy PMS apps. M10I title-based mapping is provisional where it conflicts with historical evidence.

Immediate required correction:

```text
Factory Manager
current provisional resolver = PROF_SECTION_MGR
confirmed historical evidence = App640 PMS GM
required reconciled profile = PROF_GM
```

This task must reconcile the repository resolver against confirmed historical evidence, preserve M10H stale-state fix, and prepare one clean deployment candidate. Do NOT deploy.

# CONFIRMED BASELINE — MUST READ FIRST

Read completely before changing code:

```text
project-docs/CONFIRMED_BASELINE/README.md
project-docs/CONFIRMED_BASELINE/EVALUATION_CLASSES.md
project-docs/CONFIRMED_BASELINE/LEGACY_PMS_APPS.md
project-docs/CONFIRMED_BASELINE/ROUTING_WORKFLOW.md
```

If another document conflicts with `CONFIRMED_BASELINE`, STOP and report the contradiction unless the baseline is superseded by newer explicit user-approved evidence.

# HARD SAFETY

```text
App53 = READ ONLY
Legacy Apps 283,310,305,643,307,640,715,716 = READ ONLY
App794 customization deploy = 0
App794 schema/process/record/ACL writes = 0
App795/App796/App797/App798/App800/App801 writes = 0
Other Kintone writes = 0
KINTONE_WRITES_THIS_TASK = 0
```

# STEP 1 — VERIFY HISTORICAL EVIDENCE AGAINST CURRENT RESOLVER

Inspect the existing `src/profiles/profile-scoring-resolver.js` and compare every historically confirmed questionable title from `CONFIRMED_BASELINE/LEGACY_PMS_APPS.md`:

```text
Advisor -> PROF_JAPANESE_STAFF
President -> PROF_VP
Manager -> PROF_SECTION_MGR
Co Project Manager -> PROF_SECTION_MGR
Executive Management Coordinator -> PROF_STAFF_CHIEF
Factory Manager -> PROF_GM
```

For each output:

```text
TITLE
CURRENT_RESOLVER_PROFILE
CONFIRMED_BASELINE_PROFILE
MATCH / CONFLICT
ACTION
```

Do not change confirmed matches unnecessarily.

# STEP 2 — FIX CONFLICTS IN EXISTING SOURCE ONLY

Modify the existing resolver source of truth only.

Mandatory current fix:

```text
Factory Manager -> PROF_GM
```

If any additional resolver conflict with CONFIRMED_BASELINE is found, fix it only when the baseline evidence is explicit.

Do not create alternate resolver files, fallback maps, `_old`, `_v2`, duplicate maps, or compatibility shims.

# STEP 3 — HISTORICAL PRECEDENCE RULE

Implement/document the classification evidence hierarchy consistently:

```text
1. Explicit confirmed business rule / current HR-approved class
2. Confirmed recent historical PMS class evidence
3. Current Position deterministic mapping
4. Ambiguous/unknown -> FAIL CLOSED
```

Historical evidence is evidence, not blind override. If current App53 position clearly indicates a promotion/level change relative to legacy history, preserve `LEVEL_CHANGE_DETECTED` semantics rather than forcing the old class.

Do not introduce per-employee hardcoded profile exceptions unless already explicitly confirmed as a business rule.

# STEP 4 — RE-CHECK 275 EMPLOYEE COVERAGE

Using App53 READ ONLY and legacy evidence READ ONLY as needed, report:

```text
TOTAL_ACTIVE_EMPLOYEES = 275
NONEMPTY_POSITION_EMPLOYEES = actual
RESOLVED_BY_CURRENT_RULES = actual
LEVEL_CHANGE_DETECTED = actual
AMBIGUOUS = actual
EMPTY_POSITION = actual
```

Explicitly verify:

```text
0111 -> current Assistant Section Manager; historical App310 Assistant Manager; expected PROF_ASST_MGR
0118 -> historical App283 Staff & Chief; expected PROF_STAFF_CHIEF
Factory Manager employee(s) -> expected PROF_GM based on confirmed App640 evidence unless newer current-level evidence proves a change
```

For employees `9042`, `9000`, `9036` with blank Position, do not invent a current profile. Report historical evidence separately and keep fail-closed unless current authoritative classification is confirmed.

# STEP 5 — PRESERVE M10H LOOKUP ATOMICITY FIX

Regression must still prove:

```text
new lookup starts -> verified false immediately
failed lookup -> previous employee snapshot cleared
failed lookup -> objective grid locked
successful lookup -> verified true only after App53 + routing + profile + scoring all pass
USER_SELECT reset uses []
```

# STEP 6 — CONFIRMED BASELINE GOVERNANCE

Do not scatter newly confirmed facts only into CHANGELOG/HANDOFF.

If this task produces a new CONFIRMED fact after verification, update the appropriate existing file under:

`project-docs/CONFIRMED_BASELINE/`

Rules:
- confirmed facts only
- modify canonical existing file when possible
- no `_old`, `_v1`, duplicate source-of-truth file
- provisional/test observations stay outside baseline
- if a confirmed fact is superseded, replace it with traceable note/evidence, do not retain contradictory active rules

# STEP 7 — BUILD / TEST

Rebuild using the repaired classic-script pipeline. Do NOT deploy.

Required gates:

```text
CLASSIC_BUNDLE_PARSE = PASS
ES_MODULE_IMPORT_COUNT = 0
ES_MODULE_EXPORT_COUNT = 0
BROKEN_FROM_RESIDUE_COUNT = 0
LOOKUP_FAILURE_STALE_STATE_TEST = PASS
USER_SELECTION_RESET_TYPE = ARRAY
FACTORY_MANAGER_PROFILE_TEST = PROF_GM
CONFIRMED_BASELINE_CONFLICT_COUNT = 0
NO_ORPHAN_ARTIFACT_GATE = PASS
```

Run:

```bash
npm test
git diff --check
git status --short
```

# REQUIRED FINAL SUMMARY

```text
M10I_R2_HISTORICAL_RECONCILIATION = COMPLETE / PARTIAL / BLOCKED

CONFIRMED_BASELINE_READ_FIRST = YES
CONFIRMED_BASELINE_CONFLICT_COUNT_BEFORE = actual
CONFIRMED_BASELINE_CONFLICT_COUNT_AFTER = actual

FACTORY_MANAGER_BEFORE = actual
FACTORY_MANAGER_AFTER = PROF_GM
FACTORY_MANAGER_EVIDENCE = App640 PMS GM

ADVISOR = actual
PRESIDENT = actual
MANAGER = actual
CO_PROJECT_MANAGER = actual
EXEC_MGMT_COORDINATOR = actual

TOTAL_ACTIVE_EMPLOYEES = actual
RESOLVED_EMPLOYEES = actual
LEVEL_CHANGE_DETECTED = actual
AMBIGUOUS_EMPLOYEES = actual
EMPTY_POSITION_EMPLOYEES = actual

EMPLOYEE_0111_RESULT = exact
EMPLOYEE_0118_RESULT = exact
BLANK_POSITION_9042 = exact
BLANK_POSITION_9000 = exact
BLANK_POSITION_9036 = exact

STALE_STATE_FIX_RETAINED = PASS/FAIL
CLASSIC_BUNDLE_PARSE = PASS/FAIL
npm test = actual / PASS
GIT_DIFF_CHECK = PASS/FAIL
NO_ORPHAN_ARTIFACT_GATE = PASS/BLOCKED

KINTONE_WRITES_THIS_TASK = 0
APP794_DEPLOY = 0
GIT_PUSH_SYNC = PASS/FAIL

NEXT_ACTION = CHATGPT REVIEW; IF PASS, PREPARE ONE CONTROLLED APP794 DEPLOY FOR RECONCILED M10H+M10I FIXES
```

Commit and push the same branch, then STOP.

Do not deploy App794.
Do not write any Kintone app.