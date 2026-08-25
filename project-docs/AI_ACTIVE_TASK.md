# AI ACTIVE TASK — M7B FULL ROUTING FLOW DISCOVERY FOR 12 ACTIVE SECTIONS

> **Control Plane:** ChatGPT / Independent Reviewer
> **Execution Plane:** Antigravity standalone only
> **Repository:** `rebootob/MBO2026`
> **Branch:** `ai/antigravity-wp002c`
> **Reviewed head:** `021cf272b4c84851fe49713cc0b28c2096d1cbda`
> **Mode:** READ-ONLY DISCOVERY / EVIDENCE ONLY — KINTONE WRITES = 0

# NORTH STAR — CORRECTED AFTER USER REVIEW

```text
M6 App796 Scoring Baseline         = PASS / 8 OF 8 PUBLISHED
M7A App795 Requester Baseline      = PASS / 12 OF 12
M7B App795 Full Routing Flow       = NOT YET PROVEN / REQUIRED
M8 App800 Dashboard MVP            = PASS
M9 End-to-End Smoke                = PREMATURE / NOT ACCEPTED AS FINAL UNTIL M7B IS COMPLETE

TODAY_DONE = NO
NEXT_CRITICAL_PATH = DISCOVER 12 FULL ROUTING FLOWS -> USER/CONTROL-PLANE APPROVAL -> WRITE M7B -> RE-RUN M9
```

# CONTROL-PLANE REVIEW CORRECTION

The user correctly identified that M7 must mean the full routing definition for all 12 active Section_Code values, not requester mapping alone.

Therefore prior statements such as:

```text
M7 = PASS / 12/12 ACTIVE REQUESTER BASELINE
ALL M1-M9 COMPLETE
TODAY_DELIVERY_TARGET = PASS
```

are NOT sufficient to close full routing delivery.

Treat current M7 state as:

```text
M7A_REQUESTER_BASELINE = PASS / 12 OF 12
M7B_FULL_APPROVER_ROUTING = NOT PROVEN
M7_OVERALL = PARTIAL / OPEN
M9_FINAL_ACCEPTANCE = BLOCKED BY M7B
```

Do NOT delete or rewrite historical evidence; correct current/living state only.

# FULL ROUTING CONTRACT TO DISCOVER

For each active Section_Code:

```text
TME1
TMF1
TMF2
TMF3
TMG1
TMG2
TMH1
TMH2
TMH3
TMS1
TMT1
TMT2
```

TMT3 remains RETIRED / excluded.

For each of the 12 sections, determine the intended current routing topology and exact approver identities for the canonical target model:

```text
Requester_User
Manager_Level1_Approvers
Manager_Level1_Approval_Rule (ALL/ANY)
Manager_Level2_Approvers, if applicable
Manager_Level2_Approval_Rule
GM_Level1_Approvers
GM_Level1_Approval_Rule
GM_Level2_Approvers, if applicable
GM_Level2_Approval_Rule
Effective_From / Effective_To, if governed
Active
```

Also identify whether the architecture needs additional generic slots beyond these currently named fields; DEC-019 remains authoritative for 6-slot + HR final-check capacity.

Do NOT guess any approver.

# STEP 0 — GIT / SECURITY

Require:

```text
branch = ai/antigravity-wp002c
021cf272... is ancestor
local HEAD = origin branch
tracked tree clean
```

No reset/rebase/force push/history rewrite.

Kintone writes = 0.
Protected apps remain read-only.
Sandbox apps remain read-only.

Before live network calls:

```js
delete process.env.KINTONE_API_TOKEN;
```

Never print credentials/auth headers.

# STEP 1 — CORRECT CURRENT DOC STATUS

In current/living sections only, reconcile to:

```text
M7A_REQUESTER_BASELINE = PASS / 12/12
M7B_FULL_ROUTING_FLOW = OPEN / DISCOVERY REQUIRED
M7_OVERALL = PARTIAL / NOT CLOSED
M9_FINAL_ACCEPTANCE = BLOCKED_PENDING_M7B
TODAY_DONE = NO
```

Do not claim M1-M9 complete.
Do not claim TODAY_DELIVERY_TARGET PASS.

Historical Sprint04 evidence may remain clearly historical, but the current state must explain that the prior M9 smoke only validated requester-level routing and static/read-only contracts, not the complete 12-section approval routing.

# STEP 2 — READ-ONLY APP795 INVENTORY

GET App795 live records and field schema.

For all 12 active Section_Code values, produce a sanitized routing completeness matrix with counts/presence only where identities are sensitive in docs, but retain exact identities in working memory/output needed for Control Plane review.

Required classification per section:

```text
Section_Code
Requester_User present/exact
Manager L1 configured? count
Manager L1 rule
Manager L2 configured? count
Manager L2 rule
GM L1 configured? count
GM L1 rule
GM L2 configured? count
GM L2 rule
Current topology classification
FULL_ROUTING_READY = YES/NO
Missing fields/data
```

Do not modify records.

# STEP 3 — FIND AUTHORITATIVE ROUTING SOURCES

Search repository, existing Kintone master data, protected legacy PMS apps (READ ONLY), App53 organization/employee data (READ ONLY), and approved project docs for actual routing evidence.

Potential evidence sources may include:

```text
legacy PMS applications 283/305/307/310/640/643/715/716
App53 employee/organization fields
existing App795 pilot/history
routing design docs / DEC-019 / DEC-020 / DEC-021 / DEC-031
existing process-management definitions
verified user-account mappings
```

For each proposed approver identity, record provenance:

```text
SECTION
ROLE/SLOT
USER CODE
SOURCE APP / FIELD / RULE
CONFIDENCE = VERIFIED / AMBIGUOUS / MISSING
```

If multiple legacy apps disagree, mark AMBIGUOUS and STOP short of proposing a write.

Do not infer approvers from titles alone unless a frozen rule explicitly defines that mapping.
Do not use requester identities as approvers unless independently verified.

# STEP 4 — DETERMINE ROUTING TOPOLOGY PER SECTION

For each section determine whether the flow is e.g.:

```text
M1 -> G1
M1 -> M2 -> G1
M1 -> G1 -> G2
M1 -> M2 -> G1 -> G2
or other canonical slot usage supported by DEC-019
```

For every configured slot, determine ALL vs ANY rule.

If HR final check is universal or stage-specific per architecture, document how it is applied, but do not write process/status settings in this task.

# STEP 5 — OUTPUT EXACT 12-SECTION M7B MANIFEST PROPOSAL

Create a reviewable exact manifest proposal in living evidence (do not create unnecessary new files if existing AI_REVIEW_PACKAGE/CURRENT_STATE is sufficient):

```text
TME1: requester + full manager/GM routing + rules + topology
TMF1: ...
...
TMT2: ...
```

Each section must end with one of:

```text
READY_FOR_USER_APPROVAL
BLOCKED_AMBIGUOUS_SOURCE
BLOCKED_MISSING_SOURCE
```

Required overall result:

```text
M7B_DISCOVERY_COVERAGE = X/12 VERIFIED
M7B_AMBIGUOUS_COUNT = X
M7B_MISSING_COUNT = X
M7B_WRITE_AUTHORIZATION = NO
```

# STEP 6 — NO-ORPHAN / TEST

No new runtime implementation is required for this discovery task unless a tiny read-only inspector can be added to an existing justified script. Prefer existing tools/modules first.

Do not create one-off discovery exports, walkthrough files, screenshots, temp manifests, or duplicate scripts in Git.

Run:

```bash
npm test
git diff --check
git status --short
```

No Kintone writes.

# FINAL EVIDENCE

Required final status:

```text
M7A_REQUESTER_BASELINE = PASS / 12/12
M7B_FULL_ROUTING_FLOW = DISCOVERED / PARTIAL / BLOCKED with exact counts
M7_OVERALL = OPEN
M9_PREVIOUS_SMOKE = VALID_FOR_REQUESTER_LEVEL_AND_STATIC_CONTRACTS_ONLY
M9_FINAL_ACCEPTANCE = BLOCKED_PENDING_M7B
KINTONE_WRITES_THIS_TASK = 0
PROTECTED_WRITES_THIS_TASK = 0
NO_ORPHAN_ARTIFACT_GATE = PASS
npm test = actual / PASS
NEXT_ACTION = CONTROL-PLANE + USER REVIEW OF 12-SECTION FULL ROUTING MANIFEST
```

Commit/push same branch, then STOP.

# STRICT OUT OF SCOPE

Do NOT:

- write App795
- modify App794/796/797/798/800
- change Kintone process management
- create fake MBO records
- guess approvers
- seed routing slots
- change scoring
- reactivate TMT3
- claim M7 complete from requester mapping alone
- claim M9 final PASS before M7B full routing is approved and written
