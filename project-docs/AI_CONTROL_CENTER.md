# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/` and reusable lessons live in `skills/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual local/runtime execution is required
> Updated: 2026-08-30 — D1 PASSWORD RESET ADMIN SURFACE AUTHORITY/BINDING DISCOVERY OPEN

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|
| D1 | 🟠 **OVERALL IN PROGRESS.** App794 Rev60 remains accepted known-good. Next confirmed D1 gap is the production HR / `admin-form` MBO Password Reset administrative surface: reset core exists and is tested, but production UI/authority binding is not yet closed. |
| D2 | 🟠 Excel + PDF legacy-format export IN PROGRESS |
| D3 | 🟠 8 legacy PMS -> App794 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | 🟠 App800 HR Control Center IN PROGRESS; current source is a secure READ-ONLY MVP and the Password Reset administrative surface is a shared D1/D4 gap. |
| D5 | 🟠 Copy own previous MBO IN PROGRESS / future focused task |
| D6 | 🔴 Integrated E2E / Security / Regression pending |
| D7 | ✅ Admin Support Center source functionality CLOSED; reopen only on a new proven defect. |

## 2. Accepted App794 Baseline — Do Not Reopen

```text
LIVE_REVISION                 = 60
PREVIEW_REVISION              = 60
ACCEPTED_SOURCE_COMMIT        = 1ed342ad137a4a364496a28d29bdffd24a99b511
ACCEPTED_JS_IDENTITY          = 115a08ace32bdf850cb5eebf25b953d1803114d0
ACCEPTED_CSS_IDENTITY         = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
SCOPE                         = ALL
TOPOLOGY                      = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
REV60_USER_UAT                = PASS
```

The fatal duplicate-Create Back/popup corrective is CLOSED.

## 3. Confirmed D1 Password Reset Gap

Baseline requires a production MBO Password Reset function for:
- HR-authorized users;
- `admin-form` technical recovery;
- never employee/shared principals.

Reset core already exists in `MboKintoneAuthAdapter.resetMboPassword({employeeCode})` and has focused tests for the required credential semantics. Current App800 source `src/ui/hr-control-center.js` is a GET-only/read-only HR dashboard and contains no production reset UI.

Frozen HR Control Center architecture says App800 HR access should use native Kintone group/role permission `HR_ADMIN_GROUP`. Before implementing a write-capable reset UI, actual Live App800 authority and customization binding must be verified; do not guess or hard-code HR usernames.

## 4. Current Active Task

```text
ACTIVE_TASK                   = D1 PASSWORD RESET ADMIN SURFACE — APP800 AUTHORITY & CUSTOMIZATION BINDING DISCOVERY
OWNER                         = ANTIGRAVITY
MODE                          = READ-ONLY DISCOVERY / GET ONLY
SOURCE_CHANGE                 = NO
KINTONE_WRITE                 = NO
DEPLOY                        = NO
PASSWORD_RESET_EXECUTION      = NO
```

Discovery must establish:
1. actual App800 Live + Preview customization topology, entry names and available file identities;
2. whether current `src/ui/hr-control-center.js` / `src/styles/hr-control-center.css` correspond to deployed App800 customization;
3. actual App800 app permission rows relevant to `HR_ADMIN_GROUP`, `admin-form`, shared employee/access principals, and `GROUP:everyone`;
4. whether `HR_ADMIN_GROUP` exists/is the actual native authority boundary in the current tenant;
5. how `admin-form` is currently granted App800 access/recovery authority;
6. the correct build/deploy path for future App800 customization, because the standard `npm run ui:build` targets App794 only.

If any item cannot be proven read-only, report UNKNOWN rather than inventing it.

## 5. Authorization Ledger / Safety

```text
LATEST_DEPLOY_AUTH            = APP794-R4-1-NATIVE-CANCEL-DEPLOY-20260830-01 — CONSUMED / CLOSED / NEVER REUSE
ACTIVE_LIVE_AUTH              = NONE
ACTIVE_KINTONE_WRITE_AUTH     = NONE
ACTIVE_DEPLOY_AUTH            = NONE
ROLLBACK_AUTH                 = NONE
```

No App800/App801/App794 record write, customization update, deploy, ACL update, schema/layout/process update, password reset, or rollback is authorized.

## 6. Current Gate

```text
CURRENT_GATE                  = D1 PASSWORD RESET AUTHORITY/BINDING DISCOVERY
CURRENT_MODE                  = READ-ONLY
NEXT_OWNER                    = ANTIGRAVITY FOR EXACT ACTIVE TASK
EXPECTED_NEXT                 = CHATGPT REVIEW -> NARROW SOURCE WP FOR APP800 PASSWORD RESET UI IF DISCOVERY PASSES
```
