# D3-PRE1-R1: Workflow Authority & Reopen Evidence Accuracy Corrective

Date: 2026-09-08 ICT
Work Package: `D3-PRE1-R1`
Type: `EVIDENCE-ONLY / DOCS-ONLY CORRECTIVE`
Parent Work Package: `D3-PRE1` (`PARTIAL PASS / CORRECTIVE UNDER REVIEW`)
Branch: `ai/antigravity-wp002c`
Repository: `rebootob/MBO2026`
Starting HEAD: `d9082e46d579fccd125cec2b9aceeaa804b959b9`
Author: Antigravity Execution Plane
Review Target: Human Owner & ChatGPT Control Plane

---

## 1. Corrective Scope

This work package is an evidence-only and documentation-only corrective responding to independent Control Plane findings on `D3-PRE1`.

Strict Invariants:
- Zero modifications to source code (`src/**`).
- Zero modifications to test code (`tests/**`).
- Zero build, zero deployment, zero Kintone network requests.
- Zero workflow transitions executed.
- Stage D3 remains strictly `HOLD / NOT AUTHORIZED`.

The scope reconciles four critical areas:
1. App 794 16-state / 28-action naming and transition semantics aligned with Confirmed Baseline.
2. Architecture authority conflict between the as-built 16-state process and the FROZEN 45-state generic twin-status architecture.
3. Contract conflict between fail-closed Self-Approval Guard and implemented Self-Appraiser Elision.
4. Exact App 798 Revision Archive schema specifications and deployment evidence status.

---

## 2. Starting Repository Checkpoint

```text
CANONICAL_BRANCH = ai/antigravity-wp002c
STARTING_HEAD = d9082e46d579fccd125cec2b9aceeaa804b959b9
PREVIOUS_COMMIT = docs(d3): review workflow and reopen readiness gaps
WORKTREE = CLEAN
D1 = PASS / CLOSED / DURABLE
D2_ENGINEERING = PASS / CLOSED / DURABLE
D2_OWNER_UAT = IN PROGRESS / PAUSED
D3 = HOLD / NOT AUTHORIZED
D3_IMPLEMENTATION_AUTHORIZED = NO
APP794_LIVE_REVISION = 70
APP794_LIVE_JS = mbo-employee-app.js (blob 204d34db9e2eab297409a6a3d5e7f29c649779d5)
APP794_LIVE_CSS = mbo-employee.css (blob 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61)
```

---

## 3. PRE1 Defects Identified

Independent Control Plane review identified the following material documentation and evidence defects in the initial `D3-PRE1` report:
1. **Invented Workflow State Names**: Used non-existent labels (`02 Pending First Approval`, `03 Pending Second Approval`, `04 Pending CEO Approval`, `06 Mid-term Draft`, etc.) instead of canonical labels from `project-docs/CONFIRMED_BASELINE/ROUTING_WORKFLOW.md`.
2. **Unsupported Architecture Supersession Claim**: Classified the 45-state model as merely "conceptual future" and recommended Option A as if already decided, ignoring that `GENERIC_ROUTING_ARCHITECTURE.md` explicitly declares `GENERIC_ROUTING_ARCHITECTURE = FROZEN`.
3. **Overlooked Self-Appraiser Contract Conflict**: Failed to analyze the direct tension between `ROUTING_WORKFLOW.md` (mandating fail-closed `SELF_APPROVAL_ROUTE_CONFLICT`) and `src/services/routing-service.js` (implementing self-appraiser elision and slot shifting).
4. **Inaccurate App 798 Field Claims**: Listed non-existent field names (`Original_Record_ID`, `Employee_ID`, `Revision_Type`, `Objectives_Snapshot_JSON`, `Competencies_Snapshot_JSON`, `Score_Summary_JSON`) instead of the canonical 15 fields in `config/schema-spec.js`.
5. **Unqualified App 798 Deployment Claim**: Claimed App 798 was deployed without citing canonical repository evidence (`project-docs/APP_REGISTRY.md` line 18, `config/sandbox-apps.json`, and delivery documentation).

---

## 4. Correct 16-State / 28-Action Runtime Truth

From `project-docs/CONFIRMED_BASELINE/ROUTING_WORKFLOW.md` and App 794 Process Management readback:

- **Total States**: 16
- **Total Actions**: 28

### 4.1 Canonical Active M1_G1 Flow
1. **Goal Setting Stage**:
   - `01 Draft Objective` -> [Submit to Manager] -> `03 Manager Objective Review`
   - `03 Manager Objective Review` -> [Approve to GM] -> `04 GM Objective Review`
   - `04 GM Objective Review` -> [Approve Objective] -> `05 Objective Approved`
2. **Mid-Year Review Stage**:
   - `05 Objective Approved` -> [Start Mid-Year] -> `06 Employee Mid-Year`
   - `06 Employee Mid-Year` -> [Submit to Manager] -> `08 Manager Mid-Year Review`
   - `08 Manager Mid-Year Review` -> [Approve to GM] -> `09 GM Mid-Year Review`
   - `09 GM Mid-Year Review` -> [Complete Mid-Year] -> `10 Mid-Year Completed`
3. **Final Evaluation Stage**:
   - `10 Mid-Year Completed` -> [Start Self Evaluation] -> `11 Employee Self Evaluation`
   - `11 Employee Self Evaluation` -> [Submit to Manager] -> `13 Manager Final Evaluation`
   - `13 Manager Final Evaluation` -> [Approve to GM] -> `14 GM Final Evaluation`
   - `14 GM Final Evaluation` -> [Submit to HR] -> `15 HR Final Check`
   - `15 HR Final Check` -> [Complete Evaluation] -> `16 Completed`

### 4.2 First-Manager States (M2 Topology Only)
- `02 First Manager Objective Review`
- `07 First Manager Mid-Year Review`
- `12 First Manager Final Evaluation`
*(These states are inactive in current M1_G1 routes; runtime fails closed if an M1_G1 record attempts to enter a First-Manager path.)*

### 4.3 Canonical Return / Resubmit Paths
- Objective Manager/GM return -> `01 Draft Objective`
- Mid-Year Manager/GM return -> `06 Employee Mid-Year`
- Final Manager/GM return -> `11 Employee Self Evaluation`
- HR Final return -> `11 Employee Self Evaluation`

---

## 5. 16-State vs FROZEN 45-State Authority Analysis

| Attribute | As-Built Runtime (16-State) | Frozen Target Architecture (45-State) |
|---|---|---|
| **Authoritative Document** | `project-docs/CONFIRMED_BASELINE/ROUTING_WORKFLOW.md` | `project-docs/architecture-redesign/GENERIC_ROUTING_ARCHITECTURE.md` |
| **Document Date** | 2026-08-26 (updated 2026-08-30) | 2026-08-24 |
| **Formal Document Status** | `CONFIRMED_BASELINE` | `GENERIC_ROUTING_ARCHITECTURE = FROZEN` |
| **Live App 794 State** | Live Deployed & Verified (Revision 70) | Never Deployed to Any App |
| **Codebase Alignment** | Supported by `validation-engine.js`, `routing-service.js` | Zero supporting code in `src/` |
| **Approval Mechanics** | Fixed named roles (Manager, GM, HR) | 6 generic slots x Twin-status ALL/ANY |
| **Supersession Status** | Not formally superseded | Not formally superseded |

### Classification
`ARCHITECTURE_AUTHORITY_CONFLICT = YES`

Because both documents claim authoritative baseline status in repository truth without an explicit Owner or Control Plane decision superseding either, the choice of canonical release architecture must be formally made by the Human Owner via `DECISION-D3-001`.

---

## 6. Self-Appraiser Elision vs Fail-Closed Authority Analysis

### 6.1 Chronology & Evidence Trace
1. **2026-08-30 12:45 ICT (Commit `dc049ad`)**:
   - `CONFIRMED_BASELINE/ROUTING_WORKFLOW.md` was updated with the Self-Approval Guard:
     > "If an employee's own MBO resolves to the same Kintone user as an Appraiser/Approver, runtime must fail closed: `SELF_APPROVAL_ROUTE_CONFLICT`. Do not silently skip that appraiser, auto-approve, or reinterpret the route. A business exception requires a separate explicit rule and review."
2. **2026-08-30 14:49 ICT (Commit `20747ef`)**:
   - Source implementation in `src/services/routing-service.js` introduced `RoutingService.applyOwnMboSelfAppraiserElision`:
     - Filters out self from approver list.
     - Shifts surviving approvers left.
     - Recalculates topology (e.g., Natta's `M1_G1` route becomes `M1_ONLY`).
     - Fails closed only if zero non-self approvers remain.
3. **2026-08-30 14:58 ICT (Commits `5cc5ea6`, `c20e406`)**:
   - Unit tests added in `tests/d1-hybrid-identity-core-source.test.js` validating the elision behavior.
4. **Document Status**:
   - `CONFIRMED_BASELINE/ROUTING_WORKFLOW.md` was **never amended** to reflect or permit this elision behavior.

### 6.2 Classification
`SELF_APPRAISER_AUTHORITY = UNRESOLVED_CONTRACT_CONFLICT`

A later code commit cannot silently override a frozen baseline contract. This requires an explicit Owner determination via `DECISION-D3-002`.

---

## 7. App 798 Canonical Schema Truth

Authoritative schema in `config/schema-spec.js` (lines 127–143) contains exactly 15 fields:

| Field Code | Field Type | Required | Unique | Constraints / Options |
|---|---|---|---|---|
| `Archive_Key` | `SINGLE_LINE_TEXT` | `true` | `true` | No explicit maxLength declared in schema-spec |
| `Source_Record_ID` | `NUMBER` | `false` | `false` | Kintone record ID of original App 794 record |
| `Source_Record_Key` | `SINGLE_LINE_TEXT` | `true` | `false` | e.g. `FY2027-0149` |
| `Fiscal_Year` | `SINGLE_LINE_TEXT` | `true` | `false` | e.g. `2027` |
| `Employee_Code` | `SINGLE_LINE_TEXT` | `true` | `false` | e.g. `0149` |
| `Evaluation_Stage` | `DROP_DOWN` | `true` | `false` | Options: `OBJECTIVE`, `MIDYEAR`, `FINAL` |
| `Revision_Number` | `NUMBER` | `true` | `false` | Min value `1` |
| `Previous_Status` | `SINGLE_LINE_TEXT` | `false` | `false` | Status string prior to reopen |
| `Superseded_By_Revision` | `NUMBER` | `false` | `false` | Min value `1` |
| `Event_Type` | `SINGLE_LINE_TEXT` | `true` | `false` | Default `EVALUATION_REVISION_CREATED` |
| `Reason` | `MULTI_LINE_TEXT` | `true` | `false` | Justification for reopening |
| `Snapshot_JSON` | `MULTI_LINE_TEXT` | `true` | `false` | Full JSON state snapshot |
| `Snapshot_Hash` | `SINGLE_LINE_TEXT` | `true` | `false` | SHA-256 hash of snapshot |
| `Archived_By` | `USER_SELECT` | `true` | `false` | Actor performing the archival |
| `Archived_At` | `DATETIME` | `true` | `false` | Archival timestamp |

---

## 8. App 798 Deployment Evidence Status

- **Committed Repository Evidence**:
  - `project-docs/APP_REGISTRY.md` (line 18): `798 | Sandbox (Live Deployed / 15 Fields Live Schema Verified) | MBO Revision Archive [Sandbox]`
  - `config/sandbox-apps.json` (line 6): `"revisionArchiveAppId": 798`
  - Delivery sprint documentation records confirming App 798 container creation and 15-field schema deployment.
- **Classification**:
  - `APP798_SANDBOX_STATE = DEPLOYED_AND_PROVEN_BY_COMMITTED_REPOSITORY_EVIDENCE`
  - `APP798_BACKUP_PAYLOAD_CANONICAL_STATUS = NOT_PRESENT_AS_COMMITTED_CANONICAL_FILE`
  - `APP798_EXACT_HISTORICAL_REVISION = NOT_ASSERTED`
  - `ARCHIVE_KEY_CANONICAL_CONSTRAINT = required=true / unique=true / no explicit maxLength declared`

---

## 9. Corrected Reopen/Revision Gap Matrix

| Layer | Requirement | Current State | Gap Classification |
|---|---|---|---|
| **App 798 (Archive)** | 15 Schema Fields | Deployed on Sandbox (15-field schema verified) | Schema exists; requires API write integration |
| **App 794 (Transaction)** | Revision Fields | Missing `Revision_Number`, `Objective_Revision`, `Evaluation_Revision` | **SCHEMA GAP ON APP 794** |
| **Service Layer** | Reopen Request & Approval | 0 lines of code in `src/` | **IMPLEMENTATION GAP (REOPEN-001)** |
| **Service Layer** | Revision Snapshot Generator | 0 lines of code in `src/` | **IMPLEMENTATION GAP (REOPEN-002)** |
| **UI Layer** | Reopen Action Button & Modal | 0 UI components in `src/ui/` | **IMPLEMENTATION GAP** |
| **Test Layer** | Reopen & Versioning Tests | 0 tests in `tests/` | **TEST GAP** |

---

## 10. Owner Decisions Required

### DECISION-D3-001: Workflow Architecture Authority
- **Option A**: Adopt current **16-State / 28-Action Model** (`ROUTING_WORKFLOW.md`) as canonical for D3 V1; formally defer/supersede the 45-state generic architecture for the current release.
  - *Pros*: Aligns with live App 794 Rev 70; bounded delivery scope (WPs D3-01 to D3-08); zero Kintone Process rebuild.
  - *Cons*: Retains fixed role structure rather than multi-tenant generic slots.
- **Option B**: Retain **45-State Generic Twin-Status Model** (`GENERIC_ROUTING_ARCHITECTURE.md`) as the canonical target; treat current 16-state process as interim requiring migration.
  - *Pros*: Delivers the long-term generic engine.
  - *Cons*: Massive scope overhaul (8–12 WPs); high regression risk; requires rewriting App 794 Process Management and all workflow validation code.

### DECISION-D3-002: Own-MBO Self-Appraiser Handling
- **Option A**: **Fail Closed with `SELF_APPROVAL_ROUTE_CONFLICT`** (`ROUTING_WORKFLOW.md`).
  - *Pros*: Strictly complies with frozen baseline; prevents any automated reassignment.
  - *Cons*: Requires manual HR route intervention for managers' own MBOs.
- **Option B**: **Owner-Approved Self-Appraiser Elision with Slot Shifting** (`src/services/routing-service.js`).
  - *Pros*: Matches current working implementation; enables seamless manager own-MBO submission.
  - *Cons*: Requires formal baseline document amendment to supersede the fail-closed rule in `ROUTING_WORKFLOW.md`.

---

## 11. D3 Readiness After Corrective

```text
D3_READINESS = OWNER_DECISION_REQUIRED
D3 = HOLD / NOT AUTHORIZED
D3_IMPLEMENTATION_AUTHORIZED = NO
```

Stage D3 cannot be authorized for implementation until the Human Owner makes formal determinations on `DECISION-D3-001` and `DECISION-D3-002`.

---

## 12. Safety / No-Execution Accounting

```text
SOURCE_FILES_CHANGED = 0
TEST_FILES_CHANGED = 0
SCRIPT_FILES_CHANGED = 0
DIST_FILES_CHANGED = 0
CONFIG_FILES_CHANGED = 0
PACKAGE_FILES_CHANGED = 0

TEST_EXECUTION_PERFORMED = NO
BUILD_PERFORMED = NO
DEPLOYMENT_PERFORMED = NO
KINTONE_READS = 0
KINTONE_WRITES = 0
PROCESS_TRANSITIONS = 0
D3_IMPLEMENTATION = NO

D1_STATUS = PASS / CLOSED / DURABLE
D2_STATUS = PASS / CLOSED / DURABLE (Owner UAT Paused)
D3_STATUS = HOLD / NOT AUTHORIZED
PRODUCTION_READY = NO
```
