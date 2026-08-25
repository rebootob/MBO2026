# AI ACTIVE TASK — M10I POSITION → SCORING PROFILE MAPPING CLOSURE

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Reviewed Head: `72d8ef294de3a80636a913ace4ead03ed5e8929f`
> Mode: APP53 READ-ONLY ANALYSIS + REPOSITORY MAPPING IMPLEMENTATION/TESTS ONLY — NO KINTONE WRITE / NO APP794 DEPLOY

# NORTH STAR

```text
Apps foundation             = READY
App795 routing              = LIVE / READY
App796 scoring              = LIVE / READY
App800 dashboard            = LIVE
App794 runtime revision 26  = LIVE
M10H coverage audit         = PASS

M10H factual coverage:
TOTAL_ACTIVE_EMPLOYEES      = 275
DISTINCT_POSITION_COUNT     = 61
MAPPED_POSITIONS            = 32 / 125 employees
AMBIGUOUS_POSITIONS         = 28 / 147 employees
UNKNOWN_POSITIONS           = 1 / 3 employees

CURRENT CRITICAL BLOCKER:
147 ambiguous + 3 unknown employees cannot reliably resolve scoring profile.

THIS TASK:
Close Position -> Scoring Profile mapping at repository level for every non-empty active App53 position where the business rule is determinable from the frozen MBO level policy, and isolate any truly unresolvable data-quality cases for explicit user decision. Target full usable coverage as close to 275/275 as evidence permits.
```

# FROZEN BUSINESS PROFILE POLICY

Use these frozen profile families only:

```text
Staff / Chief level       -> PROF_STAFF_CHIEF        -> Part A 70 / Part B 30
Japanese Staff            -> PROF_JAPANESE_STAFF     -> Part A 70 / Part B 30
Assistant Manager level   -> PROF_ASST_MGR            -> Part A 60 / Part B 40
Section Manager level     -> PROF_SECTION_MGR         -> Part A 50 / Part B 50
Senior Manager level      -> PROF_SENIOR_MGR          -> Part A 50 / Part B 50
Deputy General Manager    -> PROF_DGM                 -> Part A 50 / Part B 50
General Manager           -> PROF_GM                  -> Part A 50 / Part B 50
Vice President            -> PROF_VP                  -> Part A 50 / Part B 50
```

Do NOT create new profiles.
Do NOT modify App796 records.
Do NOT change the frozen weights.

# HARD SAFETY

```text
APP53 = READ ONLY
APP794_CUSTOMIZATION_DEPLOY = 0
APP794_SCHEMA_WRITE = 0
APP794_PROCESS_WRITE = 0
APP794_RECORD_WRITE = 0
APP794_ACL_WRITE = 0
APP795_WRITE = 0
APP796_WRITE = 0
OTHER_APP_WRITE = 0
KINTONE_WRITES_THIS_TASK = 0
```

# STEP 1 — RE-READ M10H COVERAGE MATRIX

Use the M10H audit evidence already recorded in living docs plus read-only App53 only if necessary to reconstruct the exact 28 ambiguous positions and 1 unknown/empty position.

For each unresolved position, capture:

```text
raw position label
normalized label
employee count
sample employee codes
candidate frozen profile
reason/evidence
confidence = HIGH / MEDIUM / LOW
```

Do not infer from employee names or other personal characteristics.
Use job title semantics and frozen MBO hierarchy only.

# STEP 2 — APPLY DETERMINISTIC TITLE MAPPING RULES

Implement mappings only where the title clearly indicates the frozen level.

Required semantic policy:

```text
Titles containing/meaning Assistant Manager or Assistant Section Manager
-> PROF_ASST_MGR

Titles containing/meaning Section Manager / Manager where App53 title clearly represents section-manager management level
-> PROF_SECTION_MGR

Titles containing/meaning Senior Manager
-> PROF_SENIOR_MGR

Titles containing/meaning Deputy General Manager / DGM
-> PROF_DGM

Titles containing/meaning General Manager / GM
-> PROF_GM

Titles containing/meaning Vice President / VP
-> PROF_VP

Operational Staff / Chief / Senior Chief / Assistant Chief / technician / engineer / operator / coordinator / specialist / clerk / warehouse staff / driver / messenger / interpreter etc. that are not management-level titles
-> PROF_STAFF_CHIEF

Japanese Staff / expatriate Japanese staff titles already covered
-> PROF_JAPANESE_STAFF
```

IMPORTANT:
- Do not blindly map every string containing `manager` to Section Manager.
- `Assistant Manager` remains PROF_ASST_MGR.
- `Senior Manager` remains PROF_SENIOR_MGR.
- DGM/GM/VP remain their exact profiles.
- For titles such as `Factory Manager`, `Co Project Manager`, `Manager`, `Advisor`, `President`, `Executive Management Coordinator`, or other unclear titles, inspect actual App53 distribution and existing project business rules before deciding.
- If a title cannot be assigned confidently from evidence, leave it UNRESOLVED and report for user decision. Fail closed is preferable to invented policy.

# STEP 3 — REMOVE OBSOLETE AMBIGUOUS ENTRIES WHEN REPLACED

Update the EXISTING `src/profiles/profile-scoring-resolver.js` source of truth.

Rules:
- Add exact mappings to `POSITION_TO_PROFILE` where approved by evidence/frozen hierarchy.
- Remove the same normalized titles from `AMBIGUOUS_TITLES` when they become deterministic.
- Do not leave a title both mapped and ambiguous.
- Do not create duplicate maps, fallback maps, `_v2`, `_old`, or alternative resolver modules.
- Preserve strict `PROFILE_SOURCE_INVALID` / `PROFILE_RESOLUTION_AMBIGUOUS` behavior for genuinely unresolved positions.

NO-ORPHAN gate is mandatory.

# STEP 4 — HANDLE EMPTY / UNKNOWN POSITION SAFELY

M10H found 3 employees with empty/unknown Position.

Do NOT invent a profile for blank position.
These records must remain fail-closed unless another authoritative App53 field already provides a frozen management level and the existing architecture explicitly permits using it.

If no authoritative existing field is approved for this purpose:

```text
EMPTY_POSITION_EMPLOYEES = 3
RESULT = BLOCKED_BY_APP53_DATA_QUALITY
USER/HR_DATA_CORRECTION_REQUIRED = YES
```

Do NOT write App53 in this task.

# STEP 5 — COVERAGE TEST

Build an automated coverage test against the exact current App53 read-only position inventory or a durable sanitized position/count fixture derived from the M10H audit.

Required outputs:

```text
TOTAL_ACTIVE_EMPLOYEES = 275
RESOLVED_EMPLOYEE_COUNT = actual
AMBIGUOUS_EMPLOYEE_COUNT_AFTER = actual
UNKNOWN_EMPLOYEE_COUNT_AFTER = actual
RESOLVED_NONEMPTY_POSITION_COUNT = actual / non-empty distinct positions
```

Target:

```text
ALL NON-EMPTY ACTIVE POSITIONS deterministically resolved unless explicitly documented as business-decision-required.
```

Do not fake 275/275 by assigning blank/unknown positions.

Explicit regression cases must include at least:

```text
0111 Assistant Section Manager -> expected frozen profile based on hierarchy
0118 Technical Service Chief -> PROF_STAFF_CHIEF
Assistant Manager -> PROF_ASST_MGR
Section Manager -> PROF_SECTION_MGR
Senior Manager -> PROF_SENIOR_MGR
DGM -> PROF_DGM
GM -> PROF_GM
VP -> PROF_VP
Japanese Staff -> PROF_JAPANESE_STAFF
blank position -> fail closed
```

# STEP 6 — RETAIN M10H STALE-STATE FIX

Ensure M10H stale verified-state fix remains present and regression tests continue passing:

```text
lookup failure => verified false
previous employee snapshot cleared
objective grid locked
successful lookup => verified true only after routing/profile/scoring all pass
```

Do not deploy it in this task.

# STEP 7 — BUILD / VERIFY

Rebuild classic bundle using the existing repaired pipeline.

Required gates:

```text
CLASSIC_BUNDLE_PARSE = PASS
ES_MODULE_IMPORT_COUNT = 0
ES_MODULE_EXPORT_COUNT = 0
BROKEN_FROM_RESIDUE_COUNT = 0
IS_VALID_EMPLOYEE_CODE_RUNTIME = PASS
USER_SELECTION_RESET_TYPE = ARRAY
LOOKUP_FAILURE_STALE_STATE_TEST = PASS
PROFILE_MAPPING_COVERAGE_TEST = PASS
```

Run:

```bash
npm test
git diff --check
git status --short
```

# REQUIRED FINAL SUMMARY

```text
M10I_POSITION_PROFILE_MAPPING_CLOSURE = COMPLETE / BLOCKED / PARTIAL

TOTAL_ACTIVE_EMPLOYEES = 275
DISTINCT_POSITION_COUNT = 61
NONEMPTY_POSITION_COUNT = actual
RESOLVED_POSITION_COUNT_AFTER = actual
AMBIGUOUS_POSITION_COUNT_AFTER = actual
UNKNOWN_POSITION_COUNT_AFTER = actual
RESOLVED_EMPLOYEE_COUNT_AFTER = actual
AMBIGUOUS_EMPLOYEE_COUNT_AFTER = actual
UNKNOWN_EMPLOYEE_COUNT_AFTER = actual

EMPLOYEE_0111_POSITION = Assistant Section Manager
EMPLOYEE_0111_PROFILE_AFTER = actual
EMPLOYEE_0118_POSITION = Technical Service Chief
EMPLOYEE_0118_PROFILE_AFTER = PROF_STAFF_CHIEF

MAPPINGS_ADDED = exact list
AMBIGUOUS_ENTRIES_REMOVED = exact list
UNRESOLVED_POSITIONS = exact list with employee counts/reasons
EMPTY_POSITION_EMPLOYEES = actual
APP53_DATA_CORRECTION_REQUIRED = YES/NO

STALE_VERIFIED_STATE_FIX_RETAINED = PASS/FAIL
PROFILE_MAPPING_COVERAGE_TEST = PASS/FAIL
CLASSIC_BUNDLE_PARSE = PASS/FAIL
npm test = actual / PASS
GIT_DIFF_CHECK = PASS/FAIL
NO_ORPHAN_ARTIFACT_GATE = PASS/BLOCKED

KINTONE_WRITES_THIS_TASK = 0
APP794_CUSTOMIZATION_DEPLOY = 0
GIT_PUSH_SYNC = PASS/FAIL

NEXT_ACTION = CHATGPT REVIEW; IF COVERAGE ACCEPTABLE, PREPARE ONE CONTROLLED APP794 DEPLOY INCLUDING M10H+M10I
```

Update only living docs with factual results.
Commit and push same branch, then STOP.

Do NOT deploy App794.
Do NOT write App53/App795/App796 or any other Kintone app.
Do NOT create new scoring profiles or change scoring weights.
