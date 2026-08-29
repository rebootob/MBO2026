# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual execution is required
> Updated: 2026-08-29 — APP794 LONG-FILENAME UI DEPLOYMENT INDEPENDENT REVIEW PASS / USER LIVE UAT REQUIRED

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|---|
| D1 | Login + Password Change + Employee-Self MBO Gate | 🟠 KINTONE-ONLY / App794 customization rev50 / form schema rev48 / Timeline truthfulness PASS / Objective FILE schema corrective PASS / attachment persistence corrective source+deploy PASS / user reports attachment save/edit working / **long-filename delete-control UI source+test PASS and authorized rev50 deployment independently reviewed PASS; user Live UI UAT required** / HR+admin reset UI open / remaining security UAT open |
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
APP794_LIVE_CUSTOMIZATION_REVISION  = 50
APP794_LIVE_FORM_REVISION           = 48
OBJECTIVE_ATTACHMENT_FIELDS         = FILE 10/10 — PASS
MIDYEAR_ATTACHMENT_FIELDS           = FILE 10/10 — PASS
FINAL_ATTACHMENT_FIELDS             = FILE 10/10 — PASS
EDIT_ATTACHMENT_SOURCE_CORRECTIVE   = PASS
EDIT_ATTACHMENT_DEPLOYMENT          = PASS / REV49
LONG_FILENAME_UI_SOURCE_REVIEW      = PASS
LONG_FILENAME_UI_REVIEWED_CANDIDATE = 1abd434ab6c4ce04a6f1e5c2fdbaa9a94f75e502
LONG_FILENAME_UI_DEPLOYMENT         = PASS / REV50
LONG_FILENAME_UI_DEPLOY_AUTH        = CONSUMED / CLOSED
SOURCE_MODULARITY_POLICY            = MANDATORY
```

Do not reopen the Objective FILE schema or attachment persistence architecture without new evidence.

## 3. Long-Filename UI Candidate

Reviewed candidate:
`1abd434ab6c4ce04a6f1e5c2fdbaa9a94f75e502`

Accepted source properties:
- each attachment row remains bounded to the Attach File cell;
- filename is shrinkable and ellipsizes while preserving the full `title` tooltip;
- delete `✕` is a separate non-shrinking control;
- multiple attachment rows stack vertically;
- saved/pending/error states share the corrected layout contract;
- Add File remains usable;
- attachment persistence service and main attachment orchestration unchanged.

Executor source evidence previously reviewed:

```text
FOCUSED_ATTACHMENT_TESTS = PASS 45/45
FULL_NPM_TEST            = PASS 897/897
NPM_RUN_UI_BUILD         = PASS
MODULE_AWARE_BUILD_ONLY  = PASS / 0 Kintone network calls
```

GitHub exposes no CI status checks for the candidate; these test/build runs are executor evidence rather than independent CI.

## 4. Deployment Independent Review — PASS

Authorization:
`APP794-D1-LONG-FILENAME-UI-DEPLOY-20260829-01`

Execution evidence commit:
`66076b3a2d0e1b547cc84468cc7cd7a014a35960`

Independent findings:
- execution commit is the direct child of authorized HEAD `6e3e615c141bf0641413da40410592ed77b128a5`;
- execution commit modified only `project-docs/D1_ATTACHMENT_PERSISTENCE_CORRECTIVE_EVIDENCE.md`;
- no production source/dist/schema/test drift occurred during deployment;
- preflight PASS;
- focused tests 45/45 PASS and full tests 897/897 PASS reported;
- UI build PASS and build-only PASS with 0 Kintone calls reported;
- rollback snapshots captured before write;
- App794 customization deploy status SUCCESS;
- customization revision advanced 49 -> 50;
- post-deploy JS identity `43731e5c26dc441659e2f3687f58d1c7237279a5` exactly equals the reviewed candidate JS blob;
- post-deploy CSS identity `c407e30a0eb87c6e0c3f2f55cc4fc6163816695d` exactly equals the reviewed candidate CSS blob;
- candidate readback match reported YES;
- customization topology remained Scope ALL / 1 Desktop JS / 1 Desktop CSS / 0 Mobile;
- rollback not required;
- App794 record/schema/layout/ACL/process writes = 0;
- App801/App795/App796 writes = 0;
- one-shot authorization is consumed and cannot be reused.

Independent verdict:

```text
LONG_FILENAME_UI_SOURCE_CORRECTIVE = PASS
LONG_FILENAME_UI_DEPLOYMENT        = PASS
APP794_LIVE_CUSTOMIZATION_REVISION = 50
LIVE_UI_FUNCTIONAL_STATUS          = PENDING USER UAT
```

The evidence did not include a literal `FINAL_COMMIT_SHA` field or separate PRE/POST topology lines, but this is non-blocking because the evidence commit itself is `66076b3...`, it is the direct child of the authorized HEAD, the only changed file is the evidence document, and the topology/readback state is explicitly recorded without drift.

## 5. Exact Current Gate

```text
CURRENT_GATE                  = D1 APP794 LONG-FILENAME UI — USER LIVE UAT ON REV50
CURRENT_MODE                  = CONTROL PLANE HOLD
NEXT_ACTION_OWNER             = USER
ANTIGRAVITY EXECUTION         = NO
SOURCE CHANGE                 = NO
APP794 CUSTOMIZATION DEPLOY   = NO FURTHER DEPLOY
APP794 FORM/SCHEMA/LAYOUT     = NO WRITE
APP794 RECORD WRITE           = USER UAT ONLY THROUGH NORMAL UI
APP794 ACL/PROCESS            = NO
APP801                        = NO
APP795/796                    = NO
ROUTING/SCORING/AUTH/RESET    = NO
D2-D7 EXECUTION               = NO
EXTERNAL SERVICE/STORAGE      = NO
```

## 6. Required User Live UAT

Run through normal App794 rev50 UI:

```text
UAT_UI_01 long saved filename stays inside cell and ellipsizes
UAT_UI_02 delete ✕ remains visible at right edge
UAT_UI_03 multiple long files stack; every delete ✕ remains visible
UAT_UI_04 pending/error long filename remains contained
UAT_UI_05 saved remove still removes only selected file after Save
UAT_UI_06 Objective / Mid-Year / Final(Self) visual regression
UAT_UI_07 attachment persistence remains working
```

Do not mark the Live UI defect closed until the relevant user UAT succeeds.