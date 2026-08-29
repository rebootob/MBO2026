# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual execution is required
> Updated: 2026-08-29 — APP794 SAVED ATTACHMENT PREVIEW/DOWNLOAD DEPLOYMENT INDEPENDENT REVIEW PASS / USER LIVE UAT

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|
| D1 | 🟠 KINTONE-ONLY / App794 customization rev51 / attachment persistence PASS / long-filename UI PASS / **saved attachment Preview/Download source PASS + deployment PASS; User Live UAT pending** / HR+admin reset UI open / remaining security UAT open |
| D2 | 🟠 Excel + PDF legacy-format export IN PROGRESS |
| D3 | 🟠 8 legacy PMS -> App794 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | 🟠 App800 HR Control Center IN PROGRESS |
| D5 | 🔴 Copy own previous MBO MUST FIX |
| D6 | 🔴 Integrated E2E / Security / Regression BLOCKED |
| D7 | ✅ Admin Support Center source functionality closed |

## 2. Accepted State

```text
APP794_LIVE_CUSTOMIZATION_REVISION       = 51
APP794_LIVE_FORM_REVISION                = 48
EDIT_ATTACHMENT_SOURCE/DEPLOYMENT        = PASS / REV49
LONG_FILENAME_UI_SOURCE/DEPLOYMENT       = PASS / REV50
ATTACHMENT_RETRIEVAL_SOURCE_REVIEW       = PASS
ATTACHMENT_RETRIEVAL_DEPLOYMENT_REVIEW   = PASS / REV51
ATTACHMENT_RETRIEVAL_USER_LIVE_UAT       = PENDING
DEPLOY_AUTHORIZATION                     = CONSUMED / CLOSED
```

Do not reopen Objective FILE schema, desired-state persistence, atomic Edit preflight, long-filename containment, restored Remove semantics, MIME safety, single-popup behavior, or Rev51 deployment provenance without new evidence.

## 3. Reviewed Candidate

Reviewed source candidate:
`ec6278524a2d5eb53050d0580c340d1b4e866b97`

Independent source review remains PASS:
- persisted filename Preview/Open + separate Download;
- read-only Preview/Download supported;
- browser Fetch GET `/k/v1/file.json` using persisted fileKey + `X-Requested-With: XMLHttpRequest`;
- explicit MIME allowlist only;
- empty/unknown/active-content/non-allowlisted MIME => Download only;
- exactly one synchronous popup attempt before awaited retrieval;
- blocked popup => safe Download fallback;
- retrieval non-destructive;
- existing Remove semantics preserved.

Executor/local source evidence:

```text
FOCUSED_ATTACHMENT_TESTS = PASS 73/73
FULL_NPM_TEST            = PASS 925/925
NPM_RUN_UI_BUILD         = PASS
MODULE_AWARE_BUILD_ONLY  = PASS / 0 Kintone network calls
```

GitHub exposes no CI status checks for this candidate.

## 4. Independent Deployment Review — PASS

Authorization:
`APP794-D1-ATTACHMENT-PREVIEW-DOWNLOAD-DEPLOY-20260829-01`

Execution evidence commit:
`188289e1da848828cbfd6acd401cb94fa3df3380`

Independent findings:
- execution commit is direct child of authorization task HEAD `f627ad129588f1370c06dd9c1ae9cfac826aef39`;
- execution commit changed only `project-docs/D1_ATTACHMENT_PERSISTENCE_CORRECTIVE_EVIDENCE.md`;
- no production source/test/dist/schema/ACL/process drift occurred during deploy;
- authorization consumed exactly once;
- deterministic precheck PASS;
- focused tests PASS 73/73;
- UI build PASS;
- build-only PASS with 0 Kintone calls;
- pre-deploy customization revision 50;
- post-deploy customization revision 51;
- topology preserved: Scope ALL, 1 Desktop JS, 1 Desktop CSS, 0 Mobile;
- rollback snapshot captured before write;
- Kintone deployment result SUCCESS;
- rollback not required;
- forbidden writes reported 0.

Independent candidate identity verification:

```text
POST_DEPLOY_JS_IDENTITY_HASH  = e04aa07852e8e5aa4e4234f6efce5c99f2b37ec8
CANDIDATE_DIST_JS_GIT_BLOB    = e04aa07852e8e5aa4e4234f6efce5c99f2b37ec8
MATCH                          = YES

POST_DEPLOY_CSS_IDENTITY_HASH = 1710d770ae87fb5f910d669dd5a88ea0950e6991
CANDIDATE_DIST_CSS_GIT_BLOB   = 1710d770ae87fb5f910d669dd5a88ea0950e6991
MATCH                          = YES
```

Deployment verdict: **PASS**.

## 5. Current Gate

```text
CURRENT_GATE                  = D1 APP794 SAVED ATTACHMENT PREVIEW/DOWNLOAD — USER LIVE UAT
CURRENT_MODE                  = CONTROL PLANE HOLD
NEXT_ACTION_OWNER             = USER
APP794 CUSTOMIZATION DEPLOY   = CLOSED / REV51
DEPLOY_AUTHORIZATION          = CONSUMED / CLOSED
SOURCE CHANGE                 = NO
APP794 FORM/SCHEMA/LAYOUT     = NO WRITE
APP794 RECORD WRITE           = NO LIVE WRITE BY AI
APP794 ACL/PROCESS            = NO
APP801 / APP795 / APP796      = NO
D2-D7 EXECUTION               = NO
EXTERNAL SERVICE/STORAGE      = NO
```

Required User Live UAT on real persisted attachments:
1. Click saved PDF filename -> preview opens correctly.
2. Click saved raster image filename -> preview opens correctly.
3. Click Download control -> original filename downloads correctly.
4. Read-only/historical attachment -> Preview/Download works without Delete.
5. Long filename -> ellipsis remains; Preview/Download/Delete controls visible.
6. Multiple saved files -> each row has correct Preview/Download and editable Delete when allowed.
7. Delete chosen file -> existing accepted remove/save behavior remains correct and other files remain preserved.
8. Unsupported/unknown file type -> downloads rather than unsafe preview.

Do not mark retrieval UX closed until User reports Live UAT PASS or provides new failure evidence.
