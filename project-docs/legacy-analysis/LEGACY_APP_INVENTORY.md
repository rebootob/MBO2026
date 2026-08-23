# Legacy PMS Application Inventory & Evaluation Profiles

> **Document Status:** Complete (Discovery Phase)  
> **System Scope:** All Legacy PMS Applications (Apps 283, 305, 307, 310, 640, 643, 715, 716)  
> **Reference Master:** App 53 (Employee Master - Read Only)  
> **Last Updated:** 2026-08-23  

---

## 1. Executive Summary: The 8 Legacy PMS Applications

Through rigorous inspection of Kintone Form Schemas, Process Management configurations, attached JavaScript customizations, and official Excel templates, the 8 legacy evaluation groups are identified as follows:

| App ID | Legacy App Name | Evaluation Group / Target Role | Field Count | Workflow Statuses | Process Actions | Excel PART A Template | Excel PART B Template | Remarks |
| :---: | :--- | :--- | :---: | :---: | :---: | :--- | :--- | :--- |
| **283** | PMS Staff & Chief | Staff & Chief (Local Staff) | 133 | 95 | 384 | `exp/PMS_Staff & Chief_PART_A.xlsx` | `exp/PMS_Staff & Chief_PART_B.xlsx` | Base baseline for V2 pilot; 70/30 weight split |
| **305** | PMS Sect.Mgr | Section Manager | 141 | 71 | 195 | `305/PMS Asst.Sect.Mgr.&Specialist_Part_A.xlsx` | `305/PMS Asst.Sect.Mgr.&Specialist_Part_B.xlsx` | Management Group; 2-Appraiser Model; 50/50 split |
| **307** | PMS DGM | Deputy General Manager | 141 | 37 | 109 | `307/PMS GM_Part_A.xlsx` | `307/PMS GM_Part_B.xlsx` | Senior Leadership Group; GM Template |
| **310** | PMS Assistant Manager | Assistant Manager & Specialist | 141 | 80 | 230 | `310/PART A.xlsx` | `310/PART B.xlsx` | Middle Management Group; 60/40 or 50/50 split |
| **640** | PMS GM | General Manager | 106 | 11 | 16 | `640/PMS GM_Part A.xlsx` | `640/PMS GM_Part B.xlsx` | Executive Group; VP / President Approval Chain |
| **643** | PMS Senior Manager | Senior Manager | 141 | 15 | 27 | `643/PART A.xlsx` | `643/PART B.xlsx` | Senior Management Group |
| **715** | PMS VP | Vice President | 106 | 11 | 15 | `715/PMS VP_Part_A_20260823223329.xlsx` | `715/PMS VP_Part_B_20260823223342.xlsx` | Executive Board Group; President Final Approval |
| **716** | Japan Staff | Expatriate / Japanese Staff | 133 | 42 | 100 | `716/PMS_Japan Staff_Part_A_20260823222555.xlsx` | `716/PMS_Japan Staff_PART_B_20260823222607.xlsx` | Expatriate Group; 70/30 split; Dual Language Labels |

---

## 2. Structural & Architectural Findings Across Legacy Apps

1. **High Schema Redundancy:** Over 85% of field codes across all 8 apps share identical naming conventions (`obj1`, `obj2`, `obj3`, `obj4`, `weight_obj1`, `mbo_point_obj1`, etc.).
2. **Process Management Explosion:** Apps 283, 305, and 310 have huge state machines (up to 95 states and 384 actions) caused by combinatorial explosion of hardcoded section-based action routing.
3. **Hardcoded App Segregation:** The legacy architecture created a separate Kintone App for each corporate rank/position rather than using a single transaction app with configuration-driven evaluation profiles.
