# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / D2-WP001 PASS-CLOSED / D2-WP002 PASS-CLOSED / R3-R10 REVIEWED-NOT-PASS / R3-R11 AUTHORIZED**  
> Updated: 2026-09-01 ICT  
> Repository: `rebootob/MBO2026`  
> Canonical branch: `ai/antigravity-wp002c`

## 1. D2 objective

Deliver Excel/PDF outputs preserving approved legacy PMS presentation while using current App794/configuration truth and D1 security/privacy boundaries.

## 2. Authority split

```text
LEGACY TEMPLATE = VISUAL / LAYOUT AUTHORITY
CONFIRMED_BASELINE + CURRENT APP CONFIG = BUSINESS RULE AUTHORITY
SECURED MboExportService PROJECTION = EXPORT DATA AUTHORITY
```

Closed foundations:
```text
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
DIFFICULTY_LEVEL_EXPORT = BLANK TEMPORARILY
```

Accepted source fingerprints:
```text
PART_A_SHA256 = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B_SHA256 = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
```

## 3. Frozen Part B privacy authority

The exact owner template remains the source structure authority. Privacy classification may use frozen business/template-role geometry, but acceptance requires actual SHA-verified source evidence to independently resolve or validate every classified address.

`SENSITIVE_RANGES_B` remains a sanitizer compatibility map only. It must not be the root input that decides which addresses are dynamic for acceptance proof. It may be compared only after independent resolution.

## 4. R3-R10 review result

Scope review = PASS. Implementation `533599f9a1f7390c11c15dd7f3b28c911c3926e2` changed only the two authorized feasibility files. No binary/package/application/Kintone/deploy changes; no Privacy Purge required.

Accepted progress:
- exact SHA-verified Part B source is loaded;
- real source merge/style/type/blankness/hash evidence is attached to classification records;
- tests verify source SHA and inspect evidence fields.

Source acceptance = FAIL because dynamic/static role decisions remain preselected from `SENSITIVE_RANGES_B`, hard-coded header lists, row rules and manually built protected-static addresses. The fail-closed test also does not exercise the real classifier.

## 5. D2-WP003-R3-R11 — AUTHORIZED

```text
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R11
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R11-SOURCE-20260901-01
PRIVACY_PURGE_REQUIRED = NO
MAX_EXECUTOR_STATUS = ROLE_RESOLUTION_PROOF_PENDING_INDEPENDENT_REVIEW
```

R3-R11 is intentionally narrow and may modify only:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`;
- `tests/mbo-xlsx-ooxml-feasibility.test.js`.

No package/dependency changes and no binary publication.

## 6. Mandatory R3-R11 proof

Use the exact SHA-verified Part B owner template and solve only independent role resolution / real fail-closed validation:
- build a complete safe evidence inventory for rows 2:34 before assigning roles;
- resolve/validate roles from frozen structural role geometry + actual source evidence;
- do NOT use `SENSITIVE_RANGES_B` as classification input;
- compare the independently resolved dynamic set to `SENSITIVE_RANGES_B` only after resolution as a compatibility check;
- broad row-rule-only or manually pre-expanded role tables are not independent proof;
- real classifier/validator must throw `BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED` for missing, conflicting or ambiguous evidence;
- tests must alter/remove evidence for real Part B addresses and prove the real path fails closed;
- independently resolved protected-static set must be disjoint from dynamic set;
- no raw source value may be logged or committed.

No typed/header/workbook/image/structural/formula closure is in R3-R11 scope. Those blockers remain deferred until this classification gate is independently accepted.

## 7. Explicit exclusions

No XLSX/image/media/output commit; no package/dependency change; no production sanitizer/renderer; no normalizer/export-service change; no PDF/UI/Live Kintone/deploy; no next Work Package.

Mandatory commands:
```text
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

## 8. Current gate

```text
D2 = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R10 = REVIEWED / NOT PASS / NOT CLOSED
D2-WP003-R3-R11 = AUTHORIZED / EXECUTION ACTIVE
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R11-SOURCE-20260901-01
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = EXECUTE R3-R11 ONLY / LOW-CREDIT
PRIVACY_PURGE_REQUIRED = NO
```

D2 remains open until production Excel/combined/PDF parity and export security are independently accepted.
