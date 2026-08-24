# Work Package Implementation Plan: MBO-P03-WP-002
## HYBRID PROFILE & SCORING CONFIGURATION FOUNDATION
### Architecture Design Plan for Profile & Scoring Master, Resolution Engine & Hybrid Backup Pipeline

> **Document Type:** Authoritative Repository Implementation Plan  
> **Phase:** `Phase 3: Evaluation Profile, Competency & Scoring Engine`  
> **Work Package ID:** `MBO-P03-WP-002`  
> **Mode:** `PLAN ONLY (READ-ONLY DISCOVERY)`  
> **Implementation Authorization:** **`IMPLEMENTATION_AUTHORIZED = NO`**  
> **Plan Gate Status:** **`PLAN_GATE: PENDING INDEPENDENT REVIEW`**  
> **Governance Decisions:**  
> - `DEC-035: SCORING_SOURCE_OF_TRUTH = LIVE_KINTONE_FIRST`  
> - `DEC-036: APPRAISER_WEIGHT_AND_COMPLETENESS_GOVERNANCE`  
> - `DEC-037: PROFILE_CONFIGURATION_STORAGE = HYBRID_OPTION_C`  
> **Authoritative Baseline:** Passed & Frozen WP-001 (`Plan Commit 6e72553`, `Review Metadata Commit 9b2882e`, `Baseline Commit 8fb306e`)  
> **Kintone Write Operations in Planning:** `0 (Strict Read-Only Mode Active; WRITE_ALLOWED_APPS = [])`  

---

## 1. Executive Summary & Purpose

The purpose of **MBO-P03-WP-002** is to design the implementation architecture for the **Hybrid Profile & Scoring Configuration Foundation** under `DEC-037 (Option C: Hybrid Architecture)`.

This plan specifies the design for:
1. The **Kintone Profile / Scoring Configuration Master App** (`V2_RUNTIME_CONFIGURATION_SOURCE`).
2. The **Versioned Profile & Scoring Configuration Resolution Engine**.
3. The **App 794 Annual Record Initialization Snapshot Model**.
4. The **Git Repository Immutable Backup & Recovery Pipeline** (`V2_BACKUP_AUDIT_RECOVERY_SOURCE`).
5. The **Publish, Integrity Verification, and Rollback Governance Model**.

> **CRITICAL GOVERNANCE DIRECTIVE:**  
> This task is **PLANNING ONLY**. No source code implementation, schema specification changes, Kintone app creation, or Kintone record mutations are authorized until `MBO-P03-WP-002 PLAN_GATE = PASS` and explicit user authorization is granted.

---

## 2. Governance Framework & The Three System Sources

This work package strictly operates across three distinct system sources:

| Source Identifier | Role & Function | Primary Purpose | Fail-Closed Policy |
| :--- | :--- | :--- | :--- |
| **`LEGACY_SCORING_EVIDENCE_SOURCE`** | Existing deployed Kintone PMS apps (Apps 283, 716, 310, 305, 643, 307, 640, 715) | Baseline evidence for legacy calculation formulas & weights (`DEC-035`) | Read-only discovery reference |
| **`V2_RUNTIME_CONFIGURATION_SOURCE`** | Standalone Kintone Master App (Proposed App ID: `NOT_ALLOCATED`) | Primary active runtime source for HR profile & scoring administration | If missing/inconsistent $\implies$ **FAIL CLOSED** |
| **`V2_BACKUP_AUDIT_RECOVERY_SOURCE`** | Immutable JSON snapshots in controlled versioned repository path | Offline audit, disaster recovery, and publish verification | **NOT an automatic runtime fallback** |

> **Fail-Closed Runtime Rule:**  
> Git backup is **NOT** an automatic silent runtime fallback. If the runtime Kintone configuration is unavailable, unpublished, or inconsistent, the runtime engine must **FAIL CLOSED** with `SCORING_CONFIG_RESOLUTION_FAILED`. It must **NEVER** silently calculate scores from a stale repository file.

---

## 3. Standalone Kintone Master App Design (`V2_RUNTIME_CONFIGURATION_SOURCE`)

### A. Master App Status & Allocation
* **App Allocation Status:** **`NOT_ALLOCATED`** (No Kintone app created during planning).
* **Target Environment:** MBO V2 Production / Sandbox Environment.

### B. Proposed Master Field Schema (22 Attributes)
*(Proposed schema to be created upon WP-002 execution authorization)*

| Attribute # | Field Code | Field Type | Purpose / Description | Allowed Values / Validation |
| :---: | :--- | :---: | :--- | :--- |
| 1 | `Profile_Code` | `SINGLE_LINE_TEXT` | Unique profile identifier | e.g. `PROF_STAFF_CHIEF_V1`, `PROF_ASST_MGR_V1` |
| 2 | `Profile_Family` | `SINGLE_LINE_TEXT` | High-level profile family | `PROFILE_STAFF_CHIEF`, `PROFILE_JAPANESE_STAFF`, `PROFILE_MANAGEMENT`, `PROFILE_EXECUTIVE` |
| 3 | `Scoring_Config_Code` | `SINGLE_LINE_TEXT` | Unique scoring configuration code | e.g. `SCORE_CFG_70_30_V1`, `SCORE_CFG_60_40_V1` |
| 4 | `Scoring_Config_Version` | `SINGLE_LINE_TEXT` | Immutable version identifier | e.g. `v1.0.0`, `v1.1.0` |
| 5 | `Config_Status` | `DROP_DOWN` | Lifecycle status | `DRAFT`, `VALIDATED`, `PUBLISHED`, `SUPERSEDED`, `RETIRED` |
| 6 | `Effective_From` | `DATE` | Start date of applicability | ISO Date (`YYYY-MM-DD`) |
| 7 | `Effective_To` | `DATE` | End date of applicability | ISO Date (`YYYY-MM-DD`) |
| 8 | `Fiscal_Year` | `SINGLE_LINE_TEXT` | Applicable Fiscal Year | e.g. `FY2026`, `ALL` |
| 9 | `PartA_Weight` | `NUMBER` | MBO Objectives percentage weight | `70`, `60`, `50` (Must sum to 100 with Part B) |
| 10 | `PartB_Weight` | `NUMBER` | Competencies percentage weight | `30`, `40`, `50` (Must sum to 100 with Part A) |
| 11 | `Expected_Appraiser_Count` | `NUMBER` | Required scoring appraisers ($K_{\text{expected}}$) | `1` (Executive GM/VP), `2` (Operational & Mgmt) |
| 12 | `Appraiser_Weight_Rule_Code` | `SINGLE_LINE_TEXT` | Layer 1 Appraiser weighting rule | `EQUAL_DISTRIBUTION_V1` ($1/K_{\text{expected}}$) |
| 13 | `Part_A_Scoring_Mode` | `DROP_DOWN` | Objective calculation mode | `DIFFICULTY_ACHIEVEMENT_MATRIX`, `ACHIEVEMENT_DIRECT` |
| 14 | `Competency_Set_Code` | `SINGLE_LINE_TEXT` | Applicable competency set | `COMP_SET_OPERATIONAL_V1`, `COMP_SET_MANAGEMENT_V1` |
| 15 | `PartA_Rounding_Rule` | `SINGLE_LINE_TEXT` | Part A weighted score rounding | `UNIFIED_HALF_UP_2_DECIMALS` / `PER_APP_LEGACY` |
| 16 | `PartB_Raw_Rounding_Rule` | `SINGLE_LINE_TEXT` | Part B raw score rounding | `UNIFIED_HALF_UP_2_DECIMALS` / `PER_APP_LEGACY` |
| 17 | `PartB_Weighted_Rounding_Rule`| `SINGLE_LINE_TEXT` | Part B weighted score rounding | `UNIFIED_HALF_UP_2_DECIMALS` / `PER_APP_LEGACY` |
| 18 | `Final_Rounding_Rule` | `SINGLE_LINE_TEXT` | Final 100-point score rounding | `UNIFIED_HALF_UP_2_DECIMALS` / `PER_APP_LEGACY` |
| 19 | `Published_At` | `DATETIME` | Timestamp of publish activation | ISO DateTime |
| 20 | `Published_By` | `USER_SELECT` | User account executing publish | Kintone User |
| 21 | `Supersedes_Config_Version` | `SINGLE_LINE_TEXT` | Previous version superseded by this config | e.g. `v1.0.0` or `NONE` |
| 22 | `Configuration_Hash` | `SINGLE_LINE_TEXT` | SHA-256 hash of canonical JSON config | Hex SHA-256 string |

---

## 4. Separation of Profile Family vs Scoring Configuration

The architecture strictly distinguishes **Profile Family** from **Scoring Configuration**:

```
PROFILE FAMILY (Structural Classification)
 ├── PROFILE_STAFF_CHIEF
 ├── PROFILE_JAPANESE_STAFF
 ├── PROFILE_MANAGEMENT ────────┐
 └── PROFILE_EXECUTIVE          │
                                ▼
SCORING CONFIGURATION (Versioned Calculation Rules)
 ├── SCORE_CFG_70_30_V1  (Staff & Chief, Japanese Staff: 70/30, K=2, MATRIX)
 ├── SCORE_CFG_60_40_V1  (Assistant Manager: 60/40, K=2, MATRIX)
 ├── SCORE_CFG_50_50_V1  (Section Mgr, Senior Mgr, DGM: 50/50, K=2, MATRIX)
 └── SCORE_CFG_EXEC_V1   (General Mgr, Vice President: 50/50, K=1, DIRECT)
```

* **Governance Rule:** Profile Family **MUST NOT** hardcode scoring splits or appraiser cardinality. Scoring behavior is resolved dynamically via versioned `Scoring_Config_Code`.

---

## 5. Current Configuration Baseline Reproduction

The proposed Master App must reproduce frozen WP-001 deployed truth across all 8 evaluation groups:

| Evaluation Group | Profile Family | Scoring Config Code | Part A Weight | Part B Weight | Deployed Appraisers ($K_{\text{expected}}$) | Layer 1 Appraiser Weights | Part A Scoring Mode | Competency Set Code | Scored Items ($N_{\text{included}}$) |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :--- | :--- | :---: |
| **Staff & Chief** | `PROFILE_STAFF_CHIEF` | `SCORE_CFG_70_30_V1` | **70%** | **30%** | 2 | **50% / 50%** | `DIFFICULTY_ACHIEVEMENT_MATRIX` | `COMP_SET_OPERATIONAL_V1` | **5** (COCE Excluded) |
| **Japanese Staff** | `PROFILE_JAPANESE_STAFF`| `SCORE_CFG_70_30_V1` | **70%** | **30%** | 2 | **50% / 50%** | `DIFFICULTY_ACHIEVEMENT_MATRIX` | `COMP_SET_OPERATIONAL_V1` | **5** (COCE Excluded) |
| **Assistant Manager**| `PROFILE_MANAGEMENT` | `SCORE_CFG_60_40_V1` | **60%** | **40%** | 2 | **50% / 50%** | `DIFFICULTY_ACHIEVEMENT_MATRIX` | `COMP_SET_MANAGEMENT_V1` | **7** (COCE Excluded) |
| **Section Manager** | `PROFILE_MANAGEMENT` | `SCORE_CFG_50_50_V1` | **50%** | **50%** | 2 | **50% / 50%** | `DIFFICULTY_ACHIEVEMENT_MATRIX` | `COMP_SET_MANAGEMENT_V1` | **7** (COCE Excluded) |
| **Senior Manager** | `PROFILE_MANAGEMENT` | `SCORE_CFG_50_50_V1` | **50%** | **50%** | 2 | **50% / 50%** | `DIFFICULTY_ACHIEVEMENT_MATRIX` | `COMP_SET_MANAGEMENT_V1` | **7** (COCE Excluded) |
| **Deputy General Mgr**| `PROFILE_MANAGEMENT` | `SCORE_CFG_50_50_V1` | **50%** | **50%** | 2 | **50% / 50%** | `DIFFICULTY_ACHIEVEMENT_MATRIX` | `COMP_SET_MANAGEMENT_V1` | **7** (COCE Excluded) |
| **General Manager** | `PROFILE_EXECUTIVE` | `SCORE_CFG_EXEC_V1` | **50%** | **50%** | **1** | **100%** | `ACHIEVEMENT_DIRECT` | `COMP_SET_MANAGEMENT_V1` | **7** (COCE Excluded) |
| **Vice President** | `PROFILE_EXECUTIVE` | `SCORE_CFG_EXEC_V1` | **50%** | **50%** | **1** | **100%** | `ACHIEVEMENT_DIRECT` | `COMP_SET_MANAGEMENT_V1` | **7** (COCE Excluded) |

---

## 6. Immutable Configuration Version Model & Lifecycle Contract

### A. 1 Record = 1 Immutable Version
* Each record in the Master App represents exactly **one immutable scoring configuration version** (`Scoring_Config_Code` + `Scoring_Config_Version`).

### B. Configuration Lifecycle States
```
 [ DRAFT ] ──(Validate)──> [ VALIDATED ] ──(Publish Pipeline)──> [ PUBLISHED ] ──(New Version Activated)──> [ SUPERSEDED / RETIRED ]
```

### C. Immutability Boundary Contract
* Once a record transitions to **`PUBLISHED`** and is referenced by any App 794 Annual Record, its scoring-content fields (`PartA_Weight`, `PartB_Weight`, `Expected_Appraiser_Count`, `Part_A_Scoring_Mode`, etc.) are **PERMANENTLY LOCKED**.
* Any business scoring change requires creating a **NEW Master Record** with an incremented `Scoring_Config_Version` (e.g. `v1.1.0`).

---

## 7. Native Kintone Permission & Publish Authority Model

Security boundaries are enforced strictly via **Native Kintone App & Field Permissions** (JavaScript is UX-only):

| Role / User Group | Master App Permission Level | Form Field Access Rights |
| :--- | :--- | :--- |
| **HR Maintainer** | Add / Edit Draft Records | Full access to Draft fields; blocked from editing Published records |
| **HR Publisher / Approver** | Publish Authority | Can update `Config_Status` from `VALIDATED` to `PUBLISHED` via pipeline |
| **System Runtime Reader** | Read Only (REST API / JS) | Can read `PUBLISHED` records for score resolution |
| **General Employee / Requester** | **NO ACCESS (Hidden)** | Zero view/read/write permissions on Master App |

---

## 8. Hybrid Publish Pipeline Design (`Option C`)

The publish process enforces a multi-stage verification gate before activation:

```
Step 1: HR Draft Creation & Content Edit on Master App
   │
Step 2: Automated Structural Validation (Weights sum 100, N_included, Mode valid)
   │
Step 3: Canonical JSON Snapshot Generation
   │
Step 4: Repository Backup Commit & Verification (Controlled Versioned Repository Path)
   │     ├── Check Git file creation & SHA-256 hash match
   │     └── If Hash Mismatch / Git Backup Error ───────────► [ FAIL CLOSED: BLOCK PUBLISH ]
   │
Step 5: Controlled Kintone Activation (Set Status = PUBLISHED)
   │
Step 6: Kintone Read-Back Verification (Re-fetch REST API record and verify hash)
```

---

## 9. Controlled Repository Backup Structure (`V2_BACKUP_AUDIT_RECOVERY_SOURCE`)

* **Repository Backup Strategy:** Controlled versioned repository path defined and approved during WP-002 execution.
* **Canonical JSON Format:** Standardized UTF-8 JSON containing complete 22-attribute payload and SHA-256 `Configuration_Hash`.
* **Restore & Recovery Procedure:** Offline audit tool reads repository JSON snapshots to verify historical App 794 score calculations independently.

---

## 10. Deterministic Runtime Resolution & Position Fail-Closed

### A. Resolution Flow
$$\text{Raw Title} \xrightarrow{\text{normalize\_title()}} \text{Normalized Position} \xrightarrow{\text{Position Matrix}} \text{Profile\_Code} \xrightarrow{\text{Master App}} \text{Scoring\_Config\_Code} + \text{Version}$$

### B. Fail-Closed Boundaries
* If `normalize_title(raw)` matches an ambiguous position (29 raw values / 147 records) or invalid position (1 raw value / 3 records) $\implies$ **`PROFILE_MAPPING_AMBIGUOUS` (Fail Closed)**.
* If Master App lookup returns 0 published configurations or >1 active overlapping configurations $\implies$ **`SCORING_CONFIG_RESOLUTION_FAILED` (Fail Closed)**.

---

## 11. App 794 Annual Record Initialization Snapshot

At Annual Record Initialization, physical snapshot fields are populated on App 794:
- `Evaluation_Profile_Code`
- `Profile_Family`
- `Scoring_Config_Code`
- `Scoring_Config_Version`
- `Expected_Appraiser_Count`
- `PartA_Weight`
- `PartB_Weight`
- `Competency_Set_Code`

Derived runtime rules (`Appraiser_Weight_Rule_Code`, `Part_A_Scoring_Mode`, `Rounding_Rules`) are resolved deterministically from `Scoring_Config_Version` to guarantee permanent historical scoring reproducibility.

---

## 12. Master Configuration Integrity Validations

1. `PartA_Weight` + `PartB_Weight` == 100.
2. `Expected_Appraiser_Count` $\in \{1, 2\}$.
3. Appraiser Weights sum to 100% ($K=1 \implies 100\%$, $K=2 \implies 50/50\%$).
4. `Part_A_Scoring_Mode` $\in \{\text{DIFFICULTY\_ACHIEVEMENT\_MATRIX}, \text{ACHIEVEMENT\_DIRECT}\}$.
5. Competency Item 6 (`COMP_COCE`) `Included_In_Score == false`.
6. No overlapping `Effective_From` and `Effective_To` dates for the same profile in `PUBLISHED` status.
7. SHA-256 `Configuration_Hash` matches payload exactly.

---

## 13. Future Test Matrix Plan (Planning Tests Only)

* `TEST-WP002-001`: Master record structural validation (Part A + B = 100).
* `TEST-WP002-002`: Duplicate version creation blocked.
* `TEST-WP002-003`: Draft config ignored by runtime resolution engine.
* `TEST-WP002-004`: Published config mutation blocked by permission boundary.
* `TEST-WP002-005`: Git backup snapshot hash mismatch blocks activation (Fail Closed).
* `TEST-WP002-006`: Kintone read-back verification after publish.
* `TEST-WP002-007`: Ambiguous position (147 records) halts initialization (`PROFILE_MAPPING_AMBIGUOUS`).
* `TEST-WP002-008`: Assistant Manager resolves to `SCORE_CFG_60_40_V1`.
* `TEST-WP002-009`: Executive GM resolves to `SCORE_CFG_EXEC_V1` ($K=1$, 100%, `ACHIEVEMENT_DIRECT`).

---

## 14. Backup, Rollback & Recovery Governance

* **Publish Rollback:** Deactivating a published config requires marking status as `SUPERSEDED` and activating a previous validated version.
* **Disaster Recovery:** If Kintone Master App data is corrupted, an explicit HR recovery command reads Git repository JSON snapshots, performs read-back verification, and re-initializes the Master App records.
* **No Silent Fallback:** Recovery is strictly explicit, audited, and verified.

---

## 15. Expected Change Manifest

### Current Task (WP-002 Planning)
* **Kintone Writes:** **`0 (Zero Writes)`**.
* **Source Code Changes:** **`0 (Documentation Only)`**.
* **Schema Changes:** **`0 (No schema spec modifications executed)`**.

### Proposed Future WP-002 Execution Manifest (Pending User Authorization)
1. Allocate Kintone Master App ID and deploy proposed 22-attribute Master Schema.
2. Synchronize `config/schema-spec.js` with physical snapshot fields for App 794 and Master App.
3. Implement profile resolution and scoring engine in `src/profiles/` and `src/scoring/`.
4. Deploy automated unit test suite.
