# Legacy to V2 Migration Impact Analysis

> **Document Status:** Proposed  
> **Last Updated:** 2026-08-23  

---

## 1. Migration Impact by Application

| Application | Current State | Migration Path in V2 | Impact & Risks |
| :--- | :--- | :--- | :--- |
| **App 53 (Employee Master)** | Production Active | Kept **READ ONLY**; unchanged source of truth for employee profile | Zero impact / 100% Safe |
| **Apps 283, 305, 307, 310, 640, 643, 715, 716** | 8 Legacy Siloed Apps | Retained as Historical Archive (**READ ONLY**) | Zero risk of historical data loss |
| **App 794 (MBO V2)** | Single Sandbox Core | Upgraded to Unified MBO Core with Evaluation Profile resolver | Consolidates all 8 legacy apps into 1 scalable platform |
| **App 795 (Routing Master)** | Sandbox | Refactored to Generic Step-based Routing Master | Eliminates hardcoded Manager/GM column constraints |
