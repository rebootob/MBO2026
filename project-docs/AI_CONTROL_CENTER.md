# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.  
> Repository: `rebootob/MBO2026`  
> Branch: `ai/antigravity-wp002c`  
> Control Plane: ChatGPT  
> Execution Plane: Antigravity only when actual execution is required  
> Updated: 2026-08-28

## 1. Read Routing

Before opening other project documents, use:
`project-docs/AI_DOCUMENT_INDEX.md`

Permanent governance:
`project-docs/CONFIRMED_BASELINE/AI_OPERATING_GOVERNANCE.md`

Lean document policy:
`project-docs/CONFIRMED_BASELINE/DOCUMENT_CONTROL.md`

Do not browse/read historical project docs by default.

## 2. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|---|
| D1 | Login + Password Change + Employee-Self MBO Gate | 🟠 SOURCE PASS / GROUP+APP801 ACL PASS / CANDIDATE PASS=128 / APP801 PROVISIONING PASS / APP794 D1 DEPLOY APPROVED + EXECUTION NEXT |
| D2 | Excel + PDF legacy-format export | 🟠 IN PROGRESS |
| D3 | 8 legacy PMS apps -> App794 | 🟠 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | App800 HR Control Center end-to-end | 🟠 IN PROGRESS |
| D5 | Copy own previous MBO only | 🔴 MUST FIX |
| D6 | Integrated E2E / Security / Regression | 🔴 BLOCKED |
| D7 | Admin Support Center | ✅ PASS / CLOSED |

No AI may silently drop D1–D7.

## 3. Authorization Ledger

```text
D1_SOURCE_IMPLEMENTATION            = APPROVED / SOURCE ACCEPTED
D1_LIVE_CUTOVER                     = APPROVED
DEDICATED_MBO_ACCESS_GROUP_MODEL    = APPROVED
APP801_GROUP_ACL_MODEL              = APPROVED / LIVE RECONCILED
D1_CREDENTIAL_CANDIDATE_RULE        = ACCEPTED / BASELINED
D1_CANDIDATE_USER_EXPORT_AUDIT      = PASS / 128 ACCEPTED CANDIDATES
APP801_CREDENTIAL_BULK_PROVISIONING = PASS / INDEPENDENTLY LIVE VERIFIED 2026-08-28
APP794_D1_CUSTOMIZATION_DEPLOY      = APPROVED 2026-08-28 / EXACT D1 ACCEPTED ARTIFACT ONLY
D2-D7 LIVE WRITES                   = NOT AUTHORIZED unless separately recorded
```

Exact App794 deploy authorization scope:
- target app = App794 only;
- deploy the already accepted D1 desktop JS artifact only;
- accepted source commit = `63796999a321a24e1cbd29ceaad82b43980fe8ea`;
- target artifact = `dist/mbo-employee-app.js`;
- target Git blob SHA = `96ec6424e7b7f528e82117b566ac96accb0ffb16`;
- current branch artifact has the same Git blob SHA as the accepted source commit;
- no rebuild, no source edit, no feature change, no CSS change;
- preserve all current non-target customization entries exactly;
- backup the current live App794 customization before write and keep it rollback-ready;
- immediate deployed-file read-back/hash verification is required;
- this approval does NOT authorize App801 changes, App53/795/796 writes, D2-D7 writes, or UAT data mutation.

Do not repeatedly ask for this unchanged deploy approval.
A new approval is required only if target artifact/scope materially changes or rollback needs an unapproved destructive action.

## 4. D1 Accepted State

Accepted source commit:
`63796999a321a24e1cbd29ceaad82b43980fe8ea`

Accepted live group + App801 ACL evidence:
`b9d4fa830c4c0e3b827362e143639f9a307adbac`

Accepted credential candidate gate:
`PASS / 128 accepted candidates`

App801 provisioning:
`PASS / independently live verified`

App794 target artifact identity:

```text
PATH             = dist/mbo-employee-app.js
ACCEPTED_BLOB_SHA = 96ec6424e7b7f528e82117b566ac96accb0ffb16
CURRENT_BLOB_SHA  = 96ec6424e7b7f528e82117b566ac96accb0ffb16
ARTIFACT_DRIFT    = NONE
```

Manual final UAT:
`NOT STARTED`

## 5. Confirmed Candidate / Password Rules

App53 active source:

```text
Number_0 = 1 -> Active/current
Number_0 = 0 -> Inactive/former
Number_0 blank -> unknown / fail closed
```

Candidate:

```text
Number_0 = 1
+ non-blank emp_text
+ Employee_Code unique across active rows
```

Accepted candidate population = `128`.

Confirmed new-credential model:

```text
Username / Employee_Code = exact Employee_Code
initial password = exact Employee_Code
PBKDF2-SHA256
iterations = 100000
format = pbkdf2$100000$<saltHex>$<hashHex>
Force_Password_Change = YES
```

## 6. Independent Review — App801 Provisioning PASS

The user ran the ChatGPT-supplied READ-ONLY App801 Console verifier.

Accepted live result:

```text
TOTAL_RECORDS                   = 128
UNIQUE_EMPLOYEE_CODES           = 128
DUPLICATE_CODE_COUNT            = 0
HASH_FORMAT_OK                  = true
DEFAULT_PASSWORD_HASH_VERIFY_OK = true
UNIQUE_SALTS                    = true
PASSWORD_ALGORITHM_OK           = true
FORCE_PASSWORD_CHANGE_OK        = true
ACCOUNT_STATUS_OK               = true
FAILED_ATTEMPTS_OK              = true
LOCKED_UNTIL_BLANK_OK           = true
CREDENTIAL_VERSION_OK           = true
CODE_0118_PRESENT               = true
CODE_0171_PRESENT               = true
CODE_0119_ABSENT                = true
CODE_0284_ABSENT                = true
OVERALL_PASS                    = true
```

Decision:

```text
APP801_CREDENTIAL_PROVISIONING = PASS / ACCEPTED
LIVE_TARGET_CREDENTIAL_COUNT   = 128
LIVE_TARGET_DUPLICATES         = NONE
PASSWORD_MODEL_VERIFIED        = PASS
```

No provisioning retry is required or allowed under the consumed authorization.

## 7. App794 Deploy Safety Gate

Before changing App794 customization, Antigravity must:

1. live-read the current effective App794 customization and revision;
2. obtain rollback-ready copies of every currently attached FILE customization needed to restore the exact pre-write state;
3. verify App ID = 794 and verify the local deployment artifact Git blob SHA is exactly `96ec6424e7b7f528e82117b566ac96accb0ffb16`;
4. do not rebuild and do not modify source;
5. preserve current scope, mobile customization, desktop CSS, URL entries, and all non-target JS entries exactly;
6. require exactly one current desktop FILE target named `mbo-employee-app.js`; if missing or ambiguous, STOP before write;
7. replace only that one target desktop JS file with the accepted artifact;
8. apply/deploy the customization and wait for Kintone deployment completion;
9. live-read the effective customization after deployment;
10. download/read the newly deployed target file and verify its content hash equals the accepted local artifact;
11. verify all non-target customization entries remain unchanged;
12. if post-write verification mismatches, perform rollback to the backed-up exact pre-write customization when safe, verify rollback, and STOP;
13. evidence must be sanitized and contain metadata/hashes only, not full source or credentials.

Maximum executor status:
`IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`

## 8. Remaining D1 Gate

After App794 deploy execution:

1. ChatGPT independently reviews deployment diff/evidence;
2. if deployment is accepted, proceed to final manual D1 UI UAT;
3. UAT must cover login, forced password change, reload/re-entry, wrong-password/lockout, own-password change, logout, Employee-Self list isolation, create autoload, cross-employee detail/edit block, and no secret exposure;
4. D1 is not CLOSED until final UAT is independently accepted.

## 9. Exact Next Action

```text
NEXT_ACTION_OWNER = Antigravity
ANTIGRAVITY_REQUIRED = YES
DUPLICATE_WORK_RISK = NO
```

Execute exactly one narrow App794 D1 customization deploy packet according to `project-docs/AI_ACTIVE_TASK.md`, commit sanitized evidence, and STOP.

## 10. Active Task

Current executor instruction:
`project-docs/AI_ACTIVE_TASK.md`

Expected executor maximum status:
`IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`

## 11. Knowledge Maintenance

Baseline promotion this cycle:
`NONE — this is exact operational authorization, not a new durable architecture decision.`

Skill extraction:
`PENDING — evaluate after independent review of the actual App794 deploy.`
