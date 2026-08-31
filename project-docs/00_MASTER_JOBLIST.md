# 00 MASTER JOBLIST — MBO2026 CONTINUITY CONTROL

> Repository: `rebootob/MBO2026`  
> Canonical branch: `ai/antigravity-wp002c`  
> Control Plane: ChatGPT  
> Execution Plane: Antigravity only for minimum necessary execution  
> Updated: 2026-08-31 ICT

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
ANTIGRAVITY_MINIMUM_NECESSARY_ONLY = YES
```

## 1. D1 — Hybrid Identity + Password + Employee-Self + Approver Access

Canonical architecture:

```text
HYBRID_IDENTITY = DEDICATED_KINTONE_AUTO_BIND + SHARED_ACCOUNT_MBO_LOGIN
```

### Dedicated Kintone users
- Native Kintone authentication is the first boundary.
- Exact active App53 `MBO_Kintone_User` mapping -> canonical `emp_text` Employee_Code -> Employee-Self auto-bind.
- No secondary MBO Employee_Code/password login after exact binding.
- Missing/ambiguous/invalid mapping fails closed.
- `admin-form` is excluded from Employee-Self authority.

### Shared Kintone users
- Existing Employee_Code + App801 MBO Password/session remains.
- SHARED approver authority = DENIED.
- Accepted platform limitation remains: direct REST hard isolation cannot be truthfully guaranteed when many employees share one native Kintone principal.

### Employee-Self + Approver authority
- `My MBO` = exact bound Employee_Code.
- `My Approval Tasks` = current Dedicated Kintone User + authoritative current App794 native `Assignee`.
- Static App795 membership, legacy snapshot fields and UI visibility are never sufficient approval authority.

### Own-MBO self-appraiser rule

```text
OWN_MBO_SELF_APPROVER_ELISION = APPROVED
```

For own MBO only: remove self from effective appraiser route before snapshot, preserve remaining appraisers/order/rules, shift/recalculate topology, never autoapprove/fabricate history, never rewrite App795, fail closed if no non-self approver remains.

### App53 dedicated mapping — PASS

```text
APP53 = Production / read-only by default
TOTAL_RECORDS = 281
MBO_Kintone_User = USER_SELECT / optional / live
DEDICATED_MAPPINGS_VERIFIED = 24
MBO_Kintone_User_NONEMPTY_RECORDS = 24
UNEXPECTED_NONEMPTY_RECORDS = 0
papatchaya -> App53 #426 -> Employee Code 0113
```

Active short numeric Employee Codes were normalized to four digits by guarded user-run Browser Console. Explicit excluded unused/non-standard rows: 382,390,495,496,497.

No additional App53 mapping/schema/bulk write is authorized automatically.

### App794 Dedicated UAT — PASS for core employee->manager path

User + ChatGPT corrected the App794 Process two-button defect for employee statuses 01/06/11 using mutually-exclusive `Routing_Topology` conditions. `GM_User` was corrected to optional. `MBO_DEDICATED_ACCESS` has App794 View/Add/Edit only; Delete/Import/Export/App Admin remain disabled.

Clean UAT under native `papatchaya` created App794 Record #12:

```text
Employee_Code = 0113
Requester_User = papatchaya
Manager_Level1_Approvers = pattama
Manager_Level2_Approvers = BLANK
GM_Level1_Approvers = BLANK
GM_Level2_Approvers = BLANK
First_Manager_User = BLANK
Manager_User = pattama
GM_User = BLANK
Has_Manager_Level2 = No
Has_GM_Level2 = No
Routing_Topology = M1_ONLY
D1_CLEAN_DEDICATED_ROUTING_SNAPSHOT = PASS
```

Native workflow transition proof:

```text
01 Draft Objective -> 03 Manager Objective Review
Assignee = pattama
Requester = papatchaya
Manager = pattama
GM = BLANK
Topology = M1_ONLY
PAPATCHAYA_TO_PATTAMA_NATIVE_WORKFLOW = PASS
```

Interactive Pattama-login UAT is pending because the user does not have Pattama's password. Do not reset another person's native Kintone password solely for UAT.

### Current D1 gate

```text
APP794 DEDICATED RECORD ACL DESIGN + READ-ONLY VALIDATION = OPEN
OWNER = ChatGPT + User
ANTIGRAVITY = NONE
ACL WRITE AUTH = NONE
```

Before rollout to 24 Dedicated users, design a complete status-aware App794 record ACL across all 16 statuses. Requester must view own MBO throughout lifecycle, edit only employee stages; current approver gets View/Edit only when current; stale approver access must disappear; HR/Admin access must remain. Do not apply partial ACL rules.

D1 cannot close until both identity modes, dedicated privacy/ACL, approval-task visibility/detail/action authority, Shared behavior, dual-role behavior, comments/attachments, HR/admin operations and final E2E/security review are proven.

Status: `IN PROGRESS — DEDICATED CORE UAT PASS / RECORD ACL PRIVACY GATE OPEN`.

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
- App801-backed Reset MBO Password semantics accepted;
- native HR reset authority readiness accepted;
- App800 Reset UI source candidate accepted;
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

## 8. App802 cancelled path

```text
APP802_RESUME_WRITE_AUTH = REVOKED
APP802_FORWARD/ROLLBACK = CANCELLED
SECOND_SANDBOX_CREATE_AUTH = NONE
```

Do not resume/delete/repair App802 without separate exact authorization.

## 9. Current status pointer

Always re-fetch:
- `project-docs/AI_CONTROL_CENTER.md`
- `project-docs/AI_ACTIVE_TASK.md`
- `project-docs/CHAT_HANDOFF.md`
- current branch HEAD.

## 10. New-chat continuity

For a new ChatGPT conversation:
1. copy `project-docs/NEW_CHAT_BOOTSTRAP_PROMPT.md` into the first message;
2. the new chat fresh-fetches branch HEAD;
3. reads `CHAT_HANDOFF.md` first;
4. then reads Control Center, Active Task, Document Index and only relevant Baselines.

## 11. Project-close condition

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
