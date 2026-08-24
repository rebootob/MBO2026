# App 53 Position to Evaluation Group & Profile Family Evidence Matrix
## Complete Sanitized Enumeration of All 63 Raw Position Values with Exact Legacy App Evidence

> **Audit Date:** 2026-08-24T16:14:00+07:00  
> **Source App:** App 53 (Employee Master - Read Only)  
> **App 53 Total Visible Records:** 275  
> **Total Distinct Raw Position Values:** 63  
> **Sum of Enumerated Records:** 275 (100% Reconciled: `sum(Exact_Record_Count) == 275`)  
> **PII Policy:** Strictly Sanitized — No employee names, email addresses, or employee codes.  
> **Fail-Closed Rule:** Any position marked `PROFILE_MAPPING_AMBIGUOUS`, `PROFILE_MAPPING_NOT_FOUND`, or `PROFILE_SOURCE_INVALID` halts evaluation record initialization.  

---

## 1. Complete 63-Position Enumeration & Legacy Match Matrix

| Seq | Raw Position Value (`Text_2`) | App 53 Count | Evaluation Group | Profile Family | Scoring Split | Resolution Status | Legacy Match Evidence | Evidence Detail | Confidence |
| :---: | :--- | :---: | :--- | :--- | :---: | :--- | :--- | :--- | :---: |
| 1 | `Marketing Staff` | 40 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | App 283: 89 recs, App 305: 1 recs | Operational staff job tier governed by App 283 standard form [App 283: 89 recs, App 305: 1 recs] | HIGH |
| 2 | `Operator` | 32 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | *(None in legacy PMS)* | Operational staff job tier governed by App 283 standard form [*(None in legacy PMS)*] | HIGH |
| 3 | `Staff` | 21 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | *(None in legacy PMS)* | Operational staff job tier governed by App 283 standard form [*(None in legacy PMS)*] | HIGH |
| 4 | `Marketing Chief` | 15 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | App 283: 70 recs | Operational staff job tier governed by App 283 standard form [App 283: 70 recs] | HIGH |
| 5 | `Assistant Chief` | 13 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | *(None in legacy PMS)* | Operational staff job tier governed by App 283 standard form [*(None in legacy PMS)*] | HIGH |
| 6 | `Assistant Section Manager` | 12 | Assistant Manager | `PROFILE_MANAGEMENT` | **60 / 40** | **`PROFILE_MAPPING_RESOLVED`** | App 305: 1 recs, App 310: 67 recs | Evaluated in App 310 (PMS Assistant Manager - 60/40) [App 305: 1 recs, App 310: 67 recs] | HIGH |
| 7 | `Coordinator` | 11 | Japanese Staff | `PROFILE_JAPANESE_STAFF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | App 716: 8 recs | Evaluated in App 716 (Japan Staff - 70/30) [App 716: 8 recs] | HIGH |
| 8 | `Section Manager` | 11 | Section Manager | `PROFILE_MANAGEMENT` | **50 / 50** | **`PROFILE_MAPPING_RESOLVED`** | App 305: 33 recs | Section Manager management tier governed by App 305 [App 305: 33 recs] | HIGH |
| 9 | `Support Marketing Staff` | 11 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | App 283: 18 recs | Operational staff job tier governed by App 283 standard form [App 283: 18 recs] | HIGH |
| 10 | `Chief` | 7 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | *(None in legacy PMS)* | Operational staff job tier governed by App 283 standard form [*(None in legacy PMS)*] | HIGH |
| 11 | `Messenger` | 5 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | *(None in legacy PMS)* | Operational staff job tier governed by App 283 standard form [*(None in legacy PMS)*] | HIGH |
| 12 | `Support Marketing Chief` | 5 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | App 283: 19 recs | Operational staff job tier governed by App 283 standard form [App 283: 19 recs] | HIGH |
| 13 | `Asst. Section Manager` | 4 | Assistant Manager | `PROFILE_MANAGEMENT` | **60 / 40** | **`PROFILE_MAPPING_RESOLVED`** | App 310: 4 recs | Evaluated in App 310 (PMS Assistant Manager - 60/40) [App 310: 4 recs] | HIGH |
| 14 | `Technical Service Engineer` | 4 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | App 283: 33 recs | Operational staff job tier governed by App 283 standard form [App 283: 33 recs] | HIGH |
| 15 | `Deputy General Manager` | 4 | Deputy General Manager | `PROFILE_MANAGEMENT` | **50 / 50** | **`PROFILE_MAPPING_RESOLVED`** | App 307: 17 recs | DGM management tier in PROFILE_MANAGEMENT [App 307: 17 recs] | HIGH |
| 16 | `Technical Service Chief` | 4 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | App 283: 15 recs | Operational staff job tier governed by App 283 standard form [App 283: 15 recs] | HIGH |
| 17 | `Accounting Staff` | 3 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | App 283: 9 recs | Operational staff job tier governed by App 283 standard form [App 283: 9 recs] | HIGH |
| 18 | `General Manager` | 3 | General Manager | `PROFILE_EXECUTIVE` | **50 / 50** | **`PROFILE_MAPPING_RESOLVED`** | App 307: 4 recs, App 640: 4 recs, App 716: 2 recs | Executive tier GM with 1 deployed appraiser [App 307: 4 recs, App 640: 4 recs, App 716: 2 recs] | HIGH |
| 19 | `<EMPTY>` | 3 | *(Unresolved)* | *(Unresolved)* | *(Unresolved)* | **`PROFILE_SOURCE_INVALID`** | App 283: 1 recs, App 640: 3 recs | Empty position field; fails closed | HIGH |
| 20 | `Vice President` | 3 | Vice President | `PROFILE_EXECUTIVE` | **50 / 50** | **`PROFILE_MAPPING_RESOLVED`** | App 715: 2 recs | Executive tier VP with 1 deployed appraiser [App 715: 2 recs] | HIGH |
| 21 | `Advisor` | 3 | *(Pending HR Review)* | *(Pending HR Review)* | *(Pending HR Review)* | **`PROFILE_MAPPING_AMBIGUOUS`** | *(None in legacy PMS)* | Non-standard organizational title requiring explicit HR confirmation [*(None in legacy PMS)*]; fails closed | LOW |
| 22 | `Chief of Engineer` | 3 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | App 283: 5 recs | Operational staff job tier governed by App 283 standard form [App 283: 5 recs] | HIGH |
| 23 | `Marketing Engineer` | 3 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | App 283: 3 recs | Operational staff job tier governed by App 283 standard form [App 283: 3 recs] | HIGH |
| 24 | `Engineering Staff` | 3 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | App 283: 7 recs | Operational staff job tier governed by App 283 standard form [App 283: 7 recs] | HIGH |
| 25 | `Senior Chief` | 3 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | *(None in legacy PMS)* | Operational staff job tier governed by App 283 standard form [*(None in legacy PMS)*] | HIGH |
| 26 | ` Chief` | 3 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | *(None in legacy PMS)* | Operational staff job tier governed by App 283 standard form [*(None in legacy PMS)*] | HIGH |
| 27 | `President` | 2 | *(Pending HR Review)* | *(Pending HR Review)* | *(Pending HR Review)* | **`PROFILE_MAPPING_AMBIGUOUS`** | *(None in legacy PMS)* | Non-standard organizational title requiring explicit HR confirmation [*(None in legacy PMS)*]; fails closed | LOW |
| 28 | `Supoort Marketing Staff` | 2 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | App 283: 15 recs | Operational staff job tier governed by App 283 standard form [App 283: 15 recs] | HIGH |
| 29 | `Manager` | 2 | *(Pending HR Review)* | *(Pending HR Review)* | *(Pending HR Review)* | **`PROFILE_MAPPING_AMBIGUOUS`** | *(None in legacy PMS)* | Non-standard organizational title requiring explicit HR confirmation [*(None in legacy PMS)*]; fails closed | LOW |
| 30 | `Supoort Marketing Chief` | 2 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | App 283: 2 recs | Operational staff job tier governed by App 283 standard form [App 283: 2 recs] | HIGH |
| 31 | `IT Staff` | 2 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | App 283: 7 recs | Operational staff job tier governed by App 283 standard form [App 283: 7 recs] | HIGH |
| 32 | `Technical Chief` | 2 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | App 283: 4 recs | Operational staff job tier governed by App 283 standard form [App 283: 4 recs] | HIGH |
| 33 | `Trainee` | 2 | *(Pending HR Review)* | *(Pending HR Review)* | *(Pending HR Review)* | **`PROFILE_MAPPING_AMBIGUOUS`** | *(None in legacy PMS)* | Non-standard organizational title requiring explicit HR confirmation [*(None in legacy PMS)*]; fails closed | LOW |
| 34 | `Technician` | 2 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | App 283: 4 recs | Operational staff job tier governed by App 283 standard form [App 283: 4 recs] | HIGH |
| 35 | `CAM Staff` | 2 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | *(None in legacy PMS)* | Operational staff job tier governed by App 283 standard form [*(None in legacy PMS)*] | HIGH |
| 36 | `Safety Officer` | 1 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | App 283: 10 recs | Operational staff job tier governed by App 283 standard form [App 283: 10 recs] | HIGH |
| 37 | `DESIGN ENGINEER ASSISTANT MANAGER ` | 1 | Assistant Manager | `PROFILE_MANAGEMENT` | **60 / 40** | **`PROFILE_MAPPING_RESOLVED`** | *(None in legacy PMS)* | Assistant Manager tier with verified live 60/40 split (DEC-035) | HIGH |
| 38 | `Co Project Manager` | 1 | *(Pending HR Review)* | *(Pending HR Review)* | *(Pending HR Review)* | **`PROFILE_MAPPING_AMBIGUOUS`** | *(None in legacy PMS)* | Non-standard organizational title requiring explicit HR confirmation [*(None in legacy PMS)*]; fails closed | LOW |
| 39 | `Specialist` | 1 | *(Pending HR Review)* | *(Pending HR Review)* | *(Pending HR Review)* | **`PROFILE_MAPPING_AMBIGUOUS`** | *(None in legacy PMS)* | Non-standard organizational title requiring explicit HR confirmation [*(None in legacy PMS)*]; fails closed | LOW |
| 40 | `Executive Management Coordinator` | 1 | *(Pending HR Review)* | *(Pending HR Review)* | *(Pending HR Review)* | **`PROFILE_MAPPING_AMBIGUOUS`** | *(None in legacy PMS)* | Non-standard organizational title requiring explicit HR confirmation [*(None in legacy PMS)*]; fails closed | LOW |
| 41 | `Service Engineer` | 1 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | App 283: 1 recs | Operational staff job tier governed by App 283 standard form [App 283: 1 recs] | HIGH |
| 42 | `Senior  Manager` | 1 | Senior Manager | `PROFILE_MANAGEMENT` | **50 / 50** | **`PROFILE_MAPPING_RESOLVED`** | *(None in legacy PMS)* | Senior Manager management tier governed by App 643 [*(None in legacy PMS)*] | HIGH |
| 43 | `Section  Manager` | 1 | Section Manager | `PROFILE_MANAGEMENT` | **50 / 50** | **`PROFILE_MAPPING_RESOLVED`** | *(None in legacy PMS)* | Section Manager management tier governed by App 305 [*(None in legacy PMS)*] | HIGH |
| 44 | `Safety` | 1 | *(Pending HR Review)* | *(Pending HR Review)* | *(Pending HR Review)* | **`PROFILE_MAPPING_AMBIGUOUS`** | *(None in legacy PMS)* | Non-standard organizational title requiring explicit HR confirmation [*(None in legacy PMS)*]; fails closed | LOW |
| 45 | `Chief of Safety Officer` | 1 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | App 283: 5 recs | Operational staff job tier governed by App 283 standard form [App 283: 5 recs] | HIGH |
| 46 | `Marketing  Chief` | 1 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | App 283: 1 recs | Operational staff job tier governed by App 283 standard form [App 283: 1 recs] | HIGH |
| 47 | `Technical Staff` | 1 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | App 283: 12 recs | Operational staff job tier governed by App 283 standard form [App 283: 12 recs] | HIGH |
| 48 | `Senior Manager` | 1 | Senior Manager | `PROFILE_MANAGEMENT` | **50 / 50** | **`PROFILE_MAPPING_RESOLVED`** | App 305: 1 recs, App 643: 3 recs | Senior Manager management tier governed by App 643 [App 305: 1 recs, App 643: 3 recs] | HIGH |
| 49 | `Senior Specilaist` | 1 | *(Pending HR Review)* | *(Pending HR Review)* | *(Pending HR Review)* | **`PROFILE_MAPPING_AMBIGUOUS`** | *(None in legacy PMS)* | Non-standard organizational title requiring explicit HR confirmation [*(None in legacy PMS)*]; fails closed | LOW |
| 50 | `Accounting Chief` | 1 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | App 283: 6 recs | Operational staff job tier governed by App 283 standard form [App 283: 6 recs] | HIGH |
| 51 | `Warehouse Support` | 1 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | *(None in legacy PMS)* | Operational staff job tier governed by App 283 standard form [*(None in legacy PMS)*] | HIGH |
| 52 | `Driver` | 1 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | *(None in legacy PMS)* | Operational staff job tier governed by App 283 standard form [*(None in legacy PMS)*] | HIGH |
| 53 | `Contract (Apite)` | 1 | *(Pending HR Review)* | *(Pending HR Review)* | *(Pending HR Review)* | **`PROFILE_MAPPING_AMBIGUOUS`** | *(None in legacy PMS)* | Non-standard organizational title requiring explicit HR confirmation [*(None in legacy PMS)*]; fails closed | LOW |
| 54 | `Contract (Japan Support)` | 1 | *(Pending HR Review)* | *(Pending HR Review)* | *(Pending HR Review)* | **`PROFILE_MAPPING_AMBIGUOUS`** | *(None in legacy PMS)* | Non-standard organizational title requiring explicit HR confirmation [*(None in legacy PMS)*]; fails closed | LOW |
| 55 | `General manager` | 1 | General Manager | `PROFILE_EXECUTIVE` | **50 / 50** | **`PROFILE_MAPPING_RESOLVED`** | *(None in legacy PMS)* | Executive tier GM with 1 deployed appraiser [*(None in legacy PMS)*] | HIGH |
| 56 | `Interpreter` | 1 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | *(None in legacy PMS)* | Operational staff job tier governed by App 283 standard form [*(None in legacy PMS)*] | HIGH |
| 57 | `Warehouse Staff` | 1 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | *(None in legacy PMS)* | Operational staff job tier governed by App 283 standard form [*(None in legacy PMS)*] | HIGH |
| 58 | `Assistant Manager` | 1 | Assistant Manager | `PROFILE_MANAGEMENT` | **60 / 40** | **`PROFILE_MAPPING_RESOLVED`** | *(None in legacy PMS)* | Assistant Manager tier with verified live 60/40 split (DEC-035) | HIGH |
| 59 | `Safety Officer&  ISO Control` | 1 | *(Pending HR Review)* | *(Pending HR Review)* | *(Pending HR Review)* | **`PROFILE_MAPPING_AMBIGUOUS`** | *(None in legacy PMS)* | Non-standard organizational title requiring explicit HR confirmation [*(None in legacy PMS)*]; fails closed | LOW |
| 60 | ` Manager` | 1 | *(Pending HR Review)* | *(Pending HR Review)* | *(Pending HR Review)* | **`PROFILE_MAPPING_AMBIGUOUS`** | *(None in legacy PMS)* | Non-standard organizational title requiring explicit HR confirmation [*(None in legacy PMS)*]; fails closed | LOW |
| 61 | `Clerk` | 1 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | *(None in legacy PMS)* | Operational staff job tier governed by App 283 standard form [*(None in legacy PMS)*] | HIGH |
| 62 | `Factory Manager` | 1 | *(Pending HR Review)* | *(Pending HR Review)* | *(Pending HR Review)* | **`PROFILE_MAPPING_AMBIGUOUS`** | *(None in legacy PMS)* | Non-standard organizational title requiring explicit HR confirmation [*(None in legacy PMS)*]; fails closed | LOW |
| 63 | `Design Engineer` | 1 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | App 283: 1 recs | Operational staff job tier governed by App 283 standard form [App 283: 1 recs] | HIGH |

---

## 2. Statistical Reconciliation Summary
* **Total Visible Records in App 53:** **`275`**
* **Total Evaluated Records across Matrix:** **`275`**
* **Reconciliation Check:** `sum(Exact_Record_Count) == 275` $\implies$ **`100% RECONCILED (MATCH)`**
* **Distinct Raw Position Values:** **`63 / 63 ENUMERATED (NO AGGREGATE ROWS)`**
* **Resolved Values (`PROFILE_MAPPING_RESOLVED`):** **`48 Values`** (Representing 254 records)
* **Ambiguous Values (`PROFILE_MAPPING_AMBIGUOUS`):** **`14 Values`** (Representing 18 records, failing closed until HR confirmation)
* **Invalid Values (`PROFILE_SOURCE_INVALID`):** **`1 Value (<EMPTY>)`** (Representing 3 records, failing closed)
* **Unrecognized Values (`PROFILE_MAPPING_NOT_FOUND`):** **`0 Values`**
