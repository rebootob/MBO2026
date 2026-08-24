# Open Issues & Governance Dependencies

| Issue / Dependency ID | Title | Category | Status | Impact / Boundary | Action Required |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SEC-DEP-001** | Shared Kintone Account Security Conflict | Security Architecture (`DEC-039`) | **OPEN DEPENDENCY** | Employee Self-Service Record Isolation | Establish a deterministic secure binding mechanism (`Authenticated Identity -> Employee_Code -> Authorized Record`) before Employee Self-Service go-live. Native permissions cannot distinguish users sharing the same account login. |
| **MIG-GOV-001** | Legacy 8-App PMS Data Migration Strategy | Migration Architecture (`DEC-040`) | **DEFERRED** | Legacy Historical Evidence | Migration of historical data from Apps 283, 305, 307, 310, 640, 643, 715, 716 is deferred until MBO V2 is stable, tested, verified, and UAT approved. Mandatory dry-run & reconciliation required. |
| **ISSUE-002** | Excel Export Template Expansion (5-10 items) | Technical Design | PENDING | Excel Export Phase | Implement row expansion or overflow sheet for 5-10 objectives in Export phase. |
