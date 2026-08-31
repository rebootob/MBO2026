# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only for minimum necessary execution
> Updated: 2026-08-31 — D1 CLOSED / EMPLOYEE LIFECYCLE POLICY CONFIRMED / D2 NOT STARTED

## 1. Whole-project scoreboard

| ID | Status | Current checkpoint |
|---|---|---|
| D1 Hybrid Identity + Password + Employee-Self + Approver Access | ✅ PASS / CLOSED | Final security review PASS with documented Kintone-only ceilings |
| D2 Excel + PDF Original/Legacy Format | ⏸ READY / NOT STARTED | Pre-start contract documented; owner start instruction required |
| D3 8 Legacy PMS Apps → App794 | 🟠 IN PROGRESS / WRITE NOT AUTHORIZED | Read-only/mapping/reconciliation path only |
| D4 App800 HR Control Center E2E | 🟠 IN PROGRESS | Employee lifecycle operations are now mandatory scope alongside existing HR operations |
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

Applies to:
- resignation/inactive employee;
- Department/Section/Team transfer;
- promotion/Position change;
- Kintone user/principal change;
- manager/appraiser transfer, promotion, replacement or resignation.

D1 is not reopened merely because these operational lifecycle functions are not yet implemented end-to-end. D4 owns lifecycle operations; D6 owns integrated lifecycle/security regression.

No lifecycle mutation is currently authorized.

## 6. Source freeze

Runtime source freeze remains:

```text
RUNTIME_SOURCE_COMMIT = c6864d09f59cfaf6e7c86da422452a816a5cf430
APP794_LIVE_REVISION = 67
```

All D1 closure and employee-lifecycle-policy work after that runtime commit is documentation-only. No runtime/source/test change is implied.

## 7. D2 pre-start boundary

Canonical pre-start document:
`project-docs/EXCEL_EXPORT.md`

D2 must eventually prove:

```text
Excel Part A
Excel Part B
Combined multi-sheet workbook where applicable
PDF legacy/original visual parity
5–10 objective capacity without silent truncation
authorization/confidentiality-safe export behavior
```

Before coding, perform read-only inventory of existing export source/tests and approved legacy sample files, then create a narrow D2 Active Task.

```text
D2_STATUS = READY / NOT STARTED
ACTIVE_D2_WORK_PACKAGE = NONE
AUTO_START_D2 = NO
```

The lifecycle policy does not expand D2 scope except that export/security behavior must continue to respect stable Employee identity and authorized current/historical access.

## 8. Current gate

```text
D1 = CLOSED / PASS
PRE_D2_DOCUMENTATION_SYNC = COMPLETE
EMPLOYEE_LIFECYCLE_POLICY = CONFIRMED / DOCUMENTED
ACTIVE_WORK_PACKAGE = NONE
NEXT_WORK_PACKAGE = D2
D2_START = OWNER INSTRUCTION REQUIRED
CURRENT_OWNER = User + ChatGPT
ANTIGRAVITY = NONE
```

Do not auto-start D2–D6 from documentation updates alone.

## 9. Authorization ledger

```text
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
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
PRODUCTION_ROLLBACK_AUTH = NONE
```

All prior D1 one-shot authorizations are consumed and must never be reused.
