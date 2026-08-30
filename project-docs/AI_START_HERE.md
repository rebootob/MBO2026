# AI START HERE — MBO2026

> Mandatory lean entry point for every AI working on MBO2026.  
> Updated: 2026-08-30 20:45 ICT

## 1. Startup order

Before planning, reviewing, coding or changing Kintone:

1. Fresh-fetch HEAD of `ai/antigravity-wp002c`.
2. Read `project-docs/CHAT_HANDOFF.md`.
3. Read `project-docs/AI_CONTROL_CENTER.md`.
4. Read `project-docs/AI_DOCUMENT_INDEX.md`.
5. Read `project-docs/AI_ACTIVE_TASK.md` when execution/review is involved.
6. Read `project-docs/CONFIRMED_BASELINE/README.md` and only the Baseline(s) routed by the Document Index.
7. Inspect exact latest diff/evidence if reviewing executor work.

Do not broad-read the repository or historical project docs. Do not ask the user to repeat history already in Git. Do not perform Live Kintone write/deploy during startup.

Repository/live evidence beats chat memory and any embedded handoff checkpoint.

## 2. Authority by purpose

- `CONFIRMED_BASELINE/` = durable confirmed business/security/technical truth.
- `00_MASTER_JOBLIST.md` = D1–D7 no-drop/completeness authority.
- `AI_CONTROL_CENTER.md` = current independently accepted operational state, blockers, authorization and next owner.
- `AI_ACTIVE_TASK.md` = exact current execution packet only; not proof of success.
- Git/Kintone evidence = what actually exists/ran/live-read-back.
- `CHAT_HANDOFF.md` = concise cross-chat continuation snapshot; always revalidate against current HEAD.

## 3. Permanent roles

**ChatGPT = Control Plane**
- plan, architecture, Git inspection, independent review, PASS/CORRECTIVE/BLOCKED decision;
- maintain operational/control/handoff documentation;
- use Antigravity only when actual source/local-runtime/Kintone execution is necessary.

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
`native Kintone user -> exact active App53 mapping -> canonical emp_text Employee_Code -> Employee-Self auto-bind`, with no second MBO login.

Shared user:
`approved shared Kintone principal -> Employee_Code + App801 MBO password/session -> Employee-Self`.

Dual-role Employee + Approver:
- one employee identity / one own MBO per FY;
- `My MBO` = bound Employee_Code;
- `My Approval Tasks` = current dedicated Kintone User + authoritative native current `Assignee`;
- App795/static snapshots are not approval authority;
- SHARED approval authority is denied.

Own-MBO route rule:
`OWN_MBO_SELF_APPROVER_ELISION = APPROVED`; remove self only from own effective route before snapshot, preserve remaining order/rules, never autoapprove/fabricate history; fail closed if no non-self approver remains.

## 5. App53 current truth

```text
APP53 = PRODUCTION / READ_ONLY BY DEFAULT
READ_ONLY_MAPPING_AUDIT = COMPLETED
MBO_Kintone_User DESIGN = CONFIRMED USER_SELECT
LIVE FIELD CREATED = NO
Vassana canonical Employee_Code = 0044 PROVEN
Natta canonical Employee_Code = UNRESOLVED / emp_text BLANK / FAIL CLOSED
```

Do not create/populate/correct App53 without a fresh exact one-shot authorization and production-safety gates.

## 6. Current D1 implementation chain

Always confirm in Control Center, but current accepted sequence is:

```text
Hybrid Core Source R1 = PASS
Hybrid Employee-Self Runtime Entry = PASS
Latest accepted full regression = 1024/1024 PASS
Approval Authority Service R1 = PASS
Home Index Integration = CURRENT GATE
Cross-employee Detail Authority = LATER GATE
Process.proceed Fresh Assignee Revalidation = LATER GATE
```

Approval Authority Service accepted commit:
`5ac5ede6e40a1462f0398ba8740330742041e3bf`.

## 7. D1–D7 no-drop

```text
D1 Hybrid Identity + Password + Employee-Self + Approver
D2 Excel + PDF Legacy Format Export
D3 8 Legacy PMS Apps -> App794 Migration
D4 App800 HR Control Center End-to-End
D5 Copy Own Previous MBO
D6 Integrated E2E / Security / Regression
D7 Admin Support Center
```

Use `00_MASTER_JOBLIST.md` for closure criteria and `AI_CONTROL_CENTER.md` for current status.

## 8. User shorthand

`review` -> fresh-fetch HEAD; read current Control Center + authorizing Active Task + relevant Baseline; inspect exact diff/evidence; independently decide PASS/CORRECTIVE/BLOCKED; update Control Plane docs.

`ต่อ` / `ต่อไป` -> fresh-fetch HEAD + Control Center + Active Task; check whether the current work is accepted, pending or already executed; choose the smallest safe next action; do not spend Antigravity if ChatGPT can do it.

`อนุมัติ ...` -> treat as exact narrow authorization; never widen or reuse a consumed one-shot authorization.

## 9. New chat

Use `project-docs/NEW_CHAT_BOOTSTRAP_PROMPT.md` as the copy/paste prompt. The new chat must then read `CHAT_HANDOFF.md` and re-fetch repository truth before acting.