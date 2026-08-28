# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.  
> Repository: `rebootob/MBO2026`  
> Branch: `ai/antigravity-wp002c`  
> Control Plane: ChatGPT  
> Execution Plane: Antigravity only when actual execution is required  
> Updated: 2026-08-28

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|---|
| D1 | Login + Password Change + Employee-Self MBO Gate | 🟠 GROUP+APP801 ACL PASS / CANDIDATE PASS=128 / APP801 PROVISIONING PASS / SESSION ARCHITECTURE+SOURCE+TEST PASS / APP801 SESSION SCHEMA PASS / APP794 SESSION CONTINUITY DEPLOY APPROVED + EXECUTION NEXT / CREATE-HANDLER DEFECT OPEN |
| D2 | Excel + PDF legacy-format export | 🟠 IN PROGRESS |
| D3 | 8 legacy PMS apps -> App794 | 🟠 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | App800 HR Control Center end-to-end | 🟠 IN PROGRESS |
| D5 | Copy own previous MBO only | 🔴 MUST FIX |
| D6 | Integrated E2E / Security / Regression | 🔴 BLOCKED |
| D7 | Admin Support Center | ✅ PASS / CLOSED |

No AI may silently drop D1–D7.

## 2. Authorization Ledger

```text
D1_SESSION_CONTINUITY_ARCHITECTURE       = APPROVED / BASELINED
D1_SESSION_SOURCE_IMPLEMENTATION         = PASS / ACCEPTED
D1_SESSION_TEST_EVIDENCE                 = PASS / ACCEPTED
APP801_SESSION_SCHEMA_WRITE              = PASS / ACCEPTED AFTER INDEPENDENT LIVE/PREVIEW READBACK
APP794_SESSION_CONTINUITY_DEPLOY          = APPROVED 2026-08-28 / DEPLOY-ONLY / APP794 ONLY
D1_LIVE_CUTOVER                          = IN PROGRESS / SESSION CONTINUITY DEPLOY NEXT / FINAL UAT BLOCKED
D1_CREATE_HANDLER_CORRECTIVE             = OPEN / SEPARATE WORK PACKAGE / NOT AUTHORIZED IN DEPLOY TASK
DEDICATED_MBO_ACCESS_GROUP_MODEL         = APPROVED / PASS
APP801_GROUP_ACL_MODEL                    = APPROVED / PASS
D1_CREDENTIAL_CANDIDATE_RULE             = ACCEPTED / BASELINED
D1_CANDIDATE_USER_EXPORT_AUDIT           = PASS / 128 ACCEPTED CANDIDATES
APP801_CREDENTIAL_BULK_PROVISIONING      = PASS / INDEPENDENTLY LIVE VERIFIED 2026-08-28
D2-D7 LIVE WRITES                        = NOT AUTHORIZED unless separately recorded
```

This authorization does **not** authorize source/refactor changes, Create-handler correction, UAT, App801 record/schema writes, record writes in App794, ACL/process/view/layout changes, CSS replacement, or D2-D7 writes.

## 3. Accepted Session Continuity Deployment Package

Accepted session source commit:

```text
7133e2934b0e8f7ea710e03d195157354e0d95b8
```

Accepted final test-proof commit:

```text
9d9db0f2456b5b3407b8dae830493c0eb9a9cc7f
```

Locked target artifact:

```text
PATH                 = dist/mbo-employee-app.js
TARGET_GIT_BLOB_SHA  = d0294229bf0f7ccdf4d161632648bc885794c347
CSS_GIT_BLOB_SHA     = 1359dfae16d1224580210a5a6cd366fb20bcf6f8
```

Independent repository checks already proved:
- current branch target JS blob = accepted target JS blob;
- current branch CSS blob = `1359dfae...`;
- after accepted source commit, only tests/docs changed before this authorization; no source/dist session implementation drift was introduced.

Last independently reviewed App794 live baseline before this session deployment:

```text
LAST_ACCEPTED_LIVE_REVISION          = 42
LAST_ACCEPTED_LIVE_TARGET_JS_BLOB    = 2a9a3c5bfe896b51f482c016f66863bffeddb679
LAST_ACCEPTED_LIVE_CSS_BLOB          = 1359dfae16d1224580210a5a6cd366fb20bcf6f8
LAST_ACCEPTED_SCOPE                  = ALL
LAST_ACCEPTED_DESKTOP_JS_COUNT       = 1
LAST_ACCEPTED_DESKTOP_CSS_COUNT      = 1
LAST_ACCEPTED_MOBILE_JS_COUNT        = 0
LAST_ACCEPTED_MOBILE_CSS_COUNT       = 0
```

These are drift-detection expectations, not permission to assume current production state. Fresh Live/Preview reads are mandatory before any upload.

## 4. Mandatory Pre-Write Gates

Before any remote Kintone write/file upload:

1. sync canonical branch and require clean working tree;
2. run `npm run ui:build`;
3. run `npm test`;
4. require rebuilt `dist/mbo-employee-app.js` Git blob to remain exactly `d0294229bf0f7ccdf4d161632648bc885794c347`;
5. require rebuilt `dist/mbo-employee.css` Git blob to remain exactly `1359dfae16d1224580210a5a6cd366fb20bcf6f8`;
6. if build creates any unexpected source/dist difference or target identity changes, STOP with zero Kintone writes — do not fix source in this task;
7. READ-ONLY dependency check: App801 Live schema must still contain the five accepted Session fields with correct types; no App801 write;
8. fresh-read App794 effective/live and Preview/Test customization;
9. save rollback-ready Live+Preview customization metadata and downloadable target/non-target file identity locally;
10. complete full deterministic `validatePreflight()` before upload;
11. require current Live/Preview topology/scope to be aligned and no unexplained customization drift;
12. require existing effective target JS content to match the last accepted live JS artifact unless Control Plane has documented a later accepted App794 change;
13. require effective CSS content to match accepted CSS blob;
14. invalid/missing/ambiguous target, malformed structure, invalid scope/revision, missing retained Preview fileKey, unexpected topology/content drift, or App801 dependency mismatch => BLOCK BEFORE UPLOAD.

Mandatory local build/test is executor-reported because GitHub currently has no CI proof. It is still a hard pre-write gate.

## 5. Exact Authorized Remote Change

Only after every pre-write gate passes:

```text
TARGET_APP       = 794
TARGET_ENTRY     = Preview desktop.js FILE named mbo-employee-app.js
TARGET_ARTIFACT  = exact accepted JS blob d0294229...
```

Allowed write sequence only:
1. upload exactly one `mbo-employee-app.js` file;
2. build Preview customization PUT from fresh Preview state;
3. preserve scope/order/URLs/mobile entries and every non-target Preview FILE key;
4. include the exact accepted latest positive Preview revision (never `-1`);
5. PUT App794 Preview customization;
6. deploy App794 only;
7. poll until deployment reports SUCCESS.

Required counters:

```text
TARGET_JS_UPLOAD_COUNT             = 1
CSS_UPLOAD_COUNT                   = 0
OTHER_FILE_UPLOAD_COUNT            = 0
PREVIEW_CUSTOMIZATION_PUT_COUNT    = 1
APP794_DEPLOY_REQUEST_COUNT        = 1
APP794_RECORD_WRITES_EXECUTED      = 0
APP801_SCHEMA_WRITES_EXECUTED      = 0
APP801_RECORD_WRITES_EXECUTED      = 0
APP53_795_796_WRITES_EXECUTED      = 0
GROUP_ACL_WRITES_EXECUTED          = 0
PROCESS_VIEW_LAYOUT_WRITES         = 0
D2_D7_WRITES_EXECUTED              = 0
```

## 6. Mandatory Post-Deploy Verification

After deployment reports SUCCESS:
- fresh-read effective Live customization and Preview customization;
- verify Live/Preview topology/scope are aligned after deployment;
- identify/download effective target JS and verify content as the exact accepted artifact (`d0294229...` Git blob or equivalent byte/content hash proof);
- identify/download effective CSS and verify unchanged against `1359dfae...`;
- verify every non-target entry, URL, mobile section, order and scope remains preserved;
- capture revision before/after and target/non-target identities in sanitized evidence.

If deployment/readback/hash/preservation verification fails:

```text
STOP
NO RETRY
NO AUTOMATIC ROLLBACK
NO SOURCE FIX
NO UAT
```

Wait for Control Plane instruction. A successful HTTP response alone is never PASS.

## 7. Separate Create-Handler Defect

Still open and explicitly out of scope:

```text
Employee Profile Resolution Failed
You cannot call kintone.app.record.get() in handler or during processing a handler.
```

Do not fix it in the App794 Session Continuity Deploy task. It remains a separate narrow source/test work package after this deployment is independently reviewed.

## 8. Exact Next Action

```text
NEXT_ACTION_OWNER = Antigravity
ANTIGRAVITY_REQUIRED = YES — ONE NARROW APP794 DEPLOY-ONLY EXECUTION
SOURCE_CHANGE = NO
TEST_CHANGE = NO except executing existing tests
DIST_CHANGE = NO except deterministic rebuild must reproduce locked blobs
KINTONE_WRITE = APP794 CUSTOMIZATION ONLY AS AUTHORIZED ABOVE
APP801_WRITE = NO
CREATE_HANDLER_FIX = NO
UAT = NO
D2_D7_WRITE = NO
MAX_EXECUTOR_STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

After executor evidence is pushed, ChatGPT independently reviews the deployment. No UAT or Create-handler work starts automatically.

## 9. Knowledge / Baseline Maintenance

Baseline promotion:
`NONE — session architecture already canonical.`

Reusable rule:
- when deploying an already-reviewed generated artifact, rebuild must reproduce the locked artifact identity before any production write;
- verify expected current live content before replacing it so an unexplained external/customization change is not silently overwritten;
- preserve non-target Preview fileKeys and never re-upload unchanged CSS merely to reconstruct a customization payload.
