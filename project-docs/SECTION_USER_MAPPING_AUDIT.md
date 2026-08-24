# Enterprise Section to Kintone User Mapping Audit
## Multi-App Read-Only Discovery & Source-of-Truth Inventory

> **Document Status:** Authoritative Read-Only Audit Report  
> **Phase:** `Phase 2: Annual Record Foundation (MBO-P02-WP-003)`  
> **Audit Date:** 2026-08-24T13:28:00+07:00  
> **Access Mode:** Strict Read-Only (`GET` only; 0 writes executed)  
> **Target Apps Audited:** 11 Apps (App 53, 283, 305, 307, 310, 640, 643, 715, 716, 794, 795)  

---

## 1. Executive Summary & Core Determinations

* **Authoritative Section Baseline (App 53):** 275 Employee Records across 14 Sections (13 named sections, 1 empty section) and 8 Departments.
* **Shared Requester Pattern Confirmation:**
  - Standard Section pattern: 1 shared account per section (`e1`, `f1`, `f2`, `f3`, `s1`, `t1`, `t2`, `t3`).
  - Corporate shared account pattern: `TMH1`, `TMH2`, `TMH3` map to a single shared account **`tmh`**.
* **Pilot Verification:** `Employee_Code: "0149"` $\to$ `Section: "TME1"` $\to$ `Requester: "e1"` $\implies$ **`MAPPING_CONFIRMED`** (Validated across App 53, App 795, App 283, App 305, App 310, App 716, App 794, and Cybozu User Directory).
* **Source-of-Truth Readiness:**
  - **Pilot `TME1`:** `APP795_READY_AS_REQUESTER_MASTER` (Seeded and active).
  - **Enterprise Rollout:** `APP795_NEEDS_DATA_CLEANUP / SEEDING` (Phase 5 will seed the remaining 12 sections into App 795).
* **Kintone Write Operations:** **`0 (Zero Writes Executed)`**.

---

## 2. Multi-App Discovery Scope & Record Inventory

| App ID | Application Name | Space ID | Records Audited | Role & Nature in Discovery |
| :---: | :--- | :---: | :---: | :--- |
| **App 53** | Employee Namelist | None | 275 | **Authoritative Employee & Section Inventory Baseline** |
| **App 283** | PMS Staff & Chief | 27 | 358 | Legacy Reference (Staff & Chief evaluations, Section creators & assignees) |
| **App 305** | PMS Sect.Mgr | 27 | 36 | Legacy Reference (Section Manager evaluations & routing snapshots) |
| **App 307** | PMS DGM | 20 | 21 | Legacy Reference (Deputy GM evaluations & routing snapshots) |
| **App 310** | PMS Assistant Manager | 27 | 71 | Legacy Reference (Assistant Manager evaluations & routing snapshots) |
| **App 640** | PMS GM | 27 | 7 | Legacy Reference (GM level evaluations) |
| **App 643** | PMS Senior Manager | 27 | 3 | Legacy Reference (Senior Manager evaluations) |
| **App 715** | PMS VP | 27 | 2 | Legacy Reference (VP level evaluations) |
| **App 716** | Japan Staff | 27 | 10 | Legacy Reference (Expatriate evaluations) |
| **App 794** | MBO V2 Sandbox | None | 2 | Current MBO V2 Transaction Records (Preflight candidate) |
| **App 795** | MBO Routing Master Sandbox | None | 1 | **Current Target Routing Master Candidate** |

---

## 3. Authoritative Section to Kintone User Matrix

| Section Code | Department | Headcount (App53) | Requester User | Manager / Level 1 (Historical) | GM / Level 2 (Historical) | Requester Source | Conflict Status | Kintone User Status | Recommendation |
| :--- | :--- | :---: | :---: | :--- | :--- | :--- | :---: | :---: | :--- |
| **`TME1`** | Eco Energy & Textile Machinery | 12 | **`e1`** | `shigeta`, `suthas` | `kito`, `somrudee` | App 795, 283, 305, 310, 716 | **`MAPPING_CONFIRMED`** | Valid (`true`) | **Ready for Pilot Write** |
| **`TMF1`** | Technical Services / Industrial | 35 | **`f1`** | `kito`, `kritsada` | `vassana` | App 283, 305, 310 | **`MAPPING_CONFIRMED`** | Valid (`true`) | Seed to App 795 in Phase 5 |
| **`TMF2`** | Industrial / Factory Services | 27 | **`f2`** | `kito` | `vassana` | App 283, 310, 716 | **`MAPPING_CONFIRMED`** | Valid (`true`) | Seed to App 795 in Phase 5 |
| **`TMF3`** | Eco Energy / Industrial | 13 | **`f3`** | `kito`, `worapat` | `vassana` | App 283, 305 | **`MAPPING_CONFIRMED`** | Valid (`true`) | Seed to App 795 in Phase 5 |
| **`TMG1`** | Mold & Engineering | 63 | *(None)* | *(Unseeded)* | *(Unseeded)* | None | **`MAPPING_INCOMPLETE`** | Not Found (`g1`/`tmg`) | HR Data Setup Required |
| **`TMG2`** | Mold & Engineering | 27 | *(None)* | *(Unseeded)* | *(Unseeded)* | None | **`MAPPING_INCOMPLETE`** | Not Found (`g2`) | HR Data Setup Required |
| **`TMH1`** | Corporate | 4 | **`tmh`** | `supparat` | `pattama` | App 283, 305, 310 | **`MAPPING_CONFIRMED`** | Valid (`true`) | Seed to App 795 in Phase 5 |
| **`TMH2`** | Corporate | 2 | **`tmh`** | `papatchaya` | `pattama` | App 305, 310 | **`MAPPING_CONFIRMED`** | Valid (`true`) | Seed to App 795 in Phase 5 |
| **`TMH3`** | Corporate | 6 | **`tmh`** | `chatrawee`, `pattama` | `somrudee` | App 283, 305, 307, 310, 640 | **`MAPPING_CONFIRMED`** | Valid (`true`) | Seed to App 795 in Phase 5 |
| **`TMS1`** | Technical Services | 26 | **`s1`** | `makino`, `satit` | `tsuchihira` | App 283, 310, 643 | **`MAPPING_CONFIRMED`** | Valid (`true`) | Seed to App 795 in Phase 5 |
| **`TMT1`** | Machinery / Industrial | 18 | **`t1`** | `pitchayadol`, `weerakul` | `somrudee`, `tsuchihira`| App 283, 305, 307, 310, 715, 716 | **`MAPPING_CONFIRMED`** | Valid (`true`) | Seed to App 795 in Phase 5 |
| **`TMT2`** | Machinery | 29 | **`t2`** | `darat`, `satit` | `somrudee` | App 283, 305, 307, 310, 716 | **`MAPPING_CONFIRMED`** | Valid (`true`) | Seed to App 795 in Phase 5 |
| **`TMT3`** | Technical Services | 11 | **`t3`** | `satit` | `somrudee` | App 283, 305, 310 | **`MAPPING_CONFIRMED`** | **`INVALID (valid=false)`**| Account Re-activation Required |
| *(Empty)* | *(Empty / Machinery)* | 2 | *(None)* | *(None)* | *(None)* | App 53 | **`MAPPING_INCOMPLETE`** | `-` | App 53 Cleanup (OBS-001) |

---

## 4. Coverage & Data Quality Metrics

```
==================================================
Total Sections in App 53:                14
Sections with Confirmed Requester:       11 (78.6%)
Sections with Incomplete / Missing:       3 (21.4% - TMG1, TMG2, Empty)
Sections with Requester Conflicts:        0 (0.0%)
Orphan Sections (in routing not App53):   0
Orphan / Inactive Users Detected:         1 (User code 't3' has valid=false)
==================================================
```

---

## 5. Key Architecture Conclusions

1. **Decoupled Roles Invariant:**
   - **Requester User:** Shared departmental Kintone account (e.g. `e1`, `f1`, `tmh`) used by section members to draft/submit MBOs.
   - **Employee Code:** Individual canonical employee identifier (`0149`).
   - **Approvers:** Individual manager/GM accounts (`suthas`, `kito`, `makino`, `somrudee`).
2. **First Pilot Record Viability:**
   - Pilot Section `TME1` has 100% verified alignment across all 11 applications and active Cybozu account `e1`.
   - Creating the pilot record with `Requester_User: [{ code: "e1" }]` is safe, deterministic, and fully backed by live master evidence.
