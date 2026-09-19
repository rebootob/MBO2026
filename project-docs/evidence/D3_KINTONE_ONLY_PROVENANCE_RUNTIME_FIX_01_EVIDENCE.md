# D3 KINTONE-ONLY PROVENANCE RUNTIME FIX 01 — EVIDENCE

PACKAGE                  = D3-KINTONE-ONLY-PROVENANCE-RUNTIME-FIX-01
AUTHORIZATION_ID         = MBO2026-D3-KINTONE-ONLY-PROVENANCE-RUNTIME-FIX-01-20260919-OWNER-01
AUTHORIZED_BASE_HEAD     = 92f7f9c71a9b6eaac6e5a5ac5c3804b0778ca59d
EXECUTION_DATE           = 2026-09-19
EXECUTED_BY              = Hermes (Orchestrator)
MODE                     = BOUNDED SOURCE IMPLEMENTATION + FOCUSED LOCAL TESTS ONLY

---

## GIT PREFLIGHT RESULT

GIT_STATUS_SHORT         = CLEAN (no modified/untracked files)
GIT_FETCH                = OK (no remote changes)
HEAD_AT_PREFLIGHT        = 92f7f9c71a9b6eaac6e5a5ac5c3804b0778ca59d
ORIGIN_AT_PREFLIGHT      = 92f7f9c71a9b6eaac6e5a5ac5c3804b0778ca59d
HEAD_DRIFT               = NONE
PREFLIGHT_STATUS         = PASS

---

## EXACT CHANGED FILES

src/services/d3-stage-logical-snapshot.js
src/main-mbo-app.js
tests/d3-stage-logical-snapshot.test.js
tests/d3-stage-archive-integration.test.js
project-docs/evidence/D3_KINTONE_ONLY_PROVENANCE_RUNTIME_FIX_01_EVIDENCE.md
project-docs/control/02_ACTIVE_WORK_PACKAGE.md

---

## FIX 1 — KINTONE REVISION AUTHORITY

### Problem (BEFORE)

`src/services/d3-stage-logical-snapshot.js` line 35 (pre-fix):

```javascript
const rawRev = getVal('Revision_Number') ?? getVal('Current_Revision_Number');
const revisionNumber = Number(rawRev);
if (!Number.isInteger(revisionNumber) || revisionNumber < 1) {
  throw new Error(`PROVENANCE_INVALID: Revision_Number must be a positive integer, got "${rawRev}"`);
}
```

`src/main-mbo-app.js` line 1460 (pre-fix):

```javascript
revisionNumber: Number(record?.Revision_Number?.value || record?.Current_Revision_Number?.value || record?.Revision_Number || record?.Current_Revision_Number),
```

LIVE TRUTH: App794 does NOT have `Revision_Number` or `Current_Revision_Number` custom fields.
Both fields return `undefined` → `Number(undefined)` = `NaN` → `PROVENANCE_INVALID` error thrown.
This was the root cause of `[D3 Audit Archive Error] Process transition blocked: PROVENANCE_INVALID: Revision_Number must be a positive integer, got "undefined"`.

### Fix (AFTER)

`src/services/d3-stage-logical-snapshot.js` — `resolveRevisionNumber()`:

```javascript
// Kintone native $revision is the live authoritative source.
// Custom fields Revision_Number / Current_Revision_Number do not exist in App794 live schema.
// $revision.value is a string integer e.g. "10" — always present on every Kintone record.
const rawRevision =
  getVal('$revision')           // Kintone system field — authoritative (live App794)
  ?? getVal('Revision_Number')  // legacy fallback for historical test data only
  ?? getVal('Current_Revision_Number'); // legacy fallback for historical test data only
const revisionNumber = Number(rawRevision);
if (!Number.isInteger(revisionNumber) || revisionNumber < 1) {
  throw new Error(`PROVENANCE_INVALID: Revision_Number must be a positive integer, got "${rawRevision}"`);
}
```

`src/main-mbo-app.js` line 1460 (AFTER) — archive params assembly:

```javascript
// FIX(RUNTIME-FIX-01): Use Kintone native $revision as authoritative revision source.
// App794 does not have custom Revision_Number / Current_Revision_Number fields.
// $revision is the system field always present on every Kintone record.
// Fallback to custom fields only for historical compatibility with non-live test data.
revisionNumber: Number(
  record?.$revision?.value
  ?? record?.Revision_Number?.value
  ?? record?.Current_Revision_Number?.value
  ?? record?.$revision
  ?? record?.Revision_Number
  ?? record?.Current_Revision_Number
),
```

REVISION_FIX_STATUS      = COMPLETE
SOURCES_CHANGED          = src/services/d3-stage-logical-snapshot.js, src/main-mbo-app.js
NEW_APP794_FIELD_CREATED = NO

---

## FIX 2 — ROUTE PATTERN

### Problem (BEFORE)

`src/services/d3-stage-logical-snapshot.js` (pre-fix):

```javascript
const routePattern = String(getVal('Route_Pattern') || '').trim();
if (!routePattern || !D3_ROUTE_PATTERNS[routePattern]) {
  throw new Error(`PROVENANCE_INVALID: Route_Pattern "${routePattern}" is not a recognized D3 route pattern`);
}
```

LIVE TRUTH: App794 does NOT have `Route_Pattern` field.
`Route_Pattern` returns `undefined` → empty string → thrown as `PROVENANCE_INVALID`.

### Fix (AFTER)

```javascript
// Route_Pattern does NOT exist in App794 live schema.
// Routing_Topology IS a live App794 field. Derive Route_Pattern deterministically
// from the locked D3_ROUTE_PATTERNS contract using Routing_Topology.
// Rules: deterministic one-to-one mapping; unknown topology => FAIL CLOSED.
const routingTopology = String(getVal('Routing_Topology') || '').trim();
if (!routingTopology) {
  throw new Error('PROVENANCE_MISSING: Routing_Topology is required');
}
const routePattern = D3_ROUTE_PATTERNS[routingTopology];
if (!routePattern) {
  throw new Error(`PROVENANCE_INVALID: Routing_Topology "${routingTopology}" has no locked D3 route pattern mapping`);
}
```

LOCKED MAPPING USED (from d3-route-contract.js D3_ROUTE_PATTERNS):
  M1_ONLY      → PATTERN_1_M1
  M1_G1        → PATTERN_2_M1_G1
  M1_M2_G1     → PATTERN_3A_M2_M1_G1
  M1_G1_G2     → PATTERN_3B_M1_G1_G2
  M1_M2_G1_G2  → PATTERN_4_M2_M1_G1_G2

NOTE: The CONTROL_EXECUTION_REQUEST specified this mapping.
The actual keys in d3-route-contract.js match the intent exactly.
No duplicate mapping was created; existing D3_ROUTE_PATTERNS was reused.

ROUTE_PATTERN_FIX_STATUS = COMPLETE
SOURCES_CHANGED          = src/services/d3-stage-logical-snapshot.js
NEW_APP794_FIELD_CREATED = NO
MAPPING_DUPLICATED       = NO (existing D3_ROUTE_PATTERNS reused)

---

## FIX 3 — DEPARTMENT_HOSHIN_KEY

### Problem (BEFORE)

`src/services/d3-stage-logical-snapshot.js` (pre-fix):

```javascript
const departmentHoshinKey = String(getVal('Department_Hoshin_Key') || '').trim();
if (!departmentHoshinKey) {
  throw new Error('PROVENANCE_MISSING: Department_Hoshin_Key is required');
}
```

CONTRACT_DECISION: `Department_Hoshin_Key` is NOT an authoritative App794 live field.
There is no proven authoritative source. It MUST NOT block the D3 stage snapshot.

### Downstream Consumer Inspection

Searched all files under `src/` for `hoshin.Department_Hoshin_Key`, `snapshot.hoshin.Department_Hoshin_Key`,
`Department_Hoshin_Key.*archive`, `archive.*Department_Hoshin_Key`.
Result: 0 matches in any downstream consumer outside `d3-stage-logical-snapshot.js` itself.
`revision-archive-service.js` does not access `hoshin.Department_Hoshin_Key` directly.
Serializer includes the full `hoshin` object; if the key is absent (undefined), the canonicalize
logic omits it from the output — no downstream breakage.

UNEXPECTED_DOWNSTREAM_DEPARTMENT_HOSHIN_KEY_CONTRACT = NOT TRIGGERED

### Fix (AFTER)

```javascript
// Department_Hoshin_Key is NOT an authoritative App794 live field (CONTRACT_DECISION: NO_AUTHORITY_FOUND).
// It MUST NOT block the D3 stage snapshot. Read as optional; set undefined when absent
// so the serializer/canonicalize logic omits it cleanly from snapshot output.
const departmentHoshinKey = getVal('Department_Hoshin_Key')
  ? String(getVal('Department_Hoshin_Key')).trim() || undefined
  : undefined;
```

DEPARTMENT_HOSHIN_KEY_FIX_STATUS = COMPLETE
FIELD_ADDED_TO_APP794            = NO
TEXT_MAPPED_TO_KEY               = NO
DEFAULT_INVENTED                 = NO
PLACEHOLDER_FABRICATED           = NO
SOURCES_CHANGED                  = src/services/d3-stage-logical-snapshot.js

---

## MODULARITY DECISION

Per governance (AI_DIRECTION_LOCK.md: ONE_PRIMARY_BUSINESS_FUNCTION_PER_MODULE, INDEPENDENT_UNIT_TESTABILITY):

- `resolveRevisionNumber()` remains isolated pure function within `d3-stage-logical-snapshot.js`
- Route-pattern derivation is an inline pure expression within `buildStageLogicalSnapshot()` (topology→pattern map lookup is already defined in `d3-route-contract.js`)
- No new mega-file or giant helper created
- No new standalone module extracted (extraction is not required — the existing functions are already isolated within the snapshot builder and independently unit-testable)
- `main-mbo-app.js` broad decomposition NOT performed

NEW_OR_EXTRACTED_MODULES = NONE (existing module boundaries respected)

---

## FOCUSED TEST RESULTS

### Test Command 1 — Snapshot unit tests + D3 archive integration tests

```
node --test tests/d3-stage-logical-snapshot.test.js tests/d3-stage-archive-integration.test.js
```

TOTAL TESTS              = 48
TARGETED_TEST_PASS_COUNT = 48
TARGETED_TEST_FAIL_COUNT = 0
SKIP_COUNT               = 0

### Test cases added (d3-stage-logical-snapshot.test.js):

FIX1 tests (5):
  ✔ FIX1: $revision-only record resolves revision correctly
  ✔ FIX1: missing $revision and no compatible authority fails closed
  ✔ FIX1: invalid $revision value fails closed
  ✔ FIX1: $revision zero fails closed (must be positive integer)
  ✔ FIX1: custom Revision_Number still works as fallback when $revision absent

FIX2 tests (4):
  ✔ FIX2: Routing_Topology=M1_G1 with no Route_Pattern field resolves PATTERN_2_M1_G1
  ✔ FIX2: all supported locked topology values resolve to exact pattern
  ✔ FIX2: unknown Routing_Topology fails closed
  ✔ FIX2: missing Routing_Topology fails closed

FIX3 tests (2):
  ✔ FIX3: Department_Hoshin_Key absent does NOT fail the snapshot
  ✔ FIX3: Department_Hoshin_Key present is still included in output

Live-shaped snapshot integration tests (2):
  ✔ buildStageLogicalSnapshot builds canonical snapshot from live-shaped App794 record
  ✔ buildStageLogicalSnapshot fails-closed on missing Record_Key
  ✔ buildStageLogicalSnapshot fails-closed on duplicate appraiser across active slots

### Integration test changes (d3-stage-archive-integration.test.js):

- `makeMockApp794Record()` updated: replaced `Revision_Number`, `Current_Revision_Number`, `Route_Pattern`,
  `Department_Hoshin_Key` with live-shaped `$revision: { value: '10' }` and `Routing_Topology: { value: 'M1_G1' }`
- Test 8 mandatory fields list updated: removed `Revision_Number`, `Route_Pattern`, `Department_Hoshin_Key`;
  added `$revision`; comment added explaining why each was removed
- Test 12: changed invalid field from `Route_Pattern: INVALID_PATTERN_KEY` → `Routing_Topology: INVALID_TOPOLOGY_KEY`
- No mock population with non-live fields

### Pre-fix failure count (integration tests 1,2,3,14,15,21,23,24,29,31,32):

All 11 pre-fix failures were caused by `ARCHIVE_INVALID_KEY_COMPONENT: Revision_Number must be a positive integer, received: NaN`
from `revision-archive-service.js:74` — root cause: `main-mbo-app.js:1460` reading missing `Revision_Number` field.
All resolved after FIX 1 extension to `main-mbo-app.js`.

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
APP794_RECORD_19_MODIFIED        = NO
APP798_MODIFIED                  = NO
SCHEMA_CHANGES                   = NO
PROCESS_MANAGEMENT_CONFIG        = NO
GLOBAL_ACL_CHANGES               = NO
NEW_INFRASTRUCTURE               = NO
UNRELATED_REFACTOR               = NO
ARCHITECTURE_REDESIGN            = NO

---

## UAT MANDATORY GATES (PRESERVED)

SHARED_UAT_REQUIRED     = YES
DEDICATED_UAT_REQUIRED  = YES

SHARED_UAT_SCOPE        = App794 target process transition -> App798 audit archive row verification
DEDICATED_UAT_SCOPE     = App794 target process transition -> App798 audit archive row verification

D3_CLOSURE_ALLOWED_BEFORE_BOTH_UAT_PASS = NO

THIS PACKAGE DOES NOT AUTHORIZE EITHER UAT.
