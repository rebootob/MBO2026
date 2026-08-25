# AI ACTIVE TASK — ANTIGRAVITY WP-002C STAGE 4B CLOSURE + STAGE 4C GUARDED REQUEST BRIDGE FOUNDATION

> **Control Plane:** ChatGPT / Project Lead / Architect / Independent Reviewer
> **Execution Plane:** Antigravity standalone
> **Repository:** `rebootob/MBO2026`
> **Branch:** `ai/antigravity-wp002c`
> **Reviewed Stage 4B head:** `d0bfbd9d7983911d8003010635fbfcf6e9307b28`
> **Target App:** 796 — `MBO Profile & Scoring Configuration Master [Sandbox]`
> **WP:** `MBO-P03-WP-002C`
> **Mode:** STAGE 4B GOVERNANCE CLOSURE + STAGE 4C CODE/UNIT FOUNDATION ONLY
> **Kintone calls:** ZERO
> **Kintone writes:** ZERO
> **`.env.local`:** DO NOT USE

# CONTROL PLANE DECISION

Independent review of Stage 4B is complete.

```text
WP002C_STAGE4B_GATE = PASS
STAGE4B_KINTONE_REPOSITORY_FOUNDATION = PASSED / FROZEN
REGRESSION_BASELINE = 370/370 PASS
```

Accepted Stage 4B gates:

```text
STAGE4A_CLOSURE_GATE = PASS
KINTONE_REPOSITORY_ARCHITECTURE_GATE = PASS
APP_ID_SAFETY_BINDING_GATE = PASS
RAW_DOMAIN_MAPPING_GATE = PASS
USER_SELECT_MAPPING_GATE = PASS
QUERY_ESCAPE_GATE = PASS
WRITE_AUTHORIZATION_BOUNDARY_GATE = PASS
ERROR_REDACTION_GATE = PASS
OPTIMISTIC_CONCURRENCY_GATE = PASS
STORAGE_TOKEN_SHAPE_GATE = PASS
PLAIN_OBJECT_GATE = PASS
TRIPLE_HASH_GATE = PASS
FINAL_PUBLISH_READBACK_GATE = PASS
NO_RETRY_FAIL_CLOSED_GATE = PASS
REGRESSION_GATE = PASS
ZERO_KINTONE_STAGE4B_GATE = PASS
DOC_EVIDENCE_CONSISTENCY_GATE = PASS
GIT_PUSH_SYNC_GATE = PASS
```

Stage 3C historical evidence status remains unchanged:

```text
WP002C_STAGE3C_GATE = PASS_WITH_DOCUMENTED_EVIDENCE_EXCEPTION
R1_PREWRITE_BACKUP_PROVENANCE_GATE = UNVERIFIABLE_ACCEPTED
EVIDENCE_EXCEPTION_STATUS = ACCEPTED_BY_CONTROL_PLANE
PREWRITE_BACKUP_RETENTION_UNTIL_INDEPENDENT_REVIEW = MANDATORY
```

Do not rewrite the historical Stage 3C exception into a normal backup PASS.

---

# WHY STAGE 4C

The authoritative WP-002C plan requires:

1. WP-scoped authorized-write support without globally disabling discovery safety.
2. Exact verified App 796 only.
3. Pre-write backup gate before future record writes.
4. Controlled Kintone request/read-back pipeline.
5. Runtime wiring only after the bridge is reviewed.

Stage 4B already provides the domain-to-storage repository adapter and optimistic concurrency.

Stage 4C now builds two still-disconnected foundations:

```text
A. specialized App-796 record-write authorization contract
B. repository-request -> Kintone-request bridge using injected transport
```

Stage 4C MUST NOT connect these foundations to real credentials/network yet.

After Stage 4C:

```text
LIVE_KINTONE_REQUEST_BRIDGE_STATUS = FOUNDATION_IMPLEMENTED_NOT_WIRED
LIVE_RECORD_WRITE_AUTHORIZATION_STATUS = GUARD_CONTRACT_IMPLEMENTED_NOT_WIRED
LIVE_RECORD_PUBLISH_STATUS = NOT_STARTED
BASELINE_SEED_STATUS = NOT_STARTED
```

---

# STEP 0 — GIT SAFETY

Run:

```bash
git status --short
git branch --show-current
git fetch origin
git pull --ff-only
git rev-parse HEAD
git rev-parse origin/ai/antigravity-wp002c
git merge-base --is-ancestor d0bfbd9d7983911d8003010635fbfcf6e9307b28 HEAD
```

Required:

```text
branch = ai/antigravity-wp002c
local HEAD = remote HEAD
reviewed Stage 4B head d0bfbd9... is in ancestry
tracked working tree clean before edits
```

No reset/rebase/stash/force-push automatically.

Read before work:

- `project-docs/AI_ACTIVE_TASK.md`
- `project-docs/CURRENT_STATE.md`
- `project-docs/HANDOFF.md`
- `project-docs/AI_REVIEW_PACKAGE.md`
- `project-docs/IMPLEMENTATION_STATUS.md`
- `project-docs/phase-3/MBO-P03-WP-002C_PLAN.md`
- `src/core/sandbox-write-guard.js`
- `src/core/kintone-client.js`
- `src/services/scoring-config-kintone-repository.js`
- `src/services/scoring-config-master-service.js`
- `tests/safety-guard.test.js`

---

# STEP 1 — DURABLE STAGE 4B CLOSURE

Update only these living docs:

```text
project-docs/CURRENT_STATE.md
project-docs/HANDOFF.md
project-docs/AI_REVIEW_PACKAGE.md
project-docs/IMPLEMENTATION_STATUS.md
project-docs/CHANGELOG_AI.md
```

Required current state:

```text
WP002C_STAGE4A_GATE = PASS
STAGE4A_PUBLISH_INTEGRITY_FOUNDATION = PASSED / FROZEN
WP002C_STAGE4B_GATE = PASS
STAGE4B_KINTONE_REPOSITORY_FOUNDATION = PASSED / FROZEN
STAGE4C_GUARDED_REQUEST_BRIDGE_FOUNDATION = AUTHORIZED / NOT_STARTED
KINTONE_REPOSITORY_ADAPTER_STATUS = FOUNDATION_IMPLEMENTED_NOT_WIRED
LIVE_KINTONE_REQUEST_BRIDGE_STATUS = NOT_IMPLEMENTED
LIVE_RECORD_WRITE_AUTHORIZATION_STATUS = NOT_IMPLEMENTED
TRUSTED_AUDIT_LIVE_PROVIDER_STATUS = NOT_IMPLEMENTED
LIVE_RECORD_PUBLISH_STATUS = NOT_STARTED
RUNTIME_RESOLVER_LIVE_WIRING = NOT_STARTED
BASELINE_SEED_STATUS = NOT_STARTED
RECORD_COUNT = 0 (last verified Kintone checkpoint)
PREWRITE_BACKUP_RETENTION_UNTIL_INDEPENDENT_REVIEW = MANDATORY
NEXT_ACTION = EXECUTE STAGE 4C GUARDED REQUEST BRIDGE FOUNDATION
```

Update Stage 4B final closure traceability with:

```text
d0bfbd9d7983911d8003010635fbfcf6e9307b28 — docs: add missing wp-002c stage4b traceability rows
```

Run:

```bash
git diff --check
```

Commit exactly:

```text
docs: close wp-002c stage4b and authorize stage4c
```

Push only to `origin/ai/antigravity-wp002c` and verify local HEAD = remote HEAD before code changes.

---

# STEP 2 — SPECIALIZED APP-796 RECORD-WRITE AUTHORIZATION CONTRACT

Modify existing file only:

```text
src/core/sandbox-write-guard.js
```

Do not create another guard module.

Add constants with exact values:

```text
WP002C_RECORD_WRITE_STAGE = STAGE_4C_RECORD_WRITE_BRIDGE
WP002C_RECORD_WRITE_CONTRACT_ID = WP002C_SCORING_RECORD_WRITE_V1
```

Add one process-local consumed-ID registry dedicated to this record-write authorization contract.

Recommended function name:

```text
assertScoringConfigRecordWriteAuthorization(authConfig, requestContext)
```

## 2.1 Exact scope

The guard can authorize only these logical operations:

```text
SCORING_CONFIG_CREATE_VALIDATED
SCORING_CONFIG_PUBLISH
```

It can target only:

```text
workPackageId = MBO-P03-WP-002C
stage = STAGE_4C_RECORD_WRITE_BRIDGE
recordWriteContractId = WP002C_SCORING_RECORD_WRITE_V1
appId = 796
appName = MBO Profile & Scoring Configuration Master [Sandbox]
```

It must never authorize:

- APP_CREATE
- schema writes
- ACL writes
- deploy
- delete
- arbitrary POST/PUT
- App 794
- App 795
- protected apps
- another App ID
- another WP

## 2.2 Explicit authorization window

Require:

```text
explicitUserAuthorization === true
activeWindow === true
authorizationId = exact non-empty string without surrounding whitespace
```

Replay of the same authorization ID must fail closed.

Consume the authorization ID only after every validation below passes.

## 2.3 Durable pre-write backup contract — mandatory

Require:

```text
authConfig.prewriteBackupEvidence
```

as a true plain object with all fields below:

```text
appId = 796
appName = exact approved App 796 name
snapshotScope = APP796_RECORDS_PREWRITE_V1
captured = true
verified = true
retainedUntilIndependentReview = true
artifactPath = non-empty exact string without surrounding whitespace
sha256 = exactly 64 lowercase hex characters
capturedAt = non-empty exact string without surrounding whitespace
recordCount = non-negative safe integer
```

Missing/malformed evidence must fail closed before authorization consumption.

This is a **contract only** in Stage 4C. Do not create a backup file and do not access Kintone.

The future live stage must retain the actual backup artifact until ChatGPT independent review. A boolean alone is not enough.

## 2.4 Exact one-change manifest

Require:

```text
requestContext.manifest.expectedChanges
```

to contain exactly one plain-object change.

For `SCORING_CONFIG_CREATE_VALIDATED`, require exact match:

```text
operation = SCORING_CONFIG_CREATE_VALIDATED
appId = 796
masterRecordKey = requestContext.masterRecordKey
```

and require `masterRecordKey` to be a non-empty exact string without surrounding whitespace.

For `SCORING_CONFIG_PUBLISH`, require exact match:

```text
operation = SCORING_CONFIG_PUBLISH
appId = 796
recordId = requestContext.recordId
expectedRevision = requestContext.expectedRevision
```

Require `recordId` and `expectedRevision` to be exact positive safe-integer strings with no whitespace.

Do not silently stringify or trim manifest/context values.

## 2.5 Return contract

On success:

```text
return true
```

Errors must be stable/fail-closed and must not include backup file contents, credentials, HTTP bodies, or secrets.

Do not modify `DISCOVERY_MODE` or `WRITE_ALLOWED_APPS`.
Do not use `dryRunBypassDiscovery` as the record-write authorization mechanism.

---

# STEP 3 — INJECTED REPOSITORY REQUEST BRIDGE

Modify existing file only:

```text
src/core/kintone-client.js
```

Do not change existing `kintoneRequest()` default behavior.
It MUST continue to call `assertDiscoveryReadOnly()` and remain write-blocked in the current default state.

Add a pure/injected bridge factory, recommended name:

```text
createScoringConfigRepositoryRequestBridge({ transport })
```

`transport` is mandatory and must be a function with the existing Kintone-client style contract:

```text
transport(path, { method, body? }) -> Promise<payload>
```

The factory must NOT default to:

- `globalThis.fetch`
- `fetch`
- `kintoneRequest`
- `getKintoneConnection()`
- environment variables

Stage 4C tests inject a fake transport only.

The returned function must match the Stage 4B repository request contract:

```text
request({ method, path, params?, body? }) -> Promise<payload>
```

## 3.1 Exact allowed request shapes

Allow only:

```text
GET  /k/v1/records.json
GET  /k/v1/record.json
POST /k/v1/record.json
PUT  /k/v1/record.json
```

Reject DELETE, PATCH, preview endpoints, app/schema/ACL/deploy endpoints, unknown paths, existing query strings in `path`, and arbitrary methods.

## 3.2 GET /records

Require request object exactly compatible with:

```text
method = GET
path = /k/v1/records.json
params = {
  app: 796,
  query: non-empty string
}
body = absent
```

Reject extra params keys.

Build transport path deterministically:

```text
/k/v1/records.json?app=796&query=<encodeURIComponent(query)>
```

Do not trim or rewrite the Kintone query expression.

## 3.3 GET /record

Require:

```text
method = GET
path = /k/v1/record.json
params = {
  app: 796,
  id: exact positive safe-integer string
}
body = absent
```

Reject numeric/whitespace/unsafe record IDs at this bridge boundary.

Build:

```text
/k/v1/record.json?app=796&id=<exact id>
```

## 3.4 POST /record

Require:

```text
method = POST
path = /k/v1/record.json
params = absent
body = true plain object
Object.keys(body) exactly [app, record]
body.app = numeric 796
body.record = true plain object
```

Do not mutate/clone business field values in a way that changes semantics.

This stage only validates/forwards the repository-built create body; domain validation remains in Stage 4A/4B.

## 3.5 PUT /record — defense in depth

Require:

```text
method = PUT
path = /k/v1/record.json
params = absent
body = true plain object
Object.keys(body) exactly [app, id, revision, record]
body.app = numeric 796
body.id = exact positive safe-integer string
body.revision = exact positive safe-integer string
body.record = true plain object
```

Require `body.record` keys exactly:

```text
Config_Status
Published_By
Published_At
```

Require exact Kintone lifecycle patch:

```text
Config_Status.value = PUBLISHED
Published_By.value = [{ code: <non-empty exact string> }]
Published_At.value = <non-empty exact string>
```

Reject immutable-field injection or extra lifecycle fields.

## 3.6 Transport behavior

For each accepted bridge request:

- invoke injected transport exactly once
- no retry
- return transport payload unchanged
- if transport throws, expose stable error:

```text
SCORING_CONFIG_BRIDGE_REQUEST_FAILED
```

Do not append raw transport error messages.

The bridge itself performs no real I/O unless a future stage explicitly composes it with a real transport.

---

# STEP 4 — TESTS

Modify existing test file only:

```text
tests/safety-guard.test.js
```

Do not create a new test file in Stage 4C.

Import the new guard constants/function and new bridge factory.

Add meaningful tests covering at minimum:

## Authorization guard

1. exact create authorization passes
2. exact publish authorization passes
3. wrong WP rejected
4. wrong stage rejected
5. wrong contract ID rejected
6. wrong App ID rejected
7. wrong App name rejected
8. App 794/795/protected App targets rejected
9. unsupported operation rejected
10. explicitUserAuthorization false rejected
11. activeWindow false rejected
12. empty/whitespace authorization ID rejected
13. replayed authorization ID rejected
14. missing backup evidence rejected
15. backup app/name mismatch rejected
16. wrong snapshotScope rejected
17. captured false rejected
18. verified false rejected
19. retainedUntilIndependentReview false rejected
20. blank artifactPath rejected
21. malformed sha256 rejected
22. blank capturedAt rejected
23. negative/unsafe/non-integer recordCount rejected
24. missing/empty/multiple manifest changes rejected
25. create manifest master key mismatch rejected
26. create context master key whitespace rejected
27. publish manifest record ID mismatch rejected
28. publish manifest revision mismatch rejected
29. publish numeric/whitespace/unsafe ID/revision rejected
30. failed validation does not consume authorization ID
31. `DISCOVERY_MODE` remains true and `WRITE_ALLOWED_APPS` remains empty

## Request bridge

32. constructor requires transport function
33. bridge supports GET records exact path
34. GET records query is URL encoded deterministically
35. GET records rejects wrong App/extra params/body
36. GET record exact success
37. GET record rejects numeric/whitespace/unsafe ID
38. POST record exact success pinned to numeric 796
39. POST rejects extra top-level keys/wrong App/non-plain record
40. PUT exact lifecycle-only success
41. PUT rejects wrong App
42. PUT rejects numeric/whitespace/unsafe id/revision
43. PUT rejects immutable field injection
44. PUT rejects malformed USER_SELECT shape
45. PUT rejects non-PUBLISHED status
46. DELETE/PATCH/preview/schema/ACL/deploy/unknown path rejected
47. accepted request invokes transport exactly once
48. transport throw is redacted to exact `SCORING_CONFIG_BRIDGE_REQUEST_FAILED`
49. no automatic retry on transport failure
50. new bridge factory source does not reference `fetch`, `getKintoneConnection`, or environment variables in its own implementation
51. existing `kintoneRequest()` still blocks POST under `DISCOVERY_MODE = true`

Additional focused tests are allowed.
Do not delete prior safety tests.

---

# STEP 5 — CODE SCOPE / VALIDATION / COMMIT

Authorized code/test files only:

```text
src/core/sandbox-write-guard.js
src/core/kintone-client.js
tests/safety-guard.test.js
```

Do NOT modify:

- `src/services/scoring-config-kintone-repository.js`
- `src/services/scoring-config-master-service.js`
- `src/profiles/scoring-config-master.js`
- `src/profiles/profile-scoring-resolver.js`
- `config/sandbox-apps.json`
- `.env.local`
- UI/main app files

Run:

```bash
git diff --check
npm test
```

Required:

```text
all tests PASS
full suite >= 370
```

Commit exactly:

```text
feat: add scoring config guarded request bridge foundation
```

Push only to `origin/ai/antigravity-wp002c`.
Verify local HEAD = remote HEAD before docs.

---

# STEP 6 — STAGE 4C EVIDENCE DOCS

Update only:

```text
project-docs/CURRENT_STATE.md
project-docs/HANDOFF.md
project-docs/AI_REVIEW_PACKAGE.md
project-docs/IMPLEMENTATION_STATUS.md
project-docs/CHANGELOG_AI.md
```

Required current state:

```text
WP002C_STAGE4A_GATE = PASS
STAGE4A_PUBLISH_INTEGRITY_FOUNDATION = PASSED / FROZEN
WP002C_STAGE4B_GATE = PASS
STAGE4B_KINTONE_REPOSITORY_FOUNDATION = PASSED / FROZEN
STAGE4C_GUARDED_REQUEST_BRIDGE_FOUNDATION = COMPLETE / PENDING CHATGPT REVIEW
KINTONE_REPOSITORY_ADAPTER_STATUS = FOUNDATION_IMPLEMENTED_NOT_WIRED
LIVE_KINTONE_REQUEST_BRIDGE_STATUS = FOUNDATION_IMPLEMENTED_NOT_WIRED
LIVE_RECORD_WRITE_AUTHORIZATION_STATUS = GUARD_CONTRACT_IMPLEMENTED_NOT_WIRED
PREWRITE_BACKUP_CONTRACT_STATUS = DURABLE_RETENTION_REQUIRED / NOT_EXECUTED
TRUSTED_AUDIT_LIVE_PROVIDER_STATUS = NOT_IMPLEMENTED
LIVE_RECORD_PUBLISH_STATUS = NOT_STARTED
RUNTIME_RESOLVER_LIVE_WIRING = NOT_STARTED
BASELINE_SEED_STATUS = NOT_STARTED
RECORD_COUNT = 0 (last verified Kintone checkpoint; Stage 4C made zero Kintone calls)
STAGE4C_KINTONE_CALLS = 0
STAGE4C_KINTONE_WRITES = 0
PREWRITE_BACKUP_RETENTION_UNTIL_INDEPENDENT_REVIEW = MANDATORY
NEXT_ACTION = AWAIT CHATGPT STAGE 4C REVIEW BEFORE ANY LIVE TRANSPORT COMPOSITION OR KINTONE PREFLIGHT
```

Use actual final `npm test` total consistently in current operational sections.

Add Stage 4C implementation commit traceability to `AI_REVIEW_PACKAGE.md`.

Commit exactly:

```text
docs: record wp-002c stage4c guarded bridge foundation
```

Push and verify local HEAD = remote HEAD and tracked working tree clean.
Then STOP.

---

# STRICT RUNTIME / KINTONE BOUNDARY

For this entire Stage 4C task:

```text
Kintone GET = 0
Kintone POST = 0
Kintone PUT = 0
Kintone DELETE = 0
Kintone DEPLOY = 0
Kintone RECORD WRITE = 0
```

Do not use `.env.local`.
Do not access App 796.
Do not create any backup artifact yet.
Do not compose the new bridge with `kintoneRequest` or any real transport.
Do not open a live write window.
Do not change `DISCOVERY_MODE`.
Do not change `WRITE_ALLOWED_APPS`.
Do not seed the eight baseline configurations.
Do not publish any record.
Do not implement the trusted live audit provider.
Do not wire the resolver.
Do not start Stage 4D or WP-002D.
Do not merge to develop.

---

# FINAL REPORT

Report only safe evidence:

- branch
- assignment/start HEAD
- Stage 4B closure commit SHA
- Stage 4C implementation commit SHA
- Stage 4C evidence commit SHA
- changed files per commit
- record-write guard constants
- create authorization contract PASS/FAIL
- publish authorization contract PASS/FAIL
- durable backup evidence contract PASS/FAIL
- authorization replay protection PASS/FAIL
- failed-validation-not-consumed PASS/FAIL
- bridge exact path allowlist PASS/FAIL
- GET query encoding PASS/FAIL
- POST create shape PASS/FAIL
- PUT lifecycle-only shape PASS/FAIL
- App 796 numeric pin PASS/FAIL
- transport error redaction PASS/FAIL
- no retry PASS/FAIL
- existing discovery write lock preserved PASS/FAIL
- full test total/pass/fail
- Kintone calls/writes = 0
- `.env.local` used = NO
- live transport composition = NO
- local HEAD = remote HEAD YES/NO
- tracked working tree clean YES/NO
- STOP confirmation

# REVIEW EXPECTATION

ChatGPT will inspect GitHub directly and verify:

1. Stage 4B is durably recorded PASS/FROZEN before Stage 4C code.
2. Stage 4C code commit changes exactly the three authorized code/test files.
3. No repository/service/resolver/config/UI changes occurred.
4. Specialized guard pins WP/stage/contract/App 796/name/operations exactly.
5. Specialized guard cannot authorize App 794/795/protected/other apps.
6. Backup evidence requires durable retained artifact metadata, not `backupVerified` boolean alone.
7. Backup retention flag is mandatory.
8. Authorization IDs are single-use and consumed only after full validation.
9. Manifest is exactly one operation and matches create/publish context exactly.
10. Bridge uses mandatory injected transport only; no default real transport.
11. Bridge supports only exact two GET + POST + PUT record endpoints.
12. GET parameters are exact and query is safely URL encoded.
13. POST is pinned to App 796 and exact record request envelope.
14. PUT is pinned to App 796, exact id/revision strings, lifecycle-only patch.
15. Transport errors are redacted and never retried.
16. Existing `kintoneRequest()` default discovery write block is unchanged.
17. `DISCOVERY_MODE = true` and `WRITE_ALLOWED_APPS = []` remain unchanged.
18. Full regression >=370 and all pass.
19. Stage 4C Kintone calls/writes = 0 and `.env.local` unused.
20. No bridge-to-real-transport composition, backup execution, seed, publish, trusted live audit, resolver wiring, Stage4D, or WP002D occurred.
21. Git remote branch points to final evidence commit.

Expected gates:

```text
STAGE4B_CLOSURE_GATE = PASS / FAIL
RECORD_WRITE_GUARD_SCOPE_GATE = PASS / FAIL
PREWRITE_BACKUP_CONTRACT_GATE = PASS / FAIL
AUTHORIZATION_REPLAY_GATE = PASS / FAIL
MANIFEST_EXACTNESS_GATE = PASS / FAIL
REQUEST_BRIDGE_ARCHITECTURE_GATE = PASS / FAIL
BRIDGE_PATH_ALLOWLIST_GATE = PASS / FAIL
APP_ID_SAFETY_BINDING_GATE = PASS / FAIL
LIFECYCLE_ONLY_WRITE_GATE = PASS / FAIL
ERROR_REDACTION_GATE = PASS / FAIL
NO_RETRY_FAIL_CLOSED_GATE = PASS / FAIL
DISCOVERY_LOCK_PRESERVATION_GATE = PASS / FAIL
REGRESSION_GATE = PASS / FAIL
ZERO_KINTONE_STAGE4C_GATE = PASS / FAIL
DOC_EVIDENCE_CONSISTENCY_GATE = PASS / FAIL
GIT_PUSH_SYNC_GATE = PASS / FAIL
WP002C_STAGE4C_GATE = PASS / BLOCKED
```
