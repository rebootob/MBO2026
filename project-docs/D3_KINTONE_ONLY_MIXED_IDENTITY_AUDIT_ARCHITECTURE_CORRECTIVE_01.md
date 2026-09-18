# D3 Architecture & Control Corrective — Kintone-Only Mixed-Identity Audit Architecture

## Document Control Header

```text
DOCUMENT_ID                  = D3-KINTONE-ONLY-MIXED-IDENTITY-AUDIT-ARCHITECTURE-CORRECTIVE-01
PACKAGE                      = D3-KINTONE-ONLY-MIXED-IDENTITY-AUDIT-ARCHITECTURE-CORRECTIVE-01
AUTHORIZATION_ID             = MBO2026-D3-KINTONE-ONLY-MIXED-IDENTITY-AUDIT-ARCHITECTURE-CORRECTIVE-01-20260918-OWNER-01
CANONICAL_BRANCH             = ai/antigravity-wp002c
AUTHORIZED_BASE_HEAD         = 3e2e3c353ca27e2829e6d86b022c6fb89ca8bcda
MODE                         = ARCHITECTURE_AND_CONTROL_CORRECTIVE / ZERO SOURCE MUTATION / ZERO LIVE EXECUTION
STATUS                       = PROPOSED_FOR_INDEPENDENT_CONTROL_PLANE_REVIEW
OWNER_AUTHORIZATION          = EXPLICITLY APPROVED (2026-09-18)
HISTORICAL_DECISION_009      = PRESERVED_AS_PROVENANCE / RECOMMENDED_FOR_SUPERSEDING
TARGET_ARCHITECTURE          = KINTONE_ONLY_MIXED_IDENTITY_AUDIT_ARCHITECTURE
SCHEMA_EXTENSION_STATUS      = SCHEMA_EXTENSION_REQUIRED (DOCUMENTED ONLY / ZERO LIVE CHANGES)
LIVE_KINTONE_READS           = 0
LIVE_KINTONE_WRITES          = 0
REAL_OAUTH_ACTIONS           = 0
EXTERNAL_INFRASTRUCTURE      = NONE (ZERO REDIS / ZERO SQL / ZERO CLOUD RUNTIME / ZERO EXTERNAL VAULT)
SOURCE_CHANGES               = 0
TEST_CHANGES                 = 0
```

---

## 1. Executive Summary & Owner Intent

1. **Foundational Kintone-Only Principle:**
   MBO2026 is authoritatively defined as a **Kintone-only** Management By Objectives solution (`PROJECT_CONTEXT.md`).
   The production architecture **MUST NOT** require or depend upon:
   - External backend services or APIs (e.g. Node.js daemon, express gateway server, external microservices).
   - External state stores or databases (e.g. Redis, PostgreSQL, MySQL).
   - External cloud runtimes (e.g. AWS Lambda, ECS, Cloud Run).
   - External secret vaults (e.g. HashiCorp Vault, AWS Secrets Manager).
   - Separate external OAuth infrastructure, redirect listeners, or token-brokering daemons.

2. **Reuse of Existing Identity Architecture:**
   The project has already established and accepted a comprehensive Kintone-only Hybrid Identity baseline (governed under `CONFIRMED_BASELINE/D1_HYBRID_IDENTITY_ACCESS_DESIGN.md`, `D1_AUTH_SECURITY.md`, `src/services/mbo-identity-service.js`, `src/ui/mbo-kintone-login-gate.js`, and `src/ui/mbo-session-manager.js`).
   This existing identity model **MUST** be reused as the foundation for D3 audit attribution.
   Creating a second, divergent login, PIN, or credential system is strictly prohibited.

3. **Corrective Purpose:**
   This corrective replaces the invalid architectural assumption that satisfying D3 immutable audit requirements requires an external trusted backend with OAuth client infrastructure. It establishes the authoritative Kintone-only mixed-identity audit contract, specifies the exact data flow through the App 794 action/archive seam into App 798, documents the required App 798 schema extensions, and provides the formal supersession rationale for Owner Decision 009.

---

## 2. Authoritative Existing Identity Model

The repository already defines and exercises two distinct principal execution modes in production:

### 2.1 Mode 1: Dedicated / Personal Kintone User (`DEDICATED`)
- **User Context:** An employee who possesses an individual, dedicated Kintone user account on the tenant.
- **Authoritative Resolution Path:**
  ```text
  kintone.getLoginUser().code
        │
        ▼
  App 53 (MBO_Kintone_User mapping: Number_0 = 1, emp_text)
        │
        ▼
  Canonical Employee_Code (e.g., "EMP00042")
  ```
- **UX Invariant:** Dedicated users are already authenticated by Cybozu/Kintone. No secondary login prompt, PIN dialog, or credential entry is presented.
- **Fail-Closed Rule:** If the App 53 mapping is missing, deactivated (`Number_0 != 1`), ambiguous (multiple active rows for same user code), or invalid, identity resolution **FAILS CLOSED** (`DEDICATED_MAPPING_NOT_FOUND` / `DEDICATED_MAPPING_AMBIGUOUS`). The system MUST NOT guess the employee code or fall back to ambient values.

### 2.2 Mode 2: Shared Kintone User (`SHARED`)
- **User Context:** Multiple branch or department employees accessing Kintone through an approved shared departmental principal (`t1`, `t2`, `s1`, `f1`, `f2`, `f3`, `e1`, `tmh`, `g_request`).
- **Authoritative Resolution Path:**
  ```text
  Shared Kintone Principal (e.g., "f2")
        │
        ▼
  MboKintoneLoginGate (src/ui/mbo-kintone-login-gate.js)
        │
        ▼
  MboSessionManager (src/ui/mbo-session-manager.js) / App 801 (Session Store)
        │
        ▼
  Authenticated Employee_Code (e.g., "EMP00125")
  ```
- **Session & Identity Binding:**
  - The shared login gate challenges the human operator for their employee credentials/PIN.
  - Upon successful verification against App 801, `MboSessionManager` issues a session cryptographically bound to both `employeeCode` and `currentKintoneUserCode`.
  - The in-memory principal holds the verified `employeeCode`.
- **Prohibition:** Creating a duplicate or secondary PIN/login prompt for D3 workflow actions is forbidden. The active authenticated employee identity from the existing `MboKintoneLoginGate` MUST be directly queried and reused.

---

## 3. Owner Lock — Shared Account Audit Identity Contract

### 3.1 Non-Collapsible Dual Identity Contract
In a shared account environment, a single identifier is inherently incomplete:
- Storing only `kintone.getLoginUser().code` (e.g. `f2`) hides *which* human employee performed the action, defeating non-repudiation.
- Storing only `Employee_Code` (e.g. `EMP00125`) hides *which* Kintone principal was utilized, breaking Kintone platform tenant traceability and permission auditing.

**Owner Lock Rule:**
For `Identity_Mode = SHARED`, audit evidence MUST preserve BOTH:
1. `Actual_Operator_Employee_Code`: The verified human employee identity authenticated through the MBO Login Lock / active App 801 session.
2. `Kintone_Login_User_Code`: The underlying Kintone account principal (`kintone.getLoginUser().code`) through which the action traversed the SaaS platform.

The implementation and schema MUST NOT collapse, concatenate into an ambiguous string, or discard either of these two identities.

### 3.2 Concrete Identity Tuples

#### Example A: Shared Account Operation
- `Identity_Mode`: `SHARED`
- `Actual_Operator_Employee_Code`: `EMP00125`
- `Kintone_Login_User_Code`: `f2`
- **Audit Meaning:** Employee `EMP00125` was the authenticated human operator who performed the business workflow action, operating via approved shared Kintone account `f2`.

#### Example B: Dedicated User Operation
- `Identity_Mode`: `DEDICATED`
- `Actual_Operator_Employee_Code`: `EMP00042`
- `Kintone_Login_User_Code`: `somchai.p`
- **Audit Meaning:** Employee `EMP00042` performed the action using their individual dedicated Kintone account `somchai.p` (verified via App 53 mapping).

---

## 4. Universal Audit Requirements for App 794 Workflow Actions

For every auditable App 794 workflow action (including `SUBMIT`, `APPROVE`, `REJECT`, `SEND_BACK`, `STAGE_COMPLETION`, `REASSIGN_EVALUATOR`, and `REVISION_CREATE`), the audit record MUST capture and permanently preserve the following 10-point audit tuple:

```text
========================================================================================
FIELD / ATTRIBUTE       LOGICAL TYPE           AUDIT DESCRIPTION & GOVERNANCE SEMANTICS
========================================================================================
1. WHO                  Employee_Code          Actual authenticated operator (EMPxxxxx)
2. LOGIN_ACCOUNT        Kintone_User_Code      Exact Kintone account (kintone.getLoginUser().code)
3. IDENTITY_MODE        Enum ['SHARED','DEDICATED'] Architectural mode under which action ran
4. WHAT                 Action_Name            Business action (SUBMIT, APPROVE, REJECT, etc.)
5. RECORD               Record_ID / Key        App 794 Target record identity ($id / Record_Key)
6. FROM_STATUS          Status_String          Authoritative workflow status immediately prior
7. TO_STATUS            Status_String          Authoritative workflow status resulting from action
8. WHEN                 ISO-8601 UTC Datetime  Timestamp of event with explicit timezone offset
9. REASON               Text                   Business justification when required by policy
10. SNAPSHOT            SHA-256 / Canonical    Deterministic snapshot and hash of record state
========================================================================================
```

---

## 5. Fail-Closed Requirements

Audit integrity is a hard prerequisite for state mutation. If identity or audit context cannot be definitively proven, the workflow action MUST fail closed.

### 5.1 Shared Mode Fail-Closed Invariants
If `Identity_Mode === 'SHARED'`:
1. If the existing Login Lock / session manager cannot resolve an authenticated `Employee_Code`:
   - **ABORT IMMEDIATELY** (`return false` / reject action).
   - Do **NOT** execute the Kintone Process Management transition.
   - Do **NOT** write an audit record with a missing or null operator employee code.
   - Do **NOT** attribute the action to the generic shared Kintone account (e.g. attributing the action to "f2" as the employee).
   - Do **NOT** guess employee identity from the record's target employee, assignees, or history.
   - Do **NOT** fall back to `Requester_User` or any other field on the record.
   - Do **NOT** write incomplete audit evidence.

### 5.2 Dedicated Mode Fail-Closed Invariants
If `Identity_Mode === 'DEDICATED'`:
1. If App 53 identity lookup fails, returns no matching active record, returns multiple active records, or yields an empty `emp_text`:
   - **ABORT IMMEDIATELY** (`DEDICATED_MAPPING_FAILED`).
   - Do **NOT** execute the workflow transition.
   - Do **NOT** guess the `Employee_Code` from Kintone username, email, or display name.

---

## 6. Independent Repository Truth Verification

The repository was independently inspected on branch `ai/antigravity-wp002c` at HEAD `3e2e3c353ca27e2829e6d86b022c6fb89ca8bcda`.

### 6.1 `resolveRuntimeEmployeeSelfContext()` Verification
- **Location:** `src/main-mbo-app.js` (lines 168–245)
- **Observed Repository Logic:**
  - Checks `kintone.getLoginUser().code`.
  - Determines principal mode via `MboIdentityService.resolveKintonePrincipalMode({ kintoneUserCode })`.
  - For `SHARED`: calls `mboLoginGate.requireLogin(uiHost)`. On success, returns:
    `{ status: 'SUCCESS', context: { mode: 'SHARED', employeeCode, kintoneUserCode } }`.
  - For `DEDICATED`: calls `EmployeeService.lookupDedicatedIdentityMappingCandidates()` and `MboIdentityService.resolveDedicatedKintoneUserMapping()`. On success, returns:
    `{ status: 'SUCCESS', context: { mode: 'DEDICATED', employeeCode: mappingRes.employeeCode, kintoneUserCode } }`.
- **Conclusion:** The application runtime ALREADY resolves the exact `{ mode, employeeCode, kintoneUserCode }` tuple required by the Owner's audit contract.

### 6.2 `MboKintoneLoginGate` & `MboSessionManager` Verification
- **Location:** `src/ui/mbo-kintone-login-gate.js` & `src/ui/mbo-session-manager.js`
- **Observed Repository Logic:**
  - `MboKintoneLoginGate` gates UI interactions and stores authenticated state in `this._principal.employeeCode`.
  - `MboSessionManager` generates session records in App 801 storing:
    `{ employeeCode, tokenHash, issuedAt, expiresAt, kintoneUserCode }`.
  - Sessions are strictly bound to both the employee code AND the Kintone principal code.
- **Conclusion:** The shared identity infrastructure is mature, fully tested, and authoritatively provides the verified employee code.

### 6.3 Current D3 Archive Seam Defect Verification
- **Location:** `src/main-mbo-app.js` (`executeStageCompletionArchive`, lines 1385–1421)
- **Observed Repository Logic:**
  ```javascript
  const loginUser = options.loginUser || ((typeof kintone !== 'undefined' && typeof kintone.getLoginUser === 'function') ? kintone.getLoginUser() : null);
  const actorCode = String(options.actor || loginUser?.code || '').trim();
  ...
  const archiveResult = await archiveService.archiveStageCompletion({
    sourceRecordKey: String(record?.Record_Key?.value || ...),
    employeeCode: String(record?.Employee_Code?.value || ...),
    ...
    actor: { userCode: actorCode },
    ...
  });
  ```
- **Defect Identified:**
  - `actorCode` is derived exclusively from `kintone.getLoginUser().code`.
  - For `SHARED` mode (e.g. login user `f2`), `actor: { userCode: 'f2' }` is passed to the archive service.
  - The actual authenticated employee code (e.g. `EMP00125`) is **NOT** passed to the archive service.
  - The `Employee_Code` passed (`record?.Employee_Code?.value`) is the **subject** of the evaluation form (the employee whose performance is being appraised), NOT the operator! When a supervisor (e.g. `EMP00005`) evaluates an employee (e.g. `EMP00125`) under shared account `f2`, the archive record currently loses the identity of the supervisor entirely.
- **Conclusion:** Repository truth confirms the Owner's finding: the current D3 archive path correctly captures Kintone principal provenance, but is defective and insufficient for human operator attribution under `SHARED` mode.

---

## 7. App 794 Action / Archive Seam Remediation Architecture

To fulfill the Owner Lock, the App 794 action seam must be updated as follows (architectural specification for future implementation package):

```text
       App 794 Workflow Action Trigger (e.g. Process Transition Event)
                                  │
                                  ▼
                resolveRuntimeEmployeeSelfContext(uiHost)
                                  │
                ┌─────────────────┴─────────────────┐
                │                                   │
      status !== 'SUCCESS'                  status === 'SUCCESS'
                │                                   │
                ▼                                   ▼
        FAIL CLOSED                        Extract Context:
        - Block Transition                 - identityMode = context.mode
        - Show Error to User               - operatorEmployeeCode = context.employeeCode
        - Return false                     - kintoneUserCode = context.kintoneUserCode
                                                    │
                                                    ▼
                                   Archive Service Call (Stage Completion / Audit)
                                   Payload includes:
                                   - Identity_Mode: identityMode
                                   - Operator_Employee_Code: operatorEmployeeCode
                                   - Operator_Kintone_Code: kintoneUserCode
                                   - Subject_Employee_Code: record.Employee_Code
                                   - Action_Name: intendedAction
                                   - Previous_Status: currentStatus
                                   - To_Status: nextStatus
                                   - Snapshot / Hash / Reason / Timestamp
                                                    │
                                                    ▼
                                   App 798 Immutable Audit Record Written
                                                    │
                                                    ▼
                                   Process Management Transition Allowed
```

---

## 8. App 798 Schema Gap Analysis & Extension Specification

### 8.1 Current App 798 Field Inventory
Inspection of `src/services/revision-archive-service.js` and `src/services/revision-archive-kintone-repository.js` reveals the exact current field set of App 798:

| # | Current Field Code | Kintone Field Type | Current Semantic Usage in Code |
|---|--------------------|-------------------|--------------------------------|
| 1 | `Archive_Key` | SINGLE_LINE_TEXT | Unique deduplication key |
| 2 | `Source_Record_Key` | SINGLE_LINE_TEXT | App 794 Record_Key |
| 3 | `Fiscal_Year` | SINGLE_LINE_TEXT | Fiscal year string |
| 4 | `Employee_Code` | SINGLE_LINE_TEXT | **Subject** employee of evaluation record |
| 5 | `Evaluation_Stage` | SINGLE_LINE_TEXT / DROP_DOWN | OBJECTIVE / MIDYEAR / FINAL |
| 6 | `Revision_Number` | NUMBER | Revision integer |
| 7 | `Event_Type` | SINGLE_LINE_TEXT / DROP_DOWN | STAGE_COMPLETION_SNAPSHOT, etc. |
| 8 | `Reason` | MULTI_LINE_TEXT | Stage change / revision reason |
| 9 | `Snapshot_JSON` | MULTI_LINE_TEXT | Canonical JSON serialization |
| 10 | `Snapshot_Hash` | SINGLE_LINE_TEXT | SHA-256 hash |
| 11 | `Archived_By` | USER_SELECT | `[{ code: actorUserCode }]` (Kintone User) |
| 12 | `Archived_At` | DATETIME | ISO-8601 timestamp |
| 13 | `Source_Record_ID` | NUMBER | App 794 $id |
| 14 | `Previous_Status` | SINGLE_LINE_TEXT | Status prior to action |
| 15 | `Superseded_By_Revision` | NUMBER | Next revision pointer |

### 8.2 Schema Gap Finding
- Current App 798 has **NO** field for `Identity_Mode` (`SHARED` vs `DEDICATED`).
- Current App 798 has **NO** field for `Operator_Employee_Code` (the actual human operator's employee code). The existing `Employee_Code` field is dedicated to the **subject** employee of the MBO evaluation.
- Current App 798 has `Archived_By` (`USER_SELECT`), which records the Kintone user account, but cannot accept an employee code string (e.g. `EMP00125`) because `USER_SELECT` requires registered Cybozu user objects.
- Current App 798 has `Previous_Status` (`FROM_STATUS`), but lacks an explicit `To_Status` field and an explicit `Action_Name` field.

### 8.3 Formal Schema Extension Declaration

```text
STATUS = SCHEMA_EXTENSION_REQUIRED
ZERO_LIVE_SCHEMA_CHANGES_IN_THIS_PACKAGE = YES
```

To support the Kintone-Only Mixed-Identity Audit Architecture, the following minimal, exact schema extension for App 798 is specified for authorization in a subsequent implementation package:

```text
====================================================================================================
PROPOSED FIELD CODE         KINTONE FIELD TYPE     REQUIRED    PERMITTED VALUES / FORMAT
====================================================================================================
1. Identity_Mode            DROP_DOWN / TEXT       YES         'SHARED' | 'DEDICATED'
2. Operator_Employee_Code   SINGLE_LINE_TEXT       YES         Format: ^EMP\d{5}$ (e.g. EMP00125)
3. Operator_Kintone_Code    SINGLE_LINE_TEXT       YES         Kintone login name (e.g. f2, somchai.p)
4. Action_Name              SINGLE_LINE_TEXT       YES         e.g. SUBMIT, APPROVE, REJECT, ARCHIVE
5. To_Status                SINGLE_LINE_TEXT       YES         Resulting workflow status
====================================================================================================
```
*Note: `Archived_By` (USER_SELECT) remains populated with the ambient Kintone login principal (`[{ code: kintoneLoginUserCode }]`), preserving backwards-compatibility and platform user auditing.*

---

## 9. Historical Decision Provenance & Supersession Recommendation

### 9.1 Provenance of Decision 009
In Owner Decision 009 (`D3_DECISION_009_PLATFORM_STAMPED_OAUTH_ATTESTATION_ARCHITECTURE_RATIFICATION.md`), the architecture `NATIVE_KINTONE_PLATFORM_STAMPED_OAUTH_ATTESTATION` was ratified under the following historical assumptions:
1. App 798 ACL was locked to `USER hr: Addable=YES, Viewable=YES` and `GROUP everyone: Addable=NO, Viewable=NO`.
2. Direct client writes by employees to App 798 returned `HTTP 403 Forbidden` (`GAIA_IL02`).
3. To bypass this without giving employees App 798 write access or storing a privileged secret in the browser, an external trusted backend with OAuth and a dedicated Attestation App was designed.

### 9.2 Conflict with Clarified Owner Intent
On 2026-09-18, the Project Owner issued an explicit, authoritative clarification:
1. **MBO2026 is strictly a KINTONE-ONLY solution.**
2. External backends, Redis, SQL databases, cloud container runtimes, external secret vaults, and separate OAuth client infrastructure are **EXPRESSLY REJECTED**.
3. The existing MBO identity model (Shared + Dedicated) **MUST BE REUSED**.

Decision 009's requirement for an external trusted backend and token store directly violates the Owner's Kintone-only mandate.

### 9.3 Formal Recommendation for Independent Control Plane Review
It is formally recommended that the Independent Control Plane:
1. Review and accept this corrective document (`D3_KINTONE_ONLY_MIXED_IDENTITY_AUDIT_ARCHITECTURE_CORRECTIVE_01`).
2. Mark Owner Decision 009 as **SUPERSEDED BY OWNER MANDATE** in project control documents (`00_MASTER_DELIVERY_CONTROL.md`, `02_ACTIVE_WORK_PACKAGE.md`, `AI_CONTROL_CENTER.md`).
3. Formally ratify the **KINTONE_ONLY_MIXED_IDENTITY_AUDIT_ARCHITECTURE** as the canonical architectural baseline for D3.
4. Authorize a bounded implementation work package to:
   - Perform the specified 5-field App 798 schema extension.
   - Adjust App 798 Kintone permissions to support native Kintone audit record appending (e.g. `GROUP everyone: Add=YES, View=NO` to allow append-only write while preserving strict read confidentiality for HR only).
   - Update the App 794 action/archive seam in `src/main-mbo-app.js` and `src/services/revision-archive-service.js` to populate the dual identity fields and fail closed on unauthenticated shared sessions.

---

## 10. Security & Governance Invariants

```text
OWNER_AUTHORIZATION_ID       = MBO2026-D3-KINTONE-ONLY-MIXED-IDENTITY-AUDIT-ARCHITECTURE-CORRECTIVE-01-20260918-OWNER-01
LIVE_KINTONE_READS           = 0
LIVE_KINTONE_WRITES          = 0
REAL_OAUTH_AUTHORIZATIONS    = 0
REAL_TOKEN_EXCHANGES         = 0
OAUTH_CLIENT_REGISTRATIONS   = 0
ATTESTATION_APP_CREATES      = 0
SCHEMA_WRITES                = 0
ACL_WRITES                   = 0
DEPLOYMENTS                  = 0
UAT_ACTIONS                  = 0
LIVE_PROVISIONING_AUTHORIZED = NO
DEPLOYMENT_AUTHORIZED        = NO
UAT_AUTHORIZED               = NO
NEXT_GATE_AUTHORIZED         = NO
AUTO_START_NEXT_WORK_PACKAGE = NO
FINAL_STATE                  = STOP FOR INDEPENDENT CONTROL PLANE REVIEW THEN OWNER DECISION
```
