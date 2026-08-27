# AI ACTIVE TASK — D1-C3 TRUSTED RUNTIME + FIRST-LOGIN IDENTITY DECISION GATE

> Control Plane: ChatGPT
> Execution Plane: Antigravity
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Reviewed evidence commit: `6eae5fb6eab8a9c11d0444191857e6ad18ded22f`
> Mode: HOLD IMPLEMENTATION UNTIL USER ARCHITECTURE DECISION / NO KINTONE WRITE / NO SOURCE CHANGES

## 0. INDEPENDENT REVIEW RESULT

Accepted:
- D1-A trusted password/session source boundary = CLOSED.
- D1-B source/UI = ACCEPTED; user UAT passed bootstrap force change, default-password reuse block, wrong-password lockout, changed-password login, and logout. Access-check screenshot remains residual evidence only and does not block architecture work.
- D1-C1 App801 credential repository source corrective = ACCEPTED.
- D1-C2A hard `Account_Status = LOCKED` fix = PASS.
- D1-C2B evidence package = PASS as factual planning evidence.

D1 overall is NOT PASS.

## 1. VERIFIED CURRENT RUNTIME FACTS

From D1-C2B evidence:

```text
APP801_PASSWORD_EXPIRES_FIELD = ABSENT
APP801_KINTONE_USER_CODE_FIELD = ABSENT
APP801_ACL = CREATOR full access; GROUP everyone deny all
APP801_RECORD_ACL = NONE
APP801_SINGLE_SESSION_MODEL = FEASIBLE

APP794_APP_ACL = CREATOR full access; GROUP everyone view/add/edit/delete
APP794_RECORD_ACL = NONE
APP794_UNSAFE_PRINCIPAL = GROUP everyone
NATIVE_ACL_CAN_DISTINGUISH_0118_0119 = NO

IDENTITY_BINDING_SOURCE = NOT_AVAILABLE
KINTONE_USER_BINDING_UNIQUE = NOT_PROVEN
TRUSTED_BACKEND_RUNTIME = NOT_AVAILABLE
```

Repository environment also contains only local Node/Kintone tooling; no deployed trusted auth backend target is configured.

## 2. ARCHITECTURE BLOCKER — DO NOT BYPASS

Current accepted `MboIdentityService` requires a deterministic one-Kintone-user -> one-Employee_Code mapping before secondary MBO username validation.

The current operating model uses shared/general Kintone access for employees, so native Kintone identity cannot distinguish individual employees behind the shared account.

Security consequence:
- Removing the Kintone binding requirement without replacing it is NOT allowed.
- Allowing initial `Employee_Code / Employee_Code` as the only proof under a shared account would allow first-login impersonation when another person's Employee_Code is known.
- Client-side hiding cannot fix this.
- App794 ACL cannot distinguish 0118 from 0119 under the shared principal.

Therefore D1 requires BOTH:
1. a deployed trusted backend/gateway that owns App801 secrets and App794 employee-self data access; and
2. a secure first-login bootstrap identity proof compatible with the user's requirement that initial MBO username/password remain Employee_Code.

## 3. CONTROL-PLANE RECOMMENDATION — FASTEST SAFE PATH

Recommended architecture for user approval:

### A. Trusted MBO Auth/Data Gateway
- Portable Node.js server-side service using the already accepted auth/session/repository modules.
- Kintone browser JS never receives App801 privileged credential/API token.
- Gateway keeps Kintone privileged credentials server-side.
- Gateway establishes the secondary MBO session and exposes only authorized employee-self App794 operations.
- Employee browser does NOT directly use App794 unrestricted REST access after cutover.
- Deployment host is an operational choice; internal Windows/Linux server behind HTTPS is preferred when available. Exact host can be selected later without rewriting the auth domain.

### B. First-Login Activation Proof — RECOMMENDED
Keep the user's requested bootstrap credentials:
```text
Username = Employee_Code
Initial Password = Employee_Code
```
But first-ever bootstrap login must additionally require a one-time HR-issued Activation Code (random, not derived from Employee_Code).

Security properties:
- store only `Activation_Code_Hash`, never plaintext;
- one-time use;
- expire after configurable period;
- after successful activation + forced password change, normal logins use the new private password and no activation code;
- HR can later issue/reset activation through App800 trusted operations.

This is NOT recurring MFA. It is only first-login identity proof required because the Kintone outer account is shared.

## 4. DO NOT EXECUTE YET

Until the user approves the architecture above (or explicitly chooses another secure bootstrap proof):
- no App801 schema writes;
- no App794 ACL writes;
- no gateway implementation;
- no deployment;
- no weakening/removal of identity security checks;
- no D1 PASS claim.

## 5. EXPECTED WRITE/IMPLEMENTATION PACKAGE AFTER USER APPROVAL

The next package should combine the minimum required work so the user is not asked repeatedly:

### App801 schema additions (planned, not authorized yet)
Credential lifecycle:
- `Password_Expires_At` — DATETIME

Session lifecycle (single active session per employee):
- `Session_Token_Hash` — SINGLE_LINE_TEXT
- `Session_Expires_At` — DATETIME
- `Session_Requires_Password_Change` — DROP_DOWN YES|NO
- `Session_Data_Authorized` — DROP_DOWN YES|NO
- `Session_Kintone_User_Code` — SINGLE_LINE_TEXT (outer Kintone principal audit context, not unique employee proof)

First-login activation, if approved:
- `Activation_Code_Hash` — SINGLE_LINE_TEXT
- `Activation_Expires_At` — DATETIME
- `Activation_Used_At` — DATETIME

### Runtime implementation
- trusted Node gateway
- App801 credential/session adapters
- activation verification
- employee-self App794 gateway authorization
- HttpOnly/Secure session cookie or equivalent opaque session boundary

### App794 ACL
Do NOT change App794 ACL until the trusted gateway is operational and verified, to avoid locking users out prematurely.
After gateway UAT, remove unsafe `GROUP everyone` direct record access while preserving creator/HR/appraiser/approved privileged access based on exact current rules.

## 6. USER DECISION REQUIRED

Control Plane should ask the user ONE decision:

`Approve recommended D1 architecture: Trusted Node Gateway + one-time HR Activation Code for first login while retaining Employee_Code/Employee_Code bootstrap?`

If YES, create one tightly controlled D1-C3 implementation/write package.
If NO, obtain the user's preferred secure first-login identity proof/runtime and re-evaluate before implementation.

---

# MANDATORY PROJECT CONTROL — DO NOT DROP

- D1 Login + password change + strict employee data isolation = BLOCKED_ARCHITECTURE_DECISION / source auth accepted / runtime not deployed
- D2 Excel + PDF legacy-format export = IN_PROGRESS
- D3 migrate ALL history from Apps 283, 310, 305, 643, 307, 640, 715, 716 into App794 = IN_PROGRESS / WRITE NOT AUTHORIZED
- D4 HR Control Center / App800 end-to-end lifecycle = IN_PROGRESS
- D5 employee copy ONLY own previous planning fields = MUST_FIX
- D6 full E2E / security / regression closure = BLOCKED
- D7 Admin Support Center = PASS / CLOSED
