# D3-WP001-R1: Native Process, Ordinal Route Pattern, Effective-Dated HR Routing Design Corrective

**Date:** 2026-09-08 ICT
**Work Package:** `D3-WP001-R1`
**Title:** Native Process, Ordinal Route Pattern, Effective-Dated HR Routing Design Corrective
**Type:** `DESIGN / EVIDENCE-ONLY CORRECTIVE`
**Owner Authorization:** `APPROVED`
**Owner Clarification:** Three-business-appraiser routes may legitimately be either `M1_M2_G1` or `M1_G1_G2`. Therefore, `APPRAISER_COUNT` does NOT uniquely determine topology (`APPRAISER_COUNT_DETERMINES_TOPOLOGY = NO`). Both three-appraiser topology variants must remain supported.
**Branch:** `ai/antigravity-wp002c`
**Repository:** `rebootob/MBO2026`
**Starting HEAD:** `7db1f0c4206d59f97a2ace61b9c54fdc1af1d05e`
**Author:** Antigravity Execution Plane
**Review Target:** Human Owner & ChatGPT Control Plane

---

## 1. Control Plane Findings & Defect Analysis

Upon independent architectural review of `D3-WP001` (commit `7db1f0c`), the ChatGPT Control Plane issued:

```text
D3-WP001 = PARTIAL PASS / DESIGN CORRECTIVE REQUIRED
```

Five material design defects were identified:
1. **Native Process ALL/ANY Incompatibility:** `D3-WP001` assumed that native Kintone Process Management states could dynamically execute `ALL` or `ANY` based on App 795 field values. In native Kintone, `assignee.type` is statically configured per state.
2. **Business Ordinal Inversion in Self-Appraiser Source:** Current source code (`src/services/routing-service.js`) extracts slots in raw property order `M1 -> M2 -> G1 -> G2`. However, for `M1_M2_G1` and `M1_M2_G1_G2`, native Process Management executes `02 First Manager` (M2) *before* `03 Manager` (M1). Compacting slots using raw extraction order inverted the business sequence.
3. **Ambiguity of 3-Appraiser Topologies:** `D3-WP001` collapsed 3-appraiser routes into `M1_M2_G1` by default and treated `M1_G1_G2` as an exception. Owner authority explicitly confirms that both `M1_M2_G1` and `M1_G1_G2` are legitimate 3-appraiser routes; appraiser count alone does not uniquely determine topology.
4. **Effective-Dated Persistence Incompatibility with Unique Key:** App 795 enforces `unique: true` on `Routing_Key`. A design introducing future-dated routes with the same `Routing_Key` fails closed against Kintone database constraints (`GAIA_DUPLICATE_VALUE`).
5. **Premature Assertion on Scoring Roles:** `D3-WP001` asserted as settled authority that Appraisers 3 and 4 are "approval-only". Repository authority (`DEC-036`) governs $K_{\text{expected}}=1$ or $2$, but does not settle the long-term role of Appraisers 3 and 4. This must remain explicitly classified as `OWNER_DECISION_REQUIRED`.

`D3-WP001-R1` provides the authoritative corrective architecture resolving all five gaps without altering locked Owner decisions.

---

## 2. Repository Evidence

1. **Native Process Baseline:**
   - App 794 runs at Live Revision 70 with 16 states and 28 actions (`scratch/app794-pm-prewrite-backup.json`).
   - Every review state (`02`, `03`, `04`, `07`, `08`, `09`, `12`, `13`, `14`) is configured with:
     ```json
     "assignee": {
       "type": "ONE",
       "entities": [ { "entity": { "type": "FIELD_ENTITY", "code": "..." }, "includeSubs": false } ]
     }
     ```
   - In native Kintone, `type: "ONE"` allows any one person in the assigned field to take the action. It cannot switch dynamically to `ALL` per record without state branching.

2. **Native Execution Sequence for M2:**
   - In `scratch/app794-pm-prewrite-backup.json`, actions for `01 Draft Objective` include:
     - `Submit Objective to First Manager` -> moves to `02 First Manager Objective Review` (M2).
     - `Approve Objective` in state `02` -> moves to `03 Manager Objective Review` (M1).
   - This proves that in native business execution, **M2 evaluates before M1**.

3. **Current Self-Appraiser Slot Extraction:**
   - `src/services/routing-service.js` (lines 294–315) extracts slots in array order: `[{ id: 'M1' }, { id: 'M2' }, { id: 'G1' }, { id: 'G2' }]`.
   - For `M1_M2_G1`, this erroneously treats M1 as Slot 1 and M2 as Slot 2, conflicting with native execution order.

4. **Schema Constraint on App 795:**
   - `config/schema-spec.js` (line 16):
     ```javascript
     Routing_Key: text('Routing Key', { required: true, unique: true })
     ```
   - Duplicate active records with the same `Routing_Key` are rejected by Kintone form validation.

5. **Scoring Bounds:**
   - `project-docs/BUSINESS_RULES.md` (Section 2) & `DEC-036`:
     - $K_{\text{expected}} = 1 \implies 100\%$ (GM / VP baseline).
     - $K_{\text{expected}} = 2 \implies 50\% / 50\%$ (Staff, Asst Mgr, Sect Mgr, etc.).
     - Completeness gate enforces $K_{\text{valid}} == K_{\text{expected}}$.
   - App 794 contains schema columns only for Manager (`Manager_Achievement_1..10`) and GM (`GM_Achievement_1..10`). There are no schema columns for M2 or G2 rating scores.

---

## 3. Corrected Canonical Routing Resolution Model

The end-to-end resolution flow from employee identity to runtime execution is strictly decoupled:

```
[Employee Profile]
  |-- Employee_Code, Section_Code, Team, Position_Code
  v
[App 795 Master Resolution]
  |-- Query by Routing_Key + Effective Date Interval (Effective_From <= Today <= Effective_To)
  v
[Authoritative Route Profile]
  |-- Route_Pattern (e.g. M2_M1_G1 vs M1_G1_G2)
  |-- Ordered Business Appraiser Slots (1st, 2nd, 3rd, 4th)
  |-- Approver User Entities & Rules
  v
[Self-Appraiser Compaction (Own MBO Only)]
  |-- If employee is in route: elide self, compact surviving slots contiguously
  |-- Recalculate Effective Route Pattern & Effective Technical Topology
  |-- Fail-closed if zero survivors (SELF_APPROVAL_ROUTE_CONFLICT)
  v
[Effective Technical Topology]
  |-- M1_ONLY | M1_G1 | M1_M2_G1 | M1_G1_G2 | M1_M2_G1_G2
  v
[App 794 Stage Snapshot]
  |-- Populate Manager_Level1_Approvers, Manager_Level2_Approvers, GM_Level1_Approvers, GM_Level2_Approvers
  |-- Set Routing_Topology on Record
  |-- Native Process Management Filter Conditions evaluate Routing_Topology
```

**Key Principles:**
- Employee identity mode (`DEDICATED` vs `SHARED`) does **not** determine topology.
- Employees do not select or own topologies.
- HR administrators do not type raw topology codes.

---

## 4. Appraiser Count vs Route Pattern

```text
APPRAISER_COUNT_DETERMINES_TOPOLOGY = NO
ROUTE_PATTERN_REQUIRED = YES
```

Appraiser count alone is insufficient to identify the workflow path:

| Sequential Appraiser Count | Valid Route Patterns | Resulting Technical Topologies |
|---|---|---|
| **1 Appraiser** | `PATTERN_1_M1` | `M1_ONLY` |
| **2 Appraisers** | `PATTERN_2_M1_G1` | `M1_G1` |
| **3 Appraisers** | **`PATTERN_3A_M2_M1_G1`**<br>**`PATTERN_3B_M1_G1_G2`** | **`M1_M2_G1`**<br>**`M1_G1_G2`** |
| **4 Appraisers** | `PATTERN_4_M2_M1_G1_G2` | `M1_M2_G1_G2` |

Both 3-appraiser patterns are first-class, legitimate business structures in MBO 2026.

---

## 5. Both Three-Appraiser Topologies Detailed

### 5.1 Pattern 3A: `M1_M2_G1` (Section Head -> Department Manager -> General Manager)
- **Organizational Meaning:** Three-tier hierarchy containing an intermediate supervisor/assistant manager (M2), a primary department manager (M1), and an executive division head (G1).
- **Business Execution Order:**
  1. **1st Appraiser:** Assistant Manager / Section Chief (`Manager_Level2_Approvers` / `First_Manager_User`)
  2. **2nd Appraiser:** Department Manager (`Manager_Level1_Approvers` / `Manager_User`)
  3. **3rd Appraiser:** General Manager (`GM_Level1_Approvers` / `GM_User`)
- **Native Process Execution:** Starts at `02 First Manager Objective Review` -> transitions to `03 Manager Objective Review` -> transitions to `04 GM Objective Review` -> `05 Objective Approved`.

### 5.2 Pattern 3B: `M1_G1_G2` (Department Manager -> General Manager -> Managing Executive)
- **Organizational Meaning:** Three-tier hierarchy without an intermediate section chief, where evaluation progresses through Department Manager (M1), General Manager (G1), and Deputy General Manager / Vice President (G2).
- **Business Execution Order:**
  1. **1st Appraiser:** Department Manager (`Manager_Level1_Approvers` / `Manager_User`)
  2. **2nd Appraiser:** General Manager (`GM_Level1_Approvers` / `GM_User`)
  3. **3rd Appraiser:** Senior Executive / VP (`GM_Level2_Approvers`)
- **Native Process Execution:** Starts at `03 Manager Objective Review` (skips `02`) -> transitions to `04 GM Objective Review` -> transitions to `04B GM2 Objective Review` -> `05 Objective Approved`.

---

## 6. Canonical Business Execution Order

To eliminate the conflict between raw object-property order and native process flow, the canonical business execution order for all five topologies is formally locked:

| Technical Topology | Route Pattern Code | Step 1 (1st Appraiser) | Step 2 (2nd Appraiser) | Step 3 (3rd Appraiser) | Step 4 (4th Appraiser) |
|---|---|---|---|---|---|
| **`M1_ONLY`** | `PATTERN_1_M1` | **M1** (`Manager_Level1`) | *None* | *None* | *None* |
| **`M1_G1`** | `PATTERN_2_M1_G1` | **M1** (`Manager_Level1`) | **G1** (`GM_Level1`) | *None* | *None* |
| **`M1_M2_G1`** | `PATTERN_3A_M2_M1_G1` | **M2** (`Manager_Level2`) | **M1** (`Manager_Level1`) | **G1** (`GM_Level1`) | *None* |
| **`M1_G1_G2`** | `PATTERN_3B_M1_G1_G2` | **M1** (`Manager_Level1`) | **G1** (`GM_Level1`) | **G2** (`GM_Level2`) | *None* |
| **`M1_M2_G1_G2`** | `PATTERN_4_M2_M1_G1_G2` | **M2** (`Manager_Level2`) | **M1** (`Manager_Level1`) | **G1** (`GM_Level1`) | **G2** (`GM_Level2`) |

---

## 7. Technical Slot Mapping & Data Storage

App 794 and App 795 field mapping preserves existing field codes while strictly adhering to business execution order:

```text
BUSINESS SLOT 1 (1st Appraiser) ->
  If Pattern uses M2 as first step (M1_M2_G1, M1_M2_G1_G2): Manager_Level2_Approvers (First_Manager_User)
  Otherwise (M1_ONLY, M1_G1, M1_G1_G2):                     Manager_Level1_Approvers (Manager_User)

BUSINESS SLOT 2 (2nd Appraiser) ->
  If Pattern uses M2 as first step (M1_M2_G1, M1_M2_G1_G2): Manager_Level1_Approvers (Manager_User)
  Otherwise (M1_G1, M1_G1_G2):                              GM_Level1_Approvers (GM_User)

BUSINESS SLOT 3 (3rd Appraiser) ->
  If Pattern is M1_M2_G1:                                   GM_Level1_Approvers (GM_User)
  If Pattern is M1_G1_G2 or M1_M2_G1_G2:                    GM_Level2_Approvers

BUSINESS SLOT 4 (4th Appraiser) ->
  If Pattern is M1_M2_G1_G2:                                GM_Level2_Approvers
```

---

## 8. Self-Appraiser Compaction Matrix (Corrected)

Compaction operates strictly upon the **Canonical Business Execution Sequence**, preserving relative order and mapping surviving steps to valid target topologies:

| Original Topology | Original Business Sequence | Self Location | Surviving Business Sequence | Effective Count | Effective Pattern | Effective Topology |
|---|---|---|---|---|---|---|
| **`M1_ONLY`** | `[M1]` | M1 | `[]` | 0 | None | **FAIL CLOSED** (`SELF_APPROVAL_ROUTE_CONFLICT`) |
| **`M1_G1`** | `[M1, G1]` | M1 | `[G1]` | 1 | `PATTERN_1_M1` | **`M1_ONLY`** (G1 shifts to M1 slot) |
| **`M1_G1`** | `[M1, G1]` | G1 | `[M1]` | 1 | `PATTERN_1_M1` | **`M1_ONLY`** (M1 remains in M1 slot) |
| **`M1_M2_G1`** | `[M2, M1, G1]` | M2 (Step 1) | `[M1, G1]` | 2 | `PATTERN_2_M1_G1` | **`M1_G1`** (M1 -> G1 preserved) |
| **`M1_M2_G1`** | `[M2, M1, G1]` | M1 (Step 2) | `[M2, G1]` | 2 | `PATTERN_2_M1_G1` | **`M1_G1`** (M2 shifts to M1 slot, G1 in G1 slot) |
| **`M1_M2_G1`** | `[M2, M1, G1]` | G1 (Step 3) | `[M2, M1]` | 2 | `PATTERN_2_M1_G1` | **`M1_G1`** (M2 shifts to M1 slot, M1 to G1 slot) |
| **`M1_G1_G2`** | `[M1, G1, G2]` | M1 (Step 1) | `[G1, G2]` | 2 | `PATTERN_2_M1_G1` | **`M1_G1`** (G1 shifts to M1 slot, G2 to G1 slot) |
| **`M1_G1_G2`** | `[M1, G1, G2]` | G1 (Step 2) | `[M1, G2]` | 2 | `PATTERN_2_M1_G1` | **`M1_G1`** (M1 in M1 slot, G2 shifts to G1 slot) |
| **`M1_G1_G2`** | `[M1, G1, G2]` | G2 (Step 3) | `[M1, G1]` | 2 | `PATTERN_2_M1_G1` | **`M1_G1`** (M1 -> G1 preserved) |
| **`M1_M2_G1_G2`** | `[M2, M1, G1, G2]` | **M2 (Step 1)** | `[M1, G1, G2]` | **3** | **`PATTERN_3B_M1_G1_G2`** | **`M1_G1_G2`** |
| **`M1_M2_G1_G2`** | `[M2, M1, G1, G2]` | M1 (Step 2) | `[M2, G1, G2]` | 3 | `PATTERN_3B_M1_G1_G2` | **`M1_G1_G2`** (M2 shifts to M1 slot) |
| **`M1_M2_G1_G2`** | `[M2, M1, G1, G2]` | G1 (Step 3) | `[M2, M1, G2]` | 3 | `PATTERN_3A_M2_M1_G1` | **`M1_M2_G1`** (G2 shifts to G1 slot) |
| **`M1_M2_G1_G2`** | `[M2, M1, G1, G2]` | **G2 (Step 4)** | `[M2, M1, G1]` | **3** | **`PATTERN_3A_M2_M1_G1`** | **`M1_M2_G1`** |

> [!IMPORTANT]
> When a 4-appraiser route compacts to 3 appraisers:
> - Eliding **M2** results in **`M1_G1_G2`**.
> - Eliding **G2** results in **`M1_M2_G1`**.
> This proves that compaction depends strictly on surviving semantic positions and cannot default blindly to `M1_M2_G1`.

---

## 9. Native Kintone ALL / ANY Constraint Analysis

In Kintone Process Management:
- `assignee.type` must be statically defined as `'ONE'`, `'ALL'`, or `'ANY'`.
- Setting a state's `assignee.type` to `'ONE'` means any one user in the assigned field can act (or Kintone assigns to one).
- Setting a state's `assignee.type` to `'ALL'` means **every single user** in that field must click Approve before the record moves to the next state.

Because Kintone does **not** support record-level dynamic `assignee.type` evaluation from a field (e.g. `Approval_Rule`), a single state cannot behave as `ALL` for record X and `ANY` for record Y.

---

## 10. D3 V1 ALL / ANY Implementation Options & Recommendation

### Option A: Strictly 1 Kintone User per Business Appraiser Slot in V1 (Recommended)
- **Design:** Each sequential business slot (1st through 4th Appraiser) accepts exactly **one** Kintone user identity.
- **Rationale:** If count of users in slot $= 1$, `ALL` and `ANY` are mathematically identical.
- **Schema Impact:** `Approval_Rule` fields remain in App 794 and App 795 schemas with default `'ALL'`, preserving backward compatibility.
- **Process Management Impact:** Native states remain simple and clean (`type: 'ONE'`). Zero twin states needed.
- **Complexity:** Very Low. Regression risk: Minimal.

### Option B: Multi-User Allowed, Locked to Native 'ANY' in V1
- **Design:** A business slot can contain multiple users, but the native Process Management state is set to `type: 'ANY'`.
- **Behavior:** The first user in that slot to approve advances the workflow.
- **Complexity:** Low.

### Option C: Native Twin-State Branching (`ALL` States vs `ANY` States)
- **Design:** Duplicate every review state into an `_ALL` state and an `_ANY` state (e.g. `03A Manager Review (ALL)` vs `03B Manager Review (ANY)`), using Kintone action filter conditions (`Manager_Approval_Rule = "ALL"`).
- **Complexity:** Extreme. State count expands from 16 to 30+ states, actions expand to 65+ actions.
- **Fit:** Contradicts the minimal extension principle and Owner mandate to defer 45-state complexity.

### Recommendation:
Adopt **Option A** for D3 V1. If business stakeholders require multiple approvers in a single step with consensus approval (`ALL`), that requirement is bounded under `OWNER-DEC-D3-005`.

---

## 11. Corrected Native Process Management Model

Under Option A (or Option B), the Process Management extension remains purely additive:
- **Baseline States (16):** Fully preserved.
- **New States (3):** Added to support G2:
  - `04B GM2 Objective Review`
  - `09B GM2 Mid-Year Review`
  - `14B GM2 Final Evaluation`
- **Total Proposed States:** **19 States** (if Option A/B) or **31 States** (if Option C).

---

## 12. Recomputed State & Action Count

```text
CURRENT_STATE_COUNT = 16
CURRENT_ACTION_COUNT = 28

Under Option A / Option B (Recommended):
PROPOSED_D3_V1_STATE_COUNT = 19
PROPOSED_D3_V1_ACTION_COUNT = 40

Under Option C (Full Native ALL/ANY Branching):
PROPOSED_D3_V1_STATE_COUNT = 31
PROPOSED_D3_V1_ACTION_COUNT = 68
```

### Action Breakdown for Recommended 19-State Model:
- **Unchanged Actions:** 22
- **Modified Existing Actions (Added Routing Filters):** 6
  - Actions from `03`, `08`, `13` to `04`, `09`, `14` filtered by `Routing_Topology not in ("M1_ONLY")`.
  - Actions from `04`, `09`, `14` to `05`, `10`, `15` filtered by `Routing_Topology not in ("M1_G1_G2", "M1_M2_G1_G2")`.
- **New Actions for M1_ONLY Bypass:** 3 (Direct to Approved / Completed / HR Check).
- **New Actions for G2:** 9 (6 forward transitions + 3 return actions to requester).
- **Total Actions:** $22 + 6 + 3 + 9 = 40$.

---

## 13. Effective-Dated Routing Persistence

### Root Cause Analysis of Schema Incompatibility:
App 795 defines `Routing_Key` with `unique: true`. Storing multiple versions with the same `Routing_Key` in App 795 violates Kintone uniqueness constraints.

### Evaluated Architectural Alternatives:

| Alternative | Description | Pros | Cons | Verdict |
|---|---|---|---|---|
| **Alternative A: Relax Uniqueness in App 795** | Remove `unique: true` on `Routing_Key`. Add `Version_Key` (`{Routing_Key}#v{N}`) with `unique: true`. | All versions live in App 795; native queries possible. | Requires Kintone App 795 field setting schema change. | Viable, requires schema deploy |
| **Alternative B: App 795 as Current Active Pointer + Scheduled Staging** | App 795 retains `Routing_Key` as `unique: true` for the *currently active* route. Future scheduled changes are stored in a dedicated version table / JSON structure, activated deterministically on effective date. | Zero schema changes to App 795. 100% backward compatible with existing queries. | Requires an activation job or lazy-activation resolver. | **RECOMMENDED FOR D3 V1** |
| **Alternative C: Dedicated Route Versions Master App** | Create App 802 to store historical and future route versions. App 795 is synced as cache. | Clean normalization. | Adds another app to manage; violates "avoid new apps" guideline. | Rejected |

### Recommended Persistence Architecture (Alternative B):
1. **App 795 Schema Remains Stable:** `Routing_Key` remains unique. App 795 always holds the active baseline route.
2. **Scheduled Staging:** When HR schedules a future route change (e.g. Effective 2026-10-01), the change is staged in a versioned audit payload (`App 795 Pending_Route_JSON` or staged record in App 798).
3. **Deterministic Activation:** When `Current_Date >= Effective_From`, the resolver (or HR activation control) promotes the pending payload to active App 795 fields.

---

## 14. Resolver Selection Algorithm

At route resolution time $T$:
1. Query App 795 by `Routing_Key = "{key}" and Active in ("Active") limit 2`.
2. If records returned $= 0$: **FAIL CLOSED** (`ROUTE_NOT_FOUND`).
3. If records returned $> 1$: **FAIL CLOSED** (`AMBIGUOUS_ROUTE`).
4. Inspect `Effective_From` and `Effective_To`:
   - If $T < \text{Effective\_From}$: Fail closed or use fallback active baseline. Future routes are never prematurely activated.
   - If $\text{Effective\_To}$ is populated and $T > \text{Effective\_To}$: Fail closed (`EXPIRED_ROUTE`).
5. Validate `Route_Pattern` and slot integrity:
   - Verify that slot population exactly matches `Route_Pattern`.
   - If pattern is missing or contradicts populated slots: **FAIL CLOSED** (`INVALID_ROUTE_PATTERN`).
6. Apply Self-Appraiser Elision if evaluating own MBO.

---

## 15. HR Dashboard Route Pattern UX

In App 800 HR Control Center, HR users manage routes through guided business language rather than technical codes:

```text
Step 1: Select Scope
  Section: [ FIN - Finance Department ]   Team: [ Accounts Payable ]

Step 2: Select Number of Sequential Approval Steps
  ( ) 1 Step    ( ) 2 Steps    (*) 3 Steps    ( ) 4 Steps

Step 3: For 3 Steps, Select Route Structure:
  (*) Structure A: Section Chief -> Department Manager -> General Manager
      (ลำดับ: ผู้ช่วย/หัวหน้าแผนก -> ผู้จัดการฝ่าย -> ผู้จัดการทั่วไป)
      [System internal: M1_M2_G1]

  ( ) Structure B: Department Manager -> General Manager -> Executive VP
      (ลำดับ: ผู้จัดการฝ่าย -> ผู้จัดการทั่วไป -> ผู้บริหารระดับสูง/รองกรรมการผู้จัดการ)
      [System internal: M1_G1_G2]

Step 4: Assign Evaluators for Each Step
  [Step 1: 1st Appraiser] -> User: [ Somchai P. (0102) ]
  [Step 2: 2nd Appraiser] -> User: [ Papatchaya T. (0113) ]
  [Step 3: 3rd Appraiser] -> User: [ Hiroshi T. (0005) ]

Step 5: Effective Date & Mandatory Rationale
  Effective From: [ 2026-10-01 ]
  Reason: [ Annual departmental reorganization ]

[ PREVIEW ROUTE CHANGE ] -> Shows full before/after diff and derived topology.
```

---

## 16. Existing Route Edit Contract

When an HR administrator changes **only an appraiser identity** (e.g. Employee A leaves, replaced by Employee B):
- **Preserve:**
  - `Route_Pattern` is strictly preserved.
  - `Routing_Topology` is strictly preserved.
  - Relative appraiser order is strictly preserved.
- **Rule:** Replacing an individual evaluator in an existing `M1_G1_G2` route **must never** convert the route to `M1_M2_G1`. Structural topology changes require explicit confirmation in the structural change flow.

---

## 17. Structural Route Change Contract

When HR intentionally changes the structure (e.g. changing from 2 steps to 3 steps, or switching from Structure A to Structure B):
- The modal explicitly displays a **Structural Change Warning**:
  ```text
  STRUCTURAL ROUTE CHANGE DETECTED:
  Previous Pattern: PATTERN_2_M1_G1 (Topology: M1_G1)
  New Pattern:      PATTERN_3B_M1_G1_G2 (Topology: M1_G1_G2)
  New Step Added:   3rd Appraiser (Senior Executive)
  Effective Date:   2026-10-01
  Capability Check: PASS (19-State Process Management Deployed)
  ```
- If the target topology requires G2 and App 794 is running Revision 70 (16 states), the dashboard **blocks activation** with:
  `ACTIVATION_BLOCKED: App 794 Process Management does not currently support G2 (19-state deployment required).`

---

## 18. Scoring vs Workflow Evidence Matrix

| Topology | Technical Slots | Current Rating Fields in App 794 | Current K_expected (DEC-036) | Current Authority Status |
|---|---|---|---|---|
| **`M1_ONLY`** | M1 | `Manager_Achievement_1..10` | $K=1$ ($100\%$ M1) | Settled (`DEC-036`) |
| **`M1_G1`** | M1, G1 | `Manager_Achievement_1..10`<br>`GM_Achievement_1..10` | $K=2$ ($50\%$ M1, $50\%$ G1) | Settled (`DEC-036`) |
| **`M1_M2_G1`** | M2, M1, G1 | Rating fields exist for M1 and G1 only. **Zero fields for M2**. | Unresolved for 3 evaluators. | **OWNER_DECISION_REQUIRED** |
| **`M1_G1_G2`** | M1, G1, G2 | Rating fields exist for M1 and G1 only. **Zero fields for G2**. | Unresolved for 3 evaluators. | **OWNER_DECISION_REQUIRED** |
| **`M1_M2_G1_G2`** | M2, M1, G1, G2 | Rating fields exist for M1 and G1 only. **Zero fields for M2/G2**. | Unresolved for 4 evaluators. | **OWNER_DECISION_REQUIRED** |

```text
SCORING_ROUTING_RELATIONSHIP = OWNER_DECISION_REQUIRED
```

No scoring formulas or schema columns are modified in D3-WP001-R1.

---

## 19. Owner Decisions Required

1. **`OWNER-DEC-D3-003` (Scoring Role of Extended Appraisers):**
   - *Option A (Recommended for D3 V1):* Appraisers in 3rd/4th positions operate as **workflow approval/endorsement-only evaluators**. Scoring remains governed by $K=1$ or $K=2$ under `DEC-036`.
   - *Option B:* Expand App 794 schema with scoring fields for all 4 evaluators and expand `DEC-036` to $K=3$ and $K=4$.

2. **`OWNER-DEC-D3-005` (Approval Rule Consensus Behavior):**
   - *Option A (Recommended for D3 V1):* Limit each sequential business slot to 1 Kintone user, making ALL/ANY identical and avoiding twin-state explosion.
   - *Option B:* Allow multi-user slots with native `'ANY'` semantics.
   - *Option C:* Implement full native twin-state branching (31 states / 68 actions).

3. **`OWNER-DEC-D3-006` (App 795 Effective-Dating Persistence Model):**
   - *Option A:* Schema modification to remove `unique: true` on `Routing_Key` in App 795 and use `Version_Key`.
   - *Option B (Recommended):* Keep App 795 `Routing_Key` unique representing active route, with scheduled staging for future effective routes.

---

## 20. Updated Implementation Gap Register

| Domain | Current State | Target State | Change Required | Risk | Test Required | Decision Required |
|---|---|---|---|---|---|---|
| **Process Management** | 16 states / 28 actions | 19 states / 40 actions (Option A/B) | Add 3 G2 states, 12 actions, update 6 filters | Low | State transition suite | NO |
| **Route Pattern Model** | Appraiser count used as proxy | Explicit `Route_Pattern` field (`PATTERN_3A` vs `PATTERN_3B`) | Store and validate `Route_Pattern` in App 795 | Low | Pattern resolution unit tests | NO |
| **Ordinal Mapping** | Raw property order M1->M2->G1->G2 | Canonical business execution order (M2 before M1 for M2 routes) | Update slot extraction in `RoutingService` | Low | Compaction unit tests | NO |
| **Self-Appraiser** | Hardcoded M1_M2_G1 fallback; wrong error code | Accurate semantic compaction to M1_M2_G1 or M1_G1_G2; `SELF_APPROVAL_ROUTE_CONFLICT` | Fix `applyOwnMboSelfAppraiserElision` | Low | All self-appraiser test cases | NO |
| **Effective Dating** | Unique Routing_Key blocks duplicate rows | Deterministic staging and activation (Alternative B) | Implement staged activation resolver | Medium | Date interval boundary tests | YES (`DEC-D3-006`) |
| **Native ALL/ANY** | Dropdown exists, static native state | 1 user per slot (Option A) or locked ANY (Option B) | Formulate UI validation in HR Dashboard | Low | Slot population test | YES (`DEC-D3-005`) |
| **HR Dashboard** | No routing UI in App 800 | Self-service routing manager with pattern selector | Build `hr-routing-manager.js` in App 800 | Medium | UI end-to-end UAT | NO |
| **Scoring Relationship** | K=1, 2 only; App 794 has 2 scoring columns | Decided by Owner (`OWNER-DEC-D3-003`) | Bounded to approval-only in D3 V1 | High (if changed) | Regression suite | YES (`DEC-D3-003`) |

---

## 21. Updated Test Design Suite

1. **Route Pattern Distinction Tests:**
   - Verify 3-appraiser Pattern A (`M2 -> M1 -> G1`) resolves to `M1_M2_G1`.
   - Verify 3-appraiser Pattern B (`M1 -> G1 -> G2`) resolves to `M1_G1_G2`.
   - Verify changing an appraiser user identity on Pattern B preserves `M1_G1_G2`.

2. **Self-Appraiser Compaction Tests:**
   - 4-appraiser route (`M2 -> M1 -> G1 -> G2`):
     - Remove M2 -> asserts effective topology is **`M1_G1_G2`** (NOT `M1_M2_G1`).
     - Remove G2 -> asserts effective topology is **`M1_M2_G1`**.
     - Remove all -> asserts throw **`SELF_APPROVAL_ROUTE_CONFLICT`**.

3. **Effective-Dating Resolver Tests:**
   - Date before `Effective_From` -> resolves current baseline route, not future route.
   - Date on/after `Effective_From` -> resolves new route.
   - Ambiguous or overlapping active routes -> fails closed with `AMBIGUOUS_ROUTE`.

4. **Process Management Transition Tests:**
   - `M1_ONLY` -> verifies direct transition from `03 Manager` to `05 Objective Approved`.
   - `M1_G1_G2` -> verifies transition from `04 GM` to `04B GM2` to `05 Objective Approved`.

---

## 22. Migration & Rev 70 Compatibility

1. **Additive Schema & Process Management:**
   - Process Management extension from 16 to 19 states is 100% additive.
   - Existing records at Revision 70 continue on `M1_G1` path without alteration.
2. **Preflight Guard:**
   - G2 topologies cannot be activated until the 19-state Process Management deployment is verified live.

---

## 23. Recommended Implementation Contract

```text
RECOMMENDED_PROCESS_MODEL = ADDITIVE_19_STATE_EXTENSION
RECOMMENDED_STATE_COUNT = 19
RECOMMENDED_ACTION_COUNT = 40
RECOMMENDED_ALL_ANY_MODEL = OPTION_A_SINGLE_USER_PER_SLOT_V1
RECOMMENDED_ROUTE_PATTERN_STORAGE = EXPLICIT_ROUTE_PATTERN_IN_APP795
RECOMMENDED_EFFECTIVE_DATING = ALTERNATIVE_B_ACTIVE_POINTER_WITH_SCHEDULED_STAGING
SCORING_ROUTING_RELATIONSHIP = OWNER_DECISION_REQUIRED (APPROVAL_ONLY_IN_D3_V1)
```

---

## 24. Next Gate

- **Active State:** Work package `D3-WP001-R1` design corrective execution complete.
- **Parent Status:** `D3-WP001` is `PARTIAL PASS / SUPERSEDED WHERE CORRECTED BY D3-WP001-R1`.
- **Next Permitted Action:** `CONTROL_PLANE_REVIEW_OF_D3_WP001_R1` (Independent review by ChatGPT Control Plane).
- **Execution Invariant:** Antigravity does **not** self-certify closure. Zero source code changes, zero Kintone mutations, and zero test executions are authorized until explicit Owner and Control Plane approval.
