# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual execution is required
> Updated: 2026-08-29 — ONE-SHOT APP794 D1 TIMELINE + ATTACHMENT DEPLOY AUTHORIZED

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|---|
| D1 | Login + Password Change + Employee-Self MBO Gate | 🟠 KINTONE-ONLY / APP801 ACCESS PASS / RESET+FORCE-CHANGE+MY MBO PASS / APP794 ACL+PRIOR DEPLOY PASS / EMPLOYEE-SELF UI PASS / CREATE-HANDLER FIX PASS / APP795 ACCESS PASS / APP796 RUNTIME READ PASS / CREATE-SHOW INITIALIZATION PASS / TIMELINE TRUTHFULNESS PASS / ATTACHMENT DISPLAY+PENDING+REMOVE PASS / ATTACHMENT SUBMIT INTEGRATION SOURCE PASS / HANDLER-LEVEL TEST+EVIDENCE PASS / ONE-SHOT APP794 TIMELINE+ATTACHMENT DEPLOY AUTHORIZED / HR+ADMIN RESET UI STILL OPEN / REMAINING SECURITY UAT OPEN |
| D2 | Excel + PDF legacy-format export | 🟠 IN PROGRESS |
| D3 | 8 legacy PMS apps -> App794 | 🟠 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | App800 HR Control Center end-to-end | 🟠 IN PROGRESS |
| D5 | Copy own previous MBO | 🔴 MUST FIX / NOT CLOSED |
| D6 | Integrated E2E / Security / Regression | 🔴 BLOCKED UNTIL CONSTITUENT WORK IS READY |
| D7 | Admin Support Center | ✅ SOURCE FUNCTIONALITY CLOSED / REOPEN ONLY ON NEW DEFECT |

No AI may silently drop D1–D7.

## 2. Non-Negotiable Architecture / Accepted State

```text
D1_ARCHITECTURE                         = KINTONE-ONLY
EXTERNAL_SERVER_SERVICE                 = FORBIDDEN
AUTH_BRIDGE                             = CANCELLED / DO NOT IMPLEMENT
SERVICES_MBO_AUTH_BRIDGE                = ABANDONED EXPERIMENT / NOT PRODUCTION PATH
D1_SESSION_CONTINUITY_ARCHITECTURE      = PASS
APP801_SESSION_SCHEMA_WRITE             = PASS / ACCEPTED
D1_CREATE_HANDLER_CORRECTIVE            = PASS / DEPLOYED / LIVE old handler error absent
D1_EMPLOYEE_SELF_INDEX_VISUAL           = PASS / LIVE CONFIRMED
D1_HR_ADMIN_PASSWORD_RESET_REQUIREMENT  = BASELINED / PRODUCTION ADMIN UI STILL OPEN
D1_RESET_PASSWORD_0113                  = PASS / ONE-TIME MANUAL RESET AUTH CONSUMED
D1_FORCE_PASSWORD_CHANGE_0113           = PASS
D1_LOGIN_0113_TO_MY_MBO                 = PASS
D1_LIST_TO_CREATE_SESSION_CONTINUITY    = PASS
APP794_ACL_CORRECTION                   = PASS / REVISION 43 -> 44
APP794_CORRECTIVE_DEPLOY_ROUND_2        = PASS / LIVE CUSTOMIZATION REVISION 45
APP795_ACCESS_CORRECTION                = PASS / APP GROUP PUBLIC / MBO_EMPLOYEE_ACCESS VIEW-ONLY
TMH2_REQUESTER_AUTH_UNDER_s1            = DENIED / EXPECTED BUSINESS BOUNDARY
TMH2_REQUESTER_AUTH_UNDER_tmh           = PASS
APP796_EFFECTIVE_ACCESS                 = PASS / APP GROUP PUBLIC / MBO_EMPLOYEE_ACCESS VIEW-ONLY
APP796_RUNTIME_READ_FOR_CREATE          = PASS
D1_CREATE_SHOW_INITIALIZATION           = PASS
DIRECT_URL_REST_HARD_ISOLATION          = NOT_GUARANTEED_UNDER_SHARED_KINTONE_ACCOUNT
SOURCE_MODULARITY_POLICY                = MANDATORY / NO CATCH-ALL SOURCE FILES
```

Do not reopen accepted App795/App796 permissions, requester routing, Create handler, Login/session architecture, or deploy tooling unless new evidence directly requires it.

## 3. Accepted Timeline / Attachment Gate

Independent Review accepted:

```text
D1_LIVE_TIMELINE_TRUTHFULNESS_SOURCE       = PASS
D1_ATTACHMENT_DISPLAY_SOURCE               = PASS
D1_ATTACHMENT_PENDING_REMOVE_SOURCE        = PASS
D1_ATTACHMENT_UPLOAD_SERVICE_SOURCE        = PASS
D1_ATTACHMENT_SUBMIT_INTEGRATION_SOURCE    = PASS
D1_SUBMIT_LIFECYCLE_TEST_PROOF             = PASS
D1_TIMELINE_ATTACHMENT_SOURCE_TEST_GATE    = PASS
```

Accepted executor candidate:
`433f3106f4f7de0627098dab1f22fb7d032a542d`

Evidence accepted:
- focused tests 17/17 PASS;
- full npm test 869/869 PASS;
- module-aware build-only PASS;
- no Live Kintone write during source/test gate;
- no unauthorized production source change in verification commit.

Commits after `433f310...` up to the authorization point were Control Plane documentation only.

## 4. Current Authorization — Exact One-Shot Scope

User explicitly authorized on 2026-08-29:

`App794 deploy D1 Timeline + Attachment corrective`

Control Plane interpretation is exact and narrow:

```text
APP794 CUSTOMIZATION BUILD/DEPLOY/READBACK = YES / ONE SHOT
APP794 PRE-DEPLOY CUSTOMIZATION BACKUP      = YES
APP794 EXACT ROLLBACK IF DEPLOY FAILS       = YES / ONLY TO PRE-DEPLOY SNAPSHOT
APP794 RECORD WRITE                         = NO
APP794 ACL WRITE                            = NO
APP794 SCHEMA WRITE                         = NO
APP794 PROCESS WRITE                        = NO
APP801 WRITE                                = NO
APP795/796 WRITE                            = NO
ROUTING/SCORING CHANGE                      = NO
AUTH/RESET CHANGE                           = NO
SOURCE CHANGE/REFACTOR                      = NO
D2-D7 EXECUTION                             = NO
EXTERNAL SERVICE                            = NO
```

This authorization is single-use and must not be reused for another deployment.

## 5. Exact Current Gate

```text
CURRENT_GATE       = APP794 D1 TIMELINE + ATTACHMENT CORRECTIVE DEPLOY
CURRENT_MODE       = ONE-SHOT LIVE CUSTOMIZATION DEPLOY AUTHORIZED
NEXT_ACTION_OWNER  = ANTIGRAVITY / EXACT ACTIVE TASK ONLY
APP794 DEPLOY      = YES / SINGLE USE
```

Active Task:
`project-docs/AI_ACTIVE_TASK.md`

Antigravity must perform only the minimum execution that requires its local/runtime environment:
1. sync canonical branch;
2. verify no `src/`, `dist/`, or `tests/` changes after accepted candidate `433f310...`;
3. build + build-only preflight;
4. fresh readback and local backup of current App794 customization;
5. deploy only App794 customization;
6. read back deployment completion and active customization assets;
7. rollback only if deployment/readback fails;
8. write one concise evidence document, commit/push, STOP.

No additional source/test/refactor work is authorized.

## 6. Post-Deploy Sequence

After Antigravity stops:
1. ChatGPT independently reviews deployment evidence;
2. if deployment evidence PASS, perform/guide Live UAT for:
   - no fabricated workflow events/comments;
   - native Kintone Comments remains authoritative;
   - zero/one/multiple real filenames;
   - selected pending filename before save;
   - saved/persisted state after save;
   - remove/change truthful behavior;
   - no preview filename leak;
3. then continue D1 HR/admin Reset MBO Password UI and remaining security UAT under separate authorization/work packages as required.

## 7. Development Governance Reminder

- Antigravity is used only for execution that genuinely requires the local/runtime environment.
- ChatGPT owns analysis, architecture, Git review, acceptance, Control Center/Baseline/Active Task maintenance.
- Maintain modular source by feature/responsibility; do not accumulate unrelated implementation in catch-all files.
- `src/main-mbo-app.js` remains orchestration-only.
- generated `dist` may be bundled; maintainable source must remain modular.
- do not mix refactor with this deployment gate.

## 8. Handoff State

```text
CURRENT_GATE   = APP794 D1 TIMELINE + ATTACHMENT CORRECTIVE DEPLOY
CURRENT_MODE   = ONE-SHOT DEPLOY AUTHORIZED
REVIEW_RESULT  = SOURCE/TEST PASS
NEXT OWNER     = ANTIGRAVITY / EXACT ACTIVE TASK ONLY
```
