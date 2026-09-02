# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / PRESERVATION PASS-CLOSED / R3-R31 REFERENCE-IMAGE TEST-ONLY AUTHORIZED**  
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

## 5. Reference-image review truth

Current source behavior is accepted for R3-R31:
- target anchor/relationship `rId3` is removed;
- target media `xl/media/image3.png` is removed only after scanning all remaining `.rels` parts and failing closed if still referenced.

Current proof does not close the gate. It only checks target absence and `rId1/rId2` survival.

Historical independent review truth R3-R5 through R3-R9 consistently required:
- complete BEFORE/AFTER drawing-anchor inventory;
- complete drawing relationship inventory;
- complete media filename + SHA-256 inventory;
- normalize only exact target items out of BEFORE;
- require every non-target item to be exactly identical AFTER.

```text
D2_REFERENCE_IMAGE_GATE = CORRECTIVE REQUIRED / NOT CLOSED
REFERENCE_IMAGE_SOURCE_REVIEW = PASS / FROZEN FOR R3-R31
REFERENCE_IMAGE_PROOF_REVIEW = FAIL
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R31
AUTHORIZED_SCOPE = TEST-ONLY / tests/mbo-xlsx-ooxml-feasibility.test.js
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP003-R3-R31-TEST-20260902-01
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ANTIGRAVITY = AUTHORIZED ONLY FOR R3-R31
CLAUDE = STOP / NOT NEEDED
```

Owner explicitly authorized R3-R31 TEST-ONLY on 2026-09-02.

## 6. R3-R31 mandatory proof

Using existing `origBufA` and `outBufA` only:
1. verify exact Part A owner-template identity before template-dependent proof;
2. snapshot complete BEFORE and AFTER drawing-anchor inventories across relevant `xl/drawings/*.xml` parts using stable part/path + anchor identity/hash;
3. snapshot complete BEFORE and AFTER drawing relationship inventories using exact `(part, Id, Type, Target, TargetMode)` tuples;
4. snapshot complete BEFORE and AFTER `xl/media/*` inventories using exact media path + SHA-256 content hash;
5. prove exact target identity in BEFORE: exactly one expected `rId3` anchor, exactly one image relationship `rId3` resolving to `xl/media/image3.png`, and exact target media present;
6. normalize only those exact target items out of BEFORE;
7. require exact deep equality of normalized BEFORE versus AFTER for anchors, relationships and media inventory;
8. retain explicit target absence, branding/non-target survival and package-wide orphan safety assertions;
9. if exact owner template is unavailable, skip template-dependent proof explicitly rather than reconstructing the binary.

No production source change is authorized.

Required checks:
```text
node --check tests/mbo-xlsx-ooxml-feasibility.test.js
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

Exactly one bounded TEST-ONLY commit and push, then STOP.

## 7. Remaining D2 path

After ChatGPT independently reviews R3-R31 and closes reference-image handling if justified:
1. Part A objective insertion matrix;
2. Part B competency insertion matrix;
3. formula/no-formula authority;
4. production sanitizer + XLSX renderer;
5. combined Excel parity;
6. PDF parity;
7. export authorization/security/privacy regression;
8. final independent D2 closure.

Do not auto-start any next step.
