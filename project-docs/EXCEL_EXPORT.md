# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / D2-WP001 PASS-CLOSED / D2-WP002 PASS-CLOSED / R3-R12 REVIEWED-NOT-PASS / R3-R13 PROPOSED**  
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

The exact owner template remains the source structure authority. Privacy role geometry may nominate a role, but authoritative SHA-verified role-relevant evidence must confirm it.

`SENSITIVE_RANGES_B` remains a sanitizer compatibility map only and is compared only after independent resolution.

## 4. R3-R12 review result

Scope review = PASS. Implementation `8c5b933e9ff375b8e77b8f25ecd2f92ed870187b` changed only the two authorized feasibility files. No binary/package/application/Kintone/deploy changes; no Privacy Purge required.

Accepted progress:
- authoritative source inventory is loaded before observed override evidence;
- body/summary observed evidence is validated against authoritative `styleId` and `mergeRef`;
- real fail-closed tests cover protected body `B7`, dynamic body `K7`, and summary `B31` style conflicts.

Source acceptance = FAIL because style/merge parity alone is not sufficient. The resolver does not yet compare role-relevant authoritative `normalizedType`, `nonblank`, or protected-static safe hash identity where needed. Same-style/same-merge semantic evidence changes can therefore still pass.

GitHub combined statuses/checks for the implementation commit are empty.

## 5. Proposed D2-WP003-R3-R13

R3-R13 is intentionally narrow: **body + summary authoritative evidence parity only**.

Expected writes only:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`;
- `tests/mbo-xlsx-ooxml-feasibility.test.js`.

Mandatory direction:
- preserve authoritative-source-first / observed-override separation;
- preserve current style/merge validation and real fail-closed architecture;
- compare authoritative vs observed role-relevant `normalizedType` and `nonblank` for body/summary roles;
- for proven protected-static template text, require safe `valHash` parity where necessary to reject silent content substitution;
- do NOT compare source sample `valHash` for legitimate dynamic employee/sample fields;
- real resolver must throw `BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED` on required evidence mismatch;
- tests must mutate non-style evidence for one protected body, one dynamic body and one summary/signature real address;
- preserve post-resolution sanitizer-set equality and dynamic/static disjointness.

No typed/header/workbook/image/insertion-structural/formula closure is in R3-R13 scope.

## 6. Current gate

```text
D2 = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R12 = REVIEWED / NOT PASS / NOT CLOSED
D2-WP003-R3-R13 = PROPOSED / OWNER APPROVAL REQUIRED / NOT STARTED
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = STOP / WAIT OWNER
PRIVACY_PURGE_REQUIRED = NO
```

D2 remains open until production Excel/combined/PDF parity and export security are independently accepted.
