# AI ACTIVE TASK — D1 PASSWORD RESET CORE R1 ACCEPTED / HOLD

Mode: **CONTROL PLANE HOLD — NO ANTIGRAVITY EXECUTION / NO LIVE WRITE / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`

## Accepted Source Result

```text
R1_SOURCE_COMMIT        = e77c891407d5ccfa3d52401a28922f37a2b1b959
FEATURE                 = D1 MBO Password Reset Core
CANONICAL_SOURCE_OWNER  = src/ui/mbo-kintone-auth-adapter.js
FOCUSED_TEST            = tests/mbo-kintone-auth-adapter.test.js
GENERATED_DIST          = dist/mbo-employee-app.js
INDEPENDENT_CHATGPT_REVIEW = PASS
LIVE_WRITE              = NONE
DEPLOY                  = NONE
```

The accepted `resetMboPassword({ employeeCode })` source primitive:
- resets the temporary password to exact canonical `Employee_Code` using PBKDF2-SHA256 / 100000;
- sets `Force_Password_Change = YES`;
- resets `Failed_Attempts = 0` and clears temporary `Locked_Until`;
- increments positive-integer `Credential_Version` by exactly 1;
- clears all active App801 `Session_*` fields;
- preserves `Account_Status` by omitting it from the update payload;
- fails closed for missing/duplicate/malformed credential state;
- returns no password/hash/token/session secret.

## Review Notes

- Source implementation conforms to `CONFIRMED_BASELINE/D1_AUTH_SECURITY.md` for the R1 reset-core scope.
- Focused committed tests cover the required R1 contracts.
- Generated bundle contains the reviewed reset primitive matching the source implementation.
- GitHub commit status checks are not present for this commit; do not represent CI as independently proven.
- Antigravity modified Control Plane documents during execution even though the task did not authorize those document changes. ChatGPT normalized the documents during independent review. Future executors must not modify `AI_CONTROL_CENTER.md` or replace/close `AI_ACTIVE_TASK.md` unless explicitly instructed by the Control Plane.

## Accepted Live Baseline — UNCHANGED

```text
DEPLOYED_SOURCE_COMMIT = 9816cef195b6d3ffe039e5fb92c8dc8406c8967a
LIVE_REVISION          = 57
LIVE_JS_IDENTITY       = ac22a56cb9d78001384241fe12745f7a2da3da84
LIVE_CSS_IDENTITY      = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
CURRENT_LIVE_RUNTIME   = ACCEPTED KNOWN-GOOD
```

WP2 R3 remains CLOSED. No prior authorization may be reused.

## Hold / Next Boundary

R1 source PASS does **not** close D1 and does **not** authorize production password reset.

The next D1 reset stage still requires a new Control Plane task for the authorized HR + `admin-form` reset surface, including exact authority evidence, explicit target Employee_Code confirmation, user-visible success/failure behavior, deployment gate, Live read-back/UAT and prior-session invalidation proof.

Do NOT start that stage automatically.

Do NOT:
- perform Live Kintone writes;
- deploy App794/App800 customization;
- change App794/App800/App801 schema/layout/ACL/process;
- change App801 records;
- modify D7 Admin Support Center;
- revive Auth Bridge;
- reopen WP2 R3;
- execute D2-D7 automatically.

Maximum current status:
`D1_PASSWORD_RESET_CORE_R1_SOURCE_ACCEPTED_HOLD`
