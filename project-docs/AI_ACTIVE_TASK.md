# AI ACTIVE TASK — D1 APP802 RESUME TOOLING SOURCE GATE S-D1 R1

Mode: **ANTIGRAVITY SOURCE-ONLY SAFETY TOOLING / ONE NEW APP802-SPECIFIC SCRIPT / ZERO KINTONE NETWORK EXECUTION**
Branch: `ai/antigravity-wp002c`
Opened after accepted App802 recovery inspection.
Updated: 2026-08-30

```text
TASK_STATE = OPEN / READY_FOR_SOURCE_ONLY_EXECUTION
CURRENT_OWNER = ANTIGRAVITY
NEXT_OWNER_AFTER_EXECUTION = CHATGPT INDEPENDENT SOURCE REVIEW
TARGET_APP = 802 ONLY
APP802_RESUME_WRITE_AUTH = RECEIVED BUT HELD UNTIL SOURCE PASS
SECOND_SANDBOX_CREATE_AUTH = NONE
PRODUCTION_B2_AUTHORIZATION = HELD / UNCONSUMED
```

Fresh-fetch the branch first. If this Active Task has been replaced, STOP.

## 0. Goal

Create exactly one dedicated, reviewable App802 resume script for the already-authorized synthetic Forward + Rollback rehearsal.

DO NOT execute the App802 lifecycle in this gate.
DO NOT make any Kintone network call in this gate.

Create exactly:

```text
scripts/kintone/resume-app802-hybrid-sandbox.js
```

No other source/script/test/config file may change.

## 1. Fixed target / no external targeting

Hard-code:

```text
APP_ID = 802
EXPECTED_APP_NAME = MBO2026 App53 Hybrid Identity Sandbox
EXPECTED_BASELINE_REVISION = 3
```

The script MUST NOT accept a target App ID from CLI, ENV, config, stdin or other user input.

Exact future execution flag:

```text
--execute-app802-resume
```

Without this exact flag the script must exit before creating a Kintone connection or making any network request.

Do not create another app.
Do not call `/k/v1/preview/app.json`.

## 2. Future pre-write baseline gate

Before any future write, the script must fresh-GET App802 only and fail closed unless all are true:

```text
Live app name = MBO2026 App53 Hybrid Identity Sandbox
Preview app name = MBO2026 App53 Hybrid Identity Sandbox
Live revision = 3
Preview revision = 3
Deploy status = SUCCESS
Live Number_0 type = NUMBER
Preview Number_0 type = NUMBER
Live emp_text type = SINGLE_LINE_TEXT
Preview emp_text type = SINGLE_LINE_TEXT
Live MBO_Kintone_User = ABSENT
Preview MBO_Kintone_User = ABSENT
Live record count = 0
```

If any baseline item differs:
STOP before all writes.
Do not repair drift automatically.

Allowed baseline GETs must target App802 only.
GET requests with no body must preserve authentication headers and MUST NOT send `Content-Type: application/json`.

## 3. Future authorized lifecycle encoded in the script

### S-D2.1 — synthetic records
Create exactly two synthetic records in App802:

```text
Record A:
Number_0 = 1
emp_text = SYNTH-001

Record B:
Number_0 = 1
emp_text = blank
```

No real Employee_Code, name, email, phone, address, attachment or other PII.

Capture returned record IDs/revisions when available and use deterministic exact verification.

### S-D2.2 — forward field
Add to App802 Preview only:

```text
Field Code = MBO_Kintone_User
Label      = MBO Kintone User
Type       = USER_SELECT
Required   = false
Entities   = []
```

Use revision-aware schema mutation when supported.
Immediately GET Preview fields and fail closed unless exact target-field contract matches.

Do not deploy if Preview exact check fails.

### S-D2.3 — forward deploy + Live verification
Deploy App802 only and poll official deploy-status GET until `SUCCESS`.
Fail on `FAIL`, `CANCEL`, timeout or uncertain response.

After SUCCESS, GET Live fields + records and prove:
- exact target field exists;
- exactly the two synthetic records exist;
- Record A and B retain exact `Number_0` / `emp_text` values.

### S-D2.4 — target-field rollback
Delete ONLY field code:

```text
MBO_Kintone_User
```

from App802 Preview.
Use revision-aware mutation when supported.

Immediately GET Preview fields and require target field absent before rollback deploy.

Deploy App802 rollback only and poll until `SUCCESS`.

Final Live verification must prove:
- `MBO_Kintone_User` absent;
- exactly the two synthetic records remain;
- both records retain exact baseline synthetic values.

Leave App802 present with the two synthetic records after successful field rollback.
STOP for ChatGPT independent review.

## 4. Request/target safety requirements

Every network request encoded by this script must be statically bound to App802 except endpoint path itself where the App ID is supplied in a fixed request body/query.

The script must include an assertion function that rejects any target other than numeric `802`.

No externally supplied App ID.
No fallback to App53.
No second sandbox creation.
No other existing App access.

JSON body requests:
- `Content-Type: application/json` required.

GET with no body:
- authentication headers only;
- no JSON Content-Type.

## 5. Allowed Kintone endpoint families in FUTURE S-D2 execution only

Only App802 operations using these endpoint families may be encoded:

```text
GET    /k/v1/app/settings.json
GET    /k/v1/preview/app/settings.json
GET    /k/v1/app/form/fields.json
GET    /k/v1/preview/app/form/fields.json
GET    /k/v1/preview/app/deploy.json
GET    /k/v1/records.json
POST   /k/v1/records.json
POST   /k/v1/preview/app/form/fields.json
DELETE /k/v1/preview/app/form/fields.json
POST   /k/v1/preview/app/deploy.json
```

No app-create endpoint.
No ACL/group/customize/process/status mutation endpoint.

## 6. Fail-closed / uncertainty rule

Future execution must STOP immediately on:
- identity mismatch;
- revision mismatch;
- record count not zero at preflight;
- target field already present;
- unexpected base field type;
- deploy state not SUCCESS before write;
- any HTTP/Kintone error;
- uncertain POST/DELETE/deploy result;
- Preview/Live exact-contract mismatch;
- synthetic record count/value mismatch;
- any target App ID not exactly 802.

Do NOT auto-retry uncertain writes/deploys.
Do NOT broaden scope.

## 7. Gate S-D1 explicit forbidden actions

```text
RUN NEW SCRIPT WITH EXECUTION FLAG = NO
ANY KINTONE NETWORK GET = NO
ANY KINTONE NETWORK WRITE = NO
APP802 ACCESS = NO
APP802 WRITE = NO
APP802 DEPLOY = NO
APP802 DELETE APP = NO
CREATE SECOND SANDBOX = NO
APP53 ACCESS = NO
APP53 WRITE = NO
REAL EMPLOYEE DATA = NO
MODIFY existing scripts/** = NO
MODIFY src/** = NO
MODIFY tests/** = NO
MODIFY config/** = NO
MODIFY dist/** = NO
MODIFY project-docs/** BY EXECUTOR = NO
MODIFY SAFETY GUARDS = NO
npm test = NO
build = NO
PRODUCTION B2 EXECUTION = NO
```

## 8. Local verification only

Run exactly:

```text
node --check scripts/kintone/resume-app802-hybrid-sandbox.js
git diff --check
git status --short
```

Do NOT run the script itself.

If checks PASS and exactly the one allowed new script changed:
- commit + push exactly one focused tooling commit;
- STOP.

If anything else is required, STOP and return to ChatGPT.

## 9. Required response only

```text
SCRIPT_CREATED = YES/NO
TARGET_APP_HARDCODED_802 = YES/NO
EXTERNAL_APP_ID_INPUT = NONE / exact issue
EXECUTION_FLAG_GUARD = PASS/FAIL
PREWRITE_IDENTITY_REVISION_FIELD_RECORD_GATE = PASS/FAIL
NO_APP_CREATE_ENDPOINT = PASS/FAIL
GET_WITHOUT_CONTENT_TYPE = PASS/FAIL
JSON_BODY_CONTENT_TYPE = PASS/FAIL
TARGET_FIELD_EXACT_CONTRACT = PASS/FAIL
REVISION_AWARE_SCHEMA_MUTATION = PASS/FAIL
DEPLOY_STATUS_POLLING = PASS/FAIL
SYNTHETIC_EXACT_VERIFICATION = PASS/FAIL
ROLLBACK_EXACT_VERIFICATION = PASS/FAIL
NODE_CHECK = PASS/FAIL
GIT_DIFF_CHECK = PASS/FAIL
CHANGED_FILES = exact list
TOOLING_COMMIT = <sha> / NONE
KINTONE_NETWORK_OPERATIONS = 0
APP802_ACCESS = 0
APP53_ACCESS = 0
APP53_WRITES = 0
SECOND_SANDBOX_CREATED = NO
PRODUCTION_B2_EXECUTED = NO
```

Then STOP.

Next owner = ChatGPT independent source review.
