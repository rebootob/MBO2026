# D3 Kintone-Only Live Profile & Config Reconciliation 01 Evidence

- **PACKAGE:** `D3-KINTONE-ONLY-LIVE-PROFILE-CONFIG-RECONCILIATION-01`
- **AUTHORIZATION_ID:** `MBO2026-D3-KINTONE-ONLY-LIVE-PROFILE-CONFIG-RECONCILIATION-01-20260919-OWNER-01`
- **AUTHORIZED_BASE_HEAD:** `0ee53f14fe85d6bf0e71c5141d0c817813885496`
- **MODE:** `READ-ONLY LIVE CONTRACT + REPOSITORY RECONCILIATION`
- **STATUS:** `INVESTIGATION_COMPLETE / ZERO_WRITE_VERIFIED`

---

## 1. Executive Summary & Incident Truth

During live SHARED UAT execution by principal `tmh` on App 794 Record 19 (at status `05 Objective Approved`), an attempt to execute the process action **"Start Mid-Year"** was blocked fail-closed with the fatal error:
```text
PROVENANCE_MISSING: Frozen_Profile_Code is required
```
Accompanied by the non-blocking UI configuration warning:
```text
Invalid or missing Competency_Set_Code in configuration.
```

This read-only investigation inspected App 794 Record 19, the App 794 form schema, master apps 53 and 796, and the codebase pipeline to trace the origin, authority, lifecycle, and root cause of the missing fields.

---

## 2. Live Target Record Readback (App 794 Record 19)

Exact values read directly from live App 794 Record 19:

| Field Name | Type in Schema | Record 19 Value | Note / Observability |
| :--- | :--- | :--- | :--- |
| `$id` | `__ID__` (System) | `"19"` | Target record ID |
| `$revision` | `__REVISION__` (System) | `"10"` | System revision |
| `Record_Key` | `SINGLE_LINE_TEXT` | `"FY2026_0130"` | Populated |
| `Employee_Code` | `SINGLE_LINE_TEXT` | `"0130"` | Populated |
| `Fiscal_Year` | `SINGLE_LINE_TEXT` | `"FY2026"` | Populated |
| `Status` | `STATUS` (System) | `"05 Objective Approved"` | Baseline UAT status |
| `Assignee` | `STATUS_ASSIGNEE` | `["tmh"]` | Shared principal |
| `Profile_Code` | **FIELD NOT IN SCHEMA** | **ABSENT** (`FIELD_EXISTS_IN_APP794_SCHEMA = NO`) | Not a field in App 794 |
| `Frozen_Profile_Code` | `SINGLE_LINE_TEXT` | `""` (Empty string) | Exists in schema; unpopulated |
| `K_expected_Snapshot` | `NUMBER` | `""` (Empty string) | Exists in schema; unpopulated |
| `Competency_Set_Code` | `SINGLE_LINE_TEXT` | `""` (Empty string) | Exists in schema; unpopulated |
| `Routing_Topology` | `SINGLE_LINE_TEXT` | `"PATTERN_A_T1_DIRECT"` | Populated |
| `Effective_Routing_Key` | `SINGLE_LINE_TEXT` | `""` (Empty string) | Exists in schema; unpopulated |
| `Effective_Route_Version_Key`| `SINGLE_LINE_TEXT` | `""` (Empty string) | Exists in schema; unpopulated |
| `Effective_Scorer_Slots_Snapshot` | `MULTI_LINE_TEXT` | `""` (Empty string) | Exists in schema; unpopulated |
| `Configuration_Hash` | `SINGLE_LINE_TEXT` | `""` (Empty string) | Exists in schema; unpopulated |
| `Manager_Level1_Approvers` | `USER_SELECT` | `[hr]` | Populated |
| `GM_Level1_Approvers` | `USER_SELECT` | `[hr]` | Populated |

### Schema Existence Verification
- `Frozen_Profile_Code`: `FIELD_EXISTS_IN_APP794_SCHEMA = YES`
- `K_expected_Snapshot`: `FIELD_EXISTS_IN_APP794_SCHEMA = YES`
- `Competency_Set_Code`: `FIELD_EXISTS_IN_APP794_SCHEMA = YES`
- `Profile_Code`: `FIELD_EXISTS_IN_APP794_SCHEMA = NO`

---

## 3. Authority Classification Matrix

| Field | Classification | Authoritative Source (File / App / Field) | Authority Explanation |
| :--- | :--- | :--- | :--- |
| **`Profile_Code`** | `AUTHORITATIVE_DERIVED_VALUE` | App 53 (`Text_2` Employee_Position) + `src/profiles/runtime-profile-resolver.js` (`resolveProfileCodeForSnapshot`) via `src/profiles/profile-codes-policy.js` | Derived purely from employee position in Employee Master App 53. Not persisted directly in App 794 schema. |
| **`Frozen_Profile_Code`** | `AUTHORITATIVE_PERSISTED_FIELD` | App 794 schema field `Frozen_Profile_Code`. Resolved from `Profile_Code` via `src/main-mbo-app.js:845-853` and frozen on Record Create / Initial Save. | The immutable persistent snapshot of `Profile_Code` on App 794 record to protect against subsequent master changes. |
| **`K_expected_Snapshot`** | `AUTHORITATIVE_PERSISTED_FIELD` | App 796 (Scoring Master) field `Expected_Appraiser_Count` via `src/main-mbo-app.js:847` (`cfg.Expected_Appraiser_Count`). | Populated from published scoring master in App 796 based on `Fiscal_Year` and `Profile_Code`. |
| **`Competency_Set_Code`** | `AUTHORITATIVE_PERSISTED_FIELD` | App 796 (Scoring Master) field `Competency_Set_Code` via `src/main-mbo-app.js:848` (`cfg.Competency_Set_Code`). | Populated from published scoring master in App 796 based on `Fiscal_Year` and `Profile_Code`. |

---

## 4. Pipeline Lifecycle Analysis

### Lifecycle Stages
- **`PROFILE_RESOLUTION_STAGE`**: **EMPLOYEE_LOOKUP / RECORD_INITIATION**
  - Occurs during employee selection/lookup in UI (`src/main-mbo-app.js:725-728`).
  - Calls `resolveProfileCodeForSnapshot(empProfile)` where `empProfile.Employee_Position` comes from App 53 `Text_2`. For Employee `0130`, position is `IT Staff`, resolving to `PROF_STAFF_CHIEF`.
- **`PROFILE_FREEZE_STAGE`**: **RECORD_CREATION_INITIAL_SAVE**
  - Occurs when lookup completes (`src/main-mbo-app.js:845-853`):
    - `Frozen_Profile_Code` is assigned from `profileCode` (`PROF_STAFF_CHIEF`).
    - `Frozen_Profile_Code` is persisted to App 794 during record create/save.
- **`K_EXPECTED_RESOLUTION_STAGE`**: **EMPLOYEE_LOOKUP_CONFIG_SYNC**
  - Occurs in `onLookupEmployee` when fetching published config from App 796 for `Fiscal_Year` + `Profile_Code`.
  - App 796 for `PROF_STAFF_CHIEF` defines `Expected_Appraiser_Count = 2`.
  - Assigned to `K_expected_Snapshot` and persisted to App 794.
- **`COMPETENCY_SET_RESOLUTION_STAGE`**: **EMPLOYEE_LOOKUP_CONFIG_SYNC**
  - Occurs in `onLookupEmployee` when fetching published config from App 796 for `Fiscal_Year` + `Profile_Code`.
  - App 796 for `PROF_STAFF_CHIEF` defines `Competency_Set_Code = COMP_SET_OPERATIONAL_V1`.
  - Assigned to `Competency_Set_Code` and persisted to App 794.

### Record 19 Evaluation:
- **`NORMAL_PIPELINE_COMPLETED`**: `NO`
- **`PIPELINE_BYPASS_PROVEN`**: `YES`

**Bypass Proof & Evidence:**
1. Record 19 was initially generated during synthetic fixture preparation (`D3_KINTONE_ONLY_SHARED_UAT_FIXTURE_PREPARATION_01_EVIDENCE.md`) with key `FY2026_MBO2026_D3_SHARED_UAT_1789781953208`.
2. When later re-targeted to Employee `0130` and key `FY2026_0130`, the record's provenance fields (`Frozen_Profile_Code`, `K_expected_Snapshot`, `Competency_Set_Code`, `Configuration_Hash`, `Effective_Routing_Key`) were never written because the record was updated/migrated directly at the data level without executing the UI's `onLookupEmployee` lifecycle hook (`src/main-mbo-app.js:845-853`).
3. In `src/main-mbo-app.js:1432-1437` and `src/services/d3-stage-logical-snapshot.js:42-51`, the "Start Mid-Year" transition handler calls `buildStageLogicalSnapshot(record, 'MIDYEAR', currentStatus)`.
4. `buildStageLogicalSnapshot` enforces strict fail-closed validation:
   ```javascript
   const frozenProfileCode = String(getVal('Frozen_Profile_Code') || getVal('Profile_Code') || '').trim();
   if (!frozenProfileCode) {
     throw new Error('PROVENANCE_MISSING: Frozen_Profile_Code is required');
   }
   ```
5. Because `Frozen_Profile_Code` is empty (`""`) and `Profile_Code` is absent from the record schema, `buildStageLogicalSnapshot` throws `PROVENANCE_MISSING: Frozen_Profile_Code is required`, which blocks the Kintone process transition event with the observed error message.

---

## 5. Root Cause

**ROOT_CAUSE:**
App 794 Record 19 was updated/seeded outside the normal MBO UI employee lookup lifecycle (`onLookupEmployee`), leaving required snapshot fields (`Frozen_Profile_Code`, `K_expected_Snapshot`, `Competency_Set_Code`) unpopulated, which triggers fail-closed provenance validation in `buildStageLogicalSnapshot` upon attempting the "Start Mid-Year" transition.

---

## 6. Next Fix Classification

- **CLASSIFICATION:** `FIXTURE_REBUILD_THROUGH_NORMAL_PIPELINE`
- **Reason:**
  - The source runtime code (`src/services/d3-stage-logical-snapshot.js` and `src/main-mbo-app.js`) is functioning exactly as architected: it enforces strict provenance checks to prevent ungrounded state transitions.
  - The schema of App 794 already contains all required fields (`Frozen_Profile_Code`, `K_expected_Snapshot`, `Competency_Set_Code`).
  - The master configuration apps (App 53 for Employee `0130` = `IT Staff` -> `PROF_STAFF_CHIEF`; App 796 for `PROF_STAFF_CHIEF` = `Expected_Appraiser_Count: 2`, `Competency_Set_Code: COMP_SET_OPERATIONAL_V1`) are fully published and valid.
  - No new code, schema changes, or manual placeholder backfills are required. The fix requires updating/rebuilding Record 19's fields using the values determined by the existing authoritative pipeline under an authorized fixture update package.

---

## 7. Scope & Safety Accounting

```text
KINTONE_READ_COUNT = 4 (App 794 record 19 + form schema, App 53 employee 0130, App 796 scoring master)
KINTONE_WRITE_COUNT = 0
APP794_RECORD_WRITE_COUNT = 0
APP798_WRITE_COUNT = 0
PROCESS_TRANSITION_COUNT = 0
SOURCE_CHANGE_COUNT = 0
TEST_CHANGE_COUNT = 0
BUILD_COUNT = 0
DEPLOYMENT_COUNT = 0
SHARED_UAT_RETRY_COUNT = 0
DEDICATED_UAT_COUNT = 0
```

- **NO WRITE:** Confirmed
- **NO TRANSITION:** Confirmed
- **NO SOURCE CHANGE:** Confirmed
- **NO BUILD:** Confirmed
- **NO DEPLOY:** Confirmed
- **NO UAT RETRY:** Confirmed
