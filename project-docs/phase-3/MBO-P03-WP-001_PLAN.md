# Work Package Implementation Plan: MBO-P03-WP-001
## EVALUATION PROFILE & COMPETENCY CONFIGURATION FOUNDATION
### Frozen Architecture Reconciliation & Authoritative Evidence Baseline

> **Document Type:** Authoritative Repository Implementation Plan
> **Scoring Source of Truth:** `LIVE_KINTONE_FIRST` (User-Confirmed Rule: Live Kintone calculation behavior is primary truth over secondary Excel artifacts).  
> **Scoring Evidence Matrix:** [`project-docs/phase-3/evidence/KINTONE_SCORING_SOURCE_OF_TRUTH.md`](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/project-docs/phase-3/evidence/KINTONE_SCORING_SOURCE_OF_TRUTH.md)  
  
> **Phase:** `Phase 3: Evaluation Profile, Competency & Scoring Engine`  
> **Work Package ID:** `MBO-P03-WP-001`  
> **Plan Gate Status:** `PLAN_GATE: READY FOR INDEPENDENT REVIEW`  
> **Authoritative Phase 2 Baseline:** Commit `8fb306e` (Passed Implementation & Review Gates)  
> **Kintone Write Operations in Planning:** `0 (Strict Read-Only Mode Active)`  

---

## 1. Executive Summary & Purpose

The purpose of **`MBO-P03-WP-001`** is to establish the authoritative, configuration-driven **Evaluation Profile, Competency & Scoring Configuration Foundation** for MBO 2026. This plan formally reconciles:
1. **The 4 Canonical Profile Families & 8 Evaluation Groups (`DEC-023`, `EVALUATION_PROFILE_ARCHITECTURE.md`):**
   - **`PROFILE_STAFF_CHIEF`** (Staff & Chief) -> 70% Part A / 30% Part B
   - **`PROFILE_JAPANESE_STAFF`** (Japanese Staff) -> 70% Part A / 30% Part B
   - **`PROFILE_MANAGEMENT`** (Assistant Manager, Section Manager, Senior Manager, **Deputy General Manager**) -> 50% Part A / 50% Part B
   - **`PROFILE_EXECUTIVE`** (General Manager, Vice President) -> 50% Part A / 50% Part B
2. **Two Distinct Competency Sets (`COMPETENCY_ARCHITECTURE.md`):**
   - **Operational Competency Set (`COMP_SET_OPERATIONAL_V1`):** 6 items displayed (5 scored + 1 COCE gate). N_included = 5.
   - **Management & Executive Competency Set (`COMP_SET_MANAGEMENT_V1`):** 8 items displayed (7 scored including Leadership and Strategy/Coaching + 1 COCE gate). N_included = 7.
3. **Configuration-Driven Dynamic COCE Exclusion:**
   - Compliance / COCE is evaluated across all profiles (`Evaluated = YES`), but configured with `Included_In_Score = false`. The scoring engine dynamically derives the denominator N_included = count(competencies where Included_In_Score == true), strictly avoiding global N=5 or hardcoded index 6 exclusions.
4. **Appraiser Cardinality & Mathematical Scoring Formulation:**
   - Staff/Chief, Japanese Staff, Management: 2 scoring appraisers (K=2).
   - Executive: 1-2 scoring appraisers (K in [1..2]).
   - Scoring Model: Parameterized average of valid appraiser ratings with Half-Up 2-decimal place rounding.
5. **Annual Profile Freeze Rule (`DEC-024`):**
   - Profile resolved once at Annual Record Initialization and frozen for the entire Fiscal Year, decoupled from stage routing.

---

## 2. Profile Hierarchy: 8 Evaluation Groups to 4 Profile Families

| Evaluation Group | Profile Family | Applicable Competency Set | Displayed Items | Included Items (N_included) | Part A Weight (%) | Part B Weight (%) | Scoring Appraisers | Authoritative Evidence |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Staff & Chief** | `PROFILE_STAFF_CHIEF` | `COMP_SET_OPERATIONAL_V1` | 6 | **5** | **70%** | **30%** | 2 | App 283 / `exp/PMS_Staff & Chief_PART_B.xlsx` / DEC-023 |
| **Japanese Staff** | `PROFILE_JAPANESE_STAFF`| `COMP_SET_OPERATIONAL_V1` | 6 | **5** | **70%** | **30%** | 2 | App 716 (`info app/716`) / DEC-023 |
| **Assistant Manager**| `PROFILE_MANAGEMENT` | `COMP_SET_MANAGEMENT_V1` | 8 | **7** | **60%** | **40%** | 2 | App 310 (Live Formula: 60/40 overrides doc) |
| **Section Manager** | `PROFILE_MANAGEMENT` | `COMP_SET_MANAGEMENT_V1` | 8 | **7** | **50%** | **50%** | 2 | App 305 (`info app/305`) / DEC-023 |
| **Senior Manager** | `PROFILE_MANAGEMENT` | `COMP_SET_MANAGEMENT_V1` | 8 | **7** | **50%** | **50%** | 2 | App 643 (`info app/643`) / DEC-023 |
| **Deputy General Mgr**| `PROFILE_MANAGEMENT` | `COMP_SET_MANAGEMENT_V1` | 8 | **7** | **50%** | **50%** | 2 | EVALUATION_PROFILE_ARCHITECTURE.md (L46) |
| **General Manager** | `PROFILE_EXECUTIVE` | `COMP_SET_MANAGEMENT_V1` | 8 | **7** | **50%** | **50%** | 1-2 | App 640 (`info app/640`) / App 307 / DEC-023 |
| **Vice President** | `PROFILE_EXECUTIVE` | `COMP_SET_MANAGEMENT_V1` | 8 | **7** | **50%** | **50%** | 1-2 | App 715 (`info app/715`) / DEC-023 |

---

## 3. Master Competency Inventory by Competency Set

### Set A: Operational Competency Set (`COMP_SET_OPERATIONAL_V1`)
*Applicable Profile Families:* `PROFILE_STAFF_CHIEF`, `PROFILE_JAPANESE_STAFF`

| Seq | Competency Code | Name (TH) | Name (EN) | Rating Min | Rating Max | Included In Score | Required | Source Type | Authoritative Source File / App | Evidence Status |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :--- | :--- | :---: |
| 1 | `COMP_ADAPT` | ความสามารถในการปรับตัว | Adaptability | 1 | 5 | **`true`** | Yes | `EXCEL_AND_APP` | `exp/PMS_Staff & Chief_PART_B.xlsx` / App 794 | **VERIFIED** |
| 2 | `COMP_PROB` | การแก้ไขปัญหา | Problem Solving | 1 | 5 | **`true`** | Yes | `EXCEL_AND_APP` | `exp/PMS_Staff & Chief_PART_B.xlsx` / App 794 | **VERIFIED** |
| 3 | `COMP_CUST` | การมุ่งเน้นลูกค้า | Customer Focus | 1 | 5 | **`true`** | Yes | `EXCEL_AND_APP` | `exp/PMS_Staff & Chief_PART_B.xlsx` / App 794 | **VERIFIED** |
| 4 | `COMP_VALUE` | การสร้างคุณค่าและความคิดริเริ่ม | Value Creation | 1 | 5 | **`true`** | Yes | `EXCEL_AND_APP` | `exp/PMS_Staff & Chief_PART_B.xlsx` / App 794 | **VERIFIED** |
| 5 | `COMP_SAFETY`| ความตระหนักด้านความปลอดภัย | Safety Awareness | 1 | 5 | **`true`** | Yes | `EXCEL_AND_APP` | `exp/PMS_Staff & Chief_PART_B.xlsx` / App 794 | **VERIFIED** |
| 6 | `COMP_COCE` | จรรยาบรรณและการปฏิบัติตามกฎ | Compliance / COCE | 1 | 5 | **`false`** | Yes | `EXCEL_AND_APP` | `exp/PMS_Staff & Chief_PART_B.xlsx` / App 794 | **VERIFIED** |

### Set B: Management & Executive Competency Set (`COMP_SET_MANAGEMENT_V1`)
*Applicable Profile Families:* `PROFILE_MANAGEMENT`, `PROFILE_EXECUTIVE`

| Seq | Competency Code | Name (TH) | Name (EN) | Rating Min | Rating Max | Included In Score | Required | Source Type | Authoritative Source File / App | Evidence Status |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :--- | :--- | :---: |
| 1 | `COMP_ADAPT` | ความสามารถในการปรับตัว | Adaptability | 1 | 5 | **`true`** | Yes | `EXCEL_AND_APP` | `info app/305/PMS Asst.Sect.Mgr_Part_B.xlsx` | **VERIFIED** |
| 2 | `COMP_PROB` | การแก้ไขปัญหา | Problem Solving | 1 | 5 | **`true`** | Yes | `info app/305/PMS Asst.Sect.Mgr_Part_B.xlsx` | **VERIFIED** |
| 3 | `COMP_CUST` | การมุ่งเน้นลูกค้า | Customer Focus | 1 | 5 | **`true`** | Yes | `EXCEL_AND_APP` | `info app/305/PMS Asst.Sect.Mgr_Part_B.xlsx` | **VERIFIED** |
| 4 | `COMP_VALUE` | การสร้างคุณค่าและความคิดริเริ่ม | Value Creation | 1 | 5 | **`true`** | Yes | `EXCEL_AND_APP` | `info app/305/PMS Asst.Sect.Mgr_Part_B.xlsx` | **VERIFIED** |
| 5 | `COMP_SAFETY`| ความตระหนักด้านความปลอดภัย | Safety Awareness | 1 | 5 | **`true`** | Yes | `EXCEL_AND_APP` | `info app/305/PMS Asst.Sect.Mgr_Part_B.xlsx` | **VERIFIED** |
| 6 | `COMP_COCE` | จรรยาบรรณและการปฏิบัติตามกฎ | Compliance / COCE | 1 | 5 | **`false`** | Yes | `EXCEL_AND_APP` | `info app/305/PMS Asst.Sect.Mgr_Part_B.xlsx` | **VERIFIED** |
| 7 | `COMP_LEAD` | ภาวะผู้นำและการบริหารคน | Leadership & People Mgmt | 1 | 5 | **`true`** | Yes | `EXCEL_AND_APP` | `info app/305`, `info app/643`, `COMPETENCY_ARCHITECTURE.md` | **VERIFIED** |
| 8 | `COMP_STRAT`| การวางแผนกลยุทธ์และการสอนงาน | Strategy & Coaching | 1 | 5 | **`true`** | Yes | `EXCEL_AND_APP` | `info app/305`, `info app/643`, `COMPETENCY_ARCHITECTURE.md` | **VERIFIED** |

---

## 4. Scoring Mathematical Model & Appraiser Cardinality

### A. Appraiser Cardinality & Averaging Model (Model A Standard)
For each competency item $i in [1..M]$:
$$\text{Competency\_Result\_}i = \frac{\sum_{k=1}^{K} \text{Appraiser\_Rating\_}i,k}{K_{\text{valid\_appraisers}}}$$

### B. Dynamic Part B Raw Score
$$\text{Part B Raw Score} = \frac{\sum_{i \in \text{Competencies, Included\_In\_Score=true}} \text{Competency\_Result\_}i}{N_{\text{included}}}$$
* For Operational Set: $N_{\text{included}} = 5$
* For Management/Executive Set: $N_{\text{included}} = 7$

### C. Weighted Scores & Final Score
$$\text{Part A Weighted Score} = \text{ROUND}\left(\text{Part A Raw Score} \times \frac{\text{Part\_A\_Weight}}{100}, 2\right)$$
$$\text{Part B Weighted Score} = \text{ROUND}\left(\text{Part B Raw Score} \times \frac{\text{Part\_B\_Weight}}{100}, 2\right)$$
$$\text{Final Score} = \text{Part A Weighted Score} + \text{Part B Weighted Score}$$
* Rounding Mode: Half-Up to exactly 2 decimal places.

---

## 5. Position Mapping Inventory & Direct Evidence Matrix (All 63 App 53 Values)

| Raw Position Value | Evaluation Group | Profile Family | Mapping Status | Evidence Type | Exact Source | Evidence Detail | Confidence |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- | :---: |
| `(EMPTY)` | UNRESOLVED | `UNRESOLVED` | `PROFILE_SOURCE_INVALID` | `FAIL_CLOSED` | App 53 Text_2 | Empty / whitespace position string in 3 employee records | **HIGH** |
| `Accounting Chief` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | `EXCEL_BUSINESS_RULE` | App 283 / exp/PMS_Staff & Chief_PART_A.xlsx | Staff & Chief 70/30 operational profile | **HIGH** |
| `Accounting Staff` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | `EXCEL_BUSINESS_RULE` | App 283 / exp/PMS_Staff & Chief_PART_A.xlsx | Staff & Chief 70/30 operational profile | **HIGH** |
| `Advisor` | Japanese Staff | `PROFILE_JAPANESE_STAFF` | `PROFILE_MAPPING_RESOLVED` | `LEGACY_RECORD_EVIDENCE` | App 716 / info app/716 | Japanese expatriate staff 70/30 profile | **HIGH** |
| `Assistant Chief` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | `EXCEL_BUSINESS_RULE` | App 283 / exp/PMS_Staff & Chief_PART_A.xlsx | Staff & Chief 70/30 operational profile | **HIGH** |
| `Assistant Manager` | Assistant Manager | `PROFILE_MANAGEMENT` | `PROFILE_MAPPING_RESOLVED` | `LEGACY_RECORD_EVIDENCE` | App 310 / info app/310 | Assistant Manager 50/50 management profile | **HIGH** |
| `Assistant Section Manager` | Assistant Manager | `PROFILE_MANAGEMENT` | `PROFILE_MAPPING_RESOLVED` | `LEGACY_RECORD_EVIDENCE` | App 305 / info app/305 | Asst. Section Manager 50/50 management profile | **HIGH** |
| `Asst. Section Manager` | Assistant Manager | `PROFILE_MANAGEMENT` | `PROFILE_MAPPING_RESOLVED` | `LEGACY_RECORD_EVIDENCE` | App 305 / info app/305 | Abbreviated Asst. Section Manager 50/50 management profile | **HIGH** |
| `CAM Staff` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | `EXCEL_BUSINESS_RULE` | App 283 / exp/PMS_Staff & Chief_PART_A.xlsx | Technical staff 70/30 operational profile | **HIGH** |
| `Chief` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | `EXCEL_BUSINESS_RULE` | App 283 / exp/PMS_Staff & Chief_PART_A.xlsx | Chief 70/30 operational profile | **HIGH** |
| `Chief of Engineer` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | `EXCEL_BUSINESS_RULE` | App 283 / exp/PMS_Staff & Chief_PART_A.xlsx | Chief engineer 70/30 operational profile | **HIGH** |
| `Chief of Safety Officer` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | `EXCEL_BUSINESS_RULE` | App 283 / exp/PMS_Staff & Chief_PART_A.xlsx | Safety chief 70/30 operational profile | **HIGH** |
| `Clerk` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | `EXCEL_BUSINESS_RULE` | App 283 / exp/PMS_Staff & Chief_PART_A.xlsx | Clerical staff 70/30 operational profile | **HIGH** |
| `Co Project Manager` | Section Manager | `PROFILE_MANAGEMENT` | `PROFILE_MAPPING_RESOLVED` | `LEGACY_RECORD_EVIDENCE` | App 305 / info app/305 | Project Manager equivalent to Section Manager 50/50 | **HIGH** |
| `Contract (Apite)` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | `EXCEL_BUSINESS_RULE` | App 283 / exp/PMS_Staff & Chief_PART_A.xlsx | Contract staff 70/30 operational profile | **HIGH** |
| `Contract (Japan Support)` | Japanese Staff | `PROFILE_JAPANESE_STAFF` | `PROFILE_MAPPING_RESOLVED` | `LEGACY_RECORD_EVIDENCE` | App 716 / info app/716 | Japanese contract staff 70/30 profile | **HIGH** |
| `Coordinator` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | `EXCEL_BUSINESS_RULE` | App 283 / exp/PMS_Staff & Chief_PART_A.xlsx | Coordinator staff 70/30 operational profile | **HIGH** |
| `DESIGN ENGINEER ASSISTANT MANAGER` | Assistant Manager | `PROFILE_MANAGEMENT` | `PROFILE_MAPPING_RESOLVED` | `LEGACY_RECORD_EVIDENCE` | App 310 / info app/310 | Assistant Manager 50/50 management profile (uppercase) | **HIGH** |
| `Deputy General Manager` | Deputy General Manager | `PROFILE_MANAGEMENT` | `PROFILE_MAPPING_RESOLVED` | `FROZEN_DECISION` | EVALUATION_PROFILE_ARCHITECTURE.md / DEC-023 | DGM belongs to PROFILE_MANAGEMENT (50/50) | **HIGH** |
| `Design Engineer` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | `EXCEL_BUSINESS_RULE` | App 283 / exp/PMS_Staff & Chief_PART_A.xlsx | Engineering staff 70/30 operational profile | **HIGH** |
| `Driver` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | `EXCEL_BUSINESS_RULE` | App 283 / exp/PMS_Staff & Chief_PART_A.xlsx | Operational support staff 70/30 profile | **HIGH** |
| `Engineering Staff` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | `EXCEL_BUSINESS_RULE` | App 283 / exp/PMS_Staff & Chief_PART_A.xlsx | Engineering staff 70/30 operational profile | **HIGH** |
| `Executive Management Coordinator` | Vice President | `PROFILE_EXECUTIVE` | `PROFILE_MAPPING_RESOLVED` | `LEGACY_RECORD_EVIDENCE` | App 715 / info app/715 | Executive coordinator 50/50 executive profile | **HIGH** |
| `Factory Manager` | Senior Manager | `PROFILE_MANAGEMENT` | `PROFILE_MAPPING_RESOLVED` | `LEGACY_RECORD_EVIDENCE` | App 643 / info app/643 | Factory Manager equivalent to Senior Manager 50/50 | **HIGH** |
| `General Manager` | General Manager | `PROFILE_EXECUTIVE` | `PROFILE_MAPPING_RESOLVED` | `LEGACY_RECORD_EVIDENCE` | App 640 / App 307 / DEC-023 | General Manager 50/50 executive profile | **HIGH** |
| `General manager` | General Manager | `PROFILE_EXECUTIVE` | `PROFILE_MAPPING_RESOLVED` | `LEGACY_RECORD_EVIDENCE` | App 640 / App 307 / DEC-023 | General Manager 50/50 executive profile (lowercase m) | **HIGH** |
| `IT Staff` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | `EXCEL_BUSINESS_RULE` | App 283 / exp/PMS_Staff & Chief_PART_A.xlsx | IT operational staff 70/30 profile | **HIGH** |
| `Interpreter` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | `EXCEL_BUSINESS_RULE` | App 283 / exp/PMS_Staff & Chief_PART_A.xlsx | Language support staff 70/30 operational profile | **HIGH** |
| `Manager` | Section Manager | `PROFILE_MANAGEMENT` | `PROFILE_MAPPING_RESOLVED` | `LEGACY_RECORD_EVIDENCE` | App 305 / info app/305 | Department manager 50/50 management profile | **HIGH** |
| `Marketing  Chief` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | `EXCEL_BUSINESS_RULE` | App 283 / exp/PMS_Staff & Chief_PART_A.xlsx | Marketing chief 70/30 operational profile (double space) | **HIGH** |
| `Marketing Chief` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | `EXCEL_BUSINESS_RULE` | App 283 / exp/PMS_Staff & Chief_PART_A.xlsx | Marketing chief 70/30 operational profile | **HIGH** |
| `Marketing Engineer` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | `EXCEL_BUSINESS_RULE` | App 283 / exp/PMS_Staff & Chief_PART_A.xlsx | Technical sales staff 70/30 operational profile | **HIGH** |
| `Marketing Staff` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | `EXCEL_BUSINESS_RULE` | App 283 / exp/PMS_Staff & Chief_PART_A.xlsx | Marketing operational staff 70/30 profile (e.g. pilot 0149) | **HIGH** |
| `Messenger` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | `EXCEL_BUSINESS_RULE` | App 283 / exp/PMS_Staff & Chief_PART_A.xlsx | Support operational staff 70/30 profile | **HIGH** |
| `Operator` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | `EXCEL_BUSINESS_RULE` | App 283 / exp/PMS_Staff & Chief_PART_A.xlsx | Factory operator staff 70/30 profile | **HIGH** |
| `President` | Vice President | `PROFILE_EXECUTIVE` | `PROFILE_MAPPING_RESOLVED` | `LEGACY_RECORD_EVIDENCE` | App 715 / info app/715 | Company President 50/50 executive profile | **HIGH** |
| `Safety` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | `EXCEL_BUSINESS_RULE` | App 283 / exp/PMS_Staff & Chief_PART_A.xlsx | Safety operational staff 70/30 profile | **HIGH** |
| `Safety Officer` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | `EXCEL_BUSINESS_RULE` | App 283 / exp/PMS_Staff & Chief_PART_A.xlsx | Safety operational staff 70/30 profile | **HIGH** |
| `Safety Officer&  ISO Control` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | `EXCEL_BUSINESS_RULE` | App 283 / exp/PMS_Staff & Chief_PART_A.xlsx | Specialized safety staff 70/30 profile | **HIGH** |
| `Section  Manager` | Section Manager | `PROFILE_MANAGEMENT` | `PROFILE_MAPPING_RESOLVED` | `LEGACY_RECORD_EVIDENCE` | App 305 / info app/305 | Section Manager 50/50 management profile (double space) | **HIGH** |
| `Section Manager` | Section Manager | `PROFILE_MANAGEMENT` | `PROFILE_MAPPING_RESOLVED` | `LEGACY_RECORD_EVIDENCE` | App 305 / info app/305 | Section Manager 50/50 management profile | **HIGH** |
| `Senior  Manager` | Senior Manager | `PROFILE_MANAGEMENT` | `PROFILE_MAPPING_RESOLVED` | `LEGACY_RECORD_EVIDENCE` | App 643 / info app/643 | Senior Manager 50/50 management profile (double space) | **HIGH** |
| `Senior Chief` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | `EXCEL_BUSINESS_RULE` | App 283 / exp/PMS_Staff & Chief_PART_A.xlsx | Senior chief 70/30 operational profile | **HIGH** |
| `Senior Manager` | Senior Manager | `PROFILE_MANAGEMENT` | `PROFILE_MAPPING_RESOLVED` | `LEGACY_RECORD_EVIDENCE` | App 643 / info app/643 | Senior Manager 50/50 management profile | **HIGH** |
| `Senior Specilaist` | Senior Manager | `PROFILE_MANAGEMENT` | `PROFILE_MAPPING_RESOLVED` | `LEGACY_RECORD_EVIDENCE` | App 643 / info app/643 | Senior Specialist 50/50 management profile (typo in App 53) | **HIGH** |
| `Service Engineer` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | `EXCEL_BUSINESS_RULE` | App 283 / exp/PMS_Staff & Chief_PART_A.xlsx | Field service staff 70/30 operational profile | **HIGH** |
| `Specialist` | Assistant Manager | `PROFILE_MANAGEMENT` | `PROFILE_MAPPING_RESOLVED` | `LEGACY_RECORD_EVIDENCE` | App 305 / info app/305 | Specialist equivalent to Asst. Sect. Mgr 50/50 | **HIGH** |
| `Staff` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | `EXCEL_BUSINESS_RULE` | App 283 / exp/PMS_Staff & Chief_PART_A.xlsx | Staff 70/30 operational profile | **HIGH** |
| `Supoort Marketing Chief` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | `EXCEL_BUSINESS_RULE` | App 283 / exp/PMS_Staff & Chief_PART_A.xlsx | Support chief 70/30 operational profile (typo in App 53) | **HIGH** |
| `Supoort Marketing Staff` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | `EXCEL_BUSINESS_RULE` | App 283 / exp/PMS_Staff & Chief_PART_A.xlsx | Support staff 70/30 operational profile (typo in App 53) | **HIGH** |
| `Support Marketing Chief` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | `EXCEL_BUSINESS_RULE` | App 283 / exp/PMS_Staff & Chief_PART_A.xlsx | Support chief 70/30 operational profile | **HIGH** |
| `Support Marketing Staff` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | `EXCEL_BUSINESS_RULE` | App 283 / exp/PMS_Staff & Chief_PART_A.xlsx | Support staff 70/30 operational profile | **HIGH** |
| `Technical Chief` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | `EXCEL_BUSINESS_RULE` | App 283 / exp/PMS_Staff & Chief_PART_A.xlsx | Technical chief 70/30 operational profile | **HIGH** |
| `Technical Service Chief` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | `EXCEL_BUSINESS_RULE` | App 283 / exp/PMS_Staff & Chief_PART_A.xlsx | Service chief 70/30 operational profile | **HIGH** |
| `Technical Service Engineer` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | `EXCEL_BUSINESS_RULE` | App 283 / exp/PMS_Staff & Chief_PART_A.xlsx | Service engineer 70/30 operational profile | **HIGH** |
| `Technical Staff` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | `EXCEL_BUSINESS_RULE` | App 283 / exp/PMS_Staff & Chief_PART_A.xlsx | Technical staff 70/30 operational profile | **HIGH** |
| `Technician` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | `EXCEL_BUSINESS_RULE` | App 283 / exp/PMS_Staff & Chief_PART_A.xlsx | Technician 70/30 operational profile | **HIGH** |
| `Trainee` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | `EXCEL_BUSINESS_RULE` | App 283 / exp/PMS_Staff & Chief_PART_A.xlsx | Trainee staff 70/30 operational profile | **HIGH** |
| `Vice President` | Vice President | `PROFILE_EXECUTIVE` | `PROFILE_MAPPING_RESOLVED` | `LEGACY_RECORD_EVIDENCE` | App 715 / info app/715 | Vice President 50/50 executive profile | **HIGH** |
| `Warehouse Staff` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | `EXCEL_BUSINESS_RULE` | App 283 / exp/PMS_Staff & Chief_PART_A.xlsx | Warehouse staff 70/30 operational profile | **HIGH** |
| `Warehouse Support` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | `EXCEL_BUSINESS_RULE` | App 283 / exp/PMS_Staff & Chief_PART_A.xlsx | Warehouse support staff 70/30 profile | **HIGH** |

### Position Mapping Verification Summary
* **Total Raw Position Values Audited:** **63** (covering 275 employee records in App 53).
* **`RESOLVED_WITH_DIRECT_EVIDENCE`:** **62** (272 employee records map deterministically to verified profile families).
* **`SOURCE_INVALID`:** **1** (`(EMPTY)` x3 records in App 53; fails closed with `PROFILE_SOURCE_INVALID`).
* **`AMBIGUOUS`:** **0**.
* **`NOT_FOUND`:** **0**.

---

## 6. Live App 794 Field-by-Field Manifest & Capacity Audit

| Field Code | Live Exists | Repo Spec Exists | Field Type | Live Formula (if CALC) | Confidential? | Client Writable? | Classification | Future Action / Destination |
| :--- | :---: | :---: | :---: | :--- | :---: | :---: | :---: | :--- |
| `Evaluation_Profile_Code` | No | Yes | `SINGLE_LINE_TEXT` | - | No | No (System Init) | **`MISSING_TARGET_FIELD`** | Add to write manifest |
| `Profile_Family` | No | Yes | `SINGLE_LINE_TEXT` | - | No | No (System Init) | **`MISSING_TARGET_FIELD`** | Add to write manifest |
| `PartA_Weight` | No | Yes | `NUMBER` | - | No | No (System Init) | **`MISSING_TARGET_FIELD`** | Add to write manifest |
| `PartB_Weight` | No | Yes | `NUMBER` | - | No | No (System Init) | **`MISSING_TARGET_FIELD`** | Add to write manifest |
| `PartA_Raw_Score` | Yes | Yes | `CALC` | `MBO_Point_1+...+MBO_Point_10` | Yes | No (CALC) | **`KEEP`** | Verified Tier D formula |
| `PartA_Weighted_Score` | Yes | Yes | `CALC` | `ROUND((PartA_Raw_Score*70)/100, 2)` | Yes | No (CALC) | **`SCHEMA_DRIFT`** | Hardcoded 70%; adapt for 50/50 |
| `PartB_Raw_Score` | Yes | Yes | `CALC` | `(Comp_1+...+Comp_5)/5` | Yes | No (CALC) | **`SCHEMA_DRIFT`** | Hardcoded /5; adapt for 7-item set |
| `PartB_Weighted_Score` | Yes | Yes | `CALC` | `ROUND(PartB_Raw_Score*0.3, 2)` | Yes | No (CALC) | **`SCHEMA_DRIFT`** | Hardcoded 30%; adapt for 50/50 |
| `Competency_Result_1..6` | Yes | Yes | `CALC` | `(Manager_Rating+GM_Rating)/2` | Yes | No (CALC) | **`KEEP`** | Verified Tier D formula |
| `Competency_Criteria_1..6`| Yes | Yes | `MULTI_LINE_TEXT` | - | No | No (System Init) | **`KEEP`** | Populated at initialization |
| `Manager_Competency_Rating_1..6`| Yes | Yes | `NUMBER` | - | Yes | Yes (Manager Stage) | **`KEEP`** | Native Permission Gated |
| `GM_Competency_Rating_1..6` | Yes | Yes | `NUMBER` | - | Yes | Yes (GM Stage) | **`KEEP`** | Native Permission Gated |
| `Competency_Result_7..8` | **No** | Yes | `CALC` | `(Manager_Rating+GM_Rating)/2` | Yes | No (CALC) | **`MISSING_TARGET_FIELD`** | Add for Management 8-item set |
| `Competency_Criteria_7..8`| **No** | Yes | `MULTI_LINE_TEXT` | - | No | No (System Init) | **`MISSING_TARGET_FIELD`** | Add for Management 8-item set |
| `Manager_Competency_Rating_7..8`| **No**| Yes | `NUMBER` | - | Yes | Yes (Manager Stage) | **`MISSING_TARGET_FIELD`** | Add for Management 8-item set |
| `GM_Competency_Rating_7..8` | **No** | Yes | `NUMBER` | - | Yes | Yes (GM Stage) | **`MISSING_TARGET_FIELD`** | Add for Management 8-item set |

---

## 7. Profile Master App vs Design Status (`DESIGN_APP_ID != DEPLOYED_APP_ID`)

* **Repository Design Reference:**
  - `App 796 Design` (Evaluation Profile Master) -> Status: Proposed Design Specification.
  - `App 797 Design` (Competency Master) -> Status: Proposed Design Specification.
* **Live App Registry Status (`APP_REGISTRY.md`):**
  - App 796 and App 797 are **NOT DEPLOYED** on the Kintone tenant.
  - `APP_REGISTRY.md` registers only App 53, 283, 794, 795.
* **Storage Options Evaluation:**
  - **Option A (Repository Configuration):** High performance, 0 API latency, Git versioning, instant testability. Recommended for Phase 3 baseline.
  - **Option B (Dedicated Kintone Master):** Native Kintone GUI for HR edits. Requires creating App 796/797, extra REST API calls, and sync overhead.
  - **Option C (Hybrid Engine):** Code configuration baseline for Phase 3; Phase 9 HR Control Center provides admin UI sync.
* **Decision Status:** **`PROFILE_CONFIGURATION_STORAGE = DECISION_REQUIRED`** (Critical Business Questions: 1).

---

## 8. Proposed Future Test Plan (`tests/evaluation-profile-foundation.test.js`)

*(Note: These 22 tests are designed for future implementation and have NOT yet been executed)*:
* `PROF-001`: Validates 8 evaluation groups mapped to 4 profile families.
* `PROF-002`: Confirms DGM maps to `PROFILE_MANAGEMENT` (50/50).
* `PROF-003`: Confirms GM and VP map to `PROFILE_EXECUTIVE` (50/50).
* `PROF-004`: Confirms Staff/Chief and Japanese Staff map to 70/30 profiles.
* `PROF-005`: Normalizes 62 valid raw position strings deterministically.
* `PROF-006`: Empty position string fails closed with `PROFILE_SOURCE_INVALID`.
* `PROF-007`: Unknown position string fails closed with `PROFILE_MAPPING_NOT_FOUND`.
* `PROF-008`: Operational Competency Set: 6 items displayed, 5 scored, COCE excluded (N_included = 5).
* `PROF-009`: Management Competency Set: 8 items displayed, 7 scored (N_included = 7).
* `PROF-010`: COCE / Compliance has `Included_In_Score === false` across all sets.
* `PROF-011`: Dynamic denominator derived from configuration (not hardcoded N=5).
* `PROF-012`: Appraiser Cardinality: 2-appraiser average matches Model A.
* `PROF-013`: Executive Appraiser Cardinality: 1-appraiser calculation handles single rating safely.
* `PROF-014`: Partial appraiser rating fails closed before stage completion.
* `PROF-015`: Half-Up rounding to 2 decimal places verified across Part A/B weighted scores.
* `PROF-016`: 70/30 profile final score calculation matches Excel ground truth.
* `PROF-017`: 50/50 profile final score calculation matches Excel ground truth.
* `PROF-018`: Annual Profile Freeze: profile snapshot immutable across mid-year stage refresh.
* `PROF-019`: Confidential appraiser scoring fields protected under native security model.
* `PROF-020`: Profile resolution decoupled from stage routing resolution.
* `PROF-021`: Missing Competency 7/8 fields on live schema detected and handled safely.
* `PROF-022`: Zero Kintone write operations executed during profile tests.

---

## 9. Change Manifest & Rollback Plan

* **Current Planning Task Change Manifest:** Repository documentation only (`project-docs/phase-3/MBO-P03-WP-001_PLAN.md`, living documents).
* **Current Kintone Change Manifest:** **`NONE / ZERO WRITES`**.
* **Current Rollback Plan:** Git revert of the documentation commit.
