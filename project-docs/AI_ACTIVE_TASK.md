# AI ACTIVE TASK — ANTIGRAVITY STAGE 3C-R1 CONTROLLED DROPDOWN SCHEMA REPAIR

> **Control Plane:** ChatGPT / Project Lead / Architect / Independent Reviewer
> **Primary Execution Plane:** Antigravity
> **Codex:** NOT ACTIVE
> **Repository:** `rebootob/MBO2026`
> **Execution / Review Branch:** `ai/antigravity-wp002c`
> **Reviewed Baseline Head:** `192a7f0902e12f72f8cb8a6b139b98d1d0f069c6`
> **Target App:** `796` — `MBO Profile & Scoring Configuration Master [Sandbox]`
> **Environment:** SANDBOX / Production FALSE
> **WP:** `MBO-P03-WP-002C`
> **Stage:** `STAGE 3C-R1 — CONTROLLED TWO-DROPDOWN SEMANTIC REPAIR`

## CONTROL PLANE DECISION

Independent review passed the Stage-3C code/binding corrections and authorized the next narrow repair stage.

Current durable state:

```text
App 796 = LIVE_DEPLOYED
Access = CREATOR_ONLY / DEFAULT_DENY
Schema physical state = 23_FIELDS_LIVE
Schema semantic state = CORRECTION_REQUIRED
Correction required fields = Part_A_Scoring_Mode, Config_Status
Record count = 0 (last verified)
Baseline seed = NOT_STARTED
Publish pipeline = NOT_DEPLOYED
Stage-3C creation write history = Form Fields POST 1, Deploy POST 1
Latest reported tests = 199/199 PASS
```

This task repairs **only the two existing DROP_DOWN option sets**. It does not create/delete fields, modify the other 21 fields, change ACL/layout/views/process/customization, create records, seed baseline data, implement publish lifecycle, or start WP-002D.

## WHY THIS REPAIR IS REQUIRED

The live schema currently has display-order prefixes embedded in option business values from the original Stage-3C contract error.

Known defective state:

```text
Part_A_Scoring_Mode
  0 DIFFICULTY_ACHIEVEMENT_MATRIX
  1 ACHIEVEMENT_DIRECT

Config_Status
  0 DRAFT
  1 VALIDATED
  2 PUBLISHED
  3 SUPERSEDED
  4 RETIRED
```

Frozen runtime/domain values require:

```text
Part_A_Scoring_Mode
  DIFFICULTY_ACHIEVEMENT_MATRIX  index 0
  ACHIEVEMENT_DIRECT             index 1

Config_Status
  DRAFT       index 0
  VALIDATED   index 1
  PUBLISHED   index 2
  SUPERSEDED  index 3
  RETIRED     index 4
```

Kintone Update Form Fields modifies pre-live settings. When an `options` object is supplied, omitted old options are deleted and newly named options are treated as new options. Therefore **record count must be exactly zero before this repair write**. If any record exists, STOP with zero writes.

## MAXIMUM WRITE BOUNDARY

For this entire Stage 3C-R1:

```text
APP_CREATE POST = 0
FORM FIELDS POST = 0
FORM FIELDS PUT = 1 maximum
FORM FIELDS DELETE = 0
ACL PUT = 0
DEPLOY POST = 1 maximum
LAYOUT WRITE = 0
VIEW WRITE = 0
PROCESS WRITE = 0
CUSTOMIZATION WRITE = 0
RECORD WRITE = 0
RECORD DELETE = 0
APP DELETE = 0
```

Apps 794/795 and protected Apps 53, 283, 305, 307, 310, 640, 643, 715, 716 must receive zero writes.

No automatic retry of either write is allowed.

---

# STEP 0 — GIT SAFETY GATE

Run:

```bash
git status --short
git branch --show-current
git fetch origin
git pull --ff-only
git rev-parse HEAD
git rev-parse origin/ai/antigravity-wp002c
git merge-base --is-ancestor 192a7f0902e12f72f8cb8a6b139b98d1d0f069c6 HEAD
```

Required:

```text
branch = ai/antigravity-wp002c
working tree tracked state = clean
local HEAD = remote HEAD
reviewed baseline 192a7f... is in ancestry
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
- `src/core/sandbox-write-guard.js`
- `src/core/kintone-client.js`
- `tests/safety-guard.test.js`

---

# STEP 1 — IMPLEMENT DEDICATED REPAIR SAFETY PATH BEFORE ANY KINTONE CALL

Prefer existing files only.

Authorized implementation/test files:

- `src/core/sandbox-write-guard.js`
- `src/core/kintone-client.js`
- `tests/safety-guard.test.js`

## 1A. Repair authorization contract

Add exact constants equivalent to:

```text
WP002C_SCHEMA_REPAIR_STAGE = STAGE_3C_DROPDOWN_REPAIR
WP002C_SCHEMA_REPAIR_CONTRACT_ID = WP002C_2_DROPDOWN_REPAIR_V1
```

Add a narrow fail-closed guard such as `assertScoringMasterDropdownRepairAuthorization(authConfig, requestConfig)`.

It must require all:

```text
workPackageId = MBO-P03-WP-002C
stage = STAGE_3C_DROPDOWN_REPAIR
appId = 796
appName = MBO Profile & Scoring Configuration Master [Sandbox]
requestConfig.repairContractId = WP002C_2_DROPDOWN_REPAIR_V1
explicitUserAuthorization = true
activeWindow = true
authorizationId = non-empty and single-use in current process
operationSequence = FORM_FIELDS_UPDATE -> APP_DEPLOY
repairFieldCodes = exactly [Part_A_Scoring_Mode, Config_Status]
```

The caller must not be able to authorize a third field, alternate App, alternate endpoint, record operation, ACL operation, delete, layout/view/process/customization write, or caller-supplied arbitrary field properties.

Do not change:

```text
DISCOVERY_MODE = true
WRITE_ALLOWED_APPS = []
protected app blocks
```

## 1B. Exact repair payload

Implement one cohesive exact-purpose function in existing `src/core/kintone-client.js`, e.g. `repairScoringMasterDropdownSchema(...)`.

Hard-bind:

```text
App = 796
PUT endpoint = /k/v1/preview/app/form/fields.json
Deploy endpoint = /k/v1/preview/app/deploy.json
Properties keys = exactly Part_A_Scoring_Mode, Config_Status
```

The PUT `properties` object must contain exactly two field entries and must update only parameters necessary for this repair.

Exact repair field payload:

```text
Part_A_Scoring_Mode:
  type = DROP_DOWN
  options:
    DIFFICULTY_ACHIEVEMENT_MATRIX:
      label = DIFFICULTY_ACHIEVEMENT_MATRIX
      index = 0
    ACHIEVEMENT_DIRECT:
      label = ACHIEVEMENT_DIRECT
      index = 1

Config_Status:
  type = DROP_DOWN
  options:
    DRAFT:
      label = DRAFT
      index = 0
    VALIDATED:
      label = VALIDATED
      index = 1
    PUBLISHED:
      label = PUBLISHED
      index = 2
    SUPERSEDED:
      label = SUPERSEDED
      index = 3
    RETIRED:
      label = RETIRED
      index = 4
```

Do not include a caller-controlled `code`, label, required flag, default value, unique flag, or any third field in the PUT payload. Parameters omitted from Update Form Fields must remain unchanged and will be verified by read-back.

## 1C. Known-defect preflight verifier

Add a repair-specific verifier that proves the **pre-write schema is exactly the known Stage-3C defect**, not an arbitrary drift state.

Required pre-write proof:

- exactly all 23 planned business fields exist
- all 23 field labels equal field codes
- all field types/required/unique settings match the frozen contract
- Master_Record_Key remains the only unique field
- the 21 unaffected fields match the corrected exact schema contract
- `Part_A_Scoring_Mode` differs only by the known prefixed option keys/labels above and indexes remain 0/1
- `Config_Status` differs only by the known prefixed option keys/labels above and indexes remain 0..4
- no unexpected default business value

If the two dropdowns are already corrected in both live and preview, STOP with zero writes and report `REPAIR_ALREADY_APPLIED_REQUIRES_RECONCILIATION`.

If the state is anything other than exact known defect or exact already-corrected state, STOP with zero writes as `UNEXPECTED_SCHEMA_DRIFT`.

## 1D. Tests before any Kintone call

Add tests at minimum:

1. wrong WP rejected
2. wrong stage rejected
3. wrong App rejected
4. wrong name rejected
5. missing/wrong repair contract ID rejected before fetch
6. missing authorization rejected
7. reused authorization ID rejected
8. operation sequence mismatch rejected
9. repair field list must be exactly the two approved fields
10. generated repair payload contains exactly two properties
11. repair payload has no record/ACL/layout/view/process/customization/delete operation
12. repair payload uses raw domain values and exact indexes
13. known-defect verifier accepts only exact prefixed defect
14. arbitrary third option / missing option / wrong index rejected
15. drift in any unaffected field rejected
16. already-corrected schema produces no PUT/deploy
17. record count nonzero prevents PUT
18. PUT uses exact current numeric preview revision
19. PUT occurs maximum once
20. PUT transport uncertainty never retries and uses GET-only reconciliation
21. PUT explicit HTTP failure prevents deploy
22. preview corrected 23/23 exact read-back required before deploy
23. deploy uses exact post-PUT revision and occurs maximum once
24. deploy empty success body is not parsed
25. final success requires exact live 23/23 corrected read-back
26. ACL must remain creator-only/default-deny
27. protected Apps and 794/795 remain unwritable
28. DISCOVERY_MODE and WRITE_ALLOWED_APPS remain unchanged

Run:

```bash
git diff --check
npm test
```

All tests must pass.

---

# STEP 2 — COMMIT/PUSH REPAIR IMPLEMENTATION BEFORE ANY KINTONE CALL

Only these files may be changed in the implementation commit:

```text
src/core/sandbox-write-guard.js
src/core/kintone-client.js
tests/safety-guard.test.js
```

Commit exactly:

```text
feat: add guarded wp-002c dropdown schema repair
```

Push only to:

```text
origin/ai/antigravity-wp002c
```

Verify local HEAD = remote HEAD and tracked working tree clean.

Only after this implementation commit is pushed may Kintone access begin.

---

# STEP 3 — SECURE LOCAL BACKUP + GET-ONLY PRE-WRITE PREFLIGHT

Use `.env.local` only locally. Never print or commit credentials, Authorization headers, tokens, cookies, or backup payloads containing sensitive environment/account metadata.

Create/verify a local secure backup snapshot of current App 796 state using existing project backup practice. At minimum preserve:

- live app identity/settings
- live form fields
- live ACL
- preview settings
- preview form fields
- preview ACL
- live record count/result

Report only:

```text
BACKUP_VERIFIED = YES/NO
BACKUP_EVIDENCE_ID_OR_HASH = safe identifier
```

Then GET-only preflight:

```text
GET /k/v1/app.json?id=796
GET /k/v1/app/settings.json?app=796
GET /k/v1/app/acl.json?app=796
GET /k/v1/app/form/fields.json?app=796
GET /k/v1/preview/app/settings.json?app=796
GET /k/v1/preview/app/acl.json?app=796
GET /k/v1/preview/app/form/fields.json?app=796
GET /k/v1/records.json?app=796&query=limit%201
```

Required before any write:

```text
App ID/name exact
live ACL = CREATOR_ONLY / DEFAULT_DENY
preview ACL = CREATOR_ONLY / DEFAULT_DENY
record count = 0
live schema = exact known Stage-3C prefixed defect
preview schema = exact known Stage-3C prefixed defect
live and preview relevant schema state agree
preview revision = current valid numeric revision
```

If record count > 0: STOP with zero writes.
If live/preview are already corrected: STOP with zero writes.
If schema differs from exact known defect: STOP with zero writes.
If identity/ACL differs: STOP with zero writes.

Run `npm test` again immediately before write. All tests must pass.

---

# STEP 4 — EXACT ONE-TIME FORM FIELDS PUT

Authorization ID:

```text
MBO-P03-WP-002C-STAGE3C-R1-20260825-0649-ICT
```

Submit at most one request:

```text
PUT /k/v1/preview/app/form/fields.json
```

Body shape must be exactly:

```text
app = 796
properties = exactly the two approved DROP_DOWN repair entries
revision = exact current numeric preview revision from preflight
```

Do not use `revision = -1` and do not omit revision.

As soon as the PUT request is sent:

```text
STAGE3C_REPAIR_PUT_ATTEMPTS = 1
```

Never issue attempt 2.

### Explicit non-2xx

Record safe HTTP/error evidence, do not retry, do not deploy, STOP.

### Transport uncertainty

Do not retry PUT.

Use GET-only reconciliation:

```text
GET preview form fields
GET preview settings
```

Continue only if exact corrected 23/23 schema is proven and a valid latest numeric revision is obtained. Otherwise STOP; no deploy.

### Successful PUT

Require HTTP success and numeric returned revision. Record:

```text
REPAIR_SCHEMA_REVISION = <returned revision>
```

---

# STEP 5 — EXACT PREVIEW READ-BACK BEFORE DEPLOY

GET only:

```text
GET /k/v1/preview/app/form/fields.json?app=796
GET /k/v1/preview/app/settings.json?app=796
GET /k/v1/preview/app/acl.json?app=796
GET /k/v1/records.json?app=796&query=limit%201
```

Require:

```text
23/23 fields match corrected exact schema contract
all 23 labels equal field codes
Part_A_Scoring_Mode raw values/index exact
Config_Status raw values/index exact
21 unaffected fields unchanged/exact
Master_Record_Key only unique field
no unexpected default values
ACL remains creator-only/default-deny
record count remains 0
latest preview revision is exact valid numeric revision
```

If any mismatch: STOP, no deploy.

---

# STEP 6 — EXACT ONE-TIME DEPLOY

Submit at most one:

```text
POST /k/v1/preview/app/deploy.json
```

Exact body:

```json
{
  "apps": [
    {
      "app": 796,
      "revision": "<EXACT_REPAIR_SCHEMA_REVISION>"
    }
  ]
}
```

Rules:

- one App only
- no `revert`
- no `-1`
- deploy POST attempts <= 1
- successful deploy response does not require a JSON body
- transport uncertainty never triggers retry

After request is sent:

```text
STAGE3C_REPAIR_DEPLOY_POST_ATTEMPTS = 1
```

Poll GET deploy status only, maximum 30 checks at approximately 2 seconds.

```text
PROCESSING -> continue
SUCCESS -> live verification
FAIL/CANCEL -> STOP
poll timeout/uncertainty -> STOP
```

Never send a second deploy POST.

---

# STEP 7 — POSITIVE LIVE REPAIR VERIFICATION

After deploy status SUCCESS, GET only:

```text
GET /k/v1/app.json?id=796
GET /k/v1/apps.json?ids[0]=796
GET /k/v1/app/settings.json?app=796
GET /k/v1/app/acl.json?app=796
GET /k/v1/app/form/fields.json?app=796
GET /k/v1/records.json?app=796&query=limit%201
```

Require all:

```text
App 796 identity exact
catalog publication includes App 796
ACL = CREATOR_ONLY / DEFAULT_DENY
23/23 live fields match corrected exact schema contract
all field labels exact
Part_A_Scoring_Mode values = DIFFICULTY_ACHIEVEMENT_MATRIX, ACHIEVEMENT_DIRECT
Config_Status values = DRAFT, VALIDATED, PUBLISHED, SUPERSEDED, RETIRED
indexes exact
other 21 fields unchanged/exact
record count = 0
```

Deploy status SUCCESS alone is not sufficient.

On full success:

```text
SCHEMA_STATUS = CONFIGURED_23_FIELDS
SCHEMA_SEMANTIC_STATE = DOMAIN_ALIGNED
CORRECTION_REQUIRED_FIELDS = NONE
```

Do not claim lifecycle/publish pipeline implementation; this task fixes only physical schema semantics.

---

# STEP 8 — LIVING DOC / REGISTRY EVIDENCE

Only after positive live verification PASS, update:

- `project-docs/CURRENT_STATE.md`
- `project-docs/HANDOFF.md`
- `project-docs/AI_REVIEW_PACKAGE.md`
- `project-docs/IMPLEMENTATION_STATUS.md`
- `project-docs/CHANGELOG_AI.md`
- `project-docs/APP_REGISTRY.md`

Required state:

```text
Active AI = Antigravity
Branch = ai/antigravity-wp002c
WP002C_STAGE3B_GATE = PASS
WP-002C Stage 3C physical creation = COMPLETE
WP-002C Stage 3C-R1 dropdown repair = COMPLETE / PENDING CHATGPT REVIEW
App 796 = LIVE_DEPLOYED
ACCESS_STATUS = CREATOR_ONLY / DEFAULT_DENY
SCHEMA_STATUS = CONFIGURED_23_FIELDS
SCHEMA_SEMANTIC_STATE = DOMAIN_ALIGNED
CORRECTION_REQUIRED_FIELDS = NONE
RECORD_COUNT = 0
BASELINE_SEED_STATUS = NOT_STARTED
PUBLISH_PIPELINE_STATUS = NOT_DEPLOYED
WP-002D = NOT STARTED
NEXT_ACTION = AWAIT CHATGPT INDEPENDENT REVIEW OF STAGE 3C-R1
```

Update all current test-count references in top/current operational sections to the actual final suite count. Preserve older historical test counts inside clearly historical evidence logs.

`APP_REGISTRY.md` must continue to identify App 796 as Sandbox / Live / Creator-only and record the corrected 23-field schema state without implying seed/publish completion.

If a repair write was attempted but final live verification failed/uncertain, update only minimum safe write-history evidence and keep:

```text
WP002C_STAGE3C_GATE = BLOCKED
SCHEMA_SEMANTIC_STATE = REPAIR_FAILED_OR_UNCERTAIN
NO RETRY EXECUTED
```

Do not falsely mark DOMAIN_ALIGNED.

---

# STEP 9 — FINAL TEST / COMMIT / PUSH

Run:

```bash
git diff --check
npm test
git status --short
git diff --name-only
```

All tests must pass.

Verified success evidence commit:

```text
chore: record wp-002c dropdown schema repair
```

Failed/uncertain evidence commit:

```text
chore: record wp-002c dropdown repair attempt
```

Push only to:

```text
origin/ai/antigravity-wp002c
```

Then:

```bash
git fetch origin
git rev-parse HEAD
git rev-parse origin/ai/antigravity-wp002c
git status --short
```

Required:

```text
local HEAD = remote HEAD
tracked working tree clean
```

STOP.

Do not seed records.
Do not implement publish pipeline.
Do not start WP-002D.
Do not merge to develop.

---

# ROLLBACK / FAILURE RULE

No automatic destructive rollback is authorized.

If PUT was sent and verification becomes uncertain:

- do not send PUT again
- do not delete fields/options manually
- do not revert deploy automatically
- do not delete App 796
- do not create a new App
- preserve evidence and STOP

If PUT succeeded but deploy was not sent because preview verification failed, leave the pre-live state as-is, preserve evidence, and STOP for Control Plane.

Any revert/second-repair action requires a new Control Plane authorization.

---

# FINAL REPORT

Report only safe evidence:

- execution plane / branch
- starting HEAD and implementation commit SHA
- repair authorization ID
- repair contract ID
- backup verified + safe evidence hash/ID
- preflight App identity
- preflight live/preview ACL
- preflight record count
- preflight defect classification
- preview revision before PUT
- tests before write total/pass/fail
- repair PUT attempt count
- PUT HTTP/transport outcome
- returned/reconciled repair revision
- preview corrected 23/23 read-back PASS/FAIL
- deploy POST attempt count
- deploy status sequence/final status
- live App/catalog verification
- live ACL verification
- live corrected 23/23 schema verification
- live record count
- all Stage-3C-R1 write counts
- Apps 794/795/protected-app write counts
- tests after operation total/pass/fail
- evidence/status commit SHA
- changed files
- local HEAD = remote HEAD YES/NO
- tracked working tree clean YES/NO
- final schema semantic state
- STOP confirmation

Never reveal credentials, usernames, passwords, tokens, cookies, authorization headers, `.env.local`, or sensitive backup contents.

# REVIEW EXPECTATION

ChatGPT will inspect GitHub branch `ai/antigravity-wp002c` directly and verify:

1. Reviewed baseline `192a7f...` remains in ancestry.
2. Dedicated repair implementation/tests were committed and pushed before any Kintone call/write.
3. Repair authorization is exact WP/stage/App/name/contract/single-use/fail-closed.
4. Repair payload is hard-bound to exactly two dropdown fields.
5. No caller-controlled third field/properties/endpoint is possible.
6. Pre-write backup passed.
7. Preflight proved record count exactly zero.
8. Preflight proved exact known defect in both live and preview; arbitrary drift would stop.
9. All 21 unaffected fields were exact before repair.
10. Form Fields PUT occurred <= 1 time and used exact current revision.
11. PUT updated only the two allowed dropdown option sets.
12. No Form Fields POST/DELETE occurred.
13. No retry occurred after failure/transport uncertainty.
14. Preview 23/23 corrected exact read-back passed before deploy.
15. Deploy POST occurred <= 1 time with exact post-PUT revision.
16. Deploy status alone was not used as success proof.
17. Live 23/23 exact read-back proves raw domain option values and indexes.
18. The other 21 fields remained unchanged/exact.
19. ACL remained creator-only/default-deny.
20. Record count remained zero; no seed occurred.
21. Apps 794/795 and protected Apps received zero writes.
22. No layout/view/process/customization/ACL/record/delete/App-create scope expansion occurred.
23. Global discovery/default-deny safety remained unchanged.
24. Full tests pass before and after repair.
25. Living docs/registry accurately record DOMAIN_ALIGNED only after positive live proof.
26. Git local/remote heads are synchronized.
27. Publish pipeline and WP-002D did not start.

Expected gates:

- `STAGE3C_R1_IMPLEMENTATION_GATE = PASS / FAIL`
- `REPAIR_AUTHORIZATION_GATE = PASS / FAIL`
- `PREWRITE_BACKUP_GATE = PASS / FAIL`
- `KNOWN_DEFECT_PREFLIGHT_GATE = PASS / FAIL`
- `ZERO_RECORD_GATE = PASS / FAIL`
- `REPAIR_WRITE_SCOPE_GATE = PASS / FAIL`
- `REPAIR_SINGLE_ATTEMPT_GATE = PASS / FAIL`
- `PREVIEW_REPAIR_READBACK_GATE = PASS / FAIL`
- `REPAIR_DEPLOY_GATE = PASS / FAIL / UNCERTAIN`
- `LIVE_SCHEMA_REPAIR_GATE = PASS / FAIL / UNVERIFIABLE`
- `ACL_PRESERVATION_GATE = PASS / FAIL`
- `ZERO_SEED_GATE = PASS / FAIL`
- `REGRESSION_GATE = PASS / FAIL`
- `GIT_PUSH_SYNC_GATE = PASS / FAIL`
- `KINTONE_SAFETY_GATE = PASS / FAIL`
- `WP002C_STAGE3C_GATE = PASS / BLOCKED / FAIL`
