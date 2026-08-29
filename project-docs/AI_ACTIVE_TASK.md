# AI ACTIVE TASK — APP794 DEPLOY PROVENANCE RECOVERY / READ-ONLY ONLY

Mode: **READ-ONLY EVIDENCE RECOVERY — ZERO LIVE WRITES**
Branch: `ai/antigravity-wp002c`
Max status: `IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`

## Mandatory architecture

```text
D1 = KINTONE-ONLY
External server/service = FORBIDDEN
Auth Bridge = CANCELLED / DO NOT CONTINUE
```

## Current proven state

Prior one-shot authorization:
`APP794-CORRECTIVE-DEPLOY-20260829-01`

User-side Live verification after review shows:
- My MBO still uses the old Live UI and has no Logout control;
- `/k/794/edit` still raises `Employee Profile Resolution Failed`;
- exact old handler error remains: `You cannot call kintone.app.record.get() in handler or during processing a handler.`;
- Console still shows `AdminDiagnosticModel is not defined`.

Therefore:
```text
APP794_DEPLOY_EFFECTIVE_LIVE       = NO
APP794_DEPLOY_EXECUTION_PROVENANCE = UNKNOWN
```

## Critical safety rule

DO NOT RETRY DEPLOY.
DO NOT upload.
DO NOT PUT Preview customization.
DO NOT POST deploy.
DO NOT alter source, dist, ACL, App801, or records.

The previous authorization was one-shot and cannot be assumed reusable.

## Exact task — recover evidence only

1. Sync latest `ai/antigravity-wp002c` and read `AI_CONTROL_CENTER.md` + this file.
2. Recover existing local terminal/history/log output for the prior App794 corrective deploy attempt, if available.
3. Report the exact source HEAD used by that attempted execution, if any.
4. Determine from existing evidence whether:
   - `npm test` ran and its result;
   - build-only ran and its result;
   - the App794 authorization guard was entered/consumed;
   - `mbo-employee-app.js` upload occurred;
   - Preview customization PUT occurred;
   - deploy POST occurred;
   - any final deploy status was observed.
5. Use GET/read-only Kintone calls only to inspect current App794 state:
   - LIVE customization;
   - PREVIEW customization;
   - deployment status if available through GET;
   - live/preview revisions;
   - desktop/mobile JS/CSS topology;
   - FILE names and fileKeys sufficient to compare Live vs Preview.
6. Do not expose credentials, tokens, password hashes, or business record contents.
7. Do not modify docs until evidence is collected. Then commit/push concise evidence/status documentation only if needed.
8. STOP and return evidence for independent ChatGPT review.

## Required answer

Return concise facts:
```text
SOURCE_HEAD_USED = ... / NOT_EVIDENCED
NPM_TEST = PASS / FAIL / NOT_EVIDENCED
BUILD_ONLY = PASS / FAIL / NOT_EVIDENCED
AUTH_GUARD_ENTERED = YES / NO / NOT_EVIDENCED
UPLOAD_OCCURRED = YES / NO / NOT_EVIDENCED
PREVIEW_PUT_OCCURRED = YES / NO / NOT_EVIDENCED
DEPLOY_POST_OCCURRED = YES / NO / NOT_EVIDENCED
DEPLOY_FINAL_STATUS = ... / NOT_EVIDENCED
LIVE_REVISION = ...
PREVIEW_REVISION = ...
LIVE_TARGET_FILE = ...
PREVIEW_TARGET_FILE = ...
LIVE_PREVIEW_MATCH = YES / NO / UNKNOWN
LIVE_WRITE_DURING_RECOVERY = 0
```

## Authorization state

```text
APP794 DEPLOY        = NO
APP794 FILE UPLOAD   = NO
APP794 PREVIEW WRITE = NO
APP794 ACL WRITE     = NO
APP794 RECORD WRITE  = NO
APP801 WRITE         = NO
SOURCE CHANGE        = NO
EXTERNAL SERVICE     = NO
D2-D7 WRITE          = NO
```

This task is evidence recovery only. No live write of any kind is authorized.
