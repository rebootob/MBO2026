# MBO2026 — HANDOFF COMPATIBILITY POINTER

> Updated: 2026-08-31 ICT  
> This filename is retained for compatibility with older workflows.  
> **Canonical current cross-chat handoff is `project-docs/CHAT_HANDOFF.md`.**

Do not use older content from this file's Git history as current operational truth.

## Current checkpoint

```text
Repository = rebootob/MBO2026
Branch = ai/antigravity-wp002c
D1 = PASS / CLOSED
FINAL_D1_SECURITY_REVIEW = PASS
APP794 LIVE REVISION = 67
RUNTIME SOURCE COMMIT = c6864d09f59cfaf6e7c86da422452a816a5cf430
EMPLOYEE_LIFECYCLE_POLICY = CONFIRMED
PRE_D2_DOCUMENTATION_SYNC = COMPLETE
D2 = READY / NOT STARTED
ACTIVE_WORK_PACKAGE = NONE
Current owner = User + ChatGPT
Live Kintone write auth = NONE
Lifecycle write auth = NONE
Deploy auth = NONE
D2 source-change auth = NONE
```

## D1 retained facts

```text
HYBRID_IDENTITY = DEDICATED_KINTONE_AUTO_BIND + SHARED_ACCOUNT_MBO_LOGIN
MBO_Kintone_User = LIVE / optional USER_SELECT
DEDICATED_MAPPINGS = 24 / PASS
SHARED_APPROVER_AUTHORITY = DENIED
APPROVAL_AUTHORITY = CURRENT NATIVE ASSIGNEE
OWN_MBO_SELF_APPROVER_ELISION = APPROVED
```

Accepted security ceilings:

```text
SHARED_DIRECT_URL_REST_HARD_ISOLATION = NOT GUARANTEED
DEDICATED_DIRECT_REST_CREATE_FIELD_INTEGRITY = LIMITED BY NATIVE APP794 ADD PERMISSION
```

## Employee lifecycle pointer

For resignation/inactive, transfer, Department/Section/Team change, promotion/Position change, Kintone-principal change, or manager/appraiser lifecycle changes, read `CONFIRMED_BASELINE/EMPLOYEE_LIFECYCLE_CHANGE_POLICY.md`.

Key compatibility rule:

```text
Employee_Code = stable person identity
App53/App795 change != automatic retroactive App794 rewrite
existing-task approval authority = current native Assignee
mid-cycle reassignment = explicit HR-controlled operation + audit
```

D4 owns lifecycle operations; D5 must use fresh current identity/routing without stale workflow snapshots; D6 must include lifecycle/security regression.

## D2 next-step pointer

D2 has not started. When Owner starts it, read `EXCEL_EXPORT.md` and perform read-only export/source/sample discovery before creating any implementation Work Package.

## Required receiving-AI order

1. fresh-fetch branch HEAD;
2. read `CHAT_HANDOFF.md`;
3. read `AI_CONTROL_CENTER.md`;
4. read `AI_ACTIVE_TASK.md`;
5. read `AI_DOCUMENT_INDEX.md` and only relevant Confirmed Baselines;
6. if lifecycle work is involved, read `CONFIRMED_BASELINE/EMPLOYEE_LIFECYCLE_CHANGE_POLICY.md`;
7. if D2 has been started by Owner, read `EXCEL_EXPORT.md` before export work.

Use `NEW_CHAT_BOOTSTRAP_PROMPT.md` to start a fresh ChatGPT conversation.
