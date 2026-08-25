# AI ACTIVE TASK — DELIVERY DAY SPRINT 03B-R2: APP795 LEGACY REQUIRED-FLAG CORRECTION + REQUESTER RESEED

> **Control Plane:** ChatGPT / Independent Reviewer
> **Execution Plane:** Antigravity standalone only
> **Repository:** `rebootob/MBO2026`
> **Branch:** `ai/antigravity-wp002c`
> **Reviewed head:** `f7531b75e3cbc20022711c9ace8e407f56560e3d`
> **Mode:** TARGETED APP795 SCHEMA CORRECTION + EXACT 11 REQUESTER RECORD CREATES

# TODAY NORTH STAR — DO NOT DRIFT

```text
M6 App796 Scoring Baseline = PASS / 8 OF 8 PUBLISHED
M7 App795 Routing Baseline = CLEAN 1/12 AFTER ROLLBACK / FIX LIVE SCHEMA DRIFT + RESEED 11
M8 App800 HR Dashboard     = PASS
M9 End-to-End Smoke        = NEXT IMMEDIATELY AFTER M7 REVIEW

TODAY_DONE = NO
NEXT_CRITICAL_PATH = APP795 SCHEMA EXACT -> 12/12 REQUESTER BASELINE -> CHATGPT REVIEW -> M9
```

# CONTROL-PLANE FINDING

Sprint03B-R1 rollback is accepted as complete:

```text
failed batch deleted = 11
App795 active requester coverage restored = 1/12
TME1 -> e1 preserved
POST/PUT/schema writes in rollback = 0
Manager_User.required live = true
GM_User.required live = true
REQUESTER_ONLY_SCHEMA_COMPATIBLE = NO
```

Canonical source `config/schema-spec.js` defines both legacy fields as deprecated and non-required:

```text
Manager_User = [DEPRECATED] / required=false
GM_User      = [DEPRECATED] / required=false
```

Therefore live App795 has a narrow schema drift that blocks the approved requester-only baseline.

# AUTHORIZED BUSINESS/SCHEMA CHANGE

Only these existing App795 field-property changes are authorized:

```text
Manager_User.required: true -> false
GM_User.required:      true -> false
```

Do NOT change type, code, label, entities, value, or any other field property.
Do NOT add fields.
Do NOT rename fields.
Do NOT modify existing TME1 business data.

This task does NOT authorize deleting `Manager_User` or `GM_User` automatically. They are deprecated, but deletion is allowed only later if historical-data/reference analysis proves safe and is separately reviewed. User No-Orphan rule remains active; record the fields as `DEPRECATION_PENDING_SAFE_DATA_MIGRATION_OR_ZERO_DATA_PROOF`, not as active business fields.

# EXACT REQUESTER BASELINE AFTER SCHEMA CORRECTION

KEEP unchanged:

```text
TME1 -> e1
```

CREATE exactly:

```text
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

Never create TMT3.
Never populate legacy approver fields.
Never guess approvers.

# STEP 0 — GIT / SECURITY

Require:

```text
branch = ai/antigravity-wp002c
f7531b75... is ancestor
local HEAD = origin branch
tracked tree clean
```

No reset/rebase/force push/history rewrite.

Before live network operations:

```js
delete process.env.KINTONE_API_TOKEN;
```

Use username/password authentication only.
Do not print credentials/auth headers/raw user payloads/Kintone error response bodies.

Protected apps permanently READ ONLY:

```text
53,283,305,307,310,640,643,715,716
```

Zero writes also to:

```text
794,796,797,798,800
```

# STEP 1 — READ-ONLY PREFLIGHT / EXACT DRIFT CLASSIFICATION

GET App795 live + preview:

```text
settings
fields
ACL
all records needed for exact business-state verification
```

Require before any write:

```text
exact App795 identity
active records = exactly 1
TME1 -> e1 exact
no active TMT3
no active duplicate Section_Code
Manager_User live.required = true
GM_User live.required = true
canonical source required=false for both
all other intended App795 canonical fields have no unrelated critical drift
```

If unrelated schema drift would make the two-field repair unsafe, STOP with zero writes.

Read all existing App795 records and safely classify whether deprecated fields contain data:

```text
Manager_User populated record count = actual
GM_User populated record count = actual
```

Do not print user codes/names from these fields in evidence; only counts.
Do NOT clear values.
Do NOT delete fields.

Reverify the 9 approved requester accounts read-only. Require 9/9 valid.

# STEP 2 — DURABLE PREWRITE BACKUP

Create NEW retained backup before schema write:

```text
backups/delivery-sprint-03b-r2/app795/<UTC_TIMESTAMP>/
```

Capture:

```text
live + preview settings
live + preview fields
live + preview ACL
all App795 records
record count
active count
```

Create SHA256 manifest and retain until independent review.
Do not overwrite/delete prior Sprint03B/R1 backups.
Do not commit raw backup.

# STEP 3 — IMPLEMENT TARGETED SCHEMA CORRECTION PATH

Prefer reusing an existing App795 schema deployment utility if it can enforce exact two-property repair safely.
If no suitable reusable path exists, add the minimum code to the existing routing seeder/deployment script architecture; do not create multiple overlapping scripts.

Exact mutation payload must change ONLY:

```text
Manager_User.required=false
GM_User.required=false
```

Required safety:

```text
App target = 795 only
PUT preview form fields = max 1 request
POST deploy = max 1 request
bounded deployment polling
no blind retry after uncertain write
GET reconciliation after uncertainty
```

Before mutation compare exact pre-state and expected post-state.
After deploy GET live+preview and require both required=false.

No record POST until schema read-back passes.

# STEP 4 — HARDEN REQUESTER SEEDER

Use the existing canonical:

```text
scripts/kintone/seed-routing-baseline.js
```

Do not create another seeder.

Remove any obsolete rollback-only executable path that is no longer required for active operation IF it can be safely removed without weakening current recovery evidence. Historical rollback evidence remains in Git history/docs/backups. At minimum no hardcoded approver values may exist anywhere in active routing seed runtime/tests.

Requester record payload must contain only canonical requester baseline fields required for creation:

```text
Section_Code
Section_Name
Requester_User
Active
```

`Manager_User`, `GM_User`, `First_Manager_User` MUST NOT be included.
Generic approver-slot fields MUST NOT be populated in this requester-only seed.

Seeder preflight must fail closed unless:

```text
active coverage = 1/12
TME1 -> e1 exact
target 11 all absent
TMT3 absent
Manager_User.required = false live
GM_User.required = false live
requester accounts = 9/9 valid
```

No idempotent skip/recovery semantics. If active record count != 1, STOP before POST.

# STEP 5 — TEST BEFORE LIVE WRITE

Extend existing tests only; avoid unnecessary new files.

Minimum coverage:

```text
schema correction manifest contains exactly two field required changes
wrong app blocked
unrelated field mutation blocked
requester payload contains no Manager_User / GM_User / First_Manager_User
requester payload contains no generic approver slots
exact 11 manifest
TME1 excluded
TMT3 excluded
unknown requester/section rejected
active count !=1 blocks before POST
required=true blocks seed before POST
required=false permits controlled seed path
POST body.app = 795 only
PUT/DELETE/PATCH record operations blocked
max record creates = 11
no hardcoded suthas/somrudee in routing seeder/runtime/tests
```

Run full `npm test`; zero failures.

Commit code/tests/schema correction tooling before live mutation:

```text
fix: align app795 legacy required flags and requester seed
```

Push before live write.

# STEP 6 — LIVE SCHEMA CORRECTION APP795 ONLY

Execute once after retained backup + tests.

Authorized writes:

```text
App795 preview fields PUT = max 1
App795 deploy POST = max 1
```

Expected exact result:

```text
Manager_User.required=false
GM_User.required=false
all other field definitions unchanged
TME1 record unchanged
```

If uncertain/fails: STOP; no record seed; GET reconcile; no blind retry.

# STEP 7 — LIVE REQUESTER RESEED APP795 ONLY

Only after exact schema read-back PASS.

Run canonical seed script once.

Expected record write budget:

```text
App795 record POST = exactly 11
App795 record PUT = 0
App795 record DELETE = 0
```

If any POST uncertain/fails:

```text
STOP
NO retry
NO automatic delete
GET exact reconciliation
report created vs missing sections
retain backup
M7 = BLOCKED_PARTIAL
```

# STEP 8 — FINAL READBACK

Require field-level verification, not count only:

```text
active count = 12
unique active Section_Code = 12
TME1 -> e1 unchanged
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
TMT3 active count = 0
duplicate active sections = 0
new 11 records Manager_User empty
new 11 records GM_User empty
new 11 records First_Manager_User empty
Manager_User.required live+preview = false
GM_User.required live+preview = false
```

Do not expose user identities beyond already-approved requester codes in evidence.

# STEP 9 — NO-ORPHAN / LEGACY FIELD CLASSIFICATION

Mandatory output:

```text
NO_ORPHAN_ARTIFACT_GATE = PASS / BLOCKED
STALE_ACTIVE_REFERENCES = 0 required for code/runtime artifacts
Manager_User deprecated populated count = actual
GM_User deprecated populated count = actual
LEGACY_FIELD_REMOVAL_STATUS =
  SAFE_ZERO_DATA_CANDIDATE_FOR_LATER_REMOVAL
  or BLOCKED_BY_HISTORICAL_DATA_MIGRATION_REQUIRED
```

Do NOT delete legacy fields in this task.
Do not create duplicate scripts/temp manifests/walkthrough files/discovery exports.

# STEP 10 — EVIDENCE / DOCS

Run full `npm test` after live writes.

Update current living docs:

```text
M6 = PASS 8/8
M7 = PASS 12/12 only if all gates pass
M8 = PASS
M9 = NEXT
ACR-002 = APPROVED / EXECUTED / requester baseline write window CLOSED
```

Record exact:

```text
SPRINT03B_R2 = COMPLETE / PENDING CHATGPT REVIEW
prewrite backup path + SHA256 manifest
App795 schema PUT count
App795 deploy POST count
App795 record POST count
App795 record PUT count = 0
App795 record DELETE count = 0
other sandbox writes = 0
protected writes = 0
pre active coverage = 1/12
post active coverage = 12/12
Manager_User required before/after = true/false
GM_User required before/after = true/false
unauthorized approver values introduced = 0
TMT3 active count = 0
duplicate active count = 0
NO_ORPHAN_ARTIFACT_GATE
legacy populated counts / removal classification
npm test = actual / PASS
NEXT_ACTION = M9 END-TO-END SMOKE TEST
```

Preserve Stage3C historical evidence exception unchanged.

Expected commits after this Control Plane task:

```text
1. fix: align app795 legacy required flags and requester seed
2. docs: record app795 corrected requester baseline evidence
```

Push; local HEAD = remote HEAD; tracked tree clean; STOP.

# STRICT OUT OF SCOPE

Do NOT:

- write any app other than 795
- change App795 business values in TME1
- populate approver fields
- delete legacy fields
- change routing architecture
- implement twin-status engine
- run M9 in this same task
- create fake/canary Kintone records
- alter scoring ratios

# REVIEW EXPECTATION

```text
APP795_SCHEMA_DRIFT_PREFLIGHT_GATE
APP795_PREWRITE_BACKUP_GATE
APP795_EXACT_TWO_FIELD_REPAIR_GATE
APP795_SCHEMA_READBACK_GATE
APP795_REQUESTER_ONLY_PAYLOAD_GATE
APP795_11_CREATE_GATE
APP795_12_OF_12_READBACK_GATE
APP795_TME1_PRESERVATION_GATE
APP795_TMT3_EXCLUSION_GATE
APP795_DUPLICATE_ACTIVE_GATE
UNAUTHORIZED_APPROVER_ZERO_GATE
OTHER_SANDBOX_ZERO_WRITE_GATE
PROTECTED_ZERO_WRITE_GATE
NO_ORPHAN_ARTIFACT_GATE
LEGACY_FIELD_CLASSIFICATION_GATE
REGRESSION_GATE
DOC_EVIDENCE_CONSISTENCY_GATE
GIT_PUSH_SYNC_GATE
DELIVERY_SPRINT_03B_GATE
```
