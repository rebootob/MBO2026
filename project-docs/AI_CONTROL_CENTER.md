# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual execution is required
> Updated: 2026-08-29 — APP794 SAVED ATTACHMENT PREVIEW/DOWNLOAD SOURCE PASS / ONE-SHOT DEPLOY AUTHORIZED

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|
| D1 | 🟠 KINTONE-ONLY / App794 customization rev50 / attachment persistence PASS / long-filename UI PASS / **saved attachment Preview/Download source corrective independently reviewed PASS; exact one-shot App794 customization deploy now authorized; execution/review/UAT pending** / HR+admin reset UI open / remaining security UAT open |
| D2 | 🟠 Excel + PDF legacy-format export IN PROGRESS |
| D3 | 🟠 8 legacy PMS -> App794 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | 🟠 App800 HR Control Center IN PROGRESS |
| D5 | 🔴 Copy own previous MBO MUST FIX |
| D6 | 🔴 Integrated E2E / Security / Regression BLOCKED |
| D7 | ✅ Admin Support Center source functionality closed |

## 2. Accepted State

```text
APP794_LIVE_CUSTOMIZATION_REVISION  = 50
APP794_LIVE_FORM_REVISION           = 48
EDIT_ATTACHMENT_SOURCE/DEPLOYMENT   = PASS / REV49
LONG_FILENAME_UI_SOURCE/DEPLOYMENT  = PASS / REV50
ALL_PRIOR_DEPLOY_AUTHS              = CONSUMED / CLOSED
ATTACHMENT_RETRIEVAL_UX_LIVE        = FAIL ON REV50
ATTACHMENT_RETRIEVAL_CANDIDATE      = ec6278524a2d5eb53050d0580c340d1b4e866b97
ATTACHMENT_RETRIEVAL_SOURCE_REVIEW  = PASS
```

Do not reopen Objective FILE schema, desired-state persistence, atomic Edit preflight, long-filename containment, restored Remove semantics, MIME safety, or single-popup behavior without new evidence.

## 3. Independent Source Review — PASS

Reviewed candidate:
`ec6278524a2d5eb53050d0580c340d1b4e866b97`

Parent/task HEAD:
`15e4e8ad5718f2a04ea8a912adf99d1327fb2968`

Independent findings:
- exactly one executor commit from the task HEAD;
- changed only `src/ui/employee-part-a-ui.js`, `tests/timeline-truthfulness-and-attachment.test.js`, generated `dist/mbo-employee-app.js`, and the existing attachment evidence document;
- `src/services/mbo-attachment-service.js` unchanged in the residual round;
- `src/main-mbo-app.js` unchanged;
- safe preview requires an explicit response MIME allowlist;
- empty/unknown MIME is Download-only regardless of filename extension;
- active-content/non-allowlisted MIME is Download-only;
- exactly one synchronous `window.open('about:blank', '_blank')` attempt exists before awaited retrieval;
- no second asynchronous popup attempt remains;
- blocked popup safely falls back to Download preserving original filename;
- accepted Remove semantics remain restored;
- retrieval remains non-destructive;
- browser Fetch GET `/k/v1/file.json` with persisted fileKey and `X-Requested-With: XMLHttpRequest` remains the retrieval transport;
- no Live Kintone write and no customization deploy occurred during source work.

Executor/local evidence:

```text
FOCUSED_ATTACHMENT_TESTS = PASS 73/73
FULL_NPM_TEST            = PASS 925/925
NPM_RUN_UI_BUILD         = PASS
MODULE_AWARE_BUILD_ONLY  = PASS / 0 Kintone network calls
LIVE_KINTONE_WRITE       = 0
LIVE_DEPLOY_OCCURRED     = NO
```

GitHub exposes no CI status checks for this candidate; these are executor/local results, not independent CI.

After candidate `ec627852...`, subsequent commits before this authorization changed only `project-docs/AI_CONTROL_CENTER.md` and `project-docs/AI_ACTIVE_TASK.md`; production source/dist did not drift.

## 4. Exact User Authorization

User explicitly authorized:

`อนุมัติ App794 deploy Saved Attachment Preview Download corrective candidate ec627852`

Authorization record:

```text
AUTHORIZATION_ID                    = APP794-D1-ATTACHMENT-PREVIEW-DOWNLOAD-DEPLOY-20260829-01
AUTHORIZATION_TYPE                  = ONE-SHOT
AUTHORIZATION_STATUS                = AUTHORIZED / UNCONSUMED
REVIEWED_CANDIDATE                  = ec6278524a2d5eb53050d0580c340d1b4e866b97
TARGET_APP                          = 794
TARGET_CHANGE                       = DESKTOP CUSTOMIZATION JS/CSS ONLY
SOURCE_CHANGE_DURING_DEPLOY         = FORBIDDEN
TEST_CHANGE_DURING_DEPLOY           = FORBIDDEN
FORM_SCHEMA_LAYOUT_WRITE            = FORBIDDEN
BUSINESS_RECORD_WRITE               = FORBIDDEN
ACL_PROCESS_WRITE                   = FORBIDDEN
APP801_WRITE                        = FORBIDDEN
APP795_796_WRITE                    = FORBIDDEN
ROUTING_SCORING_AUTH_RESET          = FORBIDDEN
D2_D7_EXECUTION                     = FORBIDDEN
EXTERNAL_SERVICE_STORAGE            = FORBIDDEN
```

This authorization is bound only to the reviewed candidate above. It does not authorize any source fix, schema/layout change, business-record write, ACL/process change, other app change, or unrelated deployment.

One deployment attempt consumes the authorization whether the attempt succeeds or requires rollback. It cannot be reused for a retry, changed candidate, source patch, or second forward deploy.

## 5. Authorized Deployment Gate

```text
CURRENT_GATE                  = D1 APP794 SAVED ATTACHMENT PREVIEW/DOWNLOAD — AUTHORIZED DEPLOY EXECUTION
CURRENT_MODE                  = ANTIGRAVITY ONE-SHOT DEPLOYMENT
NEXT_ACTION_OWNER             = ANTIGRAVITY / EXACT ACTIVE TASK ONLY
REVIEWED_CANDIDATE            = ec6278524a2d5eb53050d0580c340d1b4e866b97
INDEPENDENT_VERDICT           = PASS
SOURCE CHANGE                 = NO
APP794 CUSTOMIZATION DEPLOY   = YES — EXACT ONE-SHOT AUTHORIZATION ONLY
APP794 FORM/SCHEMA/LAYOUT     = NO WRITE
APP794 RECORD WRITE           = NO LIVE WRITE
APP794 ACL/PROCESS            = NO
APP801 / APP795 / APP796      = NO
D2-D7 EXECUTION               = NO
EXTERNAL SERVICE/STORAGE      = NO
```

Mandatory deployment proof:
- re-fetch current canonical HEAD and read Control Center + Active Task;
- verify reviewed candidate and production source/dist have not drifted;
- run deterministic preflight;
- run focused attachment tests if required by existing deployment tooling;
- run `npm run ui:build`;
- run module-aware build-only and prove 0 Kintone writes;
- capture pre-deploy App794 customization revision/settings/topology and desktop JS/CSS identities;
- capture exact rollback snapshot before any write;
- deploy only the accepted App794 desktop customization JS/CSS bundle;
- do not add/remove unrelated customization entries and do not modify mobile customization;
- wait for Kintone deployment SUCCESS;
- read back post-deploy revision/settings/topology and desktop JS/CSS identities;
- prove Live bundle matches reviewed candidate exactly;
- prove zero forbidden writes;
- commit + push deployment evidence only, then STOP.

Maximum executor status after a successful attempt is `DEPLOYED_PENDING_INDEPENDENT_REVIEW`. Antigravity may not self-PASS and may not perform User Live UAT.

After independent deployment review PASS, gate moves to User Live UAT for Preview/Download behavior on real persisted files; Live functionality is not considered closed before that UAT.
