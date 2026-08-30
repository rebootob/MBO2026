# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only for minimum necessary execution
> Updated: 2026-08-30 — SANDBOX AUTH RECEIVED / PRODUCTION B2 HELD / TOOLING-REVIEW GATE OPEN

## 1. D1 status

D1 Gate A source/test/build is accepted. Gate B1 App53 Production read-only preflight is PASS. Production App53 B2 remains intentionally paused and its earlier authorization remains unconsumed.

The user has now explicitly authorized creation of a disposable sandbox and rehearsal of the target field add + rollback using synthetic data only.

## 2. Critical Production protection

App53 (ID 53) remains a permanent protected Production app.

```text
APP53_PRODUCTION_WRITE = NO
PROTECTED_GUARD_CHANGE = NO
PROTECTED_GUARD_BYPASS = NO
PRODUCTION_B2_AUTHORIZATION = HELD / UNCONSUMED
```

Do not weaken `PROTECTED_APP_IDS` or any existing safety guard to enable sandbox work.

## 3. Sandbox authorization received

Authorized sandbox name:

```text
MBO2026 App53 Hybrid Identity Sandbox
```

Authorized purpose only:
- create one new disposable Kintone app;
- use synthetic data only;
- reproduce only the minimal App53 identity fields needed for the rehearsal;
- add `MBO_Kintone_User` in sandbox Preview;
- verify Preview before deploy;
- deploy sandbox and verify Live;
- delete the target field in sandbox Preview;
- deploy rollback and verify the field is absent while synthetic records remain intact.

No real employee record or PII may be copied.

## 4. Maximum-safety execution split

Sandbox work is split into two control gates.

### Gate S-A — tooling source review FIRST
Antigravity may create exactly one dedicated one-shot sandbox rehearsal script, but MUST NOT execute any Kintone network operation in this gate.

Purpose:
- make all target IDs/endpoints/sequence visible in Git;
- make accidental Production targeting impossible by construction;
- allow ChatGPT independent source review before any sandbox write occurs.

Expected script:
```text
scripts/kintone/rehearse-app53-hybrid-sandbox.js
```

The script must:
- have zero Kintone side effect unless an exact explicit execution flag is supplied;
- accept no external app ID for write targets;
- obtain the sandbox app ID only from its own one-time app-creation response;
- bind every later write/read to that process-local created app ID;
- hard-deny known Production/existing app IDs, including 53 and 794–801;
- never call App53 or another existing app;
- use exactly two synthetic records;
- leave the sandbox in rolled-back baseline state after a successful future execution;
- never delete/modify the Production safety guard.

### Gate S-B — reviewed-script sandbox execution
Only after ChatGPT reviews and accepts Gate S-A may Antigravity execute the reviewed script under the already-granted sandbox authorization.

Gate S-B is not open yet.

## 5. Sandbox lifecycle to be encoded

1. Local-only preflight: read the existing ignored App53 B1 backup only to confirm the exact field types needed for `Number_0` and `emp_text`. If backup evidence is missing, STOP before network.
2. Create exactly one app named `MBO2026 App53 Hybrid Identity Sandbox`.
3. Add only minimal representative `Number_0` + `emp_text` fields.
4. Deploy sandbox and wait for official deploy status `SUCCESS`.
5. Create exactly two synthetic records only.
6. Add `MBO_Kintone_User` as optional `USER_SELECT` in Preview.
7. Read Preview and require exact-match before deploy.
8. Deploy sandbox; wait for `SUCCESS`; verify Live field + both synthetic records.
9. Delete only `MBO_Kintone_User` in Preview.
10. Read Preview and require field absent before rollback deploy.
11. Deploy sandbox rollback; wait for `SUCCESS`.
12. Verify Live field absent and both synthetic records unchanged.
13. STOP for ChatGPT review.

## 6. Target field contract

```text
Field Code = MBO_Kintone_User
Label      = MBO Kintone User
Type       = USER_SELECT
Required   = false
Entities   = []
```

Synthetic data only. No names, emails, phones, addresses, attachments or Production Employee_Code values.

## 7. Explicit exclusions

```text
APP53 WRITE = NO
APP53 READ DURING TOOLING/EXECUTION = NO (use existing local B1 backup only)
APP53 RECORD COPY = NO
REAL EMPLOYEE DATA = NO
PROTECTED-GUARD CHANGE = NO
APP794/795/796/797/798/800/801 WRITE = NO
GROUP/ACL CHANGE = NO
APP794 DEPLOY = NO
PRODUCTION B2 EXECUTION = NO
```

## 8. Authorization ledger

```text
SANDBOX_CREATE_AND_REHEARSAL_AUTH = RECEIVED / ACTIVE FOR THIS SANDBOX ONLY
APP53_SCHEMA_WRITE_AUTH = HELD / NOT EXECUTABLE
APP53_RECORD_WRITE_AUTH = NONE
APP53_BULK_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = SANDBOX ONLY AFTER GATE S-A REVIEW
ACTIVE_ACL_WRITE_AUTH = NONE
ACTIVE_GROUP_WRITE_AUTH = NONE
PRODUCTION_ROLLBACK_AUTH = NONE
```

## 9. Current control state

```text
ACTIVE_TASK = D1 SANDBOX REHEARSAL TOOLING GATE S-A R1
CURRENT_OWNER = ANTIGRAVITY
NETWORK/KINTONE EXECUTION = FORBIDDEN IN S-A
NEXT_OWNER = CHATGPT INDEPENDENT SOURCE REVIEW
```
