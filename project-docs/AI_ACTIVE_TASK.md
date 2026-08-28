# AI ACTIVE TASK — D1 APP801 CREATE-ONLY CREDENTIAL PROVISIONING

> Read `project-docs/AI_CONTROL_CENTER.md` FIRST.  
> Execution Plane: Antigravity  
> Branch: `ai/antigravity-wp002c`  
> Mode: **ONE NARROW PRODUCTION WRITE PACKET ONLY**

## 0. Exact User Authorization

User explicitly approved on 2026-08-28:

```text
APP801_CREDENTIAL_BULK_PROVISIONING = APPROVED
TARGET_POPULATION = 128 accepted active unique App53 Employee_Code candidates
```

This approval does NOT authorize:
- App794 customization deploy;
- App53/795/796 write;
- group/ACL change;
- source-code change;
- D2-D7 work;
- credential reset/overwrite of existing App801 rows;
- population expansion beyond the accepted 128 candidates.

## 1. Read Only These Project Inputs

1. `project-docs/AI_CONTROL_CENTER.md`
2. this `project-docs/AI_ACTIVE_TASK.md`
3. `project-docs/CONFIRMED_BASELINE/D1_AUTH_SECURITY.md`
4. `project-docs/CONFIRMED_BASELINE/EMPLOYEE_MASTER_ROUTING.md`
5. existing `project-docs/D1_ACCESS_GROUP_SETUP_EVIDENCE.md` only for app/schema/evidence continuity

Do not scan the repository or historical docs.
Do not create a planning package.

## 2. Mandatory Pre-Write App53 Freshness Gate

Read App53 minimally using only:
- `emp_text` (Employee ID / Employee_Code)
- `Number_0` (employee Active/Inactive source)
- record identity only if needed to prove duplicates

Confirmed semantics:

```text
Number_0 = 1 -> Active/current
Number_0 = 0 -> Inactive/former
Number_0 blank -> unknown / fail closed
```

Regenerate the target set in memory using exactly:

```text
Number_0 = 1
+ emp_text non-blank
+ emp_text unique across active rows
```

Must prove before any App801 write:

```text
APP53_ACTIVE_ROWS = 204
APP53_ACTIVE_BLANK_EMPLOYEE_CODE_ROWS = 76
APP53_DUPLICATE_ACTIVE_CODES = NONE
APP53_ELIGIBLE_CREDENTIAL_CANDIDATES = 128
```

Special expectations:

```text
50.03  = eligible
50.02  = eligible
0050_2 = eligible
0118   = eligible
0119   = absent
0284   = excluded because Number_0 blank
9000   = inactive duplicate only / not in target
```

If the live result differs materially from the accepted 128-person target:

```text
PROVISIONING_RESULT = BLOCKED_APP53_DRIFT
APP801_CREDENTIAL_WRITES_EXECUTED = 0
```

STOP. Do not reinterpret or expand the approved population.

Do not commit the full 128-code list or personal data to Git.

## 3. Mandatory Pre-Write App801 Reconciliation

Read live App801 schema and existing credential identities before any create.

Minimum existing-record read:
- `Employee_Code`
- non-secret metadata only as needed for reconciliation

Do NOT intentionally retrieve/render/log raw `Password_Hash` values.

For the accepted 128 target codes, determine:

```text
APP801_EXISTING_TARGET_ROWS = <count>
APP801_EXISTING_UNIQUE_TARGET_CODES = <count>
APP801_MISSING_TARGET_CODES = <count>
APP801_DUPLICATE_TARGET_CODES = <code:row_count only or NONE>
```

Rules:
- if any target Employee_Code has 2+ App801 rows -> STOP before any write;
- an existing unique App801 credential row is preserved exactly;
- NO password reset;
- NO hash replacement;
- NO account-status modification;
- NO Force_Password_Change modification on existing rows;
- create only missing target rows.

If duplicate target credentials exist:

```text
PROVISIONING_RESULT = BLOCKED_APP801_DUPLICATE
APP801_CREDENTIAL_WRITES_EXECUTED = 0
```

STOP.

## 4. Confirm Creation Schema Before Write

Before creating missing rows, verify these App801 fields exist and are writable by the authorized execution path:

```text
Employee_Code
Password_Hash
Password_Algorithm
Force_Password_Change
Account_Status
Failed_Attempts
Locked_Until
Credential_Version
```

Additional MFA/audit fields may exist but are not part of this write unless required by live schema/default behavior.

Creation rules are confirmed for:

```text
Employee_Code = exact Employee_Code string
initial password = exact Employee_Code string
PBKDF2-SHA256
iterations = 100000
stored format = pbkdf2$100000$<saltHex>$<hashHex>
Force_Password_Change = YES
Failed_Attempts = 0
Locked_Until = blank
```

For `Password_Algorithm`, `Account_Status`, `Credential_Version`, or any other required non-secret field:
- use only a value proven by the live App801 schema and the confirmed current implementation convention;
- do NOT invent a dropdown/status/version value;
- if the exact required value cannot be proven, STOP before any write and report the unresolved field.

Use a unique cryptographically random salt for every newly created credential.
Hash generation may be ephemeral; do not commit a provisioning script unless explicitly required by the task (it is not required here).

## 5. Create Missing Credentials Only

Create only `APP801_MISSING_TARGET_CODES`.

Safety:
- prefer batches <= 100 records;
- create-only; no PUT/update of existing credential records;
- never persist/log/print plaintext passwords;
- never commit raw hashes, salts, API tokens, cookies, auth headers, or full credential payloads;
- no App53 write;
- no App794 deploy;
- no ACL change.

If any batch fails:
- STOP immediately;
- do not retry blindly;
- read back what was actually created;
- report partial-write count and exact sanitized HTTP/error evidence;
- do not delete or overwrite successfully created credentials without a new Control Plane decision.

## 6. Mandatory Post-Write Read-Back

After creation, live-read App801 by Employee_Code/non-secret metadata and prove:

```text
APP801_TARGET_UNIQUE_CREDENTIAL_CODES_AFTER = 128
APP801_TARGET_DUPLICATE_CODES_AFTER = NONE
APP801_MISSING_TARGET_CODES_AFTER = 0
```

Also prove:

```text
0118 credential present = YES
0171 credential present = YES
0119 credential present from this task = NO
0284 credential present from this task = NO
```

Do not expose hashes/plain passwords during verification.

## 7. Mandatory Counters

Report exactly:

```text
APP53_WRITES_EXECUTED = 0
APP801_EXISTING_ROWS_UPDATED = 0
APP801_CREDENTIAL_ROWS_CREATED = <count>
APP801_CREDENTIAL_WRITES_EXECUTED = <count of create operations/batches or clearly defined counter>
APP794_DEPLOY_EXECUTED = 0
APP794_WRITES_EXECUTED = 0
GROUP_ACL_WRITES_EXECUTED = 0
D2_D7_WRITES_EXECUTED = 0
```

## 8. Evidence / Delivery

Update the existing evidence file only:

`project-docs/D1_ACCESS_GROUP_SETUP_EVIDENCE.md`

Append one concise section:

```text
## 10. App801 Credential Provisioning — 128 Candidate Gate
```

Evidence must contain only:
- accepted/live App53 counts;
- App801 existing/missing/created counts;
- duplicate-code summary only;
- batch/result status;
- special-code presence results;
- post-write counts;
- mandatory counters;
- sanitized blocker/error details if any.

Forbidden in Git evidence:
- full employee list;
- employee names/personal data;
- plaintext password;
- Password_Hash;
- salt;
- API token/cookie/auth header;
- raw credential payloads.

Prefer one evidence commit + one push.
Final executor report <= 15 concise lines.

Maximum executor status:

```text
IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

STOP after push or on the first real blocker.
Do NOT deploy App794 and do NOT start UAT.
ChatGPT performs the next independent review.
