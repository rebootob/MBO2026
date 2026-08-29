# AI ACTIVE TASK — D1 APP794 OBJECTIVE ATTACHMENT SCHEMA CORRECTIVE

Mode: **ANTIGRAVITY EXACT ONE-SHOT SCHEMA EXECUTION — NO CUSTOMIZATION DEPLOY / NO RECORD WRITE**
Branch: `ai/antigravity-wp002c`
Authorization ID: `APP794-D1-OBJECTIVE-ATTACHMENT-SCHEMA-20260829-01`

## Authorization

User explicitly authorized:

`อนุมัติ App794 เพิ่ม Objective_Attachment_1..10 เป็น FILE fields ตาม schema corrective plan`

This authorization is ACTIVE and ONE-SHOT.

Accepted starting state:

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
PRIOR_CUSTOMIZATION_DEPLOY_AUTH      = CONSUMED / CLOSED
```

## Exact Authorized Target

Create exactly these App794 optional FILE fields:

```text
Objective_Attachment_1  -> FILE -> label "Objective Attachment 1"
Objective_Attachment_2  -> FILE -> label "Objective Attachment 2"
Objective_Attachment_3  -> FILE -> label "Objective Attachment 3"
Objective_Attachment_4  -> FILE -> label "Objective Attachment 4"
Objective_Attachment_5  -> FILE -> label "Objective Attachment 5"
Objective_Attachment_6  -> FILE -> label "Objective Attachment 6"
Objective_Attachment_7  -> FILE -> label "Objective Attachment 7"
Objective_Attachment_8  -> FILE -> label "Objective Attachment 8"
Objective_Attachment_9  -> FILE -> label "Objective Attachment 9"
Objective_Attachment_10 -> FILE -> label "Objective Attachment 10"
```

All 10 fields are optional.

Repository alignment authorized:
- update only the Objective attachment family in `config/schema-spec.js` so slots 1..10 define `Objective_Attachment_n` using the existing FILE-field helper/pattern;
- do not modify MidYear/Final codes or semantics;
- no attachment source/service/UI lifecycle change is authorized.

## Mandatory Execution Sequence

### 1. Start / Concurrency Guard

1. Fetch latest canonical branch.
2. Expected authorization/control HEAD must include this Active Task.
3. Record `EXECUTION_START_HEAD`.
4. Read only current Control Center + this Active Task before execution.
5. Confirm authorization ID is ACTIVE/UNUSED.

### 2. Pre-Write GET / Backup

Before any Kintone write:
1. GET current App794 Live form fields.
2. GET current App794 Preview form fields.
3. GET current App794 Live form layout.
4. GET current App794 Preview form layout.
5. Capture exact pre-change snapshots/evidence locally.
6. Record Live/Preview revision/concurrency metadata returned by Kintone.

Fail closed and STOP before any write if:
- any `Objective_Attachment_1..10` already exists;
- any target code collides with another field/type;
- MidYear is not exactly 10/10 FILE;
- Final is not exactly 10/10 FILE;
- unexpected Live/Preview schema/layout drift exists;
- safe revision-guarded write cannot be performed;
- exact backup cannot be captured.

### 3. Repository Schema Alignment

Update only `config/schema-spec.js`:
- add `Objective_Attachment_${i}: file('Objective Attachment ${i}')` to each objective slot using the existing loop/pattern;
- preserve every unrelated field definition byte-for-byte where practical;
- no broad schema cleanup/refactor.

### 4. App794 Preview Schema Write

Using Kintone-native schema APIs and concurrency protection:
1. add exactly the 10 target FILE fields to App794 Preview;
2. no other field add/update/delete;
3. make only the minimum layout placement required for these newly added fields;
4. do not move, resize, rename, delete, or redesign unrelated fields/layout rows.

Immediately GET/readback Preview:

```text
Objective_Attachment_1..10 = 10/10 present, FILE
MidYear_Attachment_1..10   = 10/10 present, FILE
Final_Attachment_1..10     = 10/10 present, FILE
```

If Preview readback is not exact, execute only the authorized rollback boundary and STOP.

### 5. Apply App794 Schema Settings to Live

Only after exact Preview readback:
- apply/deploy the App794 **form/schema settings** to Live using Kintone-native app settings apply/deploy mechanism;
- this is NOT a JavaScript/CSS customization deployment;
- wait for Kintone deployment status to reach SUCCESS before continuing.

### 6. Live Readback

GET current Live App794 form fields/layout and prove:

```text
Objective_Attachment_1..10 = 10/10 present, FILE, optional
MidYear_Attachment_1..10   = 10/10 present, FILE, unchanged
Final_Attachment_1..10     = 10/10 present, FILE, unchanged
UNRELATED_SCHEMA_DRIFT     = NONE
UNRELATED_LAYOUT_DRIFT     = NONE except exact minimal new-field placement
```

No functional attachment UAT record write is authorized in this task. Stop before testing with a real file/record.

## Authorization Consumption

The one-shot authorization is consumed when the first App794 Preview/Live schema or layout write occurs.

If execution fails after that point:
- do not retry another forward schema write under the same authorization;
- only the exact rollback below remains permitted.

## Rollback Boundary

Before any write, exact pre-change form-field/layout snapshots are mandatory.

Rollback is authorized only if add/apply/readback fails **before any real Objective attachment has been persisted**:
- remove only newly added empty `Objective_Attachment_1..10` fields;
- restore exact pre-change layout snapshot;
- verify readback returns to the pre-change state;
- record rollback evidence and STOP.

Do not delete/rollback MidYear or Final fields.

No destructive rollback is permitted after real Objective attachment data exists without a new explicit user decision.

## Allowed Git Changes

Only:
1. `config/schema-spec.js`
2. `project-docs/D1_ATTACHMENT_PERSISTENCE_CORRECTIVE_EVIDENCE.md` — append schema corrective execution evidence

Do not modify Control Center, Active Task, Baseline, source JS, tests, scripts, dist, or other files. Control Plane will update governance docs after independent review.

## Required Evidence

Append a concise `App794 Objective Attachment Schema Corrective Execution` section to:
`project-docs/D1_ATTACHMENT_PERSISTENCE_CORRECTIVE_EVIDENCE.md`

Include at minimum:

```text
AUTHORIZATION_ID
EXECUTION_START_HEAD
AUTHORIZATION_CONSUMED = YES/NO
PRE_LIVE_FORM_REVISION
PRE_PREVIEW_FORM_REVISION
PRE_SCHEMA_BACKUP = CAPTURED
PRE_LAYOUT_BACKUP = CAPTURED
PRE_OBJECTIVE_FIELDS = 0/10
PRE_MIDYEAR_FIELDS = 10/10 FILE
PRE_FINAL_FIELDS = 10/10 FILE
CONFIG_SCHEMA_UPDATED = YES/NO
PREVIEW_ADD_FIELDS_RESULT
PREVIEW_LAYOUT_RESULT
PREVIEW_OBJECTIVE_READBACK = 10/10 FILE or exact failure
APP_SETTINGS_APPLY_RESULT
LIVE_DEPLOY_STATUS
POST_LIVE_FORM_REVISION
LIVE_OBJECTIVE_READBACK = 10/10 FILE or exact failure
LIVE_MIDYEAR_READBACK = 10/10 FILE
LIVE_FINAL_READBACK = 10/10 FILE
UNRELATED_SCHEMA_DRIFT = NONE / exact finding
UNRELATED_LAYOUT_DRIFT = NONE / exact finding
APP794_RECORD_WRITE = 0
APP794_CUSTOMIZATION_DEPLOY = NO
APP794_ACL_PROCESS_WRITE = 0
APP801_WRITE = 0
APP795_796_WRITE = 0
ROLLBACK_PERFORMED = YES/NO
ROLLBACK_RESULT = N/A / exact result
FINAL_COMMIT_SHA
```

Commit + push only authorized Git changes.
STOP for ChatGPT Independent Review.

Maximum executor status:

`SCHEMA_APPLIED_PENDING_INDEPENDENT_REVIEW`

Do not Self-PASS.

## Strict Boundary

```text
APP794 OBJECTIVE FILE FIELD ADD = YES — exact 10 fields only
APP794 MINIMAL LAYOUT WRITE      = YES — exact new fields only
APP794 FORM SETTINGS APPLY       = YES — exact corrective only
CONFIG SCHEMA ALIGNMENT          = YES — Objective_Attachment_1..10 only
APP794 CUSTOMIZATION JS/CSS      = NO
APP794 RECORD WRITE              = NO
APP794 ACL/PROCESS WRITE         = NO
MIDYEAR/FINAL FIELD CHANGE       = NO
APP801 WRITE                     = NO
APP795/796 WRITE                 = NO
ROUTING/SCORING/AUTH/RESET       = NO
D2-D7 EXECUTION                  = NO
EXTERNAL SERVICE/STORAGE         = NO
BROAD REFACTOR                   = NO
```
