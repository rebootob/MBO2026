# MBO2026 — CHAT HANDOFF

Updated: 2026-09-08 ICT. Repository truth wins. Fresh-fetch `ai/antigravity-wp002c` first.

## Current canonical checkpoint

```text
CHECKPOINT_HEAD_BEFORE_DOC_SYNC = 03b531383e86c643a5258a2baf6fdbd15bc9099e
D1_BASE_ARCHITECTURE = CLOSED, BUT REOPENED NARROWLY BY PROVEN UAT REGRESSION
D1-UAT-DEFECT-001 = IMPLEMENTED / SOURCE REVIEW PASS / PENDING SANDBOX DEPLOY + OWNER UAT
D1-UAT-DEFECT-002 = IMPLEMENTED / SOURCE REVIEW PASS / PENDING SANDBOX DEPLOY + OWNER UAT
D2_ENGINEERING = PASS / CLOSED / DURABLE
D2_OWNER_UAT = IN PROGRESS / PAUSED ON D1 ENTRY DEFECTS
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

## DEFECT-001 corrective chain

```text
D1-UAT-IDENTITY-ENTRY-CORRECTIVE-R1 = PARTIAL PASS
R1_HEAD = 8c3fda998fe8bd0b627d62a5beb10455bde8f725
D1-UAT-IDENTITY-ENTRY-CORRECTIVE-R2 = PASS / CLOSED
R2_HEAD = 88ed6b7ea99ca9871190c2a913879b9e7638e3cb
```

R2 closed the remaining fail-open condition: only explicit valid `MBO_Kintone_User.value = []` permits Shared mode; missing or malformed USER_SELECT structures deny.

## DEFECT-002 corrective behavior

Employee Self index must use current Japanese fiscal year authority.

```text
exactly 1 current-FY MBO -> Open Current MBO
0 current-FY MBO -> Create New MBO
>1 current-FY MBO -> fail safe / no Create path
```

Backend duplicate guard remains defense-in-depth and must not be weakened.

## Sandbox build/deploy preparation

```text
BUILD_ARTIFACT_HEAD = d9efa5a0c418ad98ca8b70965b130a8b607e81b5
D1-UAT-SANDBOX-DEPLOY-TOOL-R1 = PASS / CLOSED
DEPLOY_TOOL_HEAD = 03b531383e86c643a5258a2baf6fdbd15bc9099e
CANONICAL_JS = mbo-employee-app.js
CANONICAL_CSS = mbo-employee.css
HISTORICAL_WRONG_CSS = "mbo-employee .css" -> MUST FAIL CLOSED
```

No accepted evidence exists yet that the new DEFECT-001/002 bundle has been deployed to App794. Do not confuse build success with deploy success.

## Current Owner authorization

Owner explicitly authorized:
`อนุมัติ App794 Sandbox Deploy หลังแก้ CSS Target`

Authorized operation: one-shot App794 customization deployment only, with focused regression, reproducible build, GET-only preflight, exact artifact manifest, post-deploy readback, max one attempt, no automatic retry.

Original authorization ID:
`D1-UAT-DEFECT-001-002-SANDBOX-DEPLOY-20260908-02`

Because this handoff sync creates a docs-only commit, Control Plane may rebase the already-approved deployment basis to the new docs-only HEAD after independently confirming zero runtime/source/dist changes. Do not request Owner approval again solely for that docs-only rebase.

Allowed Kintone writes for that deploy only:
- upload candidate JS/CSS files;
- PUT App794 preview customization;
- POST App794 deploy request.

Forbidden:
- all record writes;
- App53/App795/App796/App797/App798/App800/App801 writes;
- schema/layout/ACL/process changes;
- D2 changes;
- D3 work.

## Owner UAT after successful independent deploy review

1. Ms.Papatchaya native Kintone login -> auto-bind `0113` -> own MBO opens.
2. `tmh` + Employee `0113` -> DENY with dedicated-account guidance.
3. `tmh` + employee with no dedicated Kintone mapping -> Shared App801 login still works.
4. Existing current-FY MBO -> `Open Current MBO`; no create-new path.

Do not mark Owner UAT PASS until the Owner performs these runtime checks.

## Startup order for next chat

1. Fresh-fetch canonical HEAD.
2. Read this file first.
3. Read `AI_CONTROL_CENTER.md`.
4. Read `AI_ACTIVE_TASK.md`.
5. Read `control/00_MASTER_DELIVERY_CONTROL.md` and `control/02_ACTIVE_WORK_PACKAGE.md`.
6. Inspect exact current commit/diff only as needed.
7. If the App794 deploy has executed, independently review deployment evidence before asking Owner to UAT.
8. Do not start D3.
