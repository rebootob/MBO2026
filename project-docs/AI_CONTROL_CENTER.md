# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only for minimum necessary execution
> Updated: 2026-09-01 — D1 CLOSED / D2-WP001-R1 AUTHORIZED

## 1. Whole-project scoreboard

| ID | Status | Current checkpoint |
|---|---|---|
| D1 Hybrid Identity + Password + Employee-Self + Approver Access | ✅ PASS / CLOSED | Final security review PASS with documented Kintone-only ceilings |
| D2 Excel + PDF Original/Legacy Format | 🟠 IN PROGRESS / R1 AUTHORIZED | `D2-WP001` review found corrective items; `D2-WP001-R1` now authorized for Antigravity |
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

Accepted Kintone-only ceilings remain:

```text
SHARED_DIRECT_URL_REST_HARD_ISOLATION = NOT GUARANTEED
DEDICATED_DIRECT_REST_CREATE_FIELD_INTEGRITY = LIMITED BY NATIVE APP794 ADD PERMISSION
```

Do not reopen D1 without proven regression.

## 3. Employee Lifecycle Change Policy — confirmed

Canonical durable policy:
`project-docs/CONFIRMED_BASELINE/EMPLOYEE_LIFECYCLE_CHANGE_POLICY.md`

```text
EMPLOYEE_CODE = STABLE PERSON ID
APP53 = CURRENT EMPLOYEE / ORGANIZATION / POSITION TRUTH
APP795 = CURRENT ROUTING CONFIGURATION FOR FRESH RESOLUTION
APP794 = ANNUAL HISTORICAL SNAPSHOT + CURRENT WORKFLOW TRUTH
CURRENT_APPROVAL_AUTHORITY = NATIVE CURRENT ASSIGNEE
MASTER CHANGE != AUTOMATIC RETROACTIVE APP794 REWRITE
MID_CYCLE_CHANGE = HR-CONTROLLED EXPLICIT OPERATION + AUDIT
```

D4 owns lifecycle operations; D5 resolves fresh identity/route; D6 owns lifecycle/security regression. No lifecycle mutation is authorized now.

## 4. D2 discovery — complete

Canonical D2 document: `project-docs/EXCEL_EXPORT.md`.

Accepted discovery remains:
- current export layer is projection/data-model only;
- no real `.xlsx` or PDF renderer yet;
- App794 normalizer supports objective slots 1..10;
- confirmed profile weights include Assistant Manager 60/40;
- legacy workbook binaries are intentionally gitignored local references.

## 5. D2-WP001 review result

Antigravity implementation commit:

```text
4f4084b630642b2d1d6dcb0ab8093227bab8cc6c
```

ChatGPT independent review result:

```text
D2-WP001 = CORRECTIVE REQUIRED
PASS = NO
CLOSED = NO
```

Blocking findings preserved:
1. permissive/role-less authorization fallbacks and caller-labeled HR_ADMIN could authorize without reviewed trusted provenance;
2. Employee-Self combined export copied `competencyItems` without nested confidentiality sanitization;
3. one dependent integration test file was modified outside the original exact ledger; this deviation is recorded;
4. no GitHub CI/workflow result exists for the implementation commit, so no independent automated-test PASS was claimed.

Original authorization is consumed:

```text
D2-WP001-SOURCE-20260901-01 = CONSUMED / REVIEWED / DO NOT REUSE
```

## 6. D2-WP001-R1 — authorized corrective

Owner explicitly approved `D2-WP001-R1` on 2026-09-01 ICT.

```text
ACTIVE_WORK_PACKAGE = D2-WP001-R1
D2-WP001-R1 = EXPORT AUTHORIZATION FAIL-CLOSED + NESTED CONFIDENTIALITY CORRECTIVE
D2-WP001-R1_STATUS = AUTHORIZED FOR ANTIGRAVITY EXECUTION
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP001-R1-SOURCE-20260901-01
EXECUTOR = ANTIGRAVITY
NEXT_CONTROL_GATE = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

Authorized files only:
- `src/services/mbo-export-service.js`;
- `tests/mbo-export-service.test.js`;
- `tests/core-794-795-796-integration.test.js` only for exact dependent export call-site compatibility.

Required corrective outcomes:
- explicit supported trusted context shapes only;
- malformed, empty, role-less and unsupported context fail closed;
- bare matching `employeeCode` cannot self-authorize;
- bare `mode: DEDICATED` cannot self-authorize;
- caller-labeled HR_ADMIN cannot self-authorize full export;
- explicit Employee-Self exact Employee_Code semantics preserved;
- explicit DEDICATED current-Assignee Approver semantics preserved;
- SHARED/non-current/stale route authority denied;
- Employee-Self nested Part B competency payload strictly whitelisted/sanitized;
- manager/GM/appraiser nested ratings/comments/scores omitted entirely for Employee-Self;
- 4/5/10 objective capacity and confirmed profile weights remain proven.

Antigravity must run focused export tests plus the exact dependent integration test, push the smallest corrective commit, and stop at `IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`.

## 7. R1 exclusions

R1 must not:
- add `.xlsx` or PDF rendering;
- add package dependencies or touch package/lock files;
- add UI download buttons;
- modify build/runtime artifacts;
- perform Live Kintone reads/writes/UAT/deploy;
- mutate App53/App794/App795/App801/ACL/Process Management;
- start D2-WP002 or D3–D6 implementation;
- redesign D1 security architecture.

## 8. Template evidence gate — later D2 work

Binary Excel/PDF parity still requires approved legacy evidence at least:
- `PMS_Staff & Chief_PART_A.xlsx`
- `PMS_Staff & Chief_PART_B.xlsx`
- approved PDF sample if exact visual parity is required.

This does not block R1.

## 9. Current gate

```text
D1 = CLOSED / PASS
D2 = IN PROGRESS / D2-WP001-R1 AUTHORIZED
ACTIVE_WORK_PACKAGE = D2-WP001-R1
CURRENT_EXECUTOR = ANTIGRAVITY
ANTIGRAVITY = AUTHORIZED FOR R1 ONLY
NEXT_CONTROL_GATE = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

No other Work Package may auto-start.

## 10. Authorization ledger

```text
D2-WP001-SOURCE-20260901-01 = CONSUMED / REVIEWED / DO NOT REUSE
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP001-R1-SOURCE-20260901-01
D2_R1_SOURCE_SCOPE = mbo-export-service.js + mbo-export-service.test.js + exact dependent integration test only
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

R1 authorization is consumed after its implementation commit is pushed for independent review, or invalidated if scope/risk materially changes.
