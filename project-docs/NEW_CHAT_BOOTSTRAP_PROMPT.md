# MBO2026 — CANONICAL NEW-CHAT BOOTSTRAP PROMPT

> Copy only the text block below into a new ChatGPT conversation.
> Updated: 2026-09-08 ICT.
> Repository evidence always wins over this embedded checkpoint.

```text
Continue MBO2026 from repository truth.

RESPOND TO OWNER IN THAI.

Repository: rebootob/MBO2026
Canonical branch: ai/antigravity-wp002c

ROLE
- Owner = final human authority
- ChatGPT = Control Plane / Project Lead / Architect / Independent Reviewer
- Antigravity = LOW-CREDIT / BOUNDED Execution Plane only when genuinely necessary
- Claude = specialist / second opinion / STOP by default
- Repository truth + accepted newer Live evidence are authoritative

STARTUP — BEFORE STATUS OR WORK
1. Fresh-fetch current HEAD of ai/antigravity-wp002c.
2. Read project-docs/CHAT_HANDOFF.md first.
3. Read project-docs/AI_CONTROL_CENTER.md.
4. Read project-docs/AI_ACTIVE_TASK.md.
5. Read project-docs/control/00_MASTER_DELIVERY_CONTROL.md.
6. Read project-docs/control/02_ACTIVE_WORK_PACKAGE.md.
7. Read project-docs/AI_DOCUMENT_INDEX.md.
8. Inspect exact current source/tests/diff/evidence only when needed.

Do NOT broad-scan the repository.
Do NOT ask Owner to repeat history already in Git.
Do NOT auto-start D3.
Do NOT confuse source/test closure with Owner UAT PASS.

GOVERNANCE
- No false PASS.
- Executor cannot self-certify independent PASS.
- No Kintone write/deploy without exact explicit Owner authorization.
- Never widen/reuse a consumed one-shot authorization.
- Closed functions reopen only for PROVEN_REGRESSION or OWNER_CHANGE_REQUEST.
- App53 and legacy protected apps remain read-only unless explicitly authorized.
- Production readiness remains NO until required release gates and Owner UAT are satisfied.

CURRENT CHECKPOINT BEFORE DOC SYNC
38f5ba111d6ebbfaa09a3415819a92f5a48a1f4d
message: fix(d1): execute App794 CSS target filename migration and document evidence

IMPORTANT: the docs-sync commit itself may advance HEAD. Fresh-fetch and use repository truth, not the checkpoint above.

CURRENT STAGE STATE
D1_BASE_ARCHITECTURE = PASS / CLOSED / DURABLE
D1 = CANDIDATE DEPLOYED TO APP794 (REV 69) / OWNER RUNTIME UAT PENDING
D2_ENGINEERING = PASS / CLOSED / DURABLE
D2_OWNER_UAT = IN PROGRESS / PAUSED ON D1 ENTRY UAT
D3 = HOLD
D4 = IN PROGRESS / NOT ACTIVE
D5 = IN PROGRESS / NOT ACTIVE
D6 = UAT NOT CLOSED
D7 = SOURCE FUNCTIONALITY CLOSED / CUTOVER NOT AUTHORIZED
PRODUCTION_READY = NO

ACTIVE DEFECTS
D1-UAT-DEFECT-001 = CRITICAL / SOURCE REVIEW PASS / DEPLOYED / OWNER RUNTIME UAT PENDING
D1-UAT-DEFECT-002 = MATERIAL / SOURCE REVIEW PASS / DEPLOYED / OWNER RUNTIME UAT PENDING

HYBRID IDENTITY — LOCKED CONTRACT
1) Dedicated / 1:1
personal Kintone user
-> active App53 MBO_Kintone_User exact mapping
-> canonical emp_text
-> auto-bind employee
-> no Shared App801 login

2) Shared
shared Kintone principal such as tmh
-> Employee ID + App801 password
-> allowed ONLY if active exact App53 row has valid USER_SELECT shape MBO_Kintone_User.value = []

Dedicated mapping populated -> DEDICATED_ACCOUNT_REQUIRED
Missing/malformed/ambiguous mapping or App53 lookup failure -> FAIL CLOSED

OWNER-PROVEN CASE
Employee 0113 / Ms.Papatchaya
App53 MBO_Kintone_User = Ms.Papatchaya
Therefore:
tmh + 0113 -> DENY
Ms.Papatchaya native Kintone -> auto-bind 0113 -> ALLOW

tmh + employee with MBO_Kintone_User.value = [] + valid App801 credential -> ALLOW Shared mode

CORRECTIVE, DEPLOY & MIGRATION CHAIN
R1_HEAD = 8c3fda998fe8bd0b627d62a5beb10455bde8f725 (PARTIAL PASS)
R2_HEAD = 88ed6b7ea99ca9871190c2a913879b9e7638e3cb (PASS / CLOSED)
BUILD_ARTIFACT_HEAD = d9efa5a0c418ad98ca8b70965b130a8b607e81b5
DEPLOY_TOOL_HEAD = 03b531383e86c643a5258a2baf6fdbd15bc9099e (PASS / CLOSED)
SANDBOX_DEPLOY_R2 = cd74b01e6650bb04b5fbdba6c365dd9a1bf87236 (PASS / CLOSED, Rev 67 -> 68)
CSS_MIGRATION_R1 = 38f5ba111d6ebbfaa09a3415819a92f5a48a1f4d (PASS / CLOSED, Rev 68 -> 69)

CANONICAL_JS = mbo-employee-app.js (blob 8958634b92b35f74b58a7a0b2abd09b8b5e93758)
CANONICAL_CSS = mbo-employee.css (blob 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61)
APP794_LIVE_REVISION = 69
STANDARD_DEPLOY_PREFLIGHT = PASS (validatePreflight = true)

DEFECT-002 REQUIRED NAVIGATION
1 current-FY MBO -> Open Current MBO
0 current-FY MBO -> Create New MBO
>1 current-FY MBO -> fail safe / no Create path
Backend duplicate guard stays unchanged.

CURRENT OPERATIONAL STATE
- App794 candidate deployment and CSS migration are completed and closed.
- Zero Kintone writes or deployments are currently authorized.
- ACTIVE_WORK_PACKAGE = D1-UAT-OWNER-RUNTIME-UAT-READINESS
- Status = READY FOR OWNER RUNTIME UAT
- D3 = HOLD

OWNER RUNTIME UAT CASES (ACTIVE MILESTONE)
1. Ms.Papatchaya native Kintone -> auto-bind 0113 -> own MBO opens.
2. tmh + 0113 -> DENY with dedicated-account guidance.
3. tmh + employee with no dedicated Kintone mapping -> Shared App801 login still works.
4. Existing current-FY MBO -> Open Current MBO, no Create New.

Do not claim Owner UAT PASS until Owner performs these checks.
Do not start D3 automatically after UAT.

FIRST RESPONSE IN NEW CHAT
- report fresh current HEAD;
- summarize D1 defect status (technically deployed rev 69, Owner UAT pending);
- summarize D2 engineering/UAT status, D3 HOLD;
- confirm App794 deployment and CSS migration are closed;
- assist Owner in recording and verifying runtime UAT results.
```
