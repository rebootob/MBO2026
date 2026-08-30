# AI ACTIVE TASK — D1 SANDBOX REHEARSAL EXECUTION GATE S-B R1

Mode: **ANTIGRAVITY SANDBOX-ONLY KINTONE EXECUTION / REVIEWED SCRIPT / NO PRODUCTION APP ACCESS / NO SOURCE CHANGE**
Branch: `ai/antigravity-wp002c`
Reviewed tooling commit: `491358480cf642b3f2175b3cf0e1fd7246a96234`
Reviewed script blob: `838d021073916d2c05f2ce84a9242545c5ebd848`
Updated: 2026-08-30

```text
TASK_STATE = OPEN / READY_FOR_SANDBOX_EXECUTION
CURRENT_OWNER = ANTIGRAVITY
NEXT_OWNER_AFTER_EXECUTION = CHATGPT INDEPENDENT REVIEW
SANDBOX_AUTHORIZATION = ACTIVE / ONE DISPOSABLE SANDBOX LIFECYCLE
PRODUCTION_B2_AUTHORIZATION = HELD / UNCONSUMED
```

Fresh-fetch the branch first. If this Active Task has been replaced, STOP.

## 0. Goal

Execute only the already-reviewed sandbox rehearsal script to prove forward field addition and rollback mechanics on a new disposable Kintone app using synthetic data only.

Production App53 must not be accessed over the network and must not be written.

## 1. Exact reviewed artifact

Only executable script:
```text
scripts/kintone/rehearse-app53-hybrid-sandbox.js
```

Before any network execution run:
```text
git hash-object scripts/kintone/rehearse-app53-hybrid-sandbox.js
```

Required exact output:
```text
838d021073916d2c05f2ce84a9242545c5ebd848
```

If it differs: STOP. Do not execute.

Also run:
```text
git status --short
```

If any tracked source/script/test/config/dist file is dirty: STOP.

## 2. Dry safety check

Run without the execution flag:
```text
node --env-file-if-exists=.env.local scripts/kintone/rehearse-app53-hybrid-sandbox.js
```

Required behavior:
- exits successfully;
- reports dry-run/safety exit;
- creates no sandbox;
- makes zero Kintone network requests.

If not: STOP.

## 3. Exact sandbox execution

Only after Sections 1–2 PASS, run exactly:
```text
node --env-file-if-exists=.env.local scripts/kintone/rehearse-app53-hybrid-sandbox.js --execute-sandbox-lifecycle
```

The reviewed script must perform only:
1. create exactly one new app named `MBO2026 App53 Hybrid Identity Sandbox`;
2. create/deploy minimal synthetic `Number_0` + `emp_text` schema;
3. create exactly two synthetic records;
4. add `MBO_Kintone_User` as optional USER_SELECT with empty entities in Preview;
5. exact Preview readback before deploy;
6. sandbox-only deploy and Live readback;
7. verify exactly two synthetic records and exact `Number_0` / `emp_text` values;
8. delete only `MBO_Kintone_User` from sandbox Preview;
9. verify Preview field absent before rollback deploy;
10. sandbox-only rollback deploy;
11. final Live readback proving target field absent and the same synthetic baseline values intact;
12. leave sandbox app present in rolled-back baseline state;
13. STOP.

## 4. Explicitly forbidden

```text
APP53 NETWORK GET = NO
APP53 WRITE = NO
APP53 RECORD COPY = NO
REAL EMPLOYEE DATA = NO
EXISTING APP 794/795/796/797/798/800/801 ACCESS = NO
GROUP/ACL ACCESS OR WRITE = NO
APP794 DEPLOY = NO
PROTECTED-GUARD CHANGE = NO
MODIFY scripts/** = NO
MODIFY src/** = NO
MODIFY tests/** = NO
MODIFY config/** = NO
MODIFY dist/** = NO
MODIFY project-docs/** BY EXECUTOR = NO
GIT COMMIT = NO
npm test = NO
build = NO
PRODUCTION B2 EXECUTION = NO
```

Do not retry by changing code if execution fails. STOP and report the exact stage/error.

## 5. Post-execution repository check

Run:
```text
git status --short
```

Required: no tracked repository change caused by execution.
Do not commit anything.

## 6. Required response only

```text
SCRIPT_BLOB_MATCH = YES/NO
PRE_EXEC_GIT_STATUS = CLEAN / exact tracked changes
DRY_RUN_SAFETY_EXIT = PASS/FAIL
DRY_RUN_KINTONE_NETWORK_OPERATIONS = 0 / unknown
SANDBOX_EXECUTION = PASS/FAIL
SANDBOX_APP_ID = <new id> / NONE
SANDBOX_APP_NAME = MBO2026 App53 Hybrid Identity Sandbox / NONE
BASE_SCHEMA_DEPLOY = PASS/FAIL/NOT_RUN
SYNTHETIC_RECORDS_CREATED = 2 / 0
FORWARD_PREVIEW_EXACT_CHECK = PASS/FAIL/NOT_RUN
FORWARD_DEPLOY = PASS/FAIL/NOT_RUN
FORWARD_LIVE_EXACT_CHECK = PASS/FAIL/NOT_RUN
FORWARD_SYNTHETIC_DATA_CHECK = PASS/FAIL/NOT_RUN
ROLLBACK_PREVIEW_FIELD_ABSENT = PASS/FAIL/NOT_RUN
ROLLBACK_DEPLOY = PASS/FAIL/NOT_RUN
ROLLBACK_LIVE_FIELD_ABSENT = PASS/FAIL/NOT_RUN
ROLLBACK_SYNTHETIC_DATA_CHECK = PASS/FAIL/NOT_RUN
FINAL_SANDBOX_STATE = ROLLED_BACK_BASELINE / INCOMPLETE / NONE
POST_EXEC_GIT_STATUS = CLEAN / exact tracked changes
APP53_NETWORK_OPERATIONS = 0
APP53_WRITES = 0
REAL_EMPLOYEE_DATA_COPIED = NO
PRODUCTION_B2_EXECUTED = NO
FILES_COMMITTED = NONE
```

Next owner = ChatGPT independent review.
