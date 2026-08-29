# CONFIRMED BASELINE — D1 LIVE UI TRUTHFULNESS & ATTACHMENTS

> Status: **CONFIRMED / DURABLE UI-DATA TRUTH RULE**  
> Confirmed from user Live evidence + independent source inspection on 2026-08-29.  
> Scope: App794 Live custom UI timeline/comments and attachment presentation/lifecycle.

---

## 1. Live UI Must Never Fabricate Business History

App794 Live UI must show only authoritative business data.

Hard rules:
- Live mode MUST NOT fall back to hard-coded sample workflow events, people, timestamps, outcomes, returned/resubmitted states, or comment notices.
- Preview/Test mode may use deterministic synthetic fixtures only when clearly gated as Preview/Test.
- If Live has no authoritative workflow-action timeline data, render a truthful empty state such as `ยังไม่มีประวัติการดำเนินการ / No workflow history available` or omit the custom timeline.
- Current `Status`, record modified time, score presence, or other indirect clues are NOT sufficient to invent historical events/timestamps.
- A `View Comments` indicator may be shown only when supported by authoritative event/comment linkage; it must not imply that comments exist when they do not.

Native Kintone Comments remains the authoritative record-conversation channel for Return/Reject discussion. Custom UI must not hide, cover, replace, or fabricate that native channel.

User Live evidence on 2026-08-29 showed the native Kintone panel saying `No comments available` while the then-current custom timeline displayed hard-coded sample history. That behavior is classified as a correctness defect and must not return.

---

## 2. Workflow Timeline Persistence Boundary

The business requirement for a read-only `Workflow Action Timeline` remains valid, but production event persistence/source is not certified merely because a table exists in UI.

Until an authoritative audit source is implemented/reviewed:

```text
WORKFLOW_ACTION_TIMELINE_PERSISTENCE = PENDING_AUDIT_DESIGN_REVIEW
```

Rules:
- do not synthesize a production audit trail from current state;
- do not overwrite prior actions when genuine persistence is later implemented;
- Return -> correction -> resubmit -> approve must preserve all genuine events chronologically;
- Preview timeline fixtures are permitted only in explicit Preview/Test mode.

---

## 3. Attachment Business Requirement

Per-objective evidence remains optional in these stages:
- Objectives;
- Mid-Year;
- Self Evaluation.

No Save/Submit validation may fail solely because no attachment exists.

Existing compatible Kintone FILE fields remain the persistence boundary. Do not add external storage/service.

---

## 4. Truthful Attachment States

For every attachment control in Live UI, the user must be able to distinguish the true state.

### No file
Display:
`ไม่มีไฟล์แนบ / No attachment`

### Local file selected but not yet persisted
Immediately show every selected filename and a clear unsaved marker such as:
`รอบันทึก / Pending save`

The UI must not imply success before upload + record-field binding succeeds.

### Saved/bound file
Display ALL actual filenames present in the Kintone FILE field, not only the first file.

### Editable state
Remove/change must update the exact attachment field state truthfully. A remove action must not silently mutate unrelated objective/stage attachment fields.

### Read-only/detail state
Display all real filenames. Where safe and supported, an open/download action may be provided using the actual Kintone file reference.

### Live/Preview separation
Live must never display preview/sample fixture filenames. Preview may use clearly synthetic filenames only inside explicit Preview/Test mode.

---

## 5. Kintone-Only File Lifecycle

If the custom UI owns file selection/upload, use Kintone-native file handling only.

Canonical browser persistence flow confirmed after Live UAT defect correction:
1. user selects local file(s);
2. UI records local `PENDING` state and shows filename(s);
3. create/edit submit performs existing local validation first;
4. upload pending files through Kintone `POST /k/v1/file.json` and receive temporary upload `fileKey` values;
5. **DO NOT mutate Kintone FILE fields in `app.record.create.submit` / `app.record.edit.submit` event records**;
6. keep an in-memory prepared attachment plan;
7. for saved-file removal/change, keep an explicit desired retained-file snapshot per canonical attachment field, independent of the later submit `event.record` object;
8. allow the native Kintone record save to complete;
9. in `app.record.create.submit.success` / `app.record.edit.submit.success`, use `event.appId` + `event.recordId` and Kintone Update Record REST API (`PUT /k/v1/record.json`) to bind the exact target FILE field(s);
10. after persistence/read-back, render actual saved filenames from Kintone.

Confirmed source/test invariants:
- pre-save upload failure may cancel submit fail-closed;
- post-save binding failure must truthfully state that the record already saved but attachment binding failed, and must not disappear silently during normal redirect;
- zero pending/dirty attachment state causes no attachment REST update;
- unrelated attachment fields must not be included in the REST update payload;
- retained saved fileKeys remain unless the user explicitly removes them;
- remove + add on the same field must produce the exact desired retained + new fileKey set;
- Self Evaluation uses the canonical `Final_Attachment_n` FILE fields in the current App794 schema; UI alias/fallback behavior must resolve to those canonical fields;
- use multipart `FormData`, same-origin Kintone context/request token as applicable;
- do not confuse upload-time fileKey with later record-read references;
- unit tests must not perform Live network writes.

External file hosting/storage is forbidden for D1.

---

## 6. Required Regression Coverage

Before accepting a corrective implementation, tests must cover at minimum:

### Timeline
- Live + no authoritative events => zero fixture names/actions/comment notices;
- Preview + no events => preview fixtures allowed;
- Live + authoritative supplied events => render only supplied events;
- Employee privacy filtering remains correct.

### Attachments
- read-only zero files;
- one real file;
- multiple real files;
- selected/pending file state;
- pending remove/change;
- real saved-file removal desired state through the registered submit handler using a separate submit-event record;
- remove + add exact desired state;
- upload error visibly remains not-saved;
- exact target-field binding;
- unrelated attachment fields unchanged;
- Objective/Mid-Year/Self(Final) attachment regression;
- create/edit zero-pending non-mutation;
- create/edit pending upload non-mutation;
- submit.success exact REST binding;
- post-save failure visible/no-silent-redirect behavior;
- Live never shows preview fixture filename.

Do not reduce regression coverage to make a corrective pass. Obsolete tests may only be replaced by equivalent-or-stronger coverage with an explicit evidence note.

---

## 7. Security / Authorization Boundary

- UI visibility is not authorization.
- Kintone App/Record/Process permissions remain the native security boundary.
- This baseline authorizes no Live write, schema change, record mutation, or deployment.
- Any App794 customization deployment still requires exact explicit deployment authorization.

---

## 8. Change Rule

Any future proposal to:
- replace native Kintone Comments;
- synthesize Live audit events without an authoritative source;
- store D1 attachments outside Kintone;
- hide filenames/state from users;
- change optional attachment semantics;
- return to direct FILE-field mutation inside create/edit submit event objects;

requires explicit user decision and Baseline update.