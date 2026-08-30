# MBO2026 — PROJECT LATEST SUMMARY

> Prepared: 2026-08-30 20:45 ICT  
> Repository: `rebootob/MBO2026`  
> Canonical branch: `ai/antigravity-wp002c`  
> This is a human-readable checkpoint. Always re-fetch HEAD and `AI_CONTROL_CENTER.md` before acting.

## 1. Operating model

```text
ChatGPT = Control Plane / Project Lead / Architect / Independent Reviewer
Antigravity = Low-Credit Execution Plane only
Git + accepted Live evidence = operational truth
CONFIRMED_BASELINE = durable truth
00_MASTER_JOBLIST = D1-D7 no-drop authority
AI_CONTROL_CENTER = current accepted status/gate/auth
AI_ACTIVE_TASK = exact current execution packet only
```

No Live Kintone write/deploy without fresh exact explicit authorization. Do not widen/reuse consumed authorization. Protected sources remain read-only by default.

## 2. Accepted Live App794 baseline

```text
LIVE_REVISION = 60
PREVIEW_REVISION = 60
DEPLOYED_SOURCE_COMMIT = 1ed342ad137a4a364496a28d29bdffd24a99b511
LIVE_SCOPE = ALL
DESKTOP JS/CSS = 1 / 1
MOBILE JS/CSS = 0 / 0
LIVE_JS_BLOB = 115a08ace32bdf850cb5eebf25b953d1803114d0
LIVE_CSS_BLOB = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
TECHNICAL_READBACK = PASS WITH AUDIT CAVEAT
USER_RUNTIME_UAT = PASS
```

Rev60 closed the fatal-Create clean-exit/leave-site popup defect and is accepted known-good.

## 3. D1 current architecture and source state

```text
D1 = KINTONE-ONLY
HYBRID_IDENTITY = DEDICATED_KINTONE_AUTO_BIND + SHARED_ACCOUNT_MBO_LOGIN
HYBRID_CORE_SOURCE_R1 = PASS
HYBRID_EMPLOYEE_SELF_RUNTIME_ENTRY = PASS
LATEST_ACCEPTED_BUILD = PASS
LATEST_ACCEPTED_FULL_REGRESSION = 1024/1024 PASS
```

Dedicated users bind from exact current Kintone User Code to exactly one active App53 mapping and canonical `emp_text` Employee_Code; no second MBO login after exact binding.

Shared users retain Employee_Code + App801 MBO password/session. `DIRECT_URL_REST_HARD_ISOLATION = NOT_GUARANTEED_UNDER_SHARED_KINTONE_ACCOUNT` remains an explicit platform limitation.

## 4. App53 mapping audit — complete, configuration not live

READ-ONLY Production audit is complete.

```text
MBO_Kintone_User FIELD DESIGN = USER_SELECT / CONFIRMED
LIVE FIELD CREATED = NO
Vassana = kintone vassana / App53 #456 / active / emp_text 0044
Natta = kintone natta / App53 #578 / active / emp_text BLANK
```

Natta's real canonical Employee_Code is not proven and must never be guessed from Number=243, name, email or vendor data.

Adding the field, populating mappings and correcting Natta are three distinct protected changes. No App53 write authorization exists.

## 5. Effective requester and own-MBO route

Dedicated own MBO effective requester = own dedicated Kintone User. Shared employee effective requester = App795 `Requester_User` fallback.

User-approved rule:

```text
OWN_MBO_SELF_APPROVER_ELISION = APPROVED
```

For own MBO only, remove self from effective appraiser route before workflow snapshot, preserve remaining order/rules, recalculate topology, never autoapprove/fabricate history and never rewrite App795. If no non-self approver remains, fail closed.

Confirmed Natta example:
`TMG1|Marketing natta -> uchida / M1_G1` -> Natta own effective route `uchida / M1_ONLY`; other employees remain `natta -> uchida`.

## 6. My Approval Tasks authority foundation — PASS

READ-ONLY App794 proof established native field:

```text
Assignee.type = STATUS_ASSIGNEE
```

Canonical Dedicated approval list:
`Assignee in (LOGINUSER())` plus exact/case-sensitive returned `Assignee.value[].code` validation.

Open/action requires a fresh App794 GET and exact current Assignee revalidation. App795/static appraiser fields/caller role/UI state are never approval authority. SHARED approver authority is denied.

Accepted Approval Authority Service R1 commit:
`5ac5ede6e40a1462f0398ba8740330742041e3bf`.

## 7. Current integration sequence

Source inventory proved Home, cross-employee Detail and Process action must be separate gates:

```text
GATE 1 = HOME INDEX INTEGRATION ONLY — OPEN
GATE 2 = DEDICATED CROSS-EMPLOYEE DETAIL AUTHORITY — PENDING
GATE 3 = PROCESS.PROCEED FRESH ASSIGNEE REVALIDATION — PENDING
```

Current Active Task = `D1 MY APPROVAL TASKS — LEAN HOME INDEX INTEGRATION R1`.

Allowed executor files:

```text
CREATE src/ui/approver-task-index-ui.js
MODIFY src/main-mbo-app.js
MODIFY tests/employee-main-mbo-app-integration.test.js
```

Focused test only; no build/full suite/live Kintone/App53/deploy. At documentation-sync checkpoint no Gate-1 executor commit had yet been accepted; fresh-fetch before reissuing execution.

## 8. App800 Reset MBO Password

Accepted:
- App801-backed reset core semantics;
- HR native authority readiness;
- App800 Reset UI source candidate;
- deployment tooling compatibility.

Not accepted/executed:
- live deployment of Reset UI;
- any current password reset operation.

Reset MBO Password is never a native Kintone/cybozu password reset.

## 9. D1–D7 scoreboard

| ID | Status |
|---|---|
| D1 Hybrid Identity/Password/Employee-Self/Approver | 🟠 IN PROGRESS |
| D2 Excel + PDF legacy format | 🟠 IN PROGRESS |
| D3 8-app legacy migration | 🟠 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 App800 HR Control Center | 🟠 IN PROGRESS |
| D5 Copy Own Previous MBO | 🟠 IN PROGRESS |
| D6 Integrated E2E/Security/Regression | 🔴 PENDING |
| D7 Admin Support Center | ✅ SOURCE FUNCTIONALITY CLOSED |

## 10. Current authorization

```text
KINTONE WRITE = NONE
DEPLOY = NONE
ACL = NONE
GROUP = NONE
APP53 SCHEMA/RECORD/BULK = NONE
ROLLBACK = NONE
```

## 11. Continuation documents

New session starts with:
1. fresh current HEAD;
2. `CHAT_HANDOFF.md`;
3. `AI_CONTROL_CENTER.md`;
4. `AI_ACTIVE_TASK.md`;
5. `AI_DOCUMENT_INDEX.md`;
6. only relevant Confirmed Baselines.

Use `NEW_CHAT_BOOTSTRAP_PROMPT.md` as the copy/paste first message for a new chat.