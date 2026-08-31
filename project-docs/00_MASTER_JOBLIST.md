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

### Final status

```text
D1 = PASS
FINAL_D1_SECURITY_REVIEW = PASS
PASS_MODE = PASS WITH DOCUMENTED KINTONE-ONLY CEILINGS
APP794_LIVE_REVISION = 67
RUNTIME_SOURCE_COMMIT = c6864d09f59cfaf6e7c86da422452a816a5cf430
```

Canonical architecture remains:

```text
HYBRID_IDENTITY = DEDICATED_KINTONE_AUTO_BIND + SHARED_ACCOUNT_MBO_LOGIN
```

### Dedicated Kintone users — PASS
- exact active App53 `MBO_Kintone_User` mapping -> canonical `emp_text` Employee_Code -> Employee-Self auto-bind;
- 24 dedicated mappings verified;
- missing/ambiguous/invalid mapping fails closed in source/integration;
- `admin-form` cannot bind Employee-Self;
- canonical live Record #12 proves papatchaya Employee 0113, own route and native workflow;
- own-MBO self-appraiser elision PASS;
- Dedicated privacy/record ACL PASS including foreign-record negative runtime;
- current approver authority is exact native `Assignee`, never static App795/snapshot membership.

### Shared Kintone users — PASS
- App801 Employee_Code + MBO Password/session path retained;
- real `tmh` + Employee 0130 UAT proved Login, Force Password Change, session issue, 8-hour binding, same-tab restore, new-tab isolation and Logout cleanup;
- negative session cases are covered by source/integration tests;
- SHARED approver authority remains denied.

### Dual-role — PASS
One bounded synthetic App794 Record #14 (`FY2026-0007`) proved live under `papatchaya` that:

```text
My MBO = Record #12 / Employee 0113
My Approval Tasks = Record #14 / Employee 0007
current Assignee = papatchaya
contexts remain separate
```

No Approve/Return was performed. Source/integration proves action authority fresh-revalidates current `Assignee` and denies stale/mismatched/SHARED actors. Record #14 was deleted; cleanup count = 0.

### Comments / history / attachments — PASS
Record #12 live GET/UI evidence proved:
- native comments 0 = UI comments 0;
- truthful `0 Events Recorded` / no fabricated history fixture;
- real saved attachment `2.jpeg` appears exactly in UI;
- no preview/mock attachment leak.

### HR/admin — PASS for D1 boundary
- `hr` resolves as HR_ADMIN without Employee ID;
- status03 native ACL PASS;
- status15 native structural authority/process PASS;
- `admin-form` technical-admin MBO reset path was exercised with exact one-shot runtime evidence on Employee 0130;
- HR/admin remain non-employee principals and receive no fabricated Employee-Self mapping.

### Final D1 security ceilings — accepted and mandatory to retain

```text
SHARED_DIRECT_URL_REST_HARD_ISOLATION = NOT GUARANTEED UNDER SHARED KINTONE ACCOUNT
DEDICATED_DIRECT_REST_CREATE_FIELD_INTEGRITY = LIMITED BY NATIVE APP794 ADD PERMISSION
```

These are Kintone-only architecture ceilings. D1 PASS does not mean hard per-Employee REST isolation exists for a shared native principal, and browser customization cannot provide a privileged server-side create-field enforcement boundary. Never hide these limits or embed privileged API credentials as a workaround.

### Credential-limited item — non-blocking
Pattama-specific interactive login was not run because the credential is unavailable. Do not reset another person's native Kintone password solely for UAT. Equivalent approval authority path is accepted from live papatchaya dual-role evidence plus source/fresh-revalidation tests.

Status: `✅ PASS / CLOSED`. Reopen D1 only for a proven defect or explicit architecture change.

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

D1 closure is prerequisite evidence only; it does not close D6.

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
