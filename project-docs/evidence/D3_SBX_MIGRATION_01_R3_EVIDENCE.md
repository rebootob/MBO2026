# D3-SBX-MIGRATION-01-R3 — Corrective Evidence: App 795 Readback Comparator

Updated: 2026-09-11 ICT  
Work Package: `D3-SBX-MIGRATION-01-R3`  
Mode: `SOURCE / TEST / DOCS ONLY`  
Base Canonical HEAD: `e578f5b411d0449bb1f3a8317dc843a022ba4a3f`  
Canonical Branch: `ai/antigravity-wp002c`  
Repository: `rebootob/MBO2026`  
Authorization: *** D3-SBX-MIGRATION-01-R3 SOURCE/TEST/DOCS-ONLY / ZERO KINTONE I/O ตามขอบเขตที่เสนอ”`  
Target Verdict: `D3-SBX-MIGRATION-01-R3 = IMPLEMENTATION COMPLETE / REVIEW REQUIRED`  

---

## 1. Context & Recovery Boundary

- **Origin of Defect:** During the `D3-SBX-MIGRATION-01-R2` live migration retry, `APP795_SEED_READBACK` triggered `D3_LIVE_PARTIAL_WRITE_STOP` after `APP795_STAGE_OPTIONAL_FIELDS`, `APP795_ACTIVATE_STAGED_SCHEMA`, and `APP795_SEED_EXACT_20` completed successfully.
- **Root Cause:** In `assertApp795SeedReadBack`, empty optional dropdown values from Kintone return as `null`, while the manifest specifies `""`. The naive equality check `String(actual) !== String(expected)` evaluated `"null" !== ""` and threw `APP795_READBACK_VALUE_MISMATCH`.
- **Live Recovery Boundary Preserved:**
  - App 795: Revision `12`, 33 fields, 20 seeded records at revision `6`. (Final schema activation pending).
  - App 794: Revision `70`, 344 fields, 1 record (untouched, 0 writes).
  - App 798: Revision `5`, 23 fields, 0 records (untouched, 0 writes).
  - Apps 796, 797, 800: Untouched.

---

## 2. Corrective Implementation Evidence

### 2.1 Code Changes
- File: `scripts/kintone/d3-sbx-migration-local-executor-core.js`
  - Added `isOptionalDropDownField(fieldCode)`:
    ```javascript
    export function isOptionalDropDownField(fieldCode) {
      const spec = routingFields[fieldCode];
      return Boolean(spec && spec.type === 'DROP_DOWN' && spec.required !== true);
    }
    ```
  - Added `isReadBackValueEqual(fieldCode, actual, expected)`:
    ```javascript
    export function isReadBackValueEqual(fieldCode, actual, expected) {
      if (isOptionalDropDownField(fieldCode)) {
        const isActualBlank = actual === null || actual === '';
        const isExpectedBlank = expected === '' || expected === null;
        if (isActualBlank && isExpectedBlank) {
          return true;
        }
      }

      return String(actual) === String(expected);
    }
    ```
  - Updated `assertApp795SeedReadBack`:
    - Enforced `record.Routing_Key` check against `operation.preconditions.Routing_Key` (`APP795_ROUTING_KEY_DRIFT`).
    - Enforced presence check for every expected field code (`!(fieldCode in record) || record[fieldCode] === undefined`).
    - Delegated value equivalence to `isReadBackValueEqual`.
- File: `scripts/kintone/d3-sbx-migration-local-executor-r1.js`
  - Re-exported `isOptionalDropDownField` and `isReadBackValueEqual`.

---

## 3. Test Execution Verification

### 3.1 Node Syntax Validation
- `node --check scripts/kintone/d3-sbx-migration-local-executor-core.js`: PASS (Exit Code 0)
- `node --check scripts/kintone/d3-sbx-migration-local-executor-r1.js`: PASS (Exit Code 0)

### 3.2 Focused Test Suite
Executed `tests/d3-sbx-migration-seed-readback-comparator.test.js`:
- `isOptionalDropDownField identifies optional approval rules and rejects required fields`: PASS
- `comparator unit: OPTIONAL DROP_DOWN allows expected "" / actual null`: PASS
- `comparator unit: OPTIONAL DROP_DOWN allows expected "" / actual ""`: PASS
- `comparator unit: OPTIONAL DROP_DOWN fails expected "ALL" / actual null`: PASS
- `comparator unit: OPTIONAL DROP_DOWN fails expected "" / actual "ALL"`: PASS
- `comparator unit: required dropdown does NOT allow blank normalization`: PASS
- `comparator unit: non-dropdown business fields fail on value mismatch`: PASS
- `App795 seed readback passes with realistic live Kintone null blank dropdown values`: PASS
- `App795 seed readback fails closed on wrong Route_Pattern`: PASS
- `App795 seed readback fails closed on wrong Version_Key`: PASS
- `App795 seed readback fails closed on wrong scorer slots`: PASS
- `App795 seed readback fails closed on wrong routing identity`: PASS
- `App795 seed readback fails closed on missing field in record`: PASS
**Subtotal:** 13/13 PASS.

### 3.3 Full Migration Regression Test Suite
Command:
```bash
node --test \
  tests/d3-sbx-migration-seed-readback-comparator.test.js \
  tests/d3-sbx-migration-schema-descriptors.test.js \
  tests/d3-sbx-migration-live-binding-r2.test.js \
  tests/d3-sbx-migration-live-binding.test.js \
  tests/d3-sbx-migration-local-executor-r1.test.js \
  tests/d3-sbx-migration-local-executor-r2.test.js \
  tests/d3-sbx-migration-local-executor.test.js
```
Results:
- Total Tests: **62**
- Pass: **62**
- Fail: **0**
- Duration: ~170 ms

---

## 4. Safety Audit & Control Metrics

- `KINTONE_READS`: 0
- `KINTONE_WRITES`: 0
- `SCHEMA_WRITES`: 0
- `PROCESS_WRITES`: 0
- `RECORD_WRITES`: 0
- `ACL_WRITES`: 0
- `DEPLOYMENTS`: 0
- `LIVE_MIGRATION_RETRIES`: 0

**VERDICT:**  
`D3-SBX-MIGRATION-01-R3 = IMPLEMENTATION COMPLETE / REVIEW REQUIRED`

**NEXT ACTION:**  
STOP for independent review by ChatGPT Control Plane. No further execution or live retry is authorized without explicit Owner approval.
