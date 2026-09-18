# D3 Architecture & Control Corrective — Execution Evidence

## 1. Executive Summary & Control Header

```text
PACKAGE                      = D3-KINTONE-ONLY-MIXED-IDENTITY-AUDIT-ARCHITECTURE-CORRECTIVE-01
AUTHORIZATION_ID             = MBO2026-D3-KINTONE-ONLY-MIXED-IDENTITY-AUDIT-ARCHITECTURE-CORRECTIVE-01-20260918-OWNER-01
CANONICAL_BRANCH             = ai/antigravity-wp002c
AUTHORIZED_BASE_HEAD         = 3e2e3c353ca27e2829e6d86b022c6fb89ca8bcda
MODE                         = ARCHITECTURE_AND_CONTROL_CORRECTIVE / ZERO SOURCE MUTATION / ZERO LIVE EXECUTION
STATUS                       = COMPLETED / READY FOR INDEPENDENT CONTROL PLANE REVIEW
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
CONTROL_DOC_CHANGES          = 0
```

---

## 2. Preflight Verification & Environment Integrity

```text
========================================================================================
CHECK                              EXPECTED                                  ACTUAL / RESULT
========================================================================================
Local Repository Root              .../MBO2026                               C:/Users/allda/Desktop/Dev/git/MBO2026
Canonical Branch                   ai/antigravity-wp002c                     ai/antigravity-wp002c
Preflight Working Tree             Clean                                     Clean (0 unstaged changes)
Preflight HEAD SHA                 3e2e3c353ca27e2829e6d86b022c6fb89ca8bcda 3e2e3c353ca27e2829e6d86b022c6fb89ca8bcda
Remote Tracking SHA                3e2e3c353ca27e2829e6d86b022c6fb89ca8bcda 3e2e3c353ca27e2829e6d86b022c6fb89ca8bcda
Parent Commit SHA                  829cf3b694656d539a4889d7a182c9bff9cad21f 829cf3b694656d539a4889d7a182c9bff9cad21f
========================================================================================
```

---

## 3. Independent Verification of Repository Seams

### 3.1 Seam 1: `resolveRuntimeEmployeeSelfContext()`
- **File:** `src/main-mbo-app.js` (Lines 168–230)
- **Independent Inspection:**
  ```javascript
  async function resolveRuntimeEmployeeSelfContext(options = {}) {
    ...
    const kintoneUserCode = String(loginUser?.code || '').trim();
    const principalMode = MboIdentityService.resolveKintonePrincipalMode({ kintoneUserCode });

    if (principalMode === 'SHARED') {
      const empCode = typeof loginGate.getEmployeeCode === 'function'
        ? String(loginGate.getEmployeeCode() || '').trim()
        : '';
      if (!empCode) {
        ...
        return { status: 'LOGIN_REQUIRED', error: 'SHARED_LOGIN_REQUIRED' };
      }
      return {
        status: 'SUCCESS',
        context: {
          mode: 'SHARED',
          employeeCode: empCode,
          kintoneUserCode
        }
      };
    }

    if (principalMode === 'DEDICATED') {
      const mappingRes = MboIdentityService.resolveDedicatedKintoneUserMapping({
        kintoneUserCode,
        userMappings
      });
      if (mappingRes.status !== 'MATCHED' || !mappingRes.employeeCode) {
        return { status: 'MAPPING_ERROR', error: 'DEDICATED_MAPPING_FAILED' };
      }
      return {
        status: 'SUCCESS',
        context: {
          mode: 'DEDICATED',
          employeeCode: mappingRes.employeeCode,
          kintoneUserCode
        }
      };
    }
  }
  ```
- **Finding:** The runtime function already resolves and returns `{ mode, employeeCode, kintoneUserCode }` with strict validation.

### 3.2 Seam 2: `MboKintoneLoginGate`
- **File:** `src/ui/mbo-kintone-login-gate.js` (Lines 58–61)
- **Independent Inspection:**
  ```javascript
  getEmployeeCode() {
    return this._principal?.employeeCode ? String(this._principal.employeeCode).trim() : null;
  }
  ```
- **Finding:** The login gate maintains the verified `Employee_Code` in page memory after authenticating human operators of shared accounts.

### 3.3 Seam 3: `MboSessionManager`
- **File:** `src/ui/mbo-session-manager.js` (Lines 142–148, 185–197)
- **Independent Inspection:**
  - `issueSession`: creates an App 801 record containing `{ employeeCode, tokenHash, issuedAt, expiresAt, kintoneUserCode }`.
  - `restoreSession`: retrieves App 801 session, validates expiration, and strictly verifies that the session's `kintoneUserCode` matches the ambient `kintone.getLoginUser().code`.
- **Finding:** Sessions in App 801 enforce strong dual binding between the human employee and the Kintone principal.

### 3.4 Seam 4: Current D3 Archive Actor Derivation (The Identified Defect)
- **File:** `src/main-mbo-app.js` (`executeStageCompletionArchive`, lines 1386–1411)
- **Independent Inspection:**
  ```javascript
  const loginUser = options.loginUser || ((typeof kintone !== 'undefined' && typeof kintone.getLoginUser === 'function') ? kintone.getLoginUser() : null);
  const actorCode = String(options.actor || loginUser?.code || '').trim();
  ...
  const archiveResult = await archiveService.archiveStageCompletion({
    sourceRecordKey: String(record?.Record_Key?.value || record?.Record_Key || '').trim(),
    employeeCode: String(record?.Employee_Code?.value || record?.Employee_Code || '').trim(),
    fiscalYear: String(record?.Fiscal_Year?.value || record?.Fiscal_Year || '').trim(),
    evaluationStage: targetStage,
    revisionNumber: Number(record?.Revision_Number?.value || ...),
    sourceRecordId: rawRecordId > 0 ? rawRecordId : undefined,
    previousStatus: currentStatus,
    actor: { userCode: actorCode },
    archivedAt: options.archivedAt || (typeof clock === 'function' ? clock() : new Date().toISOString()),
    logicalSnapshot
  });
  ```
- **Analysis:**
  - `actorCode` is resolved purely from `loginUser.code` (e.g. `'f2'`).
  - The actual authenticated human operator (e.g. `'EMP00125'`) is completely omitted from the archive invocation.
  - The `employeeCode` passed to `archiveStageCompletion` is `record.Employee_Code`, which is the **subject** of the evaluation form, NOT the operator.
  - When an evaluator or manager acts on an evaluation record, attributing the action solely to `f2` obscures the real human actor.
- **Finding:** Fully aligns with the Owner's stated fact: Current D3 archive path is insufficient for human operator identity under SHARED mode.

---

## 4. App 798 Schema Audit & Extension Specification

### 4.1 Exhaustive Inventory of Current App 798 Schema
From `src/services/revision-archive-service.js` and `src/services/revision-archive-kintone-repository.js`:

```text
====================================================================================================
#   FIELD CODE               KINTONE TYPE       CURRENT REPOSITORY USAGE
====================================================================================================
1   Archive_Key              SINGLE_LINE_TEXT   Primary deterministic idempotency key
2   Source_Record_Key        SINGLE_LINE_TEXT   Source App 794 record key
3   Fiscal_Year              SINGLE_LINE_TEXT   Fiscal year identifier
4   Employee_Code            SINGLE_LINE_TEXT   Subject employee of the MBO evaluation record
5   Evaluation_Stage         SINGLE_LINE_TEXT   Target evaluation stage
6   Revision_Number          NUMBER             Sequential revision integer
7   Event_Type               SINGLE_LINE_TEXT   Audit event type code
8   Reason                   MULTI_LINE_TEXT    Business reason for revision / transition
9   Snapshot_JSON            MULTI_LINE_TEXT    Canonical JSON serialization of record
10  Snapshot_Hash            SINGLE_LINE_TEXT   SHA-256 hex digest of Snapshot_JSON
11  Archived_By              USER_SELECT        Kintone account array: [{ code: actorUserCode }]
12  Archived_At              DATETIME           Timestamp of archival
13  Source_Record_ID         NUMBER             Source App 794 record ID ($id)
14  Previous_Status          SINGLE_LINE_TEXT   Status before transition
15  Superseded_By_Revision   NUMBER             Revision number superseding this entry
====================================================================================================
```

### 4.2 Explicit Schema Gap Finding

```text
SCHEMA_EXTENSION_REQUIRED = YES
LIVE_SCHEMA_MUTATION_PERFORMED = NO
```

Current App 798 lacks fields for:
1. `Identity_Mode` (`SHARED` or `DEDICATED`).
2. `Operator_Employee_Code` (Actual authenticated human operator).
3. `Operator_Kintone_Code` (Direct textual code of Kintone principal).
4. `Action_Name` (Specific workflow action, e.g. SUBMIT, APPROVE, REJECT).
5. `To_Status` (Resulting workflow status).

### 4.3 Specified 5-Field Minimal Schema Extension

```text
====================================================================================================
PROPOSED FIELD CODE         KINTONE FIELD TYPE   REQUIRED   AUDIT ROLE & ACCEPTABLE VALUES
====================================================================================================
1. Identity_Mode            DROP_DOWN / TEXT     YES        Values: 'SHARED', 'DEDICATED'
2. Operator_Employee_Code   SINGLE_LINE_TEXT     YES        Format: ^EMP\d{5}$ (e.g. EMP00125)
3. Operator_Kintone_Code    SINGLE_LINE_TEXT     YES        Kintone username (e.g. f2, somchai.p)
4. Action_Name              SINGLE_LINE_TEXT     YES        Action: SUBMIT, APPROVE, REJECT, ARCHIVE
5. To_Status                SINGLE_LINE_TEXT     YES        Resulting status (e.g. 06 Employee Mid-Year)
====================================================================================================
```

---

## 5. Non-Collapsible Mixed Identity Contract Matrix

```text
====================================================================================================
PROPERTY                   SHARED MODE OPERATION                  DEDICATED MODE OPERATION
====================================================================================================
Human Operator             Individual employee                    Individual employee
Kintone Principal          Shared role account (e.g. f2)          User's own account (e.g. somchai.p)
Identity Mode              SHARED                                 DEDICATED
Operator Employee Code     From Login Lock / App 801 (EMP00125)   From App 53 mapping (EMP00042)
Kintone Login User Code    From kintone.getLoginUser().code (f2)  From kintone.getLoginUser().code
Subject Employee Code      From App 794 record.Employee_Code      From App 794 record.Employee_Code
Both Identities Captured?  YES (NEVER collapsed into one)         YES
Fail-Closed on Auth Fail?  YES (Aborts immediately)               YES (Aborts immediately)
====================================================================================================
```

---

## 6. Historical Architecture Provenance & Supersession Analysis

### 6.1 Historical Record of Decision 009
- **Document:** `project-docs/D3_DECISION_009_PLATFORM_STAMPED_OAUTH_ATTESTATION_ARCHITECTURE_RATIFICATION.md`
- **Ratified Concept:** `NATIVE_KINTONE_PLATFORM_STAMPED_OAUTH_ATTESTATION`
- **Context:** Formulated under the hypothesis that avoiding employee direct write access to App 798 required an external privileged writer backend using Cybozu OAuth2 user-bound tokens and an attestation app.

### 6.2 The Clarified Owner Requirement
- The Project Owner on 2026-09-18 clarified that MBO2026 is strictly a **KINTONE-ONLY** architecture.
- Any design requiring external microservices, cloud container runtimes, Redis/SQL databases, or external OAuth token infrastructure is rejected.
- The existing MBO identity model (Shared Login Gate + Dedicated App 53 mapping) must be reused.

### 6.3 Recommendation for Control Plane Review
- Document `D3_KINTONE_ONLY_MIXED_IDENTITY_AUDIT_ARCHITECTURE_CORRECTIVE_01.md` establishes the required architecture.
- Decision 009 should be formally designated as **SUPERSEDED BY OWNER MANDATE** in control documentation upon Control Plane review and Owner ratification.

---

## 7. Zero Live Execution & Governance Proof

```text
========================================================================================
METRIC / GATE                                               RECORDED VALUE
========================================================================================
Live Kintone App 794 Reads                                  0
Live Kintone App 798 Reads                                  0
Live Kintone App Writes (Any App)                           0
Real OAuth Authorizations Attempted                         0
Real OAuth Token Exchanges                                  0
Attestation App Created                                     0
Schema Mutations Executed                                   0
ACL Mutations Executed                                      0
Source Code Files Modified                                  0
Test Code Files Modified                                    0
Control Documents Modified                                  0
Documentation / Architecture Files Created                  2
Lint / Whitespace Errors                                    0
========================================================================================
```

---

## 8. Final Stop State

```text
FINAL_STATE                  = STOP FOR INDEPENDENT CONTROL PLANE REVIEW THEN OWNER DECISION
LIVE_PROVISIONING_AUTHORIZED = NO
DEPLOYMENT_AUTHORIZED        = NO
UAT_AUTHORIZED               = NO
NEXT_GATE_AUTHORIZED         = NO
AUTO_START_NEXT_WORK_PACKAGE = NO
```
