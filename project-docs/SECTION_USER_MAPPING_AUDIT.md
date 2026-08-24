# Enterprise Section to Kintone User Mapping Audit
## Final Requester Master Reconciliation, Exact Source Evidence Matrix & Target Inventory

> **Document Status:** Authoritative Final Reconciliation Report  
> **Phase:** `Phase 2: Annual Record Foundation (MBO-P02-WP-003)`  
> **Audit Date:** 2026-08-24T14:24:00+07:00  
> **Access Mode:** Strict Read-Only (`GET` only; 0 writes executed)  
> **Target Apps Audited:** 11 Apps (App 53, 283, 305, 307, 310, 640, 643, 715, 716, 794, 795)  

---

## 1. Executive Summary & Core Determinations

* **Active Business Section Baseline:**
  - Total Named Sections in App 53: **13 Sections**
  - Retired Sections: **1 Section (`TMT3`)**
  - Total Active Business Sections: **12 Sections**
* **Active Business Mapping Coverage:** **12 / 12 Active Sections Confirmed (100%)**
* **Distinct Active Requester Accounts:** **9 / 9 Valid Cybozu Accounts** (`e1`, `f1`, `f2`, `f3`, `g_request`, `tmh`, `s1`, `t1`, `t2`) are verified **`ACTIVE_VALID (valid=true)`** via `/v1/users.json`.
* **Confirmed Business Rules:**
  - `TMG1 -> g_request` & `TMG2 -> g_request` $\implies$ `USER_CONFIRMED_BUSINESS_RULE` (Validated `g_request` = `valid=true`, `name="Gifu Div Request"`).
  - `TMT3` $\implies$ `RETIRED` (`USER_CONFIRMED_BUSINESS_RULE`, `HISTORICAL_ONLY`; excluded from App 795 seeding and new MBO creation).
* **Current vs Target App 795 Runtime State:**
  - **Current Runtime Master (App 795):** **1 / 12** (`TME1 -> e1` seeded and active).
  - **Target Runtime Master (App 795):** **12 / 12** (Ready for future controlled seeding in Phase 5).
* **Final Readiness Classification:** **`REQUESTER_MASTER_BUSINESS_READY`** (Business mappings 100% frozen; Runtime App 795 seeding deferred to Phase 5).
* **Schema & Architecture Invariants:**
  - `App794.Requester_User.required = true` is **retained**.
  - `ACR-001` is **`DEFERRED / NOT REQUIRED FOR CURRENT DESIGN`** as Requester_User can be resolved directly from App 795 prior to Annual Record creation.
  - `LIVE_RECORD_READINESS_DEPENDENCY` is **retained** (Live business record creation remains blocked pending Phase 3 and Phase 5).
* **Kintone Write Operations:** **`0 (Zero Writes Executed)`**.

---

## 2. Exact Source Evidence Matrix

The following table documents the exact evidence sources, field codes, record counts, and evidence roles for all Section to Requester mappings across live and legacy applications:

| Section Code | Requester User | Source App ID | Source App Name | Exact Field Code | Field Type | Evidence Role | Matching Record Count | Current or Legacy | Confidence |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| **`TME1`** | `e1` | **App 795** | MBO Routing Master Sandbox | `Requester_User` | `USER_SELECT` | **`CURRENT_REQUESTER_MASTER`** | **1** | **Current** | **HIGH** |
| `TME1` (Supp.)| `e1` | App 794 | MBO V2 Sandbox | `Requester_User` | `USER_SELECT` | `TRANSACTION_SNAPSHOT` | 2 | Current | HIGH |
| `TME1` (Supp.)| `e1` | App 283 | PMS Staff & Chief | `Created_by` | `CREATOR` | `LEGACY_CREATOR_USAGE` | 20 | Legacy | HIGH |
| `TME1` (Supp.)| `e1` | App 305 | PMS Sect.Mgr | `Created_by` | `CREATOR` | `LEGACY_CREATOR_USAGE` | 12 | Legacy | HIGH |
| `TME1` (Supp.)| `e1` | App 310 | PMS Assistant Manager | `Created_by` | `CREATOR` | `LEGACY_CREATOR_USAGE` | 6 | Legacy | HIGH |
| `TME1` (Supp.)| `e1` | App 716 | Japan Staff | `Created_by` | `CREATOR` | `LEGACY_CREATOR_USAGE` | 2 | Legacy | HIGH |
| **`TMF1`** | `f1` | App 283 | PMS Staff & Chief | `Created_by` | `CREATOR` | `LEGACY_CREATOR_USAGE` | 68 | Legacy | HIGH |
| `TMF1` (Supp.)| `f1` | App 305 | PMS Sect.Mgr | `Created_by` | `CREATOR` | `LEGACY_CREATOR_USAGE` | 1 | Legacy | HIGH |
| `TMF1` (Supp.)| `f1` | App 310 | PMS Assistant Manager | `Created_by` | `CREATOR` | `LEGACY_CREATOR_USAGE` | 5 | Legacy | HIGH |
| **`TMF2`** | `f2` | App 283 | PMS Staff & Chief | `Created_by` | `CREATOR` | `LEGACY_CREATOR_USAGE` | 28 | Legacy | HIGH |
| `TMF2` (Supp.)| `f2` | App 310 | PMS Assistant Manager | `Created_by` | `CREATOR` | `LEGACY_CREATOR_USAGE` | 4 | Legacy | HIGH |
| `TMF2` (Supp.)| `f2` | App 716 | Japan Staff | `Created_by` | `CREATOR` | `LEGACY_CREATOR_USAGE` | 5 | Legacy | HIGH |
| **`TMF3`** | `f3` | App 283 | PMS Staff & Chief | `Created_by` | `CREATOR` | `LEGACY_CREATOR_USAGE` | 18 | Legacy | HIGH |
| `TMF3` (Supp.)| `f3` | App 305 | PMS Sect.Mgr | `Created_by` | `CREATOR` | `LEGACY_CREATOR_USAGE` | 1 | Legacy | HIGH |
| **`TMG1`** | `g_request`| N/A | Business Directive | N/A | N/A | **`USER_CONFIRMED_BUSINESS_RULE`**| N/A | Current Target | **HIGH** |
| **`TMG2`** | `g_request`| N/A | Business Directive | N/A | N/A | **`USER_CONFIRMED_BUSINESS_RULE`**| N/A | Current Target | **HIGH** |
| **`TMH1`** | `tmh` | App 283 | PMS Staff & Chief | `Created_by` | `CREATOR` | `LEGACY_CREATOR_USAGE` | 12 | Legacy | HIGH |
| `TMH1` (Supp.)| `tmh` | App 310 | PMS Assistant Manager | `Created_by` | `CREATOR` | `LEGACY_CREATOR_USAGE` | 5 | Legacy | HIGH |
| **`TMH2`** | `tmh` | App 305 | PMS Sect.Mgr | `Created_by` | `CREATOR` | `LEGACY_CREATOR_USAGE` | 1 | Legacy | HIGH |
| `TMH2` (Supp.)| `tmh` | App 310 | PMS Assistant Manager | `Created_by` | `CREATOR` | `LEGACY_CREATOR_USAGE` | 3 | Legacy | HIGH |
| **`TMH3`** | `tmh` | App 283 | PMS Staff & Chief | `Created_by` | `CREATOR` | `LEGACY_CREATOR_USAGE` | 15 | Legacy | HIGH |
| `TMH3` (Supp.)| `tmh` | App 310 | PMS Assistant Manager | `Created_by` | `CREATOR` | `LEGACY_CREATOR_USAGE` | 4 | Legacy | HIGH |
| **`TMS1`** | `s1` | App 283 | PMS Staff & Chief | `Created_by` | `CREATOR` | `LEGACY_CREATOR_USAGE` | 52 | Legacy | HIGH |
| `TMS1` (Supp.)| `s1` | App 310 | PMS Assistant Manager | `Created_by` | `CREATOR` | `LEGACY_CREATOR_USAGE` | 12 | Legacy | HIGH |
| `TMS1` (Supp.)| `s1` | App 643 | PMS Senior Manager | `Created_by` | `CREATOR` | `LEGACY_CREATOR_USAGE` | 1 | Legacy | HIGH |
| **`TMT1`** | `t1` | App 283 | PMS Staff & Chief | `Created_by` | `CREATOR` | `LEGACY_CREATOR_USAGE` | 29 | Legacy | HIGH |
| `TMT1` (Supp.)| `t1` | App 305 | PMS Sect.Mgr | `Created_by` | `CREATOR` | `LEGACY_CREATOR_USAGE` | 1 | Legacy | HIGH |
| `TMT1` (Supp.)| `t1` | App 310 | PMS Assistant Manager | `Created_by` | `CREATOR` | `LEGACY_CREATOR_USAGE` | 13 | Legacy | HIGH |
| `TMT1` (Supp.)| `t1` | App 716 | Japan Staff | `Created_by` | `CREATOR` | `LEGACY_CREATOR_USAGE` | 1 | Legacy | HIGH |
| **`TMT2`** | `t2` | App 283 | PMS Staff & Chief | `Created_by` | `CREATOR` | `LEGACY_CREATOR_USAGE` | 60 | Legacy | HIGH |
| `TMT2` (Supp.)| `t2` | App 305 | PMS Sect.Mgr | `Created_by` | `CREATOR` | `LEGACY_CREATOR_USAGE` | 3 | Legacy | HIGH |
| `TMT2` (Supp.)| `t2` | App 310 | PMS Assistant Manager | `Created_by` | `CREATOR` | `LEGACY_CREATOR_USAGE` | 16 | Legacy | HIGH |
| `TMT2` (Supp.)| `t2` | App 716 | Japan Staff | `Created_by` | `CREATOR` | `LEGACY_CREATOR_USAGE` | 2 | Legacy | HIGH |
| **`TMT3`** *(Ret.)*| `t3` | App 283 | PMS Staff & Chief | `Created_by` | `CREATOR` | `HISTORICAL_ONLY` | 54 | Retired | N/A |

---

## 3. Final Target Active Requester Matrix (12 Active Sections)

| Section Code | Department | Headcount (App53) | Requester User | Source Classification | Cybozu User Status | Readiness Status | Target App 795 Status |
| :--- | :--- | :---: | :---: | :--- | :---: | :---: | :--- |
| **`TME1`** | Eco Energy & Textile Machinery | 12 | **`e1`** | `CURRENT_REQUESTER_MASTER` (App795) | `valid=true` | **`ACTIVE_VALID`** | **Seeded & Active** |
| **`TMF1`** | Technical Services / Industrial | 35 | **`f1`** | `LEGACY_CREATOR_USAGE` (App283) | `valid=true` | **`ACTIVE_VALID`** | Target for Phase 5 |
| **`TMF2`** | Industrial / Factory Services | 27 | **`f2`** | `LEGACY_CREATOR_USAGE` (App283) | `valid=true` | **`ACTIVE_VALID`** | Target for Phase 5 |
| **`TMF3`** | Eco Energy / Industrial | 13 | **`f3`** | `LEGACY_CREATOR_USAGE` (App283) | `valid=true` | **`ACTIVE_VALID`** | Target for Phase 5 |
| **`TMG1`** | Mold & Engineering | 63 | **`g_request`** | `USER_CONFIRMED_BUSINESS_RULE` | `valid=true` | **`ACTIVE_VALID`** | Target for Phase 5 |
| **`TMG2`** | Mold & Engineering | 27 | **`g_request`** | `USER_CONFIRMED_BUSINESS_RULE` | `valid=true` | **`ACTIVE_VALID`** | Target for Phase 5 |
| **`TMH1`** | Corporate | 4 | **`tmh`** | `LEGACY_CREATOR_USAGE` (App283) | `valid=true` | **`ACTIVE_VALID`** | Target for Phase 5 |
| **`TMH2`** | Corporate | 2 | **`tmh`** | `LEGACY_CREATOR_USAGE` (App305) | `valid=true` | **`ACTIVE_VALID`** | Target for Phase 5 |
| **`TMH3`** | Corporate | 6 | **`tmh`** | `LEGACY_CREATOR_USAGE` (App283) | `valid=true` | **`ACTIVE_VALID`** | Target for Phase 5 |
| **`TMS1`** | Technical Services | 26 | **`s1`** | `LEGACY_CREATOR_USAGE` (App283) | `valid=true` | **`ACTIVE_VALID`** | Target for Phase 5 |
| **`TMT1`** | Machinery / Industrial | 18 | **`t1`** | `LEGACY_CREATOR_USAGE` (App283) | `valid=true` | **`ACTIVE_VALID`** | Target for Phase 5 |
| **`TMT2`** | Machinery | 29 | **`t2`** | `LEGACY_CREATOR_USAGE` (App283) | `valid=true` | **`ACTIVE_VALID`** | Target for Phase 5 |

---

## 4. Retired Section Status: `TMT3` & Data Quality Reconciliation (`OBS-005`)

* **Section Code:** `TMT3`
* **Status:** **`RETIRED`**
* **Requester Required:** **`NO`**
* **App 795 Seeding Required:** **`NO`**
* **Legacy Account `t3`:** `HISTORICAL_ONLY` (Account is `valid=false` on Cybozu tenant; NOT proposed for reactivation).
* **App 53 Reference Count:** **11 Records** (Start dates 2015–2021).
* **Current Employment / Stale Data Status:** **`UNDETERMINED`** (Hypotheses include historical employee records, inactive employees, stale section assignments, or unreflected transfers).
* **Governance Tracking:** Tracked as Data Quality Observation **`OBS-005`** (`ORGANIZATION_DATA_RECONCILIATION_REQUIRED`).

---

## 5. Final Coverage & Verification Metrics

```
==================================================
Total Named Sections in App 53:           13
Retired Sections:                          1 (TMT3)
Active Business Sections:                 12
Active Business Mappings Confirmed:       12 / 12 (100.0%)
Distinct Active Requester Accounts Valid:  9 / 9 (100.0% - e1,f1,f2,f3,g_request,tmh,s1,t1,t2)
Current App 795 Seeded Coverage:           1 / 12 (8.3% - TME1)
Target App 795 Enterprise Coverage:       12 / 12 (Phase 5 Delivery Scope)
Requester Conflicts:                       0 (0.0%)
Kintone Write Operations:                  0 (Zero Writes Executed)
==================================================
```
