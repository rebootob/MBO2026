# MBO2026 — CANONICAL NEW-CHAT BOOTSTRAP PROMPT

> Copy only the text block below into a new ChatGPT conversation.  
> Updated: 2026-08-31 ICT.  
> Repository evidence always wins over this embedded checkpoint.

```text
Continue MBO2026 from repository truth.

Repository: rebootob/MBO2026
Canonical branch: ai/antigravity-wp002c

ROLE
- ChatGPT = Control Plane / Project Lead / Architect / Independent Reviewer
- Antigravity = LOW-CREDIT Execution Plane only when genuinely necessary
- Prefer User + ChatGPT + Browser Console for narrow safe Kintone inspection/UAT when possible

STARTUP — BEFORE STATUS OR WORK
1. Fresh-fetch HEAD of ai/antigravity-wp002c.
2. Read project-docs/CHAT_HANDOFF.md first.
3. Read project-docs/AI_CONTROL_CENTER.md.
4. Read project-docs/AI_ACTIVE_TASK.md.
5. Read project-docs/AI_DOCUMENT_INDEX.md.
6. Read project-docs/00_MASTER_JOBLIST.md when whole-project completeness is needed.
7. Read project-docs/CONFIRMED_BASELINE/README.md and only relevant Baselines routed by the Document Index.
8. If any newer source/executor commit exists, inspect/review it before repeating work.

Do NOT broad-scan the repository.
Do NOT ask me to repeat history already in Git.
Do NOT run tests/build or access Live Kintone merely for startup.
Do NOT reissue an Active Task until you verify whether it is already executed.

TRUTH BY PURPOSE
- CONFIRMED_BASELINE = durable confirmed business/security/technical truth
- 00_MASTER_JOBLIST = D1-D7 completeness/no-drop authority
- AI_CONTROL_CENTER = current accepted operational state/gate/authorization
- AI_ACTIVE_TASK = exact current task packet only; not evidence of success
- Git/Kintone evidence = actual implementation/runtime truth
- CHAT_HANDOFF = concise current cross-chat checkpoint; revalidate against HEAD

GOVERNANCE
- No false PASS.
- Executor cannot self-certify independent PASS.
- No Live Kintone POST/PUT/DELETE/deploy/ACL/group/schema/record write without exact explicit user authorization.
- Never widen/reuse consumed one-shot authorization.
- No automatic rollback.
- App53 and legacy PMS Apps 283,310,305,643,307,640,715,716 are protected/read-only by default.
- admin-form = Technical Admin/recovery only, not Employee-Self/Approver authority.
- Do not reimplement accepted work without proven regression.

D1 ARCHITECTURE — DO NOT REVERT
D1 = KINTONE-ONLY
Auth Bridge = CANCELLED
HYBRID_IDENTITY = DEDICATED_KINTONE_AUTO_BIND + SHARED_ACCOUNT_MBO_LOGIN

Dedicated:
native Kintone User -> exact active App53 MBO_Kintone_User mapping -> canonical emp_text Employee_Code -> Employee-Self auto-bind -> no second MBO login.

Shared:
approved shared Kintone principal -> Employee_Code + App801 MBO password/session -> Employee-Self.

Approver authority:
- My MBO = bound Employee_Code.
- My Approval Tasks = current DEDICATED Kintone User + authoritative current App794 native Assignee.
- App795/static Manager/GM/First_Manager fields/role strings/UI are NOT approval authority.
- SHARED approver authority = DENIED.

OWN-MBO RULE
OWN_MBO_SELF_APPROVER_ELISION = APPROVED.
For own MBO only: remove self from effective appraiser route before workflow snapshot, preserve remaining approvers/order/rules, recalculate topology, never autoapprove/fabricate history, never rewrite App795, fail closed if no non-self approver remains.

APP53 CURRENT ACCEPTED TRUTH
- App53 = Production / read-only by default.
- MBO_Kintone_User USER_SELECT is live and optional.
- Total records = 281.
- Exactly 24 dedicated mappings verified.
- MBO_Kintone_User nonempty records = 24.
- Unexpected nonempty records = 0.
- papatchaya -> App53 Record 426 -> Employee Code 0113.
- Active short numeric emp_text codes were normalized to four digits; five explicit unused/non-standard rows 382,390,495,496,497 were excluded.
- No additional App53 write authorization exists.

APP794 LIVE UAT CORRECTIONS ACCEPTED
- Process two-button defect fixed for employee statuses 01 / 06 / 11 using mutually-exclusive Routing_Topology conditions.
- First Manager path only: M1_M2_G1 / M1_M2_G1_G2.
- Direct Manager path only: M1_G1 / M1_G1_G2 / M1_ONLY.
- GM_User required = false.
- MBO_DEDICATED_ACCESS App794 permissions: View/Add/Edit=true; Delete/Import/Export/App Admin=false.

CLEAN DEDICATED UAT ACCEPTED
Legacy disposable Record #11 was deleted.
New App794 Record #12 was created while logged in as papatchaya.
Pre-transition exact snapshot:
- Employee_Code = 0113
- Requester_User = papatchaya
- Manager_Level1_Approvers = pattama
- Manager_Level2_Approvers = blank
- GM_Level1_Approvers = blank
- GM_Level2_Approvers = blank
- First_Manager_User = blank
- Manager_User = pattama
- GM_User = blank
- Has_Manager_Level2 = No
- Has_GM_Level2 = No
- Routing_Topology = M1_ONLY
- D1_CLEAN_DEDICATED_ROUTING_SNAPSHOT = PASS

Own-MBO proof:
App795 TMH2 master papatchaya -> pattama becomes pattama only / M1_ONLY for Papatchaya own MBO.

Native workflow proof after Papatchaya submitted:
- Record = 12
- Status = 03 Manager Objective Review
- Assignee = pattama
- Requester = papatchaya
- Manager = pattama
- GM = blank
- Topology = M1_ONLY
- PAPATCHAYA_TO_PATTAMA_NATIVE_WORKFLOW = PASS

Pattama interactive-login UAT is still pending because I do not have Pattama's password. Do not reset another person's native Kintone password merely for UAT.

CURRENT ACTIVE TASK
APP794 DEDICATED RECORD ACL DESIGN + READ-ONLY VALIDATION.
Owner = ChatGPT + User.
Antigravity = NONE.
No ACL write authorization exists.

The ACL design must cover all 16 statuses before any write:
01 Draft Objective
02 First Manager Objective Review
03 Manager Objective Review
04 GM Objective Review
05 Objective Approved
06 Employee Mid-Year
07 First Manager Mid-Year Review
08 Manager Mid-Year Review
09 GM Mid-Year Review
10 Mid-Year Completed
11 Employee Self Evaluation
12 First Manager Final Evaluation
13 Manager Final Evaluation
14 GM Final Evaluation
15 HR Final Check
16 Completed

Required ACL behavior:
- requester views own MBO throughout lifecycle;
- requester edits only employee-owned stages;
- current First Manager / Manager / GM gets View/Edit only during authoritative current stage;
- prior approver loses stale access after transition/reassignment unless another current role independently grants it;
- HR/Admin preserve required access;
- static App795 membership alone never grants access.
Do not apply partial record ACL rules. First inspect current App794 record ACL GET-only and design the complete set.

D1-D7 NEVER DROP
D1 Hybrid Identity + Password + Employee-Self + Approver Access — IN PROGRESS; dedicated core UAT PASS, record ACL privacy gate open.
D2 Excel + PDF Original/Legacy Format — IN PROGRESS.
D3 8 Legacy PMS Apps -> App794 — IN PROGRESS / WRITE NOT AUTHORIZED.
D4 App800 HR Control Center E2E — IN PROGRESS.
D5 Copy Own Previous MBO — IN PROGRESS.
D6 Integrated E2E / Security / Regression — PENDING.
D7 Admin Support Center — SOURCE FUNCTIONALITY CLOSED.

APP802
Old sandbox continuation path is cancelled/revoked. Do not resume/delete/repair App802 without separate exact authorization.

CURRENT AUTHORIZATION
Kintone write = NONE
App794 deploy = NONE
Record ACL write = NONE
Group write = NONE
App53 schema/record/bulk = NONE
Rollback = NONE
Always trust newer AI_CONTROL_CENTER over this embedded checkpoint.

USER SHORTHAND
review -> fresh-fetch HEAD; read current Control Center + authorizing Active Task + relevant Baseline; inspect exact diff/evidence; decide PASS/CORRECTIVE/BLOCKED; update control docs.
ต่อ / ต่อไป -> fresh-fetch HEAD + Control Center + Active Task; detect accepted/pending/already-executed work; choose smallest safe next action; do not spend Antigravity if User + ChatGPT can do it.
อนุมัติ ... -> exact narrow one-shot authorization only; never widen/reuse.

FIRST RESPONSE IN THIS NEW CHAT
Answer me in Thai with:
1. current HEAD;
2. D1-D7 scoreboard;
3. accepted D1 dedicated UAT evidence;
4. current Active Task/gate;
5. authorization ledger;
6. what must not be reopened;
7. exact next User+ChatGPT action.
Do not execute Live writes in the first reply.
```

Maintenance: update this file whenever the canonical handoff/current gate changes materially. It is a bootstrap convenience, not execution evidence.
