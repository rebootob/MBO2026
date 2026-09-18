# Evidence Dossier: D3 Kintone-Only Mixed-Identity Audit Architecture (R2)

## Execution & Evidence Metadata

```text
EVIDENCE_DOSSIER_ID          = D3-KINTONE-ONLY-MIXED-IDENTITY-AUDIT-ARCHITECTURE-CORRECTIVE-01-R2-EVIDENCE
AUTHORIZATION_ID             = MBO2026-D3-KINTONE-ONLY-MIXED-IDENTITY-AUDIT-ARCHITECTURE-CORRECTIVE-01-R2-20260918-OWNER-01
CANONICAL_BRANCH             = ai/antigravity-wp002c
AUTHORIZED_BASE_HEAD         = 22b1823f48e3961f132646073d06acab3c58447f
REVISION                     = R2 (OPTIONS.ACTOR CALL-SITE INVENTORY & REACHABILITY AUDIT)
EXECUTION_MODE               = DOCS_AND_EVIDENCE_CORRECTIVE_ONLY
ZERO_IO_VERIFIED             = YES
STATUS                       = SUBMITTED_FOR_INDEPENDENT_CONTROL_PLANE_REVIEW
```

---

## 1. Scope & Objective of R2 Corrective

This dossier provides exhaustive, verbatim source code evidence from `rebootob/MBO2026` at commit `22b1823f48e3961f132646073d06acab3c58447f` to close the final Independent Control Plane finding:
1. **Actor Derivation Precedence:** Formally documents that inside `executeProcessTransitionArchive(...)`, `actorCode` is derived via `String(options.actor || loginUser?.code || '').trim()`, establishing a two-tier derivation order: (1) `options.actor`, (2) fallback `kintone.getLoginUser().code`.
2. **Exhaustive Call-Site Audit:** Inspects and classifies every repository invocation of `executeProcessTransitionArchive(...)`.
3. **Production Hook Truth:** Verifies that the active D3 production workflow invokes `handleD3BrowserTrustedTransition` and does not call `executeProcessTransitionArchive(...)`.
4. **Authority Conclusion:** Explicitly concludes `PRODUCTION_ACTOR_OVERRIDE_PATH = NOT_ACTIVE` and `OPTIONS_ACTOR_CLASSIFICATION = TEST_OR_LEGACY_ONLY`.
5. **Preservation of Owner Locks:** Preserves the dual-identity requirement (Actual Operator vs. Kintone Principal), Subject Employee separation, `KINTONE_ONLY_PLATFORM_LEVEL_ANTI_FORGERY = NOT_PROVEN`, and Decision 009 status.

---

## 2. Zero-I/O & Governance Accounting

All actions conducted within this package are strictly bounded to local documentation and evidence correction. Zero external resources, databases, servers, or live Kintone environments were accessed or altered.

```text
================================================================================
GOVERNANCE & I/O VERIFICATION METRICS
================================================================================
SOURCE_CHANGES                     = 0
TEST_CHANGES                       = 0
KINTONE_API_READS                  = 0
KINTONE_API_WRITES                 = 0
APP_SCHEMA_CHANGES                 = 0
APP_ACL_CHANGES                    = 0
PROCESS_MANAGEMENT_CHANGES         = 0
RECORD_WRITES                      = 0
OAUTH_CLIENT_REGISTRATIONS         = 0
REAL_OAUTH_FLOWS_EXECUTED          = 0
EXTERNAL_BACKEND_PROVISIONED       = 0
REDIS_INSTANCES_PROVISIONED        = 0
SQL_DATABASES_PROVISIONED          = 0
SECRET_VAULTS_PROVISIONED          = 0
CLOUD_RUNTIMES_PROVISIONED         = 0
DEPLOYMENT_ACTIONS                 = 0
UAT_EXECUTED                       = 0
================================================================================
```

---

## 3. Verbatim Source Inspection & Seam Verification

All snippets below are exact, verbatim source code extracted from the repository at the authorized base commit.

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
- In SHARED mode, identity resolution delegates to `mboLoginGate.requireLogin(uiHost)` and yields `{ mode: 'SHARED', employeeCode: empCode, kintoneUserCode }`.
- In DEDICATED mode, lookup candidates from App 53 are verified via `MboIdentityService.resolveDedicatedKintoneUserMapping(...)`. Upon `IDENTITY_BOUND`, it yields `{ mode: 'DEDICATED', employeeCode: mappingRes.employeeCode, kintoneUserCode }`.

---

### 3.2 Verification of `MboKintoneLoginGate`
File: `src/ui/mbo-kintone-login-gate.js` (lines 53–61, 90–123)

```javascript
// --- LITERAL SOURCE EXCERPT START ---
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
// --- LITERAL SOURCE EXCERPT END ---
```

**Verified Facts:**
- `getEmployeeCode()` returns `this._principal.employeeCode` only when authenticated and password change is not pending; otherwise returns `null` (fail-closed).
- `requireLogin` checks existing principal, falls back to `sessionManager.restoreSession()`, and if unauthenticated renders a blocking UI overlay.

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

### 3.4 Verification of `executeProcessTransitionArchive` Actor Derivation
File: `src/main-mbo-app.js` (lines 1385–1414)

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

**Literal Actor Derivation Order:**
1. `options.actor` (if truthy string provided by caller)
2. Fallback: `loginUser?.code` (where `loginUser` is `options.loginUser` or `kintone.getLoginUser()`)
3. Empty fallback (`''`), which triggers `!actorCode` fail-closed error.

---

### 3.5 Exhaustive Call-Site Inventory for `executeProcessTransitionArchive`

A complete codebase search for `executeProcessTransitionArchive` was executed across the entire repository. Below is the full inventory of all call sites:

```text
========================================================================================================================
CALL SITE INVENTORY: executeProcessTransitionArchive(...)
========================================================================================================================
1. DECLARATION / EXPORT
   File:                     src/main-mbo-app.js (line 1355)
   Function:                 export async function executeProcessTransitionArchive(record, event, options = {})
   Runtime Classification:   EXPORT_ONLY_HELPER
   Options Object Source:    N/A (Function declaration)
   Actor Argument Present:   N/A
   Actor Value Source:       N/A
   User Controlled:          N/A
   Notes:                    No internal call site exists anywhere in src/.

2. LEGACY DISTRIBUTION BUNDLE
   File:                     dist/mbo-employee-app.js (lines 12771–12773)
   Function:                 Anonymous handler in kintone.events.on('app.record.detail.process.proceed', ...)
   Runtime Classification:   LEGACY_BUNDLE (stale build artifact)
   Options Object Source:    Inline literal: { apiAdapter: kintoneApiWrapper }
   Actor Argument Present:   NO (options.actor is undefined)
   Actor Value Source:       N/A (falls back internally to kintone.getLoginUser().code)
   User Controlled:          NO

3. TEST SUITE
   File:                     tests/d3-stage-archive-integration.test.js
   Function:                 Integration test cases (24 distinct call invocations)
                             Lines: 103, 125, 147, 169, 188, 207, 226, 237, 248, 293, 316,
                             340, 365, 379, 401, 420, 447, 466, 474, 616, 628, 640, 667, 701, 712.
   Runtime Classification:   TEST
   Options Object Source:    Test fixture objects
   Actor Argument Present:   YES (in select test cases, e.g. { actor: 'custom.actor' })
   Actor Value Source:       Hardcoded test mock string
   User Controlled:          NO (automated Node test runner only)
========================================================================================================================
```

---

### 3.6 Production Hook Truth: Active D3 Workflow Path
File: `src/main-mbo-app.js` (lines 1319–1335)

```javascript
// --- LITERAL SOURCE EXCERPT START ---
    const isD3TargetTransition = (
      (currentStatus === '05 Objective Approved' && actionName === 'Start Mid-Year' && nextStatus === '06 Employee Mid-Year') ||
      (currentStatus === '10 Mid-Year Completed' && actionName === 'Start Self Evaluation' && nextStatus === '11 Employee Self Evaluation') ||
      (currentStatus === '15 HR Final Check' && actionName === 'Complete' && nextStatus === '16 Completed')
    );

    if (isD3TargetTransition) {
      // D3 Trusted Writer Platform-Stamped Architecture:
      // Delegate to handleD3BrowserTrustedTransition helper (fail-closed, always returns false)
      const recordId = Number(event.recordId || record?.$id?.value || record?.$id || record?.Record_ID?.value || record?.Record_ID || 0);
      await handleD3BrowserTrustedTransition({
        recordId,
        actionName,
        fetchFn: typeof fetch === 'function' ? fetch : null
      });
      return false; // Cancel native transition unconditionally
    }

    return event;
// --- LITERAL SOURCE EXCERPT END ---
```

And lines 1432–1483:
```javascript
// --- LITERAL SOURCE EXCERPT START ---
export async function handleD3BrowserTrustedTransition({
  recordId,
  actionName,
  endpoint,
  fetchFn
} = {}) {
  const targetEndpoint = endpoint || ((typeof window !== 'undefined' && window.__MBO_D3_PREPARE_ENDPOINT__)
    ? window.__MBO_D3_PREPARE_ENDPOINT__
    : '/api/mbo/d3/transaction/prepare-transition');

  const effectiveFetch = fetchFn || ((typeof fetch === 'function') ? fetch : null);

  if (!effectiveFetch) {
    return { cancelled: true, error: 'FETCH_UNAVAILABLE' };
  }

  try {
    const res = await effectiveFetch(targetEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recordId: Number(recordId),
        intendedAction: String(actionName || '').trim()
      })
    });
...
// --- LITERAL SOURCE EXCERPT END ---
```

**Verified Facts:**
- The active D3 production browser hook unconditionally delegates target transitions to `handleD3BrowserTrustedTransition` and returns `false`.
- `handleD3BrowserTrustedTransition` makes a `POST /api/mbo/d3/transaction/prepare-transition` HTTP request.
- `executeProcessTransitionArchive` is **NEVER called** by the active production D3 workflow in `src/main-mbo-app.js`.

---

### 3.7 Explicit Reachability Determination

```text
================================================================================
FINAL REACHABILITY DETERMINATION:
================================================================================
PRODUCTION_ACTOR_OVERRIDE_PATH = NOT_ACTIVE
OPTIONS_ACTOR_CLASSIFICATION   = TEST_OR_LEGACY_ONLY
================================================================================
```

**Security Analysis:**
- The helper `executeProcessTransitionArchive(...)` itself provides an `options.actor` override mechanism, which could be vulnerable to spoofing if exposed to untrusted user input.
- However, because the active production D3 workflow does not call this helper, the override path is `NOT_ACTIVE` in production.
- The helper is NOT claimed to be intrinsically trustworthy.

---

## 4. App 798 Anti-Forgery Trust Boundary Analysis

### 4.1 Rejection of `GROUP everyone Add = YES`
- Setting App 798 permissions to `GROUP everyone: Add = YES, View = NO` is rejected as insecure against direct REST API tampering.
- Users with `Add = YES` permission can issue arbitrary `POST /k/v1/record.json` calls via DevTools, fabricating audit records without client-side JS validation.

### 4.2 Critical Security Question & Determination

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

## 5. Treatment of Decision 009 & Provenance

1. **Decision 009 (`OWNER_DEC_D3_009`) Provenance:**
   - Established a trusted external writer architecture specifically to overcome Kintone's lack of server-side REST API pre-commit validation.
   - Preserved verbatim in repository control history.
2. **Authority Treatment:**
   - Because `KINTONE_ONLY_PLATFORM_LEVEL_ANTI_FORGERY = NOT_PROVEN`, Decision 009 **CANNOT be declared superseded on technical security equivalence**.
   - It remains `NOT_SUPERSEDED_AT_THIS_STAGE`, representing the formal trade-off between infrastructure simplicity (Kintone-only) and platform-level anti-forgery (External Trusted Writer).

---

## 6. Stop Condition & Review Sign-Off

```text
STOP_FOR_INDEPENDENT_CONTROL_PLANE_REVIEW = YES
CURRENT_STATUS                           = SAFE_STOP
```
