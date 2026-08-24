# Routing Versioning & Historical Immutability Blueprint

> **Document Status:** Complete (Updated with In-Flight Reassignment Rules)  
> **Last Updated:** 2026-08-24  

---

## 1. Versioning Rules for App 795 Routing Master

1. **Annual Route Initialization:** Routes are configured with `Fiscal_Year` applicability (e.g. `FY2026`, `FY2027`).
2. **Version Incrementation:** When an organizational chain changes for an upcoming FY, a new version is created (`Version 2`).
3. **Historical Isolation:** Completed historical transaction records in App 794 (e.g. FY2026) permanently retain their `Snapshot_Step_X_Approvers`. Modifying App 795 will never alter completed historical evaluations.
4. **In-Flight Reassignment Independence:** In-flight single-record reassignment modifies only the current transaction record's effective assignees and does NOT increment or mutate the Master App 795 version.
