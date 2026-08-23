# Generic Routing Architecture Test Matrix (24 Scenarios)

> **Document Status:** Complete (Architecture Test Blueprint)  
> **Coverage:** All 5 Routing Families, Edge Cases, Security, and Versioning  
> **Last Updated:** 2026-08-24  

---

## 1. Test Matrix Table

| Test ID | Test Scenario Description | Target Topology / Condition | Expected Execution Result | Pass Criteria |
| :--- | :--- | :--- | :--- | :---: |
| **RT-001** | Standard 2-Step Route | Manager L1 -> GM | Slots 1 & 2 active; Slots 3-6 bypassed | PASS |
| **RT-002** | 3-Step Management Route | Manager L1 -> Manager L2 -> GM | Slots 1, 2, 3 active; Slots 4-6 bypassed | PASS |
| **RT-003** | 4-Step Executive Route | GM -> VP -> President -> HR | Slots 1, 2, 3 active; HR Final Check | PASS |
| **RT-004** | 3-Step Direct Exec Route | GM -> VP -> President | Slots 1, 2, 3 active; direct executive chain | PASS |
| **RT-005** | 2-Step Executive Route | GM -> President | Slots 1 & 2 active; VP bypassed | PASS |
| **RT-006** | 1-Step President Route | Employee -> President | Slot 1 active (President); Slots 2-6 bypassed | PASS |
| **RT-007** | Japanese Expat Route | 1st Appraiser -> 2nd Appraiser | Slots 1 & 2 active (Japan evaluators) | PASS |
| **RT-008** | Multi-Approver Slot (ALL) | Step 1 has [UserA, UserB], Rule = ALL | Workflow advances only after BOTH approve | PASS |
| **RT-009** | Multi-Approver Slot (ANY) | Step 1 has [UserA, UserB], Rule = ANY | Workflow advances immediately after EITHER approves | PASS |
| **RT-010** | Optional Step Bypass | Step 2 is inactive/empty | Workflow skips from Step 1 directly to Step 3 | PASS |
| **RT-011** | Required Step Missing Approver | Step 2 marked Required but empty | System enters `ROUTING_CONFIGURATION_ERROR` & blocks | PASS |
| **RT-012** | Return to Previous Step | Approver at Step 3 clicks Return | Assignee returns to Step 2 approvers | PASS |
| **RT-013** | Return to Employee Draft | Approver at Step 1 clicks Return | Assignee returns to Employee in `01 Draft Objective` | PASS |
| **RT-014** | Annual Route Version Change | FY2026 v1 -> FY2027 v2 | FY2026 retains v1 snapshot; FY2027 resolves v2 | PASS |
| **RT-015** | In-flight Route Immutability | Master changes while in Step 2 | Current in-flight transaction retains original snapshot | PASS |
| **RT-016** | Shared Requester Account | Admin user enters for Section | System verifies authorized requester mapping | PASS |
| **RT-017** | Unauthorized Requester Attempt | Non-authorized user attempts save | System blocks save with `UNAUTHORIZED_REQUESTER` | PASS |
| **RT-018** | Mid-Year Employee Transfer | Employee transfers section mid-year | HR executes Controlled Route Refresh before Mid-Year | PASS |
| **RT-019** | Promotion Profile Change | Staff promoted to Section Mgr | New profile resolves Executive Route topology | PASS |
| **RT-020** | Maximum Capacity Route | Full 6-Step Chain | All 6 Slots execute in sequence -> HR Check | PASS |
| **RT-021** | Route Exceeds Capacity | 7 Approval Steps configured | Admin validation blocks save (`EXCEEDS_MAX_CAPACITY`) | PASS |
| **RT-022** | Missing Route Configuration | Employee section not in Master | Displays *พบข้อมูลพนักงานแล้ว แต่ยังไม่ได้ตั้งค่าเส้นทางอนุมัติ* | PASS |
| **RT-023** | Inactive Approver Detection | Approver resigned / disabled | Validation alerts HR to update routing master | PASS |
| **RT-024** | Historical Audit Integrity | View closed FY2024 record | Displays historical route snapshot unchanged | PASS |
