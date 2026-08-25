# App Registry

| App ID | Environment | Name | Permission | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **53** | Production | Employee Namelist | **READ ONLY** | Master Employee Profile & Hoshin |
| **283** | Production | PMS Staff & Chief | **READ ONLY** | Legacy System Business Rule Reference |
| **794** | Sandbox | MBO V2 Sandbox | **WRITABLE** | Main Transactional Appraisal Records |
| **795** | Sandbox | MBO Routing Master | **WRITABLE** | Section-to-Approver Workflow Routing |
| **796** | Sandbox (Live Deployed / 23 Fields Domain Aligned) | MBO Profile & Scoring Configuration Master [Sandbox] | **CREATOR ONLY / DEFAULT DENY** | Versioned MBO evaluation profile and scoring configuration master |
| **797** | Sandbox (Live Deployed / 19 Fields Live Schema Verified) | MBO Hoshin Master [Sandbox] | **CREATOR ONLY / DEFAULT DENY** | HR-managed Department/Section Hoshin version master; DEC-018; no workflow |
| **798** | Sandbox (Live Deployed / 15 Fields Live Schema Verified) | MBO Revision Archive [Sandbox] | **CREATOR ONLY / DEFAULT DENY** | Immutable historical snapshots of superseded App 794 stage revisions; DEC-022; 3 required flags repaired |
| **800** | Sandbox (Live Deployed / Dashboard Customization) | MBO HR Control Center [Sandbox] | **CREATOR ONLY / DEFAULT DENY** | Native HR Control Center Shell & HR Dashboard MVP; DEC-025, DEC-039 |
