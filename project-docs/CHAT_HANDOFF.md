# MBO2026 — CHAT HANDOFF

> Canonical concise cross-chat continuation document.  
> Updated: 2026-09-01 ICT  
> Repository: `rebootob/MBO2026`  
> Canonical branch: `ai/antigravity-wp002c`

Repository/Kintone accepted evidence wins over embedded checkpoints. Fresh-fetch before acting.

## 1. Operating model

```text
ChatGPT = Control Plane / Architect / Independent Reviewer
Antigravity = execution plane only when genuinely necessary
```

No Live Kintone write/deploy/ACL/group/schema/record/session/password operation without exact explicit authorization. Never reuse consumed authorization.

## 2. Closed foundations

```text
D1 = PASS / CLOSED
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
```

WP001 closed secured export projection and 4/5/10 projection coverage.

WP002 closed legacy template evidence/design using Owner-provided Excel binaries. Original employee-bearing files were not committed.

Accepted template hashes:
```text
PART_A_SHA256 = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B_SHA256 = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
```

Frozen high-level geometry:
- Part A: `MBO Staff & Chief`, A3 landscape, print area A1:BJ52, legacy objective rows 25–28;
- Part B: `(Part B) Competency`, A4 portrait, print area A1:X35, six legacy competency blocks;
- no worksheet formulas in supplied main sheets;
- legacy visual/layout wins for presentation, current baseline/config/projection wins for business data.

## 3. Exact current gate — D2-WP003 AUTHORIZED

```text
D2-WP003 = SANITIZED TEMPLATE ASSETS + XLSX RENDERER FOUNDATION
STATUS = AUTHORIZED FOR ANTIGRAVITY EXECUTION
ACTIVE_WORK_PACKAGE = D2-WP003
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-SOURCE-20260901-01
ANTIGRAVITY = EXECUTE WP003 ONLY / LOW-CREDIT
MAX_EXECUTOR_STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

Read `project-docs/AI_ACTIVE_TASK.md` for exact source scope and acceptance tests.

Critical rules:
- use only local originals matching the two accepted SHA-256 values;
- bounded lookup only in repo root, `app info/data/`, `exp/`;
- if matching originals are absent: STOP, do not recreate from screenshots;
- original owner binaries must never be committed;
- sanitized runtime binaries may be committed only after privacy sanitization proof;
- renderer consumes sanitized template buffer + secured export projection only;
- renderer makes no Kintone calls and performs no authorization widening;
- Part A must render 4/5/10 objectives template-preservingly;
- Part B must render 6/8 competencies template-preservingly;
- current profile weighting replaces stale legacy static weight/title content.

Exactly one new dependency is authorized: `xlsx-populate@1.21.0`.

Before implementation, Antigravity must prove a no-op load/write roundtrip on both exact source templates preserves material sheet/merge/print/protection/branding structure. If it does not, revert experiment and STOP with `BLOCKER_XLSX_LIBRARY_PARITY`; do not switch libraries.

## 4. Exact authorized files

Only:
- `src/services/mbo-xlsx-renderer.js` NEW
- `scripts/export/sanitize-mbo-xlsx-templates.js` NEW
- `tests/mbo-xlsx-renderer.test.js` NEW
- `assets/export-templates/PMS_PART_A_SANITIZED.xlsx` NEW
- `assets/export-templates/PMS_PART_B_SANITIZED.xlsx` NEW
- `package.json` for `xlsx-populate@1.21.0` only
- `package-lock.json` lockfile consequence only

`src/services/mbo-export-service.js` is NOT authorized to change in WP003.

## 5. Forbidden in WP003

No:
- PDF generator;
- UI/download buttons;
- `src/main-mbo-app.js` changes;
- Live Kintone read/write/export/UAT;
- deployment;
- other dependency/library;
- original binary commit;
- generated output fixture commit;
- D2-WP004 or D3–D6 implementation.

## 6. Verification minimum

Antigravity must run:
```text
node --test tests/mbo-export-service.test.js
node --test tests/mbo-xlsx-renderer.test.js
node --test tests/core-794-795-796-integration.test.js
npm audit --omit=dev
```

Source template hashes, no-op parity, sanitization evidence and working-tree scope must also be reported.

After push, Antigravity must STOP at `IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`. ChatGPT reviews the actual commit before PASS/CLOSED.

## 7. Authorization ledger

```text
D2-WP001-SOURCE-20260901-01 = CONSUMED / CLOSED / DO NOT REUSE
D2-WP001-R1-SOURCE-20260901-01 = CONSUMED / CLOSED / DO NOT REUSE
D2-WP002 = APPROVED / READ-ONLY / CLOSED
D2-WP003-SOURCE-20260901-01 = ACTIVE / ONE WORK PACKAGE ONLY
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-SOURCE-20260901-01
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_APP794_DEPLOY_AUTH = NONE
ACTIVE_RECORD_ACL_WRITE_AUTH = NONE
ACTIVE_PROCESS_UAT_WRITE_AUTH = NONE
ACTIVE_GROUP_WRITE_AUTH = NONE
APP53_WRITE_AUTH = NONE
APP795_WRITE_AUTH = NONE
APP801_WRITE_AUTH = NONE
ACTIVE_LIFECYCLE_WRITE_AUTH = NONE
ROLLBACK_AUTH = NONE
```

## 8. Exact next action

```text
NEXT_EXECUTOR = ANTIGRAVITY
ACTION = EXECUTE D2-WP003 EXACTLY AS AI_ACTIVE_TASK DEFINES, PUSH, THEN STOP
NEXT_CONTROL STEP = ChatGPT independent review
```
