# AI ACTIVE TASK — D1-UAT-DEFECT-003 LOGIN ESCAPE & RECOVERY UX

Mode: **CONTROL PLANE / D1 UAT CORRECTIVE / DEFECT-003 IMPLEMENTATION / D3 HOLD**
Branch: `ai/antigravity-wp002c`
Updated: 2026-09-08 ICT

## Current truth

```text
D1_BASE_ARCHITECTURE = CLOSED / DURABLE
D1_REOPEN_REASON = MATERIAL UX DEFECT DISCOVERED DURING OWNER UAT
D1_ORIGINAL_FOCUSED_UAT_1_TO_4 = 4/4 PASS
D1-UAT-DEFECT-001 = SOURCE REVIEW PASS / DEPLOYED (REV 69) / UAT-2 PASS
D1-UAT-DEFECT-002 = SOURCE REVIEW PASS / DEPLOYED (REV 69) / UAT-4 PASS
D1-UAT-DEFECT-003 = IMPLEMENTATION IN PROGRESS / OWNER-FOUND UX DEFECT
D1_FINAL_CLOSURE = HOLD pending DEFECT-003 correction + review + deployment + focused UAT
D2_ENGINEERING = PASS / CLOSED / DURABLE
D2_OWNER_UAT = IN PROGRESS / PAUSED ON D1 ENTRY UAT
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

## Accepted corrective, deploy & migration chain

```text
R1_HEAD = 8c3fda998fe8bd0b627d62a5beb10455bde8f725 (PARTIAL PASS)
R2_HEAD = 88ed6b7ea99ca9871190c2a913879b9e7638e3cb (PASS / CLOSED)
BUILD_ARTIFACT_HEAD = d9efa5a0c418ad98ca8b70965b130a8b607e81b5
DEPLOY_TOOL_HEAD = 03b531383e86c643a5258a2baf6fdbd15bc9099e (PASS / CLOSED)
SANDBOX_DEPLOY_R2 = cd74b01e6650bb04b5fbdba6c365dd9a1bf87236 (PASS / CLOSED, Rev 67 -> 68)
CSS_MIGRATION_R1 = 38f5ba111d6ebbfaa09a3415819a92f5a48a1f4d (PASS / CLOSED, Rev 68 -> 69)

APP794_LIVE_REVISION = 69
APP794_LIVE_JS = mbo-employee-app.js (blob 8958634b92b35f74b58a7a0b2abd09b8b5e93758)
APP794_LIVE_CSS = mbo-employee.css (blob 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61)
STANDARD_DEPLOY_PREFLIGHT = PASS (validatePreflight = true)
```

## Deployment & Migration Completion

App 794 Sandbox deployment and CSS filename migration are completely executed and verified:
1. `D1-UAT-DEFECT-001-002-SANDBOX-DEPLOY-R2` deployed candidate artifacts to Live App 794 (rev 67 -> 68).
2. `D1-UAT-APP794-CSS-FILENAME-MIGRATION-R1` migrated live CSS customization filename from `"mbo-employee .css"` to canonical `"mbo-employee.css"` (rev 68 -> 69), preserving exact bytes and restoring standard deployment tool preflight.
3. Zero records, schemas, layouts, ACLs, or workflows modified across all apps.
4. Deployment work packages are now CLOSED. No further Kintone writes or deploys are authorized.

## Active stage: Owner Runtime UAT

App 794 is ready for Owner runtime testing. Expected test cases:

1. **Dedicated Account Test**:
   - Log in as Ms.Papatchaya natively in Kintone.
   - Navigate to App 794.
   - Confirm auto-binds to `0113` and opens own MBO.
2. **Shared Login Boundary Test (Deny)**:
   - Log in as shared account `tmh`.
   - In Employee-Self login, enter `0113` + App 801 password.
   - Confirm DENY with clear dedicated account guidance.
3. **Shared Login Boundary Test (Allow)**:
   - Log in as shared account `tmh`.
   - In Employee-Self login, enter an employee ID whose App53 `MBO_Kintone_User.value = []` + valid App 801 password.
   - Confirm ALLOW.
4. **Current-FY Entry UX Test**:
   - For an employee with an existing current-FY MBO record, confirm Employee-Self displays "Open Current MBO" and offers no Create New path.

Do not perform or claim Owner UAT on the Owner's behalf.
D3 remains strictly on HOLD until Owner UAT is completed and reviewed.
