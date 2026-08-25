# AI ACTIVE TASK — MBO2026 DELIVERY DAY SPRINT 02: MASTER SCHEMAS + SECURE HR DASHBOARD MVP

> **Control Plane:** ChatGPT / Project Lead / Independent Reviewer
> **Execution Plane:** Antigravity standalone
> **Repository:** `rebootob/MBO2026`
> **Branch:** `ai/antigravity-wp002c`
> **Reviewed Sprint 01 head:** `55e8f836cbbdd9c4ac2670e47dfe41db5068a47b`
> **Mode:** DELIVERY DAY / CONTROLLED LIVE SANDBOX WRITES
> **Important correction:** User reconfirmed the Evaluation Ratio by Position on 2026-08-25. This task supersedes the scoring-conflict wording in commit `d0491d65...`.

# TODAY NORTH STAR — AUTHORITATIVE

```text
TODAY_DELIVERY_TARGET = REQUIRED MBO APPS OPERATIONAL + SECURE REAL-DATA HR DASHBOARD MVP + SMOKE TEST

M1 App 794 Transaction Core        = EXISTING / READINESS NOT YET CLOSED
M2 App 795 Routing Master          = EXISTING / REQUESTER COVERAGE 1/12
M3 App 796 Scoring Master          = LIVE VERIFIED / 23 FIELDS / RECORDS 0
M4 Hoshin Master App 797           = LIVE CONTAINER / SCHEMA -> THIS SPRINT
M5 Revision Archive App 798        = LIVE CONTAINER / SCHEMA -> THIS SPRINT
M6 App 796 scoring baseline        = BUSINESS RATIO CONFIRMED / READY FOR NEXT CONTROLLED SEED STAGE
M7 App 795 routing baseline        = NOT CLOSED
M8 Secure HR Dashboard MVP         = THIS SPRINT
M9 End-to-end smoke test           = AFTER M6/M7 CLOSURE

TODAY_DONE = NO
NEXT_CRITICAL_PATH = M4 + M5 + M8 NOW; then M6 + M7; then M9
```

Do not work on anything that does not move M4, M5, or M8 in this sprint unless it is a direct blocker.

---

# BUSINESS RULE CORRECTION — EVALUATION RATIO BY POSITION

The user explicitly reconfirmed the ratio from the approved visual reference. This is the authoritative business rule:

```text
Staff – Chief                 = Part A Objectives 70% / Part B Competencies 30%
Assistant Manager             = Part A Objectives 60% / Part B Competencies 40%
Section Manager and Above     = Part A Objectives 50% / Part B Competencies 50%
```

`Section Manager and Above` includes the higher management/executive profiles already modeled above Assistant Manager (Section Manager, Senior Manager, DGM, GM, VP).

Japanese Staff is not shown in the reconfirmation image; preserve its existing validated rule unless separately instructed by the user.

Important consequences:

```text
PROF_ASST_MGR 60/40 = CORRECT
M6_SCORING_BASELINE_SEED_GATE = NOT_BLOCKED_BY_RATIO
```

The previous `DEC-023` wording that said all Management & Executive = 50/50 is stale/inaccurate for Assistant Manager and must be corrected in living/frozen decision documentation during this sprint's first docs commit.

Do NOT change `PROF_ASST_MGR` from 60/40 to 50/50.
Before future App 796 seed, verify canonical baseline resolves exactly to the ratios above.

App 796 seeding/publishing is still OUT OF SCOPE for Sprint 02 because the current sprint is focused on M4/M5/M8 and the live publish/audit wiring remains a separate controlled stage.

---

# CONTROL PLANE REVIEW — SPRINT 01

```text
DELIVERY_SPRINT_01_GATE = PASS_WITH_OBSERVATIONS / CLOSED
HOSHIN_CONTAINER_GATE = PASS (App 797)
REVISION_ARCHIVE_CONTAINER_GATE = PASS (App 798)
REAL_ID_REGISTRATION_GATE = PASS
NEW_APP_CREATOR_ONLY_ACL_GATE = PASS
NEW_APP_DEPLOY_GATE = PASS
EXISTING_794_795_796_ZERO_WRITE_GATE = PASS
PROTECTED_APP_ZERO_WRITE_GATE = PASS
REGRESSION_GATE = PASS (471/471 reported)
```

Bundle, do not create standalone loops:

```text
OBS-DAY-003: Sprint 01 evidence row *(Review Head)* -> 55e8f836...
OBS-DAY-004: stale generic Kintone call/write counters in some docs
OBS-DAY-005: Active Sandbox Apps list omits 797/798
OBS-DAY-006: DEC-023 ratio summary must be corrected to 70/30, 60/40, 50/50 by level
```

---

# SECURITY DECISION FOR DASHBOARD

`DEC-039` forbids cross-employee exposure and JavaScript/CSS is not a security boundary. `DEC-025` requires HR Control Center.

Dashboard MVP must use a dedicated native-secured Kintone shell:

```text
HRCC_APP_NAME = MBO HR Control Center [Sandbox]
HRCC_SECURITY_MVP = CREATOR_ONLY / DEFAULT_DENY
HRCC_DATA_STORAGE = NONE
HRCC_DATA_SOURCE = CURRENT USER SESSION GETs TO APPS 794/795/796/797/798
```

If exact HRCC app exists, verify and reuse. If no exact or suspicious near-duplicate exists, create exactly one. Never assume its App ID.

---

# STEP 0 — GIT / SECRET SAFETY

Require exact branch `ai/antigravity-wp002c`, clean tracked tree, fast-forward sync, and this Control Plane correction commit in ancestry.

Read mandatory project state, decisions, security model, Hoshin design, revision design, HRCC architecture, registry, schema spec, sandbox guard, and current deployment scripts.

`.env.local` may be used locally only. It must remain ignored, untracked, unmodified, unprinted, and uncommitted. Delete `process.env.KINTONE_API_TOKEN` before network writes; use username/password connection.

Protected Apps remain permanently READ ONLY:

```text
53, 283, 305, 307, 310, 640, 643, 715, 716
```

No writes to 794/795/796 in Sprint 02.

---

# STEP 1 — DOC RECONCILIATION + SPRINT START

Update the five living docs plus `project-docs/DECISIONS.md` only as needed to correct the ratio statement.

Required ratio wording:

```text
Staff / Chief = 70/30
Assistant Manager = 60/40
Section Manager and Above = 50/50
```

Preserve all other frozen decisions and Stage 3C evidence exception.

Commit exactly:

```text
docs: reconcile scoring ratios and start delivery sprint 02
```

Push and sync.

---

# STEP 2 — CODE / TEST FOUNDATION

## 2A Sandbox registry recognition

Update `src/core/sandbox-write-guard.js:getSandboxAppIds()` to recognize registered IDs when present:

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

No permanent write window. Every live write requires an explicit process-local target allow-list and guard check.

## 2B App 797 Hoshin schema — exact 19 fields

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

Prefer adding manifest to existing `config/schema-spec.js`. No Process Management. No records.

## 2C App 798 Revision Archive schema — exact 15 fields

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

No records.

## 2D Secure HR Control Center MVP

Minimal justified files:

```text
src/ui/hr-control-center.js
src/styles/hr-control-center.css
scripts/kintone/deploy-delivery-sprint02.js
```

Dashboard runs only inside the exact registered HRCC App ID on `app.record.index.show`.

GET-only browser runtime sources: Apps 794, 795, 796, 797, 798 using the current Kintone session. No embedded API token or credentials.

From App 794 request/display only non-confidential monitoring fields:

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

Never request/display scores, grades, Manager/GM comments/ratings, or attachments.

Dashboard MVP:

```text
Header: MBO 2026 — HR Control Center
KPI: Total Evaluations / Completed / In Progress / Need Attention
Pipeline counts by App 794 Status
Filters: FY / Department / Section / Status
Employee monitor: code, name, department, section, position, status, open-record link
Health: 794 count, 795 coverage x/12, 796 config count, 797 Hoshin count, 798 archive count
Warnings: routing <12; scoring config=0; Hoshin=0
Quick links: 794–798
```

Monitoring/navigation only; no write buttons. Fail closed on denied GETs. Vanilla JS/CSS only.

Tests must prove registry recognition, protected/default-deny preservation, exact schemas, dashboard GET-only behavior, confidential field exclusion, deterministic aggregation/filtering, exact HRCC app binding, and ratio rule regression including `PROF_ASST_MGR = 60/40`.

Run full `npm test`; zero failures.

Commit exactly:

```text
feat: add delivery master schemas and secure hr control center
```

Push before live writes.

---

# STEP 3 — DURABLE PRE-WRITE BACKUP

Before any write create and RETAIN until ChatGPT review:

```text
backups/delivery-sprint-02/<UTC_TIMESTAMP>/
```

Capture App 797/798 live+preview settings, fields, layout, ACL, records/count. For HRCC capture equivalent state before customization (or immediately after safe create/deploy if newly created). Create SHA-256 manifest. Record only backup paths/hashes in docs, never raw payloads/secrets.

Do not delete backup before independent review.

---

# STEP 4 — LIVE SCHEMAS 797/798

Preflight exact identity, Creator-only ACL, and recordCount=0. Stop on mismatch.

Authorized writes only:

```text
App 797: form fields/layout/deploy
App 798: form fields/layout/deploy
```

After deploy exact live read-back:

```text
797 = 19 planned fields / CREATOR_ONLY / records 0
798 = 15 planned fields / CREATOR_ONLY / records 0
```

No blind retry after uncertain transport; reconcile by GET.

---

# STEP 5 — CREATE/REUSE HRCC + DEPLOY DASHBOARD

Search exact `MBO HR Control Center [Sandbox]`. Avoid duplicates.

If newly created: create once, verify exact returned ID/name, enforce Creator-only ACL, deploy live, read back identity/ACL.

Deploy dashboard customization to HRCC only: upload JS/CSS, PUT preview customize, POST deploy, bounded poll, live read-back.

Register exact real ID in:

```text
config/sandbox-apps.json -> hrControlCenterAppId
project-docs/APP_REGISTRY.md
```

HRCC stores no business records and needs no business fields for MVP.

Commit registration/deployment artifacts exactly:

```text
chore: register and deploy secure hr control center
```

---

# STEP 6 — LIVE READ-ONLY DASHBOARD SMOKE

Verify exact HRCC identity, Creator-only ACL, customization live, and GET access/fail-closed behavior for Apps 794–798. Record safe counts only. Do not create records to make health indicators green.

---

# STEP 7 — EVIDENCE

Run full tests again and update living docs.

Required final state:

```text
DELIVERY_SPRINT_02 = COMPLETE / PENDING CHATGPT REVIEW
M4 App 797 = LIVE SCHEMA VERIFIED / 19 fields / 0 records
M5 App 798 = LIVE SCHEMA VERIFIED / 15 fields / 0 records
M6 App 796 scoring baseline = RATIO CONFIRMED / READY FOR NEXT CONTROLLED SEED STAGE
M7 App 795 routing baseline = current coverage x/12
M8 HR Dashboard = LIVE MVP VERIFIED / real HRCC app ID / CREATOR_ONLY
794 writes = 0
795 writes = 0
796 writes = 0
protected writes = 0
records created = 0
prewrite backup retained = YES
npm test = actual total / PASS
NEXT_CRITICAL_PATH = M6 scoring seed + M7 routing seed, then M9 end-to-end smoke test
TODAY_DONE = NO
```

Evidence commit exactly:

```text
docs: record delivery sprint 02 schema and dashboard evidence
```

Push branch, require local HEAD = remote HEAD and clean tracked tree, then STOP.

# STRICT OUT OF SCOPE

Do not seed/publish App 796 in Sprint 02. Do not seed App 795. Do not modify App 794/795/796 schema/process/records/customization. Do not create Hoshin/Archive records. Do not implement Hoshin supersession or Reopen archive writes. Do not weaken HRCC security. Do not touch protected-app data.

# REVIEW EXPECTATION

```text
NORTH_STAR_ALIGNMENT_GATE
SPRINT01_CLOSURE_GATE
SCORING_RATIO_TRUTH_GATE
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
