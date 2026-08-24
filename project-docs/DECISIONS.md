# Architecture & Design Decisions

## DEC-030 — Standardized AI Review Package Governance
- **Date**: 2026-08-24
- **Status**: FROZEN (Review Governance)
- **Decision**:
  1. **Single Source Review Package:** Exactly one living review package file `project-docs/AI_REVIEW_PACKAGE.md` is maintained across the repository, replaced/updated per Work Package. Historical reviews are tracked exclusively via Git history.
  2. **Evidence-Based Technical Review:** Technical verification is based strictly on Source code, Git Diff, Config Snapshots, Test Output, Read-back verification, and Audit Evidence. Screenshots are strictly limited to UI layout, responsive visual design, or visual error inspection.
  3. **Multi-AI Compatibility:** The review package must be provider-neutral, facilitating peer reviews across Antigravity, ChatGPT, OpenAI Codex, Claude, or Human Technical Leads.
  4. **Dual Gate Requirement:** A Work Package is only fully complete when both `IMPLEMENTATION_GATE = PASS` and `REVIEW_GATE = PASS`.
  5. **Review Commit Separation Rule:** To avoid recursive SHA updates, `Implementation Target Commit` (the commit containing the source/test changes under review) and `Review Package / Evidence Commit` (the commit packaging the review documentation) are tracked as distinct metadata fields.

## DEC-029 — First Actual Kintone Write & Zero Artificial Write Policy
- **Date**: 2026-08-24
- **Status**: FROZEN (Implementation Governance)
- **Decision**:
  1. **Zero Artificial Writes:** No artificial canary changes, temporary test fields, or dummy records may ever be written to Kintone solely to test write pipelines.
  2. **No Required Business Change = No Kintone Write:** When existing Kintone schemas (such as App 794 annual identity fields) already conform to the target blueprint, all existing fields are marked `KEEP` with zero schema mutations (`WRITE_ALLOWED_APPS = []`).
  3. **Strict Write Preconditions:** Actual Kintone write operations will occur exclusively when an approved work package specifically requires an actual business schema change, with an exact Expected Change Manifest, pre-write backup, temporary write window, read-back verification, and rollback procedure.

## DEC-028 — Multi-AI Continuity & Handoff Governance
- **Date**: 2026-08-24
- **Status**: FROZEN (Provider-Neutral Governance)
- **Decision**:
  1. **Provider-Independent Continuity:** The project must seamlessly transition between implementing AI assistants (Antigravity, OpenAI Codex, Claude, etc.) using the Git repository and living documentation as the sole authoritative Source of Truth.
  2. **Mandatory 12-Document Reading Order:** Incoming AI assistants must read the 12-document sequence defined in `AI_START_HERE.md` and verify state via the 7-Step Handoff Verification Protocol before taking action.
  3. **Traceability Standards:** All changes must reference structured Work Package IDs (`MBO-P{PHASE}-WP-{NUMBER}`) and Defect IDs (`MBO-P{PHASE}-DEF-{NUMBER}`).
  4. **Strict Handoff Checkpoint:** Current AI must test, document, verify zero unrecorded changes, commit, push, and record the Last Safe Commit hash before handing off.

## DEC-027 — 16-Phase Implementation Governance & Delivery Model
- **Date**: 2026-08-24
- **Status**: FROZEN (Phased Delivery Governance)
- **Decision**:
  1. **Strict 16-Phase Delivery Model:** Enforce `PHASE -> WORK PACKAGE -> TEST GATE -> USER REVIEW -> COMMIT/TAG -> NEXT PHASE`. Strictly prohibit Big-Bang deployment.
  2. **Three Execution Modes:** Mode 1 (Implementer), Mode 2 (Verifier), Mode 3 (Tester/Auditor). Verifier must independently verify code, tests, and Kintone state.
  3. **One Phase One Boundary:** Cross-phase discoveries must be logged as `DEFERRED_OBSERVATION` without scope creep. Discrepancies with frozen architectures require a formal `ARCHITECTURE_CHANGE_REQUEST` (ACR) and user approval.
  4. **Defect Management & Status Control:** Every bug tracked via `MBO-P{PHASE}-DEF-{NUMBER}` in `DEFECT_REGISTER.md`. Live progress tracked in `IMPLEMENTATION_STATUS.md`.

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


## DEC-031 — Target Active Section Requester Authorization Master & Distinct User Account Mapping
- **Date**: 2026-08-24
- **Status**: FROZEN (Approved Business Rule)
- **Decision**:
  1. **12 Active Business Sections:** The active enterprise scope consists of exactly 12 active business sections across 8 departments: `TME1`, `TMF1`, `TMF2`, `TMF3`, `TMG1`, `TMG2`, `TMH1`, `TMH2`, `TMH3`, `TMS1`, `TMT1`, `TMT2`.
  2. **9 Distinct Valid Requester Accounts:** The 12 active sections map deterministically to exactly 9 distinct active Cybozu accounts (`e1`, `f1`, `f2`, `f3`, `g_request`, `tmh`, `s1`, `t1`, `t2`), all verified `valid=true`.
  3. **User-Confirmed TMG Mapping:** Sections `TMG1` and `TMG2` map to shared requester account `g_request` (`USER_CONFIRMED_BUSINESS_RULE`).
  4. **Strict Role Separation:** Requester User (departmental submitter) != Scoring Appraiser != Workflow Approver != Employee.

## DEC-032 — Retirement of Section TMT3 & Legacy Account Exclusion
- **Date**: 2026-08-24
- **Status**: FROZEN (Approved Business Rule)
- **Decision**:
  1. **Section TMT3 Status:** Formally retired (`TMT3_SECTION_STATUS = RETIRED`).
  2. **Zero Seeding:** `TMT3` must NOT be seeded into App 795 and must NOT have new MBO records initialized.
  3. **Historical Legacy Account:** Legacy account `t3` is `HISTORICAL_ONLY` (`valid=false`) and is not proposed for automatic reactivation.
  4. **App 53 Reconciliation:** The 11 App 53 records referencing `TMT3` are tracked under `OBS-005` as `ORGANIZATION_DATA_RECONCILIATION_REQUIRED` (employment/stale status undetermined).

## DEC-033 — Baseline Preservation of App 794 Requester_User Schema Requirement & ACR-001 Deferral
- **Date**: 2026-08-24
- **Status**: FROZEN (Architecture Baseline)
- **Decision**:
  1. **Schema Requirement Retained:** `App794.Requester_User.required = true` is retained in the Kintone database schema.
  2. **ACR-001 Deferral:** `ACR-001` (proposing `required = false`) is formally marked `DEFERRED / NOT REQUIRED FOR CURRENT DESIGN` because Requester_User can be resolved directly from App 795 prior to Annual Record creation.
  3. **Zero Schema Modification:** No schema write operations are executed against App 794 in Phase 2.

## DEC-034 — Enterprise App 795 Routing Master Seeding Scope Boundary (Phase 5 Delivery)
- **Date**: 2026-08-24
- **Status**: FROZEN (Phased Scope Boundary)
- **Decision**:
  1. **Phase 2 Scope Boundary:** Work Package `MBO-P02-WP-003` is restricted to Annual Record Foundation, pilot verification (`TME1 -> e1`), and zero Kintone writes.
  2. **Phase 5 Delivery Scope:** Enterprise seeding of all remaining 11 active section mappings into App 795 will be executed exclusively under Phase 5 (`Generic Routing & Twin-Status Execution Engine`) under its dedicated Work Package and controlled write window.
  3. **Live Record Dependency:** Live annual record creation remains blocked under `LIVE_RECORD_READINESS_DEPENDENCY`.

## DEC-035 — Kintone-First Scoring Source of Truth & Legacy Production Calibration
- **Date**: 2026-08-24
- **Status**: FROZEN (Authoritative Governance Rule)
- **Decision**:
  1. **Primary Source of Truth:** For all scoring formulas, weights, appraiser models, and rounding behaviors, **Live Deployed Kintone Configuration is the Primary Source of Truth (`SCORING_SOURCE_OF_TRUTH = LIVE_KINTONE_FIRST`)**. Secondary Excel business artifacts must NOT override verified live Kintone calculation behavior.
  2. **Active Downstream Lineage Rule:** The authoritative scoring formula is strictly the one participating in the active downstream calculation chain leading to the terminal score (`total_all`). Unreferenced duplicate CALC fields (e.g. `total_a_0` in App 283 and App 310) are classified as `DUPLICATE_CALC / LEGACY_UNUSED`.
  3. **Assistant Manager 60/40 Weight Split (Supersedes DEC-023):** Supersedes the generic 50/50 assumption in `DEC-023` for Assistant Manager. Live Kintone (App 310) establishes Assistant Manager as a distinct profile with **60% Part A / 40% Part B** and standard `ROUND(..., 2)` rounding.
  4. **GM & VP Single Appraiser Model (Supersedes DEC-023):** Supersedes the generic 1–2 appraiser assumption in `DEC-023` for deployed baseline truth. Live Kintone (App 640 and App 715) deploys a 1-appraiser scoring model normalized via `(sum_rating * 2) / 14`.
  5. **Exact Legacy Rounding vs Target Rule (Supersedes DEC-023):** Supersedes generic universal rounding assumptions in `DEC-023`. Live Kintone application-specific rounding is the authoritative legacy truth. Any unified rounding precision for MBO 2026 is designated as `PROPOSED_TARGET_RULE` subject to Phase 3 design approval.
  6. **100-Point Scale Normalization:** Final evaluation score is normalized to a 100-point scale via `((total_a + total_b) * 100) / 5`, while `total_a + total_b` represents the intermediate 5-point weighted score.
  7. **Preservation of DEC-023 Architecture:** All other architectural principles of `DEC-023` (4 Profile Families, Configuration-Driven Master, COCE exclusion, Hybrid Storage) remain fully effective.


## DEC-036 — Appraiser Weight & Completeness Governance (Part A & Part B)
- **Date**: 2026-08-24
- **Status**: FROZEN (User-Confirmed Core Governance Rule)
- **Decision**:
  1. **Scope across Both Part A and Part B:** Appraiser Weight Governance applies universally to all scoring calculations that combine evaluations from multiple scoring appraisers, including **Part A (Objective Evaluation)** and **Part B (Competency Evaluation)**.
  2. **Two Distinct Weight Layers:** The scoring architecture strictly separates:
     - **Weight Layer 1 (Appraiser Weight):** Weight distribution across multiple scoring appraisers ($1/K_{\text{expected}}$).
     - **Weight Layer 2 (Part A / Part B Weight):** Weight distribution between MBO objectives (Part A) and Competencies (Part B) (70/30, 60/40, or 50/50).
  3. **Appraiser Weight Formulation:** Appraiser weight is dynamically derived from $K_{\text{expected}}$ (resolved from the employee's annual Scoring Configuration):
     - When $K_{\text{expected}} = 1 \implies \text{Appraiser\_1\_Weight} = 100\%$.
     - When $K_{\text{expected}} = 2 \implies \text{Appraiser\_1\_Weight} = 50\%, \text{Appraiser\_2\_Weight} = 50\%$.
     - General Equal-Weight Formula: $\text{Appraiser\_Weight}_j = 1 / K_{\text{expected}}$.
     - Weights derive from $K_{\text{expected}}$, never hardcoded to specific role titles.
  4. **Part A Objective Combination Formula:**
     $$\text{Objective\_Result}_i = \sum_{j=1}^{K_{\text{expected}}} (\text{Objective\_Value}_{i,j} \times \text{Appraiser\_Weight}_j) = \frac{\sum_{j=1}^{K_{\text{expected}}} \text{Objective\_Value}_{i,j}}{K_{\text{expected}}}$$
  5. **Part B Competency Combination Formula:**
     $$\text{Competency\_Result}_i = \sum_{j=1}^{K_{\text{expected}}} (\text{Rating}_{i,j} \times \text{Appraiser\_Weight}_j) = \frac{\sum_{j=1}^{K_{\text{expected}}} \text{Rating}_{i,j}}{K_{\text{expected}}}$$
  6. **Strict Completeness Gates (Fail-Closed):**
     - **Part A Completeness Gate:** All required Part A appraiser inputs must be complete ($K_{\text{valid}} == K_{\text{expected}}$).
     - **Part B Completeness Gate:** All required Part B competency ratings must be complete ($K_{\text{valid}} == K_{\text{expected}}$).
     - **Final Score Availability:** Final score calculation is blocked until **BOTH** Part A and Part B completeness gates pass. If any required appraiser input is missing, the system returns `APPRAISER_RATING_INCOMPLETE` with no partial scoring.
  7. **No Automatic Weight Redistribution:** If $K_{\text{expected}} = 2$ and only one appraiser has submitted evaluations, the system **MUST NOT** redistribute weight to 100% for the completed appraiser. It must fail closed until all required appraisers complete their evaluations.
  8. **Annual Profile Snapshot:** $K_{\text{expected}}$, `Appraiser_Weight_Rule_Code`, and `Scoring_Config_Version` are resolved and snapshotted at Annual Record Initialization and frozen for the full FY under `DEC-024`.
  9. **Separation of Scoring from Routing:** Scoring Appraiser count and weight belong strictly to the Scoring Configuration and are decoupled from workflow routing slots or stage approver reassignments.

## DEC-037 — Hybrid Configuration Storage Architecture (SUPERSEDED)
- **Date**: 2026-08-24
- **Status**: SUPERSEDED_BY_DEC_038 (Historical Architectural Record Preserved)
- **Superseded Reason**: User simplified architecture to Kintone-Only storage (`DEC-038`), eliminating runtime Git dependencies.
- **Decision**:
  1. **Selected Option:** **`Option C: Hybrid Architecture`** (Standalone Kintone Master App for HR runtime administration with Git Repository JSON Backup Snapshots).
  2. **Three System Sources Defined:**
     - `LEGACY_SCORING_EVIDENCE_SOURCE`: Existing deployed Kintone PMS apps (Apps 283, 716, 310, 305, 643, 307, 640, 715).
     - `V2_RUNTIME_CONFIGURATION_SOURCE`: Kintone Profile / Scoring Configuration Master App (Standalone Kintone App for HR runtime administration).
     - `V2_BACKUP_AUDIT_RECOVERY_SOURCE`: Git Repository immutable configuration snapshots (controlled versioned repository path).
  3. **Runtime Governance:** Kintone Master App serves as `V2_RUNTIME_CONFIGURATION_SOURCE` for active runtime profile and scoring configuration resolution.
  4. **Backup & Recovery Governance:** Git Repository serves as `V2_BACKUP_AUDIT_RECOVERY_SOURCE` for immutable audit, publish verification, and disaster recovery.
  5. **Fail-Closed Runtime Rule:** Git backup is NOT an automatic runtime fallback. If runtime Kintone configuration is unavailable or inconsistent, the runtime engine must **FAIL CLOSED** (`SCORING_CONFIG_RESOLUTION_FAILED`).

## DEC-038 — Kintone-Only Profile & Scoring Configuration Storage Architecture
- **Date**: 2026-08-24
- **Status**: FROZEN (User-Confirmed Core Architecture Decision - Supersedes DEC-037)
- **Decision**:
  1. **Target Architecture:** **`PROFILE_CONFIGURATION_STORAGE = KINTONE_ONLY`**.
  2. **Runtime Configuration Source:** Kintone Profile / Scoring Configuration Master App (`V2_RUNTIME_CONFIGURATION_SOURCE`) is the single active runtime source for HR profile and scoring administration.
  3. **Immutable Version History:** Historical scoring configurations are stored as immutable versioned records within the same Kintone Master App (`{Profile_Code}::{Scoring_Config_Version}`).
  4. **Annual Historical Snapshot:** App 794 Annual MBO Records snapshot sufficient physical profile and scoring codes at annual record initialization to guarantee permanent FY scoring reproducibility.
  5. **Zero Runtime Git Dependency:** Software runtime has **NO DEPENDENCY** on GitHub, Local Git, Remote Git, external file servers, or NAS for configuration resolution or publish verification. (Developer source code version control in Git remains standard software development practice).
  6. **Kintone-Only Safe Publish Sequence:**
     - `DRAFT` $\to$ Validate rules $\to$ `VALIDATED` $\to$ Compute `Configuration_Hash` $\to$ Save in Kintone $\to$ Read record back via REST API while status remains `VALIDATED` $\to$ Compare Expected Hash vs Read-Back Hash $\implies$ IF MATCH: Transition status to `PUBLISHED`; IF NOT MATCH: Fail Closed with `CONFIG_READBACK_MISMATCH`.
  7. **No Separate Archive App:** The Configuration Master App itself maintains historical published versions (`Config_Status = SUPERSEDED` / `RETIRED`). No separate archive app is created.

## DEC-039 — Strict Employee Record Data Isolation Architecture
- **Date**: 2026-08-24
- **Status**: FROZEN (User-Confirmed Security Critical Governance)
- **Decision**:
  1. **Strict Record-Level Data Isolation:** Each employee must ONLY be able to access their own MBO and evaluation records (e.g., Employee Code `0149` can access only `0149` records). Employee A must NEVER be able to view Employee B objectives, ratings, comments, scores, evaluation history, attachments, or routing information unless the authenticated user possesses an explicit authorized business role (such as HR or assigned approver).
  2. **Security Based on Authenticated Identity:** `Employee_Code` alone MUST NOT be treated as authentication. Entering an `Employee_Code` in a form or URL does NOT prove user identity. Security MUST be bound to authenticated identity (e.g. native Kintone login identity or verified SSO server token).
  3. **Shared Kintone Account Security Conflict (`SECURITY_ARCHITECTURE_DEPENDENCY`):** If multiple employees log in using a shared Kintone account, native Kintone permissions see them as the SAME user. Native record permissions cannot distinguish individual employees behind a shared login. Prior to Employee Self-Service go-live, a deterministic, secure binding mechanism (`Authenticated Identity -> Employee_Code -> Authorized Record(s)`) must be established.
  4. **Security Boundary Rule:** Native Kintone app/field permissions or approved server-side access controls constitute the security boundary. JavaScript/CSS (hiding fields/buttons, JS filtering) are UX enhancements ONLY and MUST NOT be relied upon to prevent unauthorized data access.
  5. **Least-Privilege Role Access Model:**
     - **Employee:** Own records only.
     - **Authorized Appraiser:** Records explicitly assigned for evaluation.
     - **Authorized Approver:** Records explicitly routed to that approver.
     - **HR:** Authorized enterprise evaluation access.
     - **HR Manager / System Admin:** Administrative access according to approved security policy.
  6. **Direct URL / API Security & Mandatory Testing:** Access control testing must verify that tampering with URLs, record IDs, Kintone REST APIs, list views, searches, exports, or attachments does NOT grant cross-employee access. The test `EMPLOYEE_A_CANNOT_ACCESS_EMPLOYEE_B` is a mandatory release blocker.


## DEC-040 — Legacy 8-App PMS Data Migration to MBO V2 Governance
- **Date**: 2026-08-24
- **Status**: FROZEN (User-Confirmed Data Migration Governance)
- **Decision**:
  1. **Post-Stabilization Deferred Migration (`LEGACY_MIGRATION_STATUS = DEFERRED`):** Historical evaluation data from all 8 legacy PMS applications (Apps 283, 305, 307, 310, 640, 643, 715, 716) will be migrated into MBO V2 ONLY AFTER MBO V2 is stable, tested, verified, and UAT approved. No data migration is authorized during current implementation phases.
  2. **Legacy Applications Permanently Read-Only:** All 8 legacy PMS apps remain strictly READ ONLY (`WRITE_ALLOWED_APPS = []`). Migration & rollback processes must NEVER modify, delete, normalize in-place, recalculate, or alter permissions of legacy source records.
  3. **Traceability Metadata Design:** Every migrated record must preserve source traceability metadata (`Legacy_Source_App_ID`, `Legacy_Source_Record_ID`, `Legacy_Source_Record_Number`, `Legacy_Source_Revision`, `Legacy_Source_Profile`, `Legacy_Employee_Code`, `Legacy_Fiscal_Year`, `Migration_Batch_ID`, `Migrated_At`, `Migration_Status`).
  4. **Idempotent & Duplicate-Safe Migration:** Migration must be safe to rerun without creating duplicate historical records. Unique key constraint: `Legacy_Source_App_ID` + `Legacy_Source_Record_ID`. Duplicate sources fail closed with `MIGRATION_DUPLICATE_SOURCE`.
  5. **No Historical Score Recalculation:** Legacy scores must be migrated as historical results/evidence. Migration MUST NOT recalculate old scores using current MBO V2 formulas.
  6. **Mandatory Reconciliation & Dry-Run Gate:** Production migration requires an explicit source-to-target mapping per app, mandatory `DRY_RUN = true` execution (with 0 writes), and complete reconciliation (`SOURCE = MIGRATED + APPROVED_SKIPPED + DOCUMENTED_ERRORS`).
  7. **Record Classification:** Migrated records are classified as `Record_Origin = LEGACY_MIGRATED` and MUST NOT enter active MBO V2 approval workflows.
  8. **Pre-Migration Target Checkpoint:** Before an authorized migration batch writes to the target application, a deterministic target-state checkpoint must be captured to verify pre-batch state for reconciliation and rollback.
  9. **Exact Target Record Manifest:** Every migration batch must maintain an exact manifest of target records created by `Migration_Batch_ID` (`Migration_Batch_ID`, `Legacy_Source_App_ID`, `Legacy_Source_Record_ID`, `Target_App_ID`, `Target_Record_ID`, `Migration_Status`). Rollback MUST use this exact batch manifest (NO broad deletion queries).
  10. **Post-Write Read-Back Verification:** After migration writes, the process must read created target records back from Kintone REST API and verify record existence, `Migration_Batch_ID`, `Legacy_Source_App_ID`, `Legacy_Source_Record_ID`, `Record_Origin = LEGACY_MIGRATED`, and required business fields. Verification failure yields `MIGRATION_VERIFICATION_FAILED` (Fail Closed).
  11. **Migration Batch Success Contract:** A production migration batch becomes `MIGRATION_BATCH_SUCCESS` ONLY when write completed, post-write read-back passed, duplicate check passed, batch manifest reconciled, and source/target reconciliation passed. Otherwise, status is `MIGRATION_BATCH_FAILED` and controlled rollback is executed.
  12. **Batch-Only Rollback Contract:** Rollback operates ONLY from the exact `Migration_Batch_ID` target manifest, removing/reverting ONLY target records created by that failed batch. Legacy source apps (283, 305, 307, 310, 640, 643, 715, 716) remain PERMANENTLY READ ONLY and are NEVER modified during rollback.
  13. **Security Continuity:** `DEC-039` strict record data isolation applies equally to historical migrated records.
