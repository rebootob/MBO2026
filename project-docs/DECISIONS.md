# Architecture & Design Decisions

## DEC-020 — In-Flight Approver Reassignment & Dual-Mode Route Management
- **Date**: 2026-08-24
- **Status**: ACTIVE (Confirmed & Ready for Final Freeze Review)
- **Decision**:
  1. **Dual-Mode Route Management:** Formally separate Mode A (Controlled Stage Route Refresh before new stage) from Mode B (In-Flight Approver Reassignment during an active stage).
  2. **In-Flight Reassignment Scope:** Defaults strictly to **Current Record Only** via Native Kintone Update Assignees REST API without altering App 795 Routing Master.
  3. **Completed Stage Immutability:** Historical completed stages permanently preserve their original approver stamps and cannot be rewritten.
  4. **Multi-User ALL / ANY Support:** Reassigning an approver in an `ALL` slot with partial approvals preserves already-completed approvals and seamlessly transfers pending assignments.
  5. **Mandatory Audit Trail:** Every reassignment permanently logs an `APPROVER_REASSIGNED` event (`Record_Key`, `Old_Approver`, `New_Approver`, `Reason`, `User`, `Timestamp`).

## DEC-019 — Generic Routing Architecture: Twin-Status Engine (ALL/ANY) & 6-Slot Capacity
- **Date**: 2026-08-24
- **Status**: ACTIVE (Corrected & Ready for Final Freeze Review)
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

