# D3-SBX-UAT-04-R2 Evidence Record

Updated: 2026-09-14 ICT

## 1. Package & Execution Metadata
```text
PACKAGE = D3-SBX-UAT-04-R2
TITLE = EXISTING EVIDENCE / PRIVACY / EVIDENCE-BOUNDED CONTROL CORRECTIVE (R2)
AUTHORIZATION_ID = MBO2026-D3-SBX-UAT04-R2-20260914-OWNER-01
OWNER_APPROVAL = “อนุใัติ” หมายถึงอนุมัติข้อเสนอ D3-SBX-UAT-04-R2 ที่รออยู่เพียงงานเดียว
MODE = EXISTING EVIDENCE / PRIVACY / EVIDENCE-BOUNDED CONTROL CORRECTIVE
AUTHORIZED_BASE_HEAD = 233509b48392a2269cd2bd1eb1f917257eb9f779
BASE_PARENT = d493374d541c3458258f95b4a65632bddac85375
BASE_TREE = 1b54a013232c25554857d1411e34fb8f805f3d46
BASE_MESSAGE = docs(d3): verify App794 record 15 baseline under D3-SBX-UAT-04-R1
EXECUTION_PLANE = ANTIGRAVITY CLI
ORCHESTRATION_CHANNEL = HERMES (ORCHESTRATOR ONLY)
TARGET_APP = 794
TARGET_RECORD_ID = 15
TARGET_RECORD_URL = https://ttmet.cybozu.com/k/794/show#record=15
RESULT = CORRECTIVE DELIVERED / REVIEW REQUIRED
```

> **Owner Authorization Scope Note:**
> Authorized under `MBO2026-D3-SBX-UAT04-R2-20260914-OWNER-01` in mode `EXISTING EVIDENCE / PRIVACY / EVIDENCE-BOUNDED CONTROL CORRECTIVE` on canonical base HEAD `233509b48392a2269cd2bd1eb1f917257eb9f779`.
> Delivery is strictly limited to forward-only evidence and control synchronization, privacy sanitization in R1 helper files, qualification of comparison claims to the 20 published scoped fields, and explicit distinction between REST, client in-memory, and rendered UI evidence.
> Strictly ZERO live Kintone calls, ZERO writes, ZERO deployments, ZERO browser UAT, ZERO runner executions, and ZERO test reruns permitted.

---

## 2. Hard Operational Accounting & Ceiling Compliance (Package R2)
```text
KINTONE_API_READS = 0 (CEILING: 0 max)
KINTONE_API_WRITES = 0 (CEILING: 0 max)
KINTONE_IO = 0
BROWSER_UAT = 0
NEW_BROWSER_COLLECTION = 0
CAPTURE_RUNNER_EXECUTIONS = 0
BUILDS_AND_TEST_RERUNS = 0
RECORD_WRITES = 0
PROCESS_TRANSITIONS = 0
SCHEMA_ACL_CUSTOMIZATION_WRITES = 0
DEPLOYMENTS = 0
APPLICATION_SOURCE_TEST_CONFIG_DEPENDENCY_DIST_CHANGES = 0
HISTORY_REWRITE = 0
ZERO_WRITE_FAIL_CLOSED = ENFORCED
READ_ONLY_ENFORCEMENT = ENFORCED
R2_EXECUTION_STATE = CORRECTIVE DELIVERED / ZERO LIVE I/O
```

### Historical R1 Execution Accounting vs R2 Corrective Separation
- **Historical R1 Operational Accounting (Recorded during R1 execution under `MBO2026-D3-SBX-UAT04-R1-20260914-OWNER-01`):**
  - Explicit REST API GET attempts: 2 (`GET 1` initial baseline, `GET 2` final stability check; ceiling 2 max; enforced).
  - Explicit REST API GET successes: 2.
  - Client in-memory capture: 1 (`kintone.app.record.get()` captured once in console; not a REST request).
  - Read retries: 0.
  - Auxiliary reads: 0.
  - Kintone API writes / mutations: 0.
  - Clarification on browser traffic: Total browser network traffic is NOT claimed to be 2, and background/native browser traffic is NOT claimed to be 0.
- **R2 Corrective Accounting (This Package):**
  - ZERO Kintone API reads, writes, or mutations.
  - ZERO browser collections or runner executions.
  - All R2 operations are strictly read-only inspection, text/script sanitization, hash calculation, and control document synchronization.

---

## 3. Five Authorized Corrective Deliverables

### Item 1: Privacy in Helper Files & Text
- **`test_preflight_verification.cjs` Sanitization:**
  - Replaced real employee code (`0187`) with genuinely fictional opaque test identifier (`mock_emp_101`).
  - Replaced personal user codes and names (`tmh`/`TMH`, `chatawee`/`Ms.Chatrawee`, `pattama`/`Ms.Pattama`) with opaque mock test tokens:
    - `Requester_User`: `[{ code: 'mock_user_101', name: 'Mock User 101' }]`
    - `Appraiser_1_User`: `[{ code: 'mock_user_102', name: 'Mock User 102' }]`
    - `Appraiser_2_User`: `[{ code: 'mock_user_103', name: 'Mock User 103' }]`
  - No real identifiers retained under a "synthetic" label.
  - No alias-to-real-identity mapping table created.
  - Mock field/value types and test logic preserved verbatim without test redesign or expansion.
- **`dispatch_runner.ps1` Sanitization:**
  - Removed all hardcoded personal user paths (`C:\Users\allda\...`).
  - Parameterized runner with explicit `param(...)` block supporting optional `-EvidenceDir`, `-ScratchDir`, `-DownloadDir`, and `-TargetHwnd`.
  - Used script-relative path `$PSScriptRoot` as default for evidence directory, and temporary directory for scratch/downloads.
  - Preserved exact runner structure, Windows API interop, clipboard injection, and error handling without generic runner redesign or framework refactor.
  - The runner was **NOT EXECUTED** under this package.
- **Forward-Only Governance Limitation:**
  - Forward-only file updates do not erase data from historical Git commits. Git history is immutable; **NO history rewrite** is permitted.

---

### Item 2: Evidence-Bounded Comparison
- **Preservation of Sanitized JSON Captures:**
  - The three existing sanitized JSON captures (`D3_UAT04_R1_MINIMAL_SANITIZED_GET1_RECORD_15.json`, `D3_UAT04_R1_MINIMAL_SANITIZED_CLIENT_RECORD_15.json`, `D3_UAT04_R1_MINIMAL_SANITIZED_GET2_RECORD_15.json`) are preserved exactly, including provenance headers, values, types, and array ordering.
- **Scope Limitation to 20 Published Fields:**
  - Independent comparison conclusions are strictly limited to the 20 published fields common to all three captures:
    `$id`, `$revision`, `Status`, `Routing_Topology`, `Requester_User`, `Manager_User`, `GM_User`, `Manager_Level1_Approvers`, `Manager_Level1_Approval_Rule`, `GM_Level1_Approvers`, `GM_Level1_Approval_Rule`, `Manager_Level2_Approvers`, `Manager_Level2_Approval_Rule`, `GM_Level2_Approvers`, `GM_Level2_Approval_Rule`, `Frozen_Profile_Code`, `K_expected_Snapshot`, `Effective_Routing_Key`, `Effective_Route_Version_Key`, `Effective_Scorer_Slots_Snapshot`.
- **Withdrawal / Reclassification of Unverified Claims:**
  - Prior claims of 22/22 scoped fields and 350/350 total record fields matching 100% bit-for-bit are reclassified strictly as **EXECUTOR-REPORTED / LOCAL-ONLY** and are NOT independently verifiable from Git repository evidence.
  - Full raw JSON records are retained local-only and will not be published to the repository to support those claims (avoiding bulk unreviewed payload exposure).
  - JSON semantic equality of the 20 published fields is verified; whole-file bit-for-bit identity across the entire raw JSON payload is formally withdrawn / NOT claimed.

---

### Item 3: REST / Client / UI Distinction
- **Separation of Evidence Sources:**
  1. *Scoped REST-to-Client Comparison:* The 20 published fields in REST GET 1 match the client in-memory capture (`kintone.app.record.get()`) semantically.
  2. *Scoped GET1-to-GET2 Stability:* The 20 published fields remain identical between REST GET 1 and REST GET 2 across the captured interval.
  3. *Rendered UI Topology & Route Cards:* Screenshots confirm UI rendering of the M1_G1 route header and 4 route cards (Employee, 1st Appraiser, 2nd Appraiser, HR Final Check).
- **Actor Identity Masking Limitation:**
  - In visual screenshots, actor names and IDs are opaquely masked for privacy protection.
  - Masked UI cards do NOT permit independent verification of actor identities against REST values. Full actor-identity equality between UI cards and REST data is formally NOT claimed.
- **Workflow Progression Limitation:**
  - UI badges `[กำลังดำเนินการ / Current]` and `[รอดำเนินการ / Waiting]` represent rendered UI component state only. Active workflow execution was NOT triggered or tested.
- **Revision Reconciliation Limitation:**
  - Fresh R1 REST and client data prove that current persisted revision is `1`.
  - This fresh observation does NOT retroactively explain or reconcile historical UAT03 discrepancies (where UAT03/R1 reported revision 1 and R2 reported revision 2). Historical revision reconciliation remains **UNVERIFIED**.

---

### Item 4: Console & Clock Qualification
- **Console Inspection Limits:**
  - Findings are strictly qualified to the visible inspected DevTools screenshot ([D3_UAT04_R1_03_DEVTOOLS_EXECUTION_AUDIT.png](D3_SBX_UAT_04_R1/D3_UAT04_R1_03_DEVTOOLS_EXECUTION_AUDIT.png)).
  - Zero errors across the entire user session, uninspected tabs, or hidden/filtered console messages is NOT claimed.
- **Date Simulation Limits:**
  - Overdue banner calculation (`76 days overdue` relative to stage due date `2026-03-31`) verifies that simulated date `2026-06-15` drives the Stage 1 banner component.
  - System-wide temporal decoupling across other components or stages is NOT tested and NOT claimed.
- **Outcome Grading:**
  - Cases requiring evidence qualification are graded as `PARTIAL` rather than blanket `PASS`.

---

### Item 5: Accounting & Control Synchronization
- **Prior Verdicts Preserved:**
  - `D3-SBX-DEPLOY-01-EXE2-R5` = `PASS / INDEPENDENTLY REVIEWED / DEPLOYMENT ACCEPTED`
  - `D3-SBX-UAT-02-R1` = `PASS / INDEPENDENTLY REVIEWED / EVIDENCE CORRECTIVE ACCEPTED`
  - `D3-SBX-UAT-03-R3` = `PASS / INDEPENDENTLY REVIEWED / EVIDENCE CORRECTIVE ACCEPTED`
  - `D3-SBX-UAT-04` = `PASS AS SAFETY STOP / INDEPENDENTLY REVIEWED / UAT NOT COMPLETED`
  - Historical UAT03 scope violation and revision reconciliation remain `UNVERIFIED`.
- **Package Status Synchronization:**
  - `D3-SBX-UAT-04-R1` = `REQUEST CORRECTIVE / CONTROL PLANE REVIEWED (SUPERSEDED BY R2)`
  - `D3-SBX-UAT-04-R2` = `CORRECTIVE DELIVERED / REVIEW REQUIRED`

---

## 4. Re-Evaluated Summary of UAT-04 Verification Outcomes

| Case ID | Original Scope | Supported Existing Observations | Evidence Limitations / Discrepancies | Re-Evaluated Status |
|:---:|:---|:---|:---|:---:|
| `UAT04-01` | Record ID, Persisted Revision & Stability Check | URL `#record=15`, Status `01 Draft Objective`, Stepper, Action button observed in UI. GET 1, Client, and GET 2 all confirm `$revision = 1`. Scoped comparison matches 20 published fields. | Full 350-field equality executor-reported only; does not retroactively reconcile historical UAT03 revision discrepancy | **PARTIAL / 20 SCOPED FIELDS BASELINE VERIFIED ($rev=1); 350-FIELD TOTAL EQUALITY EXECUTOR-REPORTED ONLY; REVISION RECONCILIATION UNVERIFIED** |
| `UAT04-02` | Routing Topology & Approver Actors vs UI Cards | M1_G1 topology, Requester + 2 Appraiser slots + HR Admin persisted and rendered in UI route cards. | Actor identities in masked UI cards not independently verified against REST; workflow progression NOT TESTED | **PARTIAL / TOPOLOGY PERSISTENCE & UI RENDERING OBSERVED; ACTOR IDENTITY IN MASKED UI NOT INDEPENDENTLY VERIFIED; WORKFLOW PROGRESSION NOT TESTED** |
| `UAT04-03` | Persisted Provenance & Stage Snapshot Contract | Five target provenance fields (`Frozen_Profile_Code`, `K_expected_Snapshot`, `Effective_Routing_Key`, `Effective_Route_Version_Key`, `Effective_Scorer_Slots_Snapshot`) verified persisted and identical. | Snapshot fields not displayed in form UI; Decision 008 runtime query suppression NOT TESTED | **PASS / FIVE PROVENANCE FIELDS PERSISTENCE VERIFIED; DYNAMIC RUNTIME QUERY SUPPRESSION NOT TESTED** |
| `UAT04-04` | Runtime Audit & Business Date Simulation | 0 visible application bundle errors in inspected DevTools screenshot; Simulated date 2026-06-15 drives 76-day overdue banner calculation. | Console limits qualified to inspected view; system-wide temporal decoupling NOT CLAIMED | **PARTIAL / ZERO VISIBLE APPLICATION ERRORS IN INSPECTED SCREENSHOT; DATE SIMULATION OBSERVED ON STAGE 1 BANNER; SYSTEM-WIDE TEMPORAL DECOUPLING NOT CLAIMED** |

---

## 5. Artifact Registry & Cryptographic Digests

### Preserved Unchanged R1 Artifacts (`project-docs/evidence/D3_SBX_UAT_04_R1/`)

| File Name | Byte Length | SHA-256 Digest | Status |
|:---|:---:|:---|:---:|
| `capture_get1.js` | 2,015 bytes | `0BFFBF7C91E968662164778B7A1404D1A79F1BF7883B614430BAE4C602843FD3` | UNCHANGED |
| `capture_client.js` | 1,591 bytes | `34E679EB5635519C73332839046F2FF378AD35367F6D78C2314BF2269F17113A` | UNCHANGED |
| `capture_get2.js` | 2,015 bytes | `7BB6C989779E7F52E90C2FD3A6906875C1C0F8639B6A0DC319C96CA32E495CA8` | UNCHANGED |
| `D3_UAT04_R1_MINIMAL_SANITIZED_GET1_RECORD_15.json` | 2,871 bytes | `6DEA72256A7A4CE992B340238BC764461B7028DB31CF31A3984423BB6491C2CF` | UNCHANGED |
| `D3_UAT04_R1_MINIMAL_SANITIZED_CLIENT_RECORD_15.json` | 2,817 bytes | `9DB418F90C24524A6AAE963D7C5012D3CA795B58B4112BB8F46DAA39167FB55C` | UNCHANGED |
| `D3_UAT04_R1_MINIMAL_SANITIZED_GET2_RECORD_15.json` | 2,897 bytes | `5E762BE2BBBBDA8623EC9D8B02C4793C059B64AE2B96F8714DFDFAED2811ACFE` | UNCHANGED |
| `D3_UAT04_R1_01_RECORD_IDENTITY_AND_TOP_UI.png` | 76,510 bytes | `9E3F2292F4A8F7F28C556772B6FBDCBD3F340F059DF610BAAAC113C0BA7BC91C` | UNCHANGED |
| `D3_UAT04_R1_02_PERSISTED_ROUTE_ACTORS_UI.png` | 57,532 bytes | `6983102C6AD5792F90A80E16C443802D490B68F1C7BB241B9E60B208A4704CA0` | UNCHANGED |
| `D3_UAT04_R1_03_DEVTOOLS_EXECUTION_AUDIT.png` | 274,835 bytes | `AFA82BCC4C606AC6BCED1F894E7A8EC175C8AA52B98C8DC493105D95FBBA5A26` | UNCHANGED |
| `D3_UAT04_R1_04_SESSION_INTEGRITY_AUDIT.png` | 326,491 bytes | `7D8F23C0143CAE7FCB9BE1F8918050E6C6FB2932DFA9776835FC1BFE542F7D50` | UNCHANGED |

### Updated Helper Files under R2 Corrective (`project-docs/evidence/D3_SBX_UAT_04_R1/`)

| File Name | Byte Length | SHA-256 Digest | Description & R2 Corrective Note |
|:---|:---:|:---|:---|
| [test_preflight_verification.cjs](D3_SBX_UAT_04_R1/test_preflight_verification.cjs) | 8,536 bytes | `A5D65F39CB15D45B0E2B45C578E8A8BEF3157CDE9727AD947F96FEF144405AB3` | Sanitized person/account identifiers with opaque mock test data (`mock_emp_101`, `mock_user_101..103`). Test logic unchanged. Historical preflight execution belongs strictly to original R1 version; not rerun under R2. |
| [dispatch_runner.ps1](D3_SBX_UAT_04_R1/dispatch_runner.ps1) | 12,321 bytes | `2E64E59A6087E7F70CF31E5469B7A49B2A0B9A6D4DA1951C930550E885A4F836` | Sanitized personal user paths (`C:\Users\allda\...`) with explicit `param(...)` block and script-relative paths. NOT executed under R2. |

---

## 6. Scoped Field Comparison Table (20 Published Fields)

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

## 7. Strict Non-Claims & Governance
```text
WORKFLOW_PROGRESSION = NOT TESTED
FULL_DECISION_008_RUNTIME_COMPLIANCE = NOT CLAIMED
SYSTEM_WIDE_TEMPORAL_DECOUPLING = NOT CLAIMED
FULL_REPOSITORY_INTEGRATION_TEST = NOT CLAIMED
FULL_D3_BUSINESS_UAT = NOT CLAIMED
D3_CLOSURE = NOT CLAIMED
PRODUCTION_READY = NO
R2_INDEPENDENT_REVIEW = NOT CLAIMED / AWAITING CHATGPT REVIEW
```

---

## 8. Terminal Governance State
```text
ACTIVE_WORK_PACKAGE = NONE
NEXT_GATE_AUTHORIZED = NO
AUTO_START_NEXT_WORK_PACKAGE = NO
KINTONE_READ_AUTHORIZED = NO
KINTONE_WRITE_AUTHORIZED = NO
PROCESS_WRITE_AUTHORIZED = NO
DEPLOYMENT_AUTHORIZED = NO
UAT_AUTHORIZED = NO
REVIEW_REQUIRED = YES
```
