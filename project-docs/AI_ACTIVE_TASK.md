# AI ACTIVE TASK — D1 APP794 SAVED ATTACHMENT PREVIEW / DOWNLOAD DEPLOY AUTH HOLD

Mode: **CONTROL PLANE HOLD — ANTIGRAVITY DO NOTHING / NO DEPLOY**
Branch: `ai/antigravity-wp002c`
Live App794 customization revision: `50`
Reviewed source candidate: `ec6278524a2d5eb53050d0580c340d1b4e866b97`
Independent source verdict: **PASS**
Deployment authorization: **NONE**

## Accepted State

```text
ATTACHMENT_PERSISTENCE_SOURCE/DEPLOYMENT = PASS / REV49
LONG_FILENAME_UI_SOURCE/DEPLOYMENT       = PASS / REV50
ATTACHMENT_RETRIEVAL_SOURCE              = PASS
ATTACHMENT_RETRIEVAL_LIVE                = NOT DEPLOYED / REV50 STILL FAILS PREVIEW-DOWNLOAD UX
ALL_PRIOR_DEPLOY_AUTHS                    = CONSUMED / CLOSED
```

## Independent Source Review Findings

Accepted candidate `ec6278524a2d5eb53050d0580c340d1b4e866b97` because:
- direct child of residual task HEAD `15e4e8ad5718f2a04ea8a912adf99d1327fb2968`;
- residual round changed only UI source, focused tests, generated JS and existing evidence;
- no attachment-service change in residual round;
- no `src/main-mbo-app.js` change;
- empty/unknown MIME is Download-only and never promoted by filename extension;
- safe preview requires explicit allowlisted response MIME;
- active-content/non-allowlisted types remain Download-only;
- exactly one synchronous popup attempt before await;
- no async second popup attempt;
- blocked popup falls back safely to Download preserving filename;
- Remove baseline semantics remain restored;
- retrieval remains non-destructive;
- executor/local focused 73/73 and full 925/925 tests reported PASS;
- UI build and module-aware build-only reported PASS with 0 Kintone network calls;
- Live write = 0 and Live deploy = NO.

GitHub exposes no CI status checks for the candidate.

## Current Gate

```text
CURRENT_GATE                  = WAITING USER EXPLICIT ONE-SHOT APP794 DEPLOY AUTHORIZATION
NEXT_ACTION_OWNER             = USER
ANTIGRAVITY EXECUTION         = NO
SOURCE CHANGE                 = NO
APP794 CUSTOMIZATION DEPLOY   = NO
APP794 FORM/SCHEMA/LAYOUT     = NO WRITE
APP794 RECORD WRITE           = NO LIVE WRITE
APP794 ACL/PROCESS            = NO
APP801 / APP795 / APP796      = NO
D2-D7 EXECUTION               = NO
EXTERNAL SERVICE/STORAGE      = NO
DEPLOY_AUTHORIZATION          = NONE
```

Do not deploy, patch, refactor, run Live UAT, or start unrelated work under this task.

## If User Explicitly Authorizes Deploy Later

Control Plane must create a new one-shot deployment authorization bound exactly to:

```text
REVIEWED_CANDIDATE = ec6278524a2d5eb53050d0580c340d1b4e866b97
TARGET_APP         = 794
TARGET_CHANGE      = DESKTOP CUSTOMIZATION JS/CSS ONLY
```

The deployment task must require preflight/build/build-only, pre-deploy revision/topology/hash capture, rollback snapshot before write, exact candidate deployment, Kintone SUCCESS wait, post-deploy readback/hash match, zero schema/record/ACL/process/other-app writes, evidence commit/push, authorization consumption, then STOP for independent deployment review.

No prior authorization may be reused.
