# AI START HERE — MBO2026

> Mandatory lean entry point for every AI working on MBO2026.  
> Updated: 2026-08-31 ICT

## 1. Startup order

Before planning, reviewing, coding or changing Kintone:

1. Fresh-fetch HEAD of `ai/antigravity-wp002c`.
2. Read `project-docs/CHAT_HANDOFF.md` first.
3. Read `project-docs/AI_CONTROL_CENTER.md`.
4. Read `project-docs/AI_ACTIVE_TASK.md`.
5. Read `project-docs/AI_DOCUMENT_INDEX.md`.
6. Read `project-docs/00_MASTER_JOBLIST.md` when whole-project completeness is needed.
7. Read `project-docs/CONFIRMED_BASELINE/README.md` and only relevant Baseline(s).
8. Inspect exact latest diff/evidence if reviewing newer work.

Do not broad-read historical docs. Do not ask the user to repeat project history already in Git. Do not perform Live Kintone write/deploy during startup.

Repository/live evidence beats chat memory and embedded handoff checkpoints.

## 2. Permanent roles

**ChatGPT = Control Plane**
- plan, architecture, Git inspection, independent review, PASS/CORRECTIVE/BLOCKED decision;
- maintain operational/control/handoff documentation;
- use Antigravity only when actual implementation cannot reasonably be done by User + ChatGPT.

**Antigravity = Low-Credit Execution Plane**
- execute only exact Active Task scope;
- no broad planning/scans/self-review/docs by default;
- stop after required focused test/evidence/commit.

## 3. D1 — frozen closed architecture

```text
D1 = PASS / CLOSED
D1 = KINTONE-ONLY
AUTH_BRIDGE = CANCELLED
HYBRID_IDENTITY = DEDICATED_KINTONE_AUTO_BIND + SHARED_ACCOUNT_MBO_LOGIN
APP794_LIVE_REVISION = 67
RUNTIME_SOURCE_COMMIT = c6864d09f59cfaf6e7c86da422452a816a5cf430
FINAL_D1_SECURITY_REVIEW = PASS
```

Dedicated user:
`native Kintone user -> exact active App53 MBO_Kintone_User -> canonical emp_text Employee_Code -> Employee-Self auto-bind`.

Shared user:
`approved shared principal -> Employee_Code + App801 MBO password/session -> Employee-Self`.

Dedicated approval authority:
`current native App794 Assignee`, with fresh revalidation; static App795/snapshot membership is not authority. SHARED approver authority is denied.

Own-MBO self-appraiser elision remains approved and self-approval remains prohibited.

Do not reopen D1 without proven regression or explicit architecture change.

## 4. D1 accepted security ceilings

```text
SHARED_DIRECT_URL_REST_HARD_ISOLATION = NOT GUARANTEED
DEDICATED_DIRECT_REST_CREATE_FIELD_INTEGRITY = LIMITED BY NATIVE APP794 ADD PERMISSION
```

These are accepted Kintone-only boundaries. Client-side JavaScript is not a privileged server-side security layer.

## 5. Current App53/App794 truth

```text
APP53_TOTAL_RECORDS = 281
MBO_Kintone_User = USER_SELECT / optional / LIVE
DEDICATED_MAPPINGS_VERIFIED = 24
UNEXPECTED_NONEMPTY_RECORDS = 0
papatchaya -> Employee 0113
```

Canonical App794 Record #12:

```text
Status = 03 Manager Objective Review
Requester = papatchaya
Manager / Assignee = pattama
Topology = M1_ONLY
```

No D1 synthetic test record remains.

## 6. Employee lifecycle policy — confirmed

Canonical Baseline: `project-docs/CONFIRMED_BASELINE/EMPLOYEE_LIFECYCLE_CHANGE_POLICY.md`.

```text
EMPLOYEE_CODE = STABLE PERSON ID
APP53 = CURRENT EMPLOYEE / ORG / POSITION TRUTH
APP795 = CURRENT ROUTING FOR FRESH RESOLUTION
APP794 = HISTORICAL ANNUAL SNAPSHOT + CURRENT WORKFLOW TRUTH
CURRENT_APPROVAL_AUTHORITY = NATIVE CURRENT ASSIGNEE
MASTER CHANGE != AUTOMATIC EXISTING APP794 REWRITE
MID_CYCLE CHANGE = HR-CONTROLLED EXPLICIT OPERATION + AUDIT
```

For lifecycle work, read that Baseline before planning. D4 owns lifecycle operations, D5 must resolve fresh current route/identity without stale snapshots, and D6 must prove lifecycle/security regression. No lifecycle write is authorized now.

## 7. Current gate — PRE-D2 WAIT

```text
PRE_D2_DOCUMENTATION_SYNC = COMPLETE
EMPLOYEE_LIFECYCLE_POLICY = CONFIRMED
D2 = READY / NOT STARTED
ACTIVE_WORK_PACKAGE = NONE
D2_START = OWNER INSTRUCTION REQUIRED
ANTIGRAVITY = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
```

Canonical D2 pre-start document: `project-docs/EXCEL_EXPORT.md`.

When Owner starts D2, do read-only discovery first:
- current export source/tests;
- approved legacy Excel/PDF samples;
- App794-to-output field mapping;
- current PDF mechanism;
- export authorization/confidentiality guards;
- exact gap list and smallest Work Package.

Do not immediately implement or deploy.

## 8. D1–D7 no-drop

```text
D1 Hybrid Identity + Password + Employee-Self + Approver — PASS / CLOSED
D2 Excel + PDF Original/Legacy Format — READY / NOT STARTED
D3 8 Legacy PMS Apps -> App794 Migration — IN PROGRESS / WRITE NOT AUTHORIZED
D4 App800 HR Control Center End-to-End — IN PROGRESS / LIFECYCLE OPERATIONS MANDATORY
D5 Copy Own Previous MBO — IN PROGRESS / FRESH CURRENT ROUTE + IDENTITY REQUIRED
D6 Integrated E2E / Security / Regression — PENDING / LIFECYCLE REGRESSION REQUIRED
D7 Admin Support Center — SOURCE FUNCTIONALITY CLOSED
```

## 9. Current authorization

```text
KINTONE WRITE = NONE
APP794 DEPLOY = NONE
RECORD ACL WRITE = NONE
GROUP WRITE = NONE
APP53 SCHEMA/RECORD/BULK = NONE
APP795 WRITE = NONE
APP801 WRITE = NONE
LIFECYCLE WRITE = NONE
D2 SOURCE CHANGE = NONE
ROLLBACK = NONE
```

## 10. User shorthand

`review` -> fresh-fetch HEAD; read current Control Center + Active Task + relevant Baseline; inspect exact diff/evidence; independently decide PASS/CORRECTIVE/BLOCKED.

`ต่อ` / `ต่อไป` -> fresh-fetch HEAD + Control Center + Active Task; choose the smallest safe next action; do not spend Antigravity unnecessarily.

`อนุมัติ ...` -> exact narrow authorization only; never widen or reuse consumed authorization.

## 11. New chat

Copy `project-docs/NEW_CHAT_BOOTSTRAP_PROMPT.md` into the new conversation. The new chat must fresh-fetch HEAD and read `CHAT_HANDOFF.md` first.
