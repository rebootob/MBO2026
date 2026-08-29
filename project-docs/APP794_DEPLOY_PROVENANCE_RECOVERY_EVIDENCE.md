# App794 Deploy Provenance Recovery Evidence — Read-Only Only

Date: 2026-08-29
Branch: `ai/antigravity-wp002c`
HEAD: `6ebb2c8e6cfbe5bfd83a1ecf03f5bff9fcf8792b`

## 1. Summary Ledger

```text
SOURCE_HEAD_USED           = 00ed894fc098d96ec8d0e3c411b3c91a9ff9432b
NPM_TEST                   = PASS
BUILD_ONLY                 = PASS
AUTH_GUARD_ENTERED         = YES
UPLOAD_OCCURRED            = YES
PREVIEW_PUT_OCCURRED       = NO
DEPLOY_POST_OCCURRED       = NO
DEPLOY_FINAL_STATUS        = BLOCKED_PRE_PREVIEW_PUT
LIVE_REVISION              = 44
PREVIEW_REVISION           = 44
LIVE_TARGET_FILE           = mbo-employee-app.js (fileKey: 202608290205471F517BB6A3FA44178E82087D1B7F9085172)
PREVIEW_TARGET_FILE        = mbo-employee-app.js (fileKey: 20260828151215C80FD8A890514C7A8C3DB8B7E456509B094)
LIVE_PREVIEW_MATCH         = NO
LIVE_WRITE_DURING_RECOVERY = 0
```

## 2. Detailed Execution Trail

1. **Attempted Deploy Execution:**
   - Script `executeDeployCustomUi()` entered the guard successfully with authorization ID `APP794-CORRECTIVE-DEPLOY-20260829-01` under `HEAD = 00ed894fc098d96ec8d0e3c411b3c91a9ff9432b`.
   - File upload executed: `Uploaded mbo-employee-app.js -> fileKey: fa6f00b2-d611-488e-88ec-b093837388d8`.
   - Preview PUT failed: `DISCOVERY PHASE WRITE BLOCKED: Method PUT is blocked during Discovery & Architecture Design Phase for App /k/v1/preview/app/customize.json` because `kintoneRequest` did not pass `{ bypassDiscovery: true }`.
   - Single-use fail-closed rule enforced: script threw exception and stopped immediately. No automatic retries or source modifications were attempted.

2. **Live Kintone App 794 GET Read-Back Inspection:**
   - `GET /k/v1/app/customize.json?app=794`:
     - Revision: `"44"`
     - JS File: `mbo-employee-app.js` (`fileKey: 202608290205471F517BB6A3FA44178E82087D1B7F9085172`, size: `309154`)
     - CSS File: `mbo-employee.css` (`fileKey: 20260829020547DFD1FA9AA08945E698EFA69A52C6097F016`, size: `37996`)
   - `GET /k/v1/preview/app/customize.json?app=794`:
     - Revision: `"44"`
     - JS File: `mbo-employee-app.js` (`fileKey: 20260828151215C80FD8A890514C7A8C3DB8B7E456509B094`, size: `309154`)
     - CSS File: `mbo-employee.css` (`fileKey: 2026082813063760BE186443AB4144814C35B7AFAE2DCE213`, size: `37996`)
   - `GET /k/v1/preview/app/deploy.json?apps[0]=794`:
     - Status: `"SUCCESS"` (for App 794 revision 44 from prior ACL update)

3. **Conclusions:**
   - Preview customization has NOT been updated with the newly uploaded `fileKey: fa6f00b2-d611-488e-88ec-b093837388d8`.
   - Live customization remains on the old file `mbo-employee-app.js` (`fileKey: 20260829020547...`).
   - Live writes performed during recovery: `0`.
