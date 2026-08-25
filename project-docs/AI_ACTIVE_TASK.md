# AI ACTIVE TASK — MBO2026 DELIVERY DAY SPRINT 02: MASTER SCHEMAS + SECURE HR DASHBOARD MVP

> **Control Plane:** ChatGPT / Project Lead / Independent Reviewer
> **Execution Plane:** Antigravity standalone
> **Repository:** `rebootob/MBO2026`
> **Branch:** `ai/antigravity-wp002c`
> **Reviewed Sprint 01 head:** `55e8f836cbbdd9c4ac2670e47dfe41db5068a47b`
> **Mode:** DELIVERY DAY / CONTROLLED LIVE SANDBOX WRITES

# TODAY NORTH STAR — AUTHORITATIVE

```text
TODAY_DELIVERY_TARGET = REQUIRED MBO APPS OPERATIONAL + SECURE REAL-DATA HR DASHBOARD MVP + SMOKE TEST

M1 App 794 Transaction Core        = EXISTING / READINESS NOT YET CLOSED
M2 App 795 Routing Master          = EXISTING / REQUESTER COVERAGE 1/12
M3 App 796 Scoring Master          = LIVE VERIFIED / 23 FIELDS / RECORDS 0
M4 Hoshin Master App 797           = LIVE CONTAINER / SCHEMA -> THIS SPRINT
M5 Revision Archive App 798        = LIVE CONTAINER / SCHEMA -> THIS SPRINT
M6 App 796 scoring baseline        = BLOCKED: CANONICAL SOURCE CONFLICT (ASST MGR 60/40 vs DEC-023 50/50)
M7 App 795 routing baseline        = NOT CLOSED
M8 Secure HR Dashboard MVP         = THIS SPRINT
M9 End-to-end smoke test           = AFTER M6/M7 CLOSURE

TODAY_DONE = NO
NEXT_CRITICAL_PATH = M4 + M5 + M8 NOW; then repair M6 conflict + M7 baseline; then M9
```

Do not work on anything that does not move M4, M5, or M8 in this sprint unless it is a direct blocker.

---

# CONTROL PLANE REVIEW — SPRINT 01

```text
DELIVERY_SPRINT_01_GATE = PASS_WITH_OBSERVATIONS / CLOSED
NORTH_STAR_ALIGNMENT_GATE = PASS
HOSHIN_CONTAINER_GATE = PASS (App 797)
REVISION_ARCHIVE_CONTAINER_GATE = PASS (App 798)
REAL_ID_REGISTRATION_GATE = PASS
NEW_APP_CREATOR_ONLY_ACL_GATE = PASS
NEW_APP_DEPLOY_GATE = PASS
EXISTING_794_795_796_ZERO_WRITE_GATE = PASS
PROTECTED_APP_ZERO_WRITE_GATE = PASS
REGRESSION_GATE = PASS (471/471 reported)
```

Bundle these non-blocking documentation corrections into this sprint's first docs commit:

```text
OBS-DAY-003: Sprint 01 evidence row still uses *(Review Head)* -> replace with 55e8f836...
OBS-DAY-004: generic THIS_TASK_KINTONE_CALLS / WRITES text is stale in some sections
OBS-DAY-005: Active Sandbox Apps list omits App 797/798
```

Do NOT create a standalone documentation loop.

---

# NEW BLOCKER FOUND — M6 SCORING SEED

Frozen `DEC-023` says:

```text
Staff / Japanese Staff = 70 / 30
ALL Management & Executive = 50 / 50
```

But `src/profiles/scoring-config-master.js:getCanonicalBaselineMasterConfigs()` currently contains at least:

```text
PROF_ASST_MGR = 60 / 40
```

Therefore:

```text
M6_SCORING_BASELINE_SEED_GATE = BLOCKED
```

Do not seed or publish App 796 in this sprint.
Do not "fix" this scoring conflict in this sprint unless required for dashboard compilation. It will be the first item after Dashboard MVP.

---

# SECURITY DECISION FOR DASHBOARD

`DEC-039` forbids cross-employee data exposure and explicitly says JavaScript/CSS is NOT a security boundary.
`DEC-025` requires HR Control Center.

Therefore the MVP dashboard MUST NOT be added as an all-user App 794 index customization.

Implement the `App 794 / Portal` architecture as a dedicated Kintone **portal-shell app** with Native Creator-Only access for today's sandbox MVP:

```text
HRCC_APP_NAME = MBO HR Control Center [Sandbox]
HRCC_SECURITY_MVP = CREATOR_ONLY / DEFAULT_DENY
HRCC_DATA_STORAGE = NONE
HRCC_DATA_SOURCE = CURRENT USER SESSION GETs TO APPS 794/795/796/797/798
```

This app stores no employee/business records. It is only a secure UI shell. Native Creator-Only ACL is the security boundary for this MVP.

If an exact `MBO HR Control Center [Sandbox]` already exists, do not create a duplicate; verify identity and ACL and reuse it.
If a suspicious near-duplicate exists, STOP before creation and report.

Kintone allocates the app ID. Never assume it will be 799.

---

# STEP 0 — GIT / SAFETY

Run and require:

```bash
git status --short
git branch --show-current
git fetch origin
git pull --ff-only
git rev-parse HEAD
git rev-parse origin/ai/antigravity-wp002c
git merge-base --is-ancestor 55e8f836cbbdd9c4ac2670e47dfe41db5068a47b HEAD
```

Required:

```text
branch = ai/antigravity-wp002c
local HEAD = remote HEAD
tracked working tree clean
Sprint 01 head in ancestry
```

Read:

```text
project-docs/AI_ACTIVE_TASK.md
project-docs/CURRENT_STATE.md
project-docs/HANDOFF.md
project-docs/AI_REVIEW_PACKAGE.md
project-docs/APP_REGISTRY.md
project-docs/ARCHITECTURE.md
project-docs/DECISIONS.md
project-docs/SECURITY_MODEL.md
project-docs/architecture-redesign/HOSHIN_MANAGEMENT_DESIGN.md
project-docs/architecture-redesign/REVISION_DATA_MODEL_DESIGN.md
project-docs/architecture-redesign/CONTROLLED_REOPEN_REVISION_DESIGN.md
project-docs/architecture-redesign/HR_CONTROL_CENTER_ARCHITECTURE.md
config/sandbox-apps.json
config/schema-spec.js
src/core/sandbox-write-guard.js
scripts/kintone/deploy-custom-ui.js
```

---

# STEP 1 — CLOSE SPRINT 01 + START SPRINT 02 DOCS

Update only the five living docs:

```text
project-docs/CURRENT_STATE.md
project-docs/HANDOFF.md
project-docs/AI_REVIEW_PACKAGE.md
project-docs/IMPLEMENTATION_STATUS.md
project-docs/CHANGELOG_AI.md
```

Record Sprint 01 as `PASS_WITH_OBSERVATIONS / CLOSED` and fix OBS-DAY-003/004/005.
Record the M6 scoring conflict exactly as above.
Update North Star scoreboard.

Commit exactly:

```text
docs: close delivery sprint 01 and start secure dashboard sprint
```

Push and verify sync.

---

# STEP 2 — CODE / TEST FOUNDATION FOR THIS SPRINT

## 2A. Extend registered sandbox recognition

Update `src/core/sandbox-write-guard.js:getSandboxAppIds()` to include, when present:

```text
mboV2AppId
routingMasterAppId
scoringConfigMasterAppId
hoshinMasterAppId
revisionArchiveAppId
hrControlCenterAppId
```

Preserve:

```text
DISCOVERY_MODE = true
WRITE_ALLOWED_APPS = []
PROTECTED_APP_IDS unchanged
```

No global permanent write window.
Every deployment write must use a process-local explicit allow-list + `dryRunBypassDiscovery: true` only for the exact target app being written.

## 2B. Add App 797 Hoshin schema manifest

Prefer adding this to existing `config/schema-spec.js` rather than creating another schema-definition file.

Exact fields:

```text
Hoshin_Key          SINGLE_LINE_TEXT required unique
Cycle_Code          SINGLE_LINE_TEXT required
Fiscal_Year         SINGLE_LINE_TEXT required
Scope_Type          DROP_DOWN required [DEPARTMENT, SECTION]
Scope_Code          SINGLE_LINE_TEXT required
Scope_Name          SINGLE_LINE_TEXT required
Department_Code     SINGLE_LINE_TEXT required
Department_Name     SINGLE_LINE_TEXT required
Section_Code        SINGLE_LINE_TEXT optional
Section_Name        SINGLE_LINE_TEXT optional
Hoshin_TH            MULTI_LINE_TEXT optional
Hoshin_EN            MULTI_LINE_TEXT optional
Version              NUMBER required default 1 min 1
Ready_For_MBO        RADIO_BUTTON required default NO [YES, NO]
Status               DROP_DOWN required default DRAFT [DRAFT, CURRENT_READY, SUPERSEDED]
Updated_By           USER_SELECT optional
Updated_At           DATETIME optional
Remark               MULTI_LINE_TEXT optional
Active               RADIO_BUTTON required default Active [Active, Inactive]
```

No Process Management.
No records.
Do not implement readiness/supersession mutation logic yet.

## 2C. Add App 798 Revision Archive schema manifest

Exact minimal archive schema:

```text
Archive_Key              SINGLE_LINE_TEXT required unique
Source_Record_ID         NUMBER optional
Source_Record_Key        SINGLE_LINE_TEXT required
Fiscal_Year              SINGLE_LINE_TEXT required
Employee_Code            SINGLE_LINE_TEXT required
Evaluation_Stage         DROP_DOWN required [OBJECTIVE, MIDYEAR, FINAL]
Revision_Number          NUMBER required min 1
Previous_Status          SINGLE_LINE_TEXT optional
Superseded_By_Revision   NUMBER optional min 1
Event_Type               SINGLE_LINE_TEXT required default EVALUATION_REVISION_CREATED
Reason                   MULTI_LINE_TEXT required
Snapshot_JSON            MULTI_LINE_TEXT required
Snapshot_Hash            SINGLE_LINE_TEXT required
Archived_By              USER_SELECT required
Archived_At              DATETIME required
```

No records in this sprint.

## 2D. Add secure HR Control Center UI

New files are justified by separation of concerns. Keep them minimal:

```text
src/ui/hr-control-center.js
src/styles/hr-control-center.css
scripts/kintone/deploy-delivery-sprint02.js
```

Add one focused test file if useful, otherwise extend existing tests. Do not create extra helper files without need.

Dashboard must run on `app.record.index.show` inside the dedicated HRCC app only.

Dashboard GET sources:

```text
App 794 Transaction Core
App 795 Routing Master
App 796 Scoring Config Master
App 797 Hoshin Master
App 798 Revision Archive
```

Use current Kintone user session only. No API token embedded in browser code. No secret or elevated backend proxy.

App 794 requested fields must be limited to non-confidential monitoring fields only, e.g.:

```text
$id
Fiscal_Year
Employee_Code
Employee_Name
Employee_Name_TH
Employee_Department
Employee_Section
Employee_Position
Status
```

Never request/display:

```text
Manager_* scores/comments
GM_* scores/comments
PartA_Raw_Score
PartA_Weighted_Score
PartB_Raw_Score
PartB_Weighted_Score
Final_Confidential_Score
Final_Grade
attachments
```

### Dashboard MVP UI

Render:

1. Header: `MBO 2026 — HR Control Center`
2. KPI cards:
   - Total Evaluations
   - Completed
   - In Progress
   - Need Attention
3. Pipeline counts grouped by live App 794 `Status`
4. Filters:
   - Fiscal Year
   - Department
   - Section
   - Status
5. Employee Evaluation Monitor grid:
   - Employee Code
   - Name
   - Department
   - Section
   - Position
   - Status (plain-language mapping)
   - Open Record link
6. System Health cards:
   - App 794 record count
   - App 795 routing coverage `x / 12`
   - App 796 scoring config count
   - App 797 Hoshin record count
   - App 798 Archive record count
7. Need Attention rules for MVP:
   - routing coverage < 12 -> warning
   - scoring config count == 0 -> warning
   - Hoshin record count == 0 -> warning
8. Quick links:
   - App 794
   - App 795
   - App 796
   - App 797
   - App 798

No write/action buttons in this MVP. Monitoring + navigation only.

Fail closed: if a source GET is denied, show that module as `Access denied / unavailable`; never bypass permissions.

No external CDN/framework. Vanilla JS/CSS only.

## 2E. Tests

Minimum automated coverage:

```text
getSandboxAppIds recognizes 797/798 and optional HRCC id
protected app list unchanged
default WRITE_ALLOWED_APPS remains []
Hoshin manifest exact fields/types/options/unique/required
Revision manifest exact fields/types/options/unique/required
Dashboard source GET-only
Dashboard source contains no confidential field requests
Dashboard aggregation/filter logic deterministic
Dashboard links use registered app IDs
Dashboard does not execute outside exact HRCC app ID
```

Run:

```bash
npm test
```

Required: previous 471 regressions + new tests, zero failures.

Commit code/tests exactly:

```text
feat: add delivery master schemas and secure hr control center
```

Push before live writes.

---

# STEP 3 — LOCAL PRE-WRITE BACKUP (MANDATORY)

`.env.local` may be used locally. Never print, modify, copy, hash, or commit its contents.
Delete `KINTONE_API_TOKEN` from the process before write execution; use username/password connection.

Create a durable local backup directory:

```text
backups/delivery-sprint-02/<UTC_TIMESTAMP>/
```

Before ANY write, capture and retain until ChatGPT review:

For App 797 and 798:

```text
live settings
preview settings
live fields
preview fields
live layout
preview layout
live ACL
preview ACL
record count / records (expected 0)
```

For an existing HRCC app, capture equivalent state before customization.
For a newly created HRCC app, capture state immediately after safe create/deploy and before customization.

Create SHA-256 manifest for backup files. Record only paths + hashes in evidence docs, not raw contents.

DO NOT delete this backup directory before ChatGPT review.

---

# STEP 4 — LIVE SCHEMA DEPLOY: APPS 797 + 798 ONLY

Preflight exact identity + creator-only ACL + recordCount=0 for both apps.
If any record exists or identity/ACL mismatches, STOP before write.

Authorized writes:

```text
App 797 form fields/layout/deploy only
App 798 form fields/layout/deploy only
```

Use exact process-local allow-list `[797, 798]` and guard checks before each app-specific write.

After deploy, exact read-back must verify:

```text
App 797 = exact 19 planned fields + creator-only + live deploy success + records 0
App 798 = exact 15 planned fields + creator-only + live deploy success + records 0
```

If transport is uncertain, reconcile with GET; do not blindly retry.

No writes to 794/795/796.
No protected-app writes.
No records anywhere.

---

# STEP 5 — CREATE/REUSE SECURE HRCC PORTAL SHELL + DEPLOY DASHBOARD

First GET/search app catalog for exact name:

```text
MBO HR Control Center [Sandbox]
```

If exact one exists, verify exact identity + creator-only/default-deny and reuse.
If no exact/suspicious duplicate exists, create exactly one app with that exact name.

For a new HRCC app:

```text
POST preview app create exactly once
verify returned ID/name
ensure creator-only ACL
live deploy
read-back exact live identity/ACL
```

Then deploy the dashboard customization to HRCC app only:

```text
upload JS/CSS
PUT preview app customize for HRCC ID only
POST deploy HRCC only
bounded status polling
live read-back of customization/settings/ACL
```

No business records in HRCC.
No fields required in HRCC for MVP.

Register the returned/reused real ID in:

```text
config/sandbox-apps.json -> hrControlCenterAppId
project-docs/APP_REGISTRY.md
```

Purpose:

```text
Secure creator-only Kintone portal shell for HR Control Center MVP; reads real sandbox data under current-user native permissions; stores no business records.
```

Generate committed `dist` dashboard artifacts only if the deployment process needs them and existing repository convention tracks dist.

---

# STEP 6 — LIVE DASHBOARD SMOKE TEST (READ ONLY)

Using the deployed HRCC app and current authenticated creator/admin account, verify via safe GETs/read-back:

```text
HRCC app exact identity
HRCC ACL = CREATOR_ONLY
Dashboard customization live
App 794 GET works or reports access denied without bypass
App 795 GET works
App 796 GET works
App 797 GET works
App 798 GET works
```

Record safe counts only.

Expected current health likely includes:

```text
App 796 configs = 0 -> warning is correct
App 797 Hoshin records = 0 -> warning is correct
App 798 archive records = 0
App 795 routing coverage currently expected 1/12 unless live state differs
```

Do not create data just to make KPI cards green.

---

# STEP 7 — EVIDENCE / GIT

Run full tests again after generated artifacts/registration changes.

Expected commits after Control Plane assignment:

```text
1. docs: close delivery sprint 01 and start secure dashboard sprint
2. feat: add delivery master schemas and secure hr control center
3. chore: register and deploy secure hr control center
4. docs: record delivery sprint 02 schema and dashboard evidence
```

Commit 3 may also include `config/sandbox-apps.json`, `project-docs/APP_REGISTRY.md`, and tracked dist artifacts only.

Final evidence docs must record:

```text
DELIVERY_SPRINT_02 = COMPLETE / PENDING CHATGPT REVIEW
M4 App 797 = LIVE SCHEMA VERIFIED / 19 fields / 0 records
M5 App 798 = LIVE SCHEMA VERIFIED / 15 fields / 0 records
M8 HR Dashboard = LIVE MVP VERIFIED / exact HRCC app ID / CREATOR_ONLY
M6 = BLOCKED pending scoring source correction
M7 = still requester coverage x/12
794 writes = 0
795 writes = 0
796 writes = 0
protected writes = 0
797 schema write counts = actual
798 schema write counts = actual
HRCC create/customize/deploy write counts = actual
records created = 0
prewrite backup retained = YES + local path + SHA256 manifest
npm test = actual total / PASS
NEXT_CRITICAL_PATH = repair M6 scoring baseline source, seed M6 + M7, then end-to-end smoke test
TODAY_DONE = NO
```

Push branch and require local HEAD = remote HEAD, tracked working tree clean, then STOP.

---

# STRICT OUT OF SCOPE

Do not:

- seed/publish App 796
- seed App 795
- alter scoring weights in this sprint
- create Hoshin records
- create Revision Archive records
- modify App 794 schema/process/records/customization
- modify App 795 schema/process/records
- modify App 796 schema/process/records
- implement Hoshin supersession business writes yet
- implement Reopen archive writes yet
- weaken Creator-Only ACL
- expose dashboard to shared/common employee account
- touch protected app data

# REVIEW EXPECTATION

ChatGPT will independently inspect GitHub and gate:

```text
NORTH_STAR_ALIGNMENT_GATE
SPRINT01_CLOSURE_GATE
SCORING_CONFLICT_CONTAINMENT_GATE
SANDBOX_REGISTRY_GUARD_GATE
HOSHIN_SCHEMA_GATE
REVISION_ARCHIVE_SCHEMA_GATE
PREWRITE_BACKUP_RETENTION_GATE
797_ZERO_RECORD_GATE
798_ZERO_RECORD_GATE
HRCC_EXACT_IDENTITY_GATE
HRCC_NATIVE_SECURITY_GATE
DASHBOARD_CONFIDENTIAL_DATA_EXCLUSION_GATE
DASHBOARD_GET_ONLY_RUNTIME_GATE
DASHBOARD_REAL_DATA_GATE
794_795_796_ZERO_WRITE_GATE
PROTECTED_APP_ZERO_WRITE_GATE
REGRESSION_GATE
GIT_PUSH_SYNC_GATE
DELIVERY_SPRINT_02_GATE
```

# FINAL REPORT FORMAT

Start and end with the TODAY NORTH STAR scoreboard.
Report safe metadata only. Never print secrets or raw employee datasets.
