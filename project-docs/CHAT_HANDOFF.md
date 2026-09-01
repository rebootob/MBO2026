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

Accepted owner-template SHA-256:
```text
PART_A_SHA256 = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B_SHA256 = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
```

Frozen geometry:
- Part A: A3 landscape, print area `A1:BJ52`, legacy objective rows 25–28, lower sections begin row 29.
- Part B: A4 portrait, print area `A1:X35`, six legacy competency blocks, totals/signatures begin row 31.
- legacy visual/layout = presentation authority.
- secured projection/current baseline = business/data authority.

## 3. Privacy containment / corrective state

Two prior XLSX implementation attempts did not pass independent acceptance because privacy and true structural insertion were not proven.

Owner explicitly approved `D2-WP003-R2` with a second Privacy Purge and chose:
```text
DIFFICULTY_LEVEL_EXPORT = BLANK TEMPORARILY
```

ChatGPT force-reset canonical branch to clean pre-R1-implementation baseline before opening R2:
```text
R2_SAFE_BASELINE = a3953ff701a01c8af9dcf6bf2525a58e4888973e
SECOND_CANONICAL_BRANCH_PURGE = COMPLETE
```

Do not create refs/tags/backups to purged lineages and do not reuse prior generated sanitized binaries.

## 4. Exact current gate — D2-WP003-R2 AUTHORIZED

```text
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R2 = SECOND PRIVACY PURGE + TRUE XLSX STRUCTURAL INSERTION CORRECTIVE
STATUS = AUTHORIZED FOR ANTIGRAVITY EXECUTION
ACTIVE_WORK_PACKAGE = D2-WP003-R2
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R2-SOURCE-20260901-01
ANTIGRAVITY = EXECUTE R2 ONLY / LOW-CREDIT
MAX_EXECUTOR_STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

Read `project-docs/AI_ACTIVE_TASK.md` for the exact R2 contract.

Critical execution points:
- branch history was rewritten again: Antigravity must first verify clean working tree, fetch/prune and hard-reset local canonical branch to origin;
- use only exact-hash owner templates;
- do not reuse old sanitized binaries;
- `xlsx-populate@1.21.0` is the only authorized dependency;
- no-op round-trip parity must pass before mapping;
- sanitizer must clear actual sensitive value ranges, preserve labels, remove the non-user-facing reference image, and prove privacy for text/numeric/date source values;
- Part A 5/10 requires actual shift of rows 29+ by +1/+6 and new objective rows after row 28;
- Part B 8 requires actual shift of totals/signatures from row 31 to row 39 and two inserted 4-row blocks;
- if high-level workbook API cannot insert structurally, bounded OOXML-level surgery using the existing XLSX package is allowed; copying styles into occupied rows is not insertion;
- Difficulty remains blank and R2 must not modify normalizer/export-service/export tests;
- if true insertion cannot be proven safely, stop with a real blocker.

## 5. Exact authorized paths

Only:
- `scripts/export/sanitize-mbo-xlsx-templates.js`
- `src/services/mbo-xlsx-renderer.js`
- `tests/mbo-xlsx-renderer.test.js`
- `assets/export-templates/PMS_PART_A_SANITIZED.xlsx`
- `assets/export-templates/PMS_PART_B_SANITIZED.xlsx`
- `package.json` / `package-lock.json` for `xlsx-populate@1.21.0` only

Not authorized:
- `src/core/kintone-normalizer.js`
- `src/services/mbo-export-service.js`
- `tests/mbo-export-service.test.js`
- PDF/UI/Live Kintone/deploy/second spreadsheet library/another Work Package.

## 6. Required verification

At minimum:
```text
node --test tests/mbo-export-service.test.js
node --test tests/mbo-xlsx-renderer.test.js
node --test tests/core-794-795-796-integration.test.js
npm audit --omit=dev
git status --porcelain
```

R2 tests must prove actual structural movement, not only that data appears in later cells.

After push, STOP at `IMPLEMENTED_PENDING_INDEPENDENT_REVIEW` or report a real blocker.

## 7. Authorization ledger

```text
D2-WP001-SOURCE-20260901-01 = CONSUMED / CLOSED / DO NOT REUSE
D2-WP001-R1-SOURCE-20260901-01 = CONSUMED / CLOSED / DO NOT REUSE
D2-WP002 = APPROVED / READ-ONLY / CLOSED
D2-WP003-SOURCE-20260901-01 = CONSUMED / INVALIDATED / DO NOT REUSE
D2-WP003-R1-SOURCE-20260901-01 = CONSUMED / INVALIDATED / PURGED / DO NOT REUSE
D2-WP003-R2-SOURCE-20260901-01 = ACTIVE / ONE WORK PACKAGE ONLY
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R2-SOURCE-20260901-01
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_APP794_DEPLOY_AUTH = NONE
APP53_WRITE_AUTH = NONE
APP794_WRITE_AUTH = NONE
APP795_WRITE_AUTH = NONE
APP801_WRITE_AUTH = NONE
ACL_PROCESS_WRITE_AUTH = NONE
KINTONE_CUSTOMIZATION_DEPLOY = NONE
LIVE_UAT = NONE
ROLLBACK_AUTH = NONE
```

## 8. Exact next action

```text
NEXT_EXECUTOR = ANTIGRAVITY
ACTION = CLEAN-CHECK + FRESH-FETCH/HARD-RESET TO REWRITTEN CANONICAL BRANCH, EXECUTE D2-WP003-R2 EXACTLY, PUSH, STOP
NEXT_CONTROL_STEP = ChatGPT independent review
```