# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual execution is required
> Updated: 2026-08-29 — INDEPENDENT REVIEW CORRECTIVE: ATTACHMENT PERSISTENCE

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|---|
| D1 | Login + Password Change + Employee-Self MBO Gate | 🟠 KINTONE-ONLY / APP801 ACCESS PASS / RESET+FORCE-CHANGE+MY MBO PASS / APP794 ACL PASS / EMPLOYEE-SELF UI PASS / CREATE-HANDLER PASS / APP795 ACCESS PASS / APP796 RUNTIME READ PASS / CREATE-SHOW INITIALIZATION PASS / TIMELINE TRUTHFULNESS PASS / APP794 LIVE REV46 / ATTACHMENT POST-SAVE REST ARCHITECTURE CORE PASS / REMOVE-DESIRED-STATE + POST-SAVE-VISIBILITY CORRECTIVE REQUIRED / HR+ADMIN RESET UI OPEN / REMAINING SECURITY UAT OPEN |
| D2 | Excel + PDF legacy-format export | 🟠 IN PROGRESS |
| D3 | 8 legacy PMS apps -> App794 | 🟠 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | App800 HR Control Center end-to-end | 🟠 IN PROGRESS |
| D5 | Copy own previous MBO | 🔴 MUST FIX / NOT CLOSED |
| D6 | Integrated E2E / Security / Regression | 🔴 BLOCKED UNTIL CONSTITUENT WORK IS READY |
| D7 | Admin Support Center | ✅ SOURCE FUNCTIONALITY CLOSED / REOPEN ONLY ON NEW DEFECT |

No AI may silently drop D1–D7.

## 2. Accepted Architecture / Boundaries

```text
D1_ARCHITECTURE                    = KINTONE-ONLY
EXTERNAL_SERVER_SERVICE            = FORBIDDEN
AUTH_BRIDGE                        = CANCELLED / DO NOT IMPLEMENT
APP794_LIVE_CUSTOMIZATION_REVISION = 46
ONE_SHOT_DEPLOY_AUTHORIZATION      = CONSUMED / CLOSED
SOURCE_MODULARITY_POLICY           = MANDATORY / NO CATCH-ALL SOURCE FILES
```

Do not reopen accepted App795/App796 permissions, requester routing, login/session architecture, or unrelated D1 work unless new evidence directly requires it.

## 3. Independent Review — Commit d1e51d2

Reviewed executor commit:
`d1e51d25862794f6dce7ecff8809df5622011e38`

Authorized start HEAD:
`63010a394c128b5565f2d9547129e3d9db60f725`

Changed files are limited to the authorized attachment corrective scope:
- `src/services/mbo-attachment-service.js`
- `src/ui/employee-part-a-ui.js`
- `src/main-mbo-app.js`
- `tests/timeline-truthfulness-and-attachment.test.js`
- generated `dist/mbo-employee-app.js`
- `project-docs/D1_ATTACHMENT_PERSISTENCE_CORRECTIVE_EVIDENCE.md`

No deploy or Live Kintone write was authorized or reported.

### 3.1 Core Kintone-supported persistence architecture — PASS

Independent source inspection confirms:
- submit handler validates first;
- pre-save pending file upload produces fileKey plan;
- submit path no longer overwrites Attachment fields in `event.record`;
- `app.record.create.submit.success` and `app.record.edit.submit.success` use `event.appId` / `event.recordId` and finalize via Kintone Update Record REST API;
- attachment persistence logic remains in the dedicated attachment service/UI modules; `main-mbo-app.js` is orchestration-only;
- unrelated attachment fields are omitted from exact-field REST payloads.

Therefore:

```text
D1_ATTACHMENT_POST_SAVE_REST_ARCHITECTURE_CORE = PASS
D1_SUBMIT_EVENT_FILE_FIELD_NON_MUTATION         = PASS
```

Executor evidence reports focused 19/19, full npm test 871/871, build and build-only PASS, Live write 0, deploy NO. GitHub has no independent CI statuses for this commit, so these execution results are accepted as executor evidence, not independently rerun by ChatGPT.

### 3.2 Blocker A — saved-file remove desired state is not persisted

Current UI remove handler removes an existing saved file only from:
`this.record[targetCode].value`.

Current `prepareAttachmentPlan()` builds plans only from keys present in `pendingAttachments` and reads its retained-file set from the submit `event.record` passed to it.

There is no explicit removed-file / dirty-field state carried from UI into the prepared post-save plan. Therefore a user can see a saved attachment disappear in the custom UI but the post-save REST plan may not contain that removal, so the actual Kintone FILE field can retain the file.

The original required test `EXPLICIT_REMOVE_DESIRED_STATE` is also absent from the reported 19-test list.

Therefore:

```text
D1_ATTACHMENT_REMOVE_DESIRED_STATE = FAIL / MUST FIX
```

### 3.3 Blocker B — post-save failure visibility is not proven for real redirect behavior

Current submit-success catch calls `showValidationErrors(...)` and then returns the success event. Kintone Save Success events support Promises and redirect behavior. An inline error rendered into the current page is not sufficient proof that the user will actually see the failure before the normal post-save navigation occurs.

Required behavior remains truthful:
- record save already succeeded;
- attachment REST binding failed;
- user must receive a visible failure that cannot silently disappear during redirect.

Acceptable implementation may retain the page on failure via supported success-event redirect handling, or use another clearly visible Kintone/browser notification mechanism. Do not pretend the record save rolled back.

Therefore:

```text
D1_POST_SAVE_BIND_FAILURE_VISIBLE_RUNTIME = NOT PROVEN / MUST FIX
```

## 4. Exact Current Gate

```text
CURRENT_GATE       = D1 ATTACHMENT REMOVE-STATE + POST-SAVE-VISIBILITY CORRECTIVE
CURRENT_MODE       = SOURCE/TEST ONLY
NEXT_ACTION_OWNER  = ANTIGRAVITY / EXACT ACTIVE TASK ONLY
APP794 DEPLOY      = NO
LIVE WRITE         = NO
APP801 WRITE       = NO
APP795/796 WRITE   = NO
D2-D7 WRITE        = NO
```

Do NOT reimplement the accepted post-save REST architecture.

## 5. Minimum remaining verification

Must prove:
1. existing saved file + no removal + add new => old file preserved + new file bound;
2. explicit removal of one saved file => prepared plan contains exact retained desired set and REST update removes only that file;
3. remove + add in same field => exact retained + new fileKeys;
4. unrelated attachment fields untouched;
5. realistic `type: 'FILE'` submit event remains unchanged;
6. post-save REST failure produces runtime-visible truthful notice that survives/prevents silent redirect;
7. focused tests, full `npm test`, build, build-only PASS;
8. Live write = 0 and deploy = NO.

## 6. Development Governance

- Antigravity performs only execution requiring local/runtime access.
- ChatGPT owns diagnosis, planning, Git review, acceptance and Control Plane documentation.
- Keep attachment behavior in the dedicated attachment service/UI modules.
- `src/main-mbo-app.js` remains orchestration-only.
- No broad refactor; no unrelated source changes.

## 7. Handoff

```text
REVIEW_RESULT  = CORRECTIVE
CORE_ARCH       = PASS
BLOCKERS        = REMOVE DESIRED STATE + POST-SAVE FAILURE VISIBILITY
DEPLOY          = NOT AUTHORIZED
NEXT OWNER      = ANTIGRAVITY / EXACT ACTIVE TASK ONLY
```
