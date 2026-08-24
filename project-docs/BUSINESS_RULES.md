# TTMET MBO & Performance Management Business Rules (MBO V2)

> **Document Status:** Active (Authoritative Standards Baseline)  
> **Last Updated:** 2026-08-24  
> **Governance Decisions:** `DEC-035 (SCORING_SOURCE_OF_TRUTH = LIVE_KINTONE_FIRST)`, `DEC-036 (APPRAISER_WEIGHT_AND_COMPLETENESS_GOVERNANCE)`  

---

## 1. Evaluation Groups & Weight Splits (DEC-035, DEC-036)

| Evaluation Group / Profile | Target Positions | Part A Weight | Part B Weight | Deployed Appraisers ($K_{\text{expected}}$) | Layer 1 Appraiser Weights | Part A Scoring Mode | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Staff & Chief** | Staff, Chief, Senior Staff | **70%** | **30%** | 2 | **50% / 50%** | `DIFFICULTY_ACHIEVEMENT_MATRIX` | **CONFIRMED (DEC-035)** |
| **Japanese Staff** | Expatriate / Japanese Staff | **70%** | **30%** | 2 | **50% / 50%** | `DIFFICULTY_ACHIEVEMENT_MATRIX` | **CONFIRMED (DEC-035)** |
| **Assistant Manager** | Assistant Manager, Asst. Manager | **60%** | **40%** | 2 | **50% / 50%** | `DIFFICULTY_ACHIEVEMENT_MATRIX` | **CONFIRMED (DEC-035)** |
| **Section Manager** | Section Manager | **50%** | **50%** | 2 | **50% / 50%** | `DIFFICULTY_ACHIEVEMENT_MATRIX` | **CONFIRMED (DEC-035)** |
| **Senior Manager** | Senior Manager | **50%** | **50%** | 2 | **50% / 50%** | `DIFFICULTY_ACHIEVEMENT_MATRIX` | **CONFIRMED (DEC-035)** |
| **Deputy General Manager** | Deputy General Manager (DGM) | **50%** | **50%** | 2 | **50% / 50%** | `DIFFICULTY_ACHIEVEMENT_MATRIX` | **CONFIRMED (DEC-035)** |
| **General Manager** | General Manager (GM) | **50%** | **50%** | **1** | **100%** | `ACHIEVEMENT_DIRECT` | **CONFIRMED (DEC-035)** |
| **Vice President** | Vice President (VP) | **50%** | **50%** | **1** | **100%** | `ACHIEVEMENT_DIRECT` | **CONFIRMED (DEC-035)** |

---

## 2. Appraiser Weight & Scoring Completeness Governance (DEC-036)
1. **Universal Part A & Part B Application:** Appraiser Weight Governance ($1/K_{\text{expected}}$) applies to all scoring values combining multiple appraisers.
2. **Appraiser Weight Layer (Layer 1):**
   - $K_{\text{expected}} = 1 \implies \text{Appraiser 1} = 100\%$ (GM / VP current deployed baseline).
   - $K_{\text{expected}} = 2 \implies \text{Appraiser 1} = 50\%, \text{Appraiser 2} = 50\%$ (Staff, Japan, Asst Mgr, Sect Mgr, Snr Mgr, DGM).
3. **Completeness Gate ($K_{\text{valid}} == K_{\text{expected}}$):** Partial appraiser evaluation fails closed with `APPRAISER_RATING_INCOMPLETE`. No partial scoring is permitted.
4. **No Weight Redistribution:** A single completed appraiser in a 2-appraiser profile never inherits 100% weight.
5. **Layer Separation:** Appraiser Weight (Layer 1) is completely decoupled from Part A / Part B Weight (Layer 2) and workflow routing.

---

## 3. COCE / Compliance Governance
* **Evaluated:** **YES** (1-5 rating collected for employee review & compliance monitoring)
* **Included in Score:** **NO** (Excluded from Part B Sum, Part B Divisor, and Final Score calculation)
* **Configuration Property:** `Included_In_Score = false`

---

## 4. Annual Evaluation Cycle & Long-Lived App Core
* **Single Core App:** App 794 handles all fiscal years.
* **1 Employee = 1 Record per Cycle:** Record Key format `{Cycle_Code}-{Employee_Code}` (e.g. `FY2026-0149`, `FY2027-0149`).
* **Dynamic Resolution:** Current Cycle resolved from Evaluation Cycle Master + Current Date; zero hardcoded years in application logic.
* **Hybrid Generation:** Batch opening for active employees + Lazy creation for mid-year hires.

---

## 5. Annual Plan Carry Forward Governance
* **Core Principle:** Never Clone Entire Record. Only copy allowed planning fields via Strict Whitelist (`Objective`, `Action_Plan`, `Additional_Agreement`, `Weight`).
* **Difficulty Default:** `Carry_Forward_Difficulty = false` (User sets difficulty in current FY).
* **Isolation Guarantee:** Zero copying of scores, appraiser ratings, internal comments, COCE ratings, workflow status, approval timestamps, old approvers, or old snapshots.
* **Configuration Supremacy:** Target FY resolves fresh Profile, Weights, and Routing. If promoted (e.g. Staff -> Asst Mgr), Target 60/40 profile applies.
* **Workflow Boundary:** Allowed ONLY in `NEW_RECORD` or `01 DRAFT OBJECTIVE`. Disabled once workflow starts.

---

## 6. Artifact Lifecycle & Cleanup Governance
* **Zero Dead Artifacts:** Any replaced field, script, or routing model must be fully migrated, tested, and removed.
* **Single Source of Truth:** No parallel competing models in active production/sandbox apps.
* **Definition of Done:** Requires complete cleanup of replaced references, 0 orphan artifacts, and synchronized documentation.

---

## 7. Hoshin Final Governance (Dual-Level & Immutability)
* **Dual-Level Mandate (AND Condition):** Objective Submission requires BOTH Department Hoshin (`Ready = YES`) AND Section Hoshin (`Ready = YES`). If either is missing, submit is blocked with a specific error message.
* **Ready Immutability:** Active ready versions cannot be edited directly; revisions require creating a new version.
* **Single Active Version:** Exactly one active ready version allowed per FY and Scope unit. Old versions transition to Superseded state.
* **No Workflow:** Direct HR management without Process Management.

---

## 8. Generic Routing Architecture (FROZEN)
* **Twin-Status Engine:** Supports both `ALL` and `ANY` rules natively via twin statuses (`Step N - ALL` / `Step N - ANY`) and native `filterCond` branching.
* **Standard Capacity:** Exactly 6 Generic Approval Slots + Dedicated HR Final Check (45 Native Statuses total).
* **Identity Separation:** Requester Authorization, Scoring Appraiser, and Workflow Approver are governed independently.
* **Controlled Route Refresh:** In-flight stages are locked. Stage refresh on transfer requires HR action and audit logging.

---

## 9. In-Flight Approver Reassignment Governance (FROZEN)
* **Dual-Mode Management:** Stage Refresh (before new stage) vs In-Flight Reassignment (during active stage).
* **Current Record Only:** Reassignment applies strictly to current record via native API without altering Master.
* **Historical Immutability:** Completed evaluation stages are permanently locked.
* **Mandatory Audit Trail:** All reassignments require business reason and audit logging.

---

## 10. Approver Change Operational Rules (FROZEN)
* **Three Scopes:** Future Routing Change, Current Record Reassignment, Future Routing + Bulk Pending Reassignment.
* **Draft Record:** Resolves current Master upon submission.
* **Pending Record:** Requires explicit HR reassignment with reason; Master change alone does not alter in-flight records.
* **HR Self-Service:** $\ge 95\%$ routine routing administration handled by HR without IT intervention.

---

## 11. One MBO Record Per FY & Same Record Revision (FROZEN)
* **Identity Rule:** 1 Employee + 1 Fiscal Year = 1 MBO Record (`FY2027-0149`).
* **No Duplicate Records:** Reopen uses same record with incremented stage revision counter (`Objective_Revision: 2`). Never duplicate records.
* **Historical Immutability:** Superseded revisions are archived immutably (Option C Hybrid Model).
* **Single Counting:** Dashboard KPIs count exactly 1 evaluation per employee per FY.

---

## 12. Evaluation Profile & Scoring Architecture Baseline
* **Weights:** Staff/Japan (70/30), Asst Mgr (60/40), Sect Mgr/Snr Mgr/DGM/GM/VP (50/50).
* **Part A Scoring Modes:** Operational & Management use `DIFFICULTY_ACHIEVEMENT_MATRIX`; Executive (GM/VP) uses `ACHIEVEMENT_DIRECT`.
* **COCE Rule:** Evaluated = YES, Included_In_Score = NO.
* **Scoring Engine:** Parameterized `WEIGHTED_PART_A_B` with dynamic denominator $N_{\text{included}}$.
* **Rounding Baseline:** `CURRENT_DEPLOYED_ROUNDING = LIVE_KINTONE_PER_SCORING_CONFIGURATION`. Unified Half-Up rounding is `PROPOSED_TARGET_RULE` for Phase 3 design approval.
* **Objective Limits:** Min 2, Max 10, Total Active Weight = 100%.

---

## 13. Annual Evaluation Profile Freeze Policy (CONFIRMED)
* **Annual Immutability:** Profile, $K_{\text{expected}}$, and Scoring Configuration resolved at FY start are locked for the entire fiscal year (`DEC-024`).
* **Mid-Year Promotion:** Current FY retains starting profile; promoted profile applies in next FY.
* **Separation of Concerns:** Profile = Annual Snapshot (Criteria), Routing = Stage Snapshot (Approvers).

---

## 14. HR Control Center & Guided Workflow UX Architecture
* **HR Control Center:** Unified monitoring, exception management, and administrative self-service hub (>= 95% IT independence).
* **Alert Hierarchy:** Critical (Blocker), Action Required (Gate), Warning (Overdue), Information (Milestone).
* **Guided Workflow UX:** 5 Core Principles (What, Who, Why, Next, Where) with plain language status and context-aware action bars.

---

## 15. Implementation Governance & Phased Delivery Model (CONFIRMED)
* **16-Phase Execution:** Phased delivery from Phase 0 (Blueprint) to Phase 15 (Production Cutover).
* **3-Mode Verification:** Implementer -> Verifier -> Tester/Auditor.
* **Gate Criteria:** Static, Unit, Browser, Security, Regression, No-Orphan, and Guided UX Gates before phase completion.

## 15. Employee Data Isolation Governance (`DEC-039`)
- **Strict Isolation:** Each employee must only access their own MBO and evaluation records. Employee A must NEVER view Employee B objectives, ratings, comments, scores, history, or attachments unless explicitly authorized by role (Appraiser, Approver, HR).
- **Authenticated Identity:** `Employee_Code` alone is business identity data, NOT proof of identity. Access control MUST bind to verified Authenticated Identity.
- **Shared Account Conflict (`SECURITY_ARCHITECTURE_DEPENDENCY`):** Shared Kintone account logins cannot be distinguished by native permissions alone. Deterministic binding (`Authenticated Identity -> Employee_Code -> Authorized Record`) is required prior to Self-Service go-live.
- **Security Boundary:** Native permissions / server-side controls form the security boundary. Client-side JS/CSS filters are UX only.
- **Release Blocker Test:** `EMPLOYEE_A_CANNOT_ACCESS_EMPLOYEE_B` test across URLs, record IDs, REST APIs, and exports is a mandatory release blocker.


## 16. Legacy 8-App PMS Data Migration Governance (`DEC-040`)
- **Post-Stabilization Deferred Status (`LEGACY_MIGRATION_STATUS = DEFERRED`):** Historical data from the 8 legacy PMS apps (Apps 283, 305, 307, 310, 640, 643, 715, 716) will be migrated ONLY AFTER MBO V2 is stable, tested, verified, and UAT approved.
- **Read-Only Baseline:** All 8 legacy PMS apps remain strictly READ ONLY (`WRITE_ALLOWED_APPS = []`). Legacy records MUST NEVER be modified, deleted, or normalized in place.
- **Traceability Metadata:** Migrated records must store source app ID, source record ID, source record number, source revision, source profile, employee code, fiscal year, batch ID, migrated timestamp, and status.
- **Idempotent & Duplicate Safe:** Unique key constraint `Legacy_Source_App_ID + Legacy_Source_Record_ID`. Duplicate sources fail closed (`MIGRATION_DUPLICATE_SOURCE`).
- **No Score Recalculation:** Historical legacy scores must be migrated as historical results/evidence. Never recalculate old scores using current MBO V2 formulas.
- **Mandatory Dry-Run & Reconciliation:** Production migration requires explicit source-to-target mapping per app, mandatory `DRY_RUN = true` execution (0 writes), and complete reconciliation (`SOURCE = MIGRATED + APPROVED_SKIPPED + DOCUMENTED_ERRORS`).
- **Record Classification:** Migrated records are classified as `Record_Origin = LEGACY_MIGRATED` and MUST NOT enter active MBO V2 workflows.
