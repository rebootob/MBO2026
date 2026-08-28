# AI ACTIVE TASK — D1 APP801 SESSION SCHEMA WRITE

> Read `project-docs/AI_CONTROL_CENTER.md` FIRST.  
> Execution Plane: Antigravity  
> Branch: `ai/antigravity-wp002c`  
> Mode: **ONE NARROW PRODUCTION SCHEMA-ONLY CHANGE — APP801 ONLY**

## 0. Authorization

User explicitly authorized:

```text
APP801_SESSION_SCHEMA_WRITE = APPROVED 2026-08-28
```

Exact authorized target fields only:

```text
Session_Token_Hash          SINGLE_LINE_TEXT
Session_Issued_At           DATETIME
Session_Expires_At          DATETIME
Session_Credential_Version  NUMBER
Session_Kintone_User        SINGLE_LINE_TEXT
```

Canonical architecture:

```text
project-docs/CONFIRMED_BASELINE/D1_SESSION_CONTINUITY.md
```

Accepted Session source/test package already exists. Do NOT change source/tests/dist in this task.

Maximum executor status:

```text
IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

## 1. Read Only These Inputs

1. `project-docs/AI_CONTROL_CENTER.md`
2. this `project-docs/AI_ACTIVE_TASK.md`
3. `project-docs/CONFIRMED_BASELINE/D1_SESSION_CONTINUITY.md`
4. `skills/kintone/safe-live-change.md`
5. `project-docs/D1_ACCESS_GROUP_SETUP_EVIDENCE.md` only to append the new evidence section

Do not scan repository/history broadly.
Do not read/modify `employee-part-a-ui.js`, `main-mbo-app.js`, Session source modules, tests, dist, or D2-D7 source.

## 2. Fresh Prewrite Discovery — READ ONLY

Read current App801 Live form/schema and current App801 Preview/Test form/schema immediately before any write.

Capture sanitized metadata only:
- app id = 801;
- live revision if returned;
- preview revision if returned;
- field-code -> field-type map for all fields;
- exact target-field presence/type in Live and Preview;
- a stable canonical hash/fingerprint of Live field definitions and Preview field definitions for evidence;
- no credential/password/hash record data.

### A. Pending Preview Drift Gate

Before write, compare Live vs Preview schema semantically.

Requirements:
- existing non-target field definitions must match between Live and Preview;
- target-field presence/type must also be understood exactly;
- if Preview contains unrelated pending schema changes, STOP before write;
- if Preview has a target field state not represented in Live from an earlier unpublished change, STOP before write rather than silently publishing it.

Required blocker result:

```text
SCHEMA_RESULT = BLOCKED_PENDING_PREVIEW_DRIFT
APP801_SCHEMA_WRITES_EXECUTED = 0
APP801_DEPLOY_EXECUTED = 0
APP801_RECORD_WRITES_EXECUTED = 0
```

Do not deploy unrelated pending Preview changes.

### B. Existing Target Conflict Gate

For each exact field code:

```text
Session_Token_Hash          -> SINGLE_LINE_TEXT
Session_Issued_At           -> DATETIME
Session_Expires_At          -> DATETIME
Session_Credential_Version  -> NUMBER
Session_Kintone_User        -> SINGLE_LINE_TEXT
```

Rules:
- correct field already present in both Live/Preview -> preserve, no write for that field;
- missing in both -> eligible for create-only add;
- same field code exists with wrong type -> BLOCK;
- duplicate/ambiguous field-code state -> BLOCK;
- do not rename/delete/recreate existing fields.

If all five are already present with correct types and Live/Preview are clean:

```text
SCHEMA_RESULT = ALREADY_PRESENT_NO_WRITE
APP801_SCHEMA_WRITES_EXECUTED = 0
APP801_DEPLOY_EXECUTED = 0
```

Then append evidence, commit/push evidence only, and STOP.

## 3. Rollback-Ready Backup Before Write

Before the first schema write, save rollback-ready local metadata sufficient to reconstruct the exact prewrite schema state:
- Live field definitions;
- Preview field definitions;
- revision values;
- canonical hashes/fingerprints.

Backup may stay local/temp and must not contain API tokens/cookies/auth headers.
Do not commit credentials or unrelated sensitive data.

This task does NOT authorize automatic destructive rollback/deletion.
If post-write verification fails, STOP with blocker evidence and await Control Plane instruction.

## 4. Exact Allowed Schema Change

Create only missing target fields in App801 Preview/Test schema.

Use the smallest Kintone schema-add operation supported by the current environment.
Do not use record APIs.
Do not modify existing field settings.
Do not modify layout, views, permissions, process management, notifications, or unrelated app settings.

Field requirements:

```text
Field Code: Session_Token_Hash
Type: SINGLE_LINE_TEXT
Required: NO
Unique: NO

Field Code: Session_Issued_At
Type: DATETIME
Required: NO

Field Code: Session_Expires_At
Type: DATETIME
Required: NO

Field Code: Session_Credential_Version
Type: NUMBER
Required: NO

Field Code: Session_Kintone_User
Type: SINGLE_LINE_TEXT
Required: NO
Unique: NO
```

Labels may be human-readable but must not alter the field codes above.
Do not place secrets/default values in fields.
All existing 128 credential records must remain untouched; newly added fields remain blank until future authorized runtime use.

Prefer one create call containing only the missing target fields when supported.

## 5. Immediate Preview Read-back

Immediately after the schema-add call:
- fresh-read App801 Preview/Test schema;
- prove each missing field now exists exactly once with the correct type;
- prove all pre-existing non-target fields remain semantically unchanged;
- prove no target field has a default/required value that would mutate credential records;
- capture preview revision after change.

If Preview read-back mismatches expected state:

```text
SCHEMA_RESULT = BLOCKED_PREVIEW_READBACK_MISMATCH
```

STOP. Do not deploy. Do not auto-delete fields.

## 6. Deploy/App Settings Apply

Only after all Preview verification passes:
- deploy/apply App801 Preview settings through the normal Kintone app-setting deployment path;
- target App801 only;
- poll/wait until Kintone reports deployment completion;
- HTTP request acceptance alone is not PASS.

If deployment reports failure:

```text
SCHEMA_RESULT = DEPLOYMENT_FAILED_PENDING_REVIEW
```

STOP. No retry. No automatic rollback.

## 7. Mandatory Live Postdeploy Verification

After Kintone reports deployment completion:
1. fresh-read App801 Live form/schema;
2. verify each exact target field exists exactly once with correct type;
3. verify all unrelated pre-existing field definitions remain unchanged from prewrite Live backup;
4. verify no field was renamed/deleted;
5. verify no record-write operation occurred;
6. verify no App794 deploy/source/test/ACL/process/view/layout changes occurred in this task.

Required success result:

```text
APP801_TARGET_FIELD_COUNT = 5
TARGET_FIELD_TYPES_MATCH = YES
NON_TARGET_SCHEMA_PRESERVED = YES
DEPLOYMENT_COMPLETED = YES
SCHEMA_RESULT = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

Do not self-PASS.

## 8. Mandatory Counters

Report exact counters:

```text
APP801_SCHEMA_READS_EXECUTED = <count>
APP801_SCHEMA_WRITES_EXECUTED = <count>
APP801_DEPLOY_EXECUTED = <count>
APP801_RECORD_WRITES_EXECUTED = 0
APP801_CREDENTIAL_RECORDS_UPDATED = 0
APP801_CREDENTIAL_RECORDS_CREATED = 0
APP801_CREDENTIAL_RECORDS_DELETED = 0
APP794_CUSTOMIZATION_WRITES_EXECUTED = 0
APP794_DEPLOY_EXECUTED = 0
APP53_795_796_WRITES_EXECUTED = 0
GROUP_ACL_WRITES_EXECUTED = 0
PROCESS_VIEW_LAYOUT_WRITES_EXECUTED = 0
SOURCE_FILES_CHANGED = 0
TEST_FILES_CHANGED = 0
DIST_FILES_CHANGED = 0
D2_D7_WRITES_EXECUTED = 0
```

Count schema-add API calls separately from app-deployment calls.

## 9. Evidence

Update only:

```text
project-docs/D1_ACCESS_GROUP_SETUP_EVIDENCE.md
```

Append:

```text
## 13. App801 Session Schema Write
```

Include sanitized evidence:
- explicit authorization scope;
- Live/Preview revisions before;
- Live/Preview canonical schema fingerprints before;
- pending-preview-drift gate result;
- five target field presence/type before;
- exact fields actually added;
- Preview read-back result/revision after add;
- deployment status;
- Live read-back result/revision after deploy;
- target field presence/type after;
- non-target preservation result;
- backup-ready status;
- mandatory counters;
- blocker details if any.

Do NOT commit:
- API token;
- cookies/auth headers;
- password/hash/credential record values;
- raw session tokens/token hashes;
- employee personal data;
- full production record exports.

Prefer one concise evidence commit + push.

## 10. Explicitly Forbidden

- NO App801 credential/session record writes;
- NO credential reset/overwrite;
- NO App794 customization upload/deploy;
- NO source/test/dist/CSS edits;
- NO Create-handler fix;
- NO App53/App795/App796 write;
- NO group/ACL change;
- NO process management/view/layout change;
- NO D2-D7 work;
- NO automatic retry after a failed schema write/deploy;
- NO automatic destructive rollback/delete;
- NO self-PASS;
- NO follow-on task creation.

## 11. Delivery

Commit/push sanitized evidence only, then STOP.

Return only:

```text
COMMIT_SHA
LIVE_REVISION_BEFORE
PREVIEW_REVISION_BEFORE
PENDING_PREVIEW_DRIFT_RESULT
TARGET_FIELDS_BEFORE
BACKUP_RESULT
FIELDS_ADDED
PREVIEW_READBACK_RESULT
DEPLOY_RESULT
LIVE_REVISION_AFTER
TARGET_FIELDS_AFTER
NON_TARGET_SCHEMA_PRESERVED
APP801_SCHEMA_WRITES_EXECUTED
APP801_DEPLOY_EXECUTED
APP801_RECORD_WRITES_EXECUTED = 0
APP794_DEPLOY_EXECUTED = 0
SOURCE_FILES_CHANGED = 0
STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

STOP. ChatGPT performs the next independent review before App794 session continuity deploy or Create-handler corrective is considered.
