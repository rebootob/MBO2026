# AI ACTIVE TASK — FINAL FAIL-CLOSED UI MICRO-FIX BEFORE VISUAL UAT

> Control Plane: ChatGPT
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Starting implementation HEAD: `60fc6acb8e16b492d0703cfc7b150840b750bc91`
> Mode: **CREDIT-SAVER / TWO FAIL-CLOSED DEFECTS ONLY**
> Kintone authorization: **NONE**
> Kintone GET/WRITE/DEPLOY/BROWSER-SMOKE: **0 / 0 / 0 / 0**

## OBJECTIVE

Close ONLY the two remaining source-level fail-closed defects found by independent review of `60fc6ac...`.

Do not redesign the Web Demo. Do not reopen migration, routing, scoring, Hoshin, export architecture, authentication, or Kintone configuration.

Locked references:

```text
WEB_DEMO_VISUAL_REFERENCE = preview/index.html
UI_BASELINE = project-docs/CONFIRMED_BASELINE/UI_UX.md
EVALUATION_PROFILE_BASELINE = project-docs/CONFIRMED_BASELINE/EVALUATION_CLASSES.md
ROUTING_BASELINE = project-docs/CONFIRMED_BASELINE/ROUTING_WORKFLOW.md
ACTUAL_APP794_RUNTIME_SOURCE = src/ui/employee-part-a-ui.js + existing runtime bundle
```

Confirmed Baseline overrides convenience defaults.

---

# DEFECT 1 — INVALID OBJECTIVE_COUNT MUST FAIL CLOSED

Current helper effectively does:

```js
parseObjectiveCount(blank|0|invalid) -> 4
```

This silently invents four objective rows when source data is invalid or missing. There is no confirmed baseline authorizing that fallback.

## Required behavior

Valid production values are exactly integers `1..10`.

```text
1  -> 1
2  -> 2
10 -> 10
```

For production/runtime record data:

```text
blank
non-numeric
0
negative
>10
```

must NOT silently become 4 or another plausible business value.

Use an explicit fail-closed result. Acceptable pattern:

```text
parseObjectiveCount(raw) -> valid integer 1..10 OR null
```

or a small structured result such as:

```text
{ ok:false, code:'OBJECTIVE_COUNT_INVALID' }
```

Runtime UI behavior on invalid count:
- render no invented objective rows;
- show concise bilingual data-quality / configuration error;
- do not silently write/change `Objective_Count`;
- do not fabricate Objective 1..4;
- existing create/new-record UX may use a separately explicit UI initialization only if it is clearly a user-selectable create-state default and is NOT used to reinterpret invalid persisted record data. Keep persisted invalid data fail-closed.

Apply consistently wherever `Objective_Count` drives rendering, completion, scoring context, or total-weight display.

Required focused tests:

```text
1 -> exactly 1
2 -> exactly 2
10 -> exactly 10
blank -> invalid/fail closed, zero invented rows
0 -> invalid/fail closed
-1 -> invalid/fail closed
11 -> invalid/fail closed (do NOT clamp to 10)
text -> invalid/fail closed
```

Expected:

```text
OBJECTIVE_COUNT_VALID_1_TO_10 = PASS
OBJECTIVE_COUNT_INVALID_FAIL_CLOSED = PASS
PHANTOM_OBJECTIVE_ROWS = 0
```

---

# DEFECT 2 — UNKNOWN PROFILE_CODE MUST FAIL CLOSED

Current helper effectively does:

```js
blank/unknown -> PROF_STAFF_CHIEF
```

This violates the confirmed evaluation baseline. Blank/invalid/unresolved profile must not be fabricated merely to obtain coverage.

## Required behavior

Known canonical input returns itself:

```text
PROF_STAFF_CHIEF
PROF_JAPANESE_STAFF
PROF_ASST_MGR
PROF_SECTION_MGR
PROF_SENIOR_MGR
PROF_DGM
PROF_GM
PROF_VP
```

Known historical aliases may normalize only when the mapping is explicit and unambiguous. Preserve compatibility mappings already justified, and include the prior Web Demo alias if compatibility is retained:

```text
PROF_STAFF_OPERATIONAL -> PROF_STAFF_CHIEF
PROF_STAFF_JAPANESE    -> PROF_JAPANESE_STAFF
PROF_SECT_MGR          -> PROF_SECTION_MGR
PROF_SR_MGR            -> PROF_SENIOR_MGR
```

But:

```text
blank
null
unknown code
malformed value
```

must return unresolved/fail-closed (`null`, `PROFILE_NOT_RESOLVED`, etc.), NOT `PROF_STAFF_CHIEF`.

`getEvaluationProfile()` must also fail closed when code is unresolved; it must not return a Staff/Chief profile by default.

Runtime UI behavior:
- show truthful bilingual unresolved-profile/configuration message;
- do not infer Part A/B ratio, competency set, route, appraiser count, or evaluator identity from a missing/unknown profile;
- do not overwrite the record's profile;
- routing remains independently resolved from routing context/App795.

Required focused tests:

```text
all 8 canonical codes -> resolve to themselves
legacy aliases -> canonical equivalents
PROF_STAFF_JAPANESE -> PROF_JAPANESE_STAFF if compatibility retained
blank/null -> unresolved
UNKNOWN_PROFILE -> unresolved
getEvaluationProfile(unresolved) -> null/explicit unresolved
no Staff/Chief fallback for invalid profile
```

Expected:

```text
CANONICAL_PROFILE_KEYS = PASS
LEGACY_PROFILE_ALIAS_NORMALIZATION = PASS
UNKNOWN_PROFILE_FAIL_CLOSED = PASS
PROFILE_DEFAULT_FABRICATION = 0
```

---

# ACCEPTED — DO NOT REWRITE

Preserve the already accepted source behavior:

```text
OBJECTIVE_COUNT valid 1..10 support
WEB_DEMO_PROFILE_CODES_CANONICAL = PASS
STALE_PROFILE_CODES_IN_PREVIEW = 0
STALE_PROFILE_CODES_IN_RUNTIME = 0
PROFILE_ROUTE_SEPARATION = PASS
PROFILE_TO_PRODUCTION_ROUTE_INFERENCE = 0
FIVE_STAGE_UI = PASS_SOURCE
BILINGUAL_UI = PASS_SOURCE
ORDINAL_APPRAISER_LABELS = PASS_SOURCE
DIFFICULTY_BLANK_STATE = PASS_SOURCE
OPTIONAL_EVIDENCE_UX = PASS_WITH_SCHEMA_PENDING
MIDYEAR_PROGRESS_SEMANTICS = PASS_SOURCE
PHASE_CALENDAR_LOCAL_CONTRACT = PASS_SOURCE
BOUNDARY_START_ACTION_GUIDANCE = PASS_SOURCE
COPY_PREVIOUS_LOCAL_UI_WIRING = PASS_SOURCE
HOSHIN_LOCAL_SNAPSHOT_UI = PASS_SOURCE
EXPORT_LOCAL_FOUNDATION = MISSING_LOCAL_TEMPLATE
NATIVE_COMMENT_THREAD_PRESERVED = PASS_SOURCE_REVIEW_PENDING_VISUAL
MULTI_APPRAISER_CONTAINMENT = PASS_SOURCE_REVIEW_PENDING_VISUAL
READ_ONLY_PERMISSION_TRUTHFULNESS = PASS_SOURCE
```

---

# LOCAL-ONLY HARD BOUNDARY

```text
KINTONE_GET = 0
KINTONE_WRITE = 0
KINTONE_DEPLOY = 0
BROWSER_SMOKE = 0
APP53_WRITE = 0
LEGACY_APP_WRITE = 0
APP794_LIVE_WRITE = 0
APP795_LIVE_GET = 0
APP796_LIVE_GET = 0
APP800_LIVE_GET = 0
APP797_LIVE_GET = 0
```

Do not edit `project-docs/CONFIRMED_BASELINE/*`.
Prefer existing helper/functions. Do not create `_final`, `_v3`, replacement UI, or parallel architecture.

---

# TEST / BUILD

- Run targeted tests as needed.
- Run full `npm test` exactly ONCE near completion.
- Run `npm run ui:build` exactly ONCE near completion because runtime UI source will change.
- Verify expected dist bundle update only.
- No browser smoke and no Kintone deploy.

Update concisely:

```text
project-docs/AI_REVIEW_PACKAGE.md
project-docs/CURRENT_STATE.md
project-docs/HANDOFF.md
```

Do NOT claim Visual UAT PASS. If source closes, next step is user Visual UAT of the Web Demo/runtime UI.

---

# REQUIRED FINAL REPORT

Return exactly:

```text
IMPLEMENTATION_HEAD = <sha>
KINTONE_CALLS = 0
KINTONE_WRITES = 0
KINTONE_DEPLOYS = 0
BROWSER_SMOKE = 0

OBJECTIVE_COUNT_VALID_1_TO_10 = PASS|BLOCKED
OBJECTIVE_COUNT_INVALID_FAIL_CLOSED = PASS|BLOCKED
PHANTOM_OBJECTIVE_ROWS = <count>
CANONICAL_PROFILE_KEYS = PASS|BLOCKED
LEGACY_PROFILE_ALIAS_NORMALIZATION = PASS|BLOCKED
UNKNOWN_PROFILE_FAIL_CLOSED = PASS|BLOCKED
PROFILE_DEFAULT_FABRICATION = <count>
PROFILE_ROUTE_SEPARATION = PASS|BLOCKED
PROFILE_TO_PRODUCTION_ROUTE_INFERENCE = <count>

FULL_NPM_TEST = PASS|FAIL
BUILD = PASS|FAIL
SOURCE_UI_PARITY_READINESS = READY|BLOCKED
VISUAL_UAT = NOT_RUN
FINAL_KINTONE_EXECUTION_READINESS = BLOCKED_PENDING_VISUAL_UAT|BLOCKED

CHANGED_FILES = <exact list>
REMAINING_BLOCKERS = <exact list or NONE>
```

Commit and push authorized local changes, then STOP. Do not begin Visual UAT automation or Final Kintone Execution.