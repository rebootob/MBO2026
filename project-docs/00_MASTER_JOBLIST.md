# 00 MASTER JOBLIST — MBO2026 CONTINUITY CONTROL

> Repository: `rebootob/MBO2026`  
> Canonical branch: `ai/antigravity-wp002c`  
> Control Plane: ChatGPT  
> Execution Plane: Antigravity only for minimum necessary execution  
> Updated: 2026-09-01 ICT

This file guarantees D1–D7 completeness across chats. Durable rules live in `CONFIRMED_BASELINE/`; current operational status lives in `AI_CONTROL_CENTER.md`.

## 0. Non-negotiable continuity rules

```text
NEVER_DROP_D1_TO_D7 = YES
REPOSITORY_AND_LIVE_EVIDENCE_BEAT_CHAT_MEMORY = YES
NO_FALSE_PASS = YES
EXECUTOR_CANNOT_SELF_CERTIFY = YES
NO_LIVE_KINTONE_WRITE_OR_DEPLOY_WITHOUT_EXACT_AUTH = YES
NO_REUSE_OR_WIDENING_OF_CONSUMED_AUTH = YES
APP53_AND_LEGACY_SOURCE_APPS_READ_ONLY_BY_DEFAULT = YES
D1_KINTONE_ONLY = YES
AUTH_BRIDGE_CANCELLED = YES
EMPLOYEE_CODE_STABLE_PERSON_ID = YES
NO_AUTOMATIC_EXISTING_MBO_REROUTE_ON_MASTER_CHANGE = YES
EMPLOYEE_LIFECYCLE_CHANGE_REQUIRES_CONTROLLED_AUDIT = YES
ANTIGRAVITY_MINIMUM_NECESSARY_ONLY = YES
COMPLETE_D2_BEFORE_D3 = YES
```

## 1. D1 — Hybrid Identity + Password + Employee-Self + Approver Access

```text
D1 = PASS / CLOSED
FINAL_D1_SECURITY_REVIEW = PASS
PASS_MODE = PASS WITH DOCUMENTED KINTONE-ONLY CEILINGS
APP794_LIVE_REVISION = 67
RUNTIME_SOURCE_COMMIT = c6864d09f59cfaf6e7c86da422452a816a5cf430
CURRENT_APPROVAL_AUTHORITY = NATIVE CURRENT APP794 ASSIGNEE
```

Accepted ceilings:

```text
SHARED_DIRECT_URL_REST_HARD_ISOLATION = NOT GUARANTEED UNDER SHARED KINTONE ACCOUNT
DEDICATED_DIRECT_REST_CREATE_FIELD_INTEGRITY = LIMITED BY NATIVE APP794 ADD PERMISSION
```

D1 is frozen unless proven regression or explicit architecture change.

## 2. D2 — Excel + PDF Original/Legacy Format

```text
D2 = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R17 = PASS / CLOSED
D2-WP003-R3-R22 = PASS / CLOSED
ACTIVE_D2_WORK_PACKAGE = D2-WP003-R3-R23
AUTHORIZED_SCOPE = EXISTING FEASIBILITY SOURCE + TEST ONLY
AUTHORIZATION_DECISION_BASELINE_COMMIT = aca452faf4d3fc3ef82e957bd45f4e0874d9377e
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R23-SOURCE-20260901-01
```

Canonical D2 contract: `project-docs/EXCEL_EXPORT.md`.

Accepted foundations include privacy classification/evidence parity, typed privacy metadata completeness/validator shape, header fingerprint/sanitized export parity and exact owner-template SHA identity.

Accepted R3-R22 closure:
- raw direct `xlsx-populate.outputAsync()` no-op buffers with no source repair;
- deterministic workbook parity blocker normalization;
- actual `<dimension>` evidence only;
- exact per-sheet print-area binding;
- source-backed negative proof isolation and privacy-safe runtime evidence PASS;
- exact source passes validation while raw Part A/Part B lose dimensions and fail closed.

Remaining blocker: raw round-trip dimension loss is proven. R3-R23 is authorized to add a separate minimal fail-closed preservation path while keeping raw evidence frozen.

D2 must ultimately close:
- reference-image handling;
- 5–10 Part A objectives;
- 6→8 Part B competency blocks;
- no-formula authority;
- production sanitizer/XLSX renderer;
- combined Excel parity;
- PDF parity;
- export security/privacy regression;
- final independent D2 review.

## 3. D3 — Migrate 8 Legacy PMS Apps -> App794

Protected READ-ONLY sources:
`283, 310, 305, 643, 307, 640, 715, 716`.

Required sequence:
`READ-ONLY discovery -> mapping -> dry run -> conflict report -> reconciliation -> target backup -> exact manifest -> explicit App794 write authorization -> batch write -> readback -> reconciliation`.

```text
D3 = HOLD UNTIL D2 PASS / CLOSED
D3_WRITE_AUTH = NONE
```

## 4. D4 — App800 HR Control Center End-to-End

Must cover annual cycle/phase calendar, progress/exception monitoring, routing health, authorized reassignment, scoring/Hoshin health, reopen/revision, MBO credential operations, migration status, secure exports and Employee Lifecycle Change operations.

Canonical lifecycle policy: `CONFIRMED_BASELINE/EMPLOYEE_LIFECYCLE_CHANGE_POLICY.md`.

Status: `IN PROGRESS / NOT ACTIVE`.

## 5. D5 — Copy Own Previous MBO

Carry-forward whitelist only:

```text
Objective
Action Plan
Additional Agreement
Weight
```

Do not copy Difficulty, scores, ratings, comments, results, workflow/timestamps, route/appraisers, requester identity, profile/Hoshin snapshots or confidential data. Target FY must resolve fresh current App53/App795 configuration.

Status: `IN PROGRESS / NOT ACTIVE`.

## 6. D6 — Integrated E2E / Security / Regression

Must prove D1–D5 + D7 together, including lifecycle/security regression and stale-prior-authority denial after controlled reassignment.

Status: `PENDING`.

## 7. D7 — Admin Support Center

`admin-form` = Technical Admin/recovery only. No approve/return/submit/complete, no impersonation and no Employee-Self auto-bind.

Status: `SOURCE FUNCTIONALITY CLOSED`; reopen only proven defect.

## 8. App802 cancelled path

```text
APP802_RESUME_WRITE_AUTH = REVOKED
APP802_FORWARD/ROLLBACK = CANCELLED
SECOND_SANDBOX_CREATE_AUTH = NONE
```

## 9. Current status pointer

Always fresh-fetch/read:
- current branch HEAD;
- `CHAT_HANDOFF.md`;
- `AI_CONTROL_CENTER.md`;
- `AI_ACTIVE_TASK.md`;
- `AI_DOCUMENT_INDEX.md`;
- `EXCEL_EXPORT.md` for D2.

## 10. New-chat continuity

For a new ChatGPT conversation:
1. copy `project-docs/NEW_CHAT_BOOTSTRAP_PROMPT.md` into the first message;
2. fresh-fetch branch HEAD;
3. read `CHAT_HANDOFF.md` first;
4. then Control Center, Active Task, Document Index, Master Joblist and current D2 contract.

## 11. Current exact next action

```text
NEXT_CONTROL_STEP = ANTIGRAVITY EXECUTES R3-R23 ONCE AND PUSHES ONE BOUNDED COMMIT
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R23
ANTIGRAVITY = AUTHORIZED / EXECUTE ONCE / STOP AFTER COMMIT
D3 = HOLD
```

## 12. Project-close condition

```text
D1 = PASS
D2 = PASS
D3 = PASS
D4 = PASS
D5 = PASS
D6 = PASS
D7 = PASS
P0_DEFECTS_OPEN = 0
```
