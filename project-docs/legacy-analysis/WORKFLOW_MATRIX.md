# Workflow & Approval Chain Comparison Matrix

> **Document Status:** Complete (Discovery Phase)  
> **Last Updated:** 2026-08-23  

---

## 1. Approval Chains Across the 8 Legacy Applications

Through analysis of `processManagement` definitions in all 8 discovery files, the approval hierarchies fall into 4 distinct chains:

```
[ CHAIN 1: STAFF / JAPANESE (Apps 283, 716) ]
Employee (01 Draft)
  |
  v
1st Appraiser: Manager (03 Mgr Review)
  |
  v
2nd Appraiser: General Manager (04 GM Review)
  |
  v
Final Status: 05 Objective Approved -> (Mid-Year) -> (Final HR Check)

-----------------------------------------------------------------

[ CHAIN 2: ASST. MGR / SECTION MGR / SENIOR MGR (Apps 310, 305, 643) ]
Employee (Draft)
  |
  v
1st Appraiser: Section Manager / DGM
  |
  v
2nd Appraiser: General Manager (GM)
  |
  v
3rd Appraiser / Endorser: Vice President (VP)
  |
  v
Final Status: Approved

-----------------------------------------------------------------

[ CHAIN 3: DEPUTY GM / GENERAL MANAGER (Apps 307, 640) ]
Employee (GM / DGM)
  |
  v
1st Appraiser: Vice President (VP)
  |
  v
2nd Appraiser: President / Managing Director
  |
  v
Final Status: Approved

-----------------------------------------------------------------

[ CHAIN 4: VICE PRESIDENT (App 715) ]
Vice President (Draft)
  |
  v
Sole Appraiser: President / MD
  |
  v
Final Status: Approved
```

---

## 2. Key Takeaways for Generic Routing Architecture

1. **Approval Chain Length Varies:** Ranges from **1 Step** (VP -> President) up to **4 Steps** (Staff -> Mgr L1 -> Mgr L2 -> GM -> VP).
2. **Fixed Roles Cause Breakage:** Hardcoding field names like `Manager_User` or `GM_User` fails when evaluating higher management where the approvers are `VP` and `President`.
3. **Requirement for Step-Based Generic Model:** A generic step model (`Step_10`, `Step_20`, `Step_30`, `Step_40`) with dynamic role assignment is necessary to support all 8 profiles seamlessly.
