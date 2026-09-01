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

WP001 closed secured export authorization/privacy projection.
WP002 closed legacy template evidence/design using Owner-provided Part A/Part B workbooks.

Accepted owner-template hashes:
```text
PART_A_SHA256 = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B_SHA256 = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
```

Frozen geometry remains:
- Part A: `MBO Staff & Chief`, A3 landscape, print area `A1:BJ52`, legacy objective rows 25–28;
- Part B: `(Part B) Competency`, A4 portrait, print area `A1:X35`, six legacy competency blocks;
- legacy visual/layout = presentation authority;
- secured projection/current baseline = business/data authority.

## 3. WP003 review and privacy containment

The first WP003 source did not pass independent review. Main failures were unsafe sanitization, no real Part A row insertion for 5–10 objectives, no real Part B block insertion for 8 competencies, wrong header value anchors, and insufficient structural/privacy tests.

Owner explicitly approved `D2-WP003-R1` **with Privacy Purge**.

ChatGPT force-reset the canonical branch to the safe pre-implementation baseline:
```text
SAFE_BASELINE = 731ba80a976847e579d80fc30012df54fd36badf
CANONICAL_BRANCH_PURGE = COMPLETE
```

Do not create refs/tags/backups to the purged lineage. Do not record purged commit/blob identifiers in Git docs. Git provider caches/unreachable objects may persist until garbage collection; no new ref may make them reachable again.

## 4. Exact current gate — D2-WP003-R1 AUTHORIZED

```text
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R1 = PRIVACY PURGE + SANITIZER + STRUCTURAL XLSX RENDERER CORRECTIVE
STATUS = AUTHORIZED FOR ANTIGRAVITY EXECUTION
ACTIVE_WORK_PACKAGE = D2-WP003-R1
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R1-SOURCE-20260901-01
ANTIGRAVITY = EXECUTE R1 ONLY / LOW-CREDIT
MAX_EXECUTOR_STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

Read `project-docs/AI_ACTIVE_TASK.md` for the exact R1 contract.

Critical execution points:
- history was rewritten: Antigravity must fresh-fetch and reset its local branch to origin before coding;
- use only exact-hash owner templates from bounded local paths;
- do not reuse any previously generated sanitized assets;
- run no-op `xlsx-populate@1.21.0` parity proof before mappings;
- sanitizer must clear actual value ranges, preserve labels, remove non-user-facing reference screenshot, and prove extracted source-sensitive text is absent from all sanitized OOXML XML/text parts;
- Part A 5/10 requires real row insertion/clone/shift/print-area extension;
- Part B 8 requires real repeated-block insertion/clone/shift/print-area extension;
- renderer consumes secured projection only and makes no Kintone calls;
- Difficulty field must be proven from canonical current evidence or execution stops with a blocker; never invent field code.

## 5. Exact authorized paths

Only paths listed in `AI_ACTIVE_TASK.md`, principally:
- `scripts/export/sanitize-mbo-xlsx-templates.js`
- `src/services/mbo-xlsx-renderer.js`
- `tests/mbo-xlsx-renderer.test.js`
- `assets/export-templates/PMS_PART_A_SANITIZED.xlsx`
- `assets/export-templates/PMS_PART_B_SANITIZED.xlsx`
- `package.json` / `package-lock.json` for `xlsx-populate@1.21.0` only
- normalizer/export-service/export-test only if narrowly required by a **proven** canonical Difficulty field.

## 6. Forbidden

No:
- backup ref/tag/branch to purged history;
- original owner workbook commit;
- real source sample values in tests/docs;
- PDF generator;
- UI/download button;
- `src/main-mbo-app.js` change;
- Live Kintone read/write/export/UAT;
- deploy;
- second XLSX library;
- D2-WP004 or D3–D6 implementation.

## 7. Required verification

At minimum:
```text
node --test tests/mbo-export-service.test.js
node --test tests/mbo-xlsx-renderer.test.js
node --test tests/core-794-795-796-integration.test.js
npm audit --omit=dev
git status --porcelain
```

After push, STOP at `IMPLEMENTED_PENDING_INDEPENDENT_REVIEW` or report a real blocker.

## 8. Authorization ledger

```text
D2-WP001-SOURCE-20260901-01 = CONSUMED / CLOSED / DO NOT REUSE
D2-WP001-R1-SOURCE-20260901-01 = CONSUMED / CLOSED / DO NOT REUSE
D2-WP002 = APPROVED / READ-ONLY / CLOSED
D2-WP003-SOURCE-20260901-01 = CONSUMED / INVALIDATED / DO NOT REUSE
D2-WP003-R1-SOURCE-20260901-01 = ACTIVE / ONE WORK PACKAGE ONLY
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R1-SOURCE-20260901-01
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

## 9. Exact next action

```text
NEXT_EXECUTOR = ANTIGRAVITY
ACTION = FRESH-FETCH/RESET TO REWRITTEN CANONICAL BRANCH, EXECUTE D2-WP003-R1 EXACTLY, PUSH, STOP
NEXT_CONTROL_STEP = ChatGPT independent review
```
