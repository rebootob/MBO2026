# Kintone Scoring Source of Truth Matrix & Lineage Audit
## Comprehensive Active Calculation Lineage across All 8 Legacy Deployed Applications

> **Governance Principle:** `SCORING_SOURCE_OF_TRUTH = LIVE_KINTONE_FIRST` (User-Confirmed Rule)  
> **Durable Decision:** `DEC-035` (Supersedes scoring-specific assumptions in `DEC-023`)  
> **Source-of-Truth Priority:**  
> 1. Live Kintone Deployed Configuration (CALC expressions, active fields, JS customizations)  
> 2. Recent Kintone Discovery JSON Snapshots  
> 3. Frozen Project Decisions & Documentation  
> 4. Excel Business Artifacts (Secondary Reference for Labels/Descriptions; MUST NOT Override Kintone)  
> **Audit Date:** 2026-08-24T15:14:00+07:00  
> **Access Mode:** Strict Read-Only (`GET` only; 0 writes executed)  
> **Target Apps Audited:** 9 Apps (App 283, 305, 307, 310, 640, 643, 715, 716, 794)  

---

## 1. Executive Summary & Authoritative Deployed Findings

1. **Active Dependency Lineage & App 310 Correction:**
   - **App 310 (Assistant Manager):**
     - `total_all` actively references `total_a` (`ROUND((total_score * 60) / 100, 2)`).
     - Field `total_a_0` (`ROUNDUP(...)`) has **0 downstream references** $\implies$ Classified as **`DUPLICATE_CALC / LEGACY_UNUSED`**.
     - Therefore, the authoritative deployed Part A formula for Assistant Manager is **`ROUND(...)` (with 2 decimal places)**, NOT `ROUNDUP`.
     - Deployed Weight Split is confirmed as **60% Part A / 40% Part B** (superseding the previous 50/50 assumption in `DEC-023`).
2. **App 307 Identity Corrected:**
   - App 307 is verified as **`PMS DGM` (Deputy General Manager)** on live Kintone (Revision 579).
   - App 640 is verified as **`PMS GM` (General Manager)** on live Kintone (Revision 542).
3. **COCE / Compliance Exclusion Verified 100% in Live Active Formulas:**
   - Across all 8 legacy apps (283, 305, 307, 310, 640, 643, 715, 716), Competency 6 (`rating_1_6` / `rating_2_6`) exists on the form and is evaluated, but is **strictly omitted from `sum_rating`**.
   - Proves `Evaluated = YES`, `Included_In_Score = NO` is the active production calculation behavior.
4. **Appraiser Cardinality & Deployed Scaling Model:**
   - **Operational Apps (283, 716):** 2 Appraisers $\times$ 5 Scored Competencies $\implies \text{Denominator } = 10$.
   - **Management Apps (305, 307, 310, 643):** 2 Appraisers $\times$ 7 Scored Competencies $\implies \text{Denominator } = 14$.
   - **Executive Apps (640, 715):** 1 Appraiser $\times$ 7 Scored Competencies $\implies \text{Formula: } (\sum \text{Ratings}) \times 2 / 14$ (Equivalently $\sum / 7$).
5. **Objective Difficulty x Achievement Matrix:**
   - The 20-case nested IF matrix mapping Difficulty 1..4 $\times$ Achievement 1..5 to scores is **`MATRIX_IDENTICAL_ACROSS_APPS = 8/8 VERIFIED`** across all 8 legacy applications.
6. **5-Point vs 100-Point Score Architecture:**
   - **`Weighted_Score_5_Point`:** Intermediate sum `total_a + total_b` on a 5.0 maximum scale.
   - **`Final_Score_100_Point`:** Deployed normalized score `((total_a + total_b) * 100) / 5` on a 100-point scale.

---

## 2. Active Downstream Dependency Lineage by Application

The table below traces the exact calculation chain backward from the terminal output (`total_all`) to the raw inputs for each legacy application:

| App ID | App Name & Role | Field Code | Formula Expression | Downstream Referenced By | Usage Classification |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **283** | PMS Staff & Chief (Rev 1003) | `total_all` | `((total_a+total_b)*100)/5` | `(TERMINAL_OUTPUT)` | **`ACTIVE_SCORING_CHAIN`** |
| 283 | | `total_a` | `total_a_0` | `total_all` | **`ACTIVE_SCORING_CHAIN`** |
| 283 | | `total_a_0` | `ROUND((total_score*70)/100, 2)` | `total_a` | **`ACTIVE_SCORING_CHAIN`** |
| 283 | | `total_b` | `sum_part_b` | `total_all` | **`ACTIVE_SCORING_CHAIN`** |
| 283 | | `sum_part_b` | `ROUND(devide_10*0.3,2)` | `total_b` | **`ACTIVE_SCORING_CHAIN`** |
| 283 | | `devide_10` | `(rating_1_1..5+rating_2_1..5)/10` | `sum_part_b` | **`ACTIVE_SCORING_CHAIN`** |
| 283 | | `sum_rating` | `rating_1_1..5+rating_2_1..5` | `(Unreferenced in 283)` | **`DUPLICATE_CALC`** |
| **716** | Japan Staff (Rev 1031) | `total_all` | `((total_a+total_b)*100)/5` | `(TERMINAL_OUTPUT)` | **`ACTIVE_SCORING_CHAIN`** |
| 716 | | `total_a` | `ROUND((total_score*70)/100, 2)` | `total_all` | **`ACTIVE_SCORING_CHAIN`** |
| 716 | | `total_a_0` | `ROUND((total_score*70)/100, 2)` | `(Unreferenced in 716)` | **`DUPLICATE_CALC`** |
| 716 | | `total_b` | `sum_part_b` | `total_all` | **`ACTIVE_SCORING_CHAIN`** |
| 716 | | `sum_part_b` | `ROUND(devide_10*0.3,2)` | `total_b` | **`ACTIVE_SCORING_CHAIN`** |
| 716 | | `devide_10` | `(rating_1_1..5+rating_2_1..5)/10` | `sum_part_b` | **`ACTIVE_SCORING_CHAIN`** |
| **310** | PMS Assistant Manager (Rev 555) | `total_all` | `((total_a+total_b)*100)/5` | `(TERMINAL_OUTPUT)` | **`ACTIVE_SCORING_CHAIN`** |
| 310 | | `total_a` | `ROUND((total_score*60)/100, 2)` | `total_all` | **`ACTIVE_SCORING_CHAIN`** |
| 310 | | `total_a_0` | `ROUNDUP((total_score*60)/100, 2)` | `(Unreferenced in 310)` | **`DUPLICATE_CALC`** |
| 310 | | `total_b` | `ROUND(sum_part_b, 2)` | `total_all` | **`ACTIVE_SCORING_CHAIN`** |
| 310 | | `sum_part_b` | `ROUND(devide_10*0.4, 2)` | `total_b` | **`ACTIVE_SCORING_CHAIN`** |
| 310 | | `devide_10` | `ROUND(sum_rating/14, 2)` | `sum_part_b` | **`ACTIVE_SCORING_CHAIN`** |
| 310 | | `sum_rating` | `rating_1_1..5,7..8+rating_2_1..5,7..8` | `devide_10` | **`ACTIVE_SCORING_CHAIN`** |
| **305** | PMS Sect.Mgr (Rev 596) | `total_all` | `ROUND(((total_a+total_b)*100)/5,2)` | `(TERMINAL_OUTPUT)` | **`ACTIVE_SCORING_CHAIN`** |
| 305 | | `total_a` | `total_a_0` | `total_all` | **`ACTIVE_SCORING_CHAIN`** |
| 305 | | `total_a_0` | `ROUND((total_score*50)/100,2)` | `total_a` | **`ACTIVE_SCORING_CHAIN`** |
| 305 | | `total_b` | `sum_part_b` | `total_all` | **`ACTIVE_SCORING_CHAIN`** |
| 305 | | `sum_part_b` | `ROUND(devide_10*0.5,2)` | `total_b` | **`ACTIVE_SCORING_CHAIN`** |
| 305 | | `devide_10` | `ROUND(sum_rating/14,2)` | `sum_part_b` | **`ACTIVE_SCORING_CHAIN`** |
| 305 | | `sum_rating` | `rating_1_1..5,7..8+rating_2_1..5,7..8` | `devide_10` | **`ACTIVE_SCORING_CHAIN`** |
| **643** | PMS Senior Manager (Rev 503) | `total_all` | `ROUND(((total_a+total_b)*100)/5,2)` | `(TERMINAL_OUTPUT)` | **`ACTIVE_SCORING_CHAIN`** |
| 643 | | `total_a` | `total_a_0` | `total_all` | **`ACTIVE_SCORING_CHAIN`** |
| 643 | | `total_a_0` | `ROUND((total_score*50)/100,2)` | `total_a` | **`ACTIVE_SCORING_CHAIN`** |
| 643 | | `total_b` | `sum_part_b` | `total_all` | **`ACTIVE_SCORING_CHAIN`** |
| 643 | | `sum_part_b` | `ROUND(devide_10*0.5,2)` | `total_b` | **`ACTIVE_SCORING_CHAIN`** |
| 643 | | `devide_10` | `ROUND(sum_rating/14,2)` | `sum_part_b` | **`ACTIVE_SCORING_CHAIN`** |
| 643 | | `sum_rating` | `rating_1_1..5,7..8+rating_2_1..5,7..8` | `devide_10` | **`ACTIVE_SCORING_CHAIN`** |
| **307** | PMS DGM (Rev 579) | `total_all` | `((total_a+total_b)*100)/5` | `(TERMINAL_OUTPUT)` | **`ACTIVE_SCORING_CHAIN`** |
| 307 | | `total_a` | `total_a_0` | `total_all` | **`ACTIVE_SCORING_CHAIN`** |
| 307 | | `total_a_0` | `ROUND((total_score*50)/100,2)` | `total_a` | **`ACTIVE_SCORING_CHAIN`** |
| 307 | | `total_b` | `sum_part_b` | `total_all` | **`ACTIVE_SCORING_CHAIN`** |
| 307 | | `sum_part_b` | `ROUND(devide_10*0.5,2)` | `total_b` | **`ACTIVE_SCORING_CHAIN`** |
| 307 | | `devide_10` | `ROUND(sum_rating/14,2)` | `sum_part_b` | **`ACTIVE_SCORING_CHAIN`** |
| 307 | | `sum_rating` | `rating_1_1..5,7..8+rating_2_1..5,7..8` | `devide_10` | **`ACTIVE_SCORING_CHAIN`** |
| **640** | PMS GM (Rev 542) | `total_all` | `((total_a+total_b)*100)/5` | `(TERMINAL_OUTPUT)` | **`ACTIVE_SCORING_CHAIN`** |
| 640 | | `total_a` | `total_a_0` | `total_all` | **`ACTIVE_SCORING_CHAIN`** |
| 640 | | `total_a_0` | `ROUND((total_score*50)/100,2)` | `total_a` | **`ACTIVE_SCORING_CHAIN`** |
| 640 | | `total_b` | `sum_part_b` | `total_all` | **`ACTIVE_SCORING_CHAIN`** |
| 640 | | `sum_part_b` | `ROUND(devide_10*0.5,2)` | `total_b` | **`ACTIVE_SCORING_CHAIN`** |
| 640 | | `devide_10` | `ROUND(sum_rating/14,2)` | `sum_part_b` | **`ACTIVE_SCORING_CHAIN`** |
| 640 | | `sum_rating` | `(rating_1_1..5,7..8)*2` | `devide_10` | **`ACTIVE_SCORING_CHAIN`** |
| **715** | PMS VP (Rev 543) | `total_all` | `((total_a+total_b)*100)/5` | `(TERMINAL_OUTPUT)` | **`ACTIVE_SCORING_CHAIN`** |
| 715 | | `total_a` | `total_a_0` | `total_all` | **`ACTIVE_SCORING_CHAIN`** |
| 715 | | `total_a_0` | `ROUND((total_score*50)/100,2)` | `total_a` | **`ACTIVE_SCORING_CHAIN`** |
| 715 | | `total_b` | `sum_part_b` | `total_all` | **`ACTIVE_SCORING_CHAIN`** |
| 715 | | `sum_part_b` | `ROUND(devide_10*0.5,2)` | `total_b` | **`ACTIVE_SCORING_CHAIN`** |
| 715 | | `devide_10` | `ROUND(sum_rating/14,2)` | `sum_part_b` | **`ACTIVE_SCORING_CHAIN`** |
| 715 | | `sum_rating` | `(rating_1_1..5,7..8)*2` | `devide_10` | **`ACTIVE_SCORING_CHAIN`** |

---

## 3. Exact Rounding Function & Precision Matrix

| App ID | App Name | Part A Rounding | Part B Denom Rounding | Part B Weighted Rounding | Final Score Rounding |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **283** | PMS Staff & Chief | `ROUND(..., 2)` | `NO_EXPLICIT_ROUND` (`/10`) | `ROUND(..., 2)` | `NO_EXPLICIT_ROUND` (`((A+B)*100)/5`) |
| **716** | Japan Staff | `ROUND(..., 2)` | `NO_EXPLICIT_ROUND` (`/10`) | `ROUND(..., 2)` | `NO_EXPLICIT_ROUND` (`((A+B)*100)/5`) |
| **310** | PMS Assistant Manager | `ROUND(..., 2)` | `ROUND(..., 2)` (`/14`) | `ROUND(..., 2)` | `NO_EXPLICIT_ROUND` (`((A+B)*100)/5`) |
| **305** | PMS Sect.Mgr | `ROUND(..., 2)` | `ROUND(..., 2)` (`/14`) | `ROUND(..., 2)` | `ROUND(..., 2)` (`ROUND(((A+B)*100)/5, 2)`) |
| **643** | PMS Senior Manager | `ROUND(..., 2)` | `ROUND(..., 2)` (`/14`) | `ROUND(..., 2)` | `ROUND(..., 2)` (`ROUND(((A+B)*100)/5, 2)`) |
| **307** | PMS DGM | `ROUND(..., 2)` | `ROUND(..., 2)` (`/14`) | `ROUND(..., 2)` | `NO_EXPLICIT_ROUND` (`((A+B)*100)/5`) |
| **640** | PMS GM | `ROUND(..., 2)` | `ROUND(..., 2)` (`/14`) | `ROUND(..., 2)` | `NO_EXPLICIT_ROUND` (`((A+B)*100)/5`) |
| **715** | PMS VP | `ROUND(..., 2)` | `ROUND(..., 2)` (`/14`) | `ROUND(..., 2)` | `NO_EXPLICIT_ROUND` (`((A+B)*100)/5`) |

---

## 4. Kintone vs Prior Document Conflict Register

| Item | Prior Document Rule (`DEC-023`) | Live Deployed Kintone Truth | Conflict Classification | Resolution Action under `DEC-035` |
| :--- | :--- | :--- | :--- | :--- |
| **Assistant Manager Weights** | 50% Part A / 50% Part B (All Management = 50/50) | **60% Part A / 40% Part B** (App 310 `total_a: 60%`, `sum_part_b: 40%`) | **`KINTONE_OVERRIDES_DOC`** | `DEC-035` supersedes `DEC-023` to establish Assistant Manager as distinct 60/40 profile. |
| **App 310 Part A Rounding** | Suspected `ROUNDUP` from unreferenced `total_a_0` | **`ROUND(..., 2)`** via active downstream field `total_a` | **`KINTONE_ACTIVE_LINEAGE_CONFIRMED`** | Use `ROUND(..., 2)`; classify `total_a_0` as `DUPLICATE_CALC`. |
| **GM / VP Appraiser Cardinality** | 1–2 Appraisers generic | **1 Appraiser** evaluated, scaled via `(sum*2)/14` | **`KINTONE_OVERRIDES_DOC`** | Formalize 1-appraiser deployed model with dual-capacity architecture support. |
| **COCE Exclusion** | Rule-based exclusion | **Item 6 excluded from `sum_rating`** across 100% of apps | **`CONSISTENT`** | Confirmed by live Kintone formula lineage. |
| **Objective Score Matrix** | Generic matrix | **20-case nested IF matrix** identical across 8/8 apps | **`CONSISTENT`** | Verified `MATRIX_IDENTICAL_ACROSS_APPS = 8/8 VERIFIED`. |
