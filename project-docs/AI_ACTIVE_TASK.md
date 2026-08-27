# AI ACTIVE TASK — UI PARITY ONLY / WEB DEMO REFERENCE LOCK

> Control Plane: ChatGPT
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Starting implementation HEAD: `0226b9445a9249ac019363caab8a9c13cea435ba`
> Mode: **CREDIT-SAVER / UI PARITY ONLY / ONE ROUND ONLY**
> Kintone authorization: **NONE**
> Kintone GET/WRITE/DEPLOY/BROWSER-SMOKE: **0 / 0 / 0 / 0**

## OBJECTIVE

Close ONLY Gate 6: port the approved Web Demo UI/UX into the actual App794 runtime without redesign and without any Kintone call/write/deploy.

Do not touch Legacy Migration, routing, scoring, Hoshin business logic, authentication, or Kintone configuration unless a direct UI compile regression forces a minimal repair.

After implementation: run tests/build once as instructed, update handoff docs, commit, push, and STOP.

---

# CANONICAL SOURCES — LOCKED

```text
WEB_DEMO_VISUAL_REFERENCE = preview/index.html
UI_BASELINE = project-docs/CONFIRMED_BASELINE/UI_UX.md
EVALUATION_PROFILE_BASELINE = project-docs/CONFIRMED_BASELINE/EVALUATION_CLASSES.md

ACTUAL_APP794_RUNTIME_SOURCE =
- src/main-mbo-app.js
- src/ui/employee-part-a-ui.js
- existing src/styles/* used by App794

BUILD_OUTPUT =
- dist/mbo-employee-app.js
- dist/mbo-employee.css
```

The Web Demo is the visual/interaction reference, but **Confirmed Baseline wins over stale demo data values**.

## Mandatory Web Demo profile-code correction

The current `preview/index.html` still contains stale Profile_Code values such as:

```text
PROF_STAFF_OPERATIONAL
PROF_STAFF_JAPANESE
PROF_SECT_MGR
PROF_SR_MGR
```

These MUST NOT be copied into runtime.

Canonical profile codes are exactly:

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

Required mapping for the Web Demo selector/reference:

```text
Staff / Chief       -> PROF_STAFF_CHIEF
Japanese Staff      -> PROF_JAPANESE_STAFF
Assistant Manager   -> PROF_ASST_MGR
Section Manager     -> PROF_SECTION_MGR
Senior Manager      -> PROF_SENIOR_MGR
DGM                 -> PROF_DGM
GM                  -> PROF_GM
VP                  -> PROF_VP
```

Update `preview/index.html` itself if necessary so the approved Web Demo no longer advertises stale Profile_Code values. This is a data-contract correction, NOT a UI redesign.

Expected:

```text
WEB_DEMO_PROFILE_CODES_CANONICAL = PASS
STALE_PROFILE_CODES_IN_PREVIEW = 0
STALE_PROFILE_CODES_IN_RUNTIME = 0
```

---

# GATE 6 — WEB DEMO -> APP794 RUNTIME PARITY

Read `UI_UX.md` before editing. Compare `preview/index.html` against runtime and classify each item as `ALREADY_PARITY`, `MISSING_RUNTIME`, `LOCAL_WIRING_ONLY`, or `BLOCKED_PHYSICAL_SCHEMA`.

Close these approved items only:

1. exactly five macro stages: Objectives, Mid-Year, Self Evaluation, Appraiser Evaluation, HR Final/Completed;
2. Thai + English user-facing guidance;
3. evaluator route uses ordinal `ผู้ประเมินลำดับที่ 1..4 / 1st..4th Appraiser`; technical Manager/GM names are storage details only;
4. Evaluation Profile and Routing remain separate concepts;
5. `Objective_Count` controls flattened `Objective_1..10` slots without phantom objectives;
6. Difficulty blank remains blank and shows bilingual required prompt, never default Level 3;
7. optional evidence UX for Objectives, Mid-Year, Self Evaluation; if physical Objective attachment is unavailable, use truthful `PENDING_SCHEMA_REVIEW`, never invent a field;
8. Mid-Year Progress % is employee-entered 0..100 and separate from process progress/performance score;
9. five-phase HR Calendar consumes injected/local normalized App800 contract and shows before-open/open/due/overdue/completed states; no production hardcoded dates;
10. status 05/10 boundary UX tells Requester to use native `Start Mid-Year` / `Start Self Evaluation` when open; no date auto-transition;
11. Copy Previous UI uses corrected local preflight/candidate foundation, but performs zero Kintone writes;
12. Hoshin display uses record/local current/new FY snapshot/title data; no App797 GET;
13. Export uses normalized local foundation; exact template absent -> explicit `MISSING_LOCAL`, never fake official workbook;
14. native Kintone comment thread remains available/not intentionally hidden or covered;
15. 3–4 Appraiser matrices remain inside App794 content width with matrix-only horizontal scroll; no body/page overflow;
16. historical/read-only/Completed states remain truthful and permission-aware; UI hiding is not authorization;
17. route scenario/profile controls present in Web Demo are preview diagnostics only where appropriate; do not expose preview-only routing capacity as production-supported behavior;
18. Web Demo canonical profile codes are corrected as specified above before parity is claimed.

## Implementation rules

Prefer existing files/functions only:

```text
preview/index.html                 // only for stale demo contract correction
src/main-mbo-app.js
src/ui/employee-part-a-ui.js
existing src/styles/*
```

Do not create `_final`, `_v3`, replacement pages, or parallel UI architecture.

Do not change Process topology, App795 routes, profile weights, App797 business rules, App800 live data, or authorization model.

---

# LOCAL-ONLY SAFETY

```text
KINTONE_GET = 0
KINTONE_WRITE = 0
KINTONE_DEPLOY = 0
BROWSER_SMOKE = 0
APP53_WRITE = 0
LEGACY_APP_WRITE = 0
APP794_LIVE_WRITE = 0
APP800_LIVE_GET = 0
APP797_LIVE_GET = 0
```

- Copy Previous: local/pure candidate/preflight only.
- Phase Calendar: injected/local normalized config only.
- Hoshin: record/local snapshot only.
- Export: local projection only; exact binary unavailable -> `MISSING_LOCAL`.
- Native Process/permission controls remain the security boundary.

---

# REQUIRED LOCAL EVIDENCE

Provide exact source evidence for:

```text
WEB_DEMO_PROFILE_CODES_CANONICAL = PASS
FIVE_STAGE_UI = PASS
BILINGUAL_UI = PASS
ORDINAL_APPRAISER_LABELS = PASS
PROFILE_ROUTE_SEPARATION = PASS
OBJECTIVE_COUNT_FLATTENED_SLOTS = PASS
DIFFICULTY_BLANK_STATE = PASS
OPTIONAL_EVIDENCE_UX = PASS|PASS_WITH_SCHEMA_PENDING
MIDYEAR_PROGRESS_SEMANTICS = PASS
PHASE_CALENDAR_LOCAL_CONTRACT = PASS
BOUNDARY_START_ACTION_GUIDANCE = PASS
COPY_PREVIOUS_LOCAL_UI_WIRING = PASS
HOSHIN_LOCAL_SNAPSHOT_UI = PASS
EXPORT_LOCAL_FOUNDATION = PASS|MISSING_LOCAL_TEMPLATE
NATIVE_COMMENT_THREAD_PRESERVED = PASS
MULTI_APPRAISER_CONTAINMENT = PASS
READ_ONLY_PERMISSION_TRUTHFULNESS = PASS
PREVIEW_ONLY_RUNTIME_CLAIMS = 0
```

If an item already exists, do not rewrite it; document exact source evidence.

---

# TEST / BUILD DISCIPLINE

- Run targeted tests only as needed during implementation.
- Run full `npm test` exactly ONCE near completion.
- Run `npm run ui:build` exactly ONCE near completion.
- Verify only expected bundle outputs changed.
- No browser smoke and no deploy.

Update concisely after implementation:

```text
project-docs/AI_REVIEW_PACKAGE.md
project-docs/CURRENT_STATE.md
project-docs/HANDOFF.md
```

Do not edit `project-docs/CONFIRMED_BASELINE/*`.

---

# STOP CONDITIONS

STOP rather than guess if:
- a required physical App794 field is genuinely uncertain and unsupported by repo/export evidence;
- parity would require changing frozen Process/routing/scoring semantics;
- a behavior cannot be made local-only without Kintone access;
- a new P0/P1 security/data-integrity issue is found.

Do NOT stop for Preview source discovery; `preview/index.html` is already locked as the Web Demo reference.

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
ACTUAL_APP794_RUNTIME_SOURCE = src/main-mbo-app.js + src/ui/employee-part-a-ui.js + existing src/styles/*

WEB_DEMO_PROFILE_CODES_CANONICAL = PASS|BLOCKED
STALE_PROFILE_CODES_IN_PREVIEW = <count>
STALE_PROFILE_CODES_IN_RUNTIME = <count>
FIVE_STAGE_UI = PASS|BLOCKED
BILINGUAL_UI = PASS|BLOCKED
ORDINAL_APPRAISER_LABELS = PASS|BLOCKED
PROFILE_ROUTE_SEPARATION = PASS|BLOCKED
OBJECTIVE_COUNT_FLATTENED_SLOTS = PASS|BLOCKED
DIFFICULTY_BLANK_STATE = PASS|BLOCKED
OPTIONAL_EVIDENCE_UX = PASS|PASS_WITH_SCHEMA_PENDING|BLOCKED
MIDYEAR_PROGRESS_SEMANTICS = PASS|BLOCKED
PHASE_CALENDAR_LOCAL_CONTRACT = PASS|BLOCKED
BOUNDARY_START_ACTION_GUIDANCE = PASS|BLOCKED
COPY_PREVIOUS_LOCAL_UI_WIRING = PASS|BLOCKED
HOSHIN_LOCAL_SNAPSHOT_UI = PASS|BLOCKED
EXPORT_LOCAL_FOUNDATION = PASS|MISSING_LOCAL_TEMPLATE|BLOCKED
NATIVE_COMMENT_THREAD_PRESERVED = PASS|BLOCKED
MULTI_APPRAISER_CONTAINMENT = PASS|BLOCKED
READ_ONLY_PERMISSION_TRUTHFULNESS = PASS|BLOCKED
PREVIEW_ONLY_RUNTIME_CLAIMS = <count>

PREVIEW_TO_APP794_PARITY_LOCAL = PASS|BLOCKED
FROZEN_UI_REDESIGN = 0
APP794_RUNTIME_WRITE = 0
FULL_NPM_TEST = PASS|FAIL
BUILD = PASS|FAIL
FINAL_KINTONE_EXECUTION_READINESS = READY|BLOCKED

CHANGED_FILES = <exact list>
REMAINING_BLOCKERS = <exact list or NONE>
```

Commit and push authorized local changes, then STOP. Do not begin Final Kintone Execution.
