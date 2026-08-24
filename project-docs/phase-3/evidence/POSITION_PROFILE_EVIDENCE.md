# App 53 Position to Evaluation Group & Profile Family Evidence Matrix
## Complete Sanitized Enumeration of All 63 Raw Position Values in App 53 Employee Master

> **Audit Date:** 2026-08-24T15:37:00+07:00  
> **Source App:** App 53 (Employee Master - Read Only)  
> **App 53 Total Visible Records:** 275  
> **Total Distinct Raw Position Values:** 63  
> **Sum of Enumerated Records:** 275 (100% Reconciled: `sum(Exact_Record_Count) == 275`)  
> **PII Policy:** Strictly Sanitized — No employee names, email addresses, or employee codes.  
> **Fail-Closed Rule:** Any position marked `PROFILE_MAPPING_AMBIGUOUS`, `PROFILE_MAPPING_NOT_FOUND`, or `PROFILE_SOURCE_INVALID` halts evaluation record initialization.  

---

## 1. Complete 63-Position Enumeration Matrix

| Seq | Raw Position Value (`Text_2`) | Exact Count | Evaluation Group | Profile Family | Scoring Config (Part A / Part B) | Resolution Status | Evidence Type | Exact Evidence Source | Evidence Detail | Confidence |
| :---: | :--- | :---: | :--- | :--- | :---: | :--- | :--- | :--- | :--- | :---: |
| 1 | `Marketing Staff` | 40 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 283 (PMS Staff & Chief) | Operational staff job tier governed by App 283 standard form | HIGH |
| 2 | `Operator` | 32 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 283 (PMS Staff & Chief) | Operational staff job tier governed by App 283 standard form | HIGH |
| 3 | `Staff` | 21 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 283 (PMS Staff & Chief) | Operational staff job tier governed by App 283 standard form | HIGH |
| 4 | `Marketing Chief` | 15 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 283 (PMS Staff & Chief) | Operational staff job tier governed by App 283 standard form | HIGH |
| 5 | `Assistant Chief` | 13 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 283 (PMS Staff & Chief) | Operational staff job tier governed by App 283 standard form | HIGH |
| 6 | `Assistant Section Manager` | 12 | Section Manager | `PROFILE_MANAGEMENT` | **50 / 50** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 305 (PMS Sect.Mgr) | Section Manager management tier governed by App 305 form | HIGH |
| 7 | `Coordinator` | 11 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 283 (PMS Staff & Chief) | Operational staff job tier governed by App 283 standard form | HIGH |
| 8 | `Section Manager` | 11 | Section Manager | `PROFILE_MANAGEMENT` | **50 / 50** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 305 (PMS Sect.Mgr) | Section Manager management tier governed by App 305 form | HIGH |
| 9 | `Support Marketing Staff` | 11 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 283 (PMS Staff & Chief) | Operational staff job tier governed by App 283 standard form | HIGH |
| 10 | `Chief` | 7 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 283 (PMS Staff & Chief) | Operational staff job tier governed by App 283 standard form | HIGH |
| 11 | `Messenger` | 5 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 283 (PMS Staff & Chief) | Operational staff job tier governed by App 283 standard form | HIGH |
| 12 | `Support Marketing Chief` | 5 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 283 (PMS Staff & Chief) | Operational staff job tier governed by App 283 standard form | HIGH |
| 13 | `Asst. Section Manager` | 4 | Section Manager | `PROFILE_MANAGEMENT` | **50 / 50** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 305 (PMS Sect.Mgr) | Section Manager management tier governed by App 305 form | HIGH |
| 14 | `Technical Service Engineer` | 4 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 283 (PMS Staff & Chief) | Operational staff job tier governed by App 283 standard form | HIGH |
| 15 | `Deputy General Manager` | 4 | Deputy General Manager | `PROFILE_MANAGEMENT` | **50 / 50** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 307 (PMS DGM) | DGM management tier in PROFILE_MANAGEMENT (EVAL_PROFILE_ARCH Line 46) | HIGH |
| 16 | `Technical Service Chief` | 4 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 283 (PMS Staff & Chief) | Operational staff job tier governed by App 283 standard form | HIGH |
| 17 | `Accounting Staff` | 3 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 283 (PMS Staff & Chief) | Operational staff job tier governed by App 283 standard form | HIGH |
| 18 | `General Manager` | 3 | General Manager | `PROFILE_EXECUTIVE` | **50 / 50** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 640 (PMS GM) | Executive tier GM with 1 deployed appraiser (DEC-035) | HIGH |
| 19 | `<EMPTY>` | 3 | *(Unresolved)* | *(Unresolved)* | *(Unresolved)* | **`PROFILE_SOURCE_INVALID`** | DATA_VALIDATION | App 53 Schema Audit | Empty position field fails closed; halts record creation | HIGH |
| 20 | `Vice President` | 3 | Vice President | `PROFILE_EXECUTIVE` | **50 / 50** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 715 (PMS VP) | Executive tier VP with 1 deployed appraiser (DEC-035) | HIGH |
| 21 | `Advisor` | 3 | *(Pending HR Review)* | *(Pending HR Review)* | *(Pending HR Review)* | **`PROFILE_MAPPING_AMBIGUOUS`** | BUSINESS_AMBIGUITY | App 53 Raw Audit | Non-standard organizational title requiring explicit HR confirmation; fails closed | LOW |
| 22 | `Chief of Engineer` | 3 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 283 (PMS Staff & Chief) | Operational staff job tier governed by App 283 standard form | HIGH |
| 23 | `Marketing Engineer` | 3 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 283 (PMS Staff & Chief) | Operational staff job tier governed by App 283 standard form | HIGH |
| 24 | `Engineering Staff` | 3 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 283 (PMS Staff & Chief) | Operational staff job tier governed by App 283 standard form | HIGH |
| 25 | `Senior Chief` | 3 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 283 (PMS Staff & Chief) | Operational staff job tier governed by App 283 standard form | HIGH |
| 26 | ` Chief` | 3 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 283 (PMS Staff & Chief) | Operational staff job tier governed by App 283 standard form | HIGH |
| 27 | `President` | 2 | Vice President | `PROFILE_EXECUTIVE` | **50 / 50** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 715 (PMS VP) | Executive tier VP with 1 deployed appraiser (DEC-035) | HIGH |
| 28 | `Supoort Marketing Staff` | 2 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 283 (PMS Staff & Chief) | Operational staff job tier governed by App 283 standard form | HIGH |
| 29 | `Manager` | 2 | Section Manager | `PROFILE_MANAGEMENT` | **50 / 50** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 305 (PMS Sect.Mgr) | Section Manager management tier governed by App 305 form | HIGH |
| 30 | `Supoort Marketing Chief` | 2 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 283 (PMS Staff & Chief) | Operational staff job tier governed by App 283 standard form | HIGH |
| 31 | `IT Staff` | 2 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 283 (PMS Staff & Chief) | Operational staff job tier governed by App 283 standard form | HIGH |
| 32 | `Technical Chief` | 2 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 283 (PMS Staff & Chief) | Operational staff job tier governed by App 283 standard form | HIGH |
| 33 | `Trainee` | 2 | *(Pending HR Review)* | *(Pending HR Review)* | *(Pending HR Review)* | **`PROFILE_MAPPING_AMBIGUOUS`** | BUSINESS_AMBIGUITY | App 53 Raw Audit | Non-standard organizational title requiring explicit HR confirmation; fails closed | LOW |
| 34 | `Technician` | 2 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 283 (PMS Staff & Chief) | Operational staff job tier governed by App 283 standard form | HIGH |
| 35 | `CAM Staff` | 2 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 283 (PMS Staff & Chief) | Operational staff job tier governed by App 283 standard form | HIGH |
| 36 | `Safety Officer` | 1 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 283 (PMS Staff & Chief) | Operational staff job tier governed by App 283 standard form | HIGH |
| 37 | `DESIGN ENGINEER ASSISTANT MANAGER ` | 1 | Assistant Manager | `PROFILE_MANAGEMENT` | **60 / 40** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 310 (PMS Assistant Manager) | Assistant Manager tier with verified live 60/40 split (DEC-035) | HIGH |
| 38 | `Co Project Manager` | 1 | *(Pending HR Review)* | *(Pending HR Review)* | *(Pending HR Review)* | **`PROFILE_MAPPING_AMBIGUOUS`** | BUSINESS_AMBIGUITY | App 53 Raw Audit | Non-standard organizational title requiring explicit HR confirmation; fails closed | LOW |
| 39 | `Specialist` | 1 | *(Pending HR Review)* | *(Pending HR Review)* | *(Pending HR Review)* | **`PROFILE_MAPPING_AMBIGUOUS`** | BUSINESS_AMBIGUITY | App 53 Raw Audit | Non-standard organizational title requiring explicit HR confirmation; fails closed | LOW |
| 40 | `Executive Management Coordinator` | 1 | *(Pending HR Review)* | *(Pending HR Review)* | *(Pending HR Review)* | **`PROFILE_MAPPING_AMBIGUOUS`** | BUSINESS_AMBIGUITY | App 53 Raw Audit | Non-standard organizational title requiring explicit HR confirmation; fails closed | LOW |
| 41 | `Service Engineer` | 1 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 283 (PMS Staff & Chief) | Operational staff job tier governed by App 283 standard form | HIGH |
| 42 | `Senior  Manager` | 1 | Senior Manager | `PROFILE_MANAGEMENT` | **50 / 50** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 643 (PMS Senior Manager) | Senior Manager management tier governed by App 643 form | HIGH |
| 43 | `Section  Manager` | 1 | Section Manager | `PROFILE_MANAGEMENT` | **50 / 50** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 305 (PMS Sect.Mgr) | Section Manager management tier governed by App 305 form | HIGH |
| 44 | `Safety` | 1 | *(Pending HR Review)* | *(Pending HR Review)* | *(Pending HR Review)* | **`PROFILE_MAPPING_AMBIGUOUS`** | BUSINESS_AMBIGUITY | App 53 Raw Audit | Non-standard organizational title requiring explicit HR confirmation; fails closed | LOW |
| 45 | `Chief of Safety Officer` | 1 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 283 (PMS Staff & Chief) | Operational staff job tier governed by App 283 standard form | HIGH |
| 46 | `Marketing  Chief` | 1 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 283 (PMS Staff & Chief) | Operational staff job tier governed by App 283 standard form | HIGH |
| 47 | `Technical Staff` | 1 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 283 (PMS Staff & Chief) | Operational staff job tier governed by App 283 standard form | HIGH |
| 48 | `Senior Manager` | 1 | Senior Manager | `PROFILE_MANAGEMENT` | **50 / 50** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 643 (PMS Senior Manager) | Senior Manager management tier governed by App 643 form | HIGH |
| 49 | `Senior Specilaist` | 1 | *(Pending HR Review)* | *(Pending HR Review)* | *(Pending HR Review)* | **`PROFILE_MAPPING_AMBIGUOUS`** | BUSINESS_AMBIGUITY | App 53 Raw Audit | Non-standard organizational title requiring explicit HR confirmation; fails closed | LOW |
| 50 | `Accounting Chief` | 1 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 283 (PMS Staff & Chief) | Operational staff job tier governed by App 283 standard form | HIGH |
| 51 | `Warehouse Support` | 1 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 283 (PMS Staff & Chief) | Operational staff job tier governed by App 283 standard form | HIGH |
| 52 | `Driver` | 1 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 283 (PMS Staff & Chief) | Operational staff job tier governed by App 283 standard form | HIGH |
| 53 | `Contract (Apite)` | 1 | *(Pending HR Review)* | *(Pending HR Review)* | *(Pending HR Review)* | **`PROFILE_MAPPING_AMBIGUOUS`** | BUSINESS_AMBIGUITY | App 53 Raw Audit | Non-standard organizational title requiring explicit HR confirmation; fails closed | LOW |
| 54 | `Contract (Japan Support)` | 1 | *(Pending HR Review)* | *(Pending HR Review)* | *(Pending HR Review)* | **`PROFILE_MAPPING_AMBIGUOUS`** | BUSINESS_AMBIGUITY | App 53 Raw Audit | Non-standard organizational title requiring explicit HR confirmation; fails closed | LOW |
| 55 | `General manager` | 1 | General Manager | `PROFILE_EXECUTIVE` | **50 / 50** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 640 (PMS GM) | Executive tier GM with 1 deployed appraiser (DEC-035) | HIGH |
| 56 | `Interpreter` | 1 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 283 (PMS Staff & Chief) | Operational staff job tier governed by App 283 standard form | HIGH |
| 57 | `Warehouse Staff` | 1 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 283 (PMS Staff & Chief) | Operational staff job tier governed by App 283 standard form | HIGH |
| 58 | `Assistant Manager` | 1 | Assistant Manager | `PROFILE_MANAGEMENT` | **60 / 40** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 310 (PMS Assistant Manager) | Assistant Manager tier with verified live 60/40 split (DEC-035) | HIGH |
| 59 | `Safety Officer&  ISO Control` | 1 | *(Pending HR Review)* | *(Pending HR Review)* | *(Pending HR Review)* | **`PROFILE_MAPPING_AMBIGUOUS`** | BUSINESS_AMBIGUITY | App 53 Raw Audit | Non-standard organizational title requiring explicit HR confirmation; fails closed | LOW |
| 60 | ` Manager` | 1 | Section Manager | `PROFILE_MANAGEMENT` | **50 / 50** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 305 (PMS Sect.Mgr) | Section Manager management tier governed by App 305 form | HIGH |
| 61 | `Clerk` | 1 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 283 (PMS Staff & Chief) | Operational staff job tier governed by App 283 standard form | HIGH |
| 62 | `Factory Manager` | 1 | *(Pending HR Review)* | *(Pending HR Review)* | *(Pending HR Review)* | **`PROFILE_MAPPING_AMBIGUOUS`** | BUSINESS_AMBIGUITY | App 53 Raw Audit | Non-standard organizational title requiring explicit HR confirmation; fails closed | LOW |
| 63 | `Design Engineer` | 1 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | LEGACY_APP_FORM | App 283 (PMS Staff & Chief) | Operational staff job tier governed by App 283 standard form | HIGH |

---

## 2. Statistical Reconciliation Summary
* **Total Visible Records in App 53:** **`275`**
* **Total Evaluated Records across Matrix:** **`275`**
* **Reconciliation Check:** `sum(Exact_Record_Count) == 275` $\implies$ **`100% RECONCILED (MATCH)`**
* **Distinct Raw Position Values:** **`63 / 63 ENUMERATED (NO AGGREGATE ROWS)`**
* **Resolved Values (`PROFILE_MAPPING_RESOLVED`):** **`51 Values`** (Representing 257 records)
* **Ambiguous Values (`PROFILE_MAPPING_AMBIGUOUS`):** **`11 Values`** (Representing 15 records, failing closed until HR confirmation)
* **Invalid Values (`PROFILE_SOURCE_INVALID`):** **`1 Value (<EMPTY>)`** (Representing 3 records, failing closed)
* **Unrecognized Values (`PROFILE_MAPPING_NOT_FOUND`):** **`0 Values`**
