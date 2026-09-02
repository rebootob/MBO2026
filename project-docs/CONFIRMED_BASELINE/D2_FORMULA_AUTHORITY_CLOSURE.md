# D2 FORMULA / NO-FORMULA AUTHORITY — CONFIRMED BASELINE

> Status: **PASS / CLOSED / FROZEN**  
> Accepted: 2026-09-02 ICT  
> Repository: `rebootob/MBO2026`  
> Canonical branch: `ai/antigravity-wp002c`

## 1. Closure

```text
D2_FORMULA_AUTHORITY_GATE = PASS / CLOSED
SCORING_SOURCE_OF_TRUTH = KINTONE / APP794 + CONFIRMED SCORING CONFIG
EXPORT_DATA_AUTHORITY = SECURED MboExportService PROJECTION
LEGACY_EXCEL_TEMPLATE_AUTHORITY = VISUAL / LAYOUT ONLY
EXCEL_SCORE_FORMULAS = FORBIDDEN
EXPORT_RENDERER_SCORE_RECALCULATION = FORBIDDEN
PRODUCTION_XLSX_FORMULA_INVENTORY = EXACTLY ZERO
```

This is a Control-Plane authority/contract closure. No production source/test implementation was required or authorized by this gate.

## 2. Evidence basis

### Kintone scoring authority
`project-docs/phase-3/evidence/KINTONE_SCORING_SOURCE_OF_TRUTH.md` records the confirmed rule:

```text
SCORING_SOURCE_OF_TRUTH = LIVE_KINTONE_FIRST
```

Live deployed Kintone calculation lineage and confirmed scoring configuration outrank Excel business artifacts. Excel is secondary presentation/reference material and must not override Kintone scoring behavior.

### Export projection behavior
`src/services/mbo-export-service.js` does not implement a second scoring engine for exported results. For authorized non-Employee-Self export it projects stored App794 scalar result fields including:
- `PartA_Raw_Score`;
- `PartA_Weighted_Score`;
- `PartB_Raw_Score`;
- `PartB_Weighted_Score`;
- `Final_Score`;
- `Final_Grade`.

Employee-Self projection intentionally omits confidential calculated score/result fields rather than deriving or reconstructing them in the exporter.

### Template/structural formula inventory
Durable Part A and Part B structural Baselines independently freeze workbook formula inventory as exactly zero:
- `CONFIRMED_BASELINE/D2_PART_A_STRUCTURAL_CLOSURE.md`;
- `CONFIRMED_BASELINE/D2_PART_B_STRUCTURAL_CLOSURE.md`.

## 3. Frozen production contract

Any production XLSX/PDF export implementation must obey all of the following:

1. **No Excel scoring engine.** The exporter/renderer must not reproduce Kintone scoring formulas, difficulty×achievement matrices, weighting logic, denominator logic, rounding logic or grade derivation as worksheet formulas or renderer-side recalculation.
2. **Authorized scalar projection only.** For an authorized approver/full export, score/result cells may be populated only from the secured export projection produced from trusted App794/configuration truth.
3. **Employee-Self confidentiality.** Fields omitted by the secured Employee-Self projection must remain omitted/blank in generated output. The renderer must never reconstruct them from visible inputs.
4. **Formula inventory = zero.** Production generated XLSX files must contain no worksheet formulas (`<f>` inventory exactly empty) unless a future Owner-approved governance decision explicitly supersedes this Baseline.
5. **PDF is presentation output.** PDF generation must consume already-authorized scalar projection/rendered content; it must not become an independent scoring authority.
6. **No silent standardization.** Existing confirmed profile-specific Kintone behavior, including legitimate legacy profile differences, must not be normalized by the exporter.

## 4. Required proof in later gates

This authority decision does not itself prove the not-yet-built production renderer. Later production-renderer/combined-export gates must prove:
- generated XLSX formula inventory exactly zero;
- score/result values written only from secured projection fields;
- Employee-Self confidential result fields remain absent/blank;
- no renderer-side scoring/recalculation helper was introduced;
- combined Excel/PDF output remains consistent with this authority split.

## 5. Scope boundary

This closure does **not** authorize or complete:
- production XLSX renderer/sanitizer;
- expanded Part B privacy/address remapping;
- combined Excel parity;
- PDF parity;
- export authorization/security/privacy regression;
- Kintone writes/deploys/Live UAT;
- D3.

Next D2 implementation gate is production XLSX renderer/sanitizer plus expanded Part B privacy/address remapping. Antigravity remains STOP until an exact Owner authorization exists.
