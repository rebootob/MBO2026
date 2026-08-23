# Legacy Technical Debt & Architecture Antipatterns

> **Document Status:** Complete (Discovery Phase)  
> **Last Updated:** 2026-08-23  

---

## 1. Top 7 Critical Technical Debts in Legacy PMS

1. **App Proliferation (8 Siloed Apps):** Maintaining 8 separate apps created massive duplication in maintenance, field definitions, and JavaScript customizations.
2. **Combinatorial Process Management Explosion:** Up to 384 actions per app to handle hardcoded section-level bypasses.
3. **Hardcoded Mathematical Lookup Logic in Calc Fields:** Deeply nested `IF(AND(...))` trees (20 levels deep) for 4x5 difficulty matrices.
4. **Client-Side Security Leaks:** Hiding confidential manager/GM scores using CSS/JS `display: none` rather than Kintone native Field-Level Permissions.
5. **Fixed 4-Objective Bottleneck:** Hardcoding fields `obj1..4` prevented organizational units needing 2, 3, or 5-10 objectives from operating cleanly.
6. **Immutable Field Schema Rigidity:** Any change in evaluation criteria required modifying field schemas across all 8 apps.
7. **Lack of Snapshot Integrity:** Modifying routing masters or position grades dynamically altered historical evaluations without version locking.
