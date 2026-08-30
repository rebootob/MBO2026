# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only for minimum necessary execution
> Updated: 2026-08-30 — D1 SANDBOX TOOLING S-A PASS / SANDBOX EXECUTION S-B OPEN

## 1. D1 status

D1 Gate A source/test/build is accepted. Gate B1 App53 Production read-only preflight is PASS. Production App53 B2 remains intentionally paused; the earlier Production authorization remains held/unconsumed.

The user separately authorized creation of one disposable sandbox and rehearsal of the target field add + rollback using synthetic data only.

## 2. Production protection

App53 (ID 53) remains protected.

```text
APP53_PRODUCTION_WRITE = NO
APP53_PRODUCTION_NETWORK_ACCESS_DURING_SANDBOX_REHEARSAL = NO
PROTECTED_GUARD_CHANGE = NO
PROTECTED_GUARD_BYPASS = NO
PRODUCTION_B2_AUTHORIZATION = HELD / UNCONSUMED
```

## 3. Gate S-A tooling — PASS

Initial tooling commit:
```text
b98aa18fb082cf5b52efa1c80cf4df0a7e115dc5
```

Corrective commit:
```text
491358480cf642b3f2175b3cf0e1fd7246a96234
```

Reviewed script:
```text
scripts/kintone/rehearse-app53-hybrid-sandbox.js
blob = 838d021073916d2c05f2ce84a9242545c5ebd848
```

Independent source decision:
```text
D1_SANDBOX_REHEARSAL_TOOLING_GATE_S_A = PASS
```

Accepted safety properties:
- exact `--execute-sandbox-lifecycle` flag required before `getKintoneConnection()`;
- no external target app ID accepted for lifecycle targeting;
- sandbox ID comes only from this process's new-app creation response;
- known protected/existing app IDs hard-denied, including App53 and Apps 794–801;
- later operations use only process-local `sandboxAppId`;
- target field exact contract = `MBO_Kintone_User` / `USER_SELECT` / `required=false` / `entities=[]`;
- Preview and Live target-field checks validate exact code/type/label/required/entities;
- record verification is deterministic and validates both `Number_0` and `emp_text`;
- rollback removes only the target field and leaves the sandbox present for inspection.

## 4. Gate S-B — reviewed-script sandbox execution

Gate S-B is now open under the user's already-granted sandbox-only authorization.

Exact target:
```text
NEW DISPOSABLE APP ONLY
Name = MBO2026 App53 Hybrid Identity Sandbox
Real employee data = NO
```

Pre-execution integrity gate:
```text
git hash-object scripts/kintone/rehearse-app53-hybrid-sandbox.js
```
must equal:
```text
838d021073916d2c05f2ce84a9242545c5ebd848
```

If not exact: STOP before Kintone network execution.

Execution lifecycle:
1. dry-run without execution flag; must exit safely;
2. execute exact reviewed script with `--execute-sandbox-lifecycle`;
3. create exactly one new sandbox;
4. deploy minimal `Number_0` + `emp_text` schema;
5. create exactly two synthetic records;
6. add `MBO_Kintone_User` in Preview and exact-readback;
7. deploy sandbox and verify Live + synthetic records;
8. delete only `MBO_Kintone_User` in Preview;
9. deploy sandbox rollback;
10. verify Live target field absent + both synthetic records unchanged;
11. leave sandbox in rolled-back baseline state;
12. STOP for ChatGPT review.

## 5. Explicit exclusions

```text
APP53 GET/WRITE = NO
APP53 RECORD COPY = NO
REAL EMPLOYEE DATA = NO
APP794/795/796/797/798/800/801 ACCESS/WRITE = NO
GROUP/ACL CHANGE = NO
APP794 DEPLOY = NO
SOURCE/TEST/CONFIG/DIST CHANGE = NO
PRODUCTION B2 EXECUTION = NO
```

## 6. Authorization ledger

```text
SANDBOX_CREATE_AND_REHEARSAL_AUTH = ACTIVE / ONE DISPOSABLE SANDBOX LIFECYCLE
APP53_SCHEMA_WRITE_AUTH = HELD / NOT EXECUTABLE
APP53_RECORD_WRITE_AUTH = NONE
APP53_BULK_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = SANDBOX ONLY
ACTIVE_ACL_WRITE_AUTH = NONE
ACTIVE_GROUP_WRITE_AUTH = NONE
PRODUCTION_ROLLBACK_AUTH = NONE
```

## 7. Current control state

```text
ACTIVE_TASK = D1 SANDBOX REHEARSAL EXECUTION GATE S-B R1
CURRENT_OWNER = ANTIGRAVITY
NEXT_OWNER = CHATGPT INDEPENDENT REVIEW
```
