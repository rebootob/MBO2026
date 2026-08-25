# AI ACTIVE TASK — ANTIGRAVITY WP-002C STAGE 3C CLOSURE + STAGE 4A PUBLISH INTEGRITY FOUNDATION

> **Control Plane:** ChatGPT / Project Lead / Architect / Independent Reviewer
> **Execution Plane:** Antigravity
> **Repository:** `rebootob/MBO2026`
> **Branch:** `ai/antigravity-wp002c`
> **Reviewed baseline before this assignment:** `9d466e83e7c03f2bcbddd2c2a4700a579a882c3b`
> **Target App:** 796 — `MBO Profile & Scoring Configuration Master [Sandbox]`
> **Environment:** SANDBOX / Production FALSE
> **WP:** `MBO-P03-WP-002C`
> **Mode:** GOVERNANCE CLOSURE + CODE/UNIT FOUNDATION ONLY
> **Kintone calls:** ZERO
> **Kintone writes:** ZERO

## CONTROL PLANE DECISION — STAGE 3C EVIDENCE EXCEPTION ACCEPTED

The user instructed the project to continue after independent review established that Stage 3C has no remaining implementation defect and the only blocker is a deleted R1 pre-write snapshot.

Control Plane accepts the evidence risk as a one-time documented exception.

Record the final Stage 3C decision exactly as:

```text
WP002C_STAGE3C_GATE = PASS_WITH_DOCUMENTED_EVIDENCE_EXCEPTION
R1_PREWRITE_BACKUP_PROVENANCE_GATE = UNVERIFIABLE_ACCEPTED
EVIDENCE_EXCEPTION_STATUS = ACCEPTED_BY_CONTROL_PLANE
SCHEMA_SEMANTIC_STATE = DOMAIN_ALIGNED
CORRECTION_REQUIRED_FIELDS = NONE
RECORD_COUNT = 0
```

Rationale:

```text
- App 796 is SANDBOX / production FALSE.
- The repair changed only Part_A_Scoring_Mode and Config_Status option sets.
- Historical R1 Form Fields PUT count = 1.
- Historical R1 Deploy POST count = 1.
- No retry was executed.
- Positive live 23/23 read-back passed after repair.
- Subsequent independent GET-only reconciliation passed.
- ACL remained CREATOR_ONLY / DEFAULT DENY.
- Record count remained 0.
- No baseline records were seeded.
- Final verifier safety defects were corrected.
- Full regression suite passed 243/243 at the accepted checkpoint.
- Repeating a Kintone repair solely to recreate historical evidence would add write risk and still would not recreate the original historical state.
```

Mandatory preventive control for every future Kintone write task:

```text
PREWRITE_BACKUP_RETENTION_UNTIL_INDEPENDENT_REVIEW = MANDATORY
```

A pre-write backup/snapshot required by a task must not be deleted, overwritten, or cleaned up until ChatGPT independently reviews and closes that write stage. This preventive control applies to all future controlled Kintone writes in MBO2026.

Do not repeat Stage 3C repair.

---

# STAGE 4A — PUBLISH INTEGRITY SERVICE FOUNDATION

## Purpose

Implement the storage-facing publish integrity orchestration described by `project-docs/phase-3/MBO-P03-WP-002C_PLAN.md` as a **dependency-injected, unit-tested foundation only**.

This stage must prove the algorithm and failure semantics without making any real Kintone call.

Stage 4A is NOT:

- a Kintone adapter
- a live record write
- baseline seeding
- resolver live wiring
- UI wiring
- production authorization
- supersession activation
- WP-002D

After Stage 4A, the live App 796 must still contain zero records.

## Git start gate

Antigravity must fetch the latest remote branch and work from the latest HEAD containing this Control Plane assignment commit.

Run:

```bash
git status --short
git branch --show-current
git fetch origin
git pull --ff-only
git rev-parse HEAD
git rev-parse origin/ai/antigravity-wp002c
git merge-base --is-ancestor 9d466e83e7c03f2bcbddd2c2a4700a579a882c3b HEAD
```

Required:

```text
branch = ai/antigravity-wp002c
local HEAD = remote HEAD
reviewed baseline 9d466e83... is in ancestry
```

Do not reset/rebase/stash/force-push automatically.
Do not touch unrelated local files.

Read before execution:

- `project-docs/AI_ACTIVE_TASK.md`
- `project-docs/CURRENT_STATE.md`
- `project-docs/HANDOFF.md`
- `project-docs/AI_REVIEW_PACKAGE.md`
- `project-docs/phase-3/MBO-P03-WP-002C_PLAN.md`
- `src/profiles/scoring-config-master.js`
- `src/profiles/profile-scoring-resolver.js`
- `src/services/annual-record-service.js`
- `tests/scoring-config-master.test.js`

---

# STEP 1 — RECORD STAGE 3C CONTROL PLANE CLOSURE

Before Stage 4A code changes, update only:

- `project-docs/CURRENT_STATE.md`
- `project-docs/HANDOFF.md`
- `project-docs/AI_REVIEW_PACKAGE.md`
- `project-docs/IMPLEMENTATION_STATUS.md`
- `project-docs/CHANGELOG_AI.md`

Required current state:

```text
WP002C_STAGE3C_GATE = PASS_WITH_DOCUMENTED_EVIDENCE_EXCEPTION
R1_PREWRITE_BACKUP_PROVENANCE_GATE = UNVERIFIABLE_ACCEPTED
EVIDENCE_EXCEPTION_STATUS = ACCEPTED_BY_CONTROL_PLANE
App 796 = LIVE_DEPLOYED
SCHEMA_PHYSICAL_STATE = 23_FIELDS_LIVE
SCHEMA_SEMANTIC_STATE = DOMAIN_ALIGNED
CORRECTION_REQUIRED_FIELDS = NONE
RECORD_COUNT = 0
BASELINE_SEED_STATUS = NOT_STARTED
PUBLISH_PIPELINE_STATUS = NOT_DEPLOYED
NEXT_ACTION = STAGE 4A PUBLISH INTEGRITY SERVICE FOUNDATION
```

Preserve the forensic fact that the R1 pre-write snapshot was captured but not durably retained. Do not rewrite history as if the backup gate passed normally.

Add the preventive control:

```text
PREWRITE_BACKUP_RETENTION_UNTIL_INDEPENDENT_REVIEW = MANDATORY
```

Run:

```bash
git diff --check
```

Commit exactly:

```text
docs: accept wp-002c stage3c evidence exception
```

Push to `origin/ai/antigravity-wp002c` and verify local HEAD = remote HEAD.

---

# STEP 2 — IMPLEMENT CANONICAL CONFIGURATION NORMALIZATION

Prefer modifying the existing domain module rather than creating helper modules.

Authorized domain files:

- `src/profiles/scoring-config-master.js`
- `tests/scoring-config-master.test.js`

Add a generic exported canonicalization primitive, e.g.:

```text
canonicalizeScoringConfigPayload(payload)
```

It must return a new object and must not mutate caller input.

Canonicalization contract for the 19 immutable fields:

```text
Master_Record_Key = trimmed string
Profile_Code = trimmed string
Profile_Family = trimmed string
Scoring_Config_Code = trimmed string
Scoring_Config_Version = trimmed string
Effective_From = exact YYYY-MM-DD string
Effective_To = exact YYYY-MM-DD string
Fiscal_Year = trimmed string
PartA_Weight = normalized decimal string
PartB_Weight = normalized decimal string
Expected_Appraiser_Count = normalized integer string
Appraiser_Weight_Rule_Code = trimmed string
Part_A_Scoring_Mode = trimmed string
Competency_Set_Code = trimmed string
PartA_Rounding_Rule = trimmed string
PartB_Raw_Rounding_Rule = trimmed string
PartB_Weighted_Rounding_Rule = trimmed string
Final_Rounding_Rule = trimmed string
Supersedes_Config_Version = trimmed string
```

Why numeric values become canonical strings: Kintone NUMBER record values are string-shaped on read-back. Hash computation must remain stable across number input (`70`) and Kintone-style read-back (`"70"`).

Requirements:

1. All 19 immutable fields must be present after canonicalization.
2. Missing/undefined/null immutable field fails closed.
3. Number fields must be finite and valid.
4. Expected_Appraiser_Count canonical form must be an integer string.
5. Effective dates must exactly match `YYYY-MM-DD` and represent valid calendar dates.
6. Return value must not include lifecycle/audit fields unless a separate service layer explicitly adds them.
7. Do not change the meaning of existing profile/domain enums.
8. Do not change the frozen 8 baseline business values.
9. Existing `computeConfigurationHash()` stays deterministic; Stage 4A service must hash the canonical payload.

Add tests showing at minimum:

- number `70` and string `"70"` canonicalize identically
- equivalent inputs produce identical hash after canonicalization
- caller object not mutated
- invalid numeric value rejected
- non-integer appraiser count rejected
- malformed date rejected
- missing immutable field rejected
- lifecycle/audit input fields are not part of the canonical immutable object

---

# STEP 3 — IMPLEMENT ONE COHESIVE PUBLISH INTEGRITY SERVICE

A new service file is justified by separation of concerns and is explicitly allowed by the WP-002C plan.

Create only:

- `src/services/scoring-config-master-service.js`
- `tests/scoring-config-master-service.test.js`

Do not create additional helper/service/adapter files in this stage.

## Service boundary

Implement one cohesive dependency-injected service/class, e.g.:

```text
ScoringConfigMasterService
```

It must import/reuse domain primitives from `src/profiles/scoring-config-master.js`, including:

- `canonicalizeScoringConfigPayload`
- `validateScoringMasterConfig`
- `computeConfigurationHash`
- `CONFIG_LIFECYCLE_STATUS`

Do not duplicate profile enums, rounding enums, competency sets, hash field lists, or scoring rules in the service.

## Repository dependency contract

The service must operate against an injected repository object only. No Kintone import or HTTP call is allowed.

Use a minimal repository contract equivalent to:

```text
findByMasterKey(masterRecordKey)
createValidatedRecord(validatedRecord)
getByRecordId(recordId)
findPublishedByProfileFiscalYear(profileCode, fiscalYear)
publishRecord(recordId, lifecyclePatch)
```

Repository responses in Stage 4A are canonical domain records, not raw Kintone field wrappers. Kintone mapping belongs to a later separately reviewed adapter stage.

Malformed repository responses must fail closed.

## Trusted audit dependency contract

Use an injected trusted audit provider only, equivalent to:

```text
getPublisherIdentity()
getPublishedAt()
```

The candidate/business payload must never supply trusted publisher identity or trusted publish timestamp.

The trusted publisher identity must be a non-empty stable identifier.
The trusted timestamp must be a valid parseable date-time string.

## Candidate entry contract

The public publish operation accepts a DRAFT business candidate only.

Required behavior:

- `Config_Status` may be absent or `DRAFT` only.
- Any caller attempt to provide `VALIDATED`, `PUBLISHED`, `SUPERSEDED`, or `RETIRED` is rejected.
- Non-empty caller `Published_By` is rejected.
- Non-empty caller `Published_At` is rejected.
- Non-empty caller `Configuration_Hash` is rejected.
- `Supersedes_Config_Version !== "NONE"` must fail closed with an explicit `SUPERSESSION_ACTIVATION_NOT_IMPLEMENTED` error in Stage 4A. Do not silently supersede anything.

## Ordered publish algorithm

Implement and unit-test this exact logical order:

1. Reject untrusted lifecycle/audit fields and unsupported supersession.
2. Canonicalize fields 1–19.
3. Generate/verify exact `Master_Record_Key` semantics through existing domain validation.
4. `findByMasterKey()` and require zero existing records; malformed or duplicate result fails closed.
5. Validate canonical domain rules using existing `validateScoringMasterConfig()`.
6. Compute expected SHA-256 from the canonical immutable payload.
7. Build validated record:

```text
fields 1–19 = canonical immutable payload
Config_Status = VALIDATED
Configuration_Hash = expected hash
Published_By = absent/empty
Published_At = absent/empty
```

8. Persist through `createValidatedRecord()` and require one stable non-empty record ID. Missing/ambiguous ID fails closed.
9. Exact read-back through `getByRecordId(recordId)`.
10. Require exact `Master_Record_Key` equality.
11. Canonicalize read-back immutable fields.
12. Require triple hash equality:

```text
EXPECTED_HASH
=== READBACK.Configuration_Hash
=== computeConfigurationHash(CANONICAL_READBACK_IMMUTABLE_PAYLOAD)
```

Any mismatch = `CONFIG_READBACK_MISMATCH`; do not publish.
13. Require read-back status exactly `VALIDATED`; do not accept DRAFT/PUBLISHED/other status.
14. Query `findPublishedByProfileFiscalYear(Profile_Code, Fiscal_Year)` and require an array.
15. Reject any effective-period overlap using inclusive rule:

```text
candidate.Effective_From <= existing.Effective_To
AND
existing.Effective_From <= candidate.Effective_To
```

with `SCORING_CONFIG_EFFECTIVE_OVERLAP`.
16. Only after all prior gates pass, obtain publisher identity and timestamp from the trusted audit provider.
17. Call `publishRecord(recordId, lifecyclePatch)` with lifecycle/audit fields only:

```text
Config_Status = PUBLISHED
Published_By = trusted identity
Published_At = trusted timestamp
```

Do not send immutable fields in the publish patch.
18. Final exact `getByRecordId(recordId)` read-back.
19. Require final:

```text
Config_Status = PUBLISHED
Master_Record_Key = expected key
Configuration_Hash = expected hash
canonical immutable payload = exact same canonical payload persisted as VALIDATED
Published_By = trusted identity
Published_At = trusted timestamp
```

20. Recompute final canonical hash and require equality again.
21. Only then return success, e.g. `PUBLISH_VERIFIED`.

No step may silently select newest/highest version.
No fallback to source baselines, JSON, Git, filesystem, or a second repository is allowed.

## Lifecycle helper

If a lifecycle transition helper is introduced, it must allow only:

```text
DRAFT -> VALIDATED
VALIDATED -> PUBLISHED
PUBLISHED -> SUPERSEDED
PUBLISHED -> RETIRED
SUPERSEDED -> RETIRED
```

All other transitions fail closed.

Stage 4A may test the full allowed transition matrix, but it must not implement live supersession activation.

## Error semantics

Use stable explicit error codes/messages for at least:

```text
UNTRUSTED_LIFECYCLE_FIELD
UNTRUSTED_PUBLISH_AUDIT_FIELD
SUPERSESSION_ACTIVATION_NOT_IMPLEMENTED
MASTER_CONFIG_DUPLICATE
CONFIG_READBACK_MISMATCH
SCORING_CONFIG_EFFECTIVE_OVERLAP
TRUSTED_PUBLISHER_INVALID
TRUSTED_PUBLISHED_AT_INVALID
PUBLISH_VERIFICATION_FAILED
REPOSITORY_RESPONSE_INVALID
INVALID_LIFECYCLE_TRANSITION
```

Do not expose secrets or raw dependency error internals in normal result objects.

---

# STEP 4 — REQUIRED UNIT TESTS

`tests/scoring-config-master-service.test.js` must use fake/in-memory injected dependencies only.

Cover at minimum:

1. valid first-version candidate publishes successfully
2. exact operation order is enforced
3. caller cannot set PUBLISHED directly
4. caller cannot set VALIDATED directly
5. caller Published_By rejected
6. caller Published_At rejected
7. caller Configuration_Hash rejected
8. unsupported supersession fails before persistence
9. duplicate master key blocks before persistence
10. malformed duplicate-query response fails closed
11. invalid domain config blocks before persistence
12. createValidatedRecord missing ID fails closed
13. initial read-back wrong master key -> CONFIG_READBACK_MISMATCH
14. initial read-back missing stored hash -> CONFIG_READBACK_MISMATCH
15. expected hash != stored hash -> CONFIG_READBACK_MISMATCH
16. expected hash != recomputed hash -> CONFIG_READBACK_MISMATCH
17. stored hash != recomputed hash -> CONFIG_READBACK_MISMATCH
18. read-back status not VALIDATED blocks publish
19. overlap on same first/last day boundary is rejected
20. contained overlap rejected
21. enveloping overlap rejected
22. non-overlapping earlier period passes overlap gate
23. non-overlapping later period passes overlap gate
24. different Profile_Code does not conflict when repository result contains valid different-profile data only if the service defensively verifies/filter contract; malformed unexpected rows fail closed
25. different Fiscal_Year does not conflict only under the exact repository contract; unexpected mismatched rows must not create silent ambiguity
26. overlap-query malformed response fails closed
27. audit provider is not called before validation/read-back/overlap pass
28. missing trusted publisher rejected
29. invalid trusted timestamp rejected
30. publish patch contains lifecycle/audit fields only
31. final status not PUBLISHED -> PUBLISH_VERIFICATION_FAILED
32. final master key mismatch -> PUBLISH_VERIFICATION_FAILED
33. final hash mismatch -> PUBLISH_VERIFICATION_FAILED
34. final immutable payload mutation -> PUBLISH_VERIFICATION_FAILED
35. final publisher mismatch -> PUBLISH_VERIFICATION_FAILED
36. final timestamp mismatch -> PUBLISH_VERIFICATION_FAILED
37. final success requires second hash recomputation
38. valid lifecycle transition matrix passes
39. invalid/reverse/direct-jump lifecycle transitions fail
40. no baseline fixture, filesystem, Git, JSON, or Kintone dependency is used by the service

Tests may exceed this list where needed, but do not inflate file count or duplicate tests without purpose.

Run:

```bash
git diff --check
npm test
```

All tests must pass.

---

# STEP 5 — IMPLEMENTATION COMMIT

The Stage 4A implementation commit may contain only:

```text
src/profiles/scoring-config-master.js
tests/scoring-config-master.test.js
src/services/scoring-config-master-service.js
tests/scoring-config-master-service.test.js
```

Commit exactly:

```text
feat: add scoring config publish integrity service
```

Push to `origin/ai/antigravity-wp002c`.
Verify local HEAD = remote HEAD.

---

# STEP 6 — LIVING DOC EVIDENCE

After implementation commit is pushed and tests pass, update only:

- `project-docs/CURRENT_STATE.md`
- `project-docs/HANDOFF.md`
- `project-docs/AI_REVIEW_PACKAGE.md`
- `project-docs/IMPLEMENTATION_STATUS.md`
- `project-docs/CHANGELOG_AI.md`

Required state:

```text
WP002C_STAGE3C_GATE = PASS_WITH_DOCUMENTED_EVIDENCE_EXCEPTION
R1_PREWRITE_BACKUP_PROVENANCE_GATE = UNVERIFIABLE_ACCEPTED
STAGE4A_PUBLISH_INTEGRITY_FOUNDATION = COMPLETE / PENDING CHATGPT REVIEW
App 796 = LIVE_DEPLOYED
SCHEMA_SEMANTIC_STATE = DOMAIN_ALIGNED
RECORD_COUNT = 0 (last verified checkpoint; no Kintone call in Stage 4A)
BASELINE_SEED_STATUS = NOT_STARTED
PUBLISH_PIPELINE_STATUS = FOUNDATION_IMPLEMENTED_NOT_DEPLOYED
LIVE_KINTONE_ADAPTER_STATUS = NOT_IMPLEMENTED
RUNTIME_RESOLVER_LIVE_WIRING = NOT_STARTED
SUPERSESSION_ACTIVATION = NOT_IMPLEMENTED / FAIL_CLOSED
WP002D = NOT_STARTED
THIS STAGE 4A KINTONE CALLS = 0
THIS STAGE 4A KINTONE WRITES = 0
PREWRITE_BACKUP_RETENTION_UNTIL_INDEPENDENT_REVIEW = MANDATORY
NEXT_ACTION = AWAIT CHATGPT INDEPENDENT REVIEW OF STAGE 4A BEFORE ANY LIVE ADAPTER OR RECORD WRITE
```

Use the actual full `npm test` count consistently in current operational sections.

Commit exactly:

```text
docs: record wp-002c stage4a publish service foundation
```

Push and verify local HEAD = remote HEAD.
Then STOP.

---

# STRICT KINTONE BOUNDARY FOR THIS ENTIRE TASK

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
Do not seed the 8 baseline configurations.
Do not implement a real Kintone adapter.
Do not modify `src/core/kintone-client.js`.
Do not modify `src/core/sandbox-write-guard.js`.
Do not modify `src/profiles/profile-scoring-resolver.js`.
Do not modify UI/main app files.
Do not start WP-002D.
Do not merge to develop.

---

# FINAL REPORT

Report only safe evidence:

- branch
- starting/assignment HEAD
- Stage 3C exception docs commit SHA
- Stage 4A implementation commit SHA
- Stage 4A evidence commit SHA
- changed files per commit
- canonicalization contract implemented YES/NO
- service repository interface implemented YES/NO
- trusted audit interface implemented YES/NO
- triple-hash read-back gate tests PASS/FAIL
- overlap gate tests PASS/FAIL
- final publish verification tests PASS/FAIL
- lifecycle matrix tests PASS/FAIL
- supersession unsupported fail-closed test PASS/FAIL
- full test total/pass/fail
- Kintone call/write counts = 0
- local HEAD = remote HEAD YES/NO
- tracked working tree clean YES/NO
- STOP confirmation

# REVIEW EXPECTATION

ChatGPT will inspect GitHub directly and verify:

1. Stage 3C exception closure commit precedes Stage 4A implementation.
2. Stage 3C remains honestly documented as PASS with an evidence exception, not as a normal backup PASS.
3. Future backup retention control is recorded.
4. Exactly one justified new service source file and one service test file are added.
5. Canonicalization stabilizes NUMBER values across numeric input and Kintone-style string read-back.
6. Service is dependency-injected and has no Kintone/network/filesystem/Git runtime dependency.
7. Candidate cannot inject lifecycle/publish audit fields.
8. Duplicate/master-key/domain gates fail closed.
9. Validated persistence is followed by exact record-ID read-back.
10. Triple hash equality is enforced before publish.
11. Inclusive same-profile/same-FY overlap is rejected.
12. Trusted publisher/timestamp are obtained only after all prior gates pass.
13. Publish patch contains lifecycle/audit only.
14. Final exact read-back proves status/key/hash/immutable payload/publisher/timestamp.
15. Final hash is recomputed.
16. No silent newest-version selection exists.
17. Supersession remains fail-closed/not implemented.
18. Existing 8 baseline business values are unchanged.
19. No resolver/core-client/sandbox-guard/UI scope expansion occurred.
20. Full tests pass.
21. Stage 4A Kintone calls/writes = zero.
22. No seed, live adapter, runtime wiring, WP-002D, or develop merge occurred.
23. Git local/remote synchronization passed.

Expected gates:

- `STAGE3C_EVIDENCE_EXCEPTION_CLOSURE_GATE = PASS / FAIL`
- `CANONICALIZATION_GATE = PASS / FAIL`
- `PUBLISH_SERVICE_ARCHITECTURE_GATE = PASS / FAIL`
- `TRIPLE_HASH_GATE = PASS / FAIL`
- `EFFECTIVE_OVERLAP_GATE = PASS / FAIL`
- `TRUSTED_AUDIT_GATE = PASS / FAIL`
- `FINAL_PUBLISH_READBACK_GATE = PASS / FAIL`
- `LIFECYCLE_GATE = PASS / FAIL`
- `SUPERSESSION_FAIL_CLOSED_GATE = PASS / FAIL`
- `ZERO_KINTONE_STAGE4A_GATE = PASS / FAIL`
- `REGRESSION_GATE = PASS / FAIL`
- `GIT_PUSH_SYNC_GATE = PASS / FAIL`
- `WP002C_STAGE4A_GATE = PASS / BLOCKED`
