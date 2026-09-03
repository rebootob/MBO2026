# D2 REVIEW FAST-START — MBO2026

Updated: 2026-09-03 ICT
Repository: `rebootob/MBO2026`
Branch: `ai/antigravity-wp002c`

## Fast path
Fresh-fetch HEAD -> this file -> `AI_ACTIVE_TASK.md` -> `phase-3/D2_WP004_R2_RENDERER_SANITIZER_DESIGN.md` -> only directly relevant baseline/source/test for the exact current gate.

## Project truth
```text
OWNER_OBJECTIVE = COMPLETE D2 TO PASS / CLOSED BEFORE D3
D1 = PASS / CLOSED
D2 = IN PROGRESS
PRESERVATION = PASS / CLOSED
REFERENCE_IMAGE = PASS / CLOSED
PART_A_STRUCTURAL = PASS / CLOSED
PART_B_STRUCTURAL = PASS / CLOSED / FROZEN
FORMULA_AUTHORITY = PASS / CLOSED
PART_B_EXPANDED_PRIVACY = PASS / CLOSED / FROZEN
XLSX_TEMPLATE_SEMANTIC_MAPPING = PASS / CLOSED
XLSX_TEMPLATE_PROFILE = PASS / CLOSED / FROZEN
PRE1 = PASS / CLOSED
PRE1_R1 = PASS / CLOSED
PRE2 = READ-ONLY DESIGN COMPLETE
PRE2_R1 = PASS / CLOSED AFTER CORRECTIVE
PRE2_R1_R1 = PASS / CLOSED
PRE2_R2 = PASS / CLOSED
PRE2_R3 = PASS / CLOSED AFTER CORRECTIVE CHAIN THROUGH R4
R2_A = PASS / CLOSED AFTER R1
R2_B1 = PASS / CLOSED AFTER R10
R2_B2 = REVIEWED / SOURCE+TEST DEFECTS / NOT CLOSED
R2_B2_R1 = PROPOSED / NOT AUTHORIZED
ACTIVE_WORK_PACKAGE = NONE
ANTIGRAVITY = STOP
CLAUDE = STOP
R2_C = NOT AUTHORIZED
COMBINED_EXCEL_PARITY = LATER D2 GATE / NOT AUTHORIZED
D3 = HOLD
```

## Closed R2-B1 authority
```text
R10_AUTHORIZATION = 9a5919f20e53676508862ffce96eaa754556e109
R10_IMPLEMENTATION = 673137c2f28587e058844e93af66dad9fc722d24
R10_RUNTIME = PASS 4 / FAIL 0 / SKIP 0
OWNER_TEMPLATE_N4_TO_N10 = PASS
PART_A_RAW_OOXML_SANITIZER = PASS / FROZEN
R2_B1 = PASS / CLOSED
```
Do not reopen R2-B1 without a proven regression.

## R2-B2 reviewed implementation
```text
R2_B2_AUTHORIZATION = 0037436d0c90ab84fdcb744cb2d1b8e5e8a0b685
R2_B2_IMPLEMENTATION = 0b4bac862aa2906d1ac11071431dbb268c7b7b5e
AUTH_TO_IMPLEMENTATION = EXACTLY ONE COMMIT
SCOPE = PASS / EXACTLY TWO AUTHORIZED FILES
GITHUB_STATUS = NONE
WORKFLOW_RUNS = NONE
R2_B2 = NOT CLOSED
```

Accepted B2 directions to preserve:
- `preparePartBTemplate()` exists;
- exact Part B SHA and 6/7/8 competency gates;
- browser-safe production boundary;
- raw OOXML sanitization principle;
- SOURCE rows27:30 clone and downstream row relocation approach;
- exact dimensions/Print_Area intent;
- presentation title overlay intent;
- zero semantic/Kintone/scoring writes.

## Current material blocker — merge topology corruption
Production B2 currently relocates merge endpoints with inconsistent thresholds:
```text
start row shifts when >=31
end row shifts when >=29
```
This corrupts frozen source-block rating-scale merges. Examples:
```text
SOURCE B29:J29 -> N7 B29:J33 / N8 B29:J37
SOURCE K29:Q29 -> N7 K29:Q33 / N8 K29:Q37
SOURCE R29:W29 -> N7 R29:W33 / N8 R29:W37
```
Frozen authority requires original rows1:30 merge topology unchanged, exact cloning of six source-block merges, and exact relocation only of downstream merges.

## Current proof blocker
The Part B test currently checks merge count plus title-merge presence but does not deep-equal the complete SOURCE-derived intermediate/final merge inventories. The count-only proof can therefore stay green while topology is wrong.

Additional R1 proof corrections required:
- exact six SOURCE block-merge preguard;
- exact SOURCE-derived intermediate merge-set deep equality 79/85/91;
- exact SOURCE-derived final merge-set deep equality 79/86/93;
- exact Rating Scale/padding SOURCE-derived preservation;
- full auxiliary `Sheet1` fingerprint parity;
- non-target defined-name parity;
- source-backed post-structural protected/static topology validation before sanitization;
- retain strict privacy/package/formula/no-semantic-write proof.

## Exact next proposed gate — NOT AUTHORIZED
```text
PROPOSED_WORK_PACKAGE = D2-WP004-R2-B2-R1
NAME = PART B EXACT MERGE TOPOLOGY + SOURCE-BACKED STATIC PROOF CORRECTIVE
MODE = SOURCE+TEST CORRECTIVE / BOUNDED / ONE-SHOT / LOW-CREDIT
STATE = PROPOSED / NOT AUTHORIZED

PROPOSED_WRITABLE_FILES =
  src/services/mbo-xlsx-template-preparer.js
  tests/mbo-xlsx-template-preparer-part-b.test.js

PROFILE = FROZEN
PART_A = FROZEN
R2_C = NOT AUTHORIZED
D3 = HOLD
```

Recommended approval phrase:
`อนุมัติ D2-WP004-R2-B2-R1 SOURCE+TEST CORRECTIVE ตามขอบเขตที่เสนอ`
