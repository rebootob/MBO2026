# MBO2026 — LEAN MULTI-AI HANDOFF PROTOCOL

> Provider-neutral continuity standard.  
> Updated: 2026-08-30 20:45 ICT  
> Core principle: **AI can change; project truth must not change.**

## 1. Truth and roles

Conversation memory is convenience only. Canonical truth is repository + accepted Kintone/Live evidence.

```text
ChatGPT = Control Plane / Project Lead / Architect / Independent Reviewer
Antigravity = Low-Credit Execution Plane only
Canonical branch = ai/antigravity-wp002c
```

Purpose-specific authority:
- Confirmed Baseline = durable rules;
- Master Joblist = D1–D7 completeness;
- Control Center = current accepted state/gate/authorization;
- Active Task = current execution packet, not proof of success;
- Git/Kintone evidence = actual implementation/runtime truth;
- CHAT_HANDOFF = concise cross-chat snapshot, always revalidated against HEAD.

## 2. Receiving AI startup — lean mandatory order

1. Fresh-fetch branch HEAD.
2. Read `project-docs/CHAT_HANDOFF.md`.
3. Read `project-docs/AI_CONTROL_CENTER.md`.
4. Read `project-docs/AI_DOCUMENT_INDEX.md`.
5. Read `project-docs/AI_ACTIVE_TASK.md` if execution/review is involved.
6. Read only the relevant Baseline(s) routed by Document Index.
7. If reviewing execution, inspect exact diff/source/test/evidence.

Do **not** automatically:
- read all historical docs;
- run `npm test` or build;
- perform Kintone GET/write/deploy;
- ask the user to repeat project history.

Those actions happen only when the current gate requires them.

## 3. Control Plane handoff checkpoint

Before moving chats, ChatGPT should ensure operational docs truthfully capture:
- current branch and need to re-fetch HEAD;
- D1–D7 scoreboard;
- accepted Live baseline;
- exact current gate/Active Task;
- accepted work that must not be reopened;
- exact next owner;
- open evidence/configuration blockers;
- current authorization ledger;
- App53/legacy protection state;
- special D1 dedicated/shared/dual-role semantics.

No test run is required merely to update documentation. Never invent a test count that was not observed/persisted.

## 4. Executor handoff checkpoint

Antigravity must follow only the current Active Task:
1. fresh-fetch current branch;
2. open Control Center + Active Task + exact named files;
3. modify only allowed files;
4. run only explicitly required test/build/runtime commands;
5. run `git diff --check` when required;
6. commit/push once if task says so;
7. STOP and report exact commit/files/tests/operations.

Antigravity must not edit Control Plane documents unless explicitly authorized, and must not self-certify independent PASS.

## 5. Independent review protocol

When user says `review`, ChatGPT:
1. fresh-fetches HEAD;
2. reads Control Center + authorizing Active Task + relevant Baseline;
3. verifies parent/scope/diff/source/test evidence;
4. separates executor-reported results from independently inspected/executed evidence;
5. decides `PASS`, `CORRECTIVE`, or `BLOCKED`;
6. updates Control Plane docs;
7. opens only the smallest next gate.

Accepted work is not reimplemented without proven regression.

## 6. Live Kintone safety

No POST/PUT/DELETE/deploy/ACL/group/schema/record change without a fresh exact explicit authorization naming the target and scope.

```text
NO_AUTH = NO_WRITE
ONE_SHOT = ONE_EXACT_OPERATION
NO_WIDENING
NO_REUSE
NO_AUTOMATIC_ROLLBACK
```

App53 and legacy PMS Apps `283,310,305,643,307,640,715,716` remain protected/read-only by default.

## 7. D1 continuity rules that must survive handoff

```text
D1 = KINTONE-ONLY
HYBRID_IDENTITY = DEDICATED_KINTONE_AUTO_BIND + SHARED_ACCOUNT_MBO_LOGIN
SHARED_APPROVER_AUTHORITY = DENIED
OWN_MBO_SELF_APPROVER_ELISION = APPROVED
```

Dedicated identity requires exact active App53 mapping. The App53 audit is complete, but `MBO_Kintone_User` is design-only/not live and Natta's canonical Employee_Code remains unresolved.

Approver authority is authoritative current App794 native `Assignee`, never static App795/snapshot fields/UI role strings.

## 8. New-chat procedure

Use `project-docs/NEW_CHAT_BOOTSTRAP_PROMPT.md` as the first message in a new ChatGPT conversation. It instructs the new chat to re-fetch HEAD and read `CHAT_HANDOFF.md` before acting.

No old `develop`-branch push instruction or broad 12-document read list is part of the current protocol.