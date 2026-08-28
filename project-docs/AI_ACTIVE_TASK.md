# AI ACTIVE TASK — D1 CORRECTIVE — GROUP MEMBERSHIP + ACL STATE RECONCILIATION

> Read `project-docs/AI_CONTROL_CENTER.md` FIRST.  
> Execution Plane: Antigravity  
> Branch: `ai/antigravity-wp002c`  
> Mode: **ONE NARROW LIVE CORRECTIVE PACKET ONLY**

## 0. Authorization / Scope

Existing authorization already covers this corrective work:

```text
D1_LIVE_CUTOVER                  = APPROVED
DEDICATED_MBO_ACCESS_GROUP_MODEL = APPROVED
APP801_GROUP_ACL_MODEL           = APPROVED
```

This task does NOT authorize:
- App801 credential provisioning;
- App794 customization deploy;
- App53/795/796 writes;
- source-code changes;
- D2-D7 work.

## 1. Read Only These Inputs

1. `project-docs/AI_CONTROL_CENTER.md`
2. this `project-docs/AI_ACTIVE_TASK.md`
3. existing local App801 ACL backup only if needed for exact recovery

Do not scan the repository or historical docs.

## 2. Mandatory Pre-Write Live Read-Back

Before any write:

1. READ group `MBO_EMPLOYEE_ACCESS` metadata.
2. READ all current members of `MBO_EMPLOYEE_ACCESS`.
3. READ current App801 APP ACL.
4. Re-verify these exact principals are valid/active if necessary:

```text
f1
f2
f3
tmh
e1
s1
g_request
t1
t2
```

Record sanitized current state only.

Required pre-write evidence:

```text
GROUP_EXISTS = YES|NO
GROUP_CURRENT_MEMBERS = <codes only>
REQUIRED_9_PRESENT_BEFORE = YES|NO
APP801_CURRENT_GROUP_ACL = <sanitized summary>
APP801_EVERYONE_DENIED = YES|NO
```

## 3. Correct Group Membership API Handling

For group membership reconciliation use the documented Cybozu User API shape:

```text
PUT /v1/group/users.json
```

Body shape:

```json
{
  "code": "MBO_EMPLOYEE_ACCESS",
  "users": ["..."]
}
```

Important:
- the write requires an authorized cybozu.com Common Administrator path;
- do not expose API token/cookie/auth header;
- read current members first;
- target membership must preserve any legitimate pre-existing unrelated members and include all required 9;
- do not assume `CB_IJ01 Invalid JSON string` means permission failure;
- on failure capture sanitized HTTP status + Cybozu error code/message + request shape description.

If the available credential/path is not authorized for this User API write:

```text
GROUP_MEMBERSHIP_RESULT = BLOCKED_PERMISSION
```

STOP. Do not change App801 ACL, do not provision credentials, do not deploy App794.

## 4. Membership Reconciliation — Only If Authorized

If the administrative path is authorized:

1. perform the minimum exact membership reconciliation;
2. immediately GET/read back group members;
3. prove all 9 required principals are present.

Required:

```text
GROUP_MEMBERSHIP_WRITE_EXECUTED = 0|1
REQUIRED_9_PRESENT_AFTER = YES|NO
GROUP_MEMBERSHIP_RESULT = PASS|BLOCKED
```

If `REQUIRED_9_PRESENT_AFTER != YES`:
STOP immediately. No ACL broadening and no credential/deploy work.

## 5. App801 ACL Verification / Reconciliation

Proceed only when `REQUIRED_9_PRESENT_AFTER = YES`.

Target Baseline for `MBO_EMPLOYEE_ACCESS`:

```text
View records   = YES
Edit records   = YES
Add records    = NO
Delete records = NO
Import         = NO
Export         = NO
App Admin      = NO
GROUP:everyone = DENIED
Record ACL     = NO NEW RULE
```

Rules:
- if current App801 ACL already exactly matches target: NO ACL WRITE;
- if it does not match: reconcile only to the confirmed Baseline target using existing D1 authorization;
- preserve creator/admin recovery access;
- immediately read back after any ACL write;
- never broaden `GROUP:everyone`;
- never add per-user ACL rows as a workaround.

Required:

```text
APP801_ACL_WRITE_EXECUTED = 0|1
APP801_GROUP_VIEW_EDIT = YES|NO
APP801_GROUP_EXTRA_PRIVILEGES = NO|YES
APP801_EVERYONE_DENIED_AFTER = YES|NO
APP801_RECORD_ACL_CHANGE_EXECUTED = 0
APP801_ACL_RESULT = PASS|BLOCKED
```

## 6. Strictly Forbidden

- NO App801 credential create/update/reset
- NO generated credential hashes committed to Git
- NO plaintext password persistence
- NO App794 customization upload/deploy
- NO App794 ACL change
- NO App53/795/796 write
- NO migration
- NO npm/broad test
- NO source refactor
- NO D2-D7 work
- NO manual-action assumption without proven API/permission evidence

Mandatory counters:

```text
APP801_CREDENTIAL_WRITES_EXECUTED = 0
APP794_DEPLOY_EXECUTED = 0
D2_D7_WRITES_EXECUTED = 0
```

## 7. Evidence / Delivery

Update the existing evidence file only:

`project-docs/D1_ACCESS_GROUP_SETUP_EVIDENCE.md`

Append a concise **Corrective Review Follow-up** section containing:
- sanitized pre-write state;
- exact membership result;
- sanitized failure HTTP/error details if any;
- final membership read-back;
- final App801 ACL read-back;
- mandatory counters.

Do not create a duplicate evidence document.

Prefer one commit + one push.
Final executor report <= 15 concise lines.

Maximum executor status:

```text
IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

STOP after push or on the first real blocker. ChatGPT performs the next independent review.
