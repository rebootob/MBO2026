# AI ACTIVE TASK — M7F FINAL ROUTING MATRIX AUDIT (READ ONLY)

> **Control Plane:** ChatGPT / Independent Reviewer
> **Execution Plane:** Antigravity standalone only
> **Repository:** `rebootob/MBO2026`
> **Branch:** `ai/antigravity-wp002c`
> **Mode:** FINAL ROUTING CONTRACT AUDIT / READ ONLY — KINTONE WRITES = 0

# NORTH STAR

```text
M7A Requester Baseline              = PASS / 12 OF 12
M7C TMG Team Routing Discovery      = PASS / 7 OF 7 CURRENT TEAM FLOWS
M7D Team-Aware App795 Preflight     = PASS FOR PREFLIGHT / NO WRITE AUTHORIZATION
M7E Remaining Non-TMG Identity      = PASS / 7 OF 7 VERIFIED
M7F Final Routing Contract Audit    = EXECUTE NOW / READ ONLY
M7 OVERALL                          = OPEN UNTIL FINAL MATRIX AUDIT PASSES
M9 FINAL ACCEPTANCE                 = BLOCKED_PENDING_FULL_M7
TODAY_DONE                          = NO
```

# PURPOSE

Create and independently verify the FINAL authoritative routing manifest before any App795 schema/data write is authorized.

The previous discovery resolved identities, but final write authorization requires an exact routing contract for every active routing flow, including:

```text
Manager/GM slot placement
ALL/ANY rule
optional levels intentionally blank or populated
routing topology/order
requester source
Team discriminator for TMG1/TMG2
source provenance
```

Do NOT write anything to Kintone in this task.

# EXPECTED CURRENT ROUTING FLOWS

Current business structure:

```text
10 non-TMG section flows
+ 4 TMG1 Team flows
+ 3 TMG2 Team flows
= 17 CURRENT ROUTING FLOWS
```

Non-TMG sections:

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
```

TMG1 Team flows:

```text
TMG1 | Admin
TMG1 | CAD
TMG1 | Marketing
TMG1 | Production
```

TMG2 Team flows:

```text
TMG2 | CAD
TMG2 | Marketing
TMG2 | Production
```

App53 remains authoritative for Team.
Verified Team field:

```text
Drop_down_2
```

# HARD SAFETY RULE — READ ONLY

```text
KINTONE_WRITES = 0
POST = 0
PUT = 0
PATCH = 0
DELETE = 0
DEPLOY = 0
```

Do NOT:

- modify App795 records
- modify App795 schema
- add Team field
- add Routing_Key field
- change Section_Code uniqueness
- seed routing
- modify App53
- modify App139
- modify legacy PMS apps
- change Process Management
- delete fields
- migrate data
- proceed to M9

Before Kintone network access:

```js
delete process.env.KINTONE_API_TOKEN;
```

Use authorized read-only access only.
Never expose credentials, auth headers, tokens, passwords, or unnecessary personal data.

# AUTHORITATIVE SOURCES

Use existing evidence first, then re-read only what is needed to prove missing contract details:

```text
App53
App139
App795 current records/schema
Legacy PMS Apps 283,305,307,310,640,643,715,716
Kintone User Directory
Kintone Groups
Legacy Process Management
repository decisions/docs/evidence
```

Do not rediscover already-proven identity data unless required to validate routing slot/topology/rule.

# REQUIRED FINAL ROUTING CONTRACT

Produce exactly 17 routing rows.

Required fields per row:

```text
Routing_Context
Section_Code
Team
Requester_User
Manager_Level1_Approvers
Manager_Level1_Approval_Rule
Manager_Level2_Approvers
Manager_Level2_Approval_Rule
GM_Level1_Approvers
GM_Level1_Approval_Rule
GM_Level2_Approvers
GM_Level2_Approval_Rule
Topology
Active
Effective_From
Effective_To
Primary_Evidence
Secondary_Evidence
Confidence
Remaining_Question
```

Rules:

- `Team` must be blank for non-TMG rows.
- `Team` must use exact App53 value for TMG rows.
- Approval rule must be exactly `ALL`, `ANY`, `UNKNOWN`, or `NOT_APPLICABLE` where a routing level is intentionally absent and this absence is proven.
- Never infer ALL/ANY.
- Never populate Manager L2 / GM L2 unless evidence proves the level exists.
- Never treat a missing level as intentionally absent without evidence.
- A row is `VERIFIED` only when every required active routing slot, routing order, and rule is proven.

# KNOWN IDENTITY BASELINE TO VERIFY IN FINAL SLOT CONTEXT

Previously resolved non-TMG candidate chains:

```text
TME1  -> suthas      / somrudee
TMF1  -> vassana     / kito
TMF2  -> vassana     / kito
TMF3  -> vassana     / kito
TMH1  -> supparat    / pattama
TMH2  -> papatchaya  / pattama
TMH3  -> chatrawee   / pattama
TMS1  -> previously VERIFIED; use existing authoritative evidence
TMT1  -> pitchayadol / weerakul
TMT2  -> previously VERIFIED; use existing authoritative evidence
```

Previously resolved TMG Team chains:

```text
TMG1 Admin       -> amporn   / uchida
TMG1 CAD         -> phubodin / uchida
TMG1 Marketing   -> natta    / uchida
TMG1 Production  -> prompan  / uchida
TMG2 CAD         -> phubodin / uchida
TMG2 Marketing   -> natta    / uchida
TMG2 Production  -> prompan  / uchida
```

These are NOT permission to write. Validate exact slot meaning and approval rule before finalizing the manifest.

# REQUIRED AUDIT QUESTIONS FOR EVERY FLOW

For every routing row answer explicitly:

```text
1. Is the first person/group Manager L1, Manager L2, or another role?
2. Is the second person/group GM L1, GM L2, or another role?
3. Are Manager L2 and GM L2 intentionally absent, or simply not yet proven?
4. What is the exact routing order/topology?
5. What is the approval rule for every populated multi-user slot: ALL or ANY?
6. Is the requester mapping still authoritative?
7. For TMG, is Team exact value proven from App53?
8. Is there any conflicting 2026/current evidence?
```

If any answer is not proven, classify that flow `AMBIGUOUS` rather than guessing.

# TARGET ROUTING KEY PROPOSAL AUDIT

Do not implement, but prepare exact proposed key values for all 17 rows.

Target behavior:

```text
non-TMG Routing_Key = Section_Code
TMG Routing_Key     = Section_Code + "|" + exact Team
```

Verify:

```text
PROPOSED_ROUTING_KEY_COUNT = 17
PROPOSED_ROUTING_KEY_DUPLICATES = 0
```

Do not normalize or alter App53 Team spelling/case silently.

# APP795 MIGRATION MANIFEST — PLAN ONLY

Prepare the exact target record manifest for later authorized migration.

Required future target count:

```text
TARGET_ACTIVE_ROUTING_ROWS = 17
```

Explain how the current 12 section-level baseline rows would be reconciled:

```text
10 non-TMG existing rows -> reuse/update in place where safe
TMG1 section placeholder -> reconcile into 4 team rows
TMG2 section placeholder -> reconcile into 3 team rows
```

Do NOT execute.

The plan must obey:

```text
NO duplicate active routing rows
NO stale active section-only TMG placeholder rows
NO orphaned requester/routing references
NO dead routing resolver path
```

# AI_REVIEW_PACKAGE / LIVING DOC CONSISTENCY

Reconcile living/current documentation so current state is represented consistently.

Do not rewrite historical changelog evidence.
Historical errors may remain only when clearly historical and superseded by later correction.

Ensure current docs do not still claim:

```text
M7E pending when completed
7 non-TMG sections ambiguous
TMG2 = 4 Teams
M7C = 7/8
M7 overall complete before final audit/write
```

# TEST / NO-ORPHAN

Run:

```bash
npm test
git diff --check
git status --short
```

Required:

```text
NO_ORPHAN_ARTIFACT_GATE = PASS
STALE_ACTIVE_REFERENCES = 0
KINTONE_WRITES_THIS_TASK = 0
```

# FINAL REQUIRED SUMMARY

```text
M7F_FINAL_ROUTING_MATRIX_AUDIT = COMPLETE / PENDING CHATGPT REVIEW

EXPECTED_ROUTING_FLOWS = 17
FINAL_MATRIX_ROWS = actual
VERIFIED = X/17
AMBIGUOUS = X
MISSING = X
NO_KINTONE_ACCOUNT = X

NON_TMG_FLOW_COUNT = 10
TMG1_TEAM_FLOW_COUNT = 4
TMG2_TEAM_FLOW_COUNT = 3

PROPOSED_ROUTING_KEY_COUNT = actual
PROPOSED_ROUTING_KEY_DUPLICATES = actual
TARGET_ACTIVE_ROUTING_ROWS = 17

APP795_SCHEMA_CHANGE_REQUIRED = YES
APP795_TEAM_FIELD_REQUIRED = YES
APP795_ROUTING_KEY_REQUIRED = YES
SECTION_CODE_UNIQUE_MUST_CHANGE = YES

APP795_MODIFIED = NO
APP53_MODIFIED = NO
APP139_MODIFIED = NO
LEGACY_APPS_MODIFIED = NO
SCHEMA_MODIFIED = NO
PROCESS_MANAGEMENT_MODIFIED = NO

KINTONE_WRITES = 0
POST = 0
PUT = 0
PATCH = 0
DELETE = 0
DEPLOY = 0

npm test = actual / PASS
NO_ORPHAN_ARTIFACT_GATE = PASS
STALE_ACTIVE_REFERENCES = 0

M7_WRITE_AUTHORIZATION = NO
M9_FINAL_ACCEPTANCE = BLOCKED_PENDING_FULL_M7

NEXT_ACTION = CHATGPT + USER REVIEW OF FINAL 17-FLOW ROUTING MANIFEST BEFORE ANY APP795 WRITE
```

Do not mark M7 complete unless the final routing matrix is fully proven.
Do not perform any App795 write.
Do not proceed to M9.

Update only required living evidence/docs, commit and push same branch, then STOP.
