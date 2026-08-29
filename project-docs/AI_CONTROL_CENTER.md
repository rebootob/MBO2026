# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual execution is required
> Updated: 2026-08-29

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|---|
| D1 | Login + Password Change + Employee-Self MBO Gate | 🟠 KINTONE-ONLY / APP801 ACCESS PASS / RESET+FORCE-CHANGE+MY MBO PASS / APP794 ACL+DEPLOY PASS / EMPLOYEE-SELF UI PASS / CREATE-HANDLER FIX PASS / APP795 ACCESS PASS / APP796 RUNTIME READ PASS / CREATE-SHOW INITIALIZATION PASS / LIVE DETAIL UI TRUTHFULNESS+ATTACHMENT CORRECTIVE REQUIRED / HR+ADMIN RESET UI STILL OPEN / REMAINING SECURITY UAT OPEN |
| D2 | Excel + PDF legacy-format export | 🟠 IN PROGRESS |
| D3 | 8 legacy PMS apps -> App794 | 🟠 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | App800 HR Control Center end-to-end | 🟠 IN PROGRESS |
| D5 | Copy own previous MBO only | 🔴 MUST FIX |
| D6 | Integrated E2E / Security / Regression | 🔴 BLOCKED |
| D7 | Admin Support Center | ✅ SOURCE FUNCTIONALITY CLOSED / MODULE-AWARE BUNDLE DEPENDENCY CLOSURE ACCEPTED |

No AI may silently drop D1–D7.

## 2. Architecture / Gate Ledger

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
D1_RESET_PASSWORD_0113                  = PASS / AUTHORIZATION CONSUMED
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
D1_LIVE_TIMELINE_TRUTHFULNESS           = FAIL / LIVE UI FALLS BACK TO HARD-CODED SAMPLE EVENTS WHEN NO timelineEvents DATA EXISTS
D1_NATIVE_KINTONE_COMMENTS              = REAL SOURCE / USER SCREENSHOT SHOWS `No comments available`
D1_ATTACHMENT_DISPLAY                   = FAIL / LIVE READ-ONLY UI ONLY SHOWS FIRST NAME OR NO-attachment STATE; NEED ALL REAL FILES VISIBLE
D1_ATTACHMENT_EDIT_LIFECYCLE            = FAIL / CUSTOM FILE INPUT HAS NO UPLOAD/BIND/REMOVE EVENT HANDLER IN `_bindEvents()`
D1_LIVE_CUTOVER                         = BLOCKED UNTIL UI TRUTHFULNESS+ATTACHMENT CORRECTIVE + HR/ADMIN RESET UI + REMAINING D1 SECURITY/UAT CLOSURE
D2-D7 LIVE WRITES                       = NOT AUTHORIZED unless separately recorded
```

## 3. Non-Negotiable Constraint

D1 must finish entirely inside Kintone. No external server, auth service, database, reverse proxy, session service, or Auth Bridge.

## 4. Accepted Existing Live Evidence

### App794 Employee-Self
- Employee Code `0113` login/session continuity works.
- My MBO shell, Change Password, Logout are live.
- Create reaches `/k/794/edit` without MBO re-login.
- old `kintone.app.record.get() in handler` defect is resolved.
- Create-show for Employee `0113` under Kintone principal `tmh` successfully loads employee profile, TMH2 routing, Section Manager scoring profile, and custom MBO UI.

### App795 / requester boundary
- App795 ACL revision `8 -> 9`, App Group Public, `MBO_EMPLOYEE_ACCESS` View-only, Everyone all-NO.
- `s1` is not an authorized requester for Employee 0113 / Section TMH2.
- `tmh` is the correct shared Kintone requester boundary for this route.

### App796
- Current effective state: App Group Public, `MBO_EMPLOYEE_ACCESS` View-only, Everyone all-NO.
- Runtime scoring lookup now succeeds under `tmh`.
- Governance note remains: user executed this settings change before a proposed explicit Control Plane write authorization; do not retroactively describe it as authorized.

## 5. New Live Detail UI Correctness Findings

User opened an existing App794 record and observed apparent comments/history even though the native Kintone comment panel states `No comments available`, and attachment cells do not clearly show attachment state/name after selection.

Independent source inspection confirms two defects in `src/ui/employee-part-a-ui.js`.

### A. Hard-coded sample workflow timeline leaks into Live

`_renderWorkflowActionTimeline()` currently uses:
```text
this.previewOptions.timelineEvents || [ hard-coded sample events ... ]
```

The hard-coded fallback contains fictitious people/actions/timestamps such as Approved Objectives, Returned for Revision, Resubmitted Objectives and a `View Comments` notice. Therefore Live mode can display fabricated workflow/comment history when no real timeline data was supplied.

Required correction:
- hard-coded fixture events may exist only in explicit preview/test mode;
- Live must never fabricate events/comments;
- if no authoritative timeline data exists, render an honest empty state such as `ยังไม่มีประวัติการดำเนินการ / No workflow history available` or omit the custom timeline;
- native Kintone Comments remains the authoritative comment channel; do not invent comments from workflow status.

### B. Attachment custom UI is incomplete

`_renderAttachmentControl()` can inspect a FILE field and render a filename, but currently:
- it only surfaces the first filename in that control;
- its editable `<input type="file" class="mbo-attachment-file-input">` is not handled in `_bindEvents()`;
- no upload -> `fileKey` -> record-field binding lifecycle is implemented for the custom attachment input;
- remove button handling is also absent;
- this makes selected/saved state unclear and can leave users unable to confirm what was attached.

Required UX target:
- no file: explicit `ไม่มีไฟล์แนบ / No attachment`;
- selected but not yet saved: show filename(s) immediately and an explicit pending state;
- successfully bound/saved file: show all actual filenames, not only the first;
- editable state provides remove/change with truthful state updates;
- read-only detail shows all real attached filenames and, where safe/available, download/open action;
- never show preview/sample filenames in Live;
- keep per-objective attachment fields separate (`Objective_Attachment_n`, Mid-Year/Self equivalents as already designed).

Implementation must use the existing Kintone FILE fields and Kintone-only session context. Do not introduce external storage/service.

## 6. D1 Create-Show UAT — PASS

Classification remains:
```text
D1_CREATE_SHOW_INITIALIZATION = PASS
APP795_RUNTIME_ROUTE_READ      = PASS
APP796_RUNTIME_SCORING_READ    = PASS
EMPLOYEE_PROFILE_AUTOLOAD      = PASS
```

The new UI correctness defects do not reopen the accepted create-handler/routing/scoring fixes; they are a separate narrow corrective.

## 7. D1 Still Open — Mandatory Remaining Work

D1 is not closed yet. Priority order now:
1. fix Live timeline truthfulness + attachment lifecycle/display;
2. implement production HR / `admin-form` Reset MBO Password UI/function inside Kintone;
3. complete remaining session/security UAT: reload, independent new tab, tampered/expired session, wrong Kintone principal, logout revoke, own password change rotation, disabled/locked restore denial;
4. wrong-password 5-attempt / 15-minute lockout UAT (requires separate App801 write authorization before live mutation);
5. detail/edit own-record continuity and cross-employee block evidence;
6. final no-secret-exposure check;
7. final independent D1 closure review.

## 8. Authorization State

```text
NEXT_ACTION_OWNER              = ANTIGRAVITY SOURCE/TEST ONLY AFTER ACTIVE TASK
APP794 DEPLOY                  = NO
APP794 ACL/RECORD WRITE        = NO
APP801 WRITE                   = NO
APP795/796 WRITE               = NO
SOURCE CHANGE                  = YES / ONLY EXACT UI TRUTHFULNESS + ATTACHMENT CORRECTIVE DEFINED IN ACTIVE TASK
EXTERNAL SERVICE               = NO
D2-D7 WRITE                    = NO
```

## 9. Exact Next Action

Issue a narrow Antigravity SOURCE/TEST-only corrective for `employee-part-a-ui.js` (extract a small helper/module only if separation is clearly justified):
- eliminate fabricated Live timeline/comment events;
- implement truthful attachment state rendering and the Kintone-only file selection/upload/binding boundary;
- add focused tests for Live vs Preview and attachment states;
- no Live deploy/write.

After independent source/test review PASS, obtain a separate explicit App794 deploy authorization before changing Live customization.

## 10. Handoff Checkpoint

Start from `AI_DOCUMENT_INDEX.md`, this Control Center, `CONFIRMED_BASELINE/D1_AUTH_SECURITY.md`, `AI_ACTIVE_TASK.md`, current HEAD, and latest user Live screenshots. Never revive Auth Bridge; D1 remains KINTONE-ONLY.