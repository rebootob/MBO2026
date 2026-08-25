# App Registry

| App ID | Environment | Name | Permission | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **53** | Production | Employee Namelist | **READ ONLY** | Master Employee Profile & Hoshin |
| **283** | Production | PMS Staff & Chief | **READ ONLY** | Legacy System Business Rule Reference (Staff & Chief) |
| **310** | Production | PMS Assistant Manager | **READ ONLY** | Legacy System Business Rule Reference (Assistant Manager) |
| **305** | Production | PMS Sect.Mgr | **READ ONLY** | Legacy System Business Rule Reference (Section Manager) |
| **643** | Production | PMS Senior Manager | **READ ONLY** | Legacy System Business Rule Reference (Senior Manager) |
| **307** | Production | PMS DGM | **READ ONLY** | Legacy System Business Rule Reference (Deputy General Manager) |
| **640** | Production | PMS GM | **READ ONLY** | Legacy System Business Rule Reference (General Manager) |
| **715** | Production | PMS VP | **READ ONLY** | Legacy System Business Rule Reference (Vice President) |
| **716** | Production | Japan Staff | **READ ONLY** | Legacy System Business Rule Reference (Japanese Staff) |
| **794** | Sandbox | MBO V2 Sandbox | **WRITABLE** | Main Transactional Appraisal Records |
| **795** | Sandbox | MBO Routing Master | **WRITABLE** | Section-to-Approver Workflow Routing |
| **796** | Sandbox (Live Deployed / 23 Fields Domain Aligned) | MBO Profile & Scoring Configuration Master [Sandbox] | **CREATOR ONLY / DEFAULT DENY** | Versioned MBO evaluation profile and scoring configuration master |
| **797** | Sandbox (Live Deployed / 19 Fields Live Schema Verified) | MBO Hoshin Master [Sandbox] | **CREATOR ONLY / DEFAULT DENY** | HR-managed Department/Section Hoshin version master; DEC-018; no workflow |
| **798** | Sandbox (Live Deployed / 15 Fields Live Schema Verified) | MBO Revision Archive [Sandbox] | **CREATOR ONLY / DEFAULT DENY** | Immutable historical snapshots of superseded App 794 stage revisions; DEC-022; 3 required flags repaired |
| **800** | Sandbox (Live Deployed / Dashboard Customization) | MBO HR Control Center [Sandbox] | **CREATOR ONLY / DEFAULT DENY** | Native HR Control Center Shell & HR Dashboard MVP; DEC-025, DEC-039 |
| **799** | Sandbox (Manually Deleted in Kintone Web UI / HTTP 404 GAIA_AP01 Verified) | MBO HR Control Center [Sandbox] (Deleted) | **DELETED** | Historical early HRCC shell created at 04:32Z before App 800 allocation; manually deleted in Web UI & verified HTTP 404 live |
| **801** | Sandbox (Live Deployed / 14 Fields Schema Verified) | MBO Employee Authentication & MFA Credential Store [Sandbox] | **CREATOR ONLY / DEFAULT DENY** | Server-side MBO employee authentication credential metadata for Phase 1 password login and Phase 2 TOTP MFA; DEC-042; App 53 remains employee master; general employee direct browser access PROHIBITED |
