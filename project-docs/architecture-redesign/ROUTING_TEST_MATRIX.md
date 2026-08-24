# Generic Routing Architecture Test Matrix (FROZEN)

> **Architecture Status:** **`FROZEN`**  
> **Scenarios Defined:** **35 Architecture & Implementation Test Scenarios (`RT-001` to `RT-035`)**  
> **Current Automated Unit Tests:** **32/32 Tests Passing (`npm test`)**  
> **Last Updated:** 2026-08-24  

---

## 1. Test Metrics Clarification
* **Architecture Scenarios Defined:** **35 Scenarios** (Full specifications defined below for Phase 2 Implementation verification).
* **Automated Unit Tests Executed in Phase 1:** **32 Tests Executed & Passing (100%)**.

---

## 2. Master Test Matrix Table (RT-001 to RT-035)

| Test ID | Test Scenario Description | Target Topology / Condition | Expected Execution Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **RT-001** | Standard 2-Step Route | Manager L1 -> GM | Slots 1 & 2 active; Slots 3-6 bypassed | SPECIFIED |
| **RT-002** | 3-Step Management Route | Manager L1 -> Manager L2 -> GM | Slots 1, 2, 3 active; Slots 4-6 bypassed | SPECIFIED |
| **RT-003** | 4-Step Executive Route | GM -> VP -> President -> HR | Slots 1, 2, 3 active; HR Final Check | SPECIFIED |
| **RT-004** | 3-Step Direct Exec Route | GM -> VP -> President | Slots 1, 2, 3 active; direct executive chain | SPECIFIED |
| **RT-005** | 2-Step Executive Route | GM -> President | Slots 1 & 2 active; VP bypassed | SPECIFIED |
| **RT-006** | 1-Step President Route | Employee -> President | Slot 1 active (President); Slots 2-6 bypassed | SPECIFIED |
| **RT-007** | Japanese Expat Route | 1st Appraiser -> 2nd Appraiser | Slots 1 & 2 active (Japan evaluators) | SPECIFIED |
| **RT-008** | Multi-Approver Slot (ALL) | Step 1 has [UserA, UserB], Rule = ALL | Workflow advances only after BOTH approve | SPECIFIED |
| **RT-009** | Multi-Approver Slot (ANY) | Step 1 has [UserA, UserB], Rule = ANY | Workflow advances immediately after EITHER approves | SPECIFIED |
| **RT-010** | Optional Step Bypass | Step 2 is inactive/empty | Workflow skips from Step 1 directly to Step 3 | SPECIFIED |
| **RT-011** | Required Step Missing Approver | Step 2 marked Required but empty | System enters `ROUTING_CONFIGURATION_ERROR` & blocks | SPECIFIED |
| **RT-012** | Return to Previous Step | Approver at Step 3 clicks Return | Assignee returns to Step 2 approvers | SPECIFIED |
| **RT-013** | Return to Employee Draft | Approver at Step 1 clicks Return | Assignee returns to Employee in `01 Draft Objective` | SPECIFIED |
| **RT-014** | Annual Route Version Change | FY2026 v1 -> FY2027 v2 | FY2026 retains v1 snapshot; FY2027 resolves v2 | SPECIFIED |
| **RT-015** | In-flight Route Immutability | Master changes while in Step 2 | Current in-flight transaction retains original snapshot | SPECIFIED |
| **RT-016** | Shared Requester Account | Admin user enters for Section | System verifies authorized requester mapping | SPECIFIED |
| **RT-017** | Unauthorized Requester Attempt | Non-authorized user attempts save | System blocks save with `UNAUTHORIZED_REQUESTER` | SPECIFIED |
| **RT-018** | Mid-Year Employee Transfer | Employee transfers section mid-year | HR executes Controlled Route Refresh before Mid-Year | SPECIFIED |
| **RT-019** | Promotion Profile Change | Staff promoted to Section Mgr | New profile resolves Executive Route topology | SPECIFIED |
| **RT-020** | Maximum Capacity Route | Full 6-Step Chain | All 6 Slots execute in sequence -> HR Check | SPECIFIED |
| **RT-021** | Route Exceeds Capacity | 7 Approval Steps configured | Admin validation blocks save (`EXCEEDS_MAX_CAPACITY`) | SPECIFIED |
| **RT-022** | Missing Route Configuration | Employee section not in Master | Displays *พบข้อมูลพนักงานแล้ว แต่ยังไม่ได้ตั้งค่าเส้นทางอนุมัติ* | SPECIFIED |
| **RT-023** | Inactive Approver Detection | Approver resigned / disabled | Validation alerts HR to update routing master | SPECIFIED |
| **RT-024** | Historical Audit Integrity | View closed FY2024 record | Displays historical route snapshot unchanged | SPECIFIED |
| **RT-025** | In-Flight Single Approver Reassignment | Manager A resigned during Mid-Year | HR reassigns Manager A -> Manager B on current record | SPECIFIED |
| **RT-026** | Master Change vs In-Flight Immutability | Master edited while Step 2 active | Active record remains unaffected; future stages use new master | SPECIFIED |
| **RT-027** | Inactive Approver Reassignment | Active approver disabled in Kintone | HR successfully reassigns to active substitute | SPECIFIED |
| **RT-028** | ALL Rule Replace Pending Approver | Slot has [A, B, C], Rule=ALL; B replaced | Slot updates to [A, D, C], Rule remains ALL | SPECIFIED |
| **RT-029** | Partial ALL Approval with Reassignment | [A, B, C]; A approved; B replaced by D | A's approval kept; D assigned; C remains pending | SPECIFIED |
| **RT-030** | ANY Rule Reassignment Before Action | Slot has [A, B], Rule=ANY; A replaced | Slot updates to [D, B]; either D or B can approve | SPECIFIED |
| **RT-031** | Reassignment Blocked on Completed Stage| HR attempts reassign on closed stage | System rejects operation (`STAGE_ALREADY_COMPLETED`) | SPECIFIED |
| **RT-032** | Unauthorized Reassignment Attempt | Non-HR user attempts reassignment API | Kintone server-side permission denies request (403) | SPECIFIED |
| **RT-033** | Reassignment Audit Trail Capture | Execute Reassignment | Audit log records old/new/reason/by/timestamp | SPECIFIED |
| **RT-034** | Native Assignee & Snapshot Consistency | Reassign executed | Native Kintone assignee and UI snapshot match 100% | SPECIFIED |
| **RT-035** | Current Record Only Scope Guarantee | Reassign executed with default scope | Target record updated; App 795 master remains unchanged | SPECIFIED |
