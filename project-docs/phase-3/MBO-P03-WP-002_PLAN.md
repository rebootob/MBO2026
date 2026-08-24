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
2. The **Deterministic Master Record Identity & Uniqueness Contract** (`Profile_Code` + `Scoring_Config_Version`).
3. The **Immutable Content Payload Hash Contract** (`Configuration_Hash`).
4. The **Versioned Profile & Scoring Configuration Resolution Engine**.
5. The **App 794 Annual Record Initialization Snapshot Model**.
6. The **Git Repository Immutable Backup & Recovery Pipeline** (`V2_BACKUP_AUDIT_RECOVERY_SOURCE`).
7. The **Immutable Rollback Governance Model** (Creating new version for rollback).

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

## 3. Master Record Identity & Uniqueness Contract

### A. Deterministic Master Record Uniqueness
* **Canonical Master Record Identity:** Exactly ONE Master Record represents ONE Evaluation Profile Configuration Version.
* **Canonical Uniqueness Constraint:**
  $$\text{Master\_Record\_Key} = \text{Profile\_Code} + \text{Scoring\_Config\_Version}$$
* **Rule:** A record identity (`Profile_Code` + `Scoring_Config_Version`) **MUST BE UNIQUE** across the entire Master App. An identical `Scoring_Config_Code` must not be reused ambiguously across different profiles.

### B. Proposed Master Field Schema (22 Attributes)
*(Proposed schema to be created upon WP-002 execution authorization; App ID: `NOT_ALLOCATED`)*

| Attribute # | Field Code | Payload Classification | Purpose / Description | Allowed Values / Validation |
| :---: | :--- | :---: | :--- | :--- |
| 1 | `Profile_Code` | **`IMMUTABLE_PAYLOAD`** | Unique profile identifier | e.g. `PROF_STAFF_CHIEF_V1`, `PROF_JAPANESE_STAFF_V1` |
| 2 | `Profile_Family` | **`IMMUTABLE_PAYLOAD`** | Structural profile family classification | `PROFILE_STAFF_CHIEF`, `PROFILE_JAPANESE_STAFF`, `PROFILE_MANAGEMENT`, `PROFILE_EXECUTIVE` |
| 3 | `Scoring_Config_Code` | **`IMMUTABLE_PAYLOAD`** | Unique scoring configuration code | e.g. `SCORE_CFG_STAFF_CHIEF_V1`, `SCORE_CFG_ASST_MGR_V1` |
| 4 | `Scoring_Config_Version` | **`IMMUTABLE_PAYLOAD`** | Immutable version identifier | e.g. `v1.0.0`, `v1.1.0` |
| 5 | `Effective_From` | **`IMMUTABLE_PAYLOAD`** | Start date of applicability | ISO Date (`YYYY-MM-DD`) |
| 6 | `Effective_To` | **`IMMUTABLE_PAYLOAD`** | End date of applicability | ISO Date (`YYYY-MM-DD`) |
| 7 | `Fiscal_Year` | **`IMMUTABLE_PAYLOAD`** | Applicable Fiscal Year | e.g. `FY2026`, `ALL` |
| 8 | `PartA_Weight` | **`IMMUTABLE_PAYLOAD`** | MBO Objectives percentage weight | `70`, `60`, `50` (Must sum to 100 with Part B) |
| 9 | `PartB_Weight` | **`IMMUTABLE_PAYLOAD`** | Competencies percentage weight | `30`, `40`, `50` (Must sum to 100 with Part A) |
| 10 | `Expected_Appraiser_Count` | **`IMMUTABLE_PAYLOAD`** | Required scoring appraisers ($K_{\text{expected}}$) | `1` (Executive GM/VP), `2` (Operational & Mgmt) |
| 11 | `Appraiser_Weight_Rule_Code` | **`IMMUTABLE_PAYLOAD`** | Layer 1 Appraiser weighting rule | `EQUAL_DISTRIBUTION_V1` ($1/K_{\text{expected}}$) |
| 12 | `Part_A_Scoring_Mode` | **`IMMUTABLE_PAYLOAD`** | Objective calculation mode | `DIFFICULTY_ACHIEVEMENT_MATRIX`, `ACHIEVEMENT_DIRECT` |
| 13 | `Competency_Set_Code` | **`IMMUTABLE_PAYLOAD`** | Applicable competency set | `COMP_SET_OPERATIONAL_V1`, `COMP_SET_MANAGEMENT_V1` |
| 14 | `PartA_Rounding_Rule` | **`IMMUTABLE_PAYLOAD`** | Part A weighted score rounding | `UNIFIED_HALF_UP_2_DECIMALS` / `PER_APP_LEGACY` |
| 15 | `PartB_Raw_Rounding_Rule` | **`IMMUTABLE_PAYLOAD`** | Part B raw score rounding | `UNIFIED_HALF_UP_2_DECIMALS` / `PER_APP_LEGACY` |
| 16 | `PartB_Weighted_Rounding_Rule`| **`IMMUTABLE_PAYLOAD`** | Part B weighted score rounding | `UNIFIED_HALF_UP_2_DECIMALS` / `PER_APP_LEGACY` |
| 17 | `Final_Rounding_Rule` | **`IMMUTABLE_PAYLOAD`** | Final 100-point score rounding | `UNIFIED_HALF_UP_2_DECIMALS` / `PER_APP_LEGACY` |
| 18 | `Supersedes_Config_Version` | **`IMMUTABLE_PAYLOAD`** | Previous version superseded by this config | e.g. `v1.0.0` or `NONE` |
| 19 | `Config_Status` | `AUDIT_LIFECYCLE` | Lifecycle status | `DRAFT`, `VALIDATED`, `PUBLISHED`, `SUPERSEDED`, `RETIRED` |
| 20 | `Published_At` | `AUDIT_LIFECYCLE` | Timestamp of publish activation | ISO DateTime |
| 21 | `Published_By` | `AUDIT_LIFECYCLE` | User account executing publish | Kintone User |
| 22 | `Configuration_Hash` | `AUDIT_LIFECYCLE` | SHA-256 hash of immutable payload | Hex SHA-256 string |

---

## 4. Immutable Configuration Payload Hash Contract

### A. Payload Inclusion Rule
The `Configuration_Hash` is computed strictly over the **18 Immutable Payload Fields** (Attributes 1..18 above).

### B. Explicit Exclusion Rule
The following 4 Audit/Lifecycle fields are **EXCLUDED** from hash calculation:
- `Config_Status`
- `Published_At`
- `Published_By`
- `Configuration_Hash`

### C. Hash Formulation
$$\text{Configuration\_Hash} = \text{SHA256}(\text{Canonical\_JSON}(\text{Attributes } 1..18))$$

* **Pre-Publish & Post-Publish Hash Invariant:** Pre-publish repository backup commit and post-publish Kintone read-back verification MUST compare the **EXACT SAME** immutable payload hash.

---

## 5. Separation of Profile Family vs Scoring Configuration

The architecture strictly distinguishes **Profile Family** from **Scoring Configuration**:

```
PROFILE FAMILY (Structural Classification)
 ├── PROFILE_STAFF_CHIEF
 ├── PROFILE_JAPANESE_STAFF
 ├── PROFILE_MANAGEMENT ────────┐
 └── PROFILE_EXECUTIVE          │
                                ▼
SCORING CONFIGURATION (Versioned Calculation Rules)
 ├── PROF_STAFF_CHIEF_V1 + v1.0.0    ──> SCORE_CFG_STAFF_CHIEF_V1   (70/30, K=2, MATRIX)
 ├── PROF_JAPANESE_STAFF_V1 + v1.0.0 ──> SCORE_CFG_JAPANESE_STAFF_V1(70/30, K=2, MATRIX)
 ├── PROF_ASST_MGR_V1 + v1.0.0       ──> SCORE_CFG_ASST_MGR_V1      (60/40, K=2, MATRIX)
 ├── PROF_MANAGEMENT_V1 + v1.0.0     ──> SCORE_CFG_MANAGEMENT_V1    (50/50, K=2, MATRIX)
 └── PROF_EXECUTIVE_V1 + v1.0.0      ──> SCORE_CFG_EXEC_V1          (50/50, K=1, DIRECT)
```

* **Governance Rule:** Profile Family **MUST NOT** hardcode scoring splits or appraiser cardinality. Scoring behavior is resolved dynamically via versioned configuration (`Profile_Code` + `Scoring_Config_Version`).

---

## 6. Current Configuration Baseline Reproduction

The proposed Master App reproduces frozen WP-001 deployed truth across all 8 evaluation groups without ambiguity:

| Evaluation Group | Profile Code | Profile Family | Scoring Config Code | Part A Weight | Part B Weight | Deployed Appraisers ($K_{\text{expected}}$) | Layer 1 Appraiser Weights | Part A Scoring Mode | Competency Set Code | Scored Items ($N_{\text{included}}$) |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :--- | :--- | :---: |
| **Staff & Chief** | `PROF_STAFF_CHIEF_V1` | `PROFILE_STAFF_CHIEF` | `SCORE_CFG_STAFF_CHIEF_V1` | **70%** | **30%** | 2 | **50% / 50%** | `DIFFICULTY_ACHIEVEMENT_MATRIX` | `COMP_SET_OPERATIONAL_V1` | **5** (COCE Excluded) |
| **Japanese Staff** | `PROF_JAPANESE_STAFF_V1`| `PROFILE_JAPANESE_STAFF`| `SCORE_CFG_JAPANESE_STAFF_V1`| **70%** | **30%** | 2 | **50% / 50%** | `DIFFICULTY_ACHIEVEMENT_MATRIX` | `COMP_SET_OPERATIONAL_V1` | **5** (COCE Excluded) |
| **Assistant Manager**| `PROF_ASST_MGR_V1` | `PROFILE_MANAGEMENT` | `SCORE_CFG_ASST_MGR_V1` | **60%** | **40%** | 2 | **50% / 50%** | `DIFFICULTY_ACHIEVEMENT_MATRIX` | `COMP_SET_MANAGEMENT_V1` | **7** (COCE Excluded) |
| **Section Manager** | `PROF_MANAGEMENT_V1` | `PROFILE_MANAGEMENT` | `SCORE_CFG_MANAGEMENT_V1` | **50%** | **50%** | 2 | **50% / 50%** | `DIFFICULTY_ACHIEVEMENT_MATRIX` | `COMP_SET_MANAGEMENT_V1` | **7** (COCE Excluded) |
| **Senior Manager** | `PROF_MANAGEMENT_V1` | `PROFILE_MANAGEMENT` | `SCORE_CFG_MANAGEMENT_V1` | **50%** | **50%** | 2 | **50% / 50%** | `DIFFICULTY_ACHIEVEMENT_MATRIX` | `COMP_SET_MANAGEMENT_V1` | **7** (COCE Excluded) |
| **Deputy General Mgr**| `PROF_MANAGEMENT_V1` | `PROFILE_MANAGEMENT` | `SCORE_CFG_MANAGEMENT_V1` | **50%** | **50%** | 2 | **50% / 50%** | `DIFFICULTY_ACHIEVEMENT_MATRIX` | `COMP_SET_MANAGEMENT_V1` | **7** (COCE Excluded) |
| **General Manager** | `PROF_EXECUTIVE_V1` | `PROFILE_EXECUTIVE` | `SCORE_CFG_EXEC_V1` | **50%** | **50%** | **1** | **100%** | `ACHIEVEMENT_DIRECT` | `COMP_SET_MANAGEMENT_V1` | **7** (COCE Excluded) |
| **Vice President** | `PROF_EXECUTIVE_V1` | `PROFILE_EXECUTIVE` | `SCORE_CFG_EXEC_V1` | **50%** | **50%** | **1** | **100%** | `ACHIEVEMENT_DIRECT` | `COMP_SET_MANAGEMENT_V1` | **7** (COCE Excluded) |

---

## 7. Immutable Version Model & Immutable Rollback Governance

### A. Immutability Boundary Contract
* Once a record transitions to **`PUBLISHED`** and is referenced by any App 794 Annual Record, its 18 immutable payload fields are **PERMANENTLY LOCKED**.

### B. Immutable Rollback Semantics
* Reverting or rolling back to an older business scoring configuration **MUST NOT** reactivate, mutate, or edit historical published/superseded records.
* Rollback is executed by creating a **NEW Master Record** with an incremented `Scoring_Config_Version` (e.g. `v1.2.0`), copying the approved historical immutable payload, setting `Supersedes_Config_Version = v1.1.0`, and running through the hybrid publish pipeline.

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

## 9. Hybrid Publish Pipeline Design (`Option C`)

```
Step 1: HR Draft Creation & Content Edit on Master App
   │
Step 2: Automated Structural Validation (Weights sum 100, N_included, Mode valid)
   │
Step 3: Canonical Immutable Payload JSON Generation & SHA-256 Hash Computation
   │
Step 4: Repository Backup Commit & Verification (Controlled Versioned Repository Path)
   │     ├── Verify Git file creation & SHA-256 hash match
   │     └── If Hash Mismatch / Git Backup Error ───────────► [ FAIL CLOSED: BLOCK PUBLISH ]
   │
Step 5: Controlled Kintone Activation (Set Status = PUBLISHED)
   │
Step 6: Kintone Read-Back Verification (Re-fetch REST API record and verify hash)
```

---

## 10. Controlled Repository Backup Structure (`V2_BACKUP_AUDIT_RECOVERY_SOURCE`)

* **Repository Backup Strategy:** Controlled versioned repository path defined and approved during WP-002 execution.
* **Canonical JSON Format:** Standardized UTF-8 JSON containing 18 immutable payload fields and `Configuration_Hash`.
* **Restore & Recovery Procedure:** Offline audit tool reads repository JSON snapshots to verify historical App 794 score calculations independently.

---

## 11. Deterministic Runtime Resolution & Position Fail-Closed

### A. Resolution Flow
$$\text{Raw Title} \xrightarrow{\text{normalize\_title()}} \text{Normalized Position} \xrightarrow{\text{Position Matrix}} \text{Profile\_Code} \xrightarrow{\text{Master App}} \text{Profile\_Code} + \text{Scoring\_Config\_Version}$$

### B. Fail-Closed Boundaries
* If `normalize_title(raw)` matches an ambiguous position (29 raw values / 147 records) or invalid position (1 raw value / 3 records) $\implies$ **`PROFILE_MAPPING_AMBIGUOUS` (Fail Closed)**.
* If Master App lookup returns 0 published configurations or >1 active overlapping configurations $\implies$ **`SCORING_CONFIG_RESOLUTION_FAILED` (Fail Closed)**.

---

## 12. App 794 Annual Record Initialization Snapshot

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

## 13. Master Configuration Integrity Validations

1. `PartA_Weight` + `PartB_Weight` == 100.
2. `Expected_Appraiser_Count` $\in \{1, 2\}$.
3. Appraiser Weights sum to 100% ($K=1 \implies 100\%$, $K=2 \implies 50/50\%$).
4. `Part_A_Scoring_Mode` $\in \{\text{DIFFICULTY\_ACHIEVEMENT\_MATRIX}, \text{ACHIEVEMENT\_DIRECT}\}$.
5. Competency Item 6 (`COMP_COCE`) `Included_In_Score == false`.
6. No overlapping `Effective_From` and `Effective_To` dates for the same profile in `PUBLISHED` status.
7. SHA-256 `Configuration_Hash` matches immutable payload exactly.

---

## 14. Future Test Matrix Plan (Planning Tests Only)

* `TEST-WP002-001`: Master record structural validation (Part A + B = 100).
* `TEST-WP002-002`: Duplicate version creation blocked (`Profile_Code` + `Version` collision).
* `TEST-WP002-003`: Draft config ignored by runtime resolution engine.
* `TEST-WP002-004`: Published config mutation blocked by permission boundary.
* `TEST-WP002-005`: Git backup snapshot hash mismatch blocks activation (Fail Closed).
* `TEST-WP002-006`: Kintone read-back verification after publish compares same payload hash.
* `TEST-WP002-007`: Ambiguous position (147 records) halts initialization (`PROFILE_MAPPING_AMBIGUOUS`).
* `TEST-WP002-008`: Assistant Manager resolves to `SCORE_CFG_ASST_MGR_V1`.
* `TEST-WP002-009`: Executive GM resolves to `SCORE_CFG_EXEC_V1` ($K=1$, 100%, `ACHIEVEMENT_DIRECT`).
* `TEST-WP002-010`: Rollback creates new version tag and preserves historical immutability.

---

## 15. Backup, Rollback & Recovery Governance

* **Immutable Rollback Procedure:** Rolling back to a previous scoring configuration requires issuing a NEW `Scoring_Config_Version` record containing the target historical immutable payload.
* **Disaster Recovery:** If Kintone Master App data is corrupted, an explicit HR recovery command reads Git repository JSON snapshots, performs read-back payload hash verification, and re-initializes the Master App records.
* **No Silent Fallback:** Recovery is strictly explicit, audited, and verified.

---

## 16. Expected Change Manifest

### Current Task (WP-002 Planning)
* **Kintone Writes:** **`0 (Zero Writes)`**.
* **Source Code Changes:** **`0 (Documentation Only)`**.
* **Schema Changes:** **`0 (No schema spec modifications executed)`**.

### Proposed Future WP-002 Execution Manifest (Pending User Authorization)
1. Allocate Kintone Master App ID and deploy proposed 22-attribute Master Schema.
2. Synchronize `config/schema-spec.js` with physical snapshot fields for App 794 and Master App.
3. Implement profile resolution and scoring engine in `src/profiles/` and `src/scoring/`.
4. Deploy automated unit test suite.
