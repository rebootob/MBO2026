# Architectural Decision Matrix: One App vs. Hybrid vs. Multiple Apps

> **Document Status:** Proposed  
> **Last Updated:** 2026-08-23  

---

## 1. Evaluation of Options

| Evaluation Criteria | Option A: Unified MBO Core (1 App + Master Profiles) [RECOMMENDED] | Option B: Hybrid (2-3 Apps by Family) | Option C: Multiple Apps (8 Separate Legacy Style Apps) |
| :--- | :---: | :---: | :---: |
| **Schema Similarity** | **HIGH (85% identical fields)** | Medium | Low (Extreme duplication) |
| **Maintenance & Code Quality** | **Single Codebase & 1 Custom UI** | 2-3 Codebases | 8 Separate Codebases |
| **Security & Privacy Enforcement** | **High (Native Field Permissions per Stage)** | High | High |
| **Process Management Complexity** | **Low (Generic Steps, < 15 states)** | Medium | Extreme (Up to 384 actions/app) |
| **Future Fiscal Year Scalability** | **Instant (Change Master Config in App 796)** | Requires multiple schema updates | Requires modifying 8 apps |
| **Kintone Field Limit Safety** | **Safe (~110 core fields with 10 objectives)** | Safe | Safe |
| **User Experience (Single Portal)** | **Seamless (1 App for all ranks)** | Disjointed | Disjointed |

---

## 2. Final Architectural Recommendation

**RECOMMENDATION: OPTION A (Unified MBO Core + Configuration Masters)**  
* **Rationale:** Since 85%+ of field definitions and the core 4x5 difficulty matrix logic are identical across all 8 apps, segregating by application was a legacy antipattern. A configuration-driven profile model allows TTMET to support all current corporate ranks and add future ranks without code changes or new Kintone apps.
