# AI ACTIVE TASK — M7H CONTROLLED APP795 TEAM-AWARE ROUTING WRITE

> **Control Plane:** ChatGPT / Independent Reviewer
> **Execution Plane:** Antigravity standalone only
> **Repository:** `rebootob/MBO2026`
> **Branch:** `ai/antigravity-wp002c`
> **User Authorization:** **EXPLICITLY APPROVED — `อนุมัติ M7 App795 write`**
> **Authorized Target:** **App795 ONLY**
> **Mode:** CONTROLLED SCHEMA + ROUTING DATA WRITE WITH DURABLE BACKUP / EXACT READ-BACK

# NORTH STAR

```text
M7A Requester Baseline              = PASS
M7C TMG Team Routing                = PASS / 7 OF 7
M7D Team-Aware App795 Preflight     = PASS
M7E Non-TMG Routing                 = PASS / 7 OF 7
M7F Final Routing Matrix Audit      = PASS / 17 OF 17
M7G Count Consistency               = PASS

EXPECTED_ROUTING_FLOWS              = 17
TARGET_ACTIVE_ROUTING_ROWS          = 17
M7H CONTROLLED APP795 WRITE         = AUTHORIZED / EXECUTE NOW
M7 OVERALL                          = OPEN UNTIL WRITE + READ-BACK PASS
M9 FINAL ACCEPTANCE                 = BLOCKED UNTIL M7H REVIEW
TODAY_DONE                          = NO
```

# EXPLICIT AUTHORIZATION BOUNDARY

The user has explicitly authorized:

```text
M7 App795 write
```

This authorization permits ONLY the controlled changes required to make App795 support the already-reviewed 17-flow routing model.

Authorized Kintone target:

```text
APP795 ONLY
```

App53 remains authoritative READ-ONLY employee/team source.

Protected / unauthorized for writes in this task:

```text
App53
App139
App283
App305
App307
App310
App640
App643
App715
App716
App794
App796
App797
App798
App800
```

Do NOT modify Process Management in any app unless this active task explicitly says so. It does not.

# AUTHORITATIVE ROUTING MODEL

Final current routing total is frozen as:

```text
10 non-TMG flows
+ 4 TMG1 Team flows
+ 3 TMG2 Team flows
= 17 active routing flows
```

Final routing contexts:

```text
TME1
TMF1
TMF2
TMF3
TMH1
TMH2
TMH3
TMS1
TMT1
TMT2

TMG1|Admin
TMG1|CAD
TMG1|Marketing
TMG1|Production

TMG2|CAD
TMG2|Marketing
TMG2|Production
```

Use the exact verified M7F/M7G 17-flow manifest for requester, Manager L1, Manager L1 rule, GM L1, GM L1 rule, optional levels, topology, Active/effective values, and exact Kintone user codes.

Do NOT rediscover or reinterpret business routing during the write task.
If the live pre-write state conflicts with the frozen manifest in a way that could change business meaning, STOP BEFORE WRITE and report BLOCKED.

# TEAM SOURCE CONTRACT

App53 remains the source of truth for Team.

Verified field:

```text
App53 Team field code = Drop_down_2
Label = Team
```

Routing contract:

```text
Employee Code
 -> App53
 -> Section
 -> Team (Drop_down_2)
 -> if Section in [TMG1, TMG2]: resolve App795 by Section + Team
 -> otherwise: resolve App795 by Section only
```

App53 MUST NOT be modified.

# TARGET APP795 SCHEMA

Implement the minimum reviewed team-aware schema:

```text
Routing_Key
  type = SINGLE_LINE_TEXT
  required = true
  unique = true

Section_Code
  type = existing SINGLE_LINE_TEXT
  required = true
  unique = false

Team
  type = SINGLE_LINE_TEXT
  stores exact App53 Team value for TMG rows
  blank for non-TMG rows
```

Routing key rule:

```text
non-TMG: Routing_Key = Section_Code
TMG:     Routing_Key = Section_Code + "|" + exact Team
```

Do NOT silently trim, rename, translate, case-normalize, alias, or remap Team values.

Required exact TMG Team values:

```text
TMG1: Admin, CAD, Marketing, Production
TMG2: CAD, Marketing, Production
```

# MANDATORY NO-ORPHAN RULE

```text
NO_ORPHAN_ARTIFACT_GATE = MANDATORY
DEPRECATED_FIELD_RETENTION = PROHIBITED unless explicitly required for historical compatibility and documented
DEAD_FILE_RETENTION = PROHIBITED
DUPLICATE_IMPLEMENTATION_RETENTION = PROHIBITED
UNUSED_CONFIG_KEY_RETENTION = PROHIBITED
```

For this migration:

```text
NO duplicate routing identity paths
NO stale active section-only TMG rows
NO stale Section_Code-global-unique assumption in active implementation
NO duplicate schema definitions
NO _old / _v1 copies
NO temporary migration scripts committed unless they are intentionally reusable governed tooling
```

IMPORTANT:
Existing deprecated App795 fields such as:

```text
First_Manager_User
Manager_User
GM_User
```

must NOT be deleted merely for cleanup in this task unless historical data + all active references are independently proven safe to remove.
If deletion risks historical/business data, retain and document as historical compatibility debt; do not broaden authorization.

# STEP 0 — GIT + AUTHORIZATION SAFETY

Require before any Kintone write:

```text
branch = ai/antigravity-wp002c
local HEAD = origin/ai/antigravity-wp002c
tracked tree clean
17b0beaf7db2029308dd668191637c8a478668a8 is ancestor
```

No reset.
No rebase.
No force push.
No history rewrite.

Load current governance and exact final routing manifest from repository evidence.

Do not use broad write credentials beyond the authorized App795 operation.
Never print credentials, passwords, tokens, cookies, or auth headers.

# STEP 1 — FRESH PRE-WRITE READ-BACK

Before mutation, GET and record sanitized current App795 state:

```text
live form schema
preview form schema if applicable
current 12 routing records
current Section_Code uniqueness
Team field existence
Routing_Key field existence
current requester values
current approver fields
legacy/deprecated routing field values
ACL / access configuration as needed for rollback confidence
```

Expected pre-write baseline from prior preflight:

```text
Section_Code.unique = true
Team = absent
Routing_Key = absent
current section-level baseline rows = 12
```

If material live drift exists from this baseline, STOP before write unless the drift is demonstrably harmless and fully reconciled.

# STEP 2 — DURABLE PREWRITE BACKUP (HARD GATE)

Before the FIRST mutation, create a durable local backup under a governed backup path, NOT scratch/temp.

Backup at minimum:

```text
App795 live form schema
App795 preview form schema if available
all App795 records
App795 ACL/access config if relevant
current app metadata/revision
sanitized migration manifest
```

Required backup evidence:

```text
BACKUP_PATH = exact durable path
BACKUP_CREATED_BEFORE_FIRST_WRITE = YES
BACKUP_FILE_COUNT = actual
BACKUP_MANIFEST_SHA256 = exact
BACKUP_RETENTION_UNTIL_INDEPENDENT_REVIEW = YES
```

Verify backup files exist and hashes can be recomputed BEFORE continuing.

If durable backup cannot be proven:

```text
STOP
M7H_GATE = BLOCKED_BACKUP
KINTONE_WRITES = 0
```

Do not repeat the prior Stage3C evidence-loss mistake.

# STEP 3 — PREPARE REPOSITORY SOURCE-OF-TRUTH CHANGES

Before deploying schema, update the existing canonical implementation/specification files required for team-aware App795 routing.

Prefer modifying existing files/functions over creating new files.

At minimum reconcile active assumptions around:

```text
App795 schema-spec
Section_Code uniqueness
Team field
Routing_Key field
routing key construction
routing lookup/resolver contract
routing seed/migration manifest
App800 routing health logic if it directly assumes one row per Section
related tests
current docs
```

Do NOT create a second competing routing resolver.
Do NOT wire unrelated runtime features.
Do NOT modify other Kintone apps.

If App800 source code requires repository-only adjustment to correctly count routing coverage after App795 becomes 17 rows, repository code may be updated, but DO NOT deploy/write App800 in this task.

# STEP 4 — APP795 SCHEMA CHANGE

Perform only the minimum App795 schema mutation required:

```text
1. add Routing_Key
2. add Team
3. change Section_Code unique=true -> false
4. deploy App795 schema
```

No unrelated field edits.
No label cleanup.
No Process Management change.
No ACL broadening.

Immediately after deploy, perform exact read-back.

Required schema read-back:

```text
Routing_Key exists = YES
Routing_Key.type = SINGLE_LINE_TEXT
Routing_Key.required = true
Routing_Key.unique = true
Team exists = YES
Team.type = SINGLE_LINE_TEXT
Section_Code.required = true
Section_Code.unique = false
unrelated field drift = 0
```

If schema read-back fails, STOP record migration and execute rollback plan if safe.

# STEP 5 — CONTROLLED 12 -> 17 ROUTING MIGRATION

Use the frozen M7F/M7G 17-flow manifest ONLY.

Target behavior:

```text
10 non-TMG current records:
  reuse/update in place where safe
  Team = blank
  Routing_Key = Section_Code

TMG1 current section placeholder:
  reconcile safely into 4 active Team rows

TMG2 current section placeholder:
  reconcile safely into 3 active Team rows
```

Prefer minimum-change reuse of existing TMG placeholder rows for one valid Team row each if doing so preserves requester/history safely; create only the additional rows required to reach the exact 17 contexts.

Do not leave the original Section-only TMG placeholders active.
Do not create duplicate requester/routing records.

For every final row populate only values supported by the verified final manifest.

Required target count:

```text
TARGET_ACTIVE_ROUTING_ROWS = 17
```

# STEP 6 — EXACT POST-WRITE RECORD READ-BACK

After migration, GET all App795 routing records and independently verify:

```text
ACTIVE_ROUTING_ROWS = 17
FINAL_CONTEXT_COUNT = 17
MISSING_CONTEXTS = 0
DUPLICATE_CONTEXTS = 0
PROPOSED/ACTUAL_ROUTING_KEY_COUNT = 17
ROUTING_KEY_DUPLICATES = 0
STALE_ACTIVE_SECTION_ONLY_TMG_ROWS = 0
```

Verify exact contexts:

```text
TME1
TMF1
TMF2
TMF3
TMH1
TMH2
TMH3
TMS1
TMT1
TMT2
TMG1|Admin
TMG1|CAD
TMG1|Marketing
TMG1|Production
TMG2|CAD
TMG2|Marketing
TMG2|Production
```

For all 17 rows verify against frozen manifest:

```text
Requester_User
Manager_Level1_Approvers
Manager_Level1_Approval_Rule
Manager_Level2_Approvers / intentional blank
Manager_Level2_Approval_Rule
GM_Level1_Approvers
GM_Level1_Approval_Rule
GM_Level2_Approvers / intentional blank
GM_Level2_Approval_Rule
Topology implied by slots
Active
Effective_From / Effective_To if defined
Team exactness
Routing_Key exactness
```

Required:

```text
ROUTING_MANIFEST_EXACT_MATCH = 17/17
APPROVER_ACCOUNT_LOOKUP_FAILURES = 0
```

Never repair unexpected mismatches by guessing. If any row does not match the approved manifest, STOP and report exact mismatch.

# STEP 7 — RESOLVER / FAIL-CLOSED CONTRACT TESTS

Tests must cover at minimum:

```text
TMG1 Admin resolves by Section+Team
TMG1 CAD resolves by Section+Team
TMG1 Marketing resolves by Section+Team
TMG1 Production resolves by Section+Team
TMG2 CAD resolves by Section+Team
TMG2 Marketing resolves by Section+Team
TMG2 Production resolves by Section+Team
non-TMG resolves by Section only
TMG blank Team fails closed
TMG unknown Team fails closed
duplicate Section+Team fails closed
multiple active non-TMG rows fail closed
Routing_Key uniqueness enforced
App53 remains read-only
```

Do not invent a live runtime wiring milestone if the resolver is not yet wired. Test the implemented contract appropriate to the current architecture and report runtime wiring status truthfully.

# STEP 8 — NO-ORPHAN VERIFICATION

Search active repo implementation for stale assumptions:

```text
Section_Code globally unique routing identity
TMG section-only resolver
15 routing rows
TMG2 = 4 Teams
M7C = 7/8
stale active TMG placeholders
obsolete duplicate routing implementation
```

Required:

```text
STALE_ACTIVE_ROUTING_COUNT_REFERENCES = 0
STALE_ACTIVE_TMG2_4_TEAM_REFERENCES = 0
STALE_ACTIVE_SECTION_ONLY_TMG_ASSUMPTIONS = 0
STALE_ACTIVE_SECTION_CODE_UNIQUE_ASSUMPTIONS = 0
STALE_ACTIVE_TMG_PLACEHOLDER_ROWS = 0
NO_ORPHAN_ARTIFACT_GATE = PASS
```

# STEP 9 — TEST / GIT / FINAL SAFETY

Run:

```bash
npm test
git diff --check
git status --short
```

Require:

```text
npm test = PASS
git diff --check = PASS
tracked working tree clean after commit
local HEAD = origin/ai/antigravity-wp002c after push
```

Commit only intentional implementation/evidence/docs changes.
Push same branch.

# ROLLBACK PLAN

Rollback must be executable from the durable pre-write backup.

If schema changes succeed but data migration fails or exact read-back cannot be established:

```text
STOP further writes
preserve evidence
assess whether safe forward-fix or rollback is lower risk
restore App795 records/schema only from exact durable pre-write backup when rollback is required
read-back restored state
verify original 12-row baseline and original schema
```

Do not perform an improvised destructive rollback.
Do not delete records without exact backup provenance.

# HARD STOP CONDITIONS

STOP immediately if any of these occur:

```text
backup not durable/verifiable
live pre-write drift changes business meaning
schema read-back mismatch
Routing_Key duplicates > 0
final active rows != 17
missing routing context > 0
manifest exact match < 17/17
unexpected requester/approver conflict
write attempted against non-App795 Kintone app
No-Orphan gate blocked
npm test fails
```

Do not proceed to M9 in this task even if M7H succeeds.
M9 requires separate ChatGPT review/authorization after evidence is pushed.

# FINAL REQUIRED SUMMARY

Update living docs and AI_REVIEW_PACKAGE with sanitized evidence.

Required final block:

```text
M7H_CONTROLLED_APP795_WRITE = COMPLETE / PENDING CHATGPT REVIEW / BLOCKED

USER_AUTHORIZATION = EXPLICIT / APPROVED
AUTHORIZED_WRITE_APP = 795 ONLY

BACKUP_CREATED_BEFORE_FIRST_WRITE = YES / NO
BACKUP_PATH = exact
BACKUP_FILE_COUNT = actual
BACKUP_MANIFEST_SHA256 = exact
BACKUP_RETENTION_UNTIL_INDEPENDENT_REVIEW = YES / NO

SCHEMA_CHANGE_ATTEMPTED = YES / NO
ROUTING_KEY_FIELD = exact status
TEAM_FIELD = exact status
SECTION_CODE_UNIQUE = actual
SCHEMA_READBACK = PASS / FAIL
UNRELATED_SCHEMA_DRIFT = actual

EXPECTED_ROUTING_FLOWS = 17
ACTIVE_ROUTING_ROWS = actual
FINAL_CONTEXT_COUNT = actual
MISSING_CONTEXTS = actual
DUPLICATE_CONTEXTS = actual
ROUTING_KEY_COUNT = actual
ROUTING_KEY_DUPLICATES = actual
STALE_ACTIVE_SECTION_ONLY_TMG_ROWS = actual
ROUTING_MANIFEST_EXACT_MATCH = X/17
APPROVER_ACCOUNT_LOOKUP_FAILURES = actual

APP795_RECORD_WRITES = actual
APP795_SCHEMA_WRITES = actual
APP795_DEPLOY_CALLS = actual
NON_APP795_KINTONE_WRITES = 0 required
APP53_MODIFIED = NO
APP139_MODIFIED = NO
PROTECTED_LEGACY_APPS_MODIFIED = NO
APP794_796_797_798_800_MODIFIED = NO
PROCESS_MANAGEMENT_MODIFIED = NO

STALE_ACTIVE_ROUTING_COUNT_REFERENCES = 0
STALE_ACTIVE_TMG2_4_TEAM_REFERENCES = 0
STALE_ACTIVE_SECTION_ONLY_TMG_ASSUMPTIONS = 0
STALE_ACTIVE_SECTION_CODE_UNIQUE_ASSUMPTIONS = 0
NO_ORPHAN_ARTIFACT_GATE = PASS / BLOCKED

npm test = actual / PASS
GIT_DIFF_CHECK = PASS / FAIL
GIT_PUSH_SYNC = PASS / FAIL

M7H_GATE = PASS_PENDING_CHATGPT_REVIEW / BLOCKED
M7_OVERALL = PENDING_CHATGPT_REVIEW
M9_FINAL_ACCEPTANCE = BLOCKED_PENDING_M7H_REVIEW
NEXT_ACTION = CHATGPT REVIEW ONLY
```

After commit + push, STOP.
Do not start M9.
