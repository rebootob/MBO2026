# AI ACTIVE TASK — D1 SANDBOX TOOLING GET-HEADER CORRECTIVE R1

Mode: **ANTIGRAVITY SOURCE-ONLY CORRECTIVE / ONE SCRIPT ONLY / ZERO KINTONE NETWORK EXECUTION**
Branch: `ai/antigravity-wp002c`
Failed sandbox execution app: `802`
Reviewed tooling commit before failure: `491358480cf642b3f2175b3cf0e1fd7246a96234`
Updated: 2026-08-30

```text
TASK_STATE = OPEN / READY_FOR_NARROW_SOURCE_CORRECTIVE
CURRENT_OWNER = ANTIGRAVITY
NEXT_OWNER_AFTER_EXECUTION = CHATGPT INDEPENDENT SOURCE REVIEW
KINTONE_NETWORK_EXECUTION = FORBIDDEN
SECOND_SANDBOX_CREATE_AUTH = NONE
SANDBOX_802_RESUME_WRITE_AUTH = NONE
PRODUCTION_B2_AUTHORIZATION = HELD / UNCONSUMED
```

Fresh-fetch the branch first. If this Active Task has been replaced, STOP.

## 0. Accepted failure evidence

Gate S-B R1 failed safely after creating sandbox App 802.

```text
SANDBOX_APP_ID = 802
BASE_SCHEMA_DEPLOY = FAIL at deploy-status polling GET
HTTP = 400
KINTONE_CODE = CB_IL02
SYNTHETIC_RECORDS_CREATED = 0
APP53_NETWORK_OPERATIONS = 0
APP53_WRITES = 0
PRODUCTION_B2_EXECUTED = NO
POST_EXEC_GIT_STATUS = CLEAN
```

Do NOT access, delete, resume, repair, or otherwise modify App 802 in this source-only corrective.

## 1. Root cause / exact correction

Modify only:

```text
scripts/kintone/rehearse-app53-hybrid-sandbox.js
```

The helper currently forces `Content-Type: application/json` onto all requests, including GET requests with query-string parameters and no body.

Correct it so:

```text
GET with no body:
- authentication headers only
- NO Content-Type header

POST/DELETE with JSON body:
- Content-Type: application/json
```

Narrow acceptable pattern:
- start request headers from the authentication headers;
- add `Content-Type: application/json` only when a JSON request body is actually present.

Do not alter the deploy-status endpoint or its query syntax:

```text
/k/v1/preview/app/deploy.json?apps[0]=<sandboxAppId>
```

That query form is valid Kintone API syntax.

## 2. Preserve all accepted safety behavior

Do NOT change:
- exact execution flag requirement;
- sandbox name;
- forbidden app ID list;
- process-local sandboxAppId binding;
- endpoint families;
- exact target USER_SELECT contract;
- Preview/Live exact field verification;
- deterministic record verification;
- lifecycle order;
- rollback behavior;
- fail-closed behavior.

Do NOT add a resume flag or any ability to target App 802.
Do NOT add any externally supplied App ID.

## 3. Explicitly forbidden

```text
RUN SCRIPT WITH EXECUTION FLAG = NO
ANY KINTONE NETWORK GET = NO
ANY KINTONE NETWORK WRITE = NO
ACCESS APP 802 = NO
CREATE ANOTHER SANDBOX = NO
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

## 4. Local verification only

Run exactly:

```text
node --check scripts/kintone/rehearse-app53-hybrid-sandbox.js
git diff --check
git status --short
```

If anything besides the one allowed script changed: STOP.

If checks PASS:
- commit + push exactly one focused corrective commit;
- STOP.

## 5. Required response only

```text
GET_WITHOUT_CONTENT_TYPE = YES/NO
JSON_BODY_REQUESTS_KEEP_CONTENT_TYPE = YES/NO
DEPLOY_STATUS_QUERY_UNCHANGED = YES/NO
APP_TARGET_GUARDS_UNCHANGED = YES/NO
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

Next owner = ChatGPT independent source review.
