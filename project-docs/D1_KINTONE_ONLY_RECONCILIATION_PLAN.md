# D1 Kintone-Only MBO Login Gate — Reconciliation Plan

Status: `PLAN_READY_FOR_INDEPENDENT_REVIEW`. This is source/repository and one App801 schema-GET evidence only. It authorizes no Kintone write, ACL change, customization deployment, credential provisioning, or external runtime work.

## Architecture and limitation

`KINTONE_ONLY_ARCHITECTURE = ACCEPTED`

`EXTERNAL_GATEWAY_REQUIRED = NO`

The App794 customization must present an MBO login gate for every App794 entry, retain the resulting authenticated MBO Employee_Code only in the current page session, and use that value for all Employee Self operations. The shared/common Kintone account remains the native principal, so this is an application/UI authorization gate only:

`DIRECT_URL_REST_HARD_ISOLATION = NOT_GUARANTEED_UNDER_SHARED_KINTONE_ACCOUNT`

Native App794 permissions must not be claimed as employee-0118 versus employee-0119 isolation while that account has shared direct access.

## Existing source evidence

| Need | Existing component | Reuse/plan result |
| --- | --- | --- |
| Demonstrable login UI | `preview/auth-preview.html` (`handleLogin`, force change, normal change, logout) | Local preview only; its layout/flow is the reference, not a deployed App794 component. |
| Preview auth endpoints/stores | `scripts/ui-preview-server.js` (`/api/auth/login`, `/change-password`, `/logout`) | Local Node preview only; not part of Kintone-only production. |
| Credential/session domain | `src/services/mbo-password-service.js`, `src/services/mbo-auth-session-service.js`, `src/services/mbo-activation-service.js` | Reuse rules/contracts; these current modules use Node `crypto`, so an App794 browser adapter must not import them directly. |
| App801 adapter | `src/services/mbo-auth-kintone-repository.js` | Reuse field names/query/update allowlist as the Kintone adapter contract; current file is designated server-only and must not be exposed unchanged to browser code. |
| App53 lookup | `src/services/employee-service.js`, used from `src/main-mbo-app.js` through `kintoneApiWrapper` | Reuse `EmployeeService.lookupEmployee(authenticatedEmployeeCode, kintoneApiWrapper)` after login. |
| App794 own-data scope | `src/services/mbo-employee-self-gateway.js` | Its trusted-session contract cannot be used unchanged in browser-only Kintone; preserve its compound Employee_Code query and confidential-field stripping as the implementation contract. |
| Existing Employee-Code entry/lookup | `src/ui/employee-part-a-ui.js` (`_renderLookupSection`, `executeLookup`, `#mbo-lookup-emp-input`) and callbacks in `src/main-mbo-app.js` | Remove/disable for Employee Self after login; it must be replaced by the bound in-page authenticated context. |
| Password change/logout behavior | `preview/auth-preview.html` `handleForceChange`, `handleNormalChange`, `handleLogout`; service contracts above | Reuse flows and App801 update semantics in the Kintone-only login-gate adapter. |

## Required source change set — later implementation package

1. Add `src/ui/mbo-kintone-login-gate.js`: App794-only modal/gate that opens on every record create/edit/detail entry, accepts only username/password (and activation code where required), and keeps authenticated Employee_Code in non-persistent page state. It must provide change-password and logout actions.
2. Add a browser-safe, narrowly scoped App801 adapter (proposed `src/ui/mbo-kintone-auth-adapter.js`) that uses Kintone APIs and the existing App801 field contract. It must never render or log credential/hash values. Its review must explicitly address that browser-side access to password hashes is not a hard secret boundary.
3. Update `src/main-mbo-app.js`: await the login gate before rendering Employee Self; inject the authenticated Employee_Code into the create/load path; call `EmployeeService.lookupEmployee()` for App53 and perform exact App794 Employee_Code-filtered autoload; do not call the existing free-form employee-code callbacks for Employee Self.
4. Update `src/ui/employee-part-a-ui.js`: do not render `_renderLookupSection()` / `#mbo-lookup-emp-input` for authenticated Employee Self; make Employee_Code display-only and reject mutation through `onEmployeeCodeChanged`/`executeLookup` after authentication.
5. Update the customization build/deployment manifest used by `scripts/kintone/deploy-custom-ui.js` only in the later explicitly authorized implementation/deployment package, so the new App794 bundle is included.

No source changes are made by this plan.

## Required runtime behavior — later implementation package

`MBO_LOGIN_EVERY_ENTRY = YES`

`EMPLOYEE_ID_REENTRY_AFTER_LOGIN = NO`

`EMPLOYEE_SELF_CONTEXT_SOURCE = AUTHENTICATED_MBO_EMPLOYEE_CODE`

On every App794 entry the gate authenticates `username = Employee_Code`; success stores the normalized code solely as current page context. The App53 autoload path is `src/main-mbo-app.js` -> existing `kintoneApiWrapper` -> `EmployeeService.lookupEmployee(authenticatedEmployeeCode, ...)`. The App794 autoload path must use the same context in an exact `Employee_Code = "<authenticated>"` query, including record-ID compound scope where applicable, and must exclude `CONFIDENTIAL_FIELDS` as specified in `src/config/constants.js`. `Employee_Code` cannot be accepted from a selector/input after that point.

## App801 schema evidence

One read-only GET of `/k/v1/app/form/fields.json?app=801` found these current authentication fields:

```text
Employee_Code:SINGLE_LINE_TEXT (required)
Password_Hash:SINGLE_LINE_TEXT
Password_Algorithm:SINGLE_LINE_TEXT
Password_Changed_At:DATETIME
Force_Password_Change:DROP_DOWN
Account_Status:DROP_DOWN
Failed_Attempts:NUMBER
Locked_Until:DATETIME
Last_Login_At:DATETIME
Credential_Version:NUMBER
MFA_Enabled:DROP_DOWN
MFA_Enrolled_At:DATETIME
TOTP_Secret_Encrypted:SINGLE_LINE_TEXT
Recovery_Codes_Hashed:MULTI_LINE_TEXT
```

For the selected Kintone-only minimum UX, page-memory context is used, activation is not required, and password expiry is non-blocking. The old server activation/session manifest is not a schema requirement:

`KINTONE_SCHEMA_WRITE_REQUIRED = NO`

## App801 ACL reconciliation — 2026-08-27

Two additional read-only GETs established the current native App801 access boundary:

```text
APP801_APP_ACL_CURRENT =
  CREATOR:null: appEditable/view/add/edit/delete/import/export=true
  GROUP:everyone: appEditable/view/add/edit/delete/import/export=false
APP801_RECORD_ACL_CURRENT = NONE
```

The shared/common employee principal is covered by the exact `GROUP:everyone` rule shown above. It cannot read or update App801 records under the present ACL. There is no record-permission rule that changes this conclusion.

```text
SHARED_EMPLOYEE_CAN_READ_APP801 = NO
SHARED_EMPLOYEE_CAN_UPDATE_APP801 = NO
APP801_HASH_DIRECT_REST_EXPOSURE = NO
APP801_CREDENTIAL_DIRECT_REST_MUTATION_RISK = NO
KINTONE_ONLY_LOGIN_RUNTIME = BLOCKED_APP801_BROWSER_READ
KINTONE_ACL_CHANGE_REQUIRED = YES: a separately reviewed native App801 permission design must grant the shared employee browser the minimum required App801 access; this plan does not authorize or define that ACL change.
```

The browser-side WebCrypto adapter remains the later source plan only. Its PBKDF2-SHA256 format must stay compatible with `pbkdf2$100000$<saltHex>$<hashHex>`, but it cannot be implemented as a functional App801 browser login while current native App801 read is denied.

## Future deployment boundary

`KINTONE_CUSTOMIZATION_DEPLOY_REQUIRED = YES` after independent source review and separate explicit authorization. The exact customization files to deploy then are the rebuilt App794 bundle containing `src/main-mbo-app.js`, `src/ui/employee-part-a-ui.js`, and the new Kintone-only login-gate/adapter modules. `scripts/kintone/deploy-custom-ui.js` is the existing delivery path to review; it is not executed here.

`KINTONE_WRITES_EXECUTED = 0`

`KINTONE_DEPLOY_EXECUTED = 0`
