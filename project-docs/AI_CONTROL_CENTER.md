# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual execution is required
> Updated: 2026-08-29 — EDIT ATTACHMENT CORRECTIVE REVIEW = CORRECTIVE / FAIL-CLOSED GAP

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|---|
| D1 | Login + Password Change + Employee-Self MBO Gate | 🟠 KINTONE-ONLY / App794 customization rev47 / form schema rev48 / Timeline truthfulness PASS / Objective FILE schema corrective PASS / initial one-file + multiple-file attachment Save PASS / **Edit attachment preservation candidate partially correct but independent review found unsafe fallback when authoritative persisted GET fails — CORRECTIVE REQUIRED before deploy** / HR+admin reset UI open / remaining security UAT open |
| D2 | Excel + PDF legacy-format export | 🟠 IN PROGRESS |
| D3 | 8 legacy PMS apps -> App794 | 🟠 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | App800 HR Control Center end-to-end | 🟠 IN PROGRESS |
| D5 | Copy own previous MBO | 🔴 MUST FIX / NOT CLOSED |
| D6 | Integrated E2E / Security / Regression | 🔴 BLOCKED UNTIL CONSTITUENT WORK IS READY |
| D7 | Admin Support Center | ✅ SOURCE FUNCTIONALITY CLOSED / REOPEN ONLY ON NEW DEFECT |

No AI may silently drop D1–D7.

## 2. Accepted State

```text
D1_ARCHITECTURE                    = KINTONE-ONLY
EXTERNAL_SERVER_SERVICE            = FORBIDDEN
AUTH_BRIDGE                        = CANCELLED / DO NOT IMPLEMENT
APP794_LIVE_CUSTOMIZATION_REVISION = 47
APP794_LIVE_FORM_REVISION          = 48
OBJECTIVE_ATTACHMENT_FIELDS        = FILE 10/10 — PASS
MIDYEAR_ATTACHMENT_FIELDS          = FILE 10/10 — PASS
FINAL_ATTACHMENT_FIELDS            = FILE 10/10 — PASS
SCHEMA_CORRECTIVE_COMMIT           = afc11bf028b56605efba24ef0a1b70a421abce73
SCHEMA_CORRECTIVE_AUTHORIZATION    = CONSUMED / CLOSED
CUSTOMIZATION_DEPLOY_AUTHORIZATION = NONE
SOURCE_MODULARITY_POLICY           = MANDATORY
```

Schema-gap root cause is closed. Do not remove/recreate Objective FILE fields.

## 3. User Live UAT — Active Edit Defect

```text
INITIAL_SAVE_ONE_FILE               = PASS
INITIAL_SAVE_MULTIPLE_FILES         = PASS
EDIT_EXISTING_REQUEST_ADD_NEW_FILE  = FAIL
EDIT_MULTI_FILE_PRESERVATION        = FAIL — multiple files may collapse to only first
```

## 4. Candidate Reviewed

Executor candidate:

`5bde56db0aa741a1064817454db028184556fe1d`

Accepted parts:
- edit submit attempts Kintone GET Record and passes `persistedRecord` into attachment planning;
- `prepareAttachmentPlan()` prefers `options.persistedRecord` for retained saved-fileKeys;
- realistic tests use empty/unavailable Attachment value in the edit-submit record;
- tests prove 1 existing + 1 new, 3 existing + 1 new, 2 existing + 2 new, and remove+add desired state;
- focused evidence reports 31/31 PASS; full suite 883/883 PASS; UI build and build-only PASS;
- no Live Kintone write and no customization deploy were reported;
- GitHub has no CI status checks for this commit, so local executor test/build evidence remains local evidence only.

## 5. Independent Review Verdict — CORRECTIVE

Blocking defect:

`src/main-mbo-app.js` catches persisted GET Record failure, logs `console.warn`, then continues with `persistedRecord = null`.

`src/services/mbo-attachment-service.js` then uses:

```js
const sourceRecord = options.persistedRecord || record;
```

which falls back to the `app.record.edit.submit` event record.

That fallback is forbidden for an Edit operation that changes attachments because Attachment values in `app.record.edit.submit` are non-authoritative/unavailable. A transient GET failure can therefore recreate the same destructive risk: incomplete desired fileKey array -> existing files omitted -> existing files removed/collapsed.

There is no focused test proving GET failure/null fails closed; the added tests only cover successful authoritative GET.

## 6. Required Corrective

For Edit attachment changes only:
1. determine whether attachment state is pending/dirty before requiring persisted-state read;
2. if there is no attachment change, normal non-attachment Edit Save must not be blocked by attachment GET;
3. if there is an attachment change, App ID + Record ID + authoritative persisted-record read are mandatory;
4. if GET throws, returns null, or cannot provide the target persisted FILE field(s), cancel submit visibly and **do not upload/bind anything**;
5. never fall back to `edit.submit event.record` as the retained-file source when persisted state is required;
6. add-only = all persisted existing fileKeys + all new fileKeys;
7. explicit removal snapshot remains authoritative;
8. remove+add = exact retained fileKeys + all new fileKeys;
9. Create flow remains unchanged;
10. unrelated attachment fields remain absent from update payload.

## 7. Exact Current Gate

```text
CURRENT_GATE          = D1 APP794 EDIT ATTACHMENT PRESERVATION — FAIL-CLOSED CORRECTIVE
CURRENT_MODE          = ANTIGRAVITY SOURCE/TEST ONLY
NEXT_ACTION_OWNER     = ANTIGRAVITY / EXACT ACTIVE TASK ONLY
REVIEWED_CANDIDATE    = 5bde56db0aa741a1064817454db028184556fe1d
INDEPENDENT_VERDICT   = CORRECTIVE
SOURCE CHANGE         = YES — narrow fail-closed corrective only
APP794 CUSTOMIZATION  = NO DEPLOY
APP794 FORM/SCHEMA    = NO WRITE
APP794 RECORD WRITE   = NO LIVE WRITE
APP794 ACL/PROCESS    = NO
APP801 WRITE          = NO
APP795/796 WRITE      = NO
D2-D7 WRITE           = NO
```

## 8. Required Proof Before Deploy Can Be Considered

Must preserve existing successful cases and add at minimum:

```text
EDIT_GET_RECORD_FAILURE_WITH_ATTACHMENT_CHANGE_FAILS_CLOSED
EDIT_GET_RECORD_NULL_WITH_ATTACHMENT_CHANGE_FAILS_CLOSED
EDIT_PERSISTED_TARGET_FILE_FIELD_MISSING_FAILS_CLOSED
EDIT_FAILURE_PATH_DOES_NOT_UPLOAD_NEW_FILE
EDIT_NO_ATTACHMENT_CHANGE_DOES_NOT_REQUIRE_PERSISTED_ATTACHMENT_GET
EDIT_NEVER_FALLS_BACK_TO_SUBMIT_ATTACHMENT_VALUE
EDIT_ADD_ONLY_WITH_SUBMIT_ATTACHMENT_UNAVAILABLE_PRESERVES_ALL_EXISTING
EDIT_MULTIPLE_EXISTING_FILES_DO_NOT_COLLAPSE
EDIT_ADD_MULTIPLE_NEW_FILES_PRESERVES_ALL_EXISTING
EDIT_REMOVE_PLUS_ADD_EXACT_DESIRED_STATE_WITH_SUBMIT_ATTACHMENT_UNAVAILABLE
UNRELATED_ATTACHMENT_FIELDS_UNCHANGED
CREATE_REGRESSION
MIDYEAR_FINAL_REGRESSION
FULL_NPM_TEST_PASS
UI_BUILD_PASS
BUILD_ONLY_PASS
```

No deployment authorization exists.
