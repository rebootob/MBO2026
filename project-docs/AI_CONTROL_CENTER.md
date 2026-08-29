# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual execution is required
> Updated: 2026-08-29

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|---|
| D1 | Login + Password Change + Employee-Self MBO Gate | 🟠 AUTH BRIDGE ARCHITECTURE PASS / PRIOR SOURCE GATES PASS / WP1 CORE CORRECTIVE REQUIRED / WP2 PENDING / LIVE CUTOVER BLOCKED |
| D2 | Excel + PDF legacy-format export | 🟠 IN PROGRESS |
| D3 | 8 legacy PMS apps -> App794 | 🟠 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | App800 HR Control Center end-to-end | 🟠 IN PROGRESS |
| D5 | Copy own previous MBO only | 🔴 MUST FIX |
| D6 | Integrated E2E / Security / Regression | 🔴 BLOCKED |
| D7 | Admin Support Center | ✅ SOURCE FUNCTIONALITY CLOSED / MODULE-AWARE BUNDLE DEPENDENCY CLOSURE ACCEPTED |

No AI may silently drop D1–D7.

## 2. Gate Ledger

```text
D1_AUTH_BRIDGE_ARCHITECTURE              = PASS / USER APPROVED + BASELINED
D1_BROWSER_DIRECT_APP801_AUTH             = SUPERSEDED / BLOCKED BY DESIGN
APP801_SHARED_PRINCIPAL_ACCESS            = DENIED / LIVE VERIFIED CB_NO02 FOR s1
APP801_EMPLOYEE_FACING_PRIVACY            = KEEP PRIVATE / NO ACL WIDENING
D1_SESSION_CONTINUITY_ARCHITECTURE        = PASS / UPDATED TO BRIDGE TRANSPORT
APP801_SESSION_SCHEMA_WRITE               = PASS / ACCEPTED
D1_CREATE_HANDLER_CORRECTIVE              = PASS
D1_EMPLOYEE_SELF_INDEX_SOURCE_TEST        = PASS
D1_EMPLOYEE_SELF_INDEX_VISUAL             = PASS
D1_MY_MBO_HISTORY_LIST                    = PASS
D1_MY_MBO_COMPLETED_STATUS_DISPLAY        = PASS
D1_EMPLOYEE_SELF_DELETE_GUARD             = PASS
D1_AUTH_BRIDGE_WP1_CORE                   = CORRECTIVE REQUIRED / SECURITY+COMPATIBILITY
D1_AUTH_BRIDGE_WP2_BROWSER_INTEGRATION    = BLOCKED UNTIL WP1 PASS
APP794_DELETE_PERMISSION_READONLY_CHECK   = PENDING
APP794_DEPLOY_GUARD_INTEGRATION           = OPEN / AFTER BRIDGE SOURCE INTEGRATION
D1_LIVE_CUTOVER                           = BLOCKED
D2-D7 LIVE WRITES                         = NOT AUTHORIZED unless separately recorded
```

No App794 deploy, App801 ACL widening, Auth Bridge live deployment, production secret creation, or live Kintone Bridge call is authorized.

## 3. Independent Review — Auth Bridge WP1 Executor Commit

Task base:
`4ff83744bdfe18341423fc06bc57438f8d7d77b4`

Executor:
`c7dfd9a4b197be56ce676506b75674b7a0d93bd7`

Exactly one executor commit is ahead.

Accepted direction:
- dedicated `services/mbo-auth-bridge/` Node.js 20 package;
- modules separated by repository/auth/session/ticket/router/rate-limit/config responsibility;
- no App794 browser integration or dist change;
- no live Kintone URL/secret introduced;
- root test command includes Bridge tests;
- router implements required endpoint names, no-store headers, CORS boundary and rate-limit boundary;
- repository has no effective record create/delete operation.

### Blocking findings

1. **PBKDF2 compatibility is broken.**
   Existing App801 format stores `saltHex` but PBKDF2 uses the decoded salt bytes. Bridge currently passes the hex text itself to `crypto.pbkdf2`, so existing App801 passwords will not verify. Current test only hashes and verifies with the same incorrect Bridge implementation and does not prove compatibility with the existing browser/App801 algorithm.

2. **App801 session field contract is wrong/incomplete.**
   Baseline fields are `Session_Token_Hash`, `Session_Issued_At`, `Session_Expires_At`, `Session_Credential_Version`, `Session_Kintone_User`. Bridge uses non-existent `Session_Kintone_User_Code`, omits issued-at and session credential version, and therefore cannot use the accepted live App801 schema correctly.

3. **Session identity/validation violates the approved trust model.**
   `/session/validate` currently requires client-supplied `employeeCode` and looks up by Employee_Code. Baseline requires Bridge to hash the raw token, resolve exactly one App801 row by `Session_Token_Hash`, derive Employee_Code server-side, then validate account/expiry/credential-version/Kintone context. Current implementation also does not check `Session_Credential_Version == Credential_Version`.

4. **Logout/password lifecycle trusts client identity too much.**
   Logout revokes by `employeeCode` without validating the presented session token, allowing arbitrary session revocation by known Employee_Code. Normal password change also takes Employee_Code from the browser instead of deriving identity from the validated session. Force-change must derive identity from the signed ticket and must not re-enable DISABLED/LOCKED accounts.

5. **Credential parsing is not fail-closed.**
   Repository defaults missing `Account_Status` to ACTIVE, missing Force Change to NO, and invalid/missing Credential_Version to 1. It also trims/accepts Employee_Code without the canonical `/^[A-Za-z0-9_.-]+$/` validation, creating query-injection/identity-normalization risk. Existing adapter requires exact non-trimmed valid code and malformed state must fail closed.

6. **Temporary lockout semantics changed.**
   5 failed attempts should set temporary `Locked_Until` while permanent `Account_Status=LOCKED` always denies. WP1 currently sets `Account_Status=LOCKED` on the 5th failure and later can auto-reactivate it after expiry, conflating permanent and temporary lock states.

7. **Runtime/config fail-closed gaps.**
   TicketService contains a default signing secret; Router/config default CORS to `*`; config does not validate mandatory runtime values; router can return raw internal `err.message`; service package has `start: node src/server.js` but no `server.js` exists in WP1.

8. **Mandatory tests are incomplete.**
   Current tests do not prove a legacy PBKDF2 vector, force-ticket version mismatch, token-hash session lookup, session credential-version mismatch, exact live field codes, permanent-vs-temporary lock behavior, logout token ownership, malformed credential fail-closed, or sanitized internal error handling.

GitHub has no CI/status checks for this commit. Do not claim independent runtime test PASS from GitHub.

## 4. Exact Next Action

```text
NEXT_ACTION_OWNER              = Antigravity
ANTIGRAVITY_REQUIRED           = YES — ONE WP1 CORE CORRECTIVE
KINTONE_LIVE_READ_WRITE        = NO
APP794_DEPLOY                  = NO
APP801_ACL_WRITE               = NO
APP801_RECORD_WRITE            = NO
AUTH_BRIDGE_LIVE_DEPLOY        = NO
PRODUCTION_SECRET_CREATION     = NO
BROWSER_INTEGRATION            = NO
DEPLOY_GUARD_FIX               = NO IN THIS PACKAGE
D2_D7_WRITE                    = NO
MAX_EXECUTOR_STATUS            = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

After WP1 corrective PASS:
1. WP2 Browser Integration;
2. independent review;
3. App794 Delete-permission readback + Deploy Guard Integration;
4. exact live Bridge hosting/secret/deploy authorization;
5. one combined App794 corrective deploy + final D1 UAT.

## 5. Reusable Lessons

- PBKDF2 serialized salt text and PBKDF2 salt bytes are not interchangeable; compatibility tests must use an independent legacy vector.
- Session bearer token validation must resolve identity server-side from token hash; browser-supplied Employee_Code is not identity proof.
- Permanent account lock and temporary failed-attempt lockout are separate states.
- Credential repositories must fail closed on malformed security fields; never default missing security state to permissive values.
- Server-side auth errors returned to browsers must be normalized and sanitized.
