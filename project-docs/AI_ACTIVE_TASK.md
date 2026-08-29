# AI ACTIVE TASK — D1 APP794 DEPLOY GUARD CORRECTIVE

Mode: **SOURCE / TEST / LOCAL ONLY — ZERO LIVE KINTONE / ZERO DEPLOY**
Branch: `ai/antigravity-wp002c`
Max status: `IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`

## Mandatory architecture

```text
D1 = KINTONE-ONLY
External server/service = FORBIDDEN
Auth Bridge = CANCELLED / DO NOT CONTINUE
```

## Review anchor

Corrective base implementation:
`8d8e88e13ff0ef6798329266c69f721ab15b3f79`

Independent review found the authorization validator itself is directionally correct, but the final resolved deploy target is not strictly bound to the authorized App794 target and mandatory integration tests are incomplete.

## Read only
1. `project-docs/AI_CONTROL_CENTER.md`
2. this file
3. `project-docs/CONFIRMED_BASELINE/AI_OPERATING_GOVERNANCE.md`
4. `project-docs/CONFIRMED_BASELINE/SOURCE_CODE_ARCHITECTURE.md`
5. `src/core/sandbox-write-guard.js`
6. `scripts/kintone/deploy-custom-ui.js`
7. `tests/sandbox-write-guard.test.js`
8. `tests/deploy-customization-preservation.test.js`
9. `config/sandbox-apps.json`

Do not scan broadly.

## Implement only this corrective

1. Bind ALL deploy-target sources to exact App794:
   - authorization target;
   - request target;
   - `options.appId` when supplied;
   - `sandbox-apps.json.mboV2AppId`;
   - actual target passed to deploy/network code.
2. Any supplied/resolved target other than integer `794` must fail closed before Kintone/network work.
3. Do not silently catch malformed/missing registry and continue with another runtime target.
4. Generic `assertSandboxWriteTarget` call must use ephemeral exact `[794]`, never `[app]` from mutable/resolved runtime state.
5. Keep:
   - `DISCOVERY_MODE = true`;
   - global `WRITE_ALLOWED_APPS = []`;
   - permanent protected apps unchanged;
   - no permanent App794 allow-list/bypass.
6. Build-only remains zero-auth and returns before Kintone/network imports/calls.

## Mandatory focused tests

Prove all of these:
- missing authorization at live entrypoint blocks before network/Kintone client path;
- supplied `options.appId != 794` blocks;
- registry/resolved `mboV2AppId != 794` blocks;
- malformed auth blocks;
- replay of same authorization ID blocks;
- exact authorized App794 deployment context passes authorization + sandbox guard layer without real network I/O;
- App53 spoof blocks;
- App283 (or another listed legacy protected app in addition to 53) spoof blocks;
- `DISCOVERY_MODE === true`;
- global `WRITE_ALLOWED_APPS` remains empty;
- build-only works without authorization and performs no Kintone/network path.

Run focused tests and then:
```text
npm test
```

## Forbidden

- NO live Kintone read/write
- NO App794 deploy
- NO App801 write/ACL/app-group change
- NO auth/login/session/Create business edits
- NO `main-mbo-app.js` changes
- NO generated `dist` commit
- NO Auth Bridge / external service
- NO D2-D7 work

Commit + push one concise corrective commit, then STOP.
Do not Self-PASS.
