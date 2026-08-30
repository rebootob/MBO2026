# AI ACTIVE TASK — D1 APP800 PASSWORD RESET ADMIN UI SOURCE R1

Mode: **ANTIGRAVITY SOURCE / FOCUSED TEST / LOCAL BUILD ONLY — NO LIVE WRITE / NO ACL WRITE / NO DEPLOY / NO PASSWORD RESET EXECUTION**  
Branch: `ai/antigravity-wp002c`

## 1. Why This Task Exists

Native authority is now ready for both required administrative paths:

```text
admin-form                         = READY
HR_ADMIN_GROUP                     = READY
App800 HR_ADMIN_GROUP View         = YES
App801 HR_ADMIN_GROUP View/Edit    = YES / YES
App801 HR Add/Delete/Admin/Import/Export = NO
```

The reset engine already exists in `src/ui/mbo-kintone-auth-adapter.js` as:
`MboKintoneAuthAdapter.resetMboPassword({ employeeCode })`.

The missing D1/D4 gap is the production administrative surface in App800. Implement source/tests/build only. Do not execute a real password reset and do not deploy.

## 2. Canonical Owners

```text
FEATURE                  = App800 MBO Password Reset administrative UI
CANONICAL_SOURCE_OWNER   = src/ui/hr-control-center.js
SUPPORTING_STYLE_OWNER   = src/styles/hr-control-center.css
RESET_CORE_OWNER         = src/ui/mbo-kintone-auth-adapter.js (REUSE; do not duplicate)
APP800_BUILD_OWNER       = dedicated minimal App800 build entrypoint
GENERATED_DIST_OUTPUT    = dist/hr-control-center-bundle.js + dist/hr-control-center.css
LIVE_RESOURCE            = App800 customization (NOT AUTHORIZED IN THIS TASK)
```

Do not move this feature into App794 `src/main-mbo-app.js`.
Do not hand-edit generated dist.
Do not change the accepted reset core unless a focused test proves a real core defect; if that happens STOP and report instead of widening scope.

## 3. Required UI Contract

Add one clearly separated section inside App800 HR Control Center:

```text
รีเซ็ตรหัสผ่าน MBO / Reset MBO Password
```

Required behavior:

1. Input exact `Employee_Code`.
2. Require a second explicit confirmation value equal to the exact same `Employee_Code` before any write-capable function can be invoked.
3. Provide one explicit action button, e.g. `Reset MBO Password`.
4. Empty/invalid/mismatched confirmation = visible validation error and **zero reset-core calls**.
5. On valid confirmation, invoke the existing `resetMboPassword({employeeCode})` **exactly once per user action**.
6. Disable/prevent duplicate clicks while a reset request is in progress.
7. Success feedback must be clear and bilingual enough for HR to understand:
   - selected Employee_Code was reset;
   - temporary password follows the canonical Employee_Code rule;
   - employee must change password on next login.
8. Failure feedback must be visible and fail closed for missing/duplicate/malformed credential, permission failure, or technical error.
9. Never display/log/return `Password_Hash`, salt, session token/hash, or other credential/session secret.
10. No bulk reset.
11. No credential create/delete.
12. No account enable/unlock shortcut. `Account_Status` remains untouched by the UI/core contract.

## 4. Authority / Security Contract

Do **not** hard-code an HR username.
Do **not** use UI hiding as the security boundary.

Native App800 ACL is the primary administrative access boundary:
- `HR_ADMIN_GROUP` can View App800;
- `admin-form` remains CREATOR/technical recovery;
- `GROUP:everyone` remains denied.

Because App800 is already natively restricted to authorized administrative principals, the source does not need a fragile browser-only username allowlist. If any optional UI-level guard is added, it must be additive/fail-closed and must not replace native ACL.

Do not call User API/group membership endpoints from the Reset button merely to re-authorize a user if App800 native access has already admitted them.

## 5. Integration Requirements

Reuse the current App800 runtime and current dashboard behavior; do not rewrite the HRCC broadly.

The reset UI may be implemented as a small panel/card in `renderHrControlCenterHtml()` plus event binding in the App800 runtime.

Inject/reuse dependencies so focused tests can pass a fake reset adapter/function without Kintone network calls.

Preferred narrow shape:
- App800 runtime receives a reset function/adapter dependency;
- browser registration constructs `MboKintoneAuthAdapter` using the existing Kintone API wrapper pattern;
- tests can substitute a spy/fake reset function.

Do not duplicate PBKDF2/session/reset semantics in `hr-control-center.js`.

## 6. App800 Build Requirement

Current repository build path is App794-only. Establish the **smallest dedicated reproducible App800 build entrypoint** needed to bundle:

`src/ui/hr-control-center.js` -> `dist/hr-control-center-bundle.js`

and copy/normalize:

`src/styles/hr-control-center.css` -> `dist/hr-control-center.css`

Requirements:
- browser IIFE/classic bundle;
- ES2020 target or existing repository-compatible target;
- no runtime `import`/`export` residue;
- no network needed for build;
- deterministic output from exact source HEAD;
- do not modify the App794 build/deploy path except shared helper extraction only if strictly necessary and smaller/safer than duplication.

A dedicated `scripts/kintone/build-hrcc-ui.js` is acceptable because App800 is a separate canonical feature owner. Do **not** create an App800 deploy script in this WP.

## 7. Focused Tests Required

Add/extend focused tests only for this feature. Cover at minimum:

1. Reset panel renders in App800 HRCC.
2. Empty Employee_Code -> blocked, zero reset calls.
3. Invalid Employee_Code -> blocked, zero reset calls.
4. Confirmation mismatch -> blocked, zero reset calls.
5. Valid exact confirmation -> reset core called exactly once with exact Employee_Code.
6. Double-click/in-flight repeat -> no duplicate reset execution.
7. Success result -> visible success state with Employee_Code and forced-change instruction.
8. `CREDENTIAL_DENIED` / missing / duplicate / malformed / thrown technical failure -> visible fail-closed error.
9. UI never renders password hash, salt, token, token hash, or session secrets.
10. Existing HRCC monitoring/filter/dashboard behavior remains intact.
11. Local App800 build succeeds and generated JS parses as classic script with zero import/export residue.
12. `git diff --check` PASS.

If an existing HRCC-focused test file exists, extend it. Otherwise one focused new test file is acceptable; do not scatter tests across multiple new files.

## 8. Forbidden

```text
APP800_RECORD_WRITE_RUNTIME       = 0
APP801_RECORD_WRITE_RUNTIME       = 0
APP794_RECORD_WRITE_RUNTIME       = 0
PASSWORD_RESET_EXECUTION          = 0
APP800_APP_ACL_WRITE              = 0
APP801_APP_ACL_WRITE              = 0
GROUP_MEMBERSHIP_WRITE            = 0
SCHEMA_LAYOUT_PROCESS_WRITE       = 0
CUSTOMIZATION_UPLOAD              = 0
DEPLOY                            = 0
ROLLBACK                          = 0
POST_TO_KINTONE                   = 0
PUT_TO_KINTONE                    = 0
DELETE_TO_KINTONE                 = 0
```

Local source/test/dist writes and local build are allowed.
Do not modify Control Center, Active Task, baselines, or skills.
Do not revive `services/mbo-auth-bridge/`.
Do not refactor unrelated App794/D2/D3/D5 work.

## 9. Evidence / Completion

Create one concise evidence file:
`project-docs/D1_APP800_PASSWORD_RESET_UI_SOURCE_R1_EVIDENCE.md`

It must record:
- starting HEAD;
- exact files changed;
- tests executed + pass counts;
- App800 build command/result;
- generated JS/CSS Git blob identities;
- classic bundle/import-export checks;
- `git diff --check` result;
- Kintone GET/POST/PUT/DELETE/upload/deploy/password-reset counts (all Kintone mutation counts must be 0);
- `STATUS = PENDING_CHATGPT_REVIEW`.

Commit + push source/tests/build script/generated dist/evidence together as one focused implementation commit if practical, then STOP.

Maximum executor status:
`D1_APP800_PASSWORD_RESET_UI_SOURCE_R1_READY_PENDING_CHATGPT_REVIEW`

## 10. Safety State

```text
APP794_ACCEPTED_LIVE_REVISION          = 60
APP800_NATIVE_HR_AUTHORITY             = READY
APP801_NATIVE_HR_RESET_AUTHORITY       = READY
ADMIN_FORM_RESET_AUTHORITY             = READY
ACTIVE_ACL_WRITE_AUTH                  = NONE
ACTIVE_DEPLOY_AUTH                     = NONE
ACTIVE_KINTONE_WRITE_AUTH              = NONE
ROLLBACK_AUTH                           = NONE
NEXT_OWNER_AFTER_EXECUTION              = CHATGPT INDEPENDENT REVIEW
```
