# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual execution is required
> Updated: 2026-08-29 — INDEPENDENT PASS: ATTACHMENT PERSISTENCE SOURCE/TEST GATE

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|---|
| D1 | Login + Password Change + Employee-Self MBO Gate | 🟠 KINTONE-ONLY / prior accepted D1 states remain PASS / APP794 LIVE REV46 / TIMELINE TRUTHFULNESS PASS / ATTACHMENT POST-SAVE REST CORE PASS / POST-SAVE FAILURE VISIBILITY SOURCE PASS / DESIRED SAVED-FILE SNAPSHOT PASS / REGRESSION COVERAGE RESTORED PASS / **APP794 CORRECTIVE DEPLOY READY PENDING EXPLICIT USER AUTHORIZATION** / HR+admin reset UI open / remaining security UAT open |
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
PRIOR_ONE_SHOT_DEPLOY_AUTH         = CONSUMED / CLOSED
SOURCE_MODULARITY_POLICY           = MANDATORY / NO CATCH-ALL SOURCE FILES
```

Accepted and DO NOT REIMPLEMENT without new evidence:

```text
PRE_SAVE_UPLOAD_TO_FILEKEY                     = PASS
SUBMIT_EVENT_ATTACHMENT_NON_MUTATION           = PASS
CREATE_EDIT_SUBMIT_SUCCESS_HOOKS               = PASS
POST_SAVE_UPDATE_RECORD_REST_ARCHITECTURE      = PASS
POST_SAVE_FAILURE_VISIBLE_SOURCE               = PASS
EXPLICIT_DESIRED_SAVED_FILE_SNAPSHOT           = PASS
REAL_HANDLER_SEPARATE_SUBMIT_RECORD_REMOVAL    = PASS
TIMELINE_ATTACHMENT_REGRESSION_COVERAGE        = PASS
SOURCE_OWNERSHIP_MODULAR                       = PASS
```

## 3. Independent Review — Executor Commit `2aed3578b710e0283c7a436e7fa7a225ec3e7afb`

Authorized start HEAD:
`93a8c84d67edce7c7d814d958161cc53f2c06265`

Executor commit:
`2aed3578b710e0283c7a436e7fa7a225ec3e7afb`

Changed files are limited to the authorized remaining corrective scope:
- `src/services/mbo-attachment-service.js`
- `src/ui/employee-part-a-ui.js`
- `tests/timeline-truthfulness-and-attachment.test.js`
- generated `dist/mbo-employee-app.js`
- existing corrective evidence doc.

`src/main-mbo-app.js` was not changed in this corrective.
No deploy or Live Kintone write was authorized or reported.

### 3.1 Desired saved-file state — PASS

Independent source inspection confirms:
- UI saved-file removal stores an explicit `desiredSavedFiles[targetCode]` snapshot after the removal;
- `preparePendingAttachments()` passes that desired snapshot separately from the later Kintone submit `event.record`;
- `prepareAttachmentPlan()` prefers explicit desired saved-file state for dirty/canonical fields instead of re-reading removed files from submit `event.record`;
- remove + add combines retained desired fileKeys plus newly uploaded fileKeys;
- unrelated attachment fields remain absent from the exact-field REST plan;
- prepared state is cleared only after successful finalization.

The real registered `app.record.edit.submit` tests explicitly use a show-time record and a separate submit-event record that still contains the removed file, yet the prepared plan contains only the desired retained set. This closes the previous Live-lifecycle blocker.

Therefore:

```text
D1_ATTACHMENT_REMOVE_DESIRED_STATE = PASS
```

### 3.2 Regression coverage — PASS

Executor evidence reports:
- focused Timeline + Attachment suite: `26/26 PASS`;
- full `npm test`: `878/878 PASS`;
- `npm run ui:build`: PASS;
- module-aware build-only: PASS;
- Live Kintone write: `0`;
- Live deploy: `NO`.

The focused suite restores the previously deleted durable Timeline/Attachment cases and adds stronger real-handler desired-state tests. Test coverage is no longer reduced from the previously accepted suite.

GitHub has no independent CI status checks for this commit. Test/build results are accepted as executor-local evidence corroborated by the reviewed source/test diff; ChatGPT did not independently rerun the local suite.

Therefore:

```text
D1_TIMELINE_ATTACHMENT_REGRESSION_COVERAGE = PASS
```

### 3.3 Self Evaluation canonical attachment field

Current App794 schema source defines `Final_Attachment_n` as the canonical Self Evaluation FILE field. UI `Self_Attachment_n` compatibility/fallback must resolve to that canonical field. This is now recorded in the durable attachment baseline.

## 4. Exact Current Gate

```text
CURRENT_GATE       = D1 ATTACHMENT CORRECTIVE DEPLOY AUTHORIZATION HOLD
CURRENT_MODE       = CONTROL PLANE / NO EXECUTION
NEXT_ACTION_OWNER  = USER
APP794 DEPLOY      = NO — NEW EXPLICIT ONE-SHOT AUTHORIZATION REQUIRED
LIVE WRITE         = NO
APP801 WRITE       = NO
APP795/796 WRITE   = NO
D2-D7 WRITE        = NO
```

The source/test corrective is ready for a new App794 deployment, but **review alone is not deployment authorization**.

## 5. Next Authorized Sequence

After the user gives a new exact one-shot App794 corrective deployment authorization:
1. Antigravity performs only required preflight/build/backup/deploy/readback;
2. no source/refactor work during deployment;
3. Independent Review of deployment evidence;
4. Live UAT in App794 must prove:
   - Save with no attachment;
   - add one Objective attachment and Save;
   - add multiple attachments and Save;
   - saved filenames persist after reload;
   - remove one saved attachment and Save;
   - remove + add same field and Save;
   - unrelated attachment field stays unchanged;
   - Mid-Year attachment persistence;
   - Self Evaluation attachment persists through canonical `Final_Attachment_n`;
   - no `event.record[...].type is invalid` error;
   - post-save binding failure behavior remains truthful if intentionally exercised in a safe test context;
   - Timeline Live/Preview truthfulness remains unchanged.

## 6. Development Governance

- Antigravity performs only execution requiring local/runtime access.
- ChatGPT owns diagnosis, planning, Git review, acceptance and Control Plane docs.
- Keep persistence behavior in attachment service/UI modules.
- `src/main-mbo-app.js` remains orchestration-only.
- No broad refactor; no unrelated source changes.

## 7. Handoff

```text
REVIEW_RESULT         = PASS
ATTACHMENT_SOURCE_TEST = PASS
DEPLOY_READY          = YES / PENDING EXPLICIT USER AUTHORIZATION
DEPLOY_AUTHORIZATION  = NONE ACTIVE
NEXT OWNER            = USER
ANTIGRAVITY           = DO NOTHING UNTIL AUTHORIZED
```