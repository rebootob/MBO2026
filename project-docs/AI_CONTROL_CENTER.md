# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual execution is required
> Updated: 2026-08-29 — APP794 ATTACHMENT LONG-FILENAME UI ONE-SHOT DEPLOY AUTHORIZED

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|---|
| D1 | Login + Password Change + Employee-Self MBO Gate | 🟠 KINTONE-ONLY / App794 customization rev49 / form schema rev48 / Timeline truthfulness PASS / Objective FILE schema corrective PASS / attachment persistence corrective source+deploy PASS / user reports attachment save/edit working / **long-filename delete-control UI corrective source+test independently reviewed PASS; exact one-shot App794 customization deploy now authorized** / HR+admin reset UI open / remaining security UAT open |
| D2 | Excel + PDF legacy-format export | 🟠 IN PROGRESS |
| D3 | 8 legacy PMS apps -> App794 | 🟠 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | App800 HR Control Center end-to-end | 🟠 IN PROGRESS |
| D5 | Copy own previous MBO | 🔴 MUST FIX / NOT CLOSED |
| D6 | Integrated E2E / Security / Regression | 🔴 BLOCKED UNTIL CONSTITUENT WORK IS READY |
| D7 | Admin Support Center | ✅ SOURCE FUNCTIONALITY CLOSED / REOPEN ONLY ON NEW DEFECT |

No AI may silently drop D1–D7.

## 2. Accepted State

```text
D1_ARCHITECTURE                     = KINTONE-ONLY
EXTERNAL_SERVER_SERVICE             = FORBIDDEN
AUTH_BRIDGE                         = CANCELLED / DO NOT IMPLEMENT
APP794_LIVE_CUSTOMIZATION_REVISION  = 49
APP794_LIVE_FORM_REVISION           = 48
OBJECTIVE_ATTACHMENT_FIELDS         = FILE 10/10 — PASS
MIDYEAR_ATTACHMENT_FIELDS           = FILE 10/10 — PASS
FINAL_ATTACHMENT_FIELDS             = FILE 10/10 — PASS
EDIT_ATTACHMENT_SOURCE_CORRECTIVE   = PASS
EDIT_ATTACHMENT_DEPLOYMENT          = PASS / REV49
EDIT_ATTACHMENT_DEPLOY_AUTH         = CONSUMED / CLOSED
LONG_FILENAME_UI_SOURCE_REVIEW      = PASS
LONG_FILENAME_UI_REVIEWED_CANDIDATE = 1abd434ab6c4ce04a6f1e5c2fdbaa9a94f75e502
LONG_FILENAME_UI_DEPLOY_AUTH         = AUTHORIZED / ONE-SHOT / UNCONSUMED
SOURCE_MODULARITY_POLICY             = MANDATORY
```

Do not reopen the Objective FILE schema or attachment persistence architecture without new evidence.

## 3. Reviewed Long-Filename UI Candidate

Reviewed candidate:
`1abd434ab6c4ce04a6f1e5c2fdbaa9a94f75e502`

Accepted properties:
- attachment rows remain within Attach File cell width;
- filename region uses shrinkable ellipsis with full filename preserved in `title`;
- delete `✕` is a separate non-shrinking flex control;
- multiple attachment rows stack vertically;
- saved/pending/error states share the corrected containment contract;
- Add File remains usable;
- Objective/Mid-Year/shared Self→Final renderer path preserved;
- attachment persistence service and main attachment orchestration unchanged.

Executor verification previously reviewed:

```text
FOCUSED_ATTACHMENT_TESTS = PASS 45/45
FULL_NPM_TEST            = PASS 897/897
NPM_RUN_UI_BUILD         = PASS
MODULE_AWARE_BUILD_ONLY  = PASS / 0 Kintone network calls
LIVE_KINTONE_WRITE       = 0
LIVE_DEPLOY_OCCURRED     = NO
```

GitHub exposes no CI status checks for the candidate; the above test/build results are executor evidence, not independent CI.

## 4. Exact New User Authorization

User explicitly authorized:

`อนุมัติ App794 deploy Attachment Long-Filename UI corrective candidate 1abd434`

Authorization ID:
`APP794-D1-LONG-FILENAME-UI-DEPLOY-20260829-01`

Authorization scope is exact and one-shot:

```text
TARGET_APP                     = 794
WRITE_TYPE                     = APP CUSTOMIZATION JS/CSS ONLY
REVIEWED_CANDIDATE             = 1abd434ab6c4ce04a6f1e5c2fdbaa9a94f75e502
PRE_DEPLOY_BACKUP              = REQUIRED
PREFLIGHT                      = REQUIRED
UI_BUILD                       = REQUIRED
MODULE_AWARE_BUILD_ONLY        = REQUIRED / 0 KINTONE CALLS
CUSTOMIZATION_READBACK         = REQUIRED
DEPLOYED_BUNDLE_MATCH          = REQUIRED
ROLLBACK_SNAPSHOT              = REQUIRED BEFORE WRITE
SOURCE CHANGE                  = FORBIDDEN DURING DEPLOY
SCHEMA/LAYOUT WRITE            = FORBIDDEN
BUSINESS RECORD WRITE          = FORBIDDEN
ACL/PROCESS WRITE              = FORBIDDEN
APP801 WRITE                   = FORBIDDEN
APP795/796 WRITE               = FORBIDDEN
ROUTING/SCORING/AUTH/RESET     = FORBIDDEN
D2-D7 EXECUTION                = FORBIDDEN
EXTERNAL SERVICE/STORAGE       = FORBIDDEN
```

Any candidate/source/dist drift before the actual customization write => STOP. Do not repair or widen scope under this authorization.

Prior deployment authorization `APP794-D1-EDIT-ATTACHMENT-DEPLOY-20260829-01` remains consumed/closed and cannot be reused.

## 5. Exact Current Gate

```text
CURRENT_GATE                  = D1 APP794 ATTACHMENT LONG-FILENAME UI — AUTHORIZED ONE-SHOT DEPLOY
CURRENT_MODE                  = ANTIGRAVITY EXACT AUTHORIZED DEPLOY ONLY
NEXT_ACTION_OWNER             = ANTIGRAVITY / EXACT ACTIVE TASK ONLY
AUTHORIZATION_ID              = APP794-D1-LONG-FILENAME-UI-DEPLOY-20260829-01
REVIEWED_CANDIDATE            = 1abd434ab6c4ce04a6f1e5c2fdbaa9a94f75e502
SOURCE CHANGE                 = NO
APP794 CUSTOMIZATION DEPLOY   = YES — EXACT ONE-SHOT ONLY
APP794 FORM/SCHEMA/LAYOUT     = NO WRITE
APP794 RECORD WRITE           = NO
APP794 ACL/PROCESS            = NO
APP801                        = NO
APP795/796                    = NO
ROUTING/SCORING/AUTH/RESET    = NO
D2-D7 EXECUTION               = NO
EXTERNAL SERVICE/STORAGE      = NO
```

After one deploy attempt, successful or rolled back, this authorization is consumed and Antigravity must STOP for ChatGPT independent review.

## 6. Required Live Verification After Independent Deployment Review PASS

Verify through normal App794 UI:

```text
UAT_UI_01 long saved filename remains inside cell and shows ellipsis
UAT_UI_02 delete ✕ remains visible at right edge
UAT_UI_03 multiple long saved filenames stack and every delete ✕ remains visible
UAT_UI_04 pending/error long filename remains contained
UAT_UI_05 saved remove still removes only selected file after Save
UAT_UI_06 Objective / Mid-Year / Final(Self) visual regression
UAT_UI_07 attachment persistence regression remains working
```

Do not call the Live UI defect closed until deployment provenance is independently reviewed and user Live UAT passes.
