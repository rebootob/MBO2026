# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual execution is required
> Updated: 2026-08-29 — APP794 REV48 / CREATE ATTACHMENT PASS / EDIT ATTACHMENT PRESERVATION FAIL

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|---|
| D1 | Login + Password Change + Employee-Self MBO Gate | 🟠 KINTONE-ONLY / APP794 customization rev47 / form schema rev48 / Timeline truthfulness PASS / Objective FILE schema corrective PASS / **initial Objective attachment Save works for one and multiple files, but editing the same request then adding a new file fails and previously multiple files may collapse to only the first — EDIT ATTACHMENT PRESERVATION CORRECTIVE REQUIRED** / HR+admin reset UI open / remaining security UAT open |
| D2 | Excel + PDF legacy-format export | 🟠 IN PROGRESS |
| D3 | 8 legacy PMS apps -> App794 | 🟠 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | App800 HR Control Center end-to-end | 🟠 IN PROGRESS |
| D5 | Copy own previous MBO | 🔴 MUST FIX / NOT CLOSED |
| D6 | Integrated E2E / Security / Regression | 🔴 BLOCKED UNTIL CONSTITUENT WORK IS READY |
| D7 | Admin Support Center | ✅ SOURCE FUNCTIONALITY CLOSED / REOPEN ONLY ON NEW DEFECT |

No AI may silently drop D1–D7.

## 2. Accepted State

```text
D1_ARCHITECTURE                     = KINTONE-ONLY
EXTERNAL_SERVER_SERVICE             = FORBIDDEN
AUTH_BRIDGE                         = CANCELLED / DO NOT IMPLEMENT
APP794_LIVE_CUSTOMIZATION_REVISION  = 47
APP794_LIVE_FORM_REVISION           = 48
OBJECTIVE_ATTACHMENT_FIELDS         = FILE 10/10 — PASS
MIDYEAR_ATTACHMENT_FIELDS           = FILE 10/10 — PASS
FINAL_ATTACHMENT_FIELDS             = FILE 10/10 — PASS
SCHEMA_CORRECTIVE_COMMIT             = afc11bf028b56605efba24ef0a1b70a421abce73
SCHEMA_CORRECTIVE_AUTHORIZATION      = CONSUMED / CLOSED
CUSTOMIZATION_DEPLOY_AUTHORIZATION   = CONSUMED / CLOSED
SOURCE_MODULARITY_POLICY             = MANDATORY
```

Schema-gap root cause is closed. Do not remove/recreate Objective FILE fields.

## 3. New Live UAT Evidence — Edit Attachment Defect

User Live UAT after App794 form rev48:

```text
INITIAL_SAVE_ONE_FILE               = PASS
INITIAL_SAVE_MULTIPLE_FILES         = PASS
EDIT_EXISTING_REQUEST_ADD_NEW_FILE  = FAIL
EDIT_MULTI_FILE_PRESERVATION        = FAIL — previously multiple files may reduce to only first file
```

This is now the active attachment defect.

## 4. Independent Source / Platform Diagnosis

Current source in `src/main-mbo-app.js` calls:

```text
activeUiInstance.preparePendingAttachments({ record: event.record })
```

from the shared `app.record.create.submit` / `app.record.edit.submit` handler.

Current `prepareAttachmentPlan()` in `src/services/mbo-attachment-service.js` uses `record[targetCode].value` as the retained saved-file base when there is a pending add and no explicit removal snapshot.

Kintone documented behavior relevant to Edit:
- values from Attachment fields cannot be retrieved from `app.record.edit.submit`;
- Update Record for an Attachment field is full desired-state semantics: to add a new file while keeping existing files, the request must include the fileKeys of every existing file to retain; files omitted from the request are deleted.

Therefore `event.record` from `app.record.edit.submit` is not a valid authoritative source for existing attachment fileKeys.

Evidence-backed defect mechanism:

```text
EDIT SHOW / persisted record
  -> existing files exist
  -> user adds pending file
  -> edit.submit event fires
  -> source reads Attachment base from edit.submit event.record
  -> Attachment values are unavailable/non-authoritative in this event
  -> prepared plan may omit existing fileKeys
  -> post-save PUT sends incomplete desired Attachment array
  -> existing files may disappear/collapse and edit-add behavior becomes incorrect
```

Existing tests missed this because tests such as `SUBMIT_EVENT_ATTACHMENT_OBJECT_UNCHANGED` and remove/add handler fixtures populate saved FILE values inside the simulated `edit.submit` record object. That does not reproduce the documented Live limitation.

## 5. Required Corrective Architecture

For **Edit only**, when an attachment field has pending/dirty state:
1. do not use `app.record.edit.submit` Attachment values as the retained-file source;
2. obtain authoritative persisted attachment state for the current record before building the plan, preferably by Kintone GET Record using `event.appId + event.recordId` inside the async submit handler;
3. use the persisted FILE arrays as the base for add-only operations;
4. explicit UI removal desired-state remains authoritative for user-requested removal;
5. upload pending files and append their temporary upload fileKeys;
6. post-save Update Record must contain the exact full desired fileKey set for the target field only;
7. unrelated attachment fields must be omitted;
8. Create flow must remain unchanged.

No schema change is required for this corrective.

## 6. Exact Current Gate

```text
CURRENT_GATE          = D1 APP794 EDIT ATTACHMENT PRESERVATION CORRECTIVE
CURRENT_MODE          = ANTIGRAVITY SOURCE/TEST ONLY
NEXT_ACTION_OWNER     = ANTIGRAVITY / EXACT ACTIVE TASK ONLY
SOURCE CHANGE         = YES — exact edit attachment persistence corrective only
APP794 CUSTOMIZATION  = NO DEPLOY
APP794 FORM/SCHEMA    = NO WRITE
APP794 RECORD WRITE   = NO LIVE WRITE
APP794 ACL/PROCESS    = NO
APP801 WRITE          = NO
APP795/796 WRITE      = NO
D2-D7 WRITE           = NO
```

## 7. Required Source/Test Proof Before Any Deploy

Must prove at minimum:

```text
EDIT_ADD_ONLY_WITH_SUBMIT_ATTACHMENT_UNAVAILABLE_PRESERVES_ALL_EXISTING
EDIT_MULTIPLE_EXISTING_FILES_DO_NOT_COLLAPSE
EDIT_ADD_MULTIPLE_NEW_FILES_PRESERVES_ALL_EXISTING
EDIT_REMOVE_PLUS_ADD_EXACT_DESIRED_STATE_WITH_SUBMIT_ATTACHMENT_UNAVAILABLE
EDIT_HANDLER_USES_AUTHORITATIVE_PERSISTED_RECORD_NOT_SUBMIT_ATTACHMENT_VALUE
UNRELATED_ATTACHMENT_FIELDS_UNCHANGED
CREATE_ONE_FILE_REGRESSION
CREATE_MULTIPLE_FILE_REGRESSION
MIDYEAR_FINAL_REGRESSION
NO_LIVE_NETWORK_IN_TESTS
FULL_NPM_TEST_PASS
UI_BUILD_PASS
BUILD_ONLY_PASS
```

The realistic edit-submit fixture must intentionally make Attachment values unavailable/empty and must not silently copy attachment values from the edit-show record.

## 8. Handoff

```text
SCHEMA_GAP                    = CLOSED / PASS
INITIAL_ATTACHMENT_CREATE     = PASS
EDIT_ATTACHMENT_ADD           = FAIL
EDIT_MULTI_FILE_PRESERVATION  = FAIL
PRIMARY_SOURCE_DEFECT         = EDIT.SUBMIT ATTACHMENT VALUES USED AS RETAINED-FILE BASE
NEXT STEP                     = SOURCE/TEST CORRECTIVE ONLY
NEXT OWNER                    = ANTIGRAVITY
DEPLOY                         = NO
LIVE RECORD WRITE              = NO
```
