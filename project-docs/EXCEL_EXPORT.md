# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / D2-WP001 PASS-CLOSED / D2-WP002 PASS-CLOSED / R3-R13 PASS-CLOSED / R3-R16 PASS-CLOSED / R3-R17 AUTHORIZED**  
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
D2-WP003-R3-R16 = PASS / CLOSED
PART_B_PRIVACY_CLASSIFICATION_EVIDENCE_PARITY = PASS / CLOSED
TYPED_PRIVACY_METADATA_COMPLETENESS = PASS / CLOSED
TYPED_METADATA_VALIDATOR_SHAPE = PASS / CLOSED
DIFFICULTY_LEVEL_EXPORT = BLANK TEMPORARILY
```

Accepted source fingerprints:

```text
PART_A_SHA256 = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B_SHA256 = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
```

## 3. Frozen privacy authority

The Part B privacy classification/evidence-parity chain and typed privacy metadata corrective chain are accepted and closed for the bounded feasibility layer. Do not reopen without proven regression.

This does NOT close D2-WP003; deferred structural/export feasibility blockers remain.

## 4. D2-WP003-R3-R17 — AUTHORIZED

Purpose: **header fingerprint / sanitized export parity only**.

```text
AUTHORIZATION_BASELINE = 528e1ed31985296c99ab8c40ce5f05f4146d549d
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R17-SOURCE-20260901-01
EXECUTOR = ANTIGRAVITY
ANTIGRAVITY_MODE = LOW-CREDIT / BOUNDED
MAX_EXECUTOR_STATUS = HEADER_PARITY_PROOF_PENDING_INDEPENDENT_REVIEW
PRIVACY_PURGE_REQUIRED = NO
```

Authorized writes ONLY:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`;
- `tests/mbo-xlsx-ooxml-feasibility.test.js`.

No package/dependency changes and no binary publication.

## 5. Header authority and parity rule

Critical rule:

```text
HEADER PARITY = STRUCTURE + ROLE-SAFE FINGERPRINT PARITY.
DYNAMIC SAMPLE VALUES MUST BE SANITIZED, NOT PRESERVED.
```

### Part A

Protected static title/labels:
- `B6:M7`;
- `Z6:AF6`;
- `AG6:AL6`;
- `AM6:AP6`;
- `AQ6:AS6`;
- `AT6:BC6`;
- `BD6:BI6`.

Dynamic header/value regions:
- `N6:Q7`;
- `Z7:AF7`;
- `AG7:AL7`;
- `AM7:AP7`;
- `AQ7:AS7`;
- `AT7:BC7`;
- `BD7:BI7`.

### Part B

Protected static title/labels:
- `B2:F3`;
- `J2:L2`;
- `M2:O2`;
- `P2:Q2`;
- `R2` non-merged;
- `S2:W2`.

Dynamic header/value regions:
- `G2:H3`;
- `J3:L3`;
- `M3:O3`;
- `P3:Q3`;
- `R3` non-merged;
- `S3:W3`.

Unrelated bounded header cells such as Part B `X2/X3` remain template structure and must not silently become dynamic.

## 6. Mandatory proof

Use exact SHA source as authority and derive expected fingerprints BEFORE sanitization/override.

For protected-static header/title cells:
- exact address membership;
- exact `styleId`;
- exact `mergeRef` including non-merged exceptions;
- role-relevant type/blankness consistency;
- safe SHA-256 static text `valHash` parity where text exists;
- never expose raw values.

For dynamic header/value cells after sanitization:
- exact address membership;
- exact source `styleId` and `mergeRef`;
- output value must be blank/null/undefined;
- output dynamic value hash must be null/absent if emitted;
- never require source sample-value equality.

For unrelated bounded header cells:
- preserve source structural identity and safe static fingerprint where applicable.

Exact role/address sets must contain no missing, extra, duplicate or ambiguous entries.

A real validator/resolver must deterministically throw:

```text
BLOCKER_HEADER_FINGERPRINT_PARITY_UNRESOLVED
```

for missing/extra/ambiguous evidence, structural mismatch, static safe-fingerprint mismatch, nonblank sanitized dynamic value, or role/address conflict.

## 7. Mandatory tests

Preserve all existing accepted tests.

Positive proof for BOTH Parts A/B:
- exact source-vs-sanitized header parity;
- all dynamic header values blank after sanitization;
- source style/merge geometry retained;
- static labels retain safe source identity;
- unrelated header structure retained.

Negative proof through the real validator/resolver:
- one real dynamic style/merge mutation;
- one real sanitized dynamic nonblank mutation;
- one real protected-static safe fingerprint mutation;
- one missing required header address or one unexpected role address.

Observed-fingerprint overrides are allowed only when authoritative expected fingerprints are independently rebuilt from exact source first. No synthetic test-only validator.

## 8. Explicit exclusions

No workbook-wide parity closure, image inventory closure, insertion matrix, formula matrix, production sanitizer/renderer, export service/normalizer/application change, PDF/UI, Live Kintone, deploy, or next Work Package.

Mandatory commands:

```text
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

Final executor status exactly one of:

```text
HEADER_PARITY_PROOF_PENDING_INDEPENDENT_REVIEW
BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE
BLOCKER_HEADER_FINGERPRINT_PARITY_UNRESOLVED
```

## 9. Current gate

```text
D2 = IN PROGRESS
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R16 = PASS / CLOSED
D2-WP003-R3-R17 = AUTHORIZED / EXECUTION ACTIVE
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R17-SOURCE-20260901-01
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = EXECUTE R3-R17 ONLY / LOW-CREDIT / BOUNDED
PRIVACY_PURGE_REQUIRED = NO
```

D2 remains open until deferred feasibility blockers and then production Excel/combined/PDF parity and export security are independently accepted.
