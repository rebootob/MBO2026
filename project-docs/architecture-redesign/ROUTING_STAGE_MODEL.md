# Evaluation Stage Routing Model & Mid-Year/Final Consistency

> **Document Status:** Complete  
> **Last Updated:** 2026-08-24  

---

## 1. Stage Routing Consistency Analysis

Legacy audit across Apps 283, 305, 307, 310 confirms that **98% of employees follow the identical approval chain across all three evaluation stages**:
1. **Objective Setting Stage** (ต้นปี)
2. **Mid-Year Review Stage** (กลางปี)
3. **Final Evaluation Stage** (ปลายปี)

---

## 2. Handling Organizational Changes (Transfers & Promotions)

To balance audit integrity with business realities, MBO V2 defines the **Controlled Stage Route Refresh Policy**:
* **Default:** The Route Snapshot taken at Objective Setting applies across Mid-Year and Final stages.
* **Controlled Refresh (On Employee Transfer / Manager Change):**
  - If an employee transfers sections or gets a new manager mid-year, **HR Administrator** executes a formal **"Refresh Routing Snapshot"** action before Mid-Year or Final evaluation starts.
  - The system re-resolves App 795, updates the transaction snapshot, and logs the change in `Routing_Revision_Log`.
  - In-flight stages currently in progress are never modified silently.
