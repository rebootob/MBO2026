# D3-SBX-UAT-03-R1 Evidence Record

Updated: 2026-09-14 ICT

## 1. Package & Execution Metadata
```text
PACKAGE = D3-SBX-UAT-03-R1
TITLE = D3-SBX-UAT-03 CORRECTIVE EVIDENCE, HISTORICAL GET ACCOUNTING & PRIVACY SANITIZATION RECORD
AUTHORIZATION_ID = MBO2026-D3-SBX-UAT03-R1-20260913-OWNER-01
MODE = EXISTING EVIDENCE ACCOUNTING + PRIVACY + CONTROL CORRECTIVE ONLY
AUTHORIZED_BASE_HEAD = 70070c25b8f91effffafe8ff019a1273fbb3c27f
BASE_PARENT = 9fcb290284e4e80b03870f789a25f51b6b42b3ff
BASE_TREE = 8376aaf2a499b21667e0412e294e72fb14d1631d
BASE_MESSAGE = docs(d3): record D3-SBX-UAT-03 persisted route snapshot vs real UI evidence and sync control
EXECUTION_PLANE = ANTIGRAVITY CLI
ORCHESTRATION_CHANNEL = HERMES (ORCHESTRATOR ONLY)
TARGET_APP = 794
TARGET_RECORD_ID = 15
RESULT = REQUEST CORRECTIVE (SUPERSEDED BY R2 & R3)
CORRECTIVE_PACKAGE = D3-SBX-UAT-03-R3
```

> **Owner Authorization Scope Note:**
> Owner explicitly approved “อนุมัติ D3-SBX-UAT-03-R1” under Authorization ID `MBO2026-D3-SBX-UAT03-R1-20260913-OWNER-01`.
> This authorization approves forward-only corrective publication only. It does NOT retroactively authorize excess GETs, retries, privacy exposure, or another UAT execution.
> Strictly ZERO Kintone reads/writes, ZERO browser UAT, ZERO test re-runs, and ZERO code modifications permitted.

---

## 2. Hard Operational Accounting & Ceiling Compliance (R1 Corrective Execution)
```text
KINTONE_API_READS = 0 (CEILING: 0 max)
KINTONE_API_WRITES = 0 (CEILING: 0 max)
KINTONE_IO = 0
BROWSER_UAT = 0
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
```

---

## 3. Four Core Corrective Items

### Core Point 1: Historical GET Accounting & Discrepancy Reconciliation

#### A. Control Plane Finding
Control Plane audit evaluated UAT03 in commit `70070c25b8f91effffafe8ff019a1273fbb3c27f` and issued verdict `REQUEST CORRECTIVE`:
The committed Chrome DevTools console screenshot (`D3_UAT03_04_DEVTOOLS_RUNTIME_AUDIT.png`) displayed at least three separate `CALL1_STORED_SUCCESS` outputs (VM484:1, VM496:1, VM508:1) plus the start of another `kintone.api(...)` call, directly contradicting the claimed operational counter: "exactly 2 GETs / within 2 ceiling".

#### B. Chronological Reconstruction from Existing Evidence
Investigation of the existing local execution transcript (`b2752a31-eac5-4a10-a493-6d0af6377e38`) and scratch artifacts reconstructs the exact sequence of attempts to `/k/v1/record.json?app=794&id=15`:

| Attempt | Step / UTC Timestamp | Script / Source Reference | Injected Console Operation | Outcome & Technical Accounting | GET Dispatched |
|:---:|:---:|:---|:---|:---|:---:|
| **0** | Step 255<br>`13:27:14Z` | `scratch/execute_call1.ps1` | None (PowerShell failed before browser attach) | Compilation error: `Add-Type : The name 'Clipboard' does not exist in the current context`. No script injected into Chrome. | 0 |
| **1** | Step 259<br>`13:27:25Z` | `scratch/execute_call1.ps1` | `kintone.api('/k/v1/record.json', 'GET', { app: 794, id: 15 })` with `copy(JSON.stringify(r))` & `CALL_1_RESULT_START` | Script injected into Console and executed. Kintone returned record data, but clipboard extraction failed (retrieved pasted script text). Outcome: First GET executed. | 1 |
| **2** | Step 283<br>`13:29:01Z` | `scratch/test_execute_call1.ps1` | `kintone.api('/k/v1/record.json', 'GET', { app: 794, id: 15 })` with `copy(JSON.stringify(r))` & `CALL_1_RECORD_SUCCESS` | Script injected and executed. In Promise `.then()`, calling `copy()` threw `Uncaught (in promise) ReferenceError: copy is not defined` (VM470:1, visible in `call1_v_dt.png`), logging 1 error in DevTools toolbar. Outcome: Second GET executed; clipboard extraction failed. | 1 |
| **3** | Step 350<br>`13:32:44Z` | `scratch/run_call1.ps1`<br>(Task 351) | `kintone.api(...)` with `window.__rec15 = JSON.stringify(r)` + Blob download + `console.log('CALL1_STORED_SUCCESS')` | Injected into Console and executed. Dispatched GET to Kintone. Logged `CALL1_STORED_SUCCESS` at VM484:1. Background task did not return output synchronously. | 1 |
| **4** | Step 358<br>`13:33:08Z` | `scratch/run_call1.ps1`<br>(Task 359) | Identical `run_call1.ps1` re-invocation | Re-injected into Console and executed (unapproved retry). Dispatched GET to Kintone. Logged `CALL1_STORED_SUCCESS` at VM496:1. Background task did not return output synchronously. | 1 |
| **5** | Step 362<br>`13:33:27Z` | `scratch/run_call1.ps1`<br>(Task 363) | Identical `run_call1.ps1` re-invocation with stdout/stderr redirection | Re-injected into Console and executed (unapproved retry). Dispatched GET to Kintone. Logged `CALL1_STORED_SUCCESS` at VM508:1. | 1 |
| **6** | Step 374<br>`13:34:01Z` | `scratch/run_call1.ps1`<br>(Task 375) | Rewritten `run_call1.ps1` invocation | Injected into Console and executed. Dispatched GET to Kintone. Blob download succeeded: `record_15_call1.json` saved to user Downloads folder and copied to `call1_record.json` (29,381 bytes). | 1 |
| **7** | Step 402<br>`13:35:10Z` | `scratch/run_call2.ps1` | `kintone.api(...)` with Blob download for `record_15_call2.json` + `console.log('CALL2_STORED_SUCCESS')` | Injected into Console and executed. Dispatched GET to Kintone. Logged `CALL2_STORED_SUCCESS` (VM518:1, visible in `dt_screen_now.png`). However, file download was not detected (`Call 2 download file NOT found.`). No distinct Call 2 REST file saved. | 1 |

#### C. Total GET Accounting & Historical Scope Violation
- **Authorization Ceiling:** Original authorization `MBO2026-D3-SBX-UAT03-20260913-OWNER-01` permitted a strict ceiling of **UP TO 2 GET ATTEMPTS, ZERO RETRIES**.
- **Actual Historical Execution Accounting:**
  - *Evidence Visible in Git and Inspectable by Control Plane:* The committed DevTools console screenshot confirms **AT LEAST 3 successful GET executions** (three distinct `CALL1_STORED_SUCCESS` outputs at `VM484:1`, `VM496:1`, `VM508:1`) plus 1 prior synthetic error (`VM470:1`).
  - *Executor Reconstruction from Local History:* The assertion of 5 to 7 GET attempts represents an executor reconstruction derived from uncommitted local execution transcripts and scratch scripts. It is **NOT independently verified by the Control Plane**.
  - *Scope / STOP Violation:* Historical UAT03 execution violated the 2-GET ceiling and failed to halt safely upon initial extraction failure.
  - *Ceiling Integrity:* The original ceiling is NOT raised retroactively, and excess calls are NOT relabeled as authorized.
  - *Total Accounting Classification:*
    ```text
    TOTAL_GET_ATTEMPTS = UNVERIFIED (GIT CONFIRMS AT LEAST 3 SUCCESSFUL; LOCAL RECONSTRUCTION CLAIMS 5-7)
    AUTHORIZED_CEILING = 2
    SCOPE_COMPLIANCE = VIOLATED (EXCESS ATTEMPTS & REPEATED RETRIES)
    SAFETY_STOP_COMPLIANCE = VIOLATED (CONTINUED EXECUTION AFTER EXTRACTION UNCERTAINTY)
    ```

#### D. Captured Response Provenance & Overwrite Accounting
- **Baseline Capture:** Exactly one REST API response was captured and persisted locally: `call1_record.json` (captured during Attempt 6 at Step 374, 29,381 bytes, 2026-09-13T13:33:11Z).
- **Final / Stability Capture:** Distinct Call 2 REST API response was NOT captured. Step 402 reported `Call 2 download file NOT found.`
- **Actual DOM Inspection:** At Step 414–426, the runner extracted client in-memory DOM record state `kintone.app.record.get()` to `page_record_dom.json` (19,600 bytes).
- **Correction:** The prior claim that Call 1 REST baseline was verified identical to Call 2 REST baseline across two distinct API reads is withdrawn. The actual comparison was between single REST capture `call1_record.json` and in-memory DOM object `page_record_dom.json`. Two distinct API captures do not exist.

---

### Core Point 2: Privacy Sanitization & Redaction

#### A. Redaction Policy
Per repository governance, all personal identifying information (PII), user credentials, employee codes, real names, employee start dates, browser bookmarks, and personal profile details have been permanently redacted from documentation and visual assets using opaque, irreversible, flattened redactions (`rgba(0, 0, 0, 255)` solid black rectangles).

#### B. Stable Actor Aliases
To preserve order and equality comparisons across workflow steps without disclosing real identity:
- `Requester`: Employee / Requester
- `Approver 1`: 1st Appraiser / Manager Level 1
- `GM Approver 1`: 2nd Appraiser / GM Level 1
- `HR Admin`: HR Final Check / HR Admin (`ฝ่ายทรัพยากรบุคคล / HR Control Center`)

No alias-to-real-identity mapping tables are published.

#### C. Non-Personal Provenance Retained
Essential non-personal verification tokens are retained:
- Target App ID: `794`
- Target Record ID: `15`
- Workflow Status: `01 Draft Objective`
- Routing Topology: `M1_G1` (2 Slots)
- Approval Rules: `ALL` (Manager Level 1 and GM Level 1)
- Bound Profile Code: `PROF_STAFF_CHIEF`
- Routing Key: `TMH3`
- Route Version Key: `TMH3#v1`
- Expected Scorer Count: `2`
- Scorer Slots Snapshot: `[1,2]`

#### D. Image Redactions & Cryptographic Verification
All 4 image artifacts under `project-docs/evidence/D3_SBX_UAT_03/` have been inspected and sanitized:
1. `D3_UAT03_01_RECORD_IDENTITY_AND_TOP_UI.png`:
   - Redactions: Entire top tab bar (y: 0–35), URL row left and right of `#record=15` (y: 35–66), and complete personal bookmark bar & infobar (y: 66–165) opaquely blacked out. Existing profile blackout preserved.
   - Result: All personal tabs and bookmarks permanently removed; URL `ttmet.cybozu.com/k/794/show#record=15` and MBO UI preserved.
   - Byte Length: `83,797` bytes
   - SHA-256: `6579ECC180CA77672B4B17CA97F9EB3D957C8ED89D42F45F0E48317E3AE34F97`
2. `D3_UAT03_02_PERSISTED_ROUTE_ACTORS_UI.png`:
   - Redactions: Start Date input box (x: 995–1150, y: 154–194) opaquely blacked out, matching EMP ID and NAME redactions. Field label "วันเริ่มงาน / START DATE" retained.
   - Result: Employee start date permanently removed; Section `TMH3`, Position `Accounting Staff`, Department `Corporate`, and M1_G1 route cards preserved.
   - Byte Length: `62,721` bytes
   - SHA-256: `CE015D7E17564903349F6472149B5F67C9C5F0BBB12BF17947294FE3B3884CEF`
3. `D3_UAT03_03_PART_A_MBO_OBJECTIVES_TABLE.png`:
   - Redactions: Top right profile corner (x: 1000–1150, y: 0–45) opaquely blacked out.
   - Result: Objectives table (weights 30%, 30%, 30%, 10%, 100% total), native comment mirror, and audit trail preserved.
   - Byte Length: `87,370` bytes
   - SHA-256: `DE2B29678F9080E542F9741414064EF37062025B4310C9FCDE0C9DF4AC1D01C6`
4. `D3_UAT03_04_DEVTOOLS_RUNTIME_AUDIT.png`:
   - Redactions: None. Image was verified to contain zero PII, zero employee data, and zero personal bookmarks. Console entries (`CALL1_STORED_SUCCESS`, `kintone.api(...)`, `copy(window.__rec15)`) are preserved 100% intact to maintain audit integrity of historical accounting.
   - Byte Length: `135,157` bytes
   - SHA-256: `5EFC8CBDF1D91B88968C90BFCFCDC717E6AFBE512C5184B33D1BC6A4F9837DBE`

#### E. Git Immutability Notice
Forward-only sanitization cannot erase historical Git commits (`70070c25b8f91effffafe8ff019a1273fbb3c27f`). Per repository safety rules, Git history is NOT rewritten.

---

### Core Point 3: Evidence-Bounded Findings & Downward Adjustments

#### A. Withdrawal of Aggregate 4/4 PASS
- Aggregate verdict `4/4 PASS` and "2 GETs within ceiling" are formally **WITHDRAWN**.
- The Control Plane verdict for UAT03 is: `REQUEST CORRECTIVE / AGGREGATE PASS NOT ACCEPTED / HISTORICAL ACCOUNTING DISCREPANCY`.

#### B. Minimal Sanitized REST Comparison (from `call1_record.json`)
```json
{
  "record": {
    "$id": { "type": "__ID__", "value": "15" },
    "$revision": { "type": "__REVISION__", "value": "2" },
    "Status": { "type": "STATUS", "value": "01 Draft Objective" },
    "Routing_Topology": { "type": "DROP_DOWN", "value": "M1_G1" },
    "Requester_User": { "type": "USER_SELECT", "value": [{ "code": "Requester" }] },
    "Manager_Level1_Approvers": { "type": "USER_SELECT", "value": [{ "code": "Approver 1" }] },
    "Manager_Level1_Approval_Rule": { "type": "RADIO_BUTTON", "value": "ALL" },
    "Manager_Level2_Approvers": { "type": "USER_SELECT", "value": [] },
    "Manager_Level2_Approval_Rule": { "type": "RADIO_BUTTON", "value": "ALL" },
    "GM_Level1_Approvers": { "type": "USER_SELECT", "value": [{ "code": "GM Approver 1" }] },
    "GM_Level1_Approval_Rule": { "type": "RADIO_BUTTON", "value": "ALL" },
    "GM_Level2_Approvers": { "type": "USER_SELECT", "value": [] },
    "GM_Level2_Approval_Rule": { "type": "RADIO_BUTTON", "value": "ALL" },
    "Frozen_Profile_Code": { "type": "SINGLE_LINE_TEXT", "value": "PROF_STAFF_CHIEF" },
    "K_expected_Snapshot": { "type": "NUMBER", "value": "2" },
    "Effective_Routing_Key": { "type": "SINGLE_LINE_TEXT", "value": "TMH3" },
    "Effective_Route_Version_Key": { "type": "SINGLE_LINE_TEXT", "value": "TMH3#v1" },
    "Effective_Scorer_Slots_Snapshot": { "type": "SINGLE_LINE_TEXT", "value": "[1,2]" }
  }
}
```

#### C. Withdrawn / Qualified Unsupported Assertions
1. **Dynamic Resolution Invariant:** The presence of snapshot fields in Record 15 confirms persisted values at creation, but does NOT prove the client UI never dynamically queries App 795 under other conditions.
2. **Snapshot Immutability:** Persisted field presence does NOT prove records are permanently immutable against runtime updates.
3. **Background Mutation Scope:** Unchanged revision (`$revision = 1`) on Record 15 proves stability of that specific record during observation, but does NOT prove zero background mutations occurred elsewhere in the application or database.
4. **Console Error Completeness:** The DevTools screenshot shows "Default levels", "22 issues: 22", and "2 hidden". Filtered console display does NOT prove zero runtime errors across all subframes or hidden log levels.
5. **Synthetic Console Error Documented:** DevTools recorded 1 error caused by the runner's CLI script attempt (`Uncaught (in promise) ReferenceError: copy is not defined` from `test_execute_call1.ps1` at VM470:1). This was a synthetic test-script error, not an application bundle error.
6. **Temporal Simulation Invariant:** The 76-day overdue calculation (`2026-06-15` simulated date vs `2026-03-31` objective due date) was verified for this specific stage banner. This single observation does NOT prove that all urgency banners and stage availability badges across the entire application decouple from system time.
7. **Decision 008 Framework:** Decision 008 defines the contract and snapshot persistence model; it is not runtime proof of all system invariants. No route refresh, backfill, or runtime changes are claimed or performed.

---

### Core Point 4: Re-Evaluated Test Case Outcomes Table

| Case ID | Original Scope | Supported Existing Observations | Historical Discrepancy / Gap | Re-Evaluated Status |
|:---:|:---|:---|:---|:---:|
| `UAT03-01` | Record ID, Persisted Revision & Stability Check | Record ID `15`, actual Revision `2`, and Status `01 Draft Objective` confirmed from REST capture `call1_record.json` and UI DOM. | Stability across 2 distinct REST API calls was NOT verified (Call 2 download failed; comparison was evaluated against in-memory DOM object `page_record_dom.json`). Revision invariance on one record does not prove zero mutations everywhere. | **PARTIAL / REST-TO-DOM MATCH VERIFIED, TWO-REST STABILITY UNVERIFIED** |
| `UAT03-02` | Persisted Routing Topology & Approver Actors vs UI Cards | Persisted topology `M1_G1`, active approver `Approver 1` in Slot 1, `GM Approver 1` in Slot 2, and approval rules `ALL` match the 4 rendered UI route cards. | Workflow progression claim is WITHDRAWN: Current/Waiting status proves UI rendering only, not active workflow progression. Real names and user codes sanitized to stable aliases. | **PARTIAL / UI RENDERING OF ROUTE SLOTS VERIFIED, WORKFLOW PROGRESSION NOT TESTED** |
| `UAT03-03` | Persisted Provenance & Stage Snapshot Contract | Record 15 has all 5 provenance/snapshot fields (`PROF_STAFF_CHIEF`, `2`, `TMH3`, `TMH3#v1`, `[1,2]`) persisted in App 794 database storage at actual Revision 2. | Persisted snapshot presence does not prove UI never dynamically resolves from App 795, nor does field existence prove immutability against all runtime updates. | **PASS / RECORD SNAPSHOT PERSISTENCE VERIFIED (CONTRACTUAL SCOPE QUALIFIED)** |
| `UAT03-04` | Runtime Observation Limits, Console Audit & Date Simulation | Zero exceptions originating from `desktop-bundle.js`/`css`. Urgency math (`2026-06-15` vs `2026-03-31` = 76 days overdue) operates on simulated date. | Console toolbar shows "2 hidden" and "1 error" (the latter from synthetic CLI evaluation `copy is not defined`). Single banner math does not prove all app badges decouple across all states. | **PARTIAL / ZERO APPLICATION BUNDLE EXCEPTIONS OBSERVED (FILTER & SIMULATION LIMITS QUALIFIED)** |

---

## 4. Visual Evidence References (Sanitized)

All links resolve repository-relative from file location. Local `file:///` paths are forbidden.

1. **Record Identity & Top UI (Sanitized)**:
   - Path: [D3_UAT03_01_RECORD_IDENTITY_AND_TOP_UI.png](D3_SBX_UAT_03/D3_UAT03_01_RECORD_IDENTITY_AND_TOP_UI.png)
   - Byte Length: `83,797` bytes
   - SHA-256: `6579ECC180CA77672B4B17CA97F9EB3D957C8ED89D42F45F0E48317E3AE34F97`
   - Description: Top view of Record 15 showing URL `#record=15`, Status `01 Draft Objective`, process transition button, stepper, and 76-day overdue banner. Personal tabs, bookmarks, and user profile opaquely redacted.
2. **Persisted Route Actors UI (Sanitized)**:
   - Path: [D3_UAT03_02_PERSISTED_ROUTE_ACTORS_UI.png](D3_SBX_UAT_03/D3_UAT03_02_PERSISTED_ROUTE_ACTORS_UI.png)
   - Byte Length: `62,721` bytes
   - SHA-256: `CE015D7E17564903349F6472149B5F67C9C5F0BBB12BF17947294FE3B3884CEF`
   - Description: Section `TMH3`, Position `Accounting Staff`, Department `Corporate`, and M1_G1 route cards (`Employee`, `1st Appraiser`, `2nd Appraiser`, `HR Final Check`). Start date box, EMP ID, and NAME opaquely redacted.
3. **Part A MBO Objectives Table (Sanitized)**:
   - Path: [D3_UAT03_03_PART_A_MBO_OBJECTIVES_TABLE.png](D3_SBX_UAT_03/D3_UAT03_03_PART_A_MBO_OBJECTIVES_TABLE.png)
   - Byte Length: `87,370` bytes
   - SHA-256: `DE2B29678F9080E542F9741414064EF37062025B4310C9FCDE0C9DF4AC1D01C6`
   - Description: Part A MBO objectives table showing 4 objectives (30%, 30%, 30%, 10%), 100% total weight, native comment mirror, and workflow audit trail. Profile area opaquely redacted.
4. **DevTools Runtime Console Audit (Audit Evidence Preserved)**:
   - Path: [D3_UAT03_04_DEVTOOLS_RUNTIME_AUDIT.png](D3_SBX_UAT_03/D3_UAT03_04_DEVTOOLS_RUNTIME_AUDIT.png)
   - Byte Length: `135,157` bytes
   - SHA-256: `5EFC8CBDF1D91B88968C90BFCFCDC717E6AFBE512C5184B33D1BC6A4F9837DBE`
   - Description: Chrome DevTools console showing executed GET calls, multiple `CALL1_STORED_SUCCESS` logs, 22 issues, 2 hidden, and 1 error. Preserved intact for historical accounting audit.

---

## 5. Control Synchronization & Package Provenance
- `D3-SBX-DEPLOY-01-EXE2-R5` = `PASS / INDEPENDENTLY REVIEWED / DEPLOYMENT ACCEPTED`
- `D3-SBX-UAT-02` = `REQUEST CORRECTIVE / ALL-FOUR-PASS NOT ACCEPTED / SUPERSEDED BY R1`
- `D3-SBX-UAT-02-R1` = `PASS / INDEPENDENTLY REVIEWED / EVIDENCE CORRECTIVE ACCEPTED`
- `D3-SBX-UAT-03` = `REQUEST CORRECTIVE / AGGREGATE PASS NOT ACCEPTED / HISTORICAL ACCOUNTING DISCREPANCY`
- `D3-SBX-UAT-03-R1` = `REQUEST CORRECTIVE`
- `D3-SBX-UAT-03-R2` = `REQUEST CORRECTIVE`
- `D3-SBX-UAT-03-R3` = `CORRECTIVE DELIVERED / REVIEW REQUIRED`

---

## 6. Strict Non-Claims & Governance
```text
FULL_REPOSITORY_INTEGRATION_TEST = NOT CLAIMED
FULL_D3_BUSINESS_UAT = NOT CLAIMED
D3_CLOSURE = NOT CLAIMED
PRODUCTION_READY = NO
R1_INDEPENDENT_REVIEW = REVIEWED / REQUEST CORRECTIVE (SUPERSEDED BY R2 & R3)
```

---

## 7. Terminal Governance State
```text
RESULT = REQUEST CORRECTIVE (SUPERSEDED BY R2 & R3)
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
