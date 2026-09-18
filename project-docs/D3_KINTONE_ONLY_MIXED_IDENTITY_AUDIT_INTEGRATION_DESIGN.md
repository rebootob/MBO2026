# D3 Kintone-Only Mixed Identity Audit Integration Design

## Document Metadata
```text
PACKAGE                      = D3-KINTONE-ONLY-MIXED-IDENTITY-AUDIT-INTEGRATION-DESIGN-01
AUTHORIZATION_ID             = MBO2026-D3-KINTONE-ONLY-MIXED-IDENTITY-AUDIT-INTEGRATION-DESIGN-01-20260918-OWNER-01
STATUS                       = DESIGN_CONTRACT_PROPOSED
GOVERNANCE                   = STRICT ORBIS 3-TIER ARCHITECTURE
CURRENT_AUTHORITY            = OWNER_DEC_D3_010 (D3_DECISION_010_KINTONE_ONLY_SCOPE_RECONCILIATION.md)
CURRENT_SYSTEM_BOUNDARY      = KINTONE_ONLY
CURRENT_ARCHITECTURE_TARGET  = KINTONE_ONLY_MIXED_IDENTITY_BUSINESS_AUDITABILITY
CURRENT_SECURITY_TARGET      = BUSINESS_AUDITABILITY_AND_TRACEABILITY
TARGET_AUDIT_APP             = Kintone App 798 (Revision Archive)
SOURCE_WORKFLOW_APP          = Kintone App 794 (MBO Transactional Workflow)
AUTHENTICATED_SESSION_APP    = Kintone App 801 (MBO Shared Login Lock)
DEDICATED_MAPPING_APP        = Kintone App 53 (Employee Master)
GAP_TO_CLOSE                 = LIVE_SHARED_ACTUAL_OPERATOR_GAP = PRESENT
```

---

## 1. Executive Summary & Purpose

### 1.1 Context and Problem Statement
In accordance with `OWNER_DEC_D3_010`, the MBO2026 project operates exclusively under a **Kintone-Only** system boundary. Previous exploratory work (Decision 009) proposing an external backend, OAuth custody, Redis, and cryptographic attestation services has been classified as historical and is strictly out of scope.

Live bundle verification (Revision 76, SHA-256 `c2049fba52d4fb6e82faf767ff359f37dbafab57aea1e9dada74c022b884989f`) established:
- `LIVE_DEPLOYED_D3_PATH = LEGACY_EXECUTE_PROCESS_TRANSITION_ARCHIVE_PATH` (Active)
- `LIVE_STANDARD_CALLER_OPTIONS_ACTOR = NOT_SUPPLIED`
- `LIVE_SHARED_ACTUAL_OPERATOR_GAP = PRESENT`

Because the live event caller invokes `executeProcessTransitionArchive(record, event, { apiAdapter: kintoneApiWrapper })` without passing `options.actor`, actor resolution falls back to `kintone.getLoginUser().code`. In `SHARED` mode, this captures only the shared account login code (e.g., `f2`), completely discarding the authenticated human employee identity established via the existing MBO Login Lock (App 801).

### 1.2 Purpose of this Document
This document defines the **exact design and interface contract** for integrating the runtime identity context (`currentEmployeeSelfContext`) into the App 794 transition pipeline and App 798 audit archive seam within the Kintone-Only boundary. 

This design establishes:
1. Complete separation of the **Three Identity Roles** (`Subject Employee`, `Actual Operator`, `Kintone Login Principal`).
2. Exact schema and data contract for 5 additional audit fields in App 798.
3. Strict fail-closed validation rules.
4. Seamless integration with existing runtime singletons without introducing a second login, second PIN, or external dependencies.

---

## 2. Identity Model & Contract

### 2.1 The Three Distinct Identity Roles
The implementation contract strictly enforces that these three identity concepts must remain distinct and never collapse or fallback into each other:

| Role Identity | Logical Field Name | Source / Meaning | Collapse Rule |
| :--- | :--- | :--- | :--- |
| **1. Subject Employee** | `Employee_Code` | `App794.Employee_Code` — The employee being evaluated. | **NEVER** collapses to operator. Evaluation subject is not the operator. |
| **2. Actual Operator** | `Actual_Operator_Employee_Code` | Authenticated human employee performing the workflow action. | **NEVER** falls back to Subject Employee or Login Account. |
| **3. Kintone Login Principal**| `Kintone_Login_User_Code` | `kintone.getLoginUser().code` — The Kintone tenant account executing the browser session. | Retained distinctly as the browser session transport principal. |

`SUBJECT_EMPLOYEE_IS_OPERATOR = NO`

### 2.2 Operational Modes: SHARED vs DEDICATED

#### A. SHARED Mode
- **Operating Context:** Shared workstation/terminal using a pooled Kintone account (e.g., `f2`).
- **Identity Source:** Authenticated employee session established via existing `MboKintoneLoginGate` / `MboSessionManager` / App 801.
- **Contract:**
  - `Identity_Mode` = `'SHARED'`
  - `Actual_Operator_Employee_Code` = `currentEmployeeSelfContext.employeeCode` (e.g., `'EMP00125'`)
  - `Kintone_Login_User_Code` = `currentEmployeeSelfContext.kintoneUserCode` (e.g., `'f2'`)
  - `Archived_By` = Kintone `USER_SELECT` object containing `[{ code: 'f2' }]`
- **Audit Meaning:** *Human employee `EMP00125` performed the action through shared Kintone account `f2`.*

#### B. DEDICATED Mode
- **Operating Context:** Named employee operating under their own personal Kintone user account.
- **Identity Source:** Authoritative App 53 mapping verified during app bootstrap.
- **Contract:**
  - `Identity_Mode` = `'DEDICATED'`
  - `Actual_Operator_Employee_Code` = Authoritative App 53 mapped employee code from `currentEmployeeSelfContext.employeeCode` (e.g., `'EMP00042'`)
  - `Kintone_Login_User_Code` = `currentEmployeeSelfContext.kintoneUserCode` (e.g., `'john.doe'`)
  - `Archived_By` = Kintone `USER_SELECT` object containing `[{ code: 'john.doe' }]`
- **Audit Meaning:** *Human employee `EMP00042` performed the action through their dedicated Kintone account `john.doe`.*

### 2.3 Login & Credential Contract
- `NO_SECOND_LOGIN = YES`
- `NO_SECOND_PIN = YES`
- The system must **reuse existing runtime state** (`currentEmployeeSelfContext`). No additional prompt, modal, PIN screen, or secondary lookup is allowed during workflow transitions.

---

## 3. App 798 Audit Schema & Field Contract

### 3.1 New Audit Fields Specification
To capture the complete business audit trail, exactly **5 new logical fields** are defined for Kintone App 798:

```text
+--------------------------------+--------------------+-----------+-----------------------------------+
| Field Code                     | Kintone Field Type | Required? | Source / Format                   |
+--------------------------------+--------------------+-----------+-----------------------------------+
| Identity_Mode                  | DROP_DOWN          | YES (D3)  | 'SHARED' | 'DEDICATED'            |
| Actual_Operator_Employee_Code  | SINGLE_LINE_TEXT   | YES (D3)  | Exact employee string (e.g. EMP..) |
| Kintone_Login_User_Code        | SINGLE_LINE_TEXT   | YES (D3)  | Lowercase/trimmed Kintone code    |
| Action_Name                    | SINGLE_LINE_TEXT   | YES (D3)  | Workflow action (e.g. Complete)   |
| To_Status                      | SINGLE_LINE_TEXT   | YES (D3)  | Resulting status (e.g. 16 Compl..) |
+--------------------------------+--------------------+-----------+-----------------------------------+
```

#### Detailed Field Constraints:
1. **`Identity_Mode`**
   - **Type:** `DROP_DOWN`
   - **Options:** `['SHARED', 'DEDICATED']`
   - **Constraints:** Must match exact uppercase enum.
   - **Requiredness:** Mandatory for all new D3 archive records.
   - **Historical Rows / Backfill:** Default to blank or `'LEGACY_UNSPECIFIED'` for pre-D3 records. No mandatory backfill.
   - **Fail-Closed:** If not `'SHARED'` or `'DEDICATED'`, reject transition.

2. **`Actual_Operator_Employee_Code`**
   - **Type:** `SINGLE_LINE_TEXT`
   - **Constraints:** Max 64 characters, trimmed, non-empty string.
   - **Requiredness:** Mandatory for all new D3 archive records.
   - **Historical Rows / Backfill:** Blank on historical records.
   - **Fail-Closed:** If unresolved or empty string, reject transition.

3. **`Kintone_Login_User_Code`**
   - **Type:** `SINGLE_LINE_TEXT`
   - **Constraints:** Max 64 characters, trimmed, non-empty string.
   - **Requiredness:** Mandatory for all new D3 archive records.
   - **Historical Rows / Backfill:** In historical records, can be inferred from `Archived_By.code` if needed, but schema allows blank for historical.
   - **Fail-Closed:** If unresolved, reject transition.

4. **`Action_Name`**
   - **Type:** `SINGLE_LINE_TEXT`
   - **Constraints:** Max 128 characters, string.
   - **Value:** `event.action.value` (e.g., `'Start Mid-Year'`, `'Start Self Evaluation'`, `'Complete'`).
   - **Requiredness:** Mandatory for all new D3 archive records.

5. **`To_Status`**
   - **Type:** `SINGLE_LINE_TEXT`
   - **Constraints:** Max 128 characters, string.
   - **Value:** `event.nextStatus.value` (e.g., `'06 Employee Mid-Year'`, `'11 Employee Self Evaluation'`, `'16 Completed'`).
   - **Requiredness:** Mandatory for all new D3 archive records.

### 3.2 Compatibility with Existing Fields
All 15 existing App 798 fields are preserved with their exact current semantics:
- `Archive_Key` (Primary natural key: `{Source_Record_Key}_REV{Revision_Number}_{Evaluation_Stage}`)
- `Source_Record_ID`, `Source_Record_Key`, `Fiscal_Year`, `Evaluation_Stage`, `Revision_Number`, `Previous_Status`, `Superseded_By_Revision`, `Event_Type`, `Reason`, `Snapshot_JSON`, `Snapshot_Hash`, `Archived_At`.
- **`Employee_Code`:** Strictly preserved as **SUBJECT EMPLOYEE** (`App794.Employee_Code`).
- **`Archived_By`:** Preserved as Kintone `USER_SELECT`. Represents the physical Kintone login principal (`kintone.getLoginUser().code`). In `SHARED` mode, `Archived_By` records `f2` while `Actual_Operator_Employee_Code` records `EMP00125`.

---

## 4. Architectural Call Chain & Component Design

### 4.1 Target Call Flow
```text
[Browser Process Action Click]
               │
               ▼
   kintone.events.on('app.record.detail.process.proceed')
               │
               ├─► [1] Read `currentEmployeeSelfContext` (via getEmployeeSelfContext())
               │       Verify: mode, employeeCode, kintoneUserCode
               │
               ├─► [2] Validate Identity Integrity
               │       Verify: kintoneUserCode === kintone.getLoginUser().code
               │       Fail-closed: If invalid, event.error = msg; return false;
               │
               ├─► [3] Call `executeProcessTransitionArchive(record, event, options)`
               │       Inject options:
               │       - identityContext: { mode, employeeCode, kintoneUserCode }
               │       - actionName: event.action.value
               │       - nextStatus: event.nextStatus.value
               │
               ▼
   executeProcessTransitionArchive(...)
               │
               ├─► Check target transition stage ('OBJECTIVE', 'MIDYEAR', 'FINAL')
               │
               ├─► Validate options.identityContext
               │
               ├─► Delegate to `RevisionArchiveService.archiveStageCompletion(...)`
               │
               ▼
   RevisionArchiveService
               │
               ├─► Validate Snapshot Coherence (Employee_Code = Subject Employee)
               │
               ├─► Construct Audit Payload:
               │   - Subject: request.employeeCode
               │   - Identity_Mode: request.identityContext.mode
               │   - Actual_Operator: request.identityContext.employeeCode
               │   - Kintone_Login: request.identityContext.kintoneUserCode
               │   - Action_Name: request.actionName
               │   - To_Status: request.toStatus
               │   - Archived_By: [{ code: request.identityContext.kintoneUserCode }]
               │
               ▼
   RevisionArchiveKintoneRepository
               │
               ├─► App 798 `addRecord`
               └─► Readback & Integrity Verification (Fail-Closed)
```

### 4.2 Error Handling & Fail-Closed Conditions
The transition and archive pipeline must fail closed (block process transition by returning `false` or setting `event.error` in Kintone event handler) under any of the following failure conditions:

1. `MISSING_IDENTITY_CONTEXT`: `currentEmployeeSelfContext` is null or undefined.
2. `UNSUPPORTED_IDENTITY_MODE`: `context.mode` is not `'SHARED'` or `'DEDICATED'`.
3. `ACTUAL_OPERATOR_UNRESOLVED`: `context.employeeCode` is null, empty string, or whitespace.
4. `KINTONE_LOGIN_USER_UNRESOLVED`: `context.kintoneUserCode` or `kintone.getLoginUser().code` is empty.
5. `IDENTITY_CONTEXT_MISMATCH`: `context.kintoneUserCode` does not match active `kintone.getLoginUser().code`.
6. `SUBJECT_COLLAPSE_ATTEMPT`: Any attempt to set `Actual_Operator_Employee_Code` from `record.Employee_Code` when context is absent.
7. `ARCHIVE_PERSISTENCE_FAILED`: Kintone REST API rejects App 798 write or readback verification fails.

---

## 5. Security & Governance Boundaries

1. **System Boundary:** `KINTONE_ONLY`. No cloud functions, no webhooks, no external servers.
2. **Security Posture:** `BUSINESS_AUDITABILITY_AND_TRACEABILITY`. The system guarantees clear traceability of human actors and login accounts for organizational compliance. It does not claim cryptographic non-repudiation.
3. **Anti-Forgery Position:** `KINTONE_ONLY_PLATFORM_LEVEL_ANTI_FORGERY = NOT_PROVEN`. Client-side JavaScript operates within the browser runtime; business trust is established via strict session management and internal Kintone process permissions.

---

## 6. Implementation Readiness Plan (Next Packages)

Execution of code changes is **strictly prohibited** in this package. Following independent Control Plane review and Owner authorization, implementation will proceed via bounded packages:

1. **Package 1 (Schema & Test Fixtures):** App 798 field additions in Kintone tenant & unit test mock updates.
2. **Package 2 (Service Layer):** Update `RevisionArchiveService` and `RevisionArchiveKintoneRepository` to handle new identity fields.
3. **Package 3 (Workflow Integration):** Update `main-mbo-app.js` caller in `app.record.detail.process.proceed`.
4. **Package 4 (Verification & UAT):** Local test suite execution (expecting 25+ passing tests), build dist bundle, and staged UAT in SHARED and DEDICATED modes.

---

## 7. Package Self-Audit & Limits Verification
```text
SOURCE_CHANGES                     = 0
TEST_CHANGES                       = 0
KINTONE_READS                      = 0
KINTONE_WRITES                     = 0
SCHEMA_WRITES                      = 0
ACL_WRITES                         = 0
PROCESS_WRITES                     = 0
RECORD_WRITES                      = 0
FILE_UPLOADS                       = 0
DEPLOYMENTS                        = 0
UAT_EXECUTED                       = 0
EXTERNAL_INFRASTRUCTURE            = 0
```
This design document completely establishes the implementation contract without altering any runtime or repository source code.
