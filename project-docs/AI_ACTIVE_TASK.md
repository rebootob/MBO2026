# AI ACTIVE TASK — D1 APP794 DEPLOY GUARD TEST CLOSURE

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

Current implementation:
`04e1563f824d4e801f46411b9282ce292f2a478f`

Independent review accepts the production target-binding behavior. Only one mandatory proof is still missing.

## Implement only this test-closure gap

Add deterministic focused coverage proving that a registry/resolved target other than exact integer `794` fails closed before Kintone/network work.

Preferred minimal shape:
- extract/reuse a tiny pure target-binding validator from `scripts/kintone/deploy-custom-ui.js` if needed for testability;
- the real deploy entrypoint must use the same validator;
- test `registry.mboV2AppId = 795` (and preferably missing/malformed) => BLOCK;
- exact `registry.mboV2AppId = 794` => PASS through target-binding layer only;
- do not change deploy semantics beyond testability.

Preserve all already-accepted invariants:
- authorization/request/options/registry/actual target = 794;
- generic guard ephemeral allow-list = `[794]`;
- `DISCOVERY_MODE = true`;
- global `WRITE_ALLOWED_APPS = []`;
- protected apps unchanged;
- build-only zero-auth / zero Kintone-network path.

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

Commit + push one concise test-closure commit, then STOP.
Do not Self-PASS.
