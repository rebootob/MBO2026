# AI ACTIVE TASK — D1 UAT IDENTITY/ENTRY SANDBOX DEPLOY PENDING

Mode: **CONTROL PLANE / D1 UAT CORRECTIVE / APP794 SANDBOX DEPLOY AUTHORIZED / D3 HOLD**
Branch: `ai/antigravity-wp002c`
Updated: 2026-09-08 ICT

## Current truth

```text
D1_BASE_ARCHITECTURE = CLOSED / DURABLE
D1_REOPEN_REASON = PROVEN_REGRESSION DURING OWNER UAT
D1-UAT-DEFECT-001 = IMPLEMENTED / SOURCE REVIEW PASS / PENDING DEPLOY + OWNER UAT
D1-UAT-DEFECT-002 = IMPLEMENTED / SOURCE REVIEW PASS / PENDING DEPLOY + OWNER UAT
D2_ENGINEERING = PASS / CLOSED / DURABLE
D2_OWNER_UAT = IN PROGRESS / PAUSED
D3 = HOLD
PRODUCTION_READY = NO
```

## Active defect summary

### D1-UAT-DEFECT-001 — CRITICAL Identity Boundary
Shared principal such as `tmh` must not enter Employee-Self for an employee who has a dedicated App53 `MBO_Kintone_User` mapping.

Owner-proven target:
```text
Employee = 0113 / Ms.Papatchaya
App53 MBO_Kintone_User = Ms.Papatchaya
=> DEDICATED

tmh + 0113 => DENY
Ms.Papatchaya native Kintone => auto-bind 0113 => ALLOW
```

Shared-only employee contract:
```text
active App53 exact row
+ MBO_Kintone_User.value = []
+ valid App801 Employee ID/password
=> ALLOW Shared mode
```

Only an explicit valid empty USER_SELECT array means Shared eligible. Missing/malformed/ambiguous mapping fails closed.

### D1-UAT-DEFECT-002 — MATERIAL Employee-Self Entry UX
```text
1 current-FY MBO -> Open Current MBO
0 current-FY MBO -> Create New MBO
>1 current-FY MBO -> fail safe / no Create path
```

Keep backend duplicate creation guard unchanged.

## Accepted corrective chain

```text
R1_HEAD = 8c3fda998fe8bd0b627d62a5beb10455bde8f725
R1 = PARTIAL PASS
R2_HEAD = 88ed6b7ea99ca9871190c2a913879b9e7638e3cb
R2 = PASS / CLOSED
BUILD_ARTIFACT_HEAD = d9efa5a0c418ad98ca8b70965b130a8b607e81b5
DEPLOY_TOOL_HEAD = 03b531383e86c643a5258a2baf6fdbd15bc9099e
DEPLOY_TOOL_CSS_TARGET = mbo-employee.css
```

## Active authorization

Owner authorization:
`อนุมัติ App794 Sandbox Deploy หลังแก้ CSS Target`

Authorization ID:
`D1-UAT-DEFECT-001-002-SANDBOX-DEPLOY-20260908-02`

```text
ACTIVE_WORK_PACKAGE = D1-UAT-DEFECT-001-002-SANDBOX-DEPLOY-R2
TARGET = App794 customization only
MAX_ATTEMPTS = 1
AUTO_RETRY = NO
AUTO_ROLLBACK = NO
RECORD_WRITE = NONE
SCHEMA_WRITE = NONE
ACL_WRITE = NONE
PROCESS_WRITE = NONE
D2_CHANGE = NONE
D3 = HOLD
```

This documentation sync is allowed to create a docs-only successor HEAD. After Control Plane verifies that the successor changes documentation only and leaves source/tests/scripts/dist unchanged, the already-approved deployment basis may be rebased to that docs-only HEAD without asking Owner for duplicate approval.

## Mandatory deploy gates

Before upload/write:
- fresh-fetch exact HEAD;
- clean worktree;
- focused identity/index/deploy-preservation tests 0 FAIL;
- deterministic build reproduces committed `dist/mbo-employee-app.js` and `dist/mbo-employee.css` exactly;
- GET-only App794 live+preview preflight;
- exact names `mbo-employee-app.js` and `mbo-employee.css`;
- topology Desktop JS=1, Desktop CSS=1, Mobile=0/0;
- exact release manifest using current HEAD and committed artifact blob SHAs.

Allowed writes only:
1. candidate JS upload;
2. candidate CSS upload;
3. App794 Preview customization PUT;
4. App794 deploy POST.

After SUCCESS: GET readback and exact deployed byte identity proof required.

## Owner UAT after independent deploy review

1. Dedicated Ms.Papatchaya -> auto-bind 0113 -> own MBO.
2. `tmh + 0113` -> DENY.
3. `tmh + shared-only employee` -> ALLOW via App801.
4. Existing current-FY record -> Open Current MBO, not Create New.

Do not perform or claim Owner UAT on the Owner's behalf.
