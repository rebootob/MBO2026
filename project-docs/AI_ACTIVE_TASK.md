# AI ACTIVE TASK — D1 GATE B1 APP53 MBO_Kintone_User SCHEMA READ-ONLY PREFLIGHT R1

Mode: **ANTIGRAVITY READ-ONLY PRODUCTION EVIDENCE COLLECTION — APP53 ONLY / NO WRITE / NO SOURCE CHANGE / NO DEPLOY**
Branch: `ai/antigravity-wp002c`
Opened after accepted D1 local build control HEAD: `8522bbece3ab494432ab71224bb176725fc35946`
Updated: 2026-08-30

```text
TASK_STATE = OPEN / READY_FOR_READ_ONLY_EXECUTION
CURRENT_OWNER = ANTIGRAVITY
NEXT_OWNER_AFTER_EXECUTION = CHATGPT INDEPENDENT REVIEW
```

Fresh-fetch the branch first. If another executor/control task has replaced this file, STOP and return control to ChatGPT.

## 0. Goal

Collect the minimum fresh Production App53 evidence and current local recovery material required before ChatGPT may even prepare/request an exact one-shot App53 schema-write authorization for adding:

```text
Field Code = MBO_Kintone_User
Label      = MBO Kintone User
Type       = USER_SELECT
```

This task is READ ONLY.
It does NOT authorize adding the field.
It does NOT authorize populating mappings.
It does NOT authorize correcting Natta `emp_text`.

## 1. Existing approved read-only tool

Use only the existing repository script:

```text
scripts/kintone/get-app-info.js
```

The script is explicitly GET-only and has no POST/PUT/DELETE/deploy operation.

Do NOT create or modify another script.

## 2. Exact execution

From repository root, run exactly:

```text
node --env-file-if-exists=.env.local scripts/kintone/get-app-info.js 53 --records=all --out=backups/d1-gateb-app53-preflight-r1
```

Why `backups/`:
- it is already ignored by `.gitignore`;
- the full App53 export remains local recovery material;
- employee Production data must not be committed to Git.

If the command fails:
- STOP;
- report the exact error;
- do not change scripts/source/config;
- do not try a write path.

## 3. Extract only required evidence

From the generated local export, return only the following concise facts.

### A. Export integrity

```text
APP53_APP_ID = 53
APP53_APP_NAME = ...
APP53_REVISION = ...
APP53_TOTAL_RECORDS = ...
APP53_EXPORTED_RECORDS = ...
APP53_EXPORT_COMPLETE = YES/NO
ENDPOINT_ERRORS = NONE / exact concise list
BACKUP_PATH = backups/d1-gateb-app53-preflight-r1
```

### B. Target schema evidence

Inspect `fields.json` and return:

```text
MBO_Kintone_User_EXISTS = YES/NO
MBO_Kintone_User_TYPE = USER_SELECT / <actual type> / N/A
MBO_Kintone_User_LABEL = ... / N/A
```

If the field unexpectedly exists, do not assume it is correct and do not change it. Return its exact type/label and STOP after completing the read-only evidence response.

### C. Known target record evidence

From the exported App53 records, identify exact Kintone record IDs `$id = 456` and `$id = 578` and return only:

```text
RECORD_456_FOUND = YES/NO
RECORD_456_Number_0 = ...
RECORD_456_emp_text = ...

RECORD_578_FOUND = YES/NO
RECORD_578_Number_0 = ...
RECORD_578_emp_text = <value or BLANK>
```

Do not return names, emails, addresses, phone numbers, or unrelated employee fields.

Do not infer or invent Natta Employee_Code from any other field.

## 4. Repository cleanliness

Run:

```text
git status --short
```

Required:
- no tracked repository file changed;
- the ignored `backups/` export must not be staged or committed.

Do NOT run `git add`.
Do NOT create a commit.

## 5. Explicitly forbidden

```text
APP53 POST/PUT/DELETE                 = NO
APP53 SCHEMA WRITE                    = NO
APP53 RECORD WRITE                    = NO
APP53 BULK WRITE                      = NO
CREATE MBO_Kintone_User               = NO
POPULATE MAPPING                      = NO
CORRECT NATTA emp_text                = NO
APP794 GET/WRITE                       = NO
APP795/796/800/801 ACCESS              = NO
GROUP GET/WRITE                        = NO
ACL GET/WRITE                          = NO
CUSTOMIZATION DEPLOY                   = NO
UAT                                    = NO
CONNECTION TEST                        = NO
MODIFY src/**                          = NO
MODIFY tests/**                        = NO
MODIFY scripts/**                      = NO
MODIFY project-docs/** BY EXECUTOR     = NO
MODIFY dist/**                         = NO
npm test / build                       = NO
GIT COMMIT                             = NO
```

No Production write authorization exists.

## 6. Stop rule

After the App53 read-only export and required evidence extraction, STOP immediately.

Do not continue to:
- field creation;
- mapping population;
- Natta correction;
- dedicated group creation;
- App794 ACL preparation/execution;
- deployment;
- UAT.

## 7. Required response only

```text
READ_ONLY_EXPORT = PASS/FAIL
APP53_APP_ID = 53
APP53_APP_NAME = ...
APP53_REVISION = ...
APP53_TOTAL_RECORDS = ...
APP53_EXPORTED_RECORDS = ...
APP53_EXPORT_COMPLETE = YES/NO
ENDPOINT_ERRORS = NONE / ...
BACKUP_PATH = backups/d1-gateb-app53-preflight-r1

MBO_Kintone_User_EXISTS = YES/NO
MBO_Kintone_User_TYPE = ...
MBO_Kintone_User_LABEL = ...

RECORD_456_FOUND = YES/NO
RECORD_456_Number_0 = ...
RECORD_456_emp_text = ...

RECORD_578_FOUND = YES/NO
RECORD_578_Number_0 = ...
RECORD_578_emp_text = ... / BLANK

GIT_STATUS_TRACKED_CHANGES = NONE / exact list
FILES_COMMITTED = NONE
APP53_WRITES = 0
OTHER_KINTONE_APP_ACCESS = 0
DEPLOY_RUN = NO
```

Next owner = ChatGPT independent review.
