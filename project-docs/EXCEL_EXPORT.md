# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / D2-WP001 PASS-CLOSED / D2-WP002 PASS-CLOSED / R3-R10 REVIEWED-NOT-PASS / R3-R11 PROPOSED**  
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

The exact owner template remains the source structure authority. Privacy classification may use frozen business/template-role geometry, but acceptance requires actual SHA-verified source evidence to independently drive or validate every classified address.

`SENSITIVE_RANGES_B` remains a sanitizer compatibility map only. It must not be the root input that decides which addresses are dynamic for acceptance proof.

## 4. R3-R10 review result

Scope review = PASS. Implementation `533599f9a1f7390c11c15dd7f3b28c911c3926e2` changed only the two authorized feasibility files. No binary/package/application/Kintone/deploy changes; no Privacy Purge required.

Accepted progress:
- exact SHA-verified Part B source is loaded;
- real source merge/style/type/blankness/hash evidence is attached to classification records;
- tests verify source SHA and inspect evidence fields.

Source acceptance = FAIL because:
1. dynamic addresses are still selected by iterating `SENSITIVE_RANGES_B`;
2. role justification still uses hard-coded header addresses and row rules;
3. protected-static set is still manually constructed from address/column/row rules;
4. source evidence enriches preselected roles instead of independently resolving/validating them;
5. fail-closed test uses a local synthetic validator rather than the real classification path;
6. GitHub has no combined CI/status checks.

## 5. Proposed D2-WP003-R3-R11

R3-R11 remains intentionally narrow: **source-derived role resolution / fail-closed validation only**.

Expected writes only:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`;
- `tests/mbo-xlsx-ooxml-feasibility.test.js`.

Mandatory direction:
- build complete safe source evidence inventory for Part B rows2:34 before role assignment;
- resolve/validate roles from exact frozen structural roles + actual source evidence;
- `SENSITIVE_RANGES_B` may only be compared AFTER independent role resolution as a compatibility cross-check;
- no broad row-rule-only or self-declared table proof;
- real classifier/validator must fail closed with `BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED` for missing/conflicting/ambiguous source evidence;
- tests must alter/remove real evidence for real Part B addresses and prove the real path fails closed;
- independently resolved dynamic set must equal expected sanitizer set only as the final cross-check;
- independently resolved protected-static set must be disjoint from dynamic set.

No typed/header/workbook/image/structural/formula closure is in R3-R11 scope.

## 6. Current gate

```text
D2 = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R10 = REVIEWED / NOT PASS / NOT CLOSED
D2-WP003-R3-R11 = PROPOSED / OWNER APPROVAL REQUIRED / NOT STARTED
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = STOP / WAIT OWNER
PRIVACY_PURGE_REQUIRED = NO
```

D2 remains open until production Excel/combined/PDF parity and export security are independently accepted.
