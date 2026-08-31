# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only for minimum necessary execution
> Updated: 2026-09-01 — D1 CLOSED / D2-WP001 REVIEW = CORRECTIVE REQUIRED

## 1. Whole-project scoreboard

| ID | Status | Current checkpoint |
|---|---|---|
| D1 Hybrid Identity + Password + Employee-Self + Approver Access | ✅ PASS / CLOSED | Final security review PASS with documented Kintone-only ceilings |
| D2 Excel + PDF Original/Legacy Format | 🟠 IN PROGRESS / WP001 CORRECTIVE REQUIRED | Commit `4f4084b...` independently reviewed; `D2-WP001-R1` proposed and awaits Owner approval |
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

## 3. Accepted Kintone-only security ceilings

```text
SHARED_DIRECT_URL_REST_HARD_ISOLATION = NOT GUARANTEED
DEDICATED_DIRECT_REST_CREATE_FIELD_INTEGRITY = LIMITED BY NATIVE APP794 ADD PERMISSION
```

Do not overstate these guarantees or embed privileged browser API credentials as a workaround.

## 4. Employee Lifecycle Change Policy — confirmed

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

D4 owns lifecycle operations; D5 must resolve fresh current identity/route; D6 owns integrated lifecycle/security regression. No lifecycle mutation is authorized now.

## 5. D2 discovery — complete

Canonical D2 document:
`project-docs/EXCEL_EXPORT.md`

Accepted discovery:
- export source exists at `src/services/mbo-export-service.js`;
- export tests exist at `tests/mbo-export-service.test.js`;
- current layer is projection/data-model only, not real `.xlsx`/PDF binary rendering;
- App794 normalizer supports objective slots 1..10;
- legacy workbook binaries are intentionally gitignored local references;
- confirmed profile weights include Assistant Manager 60/40.

## 6. D2-WP001 implementation / independent review

Owner authorized `D2-WP001-SOURCE-20260901-01`. Antigravity pushed implementation commit:

```text
IMPLEMENTATION_COMMIT = 4f4084b630642b2d1d6dcb0ab8093227bab8cc6c
EXECUTOR_STATUS_CEILING = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
CHATGPT_INDEPENDENT_REVIEW = CORRECTIVE REQUIRED
D2-WP001 = NOT PASS / NOT CLOSED
```

Implementation strengths:
- explicit Employee-Self cross-employee denial;
- explicit SHARED Approver denial;
- DEDICATED Approver checks current native Assignee;
- stale static manager membership does not authorize explicit Approver path;
- Employee-Self Part A manager/GM objective values and summary are omitted;
- exact 4/5/10 objective tests added;
- profile weights preserved.

Blocking findings:
1. `validateExportAuthorization()` still contains permissive fallback paths, so malformed/unsupported contexts can authorize rather than fail closed. A caller-supplied `HR_ADMIN` label is also accepted without this service proving trusted D1 HR authority provenance.
2. `projectCombinedExport()` copies `competencyItems` directly for Employee-Self; nested manager/GM/appraiser ratings/comments/scores can therefore survive unless caller pre-sanitizes them. WP001 requires the export layer itself to omit confidential data.
3. `tests/core-794-795-796-integration.test.js` was modified although the exact authorization ledger named only `mbo-export-service.js + mbo-export-service.test.js + necessary imports`. The change is minimal and dependency-related, but it remains a recorded scope deviation.
4. GitHub exposes no CI status/workflow run for `4f4084b...`; no independent automated-test PASS is claimed.

## 7. Proposed D2-WP001-R1 — approval pending

Smallest corrective scope:
- `src/services/mbo-export-service.js`
- `tests/mbo-export-service.test.js`
- `tests/core-794-795-796-integration.test.js` only for the exact dependent export call-site compatibility test

Required corrections:
- explicit supported context shapes only; no permissive role-less fallback;
- forged/caller-labeled HR_ADMIN must not grant full export;
- preserve explicit Employee-Self and current-Assignee Approver semantics;
- Employee-Self nested competency data must be sanitized/whitelisted so confidential appraiser data cannot survive;
- add negative tests for malformed/unsupported context, forged HR label, role-less context and nested competency leakage;
- retain 4/5/10 and existing security tests.

No binary renderer, dependencies, UI, deploy or Live Kintone work belongs in R1.

## 8. Current gate

```text
D1 = CLOSED / PASS
D2 = IN PROGRESS / WP001 CORRECTIVE REQUIRED
D2-WP001_STATUS = NOT PASS / NOT CLOSED
ACTIVE_WORK_PACKAGE = NONE
PROPOSED_WORK_PACKAGE = D2-WP001-R1
NEXT_REQUIRED_OWNER_DECISION = APPROVE / CORRECT / REJECT D2-WP001-R1
CURRENT_EXECUTOR = NONE
ANTIGRAVITY = STOP / WAIT OWNER
```

No other Work Package may auto-start.

## 9. Authorization ledger

```text
D2-WP001-SOURCE-20260901-01 = CONSUMED / REVIEWED / DO NOT REUSE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
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

All prior one-shot source/write/deploy authorizations are consumed unless a new exact Owner approval is recorded.
