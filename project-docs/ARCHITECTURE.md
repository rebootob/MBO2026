# TTMET MBO V2 Architecture & Governance

> **Document Status:** Active  
> **Last Updated:** 2026-08-23  

---

## 1. Target Subsystem Topology
* **App 53:** Employee Master (Read Only Legacy Source)
* **App 794:** Unified MBO Transaction Core (One Long-Lived App for all Fiscal Years)
* **App 795:** Generic Step-Based Routing Master (Steps 1-4, Rules ALL/ANY)
* **App 796:** Evaluation Profile Master (Weights 70/30, 50/50, 2-10 Objectives)
* **App 797:** Competency Master (Core & Management Competencies, COCE `Included_In_Score = false`)
* **App 798:** Evaluation Cycle Master (Dynamic Japanese FY Resolution, Hybrid Generation)
* **App 799:** MBO Hoshin Master (Dept/Section Hoshin Scoping, Versioning, Human Publication Gate)

---

## 2. Artifact Lifecycle & Cleanup Governance
* **Core Rule:** `CREATE -> USE -> CHANGE -> MIGRATE -> VERIFY -> CLEANUP -> DOCUMENT`
* **Zero Orphan Policy:** No unused fields, dead scripts, orphaned views, or abandoned status actions.
* **Single Source of Truth:** Every business concept has exactly one authoritative master.
