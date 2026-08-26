# Confirmed App794 UI / UX Baseline

Status: CONFIRMED / FROZEN FOR UI CLOSURE

User-confirmed on 2026-08-26. This file is the canonical UI/UX source of truth for App794 and the related HR phase-calendar presentation. It does not authorize any Kintone write or deploy.

## 1. UI Is the Current Critical Path

- App794 UI/UX V2 is the primary user-facing deliverable and must be visually approved before Dashboard/Hoshin continuation, Final UAT, or any App794 redeploy.
- Do not move forward merely because automated tests pass. User visual inspection of the local Preview Lab is a mandatory gate.
- Preview and candidate work remain LOCAL ONLY until a later explicit deployment authorization.

## 2. Five Business Stages

The top-level user journey is exactly five macro stages:

1. `เป้าหมาย / Objectives`
2. `ทบทวนกลางปี / Mid-Year`
3. `ประเมินตนเอง / Self Evaluation`
4. `การประเมินโดยผู้ประเมิน / Appraiser Evaluation`
5. `HR ตรวจสอบขั้นสุดท้าย / เสร็จสิ้น / HR Final / Completed`

These five stages are business UX stages and are not a one-to-one representation of the 16 technical Kintone Process statuses.

## 3. Bilingual Rule

- User-facing UI must be Thai + English because Thai and Japanese employees use the same system.
- Thai should appear first where practical, with English adjacent or directly below.
- Important navigation, field labels, phase states, route labels, action guidance, completion messages, validation guidance, buttons/help text, and result/status badges must be bilingual.
- Japanese translation is not required for V1.
- Technical identifiers such as `M1_G1` may remain English codes only when shown as secondary technical detail.

## 4. Lifecycle Appraiser Route

- The configured evaluator/appraiser sequence belongs to the MBO record for the whole annual lifecycle, not only the final-scoring screen.
- The same sequence remains visible/contextual through Objectives, Mid-Year, Self Evaluation, Appraiser Evaluation, and HR Final/Completed.
- User-facing labels are ordinal only:
  - `ผู้ประเมินลำดับที่ 1 / 1st Appraiser`
  - `ผู้ประเมินลำดับที่ 2 / 2nd Appraiser`
  - `ผู้ประเมินลำดับที่ 3 / 3rd Appraiser`
  - `ผู้ประเมินลำดับที่ 4 / 4th Appraiser`
- Do not use organizational titles such as Manager, GM, VP, or President as the route-slot heading.
- The actual person's position may be shown only as optional secondary metadata.
- The active number of appraisers is resolved from configuration/routing. Employees do not manually choose the appraiser count in production App794.

## 5. Route Presentation

Preferred heading:

`เส้นทางผู้ประเมินและอนุมัติ / Evaluation & Approval Route`

Example:

`พนักงาน / Employee -> ผู้ประเมินลำดับที่ 1 / 1st Appraiser -> ผู้ประเมินลำดับที่ 2 / 2nd Appraiser -> HR Final`

- The full route should remain visible across all five stages.
- Highlight the current actor/slot and show previous/next route members with truthful stage-specific states such as `รอดำเนินการ / Waiting`, `กำลังดำเนินการ / Current`, `ตรวจสอบแล้ว / Reviewed`, `ให้คะแนนแล้ว / Scored`, `เสร็จแล้ว / Completed`.
- Do not imply that Appraiser Evaluation is the only stage where appraisers matter. Appraisers review/approve Objectives and Mid-Year as applicable, remain route context during Self Evaluation, perform Part A/Part B scoring at Appraiser Evaluation, and remain read-only audit context at HR Final.

## 6. Friendly Route Scenario Names in Preview

The Preview Lab must not force business users to understand raw topology codes or a separate `Appraisers (1-4)` control with unclear meaning.

Replace confusing controls with a single bilingual route-scenario selector, for example:

- `เส้นทางมาตรฐานปัจจุบัน — ผู้ประเมิน 2 คน / Current Standard — 2 Appraisers` (`M1_G1` technical detail)
- `เส้นทางขยาย — ผู้ประเมิน 3 คน / Extended Route — 3 Appraisers` (`M1_M2_G1` technical detail)
- `เส้นทางผู้บริหารโดยตรง — ผู้ประเมิน 1 คน / Executive Direct — 1 Appraiser` (Preview Only / Routing Pending)
- `เส้นทางรองรับอนาคต — ผู้ประเมิน 4 คน / Future Capacity — 4 Appraisers` (Preview Only)

Raw `M1_G1`, `M1_M2_G1`, G2 and invalid topology values should move to an Advanced / Technical Details area in Preview, not be the dominant business-facing control.

Do not claim that a topology code belongs to a specific employee position unless a reviewed routing rule actually establishes that relationship. Current App795 routing is primarily section/team based, so labels such as `M1_G1 = Staff` are prohibited.

## 7. Evaluation Profile Is Separate From Route

- `70/30`, `60/40`, and `50/50` are Part A / Part B scoring profile ratios. They are not routing topology names.
- The UI should use a clear bilingual label such as `โปรไฟล์การประเมิน / Evaluation Profile (Part A : Part B)`.
- Do not infer appraiser count or route solely from the ratio selector.
- Routing/profile runtime binding is a later persistence/runtime gate and must remain fail-closed when unresolved.

## 8. Desktop Data Entry Layout

Desktop layout must prioritize readable, high-volume text entry.

General rule:
- one Objective = one horizontal row/grid;
- long-text fields remain wide and multi-line (approximately 4–6 visible lines minimum where practical);
- compact numeric/rating fields may be narrow;
- 3–4 Appraiser matrices must remain contained inside the App794 content width; **the overall page/body must not horizontally overflow**;
- if additional horizontal width is unavoidable, scrolling must be confined to the matrix container only, with the first context column kept visible/sticky where practical;
- do not revert to vertically stacked Objective/Action Plan/Comment fields on desktop by default.

Objectives row:
`# | Objective / Target | Action Plan | Additional Agreement | Weight | Difficulty | Attachment`

Mid-Year row:
`Objective (read-only) | Progress % | Periodical Review | Mid-Year Result | Issue/Risk | Next Action | Attachment`

Self Evaluation row:
`Objective (read-only) | Actual Result | Self Achievement | Self Comment | Attachment`

Appraiser Part A matrix:
`Objective | Weight | Difficulty | Self | Appraiser 1..N | Result Context`

Part B matrix:
`Competency | Appraiser 1..N | Result Context`

HR Final:
read-only horizontal summary/matrix, not a long duplicate edit form.

### Multi-Appraiser responsive behavior

For 3–4 Appraisers:
- active Appraiser column may be wider because it contains editable rating/comment controls;
- inactive Appraiser columns remain visible but may use a more compact read-only presentation;
- previous Appraiser feedback must remain readable, with expand-on-demand/tooltip/popover or wrapped compact text acceptable;
- do not shrink textareas/selects to unusable widths merely to force every column into one viewport;
- use a contained matrix wrapper (`max-width:100%`, `overflow-x:auto`) rather than allowing the whole Kintone page to overflow;
- keep Objective/Competency identity visible while scrolling (sticky first column preferred);
- Result Context may be compact/sticky-right where practical;
- when the current Appraiser changes, the active column should be brought into view automatically or visually emphasized so the user does not need to search for it.

## 9. Attachment Requirement — Optional Evidence

User-confirmed on 2026-08-26:

- **Objectives must provide an attachment/evidence area per Objective.**
- **Mid-Year must provide an attachment/evidence area per Objective.**
- **Self Evaluation must provide an attachment/evidence area per Objective.**
- Attachments in all three stages are **OPTIONAL**. Save/Submit validation must never fail solely because no file is attached.
- Appraiser Evaluation and HR Final must carry Objective, Mid-Year, and Self Evaluation evidence forward as read-only context where applicable.
- Production UI must never invent/fallback fake file names when no attachment exists.
- Existing legacy physical names may remain for compatibility (for example Self Evaluation evidence may still physically use a legacy `Final_Attachment_*` code); user-facing label must describe the business stage, not the legacy field name.
- If App794 currently has no physical Objective attachment field, local Preview must still show the intended optional Objective attachment UX, but must label physical persistence as `PENDING_SCHEMA_REVIEW`. Do not invent a production field silently and do not mutate schema during the local UI closure sprint.

## 10. Difficulty Empty-State Rule

- Blank Difficulty must stay blank in record data and must not visually default to Level 3.
- Empty editable field shows `-- กรุณาเลือกระดับความยาก / Please select --` and Required styling.
- Only after a real value 1–4 is selected may the field show green/editable completed state.
- Read-only blank displays `ยังไม่ได้ระบุ / Not selected`.

## 11. Five-Phase HR Calendar Ownership

- HR owns the Start Date and End Date for each of the five macro stages.
- HR must configure the schedule from the existing App800 HR Control Center / Dashboard; App794 employees do not edit phase dates.
- App794 reads the effective Fiscal Year schedule and displays it read-only.
- Do not hardcode production dates in App794. Preview may use deterministic fixtures only.
- Do not create a new calendar app unless a later review proves App800 cannot safely host the requirement.

The five schedules are:
- Objectives: start/end
- Mid-Year: start/end
- Self Evaluation: start/end
- Appraiser Evaluation: start/end
- HR Final: start/end

## 12. Deadline / Days Remaining UX — Strong Visual Urgency

For every phase, App794 should show the date range and a simple bilingual time-to-deadline indicator that is easy for employees to understand.

Required states:
- Before start: `เริ่มใน X วัน / Opens in X days`
- Open with time remaining: `เหลือ X วัน / X days remaining`
- Due today: `ครบกำหนดวันนี้ / Due today`
- Past due and not complete: `เกินกำหนด X วัน / X days overdue`
- Completed: `เสร็จแล้ว / Completed` (do not show an alarming overdue message after completion)

Visual emphasis confirmed by user:
- **Within the active allowed period / on time = GREEN emphasis.**
- **Overdue = RED emphasis.**
- Due today may use strong amber/orange urgency.
- Upcoming may use neutral/gray/blue.
- Completed may use success/green.
- The numeric countdown/overdue value (for example `76 days overdue`) must be materially more prominent than ordinary helper text: larger/bolder badge or callout, easy to notice at a glance.

A deadline/progress bar may be used, but it must not confuse process completion percentage with performance score.

## 13. Boundary Actions Between Phases

Current frozen workflow design assigns `05 Objective Approved` and `10 Mid-Year Completed` to `Requester_User` and provides manual actions:
- `Start Mid-Year`: `05 Objective Approved -> 06 Employee Mid-Year`
- `Start Self Evaluation`: `10 Mid-Year Completed -> 11 Employee Self Evaluation`

Therefore for current V1 UX:
- HR controls when the next phase is allowed to open through the HR phase calendar.
- Requester/Employee is the current workflow actor who starts the phase using the native Kintone Process action when the window is open.
- Before the phase start date, UI shows a waiting/locked boundary with opening date/countdown.
- When the phase window is open, UI clearly tells the Requester what action is available and that the native Kintone Process button must be used.
- Do not auto-transition workflow based only on date in this UI closure sprint.
- Any future automatic transition requires a separate reviewed architecture/security change.

## 14. Actor-Aware Display

Requester-owned states:
- emphasize `พนักงาน / Requester` as current actor;
- editable fields only when the applicable phase window is open.

Appraiser-owned states:
- emphasize the ordinal Appraiser slot, not Manager/GM title;
- employee-entered data is read-only;
- show approve/return guidance separately from scoring where relevant.

Waiting boundary states 05/10:
- `ยังไม่ต้องดำเนินการ / No action required yet` before next window opens;
- once open, show `พร้อมเริ่มขั้นตอน / Ready to start` and Requester action guidance.

HR Final:
- emphasize `HR Final Check` as a distinct HR role, not an Appraiser slot.

Completed:
- fully read-only and no action required.

## 15. Progress Indicators — Keep Meanings Separate

App794 must distinguish these concepts:

1. `ความคืบหน้ากระบวนการ / Process Progress`
   - route-aware Workflow progress;
   - derived from current applicable Process status/path;
   - not employee-entered performance progress.

2. `ความคืบหน้าของเป้าหมายกลางปี / Mid-Year Objective Progress (%)`
   - stored per Objective in `Progress_Percent_1..10` (or current compatible field codes);
   - **employee-entered value from 0–100** during the Mid-Year requester stage;
   - the visual bar width directly follows the entered numeric percentage;
   - it is NOT calculated from dates, Workflow status, rating, or final score;
   - Appraiser review states see it read-only.

3. `ความครบถ้วนของข้อมูล / Data Completion`

4. `ความครบถ้วนของผู้ประเมิน / Appraiser Completion` when relevant

5. phase deadline/countdown

Do not use process-progress or objective-progress colors/percentages as if they were performance scores.

## 16. Preview Lab Is a Visual Approval Tool

Preview must allow inspection of:
- all five macro stages;
- all relevant physical statuses, while clearly identifying status/route mismatches;
- 1, 2, 3, and 4-appraiser route scenarios;
- 70/30, 60/40, 50/50 evaluation profiles independently from route scenario;
- complete/incomplete scoring states;
- active actor changes through Requester -> Appraiser(s) -> HR;
- deterministic preview date and HR phase calendar;
- deadline states: upcoming, remaining days, due today, overdue, completed;
- optional attachment areas at Objectives, Mid-Year, and Self Evaluation;
- Appraiser active-column behavior;
- 4-Appraiser responsive/contained matrix with no page/body overflow;
- a visual placeholder/reserved-space representation of the native Kintone comment panel if useful, without implementing fake persistence;
- Workflow Action Timeline fixtures including approve/return/resubmit/scoring timestamps, rendered as a structured desktop table.

Preview must make clear which scenarios are current-runtime supported versus Preview Only / Routing Pending.

## 17. Safety / Runtime Boundary

- UI hiding is not authorization.
- Native Kintone Process/permission controls remain the security boundary.
- Preview-only 3rd/4th Appraiser capacity does not certify physical persistence.
- Executive direct route preview does not certify App795/App794 runtime routing.
- No Kintone write/deploy is authorized by this baseline.

## 18. Native Kintone Comment Thread Must Remain Available

User-confirmed operational need on 2026-08-26:

- The native Kintone record comment thread is used when an Approver/Appraiser rejects/returns an MBO for correction.
- App794 custom UI must **not intentionally hide, cover, disable, or make the native Kintone comment panel impractical to use**.
- The user must still be able to read prior return/reject comments and add follow-up comments through the native Kintone comment capability according to Kintone permissions.
- Custom UI comments inside Part A/Part B are separate evaluation comments and do not replace the native record conversation thread.
- Local Preview must not create a fake persistent comment subsystem. It may show a clearly labeled non-persistent visual placeholder such as `ความคิดเห็นใน Kintone / Kintone Comments (Native Platform)` to validate layout/reserved space.
- A later deployed-browser verification must confirm the real Kintone comment panel remains accessible and is not overlapped by custom UI.

## 19. Appraiser Evaluation Active Column Follows Current Actor

User-confirmed on 2026-08-26:

At the Appraiser Evaluation stage, all configured Appraiser columns remain visible to the Appraisers, but only the current actor's own column is editable.

Required behavior:
- If `1st Appraiser` is the current action owner: Appraiser 1 column = ACTIVE/EDITABLE; Appraiser 2..N columns = VISIBLE + READ-ONLY.
- If `2nd Appraiser` is current: Appraiser 2 column = ACTIVE/EDITABLE; Appraiser 1 and Appraiser 3..N = VISIBLE + READ-ONLY.
- Apply the same rule to Appraiser 3 and Appraiser 4 where configured/simulated.
- Previous Appraiser scores/comments remain visible to later Appraisers.
- Appraisers can see one another's Appraiser columns, but cannot edit another Appraiser's column.
- HR Final sees all Appraiser columns read-only.
- This requirement confirms Appraiser-to-Appraiser visibility only; it does not independently expand Requester/employee visibility of confidential scoring data.

Current technical status-to-ordinal mapping for supported preview topologies:

### `M1_G1` (2 Appraisers)
- `13 Manager Final Evaluation` -> user-facing **1st Appraiser active**
- `14 GM Final Evaluation` -> user-facing **2nd Appraiser active**

### `M1_M2_G1` (3 Appraisers)
- `12 First Manager Final Evaluation` -> user-facing **1st Appraiser active**
- `13 Manager Final Evaluation` -> user-facing **2nd Appraiser active**
- `14 GM Final Evaluation` -> user-facing **3rd Appraiser active**

For the 4-Appraiser Preview-only scenario, the Preview Lab may simulate Appraiser 1..4 active slots for visual validation, but must clearly state that 4th-slot physical Workflow/persistence is not currently implemented.

Security note:
- Disabling non-current columns in client UI is UX, not an authorization boundary.
- Production enforcement must later be reconciled with native Kintone Process/field/permission controls before claiming secure per-Appraiser edit isolation.

## 20. Workflow Action Timeline / Audit Trail — Who Did What and When

User-confirmed on 2026-08-26:

App794 must provide a clear bilingual read-only frame showing **who performed each meaningful workflow/evaluation action, what action was performed, and the exact date/time**.

Preferred heading:
`ประวัติการดำเนินการ / Workflow Action Timeline`

### Desktop presentation — Table is mandatory

On desktop, the primary presentation must be a structured, compact table rather than one large card per event.

Recommended columns:

| # | ขั้นตอน / Stage | ผู้ดำเนินการ / Actor | ชื่อผู้ดำเนินการ / Person | การดำเนินการ / Action | วัน-เวลา / Date & Time | ผลลัพธ์ / Result | หมายเหตุ / Comments |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | Objectives | 1st Appraiser | Sompong (m01) | Approved | 14 Feb 2026 • 09:42 | Approved | — |
| 2 | Objectives | 2nd Appraiser | Vichai (g01) | Returned | 15 Feb 2026 • 10:18 | Returned | 💬 View Comments |
| 3 | Objectives | Employee | Employee 0118 | Resubmitted | 16 Feb 2026 • 08:30 | Submitted | — |
| 4 | Objectives | 2nd Appraiser | Vichai (g01) | Approved | 16 Feb 2026 • 13:05 | Approved | — |
| 5 | Appraiser Evaluation | 1st Appraiser | Sompong (m01) | Scoring Completed | 20 Nov 2026 • 14:22 | Completed | — |

Table UX rules:
- chronological order is easy to scan;
- zebra rows / row separators are encouraged;
- Action and Result should use compact bilingual badges where useful;
- Return/Reject rows should be visually distinguishable and may expose `💬 ดูความคิดเห็น / View Comments`;
- latest/current relevant row may be highlighted subtly;
- table may be collapsible as one whole section to save vertical space;
- do not create one large card per event on desktop;
- mobile/narrow screens may switch the same data into stacked cards if a table becomes unreadable;
- event count such as `5 Events Recorded` may remain as a small summary badge next to the heading, not as the main content.

Each event must still include, where known:
- Macro stage: Objectives / Mid-Year / Self Evaluation / Appraiser Evaluation / HR Final.
- Business actor slot: Employee/Requester, 1st Appraiser, 2nd Appraiser, 3rd Appraiser, 4th Appraiser, or HR Final.
- Actual person display name/account.
- Business action, for example `Submitted`, `Approved`, `Returned`, `Resubmitted`, `Started Mid-Year`, `Started Self Evaluation`, `Scoring Completed`, `HR Final Completed`.
- Date and time with a consistent company-local presentation, e.g. `14 Feb 2026 • 09:42`.
- Outcome/state such as Approved / Returned / Completed.
- A non-authoritative comment indicator when a Return/Reject is associated with discussion, e.g. `💬 ดูความคิดเห็น / View Comments`; actual comment content remains in native Kintone Comments.

Audit/history rules:
- **Do not overwrite earlier actions.** Return -> correction -> resubmit -> approve must preserve all events in chronological order.
- Timeline is read-only for normal users; it is an audit/presentation feature, not an editable log.
- The same timeline should remain available across the five macro stages so users can understand how the record arrived at its current state.
- Do not fabricate timestamps from record `Updated_datetime` or current status. A record-level modified time is not proof of which workflow actor performed which action.
- Do not infer an action timestamp solely from a score field becoming nonblank unless the persistence contract explicitly records that event.
- Local Preview must use clearly synthetic deterministic timeline fixtures only.

Production persistence/source boundary:
- Dedicated per-action timestamp/audit persistence has **not yet been certified** by the current UI-only review.
- Before runtime implementation, perform a read-only inventory of available Kintone Process/history/revision capabilities and current App794 fields, then choose a durable audit strategy that preserves every event and actor.
- If dedicated storage is required, schema/audit implementation is a separate reviewed change with fresh authorization; do not create fields silently in the UI sprint.
- Until that gate is closed, canonical classification is `WORKFLOW_ACTION_TIMELINE_PERSISTENCE = PENDING_AUDIT_DESIGN_REVIEW`.
- Native Kintone Comments and Workflow Action Timeline are complementary: Comments explain why; Timeline records who/action/when.

## 21. Deadline Urgency Interaction — Make Near-Due / Overdue Impossible To Miss

User-confirmed on 2026-08-26 after visual Preview inspection:

- The small date/countdown text inside the five stage tiles is not sufficient by itself for near-due or overdue work.
- The current active phase must have a **separate prominent urgency callout** near the top of the App794 content, in addition to the compact stage tile.
- Recommended urgency tiers for V1 Preview/UI:
  - more than 7 days remaining: GREEN / on-time normal emphasis;
  - 1–7 days remaining: AMBER/ORANGE / due-soon strong emphasis;
  - due today: strong ORANGE/RED urgency;
  - overdue: RED critical emphasis;
  - completed: GREEN success, no overdue alarm.
- The most important number must be the visual focus, e.g. `เหลือ 3 วัน / 3 DAYS REMAINING` or `เกินกำหนด 76 วัน / 76 DAYS OVERDUE`, with larger font/weight than phase name/helper text.
- Include the exact due date immediately below or beside the large number, e.g. `ครบกำหนด 31 Mar 2026 / Due 31 Mar 2026`.
- For **due-soon (1–7 days), due-today, or overdue**, show a dismissible bilingual popup/toast/banner when the record page/Preview is opened. It may reappear on a later page load/session while the condition remains true; do not create an endless modal loop.
- Do **not** use continuously blinking text. If motion is used, prefer a subtle pulse on border/icon/background for urgent states only, and respect reduced-motion/accessibility preferences where possible.
- Overdue callout should remain visibly red after dismissing the popup; dismissing the popup must not hide the underlying deadline status.
- Future production notification outside the page (email/Kintone notification/etc.) is a separate notification design/persistence gate and is not authorized by this UI-only requirement.
- Preview must demonstrate at least: >7 days green, 7 days amber, 1 day amber/orange, due today, overdue red + popup/toast, and completed green.

## 22. Visual Hierarchy — Keep Secondary Information Compact And Clear

User-confirmed on 2026-08-26 after R6-R3 visual inspection:

- Main MBO work content is the visual priority. Deadline/status aids, native-comment context, and Workflow Action Timeline are **secondary information** and must not dominate the page.
- Do not stack multiple large panels that repeat the same state. In particular, avoid showing a large urgency toast, a second large persistent urgency banner, and a separate large status/actor card with substantially duplicated information at the same time.
- The persistent current-phase deadline/status presentation should be one compact bilingual status strip/callout. It may use a colored left border/background accent plus a clear status badge and the day count, but should not become a large hero panel.
- Due-soon/due-today/overdue may still use one transient dismissible toast/popup, but the persistent strip underneath must remain compact and should not duplicate a paragraph of the same message.
- The day count remains noticeable, but typography should be balanced with the form: approximately 16–18px for the main deadline number on desktop is preferred over oversized display text; helper/due-date text should be around 11–12px where practical.
- Avoid excessive emoji/icon repetition. One meaningful icon per status area is enough.
- Actor/action guidance should be visually merged with or placed adjacent to the compact status strip when practical instead of creating another large competing panel.
- Color communicates status, not importance of content: red/orange/green accents should be restrained and readable, with sufficient contrast but without filling large page areas unnecessarily.

### Workflow Action Timeline dense-grid rule

- Timeline remains a table on desktop, but it is not primary content.
- The table must have **clearly visible horizontal and vertical grid lines**. Use explicit borders (`1px solid #475569` / `#64748b` or `#334155`) on `table`, `th`, and `td`, including the outer table border, so rows and columns are immediately and sharply distinguishable.
- Header/body typography should be compact, approximately 11–12px on desktop; do not use large text for audit rows.
- Cell padding should be compact (roughly 5–7px where practical) and row height should remain dense enough to scan many events quickly.
- Header background may be light gray/blue, but keep it restrained. Result/Return badges should be small and not increase row height materially.
- Thai + English labels remain, but compact two-line headers or concise paired labels are preferred over long oversized headings.
- `Events Recorded` remains a small secondary badge.
- Return/Reject rows may use a light red tint, but the grid lines must remain distinctly visible.
- The Timeline section should remain collapsible so users can focus on the MBO form when history is not needed.

### Overdue Emphasis & Compact Status Strip rule (R6-R5)

- User-confirmed on 2026-08-26 after R6-R4 visual review:
- The overdue status/deadline state must be **visually prominent and immediately noticeable** without resorting to a giant hero panel or page clutter.
- The primary key text `เกินกำหนด 76 วัน / 76 DAYS OVERDUE` (or current day count) must be the visual focus of the compact strip, rendered with a prominent red badge/pill (`.mbo-urgency-badge-pill`) or bold contrast highlight.
- Exact due date (e.g. `📅 ครบกำหนด 31 Jul 2026`) must be secondary text placed below or beside the main countdown.
- Keep the presentation as **ONE compact persistent status strip** (12-14px vertical padding, clean horizontal layout), avoiding redundant text, duplicate cards, or page clutter around the phase block.

## 23. User-Approved Preview -> App794 100% Parity Closure Plan

User-confirmed on 2026-08-26:

- After the local Preview UI is visually approved, **do not deploy by chasing one field/screen defect at a time**.
- The next mandatory gate is a single `PREVIEW_TO_APP794_PARITY_CLOSURE` work package whose target is **100% parity with the user-approved Preview for the approved V1 scope** before deployment.
- Preview and production App794 must use the same underlying UI components/source wherever possible. Preview-only wrappers/fixtures may differ, but business rendering logic must not fork into a second implementation.
- Before any write/deploy, produce one complete parity manifest covering at least:
  1. every five-stage UI section and physical Process status mapping;
  2. every Objective/Mid-Year/Self/Appraiser/HR field code and adapter;
  3. required/optional validation and Difficulty semantics;
  4. Part A/Part B profiles, weights, competency sets, result calculations and completeness;
  5. Appraiser 1..N route slots, actor/editability rules and native authorization boundary;
  6. App795 routing dependencies, including executive-direct/3rd/4th Appraiser gaps if approved for live use;
  7. App796 profile/appraiser-count dependencies;
  8. Objective/Mid-Year/Self attachments and any schema gaps;
  9. App800 five-phase calendar source and deadline/countdown behavior;
  10. native Kintone Comments coexistence;
  11. Workflow Action Timeline data source/persistence and full-history behavior;
  12. bilingual labels, responsive layout, 4-Appraiser matrix behavior and no page overflow;
  13. security/permission boundaries and fail-closed states.
- Every Preview feature must be classified in the manifest as `BOUND`, `ADAPTER_REQUIRED`, `SCHEMA_REQUIRED`, `ROUTING_REQUIRED`, `APP796_REQUIRED`, `APP800_REQUIRED`, `AUDIT_SOURCE_REQUIRED`, or `NOT_IN_APPROVED_LIVE_SCOPE`. No silent gaps are allowed.
- Any schema/routing/profile/calendar/audit changes required for 100% approved parity must be bundled into the same reviewed parity plan rather than discovered after deploy. They still require the appropriate fresh explicit Kintone authorization before execution.
- Build and review one integrated App794 candidate after the manifest is closed; do not repeatedly patch live App794 to make it resemble Preview.
- Before deployment require source/dist parity, field/schema read-back plan, route/profile parity, no fake fixture data, backup/rollback plan, candidate hashes, focused parity tests, and browser smoke plan.
- Deployment remains a separate explicit authorization gate. User visual approval of Preview is not authorization to write Kintone.
- `100% parity` means the approved live scope behaves and appears like the approved Preview. A capability still explicitly classified Preview Only is not falsely claimed live; if the user approves it for live use, its required schema/routing/profile work becomes part of the parity closure package before deployment.