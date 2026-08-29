# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual source/runtime execution is required
> Updated: 2026-08-29 — WP2 LIVE UAT CORRECTIVE R2 ONE-SHOT DEPLOY AUTHORIZED

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|
| D1 | 🟠 Live App794 remains Revision 55 and USER UAT FAILED for the prior WP2 deployment. Corrective R2 candidate `cab6db3c3f917138abc45c5218a3a5a0d3f7d0d3` independently passed source review. User has now explicitly authorized exactly one guarded App794 customization deployment of this candidate. |
| D2 | 🟠 Excel + PDF legacy-format export IN PROGRESS |
| D3 | 🟠 8 legacy PMS -> App794 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | 🟠 App800 HR Control Center IN PROGRESS |
| D5 | 🔴 Copy own previous MBO MUST FIX — resume only after WP2 Live UAT is accepted |
| D6 | 🔴 Integrated E2E / Security / Regression BLOCKED |
| D7 | ✅ Admin Support Center source functionality closed |

## 2. Current Live / Rollback Truth

```text
CURRENT_LIVE_REVISION   = 55
CURRENT_LIVE_SOURCE     = 90ba66e33c056807dc79717c3c787f37e80bb1b6
CURRENT_LIVE_JS         = eec05d4bb19130f3edc431164fc073f6b697dd8a
CURRENT_LIVE_CSS        = 2a758a0025c1ec1917b4da19ad09bd8cd2182f51
CURRENT_LIVE_SCOPE      = ALL
CURRENT_LIVE_TOPOLOGY   = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
CURRENT_LIVE_TECHNICAL_READBACK = PASS
CURRENT_LIVE_USER_UAT   = FAIL

ROLLBACK_SOURCE_COMMIT  = ec6278524a2d5eb53050d0580c340d1b4e866b97
ROLLBACK_REVISION       = 54
ROLLBACK_SCOPE          = ALL
ROLLBACK_TOPOLOGY       = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
ROLLBACK_JS_IDENTITY    = e04aa07852e8e5aa4e4234f6efce5c99f2b37ec8
ROLLBACK_CSS_IDENTITY   = 1710d770ae87fb5f910d669dd5a88ea0950e6991
```

Rev55 is technically identified but not user-accepted. Rollback Rev54 is reference-only and is NOT authorized by the current forward-deploy approval.

## 3. Authorization Ledger

Prior authorization — closed forever:
```text
AUTHORIZATION_ID     = APP794-D1-WP2-UI-DEPLOY-20260829-01
AUTHORIZATION_STATUS = CONSUMED / CLOSED
```

Current authorization:
```text
AUTHORIZATION_ID       = APP794-D1-WP2-CORRECTIVE-R2-DEPLOY-20260829-01
AUTHORIZATION_STATUS   = ACTIVE / UNCONSUMED
TARGET_APP             = 794 ONLY
WORK_PACKAGE           = MBO-P03-WP-002C
STAGE                  = STAGE_D1_APP794_CUSTOMIZATION_DEPLOY
OPERATION              = APP794_CUSTOMIZATION_DEPLOY
AUTHORIZED_CANDIDATE   = cab6db3c3f917138abc45c5218a3a5a0d3f7d0d3
AUTHORIZED_ATTEMPTS    = 1
ROLLBACK_AUTHORIZED    = NO
OTHER_KINTONE_WRITES   = NO
```

User authorization text:
`อนุมัติ App794 deploy WP2 corrective R2 candidate cab6db3`

Never reuse or widen either authorization.

## 4. Authorized Corrective R2 Manifest

```text
CANDIDATE_SOURCE_COMMIT = cab6db3c3f917138abc45c5218a3a5a0d3f7d0d3
CANDIDATE_JS_BLOB_SHA   = 79787f75a1edf0721d7d6ac71216a1366599f3e0
CANDIDATE_CSS_BLOB_SHA  = b6f77930256378cbe1e190932103dfecea174fbc
CANDIDATE_SCOPE         = ALL
CANDIDATE_TOPOLOGY      = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
```

Accepted corrective scope only:
- prominent Back to My MBO bar/button on Detail/Edit;
- improved My MBO card/list styling;
- Kintone Comment Mirror GET contract using `/k/v1/record/comments.json` with `limit=10`, read-only, Refresh refetch, Create GET=0.

## 5. Mandatory One-Shot Deploy Gate

Before authorization consumption / any upload:
1. read this Control Center, `AI_ACTIVE_TASK.md`, and `CONFIRMED_BASELINE/ROLLBACK_RECOVERY_SAFETY.md`;
2. run required focused/full tests and hardened build-only with network calls = 0;
3. checkout exact candidate `cab6db3c3f917138abc45c5218a3a5a0d3f7d0d3` in detached HEAD with a clean worktree;
4. clean rebuild must produce exact JS `79787f...` and CSS `b6f779...` with zero tracked dist diff;
5. independently READ current Live App794 before invoking `executeDeployCustomUi()` and prove exact pre-deploy state: Revision 55 / Scope ALL / Desktop JS1 CSS1 / Mobile0 / JS `eec05d...` / CSS `2a758a...`;
6. any mismatch or unexpected drift => STOP before authorization consumption / upload;
7. only then invoke the hardened deploy path exactly once with the manifest and authorization in `AI_ACTIVE_TASK.md`.

After the single forward deploy:
- poll to terminal SUCCESS/FAIL;
- read actual Live revision/scope/topology;
- download actual deployed JS/CSS and compute exact blob SHA;
- require JS `79787f...` + CSS `b6f779...` as one atomic pair;
- forbidden business/schema/ACL/comment/App801/795/796 writes must remain 0;
- if mismatch/ambiguous/failure => STOP; no second deploy; no automatic rollback.

## 6. Current Gate

```text
CURRENT_GATE                  = WP2 CORRECTIVE R2 ONE-SHOT LIVE DEPLOY AUTHORIZED
CURRENT_MODE                  = ANTIGRAVITY GUARDED DEPLOY EXECUTION
NEXT_ACTION_OWNER             = ANTIGRAVITY / EXACT ACTIVE TASK ONLY
AUTHORIZATION_ID              = APP794-D1-WP2-CORRECTIVE-R2-DEPLOY-20260829-01
AUTHORIZATION_STATUS          = ACTIVE / UNCONSUMED
WP2_R2_CANDIDATE              = cab6db3c3f917138abc45c5218a3a5a0d3f7d0d3
WP2_R2_JS                     = 79787f75a1edf0721d7d6ac71216a1366599f3e0
WP2_R2_CSS                    = b6f77930256378cbe1e190932103dfecea174fbc
PRE_DEPLOY_LIVE_REVISION      = 55 / USER UAT FAILED
APP794 CUSTOMIZATION DEPLOY   = AUTHORIZED ONCE / EXACT CANDIDATE ONLY
ROLLBACK                      = NOT AUTHORIZED
APP794 RECORD WRITE           = NO
APP794 FORM/SCHEMA/LAYOUT     = NO
APP794 ACL/PROCESS            = NO
KINTONE COMMENT WRITE         = NO
APP801 / APP795 / APP796      = NO WRITE
COPY PREVIOUS MBO             = NO
D2-D7 EXECUTION               = NO
```
