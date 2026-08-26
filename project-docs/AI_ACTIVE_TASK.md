# AI ACTIVE TASK — M10M-R2D-R1 APP796 SUPERSESSION FINAL LOCAL CORRECTION

> Control Plane: ChatGPT / Project Lead / Architect / Reviewer
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Reviewed R2D execution HEAD: `a2494f83afbc21955411111442546fb9e976e012`
> Target: close the last local integration/safety defects before any App796 repair authorization
> Kintone authorization: **NONE**
> Kintone calls/writes/deploys: **0**
> Previous App796 authorization: **CONSUMED / CLOSED / MUST NOT BE REUSED**

---

## 0. REVIEW RESULT

```text
M10M_R2D_REVIEW = MUST_FIX
ARCHITECTURE_DIRECTION = PASS
ATOMIC_BULK_DESIGN = PASS
DGM_V110_CANDIDATE_DESIGN = PASS
REAL_REPOSITORY_INTEGRATION = FAIL
SUPERSESSION_AUTHORIZATION_CONTRACT = MUST_FIX
KINTONE_WRITE_AUTHORIZATION = NONE
```

Do not contact Kintone in this task.

---

## 1. DEFECT A — SERVICE / REAL REPOSITORY CONTRACT MISMATCH

`publishSupersedingScoringConfig()` currently passes its in-memory test double but does not work with the real `ScoringConfigKintoneRepository`.

### A1. Published query method mismatch

Service calls:

```text
queryPublishedByProfileAndFiscalYear(...)
```

Real repository exposes:

```text
findPublishedByProfileFiscalYear(...)
```

Fix the service to use the existing real repository method. Do not create a duplicate method unless a concrete need is proven.

### A2. `createValidatedRecord()` payload mismatch

Real repository accepts one complete validated record and requires:

```text
Config_Status = VALIDATED
Configuration_Hash = <computed 64-char hash>
Published_By = ""
Published_At = ""
```

Fix supersession service to build and pass:

```js
{
  ...canonicalImmutable,
  Config_Status: CONFIG_LIFECYCLE_STATUS.VALIDATED,
  Configuration_Hash: candidateExpectedHash,
  Published_By: '',
  Published_At: ''
}
```

Use the same real published-query method for final exactly-one-published verification.

Do not weaken or rewrite the already-frozen normal `publishScoringConfig()` behavior.

---

## 2. ADD ONE REAL CROSS-LAYER LOCAL INTEGRATION TEST

Add a deterministic no-network integration test wiring the actual implementation chain:

```text
ScoringConfigMasterService
 -> ScoringConfigKintoneRepository
 -> createScoringConfigRepositoryRequestBridge
 -> fake deterministic transport
```

The test must execute the full local supersession flow and prove:

1. `PROF_DGM::v1.0.0` predecessor is read as PUBLISHED;
2. `PROF_DGM::v1.1.0` is created as VALIDATED through the real repository payload contract;
3. read-back triple hash passes;
4. exact two-request Bulk payload reaches fake transport;
5. predecessor becomes SUPERSEDED;
6. v1.1.0 becomes PUBLISHED;
7. exactly one PUBLISHED DGM/FY2026 remains;
8. result is `SUPERSESSION_PUBLISH_VERIFIED`.

This test must fail if service/repository method names or signatures drift again.

---

## 3. DEFECT B — HARDEN SUPERSESSION AUTHORIZATION

Current `assertScoringMasterSupersessionAuthorization()` is too weak for future live repair authorization.

Create/use exact operation constants for a dedicated supersession stage/contract. Exact names may follow repository convention, but the guard must bind BOTH authorization config and request context to all of these:

```text
Work Package ID
Stage
Contract ID
App ID = 796
Exact App796 App Name
Operation = SCORING_CONFIG_SUPERSEDE_AND_PUBLISH
Predecessor Record ID
Predecessor Revision
Predecessor Master_Record_Key
Predecessor Scoring_Config_Version
New Record ID
New Revision
New Master_Record_Key
New Scoring_Config_Version
Expected status switch:
  predecessor PUBLISHED -> SUPERSEDED
  new VALIDATED -> PUBLISHED
```

Do not authorize from IDs/versions alone.

### Structured fresh backup evidence required

Replace boolean-only backup proof with a structured contract at least as strict as existing scoring record-write backup evidence:

```text
appId
appName
snapshotScope
captured = true
verified = true
retainedUntilIndependentReview = true
artifactPath
sha256 (64-char lowercase hex)
capturedAt
recordCount
```

Retain process-local single-use authorization/replay protection.

---

## 4. PROPAGATE EXACT IDENTITY THROUGH SERVICE -> REPOSITORY -> AUTHORIZER

Extend `activateSupersessionAtomically()` narrowly so authorization can verify exact identity without arbitrary patch capability.

Pass/validate at least:

```text
predecessorRecordId
predecessorRevision
predecessorMasterRecordKey
predecessorVersion
newRecordId
newRevision
newMasterRecordKey
newVersion
publishedBy
publishedAt
```

Repository must validate exact non-empty identities and different record IDs before calling `authorizeWrite()`.

Bulk request remains EXACTLY:

```text
Request 0: predecessor Config_Status -> SUPERSEDED only
Request 1: new Config_Status -> PUBLISHED + Published_By + Published_At
```

No predecessor immutable field and no arbitrary patch may be added.

---

## 5. NEGATIVE TESTS

Focused tests must prove fail-closed for at least:

```text
wrong/missing Work Package
wrong Stage
wrong Contract ID
wrong App ID
wrong App Name
wrong operation
explicitUserAuthorization != true
activeWindow != true
missing/malformed backup evidence
backup app mismatch
bad backup SHA-256
wrong predecessor ID/revision/master key/version
wrong new ID/revision/master key/version
same record ID
wrong expected old/new statuses
replayed authorization ID
```

Retain/verify Bulk bridge rejection for malformed bulk shape, extra requests/fields, wrong app, wrong status patches, malformed revisions, blank publisher/time.

---

## 6. DOCUMENTATION EVIDENCE CORRECTION

Current R2D review package reports:

```text
IMPLEMENTATION_HEAD = 2191cdf4...
```

but actual execution commit is:

```text
a2494f83afbc21955411111442546fb9e976e012
```

Correct the R2D evidence metadata. `2191cdf4...` is the Control-Plane task commit / parent, not the implementation HEAD.

Also update stale living-state statements that still say `SUPERSESSION_ACTIVATION = NOT_IMPLEMENTED` after this implementation, but do not rewrite historical evidence sections.

---

## 7. HARD BOUNDARIES

```text
Kintone GET = 0
Kintone POST = 0
Kintone PUT = 0
Kintone DELETE = 0
Kintone DEPLOY = 0
App794 change = 0
App795 change = 0
App796 runtime change = 0
GM/VP business config change = 0
UI change = 0
```

Do not implement the one-time forensic restoration write in this task.
Do not execute DGM v1.0.0 restoration.
Do not create v1.1.0 in Kintone.

---

## 8. TEST / EXECUTION PLAN

1. implement only the corrections above;
2. run targeted supersession service/repository/bridge/guard tests;
3. run the real cross-layer integration test;
4. run `npm test` once;
5. no browser smoke/build unless source tooling genuinely requires it;
6. confirm zero Kintone contact;
7. confirm no UI/App794/App795 changes;
8. update review evidence/current state/handoff;
9. push same branch and STOP.

Expected final evidence:

```text
M10M_R2D_R1 = READY_FOR_CHATGPT_REVIEW
REAL_REPOSITORY_INTEGRATION = PASS
CROSS_LAYER_SUPERSESSION_TEST = PASS
SUPERSESSION_AUTH_GUARD = PASS
ATOMIC_BULK_REPOSITORY = PASS
DGM_V110_HASH = e69989df7118601b95b3c4df1a0d7cfc6c5b2c3bf3be124a0470d82ff079892e
KINTONE_CALL_COUNT = 0
KINTONE_WRITE_COUNT = 0
NPM_TEST = PASS
```

Final line exactly:

```text
FINAL STATUS: READY FOR CHATGPT REVIEW
```
