# D3 Architecture & Control Corrective — Execution Evidence (R1)

## 1. Executive Summary & Control Header

```text
PACKAGE                      = D3-KINTONE-ONLY-MIXED-IDENTITY-AUDIT-ARCHITECTURE-CORRECTIVE-01-R1
AUTHORIZATION_ID             = MBO2026-D3-KINTONE-ONLY-MIXED-IDENTITY-AUDIT-ARCHITECTURE-CORRECTIVE-01-R1-20260918-OWNER-01
CANONICAL_BRANCH             = ai/antigravity-wp002c
AUTHORIZED_BASE_HEAD         = f3b8ef620fd61dc47744c73cde1b7ea750f1d3bf
REVISION                     = R1
MODE                         = DOCS_ARCHITECTURE_AND_EVIDENCE_CORRECTIVE_ONLY
SCOPE                        = EXACT TWO FILES ONLY
STOP_CONDITION               = STOP_FOR_INDEPENDENT_CONTROL_PLANE_REVIEW
```

---

## 2. Mandatory Preflight Verification

```text
[PREFLIGHT CHECK]
Repository: C:/Users/allda/Desktop/Dev/git/MBO2026
Target Branch: ai/antigravity-wp002c
Expected Base Head: f3b8ef620fd61dc47744c73cde1b7ea750f1d3bf

Command: git status --short
Output: (clean, 0 modified files)

Command: git fetch origin
Output: fetched remote tracking branch

Command: git rev-parse HEAD
Output: f3b8ef620fd61dc47744c73cde1b7ea750f1d3bf

Command: git rev-parse origin/ai/antigravity-wp002c
Output: f3b8ef620fd61dc47744c73cde1b7ea750f1d3bf

PREFLIGHT STATUS: PASSED (Zero drift, perfectly aligned with canonical remote truth)
```

---

## 3. Corrective Finding 1: Literal Source & Evidence Fidelity

### 3.1 Verification of `resolveRuntimeEmployeeSelfContext()`
File: `src/main-mbo-app.js` (lines 168–230)

```javascript
// --- LITERAL SOURCE EXCERPT START ---
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
// --- LITERAL SOURCE EXCERPT END ---
```

**Verified Facts:**
- In `SHARED` mode: uses `mboLoginGate.requireLogin(uiHost)`. When resolved, returns `{ status: 'SUCCESS', context: { mode: 'SHARED', employeeCode: empCode, kintoneUserCode } }`.
- In `DEDICATED` mode: queries App 53 mapping candidates via `lookupDedicatedIdentityMappingCandidates`, then resolves via `MboIdentityService.resolveDedicatedKintoneUserMapping`. When `mappingRes.status === 'IDENTITY_BOUND'`, returns `{ status: 'SUCCESS', context: { mode: 'DEDICATED', employeeCode: mappingRes.employeeCode, kintoneUserCode } }`.

---

### 3.2 Verification of `MboKintoneLoginGate`
File: `src/ui/mbo-kintone-login-gate.js` (lines 53–61, 90–123)

```javascript
// --- LITERAL SOURCE EXCERPT START ---
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
          if (typeof this.checkSharedEligibility === 'function') {
            let eligibility;
            try {
              eligibility = await this.checkSharedEligibility(restored.employeeCode);
            } catch {
              eligibility = { eligible: false };
            }
            if (!eligibility || eligibility.eligible !== true) {
              try {
                await this.sessionManager.revokeSession();
              } catch {}
              if (typeof this.sessionManager.clearLocalToken === 'function') {
                this.sessionManager.clearLocalToken();
              }
              this._principal = null;
              this._pendingForceChange = false;
              const errorMsg = eligibility?.message || 'พนักงานรายนี้มีบัญชี Kintone ส่วนตัว กรุณาเข้าสู่ระบบด้วยบัญชี Kintone ของตนเอง\nThis employee has a dedicated Kintone account. Please sign in using their dedicated Kintone account.';
              return new Promise((resolve) => {
                this._renderLoginOverlay(host, resolve, errorMsg);
              });
            }
          }
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
// --- LITERAL SOURCE EXCERPT END ---
```

**Verified Facts:**
- `getEmployeeCode()` returns `null` if unauthenticated or pending force change.
- `requireLogin(host)` restores session via `sessionManager.restoreSession()`, validates shared eligibility, sets `this._principal = { employeeCode: restored.employeeCode }`, and returns `restored.employeeCode`.
- On restore failure or unauthenticated state, displays blocking modal (`_renderLoginOverlay`).

---

### 3.3 Verification of `MboSessionManager`
File: `src/ui/mbo-session-manager.js` (lines 127–199)

```javascript
// --- LITERAL SOURCE EXCERPT START ---
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
// --- LITERAL SOURCE EXCERPT END ---
```

**Verified Facts:**
- `issueSession` stores the cryptographic hash of the session token bound to BOTH `employeeCode` and `kintoneUserCode` in App 801.
- `restoreSession` verifies the session hash and confirms that `currentKintoneUserCode` matches the principal recorded in App 801. Mismatch triggers local session purge and returns `null`.

---

### 3.4 Verification of D3 Archive Seam Defect
File: `src/main-mbo-app.js` (lines 1386–1414)

```javascript
// --- LITERAL SOURCE EXCERPT START ---
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
// --- LITERAL SOURCE EXCERPT END ---
```

**Verified Defect Analysis:**
- `actorCode` is derived exclusively from `kintone.getLoginUser().code`. In SHARED mode, this captures only the shared account (e.g. `f2`) and drops the authenticated human operator identity (`EMP00125`).
- `record.Employee_Code` is the **Subject Employee** (appraisal subject), not the operator.
- The existing call does not pass or record `Identity_Mode` or `Actual_Operator_Employee_Code`.

---

## 4. Corrective Finding 2: App 798 Anti-Forgery Trust Boundary Analysis

### 4.1 Evaluation & Rejection of `GROUP everyone Add = YES`
- **Rejection Notice:** R1 explicitly retracts and rejects the notion that setting App 798 permissions to `GROUP everyone: Add = YES, View = NO` satisfies audit anti-forgery.
- **Vulnerability Mechanism:**
  1. Kintone client JavaScript runs in an untrusted browser environment.
  2. Any Kintone user possessing `Add = YES` permission on App 798 can invoke `POST /k/v1/record.json` directly via DevTools console or automated scripts.
  3. The caller can provide arbitrary JSON payloads containing false `Actual_Operator_Employee_Code`, false `Previous_Status`, false `To_Status`, and fabricated snapshot hashes.
  4. The Kintone platform will accept and persist this record without executing client-side MBO validation logic.

### 4.2 Comprehensive Kintone-Native Mechanism Audit

```text
================================================================================
KINTONE MECHANISM                       ANTI-FORGERY EFFICACY FOR AUDIT PAYLOAD
================================================================================
Kintone App Permissions (ACL)          FAIL: Cannot restrict API POST payloads
Kintone Record Permissions              FAIL: Evaluated post-insertion
Kintone Field Permissions               FAIL: Cannot bind fields to verified JS
Kintone Process Management              FAIL: Governs transitions, not insert
Kintone Platform System Fields          PARTIAL: Stamps Creator & Created_Time,
                                        but cannot validate application fields
App 801 Session Validation              FAIL: Client-side join only; no platform
                                        pre-commit trigger in Kintone
================================================================================
```

### 4.3 Answer to Critical Security Question

```text
================================================================================
CRITICAL SECURITY QUESTION:
Can a KINTONE-ONLY architecture simultaneously guarantee:
1. Shared account user can perform the authorized MBO workflow action.
2. Actual human Employee_Code from Login Lock is preserved.
3. Shared Kintone account code is preserved.
4. App798 records cannot be forged directly by normal users.
5. Existing App798 records cannot be edited/deleted.
6. Archive evidence is created before the protected workflow transition.
7. Failure to establish authoritative identity/audit context FAILS CLOSED.
================================================================================

EXPLICIT DETERMINATION:
KINTONE_ONLY_PLATFORM_LEVEL_ANTI_FORGERY = NOT_PROVEN

ARCHITECTURAL LIMITATION:
A 100% Kintone-only client-side architecture CANNOT provide platform-level
anti-forgery against direct DevTools/REST API record insertion if business
users have write permissions on App 798.
- Client-side JavaScript enforcement is complete and fail-closed for standard UI.
- Platform-level stamping exists exclusively for Kintone user code and timestamp.
- Application-level fields (Operator Employee Code, Status transition, Hash)
  cannot be verified server-side by Kintone prior to insertion.
================================================================================
```

---

## 5. App 798 Schema Gap & Proposed Data Contract

```text
SCHEMA_EXTENSION_REQUIRED = YES
ACL_CHANGE_REQUIRED       = YES
```

### Proposed Schema Extension Specification

| Field Code | Logical Name | Type | Constraints | Semantics |
| :--- | :--- | :--- | :--- | :--- |
| `Identity_Mode` | Identity Mode | `DROP_DOWN` | `['SHARED', 'DEDICATED']` | Mode of authentication |
| `Operator_Employee_Code` | Actual Operator | `SINGLE_LINE_TEXT` | `^EMP\d{5}$` | Authenticated human operator |
| `Operator_Kintone_Code` | Kintone Principal | `SINGLE_LINE_TEXT` | String (e.g. `f2`) | Active Kintone account |
| `Action_Name` | Action Name | `SINGLE_LINE_TEXT` | E.g. `TRANSITION_MID_YEAR` | Audited business action |
| `To_Status` | Target Status | `SINGLE_LINE_TEXT` | MBO Workflow Status | Resulting record status |

*Tripartite Identity Distinction:*
- `App798.Employee_Code` = **Subject Employee** (Appraisal owner)
- `App798.Operator_Employee_Code` = **Actual Operator** (Authenticated actor)
- `App798.Operator_Kintone_Code` / `Creator` = **Kintone Principal** (Account)

---

## 6. Historical Decision 009 Status

- **Provenance:** `OWNER_DEC_D3_009` (`NATIVE_KINTONE_PLATFORM_STAMPED_OAUTH_ATTESTATION`) is preserved intact as historical repository truth.
- **Supersession Status:** `NOT_SUPERSEDED_AT_THIS_STAGE`. Because `KINTONE_ONLY_PLATFORM_LEVEL_ANTI_FORGERY = NOT_PROVEN`, Decision 009 documents why an external trusted writer was previously established.
- **Decision Path:** The Owner and Control Plane must weigh the trade-off:
  - Honor the strict Kintone-only infrastructure mandate while accepting that anti-forgery is enforced at the JavaScript application level (Option B); OR
  - Retain the external trusted writer architecture of Decision 009 for cryptographic platform-level attestation (Option A).

---

## 7. Zero-I/O & Governance Accounting

```text
SOURCE_CHANGES                 = 0
TEST_CHANGES                   = 0
KINTONE_READS                  = 0
KINTONE_WRITES                 = 0
SCHEMA_WRITES                  = 0
ACL_WRITES                     = 0
PROCESS_WRITES                 = 0
RECORD_WRITES                  = 0
REAL_OAUTH                     = 0
OAUTH_CLIENT_REGISTRATION      = 0
EXTERNAL_BACKEND_PROVISIONING  = 0
REDIS_PROVISIONING             = 0
SQL_PROVISIONING               = 0
SECRET_VAULT_PROVISIONING      = 0
CLOUD_RUNTIME_PROVISIONING     = 0
DEPLOYMENT                     = 0
UAT                            = 0
```

---

## 8. Final Stop State

```text
STOP_FOR_INDEPENDENT_CONTROL_PLANE_REVIEW = YES
NEXT_AUTHORIZED_ACTION = INDEPENDENT_CONTROL_PLANE_REVIEW_AND_OWNER_DECISION
```
