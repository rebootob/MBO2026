# Work Package Implementation Plan: MBO-P03-WP-002B
## PROFILE RESOLUTION & READ-ONLY SCORING CONFIGURATION RESOLVER

> **Document Type:** Authoritative Repository Implementation Plan  
> **Phase:** `Phase 3: Evaluation Profile, Competency & Scoring Engine`  
> **Work Package ID:** `MBO-P03-WP-002B`  
> **Mode:** `PLAN ONLY (READ-ONLY RESOLVER FOUNDATION)`  
> **Implementation Authorization:** **`IMPLEMENTATION_AUTHORIZED = NO`**  
> **Plan Gate Status:** **`PLAN_CREATED / PENDING_REVIEW`**  
> **Governance Decisions:**  
> - `DEC-035: SCORING_SOURCE_OF_TRUTH = LIVE_KINTONE_FIRST`  
> - `DEC-036: APPRAISER_WEIGHT_AND_COMPLETENESS_GOVERNANCE`  
> - `DEC-038: PROFILE_CONFIGURATION_STORAGE = KINTONE_ONLY`  
> - `DEC-039: STRICT_EMPLOYEE_DATA_ISOLATION`  
> - `DEC-040: LEGACY_MIGRATION_STATUS = DEFERRED`  
> - `DEC-041: APP_794_FULL_TEST_SANDBOX_GOVERNANCE`  
> **Kintone Access Scope:** `WRITE_REQUIRED = NO`, `WRITE_ALLOWED_APPS = []`  

---

## 0. Critical Dependency: Scoring Master App NOT YET ALLOCATED

> **`SCORING_MASTER_APP_DEPENDENCY = NOT_ALLOCATED / NOT_CREATED`**

The standalone Kintone Profile / Scoring Configuration Master App (the live runtime source for `DEC-038 KINTONE_ONLY` architecture) **does not yet exist**. Its App ID is **NOT_ALLOCATED**.

**Consequences for WP-002B:**
- WP-002B implementation MUST be a **pure, dependency-injected resolver foundation**.
- WP-002B MUST NOT invent, hardcode, or reference a live Kintone Master App ID.
- WP-002B MUST NOT add a live Kintone Master App REST API call until the Master App is formally created and its App ID is allocated by an authorized Work Package.
- The future live Kintone adapter must be wired in ONLY after the Master App has been created, verified, and its App ID approved.
- For the current implementation phase, the resolver operates on deterministic configuration records supplied by unit test fixtures (reusing `getCanonicalBaselineMasterConfigs()` from `WP-002A`).

---

## 1. Objective & Purpose

**MBO-P03-WP-002B** establishes a deterministic, read-only resolution pipeline with dependency-injected inputs:

$$\text{Authenticated Context} \to \text{Verified Employee Snapshot} \to \text{Authoritative Position} \to \text{Profile\_Code} \to \text{Validated PUBLISHED Config}$$

**Conceptual contract:**
```javascript
resolveProfileScoringConfig({
    employeeSnapshot,    // from verified EmployeeService / App 53 READ
    fiscalYear,          // exact FY string, e.g. 'FY2026'
    effectiveDate,       // ISO date string, e.g. '2026-08-24'
    masterConfigRecords, // injected from test fixtures or future live adapter
    authenticatedContext // verified caller identity (NOT Employee_Code alone)
})
```

The resolver **must not** accept arbitrary caller-provided `Position`, `Profile_Code`, or `Profile_Family` as authoritative input.

---

## 2. Authoritative Employee Position Resolution Flow

```
Authenticated Context
      ↓ (DEC-039: Employee_Code is NOT authentication)
Verified Employee Lookup (EmployeeService / App 53 READ ONLY)
      ↓
Verified Employee Snapshot
      ↓
Authoritative Raw Position Value (from App 53)
      ↓
normalize_title(raw) = TRIM(COLLAPSE_INTERNAL_SPACES(LOWERCASE(raw)))
      ↓
Position Evidence Mapping
      ↓
Profile_Code
```

**Rules:**
- `App 53` remains **READ ONLY** (source of authoritative position data).
- The resolver reuses `src/services/employee-service.js` for employee lookup/snapshot.
- The resolver **must not** trust arbitrary caller-provided `Profile_Code` or `Profile_Family` to bypass position-based resolution.
- Pure unit tests may inject a pre-verified `employeeSnapshot`, but the runtime boundary must require the snapshot to have originated from the approved employee lookup service.
- **`Employee_Code` alone remains `NOT AUTHENTICATION`** (`DEC-039`).

### Position Normalization Policy
$$\text{normalize\_title}(\text{raw}) = \text{TRIM}(\text{COLLAPSE\_INTERNAL\_SPACES}(\text{LOWERCASE}(\text{raw})))$$

**Prohibited Guessing Methods:** Substring matching, prefix/suffix guessing, semantic inference, silent fallback default profiles.

### Evidence-Based Resolution & Fail-Closed Boundaries
- **Resolved (33 titles / 125 records):** Maps deterministically to `Profile_Code`.
- **Ambiguous (29 titles / 147 records):** Fails closed → `PROFILE_RESOLUTION_AMBIGUOUS`.
- **Invalid (1 title / 3 records):** Fails closed → `PROFILE_SOURCE_INVALID`.

---

## 3. Supported Profile Configuration Targets (8 Groups / 4 Families)

| `Profile_Code` | Evaluation Group | Part A/B | Appraisers | Part A Mode | Final Rounding |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `PROF_STAFF_CHIEF` | Staff & Chief | 70/30 | 2 | `DIFFICULTY_ACHIEVEMENT_MATRIX` | Per-App CALC |
| `PROF_JAPANESE_STAFF` | Japanese Staff | 70/30 | 2 | `DIFFICULTY_ACHIEVEMENT_MATRIX` | Per-App CALC |
| `PROF_ASST_MGR` | Assistant Manager | 60/40 | 2 | `DIFFICULTY_ACHIEVEMENT_MATRIX` | Per-App CALC |
| `PROF_SECTION_MGR` | Section Manager | 50/50 | 2 | `DIFFICULTY_ACHIEVEMENT_MATRIX` | Explicit ROUND 2 |
| `PROF_SENIOR_MGR` | Senior Manager | 50/50 | 2 | `DIFFICULTY_ACHIEVEMENT_MATRIX` | Explicit ROUND 2 |
| `PROF_DGM` | Deputy General Manager | 50/50 | 2 | `DIFFICULTY_ACHIEVEMENT_MATRIX` | Per-App CALC |
| `PROF_GM` | General Manager | 50/50 | **1** | `ACHIEVEMENT_DIRECT` | Per-App CALC |
| `PROF_VP` | Vice President | 50/50 | **1** | `ACHIEVEMENT_DIRECT` | Per-App CALC |

> **Profile Family Rule:** `PROFILE_STAFF_CHIEF`, `PROFILE_JAPANESE_STAFF`, `PROFILE_MANAGEMENT`, `PROFILE_EXECUTIVE` provide structural grouping ONLY and MUST NOT determine scoring weights or appraiser rules independently.

---

## 4. Configuration Selection: Exact Criteria & Fail-Closed Rules

To select the active scoring configuration from injected `masterConfigRecords`, the resolver applies **all four criteria simultaneously**:

```
Profile_Code  ===  resolvedProfileCode
  AND
Fiscal_Year  ===  requestedFiscalYear      ← EXACT MATCH REQUIRED
  AND
Config_Status  ===  'PUBLISHED'
  AND
Effective_From  <=  effectiveDate  <=  Effective_To
```

### Fail-Closed Selection Rules:
| Condition | Error Code | Behavior |
| :--- | :--- | :--- |
| 0 matching `PUBLISHED` records | `SCORING_CONFIG_NOT_FOUND` | Fail Closed |
| >1 matching `PUBLISHED` records with overlapping effective dates | `SCORING_CONFIG_AMBIGUOUS` | Fail Closed |
| `Fiscal_Year` field value does not match `requestedFiscalYear` | `SCORING_CONFIG_NOT_FOUND` | Fail Closed — **must not be ignored** |
| `DRAFT` / `VALIDATED` / `SUPERSEDED` / `RETIRED` records | Ignored | Strictly excluded from runtime resolution |

> **No `Fiscal_Year = ALL` fallback is permitted** unless a future explicit precedence rule is reviewed and approved.

---

## 5. Request Context Validation

The resolver input contract must validate the following fields before beginning resolution:

| Field | Validation Rule |
| :--- | :--- |
| `fiscalYear` | Non-empty string in valid FY format; reuse existing fiscal-year validation engine |
| `effectiveDate` | Valid ISO date string |
| `authenticatedContext` | Non-null; must represent verified authenticated caller |
| `employeeSnapshot` | Must be from approved `EmployeeService` flow; not arbitrary caller-supplied data |

**Rule:** Do not duplicate fiscal-year validation logic already present in existing modules.

---

## 6. Configuration Hash Integrity Verification

Before returning a resolved configuration, the resolver MUST:
1. Reconstruct the canonical 19 immutable payload fields from the record.
2. Recompute SHA-256 `Configuration_Hash` using existing `computeConfigurationHash()` from `src/profiles/scoring-config-master.js`.
3. Compare computed hash to the stored `Configuration_Hash` field.
4. If hashes do NOT match → throw **`SCORING_CONFIG_INTEGRITY_FAILED` (Fail Closed)**.

**Rule:** Do not duplicate `computeConfigurationHash()` logic. Reuse the existing exported function.

---

## 7. Resolver Output Object

The resolver returns a clean configuration object for consumption by the scoring engine. `Fiscal_Year` is **included** as it is part of the selected immutable configuration identity:

```javascript
{
  Profile_Code: 'PROF_ASST_MGR',
  Profile_Family: 'PROFILE_MANAGEMENT',
  Scoring_Config_Code: 'SCORE_CFG_ASST_MGR_V1',
  Scoring_Config_Version: 'v1.0.0',
  Fiscal_Year: 'FY2026',                       // ← included in output
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

> **Appraiser & COCE Invariants preserved from WP-002A:**
> - $K=1 \implies 100\%$ weight; $K=2 \implies 50\%/50\%$.
> - No automatic weight redistribution for incomplete appraisers.
> - COCE `coceItemIndex = 6`; `coceIncludedInScore = false`; Management scored items: `[1, 2, 3, 4, 5, 7, 8]`.

---

## 8. Implementation File Boundary

| File | Action | Notes |
| :--- | :--- | :--- |
| `src/profiles/scoring-config-master.js` | **REUSE (existing / untouched)** | Configuration schema, validation, `computeConfigurationHash()`, `getCanonicalBaselineMasterConfigs()` |
| `src/services/employee-service.js` | **REUSE (existing / untouched)** | Verified employee lookup / App 53 READ |
| `src/profiles/profile-scoring-resolver.js` | **CREATE (if implementation begins)** | Deterministic profile/config resolution logic |
| `tests/profile-scoring-resolver.test.js` | **CREATE (if implementation begins)** | Unit test suite |

**Rule:** Do NOT create additional resolver files without a clear separation-of-concerns justification.

---

## 9. App 794 Sandbox Governance Clarification (DEC-041)

`DEC-041` is preserved unchanged. One terminology clarification only:

| Term | Clarification |
| :--- | :--- |
| **`DRY_RUN`** (`DEC-040`) | Always means **zero Kintone writes** (`DRY_RUN = ZERO_WRITE`). A `DRY_RUN` is NOT classified as a controlled write operation. |
| **`SANDBOX_MIGRATION_TEST`** | A distinct future concept that may perform controlled writes to App 794 when **explicitly authorized** by its future Work Package. |

This clarification does **not** change `DEC-040` rollback contract or any existing governance rules.

---

## 10. WHAT / WHERE / HOW / WHY / RISKS / STOP BOUNDARY

### WHAT
- Pure profile/scoring resolver foundation with dependency-injected inputs.

### WHERE
- `src/profiles/profile-scoring-resolver.js` — new resolver module
- Reuse `src/services/employee-service.js` — verified employee lookup
- Reuse `src/profiles/scoring-config-master.js` — config schema, hash, baseline
- `tests/profile-scoring-resolver.test.js` — unit test suite

### HOW
- Dependency-injected verified inputs (employee snapshot + injected config records)
- Deterministic fail-closed resolution at every step
- No live Kintone Master App call until App ID is formally allocated

### WHY
- The Kintone Scoring Configuration Master App (`SCORING_MASTER_APP_DEPENDENCY = NOT_ALLOCATED`) does not yet exist
- Prevents hardcoded/fake runtime dependency
- Establishes clean resolver foundation for future live Kintone adapter integration

### EXPECTED IMPACT
- Zero Kintone mutations
- Zero App 794 mutations
- Zero production impact

### RISKS
| Risk | Mitigation |
| :--- | :--- |
| Stale/unverified employee snapshot bypasses position resolution | Validated by input contract; reject non-service-originated snapshots |
| Ambiguous position title | Fail closed (`PROFILE_RESOLUTION_AMBIGUOUS`) |
| Wrong `Fiscal_Year` | Exact match required; fail closed (`SCORING_CONFIG_NOT_FOUND`) |
| Multiple active published configs | Fail closed (`SCORING_CONFIG_AMBIGUOUS`) |
| `Configuration_Hash` mismatch | Fail closed (`SCORING_CONFIG_INTEGRITY_FAILED`) |
| Unavailable Master App | No live API call until App ID formally allocated; test fixtures used |

### ROLLBACK
- Revert code commit only (no Kintone mutations to undo)

### KINTONE ACCESS SCOPE
- App 53: Read only (via existing EmployeeService)
- Master App: Not accessed (not yet allocated)
- `WRITE_ALLOWED_APPS = []`

### GIT SCOPE
- Normal development source control only

### STOP BOUNDARY
**DO NOT** implement:
- Live Kintone Master App API call (App ID not allocated)
- Publish pipeline
- App 794 annual snapshot integration
- Legacy data migration
- Workflow routing
- Authentication solution
- Any Kintone write operation

---

## 11. Test Plan

Unit test suite (`tests/profile-scoring-resolver.test.js`) must verify:

| # | Test Case | Expected Result |
| :--- | :--- | :--- |
| 1 | `PROF_STAFF_CHIEF` position & config resolution (70/30, K=2, Matrix) | Pass |
| 2 | `PROF_JAPANESE_STAFF` position & config resolution (70/30, K=2, Matrix) | Pass |
| 3 | `PROF_ASST_MGR` position & config resolution (60/40, K=2, Matrix) | Pass |
| 4 | `PROF_SECTION_MGR` position & config resolution (50/50, K=2, explicit ROUND 2) | Pass |
| 5 | `PROF_SENIOR_MGR` position & config resolution (50/50, K=2, explicit ROUND 2) | Pass |
| 6 | `PROF_DGM` position & config resolution (50/50, K=2) | Pass |
| 7 | `PROF_GM` position & config resolution (50/50, K=1, Direct) | Pass |
| 8 | `PROF_VP` position & config resolution (50/50, K=1, Direct) | Pass |
| 9 | Ambiguous position fails closed | `PROFILE_RESOLUTION_AMBIGUOUS` |
| 10 | Unknown/invalid position fails closed | `PROFILE_SOURCE_INVALID` |
| 11 | 0 published configs fails closed | `SCORING_CONFIG_NOT_FOUND` |
| 12 | >1 published configs with overlapping effective dates fails closed | `SCORING_CONFIG_AMBIGUOUS` |
| 13 | Inactive/Draft/Superseded config records ignored | Pass |
| 14 | **Exact `Fiscal_Year` match succeeds** | Pass |
| 15 | **`Fiscal_Year` mismatch fails closed** | `SCORING_CONFIG_NOT_FOUND` |
| 16 | **Config from another FY is ignored** | `SCORING_CONFIG_NOT_FOUND` |
| 17 | Effective period date out of range fails closed | `SCORING_CONFIG_NOT_FOUND` |
| 18 | `Configuration_Hash` mismatch fails closed | `SCORING_CONFIG_INTEGRITY_FAILED` |
| 19 | COCE item 6 exclusion preserved in output | Pass |
| 20 | Deployed rounding rules preserved in output | Pass |
| 21 | `Fiscal_Year` included in resolved output object | Pass |
| 22 | **Arbitrary caller-provided `Profile_Code` cannot bypass position resolution** | Fail Closed |
| 23 | **Invalid/unverified employee snapshot fails closed** | Fail Closed |
| 24 | **No hardcoded Master App ID fallback exists** | Pass |
| 25 | Zero runtime Git dependency | Pass |
| 26 | Full regression suite (`npm test`) | 131/131 Pass |

---

## 12. Security Boundary & DEC-039 Compliance

- **Read-Only:** `WRITE_REQUIRED = NO`, `WRITE_ALLOWED_APPS = []`.
- **Authenticated Identity Required:** `Employee_Code` alone is `NOT AUTHENTICATION` (`DEC-039`).
- **No Cross-Employee Exposure:** Resolver does not create pathways for querying another employee's config outside authorization.
- **Shared Account Dependency:** `SEC-DEP-001` remains `OPEN` and is NOT solved inside WP-002B.
