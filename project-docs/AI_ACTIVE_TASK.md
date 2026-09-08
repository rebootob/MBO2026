# AI ACTIVE TASK — D1-UAT-DEFECT-003 LOGIN ESCAPE & RECOVERY UX

Mode: **CONTROL PLANE / D1 UAT CORRECTIVE / DEFECT-003 IMPLEMENTATION / D3 HOLD**
Branch: `ai/antigravity-wp002c`
Updated: 2026-09-08 ICT

## Current truth

```text
D1_BASE_ARCHITECTURE = CLOSED / DURABLE
D1_ORIGINAL_FOCUSED_UAT_1_TO_4 = 4/4 PASS
D1-UAT-DEFECT-001 = OWNER RUNTIME UAT PASS
D1-UAT-DEFECT-002 = OWNER RUNTIME UAT PASS
D1-UAT-DEFECT-003 = SOURCE REVIEW PASS / FOCUSED TEST PASS / DEPLOYMENT PENDING / OWNER DEFECT-003 UAT PENDING
D1_FINAL_CLOSURE = HOLD pending DEFECT-003 deployment + focused Owner UAT + Control Plane review
D2_ENGINEERING = PASS / CLOSED / DURABLE
D3 = HOLD
PRODUCTION_READY = NO
KINTONE_WRITE_AUTHORIZATION = NONE
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

## Active stage: DEFECT-003 Corrective Verification Completed

DEFECT-003 test and control-doc corrective verification is completed:
- Independent test execution PASS: 113 total, 113 PASS, 0 FAIL, 0 SKIP, exit code 0.
- Current state: Awaiting Control Plane (ChatGPT) independent review.
- No deploy authority exists in this work package (Kintone writes = 0, builds = 0, deploys = 0).

## Owner Runtime UAT Status

### Original Focused UAT: 4/4 PASS (Locked Truth)
The original 4 Owner Runtime UAT cases on App794 (Live revision 69) were executed and verified by Owner:
1. **Dedicated Account Test (Ms.Papatchaya auto-bind 0113)**: PASS
2. **Shared Login Boundary Test (tmh + 0113 DENY)**: PASS
3. **Shared Login Boundary Test (tmh + shared employee ALLOW)**: PASS
4. **Current-FY Entry UX Test (1 MBO -> Open Current MBO, no Create New)**: PASS

DO NOT re-request or repeat these 4 tests.

### Future Focused Owner UAT for DEFECT-003 (Post-Deployment Only)
After a separate, authorized build and deployment of DEFECT-003 to App794, the only required focused Owner UAT checks will be:
1. **DEFECT003-UAT-1**: In MBO Login overlay, click "กลับหน้าหลัก Kintone / Back to Kintone Home" -> cleanly exits blocking overlay back to Kintone portal.
2. **DEFECT003-UAT-2**: In MBO Login overlay, click "ลืมรหัสผ่าน / Forgot Password" -> bilingual HR/Administrator support text appears without password reset or session change.
3. **DEFECT003-UAT-3**: Enter Employee 0113 under shared account -> `DEDICATED_ACCOUNT_REQUIRED` denial appears, and Back to Kintone Home button remains active and functional.

*These DEFECT-003 UAT cases are NOT authorized to run now because DEFECT-003 has not yet been built or deployed.*

D3 remains strictly on HOLD until DEFECT-003 deployment, focused UAT, and Control Plane review are complete.
