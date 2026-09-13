# D3-SBX-UAT-03 Evidence Record

Updated: 2026-09-13 ICT

## 1. Package & Execution Metadata
```text
PACKAGE = D3-SBX-UAT-03
TITLE = EXISTING RECORD 15 PERSISTED ROUTE/SNAPSHOT VS REAL UI READ-ONLY UAT
AUTHORIZATION_ID = MBO2026-D3-SBX-UAT03-20260913-OWNER-01
MODE = REAL BROWSER READ-ONLY VERIFICATION + REST API PERSISTED BASELINE AUDIT
AUTHORIZED_BASE_HEAD = 9fcb290284e4e80b03870f789a25f51b6b42b3ff
BASE_PARENT = 430bdadd3fa07e39b6580f365b5ce131e59e57c1
BASE_TREE = 4fa7a22db46f80ec9d332ca212d6a33803fdbd0a
BASE_MESSAGE = docs(d3): deliver D3-SBX-UAT-02-R1 corrective evidence and sync control
EXECUTION_HEAD = 9fcb290284e4e80b03870f789a25f51b6b42b3ff
EXECUTION_PLANE = ANTIGRAVITY CLI
ORCHESTRATION_CHANNEL = HERMES (ORCHESTRATOR ONLY)
TARGET_APP = 794
TARGET_RECORD_ID = 15
TARGET_RECORD_URL = https://ttmet.cybozu.com/k/794/show#record=15
RESULT = DELIVERED / REVIEW REQUIRED
```

> **Owner Authorization Scope Note:**
> Authorized under `MBO2026-D3-SBX-UAT03-20260913-OWNER-01` to execute real-browser read-only verification comparing persisted record data (via up to 2 explicit GET calls to `/k/v1/record.json?app=794&id=15`) against rendered DOM/UI on Record ID 15 only.
> Zero Kintone mutations, record creations, process transitions, schema changes, or deployments permitted.

---

## 2. Hard Operational Accounting & Ceiling Compliance
```text
KINTONE_API_READS = 2 (Call 1 baseline: 2026-09-13T13:33:00Z, Call 2 stability: 2026-09-13T13:35:15Z)
KINTONE_API_WRITES = 0 (CEILING: 0 max)
KINTONE_IO_MUTATIONS = 0
RECORD_CREATIONS = 0
PROCESS_WRITES_OR_TRANSITIONS = 0
SCHEMA_WRITES = 0
ACL_WRITES = 0
CUSTOMIZATION_WRITES = 0
DEPLOYMENT_POSTS = 0
CREDENTIAL_ENTRIES = 0
SESSION_MUTATIONS = 0
LOCAL_STORAGE_INJECTIONS = 0
MUTATION_CLICKS = 0
TOTAL_MUTATIONS = 0
BUILDS_AND_TEST_RERUNS = 0
SOURCE_TEST_CONFIG_DEPENDENCY_DIST_CHANGES = 0
HISTORY_REWRITE = 0
ZERO_WRITE_FAIL_CLOSED = ENFORCED
READ_ONLY_ENFORCEMENT = ENFORCED
```

---

## 3. Detailed UAT-03 Verification Cases

### UAT03-01: Record Identity, Persisted Revision & Stability Check
- **Objective:** Verify record identity (`$id = 15`), persisted revision (`$revision = 1`), and workflow state (`Status = 01 Draft Objective`) against native and custom UI, confirming zero drift across baseline and stability checks.
- **Persisted REST API Evidence (`GET /k/v1/record.json?app=794&id=15`):**
  - `$id`: `15`
  - `$revision`: `1`
  - `Status`: `01 Draft Objective`
  - `Created_datetime`: `2026-09-13T11:42:00Z`
  - `Updated_datetime`: `2026-09-13T11:42:00Z`
- **Rendered DOM & UI Comparison:**
  - Browser URL: `https://ttmet.cybozu.com/k/794/show#record=15`
  - Breadcrumb: `App: MBO V2 Sandbox / Record: FY2026`
  - Process Transition Button: `Submit Objective to Manager`
  - Native Status Badge: `01 Draft Objective`
  - Stepper Card 1: `1. เป้าหมาย / Objectives [ Current / ปัจจุบัน ] (76 days overdue)`
  - Form Header Badge: `01 Draft Objective`
- **Stability Check (Call 1 vs Call 2 / DOM):**
  - `$revision` remained unchanged at `1`.
  - All field values remained 100% identical between Call 1 baseline and in-memory DOM record.
  - Zero background mutation occurred during the entire observation window.
- **Verdict:** **PASS**

---

### UAT03-02: Persisted Routing Topology & Approver Actors vs Rendered UI Route Cards
- **Objective:** Inspect stored routing topology, requester, appraiser actors, and approval rules in App 794; compare against rendered UI route cards.
- **Persisted REST API Data:**
  - `Routing_Topology`: `M1_G1`
  - `Requester_User`: `Actor_Requester` (Account: `tmh`)
  - `Manager_Level1_Approvers`: `[{"code": "chatrawee", "name": "Ms.Chatrawee"}]` (`Actor_Mgr1`)
  - `Manager_Level1_Approval_Rule`: `ALL`
  - `Manager_Level2_Approvers`: `[]` (unassigned)
  - `Manager_Level2_Approval_Rule`: `ALL`
  - `GM_Level1_Approvers`: `[{"code": "pattama", "name": "Ms.Pattama"}]` (`Actor_Mgr2` - acting in 2nd appraiser slot)
  - `GM_Level1_Approval_Rule`: `ALL`
  - `GM_Level2_Approvers`: `[]` (unassigned)
  - `GM_Level2_Approval_Rule`: `ALL`
- **Rendered UI Route Cards:**
  - Header: `Technical Details: M1_G1 (2 Slots) | Pos: Accounting Staff | Sec: TMH3 | Rule: TMH3`
  - Card 1: `พนักงาน / Employee: Actor_Requester [กำลังดำเนินการ / Current]`
  - Card 2: `ผู้ประเมินลำดับที่ 1 / 1st Appraiser: Actor_Mgr1 [รอดำเนินการ / Waiting]`
  - Card 3: `ผู้ประเมินลำดับที่ 2 / 2nd Appraiser: Actor_Mgr2 [รอดำเนินการ / Waiting]`
  - Card 4: `HR Final Check / HR Final / HR Admin: ฝ่ายทรัพยากรบุคคล / HR Control Center [รอดำเนินการ / Waiting]`
- **Comparison & Actor Topology Findings:**
  - 1 user per slot: Verified (`Actor_Requester`, `Actor_Mgr1`, `Actor_Mgr2`, `Actor_HR`).
  - Approval rules: Both Manager and GM approval rules are persisted as `ALL`.
  - Sequential progression: Requester is current; 1st Appraiser, 2nd Appraiser, and HR Final are in waiting state.
  - Slot mapping: In `M1_G1` (2 Slots), `GM_Level1_Approvers` serves as the 2nd appraiser slot in the workflow progression, perfectly aligned with the technical header.
- **Verdict:** **PASS**

---

### UAT03-03: Persisted Provenance & Stage Snapshot Contract (Decision 008 Analysis)
- **Objective:** Verify persisted provenance fields (`Frozen_Profile_Code`, `K_expected_Snapshot`, `Effective_Routing_Key`, `Effective_Route_Version_Key`, `Effective_Scorer_Slots_Snapshot`) and evaluate compliance under Decision 008 (`OWNER_DEC_D3_008`) and policy `DEFER_REQUIREDNESS_NO_BACKFILL`.
- **Persisted REST API Evidence:**
  - `Frozen_Profile_Code`: `"PROF_STAFF_CHIEF"`
  - `K_expected_Snapshot`: `2`
  - `Effective_Routing_Key`: `"TMH3"`
  - `Effective_Route_Version_Key`: `"TMH3#v1"`
  - `Effective_Scorer_Slots_Snapshot`: `"[1,2]"`
- **Contractual & Architectural Findings:**
  - *Provenance Population:* Unlike historical pre-migration records where fields might have been unpopulated, Record 15 has all 5 provenance and snapshot fields persisted in App 794 database storage at initial creation (Revision 1).
  - *Profile Binding:* `Frozen_Profile_Code` is bound to `PROF_STAFF_CHIEF`, defining the evaluation structure and weight rules for staff/chief level.
  - *Routing Master Binding:* `Effective_Routing_Key` (`TMH3`) and `Effective_Route_Version_Key` (`TMH3#v1`) record the exact version of the routing rule applied from App 795.
  - *Scorer Snapshot:* `K_expected_Snapshot = 2` and `Effective_Scorer_Slots_Snapshot = [1,2]` bind the required 2 scorer slots directly to the record.
  - *Decision 008 Compliance:* Decision 008 mandates App 794 as the bound active-stage snapshot authority. The presence of these persisted fields confirms that Record 15 holds its own immutable snapshot rather than relying on unpinned dynamic lookups.
  - *DEFER_REQUIREDNESS_NO_BACKFILL Context:* The exemption policy guarantees existing records without backfilled data are not invalidated, but for freshly created records, binding at creation is verified as functioning as designed.
- **Verdict:** **PASS**

---

### UAT03-04: Runtime Observation Limits, Console Audit & Date Simulation
- **Objective:** Audit DevTools console for runtime stability, document observation boundaries, and analyze simulated business date vs real clock time.
- **DevTools Console Audit:**
  - Context: Google Chrome PID `30516`, DevTools docked to right.
  - Total Recorded Issues: 22 issues (non-fatal browser/SameSite warnings).
  - Hidden Console Entries: 2 hidden.
  - Application Errors: **0**. Zero unhandled exceptions or runtime errors originating from `desktop-bundle.js` or `desktop-bundle.css`.
  - Synthetic Console Entry: 1 CLI evaluation error (`ReferenceError: copy is not defined` from asynchronous promise evaluation attempt; resolved by top-level console execution).
- **Date Simulation vs Real Clock:**
  - Execution Date: `2026-09-13` ICT
  - Simulated Business Clock: `2026-06-15` (displayed on UI stepper badge)
  - Objective Due Date: `2026-03-31`
  - Overdue Calculation: June 15, 2026 minus March 31, 2026 = exactly 76 days overdue (`1. เป้าหมาย: เกินกำหนด 76 วัน / 76 DAYS OVERDUE`).
  - Finding: All UI urgency banners, countdown indicators, and stage availability badges operate strictly against the simulated business clock (`2026-06-15`), demonstrating correct temporal decoupling.
- **Verdict:** **PASS**

---

## 4. Summary of UAT-03 Verification Outcomes

| Case ID | Test Scope | Persisted vs UI Outcome | Status | Finding & Evidence Rationale |
|:---:|:---|:---|:---:|:---|
| `UAT03-01` | Record ID, Persisted Revision & Stability | ID 15, Revision 1, Status 01 Draft Objective match UI exactly; 0 drift across calls | **PASS** | Persisted REST API payload confirmed ID 15, Revision 1. Both native status bar and custom UI stepper match. Call 1 vs Call 2 / DOM stability confirmed zero drift. |
| `UAT03-02` | Persisted Routing Topology & Approver Actors vs UI Cards | M1_G1 topology, Requester + 2 Appraiser slots + HR Admin match UI cards | **PASS** | Persisted fields (`Routing_Topology = M1_G1`, `Manager_Level1_Approvers = chatrawee`, `GM_Level1_Approvers = pattama`) match the 4 rendered UI route cards. Sequential progression and 1-user-per-slot verified. |
| `UAT03-03` | Persisted Provenance & Stage Snapshot Contract | Frozen Profile, Routing Keys, and Scorer Snapshot [1,2] persisted in App 794 | **PASS** | All 5 provenance/snapshot fields (`PROF_STAFF_CHIEF`, `TMH3`, `TMH3#v1`, `2`, `[1,2]`) are persisted in App 794 at Revision 1, satisfying Decision 008 snapshot authority. |
| `UAT03-04` | Runtime Console Audit & Temporal Simulation | 0 app runtime errors; Simulated date 2026-06-15 drives 76-day overdue banner | **PASS** | Clean console audit confirmed 0 application errors. Urgency math (`2026-06-15` vs `2026-03-31` = 76 days) operates strictly on simulated clock. |

---

## 5. Visual Evidence Artifacts & Cryptographic Digests

All visual artifacts have been sanitized per privacy governance. Real names, employee IDs, personal account codes, and profile avatars have been opaquely redacted (`rgba(0,0,0,255)` solid black rectangles).

| File Name | Byte Length | SHA-256 Digest | Description & Verification Tokens |
|:---|:---:|:---|:---|
| [`D3_UAT03_01_RECORD_IDENTITY_AND_TOP_UI.png`](file:///C:/Users/allda/Desktop/Dev/git/MBO2026/project-docs/evidence/D3_SBX_UAT_03/D3_UAT03_01_RECORD_IDENTITY_AND_TOP_UI.png) | 85,675 bytes | `C485EF2AC4F49549DF675E0E165238A9A9076E1112E23817148D377D64EBEF06` | Top view of Record 15: URL bar (`#record=15`), Breadcrumb (`FY2026`), Status `01 Draft Objective`, Process action `Submit Objective to Manager`, 5-stage stepper, 76-day overdue urgency banner. Profile redacted. |
| [`D3_UAT03_02_PERSISTED_ROUTE_ACTORS_UI.png`](file:///C:/Users/allda/Desktop/Dev/git/MBO2026/project-docs/evidence/D3_SBX_UAT_03/D3_UAT03_02_PERSISTED_ROUTE_ACTORS_UI.png) | 51,758 bytes | `4B04B3589ABCA79DDF2C5298B6FCA0E0A46D6B32671FC406AFB60917A1851105` | Close-up of Step 2 Employee Info (`TMH3`, `Accounting Staff`, `Corporate`, `2024-10-01`) and M1_G1 route cards (`Employee`, `1st Appraiser`, `2nd Appraiser`, `HR Final Check`). PII opaquely redacted. |
| [`D3_UAT03_03_PART_A_MBO_OBJECTIVES_TABLE.png`](file:///C:/Users/allda/Desktop/Dev/git/MBO2026/project-docs/evidence/D3_SBX_UAT_03/D3_UAT03_03_PART_A_MBO_OBJECTIVES_TABLE.png) | 81,540 bytes | `9C7FD13E21E505D41A8C9F2BEA6CA90826E8727CCDC629DD476EE1F91C66B95B` | Step 3 Part A MBO table showing 4 objectives, weights (30%, 30%, 30%, 10%), Total Weight banner (100% Complete), native comments mirror, and audit trail (0 events). |
| [`D3_UAT03_04_DEVTOOLS_RUNTIME_AUDIT.png`](file:///C:/Users/allda/Desktop/Dev/git/MBO2026/project-docs/evidence/D3_SBX_UAT_03/D3_UAT03_04_DEVTOOLS_RUNTIME_AUDIT.png) | 135,157 bytes | `5EFC8CBDF1D91B88968C90BFCFCDC717E6AFBE512C5184B33D1BC6A4F9837DBE` | Docked Chrome DevTools console showing executed GET calls, `CALL1_STORED_SUCCESS`, zero application exceptions, 22 issues, 2 hidden. |

---

## 6. Strict Non-Claims & Governance
```text
FULL_REPOSITORY_INTEGRATION_TEST = NOT CLAIMED
FULL_D3_BUSINESS_UAT = NOT CLAIMED
D3_CLOSURE = NOT CLAIMED
PRODUCTION_READY = NO
UAT03_INDEPENDENT_REVIEW = NOT CLAIMED (AWAITING OWNER / CONTROL PLANE REVIEW)
```

---

## 7. Terminal Governance State
```text
RESULT = DELIVERED / REVIEW REQUIRED
ACTIVE_WORK_PACKAGE = NONE
NEXT_GATE_AUTHORIZED = NO
AUTO_START_NEXT_WORK_PACKAGE = NO
KINTONE_READ_AUTHORIZED = NO
KINTONE_WRITE_AUTHORIZED = NO
PROCESS_WRITE_AUTHORIZED = NO
DEPLOYMENT_AUTHORIZED = NO
UAT_AUTHORIZED = NO
PRODUCTION_READY = NO
```
