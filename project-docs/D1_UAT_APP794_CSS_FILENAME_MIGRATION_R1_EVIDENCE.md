# D1 App794 Sandbox CSS Filename Migration Evidence (R1)

- **Date:** 2026-09-08 ICT
- **Branch:** `ai/antigravity-wp002c`
- **Work Package:** `D1-UAT-APP794-CSS-FILENAME-MIGRATION-R1`
- **Authorization ID:** `D1-UAT-APP794-CSS-FILENAME-MIGRATION-20260908-01`
- **Target App:** App 794 (MBO Main Application Sandbox)
- **Execution Source HEAD:** `cd74b01e6650bb04b5fbdba6c365dd9a1bf87236`
- **Target Scope:** Desktop Customization CSS Target Filename Only

---

## 1. Migration Evidence Matrix

```text
WORK_PACKAGE                             = D1-UAT-APP794-CSS-FILENAME-MIGRATION-R1
AUTHORIZATION_ID                         = D1-UAT-APP794-CSS-FILENAME-MIGRATION-20260908-01
EXECUTION_SOURCE_HEAD                    = cd74b01e6650bb04b5fbdba6c365dd9a1bf87236
TARGET_APP_ID                            = 794
MIGRATION_ATTEMPT_COUNT                  = 1
MIGRATION_RESULT                         = SUCCESS (Canonical CSS Target Applied)
RETRY_COUNT                              = 0
ROLLBACK_COUNT                           = 0

PRE_MIGRATION_APP794_REVISION            = 68
POST_MIGRATION_APP794_REVISION           = 69
PRE_MIGRATION_PREVIEW_REVISION           = 68
POST_MIGRATION_PREVIEW_REVISION          = 69

LIVE_SCOPE_BEFORE                        = ALL
LIVE_SCOPE_AFTER                         = ALL
PREVIEW_SCOPE_BEFORE                     = ALL
PREVIEW_SCOPE_AFTER                      = ALL

TOPOLOGY_BEFORE                          = Desktop JS: 1, Desktop CSS: 1, Mobile JS: 0, Mobile CSS: 0
TOPOLOGY_AFTER                           = Desktop JS: 1, Desktop CSS: 1, Mobile JS: 0, Mobile CSS: 0

OLD_CSS_FILENAME                         = mbo-employee .css
NEW_CSS_FILENAME                         = mbo-employee.css
OLD_CSS_BLOB                             = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
NEW_DEPLOYED_CSS_BLOB                    = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
CSS_BYTE_CHANGE                          = NO (Exact 100% byte match)

JS_FILENAME_BEFORE                       = mbo-employee-app.js
JS_FILENAME_AFTER                        = mbo-employee-app.js
JS_BLOB_BEFORE                           = 8958634b92b35f74b58a7a0b2abd09b8b5e93758
JS_BLOB_AFTER                            = 8958634b92b35f74b58a7a0b2abd09b8b5e93758
JS_CHANGE                                = NO (Zero JS upload / preserved unchanged)

NORMAL_DEPLOY_TOOL_PREFLIGHT_AFTER       = PASS (validatePreflight returns true)

APP794_RECORD_WRITES                     = 0
APP53_WRITES                             = 0
APP795_WRITES                            = 0
APP796_WRITES                            = 0
APP797_WRITES                            = 0
APP798_WRITES                            = 0
APP800_WRITES                            = 0
APP801_WRITES                            = 0
SCHEMA_WRITES                            = 0
LAYOUT_WRITES                            = 0
ACL_WRITES                               = 0
PROCESS_WRITES                           = 0

D2_STAGE_STATUS                          = PASS / CLOSED / DURABLE (unchanged)
D3_STAGE_STATUS                          = HOLD (not started)
OWNER_RUNTIME_UAT                        = PENDING_OWNER_EXECUTION
CONTROL_PLANE_REVIEW                     = PENDING_INDEPENDENT_REVIEW
```

---

## 2. Migration Operations & Tooling Details

1. **Migration Tooling (`scripts/kintone/migrate-app794-css-target.js`)**:
   - Implemented a dedicated, migration-only execution helper without modifying or weakening the existing fail-closed behavior of `scripts/kintone/deploy-custom-ui.js`.
   - Hard-locked target App ID to 794.
   - Enforced preflight requiring legacy filename `"mbo-employee .css"` and destination `"mbo-employee.css"`.
   - Verified that live JS blob equals `8958634b92b35f74b58a7a0b2abd09b8b5e93758` and live CSS blob equals `0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61`.
   - Uploaded ONLY candidate CSS bytes (`0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61`) with canonical filename `mbo-employee.css` (0 JS uploads).
   - Updated Preview customization preserving existing JS entry and deployed Live App 794 (Revision 68 -> 69).

2. **Migration Verification Tests (`tests/migrate-app794-css-target.test.js`)**:
   - Comprehensive unit test suite covering preflight verification, appId lock, scope alignment, topology enforcement, filename assertion, blob SHA exactness, and payload generation.
   - Executed: 40/40 tests PASS (9 migration tests + 31 deploy preservation tests).

3. **Post-Migration Readback & Normal Deploy Tool Compatibility**:
   - Direct GET from Kintone confirmed Live CSS is `mbo-employee.css` with Git blob `0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61`.
   - Direct GET confirmed Live JS is `mbo-employee-app.js` with Git blob `8958634b92b35f74b58a7a0b2abd09b8b5e93758`.
   - Executed dry-run preflight of canonical `deploy-custom-ui.js` against current live/preview App 794 state -> returned `NORMAL_DEPLOY_TOOL_VALIDATE_PREFLIGHT_PASS: true`.

---

## 3. Invariants & Scope Attestation

- **No Application Logic Modification**: Source code under `src/` was completely untouched.
- **Zero Record Writes**: 0 record modifications across all Kintone applications.
- **Zero Schema / Layout / ACL / Workflow Writes**: 0 administrative modifications.
- **D2**: Remained `PASS / CLOSED / DURABLE`.
- **D3**: Remains strictly on `HOLD`.
- **No Self-Certification**: UAT closure and Stage closure are deferred to Owner and ChatGPT Control Plane.
