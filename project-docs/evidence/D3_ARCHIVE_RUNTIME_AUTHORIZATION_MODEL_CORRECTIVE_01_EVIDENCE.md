# D3-ARCHIVE-RUNTIME-AUTHORIZATION-MODEL-CORRECTIVE-01 Evidence Artifact

## 1. Executive Summary & Authorization Ledger

```text
PACKAGE                                  = D3-ARCHIVE-RUNTIME-AUTHORIZATION-MODEL-CORRECTIVE-01
MODE                                     = SOURCE + TEST ONLY / NO LIVE WRITE
OWNER_AUTHORIZATION                      = APPROVED
AUTHORIZED_BASE_HEAD                     = c6aedc15914a6dc464c843e0d11c4324e3a826ad
AUTHORIZED_BASE_PARENT                   = 7076410f3bd8184a8308aa57c8907f367887623f
AUTHORIZED_BASE_TREE                     = 5982fe19aa28b990a0112deb377534cd32f0f2a8
BASE_MESSAGE                             = docs(d3): correct commit 6e511a scope compliance in reconciliation evidence
SCOPE_CONTROL                            = STRICT
SCOPE_EXPANSION_AUTHORIZED               = NO

KINTONE_READS                            = 0
KINTONE_WRITES                           = 0
ACL_WRITES                               = 0
SCHEMA_WRITES                            = 0
PROCESS_WRITES                           = 0
CUSTOMIZATION_WRITES                     = 0
DEPLOYMENTS                              = 0
WORKFLOW_TRANSITIONS                     = 0
BUSINESS_UAT_ACTIONS                     = 0

DIST_FILES_CHANGED                       = 0
SOURCE_FILES_CHANGED                     = 0
TEST_FILES_CHANGED                       = 0

AUTHORIZATION_MODEL_CORRECTIVE           = STOPPED_ARCHITECTURE_DECISION_REQUIRED
RESULT                                   = STOPPED_ARCHITECTURE_DECISION_REQUIRED
TRUSTED_ARCHIVE_WRITE_PATH               = ARCHITECTURE_DECISION_REQUIRED
LIVE_DEPLOYMENT                          = NOT PERFORMED
FULL_D3_BUSINESS_UAT                     = NOT PROVEN
D3_CLOSURE                               = NOT CLAIMED
PRODUCTION_READY                         = NO
NEXT_GATE_AUTHORIZED                     = NO
AUTO_START_NEXT_WORK_PACKAGE             = NO
FINAL_STATE                              = STOP FOR INDEPENDENT CONTROL PLANE REVIEW
```

---

## 2. Root Cause Analysis

1. **Client-Side Execution Context:**
   - In `src/main-mbo-app.js`, stage archival is triggered synchronously inside the Kintone process proceed handler:
     `kintone.events.on('app.record.detail.process.proceed', async (event) => { ... })`
   - The archive execution function `executeProcessTransitionArchive` uses the client-side adapter `kintoneApiWrapper`.
   - `kintoneApiWrapper.addRecord` executes `kintone.api('/k/v1/record.json', 'POST', ...)` within the browser's ambient Cybozu session context.

2. **Caller Identity & Workflow Transition Matrix:**
   - **Transition 1:** `05 Objective Approved` &rarr; `06 Employee Mid-Year` (Action: `Start Mid-Year`).
     - Authorized Workflow Actor: Employee (`Requester_User`).
   - **Transition 2:** `10 Mid-Year Completed` &rarr; `11 Employee Self Evaluation` (Action: `Start Self Evaluation`).
     - Authorized Workflow Actor: Employee (`Requester_User`).
   - **Transition 3:** `15 HR Final Check` &rarr; `16 Completed` (Action: `Complete`).
     - Authorized Workflow Actor: HR Operator (`USER hr`).

3. **Current Live ACL of App 798 (Revision 6):**
   - `USER hr`:
     - `appEditable = false`
     - `recordViewable = true`
     - `recordAddable = true`
     - `recordEditable = false`
     - `recordDeletable = false`
   - `GROUP everyone`:
     - `appEditable = false`
     - `recordViewable = false`
     - `recordAddable = false`
     - `recordEditable = false`
     - `recordDeletable = false`

4. **Failure Mechanism (Fail-Closed Block):**
   - When an employee initiates Transition 1 or Transition 2, the browser-side `kintone.api()` call attempts to write directly to App 798 under the employee's Kintone identity.
   - Kintone rejects the write with HTTP 403 Forbidden (`GAIA_IL02`).
   - Line 1327 of `src/main-mbo-app.js` enforces the accepted fail-closed rule:
     `return false; // Fail-closed: block transition`
   - Valid business workflow progression is consequently blocked for ordinary employees.

---

## 3. Evaluation of Constraints and Architecture Alternatives

| Approach | Architecture Description | Security & Governance Evaluation | Feasibility / Verdict |
| :--- | :--- | :--- | :--- |
| **Path 1: Loosen App 798 ACL** | Grant `GROUP everyone: recordAddable = true` and `recordViewable = false` in App 798 ACL. | **VIOLATION:** Explicitly prohibited by Critical Architecture Rule (`DO NOT solve this defect by granting GROUP everyone: recordAddable = true or recordViewable = true`). Kintone permission nuances do not guarantee complete protection against unconstrained record creation without server-side arbitration. | **FORBIDDEN** |
| **Path 2: Client-Side Privileged Credentials** | Embed an API token or HR credential in App 794 browser bundle/source (`dist/mbo-employee-app.js`). | **VIOLATION:** Explicitly prohibited by Critical Architecture Rule (`DO NOT embed in browser-delivered code: Kintone API token, password, Basic Auth credential, admin credential, HR credential, service-account secret`). Shipping secrets to client browsers creates severe privilege escalation vulnerabilities. | **FORBIDDEN** |
| **Path 3: Route via Existing Gateway Boundary** | Extend `src/server/mbo-gateway-server.js` and `src/services/mbo-employee-self-gateway.js` to expose an archive endpoint. | **ARCHITECTURE GAP:** See Section 4 below. The gateway is designed for Mode 2 (Shared Secondary Auth) and is not deployed (`NOT DEPLOYED TO LIVE HOST`). App 794 browser customization has no network connectivity, host URL, or session mapping to this server. | **BLOCKED (DECISION REQUIRED)** |

---

## 4. Detailed Technical Architecture Gap

The repository control instruction specifies:
> "Determine whether the repository already contains an accepted trusted/server-side execution path suitable for archive creation.
> Examples may include an existing gateway/service boundary already authorized by MBO2026 architecture.
> Do not assume one exists.
> If an existing trusted path exists: Use the smallest repository-native extension necessary...
> If NO accepted trusted path exists, or implementation would require inventing new credential storage / infrastructure / external service architecture:
> STOP = ARCHIVE_TRUSTED_WRITE_ARCHITECTURE_DECISION_REQUIRED"

### Findings on Repository Gateway State:
1. **Intended Domain Boundary:**
   - `src/server/mbo-gateway-server.js` and `src/services/mbo-employee-self-gateway.js` were architected strictly for **Dual-Identity Architecture Mode 2** (Shared Kintone Account / Factory Secondary Authentication via App 801).
   - Sessions are maintained via `mbo_session` HTTP cookies verified against App 801 secondary credentials.

2. **Deployment State:**
   - As documented in `project-docs/control/00_MASTER_DELIVERY_CONTROL.md` (Section 3.1) and `project-docs/D1-C4A_GATEWAY_RUNTIME_DEPLOYMENT.md`:
     `Status: NOT DEPLOYED TO LIVE HOST (Sandbox is using pure Kintone customization; Gateway is designed for self-hosted Node runtime)`.
   - There is no live running gateway instance accessible to the sandbox browser runtime.

3. **Browser Customization Topology:**
   - App 794 Desktop Customization (`dist/mbo-employee-app.js`) runs inside Kintone SaaS (`https://rebootob.cybozu.com/k/794/`) under dedicated employee Kintone accounts (Mode 1).
   - The browser customization has no configured external backend URL, no CORS binding, and no network channel to any external Node.js daemon.
   - Dedicated Kintone browser users do not have `mbo_session` tokens. They authenticate with Cybozu session cookies (`JSESSIONID`), which cannot be validated or consumed by `mbo-gateway-server.js` without inventing external proxy architecture and Cybozu API credential delegation.

4. **Conclusion on Trusted Write Path:**
   - Connecting browser-side App 794 transitions to a server-side writer cannot be achieved by a simple repository extension.
   - It fundamentally requires:
     1. Provisioning, deploying, and hosting external server infrastructure.
     2. Establishing a secure network bridge between `rebootob.cybozu.com` and the external server (CORS / domain routing).
     3. Inventing a secure token exchange mechanism to prove caller identity from a Cybozu client session to the external server without exposing static secrets in the browser.
   - Therefore, by the explicit terms of the execution mandate, no accepted trusted path exists, and creating speculative infrastructure is forbidden.

---

## 5. Required Stop Condition & Governance Classification

- **Governance Decision:** `STOP = ARCHIVE_TRUSTED_WRITE_ARCHITECTURE_DECISION_REQUIRED`
- **Action Taken:**
  - Zero speculative server infrastructure created.
  - Zero secrets added to browser code or repository.
  - Zero modifications to App 798 ACL.
  - Zero modifications to production source code (`src/`).
  - Zero modifications to test suites (`tests/`).
  - Zero modifications to generated distribution bundles (`dist/`).
  - Zero modifications to control authority documents (`project-docs/control/`, `AI_CONTROL_CENTER.md`, `AI_ACTIVE_TASK.md`, `CHAT_HANDOFF.md`).
  - Exactly one new evidence file created documenting the architectural gap:
    `project-docs/evidence/D3_ARCHIVE_RUNTIME_AUTHORIZATION_MODEL_CORRECTIVE_01_EVIDENCE.md`

---

## 6. Architecture Options for Control Plane & Owner Decision

To resolve the archive authorization defect permanently, one of the following architectural models must be formally selected and authorized by the Project Owner:

1. **Option A: Trusted Serverless Micro-Service (Recommended for Least-Privilege)**
   - Deploy a lightweight, authenticated serverless function (e.g. Cloudflare Worker, AWS Lambda) holding `KINTONE_SERVER_CREDENTIAL` with write-only access to App 798.
   - App 794 browser customization calls this service via `kintone.proxy()` passing user context; the service verifies App 794 record state and business invariants before writing to App 798.

2. **Option B: Kintone Process Management Webhook with Asynchronous Archive Handshake**
   - Trigger an external webhook from Kintone Process Management upon status change.
   - Requires reconciling the synchronous archive-before-transition rule (`APP794_ROUTE_SNAPSHOT_REUSE_BEFORE_ARCHIVE_SUCCESS = FORBIDDEN`) with webhook asynchronous latency.

3. **Option C: Owner-Ratified App 798 ACL Restructuring**
   - If acceptable to the Owner under a revised privacy impact assessment, configure App 798 permissions to permit `GROUP everyone: recordAddable = true` while strictly enforcing `recordViewable = false`, combined with field-level permissions and immutable audit constraints.

---

## 7. Verification & Ledger Consistency

- `BASE_HEAD`: `c6aedc15914a6dc464c843e0d11c4324e3a826ad`
- `PARENT_SHA`: `c6aedc15914a6dc464c843e0d11c4324e3a826ad`
- `KINTONE_READS`: 0
- `KINTONE_WRITES`: 0
- `STATUS`: **HALTED SAFELY FOR INDEPENDENT CONTROL PLANE REVIEW**
