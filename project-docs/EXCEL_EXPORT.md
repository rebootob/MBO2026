# MBO2026 — D2 EXCEL + PDF LEGACY FORMAT

Status: **IN PROGRESS / PRIVACY CLOSED / XLSX SEMANTIC+PROFILE CLOSED / R2 RENDERER DESIGN COMPLETE / PRE1 EVIDENCE REQUIRED**. Updated 2026-09-02 ICT.

Frozen authority:
```text
LEGACY_TEMPLATE = VISUAL / LAYOUT AUTHORITY
MboExportService_SECURED_PROJECTION = EXPORT DATA AUTHORITY
SCORING_SOURCE = KINTONE / APP794 + CONFIRMED CONFIG
PRESERVATION = PASS / CLOSED
REFERENCE_IMAGE = PASS / CLOSED
PART_A_STRUCTURAL = PASS / CLOSED
PART_B_STRUCTURAL = PASS / CLOSED
FORMULA_AUTHORITY = PASS / CLOSED
PART_B_EXPANDED_PRIVACY = PASS / CLOSED
XLSX_TEMPLATE_SEMANTIC_MAPPING = PASS / CLOSED
XLSX_TEMPLATE_PROFILE = PASS / CLOSED
EXCEL_SCORE_FORMULAS = FORBIDDEN
PRODUCTION_XLSX_FORMULA_INVENTORY = 0
```

Durable authorities:
- `CONFIRMED_BASELINE/D2_XLSX_TEMPLATE_SEMANTIC_MAPPING_CLOSURE.md`
- `CONFIRMED_BASELINE/D2_XLSX_TEMPLATE_PROFILE_CLOSURE.md`
- `CONFIRMED_BASELINE/EXPORT_TEMPLATE_MAPPING_ARCHITECTURE.md`

```text
SAFE_TO_MAP = 18 EXACT
UNRESOLVED = 22 EXACT
NO_SECURED_PROJECTION_SOURCE = 5 EXACT
CHIEF_FROZEN_AUTHORITY = R:X / NOT SECURED WRITABLE
```

## R2 renderer/sanitizer READ-ONLY design
Design:
`phase-3/D2_WP004_R2_RENDERER_SANITIZER_DESIGN.md`

Confirmed design rules:
- production renderer consumes only secured `MboExportService` projection;
- absent safe paths in Employee-Self stay cleared; never reconstruct confidential values;
- production XLSX core should be bytes/buffer-in -> bytes/buffer-out and not `fs`/path-coupled;
- existing `xlsx-populate` dependency is reusable; package change is unnecessary;
- feasibility source is proof authority but not production code and its structural builders contain proof-only sentinels;
- sanitization must clear broader sensitive/unresolved/no-source areas before secured writes, not only the 18 writable targets;
- no scattered important workbook addresses in renderer code.

## Pre-render blocker
The owner Part B template is N=6. N7/N8 structural expansion clones source rows 27:30, but current semantic/profile authority proves only `COMPETENCY_b_SELF_RATING` writes. Current competency source evidence shows management competency sets contain real additional items 7/8. Exact visible presentation target cells and deterministic secured projection/source-selection paths for those new items are not yet proven.

Therefore renderer implementation is NOT AUTHORIZED.

```text
PROPOSED_PRE1 = D2-WP004-R2-PRE1
NAME = PART B EXPANDED COMPETENCY PRESENTATION SEMANTIC EVIDENCE
MODE = EVIDENCE-ONLY / LOW-CREDIT / NOT AUTHORIZED
EXPECTED_FILE = phase-3/evidence/XLSX_PART_B_COMPETENCY_PRESENTATION_EVIDENCE.md
```

PRE1 must inspect the exact owner Part B template READ-ONLY and prove or reject candidate presentation semantics without proximity/alias inference. After independent PRE1 review, R2 can define centralized geometry/sanitization metadata and the smallest production engine contract.

```text
ACTIVE_WORK_PACKAGE = NONE
ANTIGRAVITY = STOP
CLAUDE = STOP
KINTONE = NONE
DEPLOY = NONE
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```
