# D3 Architecture & Control Corrective — Kintone-Only Mixed-Identity Audit Architecture (R1)

## Document Control Header

```text
DOCUMENT_ID                  = D3-KINTONE-ONLY-MIXED-IDENTITY-AUDIT-ARCHITECTURE-CORRECTIVE-01-R1
AUTHORIZATION_ID             = MBO2026-D3-KINTONE-ONLY-MIXED-IDENTITY-AUDIT-ARCHITECTURE-CORRECTIVE-01-R1-20260918-OWNER-01
CANONICAL_BRANCH             = ai/antigravity-wp002c
AUTHORIZED_BASE_HEAD         = f3b8ef620fd61dc47744c73cde1b7ea750f1d3bf
REVISION                     = R1 (CONTROL PLANE FINDINGS CORRECTIVE)
MODE                         = DOCS_ARCHITECTURE_AND_EVIDENCE_CORRECTIVE_ONLY
STATUS                       = SUBMITTED_FOR_INDEPENDENT_CONTROL_PLANE_REVIEW
```

---

## 1. Executive Summary & Owner Intent

This R1 document provides the authoritative architectural specification for the MBO2026 D3 Stage Completion and Audit Archive subsystem under the Owner-locked mandate:
1. **Strict Kintone-Only Scope:** MBO2026 is strictly a Kintone-native solution. The production architecture MUST NOT require an external backend, Redis, PostgreSQL/MySQL, cloud runtime, external secret vault, or separate external OAuth infrastructure.
2. **Reuse of Existing MBO Identity Architecture:** The existing hybrid identity model (Dedicated Kintone Accounts mapped via App 53; Shared Kintone Accounts authenticated via `MboKintoneLoginGate` and `MboSessionManager` / App 801) MUST be reused directly. No secondary PIN or login mechanism may be created.
3. **Owner Lock on Shared Account Audit Identity:** Audit evidence recorded for actions taken under `Identity_Mode = SHARED` MUST capture and preserve BOTH:
   - `Actual_Operator_Employee_Code` (the human employee authenticated through the MBO Login Lock)
   - `Kintone_Login_User_Code` (the shared Kintone account principal, e.g., `f2`)
   The implementation and audit schema MUST NOT collapse these two distinct identities.
4. **Three Distinct Identity Concepts:** The architecture strictly separates:
   - **Subject Employee:** The employee whose evaluation record is being processed (`App794.Employee_Code`).
   - **Actual Operator:** The authenticated human performing the action (`Actual_Operator_Employee_Code`).
   - **Kintone Login Principal:** The active Kintone user session account (`Kintone_Login_User_Code`).
5. **R1 Corrective Focus:**
   - **Finding 1 (Source Fidelity):** Corrected all source documentation to reflect literal repository truth at `f3b8ef620fd61dc47744c73cde1b7ea750f1d3bf`. Explanatory models are strictly separated and labeled.
   - **Finding 2 (Anti-Forgery Trust Boundary):** Rigorous analysis of the Kintone-only security boundary. Explicitly rejects `GROUP everyone Add = YES` as a secure audit mechanism and formalizes the exact platform-level limitation (`KINTONE_ONLY_PLATFORM_LEVEL_ANTI_FORGERY = NOT_PROVEN`).

---

## 2. Authoritative Source Inspection & Identity Verification

Literal repository inspection of `rebootob/MBO2026` at commit `f3b8ef620fd61dc47744c73cde1b7ea750f1d3bf` confirms the existing identity resolution mechanisms:

### 2.1 Identity Resolution: `resolveRuntimeEmployeeSelfContext()`
Location: `src/main-mbo-app.js` (lines 168–230)

*Literal Source excerpt:*
```javascript
function resolveRuntimeEmployeeSelfContext(uiHost, options = {}) {
  const loginUser = (typeof kintone !== 'undefined' && kintone.getLoginUser) ? kintone.getLoginUser() : null;
  const kintoneUserCode = loginUser?.code || null;

  if (!kintoneUserCode) {
    return { status: 'NO_KINTONE_USER', mode: null };
  }

  let principalMode;
  try {
    principalMode = MboIdentityService.resolveKintonePrincipalMode({ kintoneUserCode });
  } catch (err) {
    return { status: 'MODE_RESOLUTION_ERROR', reason: err.message };
  }

  if (principalMode === 'TECHNICAL_ADMIN') {
    return { status: 'TECHNICAL_ADMIN', mode: 'TECHNICAL_ADMIN' };
  }

  if (principalMode === 'SHARED') {
    if (!mboLoginGate) {
      return { status: 'GATE_NULL', mode: 'SHARED' };
    }
    const authResult = mboLoginGate.requireLogin(uiHost);
    if (typeof authResult === 'string') {
      return {
        status: 'SUCCESS',
        context: { mode: 'SHARED', employeeCode: authResult, kintoneUserCode }
      };
    } else if (authResult && typeof authResult.then === 'function') {
      return authResult.then(empCode => {
        if (!empCode) {
          return { status: 'SHARED_AUTH_REQUIRED', mode: 'SHARED' };
        }
        return {
          status: 'SUCCESS',
          context: { mode: 'SHARED', employeeCode: empCode, kintoneUserCode }
        };
      });
    }
    return { status: 'SHARED_AUTH_REQUIRED', mode: 'SHARED' };
  }

  if (principalMode === 'DEDICATED') {
    return (async () => {
      let candidateRecords = [];
      try {
        candidateRecords = await EmployeeService.lookupDedicatedIdentityMappingCandidates(kintoneUserCode, kintoneApiWrapper);
      } catch (lookupErr) {
        candidateRecords = [];
      }

      const mappingRes = MboIdentityService.resolveDedicatedKintoneUserMapping({
        kintoneUserCode,
        userMappings: candidateRecords
      });

      if (mappingRes.status === 'IDENTITY_BOUND' && mappingRes.employeeCode) {
        return {
          status: 'SUCCESS',
          context: { mode: 'DEDICATED', employeeCode: mappingRes.employeeCode, kintoneUserCode }
        };
      }
...
```

**Key Source-Verified Invariants:**
1. **SHARED Mode:** Resolves through `mboLoginGate.requireLogin(uiHost)`. Upon success, returns `{ status: 'SUCCESS', context: { mode: 'SHARED', employeeCode: empCode, kintoneUserCode } }`.
2. **DEDICATED Mode:** Queries App 53 mapping candidates via `EmployeeService.lookupDedicatedIdentityMappingCandidates(...)` and resolves via `MboIdentityService.resolveDedicatedKintoneUserMapping(...)`. Success is indicated specifically by `mappingRes.status === 'IDENTITY_BOUND'`, yielding `{ status: 'SUCCESS', context: { mode: 'DEDICATED', employeeCode: mappingRes.employeeCode, kintoneUserCode } }`.

---

### 2.2 Login Lock: `MboKintoneLoginGate`
Location: `src/ui/mbo-kintone-login-gate.js` (lines 53–61, 90–123)

*Literal Source excerpt:*
```javascript
  /**
   * Returns the authenticated Employee_Code only when fully authorized
   * (authenticated AND no pending force password change).
   * Returns null otherwise — caller must fail closed.
   */
  getEmployeeCode() {
    if (!this._principal || this._pendingForceChange) return null;
    return this._principal.employeeCode;
  }
...
  async requireLogin(host) {
    const code = this.getEmployeeCode();
    if (code) return code;

    if (this.sessionManager) {
      try {
        const restored = await this.sessionManager.restoreSession();
        if (restored?.employeeCode) {
...
          this._principal = { employeeCode: restored.employeeCode };
          this._pendingForceChange = false;
          return restored.employeeCode;
        }
      } catch {
        // fail closed to overlay on restore failure
      }
    }

    return new Promise((resolve) => {
      this._renderLoginOverlay(host, resolve);
    });
  }
```

**Key Source-Verified Invariants:**
- `getEmployeeCode()` returns `this._principal.employeeCode` only if `this._principal` is set and `!this._pendingForceChange`. Otherwise returns `null` (enforcing fail-closed).
- `requireLogin(host)` checks `getEmployeeCode()`, attempts `sessionManager.restoreSession()`, verifies eligibility, sets `this._principal = { employeeCode }`, and falls back to rendering a blocking login modal `_renderLoginOverlay(host, resolve)`.

---

### 2.3 Session Binding: `MboSessionManager`
Location: `src/ui/mbo-session-manager.js` (lines 127–199)

*Literal Source excerpt:*
```javascript
  async issueSession(employeeCode) {
    const kintoneUser = this.getKintoneUser();
    const kintoneUserCode = kintoneUser?.code;

    if (!kintoneUserCode || typeof kintoneUserCode !== 'string' || kintoneUserCode !== kintoneUserCode.trim() || !kintoneUserCode.trim()) {
      throw new Error('MISSING_KINTONE_PRINCIPAL');
    }

    const token = this.generateToken();
    const tokenHash = await this.hashToken(token);

    const currentTime = this.now();
    const issuedAt = currentTime.toISOString();
    const expiresAt = new Date(currentTime.getTime() + ABSOLUTE_TTL_MS).toISOString();

    await this.adapter.storeSession({
      employeeCode,
      tokenHash,
      issuedAt,
      expiresAt,
      kintoneUserCode
    });

    this.setLocalToken(token);

    return { status: 'SESSION_ISSUED', expiresAt };
  }

  async restoreSession() {
    const token = this.getLocalToken();
    if (!token) return null;

    let tokenHash;
    try {
      tokenHash = await this.hashToken(token);
    } catch {
      this.clearLocalToken();
      return null;
    }

    const kintoneUser = this.getKintoneUser();
    const currentKintoneUserCode = kintoneUser?.code;

    if (!currentKintoneUserCode || typeof currentKintoneUserCode !== 'string' || currentKintoneUserCode !== currentKintoneUserCode.trim() || !currentKintoneUserCode.trim()) {
      this.clearLocalToken();
      return null;
    }

    let res;
    try {
      res = await this.adapter.validateSession({
        tokenHash,
        currentKintoneUserCode
      });
    } catch {
      this.clearLocalToken();
      return null;
    }

    if (res?.status === 'VALID_SESSION' && res.employeeCode) {
      return {
        employeeCode: res.employeeCode
      };
    }

    this.clearLocalToken();
    return null;
  }
```

**Key Source-Verified Invariants:**
- `issueSession(employeeCode)` enforces a strict multi-attribute binding stored in App 801: `{ employeeCode, tokenHash, issuedAt, expiresAt, kintoneUserCode }`.
- `restoreSession()` hashes the local sessionStorage token and calls `adapter.validateSession({ tokenHash, currentKintoneUserCode })`. If the current Kintone user does not match the bound user or token is invalid/expired, the session is invalidated and cleared (`return null`).

---

### 2.4 Current D3 Archive Seam Defect
Location: `src/main-mbo-app.js` (lines 1386–1414)

*Literal Source excerpt:*
```javascript
  const apiAdapter = options.apiAdapter || kintoneApiWrapper;
  const loginUser = options.loginUser || ((typeof kintone !== 'undefined' && typeof kintone.getLoginUser === 'function') ? kintone.getLoginUser() : null);
  const actorCode = String(options.actor || loginUser?.code || '').trim();

  if (!actorCode) {
    const errorMsg = `[D3 ARCHIVE ERROR] Cannot resolve actor login identity for transition ${currentStatus} -> ${nextStatus}. Transition blocked.`;
    console.error(errorMsg);
    return { success: false, error: 'ACTOR_IDENTITY_UNRESOLVED' };
  }
...
    const archiveResult = await archiveService.archiveStageCompletion({
      sourceRecordKey: String(record?.Record_Key?.value || record?.Record_Key || '').trim(),
      employeeCode: String(record?.Employee_Code?.value || record?.Employee_Code || '').trim(),
      fiscalYear: String(record?.Fiscal_Year?.value || record?.Fiscal_Year || '').trim(),
      evaluationStage: targetStage,
      revisionNumber: Number(record?.Revision_Number?.value || record?.Current_Revision_Number?.value || record?.Revision_Number || record?.Current_Revision_Number),
      sourceRecordId: rawRecordId > 0 ? rawRecordId : undefined,
      previousStatus: currentStatus,
      actor: { userCode: actorCode },
      archivedAt: options.archivedAt || (typeof clock === 'function' ? clock() : new Date().toISOString()),
      logicalSnapshot
    });
```

**Verified Defect Analysis:**
1. **Missing Actual Operator in SHARED Mode:** `actorCode` is derived exclusively from `kintone.getLoginUser().code` (e.g. `f2`). The actual human employee authenticated in `mboLoginGate` is never passed to `archiveService.archiveStageCompletion`.
2. **Subject vs. Operator Separation:** `record.Employee_Code` represents the **Subject Employee** (the owner of the appraisal), NOT the operator performing the workflow transition.
3. **No Dual Identity Capture:** The current seam cannot distinguish between a dedicated user performing an action versus an operator acting through a shared Kintone user account.

---

## 3. Explanatory Integration Model (Non-Literal Architecture Target)

```text
[EXPLANATORY_PSEUDOCODE / NOT_LITERAL_SOURCE]

Function executeAuditedWorkflowAction(record, targetStage, currentStatus, nextStatus, uiHost):
    1. Resolve Actor Context:
       contextRes = await resolveRuntimeEmployeeSelfContext(uiHost)
       if contextRes.status != 'SUCCESS':
           FAIL_CLOSED("ACTOR_AUTHENTICATION_REQUIRED")

    2. Extract Tripartite Identity:
       subjectEmployeeCode = record.Employee_Code.value
       actualOperatorCode  = contextRes.context.employeeCode
       kintoneLoginCode    = contextRes.context.kintoneUserCode
       identityMode        = contextRes.context.mode  // 'SHARED' or 'DEDICATED'

    3. Construct Audited Archive Payload (App 798):
       archivePayload = {
           Source_Record_Key:       record.Record_Key.value,
           Source_Record_ID:        record.$id.value,
           Subject_Employee_Code:   subjectEmployeeCode,       // Appraisal owner
           Actual_Operator_Code:    actualOperatorCode,        // Authenticated human
           Kintone_Login_User:      kintoneLoginCode,          // Kintone account
           Identity_Mode:           identityMode,              // SHARED | DEDICATED
           Action_Name:             "TRANSITION_" + targetStage,
           Previous_Status:         currentStatus,
           To_Status:               nextStatus,
           Snapshot_JSON:           serialize(logicalSnapshot),
           Snapshot_Hash:           sha256(canonicalJson),
           Archived_At:             kintonePlatformClock()
       }

    4. Write Audit Record (App 798) BEFORE Executing Status Transition:
       auditResult = await writeApp798Record(archivePayload)
       if not auditResult.success:
           FAIL_CLOSED("AUDIT_PERSISTENCE_FAILED_TRANSITION_ABORTED")

    5. Execute App 794 Workflow Transition:
       return executeApp794StatusUpdate(record, nextStatus)
```

---

## 4. App 798 Anti-Forgery & Kintone-Only Trust Boundary Analysis

### 4.1 Evaluation of Direct Kintone Permissions & Rejection of `GROUP everyone Add = YES`
In R0, a potential ACL configuration of `GROUP everyone: Add = YES, View = NO` was discussed. **R1 explicitly rejects this proposal as an acceptable secure architecture.**

**Technical Reason:**
- Kintone client-side customizations (JavaScript running via desktop/mobile customization) execute entirely in the end-user's browser context.
- If `GROUP everyone` (or any shared business role) is granted `Add = YES` permission on App 798, that permission applies directly to the Kintone REST API endpoint (`/k/v1/record.json`).
- Any user logged into Kintone possesses a valid session cookie and CSRF token (`kintone.getRequestToken()`).
- A user can open browser DevTools or execute a headless script to directly `POST` an arbitrary JSON body to App 798:
  ```json
  POST /k/v1/record.json
  {
    "app": 798,
    "record": {
      "Actual_Operator_Employee_Code": { "value": "EMP99999" },
      "To_Status": { "value": "HR_FINAL_APPROVED" },
      "Snapshot_Hash": { "value": "fabricated-hash" }
    }
  }
  ```
- **Kintone Platform Limitations:**
  1. Kintone has **no server-side pre-commit triggers**, stored procedures, or validation webhooks that can intercept and validate an incoming REST API record before persistence.
  2. Kintone Field Permissions can restrict who can edit or view a field, but if a role has permission to write a field on record creation, the platform accepts whatever string value the REST client supplies.
  3. The Kintone platform stamps only its internal system fields:
     - `$id` (Record ID)
     - `Created_By` (`Creator` user account code, e.g., `f2`)
     - `Created_Time` (Server UTC timestamp)
  4. The platform **cannot** verify whether `Actual_Operator_Employee_Code` matches an active session in App 801, nor whether the snapshot hash corresponds to an actual state in App 794.

### 4.2 Detailed Evaluation of Kintone-Native Mechanisms

| Kintone Mechanism | Capability | Can Prevent DevTools REST Forgery of Audit Payload? | Status |
| :--- | :--- | :--- | :--- |
| **App Permissions (ACL)** | Controls Add/View/Edit/Delete per App | **No.** If Add=YES, any payload is accepted; if Add=NO, legitimate browser JS cannot write. | Evaluated |
| **Field Permissions** | Controls View/Edit per field | **No.** Cannot enforce that field values originate from verified JS runtime rather than manual POST. | Evaluated |
| **Record Permissions** | Controls record-level View/Edit/Delete | **No.** Operates post-insertion; does not validate incoming payload fields. | Evaluated |
| **Process Management** | Controls status flow on existing records | **No.** Applies to status transitions, not initial append of audit records. | Evaluated |
| **Platform System Fields** | Platform-stamped `Created_By`, `Created_Time` | **Partial.** Proves *which Kintone account* created the record and *when*, but cannot prove *actual human employee* or *workflow state validity*. | Evaluated |
| **App 801 Session Cross-Ref** | Stores active session token and mapping | **No.** Kintone platform cannot perform server-side cross-app joins or referential integrity checks during record creation. | Evaluated |

### 4.3 Explicit Answer to Critical Security Question

```text
================================================================================
CRITICAL SECURITY EVALUATION:
CAN A KINTONE-ONLY ARCHITECTURE SIMULTANEOUSLY GUARANTEE:
1. Shared account user can perform authorized MBO workflow action.
2. Actual human Employee_Code from Login Lock is preserved.
3. Shared Kintone account code is preserved.
4. App798 records cannot be forged directly by normal users.
5. Existing App798 records cannot be edited/deleted.
6. Archive evidence is created before protected workflow transition.
7. Failure to establish authoritative identity/audit context FAILS CLOSED.
================================================================================

CONCLUSION:
KINTONE_ONLY_PLATFORM_LEVEL_ANTI_FORGERY = NOT_PROVEN

ARCHITECTURAL LIMITATION STATEMENT:
In a 100% Kintone-only environment (with zero external backend, zero server-side
functions, and zero external secret custody):
- Application-level / JavaScript enforcement is achievable for normal browser
  navigation.
- Platform-level provenance is limited to Kintone system fields (Creator = Kintone
  principal, Created_Time = server timestamp).
- PLATFORM-LEVEL ANTI-FORGERY of application fields (Actual_Operator_Employee_Code,
  Previous_Status, To_Status, Snapshot_Hash) CANNOT be guaranteed against direct
  REST API / DevTools submission if business users possess App 798 Add permissions.
- Conversely, if business users are DENIED App 798 Add permissions (to prevent
  forgery), client-side JavaScript executing in their session CANNOT create audit
  records, causing the mandatory pre-transition audit gate to FAIL CLOSED.
================================================================================
```

---

## 5. App 798 Schema Gap Analysis & Specification

Current repository inspection indicates that App 798 does not possess dedicated fields for dual-identity audit tracking.

```text
SCHEMA_EXTENSION_REQUIRED = YES
ACL_CHANGE_REQUIRED       = YES
```

*Note: In accordance with execution bounds, NO schema or ACL changes are performed in this package.*

### Minimal Proposed Schema Extension for App 798

| Logical Field Name | Proposed Field Code | Kintone Field Type | Allowed Values / Format | Audit Semantics |
| :--- | :--- | :--- | :--- | :--- |
| **Identity Mode** | `Identity_Mode` | `DROP_DOWN` | `['SHARED', 'DEDICATED']` | Indicates authentication path of the operator |
| **Actual Operator Code**| `Operator_Employee_Code` | `SINGLE_LINE_TEXT` | `^EMP\d{5}$` | Authenticated human employee performing the action |
| **Operator Kintone Code**| `Operator_Kintone_Code`| `SINGLE_LINE_TEXT` | Alphanumeric (e.g. `f2`, `somchai.p`) | Kintone principal account used for session |
| **Action Name** | `Action_Name` | `SINGLE_LINE_TEXT` | E.g. `SUBMIT`, `APPROVE`, `REJECT` | Business workflow action triggering audit |
| **Resulting Status** | `To_Status` | `SINGLE_LINE_TEXT` | MBO Workflow Status string | Status of App 794 record resulting from action |

*Distinct Semantics:*
- `Employee_Code` in App 798 represents the **Subject Employee** (the owner of the MBO form).
- `Operator_Employee_Code` represents the **Actual Operator** (who clicked the button).
- `Operator_Kintone_Code` and system `Created_By` represent the **Kintone Principal**.

---

## 6. Treatment of Historical Architecture & Decision 009

1. **Historical Provenance Preserved:**
   - Decision 009 (`D3_DECISION_009_PLATFORM_STAMPED_OAUTH_ATTESTATION_ARCHITECTURE_RATIFICATION.md`) established a trusted external backend writer precisely because Kintone cannot natively prevent REST API forgery when users have Add permissions.
   - Decision 009 remains historical locked provenance. It is NOT deleted or rewritten.
2. **Authority & Supersession Status:**
   - Because `KINTONE_ONLY_PLATFORM_LEVEL_ANTI_FORGERY = NOT_PROVEN`, Decision 009 **CANNOT be declared fully superseded on technical security equivalence**.
   - Instead, Decision 009 stands as proof of the inherent security trade-off:
     - **Option A (External Trusted Writer - OD-009):** Provides cryptographic and platform-stamped anti-forgery at the cost of requiring an external backend and secret management.
     - **Option B (Kintone-Only Corrective):** Strictly honors the Owner's infrastructure boundary (zero external servers/databases/vaults) and enforces application-level dual-identity audit, while accepting the documented Kintone platform anti-forgery limitation.
   - Formal decision on whether to accept Option B and supersede OD-009 rests exclusively with the Owner following Control Plane review.

---

## 7. Governance, Verification & Execution Summary

- **Execution Limits Observed:**
  - `SOURCE_CHANGES = 0`
  - `TEST_CHANGES = 0`
  - `KINTONE_READS = 0`
  - `KINTONE_WRITES = 0`
  - `SCHEMA_WRITES = 0`
  - `ACL_WRITES = 0`
  - `DEPLOYMENT = 0`
  - `UAT = 0`
- **Current Stop State:**
  - `STOP_FOR_INDEPENDENT_CONTROL_PLANE_REVIEW = YES`
  - No implementation or live mutation may proceed without subsequent Owner authorization.
