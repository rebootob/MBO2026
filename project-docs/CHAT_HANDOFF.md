# MBO2026 — CHAT HANDOFF

Updated: 2026-09-08 ICT. Repository truth wins. Fresh-fetch `ai/antigravity-wp002c` first.

## Current canonical checkpoint

```text
CHECKPOINT_HEAD = 38f5ba111d6ebbfaa09a3415819a92f5a48a1f4d
D1_BASE_ARCHITECTURE = CLOSED / DURABLE
D1-UAT-DEFECT-001 = IMPLEMENTED / SOURCE REVIEW PASS / TECHNICALLY DEPLOYED / OWNER UAT PENDING
D1-UAT-DEFECT-002 = IMPLEMENTED / SOURCE REVIEW PASS / TECHNICALLY DEPLOYED / OWNER UAT PENDING
APP794_DEPLOYMENT = TECHNICAL PASS (Live rev 69)
APP794_CSS_TARGET = CANONICAL (mbo-employee.css)
D2_ENGINEERING = PASS / CLOSED / DURABLE
D2_OWNER_UAT = IN PROGRESS / PAUSED ON D1 ENTRY UAT
D3 = HOLD
PRODUCTION_READY = NO
```

## Proven Hybrid Identity contract

Two user modes are mandatory:

1. **Dedicated / 1:1 Kintone user**
   - Current Kintone user must resolve through active App53 `MBO_Kintone_User` exact mapping.
   - Employee is auto-bound from canonical App53 `emp_text`.
   - Dedicated employees must NOT use Shared App801 login.

2. **Shared Kintone user** such as `tmh`
   - User enters Employee ID + App801 password.
   - Allowed only when active App53 row has a valid USER_SELECT shape with `MBO_Kintone_User.value = []`.
   - If App53 has one dedicated user mapping, Shared login must fail with `DEDICATED_ACCOUNT_REQUIRED`.
   - Missing/malformed/ambiguous App53 mapping fails closed.

Owner UAT evidence proved Employee `0113` / Ms.Papatchaya has dedicated App53 mapping to `Ms.Papatchaya`.

Required behavior:
```text
tmh + 0113 -> DENY
Ms.Papatchaya native Kintone login -> auto-bind 0113 -> ALLOW
tmh + employee whose MBO_Kintone_User.value = [] -> App801 shared login -> ALLOW
```

## Corrective & Deployment Chain

```text
D1-UAT-IDENTITY-ENTRY-CORRECTIVE-R1 = PARTIAL PASS
R1_HEAD = 8c3fda998fe8bd0b627d62a5beb10455bde8f725

D1-UAT-IDENTITY-ENTRY-CORRECTIVE-R2 = PASS / CLOSED
R2_HEAD = 88ed6b7ea99ca9871190c2a913879b9e7638e3cb

BUILD_ARTIFACT = d9efa5a0c418ad98ca8b70965b130a8b607e81b5
Candidate JS Blob: 8958634b92b35f74b58a7a0b2abd09b8b5e93758
Candidate CSS Blob: 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61

D1-UAT-SANDBOX-DEPLOY-TOOL-R1 = PASS / CLOSED
DEPLOY_TOOL_HEAD = 03b531383e86c643a5258a2baf6fdbd15bc9099e
CANONICAL_CSS_TARGET = mbo-employee.css

D1-UAT-DEFECT-001-002-SANDBOX-DEPLOY-R2 = PASS / CLOSED
DEPLOY_EVIDENCE_HEAD = cd74b01e6650bb04b5fbdba6c365dd9a1bf87236
Evidence: project-docs/D1_UAT_DEFECT_001_002_SANDBOX_DEPLOY_R2_EVIDENCE.md
Live App794 deployed from revision 67 to 68 with exact candidate blob match.

D1-UAT-APP794-CSS-FILENAME-MIGRATION-R1 = PASS / CLOSED
MIGRATION_HEAD = 38f5ba111d6ebbfaa09a3415819a92f5a48a1f4d
Evidence: project-docs/D1_UAT_APP794_CSS_FILENAME_MIGRATION_R1_EVIDENCE.md
Live App794 migrated from revision 68 to 69:
- CSS target filename corrected from "mbo-employee .css" to "mbo-employee.css"
- Exact CSS bytes preserved (blob 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61)
- Standard deploy tool preflight check restored to PASS (validatePreflight = true)
```

## DEFECT-002 corrective behavior

Employee Self index must use current Japanese fiscal year authority.

```text
exactly 1 current-FY MBO -> Open Current MBO
0 current-FY MBO -> Create New MBO
>1 current-FY MBO -> fail safe / no Create path
```

Backend duplicate guard remains defense-in-depth and must not be weakened.

## Current App794 Live Customization State

App 794 is verified live at revision 69 with exact candidate assets:
- **Desktop JS**: `mbo-employee-app.js` (Git blob `8958634b92b35f74b58a7a0b2abd09b8b5e93758`)
- **Desktop CSS**: `mbo-employee.css` (Git blob `0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61`)
- **Topology**: Desktop JS = 1, Desktop CSS = 1, Mobile JS = 0, Mobile CSS = 0
- **Writes across all apps**: 0 records, 0 schemas, 0 ACLs, 0 workflows

Deployment work packages are fully executed and closed. No pending deployments exist.

## Owner Runtime UAT (Active Focus)

The technical deployment is complete and independently verified. The next operational milestone is Owner runtime UAT:

1. Ms.Papatchaya native Kintone login -> auto-bind `0113` -> own MBO opens.
2. `tmh` + Employee `0113` -> DENY with dedicated-account guidance.
3. `tmh` + employee with no dedicated Kintone mapping -> Shared App801 login still works.
4. Existing current-FY MBO -> `Open Current MBO`; no create-new path.

Do not mark Owner UAT PASS until the Owner performs these runtime checks.
D3 remains strictly on HOLD until Owner UAT passes and Control Plane authorizes entry.

## Startup order for next chat

1. Fresh-fetch canonical HEAD.
2. Read this file first.
3. Read `AI_CONTROL_CENTER.md`.
4. Read `AI_ACTIVE_TASK.md`.
5. Read `control/00_MASTER_DELIVERY_CONTROL.md` and `control/02_ACTIVE_WORK_PACKAGE.md`.
6. Inspect exact current commit/diff only as needed.
7. Assist Owner in recording runtime UAT results.
8. Do not start D3.
