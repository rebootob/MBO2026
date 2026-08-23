# Security & Privacy Boundary Architecture

> **Document Status:** Proposed  
> **Last Updated:** 2026-08-23  

---

## 1. Dual-Layer Defense Model

```
+--------------------------------------------------------+
| 1. NATIVE KINTONE FIELD & RECORD PERMISSIONS           |
|    (Primary Security Boundary - Server-Enforced)       |
|    - Manager / GM / VP score fields locked from        |
|      Appraisees via Kintone Field Permissions          |
|    - Even direct REST API calls cannot bypass this     |
+--------------------------+-----------------------------+
                           |
                           v
+--------------------------------------------------------+
| 2. JAVASCRIPT CUSTOM UI RENDER LAYER                   |
|    (User Experience & Presentation Layer)              |
|    - Renders clean spreadsheet interface               |
|    - Provides real-time field state highlights         |
|    - Performs client-side inline validation            |
+--------------------------------------------------------+
```
