# D2 PART A STRUCTURAL MATRIX — DURABLE CLOSURE

> Confirmed by independent Control Plane review on 2026-09-02 ICT.  
> Repository: `rebootob/MBO2026`  
> Canonical branch: `ai/antigravity-wp002c`

## Status

```text
D2_PART_A_STRUCTURAL_GATE = PASS / CLOSED
R4_SOURCE_REVIEW = PASS / FROZEN
R4_SOURCE_BASELINE = bf9ef7e82c78efc2e725614046745a3ccf394054
R4-R1_IMPLEMENTATION_COMMIT = 8a49a9af11f03ec3c2d2e2e3b5cafebe5befd8c6
R4-R2_IMPLEMENTATION_COMMIT = 98da94a07259effd95dcf539de3454b1f94745a8
PART_A_SHA256 = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
```

R4-R2 authorization `D2-WP003-R4-R2-TEST-20260902-01` was consumed by exactly one TEST-ONLY implementation commit. Authorization commit `2bb18bedc060955019bcf9c57efe6f27c52cafa3` -> implementation commit `98da94a07259effd95dcf539de3454b1f94745a8` changed only `tests/mbo-xlsx-ooxml-feasibility.test.js` with `+3/-0`.

## Frozen Part A source behavior

The accepted feasibility source implementation remains `bf9ef7e82c78efc2e725614046745a3ccf394054` and is frozen unless a new independently proven source defect appears.

Accepted source behavior:
- real source-path Part A structural buffers for objective counts 4,5,6,7,8,9,10;
- backwards-compatible `bufA4` through `bufA10` plus the `buffers` map;
- row/cell shifting for original downstream rows;
- row-28 structural cloning for inserted objective rows;
- merge shifting/cloning and merge-count update;
- exact worksheet dimensions A1:BL52 through A1:BL58;
- exact print areas `'MBO Staff & Chief'!$A$1:$BJ$52` through `'MBO Staff & Chief'!$A$1:$BJ$58`;
- privacy-safe sentinel setup used only for structural proof.

## Frozen proof contract

For every objective count 4 through 10, accepted proof requires:
- exact Part A owner-template SHA identity before template-dependent proof;
- real source-path execution rather than duplicated test-side insertion logic;
- exact numeric `rowRefs` sequence derived from the 4-objective baseline;
- `rowRefs` uniqueness (`Set.size === rowRefs.length`) and no unexpected row nodes;
- rows 1:28 structurally unchanged;
- each inserted row is an exact normalized clone of baseline row 28 for cell references, style pattern, row height and custom-height behavior;
- each original downstream row >=29 relocates exactly by `extraRows` without loss, duplication or stale old-row identity;
- privacy-safe sentinel relocates exactly once to row `29 + extraRows`;
- complete computed merge inventory deep equality, with declared merge count equal to actual inventory length;
- exact dimension progression A1:BL52..A1:BL58;
- exact print-area progression BJ52..BJ58;
- exact `sheetNames` and `sheetStates` baseline equality;
- exact main-sheet baseline equality for `colsHash`, `showGridLines`, `pageMargins`, `paperSize`, `orientation`, `scale`, `fitToPage`, `horizontalCentered`, `verticalCentered`, `sheetProtection`, and `sheetRels`;
- absolute page-setup authority remains simultaneously proven for every count: `paperSize === '8'`, `orientation === 'landscape'`, `scale === '58'`;
- relationship tuples unchanged;
- media inventory unchanged;
- formula inventory exactly empty.

The R4-R2 closure specifically restores the three absolute page-setup assertions while retaining all baseline-relative equality and all prior R4/R4-R1 proof.

## Runtime-signal note

GitHub exposed no combined CI status and no workflow runs for R4-R2. This Baseline records the independent repository scope/proof-code review and does not claim a separate CI/runtime certification.

## Scope boundary

This closure does not authorize or start:
- Part B competency structural insertion;
- formula/no-formula closure beyond the accepted Part A empty-formula proof;
- production XLSX renderer/sanitizer;
- combined Excel parity;
- PDF parity;
- generated artifact publication;
- Kintone writes/deploys/Live UAT;
- D3 or any later work package.

Part B remains the next D2 planning gate and requires a separate Owner authorization after Control Plane planning.