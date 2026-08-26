# AI ACTIVE TASK — POST-CORE UI/UX V1 CANDIDATE R2 TOPOLOGY DISPLAY CORRECTION — GIT/LOCAL ONLY

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Primary target: App794 `MBO V2 Sandbox`
> Mode: PROJECT CLOSE MODE / UIUX V1 / NARROW LOCAL CORRECTION
> Kintone write/deploy authorization: **NONE — DO NOT WRITE OR DEPLOY KINTONE**

## Review checkpoint

R1 execution commit reviewed: `484050df857d5d5cfd050e40c7b655c73cdf3823`.

R1 accepted:
- First Manager route display now requires topology containing M2 **AND** populated `First_Manager_User`.
- `M1_G1` with stale `First_Manager_User` no longer displays First Manager.
- status `05 Objective Approved` now shows Objectives completed / Mid-Year waiting.
- status `10 Mid-Year Completed` now shows Objectives + Mid-Year completed / Year-End waiting.
- review statuses 03/04, 08/09, 13/14/15 show in-review in the correct macro phase.
- prior STARTING_HEAD evidence typo corrected.
- HTML escaping, build-only path, frozen Core preservation and zero-Kintone execution remain accepted.

## ONE REMAINING MUST FIX — non-empty invalid/unsupported topology is not fail-closed in display

R1 evidence claims `UNKNOWN_TOPOLOGY_DISPLAY_FAIL_CLOSED = PASS`, but source currently treats topology as unknown only when blank/null:

`const isUnknownTopology = !rawTopology`

Therefore non-empty invalid values such as `INVALID_TOPOLOGY` are still treated as normal guidance. `_renderRouteContext()` also treats any non-empty topology as a normal badge, and `rawTopology.includes('M2')` can allow a fabricated/invalid value such as `INVALID_M2` to qualify for First Manager display if a stale user value exists.

This is a presentation correctness defect. Frozen runtime already fails closed on unknown topology; UI must not present an invalid route as normal.

## Required behavior

Use an exact UI topology classifier/helper in the existing UI file. Do not change runtime routing/validation constants or services.

Canonical topology names recognized by the architecture:
- `M1_G1`
- `M1_M2_G1`
- `M1_G1_G2`
- `M1_M2_G1_G2`

Presentation rules for current V1:
1. `M1_G1` = normal current V1 route; no First Manager.
2. `M1_M2_G1` = recognized M2 route context; First Manager displays only when `First_Manager_User` is populated.
3. `M1_G1_G2` and `M1_M2_G1_G2` = recognized but **unsupported by current V1 workflow**; display a clear configuration/unsupported warning and do not portray a normal approval route.
4. blank/null or any noncanonical value (`INVALID_TOPOLOGY`, `INVALID_M2`, etc.) = configuration warning/fail-closed presentation; do not portray a normal approval route and do not show First Manager as a valid route.
5. Do not mutate record values or change routing/workflow behavior.

## Allowed files

Modify existing files only:
- `src/ui/employee-part-a-ui.js`
- `tests/objective-save-validation.test.js`
- generated `dist/mbo-employee-app.js`
- evidence docs only (`AI_REVIEW_PACKAGE.md`, `CURRENT_STATE.md`, `HANDOFF.md`, `IMPLEMENTATION_STATUS.md`, `CHANGELOG_AI.md`)

Do not change CSS, deploy script or package.json unless technically unavoidable; if unavoidable, STOP and explain instead of expanding scope.

## Tests required

Extend the existing UI R1 test to prove:
1. `M1_G1` + stale First Manager remains hidden.
2. `M1_M2_G1` + populated First Manager remains valid for display.
3. `INVALID_TOPOLOGY` returns warning/fail-closed display.
4. `INVALID_M2` + populated First Manager does **not** display First Manager or normal route.
5. blank/null remain warning/fail-closed.
6. `M1_G1_G2` and `M1_M2_G1_G2` display unsupported-current-V1 warning and do not present a normal route.
7. status05/status10/review-phase tests and escaping/non-mutation tests remain passing.

Execution:
- run `npm test` exactly once after correction;
- run `npm run ui:build` exactly once;
- classic bundle parse/residue PASS;
- inspect diff against `484050df...`;
- Kintone calls/writes/deploys = 0.

## Required evidence

```text
POST_CORE_UIUX_V1_CANDIDATE_R2 = COMPLETE / BLOCKED
STARTING_HEAD = 484050df857d5d5cfd050e40c7b655c73cdf3823
NONEMPTY_INVALID_TOPOLOGY_DISPLAY_FAIL_CLOSED = PASS/FAIL
INVALID_M2_FIRST_MANAGER_DISPLAY_BLOCKED = PASS/FAIL
G2_UNSUPPORTED_V1_DISPLAY_WARNING = PASS/FAIL
M1_G1_ROUTE_PRESENTATION = PASS/FAIL
M1_M2_G1_ROUTE_PRESENTATION = PASS/FAIL
STATUS05_COMPLETION_PRESENTATION = PASS/FAIL
STATUS10_COMPLETION_PRESENTATION = PASS/FAIL
REVIEW_STATUS_PHASE_PRESENTATION = PASS/FAIL
DYNAMIC_HTML_ESCAPE_GATE = PASS/FAIL
NPM_TEST = actual/PASS/FAIL
BUILD_ONLY_ZERO_KINTONE_CALL_GATE = PASS/FAIL
CLASSIC_BUNDLE_PARSE = PASS/FAIL
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
- Kintone upload/customization PUT/deploy;
- Process/schema/ACL/notification/record changes;
- App795/App53/App796/other-app writes;
- routing/scoring/workflow validation/Record_Key/native authorization changes;
- custom workflow action buttons;
- Dashboard work;
- framework rewrite or new files.

# STOP CONDITION

After the narrow R2 source/test/build/evidence correction and push: **STOP**. Do not deploy App794.
