# Evidence: D3 Mixed Identity App798 Schema Preflight 01 (R2)

- **Project:** MBO2026
- **Repository:** `rebootob/MBO2026`
- **Canonical Branch:** `ai/antigravity-wp002c`
- **Package:** `D3-KINTONE-ONLY-APP798-SCHEMA-PREFLIGHT-01-R2`
- **Authorization ID:** `MBO2026-D3-KINTONE-ONLY-APP798-SCHEMA-PREFLIGHT-01-R2-20260918-OWNER-01`
- **Authorized Base HEAD:** `5469e7cb69ca15a3a8fc035c7f80020d863cb7ea`
- **Mode:** DOCS + EVIDENCE CORRECTIVE ONLY
- **Date:** 2026-09-18

---

## 1. Mandatory Preflight Verification

- **Working Directory:** `C:/Users/allda/Desktop/Dev/git/MBO2026`
- **Working Tree State:** Clean
- **Current HEAD:** `5469e7cb69ca15a3a8fc035c7f80020d863cb7ea`
- **Upstream HEAD (`origin/ai/antigravity-wp002c`):** `5469e7cb69ca15a3a8fc035c7f80020d863cb7ea`
- **Preflight Match:** `HEAD == origin/ai/antigravity-wp002c == 5469e7cb69ca15a3a8fc035c7f80020d863cb7ea` (Exact match, NO DRIFT)
- **Live Execution Status:** `KINTONE_READS = 0`, `KINTONE_WRITES = 0` (Reused accepted App798 schema revision 6 baseline)

---

## 2. Preserved Exact Five-Field Schema Delta Contract

From R1, preserved exactly with `SCHEMA_DELTA_ALTERNATIVES = 0`:

1. **`Identity_Mode`**
   - **Type:** `DROP_DOWN`
   - **Label:** `Identity Mode`
   - **Required:** `false`
   - **Options:** Exactly `SHARED` (index 0) and `DEDICATED` (index 1)
   - **Default Value:** `""`

2. **`Actual_Operator_Employee_Code`**
   - **Type:** `SINGLE_LINE_TEXT`
   - **Label:** `Actual Operator Employee Code`
   - **Required:** `false`
   - **Unique:** `false`
   - **Default Value:** `""`
   - **Meaning:** Authenticated human operator employee code performing the action (NOT Subject Employee).

3. **`Kintone_Login_User_Code`**
   - **Type:** `SINGLE_LINE_TEXT`
   - **Label:** `Kintone Login User Code`
   - **Required:** `false`
   - **Unique:** `false`
   - **Default Value:** `""`
   - **Meaning:** Exact active Kintone login principal code (verbatim casing).

4. **`Action_Name`**
   - **Type:** `SINGLE_LINE_TEXT`
   - **Label:** `Action Name`
   - **Required:** `false`
   - **Unique:** `false`
   - **Default Value:** `""`

5. **`To_Status`**
   - **Type:** `SINGLE_LINE_TEXT`
   - **Label:** `To Status`
   - **Required:** `false`
   - **Unique:** `false`
   - **Default Value:** `""`

```json
{
  "app": "798",
  "properties": {
    "Identity_Mode": {
      "type": "DROP_DOWN",
      "code": "Identity_Mode",
      "label": "Identity Mode",
      "noLabel": false,
      "required": false,
      "options": {
        "SHARED": { "label": "SHARED", "index": "0" },
        "DEDICATED": { "label": "DEDICATED", "index": "1" }
      },
      "defaultValue": ""
    },
    "Actual_Operator_Employee_Code": {
      "type": "SINGLE_LINE_TEXT",
      "code": "Actual_Operator_Employee_Code",
      "label": "Actual Operator Employee Code",
      "noLabel": false,
      "required": false,
      "unique": false,
      "defaultValue": ""
    },
    "Kintone_Login_User_Code": {
      "type": "SINGLE_LINE_TEXT",
      "code": "Kintone_Login_User_Code",
      "label": "Kintone Login User Code",
      "noLabel": false,
      "required": false,
      "unique": false,
      "defaultValue": ""
    },
    "Action_Name": {
      "type": "SINGLE_LINE_TEXT",
      "code": "Action_Name",
      "label": "Action Name",
      "noLabel": false,
      "required": false,
      "unique": false,
      "defaultValue": ""
    },
    "To_Status": {
      "type": "SINGLE_LINE_TEXT",
      "code": "To_Status",
      "label": "To Status",
      "noLabel": false,
      "required": false,
      "unique": false,
      "defaultValue": ""
    }
  }
}
```

---

## 3. Mandatory Constraint Enforcement Matrix

| Field | Constraint | Enforcement Layer | Implementation Details |
|---|---|---|---|
| **`Identity_Mode`** | Must be exactly `SHARED` or `DEDICATED` | **`SCHEMA_LAYER` + `APPLICATION_SERVICE_LAYER`** | **Schema Layer:** `DROP_DOWN` options are strictly limited to `SHARED` and `DEDICATED`.<br>**Application Service Layer:** In `src/services/revision-archive-service.js`, validates `IDENTITY_MODE` against allowed set and rejects any unsupported identity mode. |
| **`Actual_Operator_Employee_Code`** | Must be trimmed, non-empty, logical max length 64 | **`APPLICATION_SERVICE_LAYER`** | Enforced by application domain logic (`revision-archive-service.js`). |
| **`Kintone_Login_User_Code`** | Must be trimmed, non-empty, logical max length 64, exact case preserved | **`APPLICATION_SERVICE_LAYER`** | Enforced by application domain logic (`revision-archive-service.js`) without casing mutation. |
| **`Action_Name`** | Must be trimmed, non-empty, logical max length 128 | **`APPLICATION_SERVICE_LAYER`** | Enforced by application domain logic (`revision-archive-service.js`). |
| **`To_Status`** | Must be trimmed, non-empty, logical max length 128 | **`APPLICATION_SERVICE_LAYER`** | Enforced by application domain logic (`revision-archive-service.js`). |

---

## 4. Max Length Enforcement Contract

- **`SCHEMA_MAX_LENGTH_ENFORCEMENT = NOT_APPLIED_AT_KINTONE_FORM_SCHEMA`**
  - Kintone form properties for `SINGLE_LINE_TEXT` support optional `maxLength` properties, but setting strict length limits at the Kintone Form Schema level risks unexpected form save rejections and is intentionally left unconstrained at the schema layer (`maxLength: ""`) for initial schema safety and backward compatibility.
- **`APPLICATION_LOGICAL_MAX_LENGTH_ENFORCEMENT = APPLICATION_SERVICE_LAYER`**
  - Logical maximum lengths (64 chars for employee/user codes, 128 chars for action/status strings) are strictly enforced by the **Application Service Layer** before payloads are submitted to Kintone REST API.

---

## 5. Existing App798 Contract Preservation

- **`App798.Employee_Code`:** Preserved as **SUBJECT EMPLOYEE** (whose evaluation record is archived).
- **`App798.Archived_By`:** Preserved as **KINTONE LOGIN USER PRINCIPAL** compatibility entity (`USER_SELECT`).
- **Separation of Duties:** `Actual_Operator_Employee_Code` is distinct from `Employee_Code` and must NEVER be confused with or mapped to Subject Employee.
- **`HISTORICAL_BACKFILL = NO_FABRICATED_VALUES`**
- **`AUTOMATIC_IDENTITY_INFERENCE = FORBIDDEN`**

---

## 6. Strict Change Boundary & Zero-I/O Accounting

- **SOURCE_CHANGE:** `0` (`src/` untouched)
- **TEST_CHANGE:** `0` (`tests/` untouched)
- **SCRIPT_CHANGE:** `0` (`scripts/**` untouched)
- **KINTONE_READS:** `0`
- **KINTONE_WRITES:** `0`
- **SCHEMA_READS:** `0`
- **SCHEMA_WRITES:** `0`
- **RECORD_WRITES:** `0`
- **PROCESS_WRITES:** `0`
- **CUSTOMIZATION_WRITES:** `0`
- **DEPLOYMENT:** `0`
- **UAT:** `0`
- **AUTO_START_NEXT_PACKAGE:** `NO`

---

## 7. Control State & Gate

- **LAST_DELIVERED_PACKAGE:** `D3-KINTONE-ONLY-APP798-SCHEMA-PREFLIGHT-01-R2`
- **PACKAGE_STATUS:** `DELIVERED / REVIEW_REQUIRED`
- **CURRENT_GATE:** `STOP_FOR_INDEPENDENT_CONTROL_PLANE_REVIEW`
- **KINTONE_READ_AUTHORIZED:** `NO`
- **KINTONE_WRITE_AUTHORIZED:** `NO`
- **DEPLOYMENT_AUTHORIZED:** `NO`
- **UAT_AUTHORIZED:** `NO`
- **NEXT_GATE_NOT_STARTED:** `YES`
