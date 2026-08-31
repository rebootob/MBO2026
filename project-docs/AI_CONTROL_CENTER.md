# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only for minimum necessary execution
> Updated: 2026-09-01 — D1 CLOSED / EMPLOYEE LIFECYCLE POLICY CONFIRMED / D2-WP001 AUTHORIZED

## 1. Whole-project scoreboard

| ID | Status | Current checkpoint |
|---|---|---|
| D1 Hybrid Identity + Password + Employee-Self + Approver Access | ✅ PASS / CLOSED | Final security review PASS with documented Kintone-only ceilings |
| D2 Excel + PDF Original/Legacy Format | 🟠 IN PROGRESS / WP001 AUTHORIZED | Export authorization + projection foundation assigned to Antigravity; independent review required after implementation |
| D3 8 Legacy PMS Apps → App794 | 🟠 IN PROGRESS / WRITE NOT AUTHORIZED | Read-only/mapping/reconciliation path only |
| D4 App800 HR Control Center E2E | 🟠 IN PROGRESS | Employee lifecycle operations are mandatory scope alongside existing HR operations |
| D5 Copy Own Previous MBO | 🟠 IN PROGRESS | Narrow carry-forward whitelist; fresh target-year routing/identity required |
| D6 Integrated E2E / Security / Regression | 🔴 PENDING | Must include lifecycle-change regression in addition to D1–D5 functional/security coverage |
| D7 Admin Support Center | ✅ SOURCE FUNCTIONALITY CLOSED | Reopen only proven defect |

## 2. D1 architecture — frozen

```text
D1 = KINTONE-ONLY / CLOSED PASS
HYBRID_IDENTITY = DEDICATED_KINTONE_AUTO_BIND + SHARED_ACCOUNT_MBO_LOGIN
AUTH_BRIDGE = CANCELLED
APP794_LIVE_REVISION = 67
RUNTIME_SOURCE_COMMIT = c6864d09f59cfaf6e7c86da422452a816a5cf430
FINAL_D1_SECURITY_REVIEW = PASS
```

Dedicated approval authority = authoritative current native App794 `Assignee`; static App795/snapshot membership is insufficient. SHARED approver authority = denied.

```text
admin-form = TECHNICAL_ADMIN / NO EMPLOYEE ID
hr         = HR_ADMIN / NO EMPLOYEE ID
```

Never create fake Employee IDs/App53 mappings for non-employee principals.

## 3. D1 accepted closure evidence

```text
APP53_TOTAL_RECORDS = 281
DEDICATED_MAPPINGS_VERIFIED = 24
papatchaya -> Employee 0113
Record #12 = FY2026-0113 / 03 Manager Objective Review
Requester = papatchaya
Manager / Assignee = pattama
Topology = M1_ONLY
OWN_MBO_SELF_APPRAISER_ELISION = PASS
DEDICATED_NATIVE_WORKFLOW = PASS
DEDICATED_RECORD_ACL_PRIVACY = PASS
FOREIGN_RECORD_NEGATIVE_RUNTIME = PASS
HR_NON_EMPLOYEE_RUNTIME_MODE = PASS
D1_SHARED_SESSION_RUNTIME = PASS
COMMENTS_HISTORY_ATTACHMENTS_TRUTHFULNESS = PASS
D1_LIVE_DUAL_ROLE = PASS
FINAL_D1_SECURITY_REVIEW = PASS
```

Synthetic foreign Record #13 and dual-role Record #14 were both cleaned up; no synthetic D1 test record remains.

Current-manager Pattama interactive login remains credential-limited/non-blocking. Do not reset another person's native Kintone password solely for UAT.

## 4. Accepted Kintone-only security ceilings

These remain mandatory and must not be overstated:

```text
SHARED_DIRECT_URL_REST_HARD_ISOLATION = NOT GUARANTEED
DEDICATED_DIRECT_REST_CREATE_FIELD_INTEGRITY = LIMITED BY NATIVE APP794 ADD PERMISSION
```

Browser customization cannot create a privileged server-side boundary that Kintone itself does not provide. Do not embed privileged API tokens as a workaround.

## 5. Employee Lifecycle Change Policy — confirmed

Canonical durable policy:
`project-docs/CONFIRMED_BASELINE/EMPLOYEE_LIFECYCLE_CHANGE_POLICY.md`

Owner-confirmed invariants:

```text
EMPLOYEE_CODE = STABLE PERSON ID
APP53 = CURRENT EMPLOYEE / ORGANIZATION / POSITION TRUTH
APP795 = CURRENT ROUTING CONFIGURATION FOR FRESH RESOLUTION
APP794 = ANNUAL HISTORICAL SNAPSHOT + CURRENT WORKFLOW TRUTH
CURRENT_APPROVAL_AUTHORITY = NATIVE CURRENT ASSIGNEE
MASTER CHANGE != AUTOMATIC RETROACTIVE APP794 REWRITE
MID_CYCLE_CHANGE = HR-CONTROLLED EXPLICIT OPERATION + AUDIT
```

Applies to resignation/inactive employee, Department/Section/Team transfer, promotion/Position change, Kintone user/principal change, and manager/appraiser transfer/promotion/replacement/resignation.

D1 is not reopened merely because these operational lifecycle functions are not yet implemented end-to-end. D4 owns lifecycle operations; D6 owns integrated lifecycle/security regression.

No lifecycle mutation is currently authorized.

## 6. Source freeze / D2 boundary

Accepted D1 runtime freeze remains:

```text
RUNTIME_SOURCE_COMMIT = c6864d09f59cfaf6e7c86da422452a816a5cf430
APP794_LIVE_REVISION = 67
```

D2 source work is a separate controlled stream. Only the exact D2-WP001 source scope below is currently authorized.

## 7. D2 current state

Canonical D2 document:
`project-docs/EXCEL_EXPORT.md`

Owner explicitly started D2 on 2026-09-01 ICT. ChatGPT completed `D2-DISCOVERY-001`, then Owner explicitly approved `D2-WP001`.

Accepted discovery findings remain:
- existing export source = `src/services/mbo-export-service.js`;
- existing export tests = `tests/mbo-export-service.test.js`;
- current export implementation is projection/data-model only, not an `.xlsx`/PDF binary renderer;
- `src/core/kintone-normalizer.js` already supports App794 objective slots 1..10;
- current export test proves a 4-objective case only and does not yet prove 5/10 output behavior;
- current export projection has no explicit trusted export authorization context and can project confidential scoring/final fields;
- D1 Employee-Self security foundation exists in `MboEmployeeSelfGateway`;
- D1 Dedicated current-Assignee authority foundation exists in `MboApprovalTaskService`;
- static route/appraiser snapshot membership must not authorize approver export;
- current profile weighting matches `CONFIRMED_BASELINE/EVALUATION_CLASSES.md`, including `PROF_ASST_MGR = 60/40`;
- original Staff/Chief Part A/B `.xlsx` files are intentionally gitignored local references and were not found in current ChatGPT Library or connected Google Drive search.

```text
D2_STATUS = IN PROGRESS
D2-DISCOVERY-001 = COMPLETE
ACTIVE_D2_WORK_PACKAGE = D2-WP001
D2-WP001 = EXPORT AUTHORIZATION + PROJECTION FOUNDATION
D2-WP001_STATUS = AUTHORIZED FOR ANTIGRAVITY EXECUTION
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP001-SOURCE-20260901-01
INDEPENDENT_REVIEW = REQUIRED AFTER IMPLEMENTATION
```

## 8. D2-WP001 execution boundary

Authorized primary files:
- `src/services/mbo-export-service.js`;
- `tests/mbo-export-service.test.js`.

Exact existing D1 security services/constants may be imported/reused only when required. No unrelated D1 refactor is authorized.

Required outcomes:
- trusted export context required / fail closed otherwise;
- Employee-Self exact bound Employee_Code + confidential-field omission;
- Dedicated Approver current native Assignee authority only; SHARED Approver denied;
- stale/static route membership is not export authority;
- preserve confirmed profile weights;
- exact 4, 5 and 10 objective projection tests;
- cross-employee / SHARED / stale-assignee / confidential-leakage negative tests.

Explicitly excluded:
- `.xlsx` writer;
- PDF writer;
- package/dependency changes;
- UI download buttons;
- build/runtime output changes;
- Live Kintone reads/writes/UAT/deployment;
- App53/App794/App795/App801 mutation;
- D2-WP002 or other D3–D6 implementation.

Antigravity maximum status = `IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`. ChatGPT must review actual diff/tests before PASS/CLOSED.

## 9. Legacy template evidence gate

Original-format binary rendering cannot be independently accepted until approved legacy template evidence is available. The gitignored local references are expected to include:
- `PMS_Staff & Chief_PART_A.xlsx`;
- `PMS_Staff & Chief_PART_B.xlsx`;
- approved PDF sample when exact PDF visual parity is required.

This evidence gap does not block D2-WP001 because WP001 deliberately excludes binary rendering.

## 10. Current gate

```text
D1 = CLOSED / PASS
EMPLOYEE_LIFECYCLE_POLICY = CONFIRMED / DOCUMENTED
D2 = IN PROGRESS / WP001 AUTHORIZED
ACTIVE_WORK_PACKAGE = D2-WP001
CURRENT_EXECUTOR = ANTIGRAVITY
ANTIGRAVITY = AUTHORIZED FOR D2-WP001 ONLY
NEXT_CONTROL_GATE = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
CURRENT_OWNER = Antigravity execution -> ChatGPT independent review
```

No other Work Package may auto-start.

## 11. Authorization ledger

```text
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP001-SOURCE-20260901-01
D2_SOURCE_SCOPE = mbo-export-service.js + mbo-export-service.test.js + necessary imports only
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_APP794_DEPLOY_AUTH = NONE
ACTIVE_RECORD_ACL_WRITE_AUTH = NONE
ACTIVE_PROCESS_UAT_WRITE_AUTH = NONE
ACTIVE_GROUP_WRITE_AUTH = NONE
APP53_SCHEMA_WRITE_AUTH = NONE
APP53_RECORD_WRITE_AUTH = NONE
APP53_BULK_WRITE_AUTH = NONE
APP795_WRITE_AUTH = NONE
APP801_WRITE_AUTH = NONE
ACTIVE_LIFECYCLE_WRITE_AUTH = NONE
PRODUCTION_ROLLBACK_AUTH = NONE
```

All prior D1 one-shot authorizations are consumed and must never be reused. D2-WP001 authorization is consumed after its implementation commit is pushed for independent review, or invalidated if scope/risk materially changes.
