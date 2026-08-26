# AI ACTIVE TASK — POST-CORE UI/UX V1 CANDIDATE R1 CORRECTION — GIT/LOCAL ONLY

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Primary target: App794 `MBO V2 Sandbox`
> Mode: PROJECT CLOSE MODE / UIUX V1 / LOCAL CORRECTION
> Kintone write/deploy authorization: **NONE — DO NOT WRITE OR DEPLOY KINTONE**

## Review checkpoint

Candidate commit reviewed: `cb9d1bbfae6b6c72bd1f6c96549acba33aae9b62`.

Accepted gates from candidate:
- Core V1 frozen behavior preserved.
- Dynamic record/error rendering escape approach = PASS.
- `--build-only` exits before Kintone client import/upload/API/deploy = PASS.
- `src/styles/mbo-employee.css` and `dist/mbo-employee.css` blob SHA matched.
- candidate reported `555/555` tests PASS.
- no Process/routing/scoring/validation-workflow/Record_Key core files changed.
- no Kintone calls/writes/deploys.

Candidate is **NOT YET APPROVED FOR DEPLOY** because of the two MUST FIX presentation defects below.

Documentation note: prior candidate evidence wrote `STARTING_HEAD = 4dbfec4736f338ee3b9a5ae31bca36f04c66e2c3`, but Git parent/compare proves the actual task base was `4dbfec4cb45cce7e93d80bb8b8b44fcf5ae58606`. Treat the former as an evidence typo and correct it in the next evidence block; do not infer code drift.

## MUST FIX 1 — First Manager route context must follow topology AND value

Current candidate effectively uses:
`topology.includes('M2') || First_Manager_User has value`

This can display First Manager on an `M1_G1` record if stale First_Manager_User data exists.

Required behavior:
- show First Manager route step **only when BOTH**:
  1. saved `Routing_Topology` actually contains M2; AND
  2. `First_Manager_User` has a value.
- `M1_G1` must never display First Manager as a normal route, even if a stale First_Manager_User value is present.
- presentation only; do not change routing service, snapshots, workflow validation, Process config or data.

## MUST FIX 2 — lifecycle completion presentation at statuses 05 and 10

Current candidate maps:
- `05 Objective Approved` into macro stage 1 and renders Objectives as `Active`;
- `10 Mid-Year Completed` into macro stage 2 and renders Mid-Year as `Active`.

Required visual semantics:
- `05 Objective Approved`: Objectives = completed; Mid-Year = not started/waiting (not falsely Active).
- `10 Mid-Year Completed`: Objectives + Mid-Year = completed; Year-End = not started/waiting (not falsely Active).
- review statuses 03/04, 08/09, 13/14/15 remain in-review in their correct macro phase.
- `16 Completed`: all lifecycle stages completed.
- do not change `STATUS_TO_STAGE_MAP` or any business/process logic.

## Small safety cleanup — do not silently invent M1_G1 in display

Where the new UI guidance/route summary reads a saved topology, do not silently convert blank/unknown topology into `M1_G1` for presentation. Display a configuration/unavailable warning instead. This is display fail-closed only and must not alter runtime routing behavior.

## Allowed files

Modify existing files only unless technically unavoidable:
- `src/ui/employee-part-a-ui.js`
- `tests/objective-save-validation.test.js`
- generated `dist/mbo-employee-app.js`
- `project-docs/AI_REVIEW_PACKAGE.md`, `CURRENT_STATE.md`, `HANDOFF.md`, `IMPLEMENTATION_STATUS.md`, `CHANGELOG_AI.md` for evidence only

CSS should not change unless genuinely needed for the corrected lifecycle state. `scripts/kintone/deploy-custom-ui.js` and `package.json` should remain unchanged unless a defect is discovered; do not expand scope.

## Tests required

Extend the existing UI candidate test in `tests/objective-save-validation.test.js` to prove:
1. M1_G1 + stale populated First_Manager_User does **not** qualify for First Manager route display.
2. canonical M2 topology `M1_M2_G1` + populated First_Manager_User does qualify.
3. status05 presentation marks Objectives completed and does not mark it Active.
4. status10 presentation marks Objectives and Mid-Year completed and does not mark Mid-Year Active.
5. 03/04, 08/09, 13/14/15 remain in-review in the correct phase.
6. blank/unknown topology presentation warns/fails closed instead of pretending M1_G1.
7. existing HTML escaping/non-mutation tests still pass.

Use canonical topology names in tests; replace any noncanonical presentation-test value such as `M2_G1` with `M1_M2_G1`.

## Execution / evidence

- Run `npm test` exactly once after corrections.
- Run `npm run ui:build` exactly once.
- Verify classic bundle parse/residue gates PASS.
- Verify CSS source/dist still exact match if CSS unchanged.
- Inspect diff against `cb9d1bb...`: no frozen-core changes.
- Kintone calls/writes/deploys must remain 0.

Required evidence:
```text
POST_CORE_UIUX_V1_CANDIDATE_R1 = COMPLETE / BLOCKED
STARTING_HEAD = cb9d1bbfae6b6c72bd1f6c96549acba33aae9b62
PRIOR_EVIDENCE_STARTING_HEAD_TYPO_CORRECTED = PASS/FAIL
FIRST_MANAGER_ROUTE_TOPOLOGY_AND_VALUE_GATE = PASS/FAIL
STATUS05_COMPLETION_PRESENTATION = PASS/FAIL
STATUS10_COMPLETION_PRESENTATION = PASS/FAIL
REVIEW_STATUS_PHASE_PRESENTATION = PASS/FAIL
UNKNOWN_TOPOLOGY_DISPLAY_FAIL_CLOSED = PASS/FAIL
DYNAMIC_HTML_ESCAPE_GATE = PASS/FAIL
NPM_TEST = actual/PASS/FAIL
BUILD_ONLY_ZERO_KINTONE_CALL_GATE = PASS/FAIL
CLASSIC_BUNDLE_PARSE = PASS/FAIL
SRC_DIST_CSS_MATCH = PASS/FAIL
KINTONE_CALL_COUNT = 0
KINTONE_WRITE_COUNT = 0
FROZEN_CORE_CHANGE_COUNT = 0
NEW_FILE_COUNT = 0
GIT_DIFF_CHECK = PASS/FAIL
GIT_PUSH_SYNC = PASS/FAIL
NEXT_ACTION = CHATGPT REVIEW; IF PASS REQUEST FRESH APP794 UI DEPLOY AUTHORIZATION
```

## Hard boundaries

Forbidden:
- any Kintone upload/customization PUT/deploy;
- Process/schema/ACL/notification/record changes;
- App795/App53/App796/other-app writes;
- changes to routing/scoring/workflow validation/Record_Key/native authorization behavior;
- custom workflow action buttons;
- Dashboard work;
- framework rewrite/new UI architecture.

# STOP CONDITION

After the narrow source/test/build/evidence correction and push: **STOP**. Do not deploy App794.