# AI ACTIVE TASK — D1 KINTONE-ONLY FINAL RECONCILIATION: MINIMAL LOGIN + APP801 ACL FACTS

> Control Plane: ChatGPT
> Execution Plane: Codex (temporary replacement for Antigravity)
> Repository: `rebootob/MBO2026`
> Canonical integration branch: `ai/antigravity-wp002c`
> Codex execution branch: `ai/codex-d1c3b`
> Reviewed plan commit: `1a66bda60e78465406dab4393f2f6aabac848711`
> Mode: MINIMUM KINTONE-ONLY CLOSURE / READ-ONLY FACTS / NO LIVE WRITE / NO DEPLOY

## 0. INDEPENDENT REVIEW RESULT

Accepted from the Codex plan:
- Kintone-only architecture is correctly recognized;
- no external gateway/server/VM is required by the user;
- MBO Login must appear on every MBO entry;
- successful login binds Employee Self to the authenticated MBO Employee_Code;
- Employee ID must not be entered/selected again after login;
- existing App53 lookup and App794 Employee_Code scoping paths were identified;
- current App801 physical auth fields were read with one READ-ONLY GET;
- no Kintone write/deploy occurred.

NOT accepted from the plan:
1. The conclusion that all 9 old server/session/activation fields are required is over-scoped for the user's new architecture.
2. The plan did not prove current App801 App ACL / Record ACL for the actual shared employee Kintone principal. Browser-only authentication cannot work unless the browser principal can read the App801 credential record, and password change / failed-attempt updates cannot work unless it can update the required fields.

GitHub has no CI/workflow/status evidence for the docs-only plan. Do not claim CI PASS.

## 1. USER REQUIREMENT — MINIMAL, FROZEN

Production architecture is KINTONE ONLY.

Required UX:

```text
Open MBO
  -> ask MBO Username / Password every time
  -> Username = Employee_Code
  -> validate against App801 credential data
  -> success binds current in-page Employee Self context = authenticated Employee_Code
  -> auto-load App53 + own App794
  -> no Employee ID input/selector after login
  -> leaving/re-entering MBO requires login again
```

No external Node Gateway, Server, VM, external hosting, external DB, reverse proxy, or external auth service.

## 2. MINIMAL AUTH CONTRACT — DO NOT CARRY SERVER SESSION DESIGN FORWARD

For this chosen architecture:
- authenticated MBO context is PAGE-MEMORY ONLY;
- no persisted MBO session token is required;
- no Activation Code is required unless the user explicitly requests it later;
- no external/server session store is required;
- password expiry is not a D1 closure requirement unless an existing physical field already supports it and no extra schema is needed.

Therefore these old server/runtime fields are NOT required by the current user scope and must not be requested merely to preserve the abandoned gateway design:

```text
Activation_Code_Hash
Activation_Expires_At
Activation_Used_At
Session_Token_Hash
Session_Expires_At
Session_Requires_Password_Change
Session_Data_Authorized
Session_Kintone_User_Code
```

`Password_Expires_At` is optional/non-blocking for the current minimal login requirement; do not create it solely for D1 unless separately justified and authorized.

Current App801 fields already observed and relevant to the minimal login include:

```text
Employee_Code
Password_Hash
Password_Algorithm
Password_Changed_At
Force_Password_Change
Account_Status
Failed_Attempts
Locked_Until
Last_Login_At
Credential_Version
```

MFA fields are not part of this D1 package.

## 3. PASSWORD VERIFICATION — BROWSER-SAFE, SAME HASH FORMAT

Existing repository hash format is PBKDF2 SHA-256:

```text
pbkdf2$100000$<saltHex>$<hashHex>
```

The later Kintone-only implementation must use browser Web Crypto (`crypto.subtle`, PBKDF2/SHA-256) or equivalent browser-native API to verify/create the SAME format.

Do NOT import `node:crypto` modules into Kintone browser customization.
Do NOT downgrade to plaintext password storage.
Do NOT log/render `Password_Hash`.

## 4. IMMEDIATE TASK — EXACT APP801 ACL FACTS ONLY + CORRECTED MINIMAL PLAN

Perform the minimum READ-ONLY Kintone inspection needed, preferably <= 2 additional GETs:

1. App801 App ACL / app permissions.
2. App801 Record ACL / record permissions.

Report exact entities/principal codes and rights. Do not guess.

Determine specifically for the shared/common employee Kintone principal/group:
- can it READ App801 records?
- can it UPDATE App801 records?

This matters because Kintone browser customization runs with the current Kintone user's native permissions.

If employee browser READ is denied:
```text
KINTONE_ONLY_LOGIN_RUNTIME = BLOCKED_APP801_BROWSER_READ
```

If employee browser READ is allowed, explicitly record:
```text
APP801_HASH_DIRECT_REST_EXPOSURE = YES_UNDER_SHARED_PRINCIPAL
```

If employee browser UPDATE is allowed, explicitly record:
```text
APP801_CREDENTIAL_DIRECT_REST_MUTATION_RISK = YES_UNDER_SHARED_PRINCIPAL
```

These are known limitations of the user's chosen Kintone-only/shared-account design. Do not hide or mislabel them as hard isolation.

## 5. RECONCILE SCHEMA REQUIREMENT

Do not reuse the old 9-field server manifest as a requirement.

For the user's minimal Kintone-only login, determine from the current physical App801 fields whether schema write is actually needed.

Expected result unless exact evidence proves otherwise:

```text
KINTONE_SCHEMA_WRITE_REQUIRED = NO
```

If you believe a field is truly required, list only that field and explain why the current UX cannot work without it.

## 6. SOURCE IMPLEMENTATION PLAN — KEEP SMALL

Do not implement yet. Correct/freeze the later source change set only.

Preferred minimal source plan:
- `src/ui/mbo-kintone-login-gate.js` — login/change-password/logout UI and page-memory authenticated Employee_Code;
- `src/ui/mbo-kintone-auth-adapter.js` — browser Kintone API + WebCrypto PBKDF2 adapter, no Node imports;
- `src/main-mbo-app.js` — gate before Employee Self render; App53/App794 auto-load from authenticated Employee_Code;
- `src/ui/employee-part-a-ui.js` — no Employee_Code lookup/input for authenticated Employee Self;
- existing build/deploy path only when later separately authorized.

No external gateway/server runtime changes.

## 7. REQUIRED REPORT

```text
KINTONE_ONLY_ARCHITECTURE = ACCEPTED
EXTERNAL_GATEWAY_REQUIRED = NO
MBO_LOGIN_EVERY_ENTRY = YES
EMPLOYEE_ID_REENTRY_AFTER_LOGIN = NO
PAGE_MEMORY_AUTH_CONTEXT = YES
ACTIVATION_CODE_REQUIRED = NO
PERSISTED_SESSION_FIELDS_REQUIRED = NO

APP801_AUTH_SOURCE = <exact existing fields>
APP801_APP_ACL_CURRENT = <exact entities + rights>
APP801_RECORD_ACL_CURRENT = <exact rules or NONE>
SHARED_EMPLOYEE_CAN_READ_APP801 = YES | NO | NOT_PROVEN
SHARED_EMPLOYEE_CAN_UPDATE_APP801 = YES | NO | NOT_PROVEN
APP801_HASH_DIRECT_REST_EXPOSURE = YES_UNDER_SHARED_PRINCIPAL | NO | NOT_PROVEN
APP801_CREDENTIAL_DIRECT_REST_MUTATION_RISK = YES_UNDER_SHARED_PRINCIPAL | NO | NOT_PROVEN

KINTONE_ONLY_LOGIN_RUNTIME = READY_FOR_SOURCE_IMPLEMENTATION | BLOCKED_APP801_BROWSER_READ | BLOCKED:<exact reason>
KINTONE_SCHEMA_WRITE_REQUIRED = NO | YES:<exact minimal field(s)>
KINTONE_ACL_CHANGE_REQUIRED = NO | YES:<exact reason/rules not yet authorized>

PASSWORD_VERIFY_FORMAT = PBKDF2_SHA256_100000_WEBCRYPTO_COMPATIBLE
EMPLOYEE_SELF_CONTEXT_SOURCE = AUTHENTICATED_MBO_EMPLOYEE_CODE
SOURCE_CHANGES_REQUIRED = <exact files>
KINTONE_CUSTOMIZATION_DEPLOY_REQUIRED = YES | NO

DIRECT_URL_REST_HARD_ISOLATION = NOT_GUARANTEED_UNDER_SHARED_KINTONE_ACCOUNT
KINTONE_READS_EXECUTED = N
KINTONE_WRITES_EXECUTED = 0
KINTONE_DEPLOY_EXECUTED = 0
STATUS = PLAN_READY_FOR_INDEPENDENT_REVIEW
```

No live Kintone write, schema change, ACL change, credential provisioning, or customization deployment in this package.

---

# MANDATORY PROJECT CONTROL

- D1 Login + password change + employee-self MBO gate = IN_PROGRESS / KINTONE-ONLY / FINAL ACL RECONCILIATION
- D2 Excel + PDF legacy-format export = IN_PROGRESS
- D3 migrate ALL history from Apps 283, 310, 305, 643, 307, 640, 715, 716 into App794 = IN_PROGRESS / WRITE NOT AUTHORIZED
- D4 HR Control Center / App800 end-to-end lifecycle = IN_PROGRESS
- D5 employee copy ONLY own previous planning fields = MUST_FIX
- D6 full E2E / security / regression closure = BLOCKED
- D7 Admin Support Center = PASS / CLOSED
