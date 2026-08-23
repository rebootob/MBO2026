# Profile & Routing Dynamic Resolution Flow

> **Document Status:** Proposed  
> **Last Updated:** 2026-08-23  

---

## 1. Resolution Sequence Diagram

```
User types Employee Code (e.g. "0149")
                 |
                 v
[STEP 1: App 53 Employee Master Query]
 └── Returns: Position ("Marketing Chief"), Section ("TME1"), Department ("Eco Energy")
                 |
                 v
[STEP 2: App 796 Evaluation Profile Resolution]
 └── Matches: Position "Marketing Chief" -> Profile "PROF_STAFF" (70/30 split, Core Competencies)
                 |
                 v
[STEP 3: App 795 Generic Routing Resolution]
 └── Matches: Section "TME1" + Profile "PROF_STAFF" -> Route "ROUTE_TME1_STAFF" (suthas -> somrudee)
                 |
                 v
[STEP 4: Snapshot Injection into App 794 Record]
 └── Injects immutable snapshots: Profile_Code, Weights, Competencies, Step Approvers
                 |
                 v
[STEP 5: UI Grid & Scoring Runtime Unlocked]
 └── Dynamic Part A Grid rendered with exact profile constraints
```
