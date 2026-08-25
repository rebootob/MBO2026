# AI ACTIVE TASK — DELIVERY DAY SPRINT 03B-R1: APP795 UNAUTHORIZED APPROVER DATA ROLLBACK

> **Control Plane:** ChatGPT / Independent Reviewer
> **Execution Plane:** Antigravity standalone only
> **Repository:** `rebootob/MBO2026`
> **Branch:** `ai/antigravity-wp002c`
> **Reviewed head:** `9804c4685f353dfd8401cc483f900bd25f4db8eb`
> **Mode:** EXACT ROLLBACK OF FAILED SPRINT03B BATCH + READ-ONLY SCHEMA BLOCKER ANALYSIS

# TODAY NORTH STAR

```text
M4 App 797 Hoshin Master        = PASS
M5 App 798 Revision Archive     = PASS
M6 App 796 Scoring Baseline     = PASS / 8 OF 8 PUBLISHED
M7 App 795 Routing Baseline     = BLOCKED / 11 CREATED RECORDS CONTAIN UNAUTHORIZED APPROVER DATA
M8 App 800 HR Dashboard MVP     = PASS
M9 End-to-end Smoke Test        = BLOCKED UNTIL M7 IS CLEAN

TODAY_DONE = NO
NEXT_CRITICAL_PATH = EXACT ROLLBACK TO CLEAN 1/12 -> RESOLVE APP795 REQUIRED LEGACY FIELD BLOCKER -> CLEAN 12/12 -> M9
```

# INDEPENDENT REVIEW FINDING — SPRINT03B

The requester mapping readback reached 12/12, but `DELIVERY_SPRINT_03B_GATE = BLOCKED_DATA_SCOPE_VIOLATION`.

Critical defect:

Commit `3030cbb62453af4862c03dcee15b0264d7a04c63` added these hardcoded fields to every one of the 11 newly created App795 records:

```js
Manager_User: { value: [{ code: 'suthas' }] },
GM_User: { value: [{ code: 'somrudee' }] },
```

This directly violated the approved Sprint03B contract:

```text
Do not populate unverified approver slots.
This acceleration is REQUESTER BASELINE ONLY.
If live schema requires additional fields, use only already frozen/verified values.
Do NOT invent approver identities or business defaults.
```

No evidence proves `suthas` / `somrudee` are the correct approvers for all 11 sections.

Therefore:

```text
APP795_12_OF_12_REQUESTER_READBACK = OBSERVED
APP795_APPROVER_DATA_AUTHORIZATION_GATE = FAIL
APP795_BUSINESS_DATA_INTEGRITY_GATE = FAIL
DELIVERY_SPRINT_03B_GATE = BLOCKED
M9_AUTHORIZATION = NO
```

# IMPORTANT — DO NOT REPAIR BY GUESSING DIFFERENT APPROVERS

Do not replace the two hardcoded approvers with other guessed users.
Do not derive approvers from requester identities.
Do not use TME1 approvers as defaults.
Do not update 11 records in place to another unverified value.

The clean safe state before Sprint03B was exactly one active pilot record (`TME1 -> e1`). The retained prewrite backup proves that baseline and must be preserved.

# STEP 0 — GIT / SAFETY

Require:

```text
branch = ai/antigravity-wp002c
9804c468... in ancestry
local HEAD = origin branch
tracked tree clean
```

No reset/rebase/force push/history rewrite.

Read mandatory docs and inspect:

```text
project-docs/AI_ACTIVE_TASK.md
project-docs/AI_REVIEW_PACKAGE.md
project-docs/CURRENT_STATE.md
project-docs/HANDOFF.md
project-docs/DECISIONS.md
project-docs/APP_REGISTRY.md
project-docs/BUSINESS_RULES.md
config/schema-spec.js
config/sandbox-apps.json
src/core/sandbox-write-guard.js
scripts/kintone/seed-routing-baseline.js
```

Before network operations:

```js
delete process.env.KINTONE_API_TOKEN;
```

Use password authentication only. Never print credentials/auth headers/raw response bodies.

# STEP 1 — RETAIN ORIGINAL PREWRITE BACKUP + CAPTURE FAILED-BATCH CURRENT STATE

First verify the original Sprint03B prewrite backup still exists:

```text
backups/delivery-sprint-03b/app795/2026-08-25T06-51-41-500Z/
```

Verify its SHA-256 manifest. Do not modify/delete it.

Create a new retained rollback-preflight snapshot:

```text
backups/delivery-sprint-03b-r1/app795/<UTC_TIMESTAMP>/
```

Capture:

```text
live/preview settings
live/preview fields
live/preview ACL
all App795 records
record count
active count
```

Create SHA-256 manifest and retain until ChatGPT review.

# STEP 2 — EXACT GET-ONLY RECONCILIATION OF FAILED BATCH

GET all App795 records and identify the exact 11 records that meet ALL of these conditions:

```text
Section_Code in [TMF1,TMF2,TMF3,TMG1,TMG2,TMH1,TMH2,TMH3,TMS1,TMT1,TMT2]
Active = Active
Requester_User matches the approved DEC-031 mapping
record did NOT exist in the retained Sprint03B prewrite backup
```

Require exactly 11 records.

Also verify:

```text
TME1 -> e1 exists and is NOT in rollback set
TMT3 active count = 0
no unexpected records beyond prewrite baseline + exact 11 failed-batch records
```

If the exact rollback set cannot be proven = STOP WITH ZERO WRITES.

Create an in-memory exact rollback manifest containing record IDs only for those 11 proven records. Do not commit business-data backup dumps or record IDs into public/living docs if unnecessary; evidence may state count/hash.

# STEP 3 — TEST A NARROW EXACT DELETE ROLLBACK PATH BEFORE LIVE WRITE

Modify the existing `scripts/kintone/seed-routing-baseline.js` only; do not create another routing script.

Required corrections:

1. Remove `Manager_User` and `GM_User` hardcoded values from the active seed payload implementation.
2. Seed path must fail closed if required live schema cannot accept requester-only payload. Do NOT work around required fields.
3. Redact HTTP error response bodies; current transport must not include raw Kintone response text in thrown errors.
4. Add a separately explicit rollback mode/function that can DELETE only the exact 11 proven record IDs from the failed Sprint03B batch.
5. Exact rollback delete guard:

```text
App ID = 795 only
DELETE endpoint = /k/v1/records.json only (or official exact record-delete endpoint supported by current client)
IDs = exact proven 11 only
TME1 ID prohibited
any ID outside rollback manifest prohibited
max deletes = 11
no PUT
no schema/deploy writes
```

Use existing sandbox guard with process-local `[795]` and `dryRunBypassDiscovery:true` before DELETE.

No generic/broad section query deletion.
No delete-all.
No retry after uncertain DELETE.

Tests must prove:

```text
active seed payload contains no Manager_User/GM_User
seed refuses to invent required legacy fields
rollback exact 11 IDs allowed
10/12/unknown IDs rejected
TME1 ID rejected
wrong app rejected
PUT/PATCH blocked
raw response body is not exposed in error message
```

Run full `npm test`. Zero failures before rollback.

Commit code/tests exactly:

```text
fix: remove unauthorized routing approvers and add exact rollback
```

Push BEFORE live rollback.

# STEP 4 — EXECUTE EXACT ROLLBACK ON APP795 ONLY

Authorized writes in this task:

```text
App795 DELETE = exactly failed-batch 11 records only
```

Zero writes to:

```text
App794,796,797,798,800
protected apps 53,283,305,307,310,640,643,715,716
```

No App795 POST/PUT/schema/deploy in this task.

If DELETE result is uncertain/fails:

- STOP
- no retry
- GET-only reconcile exact IDs
- report exact safe state

# STEP 5 — POST-ROLLBACK READBACK

Require exact restored state:

```text
App795 active coverage = 1/12
TME1 -> e1 exact and unchanged
all failed-batch target 11 active counts = 0
TMT3 active count = 0
no duplicate active sections
```

Then M7 returns to CLEAN_BLOCKED state, not PASS.

# STEP 6 — READ-ONLY SCHEMA BLOCKER ANALYSIS

After rollback, GET live+preview App795 field schema and document exact required flags for at least:

```text
Section_Code
Section_Name
Requester_User
Manager_User
GM_User
Active
```

Also classify `Manager_User` and `GM_User` against frozen DEC-019:

```text
CURRENT_REQUIRED_LEGACY_FIELD / DEPRECATION_CANDIDATE / STILL_ACTIVE_BUSINESS_FIELD / UNKNOWN
```

Do not change schema in this task.
Do not guess approvers.

Required output:

```text
APP795_REQUESTER_ONLY_SCHEMA_COMPATIBLE = YES/NO
MANAGER_USER_REQUIRED = true/false
GM_USER_REQUIRED = true/false
LEGACY_FIELD_CLASSIFICATION = exact evidence-backed result
NEXT_REPAIR = either controlled required-flag/schema cleanup OR exact verified approver model; no guessing
```

# STEP 7 — EVIDENCE / DOC TRUTH

Run full tests again.

Update living docs to state Sprint03B failed independent review due unauthorized approver fields and was rolled back exactly.

Do NOT continue claiming M7=12/12 PASS after rollback.

Canonical state:

```text
M6 = PASS / 8/8 PUBLISHED
M7 = CLEAN_BLOCKED / 1/12 after exact rollback
M8 = PASS
M9 = BLOCKED pending clean M7
ACR-002 = APPROVED but Sprint03B execution failed independent review; no active write window after rollback
```

AI_REVIEW_PACKAGE must finally include a current Sprint03B-R1 block with:

```text
SPRINT03B_REVIEW = BLOCKED_DATA_SCOPE_VIOLATION
UNAUTHORIZED_APPROVER_FIELDS_FOUND = Manager_User, GM_User
FAILED_BATCH_RECORD_COUNT = 11
ORIGINAL_PREWRITE_BACKUP_RETAINED = YES + safe path + manifest SHA
ROLLBACK_PREWRITE_BACKUP = safe path + manifest SHA
APP795_DELETE_COUNT = actual exact count
APP795_POST_COUNT_THIS_TASK = 0
APP795_PUT_COUNT_THIS_TASK = 0
APP795_SCHEMA_WRITES_THIS_TASK = 0
POST_ROLLBACK_ACTIVE_COVERAGE = 1/12 expected
TME1_PRESERVED = YES
TMT3_ACTIVE_COUNT = 0
OTHER_SANDBOX_WRITES = 0
PROTECTED_WRITES = 0
APP795_REQUESTER_ONLY_SCHEMA_COMPATIBLE = YES/NO
MANAGER_USER_REQUIRED = true/false
GM_USER_REQUIRED = true/false
NO_ORPHAN_ARTIFACT_GATE = PASS
npm test = actual / PASS
NEXT_ACTION = targeted M7 schema/business blocker resolution
```

Preserve historical Stage3C evidence exception.

Commit docs exactly:

```text
docs: record app795 failed-batch rollback evidence
```

Push; local HEAD = remote HEAD; tracked tree clean; STOP.

# STRICT OUT OF SCOPE

Do NOT:

- run M9
- create new App795 records
- modify TME1
- update the 11 failed records in place
- change App795 schema
- guess Manager_User/GM_User
- populate generic approver slots
- write any other app
- rewrite Git history
- delete retained backups

# REVIEW EXPECTATION

```text
UNAUTHORIZED_APPROVER_DATA_GATE = FAIL_CONFIRMED / ROLLED_BACK
EXACT_FAILED_BATCH_IDENTIFICATION_GATE
EXACT_ROLLBACK_GATE
TME1_PRESERVATION_GATE
POST_ROLLBACK_1_OF_12_GATE
APP795_SCHEMA_BLOCKER_EVIDENCE_GATE
OTHER_SANDBOX_ZERO_WRITE_GATE
PROTECTED_ZERO_WRITE_GATE
NO_ORPHAN_ARTIFACT_GATE
REGRESSION_GATE
DOC_EVIDENCE_CONSISTENCY_GATE
GIT_PUSH_SYNC_GATE
DELIVERY_SPRINT_03B_GATE = BLOCKED_CLEAN or worse
M9_AUTHORIZATION = NO
