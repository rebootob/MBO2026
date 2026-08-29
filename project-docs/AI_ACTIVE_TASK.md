# AI ACTIVE TASK — HOLD / APP794 USER LIVE UAT

Mode: **USER + CONTROL PLANE LIVE UAT — ANTIGRAVITY HOLD**
Branch: `ai/antigravity-wp002c`

## Mandatory architecture

```text
D1 = KINTONE-ONLY
External server/service = FORBIDDEN
Auth Bridge = CANCELLED / DO NOT CONTINUE
```

## Current accepted state

```text
APP794_DEPLOY_GUARD_INTEGRATION    = PASS
APP794_DEPLOY_PROVENANCE_RECOVERY  = PASS
APP794_DEPLOY_TOOLING_CORRECTIVE   = PASS
APP794 ACL                          = PASS / revision 44
APP794_CORRECTIVE_DEPLOY_ROUND_2   = PASS / independent review
APP794 LIVE customization revision = 45
```

Execution evidence:
`project-docs/APP794_CORRECTIVE_DEPLOY_ROUND_2_EVIDENCE.md`

Authorization `APP794-CORRECTIVE-DEPLOY-20260829-02` is CONSUMED / CLOSED and MUST NOT be reused.

## Exact next action — user-side Live UAT only

Use employee-facing Kintone principal `s1` and authenticated MBO Employee Code `0113`.

Verify:
1. My MBO renders the accepted coherent Employee-Self shell;
2. visible `Logout` control is present;
3. Employee Code displays `0113`;
4. `+ Create New MBO` reaches `/k/794/edit` without redirecting to MBO Login;
5. create-show initialization completes without `Employee Profile Resolution Failed`;
6. old `kintone.app.record.get() in handler` error is absent;
7. old `AdminDiagnosticModel is not defined` error is absent.

Do not save/create a business record merely for this narrow visual/create-show check unless Control Plane separately authorizes a mutating UAT step.

## Antigravity

HOLD. No executor implementation or live execution task is active.

## Forbidden

- NO App794 deploy/retry/upload/Preview PUT
- NO App794 ACL or business-record write
- NO App801 write
- NO source change
- NO Reset Password UI implementation yet
- NO Auth Bridge / external service
- NO D2-D7 work

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

After user Live evidence is reviewed, Control Plane will decide the remaining D1 UAT and issue the separate HR/admin-form Reset Password UI task before final D1 closure.