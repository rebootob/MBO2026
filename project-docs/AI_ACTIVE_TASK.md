# AI ACTIVE TASK — M7G ROUTING COUNT CONSISTENCY + PRE-WRITE READINESS CHECK

> **Control Plane:** ChatGPT / Independent Reviewer
> **Execution Plane:** Antigravity standalone only
> **Repository:** `rebootob/MBO2026`
> **Branch:** `ai/antigravity-wp002c`
> **Reviewed head:** `57fbb1e0fedc128c85f0a9635f1a4283314bc3b8`
> **Mode:** DOCUMENTATION / SOURCE-OF-TRUTH CONSISTENCY ONLY — KINTONE WRITES = 0

# NORTH STAR

```text
M7A Requester Baseline              = PASS
M7C TMG Team Routing                = PASS / 7 OF 7
M7D Team-Aware App795 Preflight     = PASS
M7E Non-TMG Routing                 = PASS / 7 OF 7
M7F Final Routing Matrix Audit      = PASS / 17 OF 17
M7G Count Consistency               = EXECUTE NOW

TARGET_ACTIVE_ROUTING_ROWS          = 17
M7 OVERALL                          = NOT YET WRITE-AUTHORIZED
M9 FINAL ACCEPTANCE                 = BLOCKED
TODAY_DONE                          = NO
```

# CONTROL-PLANE REVIEW FINDING

M7F proved the authoritative current routing total is:

```text
10 non-TMG flows
+ 4 TMG1 Team flows
+ 3 TMG2 Team flows
= 17 active routing flows
```

However, older active/current M7D planning text may still contain an incorrect migration count of `15` even though the same expression `10 + 4 + 3` equals `17`.

This must be corrected before any App795 write authorization.

# AUTHORITATIVE COUNT — FREEZE NOW

Use this as current source of truth:

```text
NON_TMG_FLOW_COUNT                  = 10
TMG1_TEAM_FLOW_COUNT                = 4
TMG2_TEAM_FLOW_COUNT                = 3
EXPECTED_ROUTING_FLOWS              = 17
FINAL_MATRIX_ROWS                   = 17
TARGET_ACTIVE_ROUTING_ROWS          = 17
MIGRATION_TARGET_ROWS               = 17
PROPOSED_ROUTING_KEY_COUNT          = 17
```

Any active/current statement claiming `15` target/migration rows is incorrect and must be reconciled.

Historical changelog entries may remain only when clearly historical and superseded by the current authoritative correction.

# HARD SAFETY RULE — NO KINTONE WRITES

```text
KINTONE_WRITES = 0
POST = 0
PUT = 0
PATCH = 0
DELETE = 0
DEPLOY = 0
```

Do NOT:

- modify App795 schema
- modify App795 records
- add Team field
- add Routing_Key field
- change Section_Code uniqueness
- seed routing data
- modify App53
- modify App139
- modify protected legacy apps
- change Process Management
- delete Kintone fields
- perform migration
- proceed to M9

This task is repository/document consistency + readiness verification only.

# STEP 1 — FIND ALL ACTIVE/CURRENT COUNT REFERENCES

Search the repository for active/current statements related to:

```text
15-record migration
15 records
15 routing rows
TARGET_ACTIVE_ROUTING_ROWS
MIGRATION_TARGET_ROWS
EXPECTED_ROUTING_FLOWS
FINAL_MATRIX_ROWS
PROPOSED_ROUTING_KEY_COUNT
10 non-TMG + 4 TMG1 + 3 TMG2
```

Inspect at minimum:

```text
project-docs/AI_ACTIVE_TASK.md
project-docs/CURRENT_STATE.md
project-docs/HANDOFF.md
project-docs/AI_REVIEW_PACKAGE.md
project-docs/CHANGELOG_AI.md
config/schema-spec.js
routing seed/migration/resolver code
routing tests
any current migration manifest or delivery-plan docs
```

Do not mechanically replace historical forensic text.
Classify each occurrence as:

```text
ACTIVE_CURRENT
HISTORICAL_SUPERSEDED
UNRELATED
```

# STEP 2 — RECONCILE ACTIVE SOURCE OF TRUTH

Every ACTIVE_CURRENT routing/migration plan must use:

```text
17 active target rows
```

Required arithmetic:

```text
10 + 4 + 3 = 17
```

Correct any active/current `15` routing/migration target references.

Do not alter valid unrelated uses of the number 15.

Historical entries that describe the old mistake may remain if they are clearly historical and followed by/superseded by the authoritative M7G correction.

# STEP 3 — VERIFY FINAL 17 ROUTING CONTEXTS EXIST IN THE MANIFEST

Without re-running broad discovery unless needed, verify the current final manifest accounts for exactly these 17 contexts:

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

Required:

```text
FINAL_CONTEXT_COUNT = 17
DUPLICATE_CONTEXTS = 0
MISSING_CONTEXTS = 0
```

Do not change routing identities/approvers in this task unless an obvious documentation typo is proven. If any business-routing conflict is discovered, STOP and report it.

# STEP 4 — PRE-WRITE READINESS CHECK

Confirm the future App795 controlled-write plan is internally consistent with 17 rows.

Target schema remains:

```text
Routing_Key   = unique
Section_Code  = non-unique
Team          = exact App53 Team value for TMG rows; blank for non-TMG rows
```

Target key behavior:

```text
non-TMG: Routing_Key = Section_Code
TMG:     Routing_Key = Section_Code + "|" + exact Team
```

Required:

```text
PROPOSED_ROUTING_KEY_COUNT = 17
PROPOSED_ROUTING_KEY_DUPLICATES = 0
```

Verify the future migration logic accounts for:

```text
10 existing non-TMG rows -> reuse/update safely
1 current TMG1 section placeholder -> reconcile to 4 Team rows
1 current TMG2 section placeholder -> reconcile to 3 Team rows
final active total -> 17
stale active section-only TMG placeholders -> 0
```

Do NOT execute any of this migration.

# STEP 5 — NO-ORPHAN CHECK

Search for active code/docs that still assume:

```text
Section_Code is globally unique routing identity
TMG routing is section-only
TMG2 has 4 Teams
M7C = 7/8
routing target = 15 rows
```

Required:

```text
STALE_ACTIVE_ROUTING_COUNT_REFERENCES = 0
STALE_ACTIVE_TMG2_4_TEAM_REFERENCES = 0
STALE_ACTIVE_SECTION_ONLY_TMG_ASSUMPTIONS = 0
NO_ORPHAN_ARTIFACT_GATE = PASS
```

Do not delete historical evidence merely because it contains old information.

# STEP 6 — TEST / GIT SAFETY

Run:

```bash
npm test
git diff --check
git status --short
```

Required:

```text
npm test = PASS
tracked working tree = clean after commit
local HEAD = origin/ai/antigravity-wp002c after push
```

No reset/rebase/force push/history rewrite.

# FINAL REQUIRED SUMMARY

Update living/current docs with the corrected authoritative count and readiness status.

Required final block:

```text
M7G_ROUTING_COUNT_CONSISTENCY = COMPLETE / PENDING CHATGPT REVIEW

NON_TMG_FLOW_COUNT = 10
TMG1_TEAM_FLOW_COUNT = 4
TMG2_TEAM_FLOW_COUNT = 3
EXPECTED_ROUTING_FLOWS = 17
FINAL_MATRIX_ROWS = 17
TARGET_ACTIVE_ROUTING_ROWS = 17
MIGRATION_TARGET_ROWS = 17

FINAL_CONTEXT_COUNT = 17
DUPLICATE_CONTEXTS = 0
MISSING_CONTEXTS = 0

PROPOSED_ROUTING_KEY_COUNT = 17
PROPOSED_ROUTING_KEY_DUPLICATES = 0

STALE_ACTIVE_ROUTING_COUNT_REFERENCES = 0
STALE_ACTIVE_TMG2_4_TEAM_REFERENCES = 0
STALE_ACTIVE_SECTION_ONLY_TMG_ASSUMPTIONS = 0

APP795_MODIFIED = NO
APP53_MODIFIED = NO
SCHEMA_MODIFIED = NO
KINTONE_WRITES = 0
POST = 0
PUT = 0
PATCH = 0
DELETE = 0
DEPLOY = 0

npm test = actual / PASS
NO_ORPHAN_ARTIFACT_GATE = PASS

M7_WRITE_AUTHORIZATION = NO
M9_FINAL_ACCEPTANCE = BLOCKED_PENDING_CONTROLLED_M7_WRITE
NEXT_ACTION = CHATGPT CONTROL PLANE REVIEW; IF PASS, REQUEST EXPLICIT USER APPROVAL FOR CONTROLLED APP795 WRITE WINDOW
```

Do not perform any Kintone write.
Do not mark M9 complete.
Do not start App795 schema/data migration.

Commit/push same branch and STOP.
