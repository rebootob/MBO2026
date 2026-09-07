# 00 MASTER JOBLIST — MBO2026

Updated: 2026-09-08 ICT.

## Current stage scoreboard

```text
D1 = BASE PASS/CLOSED, NARROWLY REOPENED BY PROVEN OWNER-UAT REGRESSION
D2_ENGINEERING = PASS / CLOSED / DURABLE
D2_OWNER_UAT = IN PROGRESS / PAUSED
D3 = HOLD
D4 = IN PROGRESS / NOT ACTIVE
D5 = IN PROGRESS / NOT ACTIVE
D6 = UAT NOT CLOSED
D7 = SOURCE FUNCTIONALITY CLOSED / CUTOVER NOT AUTHORIZED
PRODUCTION_READY = NO
```

## Current priority — resolve D1 UAT defects before resuming Owner UAT

### D1-UAT-DEFECT-001 — CRITICAL
Shared Kintone principal must not enter Employee-Self for an employee with dedicated App53 `MBO_Kintone_User` mapping.

Owner-proven dedicated case:
```text
Employee 0113 / Ms.Papatchaya
App53 MBO_Kintone_User = Ms.Papatchaya

tmh + 0113 => DENY
Ms.Papatchaya native Kintone => auto-bind 0113 => ALLOW
```

Shared-only case remains required:
```text
tmh + employee with valid MBO_Kintone_User.value = [] + valid App801 credential => ALLOW
```

Missing/malformed/ambiguous identity mapping must fail closed.

### D1-UAT-DEFECT-002 — MATERIAL
Employee Self current-FY navigation:
```text
1 current-FY MBO => Open Current MBO
0 current-FY MBO => Create New MBO
>1 current-FY MBO => fail safe / no Create
```
Backend duplicate guard stays intact.

## Corrective / deploy preparation chain

```text
R1 = 8c3fda998fe8bd0b627d62a5beb10455bde8f725 / PARTIAL PASS
R2 = 88ed6b7ea99ca9871190c2a913879b9e7638e3cb / PASS
BUILD = d9efa5a0c418ad98ca8b70965b130a8b607e81b5
DEPLOY_TOOL_FIX = 03b531383e86c643a5258a2baf6fdbd15bc9099e / PASS
CSS_TARGET = mbo-employee.css
```

No accepted evidence yet proves the new candidate is live in App794.

## Active authorized work

Owner approved:
`อนุมัติ App794 Sandbox Deploy หลังแก้ CSS Target`

```text
ACTIVE_WORK_PACKAGE = D1-UAT-DEFECT-001-002-SANDBOX-DEPLOY-R2
AUTHORIZATION_ID = D1-UAT-DEFECT-001-002-SANDBOX-DEPLOY-20260908-02
TARGET = APP794 CUSTOMIZATION ONLY
MAX_ATTEMPTS = 1
AUTO_RETRY = NO
AUTO_ROLLBACK = NO
KINTONE_RECORD_WRITE = NONE
SCHEMA/ACL/PROCESS_WRITE = NONE
D2_CHANGE = NONE
D3 = HOLD
```

A docs-only successor commit may be used as the execution basis only after Control Plane verifies it changes documentation only and preserves source/tests/scripts/dist exactly.

## D2 durable closure

D2 engineering remains closed. Do not reopen without proven D2 regression.

```text
REQUIRED_XLSX_SCOPE = CLOSED
FOCUSED_EXPORT_SUITE = 16 PASS / 0 FAIL / 0 SKIP
FROZEN_5_FILE_XLSX_REGRESSION = 44 PASS / 0 FAIL / 0 SKIP
PDF XLSX-007 = OWNER-DEFERRED / NON-BLOCKING
```

Owner UAT is not equivalent to engineering closure and is still incomplete.

## Next sequence

1. Execute only the authorized App794 one-shot deploy contract.
2. ChatGPT independently reviews deployment evidence and exact deployed bytes.
3. Owner performs the 4 runtime UAT cases.
4. If defects pass, resume broader Owner UAT.
5. Keep D3 HOLD until Control Plane explicitly authorizes entry after UAT state is clear.
