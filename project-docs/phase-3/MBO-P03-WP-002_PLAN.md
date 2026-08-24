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
> - `DEC-037: PROFILE_CONFIGURATION_STORAGE_HYBRID = HYBRID_OPTION_C`  
> **Authoritative Baseline:** Passed & Frozen WP-001 (`Plan Commit 6e72553`, `Review Metadata Commit 9b2882e`, `Baseline Commit 8fb306e`)  
> **Kintone Write Operations in Planning:** `0 (Strict Read-Only Mode Active; WRITE_ALLOWED_APPS = [])`  

---

## 1. Executive Summary & Purpose

The purpose of **MBO-P03-WP-002** is to design the implementation architecture for the **Hybrid Profile & Scoring Configuration Foundation** under `DEC-037 (Option C: Hybrid Architecture)`.

This plan specifies the design for:
1. The **Kintone Profile / Scoring Configuration Master App** (`V2_RUNTIME_CONFIGURATION_SOURCE`).
2. The **Physical Master Record Key & Uniqueness Contract** (`Master_Record_Key = {Profile_Code}::{Scoring_Config_Version}`).
3. The **Stable Profile Identity Model** (`Profile_Code` decoupled from versioning).
4. The **Immutable Content Payload Hash Contract** (`Configuration_Hash`).
5. The **Safe Publish Activation Sequence** (Read-back payload hash verification prior to `PUBLISHED` status transition).
6. The **Versioned Profile & Scoring Configuration Resolution Engine**.
7. The **App 794 Annual Record Initialization Snapshot Model**.
8. The **Git Repository Immutable Backup & Recovery Pipeline** (`V2_BACKUP_AUDIT_RECOVERY_SOURCE`).
9. The **Immutable Rollback & New Effective Period Governance Model**.

> **CRITICAL GOVERNANCE DIRECTIVE:**  
> This task is **PLANNING ONLY**. No source code implementation, schema specification changes, Kintone app creation, or Kintone record mutations are authorized until `MBO-P03-WP-002 PLAN_GATE = PASS` and explicit user authorization is granted.

---

## 2. Governance Framework & The Three System Sources

This work package strictly operates across three distinct system sources:

| Source Identifier | Role & Function | Primary Purpose | Fail-Closed Policy |
| :--- | :--- | :--- | :--- |
| **`LEGACY_SCORING_EVIDENCE_SOURCE`** | Existing deployed Kintone PMS apps (Apps 283, 716, 310, 305, 643, 307, 640, 715) | Baseline evidence for legacy calculation formulas & weights (`DEC-035`) | Read-only discovery reference |
| **`V2_RUNTIME_CONFIGURATION_SOURCE`** | Standalone Kintone Master App (Proposed App ID: `NOT_ALLOCATED`) | Primary active runtime source for HR profile & scoring administration (`DEC-037`) | If missing/inconsistent $\implies$ **FAIL CLOSED** |
| **`V2_BACKUP_AUDIT_RECOVERY_SOURCE`** | Immutable JSON snapshots in controlled versioned repository path | Offline audit, disaster recovery, and publish verification (`DEC-037`) | **NOT an automatic runtime fallback** |

> **Fail-Closed Runtime Rule:**  
> Git backup is **NOT** an automatic silent runtime fallback. If the runtime Kintone configuration is unavailable, unpublished, or inconsistent, the runtime engine must **FAIL CLOSED** with `SCORING_CONFIG_RESOLUTION_FAILED`. It must **NEVER** silently calculate scores from a stale repository file.

---

## 3. Physical Master Record Identity & Stable Profile Model

### A. Physical Field: `Master_Record_Key`
To physically enforce uniqueness at the native Kintone database layer, the proposed Master App includes a dedicated physical key field:
* **Canonical Value Formulation:** `Master_Record_Key = {Profile_Code}::{Scoring_Config_Version}`
* **Kintone Database Constraint:** Native Kintone `prohibit_duplicate_values = true` (`unique = true`).

### B. Stable Profile Identity Policy
* `Profile_Code` represents a **stable profile identity** and MUST NOT embed version strings (e.g. `PROF_STAFF_CHIEF`, `PROF_JAPANESE_STAFF`, `PROF_ASST_MGR`, `PROF_MANAGEMENT`, `PROF_EXECUTIVE`).
* Version identifier belongs strictly to `Scoring_Config_Version` (e.g. `v1.0.0`, `v1.1.0`).

### C. Proposed Master Field Schema & Exact Kintone Field Types (23 Attributes)
*(Proposed schema to be created upon WP-002 execution authorization; App ID: `NOT_ALLOCATED`)*

| Attribute # | Field Code | Kintone Field Type | Required | Unique Rule | Payload Classification | Purpose / Description |
| :---: | :--- | :---: | :---: | :---: | :---: | :--- |
| 1 | `Master_Record_Key` | `SINGLE_LINE_TEXT` | **YES** | **UNIQUE** | **`IMMUTABLE_PAYLOAD`** | Physical unique key (`{Profile_Code}::{Scoring_Config_Version}`) |
| 2 | `Profile_Code` | `SINGLE_LINE_TEXT` | **YES** | NOT_UNIQUE | **`IMMUTABLE_PAYLOAD`** | Stable profile identifier (e.g. `PROF_ASST_MGR`) |
| 3 | `Profile_Family` | `SINGLE_LINE_TEXT` | **YES** | NOT_UNIQUE | **`IMMUTABLE_PAYLOAD`** | Structural profile family classification |
| 4 | `Scoring_Config_Code` | `SINGLE_LINE_TEXT` | **YES** | NOT_UNIQUE | **`IMMUTABLE_PAYLOAD`** | Unique scoring configuration code |
| 5 | `Scoring_Config_Version` | `SINGLE_LINE_TEXT` | **YES** | NOT_UNIQUE | **`IMMUTABLE_PAYLOAD`** | Immutable version identifier (e.g. `v1.0.0`) |
| 6 | `Effective_From` | `DATE` | **YES** | NOT_UNIQUE | **`IMMUTABLE_PAYLOAD`** | Start date of applicability (`YYYY-MM-DD`) |
| 7 | `Effective_To` | `DATE` | **YES** | NOT_UNIQUE | **`IMMUTABLE_PAYLOAD`** | End date of applicability (`YYYY-MM-DD`) |
| 8 | `Fiscal_Year` | `SINGLE_LINE_TEXT` | **YES** | NOT_UNIQUE | **`IMMUTABLE_PAYLOAD`** | Applicable Fiscal Year (e.g. `FY2026`, `ALL`) |
| 9 | `PartA_Weight` | `NUMBER` | **YES** | NOT_UNIQUE | **`IMMUTABLE_PAYLOAD`** | MBO Objectives percentage weight (`70`, `60`, `50`) |
| 10 | `PartB_Weight` | `NUMBER` | **YES** | NOT_UNIQUE | **`IMMUTABLE_PAYLOAD`** | Competencies percentage weight (`30`, `40`, `50`) |
| 11 | `Expected_Appraiser_Count` | `NUMBER` | **YES** | NOT_UNIQUE | **`IMMUTABLE_PAYLOAD`** | Required scoring appraisers ($K_{\text{expected}}$: `1` or `2`) |
| 12 | `Appraiser_Weight_Rule_Code` | `SINGLE_LINE_TEXT` | **YES** | NOT_UNIQUE | **`IMMUTABLE_PAYLOAD`** | Layer 1 Appraiser weighting rule |
| 13 | `Part_A_Scoring_Mode` | `DROP_DOWN` | **YES** | NOT_UNIQUE | **`IMMUTABLE_PAYLOAD`** | `DIFFICULTY_ACHIEVEMENT_MATRIX` / `ACHIEVEMENT_DIRECT` |
| 14 | `Competency_Set_Code` | `SINGLE_LINE_TEXT` | **YES** | NOT_UNIQUE | **`IMMUTABLE_PAYLOAD`** | Applicable competency set code |
| 15 | `PartA_Rounding_Rule` | `SINGLE_LINE_TEXT` | **YES** | NOT_UNIQUE | **`IMMUTABLE_PAYLOAD`** | Part A weighted score rounding rule |
| 16 | `PartB_Raw_Rounding_Rule` | `SINGLE_LINE_TEXT` | **YES** | NOT_UNIQUE | **`IMMUTABLE_PAYLOAD`** | Part B raw score rounding rule |
| 17 | `PartB_Weighted_Rounding_Rule`| `SINGLE_LINE_TEXT` | **YES** | NOT_UNIQUE | **`IMMUTABLE_PAYLOAD`** | Part B weighted score rounding rule |
| 18 | `Final_Rounding_Rule` | `SINGLE_LINE_TEXT` | **YES** | NOT_UNIQUE | **`IMMUTABLE_PAYLOAD`** | Final 100-point score rounding rule |
| 19 | `Supersedes_Config_Version` | `SINGLE_LINE_TEXT` | **YES** | NOT_UNIQUE | **`IMMUTABLE_PAYLOAD`** | Previous version superseded (or `NONE`) |
| 20 | `Config_Status` | `DROP_DOWN` | **YES** | NOT_UNIQUE | `AUDIT_LIFECYCLE` | `DRAFT`, `VALIDATED`, `PUBLISHED`, `SUPERSEDED`, `RETIRED` |
| 21 | `Published_At` | `DATETIME` | NO | NOT_UNIQUE | `AUDIT_LIFECYCLE` | Timestamp of publish activation |
| 22 | `Published_By` | `USER_SELECT` | NO | NOT_UNIQUE | `AUDIT_LIFECYCLE` | User account executing publish |
| 23 | `Configuration_Hash` | `SINGLE_LINE_TEXT` | NO | NOT_UNIQUE | `AUDIT_LIFECYCLE` | SHA-256 hash of 19 immutable payload fields |

---

## 4. Immutable Configuration Payload Hash Contract

### A. Payload Inclusion Rule
The `Configuration_Hash` is computed strictly over the **19 Immutable Payload Fields** (Attributes 1..19 above, including `Master_Record_Key`).

### B. Explicit Exclusion Rule
The following 4 Audit/Lifecycle fields are **EXCLUDED** from hash calculation:
- `Config_Status` (Attribute 20)
- `Published_At` (Attribute 21)
- `Published_By` (Attribute 22)
- `Configuration_Hash` (Attribute 23)

### C. Hash Formulation
$$\text{Configuration\_Hash} = \text{SHA256}(\text{Canonical\_JSON}(\text{Attributes } 1..19))$$

---

## 5. Safe Publish Activation Sequence (Verification Before Activation)

To ensure unverified or corrupted configurations are NEVER exposed as active `PUBLISHED` data, the publish pipeline enforces strict pre-activation verification while the record is still in `VALIDATED` status:

```
Step 1: HR Draft Creation & Content Edit on Master App (Config_Status = DRAFT)
   │
Step 2: Structural & Domain Validation ──(If Invalid)──> [ BLOCK & REMAIN DRAFT ]
   │
Step 3: Transition Status to VALIDATED (Config_Status = VALIDATED)
   │
Step 4: Generate Canonical Immutable Payload JSON (Attributes 1..19) & Compute Configuration_Hash
   │
Step 5: Commit Git Backup Snapshot to Controlled Versioned Repository Path
   │
Step 6: Verify Git Backup Payload Hash ──(If Mismatch)──> [ FAIL CLOSED: REVERT TO DRAFT ]
   │
Step 7: Execute Kintone REST API Payload Read-Back Verification while record is STILL VALIDATED
   │
Step 8: Compare Exact Payload Hash (Git Backup vs Kintone REST API Read-Back)
   │     ├── If Hashes Match 100% ──────────────────────────► [ Step 9: Transition Config_Status to PUBLISHED ]
   │     └── If Hash Mismatch / API Read Error ─────────────► [ FAIL CLOSED: BLOCK PUBLISH & REVERT TO DRAFT ]
   │
Step 9: Controlled Activation: Update Config_Status = PUBLISHED, set Published_At & Published_By
   │
Step 10: Final Post-Publish Status & Audit Logging Verification
```

---

## 6. Current Configuration Baseline Reproduction

The proposed Master App reproduces frozen WP-001 deployed truth across all 8 evaluation groups without ambiguity:

| Evaluation Group | Profile Code | Master Record Key | Profile Family | Scoring Config Code | Part A Weight | Part B Weight | Deployed Appraisers ($K_{\text{expected}}$) | Layer 1 Appraiser Weights | Part A Scoring Mode | Competency Set Code | Scored Items ($N_{\text{included}}$) |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :--- | :--- | :---: |
| **Staff & Chief** | `PROF_STAFF_CHIEF` | `PROF_STAFF_CHIEF::v1.0.0` | `PROFILE_STAFF_CHIEF` | `SCORE_CFG_STAFF_CHIEF_V1` | **70%** | **30%** | 2 | **50% / 50%** | `DIFFICULTY_ACHIEVEMENT_MATRIX` | `COMP_SET_OPERATIONAL_V1` | **5** (COCE Excluded) |
| **Japanese Staff** | `PROF_JAPANESE_STAFF`| `PROF_JAPANESE_STAFF::v1.0.0`| `PROFILE_JAPANESE_STAFF`| `SCORE_CFG_JAPANESE_STAFF_V1`| **70%** | **30%** | 2 | **50% / 50%** | `DIFFICULTY_ACHIEVEMENT_MATRIX` | `COMP_SET_OPERATIONAL_V1` | **5** (COCE Excluded) |
| **Assistant Manager**| `PROF_ASST_MGR` | `PROF_ASST_MGR::v1.0.0` | `PROFILE_MANAGEMENT` | `SCORE_CFG_ASST_MGR_V1` | **60%** | **40%** | 2 | **50% / 50%** | `DIFFICULTY_ACHIEVEMENT_MATRIX` | `COMP_SET_MANAGEMENT_V1` | **7** (COCE Excluded) |
| **Section Manager** | `PROF_MANAGEMENT` | `PROF_MANAGEMENT::v1.0.0` | `PROFILE_MANAGEMENT` | `SCORE_CFG_MANAGEMENT_V1` | **50%** | **50%** | 2 | **50% / 50%** | `DIFFICULTY_ACHIEVEMENT_MATRIX` | `COMP_SET_MANAGEMENT_V1` | **7** (COCE Excluded) |
| **Senior Manager** | `PROF_MANAGEMENT` | `PROF_MANAGEMENT::v1.0.0` | `PROFILE_MANAGEMENT` | `SCORE_CFG_MANAGEMENT_V1` | **50%** | **50%** | 2 | **50% / 50%** | `DIFFICULTY_ACHIEVEMENT_MATRIX` | `COMP_SET_MANAGEMENT_V1` | **7** (COCE Excluded) |
| **Deputy General Mgr**| `PROF_MANAGEMENT` | `PROF_MANAGEMENT::v1.0.0` | `PROFILE_MANAGEMENT` | `SCORE_CFG_MANAGEMENT_V1` | **50%** | **50%** | 2 | **50% / 50%** | `DIFFICULTY_ACHIEVEMENT_MATRIX` | `COMP_SET_MANAGEMENT_V1` | **7** (COCE Excluded) |
| **General Manager** | `PROF_EXECUTIVE` | `PROF_EXECUTIVE::v1.0.0` | `PROFILE_EXECUTIVE` | `SCORE_CFG_EXEC_V1` | **50%** | **50%** | **1** | **100%** | `ACHIEVEMENT_DIRECT` | `COMP_SET_MANAGEMENT_V1` | **7** (COCE Excluded) |
| **Vice President** | `PROF_EXECUTIVE` | `PROF_EXECUTIVE::v1.0.0` | `PROFILE_EXECUTIVE` | `SCORE_CFG_EXEC_V1` | **50%** | **50%** | **1** | **100%** | `ACHIEVEMENT_DIRECT` | `COMP_SET_MANAGEMENT_V1` | **7** (COCE Excluded) |

---

## 7. Rollback Effective-Period & Version Semantics

* **Historical Record Immutability:** Rolling back to a previous scoring configuration **NEVER** mutates, edits, or reactivates historical published/superseded records.
* **New Rollback Record Creation:** Rollback requires creating a **NEW Master Record** with:
  - New `Master_Record_Key` (e.g. `PROF_ASST_MGR::v1.2.0`).
  - New `Scoring_Config_Version` (e.g. `v1.2.0`).
  - **NEW Effective Dates:** New `Effective_From` and `Effective_To` defining the new effective period. Historical effective dates are **NEVER** blindly reused.
  - `Supersedes_Config_Version` set to the superseded active version (e.g. `v1.1.0`).
  - Copy of the approved historical business calculation payload.

---

## 8. Native Kintone Permission & Publish Authority Model

Security boundaries are enforced strictly via **Native Kintone App & Field Permissions** (JavaScript is UX-only):

| Role / User Group | Master App Permission Level | Form Field Access Rights |
| :--- | :--- | :--- |
| **HR Maintainer** | Add / Edit Draft Records | Full access to Draft fields; blocked from editing Published records |
| **HR Publisher / Approver** | Publish Authority | Can update `Config_Status` from `VALIDATED` to `PUBLISHED` via pipeline |
| **System Runtime Reader** | Read Only (REST API / JS) | Can read `PUBLISHED` records for score resolution |
| **General Employee / Requester** | **NO ACCESS (Hidden)** | Zero view/read/write permissions on Master App |

---

## 9. Controlled Repository Backup Structure (`V2_BACKUP_AUDIT_RECOVERY_SOURCE`)

* **Repository Backup Strategy:** Controlled versioned repository path defined and approved during WP-002 execution.
* **Canonical JSON Format:** Standardized UTF-8 JSON containing 19 immutable payload fields and `Configuration_Hash`.
* **Restore & Recovery Procedure:** Offline audit tool reads repository JSON snapshots to verify historical App 794 score calculations independently.

---

## 10. Deterministic Runtime Resolution & Position Fail-Closed

### A. Resolution Flow
$$\text{Raw Title} \xrightarrow{\text{normalize\_title()}} \text{Normalized Position} \xrightarrow{\text{Position Matrix}} \text{Profile\_Code} \xrightarrow{\text{Master App}} \text{Profile\_Code} + \text{Scoring\_Config\_Version}$$

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
7. SHA-256 `Configuration_Hash` matches immutable payload exactly.
8. Native Kintone `Master_Record_Key` uniqueness constraint verified.

---

## 13. Future Test Matrix Plan (Planning Tests Only)

* `TEST-WP002-001`: Master record structural validation (Part A + B = 100).
* `TEST-WP002-002`: Native Kintone `Master_Record_Key` duplicate collision blocked (`MASTER_CONFIG_DUPLICATE`).
* `TEST-WP002-003`: Read-back verification while record is in `VALIDATED` status before publish.
* `TEST-WP002-004`: Git backup payload hash mismatch halts publish (Fail Closed).
* `TEST-WP002-005`: Published config mutation blocked by native permission boundary.
* `TEST-WP002-006`: Rollback creates a new `Master_Record_Key` with a new effective date period.
* `TEST-WP002-007`: Ambiguous position (147 records) halts initialization (`PROFILE_MAPPING_AMBIGUOUS`).
* `TEST-WP002-008`: Assistant Manager resolves to `SCORE_CFG_ASST_MGR_V1` (60/40 split).
* `TEST-WP002-009`: Executive GM resolves to `SCORE_CFG_EXEC_V1` ($K=1$, 100%, `ACHIEVEMENT_DIRECT`).

---

## 14. Backup, Rollback & Recovery Governance

* **Immutable Rollback Procedure:** Rolling back to a previous scoring configuration requires issuing a NEW `Scoring_Config_Version` record with a NEW `Master_Record_Key` and NEW effective dates.
* **Disaster Recovery:** If Kintone Master App data is corrupted, an explicit HR recovery command reads Git repository JSON snapshots, performs read-back payload hash verification, and re-initializes the Master App records.
* **No Silent Fallback:** Recovery is strictly explicit, audited, and verified.

---

## 15. Expected Change Manifest

### Current Task (WP-002 Planning)
* **Kintone Writes:** **`0 (Zero Writes)`**.
* **Source Code Changes:** **`0 (Documentation Only)`**.
* **Schema Changes:** **`0 (No schema spec modifications executed)`**.

### Proposed Future WP-002 Execution Manifest (Pending User Authorization)
1. Allocate Kintone Master App ID and deploy proposed 23-attribute Master Schema with `Master_Record_Key` native unique constraint.
2. Synchronize `config/schema-spec.js` with physical snapshot fields for App 794 and Master App.
3. Implement profile resolution and scoring engine in `src/profiles/` and `src/scoring/`.
4. Deploy automated unit test suite.
