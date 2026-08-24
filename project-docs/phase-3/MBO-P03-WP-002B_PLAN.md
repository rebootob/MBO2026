# Work Package Implementation Plan: MBO-P03-WP-002B
## PROFILE RESOLUTION & READ-ONLY SCORING CONFIGURATION RESOLVER

> **Document Type:** Authoritative Repository Implementation Plan  
> **Phase:** `Phase 3: Evaluation Profile, Competency & Scoring Engine`  
> **Work Package ID:** `MBO-P03-WP-002B`  
> **Mode:** `PLAN ONLY (READ-ONLY RESOLVER)`  
> **Implementation Authorization:** **`IMPLEMENTATION_AUTHORIZED = NO`**  
> **Plan Gate Status:** **`PLAN_GATE: PENDING_INDEPENDENT_REVIEW`**  
> **Governance Decisions:**  
> - `DEC-035: SCORING_SOURCE_OF_TRUTH = LIVE_KINTONE_FIRST`  
> - `DEC-036: APPRAISER_WEIGHT_AND_COMPLETENESS_GOVERNANCE`  
> - `DEC-038: PROFILE_CONFIGURATION_STORAGE = KINTONE_ONLY`  
> - `DEC-039: STRICT_EMPLOYEE_DATA_ISOLATION`  
> - `DEC-040: LEGACY_MIGRATION_STATUS = DEFERRED`  
> - `DEC-041: APP_794_FULL_TEST_SANDBOX_GOVERNANCE`  
> **Kintone Access Scope:** `WRITE_REQUIRED = NO`, `WRITE_ALLOWED_APPS = []`  

---

## 1. Objective & Purpose

The objective of **MBO-P03-WP-002B** is to provide a deterministic, read-only resolution pipeline:
$$\text{Employee} \to \text{Normalized Position} \to \text{Profile\_Code} \to \text{Scoring Configuration} \to \text{Validated PUBLISHED Configuration Object}$$

The resolver consumes the accepted `WP-002A` master configuration foundation (`src/profiles/scoring-config-master.js`) under `DEC-038 (KINTONE-ONLY CONFIGURATION STORAGE)` without requiring runtime Git dependencies.

---

## 2. Position Normalization & Resolution Rules

### A. Deterministic Normalization Policy
$$\text{normalize\_title}(\text{raw\_title}) = \text{TRIM}(\text{COLLAPSE\_INTERNAL\_SPACES}(\text{LOWERCASE}(\text{raw\_title})))$$

### B. Prohibited Guessing Rules
The position resolver **MUST NOT** use:
- Substring matching or partial keyword guessing
- Prefix or suffix guessing
- Fallback default profile assignments
- Semantic inference

### C. Evidence-Based Classification & Fail-Closed Boundaries
Position resolution relies strictly on verified position mapping evidence ([`project-docs/phase-3/evidence/POSITION_PROFILE_EVIDENCE.md`](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/project-docs/phase-3/evidence/POSITION_PROFILE_EVIDENCE.md)):
* **Resolved Positions (33 titles / 125 records):** Maps deterministically to target `Profile_Code`.
* **Ambiguous Positions (29 titles / 147 records):** Fails closed with `PROFILE_RESOLUTION_AMBIGUOUS`.
* **Invalid Positions (1 title / 3 records):** Fails closed with `PROFILE_SOURCE_INVALID`.

---

## 3. Supported Profile Configuration Targets (8 Groups / 4 Families)

The resolver supports all 8 canonical evaluation group profile codes:
1. `PROF_STAFF_CHIEF` (Staff & Chief)
2. `PROF_JAPANESE_STAFF` (Japanese Staff)
3. `PROF_ASST_MGR` (Assistant Manager - 60/40)
4. `PROF_SECTION_MGR` (Section Manager - 50/50, explicit final ROUND 2)
5. `PROF_SENIOR_MGR` (Senior Manager - 50/50, explicit final ROUND 2)
6. `PROF_DGM` (Deputy General Manager - 50/50)
7. `PROF_GM` (General Manager - 50/50, $K=1$, `ACHIEVEMENT_DIRECT`)
8. `PROF_VP` (Vice President - 50/50, $K=1$, `ACHIEVEMENT_DIRECT`)

> **Profile Family Rule:**  
> Profile Families (`PROFILE_STAFF_CHIEF`, `PROFILE_JAPANESE_STAFF`, `PROFILE_MANAGEMENT`, `PROFILE_EXECUTIVE`) provide structural grouping ONLY and MUST NOT dictate scoring weights or appraiser rules by themselves.

---

## 4. Master Configuration Selection & Fail-Closed Invariants

To select an active configuration for a resolved `Profile_Code`, the resolver evaluates published Master App records against:
1. `Profile_Code` exact match.
2. `Config_Status === 'PUBLISHED'`.
3. Date within `Effective_From` and `Effective_To` inclusive range.

### Fail-Closed Selection Rules:
* If 0 matching `PUBLISHED` records exist $\implies$ throws **`SCORING_CONFIG_NOT_FOUND` (Fail Closed)**.
* If >1 matching `PUBLISHED` records exist with overlapping effective dates $\implies$ throws **`SCORING_CONFIG_AMBIGUOUS` (Fail Closed)**.
* Inactive or `DRAFT`/`VALIDATED`/`SUPERSEDED`/`RETIRED` records are strictly ignored for runtime resolution.

---

## 5. Configuration Payload Hash Integrity Verification

Before returning a resolved configuration object, the resolver performs runtime integrity re-verification:
1. Reconstructs the 19 immutable payload fields from the retrieved Master record.
2. Recomputes SHA-256 `Configuration_Hash` via `computeConfigurationHash(payload)`.
3. Compares computed hash to the stored `Configuration_Hash`.
4. If hashes do NOT match $\implies$ throws **`SCORING_CONFIG_INTEGRITY_FAILED` (Fail Closed)**.

---

## 6. Resolved Configuration Output Object

The resolver returns a clean, deterministic configuration object for consumption by the scoring engine:

```javascript
{
  Profile_Code: 'PROF_ASST_MGR',
  Profile_Family: 'PROFILE_MANAGEMENT',
  Scoring_Config_Code: 'SCORE_CFG_ASST_MGR_V1',
  Scoring_Config_Version: 'v1.0.0',
  Expected_Appraiser_Count: 2,
  Appraiser_Weight_Rule_Code: 'EQUAL_DISTRIBUTION_V1',
  PartA_Weight: 60,
  PartB_Weight: 40,
  Part_A_Scoring_Mode: 'DIFFICULTY_ACHIEVEMENT_MATRIX',
  Competency_Set_Code: 'COMP_SET_MANAGEMENT_V1',
  PartA_Rounding_Rule: 'ROUNDING_LEGACY_PER_APP_CALC',
  PartB_Raw_Rounding_Rule: 'ROUNDING_LEGACY_PER_APP_CALC',
  PartB_Weighted_Rounding_Rule: 'ROUNDING_LEGACY_PER_APP_CALC',
  Final_Rounding_Rule: 'ROUNDING_LEGACY_PER_APP_CALC',
  Effective_From: '2026-04-01',
  Effective_To: '2027-03-31',
  Configuration_Hash: 'a1b2c3d4...'
}
```

> **Appraiser & COCE Invariants:**  
> - $K_{\text{expected}} = 1 \implies 100\%$ weight; $K_{\text{expected}} = 2 \implies 50\%/50\%$ equal weight.  
> - No automatic weight redistribution for incomplete appraisers.  
> - Competency Item 6 (`COMP_COCE`) is `coceIncludedInScore = false` and `coceItemIndex = 6`. Scored items for management set are `[1, 2, 3, 4, 5, 7, 8]`.

---

## 7. Security Boundary & DEC-039 Compliance

* **Read-Only Operation:** WP-002B operates strictly as a read-only resolver (`WRITE_REQUIRED = NO`, `WRITE_ALLOWED_APPS = []`).
* **Authenticated Identity Required:** Resolver invocation must accept a verified authenticated user context. `Employee_Code` alone is NOT proof of identity (`DEC-039`).
* **Shared Account Security Dependency:** `SEC-DEP-001` remains OPEN and is NOT solved inside WP-002B.
* **No Unrestricted Access:** Resolver does NOT expose arbitrary endpoints allowing employees to query cross-employee scoring configurations outside authorization.

---

## 8. Test Plan

Unit test suite (`tests/profile-scoring-resolver.test.js`) will verify:
1. `PROF_STAFF_CHIEF` position & config resolution (70/30, $K=2$, Matrix).
2. `PROF_JAPANESE_STAFF` position & config resolution (70/30, $K=2$, Matrix).
3. `PROF_ASST_MGR` position & config resolution (60/40, $K=2$, Matrix).
4. `PROF_SECTION_MGR` position & config resolution (50/50, $K=2$, Matrix, explicit ROUND 2).
5. `PROF_SENIOR_MGR` position & config resolution (50/50, $K=2$, Matrix, explicit ROUND 2).
6. `PROF_DGM` position & config resolution (50/50, $K=2$, Matrix).
7. `PROF_GM` position & config resolution (50/50, $K=1$, Direct Achievement).
8. `PROF_VP` position & config resolution (50/50, $K=1$, Direct Achievement).
9. Ambiguous position title fails closed (`PROFILE_RESOLUTION_AMBIGUOUS`).
10. Unknown position title fails closed (`PROFILE_SOURCE_INVALID`).
11. 0 published configurations fails closed (`SCORING_CONFIG_NOT_FOUND`).
12. Overlapping duplicate published configurations fail closed (`SCORING_CONFIG_AMBIGUOUS`).
13. Inactive/Draft configurations ignored.
14. Effective period date mismatch fails closed.
15. `Configuration_Hash` mismatch fails closed (`SCORING_CONFIG_INTEGRITY_FAILED`).
16. COCE Item 6 exclusion preserved across outputs.
17. Deployed rounding rules preserved across outputs.
18. Zero runtime Git dependency verified.
19. Full regression suite execution (`npm test`).

---

## 9. Rollback Plan & Stop Boundary

* **Rollback Plan:** Since WP-002B is 100% read-only code without database mutations, rollback consists of reverting local code commits if unit tests fail.
* **Kintone Write Allow-List:** `WRITE_ALLOWED_APPS = []` (0 Kintone writes).
* **Stop Boundary:**  
  - **DO NOT** write to Kintone (POST/PUT/DELETE = 0).  
  - **DO NOT** implement publish pipeline or UI.  
  - **DO NOT** execute App 794 annual snapshot integration.  
  - **DO NOT** implement legacy data migration.  
  - **DO NOT** implement workflow routing or approver reassignments.  
