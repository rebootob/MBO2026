# Work Package Implementation Plan: MBO-P03-WP-001
## EVALUATION PROFILE & COMPETENCY CONFIGURATION FOUNDATION
### Comprehensive Architecture Plan & Schema Manifest Audit

> **Document Type:** Authoritative Repository Implementation Plan  
> **Phase:** `Phase 3: Evaluation Profile, Competency & Scoring Engine`  
> **Work Package ID:** `MBO-P03-WP-001`  
> **Plan Gate Status:** `PLAN_GATE: READY FOR INDEPENDENT REVIEW`  
> **Scoring Governance:** `DEC-035 (SCORING_SOURCE_OF_TRUTH = LIVE_KINTONE_FIRST)`  
> **Authoritative Phase 2 Baseline:** Commit `8fb306e` (Passed Implementation & Review Gates)  
> **Kintone Write Operations in Planning:** `0 (Strict Read-Only Mode Active)`  
> **Evidence Matrices:**  
> - Scoring Truth & Active Lineage: [`project-docs/phase-3/evidence/KINTONE_SCORING_SOURCE_OF_TRUTH.md`](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/project-docs/phase-3/evidence/KINTONE_SCORING_SOURCE_OF_TRUTH.md)  
> - Position Mapping Inventory: [`project-docs/phase-3/evidence/POSITION_PROFILE_EVIDENCE.md`](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/project-docs/phase-3/evidence/POSITION_PROFILE_EVIDENCE.md)  
> - Competency Definitions: [`project-docs/phase-3/evidence/COMPETENCY_SOURCE_EVIDENCE.md`](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/project-docs/phase-3/evidence/COMPETENCY_SOURCE_EVIDENCE.md)  

---

## 1. Purpose
Establish the authoritative, configuration-driven foundation for Evaluation Profiles, Competency Sets, and Scoring Lineage for MBO 2026. This plan formally reconciles business rules, position mappings, appraiser cardinality, COCE exclusion, and schema requirements prior to any Phase 3 implementation or Kintone writes.

---

## 2. Approved Scope
1. Define the 4 canonical Profile Families (`PROFILE_STAFF_CHIEF`, `PROFILE_JAPANESE_STAFF`, `PROFILE_MANAGEMENT`, `PROFILE_EXECUTIVE`) and their distinct scoring configurations.
2. Formalize the 2 standard Competency Sets: Operational (6 items, $N_{\text{included}}=5$) and Management/Executive (8 items, $N_{\text{included}}=7$).
3. Establish dynamic COCE gate calculation ($N_{\text{included}} = \text{count}(\text{Included\_In\_Score} == \text{true})$) where COCE is evaluated but excluded from scored points.
4. Establish the Appraiser Completeness Contract ($K_{\text{valid}} == K_{\text{expected}}$).
5. Audit and categorize all App 794 fields against live deployed schema and repository specification (`config/schema-spec.js`).
6. Present the Profile Configuration Storage trade-off options for user decision.

---

## 3. Out of Scope
1. Any Kintone write operations (App 794 schema changes, record creation, app creation) $\implies$ Strictly 0 writes in WP-001.
2. Phase 3 JavaScript implementation (deferred to execution work packages).
3. Phase 4 Hoshin dual-level gating.
4. Phase 5 Enterprise App 795 seeding.

---

## 4. Affected Repository & Potential Kintone Components

### Repository Components (To be created / updated in execution phase)
* `src/scoring/` (Future scoring calculation engine & validators)
* `src/profiles/` (Future profile resolution & configuration loader)
* `config/schema-spec.js` (Target schema synchronization)
* `tests/unit/` (Unit test suite for profiles and scoring math)

### Potential Kintone Components (Target App 794)
* Native form fields: `Evaluation_Profile_Code`, `Profile_Family`, `PartA_Weight`, `PartB_Weight`.
* Native competency fields: `Competency_Result_7..8`, `Competency_Criteria_7..8`, `Manager_Competency_Rating_7..8`, `GM_Competency_Rating_7..8`.
* Native CALC formula updates for Part A & Part B weighted scores.

---

## 5. Business Rules & Governance Invariants

1. **`DEC-035: SCORING_SOURCE_OF_TRUTH = LIVE_KINTONE_FIRST`:** Live deployed Kintone configuration is primary truth for scoring formulas, weights, appraiser models, and rounding.
2. **`DEC-024: Annual Profile Freeze`:** Evaluation profile is resolved once at Annual Record Initialization and frozen for the full Fiscal Year.
3. **`DEC-023: Evaluation Profile Architecture`:** 4 Profile Families, configuration-driven master, hybrid storage.

---

## 6. Position Resolution & Profile Family Hierarchy

### 8 Evaluation Groups mapped to 4 Profile Families:
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

*Note on Position Resolution:* All 63 raw position strings in App 53 are audited in [`POSITION_PROFILE_EVIDENCE.md`](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/project-docs/phase-3/evidence/POSITION_PROFILE_EVIDENCE.md). Unknown/empty positions fail closed (`PROFILE_SOURCE_INVALID`).

---

## 7. Scoring Mathematical Model & Lineage

### A. Current Deployed Kintone Truth vs Future Model
* **Operational (283, 716):** 70/30 Split, 2 Appraisers, Denominator 10 (`(sum)/10`).
* **Assistant Manager (310):** 60/40 Split, 2 Appraisers, Denominator 14 (`ROUND(sum/14, 2)`).
* **Section Manager / Senior Manager / DGM (305, 643, 307):** 50/50 Split, 2 Appraisers, Denominator 14 (`ROUND(sum/14, 2)`).
* **GM / VP (640, 715):** 50/50 Split, 1 Deployed Appraiser, Denominator 14 (`ROUND((sum*2)/14, 2)`).

### B. Mathematical Formulas
* **Part A Weighted Score:** $\text{PartA\_Weighted} = \text{ROUND}((\text{Part A Raw} \times \text{Part\_A\_Weight}) / 100, 2)$
* **Part B Weighted Score:** $\text{PartB\_Weighted} = \text{ROUND}(\text{Part B Raw} \times (\text{Part\_B\_Weight} / 100), 2)$
* **Intermediate 5-Point Weighted Score:** $\text{Weighted\_Score\_5\_Point} = \text{PartA\_Weighted} + \text{PartB\_Weighted}$
* **Final 100-Point Normalized Score:** $\text{Final\_Score\_100\_Point} = ((\text{Weighted\_Score\_5\_Point}) \times 100) / 5$
* **Objective Difficulty x Achievement Matrix:** 20-case nested IF matrix verified identical across 8/8 apps (`MATRIX_IDENTICAL_ACROSS_APPS = 8 / 8 VERIFIED`).

---

## 8. App 794 Field Manifest & Gap Analysis

| Field Code | Live Exists | Repo Spec Exists | Field Type | Classification | Gap Nature / Action |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `Evaluation_Profile_Code` | No | No | `SINGLE_LINE_TEXT` | **`MISSING_TARGET_FIELD`** | `LIVE_SCHEMA_GAP` & `REPOSITORY_SCHEMA_SPEC_GAP` |
| `Profile_Family` | No | No | `SINGLE_LINE_TEXT` | **`MISSING_TARGET_FIELD`** | `LIVE_SCHEMA_GAP` & `REPOSITORY_SCHEMA_SPEC_GAP` |
| `PartA_Weight` | No | No | `NUMBER` | **`MISSING_TARGET_FIELD`** | `LIVE_SCHEMA_GAP` & `REPOSITORY_SCHEMA_SPEC_GAP` |
| `PartB_Weight` | No | No | `NUMBER` | **`MISSING_TARGET_FIELD`** | `LIVE_SCHEMA_GAP` & `REPOSITORY_SCHEMA_SPEC_GAP` |
| `PartA_Raw_Score` | Yes | Yes | `CALC` | **`KEEP`** | Deployed & Spec Synchronized |
| `PartA_Weighted_Score` | Yes | Yes | `CALC` | **`SCHEMA_DRIFT`** | Hardcoded 70% in Live & Spec |
| `PartB_Raw_Score` | Yes | Yes | `CALC` | **`SCHEMA_DRIFT`** | Hardcoded /5 in Live & Spec |
| `PartB_Weighted_Score` | Yes | Yes | `CALC` | **`SCHEMA_DRIFT`** | Hardcoded 30% in Live & Spec |
| `Final_Confidential_Score`| Yes | Yes | `CALC` | **`REUSE`** | Deployed formula normalizes $(A+B) \times 100 / 5$ |
| `Competency_Result_1..6` | Yes | **No** | `CALC` | **`KEEP`** | `REPOSITORY_SCHEMA_SPEC_GAP` (Missing from repo spec) |
| `Competency_Criteria_1..6`| Yes | **No** | `MULTI_LINE_TEXT` | **`KEEP`** | `REPOSITORY_SCHEMA_SPEC_GAP` (Missing from repo spec) |
| `Manager_Competency_Rating_1..6`| Yes | **No** | `NUMBER` | **`KEEP`** | `REPOSITORY_SCHEMA_SPEC_GAP` (Missing from repo spec) |
| `GM_Competency_Rating_1..6` | Yes | **No** | `NUMBER` | **`KEEP`** | `REPOSITORY_SCHEMA_SPEC_GAP` (Missing from repo spec) |
| `Competency_Result_7..8` | **No** | **No** | `CALC` | **`MISSING_TARGET_FIELD`** | `LIVE_SCHEMA_GAP` & `REPOSITORY_SCHEMA_SPEC_GAP` |
| `Competency_Criteria_7..8`| **No** | **No** | `MULTI_LINE_TEXT` | **`MISSING_TARGET_FIELD`** | `LIVE_SCHEMA_GAP` & `REPOSITORY_SCHEMA_SPEC_GAP` |
| `Manager_Competency_Rating_7..8`| **No**| **No** | `NUMBER` | **`MISSING_TARGET_FIELD`** | `LIVE_SCHEMA_GAP` & `REPOSITORY_SCHEMA_SPEC_GAP` |
| `GM_Competency_Rating_7..8` | **No** | **No** | `NUMBER` | **`MISSING_TARGET_FIELD`** | `LIVE_SCHEMA_GAP` & `REPOSITORY_SCHEMA_SPEC_GAP` |

---

## 9. Security Impact & Confidentiality Model
* **Confidential Scoring Isolation:** Native Kintone Field Permissions enforce that employees and shared requesters cannot view Manager/GM objective scores, competency ratings, comments, or intermediate/final confidential scores.
* **Security Boundary:** Native Kintone Permissions form the authoritative security perimeter; JavaScript/CSS is UX-only.

---

## 10. Risk Management
| Risk ID | Description | Severity | Mitigation Strategy |
| :--- | :--- | :---: | :--- |
| `RSK-P03-01` | Missing position string causes initialization failure | Medium | Fail closed with `PROFILE_SOURCE_INVALID`; notify HR administrator. |
| `RSK-P03-02` | Appraiser evaluation incomplete at submission | High | Enforce $K_{\text{valid}} == K_{\text{expected}}$ before score computation. |
| `RSK-P03-03` | Schema drift in App 794 formulas | Medium | Synchronize `config/schema-spec.js` and App 794 schema in execution phase. |

---

## 11. Change Manifest (Current vs Proposed Future)
* **Current Task Change Manifest:** **`NONE (Documentation / Planning Only; 0 Kintone Writes)`**.
* **Proposed Future Execution Manifest:**
  - Add missing profile snapshot and competency 7..8 fields to `config/schema-spec.js` and App 794.
  - Deploy dynamic formula engines for Part A and Part B weighted scores.

---

## 12. Future Test Matrix Plan (Future Execution Phase)
1. `test_profile_mapping_operational_70_30`: Verify Staff/Japan map to 70/30 split.
2. `test_profile_mapping_asst_mgr_60_40`: Verify Assistant Manager maps to 60/40 split.
3. `test_profile_mapping_mgmt_50_50`: Verify Sect/Snr/DGM map to 50/50 split.
4. `test_appraiser_cardinality_exec_1`: Verify GM/VP deployed baseline of 1 appraiser scaled via $(sum \times 2)/14$.
5. `test_coce_excluded_dynamic_denominator`: Verify COCE evaluated but omitted, yielding $N=5$ (Ops) or $N=7$ (Mgmt).
6. `test_objective_difficulty_achievement_20_cases`: Verify all 20 combinations of Difficulty $\times$ Achievement match live Kintone matrix.
7. `test_score_normalization_100_point`: Verify $((A+B)*100)/5$ scale conversion.
8. `test_fail_closed_unknown_position`: Verify invalid/empty position halts initialization.
9. `test_annual_profile_freeze`: Verify mid-year changes do not alter frozen App 794 record profile.

---

## 13. Rollback Plan
* **Current Task:** Revert git commit on `develop` branch.
* **Kintone Environment:** **`NOT APPLICABLE`** (Zero write operations executed).

---

## 14. No-Orphan Plan
Every field on App 794 is accounted for:
- Pilot hardcoded CALCs (`PartA_Weighted_Score`, `PartB_Raw_Score`, `PartB_Weighted_Score`) $\implies$ Classified as `SCHEMA_DRIFT` and scheduled for dynamic formula synchronization.
- `Final_Confidential_Score` $\implies$ Classified as `REUSE`.
- Competency 1..6 fields $\implies$ Classified as `KEEP`.

---

## 15. Profile Configuration Storage Decision (Open Decision)
* **Status:** **`PROFILE_CONFIGURATION_STORAGE = DECISION_REQUIRED`**
* **Options Under Review:**
  - **Option A (Repository Configuration):** Version-controlled JSON in git repository.
  - **Option B (Dedicated Master App):** Standalone Kintone Master App for HR maintenance.
  - **Option C (Hybrid Architecture):** Master App for runtime with repo backup snapshot.
* **Critical Business Question Count:** **`1`** (Awaiting user selection).

---

## 16. Dependencies & Next Work Package Boundary
* **Preceding Gate:** Phase 2 Closed Baseline (`8fb306e`).
* **Current Gate:** `MBO-P03-WP-001 (Plan Gate Review)`.
* **Next Work Package:** Phase 3 WP-002 (Implementation of Profile Resolution & Scoring Engine upon user approval).
