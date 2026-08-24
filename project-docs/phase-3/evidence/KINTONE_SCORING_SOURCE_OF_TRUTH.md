# Kintone Scoring Source of Truth Matrix & Lineage Audit
## Comprehensive Active Calculation Lineage across All 8 Legacy Deployed Applications

> **Governance Principle:** `SCORING_SOURCE_OF_TRUTH = LIVE_KINTONE_FIRST` (User-Confirmed Rule)  
> **Durable Decisions:** `DEC-035` (Kintone Scoring Calibration), `DEC-036` (Appraiser Weight & Completeness Governance for Part A & Part B)  
> **Source-of-Truth Priority:**  
> 1. Live Kintone Deployed Configuration (CALC expressions, active fields, JS customizations)  
> 2. Recent Kintone Discovery JSON Snapshots  
> 3. Frozen Project Decisions & Documentation  
> 4. Excel Business Artifacts (Secondary Reference for Labels/Descriptions; MUST NOT Override Kintone)  
> **Audit Date:** 2026-08-24T16:14:00+07:00  
> **Access Mode:** Strict Read-Only (`GET` only; 0 writes executed)  
> **Target Apps Audited:** 9 Apps (App 283, 305, 307, 310, 640, 643, 715, 716, 794)  

---

## 1. Executive Summary & Critical Governance Findings

1. **Part A Active Lineage & Objective Matrix Verification:**
   - **Apps 283, 716, 310, 305, 643, 307 (2 Appraisers):**
     - Active chain: `dif_level_obj` + `app1/2_achieve_obj` $\to$ `score_app1/2_obj` (20-case nested IF matrix) $\to$ `avg_score_obj = (score_app1 + score_app2) / 2` $\to$ `mbo_point_obj = (avg_score/100)*weight` $\to$ `total_score` $\to$ `total_a = ROUND((total_score * Weight_A)/100, 2)` $\to$ `total_all`.
     - Appraiser Weight in Part A: **50% / 50%**.
     - Usage: **`OBJECTIVE_MATRIX_ACTIVE_FINAL_USAGE = ACTIVE`**.
   - **Apps 640 (GM) and 715 (VP) (1 Appraiser):**
     - Live deployed formula: `mbo_point_obj = (app1_achieve_obj / 100) * weight_a_obj`.
     - `score_app1_obj` (20-case nested IF matrix) exists on the schema but is **bypassed in the active downstream formula**.
     - Usage: **`OBJECTIVE_MATRIX_PRESENT_BUT_BYPASSED_IN_ACTIVE_PART_A`**.
   - **Matrix Verification Summary:**
     - **`OBJECTIVE_MATRIX_FIELD_FORMULA = 8 / 8 VERIFIED`** (Field exists on all 8 apps with identical 20-case formula).
     - **`OBJECTIVE_MATRIX_ACTIVE_FINAL_USAGE = 6 / 8 ACTIVE, 2 / 8 PRESENT_BUT_BYPASSED`** (Apps 640 & 715 bypass matrix in production).
2. **App 283 & App 310 Part A Active Lineage:**
   - **App 283 (Staff & Chief - Rev 1003):** `total_score` $\to$ `total_a = ROUND((total_score*70)/100, 2)` $\to$ `total_all`. Field `total_a_0` is `DUPLICATE_CALC / LEGACY_UNUSED`.
   - **App 310 (Assistant Manager - Rev 555):** `total_score` $\to$ `total_a = ROUND((total_score*60)/100, 2)` $\to$ `total_all` (**60% Part A**). Field `total_a_0` is `DUPLICATE_CALC / LEGACY_UNUSED`.
3. **Appraiser Weight & Completeness Governance (`DEC-036`):**
   - Universal application to **BOTH Part A and Part B**.
   - $K_{\text{expected}} = 1 \implies 100\%$; $K_{\text{expected}} = 2 \implies 50\% / 50\%$.
   - Completeness Gate: Final score blocked with `APPRAISER_RATING_INCOMPLETE` until both Part A and Part B ratings are complete. No automatic weight redistribution.
4. **COCE / Compliance Exclusion Verified 100% in Live Active Formulas:**
   - Across all 8 legacy apps (283, 305, 307, 310, 640, 643, 715, 716), Competency 6 (`rating_1_6` / `rating_2_6`) is evaluated but **strictly omitted from `sum_rating` / `devide_10`**.

---

## 2. Active Downstream Dependency Lineage by Application

| App ID | App Name & Role | Scoring Section | Field Code | Formula Expression | Downstream Referenced By | Usage Classification |
| :---: | :--- | :---: | :--- | :--- | :--- | :--- |
| **283** | PMS Staff & Chief (Rev 1003) | **Part A** | `total_all` | `((total_a+total_b)*100)/5` | `(TERMINAL_OUTPUT)` | **`ACTIVE_SCORING_CHAIN`** |
| 283 | | **Part A** | `total_a` | `ROUND((total_score*70)/100, 2)` | `total_all` | **`ACTIVE_SCORING_CHAIN`** |
| 283 | | **Part A** | `total_a_0` | `ROUND((total_score*70)/100, 2)` | `(Unreferenced)` | **`DUPLICATE_CALC / LEGACY_UNUSED`** |
| 283 | | **Part A** | `total_score` | `sum(mbo_point_obj1..4)` | `total_a` | **`ACTIVE_SCORING_CHAIN`** |
| 283 | | **Part A** | `mbo_point_obj1` | `(avg_score_obj1/100)*weight_a_obj1` | `total_score` | **`ACTIVE_SCORING_CHAIN`** |
| 283 | | **Part A** | `avg_score_obj1` | `(score_app1_obj1+score_app2_obj1)/2` | `mbo_point_obj1` | **`ACTIVE_SCORING_CHAIN`** |
| 283 | | **Part A** | `score_app1/2_obj1` | `20-case nested IF matrix` | `avg_score_obj1` | **`ACTIVE_SCORING_CHAIN`** |
| 283 | | **Part B** | `total_b` | `sum_part_b` | `total_all` | **`ACTIVE_SCORING_CHAIN`** |
| 283 | | **Part B** | `sum_part_b` | `ROUND(devide_10*0.3, 2)` | `total_b` | **`ACTIVE_SCORING_CHAIN`** |
| 283 | | **Part B** | `devide_10` | `(rating_1_1..5+rating_2_1..5)/10` | `sum_part_b` | **`ACTIVE_SCORING_CHAIN`** |
| 283 | | **Part B** | `sum_rating` | `rating_1_1..5+rating_2_1..5` | `(Unreferenced)` | **`DUPLICATE_CALC / SUPPORTING_DISPLAY`** |
| **716** | Japan Staff (Rev 1031) | **Part A** | `total_a` | `ROUND((total_score*70)/100, 2)` | `total_all` | **`ACTIVE_SCORING_CHAIN`** |
| 716 | | **Part A** | `avg_score_obj1` | `(score_app1_obj1+score_app2_obj1)/2` | `mbo_point_obj1` | **`ACTIVE_SCORING_CHAIN`** |
| 716 | | **Part B** | `devide_10` | `(rating_1_1..5+rating_2_1..5)/10` | `sum_part_b` | **`ACTIVE_SCORING_CHAIN`** |
| **310** | PMS Assistant Manager (Rev 555) | **Part A** | `total_a` | `ROUND((total_score*60)/100, 2)` | `total_all` | **`ACTIVE_SCORING_CHAIN`** |
| 310 | | **Part A** | `total_a_0` | `ROUNDUP((total_score*60)/100, 2)` | `(Unreferenced)` | **`DUPLICATE_CALC / LEGACY_UNUSED`** |
| 310 | | **Part A** | `avg_score_obj1` | `(score_app1_obj1+score_app2_obj1)/2` | `mbo_point_obj1` | **`ACTIVE_SCORING_CHAIN`** |
| 310 | | **Part B** | `sum_part_b` | `ROUND(devide_10*0.4, 2)` | `total_b` | **`ACTIVE_SCORING_CHAIN`** |
| 310 | | **Part B** | `devide_10` | `ROUND(sum_rating/14, 2)` | `sum_part_b` | **`ACTIVE_SCORING_CHAIN`** |
| **305** | PMS Sect.Mgr (Rev 596) | **Part A** | `total_a_0` | `ROUND((total_score*50)/100, 2)` | `total_a` | **`ACTIVE_SCORING_CHAIN`** |
| 305 | | **Part A** | `avg_score_obj1` | `(score_app1_obj1+score_app2_obj1)/2` | `mbo_point_obj1` | **`ACTIVE_SCORING_CHAIN`** |
| 305 | | **Part B** | `sum_part_b` | `ROUND(devide_10*0.5, 2)` | `total_b` | **`ACTIVE_SCORING_CHAIN`** |
| 305 | | **Part B** | `devide_10` | `ROUND(sum_rating/14, 2)` | `sum_part_b` | **`ACTIVE_SCORING_CHAIN`** |
| **643** | PMS Senior Manager (Rev 503) | **Part A** | `total_a_0` | `ROUND((total_score*50)/100, 2)` | `total_a` | **`ACTIVE_SCORING_CHAIN`** |
| 643 | | **Part A** | `avg_score_obj1` | `(score_app1_obj1+score_app2_obj1)/2` | `mbo_point_obj1` | **`ACTIVE_SCORING_CHAIN`** |
| 643 | | **Part B** | `sum_part_b` | `ROUND(devide_10*0.5, 2)` | `total_b` | **`ACTIVE_SCORING_CHAIN`** |
| 643 | | **Part B** | `devide_10` | `ROUND(sum_rating/14, 2)` | `sum_part_b` | **`ACTIVE_SCORING_CHAIN`** |
| **307** | PMS DGM (Rev 579) | **Part A** | `total_a_0` | `ROUND((total_score*50)/100, 2)` | `total_a` | **`ACTIVE_SCORING_CHAIN`** |
| 307 | | **Part A** | `avg_score_obj1` | `(score_app1_obj1+score_app2_obj1)/2` | `mbo_point_obj1` | **`ACTIVE_SCORING_CHAIN`** |
| 307 | | **Part B** | `sum_part_b` | `ROUND(devide_10*0.5, 2)` | `total_b` | **`ACTIVE_SCORING_CHAIN`** |
| 307 | | **Part B** | `devide_10` | `ROUND(sum_rating/14, 2)` | `sum_part_b` | **`ACTIVE_SCORING_CHAIN`** |
| **640** | PMS GM (Rev 542) | **Part A** | `mbo_point_obj1` | `(app1_achieve_obj1/100)*weight_a_obj1` | `total_score` | **`ACTIVE_SCORING_CHAIN`** |
| 640 | | **Part A** | `score_app1_obj1` | `20-case nested IF matrix` | `(Unreferenced)` | **`PRESENT_BUT_BYPASSED_IN_ACTIVE_PART_A`** |
| 640 | | **Part A** | `total_a_0` | `ROUND((total_score*50)/100, 2)` | `total_a` | **`ACTIVE_SCORING_CHAIN`** |
| 640 | | **Part B** | `sum_rating` | `(rating_1_1..5,7..8)*2` | `devide_10` | **`ACTIVE_SCORING_CHAIN`** |
| 640 | | **Part B** | `devide_10` | `ROUND(sum_rating/14, 2)` | `sum_part_b` | **`ACTIVE_SCORING_CHAIN`** |
| **715** | PMS VP (Rev 543) | **Part A** | `mbo_point_obj1` | `(app1_achieve_obj1/100)*weight_a_obj1` | `total_score` | **`ACTIVE_SCORING_CHAIN`** |
| 715 | | **Part A** | `score_app1_obj1` | `20-case nested IF matrix` | `(Unreferenced)` | **`PRESENT_BUT_BYPASSED_IN_ACTIVE_PART_A`** |
| 715 | | **Part A** | `total_a_0` | `ROUND((total_score*50)/100, 2)` | `total_a` | **`ACTIVE_SCORING_CHAIN`** |
| 715 | | **Part B** | `sum_rating` | `(rating_1_1..5,7..8)*2` | `devide_10` | **`ACTIVE_SCORING_CHAIN`** |
| 715 | | **Part B** | `devide_10` | `ROUND(sum_rating/14, 2)` | `sum_part_b` | **`ACTIVE_SCORING_CHAIN`** |

---

## 3. Objective Matrix Verification & Deployed Usage

* **Field Existence:** The 20-case nested IF Difficulty $\times$ Achievement matrix field (`score_app1_obj1`) is defined across **8/8 legacy applications**.
* **Active Downstream Usage:**
  - **Operational & Management (Apps 283, 716, 310, 305, 643, 307):** **`ACTIVE`** $\implies$ `score_app1` and `score_app2` are averaged (`(score1+score2)/2`) to derive `mbo_point`.
  - **Executive (Apps 640, 715):** **`PRESENT_BUT_BYPASSED`** $\implies$ `mbo_point` is calculated directly from `app1_achieve_obj`.
* **Governance Rule:** Do NOT silently standardize GM/VP Part A. Preserve current live Kintone behavior as baseline truth.
