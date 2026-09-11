# D3-SBX-MIGRATION-01-R3 — App 795 Seed Readback Comparator Corrective

Updated: 2026-09-11 ICT  
Work Package: `D3-SBX-MIGRATION-01-R3`  
Mode: `SOURCE / TEST / DOCS ONLY`  
Base Canonical HEAD: `e578f5b411d0449bb1f3a8317dc843a022ba4a3f`  
Canonical Branch: `ai/antigravity-wp002c`  
Repository: `rebootob/MBO2026`  
Authorization: *** D3-SBX-MIGRATION-01-R3 SOURCE/TEST/DOCS-ONLY / ZERO KINTONE I/O ตามขอบเขตที่เสนอ”`  
Target Verdict: `D3-SBX-MIGRATION-01-R3 = IMPLEMENTATION COMPLETE / REVIEW REQUIRED`  

---

## 1. Context & Recovery Boundary (from R2)

During the `D3-SBX-MIGRATION-01-R2` live migration execution, the runner successfully executed:
- `APP795_STAGE_OPTIONAL_FIELDS`: Staged 5 fields on App 795
- `APP795_ACTIVATE_STAGED_SCHEMA`: App 795 deployed to live revision `12` (field count: 33)
- `APP795_SEED_EXACT_20`: Updated all 20 records atomically; record revisions advanced to `6`

The runner then stopped at `APP795_SEED_READBACK` under the fail-closed partial write rule (`D3_LIVE_PARTIAL_WRITE_STOP`) because of a semantic mismatch in the comparator:
- **Field:** `Manager_Level2_Approval_Rule` (and unassigned approval rules)
- **Expected Business Value (Manifest):** `""` (empty string for unused stage)
- **Actual Kintone API Return Value:** `null` (Kintone REST API canonically returns `null` for unselected `DROP_DOWN` fields)
- **Defect:** Strict `String(actual) !== String(expected)` evaluated `"null" !== ""`, triggering `APP795_READBACK_VALUE_MISMATCH`.

### Live Recovery Boundary (Frozen State)
- **App 795:** Revision `12`, 33 fields, 20 seeded records at revision `6`. Final schema activation (`APP795_FINALIZE_FIELD_PROPERTIES`) is PENDING.
- **App 794:** Revision `70`, 344 fields, 1 record (0 writes performed, untouched).
- **App 798:** Revision `5`, 23 fields, 0 records (0 writes performed, untouched).
- **Apps 796, 797, 800:** Untouched.

---

## 2. Implementation Corrective

The fix is strictly isolated to the App 795 readback comparison logic in `scripts/kintone/d3-sbx-migration-local-executor-core.js` and re-exported in `scripts/kintone/d3-sbx-migration-local-executor-r1.js`:

### 2.1 Helper Functions
1. `isOptionalDropDownField(fieldCode)`:
   Inspects `routingFields[fieldCode]` from `config/schema-spec.js`.
   Returns `true` **only** if `fieldSpec.type === 'DROP_DOWN'` and `fieldSpec.required !== true`.
   - Optional approval rules (`Manager_Level1_Approval_Rule`, `Manager_Level2_Approval_Rule`, `GM_Level1_Approval_Rule`, `GM_Level2_Approval_Rule`) return `true`.
   - Required dropdowns (`Version_Status`, `Route_Pattern`) return `false`.
   - Non-dropdown fields (`Version_Key`, `Version_Number`, `Scorer_Priority_Slots`, `Routing_Key`, etc.) return `false`.

2. `isReadBackValueEqual(fieldCode, actual, expected)`:
   - For **OPTIONAL / UNASSIGNED DROP_DOWN** fields only:
     If `actual` is blank (`null` or `""`) and `expected` is blank (`""` or `null`), compares as semantically equivalent blank (`true`).
   - For all other fields or non-blank values:
     Requires exact string equivalence (`String(actual) === String(expected)`).

### 2.2 Invariant & Fail-Closed Enforcement in `assertApp795SeedReadBack`
1. `record.Routing_Key !== undefined && readString(record.Routing_Key) !== operation.preconditions.Routing_Key`: Fails closed with `APP795_ROUTING_KEY_DRIFT` if routing identity does not match expected preconditions.
2. `!(fieldCode in record) || record[fieldCode] === undefined`: Fails closed with `APP795_READBACK_VALUE_MISMATCH` if any required contract field is missing from the record.
3. Uses `isReadBackValueEqual(fieldCode, actual, expected)` for every field in `operation.values`.

---

## 3. Targeted Test Verification

Added dedicated test suite `tests/d3-sbx-migration-seed-readback-comparator.test.js` (13 tests) proving:
1. `isOptionalDropDownField`: accurately identifies optional approval rules and rejects required dropdowns and non-dropdowns.
2. `OPTIONAL DROP_DOWN`: `expected ""` / `actual null` = PASS.
3. `OPTIONAL DROP_DOWN`: `expected ""` / `actual ""` = PASS.
4. `OPTIONAL DROP_DOWN`: `expected "ALL"` / `actual null` = FAIL.
5. `OPTIONAL DROP_DOWN`: `expected ""` / `actual "ALL"` = FAIL.
6. Required dropdown (`Route_Pattern`, `Version_Status`): `expected "PATTERN_2_M1_G1"` / `actual null` = FAIL.
7. Required dropdown: `expected ""` / `actual null` = FAIL.
8. Non-dropdown business fields (`Version_Key`, `Scorer_Priority_Slots`, `Version_Number`): value mismatch = FAIL.
9. Realistic App 795 20-row readback with live Kintone `{ type: 'DROP_DOWN', value: null }` for unused approval rules = PASS.
10. Wrong `Route_Pattern` in App 795 record = FAIL (`APP795_READBACK_VALUE_MISMATCH`).
11. Wrong `Version_Key` in App 795 record = FAIL (`APP795_READBACK_VALUE_MISMATCH`).
12. Wrong `Scorer_Priority_Slots` in App 795 record = FAIL (`APP795_READBACK_VALUE_MISMATCH`).
13. Wrong routing identity (`Routing_Key`) in App 795 record = FAIL (`APP795_ROUTING_KEY_DRIFT`).
14. Missing field in App 795 record = FAIL (`APP795_READBACK_VALUE_MISMATCH`).

### Test Results
- `node --check scripts/kintone/d3-sbx-migration-local-executor-core.js`: PASS
- `node --check scripts/kintone/d3-sbx-migration-local-executor-r1.js`: PASS
- `tests/d3-sbx-migration-seed-readback-comparator.test.js`: 13/13 PASS
- `tests/d3-sbx-migration-schema-descriptors.test.js`: 5/5 PASS
- `tests/d3-sbx-migration-live-binding-r2.test.js`: 6/6 PASS
- `tests/d3-sbx-migration-live-binding.test.js`: 10/10 PASS
- `tests/d3-sbx-migration-local-executor-r1.test.js`: 10/10 PASS
- `tests/d3-sbx-migration-local-executor-r2.test.js`: 6/6 PASS
- `tests/d3-sbx-migration-local-executor.test.js`: 12/12 PASS
- Total regression run: **62/62 PASS (0 FAIL)**.

---

## 4. Safety & Governance Adherence

- **Kintone I/O:** ZERO (KINTONE_READS = 0, KINTONE_WRITES = 0).
- **Live Retry:** ZERO (LIVE_MIGRATION_RETRIES = 0).
- **Scope:** Source / test / docs only.
- **Next Gate:** UNAUTHORIZED. Awaiting ChatGPT Control Plane review and Owner authorization.
