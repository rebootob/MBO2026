# Architecture & Design Decisions

## DEC-015 — Hoshin Governance, Versioning & Human Publication Model
- **Date**: 2026-08-23
- **Status**: ACTIVE
- **Decision**:
  1. App 53 Hoshin fields are legacy references and NOT the authoritative Current-Year Source of Truth.
  2. MBO V2 establishes a dedicated MBO Hoshin Master (App 799) with Fiscal Year scoping, Scope keys (`SECTION`, `DEPARTMENT`), Versioning, and Publication states (`DRAFT`, `PUBLISHED`, `SUPERSEDED`).
  3. Mandatory Human Confirmation: Every fiscal year requires explicit human confirmation/publication by authorized owners (zero silent fallback to old years).
  4. Objective Setting Submission Gate: Draft preparation and Carry Forward are permitted, but Objective Submission is strictly blocked until Current FY Hoshin is `PUBLISHED`.
  5. Immutable Snapshot: MBO records capture Hoshin version snapshots upon approval; post-approval Hoshin changes never alter historical records automatically.

## DEC-014 — Annual Plan Carry Forward Architecture & Strict Allow List Model
- **Date**: 2026-08-23
- **Status**: ACTIVE
- **Decision**:
  1. Historical MBO records must NEVER be cloned or duplicated as a whole record.
  2. The system allows selective carry forward of employee-owned planning information (`Objective`, `Action_Plan`, `Additional_Agreement`, `Weight`) from Historical FY to Current FY Draft.
  3. Security enforcement relies on an Explicit Field Allow List (never a blocklist alone).
  4. All target fiscal year configurations (Evaluation Profile, Scoring Scheme, Competency Set, Routing Master, Approvers) are freshly resolved for the current year.
  5. Evaluation results, scores, ratings, appraiser comments, COCE ratings, workflow status, approval history, and old configuration snapshots are strictly prohibited from copying.

## DEC-013 — Annual Evaluation Cycle Architecture & Single Long-Lived App Core
- **Date**: 2026-08-23
- **Status**: ACTIVE
- **Decision**:
  1. Operate App 794 as a single long-lived transaction core for all fiscal years (no app recreation per year).
  2. Enforce 1 evaluation record per employee per cycle: Record Key `{Cycle_Code}-{Employee_Code}` (e.g. `FY2026-0149`).
  3. Dynamic Cycle Resolution via Evaluation Cycle Master (App 798); Zero hardcoded fiscal years in application logic.
  4. Hybrid Record Generation (Batch Opening for active employees + On-demand Lazy Creation for mid-year hires).
  5. Generic multi-year views with current-cycle derivation.

## DEC-012 — COCE Scoring Treatment (Evaluation Only / Excluded from Average)
- **Date**: 2026-08-23
- **Status**: ACTIVE
- **Decision**:
  1. COCE is evaluated and rated (1-5) for behavioral feedback and reporting (`Evaluated = YES`).
  2. COCE is excluded from Part B sum and divisor calculations (`Included_In_Score = false`).
  3. Governed via generic configuration property `Included_In_Score` without hardcoding in calculation code.

## DEC-011 — Confirmed Evaluation Weights (Assistant Manager, GM, VP 50/50 Split)
- **Date**: 2026-08-23
- **Status**: ACTIVE
- **Decision**:
  1. Assistant Manager: Part A = 50%, Part B = 50% (Confirmed, supersedes legacy Excel 60/40).
  2. General Manager: Part A = 50%, Part B = 50% (Confirmed, supersedes legacy Excel 60/40).
  3. Vice President: Part A = 50%, Part B = 50% (Confirmed, supersedes legacy Excel 70/30).

## DEC-010 — Unified MBO Core & Master-Driven Evaluation Architecture (Option A)
- **Date**: 2026-08-23
- **Status**: PROPOSED (Awaiting User Review)
- **Context**: Legacy PMS maintained 8 separate applications for 8 employee ranks with 85%+ identical field schema and duplicated maintenance overhead.
- **Decision**:
  1. Consolidate all corporate evaluation profiles into a single transaction core (App 794).
  2. Implement configuration-driven masters: Evaluation Profile Master (App 796), Competency Master (App 797), and Generic Routing Master (App 795).
  3. Enforce immutable record snapshots to prevent retroactive evaluation scoring changes upon master data updates.

## DEC-009 — Legacy Routing Fields Deprecation & Pure Sequential Target Model
- **Date**: 2026-08-23
- **Status**: ACTIVE
- **Context**: App 795 and App 794 previously contained both the legacy model (`First_Manager_User`, `Manager_User`, `GM_User`) and the new generic sequential model (`Manager_Level1_Approvers`, `Manager_Level2_Approvers`, `GM_Level1_Approvers`, `GM_Level2_Approvers`).
- **Decision**:
  1. Designate the generic sequential model as the single source of truth for routing resolution.
  2. Mark `First_Manager_User`, `Manager_User`, and `GM_User` as DEPRECATED.
  3. Prohibit deleting legacy fields immediately until App 794 Process Management (Workflow settings) are migrated to reference generic level field codes.
  4. Ensure all routing derivation logic reads exclusively from the new model.

## DEC-008 — Sequential Approval Levels and Multi-Approver Rules (ALL vs ANY)
- **Date**: 2026-08-23
- **Status**: ACTIVE
- **Context**: Approval workflows require supporting both sequential hierarchies (e.g. Trainee Manager -> Mentor Manager -> GM) and multi-approver consensus within a level.
- **Decision**:
  1. Decouple sequential `LEVEL` (Manager L1/L2, GM L1/L2) from intra-level `APPROVAL RULE` (`ALL`/`ANY`).
  2. Set **`ALL` as the mandatory default** for all approval rules across Manager and GM levels.
  3. Treat `ANY` as an intentional business exception.
  4. Both Manager and GM adhere to the identical model.
  5. Empty levels are automatically bypassed.

## DEC-007 — Horizontal Spreadsheet Form Grid (Part A)
- **Status**: ACTIVE

## DEC-006 — Dual-Space UI Host Resolution Strategy
- **Status**: ACTIVE

## DEC-005 — 10-Item Objective Scalability
- **Status**: ACTIVE

## DEC-004 — Auto-Generated Record Key (FY-EmpCode)
- **Status**: ACTIVE

## DEC-003 — Pure Custom Inline Validation (return false)
- **Status**: ACTIVE

## DEC-002 — Event-Driven Create Mode Lifecycle (NEW_RECORD)
- **Status**: ACTIVE

## DEC-001 — Isolated Sandbox Architecture
- **Status**: ACTIVE
