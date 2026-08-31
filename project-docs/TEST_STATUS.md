# MBO2026 — TEST & UAT STATUS

> Updated: 2026-08-31 ICT.  
> Records accepted checkpoints only; do not invent unpersisted executor counts.

## 1. Latest accepted broad source checkpoint

Hybrid Employee-Self Runtime Entry milestone:

```text
npm run ui:build = PASS
npm test = PASS (1024/1024)
git diff --check = PASS
FINAL_WORKTREE_CLEAN = YES
LIVE_KINTONE_OPERATIONS = 0
APP53_PRODUCTION_TOUCHED = NO
```

This remains the latest accepted full-regression count for that source milestone. It does not mean all later Live configuration/UAT/privacy gates are closed.

## 2. Approval authority foundation

Accepted Approval Authority Service R1 commit:
`5ac5ede6e40a1462f0398ba8740330742041e3bf`.

Accepted contract includes:
- Dedicated-only public approval authority;
- exact/case-sensitive current `STATUS_ASSIGNEE` code check;
- list query `Assignee in (LOGINUSER())`;
- fresh `getRecord(appId,id)` revalidation for record/action authority;
- no App795/static snapshot fallback;
- SHARED approver denial.

## 3. App53 identity UAT — PASS

User-operated Browser Console evidence:

```text
APP53_TOTAL_RECORDS = 281
MBO_Kintone_User_FIELD = USER_SELECT / optional / live
DEDICATED_TARGET_RECORDS_VERIFIED = 24
MBO_Kintone_User_NONEMPTY_RECORDS = 24
UNEXPECTED_NONEMPTY_RECORDS = 0
papatchaya -> App53 #426 -> Employee Code 0113
```

Active short numeric `emp_text` normalization was completed for active standard codes; five explicit unused/non-standard rows were excluded: 382, 390, 495, 496, 497.

## 4. App794 workflow/config UAT — PASS for corrected points

Accepted user-operated Live configuration corrections:

```text
TWO_BUTTON_FIX_01 = PASS
TWO_BUTTON_FIX_06 = PASS
TWO_BUTTON_FIX_11 = PASS
GM_User_REQUIRED_FALSE = PASS
MBO_DEDICATED_ACCESS_APP_PERMISSION = PASS
```

Topology behavior:
- First Manager action only for `M1_M2_G1`, `M1_M2_G1_G2`.
- Direct Manager action only for `M1_G1`, `M1_G1_G2`, `M1_ONLY`.

## 5. Clean Dedicated Employee-Self UAT — PASS

Disposable legacy App794 test Record #11 was deleted. New clean Record #12 was created while logged in as native Kintone user `papatchaya`.

Pre-transition exact readback:

```text
RECORD_ID = 12
EMPLOYEE_CODE = 0113
REQUESTER_USER = papatchaya
MANAGER_LEVEL1_APPROVERS = pattama
MANAGER_LEVEL2_APPROVERS = BLANK
GM_LEVEL1_APPROVERS = BLANK
GM_LEVEL2_APPROVERS = BLANK
FIRST_MANAGER_USER = BLANK
MANAGER_USER = pattama
GM_USER = BLANK
HAS_MANAGER_LEVEL2 = No
HAS_GM_LEVEL2 = No
ROUTING_TOPOLOGY = M1_ONLY
D1_CLEAN_DEDICATED_ROUTING_SNAPSHOT = PASS
```

This validates own-MBO self-appraiser elision for the tested route:

```text
App795 TMH2 master = papatchaya -> pattama / M1_G1
Papatchaya own route = pattama only / M1_ONLY
```

## 6. Native workflow transition UAT — PASS

Papatchaya executed `Submit Objective to Manager` from Record #12.

Fresh GET-only readback:

```text
STATUS = 03 Manager Objective Review
ASSIGNEE = pattama
REQUESTER = papatchaya
MANAGER = pattama
GM = BLANK
TOPOLOGY = M1_ONLY
PAPATCHAYA_TO_PATTAMA_NATIVE_WORKFLOW = PASS
```

Therefore the tested Dedicated path is accepted through native manager assignment.

Interactive Pattama-login UAT remains pending because the user does not have Pattama's password. Do not reset another person's native Kintone password merely to force UAT.

## 7. Current test gate — App794 record ACL privacy

Current task is GET-only design/validation before any ACL write.

Must prove complete behavior across all 16 statuses:

```text
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
```

Required acceptance:
- requester views own record throughout lifecycle;
- requester edits only employee-owned stages;
- current approver gets View/Edit only while authoritative/current;
- stale prior approver does not retain access after transition/reassignment unless another current role grants it;
- HR/Admin retain required access;
- static App795 membership alone grants nothing.

No partial ACL write is accepted.

## 8. Pending future test gates

Not yet closed:
- complete App794 record ACL/privacy UAT;
- Dedicated approver interactive My Approval Tasks/detail/action UAT when suitable account access is available;
- Shared Employee-Self/App801 session UAT;
- Dedicated + Shared + dual-role integrated D1 UAT;
- comments/history/attachments security/truthfulness;
- final D1/D6 security/regression;
- D2–D5 completion-specific tests.

Always use `AI_CONTROL_CENTER.md` for current gate and never claim project-wide PASS from a subsystem UAT.
