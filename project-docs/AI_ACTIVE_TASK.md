# AI ACTIVE TASK — D1 APP794 ATTACHMENT LONG-FILENAME UI DEPLOY AUTH HOLD

Mode: **CONTROL PLANE HOLD — ANTIGRAVITY DO NOTHING / NO DEPLOY**
Branch: `ai/antigravity-wp002c`
Live App794 customization revision: `49`
Reviewed source candidate: `1abd434ab6c4ce04a6f1e5c2fdbaa9a94f75e502`
Independent source verdict: **PASS**
Deployment authorization: **NONE**
Prior deployment authorization `APP794-D1-EDIT-ATTACHMENT-DEPLOY-20260829-01`: **CONSUMED / CLOSED**

## Accepted State

```text
ATTACHMENT_PERSISTENCE_SOURCE      = PASS
ATTACHMENT_PERSISTENCE_DEPLOYMENT  = PASS / REV49
ATTACHMENT_PERSISTENCE_LIVE_REPORT = USER REPORTS WORKING
LONG_FILENAME_DELETE_VISIBILITY    = LIVE FAIL ON REV49
LONG_FILENAME_UI_SOURCE_CORRECTIVE = PASS
REVIEWED_CANDIDATE                 = 1abd434ab6c4ce04a6f1e5c2fdbaa9a94f75e502
DEPLOY_AUTHORIZATION               = NONE
```

## Independent Review Findings

The source candidate is accepted because:
- it is exactly one executor commit after source-task HEAD `62a19bc05300a6ef4c76f62e7a5942ada939a61c`;
- only allowed renderer/CSS/test/generated dist/evidence files changed;
- attachment service and main attachment orchestration did not change;
- each saved/pending/error attachment row is bounded to the cell width;
- filename is a shrinkable ellipsis region with full-name `title` tooltip;
- delete `✕` is a separate non-shrinking flex item;
- multiple attachment rows stack vertically;
- Add File remains available;
- Objective/Mid-Year/shared Self→Final renderer path is preserved;
- no Kintone write or deploy occurred.

Executor verification evidence:

```text
FOCUSED_ATTACHMENT_TESTS = PASS 45/45
FULL_NPM_TEST            = PASS 897/897
NPM_RUN_UI_BUILD         = PASS
MODULE_AWARE_BUILD_ONLY  = PASS / 0 Kintone network calls
LIVE_KINTONE_WRITE       = 0
LIVE_DEPLOY_OCCURRED     = NO
```

GitHub has no CI status checks for this candidate. The test/build results above are executor evidence, not independent CI.

Non-blocking note: the newly named Objective/Mid-Year/Final attachment render regression directly populates `Self_Attachment_1`, not `Final_Attachment_1`, but the existing Self→Final fallback remains unchanged and the accepted layout contract is field-agnostic.

## Current Gate

```text
CURRENT_GATE                  = USER DECISION ON APP794 UI DEPLOY
NEXT_ACTION_OWNER             = USER
ANTIGRAVITY EXECUTION         = NO
SOURCE CHANGE                 = NO
APP794 CUSTOMIZATION DEPLOY   = NO
APP794 FORM/SCHEMA/LAYOUT     = NO WRITE
APP794 RECORD WRITE           = NO
APP794 ACL/PROCESS            = NO
APP801                        = NO
APP795/796                    = NO
ROUTING/SCORING/AUTH/RESET    = NO
D2-D7 EXECUTION               = NO
EXTERNAL SERVICE/STORAGE      = NO
```

Do not self-start deployment. A new explicit one-shot authorization is required for candidate `1abd434ab6c4ce04a6f1e5c2fdbaa9a94f75e502`.

## If User Authorizes Deployment Later

Control Plane must first create a new exact one-shot deploy task bound to candidate `1abd434ab6c4ce04a6f1e5c2fdbaa9a94f75e502`, requiring preflight, build/readback, rollback snapshot, App794 customization-only write, no source drift, and stop after one attempt for independent review.

## Required User Live UAT After Authorized Deploy + Independent Deployment Review PASS

```text
UAT_UI_01 long saved filename stays inside cell and ellipsizes
UAT_UI_02 delete ✕ remains visible at right edge
UAT_UI_03 multiple long files stack; every delete ✕ remains visible
UAT_UI_04 pending/error long filename remains contained
UAT_UI_05 saved file removal still removes only selected file after Save
UAT_UI_06 Objective / Mid-Year / Final(Self) visual regression
UAT_UI_07 attachment persistence remains working
```

Do not mark the Live defect PASS before deployment provenance review and user UAT.
