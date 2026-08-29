# AI ACTIVE TASK — APP794 EMERGENCY RECOVERY TO KNOWN-GOOD REV51

Mode: **ANTIGRAVITY ONE-SHOT EMERGENCY RECOVERY — EXACT AUTHORIZATION ONLY**
Branch: `ai/antigravity-wp002c`

Authorization ID:
`APP794-D1-EMERGENCY-RECOVERY-REV51-20260829-01`

Authorization state:
`AUTHORIZED / UNCONSUMED`

## Current Live Problem

App794 Live customization is currently known as rev53 after a failed rollback. User reports that custom MBO UI is no longer rendering and only native Kintone fields/list remain.

Do NOT attempt to repair the new Combined Employee UI in this task.

## Exact Recovery Source of Truth

Recovery material MUST come directly from repository commit:
`ec6278524a2d5eb53050d0580c340d1b4e866b97`

Exact required files and Git blob identities:
```text
RECOVERY_JS_PATH      = dist/mbo-employee-app.js
RECOVERY_JS_BLOB_SHA  = e04aa07852e8e5aa4e4234f6efce5c99f2b37ec8
RECOVERY_CSS_PATH     = dist/mbo-employee.css
RECOVERY_CSS_BLOB_SHA = 1710d770ae87fb5f910d669dd5a88ea0950e6991
RECOVERY_SCOPE        = ALL
RECOVERY_TOPOLOGY     = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
```

These identities are independently grounded by the previously accepted App794 rev51 deployment evidence and direct repository readback.

## Mandatory Pre-Recovery Gates

Before any Live write:
1. Fetch latest `ai/antigravity-wp002c`.
2. Read ONLY initially:
   - `project-docs/AI_CONTROL_CENTER.md`
   - `project-docs/AI_ACTIVE_TASK.md`
3. Verify authorization ID exactly matches and is `AUTHORIZED / UNCONSUMED`.
4. Read actual current App794 customization state:
   - customization revision;
   - Scope;
   - Desktop JS/CSS topology;
   - Mobile topology;
   - current Live JS/CSS identities.
5. Confirm no unexpected unrelated customization drift. If state is ambiguous, STOP with no write.
6. Retrieve/materialize the two recovery files DIRECTLY from commit `ec6278524a2d5eb53050d0580c340d1b4e866b97`.
7. Do NOT rebuild latest source as recovery material.
8. Do NOT use either `scratch/app794_live_predeploy_backup_combined_ui.json` or `scratch/app794_preview_predeploy_backup_combined_ui.json` as recovery material.
9. Verify recovery JS Git blob identity exactly `e04aa07852e8e5aa4e4234f6efce5c99f2b37ec8`.
10. Verify recovery CSS Git blob identity exactly `1710d770ae87fb5f910d669dd5a88ea0950e6991`.
11. Preserve Scope ALL / Desktop JS1 / Desktop CSS1 / Mobile0.
12. Capture current broken Live customization reference for forensic evidence only.

Any failed gate => STOP / NO LIVE WRITE.

## Authorized Recovery Execution

After all gates PASS:
- perform exactly ONE App794 Desktop customization recovery attempt;
- upload/use exactly the two known-good files from commit `ec627852...`;
- preserve Scope ALL and topology 1 Desktop JS / 1 Desktop CSS / 0 Mobile;
- wait for Kintone deploy result;
- authorization becomes CONSUMED immediately when the first recovery customization write is attempted;
- no second recovery attempt under this authorization.

## Mandatory Post-Recovery Readback

Read back and prove:
```text
POST_RECOVERY_REVISION
POST_RECOVERY_SCOPE
POST_RECOVERY_TOPOLOGY
POST_RECOVERY_JS_IDENTITY
POST_RECOVERY_CSS_IDENTITY
POST_RECOVERY_MOBILE_STATE
KNOWN_GOOD_PAIR_MATCH
```

Recovery match requires BOTH:
```text
POST_RECOVERY_JS_IDENTITY  = e04aa07852e8e5aa4e4234f6efce5c99f2b37ec8
POST_RECOVERY_CSS_IDENTITY = 1710d770ae87fb5f910d669dd5a88ea0950e6991
```

If either identity does not match exactly, report failure and STOP. Do not attempt another fix/deploy.

## Required Evidence

Commit and push recovery evidence only. Record at minimum:
```text
AUTHORIZATION_ID
AUTHORIZATION_CONSUMED
EXECUTION_START_HEAD
CURRENT_PRE_RECOVERY_REVISION
CURRENT_PRE_RECOVERY_SCOPE
CURRENT_PRE_RECOVERY_TOPOLOGY
CURRENT_PRE_RECOVERY_JS_IDENTITY
CURRENT_PRE_RECOVERY_CSS_IDENTITY
RECOVERY_SOURCE_COMMIT
RECOVERY_JS_BLOB_SHA
RECOVERY_CSS_BLOB_SHA
RECOVERY_ATTEMPT_COUNT
RECOVERY_RESULT
POST_RECOVERY_REVISION
POST_RECOVERY_SCOPE
POST_RECOVERY_TOPOLOGY
POST_RECOVERY_JS_IDENTITY
POST_RECOVERY_CSS_IDENTITY
POST_RECOVERY_MOBILE_STATE
KNOWN_GOOD_PAIR_MATCH
SOURCE_CHANGED = NO
TEST_CHANGED = NO
APP794_RECORD_WRITE = 0
APP794_SCHEMA_LAYOUT_WRITE = 0
APP794_ACL_PROCESS_WRITE = 0
KINTONE_COMMENT_WRITE = 0
APP801_WRITE = 0
APP795_796_WRITE = 0
D2_D7_WRITE = 0
```

## Strictly Forbidden

- NO Combined Employee UI deployment;
- NO Back-to-My-MBO fix in this action;
- NO My MBO card redesign in this action;
- NO Comment mirror fix in this action;
- NO source/test correction;
- NO latest-source rebuild as recovery material;
- NO failed scratch snapshot as recovery material;
- NO App794 business-record write;
- NO form/schema/layout write;
- NO ACL/process write;
- NO Kintone Comment write;
- NO Mobile customization change;
- NO App801/App795/App796 write;
- NO Copy Previous MBO;
- NO D2-D7 execution;
- NO User Live UAT by executor.

Commit + push recovery evidence and STOP.

Maximum executor status:
`RECOVERED_PENDING_INDEPENDENT_REVIEW`
