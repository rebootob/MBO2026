# AI ACTIVE TASK — D1 MY APPROVAL TASKS — CURRENT NATIVE ASSIGNEE SOURCE INVENTORY R1

Mode: **CHATGPT CONTROL PLANE / GIT READ-ONLY INVENTORY — NO ANTIGRAVITY / NO SOURCE EDIT / NO LIVE KINTONE**  
Branch: `ai/antigravity-wp002c`

## 0. Goal

Hybrid Employee-Self Runtime source is ACCEPTED.

Next prove, from repository source only, the smallest authoritative runtime seam for:
```text
My Approval Tasks = App794 records whose CURRENT native Workflow assignee == current dedicated Kintone User
```

Do not implement yet. Do not ask Antigravity to scan. Do not access live Kintone.

## 1. Control Plane questions to answer

1. Which existing source module/event/API wrapper can read the current native Kintone Process/Workflow assignee for App794 records?
2. Is `$assignee` or another native system field already used anywhere in source/tests? If yes, identify exact canonical usage; if no, do not invent one.
3. Which existing record-list/detail seam can host “My Approval Tasks” without merging it into Employee-Self/My MBO authority?
4. At list time, how can records be filtered to only current assignments for the current dedicated Kintone principal?
5. At record-open/action time, where can current assignment be revalidated immediately before enabling/performing an approval action?
6. Confirm App795 static route membership is routing configuration only and never actionable authority.
7. Confirm SHARED principals do not obtain approver authority merely from their shared account/session.
8. Identify smallest exact source/test file list for a later implementation WP.

## 2. Mandatory read-only inspection targets

Inspect only as needed:
```text
src/main-mbo-app.js
src/services/** workflow/process/record-query related modules
src/ui/** home/menu/list/detail related modules
src/security/** authorization-related modules
src/config/** process/workflow constants if relevant
tests/** only files directly related to workflow/approval/current-assignee authorization
project-docs/CONFIRMED_BASELINE/D1_HYBRID_IDENTITY_ACCESS_DESIGN.md
project-docs/CONFIRMED_BASELINE/ROUTING_WORKFLOW.md
project-docs/CONFIRMED_BASELINE/SOURCE_CODE_ARCHITECTURE.md
```

No broad repository scan unless a targeted symbol/reference cannot be resolved another way.

## 3. Hard rules

```text
ANTIGRAVITY = DO NOT USE
SOURCE_EDIT = 0
TEST_EDIT = 0
TEST_RUN = 0
BUILD = 0
LIVE_GET = 0
LIVE_POST = 0
LIVE_PUT = 0
LIVE_DELETE = 0
APP53_SCHEMA_WRITE = 0
APP53_RECORD_WRITE = 0
APP53_BULK_WRITE = 0
ACL_WRITE = 0
GROUP_WRITE = 0
DEPLOY = 0
```

Do not infer approval authority from:
- App795 membership alone;
- Manager/GM snapshot fields alone;
- caller-supplied role strings;
- UI visibility;
- Employee-Self identity.

Approval authority must remain:
```text
current dedicated Kintone user
AND
current native Workflow assignment on that App794 record
```

## 4. Required output

ChatGPT must produce one exact inventory conclusion with:
- `CURRENT_ASSIGNEE_SOURCE_OWNER`
- `LIST_QUERY_SEAM`
- `OPEN_REVALIDATION_SEAM`
- `HOME_MENU_SEAM`
- `SHARED_APPROVER_AUTHORITY = DENIED`
- exact later implementation file whitelist
- exact focused-test file whitelist
- explicit unknowns/blockers, if any

If the repository does not prove a safe native-current-assignee seam, STOP with `BLOCKED_NEEDS_READ_ONLY_RUNTIME_PROOF`; do not invent an API/field and do not delegate implementation.

## 5. Finish

This is a ChatGPT-owned inventory. No executor commit is expected.

After inventory:
- update Control Center;
- either open one small implementation WP or mark BLOCKED pending read-only proof;
- keep App53 Production and all live Kintone operations untouched.
