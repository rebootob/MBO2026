# Evidence Dossier: D3 Live Kintone Artifact Read-Only Verification (R3)

## Execution & Evidence Metadata

```text
EVIDENCE_DOSSIER_ID          = D3-KINTONE-ONLY-MIXED-IDENTITY-AUDIT-LIVE-ARTIFACT-READONLY-VERIFICATION-01-EVIDENCE
PACKAGE_ID                   = D3-KINTONE-ONLY-MIXED-IDENTITY-AUDIT-LIVE-ARTIFACT-READONLY-VERIFICATION-01
AUTHORIZATION_ID             = MBO2026-D3-KINTONE-ONLY-MIXED-IDENTITY-AUDIT-LIVE-ARTIFACT-READONLY-VERIFICATION-01-20260918-OWNER-01
CANONICAL_BRANCH             = ai/antigravity-wp002c
AUTHORIZED_BASE_HEAD         = e496c230f687e7129eb3b2cc821624ba36dbc251
REVISION                     = R3 (LIVE KINTONE APP 794 ARTIFACT VERIFICATION & DIVERGENCE AUDIT)
EXECUTION_MODE               = LIVE_KINTONE_READ_ONLY_ARTIFACT_VERIFICATION
ZERO_WRITE_VERIFIED          = YES
STATUS                       = SUBMITTED_FOR_INDEPENDENT_CONTROL_PLANE_REVIEW
```

---

## 1. Scope & Objective of R3 Live Verification

This dossier documents the live, read-only verification of Kintone App 794 to definitively resolve the architectural divergence between:
1. **Current Source Truth (`src/main-mbo-app.js`):** Contains `handleD3BrowserTrustedTransition` sending `POST /api/mbo/d3/transaction/prepare-transition` and returning `false`.
2. **Current Repository Dist File (`dist/mbo-employee-app.js`):** The build artifact (`REPOSITORY_DIST_ARTIFACT`) produced by `scripts/kintone/build-mbo-ui.js` used by `scripts/kintone/deploy-custom-ui.js`.
3. **Current Live Deployed Customization in Kintone App 794:** Downloaded directly from the live Kintone tenant via `GET /k/v1/app/customize.json?app=794` and `GET /k/v1/file.json?fileKey=...`.

---

## 2. Zero-Write & Kintone Read Accounting

Under explicit Owner authorization, exactly two read-only operations were executed against Kintone API. Zero write, upload, deploy, or mutation operations occurred.

```text
================================================================================
KINTONE READ & ZERO-WRITE ACCOUNTING
================================================================================
KINTONE_API_READS                  = 2
  - READ 1: GET /k/v1/app/customize.json?app=794
  - READ 2: GET /k/v1/file.json?fileKey=202609170459422F30CF7537A04677A30692B4A83EC2E8054
KINTONE_API_WRITES                 = 0
CUSTOMIZATION_WRITES (PUT)         = 0
DEPLOY_POSTS                       = 0
FILE_UPLOADS (POST)                = 0
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
SOURCE_CHANGES                     = 0
TEST_CHANGES                       = 0
DEPLOYMENT_ACTIONS                 = 0
UAT_EXECUTED                       = 0
================================================================================
```

---

## 3. Live Kintone App 794 Customization Metadata Capture

```json
{
  "scope": "ALL",
  "revision": "76",
  "desktop": {
    "js": [
      {
        "type": "FILE",
        "file": {
          "fileKey": "202609170459422F30CF7537A04677A30692B4A83EC2E8054",
          "name": "mbo-employee-app.js",
          "contentType": "text/javascript",
          "size": "713130"
        }
      }
    ],
    "css": [
      {
        "type": "FILE",
        "file": {
          "fileKey": "20260917045943AC6B131AFBDE4DA4A6B8EB6D779184B4049",
          "name": "mbo-employee.css",
          "contentType": "text/css",
          "size": "44301"
        }
      }
    ]
  },
  "mobile": {
    "js": [],
    "css": []
  }
}
```

---

## 4. Cryptographic Hash & Byte Comparison

The raw bytes of the currently attached live JavaScript file were downloaded via `GET /k/v1/file.json?fileKey=202609170459422F30CF7537A04677A30692B4A83EC2E8054` and compared against the repository dist file:

```text
================================================================================
HASH & BYTE COMPARISON
================================================================================
Metric                      Live Downloaded Artifact         Repository Dist File (dist/mbo-employee-app.js)
--------------------------------------------------------------------------------
File Name                   mbo-employee-app.js              mbo-employee-app.js
Byte Length                 713,130 bytes                    713,130 bytes
SHA-256 Hash                c2049fba52d4fb6e82faf767ff359... c2049fba52d4fb6e82faf767ff359...
                            (Full: c2049fba52d4fb6e82faf767ff359f37dbafab57aea1e9dada74c022b884989f)
--------------------------------------------------------------------------------
BYTE EQUALITY RESULT:       LIVE_EQUALS_REPOSITORY_DIST = YES (100% Identical)
================================================================================
```

---

## 5. Live Artifact Static Analysis & Marker Inspection

Direct inspection of the downloaded live JavaScript bytes (`c2049fba52d4fb6e82faf767ff359f37dbafab57aea1e9dada74c022b884989f`):

```text
================================================================================
MARKER INSPECTION RESULTS (LIVE DOWNLOADED JS)
================================================================================
handleD3BrowserTrustedTransition                  : FALSE (Not present)
/api/mbo/d3/transaction/prepare-transition         : FALSE (Not present)
executeProcessTransitionArchive                   : TRUE  (Present at Line 13063)
options.actor                                     : TRUE  (Present at Line 13077)
actorCode                                         : TRUE  (Present at Line 13077)
app.record.detail.process.proceed                 : TRUE  (Present at Line 12732)
================================================================================
```

### Verbatim Wiring in Live Artifact:
Lines 12732–12773 of the live deployed bundle:
```javascript
kintone.events.on("app.record.detail.process.proceed", async function(event) {
  const record = event.record;
  const actionName = event.action?.value || "";
  const stage = resolveBusinessStage(event);
  const context = currentEmployeeSelfContext;
  const recordEmpCode = record?.Employee_Code?.value;
  ...
  const archiveOutcome = await executeProcessTransitionArchive(record, event, {
    apiAdapter: kintoneApiWrapper
  });
  if (archiveOutcome && archiveOutcome.success === false) {
    const errDetail = archiveOutcome.error || "Archive verification failed";
    ...
    return false;
  }
});
```

### Verbatim Helper in Live Artifact:
Lines 13063–13083 of the live deployed bundle:
```javascript
async function executeProcessTransitionArchive(record, event, options = {}) {
  const currentStatus = String(event?.status?.value || event?.currentStatus || record?.Status?.value || record?.Status || "").trim();
  const nextStatus = String(event?.nextStatus?.value || event?.nextStatus || "").trim();
  const actionName = String(event?.action?.value || event?.action || "").trim();
  let targetStage = null;
  if (currentStatus === "05 Objective Approved" && actionName === "Start Mid-Year" && nextStatus === "06 Employee Mid-Year") {
    targetStage = "OBJECTIVE";
  } else if (currentStatus === "10 Mid-Year Completed" && actionName === "Start Self Evaluation" && nextStatus === "11 Employee Self Evaluation") {
    targetStage = "MIDYEAR";
  } else if (currentStatus === "15 HR Final Check" && actionName === "Complete" && nextStatus === "16 Completed") {
    targetStage = "FINAL";
  }
  if (!targetStage) {
    return { success: true, skipped: true, reason: "NOT_A_TARGET_TRANSITION" };
  }
  const apiAdapter = options.apiAdapter || kintoneApiWrapper;
  const loginUser = options.loginUser || (typeof kintone !== "undefined" && typeof kintone.getLoginUser === "function" ? kintone.getLoginUser() : null);
  const actorCode = String(options.actor || loginUser?.code || "").trim();
  if (!actorCode) {
    const errorMsg = `[D3 ARCHIVE ERROR] Cannot resolve actor login identity for transition ${currentStatus} -> ${nextStatus}. Transition blocked.`;
    console.error(errorMsg);
    return { success: false, error: "ACTOR_IDENTITY_UNRESOLVED" };
  }
  ...
```

---

## 6. Authoritative Runtime Determinations

```text
================================================================================
AUTHORITATIVE RUNTIME CONCLUSIONS
================================================================================
LIVE_DEPLOYED_D3_PATH             = LEGACY_EXECUTE_PROCESS_TRANSITION_ARCHIVE_PATH
LIVE_DEPLOYED_ACTOR_OVERRIDE_PATH = ACTIVE_OR_REACHABLE
================================================================================
```

### Security Implications Preserved for Control Plane Review:
1. **Live Environment Execution:** The live deployed Kintone application currently runs the client-side `executeProcessTransitionArchive` logic, directly performing REST writes to App 798.
2. **Actor Override Reachability:** Because `executeProcessTransitionArchive` is actively executed within the browser process transition pipeline, the helper's internal evaluation of `options.actor` is reachable in the client runtime.
3. **Identity Vulnerability in SHARED Mode:** Under the live bundle, when operating under a shared Kintone account (e.g., `f2`), `actorCode` falls back to `f2`, losing the actual human employee ID (`EMP00125`) authenticated via MBO Login Lock.

---

## 7. Call-Site Inventory & Test Call-Site Count Correction

### 7.1 Automated Integration Test Call-Sites
Verification of `tests/d3-stage-archive-integration.test.js` confirms exactly **25** invocations of `executeProcessTransitionArchive(...)`:

```text
Invocation 1  : Line 103  - const outcome = await executeProcessTransitionArchive(record, event, { ... })
Invocation 2  : Line 125  - const outcome = await executeProcessTransitionArchive(record, event, { ... })
Invocation 3  : Line 147  - const outcome = await executeProcessTransitionArchive(record, event, { ... })
Invocation 4  : Line 169  - const outcome = await executeProcessTransitionArchive(record, event, { ... })
Invocation 5  : Line 188  - const outcome = await executeProcessTransitionArchive(record, event, { ... })
Invocation 6  : Line 207  - const outcome = await executeProcessTransitionArchive(record, event, { ... })
Invocation 7  : Line 226  - const outcome05 = await executeProcessTransitionArchive(record, event05, { ... })
Invocation 8  : Line 237  - const outcome10 = await executeProcessTransitionArchive(record, event10, { ... })
Invocation 9  : Line 248  - const outcome15 = await executeProcessTransitionArchive(record, event15, { ... })
Invocation 10 : Line 293  - const outcome = await executeProcessTransitionArchive(badRecord, event, { ... })
Invocation 11 : Line 316  - const outcome = await executeProcessTransitionArchive(badRecord, event, { ... })
Invocation 12 : Line 340  - const outcome = await executeProcessTransitionArchive(badRecord, event, { ... })
Invocation 13 : Line 365  - const outcome1 = await executeProcessTransitionArchive(badRecord1, event, { ... })
Invocation 14 : Line 379  - const outcome2 = await executeProcessTransitionArchive(badRecord2, event, { ... })
Invocation 15 : Line 401  - const outcome = await executeProcessTransitionArchive(invalidRecord, event, { ... })
Invocation 16 : Line 420  - const outcome = await executeProcessTransitionArchive(record, event, { ... })
Invocation 17 : Line 447  - const outcome = await executeProcessTransitionArchive(record, event, { ... })
Invocation 18 : Line 466  - const outcome1 = await executeProcessTransitionArchive(record, event, { ... })
Invocation 19 : Line 474  - const outcome2 = await executeProcessTransitionArchive(record, event, { ... })
Invocation 20 : Line 616  - const outcomeA = await executeProcessTransitionArchive(missingObjTextRecord, event, { ... })
Invocation 21 : Line 628  - const outcomeB = await executeProcessTransitionArchive(missingScoreRecord, event, { ... })
Invocation 22 : Line 640  - const outcomeC = await executeProcessTransitionArchive(badCountRecord, event, { ... })
Invocation 23 : Line 667  - const outcome = await executeProcessTransitionArchive(k1Record, event, { ... })
Invocation 24 : Line 701  - const outcomeA = await executeProcessTransitionArchive(multiUserRecord, event, { ... })
Invocation 25 : Line 712  - const outcomeB = await executeProcessTransitionArchive(badRuleRecord, event, { ... })
TOTAL COUNT   : 25 distinct invocations
```

### 7.2 Repository Inventory Summary

| # | File | Scope | Classification | Options Source | `options.actor` | Actor Source | Active in Live? |
| :- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `src/main-mbo-app.js:1355` | Declaration / Export | `EXPORT_ONLY_HELPER` | N/A | N/A | N/A | NO (Uncalled in src/) |
| 2 | `dist/mbo-employee-app.js:12771` | Event Listener | `REPOSITORY_DIST_ARTIFACT` | `{ apiAdapter: kintoneApiWrapper }` | NO | Fallback `loginUser.code` | **YES** (Wired to Live App 794) |
| 3 | `tests/d3-stage-archive-integration.test.js` | Integration Tests | `TEST` (25 call sites) | Test mock objects | YES (Select cases) | Hardcoded test fixtures | NO (Automated harness) |

---

## 8. Preserved Owner Governance Locks

```text
================================================================================
OWNER GOVERNANCE LOCKS: STATUS VERIFICATION
================================================================================
1. SHARED Mode Dual Identity Capture            : PRESERVED (Requires Actual Operator + Kintone Login)
2. Subject Employee Separation                  : PRESERVED (App794.Employee_Code = Subject Employee != Operator)
3. Anti-Forgery Determination                   : PRESERVED (KINTONE_ONLY_PLATFORM_LEVEL_ANTI_FORGERY = NOT_PROVEN)
4. Insecure ACL Workaround Rejection            : PRESERVED (GROUP everyone Add = YES is NOT ACCEPTED)
5. Decision 009 Status                          : PRESERVED (Decision 009 = NOT_SUPERSEDED_AT_THIS_STAGE)
================================================================================
```

---

## 9. Conclusion & Safe Stop

```text
STOP_FOR_INDEPENDENT_CONTROL_PLANE_REVIEW = YES
STATUS = SAFE_STOP
```
