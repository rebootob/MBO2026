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
| D1 | Login + Password Change + Employee-Self MBO Gate | 🟠 SOURCE PASS / GROUP+APP801 ACL PASS / CANDIDATE PASS=128 / APP801 PROVISIONING PASS / APP794 DEPLOY GATE NEXT |
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
APP794_D1_CUSTOMIZATION_DEPLOY      = DO NOT EXECUTE YET / EXACT DEPLOY AUTHORIZATION TO BE RESOLVED BEFORE WRITE
D2-D7 LIVE WRITES                   = NOT AUTHORIZED unless separately recorded
```

Provisioning authorization was exact and is now consumed/closed. It does not authorize any credential reset/overwrite, population expansion, App794 deploy, or D2-D7 write.

Do not repeatedly ask for an unchanged approval already proven by repository evidence. If exact App794 deploy authorization cannot be proven from current repository control records, require a fresh exact authorization before that production write.

## 4. D1 Accepted State

Accepted source commit:
`63796999a321a24e1cbd29ceaad82b43980fe8ea`

Accepted live group + App801 ACL evidence:
`b9d4fa830c4c0e3b827362e143639f9a307adbac`

Accepted credential candidate gate:
`PASS / 128 accepted candidates`

Executor provisioning evidence commit:
`7263013834a9f27d2486fa29767250dd90bef9ca`

Independent provisioning acceptance evidence:
`project-docs/D1_ACCESS_GROUP_SETUP_EVIDENCE.md`

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

The executor evidence alone was not accepted. The user subsequently ran the ChatGPT-supplied **READ-ONLY** App801 Console verifier and returned the summarized live result.

Independent live result:

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

Independent-review decision:

```text
APP801_CREDENTIAL_PROVISIONING = PASS / ACCEPTED
LIVE_TARGET_CREDENTIAL_COUNT   = 128
LIVE_TARGET_DUPLICATES         = NONE
PASSWORD_MODEL_VERIFIED        = PASS
```

No App801 provisioning retry is required or allowed under the consumed authorization.

## 7. Remaining D1 Gate

1. resolve exact authorization for App794 D1 customization deploy before any production customization write;
2. after authorized deploy, perform immediate live read-back/deployment verification;
3. independently review deployment evidence;
4. perform final manual D1 UI UAT covering login, forced password change, reload/re-entry, wrong-password lockout, own-password change, logout, Employee-Self isolation, create autoload, cross-employee block, and no secret exposure;
5. D1 is not CLOSED until final UAT is independently accepted.

## 8. Exact Next Action

```text
NEXT_ACTION_OWNER = User
ANTIGRAVITY_REQUIRED = NO
DUPLICATE_WORK_RISK = YES if provisioning is repeated
```

Next decision:
- confirm/record exact App794 D1 customization deploy authorization if the current repository cannot prove an existing exact approval;
- until then Antigravity remains stopped.

## 9. Active Task

Current executor state:
`project-docs/AI_ACTIVE_TASK.md`

Expected mode:
`HOLD / NO EXECUTION`

## 10. Knowledge Maintenance

Baseline promotion from this review:
`NONE — the live count/status is operational evidence; D1 architecture/password/candidate semantics are already baselined.`

Reusable Kintone skill extraction:
`PASS — updated skills/kintone/browser-webcrypto-pbkdf2.md with create-only reconciliation and independent read-only post-provision verification without exposing secret material.`
