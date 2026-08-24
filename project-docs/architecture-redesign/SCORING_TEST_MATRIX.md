# Evaluation Profile & Scoring Test Matrix (30 Scenarios)

> **Document Status:** Complete (Architecture Test Blueprint)  
> **Coverage:** Scenarios `SC-001` to `SC-030`  
> **Last Updated:** 2026-08-24  

---

## 1. Master Scoring Test Matrix Table

| Test ID | Scenario Description | Input Parameters | Expected Result | Pass Criteria |
| :--- | :--- | :--- | :--- | :---: |
| **SC-001** | Staff/Chief Profile Resolution | Position = Staff | Resolves `PROFILE_STAFF_CHIEF`, 70/30 | PASS |
| **SC-002** | Japanese Staff Profile Resolution| Group = Japanese Expat | Resolves `PROFILE_JAPANESE_STAFF`, 70/30 | PASS |
| **SC-003** | Assistant Manager Profile | Position = Assistant Mgr | Resolves `PROFILE_MANAGEMENT`, 50/50 | PASS |
| **SC-004** | Section Manager Profile | Position = Section Mgr | Resolves `PROFILE_MANAGEMENT`, 50/50 | PASS |
| **SC-005** | Senior Manager Profile | Position = Senior Mgr | Resolves `PROFILE_MANAGEMENT`, 50/50 | PASS |
| **SC-006** | Deputy GM Profile | Position = DGM | Resolves `PROFILE_MANAGEMENT`, 50/50 | PASS |
| **SC-007** | General Manager Profile | Position = GM | Resolves `PROFILE_EXECUTIVE`, 50/50 | PASS |
| **SC-008** | Vice President Profile | Position = VP | Resolves `PROFILE_EXECUTIVE`, 50/50 | PASS |
| **SC-009** | 70/30 Mathematical Calculation | Part A=80, Part B=4.0 | $80 \times 0.70 + 4.0 \times 6.0 = 80.00$ | PASS |
| **SC-010** | 50/50 Mathematical Calculation | Part A=80, Part B=4.0 | $80 \times 0.50 + 4.0 \times 10.0 = 80.00$ | PASS |
| **SC-011** | COCE Evaluated but Excluded | COCE Rating = 5 | Rating saved, excluded from Part B average | PASS |
| **SC-012** | 1 Appraiser Profile Denominator | Executive, 7 items | Denominator = $7 \times 1 = 7$ | PASS |
| **SC-013** | 2 Appraisers Profile Denominator| Management, 7 items | Denominator = $7 \times 2 = 14$ | PASS |
| **SC-014** | Objective Total Weight Validation| Total Weight = 100% | Passes validation; total != 100% blocks | PASS |
| **SC-015** | Objective Minimum Enforcement | Objectives Count = 1 | Blocks save with validation error (< 2) | PASS |
| **SC-016** | Objective Maximum Enforcement | Objectives Count = 11 | Blocks save with validation error (> 10) | PASS |
| **SC-017** | Active 10 Objectives Calculation | 10 Objectives active | Sums all 10 MBO weighted points correctly | PASS |
| **SC-018** | Profile Versioning Next FY | FY2027 v1 -> FY2028 v2 | FY2027 retains v1 snapshot; FY2028 uses v2 | PASS |
| **SC-019** | Historical Profile Snapshot Lock| Profile Master updated | Historical completed record retains snapshot | PASS |
| **SC-020** | Reopen Preserves Historical Score| Rev 1 approved, Rev 2 opened | Rev 1 score preserved in Archive App | PASS |
| **SC-021** | Current Revision Recalculation | Rev 2 weights edited | Recalculates strictly from Rev 2 inputs | PASS |
| **SC-022** | Excluded Items Denominator Math | 6 items (1 COCE) | Divisor is strictly 5 items $\times$ Appraisers | PASS |
| **SC-023** | Rating Scale Boundary Check | Rating = 6 entered | UI & API validation blocks invalid rating | PASS |
| **SC-024** | Rounding Half-Up Verification | Score = 84.555 | Correctly rounds to 84.56 | PASS |
| **SC-025** | Confidential Score Permission | Employee accesses API | Appraiser score fields return null/empty | PASS |
| **SC-026** | Profile Priority Resolution | Override exists | Individual override takes precedence | PASS |
| **SC-027** | Missing Profile Error Handling | Unmapped Position | Enters `ROUTING_CONFIGURATION_ERROR` cleanly | PASS |
| **SC-028** | Overlapping Mapping Conflict | Ambiguous mapping rule | Priority hierarchy resolves deterministically | PASS |
| **SC-029** | Mid-Year Promotion Handling | Staff promoted to Mgr | Controlled stage refresh resolves new profile | PASS |
| **SC-030** | Export Profile Layout Mapping | Staff vs Manager export | Generates layout according to export template | PASS |
