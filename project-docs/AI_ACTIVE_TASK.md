# AI ACTIVE TASK — UI PARITY ONLY BEFORE FINAL KINTONE EXECUTION

> Control Plane: ChatGPT
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Starting implementation HEAD: `0226b9445a9249ac019363caab8a9c13cea435ba`
> Mode: **CREDIT-SAVER / UI PARITY ONLY / ONE ROUND ONLY**
> Kintone authorization: **NONE**
> Kintone GET/WRITE/DEPLOY/BROWSER-SMOKE: **0 / 0 / 0 / 0**

## OBJECTIVE

Close ONLY Gate 6: approved Preview -> actual App794 runtime parity.

Do not touch Legacy Migration again unless a direct compile/test regression from the UI work forces a minimal repair. Independent review already accepts the migration local foundation as PASS_LOCAL_WITH_MINOR_TEST_GAP and it is NOT the target of this round.

After this round, STOP. Do not begin Final Kintone Execution.

## CANONICAL SOURCES — ALREADY IDENTIFIED, DO NOT SEARCH AGAIN

```text
APPROVED_PREVIEW_SOURCE = preview/index.html

ACTUAL_APP794_RUNTIME_SOURCE =
- src/main-mbo-app.js
- src/ui/employee-part-a-ui.js
- existing src/styles/* used by App794

BUILD OUTPUT =
- dist/mbo-employee-app.js
- dist/mbo-employee.css

UI SOURCE OF TRUTH = project-docs/CONFIRMED_BASELINE/UI_UX.md
```

Read `project-docs/CONFIRMED_BASELINE/UI_UX.md` before editing UI.

Do not report `PREVIEW_SOURCE_NOT_FOUND`.

---

# GATE 6 — PREVIEW -> APP794 RUNTIME PARITY

## 1. Focused parity audit first

Compare `preview/index.html` with the actual App794 runtime implementation and classify each item:

```text
ALREADY_PARITY
MISSING_RUNTIME
LOCAL_WIRING_ONLY
BLOCKED_PHYSICAL_SCHEMA
```

Check exactly these frozen baseline items:

1. exactly five macro business stages;
2. Thai + English user-facing guidance;
3. lifecycle route uses ordinal `ผู้ประเมินลำดับที่ 1..4 / 1st..4th Appraiser`; technical Manager/GM field names must not be the business-facing slot labels;
4. `Objective_Count` controls flattened physical Objective slots, supporting App794 slots 1..10 without phantom objectives;
5. Difficulty blank stays blank; editable blank shows the bilingual select prompt and must never visually default to Level 3;
6. optional evidence/attachment UX exists for Objectives, Mid-Year, Self Evaluation as approved; if Objective attachment physical persistence is still unavailable, show the approved `PENDING_SCHEMA_REVIEW`/non-persisted state rather than inventing a field;
7. Mid-Year Objective Progress is employee-entered 0..100 and visually/semantically separate from Process Progress and performance score;
8. five-phase calendar/deadline presentation can consume injected normalized App800 config and show before-open/open/due-today/overdue/completed bilingual states; no production date hardcode;
9. boundary states `05 Objective Approved` and `10 Mid-Year Completed` provide Requester guidance to use native `Start Mid-Year` / `Start Self Evaluation` when the configured window opens; no date-based auto-transition;
10. Copy Previous UI uses the corrected local candidate/preflight foundation but performs ZERO Kintone write in this task;
11. Hoshin display reads current/new-FY snapshot/title fields already available on the record/local input; no App797 GET;
12. Export controls use normalized export foundation; exact template binary unavailable -> explicit `MISSING_LOCAL`, never fabricate a generic official workbook;
13. native Kintone comment thread remains available and is not intentionally hidden/covered/disabled;
14. 3–4 Appraiser matrices are contained inside App794 content width with matrix-only horizontal scrolling where needed; no page/body horizontal overflow; first context column remains readable/sticky where existing design supports it;
15. historical/read-only/Completed presentation remains truthful and permission-aware; UI hiding is not authorization.

Do not redesign visual direction. Port only approved behavior already represented by Preview/baseline.

## 2. Runtime implementation rules

Prefer modifying existing files/functions only:

```text
src/main-mbo-app.js
src/ui/employee-part-a-ui.js
existing src/styles/*
```

Do NOT create:
- `_final`
- `_v3`
- replacement App794 page
- parallel UI architecture

Reuse existing services/helpers when available.

Do not change:
- Process state/action topology;
- App795 routing rules;
- App796 profile/scoring ratios;
- App797 business rules;
- App800 live data;
- security/authorization model.

## 3. Local-only safety wiring

This round is UI parity, not live integration.

```text
KINTONE_GET = 0
KINTONE_WRITE = 0
KINTONE_DEPLOY = 0
APP794_LIVE_WRITE = 0
APP800_LIVE_GET = 0
APP797_LIVE_GET = 0
BROWSER_SMOKE = 0
```

Specific rules:

- Copy Previous control may call a pure/local candidate-builder path or show preflight result only. Do not call a Kintone create/update endpoint.
- Phase Calendar receives config via injected/local normalized data only.
- Hoshin consumes record/local snapshot data only.
- Export may create/use local projection only; if exact template binary is unavailable, surface `MISSING_LOCAL` and stop short of pretending an official workbook was generated.
- Do not hide native process controls as a substitute for authorization.

## 4. Parity evidence

Add/update focused tests if an existing UI test foundation exists. Do not create a huge new test architecture merely for this round.

At minimum provide source-level/local evidence for:

```text
FIVE_STAGE_UI = PASS
BILINGUAL_UI = PASS
ORDINAL_APPRAISER_LABELS = PASS
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
```

If a behavior is already present, document exact source evidence rather than rewriting it.

## 5. Test/build discipline

- Run targeted tests only as needed while implementing.
- Run the full `npm test` suite ONCE near completion.
- Because App794 UI source is expected to change, run `npm run ui:build` ONCE near completion.
- Verify expected bundle outputs are updated.
- No browser smoke and no Kintone deploy in this round.

## 6. Governance docs

After implementation, update concisely:

```text
project-docs/AI_REVIEW_PACKAGE.md
project-docs/CURRENT_STATE.md
project-docs/HANDOFF.md
```

Record exact local evidence and state that runtime/deploy verification remains for a separately authorized Final Kintone Execution round.

Do NOT edit `project-docs/CONFIRMED_BASELINE/*`.

---

# STOP CONDITIONS

STOP rather than guess if:

- a required physical App794 field is genuinely uncertain and not supported by repo/export evidence;
- closing parity would require changing frozen Process/routing/scoring semantics;
- the UI behavior cannot be made local-only without Kintone access;
- a new P0/P1 security or data-integrity issue is discovered.

Do NOT stop merely because a live Kintone verification is unavailable; implement local parity and clearly defer live verification.

---

# REQUIRED FINAL REPORT

Return exactly:

```text
IMPLEMENTATION_HEAD = <sha>
KINTONE_CALLS = 0
KINTONE_WRITES = 0
KINTONE_DEPLOYS = 0
BROWSER_SMOKE = 0

APPROVED_PREVIEW_SOURCE = preview/index.html
ACTUAL_APP794_RUNTIME_SOURCE = src/main-mbo-app.js + src/ui/employee-part-a-ui.js + existing src/styles/*

FIVE_STAGE_UI = PASS|BLOCKED
BILINGUAL_UI = PASS|BLOCKED
ORDINAL_APPRAISER_LABELS = PASS|BLOCKED
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
