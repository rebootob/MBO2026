# Architecture & Design Decisions

## DEC-025 — HR Control Center & Operations Architecture
- **Date**: 2026-08-24
- **Status**: FROZEN (Required Core Subsystem)
- **Decision**:
  1. **Unified Monitoring & Operations Hub:** Implement HR Control Center as the primary operational console for HR administrators.
  2. **Core Modules:** Pipeline Overview Dashboard, Employee Evaluation Monitor (interactive grid with 1-click modal), Multi-Dimensional Filter/Search, Routing Operations Hub, Reopen & Revision Center, Hoshin Management Hub, Annual Cycle Hub, and Health/Configuration Monitor.
  3. **HR Self-Service Target:** Enable HR to handle >= 95% of routine administrative tasks (manager changes, reassignments, reopens, hoshin readiness) without IT intervention.
  4. **Actionable Insights:** Transform monitoring alerts into 1-click operational actions (e.g. Inactive Approver -> [Reassign Approver]).

## DEC-026 — Guided Workflow UX Framework
- **Date**: 2026-08-24
- **Status**: FROZEN (Required Core Subsystem)
- **Decision**:
  1. **5 Core Principles:** UI must clearly present: (1) What is happening, (2) Who needs to act, (3) What is wrong/missing, (4) What is the next step, (5) Where is the action button.
  2. **Plain-Language Statuses:** Replace technical status codes (e.g. `02 Manager L1 Pending - ALL`) with bilingual business-friendly status banners.
  3. **Dynamic Action Bar:** Provide context-aware, validation-guarded CTA buttons.

## DEC-024 — Annual Evaluation Profile Freeze Policy
- **Date**: 2026-08-24
- **Status**: FROZEN
- **Decision**:
  1. **Annual Profile Freeze:** Evaluation and Scoring Profiles are resolved strictly at Annual MBO Record initialization and are **FROZEN FOR THE ENTIRE FISCAL YEAR**.
  2. **Mid-Year Promotion / Transfer Policy:** Mid-year position changes, promotions (e.g. Staff $	o$ Asst Mgr), or department transfers do NOT modify the current FY Evaluation Profile. The employee completes the current FY under their starting Profile; the new Profile applies in the subsequent FY.
  3. **Profile vs Routing Separation:** Evaluation Profile (Scoring Criteria) is an Annual Snapshot; Routing (Approver Assignees) is a Stage Snapshot capable of mid-year refresh/reassignment.
  4. **Supersede Stage Profile Refresh:** The previous exploratory design *Controlled Stage Profile Refresh* is officially **SUPERSEDED**.

## DEC-023 — Evaluation Profile, Competency & Scoring Architecture
- **Date**: 2026-08-24
- **Status**: FROZEN
- **Decision**:
  1. **Configuration-Driven Profile Master:** Unify all 8 evaluation groups into 4 Profile Families (`PROFILE_STAFF_CHIEF`, `PROFILE_JAPANESE_STAFF`, `PROFILE_MANAGEMENT`, `PROFILE_EXECUTIVE`) governed by metadata.
  2. **Evaluation Weights:** Staff/Japan (70/30), All Management & Exec (50/50 - Confirmed).
  3. **COCE Governance:** `Evaluated = YES`, `Included_In_Score = NO`. Scoring denominator dynamically filters out excluded items.
  4. **Standardized Scoring Algorithm (`WEIGHTED_PART_A_B`):** Parameterized mathematical model with dynamic denominator ($N_{\text{included}} \times K_{\text{appraisers}}$) and Half-Up 2-decimal place rounding.
  5. **Hybrid Schema Storage (Option C):** App 794 maintains current working state (~172 fields, 34% of Kintone limit); Revision Archive App stores immutable historical snapshots.

## DEC-021 — Approver Change Operational Model & HR Self-Service
- **Date**: 2026-08-24
- **Status**: FROZEN
- **Decision**:
  1. **Three Operational Scopes:** 1) Future Routing Change, 2) Current Record Reassignment, 3) Future Routing + Bulk Pending Reassignment.
  2. **Draft vs In-Flight Logic:** Draft records resolve newly effective Master routing upon submission. In-flight pending records remain with current approver unless explicitly reassigned by HR with documented reason.
  3. **HR Self-Service Target:** $\ge 95\%$ of routine routing administration is executable by HR via Business UI without IT intervention.
  4. **Three-Layer History Model:** Preserves Master history, Stage snapshots, and In-Flight reassignment audit trail (`APPROVER_REASSIGNED`).

## DEC-022 — One MBO Record Per Employee Per Fiscal Year & Same Record Revision
- **Date**: 2026-08-24
- **Status**: FROZEN
- **Decision**:
  1. **One Record Per Employee Per FY:** Exactly 1 primary MBO Transaction Record (`FY2027-0149`). Reopen NEVER duplicates Kintone records (Strictly NO `FY2027-0149-R2`, `-COPY`, `-NEW`).
  2. **Stage-Specific Revision:** Stage counters (`Objective_Revision`, `MidYear_Revision`, `Final_Revision`) increment on controlled reopen.
  3. **Hybrid Archive Storage (Option C):** App 794 maintains the Current Working Revision; Dedicated Revision Archive App stores immutable serialized snapshots of superseded revisions.
  4. **Approval & Score Invalidation:** Superseded approvals become `HISTORICAL / SUPERSEDED`; current approval status resets to `PENDING` on new revision; scores recalculate from current valid revision.
  5. **Dashboard Single Counting:** Dashboard KPIs count exactly 1 evaluation per employee per FY regardless of revision count.

## DEC-020 — In-Flight Approver Reassignment & Dual-Mode Route Management
- **Date**: 2026-08-24
- **Status**: FROZEN
- **Decision**:
  1. **Dual-Mode Route Management:** Formally separate Mode A (Controlled Stage Route Refresh before new stage) from Mode B (In-Flight Approver Reassignment during an active stage).
  2. **In-Flight Reassignment Scope:** Defaults strictly to **Current Record Only** via Native Kintone Update Assignees REST API without altering App 795 Routing Master.
  3. **Completed Stage Immutability:** Historical completed stages permanently preserve their original approver stamps and cannot be rewritten.
  4. **Multi-User ALL / ANY Support:** Reassigning an approver in an `ALL` slot with partial approvals preserves already-completed approvals and seamlessly transfers pending assignments.
  5. **Mandatory Audit Trail:** Every reassignment permanently logs an `APPROVER_REASSIGNED` event (`Record_Key`, `Old_Approver`, `New_Approver`, `Reason`, `User`, `Timestamp`).

## DEC-019 — Generic Routing Architecture: Twin-Status Engine & 6-Slot Capacity
- **Date**: 2026-08-24
- **Status**: FROZEN
- **Decision**:
  1. **Native Twin-Status Engine:** To overcome Kintone's static status-level Assignee Type limitation, each Generic Slot ($N in [1..6]$) is implemented as twin statuses (`Step N - ALL` and `Step N - ANY`). Transition branching is enforced 100% server-side via native `filterCond`.
  2. **Standardized Capacity:** `GENERIC_APPROVAL_SLOT_CAPACITY = 6` Generic Slots + Dedicated `HR_FINAL_CHECK` (45 Total Native Statuses across the entire lifecycle).
  3. **Strict Identity Separation:** Requester Authorization != Scoring Appraiser != Workflow Approver.
  4. **Controlled Stage Route Refresh:** In-flight stages are strictly frozen. HR can execute a logged route refresh prior to opening a new evaluation stage for transferred employees.
  5. **No Orphan Policy:** Existing App 795 fields (`Manager_User`, `GM_User`, `Manager_Level1_Approvers` etc.) are marked `MIGRATION / DEPRECATION CANDIDATE` and will undergo full 7-step cleanup in the Implementation Phase.
## DEC-018 — Hoshin Final Governance: Dual-Level Requirement, Ready Version Immutability & Architecture Freeze
- **Date**: 2026-08-24
- **Status**: FROZEN (Approved by User)
- **Decision**:
  1. **Architecture Status:** `HOSHIN_ARCHITECTURE = FROZEN`.
  2. **HR Sole Management & Zero Workflow:** HR directly maintains Department and Section Hoshins with zero Kintone Process Management.
  3. **Dual-Level Submission Gate:** Objective submission in App 794 strictly requires BOTH Department Hoshin (`Ready_For_MBO = YES`) AND Section Hoshin (`Ready_For_MBO = YES`) simultaneously (Strict AND condition).
  4. **Ready Version Immutability:** When `Ready_For_MBO = "YES"`, the record is strictly immutable. Revisions require creating a new version (`Version 2`) with `Ready_For_MBO = "NO"` during draft editing.
  5. **Single Current Ready Invariant:** At most one active ready version per `(Fiscal_Year, Scope_Type, Scope_Code)`. When a new version becomes ready, the old version only has its lifecycle state updated to `SUPERSEDED` / `HISTORICAL` without altering its content or audit data.
  6. **Zero Historical Deletion:** Superseded versions are preserved permanently.
  7. **Complete Dual Snapshot:** App 794 captures complete snapshots of both Department and Section Hoshins on submit.

