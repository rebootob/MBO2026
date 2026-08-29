# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual execution is required
> Updated: 2026-08-29 — APP794 ATTACHMENT LONG-FILENAME UI SOURCE REVIEW PASS / DEPLOY AUTHORIZATION REQUIRED

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|---|
| D1 | Login + Password Change + Employee-Self MBO Gate | 🟠 KINTONE-ONLY / App794 customization rev49 / form schema rev48 / Timeline truthfulness PASS / Objective FILE schema corrective PASS / attachment persistence corrective source+deploy PASS / user reports attachment save/edit working / **long-filename delete-control UI corrective source+test independently reviewed PASS; Live deployment not authorized** / HR+admin reset UI open / remaining security UAT open |
| D2 | Excel + PDF legacy-format export | 🟠 IN PROGRESS |
| D3 | 8 legacy PMS apps -> App794 | 🟠 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | App800 HR Control Center end-to-end | 🟠 IN PROGRESS |
| D5 | Copy own previous MBO | 🔴 MUST FIX / NOT CLOSED |
| D6 | Integrated E2E / Security / Regression | 🔴 BLOCKED UNTIL CONSTITUENT WORK IS READY |
| D7 | Admin Support Center | ✅ SOURCE FUNCTIONALITY CLOSED / REOPEN ONLY ON NEW DEFECT |

No AI may silently drop D1–D7.

## 2. Accepted State

```text
D1_ARCHITECTURE                    = KINTONE-ONLY
EXTERNAL_SERVER_SERVICE            = FORBIDDEN
AUTH_BRIDGE                        = CANCELLED / DO NOT IMPLEMENT
APP794_LIVE_CUSTOMIZATION_REVISION = 49
APP794_LIVE_FORM_REVISION          = 48
OBJECTIVE_ATTACHMENT_FIELDS        = FILE 10/10 — PASS
MIDYEAR_ATTACHMENT_FIELDS          = FILE 10/10 — PASS
FINAL_ATTACHMENT_FIELDS            = FILE 10/10 — PASS
EDIT_ATTACHMENT_SOURCE_CORRECTIVE  = PASS
EDIT_ATTACHMENT_DEPLOYMENT         = PASS / REV49
EDIT_ATTACHMENT_DEPLOY_AUTH        = CONSUMED / CLOSED
LONG_FILENAME_UI_SOURCE_REVIEW      = PASS
LONG_FILENAME_UI_REVIEWED_CANDIDATE = 1abd434ab6c4ce04a6f1e5c2fdbaa9a94f75e502
LONG_FILENAME_UI_DEPLOY_AUTH        = NONE
SOURCE_MODULARITY_POLICY            = MANDATORY
```

Do not reopen the Objective FILE schema or attachment persistence architecture without new evidence.

## 3. User-Observed UI Defect

On App794 rev49 attachment persistence is user-reported working, but long attachment filenames can overflow the narrow Attach File column and hide the trailing delete control. This is a presentation/layout defect only; no evidence required persistence/service changes.

## 4. Independent Source Review — PASS

Reviewed candidate:
`1abd434ab6c4ce04a6f1e5c2fdbaa9a94f75e502`

Independent findings:
- canonical branch moved exactly one executor commit after source task HEAD `62a19bc05300a6ef4c76f62e7a5942ada939a61c`;
- changed files are limited to allowed renderer/CSS/test/generated dist/evidence files;
- `src/services/mbo-attachment-service.js` unchanged;
- `src/main-mbo-app.js` unchanged;
- saved/pending/error attachment rows now use full-width bounded flex layout with `width/max-width:100%`, `min-width:0`, and border-box containment;
- filename region is shrinkable and ellipsizes while preserving the full filename in `title`;
- delete control is a separate `flex:0 0 auto` / `flex-shrink:0` item with minimum width;
- multiple attachments stack vertically instead of forming a wide horizontal chain;
- pending/error status text is also shrinkable and cannot take the delete control's fixed flex allocation;
- Add File remains present;
- shared renderer covers Objective and Mid-Year and the existing Self→Final fallback remains unchanged;
- no table-wide widening or attachment data mutation was introduced.

Executor evidence reports:

```text
FOCUSED_ATTACHMENT_TESTS = PASS 45/45
FULL_NPM_TEST            = PASS 897/897
NPM_RUN_UI_BUILD         = PASS
MODULE_AWARE_BUILD_ONLY  = PASS / 0 Kintone network calls
LIVE_KINTONE_WRITE       = 0
LIVE_DEPLOY_OCCURRED     = NO
```

GitHub exposes no CI status checks for the candidate, so the reported test/build runs are executor evidence rather than independent CI.

Non-blocking review note: the newly named Objective/Mid-Year/Final regression test populates `Self_Attachment_1` rather than directly populating `Final_Attachment_1`; however the existing renderer's Self→Final saved-file fallback is unchanged and the layout contract is field-agnostic, so this does not block the narrow UI source candidate.

Independent verdict:

```text
LONG_FILENAME_UI_SOURCE_CORRECTIVE = PASS
REVIEWED_CANDIDATE                 = 1abd434ab6c4ce04a6f1e5c2fdbaa9a94f75e502
LIVE_DEPLOYMENT                    = NOT AUTHORIZED
```

## 5. Exact Current Gate

```text
CURRENT_GATE                  = D1 APP794 ATTACHMENT LONG-FILENAME UI — DEPLOY AUTH HOLD
CURRENT_MODE                  = CONTROL PLANE HOLD
NEXT_ACTION_OWNER             = USER
REVIEWED_CANDIDATE            = 1abd434ab6c4ce04a6f1e5c2fdbaa9a94f75e502
SOURCE CHANGE                 = NO FURTHER CHANGE
APP794 CUSTOMIZATION DEPLOY   = NO — NEW EXPLICIT ONE-SHOT AUTHORIZATION REQUIRED
APP794 FORM/SCHEMA/LAYOUT     = NO WRITE
APP794 RECORD WRITE           = NO LIVE WRITE
APP794 ACL/PROCESS            = NO
APP801                        = NO
APP795/796                    = NO
ROUTING/SCORING/AUTH/RESET    = NO
D2-D7 EXECUTION               = NO
EXTERNAL SERVICE/STORAGE      = NO
```

Prior authorization `APP794-D1-EDIT-ATTACHMENT-DEPLOY-20260829-01` is consumed/closed and cannot be reused.

## 6. Required Live Verification After Any Future Authorized Deploy

Verify through normal App794 UI:

```text
UAT_UI_01 long saved filename remains inside cell and shows ellipsis
UAT_UI_02 delete ✕ remains visible at right edge
UAT_UI_03 multiple long saved filenames stack and every delete ✕ remains visible
UAT_UI_04 pending long filename remains contained
UAT_UI_05 saved remove still removes only selected file after Save
UAT_UI_06 Objective / Mid-Year / Final(Self) visual regression
UAT_UI_07 attachment persistence regression remains working
```

Do not call the Live UI defect closed until a separately authorized deployment is independently reviewed and user Live UAT passes.
