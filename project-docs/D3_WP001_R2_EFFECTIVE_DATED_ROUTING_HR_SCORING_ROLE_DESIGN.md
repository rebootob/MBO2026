# D3-WP001-R2: Effective-Dated Routing Persistence & HR-Configurable Scoring Appraiser Design Corrective

**Date:** 2026-09-08 ICT
**Work Package:** `D3-WP001-R2`
**Title:** Effective-Dated Routing Persistence & HR-Configurable Scoring Appraiser Design Corrective
**Type:** `DESIGN / EVIDENCE-ONLY CORRECTIVE`
**Owner Authorization:** `APPROVED`
**Owner Decision:** `OWNER_DEC_D3_003 = LOCKED / OWNER APPROVED` (`HR_CONFIGURABLE_SCORING_APPRAISERS_WITHIN_WORKFLOW_ROUTE_USING_FROZEN_PROFILE_K_EXPECTED`).
**Branch:** `ai/antigravity-wp002c`
**Repository:** `rebootob/MBO2026`
**Starting HEAD:** `ccffe2502847eb85be0d8be85848d25c39382ec3`
**Author:** Antigravity Execution Plane
**Review Target:** Human Owner & ChatGPT Control Plane

---

## 1. Control Plane R1 Review & R2 Corrective Scope

Upon independent review of `D3-WP001-R1` (commit `ccffe25`), the ChatGPT Control Plane issued:

```text
D3-WP001-R1 = PARTIAL PASS / EFFECTIVE-DATED ROUTING & SCORING ROLE CORRECTIVE REQUIRED
```

### 1.1 Accepted Findings from R1 (Preserved Truth — Not Reopened):
- **`THREE_APPRAISER_DUAL_PATTERN = PASS`**: Owner authority confirms both `M1_M2_G1` (Pattern 3A) and `M1_G1_G2` (Pattern 3B) are valid 3-step business routes. `APPRAISER_COUNT_DETERMINES_TOPOLOGY = NO`.
- **`ORDINAL_MAPPING = PASS`**: Canonical business execution order (`M2 -> M1 -> G1` for M2 routes) decoupled from raw object-property keys.
- **`SELF_APPRAISER_COMPACTION = PASS`**: Compaction preserves semantic execution order (e.g. 4-step eliding M2 resolves to `M1_G1_G2`; eliding G2 resolves to `M1_M2_G1`).
- **`ALL_ANY_ANALYSIS = PASS / OWNER DECISION PENDING`**: Option A (1 user per slot in V1) recommended; `OWNER-DEC-D3-005` remains pending Owner decision.

### 1.2 Material Deficiencies Addressed in R2:
1. **Scoring Role Authority Resolved by Owner:** Incorporating `OWNER-DEC-D3-003`, establishing that an employee's frozen Evaluation Profile determines $K_{\text{expected}}$ (scorer count), while HR configures which specific workflow appraisers fulfill those scoring roles.
2. **Deterministic Effective-Dated Routing Persistence:** Resolving the App 795 `Routing_Key` uniqueness conflict by establishing **Model A (Versioned Rows in App 795 with Unique Version Key)** as the single recommended persistence model, enabling 100% read-only, non-mutating date-interval resolution at timestamp $T$.

---

## 2. Owner Scoring Decision D3-003 Locked

The Human Owner has formally authorized and locked:

```text
OWNER_DEC_D3_003 = HR_CONFIGURABLE_SCORING_APPRAISERS_WITHIN_WORKFLOW_ROUTE_USING_FROZEN_PROFILE_K_EXPECTED
STATUS = LOCKED / OWNER APPROVED
```

### Core Rules:
1. **Profile Governs Count:** The employee's frozen annual Evaluation Profile strictly determines **how many** scoring appraisers are required ($K_{\text{expected}}$).
2. **HR Selects Positions:** HR administrators determine **which specific workflow appraisers** fulfill the scoring roles within the resolved route.
3. **Scorer Count Invariant:**
   - `WORKFLOW_APPRAISER_COUNT` $= 1 \dots 4$ (Variable sequential business evaluators).
   - `SCORER_COUNT` $= K_{\text{expected}}$ (Strictly 1 or 2 under current `DEC-036` baseline).
   - `HR_MAY_CHANGE_K_EXPECTED = NO` (HR cannot change how many scorers an employee requires).
   - `HR_MAY_SELECT_SCORER_IDENTITIES = YES` (HR chooses which appraisers score).
   - `SCORING_APPRAISERS` must be a strict subset of `WORKFLOW_APPRAISERS`.
4. **Formula & Weight Invariant:**
   - $K_{\text{expected}} = 1 \implies \text{Scorer 1} = 100\%$.
   - $K_{\text{expected}} = 2 \implies \text{Scorer 1} = 50\%, \text{Scorer 2} = 50\%$.
   - DO NOT introduce $K=3$ or $K=4$.
   - Existing `DEC-036` scoring weight formulas remain 100% intact.

---

## 3. Evaluation Profile / K_expected Source of Truth

Evaluation Profiles and completeness gating operate under established repository governance (`DEC-035`, `DEC-036`, `BUSINESS_RULES.md` Section 2):

| Position Profile Class | Profile Code | Target Ratio (A/B) | Baseline K_expected | Allowed Scorer Count |
|---|---|---|---|---|
| Staff / Chief | `PROF_STAFF` | 70 / 30 | 2 | Exactly 2 Scorers (50% / 50%) |
| Japanese Staff | `PROF_JAPAN` | 70 / 30 | 2 | Exactly 2 Scorers (50% / 50%) |
| Assistant Section Manager | `PROF_ASST_MGR` | 70 / 30 | 2 | Exactly 2 Scorers (50% / 50%) |
| Section Manager | `PROF_SECT_MGR` | 70 / 30 | 2 | Exactly 2 Scorers (50% / 50%) |
| Senior Manager | `PROF_SNR_MGR` | 70 / 30 | 2 | Exactly 2 Scorers (50% / 50%) |
| Deputy General Manager | `PROF_DGM` | 70 / 30 | 2 | Exactly 2 Scorers (50% / 50%) |
| General Manager | `PROF_GM` | 70 / 30 | 1 | Exactly 1 Scorer (100%) |
| Vice President | `PROF_VP` | 70 / 30 | 1 | Exactly 1 Scorer (100%) |

- **Annual Freeze:** Evaluation Profile is resolved at record generation or unstarted draft and frozen on the record.
- **Completeness Gate:** Score computation strictly asserts $K_{\text{valid}} == K_{\text{expected}}$.

---

## 4. Workflow vs Scoring Separation

Workflow approval steps and scoring rating evaluations are cleanly decoupled:

```
WORKFLOW EXECUTION PLANE (Process Management)
  Step 1 (1st Appraiser) -> Step 2 (2nd Appraiser) -> Step 3 (3rd Appraiser) -> Step 4 (4th Appraiser)
  [All 1-4 steps perform status review, comments, and native approval actions]

SCORING EVALUATION PLANE (Calculation Engine)
  Scorer 1 (50% or 100%)    <----------------------- Selected by HR from Workflow Steps
  Scorer 2 (50% if K=2)     <----------------------- Selected by HR from Workflow Steps
  [Only designated Scorers submit numerical Achievement ratings 1-5]
```

- Non-scoring appraisers perform workflow approval, stage endorsement, and qualitative feedback without entering score matrices.
- Non-scoring appraisers do **not** have their weights redistributed.

---

## 5. HR Scorer Selection Contract & Validation Rules

### 5.1 Scorer Selection Matrix Example:
- **Workflow Route (4 Appraisers):**
  - 1st Appraiser: `User_A`
  - 2nd Appraiser: `User_B`
  - 3rd Appraiser: `User_C`
  - 4th Appraiser: `User_D`
- **Employee Profile:** `Staff` ($K_{\text{expected}} = 2$)
- **HR Configuration:**
  - `User_A`: Scorer = **YES** (Primary Scorer)
  - `User_B`: Scorer = **NO** (Workflow Approval Only)
  - `User_C`: Scorer = **YES** (Secondary Scorer)
  - `User_D`: Scorer = **NO** (Workflow Approval Only)
- **Effective Outcome:**
  - Workflow path: `User_A -> User_B -> User_C -> User_D` (4 native steps).
  - Scoring ratings: `User_A` (50%) + `User_C` (50%). `User_B` and `User_D` endorse workflow without scoring.

### 5.2 Mandatory Fail-Closed Validations:
1. `Selected_Scorer_Count != K_expected` $\implies$ **FAIL CLOSED** (`INVALID_SCORER_COUNT`).
2. `Selected_Scorer_Count == 0` $\implies$ **FAIL CLOSED** (`MISSING_SCORERS`).
3. Designated scorer identity not present in resolved workflow route $\implies$ **FAIL CLOSED** (`SCORER_NOT_IN_ROUTE`).
4. Duplicate scorer identity selected $\implies$ **FAIL CLOSED** (`DUPLICATE_SCORER`).
5. Inactive or unmapped Kintone user selected $\implies$ **FAIL CLOSED** (`INVALID_SCORER_USER`).
6. $K_{\text{expected}} > \text{Workflow\_Appraiser\_Count}$ $\implies$ **FAIL CLOSED** (`INSUFFICIENT_WORKFLOW_APPRAISERS`).
7. Missing frozen Evaluation Profile or unmapped $K_{\text{expected}}$ $\implies$ **FAIL CLOSED** (`PROFILE_UNRESOLVED`).
8. Zero heuristic guessing: System never auto-assumes M1 or G1 must score.

---

## 6. Route-Scope / Profile Compatibility Design

### Problem Analysis:
Can one App 795 routing record serve employees whose frozen Evaluation Profiles have different $K_{\text{expected}}$ values?
- In standard operational sections (e.g. `FIN`, `TMG1|TeamA`), operational staff, chiefs, and section heads share section routing, but have $K_{\text{expected}} = 2$.
- Executive positions (`GM`, `VP`) have $K_{\text{expected}} = 1$, but already resolve through dedicated executive direct routes (`POSITION_GM`, `POSITION_VP`).
- However, to guarantee 100% architectural determinism without making fragile assumptions about future organization structures:

### Deterministic Solution: Ordinal Scorer Role Hierarchy
On each App 795 route version, HR designates:
- **Primary Scorer (Scorer 1):** The mandatory primary evaluator. Required for both $K=1$ and $K=2$.
- **Secondary Scorer (Scorer 2):** The secondary evaluator. Required when $K=2$.

```text
At Runtime Resolution for Target Employee:
  If Target Employee K_expected == 1:
    Effective Scorer = [ Primary Scorer ] (100% weight)
  If Target Employee K_expected == 2:
    Effective Scorers = [ Primary Scorer, Secondary Scorer ] (50% / 50% weight)
```

**Guaranteed Invariants:**
- If $K_{\text{expected}} = 1$, exactly 1 scorer is active.
- If $K_{\text{expected}} = 2$, exactly 2 scorers are active.
- One App 795 route serves both $K=1$ and $K=2$ employees deterministically without duplicate routing keys or heuristic guessing.

---

## 7. Generic Scorer Runtime Snapshot Design

When an App 794 record resolves its routing snapshot for a stage, it records:

```text
Record Snapshot Attributes (Logical Design):
  Frozen_Evaluation_Profile      : "PROF_STAFF"
  K_expected                     : 2
  Workflow_Appraiser_1           : User_A
  Workflow_Appraiser_2           : User_B
  Workflow_Appraiser_3           : User_C
  Workflow_Appraiser_4           : User_D
  Effective_Route_Pattern        : "PATTERN_4_M2_M1_G1_G2"
  Effective_Topology             : "M1_M2_G1_G2"
  Selected_Scoring_Appraiser_1   : User_A
  Selected_Scoring_Appraiser_2   : User_C
  Scorer_1_Weight                : 50
  Scorer_2_Weight                : 50
  Scorer_Count                   : 2
```

*(Note: Exact storage mappings are design-only; zero schema changes are executed in D3-WP001-R2).*

---

## 8. Existing Manager / GM Score Field Compatibility

App 794 currently has scoring columns titled:
- `Manager_Achievement_1..10`, `Manager_Objective_Score_1..10`, `Manager_Comment_1..10`
- `GM_Achievement_1..10`, `GM_Objective_Score_1..10`, `GM_Comment_1..10`

### Evaluated Alternatives:
- **Alternative A: Physical Compatibility Adapter (Recommended for D3 V1):**
  - Physical columns `Manager_*` store ratings submitted by **Scorer 1**.
  - Physical columns `GM_*` store ratings submitted by **Scorer 2**.
  - The UI layer maps input controls ordinally (`Scorer 1` and `Scorer 2`) based on the authenticated evaluator's identity.
  - **Pros:** Zero schema modifications to App 794. Preserves all existing Kintone CALC fields (`PartA_Raw_Score`, `PartA_Weighted_Score`).
  - **Cons:** Technical column names remain historical.
- **Alternative B: Add Generic Scorer Columns (`Scorer1_*`, `Scorer2_*`):**
  - Requires adding 60+ new form fields to App 794, updating CALC formulas, and deprecating old fields.
  - **Cons:** High migration risk and schema disruption.

### Recommendation:
Adopt **Alternative A (Compatibility Adapter)** for D3 V1. It provides immediate runtime compatibility without schema risks.

---

## 9. Self-Appraiser + Scoring Interaction (DECISION-D3-002)

### Mandatory Invariant:
**Self may never evaluate or score own MBO.**

### Compaction & Recomputation Sequence on Own MBO:
1. Identify employee dedicated Kintone user code.
2. Remove employee from workflow route.
3. Compact surviving workflow slots leftward.
4. **Scorer Verification:**
   - If the elided self identity was designated as **Scorer 1** or **Scorer 2**:
     - That scorer slot becomes vacant.
     - The system inspects if a designated surviving fallback scorer exists.
     - If surviving designated scorers $< K_{\text{expected}}$:
       **FAIL CLOSED** with error classification:
       `SCORING_ROUTE_INCOMPLETE_AFTER_SELF_ELISION`
5. **Strict Prohibitions:**
   - Never auto-promote an approval-only appraiser to scorer without explicit master configuration.
   - Never reduce $K_{\text{expected}}$.
   - Never alter score weights.

---

## 10. Stage Snapshot Rules & Scorer Immutability

1. **Annual Profile Freeze:** `Profile_Code` and $K_{\text{expected}}$ are frozen annually and remain immutable.
2. **Stage Snapshot Immutability:** During an active stage (`OBJECTIVE`, `MIDYEAR`, `FINAL`), resolved workflow evaluators and designated scorers are frozen in the record.
3. **Completed Stages Immutable:** Completed stage evaluations, scorer identities, scores, and timestamps can never be retroactively rewritten.
4. **Exception Reassignment:** If a designated scorer leaves or is unavailable, reassignment is executed strictly via **Current Record Reassignment** (Operation 2) with mandatory business rationale and audit logging in App 798.

---

## 11. Effective-Dating Persistence Architecture Evaluation

### Root Constraint:
In App 795, `Routing_Key` currently has `unique: true`. Storing multiple rows with the same `Routing_Key` throws Kintone `GAIA_DUPLICATE_VALUE`.

### Comprehensive Model Comparison:

| Evaluation Criteria | Model A: Versioned Rows in App 795 (Unique Version_Key) | Model B: Active Pointer + Staged Pending Payload | Model C: Dedicated Route Versions Master App |
|---|---|---|---|
| **Determinism** | **Absolute (100% Native Query)** | Moderate (Requires lazy/batch trigger) | High |
| **Schema Impact** | Uncheck unique on `Routing_Key`; add `Version_Key` | None on App 795; adds JSON field | Creates new App 802 |
| **Number of Apps** | **1 App (App 795 only)** | 1 App (App 795 only) | 2 Apps (App 795 + App 802) |
| **Read-Only Resolver** | **100% Read-Only (Zero writes on GET)** | Requires mutation write at activation | Read-only with multi-app join |
| **Scheduled Activation** | **Automatic by timestamp interval** | Dependent on background job or mutation | Automatic by timestamp interval |
| **Audit & History** | Native historical records preserved | Compressed in JSON string | Native historical records |
| **Failure Modes** | Standard unique collision on version | Payload parse failure / desync | Cross-app synchronization failure |

---

## 12. Selected Recommended Persistence Model: Model A

To satisfy the Owner mandate for **deterministic, non-mutating, read-only route resolution without manual button presses**, **Model A** is selected as the single authoritative architecture for D3:

```text
RECOMMENDED_PERSISTENCE_MODEL = MODEL_A_VERSIONED_ROWS_IN_APP795
UNIQUE_KEY_MODEL = VERSION_KEY_UNIQUE_ROUTING_KEY_INDEXED
```

### 12.1 Schema Definition for App 795:
1. **`Routing_Key`**: `SINGLE_LINE_TEXT`, required = true, **unique = false** (indexed).
2. **`Version_Key`**: `SINGLE_LINE_TEXT`, required = true, **unique = true**. Format: `{Routing_Key}#v{Version_Number}` (e.g. `FIN#v1`, `FIN#v2`, `TMG1|TeamA#v1`).
3. **`Version_Number`**: `NUMBER`, required = true, min = 1.
4. **`Effective_From`**: `DATE`, required = true.
5. **`Effective_To`**: `DATE`, required = false (blank = indefinite).
6. **`Version_Status`**: `DROP_DOWN` (`DRAFT`, `ACTIVE`, `SUPERSEDED`, `CANCELLED`).
7. **`Primary_Scorer_Slot`**: `DROP_DOWN` (`SLOT_1`, `SLOT_2`, `SLOT_3`, `SLOT_4`).
8. **`Secondary_Scorer_Slot`**: `DROP_DOWN` (`NONE`, `SLOT_1`, `SLOT_2`, `SLOT_3`, `SLOT_4`).

---

## 13. Exact Resolver Selection Algorithm (Read-Only)

At resolution timestamp $T$ (format `YYYY-MM-DD`):

```javascript
const query = `Routing_Key = "${cleanRoutingKey}" `
  + `and Version_Status in ("ACTIVE") `
  + `and Effective_From <= "${T}" `
  + `and (Effective_To >= "${T}" or Effective_To = "") `
  + `order by Effective_From desc limit 2`;

const resp = await kintoneApi.getRecords(routingAppId, query);
const candidates = resp?.records || [];

if (candidates.length === 0) {
  throw new Error(`NO_EFFECTIVE_ROUTE: No active routing configuration is effective for ${cleanRoutingKey} at date ${T}.`);
}

if (candidates.length > 1) {
  throw new Error(`AMBIGUOUS_EFFECTIVE_ROUTE: Multiple overlapping active route versions found for ${cleanRoutingKey} at date ${T}.`);
}

return candidates[0];
```

### Guarantees:
- **Zero activation writes:** Resolution is 100% read-only.
- **Timestamp Boundary:** At `2026-09-30`, resolves V1. At `2026-10-01`, automatically resolves V2 without human or script intervention.
- **Fail-Closed:** Gaps or overlapping intervals fail closed immediately.

---

## 14. Version & Effective Interval Validation

When HR creates or updates a route version in App 800, the system validates:
1. `Effective_To` $\ge$ `Effective_From` (if `Effective_To` is populated).
2. Interval Overlap Check: Queries all existing versions for the same `Routing_Key` with `Version_Status in ("ACTIVE")`:
   - New version interval must not intersect any existing active interval.
3. Gap Detection: If a new version starts after the previous version's end date, the system prompts HR with an explicit warning acknowledging the gap.
4. Process Capability Guard: If the route version uses G2 (`M1_G1_G2` or `M1_M2_G1_G2`), activation is blocked until App 794 Process Management is verified at 19 states.

---

## 15. HR Dashboard Target User Experience (App 800)

```
+---------------------------------------------------------------------------------------------------+
|  MBO 2026 — HR Control Center | ROUTING MASTER MANAGEMENT                                         |
+---------------------------------------------------------------------------------------------------+
|  SCOPE: Section: [ FIN - Finance Department     v]   Team: [ Accounts Payable    v]               |
|  ROUTING KEY: FIN|AP                CURRENT ACTIVE VERSION: v1 (Effective: 2026-04-01 to 2026-09-30) |
+---------------------------------------------------------------------------------------------------+
|  VERSION SETUP:                                                                                   |
|  Editing Mode: (*) Schedule New Version (v2)    ( ) View Historical Version                       |
|  Effective From: [ 2026-10-01 ]                 Effective To: [            ] (Blank = Indefinite) |
|                                                                                                   |
|  ROUTE PATTERN:                                                                                   |
|  Steps: ( ) 1 Step   ( ) 2 Steps   (*) 3 Steps   ( ) 4 Steps                                      |
|  3-Step Pattern: (*) Structure A (Asst Mgr -> Dept Mgr -> GM)                                    |
|                  ( ) Structure B (Dept Mgr -> GM -> Senior Exec)                                  |
|                                                                                                   |
|  SEQUENTIAL EVALUATORS & SCORING DESIGNATION:                                                     |
|  +---------------------------------------------------------------------------------------------+  |
|  | [Step 1: 1st Appraiser (Asst Mgr)]     Approver: [ Somchai P. (0102)   v]                   |  |
|  | Role: [ ] None (Workflow Only)   (*) Primary Scorer (K=1/2)   ( ) Secondary Scorer (K=2)    |  |
|  +---------------------------------------------------------------------------------------------+  |
|  | [Step 2: 2nd Appraiser (Dept Mgr)]     Approver: [ Papatchaya T. (0113) v]                   |  |
|  | Role: [ ] None (Workflow Only)   ( ) Primary Scorer (K=1/2)   (*) Secondary Scorer (K=2)    |  |
|  +---------------------------------------------------------------------------------------------+  |
|  | [Step 3: 3rd Appraiser (General Mgr)]  Approver: [ Hiroshi T. (0005)   v]                   |  |
|  | Role: (*) None (Workflow Only)   ( ) Primary Scorer (K=1/2)   ( ) Secondary Scorer (K=2)    |  |
|  +---------------------------------------------------------------------------------------------+  |
|                                                                                                   |
|  SCORING VALIDATION PREVIEW:                                                                      |
|  - Profile with K=1: Scorer = Somchai P. (100%) -> VALID                                          |
|  - Profile with K=2: Scorers = Somchai P. (50%) + Papatchaya T. (50%) -> VALID                    |
|  - Workflow Endorser: Hiroshi T. (Workflow Approval Only) -> VALID                                |
|                                                                                                   |
|  Mandatory Reason: [ Q3 Organization Restructuring and Section Head appointment                  ] |
+---------------------------------------------------------------------------------------------------+
|  [ PREVIEW ROUTE VERSION ]    [ CANCEL ]                                                          |
+---------------------------------------------------------------------------------------------------+
```

---

## 16. Audit & Historical Lineage Contract

Every route change logs an immutable audit trail entry containing:
- `Routing_Key`, `Version_Key`, `Version_Number`
- `Effective_From`, `Effective_To`
- `Route_Pattern`, `Derived_Topology`
- Full JSON snapshot of ordered appraisers and scoring assignments
- `Changed_By`, `Changed_At` (ISO timestamp)
- `Business_Reason` (non-empty mandatory string)
- `Previous_Version_Key`

Historical versions remain permanently in App 795 (`Version_Status = SUPERSEDED`), ensuring complete historical reproducibility.

---

## 17. Migration & Backward Compatibility

1. **Initial Baseline Seeding:**
   - Existing active App 795 rows (Revision 70 baseline, `M1_G1`) are seeded with `Version_Number = 1`, `Version_Key = {Routing_Key}#v1`, `Effective_From = 2026-04-01`, `Effective_To = ""`, `Primary_Scorer_Slot = "SLOT_1"`, `Secondary_Scorer_Slot = "SLOT_2"`.
2. **Zero In-Flight Impact:**
   - Existing App 794 records retain their snapshot data.
   - Resolver changes take effect only for fresh resolutions.

---

## 18. Updated Implementation Gap Register

| Domain | Current State | Target State (R2) | Change Required | Risk | Test Required | Decision Status |
|---|---|---|---|---|---|---|
| **Scoring Roles** | Undefined for extended routes | Governed by `OWNER_DEC_D3_003` (Profile K_expected + HR selection) | Implement scorer slot fields in App 795 & resolver | Medium | Scorer validation test suite | **LOCKED (DEC-D3-003)** |
| **Score Fields** | `Manager_*` and `GM_*` physical fields | Compatibility Adapter maps physical to generic Scorer 1/2 | Update UI and calculation adapters | Low | Calculation parity test | Resolved in Design |
| **Effective Dating** | Unique `Routing_Key` blocks duplicate rows | Model A: Versioned rows with unique `Version_Key` | Update App 795 schema & resolver query | Medium | Date interval boundary tests | **OWNER-DEC-D3-006 (Pending)** |
| **Self-Appraiser** | Elision inverts M1/M2 order; drops scorers blindly | Ordinal business compaction + fail-closed on lost scorers | Update `applyOwnMboSelfAppraiserElision` | Low | Self-elision unit suite | Resolved in Design |
| **Native ALL/ANY** | Static assignee type in native states | Option A: 1 user per slot in V1 (recommended) | Enforce slot count in HR Dashboard | Low | Slot population test | **OWNER-DEC-D3-005 (Pending)** |
| **HR Dashboard** | No routing manager | Guided pattern & scorer selection UI in App 800 | Create `hr-routing-manager.js` | Medium | End-to-end UI UAT | Owner Mandated |

---

## 19. Future Test Design Matrix (R2)

1. **Scorer Selection Tests:**
   - 4-appraiser route with $K=2$: Assert exactly 2 scorers active at 50%/50%; non-scoring appraisers advance workflow without ratings.
   - Profile with $K=1$: Assert Primary Scorer evaluates at 100%.
   - HR selects 3 scorers for $K=2$ profile $\implies$ Assert fail closed (`INVALID_SCORER_COUNT`).
2. **Effective Date Boundary Tests:**
   - Record created on `2026-09-30` $\implies$ Resolves V1.
   - Record created on `2026-10-01` $\implies$ Resolves V2.
   - Overlapping date intervals $\implies$ Assert fail closed (`AMBIGUOUS_EFFECTIVE_ROUTE`).
3. **Self-Appraiser + Scorer Tests:**
   - Employee is Primary Scorer on own MBO $\implies$ Assert fail closed with `SCORING_ROUTE_INCOMPLETE_AFTER_SELF_ELISION` unless valid surviving fallback exists.
   - Employee is non-scoring workflow endorser $\implies$ Assert self-elision succeeds, scoring remains intact.

---

## 20. Owner Decisions Status Summary

1. **`OWNER-DEC-D3-003`:** **LOCKED / OWNER APPROVED** (`HR_CONFIGURABLE_SCORING_APPRAISERS_WITHIN_WORKFLOW_ROUTE_USING_FROZEN_PROFILE_K_EXPECTED`).
2. **`OWNER-DEC-D3-005` (Native ALL/ANY Consensus):** **PENDING OWNER DECISION** (Option A recommended).
3. **`OWNER-DEC-D3-006` (App 795 Effective-Dating Persistence Model):** **OWNER_DECISION_REQUIRED** (Model A versioned rows strongly recommended).

---

## 21. Recommended Implementation Contract

```text
RECOMMENDED_PROCESS_MODEL = ADDITIVE_19_STATE_EXTENSION
RECOMMENDED_STATE_COUNT = 19
RECOMMENDED_ACTION_COUNT = 40
RECOMMENDED_SCORING_MODEL = OWNER_DEC_D3_003_LOCKED
SCORER_COUNT_SOURCE = FROZEN_EVALUATION_PROFILE_K_EXPECTED (1 or 2)
SCORER_IDENTITY_SELECTOR = HR_VIA_ROUTING_MASTER
RECOMMENDED_SCORE_STORAGE_ADAPTER = PHYSICAL_COMPATIBILITY_ADAPTER_A
RECOMMENDED_PERSISTENCE_MODEL = MODEL_A_VERSIONED_ROWS_IN_APP795
UNIQUE_KEY_MODEL = VERSION_KEY_UNIQUE
RESOLVER_ALGORITHM = READ_ONLY_DATE_INTERVAL_QUERY (NO_ACTIVATION_WRITES)
```

---

## 22. Next Gate

- **Active State:** Work package `D3-WP001-R2` design corrective execution complete.
- **Parent Status:** `D3-WP001-R1` is `PARTIAL PASS / SUPERSEDED WHERE CORRECTED BY D3-WP001-R2`.
- **Next Permitted Action:** `CONTROL_PLANE_REVIEW_OF_D3_WP001_R2` (Independent review by ChatGPT Control Plane).
- **Execution Invariant:** Antigravity does **not** self-certify closure. Zero source code edits, zero Kintone mutations, and zero test executions are authorized until explicit Owner and Control Plane approval.
