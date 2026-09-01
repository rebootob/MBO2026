# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / R3-R21 AUTHORIZED**  
> Updated: 2026-09-01 ICT  
> Repository: `rebootob/MBO2026`  
> Canonical branch: `ai/antigravity-wp002c`

## 1. D2 objective and priority

Deliver Excel/PDF outputs preserving approved legacy PMS presentation while using current App794/configuration truth and D1 security/privacy boundaries.

```text
COMPLETE D2 FULLY BEFORE D3.
```

## 2. Authority split

```text
LEGACY TEMPLATE = VISUAL / LAYOUT AUTHORITY
CONFIRMED_BASELINE + CURRENT APP CONFIG = BUSINESS RULE AUTHORITY
SECURED MboExportService PROJECTION = EXPORT DATA AUTHORITY
```

Accepted source fingerprints:

```text
PART_A_SHA256 = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B_SHA256 = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
```

## 3. Accepted feasibility foundations

```text
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003-R3-R13 = PASS / CLOSED
D2-WP003-R3-R16 = PASS / CLOSED
D2-WP003-R3-R17 = PASS / CLOSED
PART_B_PRIVACY_CLASSIFICATION_EVIDENCE_PARITY = PASS / CLOSED
TYPED_PRIVACY_METADATA_COMPLETENESS = PASS / CLOSED
TYPED_METADATA_VALIDATOR_SHAPE = PASS / CLOSED
HEADER_FINGERPRINT_SANITIZED_EXPORT_PARITY = PASS / CLOSED
DIFFICULTY_LEVEL_EXPORT = BLANK TEMPORARILY
```

## 4. R3-R20 independent review / accepted partial workbook parity

Implementation:

```text
ddcee22200c22a5474374562a6630e835365db02
```

Verdict:

```text
D2-WP003-R3-R20_SCOPE_REVIEW = PASS
D2-WP003-R3-R20_SOURCE_REVIEW = FAIL / CORRECTIVE REQUIRED
D2-WP003-R3-R20_STATUS = NOT PASS / NOT CLOSED
PRIVACY_PURGE_REQUIRED = NO
```

Accepted behavior preserved into R3-R21:
- `_xlnm.Print_Area` maps by exact `localSheetId` and actual zero-based worksheet order;
- no cross-sheet fallback;
- Part B main sheet retains exact print area and second `Sheet1` has no print area;
- `getWorkbookFingerprint()` records actual OOXML `<dimension>` tag/absence only and does not synthesize from rows/cells;
- validator dimension equality is unconditional;
- wrong `Sheet1.printArea`, blank dimension, `Sheet1.colsHash`, and actual dimension-tag removal negative proofs remain.

Remaining blockers:

### A. Pure no-op observed evidence
`getNoOpParityBuffers()` currently repairs raw xlsx-populate output by copying exact source `<dimension>` tags back into output worksheets when missing. This hides whether raw no-op roundtrip actually preserves material workbook structure.

R3-R21 requirement:
- return direct raw `outputAsync()` results;
- no source-to-output copying/reinsertion/repair/normalization of `<dimension>` or other structural evidence;
- if raw roundtrip loses material evidence, expose `BLOCKER_WORKBOOK_PARITY_UNRESOLVED` and STOP; do not build a workaround in this WP.

### B. Deterministic blocker normalization
`validateWorkbookParity()` currently rethrows raw errors. It must preserve only:

```text
BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE
```

and normalize every other workbook-parity path error/failure to:

```text
BLOCKER_WORKBOOK_PARITY_UNRESOLVED
```

No incidental parser/runtime/TypeError message may escape as the parity result.

## 5. D2-WP003-R3-R21 — AUTHORIZED

Purpose: **pure no-op observed evidence + deterministic blocker normalization only**.

```text
CONTROL_PLANE_PRE_AUTH_CHECKPOINT = 26645b31ae6f9fabc42af8b595dd25aea39ee5d1
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R21-SOURCE-20260901-01
EXECUTOR = ANTIGRAVITY
ANTIGRAVITY_MODE = LOW-CREDIT / BOUNDED
MAX_EXECUTOR_STATUS = WORKBOOK_PARITY_RAW_NOOP_PROOF_PENDING_INDEPENDENT_REVIEW
PRIVACY_PURGE_REQUIRED = NO
```

Authorized writes ONLY:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`;
- `tests/mbo-xlsx-ooxml-feasibility.test.js`.

Antigravity must fresh-fetch current authorized canonical HEAD and use that as `EXECUTION_BASELINE`; the pre-authorization checkpoint is not an executor reset target.

No package/dependency change and no binary publication.

## 6. Mandatory R3-R21 proof

Preserve all accepted R3-R19/R3-R20 and earlier tests.

Raw no-op evidence:
- build source fingerprints independently from exact SHA owner templates;
- return raw xlsx-populate no-op outputs without repair;
- evaluate raw Part A and Part B through the real workbook validator;
- explicitly record safe presence/absence of actual dimension evidence for Part A main, Part B main, and Part B `Sheet1`;
- if raw parity is clean, prove `true`;
- if raw parity is materially degraded, prove exact workbook blocker and do not mask it.

Deterministic normalization:
- add the smallest malformed observed fingerprint test that induces an incidental runtime comparison/serialization error;
- real `validateWorkbookParity()` must return/reject with exactly `BLOCKER_WORKBOOK_PARITY_UNRESOLVED`;
- preserve `BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE` separately.

## 7. D2 remaining closure path

After workbook-wide parity truth is independently accepted/resolved, continue bounded steps:
1. if raw no-op degradation is proven, authorize a separate minimal preservation strategy work package first;
2. reference-image inventory/removal/preservation closure;
3. Part A objective insertion structural matrix closure;
4. Part B competency insertion structural matrix closure;
5. formula/no-formula authority closure;
6. production sanitizer + XLSX renderer using secured export projection;
7. combined Part A + Part B Excel output parity;
8. PDF generation/parity for Part A A3 landscape and Part B A4 portrait;
9. export authorization/security/privacy regression;
10. final D2 independent closure review.

Do not auto-start the next step.

## 8. Current gate

```text
D2 = IN PROGRESS
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R20 = REVIEWED / NOT PASS / NOT CLOSED
D2-WP003-R3-R21 = AUTHORIZED / EXECUTION ACTIVE
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R21
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R21-SOURCE-20260901-01
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
D3 = HOLD UNTIL D2 PASS / CLOSED
ANTIGRAVITY = EXECUTE R3-R21 ONLY / LOW-CREDIT / BOUNDED
PRIVACY_PURGE_REQUIRED = NO
```

## 9. Authorization ledger

```text
D2-WP003-R3-R18-SOURCE-20260901-01 = CONSUMED / REVIEWED / NOT PASS / DO NOT REUSE
D2-WP003-R3-R19-SOURCE-20260901-01 = CONSUMED / REVIEWED / NOT PASS / DO NOT REUSE
D2-WP003-R3-R20-SOURCE-20260901-01 = CONSUMED / REVIEWED / NOT PASS / DO NOT REUSE
D2-WP003-R3-R21-SOURCE-20260901-01 = ACTIVE / ONE CORRECTIVE ONLY
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R21-SOURCE-20260901-01
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
```
