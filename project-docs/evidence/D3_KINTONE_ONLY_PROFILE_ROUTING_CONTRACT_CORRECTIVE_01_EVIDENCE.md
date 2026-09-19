# D3 Kintone-Only Profile & Routing Contract Corrective 01 Evidence

- **PACKAGE:** `D3-KINTONE-ONLY-PROFILE-ROUTING-CONTRACT-CORRECTIVE-01`
- **AUTHORIZATION_ID:** `MBO2026-D3-KINTONE-ONLY-PROFILE-ROUTING-CONTRACT-CORRECTIVE-01-20260919-OWNER-01`
- **OWNER_AUTHORIZATION:** `EXPLICITLY APPROVED`
- **AUTHORIZED_BASE_HEAD:** `60af416adc3903093c758bccab42031967d5cf28`
- **MODE:** `READ-ONLY CONTRACT CORRECTIVE`
- **SYSTEM_BOUNDARY:** `KINTONE_ONLY`

---

## 1. Executive Summary & Purpose

This package addresses the two specific contract discrepancies identified during independent review of the preceding reconciliation package:
1. **App 794 `Profile_Code` Schema and Persistence Contract:** Resolves the contradictory claim in previous evidence (`FIELD_EXISTS_IN_APP794_SCHEMA = NO`) versus runtime client requirements (`CORE_SNAPSHOT_FIELDS` requiring `Profile_Code`).
2. **Live Record 19 `Routing_Topology` Contract:** Corrects the erroneous documentation claim that Record 19 has `Routing_Topology = "PATTERN_A_T1_DIRECT"`, confirming that live Record 19 actually has `Routing_Topology = "M1_G1"`, which maps deterministically to `PATTERN_2_M1_G1` under the canonical D3 routing contract.

---

## 2. Issue 1: App 794 Profile_Code Schema & Persistence Contract

### 2.1 Live App 794 Schema Property Verification
A direct query to Kintone REST API (`GET /k/v1/app/form/fields.json?app=794`) confirms that `Profile_Code` **IS PRESENT** in the live App 794 deployed form schema:

```json
{
  "code": "Profile_Code",
  "type": "SINGLE_LINE_TEXT",
  "label": "Profile Code",
  "noLabel": false,
  "required": false,
  "unique": false,
  "defaultValue": ""
}
```

- **FIELD_EXISTS_IN_APP794_SCHEMA:** `YES`
- **FIELD_TYPE:** `SINGLE_LINE_TEXT`
- **FIELD_LABEL:** `Profile Code`
- **Total Properties Count in App 794:** 349 fields

### 2.2 Live Record 19 Field State
A direct query to live Record 19 (`GET /k/v1/record.json?app=794&id=19`) reveals:
```json
"Profile_Code": {
  "type": "SINGLE_LINE_TEXT",
  "value": ""
}
```
- **Status:** Present in schema and present on Record 19, but its value is empty string (`""`).

### 2.3 Clarification of Previous Reconciliation Discrepancy
The previous reconciliation report erroneously marked `Profile_Code` as `FIELD_EXISTS_IN_APP794_SCHEMA = NO` due to filtering exclusively against custom profile resolver return structures rather than verifying the raw Kintone App 794 form properties dictionary. 
In reality:
- `Profile_Code` is an existing deployed field on App 794.
- In `src/main-mbo-app.js`, `Profile_Code` is defined in `CORE_SNAPSHOT_FIELDS` (line 861). The application explicitly expects this field on the Kintone form state and populates it from `scoringConfig.Profile_Code` during `onLookupEmployee` (line 846).
- Therefore, `Profile_Code` is an **`AUTHORITATIVE_PERSISTED_FIELD`** populated from master config during employee lookup.

---

## 3. Issue 2: Live Record 19 Routing_Topology Contract

### 3.1 Live Record 19 Routing Readback
Direct inspection of live Record 19 (`GET /k/v1/record.json?app=794&id=19`) yields:
- `Routing_Topology.value`: `"M1_G1"`
- `Route_Pattern`: `undefined` (field does not exist in App 794 schema)
- `Effective_Routing_Key.value`: `""`
- `Effective_Route_Version_Key.value`: `""`
- `Effective_Scorer_Slots_Snapshot.value`: `""`

### 3.2 Correction of Erroneous Documentation Claim
In the previous evidence file (`D3_KINTONE_ONLY_LIVE_PROFILE_CONFIG_RECONCILIATION_01_EVIDENCE.md`), table line 43 listed:
`Routing_Topology | SINGLE_LINE_TEXT | "PATTERN_A_T1_DIRECT"`
This was a clerical error in the markdown table. The actual live value on App 794 Record 19 is and was **`"M1_G1"`**.

### 3.3 D3 Canonical Contract Alignment
Under `src/config/d3-route-contract.js` and `src/services/d3-route-pattern-resolver.js`:
- The canonical resolver mapping is:
  ```javascript
  const CANONICAL_TOPOLOGY_PATTERN_MAP = Object.freeze({
    'DIRECT_1': 'PATTERN_1_DIRECT_1',
    'M1_G1': 'PATTERN_2_M1_G1',
    'M1_M2_G1': 'PATTERN_3_M1_M2_G1',
    'M1_G1_G2': 'PATTERN_4_M1_G1_G2',
    'M1_M2_G1_G2': 'PATTERN_5_M1_M2_G1_G2'
  });
  ```
- Therefore:
  - `Routing_Topology = "M1_G1"` maps deterministically and authoritatively to `Route_Pattern = "PATTERN_2_M1_G1"`.
  - When `buildStageLogicalSnapshot` evaluates `record.Routing_Topology = "M1_G1"`, `resolveRoutePattern("M1_G1")` succeeds and returns `"PATTERN_2_M1_G1"`.
  - There is **no mismatch** between Record 19's live `Routing_Topology` (`"M1_G1"`) and the canonical D3 routing contracts.

---

## 4. Final Corrected Authority & Status Matrix

| Field Name | Schema Exists in App 794 | Live Record 19 Value | Authority Classification | Authoritative Source / Pipeline |
| :--- | :--- | :--- | :--- | :--- |
| **`Profile_Code`** | **YES** (`SINGLE_LINE_TEXT`) | `""` (Empty) | `AUTHORITATIVE_PERSISTED_FIELD` | App 796 `Profile_Code` via `src/main-mbo-app.js:846` |
| **`Frozen_Profile_Code`** | **YES** (`SINGLE_LINE_TEXT`) | `""` (Empty) | `AUTHORITATIVE_PERSISTED_FIELD` | Frozen copy of `Profile_Code` via `src/main-mbo-app.js:853` |
| **`K_expected_Snapshot`** | **YES** (`NUMBER`) | `""` (Empty) | `AUTHORITATIVE_PERSISTED_FIELD` | App 796 `Expected_Appraiser_Count` via `src/main-mbo-app.js:847` |
| **`Competency_Set_Code`** | **YES** (`SINGLE_LINE_TEXT`) | `""` (Empty) | `AUTHORITATIVE_PERSISTED_FIELD` | App 796 `Competency_Set_Code` via `src/main-mbo-app.js:848` |
| **`Routing_Topology`** | **YES** (`SINGLE_LINE_TEXT`) | `"M1_G1"` | `AUTHORITATIVE_PERSISTED_FIELD` | App 795 Route Pattern via `resolveRoutePattern` (`PATTERN_2_M1_G1`) |

---

## 5. Scope & Safety Accounting

```text
KINTONE_READ_COUNT = 2 (App 794 Form Fields, App 794 Record 19)
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
NEXT_GATE_NOT_STARTED = YES
```

- **NO WRITE:** Confirmed (0 writes to any app).
- **NO TRANSITION:** Confirmed (0 workflow transitions attempted).
- **NO SOURCE CHANGE:** Confirmed (0 files touched in `src/` or `tests/`).
- **NO BUILD / NO DEPLOY:** Confirmed.
- **NO UAT RETRY:** Confirmed.
