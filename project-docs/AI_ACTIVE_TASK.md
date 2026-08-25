# AI ACTIVE TASK — DELIVERY DAY SPRINT 03A: APP 796 SCORING BASELINE LIVE SEED + APP 795 ROUTING PREFLIGHT

> **Control Plane:** ChatGPT / Independent Reviewer
> **Execution Plane:** Antigravity standalone only
> **Repository:** `rebootob/MBO2026`
> **Branch:** `ai/antigravity-wp002c`
> **Reviewed head:** `d8b56ff22b38cd9f2416bf8567e944ea0390d1f3`
> **Mode:** M6 LIVE WRITE + M7 READ-ONLY PREPARATION

# TODAY NORTH STAR — DO NOT DRIFT

```text
TODAY_DELIVERY_TARGET = REQUIRED MBO APPS OPERATIONAL + SECURE REAL-DATA HR DASHBOARD + END-TO-END SMOKE

M1 App 794 Transaction Core        = EXISTING / READINESS NOT YET CLOSED
M2 App 795 Routing Master          = 1/12 REQUESTER COVERAGE / READ-ONLY PREFLIGHT THIS SPRINT
M3 App 796 Scoring Master          = LIVE VERIFIED / 23 FIELDS / RECORDS 0
M4 App 797 Hoshin Master           = PASS
M5 App 798 Revision Archive        = PASS
M6 App 796 Scoring Baseline        = LIVE SEED + PUBLISH THIS SPRINT
M7 App 795 Routing Baseline        = PREPARE EXACT 12-SECTION PLAN; WRITE BLOCKED PENDING ACR-002 USER APPROVAL
M8 App 800 HR Dashboard MVP        = PASS / CLOSED
M9 End-to-end Smoke Test           = AFTER M6 + M7 WRITE CLOSURE

TODAY_DONE = NO
NEXT_CRITICAL_PATH = M6 NOW + M7 PREFLIGHT -> USER APPROVES ACR-002 -> M7 WRITE -> M9
```

Do not work on unrelated phases.

---

# CONTROL PLANE REVIEW — SPRINT 02R3

```text
DELIVERY_SPRINT_02_GATE = PASS / CLOSED
HRCC_CLASSIC_BUNDLE_SYNTAX_GATE = PASS
HRCC_SINGLE_REGISTRY_DECLARATION_GATE = PASS
HRCC_HEALTH_COUNT_SEMANTICS_GATE = PASS
NO_ORPHAN_ARTIFACT_GATE = PASS_WITH_DOC_OBSERVATIONS
M4 = PASS
M5 = PASS
M8 = PASS
```

Bundle stale living-doc counters/test totals into the first docs commit. Do not create a standalone closure loop.

---

# MANDATORY BUSINESS RULE RECONCILIATION BEFORE M6

User-confirmed authoritative scoring ratios:

```text
Staff – Chief             = Part A 70 / Part B 30
Assistant Manager         = Part A 60 / Part B 40
Section Manager and Above = Part A 50 / Part B 50
Japanese Staff            = preserve existing validated 70 / 30 rule unless separately changed
```

`DEC-042` is current truth. `DEC-023` still contains stale wording that says all Management & Executive = 50/50. That stale active contradiction MUST be removed/reconciled before live seed.

Required current wording in DEC-023:

```text
Staff / Japanese Staff = 70/30
Assistant Manager = 60/40
Section Manager and Above = 50/50
See DEC-042 for user reconfirmation evidence.
```

Do not change canonical `PROF_ASST_MGR = 60/40`.

Required:

```text
SCORING_RATIO_SINGLE_SOURCE_GATE = PASS
STALE_SCORING_RULE_REFERENCES = 0
```

---

# M7 GOVERNANCE BOUNDARY — IMPORTANT

`DEC-034` is FROZEN and says the remaining 11 enterprise App 795 mappings are Phase 5 scope.

Therefore Sprint 03A is NOT authorized to write App 795.

Create/update a formal proposed ACR in `project-docs/DECISIONS.md`:

```text
ACR-002 — Delivery-Day Acceleration of DEC-034 Routing Seed Boundary
Status = PROPOSED / USER APPROVAL REQUIRED
```

ACR-002 must state:

- no business architecture change
- no change to DEC-019 generic routing model
- only schedule/boundary acceleration is proposed
- proposed write scope = remaining 11 active requester mappings in App 795
- existing TME1 pilot is preserved unless exact read-back proves a correction is required
- TMT3 remains retired and MUST NOT be seeded
- no App795 write occurs until user explicitly approves ACR-002

Do not mark ACR-002 approved in this sprint.

---

# STEP 0 — GIT / SECRET SAFETY

Require:

```text
branch = ai/antigravity-wp002c
reviewed head d8b56ff22... is ancestor
local HEAD = origin branch before work
tracked working tree clean
```

No reset/rebase/force push/history rewrite.

Read mandatory living docs, DECISIONS, BUSINESS_RULES, APP_REGISTRY, WP002C plan, scoring domain/service/repository/bridge/guard, routing schema, and existing tests.

`.env.local`:

```text
ignored = YES
tracked = NO
modified = NO
printed = NO
committed = NO
```

Before any live network operation:

```js
delete process.env.KINTONE_API_TOKEN;
```

Use username/password authentication only.

Protected apps remain READ ONLY:

```text
53, 283, 305, 307, 310, 640, 643, 715, 716
```

---

# STEP 1 — DOC CLOSURE + SINGLE SOURCE CLEANUP

Update:

```text
project-docs/CURRENT_STATE.md
project-docs/HANDOFF.md
project-docs/AI_REVIEW_PACKAGE.md
project-docs/IMPLEMENTATION_STATUS.md
project-docs/CHANGELOG_AI.md
project-docs/DECISIONS.md
```

Required:

- Sprint02R3 / Delivery Sprint02 = PASS / CLOSED
- M4/M5/M8 = PASS
- correct stale generic test totals to current reviewed evidence (487/487 at Sprint02R3)
- consolidate duplicate NO_ORPHAN rows in AI_REVIEW_PACKAGE; one current canonical block only
- Active Sandbox Apps includes 794,795,796,797,798,800
- reconcile DEC-023 ratio wording to DEC-042 truth
- add ACR-002 as PROPOSED / USER APPROVAL REQUIRED
- preserve historical Stage3C evidence exception exactly

Commit exactly:

```text
docs: close dashboard sprint and prepare scoring seed
```

Push and verify sync.

---

# STEP 2 — M6 CODE / TEST: LIVE APP 796 BASELINE PUBLISHER

Create exactly one justified execution script:

```text
scripts/kintone/seed-scoring-baseline.js
```

Do not create duplicate domain/service/repository modules. Reuse:

```text
src/profiles/scoring-config-master.js
src/services/scoring-config-master-service.js
src/services/scoring-config-kintone-repository.js
src/core/kintone-client.js -> createScoringConfigRepositoryRequestBridge
src/core/sandbox-write-guard.js -> assertScoringConfigRecordWriteAuthorization / assertSandboxWriteTarget
```

## 2A Canonical baseline contract

Use `getCanonicalBaselineMasterConfigs()` as bootstrap evidence only.

Required exact 8 profile codes:

```text
PROF_STAFF_CHIEF        = 70/30
PROF_JAPANESE_STAFF     = 70/30
PROF_ASST_MGR           = 60/40
PROF_SECTION_MGR        = 50/50
PROF_SENIOR_MGR         = 50/50
PROF_DGM                = 50/50
PROF_GM                 = 50/50
PROF_VP                 = 50/50
```

All must be:

```text
Fiscal_Year = FY2026
Effective_From = 2026-04-01
Effective_To = 2027-03-31
Scoring_Config_Version = v1.0.0
Supersedes_Config_Version = NONE
```

Before network writes, validate all 8 locally:

- exactly 8 unique profile codes
- exactly 8 unique Master_Record_Key values
- all weights match authoritative ratio rules
- PartA + PartB = 100
- every domain validator passes
- every computed hash is valid 64-char lowercase SHA-256
- no duplicate profile/FY/effective overlap inside the candidate set

Do not pass caller lifecycle/audit fields to `publishScoringConfig()`. Build candidate inputs from immutable payload fields only.

## 2B Trusted publisher identity

The publisher identity MUST come from the same password-authenticated execution identity, not candidate input.

Use local `KINTONE_USERNAME` only as the authenticated login-name candidate, then verify it with the official read-only User API before any record write:

```text
GET /v1/users.json?codes[0]=<URL-encoded login name>
```

Require exactly one returned user whose `code` exactly equals the authenticated login name and is not invalid/disabled when a validity field is present.

Never print the username, password, auth header, user payload, or publisher code in console/evidence. Evidence may state only:

```text
TRUSTED_PUBLISHER_IDENTITY_VERIFIED = YES
```

`Published_At` must come from trusted execution/system time (`new Date().toISOString()`), never candidate input.

## 2C Narrow live transport

The seed script may implement one narrow inline live transport because `kintoneRequest()` is intentionally discovery-GET-only.

Requirements:

- target App ID exactly 796
- allowed repository bridge endpoints only:
  - GET `/k/v1/records.json?...app=796...`
  - GET `/k/v1/record.json?app=796&id=...`
  - POST `/k/v1/record.json` with body.app = 796
  - PUT `/k/v1/record.json` with body.app = 796 and lifecycle-only patch already enforced by Stage4C bridge
- before POST/PUT call `assertSandboxWriteTarget(796, registry, [796], {dryRunBypassDiscovery:true})`
- no DELETE
- no PATCH
- no retry after uncertain POST/PUT transport
- redact response bodies from errors

Wire:

```text
ScoringConfigKintoneRepository
-> createScoringConfigRepositoryRequestBridge
-> narrow live transport
-> ScoringConfigMasterService
```

## 2D Record-write authorizer

Reuse `assertScoringConfigRecordWriteAuthorization()` for every create and publish operation.

Each authorization must have:

```text
workPackageId = MBO-P03-WP-002C
stage = STAGE_4C_RECORD_WRITE_BRIDGE
recordWriteContractId = WP002C_SCORING_RECORD_WRITE_V1
appId = 796
exact app name
explicitUserAuthorization = true
activeWindow = true
unique authorizationId per operation
prewriteBackupEvidence = retained Sprint03A App796 record backup evidence
exact one-change manifest derived from repository request context
```

No broad reusable authorization ID.

## 2E Automated tests

Extend existing scoring service/repository/safety tests; create no extra test file unless clearly necessary.

Minimum new coverage:

- exact 8 baseline profiles
- exact 70/30, 70/30, 60/40, 50/50 x5 ratios
- caller lifecycle/audit stripping
- publisher code cannot come from candidate
- publisher verification failure blocks before POST
- App796 exact-only transport
- POST/PUT guard exact App796
- DELETE/PATCH/wrong app blocked
- unique record authorization per create/publish
- prewrite backup required
- no-orphan: no competing baseline JSON/file source created

Run `npm test` before live write. Zero failures.

Commit exactly:

```text
feat: add controlled app796 scoring baseline publisher
```

Push before live write.

---

# STEP 3 — M6 DURABLE PREWRITE BACKUP + LIVE PREFLIGHT

Create and retain:

```text
backups/delivery-sprint-03a/app796/<UTC_TIMESTAMP>/
```

Capture before any App796 write:

```text
live settings
preview settings
live fields
preview fields
live ACL
preview ACL
all live records
record count
```

Create SHA-256 manifest. Retain until independent review. Do not commit raw backup.

Preconditions:

```text
App ID = 796
Name = MBO Profile & Scoring Configuration Master [Sandbox]
23-field exact live/preview schema
Creator-only live/preview ACL
recordCount = 0
trusted publisher identity verified
all 8 baseline candidates prevalidated
```

If recordCount != 0: STOP with zero write. Do not merge/overwrite/delete unknown records.

---

# STEP 4 — M6 LIVE SEED / PUBLISH

Publish the 8 baseline configurations sequentially through `ScoringConfigMasterService.publishScoringConfig()`.

For each candidate the existing service must enforce:

```text
VALIDATED create
initial exact readback
triple hash equality
published overlap query
trusted Published_By / Published_At
PUBLISHED patch with expected revision
final exact readback
final hash / immutable equality
```

Do not bypass the service to write PUBLISHED directly.

Expected successful write budget for 8 records:

```text
POST /k/v1/record.json = 8   (VALIDATED creates)
PUT  /k/v1/record.json = 8   (PUBLISHED lifecycle patches)
DELETE = 0
schema/deploy = 0
```

If any candidate fails:

- STOP immediately
- NO blind retry
- NO automatic delete
- perform GET-only exact reconciliation
- record which exact keys are PUBLISHED / VALIDATED / missing
- keep resolver live wiring disabled
- M6 = BLOCKED_PARTIAL and return for review

Because resolver live wiring is not yet enabled, partial publish must not be treated as runtime-ready.

## Final M6 readback

Require exactly:

```text
total App796 records = 8
PUBLISHED records = 8
VALIDATED records = 0
all 8 expected keys exactly once
all immutable payloads equal canonical candidates
all stored hashes = recomputed hashes
all Published_By values = trusted authenticated publisher
all Published_At values valid timezone-aware ISO datetimes
no effective overlap ambiguity
```

Do not expose publisher identity in docs.

---

# STEP 5 — M7 APP795 READ-ONLY PREFLIGHT + EXACT SEED MANIFEST

ZERO App795 writes in Sprint03A.

Read-only inspect App795:

```text
live/preview identity
live/preview fields
live/preview ACL
all current records (safe business routing fields only)
active record count
```

Verify current pilot if present:

```text
TME1 -> e1
```

Target active requester mapping source of truth from DEC-031:

```text
TME1 -> e1
TMF1 -> f1
TMF2 -> f2
TMF3 -> f3
TMG1 -> g_request
TMG2 -> g_request
TMH1 -> tmh
TMH2 -> tmh
TMH3 -> tmh
TMS1 -> s1
TMT1 -> t1
TMT2 -> t2
```

Strict exclusion:

```text
TMT3 = RETIRED / MUST NOT SEED
```

Read-only verify the 9 requester accounts using User API; never print user payloads.

Because `Section_Name` is required, resolve each section name from existing approved source(s), preferring protected App53 READ ONLY / existing canonical evidence. If one code maps to conflicting names, STOP M7 readiness and report exact code only; do not guess.

Generate an exact seed manifest in living documentation containing only safe business identifiers:

```text
Section_Code
Section_Name
Requester_User code
Active = Active
operation = KEEP existing exact pilot OR CREATE missing record
```

Do not populate/guess approver slots in this requester-seed acceleration manifest.

Also audit App795 current schema against frozen DEC-019 and flag deprecated/legacy fields for future Phase5 cleanup. Do NOT delete/rename fields in this sprint.

Required output:

```text
M7_CURRENT_ACTIVE_COVERAGE = x/12
M7_REQUESTER_ACCOUNT_VERIFICATION = 9/9 or BLOCKED
M7_EXACT_SEED_MANIFEST = READY / BLOCKED
M7_WRITE_AUTHORIZATION = NO (ACR-002 pending)
```

---

# STEP 6 — REGRESSION + EVIDENCE

Run full `npm test` after live M6 seed.

Update five living docs + DECISIONS as needed.

Required final evidence:

```text
DELIVERY_SPRINT_03A = COMPLETE / PENDING CHATGPT REVIEW
M6 App796 = 8/8 PUBLISHED or exact partial failure state
M6 record POST count = actual
M6 lifecycle PUT count = actual
M6 DELETE count = 0
M6 schema/deploy writes = 0
TRUSTED_PUBLISHER_IDENTITY_VERIFIED = YES/NO (identity itself redacted)
App795 writes = 0
M7 active coverage = actual x/12
M7 exact manifest = READY/BLOCKED
ACR-002 = PROPOSED / USER APPROVAL REQUIRED
protected writes = 0
App794/797/798/800 writes = 0
NO_ORPHAN_ARTIFACT_GATE = PASS
STALE_ACTIVE_REFERENCES = 0
backup retained = YES + safe path + SHA256 manifest
npm test = actual total / PASS
NEXT_ACTION = if M6 PASS and user approves ACR-002 -> controlled M7 write; otherwise await approval
TODAY_DONE = NO
```

Expected commits after Control Plane task:

```text
1. docs: close dashboard sprint and prepare scoring seed
2. feat: add controlled app796 scoring baseline publisher
3. docs: record sprint03a scoring seed and routing preflight evidence
```

Do not create a code commit for M7 because M7 is read-only/preparation only in this sprint.

Push; require local HEAD = remote HEAD; tracked tree clean; STOP.

# STRICT OUT OF SCOPE

Do NOT:

- write App795
- modify App794
- modify App797/798
- redeploy App800
- create Hoshin records
- wire App794 live scoring resolver yet
- implement generic twin-status routing engine
- seed approver slots with guessed values
- seed TMT3
- delete legacy App795 fields
- create duplicate baseline config files

# REVIEW EXPECTATION

```text
SPRINT02_CLOSURE_GATE
SCORING_RATIO_SINGLE_SOURCE_GATE
APP796_PREWRITE_BACKUP_GATE
TRUSTED_PUBLISHER_GATE
APP796_BASELINE_VALIDATION_GATE
APP796_RECORD_WRITE_GUARD_GATE
APP796_8_OF_8_PUBLISH_GATE
APP796_HASH_READBACK_GATE
APP796_ZERO_DELETE_GATE
APP795_ZERO_WRITE_GATE
M7_REQUESTER_SOURCE_GATE
M7_ACCOUNT_VERIFICATION_GATE
M7_MANIFEST_READINESS_GATE
ACR002_STATUS_GATE
PROTECTED_ZERO_WRITE_GATE
NO_ORPHAN_ARTIFACT_GATE
REGRESSION_GATE
GIT_PUSH_SYNC_GATE
DELIVERY_SPRINT_03A_GATE
```
