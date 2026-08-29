# AI ACTIVE TASK — APP794 DEPLOY TOOLING TEST CLOSURE

Mode: **SOURCE + TEST ONLY — NO LIVE KINTONE WRITES**
Branch: `ai/antigravity-wp002c`
Max status: `IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`

## Mandatory architecture

```text
D1 = KINTONE-ONLY
External server/service = FORBIDDEN
Auth Bridge = CANCELLED / DO NOT CONTINUE
```

## Independent review state

Reviewed implementation commit:
`c7e82d1e4b9f3a95a545605f8b4408d707b5366e`

Source direction is correct:
- exact Preview customization PUT now passes `bypassDiscovery: true`;
- exact deploy POST now passes `bypassDiscovery: true`;
- `kintoneRequest()` default remains fail-closed;
- only `scripts/kintone/deploy-custom-ui.js` and focused tests changed.

But mandatory integration-test closure is still missing.

Current added tests only prove that writes without bypass are blocked and that protected Apps 53/283 remain blocked. They do NOT yet deterministically prove that the authorized App794 execution path supplies bypass to exactly the intended PUT/POST after guard success and that unrelated endpoint/method combinations never receive bypass.

Therefore:
```text
APP794_DEPLOY_TOOLING_CORRECTIVE = CORRECTIVE_REQUIRED / TEST CLOSURE ONLY
```

## Exact corrective task

Do not redesign the deploy flow. Keep the two source call sites unless a tiny extraction is needed for deterministic testing.

Add the smallest testable boundary/helper so focused tests can prove all of the following without any real network:

1. exact allowed write #1:
   - method `PUT`
   - path `/k/v1/preview/app/customize.json`
   - receives `bypassDiscovery: true`;
2. exact allowed write #2:
   - method `POST`
   - path `/k/v1/preview/app/deploy.json`
   - receives `bypassDiscovery: true`;
3. any unrelated endpoint or wrong method is rejected / cannot obtain the deploy bypass;
4. the helper/boundary is reached only in the existing live execution path after:
   - exact App794 registry/options target binding;
   - `assertApp794CustomizationDeployAuthorization(...)`;
   - `assertSandboxWriteTarget(794, ..., [794], ...)`;
5. missing authorization still blocks before network/upload;
6. wrong App ID / registry drift still blocks before network/upload;
7. malformed/replayed authorization remains blocked by the accepted authorization guard tests;
8. protected 53 and 283 remain blocked;
9. `DISCOVERY_MODE === true`;
10. global `WRITE_ALLOWED_APPS` remains `[]`;
11. build-only requires no live authorization and remains zero-network.

Preferred approach: a tiny pure allowlist/request-options helper used by the real two write call sites. Do NOT create a broad generic bypass API and do NOT widen `kintoneRequest()`.

## Required tests

Run focused deploy tests and full `npm test`.

No hosted CI may be claimed unless repository status checks actually exist.

## Forbidden

- NO Live Kintone write
- NO file upload
- NO Preview PUT against Kintone
- NO deploy POST against Kintone
- NO App794 ACL/record change
- NO App801 change
- NO Login/Auth/Create business change
- NO Employee-Self UI change
- NO generated `dist` commit unless already required and directly changed by this tiny tooling test closure
- NO Auth Bridge / external service
- NO D2-D7 work

## Authorization state

Prior authorization `APP794-CORRECTIVE-DEPLOY-20260829-01` is CONSUMED and MUST NOT be reused.

```text
APP794 DEPLOY        = NO
APP794 FILE UPLOAD   = NO
APP794 PREVIEW WRITE = NO
APP794 ACL WRITE     = NO
APP794 RECORD WRITE  = NO
APP801 WRITE         = NO
SOURCE CHANGE        = YES / DEPLOY TOOLING TESTABILITY ONLY
BUSINESS SOURCE      = NO
EXTERNAL SERVICE     = NO
D2-D7 WRITE          = NO
```

Commit + push source/test closure only, then STOP and wait for independent ChatGPT review.
