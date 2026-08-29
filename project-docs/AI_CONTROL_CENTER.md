# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.  
> Repository: `rebootob/MBO2026`  
> Branch: `ai/antigravity-wp002c`  
> Control Plane: ChatGPT  
> Execution Plane: Antigravity only when actual execution is required  
> Updated: 2026-08-29 — NEW-CHAT HANDOFF SYNCHRONIZED

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|---|
| D1 | Login + Password Change + Employee-Self MBO Gate | 🟠 KINTONE-ONLY / APP801 ACCESS PASS / RESET+FORCE-CHANGE+MY MBO PASS / APP794 ACL+DEPLOY PASS / EMPLOYEE-SELF UI PASS / CREATE-HANDLER FIX PASS / APP795 ACCESS PASS / APP796 RUNTIME READ PASS / CREATE-SHOW INITIALIZATION PASS / LIVE TIMELINE TRUTHFULNESS + ATTACHMENT CORRECTIVE ACTIVE / HR+ADMIN RESET UI STILL OPEN / REMAINING SECURITY UAT OPEN |
| D2 | Excel + PDF legacy-format export | 🟠 IN PROGRESS |
| D3 | 8 legacy PMS apps -> App794 | 🟠 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | App800 HR Control Center end-to-end | 🟠 IN PROGRESS |
| D5 | Copy own previous MBO | 🔴 MUST FIX / NOT CLOSED |
| D6 | Integrated E2E / Security / Regression | 🔴 BLOCKED UNTIL CONSTITUENT WORK IS READY |
| D7 | Admin Support Center | ✅ SOURCE FUNCTIONALITY CLOSED / REOPEN ONLY ON NEW DEFECT |

No AI may silently drop D1–D7.

## 2. Non-Negotiable Architecture / Gate Ledger

```text
D1_ARCHITECTURE                         = KINTONE-ONLY / USER RECONFIRMED 2026-08-29
EXTERNAL_SERVER_SERVICE                 = FORBIDDEN
AUTH_BRIDGE                             = CANCELLED / DO NOT IMPLEMENT
SERVICES_MBO_AUTH_BRIDGE                = ABANDONED EXPERIMENT / NOT PRODUCTION PATH
D1_SESSION_CONTINUITY_ARCHITECTURE      = PASS
APP801_SESSION_SCHEMA_WRITE             = PASS / ACCEPTED
D1_CREATE_HANDLER_CORRECTIVE            = PASS / SOURCE ACCEPTED / DEPLOYED / LIVE old handler error absent
D1_EMPLOYEE_SELF_INDEX_VISUAL           = PASS / LIVE CONFIRMED
D1_HR_ADMIN_PASSWORD_RESET_REQUIREMENT  = PASS / BASELINED / PRODUCTION ADMIN UI STILL TO IMPLEMENT
D1_RESET_PASSWORD_0113                  = PASS / ONE-TIME MANUAL RESET AUTH CONSUMED
D1_FORCE_PASSWORD_CHANGE_0113           = PASS / USER LIVE OBSERVATION
D1_LOGIN_0113_TO_MY_MBO                 = PASS / USER LIVE OBSERVATION
D1_LIST_TO_CREATE_SESSION_CONTINUITY    = PASS / USER LIVE OBSERVATION
APP794_ACL_CORRECTION                   = PASS / REVISION 43 -> 44
APP794_CORRECTIVE_DEPLOY_ROUND_2        = PASS / LIVE CUSTOMIZATION REVISION 45
APP795_ACCESS_CORRECTION                = PASS / ACL REVISION 8 -> 9 / APP GROUP PUBLIC
TMH2_REQUESTER_AUTH_UNDER_s1            = DENIED / EXPECTED BUSINESS BOUNDARY
TMH2_REQUESTER_AUTH_UNDER_tmh           = PASS / LIVE FLOW ADVANCED PAST ROUTING VALIDATION
APP796_PRECHANGE_DISCOVERY              = ACL REVISION 5 / CREATOR FULL / EVERYONE ALL-NO / PRIVATE APP GROUP
APP796_SETTINGS_CHANGE                  = USER-EXECUTED WITHOUT PRIOR CONTROL-PLANE WRITE AUTHORIZATION / CURRENT EFFECT VERIFIED
APP796_EFFECTIVE_ACCESS                 = MBO_EMPLOYEE_ACCESS VIEW-ONLY / EVERYONE ALL-NO / APP GROUP PUBLIC / USER SCREENSHOT EVIDENCE
APP796_RUNTIME_READ_FOR_CREATE          = PASS / LIVE CREATE-SHOW ADVANCED PAST SCORING LOOKUP UNDER `tmh`
D1_CREATE_SHOW_INITIALIZATION           = PASS / USER LIVE SCREENSHOT 2026-08-29
D1_LIVE_TIMELINE_TRUTHFULNESS           = FAIL / SOURCE FALLS BACK TO HARD-CODED SAMPLE EVENTS IN LIVE WHEN NO timelineEvents DATA
D1_NATIVE_KINTONE_COMMENTS              = AUTHORITATIVE RECORD CONVERSATION CHANNEL / USER LIVE PANEL SHOWED `No comments available`
D1_ATTACHMENT_DISPLAY                   = FAIL / CURRENT CUSTOM CONTROL DOES NOT TRUTHFULLY COVER ALL FILES/STATES
D1_ATTACHMENT_EDIT_LIFECYCLE            = FAIL / CUSTOM FILE INPUT/REMOVE LACK COMPLETE EVENT + UPLOAD/BIND LIFECYCLE
D1_LIVE_CUTOVER                         = BLOCKED UNTIL UI TRUTHFULNESS+ATTACHMENT CORRECTIVE + HR/ADMIN RESET UI + REMAINING D1 SECURITY/UAT
D2-D7 LIVE WRITES                       = NOT AUTHORIZED unless separately recorded
```

## 3. KINTONE-ONLY Security Ceiling — Do Not Reopen Incorrectly

Current durable authority is `CONFIRMED_BASELINE/D1_AUTH_SECURITY.md`.

Under the approved Kintone-only model, employee-facing/shared principals in `MBO_EMPLOYEE_ACCESS` require the exact App801 access defined by that Baseline. Do not revive older docs that say all employee-browser App801 access is prohibited.

Accepted limitation remains:

```text
DIRECT_URL_REST_HARD_ISOLATION = NOT_GUARANTEED_UNDER_SHARED_KINTONE_ACCOUNT
```

Do not claim hard Employee_Code-level native REST isolation inside one shared Kintone principal.

## 4. Accepted Live Evidence — Must Not Be Reimplemented

### App794 Employee-Self
- Employee Code `0113` MBO login/session continuity works.
- My MBO shell, Change Password and Logout are Live.
- Create reaches `/k/794/edit` without MBO re-login.
- old `kintone.app.record.get() in handler` defect is resolved.
- Create-show under correct Kintone principal `tmh` loads Employee `0113`, Section `TMH2`, Position `Section Manager`, routing/appraisers, scoring profile and custom MBO UI.

### App795 / requester boundary
- App795 App Group = Public.
- ACL: `MBO_EMPLOYEE_ACCESS` View-only; Everyone all-NO.
- `s1` is not an authorized requester for Employee 0113 / TMH2.
- `tmh` is the correct shared Kintone requester boundary for this route.
- Do not weaken `RoutingService.assertRequesterAuthorized()` to make `s1` pass.

### App796
- Effective state: App Group Public, `MBO_EMPLOYEE_ACCESS` View-only, Everyone all-NO.
- runtime scoring lookup succeeds under `tmh`.
- governance note: user executed the App796 settings change before explicit Control Plane write authorization; do not retroactively call that write authorized.
- no further App796 write is authorized.

## 5. Current Live UI Correctness Defects

### A. Fabricated workflow/comment history

Existing App794 detail screenshot showed native Kintone Comments = `No comments available`, while custom `Workflow Action Timeline` displayed sample Approved/Returned/Resubmitted events.

Independent source inspection found `_renderWorkflowActionTimeline()` falls back to hard-coded sample events whenever `previewOptions.timelineEvents` is absent.

This is a **Live data-truthfulness defect**, not merely UI polish.

Required durable rule is now in:
`CONFIRMED_BASELINE/D1_LIVE_UI_TRUTHFULNESS_ATTACHMENTS.md`.

### B. Attachment lifecycle/display incomplete

Independent source inspection found:
- `_renderAttachmentControl()` can read existing FILE field data but does not present a complete all-file lifecycle;
- current control can surface only the first filename in the relevant branch;
- `.mbo-attachment-file-input` has no complete selection/upload/bind handler in `_bindEvents()`;
- `.mbo-attachment-remove-btn` has no complete remove lifecycle;
- user therefore cannot reliably distinguish selected/pending/saved/multiple-file state.

Required target:
- no file = explicit No attachment;
- local selected = every filename + Pending save;
- saved = every actual Kintone filename;
- editable remove/change = exact target field only;
- Live never shows preview fixture filenames;
- Kintone FILE fields only, no external storage.

## 6. Current Active Task — Exact Next Execution

`AI_ACTIVE_TASK.md` currently authorizes:

```text
D1 LIVE TIMELINE TRUTHFULNESS + ATTACHMENT CORRECTIVE
MODE = ANTIGRAVITY SOURCE/TEST ONLY
LIVE KINTONE WRITE = NO
APP794 DEPLOY = NO
```

Expected execution scope:
- `src/ui/employee-part-a-ui.js` first;
- at most one small helper/module only if clearly justified for attachment pending/upload state;
- focused tests + full `npm test` + module-aware build;
- zero Live Kintone writes;
- commit + push;
- STOP; Antigravity cannot self-PASS.

**New chat must not assume this task has executed.** Re-fetch HEAD and inspect commits/diff first.

## 7. D1 Still Open — Priority After Current Corrective

Priority order:
1. independently review timeline truthfulness + attachment source/test corrective;
2. if PASS, obtain a NEW explicit App794 deploy authorization before Live customization deploy;
3. Live UAT timeline/comments/attachment behavior;
4. implement production HR / `admin-form` Reset MBO Password UI/function inside Kintone;
5. remaining session/security UAT: reload, independent tab, tampered/expired session, wrong Kintone principal, logout revoke, own password rotation, disabled/locked restore denial;
6. wrong-password 5-attempt / 15-minute lockout UAT — requires separate explicit App801 mutation authorization;
7. own detail/edit continuity + cross-employee block evidence;
8. no-secret-exposure check;
9. final independent D1 closure review.

Do not skip the current UI-data truthfulness defect and jump directly to reset UI.

## 8. Authorization State at Handoff

```text
NEXT_ACTION_OWNER              = ANTIGRAVITY / SOURCE+TEST ONLY IF TASK NOT YET EXECUTED
APP794 DEPLOY                  = NO
APP794 ACL/RECORD WRITE        = NO
APP801 WRITE                   = NO
APP795/796 WRITE               = NO
SOURCE CHANGE                  = YES / ONLY EXACT CURRENT ACTIVE TASK
EXTERNAL SERVICE               = NO
D2-D7 WRITE                    = NO
```

All previous App794 deploy one-shot authorizations are consumed/closed. Do not reuse them.
App795 access-correction authorization is consumed/closed.
No App796 authorization is active.

## 9. New-Chat Handoff Read Set

For the current gate, a new ChatGPT chat should read:
1. current HEAD;
2. `AI_CONTROL_CENTER.md`;
3. `AI_DOCUMENT_INDEX.md`;
4. `CONFIRMED_BASELINE/README.md`;
5. `CONFIRMED_BASELINE/D1_LIVE_UI_TRUTHFULNESS_ATTACHMENTS.md`;
6. `CONFIRMED_BASELINE/UI_UX.md` only where needed;
7. `CONFIRMED_BASELINE/SOURCE_CODE_ARCHITECTURE.md` only where needed;
8. `AI_ACTIVE_TASK.md`;
9. exact latest diff/evidence after the handoff commit.

Do NOT broad-read historical handoff/current-state/review-package files.
Do NOT revive Auth Bridge.

## 10. Handoff State

```text
HANDOFF_READY = YES
CURRENT_GATE  = D1 LIVE TIMELINE TRUTHFULNESS + ATTACHMENT CORRECTIVE
CURRENT_MODE  = SOURCE/TEST ONLY / NO LIVE WRITE
NEXT REVIEW   = USER SAYS `review` AFTER ANTIGRAVITY COMMIT/PUSH
```
