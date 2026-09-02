# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / PRESERVATION PASS-CLOSED / REFERENCE-IMAGE PROOF CORRECTIVE**  
> Updated: 2026-09-02 ICT  
> Repository: `rebootob/MBO2026`  
> Canonical branch: `ai/antigravity-wp002c`

## 1. Objective

Deliver Excel/PDF outputs preserving approved legacy PMS presentation while using current App794/configuration truth and D1 security/privacy boundaries.

```text
COMPLETE D2 FULLY BEFORE D3.
```

## 2. Authority / identity

```text
LEGACY TEMPLATE = VISUAL / LAYOUT AUTHORITY
CONFIRMED_BASELINE + CURRENT APP CONFIG = BUSINESS RULE AUTHORITY
SECURED MboExportService PROJECTION = EXPORT DATA AUTHORITY
PART_A_SHA256 = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B_SHA256 = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
```

Original employee-bearing binaries remain ignored/not publishable.

## 3. Frozen accepted foundations

```text
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003-R3-R22 = PASS / CLOSED
D2-WP003-R3-R30 = PASS / CLOSED
D2_PRESERVATION_GATE = PASS / CLOSED
PART_B_PRIVACY_CLASSIFICATION_EVIDENCE_PARITY = PASS / CLOSED
TYPED_PRIVACY_METADATA_COMPLETENESS = PASS / CLOSED
TYPED_METADATA_VALIDATOR_SHAPE = PASS / CLOSED
HEADER_FINGERPRINT_SANITIZED_EXPORT_PARITY = PASS / CLOSED
DIFFICULTY_LEVEL_EXPORT = BLANK TEMPORARILY
D2-PRESERVATION-PARTB-SHEETPR-DECISION-01 = OPTION B APPROVED
```

Raw `getNoOpParityBuffers()` remains direct unrepaired `xlsx-populate.outputAsync()` output.

Part A: `MBO Staff & Chief`, A1:BL52, print A1:BJ52, A3 landscape, scale 58%, 193 merges, no legacy formulas.  
Part B: `(Part B) Competency`, `Sheet1`, main A1:X35, A4 portrait, scale 75%, protected, 79 main-sheet merges, six blocks expandable to eight, `Sheet1` has no print area, no legacy formulas.

## 4. Preservation closure — R3-R30

R3-R30 is PASS/CLOSED. The OOXML preservation gate is PASS/CLOSED. Production preservation source is frozen from R3-R29 and Option B remains narrow deterministic allowed drift only.

## 5. Reference-image READ-ONLY review

Current source behavior is accepted for the next corrective:
- target anchor/relationship `rId3` is removed;
- target media `xl/media/image3.png` is removed only after scanning all remaining `.rels` parts and failing closed if still referenced.

Current proof does not close the gate. It only checks target absence and `rId1/rId2` survival.

Historical independent review truth R3-R5 through R3-R9 consistently required:
- complete BEFORE/AFTER drawing-anchor inventory;
- complete drawing relationship inventory;
- complete media filename + SHA-256 inventory;
- normalize only exact target items out of BEFORE;
- require every non-target item to be exactly identical AFTER.

That proof is absent from the current test.

```text
D2_REFERENCE_IMAGE_GATE = CORRECTIVE REQUIRED / NOT CLOSED
REFERENCE_IMAGE_SOURCE_REVIEW = PASS
REFERENCE_IMAGE_PROOF_REVIEW = FAIL
PROPOSED_WORK_PACKAGE = D2-WP003-R3-R31
PROPOSED_SCOPE = TEST-ONLY / tests/mbo-xlsx-ooxml-feasibility.test.js
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
```

R3-R31 is NOT authorized.

## 6. R3-R31 proposed proof direction

Use existing `origBufA` and `outBufA` only. Snapshot stable full inventories for anchors, drawing relationships and `xl/media/*`; prove exact target identity in BEFORE; remove only target `rId3` anchor/relationship and `image3.png` from the BEFORE inventories; require exact deep equality with AFTER. Retain existing target absence/branding assertions and package-wide orphan safety.

No production source change is proposed.

## 7. Remaining D2 path

After reference-image closure:
1. Part A objective insertion matrix;
2. Part B competency insertion matrix;
3. formula/no-formula authority;
4. production sanitizer + XLSX renderer;
5. combined Excel parity;
6. PDF parity;
7. export authorization/security/privacy regression;
8. final independent D2 closure.

Do not auto-start any next step.
