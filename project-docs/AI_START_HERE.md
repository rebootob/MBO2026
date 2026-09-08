# AI START HERE — MBO2026

> Mandatory lean entry point for every AI working on MBO2026.
> Updated: 2026-09-08 ICT.

## 1. Startup order

Before planning, reviewing, coding or changing Kintone:
1. fresh-fetch current HEAD of `ai/antigravity-wp002c`;
2. read `project-docs/CHAT_HANDOFF.md` first;
3. read `project-docs/AI_CONTROL_CENTER.md`;
4. read `project-docs/AI_ACTIVE_TASK.md`;
5. read `project-docs/control/00_MASTER_DELIVERY_CONTROL.md`;
6. read `project-docs/control/02_ACTIVE_WORK_PACKAGE.md`;
7. read `project-docs/AI_DOCUMENT_INDEX.md` and only directly relevant Baselines/evidence;
8. inspect exact current source/tests/diff only when needed.

Repository truth + accepted newer live evidence beat chat memory and embedded checkpoints.

## 2. Permanent roles

```text
Owner = final human authority
ChatGPT = Control Plane / Project Lead / Architect / Independent Reviewer
Antigravity = LOW-CREDIT / BOUNDED Execution Plane only when genuinely necessary
Claude = specialist / second opinion / STOP by default
```

No false PASS. Executor cannot self-certify independent PASS. No Kintone write/deploy without exact explicit authorization. Never widen/reuse consumed authorization.

## 3. Current exceptional state — D1 UAT regression

D1 was previously closed, but Owner runtime UAT proved a narrow identity/entry regression. Per governance, only the affected boundary is reopened.

```text
D1-UAT-DEFECT-001 = CRITICAL / SHARED PRINCIPAL CAN ENTER DEDICATED EMPLOYEE SELF
D1-UAT-DEFECT-002 = MATERIAL / EXISTING CURRENT-FY MBO OFFERS CREATE PATH
```

Locked identity architecture:
```text
Dedicated / 1:1:
personal Kintone user -> App53 MBO_Kintone_User exact active mapping -> auto-bind Employee

Shared:
shared Kintone principal -> Employee ID + App801 password
allowed only for employee with valid App53 MBO_Kintone_User.value = []
```

Owner-proven case:
`0113 / Ms.Papatchaya` has dedicated App53 mapping `Ms.Papatchaya`.

Required:
```text
tmh + 0113 => DENY
Ms.Papatchaya native Kintone => auto-bind 0113 => ALLOW
tmh + employee with no dedicated mapping => Shared App801 path still ALLOW
```

## 4. Current accepted corrective, deploy & migration chain

```text
R1 = 8c3fda998fe8bd0b627d62a5beb10455bde8f725 / PARTIAL PASS
R2 = 88ed6b7ea99ca9871190c2a913879b9e7638e3cb / PASS
BUILD = d9efa5a0c418ad98ca8b70965b130a8b607e81b5
DEPLOY_TOOL_CSS_FIX = 03b531383e86c643a5258a2baf6fdbd15bc9099e / PASS
SANDBOX_DEPLOY_R2 = cd74b01e6650bb04b5fbdba6c365dd9a1bf87236 / PASS (Rev 67 -> 68)
CSS_MIGRATION_R1 = 38f5ba111d6ebbfaa09a3415819a92f5a48a1f4d / PASS (Rev 68 -> 69)
```

Canonical customization names:
```text
mbo-employee-app.js (Git blob 8958634b92b35f74b58a7a0b2abd09b8b5e93758)
mbo-employee.css (Git blob 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61)
```
Standard deployment tool preflight restored to `PASS` (`validatePreflight = true`).
App794 verified live at revision 69.

## 5. Current stage scoreboard

```text
D1 = BASE CLOSED / CANDIDATE DEPLOYED (REV 69) / OWNER UAT PENDING
D2_ENGINEERING = PASS / CLOSED / DURABLE
D2_OWNER_UAT = IN PROGRESS / PAUSED
D3 = HOLD
D4 = IN PROGRESS / NOT ACTIVE
D5 = IN PROGRESS / NOT ACTIVE
D6 = UAT NOT CLOSED
D7 = SOURCE FUNCTIONALITY CLOSED / CUTOVER NOT AUTHORIZED
PRODUCTION_READY = NO
```

Do not interpret automated/source closure as Owner UAT PASS.

## 6. Current operational state

Deployment and migration work packages are fully executed and closed.
No further Kintone writes or deployments are authorized.

```text
ACTIVE_WORK_PACKAGE = D1-UAT-OWNER-RUNTIME-UAT-READINESS
STATUS = READY FOR OWNER RUNTIME UAT
APP794_LIVE_REVISION = 69
KINTONE_WRITES_AUTHORIZED = NONE
D3 = HOLD
```

## 7. Owner runtime UAT (Active Milestone)

1. Papatchaya personal Kintone -> 0113 auto-bind -> own MBO.
2. `tmh + 0113` -> DENY with dedicated-account guidance.
3. `tmh + shared-only employee` -> ALLOW via App801.
4. Existing current-FY MBO -> Open Current MBO, not Create New.

## 8. User shorthand

`review` -> fresh-fetch current HEAD; inspect exact authorization baseline, diff, tests/evidence; independently decide PASS/CORRECTIVE/BLOCKED.

`ต่อ` / `ต่อไป` -> fresh-fetch current gate; choose smallest safe next action.

`อนุมัติ ...` -> exact narrow one-shot authorization only; never widen/reuse.

## 9. New chat

Copy the text block in `project-docs/NEW_CHAT_BOOTSTRAP_PROMPT.md`. New chat must fresh-fetch current HEAD and read `CHAT_HANDOFF.md` first.
