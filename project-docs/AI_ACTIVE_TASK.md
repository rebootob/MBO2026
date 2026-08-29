# AI ACTIVE TASK — D1 PASSWORD RESET CORE R1 / SOURCE-ONLY COMPLETED

Mode: **SOURCE EXECUTION COMPLETED — NO LIVE WRITE / PENDING CHATGPT REVIEW**  
Branch: `ai/antigravity-wp002c`  

## 1. Summary of Completed Implementation

Implemented `resetMboPassword({ employeeCode })` primitive in `MboKintoneAuthAdapter` (`src/ui/mbo-kintone-auth-adapter.js`) and added 8 focused test suites (10 test assertions) in `tests/mbo-kintone-auth-adapter.test.js`:

1. **Exact App801 update payload:**
   - `Password_Hash`: `pbkdf2$100000$<saltHex>$<hashHex>` generated for exact `Employee_Code`
   - `Force_Password_Change`: `YES`
   - `Failed_Attempts`: `0`
   - `Locked_Until`: `null`
   - `Credential_Version`: `cred.credentialVersion + 1`
   - `Session_Token_Hash`: `null`
   - `Session_Issued_At`: `null`
   - `Session_Expires_At`: `null`
   - `Session_Credential_Version`: `null`
   - `Session_Kintone_User`: `null`
   - `Password_Changed_At`: `now().toISOString()`
2. **Safety & Fail-Closed Rules:**
   - `Account_Status` is absent from update payload (preserves `ACTIVE`, `LOCKED`, or `DISABLED`).
   - Permanent `LOCKED` or `DISABLED` credential remains `LOCKED` or `DISABLED` after reset (subsequent login is denied).
   - Temporary `Locked_Until` on `ACTIVE` account is cleared (`null`).
   - Missing credential, duplicate credential, or malformed `Credential_Version` fails closed with `{ status: 'CREDENTIAL_DENIED', reason: ... }` and zero updates.
   - Return object `{ status: 'PASSWORD_RESET', employeeCode }` contains zero password/hash/token/session secrets.
   - Supported canonical `Employee_Code` formats (`50.03`, `50.02`, `0050_2`) work properly.
   - Malformed/spaced `Employee_Code` rejects cleanly with 0 API calls.

## 2. Verification Results

```text
node --test tests/mbo-kintone-auth-adapter.test.js                             = 40/40 PASS
node --test tests/mbo-session-manager.test.js tests/mbo-kintone-login-gate.test.js = 39/39 PASS
npm run ui:build                                                                = PASS
node --test tests/classic-bundle.test.js tests/safety-guard.test.js            = 223/223 PASS
```

## 3. Current Status & Ceiling

Status: **`D1_PASSWORD_RESET_CORE_R1_IMPLEMENTED_PENDING_CHATGPT_REVIEW`**

## 4. Strictly Forbidden

- NO Live Kintone POST/PUT/DELETE
- NO deploy
- NO ACL/schema/layout/process modifications
- NO modification to `src/services/mbo-password-service.js`
- NO modification to `services/mbo-auth-bridge/`
- NO reopening of WP2 R3
- NO self-certify PASS
