# AI ACTIVE TASK — UI PARITY MICRO-FIX BEFORE FINAL KINTONE EXECUTION

> Control Plane: ChatGPT
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Starting implementation HEAD: `06870344fd7075429aceca5413249e54d64a96cc`
> Mode: **CREDIT-SAVER / UI MICRO-FIX / THREE DEFECTS ONLY**
> Kintone authorization: **NONE**
> Kintone GET/WRITE/DEPLOY/BROWSER-SMOKE: **0 / 0 / 0 / 0**

## OBJECTIVE

Close ONLY the three remaining source-level UI parity defects found by independent review of `06870344...`.

Do not redesign the Web Demo. Do not reopen migration, Hoshin, export architecture, routing master, scoring master, authentication, or Kintone configuration.

Locked references:

```text
WEB_DEMO_VISUAL_REFERENCE = preview/index.html
UI_BASELINE = project-docs/CONFIRMED_BASELINE/UI_UX.md
EVALUATION_PROFILE_BASELINE = project-docs/CONFIRMED_BASELINE/EVALUATION_CLASSES.md
ROUTING_BASELINE = project-docs/CONFIRMED_BASELINE/ROUTING_WORKFLOW.md

ACTUAL_APP794_RUNTIME_SOURCE =
- src/main-mbo-app.js
- src/ui/employee-part-a-ui.js
- existing src/styles/* used by App794
```

Confirmed Baseline overrides stale demo/runtime convenience values.

---

# DEFECT 1 — OBJECTIVE_COUNT MUST SUPPORT 1..10 WITHOUT PHANTOM OBJECTIVES

Independent review found runtime code in Appraiser Evaluation equivalent to:

```js
const countVal = parseInt(this._getVal('Objective_Count') || '4', 10);
const count = isNaN(countVal) ? 4 : Math.min(Math.max(countVal, 2), 10);
```

This incorrectly forces `Objective_Count = 1` to render 2 objective rows.

## Required behavior

- Valid `Objective_Count` range is **1..10**.
- `Objective_Count = 1` renders exactly 1 objective.
- `Objective_Count = 10` renders exactly 10 objectives.
- Never create phantom objective rows merely to satisfy a UI minimum.
- Blank/invalid count must use an explicit safe policy consistent with existing record/data contract; do not silently invent 4 objectives unless existing baseline/source contract explicitly requires it.
- Apply consistently across all five screens where objective-row count is used, not only Appraiser Evaluation.
- Preserve flattened physical fields `Objective_1..10`.

Prefer a small existing/shared helper if practical rather than repeated count-clamping logic.

Required focused tests:

```text
Objective_Count=1  -> exactly 1 rendered/logical slot
Objective_Count=2  -> exactly 2
Objective_Count=10 -> exactly 10
no phantom slot beyond Objective_Count
invalid/out-of-range -> safe deterministic behavior
```

Expected:

```text
OBJECTIVE_COUNT_FLATTENED_SLOTS = PASS
PHANTOM_OBJECTIVE_ROWS = 0
```

---

# DEFECT 2 — CANONICAL PROFILE MAP MUST NOT CONTAIN STALE KEYS

The Web Demo selector is now canonical, but runtime currently mutates `EVALUATION_PROFILES` with stale aliases such as:

```js
EVALUATION_PROFILES.PROF_STAFF_OPERATIONAL = EVALUATION_PROFILES.PROF_STAFF_CHIEF;
EVALUATION_PROFILES.PROF_SECT_MGR = EVALUATION_PROFILES.PROF_SECTION_MGR;
EVALUATION_PROFILES.PROF_SR_MGR = EVALUATION_PROFILES.PROF_SENIOR_MGR;
```

This makes the claim `STALE_PROFILE_CODES_IN_RUNTIME = 0` false.

## Required behavior

`EVALUATION_PROFILES` canonical keys must be exactly:

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

If backward compatibility with historical preview/test values is genuinely needed, use a separate normalization adapter/helper, for example conceptually:

```text
legacy input code -> canonical code -> EVALUATION_PROFILES[canonical]
```

Do NOT add stale keys back into the canonical profile object.

Legacy alias input may normalize fail-safe, but all output/state shown to business/runtime must be canonical.

Required tests:

```text
Object.keys(EVALUATION_PROFILES) = exactly 8 canonical keys
stale profile input aliases normalize to canonical value if compatibility is retained
preview contains no stale profile code
runtime canonical map contains no stale profile key
```

Expected:

```text
WEB_DEMO_PROFILE_CODES_CANONICAL = PASS
STALE_PROFILE_CODES_IN_PREVIEW = 0
STALE_PROFILE_CODES_IN_RUNTIME = 0
```

---

# DEFECT 3 — PROFILE MUST NOT INFER PRODUCTION ROUTING

Current profile fixture/object still includes values such as:

```js
suggestedRoute: 'CURRENT_STANDARD'
suggestedRoute: 'EXECUTIVE_DIRECT'
```

Confirmed baseline states:

```text
Evaluation Profile / Part A:B ratio != Routing
```

Routing must be resolved from approved routing context/App795, not inferred merely from profile code/ratio.

## Required investigation

Search all production/runtime usages of:

```text
suggestedRoute
EVALUATION_PROFILES[...].suggestedRoute
profile -> route inference
```

Classify each use as:

```text
PREVIEW_DIAGNOSTIC_ONLY
PRODUCTION_RUNTIME
UNUSED
```

## Required behavior

- Production App794 runtime must NOT choose or overwrite `Routing_Topology`, appraiser count, or evaluator identities from `Profile_Code`, profile ratio, or `suggestedRoute`.
- Runtime routing remains driven by existing resolved routing record/context.
- If `suggestedRoute` is only needed by `preview/index.html`, move/keep it in Preview-only diagnostics or rename/document so it cannot be mistaken for production routing authority.
- If unused in production, remove it from the production canonical profile definitions if safe.
- Executive Direct remains a routing decision from reviewed App795/executive rules, not because `PROF_DGM/PROF_GM/PROF_VP` has a suggested route field in UI profile data.
- Do not alter App795, route topology, or Process Management in this task.

Required focused tests/source assertions:

```text
changing Profile_Code alone does not change production Routing_Topology
profile ratio alone does not change appraiser count
production route display consumes record/resolved routing context
preview-only route suggestion cannot write/override runtime routing
```

Expected:

```text
PROFILE_ROUTE_SEPARATION = PASS
PROFILE_TO_PRODUCTION_ROUTE_INFERENCE = 0
```

---

# ACCEPTED UI ITEMS — DO NOT REWRITE

Independent review already accepts these source foundations. Preserve them unless a direct regression is discovered:

```text
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

Do not redesign these parts.

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

No Kintone calls of any kind in this round.

Do not edit `project-docs/CONFIRMED_BASELINE/*`.

Prefer existing files/functions. Do not create `_final`, `_v3`, replacement UI, parallel profile/routing architecture, or duplicate helper modules without a clear need.

---

# TEST / BUILD

- Run targeted tests while implementing as needed.
- Run full `npm test` exactly ONCE near completion.
- Run `npm run ui:build` exactly ONCE near completion if UI/runtime source changed.
- Verify expected dist bundle update.
- No browser smoke and no deploy.

Update concisely:

```text
project-docs/AI_REVIEW_PACKAGE.md
project-docs/CURRENT_STATE.md
project-docs/HANDOFF.md
```

Do not claim visual UAT PASS. User visual inspection remains a separate mandatory gate before deploy.

---

# REQUIRED FINAL REPORT

Return exactly:

```text
IMPLEMENTATION_HEAD = <sha>
KINTONE_CALLS = 0
KINTONE_WRITES = 0
KINTONE_DEPLOYS = 0
BROWSER_SMOKE = 0

WEB_DEMO_VISUAL_REFERENCE = preview/index.html
OBJECTIVE_COUNT_FLATTENED_SLOTS = PASS|BLOCKED
PHANTOM_OBJECTIVE_ROWS = <count>
WEB_DEMO_PROFILE_CODES_CANONICAL = PASS|BLOCKED
STALE_PROFILE_CODES_IN_PREVIEW = <count>
STALE_PROFILE_CODES_IN_RUNTIME = <count>
PROFILE_ROUTE_SEPARATION = PASS|BLOCKED
PROFILE_TO_PRODUCTION_ROUTE_INFERENCE = <count>

FULL_NPM_TEST = PASS|FAIL
BUILD = PASS|NOT_REQUIRED|FAIL
SOURCE_UI_PARITY_READINESS = READY|BLOCKED
VISUAL_UAT = NOT_RUN
FINAL_KINTONE_EXECUTION_READINESS = BLOCKED_PENDING_VISUAL_UAT|BLOCKED

CHANGED_FILES = <exact list>
REMAINING_BLOCKERS = <exact list or NONE>
```

Commit and push authorized local changes, then STOP. Do not begin Final Kintone Execution.
