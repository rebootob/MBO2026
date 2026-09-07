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
| D1 | **BASE CLOSED / NARROWLY REOPENED BY PROVEN UAT REGRESSION** | Identity/Employee-Self entry boundary only; do not reopen unrelated D1 functions. |
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

## Accepted corrective chain

```text
D1-UAT-IDENTITY-ENTRY-CORRECTIVE-R1
HEAD = 8c3fda998fe8bd0b627d62a5beb10455bde8f725
RESULT = PARTIAL PASS

D1-UAT-IDENTITY-ENTRY-CORRECTIVE-R2
HEAD = 88ed6b7ea99ca9871190c2a913879b9e7638e3cb
RESULT = PASS / CLOSED

BUILD ARTIFACT
HEAD = d9efa5a0c418ad98ca8b70965b130a8b607e81b5

D1-UAT-SANDBOX-DEPLOY-TOOL-R1
HEAD = 03b531383e86c643a5258a2baf6fdbd15bc9099e
RESULT = PASS / CLOSED
CANONICAL_CSS_TARGET = mbo-employee.css
```

No accepted evidence yet proves this corrected candidate is live in App794.

## D2 durable engineering closure

D2 engineering remains unaffected by this D1 corrective.

```text
REQUIRED_XLSX_SCOPE = PASS / CLOSED
FOCUSED_EXPORT_SUITE = 16 PASS / 0 FAIL / 0 SKIP
FROZEN_5_FILE_XLSX_REGRESSION = 44 PASS / 0 FAIL / 0 SKIP
PDF XLSX-007 = OWNER-DEFERRED / NON-BLOCKING
```

Do not equate D2 engineering closure with Owner runtime UAT acceptance.

## Active execution authorization

Owner explicitly approved:
`อนุมัติ App794 Sandbox Deploy หลังแก้ CSS Target`

```text
ACTIVE_WORK_PACKAGE = D1-UAT-DEFECT-001-002-SANDBOX-DEPLOY-R2
AUTHORIZATION_ID = D1-UAT-DEFECT-001-002-SANDBOX-DEPLOY-20260908-02
TARGET_APP = 794 customization only
MAX_ATTEMPTS = 1
AUTO_RETRY = NO
AUTO_ROLLBACK = NO
ALLOWED_WRITES = candidate JS/CSS upload + App794 preview customization PUT + App794 deploy POST
RECORD_WRITES = NONE
SCHEMA_LAYOUT_ACL_PROCESS_WRITES = NONE
D2_CHANGE = NONE
D3 = HOLD
```

If a documentation-only synchronization commit advances canonical HEAD, Control Plane may rebase this already-approved deployment basis only after independently proving the new commit changes documentation only and preserves `src/`, `tests/`, `scripts/`, `config/`, and `dist/` exactly.

## Mandatory deployment acceptance

Before writes:
- exact fresh HEAD + clean worktree;
- focused tests 0 FAIL;
- deterministic committed artifact reproduction;
- GET-only App794 live/preview preflight;
- exact `mbo-employee-app.js` + `mbo-employee.css`;
- topology 1 JS / 1 CSS / mobile 0/0;
- exact current source/artifact release manifest.

After deploy:
- status SUCCESS;
- post live/preview readback;
- exact deployed JS/CSS Git-blob identity match;
- zero record/schema/ACL/process writes.

## Owner UAT gate after independent deployment review

1. Papatchaya personal Kintone -> auto-bind 0113 -> own MBO.
2. `tmh + 0113` -> deny.
3. `tmh + shared-only employee` -> allow via App801.
4. Current-FY existing MBO -> Open Current MBO, not Create New.

Only Owner runtime evidence can close these UAT defects.
