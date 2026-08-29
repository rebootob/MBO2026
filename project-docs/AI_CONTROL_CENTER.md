# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual execution is required
> Updated: 2026-08-29 — REV49 ATTACHMENT PERSISTENCE USER-REPORTED WORKING / LONG-FILENAME DELETE-CONTROL UI DEFECT

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|---|
| D1 | Login + Password Change + Employee-Self MBO Gate | 🟠 KINTONE-ONLY / App794 customization rev49 / form schema rev48 / Timeline truthfulness PASS / Objective FILE schema corrective PASS / attachment persistence corrective source+deploy PASS / **user reports attachment save/edit now works, but long filenames overflow the Attach File cell and can hide the delete control — narrow UI corrective open** / HR+admin reset UI open / remaining security UAT open |
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
APP794_LIVE_CUSTOMIZATION_REVISION = 49
APP794_LIVE_FORM_REVISION          = 48
OBJECTIVE_ATTACHMENT_FIELDS        = FILE 10/10 — PASS
MIDYEAR_ATTACHMENT_FIELDS          = FILE 10/10 — PASS
FINAL_ATTACHMENT_FIELDS            = FILE 10/10 — PASS
EDIT_ATTACHMENT_SOURCE_CORRECTIVE  = PASS
EDIT_ATTACHMENT_DEPLOYMENT         = PASS
EDIT_ATTACHMENT_DEPLOY_AUTH        = CONSUMED / CLOSED
SCHEMA_CORRECTIVE_AUTHORIZATION    = CONSUMED / CLOSED
SOURCE_MODULARITY_POLICY           = MANDATORY
```

Do not reopen the Objective FILE schema or attachment persistence architecture without new evidence.

## 3. User Live UAT Update

User reports on App794 rev49 that attachment handling is now working and provided a Live screenshot showing multiple saved attachments. This is positive functional evidence for the persistence corrective, but the full prior UAT matrix has not been item-by-item closed, so do not overstate complete attachment UAT closure.

New visible defect:

```text
LONG_FILENAME_CELL_OVERFLOW       = FAIL
DELETE_CONTROL_ALWAYS_VISIBLE     = FAIL
ATTACHMENT_PERSISTENCE            = USER-REPORTED WORKING ON REV49
```

Observed behavior: when an attachment filename is long, the attachment badge exceeds the narrow fixed-layout Attach File table cell and the trailing `✕` delete button can move outside the visible cell area.

## 4. Source Review — Root Cause

Current `src/ui/employee-part-a-ui.js` attachment renderer:
- renders saved/pending/error attachment badges as `inline-flex`;
- filename spans use a fixed `max-width` of roughly 120–140px with ellipsis;
- the delete button is the last flex child;
- the badge itself has no reliable `width/max-width: 100%` + `min-width: 0` cell-containment contract;
- the attachment container is flex/wrap.

Current `src/styles/mbo-employee.css` uses `table-layout: fixed` for the MBO grid and does not provide a sufficient attachment-badge overflow/delete-button flex contract.

Therefore the narrow cell can be smaller than the badge's intrinsic flex width. The filename/status area wins horizontal space and the delete control is pushed/clipped outside the visible column.

This is a presentation/layout defect only. There is no evidence that attachment persistence service logic must change.

## 5. Required UI Corrective

For saved, pending and error attachment rows:
1. each attachment item must remain inside the Attach File cell width;
2. multiple attachments should stack cleanly as separate rows/items;
3. filename area must be shrinkable (`min-width: 0`) and truncate with ellipsis;
4. full filename must remain available via `title` tooltip;
5. delete `✕` must be non-shrinking and always visible at the right edge when editable;
6. pending/error state text must not push the delete button outside the cell;
7. Add File/Add More control must remain usable;
8. same renderer behavior must cover Objective, Mid-Year and Final(Self);
9. attachment data/persistence/removal semantics must remain unchanged.

Preferred narrow implementation: renderer classes/structure plus `src/styles/mbo-employee.css`; do not change service/orchestration persistence logic.

## 6. Exact Current Gate

```text
CURRENT_GATE                  = D1 APP794 ATTACHMENT LONG-FILENAME DELETE-CONTROL UI CORRECTIVE
CURRENT_MODE                  = ANTIGRAVITY SOURCE/TEST ONLY
NEXT_ACTION_OWNER             = ANTIGRAVITY / EXACT ACTIVE TASK ONLY
SOURCE CHANGE                 = YES — NARROW UI/CSS/TEST ONLY
APP794 CUSTOMIZATION DEPLOY   = NO — NEW AUTHORIZATION REQUIRED LATER
APP794 FORM/SCHEMA/LAYOUT     = NO WRITE
APP794 RECORD WRITE           = NO LIVE WRITE
APP794 ACL/PROCESS            = NO
APP801                        = NO
APP795/796                    = NO
ROUTING/SCORING/AUTH/RESET    = NO
D2-D7 EXECUTION               = NO
EXTERNAL SERVICE/STORAGE      = NO
```

Prior deployment authorization `APP794-D1-EDIT-ATTACHMENT-DEPLOY-20260829-01` is consumed/closed and cannot authorize this UI corrective deployment.

## 7. Required Proof Before Deploy Can Be Considered

At minimum retain all current attachment/timeline regression coverage and add proof for:

```text
ATTACHMENT_LONG_SAVED_FILENAME_TRUNCATES_WITH_FULL_TITLE
ATTACHMENT_LONG_SAVED_FILENAME_DELETE_CONTROL_REMAINS_SEPARATE
ATTACHMENT_MULTIPLE_LONG_FILENAMES_RENDER_ALL_DELETE_CONTROLS
ATTACHMENT_PENDING_LONG_FILENAME_DELETE_CONTROL_REMAINS_SEPARATE
ATTACHMENT_ERROR_LONG_FILENAME_DELETE_CONTROL_REMAINS_SEPARATE
OBJECTIVE_MIDYEAR_FINAL_ATTACHMENT_RENDER_REGRESSION
ATTACHMENT_PERSISTENCE_REGRESSION_UNCHANGED
FULL_NPM_TEST_PASS
UI_BUILD_PASS
BUILD_ONLY_PASS
LIVE_KINTONE_WRITE = 0
LIVE_DEPLOY_OCCURRED = NO
```

Node tests cannot fully prove browser pixel layout; source/CSS contract must also be independently reviewed before any deployment. A new explicit one-shot App794 customization deployment authorization is required after source review PASS.
