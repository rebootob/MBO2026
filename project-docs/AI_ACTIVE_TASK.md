# AI ACTIVE TASK — D1 REBASE: KINTONE-ONLY MBO LOGIN GATE

> Control Plane: ChatGPT
> Execution Plane: Codex (temporary replacement for Antigravity)
> Repository: `rebootob/MBO2026`
> Canonical integration branch: `ai/antigravity-wp002c`
> Codex execution branch: `ai/codex-d1c3b`
> User architecture decision: 2026-08-27
> Mode: KINTONE-ONLY / NO EXTERNAL GATEWAY / NO SERVER / NO VM / NO EXTERNAL APP

## 0. USER REQUIREMENT — OVERRIDES THE PREVIOUS LIVE HOST GATE

The user explicitly requires the MBO solution to finish entirely inside Kintone.

Do NOT require or deploy:
- Node Gateway;
- Windows/Linux Server or VM;
- reverse proxy;
- external hosting;
- external authentication service;
- external database.

The accepted portable gateway code may remain in Git as unused/reversible work, but it is NOT part of the chosen production architecture unless the user later changes this decision explicitly.

## 1. REQUIRED USER EXPERIENCE

Every time an employee enters the MBO app/workspace:

```text
Open MBO
  -> show MBO Login modal/page
      Username = Employee_Code
      Password = employee MBO password stored/managed in Kintone auth data
  -> validate login
  -> on success bind current in-page MBO principal = Employee_Code
  -> automatically load that employee's App53 profile and App794 MBO
```

Rules:
- do not ask Employee ID again after successful MBO login;
- employee-facing MBO actions use the authenticated MBO Employee_Code;
- entering/re-entering MBO requires MBO login again;
- initial/default credential remains Employee_Code / Employee_Code unless current accepted implementation already requires first-login password change/activation;
- employee can change own MBO password;
- logout clears the in-page MBO authenticated state;
- do not add an external runtime dependency.

## 2. AUTH DATA

Use App801 as the Kintone auth-data app.

Do NOT store plaintext password if the existing accepted hash-based implementation can be reused.

Prefer existing fields/contracts already implemented and proven in source; do not redesign auth unless the Kintone-only boundary requires a minimal adapter.

The goal is a Kintone customization login gate, not a separate infrastructure project.

## 3. IMPORTANT SECURITY CLASSIFICATION

Current company model uses a shared/common Kintone account for general employees.

Therefore, under Kintone-only architecture:
- native Kintone App794 ACL cannot distinguish employee 0118 from 0119 when both use the same underlying Kintone account;
- an MBO login implemented only in browser-side Kintone customization is an APPLICATION/UI AUTHORIZATION GATE;
- it does NOT create a cryptographically separate native Kintone principal;
- it cannot by itself guarantee protection against a technically capable user bypassing customization through direct Kintone record URL/REST if the shared Kintone account still has those native permissions.

Do not falsely claim hard native Kintone isolation under the shared-account model.

For the user's chosen scope, implement the strongest practical Kintone-only application gate and keep direct-URL/REST limitation explicitly documented.

## 4. CURRENT IMMEDIATE TASK

Do NOT continue D1-C4B host decision work.
Do NOT deploy the portable Node gateway.

Codex must first perform a narrow Kintone-only reconciliation and implementation plan:

1. inspect existing D1 login UI/customization source already in repo;
2. identify the smallest changes needed so opening MBO always requires MBO username/password;
3. after login, bind employee context once and remove/disable any employee Employee_Code selector/input inside Employee Self;
4. reuse existing App53/App794 employee-self filtering by the authenticated MBO Employee_Code where possible;
5. reuse existing password-change/logout behavior where possible;
6. identify exactly what App801 fields already exist and the minimum missing fields actually required for Kintone-only operation;
7. do NOT implement or deploy external gateway/runtime;
8. do NOT change Kintone schema/ACL/deploy without separate explicit user authorization.

## 5. REQUIRED REPORT BEFORE ANY LIVE KINTONE WRITE

Report:

```text
KINTONE_ONLY_ARCHITECTURE = ACCEPTED
EXTERNAL_GATEWAY_REQUIRED = NO
MBO_LOGIN_EVERY_ENTRY = YES
EMPLOYEE_ID_REENTRY_AFTER_LOGIN = NO
APP801_AUTH_SOURCE = <exact existing fields used>
APP801_MISSING_REQUIRED_FIELDS = <exact list or NONE>
EMPLOYEE_SELF_CONTEXT_SOURCE = AUTHENTICATED_MBO_EMPLOYEE_CODE
DIRECT_URL_REST_HARD_ISOLATION = NOT_GUARANTEED_UNDER_SHARED_KINTONE_ACCOUNT
SOURCE_CHANGES_REQUIRED = <exact files>
KINTONE_SCHEMA_WRITE_REQUIRED = YES:<exact fields> | NO
KINTONE_CUSTOMIZATION_DEPLOY_REQUIRED = YES | NO
KINTONE_WRITES_EXECUTED = 0
KINTONE_DEPLOY_EXECUTED = 0
STATUS = PLAN_READY_FOR_INDEPENDENT_REVIEW
```

No live write/deploy in this planning/reconciliation package.

## 6. OUT OF SCOPE

- no external server/VM;
- no Node gateway deployment;
- no DNS/TLS/reverse proxy;
- no external auth service;
- no App794 ACL cutover based on the abandoned gateway architecture;
- no D2-D7 work in this package;
- no unrelated refactor.

---

# MANDATORY PROJECT CONTROL

- D1 Login + password change + employee-self MBO gate = IN_PROGRESS / ARCHITECTURE REBASED TO KINTONE-ONLY
- D2 Excel + PDF legacy-format export = IN_PROGRESS
- D3 migrate ALL history from Apps 283, 310, 305, 643, 307, 640, 715, 716 into App794 = IN_PROGRESS / WRITE NOT AUTHORIZED
- D4 HR Control Center / App800 end-to-end lifecycle = IN_PROGRESS
- D5 employee copy ONLY own previous planning fields = MUST_FIX
- D6 full E2E / security / regression closure = BLOCKED
- D7 Admin Support Center = PASS / CLOSED
