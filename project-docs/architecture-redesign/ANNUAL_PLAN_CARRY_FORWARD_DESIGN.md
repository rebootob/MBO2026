# Annual Plan Carry Forward Architecture Blueprint

> **Document Status:** Active (Confirmed Requirement)  
> **Feature Name:** Annual Plan Carry Forward (`นำแผนจากปีก่อนมาใช้ / Carry Forward Previous Plan`)  
> **Core Architectural Security:** Strict Explicit Field Whitelist (Never Clone Entire Record)  
> **Last Updated:** 2026-08-23  

---

## 1. Executive Summary & Core Principle

The **Annual Plan Carry Forward** subsystem enables employees to selectively reuse planning and objective data from a previous Japanese Fiscal Year (e.g. `FY2026: 1 April 2026 - 31 March 2027`) as the draft starting baseline for the current Fiscal Year (e.g. `FY2027: 1 April 2027 - 31 March 2028`).

### Critical Architectural Mandate: No Record Cloning
* **Strictly Prohibited:** Full record duplication or cloning of Kintone records.
* **Permitted:** Selective, user-approved extraction of employee-owned planning content only.
* **Zero Historical Bleed:** Historical scores, appraiser ratings, internal comments, workflow stamps, and old configuration snapshots are permanently barred from entering the new fiscal year transaction.

```mermaid
graph TD
    subgraph Historical [Source: FY2026 Historical Record (READ ONLY)]
        SRC_OBJ[Objective & Action Plan Content]
        SRC_REST[Scores, Ratings, Workflow, Old Routing, Comments]
    end

    SRC_OBJ -->|Explicit Field Whitelist Filter| SERVICE[Carry Forward Service]
    SRC_REST -.->|PERMANENTLY BLOCKED| SERVICE

    subgraph Current [Target: FY2027 Current FY Draft]
        SERVICE -->|User Confirmed: Append / Replace| TARGET_DRAFT[Draft Objectives 1..N]
        
        MASTERS[App 796 / 797 / 795 Masters] -->|Resolve Fresh Configuration| TARGET_CONFIG[Current FY Profile, Weights, Competencies, Routing]
        TARGET_CONFIG --> TARGET_DRAFT
    end
```

---

## 2. Explicit Field Whitelist vs. Blocked Categories

### A. The Strict Allow List (Only Fields Permitted for Carry Forward)
| Field Identifier | Description | Default Behavior | Editable After Copy? |
| :--- | :--- | :---: | :---: |
| `Objective_i` | MBO Goal Statement | **Allowed** | Yes |
| `Action_Plan_i` | Execution Steps / Milestones | **Allowed** | Yes |
| `Additional_Agreement_i` | Planning Remarks / Assumptions | **Allowed** | Yes |
| `Weight_i` | Objective Weight Percentage | **Allowed** | Yes (Must sum to 100%) |
| `Difficulty_i` | Difficulty Rating (1-4) | **Disabled by Default** (`Carry_Forward_Difficulty = false`) | Yes |

### B. Strict Never-Copy Block List (Strictly Prohibited)
1. **Mid-Year Data:** Progress %, Periodical Review, Mid-Year Risk/Issues, Evidence files.
2. **Year-End Data:** Actual Results, Self-Evaluation score, Self Comments, Evidence attachments.
3. **Appraiser / Confidential Data:** Manager score/ratings/internal comments, GM score/ratings/comments, VP/President evaluations, Part B ratings.
4. **Calculated Scores:** Raw score, Weighted score, Average score, Final score.
5. **Workflow & Audit:** Workflow status, Assignees, Approval action history, Return logs, Approval timestamps/dates.
6. **Routing & Approvers:** Previous Manager user, GM user, VP user, Approver chain snapshot.
7. **System Snapshots:** Previous Evaluation Profile version, Scoring scheme version, Competency set version.
8. **Record Identifiers:** Record ID, Record Key (`FY2026-0149` must never overwrite `FY2027-0149`), Created by/at.

---

## 3. "New Year Configuration Must Win" Dynamic Resolution

When an employee carries forward planning data, the system forces a full fresh configuration resolution for the Target Fiscal Year:

```
[User Selects Carry Forward]
             |
             v
[Step 1: Extract Whitelisted Planning Fields from Source FY]
 └── Objective text, Action plans, Weights
             |
             v
[Step 2: Resolve Target FY Master Configuration]
 ├── Query App 53: Current Employee Position & Section
 ├── Query App 796: Target Evaluation Profile (e.g. Asst. Mgr 50/50 split)
 ├── Query App 797: Target Competency Set & COCE (`Included_In_Score = false`)
 └── Query App 795: Target Sequential Approval Routing (e.g. Current Manager & GM)
             |
             v
[Step 3: Inject Into Target Draft with Fresh Record Key]
 └── Record Key: `{Current_Cycle_Code}-{Employee_Code}` (Preserving Leading Zeroes: `0149`)
```

### Promotion / Role Change Scenario
* If an employee was **Staff & Chief** in FY2026 (70/30 weight split) and promoted to **Assistant Manager** in FY2027 (50/50 weight split):
* The system carries forward the chosen objective statements.
* The system automatically applies the **Assistant Manager Profile (50/50 split)** of FY2027.
* **UI Notification:** *"Your evaluation profile has changed. Only planning information will be carried forward. Current-year evaluation rules will be applied."*

---

## 4. UI Interaction Flow & Objective Selection

1. **Initial Evaluation Screen:**
   * Choice displayed: `[ เริ่มต้นแผนงานใหม่ / Start New Plan ]` or `[ นำแผนจาก FY2026 มาใช้ / Carry Forward Previous Plan ]`.
2. **Granular Objective Selector Modal:**
   * Checkboxes for each historical objective (e.g., `[x] Objective 1`, `[ ] Objective 2`, `[x] Objective 3`).
   * Displays preview of allowed fields (Objective, Action Plan, Weight) vs. blocked fields.
3. **Conflict Handling on Existing Target Draft:**
   * If Target Record already has draft objectives entered, system prompts:
     - `[A: เพิ่มต่อจากข้อมูลเดิม / Append]` (Validated against Target Profile `Objective_Max`, up to 10).
     - `[B: แทนที่ข้อมูล Draft / Replace Draft]` (Clears planning fields only; preserves system routing & profile).
     - `[C: ยกเลิก / Cancel]`.
4. **Weight Validation Guard:**
   * If partial objectives are selected and sum of weights != 100%, UI allows draft editing but renders warning: *"ผลรวมน้ำหนักยังไม่เท่ากับ 100% กรุณาปรับก่อนส่งอนุมัติ / Total weight must equal 100% before submission"*. Submit action remains blocked until sum = 100%.

---

## 5. Security Boundary & Shared Account Verification

1. **Identity Integrity:**
   * Source Employee Code must strictly match Target Employee Code.
   * Cross-employee carry forward (e.g. Employee `0149` carrying from Employee `0150`) is rejected.
   * Preserves full leading zeroes on string comparisons (`"0149"` == `"0149"`).
2. **Workflow Stage Gate:**
   * Carry Forward is permitted **ONLY** when Target Record Status is `NEW_RECORD` or `01 DRAFT OBJECTIVE`.
   * The moment the record is submitted for Manager Review, Carry Forward is permanently disabled.
3. **Idempotency & Double-Click Guard:**
   * Client and Service enforce single-execution transaction tokens to prevent duplicate objective creation on network retries.

---

## 6. Audit Trail Metadata Architecture

Target records log complete, non-confidential audit metadata:

```json
{
  "Carry_Forward_Used": "YES",
  "Carry_Forward_Source_Cycle": "CYC_FY2026",
  "Carry_Forward_Source_Record_Key": "FY2026-0149",
  "Carry_Forward_At": "2027-04-05T09:30:00Z",
  "Carry_Forward_By": "suthas",
  "Carry_Forward_Mode": "REPLACE",
  "Carry_Forward_Objective_Count": 3
}
```

---

## 7. Verification Test Suite Matrix (20 Test Cases)

| Test ID | Test Scenario Description | Expected Outcome |
| :---: | :--- | :--- |
| **CF-001** | Standard Carry Forward from FY2026 to FY2027 | Objectives, action plans, and weights copied cleanly to draft |
| **CF-002** | Selective Objective copy (e.g. Obj 1 & 3 only) | Only selected 2 items populated; unselected items omitted |
| **CF-003** | Weight sum != 100% after partial copy | Draft saved with warning banner; submit action blocked |
| **CF-004** | Target Objective Limit exceeded on Append | System blocks append exceeding `Objective_Max` (10 items) |
| **CF-005** | Employee Promoted (Staff -> Asst Mgr) | Planning copied; Target 50/50 weight and management profile applied |
| **CF-006** | Routing Changed between Fiscal Years | FY2027 fresh routing resolved; FY2026 approvers discarded |
| **CF-007** | Manager Score & Ratings isolation check | All manager scores, ratings, and comments remain empty in target |
| **CF-008** | GM Score & Comments isolation check | All GM evaluation fields remain completely empty |
| **CF-009** | COCE Rating isolation check | COCE rating is never copied from source record |
| **CF-010** | Workflow Status isolation check | Target status remains `01 Draft Objective` |
| **CF-011** | Approval Timestamp isolation check | All approval dates and stamps are null |
| **CF-012** | Source Record Read-Only integrity | Source record unchanged (hash/timestamp verification) |
| **CF-013** | Cross-Employee copy rejection | Error thrown if `Source.Employee_Code !== Target.Employee_Code` |
| **CF-014** | Shared Requester Account safety | Verified Employee Profile must match both source and target |
| **CF-015** | Double-click / Network retry protection | Idempotent token prevents duplicate objective insertion |
| **CF-016** | Carry Forward blocked after submission | Feature disabled once Status advances beyond Draft |
| **CF-017** | Append Mode execution | New objectives inserted sequentially after existing draft items |
| **CF-018** | Replace Draft Mode execution | Draft objectives replaced; system routing and profile untouched |
| **CF-019** | Leading Zero Employee Code preservation | Code `"0149"` preserved in Record Key `FY2027-0149` |
| **CF-020** | Current FY Configuration Supremacy | Target FY weights, competency sets, and rules override source |
