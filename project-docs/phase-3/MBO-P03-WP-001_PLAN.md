# Work Package Implementation Plan: MBO-P03-WP-001
## EVALUATION PROFILE & COMPETENCY CONFIGURATION FOUNDATION
### Comprehensive Architecture Plan & Schema Manifest Audit

> **Document Type:** Authoritative Repository Implementation Plan  
> **Phase:** `Phase 3: Evaluation Profile, Competency & Scoring Engine`  
> **Work Package ID:** `MBO-P03-WP-001`  
> **Plan Gate Status:** `PLAN_GATE: READY FOR INDEPENDENT REVIEW`  
> **Scoring Governance:** `DEC-035 (SCORING_SOURCE_OF_TRUTH = LIVE_KINTONE_FIRST)`, `DEC-036 (APPRAISER_WEIGHT_AND_COMPLETENESS_GOVERNANCE)`  
> **Authoritative Phase 2 Baseline:** Commit `8fb306e` (Passed Implementation & Review Gates)  
> **Kintone Write Operations in Planning:** `0 (Strict Read-Only Mode Active)`  
> **Evidence Matrices:**  
> - Scoring Truth & Active Lineage: [`project-docs/phase-3/evidence/KINTONE_SCORING_SOURCE_OF_TRUTH.md`](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/project-docs/phase-3/evidence/KINTONE_SCORING_SOURCE_OF_TRUTH.md)  
> - App 53 Position Enumeration (63 Positions): [`project-docs/phase-3/evidence/POSITION_PROFILE_EVIDENCE.md`](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/project-docs/phase-3/evidence/POSITION_PROFILE_EVIDENCE.md)  
> - Exact Per-App Competency Matrix (8 Apps): [`project-docs/phase-3/evidence/COMPETENCY_SOURCE_EVIDENCE.md`](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/project-docs/phase-3/evidence/COMPETENCY_SOURCE_EVIDENCE.md)  

---

## 1. Purpose
Establish the authoritative, configuration-driven foundation for Evaluation Profiles, Competency Sets, and Scoring Lineage for MBO 2026. This plan formally reconciles business rules, position normalization policy, appraiser weighting layers across Part A and Part B (`DEC-036`), Part A scoring modes (`Part_A_Scoring_Mode`), completeness gating, COCE exclusion, annual snapshot storage strategy, version immutability, and schema requirements prior to any Phase 3 implementation or Kintone writes.

---

## 2. Approved Scope
1. Define the 4 canonical Profile Families (`PROFILE_STAFF_CHIEF`, `PROFILE_JAPANESE_STAFF`, `PROFILE_MANAGEMENT`, `PROFILE_EXECUTIVE`) and their distinct scoring configurations.
2. Formalize the 2 standard Competency Sets: Operational (6 items, $N_{\text{included}}=5$) and Management/Executive (8 items, $N_{\text{included}}=7$).
3. Establish dynamic COCE gate calculation ($N_{\text{included}} = \text{count}(\text{Included\_In\_Score} == \text{true})$) where COCE is evaluated but excluded from scored points.
4. Establish the Appraiser Weight & Completeness Governance (`DEC-036`):
   - Universal application to **BOTH Part A (Objectives) and Part B (Competencies)**.
   - Derivation of Appraiser Weight from $K_{\text{expected}}$ ($1/K_{\text{expected}}$).
   - Strict completeness gates ($K_{\text{valid}} == K_{\text{expected}}$) across Part A and Part B.
   - Prohibition of automatic weight redistribution upon missing appraiser evaluation.
5. Formalize `Part_A_Scoring_Mode` configuration property:
   - `DIFFICULTY_ACHIEVEMENT_MATRIX`: $\text{Objective\_Value} = \text{Matrix(Difficulty, Achievement)}$ (Used by Staff, Japan, Asst Mgr, Sect Mgr, Snr Mgr, DGM).
   - `ACHIEVEMENT_DIRECT`: $\text{Objective\_Value} = \text{Achievement}$ (Used by GM, VP; matrix field exists but is bypassed).
6. Formalize Position Normalization Policy:
   - `normalize_title(raw) = TRIM(COLLAPSE_INTERNAL_SPACES(LOWERCASE(raw)))`
   - Strict prohibition of substring matching (`contains("Staff")`), suffix guessing, or semantic inference.
7. Establish **Scoring Configuration Version Immutability Contract**: Once a `Scoring_Config_Version` is referenced by an Annual Record, that version is permanently immutable; modifications require issuing a new version tag.
8. Reconcile Annual Scoring Snapshot Storage Strategy with App 794 Field Manifest (`PHYSICAL_APP794_FIELD` vs `DERIVED_FROM_VERSIONED_SCORING_CONFIG`).
9. Audit and categorize all App 794 fields against live deployed schema and repository specification (`config/schema-spec.js`).
10. Present the Profile Configuration Storage trade-off options for user decision.

---

## 3. Out of Scope
1. Any Kintone write operations (App 794 schema changes, record creation, app creation) $\implies$ Strictly 0 writes in WP-001.
2. Substring or heuristic position matching.
3. Silent standardization of GM/VP Part A scoring behavior.
4. Unequal appraiser weighting (e.g. 60/40 between appraisers) without separate user approval.
5. Phase 3 JavaScript implementation (deferred to execution work packages).
6. Phase 4 Hoshin dual-level gating.
7. Phase 5 Enterprise App 795 seeding.

---

## 4. Affected Repository & Potential Kintone Components

### Repository Components (To be created / updated in execution phase)
* `src/scoring/` (Future scoring calculation engine & validators)
* `src/profiles/` (Future profile resolution & configuration loader)
* `config/schema-spec.js` (Target schema synchronization)
* `tests/unit/` (Unit test suite for profiles and scoring math)

### Potential Kintone Components (Target App 794)
* Native form fields: `Evaluation_Profile_Code`, `Profile_Family`, `Scoring_Config_Code`, `Scoring_Config_Version`, `Expected_Appraiser_Count`, `PartA_Weight`, `PartB_Weight`, `Competency_Set_Code`.
* Native competency fields: `Competency_Result_7..8`, `Competency_Criteria_7..8`, `Manager_Competency_Rating_7..8`, `GM_Competency_Rating_7..8`.
* Native CALC formula updates for Part A & Part B weighted scores.

---

## 5. Business Rules & Governance Invariants

1. **`DEC-036: Appraiser Weight & Completeness Governance (Part A & Part B)`:**
   - Appraiser weight derives from $K_{\text{expected}}$ ($K=1 \implies 100\%$, $K=2 \implies 50/50\%$).
   - Scoring calculation strictly blocked unless $K_{\text{valid}} == K_{\text{expected}}$ across Part A and Part B.
   - Missing appraiser evaluation never triggers automatic weight redistribution to completed appraiser.
2. **Scoring Configuration Version Immutability Contract:** Once `Scoring_Config_Version` has been referenced by an Annual Record, that exact version becomes permanently immutable. Any scoring configuration change requires issuing a NEW `Scoring_Config_Version`. Historical scoring configurations must never be mutated in place.
3. **`DEC-035: SCORING_SOURCE_OF_TRUTH = LIVE_KINTONE_FIRST`:** Live deployed Kintone configuration is primary truth for scoring formulas, weights, appraiser models, and rounding.
4. **`DEC-024: Annual Profile Freeze`:** Evaluation profile, $K_{\text{expected}}$, and Scoring Configuration resolved once at Annual Record Initialization and frozen for the full Fiscal Year.
5. **`DEC-023: Evaluation Profile Architecture`:** 4 Profile Families, configuration-driven master, hybrid storage.

---

## 6. Two Distinct Weight Layers

The MBO 2026 scoring engine strictly separates two independent weight layers:

| Layer | Weight Layer Name | Purpose | Configuration Source | Values |
| :---: | :--- | :--- | :--- | :--- |
| **Layer 1** | **Appraiser Weight** | Combines ratings across multiple appraisers for Part A and Part B | Derived dynamically from $K_{\text{expected}}$ ($1/K_{\text{expected}}$) | $K=1 \implies 100\%$<br>$K=2 \implies 50\% / 50\%$ |
| **Layer 2** | **Part A / Part B Weight** | Combines MBO objectives (Part A) and Competencies (Part B) into overall evaluation | Scoring Configuration Profile Split | Staff/Japan: **70 / 30**<br>Asst Mgr: **60 / 40**<br>Sect/Snr/DGM/GM/VP: **50 / 50** |

---

## 7. Position Resolution & Deterministic Normalization Policy

### Position Normalization Function
$$\text{normalize\_title}(\text{raw\_string}) = \text{TRIM}(\text{COLLAPSE\_INTERNAL\_SPACES}(\text{LOWERCASE}(\text{raw\_string})))$$

### Prohibited Normalization Rules
- **NO Substring Matching:** Matching `contains("Staff")` or `contains("Manager")` is strictly prohibited.
- **NO Suffix / Prefix Guessing:** Guessing profile from partial title matches is strictly prohibited.
- **NO Semantic Inference:** Inferring profile without direct legacy match or frozen rule is strictly prohibited.

### 8 Evaluation Groups mapped to 4 Profile Families:
| Evaluation Group | Profile Family | Applicable Competency Set | Displayed Items | Included Items ($N_{\text{included}}$) | Part A Weight (%) | Part B Weight (%) | Current Deployed Appraisers ($K_{\text{expected}}$) | Layer 1 Appraiser Weights | Part A Scoring Mode | Authoritative Evidence |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- | :--- |
| **Staff & Chief** | `PROFILE_STAFF_CHIEF` | `COMP_SET_OPERATIONAL_V1` | 6 | **5** | **70%** | **30%** | 2 | **50% / 50%** | `DIFFICULTY_ACHIEVEMENT_MATRIX` | App 283 (Rev 1003) / DEC-035 |
| **Japanese Staff** | `PROFILE_JAPANESE_STAFF`| `COMP_SET_OPERATIONAL_V1` | 6 | **5** | **70%** | **30%** | 2 | **50% / 50%** | `DIFFICULTY_ACHIEVEMENT_MATRIX` | App 716 (Rev 1031) / DEC-035 |
| **Assistant Manager**| `PROFILE_MANAGEMENT` | `COMP_SET_MANAGEMENT_V1` | 8 | **7** | **60%** | **40%** | 2 | **50% / 50%** | `DIFFICULTY_ACHIEVEMENT_MATRIX` | App 310 (Rev 555: 60/40) / DEC-035 |
| **Section Manager** | `PROFILE_MANAGEMENT` | `COMP_SET_MANAGEMENT_V1` | 8 | **7** | **50%** | **50%** | 2 | **50% / 50%** | `DIFFICULTY_ACHIEVEMENT_MATRIX` | App 305 (Rev 596) / DEC-023 |
| **Senior Manager** | `PROFILE_MANAGEMENT` | `COMP_SET_MANAGEMENT_V1` | 8 | **7** | **50%** | **50%** | 2 | **50% / 50%** | `DIFFICULTY_ACHIEVEMENT_MATRIX` | App 643 (Rev 503) / DEC-023 |
| **Deputy General Mgr**| `PROFILE_MANAGEMENT` | `COMP_SET_MANAGEMENT_V1` | 8 | **7** | **50%** | **50%** | 2 | **50% / 50%** | `DIFFICULTY_ACHIEVEMENT_MATRIX` | App 307 (Rev 579: PMS DGM) |
| **General Manager** | `PROFILE_EXECUTIVE` | `COMP_SET_MANAGEMENT_V1` | 8 | **7** | **50%** | **50%** | **1** (Capacity: 1..2) | **100%** | `ACHIEVEMENT_DIRECT` | App 640 (Rev 542) / DEC-035 |
| **Vice President** | `PROFILE_EXECUTIVE` | `COMP_SET_MANAGEMENT_V1` | 8 | **7** | **50%** | **50%** | **1** (Capacity: 1..2) | **100%** | `ACHIEVEMENT_DIRECT` | App 715 (Rev 543) / DEC-035 |

---

## 8. Scoring Mathematical Model & Configuration-Driven Rounding

### A. Parameterized Scoring Engine
1. **Part A Objective Combination Formula:**
   $$\text{Objective\_Result}_i = \sum_{j=1}^{K_{\text{expected}}} (\text{Objective\_Value}_{i,j} \times \text{Appraiser\_Weight}_j) = \frac{\sum_{j=1}^{K_{\text{expected}}} \text{Objective\_Value}_{i,j}}{K_{\text{expected}}}$$
   - For `DIFFICULTY_ACHIEVEMENT_MATRIX`: $\text{Objective\_Value}_{i,j} = \text{Matrix}(\text{Difficulty}_i, \text{Achievement}_{i,j})$
   - For `ACHIEVEMENT_DIRECT`: $\text{Objective\_Value}_{i,j} = \text{Achievement}_{i,j}$
2. **Part B Competency Combination Formula:**
   $$\text{Competency\_Result}_i = \sum_{j=1}^{K_{\text{expected}}} (\text{Rating}_{i,j} \times \text{Appraiser\_Weight}_j) = \frac{\sum_{j=1}^{K_{\text{expected}}} \text{Rating}_{i,j}}{K_{\text{expected}}}$$
3. **Part B Raw Score:**
   $$\text{PartB\_Raw} = \frac{\sum_{i \in \text{Scored}} \text{Competency\_Result}_i}{N_{\text{included}}}$$
4. **Part A & Part B Weighted Scores:**
   - $\text{PartA\_Weighted} = \text{APPLY\_ROUNDING}(\text{PartA\_Rounding\_Rule}, (\text{Part A Raw} \times \text{Part\_A\_Weight}) / 100)$
   - $\text{PartB\_Weighted} = \text{APPLY\_ROUNDING}(\text{PartB\_Weighted\_Rounding\_Rule}, \text{PartB\_Raw} \times (\text{Part\_B\_Weight} / 100))$
5. **Intermediate & Final Scores:**
   - $\text{Weighted\_Score\_5\_Point} = \text{PartA\_Weighted} + \text{PartB\_Weighted}$
   - $\text{Final\_Score\_100\_Point} = \text{APPLY\_ROUNDING}(\text{Final\_Rounding\_Rule}, (\text{Weighted\_Score\_5\_Point} \times 100) / 5)$

---

## 9. Canonical Annual Scoring Snapshot Storage Strategy

At Annual Record Initialization, the following configuration attributes are governed to ensure 100% historical evaluation reproducibility (`DEC-024`):

| Attribute # | Attribute Name | Storage Strategy | Physical App 794 Field Code | Field Type | Purpose / Rationale |
| :---: | :--- | :---: | :--- | :---: | :--- |
| 1 | `Evaluation_Profile_Code` | **`PHYSICAL_APP794_FIELD`** | `Evaluation_Profile_Code` | `SINGLE_LINE_TEXT` | Immutable record snapshot of profile code |
| 2 | `Profile_Family` | **`PHYSICAL_APP794_FIELD`** | `Profile_Family` | `SINGLE_LINE_TEXT` | Immutable record snapshot of profile family |
| 3 | `Scoring_Config_Code` | **`PHYSICAL_APP794_FIELD`** | `Scoring_Config_Code` | `SINGLE_LINE_TEXT` | Versioned scoring config identifier |
| 4 | `Scoring_Config_Version` | **`PHYSICAL_APP794_FIELD`** | `Scoring_Config_Version` | `SINGLE_LINE_TEXT` | Immutable version SHA/tag for historical playback |
| 5 | `Expected_Appraiser_Count` | **`PHYSICAL_APP794_FIELD`** | `Expected_Appraiser_Count` | `NUMBER` | Snapshot of $K_{\text{expected}}$ for completeness gate |
| 6 | `PartA_Weight` | **`PHYSICAL_APP794_FIELD`** | `PartA_Weight` | `NUMBER` | Snapshot of Part A percentage weight |
| 7 | `PartB_Weight` | **`PHYSICAL_APP794_FIELD`** | `PartB_Weight` | `NUMBER` | Snapshot of Part B percentage weight |
| 8 | `Competency_Set_Code` | **`PHYSICAL_APP794_FIELD`** | `Competency_Set_Code` | `SINGLE_LINE_TEXT` | Code of applicable competency item set |
| 9 | `Appraiser_Weight_Rule_Code` | `DERIVED_FROM_VERSIONED_SCORING_CONFIG` | *(None)* | *(Derived)* | Resolved dynamically via `Scoring_Config_Version` |
| 10 | `Part_A_Scoring_Mode` | `DERIVED_FROM_VERSIONED_SCORING_CONFIG` | *(None)* | *(Derived)* | Resolved dynamically via `Scoring_Config_Version` |
| 11 | Rounding Rules | `DERIVED_FROM_VERSIONED_SCORING_CONFIG` | *(None)* | *(Derived)* | Resolved dynamically via `Scoring_Config_Version` |

---

## 10. App 794 Field Manifest & Gap Analysis

| Field Code | Live Exists | Repo Spec Exists | Field Type | Classification | Gap Nature / Action |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `Evaluation_Profile_Code` | No | No | `SINGLE_LINE_TEXT` | **`MISSING_TARGET_FIELD`** | `LIVE_SCHEMA_GAP` & `REPOSITORY_SCHEMA_SPEC_GAP` |
| `Profile_Family` | No | No | `SINGLE_LINE_TEXT` | **`MISSING_TARGET_FIELD`** | `LIVE_SCHEMA_GAP` & `REPOSITORY_SCHEMA_SPEC_GAP` |
| `Scoring_Config_Code` | No | No | `SINGLE_LINE_TEXT` | **`MISSING_TARGET_FIELD`** | `LIVE_SCHEMA_GAP` & `REPOSITORY_SCHEMA_SPEC_GAP` |
| `Scoring_Config_Version` | No | No | `SINGLE_LINE_TEXT` | **`MISSING_TARGET_FIELD`** | `LIVE_SCHEMA_GAP` & `REPOSITORY_SCHEMA_SPEC_GAP` |
| `Expected_Appraiser_Count`| No | No | `NUMBER` | **`MISSING_TARGET_FIELD`** | `LIVE_SCHEMA_GAP` & `REPOSITORY_SCHEMA_SPEC_GAP` |
| `PartA_Weight` | No | No | `NUMBER` | **`MISSING_TARGET_FIELD`** | `LIVE_SCHEMA_GAP` & `REPOSITORY_SCHEMA_SPEC_GAP` |
| `PartB_Weight` | No | No | `NUMBER` | **`MISSING_TARGET_FIELD`** | `LIVE_SCHEMA_GAP` & `REPOSITORY_SCHEMA_SPEC_GAP` |
| `Competency_Set_Code` | No | No | `SINGLE_LINE_TEXT` | **`MISSING_TARGET_FIELD`** | `LIVE_SCHEMA_GAP` & `REPOSITORY_SCHEMA_SPEC_GAP` |
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

## 11. Security Impact & Confidentiality Model
* **Confidential Scoring Isolation:** Native Kintone Field Permissions enforce that employees and shared requesters cannot view Manager/GM objective scores, competency ratings, comments, or intermediate/final confidential scores.
* **Security Boundary:** Native Kintone Permissions form the authoritative security perimeter; JavaScript/CSS is UX-only.

---

## 12. Risk Management
| Risk ID | Description | Severity | Mitigation Strategy |
| :--- | :--- | :---: | :--- |
| `RSK-P03-01` | Missing position string causes initialization failure | Medium | Fail closed with `PROFILE_SOURCE_INVALID`; notify HR administrator. |
| `RSK-P03-02` | Appraiser evaluation incomplete at submission | High | Enforce $K_{\text{valid}} == K_{\text{expected}}$ before score computation (`DEC-036`). |
| `RSK-P03-03` | Schema drift in App 794 formulas | Medium | Synchronize `config/schema-spec.js` and App 794 schema in execution phase. |

---

## 13. Change Manifest (Current vs Proposed Future)
* **Current Task Change Manifest:** **`NONE (Documentation / Planning Only; 0 Kintone Writes)`**.
* **Proposed Future Execution Manifest:**
  - Add missing profile snapshot and competency 7..8 fields to `config/schema-spec.js` and App 794.
  - Deploy dynamic formula engines for Part A and Part B weighted scores.

---

## 14. Future Test Matrix Plan (Future Execution Phase)

### A. Part A Scoring Mode & Lineage Suite
* `PARTA-MODE-001`: Staff/Management matrix mode uses Difficulty $\times$ Achievement matrix score.
* `PARTA-MODE-002`: GM uses `ACHIEVEMENT_DIRECT` mode ($mbo\_point = (achieve/100)*weight$).
* `PARTA-MODE-003`: VP uses `ACHIEVEMENT_DIRECT` mode ($mbo\_point = (achieve/100)*weight$).
* `PARTA-MODE-004`: GM/VP matrix field presence does NOT alter active calculation result.
* `PARTA-MODE-005`: Changing `Part_A_Scoring_Mode` requires approved scoring configuration version.

### B. Appraiser Weight & Completeness Suite (DEC-036)
* `APPW-A-001`: Part A $K_{\text{expected}} = 1 \implies \text{Appraiser Weight} = 100\%$.
* `APPW-A-002`: Part A $K_{\text{expected}} = 2 \implies \text{Appraiser Weights} = 50\% / 50\%$.
* `APPW-A-003`: Part A $K_{\text{expected}} = 2$ with 1 missing $\implies$ Fails closed (`APPRAISER_RATING_INCOMPLETE`).
* `APPW-B-001`: Part B $K_{\text{expected}} = 1 \implies \text{Appraiser Weight} = 100\%$.
* `APPW-B-002`: Part B $K_{\text{expected}} = 2 \implies \text{Appraiser Weights} = 50\% / 50\%$.
* `APPW-B-003`: Part B $K_{\text{expected}} = 2$ with 1 missing $\implies$ Fails closed (`APPRAISER_RATING_INCOMPLETE`).
* `APPW-FINAL-001`: Final score calculation blocked until BOTH Part A and Part B completeness gates pass.

### C. Position Normalization & Evidence Suite
* `POSITION-NORM-001`: Whitespace/case variants (e.g. `Senior  Manager`, `General manager`) resolve via `normalize_title()`.
* `POSITION-SUBSTRING-FAIL-001`: Substring matching (e.g. `contains("Staff")`, `contains("Manager")`) is prohibited and fails closed (`PROFILE_MAPPING_AMBIGUOUS`).
* `POSITION-CONFLICT-001`: Position with conflicting legacy matches (e.g. `Assistant Section Manager`, `Marketing Staff`) fails closed with `PROFILE_MAPPING_AMBIGUOUS`.
* `POSITION-NOEVIDENCE-001`: Position with no direct legacy match or frozen rule fails closed with `PROFILE_MAPPING_AMBIGUOUS`.
* `POSITION-RULE-001`: Canonical titles with frozen governance rules (`Staff`, `Chief`) resolve with `PROFILE_MAPPING_RESOLVED`.
* `VERSION-IMMUTABILITY-001`: Historical scoring configuration cannot be mutated in place; version change creates a new immutable version tag.

---

## 15. Rollback Plan
* **Current Task:** Revert git commit on `develop` branch.
* **Kintone Environment:** **`NOT APPLICABLE`** (Zero write operations executed).

---

## 16. No-Orphan Plan
Every field on App 794 is accounted for:
- Pilot hardcoded CALCs (`PartA_Weighted_Score`, `PartB_Raw_Score`, `PartB_Weighted_Score`) $\implies$ Classified as `SCHEMA_DRIFT` and scheduled for dynamic formula synchronization.
- `Final_Confidential_Score` $\implies$ Classified as `REUSE`.
- Competency 1..6 fields $\implies$ Classified as `KEEP`.

---

## 17. Profile Configuration Storage Decision (Open Decision)
* **Status:** **`PROFILE_CONFIGURATION_STORAGE = DECISION_REQUIRED`**
* **Options Under Review:**
  - **Option A (Repository Configuration):** Version-controlled JSON in git repository.
  - **Option B (Dedicated Master App):** Standalone Kintone Master App for HR maintenance.
  - **Option C (Hybrid Architecture):** Master App for runtime with repo backup snapshot.
* **Critical Business Question Count:** **`1`** (Awaiting user selection).

---

## 18. Dependencies & Next Work Package Boundary
* **Preceding Gate:** Phase 2 Closed Baseline (`8fb306e`).
* **Current Gate:** `MBO-P03-WP-001 (Plan Gate Review)`.
* **Next Work Package:** Phase 3 WP-002 (Implementation of Profile Resolution & Scoring Engine upon user approval).
