# MBO2026 Active Work Package Contract

Updated: 2026-09-08 ICT

## Current contract state

- **ACTIVE_WORK_PACKAGE**: `D1-UAT-DEFECT-001-002-SANDBOX-DEPLOY-R2`
- **OWNER_AUTHORIZATION**: `อนุมัติ App794 Sandbox Deploy หลังแก้ CSS Target`
- **AUTHORIZATION_ID**: `D1-UAT-DEFECT-001-002-SANDBOX-DEPLOY-20260908-02`
- **TARGET**: `App794 customization ONLY`
- **MODE**: `ONE-SHOT / SAFETY-GATED / NO SOURCE CHANGE`
- **MAX_ATTEMPTS**: `1`
- **AUTO_RETRY**: `NO`
- **AUTO_ROLLBACK**: `NO`
- **D3_IMPLEMENTATION_AUTHORIZED**: `NO`

## Basis and docs-only rebase rule

Original approved execution basis:
`03b531383e86c643a5258a2baf6fdbd15bc9099e`

A later documentation-only synchronization commit may become the effective execution basis without duplicate Owner approval only if ChatGPT Control Plane independently proves that the intervening commit changes documentation only and leaves all runtime/build scope unchanged, including:
- `src/`
- `tests/`
- `scripts/`
- `config/`
- `dist/`
- package manifests

If any non-document file changed, STOP and require a new independent review / authorization decision.

## Objective

Deploy the already-reviewed corrections for:

- `D1-UAT-DEFECT-001` — Shared principal must not authenticate Employee-Self as a dedicated employee.
- `D1-UAT-DEFECT-002` — existing current-FY MBO must lead to existing record, not a create-new path.

## Allowed Kintone writes — exact

Only:
1. POST candidate `mbo-employee-app.js` file;
2. POST candidate `mbo-employee.css` file;
3. PUT App794 preview customization;
4. POST App794 deploy request.

## Forbidden

- record create/update/delete;
- App53 write;
- App795/App796/App797/App798/App800/App801 write;
- schema/layout change;
- ACL change;
- Process Management change;
- routing/scoring change;
- D2 change;
- D3 work;
- source/test/tool edit during deployment;
- automatic retry;
- automatic rollback.

## Pre-deploy acceptance gates

- fresh canonical HEAD and origin match exactly;
- clean worktree;
- focused identity/employee-self/deploy-preservation tests 0 FAIL;
- deterministic build reproduces committed `dist/mbo-employee-app.js` and `dist/mbo-employee.css` exactly;
- exact committed artifact Git blob SHAs captured;
- GET-only App794 Live + Preview preflight;
- exact names:
  - `mbo-employee-app.js`
  - `mbo-employee.css`
- topology:
  - Desktop JS = 1
  - Desktop CSS = 1
  - Mobile JS = 0
  - Mobile CSS = 0
- Live/Preview scope and topology align;
- release manifest uses exact current 40-char HEAD and artifact blob SHAs.

Historical wrong CSS target `mbo-employee .css` must fail closed.

## Post-deploy acceptance gates

- deployment status `SUCCESS`;
- exact post Live + Preview revisions captured;
- scope/topology unchanged;
- deployed JS/CSS file names canonical;
- downloaded Live JS/CSS Git blob identities exactly equal committed candidate blobs;
- App794 record writes = 0;
- App53/App801/other app record writes = 0;
- schema/layout/ACL/process writes = 0;
- final repository worktree clean.

## Required next state

After executor stops, ChatGPT independently reviews deployment evidence.

Only after independent deployment PASS may Owner perform runtime UAT:
1. dedicated Papatchaya -> auto-bind 0113;
2. `tmh + 0113` -> deny;
3. `tmh + shared-only employee` -> allow;
4. existing current-FY MBO -> Open Current MBO.

D3 remains HOLD regardless of deploy completion until Control Plane explicitly changes the gate.

## Permanent rules

- No code change without authorized FUNCTION_ID or DEFECT_ID.
- Exactly one active work package.
- Out-of-scope findings are logged, not auto-fixed.
- Closed functions reopen only for proven regression or explicit Owner change request.
- Security/privacy/data-integrity defects are material and block closure.
- Kintone writes/deployment require explicit Owner authority and exact bounded scope.
