# D3-SBX-MIGRATION-01-R1 — App 795 Schema Field Descriptor Corrective

Updated: 2026-09-11 ICT  
Work Package: `D3-SBX-MIGRATION-01-R1`  
Mode: `SOURCE / TEST / DOCS ONLY`  
Base Canonical HEAD: `7ed80dbd64006b4df9b747733fad59aa0f5955c9`  
Canonical Branch: `ai/antigravity-wp002c`  
Repository: `rebootob/MBO2026`  
Authorization: `“อนุมัติ D3-SBX-MIGRATION-01-R1 SOURCE/TEST/DOCS-ONLY / ZERO KINTONE I/O ตามขอบเขตที่เสนอ”`  
Target Verdict: `D3-SBX-MIGRATION-01-R1 = IMPLEMENTATION COMPLETE / REVIEW REQUIRED`  

---

## 1. Problem Statement & Root Cause

During the initial live attempt of `D3-SBX-MIGRATION-01`, Kintone rejected the schema creation request:
- **Endpoint:** `POST /k/v1/preview/app/form/fields.json`
- **Target App:** `795` (Routing Master)
- **Status:** `HTTP 400 Bad Request`
- **Error Code:** `CB_VA01`
- **Message:** Missing top-level `code` property in field property descriptors:
  ```json
  {
    "properties[Version_Key].code": { "messages": ["Required field."] },
    "properties[Version_Status].code": { "messages": ["Required field."] },
    "properties[Version_Number].code": { "messages": ["Required field."] },
    "properties[Route_Pattern].code": { "messages": ["Required field."] },
    "properties[Scorer_Priority_Slots].code": { "messages": ["Required field."] }
  }
  ```

Kintone REST API requires that each property descriptor inside the `properties` map contains an explicit `code` attribute matching the field code (e.g., `{ code: "Version_Key", type: "...", label: "...", ... }`).

---

## 2. Implementation Corrective

Changes were strictly isolated to field property descriptor generation and serialization:

### 2.1 `scripts/kintone/d3-sbx-migration-local-executor-core.js`
1. `stagedOptionalSpec(targetSpec, fieldCode)`: Added `fieldCode` parameter and sets `spec.code = fieldCode`.
2. `fieldFinalDiff(current, target, fieldCode)`: Sets `targetWithCode.code = fieldCode`.
3. `buildApp795SchemaStages`: Passes `fieldCode` into `stagedOptionalSpec(target, fieldCode)` for all staged optional field additions (`Version_Key`, `Version_Number`, `Version_Status`, `Route_Pattern`, `Scorer_Priority_Slots`, `Effective_From`, `Effective_To`).
4. `buildApp794ProvenancePlan`: Passes `fieldCode` into `stagedOptionalSpec(target, fieldCode)` for all 5 App 794 provenance fields.

### 2.2 `scripts/kintone/d3-sbx-migration-live-binding.js`
1. `propertiesForSchemaOperations(operations)`: Explicitly sets `descriptor.code = operation.fieldCode` before returning property descriptors to ensure any preview fields payload (`POST` or `PUT`) contains the required matching `code` property.

---

## 3. Targeted Test Verification

Added dedicated test suite `tests/d3-sbx-migration-schema-descriptors.test.js` covering:
1. `spec.code === fieldCode` for all App 795 staged optional field descriptors.
2. `target.code === fieldCode` for all App 795 finalized field descriptors.
3. Payload sent to `POST /k/v1/preview/app/form/fields.json` contains `properties[key].code === key` for all fields.
4. Payload sent to `PUT /k/v1/preview/app/form/fields.json` contains `properties[key].code === key` for finalized fields.
5. App 794 provenance fields in `buildApp794ProvenancePlan` have `spec.code === fieldCode` and payload contains `properties[key].code === key`.

### Test Execution Summary:
```text
node --test tests/d3-sbx-migration-schema-descriptors.test.js \
            tests/d3-sbx-migration-live-binding.test.js \
            tests/d3-sbx-migration-live-binding-r2.test.js \
            tests/d3-sbx-migration-live-runner.test.js \
            tests/d3-sbx-migration-live-entrypoint.test.js \
            tests/d3-sbx-migration-local-executor.test.js
```
- **Total Tests:** 44
- **Passed:** 44
- **Failed:** 0
- **PREEXEC-R2 Binding Tests:** 16/16 PASS
- **Syntax / Check:** `node --check` clean across all modified files

---

## 4. Safety & Boundary Invariants

- **KINTONE READS:** 0
- **KINTONE WRITES:** 0
- **SCHEMA WRITES:** 0
- **RECORD WRITES:** 0
- **PROCESS WRITES:** 0
- **ACL WRITES:** 0
- **DEPLOYMENTS:** 0
- **LIVE MIGRATION RETRIES:** 0 (STRICTLY FORBIDDEN)

---

## 5. Control State & Next Actions

- `D3-SBX-MIGRATION-01-R1`: `IMPLEMENTATION COMPLETE / REVIEW REQUIRED`
- `NEXT_GATE_AUTHORIZED`: `NO`
- `AUTO_START_NEXT_WORK_PACKAGE`: `NO`
- Live migration retry remains **NOT AUTHORIZED**. Any retry requires a fresh explicit Owner authorization following ChatGPT Control Plane independent review.
