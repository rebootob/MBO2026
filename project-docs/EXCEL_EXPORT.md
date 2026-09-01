# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / R3-R17 PASS-CLOSED / R3-R18 REVIEWED-NOT-PASS / R3-R19 REVIEWED-NOT-PASS / R3-R20 AUTHORIZED**  
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

Accepted privacy/typed-metadata/header work must not reopen without proven regression.

## 4. R3-R19 reviewed result / accepted partial workbook parity

Implementation:

```text
4a3092b3e69a68d3a5e864173f8c2e5c182eee54
```

Verdict:

```text
D2-WP003-R3-R19_SCOPE_REVIEW = PASS
D2-WP003-R3-R19_SOURCE_REVIEW = FAIL / CORRECTIVE REQUIRED
D2-WP003-R3-R19_STATUS = NOT PASS / NOT CLOSED
PRIVACY_PURGE_REQUIRED = NO
```

Accepted R3-R19 behavior:
- `_xlnm.Print_Area` maps by exact `localSheetId` and zero-based worksheet order;
- no cross-sheet fallback;
- Part B main sheet retains exact print area;
- Part B `Sheet1` exposes no print area;
- validator compares dimension by unconditional exact equality;
- wrong `Sheet1.printArea` and blank observed-dimension negative paths exist.

Remaining R3-R20 blockers:

### A. Strict actual dimension-tag evidence
Current helper synthesizes a dimension string from row/cell coordinates if the actual worksheet `<dimension>` element is missing. This can hide missing evidence. The exact owner templates already contain explicit dimension tags for Part A main, Part B main and Part B `Sheet1`, so the fingerprint must expose only the actual OOXML tag/absence condition.

Required:
- remove synthetic dimension reconstruction;
- actual `<dimension .../>` tag is the evidence;
- absent actual tag remains absent;
- unconditional exact validator comparison remains;
- source-present vs observed-missing actual tag fails closed.

### B. Restore accepted Part B second-sheet structural proof
Restore the R3-R18 real-validator negative test where Part B `Sheet1.colsHash` is mutated and must throw `BLOCKER_WORKBOOK_PARITY_UNRESOLVED`. Do not remove any R3-R19 proof.

## 5. D2-WP003-R3-R20 — AUTHORIZED

Purpose: **strict dimension-tag evidence + restore second-sheet structural negative proof only**.

```text
CONTROL_PLANE_PRE_AUTH_CHECKPOINT = 0344e7a95bc34138c31dffdd2701525d8fb63105
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R20-SOURCE-20260901-01
EXECUTOR = ANTIGRAVITY
ANTIGRAVITY_MODE = LOW-CREDIT / BOUNDED
MAX_EXECUTOR_STATUS = WORKBOOK_PARITY_STRICT_DIMENSION_PROOF_PENDING_INDEPENDENT_REVIEW
PRIVACY_PURGE_REQUIRED = NO
```

Authorized writes ONLY:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`;
- `tests/mbo-xlsx-ooxml-feasibility.test.js`.

Antigravity must fresh-fetch current authorized canonical HEAD and use that as `EXECUTION_BASELINE`; the pre-authorization checkpoint is not an executor reset target.

No package/dependency change and no binary publication.

## 6. Mandatory R3-R20 proof

Preserve all accepted R3-R19 and earlier tests.

Positive:
- Part A and Part B no-op roundtrip still pass the real workbook validator;
- R3-R19 per-sheet print-area assertions remain passing;
- actual source/no-op dimension-tag fingerprints stay equal for every worksheet.

Negative through the real validator/source-backed expected evidence:
- wrong `Sheet1.printArea` remains blocked;
- blank observed dimension fingerprint remains blocked;
- restored `Sheet1.colsHash` mutation is blocked;
- smallest safe in-memory/helper-level proof shows removal of an actual observed `<dimension>` tag remains missing rather than being synthesized and is rejected. Do not publish the mutated workbook or fabricate source values.

Expected evidence must always be rebuilt independently from exact SHA source before mutation/override.

## 7. D2 remaining closure path

After workbook-wide parity is independently accepted, continue bounded steps:
1. reference-image inventory/removal/preservation closure;
2. Part A objective insertion structural matrix closure;
3. Part B competency insertion structural matrix closure;
4. formula/no-formula authority closure;
5. production sanitizer + XLSX renderer using secured export projection;
6. combined Part A + Part B Excel output parity;
7. PDF generation/parity for Part A A3 landscape and Part B A4 portrait;
8. export authorization/security/privacy regression;
9. final D2 independent closure review.

Do not auto-start the next step.

## 8. Current gate

```text
D2 = IN PROGRESS
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R19 = REVIEWED / NOT PASS / NOT CLOSED
D2-WP003-R3-R20 = AUTHORIZED / EXECUTION ACTIVE
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R20
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R20-SOURCE-20260901-01
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
D3 = HOLD UNTIL D2 PASS / CLOSED
ANTIGRAVITY = EXECUTE R3-R20 ONLY / LOW-CREDIT / BOUNDED
PRIVACY_PURGE_REQUIRED = NO
```

## 9. Authorization ledger

```text
D2-WP003-R3-R18-SOURCE-20260901-01 = CONSUMED / REVIEWED / NOT PASS / DO NOT REUSE
D2-WP003-R3-R19-SOURCE-20260901-01 = CONSUMED / REVIEWED / NOT PASS / DO NOT REUSE
D2-WP003-R3-R20-SOURCE-20260901-01 = ACTIVE / ONE CORRECTIVE ONLY
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R20-SOURCE-20260901-01
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
```
