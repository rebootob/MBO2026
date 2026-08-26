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
- horizontal scrolling is acceptable for very wide 3–4 appraiser matrices;
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
- a visual placeholder/reserved-space representation of the native Kintone comment panel if useful, without implementing fake persistence.

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
