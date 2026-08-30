# AI ACTIVE TASK — D1 SANDBOX REHEARSAL TOOLING GATE S-A CORRECTIVE R1

Mode: **ANTIGRAVITY SOURCE-ONLY CORRECTIVE / ONE SCRIPT ONLY / ZERO KINTONE NETWORK EXECUTION**
Branch: `ai/antigravity-wp002c`
Reviewed implementation commit: `b98aa18fb082cf5b52efa1c80cf4df0a7e115dc5`
Updated: 2026-08-30

```text
TASK_STATE = OPEN / READY_FOR_NARROW_SOURCE_CORRECTIVE
CURRENT_OWNER = ANTIGRAVITY
NEXT_OWNER_AFTER_EXECUTION = CHATGPT INDEPENDENT SOURCE REVIEW
SANDBOX_AUTHORIZATION = RECEIVED BUT HELD UNTIL TOOLING PASS
PRODUCTION_B2_AUTHORIZATION = HELD / UNCONSUMED
```

Fresh-fetch the branch first. If this Active Task has been replaced, STOP.

## 0. Goal

Correct only the reviewed sandbox rehearsal script so it exactly matches the approved field contract and deterministic synthetic-data verification.

Modify only:

```text
scripts/kintone/rehearse-app53-hybrid-sandbox.js
```

Do NOT run the script.
Do NOT make any Kintone network request.

## 1. Correct exact USER_SELECT payload

For `MBO_Kintone_User`, encode exactly:

```text
Field Code = MBO_Kintone_User
Label      = MBO Kintone User
Type       = USER_SELECT
Required   = false
Entities   = []
```

Required change:
- remove `defaultValue: []` from the target field definition;
- use `entities: []`.

Do not change the field code/type/label/required semantics.

## 2. Correct Preview + Live field verification

Both the S3 Preview verification and S3 Live verification must fail closed unless the returned target field satisfies all of:

```text
code === 'MBO_Kintone_User'
type === 'USER_SELECT'
label === 'MBO Kintone User'
required === false
entities is an array with length 0
```

Do not weaken existing checks.

## 3. Correct synthetic record verification

Current record readback assumes implicit order and checks only `emp_text`.

Make verification deterministic and prove both baseline fields after forward deploy and after rollback deploy.

Acceptable narrow pattern:
- GET records using deterministic `$id asc` ordering; or
- use another exact deterministic method tied to the two records created by this script.

Required baseline:

```text
Record A:
Number_0 = '1'
emp_text = 'SYNTH-001'

Record B:
Number_0 = '1'
emp_text = ''
```

At both S3 and S4 readback require:
- exactly 2 records;
- deterministic Record A matches both values;
- deterministic Record B matches both values.

If any value mismatches, fail closed.

## 4. Preserve accepted safety design

Do NOT change:
- execution flag requirement;
- sandbox app name;
- process-local sandbox ID binding;
- forbidden app ID list;
- endpoint families;
- app creation count;
- synthetic record count;
- forward/rollback sequence;
- deploy polling model;
- final behavior that leaves the sandbox app present in rolled-back baseline state.

## 5. Explicitly forbidden

```text
RUN NEW SCRIPT WITH EXECUTION FLAG = NO
ANY KINTONE NETWORK GET = NO
ANY KINTONE NETWORK WRITE = NO
CREATE SANDBOX = NO
APP53 ACCESS = NO
APP53 WRITE = NO
MODIFY src/** = NO
MODIFY tests/** = NO
MODIFY config/** = NO
MODIFY dist/** = NO
MODIFY other scripts/** = NO
MODIFY project-docs/** BY EXECUTOR = NO
MODIFY SAFETY GUARDS = NO
npm test = NO
build = NO
```

## 6. Local verification only

Run exactly:

```text
node --check scripts/kintone/rehearse-app53-hybrid-sandbox.js
git diff --check
git status --short
```

If any check fails or any other tracked file changed:
STOP. Do not expand scope.

If all pass and only the allowed script changed:
- commit + push exactly one focused corrective commit;
- STOP.

## 7. Required response only

```text
TARGET_PAYLOAD_ENTITIES_EMPTY = YES/NO
TARGET_DEFAULT_VALUE_REMOVED = YES/NO
PREVIEW_EXACT_CONTRACT_CHECK = PASS/FAIL
LIVE_EXACT_CONTRACT_CHECK = PASS/FAIL
DETERMINISTIC_RECORD_ORDER = PASS/FAIL
FORWARD_NUMBER_0_AND_EMP_TEXT_CHECK = PASS/FAIL
ROLLBACK_NUMBER_0_AND_EMP_TEXT_CHECK = PASS/FAIL
NODE_CHECK = PASS/FAIL
GIT_DIFF_CHECK = PASS/FAIL
CHANGED_FILES = exact list
CORRECTIVE_COMMIT = <sha> / NONE
KINTONE_NETWORK_OPERATIONS = 0
APP53_ACCESS = 0
APP53_WRITES = 0
SANDBOX_CREATED = NO
PRODUCTION_B2_EXECUTED = NO
```

Next owner = ChatGPT independent source review.
