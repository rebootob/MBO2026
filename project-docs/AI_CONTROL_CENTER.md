# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual execution is required
> Updated: 2026-08-29 — LIVE UAT FAIL: ATTACHMENT PERSISTENCE LIFECYCLE

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|---|
| D1 | Login + Password Change + Employee-Self MBO Gate | 🟠 KINTONE-ONLY / APP801 ACCESS PASS / RESET+FORCE-CHANGE+MY MBO PASS / APP794 ACL PASS / EMPLOYEE-SELF UI PASS / CREATE-HANDLER PASS / APP795 ACCESS PASS / APP796 RUNTIME READ PASS / CREATE-SHOW INITIALIZATION PASS / TIMELINE TRUTHFULNESS PASS / ATTACHMENT DISPLAY+PENDING+REMOVE PASS / APP794 DEPLOY REV46 PASS / **LIVE ATTACHMENT SAVE FAIL — CORRECTIVE REQUIRED** / HR+ADMIN RESET UI OPEN / REMAINING SECURITY UAT OPEN |
| D2 | Excel + PDF legacy-format export | 🟠 IN PROGRESS |
| D3 | 8 legacy PMS apps -> App794 | 🟠 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | App800 HR Control Center end-to-end | 🟠 IN PROGRESS |
| D5 | Copy own previous MBO | 🔴 MUST FIX / NOT CLOSED |
| D6 | Integrated E2E / Security / Regression | 🔴 BLOCKED UNTIL CONSTITUENT WORK IS READY |
| D7 | Admin Support Center | ✅ SOURCE FUNCTIONALITY CLOSED / REOPEN ONLY ON NEW DEFECT |

No AI may silently drop D1–D7.

## 2. Non-Negotiable Architecture / Accepted State

```text
D1_ARCHITECTURE                    = KINTONE-ONLY
EXTERNAL_SERVER_SERVICE            = FORBIDDEN
AUTH_BRIDGE                        = CANCELLED / DO NOT IMPLEMENT
APP794_LIVE_CUSTOMIZATION_REVISION = 46
ONE_SHOT_DEPLOY_AUTHORIZATION      = CONSUMED / CLOSED
SOURCE_MODULARITY_POLICY           = MANDATORY / NO CATCH-ALL SOURCE FILES
```

Do not reopen accepted App795/App796 permissions, requester routing, login/session architecture, or unrelated D1 work unless new evidence directly requires it.

## 3. Live UAT Evidence — Attachment Save Failure

User Live evidence on 2026-08-29 shows App794 Edit Save fails with Kintone banner:

```text
An error occurred while running the JavaScript for customization of the app.
- event.record['Objective_Attachment_1'].type is invalid.
```

The failure occurs after selecting a pending Objective attachment and pressing native Kintone Save.

Independent source inspection identifies the immediate defect in:
`src/services/mbo-attachment-service.js`

Current code replaces the native Kintone field object:

```js
record[targetCode] = { value: savedFiles };
```

This destroys native field metadata such as `type: 'FILE'`, causing the observed `type is invalid` error.

However, the correct fix is **not** merely to restore `type`.

Kintone's supported JavaScript event-object rules do not allow Attachment field values to be overwritten through create/edit submit event objects. Kintone's supported file persistence flow is:

```text
Upload File API
-> receive temporary upload fileKey
-> save/create the record normally
-> bind attachment using Add/Update Record REST API
```

Current production submit handler instead uploads and attempts Attachment binding directly into `event.record` before returning `app.record.create.submit` / `app.record.edit.submit`, which is an unsupported persistence boundary.

Therefore prior source/test acceptance for the attachment **submit binding mechanism** is superseded by Live evidence.

## 4. Revised Attachment Persistence Architecture — Corrective Target

Keep existing truthful UI states and pending-file model, but change persistence lifecycle only.

Required supported flow:

```text
EDIT/CREATE UI
  -> local pending file(s)

app.record.create.submit / app.record.edit.submit
  -> sync DOM
  -> existing auth / duplicate / business validation
  -> upload pending files to Kintone temporary file storage
  -> receive fileKey(s)
  -> DO NOT mutate Attachment field in event.record
  -> keep a prepared attachment binding plan in module/UI memory
  -> return event so native Kintone record save proceeds

app.record.create.submit.success / app.record.edit.submit.success
  -> use event.appId + event.recordId
  -> read current saved attachment field state as required
  -> bind prepared fileKey(s) using Kintone Update Record REST API
  -> preserve unrelated attachment fields and retained existing files
  -> fail visibly if post-save attachment binding fails
```

Important semantics:
- pre-save upload failure may still cancel save fail-closed;
- post-save REST binding failure cannot pretend the record save failed; it must report clearly that the record saved but attachment persistence failed;
- no direct `event.record.Attachment = ...` or `event.record.Attachment.value = ...` binding in submit handler;
- no external storage/service;
- no broad refactor.

## 5. Exact Current Gate

```text
CURRENT_GATE       = D1 ATTACHMENT KINTONE-SUPPORTED PERSISTENCE CORRECTIVE
CURRENT_MODE       = SOURCE/TEST ONLY
NEXT_ACTION_OWNER  = ANTIGRAVITY / EXACT ACTIVE TASK ONLY
APP794 DEPLOY      = NO
LIVE WRITE         = NO
APP801 WRITE       = NO
APP795/796 WRITE   = NO
D2-D7 WRITE        = NO
```

Production deployment revision 46 remains the current Live state, but Live UAT for attachment persistence is **FAIL**.

No new deployment is authorized. A new one-shot App794 deployment may be requested only after the corrective source/test gate passes independent review.

## 6. Corrective Scope

Smallest allowed implementation scope:
- `src/services/mbo-attachment-service.js` (preferred persistence logic owner);
- `src/ui/employee-part-a-ui.js` only where attachment pending/prepared state API must change;
- `src/main-mbo-app.js` orchestration only: submit prepare + submit.success finalize;
- focused attachment lifecycle tests;
- generated `dist` only through normal build;
- concise verification evidence.

Do not move unrelated logic into `main-mbo-app.js`. Keep feature/persistence behavior in the attachment service/UI module.

## 7. Required Corrective Verification

Tests must prove at minimum:
1. pending upload in submit path produces fileKey plan but does **not** mutate Attachment field object/value in submit event;
2. create submit success uses returned Record ID and Update Record API to bind exact Objective attachment;
3. edit submit success binds exact target field;
4. existing saved attachment files are preserved unless user explicitly removed them;
5. unrelated attachment fields remain unchanged;
6. remove/change desired-state semantics remain truthful;
7. upload failure before save cancels submit fail-closed;
8. post-save REST binding failure produces explicit visible/diagnostic failure and does not claim record save rollback;
9. zero pending attachments causes no attachment REST update;
10. no Live network calls in unit tests;
11. existing timeline truthfulness regressions remain PASS;
12. full required test suite + build/build-only PASS.

## 8. Authorization State

```text
SOURCE CHANGE             = YES / EXACT CORRECTIVE TASK ONLY
APP794 DEPLOY             = NO
APP794 RECORD/ACL/SCHEMA  = NO LIVE WRITE
APP801 WRITE              = NO
APP795/796 WRITE          = NO
ROUTING/SCORING/AUTH      = NO
RESET PASSWORD            = NO
D2-D7 EXECUTION           = NO
EXTERNAL SERVICE          = NO
```

## 9. Development Governance Reminder

- Antigravity performs only execution that genuinely requires the local/runtime environment.
- ChatGPT owns diagnosis, architecture, planning, Git review, acceptance and Control Plane documentation.
- Source must remain modular by feature/responsibility.
- `src/main-mbo-app.js` remains orchestration-only.
- Do not solve this by adding unrelated code to one large file.
- Do not broad-scan or broad-refactor.

## 10. Handoff State

```text
CURRENT_GATE   = D1 ATTACHMENT PERSISTENCE CORRECTIVE
REVIEW_RESULT  = LIVE UAT FAIL / ROOT CAUSE CONFIRMED
NEXT OWNER     = ANTIGRAVITY / EXACT ACTIVE TASK ONLY
DEPLOY         = NOT AUTHORIZED
```
