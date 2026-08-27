# AI ACTIVE TASK — D1-C4B LIVE HOST DECISION GATE

> Control Plane: ChatGPT
> Execution Plane: Codex (temporary replacement for Antigravity)
> Repository: `rebootob/MBO2026`
> Canonical integration branch: `ai/antigravity-wp002c`
> Codex execution branch: `ai/codex-d1c3b`
> Independently reviewed implementation: `5c56bf2c9f68650e28179ccc1e016b25cb036ecd`
> Mode: USER DECISION GATE / NO IMPLEMENTATION / NO KINTONE WRITE / NO DEPLOY

## 0. INDEPENDENT REVIEW RESULT — D1-C4A ACCEPTED

Accepted from `5c56bf2c...`:
- portable Node trusted gateway runtime exists;
- exact-origin credential CORS and OPTIONS preflight are implemented;
- cookie topology explicitly supports `Strict`, `Lax`, and `None`, with `SameSite=None` requiring `Secure=true`;
- production mode fails closed for unsupported NODE_ENV, missing origin, insecure cookie, or non-HTTPS production origin/base URL;
- direct Node entrypoint uses `pathToFileURL()` and is portable across Windows/Linux path formats;
- login uses the server-controlled shared outer Kintone principal;
- browser receives opaque HttpOnly cookie only; raw session token/hashes are not returned in JSON;
- Employee Self authorization remains trusted-session Employee_Code only;
- activation failure does not set a session cookie;
- restricted session data denial, malformed fiscal-year denial, password-change cookie rotation, logout cookie clearing are covered by focused runtime tests;
- no Kintone read/write/deploy and no live server deployment occurred.

GitHub has no CI/workflow/status evidence. Do not claim CI PASS.

Classification:

```text
D1C4A_SOURCE = PASS / ACCEPTED
PORTABLE_RUNTIME_PACKAGE = ACCEPTED_NOT_DEPLOYED
TRUSTED_BACKEND_RUNTIME = NOT_DEPLOYED
D1_OVERALL = IN_PROGRESS
```

## 1. CURRENT BLOCKER — LIVE HOST NOT CHOSEN

No implementation is authorized until the user selects/provides the trusted gateway host/topology.

Required user decision/facts:

```text
HOST_PLATFORM = WINDOWS_SERVER_VM | LINUX_VM | TEMPORARY_UAT_WINDOWS_PC
HOST_LOCATION = <internal company host / network location>
BROWSER_TO_GATEWAY_TOPOLOGY = SAME_SITE_REVERSE_PROXY | CROSS_SITE_HTTPS
HTTPS_ENDPOINT = <planned HTTPS origin or NOT_AVAILABLE_YET>
SERVER_CAN_REACH_KINTONE = YES | NO | NOT_PROVEN
EMPLOYEE_BROWSER_CAN_REACH_SERVER = YES | NO | NOT_PROVEN
```

Preferred production direction:
- approved always-on internal Windows Server/VM or Linux VM;
- HTTPS only;
- same-site/reverse-proxy topology is preferred when practical;
- cross-site topology is allowed only with exact-origin CORS, `credentials: include`, and `SameSite=None; Secure`.

Do not invent hostname/IP/certificate/server availability.

## 2. FROZEN NEXT LIVE CUTOVER SEQUENCE — NOT YET AUTHORIZED

After host decision and a separate explicit user authorization, Control Plane will issue one exact live package in this order:

1. deploy trusted gateway to the approved host;
2. verify `/health` and gateway-to-Kintone connectivity;
3. add the exact 9 App801 runtime fields;
4. provision credentials/activation data through an approved server-side process;
5. run 0118/0119 gateway UAT while App794 direct access is still unchanged;
6. prove exact privileged App794 access rules to preserve;
7. change App794 ACL only after gateway path is proven usable;
8. final D1-B/D1 runtime UAT and rollback verification.

No step above is authorized by this document.

## 3. FROZEN APP801 9-FIELD MANIFEST

```text
Password_Expires_At                  DATETIME
Activation_Code_Hash                 SINGLE_LINE_TEXT
Activation_Expires_At                DATETIME
Activation_Used_At                   DATETIME
Session_Token_Hash                   SINGLE_LINE_TEXT
Session_Expires_At                   DATETIME
Session_Requires_Password_Change     DROP_DOWN YES|NO
Session_Data_Authorized              DROP_DOWN YES|NO
Session_Kintone_User_Code            SINGLE_LINE_TEXT
```

`APP801_ACL_CHANGE = NO_CHANGE` unless later live evidence proves otherwise.

## 4. APP794 CUTOVER STATUS

Current accepted facts:

```text
APP794_RECORD_ACL_CURRENT = NONE
APP794_UNSAFE_EMPLOYEE_RULE = GROUP everyone direct record view/add/edit/delete enabled
APP794_PRIVILEGED_USER_FIELDS = Requester_User, Manager_Level1_Approvers, Manager_Level2_Approvers, GM_Level1_Approvers, GM_Level2_Approvers
APP794_ACL_CUTOVER = BLOCKED_PRIVILEGED_RULES_NOT_PROVEN
```

Do not remove `GROUP everyone` until:
- gateway is deployed and proven reachable;
- Employee Self works through the gateway;
- exact HR/appraiser/approver/admin rules to preserve are proven;
- user explicitly authorizes the ACL change.

## 5. EXECUTION RULE

Until the host decision is supplied:

```text
SOURCE_CHANGES = 0
KINTONE_READS = 0
KINTONE_WRITES = 0
KINTONE_DEPLOY = 0
LIVE_SERVER_DEPLOY = 0
```

Codex/Antigravity must STOP and wait. Do not create hosting, deploy, change schema, provision credentials, or alter ACL by assumption.

---

# MANDATORY PROJECT CONTROL — DO NOT DROP

- D1 Login + password change + strict employee data isolation = IN_PROGRESS / D1-A CLOSED / D1-B SOURCE ACCEPTED + FINAL ACCESS CHECK RESIDUAL / D1-C1 SOURCE ACCEPTED / D1-C2 EVIDENCE ACCEPTED / D1-C3A PASS / D1-C3B PASS / D1-C4A PASS / D1-C4B LIVE HOST DECISION GATE
- D2 Excel + PDF legacy-format export = IN_PROGRESS
- D3 migrate ALL history from Apps 283, 310, 305, 643, 307, 640, 715, 716 into App794 = IN_PROGRESS / WRITE NOT AUTHORIZED
- D4 HR Control Center / App800 end-to-end lifecycle = IN_PROGRESS
- D5 employee copy ONLY own previous planning fields = MUST_FIX
- D6 full E2E / security / regression closure = BLOCKED
- D7 Admin Support Center = PASS / CLOSED
