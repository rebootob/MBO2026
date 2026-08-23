# Routing Master Data Model Evaluation & Recommendation

> **Document Status:** Complete  
> **Evaluation Date:** 2026-08-24  

---

## 1. Comparative Options Matrix

| Evaluation Dimension | Option A: Fixed Step Fields (App 795 Flat Master) | Option B: Header + Subtable Steps (App 795 Subtable) | Option C: Two-App Relational Model (Header App + Step App) |
| :--- | :---: | :---: | :---: |
| **Kintone Process Mgmt Compatibility** | **EXCELLENT (100% Native)** | POOR (Native Process cannot map Subtable Assignees directly) | MODERATE (Requires sync to transaction app) |
| **USER_SELECTION Field Support** | **NATIVE** | NATIVE (inside subtable) | NATIVE |
| **Transaction Snapshot in App 794** | **CLEAN & DIRECT** | Complex JSON serialization | Requires multi-record queries |
| **HR / Admin UX** | **SIMPLE & INTUITIVE** | Compact list view | Cluttered navigation across 2 apps |
| **Audit & No-Orphan Governance** | **HIGH** | MODERATE | LOW (Risk of orphan child step records) |
| **Implementation Complexity** | **LOW** | MEDIUM | HIGH |

---

## 2. Architectural Recommendation: Option A (Fixed Slot Model)

**Recommendation:** Adopt **Option A (App 795 Fixed Step Master with Slots 1 to 6)**.

### Rationale:
1. **Kintone Process Management Limitation:** Kintone native workflow cannot bind process assignees to fields located inside a Subtable (`Table`). It requires first-class fields (`USER_SELECT`) on the record.
2. **Deterministic Snapshotting:** Flat fields allow 1-to-1 immutable mapping from App 795 to App 794 snapshot fields without string serialization hacks.
3. **Zero Orphan Guarantee:** Eliminates orphan child records inherent in two-app relational architectures.
