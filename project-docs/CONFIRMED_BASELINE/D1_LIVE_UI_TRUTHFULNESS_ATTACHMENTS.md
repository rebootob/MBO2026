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

Canonical browser flow:
1. user selects local file(s);
2. UI records local `PENDING` state and shows filename(s);
3. upload through Kintone file upload API using browser-safe Kintone request context;
4. receive upload `fileKey`;
5. bind returned `fileKey` to the exact target Kintone FILE field through the existing create/edit record lifecycle;
6. after persistence/read-back, render saved filenames from the actual FILE field.

Implementation notes:
- use multipart `POST /k/v1/file.json` / `FormData` in the supported Kintone browser pattern;
- use Kintone request token / same-origin request requirements as applicable;
- do not confuse upload-time `fileKey` with a later file key/reference returned by record-read APIs;
- fail visibly on upload/binding failure;
- unit tests must not perform Live network writes;
- if immediate upload creates unsafe orphan-file behavior, an explicit pending-file model with submit-boundary upload/binding is preferred.

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
- upload error visibly remains not-saved;
- exact target-field binding;
- unrelated attachment fields unchanged;
- Objective/Mid-Year/Self attachment regression;
- Live never shows preview fixture filename.

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

requires explicit user decision and Baseline update.