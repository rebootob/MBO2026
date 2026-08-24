# Evaluation Profile Resolution Engine Blueprint

> **Document Status:** Complete  
> **Last Updated:** 2026-08-24  

---

## 1. Deterministic Priority Resolution Hierarchy

When an employee MBO record is initialized or refreshed, the Profile Resolution Engine executes a 3-tier deterministic lookup:

```mermaid
graph TD
    START["Resolve Employee Profile"] --> P1{"Tier 1: Individual Employee Exception?"}
    P1 -- YES --> USE_P1["Apply Specific Employee Profile Override"]
    P1 -- NO --> P2{"Tier 2: Specific Position Mapping in App 53?"}
    P2 -- YES --> USE_P2["Apply Position Profile (e.g. Section Manager)"]
    P2 -- NO --> P3{"Tier 3: Employee Group Mapping (e.g. Staff)?"}
    P3 -- YES --> USE_P3["Apply Group Default Profile"]
    P3 -- NO --> ERR["Raise ROUTING_CONFIGURATION_ERROR"]
```

---

## 2. Resolution Output & Snapshot Binding
Upon successful resolution, the engine returns the exact `Profile_Code` and `Profile_Version`, which is immediately locked into App 794's immutable transaction snapshot fields.
