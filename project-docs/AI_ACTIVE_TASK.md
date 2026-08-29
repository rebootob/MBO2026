# AI ACTIVE TASK — HOLD: D1 APP794 OBJECTIVE ATTACHMENT SCHEMA CORRECTIVE AWAITING USER AUTHORIZATION

Mode: **HOLD — ANTIGRAVITY DO NOTHING / NO SOURCE CHANGE / NO LIVE WRITE / NO DEPLOY**
Branch: `ai/antigravity-wp002c`

## Accepted State

Independent review accepted schema-audit evidence from commit:
`9c7bf0d8afdf0511b99a63c5ae88fefc597607b5`

```text
APP794_LIVE_CUSTOMIZATION_REVISION   = 47
LIVE_APP794_FORM_REVISION            = 47
PREVIEW_APP794_FORM_REVISION         = 47
OBJECTIVE_ATTACHMENT_FIELDS          = ABSENT 0/10
MIDYEAR_ATTACHMENT_FIELDS            = FILE 10/10
FINAL_ATTACHMENT_FIELDS              = FILE 10/10
LIVE_PREVIEW_SCHEMA_MATCH            = YES
REPO_SCHEMA_OBJECTIVE_DEFINED        = NO
PRIMARY_ROOT_CAUSE                   = SCHEMA_GAP / UI-SCHEMA MISMATCH
UAT_SAVE_WITH_NO_ATTACHMENT          = PASS
UAT_ONE_OBJECTIVE_FILE_PERSISTENCE   = FAIL
PRIOR_DEPLOY_AUTHORIZATION           = CONSUMED / CLOSED
```

The custom UI exposes Objective attachment controls but App794 has no native `Objective_Attachment_1..10` FILE fields to receive persisted files.

## Current Gate

```text
CURRENT_GATE        = D1 APP794 OBJECTIVE ATTACHMENT SCHEMA CORRECTIVE — AWAITING USER AUTHORIZATION
NEXT_ACTION_OWNER   = USER
ANTIGRAVITY         = DO NOTHING
SOURCE CHANGE       = NO
APP794 SCHEMA WRITE = NO
APP794 LAYOUT WRITE = NO
APP794 DEPLOY       = NO
APP794 RECORD WRITE = NO
```

Do not execute anything until a new exact user authorization is recorded by the Control Plane.

## Prepared Corrective Scope — NOT AUTHORIZED YET

Target App794 fields:

```text
Objective_Attachment_1  = FILE / optional
Objective_Attachment_2  = FILE / optional
Objective_Attachment_3  = FILE / optional
Objective_Attachment_4  = FILE / optional
Objective_Attachment_5  = FILE / optional
Objective_Attachment_6  = FILE / optional
Objective_Attachment_7  = FILE / optional
Objective_Attachment_8  = FILE / optional
Objective_Attachment_9  = FILE / optional
Objective_Attachment_10 = FILE / optional
```

Labels: `Objective Attachment 1` through `Objective Attachment 10`.

If later authorized, the corrective may include only:
1. re-fetch canonical HEAD and current Control Center/Active Task;
2. GET/read pre-change Live + Preview App794 form-field/layout state;
3. save exact pre-change schema/layout backup evidence;
4. update `config/schema-spec.js` so target schema defines the same Objective FILE family;
5. create the 10 optional Objective FILE fields in App794 Preview;
6. make only the minimal layout placement required for those fields, with no unrelated redesign;
7. apply/deploy App794 schema settings to Live;
8. GET/readback exact 10/10 FILE fields in Preview and Live;
9. record evidence and stop for independent review before functional UAT.

No customization JS deploy is part of this schema corrective unless a separate later review proves it is required.

## Data Impact

- Existing App794 records gain empty optional Objective FILE fields.
- No existing record values require migration.
- Mid-Year and Final attachment fields/values must remain untouched.
- Attachment remains optional.

## Test Plan After Schema Apply

After independent schema-write review PASS, user Live UAT must test:
- one Objective file Save + reload;
- multiple Objective files;
- remove one saved file + Save + reload;
- remove + add in same field;
- unrelated Objective attachment fields unchanged;
- Mid-Year attachment regression;
- Self/Final attachment regression;
- no `event.record['...'].type is invalid`;
- no silent post-save bind failure.

## Rollback Plan

Before any schema write, capture exact Live/Preview form-field + layout state.

If add/apply/readback fails **before any real Objective attachment is persisted**, rollback may:
- delete only the newly added empty `Objective_Attachment_1..10` fields;
- restore the exact pre-change layout snapshot.

After any real Objective attachment has been persisted, do NOT automatically delete these fields because deletion would destroy data. Any destructive rollback after that point requires a separate explicit user decision.

## Required User Authorization

Recommended exact phrase:

`อนุมัติ App794 เพิ่ม Objective_Attachment_1..10 เป็น FILE fields ตาม schema corrective plan`

Until that authorization exists, STOP.

## Strict Boundary

```text
SOURCE / REFACTOR CHANGE       = NO
APP794 CUSTOMIZATION DEPLOY    = NO
APP794 RECORD WRITE            = NO
APP794 SCHEMA/LAYOUT WRITE     = NO
APP794 ACL/PROCESS WRITE       = NO
APP801 WRITE                   = NO
APP795/796 WRITE               = NO
ROUTING/SCORING/AUTH/RESET     = NO
D2-D7 EXECUTION                = NO
EXTERNAL SERVICE               = NO
```
