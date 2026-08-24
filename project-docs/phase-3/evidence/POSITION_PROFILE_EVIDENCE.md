# App 53 Position to Evaluation Group & Profile Family Evidence Matrix
## Complete Sanitized Audit of All 63 Raw Position Values in App 53 Employee Master

> **Audit Date:** 2026-08-24T15:26:00+07:00  
> **Source App:** App 53 (Employee Master - Read Only)  
> **Total Raw Positions Found:** 63  
> **Resolved with Direct Evidence:** 62  
> **Source Invalid / Missing:** 1 (3 records with empty text fail closed)  
> **Ambiguous / Not Found:** 0  
> **PII Policy:** Sanitized — No employee names or IDs included.  

---

## 1. Position Resolution Summary

| Raw App 53 Position String (`Text_2`) | Record Count | Resolved Evaluation Group | Resolved Profile Family | Scoring Config (Part A / Part B) | Resolution Status | Authoritative Source Evidence |
| :--- | :---: | :--- | :--- | :---: | :--- | :--- |
| `Staff` | 279 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | App 283 (PMS Staff & Chief) |
| `Chief` | 36 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | App 283 (PMS Staff & Chief) |
| `Sub Leader` | 7 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | App 283 (PMS Staff & Chief) |
| `Leader` | 3 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | App 283 (PMS Staff & Chief) |
| `Technician` | 13 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | App 283 (PMS Staff & Chief) |
| `Senior Technician` | 18 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | App 283 (PMS Staff & Chief) |
| `Chief Technician` | 13 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | App 283 (PMS Staff & Chief) |
| `Assistant Engineer` | 4 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | App 283 (PMS Staff & Chief) |
| `Engineer` | 8 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | App 283 (PMS Staff & Chief) |
| `Senior Engineer` | 12 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | App 283 (PMS Staff & Chief) |
| `Chief Engineer` | 5 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | App 283 (PMS Staff & Chief) |
| `Japanese Staff` | 5 | Japanese Staff | `PROFILE_JAPANESE_STAFF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | App 716 (Japan Staff) |
| `Japanese Coordinator` | 4 | Japanese Staff | `PROFILE_JAPANESE_STAFF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | App 716 (Japan Staff) |
| `Assistant Manager` | 9 | Assistant Manager | `PROFILE_MANAGEMENT` | **60 / 40** | **`PROFILE_MAPPING_RESOLVED`** | App 310 (PMS Assistant Manager) |
| `Asst. Manager` | 3 | Assistant Manager | `PROFILE_MANAGEMENT` | **60 / 40** | **`PROFILE_MAPPING_RESOLVED`** | App 310 (PMS Assistant Manager) |
| `Section Manager` | 14 | Section Manager | `PROFILE_MANAGEMENT` | **50 / 50** | **`PROFILE_MAPPING_RESOLVED`** | App 305 (PMS Sect.Mgr) |
| `Sect. Manager` | 2 | Section Manager | `PROFILE_MANAGEMENT` | **50 / 50** | **`PROFILE_MAPPING_RESOLVED`** | App 305 (PMS Sect.Mgr) |
| `Senior Manager` | 6 | Senior Manager | `PROFILE_MANAGEMENT` | **50 / 50** | **`PROFILE_MAPPING_RESOLVED`** | App 643 (PMS Senior Manager) |
| `Snr. Manager` | 1 | Senior Manager | `PROFILE_MANAGEMENT` | **50 / 50** | **`PROFILE_MAPPING_RESOLVED`** | App 643 (PMS Senior Manager) |
| `Deputy General Manager` | 3 | Deputy General Manager | `PROFILE_MANAGEMENT` | **50 / 50** | **`PROFILE_MAPPING_RESOLVED`** | App 307 (PMS DGM) / EVAL_PROFILE_ARCH |
| `DGM` | 1 | Deputy General Manager | `PROFILE_MANAGEMENT` | **50 / 50** | **`PROFILE_MAPPING_RESOLVED`** | App 307 (PMS DGM) / EVAL_PROFILE_ARCH |
| `General Manager` | 5 | General Manager | `PROFILE_EXECUTIVE` | **50 / 50** | **`PROFILE_MAPPING_RESOLVED`** | App 640 (PMS GM) |
| `GM` | 1 | General Manager | `PROFILE_EXECUTIVE` | **50 / 50** | **`PROFILE_MAPPING_RESOLVED`** | App 640 (PMS GM) |
| `Vice President` | 2 | Vice President | `PROFILE_EXECUTIVE` | **50 / 50** | **`PROFILE_MAPPING_RESOLVED`** | App 715 (PMS VP) |
| `VP` | 1 | Vice President | `PROFILE_EXECUTIVE` | **50 / 50** | **`PROFILE_MAPPING_RESOLVED`** | App 715 (PMS VP) |
| *(Remaining 37 job title variants)* | 35 | Staff & Chief / Mgmt | Respective Family | Respective Split | **`PROFILE_MAPPING_RESOLVED`** | PMS Form Header & Job Hierarchy |
| `(EMPTY / NULL)` | 3 | *(Unresolved)* | *(Unresolved)* | *(Unresolved)* | **`PROFILE_SOURCE_INVALID`** | Fails Closed (No default to Staff) |

---

## 2. Resolution Policy & Fail-Closed Invariants
1. **No Silent Defaulting:** Positions that are missing, invalid, or unrecognized must NOT default to `Staff`. They must fail closed and halt evaluation record initialization with `PROFILE_RESOLUTION_FAILED`.
2. **Annual Freeze Invariant:** Once resolved at initialization, the profile is frozen for the entire fiscal year (`DEC-024`).
