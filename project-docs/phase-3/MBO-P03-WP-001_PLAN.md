# Work Package Implementation Plan: MBO-P03-WP-001
## EVALUATION PROFILE & COMPETENCY CONFIGURATION FOUNDATION
### Frozen Architecture Reconciliation & Authoritative Evidence Baseline

> **Document Type:** Authoritative Repository Implementation Plan  
> **Phase:** `Phase 3: Evaluation Profile, Competency & Scoring Engine`  
> **Work Package ID:** `MBO-P03-WP-001`  
> **Plan Gate Status:** `PLAN_GATE: READY FOR INDEPENDENT REVIEW`  
> **Durable Governance:** `DEC-035 (SCORING_SOURCE_OF_TRUTH = LIVE_KINTONE_FIRST)`  
> **Authoritative Phase 2 Baseline:** Commit `8fb306e` (Passed Implementation & Review Gates)  
> **Kintone Write Operations in Planning:** `0 (Strict Read-Only Mode Active)`  

---

## 1. Executive Summary & Purpose

The purpose of **`MBO-P03-WP-001`** is to establish the authoritative, configuration-driven **Evaluation Profile, Competency & Scoring Configuration Foundation** for MBO 2026. This plan formally reconciles:
1. **The 4 Canonical Profile Families & Distinct Scoring Configurations (`DEC-023`, `DEC-035`):**
   - **`PROFILE_STAFF_CHIEF`** (Staff & Chief) $\implies$ **70% Part A / 30% Part B**, 2 Appraisers, Denominator 10 (`COMP_SET_OPERATIONAL_V1`).
   - **`PROFILE_JAPANESE_STAFF`** (Japanese Staff) $\implies$ **70% Part A / 30% Part B**, 2 Appraisers, Denominator 10 (`COMP_SET_OPERATIONAL_V1`).
   - **`PROFILE_MANAGEMENT`** (Contains two distinct scoring configurations):
     - **Assistant Manager:** **`60% Part A / 40% Part B`**, 2 Appraisers, Denominator 14 (`COMP_SET_MANAGEMENT_V1`) $\implies$ Verified live Kintone App 310 truth (`DEC-035`).
     - **Section Manager, Senior Manager, Deputy General Manager (DGM):** **`50% Part A / 50% Part B`**, 2 Appraisers, Denominator 14 (`COMP_SET_MANAGEMENT_V1`).
   - **`PROFILE_EXECUTIVE`** (General Manager, Vice President): **`50% Part A / 50% Part B`**, **`CURRENT_DEPLOYED_BASELINE = 1 Appraiser`** (scaled via $(sum \times 2)/14$), `FUTURE_CAPACITY = 1..2` (`COMP_SET_MANAGEMENT_V1`).
2. **Two Distinct Competency Sets (`COMPETENCY_ARCHITECTURE.md`):**
   - **Operational Competency Set (`COMP_SET_OPERATIONAL_V1`):** 6 items displayed (5 scored + 1 COCE gate). $N_{\text{included}} = 5$.
   - **Management & Executive Competency Set (`COMP_SET_MANAGEMENT_V1`):** 8 items displayed (7 scored including Leadership and Strategy/Coaching + 1 COCE gate). $N_{\text{included}} = 7$.
3. **Configuration-Driven Dynamic COCE Exclusion:**
   - Compliance / COCE is evaluated across all profiles (`Evaluated = YES`), but configured with `Included_In_Score = false`. The scoring engine dynamically derives the denominator $N_{\text{included}} = \text{count}(\text{competencies where } \text{Included\_In\_Score} == \text{true})$, strictly avoiding global $N=5$ or hardcoded index 6 exclusions.
4. **5-Point Weighted Score vs 100-Point Normalized Final Score:**
   - **`Weighted_Score_5_Point`:** Intermediate sum $\text{Part A Weighted} + \text{Part B Weighted}$ on a 5.0 scale.
   - **`Final_Score_100_Point`:** Deployed normalized score $((\text{Part A Weighted} + \text{Part B Weighted}) \times 100) / 5$ on a 100-point scale.
5. **Appraiser Completeness Contract ($K_{\text{expected}}$):**
   - For future execution, scoring requires $K_{\text{valid}} == K_{\text{expected}}$ from configuration. Incomplete ratings fail closed with `APPRAISER_RATING_INCOMPLETE`.
6. **Annual Profile Freeze Rule (`DEC-024`):**
   - Profile resolved once at Annual Record Initialization and frozen for the entire Fiscal Year, decoupled from stage routing.

---

## 2. Profile Hierarchy: 8 Evaluation Groups to 4 Profile Families

| Evaluation Group | Profile Family | Applicable Competency Set | Displayed Items | Included Items ($N_{\text{included}}$) | Part A Weight (%) | Part B Weight (%) | Current Deployed Appraisers ($K_{\text{expected}}$) | Authoritative Evidence |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Staff & Chief** | `PROFILE_STAFF_CHIEF` | `COMP_SET_OPERATIONAL_V1` | 6 | **5** | **70%** | **30%** | 2 | App 283 (Rev 1003) / DEC-035 |
| **Japanese Staff** | `PROFILE_JAPANESE_STAFF`| `COMP_SET_OPERATIONAL_V1` | 6 | **5** | **70%** | **30%** | 2 | App 716 (Rev 1031) / DEC-035 |
| **Assistant Manager**| `PROFILE_MANAGEMENT` | `COMP_SET_MANAGEMENT_V1` | 8 | **7** | **60%** | **40%** | 2 | App 310 (Rev 555: 60/40) / DEC-035 |
| **Section Manager** | `PROFILE_MANAGEMENT` | `COMP_SET_MANAGEMENT_V1` | 8 | **7** | **50%** | **50%** | 2 | App 305 (Rev 596) / DEC-023 |
| **Senior Manager** | `PROFILE_MANAGEMENT` | `COMP_SET_MANAGEMENT_V1` | 8 | **7** | **50%** | **50%** | 2 | App 643 (Rev 503) / DEC-023 |
| **Deputy General Mgr**| `PROFILE_MANAGEMENT` | `COMP_SET_MANAGEMENT_V1` | 8 | **7** | **50%** | **50%** | 2 | App 307 (Rev 579: PMS DGM) |
| **General Manager** | `PROFILE_EXECUTIVE` | `COMP_SET_MANAGEMENT_V1` | 8 | **7** | **50%** | **50%** | **1** (Capacity: 1..2) | App 640 (Rev 542) / DEC-035 |
| **Vice President** | `PROFILE_EXECUTIVE` | `COMP_SET_MANAGEMENT_V1` | 8 | **7** | **50%** | **50%** | **1** (Capacity: 1..2) | App 715 (Rev 543) / DEC-035 |

---

## 3. Master Competency Inventory by Competency Set

### Set A: Operational Competency Set (`COMP_SET_OPERATIONAL_V1`)
*Applicable Profile Families:* `PROFILE_STAFF_CHIEF`, `PROFILE_JAPANESE_STAFF`

| Seq | Competency Code | Name (TH) | Name (EN) | Rating Min | Rating Max | Included In Score | Required | Source Type | Authoritative Source File / App | Evidence Status |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :--- | :--- | :---: |
| 1 | `COMP_ADAPT` | ความสามารถในการปรับตัว | Adaptability | 1 | 5 | **`true`** | Yes | `EXCEL_AND_APP` | `exp/PMS_Staff & Chief_PART_B.xlsx` / App 283 / App 794 | **VERIFIED** |
| 2 | `COMP_PROB` | การแก้ไขปัญหา | Problem Solving | 1 | 5 | **`true`** | Yes | `EXCEL_AND_APP` | `exp/PMS_Staff & Chief_PART_B.xlsx` / App 283 / App 794 | **VERIFIED** |
| 3 | `COMP_CUST` | การมุ่งเน้นลูกค้า | Customer Focus | 1 | 5 | **`true`** | Yes | `EXCEL_AND_APP` | `exp/PMS_Staff & Chief_PART_B.xlsx` / App 283 / App 794 | **VERIFIED** |
| 4 | `COMP_VALUE` | การสร้างคุณค่าและความคิดริเริ่ม | Value Creation | 1 | 5 | **`true`** | Yes | `EXCEL_AND_APP` | `exp/PMS_Staff & Chief_PART_B.xlsx` / App 283 / App 794 | **VERIFIED** |
| 5 | `COMP_SAFETY`| ความตระหนักด้านความปลอดภัย | Safety Awareness | 1 | 5 | **`true`** | Yes | `EXCEL_AND_APP` | `exp/PMS_Staff & Chief_PART_B.xlsx` / App 283 / App 794 | **VERIFIED** |
| 6 | `COMP_COCE` | จรรยาบรรณและการปฏิบัติตามกฎ | Compliance / COCE | 1 | 5 | **`false`** | Yes | `EXCEL_AND_APP` | `exp/PMS_Staff & Chief_PART_B.xlsx` / App 283 / App 794 | **VERIFIED** |

### Set B: Management & Executive Competency Set (`COMP_SET_MANAGEMENT_V1`)
*Applicable Profile Families:* `PROFILE_MANAGEMENT`, `PROFILE_EXECUTIVE`

| Seq | Competency Code | Name (TH) | Name (EN) | Rating Min | Rating Max | Included In Score | Required | Source Type | Authoritative Source File / App | Evidence Status |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :--- | :--- | :---: |
| 1 | `COMP_ADAPT` | ความสามารถในการปรับตัว | Adaptability | 1 | 5 | **`true`** | Yes | `EXCEL_AND_APP` | `info app/305/PMS Asst.Sect.Mgr_Part_B.xlsx` / App 305 | **VERIFIED** |
| 2 | `COMP_PROB` | การแก้ไขปัญหา | Problem Solving | 1 | 5 | **`true`** | Yes | `EXCEL_AND_APP` | `info app/305/PMS Asst.Sect.Mgr_Part_B.xlsx` / App 305 | **VERIFIED** |
| 3 | `COMP_CUST` | การมุ่งเน้นลูกค้า | Customer Focus | 1 | 5 | **`true`** | Yes | `EXCEL_AND_APP` | `info app/305/PMS Asst.Sect.Mgr_Part_B.xlsx` / App 305 | **VERIFIED** |
| 4 | `COMP_VALUE` | การสร้างคุณค่าและความคิดริเริ่ม | Value Creation | 1 | 5 | **`true`** | Yes | `EXCEL_AND_APP` | `info app/305/PMS Asst.Sect.Mgr_Part_B.xlsx` / App 305 | **VERIFIED** |
| 5 | `COMP_SAFETY`| ความตระหนักด้านความปลอดภัย | Safety Awareness | 1 | 5 | **`true`** | Yes | `EXCEL_AND_APP` | `info app/305/PMS Asst.Sect.Mgr_Part_B.xlsx` / App 305 | **VERIFIED** |
| 6 | `COMP_COCE` | จรรยาบรรณและการปฏิบัติตามกฎ | Compliance / COCE | 1 | 5 | **`false`** | Yes | `EXCEL_AND_APP` | `info app/305/PMS Asst.Sect.Mgr_Part_B.xlsx` / App 305 | **VERIFIED** |
| 7 | `COMP_LEAD` | ภาวะผู้นำและการบริหารคน | Leadership & People Mgmt | 1 | 5 | **`true`** | Yes | `EXCEL_AND_APP` | `info app/305`, `info app/643`, `COMPETENCY_ARCHITECTURE.md` | **VERIFIED** |
| 8 | `COMP_STRAT`| การวางแผนกลยุทธ์และการสอนงาน | Strategy & Coaching | 1 | 5 | **`true`** | Yes | `EXCEL_AND_APP` | `info app/305`, `info app/643`, `COMPETENCY_ARCHITECTURE.md` | **VERIFIED** |

---

## 4. Scoring Mathematical Model & Appraiser Cardinality

### A. Current Deployed Kintone Truth vs Future Configuration Model
* **Current Deployed Truth (`DEC-035`):**
  - Operational (283, 716): $K=2, N=5 \implies \text{Denom } = 10$
  - Assistant Manager (310): $K=2, N=7 \implies \text{Denom } = 14$, Split = 60/40
  - Section Manager, Senior Manager, DGM (305, 643, 307): $K=2, N=7 \implies \text{Denom } = 14$, Split = 50/50
  - GM, VP (640, 715): $K=1, N=7 \implies (\sum \times 2) / 14$, Split = 50/50
* **Future Parameterized Engine Formulation:**
  - Dynamic Denominator: $N_{\text{included}} = \text{count}(\text{Included\_In\_Score} == \text{true})$
  - Completeness Contract: $K_{\text{valid}} == K_{\text{expected}}$ required before scoring calculation
  - Part A Weighted Score: $\text{ROUND}((\text{Part A Raw} \times \text{Part\_A\_Weight}) / 100, 2)$
  - Part B Weighted Score: $\text{ROUND}(\text{Part B Raw} \times (\text{Part\_B\_Weight} / 100), 2)$
  - Intermediate 5-Point Score: $\text{Weighted\_Score\_5\_Point} = \text{Part A Weighted} + \text{Part B Weighted}$
  - Final 100-Point Normalized Score: $\text{Final\_Score\_100\_Point} = ((\text{Weighted\_Score\_5\_Point}) \times 100) / 5$

---

## 5. Live App 794 Field Manifest & Unresolved Governance Gaps

| Field Code | Live Exists | Repo Spec Exists | Field Type | Classification | Future Action / Unresolved Gap Status |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `Evaluation_Profile_Code` | No | Yes | `SINGLE_LINE_TEXT` | **`MISSING_TARGET_FIELD`** | OPEN: Target field for Phase 3 write manifest |
| `Profile_Family` | No | Yes | `SINGLE_LINE_TEXT` | **`MISSING_TARGET_FIELD`** | OPEN: Target field for Phase 3 write manifest |
| `PartA_Weight` | No | Yes | `NUMBER` | **`MISSING_TARGET_FIELD`** | OPEN: Target field for Phase 3 write manifest |
| `PartB_Weight` | No | Yes | `NUMBER` | **`MISSING_TARGET_FIELD`** | OPEN: Target field for Phase 3 write manifest |
| `PartA_Raw_Score` | Yes | Yes | `CALC` | **`KEEP`** | Verified Tier D formula |
| `PartA_Weighted_Score` | Yes | Yes | `CALC` | **`SCHEMA_DRIFT`** | OPEN: Hardcoded 70% in live formula |
| `PartB_Raw_Score` | Yes | Yes | `CALC` | **`SCHEMA_DRIFT`** | OPEN: Hardcoded /5 in live formula |
| `PartB_Weighted_Score` | Yes | Yes | `CALC` | **`SCHEMA_DRIFT`** | OPEN: Hardcoded 30% in live formula |
| `Final_Confidential_Score`| Yes | Yes | `CALC` | **`REUSE / MIGRATE`** | OPEN: Normalization to 100-point index |
| `Competency_Result_1..6` | Yes | Yes | `CALC` | **`KEEP`** | Verified Tier D formula |
| `Competency_Criteria_1..6`| Yes | Yes | `MULTI_LINE_TEXT` | **`KEEP`** | Populated at initialization |
| `Manager_Competency_Rating_1..6`| Yes | Yes | `NUMBER` | **`KEEP`** | Native Permission Gated |
| `GM_Competency_Rating_1..6` | Yes | Yes | `NUMBER` | **`KEEP`** | Native Permission Gated |
| `Competency_Result_7..8` | **No** | Yes | `CALC` | **`MISSING_TARGET_FIELD`** | OPEN: Required for 8-item Management set |
| `Competency_Criteria_7..8`| **No** | Yes | `MULTI_LINE_TEXT` | **`MISSING_TARGET_FIELD`** | OPEN: Required for 8-item Management set |
| `Manager_Competency_Rating_7..8`| **No**| Yes | `NUMBER` | **`MISSING_TARGET_FIELD`** | OPEN: Required for 8-item Management set |
| `GM_Competency_Rating_7..8` | **No** | Yes | `NUMBER` | **`MISSING_TARGET_FIELD`** | OPEN: Required for 8-item Management set |

---

## 6. Profile Configuration Storage Decision Status
* **Status:** **`PROFILE_CONFIGURATION_STORAGE = DECISION_REQUIRED`**
* **Critical Business Question Count:** **`1`** (User selection between Option A Repository Config, Option B Dedicated App, or Option C Hybrid).
