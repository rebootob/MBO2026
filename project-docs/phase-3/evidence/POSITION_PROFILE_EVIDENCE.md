# App 53 Position to Evaluation Group & Profile Family Evidence Matrix
## Complete Sanitized Enumeration of All 63 Raw Position Values with Reconciled Normalization Policy

> **Audit Date:** 2026-08-24T16:38:00+07:00  
> **Source App:** App 53 (Employee Master - Read Only)  
> **App 53 Total Visible Records:** 275  
> **Total Distinct Raw Position Values:** 63  
> **Sum of Enumerated Records:** 275 (100% Reconciled: `sum(Exact_Record_Count) == 275`)  
> **PII Policy:** Strictly Sanitized — No employee names, email addresses, or employee codes.  
> **Deterministic Normalization Policy:**  
> - `normalize_title(raw) = TRIM(COLLAPSE_INTERNAL_SPACES(LOWERCASE(raw)))`  
> - Prohibited: Substring matching (`contains("Staff")`), suffix guessing, semantic inference.  
> **Evidence Classification Policy:**  
> - `DIRECT_LEGACY_MATCH`: Exact raw title matching non-conflicting legacy PMS records in a single evaluation app $\implies$ `PROFILE_MAPPING_RESOLVED`  
> - `FROZEN_BUSINESS_RULE`: Exact canonical title defined in frozen governance (`DEC-023`, `DEC-035`) $\implies$ `PROFILE_MAPPING_RESOLVED`  
> - `DETERMINISTIC_TITLE_NORMALIZATION`: Whitespace/case variant resolving to an exact canonical title or single-app legacy title via `normalize_title()` $\implies$ `PROFILE_MAPPING_RESOLVED`  
> - `CONFLICTING_LEGACY_MATCH`: Multi-app legacy matches with cross-app conflict and no explicit overriding governance rule $\implies$ **`PROFILE_MAPPING_AMBIGUOUS` (Fail Closed)**  
> - `NO_DIRECT_EVIDENCE`: Title with no direct legacy match and no canonical business rule $\implies$ **`PROFILE_MAPPING_AMBIGUOUS` (Fail Closed)**  
> - `PROFILE_SOURCE_INVALID`: Empty position string $\implies$ **`PROFILE_SOURCE_INVALID` (Fail Closed)**  

---

## 1. Complete 63-Position Enumeration & Deterministic Evidence Classification

| Seq | Raw Position Value (`Text_2`) | App 53 Count | Evaluation Group | Profile Family | Scoring Split | Resolution Status | Evidence Class | Exact Evidence Source & Detail | Confidence |
| :---: | :--- | :---: | :--- | :--- | :---: | :--- | :--- | :--- | :---: |
| 1 | `Marketing Staff` | 40 | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | **`PROFILE_MAPPING_AMBIGUOUS`** | **`CONFLICTING_LEGACY_MATCH`** | App 283 has 89 recs (70/30) vs App 305 has 1 rec (50/50) [App 283: 89 recs, App 305: 1 recs]; fails closed until explicit HR confirmation | LOW |
| 2 | `Operator` | 32 | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | **`PROFILE_MAPPING_AMBIGUOUS`** | **`NO_DIRECT_EVIDENCE`** | No direct legacy PMS match [*(None in legacy PMS)*]; fails closed until HR confirmation | LOW |
| 3 | `Staff` | 21 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | **`FROZEN_BUSINESS_RULE`** | Canonical operational title defined in DEC-023 [*(None in legacy PMS)*] | HIGH |
| 4 | `Marketing Chief` | 15 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | **`DIRECT_LEGACY_MATCH`** | Direct non-conflicting legacy match in App 283 (70 recs) [App 283: 70 recs] | HIGH |
| 5 | `Assistant Chief` | 13 | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | **`PROFILE_MAPPING_AMBIGUOUS`** | **`NO_DIRECT_EVIDENCE`** | No direct legacy PMS match [*(None in legacy PMS)*]; fails closed until HR confirmation | LOW |
| 6 | `Assistant Section Manager` | 12 | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | **`PROFILE_MAPPING_AMBIGUOUS`** | **`CONFLICTING_LEGACY_MATCH`** | App 310 has 67 recs (60/40) vs App 305 has 1 rec (50/50) [App 305: 1 recs, App 310: 67 recs]; fails closed | LOW |
| 7 | `Coordinator` | 11 | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | **`PROFILE_MAPPING_AMBIGUOUS`** | **`CONFLICTING_LEGACY_MATCH`** | Found 8 recs in App 716 but 11 total in App 53 [App 716: 8 recs]; fails closed | LOW |
| 8 | `Section Manager` | 11 | Section Manager | `PROFILE_MANAGEMENT` | **50 / 50** | **`PROFILE_MAPPING_RESOLVED`** | **`FROZEN_BUSINESS_RULE`** | Canonical Section Manager title governed by DEC-023 [App 305: 33 recs] | HIGH |
| 9 | `Support Marketing Staff` | 11 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | **`DIRECT_LEGACY_MATCH`** | Direct non-conflicting legacy match in App 283 [App 283: 18 recs] | HIGH |
| 10 | `Chief` | 7 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | **`FROZEN_BUSINESS_RULE`** | Canonical operational title defined in DEC-023 [*(None in legacy PMS)*] | HIGH |
| 11 | `Messenger` | 5 | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | **`PROFILE_MAPPING_AMBIGUOUS`** | **`NO_DIRECT_EVIDENCE`** | No direct legacy PMS match [*(None in legacy PMS)*]; fails closed until HR confirmation | LOW |
| 12 | `Support Marketing Chief` | 5 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | **`DIRECT_LEGACY_MATCH`** | Direct non-conflicting legacy match in App 283 [App 283: 19 recs] | HIGH |
| 13 | `Asst. Section Manager` | 4 | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | **`PROFILE_MAPPING_AMBIGUOUS`** | **`CONFLICTING_LEGACY_MATCH`** | App 310 has 67 recs (60/40) vs App 305 has 1 rec (50/50) [App 310: 4 recs]; fails closed | LOW |
| 14 | `Technical Service Engineer` | 4 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | **`DIRECT_LEGACY_MATCH`** | Direct non-conflicting legacy match in App 283 [App 283: 33 recs] | HIGH |
| 15 | `Deputy General Manager` | 4 | Deputy General Manager | `PROFILE_MANAGEMENT` | **50 / 50** | **`PROFILE_MAPPING_RESOLVED`** | **`DIRECT_LEGACY_MATCH`** | Direct legacy match in App 307 (17 recs) [App 307: 17 recs] | HIGH |
| 16 | `Technical Service Chief` | 4 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | **`DIRECT_LEGACY_MATCH`** | Direct non-conflicting legacy match in App 283 [App 283: 15 recs] | HIGH |
| 17 | `Accounting Staff` | 3 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | **`DIRECT_LEGACY_MATCH`** | Direct non-conflicting legacy match in App 283 [App 283: 9 recs] | HIGH |
| 18 | `General Manager` | 3 | General Manager | `PROFILE_EXECUTIVE` | **50 / 50** | **`PROFILE_MAPPING_RESOLVED`** | **`FROZEN_BUSINESS_RULE`** | Canonical Executive GM title governed by DEC-023 [App 307: 4 recs, App 640: 4 recs, App 716: 2 recs] | HIGH |
| 19 | `<EMPTY>` | 3 | *(Unresolved)* | *(Unresolved)* | *(Unresolved)* | **`PROFILE_SOURCE_INVALID`** | `DATA_VALIDATION` | Empty position field; fails closed | HIGH |
| 20 | `Vice President` | 3 | Vice President | `PROFILE_EXECUTIVE` | **50 / 50** | **`PROFILE_MAPPING_RESOLVED`** | **`FROZEN_BUSINESS_RULE`** | Canonical Executive VP title governed by DEC-023 [App 715: 2 recs] | HIGH |
| 21 | `Advisor` | 3 | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | **`PROFILE_MAPPING_AMBIGUOUS`** | **`NO_DIRECT_EVIDENCE`** | No direct legacy PMS match [*(None in legacy PMS)*]; fails closed until HR confirmation | LOW |
| 22 | `Chief of Engineer` | 3 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | **`DIRECT_LEGACY_MATCH`** | Direct non-conflicting legacy match in App 283 [App 283: 5 recs] | HIGH |
| 23 | `Marketing Engineer` | 3 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | **`DIRECT_LEGACY_MATCH`** | Direct non-conflicting legacy match in App 283 [App 283: 3 recs] | HIGH |
| 24 | `Engineering Staff` | 3 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | **`DIRECT_LEGACY_MATCH`** | Direct non-conflicting legacy match in App 283 [App 283: 7 recs] | HIGH |
| 25 | `Senior Chief` | 3 | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | **`PROFILE_MAPPING_AMBIGUOUS`** | **`NO_DIRECT_EVIDENCE`** | No direct legacy PMS match [*(None in legacy PMS)*]; fails closed until HR confirmation | LOW |
| 26 | ` Chief` | 3 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | **`DETERMINISTIC_TITLE_NORMALIZATION`** | normalize_title(' Chief') -> 'chief' -> exact canonical Chief | HIGH |
| 27 | `President` | 2 | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | **`PROFILE_MAPPING_AMBIGUOUS`** | **`NO_DIRECT_EVIDENCE`** | No direct legacy PMS match [*(None in legacy PMS)*]; fails closed until HR confirmation | LOW |
| 28 | `Supoort Marketing Staff` | 2 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | **`DIRECT_LEGACY_MATCH`** | Direct non-conflicting legacy match in App 283 [App 283: 15 recs] | HIGH |
| 29 | `Manager` | 2 | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | **`PROFILE_MAPPING_AMBIGUOUS`** | **`NO_DIRECT_EVIDENCE`** | No direct legacy PMS match [*(None in legacy PMS)*]; fails closed until HR confirmation | LOW |
| 30 | `Supoort Marketing Chief` | 2 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | **`DIRECT_LEGACY_MATCH`** | Direct non-conflicting legacy match in App 283 [App 283: 2 recs] | HIGH |
| 31 | `IT Staff` | 2 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | **`DIRECT_LEGACY_MATCH`** | Direct non-conflicting legacy match in App 283 [App 283: 7 recs] | HIGH |
| 32 | `Technical Chief` | 2 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | **`DIRECT_LEGACY_MATCH`** | Direct non-conflicting legacy match in App 283 [App 283: 4 recs] | HIGH |
| 33 | `Trainee` | 2 | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | **`PROFILE_MAPPING_AMBIGUOUS`** | **`NO_DIRECT_EVIDENCE`** | No direct legacy PMS match [*(None in legacy PMS)*]; fails closed until HR confirmation | LOW |
| 34 | `Technician` | 2 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | **`DIRECT_LEGACY_MATCH`** | Direct non-conflicting legacy match in App 283 [App 283: 4 recs] | HIGH |
| 35 | `CAM Staff` | 2 | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | **`PROFILE_MAPPING_AMBIGUOUS`** | **`NO_DIRECT_EVIDENCE`** | No direct legacy PMS match [*(None in legacy PMS)*]; fails closed until HR confirmation | LOW |
| 36 | `Safety Officer` | 1 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | **`DIRECT_LEGACY_MATCH`** | Direct non-conflicting legacy match in App 283 [App 283: 10 recs] | HIGH |
| 37 | `DESIGN ENGINEER ASSISTANT MANAGER ` | 1 | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | **`PROFILE_MAPPING_AMBIGUOUS`** | **`NO_DIRECT_EVIDENCE`** | No direct legacy PMS match [*(None in legacy PMS)*]; fails closed until HR confirmation | LOW |
| 38 | `Co Project Manager` | 1 | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | **`PROFILE_MAPPING_AMBIGUOUS`** | **`NO_DIRECT_EVIDENCE`** | No direct legacy PMS match [*(None in legacy PMS)*]; fails closed until HR confirmation | LOW |
| 39 | `Specialist` | 1 | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | **`PROFILE_MAPPING_AMBIGUOUS`** | **`NO_DIRECT_EVIDENCE`** | No direct legacy PMS match [*(None in legacy PMS)*]; fails closed until HR confirmation | LOW |
| 40 | `Executive Management Coordinator` | 1 | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | **`PROFILE_MAPPING_AMBIGUOUS`** | **`NO_DIRECT_EVIDENCE`** | No direct legacy PMS match [*(None in legacy PMS)*]; fails closed until HR confirmation | LOW |
| 41 | `Service Engineer` | 1 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | **`DIRECT_LEGACY_MATCH`** | Direct non-conflicting legacy match in App 283 [App 283: 1 recs] | HIGH |
| 42 | `Senior  Manager` | 1 | Senior Manager | `PROFILE_MANAGEMENT` | **50 / 50** | **`PROFILE_MAPPING_RESOLVED`** | **`DETERMINISTIC_TITLE_NORMALIZATION`** | Normalizes 'Senior  Manager' -> 'senior manager' matching canonical Senior Manager | HIGH |
| 43 | `Section  Manager` | 1 | Section Manager | `PROFILE_MANAGEMENT` | **50 / 50** | **`PROFILE_MAPPING_RESOLVED`** | **`DETERMINISTIC_TITLE_NORMALIZATION`** | Normalizes 'Section  Manager' -> 'section manager' matching canonical Section Manager | HIGH |
| 44 | `Safety` | 1 | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | **`PROFILE_MAPPING_AMBIGUOUS`** | **`NO_DIRECT_EVIDENCE`** | No direct legacy PMS match [*(None in legacy PMS)*]; fails closed until HR confirmation | LOW |
| 45 | `Chief of Safety Officer` | 1 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | **`DIRECT_LEGACY_MATCH`** | Direct non-conflicting legacy match in App 283 [App 283: 5 recs] | HIGH |
| 46 | `Marketing  Chief` | 1 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | **`DETERMINISTIC_TITLE_NORMALIZATION`** | Normalizes 'Marketing  Chief' -> 'marketing chief' matching App 283 non-conflicting title (70 recs) | HIGH |
| 47 | `Technical Staff` | 1 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | **`DIRECT_LEGACY_MATCH`** | Direct non-conflicting legacy match in App 283 [App 283: 12 recs] | HIGH |
| 48 | `Senior Manager` | 1 | Senior Manager | `PROFILE_MANAGEMENT` | **50 / 50** | **`PROFILE_MAPPING_RESOLVED`** | **`FROZEN_BUSINESS_RULE`** | Canonical Senior Manager title governed by DEC-023 [App 305: 1 recs, App 643: 3 recs] | HIGH |
| 49 | `Senior Specilaist` | 1 | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | **`PROFILE_MAPPING_AMBIGUOUS`** | **`NO_DIRECT_EVIDENCE`** | No direct legacy PMS match [*(None in legacy PMS)*]; fails closed until HR confirmation | LOW |
| 50 | `Accounting Chief` | 1 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | **`DIRECT_LEGACY_MATCH`** | Direct non-conflicting legacy match in App 283 [App 283: 6 recs] | HIGH |
| 51 | `Warehouse Support` | 1 | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | **`PROFILE_MAPPING_AMBIGUOUS`** | **`NO_DIRECT_EVIDENCE`** | No direct legacy PMS match [*(None in legacy PMS)*]; fails closed until HR confirmation | LOW |
| 52 | `Driver` | 1 | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | **`PROFILE_MAPPING_AMBIGUOUS`** | **`NO_DIRECT_EVIDENCE`** | No direct legacy PMS match [*(None in legacy PMS)*]; fails closed until HR confirmation | LOW |
| 53 | `Contract (Apite)` | 1 | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | **`PROFILE_MAPPING_AMBIGUOUS`** | **`NO_DIRECT_EVIDENCE`** | No direct legacy PMS match [*(None in legacy PMS)*]; fails closed until HR confirmation | LOW |
| 54 | `Contract (Japan Support)` | 1 | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | **`PROFILE_MAPPING_AMBIGUOUS`** | **`NO_DIRECT_EVIDENCE`** | No direct legacy PMS match [*(None in legacy PMS)*]; fails closed until HR confirmation | LOW |
| 55 | `General manager` | 1 | General Manager | `PROFILE_EXECUTIVE` | **50 / 50** | **`PROFILE_MAPPING_RESOLVED`** | **`DETERMINISTIC_TITLE_NORMALIZATION`** | Normalizes 'General manager' -> 'general manager' matching canonical General Manager | HIGH |
| 56 | `Interpreter` | 1 | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | **`PROFILE_MAPPING_AMBIGUOUS`** | **`NO_DIRECT_EVIDENCE`** | No direct legacy PMS match [*(None in legacy PMS)*]; fails closed until HR confirmation | LOW |
| 57 | `Warehouse Staff` | 1 | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | **`PROFILE_MAPPING_AMBIGUOUS`** | **`NO_DIRECT_EVIDENCE`** | No direct legacy PMS match [*(None in legacy PMS)*]; fails closed until HR confirmation | LOW |
| 58 | `Assistant Manager` | 1 | Assistant Manager | `PROFILE_MANAGEMENT` | **60 / 40** | **`PROFILE_MAPPING_RESOLVED`** | **`FROZEN_BUSINESS_RULE`** | Canonical Assistant Manager title governed by DEC-035 [*(None in legacy PMS)*] | HIGH |
| 59 | `Safety Officer&  ISO Control` | 1 | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | **`PROFILE_MAPPING_AMBIGUOUS`** | **`NO_DIRECT_EVIDENCE`** | No direct legacy PMS match [*(None in legacy PMS)*]; fails closed until HR confirmation | LOW |
| 60 | ` Manager` | 1 | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | **`PROFILE_MAPPING_AMBIGUOUS`** | **`NO_DIRECT_EVIDENCE`** | No direct legacy PMS match [*(None in legacy PMS)*]; fails closed until HR confirmation | LOW |
| 61 | `Clerk` | 1 | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | **`PROFILE_MAPPING_AMBIGUOUS`** | **`NO_DIRECT_EVIDENCE`** | No direct legacy PMS match [*(None in legacy PMS)*]; fails closed until HR confirmation | LOW |
| 62 | `Factory Manager` | 1 | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | *(Pending HR Confirmation)* | **`PROFILE_MAPPING_AMBIGUOUS`** | **`NO_DIRECT_EVIDENCE`** | No direct legacy PMS match [*(None in legacy PMS)*]; fails closed until HR confirmation | LOW |
| 63 | `Design Engineer` | 1 | Staff & Chief | `PROFILE_STAFF_CHIEF` | **70 / 30** | **`PROFILE_MAPPING_RESOLVED`** | **`DIRECT_LEGACY_MATCH`** | Direct non-conflicting legacy match in App 283 [App 283: 1 recs] | HIGH |

---

## 2. Statistical Reconciliation & Evidence Summary
* **Total Visible Records in App 53:** **`275`**
* **Total Evaluated Records across Matrix:** **`275`**
* **Reconciliation Check:** `sum(Exact_Record_Count) == 275` $\implies$ **`100% RECONCILED (MATCH)`**
* **Distinct Raw Position Values:** **`63 / 63 ENUMERATED`**
* **Resolved Positions (`PROFILE_MAPPING_RESOLVED`):** **`33 Values`** (Representing 125 records)
* **Ambiguous Positions (`PROFILE_MAPPING_AMBIGUOUS`):** **`29 Values`** (Representing 147 records, failing closed until explicit HR confirmation)
* **Invalid Positions (`PROFILE_SOURCE_INVALID`):** **`1 Value (<EMPTY>)`** (Representing 3 records, failing closed)
