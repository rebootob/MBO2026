# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual execution is required
> Updated: 2026-08-29 — INDEPENDENT REVIEW CORRECTIVE: ATTACHMENT DESIRED-STATE SNAPSHOT

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|---|
| D1 | Login + Password Change + Employee-Self MBO Gate | 🟠 KINTONE-ONLY / prior accepted D1 states remain PASS / APP794 LIVE REV46 / ATTACHMENT POST-SAVE REST CORE PASS / POST-SAVE FAILURE VISIBILITY SOURCE PASS / **SAVED-FILE REMOVE DESIRED-STATE + REGRESSION COVERAGE CORRECTIVE REQUIRED** / HR+admin reset UI open / remaining security UAT open |
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

Accepted from prior review and DO NOT REIMPLEMENT:

```text
PRE_SAVE_UPLOAD_TO_FILEKEY                = PASS
SUBMIT_EVENT_ATTACHMENT_NON_MUTATION      = PASS
CREATE_EDIT_SUBMIT_SUCCESS_HOOKS          = PASS
POST_SAVE_UPDATE_RECORD_REST_ARCHITECTURE = PASS
SOURCE_OWNERSHIP_MODULAR                  = PASS
```

## 3. Independent Review — Commit `3df7654b43925e3061c19fc81cdcddba7dc3724b`

Authorized start HEAD:
`83987037215813c44cd7a4b7470a5aa616ea7aad`

Executor commit:
`3df7654b43925e3061c19fc81cdcddba7dc3724b`

Changed files remain inside authorized scope:
- `src/services/mbo-attachment-service.js`
- `src/ui/employee-part-a-ui.js`
- `src/main-mbo-app.js`
- `tests/timeline-truthfulness-and-attachment.test.js`
- generated `dist/mbo-employee-app.js`
- existing corrective evidence doc.

No deploy or Live Kintone write was authorized or reported.

### 3.1 Post-save failure visibility — SOURCE PASS

Independent source inspection confirms the real create/edit `submit.success` handler now:
- catches post-save attachment REST failure;
- states truthfully that the record saved but attachment binding failed;
- invokes a visible browser alert (with Kintone notification fallback);
- sets a failure-path `event.url` outcome to avoid a silent normal redirect;
- leaves success-path redirect behavior unmodified.

Focused handler tests exercise both failure visibility and success-path redirect behavior.

Therefore:

```text
D1_POST_SAVE_BIND_FAILURE_VISIBLE_SOURCE = PASS
```

Live UAT is still required after a future authorized deployment.

### 3.2 Saved-file removal desired state — FAIL / MUST FIX

Current correction tracks only a dirty field name:
`dirtyAttachmentFields`.

But `preparePendingAttachments({ record: event.record })` still passes the Kintone submit-event record to `prepareAttachmentPlan()`, and the service still derives retained saved files from:
`record[targetCode].value`.

The UI remove action changes `this.record[targetCode].value` and records only the dirty field code. It does **not** preserve an explicit desired retained-file snapshot/fileKey set independent of the submit event object.

This is not sufficient because the show-time UI record and the later Kintone submit event record must not be assumed to be the same object/state carrier.

The new `EXPLICIT_REMOVE_DESIRED_STATE` test calls `ui.preparePendingAttachments({})` directly, so it reuses `this.record` and does not prove the real registered `edit.submit` path with a separate submit-event record. Thus it can pass while the Live lifecycle still reintroduces a removed file.

Therefore:

```text
D1_ATTACHMENT_REMOVE_DESIRED_STATE = FAIL / MUST FIX
```

Required design: maintain an explicit desired saved-file state per dirty attachment field (canonical target field + retained fileKeys) and pass that state into the attachment service; for dirty fields the service must use the explicit desired state, not infer desired retention from the submit event record.

### 3.3 Regression coverage — FAIL / MUST RESTORE

Previous focused attachment/timeline suite: `19/19`.
Current focused suite: `11/11`.
Previous full suite evidence: `871/871`.
Current full suite evidence: `863/863`.

The net loss of 8 tests corresponds to replacing the previous focused suite with a smaller suite. Several durable Baseline regressions are no longer represented, including broader Timeline Live/Preview/authoritative-data coverage and attachment display/pending/upload/fallback coverage.

The Baseline requires these regressions before accepting a corrective implementation. Passing fewer tests after deleting coverage is not a valid closure condition.

Therefore:

```text
D1_TIMELINE_ATTACHMENT_REGRESSION_COVERAGE = FAIL / MUST RESTORE
```

GitHub has no CI statuses for the executor commit. Reported local test/build results are executor evidence only, not independently rerun by ChatGPT.

## 4. Exact Current Gate

```text
CURRENT_GATE       = D1 ATTACHMENT DESIRED-STATE SNAPSHOT + REGRESSION RESTORE CORRECTIVE
CURRENT_MODE       = SOURCE/TEST ONLY
NEXT_ACTION_OWNER  = ANTIGRAVITY / EXACT ACTIVE TASK ONLY
APP794 DEPLOY      = NO
LIVE WRITE         = NO
APP801 WRITE       = NO
APP795/796 WRITE   = NO
D2-D7 WRITE        = NO
```

## 5. Minimum remaining verification

Must prove with real handler-level tests where applicable:
1. UI removes a saved file from a show-time record; submit event is a separate record still containing the original files; `edit.submit` nevertheless prepares the exact desired retained set without the removed file.
2. remove + add same field => retained desired fileKeys + new uploaded fileKey only.
3. unrelated attachment fields untouched.
4. Self -> Final fallback remains correct.
5. realistic `type: 'FILE'` submit event remains unchanged.
6. previous durable Timeline + Attachment regression coverage is restored rather than deleted.
7. focused tests, full `npm test`, build, build-only PASS with no test-count reduction caused by deleting coverage.
8. Live write = 0; deploy = NO.

## 6. Development Governance

- Antigravity performs only execution requiring local/runtime access.
- ChatGPT owns diagnosis, planning, Git review, acceptance and Control Plane docs.
- Keep persistence behavior in attachment service/UI modules.
- `src/main-mbo-app.js` remains orchestration-only.
- No broad refactor; no unrelated source changes.

## 7. Handoff

```text
REVIEW_RESULT  = CORRECTIVE
CORE_ARCH       = PASS
POST_SAVE_VISIBILITY_SOURCE = PASS
BLOCKERS        = DESIRED SAVED-FILE SNAPSHOT + REGRESSION COVERAGE RESTORE
DEPLOY          = NOT AUTHORIZED
NEXT OWNER      = ANTIGRAVITY / EXACT ACTIVE TASK ONLY
```
