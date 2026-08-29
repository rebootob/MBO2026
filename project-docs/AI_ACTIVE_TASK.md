# AI ACTIVE TASK — APP794 DEPLOY TOOLING CORRECTIVE / SOURCE+TEST ONLY

Mode: **SOURCE + TEST ONLY — NO LIVE KINTONE WRITES**
Branch: `ai/antigravity-wp002c`
Max status: `IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`

## Mandatory architecture

```text
D1 = KINTONE-ONLY
External server/service = FORBIDDEN
Auth Bridge = CANCELLED / DO NOT CONTINUE
```

## Proven prior deploy state

Prior authorization:
`APP794-CORRECTIVE-DEPLOY-20260829-01`

Independent review accepted provenance recovery at:
`a7badd223568bc26dfc37171be779cf2df5846f7`

Recovered facts:
```text
SOURCE_HEAD_USED      = 00ed894fc098d96ec8d0e3c411b3c91a9ff9432b
NPM_TEST              = PASS
BUILD_ONLY            = PASS
AUTH_GUARD_ENTERED    = YES
UPLOAD_OCCURRED       = YES
PREVIEW_PUT_OCCURRED  = NO
DEPLOY_POST_OCCURRED  = NO
DEPLOY_FINAL_STATUS   = BLOCKED_PRE_PREVIEW_PUT
LIVE_REVISION         = 44
PREVIEW_REVISION      = 44
LIVE_WRITE_RECOVERY   = 0
```

The prior authorization is CONSUMED and MUST NOT be reused.

## Root cause

The accepted App794 narrow authorization/target guards passed. The deploy path then called:
`kintoneRequest('/k/v1/preview/app/customize.json', { method: 'PUT', ... })`
without the exact `bypassDiscovery: true` option.

`kintoneRequest()` defaults `bypassDiscovery = false` and therefore invoked `assertDiscoveryReadOnly()`, blocking the authorized PUT before network execution.

## Exact corrective task

Modify deploy tooling only so that, after all existing App794 authorization and target-binding guards have passed:

1. the exact Preview customization call
   `PUT /k/v1/preview/app/customize.json`
   uses the narrow Discovery bypass;
2. the exact deploy request
   `POST /k/v1/preview/app/deploy.json`
   uses the narrow Discovery bypass;
3. all GET/read-back/status calls remain ordinary read-only calls;
4. do not change authorization semantics or target binding;
5. do not globally disable Discovery mode;
6. `DISCOVERY_MODE` must remain `true`;
7. global `WRITE_ALLOWED_APPS` must remain `[]`;
8. do not change `kintoneRequest()` default `bypassDiscovery = false` behavior;
9. protected Apps 53, 283, 305, 307, 310, 640, 643, 715, 716 remain hard-blocked;
10. build-only remains zero-network and must not require live authorization.

Prefer the smallest change in `scripts/kintone/deploy-custom-ui.js`. Do not modify business/Login/Create/UI source or generated `dist` except if a test/build command locally regenerates it; do not commit unrelated generated output.

## Mandatory focused tests

Add/adjust deterministic tests proving:
- missing authorization blocks before network;
- wrong App ID blocks before network;
- malformed/replayed authorization blocks before network;
- target/registry drift blocks before network;
- exact authorized App794 Preview PUT is invoked with the narrow bypass only after guard success;
- exact authorized App794 deploy POST is invoked with the narrow bypass only after guard success;
- no unrelated endpoint/method receives a Discovery bypass;
- protected 53 remains blocked;
- protected 283 remains blocked;
- build-only: no authorization required and zero network;
- `DISCOVERY_MODE === true` and global `WRITE_ALLOWED_APPS` remains empty.

Run focused tests and full `npm test`.

## Forbidden

- NO Live Kintone write of any kind
- NO file upload
- NO Preview PUT against Kintone
- NO deploy POST against Kintone
- NO App794 ACL/record change
- NO App801 change
- NO Login/Auth/Create business change
- NO Employee-Self UI change
- NO generated Live deploy
- NO Auth Bridge / external service
- NO D2-D7 work

## Required evidence

Return:
- base HEAD;
- exact changed files;
- concise diff rationale;
- focused test result;
- `npm test` result;
- proof `DISCOVERY_MODE = true`;
- proof global `WRITE_ALLOWED_APPS = []`;
- proof zero Kintone network/write during this task.

Commit + push source/test changes only, then STOP. Do not self-PASS.

## Authorization state

```text
APP794 DEPLOY        = NO
APP794 FILE UPLOAD   = NO
APP794 PREVIEW WRITE = NO
APP794 ACL WRITE     = NO
APP794 RECORD WRITE  = NO
APP801 WRITE         = NO
SOURCE CHANGE        = YES / DEPLOY TOOLING ONLY
BUSINESS SOURCE      = NO
EXTERNAL SERVICE     = NO
D2-D7 WRITE          = NO
```

After independent ChatGPT review PASS, a NEW explicit user authorization will be required before any App794 live deploy attempt.
