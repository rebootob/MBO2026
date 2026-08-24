# Implementation Dependency & Critical Path Map

> **Document Status:** Complete  
> **Last Updated:** 2026-08-24  

---

## 1. Technical Dependency Chain

```mermaid
graph TD
    APP53["App 53 (Employee Master)"] --> P2["Phase 2: Annual Record Foundation"]
    P2 --> P3["Phase 3: Evaluation Profile & Scoring"]
    P2 --> P4["Phase 4: Hoshin Governance Gate"]
    P2 --> P5["Phase 5: Generic Routing Engine"]
    
    P5 --> P6["Phase 6: In-Flight Reassignment"]
    P3 & P5 & P6 --> P7["Phase 7: Controlled Reopen & Revision"]
    
    P3 & P4 & P5 & P7 --> P8["Phase 8: Guided Workflow UX Engine"]
    P6 & P7 & P8 --> P9["Phase 9: HR Control Center"]
    
    P7 & P8 --> P10["Phase 10: Carry Forward & Historical Archive"]
    P3 & P10 --> P11["Phase 11: Export & Reporting"]
    
    P8 & P9 & P11 --> P12["Phase 12: Security Hardening"]
    P12 --> P13["Phase 13: Cleanup & No-Orphan Gate"]
    P13 --> P14["Phase 14: Integrated UAT (125 Scenarios)"]
    P14 --> P15["Phase 15: Production Cutover"]
```

---

## 2. Strict Precondition Rules
1. **Schema Precedence:** Master Apps (App 795, Hoshin, Profile) must be structurally stable before building App 794 transactional integration.
2. **Scoring before UX:** Mathematical scoring engines (`WEIGHTED_PART_A_B`) must pass 100% of unit tests before Guided UX components display calculated scores.
3. **No-Orphan Gate before UAT:** Cleanup and dead-code elimination must occur prior to final UAT to ensure zero deprecated references remain.
