# AI ACTIVE TASK — MBO2026 DELIVERY DAY SPRINT 01: CORE APP AVAILABILITY + MISSING APP BOOTSTRAP

> **Control Plane:** ChatGPT / Project Lead / Independent Reviewer
> **Execution Plane:** Antigravity standalone
> **Repository:** `rebootob/MBO2026`
> **Branch:** `ai/antigravity-wp002c`
> **Reviewed Stage 4D-B head:** `ed4238e607edd9e8e54ad58dfb41e6841489feb4`
> **Mode:** DELIVERY DAY / CONTROLLED LIVE APP BOOTSTRAP
> **User priority:** TODAY = REQUIRED MBO APPS UP + HR DASHBOARD MVP VISIBLE

# TODAY NORTH STAR — DO NOT DRIFT

This block is authoritative for the rest of today. Every Antigravity report and every ChatGPT review must repeat the scoreboard.

```text
TODAY_DELIVERY_TARGET = REQUIRED MBO APPS UP + REAL-DATA HR DASHBOARD MVP

M1 App 794 Transaction Core        = EXISTING / READINESS NOT YET CLOSED
M2 App 795 Routing Master          = EXISTING / BASELINE NOT YET CLOSED
M3 App 796 Scoring Master          = LIVE VERIFIED / SCHEMA VERIFIED / ACL VERIFIED / RECORDS 0
M4 Hoshin Master                   = MISSING OR UNVERIFIED -> THIS SPRINT
M5 Revision Archive               = MISSING OR UNVERIFIED -> THIS SPRINT
M6 App 796 baseline scoring data  = NOT STARTED
M7 App 795 routing baseline       = NOT CLOSED
M8 HR Dashboard MVP on App 794    = NOT STARTED
M9 End-to-end smoke test          = NOT STARTED

TODAY_DONE = NO
NEXT_CRITICAL_PATH = M4 + M5, then M6/M7, then M8, then M9
```

Do not start work that does not move one of M1–M9 unless it is a BLOCKER for those milestones.
Documentation-only imperfections must be bundled into useful delivery commits and must not create standalone loops unless they affect safety/data integrity.

---

# CONTROL PLANE REVIEW RESULT — STAGE 4D-B

Accepted:

```text
STAGE4D_A_CLOSURE_GATE = PASS
REVIEWED_CODE_INTEGRITY_GATE = PASS
LOCAL_SECRET_SAFETY_GATE = PASS (execution evidence + .gitignore)
LIVE_GET_ONLY_EXECUTION_GATE = PASS
LIVE_APP_IDENTITY_GATE = PASS
LIVE_SCHEMA_GATE = PASS
LIVE_ACL_GATE = PASS
LIVE_ZERO_RECORD_GATE = PASS
STAGE4C_BRIDGE_LIVE_GET_GATE = PASS
API_TOKEN_SUPPRESSION_GATE = PASS (execution evidence)
NO_RETRY_FAIL_CLOSED_GATE = PASS
ZERO_KINTONE_WRITE_GATE = PASS
REGRESSION_GATE = PASS (471/471 reported)
GIT_PUSH_SYNC_GATE = PASS
WP002C_STAGE4D_B_GATE = PASS_WITH_OBSERVATIONS
```

Observed but NOT blocking delivery:

```text
OBS-DAY-001: AI_REVIEW_PACKAGE Stage 4D-B row still uses *(Review Head)* instead of ed4238e...
OBS-DAY-002: generic THIS_TASK_KINTONE_CALLS remains 0 in some living-doc sections although Stage 4D-B evidence correctly records attempted=7/successful=7 GETs.
```

Fix these observations inside the first documentation commit of this sprint. Do NOT create a separate closure loop.

Historical Stage 3C evidence exception remains unchanged.

---

# SPRINT 01 GOAL

By the end of this sprint, determine the real existence state of the two missing core app containers and ensure both exist live in Kintone with exact identities and creator-only/default-deny access.

Exact approved names:

```text
HOSHIN_APP_NAME = MBO Hoshin Master [Sandbox]
REVISION_ARCHIVE_APP_NAME = MBO Revision Archive [Sandbox]
```

Kintone must allocate the IDs. NEVER assume App 799 or any other ID from old diagrams.

This sprint creates APP CONTAINERS ONLY. It does not configure their business schemas and does not seed records. Schema/data comes immediately in Delivery Sprint 02.

---

# STEP 0 — GIT SAFETY

Run:

```bash
git status --short
git branch --show-current
git fetch origin
git pull --ff-only
git rev-parse HEAD
git rev-parse origin/ai/antigravity-wp002c
git merge-base --is-ancestor ed4238e607edd9e8e54ad58dfb41e6841489feb4 HEAD
```

Required:

```text
branch = ai/antigravity-wp002c
local HEAD = remote HEAD
reviewed Stage 4D-B head is in ancestry
tracked working tree clean
```

No reset/rebase/stash/force push automatically.

Read before execution:

```text
project-docs/AI_ACTIVE_TASK.md
project-docs/CURRENT_STATE.md
project-docs/HANDOFF.md
project-docs/AI_REVIEW_PACKAGE.md
project-docs/IMPLEMENTATION_STATUS.md
project-docs/APP_REGISTRY.md
project-docs/ARCHITECTURE.md
project-docs/DECISIONS.md
src/core/kintone-client.js
src/core/sandbox-write-guard.js
config/sandbox-apps.json
```

Also locate and read the frozen Hoshin blueprint/architecture-redesign documents. Confirm DEC-018 remains frozen.

---

# STEP 1 — BUNDLE STAGE 4D-B CLOSURE + DELIVERY NORTH STAR DOC UPDATE

Update only:

```text
project-docs/CURRENT_STATE.md
project-docs/HANDOFF.md
project-docs/AI_REVIEW_PACKAGE.md
project-docs/IMPLEMENTATION_STATUS.md
project-docs/CHANGELOG_AI.md
```

Required:

- record `WP002C_STAGE4D_B_GATE = PASS_WITH_OBSERVATIONS`
- record Stage 4D-B evidence SHA `ed4238e607edd9e8e54ad58dfb41e6841489feb4`
- replace Stage 4D-B `*(Review Head)*` placeholder with that SHA
- correct current Stage 4D-B GET accounting to `attempted=7`, `successful=7`, `writes=0`
- add the TODAY NORTH STAR scoreboard from this task to CURRENT_STATE and HANDOFF in a compact form
- mark Delivery Sprint 01 as active
- preserve Stage 3C evidence exception exactly

Commit exactly:

```text
docs: close stage4d-b and start delivery-day core app sprint
```

Push and verify local HEAD = remote HEAD.

---

# STEP 2 — LOCAL SECRET SAFETY

`.env.local` is authorized only as local connection input.
Never print/cat/copy/hash/commit/modify its contents.

Required checks:

```bash
git check-ignore -q .env.local
```

and verify `.env.local` is not tracked.

Presence-only check for:

```text
KINTONE_BASE_URL
KINTONE_USERNAME
KINTONE_PASSWORD
```

Before every network run:

```text
delete process.env.KINTONE_API_TOKEN
```

Never print headers or secrets.

---

# STEP 3 — LIVE INVENTORY: EXISTING CORE APPS + NAME COLLISION GATE

GET-only inventory first.

Verify current existing apps without modifying them:

```text
794 = MBO V2 Sandbox
795 = MBO Routing Master Sandbox
796 = MBO Profile & Scoring Configuration Master [Sandbox]
```

For 794/795/796 record only safe metadata:

```text
appId
appName
live revision if available
record count (use limit 1 / total-safe approach; do not dump records)
```

Protected apps remain READ ONLY and do not need broad rediscovery.

Search Kintone app catalog for names containing:

```text
MBO Hoshin Master
MBO Revision Archive
```

For each target:

A. If one exact approved live app exists -> do NOT create another; verify exact name and creator-only/default-deny ACL; use its real ID.

B. If no exact app exists and no suspicious near-duplicate exists -> creation is authorized.

C. If a suspicious near-duplicate exists -> STOP before creation and report exact safe app ID/name only. Do not guess ownership and do not create a duplicate.

Do not modify 794/795/796.

---

# STEP 4 — AUTHORIZED NEW APP BOOTSTRAP (ONLY IF MISSING)

User has explicitly prioritized that all required MBO app containers be up today. Control Plane authorizes creation of ONLY these exact two names if missing:

```text
MBO Hoshin Master [Sandbox]
MBO Revision Archive [Sandbox]
```

No caller-selectable third app name.

Use username/password connection only. API token removed from process.

For each missing app:

1. POST exactly `/k/v1/preview/app.json` with body `{name: EXACT_APPROVED_NAME}` exactly once.
2. Capture returned positive App ID and numeric revision.
3. GET preview settings by that exact returned ID; require exact name equality.
4. GET preview ACL.
5. If ACL is not creator-only/default-deny, PUT exactly `/k/v1/preview/app/acl.json` for that returned ID with creator-only rights. This ACL PUT is authorized only for the newly created exact-ID app.
6. POST deploy exactly for that returned app/revision.
7. Poll deploy status boundedly until SUCCESS; no blind retry of create/deploy after uncertain transport.
8. GET live settings + live ACL by exact returned ID.
9. Require exact name and creator-only/default-deny.
10. Record safe ID/name/revisions/status only.

No schema fields in this sprint.
No records in this sprint.
No Process Management.
No JavaScript/CSS deployment.

Allowed Kintone writes are strictly limited to the two new app containers:

```text
APP_CREATE POST <= 2 total
NEW-APP ACL PUT <= 2 total, only if needed
NEW-APP DEPLOY POST <= 2 total
```

Absolutely zero writes to:

```text
53, 283, 305, 307, 310, 640, 643, 715, 716
794, 795, 796
```

If create transport becomes uncertain, do NOT retry. Reconcile by GET/catalog only and stop if ownership/result is uncertain.

Rollback policy: do not auto-delete a created app. Preserve exact new app IDs and stop for Control Plane review if bootstrap partially fails.

---

# STEP 5 — REGISTER REAL APP IDS IN GIT

Only after exact live read-back succeeds for each target, update:

```text
config/sandbox-apps.json
project-docs/APP_REGISTRY.md
```

Add dynamic real IDs under clear keys:

```text
hoshinMasterAppId
revisionArchiveAppId
```

Do not overwrite existing 794/795/796 IDs.

APP_REGISTRY purposes:

```text
Hoshin Master = HR-managed Department/Section Hoshin version master; DEC-018; no workflow
Revision Archive = immutable historical snapshots of superseded App 794 stage revisions; DEC-022
```

Do NOT yet change `getSandboxAppIds()` or write guards for these new apps. That belongs to Sprint 02 when schema writes are authorized and tested.

Run full regression:

```bash
npm test
```

Expected >=471 and 0 fail.

Commit exactly:

```text
chore: register delivery-day hoshin and revision archive apps
```

Push and verify local HEAD = remote HEAD.

---

# STEP 6 — DELIVERY EVIDENCE + NEXT CRITICAL PATH

Update only the five living docs:

```text
project-docs/CURRENT_STATE.md
project-docs/HANDOFF.md
project-docs/AI_REVIEW_PACKAGE.md
project-docs/IMPLEMENTATION_STATUS.md
project-docs/CHANGELOG_AI.md
```

Record:

```text
DELIVERY_SPRINT_01 = COMPLETE / PENDING CHATGPT REVIEW
M4 Hoshin Master = LIVE CONTAINER VERIFIED / real ID
M5 Revision Archive = LIVE CONTAINER VERIFIED / real ID
existing 794/795/796 write count = 0
protected app write count = 0
new app create count = actual safe count
new app ACL PUT count = actual safe count
new app deploy count = actual safe count
records created = 0
schema fields created = 0
npm test = actual total / PASS
```

Repeat the TODAY NORTH STAR scoreboard and set:

```text
NEXT_CRITICAL_PATH = DELIVERY SPRINT 02: HOSHIN + REVISION ARCHIVE SCHEMA / BASELINE DATA CLOSURE, THEN DASHBOARD MVP
TODAY_DONE = NO
```

Commit exactly:

```text
docs: record delivery-day core app bootstrap evidence
```

Push and STOP.

---

# STRICT OUT-OF-SCOPE FOR SPRINT 01

Do not:

- modify schema/records/process/customization of App 794
- modify schema/records/process/customization of App 795
- modify schema/records/process/customization of App 796
- seed App 795
- seed/publish App 796
- create Hoshin records
- create Revision Archive records
- configure Hoshin/Archive business fields yet
- deploy Dashboard yet
- wire resolver
- touch protected-app data
- start unrelated phases

The reason is focus: Sprint 01 closes M4/M5 app availability only. Sprint 02 immediately addresses schemas/data. Dashboard is the next visible deliverable after that.

# FINAL REPORT

Start and end the report with the TODAY NORTH STAR scoreboard.
Report only safe evidence:

- branch / start HEAD / final HEAD
- three expected commits
- existing 794/795/796 verified IDs/names and zero writes
- Hoshin real ID/name/status
- Revision Archive real ID/name/status
- suspicious duplicate check PASS/FAIL
- app create / ACL PUT / deploy counts
- records created = 0
- schema fields created = 0
- protected app writes = 0
- 794/795/796 writes = 0
- `.env.local` used local-only YES/NO; modified NO; committed NO; secrets printed NO
- API token sent NO
- npm test total/pass/fail
- local HEAD = remote HEAD
- working tree clean
- STOP

# REVIEW EXPECTATION

ChatGPT will independently inspect GitHub and determine:

```text
STAGE4D_B_CLOSURE_GATE
NORTH_STAR_ALIGNMENT_GATE
EXISTING_CORE_APP_ZERO_WRITE_GATE
APP_NAME_COLLISION_GATE
HOSHIN_CONTAINER_GATE
REVISION_ARCHIVE_CONTAINER_GATE
NEW_APP_CREATOR_ONLY_ACL_GATE
NEW_APP_DEPLOY_GATE
REAL_ID_REGISTRATION_GATE
PROTECTED_APP_ZERO_WRITE_GATE
REGRESSION_GATE
DOC_EVIDENCE_CONSISTENCY_GATE
GIT_PUSH_SYNC_GATE
DELIVERY_SPRINT_01_GATE
```
