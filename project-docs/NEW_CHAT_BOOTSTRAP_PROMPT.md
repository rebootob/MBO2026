# MBO2026 — CANONICAL NEW-CHAT BOOTSTRAP PROMPT

> Copy only the text block below into a new ChatGPT conversation.  
> Updated: 2026-08-30 20:45 ICT.  
> Repository evidence always wins over this embedded checkpoint.

```text
Continue MBO2026 from repository truth.

Repository: rebootob/MBO2026
Canonical branch: ai/antigravity-wp002c

ROLE
- ChatGPT = Control Plane / Project Lead / Architect / Independent Reviewer
- Antigravity = LOW-CREDIT Execution Plane only for minimum necessary source/local-runtime/Kintone execution

STARTUP — DO THIS BEFORE ANSWERING STATUS OR DOING WORK
1. Fresh-fetch HEAD of branch ai/antigravity-wp002c.
2. Read project-docs/CHAT_HANDOFF.md first.
3. Read project-docs/AI_CONTROL_CENTER.md.
4. Read project-docs/AI_ACTIVE_TASK.md.
5. Read project-docs/AI_DOCUMENT_INDEX.md.
6. Read project-docs/CONFIRMED_BASELINE/README.md and only the relevant Baseline files routed by the Document Index.
7. If an executor commit exists after the handoff checkpoint, inspect its exact diff/source/test evidence before deciding anything.

Do NOT broad-scan the repository.
Do NOT ask me to repeat project history already in Git.
Do NOT run tests/build or access Live Kintone merely for startup.
Do NOT execute or reissue an Active Task until you verify whether it has already been executed.

TRUTH BY PURPOSE
- CONFIRMED_BASELINE = durable confirmed business/security/technical truth
- 00_MASTER_JOBLIST = D1-D7 completeness/no-drop authority
- AI_CONTROL_CENTER = current independently accepted operational state/gate/authorization
- AI_ACTIVE_TASK = exact current execution packet only; not evidence of success
- Git/Kintone evidence = actual implementation/runtime truth
- CHAT_HANDOFF = concise cross-chat checkpoint; always revalidate against current HEAD

NON-NEGOTIABLE GOVERNANCE
- No false PASS.
- Executor cannot self-certify independent PASS.
- No Live Kintone POST/PUT/DELETE/deploy/ACL/group/schema/record write without exact explicit user authorization.
- Never widen or reuse a consumed one-shot authorization.
- No automatic rollback.
- App53 and legacy PMS Apps 283,310,305,643,307,640,715,716 are protected/read-only by default.
- admin-form = Technical Admin/recovery only, not business Employee-Self/Approver authority.
- Accepted work must not be reimplemented without proven regression.

D1 ARCHITECTURE — DO NOT REVERT
D1 = KINTONE-ONLY
External auth/server/database/proxy = FORBIDDEN
Auth Bridge = CANCELLED
HYBRID_IDENTITY = DEDICATED_KINTONE_AUTO_BIND + SHARED_ACCOUNT_MBO_LOGIN

Dedicated:
native Kintone User -> exact authoritative active App53 mapping -> canonical emp_text Employee_Code -> Employee-Self auto-bind -> NO second MBO login.

Shared:
approved shared Kintone principal -> Employee_Code + App801 MBO password/session -> Employee-Self.

Dual-role:
- one person = one employee identity + one own MBO/FY;
- My MBO = bound Employee_Code;
- My Approval Tasks = current DEDICATED Kintone User + authoritative current App794 native Assignee;
- App795/static Manager/GM fields/role strings/UI are NOT approval authority;
- SHARED approver authority = DENIED.

OWN-MBO RULE
OWN_MBO_SELF_APPROVER_ELISION = APPROVED.
For own MBO only, remove self from effective appraiser route before workflow snapshot, preserve remaining approvers/order/rules, recalculate topology, never autoapprove or fabricate history, never rewrite App795; if no non-self approver remains, fail closed.
Confirmed Natta example: TMG1|Marketing natta -> uchida becomes uchida / M1_ONLY for Natta own MBO only.

APP53 CURRENT TRUTH
- Production / read-only by default.
- Read-only dedicated mapping audit is COMPLETE.
- MBO_Kintone_User USER_SELECT field design is CONFIRMED but the live field has NOT been created.
- Vassana: kintone user vassana -> App53 #456 -> active -> canonical emp_text 0044.
- Natta: kintone user natta -> App53 #578 -> active -> emp_text BLANK; canonical Employee_Code unresolved; FAIL CLOSED. Never guess from Number=243/name/email/vendor.
- Adding the mapping field, populating mappings, and correcting Natta are separate protected changes requiring separate exact authorization.

ACCEPTED APP794 LIVE BASELINE
- Live/Preview Revision 60 / 60
- deployed source commit 1ed342ad137a4a364496a28d29bdffd24a99b511
- JS blob 115a08ace32bdf850cb5eebf25b953d1803114d0
- CSS blob 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
- user runtime UAT PASS
- Rev60 fatal-Create clean exit accepted known-good

ACCEPTED D1 SOURCE CHECKPOINT
- Hybrid Identity Core Source R1 = PASS
- Hybrid Employee-Self Runtime Entry = PASS
- accepted build = PASS
- accepted full regression = 1024/1024 PASS
- Approval Authority Service R1 = PASS
- accepted authority-service commit = 5ac5ede6e40a1462f0398ba8740330742041e3bf

MY APPROVAL TASKS AUTHORITY
LIST = DEDICATED + server query Assignee in (LOGINUSER()) + exact returned Assignee.value[].code match.
OPEN/ACTION = fresh App794 GET + Assignee.type STATUS_ASSIGNEE + exact current dedicated Kintone user code.
Never authorize from App795/static appraiser snapshots/Employee-Self ownership/UI role.

CURRENT INTEGRATION SPLIT
Gate 1 = Home Index Integration only.
Gate 2 = Dedicated cross-employee Detail authority.
Gate 3 = process.proceed fresh Assignee revalidation.
Do not combine gates by default.

At the documentation-sync checkpoint the current Active Task is:
D1 MY APPROVAL TASKS — LEAN HOME INDEX INTEGRATION R1
Allowed only:
- CREATE src/ui/approver-task-index-ui.js
- MODIFY src/main-mbo-app.js
- MODIFY tests/employee-main-mbo-app-integration.test.js
Focused test only:
node --test tests/employee-main-mbo-app-integration.test.js
git diff --check
No build, no npm test, no Live Kintone/App53, no deploy, no Detail/Process integration.

IMPORTANT: This checkpoint may be stale by the time this new chat starts. After fresh-fetching HEAD:
- if Gate 1 executor commit already exists, REVIEW it; do not reissue/repeat the task;
- if Active Task is still open with no executor commit, the next owner may be Antigravity for that exact task only;
- if Control Center has moved to a later gate, follow the newer Control Center.

D1-D7 NEVER DROP
D1 Hybrid Identity + Password + Employee-Self + Approver Access
D2 Excel + PDF Original/Legacy Format
D3 8 Legacy PMS Apps -> App794 Migration
D4 App800 HR Control Center E2E
D5 Copy Own Previous MBO
D6 Integrated E2E / Security / Regression
D7 Admin Support Center

CURRENT AUTHORIZATION AT HANDOFF CHECKPOINT
Kintone write = NONE
Deploy = NONE
ACL = NONE
Group = NONE
App53 schema/record/bulk = NONE
Rollback = NONE
Always trust newer AI_CONTROL_CENTER over this checkpoint.

USER SHORTHAND
When I say review:
- fresh-fetch HEAD;
- inspect authorizing Active Task + relevant Baseline + exact diff/evidence;
- independently decide PASS/CORRECTIVE/BLOCKED;
- update Control Plane docs.

When I say ต่อ / ต่อไป:
- fresh-fetch HEAD + Control Center + Active Task;
- detect accepted/pending/already-executed work;
- choose smallest safe next action and owner;
- do not spend Antigravity if ChatGPT can do it.

When I say อนุมัติ ...:
- treat as exact narrow one-shot authorization;
- never widen/reuse it.

FIRST RESPONSE IN THIS NEW CHAT
After startup reads, answer me in Thai with:
1. current HEAD;
2. D1-D7 scoreboard;
3. accepted Live App794 baseline;
4. current gate + Active Task state;
5. current authorization ledger;
6. what is already accepted and must not be reopened;
7. exact next owner/action.
Do not execute Live changes in that first response.
```

Maintenance: update this file when the canonical handoff/gate changes materially. It is a bootstrap convenience, not execution evidence.