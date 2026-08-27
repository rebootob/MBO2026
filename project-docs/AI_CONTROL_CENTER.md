# MBO2026 — AI CONTROL CENTER

> **Single Operational Source of Truth for Multi-AI Work**
>
> Repository: `rebootob/MBO2026`  
> Working / canonical execution branch: `ai/antigravity-wp002c`  
> Control Plane: **ChatGPT**  
> Execution Plane: **Antigravity only when execution is actually required**  
> Fallback execution tool: only when the user explicitly chooses/authorizes another execution AI  
> Updated: 2026-08-28

---

## 0. ABSOLUTE FIRST-READ RULE

**Every AI that touches MBO2026 MUST read this file before planning, reviewing, coding, changing Kintone, or giving project status.**

This file is the operational control center for:
- current D1–D7 status;
- current stage and next action;
- authorization state;
- latest accepted evidence vs pending evidence;
- blocker ownership;
- Antigravity credit policy;
- handoff rules;
- review rules;
- what must / must not be read next.

Authority order when facts conflict:

1. `project-docs/CONFIRMED_BASELINE/` = confirmed business / technical semantics.
2. `project-docs/00_MASTER_JOBLIST.md` = D1–D7 completeness / no-drop authority.
3. **This `AI_CONTROL_CENTER.md` = current operational state, current ownership, current next action, credit policy, authorization ledger.**
4. `project-docs/AI_ACTIVE_TASK.md` = current short execution packet only.
5. Git/Kintone evidence = factual implementation evidence; repository evidence beats chat memory.

If a conflict exists, report it. Do not silently choose a convenient version.

---

## 1. NEW OPERATING MODEL — CONTROL PLANE FIRST

### ChatGPT = Control Plane / Project Lead / Architect / Independent Reviewer

ChatGPT owns:
- planning;
- architecture and scope control;
- requirement reconciliation;
- reading broad project history when needed;
- GitHub inspection and commit/diff review;
- writing/updating this Control Center;
- writing `AI_ACTIVE_TASK.md`;
- deciding PASS / FAIL / BLOCKED;
- deciding whether Antigravity is needed at all;
- preparing exact live-write/deploy plans;
- checking evidence after Antigravity pushes;
- maintaining D1–D7 continuity;
- preparing new-chat bootstrap instructions.

### Antigravity = Low-Credit Execution Plane

Antigravity is **NOT** the planner, project historian, reviewer, document analyst, or status manager.

Use Antigravity only when at least one of these is required:
1. actual source-code implementation/change in the local project environment;
2. live Kintone read/write/configuration/deployment that ChatGPT cannot directly execute;
3. local build/runtime operation needed to produce implementation evidence;
4. exact environment-specific action explicitly assigned by `AI_ACTIVE_TASK.md`.

If none of those are required, **do not invoke Antigravity**.

---

## 2. ANTIGRAVITY LOW-CREDIT POLICY — MANDATORY

### 2.1 What Antigravity MUST NOT spend credit on

Do NOT ask Antigravity to:
- read the whole repository;
- read all historical project docs;
- re-read all Confirmed Baseline files every round;
- design architecture already decided by ChatGPT;
- write a plan before execution when `AI_ACTIVE_TASK.md` already contains the plan;
- self-review its own implementation as an independent reviewer;
- compare Git commits for ChatGPT;
- produce long explanations or long status reports;
- create duplicate review/evidence documents;
- run broad unrelated tests;
- repeat UAT already completed unless the changed scope invalidates it;
- polish unrelated UI;
- refactor outside the immediate gate;
- investigate future work not needed for the current gate;
- update many project documents after every small action.

### 2.2 Minimal read budget for Antigravity

For each work package Antigravity should normally read only:

1. `project-docs/AI_CONTROL_CENTER.md`
2. `project-docs/AI_ACTIVE_TASK.md`
3. exact source/config files explicitly listed inside `AI_ACTIVE_TASK.md`

Anything else requires a concrete reason from the active task.

### 2.3 Minimal execution budget

Default rules:
- **No planning mode. Execute directly.**
- One narrowly scoped work package at a time.
- Prefer one execution session.
- Prefer one commit + one push.
- Use existing functions/modules before creating new files.
- Do not create extra scripts unless necessary for the immediate gate.
- Stop quickly on a real blocker; do not explore broadly.

### 2.4 Test budget

Use the smallest test set that proves the changed scope:
- docs/config-only task: no `npm test` unless technically relevant;
- narrow source change: focused tests first;
- full `npm test`: only when the source change can affect broad behavior or when a release gate specifically requires it;
- manual UI UAT: only at the real UI gate, not repeatedly after every internal step.

### 2.5 Output budget

Antigravity final output should normally be <= 15 concise lines and contain only:
- HEAD/commit;
- action actually executed;
- read-back/result;
- tests actually run;
- blocker if any;
- whether live write/deploy occurred;
- final execution status.

No essays. No re-explanation of project architecture.

### 2.6 Evidence budget

Antigravity should not create an evidence file unless evidence cannot be reliably reconstructed from:
- Git diff/commit;
- Kintone read-back;
- concise final output.

If an evidence file is required, create **one short sanitized evidence file only**. Never commit secrets, raw Password_Hash values, passwords, tokens, cookies, or session material.

---

## 3. STANDARD WORKFLOW — EVERY CHANGE

```text
User request / issue
      ↓
ChatGPT reads AI_CONTROL_CENTER first
      ↓
ChatGPT fetches current Git HEAD + relevant evidence
      ↓
ChatGPT decides whether execution is required
      ↓
NO execution needed ──> ChatGPT handles planning/review/docs itself
      ↓ YES
ChatGPT writes a SHORT AI_ACTIVE_TASK
      ↓
Antigravity reads ONLY Control Center + Active Task + listed files
      ↓
Antigravity executes exact scope
      ↓
Focused verification / read-back
      ↓
One commit + push
      ↓
STOP
      ↓
User says `review`
      ↓
ChatGPT independently re-fetches GitHub and reviews actual evidence
      ↓
PASS / CORRECTIVE / BLOCKED
      ↓
ChatGPT updates AI_CONTROL_CENTER + next AI_ACTIVE_TASK
```

### No self-certification

Execution Plane maximum status:
`IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`

Only ChatGPT independent review can move a gate to PASS/ACCEPTED.

---

## 4. GIT / CHANGE GOVERNANCE

Canonical repository:
`rebootob/MBO2026`

Primary working branch:
`ai/antigravity-wp002c`

Rules:
- Git evidence wins over chat memory.
- Before `review`, ChatGPT must re-fetch current branch HEAD.
- No manual copying between worktrees/branches.
- Do not merge/cherry-pick failed implementation branches blindly.
- Protected data sources remain protected.
- Kintone writes/deploys require the current authorization boundary to allow them.
- Never claim PASS without evidence.
- Never claim CI PASS when no CI run exists.

For config/live tasks, commit only sanitized control/evidence material if a commit is needed.

---

## 5. AUTHORIZATION MODEL

Authorizations already granted remain valid until:
- completed;
- explicitly revoked;
- or the proposed action materially changes scope/risk.

Do **not** repeatedly ask the user to authorize the same unchanged operation.

A new explicit authorization is required when:
- scope materially widens;
- a new bulk write is introduced;
- protected source data would be modified;
- a new production-impacting operation is introduced that was not covered by prior approval.

Current D1 authorization ledger:

```text
D1_SOURCE_IMPLEMENTATION                 = APPROVED / SOURCE ACCEPTED
D1_LIVE_CUTOVER                          = APPROVED
DEDICATED_MBO_ACCESS_GROUP_MODEL         = APPROVED
APP801_GROUP_ACL_MODEL                   = APPROVED
APP801_CREDENTIAL_BULK_PROVISIONING      = NOT AUTHORIZED YET
APP794_D1_CUSTOMIZATION_DEPLOY           = WAITING CURRENT GATE / DO NOT EXECUTE YET
D2-D7 LIVE WRITES                        = NOT AUTHORIZED unless separately recorded
```

---

## 6. CURRENT PROJECT SCOREBOARD — D1–D7

| ID | Deliverable | Current Control Status |
|---|---|---|
| D1 | Login + Password Change + Employee-Self MBO Gate | 🟠 SOURCE PASS; live cutover in progress |
| D2 | Excel + PDF export in original legacy format | 🟠 IN PROGRESS |
| D3 | Migrate Apps 283,310,305,643,307,640,715,716 -> App794 | 🟠 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | App800 HR Control Center end-to-end lifecycle | 🟠 IN PROGRESS |
| D5 | Copy ONLY own prior Objective / Action Plan / Additional Agreement / Weight | 🔴 MUST FIX |
| D6 | Integrated E2E / Security / Regression closure | 🔴 BLOCKED until prerequisite closure |
| D7 | Admin Support Center | ✅ PASS / CLOSED |

No AI may silently drop any D1–D7 item.

---

## 7. D1 — CURRENT LIVE STATE

### 7.1 Accepted source state

Accepted D1 source commit:
`63796999a321a24e1cbd29ceaad82b43980fe8ea`

Accepted behavior includes:
- blocking MBO Login;
- Employee_Code + App801 password;
- PBKDF2-SHA256 WebCrypto;
- page-memory authentication only;
- Force Password Change;
- normal Change Password with current-password verification;
- Logout;
- failed-attempt lockout;
- Employee Self identity bound to authenticated code;
- My MBO list isolation at custom UI level;
- fail-closed create/detail/edit behavior;
- authenticated create reuse of App53 -> App795 -> App796 -> duplicate -> Record_Key -> snapshot path.

Known accepted architecture limitation:
`DIRECT_URL_REST_HARD_ISOLATION = NOT_GUARANTEED_UNDER_SHARED_KINTONE_ACCOUNT`

### 7.2 Dedicated Kintone access model

Approved permanent model:

```text
Kintone shared/access accounts
        ↓
membership in MBO_EMPLOYEE_ACCESS
        ↓
App801 GROUP permission: View + Edit only
        ↓
MBO Login identifies actual employee by Employee_Code/App801 credential
```

Initial required Kintone principals supplied by user:
`f1,f2,f3,tmh,e1,s1,g_request,t1,t2`

Future Kintone shared accounts should normally be handled by adding membership to `MBO_EMPLOYEE_ACCESS`; source code and App801 ACL design should not need redesign.

### 7.3 Latest Antigravity execution report — PENDING INDEPENDENT REVIEW

Latest reported execution evidence commit:
`2cd8d707d6fcb42c627b3c8302c3f93f629029f9`

**Important: this is an Execution Plane report and is NOT automatically accepted until ChatGPT independently reviews it.**

Reported by Antigravity:
- all 9 principals verified;
- `MBO_EMPLOYEE_ACCESS` group created, group ID 86;
- automatic membership write did not complete; 9 members reported NOT YET PRESENT;
- App801 app ACL changed to grant `MBO_EMPLOYEE_ACCESS` View/Edit only;
- `GROUP:everyone` remained denied;
- no App801 credential records created;
- dry-run reported 281 App53 active candidates -> 198 valid provisioning candidates;
- reported data exceptions: 79 blank `emp_text`, 3 non-numeric-format codes, duplicate code `9000`;
- candidate `0118` present;
- candidate `0119` reported absent from App53;
- App794 D1 customization not deployed.

### 7.4 Current immediate next action

**DO NOT invoke Antigravity yet.**

Next action owner: **ChatGPT**

Required next step:
1. independently review commit `2cd8d707...` and its claims;
2. distinguish proven facts from weak/incorrect interpretations (especially group membership API failure semantics and provisioning candidate rules);
3. decide whether manual group membership action is required;
4. decide the exact credential candidate set before authorizing any App801 bulk provisioning;
5. update this Control Center;
6. only then issue the next short `AI_ACTIVE_TASK.md` if execution is necessary.

This is intentionally designed to save Antigravity credit.

---

## 8. D1 DATA / PROVISIONING GATES STILL OPEN

Before App801 credential bulk provisioning can be authorized, Control Plane must resolve/accept:
- exact valid employee candidate rule from App53;
- 79 blank `emp_text` records — whether truly excluded employees or data-mapping issue;
- codes `50.03`, `50.02`, `0050_2` — whether invalid or legitimate legacy employee identifiers;
- duplicate `9000` — exact record authority/dedup rule;
- employee/test identity `0119` absence — choose a valid second isolation-test employee if 0119 is not a real App53 employee;
- group membership state of the 9 Kintone access principals.

Do not bulk provision until these are resolved by Control Plane.

---

## 9. MANUAL UAT RULE

D1 cannot close from source/tests alone.

Final live UI UAT must include at minimum:
- Login appears on App794 entry;
- initial/default password behavior;
- Force Password Change when applicable;
- reload/re-entry requires Login again;
- new password login;
- wrong password/lockout path;
- Change Password requires current password;
- Logout re-blocks;
- employee A My MBO shows only own ordinary UI items;
- create autoload completes without Employee ID re-entry;
- employee A opening employee B detail/edit is visibly blocked;
- no raw Password_Hash/password in normal UI/DOM/storage.

Do not repeat this full UAT before the actual live-deploy gate unless a specific change requires focused manual verification.

---

## 10. ROLE-BASED READING POLICY

### New ChatGPT / Control Plane session
Read:
1. `AI_CONTROL_CENTER.md` first;
2. current branch HEAD;
3. `AI_ACTIVE_TASK.md`;
4. `00_MASTER_JOBLIST.md` for D1–D7 completeness;
5. only the Confirmed Baseline files relevant to the current gate;
6. latest relevant execution evidence/diff.

Do not read every historical file by default.

### Antigravity execution session
Read only:
1. `AI_CONTROL_CENTER.md`;
2. `AI_ACTIVE_TASK.md`;
3. files explicitly listed in the active task.

### Independent review session
Read:
1. `AI_CONTROL_CENTER.md`;
2. current HEAD + compare/diff;
3. `AI_ACTIVE_TASK.md` that authorized the work;
4. changed files/evidence;
5. only relevant baseline/source/tests needed to judge the changed scope.

---

## 11. CONTROL CENTER UPDATE RULE

ChatGPT must update this file when any of these changes:
- D1–D7 status;
- current stage;
- authorization state;
- accepted architecture;
- blocker;
- accepted/rejected execution evidence;
- next action owner;
- canonical execution branch;
- major test/UAT result.

Execution AI should **not** spend credit maintaining this file unless ChatGPT explicitly assigns that one change.

---

## 12. SHORT COMMAND CONTRACT

User shorthand:

`review`
- ChatGPT re-fetches current branch HEAD and independently reviews the latest execution against Control Center + Active Task.

`ต่อ` / `ต่อไป`
- ChatGPT re-fetches current HEAD + Control Center first, determines the smallest next step, updates Active Task if execution is required, and keeps D1–D7 visible.

`อนุมัติ ...`
- ChatGPT records the authorization boundary in this Control Center / Active Task before execution.

Never interpret shorthand as permission to widen scope.

---

## 13. END STATE FOR THIS OPERATING MODEL

The project should run as:

```text
ONE operational truth  = AI_CONTROL_CENTER.md
ONE short executor job = AI_ACTIVE_TASK.md
ONE independent review = ChatGPT via GitHub evidence
MINIMUM Antigravity use = execution only
```

The goal is not to minimize correctness. The goal is to spend Antigravity credit **only where its execution capability adds value** while keeping planning, reasoning, control, review, and continuity in ChatGPT/GitHub.
