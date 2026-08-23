# Immutable Record Snapshot Architecture

> **Document Status:** Proposed  
> **Last Updated:** 2026-08-23  

---

## 1. Purpose & Governance
To ensure audit compliance and prevent retroactive scoring corruption when HR updates Master Apps in future years (`FY2027+`), every record in App 794 stores an immutable JSON / Field snapshot of its active configuration:

* `Snapshot_Evaluation_Profile_Code`: `PROF_STAFF`
* `Snapshot_Evaluation_Profile_Version`: `1.0`
* `Snapshot_Part_A_Weight`: `70`
* `Snapshot_Part_B_Weight`: `30`
* `Snapshot_Competency_Set_Version`: `COMP_SET_CORE_5_v1`
* `Snapshot_Routing_Version`: `ROUTE_TME1_STAFF_v1`
* `Snapshot_Approver_Chain`: `[{"step": 1, "users": ["suthas"], "rule": "ALL"}, {"step": 2, "users": ["somrudee"], "rule": "ALL"}]`
