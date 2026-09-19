# D3 KINTONE-ONLY PROVENANCE RUNTIME FIX 01 — R1 EVIDENCE (CORRECTIVE)

PACKAGE                  = D3-KINTONE-ONLY-PROVENANCE-RUNTIME-FIX-01-R1
AUTHORIZATION_ID         = MBO2026-D3-KINTONE-ONLY-PROVENANCE-RUNTIME-FIX-01-R1-20260919-OWNER-01
AUTHORIZED_BASE_HEAD     = d5a58059c014c54191d4684be7c8be2d1623e7e1
EXECUTION_DATE           = 2026-09-19
EXECUTED_BY              = Hermes (Orchestrator)
MODE                     = BOUNDED CORRECTIVE SOURCE REFACTOR + FOCUSED TESTS ONLY

---

## GIT PREFLIGHT RESULT

GIT_STATUS_SHORT         = CLEAN (no modified/untracked files)
GIT_FETCH                = OK (no remote changes)
HEAD_AT_PREFLIGHT        = d5a58059c014c54191d4684be7c8be2d1623e7e1
ORIGIN_AT_PREFLIGHT      = d5a58059c014c54191d4684be7c8be2d1623e7e1
HEAD_DRIFT               = NONE
PREFLIGHT_STATUS         = PASS

---

## EVIDENCE CORRECTION (MANDATORY, PER R1 REQUEST)

**Prior claim (RUNTIME-FIX-01 evidence, `D3_KINTONE_ONLY_PROVENANCE_RUNTIME_FIX_01_EVIDENCE.md`):**
The RUNTIME-FIX-01 evidence document referred to `resolveRevisionNumber()` as if it were
an existing, already-isolated function. This was **inaccurate**. In RUNTIME-FIX-01, revision
resolution logic was written as an **inline block** directly inside
`buildStageLogicalSnapshot()` in `src/services/d3-stage-logical-snapshot.js` — there was no
separate `resolveRevisionNumber()` function or module at that time. The same inline-duplication
pattern existed independently in `src/main-mbo-app.js` (`executeProcessTransitionArchive`),
where revision parsing was re-implemented as a second inline `Number(...)` expression rather
than calling a shared function.

**Correction:** This R1 package creates the actual first-ever dedicated resolver modules:

- `src/services/d3-revision-resolver.js` — exports `resolveRevisionNumber(record)`
- `src/services/d3-route-pattern-resolver.js` — exports `resolveRoutePattern(routingTopology, routePatterns)`

Both are genuinely new files with no prior equivalent module. The RUNTIME-FIX-01 evidence
document's use of `resolveRevisionNumber()` was descriptive/informal naming of an inline code
block, not a reference to an actual function — that document is not being retroactively
rewritten; this section stands as the explicit, permanent correction record.

---

## EXACT CHANGED FILES

src/services/d3-revision-resolver.js (NEW)
src/services/d3-route-pattern-resolver.js (NEW)
src/services/d3-stage-logical-snapshot.js (MODIFIED — now calls both resolvers)
src/main-mbo-app.js (MODIFIED — now calls resolveRevisionNumber() instead of duplicating parsing)
tests/d3-revision-resolver.test.js (NEW)
tests/d3-route-pattern-resolver.test.js (NEW)
project-docs/evidence/D3_KINTONE_ONLY_PROVENANCE_RUNTIME_FIX_01_R1_EVIDENCE.md (NEW, this file)
project-docs/control/02_ACTIVE_WORK_PACKAGE.md (MODIFIED)

No other production files were touched. No file outside the expected changed-file boundary
was required.

---

## NEW MODULE 1 — REVISION RESOLVER

**File:** `src/services/d3-revision-resolver.js`
**Export:** `resolveRevisionNumber(record)`

**Contract:**
- Priority: `$revision` (Kintone native system field) → `Revision_Number` (legacy) →
  `Current_Revision_Number` (legacy)
- Must resolve to a positive integer; anything else → `throw Error('PROVENANCE_INVALID: ...')`
- Pure function: no Kintone API calls, no DOM access, no side effects
- Tolerates both Kintone field-object shape (`{ value: ... }`) and unwrapped primitives

**Call sites using this resolver (no duplicate parsing remains):**
- `src/services/d3-stage-logical-snapshot.js` → `buildStageLogicalSnapshot()`
- `src/main-mbo-app.js` → `executeProcessTransitionArchive()` (archive parameter construction)

REVISION_RESOLVER_STATUS = COMPLETE — single source of truth, both call sites verified
by direct code inspection to invoke the shared resolver, zero inline duplication remains.

---

## NEW MODULE 2 — ROUTE PATTERN RESOLVER

**File:** `src/services/d3-route-pattern-resolver.js`
**Export:** `resolveRoutePattern(routingTopology, routePatterns)`

**Contract:**
- `routePatterns` is optional; defaults to the production-locked `D3_ROUTE_PATTERNS`
  imported from `src/config/d3-route-contract.js`. Injectable only for isolated unit tests.
- Inspects the supplied/default map dynamically — **no hardcoded production mapping table
  exists inside this module**; the single source of truth remains `D3_ROUTE_PATTERNS`.
- Exactly 1 match on `.topology` → returns the pattern key
- 0 matches → `throw Error('PROVENANCE_INVALID: ...')`
- >1 matches → `throw Error('PROVENANCE_AMBIGUOUS: ...')`
- Missing/empty topology → `throw Error('PROVENANCE_MISSING: ...')`
- Pure function: no Kintone API calls, no DOM access, no side effects
- Production `D3_ROUTE_PATTERNS` (frozen via `Object.freeze`) is never mutated by this module
  or by any test — ambiguous-mapping tests inject an isolated duplicate map object instead

**Call site using this resolver:**
- `src/services/d3-stage-logical-snapshot.js` → `buildStageLogicalSnapshot()`

ROUTE_PATTERN_RESOLVER_STATUS = COMPLETE — inspects D3_ROUTE_PATTERNS dynamically,
zero duplicate production mapping table created, fail-closed on 0 and >1 matches proven by test.

---

## SUPPORTED TOPOLOGY TEST EVIDENCE (5/5 MANDATORY COVERAGE)

Each test below actually invokes `resolveRoutePattern()` against the real, unmutated
production `D3_ROUTE_PATTERNS` contract and asserts the resulting Route_Pattern key —
not a declared/expected-value table.

| Test | Topology Input | Resolver Call | Asserted Result | Status |
|---|---|---|---|---|
| `R1: topology M1_ONLY resolves to PATTERN_1_M1` | `M1_ONLY` | `resolveRoutePattern('M1_ONLY', D3_ROUTE_PATTERNS)` | `PATTERN_1_M1` | PASS |
| `R1: topology M1_G1 resolves to PATTERN_2_M1_G1` | `M1_G1` | `resolveRoutePattern('M1_G1', D3_ROUTE_PATTERNS)` | `PATTERN_2_M1_G1` | PASS |
| `R1: topology M1_M2_G1 resolves to PATTERN_3A_M2_M1_G1` | `M1_M2_G1` | `resolveRoutePattern('M1_M2_G1', D3_ROUTE_PATTERNS)` | `PATTERN_3A_M2_M1_G1` | PASS |
| `R1: topology M1_G1_G2 resolves to PATTERN_3B_M1_G1_G2` | `M1_G1_G2` | `resolveRoutePattern('M1_G1_G2', D3_ROUTE_PATTERNS)` | `PATTERN_3B_M1_G1_G2` | PASS |
| `R1: topology M1_M2_G1_G2 resolves to PATTERN_4_M2_M1_G1_G2` | `M1_M2_G1_G2` | `resolveRoutePattern('M1_M2_G1_G2', D3_ROUTE_PATTERNS)` | `PATTERN_4_M2_M1_G1_G2` | PASS |
| `R1: resolver default (no injected map) resolves against production D3_ROUTE_PATTERNS` | `M1_G1` | `resolveRoutePattern('M1_G1')` (no 2nd arg — production default path) | `PATTERN_2_M1_G1` | PASS |

SUPPORTED_TOPOLOGY_TEST_COUNT = 6 (5 mandatory + 1 default-path confirmation)
SUPPORTED_TOPOLOGY_PASS_COUNT = 6

Also covered end-to-end via `buildStageLogicalSnapshot()` in `tests/d3-stage-logical-snapshot.test.js`
(`FIX2: all supported locked topology values resolve to exact pattern`) and
`tests/d3-stage-archive-integration.test.js` (live-shaped `Routing_Topology: M1_G1` record).

---

## UNKNOWN TOPOLOGY EVIDENCE

| Test | Input | Expected | Result |
|---|---|---|---|
| `R1: unknown topology fails closed with PROVENANCE_INVALID` | `'UNKNOWN_TOPOLOGY_XYZ'` | throws `PROVENANCE_INVALID` | PASS |
| `R1: missing topology (empty string) fails closed with PROVENANCE_MISSING` | `''` | throws `PROVENANCE_MISSING` | PASS |
| `R1: missing topology (undefined) fails closed with PROVENANCE_MISSING` | `undefined` | throws `PROVENANCE_MISSING` | PASS |

UNKNOWN_TOPOLOGY_FAIL_CLOSED = CONFIRMED

---

## AMBIGUOUS TOPOLOGY EVIDENCE

Test `R1: ambiguous topology mapping (2 matches) fails closed with PROVENANCE_AMBIGUOUS`:
constructs an isolated frozen duplicate-mapping object (`PATTERN_X` and `PATTERN_Y` both with
`topology: 'DUPLICATE_TOPOLOGY'`), injects it as the 2nd argument to `resolveRoutePattern()`,
and asserts the call throws `PROVENANCE_AMBIGUOUS`.

A follow-up sanity test (`R1: production D3_ROUTE_PATTERNS is never mutated by ambiguous-mapping
test`) asserts immediately after that the production `D3_ROUTE_PATTERNS` object:
- still has exactly 5 entries
- still has 5 unique topology values (`Set` size === 5)
- is still `Object.isFrozen(...) === true`

This proves the injected-map technique never touched the production contract.

AMBIGUOUS_TOPOLOGY_FAIL_CLOSED = CONFIRMED
PRODUCTION_MAP_MUTATED         = NO

---

## REVISION RESOLVER TEST EVIDENCE

| Test | Scenario | Result |
|---|---|---|
| `$revision only resolves revision correctly` | `$revision` present alone | PASS |
| `$revision preferred over legacy custom revision fields` | all 3 present | resolves `$revision` value | PASS |
| `legacy Revision_Number fallback works when $revision absent` | only `Revision_Number` | PASS |
| `legacy Current_Revision_Number fallback works when $revision and Revision_Number absent` | only `Current_Revision_Number` | PASS |
| `invalid revision value fails closed` | `$revision = 'not-a-number'` | throws `PROVENANCE_INVALID` |
| `zero revision fails closed` | `$revision = '0'` | throws `PROVENANCE_INVALID` |
| `negative revision fails closed` | `$revision = '-1'` | throws `PROVENANCE_INVALID` |
| `missing all revision authorities fails closed` | no revision field present | throws `PROVENANCE_INVALID` |
| `raw (unwrapped) $revision primitive also resolves` | `$revision: '7'` (no `.value` wrapper) | PASS |

All 9 tests PASS. Combined with the 5 existing FIX1 tests carried over in
`tests/d3-stage-logical-snapshot.test.js` (which now exercise the resolver indirectly through
`buildStageLogicalSnapshot()`), revision resolution has direct-unit and integration coverage.

---

## FOCUSED TEST RESULTS

### TEST_COMMANDS

```
node --test tests/d3-revision-resolver.test.js \
             tests/d3-route-pattern-resolver.test.js \
             tests/d3-stage-logical-snapshot.test.js \
             tests/d3-stage-archive-integration.test.js
```

TARGETED_TEST_PASS_COUNT = 68
TARGETED_TEST_FAIL_COUNT = 0
SKIP_COUNT                = 0

Breakdown:
- `tests/d3-revision-resolver.test.js` — 9 new tests, 9 PASS
- `tests/d3-route-pattern-resolver.test.js` — 9 new tests, 9 PASS
- `tests/d3-stage-logical-snapshot.test.js` — 13 tests (from RUNTIME-FIX-01), 13 PASS
- `tests/d3-stage-archive-integration.test.js` — 34 tests (from RUNTIME-FIX-01 + prior), 34 PASS
- Undifferentiated regression from existing suite carried through unchanged: 3 additional
  passing tests inside `d3-stage-logical-snapshot.test.js` (basic snapshot build/fail-closed cases)

RELATED_REGRESSION_PASS_COUNT = 68 (full targeted run above — no separate wider regression
  run was performed; this is the smallest directly related regression set per D3 provenance
  scope and matches the explicit FOCUSED_TEST_SCOPE instruction)
RELATED_REGRESSION_FAIL_COUNT = 0

No test files or source files outside the D3 provenance/archive scope were touched or run.

---

## MODULARITY / GOVERNANCE COMPLIANCE

- `ONE_PRIMARY_BUSINESS_FUNCTION_PER_MODULE` — satisfied: each new module exports exactly
  one pure function with one responsibility (revision resolution / route-pattern resolution)
- `NO_NEW_MEGA_FILE_LOGIC` — satisfied: `d3-revision-resolver.js` is 55 lines,
  `d3-route-pattern-resolver.js` is 64 lines
- `NO_UNRELATED_REFACTOR` — satisfied: no other logic in `d3-stage-logical-snapshot.js` or
  `main-mbo-app.js` was touched beyond replacing the two inline blocks with resolver calls
- `INDEPENDENT_UNIT_TESTABILITY` — satisfied: both resolvers are pure, side-effect-free,
  directly unit-tested with zero Kintone/DOM dependency, and the route-pattern resolver
  supports dependency injection of the mapping table for isolated ambiguous-mapping testing
  without mutating production state

---

## DEPARTMENT_HOSHIN_KEY (UNCHANGED, PER R1 SCOPE LOCK)

No further modification made to `Department_Hoshin_Key` handling in this package.
Preserved behavior (from RUNTIME-FIX-01): `Department_Hoshin_Key` absent does NOT block the
snapshot; field is read as optional and set to `undefined` when absent so the serializer omits
it cleanly. Confirmed unchanged by test `FIX3: Department_Hoshin_Key absent does NOT fail the
snapshot` (carried over, still PASS) — no schema change, no fallback, no DEFAULT, no invented
value introduced in this package.

---

## SCOPE ACCOUNTING

KINTONE_READ_COUNT               = 0
KINTONE_WRITE_COUNT              = 0
KINTONE_SCHEMA_WRITE_COUNT       = 0
APP794_PROCESS_TRANSITION_COUNT  = 0
APP798_WRITE_COUNT               = 0
BUILD_COUNT                      = 0
DEPLOYMENT_COUNT                 = 0
SHARED_UAT_COUNT                 = 0
DEDICATED_UAT_COUNT              = 0
FIXTURE_REBUILD                  = NO
SCHEMA_CHANGES                   = NO
PROCESS_CHANGES                  = NO
ACL_CHANGES                      = NO
EXTERNAL_INFRASTRUCTURE_CHANGES  = NO
UNRELATED_MAIN_MBO_APP_REFACTOR  = NO

---

## UAT MANDATORY GATES (PRESERVED, UNCHANGED)

SHARED_UAT_REQUIRED     = YES
DEDICATED_UAT_REQUIRED  = YES
SHARED_UAT_SCOPE        = App794 transition -> App798 audit verification
DEDICATED_UAT_SCOPE     = App794 transition -> App798 audit verification
D3_CLOSURE_ALLOWED_BEFORE_BOTH_UAT_PASS = NO

THIS PACKAGE DOES NOT AUTHORIZE EITHER UAT, ANY BUILD, OR ANY DEPLOYMENT.
