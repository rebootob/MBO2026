# D3 Implementation Readiness Plan — Evidence / Planning Only

Date: 2026-09-09 ICT  
Work Package: `D3-IMPLEMENTATION-READINESS-PLAN`  
Type: `EVIDENCE / PLANNING ONLY`  
Owner Authorization: `APPROVED`  
Starting HEAD: `228508664ced464ad50bf9a5833d7a1a9069a581`  
Repository: `rebootob/MBO2026`  
Canonical Branch: `ai/antigravity-wp002c`

## 1. Executive verdict

```text
D3_IMPLEMENTATION_READINESS_PLAN = COMPLETE / EVIDENCE-GROUNDED
D3_ARCHITECTURE = LOCKED THROUGH OWNER_DEC_D3_008
D3_IMPLEMENTATION_AUTHORIZED = NO
D3_SCHEMA_WRITE_AUTHORIZED = NO
D3_KINTONE_READ_AUTHORIZED = NO BY THIS PACKAGE
D3_KINTONE_WRITE_AUTHORIZED = NO
D3_DEPLOYMENT_AUTHORIZED = NO
PRODUCTION_READY = NO
```

D3 is ready to move from architecture into **bounded implementation packages**, but implementation must be staged. The safe path is local-first implementation and automated evidence, followed by a separately authorized read-only live preflight, then separately authorized Sandbox migration/deployment and UAT. Production cutover remains a final independent gate.

This planning package performs zero source, test, schema, build, deployment or Kintone operations.

## 2. Locked architecture that implementation must preserve

```text
DECISION_D3_001 = VARIABLE_1_TO_4_SEQUENTIAL_APPRAISERS_ON_EXISTING_TOPOLOGY
DECISION_D3_002 = SELF_APPRAISER_ELISION_WITH_FAIL_CLOSED_IF_NO_APPRAISER_REMAINS
OWNER_DEC_D3_003 = HR_CONFIGURABLE_SCORING_APPRAISERS_WITHIN_WORKFLOW_ROUTE_USING_FROZEN_PROFILE_K_EXPECTED
OWNER_DEC_D3_005 = SINGLE_EXACT_USER_PER_SEQUENTIAL_SLOT_ALL_ONLY_FOR_D3_V1
OWNER_DEC_D3_006 = MODEL_A_VERSIONED_ROWS_IN_APP795
OWNER_DEC_D3_007 = DGM_K1_PRESIDENT_DIRECT_M1_ONLY
OWNER_DEC_D3_008 = HYBRID_APP794_MINIMAL_NATIVE_PLUS_APP798_EVENT_SCOPED_FULL_IMMUTABLE_ROUTE_SNAPSHOT
```

Critical invariants:

- workflow appraisers = 1..4 sequential business actors;
- exactly one concrete Kintone user per active sequential slot;
- business D3 V1 rule = ALL only; no multi-user slot / ANY feature;
- scorer count is frozen `K_expected` = 1 or 2;
- HR selects exact scorer identities from the surviving workflow route;
- no implicit scorer default, no first-actor-wins, no auto-lowering K;
- self-elision occurs before scorer resolution and zero surviving appraisers fails closed;
- App795 is effective-dated master for new resolution points;
- an already-bound active stage does not silently re-resolve;
- App794 stores the current bound stage route/provenance;
- App798 stores immutable event-scoped historical evidence and is not runtime routing authority.

## 3. Current repository reality vs D3 target

### 3.1 App795 schema gap

Current `config/schema-spec.js` still models `Routing_Key` as unique and uses legacy `Active`. The target requires:

```text
Routing_Key = non-unique business key
Version_Key = unique version identity
Version_Number = monotonic per Routing_Key
Version_Status = DRAFT / ACTIVE / CANCELLED / SUPERSEDED
Effective_From = required
Effective_To = optional
Route_Pattern = explicit
Scorer_Priority_Slots = explicit HR scorer plan
```

`OWNER_DEC_D3_006` supersedes the older R1 staging/activation recommendation. D3 V1 implementation must use versioned rows in App795 and a read-only date-interval resolver. No timed status mutation is allowed.

### 3.2 RoutingService gap

Current `src/services/routing-service.js` resolves:

```text
Routing_Key = target AND Active = Active
```

and expects one matching row. It does not yet implement `Version_Status`, `Version_Key` or effective-date interval selection.

Current self-elision also accepts multi-user slots and preserves per-slot ALL/ANY behavior. That remains useful historical compatibility code, but the D3 V1 activation boundary must reject active route versions that violate the locked one-user-per-slot / ALL-only contract.

Canonical business sequence must be explicit:

```text
M1_ONLY       = M1
M1_G1         = M1 -> G1
M1_M2_G1      = M2 -> M1 -> G1
M1_G1_G2      = M1 -> G1 -> G2
M1_M2_G1_G2   = M2 -> M1 -> G1 -> G2
```

Three-appraiser count alone must never choose between `M1_M2_G1` and `M1_G1_G2`.

### 3.3 App794 provenance gap

Current App794 route fields can retain the currently bound route, but the five D3-008 logical provenance fields do not yet exist:

1. `Frozen_Profile_Code`
2. `K_expected_Snapshot`
3. `Effective_Routing_Key`
4. `Effective_Route_Version_Key`
5. `Effective_Scorer_Slots_Snapshot`

The existing main application already performs verified form-state persistence/read-back for current snapshot fields. D3 should extend this existing verified mechanism rather than create an unrelated persistence path.

### 3.4 Scoring compatibility gap

App794 has two physical scoring matrices (`Manager_*` and `GM_*`) while workflow routing can contain up to four approvers. This is compatible with D3 because `K_expected` remains 1 or 2.

D3 V1 shall use a compatibility adapter:

```text
physical Manager_* matrix = Effective Scorer Layer 1
physical GM_* matrix      = Effective Scorer Layer 2 when K_expected = 2
```

The physical field names do not imply organizational rank. Non-scoring workflow appraisers may approve/endorse and provide permitted qualitative feedback but do not receive numerical scoring weight.

### 3.5 App798 implementation gap

Current App798 schema already has the required physical fields (`Archive_Key`, `Event_Type`, `Snapshot_JSON`, `Snapshot_Hash`, `Archived_By`, etc.). No D3-008 App798 schema expansion is required.

No dedicated runtime archive service/repository currently exists. D3 needs a new local service/repository boundary for:

- `STAGE_COMPLETION_SNAPSHOT`;
- `EVALUATION_REVISION_CREATED`;
- `ROUTE_REASSIGNMENT_PRECHANGE`;
- deterministic `Archive_Key` construction;
- idempotent create/read-back;
- hash conflict fail-closed behavior;
- exact actor/reason validation.

### 3.6 Native Process Management gap

Current live baseline is 16 states / 28 actions and supports the durable `M1_G1` path. First-Manager (M2) states already exist. G2 states do not exist and the ValidationEngine intentionally blocks G2.

The accepted minimum-compatible D3 V1 process target is:

```text
CURRENT = 16 states / 28 actions
TARGET  = 19 states / 40 actions
NEW G2 STATES = 04B / 09B / 14B
```

The process extension must also add M1_ONLY bypass transitions and topology filters while preserving existing M1_G1 semantics.

Process deployment is not part of the first implementation package and must not occur before local process contract tests and live read-only preflight.

### 3.7 App800 HR self-service gap

`src/ui/hr-control-center.js` and `src/services/hr-dashboard-service.js` do not yet provide App795 versioned-route management.

Owner-required D3 target is HR self-service with near-zero routine IT dependency:

- create/edit a DRAFT route version;
- choose route pattern using business language;
- assign exactly one user per sequential slot;
- select scorer priority slots consistent with K=1/2 profiles;
- set Effective_From / Effective_To;
- mandatory business reason;
- preview before/after and impacted future routing scope;
- validate interval overlap, slot completeness and process capability;
- publish/activate version using revision-guarded writes;
- never silently rewrite in-flight App794 routes.

## 4. Canonical pure contracts to implement first

The first code package must be local-only and establish deterministic pure functions before Kintone integration.

### 4.1 Effective route resolver

Input:

```text
Routing_Key
resolution timestamp T
candidate route version records
```

Predicate:

```text
Version_Status == ACTIVE
AND Effective_From <= T
AND (Effective_To blank OR Effective_To >= T)
```

Outcomes:

```text
1 match  -> PASS
0 match  -> NO_EFFECTIVE_ROUTE
>1 match -> AMBIGUOUS_EFFECTIVE_ROUTE
```

No fallback to expired route or legacy `Active` is allowed once Model A authority is activated.

### 4.2 Route pattern / ordinal normalizer

The domain representation must be independent of physical M1/M2/G1/G2 field naming and expose ordered `businessSlots[]`. It must validate:

- supported Route_Pattern;
- exact required physical slots for that pattern;
- exactly one user in every active slot;
- inactive slots empty;
- business rule ALL only;
- no duplicate appraiser identity unless explicitly permitted by a future Owner decision (default fail closed for D3 V1).

### 4.3 Self-elision + scorer viability

Required order:

1. resolve route version;
2. build canonical ordered business route;
3. self-elide exact employee Kintone identity for own MBO;
4. compact surviving route preserving order;
5. fail `SELF_APPROVAL_ROUTE_CONFLICT` if zero survivors;
6. load explicit HR scorer plan;
7. discard scorer candidates removed by self-elision;
8. enforce frozen K_expected;
9. require distinct scorers for K=2;
10. fail closed on insufficiency or ambiguity.

No default `[1,2]`, title heuristic or automatic scorer promotion.

### 4.4 Canonical snapshot serialization + hash

Create one deterministic serializer used by all App798 events.

Recommended contract:

```text
SNAPSHOT_SCHEMA_VERSION = D3_V1
SERIALIZATION = UTF-8 canonical JSON
OBJECT_KEY_ORDER = deterministic lexical order
ARRAY_ORDER = semantic/business order preserved
USER_IDENTITY = exact Kintone user code; display name is non-authoritative metadata only
UNDEFINED = omitted
NULL = explicit only where business-semantic
HASH = SHA-256 over exact canonical UTF-8 JSON bytes
```

Snapshot categories must include:

- source identity (`Record_Key`, record id, FY, employee);
- stage + revision + pre-event workflow status;
- frozen profile and K_expected;
- routing key/version/pattern/topology;
- ordered workflow appraiser identities;
- effective scorer identities + weights;
- Hoshin/config provenance needed for historical reproduction;
- stage business data, ratings, comments and computed values required to reproduce that revision.

Kintone transient metadata not required for reproduction should not be hashed merely because it exists in the raw API response. A dedicated snapshot manifest/whitelist must define what is included.

### 4.5 Actor contract

Archive behavior must receive an explicit actor object and never infer it from requester/employee data.

```text
Human-triggered event -> exact authenticated Kintone user code
Service-mediated human event -> originating human user code propagated end-to-end
Truly service-owned event -> configured Kintone service-account user identity
Unresolved actor -> ARCHIVE_ACTOR_NOT_RESOLVED
```

## 5. Recommended implementation work-package sequence

### D3-IMP-01 — Local Core Routing / Scorer / Snapshot Contracts

**Purpose:** establish pure deterministic D3 domain logic with tests.  
**Kintone:** zero reads/writes.  
**Deployment:** none.

Proposed source allow-list:

```text
src/services/routing-service.js
src/evaluation/appraiser-normalizer.js (only if adapter extraction belongs here)
src/services/d3-route-version-resolver.js                 [new]
src/services/d3-route-viability-service.js                [new]
src/services/d3-snapshot-serializer.js                    [new]
src/config/d3-route-contract.js                           [new, if needed]
```

Proposed test allow-list:

```text
tests/routing-service.test.js
tests/d3-route-version-resolver.test.js                   [new]
tests/d3-route-viability-service.test.js                  [new]
tests/d3-snapshot-serializer.test.js                      [new]
tests/core-794-795-796-integration.test.js                [targeted extension only]
```

Acceptance:

- all five topology patterns;
- both three-appraiser patterns differentiated;
- one-user/slot + ALL-only target enforcement;
- self-elision matrix;
- K1/K2 scorer plan cases;
- `NO_EFFECTIVE_ROUTE` / `AMBIGUOUS_EFFECTIVE_ROUTE`;
- future ACTIVE version has zero effect before Effective_From;
- deterministic canonical JSON/hash fixtures.

### D3-IMP-02 — Local Schema Target & Guarded Migration Tooling

**Purpose:** encode target App795/App794 schema and build dry-run/backup/read-back tooling without executing it.  
**Kintone:** zero reads/writes in implementation package.

Proposed allow-list:

```text
config/schema-spec.js
scripts/kintone/d3-inspect-readiness.js                    [new]
scripts/kintone/d3-migrate-routing-schema.js              [new]
scripts/kintone/d3-seed-route-version-v1.js               [new]
scripts/kintone/d3-rollback-routing-schema-plan.js        [new / plan-only helper]
tests/d3-schema-contract.test.js                           [new]
tests/d3-migration-dry-run.test.js                        [new]
tests/sandbox-write-guard.test.js                         [only if new exact D3 authorization guard is required]
```

App795 target additions:

```text
Routing_Key unique=false
Version_Key unique=true
Version_Number
Version_Status
Route_Pattern
Scorer_Priority_Slots
Effective_From
Effective_To
```

App794 target additions:

```text
Frozen_Profile_Code
K_expected_Snapshot
Effective_Routing_Key
Effective_Route_Version_Key
Effective_Scorer_Slots_Snapshot
```

App798 D3-008 physical additions = 0.

Migration tool must default to dry-run, require exact target app IDs, backup evidence, revision guards, explicit one-shot authorization token for writes, and post-write read-back.

### D3-IMP-03 — Runtime App795 Resolution + App794 Bound Snapshot Integration

**Purpose:** replace legacy resolution at the D3 activation boundary and persist D3-008 provenance on App794.  
**Kintone deployment:** none in this local implementation package.

Proposed allow-list:

```text
src/services/routing-service.js
src/main-mbo-app.js
src/validation/validation-engine.js (only route/provenance readiness guards)
src/profiles/runtime-profile-resolver.js (only if needed for frozen profile handoff)
tests/routing-service.test.js
tests/create-handler-form-state.test.js
tests/core-794-795-796-integration.test.js
new focused D3 binding/provenance tests
```

Acceptance:

- App794 binds exact `Routing_Key` + `Version_Key`;
- frozen profile and K snapshot are persisted;
- scorer plan snapshot is persisted and read back;
- current M1_G1 regression remains unchanged;
- in-flight stage does not re-resolve merely because another App795 version becomes effective;
- stage boundary resolution is explicit and deterministic.

### D3-IMP-04 — App798 Archive / Reopen / Route-Reassignment Service

**Purpose:** implement immutable archive semantics locally with repository/service tests.

Proposed source allow-list:

```text
src/services/revision-archive-service.js                  [new]
src/services/revision-archive-kintone-repository.js       [new]
src/services/d3-snapshot-serializer.js
src/core/kintone-client.js                                [only if a missing generic request primitive is proven]
src/core/sandbox-write-guard.js                           [only for exact write authorization guard]
```

Proposed tests:

```text
tests/revision-archive-service.test.js                     [new]
tests/revision-archive-kintone-repository.test.js          [new]
tests/d3-archive-idempotency.test.js                       [new]
tests/d3-reopen-archive-integration.test.js                [new]
```

Acceptance:

- all three event types;
- Archive_Key stable across retry;
- exact-match replay = idempotent success;
- same key/different hash = `ARCHIVE_IDEMPOTENCY_CONFLICT`;
- archive success required before App794 snapshot reuse/change;
- actor and reason fail closed;
- no date-boundary archive writes.

### D3-IMP-05 — Native 19-State Process Compatibility, Local Payload Only

**Purpose:** build and validate the target Process Management payload locally before any Kintone process write.

Recommended approach: create a D3-specific process payload builder instead of silently mutating historical `deploy-workflow-skeleton.js`.

Proposed allow-list:

```text
src/core/workflow-validator.js (only if D3-specific validation cannot remain outside generic validator)
src/validation/validation-engine.js
scripts/kintone/build-d3-workflow-payload.js               [new, no PUT]
tests/d3-workflow-payload.test.js                          [new]
tests/workflow-validator.test.js                           [targeted regression]
```

Target:

```text
19 states
40 actions
M1_ONLY bypass supported
M1_G1 durable path unchanged
M1_M2_G1 supported
M1_G1_G2 supported
M1_M2_G1_G2 supported
G2 validation gate removed only when D3 process capability contract is present
```

Do not globally delete generic ANY support from `workflow-validator.js`; D3 V1 ALL-only enforcement belongs at the D3 route/process contract boundary so unrelated generic tooling is not broken.

### D3-IMP-06 — App800 HR Versioned Routing Self-Service

**Purpose:** implement local UI/service behavior for routine HR route administration.

Proposed allow-list:

```text
src/ui/hr-control-center.js
src/ui/hr-routing-manager.js                              [new]
src/services/hr-dashboard-service.js
src/services/hr-routing-management-service.js             [new]
src/services/routing-service.js                            [read/preview reuse only]
tests/hr-control-center*.test.js                           [existing relevant tests]
tests/hr-routing-manager.test.js                           [new]
tests/hr-routing-management-service.test.js               [new]
```

D3 V1 master-change audit recommendation:

- use versioned App795 rows as the primary historical route evidence;
- require a non-empty business rationale (`Remark` or a dedicated reason field if schema evidence later proves needed);
- rely on Kintone created/updated user/time and record revision history as supporting master-change provenance;
- do **not** overload App798 transaction event ledger with a new `ROUTING_MASTER_UPDATED` event unless a future explicit decision expands the App798 contract.

HR publish/supersession writes must be revision-guarded and interval-safe. Historical versions are never deleted.

## 6. Live evidence and deployment gates — separate Owner authorizations required

### D3-PREFLIGHT-READONLY — Exact Live Read-Only Readiness Audit

Must occur after local implementation packages are independently reviewed and before schema/process writes.

Read-only scope should verify:

```text
App794 form fields, revision, current 16-state/28-action process, customization metadata
App795 fields, uniqueness flags, complete current route records, revisions
App796 published profile/K authority needed for migration compatibility
App798 fields, permissions/readability, existing archive rows if any
App800 fields/customization/HR group boundary
relevant Kintone users/groups required for exact actor/HR authorization
```

Outputs:

- exact pre-migration schema fingerprint;
- exact App795 migration manifest;
- interval seed proposal with no guessed Effective_From;
- process pre-write backup hash;
- App794/App795/App798 rollback evidence;
- explicit blockers before any write.

No writes in this gate.

### D3-SBX-MIGRATION-01 — Sandbox Schema + App795 v1 Seed

Requires fresh explicit Owner Kintone-write authorization.

Safe sequencing:

1. fresh backups/read-back;
2. additive fields first;
3. relax App795 Routing_Key uniqueness only under reviewed migration script;
4. populate deterministic `Version_Key`, `Version_Number`, `Version_Status`, Route_Pattern and scorer plan for existing rows using approved migration manifest;
5. add App794 five provenance fields;
6. verify every seeded route has exactly one valid effective version for test timestamps;
7. do not activate new G2/3/4 business routes yet;
8. post-write schema/data read-back and evidence bundle.

The old `Active` field may physically coexist during cutover, but it must have exactly one runtime authority at a time. Before D3 runtime activation, legacy code may still read `Active`; after D3 resolver activation, `Version_Status + date interval` is sole routing lifecycle authority and `Active` becomes compatibility-only/deprecated.

### D3-SBX-DEPLOY-01 — Sandbox Runtime + Process Deployment

Requires separate explicit deployment/process authorization.

Recommended order:

1. verify schema/data migration PASS;
2. deploy 19-state/40-action process to preview and verify semantic diff;
3. deploy D3 runtime customization;
4. publish process/customization only after preview verification;
5. verify M1_G1 regression first;
6. test M1_ONLY, M1_M2_G1, M1_G1_G2, M1_M2_G1_G2 synthetic routes;
7. verify archive events and stage snapshot boundaries.

G2 routes must not be activated before process deployment passes.

### D3-SBX-UAT — Business / Security / Migration UAT

Minimum matrix:

- all five topology families across Objective/Mid-Year/Final;
- both 3-appraiser patterns;
- self-elision in each ordinal position;
- zero-survivor fail closed;
- K=1 and K=2 scorer selection;
- scorer removed by self-elision -> fail closed unless explicit surviving HR plan satisfies K;
- future ACTIVE route has no early effect;
- overlap/gap fail closed;
- in-flight stage remains bound to prior version;
- next stage resolves newly effective version only at explicit stage boundary;
- stage-completion archive created before App794 route snapshot reuse;
- controlled reopen archive + revision lineage;
- route reassignment pre-change archive;
- duplicate retry idempotency;
- unauthorized HR route edits denied;
- current D1 M1_G1 and D2 export regressions preserved.

### D3-PROD-CUTOVER

Not authorized and intentionally not detailed as an executable instruction in this package. Production requires a separately reviewed cutover package containing exact live backup, migration manifest, process diff, customization artifacts, rollback, UAT acceptance and Owner go/no-go.

## 7. Rollback strategy

Rollback must be layer-specific; never perform blind reset/overwrite.

```text
SOURCE/CODE -> revert only reviewed D3 implementation commit(s), then rebuild/retest
APP794 CUSTOMIZATION -> restore exact pre-deploy JS/CSS customization snapshot
APP794 PROCESS -> restore exact pre-write process payload/revision backup
APP794 SCHEMA -> additive D3 fields should normally remain inert rather than destructive removal unless separately proven safe
APP795 DATA -> restore exact backed-up route-version records/revisions using migration manifest
APP795 AUTHORITY -> if rollback occurs before new duplicate versions are introduced, legacy resolver can be restored; after versioned history is active, rollback needs a reviewed compatibility plan and must not silently discard versions
APP798 -> immutable archive records are never deleted as a normal rollback mechanism; erroneous attempted events are handled by idempotency/conflict governance and explicit corrective evidence
```

## 8. Highest-risk implementation areas

| Risk | Level | Required mitigation |
|---|---|---|
| App795 authority cutover from `Active` to Model A | HIGH | local resolver tests + live read-only manifest + staged sandbox migration/read-back |
| Self-elision + scorer plan interaction | HIGH | exhaustive pure viability matrix; no default scorer |
| App794 snapshot reuse before archive | HIGH | archive-first service boundary + failure injection tests |
| Native 19-state process semantic regression | HIGH | generated payload tests + exact pre/post semantic diff + M1_G1 regression first |
| Route version overlap/gap | HIGH | publish-time interval validation + runtime fail closed |
| HR route administration security | HIGH | exact HR authorization + server/native write guard; UI-only check insufficient |
| Canonical snapshot hash drift | MEDIUM/HIGH | single serializer + golden fixtures + schema version |
| D1/D2 regression from D3 integration | HIGH | frozen D1/D2 regression suites remain mandatory release gates |

## 9. Explicit non-goals for D3 V1

```text
NO 45-state / twin ALL-ANY engine
NO multi-user same sequential slot
NO K=3 or K=4 scoring
NO new generic Scorer1/Scorer2 60+ field matrix
NO time-triggered route activation write
NO silent in-flight route refresh
NO automatic route/scorer guessing
NO App798 use as runtime routing master
NO production deployment inferred from implementation PASS
```

## 10. Recommended next gate

The safest first implementation authorization is:

```text
D3-IMP-01 — LOCAL CORE ROUTING / SCORER / SNAPSHOT CONTRACTS + TESTS ONLY
```

This gate should allow only local source + tests listed in Section 5, with:

```text
KINTONE_READS = 0
KINTONE_WRITES = 0
SCHEMA_WRITES = 0
PROCESS_WRITES = 0
DEPLOYMENT = 0
```

After D3-IMP-01 receives independent review PASS, proceed to D3-IMP-02. Do not jump directly to schema migration or process deployment.

## 11. Planning closure

```text
D3-IMPLEMENTATION-READINESS-PLAN = PASS / CLOSED
READINESS_PLAN_COMPLETE = YES
IMPLEMENTATION_SEQUENCE_DEFINED = YES
LOCAL_FIRST_STRATEGY = YES
LIVE_READONLY_PREFLIGHT_REQUIRED_BEFORE_WRITES = YES
D3_IMPLEMENTATION_AUTHORIZED = NO
NEXT_RECOMMENDED_GATE = D3-IMP-01
```
