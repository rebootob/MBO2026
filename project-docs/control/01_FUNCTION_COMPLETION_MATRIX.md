# MBO2026 Function Completion Matrix (Evidence-Grounded Final Rebaseline)

## Overview & Progress Weighting Model

Overall project progress is calculated dynamically from this canonical inventory of 65 material MBO2026 functions across 19 operational domains (A–S). Every function represents a concrete user, business, security, or architectural capability grounded in verifiable repository evidence.

### Weighting Scale
- `NOT_DEFINED` = 0%
- `DEFINED` = 10%
- `IMPLEMENTED` = 40%
- `TESTED` = 65%
- `SANDBOX_VERIFIED` = 80%
- `UAT_PASS` = 95%
- `CLOSED` = 100%

### Definition of CLOSED
A function is marked `CLOSED` if and only if:
1. `REQUIREMENT_DEFINED` = `YES`
2. `SRC_IMP` = `YES`
3. Required automated unit/integration tests = `PASS`
4. Required security/privacy tests = `PASS`
5. Required sandbox verification = `PASS` (or `N/A` with explicit rationale for internal engine/guards)
6. Required UAT = `PASS` (or `N/A` with explicit rationale for non-user-facing core engine functions)
7. Material blockers = `0`
8. Concrete, verifiable repository evidence paths recorded in the `EVIDENCE` field.

> [!NOTE]
> **EXCLUSIONS & ARCHITECTURAL BOUNDARIES**:
> - **Auth Bridge (`src/services/mbo-auth-bridge`)**: CANCELLED / SUPERSEDED. D1 is strictly KINTONE-ONLY. Auth Bridge is excluded from active production scope and MUST NOT become a production dependency.
> - **Activation Service (`src/services/mbo-activation-service.js`)**: Excluded from active production release inventory pending explicit Owner / Control Plane architectural authority review.
> - **Calculation & Grade Cutoffs (`SCORE-005`, `SCORE-006`)**: Separated from configuration authority and classified as `DEFINED` due to absence of dedicated isolated automated unit test suites.

---

## Function Inventory

### Domain A: Identity & Security (`AUTH`)

| FUNCTION_ID | FUNCTION_NAME | D_STAGE | REQ_DEF | SRC_IMP | TEST_STATUS | SANDBOX_STATUS | UAT_STATUS | EVIDENCE | BLOCKER | STATUS |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- | :--- | :--- |
| `AUTH-001` | Password Authentication & Bcrypt Hashing Service | D1 | YES | YES | PASS | PASS | N/A (Internal engine) | `src/services/mbo-password-service.js`, `tests/mbo-password-service.test.js` | NONE | **CLOSED** |
| `AUTH-002` | Kintone User Auth Adapter & Credentials Verification | D1 | YES | YES | PASS | PASS | N/A (Adapter) | `src/ui/mbo-kintone-auth-adapter.js`, `tests/mbo-kintone-auth-adapter.test.js` | NONE | **CLOSED** |
| `AUTH-003` | Session Token Management & Expiration | D1 | YES | YES | PASS | PASS | N/A (Internal engine) | `src/ui/mbo-session-manager.js`, `src/services/mbo-auth-session-service.js`, `tests/mbo-session-manager.test.js`, `tests/mbo-auth-session-service.test.js` | NONE | **CLOSED** |
| `AUTH-004` | Hybrid Identity Access Resolver | D1 | YES | YES | PASS | PASS | PASS | `src/services/mbo-identity-service.js`, `tests/d1-hybrid-identity-core-source.test.js`, `tests/mbo-identity-service.test.js` | NONE | **CLOSED** |
| `AUTH-005` | Login Gate & Authentication Middleware | D1 | YES | YES | PASS | PASS | PASS | `src/ui/mbo-kintone-login-gate.js`, `tests/mbo-kintone-login-gate.test.js` | NONE | **CLOSED** |
| `AUTH-006` | Gateway Server Authentication Endpoints | D1 | YES | YES | PASS | PASS | PASS | `src/server/mbo-gateway-server.js`, `tests/mbo-gateway-server.test.js` | NONE | **CLOSED** |

---

### Domain B: Employee Self / My MBO (`SELF`)

| FUNCTION_ID | FUNCTION_NAME | D_STAGE | REQ_DEF | SRC_IMP | TEST_STATUS | SANDBOX_STATUS | UAT_STATUS | EVIDENCE | BLOCKER | STATUS |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- | :--- | :--- |
| `SELF-001` | Employee Self Gateway Endpoints | D1 | YES | YES | PASS | PASS | PASS | `src/services/mbo-employee-self-gateway.js`, `tests/mbo-employee-self-gateway.test.js` | NONE | **CLOSED** |
| `SELF-002` | Employee Main App UI & Part A Presentation | D1 | YES | YES | PASS | PASS | PASS | `src/main-mbo-app.js`, `src/ui/employee-part-a-ui.js`, `tests/employee-main-mbo-app-integration.test.js` | NONE | **CLOSED** |
| `SELF-003` | Employee Self Index Navigation & Delete Guard Policy | D1 | YES | YES | PASS | PASS | PASS | `src/ui/employee-self-index-ui.js`, `src/security/delete-guard-policy.js`, `tests/employee-self-index-ui.test.js` | NONE | **CLOSED** |
| `SELF-004` | Employee Record Navigation | D1 | YES | YES | PASS | PASS | PASS | `src/ui/employee-record-navigation.js`, `tests/employee-record-navigation.test.js` | NONE | **CLOSED** |
| `SELF-005` | Employee Field Visibility & Stage Privacy Enforcement | D1 | YES | YES | PASS | PASS | PASS | `src/ui/employee-visibility.js`, `tests/objective-save-validation.test.js`, `tests/ui-stage-and-privacy.test.js` | NONE | **CLOSED** |

---

### Domain C: Annual MBO Record / Fiscal Year (`MBO`)

| FUNCTION_ID | FUNCTION_NAME | D_STAGE | REQ_DEF | SRC_IMP | TEST_STATUS | SANDBOX_STATUS | UAT_STATUS | EVIDENCE | BLOCKER | STATUS |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- | :--- | :--- |
| `MBO-001` | Japanese Fiscal Year Engine & Record Key Derivation | D1 | YES | YES | PASS | PASS | N/A (Core engine) | `src/core/fiscal-year-engine.js`, `src/config/constants.js`, `tests/annual-record-foundation.test.js`, `tests/record-key.test.js` | NONE | **CLOSED** |
| `MBO-002` | Annual Record Service & Initialization Lifecycle | D1 | YES | YES | PASS | PASS | PASS | `src/services/annual-record-service.js`, `src/services/employee-service.js`, `tests/annual-record-initialization.test.js` | NONE | **CLOSED** |
| `MBO-003` | Kintone Field Normalizer & Record Reader | D1 | YES | YES | PASS | PASS | N/A (Core normalizer) | `src/core/kintone-normalizer.js`, `tests/kintone-normalizer.test.js` | NONE | **CLOSED** |

---

### Domain D: Hoshin (`HOSHIN`)

| FUNCTION_ID | FUNCTION_NAME | D_STAGE | REQ_DEF | SRC_IMP | TEST_STATUS | SANDBOX_STATUS | UAT_STATUS | EVIDENCE | BLOCKER | STATUS |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- | :--- | :--- |
| `HOSHIN-001` | Department & Section Hoshin Alignment Service | D1 | YES | YES | PASS | PASS | PASS | `src/services/hoshin-service.js`, `tests/hoshin-service.test.js` | NONE | **CLOSED** |

---

### Domain E: Objective Planning & Validation (`OBJ`)

| FUNCTION_ID | FUNCTION_NAME | D_STAGE | REQ_DEF | SRC_IMP | TEST_STATUS | SANDBOX_STATUS | UAT_STATUS | EVIDENCE | BLOCKER | STATUS |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- | :--- | :--- |
| `OBJ-001` | Objective Capacity Scaling (N=4 to 10) & Normalization | D1 | YES | YES | PASS | PASS | PASS | `src/core/kintone-normalizer.js`, `tests/objective-save-validation.test.js` | NONE | **CLOSED** |
| `OBJ-002` | Objective & Action Plan Save Validation Engine | D1 | YES | YES | PASS | PASS | PASS | `src/validation/validation-engine.js`, `tests/validation-engine.test.js`, `tests/objective-save-validation.test.js` | NONE | **CLOSED** |
| `OBJ-003` | Copy Previous Year Objectives Utility | D1 | YES | YES | PASS | NOT_VERIFIED | NOT_TESTED | `src/services/copy-previous.js`, `tests/copy-previous.test.js` | Pending UAT / Sandbox | **TESTED** |

---

### Domain F: Routing / Approval (`ROUTE`)

| FUNCTION_ID | FUNCTION_NAME | D_STAGE | REQ_DEF | SRC_IMP | TEST_STATUS | SANDBOX_STATUS | UAT_STATUS | EVIDENCE | BLOCKER | STATUS |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- | :--- | :--- |
| `ROUTE-001` | Employee Master Routing Matrix & Scenario Resolver | D1 | YES | YES | PASS | PASS | PASS | `src/services/routing-service.js`, `tests/routing-service.test.js` | NONE | **CLOSED** |
| `ROUTE-002` | App795 Team Routing Resolver | D1 | YES | YES | PASS | PASS | PASS | `src/services/app795-team-routing.js`, `tests/app795-team-routing.test.js`, `tests/requester-mapping-audit.test.js` | NONE | **CLOSED** |
| `ROUTE-003` | MBO Approval Task & Assignee Verification Service | D1 | YES | YES | PASS | PASS | PASS | `src/services/mbo-approval-task-service.js`, `tests/mbo-approval-task-service.test.js` | NONE | **CLOSED** |
| `ROUTE-004` | App794 Workflow Action Executions & State Transitions | D3 | YES | NO | NOT_TESTED | NOT_VERIFIED | NOT_TESTED | `project-docs/CONFIRMED_BASELINE/ROUTING_WORKFLOW.md` | D3 Hold | **DEFINED** |
| `ROUTE-005` | Workflow Payload Security Validator | D1 | YES | YES | PASS | PASS | N/A (Core guard) | `src/core/workflow-validator.js`, `tests/workflow-validator.test.js` | NONE | **CLOSED** |
| `ROUTE-006` | Approver Task Index UI Presentation | D1 | YES | YES | NOT_TESTED | NOT_VERIFIED | NOT_TESTED | `src/ui/approver-task-index-ui.js` | Dedicated automated test suite required | **IMPLEMENTED** |

---

### Domain G: Evaluation & Scoring (`SCORE`)

| FUNCTION_ID | FUNCTION_NAME | D_STAGE | REQ_DEF | SRC_IMP | TEST_STATUS | SANDBOX_STATUS | UAT_STATUS | EVIDENCE | BLOCKER | STATUS |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- | :--- | :--- |
| `SCORE-001` | Profile Codes Policy & Position Mapping Resolution | D1 | YES | YES | PASS | PASS | PASS | `src/profiles/profile-codes-policy.js`, `src/profiles/profile-scoring-resolver.js`, `src/profiles/runtime-profile-resolver.js`, `tests/profile-scoring-resolver.test.js`, `tests/position-profile-mapping-closure.test.js` | NONE | **CLOSED** |
| `SCORE-002` | Scoring Configuration Master Authority & Spec | D1 | YES | YES | PASS | PASS | PASS | `src/profiles/scoring-config-master.js`, `tests/scoring-config-master.test.js` | NONE | **CLOSED** |
| `SCORE-003` | Scoring Configuration Repository & Lifecycle Service | D1 | YES | YES | PASS | PASS | PASS | `src/services/scoring-config-kintone-repository.js`, `src/services/scoring-config-master-service.js`, `tests/scoring-config-kintone-repository.test.js`, `tests/scoring-config-master-service.test.js`, `tests/scoring-config-supersession-integration.test.js` | NONE | **CLOSED** |
| `SCORE-004` | Part A & Part B Weighting Authority Resolver | D1 | YES | YES | PASS | PASS | PASS | `src/profiles/scoring-config-master.js`, `src/profiles/profile-scoring-resolver.js`, `tests/scoring-config-master.test.js`, `tests/profile-scoring-resolver.test.js` | NONE | **CLOSED** |
| `SCORE-005` | Dynamic Evaluation Score Calculation Engine | D1 | YES | NO | NOT_TESTED | NOT_VERIFIED | NOT_TESTED | Handled via Kintone App 794 CALC fields & UI read-back; dedicated isolated calculation unit test engine absent | Dedicated calculation test suite required | **DEFINED** |
| `SCORE-006` | Final Grade & Evaluation Rating Cutoff Mapper | D1 | YES | NO | NOT_TESTED | NOT_VERIFIED | NOT_TESTED | Rating cutoffs documented in business rules; dedicated grade-cutoff module & test suite absent | Dedicated grade cutoff unit test suite required | **DEFINED** |

---

### Domain H: Competency / COCE (`COMP`)

| FUNCTION_ID | FUNCTION_NAME | D_STAGE | REQ_DEF | SRC_IMP | TEST_STATUS | SANDBOX_STATUS | UAT_STATUS | EVIDENCE | BLOCKER | STATUS |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- | :--- | :--- |
| `COMP-001` | Competency Dictionary & Profile Binding (6, 7, 8 Items) | D2 | YES | YES | PASS | PASS | PASS | `src/profiles/mbo-xlsx-template-profile.js`, `tests/mbo-xlsx-template-profile.test.js` | NONE | **CLOSED** |
| `COMP-002` | Competency Presentation Titles (b7 Leadership, b8 Strategy) | D2 | YES | YES | PASS | PASS | PASS | `src/profiles/mbo-xlsx-template-profile.js`, `tests/mbo-xlsx-template-profile.test.js` | NONE | **CLOSED** |

---

### Domain I: Comments & History (`HIST`)

| FUNCTION_ID | FUNCTION_NAME | D_STAGE | REQ_DEF | SRC_IMP | TEST_STATUS | SANDBOX_STATUS | UAT_STATUS | EVIDENCE | BLOCKER | STATUS |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- | :--- | :--- |
| `HIST-001` | Employee & Evaluator Comment Mirroring | D1 | YES | YES | PASS | PASS | PASS | `src/ui/employee-comment-mirror.js`, `tests/employee-comment-mirror.test.js` | NONE | **CLOSED** |
| `HIST-002` | Confidential Evaluator Comment Privacy Filtering | D2 | YES | YES | PASS | PASS | PASS | `src/services/mbo-export-service.js`, `tests/mbo-export-service.test.js` | NONE | **CLOSED** |

---

### Domain J: Excel / Document Export (`XLSX`)

| FUNCTION_ID | FUNCTION_NAME | D_STAGE | REQ_DEF | SRC_IMP | TEST_STATUS | SANDBOX_STATUS | UAT_STATUS | EVIDENCE | BLOCKER | STATUS |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- | :--- | :--- |
| `XLSX-001` | MBO XLSX Template Profile Authority | D2 | YES | YES | PASS | PASS | PASS | `src/profiles/mbo-xlsx-template-profile.js`, `tests/mbo-xlsx-template-profile.test.js` | NONE | **CLOSED** |
| `XLSX-002` | Part A Template Preparer & Sanitizer | D2 | YES | YES | PASS | PASS | PASS | `src/services/mbo-xlsx-template-preparer.js`, `tests/mbo-xlsx-template-preparer.test.js` | NONE | **CLOSED** |
| `XLSX-003` | Part B Template Preparer & Sanitizer | D2 | YES | YES | PASS | PASS | PASS | `src/services/mbo-xlsx-template-preparer.js`, `tests/mbo-xlsx-template-preparer-part-b.test.js` | NONE | **CLOSED** |
| `XLSX-004` | Production Semantic Value Renderer | D2 | YES | YES | PASS | PASS | PASS | `src/services/mbo-xlsx-semantic-renderer.js`, `tests/mbo-xlsx-semantic-renderer.test.js` | NONE | **CLOSED** |
| `XLSX-005` | Combined Workbook Composer | D2 | YES | YES | PASS | PASS | PASS | `src/services/mbo-xlsx-combined-composer.js`, `tests/mbo-xlsx-combined-composer.test.js` | NONE | **CLOSED** |
| `XLSX-006` | MBO Export Service Authorization & Generation | D2 | YES | YES | PASS | PASS | PASS | `src/services/mbo-export-service.js`, `tests/mbo-export-service.test.js` | NONE | **CLOSED** |
| `XLSX-007` | PDF Document Generator / Export Conversion | D2 | YES | NO | NOT_TESTED | NOT_VERIFIED | NOT_TESTED | `project-docs/EXCEL_EXPORT.md` | Scope Review Required (PROD_BLOCKING = NO) | **DEFINED** |

---

### Domain K: HR Control Center (`HRCC`)

| FUNCTION_ID | FUNCTION_NAME | D_STAGE | REQ_DEF | SRC_IMP | TEST_STATUS | SANDBOX_STATUS | UAT_STATUS | EVIDENCE | BLOCKER | STATUS |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- | :--- | :--- |
| `HRCC-001` | HR Dashboard & Monitoring Service | D4 | YES | YES | PASS | NOT_VERIFIED | NOT_TESTED | `src/services/hr-dashboard-service.js`, `tests/hr-dashboard-service.test.js` (3 PASS) | D4 Hold | **TESTED** |
| `HRCC-002` | HR Control Center Reset UI | D4 | YES | YES | PASS | NOT_VERIFIED | NOT_TESTED | `src/ui/hr-control-center.js`, `tests/hr-control-center-reset-ui.test.js` | D4 Hold | **TESTED** |
| `HRCC-003` | Admin Support Center & Diagnostic Engine | D4 | YES | YES | PASS | NOT_VERIFIED | NOT_TESTED | `src/admin/admin-support-center.js`, `src/admin/admin-diagnostic-model.js`, `tests/admin-support-center.test.js` | D4 Hold | **TESTED** |

---

### Domain L: Employee Lifecycle (`LIFE`)

| FUNCTION_ID | FUNCTION_NAME | D_STAGE | REQ_DEF | SRC_IMP | TEST_STATUS | SANDBOX_STATUS | UAT_STATUS | EVIDENCE | BLOCKER | STATUS |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- | :--- | :--- |
| `LIFE-001` | Employee Lookup Service | D1 | YES | YES | PASS | PASS | PASS | `src/services/employee-service.js`, `tests/employee-lookup-service.test.js` | NONE | **CLOSED** |
| `LIFE-002` | Mid-Year Department / Section Transfer Handler | D5 | YES | NO | NOT_TESTED | NOT_VERIFIED | NOT_TESTED | `project-docs/CONFIRMED_BASELINE/EMPLOYEE_LIFECYCLE_CHANGE_POLICY.md` | D5 Hold | **DEFINED** |
| `LIFE-003` | Promotion / Profile Code Transition Handler | D5 | YES | NO | NOT_TESTED | NOT_VERIFIED | NOT_TESTED | `project-docs/CONFIRMED_BASELINE/EMPLOYEE_LIFECYCLE_CHANGE_POLICY.md` | D5 Hold | **DEFINED** |

---

### Domain M: Reopen / Revision (`REOPEN`)

| FUNCTION_ID | FUNCTION_NAME | D_STAGE | REQ_DEF | SRC_IMP | TEST_STATUS | SANDBOX_STATUS | UAT_STATUS | EVIDENCE | BLOCKER | STATUS |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- | :--- | :--- |
| `REOPEN-001` | Post-Approval Reopen Request Handler | D3 | YES | NO | NOT_TESTED | NOT_VERIFIED | NOT_TESTED | `project-docs/BUSINESS_RULES.md` | D3 Hold | **DEFINED** |
| `REOPEN-002` | Evaluation Revision Versioning Guard | D3 | YES | NO | NOT_TESTED | NOT_VERIFIED | NOT_TESTED | `project-docs/BUSINESS_RULES.md` | D3 Hold | **DEFINED** |

---

### Domain N: Annual Carry Forward (`CARRY`)

| FUNCTION_ID | FUNCTION_NAME | D_STAGE | REQ_DEF | SRC_IMP | TEST_STATUS | SANDBOX_STATUS | UAT_STATUS | EVIDENCE | BLOCKER | STATUS |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- | :--- | :--- |
| `CARRY-001` | Fiscal Year Transition & Carry-Forward Service | D5 | YES | NO | NOT_TESTED | NOT_VERIFIED | NOT_TESTED | `project-docs/BUSINESS_RULES.md` | D5 Hold | **DEFINED** |

---

### Domain O: Admin / Diagnostics & Core Guards (`DIAG`)

| FUNCTION_ID | FUNCTION_NAME | D_STAGE | REQ_DEF | SRC_IMP | TEST_STATUS | SANDBOX_STATUS | UAT_STATUS | EVIDENCE | BLOCKER | STATUS |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- | :--- | :--- |
| `DIAG-001` | Sandbox Write Guard & Target Resolution | D1 | YES | YES | PASS | PASS | N/A (Core guard) | `src/core/sandbox-write-guard.js`, `tests/sandbox-write-guard.test.js`, `tests/safety-guard.test.js` | NONE | **CLOSED** |
| `DIAG-002` | Kintone Client & Schema Authorization Bridge | D1 | YES | YES | PASS | PASS | N/A (Core client) | `src/core/kintone-client.js`, `tests/safety-guard.test.js`, `tests/schema-delta-manifest.test.js` | NONE | **CLOSED** |
| `DIAG-003` | UI Lookup Atomicity & Stale State Recovery | D1 | YES | YES | PASS | PASS | PASS | `src/ui/employee-part-a-ui.js`, `tests/lookup-atomicity-stale-state.test.js` | NONE | **CLOSED** |
| `DIAG-004` | Browser Host Resolver & Space Element Guard | D1 | YES | YES | PASS | PASS | PASS | `src/ui/host-resolver.js`, `tests/host-resolver.test.js` | NONE | **CLOSED** |

---

### Domain P: Security / Regression / UAT (`UAT`)

| FUNCTION_ID | FUNCTION_NAME | D_STAGE | REQ_DEF | SRC_IMP | TEST_STATUS | SANDBOX_STATUS | UAT_STATUS | EVIDENCE | BLOCKER | STATUS |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- | :--- | :--- |
| `UAT-001` | Employee Self Cross-Employee Privacy Protection | D2 | YES | YES | PASS | PASS | PASS | `tests/mbo-export-service.test.js`, `src/services/mbo-export-service.js` | NONE | **CLOSED** |
| `UAT-002` | Shared Mode Assignee Export Denied Guard | D2 | YES | YES | PASS | PASS | PASS | `tests/mbo-export-service.test.js`, `src/services/mbo-export-service.js` | NONE | **CLOSED** |
| `UAT-003` | Technical Admin & Form Access Export Denied Guard | D2 | YES | YES | PASS | PASS | PASS | `tests/mbo-export-service.test.js`, `src/services/mbo-export-service.js` | NONE | **CLOSED** |
| `UAT-004` | End-to-End Business User Acceptance Verification | D6 | NO | NO | NOT_TESTED | NOT_VERIFIED | NOT_TESTED | `project-docs/00_MASTER_JOBLIST.md` | D6 Gate | **NOT_DEFINED** |

---

### Domain Q: Legacy Migration (`MIG`)

| FUNCTION_ID | FUNCTION_NAME | D_STAGE | REQ_DEF | SRC_IMP | TEST_STATUS | SANDBOX_STATUS | UAT_STATUS | EVIDENCE | BLOCKER | STATUS |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- | :--- | :--- |
| `MIG-001` | Legacy PMS Record Normalization Service | D5 | YES | YES | PASS | NOT_VERIFIED | NOT_TESTED | `src/services/legacy-migration-service.js`, `tests/legacy-migration-service.test.js` | D5 Hold | **TESTED** |
| `MIG-002` | Legacy Migration Reconciliation & Audit | D5 | YES | NO | NOT_TESTED | NOT_VERIFIED | NOT_TESTED | `project-docs/CONFIRMED_BASELINE/LEGACY_PMS_APPS.md` | D5 Hold | **DEFINED** |

---

### Domain R: Production / Backup / Rollback (`PROD`)

| FUNCTION_ID | FUNCTION_NAME | D_STAGE | REQ_DEF | SRC_IMP | TEST_STATUS | SANDBOX_STATUS | UAT_STATUS | EVIDENCE | BLOCKER | STATUS |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- | :--- | :--- |
| `PROD-001` | Pre-Deployment App Schema Backup Utility | D7 | YES | NO | NOT_TESTED | NOT_VERIFIED | NOT_TESTED | `project-docs/CONFIRMED_BASELINE/ROLLBACK_RECOVERY_SAFETY.md` | D7 Hold | **DEFINED** |
| `PROD-002` | Production Rollback Recovery Safety Automation | D7 | YES | NO | NOT_TESTED | NOT_VERIFIED | NOT_TESTED | `project-docs/CONFIRMED_BASELINE/ROLLBACK_RECOVERY_SAFETY.md`, `scripts/kintone/deploy-custom-ui.js`, `tests/deploy-customization-preservation.test.js` | D7 Hold | **DEFINED** |
| `PROD-003` | Production Cutover Execution Plan | D7 | NO | NO | NOT_TESTED | NOT_VERIFIED | NOT_TESTED | `project-docs/00_MASTER_JOBLIST.md` | D7 Gate | **NOT_DEFINED** |

---

### Domain S: Attachments (`ATTACH`)

| FUNCTION_ID | FUNCTION_NAME | D_STAGE | REQ_DEF | SRC_IMP | TEST_STATUS | SANDBOX_STATUS | UAT_STATUS | EVIDENCE | BLOCKER | STATUS |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- | :--- | :--- |
| `ATTACH-001` | Attachment File Upload & REST Binding Service | D1 | YES | YES | PASS | PASS | PASS | `src/services/mbo-attachment-service.js`, `tests/timeline-truthfulness-and-attachment.test.js` | NONE | **CLOSED** |
| `ATTACH-002` | Attachment UI Preview & File Type Guard | D1 | YES | YES | PASS | PASS | PASS | `src/services/mbo-attachment-service.js`, `tests/timeline-truthfulness-and-attachment.test.js` | NONE | **CLOSED** |

---

## Matrix Summary & Progress Tally

- **Total Inventoried Functions**: `65`
- **CLOSED (100% weight)**: `45` (4,500 pts)
- **UAT_PASS (95% weight)**: `0` (0 pts)
- **SANDBOX_VERIFIED (80% weight)**: `0` (0 pts)
- **TESTED (65% weight)**: `5` (325 pts)
- **IMPLEMENTED (40% weight)**: `1` (40 pts)
- **DEFINED (10% weight)**: `12` (120 pts)
- **NOT_DEFINED (0% weight)**: `2` (0 pts)
- **BLOCKED**: `18` (retains technical level, flagged above)
- **DEFERRED**: `0`

**Total Score**: 4,985 / 6,500
**Candidate Calculated Progress**: **76.69%**
