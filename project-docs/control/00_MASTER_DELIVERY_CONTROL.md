# MBO2026 Master Delivery Control V2 — Current UAT Regression State

Updated: 2026-09-08 ICT

## Project metadata

- **PROJECT**: MBO2026
- **CANONICAL_BRANCH**: `ai/antigravity-wp002c`
- **CONTROL_MODEL**: MBO DELIVERY CONTROL V2
- **STATE_AUTHORITY**: fresh repository truth + accepted newer live evidence
- **PRODUCTION_READY**: **NO**

## Current stage status

| Stage | Status | Current control meaning |
|---|---|---|
| D1 | **BASE CLOSED / TECHNICAL DEFECT RESOLUTION DEPLOYED / OWNER UAT PENDING** | Identity/Employee-Self entry candidate deployed to App794 (rev 69); Owner runtime retest pending. |
| D2 | **ENGINEERING PASS / CLOSED / DURABLE** | Required XLSX engine remains closed; Owner UAT is separate and currently paused. |
| D3 | **HOLD** | No workflow implementation may start while current D1 UAT defect chain is unresolved. |
| D4 | **IN PROGRESS / NOT ACTIVE** | No active authorization. |
| D5 | **IN PROGRESS / NOT ACTIVE** | No active authorization. |
| D6 | **UAT NOT CLOSED** | Owner has started real runtime testing, but full business UAT is not complete. |
| D7 | **SOURCE FUNCTIONALITY CLOSED / CUTOVER NOT AUTHORIZED** | Production readiness remains NO. |

## Proven UAT defects

### D1-UAT-DEFECT-001 — CRITICAL / Identity & Access Boundary

Owner runtime UAT proved a Shared Kintone principal can reach Employee-Self for an employee who has a dedicated Kintone mapping. This violates the locked Hybrid Identity architecture.

Authoritative contract:
```text
DEDICATED:
personal Kintone user -> active App53 MBO_Kintone_User exact mapping -> canonical emp_text -> auto-bind

SHARED:
shared Kintone principal -> Employee ID + App801 password
allowed only when active App53 MBO_Kintone_User.value = []
```

Owner-proven employee:
```text
Employee 0113 / Ms.Papatchaya
App53 MBO_Kintone_User = Ms.Papatchaya
=> DEDICATED
=> tmh + 0113 MUST DENY
=> Ms.Papatchaya native Kintone MUST auto-bind 0113
```

Missing, malformed, duplicate, ambiguous, or unreadable App53 identity state must fail closed.

### D1-UAT-DEFECT-002 — MATERIAL / Employee-Self Entry Navigation

Current-FY entry behavior must be:
```text
1 existing current-FY MBO -> Open Current MBO
0 existing current-FY MBO -> Create New MBO
>1 existing current-FY MBO -> fail safe / no Create path
```

Backend duplicate creation guard remains defense-in-depth and must not be weakened.

## Accepted corrective, deploy & migration chain

```text
D1-UAT-IDENTITY-ENTRY-CORRECTIVE-R1
HEAD = 8c3fda998fe8bd0b627d62a5beb10455bde8f725
RESULT = PARTIAL PASS

D1-UAT-IDENTITY-ENTRY-CORRECTIVE-R2
HEAD = 88ed6b7ea99ca9871190c2a913879b9e7638e3cb
RESULT = PASS / CLOSED

BUILD ARTIFACT
HEAD = d9efa5a0c418ad98ca8b70965b130a8b607e81b5
JS Blob = 8958634b92b35f74b58a7a0b2abd09b8b5e93758
CSS Blob = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61

D1-UAT-SANDBOX-DEPLOY-TOOL-R1
HEAD = 03b531383e86c643a5258a2baf6fdbd15bc9099e
RESULT = PASS / CLOSED
CANONICAL_CSS_TARGET = mbo-employee.css

D1-UAT-DEFECT-001-002-SANDBOX-DEPLOY-R2
HEAD = cd74b01e6650bb04b5fbdba6c365dd9a1bf87236
RESULT = PASS / CLOSED (Live App794 deployed rev 67 -> 68 with exact candidate blob match)

D1-UAT-APP794-CSS-FILENAME-MIGRATION-R1
HEAD = 38f5ba111d6ebbfaa09a3415819a92f5a48a1f4d
RESULT = PASS / CLOSED (Live App794 migrated rev 68 -> 69, CSS target canonicalized, standard preflight PASS)
```

App794 is verified live at revision 69 with exact candidate JS/CSS blobs.

## D2 durable engineering closure

D2 engineering remains unaffected by this D1 corrective.

```text
REQUIRED_XLSX_SCOPE = PASS / CLOSED
FOCUSED_EXPORT_SUITE = 16 PASS / 0 FAIL / 0 SKIP
FROZEN_5_FILE_XLSX_REGRESSION = 44 PASS / 0 FAIL / 0 SKIP
PDF XLSX-007 = OWNER-DEFERRED / NON-BLOCKING
```

Do not equate D2 engineering closure with Owner runtime UAT acceptance.

## Active operational state & execution boundaries

Deployment and migration work packages are completed and closed. No pending Kintone writes or deployments are authorized.

```text
ACTIVE_WORK_PACKAGE = D1-UAT-OWNER-RUNTIME-UAT (READY / PENDING OWNER EXECUTION)
APP794_LIVE_REVISION = 69
APP794_LIVE_JS = mbo-employee-app.js
APP794_LIVE_CSS = mbo-employee.css
APP794_RECORD_WRITES = 0
APP53_APP801_WRITES = 0
SCHEMA_LAYOUT_ACL_PROCESS_WRITES = 0
D2_CHANGE = NONE
D3 = HOLD
```

## Owner UAT gate (Immediate Next Milestone)

1. Papatchaya personal Kintone -> auto-bind 0113 -> own MBO.
2. `tmh + 0113` -> deny.
3. `tmh + shared-only employee` -> allow via App801.
4. Current-FY existing MBO -> Open Current MBO, not Create New.

Only Owner runtime evidence can close these UAT defects.
D3 remains on HOLD until Owner UAT passes and Control Plane authorizes next stage.
