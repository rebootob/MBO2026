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
8. Inspect exact latest diff/evidence if reviewing newer source/executor work.

Do not broad-read historical docs. Do not ask the user to repeat project history already in Git. Do not perform Live Kintone write/deploy during startup.

Repository/live evidence beats chat memory and embedded handoff checkpoints.

## 2. Authority by purpose

- `CONFIRMED_BASELINE/` = durable confirmed business/security/technical truth.
- `00_MASTER_JOBLIST.md` = D1–D7 no-drop/completeness authority.
- `AI_CONTROL_CENTER.md` = current independently accepted operational state, blockers, authorization and next owner.
- `AI_ACTIVE_TASK.md` = exact current task packet only; not proof of success.
- Git/Kintone evidence = what actually exists/ran/live-read-back.
- `CHAT_HANDOFF.md` = concise cross-chat continuation snapshot; always revalidate against current HEAD.
- `NEW_CHAT_BOOTSTRAP_PROMPT.md` = canonical copy/paste prompt for a new conversation.

## 3. Permanent roles

**ChatGPT = Control Plane**
- plan, architecture, Git inspection, independent review, PASS/CORRECTIVE/BLOCKED decision;
- maintain operational/control/handoff documentation;
- use Antigravity only when actual source/local-runtime/Kintone execution cannot reasonably be done by User + ChatGPT.

**Antigravity = Low-Credit Execution Plane**
- execute only exact Active Task scope;
- no broad planning/scans/self-review/docs by default;
- stop after required focused test/evidence/commit.

## 4. D1 non-negotiable architecture

```text
D1 = KINTONE-ONLY
External auth/server/database/proxy = FORBIDDEN
Auth Bridge = CANCELLED / DO NOT CONTINUE
HYBRID_IDENTITY = DEDICATED_KINTONE_AUTO_BIND + SHARED_ACCOUNT_MBO_LOGIN
```

Dedicated user:
`native Kintone user -> exact active App53 MBO_Kintone_User mapping -> canonical emp_text Employee_Code -> Employee-Self auto-bind`, with no second MBO login.

Shared user:
`approved shared Kintone principal -> Employee_Code + App801 MBO password/session -> Employee-Self`.

Dedicated Approver:
- `My Approval Tasks` authority = current native App794 `Assignee`;
- static App795 membership / legacy snapshot fields / role strings / UI visibility are not authority;
- SHARED approver authority = denied.

Own-MBO route rule:
`OWN_MBO_SELF_APPROVER_ELISION = APPROVED`; remove self only from own effective route before snapshot, preserve remaining order/rules, recalculate topology, never autoapprove/fabricate history, fail closed if no non-self approver remains.

## 5. Current accepted App53 truth

```text
APP53 = PRODUCTION / READ_ONLY BY DEFAULT
TOTAL_RECORDS = 281
MBO_Kintone_User = USER_SELECT / optional / live
DEDICATED_MAPPINGS_VERIFIED = 24
MBO_Kintone_User_NONEMPTY_RECORDS = 24
UNEXPECTED_NONEMPTY_RECORDS = 0
papatchaya -> App53 #426 -> Employee Code 0113
```

Active short numeric employee codes were normalized to four digits by guarded user-run Browser Console; rows 382,390,495,496,497 were explicitly excluded as unused/non-standard.

No additional App53 write authorization exists automatically.

## 6. Current accepted App794 Dedicated UAT

```text
APP794_TWO_BUTTON_FIX_01_06_11 = PASS
GM_User_REQUIRED_FALSE = PASS
MBO_DEDICATED_ACCESS_APP_PERMISSION = PASS
```

Clean native Kintone UAT under `papatchaya` created Record #12 with:

```text
Employee_Code = 0113
Requester_User = papatchaya
Manager_User = pattama
First_Manager_User = BLANK
GM_User = BLANK
Routing_Topology = M1_ONLY
D1_CLEAN_DEDICATED_ROUTING_SNAPSHOT = PASS
```

Papatchaya then submitted Objective and fresh readback proved:

```text
Status = 03 Manager Objective Review
Assignee = pattama
Requester = papatchaya
Manager = pattama
GM = BLANK
Topology = M1_ONLY
PAPATCHAYA_TO_PATTAMA_NATIVE_WORKFLOW = PASS
```

Do not reopen this tested path without regression evidence.

## 7. Current gate

```text
ACTIVE TASK = APP794 DEDICATED RECORD ACL DESIGN + READ-ONLY VALIDATION
OWNER = ChatGPT + User
ANTIGRAVITY = NONE
KINTONE WRITE AUTH = NONE
RECORD ACL WRITE AUTH = NONE
```

Before 24-user rollout, design complete status-aware App794 record privacy across all 16 statuses. Do not apply partial ACL rules.

Required behavior:
- requester views own MBO throughout lifecycle;
- requester edits only employee-owned stages;
- current First Manager / Manager / GM gets View/Edit only while current;
- stale prior approver loses access after transition/reassignment unless another valid current role applies;
- HR/Admin retain required access;
- App795 static membership alone grants no access.

## 8. D1–D7 no-drop

```text
D1 Hybrid Identity + Password + Employee-Self + Approver — IN PROGRESS; Dedicated core UAT PASS, record ACL gate open
D2 Excel + PDF Legacy Format Export — IN PROGRESS
D3 8 Legacy PMS Apps -> App794 Migration — IN PROGRESS / WRITE NOT AUTHORIZED
D4 App800 HR Control Center End-to-End — IN PROGRESS
D5 Copy Own Previous MBO — IN PROGRESS
D6 Integrated E2E / Security / Regression — PENDING
D7 Admin Support Center — SOURCE FUNCTIONALITY CLOSED
```

## 9. User shorthand

`review` -> fresh-fetch HEAD; read current Control Center + authorizing Active Task + relevant Baseline; inspect exact diff/evidence; independently decide PASS/CORRECTIVE/BLOCKED; update Control Plane docs.

`ต่อ` / `ต่อไป` -> fresh-fetch HEAD + Control Center + Active Task; detect accepted/pending/already-executed work; choose smallest safe next action; do not spend Antigravity if User + ChatGPT can do it.

`อนุมัติ ...` -> exact narrow authorization only; never widen or reuse consumed one-shot authorization.

## 10. New chat

Copy `project-docs/NEW_CHAT_BOOTSTRAP_PROMPT.md` into the new conversation. The new chat must fresh-fetch HEAD and read `CHAT_HANDOFF.md` before acting.
