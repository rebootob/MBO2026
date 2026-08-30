# AI ACTIVE TASK — D1 APP802 RESUME TOOLING S-D1 CORRECTIVE R1

Mode: **ANTIGRAVITY SOURCE-ONLY CORRECTIVE / ONE SCRIPT ONLY / ZERO KINTONE NETWORK EXECUTION**
Branch: `ai/antigravity-wp002c`
Reviewed implementation commit: `0f6f50dea1290a744f5ba95c9757332d2e6806f1`
Target App for future execution: `802`
Updated: 2026-08-30

```text
TASK_STATE = OPEN / READY_FOR_NARROW_SOURCE_CORRECTIVE
CURRENT_OWNER = ANTIGRAVITY
NEXT_OWNER_AFTER_EXECUTION = CHATGPT INDEPENDENT SOURCE REVIEW
APP802_RESUME_WRITE_AUTH = RECEIVED BUT HELD
KINTONE_NETWORK_EXECUTION = FORBIDDEN
SECOND_SANDBOX_CREATE_AUTH = NONE
PRODUCTION_B2_AUTHORIZATION = HELD / UNCONSUMED
```

Fresh-fetch the branch first. If this Active Task has been replaced, STOP.

## 0. Goal

Correct only the reviewed App802 resume script so all write responses, revisions, and synthetic record identities are authoritative before Gate S-D2 may execute.

Modify only:

```text
scripts/kintone/resume-app802-hybrid-sandbox.js
```

Do NOT run the script.
Do NOT make any Kintone request.

## 1. Preserve accepted target and safety design

Do NOT change:
- `APP_ID = 802`;
- expected App name;
- expected baseline revision `3`;
- exact execution flag;
- no external target App ID;
- no app creation;
- pre-write identity/field/deploy/zero-record gate;
- exact `MBO_Kintone_User` contract;
- endpoint families;
- GET header rule;
- forward/rollback lifecycle;
- no Production fallback.

## 2. Correct Add Records response handling

The Add Records POST must require a parseable authoritative response.

Require exactly:

```text
ids.length = 2
revisions.length = 2
ids[0], ids[1] = positive numeric strings
revisions[0], revisions[1] = numeric strings
```

Preserve returned order:
- `ids[0]` = Record A (`SYNTH-001`)
- `ids[1]` = Record B (blank emp_text)

Store these IDs and use them in BOTH forward and rollback verification.

Later verification must require:
- exactly 2 total records;
- exact returned ID set only;
- Record A returned ID has `Number_0='1'` and `emp_text='SYNTH-001'`;
- Record B returned ID has `Number_0='1'` and `emp_text=''`.

Do not rely only on `$id asc` position.

If response JSON/ids/revisions are missing or malformed after HTTP success:
STOP as uncertain write result.
Do not retry.

## 3. Correct Add Field revision chain

Before Add Field, use the fresh Preview fields revision already obtained by the pre-write gate.

Require that revision to be a valid numeric revision and exactly match expected baseline `3` at this initial step.
Do NOT fall back to `EXPECTED_BASELINE_REVISION` when the field-read revision is absent or malformed.

For POST Add Form Fields:
- require parseable JSON response;
- require valid numeric `revision` response;
- GET Preview fields immediately;
- require exact target field contract;
- require Preview GET `revision` equals Add Field response `revision`;
- deploy exactly that verified revision.

If any mismatch: STOP before deploy.

## 4. Correct Delete Field revision chain

After forward deploy + Live verification and before DELETE:
- fresh GET App802 Preview fields;
- require `MBO_Kintone_User` still exists with exact contract;
- require a valid numeric current Preview revision.

DELETE only `MBO_Kintone_User` using that fresh Preview revision.

Require DELETE response:
- parseable JSON;
- valid numeric `revision`.

Then GET Preview fields immediately and require:
- target field absent;
- Preview GET `revision` equals DELETE response `revision`.

Rollback deploy exactly that verified post-delete revision.

Do not use a stale revision captured before the forward deploy.

## 5. Mutation response uncertainty rule

For these endpoints, successful HTTP without the documented expected JSON response is NOT enough:

```text
POST /k/v1/records.json
POST /k/v1/preview/app/form/fields.json
DELETE /k/v1/preview/app/form/fields.json
```

Missing/unparseable/malformed response must STOP as uncertain.

Exception:

```text
POST /k/v1/preview/app/deploy.json
```

Kintone documents no response body for deploy. HTTP success may proceed only to official deploy-status polling. Transport/HTTP uncertainty still STOPs; do not auto-retry.

## 6. Explicitly forbidden

```text
RUN --execute-app802-resume = NO
ANY KINTONE GET = NO
ANY KINTONE WRITE = NO
APP802 ACCESS = NO
APP802 WRITE = NO
APP802 DEPLOY = NO
APP53 ACCESS = NO
APP53 WRITE = NO
CREATE SECOND SANDBOX = NO
MODIFY any file except resume-app802-hybrid-sandbox.js = NO
MODIFY project-docs/** BY EXECUTOR = NO
MODIFY SAFETY GUARDS = NO
npm test = NO
build = NO
PRODUCTION B2 EXECUTION = NO
```

## 7. Local verification only

Run exactly:

```text
node --check scripts/kintone/resume-app802-hybrid-sandbox.js
git diff --check
git status --short
```

If any other tracked file changed: STOP.

If all checks PASS and only the allowed script changed:
- commit + push exactly one focused corrective commit;
- STOP.

## 8. Required response only

```text
ADD_RECORDS_RESPONSE_IDS_REVISIONS_REQUIRED = YES/NO
RETURNED_RECORD_IDS_USED_FOR_FORWARD_VERIFY = YES/NO
RETURNED_RECORD_IDS_USED_FOR_ROLLBACK_VERIFY = YES/NO
INITIAL_PREVIEW_FIELD_REVISION_EXACT_3 = PASS/FAIL
ADD_FIELD_RESPONSE_REVISION_REQUIRED = YES/NO
ADD_FIELD_PREVIEW_REVISION_MATCH_REQUIRED = YES/NO
FORWARD_DEPLOY_USES_VERIFIED_REVISION = YES/NO
DELETE_USES_FRESH_PREVIEW_REVISION = YES/NO
DELETE_RESPONSE_REVISION_REQUIRED = YES/NO
DELETE_PREVIEW_REVISION_MATCH_REQUIRED = YES/NO
ROLLBACK_DEPLOY_USES_VERIFIED_REVISION = YES/NO
MUTATION_UNPARSEABLE_RESPONSE_FAILS_CLOSED = YES/NO
DEPLOY_EMPTY_RESPONSE_ALLOWED_ONLY_WITH_STATUS_POLL = YES/NO
NODE_CHECK = PASS/FAIL
GIT_DIFF_CHECK = PASS/FAIL
CHANGED_FILES = exact list
CORRECTIVE_COMMIT = <sha> / NONE
KINTONE_NETWORK_OPERATIONS = 0
APP802_ACCESS = 0
APP53_ACCESS = 0
APP53_WRITES = 0
SECOND_SANDBOX_CREATED = NO
PRODUCTION_B2_EXECUTED = NO
```

Then STOP.

Next owner = ChatGPT independent source review.
