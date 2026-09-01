# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / D2-WP001 PASS-CLOSED / D2-WP002 PASS-CLOSED / R3-R13 PASS-CLOSED / R3-R16 PASS-CLOSED / R3-R17 PROPOSED**  
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

Accepted foundations:
```text
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003-R3-R13 = PASS / CLOSED
PART_B_PRIVACY_CLASSIFICATION_EVIDENCE_PARITY = PASS / CLOSED
TYPED_PRIVACY_METADATA_COMPLETENESS = PASS / CLOSED
TYPED_METADATA_VALIDATOR_SHAPE = PASS / CLOSED
D2-WP003-R3-R16 = PASS / CLOSED
DIFFICULTY_LEVEL_EXPORT = BLANK TEMPORARILY
```

Accepted source fingerprints:
```text
PART_A_SHA256 = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B_SHA256 = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
```

## 3. Frozen privacy authority

The R3-R10..R3-R13 Part B classification/evidence-parity chain remains accepted and closed.

The R3-R14..R3-R16 typed privacy metadata corrective chain is now also accepted and closed for the bounded feasibility layer:
- exact sensitive metadata address sets for Parts A/B;
- no duplicates;
- exact type enum and `nonblank` consistency;
- safe hash shape/absence rules;
- exact `typeCounts` five-key shape and non-negative integer values;
- exact derived/reported reconciliation;
- malformed count-shape fail-closed proof;
- malformed normalized-type fail-closed proof restored.

Do not reopen these privacy/metadata blockers without proven regression.

## 4. R3-R16 review result

Implementation `003afb71caf9aca2810d3fd92df9218c948b5f72` changed only `tests/mbo-xlsx-ooxml-feasibility.test.js`.

```text
R3-R16_SCOPE_REVIEW = PASS
R3-R16_SOURCE_REVIEW = PASS
R3-R16_STATUS = PASS / CLOSED
PRIVACY_PURGE_REQUIRED = NO
```

The restored real-validator negative test deep-copies source-backed Part B metadata, mutates one record to `normalizedType = invalid_type`, and asserts `BLOCKER_TYPED_PRIVACY_METADATA_UNRESOLVED`.

GitHub combined statuses/checks are empty; this is recorded as missing CI evidence rather than a bounded source/proof defect.

## 5. Proposed D2-WP003-R3-R17

R3-R17 is intentionally narrow: **header fingerprint / sanitized export parity only**.

Expected writes only if approved:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`;
- `tests/mbo-xlsx-ooxml-feasibility.test.js`.

Proposed proof direction:
- derive authoritative Part A/B header fingerprints from exact SHA-verified owner templates;
- prove required source merge/header geometry and safe structural fingerprint identity;
- prove sanitized disposable export retains required structural identity while sensitive dynamic header values are removed;
- protected/static header labels remain source-consistent through safe fingerprints/hashes;
- dynamic header sample values must not be required to equal source samples;
- fail closed on missing, extra, structurally changed, ambiguous or mismatched header evidence.

Critical rule:
```text
HEADER PARITY = STRUCTURE + ROLE-SAFE FINGERPRINT PARITY.
DYNAMIC SAMPLE VALUES MUST BE SANITIZED, NOT PRESERVED.
```

No workbook-wide source-vs-roundtrip parity, image inventory, insertion matrix, formula matrix, production renderer, PDF/UI, Kintone or deploy work in R3-R17.

## 6. Current gate

```text
D2 = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R16 = PASS / CLOSED
D2-WP003-R3-R17 = PROPOSED / OWNER APPROVAL REQUIRED / NOT STARTED
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = STOP / WAIT OWNER
PRIVACY_PURGE_REQUIRED = NO
```

D2 remains open until deferred feasibility blockers and then production Excel/combined/PDF parity and export security are independently accepted.
