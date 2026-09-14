# D3-SBX-UAT-04-R1 Evidence Record

Updated: 2026-09-14 ICT

## 1. Package & Execution Metadata
```text
PACKAGE = D3-SBX-UAT-04-R1
TITLE = EXACT CAPTURE CORRECTIVE + BOUNDED READ-ONLY BASELINE VERIFICATION
AUTHORIZATION_ID = MBO2026-D3-SBX-UAT04-R1-20260914-OWNER-01
OWNER_APPROVAL = “อนุใัติ” หมายถึงอนุมัติข้อเสนอ D3-SBX-UAT-04-R1 ที่รออยู่เพียงงานเดียว
MODE = EXACT CAPTURE CORRECTIVE + BOUNDED READ-ONLY BASELINE VERIFICATION
EXACT_AUTHORIZED_BASE_HEAD = d493374d541c3458258f95b4a65632bddac85375
BASE_PARENT = ab1b6c21a1e2b8e2cb0b135fe0bb0eed7bb1fbe3
BASE_TREE = b1c8c2bd8f8415c27b5ce06f3d9aee9f1e55ed07
BASE_MESSAGE = docs(d3): record D3-SBX-UAT-04 baseline execution stop and sync control
EXECUTION_PLANE = ANTIGRAVITY CLI
ORCHESTRATION_CHANNEL = HERMES (ORCHESTRATOR ONLY)
TARGET_APP = 794
TARGET_RECORD_ID = 15
TARGET_RECORD_URL = https://ttmet.cybozu.com/k/794/show#record=15
RESULT = REQUEST CORRECTIVE / CONTROL PLANE REVIEWED (SUPERSEDED BY R2)
```

> **Owner Authorization Scope Note:**
> Authorized under `MBO2026-D3-SBX-UAT04-R1-20260914-OWNER-01` in mode `EXACT CAPTURE CORRECTIVE + BOUNDED READ-ONLY BASELINE VERIFICATION` on canonical base HEAD `d493374d541c3458258f95b4a65632bddac85375`.
> Target: App 794 existing saved record ID 15 only in Owner-authenticated normal browser session, Detail View only.
> Scope: Fix ONLY capture-script transport/quoting defect that removed literal `$revision` during PowerShell interpolation. Execute 6 local preflight checks with zero live Kintone calls.
> Read budget: Explicit REST API GET attempts <= 2 total (`GET 1 = /k/v1/record.json?app=794&id=15` fresh initial baseline, `GET 2 = same endpoint` final stability check), `READ_RETRIES = 0`.
> In-memory client capture: `kintone.app.record.get()` once as client in-memory data (distinct from REST response).
> Zero Kintone mutations, zero writes, zero record creations, zero process transitions, zero schema changes, zero deployments.

---

## 2. Hard Operational Accounting & Ceiling Compliance
```text
EXPLICIT_REST_GET_ATTEMPTS = 2 (Attempt 1: initial baseline, Attempt 2: final stability check; CEILING: 2 max; ENFORCED)
EXPLICIT_REST_GET_SUCCESSES = 2
READ_RETRIES = 0 (CEILING: 0 max; ENFORCED)
AUXILIARY_REST_READS = 0
CLIENT_IN_MEMORY_CAPTURES = 1 (kintone.app.record.get() - captured once; NOT a REST request)
KINTONE_API_WRITES = 0 (CEILING: 0 max)
KINTONE_IO_MUTATIONS = 0 (Historical R1 executor report: 2 explicit REST GET attempts, 1 client in-memory capture, 0 writes/mutations; total browser network traffic NOT claimed to be 2, native/background browser requests NOT claimed to be 0)
RECORD_CREATIONS = 0
RECORD_WRITES = 0
SCHEMA_WRITES = 0
PROCESS_WRITES = 0
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
TOTAL_BROWSER_REQUESTS_NOTE = Explicit REST accounting (2 explicit GETs) separated from native/background browser traffic
R2_CORRECTIVE_STATUS = SUPERSEDED BY R2 / ZERO LIVE I/O
FORWARD_ONLY_PRIVACY_NOTE = Forward-only helper/text updates do not erase data from historical Git commits; NO history rewrite
```

---

## 3. Exact Local Corrective & Preflight Verification

### Root Cause Analysis of UAT-04 Capture Defect
In package `D3-SBX-UAT-04`, the dispatch script embedded JavaScript within a PowerShell double-quoted here-string (`@" ... "@`). When PowerShell processed the string, the unescaped token `$revision` was treated as an undefined PowerShell variable and expanded to an empty string `""`. Consequently, the JavaScript delivered to Chrome DevTools contained:
```javascript
revision: r.record ? (r.record. ? r.record..value : null) : null
```
The V8 engine immediately threw `Uncaught SyntaxError: Unexpected token '?' (at VM554:19:117)` prior to network transmission, causing Attempt 1 to abort fail-closed.

### Exact Local Corrective Implementation
1. **Isolated Capture Scripts:** Created discrete, standalone JavaScript files (`capture_get1.js`, `capture_client.js`, `capture_get2.js`) under `project-docs/evidence/D3_SBX_UAT_04_R1/`.
2. **Verbatim Transport:** Implemented `dispatch_runner.ps1` to read the exact UTF-8 file contents from disk via `[System.IO.File]::ReadAllText()` without any string template expansion or PowerShell variable interpolation.
3. **Pre-Dispatch Integrity Verification:** Prior to any console clipboard transfer, `dispatch_runner.ps1` verifies the SHA-256 digest of the script against its pre-computed invariant.

### Preflight Verification Results (Zero Live Kintone Calls)
> **Historical Preflight Note:** The local preflight results below reflect execution of the original R1 helper scripts during package R1. Modified helper files under R2 have updated digests/lengths (`test_preflight_verification.cjs`: 8,536 bytes / SHA-256 `A5D65F39CB15D45B0E2B45C578E8A8BEF3157CDE9727AD947F96FEF144405AB3`; `dispatch_runner.ps1`: 12,321 bytes / SHA-256 `2E64E59A6087E7F70CF31E5469B7A49B2A0B9A6D4DA1951C930550E885A4F836`) and are NOT claimed to have been rerun against live or local runners under R2 (HARD ZERO-EXECUTION BOUNDARY).

The test suite `project-docs/evidence/D3_SBX_UAT_04_R1/test_preflight_verification.cjs` was executed locally via Node.js:
1. **Final Script Production:** Scripts `capture_get1.js` (2,015 bytes), `capture_client.js` (1,591 bytes), and `capture_get2.js` (2,015 bytes) produced.
2. **Syntax Check:** Evaluated via `vm.Script` compilation in isolated sandbox:
   - `capture_get1.js`: **PASS** (zero syntax errors)
   - `capture_client.js`: **PASS** (zero syntax errors)
   - `capture_get2.js`: **PASS** (zero syntax errors)
3. **Literal Field Reference & Target Verification:**
   - `capture_get1.js` contains literal `r.record.$revision`, `r.record.$id`, `app: 794`, `id: 15`, `/k/v1/record.json?app=794&id=15`, `uat04_r1_get1_record.json` (**PASS**).
   - `capture_client.js` contains literal `rec.record.$revision`, `rec.record.$id`, `app: 794`, `id: 15`, `uat04_r1_client_record.json` (**PASS**).
   - `capture_get2.js` contains literal `r.record.$revision`, `r.record.$id`, `app: 794`, `id: 15`, `/k/v1/record.json?app=794&id=15`, `uat04_r1_get2_record.json` (**PASS**).
4. **Mocked Execution & Export Verification:** Exercised with synthetic record (`$id: '15'`, `$revision: '2'`, 13 typed fields):
   - GET 1 mock execution: **PASS** (exported `uat04_r1_get1_record.json`, attempt=1, recordId=15, revision=2).
   - Client In-Memory mock execution: **PASS** (exported `uat04_r1_client_record.json`, source=kintone.app.record.get(), recordId=15, revision=2).
   - GET 2 mock execution: **PASS** (exported `uat04_r1_get2_record.json`, attempt=2, recordId=15, revision=2).
5. **Artifact Distinctness & Type Preservation:**
   - All three mock payloads confirmed distinct in attempt numbers, source designations, and timestamps (**PASS**).
   - Field types (e.g. `Effective_Scorer_Slots_Snapshot` string representation `"[1,2]"`) preserved verbatim (**PASS**).
6. **Script Digests Recorded (Original R1 Baseline):**
   - `capture_get1.js`: `0bffbf7c91e968662164778b7a1404d1a79f1bf7883b614430bae4c602843fd3`
   - `capture_client.js`: `34e679eb5635519c73332839046f2ff378ad35367f6d78c2314bf2269f17113a`
   - `capture_get2.js`: `7bb6c989779e7f52e90c2fd3a6906875c1c0f8639b6a0dc319c96ca32e495ca8`

---

## 4. Chronicle of Bounded Live Execution

### Phase 1: Environment & Session Attach
1. Verified clean Git worktree on canonical branch `ai/antigravity-wp002c` at authorized base commit `d493374d541c3458258f95b4a65632bddac85375`.
2. Attached to live Owner-authenticated Chrome session (PID 30516) on `WinSta0\Default`.
3. Verified target window `HWND: 0x130EBA`:
   - URL: `https://ttmet.cybozu.com/k/794/show#record=15`
   - View: Detail View (not edit, not create).
   - Target: App 794, Record 15.

### Phase 2: Attempt 1 / Initial REST Capture (GET 1)
1. Recorded before dispatch: `ATTEMPT=1, ENDPOINT=/k/v1/record.json?app=794&id=15, PRE_UTC=2026-09-14T04:34:18.100Z`.
2. Dispatched verified `capture_get1.js` payload via console.
3. Received HTTP 200 response at `POST_UTC=2026-09-14T04:34:20.552Z`.
4. Successfully exported `uat04_r1_get1_record.json` (32,452 bytes, raw SHA-256 `edd7296bdc2f56f92fb39774c67263483cf7bc32526f89e8864b5768434ad37e`).
5. Verified initial baseline: Record ID = 15, `$revision` = `1`, Status = `01 Draft Objective`.

### Phase 3: Client In-Memory Capture
1. Recorded before dispatch: `SOURCE=kintone.app.record.get(), PRE_UTC=2026-09-14T04:34:30.980Z`.
2. Dispatched verified `capture_client.js` payload via console (zero REST API calls).
3. Retrieved in-memory object at `CAPTURED_UTC=2026-09-14T04:34:32.794Z`.
4. Successfully exported `uat04_r1_client_record.json` (32,389 bytes, raw SHA-256 `5d640a075d8764fb6fa0032632b349eea0c13fa351c9aa1e670ea97951cc3dda`).
5. Verified client in-memory state: Record ID = 15, `$revision` = `1`.

### Phase 4: Independent Rendered UI Observations & Comparison
1. Captured actual rendered DOM state via high-resolution window screenshots (`uat04_r1_get2_screen.png`).
2. Compared published 20 scoped fields between REST GET 1 and Client In-Memory captures:
   - All 20 published fields match semantically (0 mismatches across published excerpt).
3. Compared rendered UI route cards against persisted approvers:
   - Rendered M1_G1 route cards (Employee, 1st Appraiser, 2nd Appraiser, HR Final Check) correspond in topology structure to persisted approver arrays.
   - Actor identities are opaquely masked in screenshots for privacy and are NOT independently verified against REST. Full actor-identity equality from masked UI cards is NOT claimed.
   - Statuses `[กำลังดำเนินการ / Current]` and `[รอดำเนินการ / Waiting]` represent rendered UI component state only; workflow progression was NOT triggered or tested.

### Phase 5: Attempt 2 / Final Stability Check (GET 2)
1. Recorded before dispatch: `ATTEMPT=2, ENDPOINT=/k/v1/record.json?app=794&id=15, PRE_UTC=2026-09-14T04:35:29.070Z`.
2. Dispatched verified `capture_get2.js` payload via console.
3. Received HTTP 200 response at `POST_UTC=2026-09-14T04:35:29.293Z`.
4. Successfully exported `uat04_r1_get2_record.json` (32,452 bytes, raw SHA-256 `3dc205aa593d02fa1519e181bb4f5a1a212be02b9bf0abd98adb94de68525865`).

### Phase 6: Two-REST Stability Comparison (GET 1 vs GET 2)
1. Field comparison:
   - Published scoped fields independently verified from Git: 20 / 20 **MATCH** (0 mismatches).
   - Additional 22 scoped fields and 350 total record fields match claims: Labelled as EXECUTOR-REPORTED / LOCAL-ONLY (not independently verifiable from Git as full raw records are not published).
   - JSON semantic equality of published fields is verified; whole-file bit-for-bit identity across the entire raw JSON payload is NOT claimed.
2. Stability verdict: Scoped stability verified across 20 published fields during captured interval. Zero drift, zero mutations.

---

## 5. Evidence-Bounded Verification Outcomes

### UAT04-01: Record Identity, Persisted Revision & Stability Check
- **Target Record:** App 794, Record ID 15.
- **Persisted REST Baseline (GET 1):** Record ID = `15`, Status = `01 Draft Objective`, `$revision` = `1`.
- **Client In-Memory Capture:** Record ID = `15`, Status = `01 Draft Objective`, `$revision` = `1`.
- **Persisted REST Stability Check (GET 2):** Record ID = `15`, Status = `01 Draft Objective`, `$revision` = `1`.
- **Comparison Findings:**
  - REST GET 1 vs Client In-Memory: 20 published scoped fields match semantically ($id: `"15"`, $revision: `"1"`, Status: `"01 Draft Objective"`).
  - Two-REST Stability (GET 1 vs GET 2): 20 published scoped fields match semantically across the captured interval with revision stable at `1`.
  - Full 350-Field Equality Claim: Labelled strictly as EXECUTOR-REPORTED / LOCAL-ONLY and NOT independently verified from Git (full raw records are not committed to repository). Whole-file bit-for-bit identity is NOT claimed.
- **Rendered UI Observations:**
  - URL bar confirms: `https://ttmet.cybozu.com/k/794/show#record=15`.
  - Breadcrumb confirms: `App: MBO V2 Sandbox / Record: FY2026`.
  - Native Status Badge: `01 Draft Objective`.
  - Action Button: `Submit Objective to Manager`.
  - 5-Stage Stepper: `1. เป้าหมาย / Objectives [ Current / ปัจจุบัน ] (76 days overdue)`.
- **Historical Revision Note:** Fresh R1 data proves current persisted revision is `1`. This does NOT retroactively reconcile past packages (historical UAT03 revision 1 vs 2 discrepancy remains UNVERIFIED).
- **Verdict:** **PARTIAL / 20 SCOPED FIELDS BASELINE VERIFIED ($rev=1); 350-FIELD TOTAL EQUALITY EXECUTOR-REPORTED ONLY; REVISION RECONCILIATION UNVERIFIED**

---

### UAT04-02: Persisted Routing Topology & Approver Actors vs Rendered UI Route Cards
- **Persisted Approver Arrays & Topology (REST GET 1, Client, GET 2):**
  - `Routing_Topology`: `M1_G1` (`SINGLE_LINE_TEXT`)
  - `Requester_User`: `[{"code": "Requester"}]` (Employee)
  - `Manager_Level1_Approvers`: `[{"code": "Approver 1"}]` (1st Appraiser)
  - `Manager_Level1_Approval_Rule`: `ALL` (`DROP_DOWN`)
  - `GM_Level1_Approvers`: `[{"code": "GM Approver 1"}]` (2nd Appraiser)
  - `GM_Level1_Approval_Rule`: `ALL` (`DROP_DOWN`)
  - `Manager_Level2_Approvers`: `[]` (empty array)
  - `Manager_Level2_Approval_Rule`: `ALL` (`DROP_DOWN`)
  - `GM_Level2_Approvers`: `[]` (empty array)
  - `GM_Level2_Approval_Rule`: `ALL` (`DROP_DOWN`)
- **Rendered UI Observations:**
  - Route header text: `Technical Details: M1_G1 (2 Slots) | Pos: Accounting Staff | Sec: TMH3 | Rule: TMH3 | ...`
  - Step 2 Employee Info: Section `TMH3`, Position `Accounting Staff`, Department `Corporate`.
  - Route Cards:
    - Card 1: `พนักงาน / Employee: [กำลังดำเนินการ / Current]`
    - Card 2: `ผู้ประเมินลำดับที่ 1 / 1st Appraiser: [รอดำเนินการ / Waiting]`
    - Card 3: `ผู้ประเมินลำดับที่ 2 / 2nd Appraiser: [รอดำเนินการ / Waiting]`
    - Card 4: `HR Final Check / HR Final / HR Admin: ฝ่ายทรัพยากรบุคคล / HR Control Center [รอดำเนินการ / Waiting]`
- **Actor Identity & Workflow Boundaries:**
  - Actor identities in screenshots are opaquely masked for privacy and are NOT independently verified against REST. Full actor-identity equality from masked UI cards is NOT claimed.
  - Workflow progression was **NOT TESTED**. The displayed badges `[กำลังดำเนินการ / Current]` and `[รอดำเนินการ / Waiting]` prove UI component rendering only and do not constitute proof of active workflow execution.
- **Verdict:** **PARTIAL / TOPOLOGY PERSISTENCE & UI RENDERING OBSERVED; ACTOR IDENTITY IN MASKED UI NOT INDEPENDENTLY VERIFIED; WORKFLOW PROGRESSION NOT TESTED**

---

### UAT04-03: Persisted Provenance & Stage Snapshot Contract (Decision 008)
- **Persisted Snapshot Fields (REST GET 1, Client, GET 2):**
  - `Frozen_Profile_Code`: `PROF_STAFF_CHIEF` (`SINGLE_LINE_TEXT`)
  - `K_expected_Snapshot`: `2` (`NUMBER`)
  - `Effective_Routing_Key`: `TMH3` (`SINGLE_LINE_TEXT`)
  - `Effective_Route_Version_Key`: `TMH3#v1` (`SINGLE_LINE_TEXT`)
  - `Effective_Scorer_Slots_Snapshot`: `[1,2]` (`SINGLE_LINE_TEXT`)
- **Form UI Display Observation:** Provenance snapshot fields are backend persistence fields and are **NOT DISPLAYED** in the standard user form view.
- **Persistence Verification:** Verified present, populated, and identical across initial REST GET 1, Client In-Memory, and final REST GET 2 captures (20 published fields).
- **Decision 008 Runtime Compliance Boundary:** Dynamic query suppression, immutable snapshot freezing on transition, and full Decision 008 runtime lifecycle behavior were **NOT TESTED** under this read-only package.
- **Verdict:** **PASS / FIVE PROVENANCE FIELDS PERSISTENCE VERIFIED; DYNAMIC RUNTIME QUERY SUPPRESSION NOT TESTED**

---

### UAT04-04: Runtime Audit, Console Limits & Business Date Simulation
- **DevTools Console Audit:**
  - Zero visible unhandled application runtime errors from `desktop-bundle.js` or `desktop-bundle.css` in inspected screenshot.
  - Console findings are strictly limited to visible inspected evidence; zero errors across entire session or hidden messages NOT CLAIMED.
  - Clean dispatch and resolution of test script payloads observed in screenshot.
- **Business Date Simulation Observation:**
  - Overdue banner displays: `1. เป้าหมาย เกินกำหนด 76 วัน — กรุณาดำเนินการโดยเร็ว / 76 DAYS OVERDUE` relative to stage due date `2026-03-31`.
  - Drives calculation from simulated business date `2026-06-15`.
- **Temporal Decoupling Boundary:** System-wide temporal decoupling is **NOT CLAIMED**; simulation behavior was observed on the Stage 1 banner only.
- **Verdict:** **PARTIAL / ZERO VISIBLE APPLICATION ERRORS IN INSPECTED SCREENSHOT; DATE SIMULATION OBSERVED ON STAGE 1 BANNER; SYSTEM-WIDE TEMPORAL DECOUPLING NOT CLAIMED**

---

## 6. Verification Outcome Summary Table

| Case ID | Test Scope | Supported Evidence Findings | Limitations / Boundaries | Verdict |
|:---:|:---|:---|:---|:---:|
| `UAT04-01` | Record ID, Persisted Revision & Stability | URL `#record=15`, Status `01 Draft Objective`, Stepper, Action button observed in UI. GET 1, Client, and GET 2 all confirm `$revision = 1`. Scoped comparison matches 20 published fields. | Full 350-field equality executor-reported only; does not retroactively reconcile historical UAT03 revision discrepancy | **PARTIAL / 20 SCOPED FIELDS BASELINE VERIFIED ($rev=1); 350-FIELD TOTAL EQUALITY EXECUTOR-REPORTED ONLY; REVISION RECONCILIATION UNVERIFIED** |
| `UAT04-02` | Routing Topology & Approver Actors vs UI Cards | M1_G1 topology, Requester + 2 Appraiser slots + HR Admin persisted and rendered in UI route cards. | Actor identities in masked UI cards not independently verified against REST; workflow progression NOT TESTED | **PARTIAL / TOPOLOGY PERSISTENCE & UI RENDERING OBSERVED; ACTOR IDENTITY IN MASKED UI NOT INDEPENDENTLY VERIFIED; WORKFLOW PROGRESSION NOT TESTED** |
| `UAT04-03` | Persisted Provenance & Stage Snapshot Contract | Five target provenance fields (`Frozen_Profile_Code`, `K_expected_Snapshot`, `Effective_Routing_Key`, `Effective_Route_Version_Key`, `Effective_Scorer_Slots_Snapshot`) verified persisted and identical. | Snapshot fields not displayed in form UI; Decision 008 runtime query suppression NOT TESTED | **PASS / FIVE PROVENANCE FIELDS PERSISTENCE VERIFIED; DYNAMIC RUNTIME QUERY SUPPRESSION NOT TESTED** |
| `UAT04-04` | Runtime Audit & Business Date Simulation | 0 visible application bundle errors in inspected DevTools screenshot; Simulated date 2026-06-15 drives 76-day overdue banner calculation. | Console limits qualified to inspected view; system-wide temporal decoupling NOT CLAIMED | **PARTIAL / ZERO VISIBLE APPLICATION ERRORS IN INSPECTED SCREENSHOT; DATE SIMULATION OBSERVED ON STAGE 1 BANNER; SYSTEM-WIDE TEMPORAL DECOUPLING NOT CLAIMED** |

---

## 7. Visual Evidence Artifacts & Cryptographic Digests (Sanitized)

All visual artifacts are strictly sanitized per privacy governance. Real names, employee IDs, personal account codes, employee start dates, browser tabs, bookmarks, extensions, personal Telegram notifications, and user profile icons have been opaquely redacted (`#000000` solid black rectangles). All links resolve repository-relative from file location.

| File Name | Byte Length | SHA-256 Digest | Description & Verification Tokens |
|:---|:---:|:---|:---|
| [D3_UAT04_R1_01_RECORD_IDENTITY_AND_TOP_UI.png](D3_SBX_UAT_04_R1/D3_UAT04_R1_01_RECORD_IDENTITY_AND_TOP_UI.png) | 76,510 bytes | `9E3F2292F4A8F7F28C556772B6FBDCBD3F340F059DF610BAAAC113C0BA7BC91C` | Top view of Record 15: URL bar (`https://ttmet.cybozu.com/k/794/show#record=15`), Breadcrumb, Status `01 Draft Objective`, Process action button, 5-stage stepper, 76-day overdue banner. Personal tabs, bookmarks, extensions, and profile opaquely redacted. |
| [D3_UAT04_R1_02_PERSISTED_ROUTE_ACTORS_UI.png](D3_SBX_UAT_04_R1/D3_UAT04_R1_02_PERSISTED_ROUTE_ACTORS_UI.png) | 57,532 bytes | `6983102C6AD5792F90A80E16C443802D490B68F1C7BB241B9E60B208A4704CA0` | Step 2 Employee Info (`TMH3`, `Accounting Staff`, `Corporate`), M1_G1 route header, and 4 route cards (`Employee`, `1st Appraiser`, `2nd Appraiser`, `HR Final Check`). EMP ID, Name, Start Date, and Actor Names opaquely redacted. |
| [D3_UAT04_R1_03_DEVTOOLS_EXECUTION_AUDIT.png](D3_SBX_UAT_04_R1/D3_UAT04_R1_03_DEVTOOLS_EXECUTION_AUDIT.png) | 274,835 bytes | `AFA82BCC4C606AC6BCED1F894E7A8EC175C8AA52B98C8DC493105D95FBBA5A26` | Docked Chrome DevTools console showing GET 2 dispatch, execution success, revision: 1, and download manager showing captured artifacts. Personal notifications opaquely redacted. |
| [D3_UAT04_R1_04_SESSION_INTEGRITY_AUDIT.png](D3_SBX_UAT_04_R1/D3_UAT04_R1_04_SESSION_INTEGRITY_AUDIT.png) | 326,491 bytes | `7D8F23C0143CAE7FCB9BE1F8918050E6C6FB2932DFA9776835FC1BFE542F7D50` | Full browser window context showing Record 15 Detail View on left and DevTools on right; URL `#record=15` verified; all personal tabs, bookmarks, extensions, PII, and notifications opaquely redacted. |

---

## 8. Captured Data Artifacts & Cryptographic Digests

### Delivery Directory Files (`project-docs/evidence/D3_SBX_UAT_04_R1/`)

| File Name | Byte Length | SHA-256 Digest | Classification & Description |
|:---|:---:|:---|:---|
| [capture_get1.js](D3_SBX_UAT_04_R1/capture_get1.js) | 2,015 bytes | `0BFFBF7C91E968662164778B7A1404D1A79F1BF7883B614430BAE4C602843FD3` | Initial REST API capture script for Attempt 1 |
| [capture_client.js](D3_SBX_UAT_04_R1/capture_client.js) | 1,591 bytes | `34E679EB5635519C73332839046F2FF378AD35367F6D78C2314BF2269F17113A` | Client in-memory capture script (`kintone.app.record.get()`) |
| [capture_get2.js](D3_SBX_UAT_04_R1/capture_get2.js) | 2,015 bytes | `7BB6C989779E7F52E90C2FD3A6906875C1C0F8639B6A0DC319C96CA32E495CA8` | Final stability REST API capture script for Attempt 2 |
| [test_preflight_verification.cjs](D3_SBX_UAT_04_R1/test_preflight_verification.cjs) | 8,536 bytes | `A5D65F39CB15D45B0E2B45C578E8A8BEF3157CDE9727AD947F96FEF144405AB3` | Local preflight test suite (sanitized mock test data under R2; historical execution belongs to R1 original) |
| [dispatch_runner.ps1](D3_SBX_UAT_04_R1/dispatch_runner.ps1) | 12,321 bytes | `2E64E59A6087E7F70CF31E5469B7A49B2A0B9A6D4DA1951C930550E885A4F836` | Console dispatch runner (sanitized paths with explicit parameters/script-relative paths under R2; NOT executed) |
| [D3_UAT04_R1_MINIMAL_SANITIZED_GET1_RECORD_15.json](D3_SBX_UAT_04_R1/D3_UAT04_R1_MINIMAL_SANITIZED_GET1_RECORD_15.json) | 2,871 bytes | `6DEA72256A7A4CE992B340238BC764461B7028DB31CF31A3984423BB6491C2CF` | Sanitized initial REST excerpt (Attempt 1, revision: 1) |
| [D3_UAT04_R1_MINIMAL_SANITIZED_CLIENT_RECORD_15.json](D3_SBX_UAT_04_R1/D3_UAT04_R1_MINIMAL_SANITIZED_CLIENT_RECORD_15.json) | 2,817 bytes | `9DB418F90C24524A6AAE963D7C5012D3CA795B58B4112BB8F46DAA39167FB55C` | Sanitized client in-memory excerpt (revision: 1) |
| [D3_UAT04_R1_MINIMAL_SANITIZED_GET2_RECORD_15.json](D3_SBX_UAT_04_R1/D3_UAT04_R1_MINIMAL_SANITIZED_GET2_RECORD_15.json) | 2,897 bytes | `5E762BE2BBBBDA8623EC9D8B02C4793C059B64AE2B96F8714DFDFAED2811ACFE` | Sanitized final stability REST excerpt (Attempt 2, revision: 1) |

### Local Raw Captures (Retained Local-Only, Never Committed to Git)

| File Name | Byte Length | SHA-256 Digest | Status & Local Location |
|:---|:---:|:---|:---|
| `raw_uat04_r1_get1_record.json` | 32,452 bytes | `EDD7296BDC2F56F92FB39774C67263483CF7BC32526F89E8864B5768434AD37E` | Local raw JSON capture of GET 1 response (Attempt 1) |
| `raw_uat04_r1_client_record.json` | 32,389 bytes | `5D640A075D8764FB6FA0032632B349EEA0C13FA351C9AA1E670EA97951CC3DDA` | Local raw JSON capture of Client In-Memory response |
| `raw_uat04_r1_get2_record.json` | 32,452 bytes | `3DC205AA593D02FA1519E181BB4F5A1A212BE02B9BF0ABD98ADB94DE68525865` | Local raw JSON capture of GET 2 response (Attempt 2) |

---

## 9. Scoped Field Comparison Table (GET 1 vs Client vs GET 2)

> **Evidence Boundary Note:** Independent Git verification is strictly limited to these 20 published fields. Full raw records containing 350 fields are retained local-only and not committed to Git; whole-file bit-for-bit identity across the entire raw JSON payload is NOT claimed.

| Field Code | Field Type | Persisted Value (GET 1) | Client Value (`kintone.app.record.get()`) | Stability Value (GET 2) | Comparison Status |
|:---|:---|:---|:---|:---|:---:|
| `$id` | `__ID__` | `"15"` | `"15"` | `"15"` | **MATCH** |
| `$revision` | `__REVISION__` | `"1"` | `"1"` | `"1"` | **MATCH** |
| `Status` | `STATUS` | `"01 Draft Objective"` | `"01 Draft Objective"` | `"01 Draft Objective"` | **MATCH** |
| `Routing_Topology` | `SINGLE_LINE_TEXT` | `"M1_G1"` | `"M1_G1"` | `"M1_G1"` | **MATCH** |
| `Requester_User` | `USER_SELECT` | `[{"code": "Requester"}]` | `[{"code": "Requester"}]` | `[{"code": "Requester"}]` | **MATCH** |
| `Manager_User` | `USER_SELECT` | `[{"code": "Approver 1"}]` | `[{"code": "Approver 1"}]` | `[{"code": "Approver 1"}]` | **MATCH** |
| `GM_User` | `USER_SELECT` | `[{"code": "GM Approver 1"}]` | `[{"code": "GM Approver 1"}]` | `[{"code": "GM Approver 1"}]` | **MATCH** |
| `Manager_Level1_Approvers` | `USER_SELECT` | `[{"code": "Approver 1"}]` | `[{"code": "Approver 1"}]` | `[{"code": "Approver 1"}]` | **MATCH** |
| `Manager_Level1_Approval_Rule` | `DROP_DOWN` | `"ALL"` | `"ALL"` | `"ALL"` | **MATCH** |
| `GM_Level1_Approvers` | `USER_SELECT` | `[{"code": "GM Approver 1"}]` | `[{"code": "GM Approver 1"}]` | `[{"code": "GM Approver 1"}]` | **MATCH** |
| `GM_Level1_Approval_Rule` | `DROP_DOWN` | `"ALL"` | `"ALL"` | `"ALL"` | **MATCH** |
| `Manager_Level2_Approvers` | `USER_SELECT` | `[]` | `[]` | `[]` | **MATCH** |
| `Manager_Level2_Approval_Rule` | `DROP_DOWN` | `"ALL"` | `"ALL"` | `"ALL"` | **MATCH** |
| `GM_Level2_Approvers` | `USER_SELECT` | `[]` | `[]` | `[]` | **MATCH** |
| `GM_Level2_Approval_Rule` | `DROP_DOWN` | `"ALL"` | `"ALL"` | `"ALL"` | **MATCH** |
| `Frozen_Profile_Code` | `SINGLE_LINE_TEXT` | `"PROF_STAFF_CHIEF"` | `"PROF_STAFF_CHIEF"` | `"PROF_STAFF_CHIEF"` | **MATCH** |
| `K_expected_Snapshot` | `NUMBER` | `"2"` | `"2"` | `"2"` | **MATCH** |
| `Effective_Routing_Key` | `SINGLE_LINE_TEXT` | `"TMH3"` | `"TMH3"` | `"TMH3"` | **MATCH** |
| `Effective_Route_Version_Key` | `SINGLE_LINE_TEXT` | `"TMH3#v1"` | `"TMH3#v1"` | `"TMH3#v1"` | **MATCH** |
| `Effective_Scorer_Slots_Snapshot` | `SINGLE_LINE_TEXT` | `"[1,2]"` | `"[1,2]"` | `"[1,2]"` | **MATCH** |

---

## 10. Strict Non-Claims & Governance
```text
WORKFLOW_PROGRESSION = NOT TESTED
FULL_DECISION_008_RUNTIME_COMPLIANCE = NOT CLAIMED
SYSTEM_WIDE_TEMPORAL_DECOUPLING = NOT CLAIMED
FULL_REPOSITORY_INTEGRATION_TEST = NOT CLAIMED
FULL_D3_BUSINESS_UAT = NOT CLAIMED
D3_CLOSURE = NOT CLAIMED
PRODUCTION_READY = NO
UAT04_R1_INDEPENDENT_REVIEW = NOT CLAIMED (AWAITING OWNER / CONTROL PLANE REVIEW)
```

---

## 11. Terminal Governance State
```text
PACKAGE = D3-SBX-UAT-04-R1
RESULT = REQUEST CORRECTIVE / CONTROL PLANE REVIEWED (SUPERSEDED BY R2)
ACTIVE_WORK_PACKAGE = NONE
NEXT_GATE_AUTHORIZED = NO
AUTO_START_NEXT_WORK_PACKAGE = NO
KINTONE_READ_AUTHORIZED = NO
KINTONE_WRITE_AUTHORIZED = NO
PROCESS_WRITE_AUTHORIZED = NO
DEPLOYMENT_AUTHORIZED = NO
UAT_AUTHORIZED = NO
PRODUCTION_READY = NO
REVIEW_REQUIRED = YES
```
