# AI ACTIVE TASK — D1 SANDBOX REHEARSAL TOOLING GATE S-A R1

Mode: **ANTIGRAVITY SOURCE-ONLY SAFETY TOOLING / ONE NEW SCRIPT / ZERO KINTONE NETWORK EXECUTION**
Branch: `ai/antigravity-wp002c`
Opened after control HEAD: `fd4a1c5150bc67b205f65d194c9166928d9def01`
Updated: 2026-08-30

```text
TASK_STATE = OPEN / READY_FOR_SOURCE_ONLY_EXECUTION
CURRENT_OWNER = ANTIGRAVITY
NEXT_OWNER_AFTER_EXECUTION = CHATGPT INDEPENDENT SOURCE REVIEW
SANDBOX_AUTHORIZATION = RECEIVED
PRODUCTION_B2_AUTHORIZATION = HELD / UNCONSUMED
```

Fresh-fetch the branch first. If this Active Task has been replaced, STOP.

## 0. Goal

Prepare exactly one reviewable one-shot script for the already-authorized disposable sandbox rehearsal.

DO NOT execute the sandbox lifecycle in this gate.
DO NOT make any Kintone network call in this gate.

Create exactly:

```text
scripts/kintone/rehearse-app53-hybrid-sandbox.js
```

No other source/script/test/config file may change.

## 1. Local-only Production evidence input

Before coding, inspect ONLY the existing ignored local backup from accepted Gate B1:

```text
backups/d1-gateb-app53-preflight-r1/53/fields.json
```

Use it only to determine the exact Production field types/minimal safe form definitions needed to reproduce:

```text
Number_0
emp_text
```

Do not copy unrelated App53 schema into the script.
Do not copy employee records or PII.

If the backup file is missing or those two fields cannot be resolved safely:
- STOP;
- do not access App53 over the network;
- do not create the script from guesses.

## 2. Script safety contract

The new script must have ZERO Kintone side effects unless invoked with the exact explicit flag:

```text
--execute-sandbox-lifecycle
```

Without that flag it must exit before creating a Kintone connection or making a request.

Exact sandbox name:

```text
MBO2026 App53 Hybrid Identity Sandbox
```

Write-target requirements:
- the script MUST NOT accept a target app ID from CLI/env/input;
- create exactly one new app itself via `/k/v1/preview/app.json`;
- obtain `sandboxAppId` only from that app-creation response;
- all subsequent schema/record/deploy/readback operations must use exactly that process-local `sandboxAppId`;
- validate the returned ID is a positive integer;
- hard-deny known existing/protected IDs at minimum:
  `53, 283, 305, 307, 310, 640, 643, 715, 716, 794, 795, 796, 797, 798, 800, 801`;
- never modify/bypass `src/core/sandbox-write-guard.js`, `src/config/environment.js`, or any protection list;
- do not register this disposable app into `config/sandbox-apps.json` in Gate S-A.

## 3. Future lifecycle that the script must encode

The script must implement this sequence, but MUST NOT be run in S-A:

### S1 — create sandbox
Create exactly one preview app named:
`MBO2026 App53 Hybrid Identity Sandbox`

### S2 — minimal base schema + synthetic records
Add only minimal representative fields:
- `Number_0` with the locally confirmed Production type;
- `emp_text` with the locally confirmed Production type.

Deploy sandbox only.
Poll official GET deploy status until `SUCCESS`; fail on `FAIL`/`CANCEL`/timeout.

Create exactly 2 synthetic records:
- record A: active value equivalent to `Number_0 = 1`, `emp_text = SYNTH-001`;
- record B: active value equivalent to `Number_0 = 1`, blank `emp_text`.

No real Employee_Code/name/email/phone/address/attachment/PII.

### S3 — forward field rehearsal
Add to sandbox Preview only:

```text
Field Code = MBO_Kintone_User
Label      = MBO Kintone User
Type       = USER_SELECT
Required   = false
Entities   = []
```

Immediately GET Preview fields and require exact target-field match before deploy.
If mismatch, STOP before deploy.

Deploy sandbox only and wait for `SUCCESS`.
GET Live fields and records; prove:
- target field exists with exact contract;
- exactly the two synthetic records remain;
- their `Number_0` / `emp_text` values remain unchanged.

### S4 — rollback rehearsal
DELETE only field code `MBO_Kintone_User` from sandbox Preview.
Immediately GET Preview fields and require the field absent before rollback deploy.

Deploy sandbox only and wait for `SUCCESS`.
GET Live fields and records; prove:
- `MBO_Kintone_User` is absent;
- exactly the same two synthetic records remain;
- their `Number_0` / `emp_text` values remain unchanged.

Leave the sandbox app in this rolled-back baseline state for ChatGPT/user inspection.
Do not delete the sandbox app.

## 4. Allowed Kintone endpoint families in FUTURE execution only

The script may encode only these endpoint families and only for the created sandbox ID after app creation:

```text
POST   /k/v1/preview/app.json                         # exactly one app create
POST   /k/v1/preview/app/form/fields.json             # base schema / target add
GET    /k/v1/preview/app/form/fields.json             # preview verification
GET    /k/v1/app/form/fields.json                     # live verification
POST   /k/v1/preview/app/deploy.json                  # sandbox-only deploys
GET    /k/v1/preview/app/deploy.json                  # sandbox-only deploy status
POST   /k/v1/records.json                             # exactly two synthetic records
GET    /k/v1/records.json                             # sandbox record verification
DELETE /k/v1/preview/app/form/fields.json             # target field rollback only
```

No other Kintone endpoint family is allowed.

## 5. Fail-closed requirements

Future script execution must STOP immediately if any of these occurs:
- local App53 backup missing or base field types unresolved;
- app creation returns invalid/forbidden ID;
- any request would target an ID other than process-local `sandboxAppId`;
- deploy reports FAIL/CANCEL or exceeds bounded timeout;
- Preview target-field readback is not exact;
- Live target-field readback is not exact;
- synthetic record count is not exactly 2;
- synthetic baseline values change unexpectedly;
- rollback Preview still contains target field;
- rollback Live still contains target field.

No automatic Production operation or fallback is permitted.

## 6. Gate S-A explicit forbidden actions

```text
RUN THE NEW SCRIPT WITH EXECUTION FLAG = NO
ANY KINTONE NETWORK GET               = NO
ANY KINTONE NETWORK WRITE             = NO
APP53 ACCESS                           = NO
APP53 WRITE                            = NO
REAL EMPLOYEE DATA                     = NO
MODIFY src/**                          = NO
MODIFY tests/**                        = NO
MODIFY config/**                       = NO
MODIFY dist/**                         = NO
MODIFY other scripts/**                = NO
MODIFY project-docs/** BY EXECUTOR     = NO
MODIFY SAFETY GUARDS                   = NO
npm test                               = NO
build                                  = NO
```

## 7. Local verification only

Run exactly:

```text
node --check scripts/kintone/rehearse-app53-hybrid-sandbox.js
git diff --check
git status --short
```

Do NOT run the script itself.

If checks PASS and exactly the one allowed new script changed:
- commit + push exactly one focused tooling commit;
- STOP.

If anything else is required, STOP and return to ChatGPT. Do not expand scope.

## 8. Required response only

```text
LOCAL_BACKUP_FOUND = YES/NO
NUMBER_0_TYPE = ...
EMP_TEXT_TYPE = ...
SCRIPT_CREATED = YES/NO
NODE_CHECK = PASS/FAIL
GIT_DIFF_CHECK = PASS/FAIL
CHANGED_FILES = exact list
TOOLING_COMMIT = <sha> / NONE
KINTONE_NETWORK_OPERATIONS = 0
APP53_ACCESS = 0
APP53_WRITES = 0
SANDBOX_CREATED = NO
PRODUCTION_B2_EXECUTED = NO
```

Next owner = ChatGPT independent source review.
