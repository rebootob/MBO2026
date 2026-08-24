# Work Package Implementation Plan: MBO-P03-WP-001
## EVALUATION PROFILE & COMPETENCY CONFIGURATION FOUNDATION

> **Document Type:** Authoritative Repository Implementation Plan  
> **Phase:** `Phase 3: Evaluation Profile, Competency & Scoring Engine`  
> **Work Package ID:** `MBO-P03-WP-001`  
> **Status:** `PLAN_GATE: READY FOR INDEPENDENT REVIEW`  
> **Authoritative Phase 2 Baseline:** Commit `8fb306e` (Passed Implementation & Review Gates)  
> **Kintone Write Operations in Planning:** `0 (Strict Read-Only Mode Active)`  

---

## 1. Executive Summary & Purpose

The purpose of **`MBO-P03-WP-001`** is to establish the authoritative, configuration-driven **Evaluation Profile, Competency & Scoring Configuration Foundation** for MBO 2026. This foundational plan establishes:
1. The **Hierarchy of Evaluation Profiles:** Raw App 53 Position -> **8 Evaluation Groups** -> **4 Profile Families** -> **Scoring Configuration** (`DEC-023`).
2. The **Part A / Part B Weight Splits:** 70% Part A / 30% Part B for Staff & Japanese Staff; 50% Part A / 50% Part B for Management & Executive profiles (`DEC-023`).
3. The **6 Core Competencies & Dynamic COCE Formulation:** Competency 6 (Compliance / COCE) is evaluated as a gate (`Evaluated = YES`), but explicitly configured with `Included_In_Score = false`. Part B Raw Score calculates the dynamic average over all competencies where `Included_In_Score === true` (N_included = 5).
4. The **Annual Profile Freeze Rule:** Evaluation Profile is resolved at Annual Record Initialization and frozen for the entire Fiscal Year (`DEC-024`), strictly decoupled from dynamic stage routing.
5. The **Complete Position-to-Profile Mapping Engine:** Auditing all 63 raw position values in App 53 with strict fail-closed handling for missing or unmapped positions.

---

## 2. Profile Hierarchy: 8 Groups to 4 Profile Families

In accordance with frozen architecture decision **`DEC-023`**, the system standardizes the 8 organizational evaluation groups into **4 Canonical Profile Families**:

| Evaluation Group | Profile Family | Part A Weight (%) | Part B Weight (%) | Dynamic Denominator (N_included) | Historical Reference Source |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Staff & Chief** | `PROFILE_STAFF_CHIEF` | **70%** | **30%** | 5 | App 283 / `exp/PMS_Staff & Chief_PART_B.xlsx` |
| **Japanese Staff** | `PROFILE_JAPANESE_STAFF` | **70%** | **30%** | 5 | App 716 (`info app/716`) |
| **Assistant Manager** | `PROFILE_MANAGEMENT` | **50%** | **50%** | 5 | App 310 (`info app/310`) |
| **Section Manager** | `PROFILE_MANAGEMENT` | **50%** | **50%** | 5 | App 305 (`info app/305`) |
| **Senior Manager** | `PROFILE_MANAGEMENT` | **50%** | **50%** | 5 | App 643 (`info app/643`) |
| **Deputy General Manager** | `PROFILE_EXECUTIVE` | **50%** | **50%** | 5 | App 307 (`info app/307`) |
| **General Manager** | `PROFILE_EXECUTIVE` | **50%** | **50%** | 5 | App 640 (`info app/640`) |
| **Vice President** | `PROFILE_EXECUTIVE` | **50%** | **50%** | 5 | App 715 (`info app/715`) |

---

## 3. Position Mapping Inventory (All 63 Raw Positions Audited in App 53)

| Raw Position Value | Evaluation Group | Profile Family | Mapping Status | Evidence Source | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `` | UNRESOLVED | `UNRESOLVED` | `PROFILE_SOURCE_INVALID` | App 53 Text_2 | Empty or whitespace position string; fails closed |
| ` Chief` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | App 283 / DEC-023 | Staff & Chief 70/30 profile |
| ` Manager` | Section Manager | `PROFILE_MANAGEMENT` | `PROFILE_MAPPING_RESOLVED` | App 305 / DEC-023 | Section Manager 50/50 profile |
| `Accounting Chief` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | App 283 / DEC-023 | Staff & Chief 70/30 profile |
| `Accounting Staff` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | App 283 / DEC-023 | Staff & Chief 70/30 profile |
| `Advisor` | Japanese Staff | `PROFILE_JAPANESE_STAFF` | `PROFILE_MAPPING_RESOLVED` | App 716 / DEC-023 | Japanese Staff 70/30 profile |
| `Assistant Chief` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | App 283 / DEC-023 | Staff & Chief 70/30 profile |
| `Assistant Manager` | Assistant Manager | `PROFILE_MANAGEMENT` | `PROFILE_MAPPING_RESOLVED` | App 310 / App 305 / DEC-023 | Assistant Manager 50/50 profile |
| `Assistant Section Manager` | Assistant Manager | `PROFILE_MANAGEMENT` | `PROFILE_MAPPING_RESOLVED` | App 310 / App 305 / DEC-023 | Assistant Manager 50/50 profile |
| `Asst. Section Manager` | Assistant Manager | `PROFILE_MANAGEMENT` | `PROFILE_MAPPING_RESOLVED` | App 310 / App 305 / DEC-023 | Assistant Manager 50/50 profile |
| `CAM Staff` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | App 283 / DEC-023 | Staff & Chief 70/30 profile |
| `Chief` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | App 283 / DEC-023 | Staff & Chief 70/30 profile |
| `Chief of Engineer` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | App 283 / DEC-023 | Staff & Chief 70/30 profile |
| `Chief of Safety Officer` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | App 283 / DEC-023 | Staff & Chief 70/30 profile |
| `Clerk` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | App 283 / DEC-023 | Staff & Chief 70/30 profile |
| `Co Project Manager` | Section Manager | `PROFILE_MANAGEMENT` | `PROFILE_MAPPING_RESOLVED` | App 305 / DEC-023 | Section Manager 50/50 profile |
| `Contract (Apite)` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | App 283 / DEC-023 | Staff & Chief 70/30 profile |
| `Contract (Japan Support)` | Japanese Staff | `PROFILE_JAPANESE_STAFF` | `PROFILE_MAPPING_RESOLVED` | App 716 / DEC-023 | Japanese Staff 70/30 profile |
| `Coordinator` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | App 283 / DEC-023 | Staff & Chief 70/30 profile |
| `DESIGN ENGINEER ASSISTANT MANAGER ` | Assistant Manager | `PROFILE_MANAGEMENT` | `PROFILE_MAPPING_RESOLVED` | App 310 / App 305 / DEC-023 | Assistant Manager 50/50 profile |
| `Deputy General Manager` | Deputy General Manager | `PROFILE_EXECUTIVE` | `PROFILE_MAPPING_RESOLVED` | App 307 / DEC-023 | Deputy General Manager 50/50 profile |
| `Design Engineer` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | App 283 / DEC-023 | Staff & Chief 70/30 profile |
| `Driver` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | App 283 / DEC-023 | Staff & Chief 70/30 profile |
| `Engineering Staff` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | App 283 / DEC-023 | Staff & Chief 70/30 profile |
| `Executive Management Coordinator` | Vice President | `PROFILE_EXECUTIVE` | `PROFILE_MAPPING_RESOLVED` | App 715 / DEC-023 | Executive 50/50 profile |
| `Factory Manager` | Senior Manager | `PROFILE_MANAGEMENT` | `PROFILE_MAPPING_RESOLVED` | App 643 / DEC-023 | Senior Manager 50/50 profile (normalized typos/spaces) |
| `General Manager` | General Manager | `PROFILE_EXECUTIVE` | `PROFILE_MAPPING_RESOLVED` | App 640 / App 307 / DEC-023 | General Manager 50/50 profile (case-normalized) |
| `General manager` | General Manager | `PROFILE_EXECUTIVE` | `PROFILE_MAPPING_RESOLVED` | App 640 / App 307 / DEC-023 | General Manager 50/50 profile (case-normalized) |
| `IT Staff` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | App 283 / DEC-023 | Staff & Chief 70/30 profile |
| `Interpreter` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | App 283 / DEC-023 | Staff & Chief 70/30 profile |
| `Manager` | Section Manager | `PROFILE_MANAGEMENT` | `PROFILE_MAPPING_RESOLVED` | App 305 / DEC-023 | Section Manager 50/50 profile |
| `Marketing  Chief` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | App 283 / DEC-023 | Staff & Chief 70/30 profile |
| `Marketing Chief` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | App 283 / DEC-023 | Staff & Chief 70/30 profile |
| `Marketing Engineer` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | App 283 / DEC-023 | Staff & Chief 70/30 profile |
| `Marketing Staff` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | App 283 / DEC-023 | Staff & Chief 70/30 profile |
| `Messenger` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | App 283 / DEC-023 | Staff & Chief 70/30 profile |
| `Operator` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | App 283 / DEC-023 | Staff & Chief 70/30 profile |
| `President` | Vice President | `PROFILE_EXECUTIVE` | `PROFILE_MAPPING_RESOLVED` | App 715 / DEC-023 | Executive 50/50 profile |
| `Safety` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | App 283 / DEC-023 | Staff & Chief 70/30 profile |
| `Safety Officer` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | App 283 / DEC-023 | Staff & Chief 70/30 profile |
| `Safety Officer&  ISO Control` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | App 283 / DEC-023 | Staff & Chief 70/30 profile |
| `Section  Manager` | Section Manager | `PROFILE_MANAGEMENT` | `PROFILE_MAPPING_RESOLVED` | App 305 / DEC-023 | Section Manager 50/50 profile |
| `Section Manager` | Section Manager | `PROFILE_MANAGEMENT` | `PROFILE_MAPPING_RESOLVED` | App 305 / DEC-023 | Section Manager 50/50 profile |
| `Senior  Manager` | Senior Manager | `PROFILE_MANAGEMENT` | `PROFILE_MAPPING_RESOLVED` | App 643 / DEC-023 | Senior Manager 50/50 profile (normalized typos/spaces) |
| `Senior Chief` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | App 283 / DEC-023 | Staff & Chief 70/30 profile |
| `Senior Manager` | Senior Manager | `PROFILE_MANAGEMENT` | `PROFILE_MAPPING_RESOLVED` | App 643 / DEC-023 | Senior Manager 50/50 profile (normalized typos/spaces) |
| `Senior Specilaist` | Senior Manager | `PROFILE_MANAGEMENT` | `PROFILE_MAPPING_RESOLVED` | App 643 / DEC-023 | Senior Manager 50/50 profile (normalized typos/spaces) |
| `Service Engineer` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | App 283 / DEC-023 | Staff & Chief 70/30 profile |
| `Specialist` | Assistant Manager | `PROFILE_MANAGEMENT` | `PROFILE_MAPPING_RESOLVED` | App 310 / App 305 / DEC-023 | Assistant Manager 50/50 profile |
| `Staff` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | App 283 / DEC-023 | Staff & Chief 70/30 profile |
| `Supoort Marketing Chief` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | App 283 / DEC-023 | Staff & Chief 70/30 profile |
| `Supoort Marketing Staff` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | App 283 / DEC-023 | Staff & Chief 70/30 profile |
| `Support Marketing Chief` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | App 283 / DEC-023 | Staff & Chief 70/30 profile |
| `Support Marketing Staff` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | App 283 / DEC-023 | Staff & Chief 70/30 profile |
| `Technical Chief` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | App 283 / DEC-023 | Staff & Chief 70/30 profile |
| `Technical Service Chief` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | App 283 / DEC-023 | Staff & Chief 70/30 profile |
| `Technical Service Engineer` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | App 283 / DEC-023 | Staff & Chief 70/30 profile |
| `Technical Staff` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | App 283 / DEC-023 | Staff & Chief 70/30 profile |
| `Technician` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | App 283 / DEC-023 | Staff & Chief 70/30 profile |
| `Trainee` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | App 283 / DEC-023 | Staff & Chief 70/30 profile |
| `Vice President` | Vice President | `PROFILE_EXECUTIVE` | `PROFILE_MAPPING_RESOLVED` | App 715 / DEC-023 | Executive 50/50 profile |
| `Warehouse Staff` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | App 283 / DEC-023 | Staff & Chief 70/30 profile |
| `Warehouse Support` | Staff & Chief | `PROFILE_STAFF_CHIEF` | `PROFILE_MAPPING_RESOLVED` | App 283 / DEC-023 | Staff & Chief 70/30 profile |

### Position Mapping Aggregate Summary
* **Total Raw Position Values Audited:** **63** (275 total employee records in App 53).
* **`PROFILE_MAPPING_RESOLVED`:** **62** (272 employee records map deterministically to verified profile families).
* **`PROFILE_SOURCE_INVALID`:** **1** (`(EMPTY)` x3 records in App 53; fail closed with `PROFILE_SOURCE_INVALID`).
* **`PROFILE_MAPPING_AMBIGUOUS`:** **0**.
* **`PROFILE_MAPPING_NOT_FOUND`:** **0**.

---

## 4. Competency Source Traceability Matrix

The 6 core competencies are traced against authoritative business artifacts (`exp/PMS_Staff & Chief_PART_B.xlsx`, App 283, and App 794):

| Competency Code | Name (TH) | Name (EN) | Source Type | Source File / App | Field Code / Criteria | Rating Min | Rating Max | Included In Score | Required | Applicable Profile Family |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **`COMP_01`** | ความสามารถในการปรับตัว | Adaptability | `EXCEL_AND_LIVE_APP` | `exp/PMS_Staff & Chief_PART_B.xlsx` / App 794 | `Competency_Result_1` | 1 | 5 | **`true`** | Yes | All Profile Families |
| **`COMP_02`** | การแก้ปัญหา | Problem Solving | `EXCEL_AND_LIVE_APP` | `exp/PMS_Staff & Chief_PART_B.xlsx` / App 794 | `Competency_Result_2` | 1 | 5 | **`true`** | Yes | All Profile Families |
| **`COMP_03`** | การมุ่งเน้นลูกค้า | Customer Focus | `EXCEL_AND_LIVE_APP` | `exp/PMS_Staff & Chief_PART_B.xlsx` / App 794 | `Competency_Result_3` | 1 | 5 | **`true`** | Yes | All Profile Families |
| **`COMP_04`** | การสร้างมูลค่าเพิ่ม | Additional Value Creation | `EXCEL_AND_LIVE_APP` | `exp/PMS_Staff & Chief_PART_B.xlsx` / App 794 | `Competency_Result_4` | 1 | 5 | **`true`** | Yes | All Profile Families |
| **`COMP_05`** | ความตระหนักด้านความปลอดภัย | Safety Awareness | `EXCEL_AND_LIVE_APP` | `exp/PMS_Staff & Chief_PART_B.xlsx` / App 794 | `Competency_Result_5` | 1 | 5 | **`true`** | Yes | All Profile Families |
| **`COMP_06`** | การปฏิบัติตามกฎระเบียบและจริยธรรม | Compliance / COCE | `EXCEL_AND_LIVE_APP` | `exp/PMS_Staff & Chief_PART_B.xlsx` / App 794 | `Competency_Result_6` | 1 | 5 | **`false`** | Yes | All Profile Families |

---

## 5. Scoring Architecture & Dynamic Denominator Formulation

### A. Dynamic Denominator Rule
$$N_{\text{included}} = \text{count}(\text{competencies where } \text{comp.Included\_In\_Score} == \text{true})$$
For the current 6-competency framework, $N_{\text{included}} = 5$. The scoring calculation engine **shall dynamically derive $N_{\text{included}}$ from configuration** and never hardcode $N=5$ or competency index 6.

### B. Mathematical Scoring Formulas
1. **Part A Raw Score:** Sum of active objective scores:
   $$\text{Part A Raw Score} = \sum_{i=1}^{\text{Objective\_Count}} \text{MBO\_Point\_}i$$
2. **Part A Weighted Score:**
   $$\text{Part A Weighted Score} = \text{ROUND}\left(\text{Part A Raw Score} \times \frac{\text{Part\_A\_Weight}}{100}, 2\right)$$
3. **Part B Raw Score:** Average of scored competencies:
   $$\text{Part B Raw Score} = \frac{\sum_{\text{comp} \in \text{Competencies, Included\_In\_Score=true}} \text{Competency\_Result\_comp}}{N_{\text{included}}}$$
4. **Part B Weighted Score:**
   $$\text{Part B Weighted Score} = \text{ROUND}\left(\text{Part B Raw Score} \times \frac{\text{Part\_B\_Weight}}{100}, 2\right)$$
5. **Final Evaluation Score:**
   $$\text{Final Score} = \text{Part A Weighted Score} + \text{Part B Weighted Score}$$
6. **Rounding Standard:** Half-Up to exactly 2 decimal places.

---

## 6. Profile Configuration Storage Architecture Analysis

| Storage Option | Architecture Description | HR Maintainability | Auditability & Versioning | Performance & Latency | Governance Assessment |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Option 1: Repository Configuration Engine** | Pure configuration engine in `config/evaluation-profiles.js`. | Code edit via Git review. | Full Git commit history. | Instant (0 API calls). | **Recommended for Phase 3 Baseline** |
| **Option 2: Dedicated Kintone Profile Master App** | New Kintone App for Profiles. | Direct Kintone GUI edit. | Kintone record revision. | Requires extra REST GET. | Deferred to Phase 9 HR Control Center |
| **Option 3: Hybrid Configuration Engine** | Code engine with Phase 9 UI sync. | GUI edit in Phase 9. | Multi-tier logging. | Instant cache with sync. | Target Long-Term State |

> **Current Decision Status:** `PROFILE_CONFIGURATION_STORAGE = DECISION_REQUIRED`  
> **Critical Business Question Count:** `1` (User alignment on Option 1 for Phase 3 execution).

---

## 7. App 794 Field-by-Field Phase 3 Manifest

| Field Code | Field Type | Current Required | Current Default | Current Purpose | Phase 3 Purpose | Confidential? | Client Writable? | Phase 3 Classification | Future Destination / Action |
| :--- | :---: | :---: | :---: | :--- | :--- | :---: | :---: | :---: | :--- |
| `Evaluation_Profile_Code` | `SINGLE_LINE_TEXT` | No | `""` | None (Unmapped) | Profile Snapshot ID | No | No (System Init) | **`NEW_TARGET_FIELD`** | Add to write manifest |
| `Profile_Family` | `SINGLE_LINE_TEXT` | No | `""` | None (Unmapped) | Profile Family Name | No | No (System Init) | **`NEW_TARGET_FIELD`** | Add to write manifest |
| `PartA_Weight` | `NUMBER` | No | `""` | None (Unmapped) | Part A Weight Snapshot | No | No (System Init) | **`NEW_TARGET_FIELD`** | Add to write manifest |
| `PartB_Weight` | `NUMBER` | No | `""` | None (Unmapped) | Part B Weight Snapshot | No | No (System Init) | **`NEW_TARGET_FIELD`** | Add to write manifest |
| `PartA_Raw_Score` | `CALC` | No | `""` | Sum MBO Points 1..10 | Sum MBO Points 1..10 | Yes (Part B/Score) | No (CALC) | **`KEEP`** | Verified Tier D formula |
| `PartA_Weighted_Score` | `CALC` | No | `""` | `ROUND(PartA*70/100, 2)` | Profile-driven Calc | Yes | No (CALC) | **`REUSE / MIGRATE`** | Formula adaptation |
| `PartB_Raw_Score` | `CALC` | No | `""` | `(Comp1..5)/5` | Dynamic included avg | Yes | No (CALC) | **`KEEP`** | Matches N_included=5 |
| `PartB_Weighted_Score` | `CALC` | No | `""` | `ROUND(PartB*0.3, 2)` | Profile-driven Calc | Yes | No (CALC) | **`REUSE / MIGRATE`** | Formula adaptation |
| `Competency_Result_1..6` | `CALC` | No | `""` | Appraiser Average | Appraiser Average | Yes | No (CALC) | **`KEEP`** | Verified Tier D formula |
| `Competency_Criteria_1..6`| `MULTI_LINE_TEXT` | No | `""` | Criteria text | Profile-specific criteria | No | No (System Init) | **`KEEP`** | Populated at init |
| `Manager_Competency_Rating_1..6`| `NUMBER`| No | `""` | Manager Rating 1..5 | Manager Rating 1..5 | Yes (Manager) | Yes (Manager Stage) | **`KEEP`** | Native Permission Gated |
| `GM_Competency_Rating_1..6` | `NUMBER` | No | `""` | GM Rating 1..5 | GM Rating 1..5 | Yes (GM) | Yes (GM Stage) | **`KEEP`** | Native Permission Gated |

---

## 8. Security & Confidentiality Architecture

In accordance with `SECURITY_MODEL.md`:
* **Employee / Shared Requester Boundary:** Must NEVER have access to manager/GM competency ratings, internal comments, or Part B scores.
* **Native Security Enforcement:** Confidentiality is enforced 100% via **Kintone Native Field Permissions** (`/k/v1/field/acl.json`). JavaScript logic is UX-only.

---

## 9. Proposed Future Test Plan (`tests/evaluation-profile-foundation.test.js`)

*(Note: These 20 tests are planned for Phase 3 implementation and have NOT yet been executed)*:
* `PROF-001`: Validates all 8 confirmed evaluation groups and 4 profile families.
* `PROF-002`: Normalizes canonical position strings (e.g. `Operator` -> `PROFILE_STAFF_CHIEF`).
* `PROF-003`: Pilot Employee `0149` (`Marketing Staff`) resolves to `PROFILE_STAFF_CHIEF` (70/30).
* `PROF-004`: Japanese Staff (`Contract (Japan Support)`) resolves to `PROFILE_JAPANESE_STAFF` (70/30).
* `PROF-005`: Management positions (`Section Manager`, `General Manager`) resolve to 50/50 profiles.
* `PROF-006`: Missing / empty position fails closed with `PROFILE_SOURCE_INVALID`.
* `PROF-007`: Unknown position string fails closed with `PROFILE_MAPPING_NOT_FOUND`.
* `PROF-008`: Ambiguous position matches fail closed with `PROFILE_MAPPING_AMBIGUOUS`.
* `PROF-009`: Validates 6 core competencies with exact Thai and English naming.
* `PROF-010`: COCE / Compliance has `Included_In_Score === false`.
* `PROF-011`: Competencies 1–5 have `Included_In_Score === true`.
* `PROF-012`: Part B Raw Score denominator dynamically equals count of included competencies (N_included = 5).
* `PROF-013`: Half-Up rounding to 2 decimal places for Part A and Part B weighted scores.
* `PROF-014`: 70/30 profile final score calculation matches Excel ground truth.
* `PROF-015`: 50/50 profile final score calculation matches Excel ground truth.
* `PROF-016`: Annual Profile Freeze: profile snapshot immutable across stage transitions.
* `PROF-017`: Confidential appraiser scoring fields protected under native security model.
* `PROF-018`: Profile resolution decoupled from stage routing resolution.
* `PROF-019`: Read-only safety guard protects App 53, App 794, App 795 during profile resolution.
* `PROF-020`: Zero Kintone write operations executed during profile tests.

---

## 10. Expected Change Manifest & Rollback Plan

* **Current Planning Task Change Manifest:** Repository documentation only (`project-docs/phase-3/MBO-P03-WP-001_PLAN.md`, living documents).
* **Current Kintone Change Manifest:** **`NONE / ZERO WRITES`**.
* **Current Rollback Plan:** Git revert of the documentation commit.
* **Future Implementation Change Manifest:** Will be established under the approved implementation Work Package.
