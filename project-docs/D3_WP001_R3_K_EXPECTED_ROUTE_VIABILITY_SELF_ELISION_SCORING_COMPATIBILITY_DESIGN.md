# D3-WP001-R3: K_expected / Route Viability & Self-Elision Scoring Compatibility Design

**Date:** 2026-09-08 ICT
**Work Package:** `D3-WP001-R3`
**Title:** K_expected / Route Viability & Self-Elision Scoring Compatibility Design
**Type:** `DESIGN / EVIDENCE-ONLY CORRECTIVE`
**Owner Authorization:** `APPROVED` ("อนุมัติ D3-WP001-R3 DESIGN / EVIDENCE-ONLY K_expected / Route Viability & Self-Elision Scoring Compatibility Design")
**Parent Work Packages:**
- `D3-WP001` = PARTIAL PASS / SUPERSEDED WHERE CORRECTED
- `D3-WP001-R1` = PARTIAL PASS / SUPERSEDED WHERE CORRECTED
- `D3-WP001-R2` = PARTIAL PASS / SCORING-ROUTE COMPATIBILITY CORRECTIVE REQUIRED
**Branch:** `ai/antigravity-wp002c`
**Repository:** `rebootob/MBO2026`
**Starting HEAD:** `836b9e20b5762d5b5be48c510febbcd6f85014f6`
**Author:** Antigravity Execution Plane
**Review Target:** Human Owner & ChatGPT Control Plane

---

## 1. Control Plane R2 Review & Historical Context

The independent ChatGPT Control Plane reviewed `D3-WP001-R2` and issued the following governing verdict:

```text
D3-WP001    = PARTIAL PASS / SUPERSEDED WHERE CORRECTED
D3-WP001-R1 = PARTIAL PASS / SUPERSEDED WHERE CORRECTED
D3-WP001-R2 = PARTIAL PASS / SCORING-ROUTE COMPATIBILITY CORRECTIVE REQUIRED
```

### 1.1 Locked Findings from R1/R2 (Must NOT be Reopened Without New Contradictory Evidence)
1. **`THREE_APPRAISER_DUAL_PATTERN = PASS`**: Both `M1_M2_G1` and `M1_G1_G2` topology variants are legitimate 3-appraiser routes. Appraiser count alone does NOT uniquely determine workflow topology.
2. **`ORDINAL_MAPPING = PASS`**: Workflow appraiser slots map ordinally (`1st`, `2nd`, `3rd`, `4th` Appraiser) rather than strictly hardcoding organizational ranks to slot numbers.
3. **`ROUTE_PATTERN_MODEL = PASS`**: HR selects a predefined Route Pattern from Route Pattern Master.
4. **`OWNER_DEC_D3_003 = LOCKED / OWNER APPROVED`**: HR-configurable scoring appraisers within workflow route using frozen Evaluation Profile $K_{\text{expected}}$.
5. **`EFFECTIVE_DATED_ROUTING_MODEL = DESIGN PASS / MODEL_A RECOMMENDED`**: Model A (Versioned rows in App 795 with unique `Version_Key`, non-unique `Routing_Key`, read-only interval query resolver) is the accepted technical design, pending formal Owner sign-off `OWNER_DEC_D3_006`.
6. **`NATIVE_ALL_ANY = OWNER_DEC_D3_005 PENDING`**: Process management native ALL/ANY behavior remains pending Owner decision.

### 1.2 R2 Gap Requiring R3 Corrective
While R2 established the decoupling of workflow steps from scoring roles, it contained key gaps:
1. **Incorrect Set Terminology**: R2 described scoring appraisers as a "strict subset" of workflow appraisers, which is incorrect when the workflow set size equals $K_{\text{expected}}$.
2. **Missing Self-Elision Viability Simulation**: R2 did not mandate simulating self-elision *before* asserting route viability.
3. **DGM Material Conflict Unaddressed**: Repository truth establishes DGM profile requires $K_{\text{expected}} = 2$, but DGM route in App 795 is `POSITION_DGM` with topology `M1_ONLY` (1 appraiser), making it fundamentally non-viable.
4. **Scorer Snapshot Metadata vs Physical Matrix Confusion**: R2 stated "zero App 794 schema impact" too broadly without distinguishing physical score storage from runtime/audit snapshot metadata.

---

## 2. Locked Owner Scoring Authority

Governance under `OWNER_DEC_D3_003` is strictly maintained:

```text
OWNER_DEC_D3_003 = HR_CONFIGURABLE_SCORING_APPRAISERS_WITHIN_WORKFLOW_ROUTE_USING_FROZEN_PROFILE_K_EXPECTED
SCORER_COUNT_SOURCE = FROZEN_EVALUATION_PROFILE_K_EXPECTED (1 or 2)
SCORER_IDENTITY_SELECTOR = HR
WORKFLOW_APPRAISER_COUNT = 1..4
CURRENT_SUPPORTED_K_EXPECTED = 1..2
WEIGHT_GOVERNANCE = DEC-036 UNCHANGED (K=1 -> 100%, K=2 -> 50%/50%)
HR_MAY_CHANGE_K_EXPECTED = NO
```

* **How Many Scorers:** Determined strictly by the employee's annually frozen Evaluation Profile ($K_{\text{expected}} \in \{1, 2\}$). HR cannot override, increment, or decrement $K_{\text{expected}}$.
* **Which Scorers:** HR configures which specific workflow appraisers fulfill the scoring roles.
* **Prohibited Extensions:** $K=3$ and $K=4$ are strictly forbidden in D3 V1.
* **Weight Integrity:** Weights are derived strictly from $1/K_{\text{expected}}$. Automatic weight redistribution upon missing or non-scoring appraisers is strictly prohibited (`DEC-036`).

---

## 3. Correct Scoring Set Relationship

We formally correct the mathematical set relationship from R2:

$$\text{SCORING\_APPRAISERS} \subseteq \text{EFFECTIVE\_WORKFLOW\_APPRAISERS}$$

**The relationship is a subset or equal ($\subseteq$), NOT a strict subset ($\subset$).**

### Proof of Validity:
* **Case 1 (Single Appraiser Route, $K_{\text{expected}}=1$):**
  * Workflow route: $[ \text{User\_A} ]$
  * Scoring appraisers: $\{ \text{User\_A} \}$
  * Here, $\text{Scoring Appraisers} = \text{Workflow Appraisers}$ (improper subset / equal set). If it were a strict subset, a 1-person route for $K=1$ could never exist.
* **Case 2 (Two Appraiser Route, $K_{\text{expected}}=2$):**
  * Workflow route: $[ \text{User\_A}, \text{User\_B} ]$
  * Scoring appraisers: $\{ \text{User\_A}, \text{User\_B} \}$
  * Here, $\text{Scoring Appraisers} = \text{Workflow Appraisers}$ (improper subset / equal set).
* **Case 3 (Four Appraiser Route, $K_{\text{expected}}=2$):**
  * Workflow route: $[ \text{User\_A}, \text{User\_B}, \text{User\_C}, \text{User\_D} ]$
  * Scoring appraisers: $\{ \text{User\_A}, \text{User\_B} \}$
  * Here, $\text{Scoring Appraisers} \subset \text{Workflow Appraisers}$ (proper subset).

Therefore, the only mathematically and operationally correct assertion is $\text{SCORING\_APPRAISERS} \subseteq \text{WORKFLOW\_APPRAISERS}$.

---

## 4. Profile / K_expected Source of Truth Matrix

Based on repository authority (`DEC-035`, `DEC-036`, `BUSINESS_RULES.md`, `src/profiles/scoring-config-master.js`, `src/profiles/profile-codes-policy.js`):

| Position Profile Class | Profile Code | Target Ratio (A/B) | Frozen $K_{\text{expected}}$ | Allowed Scorer Count | Repository Source Authority |
|---|---|---|---|---|---|
| **Staff / Chief** | `PROF_STAFF_CHIEF` | 70 / 30 | **2** | Exactly 2 Scorers (50% / 50%) | `scoring-config-master.js:237` |
| **Japanese Staff** | `PROF_JAPANESE_STAFF` | 70 / 30 | **2** | Exactly 2 Scorers (50% / 50%) | `scoring-config-master.js:259` |
| **Assistant Section Manager** | `PROF_ASST_MGR` | 60 / 40 | **2** | Exactly 2 Scorers (50% / 50%) | `scoring-config-master.js:281` |
| **Section Manager** | `PROF_SECTION_MGR` | 50 / 50 | **2** | Exactly 2 Scorers (50% / 50%) | `scoring-config-master.js:303` |
| **Senior Manager** | `PROF_SENIOR_MGR` | 50 / 50 | **2** | Exactly 2 Scorers (50% / 50%) | `scoring-config-master.js:325` |
| **Deputy General Manager** | `PROF_DGM` | 50 / 50 | **2** | Exactly 2 Scorers (50% / 50%) | `D3_WP001_R2:74`, `MBO-P03-WP-002:155` (Historical code in `scoring-config-master.js:347` lists 1; see Section 6) |
| **General Manager** | `PROF_GM` | 50 / 50 | **1** | Exactly 1 Scorer (100%) | `scoring-config-master.js:369` |
| **Vice President** | `PROF_VP` | 50 / 50 | **1** | Exactly 1 Scorer (100%) | `scoring-config-master.js:391` |

---

## 5. Current Route Viability Matrix

Evaluating each profile class against current repository routing source evidence (`src/services/routing-service.js`):

| Profile Code | Position Class | $K_{\text{expected}}$ | Current Known Route Class / Key | Current Workflow Appraiser Count | Potential Self-Elision? | Min Effective Appraisers | Viability Status | Identified Gap / Conflict | Owner Decision Required? |
|---|---|---|---|---|---|---|---|---|---|
| `PROF_STAFF_CHIEF` | Staff / Chief | 2 | Section / Team Route (`Section_Code\|Team`) | 2 to 4 | NO (Staff not in route) | 2 | **VIABLE** | None for pure staff | NO |
| `PROF_JAPANESE_STAFF` | Japanese Staff | 2 | Section / Team Route | 2 to 4 | NO | 2 | **VIABLE** | None | NO |
| `PROF_ASST_MGR` | Asst Section Mgr | 2 | Section / Team Route | 2 to 4 | YES (If Asst Mgr in 1st slot) | 1 to 3 | **CONDITIONAL** | If route has only 2 steps and Asst Mgr is Step 1, post-elision count = 1 < $K=2$ | NO (Handled by R3 fallback/override) |
| `PROF_SECTION_MGR` | Section Manager | 2 | Section Route | 2 to 4 | YES (Sec Mgr is Step 1 in own section) | 1 to 3 | **CONDITIONAL** | If route has 2 steps (M1, G1) and Sec Mgr is M1, post-elision count = 1 < $K=2$ | NO (Handled by R3 fallback/override) |
| `PROF_SENIOR_MGR` | Senior Manager | 2 | Section / Dept Route | 2 to 4 | YES (Snr Mgr in route) | 1 to 3 | **CONDITIONAL** | If route has only 2 steps, post-elision count drops to 1 < $K=2$ | NO (Handled by R3 fallback/override) |
| `PROF_DGM` | Deputy GM | 2 | `POSITION_DGM` (`M1_ONLY`) | **1** (President) | NO (DGM not in route) | **1** | **FAIL / DESIGN CONFLICT** | Workflow count = 1, but $K_{\text{expected}} = 2$. Violates primary invariant. | **YES (`OWNER_DEC_D3_007`)** |
| `PROF_GM` | General Manager | 1 | `POSITION_GM` (`M1_ONLY`) | 1 (President) | NO | 1 | **VIABLE** | $1 \ge 1$, valid single scorer | NO |
| `PROF_VP` | Vice President | 1 | `POSITION_VP` (`M1_ONLY`) | 1 (President) | NO | 1 | **VIABLE** | $1 \ge 1$, valid single scorer | NO |

---

## 6. DGM Material Blocker Analysis

### 6.1 The Fundamental Conflict
Repository truth currently establishes two contradictory facts regarding Deputy General Manager:
1. **Evaluation Profile Truth:** `PROF_DGM` requires **$K_{\text{expected}} = 2$** (50% / 50% scoring by 2 appraisers).
2. **Routing Service Truth:** In `src/services/routing-service.js` (lines 43–94), DGM resolves through executive direct routing:
   * Query: `Routing_Key = "POSITION_DGM"`
   * Resulting Topology: **`M1_ONLY`** (Workflow Appraiser Count = **1**, namely President).

### 6.2 Formal Viability Failure Statement

$$\text{EFFECTIVE\_WORKFLOW\_APPRAISER\_COUNT (1)} < K_{\text{expected}} (2)$$

$$\text{DGM\_CURRENT\_ROUTE\_SCORING\_VIABILITY} = \mathbf{FAIL\ /\ DESIGN\ CONFLICT}$$

### 6.3 Invariant Prohibitions
Under locked governance:
* **DO NOT** hide this conflict through code shims or silent fallbacks.
* **DO NOT** auto-lower DGM $K_{\text{expected}}$ from 2 to 1 without Owner authorization.
* **DO NOT** select a scorer outside the workflow route.
* **DO NOT** silently retain `M1_ONLY` while pretending $K=2$ scoring can occur.

---

## 7. DGM Corrective Options & Decision Request

To resolve the DGM blocker, three bounded options are evaluated:

| Option | Description | Pros | Cons | Repository Impact |
|---|---|---|---|---|
| **OPTION A: Expand DGM Route to 2 Steps (e.g. `M1_G1`)** | Update DGM routing configuration in App 795 to define a 2-appraiser sequential workflow (e.g. GM $\to$ President, or VP $\to$ President). | Preserves $K_{\text{expected}} = 2$; satisfies $\text{Workflow Count} \ge 2$; clean alignment with profile. | Exact business appraiser identities/hierarchy for DGM are NOT currently established in repository. | Requires Owner/HR to supply exact DGM evaluation hierarchy. |
| **OPTION B: DGM Route Pattern with $\ge 2$ Appraisers** | Assign DGM to a specialized 2-step route pattern (e.g. `EXEC_2STEP`) within the ordinal routing framework. | Standardized under D3 ordinal topology; fully configurable by HR. | Requires App 795 route pattern setup and hierarchy definition. | Zero code change; purely App 795 configuration. |
| **OPTION C: Realign DGM Profile $K_{\text{expected}}$ to 1** | Owner formally decides that DGM is an Executive position evaluated solely by 1 person (President), aligning with historical `scoring-config-master.js:347` (`Expected_Appraiser_Count: 1`). | Resolves conflict immediately with existing `M1_ONLY` topology; matches GM/VP structure. | Changes evaluation weighting from 50/50 to 100%; requires Owner policy decision. | Would update profile baseline via formal decision. |

### 7.1 Recommendation & Pending Owner Decision
Antigravity does NOT guess whether DGM should be evaluated by GM+President, VP+President, or President alone. This is an authoritative business governance decision.

We formally record:

```text
OWNER_DEC_D3_007 = DGM_K2_VIABLE_WORKFLOW_ROUTE
STATUS = OWNER_DECISION_REQUIRED
AFFECTED_POSITION = Deputy General Manager (PROF_DGM)
DECISION_CHOICES:
  1. EXPAND_DGM_ROUTE_TO_2_APPRAISERS (Provide exact 2-step hierarchy, e.g. GM -> President)
  2. REALIGN_DGM_PROFILE_TO_K1 (Realign DGM to Executive Direct single evaluator 100%)
```

---

## 8. Primary R3 Viability Invariant

For every target employee $E$:

```text
1. Resolve Frozen Evaluation Profile for E.
2. Read K_expected (assert K_expected in {1, 2}).
3. Resolve Effective Route Version for E at evaluation timestamp T.
4. Build Canonical Ordered Business Workflow Route: [Appraiser_1, ..., Appraiser_N].
5. Apply Own-MBO Self-Elision: Filter out any Appraiser == E.
6. Produce Effective Workflow Route: [Eff_Appraiser_1, ..., Eff_Appraiser_M].
7. Resolve HR-Authorized Scorer Selection Plan.
8. Resolve Active Scorers from Effective Workflow Route.
9. Validate Scorer Viability Invariants.
10. If PASS: Permit route execution and MBO progression.
    If FAIL: Fail closed with specific error code. Block submission/progression.
```

### 8.1 Required Mathematical Invariants:
1. $\text{EFFECTIVE\_WORKFLOW\_APPRAISER\_COUNT} \ge K_{\text{expected}}$
2. $\text{ACTIVE\_SCORER\_COUNT} == K_{\text{expected}}$
3. $\text{ACTIVE\_SCORERS} \subseteq \text{EFFECTIVE\_WORKFLOW\_APPRAISERS}$
4. $E \notin \text{EFFECTIVE\_WORKFLOW\_APPRAISERS}$ (Self-elided)
5. $E \notin \text{ACTIVE\_SCORERS}$ (Self cannot score own MBO)
6. $\text{Distinct}(\text{ACTIVE\_SCORERS})$ (Scorer 1 identity $\ne$ Scorer 2 identity)

### 8.2 Strict Fail-Closed Directives:
* **NO** auto-lowering of $K_{\text{expected}}$.
* **NO** automatic weight redistribution.
* **NO** random or arbitrary substitution of scorers.
* **NO** non-workflow evaluators scoring the record.

---

## 9. Self-Elision Route Viability Rules

Self-elision occurs when an employee's MBO is evaluated, and that employee is configured as an appraiser in their own section/team workflow route (`DECISION-D3-002`).

### 9.1 The Order of Operations Invariant

$$\mathbf{Original\ Route} \longrightarrow \mathbf{Self\text{-}Elision} \longrightarrow \mathbf{Effective\ Route} \longrightarrow \mathbf{Scorer\ Plan\ Resolution} \longrightarrow \mathbf{Viability\ Assertion}$$

**Simulate exact self-elision FIRST.** Pre-elision workflow count is completely irrelevant to runtime validity.

### 9.2 Viability Failure Cases from Self-Elision:
* **Failure Case 1: Count Deficit:**
  * Route: Manager A (Step 1) $\to$ GM B (Step 2) ($N=2$).
  * Target Employee: Manager A.
  * Self-elision: $[ \text{GM B} ]$ ($M=1$).
  * If Manager A profile has $K_{\text{expected}} = 2$, then $M=1 < K=2$.
  * **Result:** `INSUFFICIENT_EFFECTIVE_APPRAISERS` $\implies$ **FAIL CLOSED**.
* **Failure Case 2: Scorer Exhaustion:**
  * Route: Manager A (Step 1) $\to$ GM B (Step 2) $\to$ VP C (Step 3) ($N=3$).
  * HR Scorer Plan: Primary = Step 1 (Manager A), Secondary = Step 2 (GM B).
  * Target Employee: Manager A.
  * Self-elision removes Manager A. Effective route: $[ \text{GM B}, \text{VP C} ]$ ($M=2 \ge K=2$).
  * However, Primary Scorer was Manager A (elided).
  * If no fallback scorer is authorized, surviving scorers = $\{ \text{GM B} \}$ ($1 < K=2$).
  * **Result:** `SCORING_ROUTE_INCOMPLETE_AFTER_SELF_ELISION` $\implies$ **FAIL CLOSED**.

---

## 10. HR Pre-Activation Employee Viability Check

To guarantee that HR never activates or effective-dates a route version that will deterministically crash at runtime, the HR Dashboard must execute an **Employee Viability Preflight Check** before committing any route activation:

```
[HR Dashboard: Route Version Activation Request]
                       |
                       v
         [Load Route Version Definition]
                       |
                       v
     [Identify ALL Target Employees in Scope]
     (All active employees in Section / Team / Target Positions)
                       |
                       v
    FOR EACH Target Employee E in Scope:
      1. Resolve Profile & K_expected
      2. Simulate Self-Elision for E
      3. Evaluate Post-Elision Scorer Viability
      4. Record Status: VIABLE / BLOCKED / WARNING
                       |
                       v
     [Aggregate Preflight Results]
     - TOTAL_EMPLOYEES_CHECKED
     - VIABLE_COUNT
     - BLOCKED_COUNT
     - WARNING_COUNT
     - Error Log per Blocked Employee
                       |
        +--------------+--------------+
        |                             |
 BLOCKED_COUNT > 0             BLOCKED_COUNT == 0
        |                             |
        v                             v
[BLOCK ACTIVATION]             [PERMIT ACTIVATION]
(Strict Error Modal;           (Route version set to ACTIVE;
 Zero Bypass Permitted)         Clean audit log created)
```

### 10.1 Invariant:
**If even ONE employee in route scope will deterministically fail at runtime, route activation is BLOCKED.** There is no "activate anyway" toggle. HR must resolve the blockage via an authorized route override or scorer fallback plan.

---

## 11. Route-Scope vs Employee-Specific Exceptions

A shared section route (e.g. `ENG_DEV` with steps Asst Mgr $\to$ Section Mgr $\to$ GM) works perfectly for Staff ($K=2$, 3 surviving appraisers), but fails for the Section Manager because self-elision removes them from the route.

We evaluate three architectural patterns to handle this:

| Criterion | Model A: Base Route + Explicit Override | Model B: Base Route + Scorer Fallback Priority | Model C: Hybrid Model (Recommended) |
|---|---|---|---|
| **Mechanism** | HR creates a separate specific route key for the manager (e.g. `ENG_DEV#MGR`). | Shared route includes extra workflow steps; HR configures priority list of scorers. | **Model B for standard routes where workflow $\ge 3$**;<br>**Model A when workflow count $< 2$ after elision**. |
| **Determinism** | 100% deterministic. | 100% deterministic (uses ordered candidate priority). | 100% deterministic. |
| **HR Usability** | High maintenance if many managers need individual overrides. | Low maintenance; 1 route serves staff and supervisors. | Optimal: minimal overrides, maximum coverage. |
| **Schema Impact** | Zero App 794 schema impact (uses standard App 795 routing keys). | Minimal (requires Scorer Candidate Priority in App 795). | Clean, bounded App 795 configuration. |
| **Auditability** | Explicit route per employee class. | Clear rule-based priority execution. | Complete audit trail. |
| **Hard Boundary** | Cannot solve shortage if override route also lacks appraisers. | **Cannot create scorers outside workflow.** If surviving workflow $< K$, Model B fails closed. | Transparent fail-closed boundary. |

---

## 12. Scorer Priority & Fallback Options

When an authorized scorer is elided due to own-MBO rules, how does the system choose the surviving scorer?

### 12.1 Evaluation of Models:
* **Model 1: Fixed Primary + Secondary Only (Strict Fail-Closed):**
  * If either Primary or Secondary scorer is self-elided $\implies$ FAIL CLOSED immediately.
  * *Verdict:* Too rigid. Breaks shared section routes for managers even when 2 other valid appraisers exist in the workflow.
* **Model 2: HR-Configured Scorer Candidate Priority (Recommended D3 V1 Model):**
  * HR configures ordered list of authorized scorer candidates from workflow slots:
    $$\text{Scorer Candidate Priority} = [ \text{Slot\_1}, \text{Slot\_2}, \text{Slot\_3}, \text{Slot\_4} ]$$
  * System selects the first $K_{\text{expected}}$ surviving non-self candidates from this list.
  * *Requirements:*
    1. Fallback candidates MUST be authorized workflow appraisers.
    2. Candidate priority is explicitly configured by HR in App 795.
    3. System executes purely deterministic selection (zero guessing, zero random selection).
* **Model 3: Dynamic Runtime Delegation / Auto-Escalation:**
  * System automatically picks next highest manager or sends to HR.
  * *Verdict:* **REJECTED.** Violates deterministic governance and Owner authority.

---

## 13. Recommended D3 V1 Scorer Selection Plan

We distinguish between two distinct concepts:
1. **`AUTHORIZED_SCORER_CANDIDATE`**: A workflow slot designated by HR as qualified and permitted to evaluate score matrices.
2. **`ACTIVE_SCORER`**: The specific resolved appraiser identity assigned to Scorer 1 or Scorer 2 for a specific employee's MBO record after self-elision.

### 13.1 Representation in App 795 Route Master:
App 795 route version record defines:
* `Workflow_Slots`: Ordinal Appraisers 1 to 4 (`User_Select` per slot).
* `Scorer_Selection_Mode`: `ORDINAL_PRIORITY`.
* `Scorer_Priority_Slots`: Ordered list of slot indices, e.g. `[1, 2, 3]`.

### 13.2 Resolution Logic:
1. Filter `Scorer_Priority_Slots` to keep only slots whose assigned appraiser is present in `EFFECTIVE_WORKFLOW_APPRAISERS` (non-self, active).
2. If remaining candidates $< K_{\text{expected}} \implies$ **FAIL CLOSED** (`SCORING_ROUTE_INCOMPLETE_AFTER_SELF_ELISION`).
3. Set `Active_Scorer_1` = Candidate[0].
4. If $K_{\text{expected}} == 2$, set `Active_Scorer_2` = Candidate[1].
5. Assert `Active_Scorer_1` $\ne$ `Active_Scorer_2`.

---

## 14. Route + Profile Interaction

A single shared route version in App 795 can seamlessly serve employees with different $K_{\text{expected}}$ values:

### Concrete Scenario:
* Route: Step 1 (Section Mgr), Step 2 (Senior Mgr), Step 3 (GM).
* HR Scorer Priority: `[Step 1, Step 2, Step 3]`.

* **Employee A (Operational Staff, $K_{\text{expected}} = 2$):**
  * Self-elision: None.
  * Surviving workflow: `[Step 1, Step 2, Step 3]`.
  * Candidate evaluation: Step 1 (Sec Mgr) $\to$ Active Scorer 1 (50%); Step 2 (Snr Mgr) $\to$ Active Scorer 2 (50%).
  * Result: **PASS** (2 scorers, 50%/50%). Step 3 acts as workflow final approver/reviewer.

* **Employee B (Senior Executive / GM, $K_{\text{expected}} = 1$):**
  * (If routed through same hierarchy for special project):
  * Candidate evaluation: Step 1 $\to$ Active Scorer 1 (100%).
  * Result: **PASS** (1 scorer, 100%).

The priority list deterministically yields the exact $K_{\text{expected}}$ count mandated by the employee's profile without requiring separate route versions merely for $K=1$ vs $K=2$.

---

## 15. Canonical Business Order + Scoring Resolution

Workflow steps must execute in **canonical business execution sequence**, not raw physical schema order:

```
[Target Employee MBO Record Generated]
                  |
                  v
[1. Resolve Frozen Profile & K_expected]
                  |
                  v
[2. Resolve App 795 Effective Route Version (Model A)]
                  |
                  v
[3. Build Canonical Ordered Business Route]
    Step 1 -> Step 2 -> Step 3 -> Step 4
                  |
                  v
[4. Apply Own-MBO Self-Elision (Target Employee E)]
    Filter out any step where Appraiser == E
                  |
                  v
[5. Produce Effective Business Route]
    [Eff_Step_1, Eff_Step_2, ...] (Length = M)
                  |
                  +---> IF M < K_expected: FAIL CLOSED (INSUFFICIENT_EFFECTIVE_APPRAISERS)
                  |
                  v
[6. Resolve HR Scorer Candidate Priority]
    Iterate configured priority slots -> match against Eff_Steps
                  |
                  +---> IF Matched Candidates < K_expected: FAIL CLOSED (SCORING_ROUTE_INCOMPLETE_AFTER_SELF_ELISION)
                  |
                  v
[7. Assign Active Scorer 1 (and Scorer 2 if K=2)]
                  |
                  v
[8. Map to Effective Technical Topology (M1, M1_G1, M1_M2_G1, etc.)]
                  |
                  v
[9. Snapshot Metadata & Lock Completed Stage]
```

---

## 16. Generic Scorer Snapshot Metadata & Schema Gap Analysis

### 16.1 Physical Score Matrix vs Snapshot Metadata Distinction
* **Physical Score Matrix:** The 10 numerical objective ratings and comments (`Manager_Achievement_1..10`, `GM_Achievement_1..10`). As established in R2, this uses **Alternative A (Physical Compatibility Adapter)**, resulting in **ZERO schema changes to the scoring matrix**.
* **Scorer Snapshot Metadata:** Auditability and runtime enforcement require recording *who* evaluated the record, *what* profile was frozen, and *which* route version was effective.

### 16.2 Repository Schema Gap Audit (App 794 Live vs Required Metadata):
Comparing App 794 Live schema (`scratch/app794_pre_schema_live_fields.json` / `config/schema-spec.js`) against required metadata:

| Logical Metadata Item | Purpose | Currently in App 794? | Recommended Implementation Strategy |
|---|---|---|---|
| `Frozen_Profile_Code` | Records frozen evaluation profile (e.g. `PROF_STAFF_CHIEF`) | **NO** | Add SINGLE_LINE_TEXT field, OR store in JSON audit snapshot (`App 800`). |
| `K_expected_Snapshot` | Records required scorer count (1 or 2) | **NO** | Add NUMBER field, OR store in JSON audit snapshot. |
| `Effective_Route_Version_Key` | Records exact App 795 version (`{Key}#v{N}`) | **NO** | Add SINGLE_LINE_TEXT field, OR store in JSON audit snapshot. |
| `Effective_Route_Pattern` | Records route pattern code (e.g. `M1_M2_G1`) | **NO** | Add SINGLE_LINE_TEXT field, OR store in JSON audit snapshot. |
| `Effective_Topology` | Records technical workflow topology | YES (`Routing_Topology`) | Reuse existing `Routing_Topology` field. |
| `Active_Scorer_1_User` | User bound to Scorer 1 (Physical `Manager_*`) | PARTIAL (`Manager_User`) | Reuse `Manager_User` as Scorer 1 binding. |
| `Active_Scorer_2_User` | User bound to Scorer 2 (Physical `GM_*`) | PARTIAL (`GM_User`) | Reuse `GM_User` as Scorer 2 binding. |
| `Effective_Workflow_Appraisers` | Snapshot of 1–4 surviving approvers | YES | Reuse `Manager_Level1_Approvers`, `Manager_Level2_Approvers`, `GM_Level1_Approvers`, `GM_Level2_Approvers`. |

### 16.3 Formal Classification:

```text
APP794_PHYSICAL_SCORE_MATRIX_CHANGE = NO (ZERO CHANGES)
APP794_AUDIT_METADATA_SCHEMA_CHANGE = MINIMAL_GAP (3-4 optional audit fields)
CANONICAL_MINIMAL_AUDIT_GAP:
  1. Frozen_Profile_Code (SINGLE_LINE_TEXT)
  2. K_expected_Snapshot (NUMBER)
  3. Effective_Route_Version_Key (SINGLE_LINE_TEXT)
```

If Owner requires strict zero-schema-change across ALL of App 794, these 3 fields can be stored inside `Snapshot_JSON` in App 800 (Revision Archive). If native App 794 filtering/reporting is required by HR, these 3 fields represent the exact minimal schema change.

---

## 17. Physical Score Storage Compatibility

Preserving Alternative A from R2:

```text
Physical Field in App 794       Logical Generic Binding       UI Display Label
Manager_Achievement_1..10  -->  Active Scorer 1 Ratings  -->  "1st Evaluator (Scorer 1)"
Manager_Comment_1..10      -->  Active Scorer 1 Comments -->  "1st Evaluator Comment"
GM_Achievement_1..10       -->  Active Scorer 2 Ratings  -->  "2nd Evaluator (Scorer 2)"
GM_Comment_1..10           -->  Active Scorer 2 Comments -->  "2nd Evaluator Comment"
```

### 17.1 Independence from Organizational Rank:
* **Example A (Standard):** Scorer 1 = Section Manager (M1), Scorer 2 = GM (G1).
  * M1 scores stored in `Manager_*`. G1 scores stored in `GM_*`.
* **Example B (Extended Topology):** Scorer 1 = Asst Mgr (M1), Scorer 2 = Section Mgr (M2).
  * M1 scores stored in `Manager_*`. M2 scores stored in `GM_*`.
* **Example C (Executive Bridge):** Scorer 1 = Senior Mgr (M2), Scorer 2 = GM (G2).
  * M2 scores stored in `Manager_*`. G2 scores stored in `GM_*`.

In all cases, the UI displays the actual user name and generic ordinal role ("Scorer 1", "Scorer 2"). The physical field name is purely an internal database storage container.

---

## 18. Completed Stage Immutability

1. **Annual Freeze:** Evaluation Profile and $K_{\text{expected}}$ are frozen at record initialization.
2. **Stage Snapshot:** When an MBO stage advances (e.g. Objectives Approved $\to$ Mid-Year), the effective route version, effective workflow approvers, and active scorer identities are snapshotted and permanently locked for that stage.
3. **Immutability Invariant:** Future changes to App 795 routing rules or organization structure **MUST NOT** retroactively alter completed ratings, completed scores, historical weight calculations, or historical approval records.
4. **In-Flight Exception Handling:** If an active appraiser leaves the company mid-cycle, HR executes a formal `IN_FLIGHT_ROUTE_REASSIGNMENT` action in App 794 with a mandatory business reason, triggering a full audit record in App 800.

---

## 19. Effective-Dated Routing Status

Model A (Versioned Rows in App 795) remains the recommended persistence architecture:
* `Routing_Key`: Non-unique business key in App 795.
* `Version_Key`: Unique primary key (`{Routing_Key}#v{N}`).
* Resolver: Pure read-only date interval GET query (`Effective_From <= T <= Effective_To`).
* Status: **`OWNER_DEC_D3_006 = PENDING / OWNER_DECISION_REQUIRED`**. (Not marked approved).

---

## 20. Process Management ALL/ANY Dependency

Status under `OWNER_DEC_D3_005`:
* Status: **`OWNER_DEC_D3_005 = PENDING / OWNER_DECISION_REQUIRED`**.
* **Scoring Viability Dependency:**
  * If a workflow step has multiple assigned users (e.g. `Approver_Rule = ANY` with 3 group members), **scoring roles must bind to exactly ONE distinct individual user**, not an ambiguous group.
  * In D3 V1, Scorer slots in App 795 must specify a single designated user or require that the first user who executes the workflow step becomes the bound Scorer for that slot.

---

## 21. Route Viability Algorithm (Design Pseudocode)

```javascript
/**
 * Deterministic Route Viability & Scorer Resolution Algorithm
 * Pure Read-Only Evaluation (Zero Mutations, Zero Auto-Approval)
 */
function evaluateRouteViability(employee, profile, routeVersion, timestamp) {
  // 1. Validate Profile Authority
  if (!profile || !profile.Profile_Code) {
    return { status: 'FAIL', code: 'PROFILE_NOT_FOUND', message: 'Evaluation Profile is missing.' };
  }
  const kExpected = profile.Expected_Appraiser_Count;
  if (kExpected !== 1 && kExpected !== 2) {
    return { status: 'FAIL', code: 'INVALID_K_EXPECTED', message: `Unsupported K_expected: ${kExpected}. Must be 1 or 2.` };
  }

  // 2. Validate Route Version
  if (!routeVersion || routeVersion.Active !== 'Active') {
    return { status: 'FAIL', code: 'ROUTE_NOT_ACTIVE', message: 'Route version is not active.' };
  }

  // 3. Build Canonical Ordered Business Route
  const canonicalRoute = buildCanonicalBusinessRoute(routeVersion);
  if (!canonicalRoute || canonicalRoute.length === 0) {
    return { status: 'FAIL', code: 'EMPTY_WORKFLOW_ROUTE', message: 'No workflow approvers defined in route.' };
  }

  // 4. Simulate Own-MBO Self-Elision
  const effectiveRoute = canonicalRoute.filter(appraiser => appraiser.code !== employee.code);

  // 5. Invariant 1: Effective Appraiser Count >= K_expected
  if (effectiveRoute.length < kExpected) {
    return {
      status: 'FAIL',
      code: 'INSUFFICIENT_EFFECTIVE_APPRAISERS',
      message: `Surviving workflow appraisers (${effectiveRoute.length}) < required scorers (${kExpected}).`
    };
  }

  // 6. Resolve HR Scorer Selection Plan
  const prioritySlots = routeVersion.Scorer_Priority_Slots || [1, 2];
  const candidateScorers = [];

  for (const slotIndex of prioritySlots) {
    const slotAppraiser = canonicalRoute[slotIndex - 1];
    // Candidate must be non-null, non-self, and present in effectiveRoute
    if (slotAppraiser && slotAppraiser.code !== employee.code && effectiveRoute.some(a => a.code === slotAppraiser.code)) {
      if (!candidateScorers.some(c => c.code === slotAppraiser.code)) {
        candidateScorers.push(slotAppraiser);
      }
    }
  }

  // 7. Invariant 2: Active Scorer Count == K_expected
  if (candidateScorers.length < kExpected) {
    return {
      status: 'FAIL',
      code: 'SCORING_ROUTE_INCOMPLETE_AFTER_SELF_ELISION',
      message: `Surviving HR-authorized scorers (${candidateScorers.length}) < required scorers (${kExpected}).`
    };
  }

  // 8. Assign Active Scorers
  const activeScorer1 = candidateScorers[0];
  const activeScorer2 = kExpected === 2 ? candidateScorers[1] : null;

  // 9. Invariant 3 & 4: Self Excluded & Distinct Scorers
  if (activeScorer1.code === employee.code || (activeScorer2 && activeScorer2.code === employee.code)) {
    return { status: 'FAIL', code: 'SELF_SCORING_CONFLICT', message: 'Target employee cannot score own MBO.' };
  }
  if (kExpected === 2 && activeScorer1.code === activeScorer2.code) {
    return { status: 'FAIL', code: 'DUPLICATE_SCORER_IDENTITY', message: 'Scorer 1 and Scorer 2 must be distinct individuals.' };
  }

  // 10. Pass: Route & Scorer Plan is Fully Viable
  return {
    status: 'PASS',
    code: 'VIABLE',
    effectiveWorkflowAppraisers: effectiveRoute,
    activeScorer1,
    activeScorer2,
    kExpected,
    routeVersionKey: routeVersion.Version_Key
  };
}
```

---

## 22. Required Concrete Examples

### Case A: Staff ($K=2$), 4-Step Route, No Self Conflict
* **Target Employee:** Staff member `E_001` (Profile: `PROF_STAFF_CHIEF`, $K=2$).
* **Route:** Asst Mgr (`M_01`) $\to$ Sec Mgr (`M_02`) $\to$ Snr Mgr (`M_03`) $\to$ GM (`G_01`).
* **Self-Elision:** `E_001` is not in route. Effective route = `[M_01, M_02, M_03, G_01]` ($M=4$).
* **Scorer Plan:** Priority `[1, 2]`. Scorer 1 = `M_01`, Scorer 2 = `M_02`.
* **Evaluation:** $M=4 \ge 2$; Active Scorers = 2; Self excluded; Distinct.
* **Verdict:** **PASS**.

### Case B: Staff ($K=2$), 2-Step Route, Self in Route (Count Deficit)
* **Target Employee:** Supervisor `E_002` evaluated under Staff Profile ($K=2$).
* **Route:** `E_002` (Step 1) $\to$ GM (`G_01`) (Step 2).
* **Self-Elision:** `E_002` removed. Effective route = `[G_01]` ($M=1$).
* **Evaluation:** $M=1 < K=2$.
* **Verdict:** **BLOCK (`INSUFFICIENT_EFFECTIVE_APPRAISERS`)**.

### Case C: Staff ($K=2$), 3-Step Route, Self in Route (Viable via Fallback)
* **Target Employee:** Asst Mgr `E_003` ($K=2$).
* **Route:** `E_003` (Step 1) $\to$ Sec Mgr (`M_02`) (Step 2) $\to$ GM (`G_01`) (Step 3).
* **Self-Elision:** `E_003` removed. Effective route = `[M_02, G_01]` ($M=2$).
* **Scorer Plan:** Priority `[1, 2, 3]`. Slot 1 elided $\implies$ candidates = `[M_02, G_01]`.
* **Evaluation:** $M=2 \ge 2$; Active Scorers = 2 (`M_02`, `G_01`); Distinct.
* **Verdict:** **PASS**.

### Case D: GM ($K=1$), `M1_ONLY`, Non-Self
* **Target Employee:** GM `E_004` (Profile: `PROF_GM`, $K=1$).
* **Route:** President (`P_01`) (Step 1).
* **Self-Elision:** `E_004` is not President. Effective route = `[P_01]` ($M=1$).
* **Scorer Plan:** Scorer 1 = `P_01` (100%).
* **Evaluation:** $M=1 \ge 1$; Active Scorer = 1; Non-self.
* **Verdict:** **PASS**.

### Case E: DGM ($K=2$), Current `M1_ONLY` Route
* **Target Employee:** DGM `E_005` (Profile: `PROF_DGM`, $K=2$).
* **Route:** `POSITION_DGM` $\to$ President (`P_01`) (Step 1).
* **Self-Elision:** None. Effective route = `[P_01]` ($M=1$).
* **Evaluation:** $M=1 < K=2$.
* **Verdict:** **BLOCK (`INSUFFICIENT_EFFECTIVE_APPRAISERS` / `DGM_CURRENT_ROUTE_SCORING_VIABILITY = FAIL`)**.

### Case F: $K=2$, One Scorer Elided, Third Workflow Scorer Survives
* **Target Employee:** Manager `E_006` ($K=2$).
* **Route:** `E_006` (Step 1) $\to$ GM `G_01` (Step 2) $\to$ VP `V_01` (Step 3).
* **Self-Elision:** `E_006` removed. Effective route = `[G_01, V_01]` ($M=2$).
* **Scorer Plan:** Priority `[1, 2, 3]`. Candidate 1 elided. Next two candidates = `[G_01, V_01]`.
* **Verdict:** **PASS**.

### Case G: $K=2$, Fallback Scorer Defined but NOT in Workflow
* **Target Employee:** Manager `E_007` ($K=2$).
* **Route:** `E_007` (Step 1) $\to$ GM `G_01` (Step 2). (Workflow ends).
* **Config:** HR manually entered external user `X_99` as fallback scorer.
* **Self-Elision:** Effective route = `[G_01]` ($M=1$).
* **Validation:** `X_99` $\notin \text{EFFECTIVE\_WORKFLOW\_APPRAISERS}$.
* **Verdict:** **BLOCK (`SCORER_NOT_IN_EFFECTIVE_ROUTE`)**. Scorers outside workflow are strictly illegal.

---

## 23. Bounded Error Taxonomy

All viability checks fail closed using exact, standardized error codes:

| Error Code | Trigger Condition | Operational Guidance |
|---|---|---|
| `PROFILE_NOT_FOUND` | Employee has no valid frozen Evaluation Profile. | Contact HR to initialize and publish Evaluation Profile. |
| `INVALID_K_EXPECTED` | Profile $K_{\text{expected}} \notin \{1, 2\}$. | Review Profile Master configuration. |
| `ROUTE_NOT_ACTIVE` | Resolved App 795 route version is not active. | Activate route version in HR Routing Dashboard. |
| `ROUTE_NOT_VIABLE_FOR_PROFILE` | Route structure is fundamentally incompatible with profile. | Reconfigure App 795 route pattern. |
| `INSUFFICIENT_EFFECTIVE_APPRAISERS` | Effective workflow count $< K_{\text{expected}}$ after self-elision. | Expand workflow route steps or provide authorized route override. |
| `SCORING_ROUTE_INCOMPLETE_AFTER_SELF_ELISION` | Surviving workflow count $\ge K$, but surviving authorized scorers $< K$. | Add authorized fallback scorer slots in App 795 route plan. |
| `SCORER_NOT_IN_EFFECTIVE_ROUTE` | Designated scorer is not present in surviving workflow route. | Select scorers strictly from workflow approver list. |
| `SELF_SCORING_CONFLICT` | Target employee identity matches designated scorer. | Reconfigure scorer priority to elide self. |
| `DUPLICATE_SCORER_IDENTITY` | Scorer 1 and Scorer 2 resolve to the exact same user. | Assign distinct evaluators for Scorer 1 and Scorer 2. |
| `AMBIGUOUS_GROUP_SCORER` | Workflow step uses `ANY` rule with $>1$ users and no designated primary scorer. | Designate specific individual scorer in App 795 slot. |

---

## 24. Test Suite Design

The following automated and simulated test cases must be included in future test implementations:

```
SUITE: D3_R3_Route_Viability_And_Scoring_Compatibility

TEST-R3-001: Staff K=2 with 4-appraiser route returns VIABLE (Pass)
TEST-R3-002: Staff K=2 with 2-appraiser route where self is Step 1 returns INSUFFICIENT_EFFECTIVE_APPRAISERS (Fail Closed)
TEST-R3-003: Staff K=2 with 3-appraiser route where self is Step 1 and Slot 2+3 configured returns VIABLE (Pass)
TEST-R3-004: GM K=1 with M1_ONLY non-self returns VIABLE (Pass)
TEST-R3-005: DGM K=2 with current M1_ONLY route returns INSUFFICIENT_EFFECTIVE_APPRAISERS (Fail Closed)
TEST-R3-006: Self-elision executed before scorer resolution invariant test (Pass)
TEST-R3-007: Scorer candidate not in workflow route returns SCORER_NOT_IN_EFFECTIVE_ROUTE (Fail Closed)
TEST-R3-008: Duplicate scorer identity for K=2 returns DUPLICATE_SCORER_IDENTITY (Fail Closed)
TEST-R3-009: Pre-activation employee check blocks route activation if 1 employee fails (Pass)
TEST-R3-010: Read-only resolver purity: zero record mutations during viability check (Pass)
```

---

## 25. Gap Register & Owner Decisions Remaining

### 25.1 Gap Register:
1. **`GAP-D3-007` (DGM Viability Defect):** `PROF_DGM` ($K=2$) cannot execute under current `POSITION_DGM` (`M1_ONLY`). Blocked pending `OWNER_DEC_D3_007`.
2. **`GAP-D3-008` (App 794 Minimal Audit Metadata):** Minimal schema fields (`Frozen_Profile_Code`, `K_expected_Snapshot`, `Effective_Route_Version_Key`) must either be added to App 794 or formally directed to App 800 JSON audit store.

### 25.2 Owner Decisions Status:
* **`OWNER_DEC_D3_003`:** **LOCKED / OWNER APPROVED** (`HR_CONFIGURABLE_SCORING_APPRAISERS_WITHIN_WORKFLOW_ROUTE_USING_FROZEN_PROFILE_K_EXPECTED`).
* **`OWNER_DEC_D3_005`:** **PENDING** (Native Process Management ALL/ANY operational semantics).
* **`OWNER_DEC_D3_006`:** **PENDING** (Effective-Dated Routing Persistence Model A formal adoption).
* **`OWNER_DEC_D3_007`:** **OWNER_DECISION_REQUIRED** (DGM $K=2$ viable workflow route hierarchy or profile realignment).

---

## 26. Recommended Implementation Contract & Next Gate

### 26.1 Implementation Readiness:

```text
READY_FOR_BOUNDED_IMPLEMENTATION = NO
REASON = Material blockers pending Owner decision:
         1. OWNER_DEC_D3_007 (DGM route/profile conflict) must be resolved.
         2. OWNER_DEC_D3_006 (Model A persistence) must be locked.
         3. OWNER_DEC_D3_005 (ALL/ANY semantics) must be locked.
D3_IMPLEMENTATION_AUTHORIZED = NO
DEPLOYMENT_AUTHORIZED = NO
KINTONE_WRITES_AUTHORIZED = NONE
```

### 26.2 Next Permitted Action:

```text
NEXT_PERMITTED_ACTION = CONTROL_PLANE_REVIEW_OF_D3_WP001_R3
```

Antigravity Execution Plane has completed `D3-WP001-R3` strictly within documentation and evidence boundaries, without modifying production source code, executing tests, or mutating Kintone environments.
