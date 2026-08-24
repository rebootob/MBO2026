# Application & Schema Change Matrix (KEEP / MODIFY / MIGRATE / CREATE / REMOVE)

> **Document Status:** Complete  
> **Governance:** No-Orphan Policy Active  
> **Last Updated:** 2026-08-24  

---

## 1. High-Level Artifact Action Classification

| Target Artifact | Action | Phase | Business Rationale / Destination |
| :--- | :---: | :---: | :--- |
| **App 53 (Employee Master)** | **KEEP** | P2 | Corporate master for Employee Code, Department, Section, Position (Read Only) |
| **App 794 (Transaction Core)** | **MODIFY** | P2-P8 | Upgrade form schema to support 10 Objectives, Twin-Status, Stage Snapshots (~172 fields) |
| **App 795 (Routing Master)** | **MODIFY** | P5 | Flatten and configure 6 Generic Slots + Dedicated HR Final Check |
| **Hoshin Master App** | **CREATE** | P4 | Dedicated HR-managed repository for Department and Section Hoshins |
| **Profile & Scoring Master** | **CREATE** | P3 | Dedicated repository for Evaluation Profiles, Competency Sets, and Rating Scales |
| **Revision Archive App** | **CREATE** | P7 | Dedicated repository for serialized immutable historical snapshots (Option C Hybrid) |
| **Legacy Apps (283..716)** | **DEPRECATE** | P13 | Lock to READ ONLY for historical lookup; sunset active submission |
| **Legacy JS Files** | **REMOVE** | P13 | Safely retire legacy hardcoded JavaScript after verifying zero references |
