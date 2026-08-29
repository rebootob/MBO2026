# AI ACTIVE TASK — D1 APP794 DEPLOY GUARD INTEGRATION

Mode: **SOURCE / TEST / LOCAL ONLY — ZERO LIVE KINTONE / ZERO DEPLOY**
Branch: `ai/antigravity-wp002c`
Max status: `IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`

## Mandatory architecture

```text
D1 = KINTONE-ONLY
External server/service = FORBIDDEN
Auth Bridge = CANCELLED / DO NOT CONTINUE
```

## Read only
1. `project-docs/AI_CONTROL_CENTER.md`
2. this file
3. `project-docs/CONFIRMED_BASELINE/AI_OPERATING_GOVERNANCE.md`
4. `project-docs/CONFIRMED_BASELINE/SOURCE_CODE_ARCHITECTURE.md`
5. `src/core/sandbox-write-guard.js`
6. `scripts/kintone/deploy-custom-ui.js`
7. existing tests that import either module; use only narrow symbol/file search if exact test path is unknown

Do not scan the repo broadly.

## Current live evidence

- Reset / Force Password Change / Login / My MBO for Employee `0113` = PASS.
- List -> Create preserves session = PASS.
- Live `/k/794/edit` still fails with old deployed customization:
  `You cannot call kintone.app.record.get() in handler or during processing a handler.`
- The source Create-handler corrective was already accepted previously and must NOT be reworked in this task.

## Implement only deployment safety integration

Goal: allow a future App794 customization deploy **only when a new explicit deploy authorization is supplied**, while keeping default deny-all.

Requirements:
1. Add a narrow authorization validator for exactly App794 customization deployment.
2. It must require all of:
   - target app exactly `794`;
   - explicit user authorization flag;
   - active authorization window;
   - non-empty unique/single-use authorization ID;
   - exact operation/purpose = App794 customization deploy;
   - fail closed on missing/malformed/wrong target/replayed authorization.
3. Protected apps remain absolute hard-blocks: `53, 283, 305, 307, 310, 640, 643, 715, 716`.
4. `DISCOVERY_MODE` remains `true` by default.
5. `WRITE_ALLOWED_APPS` remains empty by default. Do NOT permanently add `794`.
6. `deploy-custom-ui.js` must require the narrow authorization before any live network write path can begin.
7. Build-only remains usable with zero authorization and must exit before any Kintone/network operation.
8. Do not weaken generic guard behavior for unrelated scripts/apps.
9. No permanent bypass flag that callers can casually set to skip authorization.
10. No source behavior change to App794 business/auth/UI code and no generated `dist` commit.

Preferred implementation shape:
- narrow authorization check first;
- only after it passes, invoke the existing sandbox target guard using an ephemeral exact `[794]` allow-list / explicit authorized context;
- never mutate global allow-list state.

## Mandatory tests

Add/adjust focused tests proving:
- build-only path performs zero network/Kintone imports/calls and does not require live authorization;
- live path with missing authorization is blocked before network;
- wrong App ID is blocked;
- malformed authorization is blocked;
- replay of same authorization ID is blocked;
- exact authorized App794 deploy context passes the guard layer without performing real network I/O;
- protected App53 and at least one legacy protected app remain blocked even if an authorization object is spoofed;
- default `WRITE_ALLOWED_APPS` remains empty and `DISCOVERY_MODE` remains true;
- no permanent App794 allow-list is introduced.

Run the smallest focused tests plus root regression:
```text
npm test
```
If a narrower existing test command exists for these modules, run it before `npm test`.

## Forbidden

- NO live Kintone read/write
- NO App794 deploy
- NO App801 write/ACL/app-group change
- NO auth/login/session/Create business source edits
- NO `main-mbo-app.js` changes
- NO generated `dist` commit
- NO Auth Bridge work
- NO external server/service
- NO D2-D7 work

Commit + push one concise source/test commit, then STOP.
Do not Self-PASS.
