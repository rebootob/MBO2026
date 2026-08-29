# AI ACTIVE TASK — HOLD / NEW APP794 CORRECTIVE DEPLOY AUTHORIZATION REQUIRED

Mode: **CONTROL PLANE + USER AUTHORIZATION — ANTIGRAVITY HOLD**
Branch: `ai/antigravity-wp002c`

## Mandatory architecture

```text
D1 = KINTONE-ONLY
External server/service = FORBIDDEN
Auth Bridge = CANCELLED / DO NOT CONTINUE
```

## Current accepted state

Deploy tooling corrective is independently accepted:

```text
APP794_DEPLOY_GUARD_INTEGRATION    = PASS
APP794_DEPLOY_PROVENANCE_RECOVERY  = PASS
APP794_DEPLOY_TOOLING_SOURCE_FIX   = PASS
APP794_DEPLOY_TOOLING_TEST_CLOSURE = PASS / ACCEPTED AT 93d12a4abd143176da082c386b49e9dfeeed7629
APP794_DEPLOY_TOOLING_CORRECTIVE   = PASS
```

The previous one-shot authorization:
`APP794-CORRECTIVE-DEPLOY-20260829-01`

is CONSUMED. It reached file upload, then stopped before Preview PUT. It MUST NOT be reused.

## Current Live state

App794 Live still uses the old customization:
- Employee-Self Logout is absent;
- Create still raises `Employee Profile Resolution Failed` / `kintone.app.record.get() in handler`;
- old `AdminDiagnosticModel is not defined` bundle error remains.

## Next required action

A NEW explicit one-shot user authorization is required before any App794 live write.

Intended deploy scope only:
- build/test accepted App794 artifact;
- upload replacement `mbo-employee-app.js`;
- PUT exact App794 Preview customization;
- POST exact App794 deploy request;
- poll/read back deployment status and Live customization;
- then STOP for independent review and user-side UAT.

Accepted artifact scope includes:
- module-aware bundle;
- create-handler corrective;
- Employee-Self shell / visible Logout;
- My MBO history + Completed display;
- Employee-Self delete guard;
- accepted deploy-tooling corrective.

## Forbidden

- NO App794 deploy until new explicit authorization
- NO file upload until new explicit authorization
- NO Preview PUT until new explicit authorization
- NO deploy POST until new explicit authorization
- NO App794 ACL or record write
- NO App801 write
- NO Login/Auth/Create business source change
- NO Employee-Self source change
- NO Reset Password UI implementation in this deploy
- NO Auth Bridge / external service
- NO D2-D7 work

## Authorization state

```text
APP794 DEPLOY        = NO / AWAITING NEW USER AUTHORIZATION
APP794 FILE UPLOAD   = NO
APP794 PREVIEW WRITE = NO
APP794 ACL WRITE     = NO
APP794 RECORD WRITE  = NO
APP801 WRITE         = NO
SOURCE CHANGE        = NO
EXTERNAL SERVICE     = NO
D2-D7 WRITE          = NO
```

## Antigravity

HOLD.
Do not start any live execution until Control Plane records a new exact one-shot App794 corrective deploy authorization.
