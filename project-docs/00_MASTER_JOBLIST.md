# 00 MASTER JOBLIST — MBO2026 CONTINUITY CONTROL

> Repository: `rebootob/MBO2026`  
> Canonical branch: `ai/antigravity-wp002c`  
> Control Plane: ChatGPT  
> Execution Plane: Antigravity only for minimum necessary execution  
> Updated: 2026-08-30 20:45 ICT

This file guarantees D1–D7 completeness across chats. Durable business/security rules live in `CONFIRMED_BASELINE/`; current operational status lives in `AI_CONTROL_CENTER.md`.

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
HYBRID_IDENTITY_CANONICAL = YES
DUAL_ROLE_CONTEXTS_MUST_REMAIN_SEPARATE = YES
```

## 1. D1 — Hybrid Identity + Password + Employee-Self + Approver Access

Canonical architecture:

```text
HYBRID_IDENTITY = DEDICATED_KINTONE_AUTO_BIND + SHARED_ACCOUNT_MBO_LOGIN
```

### Dedicated Kintone users
- Native Kintone authentication is the first boundary.
- Exact authoritative Kintone User Code -> exactly one active App53 row -> canonical `emp_text` Employee_Code -> Employee-Self auto-bind.
- No secondary MBO Employee_Code/password login after exact binding.
- Missing, ambiguous or invalid canonical mapping fails closed.
- `admin-form` is excluded from Employee-Self auto-bind.
- Dedicated users do not require App801 bearer session or App801 View/Edit solely for identity.

### Shared Kintone users
- Existing Employee_Code + App801 MBO Password flow remains.
- Initial MBO password = Employee_Code; first/default login forces change.
- App801 same-tab bearer session remains 8-hour absolute TTL, non-sliding, one active session/employee.
- New independent tab without token returns to MBO Login.
- Shared principals never gain Approver authority merely because the Kintone account is shared.

Accepted shared limitation:

```text
DIRECT_URL_REST_HARD_ISOLATION = NOT_GUARANTEED_UNDER_SHARED_KINTONE_ACCOUNT
```

### Employee-Self
- `My MBO` ownership = exact bound Employee_Code.
- No employee selector or role escalation control.
- Create/open/history/edit must remain own-record scoped.
- Employee-Self delete remains unavailable.

### Dedicated Approver context
- `My Approval Tasks` identity = current dedicated Kintone User.
- Authority = authoritative current native App794 Workflow `Assignee`, not App795/static snapshots/role strings/UI hiding.
- List authority requires server query `Assignee in (LOGINUSER())` plus exact returned `Assignee.value[].code` match.
- Record open/action authority requires fresh App794 GET and exact `STATUS_ASSIGNEE` match.
- SHARED approver authority = DENIED.

### Own-MBO self-appraiser rule

Canonical user-approved rule:

```text
OWN_MBO_SELF_APPROVER_ELISION = APPROVED
```

For the employee's own MBO only:
1. remove only the self appraiser from the effective route before workflow snapshot;
2. preserve remaining appraisers, order and approval rules;
3. shift/recalculate effective topology;
4. never autoapprove or fabricate comment/history;
5. never rewrite App795 subordinate routes;
6. if no non-self appraiser remains, fail closed.

Confirmed example: `TMG1|Marketing = natta -> uchida`; Natta own effective route = `uchida / M1_ONLY`; other Marketing employees keep `natta -> uchida`.

### App53 dedicated mapping state

```text
APP53_ENVIRONMENT = PRODUCTION
APP53_DEFAULT_MODE = READ_ONLY
APP53_MAPPING_AUDIT = COMPLETED
MBO_Kintone_User_FIELD_DESIGN = CONFIRMED USER_SELECT
MBO_Kintone_User_LIVE_FIELD_CREATED = NO
VASSANA_CANONICAL_EMPLOYEE_CODE = 0044 PROVEN
NATTA_CANONICAL_EMPLOYEE_CODE = UNRESOLVED / emp_text BLANK / FAIL CLOSED
```

Adding the mapping field, populating mappings and correcting Natta `emp_text` are three separate protected concerns requiring separate exact one-shot authorization and production-safety gates.

### Current D1 source checkpoint

```text
HYBRID_IDENTITY_CORE_SOURCE_R1 = PASS
HYBRID_EMPLOYEE_SELF_RUNTIME_ENTRY = PASS
LATEST_ACCEPTED_FULL_REGRESSION = 1024/1024 PASS
APPROVAL_AUTHORITY_SERVICE_R1 = PASS
APPROVAL_AUTHORITY_SERVICE_COMMIT = 5ac5ede6e40a1462f0398ba8740330742041e3bf
```

Current implementation sequence:

```text
GATE 1 = HOME INDEX INTEGRATION ONLY — OPEN
GATE 2 = DEDICATED CROSS-EMPLOYEE DETAIL AUTHORITY — PENDING
GATE 3 = PROCESS.PROCEED FRESH ASSIGNEE REVALIDATION — PENDING
```

D1 cannot close until both identity modes, dual-role behavior, native permissions/configuration, HR/admin reset, privacy, workflow, comments/attachments and final E2E/security review are proven.

## 2. D2 — Excel + PDF Original/Legacy Format

Must prove:
- Excel Part A;
- Excel Part B;
- combined/multi-sheet output where applicable;
- PDF matching approved legacy presentation;
- 5–10 objective capacity;
- own/assigned/HR export security and confidential-data isolation.

Status: `IN PROGRESS`.

## 3. D3 — Migrate 8 Legacy PMS Apps -> App794

Protected READ-ONLY sources:
`283, 310, 305, 643, 307, 640, 715, 716`.

Required sequence:
`READ-ONLY discovery -> mapping -> dry run -> conflict report -> reconciliation -> target backup -> exact manifest -> explicit App794 write authorization -> batch write -> readback -> reconciliation -> manifest rollback if separately authorized`.

Status: `IN PROGRESS / WRITE NOT AUTHORIZED`.

## 4. D4 — App800 HR Control Center End-to-End

Must cover annual cycle/phase calendar, progress/exception monitoring, routing health, authorized reassignment, scoring/Hoshin health, reopen/revision operations, MBO credential operations, migration status and secure exports.

Accepted sub-scope:
- App800 Reset MBO Password source/tooling accepted;
- native HR reset authority ready;
- live App800 remains prior MVP; deployment is NOT authorized.

Status: `IN PROGRESS`.

## 5. D5 — Copy Own Previous MBO

Carry-forward whitelist only:

```text
Objective
Action Plan
Additional Agreement
Weight
```

Do not copy Difficulty, scores, ratings, comments, results, workflow/timestamps, route/appraisers, profile/Hoshin snapshots or confidential data. Target FY must resolve fresh current configuration.

Status: `IN PROGRESS`.

## 6. D6 — Integrated E2E / Security / Regression

Must prove D1–D5 + D7 together, including Dedicated, Shared and dual-role flows through Objectives -> Mid-Year -> Self Evaluation -> Appraiser Evaluation -> HR Final, plus exports/migration/history/admin truthfulness.

Status: `PENDING`.

## 7. D7 — Admin Support Center

`admin-form` = Technical Admin/recovery only:

```text
NO approve / return / submit / complete
NO impersonation
NO Employee-Self auto-bind
```

Source functionality = `CLOSED`; reopen only for a proven defect.

## 8. Current status pointer

Do not duplicate the live board here. Always re-fetch:
- `project-docs/AI_CONTROL_CENTER.md`
- `project-docs/AI_ACTIVE_TASK.md`
- current branch HEAD.

## 9. New-chat continuity

For a new ChatGPT conversation:
1. use `project-docs/NEW_CHAT_BOOTSTRAP_PROMPT.md` as the copy/paste prompt;
2. the incoming chat reads `project-docs/CHAT_HANDOFF.md` immediately after fresh-fetching HEAD;
3. then read Control Center, Active Task, Document Index and only relevant Baselines.

## 10. Project-close condition

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

Anything less remains IN PROGRESS or BLOCKED with exact evidence.