# MBO2026 — CHAT HANDOFF

> Canonical concise cross-chat continuation document.  
> Prepared: 2026-08-30 20:45 ICT  
> Repository: `rebootob/MBO2026`  
> Branch: `ai/antigravity-wp002c`  
> Documentation-sync starting HEAD: `b91ec54b607c18cfc28fff5f5611f11d0935c3d9`

**Important:** this file is itself part of later documentation-sync commits, so never treat the starting HEAD above as the current HEAD. Fresh-fetch the branch first.

## 1. Startup for the next chat

1. Fresh-fetch current HEAD of `ai/antigravity-wp002c`.
2. Read this file.
3. Read `AI_CONTROL_CENTER.md`.
4. Read `AI_ACTIVE_TASK.md`.
5. Read `AI_DOCUMENT_INDEX.md`.
6. Open only relevant Confirmed Baselines.
7. If any executor commit exists after this handoff, inspect/review it before repeating work.

Do not broad-scan the repository. Do not run tests/build or access Live Kintone merely to establish context.

## 2. Permanent operating model

```text
ChatGPT = Control Plane / Project Lead / Architect / Independent Reviewer
Antigravity = LOW-CREDIT Execution Plane only
Repository + accepted Live evidence = operational truth
```

No Live Kintone write/deploy/ACL/group/schema/record operation without exact explicit authorization. Never widen/reuse consumed one-shot authorization. No automatic rollback.

## 3. D1–D7 current scoreboard

| ID | Status |
|---|---|
| D1 Hybrid Identity + Password + Employee-Self + Approver Access | 🟠 IN PROGRESS |
| D2 Excel + PDF Original/Legacy Format | 🟠 IN PROGRESS |
| D3 8 Legacy PMS Apps -> App794 Migration | 🟠 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 App800 HR Control Center E2E | 🟠 IN PROGRESS |
| D5 Copy Own Previous MBO | 🟠 IN PROGRESS |
| D6 Integrated E2E / Security / Regression | 🔴 PENDING |
| D7 Admin Support Center | ✅ SOURCE FUNCTIONALITY CLOSED |

## 4. Accepted App794 Live known-good

```text
LIVE_REVISION          = 60
PREVIEW_REVISION       = 60
DEPLOYED_SOURCE_COMMIT = 1ed342ad137a4a364496a28d29bdffd24a99b511
LIVE_SCOPE             = ALL
DESKTOP_JS/CSS         = 1 / 1
MOBILE_JS/CSS          = 0 / 0
LIVE_JS_BLOB           = 115a08ace32bdf850cb5eebf25b953d1803114d0
LIVE_CSS_BLOB          = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
TECHNICAL_READBACK     = PASS WITH AUDIT CAVEAT
USER_RUNTIME_UAT       = PASS
```

Rev60 fatal-Create clean-exit/Back-to-My-MBO behavior is accepted known-good. Do not reopen without regression evidence.

## 5. D1 Hybrid Identity — canonical

```text
D1 = KINTONE-ONLY
HYBRID_IDENTITY = DEDICATED_KINTONE_AUTO_BIND + SHARED_ACCOUNT_MBO_LOGIN
```

### Dedicated
Native Kintone user -> exact authoritative active App53 mapping -> canonical `emp_text` Employee_Code -> Employee-Self auto-bind. No secondary MBO login after exact mapping. `admin-form` is excluded.

### Shared
Approved shared Kintone principal -> Employee_Code + App801 MBO password/session -> Employee-Self. Same-tab session model remains; shared direct-REST Employee_Code hard isolation is not guaranteed and must not be overstated.

### Dual-role
One person remains one employee / one own MBO per FY.

```text
My MBO = bound Employee_Code
My Approval Tasks = current DEDICATED Kintone User + authoritative current App794 native Assignee
SHARED_APPROVER_AUTHORITY = DENIED
```

Do not authorize approvals from App795 static membership, `Manager_User`, `GM_User`, `First_Manager_User`, caller role strings or UI visibility.

## 6. App53 mapping evidence and protection

READ-ONLY Production audit is complete.

```text
MBO_Kintone_User
Field Type = USER_SELECT
Design = CONFIRMED
Live field created = NO

Vassana:
Kintone user = vassana
App53 record = 456
active Number_0 = 1
canonical emp_text = 0044

Natta:
Kintone user = natta
App53 record = 578
active Number_0 = 1
emp_text = BLANK
canonical Employee_Code = UNRESOLVED / FAIL CLOSED
```

Never substitute Natta's Number=243, name, email or vendor data for canonical Employee_Code.

Protected state:

```text
APP53_SCHEMA_WRITE_AUTH = NONE
APP53_RECORD_WRITE_AUTH = NONE
APP53_BULK_WRITE_AUTH = NONE
```

Adding `MBO_Kintone_User`, populating mappings and correcting Natta `emp_text` are three separate protected concerns and must not be silently bundled.

## 7. Own-MBO self-appraiser exception

User-approved:

```text
OWN_MBO_SELF_APPROVER_ELISION = APPROVED
```

For the employee's own MBO only:
- remove only the self appraiser before workflow snapshot;
- preserve remaining appraisers/order/rules;
- shift/recalculate topology;
- never autoapprove or fabricate history;
- never rewrite App795 subordinate routes;
- if no non-self appraiser remains, fail closed.

Confirmed Natta example:
`TMG1|Marketing = natta -> uchida / M1_G1` -> Natta own effective route = `uchida / M1_ONLY`. Other TMG1/TMG2 Marketing employees remain routed through Natta then Uchida.

## 8. Accepted D1 source milestones

```text
HYBRID_IDENTITY_CORE_SOURCE_R1 = PASS
HYBRID_EMPLOYEE_SELF_RUNTIME_ENTRY = PASS
ACCEPTED_BUILD = PASS
ACCEPTED_FULL_REGRESSION = 1024/1024 PASS
APPROVAL_AUTHORITY_SERVICE_R1 = PASS
APPROVAL_AUTHORITY_SERVICE_COMMIT = 5ac5ede6e40a1462f0398ba8740330742041e3bf
```

Approval service current contract:
- list query = `Assignee in (LOGINUSER())`;
- exact/case-sensitive returned Assignee code check;
- public authority paths require `mode === DEDICATED`;
- fresh revalidation uses `getRecord(appId,id) -> record` directly exactly once;
- no `getRecords` fallback for revalidation;
- no App795/static snapshot fallback.

## 9. Current source integration inventory

Current Home/Index already resolves Hybrid Employee-Self context and renders `EmployeeSelfIndexUI` as the canonical `My MBO` owner.

Current Detail path blocks an existing record when `record.Employee_Code != bound Employee_Code`, so assigned Approver cross-employee Detail needs a separate authority path.

Current `app.record.detail.process.proceed` validates topology/business rules but does not yet fresh-revalidate native `Assignee`.

Therefore the mandatory split is:

```text
GATE 1 = HOME INDEX INTEGRATION ONLY
GATE 2 = DEDICATED CROSS-EMPLOYEE DETAIL AUTHORITY
GATE 3 = PROCESS.PROCEED FRESH ASSIGNEE REVALIDATION
```

Do not combine the three by default.

## 10. Exact current Active Task at handoff checkpoint

`D1 MY APPROVAL TASKS — LEAN HOME INDEX INTEGRATION R1`

At documentation-sync checkpoint:

```text
TASK_STATE = OPEN / READY_FOR_EXECUTION
EXECUTOR_COMMIT = NONE ACCEPTED YET
OWNER = ANTIGRAVITY IF STILL UNEXECUTED AFTER FRESH-FETCH
```

Allowed files only:

```text
CREATE src/ui/approver-task-index-ui.js
MODIFY src/main-mbo-app.js
MODIFY tests/employee-main-mbo-app-integration.test.js
```

Expected behavior:
- SHARED -> existing My MBO only; zero approval-task query; no approval section.
- DEDICATED -> existing My MBO + separate `งานรอฉันอนุมัติ / My Approval Tasks` using accepted service.
- new UI is presentation only; no Kintone/App795/authority logic.
- approval fetch failure must not break My MBO or expose actionable task.

Run only:

```text
node --test tests/employee-main-mbo-app-integration.test.js
git diff --check
```

Forbidden in Gate 1:
- build;
- full `npm test`;
- Live Kintone/App53;
- deploy/ACL/group;
- cross-employee Detail authority;
- Process action revalidation;
- project-doc edits by executor.

If a later executor commit exists when the new chat starts, **review it instead of repeating this task**.

## 11. App800 Reset MBO Password checkpoint

Accepted:
- App801 MBO reset core semantics;
- HR native authority readiness (`HR_ADMIN_GROUP`);
- App800 Reset UI source candidate;
- deployment-tool compatibility.

Live App800 remains prior MVP; Reset UI candidate is not deployed. Reset means App801-backed MBO credential only, never Kintone/cybozu password.

## 12. Authorization ledger at handoff

```text
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ACTIVE_ACL_WRITE_AUTH = NONE
ACTIVE_GROUP_WRITE_AUTH = NONE
APP53_SCHEMA_WRITE_AUTH = NONE
APP53_RECORD_WRITE_AUTH = NONE
APP53_BULK_WRITE_AUTH = NONE
ROLLBACK_AUTH = NONE
```

Never infer a new authorization from old chats or this handoff.

## 13. User shorthand

### `review`
Fresh-fetch HEAD -> read Control Center + authorizing Active Task + relevant Baseline -> inspect exact diff/source/tests/evidence -> independently decide PASS/CORRECTIVE/BLOCKED -> update Control Plane docs.

### `ต่อ` / `ต่อไป`
Fresh-fetch HEAD + Control Center + Active Task -> detect accepted/pending/already-executed work -> choose smallest safe next action and owner. If ChatGPT can do it, do not spend Antigravity credit.

### `อนุมัติ ...`
Exact narrow one-shot authorization only. Never widen or reuse after consumption.

## 14. What must not be reopened without evidence

- Rev60 fatal-Create clean-exit known-good;
- D1 Kintone-only architecture / Auth Bridge cancellation;
- accepted Hybrid Core + Employee-Self runtime source;
- Approval Authority Service R1 commit `5ac5ede...`;
- D7 Admin Support Center source closure;
- App800 reset core/source authority semantics;
- accepted App795 routing semantics and own-MBO self-appraiser-elision rule.

## 15. First action in a new chat

After fresh-fetching and reading the current docs, report in Thai:
1. current HEAD;
2. D1–D7 board;
3. accepted Live Rev60 baseline;
4. current gate/Active Task state;
5. authorization ledger;
6. whether an executor commit exists since this handoff;
7. exact next owner/action.

Do not execute Live changes merely because a new chat has started.