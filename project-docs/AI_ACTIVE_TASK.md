# AI ACTIVE TASK — APP794 CORRECTIVE DEPLOY AUTHORIZED

Mode: **LIVE KINTONE CUSTOMIZATION DEPLOY — EXACT ONE-SHOT**
Branch: `ai/antigravity-wp002c`
Max status: `IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`

## Mandatory architecture

```text
D1 = KINTONE-ONLY
External server/service = FORBIDDEN
Auth Bridge = CANCELLED / DO NOT CONTINUE
```

## User authorization — 2026-08-29

User explicitly approved: **App794 Corrective Deploy**.

Authorization ID:
`APP794-CORRECTIVE-DEPLOY-20260829-01`

Exact target and guard contract:
```text
appId       = 794
workPackage = MBO-P03-WP-002C
stage       = STAGE_D1_APP794_CUSTOMIZATION_DEPLOY
operation   = APP794_CUSTOMIZATION_DEPLOY
explicitUserAuthorization = true
activeWindow = true
```

## Deploy exactly the already-accepted App794 corrective artifact

Included scope only:
1. module-aware App794 bundle;
2. accepted Create-handler corrective;
3. accepted Employee-Self coherent shell / Logout / My MBO;
4. accepted My MBO history + Completed display;
5. accepted Employee-Self no-delete source guard;
6. deploy via accepted `executeDeployCustomUi()` guard path.

Do NOT implement anything new in this task.

## Mandatory preflight

1. Sync latest `ai/antigravity-wp002c` and confirm clean working tree.
2. Read `AI_CONTROL_CENTER.md`, this file, and relevant D1 baselines.
3. Confirm `config/sandbox-apps.json.mboV2AppId` is exact integer `794`.
4. Confirm no source/business changes are needed.
5. Run:
```text
npm test
node scripts/kintone/deploy-custom-ui.js --build-only
```
6. If either fails: STOP. Do not deploy.

## Live execution

Use the accepted deploy function with in-process authorization/request objects. Do not edit source merely to inject authorization.

Equivalent invocation shape:
```js
await executeDeployCustomUi({
  appId: 794,
  authConfig: {
    appId: 794,
    workPackageId: 'MBO-P03-WP-002C',
    stage: 'STAGE_D1_APP794_CUSTOMIZATION_DEPLOY',
    operation: 'APP794_CUSTOMIZATION_DEPLOY',
    activeWindow: true,
    explicitUserAuthorization: true,
    authorizationId: 'APP794-CORRECTIVE-DEPLOY-20260829-01'
  },
  requestConfig: {
    appId: 794,
    workPackageId: 'MBO-P03-WP-002C',
    stage: 'STAGE_D1_APP794_CUSTOMIZATION_DEPLOY',
    operation: 'APP794_CUSTOMIZATION_DEPLOY'
  }
});
```

Use existing approved Kintone connection/environment only. Never print credentials or secrets.

## Required evidence

Return concise evidence:
- source HEAD used;
- clean-tree/preflight result;
- `npm test` result;
- build-only result;
- target registry = 794;
- live/preview customization preflight/revision evidence;
- uploaded replacement filename = `mbo-employee-app.js`;
- deploy status final = `SUCCESS`;
- live customization revision/read-back if available;
- confirmation that no App801, App794 ACL, App794 record, workflow, or other-app write occurred.

Commit/push only documentation/evidence if the repository governance already requires it. Do not create new business/source changes as part of the deploy.

## Single-use rule

This authorization permits one guarded live App794 corrective deploy attempt only.
- After successful guarded live deploy: authorization is CONSUMED; STOP.
- If a failure occurs after any live write/upload/preview PUT/deploy request: DO NOT RETRY automatically; STOP and report exact evidence.
- If preflight fails before any live write: STOP and report; do not widen scope.

## Forbidden

- NO App801 write/schema/ACL/data/credential change
- NO further App794 App ACL write
- NO App794 record write/delete
- NO routing/scoring/workflow change
- NO HR/admin Password Reset UI implementation
- NO Auth Bridge / external service
- NO D2-D7 work

After execution, STOP and wait for independent ChatGPT review.
