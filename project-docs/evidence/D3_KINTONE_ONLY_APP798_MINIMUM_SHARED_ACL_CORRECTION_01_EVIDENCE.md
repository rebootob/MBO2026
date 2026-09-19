# Evidence: D3 Kintone-Only App 798 Minimum Shared ACL Correction

> **Package ID:** `D3-KINTONE-ONLY-APP798-MINIMUM-SHARED-ACL-CORRECTION-01`  
> **Authorization ID:** `MBO2026-D3-KINTONE-ONLY-APP798-MINIMUM-SHARED-ACL-CORRECTION-01-20260919-OWNER-01`  
> **Authorized Base HEAD:** `a99af4f37410e1532cf0b0aee744fd9b33cd8c32`  
> **Repository:** `rebootob/MBO2026`  
> **Branch:** `ai/antigravity-wp002c`  
> **Execution Mode:** `CONTROLLED APP798 APP-LEVEL ACL CORRECTION`  

---

## 1. Executive Summary
Following the findings of `D3-KINTONE-ONLY-APP798-RUNTIME-ACL-PREFLIGHT-01` (where shared runtime user `tmh` was denied access to App 798 with HTTP 403 `CB_NO02`), this package executed the minimal, authorized App-level ACL correction on App 798:
* Granted existing group **`MBO_EMPLOYEE_ACCESS`** (ID: `86`) permissions:
  * `recordViewable = true` (View Records = YES)
  * `recordAddable = true` (Add Records = YES)
  * `recordEditable = false` (Edit Records = NO)
  * `recordDeletable = false` (Delete Records = NO)
  * `appEditable = false` (App Management = NO)
  * `recordImportable = false` (Import = NO)
  * `recordExportable = false` (Export = NO)
* Preserved all other entries (`CREATOR`, `hr`, `everyone`) exactly as before.
* Deployed the updated ACL to production App 798 (Revision `7` -> `8`).
* Verified post-change state via live readback.
* No records written to App 794 or App 798; no process transitions attempted; no UAT retried.

---

## 2. Pre-Change App 798 ACL (Revision 7)

```json
{
  "rights": [
    {
      "entity": { "type": "CREATOR", "code": null },
      "includeSubs": false,
      "appEditable": true,
      "recordViewable": true,
      "recordAddable": true,
      "recordEditable": true,
      "recordDeletable": true,
      "recordImportable": true,
      "recordExportable": true
    },
    {
      "entity": { "type": "USER", "code": "hr" },
      "includeSubs": false,
      "appEditable": false,
      "recordViewable": true,
      "recordAddable": true,
      "recordEditable": false,
      "recordDeletable": false,
      "recordImportable": false,
      "recordExportable": false
    },
    {
      "entity": { "type": "GROUP", "code": "everyone" },
      "includeSubs": false,
      "appEditable": false,
      "recordViewable": false,
      "recordAddable": false,
      "recordEditable": false,
      "recordDeletable": false,
      "recordImportable": false,
      "recordExportable": false
    }
  ],
  "revision": "7"
}
```

---

## 3. Exact ACL Delta Applied

```diff
   [
     {
       "entity": { "type": "CREATOR", "code": null },
       ...
     },
     {
       "entity": { "type": "USER", "code": "hr" },
       ...
     },
+    {
+      "entity": { "type": "GROUP", "code": "MBO_EMPLOYEE_ACCESS" },
+      "includeSubs": false,
+      "appEditable": false,
+      "recordViewable": true,
+      "recordAddable": true,
+      "recordEditable": false,
+      "recordDeletable": false,
+      "recordImportable": false,
+      "recordExportable": false
+    },
     {
       "entity": { "type": "GROUP", "code": "everyone" },
       ...
     }
   ]
```

---

## 4. Post-Change Live App 798 ACL Readback (Revision 8)

```json
{
  "rights": [
    {
      "entity": { "type": "CREATOR", "code": null },
      "includeSubs": false,
      "appEditable": true,
      "recordViewable": true,
      "recordAddable": true,
      "recordEditable": true,
      "recordDeletable": true,
      "recordImportable": true,
      "recordExportable": true
    },
    {
      "entity": { "type": "USER", "code": "hr" },
      "includeSubs": false,
      "appEditable": false,
      "recordViewable": true,
      "recordAddable": true,
      "recordEditable": false,
      "recordDeletable": false,
      "recordImportable": false,
      "recordExportable": false
    },
    {
      "entity": { "type": "GROUP", "code": "MBO_EMPLOYEE_ACCESS" },
      "includeSubs": false,
      "appEditable": false,
      "recordViewable": true,
      "recordAddable": true,
      "recordEditable": false,
      "recordDeletable": false,
      "recordImportable": false,
      "recordExportable": false
    },
    {
      "entity": { "type": "GROUP", "code": "everyone" },
      "includeSubs": false,
      "appEditable": false,
      "recordViewable": false,
      "recordAddable": false,
      "recordEditable": false,
      "recordDeletable": false,
      "recordImportable": false,
      "recordExportable": false
    }
  ],
  "revision": "8"
}
```

---

## 5. Security & Isolation Confirmations

* **`MBO_EMPLOYEE_ACCESS` View Records:** `YES` (`recordViewable = true`)
* **`MBO_EMPLOYEE_ACCESS` Add Records:** `YES` (`recordAddable = true`)
* **`MBO_EMPLOYEE_ACCESS` Edit Records:** `NO` (`recordEditable = false`)
* **`MBO_EMPLOYEE_ACCESS` Delete Records:** `NO` (`recordDeletable = false`)
* **`MBO_EMPLOYEE_ACCESS` App Management:** `NO` (`appEditable = false`)
* **`MBO_EMPLOYEE_ACCESS` Import / Export:** `NO` (`recordImportable = false`, `recordExportable = false`)
* **`everyone` Permissions:** Unchanged and denied (`recordViewable = false`, `recordAddable = false`, etc.)
* **`hr` Permissions:** Unchanged (`recordViewable = true`, `recordAddable = true`, all others `false`)
* **`CREATOR` Permissions:** Unchanged
* **Record-Level ACL:** Unchanged (`rights: []`, revision `8`)
* **Field-Level ACL:** Unchanged (`rights: []`, revision `8`)
* **App 794 / App 53 / App 795 / App 796 / App 801:** Completely untouched

---

## 6. Mutation & Boundary Accounting

| Counter / Item | Value |
| :--- | :--- |
| `APP798_APP_ACL_WRITE_COUNT` | 1 |
| `APP798_DEPLOY_COUNT` | 1 |
| `APP794_RECORD_WRITE_COUNT` | 0 |
| `APP798_RECORD_WRITE_COUNT` | 0 |
| `APP798_SCHEMA_WRITE_COUNT` | 0 |
| `RECORD_ACL_WRITE_COUNT` | 0 |
| `FIELD_ACL_WRITE_COUNT` | 0 |
| `PROCESS_TRANSITION_COUNT` | 0 |
| `START_MID_YEAR_COUNT` | 0 |
| `SHARED_UAT_TRANSITION_COUNT` | 0 |
| `SOURCE_CHANGE_COUNT` | 0 |
| `TEST_CHANGE_COUNT` | 0 |
| `CUSTOMIZATION_BUILD_COUNT` | 0 |
| `CUSTOMIZATION_DEPLOYMENT_COUNT` | 0 |

---

## 7. Mandatory Decision Block

```text
APP798_APP_ACL_APPLIED = YES
TARGET_GROUP = MBO_EMPLOYEE_ACCESS
VIEW_RECORDS_GRANTED = YES
ADD_RECORDS_GRANTED = YES
EDIT_RECORDS_DENIED = YES
DELETE_RECORDS_DENIED = YES
APP_MANAGEMENT_DENIED = YES
EVERYONE_PERMISSIONS_UNCHANGED = YES
EVERYONE_DENIED = YES
HR_PERMISSIONS_UNCHANGED = YES
CREATOR_PERMISSIONS_UNCHANGED = YES
RECORD_ACL_UNCHANGED = YES
FIELD_ACL_UNCHANGED = YES
APP798_LIVE_REVISION = 8
START_MID_YEAR_RETRY_COUNT = 0
SHARED_UAT_AUTHORIZED = NO
NEXT_GATE_NOT_STARTED = YES
```
