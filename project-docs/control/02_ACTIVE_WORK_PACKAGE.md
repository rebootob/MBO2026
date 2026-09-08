# MBO2026 Active Work Package Contract

Updated: 2026-09-08 ICT

## Current contract state

- **ACTIVE_WORK_PACKAGE**: `D3-WP001-R2`
- **TITLE**: `Effective-Dated Routing Persistence & HR-Configurable Scoring Appraiser Design Corrective`
- **TYPE**: `DESIGN / EVIDENCE-ONLY CORRECTIVE`
- **OWNER_AUTHORIZATION**: `APPROVED`
- **STATUS**: `EXECUTED / AWAITING CONTROL PLANE REVIEW`
- **PARENT_D3_WP001_R1**: `PARTIAL PASS / EFFECTIVE-DATED ROUTING CORRECTIVE REQUIRED`
- **LAST_COMPLETED_WORK_PACKAGE**: `D3-DECISION-SYNC-CLOSE-R1`
- **LAST_COMPLETED_RESULT**: `DUPLICATE CURRENT CONTROL-STATE CLEANUP COMPLETE`
- **D3_DECISION_SYNC**: `PASS / CLOSED`
- **D3_DECISION_SYNC_CLOSE**: `PASS / CLOSED AS CORRECTED`
- **D3_DECISION_SYNC_CLOSE_R1**: `PASS / CLOSED`
- **D3_PRE1_CHAIN**: `PASS / CLOSED AS CORRECTED`
- **DECISION_D3_001**: `LOCKED / OWNER APPROVED`
- **DECISION_D3_002**: `LOCKED / OWNER APPROVED`
- **OWNER_DEC_D3_003**: `LOCKED / OWNER APPROVED (HR_CONFIGURABLE_SCORING_APPRAISERS_WITHIN_WORKFLOW_ROUTE_USING_FROZEN_PROFILE_K_EXPECTED)`
- **SCORER_COUNT_SOURCE**: `FROZEN_EVALUATION_PROFILE_K_EXPECTED (1 or 2)`
- **SCORER_IDENTITY_SELECTOR**: `HR`
- **WORKFLOW_APPRAISER_COUNT**: `1..4`
- **SCORER_WEIGHT_FORMULA**: `DEC-036 UNCHANGED (100% or 50%/50%)`
- **EFFECTIVE_DATED_PERSISTENCE_MODEL**: `MODEL_A_VERSIONED_ROWS_WITH_UNIQUE_VERSION_KEY`
- **APP795_KEY_MIGRATION**: `ROUTING_KEY NON-UNIQUE, VERSION_KEY UNIQUE`
- **TIME_RESOLVER_PURITY**: `READ_ONLY_GET_QUERY (NO ACTIVATION MUTATION)`
- **SCORE_STORAGE_COMPATIBILITY**: `ALTERNATIVE_A_PHYSICAL_COMPATIBILITY_ADAPTER (ZERO APP794 SCHEMA IMPACT)`
- **SELF_APPRAISER_SCORER_ELISION**: `FAIL_CLOSED_IF_SURVIVING_SCORERS_BELOW_K_EXPECTED`
- **THREE_APPRAISER_TOPOLOGIES**: `M1_M2_G1 + M1_G1_G2`
- **APPRAISER_COUNT_DETERMINES_TOPOLOGY**: `NO`
- **ROUTE_PATTERN_REQUIRED**: `YES`
- **HR_ROUTING_SELF_SERVICE_REQUIRED**: `YES`
- **R2_DESIGN_DOCUMENT**: `project-docs/D3_WP001_R2_EFFECTIVE_DATED_ROUTING_HR_SCORING_ROLE_DESIGN.md`
- **HISTORICAL_R1_DESIGN**: `project-docs/D3_WP001_R1_NATIVE_PROCESS_ROUTE_PATTERN_EFFECTIVE_DATED_ROUTING_CORRECTIVE.md (SUPERSEDED WHERE CORRECTED BY R2)`
- **HISTORICAL_PARENT_DESIGN**: `project-docs/D3_WP001_VARIABLE_1_4_APPRAISER_PROCESS_COMPATIBILITY_DESIGN.md (SUPERSEDED WHERE CORRECTED BY R1/R2)`
- **CLOSURE_DOCUMENT**: `project-docs/D3_DECISION_SYNC_CLOSE_CONTROL_PLANE_CLOSURE.md`
- **DECISION_DOCUMENT**: `project-docs/D3_DECISION_SYNC_OWNER_ARCHITECTURE_ROUTING_DECISIONS.md`
- **D3_READINESS**: `DESIGN_CORRECTIVE_COMPLETE / AWAITING_CONTROL_PLANE_REVIEW`
- **NEXT_PERMITTED_ACTION**: `CONTROL_PLANE_REVIEW_OF_D3_WP001_R2`
- **D1_FINAL_CLOSURE**: `PASS / CLOSED`
- **D1_BASE_ARCHITECTURE**: `PASS / CLOSED / DURABLE`
- **D1_UAT_CORRECTIVE_CHAIN**: `PASS / CLOSED`
- **DEFECT001_STATUS**: `PASS / CLOSED`
- **DEFECT002_STATUS**: `PASS / CLOSED`
- **DEFECT003_STATUS**: `PASS / CLOSED`
- **ORIGINAL_OWNER_UAT**: `4/4 PASS`
- **DEFECT003_OWNER_UAT**: `3/3 PASS`
- **APP794_LIVE_REVISION**: `70`
- **LIVE_JS_BLOB**: `204d34db9e2eab297409a6a3d5e7f29c649779d5`
- **LIVE_CSS_BLOB**: `0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61`
- **D2_ENGINEERING**: `PASS / CLOSED / DURABLE`
- **D2_OWNER_UAT**: `IN PROGRESS / PAUSED`
- **D3**: `HOLD / NOT AUTHORIZED`
- **D3_IMPLEMENTATION_AUTHORIZED**: `NO`
- **PRODUCTION_READY**: `NO`
- **DEPLOYMENT_AUTHORIZED**: `NO`
- **KINTONE_WRITES_AUTHORIZED**: `NONE`

## Completed predecessor work packages

1. **`D1-UAT-DEFECT-001-002-SANDBOX-DEPLOY-R2`**
   - Status: `PASS / CLOSED`
   - Execution Commit: `cd74b01e6650bb04b5fbdba6c365dd9a1bf87236`
   - Evidence: `project-docs/D1_UAT_DEFECT_001_002_SANDBOX_DEPLOY_R2_EVIDENCE.md`
   - App794 Live revision advanced from 67 to 68.
   - Candidate JS (`8958634b...`) and CSS (`0532c1c3...`) verified byte-identical to committed artifacts.

2. **`D1-UAT-APP794-CSS-FILENAME-MIGRATION-R1`**
   - Status: `PASS / CLOSED`
   - Execution Commit: `38f5ba111d6ebbfaa09a3415819a92f5a48a1f4d`
   - Evidence: `project-docs/D1_UAT_APP794_CSS_FILENAME_MIGRATION_R1_EVIDENCE.md`
   - App794 Live revision advanced from 68 to 69.
   - Live CSS filename migrated from historical `"mbo-employee .css"` to canonical `"mbo-employee.css"`.
   - Exact CSS bytes preserved (blob `0532c1c3...`).
   - Normal deployment tool preflight restored to PASS (`validatePreflight: true`).

3. **`D1-UAT-DEFECT-003-CLOSE-R1`**
   - Status: `PASS / CLOSED`
   - Execution Commit: `a66c351013534b739426f990bead47eec37c773e`
   - Evidence: `project-docs/D1_UAT_DEFECT_003_OWNER_UAT_CLOSE_R1_EVIDENCE.md`
   - Owner runtime UAT: 3/3 PASS (Back to Home, Forgot Password, Dedicated Deny).

4. **`D1-FINAL-CLOSURE-SYNC`**
   - Status: `PASS / CLOSED`
   - Evidence: `project-docs/D1_FINAL_CLOSURE_CONTROL_PLANE_DECISION.md`
   - Independent Control Plane (ChatGPT) verdict recorded: D1 = PASS / CLOSED.

## Current App794 Live state

- **App ID**: 794
- **Live Revision**: 70
- **Preview Revision**: 70
- **Live Desktop JS**: `mbo-employee-app.js` (blob `204d34db9e2eab297409a6a3d5e7f29c649779d5`)
- **Live Desktop CSS**: `mbo-employee.css` (blob `0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61`)
- **Topology**: Desktop JS = 1, Desktop CSS = 1, Mobile JS = 0, Mobile CSS = 0
- **Total Record / Schema / ACL Writes**: 0

## Allowed operations

Only:
- Reviewing repository documentation and evidence.

Forbidden:
- AI code modifications to `src/`, `tests/`, `scripts/`, `dist/`.
- Additional Kintone deployments or write operations.
- Starting D3 without explicit Owner authorization.
- Self-certifying independent Control Plane review.

## Owner Runtime UAT Status

### Original Focused UAT: 4/4 PASS (Locked Truth)
The original 4 Owner Runtime UAT cases on App794 were executed and verified by Owner:
1. **Case 1 (Dedicated Account Auto-Bind)**: Dedicated user (Ms.Papatchaya) auto-binds to `0113` and opens own MBO -> **PASS**.
2. **Case 2 (Shared Principal Deny on Dedicated Employee)**: Shared principal (`tmh`) + `0113` -> DENIED with dedicated account guidance -> **PASS**.
3. **Case 3 (Shared Principal Allow on Shared Employee)**: Shared principal (`tmh`) + employee with `MBO_Kintone_User.value = []` -> ALLOWED -> **PASS**.
4. **Case 4 (Current-FY Navigation Guard)**: Existing current-FY MBO -> "Open Current MBO" and no Create New path -> **PASS**.

These 4 tests are complete and MUST NOT be re-requested or repeated.

### Focused Owner UAT for DEFECT-003: 3/3 PASS (Owner Verified)
The focused Owner UAT checks on App 794 Live (Revision 70) were personally executed by Owner:
1. **DEFECT003-UAT-1 (Back to Kintone Home)**: PASS (Owner confirmed clicking Back Home cleanly exits blocking overlay to Kintone home).
2. **DEFECT003-UAT-2 (Forgot Password Guidance)**: PASS (Owner confirmed bilingual HR/Admin support guidance appears, no reset triggered).
3. **DEFECT003-UAT-3 (Dedicated Account Deny & Back Home Usable)**: PASS (Owner confirmed dedicated denial remains active and Back Home button functions cleanly).

## Next permitted action

- `CONTROL_PLANE_REVIEW_OF_D3_WP001_R2`.
- Stage D3 remains strictly on HOLD: transition to D3 implementation requires separate explicit Owner authorization and bounded D3 work package. D3 implementation is NOT authorized.

## Permanent rules

- No code change without authorized FUNCTION_ID or DEFECT_ID.
- Exactly one active work package.
- Out-of-scope findings are logged, not auto-fixed.
- Closed functions reopen only for proven regression or explicit Owner change request.
- Security/privacy/data-integrity defects are material and block closure.
- Kintone writes/deployment require explicit Owner authority and exact bounded scope.
